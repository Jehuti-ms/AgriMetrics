// modules/auth.js - Updated for your Firebase setup
console.log('Loading auth module...');

const AuthModule = {
    name: 'auth',
    initialized: false,

    initialize() {
        console.log('🔐 Initializing auth...');
        this.setupAuthUI();
        this.initialized = true;
        return true;
    },

    setupAuthUI() {
        // Hide app container, show auth container
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        
        if (appContainer) appContainer.classList.add('hidden');
        if (authContainer) authContainer.classList.remove('hidden');

        this.setupAuthEventListeners();
    },

    setupAuthEventListeners() {
        // Sign In form
        const signinForm = document.getElementById('signin-form-element');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        // Sign Up form
        const signupForm = document.getElementById('signup-form-element');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }

        // Forgot Password form
        const forgotForm = document.getElementById('forgot-password-form-element');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Auth navigation links
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signup-form');
        });

        document.getElementById('show-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signin-form');
        });

        document.getElementById('show-forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot-password-form');
        });

        document.getElementById('show-signin-from-forgot')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signin-form');
        });

        // Google Sign In
        document.getElementById('google-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleGoogleSignIn();
        });
    },

    showForm(formId) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show selected form
        const targetForm = document.getElementById(formId);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    },

    async handleSignIn(event) {
        event.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            this.showAuthMessage('Please enter both email and password', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            // Use Firebase authentication
            if (window.firebaseAuth && window.firebaseAuth.signInWithEmailAndPassword) {
                await window.firebaseAuth.signInWithEmailAndPassword(email, password);
                this.handleAuthSuccess();
            } else {
                // Fallback to simple auth for demo
                await this.demoSignIn(email, password);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            this.showAuthMessage('Sign in failed: ' + error.message, 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    async handleSignUp(event) {
        event.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const farmName = document.getElementById('farm-name').value;

        if (!name || !email || !password || !confirmPassword || !farmName) {
            this.showAuthMessage('Please fill all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        try {
            // Use Firebase authentication
            if (window.firebaseAuth && window.firebaseAuth.createUserWithEmailAndPassword) {
                await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
                
                // Save user profile
                if (window.firebaseFirestore) {
                    await window.firebaseFirestore.collection('users').doc(email).set({
                        name: name,
                        farmName: farmName,
                        createdAt: new Date().toISOString()
                    });
                }
                
                this.handleAuthSuccess();
            } else {
                // Fallback to demo sign up
                await this.demoSignUp(email, password, name, farmName);
            }
        } catch (error) {
            console.error('Sign up error:', error);
            this.showAuthMessage('Sign up failed: ' + error.message, 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    async handleForgotPassword(event) {
        event.preventDefault();
        
        const email = document.getElementById('forgot-email').value;

        if (!email) {
            this.showAuthMessage('Please enter your email', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            if (window.firebaseAuth && window.firebaseAuth.sendPasswordResetEmail) {
                await window.firebaseAuth.sendPasswordResetEmail(email);
                this.showAuthMessage('Password reset email sent!', 'success');
                this.showForm('signin-form');
            } else {
                this.showAuthMessage('Password reset feature not available in demo', 'info');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            this.showAuthMessage('Password reset failed: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    async handleGoogleSignIn() {
        try {
            if (window.firebaseAuth && window.firebaseAuth.signInWithPopup) {
                const provider = new firebase.auth.GoogleAuthProvider();
                await window.firebaseAuth.signInWithPopup(provider);
                this.handleAuthSuccess();
            } else {
                this.showAuthMessage('Google Sign In not available in demo', 'info');
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showAuthMessage('Google Sign In failed: ' + error.message, 'error');
        }
    },

    // Demo authentication for testing
    async demoSignIn(email, password) {
        // Simple demo authentication
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const demoUsers = {
                    'demo@farm.com': 'demo123',
                    'admin@farm.com': 'admin123',
                    'user@farm.com': 'user123'
                };

                if (demoUsers[email] === password) {
                    localStorage.setItem('farm-authenticated', 'true');
                    localStorage.setItem('farm-user-email', email);
                    resolve();
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    },

    async demoSignUp(email, password, name, farmName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('farm-authenticated', 'true');
                localStorage.setItem('farm-user-email', email);
                localStorage.setItem('farm-user-name', name);
                localStorage.setItem('farm-name', farmName);
                resolve();
            }, 1000);
        });
    },

    handleAuthSuccess() {
        this.showAuthMessage('Authentication successful!', 'success');
        
        // Hide auth, show app
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        
        if (appContainer) appContainer.classList.remove('hidden');
        if (authContainer) authContainer.classList.add('hidden');

        // Load dashboard
        if (window.farmApp && window.farmApp.loadModule) {
            window.farmApp.loadModule('dashboard');
        }
    },

    showAuthMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    },

    logout() {
        if (window.firebaseAuth && window.firebaseAuth.signOut) {
            window.firebaseAuth.signOut();
        }
        
        localStorage.removeItem('farm-authenticated');
        localStorage.removeItem('farm-user-email');
        localStorage.removeItem('farm-user-name');
        localStorage.removeItem('farm-name');

        // Show auth, hide app
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        
        if (appContainer) appContainer.classList.add('hidden');
        if (authContainer) authContainer.classList.remove('hidden');
        
        this.showForm('signin-form');
    }
};

// Add auth styles if not present
if (!document.querySelector('#auth-styles')) {
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .hidden {
            display: none !important;
        }
        
        .auth-message-success {
            background: #10b981 !important;
        }
        
        .auth-message-error {
            background: #ef4444 !important;
        }
        
        .auth-message-info {
            background: #3b82f6 !important;
        }
    `;
    document.head.appendChild(styles);
}

// Register module
if (window.registerModule) {
    window.registerModule('auth', AuthModule);
    console.log('✅ Auth module registered');
}
