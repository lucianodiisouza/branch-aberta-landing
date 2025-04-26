document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hide');
        }, 400);
    });

    // Card scroll animation
    const animatedCards = [
        ...document.querySelectorAll('.episode-card'),
        ...document.querySelectorAll('.platform-card')
    ];
    animatedCards.forEach(card => card.classList.add('animated-card'));
    function animateOnScroll() {
        animatedCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                card.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    // Typing effect
    function typeText(element, text, speed = 30) {
        element.textContent = '';
        let i = 0;
        function type() {
            if (i <= text.length) {
                element.textContent = text.slice(0, i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    function showTypingForCurrentLang() {
        const typingText = document.getElementById('typing-text');
        const pt = typingText.querySelector('.lang-pt');
        const en = typingText.querySelector('.lang-en');
        if (pt.style.display !== 'none') {
            typeText(pt, 'Seu podcast sobre tecnologia e desenvolvimento');
            en.textContent = 'Your podcast about technology and development';
        } else {
            typeText(en, 'Your podcast about technology and development');
            pt.textContent = 'Seu podcast sobre tecnologia e desenvolvimento';
        }
    }
    showTypingForCurrentLang();

    // Language switch
    const langSwitch = document.getElementById('lang-switch');
    langSwitch.addEventListener('change', () => {
        const isEnglish = langSwitch.checked;
        document.querySelectorAll('.lang-pt').forEach(el => {
            el.style.display = isEnglish ? 'none' : '';
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = isEnglish ? '' : 'none';
        });
        showTypingForCurrentLang();
    });

    // Platform card click alert
    const platformCards = document.querySelectorAll('.platform-card');
    platformCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!card.getAttribute('href')) {
                e.preventDefault();
                alert('Link da plataforma ainda não configurado');
            }
        });
    });

    // Fetch and display podcast episodes from RSS feed
    const episodesContainer = document.getElementById('episodes-container');
    if (episodesContainer) {
        fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://anchor.fm/s/f64108b0/podcast/rss'))
            .then(res => res.json())
            .then(data => {
                const parser = new window.DOMParser();
                const xml = parser.parseFromString(data.contents, 'text/xml');
                const items = Array.from(xml.querySelectorAll('item'));
                episodesContainer.innerHTML = '';
                items.forEach(item => {
                    const title = item.querySelector('title')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const pubDate = item.querySelector('pubDate')?.textContent || '';
                    const date = pubDate ? new Date(pubDate).toLocaleDateString('pt-BR') : '';
                    const description = item.querySelector('description')?.textContent || '';
                    const html = `
                        <div class="episode-item">
                            <div class="episode-title">${title}</div>
                            <div class="episode-date">${date}</div>
                            <a class="episode-link" href="${link}" target="_blank">Ouvir episódio</a>
                        </div>
                    `;
                    episodesContainer.insertAdjacentHTML('beforeend', html);
                });
            })
            .catch(() => {
                episodesContainer.innerHTML = '<div style="color:var(--accent-color);">Não foi possível carregar os episódios.</div>';
            });
    }
}); 