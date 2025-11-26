// app.js - UPDATED VERSION
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
        // Wait for auth to initialize
        setTimeout(() => {
            const user = window.authManager?.auth?.currentUser;
            console.log('Auth check - User:', user ? user.email : 'No user');
            
            if (user) {
                console.log('✅ User signed in, showing app');
                this.showApp();
            } else {
                console.log('❌ No user, showing auth forms');
                this.showAuthForms();
            }
        }, 1000);
    }

    showApp() {
        const authForms = document.querySelector('.auth-forms');
        const appContainer = document.getElementById('app-container');
        
        if (authForms) authForms.style.display = 'none';
        if (appContainer) {
            appContainer.style.display = 'block';
            appContainer.classList.remove('hidden');
        }
    }

    showAuthForms() {
        const authForms = document.querySelector('.auth-forms');
        const appContainer = document.getElementById('app-container');
        
        if (authForms) authForms.style.display = 'block';
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
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

window.farmPWA = new FarmPWA();
