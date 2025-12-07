// modules/reports.js - CLEAN MINIMAL VERSION
console.log('📊 MINIMAL REPORTS: Script loading...');

// Create a minimal module object
const MinimalReportsModule = {
    name: 'reports',
    initialized: false,
    
    initialize: function() {
        console.log('📊 MINIMAL REPORTS: initialize() called');
        
        var contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return false;
        }
        
        contentArea.innerHTML = '<div style="padding: 40px;"><h1>Minimal Reports Module</h1><p>If you see this, the module is working!</p><button onclick="alert(\'Reports module works!\')">Test Button</button></div>';
        
        this.initialized = true;
        return true;
    }
};

// SIMPLE REGISTRATION
console.log('📊 MINIMAL: Before registration');
window.FarmModules = window.FarmModules || {};
console.log('📊 MINIMAL: Existing FarmModules keys:', Object.keys(window.FarmModules));

// Direct assignment
window.FarmModules.reports = MinimalReportsModule;

console.log('✅ MINIMAL: Registered to window.FarmModules.reports');
console.log('📊 MINIMAL: After registration - keys:', Object.keys(window.FarmModules));
console.log('📊 MINIMAL: Reports module exists?', !!window.FarmModules.reports);

// Test it immediately
setTimeout(function() {
    console.log('📊 MINIMAL: Testing module...');
    if (window.FarmModules && window.FarmModules.reports && window.FarmModules.reports.initialize) {
        console.log('✅ MINIMAL: Module has initialize method');
    } else {
        console.error('❌ MINIMAL: Module missing initialize method');
    }
}, 100);
