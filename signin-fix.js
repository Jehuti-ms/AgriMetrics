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
