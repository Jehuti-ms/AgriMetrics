// app.js - Enhanced Navigation Integration
console.log('Loading enhanced navigation app...');

class FarmManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isDemoMode = false;
        this.init();
    }

    async init() {
        console.log('🚀 Starting Farm Management App with Enhanced Navigation...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        console.log('✅ Initializing enhanced navigation app...');
        this.isDemoMode = true;
        this.showApp();
        this.setupEventListeners();
    }

// Add this to your setupEventListeners method
setupEventListeners() {
    document.addEventListener('click', (e) => {
        console.log('🖱️ Click detected:', e.target);
        
        // Main nav items
        if (e.target.closest('.nav-item')) {
            const navItem = e.target.closest('.nav-item');
            const section = navItem.getAttribute('data-section');
            if (section) {
                this.showSection(section);
            }
        }
        
        // Mobile menu button
        if (e.target.closest('#menu-toggle')) {
            console.log('📱 Mobile menu button clicked!');
            this.toggleSideMenu();
        }
        
        // Side menu items
        if (e.target.closest('.side-menu-item')) {
            const menuItem = e.target.closest('.side-menu-item');
            const section = menuItem.getAttribute('data-section');
            if (section) {
                this.showSection(section);
                this.hideSideMenu();
            }
        }
        
        // Close side menu when clicking outside
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

    // Fix the navbar creation in your app.js
createEnhancedNavigation() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    // Remove any existing navigation completely
    const existingElements = appContainer.querySelectorAll('.navbar, .side-menu, header, .top-nav');
    existingElements.forEach(el => el.remove());

    // Create the enhanced navigation structure with inline styles for testing
    const navHTML = `
        <nav class="navbar" style="background: linear-gradient(135deg, #22c55e 0%, #14b8a6 100%); padding: 0 20px; position: fixed; top: 0; left: 0; right: 0; height: 60px; z-index: 1000; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🌱</span>
                <div style="display: flex; flex-direction: column; line-height: 1.2;">
                    <span style="font-size: 18px; font-weight: 700; color: white;">AgriMetrics</span>
                    <span style="font-size: 11px; color: white; opacity: 0.9;">Farm Management</span>
                </div>
            </div>

            <!-- Main Navigation - Hidden on mobile -->
            <div class="nav-main" style="display: flex; align-items: center; gap: 8px;">
                <a href="#" class="nav-item active" data-section="dashboard" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; background: rgba(255,255,255,0.2);">
                    <span>📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="nav-item" data-section="income-expenses" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; opacity: 0.9;">
                    <span>💰</span>
                    <span>Income</span>
                </a>
                <a href="#" class="nav-item" data-section="inventory" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; opacity: 0.9;">
                    <span>📦</span>
                    <span>Inventory</span>
                </a>
                <a href="#" class="nav-item" data-section="sales" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; opacity: 0.9;">
                    <span>🛒</span>
                    <span>Sales</span>
                </a>
                <a href="#" class="nav-item" data-section="orders" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; opacity: 0.9;">
                    <span>📋</span>
                    <span>Orders</span>
                </a>
                <a href="#" class="nav-item" data-section="profile" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; color: white; text-decoration: none; border-radius: 10px; opacity: 0.9;">
                    <span>👤</span>
                    <span>Profile</span>
                </a>
            </div>

            <!-- Mobile Menu Button - FORCE VISIBLE FOR TESTING -->
            <button class="nav-menu-btn" id="menu-toggle" style="background: none; border: 2px solid rgba(255,255,255,0.3); color: white; font-size: 20px; cursor: pointer; padding: 8px 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
                ☰
            </button>
        </nav>

        <!-- Side Menu -->
        <div class="side-menu" id="side-menu" style="position: fixed; top: 60px; right: -300px; width: 280px; height: calc(100vh - 60px); background: white; transition: right 0.3s ease; z-index: 999; box-shadow: -2px 0 20px rgba(0,0,0,0.1);">
            <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                <div style="font-size: 16px; font-weight: 700; color: #1e293b;">Farm Operations</div>
                <div style="font-size: 12px; color: #64748b;">Production & Management</div>
            </div>
            <div style="padding: 16px 0;">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; padding: 0 20px 8px 20px;">Production</div>
                    <a href="#" class="side-menu-item" data-section="production" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #64748b; text-decoration: none;">
                        <span>🚜</span>
                        <span>Production</span>
                    </a>
                    <a href="#" class="side-menu-item" data-section="feed" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #64748b; text-decoration: none;">
                        <span>🌾</span>
                        <span>Feed Management</span>
                    </a>
                    <a href="#" class="side-menu-item" data-section="health" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #64748b; text-decoration: none;">
                        <span>🐔</span>
                        <span>Health & Mortality</span>
                    </a>
                </div>
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; padding: 0 20px 8px 20px;">Analytics</div>
                    <a href="#" class="side-menu-item" data-section="reports" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #64748b; text-decoration: none;">
                        <span>📈</span>
                        <span>Reports & Analytics</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    appContainer.insertAdjacentHTML('afterbegin', navHTML);
    
    // Force update mobile menu visibility
    this.forceMobileMenuUpdate();
    
    console.log('✅ Enhanced navigation created with forced mobile menu');
}

// Add this method to force mobile menu updates
forceMobileMenuUpdate() {
    const menuBtn = document.getElementById('menu-toggle');
    const navMain = document.querySelector('.nav-main');
    const sideMenu = document.getElementById('side-menu');
    
    if (!menuBtn || !navMain || !sideMenu) {
        console.log('❌ Navigation elements not found');
        return;
    }
    
    console.log('📱 Checking screen size:', window.innerWidth);
    
    if (window.innerWidth <= 768) {
        // Mobile: show menu button, hide main nav
        menuBtn.style.display = 'flex';
        navMain.style.display = 'none';
        console.log('📱 Mobile layout: menu button shown, main nav hidden');
    } else {
        // Desktop: hide menu button, show main nav
        menuBtn.style.display = 'none';
        navMain.style.display = 'flex';
        console.log('🖥️ Desktop layout: menu button hidden, main nav shown');
    }
    
    // Add resize listener
    window.addEventListener('resize', () => {
        this.forceMobileMenuUpdate();
    });
}
    
    loadModuleContent(sectionId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Map section IDs to your existing module names
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
                        <div class="action-buttons">
                            <button class="btn btn-primary">Get Started</button>
                            <button class="btn btn-outline">Learn More</button>
                        </div>
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

    // Notification system
    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notificationContainer.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
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
