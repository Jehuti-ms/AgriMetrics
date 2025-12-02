// modules/dashboard.js - CSS-BASED VERSION (No StyleManager)
console.log('Loading dashboard module with CSS-based styling...');

const DashboardModule = {
    name: 'dashboard',
    id: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard with CSS...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Load CSS if not already loaded
        this.loadCSS();

        this.renderDashboard();
        this.setupEventListeners();
        this.initialized = true;
        
        // Load and display stats from shared data
        this.loadAndDisplayStats();
        
        console.log('✅ Dashboard initialized');
        return true;
    },

    loadCSS() {
        // Check if dashboard CSS is already loaded
        if (document.querySelector('link[href*="dashboard.css"]')) {
            return;
        }
        
        // Create link element for dashboard-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/dashboard.css';
        document.head.appendChild(link);
        
        // Make sure theme.css is loaded first
        if (!document.querySelector('link[href*="theme.css"]')) {
            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.href = 'css/theme.css';
            document.head.insertBefore(themeLink, link);
        }
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
    },

    // In dashboard.js, add this event listener
document.addEventListener('inventoryStatsUpdated', (e) => {
    const stats = e.detail;
    this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
    
    // You could also update a value card if you have one
    // this.updateStatCard('inventory-value', this.formatCurrency(stats.inventoryValue || 0));
});

    renderDashboard() {
        if (!this.element) return;

        // Clean HTML using only CSS classes - no inline styles
        this.element.innerHTML = `
            <div id="dashboard" class="module-container">
                <!-- Welcome Section -->
                <div class="dashboard-welcome">
                    <h1 class="welcome-header text-3xl font-bold">Welcome to Farm Management</h1>
                    <p class="welcome-subtitle text-lg text-tertiary">Manage your farm operations efficiently</p>
                </div>

                <!-- Quick Actions Grid -->
                <div class="dashboard-quick-actions">
                    <h2 class="dashboard-section-title">Quick Actions</h2>
                    <div class="dashboard-actions-grid">
                        <button class="dashboard-quick-action-btn" data-action="add-income">
                            <div class="action-icon">💰</div>
                            <span class="action-title">Add Income</span>
                            <span class="action-subtitle">Record new income</span>
                        </button>

                        <button class="dashboard-quick-action-btn" data-action="add-expense">
                            <div class="action-icon">💸</div>
                            <span class="action-title">Add Expense</span>
                            <span class="action-subtitle">Record new expense</span>
                        </button>

                        <button class="dashboard-quick-action-btn" data-action="check-inventory">
                            <div class="action-icon">📦</div>
                            <span class="action-title">Check Inventory</span>
                            <span class="action-subtitle">View stock levels</span>
                        </button>

                        <button class="dashboard-quick-action-btn" data-action="record-feed">
                            <div class="action-icon">🌾</div>
                            <span class="action-title">Record Feed</span>
                            <span class="action-subtitle">Log feed usage</span>
                        </button>

                        <button class="dashboard-quick-action-btn" data-action="add-production">
                            <div class="action-icon">🚜</div>
                            <span class="action-title">Production</span>
                            <span class="action-subtitle">Record production</span>
                        </button>

                        <button class="dashboard-quick-action-btn" data-action="view-reports">
                            <div class="action-icon">📈</div>
                            <span class="action-title">View Reports</span>
                            <span class="action-subtitle">Analytics & insights</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="dashboard-stats-overview">
                    <h2 class="dashboard-section-title">Overview</h2>
                    <div class="dashboard-stats-grid">
                        <div class="dashboard-stat-card" id="revenue-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value" id="total-revenue">$0.00</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>

                        <div class="dashboard-stat-card" id="expense-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-value" id="total-expenses">$0.00</div>
                            <div class="stat-label">Total Expenses</div>
                        </div>

                        <div class="dashboard-stat-card" id="inventory-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-value" id="inventory-items">0</div>
                            <div class="stat-label">Inventory Items</div>
                        </div>

                        <div class="dashboard-stat-card" id="birds-card">
                            <div class="stat-icon">🐔</div>
                            <div class="stat-value" id="active-birds">0</div>
                            <div class="stat-label">Active Birds</div>
                        </div>

                        <div class="dashboard-stat-card" id="orders-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-orders">0</div>
                            <div class="stat-label">Total Orders</div>
                        </div>

                        <div class="dashboard-stat-card" id="profit-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value" id="net-profit">$0.00</div>
                            <div class="stat-label">Net Profit</div>
                        </div>

                        <div class="dashboard-stat-card" id="customers-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value" id="total-customers">0</div>
                            <div class="stat-label">Customers</div>
                        </div>

                        <div class="dashboard-stat-card" id="products-card">
                            <div class="stat-icon">🛒</div>
                            <div class="stat-value" id="total-products">0</div>
                            <div class="stat-label">Products</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                    <h2 class="dashboard-section-title">Recent Activity</h2>
                    <div class="dashboard-activity-list">
                        <div id="activity-content">
                            <div class="dashboard-empty-state">
                                <div class="empty-icon">📊</div>
                                <div class="empty-title">No recent activity</div>
                                <div class="empty-subtitle">Start by adding your first record</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh Button -->
                <div class="text-center mt-8">
                    <button id="refresh-stats-btn" class="dashboard-refresh-btn">
                        🔄 Refresh Stats
                    </button>
                </div>
            </div>
        `;

        // No more applyLayoutStyles() or applyThemeStyles() - CSS handles everything
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.dashboard-quick-action-btn');
        
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    },

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayStats();
                if (window.coreModule && window.coreModule.showNotification) {
                    window.coreModule.showNotification('Stats refreshed!', 'success');
                }
            });
        }
    },

    // ... [KEEP ALL YOUR EXISTING FUNCTIONALITY METHODS - NO CHANGES NEEDED] ...
    loadAndDisplayStats() {
        const profileStats = this.getProfileStats();
        this.updateDashboardStats(profileStats);
        this.updateRecentActivity(profileStats);
    },

    getProfileStats() {
        let stats = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            totalInventoryItems: 0,
            totalBirds: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            monthlyRevenue: 0,
            completedOrders: 0
        };

        if (window.FarmModules && window.FarmModules.appData) {
            const sharedStats = window.FarmModules.appData.profile?.dashboardStats;
            if (sharedStats) {
                stats = { ...stats, ...sharedStats };
            }
        }

        if (stats.totalIncome === 0) {
            const savedStats = localStorage.getItem('farm-dashboard-stats');
            if (savedStats) {
                stats = { ...stats, ...JSON.parse(savedStats) };
            }
        }

        return stats;
    },

    updateDashboardStats(newStats) {
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            Object.assign(window.FarmModules.appData.profile.dashboardStats, newStats);
        }

        this.updateDashboardDisplay(newStats);
    },

    addRecentActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

        if (!window.FarmModules.appData.profile) {
            window.FarmModules.appData.profile = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats) {
            window.FarmModules.appData.profile.dashboardStats = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats.recentActivities) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = [];
        }

        window.FarmModules.appData.profile.dashboardStats.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        if (window.FarmModules.appData.profile.dashboardStats.recentActivities.length > 10) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = 
                window.FarmModules.appData.profile.dashboardStats.recentActivities.slice(0, 10);
        }

        this.updateRecentActivity(this.getProfileStats());
    },

    updateDashboardDisplay(stats) {
        this.updateStatCard('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
        this.updateStatCard('active-birds', stats.totalBirds || 0);
        this.updateStatCard('total-orders', stats.totalOrders || 0);
        this.updateStatCard('net-profit', this.formatCurrency(stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0));
        this.updateStatCard('total-customers', stats.totalCustomers || 0);
        this.updateStatCard('total-products', stats.totalProducts || 0);

        // Update profit card color based on profit/loss
        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0;
            if (netProfit >= 0) {
                profitCard.classList.remove('negative');
                profitCard.classList.add('positive');
            } else {
                profitCard.classList.remove('positive');
                profitCard.classList.add('negative');
            }
        }

        // Add monthly revenue indicator if available
        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0) {
            // Remove existing indicator if present
            const existingIndicator = revenueCard.querySelector('.monthly-indicator');
            if (existingIndicator) existingIndicator.remove();
            
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.className = 'monthly-indicator text-xs text-success mt-1';
            monthlyIndicator.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
            revenueCard.appendChild(monthlyIndicator);
        }
    },

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation class
            element.classList.add('stat-updating');
            setTimeout(() => {
                element.classList.remove('stat-updating');
                element.textContent = value;
            }, 150);
        }
    },

    updateRecentActivity(stats) {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = [];
        const recentActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];

        if (recentActivities.length > 0) {
            recentActivities.forEach(activity => {
                activities.push({
                    icon: activity.icon || '📊',
                    text: activity.message || activity.text || 'Activity',
                    time: this.formatTimeAgo(activity.timestamp)
                });
            });
        } else {
            if (stats.totalOrders > 0) {
                activities.push({
                    icon: '📋',
                    text: `${stats.completedOrders || 0} orders completed`,
                    time: 'Recently'
                });
            }

            if (stats.totalRevenue > 0) {
                activities.push({
                    icon: '💰',
                    text: `${this.formatCurrency(stats.totalRevenue)} total revenue`,
                    time: 'Updated'
                });
            }

            if (stats.totalInventoryItems > 0) {
                activities.push({
                    icon: '📦',
                    text: `${stats.totalInventoryItems} inventory items managed`,
                    time: 'Current'
                });
            }

            if (stats.totalBirds > 0) {
                activities.push({
                    icon: '🐔',
                    text: `${stats.totalBirds} birds in stock`,
                    time: 'Active'
                });
            }

            if (stats.totalCustomers > 0) {
                activities.push({
                    icon: '👥',
                    text: `${stats.totalCustomers} customers registered`,
                    time: 'Total'
                });
            }
        }

        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="dashboard-empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-subtitle">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div class="dashboard-activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    },

    refreshStats() {
        this.loadAndDisplayStats();
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses', 
            'check-inventory': 'inventory-check',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };

        const targetModule = actionMap[action];
        if (targetModule) {
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(targetModule);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(targetModule);
            } else {
                const event = new CustomEvent('sectionChange', { 
                    detail: { section: targetModule } 
                });
                document.dispatchEvent(event);
            }
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
            }
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Income & Expenses',
            'add-expense': 'Income & Expenses', 
            'check-inventory': 'Inventory Check',
            'record-feed': 'Feed Records',
            'add-production': 'Production',
            'view-reports': 'Reports'
        };
        return names[action] || action;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
}

// Export for global access
window.DashboardModule = DashboardModule;
