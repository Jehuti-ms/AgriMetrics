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
        console.log('🔐 Starting Google sign-in...');
        console.log('Current domain:', window.location.hostname);
        console.log('Full URL:', window.location.href);
        
        // Check if we're in a valid environment
        if (window.location.protocol === 'file:') {
            throw new Error('Cannot use Google Sign-In with file:// protocol. Please use a local server (http://localhost).');
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        console.log('Google provider created, showing popup...');
        
        // Add timeout to catch popup blockers
        const signInPromise = firebase.auth().signInWithPopup(provider);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Sign-in timeout. Please check for popup blockers.')), 30000);
        });
        
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        console.log('✅ Google sign-in successful!');
        console.log('User email:', result.user.email);
        console.log('User display name:', result.user.displayName);
        
        this.showNotification(`Welcome ${result.user.displayName}!`, 'success');
        
        // Save user to Firestore
        await this.saveUserToFirestore(result.user);
        
        return { success: true, user: result.user };
        
    } catch (error) {
        console.error('❌ Google sign-in error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Handle specific errors
        let userMessage = `Google sign-in failed: ${error.message}`;
        
        if (error.code === 'auth/unauthorized-domain') {
            userMessage = 
                `Domain "${window.location.hostname}" is not authorized.\n\n` +
                `Please add it to Firebase Console:\n` +
                `1. Go to Firebase Console → Authentication\n` +
                `2. Click "Sign-in method" tab\n` +
                `3. Scroll to "Authorized domains"\n` +
                `4. Add: "localhost" and "${window.location.hostname}"`;
                
        } else if (error.code === 'auth/popup-blocked') {
            userMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
            
        } else if (error.code === 'auth/popup-closed-by-user') {
            userMessage = 'Sign-in was cancelled. Please try again.';
            
        } else if (error.message.includes('file://')) {
            userMessage = 
                'Cannot use Google Sign-In when opening file directly.\n\n' +
                'Please run a local server:\n' +
                '1. Open terminal in project folder\n' +
                '2. Run: npx serve .\n' +
                '3. Open http://localhost:3000';
        }
        
        this.showNotification(userMessage, 'error');
        return { success: false, error: error.message };
    }
}

async saveUserToFirestore(user) {
    try {
        if (!firebase.firestore) {
            console.log('Firestore not available, skipping user save');
            return;
        }
        
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: 'google',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await userRef.set(userData, { merge: true });
        console.log('✅ User data saved to Firestore');
        
    } catch (error) {
        console.error('Error saving user to Firestore:', error);
        // Don't show error to user - this is background operation
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
