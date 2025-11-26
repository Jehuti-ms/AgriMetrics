// app.js - Updated with auth handling
class FarmManagementApp {
    constructor() {
        this.modules = new Map();
        this.currentModule = null;
        this.init();
    }

    async init() {
        console.log('🚜 Initializing Farm Management PWA...');
        
        // Initialize module system first
        await this.initModules();
        
        // Check authentication and load appropriate module
        this.checkAuthAndLoad();
        
        console.log('✅ Farm Management PWA Ready!');
    }

    async initModules() {
        // Module registry
        window.FarmModules = {
            modules: new Map(),
            
            registerModule(name, moduleInstance) {
                this.modules.set(name, moduleInstance);
                console.log(`✅ Module registered: ${name}`);
            },
            
            getModule(name) {
                return this.modules.get(name);
            },
            
            async loadModule(name) {
                const module = this.modules.get(name);
                if (module && !module.initialized) {
                    await module.initialize();
                }
                return module;
            }
        };
    }

    checkAuthAndLoad() {
        const isAuthenticated = localStorage.getItem('farm-user-authenticated') === 'true';
        
        if (isAuthenticated) {
            this.loadModule('dashboard');
            this.setupAuthenticatedUI();
        } else {
            this.loadModule('auth');
            this.setupUnauthenticatedUI();
        }
    }

    setupAuthenticatedUI() {
        // Add logout button to navigation if it doesn't exist
        if (!document.querySelector('.logout-btn')) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                const logoutItem = document.createElement('li');
                logoutItem.innerHTML = `
                    <a href="#" class="nav-item logout-btn" data-module="logout">
                        <span class="icon">🚪</span>
                        <span>Logout</span>
                    </a>
                `;
                navMenu.appendChild(logoutItem);
                
                // Add logout handler
                logoutItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.FarmModules) {
                        const authModule = window.FarmModules.getModule('auth');
                        if (authModule && authModule.logout) {
                            authModule.logout();
                        }
                    }
                });
            }
        }
        
        // Remove auth page styles
        document.body.classList.remove('auth-page');
    }

    setupUnauthenticatedUI() {
        // Hide navigation when on auth page
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar) sidebar.style.display = 'none';
        if (mainContent) mainContent.style.marginLeft = '0';
        
        // Add auth page class to body
        document.body.classList.add('auth-page');
    }

    setupNavigation() {
        // Handle navigation clicks - only for authenticated users
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item:not(.logout-btn)');
            if (navItem && localStorage.getItem('farm-user-authenticated') === 'true') {
                e.preventDefault();
                const moduleName = navItem.getAttribute('data-module');
                if (moduleName !== 'logout') {
                    this.loadModule(moduleName);
                }
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (localStorage.getItem('farm-user-authenticated') === 'true') {
                const moduleName = e.state?.module || 'dashboard';
                this.loadModule(moduleName);
            }
        });
    }

    async loadModule(moduleName) {
        // Don't load modules if not authenticated (except auth module)
        if (moduleName !== 'auth' && localStorage.getItem('farm-user-authenticated') !== 'true') {
            this.loadModule('auth');
            return;
        }

        try {
            // Unload current module
            if (this.currentModule && this.currentModule.cleanup) {
                await this.currentModule.cleanup();
            }

            // Load new module
            const module = await window.FarmModules.loadModule(moduleName);
            if (module) {
                this.currentModule = module;
                
                // Update UI for authenticated modules
                if (moduleName !== 'auth') {
                    this.updateActiveNav(moduleName);
                    this.updatePageTitle(moduleName);
                    this.setupAuthenticatedUI();
                    
                    // Update URL
                    history.pushState({ module: moduleName }, '', `#${moduleName}`);
                } else {
                    this.setupUnauthenticatedUI();
                }
                
                console.log(`✅ Loaded module: ${moduleName}`);
            } else {
                console.error(`❌ Module not found: ${moduleName}`);
                this.loadModule('auth'); // Fallback to auth
            }
        } catch (error) {
            console.error(`❌ Error loading module ${moduleName}:`, error);
            this.loadModule('auth'); // Fallback to auth
        }
    }

    updateActiveNav(activeModule) {
        // Update navigation highlights
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.farmApp = new FarmManagementApp();
});
