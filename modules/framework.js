// app.js
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Starting Farm Management App...');
        
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('farm-user') || 'null');
        
        if (user && user.loggedIn) {
            console.log('User already logged in');
            // Framework will handle showing dashboard via DOMContentLoaded
        } else {
            console.log('User not logged in, showing auth');
            if (window.FarmModules) {
                window.FarmModules.showModule('auth');
            }
        }
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FarmManagementApp();
});

console.log('✅ Main app loaded');
