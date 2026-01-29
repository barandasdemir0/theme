// ============================================
// BLOG PAGE - Category Filtering with Animations + Search
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const blogPage = document.querySelector('.blog-section');
    if (!blogPage) return;

    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    const searchInput = document.getElementById('searchInput');
    const searchBox = document.getElementById('blogSearch');
    const searchClear = document.getElementById('searchClear');

    // Add CSS transitions to blog cards
    blogCards.forEach(card => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    // ============================================
    // CATEGORY FILTERING
    // ============================================
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filterValue = this.getAttribute('data-filter');

            // Clear search when filtering
            if (searchInput) {
                searchInput.value = '';
                searchBox.classList.remove('has-value');
            }

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter blog cards with animation
            blogCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');

                card.style.opacity = '0';
                card.style.transform = 'scale(0.8) translateY(20px)';

                setTimeout(() => {
                    if (filterValue === '*' || category === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, index * 100);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();

            // Toggle has-value class
            if (query.length > 0) {
                searchBox.classList.add('has-value');
            } else {
                searchBox.classList.remove('has-value');
            }

            // Reset filter to "All" when searching
            filterButtons.forEach(btn => btn.classList.remove('active'));
            filterButtons[0].classList.add('active');

            // Filter cards
            let hasResults = false;
            blogCards.forEach(card => {
                const title = card.querySelector('.blog-title').textContent.toLowerCase();
                const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
                const category = card.querySelector('.blog-category').textContent.toLowerCase();

                if (title.includes(query) || excerpt.includes(query) || category.includes(query)) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1) translateY(0)';
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show "no results" message if needed
            let noResultsMsg = document.querySelector('.no-results');
            if (!hasResults && query.length > 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results';
                    noResultsMsg.innerHTML = '<i class="fas fa-search"></i><p>Sonuç bulunamadı</p>';
                    document.querySelector('.blog-grid').appendChild(noResultsMsg);
                }
                noResultsMsg.style.display = 'block';
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        });

        // Clear search button
        if (searchClear) {
            searchClear.addEventListener('click', function () {
                searchInput.value = '';
                searchBox.classList.remove('has-value');
                searchInput.dispatchEvent(new Event('input'));
            });
        }
    }
});

// Pagination functionality for blog page
document.addEventListener('DOMContentLoaded', function() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    if (paginationBtns.length === 0) return; // Not on blog page
    
    paginationBtns.forEach((btn) => {
        btn.addEventListener('click', function() {
            if (this.disabled || this.classList.contains('active')) return;
            
            const isNumber = !this.querySelector('i');
            
            if (isNumber) {
                // Remove active class from all number buttons
                document.querySelectorAll('.pagination-btn').forEach(b => {
                    if (!b.querySelector('i')) {
                        b.classList.remove('active');
                    }
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const pageNumber = parseInt(this.textContent);
                console.log('Blog - Sayfa:', pageNumber);
                
            } else {
                // Arrow button clicked
                const currentActive = document.querySelector('.pagination-btn.active');
                const currentPage = parseInt(currentActive?.textContent || 1);
                const isNext = this.querySelector('.fa-chevron-right');
                
                if (isNext) {
                    // Next page
                    const nextBtn = Array.from(paginationBtns).find(b => 
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage + 1
                    );
                    if (nextBtn) nextBtn.click();
                } else {
                    // Previous page
                    const prevBtn = Array.from(paginationBtns).find(b => 
                        !b.querySelector('i') && parseInt(b.textContent) === currentPage - 1
                    );
                    if (prevBtn) prevBtn.click();
                }
            }
            
            // Update arrow button states
            updateBlogPaginationArrows();
        });
    });
    
    function updateBlogPaginationArrows() {
        const currentActive = document.querySelector('.pagination-btn.active');
        const currentPage = parseInt(currentActive?.textContent || 1);
        const allPages = Array.from(document.querySelectorAll('.pagination-btn'))
            .filter(b => !b.querySelector('i'))
            .map(b => parseInt(b.textContent));
        
        const minPage = Math.min(...allPages);
        const maxPage = Math.max(...allPages);
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) prevBtn.disabled = currentPage <= minPage;
        if (nextBtn) nextBtn.disabled = currentPage >= maxPage;
    }
    
    // Initialize arrow states
    updateBlogPaginationArrows();
});
