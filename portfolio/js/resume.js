// Resume Page Tab Switching Script
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.resume-tab');
    const contents = document.querySelectorAll('.tab-content');

    function activateTab(targetId) {
        tabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.resume-tab[data-tab="${targetId}"]`);
        if (activeTab) activeTab.classList.add('active');

        contents.forEach(c => c.classList.toggle('active', c.id === targetId));
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.getAttribute('data-tab');
            activateTab(target);
        });
    });

    // Ensure default active state
    const defaultActive = document.querySelector('.tab-content.active')?.id || 'experience';
    activateTab(defaultActive);
});
