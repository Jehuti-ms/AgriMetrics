// modules/dashboard.js - CSS-BASED VERSION (Updated to match Income module structure)
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    id: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Ensure CSS is loaded
        this.ensureDashboardCSS();
        
        // Render dashboard
        this.renderDashboard();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load stats
        this.loadAndDisplayStats();
        
        this.initialized = true;
        
        console.log('✅ Dashboard initialized successfully');
        return true;
    },

    ensureDashboardCSS() {
        // Check if dashboard CSS is already loaded
        const existingLinks = document.querySelectorAll('link[href*="dashboard.css"]');
        if (existingLinks.length > 0) {
            return;
        }
        
        // Load dashboard CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/dashboard.css';
        link.onerror = () => {
            console.warn('⚠️ dashboard.css not found');
        };
        document.head.appendChild(link);
    },

    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="dashboard" class="module-container">
                <!-- Welcome Header -->
                <div class="module-header">
                    <h1 class="module-title">Dashboard</h1>
                    <p class="module-subtitle">Overview of your farm operations</p>
                </div>

                <!-- Quick Actions -->
                <div class="module-card">
                    <button class="module-action-btn" data-action="add-income">
                        <span class="btn-icon">💰</span>
                        <span class="btn-text">Add Income</span>
                    </button>
                    <button class="module-action-btn" data-action="add-expense">
                        <span class="btn-icon">💸</span>
                        <span class="btn-text">Add Expense</span>
                    </button>
                    <button class="module-action-btn" data-action="check-inventory">
                        <span class="btn-icon">📦</span>
                        <span class="btn-text">Check Inventory</span>
                    </button>
                    <button class="module-action-btn" data-action="record-feed">
                        <span class="btn-icon">🌾</span>
                        <span class="btn-text">Record Feed</span>
                    </button>
                </div>

                <!-- Key Stats Overview -->
                <div class="module-section">
                    <h2 class="section-title">Key Statistics</h2>
                    <div class="cards-grid">
                        <div class="summary-card revenue-card">
                            <div class="card-icon">💰</div>
                            <div class="card-content">
                                <div class="card-label">Total Revenue</div>
                                <div class="card-value" id="total-revenue">$0.00</div>
                                <div class="card-trend" id="revenue-trend">Monthly trend</div>
                            </div>
                        </div>
                        
                        <div class="summary-card expense-card">
                            <div class="card-icon">💸</div>
                            <div class="card-content">
                                <div class="card-label">Total Expenses</div>
                                <div class="card-value" id="total-expenses">$0.00</div>
                                <div class="card-trend" id="expense-trend">Monthly average</div>
                            </div>
                        </div>
                        
                        <div class="summary-card profit-card">
                            <div class="card-icon">📊</div>
                            <div class="card-content">
                                <div class="card-label">Net Profit</div>
                                <div class="card-value" id="net-profit">$0.00</div>
                                <div class="card-trend" id="profit-trend">Profit margin</div>
                            </div>
                        </div>
                        
                        <div class="summary-card inventory-card">
                            <div class="card-icon">📦</div>
                            <div class="card-content">
                                <div class="card-label">Inventory Items</div>
                                <div class="card-value" id="inventory-items">0</div>
                                <div class="card-trend" id="inventory-trend">Stock levels</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Stats -->
                <div class="module-section">
                    <h2 class="section-title">Farm Operations</h2>
                    <div class="cards-grid">
                        <div class="summary-card birds-card">
                            <div class="card-icon">🐔</div>
                            <div class="card-content">
                                <div class="card-label">Active Birds</div>
                                <div class="card-value" id="active-birds">0</div>
                                <div class="card-trend" id="birds-trend">Live stock</div>
                            </div>
                        </div>
                        
                        <div class="summary-card orders-card">
                            <div class="card-icon">📋</div>
                            <div class="card-content">
                                <div class="card-label">Total Orders</div>
                                <div class="card-value" id="total-orders">0</div>
                                <div class="card-trend" id="orders-trend">Completed orders</div>
                            </div>
                        </div>
                        
                        <div class="summary-card customers-card">
                            <div class="card-icon">👥</div>
                            <div class="card-content">
                                <div class="card-label">Customers</div>
                                <div class="card-value" id="total-customers">0</div>
                                <div class="card-trend" id="customers-trend">Active clients</div>
                            </div>
                        </div>
                        
                        <div class="summary-card products-card">
                            <div class="card-icon">🛒</div>
                            <div class="card-content">
                                <div class="card-label">Products</div>
                                <div class="card-value" id="total-products">0</div>
                                <div class="card-trend" id="products-trend">Available items</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="module-section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Activity</h2>
                        <button class="btn-secondary" id="refresh-activity-btn">
                            🔄 Refresh
                        </button>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Activity</th>
                                    <th>Type</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="activity-table-body">
                                <!-- Activities will be loaded here -->
                                <tr class="empty-row">
                                    <td colspan="5">
                                        <div class="empty-state">
                                            <div class="empty-icon">📊</div>
                                            <div class="empty-text">No recent activity</div>
                                            <div class="empty-subtext">Start by adding your first record</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div class="module-section">
                    <h2 class="section-title">Performance Metrics</h2>
                    <div class="metrics-container">
                        <div class="metric-card">
                            <div class="metric-header">
                                <div class="metric-icon">📈</div>
                                <div class="metric-title">Monthly Revenue</div>
                            </div>
                            <div class="metric-value" id="monthly-revenue">$0.00</div>
                            <div class="metric-progress">
                                <div class="progress-bar" id="revenue-progress" style="width: 0%"></div>
                            </div>
                            <div class="metric-label">Target: <span id="revenue-target">$5,000</span></div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-header">
                                <div class="metric-icon">🎯</div>
                                <div class="metric-title">Order Completion</div>
                            </div>
                            <div class="metric-value" id="order-completion">0%</div>
                            <div class="metric-progress">
                                <div class="progress-bar" id="order-progress" style="width: 0%"></div>
                            </div>
                            <div class="metric-label">Completed: <span id="completed-orders">0</span>/<span id="total-orders-count">0</span></div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-header">
                                <div class="metric-icon">📊</div>
                                <div class="metric-title">Inventory Health</div>
                            </div>
                            <div class="metric-value" id="inventory-health">0%</div>
                            <div class="metric-progress">
                                <div class="progress-bar" id="inventory-progress" style="width: 0%"></div>
                            </div>
                            <div class="metric-label">Well-stocked items</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Reports -->
                <div class="module-section">
                    <h2 class="section-title">Quick Reports</h2>
                    <div class="reports-container">
                        <button class="report-btn" data-report="daily">
                            <div class="report-icon">📅</div>
                            <div class="report-content">
                                <div class="report-title">Daily Summary</div>
                                <div class="report-desc">Today's activities</div>
                            </div>
                        </button>
                        
                        <button class="report-btn" data-report="weekly">
                            <div class="report-icon">📊</div>
                            <div class="report-content">
                                <div class="report-title">Weekly Report</div>
                                <div class="report-desc">Last 7 days</div>
                            </div>
                        </button>
                        
                        <button class="report-btn" data-report="monthly">
                            <div class="report-icon">📈</div>
                            <div class="report-content">
                                <div class="report-title">Monthly Analytics</div>
                                <div class="report-desc">Current month</div>
                            </div>
                        </button>
                        
                        <button class="report-btn" data-report="inventory">
                            <div class="report-icon">📦</div>
                            <div class="report-content">
                                <div class="report-title">Inventory Report</div>
                                <div class="report-desc">Stock levels</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Action buttons
        const actionButtons = document.querySelectorAll('.module-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-activity-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshStats();
            });
        }
        
        // Report buttons
        const reportButtons = document.querySelectorAll('.report-btn');
        reportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reportType = e.currentTarget.getAttribute('data-report');
                this.generateReport(reportType);
            });
        });
    },

    loadAndDisplayStats() {
        const stats = this.getDashboardStats();
        this.updateDashboardStats(stats);
        this.updateRecentActivity(stats);
        this.updatePerformanceMetrics(stats);
    },

    getDashboardStats() {
        let stats = {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            inventoryItems: 0,
            activeBirds: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            monthlyRevenue: 0,
            completedOrders: 0,
            recentActivities: [],
            performanceMetrics: {}
        };

        // Try to get stats from FarmModules
        if (window.FarmModules && window.FarmModules.appData) {
            const sharedStats = window.FarmModules.appData.profile?.dashboardStats;
            if (sharedStats) {
                stats = { ...stats, ...sharedStats };
            }
        }

        // Fallback to localStorage
        if (stats.totalRevenue === 0) {
            const savedStats = localStorage.getItem('farm-dashboard-stats');
            if (savedStats) {
                stats = { ...stats, ...JSON.parse(savedStats) };
            }
        }

        // Calculate net profit if not provided
        if (stats.netProfit === 0 && (stats.totalRevenue > 0 || stats.totalExpenses > 0)) {
            stats.netProfit = stats.totalRevenue - stats.totalExpenses;
        }

        // Use sample data for demo if empty
        if (stats.totalRevenue === 0) {
            stats = this.getSampleStats();
        }

        return stats;
    },

    getSampleStats() {
        return {
            totalRevenue: 12500,
            totalExpenses: 8500,
            netProfit: 4000,
            inventoryItems: 24,
            activeBirds: 1200,
            totalOrders: 15,
            totalCustomers: 8,
            totalProducts: 12,
            monthlyRevenue: 3200,
            completedOrders: 12,
            recentActivities: [
                {
                    id: 1,
                    time: '2 hours ago',
                    activity: 'New order received',
                    type: 'order',
                    details: 'Order #1234 - 50 chickens',
                    status: 'pending'
                },
                {
                    id: 2,
                    time: '4 hours ago',
                    activity: 'Feed inventory updated',
                    type: 'inventory',
                    details: 'Added 500kg premium feed',
                    status: 'completed'
                },
                {
                    id: 3,
                    time: '1 day ago',
                    activity: 'Income recorded',
                    type: 'income',
                    details: 'Chicken sales - $2,500',
                    status: 'completed'
                },
                {
                    id: 4,
                    time: '2 days ago',
                    activity: 'Expense recorded',
                    type: 'expense',
                    details: 'Vaccination supplies - $350',
                    status: 'completed'
                },
                {
                    id: 5,
                    time: '3 days ago',
                    activity: 'New customer registered',
                    type: 'customer',
                    details: 'Fresh Farms Co.',
                    status: 'active'
                }
            ],
            performanceMetrics: {
                revenueProgress: 64,
                orderProgress: 80,
                inventoryProgress: 75
            }
        };
    },

    updateDashboardStats(stats) {
        this.updateCardValue('total-revenue', this.formatCurrency(stats.totalRevenue));
        this.updateCardValue('total-expenses', this.formatCurrency(stats.totalExpenses));
        this.updateCardValue('net-profit', this.formatCurrency(stats.netProfit));
        this.updateCardValue('inventory-items', stats.inventoryItems);
        this.updateCardValue('active-birds', stats.activeBirds);
        this.updateCardValue('total-orders', stats.totalOrders);
        this.updateCardValue('total-customers', stats.totalCustomers);
        this.updateCardValue('total-products', stats.totalProducts);
        
        // Update trend indicators
        this.updateTrend('revenue-trend', '+12% this month', 'positive');
        this.updateTrend('expense-trend', 'Within budget', 'neutral');
        this.updateTrend('profit-trend', stats.netProfit >= 0 ? 'Good profit' : 'Review needed', stats.netProfit >= 0 ? 'positive' : 'negative');
        this.updateTrend('inventory-trend', 'Well stocked', 'positive');
        this.updateTrend('birds-trend', 'Healthy flock', 'positive');
        this.updateTrend('orders-trend', `${stats.completedOrders || 0}/${stats.totalOrders} completed`, 'positive');
        this.updateTrend('customers-trend', 'Growing', 'positive');
        this.updateTrend('products-trend', 'Available', 'neutral');
        
        // Update profit card styling
        const profitCard = document.querySelector('.profit-card');
        if (profitCard) {
            if (stats.netProfit >= 0) {
                profitCard.classList.add('positive');
                profitCard.classList.remove('negative');
            } else {
                profitCard.classList.add('negative');
                profitCard.classList.remove('positive');
            }
        }
    },

    updateCardValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('value-updating');
            setTimeout(() => {
                element.classList.remove('value-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateTrend(elementId, text, type = 'neutral') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = 'card-trend';
            if (type !== 'neutral') {
                element.classList.add(type);
            }
        }
    },

    updateRecentActivity(stats) {
        const tableBody = document.getElementById('activity-table-body');
        if (!tableBody) return;

        const activities = stats.recentActivities || [];

        if (activities.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-text">No recent activity</div>
                            <div class="empty-subtext">Start by adding your first record</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = activities.map(activity => `
            <tr class="activity-row activity-${activity.type}">
                <td>${activity.time}</td>
                <td>${activity.activity}</td>
                <td>
                    <span class="type-badge type-${activity.type}">
                        ${this.getActivityTypeIcon(activity.type)} ${activity.type}
                    </span>
                </td>
                <td>${activity.details}</td>
                <td>
                    <span class="status-badge status-${activity.status}">
                        ${activity.status}
                    </span>
                </td>
            </tr>
        `).join('');
    },

    getActivityTypeIcon(type) {
        const icons = {
            'order': '📋',
            'inventory': '📦',
            'income': '💰',
            'expense': '💸',
            'customer': '👥',
            'production': '🚜',
            'feed': '🌾',
            'health': '💊'
        };
        return icons[type] || '📊';
    },

    updatePerformanceMetrics(stats) {
        // Monthly revenue
        this.updateCardValue('monthly-revenue', this.formatCurrency(stats.monthlyRevenue));
        const revenueProgress = document.getElementById('revenue-progress');
        if (revenueProgress) {
            const progress = Math.min((stats.monthlyRevenue / 5000) * 100, 100);
            revenueProgress.style.width = `${progress}%`;
        }
        
        // Order completion
        const completionRate = stats.totalOrders > 0 ? 
            Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;
        this.updateCardValue('order-completion', `${completionRate}%`);
        const orderProgress = document.getElementById('order-progress');
        if (orderProgress) {
            orderProgress.style.width = `${completionRate}%`;
        }
        
        // Update order counts
        const completedOrdersEl = document.getElementById('completed-orders');
        const totalOrdersCountEl = document.getElementById('total-orders-count');
        if (completedOrdersEl) completedOrdersEl.textContent = stats.completedOrders || 0;
        if (totalOrdersCountEl) totalOrdersCountEl.textContent = stats.totalOrders || 0;
        
        // Inventory health (simplified)
        const inventoryHealth = Math.min(stats.inventoryItems * 4, 100);
        this.updateCardValue('inventory-health', `${inventoryHealth}%`);
        const inventoryProgress = document.getElementById('inventory-progress');
        if (inventoryProgress) {
            inventoryProgress.style.width = `${inventoryHealth}%`;
        }
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses', 
            'check-inventory': 'inventory',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };

        const targetModule = actionMap[action];
        if (targetModule && window.app && window.app.showSection) {
            window.app.showSection(targetModule);
            this.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Income & Expenses',
            'add-expense': 'Income & Expenses', 
            'check-inventory': 'Inventory',
            'record-feed': 'Feed Records',
            'add-production': 'Production',
            'view-reports': 'Reports'
        };
        return names[action] || action;
    },

    generateReport(reportType) {
        const reportNames = {
            'daily': 'Daily Summary',
            'weekly': 'Weekly Report',
            'monthly': 'Monthly Analytics',
            'inventory': 'Inventory Report'
        };
        
        this.showNotification(`Generating ${reportNames[reportType] || reportType}...`, 'info');
        // TODO: Implement actual report generation
    },

    refreshStats() {
        this.loadAndDisplayStats();
        this.showNotification('Stats refreshed!', 'success');
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('notification-fadeout');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    },

    addActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

        if (!window.FarmModules.appData.profile.recentActivities) {
            window.FarmModules.appData.profile.recentActivities = [];
        }

        window.FarmModules.appData.profile.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            time: 'Just now',
            ...activity
        });

        // Keep only last 10 activities
        if (window.FarmModules.appData.profile.recentActivities.length > 10) {
            window.FarmModules.appData.profile.recentActivities = 
                window.FarmModules.appData.profile.recentActivities.slice(0, 10);
        }

        this.loadAndDisplayStats();
    }
};

// Register the module when FarmModules is available
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
} else {
    // Wait for FarmModules to be available
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            clearInterval(checkFarmModules);
            window.FarmModules.registerModule('dashboard', DashboardModule);
            console.log('✅ Dashboard module registered after wait');
        }
    }, 100);
}

// Export for global access
window.DashboardModule = DashboardModule;
