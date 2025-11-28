// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="dashboard-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Farm Dashboard</h1>
                <p class="module-subtitle-pwa">Overview of your farm operations and performance</p>
            </div>

            <div class="dashboard-content">
                <!-- Stats Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa" id="revenue-today">$0</div>
                        <div class="stat-label-pwa">Today's Revenue</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📦</div>
                        <div class="stat-value-pwa" id="pending-orders">0</div>
                        <div class="stat-label-pwa">Pending Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🥚</div>
                        <div class="stat-value-pwa" id="eggs-today">0</div>
                        <div class="stat-label-pwa">Eggs Today</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🐔</div>
                        <div class="stat-value-pwa" id="birds-count">0</div>
                        <div class="stat-label-pwa">Total Birds</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <h3 class="section-title-pwa">Quick Actions</h3>
                    <div class="quick-grid-pwa">
                        <button class="quick-action-btn-pwa" data-action="add-production">
                            <div class="quick-icon-pwa">📈</div>
                            <div class="quick-title-pwa">Add Production</div>
                            <div class="quick-desc-pwa">Record daily production</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="record-feed">
                            <div class="quick-icon-pwa">🌾</div>
                            <div class="quick-title-pwa">Record Feed</div>
                            <div class="quick-desc-pwa">Log feed consumption</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="add-income">
                            <div class="quick-icon-pwa">💵</div>
                            <div class="quick-title-pwa">Add Income</div>
                            <div class="quick-desc-pwa">Record income</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="add-expense">
                            <div class="quick-icon-pwa">💸</div>
                            <div class="quick-title-pwa">Add Expense</div>
                            <div class="quick-desc-pwa">Record expense</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="check-inventory">
                            <div class="quick-icon-pwa">📋</div>
                            <div class="quick-title-pwa">Check Inventory</div>
                            <div class="quick-desc-pwa">View stock levels</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="view-reports">
                            <div class="quick-icon-pwa">📊</div>
                            <div class="quick-title-pwa">View Reports</div>
                            <div class="quick-desc-pwa">Analytics & insights</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Activity</h3>
                        <a href="#" class="view-all-link" id="view-all-activity">View All</a>
                    </div>
                    
                    <div class="transactions-list" id="recent-activity">
                        <!-- Recent activity will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('📊 Initializing dashboard...');
        this.showContent();
        this.setupEventListeners();
        this.loadDashboardData();
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        contentArea.innerHTML = this.template;
        console.log('✅ Dashboard content loaded');
    },

    setupEventListeners: function() {
        // Quick action buttons
        document.addEventListener('click', (e) => {
            const quickActionBtn = e.target.closest('.quick-action-btn-pwa');
            if (quickActionBtn) {
                e.preventDefault();
                const action = quickActionBtn.getAttribute('data-action');
                this.handleQuickAction(action);
            }

            // View all activity
            if (e.target.id === 'view-all-activity' || e.target.closest('#view-all-activity')) {
                e.preventDefault();
                this.navigateToModule('reports');
            }
        });
    },

    handleQuickAction: function(action) {
        console.log('Quick action:', action);
        
        const moduleMap = {
            'add-production': 'production',
            'record-feed': 'feed-record',
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'check-inventory': 'inventory-check',
            'view-reports': 'reports'
        };

        const targetModule = moduleMap[action];
        if (targetModule) {
            this.navigateToModule(targetModule, action);
        } else {
            this.showNotification(`Action "${action}" not implemented yet`, 'info');
        }
    },

    navigateToModule: function(moduleName, action = null) {
        // Use the FarmModules framework to navigate
        if (window.FarmModules && window.FarmModules.showModule) {
            window.FarmModules.showModule(moduleName);
            
            // If there's a specific action, trigger it after navigation
            if (action && moduleName === 'income-expenses') {
                // Store the action to be used by the target module
                setTimeout(() => {
                    const targetModule = FarmModules.getModule(moduleName);
                    if (targetModule && targetModule.handleQuickAction) {
                        targetModule.handleQuickAction(action);
                    }
                }, 100);
            }
        } else {
            console.error('FarmModules navigation not available');
            this.showNotification(`Cannot navigate to ${moduleName}`, 'error');
        }
    },

    loadDashboardData: function() {
        this.updateRevenueStats();
        this.updateOrderStats();
        this.updateProductionStats();
        this.updateInventoryStats();
        this.loadRecentActivity();
    },

    updateRevenueStats: function() {
        // Calculate today's revenue from sales and orders
        const today = new Date().toISOString().split('T')[0];
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.amount, 0);
            
        const todayOrders = orders
            .filter(order => order.orderDate === today && order.status === 'completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);
            
        const totalRevenue = todaySales + todayOrders;
        
        this.updateElement('revenue-today', this.formatCurrency(totalRevenue));
    },

    updateOrderStats: function() {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        
        this.updateElement('pending-orders', pendingOrders);
    },

    updateProductionStats: function() {
        const today = new Date().toISOString().split('T')[0];
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        const todayProduction = production.find(p => p.date === today);
        const eggsToday = todayProduction ? todayProduction.eggsCollected : 0;
        
        this.updateElement('eggs-today', eggsToday.toLocaleString());
    },

    updateInventoryStats: function() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const birdsItem = inventory.find(item => item.name === 'Broilers' || item.name === 'Layers');
        const birdsCount = birdsItem ? birdsItem.quantity : 0;
        
        this.updateElement('birds-count', birdsCount.toLocaleString());
    },

    loadRecentActivity: function() {
        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;

        // Get recent activities from various modules
        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-desc">Start using the app to see activity here</div>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="transaction-item">
                <div class="transaction-icon">${activity.icon}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${activity.title}</div>
                    <div class="transaction-meta">${activity.time}</div>
                </div>
                <div class="transaction-amount ${activity.amountClass || ''}">
                    ${activity.amount || ''}
                </div>
            </div>
        `).join('');
    },

    getRecentActivities: function() {
        const activities = [];
        const today = new Date().toISOString().split('T')[0];

        // Get recent sales
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]')
            .slice(-3)
            .map(sale => ({
                icon: '💰',
                title: `Sale: ${sale.product}`,
                time: this.formatTimeAgo(sale.date),
                amount: this.formatCurrency(sale.amount),
                amountClass: 'positive'
            }));

        // Get recent production
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]')
            .slice(-2)
            .map(prod => ({
                icon: '🥚',
                title: `Production: ${prod.eggsCollected} eggs`,
                time: this.formatTimeAgo(prod.date),
                amount: ''
            }));

        // Get recent orders
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]')
            .slice(-2)
            .map(order => ({
                icon: '📦',
                title: `Order: ${order.customerName}`,
                time: this.formatTimeAgo(order.orderDate),
                amount: this.formatCurrency(order.totalAmount),
                amountClass: 'positive'
            }));

        activities.push(...sales, ...production, ...orders);
        
        // Sort by date (newest first) and take top 5
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);
    },

    // Helper methods
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatTimeAgo: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});

console.log('✅ Dashboard module registered');
