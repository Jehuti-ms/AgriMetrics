// ==================== CORE MODULE ====================
const FarmModules = {
    // Module registry
    modules: {},
    
    // Data storage
    appData: {
        inventory: [],
        transactions: [],
        production: [],
        orders: [],
        sales: [],
        projects: [],
        feedRecords: []
    },

    // Register a new module
    registerModule: function(name, module) {
        this.modules[name] = module;
        console.log(`Module registered: ${name}`);
    },

    // Initialize all modules
    initializeModules: function() {
        for (const moduleName in this.modules) {
            if (this.modules[moduleName].initialize) {
                this.modules[moduleName].initialize();
            }
        }
    },

    // Navigation system
    navigateTo: function(moduleName) {
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
        }
        
        // Activate nav link
        const targetNavLink = document.querySelector(`.nav-link[data-target="${moduleName}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }
        
        // Update sidebar
        this.updateSidebar(moduleName);
    },

    // Update sidebar content
    updateSidebar: function(moduleName) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && this.modules[moduleName] && this.modules[moduleName].sidebar) {
            sidebar.innerHTML = this.modules[moduleName].sidebar;
            this.attachSidebarEvents();
        }
    },

    // Attach sidebar event listeners
    attachSidebarEvents: function() {
        // Sidebar links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
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
    },

    // Generate unique ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Data persistence
    saveDataToStorage: function() {
        try {
            localStorage.setItem('farmManagementData', JSON.stringify(this.appData));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    },

    loadDataFromStorage: function() {
        try {
            const savedData = localStorage.getItem('farmManagementData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                Object.assign(this.appData, parsedData);
                console.log('Data loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
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
