// app.js - COMPLETE WORKING VERSION WITH PROFILE
console.log('🚀 Loading Farm Management App...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
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
        console.log('✅ Initializing app...');
        
        // ADD NAVBAR CSS FIRST - This makes it visible
        this.addNavbarCSS();
        
        // CRITICAL: Initialize StyleManager FIRST before any modules
        this.initializeStyleManager();
        
        // CRITICAL: Initialize FarmModules core system
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences - IMPORTANT: This creates ProfileModule
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Setup navigation and events
        this.createTopNavigation();
        
        // Setup interactions
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
    }

    addNavbarCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== ESSENTIAL NAVBAR STYLES ===== */
            .top-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 70px;
                background: white;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .nav-brand {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .nav-brand img {
                width: 40px;
                height: 40px;
                border-radius: 8px;
            }
            
            .brand-text {
                font-size: 22px;
                font-weight: 700;
                color: #2c3e50;
            }
            
            .brand-subtitle {
                font-size: 14px;
                color: #7f8c8d;
                margin-left: 10px;
            }
            
            .nav-items {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 60px;
                height: 60px;
                background: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                cursor: pointer;
                font-size: 20px;
                color: #34495e;
                padding: 0;
                transition: all 0.3s ease;
            }
            
            .nav-item:hover {
                background: white;
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .nav-item.active {
                background: #4CAF50;
                color: white;
                box-shadow: 0 5px 20px rgba(76, 175, 80, 0.3);
                border-color: #4CAF50;
            }
            
            .nav-label {
                font-size: 11px;
                font-weight: 600;
                margin-top: 4px;
            }
            
            /* Hamburger menu - make it visible! */
            .hamburger-menu {
                background: #4CAF50 !important;
                color: white !important;
                border: none !important;
            }
            
            /* Content area spacing */
            #content-area {
                margin-top: 80px;
                padding: 20px;
                min-height: calc(100vh - 80px);
            }
            
            /* ===== SIDEBAR STYLES ===== */
            #side-menu {
                position: fixed;
                top: 0;
                right: -300px;
                bottom: 0;
                width: 280px;
                background: white;
                border-left: 1px solid #e0e0e0;
                box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
                z-index: 999;
                transition: right 0.3s ease;
                overflow-y: auto;
                padding: 20px;
            }
            
            #side-menu.active {
                right: 0;
            }
            
            .side-menu-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                margin: 8px 0;
                border-radius: 10px;
                background: #f5f5f5;
                color: #34495e;
                text-decoration: none;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .side-menu-item:hover {
                background: #e0e0e0;
                transform: translateX(5px);
            }
            
            .side-menu-item.active {
                background: #4CAF50;
                color: white;
            }
            
            /* ===== MOBILE RESPONSIVE ===== */
            @media (max-width: 768px) {
                .top-nav {
                    height: 60px;
                    padding: 0 15px;
                }
                
                .nav-brand img {
                    width: 32px;
                    height: 32px;
                }
                
                .brand-text {
                    font-size: 18px;
                }
                
                .brand-subtitle {
                    display: none;
                }
                
                .nav-item {
                    width: 50px;
                    height: 50px;
                    font-size: 18px;
                }
                
                .nav-label {
                    font-size: 10px;
                }
                
                /* Hide some nav items on mobile, keep essential ones + hamburger */
                .nav-item[data-view="orders"],
                .nav-item[data-view="profile"] {
                    display: none;
                }
                
                #content-area {
                    margin-top: 70px;
                    padding: 15px;
                }
                
                /* Sidebar adjustments for mobile */
                #side-menu {
                    width: 250px;
                }
            }
            
            /* ===== DESKTOP STYLES ===== */
            @media (min-width: 769px) {
                #side-menu {
                    position: fixed;
                    left: 0;
                    right: auto;
                    top: 0;
                    width: 260px;
                    border-right: 1px solid #e0e0e0;
                    border-left: none;
                    box-shadow: 5px 0 30px rgba(0, 0, 0, 0.1);
                }
                
                #side-menu.active {
                    left: 0;
                    right: auto;
                }
                
                .hamburger-menu {
                    display: none !important;
                }
                
                #content-area {
                    margin-left: 260px;
                    margin-top: 0;
                }
            }
            
            /* Dark mode */
            .dark-mode .top-nav {
                background: #1a1a1a;
                border-color: #333;
            }
            
            .dark-mode .nav-item {
                background: #333;
                border-color: #444;
                color: #ccc;
            }
            
            .dark-mode .nav-item:hover {
                background: #444;
            }
            
            .dark-mode .nav-item.active {
                background: #2E7D32;
            }
            
            .dark-mode #side-menu {
                background: #1a1a1a;
                border-color: #333;
            }
            
            .dark-mode .side-menu-item {
                background: #333;
                color: #ccc;
            }
            
            .dark-mode .side-menu-item:hover {
                background: #444;
            }
            
            .dark-mode .side-menu-item.active {
                background: #2E7D32;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Navbar CSS added');
    }

    initializeStyleManager() {
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        } else {
            console.warn('⚠️ StyleManager not available');
        }
    }

    initializeFarmModules() {
        if (window.FarmModules) {
            console.log('🔧 FarmModules core ready');
        } else {
            // Create complete FarmModules like in CSS version
            window.FarmModules = {
                modules: {},
                appData: {
                    profile: {
                        farmName: 'My Farm',
                        dashboardStats: {},
                        lastUpdated: new Date().toISOString()
                    },
                    settings: {
                        currency: 'USD',
                        theme: 'auto',
                        autoSync: true
                    }
                },
                
                // Module registration system - IMPORTANT
                registerModule: function(name, module) {
                    console.log(`📦 Module registered: ${name}`);
                    this.modules[name] = module;
                    
                    // Auto-initialize if it's the current section
                    if (window.app && window.app.currentSection === name) {
                        setTimeout(() => {
                            if (module.initialize && typeof module.initialize === 'function') {
                                module.initialize();
                            }
                        }, 50);
                    }
                },
                
                getModule: function(name) {
                    return this.modules[name];
                },
                
                // For compatibility with CSS version
                loadModuleCSS: function(moduleName) {
                    console.log(`🎨 CSS requested for: ${moduleName}`);
                    // CSS is already loaded via addNavbarCSS
                }
            };
            console.log('🔧 FarmModules core created (CSS version style)');
        }
    }
    
    async loadUserPreferences() {
        try {
            // Try to use ProfileModule if available
            if (typeof ProfileModule !== 'undefined' && ProfileModule.loadUserPreferences) {
                this.userPreferences = ProfileModule.loadUserPreferences();
                console.log('✅ User preferences loaded via ProfileModule');
            } else {
                // Fallback to direct localStorage access - LIKE IN CSS VERSION
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
                console.log('⚠️ ProfileModule not available, using localStorage fallback');
                
                // Create a complete ProfileModule fallback - LIKE IN CSS VERSION
                this.createProfileModuleFallback();
            }
            
            // Apply theme preference immediately
            this.applyUserTheme();
            
        } catch (error) {
            console.error('❌ Error loading user preferences:', error);
            this.userPreferences = this.getDefaultPreferences();
            this.createProfileModuleFallback();
        }
    }

    getDefaultPreferences() {
        // SAME AS CSS VERSION
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

    createProfileModuleFallback() {
        // COMPLETE ProfileModule LIKE IN CSS VERSION
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
                    console.log('📊 Stats updated:', stats);
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
                
                // FOR DASHBOARD MODULE - IMPORTANT!
                getProfileStats: () => {
                    return this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats;
                },
                
                getBusinessOverview: () => {
                    const stats = this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats;
                    return {
                        totalOrders: stats.totalOrders || 0,
                        totalRevenue: stats.totalRevenue || 0,
                        pendingOrders: stats.pendingOrders || 0,
                        totalCustomers: stats.totalCustomers || 0,
                        totalProducts: stats.totalProducts || 0,
                        monthlyRevenue: stats.monthlyRevenue || 0,
                        monthlyOrders: stats.monthlyOrders || 0
                    };
                },
                
                // Initialize method for compatibility
                initialize: () => {
                    console.log('✅ ProfileModule fallback initialized');
                    return true;
                }
            };
            
            // ALSO add to FarmModules for easy access
            if (window.FarmModules) {
                window.FarmModules.registerModule('profile', window.ProfileModule);
            }
            
            console.log('✅ Complete ProfileModule created (CSS version style)');
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
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
            this.updateDarkModeIcon(prefersDark);
        }
        
        console.log('🎨 Applied user theme:', theme);
    }

    setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                
                const newTheme = isDarkMode ? 'dark' : 'light';
                this.userPreferences.theme = newTheme;
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                
                if (window.ProfileModule && window.ProfileModule.updatePreference) {
                    window.ProfileModule.updatePreference('theme', newTheme);
                }
                
                this.updateDarkModeIcon(isDarkMode);
                console.log('🎨 Theme changed to:', newTheme);
            });
        }
        
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
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                if (view) {
                    this.showSection(view);
                }
            }
            
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
        
        // Create new header - WITH PROFILE BUTTON
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        header.innerHTML = `
            <nav class="top-nav">
                <div class="nav-brand">
                    <img src="icons/icon-96x96.png" alt="AgriMetrics">
                    <span class="brand-text">AgriMetrics</span>
                    <span class="brand-subtitle">Farm Management System</span>
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

                    <!-- PROFILE BUTTON - WAS MISSING -->
                    <button class="nav-item" data-view="profile" title="Profile" id="profile-nav-button">
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

        console.log('✅ Top Navigation with Profile created');
    }
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            console.log('🍔 Found hamburger and side menu');
            
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hamburger clicked, toggling sidebar');
                sideMenu.classList.toggle('active');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    if (sideMenu.classList.contains('active') && 
                        !sideMenu.contains(e.target) && 
                        e.target !== hamburger && 
                        !hamburger.contains(e.target)) {
                        sideMenu.classList.remove('active');
                    }
                }
            });
            
            // Close with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
                    sideMenu.classList.remove('active');
                }
            });
        } else {
            console.log('❌ Hamburger or side menu not found:', { hamburger, sideMenu });
        }
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        const sideMenu = document.getElementById('side-menu');
        
        sideMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    console.log('Side menu clicked:', section);
                    this.showSection(section);
                    
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                        sideMenu.classList.remove('active');
                    }
                }
            });
        });
    }
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        this.currentSection = sectionId;
        
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

        // Load the module content
        if (window.FarmModules && window.FarmModules.modules[sectionId]) {
            const module = window.FarmModules.modules[sectionId];
            if (module.initialize && typeof module.initialize === 'function') {
                module.initialize();
            }
        } else {
            this.loadFallbackContent(sectionId);
        }
    }

    loadFallbackContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const sectionTitles = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory Check',
            'feed-record': 'Feed Record',
            'broiler-mortality': 'Broiler Mortality',
            'production': 'Production Records',
            'sales-record': 'Sales Record',
            'orders': 'Orders',
            'reports': 'Reports',
            'profile': 'Profile'
        };

        contentArea.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #1a1a1a;">${sectionTitles[sectionId] || sectionId}</h2>
                <p style="color: #666;">Content loading...</p>
                <p style="color: #999; font-size: 14px;">Module system not loaded yet</p>
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
