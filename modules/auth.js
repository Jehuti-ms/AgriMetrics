// modules/auth.js - Simplified working version
FarmModules.registerModule('auth', {
    name: 'Authentication',
    isAuthModule: true,
    
    initialize: function() {
        console.log('Auth module initializing...');
        this.setupEventListeners();
        this.checkAuthState();
    },
    
    setupEventListeners: function() {
        // Sign in form
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        // Sign up form
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Google sign in
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => this.handleGoogleSignIn(e));
        }

        // Auth navigation
        this.setupAuthNavigation();
    },
    
    setupAuthNavigation: function() {
        // Simple navigation without event delegation
        const showSignup = document.getElementById('show-signup');
        const showSignin = document.getElementById('show-signin');
        const showForgot = document.getElementById('show-forgot-password');
        const showSigninFromForgot = document.getElementById('show-signin-from-forgot');

        if (showSignup) showSignup.onclick = (e) => { e.preventDefault(); this.showForm('signup'); };
        if (showSignin) showSignin.onclick = (e) => { e.preventDefault(); this.showForm('signin'); };
        if (showForgot) showForgot.onclick = (e) => { e.preventDefault(); this.showForm('forgot-password'); };
        if (showSigninFromForgot) showSigninFromForgot.onclick = (e) => { e.preventDefault(); this.showForm('signin'); };
    },
    
    handleSignIn: function(e) {
        e.preventDefault();
        console.log('Sign in attempt...');

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        this.setLoading(true);

        FirebaseAuth.signInWithEmail(email, password)
            .then(() => {
                console.log('Sign in successful');
            })
            .catch((error) => {
                console.error('Sign in error:', error);
                this.showError(error.message);
            })
            .finally(() => {
                this.setLoading(false);
            });
    },
    
    handleSignUp: function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value;

        if (!name || !email || !password || !confirmPassword || !farmName) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        this.setLoading(true);

        FirebaseAuth.signUpWithEmail(email, password, name, farmName)
            .then(() => {
                console.log('Sign up successful');
                alert('Account created successfully!');
            })
            .catch((error) => {
                console.error('Sign up error:', error);
                this.showError(error.message);
            })
            .finally(() => {
                this.setLoading(false);
            });
    },
    
    handleGoogleSignIn: function(e) {
        e.preventDefault();
        this.setLoading(true);

        FirebaseAuth.signInWithGoogle()
            .then(() => {
                console.log('Google sign in successful');
            })
            .catch((error) => {
                console.error('Google sign in error:', error);
                this.showError(error.message);
            })
            .finally(() => {
                this.setLoading(false);
            });
    },
    
    handleForgotPassword: function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value;

        if (!email) {
            alert('Please enter your email');
            return;
        }

        this.setLoading(true);

        FirebaseAuth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent! Check your inbox.');
                this.showForm('signin');
            })
            .catch((error) => {
                console.error('Password reset error:', error);
                this.showError(error.message);
            })
            .finally(() => {
                this.setLoading(false);
            });
    },
    
    checkAuthState: function() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.handleAuthSuccess(user);
            } else {
                this.handleAuthFailure();
            }
        });
    },
    
    handleAuthSuccess: function(user) {
        console.log('User authenticated:', user.email);
        
        // Hide auth, show app
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').classList.remove('hidden');
        
        // Initialize main app
        if (window.initializeApp) {
            window.initializeApp();
        }
    },
    
    handleAuthFailure: function() {
        console.log('No user authenticated');
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').classList.add('hidden');
        this.showForm('signin');
    },
    
    showForm: function(formName) {
        // Hide all forms
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => form.classList.remove('active'));
        
        // Show target form
        const targetForm = document.getElementById(formName + '-form');
        if (targetForm) {
            targetForm.classList.add('active');
        }
    },
    
    setLoading: function(isLoading) {
        const buttons = document.querySelectorAll('.auth-form button');
        buttons.forEach(button => {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = 'Loading...';
            } else {
                button.disabled = false;
                // Reset button text based on form
                const form = button.closest('.auth-form');
                if (form.id === 'signin-form') {
                    button.innerHTML = 'Sign In';
                } else if (form.id === 'signup-form') {
                    button.innerHTML = 'Create Account';
                } else if (form.id === 'forgot-password-form') {
                    button.innerHTML = 'Send Reset Link';
                }
            }
        });
    },
    
    showError: function(message) {
        alert('Error: ' + message);
    }
});
