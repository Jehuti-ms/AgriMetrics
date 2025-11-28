// app.js
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Starting Farm Management App...');
        this.setupNavigation();
        this.showDefaultView();
    }

    setupNavigation() {
        console.log('🧭 Navigation setup complete');
    }

    showDefaultView() {
        // Show login or dashboard based on auth status
        if (window.FarmModules) {
            window.FarmModules.showModule('dashboard');
        }
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FarmManagementApp();
});

console.log('✅ Main app loaded');
