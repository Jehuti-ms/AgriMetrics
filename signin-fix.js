// signin-fix.js - FIXED - Only handles initial splash to auth transition
console.log('🔧 Loading sign-in fix (splash screen only)...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, handling splash screen...');
    
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
    
    // Check if user is already logged in (quick check)
    setTimeout(() => {
        console.log('🔍 Checking initial auth state...');
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const currentUser = firebase.auth().currentUser;
            
            if (currentUser) {
                // User is already logged in - hide splash, show app
                console.log('👤 User already signed in, showing app');
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                    splashScreen.classList.remove('active');
                }
                if (appContainer) {
                    appContainer.style.display = 'block';
                }
                if (authContainer) {
                    authContainer.style.display = 'none';
                }
            } else {
                // No user - show auth after splash
                console.log('🔐 No user found, showing auth after splash');
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                    splashScreen.classList.remove('active');
                }
                if (authContainer) {
                    authContainer.style.display = 'block';
                    authContainer.classList.add('active');
                }
            }
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
    
    console.log('✅ Sign-in fix (splash only) initialized');
});
