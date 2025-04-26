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

    // Fetch and display podcast episodes from serverless API
    const episodesContainer = document.getElementById('episodes-container');
    if (episodesContainer) {
        fetch('/api/episodes')
            .then(res => res.json())
            .then(data => {
                if (!data.episodes) throw new Error();
                episodesContainer.innerHTML = '';
                data.episodes.forEach(ep => {
                    const date = ep.pubDate ? new Date(ep.pubDate).toLocaleDateString('pt-BR') : '';
                    const html = `
                        <div class="episode-item">
                            <div class="episode-title">${ep.title}</div>
                            <div class="episode-date">${date}</div>
                            <a class="episode-link" href="${ep.link}" target="_blank">Ouvir episódio</a>
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