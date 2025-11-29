// modules/orders.js - UPDATED WITH SHARED DATA PATTERN
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
        this.syncStatsWithDashboard();
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

        const stats = this.calculateStats();
        const recentOrders = this.orders.slice(0, 5);
        contentArea.innerHTML = this.renderOrdersOverview(stats, recentOrders);
        this.setupOrdersListeners();
    },

    // KEEP ALL RENDER METHODS EXACTLY AS THEY WERE
    renderOrdersOverview(stats, recentOrders) {
        // ... (keep the entire renderOrdersOverview method exactly as is)
    },

    renderCustomerManagement() {
        // ... (keep the entire renderCustomerManagement method exactly as is)
    },

    renderProductManagement() {
        // ... (keep the entire renderProductManagement method exactly as is)
    },

    // KEEP ALL MODAL CONTROL METHODS EXACTLY AS THEY WERE
    showConfirmationModal(title, message, confirmCallback) {
        // ... (keep the entire showConfirmationModal method exactly as is)
    },

    hideConfirmationModal() {
        // ... (keep the entire hideConfirmationModal method exactly as is)
    },

    showOrderDetailsModal(order) {
        // ... (keep the entire showOrderDetailsModal method exactly as is)
    },

    hideOrderDetailsModal() {
        // ... (keep the entire hideOrderDetailsModal method exactly as is)
    },

    showOrdersReportModal() {
        // ... (keep the entire showOrdersReportModal method exactly as is)
    },

    hideOrdersReportModal() {
        // ... (keep the entire hideOrdersReportModal method exactly as is)
    },

    // KEEP ALL SETUP LISTENERS EXACTLY AS THEY WERE
    setupOrdersListeners() {
        // ... (keep the entire setupOrdersListeners method exactly as is)
    },

    setupCustomerManagementListeners() {
        // ... (keep the entire setupCustomerManagementListeners method exactly as is)
    },

    setupProductManagementListeners() {
        // ... (keep the entire setupProductManagementListeners method exactly as is)
    },

    // KEEP ALL ORDER MANAGEMENT METHODS EXACTLY AS THEY WERE
    showOrderForm() {
        // ... (keep the entire showOrderForm method exactly as is)
    },

    hideOrderForm() {
        // ... (keep the entire hideOrderForm method exactly as is)
    },

    addOrderItem() {
        // ... (keep the entire addOrderItem method exactly as is)
    },

    calculateItemTotal(itemRow) {
        // ... (keep the entire calculateItemTotal method exactly as is)
    },

    calculateOrderTotal() {
        // ... (keep the entire calculateOrderTotal method exactly as is)
    },

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const customerId = parseInt(document.getElementById('order-customer').value);
        const orderDate = document.getElementById('order-date').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const paymentStatus = document.getElementById('payment-status').value;
        const notes = document.getElementById('order-notes').value;

        // Collect order items
        const items = [];
        const itemRows = document.querySelectorAll('.order-item-row');
        
        itemRows.forEach(row => {
            const productId = parseInt(row.querySelector('.order-item-product').value);
            const quantity = parseInt(row.querySelector('.order-item-quantity').value);
            const unitPrice = parseFloat(row.querySelector('.order-item-price').value);
            
            if (productId && quantity && unitPrice) {
                items.push({
                    productId,
                    quantity,
                    unitPrice,
                    total: quantity * unitPrice
                });
            }
        });

        if (items.length === 0) {
            this.showNotification('Please add at least one item to the order.', 'error');
            return;
        }

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        const orderNumber = `ORD-${String(this.orders.length + 1).padStart(3, '0')}`;

        const newOrder = {
            id: Date.now(),
            orderNumber,
            customerId,
            date: orderDate,
            status: 'pending',
            items,
            totalAmount,
            paymentStatus,
            deliveryDate: deliveryDate || null,
            notes: notes || ''
        };

        this.orders.unshift(newOrder);
        this.saveData();
        this.renderModule();
        
        // SYNC WITH DASHBOARD - Update order stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'order_created',
            order: newOrder
        });
        
        this.showNotification(`Order ${orderNumber} created successfully!`, 'success');
        this.hideOrderForm();
    },

    deleteOrder(id) {
        const order = this.orders.find(order => order.id === id);
        if (!order) return;

        this.showConfirmationModal(
            'Delete Order',
            `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
            () => {
                this.orders = this.orders.filter(order => order.id !== id);
                this.saveData();
                this.renderModule();
                
                // SYNC WITH DASHBOARD - Update stats after deletion
                this.syncStatsWithDashboard();
                
                // Add recent activity
                this.addRecentActivity({
                    type: 'order_deleted',
                    order: order
                });
                
                this.showNotification(`Order ${order.orderNumber} deleted!`, 'success');
            }
        );
    },

    viewOrder(id) {
        const order = this.orders.find(order => order.id === id);
        if (order) {
            this.showOrderDetailsModal(order);
        }
    },

    editOrder(id) {
        this.showNotification('Edit order functionality coming soon! For now, you can delete and recreate the order.', 'info');
    },

    filterOrders(status) {
        // ... (keep the entire filterOrders method exactly as is)
    },

    searchOrders(query) {
        // ... (keep the entire searchOrders method exactly as is)
    },

    // KEEP ALL CUSTOMER & PRODUCT MANAGEMENT METHODS EXACTLY AS THEY WERE
    manageCustomers() {
        // ... (keep the entire manageCustomers method exactly as is)
    },

    manageProducts() {
        // ... (keep the entire manageProducts method exactly as is)
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
        
        // SYNC WITH DASHBOARD - Update customer stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'customer_added',
            customer: customer
        });
        
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
        
        // SYNC WITH DASHBOARD - Update product stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'product_added',
            product: product
        });
        
        document.getElementById('product-form').reset();
        document.getElementById('product-form-container').classList.add('hidden');
        
        this.showNotification('Product added successfully!', 'success');
        this.renderModule();
    },

    // KEEP ALL REPORTS & ANALYTICS METHODS EXACTLY AS THEY WERE
    generateOrdersReport() {
        // ... (keep the entire generateOrdersReport method exactly as is)
    },

    printOrdersReport() {
        // ... (keep the entire printOrdersReport method exactly as is)
    },

    // KEEP ALL RENDER METHODS EXACTLY AS THEY WERE
    renderRecentOrders(orders) {
        // ... (keep the entire renderRecentOrders method exactly as is)
    },

    renderOrdersSummary(stats) {
        // ... (keep the entire renderOrdersSummary method exactly as is)
    },

    renderAllOrdersTable() {
        // ... (keep the entire renderAllOrdersTable method exactly as is)
    },

    renderCustomersList() {
        // ... (keep the entire renderCustomersList method exactly as is)
    },

    renderProductsList() {
        // ... (keep the entire renderProductsList method exactly as is)
    },

    // UPDATED METHOD: Sync order stats with dashboard (no ProfileModule dependency)
    syncStatsWithDashboard() {
        const stats = this.calculateStats();
        
        // Update shared data structure
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            // Update order stats in shared data
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                totalCustomers: stats.totalCustomers,
                totalProducts: stats.totalProducts,
                completedOrders: stats.statusCounts.completed,
                monthlyRevenue: stats.monthlyRevenue
            });
        }
        
        // Notify dashboard module if available
        if (window.FarmModules && window.FarmModules.modules.dashboard) {
            window.FarmModules.modules.dashboard.updateDashboardStats({
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                totalCustomers: stats.totalCustomers,
                totalProducts: stats.totalProducts,
                completedOrders: stats.statusCounts.completed,
                monthlyRevenue: stats.monthlyRevenue
            });
        }
    },

    // NEW METHOD: Add recent activity to dashboard
    addRecentActivity(activityData) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        switch (activityData.type) {
            case 'order_created':
                activity = {
                    type: 'order_created',
                    message: `New order: ${activityData.order.orderNumber} - ${this.formatCurrency(activityData.order.totalAmount)}`,
                    icon: '📋'
                };
                break;
            case 'order_deleted':
                activity = {
                    type: 'order_deleted',
                    message: `Deleted order: ${activityData.order.orderNumber}`,
                    icon: '🗑️'
                };
                break;
            case 'customer_added':
                activity = {
                    type: 'customer_added',
                    message: `New customer: ${activityData.customer.name}`,
                    icon: '👥'
                };
                break;
            case 'product_added':
                activity = {
                    type: 'product_added',
                    message: `New product: ${activityData.product.name}`,
                    icon: '📦'
                };
                break;
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    // NEW METHOD: Get orders summary for other modules
    getOrdersSummary() {
        const stats = this.calculateStats();
        return {
            ...stats,
            recentOrders: this.orders.slice(0, 5),
            topCustomers: this.getTopCustomers(3),
            lowStockProducts: this.products.filter(p => p.stock <= p.minStock)
        };
    },

    // NEW METHOD: Get top customers by revenue
    getTopCustomers(limit = 5) {
        const customerRevenue = {};
        
        this.orders.forEach(order => {
            const customer = this.customers.find(c => c.id === order.customerId);
            if (customer) {
                customerRevenue[customer.name] = (customerRevenue[customer.name] || 0) + order.totalAmount;
            }
        });

        return Object.entries(customerRevenue)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([name, revenue]) => ({ name, revenue }));
    },

    // NEW METHOD: Check if product is available for order
    isProductAvailable(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        return product && product.inStock && product.stock >= quantity;
    },

    // KEEP ALL UTILITY METHODS EXACTLY AS THEY WERE
    calculateStats() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const avgOrderValue = totalOrders > 0 ? this.formatCurrency(totalRevenue / totalOrders) : '$0.00';

        const statusCounts = {
            pending: this.orders.filter(order => order.status === 'pending').length,
            processing: this.orders.filter(order => order.status === 'processing').length,
            completed: this.orders.filter(order => order.status === 'completed').length,
            cancelled: this.orders.filter(order => order.status === 'cancelled').length
        };

        const paymentCounts = {
            paid: this.orders.filter(order => order.paymentStatus === 'paid').length,
            pending: this.orders.filter(order => order.paymentStatus === 'pending').length,
            partial: this.orders.filter(order => order.paymentStatus === 'partial').length,
            overdue: this.orders.filter(order => order.paymentStatus === 'overdue').length
        };

        const recentMonth = new Date();
        recentMonth.setMonth(recentMonth.getMonth() - 1);
        const monthlyOrders = this.orders.filter(order => new Date(order.date) >= recentMonth);
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            avgOrderValue,
            statusCounts,
            paymentCounts,
            monthlyOrders: monthlyOrders.length,
            monthlyRevenue,
            totalCustomers: this.customers.length,
            totalProducts: this.products.length
        };
    },

    getStatusColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'completed': '#22c55e',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    },

    getPaymentColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'paid': '#22c55e',
            'partial': '#3b82f6',
            'overdue': '#ef4444'
        };
        return colors[status] || '#6b7280';
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
        localStorage.setItem('farm-products', JSON.stringify(this.products));
    },

    showNotification(message, type = 'info') {
        if (window.coreModule) {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type}: ${message}`);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders module registered');
}
