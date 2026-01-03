// modules/orders.js - COMPLETE CSP COMPLIANT VERSION WITH ALL FUNCTIONALITY
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
    editingOrderId: null,
    editingCustomerId: null,

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('📋 Initializing Orders Management...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Orders module connected to Data Broadcaster');
        } else {
            console.log('⚠️ Broadcaster not available, using local methods');
        }

        if (window.StyleManager) {
            StyleManager.registerModule('orders', this.element, this);
        }

        this.loadData();
        this.renderModule();
        
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastOrdersLoaded();
        }
        
        this.initialized = true;
        console.log('✅ Orders Management initialized');
        return true;
    },

    // ==================== BROADCASTER METHODS ====================
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Orders received inventory update:', data);
            this.checkInventoryForOrders(data);
        });
        
        this.broadcaster.on('production-updated', (data) => {
            console.log('📡 Orders received production update:', data);
            this.checkProductionForOrders(data);
        });
        
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

    // ==================== CROSS-MODULE INTERACTIONS ====================
    checkInventoryForOrders(inventoryData) {
        if (!inventoryData || !inventoryData.items) return;
        
        const pendingOrders = this.orders.filter(o => o.status === 'pending');
        let canFulfillOrders = false;
        
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
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

    // ==================== DATA MANAGEMENT ====================
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

    // ==================== UI RENDERING ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const isEditingOrder = this.editingOrderId !== null;
        const isEditingCustomer = this.editingCustomerId !== null;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Orders Management</h1>
                    <p class="module-subtitle">Manage customer orders and deliveries</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" data-action="create-order">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">New Order</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Create new order</span>
                    </button>
                    <button class="quick-action-btn" data-action="manage-customers">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                    <button class="quick-action-btn" data-action="view-orders">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">All Orders</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View all orders</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-customer">
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

                <!-- Create/Edit Order Form -->
                <div id="order-form-container" class="${isEditingOrder ? '' : 'hidden'}">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="order-form-title">
                            ${isEditingOrder ? `Edit Order #${this.editingOrderId}` : 'Create New Order'}
                        </h3>
                        <form id="order-form" data-form-type="${isEditingOrder ? 'edit' : 'create'}">
                            ${isEditingOrder ? `<input type="hidden" id="order-edit-id" value="${this.editingOrderId}">` : ''}
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
                                    <!-- Items will be added dynamically -->
                                </div>
                                <button type="button" class="btn-outline" data-action="add-order-item" style="margin-top: 8px;">+ Add Item</button>
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
                                <button type="submit" class="btn-primary" data-action="submit-order">
                                    ${isEditingOrder ? 'Update Order' : 'Create Order'}
                                </button>
                                <button type="button" class="btn-outline" data-action="cancel-order-form">Cancel</button>
                                ${isEditingOrder ? '<button type="button" class="btn-outline" data-action="delete-order" style="margin-left: auto;">Delete Order</button>' : ''}
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Add/Edit Customer Form -->
                <div id="customer-form-container" class="${isEditingCustomer ? '' : 'hidden'}">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="customer-form-title">
                            ${isEditingCustomer ? 'Edit Customer' : 'Add New Customer'}
                        </h3>
                        <form id="customer-form" data-form-type="${isEditingCustomer ? 'edit' : 'create'}">
                            ${isEditingCustomer ? `<input type="hidden" id="customer-edit-id" value="${this.editingCustomerId}">` : ''}
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
                                <button type="submit" class="btn-primary" data-action="submit-customer">
                                    ${isEditingCustomer ? 'Update Customer' : 'Add Customer'}
                                </button>
                                <button type="button" class="btn-outline" data-action="cancel-customer-form">Cancel</button>
                                ${isEditingCustomer ? '<button type="button" class="btn-outline" data-action="delete-customer" style="margin-left: auto;">Delete Customer</button>' : ''}
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
            
            <style>
                .hidden { display: none !important; }
                .order-item { margin-bottom: 12px; }
                .btn-icon { 
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    padding: 4px; 
                    border-radius: 4px; 
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .btn-icon:hover { 
                    transform: scale(1.2); 
                    background: rgba(59, 130, 246, 0.1);
                }
                .quick-action-btn { transition: all 0.3s ease; }
                .quick-action-btn:hover { transform: translateY(-4px); }
            </style>
        `;

        this.setupEventListeners();
        
        // Initialize forms
        if (isEditingOrder) {
            this.populateOrderForm();
        } else if (isEditingCustomer) {
            this.populateCustomerForm();
        } else {
            // Set default date for new orders
            const today = new Date().toISOString().split('T')[0];
            const orderDate = document.getElementById('order-date');
            if (orderDate) orderDate.value = today;
            
            // Add initial item for new orders
            this.addOrderItem();
        }
        
        this.calculateTotal();
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        this.removeEventListeners();
        
        // Main event delegation
        this.element.addEventListener('click', this.handleElementClick.bind(this));
        this.element.addEventListener('input', this.handleElementInput.bind(this));
        this.element.addEventListener('change', this.handleElementChange.bind(this));
        this.element.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
    },

    removeEventListeners() {
        // Clone element to remove all event listeners
        if (this.element && this.element.parentNode) {
            const newElement = this.element.cloneNode(true);
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    },

   handleElementClick(event) {
    const target = event.target;
    const button = target.closest('[data-action]');
    
    if (!button) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const action = button.getAttribute('data-action');
    const id = button.getAttribute('data-id');
    
    console.log('Orders action:', action, 'ID:', id);
    
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
        case 'add-order-item':
            this.addOrderItem();
            break;
        case 'remove-order-item':
            this.removeOrderItem(button);
            break;
        case 'export-orders':
            this.exportOrders();
            break;
        case 'edit-order':
            if (id) this.editOrder(parseInt(id));
            break;
        case 'delete-order':
            if (id) this.deleteOrder(parseInt(id));
            break;
        case 'edit-customer':
            if (id) this.editCustomer(parseInt(id));
            break;
        case 'delete-customer':
            if (id) this.deleteCustomer(parseInt(id));
            break;
        case 'submit-order':
            // Handled by form submit
            break;
        case 'submit-customer':
            // Handled by form submit
            break;
        default:
            console.log('Unhandled action:', action);
    }
},

    handleElementInput(event) {
        if (event.target.classList.contains('quantity-input') || 
            event.target.classList.contains('price-input')) {
            this.calculateTotal();
        }
    },

    handleElementChange(event) {
        if (event.target.classList.contains('product-select')) {
            this.updatePriceFromProduct(event.target);
        }
    },

    handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formType = form.getAttribute('data-form-type');
        
        if (form.id === 'order-form') {
            if (formType === 'edit') {
                this.updateOrder();
            } else {
                this.createOrder();
            }
        } else if (form.id === 'customer-form') {
            if (formType === 'edit') {
                this.updateCustomer();
            } else {
                this.createCustomer();
            }
        }
    },

    handleMouseEnter(event) {
        const button = event.target.closest('[data-action]');
        if (button && button.classList.contains('quick-action-btn')) {
            button.style.transform = 'translateY(-4px)';
        }
        
        if (event.target.classList.contains('btn-icon')) {
            event.target.style.transform = 'scale(1.2)';
            event.target.style.color = '#3b82f6';
            event.target.style.background = 'rgba(59, 130, 246, 0.1)';
        }
    },

    handleMouseLeave(event) {
        const button = event.target.closest('[data-action]');
        if (button && button.classList.contains('quick-action-btn')) {
            button.style.transform = 'translateY(0)';
        }
        
        if (event.target.classList.contains('btn-icon')) {
            event.target.style.transform = 'scale(1)';
            event.target.style.color = '';
            event.target.style.background = '';
        }
    },

    // ==================== FORM MANAGEMENT ====================
    showOrderForm() {
        this.editingOrderId = null;
        this.editingCustomerId = null;
        this.renderModule();
        
        const formContainer = document.getElementById('order-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    },

    hideOrderForm() {
        this.editingOrderId = null;
        this.renderModule();
    },

    showCustomerForm() {
        this.editingOrderId = null;
        this.editingCustomerId = null;
        this.renderModule();
        
        const formContainer = document.getElementById('customer-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    },

    hideCustomerForm() {
        this.editingCustomerId = null;
        this.renderModule();
    },

    showCustomersSection() {
        const section = document.getElementById('customers-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.style.boxShadow = '0 0 0 3px #3b82f6';
            
            setTimeout(() => {
                section.style.boxShadow = 'none';
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

    // ==================== ORDER ITEMS MANAGEMENT ====================
    addOrderItem(itemData = null) {
        const container = document.getElementById('order-items');
        if (!container) return;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px;">
                <select class="form-input product-select" required>
                    <option value="">Select Product</option>
                    ${this.products.map(product => `
                        <option value="${product.id}" 
                                data-price="${product.price}"
                                ${itemData && itemData.productId === product.id ? 'selected' : ''}>
                            ${product.name} - ${this.formatCurrency(product.price)}
                        </option>
                    `).join('')}
                </select>
                <input type="number" class="form-input quantity-input" 
                       placeholder="Qty" min="1" 
                       value="${itemData ? itemData.quantity : 1}" required>
                <input type="number" class="form-input price-input" 
                       placeholder="Price" step="0.01" min="0" 
                       value="${itemData ? itemData.price : ''}" required>
                <button type="button" class="btn-outline" 
                        data-action="remove-order-item" 
                        style="padding: 8px 12px;">✕</button>
            </div>
        `;
        container.appendChild(itemDiv);
        
        if (itemData && itemData.productId) {
            const select = itemDiv.querySelector('.product-select');
            const priceInput = itemDiv.querySelector('.price-input');
            const selectedOption = select.querySelector(`option[value="${itemData.productId}"]`);
            if (selectedOption && !priceInput.value) {
                priceInput.value = selectedOption.dataset.price;
            }
        }
    },

    removeOrderItem(button) {
        const itemDiv = button.closest('.order-item');
        if (itemDiv) {
            itemDiv.remove();
            this.calculateTotal();
        }
    },

    updatePriceFromProduct(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const price = selectedOption.dataset.price;
        if (price) {
            const priceInput = selectElement.closest('.order-item').querySelector('.price-input');
            if (priceInput && !priceInput.value) {
                priceInput.value = price;
                this.calculateTotal();
            }
        }
    },

    calculateTotal() {
        let total = 0;
        const items = this.element.querySelectorAll('.order-item');
        
        items.forEach(item => {
            const quantity = parseFloat(item.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(item.querySelector('.price-input')?.value) || 0;
            total += quantity * price;
        });
        
        const totalInput = document.getElementById('order-total');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
            totalInput.style.color = total > 0 ? '#22c55e' : '#6b7280';
        }
    },

    // ==================== ORDER CRUD OPERATIONS ====================
    createOrder() {
        const customerId = parseInt(document.getElementById('order-customer').value);
        const date = document.getElementById('order-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        const totalAmount = parseFloat(document.getElementById('order-total').value) || 0;
        
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        if (totalAmount <= 0) {
            alert('Please add at least one item to the order');
            return;
        }
        
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
        
        const orderId = this.generateOrderId();
        const orderData = {
            id: orderId,
            customerId: customerId,
            date: date,
            items: items,
            totalAmount: totalAmount,
            status: status,
            notes: notes
        };
        
        this.orders.push(orderData);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastOrderCreated(orderData);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderId} created successfully!`, 'success');
        }
        
        this.hideOrderForm();
        this.renderModule();
    },

    editOrder(orderId) {
        this.editingOrderId = orderId;
        this.editingCustomerId = null;
        this.renderModule();
    },

    populateOrderForm() {
        if (!this.editingOrderId) return;
        
        const order = this.orders.find(o => o.id === this.editingOrderId);
        if (!order) {
            this.editingOrderId = null;
            this.renderModule();
            return;
        }
        
        setTimeout(() => {
            document.getElementById('order-customer').value = order.customerId;
            document.getElementById('order-date').value = order.date;
            document.getElementById('order-status').value = order.status;
            document.getElementById('order-notes').value = order.notes || '';
            
            const itemsContainer = document.getElementById('order-items');
            if (itemsContainer) {
                itemsContainer.innerHTML = '';
                order.items.forEach(item => {
                    this.addOrderItem(item);
                });
            }
            
            this.calculateTotal();
        }, 100);
    },

    updateOrder() {
        const orderId = this.editingOrderId;
        if (!orderId) return;
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const customerId = parseInt(document.getElementById('order-customer').value);
        const date = document.getElementById('order-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        const totalAmount = parseFloat(document.getElementById('order-total').value) || 0;
        
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
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
        
        if (this.broadcaster) {
            this.broadcastOrderUpdated(this.orders[orderIndex]);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderId} updated successfully!`, 'success');
        }
        
        this.editingOrderId = null;
        this.renderModule();
    },

    deleteOrder(orderId) {
        if (!orderId) orderId = this.editingOrderId;
        if (!orderId) return;
        
        if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        this.orders.splice(orderIndex, 1);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastOrderDeleted(orderId);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderId} deleted`, 'warning');
        }
        
        this.editingOrderId = null;
        this.renderModule();
    },

    // ==================== CUSTOMER CRUD OPERATIONS ====================
    createCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const address = document.getElementById('customer-address').value.trim();
        
        if (!name || !phone) {
            alert('Please fill in required fields: Name and Phone');
            return;
        }
        
        const customerId = this.generateCustomerId();
        const customerData = {
            id: customerId,
            name: name,
            contact: phone,
            email: email,
            address: address
        };
        
        this.customers.push(customerData);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastCustomerAdded(customerData);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${name}" added successfully!`, 'success');
        }
        
        this.hideCustomerForm();
        this.renderModule();
    },

    editCustomer(customerId) {
        this.editingCustomerId = customerId;
        this.editingOrderId = null;
        this.renderModule();
    },

    populateCustomerForm() {
        if (!this.editingCustomerId) return;
        
        const customer = this.customers.find(c => c.id === this.editingCustomerId);
        if (!customer) {
            this.editingCustomerId = null;
            this.renderModule();
            return;
        }
        
        setTimeout(() => {
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-phone').value = customer.contact;
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-address').value = customer.address || '';
        }, 100);
    },

    updateCustomer() {
        const customerId = this.editingCustomerId;
        if (!customerId) return;
        
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) return;
        
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const address = document.getElementById('customer-address').value.trim();
        
        if (!name || !phone) {
            alert('Please fill in required fields: Name and Phone');
            return;
        }
        
        this.customers[customerIndex] = {
            id: customerId,
            name: name,
            contact: phone,
            email: email,
            address: address
        };
        
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastCustomerUpdated(this.customers[customerIndex]);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${name}" updated successfully!`, 'success');
        }
        
        this.editingCustomerId = null;
        this.renderModule();
    },

    deleteCustomer(customerId) {
        if (!customerId) customerId = this.editingCustomerId;
        if (!customerId) return;
        
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const customerOrders = this.orders.filter(o => o.customerId === customerId);
        if (customerOrders.length > 0) {
            alert(`Cannot delete customer "${customer.name}" because they have ${customerOrders.length} order(s).`);
            return;
        }
        
        if (!confirm(`Are you sure you want to delete customer "${customer.name}"?`)) return;
        
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        this.customers.splice(customerIndex, 1);
        this.saveData();
        
        if (this.broadcaster) {
            this.broadcastCustomerDeleted(customerId, customer.name);
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${customer.name}" deleted`, 'warning');
        }
        
        this.editingCustomerId = null;
        this.renderModule();
    },

    // ==================== UTILITY METHODS ====================
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

    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
    },

    cleanup() {
        this.removeEventListeners();
        this.editingOrderId = null;
        this.editingCustomerId = null;
        this.initialized = false;
        console.log('🔄 Orders module cleaned up');
    }
};

// ==================== REGISTRATION ====================
window.OrdersModule = OrdersModule;

(function() {
    console.log('📦 Registering orders module...');
    
    if (window.FarmModules) {
        const moduleName = OrdersModule.name || 'orders';
        FarmModules.registerModule(moduleName, OrdersModule);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.log('📦 Orders module loaded (standalone mode)');
    }
})();
