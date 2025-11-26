// app.js - Remove any AuthModule declaration, keep only this:
console.log('🚜 Initializing Farm Management PWA...');

class FarmPWA {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing app...');
            this.initializePWA();
            this.checkAuthState();
            this.setupServiceWorker();
        });
    }

    initializePWA() {
        console.log('📱 Initializing PWA...');
        this.setupPWAInstall();
        this.setupOfflineHandler();
        console.log('✅ Farm Management PWA Ready!');
    }

    checkAuthState() {
        // Wait for auth to be initialized
        setTimeout(() => {
            if (window.authManager?.auth?.currentUser) {
                console.log('User already signed in:', window.authManager.auth.currentUser.email);
                this.showAppContent();
            } else {
                console.log('No user signed in');
                this.showAuthForms();
            }
        }, 1000);
    }

    showAppContent() {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        if (authForms) authForms.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
    }

    showAuthForms() {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        if (authForms) authForms.style.display = 'block';
        if (appContent) appContent.style.display = 'none';
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/AgriMetrics/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }

    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA installation available');
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            deferredPrompt = null;
        });
    }

    setupOfflineHandler() {
        window.addEventListener('online', () => {
            console.log('App is online');
            this.showNotification('Back online - syncing data...', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('App is offline');
            this.showNotification('You are offline - working locally', 'warning');
        });
    }

    showNotification(message, type) {
        // Simple notification fallback
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            font-weight: 500;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app
window.farmPWA = new FarmPWA();
