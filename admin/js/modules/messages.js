// Message Modal Functionality
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('messageModal');
    const composeModal = document.getElementById('composeModal');

    // --- Mobile Sidebar Toggle ---
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const emailSidebar = document.querySelector('.email-sidebar');

    if (mobileSidebarToggle && emailSidebar) {
        mobileSidebarToggle.addEventListener('click', () => {
            emailSidebar.classList.add('active');
            sidebarOverlay?.classList.add('active');
        });

        sidebarOverlay?.addEventListener('click', () => {
            emailSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar when a category is clicked on mobile
        document.querySelectorAll('.email-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    emailSidebar.classList.remove('active');
                    sidebarOverlay?.classList.remove('active');
                }
            });
        });
    }



    // --- HTMX Sidebar Navigation Logic ---
    // --- HTMX Sidebar Navigation Logic ---

    // Sidebar category click handler (active state only - HTMX handles data fetching)
    document.querySelectorAll('.email-nav-item[data-category]').forEach(item => {
        item.addEventListener('click', function (e) {
            // Remove active class from all
            document.querySelectorAll('.email-nav-item').forEach(nav => {
                nav.classList.remove('active');
            });

            // Add active class to clicked
            this.classList.add('active');

            // Update header title dynamically from the clicked link text (no hardcoded JS strings)
            // Structure: <i>icon</i> <span>Title</span> <span class="badge">Count</span>
            const titleSpan = this.querySelector('span:not(.badge)');
            if (titleSpan) {
                document.querySelector('.email-toolbar h3').textContent = titleSpan.textContent.trim();
            }
        });
    });

    // HTMX afterSwap event - rebind events after table content is replaced
    document.body.addEventListener('htmx:afterSwap', function (event) {
        if (event.detail.target.id === 'messageTableBody') {
            bindViewMessageEvents();
        }
    });

    // --- Search Functionality ---
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.admin-table tbody tr');

            rows.forEach(row => {
                const sender = row.cells[0].textContent.toLowerCase();
                const subject = row.cells[1].textContent.toLowerCase();

                if (sender.includes(searchTerm) || subject.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // --- Compose Modal Functionality ---
    // --- Compose Modal Functionality ---
    document.querySelectorAll('[data-action="openCompose"]').forEach(btn => {
        btn.addEventListener('click', () => {
            composeModal.classList.add('active');
        });
    });

    document.querySelectorAll('[data-action="closeComposeModal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            composeModal.classList.remove('active');
        });
    });

    // --- Delete Message Handler ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="deleteMessage"]');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        window.adminApp?.notifications?.showModal(
            'Silme İşlemi',
            'Bu mesajı çöp kutusuna taşımak istediğinizden emin misiniz?',
            () => {
                const row = btn.closest('tr');
                if (row) {
                    row.classList.add('deleted-row');

                    // Update status badge to "Çöp Kutusu"
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.setAttribute('data-original-class', statusBadge.className);
                        statusBadge.setAttribute('data-original-text', statusBadge.textContent);
                        statusBadge.className = 'status-badge trash';
                        statusBadge.textContent = 'Çöp Kutusu';
                    }

                    // Toggle buttons: hide delete, show restore
                    const actionBtns = row.querySelector('.action-btns');
                    if (actionBtns) {
                        const deleteBtn = actionBtns.querySelector('[data-action="deleteMessage"]');
                        let restoreBtn = actionBtns.querySelector('[data-action="restoreMessage"]');

                        if (deleteBtn) deleteBtn.classList.add('hidden');

                        if (!restoreBtn) {
                            restoreBtn = document.createElement('button');
                            restoreBtn.className = 'action-btn restore';
                            restoreBtn.title = 'Geri Yükle';
                            restoreBtn.setAttribute('data-action', 'restoreMessage');
                            restoreBtn.innerHTML = '<i class="fas fa-undo"></i>';
                            actionBtns.appendChild(restoreBtn);
                        } else {
                            restoreBtn.classList.remove('hidden');
                        }
                    }

                    window.adminApp?.notifications?.showToast('Başarılı', 'Mesaj çöp kutusuna taşındı.', 'warning');
                }
            },
            'danger'
        );
    });

    // --- Restore Message Handler ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="restoreMessage"]');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        window.adminApp?.notifications?.showModal(
            'Geri Yükle',
            'Bu mesajı geri yüklemek istiyor musunuz?',
            () => {
                const row = btn.closest('tr');
                if (row) {
                    row.classList.remove('deleted-row');

                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge) {
                        const originalClass = statusBadge.getAttribute('data-original-class');
                        const originalText = statusBadge.getAttribute('data-original-text');

                        if (originalClass && originalText) {
                            statusBadge.className = originalClass;
                            statusBadge.textContent = originalText;
                        } else {
                            statusBadge.className = 'status-badge active';
                            statusBadge.textContent = 'Okundu';
                        }
                    }

                    const actionBtns = row.querySelector('.action-btns');
                    if (actionBtns) {
                        const deleteBtn = actionBtns.querySelector('[data-action="deleteMessage"]');
                        const restoreBtn = actionBtns.querySelector('[data-action="restoreMessage"]');

                        if (deleteBtn) deleteBtn.classList.remove('hidden');
                        if (restoreBtn) restoreBtn.classList.add('hidden');
                    }

                    window.adminApp?.notifications?.showToast('Başarılı', 'Mesaj geri yüklendi.', 'success');
                }
            },
            'warning'
        );
    });

    // View message action - wrapped in function for rebinding after dynamic render
    function bindViewMessageEvents() {
        document.querySelectorAll('[data-action="viewMessage"]').forEach(btn => {
            // Remove existing event listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', function () {
                document.getElementById('modalName').textContent = this.dataset.name;
                document.getElementById('modalEmail').textContent = this.dataset.email;
                document.getElementById('modalSubject').textContent = this.dataset.subject;
                document.getElementById('modalDate').textContent = this.dataset.date;
                document.getElementById('modalMessage').textContent = this.dataset.message;
                modal.classList.add('active');

                // Store reference to current row for marking as read
                modal.dataset.currentBtn = Array.from(document.querySelectorAll('[data-action="viewMessage"]')).indexOf(this);
            });
        });
    }

    // Initial binding
    bindViewMessageEvents();

    // Close modal
    document.querySelectorAll('[data-action="closeMessageModal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            modal.classList.remove('active');
        });
    });

    // Toggle important
    const importantBtn = document.querySelector('[data-action="toggleImportant"]');
    if (importantBtn) {
        importantBtn.addEventListener('click', function () {
            const btnIndex = parseInt(modal.dataset.currentBtn);
            const viewBtn = document.querySelectorAll('[data-action="viewMessage"]')[btnIndex];
            const row = viewBtn.closest('tr');
            const statusBadge = row.querySelector('.status-badge');

            if (statusBadge) {
                const isImportant = statusBadge.classList.contains('warning');

                if (isImportant) {
                    // Remove from important
                    // Restore to read/unread state based on row class
                    const isUnread = row.classList.contains('unread-row');
                    statusBadge.className = isUnread ? 'status-badge danger' : 'status-badge active';
                    statusBadge.textContent = isUnread ? 'Okunmadı' : 'Okundu';

                    this.innerHTML = '<i class="fas fa-star"></i> Önemli';
                    window.adminApp?.notifications?.showToast('Başarılı', 'Mesaj önemlilerden kaldırıldı.', 'success');
                } else {
                    // Add to important
                    statusBadge.className = 'status-badge warning';
                    statusBadge.textContent = 'Önemli';

                    this.innerHTML = '<i class="fas fa-star"></i> Önemlilerden Kaldır';
                    window.adminApp?.notifications?.showToast('Başarılı', 'Mesaj önemlilere eklendi.', 'success');
                }
            }
        });
    }

    // Mark as read
    const markReadBtn = document.querySelector('[data-action="markAsRead"]');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', function () {
            const btnIndex = parseInt(modal.dataset.currentBtn);
            const viewBtn = document.querySelectorAll('[data-action="viewMessage"]')[btnIndex];
            const row = viewBtn.closest('tr');
            const statusBadge = row.querySelector('.status-badge');

            if (statusBadge) {
                statusBadge.className = 'status-badge active';
                statusBadge.textContent = 'Okundu';
                row.classList.remove('unread-row');
            }

            modal.classList.remove('active');
        });
    }

    // Close on overlay click
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
        if (e.target === composeModal) {
            composeModal.classList.remove('active');
        }
    });



    // Validate compose form
    function validateComposeForm() {
        const recipient = document.getElementById('composeRecipient');
        const subject = document.getElementById('composeSubject');
        const content = document.getElementById('editorContent');

        let errors = [];

        if (!recipient || !recipient.value.trim()) {
            errors.push('Alıcı e-posta adresi gereklidir');
            if (recipient) recipient.style.borderColor = '#ef4444';
        } else {
            if (recipient) recipient.style.borderColor = '';
        }

        if (!subject || !subject.value.trim()) {
            errors.push('Konu gereklidir');
            if (subject) subject.style.borderColor = '#ef4444';
        } else {
            if (subject) subject.style.borderColor = '';
        }

        if (!content || !content.innerText.trim()) {
            errors.push('Mesaj içeriği gereklidir');
            if (content) content.style.borderColor = '2px solid #ef4444';
        } else {
            if (content) content.style.borderColor = '';
        }

        if (errors.length > 0) {
            window.adminApp?.notifications?.showModal('Eksik Bilgiler', '• ' + errors.join('\n• '), 'error');
            return false;
        }

        return true;
    }

    // Send message button
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', function () {
            if (validateComposeForm()) {
                // Success - send message
                window.adminApp?.notifications?.showToast('Başarılı', 'Mesaj başarıyla gönderildi!', 'success');
                composeModal.classList.remove('active');

                // Clear form
                document.getElementById('composeRecipient').value = '';
                document.getElementById('composeSubject').value = '';
                document.getElementById('editorContent').innerHTML = '';
            }
        });
    }

    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function () {
            if (validateComposeForm()) {
                // Success - save draft
                window.adminApp?.notifications?.showToast('Taslak Kaydedildi', 'Mesaj taslağa başarıyla kaydedildi!', 'success');
                composeModal.classList.remove('active');
            }
        });
    }

    // Pagination functionality
    const paginationBtns = document.querySelectorAll('.pagination-btn');

    paginationBtns.forEach((btn, index) => {
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
                console.log('Mesajlar - Sayfa:', pageNumber);

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
            updatePaginationArrows();
        });
    });

    function updatePaginationArrows() {
        const currentActive = document.querySelector('.pagination-btn.active');
        const currentPage = parseInt(currentActive?.textContent || 1);
        const allPages = Array.from(document.querySelectorAll('.pagination-btn'))
            .filter(b => !b.querySelector('i'))
            .map(b => parseInt(b.textContent));

        const minPage = Math.min(...allPages);
        const maxPage = Math.max(...allPages);

        const prevBtn = document.querySelector('.pagination-btn .fa-chevron-left')?.parentElement;
        const nextBtn = document.querySelector('.pagination-btn .fa-chevron-right')?.parentElement;

        if (prevBtn) prevBtn.disabled = currentPage <= minPage;
        if (nextBtn) nextBtn.disabled = currentPage >= maxPage;
    }

    // Initialize arrow states
    updatePaginationArrows();

    // --- File Upload System ---
    const fileUploadModal = document.getElementById('fileUploadModal');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const composeEditorContent = document.getElementById('editorContent');



    // File upload action handler
    document.querySelector('[data-action="openFileUpload"]')?.addEventListener('click', () => {
        fileUploadModal.style.display = 'flex';
        fileUploadModal.style.flexDirection = 'column';
        fileUploadModal.style.justifyContent = 'center';
        fileUploadModal.style.alignItems = 'center';
    });



    // File Upload Handlers
    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--admin-primary)';
        fileUploadArea.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = 'var(--admin-border)';
        fileUploadArea.style.background = 'transparent';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--admin-border)';
        fileUploadArea.style.background = 'transparent';

        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';

            // Left side: Icon + Name + Size
            const infoDiv = document.createElement('div');
            infoDiv.className = 'file-preview-info';

            const fileIcon = document.createElement('i');
            fileIcon.className = 'fas fa-file';
            fileIcon.style.marginRight = '10px';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            const fileSize = document.createElement('span');
            fileSize.className = 'file-preview-size';
            fileSize.textContent = `(${(file.size / 1024).toFixed(2)} KB)`;

            infoDiv.appendChild(fileIcon);
            infoDiv.appendChild(fileName);
            infoDiv.appendChild(fileSize);

            // Right side: Remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-file-btn';
            removeBtn.title = 'Dosyayı Kaldır';

            const removeIcon = document.createElement('i');
            removeIcon.className = 'fas fa-trash';

            removeBtn.appendChild(removeIcon);

            // Access to remove function
            removeBtn.addEventListener('click', () => {
                fileItem.remove();
            });

            fileItem.appendChild(infoDiv);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });
    }

    // Modal Close Handlers


    document.querySelector('[data-action="closeFileUpload"]')?.addEventListener('click', () => {
        fileUploadModal.style.display = 'none';
    });

    document.querySelector('[data-action="confirmFileUpload"]')?.addEventListener('click', () => {
        fileUploadModal.style.display = 'none';
        window.adminApp?.notifications?.showToast('Başarılı', 'Dosya başarıyla eklendi.', 'success');
    });
});



