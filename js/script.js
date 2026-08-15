document.addEventListener('DOMContentLoaded', () => {

    let currentLang = 'en'; // Varsayılan Dil
    let projectsData = [];
    let postsData = [];
    
    // JSON'dan yüklenecek summary ve details verileri için varsayılan yapı
    let loadedAbout = {
        summary: {
            en: 'Software Developer specializing in C# and ASP.NET Core ecosystem.',
            tr: 'C# ve ASP.NET Core ekosisteminde uzmanlaşmış Yazılım Geliştirici.'
        },
        details: {
            en: '<p>Loading details...</p>',
            tr: '<p>Detaylar yükleniyor...</p>'
        }
    };

    // Dil Sözlüğü (Arayüz Metinleri)
    const dictionary = {
        en: {
            "nav.about": "about",
            "hero.title": "Engineering at the hardware level"
        },
        tr: {
            "nav.about": "hakkımda",
            "hero.title": "Donanım seviyesinde mühendislik"
        }
    };

    // 1. Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 1000);
    }

    // Helper: Çok Dilli Veri Çözümleyici
    function getLangProp(item, prop) {
        if (!item || !item[prop]) return '';
        if (typeof item[prop] === 'object') {
            return item[prop][currentLang] || item[prop]['en'] || item[prop]['tr'] || '';
        }
        return item[prop];
    }

    // 2. Tab Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const projectsSection = document.getElementById('projects-section');
    const blogSection = document.getElementById('blog-section');

    function switchTab(tabName, updateHash = true) {
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (projectsSection && blogSection) {
            if (tabName === 'projects') {
                projectsSection.classList.add('active');
                blogSection.classList.remove('active');
            } else {
                blogSection.classList.add('active');
                projectsSection.classList.remove('active');
            }
        }

        if (updateHash && !window.location.hash.startsWith('#project-') && !window.location.hash.startsWith('#post-') && window.location.hash !== '#about') {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // 3. Efektli Kart Oluşturucu
    function createDevCard(item) {
        const card = document.createElement('div');
        card.className = 'dev-card';
        
        const title = getLangProp(item, 'title') || 'Untitled';
        const tagsHTML = (item.tags && Array.isArray(item.tags))
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join('') 
            : '';

        card.innerHTML = `
            <div>
                <div class="card-header-meta">
                    <strong>${item.type || 'Article.md'}</strong> // ${item.date || ''}
                </div>
                <h3 class="card-main-title">${title}</h3>
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
    async function fetchJsonData(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data.reverse() : [];
        } catch (error) {
            console.error(`[Data Error] ${jsonPath} yüklenemedi:`, error);
            return [];
        }
    }

    function renderContainer(containerId, dataList) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (dataList.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-family:var(--font-mono);">// Veri bulunamadı.</p>';
            return;
        }

        container.innerHTML = '';
        dataList.forEach(item => container.appendChild(createDevCard(item)));
    }

    async function loadAllData() {
        projectsData = await fetchJsonData('./data/projects.json');
        postsData = await fetchJsonData('./data/posts.json');

        renderContainer('projects-container', projectsData);
        renderContainer('blog-container', postsData);

        handleRoute(); // Sayfa ilk açıldığında Hash kontrolü
    }

    // 5. Hakkında Verilerini JSON Olarak Çekme (Summary -> Giriş Ekranı, Details -> Modal)
    async function loadAboutData() {
        const aboutContainer = document.getElementById('about-text');
        try {
            const response = await fetch('./data/about.json');
            if (response.ok) {
                const data = await response.json();
                if (data.summary) loadedAbout.summary = data.summary;
                if (data.details) loadedAbout.details = data.details;
            }
        } catch (error) {
            console.error('[About Error] about.json okunamadı:', error);
        }

        // Giriş ekranında (Hero bölümünde) özet metni göster
        if (aboutContainer) {
            aboutContainer.textContent = loadedAbout.summary[currentLang] || loadedAbout.summary['en'];
        }
    }

    loadAboutData();
    loadAllData();

    // 6. Modal İşlemleri & URL Hash Yönlendirmesi
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    function openModal(item, updateHash = true) {
        if (!modalBackdrop || !modalContent) return;

        const title = getLangProp(item, 'title') || '';
        const details = getLangProp(item, 'details') || getLangProp(item, 'summary') || 'Açıklama bulunamadı.';
        const tagsHTML = (item.tags && Array.isArray(item.tags))
            ? item.tags.map(tag => `<span class="card-tag-item">${tag}</span>`).join(' ') 
            : '';

        modalContent.innerHTML = `
            <div class="card-header-meta" style="margin-bottom: 10px;">
                <strong>${item.type || 'Article.md'}</strong> // ${item.date || ''}
            </div>
            ${title ? `<h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #ffffff;">${title}</h2>` : ''}
            ${tagsHTML ? `<div style="margin-bottom: 16px;">${tagsHTML}</div>` : ''}
            <div style="line-height: 1.6; color: var(--text-primary); font-size: 15px;">
                ${details}
            </div>
        `;
        
        modalBackdrop.style.display = 'flex';

        if (updateHash && item.id) {
            window.location.hash = item.id;
        }
    }

    function closeModal(updateHash = true) {
        if (modalBackdrop) modalBackdrop.style.display = 'none';
        if (updateHash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }

    // 7. Hakkında Linkine Tıklama (Popup İçeriği)
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAboutModal();
        });
    }

    function openAboutModal(updateHash = true) {
        const detailHTML = loadedAbout.details[currentLang] || loadedAbout.details['en'];
        openModal({
            id: 'about',
            type: 'Author.md',
            date: '2026',
            details: detailHTML
        }, updateHash);
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal());
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
    }

    // 8. Hash / Derin Link Kontrolü
    function handleRoute() {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;

        if (hash === 'about') {
            openAboutModal(false);
            return;
        }

        const projectItem = projectsData.find(p => p.id === hash);
        if (projectItem) {
            switchTab('projects', false);
            openModal(projectItem, false);
            return;
        }

        const postItem = postsData.find(p => p.id === hash);
        if (postItem) {
            switchTab('blog', false);
            openModal(postItem, false);
            return;
        }
    }

    window.addEventListener('hashchange', handleRoute);

    // 9. Dil Değiştirme (TR / EN) ve Animasyon
    const langBtn = document.getElementById('langToggleBtn');
    const langLabel = document.getElementById('langLabel');

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'tr' : 'en';
            if (langLabel) langLabel.textContent = currentLang.toUpperCase();

            // Geçiş Animasyonu
            document.body.classList.add('i18n-animating');

            setTimeout(() => {
                // Arayüz metinlerini güncelle
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (dictionary[currentLang] && dictionary[currentLang][key]) {
                        el.textContent = dictionary[currentLang][key];
                    }
                });

                // Hero Alanındaki Özet Metnini Güncelle
                const aboutContainer = document.getElementById('about-text');
                if (aboutContainer) {
                    aboutContainer.textContent = loadedAbout.summary[currentLang] || loadedAbout.summary['en'];
                }

                // Kartları Yeniden Çiz
                renderContainer('projects-container', projectsData);
                renderContainer('blog-container', postsData);

                // Eğer Modal Açıksa İçeriğini Yeni Dile Göre Güncelle
                if (window.location.hash) {
                    handleRoute();
                }

                document.body.classList.remove('i18n-animating');
            }, 200);
        });
    }
});