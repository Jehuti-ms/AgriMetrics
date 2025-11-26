// modules/orders.js
console.log('Loading orders module...');

class OrdersModule {
    constructor() {
        this.name = 'orders';
        this.initialized = false;
        this.ordersData = [];
        this.container = null;
    }

    async initialize() {
        console.log('📋 Initializing orders management...');
        await this.loadOrdersData();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadOrdersData() {
        try {
            if (window.db) {
                this.ordersData = await window.db.getAll('orders');
            } else {
                const savedData = localStorage.getItem('farm-orders');
                this.ordersData = savedData ? JSON.parse(savedData) : this.getSampleData();
            }
        } catch (error) {
            console.error('Error loading orders data:', error);
            this.ordersData = this.getSampleData();
        }
    }

    getSampleData() {
        return [
            {
                id: 'order_1',
                orderNumber: 'ORD-001',
                customer: 'Fresh Market Co.',
                product: 'Organic Tomatoes',
                quantity: 50,
                unit: 'kg',
                price: 4.99,
                total: 249.50,
                status: 'completed',
                orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Urgent delivery'
            },
            {
                id: 'order_2',
                orderNumber: 'ORD-002',
                customer: 'Local Restaurant',
                product: 'Fresh Eggs',
                quantity: 20,
                unit: 'dozen',
                price: 6.50,
                total: 130.00,
                status: 'pending',
                orderDate: new Date().toISOString(),
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                notes: ''
            }
        ];
    }

    async saveOrdersData() {
        try {
            if (window.db) {
                await window.db.clear('orders');
                for (const order of this.ordersData) {
                    await window.db.put('orders', order);
                }
            } else {
                localStorage.setItem('farm-orders', JSON.stringify(this.ordersData));
            }
        } catch (error) {
            console.error('Error saving orders data:', error);
        }
    }

    async addOrder(orderData) {
        const orderNumber = `ORD-${String(this.ordersData.length + 1).padStart(3, '0')}`;
        const order = {
            id: `order_${Date.now()}`,
            orderNumber,
            timestamp: new Date().toISOString(),
            orderDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            deliveryDate: orderData.deliveryDate,
            customer: orderData.customer,
            product: orderData.product,
            quantity: parseInt(orderData.quantity),
            unit: orderData.unit,
            price: parseFloat(orderData.price),
            total: parseFloat(orderData.quantity) * parseFloat(orderData.price),
            status: 'pending',
            notes: orderData.notes || ''
        };

        this.ordersData.unshift(order);
        await this.saveOrdersData();
        await this.updateDisplay();
        this.showToast('Order created successfully!', 'success');
    }

    async updateOrderStatus(orderId, newStatus) {
        const order = this.ordersData.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            await this.saveOrdersData();
            await this.updateDisplay();
            this.showToast(`Order status updated to ${newStatus}`, 'success');
        }
    }

    async deleteOrder(orderId) {
        this.ordersData = this.ordersData.filter(order => order.id !== orderId);
        await this.saveOrdersData();
        await this.updateDisplay();
        this.showToast('Order deleted!', 'success');
    }

