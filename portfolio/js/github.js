/**
 * GitHub API Integration using Pure JavaScript
 * Fetches latest public repositories and displays them.
 * Falls back to static cards if API fails or no repos found.
 */

document.addEventListener('DOMContentLoaded', () => {
    const githubContainer = document.getElementById('github-projects-grid');
    if (!githubContainer) return;

    // Check if static cards already exist (fallback mode)
    const existingCards = githubContainer.querySelectorAll('.github-card');
    if (existingCards.length > 0) {
        // Static cards are present, don't overwrite them
        console.log('GitHub: Using static fallback cards');
        return;
    }

    // Configuration
    const USERNAME = 'barandasdemir0'; // Default username, change if needed
    const REPO_COUNT = 4;
    const SORT = 'updated'; // updated, created, pushed, full_name

    // Language Colors Map
    const languageColors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C#': '#178600',
        'C++': '#f34b7d',
        'Dart': '#00B4AB',
        'Go': '#00ADD8',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Swift': '#ffac45'
    };

    // Default Color
    const defaultColor = '#6366f1'; // Primary color

    /**
     * Fetch Repositories
     */
    async function fetchRepos() {
        try {
            const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=${SORT}&per_page=${REPO_COUNT}&type=public`);

            if (!response.ok) {
                throw new Error('API Error');
            }

            const repos = await response.json();
            if (repos.length > 0) {
                renderRepos(repos);
            }
            // If no repos, static cards remain

        } catch (error) {
            console.error('GitHub Fetch Error:', error);
            // Static cards remain as fallback
        }
    }

    /**
     * Render Repositories to DOM
     * @param {Array} repos 
     */
    function renderRepos(repos) {

        const html = repos.map(repo => {
            const langColor = languageColors[repo.language] || defaultColor;
            const description = repo.description ?
                (repo.description.length > 100 ? repo.description.substring(0, 100) + '...' : repo.description) :
                'Bu proje için açıklama bulunmuyor.';

            // Format date
            const date = new Date(repo.updated_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="repo-card" data-aos="fade-up">
                    <div class="repo-header">
                        <div class="repo-icon">
                            <i class="far fa-folder-open"></i>
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="repo-link" aria-label="Github Link">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                    <h3>${repo.name}</h3>
                    <p>${description}</p>
                    <div class="repo-footer">
                        <div class="repo-lang">
                            <span class="lang-dot" style="background-color: ${langColor}"></span>
                            <span>${repo.language || 'Diğer'}</span>
                        </div>
                        <div class="repo-stats">
                            <div class="repo-stat" title="Stars">
                                <i class="far fa-star"></i>
                                <span>${repo.stargazers_count}</span>
                            </div>
                            <div class="repo-stat" title="Forks">
                                <i class="fas fa-code-branch"></i>
                                <span>${repo.forks_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        githubContainer.innerHTML = html;
    }

    /**
     * Show Error Message
     */
    function showError() {
        githubContainer.innerHTML = `
            <div class="github-error col-12">
                <i class="fas fa-exclamation-circle"></i>
                <p>GitHub verileri şu an yüklenemiyor.</p>
                <a href="https://github.com/${USERNAME}" target="_blank" class="btn-text">Profile Git <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
    }

    // Initialize
    fetchRepos();
});
