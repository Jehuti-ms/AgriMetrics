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

    // Add this to signin-fix.js or your auth initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Ensure we only run this once
    if (window.signinFixApplied) return;
    window.signinFixApplied = true;
    
    console.log('🔐 Enhanced Sign-in Fix Loading...');
    
    // Wait for DOM to be fully loaded
    setTimeout(function() {
        setupEnhancedSignIn();
    }, 1000);
    
    function setupEnhancedSignIn() {
        // Find all sign-in forms on the page
        const signinForms = document.querySelectorAll('[id*="signin"], [class*="signin"], form');
        
        signinForms.forEach(form => {
            enhanceSignInForm(form);
        });
        
        // Also check for standalone buttons
        const signinButtons = document.querySelectorAll('button[id*="signin"], button[class*="signin"]');
        signinButtons.forEach(button => {
            if (!button.closest('form')) {
                enhanceSignInButton(button);
            }
        });
        
        console.log('✅ Enhanced Sign-in Fix Applied');
    }
    
    function enhanceSignInForm(form) {
        if (!form) return;
        
        // Add submit event listener
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : 'Sign In';
            
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Signing in...';
                submitButton.style.opacity = '0.7';
            }
            
            try {
                // Get email and password
                const emailInput = form.querySelector('input[type="email"], input[name="email"]');
                const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
                
                if (!emailInput || !passwordInput) {
                    throw new Error('Email and password fields not found');
                }
                
                const email = emailInput.value.trim();
                const password = passwordInput.value;
                
                // Validate inputs
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                if (!isValidEmail(email)) {
                    throw new Error('Please enter a valid email address');
                }
                
                // Check if Firebase auth is available
                if (!window.firebase || !window.firebase.auth) {
                    throw new Error('Authentication service is not available. Please refresh the page.');
                }
                
                console.log('🔐 Attempting sign in for:', email);
                
                // Sign in with Firebase
                const auth = window.firebase.auth();
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                console.log('✅ Sign in successful:', userCredential.user.email);
                
                // Clear any error messages
                clearErrorMessages(form);
                
                // Show success message
                showMessage(form, 'Sign in successful! Redirecting...', 'success');
                
                // The auth state change listener in app.js will handle the redirect
                
            } catch (error) {
                console.error('❌ Sign-in error:', error);
                
                // Clear any previous error messages
                clearErrorMessages(form);
                
                // Show user-friendly error message
                let errorMessage = 'Sign in failed. ';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage += 'Invalid email address format.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage += 'This account has been disabled.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-login-credentials':
                        errorMessage += 'Invalid email or password. Please try again.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage += 'Too many failed attempts. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage += 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage += error.message || 'Please check your credentials.';
                }
                
                showMessage(form, errorMessage, 'error');
                
                // Focus on the first input field
                const firstInput = form.querySelector('input');
                if (firstInput) firstInput.focus();
                
            } finally {
                // Restore button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    submitButton.style.opacity = '1';
                }
            }
        });
        
        // Add real-time validation
        const emailInput = form.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
        
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                validateEmailField(this);
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                validatePasswordField(this);
            });
        }
        
        // Add password visibility toggle
        const passwordContainer = passwordInput ? passwordInput.closest('.input-container') : null;
        if (passwordContainer && !passwordContainer.querySelector('.toggle-password')) {
            const toggle = document.createElement('span');
            toggle.className = 'toggle-password';
            toggle.textContent = '👁️';
            toggle.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                user-select: none;
                font-size: 16px;
            `;
            
            passwordContainer.style.position = 'relative';
            passwordContainer.appendChild(toggle);
            
            toggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
            });
        }
    }
    
    function enhanceSignInButton(button) {
        if (!button || button.dataset.enhanced) return;
        button.dataset.enhanced = 'true';
        
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Signing in...';
            button.style.opacity = '0.7';
            
            try {
                // Find the closest form or look for inputs
                const form = button.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    // Look for email/password inputs on the page
                    const emailInput = document.querySelector('input[type="email"], input[name="email"]');
                    const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
                    
                    if (emailInput && passwordInput) {
                        const email = emailInput.value.trim();
                        const password = passwordInput.value;
                        
                        if (!email || !password) {
                            throw new Error('Please enter both email and password');
                        }
                        
                        const auth = window.firebase.auth();
                        await auth.signInWithEmailAndPassword(email, password);
                    } else {
                        throw new Error('Please enter your credentials');
                    }
                }
            } catch (error) {
                console.error('Sign-in error:', error);
                showGlobalMessage(error.message || 'Sign in failed', 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
                button.style.opacity = '1';
            }
        });
    }
    
    function validateEmailField(input) {
        const value = input.value.trim();
        if (value && !isValidEmail(value)) {
            showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        clearFieldError(input);
        return true;
    }
    
    function validatePasswordField(input) {
        const value = input.value;
        if (value && value.length < 6) {
            showFieldError(input, 'Password must be at least 6 characters');
            return false;
        }
        clearFieldError(input);
        return true;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showFieldError(input, message) {
        clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
            padding: 4px 8px;
            background: #f8d7da;
            border-radius: 4px;
            border-left: 3px solid #dc3545;
        `;
        
        input.style.borderColor = '#dc3545';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    
    function clearFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }
    
    function clearErrorMessages(form) {
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
    }
    
    function showMessage(form, message, type) {
        clearErrorMessages(form);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 12px;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
            ${type === 'error' ? 
                'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : 
                'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
            }
        `;
        
        form.prepend(messageDiv);
        
        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 3000);
        }
    }
    
    function showGlobalMessage(message, type) {
        // Remove existing global messages
        const existing = document.getElementById('global-message');
        if (existing) existing.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'global-message';
        messageDiv.className = `global-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ${type === 'error' ? 
                'background: #dc3545; color: white;' : 
                'background: #28a745; color: white;'
            }
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }
    
    // Test Firebase availability
    function testFirebaseAuth() {
        if (!window.firebase || !window.firebase.auth) {
            console.error('❌ Firebase Auth not available');
            showGlobalMessage('Authentication service is not ready. Please refresh the page.', 'error');
            return false;
        }
        return true;
    }
    
    // Initialize test
    setTimeout(testFirebaseAuth, 2000);
});
    
})();
