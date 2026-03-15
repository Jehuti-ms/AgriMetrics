// auth-fix.js - COMPREHENSIVE AUTH CENTERING & PERSISTENCE FIX
console.log('🔧 Loading auth fix...');

(function() {
    'use strict';
    
    // ==================== CENTERING FIX ====================
    
    function forceCenterAuth() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Get all auth forms
        const authForms = document.querySelector('.auth-forms');
        const signinForm = document.getElementById('signin-form');
        const signupForm = document.getElementById('signup-form');
        const forgotForm = document.getElementById('forgot-password-form');
        
        // Force auth container styles
        authContainer.style.setProperty('position', 'fixed', 'important');
        authContainer.style.setProperty('top', '0', 'important');
        authContainer.style.setProperty('left', '0', 'important');
        authContainer.style.setProperty('width', '100vw', 'important');
        authContainer.style.setProperty('height', '100vh', 'important');
        authContainer.style.setProperty('background', 'linear-gradient(135deg, #4CAF50, #2E7D32, #1B5E20)', 'important');
        authContainer.style.setProperty('display', 'flex', 'important');
        authContainer.style.setProperty('align-items', 'center', 'important');
        authContainer.style.setProperty('justify-content', 'center', 'important');
        authContainer.style.setProperty('z-index', '999998', 'important');
        authContainer.style.setProperty('margin', '0', 'important');
        authContainer.style.setProperty('padding', '0', 'important');
        authContainer.style.setProperty('box-sizing', 'border-box', 'important');
        
        // Force auth forms styles
        if (authForms) {
            authForms.style.setProperty('background', 'white', 'important');
            authForms.style.setProperty('border-radius', '16px', 'important');
            authForms.style.setProperty('padding', '40px', 'important');
            authForms.style.setProperty('width', '90%', 'important');
            authForms.style.setProperty('max-width', '420px', 'important');
            authForms.style.setProperty('max-height', '90vh', 'important');
            authForms.style.setProperty('overflow-y', 'auto', 'important');
            authForms.style.setProperty('box-shadow', '0 20px 60px rgba(0,0,0,0.3)', 'important');
            authForms.style.setProperty('margin', '0', 'important');
            authForms.style.setProperty('position', 'relative', 'important');
        }
        
        // Force form styles
        [signinForm, signupForm, forgotForm].forEach(form => {
            if (form) {
                form.style.setProperty('width', '100%', 'important');
            }
        });
        
        console.log('✅ Auth centering forced');
    }
    
    // ==================== PERSISTENCE FIX ====================
    
    function loadProfileData() {
        console.log('📂 Loading profile data...');
        
        try {
            const email = 'dmoseley@gams.edu.bb'; // Your email
            let profile = null;
            let settings = null;
            
            // Try user-specific profile first
            const userKey = `farm-profile-${email}`;
            const userData = localStorage.getItem(userKey);
            if (userData) {
                profile = JSON.parse(userData);
                console.log('✅ Loaded user-specific profile');
            }
            
            // Try general profile
            if (!profile) {
                const mainData = localStorage.getItem('farm-profile');
                if (mainData) {
                    profile = JSON.parse(mainData);
                    console.log('✅ Loaded general profile');
                }
            }
            
            // Load settings
            const settingsData = localStorage.getItem('farm-settings');
            if (settingsData) {
                settings = JSON.parse(settingsData);
                console.log('✅ Loaded settings');
            }
            
            // Load farm name
            const farmName = localStorage.getItem('farm-last-name');
            
            // Update FarmModules
            if (!window.FarmModules) window.FarmModules = {};
            if (!window.FarmModules.appData) window.FarmModules.appData = {};
            
            if (profile) {
                window.FarmModules.appData.profile = profile;
                window.FarmModules.appData.farmName = profile.farmName || farmName || 'My Farm';
            } else if (farmName) {
                window.FarmModules.appData.profile = {
                    farmName: farmName,
                    farmerName: 'Farm Manager',
                    email: email
                };
                window.FarmModules.appData.farmName = farmName;
            }
            
            if (settings) {
                window.FarmModules.appData.settings = settings;
            }
            
            console.log('✅ Profile data loaded:', window.FarmModules.appData.profile);
            
            // Update UI if profile module is active
            if (window.ProfileModule && window.ProfileModule.updateProfileDisplay) {
                window.ProfileModule.updateProfileDisplay();
            }
            
        } catch (error) {
            console.error('❌ Error loading profile:', error);
        }
    }
    
    // ==================== INITIALIZATION ====================
    
    // Run centering immediately and on any changes
    function init() {
        console.log('🚀 Auth fix initializing...');
        
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('userAuthenticated') === 'true' || 
                          document.body.classList.contains('app-active');
        
        if (!isLoggedIn) {
            // Force centering multiple times
            forceCenterAuth();
            setTimeout(forceCenterAuth, 100);
            setTimeout(forceCenterAuth, 300);
            setTimeout(forceCenterAuth, 500);
            setTimeout(forceCenterAuth, 1000);
        }
        
        // Load profile data
        loadProfileData();
        
        // Watch for auth container becoming active
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'auth-container' || 
                    (mutation.target.classList && mutation.target.classList.contains('active'))) {
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
        
        // Watch for storage changes (updates from other tabs)
        window.addEventListener('storage', function(e) {
            if (e.key && e.key.includes('farm-profile')) {
                console.log('🔄 Profile updated in another tab, reloading...');
                loadProfileData();
            }
        });
        
        // Also center on resize
        window.addEventListener('resize', forceCenterAuth);
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
