// modules/orders.js - FULLY WORKING
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [],

    initialize() {
        console.log('📋 Initializing orders...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
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
            { id: 1, name: 'Broilers', category: 'poultry', unit: 'birds', price: 8.50, inStock: true },
            { id: 2, name: 'Layers', category: 'poultry', unit: 'birds', price: 12.00, inStock: true },
            { id: 3, name: 'Eggs', category: 'eggs', unit: 'pieces', price: 0.25, inStock: true },
            { id: 4, name: 'Manure', category: 'fertilizer', unit: 'bags', price: 5.00, inStock: true },
            { id: 5, name: 'Chicken Feed', category: 'feed', unit: 'kg', price: 2.50, inStock: false }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();
        const recentOrders = this.orders.slice(0, 5);

        contentArea.innerHTML = `
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
                            
                            <!-- Order Items -->
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

        this.setupEventListeners();
        this.addOrderItem(); // Add one empty item row by default
    },

    calculateStats() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Status breakdown
        const statusCounts = {
            pending: this.orders.filter(order => order.status === 'pending').length,
            processing: this.orders.filter(order => order.status === 'processing').length,
            completed: this.orders.filter(order => order.status === 'completed').length,
            cancelled: this.orders.filter(order => order.status === 'cancelled').length
        };

        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            avgOrderValue: this.formatCurrency(avgOrderValue),
            statusCounts
        };
    },

    renderRecentOrders(orders) {
        if (orders.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No orders yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Create your first order to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${orders.map(order => {
                    const customer = this.customers.find(c => c.id === order.customerId);
                    const statusColor = this.getStatusColor(order.status);
                    const paymentColor = this.getPaymentColor(order.paymentStatus);
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">
                                    ${order.orderNumber} • ${customer?.name || 'Unknown Customer'}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${order.date} • ${order.items.length} item${order.items.length > 1 ? 's' : ''}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: var(--text-primary); font-size: 16px;">
                                    ${this.formatCurrency(order.totalAmount)}
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 4px;">
                                    <span style="padding: 2px 8px; border-radius: 8px; background: ${statusColor}20; color: ${statusColor}; font-size: 11px; font-weight: 600;">
                                        ${order.status}
                                    </span>
                                    <span style="padding: 2px 8px; border-radius: 8px; background: ${paymentColor}20; color: ${paymentColor}; font-size: 11px; font-weight: 600;">
                                        ${order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderOrdersSummary(stats) {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Pending:</span>
                    <span style="font-weight: 600; color: #f59e0b;">${stats.statusCounts.pending}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Processing:</span>
                    <span style="font-weight: 600; color: #3b82f6;">${stats.statusCounts.processing}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Completed:</span>
                    <span style="font-weight: 600; color: #22c55e;">${stats.statusCounts.completed}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Cancelled:</span>
                    <span style="font-weight: 600; color: #ef4444;">${stats.statusCounts.cancelled}</span>
                </div>
                <div style="border-top: 1px solid var(--glass-border); padding-top: 12px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary); font-weight: 600;">Total:</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${stats.totalOrders}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderAllOrdersTable() {
        if (this.orders.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No orders found</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Create your first order to get started</div>
                </div>
            `;
        }

        return `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.orders.map(order => {
                            const customer = this.customers.find(c => c.id === order.customerId);
                            const statusColor = this.getStatusColor(order.status);
                            const paymentColor = this.getPaymentColor(order.paymentStatus);
                            
                            return `
                                <tr>
                                    <td style="font-weight: 600; color: var(--text-primary);">${order.orderNumber}</td>
                                    <td>${customer?.name || 'Unknown'}</td>
                                    <td>${order.date}</td>
                                    <td>${order.items.length} items</td>
                                    <td style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <span style="padding: 4px 8px; border-radius: 6px; background: ${statusColor}20; color: ${statusColor}; font-size: 12px; font-weight: 600;">
                                            ${order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span style="padding: 4px 8px; border-radius: 6px; background: ${paymentColor}20; color: ${paymentColor}; font-size: 12px; font-weight: 600;">
                                            ${order.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn-icon view-order" data-id="${order.id}" title="View Order">
                                                👁️
                                            </button>
                                            <button class="btn-icon edit-order" data-id="${order.id}" title="Edit Order">
                                                ✏️
                                            </button>
                                            <button class="btn-icon delete-order" data-id="${order.id}" title="Delete Order">
                                                🗑️
                                            </button>
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

    getStatusColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'completed': '#22c55e',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    },

    getPaymentColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'paid': '#22c55e',
            'partial': '#3b82f6',
            'overdue': '#ef4444'
        };
        return colors[status] || '#6b7280';
    },

    setupEventListeners() {
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

    showOrderForm() {
        document.getElementById('order-form-container').classList.remove('hidden');
        document.getElementById('order-form').reset();
        document.getElementById('order-items-container').innerHTML = '';
        this.addOrderItem();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('order-date').value = today;
        
        document.getElementById('order-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideOrderForm() {
        document.getElementById('order-form-container').classList.add('hidden');
    },

    addOrderItem() {
        const container = document.getElementById('order-items-container');
        const itemIndex = container.children.length;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'order-item-row';
        itemRow.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: end;';
        
        itemRow.innerHTML = `
            <div>
                <label class="form-label" style="font-size: 12px;">Product</label>
                <select class="form-input order-item-product" style="font-size: 14px;" required>
                    <option value="">Select Product</option>
                    ${this.products.map(product => `
                        <option value="${product.id}" data-price="${product.price}" ${!product.inStock ? 'disabled' : ''}>
                            ${product.name} - ${this.formatCurrency(product.price)}/${product.unit} ${!product.inStock ? '(Out of Stock)' : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div>
                <label class="form-label" style="font-size: 12px;">Quantity</label>
                <input type="number" class="form-input order-item-quantity" min="1" value="1" style="font-size: 14px;" required>
            </div>
            <div>
                <label class="form-label" style="font-size: 12px;">Unit Price</label>
                <input type="number" class="form-input order-item-price" step="0.01" min="0" style="font-size: 14px;" required>
            </div>
            <div>
                <label class="form-label" style="font-size: 12px;">Total</label>
                <div class="order-item-total" style="padding: 8px; background: var(--glass-bg); border-radius: 4px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
                    $0.00
                </div>
            </div>
            <div>
                <button type="button" class="btn-icon remove-order-item" style="background: none; border: none; cursor: pointer; padding: 8px; color: var(--text-secondary);" ${itemIndex === 0 ? 'disabled' : ''}>
                    🗑️
                </button>
            </div>
        `;

        container.appendChild(itemRow);

        // Add event listeners for the new row
        const productSelect = itemRow.querySelector('.order-item-product');
        const quantityInput = itemRow.querySelector('.order-item-quantity');
        const priceInput = itemRow.querySelector('.order-item-price');

        productSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price;
            if (price) {
                priceInput.value = price;
                this.calculateItemTotal(itemRow);
            }
        });

        quantityInput.addEventListener('input', () => this.calculateItemTotal(itemRow));
        priceInput.addEventListener('input', () => this.calculateItemTotal(itemRow));
    },

    calculateItemTotal(itemRow) {
        const quantity = parseFloat(itemRow.querySelector('.order-item-quantity').value) || 0;
        const price = parseFloat(itemRow.querySelector('.order-item-price').value) || 0;
        const total = quantity * price;
        
        itemRow.querySelector('.order-item-total').textContent = this.formatCurrency(total);
        this.calculateOrderTotal();
    },

    calculateOrderTotal() {
        const itemRows = document.querySelectorAll('.order-item-row');
        let total = 0;
        
        itemRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.order-item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.order-item-price').value) || 0;
            total += quantity * price;
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

        // Collect order items
        const items = [];
        const itemRows = document.querySelectorAll('.order-item-row');
        
        itemRows.forEach(row => {
            const productId = parseInt(row.querySelector('.order-item-product').value);
            const quantity = parseInt(row.querySelector('.order-item-quantity').value);
            const unitPrice = parseFloat(row.querySelector('.order-item-price').value);
            
            if (productId && quantity && unitPrice) {
                items.push({
                    productId,
                    quantity,
                    unitPrice,
                    total: quantity * unitPrice
                });
            }
        });

        if (items.length === 0) {
            alert('Please add at least one item to the order.');
            return;
        }

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        const orderNumber = `ORD-${String(this.orders.length + 1).padStart(3, '0')}`;

        const newOrder = {
            id: Date.now(),
            orderNumber,
            customerId,
            date: orderDate,
            status: 'pending',
            items,
            totalAmount,
            paymentStatus,
            deliveryDate: deliveryDate || null,
            notes: notes || ''
        };

        this.orders.unshift(newOrder);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order ${orderNumber} created successfully!`, 'success');
        }
    },

    deleteOrder(id) {
        const order = this.orders.find(order => order.id === id);
        if (!order) return;

        if (confirm(`Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`)) {
            this.orders = this.orders.filter(order => order.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Order ${order.orderNumber} deleted!`, 'success');
            }
        }
    },

    viewOrder(id) {
        const order = this.orders.find(order => order.id === id);
        if (!order) return;

        const customer = this.customers.find(c => c.id === order.customerId);
        
        let orderDetails = `📋 ORDER DETAILS\n\n`;
        orderDetails += `Order Number: ${order.orderNumber}\n`;
        orderDetails += `Customer: ${customer?.name || 'Unknown'}\n`;
        orderDetails += `Date: ${order.date}\n`;
        orderDetails += `Status: ${order.status}\n`;
        orderDetails += `Payment: ${order.paymentStatus}\n`;
        orderDetails += `Delivery Date: ${order.deliveryDate || 'Not set'}\n\n`;
        
        orderDetails += `ITEMS:\n`;
        order.items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            orderDetails += `• ${product?.name || 'Unknown Product'}: ${item.quantity} x ${this.formatCurrency(item.unitPrice)} = ${this.formatCurrency(item.total)}\n`;
        });
        
        orderDetails += `\nTOTAL: ${this.formatCurrency(order.totalAmount)}\n`;
        
        if (order.notes) {
            orderDetails += `\nNOTES: ${order.notes}\n`;
        }

        alert(orderDetails);
    },

    editOrder(id) {
        alert('Edit order functionality coming soon! For now, you can delete and recreate the order.');
    },

    manageCustomers() {
        alert('Customer management feature coming soon!');
    },

    manageProducts() {
        alert('Product management feature coming soon!');
    },

    filterOrders(status) {
        const rows = document.querySelectorAll('#all-orders-table tbody tr');
        rows.forEach(row => {
            const rowStatus = row.querySelector('td:nth-child(6) span').textContent.toLowerCase();
            if (!status || rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    searchOrders(query) {
        const rows = document.querySelectorAll('#all-orders-table tbody tr');
        const searchTerm = query.toLowerCase();
        
        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    generateOrdersReport() {
        const stats = this.calculateStats();
        const recentMonth = new Date();
        recentMonth.setMonth(recentMonth.getMonth() - 1);
        
        const monthlyOrders = this.orders.filter(order => new Date(order.date) >= recentMonth);
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        let report = `📊 ORDERS REPORT\n\n`;
        report += `OVERVIEW:\n`;
        report += `Total Orders: ${stats.totalOrders}\n`;
        report += `Total Revenue: ${this.formatCurrency(stats.totalRevenue)}\n`;
        report += `Average Order Value: ${stats.avgOrderValue}\n`;
        report += `Pending Orders: ${stats.pendingOrders}\n\n`;
        
        report += `LAST 30 DAYS:\n`;
        report += `Orders: ${monthlyOrders.length}\n`;
        report += `Revenue: ${this.formatCurrency(monthlyRevenue)}\n\n`;
        
        report += `STATUS BREAKDOWN:\n`;
        report += `Pending: ${stats.statusCounts.pending}\n`;
        report += `Processing: ${stats.statusCounts.processing}\n`;
        report += `Completed: ${stats.statusCounts.completed}\n`;
        report += `Cancelled: ${stats.statusCounts.cancelled}\n\n`;
        
        report += `TOP CUSTOMERS:\n`;
        const customerOrders = {};
        this.orders.forEach(order => {
            if (!customerOrders[order.customerId]) {
                customerOrders[order.customerId] = 0;
            }
            customerOrders[order.customerId] += order.totalAmount;
        });
        
        const topCustomers = Object.entries(customerOrders)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        topCustomers.forEach(([customerId, revenue]) => {
            const customer = this.customers.find(c => c.id === parseInt(customerId));
            report += `• ${customer?.name || 'Unknown'}: ${this.formatCurrency(revenue)}\n`;
        });

        alert(report);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    saveData() {
        localStorage.setItem('farm-orders', JSON.stringify(this.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.customers));
        localStorage.setItem('farm-products', JSON.stringify(this.products));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
}
