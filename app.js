// app.js - REWRITTEN FARM MANAGEMENT APP
console.log('🚀 Loading Farm Management App...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = true;
        this.userPreferences = this.getDefaultPreferences();
        this.modules = new Map();
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Farm Management App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // Phase 1: Core Setup
            await this.initializeCoreSystems();
            
            // Phase 2: UI Setup
            this.initializeUI();
            
            // Phase 3: Load Data & Start
            await this.loadApplicationData();
            
            console.log('✅ Farm Management App initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showErrorState();
        }
    }

    async initializeCoreSystems() {
        console.log('🔧 Initializing core systems...');
        
        // 1. Initialize Style Manager
        this.initializeStyleManager();
        
        // 2. Initialize Module System
        this.initializeModuleSystem();
        
        // 3. Initialize Data Management
        this.initializeDataManagement();
        
        console.log('✅ Core systems initialized');
    }

    initializeStyleManager() {
        // Initialize global style management
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        } else {
            console.log('🎨 Using built-in style management');
            this.setupBuiltInStyleManager();
        }
    }

    setupBuiltInStyleManager() {
        // Add global CSS for consistent styling
        const style = document.createElement('style');
        style.textContent = `
            .farm-module-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                min-height: calc(100vh - 80px);
            }
            
            .farm-module-header {
                background: linear-gradient(135deg, #22c55e 0%, #14b8a6 100%);
                margin: -20px -20px 20px -20px;
                padding: 25px 20px;
                border-radius: 0 0 20px 20px;
                color: white;
                position: relative;
                overflow: hidden;
            }
            
            .farm-input {
                width: 100%;
                padding: 12px;
                border: 1.5px solid #e2e8f0;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                color: #1e293b;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .farm-input:focus {
                outline: none;
                border-color: #14b8a6;
                background: rgba(255, 255, 255, 1);
                box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
            }
            
            .farm-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .farm-btn-primary {
                background: linear-gradient(135deg, #22c55e, #14b8a6);
                color: white;
            }
            
            .farm-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(20, 184, 166, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    initializeModuleSystem() {
        console.log('🔧 Initializing module system...');
        
        // Create robust module management system
        window.FarmModules = {
            modules: new Map(),
            initialized: false,
            
            register: (name, module) => {
                console.log(`✅ Registering module: ${name}`);
                
                if (this.modules.has(name)) {
                    console.warn(`⚠️ Module ${name} already registered, replacing`);
                }
                
                // Validate module structure
                if (!module || typeof module !== 'object') {
                    console.error(`❌ Invalid module ${name}: must be an object`);
                    return false;
                }
                
                this.modules.set(name, module);
                
                // Auto-initialize if module has init method
                if (typeof module.initialize === 'function') {
                    try {
                        module.initialize();
                        console.log(`✅ Auto-initialized module: ${name}`);
                    } catch (error) {
                        console.error(`❌ Failed to auto-initialize module ${name}:`, error);
                    }
                }
                
                return true;
            },
            
            get: (name) => {
                return this.modules.get(name);
            },
            
            initialize: (name) => {
                console.log(`🔄 Initializing module: ${name}`);
                const module = this.modules.get(name);
                
                if (!module) {
                    console.warn(`⚠️ Module ${name} not found`);
                    return false;
                }
                
                try {
                    if (typeof module.initialize === 'function') {
                        module.initialize();
                    } else if (typeof module.render === 'function') {
                        module.render();
                    } else {
                        console.warn(`⚠️ Module ${name} has no initialize or render method`);
                        return false;
                    }
                    
                    console.log(`✅ Successfully initialized module: ${name}`);
                    return true;
                    
                } catch (error) {
                    console.error(`❌ Failed to initialize module ${name}:`, error);
                    return false;
                }
            },
            
            initializeAll: () => {
                console.log('🚀 Initializing all registered modules...');
                let successCount = 0;
                
                this.modules.forEach((module, name) => {
                    if (this.initialize(name)) {
                        successCount++;
                    }
                });
                
                this.initialized = true;
                console.log(`✅ Initialized ${successCount}/${this.modules.size} modules`);
                return successCount;
            },
            
            // Alias methods for compatibility
            registerModule: (name, module) => this.register(name, module),
            getModule: (name) => this.get(name),
            initializeModule: (name) => this.initialize(name),
            initializeModules: () => this.initializeAll(),
            init: () => this.initializeAll()
        };
        
        console.log('✅ Module system initialized');
    }

    initializeDataManagement() {
        console.log('🔧 Initializing data management...');
        
        // Create data management system
        window.FarmData = {
            preferences: this.userPreferences,
            
            savePreferences: () => {
                try {
                    localStorage.setItem('farm-user-preferences', JSON.stringify(this.preferences));
                    console.log('💾 Preferences saved');
                    return true;
                } catch (error) {
                    console.error('❌ Failed to save preferences:', error);
                    return false;
                }
            },
            
            loadPreferences: () => {
                try {
                    const saved = localStorage.getItem('farm-user-preferences');
                    if (saved) {
                        this.preferences = { ...this.getDefaultPreferences(), ...JSON.parse(saved) };
                        console.log('💾 Preferences loaded');
                    }
                    return this.preferences;
                } catch (error) {
                    console.error('❌ Failed to load preferences:', error);
                    return this.getDefaultPreferences();
                }
            },
            
            updatePreference: (key, value) => {
                this.preferences[key] = value;
                this.savePreferences();
                console.log(`⚙️ Preference updated: ${key} = ${value}`);
            },
            
            getStats: () => {
                return this.preferences.dashboardStats || this.getDefaultPreferences().dashboardStats;
            },
            
            updateStats: (newStats) => {
                if (!this.preferences.dashboardStats) {
                    this.preferences.dashboardStats = {};
                }
                
                Object.keys(newStats).forEach(key => {
                    this.preferences.dashboardStats[key] = newStats[key];
                });
                
                this.savePreferences();
                console.log('📊 Stats updated:', newStats);
            }
        };
        
        console.log('✅ Data management initialized');
    }

    initializeUI() {
        console.log('🔧 Initializing UI...');
        
        // 1. Create navigation
        this.createNavigation();
        
        // 2. Setup theme system
        this.setupThemeSystem();
        
        // 3. Setup event handlers
        this.setupEventHandlers();
        
        // 4. Show application
        this.showApplication();
        
        console.log('✅ UI initialized');
    }

    createNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            console.error('❌ App container not found');
            return;
        }

        // Remove existing header
        const existingHeader = appContainer.querySelector('header');
        if (existingHeader) existingHeader.remove();

        // Create new header
        const header = document.createElement('header');
        header.innerHTML = this.getNavigationHTML();
        appContainer.insertBefore(header, appContainer.firstChild);

        // Setup navigation functionality
        this.setupNavigationEvents();
        
        console.log('✅ Navigation created');
    }

    getNavigationHTML() {
        return `
            <nav class="top-nav">
                <div class="nav-brand">
                    <img src="icons/icon-96x96.png" alt="AgriMetrics" width="32" height="32">
                    <div class="brand-text-container">
                        <span class="brand-text">AgriMetrics</span>
                        <span class="brand-subtitle">Farm Management</span>
                    </div>
                </div>
                
                <div class="nav-items">
                    <button class="nav-item" data-view="dashboard" title="Dashboard">
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

                    <button class="nav-item" id="dark-mode-toggle" title="Toggle Dark Mode">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                    
                    <button class="nav-item" id="hamburger-menu" title="More Operations">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
        `;
    }

    setupNavigationEvents() {
        // Main navigation clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.hasAttribute('data-view')) {
                e.preventDefault();
                const view = navItem.getAttribute('data-view');
                this.showSection(view);
            }
        });

        // Hamburger menu
        this.setupHamburgerMenu();
        
        // Side menu items
        this.setupSideMenuEvents();
    }

    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (!hamburger || !sideMenu) {
            console.log('⚠️ Hamburger or side menu not found');
            return;
        }

        // Ensure proper initial state
        sideMenu.style.transform = 'translateX(100%)';
        sideMenu.classList.remove('active');

        // Hamburger click handler
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sideMenu.classList.toggle('active');
            console.log('🍔 Side menu toggled:', sideMenu.classList.contains('active'));
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (sideMenu.classList.contains('active') && 
                !sideMenu.contains(e.target) && 
                !hamburger.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        });

        console.log('✅ Hamburger menu setup complete');
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        sideMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    
                    // Close side menu
                    const sideMenu = document.getElementById('side-menu');
                    if (sideMenu) sideMenu.classList.remove('active');
                }
            });
        });
    }

    setupThemeSystem() {
        const toggle = document.getElementById('dark-mode-toggle');
        if (!toggle) return;

        // Load saved theme preference
        const savedTheme = this.userPreferences.theme || 'auto';
        this.applyTheme(savedTheme);

        // Toggle click handler
        toggle.addEventListener('click', () => {
            const currentTheme = this.userPreferences.theme || 'auto';
            let newTheme;
            
            if (currentTheme === 'auto') newTheme = 'dark';
            else if (currentTheme === 'dark') newTheme = 'light';
            else newTheme = 'auto';
            
            this.applyTheme(newTheme);
            FarmData.updatePreference('theme', newTheme);
        });

        // System theme change listener
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.userPreferences.theme === 'auto') {
                this.applyTheme('auto');
            }
        });

        console.log('✅ Theme system setup complete');
    }

    applyTheme(theme) {
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        document.body.classList.toggle('dark-mode', isDark);
        this.updateThemeIcon(isDark);
        
        console.log('🎨 Theme applied:', theme, '(dark mode:', isDark + ')');
    }

    updateThemeIcon(isDark) {
        const toggle = document.getElementById('dark-mode-toggle');
        if (!toggle) return;

        const icon = toggle.querySelector('span:first-child');
        const label = toggle.querySelector('.nav-label');
        
        if (isDark) {
            icon.textContent = '☀️';
            label.textContent = 'Light';
        } else {
            icon.textContent = '🌙';
            label.textContent = 'Dark';
        }
    }

    setupEventHandlers() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('🚨 Global error:', e.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('🚨 Unhandled promise rejection:', e.reason);
        });

        console.log('✅ Event handlers setup complete');
    }

    showApplication() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        console.log('🏠 Application shown');
    }

    async loadApplicationData() {
        console.log('📊 Loading application data...');
        
        // Load user preferences
        this.userPreferences = FarmData.loadPreferences();
        
        // Apply theme
        this.applyTheme(this.userPreferences.theme);
        
        // Initialize all modules
        if (window.FarmModules) {
            FarmModules.initializeAll();
        }
        
        // Show initial section
        this.showSection(this.currentSection);
        
        console.log('✅ Application data loaded');
    }

    showSection(sectionId) {
        console.log(`🔄 Showing section: ${sectionId}`);
        
        // Update navigation state
        this.updateNavigationState(sectionId);
        
        // Update current section
        this.currentSection = sectionId;
        
        // Load section content
        this.loadSectionContent(sectionId);
    }

    updateNavigationState(sectionId) {
        // Update top navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');

        // Update side menu
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) activeSideItem.classList.add('active');
    }

    loadSectionContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ Content area not found');
            return;
        }

        // Try to load via module system first
        if (window.FarmModules && FarmModules.initialize(sectionId)) {
            console.log(`✅ Section ${sectionId} loaded via module system`);
            return;
        }

        // Fallback content
        console.log(`⚠️ Using fallback content for ${sectionId}`);
        this.showFallbackContent(sectionId, contentArea);
    }

    showFallbackContent(sectionId, contentArea) {
        const sections = {
            'dashboard': { title: 'Dashboard', icon: '📊', description: 'Farm overview and analytics' },
            'income-expenses': { title: 'Income & Expenses', icon: '💰', description: 'Financial tracking' },
            'inventory-check': { title: 'Inventory', icon: '📦', description: 'Stock management' },
            'orders': { title: 'Orders', icon: '📋', description: 'Order management' },
            'sales-record': { title: 'Sales', icon: '🛒', description: 'Sales tracking' },
            'profile': { title: 'Profile', icon: '👤', description: 'Account settings' }
        };

        const section = sections[sectionId] || { title: sectionId, icon: '📄', description: 'Content section' };

        contentArea.innerHTML = `
            <div class="farm-module-container">
                <div class="farm-module-header">
                    <h1 style="color: white; margin: 0 0 8px 0;">${section.icon} ${section.title}</h1>
                    <p style="color: white; opacity: 0.9; margin: 0;">${section.description}</p>
                </div>
                
                <div style="padding: 40px 20px; text-align: center; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">${section.icon}</div>
                    <h3 style="color: #1a1a1a; margin-bottom: 8px;">Module Loading</h3>
                    <p>The ${section.title} module is being initialized...</p>
                    <p style="font-size: 14px; color: #999; margin-top: 20px;">
                        This is fallback content. The actual module should load shortly.
                    </p>
                </div>
            </div>
        `;
    }

    showErrorState() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 20px;">😵</div>
                    <h2 style="color: #dc2626; margin-bottom: 16px;">Application Error</h2>
                    <p style="color: #666; margin-bottom: 24px;">
                        Something went wrong while loading the application.
                    </p>
                    <button onclick="location.reload()" class="farm-btn farm-btn-primary">
                        Reload Application
                    </button>
                </div>
            `;
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
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                totalCustomers: 0,
                totalProducts: 0,
                monthlyRevenue: 0,
                monthlyOrders: 0,
                avgOrderValue: 0,
                completedOrders: 0,
                paidOrders: 0
            }
        };
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.farmApp = new FarmManagementApp();
});

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmManagementApp;
}
