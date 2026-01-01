// modules/orders.js - UPDATED WITH DATA BROADCASTER INTEGRATION
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
    broadcaster: null, // Add broadcaster reference

    initialize() {
        console.log('📋 Initializing Orders Management...');
        
        // ✅ Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ Get Broadcaster instance
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Orders module connected to Data Broadcaster');
        }

        // ✅ Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule('orders', this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.setupBroadcasterListeners(); // NEW: Setup broadcaster listeners
        this.initialized = true;
        
        console.log('✅ Orders Management initialized with StyleManager & Data Broadcaster');
        
        // ✅ Broadcast orders loaded
        this.broadcastOrdersLoaded();
        
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

    // MODIFIED: Enhanced handleOrderSubmit with broadcasting
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
        
        // ✅ Broadcast order created
        this.broadcastOrderCreated(orderData);
        
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Order #${orderData.id} created successfully!`, 'success');
        }
    },

    // MODIFIED: Enhanced handleCustomerSubmit with broadcasting
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

    // MODIFIED: Enhanced deleteOrder with broadcasting
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

    // MODIFIED: Enhanced updateEditedOrder with broadcasting
    updateEditedOrder(orderId) {
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
            const oldStatus = this.orders[orderIndex].status;
            const oldAmount = this.orders[orderIndex].totalAmount;
            
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
            
            // ✅ Broadcast order updated
            this.broadcastOrderUpdated(this.orders[orderIndex]);
            
            // If status changed to completed from something else, broadcast sale
            if (status === 'completed' && oldStatus !== 'completed') {
                const customer = this.customers.find(c => c.id === customerId);
                this.broadcaster.broadcast('sale-completed', {
                    module: 'orders',
                    timestamp: new Date().toISOString(),
                    orderId: orderId,
                    amount: totalAmount,
                    customer: customer?.name || 'Unknown'
                });
            }
            
            this.renderModule();
            this.hideOrderForm();
            this.cancelOrderEdit();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Order #${orderId} updated!`, 'success');
            }
        }
    },

    // MODIFIED: Enhanced updateEditedCustomer with broadcasting
    updateEditedCustomer(customerId) {
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
            
            // ✅ Broadcast customer updated
            this.broadcastCustomerUpdated(this.customers[customerIndex]);
            
            this.renderModule();
            this.hideCustomerForm();
            this.cancelCustomerEdit();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Customer "${customerData.name}" updated!`, 'success');
            }
        }
    },

    // MODIFIED: Enhanced deleteCustomer with broadcasting
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

    // Keep all other existing methods unchanged...

    // ✅ NEW: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Orders Management updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
    },

    // ... rest of your existing methods remain the same ...

    // ✅ NEW: Enhanced calculateStats that broadcasts
    calculateStats() {
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;
        
        const stats = {
            totalOrders: this.orders.length,
            pendingOrders: pendingOrders,
            completedOrders: completedOrders,
            totalRevenue: this.getTotalRevenue()
        };
        
        return stats;
    }
};

// ... rest of the file remains the same ...

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
