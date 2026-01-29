/* ============================================
   THEME.JS - Dark/Light Mode Toggle
   ============================================ */

// Apply theme IMMEDIATELY (before DOMContentLoaded) to prevent flash
(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', function () {
    initTheme();
});

/* ============================================
   THEME INITIALIZATION
   ============================================ */
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || (prefersDark.matches ? 'dark' : 'dark'); // Default to dark

    // Apply initial theme
    setTheme(initialTheme);
    updateToggleIcon(initialTheme);

    // Toggle button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Animate icon
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.add('theme-spin');
                setTimeout(() => icon.classList.remove('theme-spin'), 500);
            }

            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            setTheme(newTheme);
            setTimeout(() => updateToggleIcon(newTheme), 200); // Wait for half spin to swap icon
            localStorage.setItem('theme', newTheme);
        });
    }

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
            updateToggleIcon(newTheme);
        }
    });
}

/* ============================================
   SET THEME
   ============================================ */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f23' : '#f8fafc');
    }
}

/* ============================================
   UPDATE TOGGLE ICON
   ============================================ */
function updateToggleIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/* ============================================
   EXPORT FUNCTIONS (for module usage)
   ============================================ */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTheme, setTheme };
}
