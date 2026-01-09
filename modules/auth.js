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
                socialContainer.innerHTML = window.authManager.renderAuthButtons();
                console.log('✅ Social buttons rendered');
                
                // Add click handlers
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
                let feedback = '';
                
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
                
                // Show requirements feedback
                this.showPasswordRequirements(password);
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
            
            showPasswordRequirements(password) {
                // Optional: Show detailed requirements
                const requirements = document.getElementById('password-requirements');
                if (!requirements) return;
                
                const checks = {
                    length: password.length >= 8,
                    lowercase: /[a-z]/.test(password),
                    uppercase: /[A-Z]/.test(password),
                    number: /\d/.test(password),
                    special: /[^A-Za-z0-9]/.test(password)
                };
                
                const fulfilled = Object.values(checks).filter(Boolean).length;
                const total = Object.keys(checks).length;
                
                requirements.innerHTML = `
                    <div style="font-size: 11px; color: #666; margin-top: 4px;">
                        ${fulfilled}/${total} requirements met
                    </div>
                `;
            }
            
            // Optional: Add password requirements list HTML
            /*
            <div id="password-requirements" style="font-size: 12px; color: #666; margin-top: 8px;">
                <div>Password must contain:</div>
                <ul style="margin: 4px 0 0 15px; padding: 0;">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                </ul>
            </div>
            */
    
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
    
    // ADD THIS LINE: Setup password validation
    this.setupPasswordValidation();
    
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
