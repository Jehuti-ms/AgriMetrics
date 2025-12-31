// modules/framework.js - UPDATED WITH ENHANCED MODULE HANDLING
console.log('Loading FarmModules framework...');

class FarmModules {
    static modules = new Map();
    
    static registerModule(name, module) {
        // Log what's being registered
        console.log(`📦 Registering module: ${name}`, module);
        
        // Check if this is a valid module object
        if (!module || typeof module !== 'object') {
            console.warn(`⚠️ Invalid module object for "${name}"`, module);
            return;
        }
        
        // Always store with the provided name
        // This preserves backward compatibility
        this.modules.set(name, {
            name: name,
            module: module,
            initialized: false,
            element: null
        });
        
        console.log(`✅ Total modules registered: ${this.modules.size}`);
    }
    
    static getModule(name) {
        // Try exact match first
        if (this.modules.has(name)) {
            return this.modules.get(name);
        }
        
        // Try without .js extension
        const nameWithoutExt = name.replace(/\.js$/i, '');
        if (this.modules.has(nameWithoutExt)) {
            return this.modules.get(nameWithoutExt);
        }
        
        // Try with .js extension
        const nameWithExt = name.endsWith('.js') ? name : name + '.js';
        if (this.modules.has(nameWithExt)) {
            return this.modules.get(nameWithExt);
        }
        
        console.warn(`⚠️ Module "${name}" not found. Available modules:`, Array.from(this.modules.keys()));
        return null;
    }
    
    static initializeModule(name) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot initialize module "${name}" - not found`);
            return false;
        }
        
        // Check if already initialized (by any name)
        if (moduleInfo.initialized) {
            console.log(`ℹ️ Module "${moduleInfo.name}" already initialized`);
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
            console.error(`❌ Failed to initialize module "${moduleInfo.name}":`, error);
            return false;
        }
    }
    
    static renderModule(name, container) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot render module "${name}" - not found`);
            
            // Show error message
            container.innerHTML = `
                <div class="error-message">
                    <h2>Module Not Found</h2>
                    <p>The module "${name}" could not be loaded.</p>
                    <p>Available modules: ${Array.from(this.modules.keys()).join(', ')}</p>
                    <button onclick="app.showSection('dashboard')" style="
                        padding: 10px 20px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Return to Dashboard</button>
                </div>
            `;
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
                console.warn(`⚠️ Module "${moduleInfo.name}" has no render method`);
                container.innerHTML = `<div class="module-error">
                    <h3>Module Error</h3>
                    <p>Module "${moduleInfo.name}" cannot be rendered.</p>
                </div>`;
                return false;
            }
            
            console.log(`✅ ${moduleInfo.name}: Rendered`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to render module "${moduleInfo.name}":`, error);
            container.innerHTML = `<div class="module-error">
                <h3>Render Error</h3>
                <p>Failed to render module "${moduleInfo.name}": ${error.message}</p>
            </div>`;
            return false;
        }
    }
    
    static initializeAllModules() {
        console.log(`🚀 Initializing all registered modules (${this.modules.size})...`);
        
        let initializedCount = 0;
        
        // Create a set to track which modules we've initialized (by base name)
        const initializedBaseNames = new Set();
        
        for (const [name, moduleInfo] of this.modules) {
            // Get base name without .js
            const baseName = name.replace(/\.js$/i, '');
            
            // Skip if we've already initialized a module with this base name
            if (initializedBaseNames.has(baseName)) {
                console.log(`⏭️ Skipping duplicate initialization for "${name}" (already initialized "${baseName}")`);
                continue;
            }
            
            if (!moduleInfo.initialized && moduleInfo.module.initialize) {
                try {
                    console.log(`🔄 Initializing: ${name}`);
                    moduleInfo.module.initialize();
                    moduleInfo.initialized = true;
                    initializedBaseNames.add(baseName);
                    initializedCount++;
                    console.log(`✅ ${name}: Initialized`);
                } catch (error) {
                    console.error(`❌ Failed to initialize "${name}":`, error);
                }
            } else if (moduleInfo.initialized) {
                console.log(`ℹ️ ${name}: Already initialized`);
                initializedBaseNames.add(baseName);
            }
        }
        
        console.log(`✅ ${initializedCount} unique modules initialized successfully`);
        return initializedCount;
    }
    
    static listModules() {
        console.log('📋 Registered Modules:');
        const baseNames = new Set();
        
        for (const [name, moduleInfo] of this.modules) {
            const baseName = name.replace(/\.js$/i, '');
            const isDuplicate = baseNames.has(baseName);
            baseNames.add(baseName);
            
            console.log(`  - ${name} (initialized: ${moduleInfo.initialized})${isDuplicate ? ' [DUPLICATE]' : ''}`);
        }
        console.log(`Total: ${this.modules.size} modules, ${baseNames.size} unique`);
        return Array.from(this.modules.keys());
    }
    
    static debug() {
        console.group('🔧 FarmModules Debug');
        console.log('📊 Total module registrations:', this.modules.size);
        console.log('📋 Module registrations:');
        this.listModules();
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
