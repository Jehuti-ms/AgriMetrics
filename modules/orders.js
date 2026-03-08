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
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Get Broadcaster instance
        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Orders module connected to Data Broadcaster');
        } else {
            console.log('⚠️ Broadcaster not available, using local methods');
        }

        // Register with StyleManager
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

    // Setup broadcaster listeners
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

    // Broadcast orders loaded
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

    // Broadcast when order is created
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

    // Broadcast when order is updated
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

    // Broadcast sale completed
    broadcastSaleCompleted(saleData) {
        if (!this.broadcaster) {
            console.log('⚠️ Broadcaster not available for sale event');
            // Fallback: use custom event
            const event = new CustomEvent('sale-completed', { detail: saleData });
            window.dispatchEvent(event);
            return;
        }
        
        console.log('📢 Broadcasting sale completed:', saleData);
        
        this.broadcaster.broadcast('sale-completed', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: saleData.orderId,
            amount: saleData.amount,
            items: saleData.items || [],
            customer: saleData.customerName || 'Unknown',
            date: saleData.date || new Date().toISOString().split('T')[0],
            description: `Order #${saleData.orderId} - ${saleData.customerName || 'Unknown Customer'}`
        });
    },
    
    // Broadcast when order is deleted
    broadcastOrderDeleted(orderId) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('order-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            orderId: orderId
        });
    },

    // Broadcast when customer is added
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

    // Broadcast when customer is updated
    broadcastCustomerUpdated(customer) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-updated', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name
        });
    },

    // Broadcast when customer is deleted
    broadcastCustomerDeleted(customerId, customerName) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('customer-deleted', {
            module: 'orders',
            timestamp: new Date().toISOString(),
            customerId: customerId,
            customerName: customerName
        });
    },

    // Check inventory for order fulfillment
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

    // Check production for order fulfillment
    checkProductionForOrders(productionData) {
        if (!productionData) return;
        
        // You can add logic here to check if new production affects pending orders
        console.log('Production data received for orders:', productionData);
    },

    // Sync with sales records
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

    // Get real-time stats for dashboard
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

    // Enhanced saveData with broadcasting
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

    // Enhanced loadData
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

    // getDemoOrders method
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

    // getDemoCustomers method
    getDemoCustomers() {
        return [
            { id: 1, name: 'Local Market', contact: '555-0123', address: '123 Main St', email: 'market@local.com' },
            { id: 2, name: 'Restaurant A', contact: '555-0456', address: '456 Oak Ave', email: 'orders@restauranta.com' },
            { id: 3, name: 'Grocery Store B', contact: '555-0789', address: '789 Pine St', email: 'produce@grocerystore.com' }
        ];
    },

    // Theme change handler
    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
    },

    // Complete order method
    completeOrder(orderId) {
        console.log(`✅ Completing order: ${orderId}`);
        
        // Find the order
        const order = this.orders.find(o => o.id == orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        // Mark order as completed
        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        
        // Save to localStorage
        this.saveData();
        
        // Show notification
        this.showNotification(`Order #${orderId} completed!`, 'success');
        
        // Create sale data from order
        const customer = this.customers.find(c => c.id === order.customerId);
        const saleId = 'SALE-' + Date.now().toString().slice(-6);
        
        const saleData = {
            id: saleId,
            date: new Date().toISOString().split('T')[0],
            customer: customer?.name || 'Walk-in',
            product: this.mapOrderItemsToProduct(order.items),
            unit: 'items',
            quantity: this.calculateOrderQuantity(order.items),
            unitPrice: order.totalAmount / this.calculateOrderQuantity(order.items),
            totalAmount: order.totalAmount,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            notes: `From order #${orderId}`,
            orderSource: true,
            orderId: orderId,
            items: order.items,
            customerName: customer?.name || 'Unknown'
        };
        
        console.log('🔄 Creating sale from order:', saleData);
        
        // Broadcast order completed event
        this.broadcastOrderAsSale(order);
        
        // Update UI
        this.renderModule();
        
        console.log('✅ Order completed and communicated to all modules');
        return saleId;
    },

    // Helper functions
    mapOrderItemsToProduct(items) {
        if (!items || items.length === 0) return 'other';
        
        // If there are multiple items, use the first one for categorization
        const firstItem = items[0];
        
        // Map common products
        const productMap = {
            'eggs': 'eggs',
            'broilers': 'broilers-live',
            'layers': 'layers',
            'chicks': 'chicks',
            'feed': 'feed',
            'medication': 'medical',
            'equipment': 'equipment'
        };
        
        return productMap[firstItem.productId] || 'other';
    },

    calculateOrderQuantity(items) {
        if (!items || items.length === 0) return 1;
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    broadcastOrderAsSale(order) {
        console.log('📢 Broadcasting order as sale:', order.id);
        
        const customer = this.customers.find(c => c.id === order.customerId);
        
        // Create sale data
        const saleData = {
            id: order.id,
            date: order.date,
            description: `Order #${order.id} - ${customer?.name || 'Unknown Customer'}`,
            amount: order.totalAmount,
            type: 'income',
            category: 'sales',
            paymentMethod: 'cash',
            reference: `ORDER-${order.id}`,
            notes: `Auto-generated from order. ${order.notes || ''}`,
            items: order.items,
            customerId: order.customerId,
            customerName: customer?.name,
            source: 'orders-module',
            orderId: order.id
        };
        
        // Broadcast via Data Broadcaster
        if (this.broadcaster) {
            console.log('📡 Broadcasting sale-completed event');
            this.broadcaster.broadcast('sale-completed', saleData);
        } else {
            console.log('⚠️ Broadcaster not available, using direct window event');
            // Fallback: use custom event
            const event = new CustomEvent('sale-completed', { detail: saleData });
            window.dispatchEvent(event);
        }
        
        // Also use the existing broadcast method
        if (this.broadcastSaleCompleted) {
            this.broadcastSaleCompleted(saleData);
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
                        <h3 id="order-form-title" style="color: var(--text-primary); margin-bottom: 20px;">Create New Order</h3>
                        <form id="order-form">
                            <input type="hidden" id="editing-order-id" value="">
                            
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
                    const isPending = order.status === 'pending' || order.status === 'draft';
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'"
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary); font-size: 16px; margin-bottom: 4px;">
                                    Order #${order.id} - ${customer?.name || 'Unknown Customer'}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary); display: flex; gap: 16px; align-items: center;">
                                    <span>📅 ${order.date}</span>
                                    <span>📦 ${order.items.length} item${order.items.length > 1 ? 's' : ''}</span>
                                </div>
                                ${order.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px; padding: 4px 8px; background: rgba(0,0,0,0.02); border-radius: 4px;">📝 ${order.notes}</div>` : ''}
                            </div>
                            <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
                                <div>
                                    <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">${this.formatCurrency(order.totalAmount)}</div>
                                    <div style="font-size: 12px; padding: 4px 12px; border-radius: 20px; background: ${this.getStatusColor(order.status)}15; color: ${this.getStatusColor(order.status)}; margin-top: 4px; font-weight: 500; display: inline-block;">
                                        ${this.formatStatus(order.status)}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    ${isPending ? `
                                        <button class="complete-order-btn" data-order-id="${order.id}" 
                                                style="background: var(--success-color, #10b981); border: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; color: white; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);" 
                                                title="Complete Order"
                                                onmouseover="this.style.background='var(--success-hover, #059669)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(16, 185, 129, 0.3)'"
                                                onmouseout="this.style.background='var(--success-color, #10b981)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(16, 185, 129, 0.2)'">
                                            <span style="font-size: 16px;">✅</span> Complete
                                        </button>
                                    ` : ''}
                                    <button class="edit-order" data-id="${order.id}" 
                                            style="background: var(--primary-color, #10b981); border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: white; font-size: 16px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"
                                            title="Edit Order"
                                            onmouseover="this.style.background='var(--primary-hover, #059669)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(16, 185, 129, 0.3)'"
                                            onmouseout="this.style.background='var(--primary-color, #10b981)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(16, 185, 129, 0.2)'">
                                        ✏️
                                    </button>
                                    <button class="delete-order" data-id="${order.id}" 
                                            style="background: #ef4444; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: white; font-size: 16px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"
                                            title="Delete Order"
                                            onmouseover="this.style.background='#dc2626'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(239, 68, 68, 0.3)'"
                                            onmouseout="this.style.background='#ef4444'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(239, 68, 68, 0.2)'">
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
        
        // Remove existing listeners
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
        }
        if (this._captureHandler) {
            document.removeEventListener('click', this._captureHandler, true);
        }
        
        // ===== CAPTURE PHASE HANDLER =====
        this._captureHandler = (e) => {
            const target = e.target;
            
            // Check if this is an order/customer action
            if (target.closest('.edit-order') || 
                target.closest('.delete-order') || 
                target.closest('.edit-customer') || 
                target.closest('.delete-customer') ||
                target.closest('.complete-order-btn')) {
                
                console.log('🛑 CAPTURE PHASE: Intercepting order/customer action');
                
                // Mark this as handled by orders module
                e.stopPropagation();
                e.preventDefault();
                
                // Handle the action immediately in capture phase
                const completeBtn = target.closest('.complete-order-btn');
                if (completeBtn) {
                    const orderId = completeBtn.getAttribute('data-order-id');
                    console.log('✅ CAPTURE: Complete order', orderId);
                    if (orderId) {
                        if (confirm('Complete this order? This will create a sale and add to income.')) {
                            this.completeOrder(orderId);
                        }
                    }
                    return;
                }
                
                const customerDelete = target.closest('.delete-customer');
                if (customerDelete) {
                    const customerId = customerDelete.getAttribute('data-id');
                    console.log('🗑️ CAPTURE: Delete customer', customerId);
                    if (customerId) {
                        this.deleteCustomer(parseInt(customerId));
                    }
                    return;
                }
                
                const customerEdit = target.closest('.edit-customer');
                if (customerEdit) {
                    const customerId = customerEdit.getAttribute('data-id');
                    console.log('👤 CAPTURE: Edit customer', customerId);
                    if (customerId) {
                        this.editCustomer(parseInt(customerId));
                    }
                    return;
                }
                
                const orderDelete = target.closest('.delete-order');
                if (orderDelete) {
                    const orderId = orderDelete.getAttribute('data-id');
                    console.log('🗑️ CAPTURE: Delete order', orderId);
                    if (orderId) {
                        if (confirm('Are you sure you want to delete this order?')) {
                            this.deleteOrder(parseInt(orderId));
                        }
                    }
                    return;
                }
                
                const orderEdit = target.closest('.edit-order');
                if (orderEdit) {
                    const orderId = orderEdit.getAttribute('data-id');
                    console.log('✏️ CAPTURE: Edit order', orderId);
                    if (orderId) {
                        this.editOrder(parseInt(orderId));
                    }
                    return;
                }
            }
        };
        
        // ===== BUBBLE PHASE HANDLER =====
        this._clickHandler = (e) => {
            const target = e.target;
            
            // Log for debugging
            console.log('🔍 BUBBLE PHASE - Click detected:', {
                target: target.tagName,
                classes: target.className,
                id: target.id
            });
            
            // ===== BUTTON HANDLERS (by ID) =====
            const button = target.closest('button');
            if (!button) return;
            
            const buttonId = button.id;
            if (!buttonId) return;
            
            console.log(`Button clicked: ${buttonId}`);
            
            switch(buttonId) {
                case 'create-order-btn':
                case 'show-order-form':
                    this.showOrderForm();
                    break;
                case 'manage-customers-btn':
                    this.showCustomersSection();
                    break;
                case 'view-orders-btn':
                    this.showAllOrders();
                    break;
                case 'add-customer-btn':
                case 'show-customer-form':
                    this.showCustomerForm();
                    break;
                case 'cancel-order-form':
                    this.hideOrderForm();
                    break;
                case 'cancel-customer-form':
                    this.hideCustomerForm();
                    break;
                case 'add-item-btn':
                    this.addOrderItem();
                    break;
                case 'export-orders-btn':
                    this.exportOrders();
                    break;
            }
        };
        
        // Attach capture phase handler
        document.addEventListener('click', this._captureHandler, true);
        
        // Attach bubble phase handler
        document.addEventListener('click', this._clickHandler);
        
        // Form submissions
        document.getElementById('order-form')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('customer-form')?.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        if (orderDate) orderDate.value = today;
        
        // Calculate total when items change
        this.setupTotalCalculation();
        
        // Hover effects
        this.setupHoverEffects();
        
        this._orderListenersAttached = true;
        console.log('✅ Orders module event listeners setup complete');
    },

    showOrderForm() {
        console.log('📝 Showing order form');
        
        try {
            // Hide customers section if it exists
            const customersSection = document.getElementById('customers-section');
            if (customersSection) {
                customersSection.style.display = 'none';
            }
            
            // Show order form container
            const orderFormContainer = document.getElementById('order-form-container');
            if (!orderFormContainer) {
                console.error('❌ Order form container not found - creating it');
                this.createOrderFormContainer();
                return;
            }
            orderFormContainer.classList.remove('hidden');
            
            // Set today's date
            const dateInput = document.getElementById('order-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Reset form
            const form = document.getElementById('order-form');
            if (form) form.reset();
            
            // Clear and add first item
            const itemsContainer = document.getElementById('order-items');
            if (itemsContainer) {
                itemsContainer.innerHTML = '';
                this.addOrderItem();
            }
            
            console.log('✅ Order form shown successfully');
            
        } catch (error) {
            console.error('❌ Error in showOrderForm:', error);
        }
    },

    hideOrderForm() {
        console.log('🙈 Hiding order form');
        const orderFormContainer = document.getElementById('order-form-container');
        if (orderFormContainer) {
            orderFormContainer.classList.add('hidden');
        }
    },

    showCustomerForm() {
        console.log('👤 Showing customer form');
        
        const customerContainer = document.getElementById('customer-form-container');
        if (!customerContainer) {
            console.error('❌ Customer form container not found');
            return;
        }
        
        customerContainer.classList.remove('hidden');
        
        // Hide order form if visible
        const orderContainer = document.getElementById('order-form-container');
        if (orderContainer) orderContainer.classList.add('hidden');
        
        // Reset form
        const form = document.getElementById('customer-form');
        if (form) form.reset();
        
        // Update title
        const title = document.querySelector('#customer-form-container h3');
        if (title) title.textContent = 'Add New Customer';
        
        // Update submit button
        const submitBtn = document.querySelector('#customer-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Add Customer';
    },

    hideCustomerForm() {
        console.log('🙈 Hiding customer form');
        const customerContainer = document.getElementById('customer-form-container');
        if (customerContainer) {
            customerContainer.classList.add('hidden');
        }
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
        }
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
        
        const editingId = document.getElementById('editing-order-id')?.value;
        const isEditing = editingId && editingId !== '';
        
        // Get form values
        const customerId = parseInt(document.getElementById('order-customer').value);
        const date = document.getElementById('order-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        
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
            this.showNotification('Please add at least one item', 'error');
            return;
        }
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        if (isEditing) {
            // Update existing order
            const orderIndex = this.orders.findIndex(o => o.id == editingId);
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
                
                // Broadcast update
                this.broadcastOrderUpdated(this.orders[orderIndex]);
                
                this.showNotification(`Order #${editingId} updated!`, 'success');
            }
        } else {
            // Create new order
            const orderData = {
                id: Date.now(),
                customerId,
                date,
                items,
                totalAmount,
                status,
                notes
            };
            this.orders.unshift(orderData);
            this.saveData();
            
            // Broadcast creation
            this.broadcastOrderCreated(orderData);
            
            this.showNotification('Order created successfully!', 'success');
        }
        
        // Reset and hide form
        this.hideOrderForm();
        this.renderModule();
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
        
        // Broadcast customer added
        this.broadcastCustomerAdded(customerData);
        
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
            
            // Broadcast order deleted
            this.broadcastOrderDeleted(id);
            
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Order deleted successfully!', 'success');
            }
        }
    },

    editOrder(orderId) {
        console.log('✏️ Editing order:', orderId);
        
        // Find the order
        const order = this.orders.find(o => o.id == orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        // Show the order form
        this.showOrderForm();
        
        // Wait for form to be visible then populate
        setTimeout(() => {
            // Set editing ID
            let editingIdField = document.getElementById('editing-order-id');
            if (!editingIdField) {
                editingIdField = document.createElement('input');
                editingIdField.type = 'hidden';
                editingIdField.id = 'editing-order-id';
                document.getElementById('order-form').appendChild(editingIdField);
            }
            editingIdField.value = order.id;
            
            // Change title
            const title = document.querySelector('#order-form-container h3');
            if (title) title.textContent = 'Edit Order';
            
            // Change submit button
            const submitBtn = document.querySelector('#order-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Order';
            }
            
            // Populate basic fields
            document.getElementById('order-customer').value = order.customerId;
            document.getElementById('order-date').value = order.date;
            document.getElementById('order-status').value = order.status;
            document.getElementById('order-notes').value = order.notes || '';
            
            // Clear and repopulate items
            const itemsContainer = document.getElementById('order-items');
            itemsContainer.innerHTML = '';
            
            order.items.forEach(item => {
                this.addOrderItem({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                });
            });
            
            // Recalculate total
            this.calculateTotal();
            
        }, 100);
    },

    deleteCustomer(id) {
        console.log('🗑️ deleteCustomer function CALLED with:', id);
        
        // Find the customer
        let customer = this.customers.find(c => c.id == id);

        if (!customer) {
            console.error('❌ Customer not found for ID:', id);
            this.showNotification('Customer not found', 'error');
            return;
        }

        console.log('✅ Found customer:', customer);

        // Check if customer has orders
        const customerOrders = this.orders.filter(o => o.customerId == customer.id);
        console.log('📦 Customer orders:', customerOrders.length);

        if (customerOrders.length > 0) {
            const message = `Cannot delete "${customer.name}" because they have ${customerOrders.length} order(s). Delete their orders first.`;
            console.warn('⚠️', message);
            this.showNotification(message, 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
            console.log('✅ Deleting customer:', customer.name);
            
            // Filter out the customer
            this.customers = this.customers.filter(c => c.id != customer.id);
            
            // Save to localStorage
            this.saveData();
            
            // Broadcast deletion
            if (this.broadcastCustomerDeleted) {
                this.broadcastCustomerDeleted(customer.id, customer.name);
            }
            
            // Re-render
            this.renderModule();
            
            // Show success message
            this.showNotification(`Customer "${customer.name}" deleted successfully!`, 'success');
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
    },

    // Add the unload method
    unload() {
        console.log('📦 Unloading Orders module...');
        
        // Remove event listeners
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }
        if (this._captureHandler) {
            document.removeEventListener('click', this._captureHandler, true);
            this._captureHandler = null;
        }
        
        // Hide any open forms
        this.hideOrderForm();
        this.hideCustomerForm();
        
        // Reset state
        this.initialized = false;
        this.element = null;
        this._orderListenersAttached = false;
        
        console.log('✅ Orders module unloaded');
    }
};

// Register with FarmModules
if (window.FarmModules) {
    FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders Management module registered');
} else {
    console.error('❌ FarmModules framework not found');
}

// Also add to modules Map
if (window.FarmModules) {
    window.FarmModules.modules.set('orders', OrdersModule);
    window.FarmModules.modules.set('orders.js', OrdersModule);
    window.FarmModules.orders = OrdersModule;
    window.FarmModules.Orders = OrdersModule;
    console.log('✅ Orders module added to FarmModules object');
}
