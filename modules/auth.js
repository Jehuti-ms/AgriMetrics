// modules/auth.js - Complete implementation
FarmModules.registerModule('auth', {
    name: 'Authentication',
    isAuthModule: true,
    
    initialize: function() {
        console.log('Initializing authentication module...');
        this.setupAuthForms();
        this.attachAuthEventListeners();
        this.checkAuthState();
        this.setupRealTimeValidation();
    },
    
    setupAuthForms: function() {
        // Set current date for any date fields
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('#auth-container input[type="date"]').forEach(input => {
            input.value = today;
        });
        
        // Add password toggle functionality
        this.setupPasswordToggle();
    },
    
    setupPasswordToggle: function() {
        // Add toggle buttons to password fields
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '👁️';
            toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
            
            toggleBtn.addEventListener('click', () => {
                const type = field.type === 'password' ? 'text' : 'password';
                field.type = type;
                toggleBtn.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
            });
            
            field.parentNode.style.position = 'relative';
            field.parentNode.appendChild(toggleBtn);
        });
    },
    
    attachAuthEventListeners: function() {
        console.log('Attaching auth event listeners...');
        
        // Sign in form
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Sign in form submitted');
                this.handleSignIn(e);
            });
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
        
        // Auth navigation links
        this.setupAuthNavigation();
        
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
        
        const closeModalBtn = document.querySelector('.modal .close');
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
        
        console.log('All auth event listeners attached');
    },
    
    setupAuthNavigation: function() {
        // Use event delegation for auth navigation
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.id === 'show-signup' || target.closest('#show-signup')) {
                e.preventDefault();
                this.showAuthForm('signup');
            }
            else if (target.id === 'show-signin' || target.closest('#show-signin')) {
                e.preventDefault();
                this.showAuthForm('signin');
            }
            else if (target.id === 'show-forgot-password' || target.closest('#show-forgot-password')) {
                e.preventDefault();
                this.showAuthForm('forgot-password');
            }
            else if (target.id === 'show-signin-from-forgot' || target.closest('#show-signin-from-forgot')) {
                e.preventDefault();
                this.showAuthForm('signin');
            }
        });
    },
    
    setupRealTimeValidation: function() {
        // Real-time email validation
        const emailFields = document.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateEmailField(field);
            });
        });
        
        // Real-time password validation for signup
        const signupPassword = document.getElementById('signup-password');
        if (signupPassword) {
            signupPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('signup-confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => {
                this.validatePasswordMatch();
            });
        }
    },
    
    validateEmailField: function(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(field, 'Please enter a valid email address');
        } else {
            this.clearFieldError(field);
        }
    },
    
    validatePasswordMatch: function() {
        const password = document.getElementById('signup-password');
        const confirmPassword = document.getElementById('signup-confirm-password');
        
        if (password && confirmPassword && password.value && confirmPassword.value) {
            if (password.value !== confirmPassword.value) {
                this.showFieldError(confirmPassword, 'Passwords do not match');
            } else {
                this.clearFieldError(confirmPassword);
            }
        }
    },
    
    showFieldError: function(field, message) {
        this.clearFieldError(field);
        field.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message active';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },
    
    clearFieldError: function(field) {
        field.classList.remove('form-error');
        const existingError = field.parentNode.querySelector('.error-message.active');
        if (existingError) {
            existingError.remove();
        }
    },
    
    handleSignIn: function(e) {
        console.log('=== SIGN IN PROCESS STARTED ===');
        
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        
        console.log('Email:', email);
        console.log('Password length:', password ? password.length : 0);
        
        // Basic validation
        if (!email) {
            this.showFieldError(document.getElementById('signin-email'), 'Email is required');
            return;
        }
        
        if (!password) {
            this.showFieldError(document.getElementById('signin-password'), 'Password is required');
            return;
        }
        
        // Clear any existing errors
        this.clearFieldError(document.getElementById('signin-email'));
        this.clearFieldError(document.getElementById('signin-password'));
        
        this.setLoadingState('signin-form-element', true);
        
        console.log('Calling Firebase sign in...');
        
        FirebaseAuth.signInWithEmail(email, password)
            .then((userCredential) => {
                console.log('✅ Sign in successful!');
                console.log('User:', userCredential.user);
                
                // Update last login in Firestore
                return FirestoreService.updateUserProfile(userCredential.user.uid, {
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                console.log('Last login updated');
                // Auth state change will handle the UI update
            })
            .catch((error) => {
                console.error('❌ Sign in failed:', error);
                this.handleAuthError(error, 'signin');
            })
            .finally(() => {
                this.setLoadingState('signin-form-element', false);
            });
    },
    
    handleSignUp: function(e) {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value.trim();
        
        // Validation
        if (!name || !email || !password || !confirmPassword || !farmName) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showFieldError(document.getElementById('signup-confirm-password'), 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showFieldError(document.getElementById('signup-password'), 'Password must be at least 6 characters');
            return;
        }
        
        this.setLoadingState('signup-form-element', true);
        
        FirebaseAuth.signUpWithEmail(email, password, name, farmName)
            .then((userCredential) => {
                console.log('Sign up successful:', userCredential.user);
                this.showSuccessMessage('Account created successfully!');
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
            .then((result) => {
                console.log('Google sign in successful:', result.user);
                this.showSuccessMessage('Signed in with Google successfully!');
            })
            .catch((error) => {
                this.handleAuthError(error, 'google');
            })
            .finally(() => {
                this.setLoadingState('google-signin', false);
            });
    },
    
    handleForgotPassword: function(e) {
        const email = document.getElementById('forgot-email').value.trim();
        
        if (!email) {
            this.showFieldError(document.getElementById('forgot-email'), 'Email is required');
            return;
        }
        
        this.setLoadingState('forgot-password-form-element', true);
        
        FirebaseAuth.sendPasswordResetEmail(email)
            .then(() => {
                this.showSuccessMessage('Password reset email sent! Check your inbox.');
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
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }
        
        this.setLoadingState('change-password-form', true);
        
        FirebaseAuth.reauthenticate(currentPassword)
            .then(() => {
                return FirebaseAuth.updatePassword(newPassword);
            })
            .then(() => {
                this.showSuccessMessage('Password updated successfully!');
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
        if (confirm('Are you sure you want to sign out?')) {
            FirebaseAuth.signOut()
                .then(() => {
                    console.log('User signed out successfully');
                    this.showSuccessMessage('Signed out successfully');
                })
                .catch((error) => {
                    console.error('Sign out error:', error);
                    alert('Error signing out: ' + error.message);
                });
        }
    },
    
    handleAuthSuccess: function(user) {
        console.log('🔄 Handling auth success for user:', user.email);
        
        // Hide auth container, show app container
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.style.display = 'none';
        if (appContainer) appContainer.classList.remove('hidden');
        
        // Update user interface
        this.updateUserInterface(user);
        
        // Initialize auto-sync
        if (typeof AutoSyncManager !== 'undefined') {
            AutoSyncManager.init();
        }
        
        // Load user data from Firestore
        this.loadUserData(user.uid);
        
        // Initialize main app if not already done
        if (typeof initializeNavigation === 'function') {
            initializeNavigation();
        }
        
        if (typeof FarmModules !== 'undefined' && FarmModules.initializeModules) {
            FarmModules.initializeModules();
        }
        
        console.log('✅ Auth success handling complete');
    },
    
    handleAuthFailure: function() {
        console.log('🔄 Handling auth failure');
        
        // Show auth container, hide app container
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.style.display = 'flex';
        if (appContainer) appContainer.classList.add('hidden');
        
        // Reset forms
        this.showAuthForm('signin');
        
        // Clear any sensitive data
        document.querySelectorAll('#auth-container input[type="password"]').forEach(input => {
            input.value = '';
        });
    },
    
    handleAuthError: function(error, context) {
        console.error(`Auth error in ${context}:`, error);
        
        let message = 'An error occurred';
        
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Invalid email address format';
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
            case 'auth/network-request-failed':
                message = 'Network error. Please check your connection';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Please try again later';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign in cancelled';
                break;
            case 'auth/popup-blocked':
                message = 'Popup blocked. Please allow popups for this site';
                break;
            default:
                message = error.message || 'Authentication failed';
        }
        
        // Show error to user
        this.showErrorMessage(message);
        
        // Highlight problematic fields
        if (context === 'signin') {
            if (error.code === 'auth/user-not-found') {
                this.showFieldError(document.getElementById('signin-email'), message);
            } else if (error.code === 'auth/wrong-password') {
                this.showFieldError(document.getElementById('signin-password'), message);
            }
        }
    },
    
    checkAuthState: function() {
        console.log('🔍 Checking auth state...');
        
        FirebaseAuth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            
            if (user) {
                console.log('User details:', {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid
                });
                this.handleAuthSuccess(user);
            } else {
                this.handleAuthFailure();
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.handleAuthFailure();
        });
    },
    
    showAuthForm: function(formName) {
        console.log('Showing auth form:', formName);
        
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show target form
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
        
        // Reset forms (except current one)
        document.querySelectorAll('.auth-form form').forEach(form => {
            if (form.id !== `${formName}-form-element`) {
                form.reset();
            }
        });
        
        // Clear errors
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.form-error').forEach(field => field.classList.remove('form-error'));
    },
    
    showChangePasswordModal: function() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    },
    
    hideChangePasswordModal: function() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('change-password-form').reset();
        }
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
                button.innerHTML = '<span class="loading-spinner"></span> Loading...';
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
    
    updatePasswordStrength: function(password) {
        const strengthIndicator = document.getElementById('password-strength');
        if (!strengthIndicator) return;

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        const strengthClasses = ['strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
        const strengthText = ['Very Weak', 'Weak', 'Good', 'Strong'];
        
        strengthIndicator.className = 'password-strength ' + (strengthClasses[strength - 1] || '');
        strengthIndicator.setAttribute('data-strength', strengthText[strength - 1] || 'Very Weak');
    },
    
    updateUserInterface: function(user) {
        console.log('Updating UI for user:', user.displayName);
        
        // Update user greeting
        const greeting = document.getElementById('user-greeting');
        if (greeting) {
            greeting.textContent = `Hello, ${user.displayName || 'User'}`;
        }
        
        // Update user initials in avatar
        const initials = document.getElementById('user-initials');
        if (initials) {
            const nameParts = (user.displayName || 'User').split(' ');
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
        
        // Update profile display name
        const profileDisplayName = document.getElementById('profile-display-name');
        if (profileDisplayName) {
            profileDisplayName.textContent = user.displayName || 'User Name';
        }
        
        // Update profile email
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = user.email;
        }
    },
    
    loadUserData: function(userId) {
        console.log('Loading user data for:', userId);
        
        // Load all farm data from Firestore
        const dataTypes = ['inventory', 'transactions', 'production', 'orders', 'sales', 'projects', 'feedRecords'];
        
        dataTypes.forEach(dataType => {
            FirestoreService.loadFarmData(userId, dataType)
                .then((data) => {
                    if (data && data.length > 0) {
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
    },
    
    showSuccessMessage: function(message) {
        // Create or show success message
        let successDiv = document.getElementById('auth-success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.id = 'auth-success-message';
            successDiv.className = 'auth-message success';
            document.querySelector('.auth-forms').prepend(successDiv);
        }
        
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    },
    
    showErrorMessage: function(message) {
        // Create or show error message
        let errorDiv = document.getElementById('auth-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'auth-error-message';
            errorDiv.className = 'auth-message error';
            document.querySelector('.auth-forms').prepend(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
});
