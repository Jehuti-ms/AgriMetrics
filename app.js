// app.js - Critical fixes for dashboard
console.log('🚀 Loading Farm Management App...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.userPreferences = {};
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('✅ Initializing app...');
        
        // 1. Initialize FarmModules FIRST
        this.initializeFarmModules();
        
        // 2. Show the app interface
        this.showApp();
        
        // 3. Setup navigation
        this.createTopNavigation();
        
        // 4. Setup event listeners
        setTimeout(() => {
            this.setupEventListeners();
            this.setupHamburgerMenu();
        }, 100);
        
        // 5. Load dashboard
        setTimeout(() => {
            this.showSection('dashboard');
        }, 200);
        
        console.log('✅ App initialized');
    }

    initializeFarmModules() {
        window.FarmModules = {
            modules: {},
            appData: {
                profile: {
                    farmName: 'My Farm',
                    dashboardStats: {
                        totalRevenue: 12500,
                        totalExpenses: 8500,
                        netProfit: 4000,
                        totalInventoryItems: 24,
                        totalBirds: 1200,
                        totalOrders: 5,
                        totalCustomers: 8,
                        totalProducts: 15,
                        monthlyRevenue: 3200,
                        completedOrders: 3
                    },
                    recentActivities: [],
                    lastUpdated: new Date().toISOString()
                }
            },
            
            registerModule: function(name, module) {
                console.log(`📦 Module registered: ${name}`);
                this.modules[name] = module;
            },
            
            getModule: function(name) {
                return this.modules[name];
            },
            
            loadModuleCSS: function(moduleName) {
                const linkId = `module-css-${moduleName}`;
                if (document.getElementById(linkId)) return;
                
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = `css/${moduleName}.css`;
                document.head.appendChild(link);
            }
        };
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
    }

    createTopNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        let header = appContainer.querySelector('header');
        if (header) header.remove();
        
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        header.innerHTML = `
            <nav class="top-nav">
                <div class="nav-brand">
                    <div class="brand-icon">🌱</div>
                    <div class="brand-texts">
                        <span class="brand-text">AgriMetrics</span>
                        <span class="brand-subtitle">Farm Management</span>
                    </div>
                </div>
                
                <div class="nav-items">
                    <button class="nav-item active" data-view="dashboard">
                        <span>📊</span>
                        <span class="nav-label">Dashboard</span>
                    </button>
                    <button class="nav-item" data-view="income-expenses">
                        <span>💰</span>
                        <span class="nav-label">Income</span>
                    </button>
                    <button class="nav-item" data-view="inventory-check">
                        <span>📦</span>
                        <span class="nav-label">Inventory</span>
                    </button>
                    <button class="nav-item" data-view="orders">
                        <span>📋</span>
                        <span class="nav-label">Orders</span>
                    </button>
                    <button class="nav-item" data-view="profile">
                        <span>👤</span>
                        <span class="nav-label">Profile</span>
                    </button>
                </div>
            </nav>
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                if (view) {
                    this.showSection(view);
                }
            }
        });
    }

    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            hamburger.addEventListener('click', (e) => {
                sideMenu.classList.toggle('active');
            });
        }
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to: ${sectionId}`);
        
        // Update active nav state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load CSS
        if (window.FarmModules && window.FarmModules.loadModuleCSS) {
            window.FarmModules.loadModuleCSS(sectionId);
        }
        
        // Initialize module
        this.initializeModule(sectionId);
    }

    initializeModule(moduleName) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Show loading
        contentArea.innerHTML = `
            <div class="module-loading">
                <div class="loading-spinner">⏳</div>
                <p>Loading ${moduleName}...</p>
            </div>
        `;
        
        setTimeout(() => {
            contentArea.innerHTML = '';
            
            // Check if module exists
            const module = window.FarmModules?.modules[moduleName];
            if (module && typeof module.initialize === 'function') {
                module.initialize();
            } else {
                // Show fallback
                contentArea.innerHTML = `
                    <div class="module-container">
                        <h1>${moduleName}</h1>
                        <p>Module coming soon</p>
                        <button onclick="app.showSection('dashboard')" class="btn-primary">
                            ← Back to Dashboard
                        </button>
                    </div>
                `;
            }
        }, 100);
    }
}

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
