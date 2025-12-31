// modules/framework.js - UPDATED WITH ENHANCED MODULE HANDLING
console.log('Loading FarmModules framework...');

class FarmModules {
    static modules = new Map();
    
    static registerModule(name, module) {
        // Normalize module name - remove .js extension and any path
        const baseName = this.normalizeModuleName(name);
        
        // Check if already registered with any variation
        if (this.isModuleRegistered(baseName)) {
            console.log(`ℹ️ Module "${baseName}" already registered (as "${this.getRegisteredName(baseName)}"), skipping duplicate`);
            return;
        }
        
        // Store with normalized name
        this.modules.set(baseName, {
            name: baseName,
            module: module,
            initialized: false,
            element: null
        });
        
        console.log(`📦 Registered module: ${baseName}`);
        console.log(`📊 Total modules registered: ${this.modules.size}`);
    }
    
    static normalizeModuleName(name) {
        // Remove .js extension, path, and clean up
        return name
            .replace('.js', '')
            .replace(/^.*\//, '') // Remove any path prefix
            .trim();
    }
    
    static isModuleRegistered(baseName) {
        // Check if any variation exists
        for (const [key] of this.modules) {
            const normalizedKey = this.normalizeModuleName(key);
            if (normalizedKey === baseName) {
                return true;
            }
        }
        return false;
    }
    
    static getRegisteredName(baseName) {
        // Find the actual registered name
        for (const [key] of this.modules) {
            const normalizedKey = this.normalizeModuleName(key);
            if (normalizedKey === baseName) {
                return key;
            }
        }
        return baseName;
    }
    
    static getModule(name) {
        const baseName = this.normalizeModuleName(name);
        
        // Try exact match first
        if (this.modules.has(baseName)) {
            return this.modules.get(baseName);
        }
        
        // Try to find by normalized name
        for (const [key, module] of this.modules) {
            if (this.normalizeModuleName(key) === baseName) {
                return module;
            }
        }
        
        console.warn(`⚠️ Module "${name}" not found`);
        return null;
    }
    
    static initializeModule(name) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot initialize module "${name}" - not found`);
            return false;
        }
        
        if (moduleInfo.initialized) {
            console.log(`ℹ️ Module "${name}" already initialized`);
            return true;
        }
        
        try {
            console.log(`🔄 Initializing module: ${moduleInfo.name}`);
            
            // Initialize the module
            if (moduleInfo.module.initialize) {
                moduleInfo.module.initialize();
            }
            
            // Mark as initialized
            moduleInfo.initialized = true;
            
            console.log(`✅ ${moduleInfo.name}: Initialized`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to initialize module "${name}":`, error);
            return false;
        }
    }
    
    static renderModule(name, container) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot render module "${name}" - not found`);
            return false;
        }
        
        try {
            console.log(`🎨 Rendering module: ${moduleInfo.name}`);
            
            // Clear container
            container.innerHTML = '';
            
            // Store reference to container
            moduleInfo.element = container;
            
            // Render the module
            if (moduleInfo.module.render) {
                moduleInfo.module.render(container);
            } else if (moduleInfo.module.default) {
                // Handle ES6 default export style
                moduleInfo.module.default(container);
            } else {
                console.warn(`⚠️ Module "${name}" has no render method`);
                container.innerHTML = `<div class="module-error">
                    <h3>Module Error</h3>
                    <p>Module "${name}" cannot be rendered.</p>
                </div>`;
                return false;
            }
            
            // Initialize if not already
            if (!moduleInfo.initialized && moduleInfo.module.initialize) {
                moduleInfo.module.initialize();
                moduleInfo.initialized = true;
            }
            
            console.log(`✅ ${moduleInfo.name}: Rendered`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to render module "${name}":`, error);
            container.innerHTML = `<div class="module-error">
                <h3>Render Error</h3>
                <p>Failed to render module "${name}": ${error.message}</p>
            </div>`;
            return false;
        }
    }
    
    static initializeAllModules() {
        console.log(`🚀 Initializing all registered modules (${this.modules.size})...`);
        
        let initializedCount = 0;
        
        for (const [name, moduleInfo] of this.modules) {
            if (!moduleInfo.initialized && moduleInfo.module.initialize) {
                try {
                    console.log(`🔄 Initializing: ${name}`);
                    moduleInfo.module.initialize();
                    moduleInfo.initialized = true;
                    initializedCount++;
                    console.log(`✅ ${name}: Initialized`);
                } catch (error) {
                    console.error(`❌ Failed to initialize "${name}":`, error);
                }
            } else if (moduleInfo.initialized) {
                console.log(`ℹ️ ${name}: Already initialized`);
            }
        }
        
        console.log(`✅ ${initializedCount} modules initialized successfully`);
        return initializedCount;
    }
    
    static listModules() {
        console.log('📋 Registered Modules:');
        for (const [name, moduleInfo] of this.modules) {
            console.log(`  - ${name} (initialized: ${moduleInfo.initialized})`);
        }
        console.log(`Total: ${this.modules.size} modules`);
        return Array.from(this.modules.keys());
    }
    
    static debug() {
        console.group('🔧 FarmModules Debug');
        console.log('📊 Total modules:', this.modules.size);
        console.log('📋 Module list:', this.listModules());
        console.groupEnd();
        return this;
    }
}

// Create global helper function
window.debugFarmModules = function() {
    return FarmModules.debug();
};

// Initialize on window load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🌱 FarmModules framework loaded');
});

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmModules;
}
