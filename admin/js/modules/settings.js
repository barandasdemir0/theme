// Settings page functionality
document.addEventListener('DOMContentLoaded', function () {
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');

    // Handle all save button actions
    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            handleActionButton(this);
        });
    });

    // Handle modal close button
    const alertCloseBtn = document.getElementById('alertCloseBtn');
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', closeAlert);
    }

    // Handle download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const fileName = this.closest('.file-row').querySelector('.file-input').value;
            downloadFile(fileName);
        });
    });

    function handleActionButton(button) {
        const icon = button.querySelector('i');
        const originalIconClass = icon ? icon.className : '';
        const action = button.getAttribute('data-action');

        if (icon) {
            icon.className = 'fas fa-spinner fa-spin';
        }

        setTimeout(() => {
            if (icon) {
                icon.className = originalIconClass;
            }

            if (action === 'saveStatus') {
                const textarea = button.closest('form').querySelector('textarea');
                const selectedColor = button.closest('form').querySelector('input[name="statusColor"]:checked').value;
                const config = document.getElementById('settingsConfig');
                const prefix = config?.dataset.msgStatusUpdatedPrefix || 'Durum';
                const suffix = config?.dataset.msgStatusUpdatedSuffix || 'olarak güncellendi:';
                showCustomAlert(`${prefix} "${selectedColor}" ${suffix} "${textarea.value}"`);
            } else if (action === 'saveCV') {
                const config = document.getElementById('settingsConfig');
                showCustomAlert(config?.dataset.msgCvUpdated || 'CV dosyaları başarıyla güncellendi.');
            } else {
                const config = document.getElementById('settingsConfig');
                showCustomAlert(config?.dataset.msgSettingsSaved || 'Ayarlar başarıyla kaydedildi.');
            }
        }, 800);
    }

    function showCustomAlert(msg) {
        alertMessage.textContent = msg;
        alertModal.classList.add('visible');
    }

    function closeAlert() {
        alertModal.classList.remove('visible');
    }

    function downloadFile(fileName) {
        // Create a fake download link
        const link = document.createElement('a');

        // For demo purposes, create a blob with dummy PDF content
        const dummyPdf = new Blob(
            ["%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(" + fileName.replace('.pdf', '') + ") Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000228 00000 n\n0000000312 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n401\n%%EOF"],
            { type: 'application/pdf' }
        );

        link.href = URL.createObjectURL(dummyPdf);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        const config = document.getElementById('settingsConfig');
        const suffix = config?.dataset.msgDownloaded || 'indirildi!';
        showCustomAlert(`"${fileName}" ${suffix}`);
    }

    // Status color selector
    const statusRadios = document.querySelectorAll('input[name="statusColor"]');
    statusRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            console.log('Status changed to:', this.value);
        });
    });
});

