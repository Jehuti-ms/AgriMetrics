// firebase-auth-fixed.js
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

    // Expose auth state changes for AutoSyncManager
    onAuthStateChanged(callback) {
        if (this.auth) {
            this.auth.onAuthStateChanged(callback);
        }
    }

    async signUp(email, password, userData) {
        if (!this.auth) return { success: false, error: 'Firebase Auth not available' };
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            if (userData) await this.saveUserData(userCredential.user.uid, userData);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        if (!this.auth) return { success: false, error: 'Firebase Auth not available' };
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        if (!this.auth) return { success: false, error: 'Firebase Auth not available' };
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async saveUserData(uid, userData) {
        if (!firebase.firestore) return { success: false, error: 'Firestore not available' };
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

    // Google Sign-in (popup first, fallback to redirect)
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await firebase.auth().signInWithPopup(provider);
            await this.saveUserToFirestore(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            // Fallback to redirect if popup blocked
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                return this.signInWithGoogleRedirect();
            }
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogleRedirect() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            sessionStorage.setItem('googleRedirectAttempt', 'true');
            await firebase.auth().signInWithRedirect(provider);
            return { success: true, redirecting: true };
        } catch (error) {
            console.error('Redirect sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    async saveUserToFirestore(user) {
        if (!firebase.firestore) return;
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: 'google',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    async signInWithApple() {
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            const result = await firebase.auth().signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Apple sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    renderAuthButtons() {
        return `
            <button class="btn-social google">
                <span class="social-icon">G</span>
                Continue with Google
            </button>
            <button class="btn-social apple">
                <span class="social-icon"></span>
                Continue with Apple
            </button>
        `;
    }
}

window.authManager = new FirebaseAuth();
