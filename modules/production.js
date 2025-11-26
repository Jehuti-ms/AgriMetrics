// modules/reports.js
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,

    initialize() {
        console.log('📊 Initializing reports...');
        this.renderReports();
        this.initialized = true;
        return true;
    },

    loadAllData() {
        // Load data from all modules
        const salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
        const productionData = JSON.parse(localStorage.getItem('farm-production-data') || '[]');
        const mortalityData = JSON.parse(localStorage.getItem('farm-mortality-data') || '[]');
        const ordersData = JSON.parse(localStorage.getItem('farm-orders-data') || '[]');

        return {
            sales: salesData,
            production: productionData,
            mortality: mortalityData,
            orders: ordersData
        };
    },

    generateSalesReport() {
        const data = this.loadAllData();
        const sales = data.sales;

        if (sales.length === 0) {
            this.showNotification('No sales data available for report', 'info');
            return;
        }

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;

        const today = new Date().toDateString();
        const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

        const report = `
📊 SALES REPORT
Generated: ${new Date().toLocaleDateString()}

💰 Revenue Summary:
• Total Revenue: $${totalRevenue.toFixed(2)}
• Today's Revenue: $${todayRevenue.toFixed(2)}
• Average Sale: $${avgSale.toFixed(2)}

📦 Sales Statistics:
• Total Items Sold: ${totalItems}
• Total Transactions: ${sales.length}
• Today's Transactions: ${todaySales.length}

Top Products:
${this.getTopProducts(sales).map(([product, data]) => 
    `• ${product}: ${data.quantity} sold, $${data.revenue.toFixed(2)} revenue`
).join('\n')}
        `.trim();

        this.showReportModal('Sales Report', report);
    },

    generateProductionReport() {
        const data = this.loadAllData();
        const production = data.production;

        if (production.length === 0) {
            this.showNotification('No production data available for report', 'info');
            return;
        }

        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        
        const today = new Date().toDateString();
        const todayProduction = production.filter(record => new Date(record.date).toDateString() === today)
            .reduce((sum, record) => sum + record.quantity, 0);

        const report = `
🏭 PRODUCTION REPORT
Generated: ${new Date().toLocaleDateString()}

📈 Production Summary:
• Total Production: ${totalProduction} units
• Today's Production: ${todayProduction} units
• Total Records: ${production.length}

Product Breakdown:
${this.getProductBreakdown(production).map(([product, quantity]) => 
    `• ${product}: ${quantity} units`
).join('\n')}

Quality Distribution:
${this.getQualityDistribution(production).map(([quality, count]) => 
    `• ${quality}: ${count} records`
).join('\n')}
        `.trim();

        this.showReportModal('Production Report', report);
    },

    generateMortalityReport() {
        const data = this.loadAllData();
        const mortality = data.mortality;

        if (mortality.length === 0) {
            this.showNotification('No mortality data available for report', 'info');
            return;
        }

        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        
        const today = new Date().toDateString();
        const todayMortality = mortality.filter(record => new Date(record.date).toDateString() === today)
            .reduce((sum, record) => sum + record.quantity, 0);

        const report = `
🐔 MORTALITY REPORT
Generated: ${new Date().toLocaleDateString()}

📊 Mortality Summary:
• Total Mortality: ${totalMortality} birds
• Today's Mortality: ${todayMortality} birds
• Total Records: ${mortality.length}

Cause Analysis:
${this.getCauseBreakdown(mortality).map(([cause, count]) => 
    `• ${cause}: ${count} birds`
).join('\n')}

Batch Analysis:
${this.getBatchAnalysis(mortality).slice(0, 5).map(([batch, data]) => 
    `• ${batch}: ${data.total} birds across ${data.records} records`
).join('\n')}
        `.trim();

        this.showReportModal('Mortality Report', report);
    },

    generateOrdersReport() {
        const data = this.loadAllData();
        const orders = data.orders;

        if (orders.length === 0) {
            this.showNotification('No orders data available for report', 'info');
            return;
        }

        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const totalRevenue = orders.filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        const report = `
📋 ORDERS REPORT
Generated: ${new Date().toLocaleDateString()}

📈 Order Statistics:
• Total Orders: ${orders.length}
• Pending Orders: ${pendingOrders}
• Completed Orders: ${completedOrders}
• Completion Rate: ${orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0}%
• Total Revenue: $${totalRevenue.toFixed(2)}

Customer Analysis:
${this.getCustomerAnalysis(orders).slice(0, 5).map(([customer, data]) => 
    `• ${customer}: ${data.orders} orders, $${data.revenue.toFixed(2)} revenue`
).join('\n')}
        `.trim();

        this.showReportModal('Orders Report', report);
    },

    generateComprehensiveReport() {
        const data = this.loadAllData();
        
        const salesRevenue = data.sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalProduction = data.production.reduce((sum, record) => sum + record.quantity, 0);
        const totalMortality = data.mortality.reduce((sum, record) => sum + record.quantity, 0);
        const pendingOrders = data.orders.filter(order => order.status === 'pending').length;

        const report = `
🏆 COMPREHENSIVE FARM REPORT
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY:
• Total Revenue: $${salesRevenue.toFixed(2)}
• Total Production: ${totalProduction} units
• Total Mortality: ${totalMortality} birds
• Pending Orders: ${pendingOrders}

MODULE OVERVIEW:
• Sales Records: ${data.sales.length}
• Production Records: ${data.production.length}
• Mortality Records: ${data.mortality.length}
• Order Records: ${data.orders.length}

RECOMMENDATIONS:
${this.generateRecommendations(data)}
        `.trim();

        this.showReportModal('Comprehensive Farm Report', report);
    },

    // Helper methods
    getTopProducts(sales) {
        const productMap = {};
        sales.forEach(sale => {
            if (!productMap[sale.product]) {
                productMap[sale.product] = { quantity: 0, revenue: 0 };
            }
            productMap[sale.product].quantity += sale.quantity;
            productMap[sale.product].revenue += sale.total;
        });
        
        return Object.entries(productMap)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);
    },

    getProductBreakdown(production) {
        const productMap = {};
        production.forEach(record => {
            productMap[record.product] = (productMap[record.product] || 0) + record.quantity;
        });
        
        return Object.entries(productMap)
            .sort((a, b) => b[1] - a[1]);
    },

    getQualityDistribution(production) {
        const qualityMap = {};
        production.forEach(record => {
            qualityMap[record.quality] = (qualityMap[record.quality] || 0) + 1;
        });
        
        return Object.entries(qualityMap)
            .sort((a, b) => b[1] - a[1]);
    },

    getCauseBreakdown(mortality) {
        const causeMap = {};
        mortality.forEach(record => {
            causeMap[record.cause] = (causeMap[record.cause] || 0) + record.quantity;
        });
        
        return Object.entries(causeMap)
            .sort((a, b) => b[1] - a[1]);
    },

    getBatchAnalysis(mortality) {
        const batchMap = {};
        mortality.forEach(record => {
            if (!batchMap[record.batch]) {
                batchMap[record.batch] = { total: 0, records: 0 };
            }
            batchMap[record.batch].total += record.quantity;
            batchMap[record.batch].records++;
        });
        
        return Object.entries(batchMap)
            .sort((a, b) => b[1].total - a[1].total);
    },

    getCustomerAnalysis(orders) {
        const customerMap = {};
        orders.forEach(order => {
            if (!customerMap[order.customer]) {
                customerMap[order.customer] = { orders: 0, revenue: 0 };
            }
            customerMap[order.customer].orders++;
            if (order.status === 'completed') {
                customerMap[order.customer].revenue += order.total;
            }
        });
        
        return Object.entries(customerMap)
            .sort((a, b) => b[1].revenue - a[1].revenue);
    },

    generateRecommendations(data) {
        const recommendations = [];
        
        if (data.mortality.length > 0) {
            const avgMortality = data.mortality.reduce((sum, record) => sum + record.quantity, 0) / data.mortality.length;
            if (avgMortality > 5) {
                recommendations.push('• High mortality rate detected - review flock health and conditions');
            }
        }
        
        if (data.orders.filter(order => order.status === 'pending').length > 10) {
            recommendations.push('• High number of pending orders - consider increasing production capacity');
        }
        
        if (data.sales.length === 0) {
            recommendations.push('• No sales recorded - focus on marketing and customer acquisition');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('• Farm operations are running smoothly - keep up the good work!');
        }
        
        return recommendations.join('\n');
    },

    showReportModal(title, content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a;">${title}</h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>

                <div style="
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 20px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    max-height: 400px;
                    overflow-y: auto;
                ">${content}</div>

                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="export-report-btn" style="
                        flex: 1;
                        background: #10b981;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Export as Text</button>
                    <button class="close-modal" style="
                        flex: 1;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for modal
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        modal.querySelector('.export-report-btn').addEventListener('click', () => {
            this.exportReport(title, content);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    exportReport(title, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully!', 'success');
    },

    renderReports() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Reports & Analytics</h1>
                    <p style="color: #666; font-size: 16px;">Comprehensive farm performance insights</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="comprehensive-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">🏆</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Comprehensive Report</div>
                                <div style="font-size: 12px; color: #666;">Full farm overview</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="sales-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">💰</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Sales Report</div>
                                <div style="font-size: 12px; color: #666;">Revenue analysis</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="production-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">🏭</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Production Report</div>
                                <div style="font-size: 12px; color: #666;">Output analysis</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="mortality-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">🐔</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Mortality Report</div>
                                <div style="font-size: 12px; color: #666;">Health analysis</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="orders-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">📋</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Orders Report</div>
                                <div style="font-size: 12px; color: #666;">Customer analysis</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Report Output Area -->
                <div style="
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 16px;
                    padding: 30px;
                    text-align: center;
                    color: #666;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 18px; margin-bottom: 8px; font-weight: 600;">No Report Generated</div>
                    <div style="font-size: 14px; color: #999;">Select a report type above to generate insights</div>
                </div>
            </div>
        `;

        this.setupReportsEventListeners();
    },

    setupReportsEventListeners() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });

            // Add click handlers for action buttons
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                switch (action) {
                    case 'comprehensive-report':
                        this.generateComprehensiveReport();
                        break;
                    case 'sales-report':
                        this.generateSalesReport();
                        break;
                    case 'production-report':
                        this.generateProductionReport();
                        break;
                    case 'mortality-report':
                        this.generateMortalityReport();
                        break;
                    case 'orders-report':
                        this.generateOrdersReport();
                        break;
                }
            });
        });
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered');
}
