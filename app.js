// app.js - FIXED FOR MOBILE VISIBILITY
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
        this.init();
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
        
        // Add mobile responsive CSS FIRST
        this.addMobileCSS();
        
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
                console.log('🔍 Debug - Hamburger position:', hamburger.getBoundingClientRect());
                console.log('🔍 Debug - Hamburger computed styles:', window.getComputedStyle(hamburger).display);
            }
        }, 100);
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
    }

    addMobileCSS() {
        // Add mobile-specific CSS for better visibility
        const style = document.createElement('style');
        style.textContent = `
            /* ===== MOBILE RESPONSIVE STYLES ===== */
            @media (max-width: 768px) {
                /* Make hamburger menu clearly visible */
                #hamburger-menu {
                    background: linear-gradient(135deg, #4CAF50, #2E7D32) !important;
                    border: 2px solid white !important;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4) !important;
                    border-radius: 12px !important;
                    width: 50px !important;
                    height: 50px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: fixed !important;
                    bottom: 20px !important;
                    right: 20px !important;
                    z-index: 9999 !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                }
                
                #hamburger-menu:hover {
                    transform: scale(1.1) !important;
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6) !important;
                }
                
                #hamburger-menu span {
                    font-size: 24px !important;
                    color: white !important;
                    font-weight: bold !important;
                }
                
                #hamburger-menu .nav-label {
                    display: none !important;
                }
                
                /* Make nav items more visible on mobile */
                .nav-item {
                    min-width: 50px !important;
                    min-height: 50px !important;
                    margin: 5px !important;
                    padding: 10px !important;
                    border-radius: 10px !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                }
                
                .nav-item span:first-child {
                    font-size: 20px !important;
                }
                
                .nav-label {
                    font-size: 10px !important;
                    font-weight: 600 !important;
                }
                
                /* Adjust top nav for mobile */
                .top-nav {
                    padding: 10px 15px !important;
                    height: 60px !important;
                }
                
                .nav-brand {
                    gap: 8px !important;
                }
                
                .nav-brand img {
                    width: 30px !important;
                    height: 30px !important;
                }
                
                .brand-text {
                    font-size: 18px !important;
                }
                
                .brand-subtitle {
                    display: none !important;
                }
                
                /* Adjust side menu for mobile */
                #side-menu {
                    width: 280px !important;
                    background: linear-gradient(135deg, #ffffff, #f5f5f5) !important;
                    backdrop-filter: blur(20px) !important;
                    box-shadow: -5px 0 30px rgba(0,0,0,0.2) !important;
                    border-left: 1px solid rgba(0,0,0,0.1) !important;
                    z-index: 9998 !important;
                }
                
                #side-menu.active {
                    transform: translateX(0) !important;
                }
                
                /* Make sidebar overlay more visible */
                .sidebar-overlay {
                    background: rgba(0,0,0,0.5) !important;
                    backdrop-filter: blur(5px) !important;
                }
            }
            
            /* For very small screens */
            @media (max-width: 480px) {
                .nav-items {
                    gap: 5px !important;
                }
                
                .nav-item {
                    min-width: 40px !important;
                    min-height: 40px !important;
                    padding: 8px !important;
                }
                
                .nav-item span:first-child {
                    font-size: 18px !important;
                }
                
                #side-menu {
                    width: 85vw !important;
                }
            }
            
            /* Sidebar overlay */
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0);
                backdrop-filter: blur(0);
                z-index: 9997;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .sidebar-overlay.active {
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(style);
        console.log('📱 Mobile CSS added');
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
            
            // Close sidebar when clicking on overlay
            if (e.target.classList.contains('sidebar-overlay')) {
                const sideMenu = document.getElementById('side-menu');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sideMenu) sideMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });
        
        // Close sidebar with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sideMenu = document.getElementById('side-menu');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sideMenu) sideMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
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

                    <button class="nav-item" data-view="profile" title="Profile">
                        <span>👤</span>
                        <span class="nav-label">Profile</span>
                    </button>

                    <!-- Dark Mode Toggle -->
                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Toggle Dark Mode">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                    
                    <!-- Hamburger menu as a proper nav-item -->
                    <button class="nav-item hamburger-menu" id="hamburger-menu" title="Farm Operations">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
            
            <!-- Create sidebar overlay -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
        `;

        // Setup hamburger menu functionality
        this.setupHamburgerMenu();
        
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
        const overlay = document.getElementById('sidebar-overlay');
        
        if (hamburger && sideMenu) {
            // Remove any existing event listeners to prevent duplicates
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            // Get the new hamburger reference
            const currentHamburger = document.getElementById('hamburger-menu');
            
            currentHamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🍔 Hamburger clicked, toggling sidebar');
                sideMenu.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });
            
            console.log('✅ Hamburger menu connected to sidebar');
            
            // Ensure sidebar is visible on mobile
            this.fixSidebarVisibility();
        } else {
            console.log('❌ Hamburger or side menu not found:', { hamburger, sideMenu });
        }
    }
    
    fixSidebarVisibility() {
        const sideMenu = document.getElementById('side-menu');
        if (!sideMenu) return;
        
        // Make sure sidebar has proper styles
        sideMenu.style.position = 'fixed';
        sideMenu.style.top = '0';
        sideMenu.style.bottom = '0';
        sideMenu.style.right = '0';
        sideMenu.style.width = '300px';
        sideMenu.style.background = 'linear-gradient(135deg, #ffffff, #f5f5f5)';
        sideMenu.style.backdropFilter = 'blur(20px)';
        sideMenu.style.boxShadow = '-5px 0 30px rgba(0,0,0,0.2)';
        sideMenu.style.borderLeft = '1px solid rgba(0,0,0,0.1)';
        sideMenu.style.zIndex = '9998';
        sideMenu.style.transform = 'translateX(100%)';
        sideMenu.style.transition = 'transform 0.3s ease';
        sideMenu.style.overflowY = 'auto';
        sideMenu.style.paddingTop = '20px';
        
        // Make sure it's hidden by default
        sideMenu.classList.remove('active');
        
        console.log('✅ Sidebar visibility fixed');
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        const overlay = document.getElementById('sidebar-overlay');
        
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
                    if (overlay) {
                        overlay.classList.remove('active');
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
