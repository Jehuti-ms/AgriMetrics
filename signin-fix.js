// signin-fix.js - SIMPLE VERSION
/*console.log('🔧 Loading splash handler...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Starting splash screen...');
    
    const splash = document.getElementById('splash-screen');
    
    // Show splash
    if (splash) {
        splash.style.display = 'flex';
        console.log('🖼️ Splash shown');
    }
    
    // Hide after delay
    setTimeout(() => {
        if (splash) {
            splash.style.display = 'none';
            console.log('🖼️ Splash hidden');
        }
        
        // Let app.js handle everything else
        console.log('✅ Splash done, app.js takes over');
    }, 800);
    
    console.log('✅ Splash handler ready');
}); */

// signin-fix.js
console.log('🔧 Loading splash handler...');

(function() {
    'use strict';
    
    console.log('✅ Starting splash screen...');
    
    const splash = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    
    if (splash) {
        // Show splash screen
        splash.classList.add('active');
        splash.style.display = 'flex';
        console.log('🖼️ Splash shown');
        
        // Hide splash after 2 seconds
        setTimeout(() => {
            splash.classList.remove('active');
            splash.classList.add('hidden');
            console.log('🖼️ Splash hidden');
            
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('userAuthenticated') === 'true' || 
                              localStorage.getItem('currentUser') !== null ||
                              document.body.classList.contains('app-active');
            
            if (!isLoggedIn) {
                // Show auth container
                if (authContainer) {
                    authContainer.style.display = 'flex';
                    authContainer.classList.add('active');
                    console.log('🔐 Auth container shown');
                }
            }
        }, 2000);
    } else {
        console.error('❌ Splash screen not found');
    }
})();

