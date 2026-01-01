// modules/orders.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [
        { id: 'eggs', name: 'Fresh Eggs', price: 0.25 },
        { id: 'broilers', name: 'Broiler Chickens', price: 8.50 },
        { id: 'layers', name: 'Layer Hens', price: 12.00 }
    ],
    element: null,

    initialize() {
        console.log('📋 Initializing Orders Management...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Orders Management initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
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
                date: '2024-03-15',
                items: [
                    { productId: 'eggs', productName: 'Fresh Eggs', quantity: 50, price: 0.25 }
                ],
                totalAmount: 12.50,
                status: 'completed',
                notes: 'Regular weekly order'
            },
            {
                id: 2,
                customerId: 2,
                date: '2024-03-14',
                items: [
                    { productId: 'broilers', productName: 'Broiler Chickens', quantity: 10, price: 8.50 }
                ],
                totalAmount: 85.00,
                status: 'pending',
                notes: 'New restaurant client'
            }
        ];
    },

    getDemoCustomers() {
        return [
            { id: 1, name: 'Local Market', contact: '555-0123', address: '123 Main St', email: 'market@local.com' },
            { id: 2, name: 'Restaurant A', contact: '555-0456', address: '456 Oak Ave', email: 'orders@restauranta.com' },
            { id: 3, name: 'Grocery Store B', contact: '555-0789', address: '789 Pine St', email: 'produce@grocerystore.com' }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Orders Management</h1>
                    <p class="module-subtitle">Manage customer orders and deliveries</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="create-order-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">New Order</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Create new order</span>
                    </button>
                    <button class="quick-action-btn" id="manage-customers-btn">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                    <button class="quick-action-btn" id="view-orders-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">All Orders</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View all orders</span>
                    </button>
                    <button class="quick-action-btn" id="add-customer-btn">
                        <div style="font-size: 32px;">👤</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Customer</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new customer</span>
                    </button>
                </div>

                <!-- Order Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.orders.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(this.getTotalRevenue())}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.customers.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Customers</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.pendingOrders}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Pending</div>
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
                                            <option value="${customer.id}">${customer.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Order Date</label>
                                    <input type="date" class="form-input" id="order-date" required>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Order Items</label>
                                <div id="order-items">
                                    <div class="order-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px;">
                                        <select class="form-input product-select" required>
                                            <option value="">Select Product</option>
                                            ${this.products.map(product => `
                                                <option value="${product.id}" data-price="${product.price}">${product.name} - ${this.formatCurrency(product.price)}</option>
                                            `).join('')}
                                        </select>
                                        <input type="number" class="form-input quantity-input" placeholder="Qty" min="1" value="1" required>
                                        <input type="number" class="form-input price-input" placeholder="Price" step="0.01" min="0" required>
                                        <button type="button" class="btn-outline remove-item" style="padding: 8px 12px;">✕</button>
                                    </div>
                                </div>
                                <button type="button" class="btn-outline" id="add-item-btn" style="margin-top: 8px;">+ Add Item</button>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Status</label>
                                <select class="form-input" id="order-status">
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Total Amount</label>
                                <input type="number" class="form-input" id="order-total" step="0.01" min="0" readonly style="font-weight: bold; font-size: 16px;">
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" id="order-notes" rows="2" placeholder="Order notes, special instructions..."></textarea>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Create Order</button>
                                <button type="button" class="btn-outline" id="cancel-order-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Add Customer Form -->
                <div id="customer-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add New Customer</h3>
                        <form id="customer-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Customer Name</label>
                                    <input type="text" class="form-input" id="customer-name" required>
                                </div>
                                <div>
                                    <label class="form-label">Contact Phone</label>
                                    <input type="tel" class="form-input" id="customer-phone" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-input" id="customer-email">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Address</label>
                                <textarea class="form-input" id="customer-address" rows="2" placeholder="Full address..."></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Add Customer</button>
                                <button type="button" class="btn-outline" id="cancel-customer-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Orders</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-outline" id="export-orders-btn">Export</button>
                            <button class="btn-primary" id="show-order-form">New Order</button>
                        </div>
                    </div>
                    <div id="orders-list">
                        ${this.renderOrdersList()}
                    </div>
                </div>

                <!-- Customers List -->
                <!-- <div class="glass-card" style="padding: 24px; margin-top: 24px;"> -->
                <div class="glass-card" id="customers-section" style="padding: 24px; margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Customers</h3>
                        <button class="btn-primary" id="show-customer-form">Add Customer</button>
                    </div>
                    <div id="customers-list">
                        ${this.renderCustomersList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.calculateTotal(); // Initialize total
    },

    calculateStats() {
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;
        
        return {
            totalOrders: this.orders.length,
            pendingOrders: pendingOrders,
            completedOrders: completedOrders,
            totalRevenue: this.getTotalRevenue()
        };
    },

    getTotalRevenue() {
        return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    },

    renderOrdersList() {
        if (this.orders.length === 0) {
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
                ${this.orders.map(order => {
                    const customer = this.customers.find(c => c.id === order.customerId);
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary);">
                                    Order #${order.id} - ${customer?.name || 'Unknown Customer'}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${order.date} • ${order.items.length} item${order.items.length > 1 ? 's' : ''}
                                </div>
                                ${order.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${order.notes}</div>` : ''}
                            </div>
                            <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
                                <div>
                                    <div style="font-weight: bold; color: var(--text-primary);">${this.formatCurrency(order.totalAmount)}</div>
                                    <div style="font-size: 12px; padding: 2px 8px; border-radius: 8px; background: ${this.getStatusColor(order.status)}20; color: ${this.getStatusColor(order.status)}; margin-top: 4px;">
                                        ${this.formatStatus(order.status)}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button class="btn-icon edit-order" data-id="${order.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);" title="Edit Order">
                                        ✏️
                                    </button>
                                    <button class="btn-icon delete-order" data-id="${order.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);" title="Delete Order">
                                        🗑️
                                    </button>
                                </div>
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
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">👥</div>
                    <div style="font-size: 14px;">No customers</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Add your first customer</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.customers.map(customer => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${customer.name}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${customer.contact}</div>
                            ${customer.email ? `<div style="font-size: 12px; color: var(--text-secondary);">${customer.email}</div>` : ''}
                            ${customer.address ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${customer.address}</div>` : ''}
                        </div>
                        <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
                            <div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${this.getCustomerOrderCount(customer.id)} orders
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">
                                    ${this.formatCurrency(this.getCustomerTotal(customer.id))} total
                                </div>
                            </div>
                            <div style="display: flex; gap: 4px;">
                                <button class="btn-icon edit-customer" data-id="${customer.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);" title="Edit Customer">
                                    ✏️
                                </button>
                                <button class="btn-icon delete-customer" data-id="${customer.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);" title="Delete Customer">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getCustomerOrderCount(customerId) {
        return this.orders.filter(order => order.customerId === customerId).length;
    },

    getCustomerTotal(customerId) {
        return this.orders
            .filter(order => order.customerId === customerId)
            .reduce((sum, order) => sum + order.totalAmount, 0);
    },

    getStatusColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'confirmed': '#3b82f6',
            'shipped': '#8b5cf6',
            'completed': '#22c55e',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    },

    formatStatus(status) {
        const statuses = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'shipped': 'Shipped',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statuses[status] || status;
    },

    setupEventListeners() {
        // Order form buttons
        document.getElementById('show-order-form')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('create-order-btn')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('cancel-order-form')?.addEventListener('click', () => this.hideOrderForm());
        
        // Customer form buttons
        document.getElementById('show-customer-form')?.addEventListener('click', () => this.showCustomerForm());
        document.getElementById('add-customer-btn')?.addEventListener('click', () => this.showCustomerForm());
        document.getElementById('cancel-customer-form')?.addEventListener('click', () => this.hideCustomerForm());
        
        // Action buttons
        document.getElementById('manage-customers-btn')?.addEventListener('click', () => this.showCustomersSection());
        document.getElementById('view-orders-btn')?.addEventListener('click', () => this.showAllOrders());
        document.getElementById('export-orders-btn')?.addEventListener('click', () => this.exportOrders());
        
        // Form submissions
        document.getElementById('order-form')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('customer-form')?.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        
        // Add item button
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.addOrderItem());
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        if (orderDate) orderDate.value = today;
        
        // Calculate total when items change
        this.setupTotalCalculation();
        
        // Delete and edit handlers
        this.setupActionHandlers();
        
        // Hover effects
        this.setupHoverEffects();
    },

    showOrderForm() {
        document.getElementById('order-form-container').classList.remove('hidden');
        document.getElementById('customer-form-container').classList.add('hidden');
        document.getElementById('order-form').reset();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('order-date').value = today;
        
        document.getElementById('order-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideOrderForm() {
        document.getElementById('order-form-container').classList.add('hidden');
    },

    showCustomerForm() {
        document.getElementById('customer-form-container').classList.remove('hidden');
        document.getElementById('order-form-container').classList.add('hidden');
        document.getElementById('customer-form').reset();
        
        document.getElementById('customer-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideCustomerForm() {
        document.getElementById('customer-form-container').classList.add('hidden');
    },

 showCustomersSection() {
    const customersSection = document.getElementById('customers-section');
    if (customersSection) {
        customersSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
        
        // Add visual highlight
        customersSection.style.transition = 'all 0.3s ease';
        customersSection.style.boxShadow = '0 0 0 3px #3b82f6';
        
        setTimeout(() => {
            customersSection.style.boxShadow = 'none';
        }, 2000);
    }
    
    if (window.coreModule) {
        window.coreModule.showNotification('Showing customers section', 'info');
    }
},
    
    showAllOrders() {
        const ordersSection = document.querySelector('.glass-card:nth-last-of-type(2)');
        if (ordersSection) {
            ordersSection.scrollIntoView({ behavior: 'smooth' });
            ordersSection.style.boxShadow = '0 0 0 2px #3b82f6';
            setTimeout(() => {
                ordersSection.style.boxShadow = 'none';
            }, 2000);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification('Showing all orders', 'info');
        }
    },

    addOrderItem() {
        const itemsContainer = document.getElementById('order-items');
        const newItem = document.createElement('div');
        newItem.className = 'order-item';
        newItem.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px;">
                <select class="form-input product-select" required>
                    <option value="">Select Product</option>
                    ${this.products.map(product => `
                        <option value="${product.id}" data-price="${product.price}">${product.name} - ${this.formatCurrency(product.price)}</option>
                    `).join('')}
                </select>
                <input type="number" class="form-input quantity-input" placeholder="Qty" min="1" value="1" required>
                <input type="number" class="form-input price-input" placeholder="Price" step="0.01" min="0" required>
                <button type="button" class="btn-outline remove-item" style="padding: 8px 12px;">✕</button>
            </div>
        `;
        itemsContainer.appendChild(newItem);
        
        // Add event listeners to new item
        const removeBtn = newItem.querySelector('.remove-item');
        const quantityInput = newItem.querySelector('.quantity-input');
        const priceInput = newItem.querySelector('.price-input');
        const productSelect = newItem.querySelector('.product-select');
        
        removeBtn.addEventListener('click', () => {
            newItem.remove();
            this.calculateTotal();
        });
        
        quantityInput.addEventListener('input', () => this.calculateTotal());
        priceInput.addEventListener('input', () => this.calculateTotal());
        
        productSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.dataset.price;
            if (price && priceInput.value === '') {
                priceInput.value = price;
                this.calculateTotal();
            }
        });
    },

    setupTotalCalculation() {
        // Add event listeners to existing inputs
        document.querySelectorAll('.quantity-input, .price-input').forEach(input => {
            input.addEventListener('input', () => this.calculateTotal());
        });
        
        // Add product selection listeners
        document.querySelectorAll('.product-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const price = selectedOption.dataset.price;
                const priceInput = e.target.closest('.order-item').querySelector('.price-input');
                if (price && priceInput.value === '') {
                    priceInput.value = price;
                    this.calculateTotal();
                }
            });
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.order-item').remove();
                this.calculateTotal();
            });
        });
    },

    calculateTotal() {
        let total = 0;
        document.querySelectorAll('.order-item').forEach(item => {
            const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(item.querySelector('.price-input').value) || 0;
            total += quantity * price;
        });
        
        const totalInput = document.getElementById('order-total');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
            totalInput.style.color = total > 0 ? '#22c55e' : '#6b7280';
        }
    },

    setupActionHandlers() {
        // Handle order actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-order')) {
                const id = parseInt(e.target.closest('.delete-order').dataset.id);
                this.deleteOrder(id);
            }
            else if (e.target.closest('.edit-order')) {
                const id = parseInt(e.target.closest('.edit-order').dataset.id);
                this.editOrder(id);
            }
            else if (e.target.closest('.delete-customer')) {
                const id = parseInt(e.target.closest('.delete-customer').dataset.id);
                this.deleteCustomer(id);
            }
            else if (e.target.closest('.edit-customer')) {
                const id = parseInt(e.target.closest('.edit-customer').dataset.id);
                this.editCustomer(id);
            }
        });
    },

    setupHoverEffects() {
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

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const customerId = parseInt(document.getElementById('order-customer').value);
        const date = document.getElementById('order-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        
        // Collect order items
        const items = [];
        document.querySelectorAll('.order-item').forEach(item => {
            const productSelect = item.querySelector('.product-select');
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            if (productSelect.value && quantityInput.value && priceInput.value) {
                items.push({
                    productId: productSelect.value,
                    productName: productSelect.options[productSelect.selectedIndex].text.split(' - ')[0],
                    quantity: parseFloat(quantityInput.value),
                    price: parseFloat(priceInput.value)
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item to the order.');
            return;
        }
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const orderData = {
            id: Date.now(),
            customerId: customerId,
            date: date,
            items: items,
            totalAmount: totalAmount,
            status: status,
            notes: notes
        };

        this.orders.unshift(orderData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderData.id} created successfully!`, 'success');
        }
    },

    handleCustomerSubmit(e) {
        e.preventDefault();
        
        const customerData = {
            id: Date.now(),
            name: document.getElementById('customer-name').value,
            contact: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value,
            address: document.getElementById('customer-address').value
        };

        this.customers.push(customerData);
        this.saveData();
        this.renderModule();
        this.hideCustomerForm();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${customerData.name}" added successfully!`, 'success');
        }
    },

    deleteOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (!order) return;

        if (confirm(`Are you sure you want to delete order #${id}? This cannot be undone.`)) {
            this.orders = this.orders.filter(o => o.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Order deleted successfully!', 'success');
            }
        }
    },

    editOrder(id) {
        // For now, just show a message - full edit functionality can be added later
        if (window.coreModule) {
            window.coreModule.showNotification('Edit functionality coming soon!', 'info');
        }
    },

    deleteCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        // Check if customer has orders
        const customerOrders = this.orders.filter(o => o.customerId === id);
        if (customerOrders.length > 0) {
            alert(`Cannot delete customer "${customer.name}" because they have ${customerOrders.length} order(s). Delete their orders first.`);
            return;
        }

        if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
            this.customers = this.customers.filter(c => c.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Customer deleted successfully!', 'success');
            }
        }
    },

    editCustomer(id) {
        // For now, just show a message - full edit functionality can be added later
        if (window.coreModule) {
            window.coreModule.showNotification('Edit customer functionality coming soon!', 'info');
        }
    },

    exportOrders() {
        const dataStr = JSON.stringify(this.orders, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farm-orders-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Orders exported successfully!', 'success');
        }
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
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders Management module registered');
}

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'orders.js'; // e.g., 'dashboard'
    const MODULE_OBJECT = OrdersModule; // e.g., DashboardModule
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();

