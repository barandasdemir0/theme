// Projects page functionality
document.addEventListener('DOMContentLoaded', function () {
    const projectForm = document.getElementById('projectForm');
    const projectFontSizeSelect = document.getElementById('projectFontSizeSelect');

    // Show form button
    const showFormBtns = document.querySelectorAll('[data-action="showForm"]');
    showFormBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            projectForm.classList.add('visible');
        });
    });

    // Hide form button
    const hideFormBtns = document.querySelectorAll('[data-action="hideForm"]');
    hideFormBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            projectForm.classList.remove('visible');
        });
    });

    // Font size selection for editor
    if (projectFontSizeSelect) {
        projectFontSizeSelect.addEventListener('change', function () {
            const editor = document.getElementById('projectEditor');
            if (editor) {
                editor.focus();
                document.execCommand('fontSize', false, this.value);
            }
        });
    }

    // Text color picker
    const textColorPicker = document.getElementById('projectTextColorPicker');
    if (textColorPicker) {
        textColorPicker.addEventListener('change', function () {
            // Keep dynamic indicator color as inline style is necessary here
            document.getElementById('projectTextColorIndicator').style.background = this.value;
            const editor = document.getElementById('projectEditor');
            if (editor) editor.focus();
            document.execCommand('foreColor', false, this.value);
        });
    }

    // Background color picker
    const bgColorPicker = document.getElementById('projectBgColorPicker');
    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', function () {
            const editor = document.getElementById('projectEditor');
            if (editor) editor.focus();
            document.execCommand('backColor', false, this.value);
        });
    }

    // Preview project
    const previewBtns = document.querySelectorAll('[data-action="previewProject"]');
    previewBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const config = document.getElementById('projectsConfig');
            alert(config?.dataset.msgPreview || 'Proje önizlemesi burada gösterilecektir');
        });
    });

    // Add tag input handler
    const tagInput = document.querySelector('[data-action="addTag"]');
    if (tagInput) {
        tagInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addProjectTag(event);
            }
        });
    }
});

// Add project tag from input
function addProjectTag(event) {
    const input = event.target;
    const value = input.value.trim();

    if (value) {
        const container = input.parentElement;
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = value + ' ×';

        tag.addEventListener('click', function () {
            tag.remove();
        });

        container.insertBefore(tag, input);
        input.value = '';
    }
}

// Pagination functionality for projects
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
                console.log('Projeler - Sayfa:', pageNumber);

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
// Restore Item Functionality
// Restore Item Functionality
document.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="restoreItem"]')) {
        const btn = e.target.closest('[data-action="restoreItem"]');
        const row = btn.closest('tr');
        const itemName = row.querySelector('td[data-label="Proje Adı"] strong').textContent;

        // Static Restore Modal Logic
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

            confirmBtn.onclick = function () {
                // Restore Action
                row.classList.remove('deleted-item');
                const visibilityCell = row.querySelector('td[data-label="Görünürlük"]');
                if (visibilityCell) {
                    const badge = visibilityCell.querySelector('.status-badge');
                    if (badge) {
                        const config = document.getElementById('projectsConfig');
                        badge.className = 'status-badge active';
                        badge.textContent = config?.dataset.textActive || 'Sitede Aktif';
                    }
                }

                // Remove restore button
                btn.remove();

                // Add Delete button back
                const actionsDiv = row.querySelector('.action-btns');
                if (actionsDiv && !actionsDiv.querySelector('.delete')) {
                    const config = document.getElementById('projectsConfig');
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'action-btn delete';
                    deleteBtn.title = config?.dataset.textDelete || 'Sil';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    actionsDiv.appendChild(deleteBtn);
                }

                closeModal();

                if (window.adminApp && window.adminApp.notifications) {
                    const config = document.getElementById('projectsConfig');
                    const msg = config?.dataset.msgRestored || 'Öğe başarıyla geri yüklendi.';
                    window.adminApp.notifications.showToast('Başarılı', msg, 'success');
                }
            };
        }
    }
});
