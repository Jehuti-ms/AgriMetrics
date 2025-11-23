// modules/core.js - Complete corrected version
const FarmModules = {
    modules: {},
    appData: {
        inventory: [], 
        transactions: [], 
        production: [], 
        orders: [], 
        sales: [], 
        projects: [], 
        feedRecords: []
    },

    registerModule: function(name, module) {
        this.modules[name] = module;
        console.log(`Module registered: ${name}`);
    },

    initializeModules: function() {
        console.log('Initializing all modules...');
        for (const moduleName in this.modules) {
            if (this.modules[moduleName].initialize && !this.modules[moduleName].isAuthModule) {
                console.log(`Initializing module: ${moduleName}`);
                this.modules[moduleName].initialize();
            }
        }
    },

    saveDataToStorage: function() {
        try {
            localStorage.setItem('farmData', JSON.stringify(this.appData));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Save error:', error);
        }
    },

    loadDataFromStorage: function() {
        try {
            const saved = localStorage.getItem('farmData');
            if (saved) {
                this.appData = JSON.parse(saved);
                console.log('Data loaded from localStorage');
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    },

    // Navigation system
    navigateTo: function(moduleName) {
        console.log('Navigating to:', moduleName);
        
        if (!this.modules[moduleName]) {
            console.error(`Module not found: ${moduleName}`);
            return;
        }
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(moduleName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error(`Section not found: ${moduleName}`);
        }
        
        // Activate nav link
        const targetNavLink = document.querySelector(`.nav-link[data-target="${moduleName}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }
        
        // Update sidebar
        this.updateSidebar(moduleName);
        
        console.log(`Successfully navigated to ${moduleName}`);
    },

    // Update sidebar content
    updateSidebar: function(moduleName) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && this.modules[moduleName] && this.modules[moduleName].sidebar) {
            sidebar.innerHTML = this.modules[moduleName].sidebar;
            this.attachSidebarEvents();
            console.log(`Sidebar updated for: ${moduleName}`);
        } else {
            console.log(`No sidebar found for: ${moduleName}`);
        }
    },

    // Attach sidebar event listeners
    attachSidebarEvents: function() {
        console.log('Attaching sidebar events...');
        
        // Sidebar links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
                console.log('Sidebar link clicked:', target);
                this.navigateTo(target);
            });
        });
        
        // Production items
        document.querySelectorAll('.production-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.production-item').forEach(i => i.classList.remove('active'));
                e.target.classList.add('active');
                this.navigateTo('production');
            });
        });
        
        // Feed type items
        document.querySelectorAll('.feed-type-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.feed-type-item').forEach(i => i.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Dashboard sidebar actions
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.sidebar-btn').dataset.action;
                console.log('Sidebar button clicked:', action);
                this.handleSidebarAction(action);
            });
        });
        
        console.log('Sidebar events attached');
    },

    // Handle sidebar actions
    handleSidebarAction: function(action) {
        console.log('Handling sidebar action:', action);
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'inventory-check': 'inventory-check',
            'record-sale': 'sales',
            'add-production': 'production',
            'create-order': 'orders'
        };

        if (actionMap[action]) {
            this.navigateTo(actionMap[action]);
        } else {
            console.warn('Unknown sidebar action:', action);
        }
    },

    // Generate unique ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Safe element selector
    safeQuerySelector: function(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    },

    // Safe element selector for multiple elements
    safeQuerySelectorAll: function(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`No elements found: ${selector}`);
        }
        return elements;
    }
};

// Make FarmModules globally available
window.FarmModules = FarmModules;
