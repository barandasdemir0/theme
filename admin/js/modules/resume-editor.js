/**
 * Resume Editor Script
 * Handles adding/editing resume items (Experience, Education, Certificates)
 */

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'job'; // job, education, certificate
    const id = urlParams.get('id'); // if exists, we are editing

    initForm(type, id);
    handleFormSubmit();
});

function initForm(type, id) {
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const formTitle = document.getElementById('formTitle');

    const displayType = document.getElementById('displayType');
    const entryType = document.getElementById('entryType');

    const labelPosition = document.getElementById('labelPosition');
    const inputPosition = document.getElementById('inputPosition');

    const labelCompany = document.getElementById('labelCompany');
    const inputCompany = document.getElementById('inputCompany');

    let typeName = 'İş Deneyimi';
    let subtitle = 'Özgeçmişinize yeni bir iş deneyimi ekleyin';

    // UI Customization based on Type
    if (type === 'education') {
        typeName = 'Eğitim';
        subtitle = 'Özgeçmişinize yeni bir eğitim bilgisi ekleyin';
        labelPosition.textContent = 'Bölüm *';
        inputPosition.placeholder = 'Örn: Bilgisayar Mühendisliği';
        labelCompany.textContent = 'Okul *';
        inputCompany.placeholder = 'Örn: İstanbul Teknik Üniversitesi';
    } else if (type === 'certificate') {
        typeName = 'Sertifika';
        subtitle = 'Özgeçmişinize yeni bir sertifika ekleyin';
        labelPosition.textContent = 'Sertifika Adı *';
        inputPosition.placeholder = 'Örn: AWS Solutions Architect';
        labelCompany.textContent = 'Kurum *';
        inputCompany.placeholder = 'Örn: Amazon Web Services';
    }

    displayType.value = typeName;
    entryType.value = type;

    if (id) {
        pageTitle.textContent = `${typeName} Düzenle`;
        pageSubtitle.textContent = `Mevcut ${typeName.toLowerCase()} bilginizi düzenleyin`;
        formTitle.textContent = `${typeName} Detayları`;

        // Simulate fetching data
        loadData(id, type);
    } else {
        pageTitle.textContent = `Yeni ${typeName} Ekle`;
        pageSubtitle.textContent = subtitle;
    }
}

function loadData(id, type) {
    // In a real app, fetch from API. Here we mock data for demo.
    console.log(`Loading data for ID: ${id}, Type: ${type}`);

    document.getElementById('entryId').value = id;
    document.getElementById('inputPosition').value = "Senior Developer";
    document.getElementById('inputCompany').value = "Tech Corp";
    document.getElementById('inputLocation').value = "İstanbul";
    document.getElementById('inputStartDate').value = "2022-01";
    document.getElementById('inputDescription').value = "Yazılım geliştirme süreçlerini yönettim.";
    document.getElementById('displayOrder').value = "1";

    // Check if "deleted" param is present for demo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('deleted') === 'true') {
        const btnRestore = document.getElementById('btnRestore');
        btnRestore.classList.remove('hidden');
        btnRestore.style.display = 'inline-flex';

        btnRestore.onclick = function () {
            if (window.adminApp && window.adminApp.notifications) {
                window.adminApp.notifications.showToast('Başarılı', 'Öğe başarıyla geri yüklendi!', 'success');
            } else {
                alert('Öğe geri yüklendi!');
            }
            // Redirect or update UI
        };
    }
}

function handleFormSubmit() {
    const form = document.getElementById('resumeForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect data
        // const data = new FormData(form);

        if (window.adminApp && window.adminApp.notifications) {
            window.adminApp.notifications.showToast('Başarılı', 'Değişiklikler başarıyla kaydedildi!', 'success');
        } else {
            alert('Kaydedildi!');
        }

        // Redirect back to resume list after short delay
        setTimeout(() => {
            window.location.href = 'resume.html';
        }, 1000);
    });
}
