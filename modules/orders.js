// modules/orders.js - COMPLETE VERSION WITH DATA BROADCASTER (CSP COMPLIANT)
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [
        { id: 'eggs', name: 'Fresh Eggs', price: 0.25 },
        { id: 'broilers', name: 'Broiler Chickens', price: 8.50 },
        { id: 'layers', name: 'Layer Hens', price: 12.00 },
        { id: 'tomatoes', name: 'Tomatoes', price: 1.75 },
        { id: 'cucumbers', name: 'Cucumbers', price: 1.50 }
    ],
    element: null,
    broadcaster: null,

    initialize() {
        console.log('📋 Initializing Orders Management...');
        
        // ✅ Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ Get Broadcaster instance
        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Orders module connected to Data Broadcaster');
        } else {
            console.log('⚠️ Broadcaster not available, using local methods');
        }

        // ✅ Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule('orders', this.element, this);
        }

        this.loadData();
        this.renderModule();
        
        this.initialized = true;
        
        console.log('✅ Orders Management initialized with StyleManager & Data Broadcaster');
        return true;
    },

    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        // Listen for inventory updates that might affect orders
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Orders received inventory update:', data);
            this.checkInventoryForOrders(data);
        });
        
        // Listen for production updates
        this.broadcaster.on('production-updated', (data) => {
            console.log('📡 Orders received production update:', data);
            this.checkProductionForOrders(data);
        });
        
        // Listen for sales records
        this.broadcaster.on('sale-recorded', (data) => {
            console.log('📡 Orders received sale record:', data);
            this.syncWithSale(data);
        });
    },

    broadcastOrdersLoaded() {
        if (!this.broadcaster) return;
        
        const orderStats = this.calculateStats();
        
        this.broadcaster.broadcast('orders-loaded', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            stats: orderStats,
            totalOrders: this.orders.length,
            totalCustomers: this.customers.length,
            totalRevenue: orderStats.totalRevenue,
            pendingOrders: orderStats.pendingOrders
        });
    },

    broadcastOrderCreated(order) {
        if (!this.broadcaster) return;
        
        const customer = this.customers.find(c => c.id === order.customerId);
        
        this.broadcaster.broadcast('order-created', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: order.id,
            customerId: order.customerId,
            customerName: customer?.name || 'Unknown',
            totalAmount: order.totalAmount,
            items: order.items,
            status: order.status,
            date: order.date
        });
        
        // Also broadcast sales update if order is completed
        if (order.status === 'completed') {
            this.broadcaster.broadcast('sale-completed', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                orderId: order.id,
                amount: order.totalAmount,
                items: order.items,
                customer: customer?.name || 'Unknown'
            });
        }
    },

    broadcastOrderUpdated(order) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('order-updated', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: order.id,
            status: order.status,
            totalAmount: order.totalAmount
        });
        
        // If status changed to completed, broadcast sale
        if (order.status === 'completed') {
            const customer = this.customers.find(c => c.id === order.customerId);
            this.broadcaster.broadcast('sale-completed', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                orderId: order.id,
                amount: order.totalAmount,
                customer: customer?.name || 'Unknown'
            });
        }
    },

    broadcastOrderDeleted(orderId) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('order-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: orderId
        });
    },

    broadcastCustomerAdded(customer) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-added', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name,
            contact: customer.contact
        });
    },

    broadcastCustomerUpdated(customer) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-updated', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name
        });
    },

    broadcastCustomerDeleted(customerId, customerName) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customerId,
            customerName: customerName
        });
    },

    checkInventoryForOrders(inventoryData) {
        if (!inventoryData || !inventoryData.items) return;
        
        // Check if pending orders can be fulfilled with current inventory
        const pendingOrders = this.orders.filter(o => o.status === 'pending');
        let canFulfillOrders = false;
        
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
                // Check if we have enough inventory for this item
                const inventoryItem = inventoryData.items.find(
                    inv => inv.productId === item.productId
                );
                
                if (inventoryItem && inventoryItem.quantity >= item.quantity) {
                    canFulfillOrders = true;
                    console.log(`✅ Inventory sufficient for order #${order.id}, item: ${item.productName}`);
                }
            });
        });
        
        if (canFulfillOrders && this.broadcaster) {
            this.broadcaster.broadcast('orders-fulfillable', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                pendingOrders: pendingOrders.length
            });
        }
    },

    checkProductionForOrders(productionData) {
        if (!productionData) return;
        
        console.log('Production data received for orders:', productionData);
    },

    syncWithSale(saleData) {
        if (!saleData) return;
        
        const existingOrder = this.orders.find(order => 
            order.totalAmount === saleData.amount && 
            order.status === 'completed'
        );
        
        if (!existingOrder) {
            console.log('Sales record not linked to existing order');
        }
    },

    getLiveStats() {
        const stats = this.calculateStats();
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('orders-stats', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                stats: stats
            });
        }
        
        return stats;
    },

    saveData() {
        localStorage.setItem('farm-orders', JSON.stringify(this.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.customers));
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('orders-data-saved', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                ordersCount: this.orders.length,
                customersCount: this.customers.length
            });
        }
    },

    loadData() {
        const savedOrders = localStorage.getItem('farm-orders');
        const savedCustomers = localStorage.getItem('farm-customers');
        
        this.orders = savedOrders ? JSON.parse(savedOrders) : this.getDemoOrders();
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : this.getDemoCustomers();
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('orders-data-loaded', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                ordersCount: this.orders.length,
                customersCount: this.customers.length
            });
        }
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

    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
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
                    <button class="quick-action-btn" id="create-order-btn" data-action="create-order">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">New Order</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Create new order</span>
                    </button>
                    <button class="quick-action-btn" id="manage-customers-btn" data-action="manage-customers">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                    <button class="quick-action-btn" id="view-orders-btn" data-action="view-orders">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">All Orders</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View all orders</span>
                    </button>
                    <button class="quick-action-btn" id="add-customer-btn" data-action="add-customer">
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
                                        <button type="button" class="btn-outline remove-item" data-action="remove-item" style="padding: 8px 12px;">✕</button>
                                    </div>
                                </div>
                                <button type="button" class="btn-outline" id="add-item-btn" data-action="add-item">+ Add Item</button>
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
                                <button type="submit" class="btn-primary" data-action="submit-order">Create Order</button>
                                <button type="button" class="btn-outline" data-action="cancel-order-form">Cancel</button>
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
                                <button type="submit" class="btn-primary" data-action="submit-customer">Add Customer</button>
                                <button type="button" class="btn-outline" data-action="cancel-customer-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Orders</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-outline" data-action="export-orders">Export</button>
                            <button class="btn-primary" data-action="show-order-form">New Order</button>
                        </div>
                    </div>
                    <div id="orders-list">
                        ${this.renderOrdersList()}
                    </div>
                </div>

                <!-- Customers List -->
                <div class="glass-card" id="customers-section" style="padding: 24px; margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Customers</h3>
                        <button class="btn-primary" data-action="show-customer-form">Add Customer</button>
                    </div>
                    <div id="customers-list">
                        ${this.renderCustomersList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.calculateTotal();
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        if (orderDate) orderDate.value = today;
    },

    setupEventListeners() {
        // Remove any existing listeners to prevent duplicates
        this.removeEventListeners();
        
        // Main click handler using event delegation
        this.element.addEventListener('click', (event) => this.handleClickEvent(event));
        
        // Form submission handlers
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (event) => this.handleOrderSubmit(event));
        }
        
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (event) => this.handleCustomerSubmit(event));
        }
        
        // Input change handlers for order form
        this.setupInputListeners();
        
        // Setup broadcaster if available
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastOrdersLoaded();
        }
    },

    removeEventListeners() {
        // Clean up any previous event listeners
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            const newOrderForm = orderForm.cloneNode(true);
            orderForm.parentNode.replaceChild(newOrderForm, orderForm);
        }
        
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            const newCustomerForm = customerForm.cloneNode(true);
            customerForm.parentNode.replaceChild(newCustomerForm, customerForm);
        }
        
        // Note: We don't remove the main click listener as we'll replace it
        // when the module is re-rendered
    },

    handleClickEvent(event) {
        const target = event.target;
        const button = target.closest('[data-action]');
        
        if (!button) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        
        console.log('Action clicked:', action, 'ID:', id);
        
        switch(action) {
            case 'create-order':
            case 'show-order-form':
                this.showOrderForm();
                break;
            case 'manage-customers':
                this.showCustomersSection();
                break;
            case 'view-orders':
                this.showAllOrders();
                break;
            case 'add-customer':
            case 'show-customer-form':
                this.showCustomerForm();
                break;
            case 'cancel-order-form':
                this.hideOrderForm();
                break;
            case 'cancel-customer-form':
                this.hideCustomerForm();
                break;
            case 'add-item':
                this.addOrderItem();
                break;
            case 'remove-item':
                this.removeOrderItem(target);
                break;
            case 'export-orders':
                this.exportOrders();
                break;
            case 'edit-order':
                this.editOrder(parseInt(id));
                break;
            case 'delete-order':
                this.deleteOrder(parseInt(id));
                break;
            case 'edit-customer':
                this.editCustomer(parseInt(id));
                break;
            case 'delete-customer':
                this.deleteCustomer(parseInt(id));
                break;
            case 'submit-order':
                // Handled by form submit event
                break;
            case 'submit-customer':
                // Handled by form submit event
                break;
        }
    },

    setupInputListeners() {
        // Use event delegation for dynamic inputs
        this.element.addEventListener('input', (event) => {
            if (event.target.classList.contains('quantity-input') || 
                event.target.classList.contains('price-input') ||
                event.target.classList.contains('product-select')) {
                this.calculateTotal();
            }
        });
        
        // Handle product selection changes
        this.element.addEventListener('change', (event) => {
            if (event.target.classList.contains('product-select')) {
                this.handleProductSelect(event.target);
            }
        });
    },

    handleProductSelect(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const price = selectedOption.dataset.price;
        if (price) {
            const priceInput = selectElement.closest('.order-item').querySelector('.price-input');
            if (priceInput && priceInput.value === '') {
                priceInput.value = price;
                this.calculateTotal();
            }
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
                <button type="button" class="btn-outline remove-item" data-action="remove-item" style="padding: 8px 12px;">✕</button>
            </div>
        `;
        itemsContainer.appendChild(newItem);
    },

    removeOrderItem(button) {
        const itemElement = button.closest('.order-item');
        if (itemElement) {
            itemElement.remove();
            this.calculateTotal();
        }
    },

    calculateTotal() {
        let total = 0;
        const items = this.element.querySelectorAll('.order-item');
        
        items.forEach(item => {
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            const quantity = parseFloat(quantityInput?.value) || 0;
            const price = parseFloat(priceInput?.value) || 0;
            total += quantity * price;
        });
        
        const totalInput = document.getElementById('order-total');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
            totalInput.style.color = total > 0 ? '#22c55e' : '#6b7280';
        }
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

    handleOrderSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const customerId = parseInt(document.getElementById('order-customer').value);
        const date = document.getElementById('order-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        const totalAmount = parseFloat(document.getElementById('order-total').value) || 0;
        
        // Validate
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        if (totalAmount <= 0) {
            alert('Please add at least one item to the order');
            return;
        }
        
        // Get order items
        const items = [];
        document.querySelectorAll('.order-item').forEach(item => {
            const productSelect = item.querySelector('.product-select');
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            if (productSelect.value && quantityInput.value && priceInput.value) {
                const product = this.products.find(p => p.id === productSelect.value);
                items.push({
                    productId: productSelect.value,
                    productName: product?.name || 'Unknown',
                    quantity: parseInt(quantityInput.value),
                    price: parseFloat(priceInput.value)
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }
        
        // Create new order
        const newOrder = {
            id: this.generateOrderId(),
            customerId: customerId,
            date: date,
            items: items,
            totalAmount: totalAmount,
            status: status,
            notes: notes
        };
        
        this.orders.push(newOrder);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastOrderCreated(newOrder);
        }
        
        // Show notification
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${newOrder.id} created successfully!`, 'success');
        }
        
        // Reset form and update UI
        this.hideOrderForm();
        this.renderModule();
    },

    handleCustomerSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const address = document.getElementById('customer-address').value.trim();
        
        // Validate
        if (!name || !phone) {
            alert('Please fill in required fields: Name and Phone');
            return;
        }
        
        // Create new customer
        const newCustomer = {
            id: this.generateCustomerId(),
            name: name,
            contact: phone,
            email: email,
            address: address
        };
        
        this.customers.push(newCustomer);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastCustomerAdded(newCustomer);
        }
        
        // Show notification
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${name}" added successfully!`, 'success');
        }
        
        // Reset form and update UI
        this.hideCustomerForm();
        this.renderModule();
    },

    editOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Show order form with existing data
        this.showOrderForm();
        
        // Fill form with order data
        document.getElementById('order-customer').value = order.customerId;
        document.getElementById('order-date').value = order.date;
        document.getElementById('order-status').value = order.status;
        document.getElementById('order-notes').value = order.notes || '';
        
        // Clear existing items and add order items
        const itemsContainer = document.getElementById('order-items');
        itemsContainer.innerHTML = '';
        
        order.items.forEach(item => {
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
                    <button type="button" class="btn-outline remove-item" data-action="remove-item" style="padding: 8px 12px;">✕</button>
                </div>
            `;
            itemsContainer.appendChild(newItem);
        });
        
        // Update total
        this.calculateTotal();
        
        // Change form title and button
        const formTitle = document.querySelector('#order-form-container h3');
        const submitButton = document.querySelector('#order-form [type="submit"]');
        
        if (formTitle) formTitle.textContent = `Edit Order #${orderId}`;
        if (submitButton) submitButton.textContent = 'Update Order';
        
        // Store order ID for update
        const form = document.getElementById('order-form');
        form.dataset.editId = orderId;
    },

    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) return;
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const deletedOrder = this.orders[orderIndex];
        this.orders.splice(orderIndex, 1);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastOrderDeleted(orderId);
        }
        
        // Show notification
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderId} deleted`, 'warning');
        }
        
        // Update UI
        this.renderModule();
    },

    editCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        // Show customer form with existing data
        this.showCustomerForm();
        
        // Fill form with customer data
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.contact;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        
        // Change form title and button
        const formTitle = document.querySelector('#customer-form-container h3');
        const submitButton = document.querySelector('#customer-form [type="submit"]');
        
        if (formTitle) formTitle.textContent = `Edit Customer: ${customer.name}`;
        if (submitButton) submitButton.textContent = 'Update Customer';
        
        // Store customer ID for update
        const form = document.getElementById('customer-form');
        form.dataset.editId = customerId;
    },

    deleteCustomer(customerId) {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) return;
        
        const customerName = this.customers[customerIndex].name;
        this.customers.splice(customerIndex, 1);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastCustomerDeleted(customerId, customerName);
        }
        
        // Show notification
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${customerName}" deleted`, 'warning');
        }
        
        // Update UI
        this.renderModule();
    },

    exportOrders() {
        const dataStr = JSON.stringify(this.orders, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Orders exported successfully!', 'success');
        }
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
                                    <button class="btn-icon" data-action="edit-order" data-id="${order.id}" title="Edit Order">
                                        ✏️
                                    </button>
                                    <button class="btn-icon" data-action="delete-order" data-id="${order.id}" title="Delete Order">
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
                                <button class="btn-icon" data-action="edit-customer" data-id="${customer.id}" title="Edit Customer">
                                    ✏️
                                </button>
                                <button class="btn-icon" data-action="delete-customer" data-id="${customer.id}" title="Delete Customer">
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

    formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    },

    generateOrderId() {
        const maxId = this.orders.reduce((max, order) => Math.max(max, order.id), 0);
        return maxId + 1;
    },

    generateCustomerId() {
        const maxId = this.customers.reduce((max, customer) => Math.max(max, customer.id), 0);
        return maxId + 1;
    },

    cleanup() {
        // Clean up any event listeners
        this.element.removeEventListener('click', this.handleClickEvent);
        this.element.removeEventListener('input', this.setupInputListeners);
        this.element.removeEventListener('change', this.handleProductSelect);
        
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.removeEventListener('submit', this.handleOrderSubmit);
        }
        
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.removeEventListener('submit', this.handleCustomerSubmit);
        }
        
        this.initialized = false;
        console.log('🔄 Orders module cleaned up');
    }
};

// Export the module
window.OrdersModule = OrdersModule;

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    console.log('📦 Registering orders module...');
    
    // Register with FarmModules framework if available
    if (window.FarmModules) {
        // Use the module name from the module itself
        const moduleName = OrdersModule.name || 'orders';
        FarmModules.registerModule(moduleName, OrdersModule);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.log('📦 Orders module loaded (standalone mode)');
    }
})();
