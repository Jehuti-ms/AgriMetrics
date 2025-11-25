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
        // Listen for bottom navigation clicks
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
        
        // Add bottom navigation
        this.createBottomNavigation();
        
        this.showSection(this.currentSection);
    }

    createBottomNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        const existingNav = appContainer.querySelector('.bottom-nav');
        if (existingNav) existingNav.remove();

        // STANDARD PWA: 4 primary navigation items
        const primaryNav = [
            { view: 'dashboard', label: 'Home', icon: this.dashboardIcon },
            { view: 'income-expenses', label: 'Finance', icon: this.moneyIcon },
            { view: 'inventory-check', label: 'Inventory', icon: this.inventoryIcon },
            { view: 'more', label: 'More', icon: this.moreIcon }
        ];

        // All other features in secondary menu
        const secondaryNav = [
            { view: 'feed-record', label: 'Feed Record', icon: this.feedIcon },
            { view: 'broiler-mortality', label: 'Health', icon: this.healthIcon },
            { view: 'production', label: 'Production', icon: this.productionIcon },
            { view: 'sales-record', label: 'Sales', icon: this.salesIcon },
            { view: 'orders', label: 'Orders', icon: this.ordersIcon },
            { view: 'reports', label: 'Reports', icon: this.reportsIcon },
            { view: 'profile', label: 'Profile', icon: this.profileIcon }
        ];

        let navHTML = `
            <div class="bottom-nav" style="${this.objectToStyleString(this.navStyle)}">
        `;

        primaryNav.forEach(item => {
            navHTML += `
                <button class="nav-item" data-view="${item.view}" style="${this.objectToStyleString(this.navItemStyle)}">
                    <div style="font-size: 20px; margin-bottom: 4px;">${item.icon}</div>
                    <span style="font-size: 12px; font-weight: 500; margin-top: 2px;">${item.label}</span>
                </button>
            `;
        });

        navHTML += `</div>`;

        // More menu (standard bottom sheet pattern)
        navHTML += `
            <div id="more-menu" class="more-menu hidden">
                <div class="more-menu-content">
                    <div class="more-menu-header">
                        <h3>Menu</h3>
                        <button class="close-more-menu" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    <div class="more-menu-items">
                        ${secondaryNav.map(item => `
                            <button class="more-menu-item" data-view="${item.view}">
                                <div style="font-size: 20px; margin-bottom: 8px;">${item.icon}</div>
                                <span style="font-size: 12px; font-weight: 500;">${item.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        appContainer.insertAdjacentHTML('beforeend', navHTML);
        this.setupMoreMenu();
    }

    setupMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        const closeButton = document.querySelector('.close-more-menu');

        closeButton?.addEventListener('click', () => {
            this.hideMoreMenu();
        });

        moreMenu?.addEventListener('click', (e) => {
            if (e.target === moreMenu) {
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
        
        // Update bottom nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            const style = this.navItemStyle;
            item.style.backgroundColor = '';
            item.style.color = '#666';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            activeNavItem.style.color = '#3b82f6';
        }

        this.currentSection = sectionId;
        
        // Load the module
        if (window.FarmModules) {
            window.FarmModules.initializeModule(sectionId);
        }
    }

    // Navigation styles
    navStyle = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 1000
    };

    navItemStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        padding: '12px 16px',
        borderRadius: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        color: '#666',
        minWidth: '60px',
        flex: '1'
    };

    // Standard PWA Icons (using emoji for simplicity - replace with SVG if preferred)
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
