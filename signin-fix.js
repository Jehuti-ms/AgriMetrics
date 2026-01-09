[file name]: signin-fix.js
[file content begin]
/**
 * Simple sign-in fix - Minimal version
 * Only handles basic sign-in, sign-up is handled by auth.js
 */
(function() {
    'use strict';
    
    console.log('🔧 Loading sign-in fix...');
    
    function initialize() {
        // Only set up sign-in button if it exists
        const signinBtn = document.querySelector('#signin-form-element button[type="submit"]');
        
        if (signinBtn && !signinBtn.dataset.fixed) {
            console.log('✅ Setting up sign-in button fix');
            signinBtn.dataset.fixed = 'true';
            
            const form = document.getElementById('signin-form-element');
            const originalSubmit = form.onsubmit;
            
            form.onsubmit = async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('signin-email')?.value;
                const password = document.getElementById('signin-password')?.value;
                
                if (!email || !password) {
                    alert('Please enter email and password');
                    return;
                }
                
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Signing In...';
                btn.disabled = true;
                
                try {
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                    console.log('✅ Sign-in successful via fix script');
                } catch (error) {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    
                    if (error.code === 'auth/user-not-found' || 
                        error.code === 'auth/wrong-password') {
                        alert('Invalid email or password');
                    } else {
                        alert('Error: ' + error.message);
                    }
                    console.error('Sign-in error:', error);
                }
            };
        }
        
        // Check for existing auth
        checkExistingAuth();
    }
    
    function checkExistingAuth() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(checkExistingAuth, 100);
            return;
        }
        
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('✅ User already authenticated on page load:', user.email);
                
                // Hide auth UI if visible
                const authContainer = document.getElementById('auth-container');
                if (authContainer && authContainer.style.display !== 'none') {
                    authContainer.style.display = 'none';
                }
                
                // Show app container if it exists
                const appContainer = document.getElementById('app-container');
                if (appContainer && appContainer.classList.contains('hidden')) {
                    appContainer.classList.remove('hidden');
                    appContainer.style.display = 'block';
                }
            }
        });
    }
    
    // Initialize when Firebase is ready
    if (typeof firebase !== 'undefined' && firebase.auth) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    } else {
        const waitForFirebase = setInterval(function() {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                clearInterval(waitForFirebase);
                initialize();
            }
        }, 100);
        
        setTimeout(() => clearInterval(waitForFirebase), 5000);
    }
})();
[file content end]
