// modules/auth.js - Updated with proper event handling
FarmModules.registerModule('auth', {
    name: 'Authentication',
    isAuthModule: true,
    
    initialize: function() {
        this.attachAuthEventListeners();
        this.checkAuthState();
    },
    
    attachAuthEventListeners: function() {
        console.log('Attaching auth event listeners...');
        
        // Sign in form
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            console.log('Found signin form');
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Sign in form submitted');
                this.handleSignIn(e);
            });
        } else {
            console.error('Signin form not found!');
        }
        
        // Sign up form
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp(e);
            });
        }
        
        // Forgot password form
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword(e);
            });
        }
        
        // Change password form
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChangePassword(e);
            });
        }
        
        // Auth navigation - Use event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            if (e.target.id === 'show-signup' || e.target.closest('#show-signup')) {
                e.preventDefault();
                this.showAuthForm('signup');
            }
            if (e.target.id === 'show-signin' || e.target.closest('#show-signin')) {
                e.preventDefault();
                this.showAuthForm('signin');
            }
            if (e.target.id === 'show-forgot-password' || e.target.closest('#show-forgot-password')) {
                e.preventDefault();
                this.showAuthForm('forgot-password');
            }
            if (e.target.id === 'show-signin-from-forgot' || e.target.closest('#show-signin-from-forgot')) {
                e.preventDefault();
                this.showAuthForm('signin');
            }
        });
        
        // Google sign in
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGoogleSignIn();
            });
        }
        
        // Sign out
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSignOut();
            });
        }
        
        // Change password modal
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });
        }
        
        const cancelPasswordBtn = document.getElementById('cancel-password-change');
        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideChangePasswordModal();
            });
        }
        
        const closeModalBtn = document.querySelector('.close');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideChangePasswordModal();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('change-password-modal');
            if (e.target === modal) {
                this.hideChangePasswordModal();
            }
        });
    },
    
    // ... rest of the methods remain the same
    handleSignIn: function(e) {
        console.log('handleSignIn called');
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        console.log('Email:', email, 'Password:', password);
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        this.setLoadingState('signin-form-element', true);
        
        FirebaseAuth.signInWithEmail(email, password)
            .then((userCredential) => {
                console.log('Sign in successful:', userCredential);
                // Success handled in auth state change
            })
            .catch((error) => {
                console.error('Sign in error:', error);
                this.handleAuthError(error, 'signin');
            })
            .finally(() => {
                this.setLoadingState('signin-form-element', false);
            });
    },
    
    // ... other methods remain the same
});
