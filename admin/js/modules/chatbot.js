// Toggle API Key Visibility
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('apiKeyToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleApiKeyVisibility);
    }
});

function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const icon = document.getElementById('apiKeyIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Save handlers
document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', function () {
        const icon = this.querySelector('i');
        const originalIconClass = icon ? icon.className : '';
        if (icon) icon.className = 'fas fa-spinner fa-spin';

        setTimeout(() => {
            if (icon) icon.className = originalIconClass;

            // Use standard notification system
            if (window.adminApp && window.adminApp.notifications) {
                const config = document.getElementById('chatbotConfig');
                const title = config?.dataset.msgSavedTitle || 'Başarılı';
                const body = config?.dataset.msgSavedBody || 'Ayarlar başarıyla kaydedildi.';
                window.adminApp.notifications.showToast(title, body, 'success');
            } else {
                console.log('Ayarlar kaydedildi');
            }
        }, 800);
    });
});
