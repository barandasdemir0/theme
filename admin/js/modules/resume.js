/**
 * Resume Page Script
 * Handles work experience, education, and certificates management
 */

// Helper to show notifications using the global AdminApp instance
function showNotification(message, type = 'info') {
    if (window.adminApp && window.adminApp.notifications) {
        const config = document.getElementById('resumeConfig');
        let title = config?.dataset.titleInfo || 'Bilgi';
        if (type === 'success') title = config?.dataset.titleSuccess || 'Başarılı';
        if (type === 'warning') title = config?.dataset.titleWarning || 'Uyarı';
        if (type === 'error' || type === 'danger') title = config?.dataset.titleError || 'Hata';

        window.adminApp.notifications.showToast(title, message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const experienceForm = document.getElementById('experienceForm');
    const experienceType = document.getElementById('experienceType');
    let editingRow = null;

    // Show experience form
    document.addEventListener('click', function (e) {
        // ... (existing showExperienceForm logic is fine) ...
        const btn = e.target.closest('[data-action="showExperienceForm"]');
        if (btn) {
            e.preventDefault();
            editingRow = null;
            const type = btn.getAttribute('data-type') || 'İş Deneyimi';
            experienceType.value = type;
            experienceForm.classList.add('visible'); // Use class for visibility
            experienceForm.style.display = 'flex'; // Ensure flex for centering

            const form = experienceForm.querySelector('form');
            form.reset();

            // Dynamic Label Updating
            const positionLabel = experienceForm.querySelector('label:nth-of-type(1)'); // This selector might be fragile, better to use IDs or specific selectors
            // Let's use more robust selection if possible, or assume structure matches HTML
            const labels = experienceForm.querySelectorAll('label');
            const positionLabelEl = Array.from(labels).find(l => l.textContent.includes('Pozisyon'));
            const companyLabelEl = Array.from(labels).find(l => l.textContent.includes('Şirket'));

            if (positionLabelEl && companyLabelEl) {
                if (type === 'Eğitim') {
                    positionLabelEl.textContent = 'Bölüm *';
                    companyLabelEl.textContent = 'Okul *';
                } else if (type === 'Sertifika') {
                    positionLabelEl.textContent = 'Sertifika Adı *';
                    companyLabelEl.textContent = 'Kurum *';
                } else {
                    positionLabelEl.textContent = 'Pozisyon / Bölüm *';
                    companyLabelEl.textContent = 'Şirket / Okul / Kurum *';
                }
            }
        }

        // Hide experience form
        const hideBtn = e.target.closest('[data-action="hideExperienceForm"]');
        if (hideBtn) {
            e.preventDefault();
            experienceForm.classList.remove('visible');
            experienceForm.style.display = 'none';
            editingRow = null;
        }

        // Close modal when clicking outside
        if (e.target === experienceForm) {
            experienceForm.classList.remove('visible');
            experienceForm.style.display = 'none';
            editingRow = null;
        }

        // Edit row
        const editBtn = e.target.closest('[data-action="editRow"]');
        if (editBtn) {
            e.preventDefault();
            const row = editBtn.closest('tr');
            editingRow = row;

            const table = row.closest('table');
            const headers = table.querySelectorAll('thead th');
            const cells = row.querySelectorAll('td');

            // Get form inputs
            const positionInput = experienceForm.querySelector('input[placeholder*="Full Stack Developer"]');
            const companyInput = experienceForm.querySelector('input[placeholder*="TechCorp"]');
            const locationInput = experienceForm.querySelector('input[placeholder*="İstanbul"]');
            const startDateInput = experienceForm.querySelector('input[type="month"]');
            const endDateInput = experienceForm.querySelectorAll('input[type="month"]')[1];
            const descriptionInput = experienceForm.querySelector('textarea');

            // Determine table type and fill form
            if (headers[0]?.textContent.includes('Pozisyon')) {
                // Work Experience
                experienceType.value = 'İş Deneyimi';
                positionInput.value = cells[0]?.textContent.trim() || '';
                companyInput.value = cells[1]?.textContent.trim() || '';
                locationInput.value = '';

                // Parse date (e.g., "2022 - Günümüz")
                const dateText = cells[2]?.textContent.trim() || '';
                const dateMatch = dateText.match(/(\d{4})/);
                if (dateMatch) {
                    startDateInput.value = dateMatch[1] + '-01';
                }
            } else if (headers[0]?.textContent.includes('Bölüm')) {
                // Education
                experienceType.value = 'Eğitim';
                positionInput.value = cells[0]?.textContent.trim() || '';
                companyInput.value = cells[1]?.textContent.trim() || '';
                locationInput.value = '';

                // Parse date (e.g., "2105 - 2019")
                const dateText = cells[2]?.textContent.trim() || '';
                const dateMatch = dateText.match(/(\d{4})\s*-\s*(\d{4})/);
                if (dateMatch) {
                    startDateInput.value = dateMatch[1] + '-01';
                    endDateInput.value = dateMatch[2] + '-12';
                }
            } else if (headers[0]?.textContent.includes('Sertifika')) {
                // Certificates
                experienceType.value = 'Sertifika';
                positionInput.value = cells[0]?.textContent.trim() || '';
                companyInput.value = cells[1]?.textContent.trim() || '';
                locationInput.value = '';

                // Parse date (e.g., "2023")
                if (dateText.match(/\d{4}/)) {
                    startDateInput.value = dateText + '-01';
                }
            }

            // Set Display Order (Simulated randomly or read from data attribute if exists)
            const displayOrderInput = experienceForm.querySelector('#displayOrder');
            if (displayOrderInput) {
                // In a real app, this would be read from a data-order attribute on the tr
                displayOrderInput.value = row.dataset.order || '0';
            }

            experienceForm.classList.add('visible');
            experienceForm.style.display = 'flex';
            // experienceForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Not needed for modal

            const config = document.getElementById('resumeConfig');
            // Check if item is deleted and show/hide Restore button
            // Check if item is deleted and show notification
            if (row.classList.contains('deleted-item')) {
                showNotification(config?.dataset.msgEditingDeleted || 'Silinen öğe düzenleniyor.', 'warning');
            } else {
                showNotification(config?.dataset.msgEditHint || 'Formu düzenleyin ve kaydedin.', 'info');
            }
        }

        // Form Restore Button Logic
        const btnRestore = document.getElementById('btnRestore');
        if (btnRestore) {
            if (row.classList.contains('deleted-item')) {
                btnRestore.classList.remove('hidden');
                btnRestore.style.display = 'inline-block'; // Ensure visibility
            } else {
                btnRestore.classList.add('hidden');
                btnRestore.style.display = 'none';
            }

            btnRestore.onclick = function (e) {
                e.preventDefault();
                if (editingRow) {
                    // Remove deleted class
                    editingRow.classList.remove('deleted-item');

                    // Update Status Badge (if exists)
                    const config = document.getElementById('resumeConfig');
                    const statusBadge = editingRow.querySelector('.status-badge.danger');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge active';
                        statusBadge.textContent = config?.dataset.textActive || 'Sitede Aktif';
                    }

                    // For Resume page specifically, we might have visibility in the last cell or status in 4th
                    const cells = editingRow.querySelectorAll('td');
                    // Education/Cert logic might differ, standardizing to just remove 'deleted-item' is visual enough for now

                    // Simple notification
                    showNotification('Öğe başarıyla geri yüklendi!', 'success');

                    // Close form
                    experienceForm.classList.remove('visible');
                    experienceForm.style.display = 'none';
                    editingRow = null;
                }
            };
        }
        const deleteBtn = e.target.closest('[data-action="deleteRow"]');
        if (deleteBtn) {
            e.preventDefault();
            const row = deleteBtn.closest('tr');
            const positionText = row.querySelector('strong')?.textContent || 'Bu öğe';

            // Use AdminApp notification system modal if available, otherwise fallback
            const config = document.getElementById('resumeConfig');
            if (window.adminApp && window.adminApp.notifications) {
                const title = config?.dataset.msgDeleteTitle || 'Silme Onayı';
                const suffix = config?.dataset.msgDeleteBodySuffix || 'öğesini silmek istediğinize emin misiniz? <br><small>Bu işlem geri alınabilir (soft delete).</small>';
                window.adminApp.notifications.showModal(
                    title,
                    `"${positionText}" ${suffix}`,
                    () => {
                        // On Confirm
                        row.classList.add('deleted-item');

                        // Update Visibility Badge (4th column, index 3) - use OUTLINED style
                        const cells = row.querySelectorAll('td');
                        if (cells[3]) {
                            const deletedText = config?.dataset.textDeleted || 'Silindi';
                            cells[3].innerHTML = `<span class="status-badge danger">${deletedText}</span>`;
                        }

                        // Toggle button visibility (hide Delete, show Restore)
                        const actionCell = row.querySelector('.action-btns');
                        if (actionCell) {
                            const deleteBtn = actionCell.querySelector('.action-btn.delete');
                            const restoreBtn = actionCell.querySelector('.action-btn.restore');
                            if (deleteBtn) deleteBtn.classList.add('hidden');
                            if (restoreBtn) restoreBtn.classList.remove('hidden');
                        }

                        const msgDeleted = config?.dataset.msgDeleted || 'Öğe silindi (Arşivlendi)!';
                        showNotification(msgDeleted, 'warning');
                    },
                    'danger'
                );
            } else {
                // Fallback if modal system fails
                const suffix = config?.dataset.msgDeleteConfirmSuffix || 'silinsin mi?';
                if (confirm(`"${positionText}" ${suffix}`)) {
                    row.remove();
                }
            }
        }

        // Restore row logic
        const restoreBtn = e.target.closest('[data-action="restoreRow"]');
        if (restoreBtn) {
            e.preventDefault();
            const row = restoreBtn.closest('tr');

            // Remove deleted class
            row.classList.remove('deleted-item');

            // Update Visibility Badge (4th column) - restore to active outlined style
            const config = document.getElementById('resumeConfig');
            const cells = row.querySelectorAll('td');
            if (cells[3]) {
                const activeText = config?.dataset.textActive || 'Sitede Aktif';
                cells[3].innerHTML = `<span class="status-badge active">${activeText}</span>`;
            }

            // Toggle button visibility (show Delete, hide Restore)
            const actionCell = row.querySelector('.action-btns');
            if (actionCell) {
                const deleteBtn = actionCell.querySelector('.action-btn.delete');
                const restoreBtnEl = actionCell.querySelector('.action-btn.restore');
                if (deleteBtn) deleteBtn.classList.remove('hidden');
                if (restoreBtnEl) restoreBtnEl.classList.add('hidden');
            }

            const msgRestored = config?.dataset.msgRestored || 'Öğe geri yüklendi!';
            showNotification(msgRestored, 'success');
        }
    });

    // Form submission
    if (experienceForm) {
        const form = experienceForm.querySelector('form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                if (editingRow) {
                    // Update existing row
                    const cells = editingRow.querySelectorAll('td');
                    const positionInput = form.querySelector('input[placeholder*="Full Stack Developer"]');
                    const companyInput = form.querySelector('input[placeholder*="TechCorp"]');

                    if (cells[0]) {
                        cells[0].innerHTML = '<strong>' + positionInput.value + '</strong>';
                    }
                    if (cells[1]) {
                        cells[1].textContent = companyInput.value;
                    }

                    // Save Display Order
                    const displayOrderInput = form.querySelector('#displayOrder');
                    if (displayOrderInput) {
                        editingRow.dataset.order = displayOrderInput.value;
                    }

                    const config = document.getElementById('resumeConfig');
                    showNotification(config?.dataset.msgUpdateSuccess || 'Güncelleme başarılı!', 'success');
                    editingRow = null;
                } else {
                    // Add new row
                    const config = document.getElementById('resumeConfig');
                    showNotification(config?.dataset.msgAddSuccess || 'Ekleme başarılı!', 'success');
                }

                experienceForm.classList.remove('visible');
                experienceForm.style.display = 'none';
                form.reset();
            });
        }
    }

    // Hide form initially
    if (experienceForm) {
        experienceForm.style.display = 'none';
    }
});
