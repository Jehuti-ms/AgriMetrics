// modules/auth.js - FIXED FORGOT PASSWORD
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
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
        console.log('🔧 Attaching form handlers...');
        
        // SIGN-UP FORM HANDLER
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            console.log('✅ Found sign-up form');
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
            
            // Setup password validation for sign-up form
            this.setupPasswordValidation();
        }

        // SIGN IN FORM HANDLER
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            console.log('✅ Found sign-in form');
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        // FORGOT PASSWORD FORM HANDLER
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            console.log('✅ Found forgot password form');
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        // FORM SWITCHING LISTENERS
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        console.log('🔧 Setting up auth listeners...');
        
        // Show Sign Up form
        const showSignup = document.getElementById('show-signup');
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switching to signup form');
                this.showAuthForm('signup');
            });
        }

        // Show Sign In form
        const showSignin = document.getElementById('show-signin');
        if (showSignin) {
            showSignin.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switching to signin form');
                this.showAuthForm('signin');
            });
        }

        // Show Forgot Password form
        const showForgot = document.getElementById('show-forgot-password');
        if (showForgot) {
            showForgot.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switching to forgot password form');
                this.showAuthForm('forgot-password');
            });
        }

        // Back to Sign In from Forgot Password
        const showSigninFromForgot = document.getElementById('show-signin-from-forgot');
        if (showSigninFromForgot) {
            showSigninFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switching back to signin form');
                this.showAuthForm('signin');
            });
        }
    }

    // ======== FORGOT PASSWORD HANDLER ========
    async handleForgotPassword() {
        console.log('🔐 Handling forgot password request...');
        
        const form = document.getElementById('forgot-password-form-element');
        if (!form) {
            console.error('❌ Forgot password form not found');
            this.showNotification('Form error. Please refresh the page.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const emailInput = document.getElementById('forgot-email');
        const email = emailInput?.value.trim() || '';

        // Validate email
        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        // Disable button and show loading
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }

        try {
            console.log('📧 Sending password reset email to:', email);
            
            // Send password reset email using Firebase
            await firebase.auth().sendPasswordResetEmail(email);
            
            console.log('✅ Password reset email sent successfully');
            
            // Show success message
            this.showNotification(
                '✅ Password reset email sent! Check your inbox (and spam folder) for reset instructions.',
                'success'
            );
            
            // Clear the form
            form.reset();
            
            // Switch back to sign-in form after 2 seconds
            setTimeout(() => {
                this.showAuthForm('signin');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            
            let errorMessage = 'Error: ';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/missing-email':
                    errorMessage = 'Please enter your email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please try again in a few minutes.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            this.showNotification(errorMessage, 'error');
            
        } finally {
            // Re-enable button
            if (submitBtn) {
                submitBtn.textContent = 'Send Reset Link';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        }
    }

    // ======== SIGN-UP HANDLER ========
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
            
            this.showNotification(`Welcome ${name}! Account created successfully.`, 'success');
            
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
            
            await this.updateLastLogin(user.uid);
            
            this.showNotification(`Welcome back, ${user.displayName || user.email}!`, 'success');
            
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
        console.log(`🔄 Showing ${formName} form`);
        
        // Hide all forms first
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });
        
        // Show the requested form
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
            targetForm.style.display = 'block';
            console.log(`✅ ${formName} form shown`);
            
            // Focus on first input field
            setTimeout(() => {
                const firstInput = targetForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        } else {
            console.error(`❌ ${formName} form not found`);
        }
    }

    // ======== PASSWORD VALIDATION ========
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
        
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';
        
        if (password.length === 0) {
            strengthBar.style.backgroundColor = '#ddd';
            strengthText.textContent = '';
        } else if (strength < 2) {
            strengthBar.style.backgroundColor = '#ff4757';
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ff4757';
        } else if (strength < 4) {
            strengthBar.style.backgroundColor = '#ffa502';
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#ffa502';
        } else {
            strengthBar.style.backgroundColor = '#2ed573';
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
            matchIndicator.style.color = '#2ed573';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#ff4757';
        }
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.auth-notification');
        existing.forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Add animation styles if not present
        if (!document.querySelector('#auth-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-notification-styles';
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

// Initialize the auth module
document.addEventListener('DOMContentLoaded', () => {
    window.authModule = new AuthModule();
});
