// modules/reports.js
FarmModules.registerModule('reports', {
    name: 'Reports',
    icon: '📈',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Reports & Analytics</h1>
                <p>Comprehensive insights into your farm operations</p>
            </div>

            <div class="reports-grid">
                <div class="report-type-card">
                    <div class="report-icon">💰</div>
                    <div class="report-content">
                        <h3>Financial Report</h3>
                        <p>Income, expenses, and profit analysis</p>
                    </div>
                    <button class="btn btn-outline" onclick="FarmModules.getModule('reports').generateFinancialReport()">
                        Generate Report
                    </button>
                </div>

                <div class="report-type-card">
                    <div class="report-icon">📦</div>
                    <div class="report-content">
                        <h3>Inventory Report</h3>
                        <p>Stock levels, turnover, and valuation</p>
                    </div>
                    <button class="btn btn-outline" onclick="FarmModules.getModule('reports').generateInventoryReport()">
                        Generate Report
                    </button>
                </div>

                <div class="report-type-card">
                    <div class="report-icon">🌱</div>
                    <div class="report-content">
                        <h3>Production Report</h3>
                        <p>Crop yields and livestock production</p>
                    </div>
                    <button class="btn btn-outline" onclick="FarmModules.getModule('reports').generateProductionReport()">
                        Generate Report
                    </button>
                </div>
            </div>

            <div class="report-output" id="report-output" style="display: none;">
                <div class="output-header">
                    <h3 id="output-title">Report Output</h3>
                    <button class="btn btn-text" onclick="document.getElementById('report-output').style.display = 'none'">
                        Close
                    </button>
                </div>
                <div class="output-content" id="output-content">
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Reports module initializing...');
    },

    generateFinancialReport: function() {
        const transactions = FarmModules.appData.transactions || [];
        const totalIncome = transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const reportContent = `
            <div class="report-section">
                <h4>Financial Summary</h4>
                <div class="financial-metrics">
                    <div class="metric-row">
                        <span class="metric-label">Total Income:</span>
                        <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Expenses:</span>
                        <span class="metric-value expense">${this.formatCurrency(totalExpenses)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Net Profit:</span>
                        <span class="metric-value profit">${this.formatCurrency(totalIncome - totalExpenses)}</span>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <h4>Transaction Overview</h4>
                <p>Total transactions: ${transactions.length}</p>
                <p>Income transactions: ${transactions.filter(t => t.type === 'income').length}</p>
                <p>Expense transactions: ${transactions.filter(t => t.type === 'expense').length}</p>
            </div>
        `;

        this.showReport('Financial Report', reportContent);
    },

    generateInventoryReport: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockCount = inventory.filter(item => {
            const quantity = parseInt(item.quantity) || 0;
            return quantity > 0 && quantity < 10;
        }).length;

        const reportContent = `
            <div class="report-section">
                <h4>Inventory Overview</h4>
                <div class="inventory-metrics">
                    <div class="metric-row">
                        <span class="metric-label">Total Items:</span>
                        <span class="metric-value">${inventory.length}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Low Stock Items:</span>
                        <span class="metric-value warning">${lowStockCount}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Categories:</span>
                        <span class="metric-value">${[...new Set(inventory.map(item => item.category))].length}</span>
                    </div>
                </div>
            </div>
        `;

        this.showReport('Inventory Report', reportContent);
    },

    generateProductionReport: function() {
        const reportContent = `
            <div class="report-section">
                <h4>Production Overview</h4>
                <p>Production tracking features coming soon!</p>
                <p>This module will track crop yields, livestock production, and other farm outputs.</p>
            </div>
        `;

        this.showReport('Production Report', reportContent);
    },

    showReport: function(title, content) {
        const outputSection = document.getElementById('report-output');
        const outputTitle = document.getElementById('output-title');
        const outputContent = document.getElementById('output-content');

        if (outputTitle) outputTitle.textContent = title;
        if (outputContent) outputContent.innerHTML = content;
        if (outputSection) outputSection.style.display = 'block';

        this.showNotification(`Generated: ${title}`, 'success');
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        }
    }
});
