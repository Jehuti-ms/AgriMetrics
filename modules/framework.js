// modules/framework.js - UPDATED WITH ENHANCED MODULE HANDLING
console.log('Loading FarmModules framework...');

class FarmModules {
    static modules = new Map();
    static appData = {};
    static currentModule = null;

    static registerModule(name, moduleConfig) {
        console.log(`📦 Registering module: ${name}`);
        
        // Store the module with the given name
        this.modules.set(name, moduleConfig);
        
        // Also store without .js extension for compatibility
        if (name.endsWith('.js')) {
            const cleanName = name.replace('.js', '');
            if (!this.modules.has(cleanName)) {
                this.modules.set(cleanName, moduleConfig);
                console.log(`📦 Also registered as: ${cleanName}`);
            }
        }
        
        // Also store with .js extension if not already there
        else if (!name.endsWith('.js')) {
            const jsName = name + '.js';
            if (!this.modules.has(jsName)) {
                this.modules.set(jsName, moduleConfig);
                console.log(`📦 Also registered as: ${jsName}`);
            }
        }
        
        console.log(`✅ Total modules registered: ${this.modules.size}`);
    }

    static initializeModule(name) {
        console.log(`🔄 Initializing module: ${name}`);
        console.log(`🔍 Available modules:`, Array.from(this.modules.keys()));
        
        // Try to get the module
        const module = this.getModule(name);
        
        if (!module) {
            console.error(`❌ Module "${name}" not found`);
            this.showFallbackContent(name);
            return false;
        }

        console.log(`✅ Module "${name}" found, initializing...`);
        this.currentModule = name;

        // If module has a template, render it
        const contentArea = document.getElementById('content-area');
        if (contentArea && module.template) {
            contentArea.innerHTML = module.template;
        }

        // Initialize the module
        if (module.initialize && typeof module.initialize === 'function') {
            try {
                module.initialize();
                console.log(`✅ Module "${name}" initialized successfully`);
                return true;
            } catch (error) {
                console.error(`❌ Error initializing module ${name}:`, error);
                this.showErrorContent(name, error);
                return false;
            }
        } else {
            console.warn(`⚠️ Module "${name}" has no initialize method`);
            return true;
        }
    }

    static getModule(name) {
        // Try exact match first
        if (this.modules.has(name)) {
            return this.modules.get(name);
        }
        
        // Try without .js extension
        if (name.endsWith('.js')) {
            const cleanName = name.replace('.js', '');
            if (this.modules.has(cleanName)) {
                return this.modules.get(cleanName);
            }
        }
        
        // Try with .js extension
        else {
            const jsName = name + '.js';
            if (this.modules.has(jsName)) {
                return this.modules.get(jsName);
            }
        }
        
        // Try case-insensitive match
        const moduleKeys = Array.from(this.modules.keys());
        const caseInsensitiveMatch = moduleKeys.find(key => 
            key.toLowerCase() === name.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
            console.log(`🔍 Found case-insensitive match: ${caseInsensitiveMatch} for ${name}`);
            return this.modules.get(caseInsensitiveMatch);
        }
        
        console.warn(`⚠️ Module "${name}" not found in registry`);
        return null;
    }

    static navigateTo(moduleName) {
        console.log(`📍 Navigating to: ${moduleName}`);
        
        // Update navigation highlights
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-section="${moduleName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Initialize the module
        return this.initializeModule(moduleName);
    }

    static showFallbackContent(moduleName) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            const displayName = this.formatModuleName(moduleName);
            contentArea.innerHTML = `
                <div class="module-container">
                    <div class="module-header">
                        <h1 class="module-title">${displayName}</h1>
                        <p class="module-subtitle">Module content will appear here</p>
                    </div>
                    <div class="fallback-content">
                        <p>The "${displayName}" module is being developed or failed to load.</p>
                        <p>Please check the browser console for more details.</p>
                    </div>
                </div>
            `;
        }
    }

    static showErrorContent(moduleName, error) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            const displayName = this.formatModuleName(moduleName);
            contentArea.innerHTML = `
                <div class="module-container">
                    <div class="module-header">
                        <h1 class="module-title">${displayName}</h1>
                        <p class="module-subtitle">Error loading module</p>
                    </div>
                    <div class="error-content glass-card">
                        <h3 style="color: #ef4444;">⚠️ Module Loading Error</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Module:</strong> ${moduleName}</p>
                        <div style="margin-top: 20px;">
                            <button onclick="FarmModules.initializeModule('${moduleName}')" 
                                    class="btn-primary" style="margin-right: 10px;">
                                Retry Loading
                            </button>
                            <button onclick="FarmModules.navigateTo('dashboard')" 
                                    class="btn-outline">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    static formatModuleName(name) {
        // Remove .js extension if present
        const cleanName = name.replace('.js', '');
        
        // Convert dash-case or snake_case to Title Case
        return cleanName.split(/[-_]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    static setAppData(key, value) {
        this.appData[key] = value;
        console.log(`📊 App data updated: ${key} =`, value);
    }

    static getAppData(key) {
        return this.appData[key];
    }

    static updateAppData(updates) {
        Object.assign(this.appData, updates);
        console.log('📊 App data updated with:', updates);
    }

    // NEW: Initialize all registered modules
    static initializeAll() {
        console.log('🚀 Initializing all registered modules...');
        let initializedCount = 0;
        
        this.modules.forEach((module, name) => {
            if (module.initialize && typeof module.initialize === 'function') {
                try {
                    module.initialize();
                    initializedCount++;
                    console.log(`✅ ${name}: Initialized`);
                } catch (error) {
                    console.error(`❌ ${name}: Failed to initialize:`, error);
                }
            }
        });
        
        console.log(`✅ ${initializedCount} modules initialized successfully`);
        return initializedCount;
    }

    // NEW: Debug utility
    static debugModules() {
        console.log('🔍 === FARM MODULES DEBUG ===');
        console.log('Total modules:', this.modules.size);
        console.log('Module names:', Array.from(this.modules.keys()));
        console.log('Current module:', this.currentModule);
        console.log('App data keys:', Object.keys(this.appData));
        console.log('===========================');
    }
}

// Initialize with default data structure
FarmModules.appData = {
    profile: {
        farmName: 'My Farm',
        farmerName: 'Farm Manager',
        farmType: 'poultry',
        currency: 'USD',
        lowStockThreshold: 10,
        autoSync: true,
        rememberUser: true,
        localStorageEnabled: true,
        memberSince: new Date().toISOString(),
        dashboardStats: {}
    },
    orders: [],
    inventory: [],
    customers: [],
    products: [],
    feedRecords: [],
    productionRecords: [],
    salesRecords: [],
    incomeExpenses: [],
    user: { name: 'Demo Farmer', farmName: 'Green Valley Farm' },
    farmName: 'Green Valley Farm'
};

// Make it globally available
window.FarmModules = FarmModules;

// Add debug helper
window.debugFarmModules = () => FarmModules.debugModules();

console.log('✅ FarmModules framework initialized');
console.log('🔧 Debug with: debugFarmModules()');
