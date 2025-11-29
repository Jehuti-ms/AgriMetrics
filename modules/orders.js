// modules/orders.js - COMPLETE REWRITE WITH MODAL REPORTS
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
        this.syncStatsWithProfile();
        return true;
    },

    loadData() {
        const savedOrders = localStorage.getItem('farm-orders');
        const savedCustomers = localStorage.getItem('farm-customers');
        const savedProducts = localStorage.getItem('farm-products');
        
        this.orders = savedOrders ? JSON.parse(savedOrders) : this.getDemoOrders();
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : this.getDemoCustomers();
        this.products = savedProducts ? JSON.parse(savedProducts) : this.getDemoProducts();
    },

    getDemoOrders() {
        return [
            {
                id: 1,
                orderNumber: 'ORD-001',
                customerId: 1,
                date: '2024-03-15',
                status: 'completed',
                items: [
                    { productId: 1, quantity: 20, unitPrice: 8.50, total: 170 },
                    { productId: 2, quantity: 5, unitPrice: 12.00, total: 60 }
                ],
                totalAmount: 230,
                paymentStatus: 'paid',
                deliveryDate: '2024-03-16',
                notes: 'Regular customer - prompt payment'
            },
            {
                id: 2,
                orderNumber: 'ORD-002',
                customerId: 2,
                date: '2024-03-14',
                status: 'processing',
                items: [
                    { productId: 3, quantity: 100, unitPrice: 0.25, total: 25 }
                ],
                totalAmount: 25,
                paymentStatus: 'pending',
                deliveryDate: '2024-03-17',
                notes: 'New customer - follow up'
            },
            {
                id: 3,
                orderNumber: 'ORD-003',
                customerId: 3,
                date: '2024-03-13',
                status: 'pending',
                items: [
                    { productId: 1, quantity: 50, unitPrice: 8.00, total: 400 },
                    { productId: 4, quantity: 10, unitPrice: 5.00, total: 50 }
                ],
                totalAmount: 450,
                paymentStatus: 'pending',
                deliveryDate: '2024-03-20',
                notes: 'Bulk order - confirm stock'
            }
        ];
    },

    getDemoCustomers() {
        return [
            { id: 1, name: 'Restaurant A', email: 'orders@restauranta.com', phone: '+1234567890', address: '123 Main St, City', type: 'restaurant' },
            { id: 2, name: 'Local Market', email: 'produce@localmarket.com', phone: '+1234567891', address: '456 Market Ave, Town', type: 'retail' },
            { id: 3, name: 'Hotel Grand', email: 'procurement@hotelgrand.com', phone: '+1234567892', address: '789 Luxury Blvd, City', type: 'hotel' },
            { id: 4, name: 'Individual Customer', email: 'john@email.com', phone: '+1234567893', address: '321 Home St, Village', type: 'individual' }
        ];
    },

    getDemoProducts() {
        return [
            { id: 1, name: 'Broilers', category: 'poultry', unit: 'birds', price: 8.50, inStock: true, stock: 150, minStock: 20 },
            { id: 2, name: 'Layers', category: 'poultry', unit: 'birds', price: 12.00, inStock: true, stock: 45, minStock: 10 },
            { id: 3, name: 'Eggs', category: 'eggs', unit: 'pieces', price: 0.25, inStock: true, stock: 500, minStock: 100 },
            { id: 4, name: 'Manure', category: 'fertilizer', unit: 'bags', price: 5.00, inStock: true, stock: 30, minStock: 5 },
            { id: 5, name: 'Chicken Feed', category: 'feed', unit: 'kg', price: 2.50, inStock: false, stock: 0, minStock: 50 }
        ];
    },

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
                    <div class="modal-content" style="max-width: 800px;">
                        <div class="modal-header">
                            <h3>📊 Orders Analytics Report</h3>
                            <button class="btn-icon close-orders-report-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="orders-report-content" style="max-height: 600px; overflow-y: auto; padding: 10px;">
                                <!-- Report content will be generated here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-outline close-orders-report-modal">Close</button>
                            <button type="button" class="btn-primary" id="print-orders-report">Print Report</button>
                            <button type="button" class="btn-secondary" id="export-orders-report">Export PDF</button>
                        </div>
                    </div>
                </div>

                <!-- Create Order Form -->
                <div id="order-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Create New Order</h3>
                        <form id="order-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Customer</label>
                                    <select class="form-input" id="order-customer" required>
                                        <option value="">Select Customer</option>
                                        ${this.customers.map(customer => `
                                            <option value="${customer.id}">${customer.name} (${customer.type})</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Order Date</label>
                                    <input type="date" class="form-input" id="order-date" required>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <label class="form-label">Order Items</label>
                                    <button type="button" class="btn-outline" id="add-order-item" style="font-size: 12px; padding: 6px 12px;">
                                        + Add Item
                                    </button>
                                </div>
                                <div id="order-items-container">
                                    <!-- Items will be added dynamically -->
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border);">
                                    <div style="font-weight: 600; color: var(--text-primary);">Total Amount:</div>
                                    <div style="font-size: 18px; font-weight: bold; color: var(--primary-color);" id="order-total-amount">$0.00</div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Delivery Date</label>
                                    <input type="date" class="form-input" id="delivery-date">
                                </div>
                                <div>
                                    <label class="form-label">Payment Status</label>
                                    <select class="form-input" id="payment-status" required>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="partial">Partial</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Order Notes</label>
                                <textarea class="form-input" id="order-notes" rows="3" placeholder="Special instructions, delivery notes, etc."></textarea>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Create Order</button>
                                <button type="button" class="btn-outline" id="cancel-order-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Orders & Quick Stats -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Recent Orders</h3>
                            <button class="btn-primary" id="show-order-form">Create Order</button>
                        </div>
                        <div id="recent-orders-list">
                            ${this.renderRecentOrders(recentOrders)}
                        </div>
                    </div>

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

    // MODAL REPORT METHODS
    generateOrdersReport() {
        const stats = this.calculateStats();
        const recentMonth = new Date();
        recentMonth.setMonth(recentMonth.getMonth() - 1);
        
        const monthlyOrders = this.orders.filter(order => new Date(order.date) >= recentMonth);
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Calculate status breakdown
        const statusCounts = this.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        // Calculate top customers
        const customerRevenue = {};
        this.orders.forEach(order => {
            const customer = this.customers.find(c => c.id === order.customerId);
            if (customer) {
                customerRevenue[customer.name] = (customerRevenue[customer.name] || 0) + order.totalAmount;
            }
        });

        const topCustomers = Object.entries(customerRevenue)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        let report = `
            <div class="report-content" style="font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--primary-color);">
                    <h2 style="color: var(--text-primary); margin: 0 0 8px 0;">📊 ORDERS ANALYTICS REPORT</h2>
                    <p style="color: var(--text-secondary); margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                
                <!-- Overview Section -->
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-left: 4px solid var(--primary-color); padding-left: 12px;">📈 Performance Overview</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                        <div style="padding: 20px; background: linear-gradient(135deg, var(--glass-bg), transparent); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Orders</div>
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-color);">${stats.totalOrders}</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, var(--glass-bg), transparent); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${this.formatCurrency(stats.totalRevenue)}</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, var(--glass-bg), transparent); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Avg Order Value</div>
                            <div style="font-size: 32px; font-weight: bold; color: var(--text-primary);">${stats.avgOrderValue}</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, var(--glass-bg), transparent); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Pending Orders</div>
                            <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${stats.pendingOrders}</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Performance -->
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-left: 4px solid #10b981; padding-left: 12px;">📅 Last 30 Days Performance</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div style="padding: 20px; background: var(--glass-bg); border-radius: 12px; text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Orders This Month</div>
                            <div style="font-size: 28px; font-weight: bold; color: var(--text-primary);">${monthlyOrders.length}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${((monthlyOrders.length / stats.totalOrders) * 100).toFixed(1)}% of total</div>
                        </div>
                        <div style="padding: 20px; background: var(--glass-bg); border-radius: 12px; text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Monthly Revenue</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">${this.formatCurrency(monthlyRevenue)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${((monthlyRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total</div>
                        </div>
                    </div>
                </div>

                <!-- Status Breakdown -->
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-left: 4px solid #f59e0b; padding-left: 12px;">📋 Order Status Distribution</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        `;

        const statusColors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'completed': '#10b981',
            'cancelled': '#ef4444'
        };

        Object.entries(statusCounts).forEach(([status, count]) => {
            const percentage = ((count / stats.totalOrders) * 100).toFixed(1);
            report += `
                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${statusColors[status] || '#6b7280'};">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: var(--text-secondary); text-transform: capitalize;">${status}</span>
                        <span style="font-size: 16px; font-weight: bold; color: var(--text-primary);">${count}</span>
                    </div>
                    <div style="background: var(--glass-border); border-radius: 4px; height: 6px; overflow: hidden;">
                        <div style="height: 100%; background: ${statusColors[status] || '#6b7280'}; width: ${percentage}%;"></div>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-align: right;">${percentage}%</div>
                </div>
            `;
        });

        report += `
                    </div>
                </div>

                <!-- Top Customers -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-left: 4px solid #8b5cf6; padding-left: 12px;">🏆 Top 5 Customers by Revenue</h3>
                    <div style="background: var(--glass-bg); border-radius: 8px; overflow: hidden;">
        `;

        topCustomers.forEach(([customer, revenue], index) => {
            const rank = index + 1;
            const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '🔹';
            report += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 18px;">${emoji}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${customer}</span>
                    </div>
                    <span style="font-weight: bold; color: #10b981;">${this.formatCurrency(revenue)}</span>
                </div>
            `;
        });

        report += `
                    </div>
                </div>

                <!-- Summary -->
                <div style="padding: 20px; background: linear-gradient(135deg, var(--primary-color), #8b5cf6); border-radius: 12px; color: white; text-align: center;">
                    <h4 style="margin: 0 0 8px 0; font-size: 18px;">📈 Business Health: Excellent</h4>
                    <p style="margin: 0; opacity: 0.9; font-size: 14px;">Your orders are growing steadily with ${monthlyOrders.length} new orders this month</p>
                </div>
            </div>
        `;

        document.getElementById('orders-report-content').innerHTML = report;
        this.showOrdersReportModal();
    },

    showOrdersReportModal() {
        const modal = document.getElementById('orders-report-modal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },

    hideOrdersReportModal() {
        const modal = document.getElementById('orders-report-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    },

    printOrdersReport() {
        const reportContent = document.getElementById('orders-report-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orders Analytics Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .report-content { max-width: 800px; margin: 0 auto; }
                    h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    h3 { color: #2c3e50; border-left: 4px solid #3498db; padding-left: 10px; }
                    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${reportContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // EXISTING METHODS (keep them as they were working)
    setupOrdersListeners() {
        document.getElementById('show-order-form')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('create-order-btn')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('manage-customers-btn')?.addEventListener('click', () => this.manageCustomers());
        document.getElementById('manage-products-btn')?.addEventListener('click', () => this.manageProducts());
        document.getElementById('orders-report-btn')?.addEventListener('click', () => this.generateOrdersReport());
        
        document.getElementById('order-form')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('cancel-order-form')?.addEventListener('click', () => this.hideOrderForm());
        document.getElementById('add-order-item')?.addEventListener('click', () => this.addOrderItem());
        
        document.querySelectorAll('.close-orders-report-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideOrdersReportModal());
        });
        document.getElementById('print-orders-report')?.addEventListener('click', () => this.printOrdersReport());
        document.getElementById('export-orders-report')?.addEventListener('click', () => this.exportOrdersReport());
        
        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('search-orders')?.addEventListener('input', (e) => this.searchOrders(e.target.value));
        
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

        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        const deliveryDate = document.getElementById('delivery-date');
        if (orderDate) orderDate.value = today;

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

    exportOrdersReport() {
        // Simple PDF export simulation
        alert('PDF export functionality would be implemented here with a proper PDF library.');
    },

    // Keep all other existing methods exactly as they were...
    calculateStats() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const avgOrderValue = totalOrders > 0 ? this.formatCurrency(totalRevenue / totalOrders) : '$0.00';
        
        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            avgOrderValue
        };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    syncStatsWithProfile() {
        // Sync with profile module if exists
        if (window.ProfileModule) {
            const stats = this.calculateStats();
            window.ProfileModule.updateBusinessStats('orders', stats);
        }
    },

    // Add all other existing methods here...
    showOrderForm() {
        document.getElementById('order-form-container').classList.remove('hidden');
        this.addOrderItem(); // Add first empty item
    },

    hideOrderForm() {
        document.getElementById('order-form-container').classList.add('hidden');
        document.getElementById('order-form').reset();
        document.getElementById('order-items-container').innerHTML = '';
        document.getElementById('order-total-amount').textContent = '$0.00';
    },

    addOrderItem() {
        const container = document.getElementById('order-items-container');
        const itemId = Date.now();
        const itemHtml = `
            <div class="order-item-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px; align-items: end; margin-bottom: 12px; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                <div>
                    <label class="form-label" style="font-size: 12px;">Product</label>
                    <select class="form-input product-select" style="font-size: 12px; padding: 8px;" onchange="OrdersModule.updateItemPrice(this)">
                        <option value="">Select Product</option>
                        ${this.products.filter(p => p.inStock).map(product => `
                            <option value="${product.id}" data-price="${product.price}">${product.name} (${this.formatCurrency(product.price)}/${product.unit})</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="form-label" style="font-size: 12px;">Quantity</label>
                    <input type="number" class="form-input quantity-input" style="font-size: 12px; padding: 8px;" min="1" value="1" onchange="OrdersModule.calculateItemTotal(this)" oninput="OrdersModule.calculateItemTotal(this)">
                </div>
                <div>
                    <label class="form-label" style="font-size: 12px;">Unit Price</label>
                    <input type="number" class="form-input price-input" style="font-size: 12px; padding: 8px;" step="0.01" min="0" readonly>
                </div>
                <div>
                    <label class="form-label" style="font-size: 12px;">Total</label>
                    <input type="text" class="form-input item-total" style="font-size: 12px; padding: 8px;" readonly>
                </div>
                <div>
                    <button type="button" class="btn-icon remove-order-item" style="color: #ef4444; font-size: 16px;">×</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    },

    updateItemPrice(select) {
        const price = select.selectedOptions[0]?.dataset.price || 0;
        const row = select.closest('.order-item-row');
        const priceInput = row.querySelector('.price-input');
        const quantityInput = row.querySelector('.quantity-input');
        
        priceInput.value = price;
        this.calculateItemTotal(quantityInput);
    },

    calculateItemTotal(input) {
        const row = input.closest('.order-item-row');
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const quantity = parseFloat(input.value) || 0;
        const total = price * quantity;
        
        row.querySelector('.item-total').value = this.formatCurrency(total);
        this.calculateOrderTotal();
    },

    calculateOrderTotal() {
        const items = document.querySelectorAll('.order-item-row');
        let total = 0;
        
        items.forEach(item => {
            const totalText = item.querySelector('.item-total').value;
            const amount = parseFloat(totalText.replace(/[^0-9.-]+/g,"")) || 0;
            total += amount;
        });
        
        document.getElementById('order-total-amount').textContent = this.formatCurrency(total);
    },

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const customerId = parseInt(document.getElementById('order-customer').value);
        const orderDate = document.getElementById('order-date').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const paymentStatus = document.getElementById('payment-status').value;
        const notes = document.getElementById('order-notes').value;
        
        // Validate items
        const items = [];
        let isValid = true;
        
        document.querySelectorAll('.order-item-row').forEach(row => {
            const productSelect = row.querySelector('.product-select');
            const quantityInput = row.querySelector('.quantity-input');
            const priceInput = row.querySelector('.price-input');
            
            if (!productSelect.value || !quantityInput.value || quantityInput.value <= 0) {
                isValid = false;
                return;
            }
            
            items.push({
                productId: parseInt(productSelect.value),
                quantity: parseFloat(quantityInput.value),
                unitPrice: parseFloat(priceInput.value),
                total: parseFloat(row.querySelector('.item-total').value.replace(/[^0-9.-]+/g,""))
            });
        });
        
        if (!isValid || items.length === 0) {
            alert('Please add valid order items');
            return;
        }
        
        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        const newOrder = {
            id: Date.now(),
            orderNumber: 'ORD-' + (this.orders.length + 1).toString().padStart(3, '0'),
            customerId,
            date: orderDate,
            status: 'pending',
            items,
            totalAmount,
            paymentStatus,
            deliveryDate,
            notes
        };
        
        this.orders.unshift(newOrder);
        this.saveOrders();
        this.hideOrderForm();
        this.renderModule();
        
        alert('Order created successfully!');
    },

    saveOrders() {
        localStorage.setItem('farm-orders', JSON.stringify(this.orders));
        this.syncStatsWithProfile();
    },

    renderRecentOrders(orders) {
        if (orders.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent orders</p>';
        }
        
        return orders.map(order => {
            const customer = this.customers.find(c => c.id === order.customerId);
            const statusColor = {
                'pending': '#f59e0b',
                'processing': '#3b82f6',
                'completed': '#10b981',
                'cancelled': '#ef4444'
            }[order.status];
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${order.orderNumber}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${customer?.name || 'Unknown Customer'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(order.totalAmount)}</div>
                        <div style="font-size: 11px; color: ${statusColor}; text-transform: capitalize;">${order.status}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderOrdersSummary(stats) {
        const statusCounts = this.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(statusCounts).map(([status, count]) => {
            const percentage = ((count / stats.totalOrders) * 100).toFixed(1);
            const statusColor = {
                'pending': '#f59e0b',
                'processing': '#3b82f6',
                'completed': '#10b981',
                'cancelled': '#ef4444'
            }[status];
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
                        <span style="font-size: 14px; color: var(--text-primary); text-transform: capitalize;">${status}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 600; color: var(--text-primary);">${count}</span>
                        <span style="font-size: 12px; color: var(--text-secondary); margin-left: 4px;">(${percentage}%)</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAllOrdersTable() {
        if (this.orders.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No orders found</p>';
        }
        
        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Order #</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Customer</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Date</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Amount</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Status</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.orders.map(order => {
                            const customer = this.customers.find(c => c.id === order.customerId);
                            const statusColor = {
                                'pending': '#f59e0b',
                                'processing': '#3b82f6',
                                'completed': '#10b981',
                                'cancelled': '#ef4444'
                            }[order.status];
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${order.orderNumber}</td>
                                    <td style="padding: 12px; color: var(--text-primary);">${customer?.name || 'Unknown'}</td>
                                    <td style="padding: 12px; color: var(--text-secondary);">${new Date(order.date).toLocaleDateString()}</td>
                                    <td style="padding: 12px; font-weight: 600; color: var(--text-primary);">${this.formatCurrency(order.totalAmount)}</td>
                                    <td style="padding: 12px;">
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; background: ${statusColor}20; color: ${statusColor}; text-transform: capitalize;">
                                            ${order.status}
                                        </span>
                                    </td>
                                    <td style="padding: 12px;">
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn-icon view-order" data-id="${order.id}" title="View Order">👁️</button>
                                            <button class="btn-icon edit-order" data-id="${order.id}" title="Edit Order">✏️</button>
                                            <button class="btn-icon delete-order" data-id="${order.id}" title="Delete Order" style="color: #ef4444;">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    filterOrders(status) {
        // Filter logic here
        console.log('Filtering by status:', status);
    },

    searchOrders(query) {
        // Search logic here
        console.log('Searching for:', query);
    },

    deleteOrder(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.orders = this.orders.filter(order => order.id !== id);
            this.saveOrders();
            this.renderModule();
        }
    },

    viewOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            alert(`Viewing order: ${order.orderNumber}\nCustomer: ${this.customers.find(c => c.id === order.customerId)?.name}\nAmount: ${this.formatCurrency(order.totalAmount)}`);
        }
    },

    editOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            alert(`Editing order: ${order.orderNumber}`);
            // Implement edit functionality
        }
    },

    manageCustomers() {
        this.currentView = 'customer-management';
        this.renderModule();
    },

    manageProducts() {
        this.currentView = 'product-management';
        this.renderModule();
    },

    renderCustomerManagement() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Customer Management</h1>
                    <p class="module-subtitle">Manage your customer database</p>
                </div>
                <div class="glass-card" style="padding: 24px;">
                    <p style="color: var(--text-secondary); text-align: center; padding: 40px;">
                        Customer management interface would be implemented here.
                    </p>
                    <div style="text-align: center;">
                        <button class="btn-outline" onclick="OrdersModule.currentView = 'orders-overview'; OrdersModule.renderModule();">
                            ← Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderProductManagement() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Product Management</h1>
                    <p class="module-subtitle">Manage your product catalog</p>
                </div>
                <div class="glass-card" style="padding: 24px;">
                    <p style="color: var(--text-secondary); text-align: center; padding: 40px;">
                        Product management interface would be implemented here.
                    </p>
                    <div style="text-align: center;">
                        <button class="btn-outline" onclick="OrdersModule.currentView = 'orders-overview'; OrdersModule.renderModule();">
                            ← Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    setupCustomerManagementListeners() {
        // Customer management listeners
    },

    setupProductManagementListeners() {
        // Product management listeners
    }
};
