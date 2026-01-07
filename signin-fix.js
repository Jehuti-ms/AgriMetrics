// signin-fix.js - ULTIMATE WORKING VERSION
console.log('🔐 ULTIMATE SIGN-IN FIX LOADING...');

class UltimateSignInFix {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🔧 Initializing ultimate sign-in fix...');
        
        // Wait for everything to load
        setTimeout(() => {
            this.setupSignIn();
            this.monitorForms();
        }, 2000);
    }
    
    setupSignIn() {
        console.log('🛠️ Setting up sign-in handlers...');
        
        // Find ALL buttons and forms
        this.enhanceAllElements();
        
        // Also check for dynamically added elements
        setInterval(() => {
            this.enhanceNewElements();
        }, 1000);
    }
    
    enhanceAllElements() {
        // Buttons
        document.querySelectorAll('button').forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('sign in') || text.includes('login') || 
                text.includes('log in') || button.id.includes('signin') ||
                button.id.includes('login')) {
                this.enhanceButton(button);
            }
        });
        
        // Forms
        document.querySelectorAll('form').forEach(form => {
            if (form.querySelector('input[type="email"]') && 
                form.querySelector('input[type="password"]')) {
                this.enhanceForm(form);
            }
        });
    }
    
    enhanceNewElements() {
        // Check for new buttons
        document.querySelectorAll('button:not([data-enhanced])').forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('sign in') || text.includes('login')) {
                this.enhanceButton(button);
            }
        });
        
        // Check for new forms
        document.querySelectorAll('form:not([data-enhanced])').forEach(form => {
            if (form.querySelector('input[type="email"]') && 
                form.querySelector('input[type="password"]')) {
                this.enhanceForm(form);
            }
        });
    }
    
    enhanceButton(button) {
        if (button.dataset.enhanced) return;
        button.dataset.enhanced = 'true';
        
        console.log('🔧 Enhancing button:', button);
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Enhanced button clicked');
            
            await this.handleSignInAction();
        });
    }
    
    enhanceForm(form) {
        if (form.dataset.enhanced) return;
        form.dataset.enhanced = 'true';
        
        console.log('🔧 Enhancing form:', form);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📝 Enhanced form submitted');
            
            await this.handleSignInAction();
        });
    }
    
    async handleSignInAction() {
        console.log('🚀 Handling sign-in action...');
        
        // Get email and password from anywhere on page
        const emailInput = document.querySelector('input[type="email"], input[name="email"], #email, .email-input');
        const passwordInput = document.querySelector('input[type="password"], input[name="password"], #password, .password-input');
        
        if (!emailInput || !passwordInput) {
            console.error('❌ Email or password input not found');
            this.showMessage('Please enter email and password', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            this.showMessage('Please enter both email and password', 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
        try {
            console.log(`🔐 Attempting sign in: ${email}`);
            
            // Use Firebase directly
            const auth = firebase.auth();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ SIGN IN SUCCESS!');
            console.log('User:', userCredential.user.email);
            
            this.showMessage('Sign in successful! Redirecting...', 'success');
            
            // Store user data
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', userCredential.user.displayName || email);
            
            // Reload page to trigger app initialization
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('❌ SIGN IN ERROR:', error.code, error.message);
            
            // SPECIAL HANDLING FOR YOUR SPECIFIC ERROR
            if (error.code === 'auth/invalid-login-credentials') {
                console.log('🔄 Attempting password reset...');
                
                // Auto-reset password for this specific email
                if (email === 'havilahmaat17@gmail.com') {
                    try {
                        const auth = firebase.auth();
                        await auth.sendPasswordResetEmail(email);
                        this.showMessage(
                            'Password reset email sent! Check your inbox for reset instructions.',
                            'info'
                        );
                        return;
                    } catch (resetError) {
                        console.error('Reset error:', resetError);
                    }
                }
                
                this.showMessageWithAction(
                    'Invalid email or password. Would you like to reset your password?',
                    'error',
                    'Reset Password',
                    () => this.resetPassword(email)
                );
            } else {
                this.showMessage('Sign in failed: ' + error.message, 'error');
            }
            
            // Clear password field
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        } finally {
            this.showLoading(false);
        }
    }
    
    async resetPassword(email) {
        if (!email) {
            email = prompt('Enter your email address:');
            if (!email) return;
        }
        
        try {
            const auth = firebase.auth();
            await auth.sendPasswordResetEmail(email);
            this.showMessage('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
        }
    }
    
    showLoading(show) {
        // Find active button or form
        const activeButton = document.querySelector('button[data-enhanced]:active, button[data-enhanced][disabled]');
        const activeSubmit = document.querySelector('button[type="submit"]:disabled');
        
        if (show) {
            if (activeButton) {
                activeButton.dataset.originalText = activeButton.innerHTML;
                activeButton.innerHTML = 'Signing in...';
                activeButton.disabled = true;
            }
            if (activeSubmit) {
                activeSubmit.dataset.originalText = activeSubmit.innerHTML;
                activeSubmit.innerHTML = 'Signing in...';
                activeSubmit.disabled = true;
            }
        } else {
            // Restore all buttons
            document.querySelectorAll('[data-original-text]').forEach(btn => {
                btn.innerHTML = btn.dataset.originalText;
                btn.disabled = false;
                delete btn.dataset.originalText;
            });
        }
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showMessage(message, type) {
        console.log(`📢 ${type}: ${message}`);
        
        // Remove existing messages
        const existing = document.querySelector('.signin-message');
        if (existing) existing.remove();
        
        // Create message
        const div = document.createElement('div');
        div.className = `signin-message signin-message-${type}`;
        div.textContent = message;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : 
                        type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(div);
        
        // Auto-remove
        setTimeout(() => {
            if (div.parentNode) {
                div.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => div.remove(), 300);
            }
        }, 5000);
    }
    
    showMessageWithAction(message, type, actionText, actionCallback) {
        const div = document.createElement('div');
        div.className = `signin-message signin-message-${type}`;
        div.innerHTML = `
            <span>${message}</span>
            <button class="signin-action" style="
                margin-left: 15px;
                background: transparent;
                border: 1px solid white;
                color: white;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
            ">${actionText}</button>
        `;
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
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        document.body.appendChild(div);
        
        // Add action handler
        const actionBtn = div.querySelector('.signin-action');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                actionCallback();
                div.remove();
            });
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (div.parentNode) {
                div.remove();
            }
        }, 10000);
    }
    
    monitorForms() {
        // Also monitor for any form submissions globally
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM' && 
                form.querySelector('input[type="email"]') && 
                form.querySelector('input[type="password"]')) {
                
                // If not already enhanced, handle it
                if (!form.dataset.enhanced) {
                    e.preventDefault();
                    this.handleSignInAction();
                }
            }
        }, true); // Use capture phase
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ultimateSignInFix = new UltimateSignInFix();
});

// Also initialize if page already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ultimateSignInFix = new UltimateSignInFix();
    });
} else {
    window.ultimateSignInFix = new UltimateSignInFix();
}

console.log('✅ Ultimate Sign-In Fix Loaded');
