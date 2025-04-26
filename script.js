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
        updateEpisodesLang(isEnglish ? 'en' : 'pt');
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

    // Fetch and display podcast episodes from serverless API
    const episodesContainer = document.getElementById('episodes-container');
    function extractSpotifyId(guid, enclosureUrl) {
        // Try to extract from guid (Spotify format: https://open.spotify.com/episode/{id})
        if (guid && guid.includes('open.spotify.com/episode/')) {
            const match = guid.match(/episode\/([a-zA-Z0-9]+)/);
            if (match) return match[1];
        }
        // Try to extract from enclosureUrl (sometimes contains the id)
        if (enclosureUrl && enclosureUrl.includes('anchor.fm/s/')) {
            const match = enclosureUrl.match(/\/([a-zA-Z0-9]{22,})\./); // 22+ char Spotify IDs
            if (match) return match[1];
        }
        return null;
    }
    function renderEpisodes(episodes, lang) {
        episodesContainer.innerHTML = '';
        episodes.forEach((ep, idx) => {
            const date = ep.pubDate ? new Date(ep.pubDate).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-BR') : '';
            const desc = ep.description ? ep.description.replace(/<[^>]+>/g, '') : '';
            const epNumLabel = lang === 'en' ? 'Episode' : 'Episódio';
            const dateLabel = lang === 'en' ? 'Published on' : 'Publicado em';
            const listenLabel = lang === 'en' ? 'Listen episode' : 'Ouvir episódio';
            const spotifyId = extractSpotifyId(ep.guid, ep.enclosureUrl);
            const playerHtml = spotifyId
                ? `<div style="margin:0.7em 0 0.2em 0;"><iframe style="border-radius:12px" src="https://open.spotify.com/embed/episode/${spotifyId}" width="100%" height="80" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>`
                : '';
            const fallbackBtn = !spotifyId
                ? `<a class="episode-listen-btn" href="${ep.link}" target="_blank" rel="noopener">
                    <i class="fas fa-play"></i>
                    ${listenLabel}
                    <i class="fas fa-external-link-alt" style="font-size:0.9em;"></i>
                 </a>`
                : '';
            const descId = `desc-${idx}`;
            const html = `
                <div class="episode-item">
                    <div class="episode-icon"><i class="fas fa-podcast"></i></div>
                    <div class="episode-content">
                        <div class="episode-info">
                            <span class="episode-num">${epNumLabel} #${episodes.length - idx}</span>
                            <span class="episode-date"><i class="far fa-calendar-alt"></i> ${dateLabel}: ${date}</span>
                        </div>
                        <div class="episode-title">${ep.title}</div>
                        <div class="episode-desc desc-collapsed" id="${descId}">${desc}</div>
                        <button class="show-more-btn" data-target="${descId}">${lang === 'en' ? 'Show more' : 'Mostrar mais'}</button>
                        ${playerHtml}
                        ${fallbackBtn}
                    </div>
                </div>
            `;
            episodesContainer.insertAdjacentHTML('beforeend', html);
        });
        // Add show more/less event listeners
        episodesContainer.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const desc = document.getElementById(this.dataset.target);
                const expanded = desc.classList.toggle('desc-expanded');
                desc.classList.toggle('desc-collapsed', !expanded);
                this.textContent = expanded ? (lang === 'en' ? 'Show less' : 'Mostrar menos') : (lang === 'en' ? 'Show more' : 'Mostrar mais');
            });
        });
    }

    let loadedEpisodes = null;
    let loadedError = false;

    if (episodesContainer) {
        fetch('/api/episodes')
            .then(res => res.json())
            .then(data => {
                if (!data.episodes) throw new Error();
                loadedEpisodes = data.episodes;
                loadedError = false;
                const lang = document.documentElement.lang === 'en' || document.querySelector('.lang-en')?.style.display !== 'none' ? 'en' : 'pt';
                renderEpisodes(loadedEpisodes, lang);
            })
            .catch(() => {
                loadedError = true;
                renderEpisodes([], document.documentElement.lang === 'en' ? 'en' : 'pt');
                episodesContainer.innerHTML = `<div style="color:var(--accent-color);">${document.documentElement.lang === 'en' ? 'Could not load episodes.' : 'Não foi possível carregar os episódios.'}</div>`;
            });
    }

    function updateEpisodesLang(lang) {
        if (loadedEpisodes && episodesContainer) {
            renderEpisodes(loadedEpisodes, lang);
        } else if (loadedError && episodesContainer) {
            episodesContainer.innerHTML = `<div style="color:var(--accent-color);">${lang === 'en' ? 'Could not load episodes.' : 'Não foi possível carregar os episódios.'}</div>`;
        }
    }
}); 