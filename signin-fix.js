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

            this.hideAuthUI();

            setTimeout(() => {
                if (window.app && typeof window.app.showApp === 'function') {
                    console.log('✅ Showing app after sign-in');
                    window.app.showApp();
                }
            }, 1500);

            this.showMessage('Sign in successful! Loading app
