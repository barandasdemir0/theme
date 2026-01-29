// Skills page functionality
document.addEventListener('DOMContentLoaded', function () {
    let selectedSkillElement = null;

    // Get all modal elements
    const skillModal = document.getElementById('skillModal');
    const skillOptionsModal = document.getElementById('skillOptionsModal');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const alertModal = document.getElementById('alertModal');

    const addSkillForm = document.getElementById('addSkillForm');
    const skillNameInput = document.getElementById('skillNameInput');
    const skillModalTitle = document.getElementById('skillModalTitle');
    const iconInputGroup = document.getElementById('iconInputGroup');
    const imageInputGroup = document.getElementById('imageInputGroup');
    const iconClassInput = document.getElementById('iconClassInput');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const selectedSkillName = document.getElementById('selectedSkillName');
    const alertMessage = document.getElementById('alertMessage');
    const techStackGrid = document.getElementById('techStackGrid');
    const deleteConfirmText = document.getElementById('deleteConfirmText');

    // Bind tech items to open options modal
    bindTechItemClicks();

    // Add Skill button
    const addSkillBtn = document.querySelector('[data-action="addSkill"]');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', showAddSkillModal);
    }

    // Modal control buttons
    document.querySelectorAll('[data-action="closeSkillModal"]').forEach(btn => {
        btn.addEventListener('click', closeSkillModal);
    });

    document.querySelectorAll('[data-action="saveSkill"]').forEach(btn => {
        btn.addEventListener('click', saveSkill);
    });

    document.querySelectorAll('[data-action="closeSkillOptionsModal"]').forEach(btn => {
        btn.addEventListener('click', closeSkillOptionsModal);
    });

    document.querySelectorAll('[data-action="editSkill"]').forEach(btn => {
        btn.addEventListener('click', editSelectedSkill);
    });

    document.querySelectorAll('[data-action="deleteSkill"]').forEach(btn => {
        btn.addEventListener('click', deleteSelectedSkill);
    });

    document.querySelectorAll('[data-action="closeDeleteConfirm"]').forEach(btn => {
        btn.addEventListener('click', closeDeleteConfirmModal);
    });

    document.querySelectorAll('[data-action="confirmDelete"]').forEach(btn => {
        btn.addEventListener('click', confirmDeleteSkill);
    });

    document.querySelectorAll('[data-action="closeAlert"]').forEach(btn => {
        btn.addEventListener('click', closeAlert);
    });

    // Icon type radio buttons
    const iconTypeRadios = document.querySelectorAll('input[name="iconType"]');
    iconTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            toggleIconInput(this.value);
        });
    });

    // Public functions

    function showAddSkillModal() {
        const config = document.getElementById('skillsConfig');
        skillModalTitle.textContent = config?.dataset.textAdd || "Yeni Yetenek Ekle";
        addSkillForm.reset();
        toggleIconInput('icon');
        selectedSkillElement = null;
        skillModal.classList.add('visible');
    }

    function closeSkillModal() {
        skillModal.classList.remove('visible');
    }

    function toggleIconInput(type) {
        if (type === 'icon') {
            iconInputGroup.style.display = 'block';
            imageInputGroup.style.display = 'none';
        } else {
            iconInputGroup.style.display = 'none';
            imageInputGroup.style.display = 'block';
        }
    }

    function openSkillOptions(element, skillName) {
        selectedSkillElement = element;
        if (!skillName) {
            skillName = element.querySelector('span').textContent;
        }
        selectedSkillName.textContent = skillName;
        skillOptionsModal.classList.add('visible');
    }

    function closeSkillOptionsModal() {
        skillOptionsModal.classList.remove('visible');
    }

    function deleteSelectedSkill() {
        if (selectedSkillElement) {
            const config = document.getElementById('skillsConfig');
            const skillName = selectedSkillName.textContent;
            const suffix = config?.dataset.msgDeleteConfirmSuffix || "silinsin mi?";
            deleteConfirmText.textContent = `${skillName} ${suffix}`;
            skillOptionsModal.classList.remove('visible');
            deleteConfirmModal.classList.add('visible');
        }
    }

    function closeDeleteConfirmModal() {
        deleteConfirmModal.classList.remove('visible');
        selectedSkillElement = null;
    }

    function confirmDeleteSkill() {
        if (selectedSkillElement) {
            selectedSkillElement.remove();
            closeDeleteConfirmModal();
        }
    }

    function editSelectedSkill() {
        if (selectedSkillElement) {
            const config = document.getElementById('skillsConfig');
            const name = selectedSkillName.textContent;
            skillModalTitle.textContent = config?.dataset.textEdit || "Yetenek Düzenle";
            skillNameInput.value = name;

            const img = selectedSkillElement.querySelector('img');
            const i = selectedSkillElement.querySelector('i');

            if (img) {
                toggleIconInput('image');
                document.querySelector('input[name="iconType"][value="image"]').checked = true;
                imageUrlInput.value = img.src;
            } else if (i) {
                toggleIconInput('icon');
                document.querySelector('input[name="iconType"][value="icon"]').checked = true;
                iconClassInput.value = i.className;
            }

            // Set Display Order
            const displayOrderInput = document.getElementById('displayOrderInput');
            if (displayOrderInput) {
                displayOrderInput.value = selectedSkillElement.dataset.order || '0';
            }

            skillModal.classList.add('visible');
            skillOptionsModal.classList.remove('visible');
        }
    }

    function saveSkill() {
        const name = skillNameInput.value.trim();
        if (!name) {
            const config = document.getElementById('skillsConfig');
            showCustomAlert(config?.dataset.msgEnterName || 'Lütfen bir isim girin.');
            return;
        }

        const displayOrderInput = document.getElementById('displayOrderInput');
        const displayOrder = displayOrderInput ? displayOrderInput.value : '0';

        const type = document.querySelector('input[name="iconType"]:checked').value;
        let iconHtml = '';
        if (type === 'icon') {
            const iconClass = iconClassInput.value.trim() || 'fas fa-code';
            iconHtml = `<i class="${iconClass}"></i>`;
        } else {
            const imgUrl = imageUrlInput.value.trim() || 'https://via.placeholder.com/48';
            iconHtml = `<img src="${imgUrl}" alt="${name}">`;
        }

        const config = document.getElementById('skillsConfig');
        const editTitle = config?.dataset.textEdit || "Yetenek Düzenle";
        if (selectedSkillElement && skillModalTitle.textContent === editTitle) {
            // Edit existing
            selectedSkillElement.innerHTML = `
                ${iconHtml}
                <span>${name}</span>
            `;
            selectedSkillElement.setAttribute('data-skill-name', name);
            selectedSkillElement.setAttribute('data-order', displayOrder);
            bindTechItemClicks();
        } else {
            // Add new
            const newItem = document.createElement('div');
            newItem.className = 'tech-item';
            newItem.setAttribute('data-skill-name', name);
            newItem.setAttribute('data-order', displayOrder);
            newItem.innerHTML = `
                ${iconHtml}
                <span>${name}</span>
            `;
            techStackGrid.appendChild(newItem);

            newItem.addEventListener('click', function () {
                openSkillOptions(this, name);
            });
        }

        closeSkillModal();
    }

    function showCustomAlert(msg) {
        alertMessage.textContent = msg;
        alertModal.classList.add('visible');
    }

    function closeAlert() {
        alertModal.classList.remove('visible');
    }

    function bindTechItemClicks() {
        const techItems = document.querySelectorAll('.tech-item');
        techItems.forEach(item => {
            // Remove old listeners by cloning
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', function () {
                const skillName = this.getAttribute('data-skill-name') || this.querySelector('span').textContent;
                openSkillOptions(this, skillName);
            });
        });
    }

    // Expose public API
    window.showAddSkillModal = showAddSkillModal;
    window.closeSkillModal = closeSkillModal;
    window.toggleIconInput = toggleIconInput;
    window.openSkillOptions = openSkillOptions;
    window.closeSkillOptionsModal = closeSkillOptionsModal;
    window.deleteSelectedSkill = deleteSelectedSkill;
    window.closeDeleteConfirmModal = closeDeleteConfirmModal;
    window.confirmDeleteSkill = confirmDeleteSkill;
    window.editSelectedSkill = editSelectedSkill;
    window.saveSkill = saveSkill;
    window.showCustomAlert = showCustomAlert;
});
