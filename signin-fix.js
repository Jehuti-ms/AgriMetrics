// signin-fix.js - Simplified
console.log('🔧 Loading simplified sign-in fix...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing auth flow...');
    
    // Show splash screen initially
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Ensure initial state
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.classList.add('active');
    }
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.classList.remove('active');
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Check auth state after a short delay
    setTimeout(() => {
        console.log('🔍 Checking auth state...');
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('🔥 Auth state changed in signin-fix:', user ? user.email : 'No user');
                
                // Hide splash screen
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                    splashScreen.classList.remove('active');
                    console.log('🖼️ Splash screen hidden');
                }
                
                if (user) {
                    // User is signed in - show app
                    console.log('👤 User signed in, showing app');
                    if (appContainer) {
                        appContainer.style.display = 'block';
                    }
                    if (authContainer) {
                        authContainer.style.display = 'none';
                    }
                } else {
                    // User is not signed in - show login
                    console.log('🔐 User not signed in, showing login form');
                    if (authContainer) {
                        authContainer.style.display = 'block';
                        authContainer.classList.add('active');
                    }
                    if (appContainer) {
                        appContainer.style.display = 'none';
                    }
                    
                    // Focus on password field if email is already filled
                    const emailInput = document.getElementById('signin-email');
                    if (emailInput && emailInput.value) {
                        document.getElementById('signin-password')?.focus();
                    }
                }
            });
        } else {
            console.error('❌ Firebase not available');
            // Fallback: show auth screen
            if (splashScreen) splashScreen.style.display = 'none';
            if (authContainer) {
                authContainer.style.display = 'block';
                authContainer.classList.add('active');
            }
        }
    }, 800); // Show splash for 0.8 seconds
    
    console.log('✅ Sign-in fix initialized');
});
