// modules/orders.js
FarmModules.registerModule('orders', {
    name: 'Orders',
    icon: '📋',
    
    template: function() {
        return `
        <div class="orders-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Orders Management</h1>
                <p class="module-subtitle-pwa">Manage customer orders, track status, and process deliveries</p>
            </div>

            <div class="orders-content">
                <!-- Orders Stats Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">⏳</div>
                        <div class="stat-value-pwa" id="pending-count">0</div>
                        <div class="stat-label-pwa">Pending Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">✅</div>
                        <div class="stat-value-pwa" id="completed-count">0</div>
                        <div class="stat-label-pwa">Completed Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📅</div>
                        <div class="stat-value-pwa" id="today-count">0</div>
                        <div class="stat-label-pwa">Today's Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa" id="revenue-amount">$0</div>
                        <div class="stat-label-pwa">Total Revenue</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <div class="quick-grid-pwa">
                        <a href="#" class="quick-action-btn-pwa" id="quick-create-order">
                            <div class="quick-icon-pwa">➕</div>
                            <div class="quick-title-pwa">Create Order</div>
                            <div class="quick-desc-pwa">New customer order</div>
                        </a>
                        <a href="#" class="quick-action-btn-pwa" id="quick-pending-orders">
                            <div class="quick-icon-pwa">⏳</div>
                            <div class="quick-title-pwa">Pending Orders</div>
                            <div class="quick-desc-pwa">Awaiting processing</div>
                        </a>
                        <a href="#" class="quick-action-btn-pwa" id="quick-today-orders">
                            <div class="quick-icon-pwa">📅</div>
                            <div class="quick-title-pwa">Today's Orders</div>
                            <div class="quick-desc-pwa">Due for delivery</div>
                        </a>
                        <a href="#" class="quick-action-btn-pwa" id="quick-completed-orders">
                            <div class="quick-icon-pwa">✅</div>
                            <div class="quick-title-pwa">Completed</div>
                            <div class="quick-desc-pwa">Delivered orders</div>
                        </a>
                    </div>
                </div>

                <!-- Recent Orders Section -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Orders</h3>
                        <div class="filters-container">
                            <div class="search-box">
                                <span class="search-icon">🔍</span>
                                <input type="text" id="order-search" class="search-input" placeholder="Search orders...">
                            </div>
                            <select id="order-filter" class="filter-select">
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="orders-list" id="orders-list">
                        ${this.renderOrdersList()}
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Order Modal -->
        <div id="create-order-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Order</h3>
                    <button class="close-modal" id="close-create-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-order-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customer-select">Customer *</label>
                                <select id="customer-select" class="form-select" required>
                                    <option value="">Select Customer</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="order-date">Order Date *</label>
                                <input type="date" id="order-date" class="form-input" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="delivery-date">Delivery Date *</label>
                                <input type="date" id="delivery-date" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="order-status">Status</label>
                                <select id="order-status" class="form-select">
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Order Items</h4>
                            <div id="order-items" class="items-container">
                                <div class="order-item">
                                    <div class="item-row">
                                        <div class="form-group">
                                            <label>Product *</label>
                                            <select class="product-select form-select" required>
                                                <option value="">Select Product</option>
                                                <option value="eggs">Eggs</option>
                                                <option value="broilers">Broilers</option>
                                                <option value="layers">Layers</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Quantity *</label>
                                            <input type="number" class="quantity-input form-input" placeholder="Qty" min="1" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Price *</label>
                                            <input type="number" class="price-input form-input" placeholder="Price" step="0.01" min="0" required>
                                        </div>
                                        <button type="button" class="remove-item btn-icon">🗑️</button>
                                    </div>
                                </div>
                            </div>
                            <button type="button" id="add-item" class="btn btn-outline">+ Add Item</button>
                        </div>
                        
                        <div class="form-group">
                            <label for="order-notes">Notes</label>
                            <textarea id="order-notes" class="form-input" placeholder="Any special instructions..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" id="cancel-order" class="btn btn-outline">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Order</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    },

    initialize: function() {
        console.log('📦 Initializing orders...');
        this.showContent();
        this.setupEventListeners();
        this.updateOrderStats();
        this.loadCustomers();
        
        // Set delivery date to tomorrow by default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const deliveryDateInput = document.getElementById('delivery-date');
        if (deliveryDateInput) {
            deliveryDateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        contentArea.innerHTML = this.template();
        console.log('✅ Orders content loaded');
    },

    renderOrdersList: function() {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        
        if (orders.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <div class="empty-title">No orders yet</div>
                    <div class="empty-desc">Create your first order to get started</div>
                </div>
            `;
        }

        const recentOrders = orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        return recentOrders.map(order => `
            <div class="order-card">
                <div class="order-info">
                    <div class="order-status-badge ${order.status}">
                        <span class="status-icon">${this.getStatusIcon(order.status)}</span>
                        <span class="status-text">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <div class="order-title">Order #${order.id} - ${order.customerName}</div>
                        <div class="order-meta">
                            ${order.orderDate} • ${order.items.length} items • ${this.formatCurrency(order.totalAmount)}
                        </div>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-icon view-order" data-order-id="${order.id}" title="View Order">👁️</button>
                    ${order.status === 'pending' ? `
                        <button class="btn-icon process-order" data-order-id="${order.id}" title="Process Order">🔄</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    setupEventListeners: function() {
        // Quick action buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[id]');
            if (!target) return;

            switch(target.id) {
                case 'quick-create-order':
                    e.preventDefault();
                    this.showCreateOrderModal();
                    break;
                case 'quick-pending-orders':
                    e.preventDefault();
                    this.filterOrders('pending');
                    break;
                case 'quick-today-orders':
                    e.preventDefault();
                    this.filterOrders('today');
                    break;
                case 'quick-completed-orders':
                    e.preventDefault();
                    this.filterOrders('completed');
                    break;
                case 'add-item':
                    e.preventDefault();
                    this.addOrderItem();
                    break;
                case 'cancel-order':
                    e.preventDefault();
                    this.closeCreateModal();
                    break;
                case 'close-create-modal':
                    e.preventDefault();
                    this.closeCreateModal();
                    break;
            }
        });

        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'create-order-form') {
                e.preventDefault();
                this.createOrder(e);
            }
        });

        // Filter and search
        document.addEventListener('change', (e) => {
            if (e.target.id === 'order-filter') {
                this.filterOrders(e.target.value);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'order-search') {
                this.searchOrders(e.target.value);
            }
        });

        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-order') || e.target.closest('.view-order')) {
                const orderId = e.target.closest('.view-order').getAttribute('data-order-id');
                this.viewOrder(orderId);
            }
            
            if (e.target.classList.contains('process-order') || e.target.closest('.process-order')) {
                const orderId = e.target.closest('.process-order').getAttribute('data-order-id');
                this.processOrder(orderId);
            }
            
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                this.removeOrderItem(e.target.closest('.remove-item'));
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const createModal = document.getElementById('create-order-modal');
            if (e.target === createModal) {
                this.closeCreateModal();
            }
        });
    },

    updateOrderStats: function() {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        
        const pendingCount = orders.filter(order => order.status === 'pending').length;
        const completedCount = orders.filter(order => order.status === 'completed').length;
        const todayCount = orders.filter(order => {
            const today = new Date().toISOString().split('T')[0];
            return order.deliveryDate === today;
        }).length;
        
        const revenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        this.updateElement('pending-count', pendingCount);
        this.updateElement('completed-count', completedCount);
        this.updateElement('today-count', todayCount);
        this.updateElement('revenue-amount', this.formatCurrency(revenue));
    },

    loadCustomers: function() {
        const customers = JSON.parse(localStorage.getItem('farm-customers') || '[]');
        const customerSelect = document.getElementById('customer-select');
        
        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        }
    },

    showCreateOrderModal: function() {
        const modal = document.getElementById('create-order-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    closeCreateModal: function() {
        const modal = document.getElementById('create-order-modal');
        const form = document.getElementById('create-order-form');
        
        if (modal) modal.classList.add('hidden');
        if (form) form.reset();
        
        // Reset to single item
        const orderItems = document.getElementById('order-items');
        if (orderItems) {
            orderItems.innerHTML = `
                <div class="order-item">
                    <div class="item-row">
                        <div class="form-group">
                            <label>Product *</label>
                            <select class="product-select form-select" required>
                                <option value="">Select Product</option>
                                <option value="eggs">Eggs</option>
                                <option value="broilers">Broilers</option>
                                <option value="layers">Layers</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quantity *</label>
                            <input type="number" class="quantity-input form-input" placeholder="Qty" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Price *</label>
                            <input type="number" class="price-input form-input" placeholder="Price" step="0.01" min="0" required>
                        </div>
                        <button type="button" class="remove-item btn-icon">🗑️</button>
                    </div>
                </div>
            `;
        }
    },

    addOrderItem: function() {
        const orderItems = document.getElementById('order-items');
        if (orderItems) {
            const newItem = document.createElement('div');
            newItem.className = 'order-item';
            newItem.innerHTML = `
                <div class="item-row">
                    <div class="form-group">
                        <label>Product *</label>
                        <select class="product-select form-select" required>
                            <option value="">Select Product</option>
                            <option value="eggs">Eggs</option>
                            <option value="broilers">Broilers</option>
                            <option value="layers">Layers</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity *</label>
                        <input type="number" class="quantity-input form-input" placeholder="Qty" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Price *</label>
                        <input type="number" class="price-input form-input" placeholder="Price" step="0.01" min="0" required>
                    </div>
                    <button type="button" class="remove-item btn-icon">🗑️</button>
                </div>
            `;
            orderItems.appendChild(newItem);
        }
    },

    removeOrderItem: function(button) {
        const orderItems = document.getElementById('order-items');
        if (orderItems && orderItems.children.length > 1) {
            button.closest('.order-item').remove();
        }
    },

    createOrder: function(e) {
        e.preventDefault();
        
        const customerId = document.getElementById('customer-select').value;
        const customerSelect = document.getElementById('customer-select');
        const customerName = customerSelect ? customerSelect.options[customerSelect.selectedIndex].text : '';
        const orderDate = document.getElementById('order-date').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        
        if (!customerId || !orderDate || !deliveryDate) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // Validate items
        const items = [];
        let totalAmount = 0;
        let valid = true;
        
        document.querySelectorAll('.order-item').forEach(item => {
            const productSelect = item.querySelector('.product-select');
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            if (!productSelect.value || !quantityInput.value || !priceInput.value) {
                valid = false;
                return;
            }
            
            const quantity = parseInt(quantityInput.value);
            const price = parseFloat(priceInput.value);
            const itemTotal = quantity * price;
            
            items.push({
                product: productSelect.value,
                productName: productSelect.options[productSelect.selectedIndex].text,
                quantity: quantity,
                price: price,
                total: itemTotal
            });
            
            totalAmount += itemTotal;
        });
        
        if (!valid) {
            this.showNotification('Please fill all item fields', 'error');
            return;
        }
        
        // Create order object
        const order = {
            id: Date.now(),
            customerId: parseInt(customerId),
            customerName: customerName,
            orderDate: orderDate,
            deliveryDate: deliveryDate,
            status: status,
            items: items,
            totalAmount: totalAmount,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        orders.push(order);
        localStorage.setItem('farm-orders', JSON.stringify(orders));
        
        // Close modal and refresh
        this.closeCreateModal();
        this.showContent();
        this.updateOrderStats();
        
        this.showNotification('Order created successfully!', 'success');
    },

    viewOrder: function(orderId) {
        this.showNotification('View order details for #' + orderId, 'info');
    },

    processOrder: function(orderId) {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id == orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'processing';
            localStorage.setItem('farm-orders', JSON.stringify(orders));
            this.showContent();
            this.updateOrderStats();
            this.showNotification('Order processing started!', 'success');
        }
    },

    filterOrders: function(status) {
        this.showNotification('Filtering orders: ' + status, 'info');
    },

    searchOrders: function(query) {
        if (query) {
            this.showNotification('Searching for: ' + query, 'info');
        }
    },

    // Helper methods
    getStatusIcon: function(status) {
        const icons = {
            'pending': '⏳',
            'processing': '🔄',
            'completed': '✅',
            'cancelled': '❌'
        };
        return icons[status] || '📦';
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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
