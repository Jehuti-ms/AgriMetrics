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
  signUp(email, password) {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return Promise.resolve({ success: false, error: 'Auth not initialized' });
    }

    return this.auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        console.log('✅ User created:', cred.user.uid, cred.user.email);
        if (window.app) {
          window.app.currentUser = cred.user;
          window.app.showApp();
          window.app.showSection('dashboard');
        }
        return { success: true, user: cred.user };
      })
      .catch((error) => {
        console.error('❌ Sign-up failed:', error.code, error.message);
        this.showNotification(`Sign-up failed: ${error.code} — ${error.message}`, 'error');
        return { success: false, code: error.code, error: error.message };
      });
  }

  // Email/password: sign in
  signIn(email, password) {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return Promise.resolve({ success: false, error: 'Auth not initialized' });
    }

    return this.auth.signInWithEmailAndPassword(email, password)
      .then((cred) => {
        console.log('✅ Signed in:', cred.user.uid, cred.user.email);
        if (window.app) {
          window.app.currentUser = cred.user;
          window.app.showApp();
          window.app.showSection('dashboard');
        }
        return { success: true, user: cred.user };
      })
      .catch((error) => {
        console.error('❌ Sign-in failed:', error.code, error.message);
        this.showNotification(`Sign-in failed: ${error.code} — ${error.message}`, 'error');
        return { success: false, code: error.code, error: error.message };
      });
  }

  // Email/password: sign out
  signOut() {
    if (!this.auth) {
      console.error('⚠️ Auth not initialized');
      return Promise.resolve({ success: false, error: 'Auth not initialized' });
    }

    return this.auth.signOut()
      .then(() => {
        console.log('🚪 Signed out');
        return { success: true };
      })
      .catch((error) => {
        console.error('❌ Sign-out failed:', error.code, error.message);
        return { success: false, code: error.code, error: error.message };
      });
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
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Google sign-in (auto fallback to redirect on GitHub Pages)
  async signInWithGoogle() {
    try {
      console.log('🔐 Starting Google sign-in...');
      console.log('=== ENVIRONMENT INFO ===');
      console.log('Current domain:', window.location.hostname);
      console.log('Full URL:', window.location.href);
      console.log('Protocol:', window.location.protocol);
      console.log('User Agent:', navigator.userAgent);
      console.log('GitHub Pages:', window.location.hostname.includes('github.io'));
      console.log('====================');

      if (window.location.protocol === 'file:') {
        throw new Error('Cannot use Google Sign-In with file:// protocol. Please use a local server (http://localhost).');
      }

      const isGitHubPages = window.location.hostname.includes('github.io');
      if (isGitHubPages) {
        console.log('🌐 GitHub Pages detected - using redirect method');
        return await this.signInWithGoogleRedirect();
      }

      console.log('🎯 Using popup method...');
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      const signInPromise = firebase.auth().signInWithPopup(provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign-in timeout (30s). Please check for popup blockers.')), 30000);
      });

      console.log('⏱️ Waiting for popup response...');
      const result = await Promise.race([signInPromise, timeoutPromise]);

      console.log('🎉 ✅ Google sign-in successful!');
      console.log('📋 USER INFO:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid,
        provider: result.user.providerId,
        emailVerified: result.user.emailVerified,
      });

      this.showNotification(`Welcome ${result.user.displayName || result.user.email}!`, 'success');
      await this.saveUserToFirestore(result.user);

      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
      }, 1000);

      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      let userMessage = `Google sign-in failed: ${error.message}`;
      let shouldTryRedirect = false;

      if (error.code === 'auth/unauthorized-domain') {
        userMessage = `Domain "${window.location.hostname}" is not authorized. Add it to Firebase Console → Authentication → Sign-in method → Authorized domains.`;
      } else if (error.code === 'auth/popup-blocked') {
        userMessage = 'Popup blocked. Please allow popups for this site.';
        shouldTryRedirect = true;
      } else if (error.code === 'auth/popup-closed-by-user') {
        userMessage = 'Sign-in cancelled.';
        if (window.location.hostname.includes('github.io')) shouldTryRedirect = true;
      } else if (error.code === 'auth/cancelled-popup-request') {
        userMessage = 'Another popup is already open. Close it and retry.';
      } else if (error.message.includes('Cross-Origin-Opener-Policy')) {
        userMessage = 'GitHub Pages policy blocks popups. Switching to redirect.';
        shouldTryRedirect = true;
      } else if (error.message.includes('file://')) {
        userMessage = 'Cannot use Google Sign-In when opening file directly. Please run a local server.';
      }

      this.showNotification(userMessage, 'error');

      if (shouldTryRedirect) {
        console.log('🔄 Attempting redirect as fallback...');
        setTimeout(() => this.signInWithGoogleRedirect(), 800);
      }

      return { success: false, error: error.message };
    }
  }

  // Google redirect method
  async signInWithGoogleRedirect() {
    try {
      console.log('🔄 Starting Google sign-in with redirect method...');
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      sessionStorage.setItem('authReturnUrl', window.location.href);
      sessionStorage.setItem('authMethod', 'google-redirect');
      sessionStorage.setItem('authTimestamp', Date.now().toString());

      this.showNotification('Redirecting to Google for sign-in...', 'info');
      await firebase.auth().signInWithRedirect(provider);

      return { success: true, redirecting: true };
    } catch (error) {
      console.error('❌ Redirect sign-in error:', error);
      this.showNotification(`Redirect failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Handle redirect results (static so you can call FirebaseAuth.handleRedirectResult())
  static handleRedirectResult() {
    console.log('🔄 Checking for redirect authentication result...');
    firebase.auth().getRedirectResult()
      .then((result) => {
        if (result.user) {
          console.log('🎉 ✅ Redirect authentication successful!', result.user.email);
          sessionStorage.removeItem('authReturnUrl');
          sessionStorage.removeItem('authMethod');
          sessionStorage.removeItem('authTimestamp');

          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } else {
          console.log('No redirect user found - normal page load');
        }
      })
      .catch((error) => {
        console.error('❌ Redirect result error:', error);
        const returnUrl = sessionStorage.getItem('authReturnUrl') || 'index.html';
        sessionStorage.clear();

        if (error.code !== 'auth/popup-closed-by-user') {
          if (!window.location.href.includes('index.html')) {
            window.location.href = returnUrl;
          }
        }
      });
  }

  // Save Google user to Firestore
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(userData, { merge: true });
      console.log('✅ User data saved to Firestore');
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  }

  // Apple sign-in
  async signInWithApple() {
    try {
      const provider = new firebase.auth.OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const result = await firebase.auth().signInWithPopup(provider);
      this.showNotification('Welcome!', 'success');
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Apple sign-in error:', error);
      this.showNotification(`Apple sign-in failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Render auth buttons
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
