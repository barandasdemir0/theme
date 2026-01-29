// No imports needed as scripts will be loaded sequentially in HTML

class AdminApp {
    init() {
        // Initialize sidebar toggle first - this should always work
        this.initSidebarToggle();

        // Initialize other systems if they exist
        if (typeof NotificationSystem !== 'undefined') {
            this.notifications = new NotificationSystem();
        }
        if (typeof AuthSystem !== 'undefined' && this.notifications) {
            this.auth = new AuthSystem(this.notifications);
        }
        if (typeof UISystem !== 'undefined' && this.notifications) {
            this.ui = new UISystem(this.notifications);
        }


    }

    initSidebarToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const wrapper = document.querySelector('.admin-wrapper');

        if (!menuToggle || !sidebar || !wrapper) {
            return;
        }

        // Check saved state (only for desktop)
        const sidebarState = localStorage.getItem('sidebarCollapsed');
        if (sidebarState === 'true' && window.innerWidth > 992) {
            wrapper.classList.add('sidebar-collapsed');
        }

        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Mobile behavior
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('active');
            } else {
                // Desktop behavior
                wrapper.classList.toggle('sidebar-collapsed');
                const isCollapsed = wrapper.classList.contains('sidebar-collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed);
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 &&
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

        // Remove focus from buttons after click
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function () {
                this.blur();
                setTimeout(() => this.blur(), 50);
                setTimeout(() => this.blur(), 150);
            });
        });

        // Remove focus from form buttons after submit
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function () {
                setTimeout(() => {
                    document.activeElement.blur();
                    document.querySelectorAll('.btn').forEach(btn => btn.blur());
                }, 0);
            });
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
    window.adminApp.init();
});
