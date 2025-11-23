// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="section active">
            <div class="dashboard-header">
                <h1>Farm Dashboard</h1>
                <p id="dashboard-greeting">Welcome back! Here's your farm overview.</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>Total Revenue</h3>
                        <div class="stat-value" id="total-income">$0.00</div>
                        <div class="stat-trend" id="income-trend">→ No data</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">💸</div>
                    <div class="stat-content">
                        <h3>Total Expenses</h3>
                        <div class="stat-value" id="total-expenses">$0.00</div>
                        <div class="stat-trend" id="expense-trend">→ No data</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h3>Net Profit</h3>
                        <div class="stat-value" id="net-profit">$0.00</div>
                        <div class="stat-trend" id="profit-trend">→ No data</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <h3>Inventory Items</h3>
                        <div class="stat-value" id="inventory-count">0</div>
                        <div class="stat-subtext">Items tracked</div>
                    </div>
                </div>
            </div>

            <div class="charts-row">
                <div class="chart-card">
                    <h3>Income vs Expenses</h3>
                    <div class="chart-container">
                        <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3>Inventory Status</h3>
                    <div class="chart-container">
                        <canvas id="inventoryChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list" id="recent-activity-list">
                    <div class="activity-empty">
                        <p>No recent activity</p>
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
    },

    loadDashboardData: function() {
        this.updateFinancialMetrics();
        this.updateInventoryMetrics();
        this.updateRecentActivity();
        this.renderCharts();
    },

    updateFinancialMetrics: function() {
        const transactions = FarmModules.appData.transactions || [];
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.value) || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.value) || 0), 0);
        
        const netProfit = totalIncome - totalExpenses;

        this.updateElement('total-income', this.formatCurrency(totalIncome));
        this.updateElement('total-expenses', this.formatCurrency(totalExpenses));
        this.updateElement('net-profit', this.formatCurrency(netProfit));

        this.updateTrends();
    },

    updateInventoryMetrics: function() {
        const inventory = FarmModules.appData.inventory || [];
        this.updateElement('inventory-count', inventory.length);
    },

    updateRecentActivity: function() {
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;

        const allActivities = [];
        
        // Add recent transactions
        (FarmModules.appData.transactions || []).slice(-5).forEach(transaction => {
            allActivities.push({
                type: 'transaction',
                icon: transaction.type === 'income' ? '💰' : '💸',
                description: `${transaction.description || 'Transaction'}`,
                amount: parseFloat(transaction.amount) || parseFloat(transaction.value) || 0,
                date: transaction.date,
                color: transaction.type === 'income' ? 'success' : 'error'
            });
        });

        // Add recent inventory
        (FarmModules.appData.inventory || []).slice(-3).forEach(item => {
            allActivities.push({
                type: 'inventory',
                icon: '📦',
                description: `Inventory: ${item.name || 'Item'}`,
                details: `Qty: ${item.quantity || 0}`,
                date: item.lastUpdated || item.dateAdded,
                color: 'info'
            });
        });

        if (allActivities.length === 0) {
            activityList.innerHTML = '<div class="activity-empty"><p>No recent activity</p></div>';
            return;
        }

        const recentActivities = allActivities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
                    <div class="activity-date">${this.formatDate(activity.date)}</div>
                </div>
                ${activity.amount ? `<div class="activity-amount ${activity.color}">${this.formatCurrency(activity.amount)}</div>` : ''}
            </div>
        `).join('');
    },

    updateTrends: function() {
        // Simple trend calculation
        const transactions = FarmModules.appData.transactions || [];
        const incomeCount = transactions.filter(t => t.type === 'income').length;
        const expenseCount = transactions.filter(t => t.type === 'expense').length;
        
        if (incomeCount > expenseCount) {
            this.updateElement('income-trend', '📈 Positive trend');
            this.updateElement('profit-trend', '📈 Growing');
        } else if (expenseCount > incomeCount) {
            this.updateElement('expense-trend', '📈 Higher spending');
            this.updateElement('profit-trend', '⚠️ Watch costs');
        }
    },

    renderCharts: function() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not available');
            return;
        }

        this.renderIncomeExpenseChart();
        this.renderInventoryChart();
    },

    renderIncomeExpenseChart: function() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        const transactions = FarmModules.appData.transactions || [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        const incomeData = months.map(() => Math.random() * 5000 + 2000);
        const expenseData = months.map(() => Math.random() * 3000 + 1000);

        try {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeData,
                            backgroundColor: '#4caf50'
                        },
                        {
                            label: 'Expenses',
                            data: expenseData,
                            backgroundColor: '#f44336'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    },

    renderInventoryChart: function() {
        const ctx = document.getElementById('inventoryChart');
        if (!ctx) return;

        const inventory = FarmModules.appData.inventory || [];
        const categories = ['Seeds', 'Feed', 'Equipment', 'Other'];
        const counts = [inventory.filter(i => i.category === 'seeds').length,
                       inventory.filter(i => i.category === 'feed').length,
                       inventory.filter(i => i.category === 'equipment').length,
                       inventory.filter(i => !i.category || i.category === 'other').length];

        try {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: counts,
                        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    },

    attachEventListeners: function() {
        // Add any dashboard-specific event listeners here
        console.log('Dashboard event listeners attached');
    },

    updateGreeting: function() {
        const greeting = document.getElementById('dashboard-greeting');
        if (!greeting) return;

        const hour = new Date().getHours();
        let timeGreeting = 'Good day';
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 18) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';

        const user = FarmModules.appData.user;
        const userName = user?.name || user?.displayName || 'Farmer';

        greeting.textContent = `${timeGreeting}, ${userName}! Here's your farm overview.`;
    },

    // Utility functions
    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Recent';
        }
    }
});
