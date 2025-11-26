// modules/reports.js - Fixed (object literal)
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,

    initialize() {
        console.log('📊 Initializing reports...');
        this.render();
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

        const report = `
📊 SALES REPORT
Generated: ${new Date().toLocaleDateString()}

💰 Revenue Summary:
• Total Revenue: $${totalRevenue.toFixed(2)}
• Average Sale: $${avgSale.toFixed(2)}

📦 Sales Statistics:
• Total Items Sold: ${totalItems}
• Total Transactions: ${sales.length}
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
        
        const report = `
🏭 PRODUCTION REPORT
Generated: ${new Date().toLocaleDateString()}

📈 Production Summary:
• Total Production: ${totalProduction} units
• Total Records: ${production.length}
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

        const report = `
🐔 MORTALITY REPORT
Generated: ${new Date().toLocaleDateString()}

📊 Mortality Summary:
• Total Mortality: ${totalMortality} birds
• Total Records: ${mortality.length}
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

        const report = `
📋 ORDERS REPORT
Generated: ${new Date().toLocaleDateString()}

📈 Order Statistics:
• Total Orders: ${orders.length}
• Pending Orders: ${pendingOrders}
• Completed Orders: ${completedOrders}
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
        `.trim();

        this.showReportModal('Comprehensive Farm Report', report);
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
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

        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    render() {
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

        this.setupEventListeners();
    },

    setupEventListeners() {
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
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered');
}
