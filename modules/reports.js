// modules/reports.js - UPDATED WITH CORRECT STRUCTURE
FarmModules.registerModule('reports', {
    name: 'Reports & Analytics',
    icon: '📊',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Farm Reports & Analytics</h1>
                <p>Comprehensive insights and performance metrics for your farm operations</p>
            </div>

            <!-- Quick Stats Overview -->
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>Total Revenue</h3>
                        <div class="stat-value" id="total-revenue">$0</div>
                        <div class="stat-trend positive">+12% this month</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚜</div>
                    <div class="stat-content">
                        <h3>Production</h3>
                        <div class="stat-value" id="total-production">0</div>
                        <div class="stat-trend positive">+8% this week</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <h3>Inventory Health</h3>
                        <div class="stat-value" id="inventory-health">100%</div>
                        <div class="stat-trend neutral">Stable</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🐔</div>
                    <div class="stat-content">
                        <h3>Flock Status</h3>
                        <div class="stat-value" id="flock-status">Excellent</div>
                        <div class="stat-trend positive">Healthy</div>
                    </div>
                </div>
            </div>

            <!-- Reports Grid -->
            <div class="reports-grid">
                <!-- Financial Reports -->
                <div class="report-type-card" id="financial-report-card">
                    <div class="report-icon">💰</div>
                    <div class="report-content">
                        <h3>Financial Reports</h3>
                        <p>Income, expenses, profit analysis and financial performance metrics</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="financial">
                        Generate Report
                    </button>
                </div>

                <!-- Production Reports -->
                <div class="report-type-card" id="production-report-card">
                    <div class="report-icon">🚜</div>
                    <div class="report-content">
                        <h3>Production Reports</h3>
                        <p>Egg production, poultry output, productivity and efficiency metrics</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="production">
                        Generate Report
                    </button>
                </div>

                <!-- Inventory Reports -->
                <div class="report-type-card" id="inventory-report-card">
                    <div class="report-icon">📦</div>
                    <div class="report-content">
                        <h3>Inventory Reports</h3>
                        <p>Stock levels, consumption patterns, reorder analysis and stock health</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="inventory">
                        Generate Report
                    </button>
                </div>

                <!-- Sales Reports -->
                <div class="report-type-card" id="sales-report-card">
                    <div class="report-icon">📊</div>
                    <div class="report-content">
                        <h3>Sales Reports</h3>
                        <p>Revenue analysis, customer insights, sales performance and trends</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="sales">
                        Generate Report
                    </button>
                </div>

                <!-- Health & Mortality Reports -->
                <div class="report-type-card" id="health-report-card">
                    <div class="report-icon">🐔</div>
                    <div class="report-content">
                        <h3>Health Reports</h3>
                        <p>Mortality rates, health trends, flock management and wellness metrics</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="health">
                        Generate Report
                    </button>
                </div>

                <!-- Feed Consumption Reports -->
                <div class="report-type-card" id="feed-report-card">
                    <div class="report-icon">🌾</div>
                    <div class="report-content">
                        <h3>Feed Reports</h3>
                        <p>Feed usage, cost analysis, consumption patterns and efficiency metrics</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="feed">
                        Generate Report
                    </button>
                </div>

                <!-- Comprehensive Farm Report -->
                <div class="report-type-card comprehensive" id="comprehensive-report-card">
                    <div class="report-icon">🏆</div>
                    <div class="report-content">
                        <h3>Comprehensive Farm Report</h3>
                        <p>Complete overview of all farm operations, performance metrics and strategic insights</p>
                    </div>
                    <button class="btn btn-primary generate-report" data-report-type="comprehensive" style="background: linear-gradient(135deg, #22c55e, #3b82f6);">
                        Generate Full Report
                    </button>
                </div>
            </div>

            <!-- Report Output Section -->
            <div id="report-output" class="report-output hidden">
                <div class="output-header">
                    <div class="header-content">
                        <h3 id="report-title">Report Output</h3>
                        <p id="report-subtitle">Generated on <span id="report-date"></span></p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-icon" id="print-report" title="Print Report">
                            🖨️
                        </button>
                        <button class="btn btn-icon" id="export-report" title="Export Report">
                            📥
                        </button>
                        <button class="btn btn-text" id="close-report">
                            Close
                        </button>
                    </div>
                </div>
                <div class="output-content">
                    <div id="report-content">
                        <!-- Report content will be generated here -->
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity">
                <div class="section-header">
                    <h3>Recent Farm Activity</h3>
                    <button class="btn btn-text" id="refresh-activity">Refresh</button>
                </div>
                <div id="activity-list" class="activity-list">
                    <!-- Activity items will be rendered here -->
                </div>
            </div>
        </div>
    `,

    styles: `
        /* Stats Overview */
        .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .stat-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
            font-size: 2.5rem;
            opacity: 0.9;
        }

        .stat-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-color);
            margin-bottom: 0.25rem;
            line-height: 1.2;
        }

        .stat-trend {
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            display: inline-block;
        }

        .stat-trend.positive {
            background: var(--success-light);
            color: var(--success-color);
        }

        .stat-trend.negative {
            background: var(--danger-light);
            color: var(--danger-color);
        }

        .stat-trend.neutral {
            background: var(--bg-color);
            color: var(--text-muted);
        }

        /* Reports Grid */
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .report-type-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .report-type-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .report-type-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border-color: var(--primary-color);
        }

        .report-type-card.comprehensive {
            grid-column: 1 / -1;
            background: var(--card-bg);
        }

        .report-type-card.comprehensive::before {
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--info-color));
        }

        .report-icon {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            transition: transform 0.3s ease;
        }

        .report-type-card:hover .report-icon {
            transform: scale(1.1);
        }

        .report-content {
            flex: 1;
        }

        .report-content h3 {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.75rem;
            line-height: 1.3;
        }

        .report-content p {
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.5;
            margin: 0;
        }

        /* Report Output */
        .report-output {
            background: var(--card-bg);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
            overflow: hidden;
        }

        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: var(--bg-color);
            border-bottom: 1px solid var(--border-color);
        }

        .header-content h3 {
            margin: 0 0 0.25rem 0;
            color: var(--text-color);
            font-weight: 700;
        }

        .header-content p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .header-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }

        .output-content {
            padding: 2rem;
            max-height: 60vh;
            overflow-y: auto;
        }

        /* Report Content Styles */
        .report-section {
            margin-bottom: 2rem;
        }

        .report-section h4 {
            color: var(--text-color);
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border-color);
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .metric-card {
            background: var(--bg-color);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        .metric-label {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .metric-value.income {
            color: var(--success-color);
        }

        .metric-value.expense {
            color: var(--danger-color);
        }

        .metric-value.profit {
            color: var(--success-color);
        }

        .metric-value.warning {
            color: var(--warning-color);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .data-table th {
            background: var(--bg-color);
            color: var(--text-muted);
            font-weight: 600;
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid var(--border-color);
        }

        .data-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
        }

        /* Recent Activity */
        .recent-activity {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem 0;
            border: 1px solid var(--border-color);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .section-header h3 {
            color: var(--text-color);
            font-weight: 700;
            margin: 0;
        }

        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-color);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }

        .activity-item:hover {
            background: var(--card-bg);
            transform: translateX(4px);
        }

        .activity-icon {
            font-size: 1.5rem;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .activity-description {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .activity-time {
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .stats-overview {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .reports-grid {
                grid-template-columns: 1fr;
            }

            .output-header {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }

            .header-actions {
                justify-content: center;
            }

            .metric-grid {
                grid-template-columns: 1fr;
            }
        }
    `,

    initialize: function() {
        console.log('📈 Initializing reports module...');
        this.updateQuickStats();
        this.renderRecentActivity();
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Reports event listeners attached');
        }, 100);
    },

    updateQuickStats: function() {
        const stats = this.calculateQuickStats();
        
        this.updateElement('total-revenue', this.formatCurrency(stats.totalRevenue));
        this.updateElement('total-production', stats.totalProduction.toLocaleString() + ' units');
        this.updateElement('inventory-health', stats.inventoryHealth + '%');
        this.updateElement('flock-status', stats.flockStatus);
    },

    calculateQuickStats: function() {
        // Get data from FarmModules shared data or localStorage
        const transactions = FarmModules.appData.transactions || [];
        const production = FarmModules.appData.production || [];
        const inventory = FarmModules.appData.inventory || [];
        const mortality = FarmModules.appData.mortality || [];
        
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const inventoryHealth = totalItems > 0 ? Math.round(((totalItems - lowStockItems) / totalItems) * 100) : 100;
        
        const totalBirds = 1000; // Default value
        const totalMortality = mortality.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const mortalityRate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;
        const flockStatus = mortalityRate < 2 ? 'Excellent' : mortalityRate < 5 ? 'Good' : 'Needs Attention';

        return {
            totalRevenue,
            totalProduction,
            inventoryHealth,
            flockStatus
        };
    },

    renderRecentActivity: function() {
        const activities = this.getRecentActivities();
        const container = document.getElementById('activity-list');
        
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h4>No recent activity</h4>
                    <p>Start using farm modules to see activity here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    },

    getRecentActivities: function() {
        const activities = [];
        
        // Sample activities - in real implementation, pull from actual module data
        activities.push({
            icon: '💰',
            title: 'New Sale Recorded',
            description: 'Egg sales to local market - $245.00',
            time: '2 hours ago'
        });
        
        activities.push({
            icon: '🚜',
            title: 'Production Updated',
            description: '450 eggs collected from Layer House A',
            time: '4 hours ago'
        });
        
        activities.push({
            icon: '📦',
            title: 'Inventory Alert',
            description: 'Broiler feed running low - 50kg remaining',
            time: '1 day ago'
        });
        
        activities.push({
            icon: '🐔',
            title: 'Health Check',
            description: 'Weekly flock health assessment completed',
            time: '1 day ago'
        });
        
        activities.push({
            icon: '🌾',
            title: 'Feed Delivery',
            description: '500kg of grower feed received and stored',
            time: '2 days ago'
        });

        return activities;
    },

    attachEventListeners: function() {
        console.log('🔗 Attaching reports event listeners...');

        // Report generation buttons
        const reportButtons = document.querySelectorAll('.generate-report');
        reportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reportType = e.target.dataset.reportType;
                this.generateReport(reportType);
            });
        });

        // Report actions
        const printBtn = document.getElementById('print-report');
        const exportBtn = document.getElementById('export-report');
        const closeBtn = document.getElementById('close-report');
        const refreshBtn = document.getElementById('refresh-activity');

        if (printBtn) printBtn.addEventListener('click', () => this.printReport());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportReport());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeReport());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.refreshActivity());

        // Card click handlers
        const reportCards = document.querySelectorAll('.report-type-card');
        reportCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('generate-report')) {
                    const button = card.querySelector('.generate-report');
                    if (button) {
                        const reportType = button.dataset.reportType;
                        this.generateReport(reportType);
                    }
                }
            });
        });

        console.log('✅ All reports event listeners attached');
    },

    generateReport: function(reportType) {
        console.log(`📊 Generating ${reportType} report...`);
        
        let reportData;
        let title;
        let content;

        switch (reportType) {
            case 'financial':
                reportData = this.generateFinancialData();
                title = 'Financial Performance Report';
                content = this.renderFinancialReport(reportData);
                break;
            case 'production':
                reportData = this.generateProductionData();
                title = 'Production Analysis Report';
                content = this.renderProductionReport(reportData);
                break;
            case 'inventory':
                reportData = this.generateInventoryData();
                title = 'Inventory Health Report';
                content = this.renderInventoryReport(reportData);
                break;
            case 'sales':
                reportData = this.generateSalesData();
                title = 'Sales Performance Report';
                content = this.renderSalesReport(reportData);
                break;
            case 'health':
                reportData = this.generateHealthData();
                title = 'Flock Health Report';
                content = this.renderHealthReport(reportData);
                break;
            case 'feed':
                reportData = this.generateFeedData();
                title = 'Feed Consumption Report';
                content = this.renderFeedReport(reportData);
                break;
            case 'comprehensive':
                reportData = this.generateComprehensiveData();
                title = 'Comprehensive Farm Report';
                content = this.renderComprehensiveReport(reportData);
                break;
            default:
                console.error('Unknown report type:', reportType);
                return;
        }

        this.showReport(title, content);
    },

    generateFinancialData: function() {
        const transactions = FarmModules.appData.transactions || [];
        const sales = FarmModules.appData.sales || [];
        
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin,
            incomeByCategory: this.groupByCategory(income),
            expensesByCategory: this.groupByCategory(expenses),
            recentTransactions: transactions.slice(0, 10)
        };
    },

    renderFinancialReport: function(data) {
        return `
            <div class="report-section">
                <h4>💰 Financial Overview</h4>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Total Income</div>
                        <div class="metric-value income">${this.formatCurrency(data.totalIncome)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Total Expenses</div>
                        <div class="metric-value expense">${this.formatCurrency(data.totalExpenses)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Net Profit</div>
                        <div class="metric-value ${data.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(data.netProfit)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Profit Margin</div>
                        <div class="metric-value ${data.profitMargin >= 0 ? 'profit' : 'expense'}">${data.profitMargin.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Income Breakdown</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.incomeByCategory).map(([category, amount]) => `
                            <tr>
                                <td>${this.formatCategory(category)}</td>
                                <td class="income">${this.formatCurrency(amount)}</td>
                                <td>${data.totalIncome > 0 ? ((amount / data.totalIncome) * 100).toFixed(1) : 0}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="report-section">
                <h4>📉 Expense Analysis</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.expensesByCategory).map(([category, amount]) => `
                            <tr>
                                <td>${this.formatCategory(category)}</td>
                                <td class="expense">${this.formatCurrency(amount)}</td>
                                <td>${data.totalExpenses > 0 ? ((amount / data.totalExpenses) * 100).toFixed(1) : 0}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    generateProductionData: function() {
        const production = FarmModules.appData.production || [];
        const mortality = FarmModules.appData.mortality || [];
        
        return {
            totalProduction: production.reduce((sum, record) => sum + (record.quantity || 0), 0),
            productionByProduct: this.groupByProduct(production),
            qualityDistribution: this.groupByQuality(production),
            mortalityData: this.calculateMortalityStats(mortality)
        };
    },

    renderProductionReport: function(data) {
        return `
            <div class="report-section">
                <h4>🚜 Production Overview</h4>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Total Production</div>
                        <div class="metric-value">${data.totalProduction.toLocaleString()} units</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Products Tracked</div>
                        <div class="metric-value">${Object.keys(data.productionByProduct).length}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Mortality Rate</div>
                        <div class="metric-value ${data.mortalityData.rate > 5 ? 'warning' : ''}">${data.mortalityData.rate}%</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Production by Product</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.productionByProduct).map(([product, quantity]) => `
                            <tr>
                                <td>${this.formatProductName(product)}</td>
                                <td>${quantity.toLocaleString()} units</td>
                                <td>${data.totalProduction > 0 ? ((quantity / data.totalProduction) * 100).toFixed(1) : 0}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Add other report generation methods
    generateInventoryData: function() { 
        const inventory = FarmModules.appData.inventory || [];
        return {
            totalItems: inventory.length,
            lowStockItems: inventory.filter(item => item.currentStock <= item.minStock).length,
            inventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * (item.unitPrice || 0)), 0)
        };
    },

    renderInventoryReport: function(data) {
        return `
            <div class="report-section">
                <h4>📦 Inventory Overview</h4>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Total Items</div>
                        <div class="metric-value">${data.totalItems}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Low Stock Items</div>
                        <div class="metric-value ${data.lowStockItems > 0 ? 'warning' : ''}">${data.lowStockItems}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Inventory Value</div>
                        <div class="metric-value income">${this.formatCurrency(data.inventoryValue)}</div>
                    </div>
                </div>
            </div>
        `;
    },

    generateSalesData: function() { return {}; }
    generateHealthData: function() { return {}; }
    generateFeedData: function() { return {}; }
    generateComprehensiveData: function() { return {}; }

    renderSalesReport: function(data) { return '<p>Sales report coming soon...</p>'; }
    renderHealthReport: function(data) { return '<p>Health report coming soon...</p>'; }
    renderFeedReport: function(data) { return '<p>Feed report coming soon...</p>'; }
    renderComprehensiveReport: function(data) { return '<p>Comprehensive report coming soon...</p>'; }

    showReport: function(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-subtitle').textContent = `Generated on ${new Date().toLocaleDateString()}`;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').classList.remove('hidden');
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport: function() {
        document.getElementById('report-output').classList.add('hidden');
    },

    printReport: function() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const reportTitle = document.getElementById('report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .report-section { margin-bottom: 30px; break-inside: avoid; }
                        .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                        .metric-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                        .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        .data-table th, .data-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
                        .data-table th { background: #f8fafc; font-weight: 600; }
                        .income { color: #16a34a; }
                        .expense { color: #dc2626; }
                        .profit { color: #16a34a; }
                        .warning { color: #d97706; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #666; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    exportReport: function() {
        const reportTitle = document.getElementById('report-title').textContent;
        const reportContent = document.getElementById('report-content').textContent;
        
        const blob = new Blob([`${reportTitle}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${reportContent}`], {
            type: 'text/plain'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully!', 'success');
    },

    refreshActivity: function() {
        this.renderRecentActivity();
        this.showNotification('Activity refreshed', 'success');
    },

    // Utility methods
    groupByCategory: function(transactions) {
        const groups = {};
        transactions.forEach(transaction => {
            const category = transaction.category || 'other';
            groups[category] = (groups[category] || 0) + (transaction.amount || 0);
        });
        return groups;
    },

    groupByProduct: function(production) {
        const groups = {};
        production.forEach(record => {
            const product = record.product || 'other';
            groups[product] = (groups[product] || 0) + (record.quantity || 0);
        });
        return groups;
    },

    groupByQuality: function(production) {
        const groups = {};
        production.forEach(record => {
            const quality = record.quality || 'unknown';
            groups[quality] = (groups[quality] || 0) + 1;
        });
        return groups;
    },

    calculateMortalityStats: function(mortality) {
        const totalBirds = 1000; // Default value
        const totalMortality = mortality.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const rate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;
        
        return {
            total: totalMortality,
            rate: rate.toFixed(2),
            byCause: this.groupByCause(mortality)
        };
    },

    groupByCause: function(mortality) {
        const groups = {};
        mortality.forEach(record => {
            const cause = record.cause || 'unknown';
            groups[cause] = (groups[cause] || 0) + (record.quantity || 0);
        });
        return groups;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatCategory: function(category) {
        const categories = {
            'egg-sales': 'Egg Sales',
            'poultry-sales': 'Poultry Sales',
            'crop-sales': 'Crop Sales',
            'feed': 'Feed',
            'medication': 'Medication',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'other': 'Other'
        };
        return categories[category] || category;
    },

    formatProductName: function(product) {
        const products = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'pork': 'Pork',
            'beef': 'Beef',
            'milk': 'Milk',
            'other': 'Other'
        };
        return products[product] || product;
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
