// modules/auth-form-handler.js - COMPLETE SIGNUP/SIGNIN FIX
console.log('🔐 Loading Auth Form Handler...');

class AuthFormHandler {
    constructor() {
        this.currentAuthForm = 'signin';
        this.init();
    }

    init() {
        console.log('🔧 Setting up auth forms...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupForms());
        } else {
            this.setupForms();
        }
    }

    setupForms() {
        // Get all form elements
        this.signinForm = document.getElementById('signin-form-element');
        this.signupForm = document.getElementById('signup-form-element');
        this.forgotForm = document.getElementById('forgot-password-form-element');
        
        // Get input fields
        this.signinEmail = document.getElementById('signin-email');
        this.signinPassword = document.getElementById('signin-password');
        
        this.signupName = document.getElementById('signup-name');
        this.signupEmail = document.getElementById('signup-email');
        this.signupPassword = document.getElementById('signup-password');
        this.signupConfirmPassword = document.getElementById('signup-confirm-password');
        this.farmName = document.getElementById('farm-name');
        
        this.forgotEmail = document.getElementById('forgot-email');
        
        // Setup form switchers
        this.setupFormSwitchers();
        
        // Setup form submissions
        this.setupFormSubmissions();
        
        // Setup password strength indicator
        this.setupPasswordStrength();
        
        console.log('✅ Auth forms setup complete');
    }

