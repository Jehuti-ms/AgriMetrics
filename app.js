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
    
    // Show the app interface
    this.showApp();
    
    // Setup navigation and events
    this.createTopNavigation();
    
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
        this.setupHamburgerMenu();
        this.setupSideMenuEvents();
        this.setupEventListeners();
        this.setupDarkMode();
        
        // Test if hamburger is working
        const hamburger = document.getElementById('hamburger-menu');
        const sideMenu = document.getElementById('side-menu');
        console.log('🔍 Debug - Hamburger exists:', !!hamburger);
        console.log('🔍 Debug - Side menu exists:', !!sideMenu);
        
        if (hamburger) {
            console.log('🔍 Debug - Hamburger classes:', hamburger.className);
            console.log('🔍 Debug - Hamburger styles:', window.getComputedStyle(hamburger));
        }
    }, 100);
    
    // Load initial section
    this.showSection(this.currentSection);
    
    console.log('✅ App initialized successfully');
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
            
            // Handle sidebar menu items (for the existing HTML sidebar)
            if (e.target.closest('.side-menu-item')) {
                const menuItem = e.target.closest('.side-menu-item');
                const section = menuItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            }
        });
    }
        // Add to your initializeApp() method
setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme or prefer OS setting
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        this.updateDarkModeIcon(true);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            // Save preference
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // Update icon
            this.updateDarkModeIcon(isDarkMode);
        });
    }
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark-mode', e.matches);
            this.updateDarkModeIcon(e.matches);
        }
    });
}

updateDarkModeIcon(isDarkMode) {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('span:first-child');
        const label = darkModeToggle.querySelector('.nav-label');
        
        if (isDarkMode) {
            icon.textContent = '☀️';
            label.textContent = 'Light';
        } else {
            icon.textContent = '🌙';
            label.textContent = 'Dark';
        }
    }
}

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        
        console.log('🏠 App container shown');
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
                <img src="icons/icon-96x96.png" alt="AgriMetrics">
                <span class="brand-text">AgriMetrics</span>
                <span class="brand-subtitle">Farm Management System</span>
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

                    <!-- Dark Mode Toggle -->
                <button class="nav-item dark-mode-toggle" id="dark-mode-toggle" title="Toggle Dark Mode">
                    <span>🌙</span>
                    <span class="nav-label">Theme</span>
                </button>
                
                <!-- Hamburger menu as a proper nav-item -->
                <button class="nav-item hamburger-menu" id="hamburger-menu" title="Farm Operations">
                    <span>☰</span>
                    <span class="nav-label">More</span>
                </button>
            </div>
        </nav>
    `;

    // Setup hamburger menu functionality
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
        // Ensure sidebar is hidden by default and positioned on right
        sideMenu.style.left = 'auto';
        sideMenu.style.right = '0';
        sideMenu.style.transform = 'translateX(100%)';
        sideMenu.classList.remove('active');
        
        // Remove any existing event listeners to prevent duplicates
        hamburger.replaceWith(hamburger.cloneNode(true));
        const newHamburger = document.getElementById('hamburger-menu');
        
        newHamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🍔 Hamburger clicked, toggling sidebar');
            sideMenu.classList.toggle('active');
        });
        
        console.log('✅ Hamburger menu connected to sidebar');
    } else {
        console.log('❌ Hamburger or side menu not found:', { hamburger, sideMenu });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sideMenu = document.getElementById('side-menu');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (sideMenu && sideMenu.classList.contains('active') && hamburger) {
            if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
                console.log('📱 Click outside, closing sidebar');
                sideMenu.classList.remove('active');
            }
        }
    });
    
    // Close sidebar when clicking on sidebar items
    const sideMenuItems = document.querySelectorAll('.side-menu-item');
    sideMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sideMenu = document.getElementById('side-menu');
            if (sideMenu) {
                sideMenu.classList.remove('active');
            }
        });
    });
}

    setupSideMenuEvents() {
        const sideMenuItems = document.querySelectorAll('.side-menu-item');
        sideMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    console.log('📱 Side menu item clicked:', section);
                    
                    // Close sidebar after selection
                    const sideMenu = document.getElementById('side-menu');
                    if (sideMenu) {
                        sideMenu.classList.remove('active');
                    }
                }
            });
        });
        
        console.log('✅ Side menu events setup');
    }
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active nav state for top navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-view="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update active state for sidebar items
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        if (activeSideItem) {
            activeSideItem.classList.add('active');
        }

        this.currentSection = sectionId;
        
        // Load the module content
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
                <p style="color: #999; font-size: 14px;">Module system not loaded yet</p>
            </div>
        `;
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
