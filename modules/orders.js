// modules/orders.js
FarmModules.registerModule('orders', {
    name: 'Orders',
    icon: '📋',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Produce Orders</h1>
                <p>Manage customer orders and track order fulfillment</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-order">
                        ➕ New Order
                    </button>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="orders-summary">
                <div class="summary-card">
                    <div class="summary-icon">📥</div>
                    <div class="summary-content">
                        <h3>Pending Orders</h3>
                        <div class="summary-value" id="pending-orders">0</div>
                        <div class="summary-period">Awaiting fulfillment</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🚚</div>
                    <div class="summary-content">
                        <h3>In Progress</h3>
                        <div class="summary-value" id="progress-orders">0</div>
                        <div class="summary-period">Being processed</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">✅</div>
                    <div class="summary-content">
                        <h3>Completed</h3>
                        <div class="summary-value" id="completed-orders">0</div>
                        <div class="summary-period">This month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Revenue</h3>
                        <div class="summary-value" id="total-revenue">$0</div>
                        <div class="summary-period">This month</div>
                    </div>
                </div>
            </div>

            <!-- Quick Order Form -->
            <div class="quick-order card">
                <h3>Quick Order</h3>
                <form id="quick-order-form" class="form-inline">
                    <div class="form-row compact">
                        <div class="form-group">
                            <input type="text" id="quick-customer" placeholder="Customer name" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <select id="quick-product" required class="form-compact">
                                <option value="">Select Product</option>
                                <option value="broilers">Broilers</option>
                                <option value="eggs">Eggs</option>
                                <option value="vegetables">Vegetables</option>
                                <option value="fruits">Fruits</option>
                                <option value="dairy">Dairy</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-quantity" placeholder="Qty" required class="form-compact" min="1">
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-price" placeholder="Price" step="0.01" class="form-compact" min="0">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Create Order</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Orders List -->
            <div class="orders-list card">
                <div class="card-header">
                    <h3>Recent Orders</h3>
                    <div class="filter-controls">
                        <select id="status-filter">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button class="btn btn-text" id="export-orders">Export</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-body">
                            <tr>
                                <td colspan="8" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">📋</span>
                                        <h4>No orders yet</h4>
                                        <p>Start by creating your first order</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Order Modal -->
            <div id="order-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="order-modal-title">New Order</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="order-form">
                            <input type="hidden" id="order-id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="order-customer">Customer Name *</label>
                                    <input type="text" id="order-customer" required placeholder="Enter customer name">
                                </div>
                                <div class="form-group">
                                    <label for="order-phone">Phone Number</label>
                                    <input type="tel" id="order-phone" placeholder="Enter phone number">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="order-product">Product *</label>
                                    <select id="order-product" required>
                                        <option value="">Select Product</option>
                                        <optgroup label="Livestock">
                                            <option value="broilers">Broilers (Live)</option>
                                            <option value="broilers-dressed">Broilers (Dressed)</option>
                                            <option value="eggs">Eggs</option>
                                            <option value="pork">Pork</option>
                                            <option value="beef">Beef</option>
                                        </optgroup>
                                        <optgroup label="Produce">
                                            <option value="tomatoes">Tomatoes</option>
                                            <option value="peppers">Peppers</option>
                                            <option value="cucumbers">Cucumbers</option>
                                            <option value="lettuce">Lettuce</option>
                                            <option value="carrots">Carrots</option>
                                            <option value="potatoes">Potatoes</option>
                                        </optgroup>
                                        <optgroup label="Other">
                                            <option value="honey">Honey</option>
                                            <option value="milk">Milk</option>
                                            <option value="cheese">Cheese</option>
                                            <option value="other">Other</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="order-unit">Unit *</label>
                                    <select id="order-unit" required>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="units">Units</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="case">Case</option>
                                        <option value="crate">Crate</option>
                                        <option value="bag">Bag</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="order-quantity">Quantity *</label>
                                    <input type="number" id="order-quantity" min="1" required placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label for="order-price">Price per Unit ($) *</label>
                                    <input type="number" id="order-price" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="order-status">Status *</label>
                                    <select id="order-status" required>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="order-due-date">Due Date *</label>
                                    <input type="date" id="order-due-date" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="order-notes">Order Notes (Optional)</label>
                                <textarea id="order-notes" placeholder="Special instructions, delivery notes, etc." rows="3"></textarea>
                            </div>

                            <div class="order-total">
                                <h4>Order Total: <span id="order-total-amount">$0.00</span></h4>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-order" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-order">Save Order</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .orders-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
        }

        .summary-icon {
            font-size: 2rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }

        .summary-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .summary-period {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .quick-order {
            margin: 1.5rem 0;
        }

        .quick-order .form-row.compact {
            margin-bottom: 0;
        }

        .orders-list .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .filter-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .order-total {
            background: var(--bg-color);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        }

        .order-total h4 {
            margin: 0;
            color: var(--text-color);
        }

        #order-total-amount {
            color: var(--success-color);
            font-weight: 700;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
        }

        .status-pending {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .status-confirmed {
            background: var(--info-light);
            color: var(--info-dark);
        }

        .status-in-progress {
            background: var(--primary-light);
            color: var(--primary-color);
        }

        .status-completed {
            background: var(--success-light);
            color: var(--success-color);
        }

        .status-cancelled {
            background: var(--danger-light);
            color: var(--danger-color);
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
        }
    `,

    initialize: function() {
        console.log('Orders module initializing...');
        this.loadOrdersData();
        this.attachEventListeners();
        this.updateSummary();
        this.renderOrdersTable();
    },

    loadOrdersData: function() {
        if (!FarmModules.appData.orders) {
            FarmModules.appData.orders = [];
        }
    },

    updateSummary: function() {
        const orders = FarmModules.appData.orders || [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyOrders = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getMonth() === currentMonth && 
                   orderDate.getFullYear() === currentYear;
        });

        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const progressOrders = orders.filter(order => order.status === 'in-progress').length;
        const completedOrders = monthlyOrders.filter(order => order.status === 'completed').length;
        
        const totalRevenue = monthlyOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        this.updateElement('pending-orders', pendingOrders);
        this.updateElement('progress-orders', progressOrders);
        this.updateElement('completed-orders', completedOrders);
        this.updateElement('total-revenue', this.formatCurrency(totalRevenue));
    },

    renderOrdersTable: function(filterStatus = 'all') {
        const tbody = document.getElementById('orders-body');
        const orders = FarmModules.appData.orders || [];

        let filteredOrders = orders;
        if (filterStatus !== 'all') {
            filteredOrders = orders.filter(order => order.status === filterStatus);
        }

        if (filteredOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">📋</span>
                            <h4>No orders found</h4>
                            <p>${filterStatus === 'all' ? 'Start by creating your first order' : `No ${filterStatus} orders`}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show most recent orders first
        const sortedOrders = filteredOrders.slice().reverse();

        tbody.innerHTML = sortedOrders.map(order => {
            const statusClass = `status-badge status-${order.status.replace(' ', '-')}`;
            
            return `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.customerName}</td>
                    <td>${this.formatProductName(order.product)}</td>
                    <td>${order.quantity} ${order.unit}</td>
                    <td>${this.formatCurrency(order.totalAmount)}</td>
                    <td><span class="${statusClass}">${order.status}</span></td>
                    <td>${this.formatDate(order.dueDate)}</td>
                    <td class="order-actions">
                        <button class="btn-icon edit-order" data-id="${order.id}" title="Edit">✏️</button>
                        <button class="btn-icon view-order" data-id="${order.id}" title="View">👁️</button>
                        ${order.status !== 'completed' && order.status !== 'cancelled' ? 
                            `<button class="btn-icon complete-order" data-id="${order.id}" title="Complete">✅</button>` : ''
                        }
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners: function() {
        // Quick order form
        document.getElementById('quick-order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickOrder();
        });

        // Modal buttons
        document.getElementById('add-order').addEventListener('click', () => this.showOrderModal());
        document.getElementById('save-order').addEventListener('click', () => this.saveOrder());
        document.getElementById('delete-order').addEventListener('click', () => this.deleteOrder());

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Real-time total calculation
        document.getElementById('order-quantity').addEventListener('input', () => this.calculateTotal());
        document.getElementById('order-price').addEventListener('input', () => this.calculateTotal());

        // Filter
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.renderOrdersTable(e.target.value);
        });

        // Export
        document.getElementById('export-orders').addEventListener('click', () => {
            this.exportOrders();
        });

        // Order actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-order')) {
                const orderId = e.target.closest('.edit-order').dataset.id;
                this.editOrder(orderId);
            }
            if (e.target.closest('.view-order')) {
                const orderId = e.target.closest('.view-order').dataset.id;
                this.viewOrder(orderId);
            }
            if (e.target.closest('.complete-order')) {
                const orderId = e.target.closest('.complete-order').dataset.id;
                this.completeOrder(orderId);
            }
        });

        // Modal backdrop
        document.getElementById('order-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
    },

    handleQuickOrder: function() {
        const customer = document.getElementById('quick-customer').value;
        const product = document.getElementById('quick-product').value;
        const quantity = parseInt(document.getElementById('quick-quantity').value);
        const price = parseFloat(document.getElementById('quick-price').value) || 0;

        if (!customer || !product || !quantity) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const orderData = {
            customerName: customer,
            product: product,
            quantity: quantity,
            unit: 'units',
            pricePerUnit: price,
            totalAmount: quantity * price,
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            orderDate: new Date().toISOString().split('T')[0]
        };

        this.addOrder(orderData);
        
        // Reset form
        document.getElementById('quick-order-form').reset();
        this.showNotification('Order created successfully!', 'success');
    },

    showOrderModal: function() {
        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title');
        const form = document.getElementById('order-form');

        if (modal && title && form) {
            form.reset();
            document.getElementById('order-id').value = '';
            document.getElementById('order-due-date').value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            document.getElementById('delete-order').style.display = 'none';
            document.getElementById('order-total-amount').textContent = '$0.00';
            
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    calculateTotal: function() {
        const quantity = parseInt(document.getElementById('order-quantity').value) || 0;
        const price = parseFloat(document.getElementById('order-price').value) || 0;
        const total = quantity * price;
        
        document.getElementById('order-total-amount').textContent = this.formatCurrency(total);
    },

    saveOrder: function() {
        const form = document.getElementById('order-form');
        if (!form) return;

        const orderId = document.getElementById('order-id').value;
        const customerName = document.getElementById('order-customer').value;
        const phone = document.getElementById('order-phone').value;
        const product = document.getElementById('order-product').value;
        const unit = document.getElementById('order-unit').value;
        const quantity = parseInt(document.getElementById('order-quantity').value);
        const pricePerUnit = parseFloat(document.getElementById('order-price').value);
        const status = document.getElementById('order-status').value;
        const dueDate = document.getElementById('order-due-date').value;
        const notes = document.getElementById('order-notes').value;

        if (!customerName || !product || !quantity || !pricePerUnit || !dueDate) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        if (pricePerUnit < 0) {
            this.showNotification('Price cannot be negative', 'error');
            return;
        }

        const orderData = {
            customerName: customerName,
            phone: phone,
            product: product,
            unit: unit,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            totalAmount: quantity * pricePerUnit,
            status: status,
            dueDate: dueDate,
            notes: notes,
            orderDate: new Date().toISOString().split('T')[0]
        };

        if (orderId) {
            this.updateOrder(orderId, orderData);
        } else {
            this.addOrder(orderData);
        }

        this.hideModal();
    },

    addOrder: function(orderData) {
        if (!FarmModules.appData.orders) {
            FarmModules.appData.orders = [];
        }

        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            ...orderData
        };

        FarmModules.appData.orders.push(newOrder);
        
        this.updateSummary();
        this.renderOrdersTable();
        
        this.showNotification('Order created successfully!', 'success');
    },

    editOrder: function(orderId) {
        const orders = FarmModules.appData.orders || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return;

        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title');

        if (modal && title) {
            document.getElementById('order-id').value = order.id;
            document.getElementById('order-customer').value = order.customerName;
            document.getElementById('order-phone').value = order.phone || '';
            document.getElementById('order-product').value = order.product;
            document.getElementById('order-unit').value = order.unit;
            document.getElementById('order-quantity').value = order.quantity;
            document.getElementById('order-price').value = order.pricePerUnit;
            document.getElementById('order-status').value = order.status;
            document.getElementById('order-due-date').value = order.dueDate;
            document.getElementById('order-notes').value = order.notes || '';
            document.getElementById('delete-order').style.display = 'block';
            
            this.calculateTotal();
            
            title.textContent = 'Edit Order';
            modal.classList.remove('hidden');
        }
    },

    viewOrder: function(orderId) {
        const orders = FarmModules.appData.orders || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return;

        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title');

        if (modal && title) {
            document.getElementById('order-id').value = order.id;
            document.getElementById('order-customer').value = order.customerName;
            document.getElementById('order-phone').value = order.phone || '';
            document.getElementById('order-product').value = order.product;
            document.getElementById('order-unit').value = order.unit;
            document.getElementById('order-quantity').value = order.quantity;
            document.getElementById('order-price').value = order.pricePerUnit;
            document.getElementById('order-status').value = order.status;
            document.getElementById('order-due-date').value = order.dueDate;
            document.getElementById('order-notes').value = order.notes || '';
            document.getElementById('delete-order').style.display = 'block';
            
            // Make fields read-only for viewing
            const inputs = modal.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.disabled = true);
            document.getElementById('save-order').style.display = 'none';
            
            this.calculateTotal();
            
            title.textContent = 'View Order';
            modal.classList.remove('hidden');

            // Re-enable fields when modal closes
            modal.addEventListener('hidden', () => {
                inputs.forEach(input => input.disabled = false);
                document.getElementById('save-order').style.display = 'block';
            }, { once: true });
        }
    },

    completeOrder: function(orderId) {
        if (confirm('Mark this order as completed?')) {
            const orders = FarmModules.appData.orders || [];
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = 'completed';
                orders[orderIndex].completedDate = new Date().toISOString().split('T')[0];
                
                this.updateSummary();
                this.renderOrdersTable();
                this.showNotification('Order marked as completed!', 'success');
            }
        }
    },

    updateOrder: function(orderId, orderData) {
        const orders = FarmModules.appData.orders || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex] = {
                ...orders[orderIndex],
                ...orderData
            };
            
            this.updateSummary();
            this.renderOrdersTable();
            this.showNotification('Order updated successfully!', 'success');
        }
    },

    deleteOrder: function() {
        const orderId = document.getElementById('order-id').value;
        
        if (confirm('Are you sure you want to delete this order?')) {
            FarmModules.appData.orders = FarmModules.appData.orders.filter(o => o.id !== orderId);
            
            this.updateSummary();
            this.renderOrdersTable();
            this.hideModal();
            this.showNotification('Order deleted successfully', 'success');
        }
    },

    exportOrders: function() {
        const orders = FarmModules.appData.orders || [];
        const csv = this.convertToCSV(orders);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Orders exported successfully!', 'success');
    },

    convertToCSV: function(orders) {
        const headers = ['Order ID', 'Customer', 'Product', 'Quantity', 'Unit', 'Price', 'Total', 'Status', 'Order Date', 'Due Date'];
        const rows = orders.map(order => [
            order.id,
            order.customerName,
            this.formatProductName(order.product),
            order.quantity,
            order.unit,
            this.formatCurrency(order.pricePerUnit),
            this.formatCurrency(order.totalAmount),
            order.status,
            order.orderDate,
            order.dueDate
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    formatProductName: function(product) {
        const productNames = {
            'broilers': 'Broilers (Live)',
            'broilers-dressed': 'Broilers (Dressed)',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'honey': 'Honey',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'other': 'Other'
        };
        return productNames[product] || product;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
