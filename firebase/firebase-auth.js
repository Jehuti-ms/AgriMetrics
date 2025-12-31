// firebase-auth.js - COMPLETE WITH ALL METHODS
console.log('Loading Firebase auth...');

class FirebaseAuth {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authStateListeners = [];
        this.isLoggingOut = false;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            this.auth = firebase.auth();
            this.setupAuthStateListener();
            console.log('✅ Firebase Auth initialized');
        } else {
            console.log('⚠️ Firebase Auth not available');
        }
    }

    setupAuthStateListener() {
        if (!this.auth) return;
        
        this.auth.onAuthStateChanged((user) => {
            console.log('🔍 Firebase auth state changed:', user ? `User: ${user.email}` : 'No user');
            
            // Skip if we're in the middle of logout
            if (this.isLoggingOut) {
                console.log('🚫 Ignoring auth state change during logout');
                return;
            }
            
            this.currentUser = user;
            
            // Notify all listeners
            this.authStateListeners.forEach(callback => callback(user));
            
            // Store in sessionStorage for app.js to check
            if (user) {
                sessionStorage.setItem('firebaseUser', user.email);
                console.log('📝 Firebase user stored in session');
            } else {
                sessionStorage.removeItem('firebaseUser');
                console.log('🗑️ Firebase user removed from session');
            }
        });
    }

    async signUp(email, password, userData) {
        if (!this.auth) {
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            if (userData) {
                await this.saveUserData(userCredential.user.uid, userData);
            }
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        if (!this.auth) {
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
            // Set persistence to SESSION (not LOCAL)
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        if (!this.auth) {
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
            // Set persistence to SESSION
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await this.auth.signInWithPopup(provider);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        if (!this.auth) {
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ADD THIS CRITICAL METHOD
    async signOut() {
        console.log('🚪 Firebase signOut called');
        this.isLoggingOut = true;
        
        if (!this.auth) {
            console.log('⚠️ Firebase Auth not available for sign out');
            this.isLoggingOut = false;
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
            // CRITICAL: Set persistence to NONE before sign out
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
            
            // Sign out
            await this.auth.signOut();
            
            // Clear Firebase's internal storage
            this.clearFirebaseStorage();
            
            // Clear current user
            this.currentUser = null;
            
            // Clear session storage
            sessionStorage.removeItem('firebaseUser');
            
            console.log('✅ Firebase sign out successful');
            
            // Reset flag after a delay
            setTimeout(() => {
                this.isLoggingOut = false;
            }, 1000);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Firebase sign out error:', error);
            this.isLoggingOut = false;
            return { success: false, error: error.message };
        }
    }

    clearFirebaseStorage() {
        try {
            // Clear Firebase's localStorage keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('firebase') || key.includes('auth')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
            });
            
            // Clear IndexedDB Firebase data
            if (window.indexedDB) {
                indexedDB.deleteDatabase('firebaseLocalStorageDb');
            }
        } catch (error) {
            console.error('Error clearing Firebase storage:', error);
        }
    }

    async saveUserData(uid, userData) {
        if (!firebase.firestore) {
            return { success: false, error: 'Firestore not available' };
        }
        
        try {
            await firebase.firestore().collection('users').doc(uid).set({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ADD THIS METHOD: onAuthStateChanged listener
    onAuthStateChanged(callback) {
        if (!this.auth) {
            console.warn('⚠️ Firebase Auth not available for listener');
            return () => {}; // Return empty unsubscribe function
        }
        
        // Store the callback
        this.authStateListeners.push(callback);
        
        // Call immediately with current state if available
        if (this.currentUser !== undefined) {
            setTimeout(() => callback(this.currentUser), 0);
        }
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Helper methods for app integration
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    shouldAutoLogin() {
        // Check if user explicitly logged out
        const forceLogout = sessionStorage.getItem('forceLogout') === 'true';
        const stayLoggedOut = sessionStorage.getItem('stayLoggedOut') === 'true';
        
        if (forceLogout || stayLoggedOut) {
            console.log('🚫 Auto-login disabled by logout flag');
            return false;
        }
        
        return true;
    }
}

window.authManager = new FirebaseAuth();

// Add global logout helper
window.firebaseSignOut = async function() {
    if (window.authManager) {
        return await window.authManager.signOut();
    }
    return { success: false, error: 'Auth manager not available' };
};

console.log('✅ Firebase Auth Manager ready');
