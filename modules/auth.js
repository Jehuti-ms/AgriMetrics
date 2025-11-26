// modules/auth.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
        this.setupAuthStateListener();
    }

    setupAuthForms() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachFormHandlers();
            });
        } else {
            this.attachFormHandlers();
        }
    }

    setupAuthStateListener() {
        // Listen for auth state changes
        if (window.authManager && window.authManager.auth) {
            window.authManager.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.onUserSignedIn(user);
                } else {
                    this.onUserSignedOut();
                }
            });
        }
    }

    attachFormHandlers() {
        // Sign up form
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
        }

        // Sign in form
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        // Google sign in
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleGoogleSignIn();
            });
        }

        // Sign out button
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleSignOut();
            });
        }

        this.setupAuthListeners();
    }

    setupAuthListeners() {
        // Form switching
        const showSignup = document.getElementById('show-signup');
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('signup');
            });
        }

        const showSignin = document.getElementById('show-signin');
        if (showSignin) {
            showSignin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('signin');
            });
        }

        const showForgot = document.getElementById('show-forgot-password');
        if (showForgot) {
            showForgot.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('forgot-password');
            });
        }

        const showSigninFromForgot = document.getElementById('show-signin-from-forgot');
        if (showSigninFromForgot) {
            showSigninFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('signin');
            });
        }
    }

    async handleSignUp() {
        const form = document.getElementById('signup-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const name = document.getElementById('signup-name')?.value || '';
        const email = document.getElementById('signup-email')?.value || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';
        const farmName = document.getElementById('farm-name')?.value || '';

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (submitBtn) {
            submitBtn.innerHTML = 'Creating Account...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager?.signUp(email, password, {
                name: name,
                email: email,
                farmName: farmName,
                createdAt: new Date().toISOString()
            });

            if (result?.success) {
                this.showNotification('Account created successfully!', 'success');
                // Clear form
                form.reset();
                // Auto sign-in after successful registration
                if (typeof window.onAuthSuccess === 'function') {
                    window.onAuthSuccess();
                }
            } else {
                this.showNotification(result?.error || 'Error creating account', 'error');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            this.showNotification('Error creating account', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Create Account';
                submitBtn.disabled = false;
            }
        }
    }

    async handleSignIn() {
        const form = document.getElementById('signin-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('signin-email')?.value || '';
        const password = document.getElementById('signin-password')?.value || '';

        if (submitBtn) {
            submitBtn.innerHTML = 'Signing In...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager?.signIn(email, password);

            if (result?.success) {
                this.showNotification('Welcome back!', 'success');
                // Clear form
                form.reset();
                // Initialize auto-sync if available
                if (window.AutoSyncManager) {
                    window.AutoSyncManager.setupAutoSync(result.user.uid);
                }
                // Trigger auth success callback
                if (typeof window.onAuthSuccess === 'function') {
                    window.onAuthSuccess();
                }
            } else {
                this.showNotification(result?.error || 'Error signing in', 'error');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            this.showNotification('Error signing in', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Sign In';
                submitBtn.disabled = false;
            }
        }
    }

    async handleGoogleSignIn() {
        const button = document.getElementById('google-signin');
        if (!button) return;

        const originalText = button.innerHTML;
        button.innerHTML = 'Signing in with Google...';
        button.disabled = true;

        try {
            const result = await window.authManager?.signInWithGoogle();

            if (result?.success) {
                this.showNotification('Signed in with Google!', 'success');
                // Initialize auto-sync if available
                if (window.AutoSyncManager && result.user) {
                    window.AutoSyncManager.setupAutoSync(result.user.uid);
                }
                // Trigger auth success callback
                if (typeof window.onAuthSuccess === 'function') {
                    window.onAuthSuccess();
                }
            } else {
                this.showNotification(result?.error || 'Error signing in with Google', 'error');
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showNotification('Error signing in with Google', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('forgot-email')?.value || '';

        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Reset Link...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager?.resetPassword(email);

            if (result?.success) {
                this.showNotification('Password reset email sent! Check your inbox.', 'success');
                this.showAuthForm('signin');
                form.reset();
            } else {
                this.showNotification(result?.error || 'Error sending reset email', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Error sending reset email', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
        }
    }

    async handleSignOut() {
        try {
            await window.authManager?.auth.signOut();
            this.showNotification('Signed out successfully', 'success');
        } catch (error) {
            console.error('Sign out error:', error);
            this.showNotification('Error signing out', 'error');
        }
    }

    onUserSignedIn(user) {
        console.log('User signed in:', user);
        // Update UI for signed-in state
        this.updateUIForAuthState(true);
        
        // Initialize auto-sync
        if (window.AutoSyncManager) {
            window.AutoSyncManager.setupAutoSync(user.uid);
        }
        
        // Load user data from Firestore
        this.loadUserData(user.uid);
    }

    onUserSignedOut() {
        console.log('User signed out');
        // Update UI for signed-out state
        this.updateUIForAuthState(false);
        
        // Show auth forms
        this.showAuthForm('signin');
    }

    updateUIForAuthState(isSignedIn) {
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        const userProfile = document.querySelector('.user-profile');
        
        if (authForms) authForms.style.display = isSignedIn ? 'none' : 'block';
        if (appContent) appContent.style.display = isSignedIn ? 'block' : 'none';
        
        // Update user profile info if available
        if (isSignedIn && userProfile) {
            const user = window.authManager?.auth.currentUser;
            if (user) {
                const userName = user.displayName || user.email;
                userProfile.querySelector('.user-name').textContent = userName;
            }
        }
    }

   // In modules/auth.js - update the loadUserData method
async loadUserData(userId) {
    try {
        // Check if FirestoreService is available
        if (!window.firestoreService) {
            console.log('FirestoreService not available yet');
            return;
        }

        // Load user profile
        const profileDoc = await window.firestoreService.getUserProfile(userId);
        if (profileDoc.exists) {
            const userData = profileDoc.data();
            console.log('User profile loaded:', userData);
            
            // Update UI with user data
            this.updateUserProfileUI(userData);
        } else {
            // Create user profile if it doesn't exist
            const user = window.authManager?.auth?.currentUser;
            if (user) {
                await window.firestoreService.createUserProfile(userId, {
                    name: user.displayName || '',
                    email: user.email,
                    farmName: '',
                    createdAt: new Date().toISOString()
                });
            }
        }
        
        // Load farm data for all modules
        const dataTypes = ['inventory', 'transactions', 'production', 'orders', 'sales', 'projects', 'feedRecords'];
        
        for (const dataType of dataTypes) {
            try {
                const data = await window.firestoreService.loadFarmData(userId, dataType);
                if (data.length > 0 && window.FarmModules) {
                    window.FarmModules.appData[dataType] = data;
                    window.FarmModules.saveDataToStorage();
                }
            } catch (error) {
                console.error(`Error loading ${dataType}:`, error);
            }
        }
        
        // Refresh current module view
        if (window.FarmModules) {
            const activeModule = document.querySelector('.section.active')?.id;
            if (activeModule && window.FarmModules.modules[activeModule]) {
                window.FarmModules.modules[activeModule].renderHistory();
            }
        }
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

    updateUserProfileUI(userData) {
        // Update any profile-related UI elements
        const profileElements = document.querySelectorAll('[data-user-profile]');
        profileElements.forEach(element => {
            const field = element.getAttribute('data-user-profile');
            if (userData[field]) {
                element.textContent = userData[field];
            }
        });
    }

    showAuthForm(formName) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Initialize auth module
window.authModule = new AuthModule();

// Global auth success callback
window.onAuthSuccess = function() {
    console.log('Authentication successful');
    // You can add any post-auth logic here
    if (window.FarmModules) {
        window.FarmModules.loadData();
    }
};
