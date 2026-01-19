// signin-fix.js - FIXED (No auth listener, only splash screen)
console.log('🔧 Loading splash screen handler...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, handling splash screen only...');
    
    // Show splash screen initially
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Ensure initial state
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.classList.add('active');
    }
    
    // Hide auth and app initially - let app.js handle auth
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Hide splash screen after delay
    setTimeout(() => {
        console.log('⏱️ Hiding splash screen...');
        
        if (splashScreen) {
            splashScreen.style.display = 'none';
            splashScreen.classList.remove('active');
            console.log('🖼️ Splash screen hidden');
        }
        
        // IMPORTANT: Don't show auth or app here
        // Let app.js handle that via its auth listener
        console.log('✅ Splash complete - auth state handled by app.js');
        
    }, 800); // Show splash for 0.8 seconds
    
    console.log('✅ Splash screen handler initialized');
});
