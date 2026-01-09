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

  // Email/password: sign up
  async signUp(email, password, userData = {}) {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;
      console.log("✅ User created:", user.uid, user.email);

      // Save user profile to Firestore
      await this.saveUserData(user.uid, {
        email: user.email,
        ...userData
      });

      if (window.app) {
        window.app.currentUser = user;
        window.app.showApp();
        window.app.showSection("dashboard");
      }

      return { success: true, user };
    } catch (error) {
      console.error("❌ Sign-up failed:", error.code, error.message);
      this.showNotification(`Sign-up failed: ${error.code} — ${error.message}`, 'error');
      return { success: false, code: error.code, error: error.message };
    }
  }

  // Email/password: sign in
  async signIn(email, password) {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      const cred = await this.auth.signInWithEmailAndPassword(email, password);
      const user = cred.user;
      console.log("✅ Signed in:", user.uid, user.email);

      if (window.app) {
        window.app.currentUser = user;
        window.app.showApp();
        window.app.showSection("dashboard");
      }

      return { success: true, user };
    } catch (error) {
      console.error("❌ Sign-in failed:", error.code, error.message);
      this.showNotification(`Sign-in failed: ${error.code} — ${error.message}`, 'error');
      return { success: false, code: error.code, error: error.message };
    }
  }

  // Email/password: sign out
  async signOut() {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return { success: false, error: 'Auth not initialized' };
    }

    try {
      await this.auth.signOut();
      console.log('🚪 Signed out');
      this.currentUser = null;

      if (window.app) {
        window.app.currentUser = null;
        window.app.showAuth();
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Sign-out failed:', error.code, error.message);
      this.showNotification(`Sign-out failed: ${error.code} — ${error.message}`, 'error');
      return { success: false, code: error.code, error: error.message };
    }
  }

  // Password reset
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

  // Save generic user data (Firestore)
  async saveUserData(uid, userData) {
    if (!firebase.firestore) {
      return { success: false, error: 'Firestore not available' };
    }

    try {
      await firebase.firestore().collection('users').doc(uid).set({
        ...userData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log('✅ User data saved to Firestore');
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return { success: false, error: error.message };
    }
  }

  // Notifications
  showNotification(message, type = 'info') {
    const ui = window.coreModule?.showNotification;
    if (typeof ui === 'function') {
      ui(message, type);
      return;
    }

    if (type === 'error') {
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

// Expose a single manager instance
window.authManager = new FirebaseAuth();
