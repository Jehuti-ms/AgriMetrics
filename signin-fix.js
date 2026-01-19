// signin-fix.js - FIXED (Shows auth form when no user)
console.log('🔧 Loading splash screen handler...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, handling splash and initial auth state...');
    
    // Show splash screen initially
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Ensure initial state
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.classList.add('active');
    }
    
    // Initially hide everything
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // After splash delay, check initial auth state
    setTimeout(() => {
        console.log('⏱️ Splash complete, checking initial auth...');
        
        // Hide splash
        if (splashScreen) {
            splashScreen.style.display = 'none';
            splashScreen.classList.remove('active');
            console.log('🖼️ Splash screen hidden');
        }
        
        // Check if user is already logged in (ONE-TIME CHECK)
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const currentUser = firebase.auth().currentUser;
            
            if (currentUser) {
                console.log('👤 User already signed in on page load');
                // App.js will handle showing the app via its auth listener
            } else {
                console.log('🔐 No user on page load, showing auth form');
                // Show auth form immediately
                if (authContainer) {
                    authContainer.style.display = 'block';
                    authContainer.classList.add('active');
                }
            }
        } else {
            console.error('❌ Firebase not available');
            // Fallback: show auth screen
            if (authContainer) {
                authContainer.style.display = 'block';
                authContainer.classList.add('active');
            }
        }
        
    }, 800); // Show splash for 0.8 seconds
    
    console.log('✅ Splash handler initialized');
});
