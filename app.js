// app.js - MOBILE-RESPONSIVE NAVIGATION
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

        // MOBILE-FIRST NAVIGATION
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: white;
                border-bottom: 2px solid #2c5aa0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 15px;
                z-index: 10000;
                box-sizing: border-box;
            ">
                <!-- MOBILE BRAND - SIMPLIFIED -->
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px; color: #2c5aa0;">🌱</span>
                    <span style="font-size: 18px; color: #2c5aa0; font-weight: bold; white-space: nowrap;">Farm Mgmt</span>
                </div>
                
                <!-- MOBILE NAV ITEMS - ICONS ONLY ON SMALL SCREENS -->
                <div class="nav-items" style="display: flex; align-items: center; gap: 8px;">
                    <button class="nav-item" data-view="dashboard" title="Dashboard" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #2c5aa0;
                        font-size: 20px;
                        padding: 12px;
                        border-radius: 8px;
                        min-width: 44px;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text" style="display: none;">Home</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" title="Finance" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #2c5aa0;
                        font-size: 20px;
                        padding: 12px;
                        border-radius: 8px;
                        min-width: 44px;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span class="nav-icon">💰</span>
                        <span class="nav-text" style="display: none;">Finance</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" title="Inventory" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #2c5aa0;
                        font-size: 20px;
                        padding: 12px;
                        border-radius: 8px;
                        min-width: 44px;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span class="nav-icon">📦</span>
                        <span class="nav-text" style="display: none;">Inventory</span>
                    </button>

                    <button class="nav-item" data-view="more" title="More Options" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #2c5aa0;
                        font-size: 20px;
                        padding: 12px;
                        border-radius: 8px;
                        min-width: 44px;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-text" style="display: none;">More</span>
                    </button>
                </div>
            </nav>

            <!-- MOBILE MORE MENU -->
            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 65px;
                right: 15px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 15px;
                z-index: 10001;
                min-width: 180px;
                border: 2px solid #2c5aa0;
                max-height: 70vh;
                overflow-y: auto;
            ">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="more-menu-item" data-view="feed-record" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">🌾</span>
                        <span>Feed Record</span>
                    </button>
                    <button class="more-menu-item" data-view="broiler-mortality" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">🐔</span>
                        <span>Health</span>
                    </button>
                    <button class="more-menu-item" data-view="production" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">🚜</span>
                        <span>Production</span>
                    </button>
                    <button class="more-menu-item" data-view="sales-record" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">💰</span>
                        <span>Sales</span>
                    </button>
                    <button class="more-menu-item" data-view="orders" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">📋</span>
                        <span>Orders</span>
                    </button>
                    <button class="more-menu-item" data-view="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">📈</span>
                        <span>Reports</span>
                    </button>
                    <button class="more-menu-item" data-view="profile" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; color: #2c5aa0; font-size: 16px;">
                        <span style="font-size: 18px;">👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        `;

        // Add responsive behavior
        this.setupResponsiveNavigation();
        
        // Add padding to main content
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
            main.style.minHeight = 'calc(100vh - 70px)';
        }
        
        console.log('✅ Mobile-responsive navigation created');
    }

    setupResponsiveNavigation() {
        // Show text labels on larger screens
        const checkScreenSize = () => {
            const navTexts = document.querySelectorAll('.nav-text');
            const navIcons = document.querySelectorAll('.nav-icon');
            const brand = document.querySelector('.nav-brand span:last-child');
            
            if (window.innerWidth >= 768) {
                // Desktop - show text labels
                navTexts.forEach(text => text.style.display = 'inline');
                navIcons.forEach(icon => {
                    icon.style.marginRight = '5px';
                    icon.style.fontSize = '18px';
                });
                if (brand) brand.textContent = 'Farm Management';
            } else {
                // Mobile - icons only
                navTexts.forEach(text => text.style.display = 'none');
                navIcons.forEach(icon => {
                    icon.style.marginRight = '0';
                    icon.style.fontSize = '20px';
                });
                if (brand) brand.textContent = 'Farm Mgmt';
            }
        };

        // Check on load and resize
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.background = 'none';
            item.style.color = '#2c5aa0';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.background = '#2c5aa0';
            activeNavItem.style.color = 'white';
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
                <h2 style="color: #2c5aa0;">${sectionTitles[sectionId] || sectionId}</h2>
                <p>Content loading...</p>
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
