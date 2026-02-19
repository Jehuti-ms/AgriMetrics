// modules/orders.js - COMPLETE VERSION WITH DATA BROADCASTER
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
        this.setupEventListeners();
        
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastOrdersLoaded();
        }
        
        this.initialized = true;
        
        console.log('✅ Orders Management initialized with StyleManager & Data Broadcaster');
        return true;
    },

    // ✅ NEW: Setup broadcaster listeners
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

    // ✅ NEW: Broadcast orders loaded
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

    // ✅ NEW: Broadcast when order is created
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

    // ✅ NEW: Broadcast when order is updated
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

    // ✅ NEW: Broadcast when order is deleted
    broadcastOrderDeleted(orderId) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('order-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: orderId
        });
    },

    // ✅ NEW: Broadcast when customer is added
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

    // ✅ NEW: Broadcast when customer is updated
    broadcastCustomerUpdated(customer) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-updated', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name
        });
    },

    // ✅ NEW: Broadcast when customer is deleted
    broadcastCustomerDeleted(customerId, customerName) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customerId,
            customerName: customerName
        });
    },

    // ✅ NEW: Check inventory for order fulfillment
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

    // ✅ NEW: Check production for order fulfillment
    checkProductionForOrders(productionData) {
        if (!productionData) return;
        
        // You can add logic here to check if new production affects pending orders
        console.log('Production data received for orders:', productionData);
    },

    // ✅ NEW: Sync with sales records
    syncWithSale(saleData) {
        if (!saleData) return;
        
        // Check if this sale corresponds to an order
        const existingOrder = this.orders.find(order => 
            order.totalAmount === saleData.amount && 
            order.status === 'completed'
        );
        
        if (!existingOrder) {
            // Could be a cash sale, not from an order
            console.log('Sales record not linked to existing order');
        }
    },

    // ✅ NEW: Get real-time stats for dashboard
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

    // ✅ NEW: Enhanced saveData with broadcasting
    saveData() {
        localStorage.setItem('farm-orders', JSON.stringify(this.orders));
        localStorage.setItem('farm-customers', JSON.stringify(this.customers));
        
        // Broadcast data saved
        if (this.broadcaster) {
            this.broadcaster.broadcast('orders-data-saved', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                ordersCount: this.orders.length,
                customersCount: this.customers.length
            });
        }
    },

    // ✅ NEW: Enhanced loadData
    loadData() {
        const savedOrders = localStorage.getItem('farm-orders');
        const savedCustomers = localStorage.getItem('farm-customers');
        
        this.orders = savedOrders ? JSON.parse(savedOrders) : this.getDemoOrders();
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : this.getDemoCustomers();
        
        // Broadcast data loaded
        if (this.broadcaster) {
            this.broadcaster.broadcast('orders-data-loaded', {
                module: 'orders',
                timestamp: new Date().toISOString(),
                ordersCount: this.orders.length,
                customersCount: this.customers.length
            });
        }
    },

    // ✅ ADDED: getDemoOrders method
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

    // ✅ ADDED: getDemoCustomers method
    getDemoCustomers() {
        return [
            { id: 1, name: 'Local Market', contact: '555-0123', address: '123 Main St', email: 'market@local.com' },
            { id: 2, name: 'Restaurant A', contact: '555-0456', address: '456 Oak Ave', email: 'orders@restauranta.com' },
            { id: 3, name: 'Grocery Store B', contact: '555-0789', address: '789 Pine St', email: 'produce@grocerystore.com' }
        ];
    },

    // ✅ ADDED: Theme change handler
    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
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
                                        <input type="hidden" id="editing-order-id" value="">
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
                                <button class="btn-icon edit-customer" data-action="edit-customer" data-id="${customer.id}" title="Edit Customer">
                                    ✏️
                                </button>
                                <button class="btn-icon delete-customer" data-action="delete-customer" data-id="${customer.id}" title="Delete Customer">
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
    console.log('🔧 Setting up Orders module event listeners...');
    
    // Remove any existing order button listeners to prevent duplicates
    // (Store a flag or remove specific listeners if needed)
    if (this._orderListenersAttached) {
        console.log('⚠️ Order listeners already attached, skipping...');
        return;
    }
    
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

    // EVENT DELEGATION for order buttons
    document.addEventListener('click', (e) => {
          console.log('🔍 Click detected on:', e.target);
          console.log('🔍 Target classes:', e.target.className);
          console.log('🔍 Target closest .edit-order:', e.target.closest('.edit-order'));
        
        // Edit order button
        const editButton = e.target.closest('.edit-order');
        if (editButton) {
            e.preventDefault();
            e.stopPropagation();
            const orderId = editButton.getAttribute('data-id');
            console.log('✏️ Edit order clicked:', orderId);
            
            if (!orderId) {
                console.error('❌ No order ID found');
                return;
            }
            
            // Call your edit function
            this.editOrder(orderId);
            return;
        }
        
        // Delete order button
        const deleteButton = e.target.closest('.delete-order');
        if (deleteButton) {
            e.preventDefault();
            e.stopPropagation();
            const orderId = deleteButton.getAttribute('data-id');
            console.log('🗑️ Delete order clicked:', orderId);
            
            if (!orderId) {
                console.error('❌ No order ID found');
                return;
            }
            
            if (confirm('Are you sure you want to delete this order?')) {
                this.deleteOrder(orderId);
            }
            return;
        }
    });
    
    // Calculate total when items change
    this.setupTotalCalculation();
    
    // Delete and edit handlers
    this.setupActionHandlers();
    
    // Hover effects
    this.setupHoverEffects();
    
    // Mark listeners as attached
    this._orderListenersAttached = true;
    console.log('✅ Orders module event listeners setup complete');
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

    addOrderItem(itemData = null) {
    const itemsContainer = document.getElementById('order-items');
    const newItem = document.createElement('div');
    newItem.className = 'order-item';
    
    // Set default values based on whether we're editing
    const quantity = itemData ? itemData.quantity : 1;
    const price = itemData ? itemData.price : '';
    const selectedProductId = itemData ? itemData.productId : '';
    
    newItem.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px;">
            <select class="form-input product-select" required>
                <option value="">Select Product</option>
                ${this.products.map(product => `
                    <option value="${product.id}" data-price="${product.price}" ${product.id == selectedProductId ? 'selected' : ''}>
                        ${product.name} - ${this.formatCurrency(product.price)}
                    </option>
                `).join('')}
            </select>
            <input type="number" class="form-input quantity-input" placeholder="Qty" min="1" value="${quantity}" required>
            <input type="number" class="form-input price-input" placeholder="Price" step="0.01" min="0" value="${price}" required>
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
    // Use event delegation for all action buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;
        
        const action = button.getAttribute('data-action');
        const id = parseInt(button.getAttribute('data-id'));
        
        switch(action) {
            case 'delete-order':
                e.preventDefault();
                this.deleteOrder(id);
                break;
            case 'edit-order':
                e.preventDefault();
                this.editOrder(id);
                break;
            case 'delete-customer':
                e.preventDefault();
                this.deleteCustomer(id);
                break;
            case 'edit-customer':
                e.preventDefault();
                this.editCustomer(id);
                break;
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

   // ✅ MODIFIED: Enhanced handleOrderSubmit with broadcasting and edit support
handleOrderSubmit(e) {
    e.preventDefault();
    
    // Check if we're editing an existing order
    const editingId = document.getElementById('editing-order-id')?.value;
    const isEditing = editingId && editingId !== '';
    
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
        this.showNotification('Please add at least one item to the order.', 'error');
        return;
    }
    
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    if (isEditing) {
        // UPDATE existing order
        const orderData = {
            id: parseInt(editingId),
            customerId: customerId,
            date: date,
            items: items,
            totalAmount: totalAmount,
            status: status,
            notes: notes
        };
        
        // Find and update the order in the array
        const index = this.orders.findIndex(o => o.id === parseInt(editingId));
        if (index !== -1) {
            const oldOrder = this.orders[index];
            this.orders[index] = orderData;
            this.saveData();
            
            // ✅ Broadcast order updated
            if (this.broadcastOrderUpdated) {
                this.broadcastOrderUpdated(oldOrder, orderData);
            }
            
            this.showNotification(`Order #${orderData.id} updated successfully!`, 'success');
        } else {
            // Order not found - shouldn't happen, but just in case
            console.error('❌ Order not found for editing:', editingId);
            this.showNotification('Order not found!', 'error');
            return;
        }
    } else {
        // CREATE new order
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
        
        // ✅ Broadcast order created
        if (this.broadcastOrderCreated) {
            this.broadcastOrderCreated(orderData);
        }
        
        this.showNotification(`Order #${orderData.id} created successfully!`, 'success');
    }
    
    // Reset form and hide
    this.resetOrderForm();
    this.hideOrderForm();
    
    // Re-render module
    this.renderModule();
},
    
    // Reset order form
resetOrderForm() {
    document.getElementById('order-form').reset();
    document.getElementById('editing-order-id').value = '';
    
    // Clear items except one
    const itemsContainer = document.getElementById('order-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        this.addOrderItem(); // Add one empty item row
    }
},

// Hide order form
hideOrderForm() {
    document.getElementById('order-form-container')?.classList.add('hidden');
},

// Show order form
showOrderForm() {
    this.resetOrderForm();
    document.getElementById('order-form-container')?.classList.remove('hidden');
    document.getElementById('order-form-title').textContent = 'Create New Order';
    document.getElementById('order-submit-btn').textContent = 'Create Order';
},
    
    // ✅ MODIFIED: Enhanced handleCustomerSubmit with broadcasting
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
        
        // ✅ Broadcast customer added
        this.broadcastCustomerAdded(customerData);
        
        this.renderModule();
        this.hideCustomerForm();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Customer "${customerData.name}" added successfully!`, 'success');
        }
    },

    // ✅ MODIFIED: Enhanced deleteOrder with broadcasting
    deleteOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (!order) return;

        if (confirm(`Are you sure you want to delete order #${id}? This cannot be undone.`)) {
            this.orders = this.orders.filter(o => o.id !== id);
            this.saveData();
            
            // ✅ Broadcast order deleted
            this.broadcastOrderDeleted(id);
            
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Order deleted successfully!', 'success');
            }
        }
    },

