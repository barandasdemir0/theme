let currentCommentRow = null;

function viewComment(btn) {
    try {
        currentCommentRow = btn.closest('tr');
        const row = currentCommentRow;

        const nameEl = row.querySelector('.author-wrapper strong');
        const name = nameEl ? nameEl.innerText : 'Kullanıcı';

        const messageEl = row.querySelector('.comment-text');
        const message = messageEl ? messageEl.innerText : '';

        // Date is found in the 4th column (index 3)
        let date = '';
        if (row.cells && row.cells.length > 3) {
            date = row.cells[3].innerText;
        }

        // Check if this is from pending or approved table
        let isPending = false;
        const card = row.closest('.card');
        if (card) {
            isPending = card.dataset.tableType === 'pending';
        }

        const modalName = document.getElementById('modalUserName');
        const modalMsg = document.getElementById('modalMessage');
        const modalDate = document.getElementById('modalDate');

        if (modalName) modalName.innerText = name;
        if (modalMsg) modalMsg.value = message;
        if (modalDate) modalDate.innerText = date;

        // Show/hide buttons based on status
        const approveBtn = document.getElementById('approveBtn');
        const restoreBtn = document.getElementById('restoreBtn');

        if (isPending) {
            if (approveBtn) approveBtn.classList.remove('hidden');
            if (restoreBtn) restoreBtn.classList.add('hidden');
        } else {
            if (approveBtn) approveBtn.classList.add('hidden');
            if (restoreBtn) restoreBtn.classList.remove('hidden');
        }

        // Use 'active' for admin-modal-overlay
        const modal = document.getElementById('commentModal');
        if (modal) {
            modal.classList.add('active');
            // Force layout reflow to ensure transition plays if needed, though usually automatic
            // void modal.offsetWidth; 
        } else {
            console.error('Modal element #commentModal not found!');
        }
    } catch (err) {
        console.error('Error in viewComment:', err);
    }
}

function closeCommentModal() {
    document.getElementById('commentModal').classList.remove('active');
}

function approveCurrentComment() {
    if (currentCommentRow) {
        closeCommentModal();
        const rowApproveBtn = currentCommentRow.querySelector('.action-btn[title="Onayla"]');
        if (rowApproveBtn) {
            rowApproveBtn.innerHTML = ''; // Clear existing
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-double';
            rowApproveBtn.appendChild(icon);
            rowApproveBtn.disabled = true;
        }

        setTimeout(() => {
            console.log('Yorum onaylandı');
        }, 300);
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('commentModal');

    // View/Action Handler (Delegation) - USE CAPTURE PHASE to run before ui.js
    document.body.addEventListener('click', function (e) {
        // View Comment
        const viewBtn = e.target.closest('[data-action="viewComment"]');
        if (viewBtn) {
            e.preventDefault();
            e.stopPropagation(); // Stop ui.js or others
            viewComment(viewBtn);
            return;
        }

        // Close Modal
        const closeBtn = e.target.closest('[data-action="closeModal"]');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            closeCommentModal();
            return;
        }
    }, true); // <--- capture: true

    // Approve buttons in modal
    const closeModalBtn = document.querySelector('[data-action="closeModal"]');
    const approveBtn = document.getElementById('approveBtn');
    const restoreBtn = document.getElementById('restoreBtn');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeCommentModal);
    }

    if (approveBtn) {
        approveBtn.addEventListener('click', function () {
            if (currentCommentRow) {
                const statusBadge = currentCommentRow.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge active';
                    const config = document.getElementById('guestbookConfig');
                    statusBadge.textContent = config?.dataset.textApproved || 'Onaylandı';
                }
                closeCommentModal();
                console.log('Yorum onaylandı');

                const config = document.getElementById('guestbookConfig');
                const msg = config?.dataset.msgApproved || 'Yorum onaylandı.';
                window.adminApp?.notifications?.showToast('Başarılı', msg, 'success');
            }
        });
    }

    if (restoreBtn) {
        restoreBtn.addEventListener('click', function () {
            if (currentCommentRow) {
                console.log('Yorum geri alındı');
                closeCommentModal();
            }
        });
    }

    // Pagination functionality
    const paginationBtns = document.querySelectorAll('.pagination-btn');

    paginationBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
            if (this.disabled || this.classList.contains('active')) return;

            const isNumber = !this.querySelector('i');

            if (isNumber) {
                document.querySelectorAll('.pagination-btn').forEach(b => {
                    if (!b.querySelector('i')) {
                        b.classList.remove('active');
                    }
                });

                this.classList.add('active');
                const pageNumber = parseInt(this.textContent);
                console.log('Guestbook - Sayfa:', pageNumber);

            } else {
                const currentActive = document.querySelector('.pagination-btn.active');
                const currentPage = parseInt(currentActive?.textContent || 1);
                const isNext = this.querySelector('.fa-chevron-right');

                if (isNext) {
                    const nextBtn = Array.from(paginationBtns).find(b =>
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage + 1
                    );
                    if (nextBtn) nextBtn.click();
                } else {
                    const prevBtn = Array.from(paginationBtns).find(b =>
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage - 1
                    );
                    if (prevBtn) prevBtn.click();
                }
            }

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

    updatePaginationArrows();

    // Search functionality (only for approved comments table)
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            // Only search in the second table (Onaylananlar)
            const approvedTable = document.querySelectorAll('.card')[1];
            if (approvedTable) {
                const rows = approvedTable.querySelectorAll('.admin-table tbody tr');

                rows.forEach(row => {
                    const userName = row.querySelector('strong')?.textContent.toLowerCase() || '';
                    const messageText = row.querySelector('.comment-text')?.textContent.toLowerCase() || '';

                    if (userName.includes(searchTerm) || messageText.includes(searchTerm)) {
                        row.classList.remove('hidden');
                    } else {
                        row.classList.add('hidden');
                    }
                });
            }
        });
    }
});

