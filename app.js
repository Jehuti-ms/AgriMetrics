// app.js - PROPER MOBILE PWA NAVIGATION
console.log('Loading main app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    init() {
        console.log('🚀 Starting Farm Management App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                this.initializeApp();
            }.bind(this));
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('✅ Initializing app...');
        this.isDemoMode = true;
        this.showApp();
        this.setupEventListeners();
    }

    setupEventListeners() {
        var self = this;
        document.addEventListener('click', function(e) {
            // Handle nav items
            if (e.target.closest('.nav-item')) {
                var navItem = e.target.closest('.nav-item');
                var view = navItem.getAttribute('data-view');
                if (view) {
                    self.showSection(view);
                }
            }
            
            // Handle side menu items
            if (e.target.closest('.side-menu-item')) {
                var menuItem = e.target.closest('.side-menu-item');
                var section = menuItem.getAttribute('data-section');
                self.showSection(section);
                self.hideSideMenu();
            }
            
            // Handle menu toggle
            if (e.target.closest('#menu-toggle')) {
                self.toggleSideMenu();
            }
            
            // Close side menu when clicking outside
            if (!e.target.closest('.side-menu') && !e.target.closest('#menu-toggle')) {
                self.hideSideMenu();
            }
        });
    }

    showApp() {
        var authContainer = document.getElementById('auth-container');
        var appContainer = document.getElementById('app-container');
        
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
        <nav class="top-nav" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 10000;
        ">
            <!-- Brand -->
            <div class="nav-brand" style="display: flex; align-items: center; gap: 12px;">
                <img src="icons/icon-96x96.png" alt="AgriMetrics" style="width: 32px; height: 32px; border-radius: 8px;">
                <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;">AgriMetrics</span>
            </div>
            
            <!-- Navigation Items -->
            <div class="nav-items" style="
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <button class="nav-item" data-view="dashboard" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: all 0.2s ease;
                ">
                    <span style="font-size: 20px;">📊</span>
                    <span style="font-size: 10px; margin-top: 2px;">Dashboard</span>
                </button>

                <button class="nav-item" data-view="income-expenses" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: all 0.2s ease;
                ">
                    <span style="font-size: 20px;">💰</span>
                    <span style="font-size: 10px; margin-top: 2px;">Income</span>
                </button>

                <button class="nav-item" data-view="inventory-check" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: all 0.2s ease;
                ">
                    <span style="font-size: 20px;">📦</span>
                    <span style="font-size: 10px; margin-top: 2px;">Inventory</span>
                </button>

                <button id="menu-toggle" style="
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 24px;
                    padding: 12px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                ">
                    ☰
                </button>
            </div>
        </nav>

        <!-- Side Menu -->
        <div class="side-menu hidden" id="side-menu" style="
            position: fixed;
            top: 70px;
            right: 0;
            bottom: 0;
            width: 280px;
            background: white;
            border-left: 1px solid #e5e5e5;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
        ">
            <div style="padding: 24px 20px 16px; border-bottom: 1px solid #e5e5e5; background: #22c55e; color: white;">
                <div style="font-size: 18px; font-weight: 700;">More Options</div>
                <div style="font-size: 12px;">Additional features</div>
            </div>
            <div style="padding: 16px 0;">
                <div style="margin-bottom: 24px;">
                    <div style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666;">Orders</div>
                    <button class="side-menu-item" data-section="orders" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>📋</span>
                        <span>Orders</span>
                    </button>
                    <button class="side-menu-item" data-section="sales-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>🛒</span>
                        <span>Sales</span>
                    </button>
                </div>

                <div style="margin-bottom: 24px;">
                    <div style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666;">Production</div>
                    <button class="side-menu-item" data-section="production" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>🚜</span>
                        <span>Production</span>
                    </button>
                    <button class="side-menu-item" data-section="feed-record" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>🌾</span>
                        <span>Feed</span>
                    </button>
                    <button class="side-menu-item" data-section="broiler-mortality" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>🐔</span>
                        <span>Health</span>
                    </button>
                </div>

                <div style="margin-bottom: 24px;">
                    <div style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666;">Analytics</div>
                    <button class="side-menu-item" data-section="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>📈</span>
                        <span>Reports</span>
                    </button>
                </div>

                <div>
                    <div style="padding: 0 20px 8px; font-size: 12px; font-weight: 600; color: #666;">Account</div>
                    <button class="side-menu-item" data-section="profile" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; width: 100%; text-align: left; border: none; background: transparent; cursor: pointer;">
                        <span>👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Overlay -->
        <div id="side-menu-overlay" class="hidden" style="
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        "></div>
    `;

    const main = appContainer.querySelector('main');
    if (main) {
        main.style.paddingTop = '80px';
        main.style.minHeight = 'calc(100vh - 80px)';
    }
    
    console.log('✅ Navigation created');
}
    
    showSection(sectionId) {
        console.log('🔄 Switching to section: ' + sectionId);
        
        // Update active nav state
        var navItems = document.querySelectorAll('.nav-item');
        for (var i = 0; i < navItems.length; i++) {
            navItems[i].style.background = 'transparent';
            navItems[i].style.color = '#666';
        }
        
        var activeNavItem = document.querySelector('.nav-item[data-view="' + sectionId + '"]');
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
        var contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        var sectionTitles = {
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

        var title = sectionTitles[sectionId] || sectionId;
        contentArea.innerHTML = 
            '<div style="padding: 20px;">' +
            '<h2 style="color: #1a1a1a;">' + title + '</h2>' +
            '<p style="color: #666;">Content loading...</p>' +
            '</div>';
    }

    toggleSideMenu() {
        var sideMenu = document.getElementById('side-menu');
        var overlay = document.getElementById('side-menu-overlay');
        
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
        var sideMenu = document.getElementById('side-menu');
        var overlay = document.getElementById('side-menu-overlay');
        
        if (sideMenu) sideMenu.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
    }
}

window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
