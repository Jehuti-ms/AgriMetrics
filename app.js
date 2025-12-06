// app.js - Unified Version (Working Navbar + Sidebar + Fixed Initialization)
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
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('✅ Initializing unified app...');

        this.initializeStyleManager();
        this.initializeFarmModules();

        this.isDemoMode = true;
        await this.loadUserPreferences();
        this.showApp();
        this.createTopNavigation();

        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupSideMenuEvents();
            this.setupEventListeners();
            this.setupDarkMode();
        }, 100);

        this.showSection(this.currentSection);
        console.log('✅ App initialized successfully');
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
            console.log('🔧 FarmModules core created');
        } else {
            console.log('🔧 FarmModules core ready');
        }
    }

    async loadUserPreferences() {
        try {
            const savedPrefs = localStorage.getItem('farm-user-preferences');
            this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
            this.applyUserTheme();
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            this.userPreferences = this.getDefaultPreferences();
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
            dashboardStats: {}
        };
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
    }

    setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                this.userPreferences.theme = isDarkMode ? 'dark' : 'light';
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
                this.updateDarkModeIcon(isDarkMode);
            });
        }
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

        let header = appContainer.querySelector('header');
        if (header) header.remove();

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
                    <button class="nav-item" data-view="dashboard"><span>📊</span><span class="nav-label">Dashboard</span></button>
                    <button class="nav-item" data-view="income-expenses"><span>💰</span><span class="nav-label">Income</span></button>
                    <button class="nav-item" data-view="inventory-check"><span>📦</span><span class="nav-label">Inventory</span></button>
                    <button class="nav-item" data-view="orders"><span>📋</span><span class="nav-label">Orders</span></button>
                    <button class="nav-item" data-view="sales-record"><span>🛒</span><span class="nav-label">Sales</span></button>
                    <button class="nav-item" data-view="profile"><span>👤</span><span class="nav-label">Profile</span></button>
                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle"><span>🌙</span><span class="nav-label">Theme</span></button>
                    <button class="nav-item hamburger-menu" id="hamburger-menu"><span>☰</span><span class="nav-label">More</span></button>
                </div>
            </nav>
        `;

        const main = appContainer.querySelector('main');
        if (main) main.style.paddingTop = '80px';

        console.log('✅ Top Navigation created');
    }

    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        if (hamburger && sideMenu) {
            sideMenu.style.right = '0';
            sideMenu.style.transform = 'translateX(100%)';
            sideMenu.classList.remove('active');

            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                sideMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (sideMenu.classList.contains('active') && !sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    sideMenu.classList.remove('active');
                }
            });
        }
    }

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        sideMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                if (section) this.showSection(section);
                const sideMenu = document.getElementById('side-menu');
                if (sideMenu) sideMenu.classList.remove('active');
            });
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const view = navItem.getAttribute('data-view');
                if (view) this.showSection(view);
            }
        });
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        this.currentSection = sectionId;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');

        document.querySelectorAll('.side-menu-item').forEach(item => item.classList.remove('active'));
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) activeSideItem.classList.add('active');

        const module = window.FarmModules?.modules[sectionId];
        if (module && typeof module.initialize === 'function') {
            module.initialize();
            console.log(`✅ Module initialized: ${sectionId}`);
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
