// app.js - Updated with better auth handling
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.userPreferences = {};
        this.authInitialized = false;
        this.setupInit();
    }

    setupInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    async initializeApp() {
        console.log('✅ Initializing app...');
        
        // Show loading screen
        this.showLoading();
        
        // Setup Firebase auth listener FIRST
        await this.setupAuthListener();
        
        // Check if user is already authenticated
        this.checkInitialAuth();
    }
    
    async setupAuthListener() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⏳ Waiting for Firebase...');
            setTimeout(() => this.setupAuthListener(), 100);
            return;
        }
        
        // Setup auth state listener
        firebase.auth().onAuthStateChanged((user) => {
            console.log('🔥 Auth state changed:', user ? `User: ${user.email}` : 'No user');
            
            if (user) {
                this.handleUserAuthenticated(user);
            } else {
                this.handleNoUser();
            }
        });
    }
    
    checkInitialAuth() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) {
                console.log('👤 User already signed in:', user.email);
                this.handleUserAuthenticated(user);
            } else {
                console.log('🔒 No user found initially');
                // Give auth listener time to fire
                setTimeout(() => {
                    if (!this.authInitialized) {
                        this.handleNoUser();
                    }
                }, 1000);
            }
        }
    }
    
    handleUserAuthenticated(user) {
        console.log('🎉 User authenticated, showing app...');
        this.currentUser = user;
        this.authInitialized = true;
        
        // Store user info
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userAuthenticated', 'true');
        
        // Show app
        this.showApp();
        
        // Initialize app components
        this.initializeAppComponents();
    }
    
    async initializeAppComponents() {
        console.log('🚀 Initializing app components...');
        
        // Initialize modules
        this.initializeStyleManager();
        this.initializeFarmModules();
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Setup UI
        this.createTopNavigation();
        
        setTimeout(() => {
            this.setupHamburgerMenu();
            this.setupSideMenuEvents();
            this.setupEventListeners();
            this.setupDarkMode();
            this.showSection(this.currentSection);
            this.hideLoading();
            console.log('✅ App fully initialized');
        }, 100);
    }
    
    handleNoUser() {
        console.log('🔒 No user found, showing auth screen');
        this.authInitialized = true;
        this.showAuth();
        this.hideLoading();
    }

    showLoading() {
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
                    <div style="color: #666; font-size: 16px;">Loading AgriMetrics...</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);
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
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        }
    }

    initializeFarmModules() {
        if (window.FarmModules) {
            console.log('🔧 FarmModules core ready');
        } else {
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    this.modules[name] = module;
                }
            };
        }
    }
    
    async loadUserPreferences() {
        try {
            const savedPrefs = localStorage.getItem('farm-user-preferences');
            this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
            this.applyUserTheme();
        } catch (error) {
            this.userPreferences = this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'auto',
            businessName: 'My Farm',
            businessType: 'poultry'
        };
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
                this.userPreferences.theme = isDarkMode ? 'dark' : 'light';
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
            });
        }
    }
  
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                if (view) this.showSection(view);
            }
            
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                if (section) this.showSection(section);
            }
        });
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.style.display = 'none';
        if (appContainer) {
            appContainer.style.display = 'block';
            appContainer.classList.remove('hidden');
        }
        
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

                    <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Toggle Dark Mode">
                        <span>🌙</span>
                        <span class="nav-label">Theme</span>
                    </button>
                    
                    <button class="nav-item hamburger-menu" id="hamburger-menu" title="Farm Operations">
                        <span>☰</span>
                        <span class="nav-label">More</span>
                    </button>
                </div>
            </nav>
        `;
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
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const cleanSectionId = sectionId.replace('.js', '');
        this.currentSection = cleanSectionId;
        this.setActiveMenuItem(cleanSectionId);
        
        contentArea.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p>Loading ${cleanSectionId}...</p>
            </div>
        `;
        
        setTimeout(() => {
            if (FarmModules && FarmModules.renderModule) {
                FarmModules.renderModule(cleanSectionId, contentArea);
            } else {
                this.loadFallbackContent(cleanSectionId);
            }
        }, 100);
    }
    
    setActiveMenuItem(sectionId) {
        document.querySelectorAll('.nav-item, .side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
        
        const activeSideMenuItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideMenuItem) activeSideMenuItem.classList.add('active');
    }
    
    showAuth() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) {
            authContainer.style.display = 'block';
        }
        if (appContainer) {
            appContainer.style.display = 'none';
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
window.app = new FarmManagementApp();
