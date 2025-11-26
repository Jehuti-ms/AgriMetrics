// app.js - With debug logging
console.log('🚜 Initializing Farm Management PWA...');

class FarmManagementApp {
    constructor() {
        this.currentModule = null;
        this.init();
    }

    init() {
        console.log('📱 Initializing PWA...');
        console.log('Auth status:', localStorage.getItem('farm-authenticated'));
        this.setupNavigation();
        this.checkAuthAndLoad();
        console.log('✅ Farm Management PWA Ready!');
    }

    checkAuthAndLoad() {
        const isAuthenticated = localStorage.getItem('farm-authenticated') === 'true';
        console.log('Authentication check:', isAuthenticated);
        
        if (isAuthenticated) {
            console.log('User is authenticated, loading dashboard');
            this.showSidebar();
            this.loadModule('dashboard');
        } else {
            console.log('User not authenticated, loading auth');
            this.hideSidebar();
            this.loadModule('auth');
        }
    }

    showSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        console.log('Showing sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.style.visibility = 'visible';
        }
        if (mainContent) mainContent.style.marginLeft = '260px';
    }

    hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        console.log('Hiding sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
            sidebar.style.visibility = 'hidden';
        }
        if (mainContent) mainContent.style.marginLeft = '0';
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const moduleName = navItem.getAttribute('data-module');
                console.log('Navigation clicked:', moduleName);
                
                if (localStorage.getItem('farm-authenticated') === 'true') {
                    this.loadModule(moduleName);
                } else {
                    this.hideSidebar();
                    this.loadModule('auth');
                }
            }
        });
    }

    async loadModule(moduleName) {
        console.log('Loading module:', moduleName);
        try {
            // Don't load modules if not authenticated (except auth)
            if (moduleName !== 'auth' && localStorage.getItem('farm-authenticated') !== 'true') {
                console.log('Not authenticated, redirecting to auth');
                this.hideSidebar();
                this.loadModule('auth');
                return;
            }

            // Unload current module
            if (this.currentModule && this.currentModule.cleanup) {
                console.log('Cleaning up current module');
                await this.currentModule.cleanup();
            }

            // Load new module
            const module = window.FarmModules?.get(moduleName);
            if (module) {
                console.log('Module found, initializing...');
                if (!module.initialized) {
                    await module.initialize();
                }
                this.currentModule = module;
                
                // Update UI
                if (moduleName !== 'auth') {
                    this.updateActiveNav(moduleName);
                    this.updatePageTitle(moduleName);
                    this.showSidebar();
                } else {
                    this.hideSidebar();
                }
                
                console.log(`✅ Loaded module: ${moduleName}`);
            } else {
                console.error(`❌ Module not found: ${moduleName}`);
                this.hideSidebar();
                this.loadModule('auth');
            }
        } catch (error) {
            console.error(`❌ Error loading module ${moduleName}:`, error);
            this.hideSidebar();
            this.loadModule('auth');
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

    // Method for profile module to call when logging out
    handleLogout() {
        console.log('App: Handling logout');
        localStorage.removeItem('farm-authenticated');
        localStorage.removeItem('farm-username');
        this.hideSidebar();
        this.loadModule('auth');
    }
}

// Make logout available globally for profile module
window.handleAppLogout = function() {
    console.log('Global logout function called');
    if (window.farmApp && window.farmApp.handleLogout) {
        window.farmApp.handleLogout();
    } else {
        console.error('farmApp not available for logout');
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.farmApp = new FarmManagementApp();
});
