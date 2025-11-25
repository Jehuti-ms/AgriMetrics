// app.js - GUARANTEED VISIBLE NAVIGATION
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

        // SIMPLE, CLEAR, VISIBLE NAVIGATION
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 70px;
                background: #ffffff;
                border-bottom: 3px solid #2c5aa0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: Arial, sans-serif;
            ">
                <!-- BRAND - LARGE AND CLEAR -->
                <div class="nav-brand" style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px; color: #2c5aa0;">🌱</span>
                    <span style="font-weight: bold; font-size: 22px; color: #2c5aa0;">Farm Management</span>
                </div>
                
                <!-- NAVIGATION ITEMS - LARGE AND VISIBLE -->
                <div class="nav-items" style="display: flex; align-items: center; gap: 15px;">
                    <button class="nav-item" data-view="dashboard" style="
                        display: flex;
                        align-items: center;
                        background: #f8f9fa;
                        border: 2px solid #2c5aa0;
                        padding: 12px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                        color: #2c5aa0;
                        gap: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        min-width: 120px;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 24px;">📊</span>
                        <span>Home</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" style="
                        display: flex;
                        align-items: center;
                        background: #f8f9fa;
                        border: 2px solid #2c5aa0;
                        padding: 12px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                        color: #2c5aa0;
                        gap: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        min-width: 120px;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 24px;">💰</span>
                        <span>Finance</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" style="
                        display: flex;
                        align-items: center;
                        background: #f8f9fa;
                        border: 2px solid #2c5aa0;
                        padding: 12px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                        color: #2c5aa0;
                        gap: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        min-width: 120px;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 24px;">📦</span>
                        <span>Inventory</span>
                    </button>

                    <button class="nav-item" data-view="more" style="
                        display: flex;
                        align-items: center;
                        background: #f8f9fa;
                        border: 2px solid #2c5aa0;
                        padding: 12px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                        color: #2c5aa0;
                        gap: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        min-width: 120px;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 24px;">⚙️</span>
                        <span>More</span>
                    </button>
                </div>
            </nav>

            <!-- MORE MENU - LARGE AND VISIBLE -->
            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 75px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                padding: 20px;
                z-index: 10001;
                min-width: 250px;
                border: 3px solid #2c5aa0;
                font-family: Arial, sans-serif;
            ">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="more-menu-item" data-view="feed-record" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">🌾</span>
                        <span>Feed Record</span>
                    </button>

                    <button class="more-menu-item" data-view="broiler-mortality" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">🐔</span>
                        <span>Health</span>
                    </button>

                    <button class="more-menu-item" data-view="production" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">🚜</span>
                        <span>Production</span>
                    </button>

                    <button class="more-menu-item" data-view="sales-record" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">💰</span>
                        <span>Sales</span>
                    </button>

                    <button class="more-menu-item" data-view="orders" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">📋</span>
                        <span>Orders</span>
                    </button>

                    <button class="more-menu-item" data-view="reports" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">📈</span>
                        <span>Reports</span>
                    </button>

                    <button class="more-menu-item" data-view="profile" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 2px solid #2c5aa0; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px; font-weight: bold;">
                        <span style="font-size: 22px;">👤</span>
                        <span>Profile</span>
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
        
        console.log('✅ Navigation created - should be clearly visible now');
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active state - make it very obvious
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.background = '#f8f9fa';
            item.style.color = '#2c5aa0';
            item.style.border = '2px solid #2c5aa0';
            item.style.fontWeight = 'bold';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.background = '#2c5aa0';
            activeNavItem.style.color = 'white';
            activeNavItem.style.border = '2px solid #2c5aa0';
            activeNavItem.style.fontWeight = 'bold';
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
            <div style="padding: 40px; text-align: center;">
                <h2 style="color: #2c5aa0; font-size: 28px;">${sectionTitles[sectionId] || sectionId}</h2>
                <p style="color: #666; margin-top: 10px; font-size: 18px;">This section is loading...</p>
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