editOrder(id) {
    console.log('🔥🔥🔥 editOrder EXECUTING with id:', id);
    
    try {
        console.log('1️⃣ Step 1: Orders array exists:', !!this.orders);
        console.log('1️⃣ Step 1a: Orders length:', this.orders?.length);
        console.log('1️⃣ Step 1b: Orders content:', this.orders);
        
        // Find the order
        console.log('2️⃣ Step 2: Looking for order with id:', id);
        const order = this.orders.find(o => o.id == id);
        console.log('2️⃣ Step 2a: Order found:', order);
        
        if (!order) {
            console.error('❌ Order not found!');
            this.showNotification('Order not found!', 'error');
            return;
        }
        
        console.log('3️⃣ Step 3: Order details:', JSON.stringify(order));
        
        // Check if form container exists
        console.log('4️⃣ Step 4: Looking for order-form-container');
        const formContainer = document.getElementById('order-form-container');
        console.log('4️⃣ Step 4a: formContainer:', formContainer);
        
        if (!formContainer) {
            console.error('❌ order-form-container not found!');
            this.showNotification('Form container not found!', 'error');
            return;
        }
        
        // Check if order form exists
        console.log('5️⃣ Step 5: Looking for order-form');
        const orderForm = document.getElementById('order-form');
        console.log('5️⃣ Step 5a: orderForm:', orderForm);
        
        if (!orderForm) {
            console.error('❌ order-form not found!');
            this.showNotification('Order form not found!', 'error');
            return;
        }
        
        // Set editing ID
        console.log('6️⃣ Step 6: Looking for editing-order-id field');
        let editingIdField = document.getElementById('editing-order-id');
        console.log('6️⃣ Step 6a: editingIdField:', editingIdField);
        
        if (!editingIdField) {
            console.log('6️⃣ Step 6b: Creating editing-id field');
            editingIdField = document.createElement('input');
            editingIdField.type = 'hidden';
            editingIdField.id = 'editing-order-id';
            orderForm.appendChild(editingIdField);
            console.log('6️⃣ Step 6c: Created and appended editing-id field');
        }
        
        editingIdField.value = order.id;
        console.log('7️⃣ Step 7: Set editing-id to:', order.id);
        
        // Populate form fields
        console.log('8️⃣ Step 8: Looking for order-customer');
        const customerField = document.getElementById('order-customer');
        console.log('8️⃣ Step 8a: customerField:', customerField);
        if (customerField) {
            customerField.value = order.customerId;
            console.log('8️⃣ Step 8b: Set customer to:', order.customerId);
        } else {
            console.error('❌ order-customer field not found!');
        }
        
        console.log('9️⃣ Step 9: Looking for order-date');
        const dateField = document.getElementById('order-date');
        console.log('9️⃣ Step 9a: dateField:', dateField);
        if (dateField) {
            dateField.value = order.date;
            console.log('9️⃣ Step 9b: Set date to:', order.date);
        } else {
            console.error('❌ order-date field not found!');
        }
        
        console.log('🔟 Step 10: Looking for order-status');
        const statusField = document.getElementById('order-status');
        console.log('🔟 Step 10a: statusField:', statusField);
        if (statusField) {
            statusField.value = order.status;
            console.log('🔟 Step 10b: Set status to:', order.status);
        } else {
            console.error('❌ order-status field not found!');
        }
        
        console.log('1️⃣1️⃣ Step 11: Looking for order-notes');
        const notesField = document.getElementById('order-notes');
        console.log('1️⃣1️⃣ Step 11a: notesField:', notesField);
        if (notesField) {
            notesField.value = order.notes || '';
            console.log('1️⃣1️⃣ Step 11b: Set notes to:', order.notes);
        } else {
            console.error('❌ order-notes field not found!');
        }
        
        // Clear existing items
        console.log('1️⃣2️⃣ Step 12: Looking for order-items container');
        const itemsContainer = document.getElementById('order-items');
        console.log('1️⃣2️⃣ Step 12a: itemsContainer:', itemsContainer);
        
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            console.log('1️⃣2️⃣ Step 12b: Items container cleared');
            
            if (order.items && order.items.length > 0) {
                console.log('1️⃣3️⃣ Step 13: Adding', order.items.length, 'items');
                order.items.forEach((item, index) => {
                    console.log(`1️⃣3️⃣ Step 13a: Adding item ${index + 1}:`, item);
                    if (typeof this.addOrderItem === 'function') {
                        this.addOrderItem(item);
                    } else {
                        console.error('❌ addOrderItem method not found!');
                    }
                });
            } else {
                console.log('1️⃣4️⃣ Step 14: No items, adding empty item');
                if (typeof this.addOrderItem === 'function') {
                    this.addOrderItem();
                } else {
                    console.error('❌ addOrderItem method not found!');
                }
            }
        } else {
            console.error('❌ order-items container not found!');
        }
        
        // Show form
        console.log('1️⃣5️⃣ Step 15: Showing form container');
        formContainer.classList.remove('hidden');
        
        console.log('1️⃣6️⃣ Step 16: Looking for order-form-title');
        const formTitle = document.getElementById('order-form-title');
        console.log('1️⃣6️⃣ Step 16a: formTitle:', formTitle);
        if (formTitle) {
            formTitle.textContent = 'Edit Order';
            console.log('1️⃣6️⃣ Step 16b: Form title updated to "Edit Order"');
        } else {
            console.error('❌ order-form-title not found!');
        }
        
        console.log('1️⃣7️⃣ Step 17: Looking for order-submit-btn');
        const submitBtn = document.getElementById('order-submit-btn');
        console.log('1️⃣7️⃣ Step 17a: submitBtn:', submitBtn);
        if (submitBtn) {
            submitBtn.textContent = 'Update Order';
            console.log('1️⃣7️⃣ Step 17b: Submit button updated to "Update Order"');
        } else {
            console.error('❌ order-submit-btn not found!');
        }
        
        // Calculate total
        console.log('1️⃣8️⃣ Step 18: Calculating total');
        if (typeof this.calculateTotal === 'function') {
            this.calculateTotal();
            console.log('1️⃣8️⃣ Step 18a: Total calculated');
        } else {
            console.warn('⚠️ calculateTotal method not found');
        }
        
        // Scroll to form
        console.log('1️⃣9️⃣ Step 19: Scrolling to form');
        formContainer.scrollIntoView({ behavior: 'smooth' });
        
        console.log('2️⃣0️⃣ Step 20: Showing notification');
        this.showNotification('Edit the order details and click Update Order', 'info');
        
        console.log('✅ editOrder completed successfully');
        
    } catch (error) {
        console.error('❌❌❌ ERROR in editOrder:', error);
        console.error('❌❌❌ Stack trace:', error.stack);
        this.showNotification('Error editing order: ' + error.message, 'error');
    }
},
    
    // ✅ MODIFIED: Enhanced deleteCustomer with broadcasting
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
            
            // ✅ Broadcast customer deleted
            this.broadcastCustomerDeleted(id, customer.name);
            
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

    showNotification(message, type = 'info') {
    if (window.coreModule && window.coreModule.showNotification) {
        window.coreModule.showNotification(message, type);
    } else {
        // Fallback
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else if (type === 'success') {
            alert(`Success: ${message}`);
        } else {
            alert(message);
        }
    }
},
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders Management module registered');
}

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'orders.js';
    const MODULE_OBJECT = OrdersModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();

