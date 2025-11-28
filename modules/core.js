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
        
        // Module name mapping
        const MODULE_NAME_MAP = {
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

        // Main nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                const actualModule = MODULE_NAME_MAP[section] || section;
                console.log('Main nav clicked:', section, '->', actualModule);
                this.setActiveNavItem(section);
                if (window.FarmModules && window.FarmModules.initializeModule) {
                    window.FarmModules.initializeModule(actualModule);
                }
            });
        });

        // Side menu items
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                const actualModule = MODULE_NAME_MAP[section] || section;
                console.log('Side menu clicked:', section, '->', actualModule);
                this.setActiveNavItem(section);
                if (window.FarmModules && window.FarmModules.initializeModule) {
                    window.FarmModules.initializeModule(actualModule);
                }
                this.closeSideMenu();
            });
        });

        // Brand click
        const brand = document.querySelector('.nav-brand');
        if (brand) {
            brand.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveNavItem('dashboard');
                if (window.FarmModules && window.FarmModules.initializeModule) {
                    window.FarmModules.initializeModule('dashboard');
                }
            });
        }

        // Mobile menu toggle
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
            if (sideMenu && !sideMenu.contains(e.target) && e.target !== menuToggle && sideMenu.classList.contains('open')) {
                this.closeSideMenu();
            }
        });

        console.log('✅ Navigation setup complete');
    },

    setActiveNavItem(section) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });

        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        const sideMenuItem = document.querySelector(`.side-menu-item[data-section="${section}"]`);
        
        if (navItem) navItem.classList.add('active');
        if (sideMenuItem) sideMenuItem.classList.add('active');
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

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        return notification;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('core', CoreModule);
}

window.coreModule = CoreModule;
