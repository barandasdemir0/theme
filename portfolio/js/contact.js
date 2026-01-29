/**
 * Contact Page Script
 * Handles form submission, validation, modal display, and confetti animation
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.querySelector('.close-modal');

    // Close modal on button click
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSuccessModal);
    }

    // Close modal when clicking outside
    if (successModal) {
        successModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeSuccessModal();
            }
        });
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate form
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Disable submit button and show loading
            const submitBtn = form.querySelector('button[type="submit"]');
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
                form.reset();
                form.classList.remove('was-validated');

                // Show success modal
                showSuccessModal();

                // Fire confetti
                fireConfetti();

            }, 1500);
        });
    }

    /**
     * Show success modal
     */
    function showSuccessModal() {
        if (successModal) {
            successModal.classList.add('visible');
        }
    }

    /**
     * Close success modal
     */
    function closeSuccessModal() {
        if (successModal) {
            successModal.classList.remove('visible');
        }
    }

    /**
     * Fire confetti animation (CSS-based alternative)
     */
    function fireConfetti() {
        // Create simple success animation without external library
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('success-animation');
            setTimeout(() => {
                modal.classList.remove('success-animation');
            }, 1000);
        }
    }

    // Make closeSuccessModal globally available for legacy onclick handlers if needed
    window.closeSuccessModal = closeSuccessModal;
});
