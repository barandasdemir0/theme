/* ============================================
   MAIN.JS - Core Application Entry Point
   Loads and initializes all modules (No ES6 imports for file:// compatibility)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all core functions
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initBackToTop();
    initPreloader();
    initFormValidation();
    initPortfolioFilter();
    initResumeTabs();
    initLazyLoading();
    initPageTransitions(); // New feature
});

/* ============================================
   FEATURE - Smooth Page Transitions
   ============================================ */
function initPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');

            // Skip if external link, anchor link, or just #
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank') return;

            e.preventDefault();
            const preloader = document.querySelector('.preloader');

            if (preloader) {
                // Fade out page (by showing preloader)
                preloader.classList.remove('hidden');

                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            } else {
                window.location.href = href;
            }
        });
    });
}

/* ============================================
   CORE - Navbar
   ============================================ */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initMobileMenu() {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse?.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });
}

/* ============================================
   CORE - Scroll & Navigation
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
            }
        });
    });
}

function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - navHeight - 100) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

/* ============================================
   COMPONENTS
   ============================================ */
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    
    // Ensure preloader is visible on initial page load
    preloader.classList.remove('hidden');
    
    // Hide after page loads
    window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('hidden'), 500);
    });
}

function initFormValidation() {
    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-2"></i>Gönderildi!';
            btn.disabled = true;
            setTimeout(() => { btn.innerHTML = original; btn.disabled = false; form.reset(); form.classList.remove('was-validated'); }, 3000);
        });
    });
}

function initPortfolioFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    const grid = document.querySelector('.portfolio-grid');
    const searchInput = document.getElementById('portfolioSearchInput');
    const searchBox = document.getElementById('portfolioSearch');
    const searchClear = document.getElementById('portfolioSearchClear');

    if (!btns.length || !items.length) return;

    // Add CSS keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(40px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
        }
        
        .portfolio-item.animate-in {
            animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .portfolio-item.animate-out {
            animation: fadeOutDown 0.4s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // Current filter state
    let currentFilter = '*';
    let currentSearch = '';

    // Create no-results element
    let noResultsEl = document.querySelector('.no-results');
    if (!noResultsEl && grid) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results';
        noResultsEl.style.display = 'none';
        noResultsEl.innerHTML = `
            <i class="fas fa-search"></i>
            <p>Sonuç bulunamadı</p>
        `;
        grid.appendChild(noResultsEl);
    }

    // Filter and search function
    function filterItems() {
        let visibleCount = 0;
        let delay = 0;

        items.forEach(item => {
            const category = item.getAttribute('data-category') || '';
            const title = item.querySelector('h4')?.textContent?.toLowerCase() || '';
            const tags = item.querySelector('.portfolio-tags')?.textContent?.toLowerCase() || '';
            const searchText = title + ' ' + tags + ' ' + category;

            const matchesFilter = currentFilter === '*' || category.includes(currentFilter);
            const matchesSearch = currentSearch === '' || searchText.includes(currentSearch.toLowerCase());
            const shouldShow = matchesFilter && matchesSearch;

            if (shouldShow) {
                item.classList.remove('animate-out');
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, delay);
                delay += 100;
                visibleCount++;
            } else {
                item.classList.remove('animate-in');
                item.style.display = 'none';
            }
        });

        // Show/hide no results message
        if (noResultsEl) {
            noResultsEl.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
    }

    // Filter button click handlers
    btns.forEach(btn => {
        btn.addEventListener('click', function () {
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            filterItems();
        });
    });

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = this.value.trim();

            // Toggle has-value class for clear button
            if (searchBox) {
                searchBox.classList.toggle('has-value', currentSearch.length > 0);
            }

            filterItems();
        });
    }

    // Search clear button
    if (searchClear) {
        searchClear.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
                if (searchBox) {
                    searchBox.classList.remove('has-value');
                }
                filterItems();
                searchInput.focus();
            }
        });
    }

    // Initialize all items as visible
    items.forEach(item => {
        item.style.display = 'block';
    });
}

function initResumeTabs() {
    const tabs = document.querySelectorAll('.resume-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = c.id === target ? 'block' : 'none');
        });
    });
}

function initLazyLoading() {
    const imgs = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.src = e.target.dataset.src; o.unobserve(e.target); } });
        });
        imgs.forEach(img => obs.observe(img));
    } else {
        imgs.forEach(img => img.src = img.dataset.src);
    }
}
