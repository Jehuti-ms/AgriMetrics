// firebase-auth.js - FIXED GOOGLE SIGN-IN
console.log('Loading Firebase auth...');

class FirebaseAuth {
    constructor() {
        this.auth = null;
        if (typeof firebase !== 'undefined' && firebase.auth) {
            this.auth = firebase.auth();
            console.log('✅ Firebase Auth initialized');
        } else {
            console.log('⚠️ Firebase Auth not available');
        }
    }

    // ======== EMAIL/PASSWORD AUTH METHODS ========
    async signUp(email, password, userData) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update display name if provided
            if (userData?.name) {
                await user.updateProfile({
                    displayName: userData.name
                });
            }
            
            // Save user data to Firestore
            await this.saveUserToFirestore(user, {
                ...userData,
                provider: 'email'
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Sign-up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update last login
            await this.saveUserToFirestore(user, {
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    // ======== GOOGLE SIGN-IN ========
    async signInWithGoogle() {
        try {
            console.log('🔐 Starting Google sign-in...');
            
            // Check environment
            if (window.location.protocol === 'file:') {
                throw new Error('Cannot use Google Sign-In with file:// protocol. Please use a local server.');
            }
            
            // Check for GitHub Pages
            const isGitHubPages = window.location.hostname.includes('github.io');
            
            if (isGitHubPages) {
                console.log('🌐 GitHub Pages detected - using redirect method');
                return await this.signInWithGoogleRedirect();
            }
            
            // Use popup method for local/dev
            console.log('🎯 Using popup method...');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            console.log('✅ Google provider created');
            
            // Add timeout for popup
            const signInPromise = this.auth.signInWithPopup(provider);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sign-in timeout (30s)')), 30000);
            });
            
            console.log('⏱️ Waiting for popup response...');
            const result = await Promise.race([signInPromise, timeoutPromise]);
            
            console.log('🎉 Google sign-in successful!');
            console.log('User:', result.user.email);
            
            // Save user to Firestore
            await this.saveUserToFirestore(result.user, {
                provider: 'google'
            });
            
            return { success: true, user: result.user };
            
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            
            let userMessage = `Google sign-in failed: ${error.message}`;
            
            if (error.code === 'auth/popup-blocked') {
                userMessage = 'Popup was blocked. Trying redirect method...';
                // Try redirect as fallback
                return await this.signInWithGoogleRedirect();
            } else if (error.code === 'auth/unauthorized-domain') {
                userMessage = `Domain "${window.location.hostname}" is not authorized in Firebase Console.`;
            }
            
            this.showNotification(userMessage, 'error');
            return { success: false, error: error.message };
        }
    }

    // Redirect method for GitHub Pages
    async signInWithGoogleRedirect() {
        try {
            console.log('🔄 Starting Google sign-in redirect...');
            
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            // Store current URL to return after auth
            sessionStorage.setItem('authReturnUrl', window.location.href);
            sessionStorage.setItem('authMethod', 'google-redirect');
            
            console.log('🔀 Redirecting to Google...');
            await this.auth.signInWithRedirect(provider);
            
            return { success: true, redirecting: true };
            
        } catch (error) {
            console.error('❌ Redirect sign-in error:', error);
            this.showNotification(`Redirect failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    // ======== APPLE SIGN-IN ========
    async signInWithApple() {
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            
            const result = await this.auth.signInWithPopup(provider);
            
            // Save user to Firestore
            await this.saveUserToFirestore(result.user, {
                provider: 'apple'
            });
            
            this.showNotification(`Welcome!`, 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Apple sign-in error:', error);
            this.showNotification(`Apple sign-in failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    // ======== USER DATA MANAGEMENT ========
    async saveUserToFirestore(user, additionalData = {}) {
        try {
            if (!firebase.firestore) {
                console.log('Firestore not available, skipping user save');
                return;
            }
            
            const userRef = firebase.firestore().collection('users').doc(user.uid);
            
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || additionalData.name || '',
                photoURL: user.photoURL || '',
                provider: additionalData.provider || 'unknown',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                ...additionalData
            };
            
            // Remove undefined values
            Object.keys(userData).forEach(key => {
                if (userData[key] === undefined) {
                    delete userData[key];
                }
            });
            
            await userRef.set(userData, { merge: true });
            console.log('✅ User data saved to Firestore');
            
        } catch (error) {
            console.error('Error saving user to Firestore:', error);
        }
    }
    
    // ======== UI METHODS ========
    renderAuthButtons() {
        return `
            <div class="social-buttons-container">
                <button class="btn-social google" data-provider="google">
                    <span class="social-icon">G</span>
                    Continue with Google
                </button>
                <button class="btn-social apple" data-provider="apple">
                    <span class="social-icon"></span>
                    Continue with Apple
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create simple one
        if (window.authModule && typeof window.authModule.showNotification === 'function') {
            window.authModule.showNotification(message, type);
        } else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    }
    
    // Static method to handle redirect results
    static handleRedirectResult() {
        console.log('🔄 Checking for redirect authentication result...');
        
        firebase.auth().getRedirectResult()
        .then((result) => {
            if (result.user) {
                console.log('🎉 Redirect authentication successful!');
                console.log('User:', result.user.email);
                
                // Clear stored data
                sessionStorage.removeItem('authReturnUrl');
                sessionStorage.removeItem('authMethod');
                
                // Show success message
                if (window.authManager) {
                    window.authManager.showNotification(`Welcome ${result.user.displayName || result.user.email}!`, 'success');
                }
                
            } else {
                console.log('No redirect user found');
            }
        })
        .catch((error) => {
            console.error('❌ Redirect result error:', error);
            
            // Don't show error for "no user" cases
            if (error.code !== 'auth/no-auth-event' && 
                error.code !== 'auth/popup-closed-by-user') {
                console.error('Redirect authentication failed:', error);
            }
            
            // Clear session storage
            sessionStorage.removeItem('authReturnUrl');
            sessionStorage.removeItem('authMethod');
        });
    }
}

// Initialize auth manager
window.authManager = new FirebaseAuth();

// Handle redirect results on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        FirebaseAuth.handleRedirectResult();
    }
});

