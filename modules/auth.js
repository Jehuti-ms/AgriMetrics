// modules/auth.js - FIXED WITH AUTO-SHOW APP AND LOGOUT
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
        this.setupAuthStateListener();
        
        // Register with FarmModules if available
        this.registerWithFarmModules();
    }
    
    registerWithFarmModules() {
        if (typeof FarmModules !== 'undefined') {
            FarmModules.registerModule('auth', {
                logout: async () => {
                    return await this.logout();
                },
                isAuthenticated: () => {
                    return window.authManager?.isAuthenticated() || false;
                },
                getCurrentUser: () => {
                    return window.authManager?.getCurrentUser();
                }
            });
            console.log('🔧 Auth module registered with FarmModules');
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

    setupAuthStateListener() {
        if (!window.authManager) {
            console.log('⚠️ Auth manager not available for state listener');
            return;
        }
        
        // Listen for auth state changes
        window.authManager.onAuthStateChanged((user) => {
            console.log('🔍 Auth state changed in auth module:', user ? user.email : 'No user');
            
            // Check logout flags
            const stayLoggedOut = sessionStorage.getItem('stayLoggedOut') === 'true';
            const forceLogout = sessionStorage.getItem('forceLogout') === 'true';
            
            if (user && !stayLoggedOut && !forceLogout) {
                console.log('👤 User authenticated, showing app...');
                
                // Wait for app to be ready
                setTimeout(() => {
                    this.showAppAfterLogin();
                }, 500);
            } else if (!user && !stayLoggedOut) {
                console.log('👤 No user, showing auth forms...');
                this.ensureAuthFormsVisible();
            }
        });
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
                
                // Clear logout flags
                sessionStorage.removeItem('stayLoggedOut');
                sessionStorage.removeItem('forceLogout');
                
                // Show app
                this.showAppAfterLogin();
                
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
                
                // Clear logout flags
                sessionStorage.removeItem('stayLoggedOut');
                sessionStorage.removeItem('forceLogout');
                
                // Show app
                this.showAppAfterLogin();
                
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
                
                // Clear logout flags
                sessionStorage.removeItem('stayLoggedOut');
                sessionStorage.removeItem('forceLogout');
                
                // Show app
                this.showAppAfterLogin();
                
            } else {
                this.showNotification(result?.error || 'Error signing in with Google', 'error');
            }
        } catch (error) {
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

    // NEW: LOGOUT METHOD - ADD THIS INSIDE THE CLASS
    async logout() {
        console.log('🚪 Auth module: Starting logout...');
        
        try {
            // 1. Set logout flags (PREVENTS AUTO-LOGIN)
            sessionStorage.setItem('forceLogout', 'true');
            sessionStorage.setItem('stayLoggedOut', 'true');
            
            // 2. Clear Firebase auth
            if (window.authManager?.signOut) {
                await window.authManager.signOut();
            }
            
            // 3. Clear app storage (keep only preferences)
            this.clearAuthStorage();
            
            // 4. Show auth screen
            this.showAuthScreen();
            
            // 5. Reset login forms
            this.showAuthForm('signin');
            
            console.log('✅ Auth module: Logout successful');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Auth module: Logout failed:', error);
            return { success: false, error: error.message };
        }
    }

    // NEW: HELPER METHOD
    clearAuthStorage() {
        console.log('🧹 Clearing auth storage...');
        
        // Keep these preferences
        const keepKeys = ['theme', 'language', 'farm-user-preferences'];
        
        // Clear localStorage except preferences
        Object.keys(localStorage).forEach(key => {
            if (!keepKeys.includes(key) && 
                (key.includes('firebase') || 
                 key.includes('auth') || 
                 key === 'userData')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear sessionStorage (keep logout flags)
        Object.keys(sessionStorage).forEach(key => {
            if (key !== 'forceLogout' && key !== 'stayLoggedOut') {
                sessionStorage.removeItem(key);
            }
        });
    }

    // NEW: SHOW AUTH SCREEN METHOD
    showAuthScreen() {
        console.log('🔄 Showing auth screen...');
        
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.style.display = 'block';
            authContainer.classList.remove('hidden');
        }
        
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
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

    ensureAuthFormsVisible() {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.style.display = 'block';
            authContainer.classList.remove('hidden');
        }
        
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
        
        this.showAuthForm('signin');
    }

    showAppAfterLogin() {
        console.log('🔄 Showing app after successful login...');
        
        // Method 1: Use app instance if available
        if (window.app && typeof window.app.showApp === 'function') {
            setTimeout(() => {
                window.app.showApp();
                
                // Load dashboard
                if (typeof window.app.showSection === 'function') {
                    window.app.showSection('dashboard');
                }
            }, 300);
        }
        // Method 2: Direct DOM manipulation
        else {
            const authContainer = document.getElementById('auth-container');
            const appContainer = document.getElementById('app-container');
            
            if (authContainer) {
                authContainer.classList.add('hidden');
                authContainer.style.display = 'none';
            }
            
            if (appContainer) {
                appContainer.classList.remove('hidden');
                appContainer.style.display = 'block';
            }
            
            // Reload to ensure proper initialization
            setTimeout(() => {
                if (!window.app) {
                    window.location.reload();
                }
            }, 1000);
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

// Global logout function for easy access
window.logoutUser = async function() {
    if (window.authModule?.logout) {
        return await window.authModule.logout();
    }
    return { success: false, error: 'Auth module not available' };
};

// Export for module system (outside class)
if (typeof FarmModules !== 'undefined' && !FarmModules.getModule('auth')) {
    FarmModules.registerModule('auth', window.authModule);
}
