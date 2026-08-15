document.addEventListener('DOMContentLoaded', () => {

    let loadedAboutText = 'Electrical & Electronics Engineer specializing in embedded systems.';

    // 1. Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 1000);
    }

    // 2. Tab Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const projectsSection = document.getElementById('projects-section');
    const blogSection = document.getElementById('blog-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const tab = button.getAttribute('data-tab');
            if (projectsSection && blogSection) {
                if (tab === 'projects') {
                    projectsSection.classList.add('active');
                    blogSection.classList.remove('active');
                } else {
                    blogSection.classList.add('active');
                    projectsSection.classList.remove('active');
                }
            }
        });
    });

    // 3. Efektli Kart Oluşturucu
    function createDevCard(item) {
        const card = document.createElement('div');
        card.className = 'dev-card';
        
        const tagsHTML = (item.tags && Array.isArray(item.tags))
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join('') 
            : '';

        card.innerHTML = `
            <div>
                <div class="card-header-meta">
                    <strong>${item.type || 'Article.md'}</strong> // ${item.date || ''}
                </div>
                <h3 class="card-main-title">${item.title || 'Untitled'}</h3>
            </div>
            
            <div>
                <div class="card-tags">
                    ${tagsHTML}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(item));
        return card;
    }

    // 4. JSON Verilerini Yükleme
    async function loadJsonData(jsonPath, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP Hatası! Durum: ${response.status}`);

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted); font-family:var(--font-mono);">// Veri bulunamadı.</p>';
                return;
            }

            container.innerHTML = '';
            data.forEach(item => container.appendChild(createDevCard(item)));

        } catch (error) {
            console.error(`[Data Error] ${jsonPath} yüklenemedi:`, error);
            container.innerHTML = `<p style="color:#e06c75; font-family:var(--font-mono); font-size:13px; padding:20px;">// Yükleme Hatası: ${error.message}</p>`;
        }
    }

    // 5. Hakkında Yazısını Çekme ve Hero Alanına Yazma
    async function loadAboutText() {
        const aboutContainer = document.getElementById('about-text');

        try {
            const response = await fetch('./data/about.txt');
            if (!response.ok) throw new Error(`HTTP Hatası! Durum: ${response.status}`);

            loadedAboutText = await response.text();
            if (aboutContainer) {
                aboutContainer.textContent = loadedAboutText;
            }
        } catch (error) {
            console.error('[About Error] about.txt yüklenemedi:', error);
            if (aboutContainer) {
                aboutContainer.textContent = loadedAboutText;
            }
        }
    }

    // Verileri Çağır
    loadAboutText();
    loadJsonData('./data/projects.json', 'projects-container');
    loadJsonData('./data/posts.json', 'blog-container');

    // 6. Modal İşlemleri
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    function openModal(item) {
        if (!modalBackdrop || !modalContent) return;

        const tagsHTML = (item.tags && Array.isArray(item.tags))
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join(' ') 
            : '';

        modalContent.innerHTML = `
            <div class="card-header-meta" style="margin-bottom: 10px;">
                <strong>${item.type || 'Article.md'}</strong> // ${item.date || ''}
            </div>
            <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #ffffff;">${item.title || ''}</h2>
            <div style="margin-bottom: 16px;">${tagsHTML}</div>
            <div style="line-height: 1.6; color: var(--text-primary); font-size: 15px;">
                ${item.details || item.summary || 'Açıklama bulunamadı.'}
            </div>
        `;
        modalBackdrop.style.display = 'flex';
    }

    // 7. #about Linkine Tıklandığında Modal Açılması
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal({
                type: 'Author.md',
                date: '2026',
                title: 'Abdurrahman // About Me',
                tags: ['EMBEDDED', 'C#', 'HARDWARE', 'STM32'],
                details: `<p>${loadedAboutText}</p>`
            });
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => modalBackdrop.style.display = 'none');
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) modalBackdrop.style.display = 'none';
        });
    }
});