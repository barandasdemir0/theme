// Categories Module - Static DOM Manipulation

let editingItem = null;

const categoryList = document.getElementById('categoryList');
const categoryForm = document.getElementById('categoryForm');
const categoryFormTitle = document.getElementById('categoryFormTitle');
const categoryName = document.getElementById('categoryName');
const addBtn = document.getElementById('addCategoryBtn');
const cancelBtn = document.getElementById('cancelCategoryBtn');
const formInner = document.getElementById('categoryFormInner');

// Helper to show/hide form
// Helper to show/hide form
function showForm(title) {
    const config = document.getElementById('categoriesConfig');
    categoryFormTitle.textContent = title || config?.dataset.textNew || 'Yeni Kategori Ekle';
    categoryForm.classList.add('visible');
    categoryName.focus();
    categoryForm.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    categoryForm.classList.remove('visible');
    categoryName.value = '';
    editingItem = null;
}

// Global functions for inline onclicks (now passing element 'this')
// Event Delegation for Category List
categoryList.addEventListener('click', (e) => {
    const btn = e.target.closest('.action-btn');
    if (!btn) return;

    // Edit
    if (!btn.classList.contains('delete') && !btn.classList.contains('restore')) {
        handleEditCategory(btn);
        return;
    }

    // Delete
    if (btn.classList.contains('delete')) {
        handleDeleteCategory(btn);
        return;
    }

    // Restore
    if (btn.classList.contains('restore')) {
        handleRestoreCategory(btn);
        return;
    }
});

function handleEditCategory(btn) {
    const item = btn.closest('.category-item');
    const nameEl = item.querySelector('.category-name');

    editingItem = item;
    categoryName.value = nameEl.textContent.trim();
    const config = document.getElementById('categoriesConfig');
    showForm(config?.dataset.textEdit || 'Kategoriyi Düzenle');
}

function handleDeleteCategory(btn) {
    const item = btn.closest('.category-item');

    // Use notification system if available
    const config = document.getElementById('categoriesConfig');
    if (window.adminApp && window.adminApp.notifications) {
        window.adminApp.notifications.showModal(
            config?.dataset.msgDeleteTitle || 'Silme İşlemi',
            config?.dataset.msgDeleteBody || 'Bu kategoriyi silmek istediğinizden emin misiniz?',
            () => {
                performDelete(item, btn);
            }
        );
    } else {
        if (confirm(config?.dataset.msgDeleteConfirm || 'Silmek istediğinize emin misiniz?')) {
            performDelete(item, btn);
        }
    }
};

function performDelete(item, btn) {
    item.classList.add('deleted-item');

    // Update Badge
    const badge = item.querySelector('.status-badge');
    if (badge) {
        const config = document.getElementById('categoriesConfig');
        badge.className = 'status-badge danger';
        badge.textContent = config?.dataset.textDeleted || 'Silindi';
    }

    // Toggle button visibility (hide Delete, show Restore)
    const actionsDiv = item.querySelector('.category-actions');
    if (actionsDiv) {
        const deleteBtn = actionsDiv.querySelector('.action-btn.delete');
        const restoreBtn = actionsDiv.querySelector('.action-btn.restore');
        if (deleteBtn) deleteBtn.classList.add('hidden');
        if (restoreBtn) restoreBtn.classList.remove('hidden');
    }

    if (window.adminApp && window.adminApp.notifications) {
        const config = document.getElementById('categoriesConfig');
        const msg = config?.dataset.msgDeleted || 'Kategori silindi (Arşivlendi).';
        window.adminApp.notifications.showToast('Başarılı', msg, 'warning');
    }
}

function handleRestoreCategory(btn) {
    const item = btn.closest('.category-item');

    // Restore Action
    item.classList.remove('deleted-item');

    // Update Badge
    const badge = item.querySelector('.status-badge');
    if (badge) {
        const config = document.getElementById('categoriesConfig');
        badge.className = 'status-badge active';
        badge.textContent = config?.dataset.textActive || 'Sitede Aktif';
    }

    // Toggle button visibility (show Delete, hide Restore)
    const actionsDiv = item.querySelector('.category-actions');
    if (actionsDiv) {
        const deleteBtn = actionsDiv.querySelector('.action-btn.delete');
        const restoreBtn = actionsDiv.querySelector('.action-btn.restore');
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        if (restoreBtn) restoreBtn.classList.add('hidden');
    }

    if (window.adminApp && window.adminApp.notifications) {
        const config = document.getElementById('categoriesConfig');
        const msg = config?.dataset.msgRestored || 'Kategori geri yüklendi.';
        window.adminApp.notifications.showToast('Başarılı', msg, 'success');
    }
};

addBtn.addEventListener('click', () => {
    editingItem = null;
    showForm();
});

cancelBtn.addEventListener('click', hideForm);

formInner.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = categoryName.value.trim();
    if (!name) return;

    if (editingItem) {
        // Update existing
        editingItem.querySelector('.category-name').textContent = name;
        if (window.adminApp && window.adminApp.notifications) {
            const config = document.getElementById('categoriesConfig');
            const msg = config?.dataset.msgUpdated || 'Kategori güncellendi.';
            window.adminApp.notifications.showToast('Başarılı', msg, 'success');
        }
    } else {
        // Create new
        const template = document.getElementById('categoryItemTemplate');
        const newItem = template.content.cloneNode(true).firstElementChild;

        newItem.querySelector('.category-name').textContent = name;

        // Remove empty state if exists
        const emptyState = categoryList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        categoryList.appendChild(newItem);
        if (window.adminApp && window.adminApp.notifications) {
            const config = document.getElementById('categoriesConfig');
            const msg = config?.dataset.msgAdded || 'Kategori eklendi.';
            window.adminApp.notifications.showToast('Başarılı', msg, 'success');
        }
    }

    hideForm();
});


