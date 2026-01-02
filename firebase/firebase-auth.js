// firebase-auth.js
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
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
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

    // Google Sign-in
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await firebase.auth().signInWithPopup(provider);
            this.showNotification(`Welcome ${result.user.displayName}!`, 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showNotification(`Google sign-in failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    // Apple Sign-in (requires proper setup in Firebase console)
    async signInWithApple() {
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            
            const result = await firebase.auth().signInWithPopup(provider);
            this.showNotification(`Welcome!`, 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Apple sign-in error:', error);
            this.showNotification(`Apple sign-in failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    // Add to auth UI
    renderAuthButtons() {
        return `
            <button class="btn-social google" onclick="authManager.signInWithGoogle()">
                <span class="social-icon">G</span>
                Continue with Google
            </button>
            <button class="btn-social apple" onclick="authManager.signInWithApple()">
                <span class="social-icon"></span>
                Continue with Apple
            </button>
            <div class="auth-divider">
                <span>or</span>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else if (type === 'warning') {
            console.warn('⚠️ ' + message);
            alert('⚠️ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    }
}

window.authManager = new FirebaseAuth();
