// modules/reports.js
console.log('Loading reports module...');

class ReportsModule {
    constructor() {
        this.name = 'reports';
        this.initialized = false;
        this.container = null;
        this.reportData = {
            sales: [],
            production: [],
            mortality: [],
            orders: []
        };
    }

    async initialize() {
        console.log('📊 Initializing reports...');
        await this.loadAllData();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadAllData() {
        try {
            // Load data from all modules
            if (window.db) {
                this.reportData.sales = await window.db.getAll('sales') || [];
                this.reportData.production = await window.db.getAll('production') || [];
                this.reportData.mortality = await window.db.getAll('broiler-mortality') || [];
                this.reportData.orders = await window.db.getAll('orders') || [];
            } else {
                // Fallback to localStorage
                this.reportData.sales = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
                this.reportData.production = JSON.parse(localStorage.getItem('farm-production') || '[]');
                this.reportData.mortality = JSON.parse(localStorage.getItem('farm-broiler-mortality') || '[]');
                this.reportData.orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
            }
        } catch (error) {
            console.error('Error loading report data:', error);
        }
    }

    generateSalesReport(timeRange = 'month') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filteredSales = this.reportData.sales.filter(sale => 
            new Date(sale.timestamp) >= startDate
        );

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const avgSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

        // Product breakdown
        const productBreakdown = {};
        filteredSales.forEach(sale => {
            if (!productBreakdown[sale.product]) {
                productBreakdown[sale.product] = { quantity: 0, revenue: 0 };
            }
            productBreakdown[sale.product].quantity += sale.quantity;
            productBreakdown[sale.product].revenue += sale.total;
        });

        return {
            timeRange,
            period: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            totalRevenue: totalRevenue.toFixed(2),
            totalItems,
            transactionCount: filteredSales.length,
            avgSale: avgSale.toFixed(2),
            productBreakdown,
            salesData: filteredSales
        };
    }

    generateProductionReport(timeRange = 'month') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filteredProduction = this.reportData.production.filter(record => 
            new Date(record.timestamp) >= startDate
        );

        const totalProduction = filteredProduction.reduce((sum, record) => sum + record.quantity, 0);
        
        // Product breakdown
        const productBreakdown = {};
        filteredProduction.forEach(record => {
            if (!productBreakdown[record.product]) {
                productBreakdown[record.product] = { quantity: 0, unit: record.unit };
            }
            productBreakdown[record.product].quantity += record.quantity;
        });

