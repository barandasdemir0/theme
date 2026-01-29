// Blog Pagination
document.addEventListener('DOMContentLoaded', function () {
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
                console.log('Blog - Sayfa:', pageNumber);

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
});

// Delete Row Functionality
document.addEventListener('click', function (e) {
    const deleteBtn = e.target.closest('[data-action="deleteRow"]');
    if (deleteBtn) {
        e.preventDefault();
        const row = deleteBtn.closest('tr');
        const itemName = row.querySelector('td:first-child strong')?.textContent || 'Bu öğe';
        const config = document.getElementById('blogConfig');

        if (window.adminApp && window.adminApp.notifications) {
            window.adminApp.notifications.showModal(
                'Silme Onayı',
                `"${itemName}" öğesini silmek istediğinize emin misiniz? <br><small>Bu işlem geri alınabilir (soft delete).</small>`,
                () => {
                    // Mark as deleted
                    row.classList.add('deleted-item');

                    // Update visibility badge
                    const cells = row.querySelectorAll('td');
                    if (cells[3]) {
                        const deletedText = config?.dataset.textDeleted || 'Silindi';
                        cells[3].innerHTML = `<span class="status-badge danger">${deletedText}</span>`;
                    }

                    // Toggle buttons (hide Delete, show Restore)
                    const actionCell = row.querySelector('.action-btns');
                    if (actionCell) {
                        const deleteBtn = actionCell.querySelector('.action-btn.delete');
                        const restoreBtn = actionCell.querySelector('.action-btn.restore');
                        if (deleteBtn) deleteBtn.classList.add('hidden');
                        if (restoreBtn) restoreBtn.classList.remove('hidden');
                    }

                    window.adminApp.notifications.showToast('Uyarı', 'Öğe silindi (Arşivlendi)!', 'warning');
                },
                'danger'
            );
        } else {
            if (confirm(`"${itemName}" silinsin mi?`)) {
                row.remove();
            }
        }
    }
});

// Restore Row Functionality
document.addEventListener('click', function (e) {
    const restoreBtn = e.target.closest('[data-action="restoreRow"]');
    if (restoreBtn) {
        e.preventDefault();
        const row = restoreBtn.closest('tr');

        // Remove deleted class
        row.classList.remove('deleted-item');

        // Update visibility badge
        const config = document.getElementById('blogConfig');
        const cells = row.querySelectorAll('td');
        if (cells[3]) {
            const activeText = config?.dataset.textActive || 'Sitede Aktif';
            cells[3].innerHTML = `<span class="status-badge active">${activeText}</span>`;
        }

        // Toggle buttons (show Delete, hide Restore)
        const actionCell = row.querySelector('.action-btns');
        if (actionCell) {
            const deleteBtn = actionCell.querySelector('.action-btn.delete');
            const restoreBtnEl = actionCell.querySelector('.action-btn.restore');
            if (deleteBtn) deleteBtn.classList.remove('hidden');
            if (restoreBtnEl) restoreBtnEl.classList.add('hidden');
        }

        // Show notification
        if (window.adminApp && window.adminApp.notifications) {
            const msg = config?.dataset.msgRestored || 'Öğe başarıyla geri yüklendi.';
            window.adminApp.notifications.showToast('Başarılı', msg, 'success');
        }
    }
});
