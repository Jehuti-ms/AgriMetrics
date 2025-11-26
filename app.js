// app.js - Updated for your Firebase setup
console.log('🚜 Initializing Farm Management PWA...');

class FarmManagementApp {
    constructor() {
        this.currentModule = null;
        this.init();
    }

    init() {
        console.log('📱 Initializing PWA...');
        this.setupNavigation();
        this.checkAuthAndLoad();
        console.log('✅ Farm Management PWA Ready!');
    }

    checkAuthAndLoad() {
        const isAuthenticated = localStorage.getItem('farm-authenticated') === 'true';
        console.log('Authentication check:', isAuthenticated);
        
        if (isAuthenticated) {
            this.showApp();
            this.loadModule('dashboard');
        } else {
            this.showAuth();
        }
    }

    showApp() {
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        
        if (appContainer) appContainer.classList.remove('hidden');
        if (authContainer) authContainer.classList.add('hidden');
    }

    showAuth() {
        const appContainer = document.getElementById('app-container');
        const authContainer = document.getElementById('auth-container');
        
        if (appContainer) appContainer.classList.add('hidden');
        if (authContainer) authContainer.classList.remove('hidden');
    }

    setupNavigation() {
        // Your existing navigation setup
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const moduleName = navItem.getAttribute('data-module');
                
                if (localStorage.getItem('farm-authenticated') === 'true') {
                    this.loadModule(moduleName);
                }
            }
        });
    }

    async loadModule(moduleName) {
        console.log('Loading module:', moduleName);
        
        if (!window.FarmModules || !(window.FarmModules instanceof Map)) {
            console.error('❌ FarmModules registry not available');
            return;
        }
        
        try {
            // Don't load modules if not authenticated
            if (localStorage.getItem('farm-authenticated') !== 'true') {
                console.log('Not authenticated, showing auth');
                this.showAuth();
                return;
            }

            // Unload current module
            if (this.currentModule && this.currentModule.cleanup) {
                console.log('Cleaning up current module');
                await this.currentModule.cleanup();
            }

            // Load new module
            const module = window.FarmModules.get(moduleName);
            if (module) {
                console.log('Module found, initializing...');
                if (!module.initialized) {
                    await module.initialize();
                }
                this.currentModule = module;
                
                this.updateActiveNav(moduleName);
                this.updatePageTitle(moduleName);
                
                console.log(`✅ Loaded module: ${moduleName}`);
            } else {
                console.error(`❌ Module not found: ${moduleName}`);
            }
        } catch (error) {
            console.error(`❌ Error loading module ${moduleName}:`, error);
        }
    }

    updateActiveNav(activeModule) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-module') === activeModule);
        });
    }

    updatePageTitle(moduleName) {
        const titles = {
            dashboard: 'Dashboard',
            'sales-record': 'Sales Records',
            'broiler-mortality': 'Broiler Mortality',
            orders: 'Orders',
            production: 'Production',
            reports: 'Reports',
            profile: 'Profile'
        };
        document.title = `${titles[moduleName] || 'Farm Management'} - FarmPWA`;
    }

    handleLogout() {
        console.log('App: Handling logout');
        
        // Call auth module logout
        const authModule = window.FarmModules?.get('auth');
        if (authModule && authModule.logout) {
            authModule.logout();
        } else {
            // Fallback
            localStorage.removeItem('farm-authenticated');
            localStorage.removeItem('farm-user-email');
            this.showAuth();
        }
    }
}

// Make logout available globally
window.handleAppLogout = function() {
    console.log('Global logout function called');
    if (window.farmApp && window.farmApp.handleLogout) {
        window.farmApp.handleLogout();
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.farmApp = new FarmManagementApp();
});
