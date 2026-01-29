// ============================================
// LANGUAGE DROPDOWN - Toggle functionality
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const langDropdown = document.getElementById('langDropdown');
    if (!langDropdown) return;

    const toggle = langDropdown.querySelector('.lang-toggle');
    const options = langDropdown.querySelectorAll('.lang-option');

    // Toggle dropdown
    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
    });

    // Select language option
    options.forEach(option => {
        option.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');

            // Update active state
            options.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Update toggle text
            toggle.querySelector('span').textContent = lang.toUpperCase();

            // Close dropdown
            langDropdown.classList.remove('open');

            // Dispatch custom event for API integration
            document.dispatchEvent(new CustomEvent('languageChange', {
                detail: { language: lang }
            }));

            // Store preference (optional)
            localStorage.setItem('preferred-language', lang);
        });
    });

    // Close on outside click
    document.addEventListener('click', function () {
        langDropdown.classList.remove('open');
    });

    // Load saved preference
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
        const savedOption = langDropdown.querySelector(`[data-lang="${savedLang}"]`);
        if (savedOption) {
            options.forEach(opt => opt.classList.remove('active'));
            savedOption.classList.add('active');
            toggle.querySelector('span').textContent = savedLang.toUpperCase();
        }
    }
});
