// modules/auth-fixed.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
    }

    // ... [all the methods we already cleaned up: renderSocialLoginButtons, handleSocialSignIn, password validation, etc.] ...

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
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) targetForm.classList.add('active');
    }

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// ✅ Close the class and assign to window
window.authModule = new AuthModule();
