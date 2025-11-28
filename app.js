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
        var appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        var header = appContainer.querySelector('header');
        if (header) {
            header.remove();
        }
        
        header = document.createElement('header');
        appContainer.insertBefore(header, appContainer.firstChild);

        header.innerHTML = this.getNavigationHTML();
        
        var main = appContainer.querySelector('main');
        if (main) {
            main.style.paddingTop = '80px';
            main.style.minHeight = 'calc(100vh - 80px)';
        }
        
        console.log('✅ Navigation created');
    }

    getNavigationHTML() {
        return `
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

                    <button id="menu-toggle" title="Menu">☰</button>
                </div>
            </nav>

            <div class="side-menu hidden" id="side-menu">
                <div class="side-menu-header">
                    <div class="side-menu-title">More Options</div>
                    <div class="side-menu-subtitle">Additional features</div>
                </div>
                <div class="side-menu-items">
                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Orders</div>
                        <button class="side-menu-item" data-section="orders">
                            <span>📋</span>
                            <span>Orders</span>
                        </button>
                        <button class="side-menu-item" data-section="sales-record">
                            <span>🛒</span>
                            <span>Sales</span>
                        </button>
                    </div>

                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Production</div>
                        <button class="side-menu-item" data-section="production">
                            <span>🚜</span>
                            <span>Production</span>
                        </button>
                        <button class="side-menu-item" data-section="feed-record">
                            <span>🌾</span>
                            <span>Feed</span>
                        </button>
                        <button class="side-menu-item" data-section="broiler-mortality">
                            <span>🐔</span>
                            <span>Health</span>
                        </button>
                    </div>

                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Analytics</div>
                        <button class="side-menu-item" data-section="reports">
                            <span>📈</span>
                            <span>Reports</span>
                        </button>
                    </div>

                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Account</div>
                        <button class="side-menu-item" data-section="profile">
                            <span>👤</span>
                            <span>Profile</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id="side-menu-overlay" class="hidden"></div>
        `;
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
