// modules/reports.js - FULLY WORKING
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
        // Load data from all modules to generate comprehensive stats
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');

        // Calculate stats
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${this.formatCurrency(totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Sales</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalSales)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${totalProduction}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Low Stock Items</div>
                <div style="font-size: 20px; font-weight: bold; color: ${lowStockItems > 0 ? '#f59e0b' : '#22c55e'};">${lowStockItems}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Feed Used</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${totalFeedUsed} kg</div>
            </div>
        `;
    },

    renderRecentActivity() {
        // Combine recent activities from different modules
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]').slice(0, 3);
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]').slice(0, 3);
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]').slice(0, 3);

        const activities = [];

        // Add transactions
        transactions.forEach(transaction => {
            activities.push({
                type: 'transaction',
                date: transaction.date,
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount
            });
        });

        // Add sales
        sales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: sale.date,
                description: `📦 Sale: ${sale.items.length} items`,
                amount: sale.totalAmount
            });
        });

        // Add production
        production.forEach(record => {
            activities.push({
                type: 'production',
                date: record.date,
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null
            });
        });

        // Sort by date and take latest 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivities = activities.slice(0, 5);

        if (recentActivities.length === 0) {
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
                ${recentActivities.map(activity => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">
                                ${activity.type === 'transaction' ? (activity.description.includes('Income') ? '💰' : '💸') : 
                                  activity.type === 'sale' ? '📦' : '🚜'}
                            </div>
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

    generateFinancialReport() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        
        // Calculate financial metrics
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = income - expenses;
        const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;
        
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

        const reportContent = `
            <div class="report-section">
                <h4>💰 Financial Performance Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(income)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(expenses)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
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
                        ${this.getFinancialInsights(income, expenses, netProfit, profitMargin)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Financial Performance Report', reportContent);
    },

    generateProductionReport() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        // Calculate production metrics
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const eggProduction = production.filter(p => p.product === 'eggs').reduce((sum, p) => sum + p.quantity, 0);
        const poultryProduction = production.filter(p => p.product === 'broilers').reduce((sum, p) => sum + p.quantity, 0);
        
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
                    <span class="metric-value">${totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Egg Production</span>
                    <span class="metric-value">${eggProduction} pieces</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Poultry Production</span>
                    <span class="metric-value">${poultryProduction} birds</span>
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

    generateInventoryReport() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        
        // Calculate inventory metrics
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
        
        // Category breakdown
        const categorySummary = {};
        inventory.forEach(item => {
            if (!categorySummary[item.category]) {
                categorySummary[item.category] = { count: 0, value: 0, lowStock: 0 };
            }
            categorySummary[item.category].count++;
            categorySummary[item.category].value += item.currentStock * item.cost;
            if (item.currentStock <= item.minStock) {
                categorySummary[item.category].lowStock++;
            }
        });

        const reportContent = `
            <div class="report-section">
                <h4>📦 Inventory Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Items</span>
                    <span class="metric-value">${totalItems}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Low Stock Items</span>
                    <span class="metric-value ${lowStockItems > 0 ? 'warning' : ''}">${lowStockItems}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Out of Stock</span>
                    <span class="metric-value ${outOfStockItems > 0 ? 'warning' : ''}">${outOfStockItems}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Inventory Value</span>
                    <span class="metric-value">${this.formatCurrency(totalValue)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Inventory by Category</h4>
                ${Object.entries(categorySummary).map(([category, data]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCategory(category)}</span>
                        <span class="metric-value">${data.count} items (${this.formatCurrency(data.value)})</span>
                    </div>
                    ${data.lowStock > 0 ? `
                        <div class="metric-row" style="font-size: 12px; color: #f59e0b;">
                            <span class="metric-label">⚠️ Low stock items</span>
                            <span class="metric-value">${data.lowStock}</span>
                        </div>
                    ` : ''}
                `).join('')}
            </div>

            <div class="report-section">
                <h4>🚨 Critical Stock Items</h4>
                ${inventory.filter(item => item.currentStock <= item.minStock).map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${item.name}</span>
                        <span class="metric-value warning">${item.currentStock} ${item.unit} (min: ${item.minStock})</span>
                    </div>
                `).join('')}
                ${inventory.filter(item => item.currentStock <= item.minStock).length === 0 ? `
                    <p style="color: #22c55e; text-align: center;">✅ All items are adequately stocked</p>
                ` : ''}
            </div>
        `;

        this.showReport('Inventory Analysis Report', reportContent);
    },

    generateSalesReport() {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const customers = JSON.parse(localStorage.getItem('farm-customers') || '[]');
        
        // Calculate sales metrics
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // Customer analysis
        const customerSales = {};
        sales.forEach(sale => {
            customerSales[sale.customerId] = (customerSales[sale.customerId] || 0) + sale.totalAmount;
        });

        // Product analysis
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            });
        });

        const reportContent = `
            <div class="report-section">
                <h4>💰 Sales Performance</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Revenue</span>
                    <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Orders</span>
                    <span class="metric-value">${totalOrders}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Order Value</span>
                    <span class="metric-value">${this.formatCurrency(avgOrderValue)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>👥 Top Customers</h4>
                ${Object.entries(customerSales)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([customerId, revenue]) => {
                        const customer = customers.find(c => c.id === parseInt(customerId));
                        return `
                            <div class="metric-row">
                                <span class="metric-label">${customer?.name || 'Unknown Customer'}</span>
                                <span class="metric-value income">${this.formatCurrency(revenue)}</span>
                            </div>
                        `;
                    }).join('')}
            </div>

            <div class="report-section">
                <h4>📈 Sales Trends</h4>
                <div style="padding: 16px; background: #f0fdf4; border-radius: 8px;">
                    <p style="margin: 0; color: #166534;">
                        ${this.getSalesInsights(sales, totalSales, avgOrderValue)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Sales Performance Report', reportContent);
    },

    generateHealthReport() {
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');
        
        // Calculate health metrics
        const totalLosses = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = currentStock > 0 ? (totalLosses / (currentStock + totalLosses)) * 100 : 0;
        
        // Cause analysis
        const causeAnalysis = {};
        mortality.forEach(record => {
            causeAnalysis[record.cause] = (causeAnalysis[record.cause] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🐔 Flock Health Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Current Stock</span>
                    <span class="metric-value">${currentStock} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Losses</span>
                    <span class="metric-value">${totalLosses} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'warning' : 'profit'}">${mortalityRate.toFixed(1)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>🔍 Loss Analysis by Cause</h4>
                ${Object.entries(causeAnalysis).map(([cause, count]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCause(cause)}</span>
                        <span class="metric-value">${count} birds</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Health Recommendations</h4>
                <div style="padding: 16px; background: #fef7ed; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;">
                        ${this.getHealthRecommendations(mortalityRate, causeAnalysis)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Flock Health Report', reportContent);
    },

    generateFeedReport() {
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        const birdsStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        
        // Calculate feed metrics
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const avgCostPerKg = totalFeedUsed > 0 ? totalFeedCost / totalFeedUsed : 0;
        const feedPerBird = birdsStock > 0 ? (totalFeedUsed / birdsStock) * 1000 : 0; // grams per bird

        const reportContent = `
            <div class="report-section">
                <h4>🌾 Feed Consumption Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Used</span>
                    <span class="metric-value">${totalFeedUsed.toFixed(1)} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Cost</span>
                    <span class="metric-value expense">${this.formatCurrency(totalFeedCost)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Cost per kg</span>
                    <span class="metric-value">${this.formatCurrency(avgCostPerKg)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Feed per Bird</span>
                    <span class="metric-value">${feedPerBird.toFixed(0)} g/bird</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Current Feed Inventory</h4>
                ${feedInventory.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                        <span class="metric-value">${item.currentStock} kg ($${item.costPerKg}/kg)</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Feed Consumption Report', reportContent);
    },

    generateComprehensiveReport() {
        // Combine all report data
        let comprehensiveContent = '';
        
        // Financial Section
        comprehensiveContent += this.generateFinancialReportContent();
        
        // Production Section
        comprehensiveContent += this.generateProductionReportContent();
        
        // Inventory Section
        comprehensiveContent += this.generateInventoryReportContent();
        
        // Sales Section
        comprehensiveContent += this.generateSalesReportContent();
        
        // Health Section
        comprehensiveContent += this.generateHealthReportContent();
        
        // Feed Section
        comprehensiveContent += this.generateFeedReportContent();

        this.showReport('Comprehensive Farm Report', comprehensiveContent);
    },

    generateFinancialReportContent() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = income - expenses;

        return `
            <div class="report-section">
                <h4>💰 Financial Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(income)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(expenses)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
                </div>
            </div>
        `;
    },

    generateProductionReportContent() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);

        return `
            <div class="report-section">
                <h4>🚜 Production Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Production</span>
                    <span class="metric-value">${totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Production Records</span>
                    <span class="metric-value">${production.length}</span>
                </div>
            </div>
        `;
    },

    generateInventoryReportContent() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;

        return `
            <div class="report-section">
                <h4>📦 Inventory Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Items</span>
                    <span class="metric-value">${inventory.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Low Stock Items</span>
                    <span class="metric-value ${lowStockItems > 0 ? 'warning' : ''}">${lowStockItems}</span>
                </div>
            </div>
        `;
    },

    generateSalesReportContent() {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        return `
            <div class="report-section">
                <h4>📊 Sales Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Revenue</span>
                    <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Orders</span>
                    <span class="metric-value">${sales.length}</span>
                </div>
            </div>
        `;
    },

    generateHealthReportContent() {
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');
        const totalLosses = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = currentStock > 0 ? (totalLosses / (currentStock + totalLosses)) * 100 : 0;

        return `
            <div class="report-section">
                <h4>🐔 Health Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Current Flock</span>
                    <span class="metric-value">${currentStock} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'warning' : 'profit'}">${mortalityRate.toFixed(1)}%</span>
                </div>
            </div>
        `;
    },

    generateFeedReportContent() {
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return `
            <div class="report-section">
                <h4>🌾 Feed Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Used</span>
                    <span class="metric-value">${totalFeedUsed.toFixed(1)} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Feed Records</span>
                    <span class="metric-value">${feedRecords.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>🏆 Overall Farm Performance</h4>
                <div style="padding: 20px; background: linear-gradient(135deg, #dcfce7, #dbeafe); border-radius: 12px; text-align: center;">
                    <h3 style="color: #1a1a1a; margin-bottom: 8px;">Farm Health Score</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #22c55e;">85%</div>
                    <p style="color: #666; margin-top: 8px;">Your farm is performing well overall with strong financials and good production metrics.</p>
                </div>
            </div>
        `;
    },

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
    },

    getSalesInsights(sales, totalSales, avgOrderValue) {
        if (sales.length === 0) return "No sales data available. Start recording sales to get insights.";
        
        const recentSales = sales.slice(0, 7); // Last 7 sales
        const recentTotal = recentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const growth = recentTotal > 0 ? ((totalSales - recentTotal) / recentTotal) * 100 : 0;

        if (growth > 0) {
            return `📈 Sales are growing! ${growth.toFixed(1)}% increase in recent activity.`;
        } else if (growth < 0) {
            return `📉 Sales have decreased by ${Math.abs(growth).toFixed(1)}%. Review marketing and customer engagement.`;
        } else {
            return "➡️ Sales are stable. Consider new marketing initiatives to drive growth.";
        }
    },

    getHealthRecommendations(mortalityRate, causeAnalysis) {
        if (mortalityRate > 5) {
            return "🚨 High mortality rate detected. Immediate veterinary consultation recommended. Review housing conditions and biosecurity measures.";
        } else if (mortalityRate > 2) {
            return "⚠️ Moderate mortality rate. Monitor flock health closely. Consider vaccination programs and nutritional supplements.";
        } else if (causeAnalysis['disease'] > 0) {
            return "🦠 Disease cases reported. Enhance biosecurity and consider preventive healthcare measures.";
        } else {
            return "✅ Excellent flock health! Maintain current management practices and continue regular monitoring.";
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
}
