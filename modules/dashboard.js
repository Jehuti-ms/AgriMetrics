// modules/dashboard.js - Fixed version
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    template: `
        <div id="dashboard" class="section active">
            <div class="dashboard-header">
                <h1>Farm Dashboard</h1>
                <p id="dashboard-greeting">Welcome back! Here's your farm overview.</p>
                <div class="dashboard-actions">
                    <button class="btn btn-primary" id="quick-add-income">
                        <span>💰</span> Add Income
                    </button>
                    <button class="btn btn-secondary" id="quick-add-expense">
                        <span>💸</span> Add Expense
                    </button>
                    <button class="btn btn-info" id="quick-inventory-check">
                        <span>📦</span> Inventory Check
                    </button>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="metrics-grid">
                <div class="metric-card income">
                    <div class="metric-icon">💰</div>
                    <div class="metric-content">
                        <h3>Total Income</h3>
                        <div class="metric-value" id="total-income">$0.00</div>
                        <div class="metric-trend" id="income-trend">
                            <span class="trend-indicator">→</span>
                            <span class="trend-text">No data</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card expense">
                    <div class="metric-icon">💸</div>
                    <div class="metric-content">
                        <h3>Total Expenses</h3>
                        <div class="metric-value" id="total-expenses">$0.00</div>
                        <div class="metric-trend" id="expense-trend">
                            <span class="trend-indicator">→</span>
                            <span class="trend-text">No data</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card profit">
                    <div class="metric-icon">📈</div>
                    <div class="metric-content">
                        <h3>Net Profit</h3>
                        <div class="metric-value" id="net-profit">$0.00</div>
                        <div class="metric-trend" id="profit-trend">
                            <span class="trend-indicator">→</span>
                            <span class="trend-text">No data</span>
                        </div>
                    </div>
                </div>

                <div class="metric-card inventory">
                    <div class="metric-icon">📦</div>
                    <div class="metric-content">
                        <h3>Inventory Items</h3>
                        <div class="metric-value" id="inventory-count">0</div>
                        <div class="metric-subtext">Items tracked</div>
                    </div>
                </div>

                <div class="metric-card production">
                    <div class="metric-icon">🌱</div>
                    <div class="metric-content">
                        <h3>Active Production</h3>
                        <div class="metric-value" id="production-count">0</div>
                        <div class="metric-subtext">Active projects</div>
                    </div>
                </div>

                <div class="metric-card sales">
                    <div class="metric-icon">🛒</div>
                    <div class="metric-content">
                        <h3>Monthly Sales</h3>
                        <div class="metric-value" id="monthly-sales">$0.00</div>
                        <div class="metric-trend" id="sales-trend">
                            <span class="trend-indicator">→</span>
                            <span class="trend-text">This month</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Income vs Expenses</h3>
                        <select id="time-period" class="chart-filter">
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="incomeExpenseChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Production Distribution</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="productionChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <div class="activity-card">
                    <div class="activity-header">
                        <h3>Recent Activity</h3>
                        <button class="btn btn-text" id="view-all-activity">View All</button>
                    </div>
                    <div class="activity-list" id="recent-activity">
                        <div class="activity-empty">
                            <p>No recent activity</p>
                        </div>
                    </div>
                </div>

                <div class="quick-stats-card">
                    <div class="quick-stats-header">
                        <h3>Quick Stats</h3>
                    </div>
                    <div class="quick-stats-grid">
                        <div class="quick-stat">
                            <span class="stat-label">Pending Orders</span>
                            <span class="stat-value" id="pending-orders">0</span>
                        </div>
                        <div class="quick-stat">
                            <span class="stat-label">Low Stock Items</span>
                            <span class="stat-value" id="low-stock-count">0</span>
                        </div>
                        <div class="quick-stat">
                            <span class="stat-label">This Week's Sales</span>
                            <span class="stat-value" id="weekly-sales">$0.00</span>
                        </div>
                        <div class="quick-stat">
                            <span class="stat-label">Feed Cost (Month)</span>
                            <span class="stat-value" id="monthly-feed-cost">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Tasks -->
            <div class="tasks-section">
                <div class="tasks-card">
                    <div class="tasks-header">
                        <h3>Upcoming Tasks</h3>
                        <button class="btn btn-text" id="add-task">+ Add Task</button>
                    </div>
                    <div class="tasks-list" id="upcoming-tasks">
                        <div class="task-empty">
                            <p>No upcoming tasks</p>
                            <button class="btn btn-outline" id="create-first-task">Create your first task</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    sidebar: `
        <div class="dashboard-sidebar">
            <h3>Quick Actions</h3>
            <div class="sidebar-actions">
                <button class="sidebar-btn" data-action="add-income">
                    <span>💰</span> Add Income
                </button>
                <button class="sidebar-btn" data-action="add-expense">
                    <span>💸</span> Add Expense
                </button>
                <button class="sidebar-btn" data-action="inventory-check">
                    <span>📦</span> Inventory Check
                </button>
                <button class="sidebar-btn" data-action="record-sale">
                    <span>🛒</span> Record Sale
                </button>
                <button class="sidebar-btn" data-action="add-production">
                    <span>🌱</span> Add Production
                </button>
                <button class="sidebar-btn" data-action="create-order">
                    <span>📋</span> Create Order
                </button>
            </div>

            <div class="sidebar-stats">
                <h3>Today's Summary</h3>
                <div class="stat-item">
                    <span>Income Today:</span>
                    <span id="today-income">$0.00</span>
                </div>
                <div class="stat-item">
                    <span>Expenses Today:</span>
                    <span id="today-expenses">$0.00</span>
                </div>
                <div class="stat-item">
                    <span>Sales Today:</span>
                    <span id="today-sales">0</span>
                </div>
            </div>

            <div class="sidebar-alerts">
                <h3>Alerts</h3>
                <div class="alerts-list" id="sidebar-alerts">
                    <div class="alert-item info">
                        <span>No alerts</span>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Dashboard module initializing...');
        this.loadDashboardData();
        this.attachEventListeners();
        this.updateGreeting();
        this.startAutoRefresh();
        this.initializeAnimations();
    },

    loadDashboardData: function() {
        console.log('Loading dashboard data...');
        this.updateFinancialMetrics();
        this.updateInventoryMetrics();
        this.updateProductionMetrics();
        this.updateRecentActivity();
        this.updateQuickStats();
        this.updateAlerts();
        this.renderCharts();
    },

    updateFinancialMetrics: function() {
        const transactions = FarmModules.appData.transactions || [];
        const today = new Date().toDateString();
        
        // Calculate totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);
        
        const netProfit = totalIncome - totalExpenses;

        // Today's totals
        const todayIncome = transactions
            .filter(t => t.type === 'income' && new Date(t.date).toDateString() === today)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const todayExpenses = transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        // Monthly sales (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales = (FarmModules.appData.sales || [])
            .filter(sale => {
                const saleDate = new Date(sale.saleDate);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((sum, sale) => sum + (parseFloat(sale.totalSales) || 0), 0);

        // Update DOM
        this.updateElement('total-income', `$${totalIncome.toFixed(2)}`);
        this.updateElement('total-expenses', `$${totalExpenses.toFixed(2)}`);
        this.updateElement('net-profit', `$${netProfit.toFixed(2)}`);
        this.updateElement('monthly-sales', `$${monthlySales.toFixed(2)}`);
        this.updateElement('today-income', `$${todayIncome.toFixed(2)}`);
        this.updateElement('today-expenses', `$${todayExpenses.toFixed(2)}`);

        // Update trends
        this.updateTrends();
    },

    updateInventoryMetrics: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockCount = inventory.filter(item => {
            const quantity = parseInt(item.quantity) || 0;
            return quantity > 0 && quantity < 10; // Consider low stock if less than 10
        }).length;

        this.updateElement('inventory-count', inventory.length);
        this.updateElement('low-stock-count', lowStockCount);
    },

    updateProductionMetrics: function() {
        const production = FarmModules.appData.production || [];
        const projects = FarmModules.appData.projects || [];
        
        // Active production (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeProduction = production.filter(record => 
            new Date(record.date) >= thirtyDaysAgo
        ).length;

        this.updateElement('production-count', activeProduction);
    },

    updateRecentActivity: function() {
        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;

        // Combine recent activities from different modules
        const allActivities = [];
        
        // Add recent transactions
        (FarmModules.appData.transactions || []).slice(-5).forEach(transaction => {
            allActivities.push({
                type: 'transaction',
                icon: transaction.type === 'income' ? '💰' : '💸',
                description: `${transaction.type === 'income' ? 'Income' : 'Expense'}: ${transaction.description || 'No description'}`,
                amount: parseFloat(transaction.value) || 0,
                date: transaction.date,
                color: transaction.type === 'income' ? 'success' : 'error'
            });
        });

        // Add recent sales
        (FarmModules.appData.sales || []).slice(-5).forEach(sale => {
            allActivities.push({
                type: 'sale',
                icon: '🛒',
                description: `Sale to ${sale.customer || 'Unknown'}`,
                amount: parseFloat(sale.totalSales) || 0,
                date: sale.saleDate,
                color: 'success'
            });
        });

        // Add recent inventory checks
        (FarmModules.appData.inventory || []).slice(-5).forEach(item => {
            allActivities.push({
                type: 'inventory',
                icon: '📦',
                description: `Inventory: ${item.item || 'Unknown Item'}`,
                details: `Qty: ${item.quantity || 0}, Condition: ${item.condition || 'Unknown'}`,
                date: item.date,
                color: 'info'
            });
        });

        // Sort by date (newest first) and take top 10
        const recentActivities = allActivities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-empty">
                    <p>No recent activity</p>
                    <p class="empty-subtext">Start adding transactions, sales, or inventory checks to see activity here.</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
                    <div class="activity-date">${this.formatDate(activity.date)}</div>
                </div>
                ${activity.amount ? `<div class="activity-amount ${activity.color}">$${activity.amount.toFixed(2)}</div>` : ''}
            </div>
        `).join('');
    },

    updateQuickStats: function() {
        const orders = FarmModules.appData.orders || [];
        const sales = FarmModules.appData.sales || [];
        const feedRecords = FarmModules.appData.feedRecords || [];

        // Pending orders
        const pendingOrders = orders.filter(order => 
            order.deliveryStatus === 'pending' || order.deliveryStatus === 'in-transit'
        ).length;

        // Weekly sales (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklySales = sales
            .filter(sale => new Date(sale.saleDate) >= oneWeekAgo)
            .reduce((sum, sale) => sum + (parseFloat(sale.totalSales) || 0), 0);

        // Monthly feed cost
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyFeedCost = feedRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            })
            .reduce((sum, record) => sum + (parseFloat(record.totalCost) || 0), 0);

        this.updateElement('pending-orders', pendingOrders);
        this.updateElement('weekly-sales', `$${weeklySales.toFixed(2)}`);
        this.updateElement('monthly-feed-cost', `$${monthlyFeedCost.toFixed(2)}`);
        
        // Today's sales count
        const today = new Date().toDateString();
        const todaySales = sales.filter(sale => 
            new Date(sale.saleDate).toDateString() === today
        ).length;
        this.updateElement('today-sales', todaySales);
    },

    updateAlerts: function() {
        const alertsList = document.getElementById('sidebar-alerts');
        if (!alertsList) return;

        const alerts = [];

        // Check for low stock
        const lowStockItems = (FarmModules.appData.inventory || []).filter(item => {
            const quantity = parseInt(item.quantity) || 0;
            return quantity > 0 && quantity < 5;
        });

        if (lowStockItems.length > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowStockItems.length} items low in stock`,
                action: 'inventory-check'
            });
        }

        // Check for pending orders
        const pendingOrders = (FarmModules.appData.orders || []).filter(order => 
            order.deliveryStatus === 'pending'
        ).length;

        if (pendingOrders > 0) {
            alerts.push({
                type: 'info',
                message: `${pendingOrders} pending orders`,
                action: 'orders'
            });
        }

        // Check for today's activities
        const today = new Date().toDateString();
        const todayActivities = (FarmModules.appData.transactions || []).filter(t => 
            new Date(t.date).toDateString() === today
        ).length;

        if (todayActivities === 0) {
            alerts.push({
                type: 'info',
                message: 'No activities recorded today',
                action: 'add-income'
            });
        }

        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="alert-item info">
                    <span>No alerts</span>
                </div>
            `;
            return;
        }

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <span>${alert.message}</span>
            </div>
        `).join('');
    },

    updateTrends: function() {
        // Simple trend calculation (compare current month with previous month)
        const transactions = FarmModules.appData.transactions || [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthIncome = transactions
            .filter(t => t.type === 'income' && 
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const lastMonthIncome = transactions
            .filter(t => t.type === 'income' && 
                new Date(t.date).getMonth() === lastMonth &&
                new Date(t.date).getFullYear() === lastMonthYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const incomeChange = lastMonthIncome > 0 ? 
            ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

        this.updateTrendElement('income-trend', incomeChange);
        
        // Similar for expenses
        const currentMonthExpenses = transactions
            .filter(t => t.type === 'expense' && 
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const lastMonthExpenses = transactions
            .filter(t => t.type === 'expense' && 
                new Date(t.date).getMonth() === lastMonth &&
                new Date(t.date).getFullYear() === lastMonthYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const expenseChange = lastMonthExpenses > 0 ? 
            ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

        this.updateTrendElement('expense-trend', expenseChange);
        
        // Profit trend
        const profitChange = incomeChange - expenseChange;
        this.updateTrendElement('profit-trend', profitChange);
    },

    updateTrendElement: function(elementId, change) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const indicator = change > 5 ? '📈' : change < -5 ? '📉' : '→';
        let text = 'No change';
        
        if (Math.abs(change) > 5) {
            text = `${Math.abs(change).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'}`;
        }

        element.innerHTML = `
            <span class="trend-indicator">${indicator}</span>
            <span class="trend-text">${text}</span>
        `;
    },

    renderCharts: function() {
        // Initialize charts if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded');
            return;
        }

        this.renderIncomeExpenseChart();
        this.renderProductionChart();
    },

    renderIncomeExpenseChart: function() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        const transactions = FarmModules.appData.transactions || [];
        const last6Months = this.getLast6Months();

        const incomeData = last6Months.map(month => 
            transactions.filter(t => t.type === 'income' && this.isSameMonth(t.date, month))
                .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0)
        );

        const expenseData = last6Months.map(month => 
            transactions.filter(t => t.type === 'expense' && this.isSameMonth(t.date, month))
                .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0)
        );

        // Destroy existing chart if it exists
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        ctx.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last6Months.map(month => month.toLocaleDateString('en', { month: 'short' })),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#4caf50',
                        borderColor: '#2e7d32',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: '#f44336',
                        borderColor: '#c62828',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Income vs Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    renderProductionChart: function() {
        const ctx = document.getElementById('productionChart');
        if (!ctx) return;

        const production = FarmModules.appData.production || [];
        
        // Group by production type
        const types = {};
        production.forEach(record => {
            const type = record.type || 'Other';
            types[type] = (types[type] || 0) + 1;
        });

        // Destroy existing chart if it exists
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        ctx.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(types),
                datasets: [{
                    data: Object.values(types),
                    backgroundColor: [
                        '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#607d8b'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Production Distribution'
                    }
                }
            }
        });
    },

    attachEventListeners: function() {
        // Quick action buttons
        document.getElementById('quick-add-income')?.addEventListener('click', () => 
            FarmModules.navigateTo('income-expenses'));
        document.getElementById('quick-add-expense')?.addEventListener('click', () => 
            FarmModules.navigateTo('income-expenses'));
        document.getElementById('quick-inventory-check')?.addEventListener('click', () => 
            FarmModules.navigateTo('inventory-check'));

        // Sidebar actions
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.sidebar-btn').dataset.action;
                this.handleSidebarAction(action);
            });
        });

        // Time period filter
        document.getElementById('time-period')?.addEventListener('change', () => {
            this.renderCharts();
        });

        // View all activity
        document.getElementById('view-all-activity')?.addEventListener('click', () => {
            FarmModules.navigateTo('reports');
        });
    },

    handleSidebarAction: function(action) {
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'inventory-check': 'inventory-check',
            'record-sale': 'sales',
            'add-production': 'production',
            'create-order': 'orders'
        };

        if (actionMap[action]) {
            FarmModules.navigateTo(actionMap[action]);
        }
    },

    updateGreeting: function() {
        const greeting = document.getElementById('dashboard-greeting');
        if (!greeting) return;

        const hour = new Date().getHours();
        let timeGreeting = 'Good day';

        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 18) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';

        const user = FirebaseAuth.getCurrentUser();
        const userName = user?.displayName || 'Farmer';

        greeting.textContent = `${timeGreeting}, ${userName}! Here's your farm overview.`;
    },

    startAutoRefresh: function() {
        // Refresh dashboard every 30 seconds
        setInterval(() => {
            if (document.querySelector('#dashboard.active')) {
                this.loadDashboardData();
            }
        }, 30000);
    },

    initializeAnimations: function() {
        // Add intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all metric cards and charts
        document.querySelectorAll('.metric-card, .chart-card, .activity-card, .quick-stats-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            observer.observe(el);
        });
    },

    // Utility functions
    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatDate: function(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Invalid date';
        }
    },

    getLast6Months: function() {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(new Date(date.getFullYear(), date.getMonth(), 1));
        }
        return months;
    },

    isSameMonth: function(dateString, month) {
        try {
            const date = new Date(dateString);
            return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
        } catch (e) {
            return false;
        }
    }
});
