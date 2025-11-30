// modules/reports.js - COMPLETE REWRITE WITH SUPERIOR UX
console.log('Loading reports module...');

const ReportsModule = {
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
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
            height: 2px;
            background: linear-gradient(90deg, #22c55e, #14b8a6);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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
            background: rgba(34, 197, 94, 0.1);
            color: #16a34a;
        }

        .stat-trend.negative {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
        }

        .stat-trend.neutral {
            background: rgba(100, 116, 139, 0.1);
            color: #475569;
        }

        /* Reports Grid */
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .report-type-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
            height: 2px;
            background: linear-gradient(90deg, #22c55e, #14b8a6);
        }

        .report-type-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border-color: rgba(34, 197, 94, 0.3);
        }

        .report-type-card.comprehensive {
            grid-column: 1 / -1;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
        }

        .report-type-card.comprehensive::before {
            height: 3px;
            background: linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6);
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
            color: #1e293b;
            margin-bottom: 0.75rem;
            line-height: 1.3;
        }

        .report-content p {
            font-size: 0.9rem;
            color: #64748b;
            line-height: 1.5;
            margin: 0;
        }

        /* Report Output */
        .report-output {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
            overflow: hidden;
        }

        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: rgba(248, 250, 252, 0.8);
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .header-content h3 {
            margin: 0 0 0.25rem 0;
            color: #1e293b;
            font-weight: 700;
        }

        .header-content p {
            margin: 0;
            color: #64748b;
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
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .metric-card {
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .metric-label {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
        }

        .metric-value.income {
            color: #16a34a;
        }

        .metric-value.expense {
            color: #dc2626;
        }

        .metric-value.profit {
            color: #16a34a;
        }

        .metric-value.warning {
            color: #d97706;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .data-table th {
            background: rgba(248, 250, 252, 0.8);
            color: #475569;
            font-weight: 600;
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
        }

        .data-table td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            color: #475569;
        }

        /* Recent Activity */
        .recent-activity {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem 0;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .section-header h3 {
            color: #1e293b;
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
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(226, 232, 240, 0.8);
            transition: all 0.2s ease;
        }

        .activity-item:hover {
            background: rgba(241, 245, 249, 0.8);
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
            color: #1e293b;
            margin-bottom: 0.25rem;
        }

        .activity-description {
            color: #64748b;
            font-size: 0.9rem;
        }

        .activity-time {
            color: #94a3b8;
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

    initialize() {
        console.log('📈 Initializing reports module...');
        this.updateQuickStats();
        this.renderRecentActivity();
        
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Reports event listeners attached');
        }, 100);
    },

    updateQuickStats() {
        const stats = this.calculateQuickStats();
        
        this.updateElement('total-revenue', this.formatCurrency(stats.totalRevenue));
        this.updateElement('total-production', stats.totalProduction.toLocaleString() + ' units');
        this.updateElement('inventory-health', stats.inventoryHealth + '%');
        this.updateElement('flock-status', stats.flockStatus);
    },

    calculateQuickStats() {
        // Get data from other modules or localStorage
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const inventoryHealth = totalItems > 0 ? Math.round(((totalItems - lowStockItems) / totalItems) * 100) : 100;
        
        const totalBirds = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;
        const flockStatus = mortalityRate < 2 ? 'Excellent' : mortalityRate < 5 ? 'Good' : 'Needs Attention';

        return {
            totalRevenue,
            totalProduction,
            inventoryHealth,
            flockStatus
        };
    },

    renderRecentActivity() {
        const activities = this.getRecentActivities();
        const container = document.getElementById('activity-list');
        
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-subtitle">Start using farm modules to see activity here</div>
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

    getRecentActivities() {
        const activities = [];
        const now = new Date();
        
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

    attachEventListeners() {
        console.log('🔗 Attaching reports event listeners...');

        // Report generation buttons
        document.querySelectorAll('.generate-report').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportType = e.target.dataset.reportType;
                this.generateReport(reportType);
            });
        });

        // Report actions
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
        document.getElementById('export-report')?.addEventListener('click', () => this.exportReport());
        document.getElementById('close-report')?.addEventListener('click', () => this.closeReport());
        document.getElementById('refresh-activity')?.addEventListener('click', () => this.refreshActivity());

        // Card click handlers
        document.querySelectorAll('.report-type-card').forEach(card => {
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

    generateReport(reportType) {
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

    generateFinancialData() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
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

    renderFinancialReport(data) {
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
                                <td>${((amount / data.totalIncome) * 100).toFixed(1)}%</td>
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
                                <td>${((amount / data.totalExpenses) * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Add other report generation methods similarly...
    generateProductionData() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        
        return {
            totalProduction: production.reduce((sum, record) => sum + record.quantity, 0),
            productionByProduct: this.groupByProduct(production),
            qualityDistribution: this.groupByQuality(production),
            mortalityData: this.calculateMortalityStats(mortality)
        };
    },

    renderProductionReport(data) {
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
                                <td>${((quantity / data.totalProduction) * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Add placeholder methods for other report types
    generateInventoryData() { return {}; }
    generateSalesData() { return {}; }
    generateHealthData() { return {}; }
    generateFeedData() { return {}; }
    generateComprehensiveData() { return {}; }

    renderInventoryReport(data) { return '<p>Inventory report content</p>'; }
    renderSalesReport(data) { return '<p>Sales report content</p>'; }
    renderHealthReport(data) { return '<p>Health report content</p>'; }
    renderFeedReport(data) { return '<p>Feed report content</p>'; }
    renderComprehensiveReport(data) { return '<p>Comprehensive report content</p>'; }

    showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-subtitle').textContent = `Generated on ${new Date().toLocaleDateString()}`;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').classList.remove('hidden');
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        document.getElementById('report-output').classList.add('hidden');
    },

    printReport() {
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

    exportReport() {
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

    refreshActivity() {
        this.renderRecentActivity();
        this.showNotification('Activity refreshed', 'success');
    },

    // Utility methods
    groupByCategory(transactions) {
        const groups = {};
        transactions.forEach(transaction => {
            groups[transaction.category] = (groups[transaction.category] || 0) + transaction.amount;
        });
        return groups;
    },

    groupByProduct(production) {
        const groups = {};
        production.forEach(record => {
            groups[record.product] = (groups[record.product] || 0) + record.quantity;
        });
        return groups;
    },

    groupByQuality(production) {
        const groups = {};
        production.forEach(record => {
            groups[record.quality] = (groups[record.quality] || 0) + 1;
        });
        return groups;
    },

    calculateMortalityStats(mortality) {
        const totalBirds = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const rate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;
        
        return {
            total: totalMortality,
            rate: rate.toFixed(2),
            byCause: this.groupByCause(mortality)
        };
    },

    groupByCause(mortality) {
        const groups = {};
        mortality.forEach(record => {
            groups[record.cause] = (groups[record.cause] || 0) + record.quantity;
        });
        return groups;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatCategory(category) {
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

    formatProductName(product) {
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

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
} else {
    console.error('FarmModules framework not found');
}
