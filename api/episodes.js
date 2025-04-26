import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const rssUrl = 'https://anchor.fm/s/f64108b0/podcast/rss';
  try {
    const response = await fetch(rssUrl);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
    const xml = await response.text();
    const dom = new JSDOM(xml, { contentType: 'text/xml' });
    const items = Array.from(dom.window.document.querySelectorAll('item'));
    const episodes = items.map(item => ({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      description: item.querySelector('description')?.textContent || ''
    }));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ episodes });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching or parsing RSS feed' });
  }
} 