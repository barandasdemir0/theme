/**
 * Register Page Script
 * Handles password visibility toggle, password strength checker, and form submission
 */

document.addEventListener('DOMContentLoaded', function () {
    // Password visibility toggle for password field
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Password visibility toggle for confirm password field
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', function () {
            const passwordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Password strength checker
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const password = this.value;
            let strength = 0;

            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/\d/.test(password)) strength++;
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

            strengthFill.className = 'password-strength-fill';

            if (password.length === 0) {
                strengthText.textContent = 'En az 8 karakter';
            } else if (strength <= 1) {
                strengthFill.classList.add('weak');
                strengthText.textContent = 'Zayıf şifre';
            } else if (strength === 2 || strength === 3) {
                strengthFill.classList.add('medium');
                strengthText.textContent = 'Orta güçlükte';
            } else {
                strengthFill.classList.add('strong');
                strengthText.textContent = 'Güçlü şifre';
            }
        });
    }

    // Form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showNotification('Şifreler eşleşmiyor!', 'error');
                return;
            }

            // Simulate registration
            showNotification('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }
});