    calculateStats() {
        const pending = this.ordersData.filter(order => order.status === 'pending').length;
        const completed = this.ordersData.filter(order => order.status === 'completed').length;
        const totalRevenue = this.ordersData
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
        const today = new Date().toDateString();
        const todayOrders = this.ordersData.filter(order => 
            new Date(order.timestamp).toDateString() === today
        );

        return {
            pending,
            completed,
            totalRevenue: totalRevenue.toFixed(2),
            todayOrders: todayOrders.length,
            totalOrders: this.ordersData.length
        };
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.orders-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="orders-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Orders</h1>
                        <p class="header-subtitle">Manage customer orders and deliveries</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" id="create-order-btn">
                            <i class="icon">➕</i>
                            New Order
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon pending">⏳</div>
                        <div class="stat-content">
                            <div class="stat-value" id="pending-orders">0</div>
                            <div class="stat-label">Pending</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon completed">✅</div>
                        <div class="stat-content">
                            <div class="stat-value" id="completed-orders">0</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon revenue">💰</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-revenue">$0.00</div>
                            <div class="stat-label">Revenue</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon today">📅</div>
                        <div class="stat-content">
                            <div class="stat-value" id="today-orders">0</div>
                            <div class="stat-label">Today's Orders</div>
                        </div>
                    </div>
                </div>

                <!-- Actions Bar -->
                <div class="actions-bar">
                    <div class="search-box">
                        <i class="icon">🔍</i>
                        <input type="text" id="orders-search" placeholder="Search orders...">
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="pending">Pending</button>
                        <button class="filter-btn" data-filter="completed">Completed</button>
                        <button class="filter-btn" data-filter="cancelled">Cancelled</button>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-secondary" id="export-orders-btn">
                            <i class="icon">📤</i>
                            Export
                        </button>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="table-container">
                    <div class="table-header">
                        <h3>Recent Orders</h3>
                        <div class="table-actions">
                            <button class="btn-text" id="refresh-orders-btn">
                                <i class="icon">🔄</i>
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div class="table-content" id="orders-table-content">
                        <!-- Orders will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    async updateDisplay() {
        if (!this.container) return;

        const stats = this.calculateStats();
        
        // Update stats
        this.updateElement('#pending-orders', stats.pending);
        this.updateElement('#completed-orders', stats.completed);
        this.updateElement('#total-revenue', `$${stats.totalRevenue}`);
        this.updateElement('#today-orders', stats.todayOrders);

        // Update table
        await this.renderOrdersTable();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    async renderOrdersTable() {
        const tableContent = this.container?.querySelector('#orders-table-content');
        if (!tableContent) return;

        if (this.ordersData.length === 0) {
            tableContent.innerHTML = this.getEmptyState();
            return;
        }

        tableContent.innerHTML = this.getOrdersTable();
        this.setupTableEventListeners();
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Orders Yet</h3>
                <p>Create your first order to get started</p>
                <button class="btn-primary" id="create-first-order-btn">
                    Create First Order
                </button>
            </div>
        `;
    }

    getOrdersTable() {
        const recentOrders = this.ordersData.slice(0, 15);
        
        return `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Total</th>
                            <th>Status</th>
                            <th>Order Date</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentOrders.map(order => `
                            <tr class="order-row" data-order-id="${order.id}">
                                <td>
                                    <div class="order-number">${order.orderNumber}</div>
                                </td>
                                <td class="customer-cell">
                                    <div class="customer-name">${order.customer}</div>
                                </td>
                                <td class="product-cell">
                                    <div class="product-name">${order.product}</div>
                                    <div class="product-details">${order.quantity} ${order.unit} × $${order.price}</div>
                                </td>
                                <td class="text-right">${order.quantity}</td>
                                <td class="text-right">
                                    <div class="amount">$${order.total.toFixed(2)}</div>
                                </td>
                                <td>
                                    <span class="status-badge status-${order.status}">${order.status}</span>
                                </td>
                                <td>
                                    <div class="date-primary">${order.orderDate}</div>
                                </td>
                                <td class="text-center">
                                    <div class="action-buttons">
                                        ${order.status === 'pending' ? `
                                            <button class="btn-icon success complete-order-btn" data-order-id="${order.id}" title="Mark as completed">
                                                <i class="icon">✅</i>
                                            </button>
                                        ` : ''}
                                        <button class="btn-icon danger delete-order-btn" data-order-id="${order.id}" title="Delete order">
                                            <i class="icon">🗑️</i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        // Create order button
        this.container.querySelector('#create-order-btn')?.addEventListener('click', () => {
            this.showCreateOrderModal();
        });

        // Create first order button (empty state)
        this.container.querySelector('#create-first-order-btn')?.addEventListener('click', () => {
            this.showCreateOrderModal();
        });

        // Export button
        this.container.querySelector('#export-orders-btn')?.addEventListener('click', () => {
            this.exportOrdersData();
        });

        // Filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter, e.target);
            });
        });

        // Search functionality
        const searchInput = this.container.querySelector('#orders-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }

        // Refresh button
        this.container.querySelector('#refresh-orders-btn')?.addEventListener('click', () => {
            this.updateDisplay();
            this.showToast('Orders refreshed!', 'info');
        });
    }

    setupTableEventListeners() {
        // Complete order buttons
        this.container?.querySelectorAll('.complete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.getAttribute('data-order-id');
                this.updateOrderStatus(orderId, 'completed');
            });
        });

        // Delete order buttons
        this.container?.querySelectorAll('.delete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.getAttribute('data-order-id');
                this.confirmDeleteOrder(orderId);
            });
        });
    }

    showCreateOrderModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Order</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="create-order-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="order-customer">Customer Name *</label>
                            <input type="text" id="order-customer" name="customer" required>
                        </div>
                        <div class="form-group">
                            <label for="order-product">Product *</label>
                            <input type="text" id="order-product" name="product" required>
                        </div>
                        <div class="form-group">
                            <label for="order-quantity">Quantity *</label>
                            <input type="number" id="order-quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="order-unit">Unit *</label>
                            <select id="order-unit" name="unit" required>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="lb">lb</option>
                                <option value="dozen">dozen</option>
                                <option value="piece">piece</option>
                                <option value="bunch">bunch</option>
                                <option value="crate">crate</option>
                                <option value="box">box</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="order-price">Price per Unit ($) *</label>
                            <input type="number" id="order-price" name="price" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="order-delivery-date">Delivery Date</label>
                            <input type="date" id="order-delivery-date" name="deliveryDate">
                        </div>
                        <div class="form-group full-width">
                            <label for="order-notes">Notes</label>
                            <textarea id="order-notes" name="notes" rows="3" placeholder="Special instructions..."></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Create Order</button>
                    </div>
                </form>
            </div>
        `;

        // Set minimum date for delivery to today
        const today = new Date().toISOString().split('T')[0];
        modal.querySelector('#order-delivery-date').min = today;

        document.body.appendChild(modal);

        // Modal event listeners
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#create-order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const orderData = Object.fromEntries(formData);
            
            await this.addOrder(orderData);
            closeModal();
        });
    }

    applyFilter(filter, button) {
        // Update active filter button
        this.container?.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Filter rows
        const rows = this.container?.querySelectorAll('.order-row');
        if (!rows) return;

        rows.forEach(row => {
            if (filter === 'all') {
                row.style.display = '';
            } else {
                const status = row.querySelector('.status-badge').textContent.toLowerCase();
                row.style.display = status === filter ? '' : 'none';
            }
        });
    }

    filterOrders(searchTerm) {
        const rows = this.container?.querySelectorAll('.order-row');
        if (!rows) return;

        const term = searchTerm.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    confirmDeleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.deleteOrder(orderId);
        }
    }

    async exportOrdersData() {
        if (this.ordersData.length === 0) {
            this.showToast('No orders data to export', 'warning');
            return;
        }

        const csvContent = this.convertToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Orders data exported!', 'success');
    }

    convertToCSV() {
        const headers = ['Order Number', 'Customer', 'Product', 'Quantity', 'Unit', 'Price', 'Total', 'Status', 'Order Date', 'Delivery Date', 'Notes'];
        const rows = this.ordersData.map(order => [
            order.orderNumber,
            order.customer,
            order.product,
            order.quantity,
            order.unit,
            order.price.toFixed(2),
            order.total.toFixed(2),
            order.status,
            order.orderDate,
            order.deliveryDate || '',
            order.notes
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
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
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('orders', new OrdersModule());
    console.log('✅ Orders module registered');
}
