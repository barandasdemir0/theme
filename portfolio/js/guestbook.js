// ============================================
// GUESTBOOK PAGE - Form Type Toggle & Submission
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const msgTypeRadios = document.querySelectorAll('input[name="msgType"]');
    const testimonialFields = document.getElementById('testimonialFields');
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const guestbookForm = document.querySelector('.guestbook-form form');
    const submitBtn = guestbookForm ? guestbookForm.querySelector('button[type="button"]') : null;
    const successModal = document.getElementById('guestbookSuccessModal');
    const closeModalBtn = successModal ? successModal.querySelector('.close-modal') : null;

    // Close modal on button click
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeGuestbookModal);
    }

    // Close modal when clicking outside
    if (successModal) {
        successModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeGuestbookModal();
            }
        });
    }

    // Form type toggle
    if (msgTypeRadios.length) {
        msgTypeRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                // Update active class
                toggleOptions.forEach(opt => opt.classList.remove('active'));
                this.closest('.toggle-option').classList.add('active');

                // Toggle testimonial fields using CSS classes
                if (testimonialFields) {
                    if (this.value === 'testimonial') {
                        testimonialFields.classList.add('visible');
                    } else {
                        testimonialFields.classList.remove('visible');
                    }
                }

                // Enable submit button if form has content
                validateForm();
            });
        });
    }

    // Form input validation
    const textarea = guestbookForm ? guestbookForm.querySelector('textarea') : null;
    if (textarea) {
        textarea.addEventListener('input', validateForm);
    }

    /**
     * Validate form and enable/disable submit button
     */
    function validateForm() {
        if (!guestbookForm || !submitBtn) return;

        const textarea = guestbookForm.querySelector('textarea');
        const hasContent = textarea && textarea.value.trim().length > 0;
        const msgType = document.querySelector('input[name="msgType"]:checked')?.value;

        // Check if testimonial fields are filled when needed
        let testimonialsValid = true;
        if (msgType === 'testimonial') {
            const inputs = testimonialFields.querySelectorAll('input.form-control');
            testimonialsValid = Array.from(inputs).some(input => input.value.trim().length > 0);
        }

        if (hasContent && testimonialsValid) {
            submitBtn.disabled = false;
            submitBtn.title = 'Gönder';
        } else {
            submitBtn.disabled = true;
            if (!hasContent) {
                submitBtn.title = 'Mesaj yazmalısınız';
            }
        }
    }

    // Form submission
    if (guestbookForm && submitBtn) {
        guestbookForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitGuestbookForm();
        });

        // Allow Enter key to submit
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            submitGuestbookForm();
        });
    }

    /**
     * Submit guestbook form
     */
    function submitGuestbookForm() {
        if (!guestbookForm || !submitBtn) return;

        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;

        // Create loading spinner
        const spinner = document.createElement('span');
        spinner.className = 'spinner-border spinner-border-sm me-2';
        submitBtn.innerHTML = '';
        submitBtn.appendChild(spinner);
        submitBtn.appendChild(document.createTextNode('Gönderiliyor...'));

        // Simulate form submission
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            guestbookForm.reset();

            // Reset form state
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            toggleOptions[0].classList.add('active');
            if (testimonialFields) {
                testimonialFields.classList.remove('visible');
            }
            validateForm();

            // Show success modal
            showGuestbookModal();

            // Fire confetti
            fireGuestbookConfetti();

        }, 1500);
    }

    /**
     * Show success modal
     */
    function showGuestbookModal() {
        if (successModal) {
            successModal.classList.add('visible');
        }
    }

    /**
     * Close success modal
     */
    function closeGuestbookModal() {
        if (successModal) {
            successModal.classList.remove('visible');
        }
    }

    /**
     * Fire confetti animation
     */
    function fireGuestbookConfetti() {
        if (typeof confetti === 'undefined') {
            console.warn('Confetti library not loaded');
            return;
        }

        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }

    // Make closeGuestbookModal globally available if needed
    window.closeGuestbookModal = closeGuestbookModal;
});

// Pagination functionality for guestbook page
document.addEventListener('DOMContentLoaded', function() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    if (paginationBtns.length === 0) return; // Not on guestbook page
    
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
                console.log('Guestbook - Sayfa:', pageNumber);
                
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
            updateGuestbookPaginationArrows();
        });
    });
    
    function updateGuestbookPaginationArrows() {
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
    updateGuestbookPaginationArrows();
});
