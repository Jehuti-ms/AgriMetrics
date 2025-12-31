/**
 * PERMANENT SIGN-IN BUTTON FIX
 * Prevents button disabling issues and ensures reliable sign-in
 */

(function() {
    'use strict';
    
    // Wait for Firebase to be ready
    function waitForFirebase(callback) {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }
    
    // Apply the fix
    function applySignInButtonFix() {
        const form = document.getElementById('signin-form-element');
        const button = form ? form.querySelector('button[type="submit"]') : null;
        
        if (!button) {
            // Try again in a bit if button isn't ready
            setTimeout(applySignInButtonFix, 200);
            return;
        }
        
        console.log('🔧 Applying permanent sign-in button fix');
        
        // Clone button to remove old listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        const signInButton = form.querySelector('button[type="submit"]');
        
        // Disable default form validation
        form.setAttribute('novalidate', '');
        
        // Add click handler
        signInButton.addEventListener('click', handleSignIn, true);
        
        // Override form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            signInButton.click();
        }, true);
    }
    
    // Sign-in handler
    async function handleSignIn(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const button = e.target;
        const form = document.getElementById('signin-form-element');
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        
        if (!emailInput || !passwordInput) {
            alert('Form elements not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        // Save original state
        const originalHTML = button.innerHTML;
        const originalCursor = button.style.cursor;
        const originalOpacity = button.style.opacity;
        
        // Show loading state
        button.innerHTML = `
            <span class="signin-spinner"></span>
            Signing In...
        `;
        button.style.cursor = 'wait';
        button.style.opacity = '0.7';
        button.classList.add('signing-in');
        
        // Add spinner styles if needed
        if (!document.querySelector('#signin-fix-styles')) {
            const styles = document.createElement('style');
            styles.id = 'signin-fix-styles';
            styles.textContent = `
                .signin-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: signin-spin 1s linear infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                
                @keyframes signin-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                button.signing-in {
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                button.signing-in::after {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    border: 2px solid rgba(76, 175, 80, 0.3);
                    border-radius: inherit;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        try {
            // Sign in with Firebase
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Success state
            button.innerHTML = '✓ Success!';
            button.style.background = '#4CAF50';
            button.classList.remove('signing-in');
            
            // Hide auth, show app
            setTimeout(() => {
                const authContainer = document.getElementById('auth-container');
                const appContainer = document.getElementById('app-container');
                
                if (authContainer) authContainer.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
                
                // Initialize app
                if (window.app && typeof window.app.initializeApp === 'function') {
                    window.app.initializeApp();
                }
            }, 1000);
            
        } catch (error) {
            console.error('Sign-in error:', error);
            
            // Restore button
            button.innerHTML = originalHTML;
            button.style.cursor = originalCursor;
            button.style.opacity = originalOpacity;
            button.classList.remove('signing-in');
            
            // Show error
            button.textContent = 'Sign In Failed';
            button.style.background = '#ff4444';
            
            setTimeout(() => {
                button.textContent = 'Sign In';
                button.style.background = '';
            }, 1500);
            
            alert('Sign-in failed: ' + error.message);
        }
    }
    
    // Initialize when everything is ready
    function initializeFix() {
        waitForFirebase(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', applySignInButtonFix);
            } else {
                applySignInButtonFix();
            }
        });
    }
    
    // Start the fix
    initializeFix();
    
    // Export for debugging
    window.signInFix = {
        reapply: applySignInButtonFix,
        version: '1.0.0'
    };
    
})();
