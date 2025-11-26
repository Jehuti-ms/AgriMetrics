// modules/framework.js - PWA Style
console.log('Loading FarmModules framework...');

class FarmModules {
    static modules = new Map();
    static appData = {
        inventory: [],
        transactions: [],
        production: [],
        orders: [],
        sales: [],
        projects: [],
        feedRecords: []
    };
    static currentModule = null;

    static registerModule(name, moduleConfig) {
        console.log(`Registering module: ${name}`);
        this.modules.set(name, moduleConfig);
        
        // Auto-initialize if module has init method
        if (moduleConfig.init && typeof moduleConfig.init === 'function') {
            moduleConfig.init();
        }
        
        return true;
    }

    static showModule(moduleName) {
        console.log(`Showing module: ${moduleName}`);
        
        const module = this.modules.get(moduleName);
        const contentArea = document.getElementById('content-area');
        const pageTitle = document.getElementById('page-title');
        
        if (!module || !contentArea) {
            console.error(`Module ${moduleName} not found or content area missing`);
            return false;
        }

        // Update page title
        if (pageTitle && module.moduleName) {
            pageTitle.textContent = module.moduleName;
        }

        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh; flex-direction: column; gap: var(--spacing-4);">
                <div class="loading-spinner"></div>
                <div style="font: var(--body-large); color: var(--on-surface-variant);">
                    Loading ${module.moduleName}...
                </div>
            </div>
        `;

        // Load module content
        setTimeout(() => {
            try {
                if (module.render && typeof module.render === 'function') {
                    module.render(contentArea);
                } else if (module.renderDashboard) {
                    module.renderDashboard();
                } else {
                    this.showFallbackModule(moduleName, contentArea);
                }
                
                this.currentModule = moduleName;
                this.updateActiveNavigation(moduleName);
                
                console.log(`✅ Module ${moduleName} loaded successfully`);
            } catch (error) {
                console.error(`Error loading module ${moduleName}:`, error);
                this.showErrorState(moduleName, contentArea, error);
            }
        }, 300);

        return true;
    }

    static showFallbackModule(moduleName, contentArea) {
        const moduleNames = {
            'dashboard': 'Dashboard',
            'income-expenses': 'Income & Expenses',
            'inventory-check': 'Inventory Check',
            'feed-record': 'Feed Records',
            'broiler-mortality': 'Broiler Mortality',
            'orders': 'Orders',
            'sales-record': 'Sales Records',
            'reports': 'Reports',
            'profile': 'Profile'
        };

        const displayName = moduleNames[moduleName] || moduleName;
        
        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1>${displayName}</h1>
                    <p>Manage your ${displayName.toLowerCase()} efficiently</p>
                </div>
                
                <div class="fallback-content">
                    <div style="text-align: center; padding: var(--spacing-10);">
                        <div style="font-size: 64px; margin-bottom: var(--spacing-4); opacity: 0.5;">
                            ${this.getModuleIcon(moduleName)}
                        </div>
                        <h2 style="font: var(--title-large); margin-bottom: var(--spacing-2);">
                            Module Coming Soon
                        </h2>
                        <p style="font: var(--body-large); color: var(--on-surface-variant); margin-bottom: var(--spacing-6);">
                            The ${displayName} module is under active development.
                        </p>
                        <button onclick="FarmModules.showModule('dashboard')" class="btn btn-primary">
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static showErrorState(moduleName, contentArea, error) {
        contentArea.innerHTML = `
            <div class="error-state">
                <div style="text-align: center; padding: var(--spacing-10);">
                    <div style="font-size: 64px; margin-bottom: var(--spacing-4);">❌</div>
                    <h2 style="font: var(--title-large); margin-bottom: var(--spacing-2);">
                        Loading Error
                    </h2>
                    <p style="font: var(--body-large); color: var(--on-surface-variant); margin-bottom: var(--spacing-4);">
                        Failed to load ${moduleName}
                    </p>
                    <div style="background: color-mix(in srgb, var(--error) 10%, transparent); 
                                padding: var(--spacing-4); border-radius: var(--radius-medium); 
                                margin-bottom: var(--spacing-6); font: var(--body-medium);">
                        ${error.message}
                    </div>
                    <button onclick="FarmModules.showModule('dashboard')" class="btn btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    static updateActiveNavigation(moduleName) {
        // Update sidebar active state
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            const itemModule = item.getAttribute('data-module');
            if (itemModule === moduleName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    static getModuleIcon(moduleName) {
        const icons = {
            'dashboard': '📊',
            'income-expenses': '💰',
            'inventory-check': '📦',
            'feed-record': '🌾',
            'broiler-mortality': '🐔',
            'orders': '📋',
            'sales-record': '💳',
            'reports': '📈',
            'profile': '👤'
        };
        return icons[moduleName] || '📁';
    }

    static saveDataToStorage() {
        try {
            localStorage.setItem('farmData', JSON.stringify(this.appData));
            console.log('✅ Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    static loadData() {
        try {
            const saved = localStorage.getItem('farmData');
            if (saved) {
                this.appData = { ...this.appData, ...JSON.parse(saved) };
                console.log('✅ Data loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    static init() {
        console.log('🔄 Initializing FarmModules framework...');
        this.loadData();
        console.log('✅ FarmModules framework initialized');
    }
}

// Initialize framework
FarmModules.init();

// Make globally available
window.FarmModules = FarmModules;
console.log('✅ FarmModules framework ready');
