// modules/reports.js
FarmModules.registerModule('reports', {
    name: 'Reports',
    icon: '📈',
    template: `
        <div id="reports" class="section active">
            <div class="module-header">
                <h1>Reports & Analytics</h1>
                <p>Comprehensive insights into your farm operations</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="generate-report">
                        <span>📊</span> Generate Report
                    </button>
                    <button class="btn btn-secondary" id="schedule-report">
                        <span>⏰</span> Schedule
                    </button>
                    <button class="btn btn-info" id="export-all">
                        <span>📥</span> Export All
                    </button>
                </div>
            </div>

            <!-- Report Types Grid -->
            <div class="reports-grid">
                <div class="report-type-card financial" data-report="financial">
                    <div class="report-icon">💰</div>
                    <div class="report-content">
                        <h3>Financial Report</h3>
                        <p>Income, expenses, and profit analysis</p>
                        <div class="report-meta">
                            <span class="meta-item">Updated: Today</span>
                            <span class="meta-item">Last period: $12,450</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="financial">
                        View Report
                    </button>
                </div>

                <div class="report-type-card inventory" data-report="inventory">
                    <div class="report-icon">📦</div>
                    <div class="report-content">
                        <h3>Inventory Report</h3>
                        <p>Stock levels, turnover, and valuation</p>
                        <div class="report-meta">
                            <span class="meta-item">45 items tracked</span>
                            <span class="meta-item">5 low stock</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="inventory">
                        View Report
                    </button>
                </div>

                <div class="report-type-card production" data-report="production">
                    <div class="report-icon">🌱</div>
                    <div class="report-content">
                        <h3>Production Report</h3>
                        <p>Crop yields and livestock production</p>
                        <div class="report-meta">
                            <span class="meta-item">12 active projects</span>
                            <span class="meta-item">85% yield rate</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="production">
                        View Report
                    </button>
                </div>

                <div class="report-type-card sales" data-report="sales">
                    <div class="report-icon">🛒</div>
                    <div class="report-content">
                        <h3>Sales Report</h3>
                        <p>Customer sales and revenue streams</p>
                        <div class="report-meta">
                            <span class="meta-item">156 sales this month</span>
                            <span class="meta-item">$8,240 revenue</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="sales">
                        View Report
                    </button>
                </div>

                <div class="report-type-card performance" data-report="performance">
                    <div class="report-icon">📈</div>
                    <div class="report-content">
                        <h3>Performance Report</h3>
                        <p>Operational efficiency and KPIs</p>
                        <div class="report-meta">
                            <span class="meta-item">15% growth</span>
                            <span class="meta-item">92% efficiency</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="performance">
                        View Report
                    </button>
                </div>

                <div class="report-type-card custom" data-report="custom">
                    <div class="report-icon">🎛️</div>
                    <div class="report-content">
                        <h3>Custom Report</h3>
                        <p>Create your own report with custom metrics</p>
                        <div class="report-meta">
                            <span class="meta-item">Fully customizable</span>
                            <span class="meta-item">Save templates</span>
                        </div>
                    </div>
                    <button class="btn btn-outline view-report" data-report="custom">
                        Create Report
                    </button>
                </div>
            </div>

            <!-- Report Parameters -->
            <div class="report-parameters" id="report-parameters" style="display: none;">
                <div class="parameters-header">
                    <h3 id="parameters-title">Report Parameters</h3>
                    <button class="btn btn-text" id="close-parameters">Close</button>
                </div>
                <div class="parameters-grid" id="parameters-grid">
                    <!-- Parameters will be populated based on report type -->
                </div>
                <div class="parameters-actions">
                    <button class="btn btn-primary" id="generate-with-params">Generate Report</button>
                    <button class="btn btn-outline" id="save-parameters">Save as Template</button>
                </div>
            </div>

            <!-- Report Output -->
            <div class="report-output" id="report-output" style="display: none;">
                <div class="output-header">
                    <h3 id="output-title">Report Output</h3>
                    <div class="output-actions">
                        <button class="btn btn-text" id="print-report">🖨️ Print</button>
                        <button class="btn btn-text" id="download-report">📥 Download</button>
                        <button class="btn btn-text" id="close-output">Close</button>
                    </div>
                </div>
                <div class="output-content" id="output-content">
                    <!-- Report content will be rendered here -->
                </div>
            </div>

            <!-- Recent Reports -->
            <div class="recent-reports">
                <div class="recent-header">
                    <h3>Recent Reports</h3>
                    <button class="btn btn-text" id="view-all-reports">View All</button>
                </div>
                <div class="reports-list" id="recent-reports-list">
                    <div class="no-reports">
                        <p>No recent reports generated</p>
                        <p class="subtext">Generate your first report to see it here</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    sidebar: `
        <div class="reports-sidebar">
            <h3>Quick Reports</h3>
            <div class="quick-reports">
                <button class="sidebar-btn quick-report" data-report="daily-summary">
                    <span>📋</span> Daily Summary
                </button>
                <button class="sidebar-btn quick-report" data-report="weekly-financial">
                    <span>💰</span> Weekly Financial
                </button>
                <button class="sidebar-btn quick-report" data-report="inventory-alert">
                    <span>⚠️</span> Inventory Alert
                </button>
                <button class="sidebar-btn quick-report" data-report="production-weekly">
                    <span>🌱</span> Production Weekly
                </button>
            </div>

            <div class="saved-templates">
                <h3>Saved Templates</h3>
                <div id="saved-templates-list">
                    <div class="no-templates">No saved templates</div>
                </div>
            </div>

            <div class="report-stats">
                <h3>Report Stats</h3>
                <div class="stat-item">
                    <span>Reports Generated:</span>
                    <span id="total-reports-count">0</span>
                </div>
                <div class="stat-item">
                    <span>This Month:</span>
                    <span id="monthly-reports-count">0</span>
                </div>
                <div class="stat-item">
                    <span>Saved Templates:</span>
                    <span id="templates-count">0</span>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Reports module initializing...');
        this.attachEventListeners();
        this.loadRecentReports();
        this.updateReportStats();
        this.loadSavedTemplates();
    },

    attachEventListeners: function() {
        // Report type cards
        document.querySelectorAll('.view-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.closest('.report-type-card').dataset.report;
                this.showReportParameters(reportType);
            });
        });

        // Quick reports in sidebar
        document.querySelectorAll('.quick-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.closest('.sidebar-btn').dataset.report;
                this.generateQuickReport(reportType);
            });
        });

        // Parameter actions
        document.getElementById('close-parameters')?.addEventListener('click', () => {
            document.getElementById('report-parameters').style.display = 'none';
        });

        document.getElementById('generate-with-params')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Output actions
        document.getElementById('close-output')?.addEventListener('click', () => {
            document.getElementById('report-output').style.display = 'none';
        });

        document.getElementById('print-report')?.addEventListener('click', () => {
            this.printReport();
        });

        document.getElementById('download-report')?.addEventListener('click', () => {
            this.downloadReport();
        });

        // Header actions
        document.getElementById('generate-report')?.addEventListener('click', () => {
            this.showReportParameters('financial');
        });

        document.getElementById('schedule-report')?.addEventListener('click', () => {
            this.showScheduleModal();
        });

        document.getElementById('export-all')?.addEventListener('click', () => {
            this.exportAllReports();
        });
    },

    showReportParameters: function(reportType) {
        const parametersSection = document.getElementById('report-parameters');
        const parametersGrid = document.getElementById('parameters-grid');
        const parametersTitle = document.getElementById('parameters-title');

        // Set title based on report type
        const reportTitles = {
            financial: 'Financial Report Parameters',
            inventory: 'Inventory Report Parameters',
            production: 'Production Report Parameters',
            sales: 'Sales Report Parameters',
            performance: 'Performance Report Parameters',
            custom: 'Custom Report Builder'
        };

        parametersTitle.textContent = reportTitles[reportType] || 'Report Parameters';

        // Generate parameters based on report type
        parametersGrid.innerHTML = this.generateParameters(reportType);

        // Show the parameters section
        parametersSection.style.display = 'block';

        // Store current report type
        this.currentReportType = reportType;
    },

    generateParameters: function(reportType) {
        const parameterTemplates = {
            financial: `
                <div class="parameter-group">
                    <label for="financial-period">Report Period:</label>
                    <select id="financial-period" class="parameter-input">
                        <option value="month">Monthly</option>
                        <option value="quarter">Quarterly</option>
                        <option value="year">Yearly</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="include-comparison">Include Comparison:</label>
                    <input type="checkbox" id="include-comparison" class="parameter-checkbox" checked>
                </div>
                <div class="parameter-group">
                    <label for="breakdown-level">Breakdown Level:</label>
                    <select id="breakdown-level" class="parameter-input">
                        <option value="category">By Category</option>
                        <option value="subcategory">By Subcategory</option>
                        <option value="item">By Item</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="chart-type">Chart Type:</label>
                    <select id="chart-type" class="parameter-input">
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
            `,

            inventory: `
                <div class="parameter-group">
                    <label for="inventory-category">Category:</label>
                    <select id="inventory-category" class="parameter-input">
                        <option value="all">All Categories</option>
                        <option value="seeds">Seeds</option>
                        <option value="feed">Animal Feed</option>
                        <option value="fertilizer">Fertilizer</option>
                        <option value="equipment">Equipment</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="stock-status">Stock Status:</label>
                    <select id="stock-status" class="parameter-input">
                        <option value="all">All Items</option>
                        <option value="low">Low Stock Only</option>
                        <option value="out">Out of Stock Only</option>
                        <option value="adequate">Adequate Stock</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="include-valuation">Include Valuation:</label>
                    <input type="checkbox" id="include-valuation" class="parameter-checkbox" checked>
                </div>
                <div class="parameter-group">
                    <label for="show-turnover">Show Turnover Rate:</label>
                    <input type="checkbox" id="show-turnover" class="parameter-checkbox">
                </div>
            `,

            production: `
                <div class="parameter-group">
                    <label for="production-type">Production Type:</label>
                    <select id="production-type" class="parameter-input">
                        <option value="all">All Production</option>
                        <option value="crops">Crops Only</option>
                        <option value="livestock">Livestock Only</option>
                        <option value="dairy">Dairy Only</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="yield-metrics">Yield Metrics:</label>
                    <select id="yield-metrics" class="parameter-input">
                        <option value="volume">Volume</option>
                        <option value="weight">Weight</option>
                        <option value="count">Count</option>
                        <option value="value">Monetary Value</option>
                    </select>
                </div>
                <div class="parameter-group">
                    <label for="compare-targets">Compare to Targets:</label>
                    <input type="checkbox" id="compare-targets" class="parameter-checkbox" checked>
                </div>
                <div class="parameter-group">
                    <label for="time-granularity">Time Granularity:</label>
                    <select id="time-granularity" class="parameter-input">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            `
        };

        return parameterTemplates[reportType] || `
            <div class="parameter-group">
                <label for="custom-metrics">Select Metrics:</label>
                <div class="metrics-selector" id="custom-metrics">
                    <label><input type="checkbox" value="financial"> Financial Data</label>
                    <label><input type="checkbox" value="inventory"> Inventory Data</label>
                    <label><input type="checkbox" value="production"> Production Data</label>
                    <label><input type="checkbox" value="sales"> Sales Data</label>
                </div>
            </div>
            <div class="parameter-group">
                <label for="report-title">Report Title:</label>
                <input type="text" id="report-title" class="parameter-input" placeholder="Enter report title">
            </div>
        `;
    },

    generateReport: function() {
        const reportType = this.currentReportType;
        const outputSection = document.getElementById('report-output');
        const outputContent = document.getElementById('output-content');
        const outputTitle = document.getElementById('output-title');

        // Generate report content based on type
        const reportContent = this.generateReportContent(reportType);
        
        outputTitle.textContent = `${this.formatReportType(reportType)} Report`;
        outputContent.innerHTML = reportContent;

        // Show the output section and hide parameters
        outputSection.style.display = 'block';
        document.getElementById('report-parameters').style.display = 'none';

        // Add to recent reports
        this.addToRecentReports(reportType);
        this.updateReportStats();
    },

    generateReportContent: function(reportType) {
        const reportGenerators = {
            financial: () => this.generateFinancialReport(),
            inventory: () => this.generateInventoryReport(),
            production: () => this.generateProductionReport(),
            sales: () => this.generateSalesReport(),
            performance: () => this.generatePerformanceReport()
        };

        const generator = reportGenerators[reportType] || (() => this.generateCustomReport());
        return generator();
    },

    generateFinancialReport: function() {
        const transactions = FarmModules.appData.transactions || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyIncome = transactions
            .filter(t => t.type === 'income' && 
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const monthlyExpenses = transactions
            .filter(t => t.type === 'expense' && 
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        return `
            <div class="report-section">
                <h4>Financial Summary - ${new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h4>
                <div class="financial-metrics">
                    <div class="metric-row">
                        <span class="metric-label">Total Income:</span>
                        <span class="metric-value income">$${monthlyIncome.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Expenses:</span>
                        <span class="metric-value expense">$${monthlyExpenses.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Net Profit:</span>
                        <span class="metric-value profit">$${(monthlyIncome - monthlyExpenses).toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Profit Margin:</span>
                        <span class="metric-value margin">${monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0}%</span>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <h4>Income vs Expenses Trend</h4>
                <div class="chart-placeholder">
                    <p>📊 Chart would show income vs expenses over time</p>
                </div>
            </div>
            <div class="report-section">
                <h4>Top Expense Categories</h4>
                <div class="category-breakdown">
                    ${this.generateExpenseCategories()}
                </div>
            </div>
        `;
    },

    generateInventoryReport: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockCount = inventory.filter(item => {
            const quantity = parseInt(item.quantity) || 0;
            return quantity > 0 && quantity < 10;
        }).length;

        const outOfStockCount = inventory.filter(item => {
            const quantity = parseInt(item.quantity) || 0;
            return quantity === 0;
        }).length;

        const totalValue = inventory.reduce((sum, item) => {
            const quantity = parseInt(item.quantity) || 0;
            const cost = parseFloat(item.cost) || 0;
            return sum + (quantity * cost);
        }, 0);

        return `
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
                        <span class="metric-label">Out of Stock:</span>
                        <span class="metric-value error">${outOfStockCount}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Inventory Value:</span>
                        <span class="metric-value">$${totalValue.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div class="report-section">
                <h4>Stock Status by Category</h4>
                <div class="category-stock">
                    ${this.generateInventoryByCategory()}
                </div>
            </div>
            <div class="report-section">
                <h4>Low Stock Alerts</h4>
                <div class="alerts-list">
                    ${this.generateLowStockAlerts()}
                </div>
            </div>
        `;
    },

    generateExpenseCategories: function() {
        const transactions = FarmModules.appData.transactions || [];
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const categories = {};
        expenseTransactions.forEach(transaction => {
            const category = transaction.category || 'Other';
            categories[category] = (categories[category] || 0) + (parseFloat(transaction.value) || 0);
        });

        return Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, amount]) => `
                <div class="category-item">
                    <span class="category-name">${this.formatCategory(category)}</span>
                    <span class="category-amount">$${amount.toFixed(2)}</span>
                </div>
            `).join('');
    },

    generateInventoryByCategory: function() {
        const inventory = FarmModules.appData.inventory || [];
        const categories = {};

        inventory.forEach(item => {
            const category = item.category || 'other';
            if (!categories[category]) {
                categories[category] = { total: 0, lowStock: 0, outOfStock: 0 };
            }
            categories[category].total++;
            if (this.isOutOfStock(item)) categories[category].outOfStock++;
            else if (this.isLowStock(item)) categories[category].lowStock++;
        });

        return Object.entries(categories).map(([category, stats]) => `
            <div class="stock-category">
                <div class="category-header">
                    <span class="category-name">${this.formatCategory(category)}</span>
                    <span class="category-total">${stats.total} items</span>
                </div>
                <div class="category-stats">
                    <span class="stat adequate">${stats.total - stats.lowStock - stats.outOfStock} adequate</span>
                    <span class="stat low">${stats.lowStock} low</span>
                    <span class="stat out">${stats.outOfStock} out</span>
                </div>
            </div>
        `).join('');
    },

    generateLowStockAlerts: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockItems = inventory.filter(item => this.isLowStock(item) || this.isOutOfStock(item));

        if (lowStockItems.length === 0) {
            return '<p class="no-alerts">No low stock alerts at this time</p>';
        }

        return lowStockItems.map(item => `
            <div class="alert-item ${this.getStockStatusClass(item)}">
                <div class="alert-content">
                    <strong>${item.name || 'Unnamed Item'}</strong>
                    <span> - ${item.quantity || 0} ${item.unit || 'units'} remaining</span>
                    ${item.minStock ? `<span> (Min: ${item.minStock})</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    generateQuickReport: function(reportType) {
        // Generate report without showing parameters
        this.currentReportType = reportType;
        this.generateReport();
    },

    addToRecentReports: function(reportType) {
        if (!FarmModules.appData.recentReports) {
            FarmModules.appData.recentReports = [];
        }

        const report = {
            id: 'report-' + Date.now(),
            type: reportType,
            title: `${this.formatReportType(reportType)} Report`,
            generatedAt: new Date().toISOString(),
            parameters: this.getCurrentParameters()
        };

        FarmModules.appData.recentReports.unshift(report);
        
        // Keep only last 10 reports
        FarmModules.appData.recentReports = FarmModules.appData.recentReports.slice(0, 10);
        
        this.loadRecentReports();
    },

    loadRecentReports: function() {
        const recentReports = FarmModules.appData.recentReports || [];
        const container = document.getElementById('recent-reports-list');

        if (!container) return;

        if (recentReports.length === 0) {
            container.innerHTML = `
                <div class="no-reports">
                    <p>No recent reports generated</p>
                    <p class="subtext">Generate your first report to see it here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentReports.map(report => `
            <div class="recent-report-item">
                <div class="report-icon">${this.getReportIcon(report.type)}</div>
                <div class="report-info">
                    <div class="report-title">${report.title}</div>
                    <div class="report-date">${this.formatDate(report.generatedAt)}</div>
                </div>
                <div class="report-actions">
                    <button class="btn-icon view-again" data-id="${report.id}">👁️</button>
                    <button class="btn-icon download-report" data-id="${report.id}">📥</button>
                </div>
            </div>
        `).join('');
    },

    loadSavedTemplates: function() {
        const templates = FarmModules.appData.reportTemplates || [];
        const container = document.getElementById('saved-templates-list');

        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = '<div class="no-templates">No saved templates</div>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-item">
                <span class="template-name">${template.name}</span>
                <button class="btn-icon use-template" data-id="${template.id}">🚀</button>
            </div>
        `).join('');
    },

    updateReportStats: function() {
        const recentReports = FarmModules.appData.recentReports || [];
        const templates = FarmModules.appData.reportTemplates || [];
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyReports = recentReports.filter(report => {
            const reportDate = new Date(report.generatedAt);
            return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
        }).length;

        this.updateElement('total-reports-count', recentReports.length);
        this.updateElement('monthly-reports-count', monthlyReports);
        this.updateElement('templates-count', templates.length);
    },

    // Utility functions
    formatReportType: function(type) {
        const types = {
            financial: 'Financial',
            inventory: 'Inventory',
            production: 'Production',
            sales: 'Sales',
            performance: 'Performance',
            custom: 'Custom'
        };
        return types[type] || 'Report';
    },

    getReportIcon: function(type) {
        const icons = {
            financial: '💰',
            inventory: '📦',
            production: '🌱',
            sales: '🛒',
            performance: '📈',
            custom: '🎛️'
        };
        return icons[type] || '📊';
    },

    getCurrentParameters: function() {
        // Collect current parameter values
        return {
            period: document.getElementById('financial-period')?.value,
            // Add other parameters as needed
        };
    },

    printReport: function() {
        this.showNotification('Printing report...', 'info');
        // Actual print implementation would go here
    },

    downloadReport: function() {
        this.showNotification('Downloading report...', 'info');
        // Actual download implementation would go here
    },

    showScheduleModal: function() {
        this.showNotification('Schedule report modal would open here', 'info');
    },

    exportAllReports: function() {
        this.showNotification('Exporting all reports...', 'info');
    },

    // Shared inventory functions (from inventory module)
    isLowStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        const minStock = parseInt(item.minStock) || 0;
        return quantity > 0 && quantity <= minStock;
    },

    isOutOfStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        return quantity === 0;
    },

    getStockStatusClass: function(item) {
        if (this.isOutOfStock(item)) return 'out-of-stock';
        if (this.isLowStock(item)) return 'low-stock';
        return 'adequate-stock';
    },

    // Shared utility functions
    formatCategory: function(category) {
        if (!category) return 'Other';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
