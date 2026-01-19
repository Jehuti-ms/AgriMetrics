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
