// modules/reports.js - ULTRA SIMPLE VERSION
console.log('REPORTS: Script loading');

// Create module
var ReportsModule = {
    name: 'reports',
    initialize: function() {
        console.log('REPORTS: initialize called');
        var area = document.getElementById('content-area');
        if (area) {
            area.innerHTML = '<h1>Reports Module</h1><p>Working!</p>';
            return true;
        }
        return false;
    }
};

// Register it
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;
console.log('REPORTS: Registered');
