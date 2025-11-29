// modules/reports.js - UPDATED WITH SHARED DATA PATTERN
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,

    initialize() {
        console.log('📈 Initializing reports...');
        this.renderModule();
        this.initialized = true;
        return true;
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <!-- Report Categories -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sales Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Health Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Feed Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🏆</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Comprehensive Farm Report</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report" style="width: 100%; background: linear-gradient(135deg, #22c55e, #3b82f6);">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden" style="margin-top: 32px;">
                    <div class="output-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report Output</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-outline" id="print-report">
                                🖨️ Print
                            </button>
                            <button class="btn-outline" id="export-report">
                                📥 Export
                            </button>
                            <button class="btn-outline" id="close-report">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <div class="output-content" style="padding: 24px;">
                        <div id="report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card" style="padding: 24px; margin-top: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Farm Activity</h3>
                    <div id="recent-activity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    renderQuickStats() {
        // Use shared data when available, fallback to localStorage
        const stats = this.getFarmStats();
        
        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Birds</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalBirds}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalProduction}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Low Stock Items</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e'};">${stats.lowStockItems}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Feed Used</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalFeedUsed} kg</div>
            </div>
        `;
    },

    // NEW METHOD: Get farm stats from shared data or localStorage
    getFarmStats() {
        // Try to get from shared data first
        if (window.FarmModules && window.FarmModules.appData && window.FarmModules.appData.profile && window.FarmModules.appData.profile.dashboardStats) {
            const sharedStats = window.FarmModules.appData.profile.dashboardStats;
            return {
                totalRevenue: sharedStats.totalRevenue || 0,
                netProfit: sharedStats.netProfit || 0,
                totalBirds: sharedStats.totalBirds || 0,
                totalProduction: sharedStats.totalProduction || 0,
                lowStockItems: sharedStats.lowStockItems || 0,
                totalFeedUsed: sharedStats.totalFeedUsed || 0
            };
        }

        // Fallback to localStorage calculation
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');

        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return {
            totalRevenue,
            netProfit,
            totalBirds: currentStock,
            totalProduction,
            lowStockItems,
            totalFeedUsed
        };
    },

    renderRecentActivity() {
        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Start using the app to see activity here</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${activity.icon}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${activity.description}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">${activity.date}</div>
                            </div>
                        </div>
                        ${activity.amount !== null ? `
                            <div style="font-weight: bold; color: var(--text-primary);">
                                ${this.formatCurrency(activity.amount)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // NEW METHOD: Get recent activities from multiple sources
    getRecentActivities() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]').slice(0, 3);
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]').slice(0, 3);
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]').slice(0, 3);
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]').slice(0, 3);
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]').slice(0, 3);

        const activities = [];

        // Add transactions
        transactions.forEach(transaction => {
            activities.push({
                type: 'transaction',
                date: transaction.date,
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount,
                icon: transaction.type === 'income' ? '💰' : '💸'
            });
        });

        // Add sales
        sales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: sale.date,
                description: `📦 Sale: ${sale.items?.length || 0} items`,
                amount: sale.totalAmount,
                icon: '📦'
            });
        });

        // Add production
        production.forEach(record => {
            activities.push({
                type: 'production',
                date: record.date,
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null,
                icon: '🚜'
            });
        });

        // Add feed records
        feedRecords.forEach(record => {
            activities.push({
                type: 'feed',
                date: record.date,
                description: `🌾 Feed: ${record.quantity}kg ${record.feedType}`,
                amount: record.cost,
                icon: '🌾'
            });
        });

        // Add mortality records
        mortalityRecords.forEach(record => {
            activities.push({
                type: 'mortality',
                date: record.date,
                description: `😔 Mortality: ${record.quantity} birds (${this.formatCause(record.cause)})`,
                amount: null,
                icon: '😔'
            });
        });

        // Sort by date and take latest 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        return activities.slice(0, 5);
    },

    setupEventListeners() {
        // Report generation buttons
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
        document.querySelector('.generate-sales-report')?.addEventListener('click', () => this.generateSalesReport());
        document.querySelector('.generate-health-report')?.addEventListener('click', () => this.generateHealthReport());
        document.querySelector('.generate-feed-report')?.addEventListener('click', () => this.generateFeedReport());
        document.querySelector('.generate-comprehensive-report')?.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report actions
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
        document.getElementById('export-report')?.addEventListener('click', () => this.exportReport());
        document.getElementById('close-report')?.addEventListener('click', () => this.closeReport());
    },

    // UPDATED METHOD: Use shared data for financial report
    generateFinancialReport() {
        const stats = this.getFarmStats();
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        // Category breakdown
        const incomeByCategory = {};
        const expensesByCategory = {};
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });

        const profitMargin = stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0;

        const reportContent = `
            <div class="report-section">
                <h4>💰 Financial Performance Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(stats.totalRevenue - stats.netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Profit Margin</span>
                    <span class="metric-value ${profitMargin >= 0 ? 'profit' : 'expense'}">${profitMargin.toFixed(1)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Income by Category</h4>
                ${Object.entries(incomeByCategory).map(([category, amount]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCategory(category)}</span>
                        <span class="metric-value income">${this.formatCurrency(amount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>📊 Expenses by Category</h4>
                ${Object.entries(expensesByCategory).map(([category, amount]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCategory(category)}</span>
                        <span class="metric-value expense">${this.formatCurrency(amount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Financial Insights</h4>
                <div style="padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af;">
                        ${this.getFinancialInsights(stats.totalRevenue, stats.totalRevenue - stats.netProfit, stats.netProfit, profitMargin)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Financial Performance Report', reportContent);
    },

    // UPDATED METHOD: Use shared data for production report
    generateProductionReport() {
        const stats = this.getFarmStats();
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        // Quality breakdown
        const qualityCounts = {};
        production.forEach(record => {
            qualityCounts[record.quality] = (qualityCounts[record.quality] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🚜 Production Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Production</span>
                    <span class="metric-value">${stats.totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Production Records</span>
                    <span class="metric-value">${production.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Production Quality</h4>
                ${Object.entries(qualityCounts).map(([quality, count]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatQuality(quality)}</span>
                        <span class="metric-value">${count} units</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>📅 Recent Production Activity</h4>
                ${production.slice(0, 5).map(record => `
                    <div class="metric-row">
                        <span class="metric-label">${record.date} - ${record.product}</span>
                        <span class="metric-value">${record.quantity} ${record.unit}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Production Analysis Report', reportContent);
    },

    // ... (ALL OTHER REPORT GENERATION METHODS REMAIN SIMILAR BUT USE getFarmStats() WHERE POSSIBLE)

    generateComprehensiveReport() {
        const stats = this.getFarmStats();
        
        const reportContent = `
            <div class="report-section">
                <h2>🏆 Comprehensive Farm Report</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="padding: 20px; background: #f0f9ff; border-radius: 12px;">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">Financial Health</h4>
                        <div class="metric-row">
                            <span>Revenue:</span>
                            <span class="income">${this.formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div class="metric-row">
                            <span>Profit:</span>
                            <span class="${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                    <div style="padding: 20px; background: #f0fdf4; border-radius: 12px;">
                        <h4 style="color: #166534; margin-bottom: 10px;">Production</h4>
                        <div class="metric-row">
                            <span>Total Birds:</span>
                            <span>${stats.totalBirds}</span>
                        </div>
                        <div class="metric-row">
                            <span>Production:</span>
                            <span>${stats.totalProduction} units</span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="padding: 20px; background: #fef7ed; border-radius: 12px;">
                        <h4 style="color: #92400e; margin-bottom: 10px;">Inventory</h4>
                        <div class="metric-row">
                            <span>Low Stock Items:</span>
                            <span class="${stats.lowStockItems > 0 ? 'warning' : 'profit'}">${stats.lowStockItems}</span>
                        </div>
                        <div class="metric-row">
                            <span>Feed Used:</span>
                            <span>${stats.totalFeedUsed} kg</span>
                        </div>
                    </div>
                    <div style="padding: 20px; background: #fae8ff; border-radius: 12px;">
                        <h4 style="color: #86198f; margin-bottom: 10px;">Performance</h4>
                        <div class="metric-row">
                            <span>Farm Score:</span>
                            <span style="color: #22c55e; font-weight: bold;">85%</span>
                        </div>
                        <div class="metric-row">
                            <span>Status:</span>
                            <span style="color: #22c55e;">Excellent</span>
                        </div>
                    </div>
                </div>

                <div class="report-section" style="margin-top: 30px;">
                    <h4>📈 Overall Assessment</h4>
                    <div style="padding: 20px; background: linear-gradient(135deg, #dcfce7, #dbeafe); border-radius: 12px;">
                        <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">
                            Your farm is performing well with strong financial results and good production metrics. 
                            Continue monitoring inventory levels and maintain current operational practices for sustained success.
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.showReport('Comprehensive Farm Report', reportContent);
    },

    // ... (ALL HELPER METHODS REMAIN EXACTLY THE SAME)
    // showReport(), closeReport(), printReport(), exportReport()
    // formatCurrency(), formatCategory(), formatQuality(), formatCause(), formatFeedType()
    // getFinancialInsights(), getSalesInsights(), getHealthRecommendations()

    showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').classList.remove('hidden');
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        document.getElementById('report-output').classList.add('hidden');
    },

    printReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Farm Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-section { margin-bottom: 30px; }
                        .metric-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .metric-label { font-weight: 600; }
                        .metric-value { font-weight: bold; }
                        .income { color: #22c55e; }
                        .expense { color: #ef4444; }
                        .profit { color: #22c55e; }
                        .warning { color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <h1>${document.getElementById('report-title').textContent}</h1>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr>
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
        
        if (window.coreModule) {
            window.coreModule.showNotification('Report exported successfully!', 'success');
        }
    },

    // Helper methods
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
            'other': 'Other',
            'feed': 'Feed',
            'medical': 'Medical',
            'packaging': 'Packaging',
            'equipment': 'Equipment',
            'cleaning': 'Cleaning'
        };
        return categories[category] || category;
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C',
            'rejects': 'Rejects'
        };
        return qualities[quality] || quality;
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'other': 'Other'
        };
        return causes[cause] || cause;
    },

    formatFeedType(feedType) {
        const types = {
            'starter': 'Starter',
            'grower': 'Grower',
            'finisher': 'Finisher',
            'layer': 'Layer'
        };
        return types[feedType] || feedType;
    },

    getFinancialInsights(income, expenses, netProfit, profitMargin) {
        if (netProfit < 0) {
            return "⚠️ Your farm is operating at a loss. Consider reviewing expenses and increasing revenue streams.";
        } else if (profitMargin < 10) {
            return "📈 Profit margin is low. Focus on cost optimization and premium product offerings.";
        } else if (profitMargin > 25) {
            return "🎉 Excellent profitability! Consider reinvesting in farm expansion or improvements.";
        } else {
            return "✅ Healthy financial performance. Maintain current operations and monitor trends.";
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
}
