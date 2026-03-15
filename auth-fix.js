// auth-fix.js - SAFE VERSION - NO INFINITE LOOPS
console.log('🔧 Loading auth fix (safe version)...');

(function() {
    'use strict';
    
    // ==================== SAFE CENTERING ====================
    
    // Only run this once, not in a loop
    function centerAuthOnce() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Only center if auth is visible
        if (!authContainer.classList.contains('active') && authContainer.style.display !== 'flex') {
            return;
        }
        
        console.log('🎯 Centering auth container (one time)');
        
        // Apply styles
        authContainer.style.position = 'fixed';
        authContainer.style.top = '0';
        authContainer.style.left = '0';
        authContainer.style.width = '100vw';
        authContainer.style.height = '100vh';
        authContainer.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32, #1B5E20)';
        authContainer.style.display = 'flex';
        authContainer.style.alignItems = 'center';
        authContainer.style.justifyContent = 'center';
        authContainer.style.zIndex = '999998';
        authContainer.style.margin = '0';
        authContainer.style.padding = '0';
        
        const authForms = document.querySelector('.auth-forms');
        if (authForms) {
            authForms.style.background = 'white';
            authForms.style.borderRadius = '16px';
            authForms.style.padding = '40px';
            authForms.style.width = '90%';
            authForms.style.maxWidth = '420px';
            authForms.style.maxHeight = '90vh';
            authForms.style.overflowY = 'auto';
            authForms.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
            authForms.style.margin = '0 auto';
        }
    }
    
    // ==================== SAFE PROFILE LOADING ====================
    
    function loadProfileData() {
        console.log('📂 Loading profile data...');
        
        try {
            // Get email
            let email = 'dmoseley@gams.edu.bb';
            if (typeof firebase !== 'undefined' && firebase.auth()?.currentUser) {
                email = firebase.auth().currentUser.email;
            }
            
            // Load from localStorage
            const userKey = `farm-profile-${email}`;
            const userData = localStorage.getItem(userKey);
            const mainData = localStorage.getItem('farm-profile');
            const settingsData = localStorage.getItem('farm-settings');
            const farmName = localStorage.getItem('farm-last-name');
            
            let profile = null;
            if (userData) {
                try { profile = JSON.parse(userData); } catch (e) {}
            }
            if (!profile && mainData) {
                try { profile = JSON.parse(mainData); } catch (e) {}
            }
            
            // Update app data
            if (!window.FarmModules) window.FarmModules = {};
            if (!window.FarmModules.appData) window.FarmModules.appData = {};
            
            if (profile) {
                window.FarmModules.appData.profile = profile;
                window.FarmModules.appData.farmName = profile.farmName || farmName || 'My Farm';
                console.log('✅ Profile loaded:', profile.farmName);
            }
            
            if (settingsData) {
                try { 
                    window.FarmModules.appData.settings = JSON.parse(settingsData); 
                } catch (e) {}
            }
            
        } catch (error) {
            console.error('❌ Error loading profile:', error);
        }
    }
    
    // ==================== SAFE INIT ====================
    
    // Run once when page loads
    setTimeout(() => {
        loadProfileData();
        centerAuthOnce();
    }, 500);
    
    // Center on resize (but with debounce)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(centerAuthOnce, 150);
    });
    
    // Simple one-time observer (won't loop)
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.id === 'auth-container') {
                // Only center once, not continuously
                setTimeout(centerAuthOnce, 50);
                // Disconnect after first trigger to prevent loops
                observer.disconnect();
                break;
            }
        }
    });
    
    // Start observing if auth container exists
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        observer.observe(authContainer, { attributes: true, attributeFilter: ['class'] });
    }
    
    console.log('✅ Safe auth fix ready');
    
})();