        return {
            timeRange,
            period: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            totalProduction,
            recordCount: filteredProduction.length,
            productBreakdown,
            productionData: filteredProduction
        };
    }

    generateMortalityReport(timeRange = 'month') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filteredMortality = this.reportData.mortality.filter(record => 
            new Date(record.timestamp) >= startDate
        );

        const totalMortality = filteredMortality.reduce((sum, record) => sum + record.quantity, 0);
        
        // Cause breakdown
        const causeBreakdown = {};
        filteredMortality.forEach(record => {
            if (!causeBreakdown[record.cause]) {
                causeBreakdown[record.cause] = 0;
            }
            causeBreakdown[record.cause] += record.quantity;
        });

        // Batch analysis
        const batchAnalysis = {};
        filteredMortality.forEach(record => {
            if (!batchAnalysis[record.batch]) {
                batchAnalysis[record.batch] = { total: 0, records: 0 };
            }
            batchAnalysis[record.batch].total += record.quantity;
            batchAnalysis[record.batch].records++;
        });

        return {
            timeRange,
            period: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            totalMortality,
            recordCount: filteredMortality.length,
            causeBreakdown,
            batchAnalysis,
            mortalityData: filteredMortality
        };
    }

    generateOrdersReport(timeRange = 'month') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filteredOrders = this.reportData.orders.filter(order => 
            new Date(order.timestamp) >= startDate
        );

        const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
        const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
        const totalRevenue = filteredOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        // Customer analysis
        const customerAnalysis = {};
        filteredOrders.forEach(order => {
            if (!customerAnalysis[order.customer]) {
                customerAnalysis[order.customer] = { orders: 0, revenue: 0 };
            }
            customerAnalysis[order.customer].orders++;
            if (order.status === 'completed') {
                customerAnalysis[order.customer].revenue += order.total;
            }
        });

        return {
            timeRange,
            period: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            totalOrders: filteredOrders.length,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue.toFixed(2),
            completionRate: filteredOrders.length > 0 ? (completedOrders / filteredOrders.length * 100).toFixed(1) : 0,
            customerAnalysis,
            ordersData: filteredOrders
        };
    }

    generateComprehensiveReport() {
        const salesReport = this.generateSalesReport('month');
        const productionReport = this.generateProductionReport('month');
        const mortalityReport = this.generateMortalityReport('month');
        const ordersReport = this.generateOrdersReport('month');

        return {
            generatedAt: new Date().toLocaleString(),
            sales: salesReport,
            production: productionReport,
            mortality: mortalityReport,
            orders: ordersReport,
            summary: {
                totalRevenue: parseFloat(salesReport.totalRevenue),
                totalProduction: productionReport.totalProduction,
                totalMortality: mortalityReport.totalMortality,
                totalOrders: ordersReport.totalOrders
            }
        };
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.reports-container');
        this.setupEventListeners();
    }

    getTemplate() {
        return `
            <div class="reports-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Reports & Analytics</h1>
                        <p class="header-subtitle">Comprehensive farm performance insights</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" id="generate-comprehensive-btn">
                            <i class="icon">📈</i>
                            Full Report
                        </button>
                    </div>
                </div>

                <!-- Quick Stats Overview -->
                <div class="stats-overview">
                    <div class="overview-card">
                        <h3>Farm Overview</h3>
                        <div class="overview-stats">
                            <div class="overview-stat">
                                <div class="stat-label">Monthly Revenue</div>
                                <div class="stat-value" id="monthly-revenue">$0.00</div>
                            </div>
                            <div class="overview-stat">
                                <div class="stat-label">Production</div>
                                <div class="stat-value" id="total-production">0</div>
                            </div>
                            <div class="overview-stat">
                                <div class="stat-label">Orders</div>
                                <div class="stat-value" id="total-orders">0</div>
                            </div>
                            <div class="overview-stat">
                                <div class="stat-label">Mortality Rate</div>
                                <div class="stat-value" id="mortality-rate">0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Report Types Grid -->
                <div class="reports-grid">
                    <div class="report-card" data-report-type="sales">
                        <div class="report-icon">💰</div>
                        <div class="report-content">
                            <h3>Sales Report</h3>
                            <p>Revenue analysis and sales performance</p>
                        </div>
                        <div class="report-actions">
                            <select class="time-selector" data-report="sales">
                                <option value="week">This Week</option>
                                <option value="month" selected>This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                            <button class="btn-secondary generate-report-btn" data-report="sales">
                                Generate
                            </button>
                        </div>
                    </div>

                    <div class="report-card" data-report-type="production">
                        <div class="report-icon">🏭</div>
                        <div class="report-content">
                            <h3>Production Report</h3>
                            <p>Production output and yield analysis</p>
                        </div>
                        <div class="report-actions">
                            <select class="time-selector" data-report="production">
                                <option value="week">This Week</option>
                                <option value="month" selected>This Month</option>
                                <option value="quarter">This Quarter</option>
                            </select>
                            <button class="btn-secondary generate-report-btn" data-report="production">
                                Generate
                            </button>
                        </div>
                    </div>

                    <div class="report-card" data-report-type="mortality">
                        <div class="report-icon">🐔</div>
                        <div class="report-content">
                            <h3>Mortality Report</h3>
                            <p>Broiler mortality and health analysis</p>
                        </div>
                        <div class="report-actions">
                            <select class="time-selector" data-report="mortality">
                                <option value="week">This Week</option>
                                <option value="month" selected>This Month</option>
                            </select>
                            <button class="btn-secondary generate-report-btn" data-report="mortality">
                                Generate
                            </button>
                        </div>
                    </div>

                    <div class="report-card" data-report-type="orders">
                        <div class="report-icon">📋</div>
                        <div class="report-content">
                            <h3>Orders Report</h3>
                            <p>Order fulfillment and customer analysis</p>
                        </div>
                        <div class="report-actions">
                            <select class="time-selector" data-report="orders">
                                <option value="week">This Week</option>
                                <option value="month" selected>This Month</option>
                            </select>
                            <button class="btn-secondary generate-report-btn" data-report="orders">
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Area -->
                <div class="report-output-container">
                    <div class="output-header">
                        <h3>Report Output</h3>
                        <div class="output-actions">
                            <button class="btn-text" id="export-report-btn" disabled>
                                <i class="icon">📤</i>
                                Export
                            </button>
                            <button class="btn-text" id="print-report-btn" disabled>
                                <i class="icon">🖨️</i>
                                Print
                            </button>
                        </div>
                    </div>
                    <div class="report-output" id="report-output">
                        <div class="empty-output">
                            <div class="empty-icon">📊</div>
                            <h4>No Report Generated</h4>
                            <p>Select a report type and click "Generate" to view insights</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        // Generate comprehensive report
        this.container.querySelector('#generate-comprehensive-btn')?.addEventListener('click', () => {
            this.generateComprehensiveReportDisplay();
        });

        // Generate individual reports
        this.container.querySelectorAll('.generate-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.getAttribute('data-report');
                const timeSelector = this.container.querySelector(`.time-selector[data-report="${reportType}"]`);
                const timeRange = timeSelector?.value || 'month';
                this.generateIndividualReport(reportType, timeRange);
            });
        });

        // Export report
        this.container.querySelector('#export-report-btn')?.addEventListener('click', () => {
            this.exportCurrentReport();
        });

        // Print report
        this.container.querySelector('#print-report-btn')?.addEventListener('click', () => {
            this.printCurrentReport();
        });

        // Load overview stats
        this.loadOverviewStats();
    }

    async loadOverviewStats() {
        await this.loadAllData();
        
        const salesReport = this.generateSalesReport('month');
        const productionReport = this.generateProductionReport('month');
        const ordersReport = this.generateOrdersReport('month');
        const mortalityReport = this.generateMortalityReport('month');

        // Calculate mortality rate
        const totalBirds = mortalityReport.mortalityData.reduce((sum, record) => 
            sum + (record.totalBirds || 0), 0
        );
        const mortalityRate = totalBirds > 0 ? 
            (mortalityReport.totalMortality / totalBirds * 100).toFixed(1) : 0;

        this.updateElement('#monthly-revenue', `$${salesReport.totalRevenue}`);
        this.updateElement('#total-production', productionReport.totalProduction.toLocaleString());
        this.updateElement('#total-orders', ordersReport.totalOrders);
        this.updateElement('#mortality-rate', `${mortalityRate}%`);
    }

    generateIndividualReport(reportType, timeRange) {
        let report;
        let title;

        switch (reportType) {
            case 'sales':
                report = this.generateSalesReport(timeRange);
                title = `Sales Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`;
                break;
            case 'production':
                report = this.generateProductionReport(timeRange);
                title = `Production Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`;
                break;
            case 'mortality':
                report = this.generateMortalityReport(timeRange);
                title = `Mortality Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`;
                break;
            case 'orders':
                report = this.generateOrdersReport(timeRange);
                title = `Orders Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`;
                break;
            default:
                return;
        }

        this.displayReport(report, title, reportType);
    }

    generateComprehensiveReportDisplay() {
        const report = this.generateComprehensiveReport();
        this.displayReport(report, 'Comprehensive Farm Report', 'comprehensive');
    }

    displayReport(report, title, reportType) {
        const outputElement = this.container?.querySelector('#report-output');
        if (!outputElement) return;

        let reportHTML = '';

        if (reportType === 'comprehensive') {
            reportHTML = this.formatComprehensiveReport(report);
        } else {
            reportHTML = this.formatIndividualReport(report, reportType, title);
        }

        outputElement.innerHTML = reportHTML;
        
        // Enable export and print buttons
        this.container.querySelector('#export-report-btn').disabled = false;
        this.container.querySelector('#print-report-btn').disabled = false;

        // Store current report for export
        this.currentReport = { report, title, type: reportType };
    }

    formatIndividualReport(report, type, title) {
        let content = '';

        switch (type) {
            case 'sales':
                content = this.formatSalesReport(report);
                break;
            case 'production':
                content = this.formatProductionReport(report);
                break;
            case 'mortality':
                content = this.formatMortalityReport(report);
                break;
            case 'orders':
                content = this.formatOrdersReport(report);
                break;
        }

        return `
            <div class="generated-report">
                <div class="report-header">
                    <h2>${title}</h2>
                    <div class="report-meta">
                        <span>Period: ${report.period}</span>
                        <span>Generated: ${new Date().toLocaleString()}</span>
                    </div>
                </div>
                ${content}
            </div>
        `;
    }

    formatSalesReport(report) {
        const topProducts = Object.entries(report.productBreakdown)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);

        return `
            <div class="report-section">
                <h3>📊 Key Metrics</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$${report.totalRevenue}</div>
                        <div class="metric-label">Total Revenue</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.totalItems}</div>
                        <div class="metric-label">Items Sold</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.transactionCount}</div>
                        <div class="metric-label">Transactions</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${report.avgSale}</div>
                        <div class="metric-label">Average Sale</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>🏆 Top Products</h3>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topProducts.map(([product, data]) => `
                                <tr>
                                    <td>${product}</td>
                                    <td>${data.quantity}</td>
                                    <td>$${data.revenue.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    formatProductionReport(report) {
        const topProducts = Object.entries(report.productBreakdown)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 5);

        return `
            <div class="report-section">
                <h3>📈 Production Overview</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.totalProduction.toLocaleString()}</div>
                        <div class="metric-label">Total Production</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.recordCount}</div>
                        <div class="metric-label">Records</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Object.keys(report.productBreakdown).length}</div>
                        <div class="metric-label">Products</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>🏆 Top Produced Items</h3>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topProducts.map(([product, data]) => `
                                <tr>
                                    <td>${product}</td>
                                    <td>${data.quantity.toLocaleString()}</td>
                                    <td>${data.unit}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    formatComprehensiveReport(report) {
        return `
            <div class="generated-report">
                <div class="report-header">
                    <h2>🏆 Comprehensive Farm Report</h2>
                    <div class="report-meta">
                        <span>Generated: ${report.generatedAt}</span>
                    </div>
                </div>

                <div class="report-section">
                    <h3>📊 Executive Summary</h3>
                    <div class="executive-summary">
                        <div class="summary-grid">
                            <div class="summary-item revenue">
                                <div class="summary-value">$${report.summary.totalRevenue.toFixed(2)}</div>
                                <div class="summary-label">Monthly Revenue</div>
                            </div>
                            <div class="summary-item production">
                                <div class="summary-value">${report.summary.totalProduction.toLocaleString()}</div>
                                <div class="summary-label">Monthly Production</div>
                            </div>
                            <div class="summary-item orders">
                                <div class="summary-value">${report.summary.totalOrders}</div>
                                <div class="summary-label">Monthly Orders</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Include sections from individual reports -->
                ${this.formatSalesReport(report.sales)}
                ${this.formatProductionReport(report.production)}
                ${this.formatMortalityReport(report.mortality)}
                ${this.formatOrdersReport(report.orders)}
            </div>
        `;
    }

    formatMortalityReport(report) {
        const topCauses = Object.entries(report.causeBreakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return `
            <div class="report-section">
                <h3>🐔 Mortality Overview</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.totalMortality}</div>
                        <div class="metric-label">Total Mortality</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.recordCount}</div>
                        <div class="metric-label">Records</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>🔍 Top Causes</h3>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Cause</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topCauses.map(([cause, count]) => `
                                <tr>
                                    <td>${cause}</td>
                                    <td>${count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    formatOrdersReport(report) {
        const topCustomers = Object.entries(report.customerAnalysis)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);

        return `
            <div class="report-section">
                <h3>📋 Orders Overview</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.totalOrders}</div>
                        <div class="metric-label">Total Orders</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.pendingOrders}</div>
                        <div class="metric-label">Pending</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.completedOrders}</div>
                        <div class="metric-label">Completed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.completionRate}%</div>
                        <div class="metric-label">Completion Rate</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>🏆 Top Customers</h3>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Orders</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topCustomers.map(([customer, data]) => `
                                <tr>
                                    <td>${customer}</td>
                                    <td>${data.orders}</td>
                                    <td>$${data.revenue.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    exportCurrentReport() {
        if (!this.currentReport) {
            this.showToast('No report to export', 'warning');
            return;
        }

        const { report, title, type } = this.currentReport;
        let content = '';

        if (type === 'comprehensive') {
            content = this.generateComprehensiveTextReport(report);
        } else {
            content = this.generateIndividualTextReport(report, type, title);
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast('Report exported successfully!', 'success');
    }

    generateComprehensiveTextReport(report) {
        return `
COMPREHENSIVE FARM REPORT
Generated: ${report.generatedAt}

EXECUTIVE SUMMARY
• Monthly Revenue: $${report.summary.totalRevenue.toFixed(2)}
• Monthly Production: ${report.summary.totalProduction.toLocaleString()} units
• Monthly Orders: ${report.summary.totalOrders}
• Monthly Mortality: ${report.summary.totalMortality} birds

SALES REPORT (${report.sales.period})
• Total Revenue: $${report.sales.totalRevenue}
• Items Sold: ${report.sales.totalItems}
• Transactions: ${report.sales.transactionCount}
• Average Sale: $${report.sales.avgSale}

PRODUCTION REPORT (${report.production.period})
• Total Production: ${report.production.totalProduction.toLocaleString()} units
• Production Records: ${report.production.recordCount}
• Unique Products: ${Object.keys(report.production.productBreakdown).length}

MORTALITY REPORT (${report.mortality.period})
• Total Mortality: ${report.mortality.totalMortality} birds
• Mortality Records: ${report.mortality.recordCount}

ORDERS REPORT (${report.orders.period})
• Total Orders: ${report.orders.totalOrders}
• Pending Orders: ${report.orders.pendingOrders}
• Completed Orders: ${report.orders.completedOrders}
• Completion Rate: ${report.orders.completionRate}%
        `.trim();
    }

    generateIndividualTextReport(report, type, title) {
        // Similar text formatting for individual reports
        return `${title}\n\n...`; // Implementation similar to comprehensive but for individual reports
    }

    printCurrentReport() {
        if (!this.currentReport) {
            this.showToast('No report to print', 'warning');
            return;
        }

        const printContent = this.container.querySelector('.generated-report')?.outerHTML;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.currentReport.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .generated-report { max-width: 100%; }
                    .report-header { text-align: center; margin-bottom: 30px; }
                    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                    .metric-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
                    .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
        this.currentReport = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', new ReportsModule());
    console.log('✅ Reports module registered');
}
