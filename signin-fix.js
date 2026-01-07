// signin-fix.js - UPDATED FOR SINGLE PAGE APP
console.log('🔐 SIGN-IN FIX FOR SINGLE PAGE APP');

class SignInFix {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🔧 Initializing sign-in fix...');
        
        // Setup sign-in handlers
        this.setupSignInHandlers();
        
        // Check if already signed in
        this.checkExistingAuth();
    }
    
    setupSignInHandlers() {
        console.log('🛠️ Setting up sign-in handlers...');
        
        // Look for sign-in forms and buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON' && 
                (target.textContent.toLowerCase().includes('sign in') || 
                 target.textContent.toLowerCase().includes('login'))) {
                e.preventDefault();
                this.handleSignInClick();
            }
        });
        
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM' && 
                form.querySelector('input[type="email"]') && 
                form.querySelector('input[type="password"]')) {
                e.preventDefault();
                this.handleSignInClick();
            }
        });
    }
    
    async handleSignInClick() {
        console.log('🖱️ Sign-in triggered');
        
        // Get credentials
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
            this.showMessage('Please enter email and password', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            this.showMessage('Please enter both email and password', 'error');
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
        try {
            console.log(`🔐 Attempting sign in: ${email}`);
            
            // Sign in with Firebase
            const auth = firebase.auth();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ SIGN IN SUCCESS!');
            
            // Save user data to localStorage
            localStorage.setItem('userEmail', userCredential.user.email);
            localStorage.setItem('userName', userCredential.user.displayName || userCredential.user.email);
            localStorage.setItem('userUid', userCredential.user.uid);
            localStorage.setItem('farm-profile', JSON.stringify({
                farmName: 'My Farm',
                ownerName: userCredential.user.displayName || userCredential.user.email,
                email: userCredential.user.email,
                uid: userCredential.user.uid
            }));
            
            this.showMessage('Sign in successful! Loading app...', 'success');
            
            // Method 1: Use app.js showApp() if available
            if (typeof window.app !== 'undefined' && window.app.showApp) {
                console.log('✅ Using app.showApp() method');
                window.app.showApp();
                
                // Switch to dashboard
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
            console.error('❌ Sign in error:', error.code, error.message);
            
            let message = 'Sign in failed: ';
            if (error.code === 'auth/invalid-login-credentials' || 
                error.code === 'auth/wrong-password') {
                message = 'Incorrect email or password.';
            } else if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            } else {
                message += error.message;
            }
            
            this.showMessage(message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    showAppInterface() {
        // Hide auth container, show app container
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer && appContainer) {
            authContainer.style.display = 'none';
            appContainer.classList.remove('hidden');
            appContainer.style.display = 'block';
            
            console.log('✅ App container shown');
            
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
            console.warn('⚠️ Containers not found, reloading page...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    checkExistingAuth() {
        // Check if user is already signed in
        const auth = firebase.auth();
        if (auth.currentUser) {
            console.log('👤 Already signed in:', auth.currentUser.email);
            this.ensureLocalStorageSynced();
        }
    }
    
    ensureLocalStorageSynced() {
        const user = firebase.auth().currentUser;
        if (user) {
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.displayName || user.email);
            localStorage.setItem('userUid', user.uid);
            
            // Only set farm-profile if it doesn't exist
            if (!localStorage.getItem('farm-profile')) {
                localStorage.setItem('farm-profile', JSON.stringify({
                    farmName: 'My Farm',
                    ownerName: user.displayName || user.email,
                    email: user.email,
                    uid: user.uid
                }));
            }
        }
    }
    
    showLoading(show) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent.toLowerCase().includes('sign in') || 
                button.textContent.toLowerCase().includes('login')) {
                if (show) {
                    button.dataset.originalText = button.textContent;
                    button.textContent = 'Signing in...';
                    button.disabled = true;
                } else if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                    button.disabled = false;
                    delete button.dataset.originalText;
                }
            }
        });
    }
    
    showMessage(message, type) {
        console.log(`📢 ${type}: ${message}`);
        
        // Remove existing messages
        const existing = document.querySelector('.auth-message');
        if (existing) existing.remove();
        
        // Create message
        const div = document.createElement('div');
        div.className = `auth-message auth-message-${type}`;
        div.textContent = message;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 4px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(div);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (div.parentNode) {
                div.remove();
            }
        }, 3000);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.signInFix = new SignInFix();
    });
} else {
    window.signInFix = new SignInFix();
}

console.log('✅ Sign-In Fix Loaded');
