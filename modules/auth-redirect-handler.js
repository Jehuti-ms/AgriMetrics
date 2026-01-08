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

        // Check for redirect result
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
            this.showNormalAuthUI();
        }
    }

    handleSuccessfulRedirect(user) {
        console.log('🎉 ✅ Redirect authentication successful!');
        console.log('👤 User Details:');
        console.log('- Email:', user.email);
        console.log('- Name:', user.displayName);
        console.log('- UID:', user.uid);
        console.log('- Provider:', user.providerId);
        
        // Update UI to show success
        this.showSuccessMessage(user);
        
        // Redirect to dashboard
        this.redirectToDashboard();
    }

    showSuccessMessage(user) {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Hide any forms
        const authForms = document.querySelector('.auth-forms');
        if (authForms) {
            authForms.style.display = 'none';
        }
        
        // Show success message
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
                <div style="
                    font-size: 48px;
                    color: #34A853;
                    margin-bottom: 20px;
                ">✅</div>
                
                <h2 style="
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 24px;
                ">Welcome ${user.displayName || user.email || 'User'}!</h2>
                
                <p style="
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.5;
                ">
                    Your Google sign-in was successful.
                </p>
                
                <div style="margin: 30px 0;">
                    <div class="redirect-spinner" style="
                        display: inline-block;
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        animation: redirect-spin 1s linear infinite;
                    "></div>
                </div>
                
                <p style="
                    color: #888;
                    font-size: 14px;
                    margin-top: 20px;
                ">
                    Redirecting to dashboard...
                </p>
            </div>
        `;
        
        // Add spinner animation
        this.addSpinnerStyles();
    }

    showNormalAuthUI() {
        // If no redirect, ensure auth forms are visible
        const authForms = document.querySelector('.auth-forms');
        if (authForms) {
            authForms.style.display = 'block';
        }
        
        // Check for any stored redirect attempt
        const redirectAttempt = sessionStorage.getItem('googleRedirectAttempt');
        if (redirectAttempt) {
            console.log('ℹ️ Previous redirect attempt detected');
            sessionStorage.removeItem('googleRedirectAttempt');
            
            // Show info message
            this.showNotification(
                'Returned from Google sign-in. Please try again if needed.',
                'info'
            );
        }
    }

    redirectToDashboard() {
        console.log('🔄 Redirecting to dashboard in 2 seconds...');
        
        // Store auth success in session for dashboard
        sessionStorage.setItem('authRedirectSuccess', 'true');
        sessionStorage.setItem('authTimestamp', Date.now().toString());
        
        // Redirect after delay
        setTimeout(() => {
            console.log('📍 Navigating to dashboard...');
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    handleRedirectError(error) {
        console.error('❌ Redirect error:', error);
        
        // Don't show error for "no user" cases
        if (error.code === 'auth/no-auth-event' || 
            error.code === 'auth/popup-closed-by-user') {
            console.log('ℹ️ Normal redirect flow - no error');
            return;
        }
        
        // Show user-friendly error
        let errorMessage = 'Authentication redirect failed. ';
        
        if (error.code === 'auth/unauthorized-domain') {
            errorMessage += 'Domain not authorized. Please contact support.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage += 'Network error. Please check your connection.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }
        
        this.showNotification(errorMessage, 'error');
        
        // Return to auth page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    showNotification(message, type = 'info') {
        // Use your existing notification system or create simple alert
        if (window.authModule && typeof window.authModule.showNotification === 'function') {
            window.authModule.showNotification(message, type);
        } else if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    addSpinnerStyles() {
        // Only add styles if not already present
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

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthRedirectHandler;
}
