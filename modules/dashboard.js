// modules/dashboard.js
console.log('Loading dashboard module...');

class DashboardModule {
    constructor() {
        this.name = 'dashboard';
        this.initialized = false;
        this.container = null;
        this.stats = {};
    }

    async initialize() {
        console.log('📊 Initializing dashboard...');
        await this.loadStats();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadStats() {
        // Load data from all modules to calculate stats
        try {
            let salesData = [];
            let productionData = [];
            let mortalityData = [];
            let ordersData = [];

            if (window.db) {
                salesData = await window.db.getAll('sales') || [];
                productionData = await window.db.getAll('production') || [];
                mortalityData = await window.db.getAll('broiler-mortality') || [];
                ordersData = await window.db.getAll('orders') || [];
            } else {
                salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
                productionData = JSON.parse(localStorage.getItem('farm-production') || '[]');
                mortalityData = JSON.parse(localStorage.getItem('farm-broiler-mortality') || '[]');
                ordersData = JSON.parse(localStorage.getItem('farm-orders') || '[]');
            }

            // Calculate stats
            const today = new Date().toDateString();
            
            // Sales stats
            const todaySales = salesData.filter(sale => 
                new Date(sale.timestamp).toDateString() === today
            );
            const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
            const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

            // Production stats
            const todayProduction = productionData.filter(record => 
                new Date(record.timestamp).toDateString() === today
            );
            const totalProduction = productionData.reduce((sum, record) => sum + record.quantity, 0);

            // Orders stats
            const pendingOrders = ordersData.filter(order => order.status === 'pending').length;

            // Mortality stats
            const todayMortality = mortalityData.filter(record => 
                new Date(record.timestamp).toDateString() === today
            );
            const totalMortality = mortalityData.reduce((sum, record) => sum + record.quantity, 0);

            this.stats = {
                totalRevenue: totalRevenue.toFixed(2),
                todayRevenue: todayRevenue.toFixed(2),
                totalProduction,
                todayProduction: todayProduction.reduce((sum, record) => sum + record.quantity, 0),
                pendingOrders,
                totalMortality,
                todayMortality: todayMortality.reduce((sum, record) => sum + record.quantity, 0),
                totalSales: salesData.length,
                todaySales: todaySales.length
            };

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.stats = {
                totalRevenue: '0.00',
                todayRevenue: '0.00',
                totalProduction: 0,
                todayProduction: 0,
                pendingOrders: 0,
                totalMortality: 0,
                todayMortality: 0,
                totalSales: 0,
                todaySales: 0
            };
        }
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.dashboard-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="dashboard-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Dashboard</h1>
                        <p class="header-subtitle">Welcome to your farm management dashboard</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-secondary" id="refresh-dashboard-btn">
                            <i class="icon">🔄</i>
                            Refresh
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon revenue">💰</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-revenue">$0.00</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon production">🏭</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-production">0</div>
                            <div class="stat-label">Total Production</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orders">📋</div>
                        <div class="stat-content">
                            <div class="stat-value" id="pending-orders">0</div>
                            <div class="stat-label">Pending Orders</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon mortality">🐔</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-mortality">0</div>
                            <div class="stat-label">Total Mortality</div>
                        </div>
                    </div>
                </div>

                <!-- Today's Overview -->
                <div class="today-overview">
                    <h2>Today's Overview</h2>
                    <div class="today-grid">
                        <div class="today-card">
                            <div class="today-icon">💰</div>
                            <div class="today-content">
                                <div class="today-value" id="today-revenue">$0.00</div>
                                <div class="today-label">Revenue</div>
                            </div>
                        </div>
                        <div class="today-card">
                            <div class="today-icon">🏭</div>
                            <div class="today-content">
                                <div class="today-value" id="today-production">0</div>
                                <div class="today-label">Production</div>
                            </div>
                        </div>
                        <div class="today-card">
                            <div class="today-icon">📊</div>
                            <div class="today-content">
                                <div class="today-value" id="today-sales">0</div>
                                <div class="today-label">Sales</div>
                            </div>
                        </div>
                        <div class="today-card">
                            <div class="today-icon">🐔</div>
                            <div class="today-content">
                                <div class="today-value" id="today-mortality">0</div>
                                <div class="today-label">Mortality</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="action-card" data-action="record-sale">
                            <div class="action-icon">💰</div>
                            <div class="action-content">
                                <h3>Record Sale</h3>
                                <p>Add new sales transaction</p>
                            </div>
                        </button>
                        <button class="action-card" data-action="add-production">
                            <div class="action-icon">🏭</div>
                            <div class="action-content">
                                <h3>Add Production</h3>
                                <p>Record production output</p>
                            </div>
                        </button>
                        <button class="action-card" data-action="record-mortality">
                            <div class="action-icon">🐔</div>
                            <div class="action-content">
                                <h3>Record Mortality</h3>
                                <p>Track bird mortality</p>
                            </div>
                        </button>
                        <button class="action-card" data-action="create-order">
                            <div class="action-icon">📋</div>
                            <div class="action-content">
                                <h3>Create Order</h3>
                                <p>Add customer order</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                    <h2>Recent Activity</h2>
                    <div class="activity-list" id="activity-list">
                        <!-- Activity items will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    updateDisplay() {
        if (!this.container) return;

        // Update main stats
        this.updateElement('#total-revenue', `$${this.stats.totalRevenue}`);
        this.updateElement('#total-production', this.stats.totalProduction.toLocaleString());
        this.updateElement('#pending-orders', this.stats.pendingOrders);
        this.updateElement('#total-mortality', this.stats.totalMortality);

        // Update today's stats
        this.updateElement('#today-revenue', `$${this.stats.todayRevenue}`);
        this.updateElement('#today-production', this.stats.todayProduction.toLocaleString());
        this.updateElement('#today-sales', this.stats.todaySales);
        this.updateElement('#today-mortality', this.stats.todayMortality);

        // Load recent activity
        this.loadRecentActivity();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    async loadRecentActivity() {
        const activityList = this.container?.querySelector('#activity-list');
        if (!activityList) return;

        try {
            // Load recent data from all modules
            let salesData = [];
            let productionData = [];
            let mortalityData = [];
            let ordersData = [];

            if (window.db) {
                salesData = await window.db.getAll('sales') || [];
                productionData = await window.db.getAll('production') || [];
                mortalityData = await window.db.getAll('broiler-mortality') || [];
                ordersData = await window.db.getAll('orders') || [];
            } else {
                salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
                productionData = JSON.parse(localStorage.getItem('farm-production') || '[]');
                mortalityData = JSON.parse(localStorage.getItem('farm-broiler-mortality') || '[]');
                ordersData = JSON.parse(localStorage.getItem('farm-orders') || '[]');
            }

            // Combine and sort by timestamp
            const allActivities = [
                ...salesData.map(item => ({ ...item, type: 'sale', icon: '💰' })),
                ...productionData.map(item => ({ ...item, type: 'production', icon: '🏭' })),
                ...mortalityData.map(item => ({ ...item, type: 'mortality', icon: '🐔' })),
                ...ordersData.map(item => ({ ...item, type: 'order', icon: '📋' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

            if (allActivities.length === 0) {
                activityList.innerHTML = `
                    <div class="empty-activity">
                        <p>No recent activity</p>
                    </div>
                `;
                return;
            }

            activityList.innerHTML = allActivities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${this.getActivityTitle(activity)}</div>
                        <div class="activity-time">${window.formatDateTime(activity.timestamp)}</div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading recent activity:', error);
            activityList.innerHTML = `
                <div class="empty-activity">
                    <p>Error loading activity</p>
                </div>
            `;
        }
    }

    getActivityTitle(activity) {
        switch (activity.type) {
            case 'sale':
                return `Sold ${activity.quantity} ${activity.product} to ${activity.customer}`;
            case 'production':
                return `Produced ${activity.quantity} ${activity.unit} of ${activity.product}`;
            case 'mortality':
                return `Recorded ${activity.quantity} bird mortality in ${activity.batch}`;
            case 'order':
                return `New order from ${activity.customer} for ${activity.product}`;
            default:
                return 'Activity recorded';
        }
    }

    setupEventListeners() {
        if (!this.container) return;

        // Refresh button
        this.container.querySelector('#refresh-dashboard-btn')?.addEventListener('click', async () => {
            await this.loadStats();
            this.updateDisplay();
            this.showToast('Dashboard refreshed!', 'success');
        });

        // Quick action buttons
        this.container.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'record-sale':
                window.farmApp.loadModule('sales-record');
                break;
            case 'add-production':
                window.farmApp.loadModule('production');
                break;
            case 'record-mortality':
                window.farmApp.loadModule('broiler-mortality');
                break;
            case 'create-order':
                window.farmApp.loadModule('orders');
                break;
        }
    }

    showToast(message, type = 'info') {
        window.showToast(message, type);
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', new DashboardModule());
    console.log('✅ Dashboard module registered');
}
