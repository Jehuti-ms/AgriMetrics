// modules/auth.js - WITH GOOGLE AND MICROSOFT SOCIAL LOGIN - CENTERED (FIXED)
console.log('Loading auth module...');

class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Auth module initialized');
        this.setupAuthForms();
        this.addCenteringStyles(); // ADDED: Call centering styles
    }

    setupAuthForms() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachFormHandlers();
                this.ensureSingleFormVisible(); // FIXED: Show only one form
            });
        } else {
            this.attachFormHandlers();
            this.ensureSingleFormVisible(); // FIXED: Show only one form
        }
    }
    
    // ======== FIXED: CENTERING METHODS ========
    addCenteringStyles() {
        // Create and inject centering CSS that targets only active forms
        const style = document.createElement('style');
        style.id = 'auth-centering-styles';
        style.textContent = `
            /* AUTH CENTERING STYLES - ONLY APPLY TO AUTH PAGES */
            body.auth-page,
            body.login-page,
            body.signin-page {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
                padding: 20px !important;
                width: 100% !important;
                margin: 0 !important;
            }
            
            /* Only center the main auth container, not individual forms */
            #auth-container,
            .auth-container {
                max-width: 400px !important;
                width: 100% !important;
                margin: 0 auto !important;
            }
            
            /* HIDE ALL FORMS BY DEFAULT */
            .auth-form {
                display: none !important;
            }
            
            /* SHOW ONLY ACTIVE FORM */
            .auth-form.active {
                display: block !important;
            }
            
            /* Glass effect for the main container */
            .auth-container {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 20px !important;
                padding: 40px !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
                animation: fadeInUp 0.5s ease-out !important;
            }
            
            /* Animation */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                body.auth-page,
                body.login-page,
                body.signin-page {
                    padding: 15px !important;
                }
                
                .auth-container {
                    padding: 30px 20px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // ======== FIXED: ENSURE ONLY ONE FORM IS VISIBLE ========
    ensureSingleFormVisible() {
        // Hide all forms first
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
            form.classList.remove('active');
        });
        
        // Show only the signin form by default
        const defaultForm = document.getElementById('signin-form') || 
                           document.querySelector('.auth-form');
        
        if (defaultForm) {
            defaultForm.style.display = 'block';
            defaultForm.classList.add('active');
        }
        
        // Add auth-page class to body to trigger centering
        if (window.location.hash.includes('auth') || 
            window.location.hash.includes('login') ||
            window.location.hash.includes('signin')) {
            document.body.classList.add('auth-page');
        }
    }
 
    // ======== EXISTING CODE BELOW (keep everything else as is) ========
    
    attachFormHandlers() {
        console.log('🔧 Attaching form handlers...');
        
        // RENDER SOCIAL LOGIN BUTTONS
        this.renderSocialLoginButtons();
        
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

     // ======== FIXED: SHOW AUTH FORM METHOD ========
    showAuthForm(formName) {
        console.log(`🔄 Showing ${formName} form`);
        
        // Hide all forms first
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
            form.classList.remove('active');
        });
        
        // Show the requested form
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.style.display = 'block';
            targetForm.classList.add('active');
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
    
    // ======== SOCIAL LOGIN METHODS ========
   // In the renderSocialLoginButtons() method:
renderSocialLoginButtons() {
    console.log('🔄 Rendering social login buttons...');
    const socialContainer = document.getElementById('social-login-container');
    
    if (socialContainer) {
        console.log('✅ Social container found, rendering buttons...');
        
        // ONLY Google button - Clean and professional
        socialContainer.innerHTML = `
            <div class="social-buttons">
                <button type="button" class="btn-social google" id="google-signin-btn">
                    <span class="social-icon">G</span>
                    <span class="social-text">Continue with Google</span>
                </button>
            </div>
        `;
        
        console.log('✅ Google button HTML rendered');
        
        // Add click handler
        const googleBtn = document.getElementById('google-signin-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🔵 Google sign-in clicked');
                await this.handleSocialSignIn('google');
            });
            console.log('✅ Google button listener attached');
        }
    }
}
    
    attachSocialButtonListeners() {
        const googleBtn = document.getElementById('google-signin-btn');
        const microsoftBtn = document.getElementById('microsoft-signin-btn');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🔵 Google sign-in clicked');
                await this.handleSocialSignIn('google');
            });
            console.log('✅ Google button listener attached');
        }
        
        if (microsoftBtn) {
            microsoftBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🔵 Microsoft sign-in clicked');
                await this.handleSocialSignIn('microsoft');
            });
            console.log('✅ Microsoft button listener attached');
        }
    }
    
    async handleSocialSignIn(provider) {
        console.log(`🔐 Starting ${provider} sign-in...`);
        
        let result;
        const socialContainer = document.getElementById('social-login-container');
        
        if (!socialContainer) {
            this.showNotification('Social login container not found', 'error');
            return;
        }
        
        // Disable social buttons during sign-in
        const buttons = socialContainer.querySelectorAll('.btn-social');
        buttons.forEach(btn => {
            btn.disabled = true;
            const originalText = btn.querySelector('.social-text')?.textContent || 'Continue';
            btn.innerHTML = `<span class="social-text">Signing in with ${provider}...</span>`;
            btn.dataset.originalText = originalText;
        });
        
        try {
            if (provider === 'google') {
                result = await this.signInWithGoogle();
            } else if (provider === 'microsoft') {
                result = await this.signInWithMicrosoft();
            } else {
                this.showNotification(`${provider} sign-in is not available`, 'error');
                return;
            }
            
            if (result?.success) {
                this.showNotification(`Signed in with ${provider === 'google' ? 'Google' : 'Microsoft'}!`, 'success');
                // Auth state change will be handled by app.js
            } else {
                this.showNotification(result?.error || `Error signing in with ${provider === 'google' ? 'Google' : 'Microsoft'}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error signing in with ${provider === 'google' ? 'Google' : 'Microsoft'}: ${error.message}`, 'error');
        } finally {
            // Re-enable buttons
            buttons.forEach(btn => {
                btn.disabled = false;
                if (btn.dataset.originalText) {
                    const icon = provider === 'google' ? 'G' : 'M';
                    btn.innerHTML = `
                        <span class="social-icon">${icon}</span>
                        <span class="social-text">${btn.dataset.originalText}</span>
                    `;
                }
            });
        }
    }
    
    async signInWithGoogle() {
        try {
            console.log('🔐 Starting Google sign-in...');
            
            // Check if we're in a valid environment
            if (window.location.protocol === 'file:') {
                throw new Error('Cannot use Google Sign-In with file:// protocol. Please use a local server.');
            }
            
            // Check for GitHub Pages
            const isGitHubPages = window.location.hostname.includes('github.io');
            
            if (isGitHubPages) {
                console.log('🌐 GitHub Pages detected - using redirect method');
                return await this.signInWithGoogleRedirect();
            }
            
            // Use popup method for local/dev
            console.log('🎯 Using popup method...');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            console.log('✅ Google provider created');
            
            // Add timeout for popup
            const signInPromise = firebase.auth().signInWithPopup(provider);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sign-in timeout (30s)')), 30000);
            });
            
            console.log('⏱️ Waiting for popup response...');
            const result = await Promise.race([signInPromise, timeoutPromise]);
            
            console.log('🎉 Google sign-in successful!');
            console.log('User:', result.user.email);
            
            // Save user to Firestore
            await this.saveUserToFirestore(result.user, {
                provider: 'google'
            });
            
            return { success: true, user: result.user };
            
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            
            let userMessage = `Google sign-in failed: ${error.message}`;
            
            if (error.code === 'auth/popup-blocked') {
                userMessage = 'Popup was blocked. Trying redirect method...';
                // Try redirect as fallback
                return await this.signInWithGoogleRedirect();
            } else if (error.code === 'auth/unauthorized-domain') {
                userMessage = `Domain "${window.location.hostname}" is not authorized in Firebase Console.`;
            } else if (error.code === 'auth/operation-not-allowed') {
                userMessage = 'Google sign-in is not enabled in Firebase Console.';
            }
            
            this.showNotification(userMessage, 'error');
            return { success: false, error: error.message };
        }
    }
    
    async signInWithGoogleRedirect() {
        try {
            console.log('🔄 Starting Google sign-in redirect...');
            
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            // Store current URL to return after auth
            sessionStorage.setItem('authReturnUrl', window.location.href);
            sessionStorage.setItem('authMethod', 'google-redirect');
            
            console.log('🔀 Redirecting to Google...');
            await firebase.auth().signInWithRedirect(provider);
            
            return { success: true, redirecting: true };
            
        } catch (error) {
            console.error('❌ Redirect sign-in error:', error);
            this.showNotification(`Google redirect failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    async signInWithMicrosoft() {
        try {
            console.log('🔐 Starting Microsoft sign-in...');
            
            // First, check if Microsoft provider is enabled in Firebase
            this.showNotification('Microsoft sign-in is being set up...', 'info');
            
            // Try to sign in with Microsoft
            const provider = new firebase.auth.OAuthProvider('microsoft.com');
            
            // Add scopes for Microsoft
            provider.addScope('user.read');
            provider.addScope('openid');
            provider.addScope('profile');
            provider.addScope('email');
            
            // Set custom parameters
            provider.setCustomParameters({
                prompt: 'select_account',
                tenant: 'common' // Use 'common' for personal accounts, or your tenant ID for organizational accounts
            });
            
            console.log('✅ Microsoft provider created');
            
            // Try popup first
            const signInPromise = firebase.auth().signInWithPopup(provider);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sign-in timeout (30s)')), 30000);
            });
            
            console.log('⏱️ Waiting for Microsoft popup response...');
            const result = await Promise.race([signInPromise, timeoutPromise]);
            
            console.log('🎉 Microsoft sign-in successful!');
            console.log('User:', result.user.email);
            
            // Save user to Firestore
            await this.saveUserToFirestore(result.user, {
                provider: 'microsoft'
            });
            
            return { success: true, user: result.user };
            
        } catch (error) {
            console.error('❌ Microsoft sign-in error:', error);
            
            let errorMessage = `Microsoft sign-in failed: ${error.message}`;
            
            // Check common errors
            if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Microsoft sign-in is not enabled in Firebase Console. Please enable it first.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = `Domain "${window.location.hostname}" is not authorized in Firebase Console.`;
            } else if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Microsoft OAuth configuration not found. Please check Firebase Console settings.';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message };
        }
    }
    
    async saveUserToFirestore(user, additionalData = {}) {
        try {
            if (!firebase.firestore) {
                console.warn('Firestore not available, skipping user data save');
                return;
            }
            
            const userRef = firebase.firestore().collection('users').doc(user.uid);
            
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || additionalData.name || '',
                photoURL: user.photoURL || '',
                provider: additionalData.provider || 'unknown',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                ...additionalData
            };
            
            // Remove undefined values
            Object.keys(userData).forEach(key => {
                if (userData[key] === undefined) {
                    delete userData[key];
                }
            });
            
            await userRef.set(userData, { merge: true });
            console.log('✅ User data saved to Firestore');
            
        } catch (error) {
            console.error('Error saving user to Firestore:', error);
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

// Add tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const formId = this.getAttribute('data-form');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${formId}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Keep existing show/hide functionality for compatibility
    document.getElementById('show-signup')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-form="signup"]')?.click();
    });
    
    document.getElementById('show-signin')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-form="signin"]')?.click();
    });
    
    document.getElementById('show-forgot-password')?.addEventListener('click', function(e) {
        e.preventDefault();
        // Show forgot password form
        forms.forEach(form => form.classList.remove('active'));
        document.getElementById('forgot-password-form').classList.add('active');
    });
    
    document.getElementById('show-signin-from-forgot')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-form="signin"]')?.click();
    });
});

// Simple Remember Me functionality
class SimpleRememberMe {
    constructor() {
        this.STORAGE_KEY = 'farm_system_user';
        this.init();
    }
    
    init() {
        this.loadSavedEmail();
        this.setupFormListener();
    }
    
    loadSavedEmail() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                const emailInput = document.getElementById('signin-email');
                const rememberCheckbox = document.getElementById('remember-me');
                
                if (emailInput && data.email) {
                    emailInput.value = data.email;
                }
                
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }
            }
        } catch (error) {
            console.log('No saved credentials found');
        }
    }
    
    setupFormListener() {
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                this.handleSignIn();
            });
        }
    }
    
    handleSignIn() {
        const rememberCheckbox = document.getElementById('remember-me');
        const emailInput = document.getElementById('signin-email');
        
        if (rememberCheckbox && rememberCheckbox.checked && emailInput && emailInput.value) {
            // Save email to localStorage
            const data = {
                email: emailInput.value,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } else {
            // Clear if checkbox is unchecked
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }
    
    // Call this on logout
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.simpleRememberMe = new SimpleRememberMe();
});

// Initialize the auth module
document.addEventListener('DOMContentLoaded', () => {
    window.authModule = new AuthModule();
});
