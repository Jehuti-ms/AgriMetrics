// modules/auth.js - FIXED VERSION
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
   // In your auth.js, update this method:
renderSocialLoginButtons() {
    console.log('🔄 Rendering social login buttons...');
    const socialContainer = document.getElementById('social-login-container');
    
    if (!socialContainer) {
        console.warn('⚠️ Social container not found - retrying...');
        // Try again after a delay
        setTimeout(() => this.renderSocialLoginButtons(), 500);
        return;
    }

    console.log('✅ Social container found, rendering buttons...');
    
    // Create social buttons HTML directly
    socialContainer.innerHTML = `
        <div class="social-buttons">
            <button id="google-signin-btn" class="social-btn google-btn">
                <span class="social-icon">G</span>
                <span class="social-text">Sign in with Google</span>
            </button>
            <button id="github-signin-btn" class="social-btn github-btn">
                <span class="social-icon">⚡</span>
                <span class="social-text">Sign in with GitHub</span>
            </button>
        </div>
    `;

    console.log('✅ Social buttons HTML rendered');
    
    // Wait a bit for DOM to update, then add event listeners
    setTimeout(() => {
        const googleBtn = document.getElementById('google-signin-btn');
        const githubBtn = document.getElementById('github-signin-btn');
        
        if (googleBtn) {
            console.log('✅ Google button found, adding listener');
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleSocialSignIn('google');
            });
        } else {
            console.warn('⚠️ Google button not found');
        }
        
        if (githubBtn) {
            console.log('✅ GitHub button found, adding listener');
            githubBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleSocialSignIn('github');
            });
        } else {
            console.warn('⚠️ GitHub button not found');
        }
        
        console.log('✅ Social buttons rendered with listeners');
    }, 100);
}
    
    async handleSocialSignIn(provider) {
        console.log(`🔐 Attempting ${provider} sign-in...`);
        
        // Disable social buttons
        this.disableSocialButtons(true, `Signing in with ${provider}...`);
        
        try {
            let user;
            
            if (provider === 'google') {
                if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signInWithGoogle === 'function') {
                    user = await window.firebaseAuthManager.signInWithGoogle();
                } else {
                    // Fallback to direct Firebase
                    const providerObj = new firebase.auth.GoogleAuthProvider();
                    providerObj.addScope('profile');
                    providerObj.addScope('email');
                    
                    const result = await firebase.auth().signInWithPopup(providerObj);
                    user = result.user;
                }
            } else if (provider === 'github') {
                if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signInWithGithub === 'function') {
                    user = await window.firebaseAuthManager.signInWithGithub();
                } else {
                    // Fallback to direct Firebase
                    const providerObj = new firebase.auth.GithubAuthProvider();
                    providerObj.addScope('user:email');
                    
                    const result = await firebase.auth().signInWithPopup(providerObj);
                    user = result.user;
                }
            }
            
            if (user) {
                console.log(`✅ ${provider} sign-in successful:`, user.email);
                
                // Show success notification
                this.showNotification(`Signed in with ${provider === 'google' ? 'Google' : 'GitHub'}!`, 'success');
                
                // DON'T redirect to dashboard.html - let app.js handle it
                // The onAuthStateChanged listener will show the app
                
            } else {
                this.showNotification(`Error signing in with ${provider}`, 'error');
            }
        } catch (error) {
            console.error(`❌ ${provider} sign-in error:`, error);
            
            if (error.code !== 'auth/popup-closed-by-user') {
                this.showNotification(`${provider} sign-in failed: ${error.message || 'Unknown error'}`, 'error');
            }
        } finally {
            // Re-enable buttons
            this.disableSocialButtons(false);
        }
    }

    disableSocialButtons(disable, text = '') {
        const buttons = document.querySelectorAll('.social-btn');
        buttons.forEach(btn => {
            if (disable) {
                btn.disabled = true;
                const originalText = btn.innerHTML;
                btn.dataset.originalText = originalText;
                if (text) {
                    const icon = btn.querySelector('.social-icon');
                    if (icon) {
                        btn.innerHTML = icon.outerHTML + `<span class="social-text">${text}</span>`;
                    } else {
                        btn.textContent = text;
                    }
                }
            } else {
                btn.disabled = false;
                if (btn.dataset.originalText) {
                    btn.innerHTML = btn.dataset.originalText;
                }
            }
        });
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
        strengthBar.style.transition = 'width 0.3s ease';
        
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

    // ======== FORM HANDLING ========
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
        
        // SIGN UP FORM
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
        }
        
        // SIGN IN FORM
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        // FORGOT PASSWORD FORM
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
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
    
        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
    
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
    
        if (!email || !name || !farmName) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
    
        // Update button state
        if (submitBtn) {
            submitBtn.innerHTML = 'Creating Account...';
            submitBtn.disabled = true;
        }
    
        try {
            console.log('📝 Attempting sign up for:', email);
            
            // Use firebaseAuthManager if available
            if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signUp === 'function') {
                await window.firebaseAuthManager.signUp(email, password, {
                    displayName: name,
                    farmName: farmName
                });
            } else {
                // Fallback to direct Firebase
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                
                // Update profile
                await userCredential.user.updateProfile({
                    displayName: name
                });
                
                // Create profile in Firestore if available
                if (firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('users').doc(userCredential.user.uid).set({
                        email: email,
                        displayName: name,
                        farmName: farmName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            }
            
            this.showNotification('Account created successfully!', 'success');
            
            // Firebase will auto-login the user, so don't redirect here
            // The onAuthStateChanged listener will handle it
            
        } catch (error) {
            console.error('❌ Sign-up error:', error);
            
            let errorMessage = 'Error creating account';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            
            this.showNotification(errorMessage, 'error');
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
    
        if (!email || !password) {
            this.showNotification('Please enter email and password', 'error');
            return;
        }
    
        // Update button state
        if (submitBtn) {
            submitBtn.innerHTML = 'Signing In...';
            submitBtn.disabled = true;
        }
    
        try {
            console.log('🔐 Attempting sign in for:', email);
            
            // Use firebaseAuthManager if available
            if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signIn === 'function') {
                await window.firebaseAuthManager.signIn(email, password);
            } else {
                // Fallback to direct Firebase
                await firebase.auth().signInWithEmailAndPassword(email, password);
            }
            
            this.showNotification('Welcome back!', 'success');
            
            // The onAuthStateChanged listener will handle the redirect
            
        } catch (error) {
            console.error('❌ Sign-in error:', error);
            
            let errorMessage = 'Error signing in';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Sign In';
                submitBtn.disabled = false;
            }
        }
    }
    
    async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form-element');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('forgot-email')?.value || '';

        if (!email) {
            this.showNotification('Please enter your email', 'error');
            return;
        }

        // Update button state
        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Reset Link...';
            submitBtn.disabled = true;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
            
            // Switch back to sign-in form
            setTimeout(() => {
                this.showAuthForm('signin');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            
            let errorMessage = 'Error sending reset email';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
        }
    }

    showAuthForm(formName) {
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
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
            `;
            
            if (type === 'success') {
                notification.style.backgroundColor = '#4CAF50';
            } else if (type === 'error') {
                notification.style.backgroundColor = '#ff4444';
            } else {
                notification.style.backgroundColor = '#2196F3';
            }
            
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
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

// Initialize auth module
window.authModule = new AuthModule();
console.log('✅ Auth module initialized');
