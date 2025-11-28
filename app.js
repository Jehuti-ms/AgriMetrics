// app.js
class FarmManagementApp {
    constructor() {
        this.currentModule = null;
        this.init();
    }

    init() {
        console.log('🚀 Starting Farm Management App...');
        
        // Initialize Firebase first
        this.initFirebase().then(() => {
            // Initialize core module
            this.initCoreModule();
            
            // Initialize all other modules
            this.initModules();
            
            // Setup navigation
            this.setupNavigation();
            
            console.log('✅ App initialized successfully');
        }).catch(error => {
            console.error('❌ App initialization failed:', error);
        });
    }

    async initFirebase() {
        // Firebase initialization will happen through the separate files
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ Firebase setup completed');
    }

    initCoreModule() {
        if (window.coreModule) {
            window.coreModule.initialize();
            window.app = this; // Make app instance globally available
        }
    }

    initModules() {
        // Modules are auto-registered through their individual files
        // We just need to ensure they're loaded
        console.log('📦 Modules loading...');
    }

    setupNavigation() {
        // Navigation is handled by the core module
        console.log('🧭 Navigation setup completed');
    }

    // Global navigation method
    showSection(sectionId) {
        console.log('Navigating to section:', sectionId);
        
        if (window.FarmModules && window.FarmModules.showModule) {
            window.FarmModules.showModule(sectionId);
        } else {
            console.error('FarmModules framework not available');
        }
    }

    // Global method to show notifications
    showNotification(message, type = 'info') {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.farmApp = new FarmManagementApp();
});

console.log('✅ Main app loaded');
