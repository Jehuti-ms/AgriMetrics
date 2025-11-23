// modules/auth.js - Authentication module
class AuthModule {
    constructor() {
        this.app = window.app;
        this.core = window.coreModule;
        this.init();
    }

    init() {
        console.log('Auth module initialized');
        this.setupAuthForms();
        this.setupAuthListeners();
    }

    setupAuthForms() {
        // Sign up form
        document.getElementById('signup-form-element').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSignUp();
        });

        // Sign in form
        document.getElementById('signin-form-element').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSignIn();
        });

        // Forgot password form
        document.getElementById('forgot-password-form-element').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleForgotPassword();
        });

        // Google sign in
        document.getElementById('google-signin').addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleGoogleSignIn();
        });
    }

    setupAuthListeners() {
        // Form switching
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('signup');
        });

        document.getElementById('show-signin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('signin');
        });

        document.getElementById('show-forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('forgot-password');
        });

        document.getElementById('show-signin-from-forgot').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('signin');
        });
    }

    async handleSignUp() {
        const form = document.getElementById('signup-form-element');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value;

        // Validation
        if (password !== confirmPassword) {
            this.core.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.core.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        submitBtn.innerHTML = '<div class="spinner"></div>Creating Account...';
        submitBtn.disabled = true;

        try {
            const result = await window.authManager.signUp(email, password, {
                name: name,
                email: email,
                farmName: farmName,
                createdAt: new Date().toISOString()
            });

            if (result.success) {
                this.core.showNotification('Account created successfully!', 'success');
                // User will be automatically redirected via auth state listener
            } else {
                this.core.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.core.showNotification('Error creating account', 'error');
        } finally {
            submitBtn.innerHTML = 'Create Account';
            submitBtn.disabled = false;
        }
    }

    async handleSignIn() {
        const form = document.getElementById('signin-form-element');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        submitBtn.innerHTML = '<div class="spinner"></div>Signing In...';
        submitBtn.disabled = true;

        try {
            const result = await window.authManager.signIn(email, password);

            if (result.success) {
                this.core.showNotification('Welcome back!', 'success');
            } else {
                this.core.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.core.showNotification('Error signing in', 'error');
        } finally {
            submitBtn.innerHTML = 'Sign In';
            submitBtn.disabled = false;
        }
    }

    async handleGoogleSignIn() {
        const button = document.getElementById('google-signin');
        const originalText = button.innerHTML;

        button.innerHTML = '<div class="spinner"></div>Signing in with Google...';
        button.disabled = true;

        try {
            const result = await window.authManager.signInWithGoogle();

            if (result.success) {
                this.core.showNotification('Signed in with Google!', 'success');
                
                // Check if it's a new user and create user document if needed
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(result.user.uid)
                    .get();

                if (!userDoc.exists) {
                    await window.authManager.saveUserData(result.user.uid, {
                        name: result.user.displayName,
                        email: result.user.email,
                        farmName: `${result.user.displayName}'s Farm`,
                        createdAt: new Date().toISOString()
                    });
                }
            } else {
                this.core.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.core.showNotification('Error signing in with Google', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form-element');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const email = document.getElementById('forgot-email').value;

        submitBtn.innerHTML = '<div class="spinner"></div>Sending Reset Link...';
        submitBtn.disabled = true;

        try {
            const result = await window.authManager.resetPassword(email);

            if (result.success) {
                this.core.showNotification('Password reset email sent! Check your inbox.', 'success');
                this.showAuthForm('signin');
            } else {
                this.core.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.core.showNotification('Error sending reset email', 'error');
        } finally {
            submitBtn.innerHTML = 'Send Reset Link';
            submitBtn.disabled = false;
        }
    }

    showAuthForm(formName) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${formName}-form`).classList.add('active');
        
        // Clear forms when switching
        if (formName === 'signin') {
            document.getElementById('signin-form-element').reset();
        } else if (formName === 'signup') {
            document.getElementById('signup-form-element').reset();
        }
    }
}

// Initialize auth module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authModule = new AuthModule();
});
