// modules/dashboard.js — CLEAN REWRITE WITH STYLE MANAGER INTEGRATION AND CONSISTENT CLASSES
console.log('Loading dashboard module...');

const DashboardModule = {
    // Identity
    id: 'dashboard',
    name: 'dashboard',

    // State
    initialized: false,
    element: null,

    // Initialization
    initialize() {
        console.log('📊 Initializing Dashboard...');

        // Locate content area
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.warn('❌ Dashboard: #content-area not found');
            return false;
        }

        // Register with StyleManager BEFORE rendering so grid and header styles apply
        if (window.StyleManager && typeof StyleManager.registerModule === 'function') {
            StyleManager.registerModule(this.id, this.element, this);
            // Apply module-specific header and grid variables
            const config = StyleManager.moduleConfigs?.[this.id];
            if (config) {
                this.element.style.setProperty('--header-gradient', config.headerGradient);
                this.element.style.setProperty('--stats-grid', config.statsGrid);
            }
        }

        // Render and wire up
        this.renderDashboard();
        this.setupEventListeners();

        // Load stats and update UI
        this.loadAndDisplayStats();

        this.initialized = true;
        console.log('✅ Dashboard initialized with StyleManager');
        return true;
    },

    // StyleManager theme callback
    onThemeChange(theme) {
        console.log(`Dashboard updating for theme: ${theme}`);
    },

    // Event setup (delegates to specific binders)
    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();

        // Listen for cross-module stat sync events (optional but non-breaking)
        document.addEventListener('financialStatsUpdated', (e) => {
            if (e?.detail) this.updateDashboardStats(e.detail);
        });
    },

    // Render main dashboard view
    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <h1 class="module-title">Dashboard</h1>
                    <p class="module-subtitle">Overview of your farm operations</p>
                </div>

                <!-- Welcome -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>Welcome to Farm Management</h3>
                    </div>
                    <p>Manage your farm operations efficiently with quick actions and live stats.</p>
                </div>

                <!-- Quick Actions -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>Quick actions</h3>
                    </div>
                    <div class="quick-action-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div>💰</div>
                            <span>Add Income</span>
                            <span>Record new income</span>
                        </button>
                        <button class="quick-action-btn" data-action="add-expense">
                            <div>💸</div>
                            <span>Add Expense</span>
                            <span>Record new expense</span>
                        </button>
                        <button class="quick-action-btn" data-action="check-inventory">
                            <div>📦</div>
                            <span>Check Inventory</span>
                            <span>View stock levels</span>
                        </button>
                        <button class="quick-action-btn" data-action="record-feed">
                            <div>🌾</div>
                            <span>Record Feed</span>
                            <span>Log feed usage</span>
                        </button>
                        <button class="quick-action-btn" data-action="add-production">
                            <div>🚜</div>
                            <span>Production</span>
                            <span>Record production</span>
                        </button>
                        <button class="quick-action-btn" data-action="view-reports">
                            <div>📈</div>
                            <span>View Reports</span>
                            <span>Analytics & insights</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>Overview</h3>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card" id="revenue-card">
                            <div>💰</div>
                            <div id="total-revenue">$0.00</div>
                            <div>Total Revenue</div>
                        </div>
                        <div class="stat-card" id="expense-card">
                            <div>💸</div>
                            <div id="total-expenses">$0.00</div>
                            <div>Total Expenses</div>
                        </div>
                        <div class="stat-card" id="inventory-card">
                            <div>📦</div>
                            <div id="inventory-items">0</div>
                            <div>Inventory Items</div>
                        </div>
                        <div class="stat-card" id="birds-card">
                            <div>🐔</div>
                            <div id="active-birds">0</div>
                            <div>Active Birds</div>
                        </div>
                        <div class="stat-card" id="orders-card">
                            <div>📋</div>
                            <div id="total-orders">0</div>
                            <div>Total Orders</div>
                        </div>
                        <div class="stat-card" id="profit-card">
                            <div>📊</div>
                            <div id="net-profit">$0.00</div>
                            <div>Net Profit</div>
                        </div>
                        <div class="stat-card" id="customers-card">
                            <div>👥</div>
                            <div id="total-customers">0</div>
                            <div>Customers</div>
                        </div>
                        <div class="stat-card" id="products-card">
                            <div>🛒</div>
                            <div id="total-products">0</div>
                            <div>Products</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>Recent activity</h3>
                    </div>
                    <div class="activity-list">
                        <div id="activity-content">
                            <div class="empty-state" style="text-align:center; color: var(--text-secondary); padding: 24px;">
                                <div style="font-size: 40px; margin-bottom: 12px;">📊</div>
                                <div style="font-weight: 600; color: var(--text-primary);">No recent activity</div>
                                <div style="font-size: 14px;">Start by adding your first record</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>Actions</h3>
                    </div>
                    <div class="refresh-container" style="display:flex; justify-content:flex-end;">
                        <button id="refresh-stats-btn" class="btn-outline">🔄 Refresh Stats</button>
                    </div>
                </div>
            </div>
        `;

        // Ensure hover effects (subtle; CSS already handles most)
        const quickButtons = this.element.querySelectorAll('.quick-action-btn');
        quickButtons.forEach((btn) => {
            btn.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
            });
            btn.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    // Bind quick action navigation
    setupQuickActions() {
        const quickActionButtons = this.element?.querySelectorAll('.quick-action-btn') || [];
        quickActionButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    },

    // Bind refresh button
    setupRefreshButton() {
        const refreshBtn = this.element?.querySelector('#refresh-stats-btn');
        if (!refreshBtn) return;

        refreshBtn.addEventListener('click', () => {
            this.loadAndDisplayStats();
            if (window.coreModule?.showNotification) {
                window.coreModule.showNotification('Stats refreshed!', 'success');
            }
        });

        refreshBtn.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
        });
        refreshBtn.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
        });
    },

    // Orchestrates stats reload + UI update
    loadAndDisplayStats() {
        const stats = this.getProfileStats();
        this.updateDashboardStats(stats);
        this.updateRecentActivity(stats);
    },

    // Read stats from shared appData or localStorage
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

        // Shared appData
        const shared = window.FarmModules?.appData?.profile?.dashboardStats;
        if (shared) stats = { ...stats, ...shared };

        // Fallback: local storage snapshot
        const saved = localStorage.getItem('farm-dashboard-stats');
        if (saved) {
            try {
                stats = { ...stats, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('⚠️ Failed to parse farm-dashboard-stats from localStorage');
            }
        }

        // Compute netProfit if not present
        if (typeof stats.netProfit !== 'number') {
            stats.netProfit = (stats.totalIncome || 0) - (stats.totalExpenses || 0);
        }

        return stats;
    },

    // Persist to shared structure and update UI
    updateDashboardStats(newStats) {
        if (window.FarmModules?.appData) {
            const root = window.FarmModules.appData;
            root.profile ||= {};
            root.profile.dashboardStats ||= {};
            Object.assign(root.profile.dashboardStats, newStats);
        }
        this.updateDashboardDisplay(newStats);
    },

    // Append activity into shared log, then update UI
    addRecentActivity(activity) {
        const root = window.FarmModules?.appData;
        if (!root) return;

        root.profile ||= {};
        root.profile.dashboardStats ||= {};
        root.profile.dashboardStats.recentActivities ||= [];

        root.profile.dashboardStats.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        // Trim to last 10
        root.profile.dashboardStats.recentActivities =
            root.profile.dashboardStats.recentActivities.slice(0, 10);

        // Refresh UI view
        this.updateRecentActivity(this.getProfileStats());
    },

    // Update stat cards
    updateDashboardDisplay(stats) {
        // Cards
        this.updateStatCard('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
        this.updateStatCard('active-birds', stats.totalBirds || 0);
        this.updateStatCard('total-orders', stats.totalOrders || 0);
        this.updateStatCard('net-profit', this.formatCurrency(stats.netProfit || ((stats.totalIncome || 0) - (stats.totalExpenses || 0))));
        this.updateStatCard('total-customers', stats.totalCustomers || 0);
        this.updateStatCard('total-products', stats.totalProducts || 0);

        // Profit card accent
        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || ((stats.totalIncome || 0) - (stats.totalExpenses || 0));
            const profitColor = netProfit >= 0 ? '#22c55e' : '#ef4444';
            profitCard.style.borderLeft = `4px solid ${profitColor}`;
        }

        // Monthly indicator appended once
        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0 && !revenueCard.querySelector('.monthly-indicator')) {
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.className = 'monthly-indicator';
            monthlyIndicator.style.fontSize = '12px';
            monthlyIndicator.style.color = '#22c55e';
            monthlyIndicator.style.marginTop = '4px';
            monthlyIndicator.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
            revenueCard.appendChild(monthlyIndicator);
        }
    },

    // Single stat cell animation and update
    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.style.transform = 'scale(1.06)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.textContent = value;
        }, 140);
    },

    // Render activity list
    updateRecentActivity(stats) {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = [];
        const recentActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];

        if (recentActivities.length > 0) {
            recentActivities.forEach((activity) => {
                activities.push({
                    icon: activity.icon || '📊',
                    text: activity.message || activity.text || 'Activity',
                    time: this.formatTimeAgo(activity.timestamp)
                });
            });
        } else {
            // Fallback derived items
            if ((stats.totalOrders || 0) > 0) {
                activities.push({
                    icon: '📋',
                    text: `${stats.completedOrders || 0} orders completed`,
                    time: 'Recently'
                });
            }
            if ((stats.totalRevenue || 0) > 0) {
                activities.push({
                    icon: '💰',
                    text: `${this.formatCurrency(stats.totalRevenue)} total revenue`,
                    time: 'Updated'
                });
            }
            if ((stats.totalInventoryItems || 0) > 0) {
                activities.push({
                    icon: '📦',
                    text: `${stats.totalInventoryItems} inventory items managed`,
                    time: 'Current'
                });
            }
            if ((stats.totalBirds || 0) > 0) {
                activities.push({
                    icon: '🐔',
                    text: `${stats.totalBirds} birds in stock`,
                    time: 'Active'
                });
            }
            if ((stats.totalCustomers || 0) > 0) {
                activities.push({
                    icon: '👥',
                    text: `${stats.totalCustomers} customers registered`,
                    time: 'Total'
                });
            }
        }

        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 24px;">
                    <div style="font-size: 40px; margin-bottom: 12px;">📊</div>
                    <div style="font-weight: 600; color: var(--text-primary);">No recent activity</div>
                    <div style="font-size: 14px;">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
                        <div style="font-size: 20px;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${activity.text}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Utility: human-friendly time
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    },

    // External trigger hook
    refreshStats() {
        this.loadAndDisplayStats();
    },

    // Navigation handling for quick actions
    handleQuickAction(action) {
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'check-inventory': 'inventory-check',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };

        const target = actionMap[action];
        if (!target) return;

        if (window.FarmManagementApp?.showSection) {
            window.FarmManagementApp.showSection(target);
        } else if (window.app?.showSection) {
            window.app.showSection(target);
        } else {
            const event = new CustomEvent('sectionChange', { detail: { section: target } });
            document.dispatchEvent(event);
        }

        if (window.coreModule?.showNotification) {
            window.coreModule.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
        }
    },

    // Pretty names for quick action notifications
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

    // Currency formatter
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }
};

// Register in FarmModules system
if (window.FarmModules && typeof window.FarmModules.registerModule === 'function') {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
}
