// modules/auth-redirect-handler.js
console.log('🔍 Loading Auth Redirect Handler...');

class AuthRedirectHandler {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔄 Initializing redirect handler...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.handleRedirect());
        } else {
            this.handleRedirect();
        }
    }

    handleRedirect() {
        console.log('🔍 Checking for Firebase auth redirect result...');
        
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⏳ Firebase not loaded yet, waiting...');
            setTimeout(() => this.handleRedirect(), 500);
            return;
        }

        // If user is already signed in (email/password flow), skip redirect check
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log('✅ User already signed in:', currentUser.email);
            this.redirectToDashboard(currentUser);
            return;
        }

        // Otherwise, check for redirect result (Google/Facebook flows)
        firebase.auth().getRedirectResult()
            .then((result) => {
                this.processRedirectResult(result);
            })
            .catch((error) => {
                this.handleRedirectError(error);
            });
    }

    processRedirectResult(result) {
        console.log('📋 Redirect result received:', result.user ? 'User found' : 'No user');
        
        if (result.user) {
            this.handleSuccessfulRedirect(result.user);
        } else {
            console.log('🔄 No redirect authentication - normal page load');
            // Do NOT force showAuth here; let app.js handle auth state
        }
    }

    handleSuccessfulRedirect(user) {
        console.log('🎉 ✅ Redirect authentication successful!');
        console.log('👤 User Details:', user.email, user.uid, user.providerId);
        
        this.showSuccessMessage(user);
        this.redirectToDashboard(user);
    }

    showSuccessMessage(user) {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        const authForms = document.querySelector('.auth-forms');
        if (authForms) authForms.style.display = 'none';
        
        authContainer.innerHTML = `
            <div class="redirect-success" style="
                max-width: 400px;
                margin: 0 auto;
                padding: 40px 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                text-align: center;
            ">
                <div style="font-size: 48px; color: #34A853; margin-bottom: 20px;">✅</div>
                <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">
                    Welcome ${user.displayName || user.email || 'User'}!
                </h2>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                    Sign-in was successful.
                </p>
                <p style="color: #888; font-size: 14px; margin-top: 20px;">
                    Redirecting to dashboard...
                </p>
            </div>
        `;
        this.addSpinnerStyles();
    }

    redirectToDashboard(user) {
        console.log('📍 Navigating to dashboard...');
        // Use SPA methods instead of hard redirect
        if (window.app) {
            window.app.currentUser = user;
            window.app.showApp();
            window.app.showSection('dashboard');
        } else {
            // Fallback: reload index
            window.location.href = window.location.pathname;
        }
    }

    handleRedirectError(error) {
        console.error('❌ Redirect error:', error);
        
        if (error.code === 'auth/no-auth-event' || 
            error.code === 'auth/popup-closed-by-user') {
            console.log('ℹ️ Normal redirect flow - no error');
            return;
        }
        
        let errorMessage = 'Authentication redirect failed. ';
        if (error.code === 'auth/unauthorized-domain') {
            errorMessage += 'Domain not authorized.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage += 'Network error.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }
        
        this.showNotification(errorMessage, 'error');
    }

    showNotification(message, type = 'info') {
        if (window.authModule && typeof window.authModule.showNotification === 'function') {
            window.authModule.showNotification(message, type);
        } else if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    addSpinnerStyles() {
        if (!document.querySelector('#redirect-spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'redirect-spinner-styles';
            style.textContent = `
                @keyframes redirect-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the redirect handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AuthRedirectHandler...');
    window.authRedirectHandler = new AuthRedirectHandler();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthRedirectHandler;
}
