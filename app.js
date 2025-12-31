// app.js - FIXED FARM MODULES INITIALIZATION
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        console.log('🏗️ FarmManagementApp constructor');
        
        // SIMPLE CHECK: Did user just logout?
        const urlParams = new URLSearchParams(window.location.search);
        const hasLogoutParam = urlParams.has('logout');
        
        if (hasLogoutParam) {
            console.log('🚫 Logout parameter detected - clearing it');
            // IMMEDIATELY clear the parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
            // Show auth screen but ALLOW login
            this.showAuthScreen();
            
            // BUT STILL initialize the app so login can work!
            this.currentUser = null;
            this.currentSection = 'dashboard';
            this.isDemoMode = false;
            this.userPreferences = {};
            this.init();
            return;
        }
        
        // Normal initialization
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
        this.init();
    }
    
    showAuthScreen() {
        // Show auth, hide app (but app can still initialize)
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.style.display = 'block';
            authContainer.classList.remove('hidden');
        }
        if (appContainer) {
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
    }
    
    // ADD showApp() as a SEPARATE method
    showApp() {
        console.log('🏠 showApp() called');
        
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.classList.add('hidden');
            authContainer.style.display = 'none';
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.style.display = 'block';
        }
        
        console.log('✅ App shown successfully');
    }
    
    async init() {
        console.log('🚀 Starting Farm Management App...');
        
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
        
        // CRITICAL: Initialize StyleManager FIRST before any modules
        this.initializeStyleManager();
        
        // CRITICAL: Initialize FarmModules core system
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Setup navigation and events
        this.createTopNavigation();
        
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupSideMenuEvents();
            this.setupEventListeners();
            this.setupDarkMode();

            // Test if hamburger is working
            const hamburger = document.getElementById('hamburger-menu');
            const sideMenu = document.getElementById('side-menu');
            console.log('🔍 Debug - Hamburger exists:', !!hamburger);
            console.log('🔍 Debug - Side menu exists:', !!sideMenu);
            
            if (hamburger) {
                console.log('🔍 Debug - Hamburger classes:', hamburger.className);
                console.log('🔍 Debug - Hamburger styles:', window.getComputedStyle(hamburger));
            }
        }, 100);
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
    }

    initializeStyleManager() {
        // Initialize StyleManager IMMEDIATELY when app starts
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        } else {
            console.warn('⚠️ StyleManager not available - modules may not style properly');
        }
    }

    initializeFarmModules() {
        // FIXED: Check if FarmModules exists and initialize all modules
        if (window.FarmModules) {
            // Check if initializeAll method exists (for newer versions)
            if (typeof FarmModules.initializeAll === 'function') {
                FarmModules.initializeAll();
                console.log('🔧 FarmModules initialized all modules');
            } 
            // If no initializeAll method, just log that modules are ready
            else {
                console.log('🔧 FarmModules core ready - modules can register');
            }
        } else {
            console.warn('⚠️ FarmModules core not available');
            
            // Create a basic FarmModules if it doesn't exist
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    console.log(`✅ Registering module: ${name}`);
                    this.modules[name] = module;
                },
                getModule: function(name) {
                    return this.modules[name];
                }
            };
            console.log('🔧 Created basic FarmModules fallback');
        }
    }
    
    async loadUserPreferences() {
        try {
            // Try to use ProfileModule if available
            if (typeof ProfileModule !== 'undefined' && ProfileModule.loadUserPreferences) {
                this.userPreferences = ProfileModule.loadUserPreferences();
                console.log('✅ User preferences loaded via ProfileModule');
            } else {
                // Fallback to direct localStorage access
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
                console.log('⚠️ ProfileModule not available, using localStorage fallback');
                
                // Create a complete ProfileModule fallback for other modules to use
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
        // Create a complete ProfileModule with all methods modules expect
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
                
                // Stats methods that modules expect
                updateBusinessStats: (module, stats) => {
                    if (!this.userPreferences.dashboardStats) {
                        this.userPreferences.dashboardStats = {};
                    }
                    Object.keys(stats).forEach(key => {
                        this.userPreferences.dashboardStats[key] = stats[key];
                    });
                    localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                    console.log('📊 Stats updated for', module + ':', stats);
                },
                
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
                
                // Dashboard module expects this method
                getProfileData: () => {
                    return {
                        farmName: this.userPreferences.businessName || 'My Farm',
                        farmerName: 'Farm Manager',
                        stats: this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats
                    };
                },
                
                getProfileStats: () => {
                    return this.userPreferences.dashboardStats || this.getDefaultPreferences().dashboardStats;
                },
                
                // For compatibility with existing modules
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
            
            window.profileInstance = window.ProfileModule;
            console.log('✅ Complete ProfileModule fallback created');
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
        
        console.log('🎨 Applied user theme:', theme);
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
                
                // Update ProfileModule if available
                if (window.ProfileModule && window.ProfileModule.updatePreference) {
                    window.ProfileModule.updatePreference('theme', newTheme);
                }
                
                // Update icon
                this.updateDarkModeIcon(isDarkMode);
                
                console.log('🎨 Theme changed to:', newTheme);
            });
        }
        
        // Listen for system theme changes (only if theme is set to auto)
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
            
            // Handle sidebar menu items (for the existing HTML sidebar)
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
                    <img src="icons/icon-96x96_a.png" alt="AgriMetrics">
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
            main.style.paddingTop = '80px';
        }
        
        console.log('✅ Top Navigation created');
    }
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            // Ensure sidebar is hidden by default
            sideMenu.style.left = 'auto';
            sideMenu.style.right = '0';
            sideMenu.style.transform = 'translateX(100%)';
            sideMenu.classList.remove('active');
            
            // Remove any existing event listeners to prevent duplicates
            hamburger.replaceWith(hamburger.cloneNode(true));
            const newHamburger = document.getElementById('hamburger-menu');
            
            newHamburger.addEventListener('click', (e) => {
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
                    console.log('📱 Side menu item clicked:', section);
                    this.showSection(section);
                    
                    // Close sidebar after selection
                    const sideMenu = document.getElementById('side-menu');
                    if (sideMenu) {
                        sideMenu.classList.remove('active');
                    }
                }
            });
        });
        
        console.log('✅ Side menu events setup');
    }
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active nav state for top navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update active state for sidebar items
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) {
            activeSideItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load the module content
        if (window.FarmModules && typeof window.FarmModules.initializeModule === 'function') {
            window.FarmModules.initializeModule(sectionId);
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
