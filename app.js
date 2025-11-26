// app.js - Main Application Framework
class FarmManagementApp {
    constructor() {
        this.modules = new Map();
        this.currentModule = null;
        this.db = null;
        this.init();
    }

    async init() {
        console.log('🚜 Initializing Farm Management PWA...');
        
        // Initialize database
        await this.initDatabase();
        
        // Initialize module system
        await this.initModules();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load default module
        this.loadModule('dashboard');
        
        console.log('✅ Farm Management PWA Ready!');
    }

    async initDatabase() {
        // Simple IndexedDB wrapper
        this.db = {
            db: null,
            
            async open() {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('FarmManagementDB', 1);
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        this.db = request.result;
                        resolve(this.db);
                    };
                    
                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        
                        // Create object stores for all modules
                        const stores = [
                            'sales', 'production', 'broiler-mortality', 
                            'orders', 'profile', 'inventory'
                        ];
                        
                        stores.forEach(store => {
                            if (!db.objectStoreNames.contains(store)) {
                                db.createObjectStore(store, { keyPath: 'id' });
                            }
                        });
                    };
                });
            },

            async getAll(storeName) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.getAll();
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            },

            async get(storeName, key) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const request = store.get(key);
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            },

            async put(storeName, data) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.put(data);
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            },

            async delete(storeName, key) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.delete(key);
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            },

            async clear(storeName) {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.clear();
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }
        };

        try {
            await this.db.open();
            window.db = this.db; // Make available globally
            console.log('✅ Database initialized');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            window.db = null; // Fallback to localStorage
        }
    }

    async initModules() {
        // Module registry
        window.FarmModules = {
            modules: new Map(),
            
            registerModule(name, moduleInstance) {
                this.modules.set(name, moduleInstance);
                console.log(`✅ Module registered: ${name}`);
            },
            
            getModule(name) {
                return this.modules.get(name);
            },
            
            async loadModule(name) {
                const module = this.modules.get(name);
                if (module && !module.initialized) {
                    await module.initialize();
                }
                return module;
            }
        };
    }

    setupNavigation() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const moduleName = navItem.getAttribute('data-module');
                this.loadModule(moduleName);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const moduleName = e.state?.module || 'dashboard';
            this.loadModule(moduleName);
        });
    }

    async loadModule(moduleName) {
        try {
            // Unload current module
            if (this.currentModule && this.currentModule.cleanup) {
                await this.currentModule.cleanup();
            }

            // Load new module
            const module = await window.FarmModules.loadModule(moduleName);
            if (module) {
                this.currentModule = module;
                
                // Update UI
                this.updateActiveNav(moduleName);
                this.updatePageTitle(moduleName);
                
                // Update URL
                history.pushState({ module: moduleName }, '', `#${moduleName}`);
                
                console.log(`✅ Loaded module: ${moduleName}`);
            } else {
                console.error(`❌ Module not found: ${moduleName}`);
                this.loadModule('dashboard'); // Fallback
            }
        } catch (error) {
            console.error(`❌ Error loading module ${moduleName}:`, error);
        }
    }

    updateActiveNav(activeModule) {
        // Update navigation highlights
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-module') === activeModule);
        });
    }

    updatePageTitle(moduleName) {
        const titles = {
            dashboard: 'Dashboard',
            'sales-record': 'Sales Records',
            'broiler-mortality': 'Broiler Mortality',
            orders: 'Orders',
            production: 'Production',
            reports: 'Reports',
            profile: 'Profile'
        };
        
        document.title = `${titles[moduleName] || 'Farm Management'} - FarmPWA`;
    }
}

// Toast Notification System
window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 0;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                border: 1px solid rgba(0,0,0,0.1);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            .toast.show {
                transform: translateX(0);
            }
            .toast-content {
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: between;
                gap: 12px;
            }
            .toast-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
            }
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                padding: 4px;
            }
            .toast-success { border-left: 4px solid #10b981; }
            .toast-error { border-left: 4px solid #ef4444; }
            .toast-warning { border-left: 4px solid #f59e0b; }
            .toast-info { border-left: 4px solid #3b82f6; }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
};

// Utility functions
window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

window.formatDate = function(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

window.formatDateTime = function(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.farmApp = new FarmManagementApp();
});
