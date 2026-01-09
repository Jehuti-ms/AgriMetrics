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

  // firebase-auth.js

// firebase-auth.js

function signUp(email, password, userData) {
  if (!firebase || !firebase.auth) {
    console.error('Firebase Auth not available');
    return Promise.resolve({ success: false, error: 'Firebase Auth not available' });
  }

  // Keep session persistent across reloads
  return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(() => {}) // ignore persistence errors
    .then(() => firebase.auth().createUserWithEmailAndPassword(email, password))
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('✅ User created:', user.uid, user.email);

      // Optional: save profile data
      if (userData && typeof window.saveUserData === 'function') {
        return window.saveUserData(user.uid, userData).then(() => user);
      }
      return user;
    })
    .then((user) => {
      // Show the app immediately
      if (window.app) {
        window.app.currentUser = user;
        window.app.showApp();
        window.app.showSection('dashboard');
      }
      return { success: true, user };
    })
    .catch((error) => {
      console.error('❌ Sign-up failed:', error.code, error.message);
      // Surface the error so you see it
      if (window.coreModule?.showNotification) {
        window.coreModule.showNotification(`Sign-up failed: ${error.code} — ${error.message}`, 'error');
      } else {
        alert(`Sign-up failed: ${error.code} — ${error.message}`);
      }
      return { success: false, error: error.message, code: error.code };
    });
}



   async signIn(email, password) {
  if (!this.auth) {
    return { success: false, error: 'Firebase Auth not available' };
  }

  try {
    // Keep session persistent across reloads
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});

    // Attempt sign-in
    const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    this.showNotification(`Welcome back ${user.displayName || user.email}!`, 'success');

    // ✅ Show the app immediately
    if (window.app) {
      window.app.currentUser = user;
      window.app.showApp();
      window.app.showSection('dashboard');
    }

    return { success: true, user };
  } catch (error) {
    console.error('Sign-in error:', error);
    this.showNotification(`Sign-in failed: ${error.message}`, 'error');
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
        console.log('=== ENVIRONMENT INFO ===');
        console.log('Current domain:', window.location.hostname);
        console.log('Full URL:', window.location.href);
        console.log('Protocol:', window.location.protocol);
        console.log('User Agent:', navigator.userAgent);
        console.log('GitHub Pages:', window.location.hostname.includes('github.io'));
        console.log('====================');
        
        // Check if we're in a valid environment
        if (window.location.protocol === 'file:') {
            throw new Error('Cannot use Google Sign-In with file:// protocol. Please use a local server (http://localhost).');
        }
        
        // Check for GitHub Pages (needs redirect instead of popup)
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            console.log('🌐 GitHub Pages detected - using redirect method');
            console.log('⚠️ Popups may be blocked by Cross-Origin-Opener-Policy');
            
            // Ask user if they want to use redirect
            const useRedirect = confirm(
                'For GitHub Pages compatibility:\n\n' +
                'We need to use redirect method instead of popup.\n' +
                'You will be taken to Google and then back to this app.\n\n' +
                'Click OK to continue with Google Sign-In,\n' +
                'or Cancel to use Email/Password.'
            );
            
            if (!useRedirect) {
                console.log('User chose to cancel redirect');
                return { success: false, error: 'User cancelled redirect' };
            }
            
            // Use redirect method for GitHub Pages
            return await this.signInWithGoogleRedirect();
        }
        
        console.log('🎯 Using popup method...');
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Add custom parameters for better UX
        provider.setCustomParameters({
            prompt: 'select_account',
            login_hint: '',
            hd: ''
        });
        
        console.log('✅ Google provider created');
        console.log('🪟 Attempting popup...');
        
        // Add timeout to catch popup blockers
        const signInPromise = firebase.auth().signInWithPopup(provider);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Sign-in timeout (30s). Please check for popup blockers.')), 30000);
        });
        
        console.log('⏱️ Waiting for popup response...');
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        console.log('🎉 ✅ Google sign-in successful!');
        console.log('📋 USER INFO:');
        console.log('- Email:', result.user.email);
        console.log('- Display Name:', result.user.displayName);
        console.log('- UID:', result.user.uid);
        console.log('- Provider:', result.user.providerId);
        console.log('- Email Verified:', result.user.emailVerified);
        
        this.showNotification(`Welcome ${result.user.displayName}!`, 'success');
        
        // Save user to Firestore
        await this.saveUserToFirestore(result.user);
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return { success: true, user: result.user };
        
    } catch (error) {
        console.error('❌ Google sign-in error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        
        // Handle specific errors
        let userMessage = `Google sign-in failed: ${error.message}`;
        let shouldTryRedirect = false;
        
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
            shouldTryRedirect = true;
            
        } else if (error.code === 'auth/popup-closed-by-user') {
            userMessage = 'Sign-in was cancelled. Please try again.';
            
            // If on GitHub Pages, suggest redirect
            if (window.location.hostname.includes('github.io')) {
                userMessage += '\n\nGitHub Pages may block popups. Try redirect method?';
                shouldTryRedirect = true;
            }
            
        } else if (error.code === 'auth/cancelled-popup-request') {
            userMessage = 'Another popup is already open. Please close other popups and try again.';
            
        } else if (error.message.includes('Cross-Origin-Opener-Policy')) {
            userMessage = 'GitHub Pages security policy blocks popups. Using redirect method instead...';
            shouldTryRedirect = true;
            
        } else if (error.message.includes('file://')) {
            userMessage = 
                'Cannot use Google Sign-In when opening file directly.\n\n' +
                'Please run a local server:\n' +
                '1. Open terminal in project folder\n' +
                '2. Run: npx serve .\n' +
                '3. Open http://localhost:3000';
        }
        
        this.showNotification(userMessage, 'error');
        
        // Try redirect as fallback
        if (shouldTryRedirect) {
            console.log('🔄 Attempting redirect as fallback...');
            setTimeout(() => {
                const tryRedirect = confirm(
                    'Popup method failed. Would you like to try redirect method instead?\n\n' +
                    'You will be taken to Google and then back here.'
                );
                
                if (tryRedirect) {
                    this.signInWithGoogleRedirect();
                }
            }, 1000);
        }
        
        return { success: false, error: error.message };
    }
}

