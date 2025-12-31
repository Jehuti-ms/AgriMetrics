// modules/framework.js
console.log('Loading FarmModules framework...');

class FarmModules {
    static modules = new Map();
    static appData = {};
    static currentModule = null;

    static registerModule(name, moduleConfig) {
        console.log(`Registering module: ${name}`);
        this.modules.set(name, moduleConfig);
    }

    static initializeModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            console.error(`Module ${name} not found`);
            this.showFallbackContent(name);
            return;
        }

        console.log(`Initializing module: ${name}`);
        this.currentModule = name;

        const contentArea = document.getElementById('content-area');
        if (contentArea && module.template) {
            contentArea.innerHTML = module.template;
        }

        if (module.initialize && typeof module.initialize === 'function') {
            try {
                module.initialize();
            } catch (error) {
                console.error(`Error initializing module ${name}:`, error);
                this.showErrorContent(name, error);
            }
        }
    }

    static navigateTo(moduleName) {
        console.log(`Navigating to: ${moduleName}`);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-section="${moduleName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        this.initializeModule(moduleName);
    }

    static showFallbackContent(moduleName) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="section active">
                    <div class="module-header">
                        <h1>${this.formatModuleName(moduleName)}</h1>
                        <p>Module is being developed</p>
                    </div>
                </div>
            `;
        }
    }

    static showErrorContent(moduleName, error) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="section active">
                    <div class="module-header">
                        <h1>${this.formatModuleName(moduleName)}</h1>
                        <p>Error loading module</p>
                    </div>
                    <div class="error-content">
                        <p>Failed to load module: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    static formatModuleName(name) {
        return name.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    static getModule(name) {
        return this.modules.get(name);
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

// Add this method to your FarmModules class in framework.js
static renderModule(name, container) {
    console.log(`🎨 [renderModule] Rendering: ${name}`);
    
    // Get the module
    const module = this.modules.get(name);
    if (!module) {
        console.error(`❌ Module "${name}" not found`);
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h3>Module Not Found</h3>
                    <p>The "${name}" module is not available.</p>
                </div>
            `;
        }
        return false;
    }
    
    // Use existing initializeModule logic
    this.currentModule = name;
    
    // If a container is provided, use it
    if (container) {
        if (module.template) {
            container.innerHTML = module.template;
        } else if (module.render && typeof module.render === 'function') {
            // If module has its own render method
            container.innerHTML = '';
            module.render(container);
        } else {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2>${this.formatModuleName(name)}</h2>
                    <p>Module loaded but no template available.</p>
                </div>
            `;
        }
    } else {
        // Fallback to default content area
        const contentArea = document.getElementById('content-area');
        if (contentArea && module.template) {
            contentArea.innerHTML = module.template;
        }
    }
    
    // Initialize the module if it has an initialize method
    if (module.initialize && typeof module.initialize === 'function') {
        try {
            module.initialize();
            console.log(`✅ Module "${name}" initialized`);
        } catch (error) {
            console.error(`❌ Error initializing module "${name}":`, error);
        }
    }
    
    return true;
}

// Initialize with default data
FarmModules.appData = {
    transactions: [],
    inventory: [],
    sales: [],
    production: [],
    feedTransactions: [],
    user: { name: 'Demo Farmer', farmName: 'Green Valley Farm' },
    farmName: 'Green Valley Farm'
};

window.FarmModules = FarmModules;
console.log('✅ FarmModules framework initialized');
