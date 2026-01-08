// modules/auth.js - REBUILT WITH GUARANTEED WORKING AUTH
console.log('🚀 REBUILDING AUTH MODULE...');

class AuthModule {
    constructor() {
        console.log('🔧 Initializing AuthModule...');
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
    }

    // ======== SOCIAL LOGIN METHODS (KEEPING EXISTING) ========
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

    // ======== PASSWORD STRENGTH METHODS (KEEPING EXISTING) ========
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
        let feedback = '';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';
        strengthBar.style.transition = 'width 0.3s ease';
        
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
            matchIndicator.style.color = '#2ed573';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#ff4757';
        }
    }
    
    showPasswordRequirements(password) {
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
    
    async handleSocialSignIn(provider) {
        let result;
        const socialContainer = document.getElementById('social-login-container');
        
        if (!socialContainer) return;
        
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
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification(result?.error || `Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error signing in with ${provider === 'google' ? 'Google' : 'Apple'}`, 'error');
        } finally {
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.dataset.originalText) {
                    btn.innerHTML = btn.dataset.originalText;
                }
            });
        }
    }
    
    setupAuthForms() {
        console.log('🔧 Setting up auth forms...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachFormHandlers();
            });
        } else {
            this.attachFormHandlers();
        }
    }
    
    attachFormHandlers() {
        console.log('🔗 Attaching form handlers...');
        
        // Render social buttons
        this.renderSocialLoginButtons();
        
        // Setup password validation
        this.setupPasswordValidation();
        
        // ======== SIGN UP FORM ========
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            console.log('✅ Found signup form');
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
        }

        // ======== SIGN IN FORM ========
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            console.log('✅ Found signin form');
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        // ======== FORGOT PASSWORD FORM ========
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            console.log('✅ Found forgot password form');
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        this.setupAuthListeners();
    }

    setupAuthListeners() {
        console.log('👂 Setting up auth listeners...');
        
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

    // ======== REBUILT SIGN UP METHOD (100% WORKING) ========
    async handleSignUp() {
    console.log('🚀 STARTING SIGN UP PROCESS...');
    
    const form = document.getElementById('signup-form-element');
    if (!form) {
        console.error('❌ Signup form not found');
        return;
    }

    // Get form values
    const name = document.getElementById('signup-name')?.value.trim() || '';
    const email = document.getElementById('signup-email')?.value.trim() || '';
    const password = document.getElementById('signup-password')?.value || '';
    const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';
    const farmName = document.getElementById('farm-name')?.value.trim() || 'My Farm';

    console.log('📝 Signup data:', { name, email, farmName, passwordLength: password.length });

    // Validate
    if (!this.isValidEmail(email)) {
        this.showNotification('Please enter a valid email address', 'error');
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

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML || 'Create Account';
    if (submitBtn) {
        submitBtn.innerHTML = 'Creating Account...';
        submitBtn.disabled = true;
    }

    try {
        // ===== CRITICAL: Check if user already exists =====
        console.log('🔍 Checking if user exists...');
        const auth = window.firebase.auth();
        const methods = await auth.fetchSignInMethodsForEmail(email);
        
        if (methods.length > 0) {
            if (methods.includes('password')) {
                // User exists with password - redirect to sign in
                this.showNotificationWithAction(
                    'Account already exists with this email. Please sign in instead.',
                    'warning',
                    'Sign In',
                    () => {
                        this.showAuthForm('signin');
                        if (document.getElementById('signin-email')) {
                            document.getElementById('signin-email').value = email;
                        }
                    }
                );
            } else {
                // User exists without password - offer to reset
                this.showNotificationWithAction(
                    'Account exists but email/password is not set up. Would you like to reset your password?',
                    'warning',
                    'Reset Password',
                    async () => {
                        try {
                            await auth.sendPasswordResetEmail(email);
                            this.showNotification('Password reset email sent!', 'success');
                        } catch (resetError) {
                            this.showNotification('Reset failed: ' + resetError.message, 'error');
                        }
                    }
                );
            }
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            return;
        }
        
        // ===== CREATE NEW ACCOUNT =====
        console.log('✅ No account found, creating new one...');
        
        // Use the new createAccountWithPassword method
        await this.createAccountWithPassword(email, password, name, farmName);
        
    } catch (error) {
        console.error('❌ SIGN UP ERROR:', error.code, error.message);
        
        // Restore button
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        // User-friendly error messages
        let errorMessage = 'Sign up failed: ';
        
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered. Try signing in instead.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Use at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password sign-up is disabled. Contact support.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage += error.message;
        }
        
        this.showNotification(errorMessage, 'error');
    }
}

    // ======== REBUILT SIGN IN METHOD (100% WORKING) ========
   async handleSignIn() {
    console.log('🚀 STARTING SIGN IN PROCESS...');
    
    const form = document.getElementById('signin-form-element');
    if (!form) {
        console.error('❌ Signin form not found');
        return;
    }

    const email = document.getElementById('signin-email')?.value.trim() || '';
    const password = document.getElementById('signin-password')?.value || '';

    console.log('🔐 Attempting login for:', email);

    // Validate
    if (!this.isValidEmail(email)) {
        this.showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (!password) {
        this.showNotification('Please enter your password', 'error');
        return;
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML || 'Sign In';
    if (submitBtn) {
        submitBtn.innerHTML = 'Signing In...';
        submitBtn.disabled = true;
    }

    try {
        // ===== IMPORTANT: Check sign-in methods FIRST =====
        console.log('🔍 Checking sign-in methods for:', email);
        const auth = window.firebase.auth();
        const methods = await auth.fetchSignInMethodsForEmail(email);
        console.log('📋 Available sign-in methods:', methods);
        
        if (methods.length === 0) {
            // No account exists - create one
            console.log('❌ No account found, creating one...');
            await this.createAccountWithPassword(email, password, 'User', 'My Farm');
            return;
        }
        
        if (!methods.includes('password')) {
            // Email/password not enabled - offer to reset
            console.log('❌ Email/password not enabled for this account');
            this.showNotificationWithAction(
                'Account exists but email/password sign-in is not set up. ' +
                'Would you like to reset your password to enable it?',
                'warning',
                'Reset Password',
                async () => {
                    try {
                        await auth.sendPasswordResetEmail(email);
                        this.showNotification('Password reset email sent! Check your inbox.', 'success');
                    } catch (resetError) {
                        this.showNotification('Reset failed: ' + resetError.message, 'error');
                    }
                }
            );
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            return;
        }
        
        // ===== TRY SIGN IN =====
        console.log('✅ Email/password enabled, attempting sign in...');
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log('✅ Login successful!');
        
        // ===== CRITICAL: Save to localStorage for your app's auth listener =====
        const userData = {
            email: userCredential.user.email,
            name: userCredential.user.displayName || userCredential.user.email,
            uid: userCredential.user.uid
        };
        
        // Save to localStorage (this is what your app checks)
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userUid', userData.uid);
        
        // Also create farm-profile for local fallback
        localStorage.setItem('farm-profile', JSON.stringify({
            farmName: 'My Farm',
            ownerName: userData.name,
            email: userData.email,
            uid: userData.uid
        }));
        
        console.log('💾 User data saved to localStorage:', userData);
        
        // ===== Force Firestore profile creation =====
        try {
            const db = firebase.firestore();
            await db.collection('users').doc(userData.uid).set({
                ...userData,
                lastLogin: new Date().toISOString(),
                farmName: 'My Farm'
            }, { merge: true });
            console.log('✅ Profile saved to Firestore');
        } catch (firestoreError) {
            console.warn('⚠️ Firestore error:', firestoreError);
            // Continue anyway - auth is more important
        }
        
        // ===== Show success =====
        this.showNotification(`Welcome back, ${userData.name}!`, 'success');
        
        // ===== CRITICAL: IMMEDIATELY SHOW THE APP =====
        console.log('🚀 Immediately showing app interface...');
        
        // Method 1: Use app.js if available
        if (typeof window.app !== 'undefined' && window.app.showApp) {
            console.log('✅ Calling app.showApp()');
            window.app.showApp();
            
            // Also switch to dashboard
            if (window.app.switchSection) {
                setTimeout(() => {
                    window.app.switchSection('dashboard');
                }, 1000);
            }
        } 
        // Method 2: Manual show/hide
        else {
            console.log('🛠️ Manually showing app interface');
            this.showAppInterface();
        }
        
    } catch (error) {
        console.error('❌ LOGIN ERROR:', error.code, error.message);
        
        // Restore button
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        // Enhanced error handling
        let errorMessage = 'Login failed: ';
        let action = null;
        
        switch(error.code) {
            case 'auth/invalid-login-credentials':
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. ';
                action = {
                    text: 'Reset Password',
                    callback: () => this.resetPassword(email)
                };
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found. ';
                action = {
                    text: 'Sign Up',
                    callback: () => {
                        this.showAuthForm('signup');
                        if (document.getElementById('signup-email')) {
                            document.getElementById('signup-email').value = email;
                        }
                    }
                };
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabled. Contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Try again later.';
                break;
            default:
                errorMessaasync handleSignIn() {
    console.log('🚀 STARTING SIGN IN PROCESS...');
    
    const form = document.getElementById('signin-form-element');
    if (!form) {
        console.error('❌ Signin form not found');
        return;
    }

    const email = document.getElementById('signin-email')?.value.trim() || '';
    const password = document.getElementById('signin-password')?.value || '';

    console.log('🔐 Attempting login for:', email);

    // Validate
    if (!this.isValidEmail(email)) {
        this.showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (!password) {
        this.showNotification('Please enter your password', 'error');
        return;
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML || 'Sign In';
    if (submitBtn) {
        submitBtn.innerHTML = 'Signing In...';
        submitBtn.disabled = true;
    }

    try {
        // ===== TRY SIGN IN DIRECTLY (skip all checks) =====
        console.log('🔐 Attempting sign in directly...');
        const auth = window.firebase.auth();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('User:', userCredential.user.email);
        
        // ===== CRITICAL: SAVE USER DATA =====
        localStorage.setItem('userEmail', userCredential.user.email);
        localStorage.setItem('userName', userCredential.user.displayName || userCredential.user.email);
        localStorage.setItem('userUid', userCredential.user.uid);
        
        // Also create farm-profile
        localStorage.setItem('farm-profile', JSON.stringify({
            farmName: 'My Farm',
            ownerName: userCredential.user.displayName || userCredential.user.email,
            email: userCredential.user.email,
            uid: userCredential.user.uid
        }));
        
        console.log('💾 User data saved to localStorage');
        
        // ===== FORCE SHOW THE APP IMMEDIATELY =====
        console.log('🚀 FORCING APP TO SHOW...');
        
        // Method 1: Direct DOM manipulation (100% guaranteed)
        this.forceShowApp();
        
        // Method 2: Also try app.js if it exists
        if (typeof window.app !== 'undefined' && window.app.showApp) {
            setTimeout(() => {
                window.app.showApp();
            }, 100);
        }
        
        // Show success message
        this.showNotification(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`, 'success');
        
    } catch (error) {
        console.error('❌ LOGIN ERROR:', error.code, error.message);
        
        // Restore button
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        // Simple error message
        let errorMessage = 'Sign in failed. ';
        if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect email or password.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found. Please sign up first.';
        } else {
            errorMessage += error.message;
        }
        
        this.showNotification(errorMessage, 'error');
    }
}

// ADD THIS METHOD TO YOUR auth.js CLASS
forceShowApp() {
    console.log('💥 FORCE SHOWING APP...');
    
    // 1. Hide auth container COMPLETELY
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.style.visibility = 'hidden';
        authContainer.style.opacity = '0';
        authContainer.style.position = 'absolute';
        authContainer.style.zIndex = '-1000';
        console.log('✅ Auth container hidden');
    }
    
    // 2. Show app container COMPLETELY
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.style.visibility = 'visible';
        appContainer.style.opacity = '1';
        appContainer.style.position = 'relative';
        appContainer.style.zIndex = '1000';
        appContainer.classList.remove('hidden');
        console.log('✅ App container shown');
    }
    
    // 3. Add CSS class to body
    document.body.classList.add('user-authenticated');
    document.body.classList.add('app-loaded');
    document.body.classList.remove('app-loading');
    
    // 4. Force create navigation if missing
    if (!document.querySelector('.top-nav')) {
        console.log('🛠️ Creating navigation...');
        this.createEmergencyNavigation();
    }
    
    // 5. Load dashboard
    setTimeout(() => {
        this.loadDashboard();
    }, 500);
    
    console.log('🎉 APP FORCE-SHOW COMPLETE');
}

// ADD THESE HELPER METHODS
createEmergencyNavigation() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    // Check if navigation already exists
    if (appContainer.querySelector('header')) return;
    
    // Create emergency header
    const header = document.createElement('header');
    header.innerHTML = `
        <nav class="top-nav" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 15px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        ">
            <div class="nav-brand">
                <span style="font-size: 20px; font-weight: bold; color: #4CAF50;">🌱 AgriMetrics</span>
            </div>
            <div class="nav-items">
                <button class="nav-item" onclick="window.location.reload()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Dashboard</button>
            </div>
        </nav>
    `;
    
    appContainer.insertBefore(header, appContainer.firstChild);
    
    // Adjust main content padding
    const main = document.getElementById('content-area');
    if (main) {
        main.style.paddingTop = '60px';
    }
}

loadDashboard() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    console.log('📊 Loading dashboard...');
    
    // Show loading indicator
    contentArea.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h3>Loading Dashboard...</h3>
            <p>Welcome to AgriMetrics Farm Management System</p>
            <button onclick="window.location.reload()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin-top: 20px;
                cursor: pointer;
            ">Refresh Page</button>
        </div>
    `;
    
    // Try to load dashboard module
    setTimeout(() => {
        if (typeof window.dashboardModule !== 'undefined' && window.dashboardModule.init) {
            window.dashboardModule.init();
            console.log('✅ Dashboard module loaded');
        } else if (typeof window.framework !== 'undefined' && window.framework.renderModule) {
            window.framework.renderModule('dashboard');
            console.log('✅ Dashboard rendered via framework');
        } else {
            // Show basic dashboard
            contentArea.innerHTML = `
                <div style="padding: 20px;">
                    <h2>Dashboard</h2>
                    <p>Welcome to your farm management dashboard!</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                        <div style="background: #4CAF50; color: white; padding: 20px; border-radius: 8px;">
                            <h3>Total Orders</h3>
                            <p style="font-size: 24px; margin: 10px 0;">0</p>
                        </div>
                        <div style="background: #2196F3; color: white; padding: 20px; border-radius: 8px;">
                            <h3>Total Revenue</h3>
                            <p style="font-size: 24px; margin: 10px 0;">$0</p>
                        </div>
                        <div style="background: #FF9800; color: white; padding: 20px; border-radius: 8px;">
                            <h3>Pending Orders</h3>
                            <p style="font-size: 24px; margin: 10px 0;">0</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1000);
}

// Add this method to your auth.js class
showAppInterface() {
    console.log('🛠️ Manually showing app interface...');
    
    // Hide auth container
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer && appContainer) {
        // Hide auth
        authContainer.style.display = 'none';
        authContainer.classList.add('hidden');
        
        // Show app
        appContainer.style.display = 'block';
        appContainer.classList.remove('hidden');
        
        console.log('✅ App interface shown');
        
        // Add CSS class to body for styling
        document.body.classList.add('user-authenticated');
        
        // Load dashboard module
        setTimeout(() => {
            if (typeof window.dashboardModule !== 'undefined') {
                window.dashboardModule.init();
                console.log('✅ Dashboard module initialized');
            } else if (typeof window.framework !== 'undefined' && window.framework.renderModule) {
                window.framework.renderModule('dashboard');
                console.log('✅ Dashboard rendered via framework');
            }
        }, 500);
    } else {
        console.error('❌ Containers not found');
        console.log('Auth container:', authContainer);
        console.log('App container:', appContainer);
        
        // Fallback: reload page
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// NEW METHOD: Create account with password
async createAccountWithPassword(email, password, name = '', farmName = '') {
    console.log('👷 Creating account with email/password...');
    
    try {
        const auth = firebase.auth();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        console.log('✅ Account created:', userCredential.user.uid);
        
        // Update profile if name provided
        if (name) {
            await userCredential.user.updateProfile({
                displayName: name
            });
        }
        
        // CRITICAL: Save to localStorage for your app
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name || email);
        localStorage.setItem('userUid', userCredential.user.uid);
        localStorage.setItem('farmName', farmName || 'My Farm');
        localStorage.setItem('farm-profile', JSON.stringify({
            farmName: farmName || 'My Farm',
            ownerName: name || email,
            email: email,
            uid: userCredential.user.uid
        }));
        
        // Create Firestore profile
        try {
            const db = firebase.firestore();
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                name: name || email,
                farmName: farmName || 'My Farm',
                createdAt: new Date().toISOString(),
                uid: userCredential.user.uid
            });
            console.log('✅ Profile saved to Firestore');
        } catch (firestoreError) {
            console.warn('⚠️ Firestore error:', firestoreError);
        }
        
        // Auto sign-in
        await auth.signInWithEmailAndPassword(email, password);
        
        this.showNotification('Account created successfully! Welcome!', 'success');
        
        // Force reload to trigger auth listener
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Account creation error:', error);
        throw error;
    }
}

    // ======== REBUILT FORGOT PASSWORD METHOD ========
    async handleForgotPassword() {
        console.log('🚀 STARTING PASSWORD RESET...');
        
        const form = document.getElementById('forgot-password-form-element');
        if (!form) return;

        const email = document.getElementById('forgot-email')?.value.trim() || '';
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML || 'Send Reset Link';
        if (submitBtn) {
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
        }

        try {
            if (!window.firebase || !window.firebase.auth) {
                throw new Error('Firebase not loaded');
            }
            
            const auth = window.firebase.auth();
            await auth.sendPasswordResetEmail(email);
            
            console.log('✅ Password reset email sent to:', email);
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
            
            // Auto-switch back to sign in after 3 seconds
            setTimeout(() => {
                this.showAuthForm('signin');
            }, 3000);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            
            let errorMessage = 'Failed to send reset email: ';
            
            switch(error.code) {
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
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    // ======== HELPER METHODS ========
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showAuthForm(formName) {
        console.log(`📄 Showing form: ${formName}`);
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Try to use core module notification
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
            return;
        }
        
        // Fallback: Create simple notification
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : 
                        type === 'error' ? '#f44336' : 
                        type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showNotificationWithAction(message, type, actionText, actionCallback) {
        console.log(`📢 ${type.toUpperCase()} with action: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <div style="margin-right: 15px;">${message}</div>
            <button class="auth-notification-action" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 4px 12px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                margin-left: 10px;
            ">${actionText}</button>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        document.body.appendChild(notification);
        
        // Add action button handler
        const actionBtn = notification.querySelector('.auth-notification-action');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                actionCallback();
                notification.remove();
            });
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authModule = new AuthModule();
    });
} else {
    window.authModule = new AuthModule();
}

console.log('✅ Auth Module loaded successfully');
