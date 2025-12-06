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

    async signInWithGoogle() {
        if (!this.auth) {
            return { success: false, error: 'Firebase Auth not available' };
        }
        
        try {
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
}

window.authManager = new FirebaseAuth();
