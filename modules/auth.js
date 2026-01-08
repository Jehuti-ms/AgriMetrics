// modules/auth.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
    }

    // ======== SOCIAL LOGIN BUTTONS ========
    renderSocialLoginButtons() {
        const socialContainer = document.getElementById('social-login-container');
        if (socialContainer && window.authManager) {
            socialContainer.innerHTML = window.authManager.renderAuthButtons();

            const googleBtn = socialContainer.querySelector('.btn-social.google');
            const appleBtn = socialContainer.querySelector('.btn-social.apple');

            if (googleBtn) {
                googleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('google');
                };
            }
            if (appleBtn) {
                appleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('apple');
                };
            }
        }
    }

    async handleSocialSignIn(provider) {
        const socialContainer = document.getElementById('social-login-container');
        if (!socialContainer) return;

        const buttons = socialContainer.querySelectorAll('.btn-social');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `Signing in with ${provider}...`;
        });

        try {
            let result;
            if (provider === 'google') {
                result = await window.authManager.signInWithGoogle();
            } else if (provider === 'apple') {
                result = await window.authManager.signInWithApple();
            }

            if (result?.success) {
                this.showNotification(`Signed in with ${provider}!`, 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                this.showNotification(result?.error || `Error signing in with ${provider}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error signing in with ${provider}`, 'error');
        } finally {
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
            });
        }
    }

    // ======== PASSWORD VALIDATION ========
    setupPasswordValidation() {
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm-password');

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.checkPasswordStrength(passwordInput.value);
            });
        }
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.checkPasswordMatch(passwordInput.value, confirmInput.value);
            });
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-progress');
        const strengthText = document.querySelector('.strength-text');
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';

        if (password.length === 0) {
            strengthBar.style.backgroundColor = '#ddd';
            strengthText.textContent = '';
        } else if (strength < 2) {
            strengthBar.style.backgroundColor = '#ff4757';
            strengthText.textContent = 'Weak';
        } else if (strength < 4) {
            strengthBar.style.backgroundColor = '#ffa502';
            strengthText.textContent = 'Medium';
        } else {
            strengthBar.style.backgroundColor = '#2ed573';
            strengthText.textContent = 'Strong';
        }

        this.showPasswordRequirements(password);
    }

    checkPasswordMatch(password, confirmPassword) {
        const matchIndicator = document.querySelector('.password-match-indicator');
        if (!matchIndicator) return;

        if (confirmPassword.length === 0) {
            matchIndicator.textContent = '';
        } else if (password === confirmPassword) {
            matchIndicator.textContent = '✓ Passwords match';
            matchIndicator.style.color = '#2ed573';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#ff4757';
        }
    }

    showPasswordRequirements(password) {
        const requirements = document.getElementById('password-requirements');
        if (!requirements) return;

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
        const fulfilled = Object.values(checks).filter(Boolean).length;
        const total = Object.keys(checks).length;

        requirements.innerHTML = `<div>${fulfilled}/${total} requirements met</div>`;
    }

    // ======== FORM HANDLERS ========
    setupAuthForms() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachFormHandlers());
        } else {
            this.attachFormHandlers();
        }
    }

    attachFormHandlers() {
        this.renderSocialLoginButtons();
        this.setupPasswordValidation();

        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        this.setupAuthListeners();
    }

    setupAuthListeners() {
        const map = {
            'show-signup': 'signup',
            'show-signin': 'signin',
            'show-forgot-password': 'forgot-password',
            'show-signin-from-forgot': 'signin'
        };
        Object.entries(map).forEach(([id, form]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', e => {
                e.preventDefault();
                this.showAuthForm(form);
            });
        });
    }

    async handleSignUp() {
        const form = document.getElementById('signup-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const name = document.getElementById('signup-name')?.value || '';
        const email = document.getElementById('signup-email')?.value || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';
        const farmName = document.getElementById('farm-name')?.value || '';

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (submitBtn) {
            submitBtn.innerHTML = 'Creating Account...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager.signUp(email, password, { name, email, farmName });
            if (result?.success) {
                this.showNotification('Account created successfully!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                this.showNotification(result?.error || 'Error creating account', 'error');
            }
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Create Account';
                submitBtn.disabled = false;
            }
        }
    }

    async handleSignIn() {
        const form = document.getElementById('signin-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('signin-email')?.value || '';
        const password = document.getElementById('signin-password')?.value || '';

        if (submitBtn) {
            submitBtn.innerHTML = 'Signing In...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager.signIn(email, password);
            if (result?.success) {
                this.showNotification('Welcome back!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                this.showNotification(result?.error || 'Error signing in', 'error');
            }
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Sign In';
                submitBtn.disabled = false;
            }
        }
    }

       async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('forgot-email')?.value || '';

        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Reset Link...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager.resetPassword(email);
            if (result?.success) {
                this.showNotification('Password reset email sent!', 'success');
                this.showAuthForm('signin');
            } else {
                this.showNotification(result?.error || 'Error sending reset email', 'error');
            }
        } catch (error) {
            this.showNotification('Error sending reset email', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
        }
    }

    showAuthForm(formName) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// ✅ Close the class and initialize
window.authModule = new AuthModule();

