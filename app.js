// app.js - CLEAN WORKING SOLUTION
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
        
        // Add simple mobile CSS
        this.addSimpleMobileCSS();
        
        // Initialize modules
        this.initializeStyleManager();
        this.initializeFarmModules();
        
        this.isDemoMode = true;
        
        // Load user preferences
        await this.loadUserPreferences();
        
        // Show the app interface
        this.showApp();
        
        // Setup everything
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Load initial section
        this.showSection(this.currentSection);
        
        console.log('✅ App initialized successfully');
    }

    addSimpleMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Simple mobile fixes */
            @media (max-width: 767px) {
                /* Make hamburger visible and clickable */
                #hamburger-menu {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 40px !important;
                    height: 40px !important;
                    background: #4CAF50 !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 8px !important;
                    font-size: 20px !important;
                    cursor: pointer !important;
                    margin-left: 10px !important;
                }
                
                /* Hide sidebar by default on mobile */
                #side-menu {
                    position: fixed !important;
                    top: 0 !important;
                    right: -300px !important;
                    bottom: 0 !important;
                    width: 280px !important;
                    background: white !important;
                    box-shadow: -5px 0 15px rgba(0,0,0,0.1) !important;
                    z-index: 1000 !important;
                    transition: right 0.3s ease !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                }
                
                /* Show sidebar when active */
                #side-menu.active {
                    right: 0 !important;
                }
                
                /* Remove any overlay if it exists */
                .sidebar-overlay {
                    display: none !important;
                }
                
                /* Adjust content area */
                #content-area {
                    padding: 16px !important;
                }
            }
            
            /* Desktop - sidebar always visible */
            @media (min-width: 768px) {
                #side-menu {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    bottom: 0 !important;
                    width: 260px !important;
                    background: white !important;
                    z-index: 100 !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                }
                
                #hamburger-menu {
                    display: none !important;
                }
                
                #content-area {
                    margin-left: 260px !important;
                    padding: 24px !important;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Simple mobile CSS added');
    }

    initializeStyleManager() {
        if (window.StyleManager && typeof StyleManager.init === 'function') {
            StyleManager.init();
            console.log('🎨 StyleManager initialized');
        }
    }

    initializeFarmModules() {
        if (window.FarmModules) {
            console.log('🔧 FarmModules ready');
        } else {
            window.FarmModules = {
                modules: {},
                registerModule: function(name, module) {
                    console.log(`✅ Registering module: ${name}`);
                    this.modules[name] = module;
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
    
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        
        if (hamburger && sideMenu) {
            console.log('🍔 Found hamburger and side menu');
            
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hamburger clicked');
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
        
        // Update active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) {
            activeSideItem.classList.add('active');
        }

        // Load module
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
                <h2>${sectionTitles[sectionId] || sectionId}</h2>
                <p>Content loading...</p>
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
