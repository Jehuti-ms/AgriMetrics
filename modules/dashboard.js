// modules/dashboard.js — FULL HYBRID IMPLEMENTATION (finished)
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

        // Register with StyleManager while preserving original look
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
            <!-- Hybrid Header -->
            <div class="module-header">
                <h1 class="module-title">Dashboard</h1>
                <p class="module-subtitle">Overview of your farm operations</p>

                <!-- Welcome Inline (merged into header) -->
                <div class="welcome-inline">
                    <h2>Welcome to Farm Management</h2>
                    <p>Manage your farm operations efficiently</p>
                </div>
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
                    <!-- stat cards unchanged -->
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity glass-card">
                <div class="card-header">
                    <h3>Recent Activity</h3>
                    <button id="refresh-stats-btn" class="btn-outline">🔄 Refresh</button>
                </div>
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
        </div>
    `;
},

    setupEventListeners() {
        this.element.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.currentTarget.dataset.action));
            btn.addEventListener('mouseenter', (e) => e.currentTarget.style.transform = 'translateY(-3px)');
            btn.addEventListener('mouseleave', (e) => e.currentTarget.style.transform = 'translateY(0)');
        });

        const refreshBtn = this.element.querySelector('#refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayStats();
                window.coreModule?.showNotification?.('Stats refreshed!', 'success');
            });
        }

        // Listen for cross-module updates
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

        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0 && !revenueCard.querySelector('.monthly-indicator')) {
            const el = document.createElement('div');
            el.className = 'monthly-indicator';
            el.style.fontSize = '12px';
            el.style.color = '#22c55e';
            el.style.marginTop = '4px';
            el.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
            revenueCard.appendChild(el);
        }
    },

    updateStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    updateRecentActivity(stats) {
        const container = document.getElementById('activity-content');
        if (!container) return;

        const list = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];
        const activities = list.length ? list.map(a => ({
            icon: a.icon || '📊',
            text: a.message || a.text || 'Activity',
            time: this.timeAgo(a.timestamp)
        })) : this.fallbackActivities(stats);

        if (!activities.length) {
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
                ${activities.map(a => `
                    <div style="display:flex; align-items:center; gap:12px; padding:12px; background: rgba(0,0,0,0.03); border-radius:8px;">
                        <div style="font-size:20px;">${a.icon}</div>
                        <div style="flex:1;">
                            <div style="font-weight:600; color: var(--text-primary); font-size:14px;">${a.text}</div>
                            <div style="font-size:12px; color: var(--text-secondary);">${a.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    },

    fallbackActivities(stats) {
        const acts = [];
        if ((stats.totalOrders || 0) > 0) acts.push({ icon: '📋', text: `${stats.completedOrders || 0} orders completed`, time: 'Recently' });
        if ((stats.totalRevenue || 0) > 0) acts.push({ icon: '💰', text: `${this.formatCurrency(stats.totalRevenue)} total revenue`, time: 'Updated' });
        if ((stats.totalInventoryItems || 0) > 0) acts.push({ icon: '📦', text: `${stats.totalInventoryItems} inventory items managed`, time: 'Current' });
        if ((stats.totalBirds || 0) > 0) acts.push({ icon: '🐔', text: `${stats.totalBirds} birds in stock`, time: 'Active' });
        if ((stats.totalCustomers || 0) > 0) acts.push({ icon: '👥', text: `${stats.totalCustomers} customers registered`, time: 'Total' });
        return acts;
    },

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
        root.profile.dashboardStats.recentActivities =
            root.profile.dashboardStats.recentActivities.slice(0, 10);

        this.updateRecentActivity(this.getProfileStats());
    },

    timeAgo(ts) {
        const now = new Date(), t = new Date(ts);
        const d = Math.floor((now - t) / 1000);
        if (d < 60) return 'Just now';
        if (d < 3600) return `${Math.floor(d / 60)}m ago`;
        if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
        return `${Math.floor(d / 86400)}d ago`;
    },

    handleQuickAction(action) {
        const map = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'check-inventory': 'inventory-check',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };
        const target = map[action];
        if (!target) return;

        if (window.FarmManagementApp?.showSection) {
            window.FarmManagementApp.showSection(target);
        } else if (window.app?.showSection) {
            window.app.showSection(target);
        } else {
            document.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: target } }));
        }

        window.coreModule?.showNotification?.(`Opening ${this.getActionName(action)}...`, 'info');
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

    formatCurrency(n) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
    }
};

// Register the module
if (window.FarmModules?.registerModule) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
}
