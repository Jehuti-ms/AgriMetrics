// app.js - SIMPLE JS-ONLY NAVBAR
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
        
        // Initialize FarmModules
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Create SIMPLE navbar - no containers
        this.createSimpleNavbar();
        
        // Setup events
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
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

    createSimpleNavbar() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        // Remove existing navbar if any
        const existingNav = appContainer.querySelector('.top-nav');
        if (existingNav) {
            existingNav.remove();
        }
        
        // Create simple navbar
        const navbar = document.createElement('nav');
        navbar.className = 'top-nav';
        navbar.innerHTML = `
            <div class="nav-brand">
                <div class="nav-logo">A</div>
                <span class="nav-title">AgriMetrics</span>
            </div>
            
            <div class="nav-buttons">
                <button class="nav-item" data-view="dashboard">📊 Dashboard</button>
                <button class="nav-item" data-view="income-expenses">💰 Income</button>
                <button class="nav-item" data-view="inventory-check">📦 Inventory</button>
                <button class="nav-item" data-view="orders">📋 Orders</button>
                <button class="nav-item" data-view="sales-record">🛒 Sales</button>
                <button class="nav-item" data-view="profile">👤 Profile</button>
                <button class="nav-item" id="dark-mode-toggle">🌙 Theme</button>
                <button class="nav-item hamburger" id="hamburger-menu">☰ More</button>
            </div>
        `;
        
        // Insert at top
        appContainer.insertBefore(navbar, appContainer.firstChild);
        
        console.log('✅ Simple navbar created');
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
