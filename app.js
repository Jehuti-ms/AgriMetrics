// app.js - FIXED POSITIONING
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
        
        // CRITICAL: Add header to the VERY TOP of app container
        appContainer.insertBefore(header, appContainer.firstChild);

        // FIXED: Higher z-index and proper positioning
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 60px !important;
                background: #ffffff !important;
                border-bottom: 2px solid #e0e0e0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 0 20px !important;
                z-index: 10000 !important; /* MUCH HIGHER Z-INDEX */
                box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            ">
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">🌱</span>
                    <span style="font-weight: 600; font-size: 18px; color: #2d3748;">Farm Management</span>
                </div>
                
                <div class="nav-items" style="display: flex; align-items: center; gap: 8px;">
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

            <div id="more-menu" class="more-menu hidden" style="
                position: fixed !important;
                top: 65px !important;
                right: 20px !important;
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
                padding: 16px !important;
                z-index: 10001 !important; /* Higher than nav */
                min-width: 220px !important;
                border: 1px solid #e2e8f0 !important;
            ">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="more-menu-item" data-view="feed-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">🌾</span>
                        <span>Feed Record</span>
                    </button>

                    <button class="more-menu-item" data-view="broiler-mortality" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">🐔</span>
                        <span>Health</span>
                    </button>

                    <button class="more-menu-item" data-view="production" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">🚜</span>
                        <span>Production</span>
                    </button>

                    <button class="more-menu-item" data-view="sales-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">💰</span>
                        <span>Sales</span>
                    </button>

                    <button class="more-menu-item" data-view="orders" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">📋</span>
                        <span>Orders</span>
                    </button>

                    <button class="more-menu-item" data-view="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">📈</span>
                        <span>Reports</span>
                    </button>

                    <button class="more-menu-item" data-view="profile" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: left; color: #4a5568; font-size: 14px; font-weight: 500;">
                        <span style="font-size: 18px; width: 24px;">👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        `;

        // Add padding to main content
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
            main.style.minHeight = 'calc(100vh - 70px)';
        }
        
        console.log('✅ Navigation created with high z-index');
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.backgroundColor = '';
            item.style.color = '#4a5568';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
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
            <div style="padding: 40px; text-align: center;">
                <h2>${sectionTitles[sectionId] || sectionId}</h2>
                <p style="color: #666; margin-top: 10px;">This section is loading...</p>
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
