// firebase-auth.js - FIXED SIGNUP/SIGNIN FLOW
console.log('Loading Firebase auth...');

// Ensure Firebase is initialized
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase Auth initialized');
} else {
    console.error('❌ Firebase not loaded');
}

class FirebaseAuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('🔧 Initializing Firebase Auth Manager...');
        this.setupAuthStateListener();
        this.setupErrorHandlers();
        this.isInitialized = true;
    }

    setupAuthStateListener() {
        this.auth.onAuthStateChanged((user) => {
            console.log('🔥 Auth state changed:', user ? `User: ${user.email}` : 'No user');
            
            if (user) {
                // User is signed in
                this.handleUserSignedIn(user);
            } else {
                // User is signed out
                this.handleUserSignedOut();
            }
        }, (error) => {
            console.error('❌ Auth state change error:', error);
        });
    }

    setupErrorHandlers() {
        // Handle common auth errors
        this.auth.onAuthStateChanged(() => {}, (error) => {
            console.error('❌ Auth state error:', error.code, error.message);
            this.handleAuthError(error);
        });
    }

    handleAuthError(error) {
        const errorMessages = {
            'auth/invalid-credential': 'Invalid email or password',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'Email already in use',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/invalid-email': 'Invalid email address',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Sign-in popup was closed',
            'auth/cancelled-popup-request': 'Multiple sign-in attempts detected'
        };
        
        const userMessage = errorMessages[error.code] || error.message;
        this.showAuthError(userMessage);
    }

    async signUp(email, password, userData = {}) {
        try {
            console.log('📝 Attempting sign up for:', email);
            
            // Clear any previous errors
            this.clearAuthErrors();
            
            // Validate inputs
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 6 characters');
            }
            
            // Show loading state
            this.showLoading('Creating account...');
            
            // Create user with email/password
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('✅ User created:', userCredential.user.uid);
            
            // Get the user
            const user = userCredential.user;
            
            // Send email verification (optional but recommended)
            await user.sendEmailVerification();
            console.log('📧 Verification email sent');
            
            // Create user profile in Firestore
            await this.createUserProfile(user.uid, email, userData);
            
            // Auto-login the user (Firebase does this automatically)
            console.log('🚀 User auto-logged in after sign-up');
            
            // Show success message
            this.showSuccessMessage('Account created successfully! Redirecting...');
            
            // Return user for immediate use
            return user;
            
        } catch (error) {
            console.error('❌ Sign-up error:', error.code, error.message);
            this.handleAuthError(error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async signIn(email, password) {
        try {
            console.log('🔐 Attempting sign in for:', email);
            
            // Clear any previous errors
            this.clearAuthErrors();
            
            // Validate inputs
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            // Show loading state
            this.showLoading('Signing in...');
            
            // Sign in with email/password
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ Sign in successful:', userCredential.user.email);
            
            // Return user
            return userCredential.user;
            
        } catch (error) {
            console.error('❌ Sign-in error:', error.code, error.message);
            this.handleAuthError(error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async createUserProfile(uid, email, userData) {
        try {
            console.log('📝 Creating user profile for:', uid);
            
            const profileData = {
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: userData.displayName || email.split('@')[0],
                role: 'farmer',
                isDemo: false,
                preferences: {
                    theme: 'auto',
                    currency: 'USD',
                    notifications: true
                },
                farmProfile: {
                    name: userData.farmName || 'My Farm',
                    type: userData.farmType || 'poultry',
                    established: new Date().toISOString().split('T')[0]
                },
                ...userData
            };
            
            // Save to Firestore
            await this.db.collection('users').doc(uid).set(profileData, { merge: true });
            
            console.log('✅ User profile created in Firestore');
            
            // Also save to localStorage as backup
            localStorage.setItem('farm-profile', JSON.stringify(profileData));
            localStorage.setItem('current-user-uid', uid);
            
            return profileData;
            
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            // Don't throw - we can still proceed even if Firestore fails
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 6;
    }

    showLoading(message = 'Loading...') {
        // Create or show loading overlay
        let loadingEl = document.getElementById('auth-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'auth-loading';
            loadingEl.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255,255,255,0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #4CAF50;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 15px;
                    "></div>
                    <div style="color: #333; font-size: 16px; font-weight: 500;">${message}</div>
                </div>
            `;
            document.body.appendChild(loadingEl);
            
            // Add spinner animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        } else {
            loadingEl.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingEl = document.getElementById('auth-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showAuthError(message) {
        console.error('❌ Auth error shown:', message);
        
        // Remove any existing error messages
        this.clearAuthErrors();
        
        // Create error message element
        const errorEl = document.createElement('div');
        errorEl.className = 'auth-error-message';
        errorEl.innerHTML = `
            <div style="
                background: #ffebee;
                color: #c62828;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #c62828;
                margin: 15px 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <span style="font-size: 18px;">⚠️</span>
                <span>${message}</span>
            </div>
        `;
        
        // Insert near auth form
        const authContainer = document.getElementById('auth-container') || 
                            document.querySelector('.auth-form-container') ||
                            document.body;
        
        const form = authContainer.querySelector('form') || 
                    authContainer.querySelector('.auth-form') ||
                    authContainer;
        
        form.insertBefore(errorEl, form.firstChild);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 10000);
    }

    clearAuthErrors() {
        document.querySelectorAll('.auth-error-message').forEach(el => el.remove());
    }

    showSuccessMessage(message) {
        // Create success message
        const successEl = document.createElement('div');
        successEl.className = 'auth-success-message';
        successEl.innerHTML = `
            <div style="
                background: #e8f5e9;
                color: #2e7d32;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
                margin: 15px 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <span style="font-size: 18px;">✅</span>
                <span>${message}</span>
            </div>
        `;
        
        // Insert near auth form
        const authContainer = document.getElementById('auth-container') || 
                            document.querySelector('.auth-form-container') ||
                            document.body;
        
        const form = authContainer.querySelector('form') || 
                    authContainer.querySelector('.auth-form') ||
                    authContainer;
        
        form.insertBefore(successEl, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successEl.parentNode) {
                successEl.remove();
            }
        }, 5000);
    }

    handleUserSignedIn(user) {
        console.log('👤 User signed in:', user.email, user.uid);
        
        // Update last login time
        this.updateLastLogin(user.uid);
        
        // Save user info to localStorage
        localStorage.setItem('current-user-uid', user.uid);
        localStorage.setItem('current-user-email', user.email);
        
        // Check if profile exists, create if not
        this.ensureUserProfile(user);
        
        // Hide auth container, show app
        this.redirectToApp();
    }

    handleUserSignedOut() {
        console.log('👋 User signed out');
        
        // Clear local storage
        localStorage.removeItem('current-user-uid');
        localStorage.removeItem('current-user-email');
        
        // Show auth container
        this.redirectToAuth();
    }

    async ensureUserProfile(user) {
        try {
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                console.log('📝 Creating missing user profile for:', user.uid);
                await this.createUserProfile(user.uid, user.email, {});
            } else {
                console.log('✅ User profile exists');
            }
        } catch (error) {
            console.error('❌ Error checking user profile:', error);
        }
    }

    async updateLastLogin(uid) {
        try {
            await this.db.collection('users').doc(uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('❌ Error updating last login:', error);
        }
    }

    redirectToApp() {
        console.log('🔄 Redirecting to app...');
        
        // Give a small delay for any Firebase operations to complete
        setTimeout(() => {
            // Hide auth, show app
            const authContainer = document.getElementById('auth-container');
            const appContainer = document.getElementById('app-container');
            
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
            
            // Refresh the page to ensure all modules load with user context
            // Or trigger app initialization
            if (window.app && typeof window.app.initializeApp === 'function') {
                window.app.initializeApp();
            } else {
                // Reload the page
                console.log('🔄 Reloading page for clean app initialization...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }, 1000);
    }

    redirectToAuth() {
        console.log('🔄 Redirecting to auth...');
        
        // Show auth, hide app
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }

    // Social sign-in methods
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            this.showLoading('Connecting with Google...');
            
            const result = await this.auth.signInWithPopup(provider);
            console.log('✅ Google sign-in successful:', result.user.email);
            
            return result.user;
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            this.handleAuthError(error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async signInWithGithub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');
            
            this.showLoading('Connecting with GitHub...');
            
            const result = await this.auth.signInWithPopup(provider);
            console.log('✅ GitHub sign-in successful:', result.user.email);
            
            return result.user;
        } catch (error) {
            console.error('❌ GitHub sign-in error:', error);
            this.handleAuthError(error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✅ User signed out');
            return true;
        } catch (error) {
            console.error('❌ Sign-out error:', error);
            return false;
        }
    }
}

// Initialize auth manager
window.firebaseAuthManager = new FirebaseAuthManager();
console.log('✅ Firebase Auth Manager initialized');
