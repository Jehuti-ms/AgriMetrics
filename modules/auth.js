// modules/auth.js
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
    }

    // ======== ADD THE SOCIAL LOGIN METHODS  ========
    renderSocialLoginButtons() {
        console.log('🔄 Rendering social login buttons...');
        const socialContainer = document.getElementById('social-login-container');
        if (socialContainer && window.authManager) {
            console.log('✅ Social container found, rendering buttons...');
            // Use the method from your FirebaseAuth class
            socialContainer.innerHTML = window.authManager.renderAuthButtons();
            console.log('✅ Social buttons rendered');
            
            // Add click handlers for social buttons
            const googleBtn = socialContainer.querySelector('.btn-social.google');
            const appleBtn = socialContainer.querySelector('.btn-social.apple');
            
            if (googleBtn) {
                googleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('google');
                };
            }
            
            if (appleBtn) {
                appleBtn.onclick = async (e) => {
                    e.preventDefault();
                    await this.handleSocialSignIn('apple');
                };
            }
            } else {
                console.log('⚠️ Social container or authManager not found');
                console.log('- socialContainer:', !!socialContainer);
                console.log('- authManager:', !!window.authManager);
            }
        }
        
    // Add this new method for social sign-in
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
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification(result?.error || `Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'error');
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
    // RENDER SOCIAL BUTTONS HERE
    this.renderSocialLoginButtons();
    
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
                farmName: farmName
            });
    
            if (result?.success) {
                this.showNotification('Account created successfully!', 'success');
                // ADD REDIRECTION
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification(result?.error || 'Error creating account', 'error');
            }
        } catch (error) {
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
                // ADD REDIRECTION
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification(result?.error || 'Error signing in', 'error');
            }
        } catch (error) {
            this.showNotification('Error signing in', 'error');
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

        if (submitBtn) {
            submitBtn.innerHTML = 'Sending Reset Link...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.authManager?.resetPassword(email);

            if (result?.success) {
                this.showNotification('Password reset email sent!', 'success');
                this.showAuthForm('signin');
            } else {
                this.showNotification(result?.error || 'Error sending reset email', 'error');
            }
        } catch (error) {
            this.showNotification('Error sending reset email', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
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
            alert(message);
        }
    }
}

window.authModule = new AuthModule();
