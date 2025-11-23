// Authentication Module
FarmModules.registerModule('auth', {
    name: 'Authentication',
    isAuthModule: true,
    
    initialize: function() {
        this.attachAuthEventListeners();
        this.checkAuthState();
    },
    
    attachAuthEventListeners: function() {
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
        
        // Change password form
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }
        
        // Auth navigation
        document.getElementById('show-signup').addEventListener('click', (e) => this.showAuthForm('signup'));
        document.getElementById('show-signin').addEventListener('click', (e) => this.showAuthForm('signin'));
        document.getElementById('show-forgot-password').addEventListener('click', (e) => this.showAuthForm('forgot-password'));
        document.getElementById('show-signin-from-forgot').addEventListener('click', (e) => this.showAuthForm('signin'));
        
        // Google sign in
        document.getElementById('google-signin').addEventListener('click', () => this.handleGoogleSignIn());
        
        // Sign out
        document.getElementById('signout-btn').addEventListener('click', () => this.handleSignOut());
        
        // Change password modal
        document.getElementById('change-password-btn').addEventListener('click', () => this.showChangePasswordModal());
        document.getElementById('cancel-password-change').addEventListener('click', () => this.hideChangePasswordModal());
        document.querySelector('.close').addEventListener('click', () => this.hideChangePasswordModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('change-password-modal');
            if (e.target === modal) {
                this.hideChangePasswordModal();
            }
        });
    },
    
    checkAuthState: function() {
        FirebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.handleAuthSuccess(user);
            } else {
                this.handleAuthFailure();
            }
        });
    },
    
    handleSignIn: function(e) {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        this.setLoadingState('signin-form-element', true);
        
        FirebaseAuth.signInWithEmail(email, password)
            .then(() => {
                // Success handled in auth state change
            })
            .catch((error) => {
                this.handleAuthError(error, 'signin');
            })
            .finally(() => {
                this.setLoadingState('signin-form-element', false);
            });
    },
    
    handleSignUp: function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        this.setLoadingState('signup-form-element', true);
        
        FirebaseAuth.signUpWithEmail(email, password, name, farmName)
            .then(() => {
                // Success handled in auth state change
            })
            .catch((error) => {
                this.handleAuthError(error, 'signup');
            })
            .finally(() => {
                this.setLoadingState('signup-form-element', false);
            });
    },
    
    handleGoogleSignIn: function() {
        this.setLoadingState('google-signin', true);
        
        FirebaseAuth.signInWithGoogle()
            .then(() => {
                // Success handled in auth state change
            })
            .catch((error) => {
                this.handleAuthError(error, 'google');
            })
            .finally(() => {
                this.setLoadingState('google-signin', false);
            });
    },
    
    handleForgotPassword: function(e) {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        
        this.setLoadingState('forgot-password-form-element', true);
        
        FirebaseAuth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent! Check your inbox.');
                this.showAuthForm('signin');
            })
            .catch((error) => {
                this.handleAuthError(error, 'forgot-password');
            })
            .finally(() => {
                this.setLoadingState('forgot-password-form-element', false);
            });
    },
    
    handleChangePassword: function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match');
            return;
        }
        
        this.setLoadingState('change-password-form', true);
        
        FirebaseAuth.reauthenticate(currentPassword)
            .then(() => {
                return FirebaseAuth.updatePassword(newPassword);
            })
            .then(() => {
                alert('Password updated successfully!');
                this.hideChangePasswordModal();
                document.getElementById('change-password-form').reset();
            })
            .catch((error) => {
                this.handleAuthError(error, 'change-password');
            })
            .finally(() => {
                this.setLoadingState('change-password-form', false);
            });
    },
    
    handleSignOut: function() {
        FirebaseAuth.signOut()
            .then(() => {
                // Success handled in auth state change
            })
            .catch((error) => {
                console.error('Sign out error:', error);
            });
    },
    
    handleAuthSuccess: function(user) {
        // Hide auth container, show app container
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').classList.remove('hidden');
        
        // Update user interface
        this.updateUserInterface(user);
        
        // Initialize auto-sync
        AutoSyncManager.init();
        
        // Load user data from Firestore
        this.loadUserData(user.uid);
    },
    
    handleAuthFailure: function() {
        // Show auth container, hide app container
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').classList.add('hidden');
        
        // Reset forms
        this.showAuthForm('signin');
    },
    
    handleAuthError: function(error, context) {
        let message = 'An error occurred';
        
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            case 'auth/requires-recent-login':
                message = 'Please sign in again to change your password';
                break;
            default:
                message = error.message;
        }
        
        alert(message);
        console.error(`${context} error:`, error);
    },
    
    showAuthForm: function(formName) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show target form
        document.getElementById(`${formName}-form`).classList.add('active');
        
        // Reset forms
        document.querySelectorAll('.auth-form form').forEach(form => {
            if (form.id !== `${formName}-form-element`) {
                form.reset();
            }
        });
    },
    
    showChangePasswordModal: function() {
        document.getElementById('change-password-modal').style.display = 'block';
    },
    
    hideChangePasswordModal: function() {
        document.getElementById('change-password-modal').style.display = 'none';
        document.getElementById('change-password-form').reset();
    },
    
    setLoadingState: function(elementId, isLoading) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const buttons = element.querySelectorAll('button[type="submit"], button[type="button"]');
        
        buttons.forEach(button => {
            if (isLoading) {
                button.disabled = true;
                button.classList.add('loading');
                const originalText = button.textContent;
                button.setAttribute('data-original-text', originalText);
                button.innerHTML = 'Loading...';
            } else {
                button.disabled = false;
                button.classList.remove('loading');
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                }
            }
        });
    },
    
    updateUserInterface: function(user) {
        // Update user greeting
        const greeting = document.getElementById('user-greeting');
        if (greeting && user.displayName) {
            greeting.textContent = `Hello, ${user.displayName}`;
        }
        
        // Update user initials in avatar
        const initials = document.getElementById('user-initials');
        if (initials && user.displayName) {
            const nameParts = user.displayName.split(' ');
            const userInitials = nameParts.map(part => part[0]).join('').toUpperCase();
            initials.textContent = userInitials || 'U';
        }
        
        // Update profile avatar if profile module is active
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar && user.displayName) {
            const nameParts = user.displayName.split(' ');
            const userInitials = nameParts.map(part => part[0]).join('').toUpperCase();
            profileAvatar.textContent = userInitials || 'U';
        }
    },
    
    loadUserData: function(userId) {
        // Load all farm data from Firestore
        const dataTypes = ['inventory', 'transactions', 'production', 'orders', 'sales', 'projects', 'feedRecords'];
        
        dataTypes.forEach(dataType => {
            FirestoreService.loadFarmData(userId, dataType)
                .then((data) => {
                    if (data.length > 0) {
                        FarmModules.appData[dataType] = data;
                        FarmModules.saveDataToStorage();
                        
                        // Update UI if module is active
                        const activeModule = document.querySelector('.section.active');
                        if (activeModule && FarmModules.modules[activeModule.id] && FarmModules.modules[activeModule.id].renderHistory) {
                            FarmModules.modules[activeModule.id].renderHistory();
                        }
                    }
                })
                .catch((error) => {
                    console.error(`Error loading ${dataType}:`, error);
                });
        });
    }
});
