// app.js
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting Farm Management App...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeApp();
                });
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async initializeApp() {
        try {
            // Check Firebase availability
            if (this.isFirebaseAvailable()) {
                console.log('✅ Firebase is available');
                this.setupAuthListener();
            } else {
                console.log('🔄 Running in demo mode');
                this.isDemoMode = true;
                this.setupDemoMode();
            }
            
            this.setupEventListeners();
            
            console.log('✅ Farm Management App initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.isDemoMode = true;
            this.setupDemoMode();
            this.setupEventListeners();
        }
    }

    isFirebaseAvailable() {
        return typeof firebase !== 'undefined' && 
               firebase.apps && 
               firebase.apps.length > 0 &&
               firebase.auth;
    }

    setupAuthListener() {
        if (!this.isFirebaseAvailable()) {
            this.setupDemoMode();
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadUserData();
            } else {
                this.currentUser = null;
                this.showAuth();
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.setupDemoMode();
        });
    }

    setupDemoMode() {
        console.log('🏠 Setting up demo mode');
        this.isDemoMode = true;
        this.showApp();
    }

    setupEventListeners() {
        // Listen for top navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                
                if (view === 'more') {
                    this.toggleMoreMenu();
                } else {
                    this.showSection(view);
                }
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    showAuth() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        // Add top navigation
        this.createTopNavigation();
        
        this.showSection(this.currentSection);
    }

    createTopNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        const existingNav = appContainer.querySelector('.top-nav');
        if (existingNav) existingNav.remove();

        // Get header element or create one
        let header = appContainer.querySelector('header');
        if (!header) {
            header = document.createElement('header');
            appContainer.insertBefore(header, appContainer.firstChild);
        }

        // STANDARD PWA: 4 primary navigation items at top
        const primaryNav = [
            { view: 'dashboard', label: 'Home', icon: this.dashboardIcon },
            { view: 'income-expenses', label: 'Finance', icon: this.moneyIcon },
            { view: 'inventory-check', label: 'Inventory', icon: this.inventoryIcon },
            { view: 'more', label: 'More', icon: this.moreIcon }
        ];

        // All other features in dropdown menu
        const secondaryNav = [
            { view: 'feed-record', label: 'Feed Record', icon: this.feedIcon },
            { view: 'broiler-mortality', label: 'Health', icon: this.healthIcon },
            { view: 'production', label: 'Production', icon: this.productionIcon },
            { view: 'sales-record', label: 'Sales', icon: this.salesIcon },
            { view: 'orders', label: 'Orders', icon: this.ordersIcon },
            { view: 'reports', label: 'Reports', icon: this.reportsIcon },
            { view: 'profile', label: 'Profile', icon: this.profileIcon }
        ];

        const navHTML = `
            <nav class="top-nav" style="${this.objectToStyleString(this.navStyle)}">
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">🌱</span>
                    <span style="font-weight: 600; font-size: 18px;">Farm Management</span>
                </div>
                
                <div class="nav-items" style="display: flex; align-items: center; gap: 8px;">
                    ${primaryNav.map(item => `
                        <button class="nav-item" data-view="${item.view}" style="${this.objectToStyleString(this.navItemStyle)}">
                            <div style="font-size: 18px; margin-right: 4px;">${item.icon}</div>
                            <span style="font-size: 14px; font-weight: 500;">${item.label}</span>
                        </button>
                    `).join('')}
                </div>
            </nav>

            <!-- Dropdown Menu -->
            <div id="more-menu" class="more-menu hidden" style="position: absolute; top: 70px; right: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 16px; z-index: 1001; min-width: 200px; border: 1px solid rgba(0,0,0,0.1);">
                <div class="more-menu-items" style="display: flex; flex-direction: column; gap: 8px;">
                    ${secondaryNav.map(item => `
                        <button class="more-menu-item" data-view="${item.view}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left;">
                            <div style="font-size: 18px; width: 24px;">${item.icon}</div>
                            <span style="font-size: 14px; font-weight: 500;">${item.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        header.innerHTML = navHTML;
        this.setupMoreMenu();
    }

    setupMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        const moreButton = document.querySelector('[data-view="more"]');

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#more-menu') && !e.target.closest('[data-view="more"]')) {
                this.hideMoreMenu();
            }
        });

        // Handle more menu item clicks
        document.querySelectorAll('.more-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.hideMoreMenu();
                this.showSection(view);
            });
        });
    }

    toggleMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu.classList.contains('hidden')) {
            moreMenu.classList.remove('hidden');
        } else {
            moreMenu.classList.add('hidden');
        }
    }

    hideMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        moreMenu.classList.add('hidden');
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.backgroundColor = '';
            item.style.color = '#666';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            activeNavItem.style.color = '#3b82f6';
        }

        this.currentSection = sectionId;
        
        // Load the module - MAKE SURE THIS WORKS
        if (window.FarmModules && typeof window.FarmModules.initializeModule === 'function') {
            console.log(`📦 Loading module: ${sectionId}`);
            window.FarmModules.initializeModule(sectionId);
        } else {
            console.log(`⚠️ FarmModules not available, loading fallback for: ${sectionId}`);
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
            <div style="padding: 20px; text-align: center;">
                <h2>${sectionTitles[sectionId] || sectionId}</h2>
                <p>This section is loading...</p>
                <p><small>If this doesn't load, check the browser console for errors.</small></p>
            </div>
        `;
    }

    // Navigation styles for TOP navigation
    navStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        height: '60px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000
    };

    navItemStyle = {
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        color: '#666'
    };

    // Icons
    dashboardIcon = '📊';
    moneyIcon = '💰';
    inventoryIcon = '📦';
    moreIcon = '⋮';
    feedIcon = '🌾';
    healthIcon = '🐔';
    productionIcon = '🚜';
    salesIcon = '💰';
    ordersIcon = '📋';
    reportsIcon = '📈';
    profileIcon = '👤';

    objectToStyleString(styleObj) {
        return Object.entries(styleObj)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }

    async loadUserData() {
        if (this.isDemoMode || !firebase.firestore || !this.currentUser) return;

        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data loaded:', userData);
                
                if (window.FarmModules) {
                    window.FarmModules.updateAppData({
                        user: userData,
                        farmName: userData.farmName,
                    });
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async logout() {
        try {
            if (firebase.auth) {
                await firebase.auth().signOut();
            }
            if (window.coreModule) {
                window.coreModule.showNotification('Logged out successfully', 'success');
            }
        } catch (error) {
            console.error('Error signing out:', error);
            if (window.coreModule) {
                window.coreModule.showNotification('Error signing out', 'error');
            }
        }
    }
}

// Initialize the app
window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
