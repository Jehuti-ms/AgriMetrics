// modules/auth.js
console.log('Loading auth module...');

const AuthModule = {
    name: 'auth',
    initialized: false,

    initialize() {
        console.log('🔐 Initializing auth module...');
        this.setupAuthForms();
        this.initialized = true;
        return true;
    },

    setupAuthForms() {
        // Form elements
        const signinForm = document.getElementById('signin-form-element');
        const signupForm = document.getElementById('signup-form-element');
        const forgotForm = document.getElementById('forgot-password-form-element');
        
        // Link elements
        const showSignup = document.getElementById('show-signup');
        const showSignin = document.getElementById('show-signin');
        const showForgotPassword = document.getElementById('show-forgot-password');
        const showSigninFromForgot = document.getElementById('show-signin-from-forgot');
        const googleSignin = document.getElementById('google-signin');

        // Form submissions
        signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Form navigation
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignUpForm();
        });

        showSignin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignInForm();
        });

        showForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordForm();
        });

        showSigninFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignInForm();
        });

        // Google Sign In
        googleSignin.addEventListener('click', () => this.handleGoogleSignIn());

        console.log('✅ Auth forms setup complete');
    },

    showSignInForm() {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById('signin-form').classList.add('active');
    },

    showSignUpForm() {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById('signup-form').classList.add('active');
    },

    showForgotPasswordForm() {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById('forgot-password-form').classList.add('active');
    },

    async handleSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('✅ User signed in:', userCredential.user.email);
        } catch (error) {
            console.error('❌ Sign in error:', error);
            this.showAuthError(error.message);
        }
    },

    async handleSignUp(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value;

        if (password !== confirmPassword) {
            this.showAuthError('Passwords do not match');
            return;
        }

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Save additional user data to Firestore
            await this.saveUserData(userCredential.user.uid, {
                name: name,
                email: email,
                farmName: farmName,
                createdAt: new Date().toISOString()
            });
            
            console.log('✅ User signed up:', userCredential.user.email);
        } catch (error) {
            console.error('❌ Sign up error:', error);
            this.showAuthError(error.message);
        }
    },

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value;

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            this.showAuthSuccess('Password reset email sent!');
            this.showSignInForm();
        } catch (error) {
            console.error('❌ Password reset error:', error);
            this.showAuthError(error.message);
        }
    },

    async handleGoogleSignIn() {
        try {
            // For now, we'll use a simple approach
            // In a real app, you'd use Firebase Google Auth
            this.showAuthError('Google Sign In not implemented yet');
        } catch (error) {
            console.error('❌ Google sign in error:', error);
            this.showAuthError(error.message);
        }
    },

    async saveUserData(uid, userData) {
        try {
            await firebase.firestore().collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    },

    showAuthError(message) {
        // You can enhance this with better UI
        alert('Error: ' + message);
    },

    showAuthSuccess(message) {
        // You can enhance this with better UI
        alert('Success: ' + message);
    },

    signOut() {
        firebase.auth().signOut().then(() => {
            console.log('✅ User signed out');
        }).catch((error) => {
            console.error('❌ Sign out error:', error);
        });
    }
};

// Register auth module
if (window.FarmModules) {
    window.FarmModules.registerModule('auth', AuthModule);
}

// Make auth module globally available
window.authModule = AuthModule;
