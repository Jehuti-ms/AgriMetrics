// modules/auth.js - FIXED WITH PROPER SIGN-UP FLOW
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
    }

    // ======== SOCIAL LOGIN METHODS ========
    renderSocialLoginButtons() {
        console.log('🔄 Rendering social login buttons...');
        const socialContainer = document.getElementById('social-login-container');
        
        if (socialContainer && window.authManager) {
            console.log('✅ Social container found, rendering buttons...');
            socialContainer.innerHTML = window.authManager.renderAuthButtons();
            console.log('✅ Social buttons HTML rendered');
            
            // Add click handlers
            const googleBtn = socialContainer.querySelector('.btn-social.google');
            const appleBtn = socialContainer.querySelector('.btn-social.apple');
            
            if (googleBtn) {
                googleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('google');
                };
                console.log('✅ Google button found, adding listener');
            }
            
            if (appleBtn) {
                appleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('apple');
                };
                console.log('✅ GitHub button found, adding listener');
            }
            
            console.log('✅ Social buttons rendered with listeners');
        } else {
            console.log('⚠️ Social container or authManager not found');
        }
    }

    // ======== PASSWORD STRENGTH METHODS ========
    setupPasswordValidation() {
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm-password');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.checkPasswordStrength(passwordInput.value);
            });
        }
        
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.checkPasswordMatch(
                    document.getElementById('signup-password')?.value,
                    confirmInput.value
                );
            });
        }
    }
    
    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-progress');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        // Calculate strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;
        
        // Contains numbers
        if (/\d/.test(password)) strength++;
        
        // Contains special characters
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Set visual feedback
        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';
        
        // Set color and text based on strength
        if (password.length === 0) {
            strengthBar.style.backgroundColor = '#ddd';
            strengthText.textContent = '';
        } else if (strength < 2) {
            strengthBar.style.backgroundColor = '#ff4757'; // Red
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ff4757';
        } else if (strength < 4) {
            strengthBar.style.backgroundColor = '#ffa502'; // Orange
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#ffa502';
        } else {
            strengthBar.style.backgroundColor = '#2ed573'; // Green
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#2ed573';
        }
    }
    
    checkPasswordMatch(password, confirmPassword) {
        const matchIndicator = document.querySelector('.password-match-indicator');
        if (!matchIndicator) return;
        
        if (confirmPassword.length === 0) {
            matchIndicator.textContent = '';
            matchIndicator.style.color = '';
        } else if (password === confirmPassword) {
            matchIndicator.textContent = '✓ Passwords match';
            matchIndicator.style.color = '#2ed573'; // Green
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#ff4757'; // Red
        }
    }
    
    // ======== SOCIAL SIGN-IN HANDLER ========
    async handleSocialSignIn(provider) {
        let result;
        const socialContainer = document.getElementById('social-login-container');
        
        if (!socialContainer) return;
        
        // Disable all social buttons
        const buttons = socialContainer.querySelectorAll('.btn-social');
        buttons.forEach(btn => {
            btn.disabled = true;
            const originalText = btn.innerHTML;
            btn.innerHTML = `Signing in with ${provider === 'google' ? 'Google' : 'Apple'}...`;
            btn.dataset.originalText = originalText;
        });
        
        try {
            if (provider === 'google') {
                result = await window.authManager?.signInWithGoogle();
            } else if (provider === 'apple') {
                result = await window.authManager?.signInWithApple();
            }
            
            if (result?.success) {
                this.showNotification(`Signed in with ${provider === 'google' ? 'Google' : 'Apple'}!`, 'success');
                // The auth flow will handle redirection via onAuthStateChanged
            } else {
                this.showNotification(result?.error || `Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}: ${error.message}`, 'error');
        } finally {
            // Re-enable buttons
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.dataset.originalText) {
                    btn.innerHTML = btn.dataset.originalText;
                }
            });
        }
    }
    
    // ======== MAIN AUTH FORM SETUP ========
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
        // RENDER SOCIAL BUTTONS
        this.renderSocialLoginButtons();
        
        // SETUP PASSWORD VALIDATION
        this.setupPasswordValidation();
        
        // SIGN-UP FORM HANDLER - CRITICAL FIX
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
            console.log('✅ Sign-up form handler attached');
        } else {
            console.error('❌ Sign-up form element not found!');
        }

        // SIGN IN FORM HANDLER
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
            console.log('✅ Sign-in form handler attached');
        }

        // FORGOT PASSWORD FORM HANDLER
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
            console.log('✅ Forgot password form handler attached');
        }

        // FORM SWITCHING LISTENERS
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

    // ======== SIGN-UP HANDLER - FIXED ========
    async handleSignUp() {
        console.log('📝 Starting sign-up process...');
        
        const form = document.getElementById('signup-form-element');
        if (!form) {
            this.showNotification('Sign-up form not found', 'error');
            return;
        }
    
        const submitBtn = form.querySelector('button[type="submit"]');
        const name = document.getElementById('signup-name')?.value || '';
        const email = document.getElementById('signup-email')?.value || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';
        const farmName = document.getElementById('farm-name')?.value || '';
    
        // Validate inputs
        if (!email || !password || !confirmPassword || !farmName) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
    
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
            console.log('🔄 Creating Firebase user account...');
            
            // Create user with email/password in Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Firebase user created:', user.uid);
            
            // Update user profile with name
            await user.updateProfile({
                displayName: name
            });
            
            // Save user data to Firestore
            await this.saveUserData(user.uid, {
                name: name,
                email: email,
                farmName: farmName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User data saved to Firestore');
            
            // Show success message
            this.showNotification(`Welcome ${name}! Account created successfully.`, 'success');
            
            // User is automatically logged in after createUserWithEmailAndPassword
            // The onAuthStateChanged listener in app.js will handle the UI transition
            
            // Clear form
            form.reset();
            
        } catch (error) {
            console.error('❌ Sign-up error:', error);
            
            let errorMessage = 'Error creating account: ';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Create Account';
                submitBtn.disabled = false;
            }
        }
    }
    
    // ======== SIGN-IN HANDLER ========
    async handleSignIn() {
        const form = document.getElementById('signin-form-element');
        if (!form) return;
    
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('signin-email')?.value || '';
        const password = document.getElementById('signin-password')?.value || '';
    
        if (!email || !password) {
            this.showNotification('Please enter email and password', 'error');
            return;
        }
    
        if (submitBtn) {
            submitBtn.innerHTML = 'Signing In...';
            submitBtn.disabled = true;
        }
    
        try {
            console.log('🔄 Signing in...');
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ User signed in:', user.email);
            
            // Update last login in Firestore
            await this.updateLastLogin(user.uid);
            
            this.showNotification(`Welcome back, ${user.displayName || user.email}!`, 'success');
            
            // Clear form
            form.reset();
            
        } catch (error) {
            console.error('❌ Sign-in error:', error);
            
            let errorMessage = 'Error signing in: ';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Sign In';
                submitBtn.disabled = false;
            }
        }
    }
    
    // ======== FORGOT PASSWORD HANDLER ========
    async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('forgot-email')?.value || '';

        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            return;
        }

        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Reset Link...';
            submitBtn.disabled = true;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
            this.showAuthForm('signin');
            form.reset();
        } catch (error) {
            console.error('❌ Password reset error:', error);
            
            let errorMessage = 'Error sending reset email: ';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
        }
    }

    // ======== HELPER METHODS ========
    async saveUserData(uid, userData) {
        try {
            if (!firebase.firestore) {
                console.warn('Firestore not available, skipping user data save');
                return;
            }
            
            await firebase.firestore().collection('users').doc(uid).set({
                ...userData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ User data saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving user data:', error);
            // Don't show error to user - this is background operation
        }
    }
    
    async updateLastLogin(uid) {
        try {
            if (!firebase.firestore) return;
            
            await firebase.firestore().collection('users').doc(uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    showAuthForm(formName) {
        console.log(`🔄 Switching to ${formName} form`);
        
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
            // Simple notification fallback
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            
            if (type === 'success') {
                notification.style.backgroundColor = '#4CAF50';
                notification.innerHTML = `✅ ${message}`;
            } else if (type === 'error') {
                notification.style.backgroundColor = '#f44336';
                notification.innerHTML = `❌ ${message}`;
            } else if (type === 'warning') {
                notification.style.backgroundColor = '#ff9800';
                notification.innerHTML = `⚠️ ${message}`;
            } else {
                notification.style.backgroundColor = '#2196F3';
                notification.innerHTML = `ℹ️ ${message}`;
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
            
            // Add animation styles if not present
            if (!document.querySelector('#notification-animations')) {
                const style = document.createElement('style');
                style.id = 'notification-animations';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
}

window.authModule = new AuthModule();

