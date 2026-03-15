// signin-fix.js - SIMPLE VERSION
console.log('🔧 Loading splash handler...');

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
});

// Add this at the end of signin-fix.js
(function() {
    console.log('🎯 Forcing auth centering...');
    
    function forceCenterAuth() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Force styles directly
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
        `;
        
        const authForms = document.querySelector('.auth-forms');
        if (authForms) {
            authForms.style.cssText = `
                background: white !important;
                border-radius: 16px !important;
                padding: 40px !important;
                width: 90% !important;
                max-width: 420px !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                margin: 0 auto !important;
                position: relative !important;
            `;
        }
        
        console.log('✅ Auth centering forced');
    }
    
    // Run immediately
    forceCenterAuth();
    
    // Run after DOM changes
    setTimeout(forceCenterAuth, 100);
    setTimeout(forceCenterAuth, 500);
    setTimeout(forceCenterAuth, 1000);
    
    // Watch for changes
    const observer = new MutationObserver(forceCenterAuth);
    observer.observe(document.body, { childList: true, subtree: true });
})();

// Force active class if needed
const authContainer = document.getElementById('auth-container');
if (authContainer && !authContainer.classList.contains('active')) {
    authContainer.classList.add('active');
}