// Restore Item Functionality
// Restore Item Functionality - USE CAPTURE PHASE
// Restore Item Functionality - USE CAPTURE PHASE
document.body.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="restoreItem"]')) {
        const btn = e.target.closest('[data-action="restoreItem"]');

        // Priority handling: Stop propagation immediately to prevent ui.js
        e.preventDefault();
        e.stopPropagation();

        const row = btn.closest('tr');
        const itemName = row.querySelector('.author-wrapper strong').textContent;

        // Static Restore Modal
        const modal = document.getElementById('restoreModal');
        const itemNameSpan = document.getElementById('restoreItemName');
        const confirmBtn = document.getElementById('confirmRestore');
        const cancelBtn = document.getElementById('cancelRestore');

        if (modal && itemNameSpan) {
            itemNameSpan.textContent = itemName;
            modal.classList.add('active');

            const closeModal = () => {
                modal.classList.remove('active');
            };

            cancelBtn.onclick = closeModal;
            modal.onclick = (e) => { if (e.target === modal) closeModal(); };

            // Confirm Logic
            confirmBtn.onclick = function () {
                // Restore Action
                row.classList.remove('deleted-item');

                // Determine if it's Pending or Approved table
                // Determine if it's Pending or Approved table
                const card = row.closest('.card');
                const isPendingTable = card && card.dataset.tableType === 'pending';

                // Find Visibility Badge (5th column -> index 4)
                const cells = row.querySelectorAll('td');
                const visibilityCell = cells[4];

                if (visibilityCell) {
                    const badge = visibilityCell.querySelector('.status-badge');
                    const config = document.getElementById('guestbookConfig');
                    if (badge) {
                        if (isPendingTable) {
                            badge.className = 'status-badge draft';
                            badge.textContent = config?.dataset.textHidden || 'Gizli';
                        } else {
                            badge.className = 'status-badge active';
                            badge.textContent = config?.dataset.textActive || 'Sitede Aktif';
                        }
                    }
                }

                // Also reset Status Badge purely visual if it was affected
                const statusCell = cells[2];
                if (statusCell) {
                    const statusBadge = statusCell.querySelector('.status-badge');
                    if (statusBadge && statusBadge.classList.contains('danger')) { // If it was 'Reddedildi' or similar
                        const config = document.getElementById('guestbookConfig');
                        if (isPendingTable) {
                            statusBadge.className = 'status-badge draft';
                            statusBadge.textContent = config?.dataset.textPending || 'Onay Bekliyor';
                        } else {
                            statusBadge.className = 'status-badge active';
                            statusBadge.textContent = config?.dataset.textApproved || 'Onaylandı';
                        }
                    }
                }

                // Rebuild Action Buttons to ensure clean state
                const actionsDiv = row.querySelector('.action-btns');
                if (actionsDiv) {
                    // Remove Restore Button
                    const restoreBtn = actionsDiv.querySelector('.restore');
                    if (restoreBtn) restoreBtn.remove();

                    // Check if Delete button exists, if not create it
                    if (!actionsDiv.querySelector('.delete')) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'action-btn delete';

                        const icon = document.createElement('i');

                        const config = document.getElementById('guestbookConfig');

                        if (isPendingTable) {
                            deleteBtn.title = config?.dataset.textRejectAction || 'Reddet';
                            icon.className = 'fas fa-times';
                        } else {
                            deleteBtn.title = config?.dataset.textDeleteAction || 'Sil';
                            icon.className = 'fas fa-trash';
                        }

                        deleteBtn.appendChild(icon);
                        actionsDiv.appendChild(deleteBtn);
                    }
                }

                closeModal();

                // Optional: Show Admin Notification
                if (window.adminApp && window.adminApp.notifications) {
                    const config = document.getElementById('guestbookConfig');
                    const msg = config?.dataset.msgRestored || 'Yorum geri yüklendi.';
                    window.adminApp.notifications.showToast('Başarılı', msg, 'success');
                }
            };
        }
    }
}, true);

