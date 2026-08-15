document.addEventListener('DOMContentLoaded', () => {

    // 1. Preloader
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 1200);

    // 2. Tab Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const projectsSection = document.getElementById('projects-section');
    const blogSection = document.getElementById('blog-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const tab = button.getAttribute('data-tab');
            if (tab === 'projects') {
                projectsSection.classList.add('active');
                blogSection.classList.remove('active');
            } else {
                blogSection.classList.add('active');
                projectsSection.classList.remove('active');
            }
        });
    });

    // 3. Efektli Kart Oluşturucu
    function createDevCard(item) {
        const card = document.createElement('div');
        card.className = 'dev-card';
        
        const tagsHTML = item.tags 
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join('') 
            : '';

        card.innerHTML = `
            <div>
                <div class="card-header-meta">
                    <strong>${item.type || 'Article.md'}</strong> // ${item.date}
                </div>
                <h3 class="card-main-title">${item.title}</h3>
            </div>
            
            <div>
                <div class="card-tags">
                    ${tagsHTML}
                </div>
                <div class="card-author-info">
                    ${item.avatar ? `<img src="${item.avatar}" alt="${item.author}" class="card-avatar">` : ''}
                    <span class="card-author-name">${item.author}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(item));
        return card;
    }

    // 4. JSON Yükleme
    fetch('data/projects.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('projects-container');
            data.forEach(project => container.appendChild(createDevCard(project)));
        })
        .catch(err => console.error('Projects verisi yüklenemedi:', err));

    fetch('data/posts.json')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('blog-container');
            data.forEach(post => container.appendChild(createDevCard(post)));
        })
        .catch(err => console.error('Posts verisi yüklenemedi:', err));

    // 5. Modal İşlemleri
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    function openModal(item) {
        const tagsHTML = item.tags 
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join(' ') 
            : '';

        modalContent.innerHTML = `
            <div class="card-header-meta" style="margin-bottom: 10px;">
                <strong>${item.type || 'Article.md'}</strong> // ${item.date}
            </div>
            <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #ffffff;">${item.title}</h2>
            <div style="margin-bottom: 16px;">${tagsHTML}</div>
            <div style="line-height: 1.6; color: var(--text-primary); font-size: 15px;">
                ${item.details || item.summary}
            </div>
        `;
        modalBackdrop.style.display = 'flex';
    }

    modalClose.addEventListener('click', () => modalBackdrop.style.display = 'none');
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) modalBackdrop.style.display = 'none';
    });
});