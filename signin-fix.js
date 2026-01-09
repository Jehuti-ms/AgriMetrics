/**
 * Ultra-simple sign-in button fix
 * FIXES: Firebase login loop issue
 * CSP COMPLIANT: No inline event handlers
 */

(function() {
    'use strict';
    
    function fixSignInButton() {
        const button = document.querySelector('#signin-form-element button[type="submit"]');
        if (!button) {
            setTimeout(fixSignInButton, 100);
            return;
        }
        
        // Clone and replace button to remove any conflicting event listeners
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        
        const signInBtn = document.querySelector('#signin-form-element button[type="submit"]');
        const originalText = signInBtn.textContent;
        
        // Add proper event listener (CSP compliant)
        signInBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            
            this.textContent = 'Signing In...';
            this.disabled = true;
            
            try {
                // Direct Firebase auth - bypasses any problematic auth module code
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                this.textContent = 'Success!';
                
                // CRITICAL: Force UI update and prevent login loop
                setTimeout(() => {
                    // Hide auth container
                    const authContainer = document.getElementById('auth-container');
                    if (authContainer) {
                        authContainer.classList.add('hidden');
                    }
                    
                    // Show app container
                    const appContainer = document.getElementById('app-container');
                    if (appContainer) {
                        appContainer.classList.remove('hidden');
                    }
                    
                    // Store auth state in localStorage to prevent loop
                    localStorage.setItem('userAuthenticated', 'true');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userId', user.uid);
                    
                    // Initialize app if function exists
                    if (window.app && typeof window.app.initializeApp === 'function') {
                        window.app.initializeApp(user);
                    }
                    
                    // Dispatch custom event for other modules
                    const event = new CustomEvent('user-signed-in', {
                        detail: {
                            email: user.email,
                            uid: user.uid,
                            timestamp: new Date().toISOString()
                        }
                    });
                    document.dispatchEvent(event);
                    
                    console.log('Sign-in successful via fix script');
                    
                }, 800);
                
            } catch (error) {
                this.textContent = originalText;
                this.disabled = false;
                
                // Show error to user
                if (error.code === 'auth/user-not-found' || 
                    error.code === 'auth/wrong-password') {
                    alert('Invalid email or password');
                } else {
                    alert('Error: ' + error.message);
                }
                console.error('Sign-in error:', error);
            }
        });
        
        console.log('Sign-in button fix applied (CSP compliant)');
    }
    
    // Fix for login loop on page load
    function checkExistingAuth() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(checkExistingAuth, 100);
            return;
        }
        
        // Check if user is already signed in
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('User already authenticated on page load:', user.email);
                
                // Prevent login loop by immediately hiding auth UI
                setTimeout(() => {
                    const authContainer = document.getElementById('auth-container');
                    const appContainer = document.getElementById('app-container');
                    
                    if (authContainer && appContainer) {
                        authContainer.classList.add('hidden');
                        appContainer.classList.remove('hidden');
                        
                        // Initialize app
                        if (window.app && typeof window.app.initializeApp === 'function') {
                            window.app.initializeApp(user);
                        }
                    }
                }, 300);
            }
        });
    }
    
    // Wait for Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                fixSignInButton();
                checkExistingAuth();
            });
        } else {
            fixSignInButton();
            checkExistingAuth();
        }
    } else {
        // Wait for Firebase to load
        const waitForFirebase = setInterval(function() {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                clearInterval(waitForFirebase);
                fixSignInButton();
                checkExistingAuth();
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(waitForFirebase);
        }, 10000);
    }
    
})();
