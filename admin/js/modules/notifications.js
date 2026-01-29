class NotificationSystem {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        // console.log("NotificationSystem initializing...");
        this.createToastContainer();
        // this.injectNotificationDropdown(); // Removed in favor of static HTML
        this.setupDropdownListeners();
        // console.log("NotificationSystem initialized.");
    }

    createToastContainer() {
        if (!document.querySelector('.admin-toast-container')) {
            const container = document.createElement('div');
            container.classList.add('admin-toast-container');
            document.body.appendChild(container); // Appended to body
            this.toastContainer = container;
        } else {
            this.toastContainer = document.querySelector('.admin-toast-container');
        }
    }

    // injectNotificationDropdown removed - using static HTML

    setupDropdownListeners() {
        // SELECTORS
        const notifBtnSelector = '.notification-btn';
        const dropdownSelector = '.notification-dropdown';

        // CLICK DELEGATION
        document.addEventListener('click', (e) => {
            const target = e.target;
            const dropdown = document.querySelector(dropdownSelector);

            // 1. Toggle Button
            const notifBtn = target.closest(notifBtnSelector);
            if (notifBtn) {
                e.preventDefault();
                e.stopPropagation();

                // Mobile Redirect: Go to notifications page on small screens
                if (window.innerWidth <= 768) {
                    const mobileHref = notifBtn.getAttribute('data-mobile-href') || 'notifications.html';
                    window.location.href = mobileHref;
                    return;
                }

                // console.log("Notification button clicked!");

                if (dropdown) {
                    dropdown.classList.toggle('active');
                    const isActive = dropdown.classList.contains('active');
                    // console.log("Dropdown toggled. Active:", isActive);

                    // Force visibility check
                    if (isActive) {
                        dropdown.style.opacity = "1";
                        dropdown.style.visibility = "visible";
                        dropdown.style.transform = "translateY(0) scale(1)";
                    } else {
                        dropdown.style.opacity = "";
                        dropdown.style.visibility = "";
                        dropdown.style.transform = "";
                    }
                } else {
                    // console.error("Dropdown not found on click!");
                }
                return;
            }

            // 2. View All Redirect
            if (target.closest('.view-all-btn')) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = 'notifications.html';
                return;
            }

            // 3. Mark All Read
            if (target.closest('.mark-all-read')) {
                if (dropdown) {
                    dropdown.querySelectorAll('.notification-item.unread').forEach(item => {
                        item.classList.remove('unread');
                    });
                    this.showToast(window.I18N?.common?.success || 'Başarılı', window.I18N?.notifications?.allRead || 'Tüm bildirimler okundu olarak işaretlendi.', 'success');
                }
                return;
            }

            // 4. Click Outside
            if (dropdown && dropdown.classList.contains('active')) {
                // If click is not inside the dropdown
                if (!dropdown.contains(target)) {
                    dropdown.classList.remove('active');
                    // Reset styles
                    dropdown.style.opacity = "";
                    dropdown.style.visibility = "";
                    dropdown.style.transform = "";
                }
            }
        });

        // Hover Logic (Optional)
        const notifBtn = document.querySelector(notifBtnSelector);
        const headerActions = document.querySelector('.header-actions');

        if (notifBtn) {
            notifBtn.addEventListener('mouseenter', () => {
                // Disable hover dropdown on mobile
                if (window.innerWidth <= 768) return;

                const dropdown = document.querySelector(dropdownSelector);
                if (dropdown) {
                    dropdown.classList.add('active');
                    /*
                    dropdown.style.opacity = "1";
                    dropdown.style.visibility = "visible";
                    dropdown.style.transform = "translateY(0) scale(1)";\
                    */
                }
            });
        }

        if (headerActions) {
            headerActions.addEventListener('mouseleave', () => {
                const dropdown = document.querySelector(dropdownSelector);
                if (dropdown) {
                    dropdown.classList.remove('active');
                    /*
                   dropdown.style.opacity = "";
                   dropdown.style.visibility = "";
                   dropdown.style.transform = "";
                   */
                }
            });
        }
    }

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <i class="fas ${icon} admin-toast-icon"></i>
            <div class="admin-toast-content">
                <div class="admin-toast-title">${title}</div>
                <div class="admin-toast-message">${message}</div>
            </div>
            <button class="admin-toast-close"><i class="fas fa-times"></i></button>
        `;

        // Disable hover on buttons while toast is showing
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('toast-active');
            btn.blur();
        });

        toast.querySelector('.admin-toast-close').addEventListener('click', () => {
            this.closeToast(toast);
        });

        setTimeout(() => this.closeToast(toast), 4000);
        this.toastContainer.appendChild(toast);
    }

    closeToast(toast) {
        toast.classList.add('closing');
        toast.addEventListener('animationend', () => {
            toast.remove();
            // Remove toast-active class from buttons
            document.querySelectorAll('.btn').forEach(btn => {
                btn.classList.remove('toast-active');
                btn.blur();
            });
        });
    }

    showModal(title, message, onConfirmOrType, type = 'danger') {
        // Handle both signatures: (title, message, callback, type) and (title, message, type)
        let onConfirm = null;
        let modalType = type;

        if (typeof onConfirmOrType === 'function') {
            onConfirm = onConfirmOrType;
        } else if (typeof onConfirmOrType === 'string') {
            modalType = onConfirmOrType;
        }

        // Only remove previously created confirmation modals, not page modals
        const existingModal = document.querySelector('.admin-confirmation-modal');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.classList.add('admin-modal-overlay', 'admin-confirmation-modal');

        let icon = modalType === 'danger' ? 'fa-trash-alt' :
            modalType === 'error' ? 'fa-exclamation-circle' :
                modalType === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        // If no callback, show only OK button instead of Cancel/Confirm
        const footerHtml = onConfirm
            ? `<button class="btn btn-secondary cancel-btn">Vazgeç</button>
               <button class="btn btn-danger confirm-btn">Onayla</button>`
            : `<button class="btn btn-primary confirm-btn">Tamam</button>`;

        overlay.innerHTML = `
            <div class="admin-modal">
                <div class="modal-header">
                    <div class="modal-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="modal-title">${title}</div>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer">
                    ${footerHtml}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        const cancelBtn = overlay.querySelector('.cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', close);

        const confirmBtn = overlay.querySelector('.confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                close();
                if (onConfirm) onConfirm();
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }
}

