// signin-fix.js - MINIMAL VERSION (Fix the white screen)
console.log('🔧 Loading splash screen ONLY...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Showing splash screen only...');
    
    const splashScreen = document.getElementById('splash-screen');
    
    // 1. SHOW SPLASH SCREEN
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.classList.add('active');
        console.log('🖼️ Splash screen shown');
    }
    
    // 2. HIDE EVERYTHING ELSE - let app.js handle it
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.classList.remove('active');
    }
    
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // 3. HIDE SPLASH AFTER DELAY - that's it!
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.display = 'none';
            splashScreen.classList.remove('active');
            console.log('🖼️ Splash screen hidden');
        }
        
        console.log('✅ Splash done - app.js handles everything else');
    }, 800); // 0.8 seconds
    
    console.log('✅ Splash handler initialized');
});
