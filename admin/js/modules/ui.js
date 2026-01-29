class UISystem {
    constructor(notificationSystem) {
        this.notifications = notificationSystem;
        this.init();
    }

    init() {
        this.setupPreloader();
        this.setupSidebar();
        this.setupForms();
        this.setupActions();
        this.setupTheme();
        this.setupPasswordVisibility();
        this.setupModalScrollLock();
    }

    setupPreloader() {
        const preloader = document.querySelector('.preloader');
        if (!preloader) return;

        // Ensure preloader is visible on initial page load
        preloader.classList.remove('hidden');

        // Hide after page loads with a slight delay for smooth transition
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 800); // 800ms delay as requested (balanced speed)
        });
    }

    setupModalScrollLock() {
        // Observer to watch for modals becoming visible or hidden
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('modal') || target.id === 'projectForm' || target.id === 'categoryForm') {
                        if (target.classList.contains('visible') || target.style.display === 'block' || target.style.display === 'flex') {
                            document.body.classList.add('overflow-hidden');
                        } else {
                            // Check if any other modal is still open
                            const anyOpen = document.querySelector('.modal.visible, #projectForm.visible, #categoryForm.visible');
                            if (!anyOpen) {
                                document.body.classList.remove('overflow-hidden');
                            }
                        }
                    }
                }
            });
        });

        // Start observing all potential modals
        const potentialModals = document.querySelectorAll('.modal, #projectForm, #categoryForm');
        potentialModals.forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    }

    setupSidebar() {
        // Sidebar toggle is handled in admin.js to avoid double-toggling

        // Mobile menu toggle (if exists separately)
        const sidebar = document.querySelector('.admin-sidebar');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    setupForms() {
        document.querySelectorAll('form').forEach(form => {
            if (form.id !== 'loginForm') {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const btn = form.querySelector('button[type="submit"]');
                    if (btn) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = `<i class="fas fa-check"></i> ${window.I18N?.ui?.saved || 'Kaydedildi!'}`;
                        btn.classList.add('btn-saved-state');

                        this.notifications.showToast(window.I18N?.common?.success || 'Başarılı', window.I18N?.ui?.changesSaved || 'Değişiklikler kaydedildi.', 'success');

                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('btn-saved-state');
                        }, 2000);
                    }
                });
            }
        });

        // Search functionality
        const searchInputs = document.querySelectorAll('input[placeholder="Ara..."]');
        searchInputs.forEach(input => {
            input.addEventListener('input', function () {
                const searchTerm = this.value.toLowerCase();
                const table = this.closest('.card')?.querySelector('.admin-table tbody');
                if (table) {
                    table.querySelectorAll('tr').forEach(row => {
                        const text = row.textContent.toLowerCase();
                        if (text.includes(searchTerm)) {
                            row.classList.remove('hidden');
                        } else {
                            row.classList.add('hidden');
                        }
                    });
                }
            });
        });
    }

    setupActions() {
        // Status Badges
        document.querySelectorAll('.status-badge').forEach(badge => {
            badge.classList.add('cursor-pointer');
            badge.addEventListener('click', () => {
                if (badge.classList.contains('active')) {
                    badge.classList.remove('active');
                    badge.classList.add('draft');
                    badge.textContent = 'Taslak';
                    this.notifications.showToast(window.I18N?.ui?.statusUpdated || 'Durum Güncellendi', window.I18N?.ui?.draftMode || 'Öğe taslak moda alındı.', 'warning');
                } else if (badge.classList.contains('draft')) {
                    badge.classList.remove('draft');
                    badge.classList.add('active');
                    badge.textContent = 'Yayında';
                    this.notifications.showToast(window.I18N?.ui?.statusUpdated || 'Durum Güncellendi', window.I18N?.ui?.activeMode || 'Öğe yayına alındı.', 'success');
                }
            });
        });

        // Quick Actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.notifications.showToast(window.I18N?.ui?.actionStarted || 'İşlem Başlatıldı', window.I18N?.ui?.loadingMenu || 'Hızlı işlem menüsü yükleniyor...', 'info');
            });
        });

        // Delete Buttons (Global Soft Delete Handler via Delegation)
        document.body.addEventListener('click', (e) => {
            // Check if the clicked element or its parent is a delete button
            const btn = e.target.closest('.action-btn.delete');

            // Proceed only if a delete button was clicked AND it's NOT a custom handled one 
            // (like resume.js deleteRow OR categories.js deleteCategory)
            if (btn &&
                btn.getAttribute('data-action') !== 'deleteRow' &&
                btn.getAttribute('data-action') !== 'deleteCategory' &&
                btn.getAttribute('data-action') !== 'deleteMessage') {

                e.preventDefault();
                e.stopPropagation();

                // Prevent conflict with Guestbook page's own delete logic
                if (document.body.classList.contains('guestbook-page') || btn.closest('.guestbook-page')) {
                    return; // Let guestbook.js handle it
                }

                this.notifications.showModal(
                    window.I18N?.ui?.deleteTitle || 'Silme İşlemi',
                    window.I18N?.ui?.deleteConfirm || 'Bu öğeyi silmek istediğinizden emin misiniz? <br><small>Bu işlem geri alınabilir (soft delete).</small>',
                    () => {
                        const row = btn.closest('tr');
                        if (row) {
                            // Soft Delete Visuals
                            row.classList.add('deleted-item');

                            // Update Visibility Badge (Standard Pages)
                            const badge = row.querySelector('.badge.bg-success') ||
                                row.querySelector('td[data-label="Görünürlük"] .badge') ||
                                row.querySelector('td:nth-child(4) .badge');

                            if (badge) {
                                badge.className = 'badge bg-danger';
                                badge.textContent = window.I18N?.ui?.deleted || 'Silindi';
                            }

                            // Update Status Badge (Notifications Page & Others)
                            // Notifications page uses .status-badge
                            const statusBadge = row.querySelector('.status-badge');
                            if (statusBadge) {
                                // Store original state if needed, or just rely on row classes
                                statusBadge.setAttribute('data-original-class', statusBadge.className);
                                statusBadge.setAttribute('data-original-text', statusBadge.textContent);

                                statusBadge.className = 'status-badge danger';
                                statusBadge.textContent = window.I18N?.ui?.deleted || 'Silindi';
                            }

                            // Replace Delete Button with Restore Button
                            const actionCell = btn.parentElement;
                            const restoreBtn = document.createElement('button');
                            restoreBtn.className = 'action-btn restore';
                            restoreBtn.title = window.I18N?.ui?.restoreTitle || 'Geri Yükle';
                            restoreBtn.setAttribute('data-action', 'restoreItem'); // Important for delegation
                            restoreBtn.innerHTML = '<i class="fas fa-undo"></i>';

                            // Replace the button in the DOM
                            if (actionCell && actionCell.contains(btn)) {
                                actionCell.replaceChild(restoreBtn, btn);
                            }

                            this.notifications.showToast(window.I18N?.common?.success || 'Başarılı', window.I18N?.ui?.itemDeleted || 'Öğe silindi (Arşivlendi).', 'warning');
                        }
                    },
                    'danger'
                );
            }
        });

        // Restore Item Listener (Global)
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="restoreItem"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation(); // Stop other handlers

                // If specific pages have their own restore logic (like Guestbook/Categories/Projects), 
                // they usually attach their own listeners or won't use data-action="restoreItem" exactly this way 
                // OR we must ensure this doesn't conflict. 
                // Current Guestbook uses a huge document listener for restoreItem too. 
                // We should probably UNIFY them or let this global one handle generic cases.
                // However, Guestbook has specific logic (Pending/Approved). 
                // Projects/Blog have specific logic too? No, I implemented them in previous turns?
                // Actually, Projects/Blog DO NOT have their own restore listeners in the files I viewed earlier?
                // Wait, I saw "Restore Item Functionality" blocks in `projects.js`, `blog.js` in the summary!
                // If they exist, they will catch the event too. 
                // Ideally, we shouldn't have multiple listeners for same event.
                // But `guestbook.js` listener is tailored.
                // Notifications page needs one.

                // Let's implement a specific check for Notifications page here, 
                // and let others be handled by their specific scripts if they exist.
                // Or better, make this the fallback if no other script stops propagation.

                // Prevent conflict with Guestbook page's own restore logic
                if (document.body.classList.contains('guestbook-page') || btn.closest('.guestbook-page')) {
                    return; // Let guestbook.js handle it
                }

                const row = btn.closest('tr');
                if (!row) return;

                // Check if Notifications Page
                const isNotificationsPage = document.body.classList.contains('notifications-page') || row.querySelector('.status-badge');

                if (isNotificationsPage && !row.closest('.guestbook-page') && !document.body.classList.contains('guestbook-page')) {
                    // Custom Restore Modal for Notifications
                    this.notifications.showModal(
                        window.I18N?.ui?.restoreTitle || 'Geri Yükle',
                        window.I18N?.ui?.restoreConfirm || 'Bu bildirimi geri yüklemek istiyor musunuz?',
                        () => {
                            row.classList.remove('deleted-item');

                            // Restore Status Badge
                            const statusBadge = row.querySelector('.status-badge');
                            if (statusBadge) {
                                // Try to restore original state
                                const originalClass = statusBadge.getAttribute('data-original-class');
                                const originalText = statusBadge.getAttribute('data-original-text');

                                if (originalClass && originalText) {
                                    statusBadge.className = originalClass;
                                    statusBadge.textContent = originalText;
                                } else {
                                    // Fallback logic
                                    if (row.classList.contains('unread-row')) {
                                        statusBadge.className = 'status-badge pending';
                                        statusBadge.textContent = 'Okunmadı';
                                    } else {
                                        statusBadge.className = 'status-badge active';
                                        statusBadge.textContent = 'Okundu';
                                    }
                                }
                                statusBadge.classList.remove('badge-danger-custom');
                            }

                            // Restore Button to Delete
                            const actionCell = btn.parentElement;
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'action-btn delete';
                            deleteBtn.title = window.I18N?.common?.delete || 'Sil';
                            // No custom data-action needed for standard delete, global listener catches it
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

                            if (actionCell) actionCell.replaceChild(deleteBtn, btn);

                            this.notifications.showToast(window.I18N?.common?.success || 'Başarılı', window.I18N?.ui?.itemRestored || 'Bildirim geri yüklendi.', 'success');
                        },
                        'warning' // Yellow/Orange modal for restore
                    );
                }
            }
        });

        // Approve Buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            if (btn.querySelector('.fa-check') && !btn.parentElement.classList.contains('quick-actions')) {
                btn.addEventListener('click', () => {
                    const row = btn.closest('tr');
                    if (row) {
                        const statusBadge = row.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.className = 'status-badge active';
                            statusBadge.textContent = 'Onaylandı';
                        }

                        // If it's the specific approve action in table
                        if (btn.title === "Okundu İşaretle" || btn.title === (window.I18N?.ui?.markRead || "Okundu İşaretle")) {
                            this.notifications.showToast(window.I18N?.common?.success || 'Başarılı', window.I18N?.ui?.readSuccess || 'Bildirim okundu olarak işaretlendi.', 'success');
                            row.classList.remove('unread-row');
                            return;
                        }

                        const actions = btn.closest('.action-btns');
                        if (actions) {
                            actions.innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> ${window.I18N?.ui?.approved || 'Onaylandı'}</span>`;
                        }
                        this.notifications.showToast(window.I18N?.ui?.approved || 'Onaylandı', window.I18N?.ui?.approveSuccess || 'İçerik başarıyla onaylandı.', 'success');
                    }
                });
            }
        });

        // Toggle Switches
        document.querySelectorAll('.switch input').forEach(toggle => {
            toggle.addEventListener('change', function () {
                const label = this.closest('.toggle-switch').querySelector('span:last-child');

                if (label) {
                    if (this.checked) {
                        label.textContent = label.textContent.replace('Pasif', window.I18N?.ui?.active || 'Aktif');
                    } else {
                        label.textContent = label.textContent.replace('Aktif', window.I18N?.ui?.passive || 'Pasif');
                    }
                }
            });
        });
    }

    setupTheme() {
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.className = 'theme-toggle-btn';
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.title = 'Temayı Değiştir';

        // Add button to header actions if it exists
        // Insert before the first icon button (usually External Link) so Page Actions (like New Project) stay on the left
        const headerActions = document.querySelector('.header-actions, .theme-actions');
        if (headerActions) {
            const firstIcon = headerActions.querySelector('.btn-icon');
            if (firstIcon) {
                headerActions.insertBefore(themeToggleBtn, firstIcon);
            } else {
                headerActions.insertBefore(themeToggleBtn, headerActions.firstChild);
            }
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('adminTheme');
        if (savedTheme === 'light') {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.classList.add('light'); // Optional style class
        }

        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            const isLight = document.documentElement.classList.contains('light-mode');
            localStorage.setItem('adminTheme', isLight ? 'light' : 'dark');

            themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    setupPasswordVisibility() {
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.previousElementSibling;
                if (input && input.type) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        input.type = 'password';
                        this.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                }
            });
        });
    }
}