// Add this new method for redirect authentication
async signInWithGoogleRedirect() {
    try {
        console.log('🔄 Starting Google sign-in with redirect method...');
        console.log('Current domain:', window.location.hostname);
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Store where to return after auth
        sessionStorage.setItem('authReturnUrl', window.location.href);
        sessionStorage.setItem('authMethod', 'google-redirect');
        sessionStorage.setItem('authTimestamp', Date.now().toString());
        
        console.log('📝 Stored auth state in sessionStorage');
        console.log('🔀 Redirecting to Google...');
        
        // Start redirect
        await firebase.auth().signInWithRedirect(provider);
        
        console.log('↪️ Redirect initiated - user will return after authentication');
        
        // Show message (user will be redirected away momentarily)
        this.showNotification('Redirecting to Google for sign-in...', 'info');
        
        return { success: true, redirecting: true };

        // Mark that we're attempting a redirect
        sessionStorage.setItem('googleRedirectAttempt', 'true');
        sessionStorage.setItem('redirectStartTime', Date.now().toString());
        
        console.log('🔀 Starting redirect to Google...');
        await firebase.auth().signInWithRedirect(provider);
        
        return { success: true, redirecting: true };
        
    }catch (error) {
        console.error('❌ Redirect sign-in error:', error);
        this.showNotification(`Redirect failed: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }  
}

// Add this method to handle redirect results
static handleRedirectResult() {
    console.log('🔄 Checking for redirect authentication result...');
    
    firebase.auth().getRedirectResult()
    .then((result) => {
        if (result.user) {
            console.log('🎉 ✅ Redirect authentication successful!');
            console.log('User:', result.user.email);
            
            // Clear stored data
            sessionStorage.removeItem('authReturnUrl');
            sessionStorage.removeItem('authMethod');
            sessionStorage.removeItem('authTimestamp');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            console.log('No redirect user found - normal page load');
        }
    })
    .catch((error) => {
        console.error('❌ Redirect result error:', error);
        
        // Return to original page
        const returnUrl = sessionStorage.getItem('authReturnUrl') || 'index.html';
        sessionStorage.clear();
        
        if (error.code !== 'auth/popup-closed-by-user') {
            console.log('Returning to:', returnUrl);
            // Don't redirect if we're already on index
            if (!window.location.href.includes('index.html')) {
                window.location.href = returnUrl;
            }
        }
    });
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
