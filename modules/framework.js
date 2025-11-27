// modules/framework.js
console.log('Loading module framework...');

const FarmModules = {
    modules: {},

    registerModule(name, module) {
        console.log(`📦 Registering module: ${name}`);
        this.modules[name] = module;
        
        // Auto-initialize if it's the core module
        if (name === 'core') {
            module.initialize();
        }
    },

    getModule(name) {
        return this.modules[name];
    },

    getModules() {
        return this.modules;
    },

    initializeModule(name) {
        const module = this.modules[name];
        if (module && !module.initialized) {
            return module.initialize();
        }
        return false;
    },

    // Method to get all module names for navigation
    getModuleNames() {
        return Object.keys(this.modules).filter(name => name !== 'core' && name !== 'auth' && name !== 'framework');
    }
};

// Make FarmModules globally available
window.FarmModules = FarmModules;
console.log('✅ Module framework loaded');
