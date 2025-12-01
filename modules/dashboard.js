// modules/dashboard.js — FULL HYBRID IMPLEMENTATION
console.log('Loading dashboard module...');

const DashboardModule = {
    id: 'dashboard',
    name: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard...');
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Register with StyleManager
        if (window.StyleManager?.registerModule) {
            StyleManager.registerModule(this.id, this.element, this);
            const cfg = StyleManager.moduleConfigs?.[this.id];
            if (cfg) {
                this.element.style.setProperty('--header-gradient', cfg.headerGradient);
                this.element.style.setProperty('--stats-grid', cfg.statsGrid);
            }
        }

        this.renderDashboard();
        this.setupEventListeners();
        this.loadAndDisplayStats();

        this.initialized = true;
        console.log('✅ Dashboard initialized with StyleManager');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Dashboard updating for theme: ${theme}`);
    },

    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="dashboard-container module-container">
                <!-- Welcome Section -->
                <div class="welcome-section glass-card">
                    <h1>Welcome to Farm Management</h1>
                    <p>Manage your farm operations efficiently</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions glass-card">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid quick-action-grid">
                        <button class="quick-action-btn" data-action="add-income"><div>💰</div><span>Add Income</span><span>Record new income</span></button>
                        <button class="quick-action-btn" data-action="add-expense"><div>💸</div><span>Add Expense</span><span>Record new expense</span></button>
                        <button class="quick-action-btn" data-action="check-inventory"><div>📦</div><span>Check Inventory</span><span>View stock levels</span></button>
                        <button class="quick-action-btn" data-action="record-feed"><div>🌾</div><span>Record Feed</span><span>Log feed usage</span></button>
                        <button class="quick-action-btn" data-action="add-production"><div>🚜</div><span>Production</span><span>Record production</span></button>
                        <button class="quick-action-btn" data-action="view-reports"><div>📈</div><span>View Reports</span><span>Analytics & insights</span></button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview glass-card">
                    <h2>Overview</h2>
                    <div class="stats-grid">
                        <div class="summary-card stat-card" id="revenue-card"><div>💰</div><div id="total-revenue">$0.00</div><div>Total Revenue</div></div>
                        <div class="summary-card stat-card" id="expense-card"><div>💸</div><div id="total-expenses">$0.00</div><div>Total Expenses</div></div>
                        <div class="summary-card stat-card" id="inventory-card"><div>📦</div><div id="inventory-items">0</div><div>Inventory Items</div></div>
                        <div class="summary-card stat-card" id="birds-card"><div>🐔</div><div id="active-birds">0</div><div>Active Birds</div></div>
                        <div class="summary-card stat-card" id="orders-card"><div>📋</div><div id="total-orders">0</div><div>Total Orders</div></div>
                        <div class="summary-card stat-card" id="profit-card"><div>📊</div><div id="net-profit">$0.00</div><div>Net Profit</div></div>
                        <div class="summary-card stat-card" id="customers-card"><div>👥</div><div id="total-customers">0</div><div>Customers</div></div>
                        <div class="summary-card stat-card" id="products-card"><div>🛒</div><div id="total-products">0</div><div>Products</div></div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity glass-card">
                    <h2>Recent Activity</h2>
                    <div class="activity-list">
                        <div id="activity-content">
                            <div class="empty-state">
                                <div>📊</div>
                                <div>No recent activity</div>
                                <div>Start by adding your first record</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh Button -->
                <div class="refresh-container glass-card">
                    <button id="refresh-stats-btn" class="btn-outline">🔄 Refresh Stats</button>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        this.element.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.currentTarget.dataset.action));
        });

        const refreshBtn = this.element.querySelector('#refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayStats();
                window.coreModule?.showNotification?.('Stats refreshed!', 'success');
            });
        }

        document.addEventListener('financialStatsUpdated', (e) => {
            if (e?.detail) this.updateDashboardStats(e.detail);
        });
    },

    loadAndDisplayStats() {
        const stats = this.getProfileStats();
        this.updateDashboardStats(stats);
        this.updateRecentActivity(stats);
    },

    getProfileStats() {
        let stats = {
            totalIncome: 0, totalExpenses: 0, netProfit: 0,
            totalInventoryItems: 0, totalBirds: 0, totalOrders: 0,
            totalRevenue: 0, totalCustomers: 0, totalProducts: 0,
            monthlyRevenue: 0, completedOrders: 0
        };

        const shared = window.FarmModules?.appData?.profile?.dashboardStats;
        if (shared) stats = { ...stats, ...shared };

        const saved = localStorage.getItem('farm-dashboard-stats');
        if (saved) {
            try { stats = { ...stats, ...JSON.parse(saved) }; } catch {}
        }

        if (typeof stats.netProfit !== 'number') {
            stats.netProfit = (stats.totalIncome || 0) - (stats.totalExpenses || 0);
        }

        return stats;
    },

    updateDashboardStats(newStats) {
        if (window.FarmModules?.appData) {
            const root = window.FarmModules.appData;
            root.profile ||= {};
            root.profile.dashboardStats ||= {};
            Object.assign(root.profile.dashboardStats, newStats);
        }
        this.updateDashboardDisplay(newStats);
    },

    updateDashboardDisplay(stats) {
        this.updateStat('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStat('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStat('inventory-items', stats.totalInventoryItems || 0);
        this.updateStat('active-birds', stats.totalBirds || 0);
        this.updateStat('total-orders', stats.totalOrders || 0);
        this.updateStat('net-profit', this.formatCurrency(stats.netProfit ?? ((stats.totalIncome || 0) - (stats.totalExpenses || 0))));
        this.updateStat('total-customers', stats.totalCustomers || 0);
        this.updateStat('total-products', stats.totalProducts || 0);

        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const net = stats.netProfit ?? ((stats.totalIncome || 0) - (stats.totalExpenses || 0));
            profitCard.style.borderLeft = `4px solid ${net >= 0 ? '#22c55e' : '#ef4444'}`;
        }
    },

    updateStat(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = value;
    },

    updateRecentActivity(stats) {
        const container = document.getElementById('activity-content');
        if (!container) return;

        const list = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];
        if (!list.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📊</div>
                    <div>No recent activity</div>
                    <div>Start by adding your first record</div>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
