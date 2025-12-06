// app.js - SIDEBAR SLIDES FROM RIGHT ON HAMBURGER CLICK
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
        
        // Add mobile responsive CSS for sidebar from right
        this.addRightSidebarCSS();
        
        // Initialize modules
        this.initializeStyleManager();
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Create top navigation with hamburger
        this.createTopNavigation();
        
        // Setup hamburger menu to open sidebar from right
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
    }

    addRightSidebarCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== RIGHT SIDEBAR STYLES ===== */
            /* Mobile styles */
            @media (max-width: 767px) {
                /* Sidebar positioned on right, hidden by default */
                #side-menu {
                    position: fixed !important;
                    top: 0 !important;
                    right: -300px !important;
                    bottom: 0 !important;
                    width: 280px !important;
                    background: white !important;
                    box-shadow: -5px 0 30px rgba(0,0,0,0.2) !important;
                    border-left: 1px solid #e0e0e0 !important;
                    z-index: 1000 !important;
                    transition: right 0.3s ease !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                }
                
                /* Sidebar active - slides in from right */
                #side-menu.active {
                    right: 0 !important;
                }
                
                /* Overlay when sidebar is open */
                .sidebar-overlay {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: rgba(0,0,0,0.5) !important;
                    backdrop-filter: blur(2px) !important;
                    z-index: 999 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transition: all 0.3s ease !important;
                }
                
                .sidebar-overlay.active {
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                /* Make hamburger clearly visible */
                #hamburger-menu {
                    background: #4CAF50 !important;
                    border: none !important;
                    border-radius: 8px !important;
                    width: 44px !important;
                    height: 44px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    font-size: 20px !important;
                    color: white !important;
                    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3) !important;
                }
                
                #hamburger-menu:hover {
                    background: #2E7D32 !important;
                    transform: scale(1.05) !important;
                }
                
                /* Ensure hamburger shows on mobile */
                .hamburger-menu {
                    display: flex !important;
                }
                
                /* Adjust content area for mobile */
                #content-area {
                    padding: 16px !important;
                }
                
                /* Prevent body scroll when sidebar is open */
                body.sidebar-open {
                    overflow: hidden !important;
                }
            }
            
            /* Desktop styles - sidebar always visible on left */
            @media (min-width: 768px) {
                #side-menu {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    bottom: 0 !important;
                    width: 260px !important;
                    background: white !important;
                    border-right: 1px solid #e0e0e0 !important;
                    z-index: 100 !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                }
                
                /* Hide hamburger on desktop */
                .hamburger-menu {
                    display: none !important;
                }
                
                #content-area {
                    margin-left: 260px !important;
                    padding: 24px !important;
                }
                
                /* Hide overlay on desktop */
                .sidebar-overlay {
                    display: none !important;
                }
            }
            
            /* Sidebar menu item styles */
            .side-menu-item {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 12px 16px !important;
                margin: 4px 0 !important;
                border-radius: 8px !important;
                color: #333 !important;
                text-decoration: none !important;
                transition: all 0.2s ease !important;
                cursor: pointer !important;
            }
            
            .side-menu-item:hover {
                background: #f5f5f5 !important;
            }
            
            .side-menu-item.active {
                background: #4CAF50 !important;
                color: white !important;
            }
            
            .side-menu-item .menu-icon {
                font-size: 18px !important;
            }
            
            /* Dark mode support */
            .dark-mode #side-menu {
                background: #1a1a1a !important;
                border-color: #333 !important;
            }
            
            .dark-mode .side-menu-item {
                color: #ccc !important;
            }
            
            .dark-mode .side-menu-item:hover {
                background: #333 !important;
            }
            
            .dark-mode .side-menu-item.active {
                background: #2E7D32 !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Right sidebar CSS added');
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
            if (typeof FarmModules.initializeAll === 'function') {
                FarmModules.initializeAll();
                console.log('🔧 FarmModules initialized all modules');
            } else {
                console.log('🔧 FarmModules core ready');
            }
        } else {
            console.warn('⚠️ FarmModules core not available');
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
        }
    }
    
    async loadUserPreferences() {
        try {
            if (typeof ProfileModule !== 'undefined' && ProfileModule.loadUserPreferences) {
                this.userPreferences = ProfileModule.loadUserPreferences();
                console.log('✅ User preferences loaded via ProfileModule');
            } else {
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
                console.log('⚠️ ProfileModule not available, using localStorage fallback');
                this.createProfileModuleFallback();
            }
            
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
            businessName: 'My Farm'
        };
    }

    createProfileModuleFallback() {
        if (typeof ProfileModule === 'undefined') {
            window.ProfileModule = {
                userPreferences: this.userPreferences,
                loadUserPreferences: () => this.userPreferences,
                initialize: () => true
            };
            console.log('✅ ProfileModule fallback created');
        }
    }

    applyUserTheme() {
        const theme = this.userPreferences.theme || 'auto';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        }
    }

    setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                const newTheme = isDarkMode ? 'dark' : 'light';
                this.userPreferences.theme = newTheme;
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
            });
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
        });
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

        // Remove existing header if any
        let header = appContainer.querySelector('header');
        if (header) {
            header.remove();
        }
        
        // Create new header with hamburger on right
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
                    
                    <!-- Hamburger menu -->
                    <button class="nav-item hamburger-menu" id="hamburger-menu" title="More Options">
                        <span>☰</span>
                        <span class="nav-label">Menu</span>
                    </button>
                </div>
            </nav>
            
            <!-- Create sidebar overlay -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
        `;

        // Adjust main content padding
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '80px';
        }
        
        console.log('✅ Top Navigation with hamburger created');
    }
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        const overlay = document.getElementById('sidebar-overlay');
        const body = document.body;
        
        if (hamburger && sideMenu) {
            // Remove any existing event listeners
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            // Get the new hamburger reference
            const currentHamburger = document.getElementById('hamburger-menu');
            
            currentHamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🍔 Hamburger clicked - opening sidebar from right');
                
                // Toggle sidebar and overlay
                sideMenu.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
                body.classList.toggle('sidebar-open');
            });
            
            // Close sidebar when clicking overlay
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    sideMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    body.classList.remove('sidebar-open');
                });
            }
            
            // Close sidebar with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    sideMenu.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    body.classList.remove('sidebar-open');
                }
            });
            
            // Ensure sidebar starts hidden on mobile
            if (window.innerWidth < 768) {
                sideMenu.style.right = '-300px';
            }
            
            console.log('✅ Hamburger menu setup complete');
        } else {
            console.log('❌ Hamburger or side menu not found');
        }
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        const overlay = document.getElementById('sidebar-overlay');
        const sideMenu = document.getElementById('side-menu');
        const body = document.body;
        
        sideMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    console.log('📱 Side menu item clicked:', section);
                    this.showSection(section);
                    
                    // Close sidebar after selection on mobile
                    if (window.innerWidth < 768) {
                        sideMenu.classList.remove('active');
                        if (overlay) overlay.classList.remove('active');
                        body.classList.remove('sidebar-open');
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
