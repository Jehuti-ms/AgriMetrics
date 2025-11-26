// app.js - FORCE TEXT VISIBILITY
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

        // SIMPLE TEXT-BASED NAVIGATION - NO COMPLEX STYLING
        header.innerHTML = `
            <nav class="top-nav" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: white;
                border-bottom: 1px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                <!-- SIMPLE BRAND -->
                <div class="nav-brand" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">🌱</span>
                    <span style="font-size: 18px; color: black;">Farm Management</span>
                </div>
                
                <!-- SIMPLE NAV ITEMS - JUST TEXT AND EMOJIS -->
                <div class="nav-items" style="display: flex; align-items: center; gap: 20px;">
                    <button class="nav-item" data-view="dashboard" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: black;
                        font-size: 16px;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <span>📊</span>
                        <span>Home</span>
                    </button>

                    <button class="nav-item" data-view="income-expenses" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: black;
                        font-size: 16px;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <span>💰</span>
                        <span>Finance</span>
                    </button>

                    <button class="nav-item" data-view="inventory-check" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: black;
                        font-size: 16px;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <span>📦</span>
                        <span>Inventory</span>
                    </button>

                    <button class="nav-item" data-view="more" style="
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: black;
                        font-size: 16px;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <span>⚙️</span>
                        <span>More</span>
                    </button>
                </div>
            </nav>

            <!-- SIMPLE MORE MENU -->
            <div id="more-menu" class="more-menu hidden" style="
                position: fixed;
                top: 60px;
                right: 20px;
                background: white;
                border: 1px solid #ccc;
                padding: 10px;
                z-index: 10001;
                min-width: 150px;
            ">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="more-menu-item" data-view="feed-record" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>🌾</span>
                        <span>Feed</span>
                    </button>
                    <button class="more-menu-item" data-view="broiler-mortality" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>🐔</span>
                        <span>Health</span>
                    </button>
                    <button class="more-menu-item" data-view="production" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>🚜</span>
                        <span>Production</span>
                    </button>
                    <button class="more-menu-item" data-view="sales-record" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>💰</span>
                        <span>Sales</span>
                    </button>
                    <button class="more-menu-item" data-view="orders" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>📋</span>
                        <span>Orders</span>
                    </button>
                    <button class="more-menu-item" data-view="reports" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>📈</span>
                        <span>Reports</span>
                    </button>
                    <button class="more-menu-item" data-view="profile" style="background: none; border: none; cursor: pointer; color: black; font-size: 14px; padding: 8px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <span>👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        `;

        // Add padding to main content
        const main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '70px';
        }
        
        console.log('✅ Simple navigation created - text should be visible');
    }

    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Simple active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.color = 'black';
            item.style.fontWeight = 'normal';
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.style.color = 'blue';
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
            <div style="padding: 20px;">
                <h2>${sectionTitles[sectionId] || sectionId}</h2>
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
