// modules/framework.js - Main framework for module management
class FarmModules {
    static modules = new Map();
    static appData = {};
    static currentModule = null;

    static registerModule(name, moduleConfig) {
        console.log(`Registering module: ${name}`);
        this.modules.set(name, moduleConfig);
        
        // Auto-initialize if this module is active
        if (document.querySelector(`[data-section="${name}"]`)) {
            this.initializeModule(name);
        }
    }

    static initializeModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            console.error(`Module ${name} not found`);
            return;
        }

        console.log(`Initializing module: ${name}`);
        this.currentModule = name;

        // Render the module content
        const contentArea = document.getElementById('content-area');
        if (contentArea && module.template) {
            contentArea.innerHTML = module.template;
        }

        // Initialize the module
        if (module.initialize && typeof module.initialize === 'function') {
            try {
                module.initialize();
            } catch (error) {
                console.error(`Error initializing module ${name}:`, error);
            }
        }
    }

    static navigateTo(moduleName) {
        console.log(`Navigating to: ${moduleName}`);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-section="${moduleName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Initialize the target module
        this.initializeModule(moduleName);
    }

    static getModule(name) {
        return this.modules.get(name);
    }

    static getAllModules() {
        return Array.from(this.modules.values());
    }

    static setAppData(key, value) {
        this.appData[key] = value;
    }

    static getAppData(key) {
        return this.appData[key];
    }

    static updateAppData(updates) {
        Object.assign(this.appData, updates);
    }
}

// Make it globally available
window.FarmModules = FarmModules;

// Initialize with default data structure
FarmModules.appData = {
    transactions: [],
    inventory: [],
    sales: [],
    production: [],
    projects: [],
    orders: [],
    feedRecords: [],
    recentReports: [],
    reportTemplates: []
};

console.log('FarmModules framework initialized');