// Delete Item Functionality - USE CAPTURE PHASE
document.body.addEventListener('click', function (e) {
    // Check for both 'delete' class and 'action-btn' class to be sure, or the specific delete title
    // But ui.js uses .action-btn.delete, let's match that.
    const btn = e.target.closest('.action-btn.delete');
    if (btn) {
        // Only run if we are inside guestbook table (safety check, though this file is only included in guestbook usually?)
        e.preventDefault();
        e.stopPropagation();

        const row = btn.closest('tr');
        if (!row) return;

        const itemName = row.querySelector('.author-wrapper strong')?.textContent || 'Bu öğe';

        // Static Delete Modal
        const modal = document.getElementById('deleteConfirmModal');
        const itemNameSpan = document.getElementById('deleteItemName');
        const confirmBtn = document.getElementById('confirmDelete');
        const cancelBtn = document.getElementById('cancelDelete');

        if (modal && itemNameSpan) {
            itemNameSpan.textContent = itemName;
            modal.classList.add('active');

            const closeModal = () => {
                modal.classList.remove('active');
            };

            cancelBtn.onclick = closeModal;
            modal.onclick = (e) => { if (e.target === modal) closeModal(); };

            confirmBtn.onclick = () => {
                // 1. Visual Update
                row.classList.add('deleted-item');

                // 2. Badge Update
                // Try to find status/visibility badges.
                const badges = row.querySelectorAll('.status-badge');
                badges.forEach(b => {
                    // Save original state if needed? For now just mark as deleted.
                    if (b.classList.contains('active') || b.classList.contains('draft')) {
                        const config = document.getElementById('guestbookConfig');
                        b.className = 'status-badge danger';
                        b.textContent = config?.dataset.textDeleted || 'Silindi';
                    }
                });

                // 3. Rebuild Actions with Restore Button
                const actionsDiv = row.querySelector('.action-btns');
                if (actionsDiv) {
                    // Remove Delete Button
                    const deleteBtn = actionsDiv.querySelector('.delete');
                    if (deleteBtn) deleteBtn.remove();

                    if (!actionsDiv.querySelector('.restore')) {
                        const config = document.getElementById('guestbookConfig');
                        const restoreBtn = document.createElement('button');
                        restoreBtn.className = 'action-btn restore';
                        restoreBtn.title = config?.dataset.textRestoreAction || 'Geri Yükle';
                        restoreBtn.dataset.action = 'restoreItem';

                        const icon = document.createElement('i');
                        icon.className = 'fas fa-undo';
                        restoreBtn.appendChild(icon);

                        actionsDiv.appendChild(restoreBtn);
                    }
                }

                closeModal();
                closeModal();
                const config = document.getElementById('guestbookConfig');
                const msg = config?.dataset.msgDeleted || 'Öğe silindi.';
                window.adminApp?.notifications?.showToast('Bilgi', msg, 'info');
            };
        }
    }
}, true); // <--- capture: true


