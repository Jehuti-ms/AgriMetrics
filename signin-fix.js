// signin-fix.js
console.log('Sign-in Fix Loading...');

(function () {
    'use strict';

    function SignInFix() {
        this.init();
    }

    SignInFix.prototype.init = function () {
        console.log('Setting up sign-in handlers...');
        this.setupEventListeners();
    };

    SignInFix.prototype.setupEventListeners = function () {
        var self = this;
        document.addEventListener('click', function (e) { self.handleSignInClick(e); });
        document.addEventListener('submit', function (e) { self.handleFormSubmit(e); });
    };

    SignInFix.prototype.handleSignInClick = function (e) {
        var button = e.target.closest && e.target.closest('button');
        if (!button) return;
        var text = (button.textContent || '').toLowerCase();
        if (text.indexOf('sign in') !== -1 || text.indexOf('login') !== -1) {
            e.preventDefault();
            e.stopPropagation();
            this.performSignIn();
        }
    };

    SignInFix.prototype.handleFormSubmit = function (e) {
        var form = e.target;
        if (
            form.tagName === 'FORM' &&
            form.querySelector('input[type="email"]') &&
            form.querySelector('input[type="password"]')
        ) {
            e.preventDefault();
            e.stopPropagation();
            this.performSignIn();
        }
    };

    SignInFix.prototype.performSignIn = async function () {
        console.log('Starting sign-in process...');
        var emailInput = document.querySelector('input[type="email"], #signin-email');
        var passwordInput = document.querySelector('input[type="password"], #signin-password');

        if (!emailInput || !passwordInput) return;

        var email = (emailInput.value || '').trim();
        var password = passwordInput.value || '';

        this.showLoading(true);

        try {
            var auth = firebase.auth();
            var userCredential = await auth.signInWithEmailAndPassword(email, password);

            console.log('SIGN IN SUCCESS!');
            if (userCredential && userCredential.user && userCredential.user.email) {
                localStorage.setItem('userEmail', userCredential.user.email);
            }

            this.hideAuthUI();

            setTimeout(function () {
                if (window.app && typeof window.app.showApp === 'function') {
                    console.log('Showing app after sign-in');
                    window.app.showApp();
                }
            }, 1500);

            this.showMessage('Sign in successful! Loading app...', 'success');
        } catch (error) {
            console.error('Sign in error:', error && error.code, error && error.message);
            this.showMessage('Error: ' + (error && error.message ? error.message : 'Unknown error'), 'error');
        } finally {
            this.showLoading(false);
        }
    };

    SignInFix.prototype.hideAuthUI = function () {
        var authForms = document.querySelector('.auth-forms');
        if (authForms) authForms.style.display = 'none';
    };

    SignInFix.prototype.showLoading = function (show) {
        var buttons = document.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            var text = (button.textContent || '').toLowerCase();
            var isAuthButton = text.indexOf('sign in') !== -1 || text.indexOf('login') !== -1;
            if (!isAuthButton) continue;

            if (show) {
                button.dataset.originalText = button.textContent || '';
                button.textContent = 'Signing in...';
                button.disabled = true;
            } else {
                if (button.dataset && button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                    button.disabled = false;
                    delete button.dataset.originalText;
                }
            }
        }
    };

    SignInFix.prototype.showMessage = function (message, type) {
        try {
            var existing = document.querySelector('.auth-message');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

            var div = document.createElement('div');
            div.className = 'auth-message auth-message-' + type;
            div.textContent = message;
            var bg = type === 'success' ? '#4CAF50' : '#f44336';
            div.style.position = 'fixed';
            div.style.top = '20px';
            div.style.right = '20px';
            div.style.padding = '15px 20px';
            div.style.background = bg;
            div.style.color = 'white';
            div.style.borderRadius = '4px';
            div.style.zIndex = '99999';
            div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

            document.body.appendChild(div);

            setTimeout(function () {
                if (div && div.parentNode) div.parentNode.removeChild(div);
            }, 3000);
        } catch (e) {
            // Fallback
            alert(message);
        }
    };

    window.signInFix = new SignInFix();
    console.log('Sign-in Fix Loaded');
})();
