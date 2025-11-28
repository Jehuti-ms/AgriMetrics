// modules/core.js
console.log('Loading core module...');

const CoreModule = {
    name: 'core',
    initialized: false,

    initialize() {
        console.log('⚙️ Initializing core module...');
        this.setupNotificationSystem();
        this.setupNavigation();
        this.initialized = true;
        return true;
    },

    setupNotificationSystem() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        console.log('🔔 Notification system ready');
    },

    setupNavigation() {
        console.log('🧭 Setting up navigation...');
        
        const MODULE_MAP = {
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

        const loadModule = (section) => {
            const moduleName = MODULE_MAP[section] || section;
            console.log('Loading module:', section, '->', moduleName);
            
            if (window.FarmModules && window.FarmModules.initializeModule) {
                window.FarmModules.initializeModule(moduleName);
            } else {
                console.error('FarmModules not available');
            }
        };

        // Main nav
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const section = navItem.getAttribute('data-section');
                this.setActiveNavItem(section);
                loadModule(section);
            }
        });

        // Side menu
        document.addEventListener('click', (e) => {
            const sideItem = e.target.closest('.side-menu-item');
            if (sideItem) {
                e.preventDefault();
                const section = sideItem.getAttribute('data-section');
                this.setActiveNavItem(section);
                loadModule(section);
                this.closeSideMenu();
            }
        });

        // Brand
        const brand = document.querySelector('.nav-brand');
        if (brand) {
            brand.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveNavItem('dashboard');
                loadModule('dashboard');
            });
        }

        // Mobile menu
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSideMenu();
            });
        }

        // Close side menu when clicking outside
        document.addEventListener('click', (e) => {
            const sideMenu = document.getElementById('side-menu');
            const menuToggle = document.getElementById('menu-toggle');
            if (sideMenu && !sideMenu.contains(e.target) && e.target !== menuToggle) {
                this.closeSideMenu();
            }
        });

        console.log('✅ Navigation setup complete');
    },

    setActiveNavItem(section) {
        // Remove active from all
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.side-menu-item').forEach(item => item.classList.remove('active'));
        
        // Add active to current
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        const sideItem = document.querySelector(`.side-menu-item[data-section="${section}"]`);
        
        if (navItem) navItem.classList.add('active');
        if (sideItem) sideItem.classList.add('active');
    },

    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) sideMenu.classList.toggle('open');
    },

    closeSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) sideMenu.classList.remove('open');
    },

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        container.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => notification.remove(), duration);
        return notification;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('core', CoreModule);
}
window.coreModule = CoreModule;
