// signin-fix.js - UPDATED VERSION
console.log('🔐 SIGN-IN FIX LOADING...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Setting up sign-in handlers...');
    
    // Wait for Firebase to be fully ready
    const checkFirebase = setInterval(() => {
        if (window.firebase && window.firebase.auth) {
            clearInterval(checkFirebase);
            setupSignIn();
        }
    }, 100);
    
    function setupSignIn() {
        console.log('✅ Firebase Auth is ready, setting up sign-in...');
        
        // Find sign-in button
        const signInButton = document.getElementById('signInButton') || 
                            document.querySelector('button[onclick*="signIn"]') ||
                            document.querySelector('button[onclick*="login"]');
        
        if (signInButton) {
            console.log('Found sign-in button:', signInButton);
            enhanceSignInButton(signInButton);
        } else {
            console.warn('No sign-in button found, checking forms...');
            // Look for forms
            document.querySelectorAll('form').forEach(form => {
                if (form.querySelector('input[type="email"]') && form.querySelector('input[type="password"]')) {
                    console.log('Found auth form:', form);
                    enhanceSignInForm(form);
                }
            });
        }
        
        // Also check for any button with text containing "sign in" or "login"
        setTimeout(() => {
            document.querySelectorAll('button').forEach(button => {
                const text = button.textContent.toLowerCase();
                if ((text.includes('sign in') || text.includes('login')) && !button.dataset.enhanced) {
                    console.log('Found auth button by text:', button);
                    enhanceSignInButton(button);
                }
            });
        }, 1000);
    }
    
    function enhanceSignInForm(form) {
        if (form.dataset.enhanced) return;
        form.dataset.enhanced = 'true';
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Form submission intercepted');
            
            // Get credentials
            const emailInput = form.querySelector('input[type="email"], input[name="email"]');
            const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
            
            if (!emailInput || !passwordInput) {
                console.error('Email or password input not found');
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            // Set loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : 'Sign In';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Signing in...';
            }
            
            try {
                console.log('🔐 Attempting sign in for:', email);
                
                // Sign in with Firebase
                const auth = window.firebase.auth();
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                console.log('✅ Sign in successful!');
                console.log('User:', userCredential.user.email);
                
                // Show success message
                showMessage('Sign in successful! Redirecting...', 'success');
                
            } catch (error) {
                console.error('❌ Sign-in error:', error.code, error.message);
                
                // User-friendly error messages
                let message = 'Sign in failed. ';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        message = 'Invalid email address.';
                        break;
                    case 'auth/user-disabled':
                        message = 'Account disabled. Contact support.';
                        break;
                    case 'auth/user-not-found':
                        message = 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                    case 'auth/invalid-login-credentials':
                        message = 'Incorrect email or password.';
                        break;
                    case 'auth/too-many-requests':
                        message = 'Too many attempts. Try again later.';
                        break;
                    default:
                        message = error.message || 'Authentication failed.';
                }
                
                showMessage(message, 'error');
                
                // Clear password field
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
                
            } finally {
                // Restore button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            }
        });
    }
    
    function enhanceSignInButton(button) {
        if (button.dataset.enhanced) return;
        button.dataset.enhanced = 'true';
        
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('🖱️ Sign-in button clicked');
            
            // Find email and password inputs
            const emailInput = document.querySelector('input[type="email"], input[name="email"]');
            const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
            
            if (!emailInput || !passwordInput) {
                console.error('Email or password input not found');
                showMessage('Please enter email and password', 'error');
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) {
                showMessage('Please enter both email and password', 'error');
                return;
            }
            
            // Set loading state
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Signing in...';
            
            try {
                console.log('🔐 Attempting sign in for:', email);
                
                // Sign in with Firebase
                const auth = window.firebase.auth();
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                console.log('✅ Sign in successful!');
                console.log('User:', userCredential.user.email);
                
                showMessage('Sign in successful! Redirecting...', 'success');
                
            } catch (error) {
                console.error('❌ Sign-in error:', error.code, error.message);
                
                // User-friendly error messages
                let message = 'Sign in failed. ';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        message = 'Invalid email address.';
                        break;
                    case 'auth/user-disabled':
                        message = 'Account disabled. Contact support.';
                        break;
                    case 'auth/user-not-found':
                        message = 'No account found with this email.';
                        // Offer to create account
                        if (confirm('No account found. Would you like to create one?')) {
                            try {
                                const auth = window.firebase.auth();
                                const newUser = await auth.createUserWithEmailAndPassword(email, password);
                                console.log('✅ Account created:', newUser.user.email);
                                showMessage('Account created! Signing you in...', 'success');
                                return;
                            } catch (createError) {
                                message = 'Failed to create account: ' + createError.message;
                            }
                        }
                        break;
                    case 'auth/wrong-password':
                    case 'auth/invalid-login-credentials':
                        message = 'Incorrect email or password.';
                        break;
                    case 'auth/too-many-requests':
                        message = 'Too many attempts. Try again later.';
                        break;
                    default:
                        message = error.message || 'Authentication failed.';
                }
                
                showMessage(message, 'error');
                
                // Clear password field
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
                
            } finally {
                // Restore button
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
    
    function showMessage(text, type) {
        // Remove existing messages
        const existing = document.querySelector('.auth-message');
        if (existing) existing.remove();
        
        // Create message element
        const message = document.createElement('div');
        message.className = `auth-message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
    
    console.log('✅ Sign-in fix loaded');
});

console.log('✅ Sign-in fix script loaded (CSP compliant)');
