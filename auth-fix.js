// auth-fix.js - SIMPLIFIED AUTH CENTERING & PERSISTENCE FIX
console.log('🔧 Loading auth fix...');

(function() {
    'use strict';
    
    // ==================== SIMPLE CENTERING ====================
    
    function centerAuth() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        // Only apply if auth is visible
        if (authContainer.style.display !== 'flex' && !authContainer.classList.contains('active')) {
            return;
        }
        
        console.log('🎯 Centering auth container');
        
        // Simple inline styles
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
            authForms.style.margin = '0';
        }
    }
    
    // ==================== LOAD PROFILE ====================
    
    function loadProfile() {
        console.log('📂 Loading profile...');
        
        try {
            // Get email
            let email = 'dmoseley@gams.edu.bb';
            
            // Try Firebase
            if (typeof firebase !== 'undefined' && firebase.auth()?.currentUser) {
                email = firebase.auth().currentUser.email;
            }
            
            // Load profile from localStorage
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
            
            // Update FarmModules
            if (!window.FarmModules) window.FarmModules = {};
            if (!window.FarmModules.appData) window.FarmModules.appData = {};
            
            if (profile) {
                window.FarmModules.appData.profile = profile;
                window.FarmModules.appData.farmName = profile.farmName || farmName || 'My Farm';
                console.log('✅ Profile loaded:', profile.farmName);
            } else if (farmName) {
                window.FarmModules.appData.profile = {
                    farmName: farmName,
                    farmerName: 'Farm Manager',
                    email: email
                };
                window.FarmModules.appData.farmName = farmName;
            }
            
            if (settingsData) {
                try { 
                    window.FarmModules.appData.settings = JSON.parse(settingsData); 
                } catch (e) {}
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    // ==================== INIT ====================
    
    // Center once when auth becomes visible
    function checkAndCenter() {
        const authContainer = document.getElementById('auth-container');
        if (authContainer && (authContainer.style.display === 'flex' || authContainer.classList.contains('active'))) {
            centerAuth();
        }
    }
    
    // Run once on load
    setTimeout(() => {
        loadProfile();
        checkAndCenter();
    }, 500);
    
    // Center on resize (but not too often)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkAndCenter, 100);
    });
    
    // Simple mutation observer - only care about class changes
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.id === 'auth-container') {
                centerAuth();
                break;
            }
        }
    });
    
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        observer.observe(authContainer, { attributes: true, attributeFilter: ['class'] });
    }
    
    console.log('✅ Auth fix ready');
    
})();
