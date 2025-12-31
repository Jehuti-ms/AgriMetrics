// app.js - FIXED FARM MODULES INITIALIZATION
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.userPreferences = {};
       /* this.init(); */
        this.setupInit();
    }

     setupInit() {
        // Wait for DOM and Firebase to be ready
        const checkReady = () => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                this.initializeApp();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkReady);
        } else {
            checkReady();
        }
    }
    
    async initializeApp() {
    console.log('✅ Initializing app...');
    
    // Show loading immediately
    this.showLoading();
    
    // Check auth state
    const isAuthenticated = await this.checkAuthState();
    
    // If not authenticated, stop here (auth screen already shown)
    if (!isAuthenticated) {
        this.hideLoading();
        console.log('⏸️ App initialization stopped - user not authenticated');
        return;
    }
    
    // User is authenticated - continue with app initialization
    console.log('🚀 User authenticated, continuing app initialization...');
    
    // CRITICAL: Initialize StyleManager FIRST before any modules
    this.initializeStyleManager();
    
    // CRITICAL: Initialize FarmModules core system
    this.initializeFarmModules();
    
    this.isDemoMode = true;
    
    // Load user preferences
    await this.loadUserPreferences();
    
    // Setup navigation and events
    this.createTopNavigation();
    
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Load initial section
        this.showSection(this.currentSection);
        
        this.hideLoading();
        console.log('✅ App initialized successfully');
    }, 100);
}

// Update checkAuthState to return boolean
async checkAuthState() {
    console.log('🔐 Checking authentication state...');
    
    return new Promise((resolve) => {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⚠️ Firebase not available');
            this.hideLoading();
            this.showAuth();
            resolve(false);
            return;
        }
        
        let authResolved = false;
        
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            console.log('🔥 Auth state changed:', user ? 'User logged in' : 'No user');
            
            if (!authResolved) {
                authResolved = true;
                this.hideLoading();
                
                if (user) {
                    console.log('👤 User authenticated:', user.email);
                    this.currentUser = user;
                    this.showApp();
                    resolve(true);
                } else {
                    // Check local data
                    const hasLocalProfile = localStorage.getItem('farm-profile') || 
                                           localStorage.getItem('profileData');
                    
                    if (hasLocalProfile) {
                        console.log('💾 Using local profile data');
                        this.showApp();
                        resolve(true);
                    } else {
                        console.log('🔒 Showing login screen');
                        this.showAuth();
                        resolve(false);
                    }
                }
                
                unsubscribe();
            }
        });
        
        // 5 second timeout
        setTimeout(() => {
            if (!authResolved) {
                console.log('⏰ Auth check timeout');
                authResolved = true;
                this.hideLoading();
                unsubscribe();
                
                const user = firebase.auth().currentUser;
                const hasLocalProfile = localStorage.getItem('farm-profile') || 
                                       localStorage.getItem('profileData');
                
                if (user || hasLocalProfile) {
                    console.log('✅ Found user after timeout');
                    this.currentUser = user;
                    this.showApp();
                    resolve(true);
                } else {
                    console.log('❌ No user found after timeout');
                    this.showAuth();
                    resolve(false);
                }
            }
        }, 5000);
    });
}

// Add showLoading and hideLoading methods if not exist
showLoading() {
    console.log('⏳ Showing loading screen');
    // Create loading screen if it doesn't exist
    if (!document.getElementById('app-loading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'app-loading';
        loadingDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <div style="color: #666; font-size: 16px;">Loading Farm Manager...</div>
            </div>
        `;
        document.body.appendChild(loadingDiv);
        
        // Add animation style
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        document.getElementById('app-loading').style.display = 'flex';
    }
}

hideLoading() {
    const loadingDiv = document.getElementById('app-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
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
    
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error('❌ Content area not found');
        return;
    }
    
    // Remove .js extension if present
    const cleanSectionId = sectionId.replace('.js', '');
    
    // Update current section
    this.currentSection = cleanSectionId;
    
    // Update active menu item
    this.setActiveMenuItem(cleanSectionId);
    
    // Try to render the module
    if (FarmModules && FarmModules.renderModule) {
        const success = FarmModules.renderModule(cleanSectionId, contentArea);
        if (!success) {
            // Try with .js extension
            FarmModules.renderModule(sectionId, contentArea);
        }
    } else {
        console.error('❌ FarmModules.renderModule not available');
        contentArea.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>Module System Error</h3>
                <p>Cannot load module: ${cleanSectionId}</p>
                <button onclick="location.reload()">Reload App</button>
            </div>
        `;
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
