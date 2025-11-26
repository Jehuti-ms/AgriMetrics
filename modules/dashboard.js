// modules/dashboard.js - PWA Style
console.log('Loading dashboard module...');

class DashboardModule {
    constructor() {
        this.name = 'dashboard';
        this.initialized = false;
        this.container = null;
    }

    async initialize() {
        console.log('📊 Initializing dashboard...');
        this.render();
        this.initialized = true;
        return true;
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.dashboard-container');
        this.setupEventListeners();
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
                        <button class="btn-secondary" id="refresh-dashboard">
                            <i class="icon">🔄</i>
                            Refresh
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
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

                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="action-card" data-module="sales-record">
                            <div class="action-icon">💰</div>
                            <div class="action-content">
                                <h3>Record Sale</h3>
                                <p>Add new sales transaction</p>
                            </div>
                        </button>
                        <button class="action-card" data-module="production">
                            <div class="action-icon">🏭</div>
                            <div class="action-content">
                                <h3>Add Production</h3>
                                <p>Record production output</p>
                            </div>
                        </button>
                        <button class="action-card" data-module="broiler-mortality">
                            <div class="action-icon">🐔</div>
                            <div class="action-content">
                                <h3>Record Mortality</h3>
                                <p>Track bird mortality</p>
                            </div>
                        </button>
                        <button class="action-card" data-module="orders">
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
                        <div class="empty-activity">
                            <div class="empty-icon">📊</div>
                            <p>No recent activity</p>
                            <small>Start using the modules to see activity here</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Refresh button
        this.container.querySelector('#refresh-dashboard')?.addEventListener('click', () => {
            this.showToast('Dashboard refreshed!', 'success');
        });

        // Quick action buttons
        this.container.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const moduleName = e.currentTarget.getAttribute('data-module');
                if (window.farmApp) {
                    window.farmApp.loadModule(moduleName);
                }
            });
        });
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
