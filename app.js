// app.js - CSS-BASED VERSION (Fixed and Enhanced)
console.log('🚀 Loading Farm Management App (CSS-based)...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
        this.modules = {};
        this.init();
    }

    async init() {
        console.log('🚜 Starting Farm Management App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('✅ Initializing CSS-based app...');
        
        // 1. Initialize FarmModules core system FIRST
        this.initializeFarmModules();
        
        // 2. Pre-register critical modules
        this.preRegisterModules();
        
        // 3. Load global CSS
        this.loadGlobalCSS();
        
        this.isDemoMode = true;
        
        // 4. Load user preferences
        await this.loadUserPreferences();
        
        // 5. Show the app interface
        this.showApp();
        
        // 6. Setup navigation and events
        this.createTopNavigation();
        
        // 7. Setup interactions
        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupSideMenuEvents();
            this.setupEventListeners();
            this.setupDarkMode();
        }, 100);
        
        // 8. Load dashboard as initial section
        setTimeout(() => {
            this.showSection('dashboard');
        }, 200);
        
        console.log('✅ App initialized successfully');
        
        // Debug info
        setTimeout(() => {
            console.log('=== DEBUG INFO ===');
            console.log('FarmModules exists:', !!window.FarmModules);
            console.log('DashboardModule exists:', !!window.DashboardModule);
            console.log('Current section:', this.currentSection);
            console.log('Content area:', !!document.getElementById('content-area'));
        }, 500);
    }

    initializeFarmModules() {
        // Create FarmModules core with module registration system
        window.FarmModules = {
            modules: {},
            appData: {
                profile: {
                    farmName: 'My Farm',
                    dashboardStats: {},
                    lastUpdated: new Date().toISOString(),
                    recentActivities: []
                },
                settings: {
                    currency: 'USD',
                    theme: 'modern-green',
                    autoSync: true
                }
            },
            
            // Module registration system
            registerModule: function(name, module) {
                console.log(`📦 Module registered: ${name}`);
                this.modules[name] = module;
                
                // Auto-initialize if it's the current section
                if (window.app && window.app.currentSection === name) {
                    setTimeout(() => {
                        if (module.initialize && typeof module.initialize === 'function') {
                            module.initialize();
                        }
                    }, 100);
                }
            },
            
            getModule: function(name) {
                return this.modules[name];
            },
            
            // Load module CSS dynamically
            loadModuleCSS: function(moduleName) {
                const cssFile = `css/${moduleName}.css`;
                const linkId = `module-css-${moduleName}`;
                
                // Check if already loaded
                if (document.getElementById(linkId)) {
                    return;
                }
                
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = cssFile;
                link.onerror = () => {
                    console.warn(`⚠️ Could not load CSS for ${moduleName}`);
                };
                document.head.appendChild(link);
                
                console.log(`🎨 CSS loaded for: ${moduleName}`);
            },
            
            // Update dashboard stats
            updateDashboardStats: function(stats) {
                if (!this.appData.profile.dashboardStats) {
                    this.appData.profile.dashboardStats = {};
                }
                Object.assign(this.appData.profile.dashboardStats, stats);
                console.log('📊 Dashboard stats updated:', stats);
            }
        };
        
        console.log('🔧 FarmModules core initialized (CSS-based)');
    }

    preRegisterModules() {
        // Pre-register dashboard module if available
        if (typeof DashboardModule !== 'undefined') {
            window.FarmModules.registerModule('dashboard', DashboardModule);
            console.log('✅ Dashboard pre-registered');
        }
        
        // Create placeholder for other modules
        const placeholderModule = {
            name: 'placeholder',
            initialize: function() {
                const contentArea = document.getElementById('content-area');
                if (contentArea) {
                    contentArea.innerHTML = `
                        <div class="module-container">
                            <div class="module-header">
                                <h1 class="module-title">Module Preview</h1>
                                <p class="module-subtitle">Coming soon</p>
                            </div>
                            <div class="card">
                                <h3>📋 Module Information</h3>
                                <p>This module is currently under development.</p>
                                <div class="mt-4">
                                    <button onclick="app.showSection('dashboard')" class="btn-primary">
                                        ← Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }
                return true;
            }
        };
        
        // Register placeholders for other sections
        const placeholderSections = [
            'income-expenses',
            'inventory-check', 
            'orders',
            'sales-record',
            'feed-record',
            'production',
            'reports',
            'profile'
        ];
        
        placeholderSections.forEach(section => {
            window.FarmModules.registerModule(section, {
                ...placeholderModule,
                name: section,
                initialize: function() {
                    const contentArea = document.getElementById('content-area');
                    if (contentArea) {
                        const sectionNames = {
                            'income-expenses': 'Income & Expenses',
                            'inventory-check': 'Inventory',
                            'orders': 'Orders',
                            'sales-record': 'Sales',
                            'feed-record': 'Feed Records', 
                            'production': 'Production',
                            'reports': 'Reports',
                            'profile': 'Profile'
                        };
                        
                        contentArea.innerHTML = `
                            <div class="module-container">
                                <div class="module-header">
                                    <h1 class="module-title">${sectionNames[section] || section}</h1>
                                    <p class="module-subtitle">Module under construction</p>
                                </div>
                                <div class="card">
                                    <h3>📋 Module Information</h3>
                                    <p>The <strong>${sectionNames[section] || section}</strong> module is currently being migrated to the new CSS-based system.</p>
                                    <div class="alert alert-info mt-4">
                                        <strong>Migration Status:</strong> This module will be available soon.
                                    </div>
                                    <div class="mt-4">
                                        <button onclick="app.showSection('dashboard')" class="btn-primary">
                                            ← Return to Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    return true;
                }
            });
        });
        
        console.log('✅ All modules pre-registered');
    }

    loadGlobalCSS() {
        // Load essential global CSS files
        const globalCSS = [
            'css/theme.css',
            'css/layout.css', 
            'css/components.css',
            'modals.css'
        ];
        
        globalCSS.forEach(cssFile => {
            if (!document.querySelector(`link[href="${cssFile}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile;
                link.onerror = () => {
                    console.warn(`⚠️ Could not load CSS: ${cssFile}`);
                };
                document.head.appendChild(link);
            }
        });
        
        console.log('🎨 Global CSS loaded');
    }
    
    async loadUserPreferences() {
        try {
            // Try to load from localStorage
            const savedPrefs = localStorage.getItem('farm-user-preferences');
            this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
            
            // Create ProfileModule for compatibility
            this.createProfileModuleFallback();
            
            // Apply theme preference
            this.applyUserTheme();
            
        } catch (error) {
            console.error('❌ Error loading user preferences:', error);
            this.userPreferences = this.getDefaultPreferences();
            this.createProfileModuleFallback();
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'auto',
            language: 'en',
            currency: 'USD',
            notifications: true,
            businessName: 'My Farm',
            businessType: 'poultry',
            lowStockThreshold: 10,
            autoSync: true,
            dashboardStats: {
                totalOrders: 5,
                totalRevenue: 12500,
                pendingOrders: 2,
                totalCustomers: 8,
                totalProducts: 15,
                monthlyRevenue: 3200,
                monthlyOrders: 12,
                avgOrderValue: 1041.67,
                completedOrders: 3,
                paidOrders: 3,
                totalIncome: 12500,
                totalExpenses: 8500,
                netProfit: 4000,
                totalInventoryItems: 24,
                totalBirds: 1200
            }
        };
    }

    createProfileModuleFallback() {
        if (typeof ProfileModule === 'undefined') {
            window.ProfileModule = {
                userPreferences: this.userPreferences,
                
                // Core methods
                loadUserPreferences: () => this.userPreferences,
                getUserPreferences: () => this.userPreferences,
                updatePreference: (key, value) => {
                    this.userPreferences[key] = value;
                    localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                    console.log(`⚙️ Preference updated: ${key} = ${value}`);
                    
                    // Also update FarmModules
                    if (window.FarmModules && window.FarmModules.appData) {
                        if (!window.FarmModules.appData.profile) {
                            window.FarmModules.appData.profile = {};
                        }
                        window.FarmModules.appData.profile[key] = value;
                    }
                },
                
                // Stats methods
                updateStats: (stats) => {
                    if (!this.userPreferences.dashboardStats) {
                        this.userPreferences.dashboardStats = {};
                    }
                    Object.keys(stats).forEach(key => {
                        this.userPreferences.dashboardStats[key] = stats[key];
                    });
                    localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                    
                    // Also update FarmModules
                    if (window.FarmModules) {
                        window.FarmModules.updateDashboardStats(stats);
                    }
                },
                
                getStats: () => {
                    return this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats;
                },
                
                getProfileData: () => {
                    return {
                        farmName: this.userPreferences.businessName || 'My Farm',
                        farmerName: 'Farm Manager',
                        stats: this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats
                    };
                },
                
                // Compatibility methods
                initialize: () => {
                    console.log('✅ ProfileModule fallback initialized');
                    return true;
                }
            };
            
            console.log('✅ ProfileModule created for compatibility');
        }
    }

    applyUserTheme() {
        const theme = this.userPreferences.theme || 'auto';
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
            this.updateDarkModeIcon(false);
        } else {
            // Auto mode - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
            this.updateDarkModeIcon(prefersDark);
        }
    }

    setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                
                // Save preference
                const newTheme = isDarkMode ? 'dark' : 'light';
                this.userPreferences.theme = newTheme;
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                
                // Update ProfileModule
                if (window.ProfileModule) {
                    window.ProfileModule.updatePreference('theme', newTheme);
                }
                
                // Update icon
                this.updateDarkModeIcon(isDarkMode);
                
                console.log('🎨 Theme changed to:', newTheme);
            });
        }
        
        // Listen for system theme changes
        prefersDarkScheme.addEventListener('change', (e) => {
            if (this.userPreferences.theme === 'auto') {
                document.body.classList.toggle('dark-mode', e.matches);
                this.updateDarkModeIcon(e.matches);
            }
        });
    }

    updateDarkModeIcon(isDarkMode) {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('span:first-child');
            const label = darkModeToggle.querySelector('.nav-label');
            
            if (isDarkMode) {
                icon.textContent = '☀️';
                label.textContent = 'Light';
            } else {
                icon.textContent = '🌙';
                label.textContent = 'Dark';
            }
        }
    }
  
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Handle main nav items
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                if (view) {
                    this.showSection(view);
                }
            }
            
            // Handle sidebar menu items
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            }
        });
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        console.log('🏠 App container shown');
    }

    createTopNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        // Remove existing header if any
        let header = appContainer.querySelector('header');
        if (header) {
            header.remove();
        }
        
        // Create new header
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        header.innerHTML = `
            <nav class="top-nav">
                <div class="nav-brand">
                    <img src="icons/icon-96x96.png" alt="AgriMetrics" class="brand-icon">
                    <div class="brand-texts">
                        <span class="brand-text">AgriMetrics</span>
                        <span class="brand-subtitle">Farm Management System</span>
                    </div>
                </div>
                
                <div class="nav-items">
                    <button class="nav-item active" data-view="dashboard" title="Dashboard">
                        <span>📊</span>
                        <span class="nav-label">Dashboard</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" title="Income & Expenses">
                        <span>💰</span>
                        <span class="nav-label">Income</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" title="Inventory">
                        <span>📦</span>
                        <span class="nav-label">Inventory</span>
                    </button>

                    <button class="nav-item" data-view="orders" title="Orders">
                        <span>📋</span>
                        <span class="nav-label">Orders</span>
                    </button>

                    <button class="nav-item" data-view="sales-record" title="Sales">
                        <span>🛒</span>
                        <span class="nav-label">Sales</span>
                    </button>

                    <button class="nav-item" data-view="profile" title="Profile">
                        <span>👤</span>
                        <span class="nav-label">Profile</span>
                    </button>

                    <!-- Dark Mode Toggle -->
                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Toggle Dark Mode">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                    
                    <!-- Hamburger menu -->
                    <button class="nav-item hamburger-menu" id="hamburger-menu" title="Farm Operations">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
        `;

        // Adjust main content padding
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
        }
        
        console.log('✅ Top Navigation created');
    }
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sideMenu.classList.toggle('active');
            });
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sideMenu = document.getElementById('side-menu');
            const hamburger = document.getElementById('hamburger-menu');
            
            if (sideMenu && sideMenu.classList.contains('active') && hamburger) {
                if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    sideMenu.classList.remove('active');
                }
            }
        });
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        sideMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    
                    // Close sidebar after selection
                    const sideMenu = document.getElementById('side-menu');
                    if (sideMenu) {
                        sideMenu.classList.remove('active');
                    }
                }
            });
        });
    }
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active nav state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update sidebar active state
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) {
            activeSideItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load module CSS dynamically
        if (window.FarmModules && window.FarmModules.loadModuleCSS) {
            window.FarmModules.loadModuleCSS(sectionId);
        }
        
        // Initialize the module
        this.initializeModule(sectionId);
    }

    initializeModule(moduleName) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Show loading state
        contentArea.innerHTML = `
            <div class="module-loading">
                <div class="loading-spinner">
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                </div>
                <p>Loading ${this.getSectionName(moduleName)}...</p>
            </div>
        `;
        
        // Clear content area after a brief moment
        setTimeout(() => {
            contentArea.innerHTML = '';
            
            // Find and initialize the module
            const module = window.FarmModules?.modules[moduleName];
            if (module && typeof module.initialize === 'function') {
                if (module.initialize()) {
                    console.log(`✅ Module initialized: ${moduleName}`);
                    this.currentSection = moduleName;
                } else {
                    this.showError(`Failed to load ${this.getSectionName(moduleName)}`);
                }
            } else {
                // Fallback: Show module not available
                this.showModuleNotAvailable(moduleName);
            }
        }, 300);
    }

    getSectionName(section) {
        const sectionNames = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory',
            'orders': 'Orders',
            'sales-record': 'Sales Record',
            'feed-record': 'Feed Records',
            'production': 'Production',
            'reports': 'Reports',
            'profile': 'Profile'
        };
        return sectionNames[section] || section;
    }

    showError(message) {
        console.error('❌', message);
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="module-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Error Loading Module</h3>
                    <p>${message}</p>
                    <button onclick="app.showSection('dashboard')" class="btn-primary">
                        ← Return to Dashboard
                    </button>
                </div>
            `;
        }
    }

    showModuleNotAvailable(moduleName) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">${this.getSectionName(moduleName)}</h1>
                    <p class="module-subtitle">Module under construction</p>
                </div>
                
                <div class="module-content">
                    <div class="card">
                        <h3>📋 Module Information</h3>
                        <p>The <strong>${this.getSectionName(moduleName)}</strong> module is currently being migrated to the new CSS-based system.</p>
                        
                        <div class="alert alert-info mt-4">
                            <strong>Migration Status:</strong> This module will be available soon.
                        </div>
                        
                        <div class="mt-4">
                            <button onclick="app.showSection('dashboard')" class="btn-primary">
                                ← Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
