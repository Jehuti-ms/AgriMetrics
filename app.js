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

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            // Main nav items
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const section = navItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
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
            
            // Mobile menu toggle
            if (e.target.closest('#menu-toggle')) {
                this.toggleSideMenu();
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
createEnhancedNavigation() 
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Set active state for current section
        const activeNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        const activeSideItem = document.querySelector(`.side-menu-item[data-section="${sectionId}"]`);
        
        if (activeNavItem) activeNavItem.classList.add('active');
        if (activeSideItem) activeSideItem.classList.add('active');

        this.currentSection = sectionId;
        
        // Load module content
        this.loadModuleContent(sectionId);
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
