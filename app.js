// app.js - FIXED VERSION
console.log('🚜 Farm Management PWA - Starting...');

class FarmPWA {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, checking auth state...');
            this.checkAuthState();
            this.setupServiceWorker();
        });
    }

    checkAuthState() {
        // Wait a bit for auth to initialize
        setTimeout(() => {
            const user = window.authManager?.auth?.currentUser;
            console.log('Auth check - User:', user ? user.email : 'No user');
            
            if (user) {
                console.log('✅ User is signed in, showing app content');
                this.showAppContent();
            } else {
                console.log('❌ No user signed in, showing auth forms');
                this.showAuthForms();
            }
        }, 500);
    }

    showAppContent() {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        
        console.log('Showing app content, hiding auth forms');
        if (authForms) authForms.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
    }

    showAuthForms() {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        
        console.log('Showing auth forms, hiding app content');
        if (authForms) authForms.style.display = 'block';
        if (appContent) appContent.style.display = 'none';
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/AgriMetrics/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.log('❌ Service Worker failed:', error);
                });
        }
    }
}

// Initialize
window.farmPWA = new FarmPWA();