// Pagination functionality for notifications page
document.addEventListener('DOMContentLoaded', function () {
    const paginationBtns = document.querySelectorAll('.pagination-btn');

    if (paginationBtns.length === 0) return; // Not on notifications page

    paginationBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
            if (this.disabled || this.classList.contains('active')) return;

            const isNumber = !this.querySelector('i');

            if (isNumber) {
                // Remove active class from all number buttons
                document.querySelectorAll('.pagination-btn').forEach(b => {
                    if (!b.querySelector('i')) {
                        b.classList.remove('active');
                    }
                });

                // Add active class to clicked button
                this.classList.add('active');

                const pageNumber = parseInt(this.textContent);
                // console.log('Bildirimler - Sayfa:', pageNumber);

            } else {
                // Arrow button clicked
                const currentActive = document.querySelector('.pagination-btn.active');
                const currentPage = parseInt(currentActive?.textContent || 1);
                const isNext = this.querySelector('.fa-chevron-right');

                if (isNext) {
                    // Next page
                    const nextBtn = Array.from(paginationBtns).find(b =>
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage + 1
                    );
                    if (nextBtn) nextBtn.click();
                } else {
                    // Previous page
                    const prevBtn = Array.from(paginationBtns).find(b =>
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage - 1
                    );
                    if (prevBtn) prevBtn.click();
                }
            }

            // Update arrow button states
            updateNotificationsPaginationArrows();
        });
    });

    function updateNotificationsPaginationArrows() {
        const currentActive = document.querySelector('.pagination-btn.active');
        const currentPage = parseInt(currentActive?.textContent || 1);
        const allPages = Array.from(document.querySelectorAll('.pagination-btn'))
            .filter(b => !b.querySelector('i'))
            .map(b => parseInt(b.textContent));

        const minPage = Math.min(...allPages);
        const maxPage = Math.max(...allPages);

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) prevBtn.disabled = currentPage <= minPage;
        if (nextBtn) nextBtn.disabled = currentPage >= maxPage;
    }

    // Initialize arrow states
    updateNotificationsPaginationArrows();
});
