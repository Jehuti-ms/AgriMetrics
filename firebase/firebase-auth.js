// firebase-auth.js - FIXED WITHOUT REDIRECT HANDLING
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
        this.authStateCallbacks = []; // Store callbacks instead of handling redirects
        this.init();
    }

    init() {
        console.log('🔧 Initializing Firebase Auth Manager...');
        this.setupAuthStateListener();
        this.setupErrorHandlers();
        this.isInitialized = true;
    }

    setupAuthStateListener() {
        // This sets up the listener but doesn't handle redirects
        this.auth.onAuthStateChanged((user) => {
            console.log('🔥 Auth state changed (FirebaseAuthManager):', user ? `User: ${user.email}` : 'No user');
            
            // Call all registered callbacks
            this.authStateCallbacks.forEach(callback => {
                try {
                    callback(user);
                } catch (error) {
                    console.error('❌ Error in auth state callback:', error);
                }
            });
        }, (error) => {
            console.error('❌ Auth state change error:', error);
        });
    }

    // Add callback for auth state changes
    onAuthStateChanged(callback) {
        this.authStateCallbacks.push(callback);
        
        // Call immediately with current user if exists
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            setTimeout(() => callback(currentUser), 0);
        }
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateCallbacks.indexOf(callback);
            if (index > -1) {
                this.authStateCallbacks.splice(index, 1);
            }
        };
    }

    setupErrorHandlers() {
        // Handle common auth errors
        this.auth.onAuthStateChanged(() => {}, (error) => {
            console.error('❌ Auth state error:', error.code, error.message);
            // Don't show errors here - let the form handler show them
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
        
        return errorMessages[error.code] || error.message;
    }

    async signUp(email, password, userData = {}) {
        try {
            console.log('📝 Attempting sign up for:', email);
            
            // Validate inputs
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 6 characters');
            }
            
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
            
            console.log('🚀 User auto-logged in after sign-up');
            
            // Return user - DO NOT redirect here
            return user;
            
        } catch (error) {
            console.error('❌ Sign-up error:', error.code, error.message);
            throw new Error(this.handleAuthError(error));
        }
    }

    async signIn(email, password) {
        try {
            console.log('🔐 Attempting sign in for:', email);
            
            // Validate inputs
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            // Sign in with email/password
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ Sign in successful:', userCredential.user.email);
            
            // Return user - DO NOT redirect here
            return userCredential.user;
            
        } catch (error) {
            console.error('❌ Sign-in error:', error.code, error.message);
            throw new Error(this.handleAuthError(error));
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

    // REMOVE THESE METHODS - they should be handled by app.js
    // handleUserSignedIn()
    // handleUserSignedOut()
    // redirectToApp()
    // redirectToAuth()
    // showAuthError()
    // showSuccessMessage()
    // showLoading()
    // hideLoading()

    // Social sign-in methods
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await this.auth.signInWithPopup(provider);
            console.log('✅ Google sign-in successful:', result.user.email);
            
            return result.user;
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            throw new Error(this.handleAuthError(error));
        }
    }

    async signInWithGithub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');
            
            const result = await this.auth.signInWithPopup(provider);
            console.log('✅ GitHub sign-in successful:', result.user.email);
            
            return result.user;
        } catch (error) {
            console.error('❌ GitHub sign-in error:', error);
            throw new Error(this.handleAuthError(error));
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
