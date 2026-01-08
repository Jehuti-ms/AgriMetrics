// signin-fix.js - COMPLETE WORKING VERSION
console.log('🔐 Sign-in Fix Loading...');

class SignInFix {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🔧 Setting up sign-in handlers...');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for all clicks
        document.addEventListener('click', (e) => {
            this.handleSignInClick(e);
        });
        
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });
    }
    
    handleSignInClick(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        const buttonText = button.textContent.toLowerCase();
        if (buttonText.includes('sign in') || buttonText.includes('login')) {
            e.preventDefault();
            e.stopPropagation();
            this.performSignIn();
        }
    }
    
    handleFormSubmit(e) {
        const form = e.target;
        if (form.tagName === 'FORM' && 
            form.querySelector('input[type="email"]') && 
            form.querySelector('input[type="password"]')) {
            e.preventDefault();
            e.stopPropagation();
            this.performSignIn();
        }
    }
    
    async performSignIn() {
        console.log('🚀 Starting sign-in process...');
        
        // Get credentials
        const emailInput = document.querySelector('input[type="email"], #signin-email');
        const passwordInput = document.querySelector('input[type="password"], #signin-password');
        
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
        
        // Show loading on all sign-in buttons
        this.showLoading(true);
        
        try {
            console.log(`🔐 Attempting sign in: ${email}`);
            
            // Sign in with Firebase
            const auth = firebase.auth();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ SIGN IN SUCCESS!');
            console.log('User:', userCredential.user.email);
            
            // Save to localStorage
            localStorage.setItem('userEmail', userCredential.user.email);
            localStorage.setItem('userName', userCredential.user.displayName || userCredential.user.email);
            localStorage.setItem('userUid', userCredential.user.uid);
            
            // CRITICAL: Force app to show
            this.triggerAppShow();
            
            this.showMessage('Sign in successful! Loading app...', 'success');
            
        } catch (error) {
            console.error('❌ Sign in error:', error.code, error.message);
            this.handleSignInError(error, email);
        } finally {
            this.showLoading(false);
        }
    }
    
    triggerAppShow() {
        console.log('🚀 Triggering app show...');
        
        // Method 1: Directly call app.showApp()
        if (window.app && typeof window.app.showApp === 'function') {
            console.log('✅ Calling app.showApp() directly');
            window.app.showApp();
            return;
        }
        
        // Method 2: Reload page (fallback)
        console.log('🔄 App not available, reloading page...');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    handleSignInError(error, email) {
        let message = 'Sign in failed: ';
        
        switch(error.code) {
            case 'auth/invalid-login-credentials':
            case 'auth/wrong-password':
                message = 'Incorrect email or password.';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later.';
                break;
            default:
                message += error.message;
        }
        
        this.showMessage(message, 'error');
        
        // Clear password field
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    
    showLoading(show) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('sign in') || text.includes('login')) {
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
        `;
        
        document.body.appendChild(div);
        
        // Auto-remove
        setTimeout(() => div.remove(), 3000);
    }
}

// Initialize
window.signInFix = new SignInFix();
console.log('✅ Sign-in Fix Loaded');
