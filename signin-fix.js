// signin-fix.js
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
        document.addEventListener('click', (e) => this.handleSignInClick(e));
        document.addEventListener('submit', (e) => this.handleFormSubmit(e));
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
        const emailInput = document.querySelector('input[type="email"], #signin-email');
        const passwordInput = document.querySelector('input[type="password"], #signin-password');

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        this.showLoading(true);

        try {
            const auth = firebase.auth();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            console.log('✅ SIGN IN SUCCESS!');
            localStorage.setItem('userEmail', userCredential.user.email);

            this.triggerAppShow();

            setTimeout(() => {
                if (window.app && typeof window.app.showApp === 'function') {
                    console.log('✅ Showing app after sign-in');
                    window.app.showApp();
                }
            }, 1500);

            this.showMessage('Sign in successful! Loading app...', 'success');
        } catch (error) {
            console.error('❌ Sign in error:', error.code, error.message);
        } finally {
            this.showLoading(false);
        }
    }

    triggerAppShow() {
        console.log('🚀 Triggering app show...');
        if (window.app && typeof window.app.showApp === 'function') {
            console.log('✅ Calling app.showApp() directly');
            window.app.showApp();
        } else {
            console.log('🔄 App not available, reloading page...');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
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

        const existing = document.querySelector('.auth-message');
        if (existing) existing.remove();

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

        setTimeout(() => div.remove(), 3000);
    }
}

window.signInFix = new SignInFix();
console.log('✅ Sign-in Fix Loaded');
