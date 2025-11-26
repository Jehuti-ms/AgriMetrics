// modules/auth.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.authInitialized = false;
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
        this.waitForFirebase();
    }

    waitForFirebase() {
        // Wait for Firebase to be fully loaded
        const checkFirebase = () => {
            if (window.authManager && window.authManager.auth) {
                this.setupAuthStateListener();
                this.authInitialized = true;
            } else {
                console.log('⏳ Waiting for Firebase auth...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    }

    setupAuthStateListener() {
        if (!window.authManager || !window.authManager.auth) {
            console.error('Firebase Auth not available for state listener');
            return;
        }
        
        try {
            console.log('🔐 Setting up auth state listener...');
            window.authManager.auth.onAuthStateChanged((user) => {
                console.log('🔄 Auth state changed:', user ? 'User signed in' : 'User signed out');
                if (user) {
                    this.onUserSignedIn(user);
                } else {
                    this.onUserSignedOut();
                }
            }, (error) => {
                console.error('Auth state listener error:', error);
            });
        } catch (error) {
            console.error('Failed to setup auth state listener:', error);
        }
    }

    setupAuthForms() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachFormHandlers();
            });
        } else {
            this.attachFormHandlers();
        }
    }

    // ... rest of your existing methods (handleSignUp, handleSignIn, etc.)

    onUserSignedIn(user) {
        console.log('👤 User signed in:', user.email);
        this.updateUIForAuthState(true);
        
        // Initialize auto-sync if available
        if (window.AutoSyncManager) {
            window.AutoSyncManager.setupAutoSync(user.uid);
        }
        
        // Load user data from Firestore
        this.loadUserData(user.uid);
    }

    onUserSignedOut() {
        console.log('👤 User signed out');
        this.updateUIForAuthState(false);
        this.showAuthForm('signin');
    }

    updateUIForAuthState(isSignedIn) {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        
        if (authForms) {
            authForms.style.display = isSignedIn ? 'none' : 'block';
        }
        if (appContent) {
            appContent.style.display = isSignedIn ? 'block' : 'none';
        }
        
        // Update user info if signed in
        if (isSignedIn) {
            const user = window.authManager?.auth?.currentUser;
            if (user) {
                const userDisplay = document.querySelector('.user-display');
                if (userDisplay) {
                    userDisplay.textContent = user.displayName || user.email;
                }
            }
        }
    }

    // ... rest of your existing methods
}

// Initialize auth module with delay to ensure Firebase is loaded
setTimeout(() => {
    window.authModule = new AuthModule();
}, 500);
