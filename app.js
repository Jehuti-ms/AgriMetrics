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
        // Listen for navigation clicks
        document.addEventListener('click', (e) => {
            // Handle nav item clicks
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                
                if (view === 'more') {
                    this.toggleMoreMenu();
                } else {
                    this.showSection(view);
                }
            }
            
            // Handle more menu item clicks
            if (e.target.closest('.more-menu-item')) {
                const menuItem = e.target.closest('.more-menu-item');
                const view = menuItem.getAttribute('data-view');
                this.hideMoreMenu();
                this.showSection(view);
            }
        });

        // Close more menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.more-menu') && !e.target.closest('[data-view="more"]')) {
                this.hideMoreMenu();
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

        // Get or create header
        let header = appContainer.querySelector('header');
        if (!header) {
            header = document.createElement('header');
            appContainer.insertBefore(header, appContainer.firstChild);
        }

        // Clear existing header content
        header.innerHTML = '';

        // Create top navigation with proper styling
        const navHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background-color: #ffffff;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">🌱</span>
                    <span style="font-weight: 600; font-size: 18px; color: #2d3748;">Farm Management</span>
                </div>
                
                <div class="nav-items" style="display: flex; align-items: center; gap: 4px;">
                    <button class="nav-item" data-view="dashboard" style="
                        display: flex;
                        align-items: center;
                        background: none;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        color: #4a5568;
                        gap: 6px;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 20px;">📊</span>
                        <span>Home</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" style="
                        display: flex;
                        align-items: center;
                        background: none;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        color: #4a5568;
                        gap: 6px;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 20px;">💰</span>
                        <span>Finance</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" style="
                        display: flex;
                        align-items: center;
                        background: none;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        color: #4a5568;
                        gap: 6px;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 20px;">📦</span>
                        <span>Inventory</span>
                    </button>

                    <button class="nav-item" data-view="more" style="
                        display: flex;
                        align-items: center;
                        background: none;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        color: #4a5568;
                        gap: 6px;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 20px;">⋮</span>
                        <span>More</span>
                    </button>
                </div>
            </nav>

            <!-- More Menu Dropdown -->
            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 65px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                padding: 16px;
                z-index: 1001;
                min-width: 220px;
                border: 1px solid #e2e8f0;
            ">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="more-menu-item" data-view="feed-record" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">🌾</span>
                        <span>Feed Record</span>
                    </button>

                    <button class="more-menu-item" data-view="broiler-mortality" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">🐔</span>
                        <span>Health</span>
                    </button>

                    <button class="more-menu-item" data-view="production" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">🚜</span>
                        <span>Production</span>
                    </button>

                    <button class="more-menu-item" data-view="sales-record" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">💰</span>
                        <span>Sales</span>
                    </button>

                    <button class="more-menu-item" data-view="orders" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">📋</span>
                        <span>Orders</span>
                    </button>

                    <button class="more-menu-item" data-view="reports" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">📈</span>
                        <span>Reports</span>
                    </button>

                    <button class="more-menu-item" data-view="profile" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        background: none;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        <span style="font-size: 18px; width: 24px;">👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        `;

        header.innerHTML = navHTML;
        
        // Add padding to main content to account for fixed header
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
            main.style.minHeight = 'calc(100vh - 70px)';
        }
        
        // Also ensure content area has proper padding
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.style.paddingTop = '20px';
        }
        
        console.log('✅ Top navigation created with visible labels and icons');
    }

    // ADD THIS MISSING METHOD
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.backgroundColor = '';
            item.style.color = '#4a5568';
            item.style.fontWeight = '500';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            activeNavItem.style.color = '#3b82f6';
            activeNavItem.style.fontWeight = '600';
        }

        this.currentSection = sectionId;
        
        // Load the module
        if (window.FarmModules && typeof window.FarmModules.initializeModule === 'function') {
            console.log(`📦 Loading module: ${sectionId}`);
            window.FarmModules.initializeModule(sectionId);
        } else {
            console.log(`⚠️ FarmModules not available, loading fallback for: ${sectionId}`);
            this.loadFallbackContent(sectionId);
        }
    }

    // ADD THIS MISSING METHOD TOO
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
            <div style="padding: 40px; text-align: center;">
                <h2>${sectionTitles[sectionId] || sectionId}</h2>
                <p style="color: #666; margin-top: 10px;">This section is loading...</p>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">
                    If this doesn't load, check the browser console for errors.
                </p>
            </div>
        `;
    }

    toggleMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            if (moreMenu.classList.contains('hidden')) {
                moreMenu.classList.remove('hidden');
                console.log('📋 More menu opened');
            } else {
                moreMenu.classList.add('hidden');
                console.log('📋 More menu closed');
            }
        }
    }

    hideMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            moreMenu.classList.add('hidden');
        }
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
