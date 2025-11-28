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

        // MODERN PWA NAVIGATION WITH TEXT LABELS
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 70px;
                background: rgba(255, 255, 255, 0.95);
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
                <!-- AGRI METRICS BRAND WITH ICON -->
                <div class="nav-brand" style="display: flex; align-items: center; gap: 12px;">
                    <img src="icons/icon-96x96.png" alt="AgriMetrics" style="width: 32px; height: 32px; border-radius: 8px;">
                    <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;">AgriMetrics</span>
                </div>
                
                <!-- MAIN NAV ITEMS WITH TEXT - ALWAYS VISIBLE -->
                <div class="nav-items" style="display: flex; align-items: center; gap: 4px; overflow-x: auto; padding: 0 8px;">
                    <button class="nav-item" data-view="dashboard" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Dashboard">
                        <span style="font-size: 18px; margin-bottom: 2px;">📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Finance">
                        <span style="font-size: 18px; margin-bottom: 2px;">💰</span>
                        <span>Income</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Inventory">
                        <span style="font-size: 18px; margin-bottom: 2px;">📦</span>
                        <span>Inventory</span>
                    </button>

                    <button class="nav-item" data-view="orders" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Orders">
                        <span style="font-size: 18px; margin-bottom: 2px;">📋</span>
                        <span>Orders</span>
                    </button>

                    <button class="nav-item" data-view="sales-record" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Sales">
                        <span style="font-size: 18px; margin-bottom: 2px;">🛒</span>
                        <span>Sales</span>
                    </button>

                    <button class="nav-item" data-view="profile" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 12px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        min-width: auto;
                        min-height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    " title="Profile">
                        <span style="font-size: 18px; margin-bottom: 2px;">👤</span>
                        <span>Profile</span>
                    </button>

                    <button id="menu-toggle" style="
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        color: #666;
                        font-size: 20px;
                        padding: 8px;
                        border-radius: 8px;
                        min-width: 40px;
                        min-height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        margin-left: 8px;
                    " title="Menu">
                        ☰
                    </button>
                </div>
            </nav>

            <!-- MODERN MORE MENU (for mobile fallback) -->
            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 75px;
                right: 16px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                padding: 16px;
                z-index: 10001;
                min-width: 200px;
                border: 1px solid rgba(0, 0, 0, 0.1);
            ">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="more-menu-item" data-view="production" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #666; font-size: 16px; transition: all 0.2s ease;">
                        <span style="font-size: 20px;">🚜</span>
                        <span>Production</span>
                    </button>
                    <button class="more-menu-item" data-view="feed-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #666; font-size: 16px; transition: all 0.2s ease;">
                        <span style="font-size: 20px;">🌾</span>
                        <span>Feed</span>
                    </button>
                    <button class="more-menu-item" data-view="broiler-mortality" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #666; font-size: 16px; transition: all 0.2s ease;">
                        <span style="font-size: 20px;">🐔</span>
                        <span>Health</span>
                    </button>
                    <button class="more-menu-item" data-view="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #666; font-size: 16px; transition: all 0.2s ease;">
                        <span style="font-size: 20px;">📈</span>
                        <span>Reports</span>
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
        
        console.log('✅ Modern PWA navigation with text labels created');
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
