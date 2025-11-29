// app.js - UPDATED WITH PROPER PROFILEMODULE USAGE
class FarmManagementApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.userPreferences = {};
        this.initialized = false;
    }

    async initialize() {
        console.log('🚀 Initializing Farm Management App...');
        
        try {
            // Initialize ProfileModule first
            this.initializeProfileModule();
            
            // Load user preferences
            this.loadUserPreferences();
            
            // Initialize UI components
            this.initializeUI();
            
            // Initialize framework and modules
            await this.initializeFramework();
            
            // Load initial section
            this.loadSection('dashboard');
            
            this.initialized = true;
            console.log('✅ Farm Management App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }

    initializeProfileModule() {
        try {
            // Check if ProfileModule is available and initialize it
            if (window.profileInstance && typeof window.profileInstance.initialize === 'function') {
                window.profileInstance.initialize();
                console.log('✅ ProfileModule initialized');
            } else {
                console.log('⚠️ ProfileModule not available, creating fallback');
                this.createFallbackProfileModule();
            }
        } catch (error) {
            console.error('❌ Error initializing ProfileModule:', error);
            this.createFallbackProfileModule();
        }
    }

    createFallbackProfileModule() {
        // Create a simple fallback if ProfileModule is not available
        window.profileInstance = {
            initialized: true,
            userPreferences: this.getDefaultPreferences(),
            updateStats: (stats) => {
                console.log('📊 Fallback stats update:', stats);
                if (!this.userPreferences.dashboardStats) {
                    this.userPreferences.dashboardStats = {};
                }
                Object.keys(stats).forEach(key => {
                    this.userPreferences.dashboardStats[key] = stats[key];
                });
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
            },
            updateBusinessStats: (module, stats) => {
                console.log(`🔄 Fallback sync for ${module}:`, stats);
                this.updateStats(stats);
            },
            getStats: () => this.userPreferences.dashboardStats || {},
            getUserPreferences: () => this.userPreferences,
            updatePreference: (key, value) => {
                this.userPreferences[key] = value;
                localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
            }
        };
    }

    loadUserPreferences() {
        try {
            // Use profileInstance if available
            if (window.profileInstance && window.profileInstance.getUserPreferences) {
                this.userPreferences = window.profileInstance.getUserPreferences();
            } else {
                // Fallback to direct localStorage access
                console.log('⚠️ Using localStorage fallback for preferences');
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
            }
            console.log('✅ User preferences loaded:', this.userPreferences);
        } catch (error) {
            console.error('❌ Error loading user preferences:', error);
            this.userPreferences = this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'light',
            language: 'en',
            currency: 'USD',
            notifications: true,
            businessName: 'My Farm',
            businessType: 'poultry',
            dashboardStats: {
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                monthlyOrders: 0,
                monthlyRevenue: 0,
                totalCustomers: 0,
                totalProducts: 0,
                avgOrderValue: 0,
                completedOrders: 0,
                paidOrders: 0
            }
        };
    }

    async initializeFramework() {
        // Initialize the framework and register modules
        if (window.AppFramework) {
            // Register available modules
            if (window.profileInstance) {
                window.AppFramework.registerModule(window.profileInstance);
            }
            if (window.OrdersModule) {
                window.AppFramework.registerModule(window.OrdersModule);
            }
            console.log('✅ Framework initialized with modules');
        } else {
            console.log('⚠️ Framework not available');
        }
    }

    // ... rest of your existing app.js methods remain the same ...

    updatePreference(key, value) {
        this.userPreferences[key] = value;
        
        // Save to profileInstance if available
        if (window.profileInstance && window.profileInstance.updatePreference) {
            window.profileInstance.updatePreference(key, value);
        } else {
            localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
        }
    }

    // Update the dashboard to use profileInstance stats
    renderDashboard() {
        let stats = {};
        
        // Get stats from profileInstance if available
        if (window.profileInstance && window.profileInstance.getStats) {
            stats = window.profileInstance.getStats();
        } else {
            stats = this.userPreferences.dashboardStats || {};
        }
        
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Dashboard</h1>
                    <p class="module-subtitle">Welcome back to your farm management system</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalOrders || 0}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalRevenue || 0)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalCustomers || 0}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Customers</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalProducts || 0}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Products</div>
                    </div>
                </div>

                <!-- System Status Card -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">System Status</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                            <span style="color: var(--text-secondary);">Profile Module</span>
                            <span style="color: ${window.profileInstance ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                                ${window.profileInstance ? '● Active' : '● Inactive'}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                            <span style="color: var(--text-secondary);">Orders Module</span>
                            <span style="color: ${window.OrdersModule ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                                ${window.OrdersModule ? '● Active' : '● Inactive'}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                            <span style="color: var(--text-secondary);">Data Sync</span>
                            <span style="color: #22c55e; font-weight: 600;">● Active</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                            <span style="color: var(--text-secondary);">Storage</span>
                            <span style="color: #22c55e; font-weight: 600;">● OK</span>
                        </div>
                    </div>
                </div>

                <!-- Rest of your dashboard content... -->
            </div>
        `;
    }
}

// Create global instance
const farmApp = new FarmManagementApp();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    farmApp.initialize();
});

// Make available globally
window.FarmManagementApp = FarmManagementApp;
window.farmApp = farmApp;
