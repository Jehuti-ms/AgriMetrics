// modules/orders.js - UPDATED WITH MODALS FOR REPORTS
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [],
    currentView: 'orders-overview',

    initialize() {
        console.log('📋 Initializing orders...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        
        // Sync initial stats with profile
        this.syncStatsWithProfile();
        
        return true;
    },

    // ... (previous loadData, getDemoOrders, getDemoCustomers, getDemoProducts methods remain the same) ...

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        if (this.currentView === 'customer-management') {
            contentArea.innerHTML = this.renderCustomerManagement();
            this.setupCustomerManagementListeners();
            return;
        }

        if (this.currentView === 'product-management') {
            contentArea.innerHTML = this.renderProductManagement();
            this.setupProductManagementListeners();
            return;
        }

        // Default orders overview view
        const stats = this.calculateStats();
        const recentOrders = this.orders.slice(0, 5);

        contentArea.innerHTML = this.renderOrdersOverview(stats, recentOrders);
        this.setupOrdersListeners();
    },

    renderOrdersOverview(stats, recentOrders) {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Orders Management</h1>
                    <p class="module-subtitle">Manage customer orders and deliveries</p>
                </div>

                <!-- Orders Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalOrders}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalRevenue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                        <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${stats.pendingOrders}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Pending</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.avgOrderValue}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Order</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="create-order-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Create Order</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">New customer order</span>
                    </button>
                    <button class="quick-action-btn" id="manage-customers-btn">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                    <button class="quick-action-btn" id="manage-products-btn">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Products</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage products</span>
                    </button>
                    <button class="quick-action-btn" id="orders-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Orders Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Sales analytics</span>
                    </button>
                </div>

                <!-- Orders Report Modal -->
                <div id="orders-report-modal" class="modal hidden">
                    <div class="modal-content" style="max-width: 700px;">
                        <div class="modal-header">
                            <h3 id="orders-report-modal-title">Orders Report</h3>
                            <button class="btn-icon close-orders-report-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="orders-report-content" style="max-height: 500px; overflow-y: auto; padding: 10px;">
                                <!-- Orders report content will be inserted here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-outline close-orders-report-modal">Close</button>
                            <button type="button" class="btn-primary" id="print-orders-report">Print Report</button>
                        </div>
                    </div>
                </div>

                <!-- Create Order Form -->
                <div id="order-form-container" class="hidden">
                    <!-- ... (order form content remains the same) ... -->
                </div>

                <!-- Recent Orders & Quick Stats -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Recent Orders -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Recent Orders</h3>
                            <button class="btn-primary" id="show-order-form">Create Order</button>
                        </div>
                        <div id="recent-orders-list">
                            ${this.renderRecentOrders(recentOrders)}
                        </div>
                    </div>

                    <!-- Orders Summary -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Orders Summary</h3>
                        <div id="orders-summary">
                            ${this.renderOrdersSummary(stats)}
                        </div>
                    </div>
                </div>

                <!-- All Orders Table -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">All Orders</h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" id="status-filter" style="width: auto;">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <input type="text" class="form-input" id="search-orders" placeholder="Search orders..." style="width: 200px;">
                        </div>
                    </div>
                    <div id="all-orders-table">
                        ${this.renderAllOrdersTable()}
                    </div>
                </div>
            </div>
        `;
    },

    // ... (previous customer management, product management, and other rendering methods remain the same) ...

    setupOrdersListeners() {
        // Form buttons
        document.getElementById('show-order-form')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('create-order-btn')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('manage-customers-btn')?.addEventListener('click', () => this.manageCustomers());
        document.getElementById('manage-products-btn')?.addEventListener('click', () => this.manageProducts());
        document.getElementById('orders-report-btn')?.addEventListener('click', () => this.generateOrdersReport());
        
        // Form handlers
        document.getElementById('order-form')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('cancel-order-form')?.addEventListener('click', () => this.hideOrderForm());
        document.getElementById('add-order-item')?.addEventListener('click', () => this.addOrderItem());
        
        // Report modal handlers
        document.querySelectorAll('.close-orders-report-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideOrdersReportModal());
        });
        document.getElementById('print-orders-report')?.addEventListener('click', () => this.printOrdersReport());
        
        // Filter and search
        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('search-orders')?.addEventListener('input', (e) => this.searchOrders(e.target.value));
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-order')) {
                const id = parseInt(e.target.closest('.delete-order').dataset.id);
                this.deleteOrder(id);
            }
            if (e.target.closest('.view-order')) {
                const id = parseInt(e.target.closest('.view-order').dataset.id);
                this.viewOrder(id);
            }
            if (e.target.closest('.edit-order')) {
                const id = parseInt(e.target.closest('.edit-order').dataset.id);
                this.editOrder(id);
            }
            if (e.target.closest('.remove-order-item')) {
                e.target.closest('.order-item-row').remove();
                this.calculateOrderTotal();
            }
        });

        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        const deliveryDate = document.getElementById('delivery-date');
        if (orderDate) orderDate.value = today;

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    // ... (previous order handling methods remain the same) ...

    generateOrdersReport() {
        const stats = this.calculateStats();
        const recentMonth = new Date();
        recentMonth.setMonth(recentMonth.getMonth() - 1);
        
        const monthlyOrders = this.orders.filter(order => new Date(order.date) >= recentMonth);
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 ORDERS REPORT</h4>';
        
        // Overview Section
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 OVERVIEW:</h5>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Orders</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.totalOrders}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(stats.totalRevenue)}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Avg Order Value</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.avgOrderValue}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Pending Orders</div>
                    <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">${stats.pendingOrders}</div>
                </div>
            </div>
        </div>`;
        
        // Last 30 Days
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📅 LAST 30 DAYS:</h5>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Orders</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${monthlyOrders.length}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Revenue</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(monthlyRevenue)}</div>
                </div>
            </div>
        </div>`;
        
        // Status Breakdown
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📋 STATUS BREAKDOWN:</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">`;
        
        const statusColors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'completed': '#22c55e',
            'cancelled': '#ef4444'
        };
        
        Object.entries(stats.statusCounts).forEach(([status, count]) => {
            const color = statusColors[status] || '#6b7280';
            const percentage = stats.totalOrders > 0 ? ((count / stats.totalOrders) * 100).toFixed(1) : 0;
            
            report += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                    <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${status}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-primary);">${count}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${percentage}%</div>
                </div>
            </div>`;
        });
        report += '</div></div>';
        
        // Top Customers
        report += `<div style="margin-bottom: 20px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">🏆 TOP CUSTOMERS:</h5>`;
        
        const customerOrders = {};
        this.orders.forEach(order => {
            if (!customerOrders[order.customerId]) {
                customerOrders[order.customerId] = { count: 0, revenue: 0 };
            }
            customerOrders[order.customerId].count++;
            customerOrders[order.customerId].revenue += order.totalAmount;
        });
        
        const topCustomers = Object.entries(customerOrders)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 3);
        
        if (topCustomers.length > 0) {
            report += '<div style="display: flex; flex-direction: column; gap: 8px;">';
            topCustomers.forEach(([customerId, data], index) => {
                const customer = this.customers.find(c => c.id === parseInt(customerId));
                const rankIcons = ['🥇', '🥈', '🥉'];
                report += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-size: 16px;">${rankIcons[index] || '👤'}</div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${customer?.name || 'Unknown'}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${data.count} orders</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(data.revenue)}</div>
                    </div>
                </div>`;
            });
            report += '</div>';
        } else {
            report += `<div style="text-align: center; padding: 20px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                <div style="color: var(--text-secondary);">No customer data available</div>
            </div>`;
        }
        report += '</div>';
        
        report += '</div>';

        this.showOrdersReportModal('Orders Report', report);
    },

    showOrdersReportModal(title, content) {
        const modal = document.getElementById('orders-report-modal');
        const modalTitle = document.getElementById('orders-report-modal-title');
        const modalContent = document.getElementById('orders-report-content');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
        }
    },

    hideOrdersReportModal() {
        const modal = document.getElementById('orders-report-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    printOrdersReport() {
        const reportContent = document.getElementById('orders-report-content');
        if (reportContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Orders Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                            .report-content { max-width: 800px; margin: 0 auto; }
                            h4 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                            h5 { color: #2c3e50; margin: 20px 0 10px 0; }
                            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
                            .stat-item { padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; }
                            .customer-item { display: flex; justify-content: space-between; padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 4px; }
                            @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${reportContent.innerHTML}
                        <div class="no-print" style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                            Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },

    // ... (previous syncStatsWithProfile, formatCurrency, saveData methods remain the same) ...
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
}
