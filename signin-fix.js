/**
 * Ultra-simple sign-in button fix - UPDATED
 * FIXES: Firebase login loop issue without conflicting with app.js
 * CSP COMPLIANT: No inline event handlers
 */

(function() {
    'use strict';
    
    console.log('🔧 Loading sign-in fix...');
    
    // Flag to prevent multiple initializations
    let signInFixApplied = false;
    
    function fixSignInButton() {
        if (signInFixApplied) {
            console.log('⚠️ Sign-in fix already applied, skipping');
            return;
        }
        
        const button = document.querySelector('#signin-form-element button[type="submit"]');
        if (!button) {
            setTimeout(fixSignInButton, 100);
            return;
        }
        
        console.log('🔧 Applying sign-in button fix...');
        
        // Store original button state
        const originalText = button.textContent;
        
        // Remove any existing event listeners by cloning
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        
        const signInBtn = document.querySelector('#signin-form-element button[type="submit"]');
        
        // Add proper event listener (CSP compliant)
        signInBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }
            
            // Show loading state
            this.textContent = 'Signing In...';
            this.disabled = true;
            
            try {
                console.log('🔐 Attempting sign in via fix script...');
                
                // Use the auth manager if available, otherwise direct Firebase
                if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signIn === 'function') {
                    await window.firebaseAuthManager.signIn(email, password);
                } else {
                    // Fallback to direct Firebase auth
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                }
                
                console.log('✅ Sign-in successful via fix script');
                
                // Show success but DON'T manipulate UI directly
                this.textContent = 'Success!';
                
                // Wait a moment then restore button
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                    
                    // Clear the form
                    document.getElementById('signin-email').value = '';
                    document.getElementById('signin-password').value = '';
                }, 1500);
                
                // The auth state change will be handled by app.js
                // DO NOT hide/show containers here
                
            } catch (error) {
                console.error('❌ Sign-in error:', error);
                
                // Restore button
                this.textContent = originalText;
                this.disabled = false;
                
                // Show error to user
                let errorMessage = 'Sign-in failed';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many attempts. Please try again later.';
                } else {
                    errorMessage = error.message || 'Sign-in failed';
                }
                
                alert(errorMessage);
            }
        });
        
        signInFixApplied = true;
        console.log('✅ Sign-in button fix applied (CSP compliant)');
    }
    
    // Fix for login loop on page load
    function checkExistingAuth() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(checkExistingAuth, 100);
            return;
        }
        
        console.log('🔍 Checking existing auth...');
        
        // Use a single auth state listener to prevent conflicts
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('✅ User already authenticated on page load:', user.email);
                
                // Store in localStorage for reference
                localStorage.setItem('userAuthenticated', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userId', user.uid);
                
                // IMPORTANT: Don't manipulate UI here
                // Let app.js handle the UI state
                
            } else {
                console.log('🔒 No user authenticated on page load');
                
                // Clear any stale auth data
                localStorage.removeItem('userAuthenticated');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
            }
        });
    }
    
    // Also fix the sign-up button
    function fixSignUpButton() {
        const signupBtn = document.querySelector('#signup-form-element button[type="submit"]');
        if (!signupBtn) {
            setTimeout(fixSignUpButton, 100);
            return;
        }
        
        console.log('🔧 Fixing sign-up button...');
        
        const originalText = signupBtn.textContent;
        
        // Remove any existing listeners by cloning
        const newBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newBtn, signupBtn);
        
        const updatedBtn = document.querySelector('#signup-form-element button[type="submit"]');
        
        updatedBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const farmName = document.getElementById('farm-name').value;
            
            // Basic validation
            if (!name || !email || !password || !confirmPassword || !farmName) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            // Show loading state
            this.textContent = 'Creating Account...';
            this.disabled = true;
            
            try {
                console.log('📝 Attempting sign up via fix script...');
                
                // Use auth manager if available
                if (window.firebaseAuthManager && typeof window.firebaseAuthManager.signUp === 'function') {
                    await window.firebaseAuthManager.signUp(email, password, {
                        displayName: name,
                        farmName: farmName
                    });
                } else {
                    // Fallback to direct Firebase
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    
                    // Update profile
                    await userCredential.user.updateProfile({
                        displayName: name
                    });
                    
                    // Create profile in Firestore if db is available
                    if (firebase.firestore) {
                        const db = firebase.firestore();
                        await db.collection('users').doc(userCredential.user.uid).set({
                            email: email,
                            displayName: name,
                            farmName: farmName,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('farm-profile', JSON.stringify({
                        email: email,
                        displayName: name,
                        farmName: farmName
                    }));
                    localStorage.setItem('current-user-uid', userCredential.user.uid);
                }
                
                console.log('✅ Sign-up successful via fix script');
                
                // Show success but DON'T manipulate UI
                this.textContent = 'Account Created!';
                
                // Wait and restore button
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                    
                    // Clear form
                    document.getElementById('signup-name').value = '';
                    document.getElementById('signup-email').value = '';
                    document.getElementById('signup-password').value = '';
                    document.getElementById('signup-confirm-password').value = '';
                    document.getElementById('farm-name').value = '';
                    
                    // Switch to sign-in form
                    document.getElementById('show-signin')?.click();
                    
                }, 1500);
                
                // Let app.js handle the auth state change
                
            } catch (error) {
                console.error('❌ Sign-up error:', error);
                
                // Restore button
                this.textContent = originalText;
                this.disabled = false;
                
                // Show error
                let errorMessage = 'Sign-up failed';
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Email already in use';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address';
                } else {
                    errorMessage = error.message || 'Sign-up failed';
                }
                
                alert(errorMessage);
            }
        });
        
        console.log('✅ Sign-up button fixed');
    }
    
    // Initialize when ready
    function initialize() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            console.log('🚀 Initializing sign-in fix...');
            
            fixSignInButton();
            fixSignUpButton();
            checkExistingAuth();
            
            // Also set up form switchers
            setupFormSwitchers();
            
        } else {
            // Wait for Firebase
            console.log('⏳ Waiting for Firebase...');
            setTimeout(initialize, 100);
        }
    }
    
    function setupFormSwitchers() {
        // Fix form switcher links
        const switchers = {
            'show-signup': () => showForm('signup'),
            'show-signin': () => showForm('signin'),
            'show-forgot-password': () => showForm('forgot'),
            'show-signin-from-forgot': () => showForm('signin')
        };
        
        Object.keys(switchers).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Clone to remove existing listeners
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                document.getElementById(id).addEventListener('click', function(e) {
                    e.preventDefault();
                    switchers[id]();
                });
            }
        });
        
        console.log('✅ Form switchers fixed');
    }
    
    function showForm(formName) {
        console.log(`🔄 Switching to ${formName} form`);
        
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });
        
        // Show selected form
        const targetForm = document.getElementById(`${formName}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
            targetForm.style.display = 'block';
            
            // Focus first input
            const firstInput = targetForm.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Export for debugging
    window.signInFix = {
        fixSignInButton: fixSignInButton,
        fixSignUpButton: fixSignUpButton,
        checkExistingAuth: checkExistingAuth
    };
    
    console.log('✅ Sign-in fix script loaded');
})();
