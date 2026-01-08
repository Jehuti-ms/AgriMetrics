// auth-redirect-handler-fixed.js
console.log('🔍 Loading Auth Redirect Handler...');

class AuthRedirectHandler {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.handleRedirect());
        } else {
            this.handleRedirect();
        }
    }

    handleRedirect() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(() => this.handleRedirect(), 500);
            return;
        }

        firebase.auth().getRedirectResult()
            .then((result) => this.processRedirectResult(result))
            .catch((error) => this.handleRedirectError(error));
    }

    processRedirectResult(result) {
        if (result.user) {
            this.handleSuccessfulRedirect(result.user);
        } else {
            this.showNormalAuthUI();
        }
    }

   handleSuccessfulRedirect(user) {
    this.showSuccessMessage(user);

    // Use app.showApp if available
    setTimeout(() => {
        if (window.app && typeof window.app.showApp === 'function') {
            console.log('✅ Calling app.showApp() after redirect');
            window.app.showApp();
        } else {
            console.log('📍 Navigating to dashboard route...');
            // Adjust this route to match your SPA
            window.location.href = 'index.html#dashboard';
        }
    }, 2000);
}

    showSuccessMessage(user) {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        authContainer.innerHTML = `<h2>Welcome ${user.displayName || user.email}!</h2><p>Redirecting...</p>`;
    }

    showNormalAuthUI() {
        const authForms = document.querySelector('.auth-forms');
        if (authForms) authForms.style.display = 'block';
        sessionStorage.removeItem('googleRedirectAttempt');
    }

    handleRedirectError(error) {
        console.error('Redirect error:', error);
        if (error.code === 'auth/no-auth-event') return;
        alert(`Authentication redirect failed: ${error.message}`);
        setTimeout(() => window.location.href = 'index.html', 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authRedirectHandler = new AuthRedirectHandler();
});
