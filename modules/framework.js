// modules/framework.js - Main framework for module management
if (typeof window.FarmModules === 'undefined') {
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
                    this.showErrorContent(name, error);
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

        static showFallbackContent(moduleName) {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="section active">
                        <div class="module-header">
                            <h1>${this.formatModuleName(moduleName)}</h1>
                            <p>Module is being developed</p>
                        </div>
                        <div class="fallback-content">
                            <p>This module is not available yet. Please check back later.</p>
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
                            <button class="btn btn-primary" onclick="FarmModules.initializeModule('${moduleName}')">
                                Retry
                            </button>
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
        reportTemplates: [],
        user: null,
        farmName: 'My Farm'
    };

    // Make it globally available
    window.FarmModules = FarmModules;
    console.log('FarmModules framework initialized');
}
