// app.js - Clean version without debug messages
console.log('Loading enhanced navigation app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        console.log('Starting Farm Management App with Enhanced Navigation...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('Initializing enhanced navigation app...');
        this.isDemoMode = true;
        this.showApp();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Bind the methods to maintain 'this' context
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const section = navItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            }
            
            if (e.target.closest('#menu-toggle')) {
                this.toggleSideMenu();
            }
            
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    this.hideSideMenu();
                }
            }
            
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
        
        this.createEnhancedNavigation();
        this.showSection(this.currentSection);
    }

    createEnhancedNavigation() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        // Remove any existing navigation
        const existingElements = appContainer.querySelectorAll('.navbar, .side-menu, header, .top-nav');
        existingElements.forEach(el => el.remove());

        // Create navigation with proper structure
        const navHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="#" class="nav-brand" data-section="dashboard">
                        <span class="brand-icon">🌱</span>
                        <div class="brand-text">
                            <span class="brand-main">AgriMetrics</span>
                            <span class="brand-sub">Farm Management</span>
                        </div>
                    </a>

                    <div class="nav-main">
                        <a href="#" class="nav-item active" data-section="dashboard">
                            <span class="nav-icon">📊</span>
                            <span class="nav-label">Dashboard</span>
                        </a>
                        <a href="#" class="nav-item" data-section="income-expenses">
                            <span class="nav-icon">💰</span>
                            <span class="nav-label">Income & Expenses</span>
                        </a>
                        <a href="#" class="nav-item" data-section="inventory">
                            <span class="nav-icon">📦</span>
                            <span class="nav-label">Inventory</span>
                        </a>
                        <a href="#" class="nav-item" data-section="sales">
                            <span class="nav-icon">🛒</span>
                            <span class="nav-label">Sales</span>
                        </a>
                        <a href="#" class="nav-item" data-section="orders">
                            <span class="nav-icon">📋</span>
                            <span class="nav-label">Orders</span>
                        </a>
                        <a href="#" class="nav-item" data-section="profile">
                            <span class="nav-icon">👤</span>
                            <span class="nav-label">Profile</span>
                        </a>
                    </div>

                    <button class="nav-menu-btn" id="menu-toggle">☰</button>
                </div>
            </nav>

            <div class="side-menu" id="side-menu">
                <div class="side-menu-header">
                    <div class="side-menu-title">Farm Operations</div>
                    <div class="side-menu-subtitle">Production & Management</div>
                </div>
                <div class="side-menu-items">
                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Production</div>
                        <a href="#" class="side-menu-item" data-section="production">
                            <span class="side-menu-icon">🚜</span>
                            <span>Production</span>
                        </a>
                        <a href="#" class="side-menu-item" data-section="feed">
                            <span class="side-menu-icon">🌾</span>
                            <span>Feed Management</span>
                        </a>
                        <a href="#" class="side-menu-item" data-section="health">
                            <span class="side-menu-icon">🐔</span>
                            <span>Health & Mortality</span>
                        </a>
                    </div>
                    <div class="side-menu-section">
                        <div class="side-menu-section-title">Analytics</div>
                        <a href="#" class="side-menu-item" data-section="reports">
                            <span class="side-menu-icon">📈</span>
                            <span>Reports & Analytics</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        appContainer.insertAdjacentHTML('afterbegin', navHTML);
        this.updateMobileMenuVisibility();
        
        window.addEventListener('resize', () => {
            this.updateMobileMenuVisibility();
        });
    }

    updateMobileMenuVisibility() {
        const menuBtn = document.getElementById('menu-toggle');
        const navMain = document.querySelector('.nav-main');
        
        if (!menuBtn || !navMain) return;
        
        if (window.innerWidth <= 768) {
            menuBtn.style.display = 'flex';
            navMain.style.display = 'none';
        } else {
            menuBtn.style.display = 'none';
            navMain.style.display = 'flex';
        }
    }

    showSection(sectionId) {
        // Update active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        
        if (activeNavItem) activeNavItem.classList.add('active');
        if (activeSideItem) activeSideItem.classList.add('active');

        this.currentSection = sectionId;
        this.loadModuleContent(sectionId);
    }

    loadModuleContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const moduleMap = {
            'dashboard': 'dashboard',
            'income-expenses': 'income-expenses', 
            'inventory': 'inventory-check',
            'sales': 'sales-record',
            'orders': 'orders',
            'profile': 'profile',
            'production': 'production',
            'feed': 'feed-record',
            'health': 'broiler-mortality',
            'reports': 'reports'
        };

        const actualModule = moduleMap[sectionId] || sectionId;
        
        if (window.FarmModules && typeof window.FarmModules.initializeModule === 'function') {
            window.FarmModules.initializeModule(actualModule);
        } else {
            this.loadFallbackContent(sectionId);
        }
    }

    loadFallbackContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const sectionTitles = {
            'dashboard': 'Dashboard Overview',
            'income-expenses': 'Income & Expenses',
            'inventory': 'Inventory Management',
            'sales': 'Sales Records',
            'orders': 'Order Management',
            'profile': 'Profile Settings',
            'production': 'Production Records',
            'feed': 'Feed Management',
            'health': 'Health & Mortality',
            'reports': 'Reports & Analytics'
        };

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1>${sectionTitles[sectionId] || sectionId}</h1>
                    <p>Manage your farm ${sectionTitles[sectionId]?.toLowerCase() || 'operations'}</p>
                </div>
                <div class="module-content">
                    <div class="glass-card">
                        <h3>Welcome to ${sectionTitles[sectionId] || sectionId}</h3>
                        <p>This module is loading...</p>
                    </div>
                </div>
            </div>
        `;
    }

    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.classList.toggle('open');
        }
    }

    hideSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.classList.remove('open');
        }
    }
}

// Initialize the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}