    setupFormSwitchers() {
        // Show signup form
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signup');
        });
        
        // Show signin form
        document.getElementById('show-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signin');
        });
        
        document.getElementById('show-signin-from-forgot')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signin');
        });
        
        // Show forgot password form
        document.getElementById('show-forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot');
        });
    }

    setupFormSubmissions() {
        // Sign In form submission
        this.signinForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignIn();
        });
        
        // Sign Up form submission
        this.signupForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignUp();
        });
        
        // Forgot Password form submission
        this.forgotForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    setupPasswordStrength() {
        if (this.signupPassword) {
            this.signupPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
            
            this.signupConfirmPassword.addEventListener('input', (e) => {
                this.checkPasswordMatch();
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-progress');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = 'Very Weak';
        let color = '#ff4444';
        
        // Check password strength
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        switch(strength) {
            case 1:
                text = 'Weak';
                color = '#ff9900';
                break;
            case 2:
                text = 'Fair';
                color = '#ffcc00';
                break;
            case 3:
                text = 'Good';
                color = '#99cc00';
                break;
            case 4:
                text = 'Strong';
                color = '#4CAF50';
                break;
        }
        
        const width = (strength / 4) * 100;
        strengthBar.style.width = width + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    checkPasswordMatch() {
        const indicator = document.querySelector('.password-match-indicator');
        if (!indicator) return;
        
        const password = this.signupPassword.value;
        const confirm = this.signupConfirmPassword.value;
        
        if (!password || !confirm) {
            indicator.textContent = '';
            indicator.style.color = '#666';
            return;
        }
        
        if (password === confirm) {
            indicator.textContent = '✓ Passwords match';
            indicator.style.color = '#4CAF50';
        } else {
            indicator.textContent = '✗ Passwords do not match';
            indicator.style.color = '#ff4444';
        }
    }

    showForm(formName) {
        console.log(`🔄 Switching to ${formName} form`);
        
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });
        
        // Show selected form
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
            targetForm.style.display = 'block';
            
            // Focus first input
            const firstInput = targetForm.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        this.currentAuthForm = formName;
    }

    async handleSignIn() {
        const email = this.signinEmail?.value.trim();
        const password = this.signinPassword?.value;
        
        if (!this.validateSignIn(email, password)) {
            return;
        }
        
        try {
            console.log('🔐 Attempting sign in for:', email);
            
            // Show loading
            this.showLoading('Signing in...');
            
            // Check if firebaseAuthManager exists
            if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signIn === 'function') {
                await window.firebaseAuthManager.signIn(email, password);
            } else {
                // Fallback to direct Firebase auth
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('✅ Sign in successful');
            }
            
            // Success - Firebase will trigger auth state change automatically
            // The onAuthStateChanged listener in app.js will handle the redirect
            
        } catch (error) {
            console.error('❌ Sign-in error:', error);
            this.showError(error.message || 'Sign in failed');
        } finally {
            this.hideLoading();
        }
    }

    async handleSignUp() {
        const name = this.signupName?.value.trim();
        const email = this.signupEmail?.value.trim();
        const password = this.signupPassword?.value;
        const confirmPassword = this.signupConfirmPassword?.value;
        const farmName = this.farmName?.value.trim();
        
        if (!this.validateSignUp(name, email, password, confirmPassword, farmName)) {
            return;
        }
        
        try {
            console.log('📝 Attempting sign up for:', email);
            
            // Show loading
            this.showLoading('Creating account...');
            
            // Check if firebaseAuthManager exists
            if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signUp === 'function') {
                await window.firebaseAuthManager.signUp(email, password, {
                    displayName: name,
                    farmName: farmName
                });
            } else {
                // Fallback to direct Firebase auth
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('✅ User created:', userCredential.user.uid);
                
                // Update profile
                await userCredential.user.updateProfile({
                    displayName: name
                });
                
                // Create user profile in Firestore
                await this.createUserProfile(userCredential.user, name, farmName);
            }
            
            // Show success message
            this.showSuccess('Account created successfully! Redirecting...');
            
            // Firebase will automatically sign in the user
            // The onAuthStateChanged listener will handle the redirect
            
        } catch (error) {
            console.error('❌ Sign-up error:', error);
            this.showError(error.message || 'Sign up failed');
        } finally {
            this.hideLoading();
        }
    }

    async handleForgotPassword() {
        const email = this.forgotEmail?.value.trim();
        
        if (!email || !this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        try {
            this.showLoading('Sending reset email...');
            
            await firebase.auth().sendPasswordResetEmail(email);
            
            this.showSuccess(`Password reset email sent to ${email}. Check your inbox.`);
            setTimeout(() => this.showForm('signin'), 3000);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            
            if (error.code === 'auth/user-not-found') {
                this.showError('No account found with this email address');
            } else {
                this.showError(error.message || 'Failed to send reset email');
            }
        } finally {
            this.hideLoading();
        }
    }

    validateSignIn(email, password) {
        this.clearErrors();
        
        let isValid = true;
        
        if (!this.validateEmail(email)) {
            this.showFieldError(this.signinEmail, 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            this.showFieldError(this.signinPassword, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }

    validateSignUp(name, email, password, confirmPassword, farmName) {
        this.clearErrors();
        
        let isValid = true;
        
        if (!name || name.length < 2) {
            this.showFieldError(this.signupName, 'Please enter your full name');
            isValid = false;
        }
        
        if (!this.validateEmail(email)) {
            this.showFieldError(this.signupEmail, 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            this.showFieldError(this.signupPassword, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            this.showFieldError(this.signupConfirmPassword, 'Passwords do not match');
            isValid = false;
        }
        
        if (!farmName || farmName.length < 2) {
            this.showFieldError(this.farmName, 'Please enter your farm name');
            isValid = false;
        }
        
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(input, message) {
        if (!input) return;
        
        // Remove existing error
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        // Add error class to input
        input.style.borderColor = '#ff4444';
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#ff4444';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    clearErrors() {
        // Clear all field errors
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        
        // Reset input borders
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.style.borderColor = '';
        });
        
        // Clear general error
        const generalError = document.getElementById('general-auth-error');
        if (generalError) generalError.remove();
    }

    showError(message) {
        this.clearErrors();
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'general-auth-error';
        errorDiv.style.backgroundColor = '#ffebee';
        errorDiv.style.color = '#c62828';
        errorDiv.style.padding = '12px 16px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.marginBottom = '20px';
        errorDiv.style.borderLeft = '4px solid #c62828';
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.gap = '10px';
        errorDiv.innerHTML = `
            <span style="font-size: 18px;">⚠️</span>
            <span>${message}</span>
        `;
        
        // Insert at top of current form
        const currentForm = document.querySelector('.auth-form.active');
        if (currentForm) {
            const formElement = currentForm.querySelector('form');
            if (formElement) {
                formElement.insertBefore(errorDiv, formElement.firstChild);
            }
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.backgroundColor = '#e8f5e9';
        successDiv.style.color = '#2e7d32';
        successDiv.style.padding = '12px 16px';
        successDiv.style.borderRadius = '8px';
        successDiv.style.marginBottom = '20px';
        successDiv.style.borderLeft = '4px solid #4CAF50';
        successDiv.style.display = 'flex';
        successDiv.style.alignItems = 'center';
        successDiv.style.gap = '10px';
        successDiv.innerHTML = `
            <span style="font-size: 18px;">✅</span>
            <span>${message}</span>
        `;
        
        // Insert at top of current form
        const currentForm = document.querySelector('.auth-form.active');
        if (currentForm) {
            const formElement = currentForm.querySelector('form');
            if (formElement) {
                formElement.insertBefore(successDiv, formElement.firstChild);
            }
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    showLoading(message = 'Loading...') {
        // Remove existing loading
        this.hideLoading();
        
        // Create loading overlay
        const loadingEl = document.createElement('div');
        loadingEl.id = 'auth-form-loading';
        loadingEl.style.position = 'fixed';
        loadingEl.style.top = '0';
        loadingEl.style.left = '0';
        loadingEl.style.right = '0';
        loadingEl.style.bottom = '0';
        loadingEl.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        loadingEl.style.display = 'flex';
        loadingEl.style.flexDirection = 'column';
        loadingEl.style.alignItems = 'center';
        loadingEl.style.justifyContent = 'center';
        loadingEl.style.zIndex = '10000';
        loadingEl.innerHTML = `
            <div style="
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #4CAF50;
                border-radius: 50%;
                animation: auth-spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <div style="color: #333; font-size: 16px; font-weight: 500;">${message}</div>
        `;
        
        document.body.appendChild(loadingEl);
        
        // Add spinner animation
        if (!document.querySelector('#auth-spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-spinner-styles';
            style.textContent = `
                @keyframes auth-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const loadingEl = document.getElementById('auth-form-loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }

    async createUserProfile(user, name, farmName) {
        try {
            const db = firebase.firestore();
            
            const profileData = {
                uid: user.uid,
                email: user.email,
                displayName: name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                farmName: farmName || 'My Farm',
                farmType: 'poultry', // default
                role: 'farmer',
                preferences: {
                    theme: 'auto',
                    currency: 'USD',
                    notifications: true
                }
            };
            
            // Save to Firestore
            await db.collection('users').doc(user.uid).set(profileData, { merge: true });
            
            // Save to localStorage as backup
            localStorage.setItem('farm-profile', JSON.stringify(profileData));
            localStorage.setItem('current-user-uid', user.uid);
            
            console.log('✅ User profile created');
            
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            // Don't throw - we can continue even if profile creation fails
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AuthFormHandler...');
    window.authFormHandler = new AuthFormHandler();
});
