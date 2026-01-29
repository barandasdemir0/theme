// About page functionality
document.addEventListener('DOMContentLoaded', function () {
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profileImage = document.getElementById('profileImage');
    const photoUrlModal = document.getElementById('photoUrlModal');
    const removePhotoModal = document.getElementById('removePhotoModal');
    const photoUrlInput = document.getElementById('photoUrlInput');

    // Trigger file input when clicking on preview or upload button
    const triggerUploadButtons = document.querySelectorAll('[data-action="triggerProfilePhotoUpload"]');
    triggerUploadButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            profilePhotoInput.click();
        });
    });

    // Handle file selection
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        profileImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    const config = document.getElementById('aboutConfig');
                    alert(config?.dataset.msgSelectImage || 'Lütfen bir resim dosyası seçin (PNG, JPG, vb.)');
                }
            }
        });
    }

    // Show Photo URL Modal
    const showUrlModalBtn = document.querySelector('[data-action="showPhotoUrlModal"]');
    if (showUrlModalBtn) {
        showUrlModalBtn.addEventListener('click', function () {
            photoUrlInput.value = '';
            photoUrlModal.classList.add('active');
        });
    }

    // Close Photo URL Modal
    const closeUrlModalBtn = document.querySelector('[data-action="closePhotoUrlModal"]');
    if (closeUrlModalBtn) {
        closeUrlModalBtn.addEventListener('click', function () {
            photoUrlModal.classList.remove('active');
        });
    }

    // Confirm Photo URL
    const confirmUrlBtn = document.querySelector('[data-action="confirmPhotoUrl"]');
    if (confirmUrlBtn) {
        confirmUrlBtn.addEventListener('click', function () {
            const url = photoUrlInput.value.trim();
            if (url) {
                profileImage.src = url;
                photoUrlModal.classList.remove('active');
                if (window.adminApp && window.adminApp.notifications) {
                    const config = document.getElementById('aboutConfig');
                    window.adminApp.notifications.showToast(window.I18N?.common?.success || 'Başarılı', config?.dataset.msgPhotoUpdated || 'Profil fotoğrafı güncellendi.', 'success');
                }
            } else {
                if (window.adminApp && window.adminApp.notifications) {
                    const config = document.getElementById('aboutConfig');
                    window.adminApp.notifications.showToast(window.I18N?.common?.error || 'Hata', config?.dataset.msgEnterUrl || 'Lütfen geçerli bir URL girin.', 'error');
                } else {
                    const config = document.getElementById('aboutConfig');
                    alert(config?.dataset.msgEnterUrl || 'Lütfen geçerli bir URL girin.');
                }
            }
        });
    }

    // Show remove photo modal
    const removePhotoBtn = document.querySelector('[data-action="removeProfilePhoto"]');
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function () {
            removePhotoModal.classList.add('active');
        });
    }

    // Close remove photo modal
    const closeRemoveModalBtn = document.querySelector('[data-action="closeRemovePhotoModal"]');
    if (closeRemoveModalBtn) {
        closeRemoveModalBtn.addEventListener('click', function () {
            removePhotoModal.classList.remove('active');
        });
    }

    // Confirm remove photo
    const confirmRemoveBtn = document.querySelector('[data-action="confirmRemovePhoto"]');
    if (confirmRemoveBtn) {
        confirmRemoveBtn.addEventListener('click', function () {
            profileImage.src = 'https://ui-avatars.com/api/?name=Baran+D&background=6366f1&color=fff&size=140';
            removePhotoModal.classList.remove('active');
            if (window.adminApp && window.adminApp.notifications) {
                const config = document.getElementById('aboutConfig');
                window.adminApp.notifications.showToast(window.I18N?.common?.success || 'Başarılı', config?.dataset.msgPhotoRemoved || 'Profil fotoğrafı kaldırıldı.', 'success');
            }
        });
    }
});
