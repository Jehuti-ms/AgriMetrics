// modules/orders.js - FULLY WORKING WITH CUSTOMER & PRODUCT MANAGEMENT
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    orders: [],
    customers: [],
    products: [],
    currentView: 'orders-overview',

    initialize() {
        console.log('📋 Initializing orders...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const savedOrders = localStorage.getItem('farm-orders');
        const savedCustomers = localStorage.getItem('farm-customers');
        const savedProducts = localStorage.getItem('farm-products');
        
        this.orders = savedOrders ? JSON.parse(savedOrders) : this.getDemoOrders();
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : this.getDemoCustomers();
        this.products = savedProducts ? JSON.parse(savedProducts) : this.getDemoProducts();
    },

    getDemoOrders() {
        return [
            {
                id: 1,
                orderNumber: 'ORD-001',
                customerId: 1,
                date: '2024-03-15',
                status: 'completed',
                items: [
                    { productId: 1, quantity: 20, unitPrice: 8.50, total: 170 },
                    { productId: 2, quantity: 5, unitPrice: 12.00, total: 60 }
                ],
                totalAmount: 230,
                paymentStatus: 'paid',
                deliveryDate: '2024-03-16',
                notes: 'Regular customer - prompt payment'
            },
            {
                id: 2,
                orderNumber: 'ORD-002',
                customerId: 2,
                date: '2024-03-14',
                status: 'processing',
                items: [
                    { productId: 3, quantity: 100, unitPrice: 0.25, total: 25 }
                ],
                totalAmount: 25,
                paymentStatus: 'pending',
                deliveryDate: '2024-03-17',
                notes: 'New customer - follow up'
            },
            {
                id: 3,
                orderNumber: 'ORD-003',
                customerId: 3,
                date: '2024-03-13',
                status: 'pending',
                items: [
                    { productId: 1, quantity: 50, unitPrice: 8.00, total: 400 },
                    { productId: 4, quantity: 10, unitPrice: 5.00, total: 50 }
                ],
                totalAmount: 450,
                paymentStatus: 'pending',
                deliveryDate: '2024-03-20',
                notes: 'Bulk order - confirm stock'
            }
        ];
    },

    getDemoCustomers() {
        return [
            { id: 1, name: 'Restaurant A', email: 'orders@restauranta.com', phone: '+1234567890', address: '123 Main St, City', type: 'restaurant' },
            { id: 2, name: 'Local Market', email: 'produce@localmarket.com', phone: '+1234567891', address: '456 Market Ave, Town', type: 'retail' },
            { id: 3, name: 'Hotel Grand', email: 'procurement@hotelgrand.com', phone: '+1234567892', address: '789 Luxury Blvd, City', type: 'hotel' },
            { id: 4, name: 'Individual Customer', email: 'john@email.com', phone: '+1234567893', address: '321 Home St, Village', type: 'individual' }
        ];
    },

    getDemoProducts() {
        return [
            { id: 1, name: 'Broilers', category: 'poultry', unit: 'birds', price: 8.50, inStock: true, stock: 150, minStock: 20 },
            { id: 2, name: 'Layers', category: 'poultry', unit: 'birds', price: 12.00, inStock: true, stock: 45, minStock: 10 },
            { id: 3, name: 'Eggs', category: 'eggs', unit: 'pieces', price: 0.25, inStock: true, stock: 500, minStock: 100 },
            { id: 4, name: 'Manure', category: 'fertilizer', unit: 'bags', price: 5.00, inStock: true, stock: 30, minStock: 5 },
            { id: 5, name: 'Chicken Feed', category: 'feed', unit: 'kg', price: 2.50, inStock: false, stock: 0, minStock: 50 }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        if (this.currentView === 'customer-management') {
            contentArea.innerHTML = this.renderCustomerManagement();
            this.setupCustomerManagementListeners();
            return;
        }

        if (this.currentView === 'product-management') {
            contentArea.innerHTML = this.renderProductManagement();
            this.setupProductManagementListeners();
            return;
        }

        // Default orders overview view
        const stats = this.calculateStats();
        const recentOrders = this.orders.slice(0, 5);

        contentArea.innerHTML = this.renderOrdersOverview(stats, recentOrders);
        this.setupOrdersListeners();
    },

    renderOrdersOverview(stats, recentOrders) {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Orders Management</h1>
                    <p class="module-subtitle">Manage customer orders and deliveries</p>
                </div>

                <!-- Orders Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalOrders}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalRevenue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                        <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${stats.pendingOrders}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Pending</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.avgOrderValue}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Order</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="create-order-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Create Order</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">New customer order</span>
                    </button>
                    <button class="quick-action-btn" id="manage-customers-btn">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                    <button class="quick-action-btn" id="manage-products-btn">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Products</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage products</span>
                    </button>
                    <button class="quick-action-btn" id="orders-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Orders Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Sales analytics</span>
                    </button>
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
                                            <option value="${customer.id}">${customer.name} (${customer.type})</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Order Date</label>
                                    <input type="date" class="form-input" id="order-date" required>
                                </div>
                            </div>
                            
                            <!-- Order Items -->
                            <div style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <label class="form-label">Order Items</label>
                                    <button type="button" class="btn-outline" id="add-order-item" style="font-size: 12px; padding: 6px 12px;">
                                        + Add Item
                                    </button>
                                </div>
                                <div id="order-items-container">
                                    <!-- Items will be added dynamically -->
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border);">
                                    <div style="font-weight: 600; color: var(--text-primary);">Total Amount:</div>
                                    <div style="font-size: 18px; font-weight: bold; color: var(--primary-color);" id="order-total-amount">$0.00</div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Delivery Date</label>
                                    <input type="date" class="form-input" id="delivery-date">
                                </div>
                                <div>
                                    <label class="form-label">Payment Status</label>
                                    <select class="form-input" id="payment-status" required>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="partial">Partial</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Order Notes</label>
                                <textarea class="form-input" id="order-notes" rows="3" placeholder="Special instructions, delivery notes, etc."></textarea>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Create Order</button>
                                <button type="button" class="btn-outline" id="cancel-order-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Orders & Quick Stats -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Recent Orders -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Recent Orders</h3>
                            <button class="btn-primary" id="show-order-form">Create Order</button>
                        </div>
                        <div id="recent-orders-list">
                            ${this.renderRecentOrders(recentOrders)}
                        </div>
                    </div>

                    <!-- Orders Summary -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Orders Summary</h3>
                        <div id="orders-summary">
                            ${this.renderOrdersSummary(stats)}
                        </div>
                    </div>
                </div>

                <!-- All Orders Table -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">All Orders</h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" id="status-filter" style="width: auto;">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <input type="text" class="form-input" id="search-orders" placeholder="Search orders..." style="width: 200px;">
                        </div>
                    </div>
                    <div id="all-orders-table">
                        ${this.renderAllOrdersTable()}
                    </div>
                </div>
            </div>
        `;
    },

    renderCustomerManagement() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Customer Management</h1>
                    <p class="module-subtitle">Manage your customer database</p>
                </div>

                <!-- Customer Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.customers.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Customers</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🏢</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.customers.filter(c => c.type === 'restaurant').length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Restaurants</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🛒</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.customers.filter(c => c.type === 'retail').length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Retailers</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🏨</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.customers.filter(c => c.type === 'hotel').length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Hotels</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-customer-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Customer</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">New customer</span>
                    </button>
                    <button class="quick-action-btn" id="back-to-orders-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Orders</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Back to orders</span>
                    </button>
                </div>

                <!-- Add Customer Form -->
                <div id="customer-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add New Customer</h3>
                        <form id="customer-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Full Name / Business Name</label>
                                    <input type="text" class="form-input" id="customer-name" required>
                                </div>
                                <div>
                                    <label class="form-label">Customer Type</label>
                                    <select class="form-input" id="customer-type" required>
                                        <option value="individual">Individual</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="retail">Retail Store</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="wholesale">Wholesaler</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="customer-email" required>
                                </div>
                                <div>
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-input" id="customer-phone" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Address</label>
                                <textarea class="form-input" id="customer-address" rows="3" required></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Customer</button>
                                <button type="button" class="btn-outline" id="cancel-customer-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Customers List -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">All Customers</h3>
                    <div id="customers-list">
                        ${this.renderCustomersList()}
                    </div>
                </div>
            </div>
        `;
    },

    renderProductManagement() {
        return `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Product Management</h1>
                    <p class="module-subtitle">Manage your product catalog</p>
                </div>

                <!-- Product Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.products.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Products</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.products.filter(p => p.category === 'poultry').length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Poultry</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🥚</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.products.filter(p => p.category === 'eggs').length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Eggs</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444; margin-bottom: 4px;">${this.products.filter(p => !p.inStock).length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Out of Stock</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-product-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Product</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">New product</span>
                    </button>
                    <button class="quick-action-btn" id="back-to-orders-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Orders</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Back to orders</span>
                    </button>
                </div>

                <!-- Add Product Form -->
                <div id="product-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add New Product</h3>
                        <form id="product-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-input" id="product-name" required>
                                </div>
                                <div>
                                    <label class="form-label">Category</label>
                                    <select class="form-input" id="product-category" required>
                                        <option value="poultry">Poultry</option>
                                        <option value="eggs">Eggs</option>
                                        <option value="feed">Feed</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Price</label>
                                    <input type="number" class="form-input" id="product-price" step="0.01" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-input" id="product-unit" placeholder="birds, kg, pieces..." required>
                                </div>
                                <div>
                                    <label class="form-label">Stock Quantity</label>
                                    <input type="number" class="form-input" id="product-stock" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Minimum Stock</label>
                                    <input type="number" class="form-input" id="product-min-stock" min="0" required>
                                </div>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Product</button>
                                <button type="button" class="btn-outline" id="cancel-product-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Products List -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">All Products</h3>
                    <div id="products-list">
                        ${this.renderProductsList()}
                    </div>
                </div>
            </div>
        `;
    },

    renderCustomersList() {
        if (this.customers.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No customers yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add your first customer to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.customers.map(customer => {
                    const customerOrders = this.orders.filter(order => order.customerId === customer.id);
                    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 24px;">👤</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">
                                        ${customer.name}
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${customer.email} • ${customer.phone}
                                    </div>
                                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                                        <span style="padding: 2px 8px; border-radius: 8px; background: #3b82f620; color: #3b82f6; font-size: 11px; font-weight: 600;">
                                            ${customer.type}
                                        </span>
                                        <span style="padding: 2px 8px; border-radius: 8px; background: #22c55e20; color: #22c55e; font-size: 11px; font-weight: 600;">
                                            ${customerOrders.length} orders
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: var(--text-primary); font-size: 16px;">
                                    ${this.formatCurrency(totalSpent)}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Total spent</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderProductsList() {
        if (this.products.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No products yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add your first product to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.products.map(product => {
                    const stockStatus = product.stock === 0 ? 'out-of-stock' : 
                                      product.stock <= product.minStock ? 'low-stock' : 'in-stock';
                    const statusColor = stockStatus === 'out-of-stock' ? '#ef4444' : 
                                      stockStatus === 'low-stock' ? '#f59e0b' : '#22c55e';
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 24px;">📦</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">
                                        ${product.name}
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${product.category} • ${this.formatCurrency(product.price)}/${product.unit}
                                    </div>
                                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                                        <span style="padding: 2px 8px; border-radius: 8px; background: ${statusColor}20; color: ${statusColor}; font-size: 11px; font-weight: 600;">
                                            ${stockStatus.replace('-', ' ')}
                                        </span>
                                        <span style="padding: 2px 8px; border-radius: 8px; background: #6b728020; color: #6b7280; font-size: 11px; font-weight: 600;">
                                            Stock: ${product.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: var(--text-primary); font-size: 16px;">
                                    ${product.inStock ? 'Available' : 'Out of Stock'}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Status</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ... (keep all the existing methods like calculateStats, renderRecentOrders, etc.)

    setupOrdersListeners() {
        // Form buttons
        document.getElementById('show-order-form')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('create-order-btn')?.addEventListener('click', () => this.showOrderForm());
        document.getElementById('manage-customers-btn')?.addEventListener('click', () => this.manageCustomers());
        document.getElementById('manage-products-btn')?.addEventListener('click', () => this.manageProducts());
        document.getElementById('orders-report-btn')?.addEventListener('click', () => this.generateOrdersReport());
        
        // Form handlers
        document.getElementById('order-form')?.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('cancel-order-form')?.addEventListener('click', () => this.hideOrderForm());
        document.getElementById('add-order-item')?.addEventListener('click', () => this.addOrderItem());
        
        // Filter and search
        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('search-orders')?.addEventListener('input', (e) => this.searchOrders(e.target.value));
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-order')) {
                const id = parseInt(e.target.closest('.delete-order').dataset.id);
                this.deleteOrder(id);
            }
            if (e.target.closest('.view-order')) {
                const id = parseInt(e.target.closest('.view-order').dataset.id);
                this.viewOrder(id);
            }
            if (e.target.closest('.edit-order')) {
                const id = parseInt(e.target.closest('.edit-order').dataset.id);
                this.editOrder(id);
            }
            if (e.target.closest('.remove-order-item')) {
                e.target.closest('.order-item-row').remove();
                this.calculateOrderTotal();
            }
        });

        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const orderDate = document.getElementById('order-date');
        const deliveryDate = document.getElementById('delivery-date');
        if (orderDate) orderDate.value = today;

        // Hover effects
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

    setupCustomerManagementListeners() {
        document.getElementById('add-customer-btn')?.addEventListener('click', () => {
            document.getElementById('customer-form-container').classList.remove('hidden');
        });

        document.getElementById('cancel-customer-form')?.addEventListener('click', () => {
            document.getElementById('customer-form-container').classList.add('hidden');
            document.getElementById('customer-form').reset();
        });

        document.getElementById('customer-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCustomerSubmit();
        });

        document.getElementById('back-to-orders-btn')?.addEventListener('click', () => {
            this.currentView = 'orders-overview';
            this.renderModule();
        });
    },

    setupProductManagementListeners() {
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            document.getElementById('product-form-container').classList.remove('hidden');
        });

        document.getElementById('cancel-product-form')?.addEventListener('click', () => {
            document.getElementById('product-form-container').classList.add('hidden');
            document.getElementById('product-form').reset();
        });

        document.getElementById('product-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        document.getElementById('back-to-orders-btn')?.addEventListener('click', () => {
            this.currentView = 'orders-overview';
            this.renderModule();
        });
    },

    manageCustomers() {
        this.currentView = 'customer-management';
        this.renderModule();
    },

    manageProducts() {
        this.currentView = 'product-management';
        this.renderModule();
    },

    handleCustomerSubmit() {
        const customer = {
            id: Date.now(),
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value,
            type: document.getElementById('customer-type').value,
            address: document.getElementById('customer-address').value
        };

        this.customers.push(customer);
        this.saveData();
        
        document.getElementById('customer-form').reset();
        document.getElementById('customer-form-container').classList.add('hidden');
        
        this.showNotification('Customer added successfully!', 'success');
        this.renderModule();
    },

    handleProductSubmit() {
        const stock = parseInt(document.getElementById('product-stock').value);
        const product = {
            id: Date.now(),
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            stock: stock,
            minStock: parseInt(document.getElementById('product-min-stock').value),
            inStock: stock > 0
        };

        this.products.push(product);
        this.saveData();
        
        document.getElementById('product-form').reset();
        document.getElementById('product-form-container').classList.add('hidden');
        
        this.showNotification('Product added successfully!', 'success');
        this.renderModule();
    },

    showNotification(message, type = 'info') {
        if (window.coreModule) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(`${type}: ${message}`);
        }
    },

    // ... (keep all other existing methods exactly as they were)

};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
}
