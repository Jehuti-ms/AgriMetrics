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
                this.hideAuthUI();
                setTimeout(() => {
                    if (window.app && typeof window.app.showApp === 'function') {
                        window.app.showApp();
                    }
                }, 1500);
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

    setupAuthForms() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachFormHandlers());
        } else {
            this.attachFormHandlers();
        }
    }

    attachFormHandlers() {
        this.renderSocialLoginButtons();

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

        if (submitBtn) {
            submitBtn.innerHTML = 'Creating Account...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager.signUp(email, password, { name, email, farmName });
            if (result?.success) {
                this.showNotification('Account created successfully!', 'success');
                this.hideAuthUI();
                setTimeout(() => {
                    if (window.app && typeof window.app.showApp === 'function') {
                        window.app.showApp();
                    }
                }, 1500);
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
                this.hideAuthUI();
                setTimeout(() => {
                    if (window.app && typeof window.app.showApp === 'function') {
                        window.app.showApp();
                    }
                }, 1500);
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

    hideAuthUI() {
        const authForms = document.querySelector('.auth-forms');
        if (authForms) authForms.style.display = 'none';
    }

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

window.authModule = new AuthModule();
