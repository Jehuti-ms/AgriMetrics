// modules/orders.js - USING MODAL MANAGER
console.log('Loading orders module with Modal Manager...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [
        { id: 'eggs', name: 'Fresh Eggs', price: 0.25 },
        { id: 'broilers', name: 'Broiler Chickens', price: 8.50 },
        { id: 'layers', name: 'Layer Hens', price: 12.00 },
        { id: 'feed', name: 'Chicken Feed', price: 25.99 },
        { id: 'manure', name: 'Organic Manure', price: 15.00 }
    ],
    element: null,

    initialize() {
        console.log('📋 Initializing Orders Management...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Load CSS if not already loaded
        this.loadCSS();

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Orders Management initialized');
        return true;
    },

    loadCSS() {
        // Check if module CSS is already loaded
        if (document.querySelector('link[href*="orders.css"]')) {
            return;
        }
        
        // Create link element for module-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/orders.css';
        document.head.appendChild(link);
    },

    loadData() {
        const savedOrders = localStorage.getItem('farm-orders');
        const savedCustomers = localStorage.getItem('farm-customers');
        
        this.orders = savedOrders ? JSON.parse(savedOrders) : this.getDemoOrders();
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : this.getDemoCustomers();
    },

    getDemoOrders() {
        return [
            {
                id: 1,
                customerId: 1,
                customerName: 'Local Market',
                date: '2024-03-15',
                items: [
                    { productId: 'eggs', productName: 'Fresh Eggs', quantity: 50, price: 0.25, total: 12.50 }
                ],
                totalAmount: 12.50,
                status: 'completed',
                notes: 'Regular weekly order',
                deliveryDate: '2024-03-16'
            },
            {
                id: 2,
                customerId: 2,
                customerName: 'Restaurant A',
                date: '2024-03-14',
                items: [
                    { productId: 'broilers', productName: 'Broiler Chickens', quantity: 10, price: 8.50, total: 85.00 }
                ],
                totalAmount: 85.00,
                status: 'pending',
                notes: 'New restaurant client',
                deliveryDate: '2024-03-20'
            },
            {
                id: 3,
                customerId: 3,
                customerName: 'Grocery Store B',
                date: '2024-03-10',
                items: [
                    { productId: 'eggs', productName: 'Fresh Eggs', quantity: 100, price: 0.25, total: 25.00 },
                    { productId: 'layers', productName: 'Layer Hens', quantity: 5, price: 12.00, total: 60.00 }
                ],
                totalAmount: 85.00,
                status: 'shipped',
                notes: 'Bulk order',
                deliveryDate: '2024-03-12'
            }
        ];
    },

    getDemoCustomers() {
        return [
            { 
                id: 1, 
                name: 'Local Market', 
                contact: '555-0123', 
                address: '123 Main St', 
                email: 'market@local.com',
                type: 'retail',
                notes: 'Regular customer, pays on time'
            },
            { 
                id: 2, 
                name: 'Restaurant A', 
                contact: '555-0456', 
                address: '456 Oak Ave', 
                email: 'orders@restauranta.com',
                type: 'restaurant',
                notes: 'New client, prefers organic'
            },
            { 
                id: 3, 
                name: 'Grocery Store B', 
                contact: '555-0789', 
                address: '789 Pine St', 
                email: 'produce@grocerystore.com',
                type: 'wholesale',
                notes: 'Bulk orders, monthly deliveries'
            },
            { 
                id: 4, 
                name: 'Farmers Co-op', 
                contact: '555-0912', 
                address: '321 Elm St', 
                email: 'orders@farmerscoop.com',
                type: 'wholesale',
                notes: 'Partner organization'
            }
        ];
    },

    calculateStats() {
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;
        const cancelledOrders = this.orders.filter(order => order.status === 'cancelled').length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(order => order.date === today).length;
        
        return {
            totalOrders: this.orders.length,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            todayOrders,
            totalRevenue: this.getTotalRevenue(),
            totalCustomers: this.customers.length
        };
    },

    getTotalRevenue() {
        return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    },

    getCustomerById(id) {
        return this.customers.find(c => c.id === id);
    },

    getCustomerName(id) {
        const customer = this.getCustomerById(id);
        return customer ? customer.name : 'Unknown Customer';
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div id="orders" class="module-container">
                <!-- Modern Header -->
                <div class="orders-module-header">
                    <div class="orders-header-text">
                        <h1 class="orders-module-title">Orders Management</h1>
                        <p class="orders-module-subtitle">Manage customer orders and deliveries</p>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="orders-quick-actions">
                    <button class="orders-quick-btn primary" id="create-order-btn">
                        <div class="orders-quick-icon">➕</div>
                        <div>
                            <div class="orders-quick-title">New Order</div>
                            <div class="orders-quick-desc">Create new order</div>
                        </div>
                    </button>
                    
                    <button class="orders-quick-btn" id="manage-customers-btn">
                        <div class="orders-quick-icon">👥</div>
                        <div>
                            <div class="orders-quick-title">Customers</div>
                            <div class="orders-quick-desc">Manage customers</div>
                        </div>
                    </button>
                    
                    <button class="orders-quick-btn" id="orders-report-btn">
                        <div class="orders-quick-icon">📊</div>
                        <div>
                            <div class="orders-quick-title">Reports</div>
                            <div class="orders-quick-desc">View reports</div>
                        </div>
                    </button>
                    
                    <button class="orders-quick-btn" id="add-customer-btn">
                        <div class="orders-quick-icon">👤</div>
                        <div>
                            <div class="orders-quick-title">Add Customer</div>
                            <div class="orders-quick-desc">Add new customer</div>
                        </div>
                    </button>
                </div>

                <!-- Order Stats -->
                <div class="orders-stats-grid">
                    <div class="orders-stat-card">
                        <div class="orders-stat-icon">📦</div>
                        <div class="orders-stat-value">${stats.totalOrders}</div>
                        <div class="orders-stat-label">Total Orders</div>
                    </div>
                    
                    <div class="orders-stat-card">
                        <div class="orders-stat-icon">💰</div>
                        <div class="orders-stat-value">${this.formatCurrency(stats.totalRevenue)}</div>
                        <div class="orders-stat-label">Total Revenue</div>
                    </div>
                    
                    <div class="orders-stat-card">
                        <div class="orders-stat-icon">👥</div>
                        <div class="orders-stat-value">${stats.totalCustomers}</div>
                        <div class="orders-stat-label">Customers</div>
                    </div>
                    
                    <div class="orders-stat-card">
                        <div class="orders-stat-icon">⏳</div>
                        <div class="orders-stat-value">${stats.pendingOrders}</div>
                        <div class="orders-stat-label">Pending</div>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="orders-list-container">
                    <div class="orders-list-header">
                        <h3 class="orders-list-title">Recent Orders</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn-outline" id="export-orders-btn">Export</button>
                            <button class="btn btn-primary" id="show-all-orders-btn">View All</button>
                        </div>
                    </div>
                    <div id="orders-list">
                        ${this.renderOrdersList()}
                    </div>
                </div>

                <!-- Customers Section -->
                <div class="orders-customers-section">
                    <div class="orders-customers-header">
                        <h3 class="orders-customers-title">Customers</h3>
                        <button class="btn btn-primary" id="view-all-customers-btn">View All</button>
                    </div>
                    <div id="customers-list">
                        ${this.renderCustomersList()}
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    },

    renderOrdersList() {
        if (this.orders.length === 0) {
            return `
                <div class="orders-empty-state">
                    <div class="orders-empty-icon">📋</div>
                    <h3 class="orders-empty-title">No orders yet</h3>
                    <p class="orders-empty-desc">Create your first order to get started</p>
                    <button class="btn btn-primary" id="create-first-order-btn">
                        ➕ Create First Order
                    </button>
                </div>
            `;
        }

        const recentOrders = this.orders.slice(0, 5); // Show only 5 most recent

        return `
            <div>
                ${recentOrders.map(order => {
                    const customer = this.getCustomerById(order.customerId);
                    return `
                        <div class="orders-item" data-id="${order.id}">
                            <div class="orders-item-content">
                                <div class="orders-item-header">
                                    <div class="orders-item-id">Order #${order.id}</div>
                                    <div class="orders-item-customer">
                                        ${customer ? customer.name : 'Unknown Customer'}
                                    </div>
                                    <span class="orders-status ${order.status}">
                                        ${this.formatStatus(order.status)}
                                    </span>
                                </div>
                                <div class="orders-item-meta">
                                    <span>${order.date}</span>
                                    <span>${order.items.length} item${order.items.length > 1 ? 's' : ''}</span>
                                    ${order.deliveryDate ? `<span>Delivery: ${order.deliveryDate}</span>` : ''}
                                </div>
                                ${order.notes ? `
                                    <div style="margin-top: 8px; font-size: 13px; color: var(--color-text-tertiary);">
                                        ${order.notes}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="orders-item-amount">
                                ${this.formatCurrency(order.totalAmount)}
                            </div>
                            <div class="orders-actions">
                                <button class="orders-action-btn view" data-action="view" data-id="${order.id}">
                                    View
                                </button>
                                <button class="orders-action-btn edit" data-action="edit" data-id="${order.id}">
                                    Edit
                                </button>
                                <button class="orders-action-btn delete" data-action="delete" data-id="${order.id}">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderCustomersList() {
        if (this.customers.length === 0) {
            return `
                <div class="orders-empty-state">
                    <div class="orders-empty-icon">👥</div>
                    <h3 class="orders-empty-title">No customers yet</h3>
                    <p class="orders-empty-desc">Add your first customer to get started</p>
                    <button class="btn btn-primary" id="create-first-customer-btn">
                        👤 Add First Customer
                    </button>
                </div>
            `;
        }

        const recentCustomers = this.customers.slice(0, 4); // Show only 4 most recent

        return `
            <div>
                ${recentCustomers.map(customer => {
                    const orderCount = this.orders.filter(order => order.customerId === customer.id).length;
                    const totalSpent = this.orders
                        .filter(order => order.customerId === customer.id)
                        .reduce((sum, order) => sum + order.totalAmount, 0);
                    
                    return `
                        <div class="orders-customer-item" data-id="${customer.id}">
                            <div class="orders-customer-content">
                                <div class="orders-customer-name">
                                    ${customer.name}
                                    ${customer.type ? `<span style="margin-left: 8px; font-size: 12px; color: var(--color-text-tertiary);">(${customer.type})</span>` : ''}
                                </div>
                                <div class="orders-customer-contact">${customer.contact}</div>
                                ${customer.email ? `<div class="orders-customer-email">${customer.email}</div>` : ''}
                                ${customer.notes ? `
                                    <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-tertiary); font-style: italic;">
                                        ${customer.notes}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="orders-customer-stats">
                                <div class="orders-customer-order-count">
                                    ${orderCount} order${orderCount !== 1 ? 's' : ''}
                                </div>
                                <div class="orders-customer-total">
                                    ${this.formatCurrency(totalSpent)} total
                                </div>
                            </div>
                            <div class="orders-actions" style="margin-left: 12px;">
                                <button class="orders-action-btn view" data-action="view-customer" data-id="${customer.id}">
                                    View
                                </button>
                                <button class="orders-action-btn edit" data-action="edit-customer" data-id="${customer.id}">
                                    Edit
                                </button>
                                <button class="orders-action-btn delete" data-action="delete-customer" data-id="${customer.id}">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ==================== MODAL METHODS ====================
    showCreateOrderModal() {
        ModalManager.createQuickForm({
            id: 'create-order-modal',
            title: 'Create New Order',
            subtitle: 'Fill in order details',
            size: 'modal-lg',
            fields: [
                {
                    name: 'customerId',
                    type: 'select',
                    label: 'Customer',
                    required: true,
                    autofocus: true,
                    options: [
                        { value: '', label: 'Select Customer' },
                        ...this.customers.map(customer => ({
                            value: customer.id,
                            label: `${customer.name} (${customer.contact})`
                        }))
                    ]
                },
                {
                    name: 'date',
                    type: 'text',
                    label: 'Order Date',
                    required: true,
                    value: new Date().toISOString().split('T')[0],
                    note: 'Format: YYYY-MM-DD'
                },
                {
                    name: 'deliveryDate',
                    type: 'text',
                    label: 'Delivery Date (Optional)',
                    required: false,
                    note: 'Expected delivery date'
                },
                {
                    name: 'status',
                    type: 'select',
                    label: 'Order Status',
                    required: true,
                    value: 'pending',
                    options: [
                        { value: 'pending', label: 'Pending' },
                        { value: 'confirmed', label: 'Confirmed' },
                        { value: 'shipped', label: 'Shipped' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' }
                    ]
                }
            ],
            content: `
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Order Items</h4>
                    <div id="order-items-container">
                        <div class="orders-item-row">
                            <select class="quick-form-input product-select" required>
                                <option value="">Select Product</option>
                                ${this.products.map(product => `
                                    <option value="${product.id}" data-price="${product.price}">
                                        ${product.name} - ${this.formatCurrency(product.price)}/unit
                                    </option>
                                `).join('')}
                            </select>
                            <input type="number" class="quick-form-input quantity-input" placeholder="Quantity" min="1" value="1" required>
                            <input type="number" class="quick-form-input price-input" placeholder="Price" step="0.01" min="0" required>
                            <button type="button" class="orders-remove-item" data-action="remove-item">✕</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline" id="add-order-item-btn" style="margin-top: 12px;">
                        + Add Another Item
                    </button>
                </div>
                <div style="margin-bottom: 20px;">
                    <label class="quick-form-label">Order Notes (Optional)</label>
                    <textarea class="quick-form-input quick-form-textarea" id="order-notes" rows="3" placeholder="Special instructions, delivery notes..."></textarea>
                </div>
                <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: var(--color-text-primary);">Total Amount:</span>
                        <span id="order-total-preview" style="font-size: 20px; font-weight: 700; color: var(--color-success);">$0.00</span>
                    </div>
                </div>
            `,
            onSubmit: (data) => {
                // Get order items from the UI
                const items = [];
                let totalAmount = 0;
                
                document.querySelectorAll('#order-items-container .orders-item-row').forEach(row => {
                    const productSelect = row.querySelector('.product-select');
                    const quantityInput = row.querySelector('.quantity-input');
                    const priceInput = row.querySelector('.price-input');
                    
                    if (productSelect.value && quantityInput.value && priceInput.value) {
                        const product = this.products.find(p => p.id === productSelect.value);
                        const quantity = parseFloat(quantityInput.value) || 0;
                        const price = parseFloat(priceInput.value) || 0;
                        const itemTotal = quantity * price;
                        
                        items.push({
                            productId: productSelect.value,
                            productName: product ? product.name : 'Unknown Product',
                            quantity: quantity,
                            price: price,
                            total: itemTotal
                        });
                        
                        totalAmount += itemTotal;
                    }
                });
                
                if (items.length === 0) {
                    ModalManager.alert({
                        title: 'No Items',
                        message: 'Please add at least one item to the order.',
                        icon: '⚠️',
                        type: 'modal-warning'
                    });
                    return false;
                }
                
                const customer = this.customers.find(c => c.id === parseInt(data.customerId));
                
                const orderData = {
                    id: Date.now(),
                    customerId: parseInt(data.customerId),
                    customerName: customer ? customer.name : 'Unknown Customer',
                    date: data.date,
                    deliveryDate: data.deliveryDate || '',
                    items: items,
                    totalAmount: totalAmount,
                    status: data.status,
                    notes: document.getElementById('order-notes')?.value || '',
                    createdAt: new Date().toISOString()
                };

                this.createOrder(orderData);
                return true;
            },
            onOpen: () => {
                // Add item button
                const addItemBtn = document.getElementById('add-order-item-btn');
                if (addItemBtn) {
                    addItemBtn.addEventListener('click', () => this.addOrderItemRow());
                }
                
                // Initialize first item
                this.setupOrderItemRow(document.querySelector('.orders-item-row'));
                
                // Calculate initial total
                this.calculateOrderTotal();
            }
        });
    },

    addOrderItemRow() {
        const container = document.getElementById('order-items-container');
        if (!container) return;
        
        const newRow = document.createElement('div');
        newRow.className = 'orders-item-row';
        newRow.innerHTML = `
            <select class="quick-form-input product-select" required>
                <option value="">Select Product</option>
                ${this.products.map(product => `
                    <option value="${product.id}" data-price="${product.price}">
                        ${product.name} - ${this.formatCurrency(product.price)}/unit
                    </option>
                `).join('')}
            </select>
            <input type="number" class="quick-form-input quantity-input" placeholder="Quantity" min="1" value="1" required>
            <input type="number" class="quick-form-input price-input" placeholder="Price" step="0.01" min="0" required>
            <button type="button" class="orders-remove-item" data-action="remove-item">✕</button>
        `;
        
        container.appendChild(newRow);
        this.setupOrderItemRow(newRow);
        this.calculateOrderTotal();
    },

    setupOrderItemRow(row) {
        // Product select change
        const productSelect = row.querySelector('.product-select');
        const priceInput = row.querySelector('.price-input');
        
        productSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price;
            if (price && (!priceInput.value || priceInput.value === '0')) {
                priceInput.value = price;
                this.calculateOrderTotal();
            }
        });
        
        // Quantity/price input changes
        row.querySelectorAll('.quantity-input, .price-input').forEach(input => {
            input.addEventListener('input', () => this.calculateOrderTotal());
        });
        
        // Remove button
        const removeBtn = row.querySelector('[data-action="remove-item"]');
        removeBtn.addEventListener('click', () => {
            row.remove();
            this.calculateOrderTotal();
        });
    },

    calculateOrderTotal() {
        let total = 0;
        
        document.querySelectorAll('#order-items-container .orders-item-row').forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            total += quantity * price;
        });
        
        const totalElement = document.getElementById('order-total-preview');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
            totalElement.style.color = total > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)';
        }
    },

    showAddCustomerModal() {
        ModalManager.createQuickForm({
            id: 'add-customer-modal',
            title: 'Add New Customer',
            subtitle: 'Enter customer details',
            size: 'modal-md',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    label: 'Customer Name',
                    required: true,
                    autofocus: true,
                    placeholder: 'e.g., Local Market'
                },
                {
                    name: 'contact',
                    type: 'text',
                    label: 'Contact Phone',
                    required: true,
                    placeholder: 'e.g., 555-0123'
                },
                {
                    name: 'email',
                    type: 'email',
                    label: 'Email Address (Optional)',
                    required: false,
                    placeholder: 'customer@example.com'
                },
                {
                    name: 'type',
                    type: 'select',
                    label: 'Customer Type',
                    required: false,
                    options: [
                        { value: 'retail', label: 'Retail' },
                        { value: 'wholesale', label: 'Wholesale' },
                        { value: 'restaurant', label: 'Restaurant' },
                        { value: 'institution', label: 'Institution' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'address',
                    type: 'textarea',
                    label: 'Address (Optional)',
                    required: false,
                    placeholder: 'Full address...',
                    rows: 2
                },
                {
                    name: 'notes',
                    type: 'textarea',
                    label: 'Notes (Optional)',
                    required: false,
                    placeholder: 'Customer preferences, payment terms...',
                    rows: 2
                }
            ],
            onSubmit: (data) => {
                const customerData = {
                    id: Date.now(),
                    name: data.name,
                    contact: data.contact,
                    email: data.email || '',
                    type: data.type || 'retail',
                    address: data.address || '',
                    notes: data.notes || '',
                    createdAt: new Date().toISOString().split('T')[0]
                };

                this.addCustomer(customerData);
                return true;
            }
        });
    },

    showViewOrderModal(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const customer = this.getCustomerById(order.customerId);
        
        const itemsHTML = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                <div>
                    <div style="font-weight: 600; color: var(--color-text-primary);">${item.productName}</div>
                    <div style="font-size: 13px; color: var(--color-text-tertiary);">
                        ${item.quantity} × ${this.formatCurrency(item.price)} = ${this.formatCurrency(item.total)}
                    </div>
                </div>
            </div>
        `).join('');
        
        const content = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Order Details</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Order ID</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">#${order.id}</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Status</div>
                            <span class="orders-status ${order.status}">
                                ${this.formatStatus(order.status)}
                            </span>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Order Date</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">${order.date}</div>
                        </div>
                        ${order.deliveryDate ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Delivery Date</div>
                                <div style="font-weight: 600; color: var(--color-text-primary);">${order.deliveryDate}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Customer Details</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Customer</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                ${customer ? customer.name : 'Unknown Customer'}
                            </div>
                        </div>
                        ${customer?.contact ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Contact</div>
                                <div style="font-weight: 600; color: var(--color-text-primary);">${customer.contact}</div>
                            </div>
                        ` : ''}
                        ${customer?.email ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Email</div>
                                <div style="font-weight: 600; color: var(--color-text-primary);">${customer.email}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Order Items</h4>
                <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                    ${itemsHTML}
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-top: 1px solid var(--color-border-light);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: var(--color-text-primary);">Total Amount:</span>
                            <span style="font-size: 20px; font-weight: 700; color: var(--color-success);">
                                ${this.formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${order.notes ? `
                <div>
                    <h4 style="margin-bottom: 8px; color: var(--color-text-primary);">Order Notes</h4>
                    <div style="padding: 12px; background: var(--color-bg-tertiary); border-radius: 8px; font-size: 14px;">
                        ${order.notes}
                    </div>
                </div>
            ` : ''}
        `;
        
        ModalManager.show({
            id: `view-order-${orderId}`,
            title: `Order #${orderId}`,
            subtitle: 'Order Details',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="edit" data-id="${orderId}">
                    Edit Order
                </button>
                <button type="button" class="btn btn-warning" data-action="print" data-id="${orderId}">
                    Print Invoice
                </button>
            `,
            onOpen: () => {
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'edit':
                                this.showEditOrderModal(id);
                                break;
                            case 'print':
                                this.printInvoice(id);
                                break;
                        }
                    });
                });
            }
        });
    },

    showViewCustomerModal(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const customerOrders = this.orders.filter(order => order.customerId === customerId);
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const lastOrder = customerOrders.length > 0 ? 
            customerOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
        
        const ordersHTML = customerOrders.length > 0 ? customerOrders.slice(0, 3).map(order => `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--color-border-light);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600; color: var(--color-text-primary);">Order #${order.id}</div>
                        <div style="font-size: 13px; color: var(--color-text-tertiary);">${order.date}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--color-text-primary);">${this.formatCurrency(order.totalAmount)}</div>
                        <span class="orders-status ${order.status}" style="font-size: 11px;">
                            ${this.formatStatus(order.status)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('') : `
            <div style="text-align: center; padding: 20px; color: var(--color-text-tertiary);">
                No orders yet
            </div>
        `;
        
        const content = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Customer Information</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Name</div>
                            <div style="font-weight: 600; color: var(--color-text-primary); font-size: 18px;">
                                ${customer.name}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Contact</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">${customer.contact}</div>
                        </div>
                        ${customer.email ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Email</div>
                                <div style="font-weight: 600; color: var(--color-text-primary);">${customer.email}</div>
                            </div>
                        ` : ''}
                        ${customer.type ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Type</div>
                                <div>
                                    <span style="padding: 4px 8px; background: var(--color-bg-tertiary); border-radius: 6px; font-size: 12px;">
                                        ${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                                    </span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Customer Stats</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Total Orders</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--color-text-primary);">
                                ${customerOrders.length}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Total Spent</div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--color-success);">
                                ${this.formatCurrency(totalSpent)}
                            </div>
                        </div>
                        ${lastOrder ? `
                            <div>
                                <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Last Order</div>
                                <div style="font-weight: 600; color: var(--color-text-primary);">
                                    #${lastOrder.id} (${lastOrder.date})
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            ${customer.address ? `
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 8px; color: var(--color-text-primary);">Address</h4>
                    <div style="padding: 12px; background: var(--color-bg-tertiary); border-radius: 8px; font-size: 14px;">
                        ${customer.address}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Recent Orders</h4>
                <div style="border: 1px solid var(--color-border-light); border-radius: 8px; max-height: 200px; overflow-y: auto;">
                    ${ordersHTML}
                </div>
                ${customerOrders.length > 3 ? `
                    <div style="text-align: center; margin-top: 8px;">
                        <span style="font-size: 13px; color: var(--color-text-tertiary);">
                            + ${customerOrders.length - 3} more orders
                        </span>
                    </div>
                ` : ''}
            </div>
            
            ${customer.notes ? `
                <div>
                    <h4 style="margin-bottom: 8px; color: var(--color-text-primary);">Notes</h4>
                    <div style="padding: 12px; background: var(--color-bg-tertiary); border-radius: 8px; font-size: 14px;">
                        ${customer.notes}
                    </div>
                </div>
            ` : ''}
        `;
        
        ModalManager.show({
            id: `view-customer-${customerId}`,
            title: customer.name,
            subtitle: 'Customer Details',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="edit" data-id="${customerId}">
                    Edit Customer
                </button>
                <button type="button" class="btn btn-warning" data-action="create-order" data-id="${customerId}">
                    Create Order
                </button>
            `,
            onOpen: () => {
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'edit':
                                this.showEditCustomerModal(id);
                                break;
                            case 'create-order':
                                // Create order with this customer pre-selected
                                const customer = this.customers.find(c => c.id === id);
                                if (customer) {
                                    const modalId = this.showCreateOrderModal();
                                    // Note: We'd need to modify createOrderModal to accept pre-filled data
                                    // This is a simplified version
                                    console.log('Create order for customer:', customer.name);
                                }
                                break;
                        }
                    });
                });
            }
        });
    },

    showOrdersReportModal() {
        const stats = this.calculateStats();
        const topCustomers = this.getTopCustomers();
        const recentOrders = this.orders.slice(0, 5);
        
        ModalManager.showReports({
            id: 'orders-reports-modal',
            title: 'Orders Reports',
            subtitle: 'Generate orders analysis reports',
            reports: [
                {
                    id: 'sales-summary',
                    icon: '📊',
                    title: 'Sales Summary',
                    description: 'Overall sales performance',
                    preview: `
                        <h4 class="font-semibold mb-2">Sales Summary Report</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Total Orders:</span>
                                <span class="font-semibold">${stats.totalOrders}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Total Revenue:</span>
                                <span class="font-semibold text-success">${this.formatCurrency(stats.totalRevenue)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Pending Orders:</span>
                                <span class="font-semibold text-warning">${stats.pendingOrders}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Customers:</span>
                                <span class="font-semibold">${stats.totalCustomers}</span>
                            </div>
                        </div>
                    `
                },
                {
                    id: 'customer-analysis',
                    icon: '👥',
                    title: 'Customer Analysis',
                    description: 'Customer behavior and trends',
                    preview: `
                        <h4 class="font-semibold mb-2">Customer Analysis Report</h4>
                        <div class="space-y-2" style="max-height: 200px; overflow-y: auto;">
                            ${topCustomers.slice(0, 3).map(customer => `
                                <div class="flex justify-between items-center">
                                    <span>${customer.name}:</span>
                                    <span class="font-semibold">${customer.orderCount} orders</span>
                                </div>
                            `).join('')}
                        </div>
                    `
                },
                {
                    id: 'order-status',
                    icon: '📋',
                    title: 'Order Status',
                    description: 'Orders by status',
                    preview: `
                        <h4 class="font-semibold mb-2">Order Status Report</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Completed:</span>
                                <span class="font-semibold text-success">${stats.completedOrders}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Pending:</span>
                                <span class="font-semibold text-warning">${stats.pendingOrders}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Cancelled:</span>
                                <span class="font-semibold text-danger">${stats.cancelledOrders}</span>
                            </div>
                        </div>
                    `
                },
                {
                    id: 'recent-orders',
                    icon: '🕒',
                    title: 'Recent Orders',
                    description: 'Latest order activity',
                    preview: `
                        <h4 class="font-semibold mb-2">Recent Orders Report</h4>
                        <p class="text-tertiary">Shows the most recent orders with details.</p>
                        <p class="text-tertiary text-sm mt-2">
                            Last 5 orders of ${stats.totalOrders} total
                        </p>
                    `
                },
                {
                    id: 'export-orders',
                    icon: '📤',
                    title: 'Export Data',
                    description: 'Export orders and customers',
                    buttonText: 'Export Data',
                    preview: `
                        <h4 class="font-semibold mb-2">Export Orders Data</h4>
                        <p class="text-tertiary">Export all orders and customer data as JSON, CSV, or Excel.</p>
                        <p class="text-tertiary text-sm mt-2">
                            ${stats.totalOrders} orders, ${stats.totalCustomers} customers
                        </p>
                    `
                },
                {
                    id: 'print-orders',
                    icon: '🖨️',
                    title: 'Print Report',
                    description: 'Printable version',
                    buttonText: 'Print Report',
                    preview: `
                        <h4 class="font-semibold mb-2">Print Orders Report</h4>
                        <p class="text-tertiary">Generate a printer-friendly version of the selected report.</p>
                    `
                }
            ],
            onReportSelect: (reportId) => {
                switch(reportId) {
                    case 'export-orders':
                        this.exportOrdersData();
                        break;
                    case 'print-orders':
                        window.print();
                        break;
                    default:
                        this.generateOrdersReport(reportId);
                }
            }
        });
    },

    showEditOrderModal(orderId) {
        // For simplicity, we'll just show a message
        // Full edit functionality would be similar to createOrderModal but with pre-filled data
        ModalManager.alert({
            title: 'Edit Order',
            message: 'Edit functionality coming soon!',
            icon: 'ℹ️',
            type: 'modal-info'
        });
    },

    showEditCustomerModal(customerId) {
        // For simplicity, we'll just show a message
        ModalManager.alert({
            title: 'Edit Customer',
            message: 'Edit customer functionality coming soon!',
            icon: 'ℹ️',
            type: 'modal-info'
        });
    },

    // ==================== SETUP EVENT LISTENERS ====================
    setupEventListeners() {
        // Quick action buttons
        document.getElementById('create-order-btn')?.addEventListener('click', () => this.showCreateOrderModal());
        document.getElementById('add-customer-btn')?.addEventListener('click', () => this.showAddCustomerModal());
        document.getElementById('manage-customers-btn')?.addEventListener('click', () => this.showManageCustomersModal());
        document.getElementById('orders-report-btn')?.addEventListener('click', () => this.showOrdersReportModal());
        
        // Create first buttons
        document.getElementById('create-first-order-btn')?.addEventListener('click', () => this.showCreateOrderModal());
        document.getElementById('create-first-customer-btn')?.addEventListener('click', () => this.showAddCustomerModal());
        
        // View all buttons
        document.getElementById('show-all-orders-btn')?.addEventListener('click', () => this.showAllOrdersModal());
        document.getElementById('view-all-customers-btn')?.addEventListener('click', () => this.showAllCustomersModal());
        
        // Export button
        document.getElementById('export-orders-btn')?.addEventListener('click', () => this.exportOrdersData());
        
        // Action handlers
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            
            const action = actionBtn.dataset.action;
            const id = parseInt(actionBtn.dataset.id);
            
            if (!id) return;
            
            switch(action) {
                case 'view':
                    this.showViewOrderModal(id);
                    break;
                    
                case 'edit':
                    this.showEditOrderModal(id);
                    break;
                    
                case 'delete':
                    this.showDeleteOrderModal(id);
                    break;
                    
                case 'view-customer':
                    this.showViewCustomerModal(id);
                    break;
                    
                case 'edit-customer':
                    this.showEditCustomerModal(id);
                    break;
                    
                case 'delete-customer':
                    this.showDeleteCustomerModal(id);
                    break;
            }
        });
    },

    showManageCustomersModal() {
        const customersList = this.customers.map(customer => {
            const orderCount = this.orders.filter(order => order.customerId === customer.id).length;
            const totalSpent = this.orders
                .filter(order => order.customerId === customer.id)
                .reduce((sum, order) => sum + order.totalAmount, 0);
            
            return `
                <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">${customer.name}</div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary);">
                                ${customer.contact} • ${orderCount} orders • ${this.formatCurrency(totalSpent)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button class="orders-action-btn view" data-action="view-customer" data-id="${customer.id}">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const content = `
            <div>
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">
                    All Customers (${this.customers.length})
                </h4>
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--color-border-light); border-radius: 8px;">
                    ${customersList || '<div style="text-align: center; padding: 40px; color: var(--color-text-tertiary);">No customers</div>'}
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'manage-customers-modal',
            title: 'Manage Customers',
            subtitle: 'View and manage all customers',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="add-customer">
                    Add New Customer
                </button>
            `,
            onOpen: () => {
                // Add action handlers
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'view-customer':
                                this.showViewCustomerModal(id);
                                break;
                            case 'add-customer':
                                this.showAddCustomerModal();
                                break;
                        }
                    });
                });
            }
        });
    },

    showAllOrdersModal() {
        const ordersList = this.orders.map(order => {
            const customer = this.getCustomerById(order.customerId);
            return `
                <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                Order #${order.id} - ${customer ? customer.name : 'Unknown Customer'}
                            </div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary);">
                                ${order.date} • ${order.items.length} items • ${this.formatCurrency(order.totalAmount)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <span class="orders-status ${order.status}" style="font-size: 11px;">
                                ${this.formatStatus(order.status)}
                            </span>
                            <button class="orders-action-btn view" data-action="view" data-id="${order.id}">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const content = `
            <div>
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">
                    All Orders (${this.orders.length})
                </h4>
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--color-border-light); border-radius: 8px;">
                    ${ordersList || '<div style="text-align: center; padding: 40px; color: var(--color-text-tertiary);">No orders</div>'}
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'all-orders-modal',
            title: 'All Orders',
            subtitle: 'View and manage all orders',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="create-order">
                    Create New Order
                </button>
            `,
            onOpen: () => {
                // Add action handlers
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'view':
                                this.showViewOrderModal(id);
                                break;
                            case 'create-order':
                                this.showCreateOrderModal();
                                break;
                        }
                    });
                });
            }
        });
    },

    showAllCustomersModal() {
        const customersList = this.customers.map(customer => {
            const orderCount = this.orders.filter(order => order.customerId === customer.id).length;
            const totalSpent = this.orders
                .filter(order => order.customerId === customer.id)
                .reduce((sum, order) => sum + order.totalAmount, 0);
            
            return `
                <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">${customer.name}</div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary);">
                                ${customer.contact} • ${orderCount} orders • ${this.formatCurrency(totalSpent)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button class="orders-action-btn view" data-action="view-customer" data-id="${customer.id}">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        const content = `
            <div>
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">
                    All Customers (${this.customers.length})
                </h4>
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--color-border-light); border-radius: 8px;">
                    ${customersList || '<div style="text-align: center; padding: 40px; color: var(--color-text-tertiary);">No customers</div>'}
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'all-customers-modal',
            title: 'All Customers',
            subtitle: 'View all customers',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="add-customer">
                    Add New Customer
                </button>
            `,
            onOpen: () => {
                // Add action handlers
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'view-customer':
                                this.showViewCustomerModal(id);
                                break;
                            case 'add-customer':
                                this.showAddCustomerModal();
                                break;
                        }
                    });
                });
            }
        });
    },

    showDeleteOrderModal(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        ModalManager.confirm({
            title: 'Delete Order',
            message: `Are you sure you want to delete Order #${orderId}?`,
            details: `Customer: ${order.customerName}, Amount: ${this.formatCurrency(order.totalAmount)}`,
            icon: '🗑️',
            type: 'modal-danger',
            danger: true,
            confirmText: 'Delete Order'
        }).then((confirmed) => {
            if (confirmed) {
                this.deleteOrder(orderId);
            }
        });
    },

    showDeleteCustomerModal(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const customerOrders = this.orders.filter(order => order.customerId === customerId);
        
        if (customerOrders.length > 0) {
            ModalManager.alert({
                title: 'Cannot Delete Customer',
                message: `Cannot delete "${customer.name}" because they have ${customerOrders.length} order(s).`,
                details: 'Delete their orders first or reassign them to another customer.',
                icon: '⚠️',
                type: 'modal-warning'
            });
            return;
        }
        
        ModalManager.confirm({
            title: 'Delete Customer',
            message: `Are you sure you want to delete customer "${customer.name}"?`,
            details: 'This action cannot be undone.',
            icon: '🗑️',
            type: 'modal-danger',
            danger: true,
            confirmText: 'Delete Customer'
        }).then((confirmed) => {
            if (confirmed) {
                this.deleteCustomer(customerId);
            }
        });
    },

    // ==================== CORE METHODS ====================
    createOrder(orderData) {
        this.orders.unshift(orderData);
        this.saveData();
        this.renderModule();
        
        // Update dashboard stats
        this.updateDashboardStats();
        
        ModalManager.alert({
            title: 'Order Created',
            message: `Order #${orderData.id} has been created successfully.`,
            details: `Total: ${this.formatCurrency(orderData.totalAmount)}`,
            icon: '✅',
            type: 'modal-success'
        });
    },

    addCustomer(customerData) {
        this.customers.unshift(customerData);
        this.saveData();
        this.renderModule();
        
        ModalManager.alert({
            title: 'Customer Added',
            message: `"${customerData.name}" has been added as a customer.`,
            icon: '✅',
            type: 'modal-success'
        });
    },

        deleteOrder(orderId) {
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.saveData();
        this.renderModule();
        
        this.updateDashboardStats();
        
        ModalManager.alert({
            title: 'Order Deleted',
            message: `Order #${orderId} has been deleted.`,
            icon: '🗑️',
            type: 'modal-success'
        });
    },

    deleteCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        this.customers = this.customers.filter(c => c.id !== customerId);
        this.saveData();
        this.renderModule();
        
        ModalManager.alert({
            title: 'Customer Deleted',
            message: `"${customer.name}" has been removed from customers.`,
            icon: '🗑️',
            type: 'modal-success'
        });
    },

    saveData() {
        localStorage.setItem('farm-orders', JSON.stringify(this.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.customers));
    },

    // ==================== REPORT METHODS ====================
    generateOrdersReport(reportId) {
        switch(reportId) {
            case 'sales-summary':
                this.showSalesSummaryReport();
                break;
            case 'customer-analysis':
                this.showCustomerAnalysisReport();
                break;
            case 'order-status':
                this.showOrderStatusReport();
                break;
            case 'recent-orders':
                this.showRecentOrdersReport();
                break;
        }
    },

    showSalesSummaryReport() {
        const stats = this.calculateStats();
        const monthlyData = this.getMonthlySalesData();
        
        const monthlyTable = monthlyData.map(month => `
            <tr>
                <td>${month.month}</td>
                <td>${month.orders}</td>
                <td>${this.formatCurrency(month.revenue)}</td>
            </tr>
        `).join('');
        
        const content = `
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Sales Summary Report</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Total Revenue</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-success);">
                            ${this.formatCurrency(stats.totalRevenue)}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Total Orders</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-text-primary);">
                            ${stats.totalOrders}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Active Customers</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-text-primary);">
                            ${stats.totalCustomers}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Pending Orders</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-warning);">
                            ${stats.pendingOrders}
                        </div>
                    </div>
                </div>
                
                <h5 style="margin-bottom: 12px; color: var(--color-text-primary);">Monthly Performance</h5>
                <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--color-bg-tertiary);">
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Month</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Orders</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyTable}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'sales-summary-report',
            title: 'Sales Summary Report',
            subtitle: 'Complete sales performance overview',
            size: 'modal-xl',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.print()">
                    Print Report
                </button>
                <button type="button" class="btn btn-success" onclick="this.exportReportAsCSV('sales-summary')">
                    Export as CSV
                </button>
            `,
            onOpen: () => {
                // Attach export function to the button
                const exportBtn = document.querySelector('[onclick*="exportReportAsCSV"]');
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => this.exportReportAsCSV('sales-summary'));
                }
            }
        });
    },

    showCustomerAnalysisReport() {
        const topCustomers = this.getTopCustomers();
        const customerTypes = this.getCustomerTypeDistribution();
        
        const topCustomersTable = topCustomers.map((customer, index) => `
            <tr>
                <td style="padding: 12px; text-align: center;">${index + 1}</td>
                <td style="padding: 12px;">${customer.name}</td>
                <td style="padding: 12px; text-align: center;">${customer.orderCount}</td>
                <td style="padding: 12px; text-align: right;">${this.formatCurrency(customer.totalSpent)}</td>
                <td style="padding: 12px; text-align: center;">${customer.averageOrderValue}</td>
            </tr>
        `).join('');
        
        const customerTypeTable = customerTypes.map(type => `
            <tr>
                <td style="padding: 12px;">${type.type.charAt(0).toUpperCase() + type.type.slice(1)}</td>
                <td style="padding: 12px; text-align: center;">${type.count}</td>
                <td style="padding: 12px; text-align: center;">${type.percentage}%</td>
                <td style="padding: 12px; text-align: right;">${this.formatCurrency(type.totalSpent)}</td>
            </tr>
        `).join('');
        
        const content = `
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Customer Analysis Report</h4>
                
                <div style="margin-bottom: 24px;">
                    <h5 style="margin-bottom: 12px; color: var(--color-text-primary);">Top Customers</h5>
                    <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--color-bg-tertiary);">
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Rank</th>
                                    <th style="padding: 12px; text-align: left; font-weight: 600;">Customer Name</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Orders</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600;">Total Spent</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Avg. Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topCustomersTable || '<tr><td colspan="5" style="padding: 40px; text-align: center; color: var(--color-text-tertiary);">No data</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h5 style="margin-bottom: 12px; color: var(--color-text-primary);">Customer Type Distribution</h5>
                    <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--color-bg-tertiary);">
                                    <th style="padding: 12px; text-align: left; font-weight: 600;">Customer Type</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Count</th>
                                    <th style="padding: 12px; text-align: center; font-weight: 600;">Percentage</th>
                                    <th style="padding: 12px; text-align: right; font-weight: 600;">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customerTypeTable || '<tr><td colspan="4" style="padding: 40px; text-align: center; color: var(--color-text-tertiary);">No data</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'customer-analysis-report',
            title: 'Customer Analysis Report',
            subtitle: 'Customer behavior and segmentation',
            size: 'modal-xl',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.print()">
                    Print Report
                </button>
                <button type="button" class="btn btn-success" onclick="this.exportReportAsCSV('customer-analysis')">
                    Export as CSV
                </button>
            `,
            onOpen: () => {
                const exportBtn = document.querySelector('[onclick*="exportReportAsCSV"]');
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => this.exportReportAsCSV('customer-analysis'));
                }
            }
        });
    },

    showOrderStatusReport() {
        const statusStats = this.getOrderStatusStats();
        const statusDistribution = this.getOrderStatusDistribution();
        
        const statusTable = statusDistribution.map(status => `
            <tr>
                <td style="padding: 12px;">
                    <span class="orders-status ${status.status}" style="font-size: 12px;">
                        ${this.formatStatus(status.status)}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">${status.count}</td>
                <td style="padding: 12px; text-align: center;">${status.percentage}%</td>
                <td style="padding: 12px; text-align: right;">${this.formatCurrency(status.totalAmount)}</td>
            </tr>
        `).join('');
        
        const content = `
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Order Status Report</h4>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px; text-align: center;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Pending</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-warning);">
                            ${statusStats.pending}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px; text-align: center;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Processing</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-info);">
                            ${statusStats.processing}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px; text-align: center;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Shipped</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">
                            ${statusStats.shipped}
                        </div>
                    </div>
                    <div style="padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px; text-align: center;">
                        <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">Completed</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--color-success);">
                            ${statusStats.completed}
                        </div>
                    </div>
                </div>
                
                <h5 style="margin-bottom: 12px; color: var(--color-text-primary);">Status Distribution</h5>
                <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--color-bg-tertiary);">
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Status</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Count</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Percentage</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${statusTable}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'order-status-report',
            title: 'Order Status Report',
            subtitle: 'Orders by status distribution',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.print()">
                    Print Report
                </button>
            `,
            onOpen: () => {
                // Attach export function
                const exportBtn = document.querySelector('[onclick*="exportReportAsCSV"]');
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => this.exportReportAsCSV('order-status'));
                }
            }
        });
    },

    showRecentOrdersReport() {
        const recentOrders = this.orders.slice(0, 10); // Last 10 orders
        
        const ordersTable = recentOrders.map(order => {
            const customer = this.getCustomerById(order.customerId);
            return `
                <tr>
                    <td style="padding: 12px; text-align: center;">#${order.id}</td>
                    <td style="padding: 12px;">${customer ? customer.name : 'Unknown'}</td>
                    <td style="padding: 12px;">${order.date}</td>
                    <td style="padding: 12px; text-align: center;">
                        <span class="orders-status ${order.status}" style="font-size: 11px;">
                            ${this.formatStatus(order.status)}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: right;">${this.formatCurrency(order.totalAmount)}</td>
                </tr>
            `;
        }).join('');
        
        const content = `
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Recent Orders Report</h4>
                <p style="color: var(--color-text-tertiary); margin-bottom: 20px;">
                    Showing the most recent ${recentOrders.length} orders out of ${this.orders.length} total.
                </p>
                
                <div style="border: 1px solid var(--color-border-light); border-radius: 8px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--color-bg-tertiary);">
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Order ID</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Customer</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Date</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Status</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ordersTable || '<tr><td colspan="5" style="padding: 40px; text-align: center; color: var(--color-text-tertiary);">No orders</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: 'recent-orders-report',
            title: 'Recent Orders Report',
            subtitle: 'Latest order activity',
            size: 'modal-xl',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.print()">
                    Print Report
                </button>
                <button type="button" class="btn btn-success" onclick="this.exportReportAsCSV('recent-orders')">
                    Export as CSV
                </button>
            `,
            onOpen: () => {
                const exportBtn = document.querySelector('[onclick*="exportReportAsCSV"]');
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => this.exportReportAsCSV('recent-orders'));
                }
            }
        });
    },

    // ==================== UTILITY METHODS ====================
    getMonthlySalesData() {
        // Group orders by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = {};
        
        this.orders.forEach(order => {
            const date = new Date(order.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthName,
                    orders: 0,
                    revenue: 0
                };
            }
            
            monthlyData[monthKey].orders++;
            monthlyData[monthKey].revenue += order.totalAmount;
        });
        
        // Convert to array and sort by date
        return Object.values(monthlyData).sort((a, b) => {
            const aDate = new Date(a.month.split(' ')[1], monthNames.indexOf(a.month.split(' ')[0]));
            const bDate = new Date(b.month.split(' ')[1], monthNames.indexOf(b.month.split(' ')[0]));
            return aDate - bDate;
        });
    },

    getTopCustomers(limit = 10) {
        const customerStats = {};
        
        // Calculate stats for each customer
        this.customers.forEach(customer => {
            const customerOrders = this.orders.filter(order => order.customerId === customer.id);
            const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            
            customerStats[customer.id] = {
                id: customer.id,
                name: customer.name,
                orderCount: customerOrders.length,
                totalSpent: totalSpent,
                averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
            };
        });
        
        // Convert to array and sort by total spent
        return Object.values(customerStats)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit)
            .map(customer => ({
                ...customer,
                averageOrderValue: this.formatCurrency(customer.averageOrderValue)
            }));
    },

    getCustomerTypeDistribution() {
        const typeStats = {};
        let totalCustomers = this.customers.length;
        
        this.customers.forEach(customer => {
            const type = customer.type || 'other';
            if (!typeStats[type]) {
                typeStats[type] = {
                    type: type,
                    count: 0,
                    totalSpent: 0
                };
            }
            
            typeStats[type].count++;
            
            // Calculate total spent by this customer type
            const customerOrders = this.orders.filter(order => order.customerId === customer.id);
            typeStats[type].totalSpent += customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        });
        
        // Convert to array and add percentages
        return Object.values(typeStats).map(stat => ({
            ...stat,
            percentage: totalCustomers > 0 ? Math.round((stat.count / totalCustomers) * 100) : 0,
            totalSpent: this.formatCurrency(stat.totalSpent)
        }));
    },

    getOrderStatusStats() {
        const stats = {
            pending: 0,
            processing: 0,
            shipped: 0,
            completed: 0,
            cancelled: 0
        };
        
        this.orders.forEach(order => {
            if (stats[order.status] !== undefined) {
                stats[order.status]++;
            }
        });
        
        return stats;
    },

    getOrderStatusDistribution() {
        const statusStats = {};
        let totalOrders = this.orders.length;
        
        this.orders.forEach(order => {
            const status = order.status || 'pending';
            if (!statusStats[status]) {
                statusStats[status] = {
                    status: status,
                    count: 0,
                    totalAmount: 0
                };
            }
            
            statusStats[status].count++;
            statusStats[status].totalAmount += order.totalAmount;
        });
        
        // Convert to array and add percentages
        return Object.values(statusStats).map(stat => ({
            ...stat,
            percentage: totalOrders > 0 ? Math.round((stat.count / totalOrders) * 100) : 0,
            totalAmount: this.formatCurrency(stat.totalAmount)
        }));
    },

    exportOrdersData() {
        const data = {
            orders: this.orders,
            customers: this.customers,
            products: this.products,
            exportDate: new Date().toISOString(),
            stats: this.calculateStats()
        };
        
        // Create JSON string
        const jsonData = JSON.stringify(data, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-orders-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ModalManager.alert({
            title: 'Data Exported',
            message: 'All orders and customer data has been exported.',
            details: `Exported ${this.orders.length} orders and ${this.customers.length} customers.`,
            icon: '📤',
            type: 'modal-success'
        });
    },

    exportReportAsCSV(reportType) {
        let csvData = [];
        let filename = '';
        
        switch(reportType) {
            case 'sales-summary':
                const monthlyData = this.getMonthlySalesData();
                csvData = monthlyData.map(month => [
                    month.month,
                    month.orders,
                    month.revenue
                ]);
                csvData.unshift(['Month', 'Orders', 'Revenue']);
                filename = 'sales-summary.csv';
                break;
                
            case 'customer-analysis':
                const topCustomers = this.getTopCustomers(20);
                csvData = topCustomers.map(customer => [
                    customer.name,
                    customer.orderCount,
                    customer.totalSpent.replace('$', ''),
                    customer.averageOrderValue.replace('$', '')
                ]);
                csvData.unshift(['Customer Name', 'Order Count', 'Total Spent', 'Average Order Value']);
                filename = 'customer-analysis.csv';
                break;
                
            case 'order-status':
                const statusDistribution = this.getOrderStatusDistribution();
                csvData = statusDistribution.map(status => [
                    status.status.charAt(0).toUpperCase() + status.status.slice(1),
                    status.count,
                    status.percentage + '%',
                    status.totalAmount.replace('$', '')
                ]);
                csvData.unshift(['Status', 'Count', 'Percentage', 'Total Amount']);
                filename = 'order-status.csv';
                break;
                
            case 'recent-orders':
                const recentOrders = this.orders.slice(0, 50);
                csvData = recentOrders.map(order => {
                    const customer = this.getCustomerById(order.customerId);
                    return [
                        order.id,
                        customer ? customer.name : 'Unknown',
                        order.date,
                        order.status,
                        order.totalAmount,
                        order.items.length
                    ];
                });
                csvData.unshift(['Order ID', 'Customer', 'Date', 'Status', 'Total Amount', 'Item Count']);
                filename = 'recent-orders.csv';
                break;
        }
        
        // Convert to CSV string
        const csvString = csvData.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create download link
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    printInvoice(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const customer = this.getCustomerById(order.customerId);
        
        // Create print-friendly content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${orderId}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 30px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .invoice-table th { background-color: #f5f5f5; font-weight: bold; }
                    .invoice-total { text-align: right; font-size: 18px; font-weight: bold; }
                    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <h1>Farm Management System</h1>
                    <h2>Invoice #${orderId}</h2>
                    <p>Date: ${order.date}</p>
                </div>
                
                <div class="invoice-details">
                    <h3>Customer Information</h3>
                    <p><strong>${customer ? customer.name : 'Unknown Customer'}</strong></p>
                    ${customer?.contact ? `<p>Phone: ${customer.contact}</p>` : ''}
                    ${customer?.email ? `<p>Email: ${customer.email}</p>` : ''}
                    ${customer?.address ? `<p>Address: ${customer.address}</p>` : ''}
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>${this.formatCurrency(item.price)}</td>
                                <td>${this.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="invoice-total">
                    <p>Total Amount: ${this.formatCurrency(order.totalAmount)}</p>
                </div>
                
                ${order.notes ? `
                    <div class="notes">
                        <h3>Order Notes</h3>
                        <p>${order.notes}</p>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    },

    updateDashboardStats() {
        // Update the global dashboard stats if they exist
        if (window.dashboardModule && typeof window.dashboardModule.updateOrdersStats === 'function') {
            const stats = this.calculateStats();
            window.dashboardModule.updateOrdersStats(stats);
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
    },

    cleanup() {
        // Cleanup event listeners and resources if needed
        this.initialized = false;
        console.log('Orders module cleaned up');
    }
};

// Export module to global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrdersModule;
} else {
    window.OrdersModule = OrdersModule;
}

console.log('✅ Orders module loaded successfully');
