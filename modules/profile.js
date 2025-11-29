// app.js - UPDATED WITH ERROR HANDLING
class FarmManagementApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.userPreferences = {};
        this.initialized = false;
    }

    async initialize() {
        console.log('🚀 Initializing Farm Management App...');
        
        try {
            // Load user preferences with fallback
            this.loadUserPreferences();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load initial section
            this.loadSection('dashboard');
            
            this.initialized = true;
            console.log('✅ Farm Management App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }

    loadUserPreferences() {
        try {
            // Check if ProfileModule exists, if not use localStorage directly
            if (typeof ProfileModule !== 'undefined' && ProfileModule.loadUserPreferences) {
                this.userPreferences = ProfileModule.loadUserPreferences();
            } else {
                // Fallback to direct localStorage access
                console.log('⚠️ ProfileModule not found, using localStorage fallback');
                const savedPrefs = localStorage.getItem('farm-user-preferences');
                this.userPreferences = savedPrefs ? JSON.parse(savedPrefs) : this.getDefaultPreferences();
                
                // Initialize ProfileModule if it exists but wasn't loaded properly
                if (typeof ProfileModule !== 'undefined' && !ProfileModule.initialized) {
                    ProfileModule.userPreferences = this.userPreferences;
                    ProfileModule.initialized = true;
                }
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
                totalProducts: 0
            }
        };
    }

    initializeUI() {
        // Setup navigation
        this.setupNavigation();
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        // Setup other UI components
        console.log('✅ UI initialized');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.loadSection(section);
                }
            });
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.updatePreference('theme', newTheme);
        
        // Update toggle button icon
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    updatePreference(key, value) {
        this.userPreferences[key] = value;
        
        // Save to ProfileModule if available, otherwise to localStorage directly
        if (typeof ProfileModule !== 'undefined' && ProfileModule.updatePreference) {
            ProfileModule.updatePreference(key, value);
        } else {
            localStorage.setItem('farm-user-preferences', JSON.stringify(this.userPreferences));
        }
    }

    async loadSection(section) {
        console.log(`🔄 Loading section: ${section}`);
        
        try {
            // Update active navigation
            this.updateActiveNav(section);
            
            // Show loading state
            this.showLoading();
            
            // Load section content
            await this.loadSectionContent(section);
            
            // Hide loading state
            this.hideLoading();
            
            this.currentSection = section;
            console.log(`✅ Section ${section} loaded successfully`);
        } catch (error) {
            console.error(`❌ Error loading section ${section}:`, error);
            this.showError(`Failed to load ${section}`);
            this.hideLoading();
        }
    }

    updateActiveNav(section) {
        // Remove active class from all links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current section link
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadSectionContent(section) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            throw new Error('Content area not found');
        }

        switch (section) {
            case 'dashboard':
                contentArea.innerHTML = this.renderDashboard();
                break;
            case 'orders':
                // Use framework to load orders module
                if (window.AppFramework) {
                    const success = window.AppFramework.switchToModule('orders');
                    if (!success) {
                        contentArea.innerHTML = this.renderFallbackContent('Orders', 'Orders module is currently unavailable.');
                    }
                } else {
                    contentArea.innerHTML = this.renderFallbackContent('Orders', 'Framework not initialized.');
                }
                break;
            case 'inventory':
                contentArea.innerHTML = this.renderFallbackContent('Inventory', 'Inventory management coming soon!');
                break;
            case 'finance':
                contentArea.innerHTML = this.renderFallbackContent('Finance', 'Financial tracking coming soon!');
                break;
            case 'reports':
                contentArea.innerHTML = this.renderFallbackContent('Reports', 'Reporting dashboard coming soon!');
                break;
            case 'settings':
                contentArea.innerHTML = this.renderFallbackContent('Settings', 'Application settings coming soon!');
                break;
            default:
                contentArea.innerHTML = this.renderFallbackContent('Dashboard', 'Welcome to Farm Management System');
        }
    }

    renderDashboard() {
        const stats = this.userPreferences.dashboardStats || {};
        
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

                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">Quick Actions</h3>
                    <div class="quick-action-grid">
                        <button class="quick-action-btn" onclick="farmApp.loadSection('orders')">
                            <div style="font-size: 32px;">📋</div>
                            <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Manage Orders</span>
                            <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Create and track orders</span>
                        </button>
                        <button class="quick-action-btn" onclick="farmApp.loadSection('inventory')">
                            <div style="font-size: 32px;">📦</div>
                            <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Inventory</span>
                            <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage stock levels</span>
                        </button>
                        <button class="quick-action-btn" onclick="farmApp.loadSection('reports')">
                            <div style="font-size: 32px;">📊</div>
                            <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Reports</span>
                            <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View analytics</span>
                        </button>
                        <button class="quick-action-btn" onclick="farmApp.loadSection('settings')">
                            <div style="font-size: 32px;">⚙️</div>
                            <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Settings</span>
                            <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">App configuration</span>
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 16px;">Recent Activity</h3>
                        <div style="color: var(--text-secondary); text-align: center; padding: 40px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                            <div>Activity feed coming soon</div>
                        </div>
                    </div>
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 16px;">System Status</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-secondary);">Orders Module</span>
                                <span style="color: #22c55e; font-weight: 600;">● Active</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-secondary);">Profile Module</span>
                                <span style="color: ${typeof ProfileModule !== 'undefined' ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                                    ${typeof ProfileModule !== 'undefined' ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-secondary);">Data Storage</span>
                                <span style="color: #22c55e; font-weight: 600;">● OK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFallbackContent(title, message) {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">${title}</h1>
                    <p class="module-subtitle">${message}</p>
                </div>
                <div class="glass-card" style="padding: 40px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 16px;">🚧</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">Under Development</h3>
                    <p style="color: var(--text-secondary);">This section is currently being developed and will be available soon.</p>
                    <button class="btn-primary" onclick="farmApp.loadSection('dashboard')" style="margin-top: 16px;">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    showLoading() {
        // You can implement a loading spinner here
        console.log('⏳ Loading...');
    }

    hideLoading() {
        // Hide loading spinner
        console.log('✅ Loading complete');
    }

    showError(message) {
        // You can implement a toast notification here
        console.error('❌ Error:', message);
        alert(`Error: ${message}`);
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
