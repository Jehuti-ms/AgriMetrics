// signin-fix.js - FIXED VERSION
console.log('🔧 Sign-in fix loading...');

(function() {
    'use strict';
    
    // Wait for DOM and Firebase
    function init() {
        console.log('🔧 Initializing sign-in handler...');
        
        const form = document.getElementById('signin-form-element');
        if (!form) {
            console.log('❌ Sign-in form not found, retrying...');
            setTimeout(init, 500);
            return;
        }
        
        console.log('✅ Found sign-in form');
        
        // Remove all existing listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add our handler
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚀 Sign-in attempt');
            
            const email = document.getElementById('signin-email')?.value.trim();
            const password = document.getElementById('signin-password')?.value;
            const remember = document.getElementById('remember-me')?.checked || false;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            
            // Show loading - BUT KEEP BUTTON TEXT VISIBLE
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.innerHTML = '<span style="opacity: 0.7;">⟳</span> Signing in...';
            btn.disabled = true;
            
            try {
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                }
                
                console.log('🔐 Attempting Firebase sign-in...');
                await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('✅ Sign-in successful - app will handle redirect');
                
                // Don't do anything else - app.js will handle the UI
                
            } catch (error) {
                console.error('❌ Sign-in error:', error.code);
                
                let message = 'Sign in failed: ';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-login-credentials') {
                    message = 'Invalid email or password';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Please enter a valid email';
                } else if (error.code === 'auth/too-many-requests') {
                    message = 'Too many attempts. Try again later';
                } else if (error.code === 'auth/network-request-failed') {
                    message = 'Network error. Check your connection';
                } else {
                    message += error.message;
                }
                
                alert(message);
                
                // Reset button
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
        
        // Pre-fill remembered email
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            const emailInput = document.getElementById('signin-email');
            const rememberCheck = document.getElementById('remember-me');
            if (emailInput) emailInput.value = remembered;
            if (rememberCheck) rememberCheck.checked = true;
        }
        
        console.log('✅ Sign-in handler ready');
    }
    
    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
