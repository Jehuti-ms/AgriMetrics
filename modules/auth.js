// modules/auth.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.authInitialized = false;
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
        this.waitForFirebase();
    }

    waitForFirebase() {
        const checkFirebase = () => {
            if (window.authManager && window.authManager.auth) {
                this.setupAuthStateListener();
                this.authInitialized = true;
            } else {
                console.log('⏳ Waiting for Firebase auth...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    }

    setupAuthStateListener() {
        if (!window.authManager || !window.authManager.auth) {
            console.error('Firebase Auth not available for state listener');
            return;
        }
        
        try {
            console.log('🔐 Setting up auth state listener...');
            window.authManager.auth.onAuthStateChanged((user) => {
                console.log('🔄 Auth state changed:', user ? 'User signed in' : 'User signed out');
                if (user) {
                    this.onUserSignedIn(user);
                } else {
                    this.onUserSignedOut();
                }
            }, (error) => {
                console.error('Auth state listener error:', error);
            });
        } catch (error) {
            console.error('Failed to setup auth state listener:', error);
        }
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

    attachFormHandlers() {
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
        }

        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleGoogleSignIn();
            });
        }

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
                form.reset();
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
                form.reset();
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
        console.log('👤 User signed in:', user.email);
        this.updateUIForAuthState(true);
    }

    onUserSignedOut() {
        console.log('👤 User signed out');
        this.updateUIForAuthState(false);
        this.showAuthForm('signin');
    }

    updateUIForAuthState(isSignedIn) {
        console.log('🔄 Updating UI for auth state:', isSignedIn);
        
        const authForms = document.querySelector('.auth-forms');
        const appContent = document.querySelector('.app-content');
        
        if (authForms) {
            authForms.style.display = isSignedIn ? 'none' : 'block';
        }
        
        if (appContent) {
            appContent.style.display = isSignedIn ? 'block' : 'none';
        }
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

setTimeout(() => {
    window.authModule = new AuthModule();
}, 500);