// ==================== COMPLETE ORDERS EDIT FUNCTIONALITY ====================
(function() {
    'use strict';
    
    console.log('📦 LOADING ORDERS EDIT FIX...');
    
    // Override the editOrder method to provide full functionality
    const originalEditOrder = OrdersModule.editOrder;
    OrdersModule.editOrder = function(orderId) {
        console.log('📝 EDITING ORDER:', orderId);
        
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        // Get customer
        const customer = this.customers.find(c => c.id === order.customerId);
        
        // Show order form
        this.showOrderForm();
        
        // Wait for form to render, then populate
        setTimeout(() => {
            const form = document.getElementById('order-form');
            if (!form) return;
            
            // Change title
            const formContainer = document.getElementById('order-form-container');
            const title = formContainer.querySelector('h3');
            if (title) title.textContent = 'Edit Order';
            
            // Populate form
            form.querySelector('#order-customer').value = order.customerId;
            form.querySelector('#order-date').value = order.date;
            form.querySelector('#order-status').value = order.status;
            form.querySelector('#order-notes').value = order.notes || '';
            form.querySelector('#order-total').value = order.totalAmount.toFixed(2);
            
            // Clear existing items
            const itemsContainer = document.getElementById('order-items');
            itemsContainer.innerHTML = '';
            
            // Add order items
            order.items.forEach((item, index) => {
                const newItem = document.createElement('div');
                newItem.className = 'order-item';
                newItem.innerHTML = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px;">
                        <select class="form-input product-select" required>
                            <option value="">Select Product</option>
                            ${this.products.map(product => `
                                <option value="${product.id}" data-price="${product.price}" ${product.id === item.productId ? 'selected' : ''}>
                                    ${product.name} - ${this.formatCurrency(product.price)}
                                </option>
                            `).join('')}
                        </select>
                        <input type="number" class="form-input quantity-input" placeholder="Qty" min="1" value="${item.quantity}" required>
                        <input type="number" class="form-input price-input" placeholder="Price" step="0.01" min="0" value="${item.price}" required>
                        <button type="button" class="btn-outline remove-item" style="padding: 8px 12px;">✕</button>
                    </div>
                `;
                itemsContainer.appendChild(newItem);
                
                // Add event listeners
                const removeBtn = newItem.querySelector('.remove-item');
                const quantityInput = newItem.querySelector('.quantity-input');
                const priceInput = newItem.querySelector('.price-input');
                const productSelect = newItem.querySelector('.product-select');
                
                removeBtn.addEventListener('click', () => {
                    newItem.remove();
                    this.calculateTotal();
                });
                
                quantityInput.addEventListener('input', () => this.calculateTotal());
                priceInput.addEventListener('input', () => this.calculateTotal());
                
                productSelect.addEventListener('change', (e) => {
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const price = selectedOption.dataset.price;
                    if (price && priceInput.value === item.price.toString()) {
                        priceInput.value = price;
                        this.calculateTotal();
                    }
                });
            });
            
            // Update submit button to handle edit
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Order';
                
                // Remove old submit handler
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                
                newSubmitBtn.onclick = (e) => {
                    e.preventDefault();
                    this.updateOrder(orderId);
                };
            }
            
            // Add cancel edit button
            const cancelBtn = form.querySelector('#cancel-order-form');
            if (cancelBtn) {
                const cancelEditBtn = document.createElement('button');
                cancelEditBtn.type = 'button';
                cancelEditBtn.className = 'btn-outline';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.style.marginLeft = '8px';
                cancelEditBtn.onclick = () => {
                    this.hideOrderForm();
                    // Reset form for new orders
                    setTimeout(() => {
                        const form = document.getElementById('order-form');
                        const submitBtn = form.querySelector('button[type="submit"]');
                        const title = document.querySelector('#order-form-container h3');
                        if (submitBtn) submitBtn.textContent = 'Create Order';
                        if (title) title.textContent = 'Create New Order';
                    }, 100);
                };
                
                cancelBtn.parentNode.appendChild(cancelEditBtn);
            }
            
            console.log('✅ Order form populated for editing');
            
        }, 100);
    };
    
    // Add updateOrder method
    OrdersModule.updateOrder = function(orderId) {
        console.log('💾 UPDATING ORDER:', orderId);
        
        const form = document.getElementById('order-form');
        if (!form) return;
        
        const customerId = parseInt(form.querySelector('#order-customer').value);
        const date = form.querySelector('#order-date').value;
        const status = form.querySelector('#order-status').value;
        const notes = form.querySelector('#order-notes').value;
        
        // Collect order items
        const items = [];
        document.querySelectorAll('.order-item').forEach(item => {
            const productSelect = item.querySelector('.product-select');
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            if (productSelect.value && quantityInput.value && priceInput.value) {
                items.push({
                    productId: productSelect.value,
                    productName: productSelect.options[productSelect.selectedIndex].text.split(' - ')[0],
                    quantity: parseFloat(quantityInput.value),
                    price: parseFloat(priceInput.value)
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item to the order.');
            return;
        }
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        // Find and update the order
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex] = {
                ...this.orders[orderIndex],
                customerId,
                date,
                items,
                totalAmount,
                status,
                notes
            };
            
            this.saveData();
            this.renderModule();
            this.hideOrderForm();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Order #${orderId} updated successfully!`, 'success');
            }
            
            // Reset form for new orders
            setTimeout(() => {
                const form = document.getElementById('order-form');
                const submitBtn = form.querySelector('button[type="submit"]');
                const title = document.querySelector('#order-form-container h3');
                if (submitBtn) submitBtn.textContent = 'Create Order';
                if (title) title.textContent = 'Create New Order';
            }, 100);
        }
    };
    
    // Also fix edit customer
    OrdersModule.editCustomer = function(customerId) {
        console.log('👤 EDITING CUSTOMER:', customerId);
        
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            this.showNotification('Customer not found', 'error');
            return;
        }
        
        // Show customer form
        this.showCustomerForm();
        
        // Wait for form to render, then populate
        setTimeout(() => {
            const form = document.getElementById('customer-form');
            if (!form) return;
            
            // Change title
            const formContainer = document.getElementById('customer-form-container');
            const title = formContainer.querySelector('h3');
            if (title) title.textContent = 'Edit Customer';
            
            // Populate form
            form.querySelector('#customer-name').value = customer.name;
            form.querySelector('#customer-phone').value = customer.contact;
            form.querySelector('#customer-email').value = customer.email || '';
            form.querySelector('#customer-address').value = customer.address || '';
            
            // Update submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Customer';
                
                // Remove old submit handler
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                
                newSubmitBtn.onclick = (e) => {
                    e.preventDefault();
                    this.updateCustomer(customerId);
                };
            }
            
            // Add cancel edit button
            const cancelBtn = form.querySelector('#cancel-customer-form');
            if (cancelBtn) {
                const cancelEditBtn = document.createElement('button');
                cancelEditBtn.type = 'button';
                cancelEditBtn.className = 'btn-outline';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.style.marginLeft = '8px';
                cancelEditBtn.onclick = () => {
                    this.hideCustomerForm();
                    // Reset form
                    setTimeout(() => {
                        const form = document.getElementById('customer-form');
                        const submitBtn = form.querySelector('button[type="submit"]');
                        const title = document.querySelector('#customer-form-container h3');
                        if (submitBtn) submitBtn.textContent = 'Add Customer';
                        if (title) title.textContent = 'Add New Customer';
                    }, 100);
                };
                
                cancelBtn.parentNode.appendChild(cancelEditBtn);
            }
            
        }, 100);
    };
    
    // Add updateCustomer method
    OrdersModule.updateCustomer = function(customerId) {
        console.log('💾 UPDATING CUSTOMER:', customerId);
        
        const form = document.getElementById('customer-form');
        if (!form) return;
        
        const customerData = {
            name: form.querySelector('#customer-name').value,
            contact: form.querySelector('#customer-phone').value,
            email: form.querySelector('#customer-email').value,
            address: form.querySelector('#customer-address').value
        };
        
        // Find and update customer
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            this.customers[customerIndex] = {
                id: customerId,
                ...customerData
            };
            
            // Also update customerId in orders
            this.orders.forEach(order => {
                if (order.customerId === customerId) {
                    // If customer name changed, we might want to update something
                    // For now, just keep the ID reference
                }
            });
            
            this.saveData();
            this.renderModule();
            this.hideCustomerForm();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Customer "${customerData.name}" updated successfully!`, 'success');
            }
            
            // Reset form
            setTimeout(() => {
                const form = document.getElementById('customer-form');
                const submitBtn = form.querySelector('button[type="submit"]');
                const title = document.querySelector('#customer-form-container h3');
                if (submitBtn) submitBtn.textContent = 'Add Customer';
                if (title) title.textContent = 'Add New Customer';
            }, 100);
        }
    };
    
    // Helper function to show notification
    OrdersModule.showNotification = function(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(`${type.toUpperCase()}: ${message}`);
        }
    };
    
    // Make edit buttons more clickable
    function enhanceEditButtons() {
        const editOrderButtons = document.querySelectorAll('.edit-order');
        const editCustomerButtons = document.querySelectorAll('.edit-customer');
        
        editOrderButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.2)';
                btn.style.color = '#3b82f6';
                btn.style.background = 'rgba(59, 130, 246, 0.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.color = '';
                btn.style.background = '';
            });
        });
        
        editCustomerButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.2)';
                btn.style.color = '#22c55e';
                btn.style.background = 'rgba(34, 197, 94, 0.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.color = '';
                btn.style.background = '';
            });
        });
    }
    
    // Run enhancement when module loads
    setTimeout(() => {
        enhanceEditButtons();
        
        // Also run when switching to orders
        document.addEventListener('click', function(e) {
            if (e.target.closest('[href*="#orders"], [onclick*="orders"]')) {
                setTimeout(enhanceEditButtons, 500);
            }
        });
    }, 1000);
    
    console.log('✅ Orders edit functionality loaded');
    
})();
