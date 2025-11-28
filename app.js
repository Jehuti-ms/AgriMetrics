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
        this.setupSideMenuListeners();
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

    setupSideMenuListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                this.showSection(section);
                this.hideSideMenu();
            }
            
            // Close side menu when clicking outside
            if (!e.target.closest('.side-menu') && !e.target.closest('#menu-toggle')) {
                this.hideSideMenu();
            }
        });
        
        // Menu toggle button
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSideMenu();
            });
        }
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

    // MODERN PWA NAVIGATION - RESPONSIVE
    header.innerHTML = `
        <nav class="top-nav" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 10000;
            box-sizing: border-box;
        ">
            <!-- AGRI METRICS BRAND -->
            <div class="nav-brand" style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                <img src="icons/icon-96x96.png" alt="AgriMetrics" style="width: 32px; height: 32px; border-radius: 8px;">
                <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;" class="brand-text">AgriMetrics</span>
            </div>
            
            <!-- MAIN NAV ITEMS - RESPONSIVE -->
            <div class="nav-items" style="
                display: flex;
                align-items: center;
                gap: 4px;
                overflow-x: auto;
                padding: 0 8px;
                flex: 1;
                justify-content: flex-end;
                min-width: 0;
            ">
                <!-- Always visible main icons -->
                <button class="nav-item" data-view="dashboard" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 12px;
                    padding: 8px 12px;
                    border-radius: 12px;
                    min-width: 60px;
                    min-height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                " title="Dashboard">
                    <span style="font-size: 20px; margin-bottom: 2px;">📊</span>
                    <span class="nav-label" style="font-size: 10px;">Dashboard</span>
                </button>

                <button class="nav-item" data-view="income-expenses" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 12px;
                    padding: 8px 12px;
                    border-radius: 12px;
                    min-width: 60px;
                    min-height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                " title="Income & Expenses">
                    <span style="font-size: 20px; margin-bottom: 2px;">💰</span>
                    <span class="nav-label" style="font-size: 10px;">Income</span>
                </button>

                <button class="nav-item" data-view="inventory-check" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 12px;
                    padding: 8px 12px;
                    border-radius: 12px;
                    min-width: 60px;
                    min-height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                " title="Inventory">
                    <span style="font-size: 20px; margin-bottom: 2px;">📦</span>
                    <span class="nav-label" style="font-size: 10px;">Inventory</span>
                </button>

                <!-- Hamburger menu for smaller screens -->
                <button id="menu-toggle" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 24px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    min-width: 50px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    margin-left: 8px;
                " title="Menu">
                    ☰
                </button>
            </div>
        </nav>

        <!-- SIDE MENU - Updated to work with new navigation -->
        <div class="side-menu hidden" id="side-menu" style="
            position: fixed;
            top: 70px;
            right: 0;
            bottom: 0;
            width: 280px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-left: 1px solid rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        ">
            <div class="side-menu-header" style="
                padding: 24px 20px 16px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                background: linear-gradient(135deg, #22c55e, #14b8a6);
                color: white;
            ">
                <div class="side-menu-title" style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">More Options</div>
                <div class="side-menu-subtitle" style="font-size: 12px; opacity: 0.9;">Additional features</div>
            </div>
            <div class="side-menu-items" style="padding: 16px 0;">
                <!-- Orders Section -->
                <div class="side-menu-section" style="margin-bottom: 24px;">
                    <div class="side-menu-section-title" style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Orders</div>
                    <button class="side-menu-item" data-section="orders" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">📋</span>
                        <span>Orders</span>
                    </button>
                    <button class="side-menu-item" data-section="sales-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🛒</span>
                        <span>Sales</span>
                    </button>
                </div>

                <!-- Production Section -->
                <div class="side-menu-section" style="margin-bottom: 24px;">
                    <div class="side-menu-section-title" style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Production</div>
                    <button class="side-menu-item" data-section="production" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🚜</span>
                        <span>Production</span>
                    </button>
                    <button class="side-menu-item" data-section="feed-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🌾</span>
                        <span>Feed</span>
                    </button>
                    <button class="side-menu-item" data-section="broiler-mortality" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">🐔</span>
                        <span>Health</span>
                    </button>
                </div>

                <!-- Analytics Section -->
                <div class="side-menu-section" style="margin-bottom: 24px;">
                    <div class="side-menu-section-title" style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Analytics</div>
                    <button class="side-menu-item" data-section="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">📈</span>
                        <span>Reports</span>
                    </button>
                </div>

                <!-- Profile Section -->
                <div class="side-menu-section">
                    <div class="side-menu-section-title" style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Account</div>
                    <button class="side-menu-item" data-section="profile" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #333; text-decoration: none; transition: all 0.2s ease; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; font-size: 14px;">
                        <span style="font-size: 18px; width: 24px; text-align: center;">👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Overlay for side menu -->
        <div id="side-menu-overlay" class="hidden" style="
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            backdrop-filter: blur(2px);
        "></div>
    `;

    // Add padding to main content
    const main = appContainer.querySelector('main');
    if (main) {
        main.style.paddingTop = '80px';
        main.style.minHeight = 'calc(100vh - 80px)';
    }
    
    this.setupSideMenuListeners();
    console.log('✅ Responsive PWA navigation created');
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

    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            if (sideMenu.classList.contains('hidden')) {
                sideMenu.classList.remove('hidden');
            } else {
                sideMenu.classList.add('hidden');
            }
        }
    }

    hideSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.classList.add('hidden');
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
