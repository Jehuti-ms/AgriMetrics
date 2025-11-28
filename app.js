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

    // Remove existing header if any
    let header = appContainer.querySelector('header');
    if (header) {
        header.remove();
    }
    
    // Create new header
    header = document.createElement('header');
    appContainer.insertBefore(header, appContainer.firstChild);

    header.innerHTML = `
        <nav class="top-nav">
            <div class="nav-brand">
                <button class="hamburger-menu" id="hamburger-menu">☰</button>
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
            </div>
        </nav>
    `;

    // Setup hamburger menu to toggle the existing sidebar
    this.setupHamburgerMenu();
    
    // Adjust main content padding
    const main = appContainer.querySelector('main');
    if (main) {
        main.style.paddingTop = '80px';
    }
    
    console.log('✅ Top Navigation created');
}

setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const sideMenu = document.getElementById('side-menu');
    
    if (hamburger && sideMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            sideMenu.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking on menu items
    const sideMenuItems = document.querySelectorAll('.side-menu-item');
    sideMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sideMenu = document.getElementById('side-menu');
            sideMenu.classList.remove('active');
        });
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sideMenu = document.getElementById('side-menu');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sideMenu && hamburger) {
            if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        }
    });
}

    createSidebarNavigation() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    // Remove existing sidebar if any
    let sidebar = appContainer.querySelector('.sidebar');
    if (sidebar) {
        sidebar.remove();
    }

    // Create sidebar
    sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-content">
            <h3>Farm Management</h3>
            <div class="sidebar-items">
                <button class="sidebar-item" data-view="production" title="Production">
                    <span>🚜</span>
                    <span class="sidebar-label">Production</span>
                </button>

                <button class="sidebar-item" data-view="feed-record" title="Feed Management">
                    <span>🌾</span>
                    <span class="sidebar-label">Feed</span>
                </button>

                <button class="sidebar-item" data-view="broiler-mortality" title="Health & Mortality">
                    <span>🐔</span>
                    <span class="sidebar-label">Health</span>
                </button>

                <button class="sidebar-item" data-view="reports" title="Reports">
                    <span>📈</span>
                    <span class="sidebar-label">Reports</span>
                </button>
            </div>
        </div>
    `;

    // Add sidebar to app container
    appContainer.appendChild(sidebar);
    
    console.log('✅ Sidebar Navigation created');
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
}

window.FarmManagementApp = FarmManagementApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FarmManagementApp();
    });
} else {
    window.app = new FarmManagementApp();
}
