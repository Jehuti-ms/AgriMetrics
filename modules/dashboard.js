// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="section active">
            <div class="dashboard-header">
                <h1>Farm Dashboard</h1>
                <p id="dashboard-greeting">Welcome to your farm management system</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>Total Revenue</h3>
                        <div class="stat-value" id="total-income">$0.00</div>
                        <div class="stat-trend">This month</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">💸</div>
                    <div class="stat-content">
                        <h3>Total Expenses</h3>
                        <div class="stat-value" id="total-expenses">$0.00</div>
                        <div class="stat-trend">This month</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h3>Net Profit</h3>
                        <div class="stat-value" id="net-profit">$0.00</div>
                        <div class="stat-trend">This month</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <h3>Inventory Items</h3>
                        <div class="stat-value" id="inventory-count">0</div>
                        <div class="stat-trend">Items tracked</div>
                    </div>
                </div>
            </div>

            <div class="charts-row">
                <div class="chart-card">
                    <h3>Financial Overview</h3>
                    <div class="chart-container">
                        <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="FarmModules.navigateTo('income-expenses')">
                        💰 Add Transaction
                    </button>
                    <button class="btn btn-secondary" onclick="FarmModules.navigateTo('inventory-check')">
                        📦 Manage Inventory
                    </button>
                    <button class="btn btn-info" onclick="FarmModules.navigateTo('reports')">
                        📈 View Reports
                    </button>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Dashboard module initializing...');
        this.loadDashboardData();
        this.updateGreeting();
    },

    loadDashboardData: function() {
        this.updateFinancialMetrics();
        this.updateInventoryMetrics();
        this.renderChart();
    },

    updateFinancialMetrics: function() {
        const transactions = FarmModules.appData.transactions || [];
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const netProfit = totalIncome - totalExpenses;

        this.updateElement('total-income', this.formatCurrency(totalIncome));
        this.updateElement('total-expenses', this.formatCurrency(totalExpenses));
        this.updateElement('net-profit', this.formatCurrency(netProfit));
    },

    updateInventoryMetrics: function() {
        const inventory = FarmModules.appData.inventory || [];
        this.updateElement('inventory-count', inventory.length);
    },

    renderChart: function() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not available');
            return;
        }

        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        try {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [3000, 4500, 3500, 5000, 4000, 6000],
                            backgroundColor: '#22c55e'
                        },
                        {
                            label: 'Expenses',
                            data: [2000, 3000, 2500, 3500, 3000, 4000],
                            backgroundColor: '#ef4444'
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

    updateGreeting: function() {
        const greeting = document.getElementById('dashboard-greeting');
        if (!greeting) return;

        const hour = new Date().getHours();
        let timeGreeting = 'Good day';
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 18) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';

        const user = FarmModules.appData.user;
        const userName = user?.name || 'Farmer';

        greeting.textContent = `${timeGreeting}, ${userName}! Here's your farm overview.`;
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
});
