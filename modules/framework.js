// framework.js
console.log('Loading module framework...');

const FarmModules = {
    modules: {},
    
    registerModule: function(name, module) {
        console.log(`📦 Registering module: ${name}`);
        this.modules[name] = module;
    },

    showModule: function(name) {
        console.log(`🔄 Switching to module: ${name}`);
        
        if (!this.modules[name]) {
            console.error(`Module "${name}" not found`);
            return false;
        }

        const module = this.modules[name];
        
        if (module.initialize && typeof module.initialize === 'function') {
            return module.initialize();
        }
        
        return false;
    }
};

// Make it globally available
window.FarmModules = FarmModules;

console.log('✅ Module framework loaded');
