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
            // Handle main nav items
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                if (view) {
                    this.showSection(view);
                }
            }
            
            // Handle side menu items
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                this.showSection(section);
                this.hideSideMenu();
            }
            
            // Handle menu toggle
            if (e.target.closest('#menu-toggle')) {
                this.toggleSideMenu();
            }
            
            // Close side menu when clicking outside
            if (!e.target.closest('.side-menu') && !e.target.closest('#menu-toggle')) {
                this.hideSideMenu();
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

        header.innerHTML = `
            <nav class="top-nav">
                <div class="nav-brand">
                    <img src="icons/icon-96x96.png" alt="AgriMetrics">
                    <span class="brand-text">AgriMetrics</span>
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

                    <!-- Hamburger menu for production sections -->
                    <button id="menu-toggle" title="Production Menu">☰</button>
                </div>
            </nav>

            <!-- ONLY ONE SIDE MENU - for Production & Analytics -->
            <div class="side-menu hidden" id="side-menu">
                <div class="side-menu-header">
                    <div class="side-menu-title">Production & Analytics</div>
                    <div class="side-menu-subtitle">Additional features</div>
                </div>
                <div class="side-menu-items">
                    <div class="side-menu-section">
                        <div class="side-menu-section-title">PRODUCTION</div>
                        <button class="side-menu-item" data-section="production">
                            <span>🚜</span>
                            <span>Production</span>
                        </button>
                        <button class="side-menu-item" data-section="feed-record">
                            <span>🌾</span>
                            <span>Feed Management</span>
                        </button>
                        <button class="side-menu-item" data-section="broiler-mortality">
                            <span>🐔</span>
                            <span>Health & Mortality</span>
                        </button>
                    </div>

                    <div class="side-menu-section">
                        <div class="side-menu-section-title">ANALYTICS</div>
                        <button class="side-menu-item" data-section="reports">
                            <span>📈</span>
                            <span>Reports</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id="side-menu-overlay" class="hidden"></div>
        `;

        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '80px';
            main.style.minHeight = 'calc(100vh - 80px)';
        }
        
        console.log('✅ Navigation created - ONE sidebar only');
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active nav state
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
        
        this.hideSideMenu();
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

    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        const overlay = document.getElementById('side-menu-overlay');
        
        if (sideMenu && overlay) {
            if (sideMenu.classList.contains('hidden')) {
                sideMenu.classList.remove('hidden');
                overlay.classList.remove('hidden');
            } else {
                this.hideSideMenu();
            }
        }
    }

    hideSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        const overlay = document.getElementById('side-menu-overlay');
        
        if (sideMenu) sideMenu.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
    }

    // REMOVED: toggleMoreMenu() and hideMoreMenu() methods
    // REMOVED: All "more-menu" related code
}

window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
