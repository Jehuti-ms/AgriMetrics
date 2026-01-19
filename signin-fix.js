// signin-fix.js - Updated
console.log('🔧 Loading simplified sign-in fix...');

// Ensure auth forms are always centered
function centerAuthForms() {
    const authContainer = document.getElementById('auth-container');
    const authForms = document.querySelector('.auth-forms');
    
    if (authContainer && authForms) {
        // Calculate vertical centering
        const containerHeight = window.innerHeight;
        const formHeight = authForms.offsetHeight;
        
        // Only adjust if form is taller than viewport
        if (formHeight < containerHeight - 100) {
            authForms.style.marginTop = '0';
            authForms.style.alignSelf = 'center';
        } else {
            // For very tall forms, add top margin
            authForms.style.marginTop = '20px';
            authForms.style.alignSelf = 'flex-start';
        }
    }
}

// Setup observer for auth container changes
function setupAuthContainerObserver() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                if (authContainer.style.display === 'block' ||
                    authContainer.classList.contains('active')) {
                    setTimeout(centerAuthForms, 100);
                }
            }
        });
    });
    
    observer.observe(authContainer, { attributes: true });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing auth flow...');
    
    // Show splash screen initially
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    // Ensure initial state
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.classList.add('active');
    }
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.classList.remove('active');
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Setup centering functions
    setupAuthContainerObserver();
    
    // Run centering on load and resize
    centerAuthForms();
    window.addEventListener('resize', centerAuthForms);
    
    // Check auth state after a short delay
    setTimeout(() => {
        console.log('🔍 Checking auth state...');
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('🔥 Auth state changed in signin-fix:', user ? user.email : 'No user');
                
                // Hide splash screen
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                    splashScreen.classList.remove('active');
                    console.log('🖼️ Splash screen hidden');
                }
                
                if (user) {
                    // User is signed in - show app
                    console.log('👤 User signed in, showing app');
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
                        authContainer.classList.add('active');
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
                
                // Re-center forms after auth state change
                setTimeout(centerAuthForms, 200);
            });
        } else {
            console.error('❌ Firebase not available');
            // Fallback: show auth screen
            if (splashScreen) splashScreen.style.display = 'none';
            if (authContainer) {
                authContainer.style.display = 'block';
                authContainer.classList.add('active');
            }
            
            // Center forms for fallback
            setTimeout(centerAuthForms, 200);
        }
    }, 800); // Show splash for 0.8 seconds
    
    console.log('✅ Sign-in fix initialized');
});
