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
/*console.log('🔧 Loading splash handler...');

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
})(); */

// signin-fix.js
console.log('🔧 Loading splash handler...');

(function() {
    'use strict';
    
    console.log('✅ Starting splash screen...');
    
    const splash = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    
    // FORCE CENTERING FUNCTION
    function forceCenterAuth() {
        const authContainer = document.getElementById('auth-container');
        const authForms = document.querySelector('.auth-forms');
        
        if (!authContainer || !authForms) return;
        
        // Force auth container to full screen with flex
        authContainer.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #4CAF50, #2E7D32, #1B5E20) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 999998 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        `;
        
        // Force auth forms to be perfectly centered
        authForms.style.cssText = `
            background: white !important;
            border-radius: 16px !important;
            padding: 40px !important;
            width: 90% !important;
            max-width: 420px !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            margin: 0 !important;
            position: relative !important;
            transform: none !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
        `;
        
        console.log('✅ Auth centering forced');
    }
    
    // Show splash
    if (splash) {
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
                    
                    // Force centering immediately
                    forceCenterAuth();
                    
                    // Force centering again after a short delay (in case DOM needs time)
                    setTimeout(forceCenterAuth, 100);
                    setTimeout(forceCenterAuth, 300);
                    setTimeout(forceCenterAuth, 500);
                }
            }
        }, 2000);
    } else {
        console.error('❌ Splash screen not found');
    }
    
    // Also force centering when window resizes
    window.addEventListener('resize', forceCenterAuth);
    
    // Watch for DOM changes that might affect auth container
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'auth-container' || 
                mutation.target.classList?.contains('auth-forms') ||
                mutation.target.classList?.contains('active')) {
                forceCenterAuth();
            }
        });
    });
    
    observer.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true,
        attributeFilter: ['class', 'style']
    });
    
})();

