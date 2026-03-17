// signin-fix.js - ULTIMATE FIX
console.log('🔧 SIGNIN FIX LOADED');

(function() {
    'use strict';
    
    // Wait for DOM and Firebase
    function waitForFirebase() {
        return new Promise(resolve => {
            // Check if Firebase is ready
            if (window.firebase && firebase.auth) {
                console.log('✅ Firebase already available');
                resolve();
                return;
            }
            
            // Wait for firebase-config to load
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.firebase && firebase.auth) {
                    clearInterval(checkInterval);
                    console.log('✅ Firebase now available');
                    resolve();
                } else if (attempts > 50) { // 5 second timeout
                    clearInterval(checkInterval);
                    console.error('❌ Firebase failed to load');
                    resolve(); // Still resolve to attempt sign-in anyway
                }
            }, 100);
        });
    }
    
    // Setup sign-in handler
    async function setupSignInHandler() {
        await waitForFirebase();
        
        const form = document.getElementById('signin-form-element');
        if (!form) {
            console.error('❌ Sign-in form not found');
            return;
        }
        
        console.log('✅ Setting up sign-in handler');
        
        // Remove all existing listeners (clone and replace)
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add our handler
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚀 Sign-in submitted');
            
            const email = document.getElementById('signin-email')?.value.trim();
            const password = document.getElementById('signin-password')?.value;
            const remember = document.getElementById('remember-me')?.checked || false;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
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
                
                // Check if Firebase auth is available
                if (!firebase || !firebase.auth) {
                    throw new Error('Firebase auth not available');
                }
                
                console.log('🔐 Attempting sign-in for:', email);
                
                // Attempt sign in
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                
                console.log('✅ Sign-in successful:', userCredential.user.email);
                
                // Let main app handle the rest
                // Don't do anything else - app.js should handle the redirect
                
            } catch (error) {
                console.error('❌ Sign-in error:', error.code, error.message);
                
                // User-friendly error messages
                let errorMessage = 'Sign in failed: ';
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage += 'No account found with this email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage += 'Incorrect password';
                        break;
                    case 'auth/invalid-email':
                        errorMessage += 'Invalid email address';
                        break;
                    case 'auth/user-disabled':
                        errorMessage += 'This account has been disabled';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage += 'Too many failed attempts. Try again later';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage += 'Network error. Check your connection';
                        break;
                    default:
                        errorMessage += error.message;
                }
                
                alert(errorMessage);
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Pre-fill remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            const emailInput = document.getElementById('signin-email');
            const rememberCheck = document.getElementById('remember-me');
            if (emailInput) emailInput.value = rememberedEmail;
            if (rememberCheck) rememberCheck.checked = true;
        }
        
        console.log('✅ Sign-in handler ready');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSignInHandler);
    } else {
        setupSignInHandler();
    }
    
    // Also run on window load as backup
    window.addEventListener('load', setupSignInHandler);
})();
