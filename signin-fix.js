// signin-fix.js - SIMPLIFIED FINAL VERSION
console.log('🔧 SIGNIN FIX LOADED');

(function() {
    'use strict';
    
    // Wait for DOM and Firebase
    function initSignIn() {
        console.log('🔧 Initializing sign-in fix...');
        
        const form = document.getElementById('signin-form-element');
        if (!form) {
            console.log('❌ Sign-in form not found, retrying in 500ms');
            setTimeout(initSignIn, 500);
            return;
        }
        
        console.log('✅ Found sign-in form, attaching handler');
        
        // Remove ALL existing event listeners by cloning
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add our single handler
        newForm.addEventListener('submit', handleSignIn);
        
        // Pre-fill remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            const emailInput = document.getElementById('signin-email');
            const rememberCheck = document.getElementById('remember-me');
            if (emailInput) emailInput.value = rememberedEmail;
            if (rememberCheck) rememberCheck.checked = true;
        }
        
        console.log('✅ Sign-in handler attached successfully');
    }
    
    // Single sign-in handler
    async function handleSignIn(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🚀 Sign-in attempt started');
        
        const email = document.getElementById('signin-email')?.value.trim();
        const password = document.getElementById('signin-password')?.value;
        const remember = document.getElementById('remember-me')?.checked || false;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        try {
            // Save remember me preference
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberMe');
            }
            
            // Check Firebase
            if (!window.firebase || !firebase.auth) {
                throw new Error('Firebase not initialized');
            }
            
            console.log('🔐 Attempting sign-in for:', email);
            
            // Attempt sign in
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            console.log('✅ Sign-in successful:', userCredential.user.email);
            
            // DON'T do anything else - let app.js handle the redirect
            // The page will automatically redirect based on auth state listener
            
        } catch (error) {
            console.error('❌ Sign-in error:', error.code, error.message);
            
            // User-friendly error messages
            let errorMessage = 'Sign in failed: ';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-login-credentials':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            alert(errorMessage);
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSignIn);
    } else {
        initSignIn();
    }
})();