// ==================== COMPLETE ORDERS & CUSTOMERS EDIT FIX ====================
(function() {
    'use strict';
    
    console.log('📦 LOADING COMPLETE EDIT FIX (Orders & Customers)...');
    
    // Store original methods
    const originalEditOrder = OrdersModule.editOrder;
    const originalEditCustomer = OrdersModule.editCustomer;
    
    // ==================== ORDER EDITING ====================
    OrdersModule.editOrder = function(orderId) {
        console.log('📝 EDITING ORDER:', orderId);
        
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        // Show order form
        this.showOrderForm();
        
        // Wait for form to render
        setTimeout(() => {
            const form = document.getElementById('order-form');
            if (!form) return;
            
            // Change title
            const title = document.querySelector('#order-form-container h3');
            if (title) title.textContent = 'Edit Order';
            
            // Populate basic fields
            form.querySelector('#order-customer').value = order.customerId;
            form.querySelector('#order-date').value = order.date;
            form.querySelector('#order-status').value = order.status;
            form.querySelector('#order-notes').value = order.notes || '';
            form.querySelector('#order-total').value = order.totalAmount.toFixed(2);
            
            // Clear existing items
            const itemsContainer = document.getElementById('order-items');
            itemsContainer.innerHTML = '';
            
            // Add order items
            order.items.forEach((item) => {
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
                    const newPrice = selectedOption.dataset.price;
                    if (newPrice) {
                        priceInput.value = newPrice;
                        this.calculateTotal();
                    }
                });
            });
            
            // Recalculate total
            this.calculateTotal();
            
            // Change submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                // Remove old submit handler
                form.onsubmit = null;
                
                // Create new submit button
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                newSubmitBtn.textContent = 'Update Order';
                
                newSubmitBtn.onclick = (e) => {
                    e.preventDefault();
                    this.updateEditedOrder(orderId);
                };
            }
            
            // Add cancel edit button
            const cancelBtn = form.querySelector('#cancel-order-form');
            if (cancelBtn && !cancelBtn.nextElementSibling?.classList?.contains('cancel-edit-btn')) {
                const cancelEditBtn = document.createElement('button');
                cancelEditBtn.type = 'button';
                cancelEditBtn.className = 'btn-outline cancel-edit-btn';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.style.marginLeft = '8px';
                cancelEditBtn.onclick = () => {
                    this.cancelOrderEdit();
                };
                cancelBtn.parentNode.appendChild(cancelEditBtn);
            }
            
            console.log('✅ Order form ready for editing');
            
        }, 100);
    };
    
    // Update edited order
    OrdersModule.updateEditedOrder = function(orderId) {
        console.log('💾 UPDATING ORDER:', orderId);
        
        const form = document.getElementById('order-form');
        if (!form) return;
        
        // Get form values
        const customerId = parseInt(form.querySelector('#order-customer').value);
        const date = form.querySelector('#order-date').value;
        const status = form.querySelector('#order-status').value;
        const notes = form.querySelector('#order-notes').value;
        
        // Collect items
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
            alert('Please add at least one item.');
            return;
        }
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        // Find and update order
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
            this.cancelOrderEdit();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Order #${orderId} updated!`, 'success');
            }
        }
    };
    
    // Cancel order edit
    OrdersModule.cancelOrderEdit = function() {
        // Remove cancel edit button
        const cancelEditBtn = document.querySelector('.cancel-edit-btn');
        if (cancelEditBtn) cancelEditBtn.remove();
        
        // Reset form
        setTimeout(() => {
            const form = document.getElementById('order-form');
            if (form) {
                form.reset();
                const title = document.querySelector('#order-form-container h3');
                if (title) title.textContent = 'Create New Order';
                
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Create Order';
                    submitBtn.onclick = null;
                    form.onsubmit = (e) => this.handleOrderSubmit(e);
                }
                
                // Reset items
                const itemsContainer = document.getElementById('order-items');
                if (itemsContainer) {
                    itemsContainer.innerHTML = `
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
                    `;
                    this.setupTotalCalculation();
                }
            }
        }, 100);
    };
    
    // ==================== CUSTOMER EDITING ====================
    OrdersModule.editCustomer = function(customerId) {
        console.log('👤 EDITING CUSTOMER:', customerId);
        
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            this.showNotification('Customer not found', 'error');
            return;
        }
        
        // Show customer form
        this.showCustomerForm();
        
        // Wait for form to render
        setTimeout(() => {
            const form = document.getElementById('customer-form');
            if (!form) return;
            
            // Change title
            const title = document.querySelector('#customer-form-container h3');
            if (title) title.textContent = 'Edit Customer';
            
            // Populate fields
            form.querySelector('#customer-name').value = customer.name;
            form.querySelector('#customer-phone').value = customer.contact;
            form.querySelector('#customer-email').value = customer.email || '';
            form.querySelector('#customer-address').value = customer.address || '';
            
            // Change submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                // Remove old submit handler
                form.onsubmit = null;
                
                // Create new submit button
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                newSubmitBtn.textContent = 'Update Customer';
                
                newSubmitBtn.onclick = (e) => {
                    e.preventDefault();
                    this.updateEditedCustomer(customerId);
                };
            }
            
            // Add cancel edit button
            const cancelBtn = form.querySelector('#cancel-customer-form');
            if (cancelBtn && !cancelBtn.nextElementSibling?.classList?.contains('cancel-edit-btn')) {
                const cancelEditBtn = document.createElement('button');
                cancelEditBtn.type = 'button';
                cancelEditBtn.className = 'btn-outline cancel-edit-btn';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.style.marginLeft = '8px';
                cancelEditBtn.onclick = () => {
                    this.cancelCustomerEdit();
                };
                cancelBtn.parentNode.appendChild(cancelEditBtn);
            }
            
            console.log('✅ Customer form ready for editing');
            
        }, 100);
    };
    
    // Update edited customer
    OrdersModule.updateEditedCustomer = function(customerId) {
        console.log('💾 UPDATING CUSTOMER:', customerId);
        
        const form = document.getElementById('customer-form');
        if (!form) return;
        
        // Get form values
        const customerData = {
            name: form.querySelector('#customer-name').value,
            contact: form.querySelector('#customer-phone').value,
            email: form.querySelector('#customer-email').value,
            address: form.querySelector('#customer-address').value
        };
        
        // Validate
        if (!customerData.name || !customerData.contact) {
            alert('Please fill in customer name and contact information.');
            return;
        }
        
        // Find and update customer
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            this.customers[customerIndex] = {
                id: customerId,
                ...customerData
            };
            
            this.saveData();
            this.renderModule();
            this.hideCustomerForm();
            this.cancelCustomerEdit();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Customer "${customerData.name}" updated!`, 'success');
            }
        }
    };
    
    // Cancel customer edit
    OrdersModule.cancelCustomerEdit = function() {
        // Remove cancel edit button
        const cancelEditBtn = document.querySelectorAll('.cancel-edit-btn');
        cancelEditBtn.forEach(btn => btn.remove());
        
        // Reset form
        setTimeout(() => {
            const form = document.getElementById('customer-form');
            if (form) {
                form.reset();
                const title = document.querySelector('#customer-form-container h3');
                if (title) title.textContent = 'Add New Customer';
                
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add Customer';
                    submitBtn.onclick = null;
                    form.onsubmit = (e) => this.handleCustomerSubmit(e);
                }
            }
        }, 100);
    };
    
    // ==================== ENHANCE EDIT BUTTONS ====================
    function enhanceEditButtons() {
        // Order edit buttons
        const orderEditButtons = document.querySelectorAll('.edit-order');
        orderEditButtons.forEach(btn => {
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
        
        // Customer edit buttons
        const customerEditButtons = document.querySelectorAll('.edit-customer');
        customerEditButtons.forEach(btn => {
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
    
    // Apply when module loads
    setTimeout(enhanceEditButtons, 1000);
    
    // Re-apply when switching to orders
    document.addEventListener('click', function(e) {
        if (e.target.closest('[href*="#orders"], [onclick*="orders"]')) {
            setTimeout(enhanceEditButtons, 500);
        }
    });
    
    console.log('✅ Complete orders & customers edit fix loaded');
    
})();

// At the very end of orders.js, after the module definition
if (window.FarmModules) {
    // Add to modules Map (already done probably)
    window.FarmModules.modules.set('orders', OrdersModule);
    window.FarmModules.modules.set('orders.js', OrdersModule);
    
    // ALSO add directly to the FarmModules object
    window.FarmModules.orders = OrdersModule;
    window.FarmModules.Orders = OrdersModule;
    
    console.log('✅ Orders module added to FarmModules object');
}
