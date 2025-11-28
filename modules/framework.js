// framework.js
console.log('Loading module framework...');

const FarmModules = {
    modules: {},
    currentModule: null,
    isInitialized: false,

    registerModule: function(name, module) {
        console.log(`📦 Registering module: ${name}`);
        this.modules[name] = module;
        
        // If this is the core module, store it globally
        if (name === 'core') {
            window.coreModule = module;
        }
        
        // Auto-initialize if the framework is ready and this is the current module
        if (this.isInitialized && this.currentModule === name) {
            this.showModule(name);
        }
    },

    showModule: function(name) {
        console.log(`🔄 Switching to module: ${name}`);
        
        if (!this.modules[name]) {
            console.error(`❌ Module "${name}" not found`);
            return false;
        }

        // Hide current module if exists
        if (this.currentModule && this.modules[this.currentModule].onHide) {
            this.modules[this.currentModule].onHide();
        }

        // Show new module
        this.currentModule = name;
        const module = this.modules[name];
        
        if (module.initialize && typeof module.initialize === 'function') {
            const success = module.initialize();
            if (success) {
                console.log(`✅ Module "${name}" initialized successfully`);
                
                // Update active navigation
                this.updateActiveNav(name);
                
                // Call onShow if defined
                if (module.onShow) {
                    module.onShow();
                }
                
                return true;
            }
        }
        
        console.error(`❌ Failed to initialize module "${name}"`);
        return false;
    },

    updateActiveNav: function(activeModule) {
        // Update navigation highlights
        const navItems = document.querySelectorAll('.nav-item-pwa, .sidebar-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-module') === activeModule) {
                item.classList.add('active');
            }
        });
    },

    getModule: function(name) {
        return this.modules[name];
    },

    initializeFramework: function() {
        console.log('🚀 Initializing FarmModules framework...');
        this.isInitialized = true;
        
        // Show default module (dashboard)
        setTimeout(() => {
            this.showModule('dashboard');
        }, 100);
    }
};

// Make it globally available
window.FarmModules = FarmModules;

// Initialize framework when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready, initializing framework...');
    FarmModules.initializeFramework();
});

console.log('✅ Module framework loaded');
