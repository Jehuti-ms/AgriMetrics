// framework.js - SIMPLIFIED WORKING VERSION
class FarmModules {
    static modules = new Map();
    
    static registerModule(name, module) {
        console.log(`📦 Registering module: ${name}`);
        
        // Store the module
        this.modules.set(name, {
            name: name,
            module: module,
            initialized: false,
            element: null
        });
        
        console.log(`✅ Total modules: ${this.modules.size}`);
    }
    
    static getModule(name) {
        // Try exact match
        if (this.modules.has(name)) {
            return this.modules.get(name);
        }
        
        // Try without .js
        const nameWithoutJS = name.replace(/\.js$/, '');
        if (this.modules.has(nameWithoutJS)) {
            return this.modules.get(nameWithoutJS);
        }
        
        // Try all possible variations
        for (const [key, value] of this.modules) {
            const keyWithoutJS = key.replace(/\.js$/, '');
            if (keyWithoutJS === name || keyWithoutJS === nameWithoutJS) {
                return value;
            }
        }
        
        console.warn(`⚠️ Module "${name}" not found. Available:`, Array.from(this.modules.keys()));
        return null;
    }
    
    static initializeModule(name) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot initialize "${name}" - not found`);
            return false;
        }
        
        if (moduleInfo.initialized) {
            console.log(`ℹ️ "${name}" already initialized`);
            return true;
        }
        
        try {
            console.log(`🔄 Initializing: ${name}`);
            if (moduleInfo.module.initialize) {
                moduleInfo.module.initialize();
            }
            moduleInfo.initialized = true;
            console.log(`✅ ${name} initialized`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to initialize "${name}":`, error);
            return false;
        }
    }
    
    static renderModule(name, container) {
        const moduleInfo = this.getModule(name);
        
        if (!moduleInfo) {
            console.error(`❌ Cannot render "${name}" - not found`);
            container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h2>Module Not Found</h2>
                    <p>Module "${name}" is not available.</p>
                    <button onclick="location.reload()">Reload App</button>
                </div>
            `;
            return false;
        }
        
        try {
            console.log(`🎨 Rendering: ${moduleInfo.name}`);
            container.innerHTML = '';
            
            if (moduleInfo.module.render) {
                moduleInfo.module.render(container);
            } else {
                container.innerHTML = `<p>Module "${moduleInfo.name}" loaded but has no render method.</p>`;
            }
            
            // Initialize if not already
            if (!moduleInfo.initialized && moduleInfo.module.initialize) {
                moduleInfo.module.initialize();
                moduleInfo.initialized = true;
            }
            
            console.log(`✅ ${moduleInfo.name} rendered`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to render "${moduleInfo.name}":`, error);
            container.innerHTML = `
                <div style="padding: 20px; color: red;">
                    <h3>Render Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
            return false;
        }
    }
    
    static initializeAllModules() {
        console.log('🚀 Initializing all modules...');
        let count = 0;
        
        for (const [name, moduleInfo] of this.modules) {
            if (!moduleInfo.initialized && moduleInfo.module.initialize) {
                try {
                    moduleInfo.module.initialize();
                    moduleInfo.initialized = true;
                    count++;
                    console.log(`✅ ${name} initialized`);
                } catch (error) {
                    console.error(`❌ ${name} failed:`, error);
                }
            }
        }
        
        console.log(`✅ ${count} modules initialized`);
        return count;
    }
    
    static debug() {
        console.group('🔧 FarmModules Debug');
        console.log('Total:', this.modules.size);
        console.log('Modules:', Array.from(this.modules.keys()));
        console.groupEnd();
    }
}

// Global helper
window.debugFarmModules = FarmModules.debug.bind(FarmModules);
window.FarmModules = FarmModules;

console.log('✅ FarmModules framework loaded');
