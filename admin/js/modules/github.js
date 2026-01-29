// GitHub Repos Page JavaScript

const MAX_REPOS = 4;

document.addEventListener('DOMContentLoaded', function () {
    const fetchBtn = document.getElementById('fetchReposBtn');
    const publishBtn = document.getElementById('publishBtn');
    const reposContainer = document.getElementById('reposContainer'); // Parent container
    const selectedCountEl = document.getElementById('selectedCount');

    let selectedRepos = [];

    // --- Repo Selection Logic ---
    // We bind events to the container to handle dynamically loaded content (HTMX)
    const reposGrid = document.getElementById('reposGrid');
    if (reposGrid) {
        reposGrid.addEventListener('click', function (e) {
            const card = e.target.closest('.repo-card');
            if (!card) return;

            const isSelected = card.classList.contains('selected');
            const currentCount = document.querySelectorAll('.repo-card.selected').length;

            // If trying to select and already at max
            if (!isSelected && currentCount >= MAX_REPOS) {
                let msg = 'Limit aşıldı.';
                const grid = document.getElementById('reposGrid');
                if (grid && grid.dataset.msgLimit) {
                    msg = grid.dataset.msgLimit.replace('{0}', MAX_REPOS);
                }
                window.adminApp?.notifications?.showToast('Limit', msg, 'warning');
                return;
            }

            card.classList.toggle('selected');
            updateSelectedCount();
        });
    }

    // Update selected count
    function updateSelectedCount() {
        const selectedCards = document.querySelectorAll('.repo-card.selected');
        const count = selectedCards.length;

        selectedRepos = Array.from(selectedCards).map(card => ({
            id: card.dataset.repoId,
            name: card.dataset.repoName,
            // In a real app, you might want more data here.
            // Since HTMX replaces HTML, we read from DOM.
        }));

        // Update disabled state on unselected cards
        document.querySelectorAll('.repo-card').forEach(card => {
            if (!card.classList.contains('selected') && count >= MAX_REPOS) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });

        if (count > 0) {
            selectedCountEl.classList.remove('hidden');
            selectedCountEl.classList.add('d-inline-flex');
            selectedCountEl.querySelector('span').textContent = count;
            publishBtn.classList.remove('hidden');
            publishBtn.classList.add('d-inline-flex');
        } else {
            selectedCountEl.classList.add('hidden');
            selectedCountEl.classList.remove('d-inline-flex');
            publishBtn.classList.add('hidden');
            publishBtn.classList.remove('d-inline-flex');
        }
    }

    // Publish selected repos (simulated or real endpoint)
    // Note: You might want to convert this to HTMX too (hx-post) if it submits data.
    // For now, keeping as JS to demonstrate hybrid approach or if it needs complex client-side validation.
    publishBtn.addEventListener('click', function () {
        if (selectedRepos.length === 0) {
            const msg = this.dataset.msgWarning || 'Lütfen en az bir repo seçin.';
            window.adminApp?.notifications?.showToast('Uyarı', msg, 'warning');
            return;
        }

        // Show loading state
        publishBtn.disabled = true;
        const loadingText = this.dataset.textLoading || 'Kaydediliyor...';
        publishBtn.innerHTML = `<span class="loading-spinner"></span> ${loadingText}`;

        // Simulated API call - In production, use fetch() to send selectedRepos IDs
        setTimeout(() => {
            publishBtn.disabled = false;
            const defaultText = this.dataset.textDefault || 'Seçilenleri Yayınla';
            publishBtn.innerHTML = `<i class="fas fa-rocket"></i> ${defaultText}`;

            const repoNames = selectedRepos.map(r => r.name).join(', ');
            let successMsg = `${selectedRepos.length} repo yayınlandı: ${repoNames}`;

            if (this.dataset.msgSuccess) {
                successMsg = this.dataset.msgSuccess
                    .replace('{0}', selectedRepos.length)
                    .replace('{1}', repoNames);
            }

            window.adminApp?.notifications?.showToast('Başarılı', successMsg, 'success');
        }, 1000);
    });

    // Re-bind events after HTMX swap if needed (though delegation handled above)
    document.body.addEventListener('htmx:afterSwap', function (event) {
        if (event.detail.target.id === 'reposGrid') {
            // Resets or re-initializations if needed
            updateSelectedCount(); // Recalculate based on new content
        }
    });

});
