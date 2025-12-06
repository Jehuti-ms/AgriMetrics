// app.js - USING YOUR WORKING CODE
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
        
        // Add the CSS for horizontal navbar
        this.addNavbarCSS();
        
        // Initialize FarmModules
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Create navigation - USING YOUR WORKING CODE
        this.createTopNavigation();
        
        // Setup hamburger menu - USING YOUR WORKING CODE
        this.setupHamburgerMenu();
        
        // Setup other events
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
            /* HORIZONTAL NAVBAR STYLES */
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
                flex-shrink: 0;
            }
            
            .nav-brand img {
                width: 40px;
                height: 40px;
                border-radius: 8px;
            }
            
            .brand-text {
                font-size: 22px;
                font-weight: bold;
                color: #333;
                white-space: nowrap;
            }
            
            .brand-subtitle {
                font-size: 14px;
                color: #666;
                margin-left: 10px;
                white-space: nowrap;
            }
            
            .nav-items {
                display: flex;
                align-items: center;
                gap: 8px;
                overflow-x: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
                padding: 0 10px;
            }
            
            .nav-items::-webkit-scrollbar {
                display: none;
            }
            
            /* HORIZONTAL NAV ITEMS */
            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 60px;
                height: 60px;
                background: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                cursor: pointer;
                font-size: 20px;
                color: #333;
                padding: 0;
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin: 0 2px;
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
            
            .nav-item span {
                display: block;
                line-height: 1;
            }
            
            .nav-item .nav-label {
                font-size: 11px;
                font-weight: 600;
                margin-top: 4px;
                color: #333;
            }
            
            .nav-item.active .nav-label {
                color: white !important;
            }
            
            .hamburger-menu {
                background: #4CAF50 !important;
                color: white !important;
                border: none !important;
            }
            
            /* SIDEBAR - Slides from right */
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
                padding-top: 80px;
            }
            
            #side-menu.active {
                right: 0;
            }
            
            /* CONTENT AREA */
            #content-area {
                margin-top: 80px;
                padding: 20px;
                min-height: calc(100vh - 80px);
            }
            
            /* MOBILE */
            @media (max-width: 768px) {
                .top-nav {
                    height: 60px;
                    padding: 0 15px;
                }
                
                .brand-subtitle {
                    display: none;
                }
                
                .nav-item {
                    min-width: 50px;
                    height: 50px;
                    font-size: 18px;
                }
                
                .nav-item .nav-label {
                    font-size: 10px;
                }
                
                #content-area {
                    margin-top: 70px;
                    padding: 15px;
                }
                
                #side-menu {
                    width: 250px;
                    padding-top: 70px;
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
            
            .dark-mode .nav-item .nav-label {
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
        `;
        document.head.appendChild(style);
        console.log('✅ Horizontal navbar CSS added');
    }

    initializeFarmModules() {
        if (!window.FarmModules) {
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    console.log(`📦 Module registered: ${name}`);
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
            const savedPrefs = localStorage.getItem('farm-user-preferences');
            this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : { theme: 'auto' };
        } catch (error) {
            this.userPreferences = { theme: 'auto' };
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
    }

    // YOUR WORKING CODE - KEEP THIS EXACTLY
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

        // Load the module
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
