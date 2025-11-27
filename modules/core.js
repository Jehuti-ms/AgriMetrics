// modules/core.js
console.log('Loading core module...');

const CoreModule = {
    name: 'core',
    initialized: false,

    initialize() {
        console.log('⚙️ Initializing core module...');
        this.setupNotificationSystem();
        this.initialized = true;
        return true;
    },

    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        console.log('🔔 Notification system ready');
    },

  // modules/core.js - Add this to the setupNavigation method
setupNavigation() {
    console.log('🧭 Setting up navigation...');
    
    // Main nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            console.log('Main nav clicked:', section);
            this.setActiveNavItem(section);
            window.app.showSection(section);
        });
    });

    // Side menu items
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            console.log('Side menu clicked:', section);
            this.setActiveNavItem(section);
            window.app.showSection(section);
            this.closeSideMenu();
        });
    });

    // Brand click
    document.querySelector('.nav-brand').addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveNavItem('dashboard');
        window.app.showSection('dashboard');
    });

    // Mobile menu toggle
    document.getElementById('menu-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSideMenu();
    });

    // Close side menu when clicking outside
    document.addEventListener('click', (e) => {
        const sideMenu = document.getElementById('side-menu');
        const menuToggle = document.getElementById('menu-toggle');
        if (!sideMenu.contains(e.target) && e.target !== menuToggle && sideMenu.classList.contains('open')) {
            this.closeSideMenu();
        }
    });

    console.log('✅ Navigation setup complete');
},

    setActiveNavItem(section) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current section
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        const sideMenuItem = document.querySelector(`.side-menu-item[data-section="${section}"]`);
        
        if (navItem) {
            navItem.classList.add('active');
        }
        if (sideMenuItem) {
            sideMenuItem.classList.add('active');
        }
    },

    toggleSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.toggle('open');
    },

    closeSideMenu() {
        const sideMenu = document.getElementById('side-menu');
        sideMenu.classList.remove('open');
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

        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after duration
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

    // Utility function to generate unique IDs
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Data storage helpers
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

// Register core module
if (window.FarmModules) {
    window.FarmModules.registerModule('core', CoreModule);
}

// Make core module globally available
window.coreModule = CoreModule;
