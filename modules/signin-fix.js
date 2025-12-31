/**
 * Ultra-simple sign-in button fix
 */

(function() {
    'use strict';
    
    function fixSignInButton() {
        const button = document.querySelector('#signin-form-element button[type="submit"]');
        if (!button) {
            setTimeout(fixSignInButton, 100);
            return;
        }
        
        // Replace button to remove old listeners
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        
        const signInBtn = document.querySelector('#signin-form-element button[type="submit"]');
        const originalText = signInBtn.textContent;
        
        // Simple click handler
        signInBtn.onclick = async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            
            this.textContent = 'Signing In...';
            
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                this.textContent = 'Success!';
                
                setTimeout(() => {
                    document.getElementById('auth-container').classList.add('hidden');
                    document.getElementById('app-container').classList.remove('hidden');
                    if (window.app && window.app.initializeApp) {
                        window.app.initializeApp();
                    }
                }, 800);
                
            } catch (error) {
                this.textContent = originalText;
                alert('Error: ' + error.message);
            }
        };
        
        // Reset on logout
        firebase.auth().onAuthStateChanged(function(user) {
            if (!user) {
                signInBtn.textContent = originalText;
            }
        });
    }
    
    // Wait for Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixSignInButton);
        } else {
            fixSignInButton();
        }
    }
    
})();
