// app.js - PROPER MOBILE PWA NAVIGATION
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
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
        this.isDemoMode = true;
        this.showApp();
        this.setupEventListeners();
    }

    setupEventListeners() {
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
            
            if (e.target.closest('.more-menu-item')) {
                const menuItem = e.target.closest('.more-menu-item');
                const view = menuItem.getAttribute('data-view');
                this.hideMoreMenu();
                this.showSection(view);
            }
            
            if (!e.target.closest('.more-menu') && !e.target.closest('[data-view="more"]')) {
                this.hideMoreMenu();
            }
        });
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        this.createTopNavigation();
        this.showSection(this.currentSection);
    }

   createTopNavigation() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    let header = appContainer.querySelector('header');
    if (header) {
        header.remove();
    }
    
    header = document.createElement('header');
    appContainer.insertBefore(header, appContainer.firstChild);

    // CLEAN MODERN NAVIGATION - USING CSS CLASSES
    header.innerHTML = `
        <nav class="top-nav">
            <!-- CLEAN BRAND -->
            <div class="nav-brand">
                <span class="brand-icon">🌱</span>
                <span class="brand-text">Farm</span>
            </div>
            
            <!-- CLEAN NAV ITEMS - ALWAYS VISIBLE -->
            <div class="nav-items">
                <button class="nav-item" data-view="dashboard" title="Dashboard">
                    <span class="nav-icon">📊</span>
                    <span class="nav-label">Dashboard</span>
                </button>

                <button class="nav-item" data-view="income-expenses" title="Finance">
                    <span class="nav-icon">💰</span>
                    <span class="nav-label">Finance</span>
                </button>

                <button class="nav-item" data-view="inventory-check" title="Inventory">
                    <span class="nav-icon">📦</span>
                    <span class="nav-label">Inventory</span>
                </button>

                <button class="nav-item" data-view="more" title="More">
                    <span class="nav-icon">⋮</span>
                    <span class="nav-label">More</span>
                </button>
            </div>
        </nav>

        <!-- MODERN MORE MENU -->
        <div id="more-menu" class="more-menu hidden">
            <div class="more-menu-content">
                <button class="more-menu-item" data-view="feed-record">
                    <span class="menu-icon">🌾</span>
                    <span class="menu-label">Feed</span>
                </button>
                <button class="more-menu-item" data-view="broiler-mortality">
                    <span class="menu-icon">🐔</span>
                    <span class="menu-label">Health</span>
                </button>
                <button class="more-menu-item" data-view="production">
                    <span class="menu-icon">🚜</span>
                    <span class="menu-label">Production</span>
                </button>
                <button class="more-menu-item" data-view="sales-record">
                    <span class="menu-icon">💰</span>
                    <span class="menu-label">Sales</span>
                </button>
                <button class="more-menu-item" data-view="orders">
                    <span class="menu-icon">📋</span>
                    <span class="menu-label">Orders</span>
                </button>
                <button class="more-menu-item" data-view="reports">
                    <span class="menu-icon">📈</span>
                    <span class="menu-label">Reports</span>
                </button>
                <button class="more-menu-item" data-view="profile">
                    <span class="menu-icon">👤</span>
                    <span class="menu-label">Profile</span>
                </button>
            </div>
        </div>
    `;

    // Add padding to main content
    const main = appContainer.querySelector('main');
    if (main) {
        main.style.paddingTop = '80px';
        main.style.minHeight = 'calc(100vh - 80px)';
    }
    
    console.log('✅ Modern PWA navigation created');
}

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Clean active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.background = 'transparent';
            item.style.color = '#666';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.background = 'rgba(59, 130, 246, 0.1)';
            activeNavItem.style.color = '#3b82f6';
        }

        this.currentSection = sectionId;
        
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
            </div>
        `;
    }

    toggleMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            if (moreMenu.classList.contains('hidden')) {
                moreMenu.classList.remove('hidden');
            } else {
                moreMenu.classList.add('hidden');
            }
        }
    }

    hideMoreMenu() {
        const moreMenu = document.getElementById('more-menu');
        if (moreMenu) {
            moreMenu.classList.add('hidden');
        }
    }
}

window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
