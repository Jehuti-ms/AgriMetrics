// signin-fix.js - Updated
console.log('🔧 Loading simplified sign-in fix...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing auth flow...');
    
    // Show splash screen initially
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Ensure initial state
    if (splashScreen) splashScreen.style.display = 'flex';
    if (authContainer) authContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
    
    // Wait a moment, then check auth state
    setTimeout(() => {
        console.log('🔍 Checking auth state...');
        
        firebase.auth().onAuthStateChanged((user) => {
            // Hide splash screen
            if (splashScreen) {
                splashScreen.style.display = 'none';
                console.log('🖼️ Splash screen hidden');
            }
            
            if (user) {
                // User is signed in - show app
                console.log('👤 User already signed in:', user.email);
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
    }, 800); // Show splash for 0.8 seconds
    
    console.log('✅ Sign-in fix initialized');
});
