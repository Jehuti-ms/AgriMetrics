// signin-fix.js - Minimal version that doesn't interfere
console.log('🔧 Loading simplified sign-in fix...');

// Just check for existing auth and don't interfere with forms
document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('✅ User authenticated via signin-fix:', user.email);
            }
        });
    }
});

// Simple auth flow control
document.addEventListener('DOMContentLoaded', function() {
    // First, show splash screen
    const splashScreen = document.getElementById('splash-screen');
    
    // Check auth state after a short delay
    setTimeout(function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is logged in - show app
                if (splashScreen) splashScreen.classList.add('hidden');
                document.getElementById('auth-container').classList.remove('active');
                document.getElementById('app-container').classList.remove('hidden');
            } else {
                // User is not logged in - show login form
                if (splashScreen) splashScreen.classList.add('hidden');
                document.getElementById('auth-container').classList.add('active');
            }
        });
    }, 1000); // Show splash for 1 second
    
    // Handle logout
    document.addEventListener('click', function(e) {
        if (e.target.id === 'logout-confirm' || e.target.closest('#logout-confirm')) {
            // Clear remember me on logout
            if (window.simpleRememberMe) {
                window.simpleRememberMe.clear();
            }
            // Firebase sign out will happen via your existing code
        }
    });
});
