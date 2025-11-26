// modules/orders.js
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,
    ordersData: [],

    initialize() {
        console.log('📋 Initializing orders management...');
        this.loadOrdersData();
        this.renderOrders();
        this.initialized = true;
        return true;
    },

    loadOrdersData() {
        const savedData = localStorage.getItem('farm-orders-data');
        if (savedData) {
            this.ordersData = JSON.parse(savedData);
        }
    },

    saveOrdersData() {
        localStorage.setItem('farm-orders-data', JSON.stringify(this.ordersData));
    },

    addOrder(orderData) {
        const order = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            orderNumber: `ORD-${String(this.ordersData.length + 1).padStart(3, '0')}`,
            customer: orderData.customer,
            product: orderData.product,
            quantity: parseInt(orderData.quantity),
            price: parseFloat(orderData.price),
            total: parseFloat(orderData.quantity) * parseFloat(orderData.price),
            status: 'pending',
            deliveryDate: orderData.deliveryDate,
            notes: orderData.notes || ''
        };
        
        this.ordersData.unshift(order);
        this.saveOrdersData();
        this.updateOrdersDisplay();
        this.showNotification('Order created successfully!', 'success');
    },

    updateOrderStatus(orderId, newStatus) {
        const order = this.ordersData.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrdersData();
            this.updateOrdersDisplay();
            this.showNotification(`Order status updated to ${newStatus}`, 'success');
        }
    },

    deleteOrder(orderId) {
        this.ordersData = this.ordersData.filter(order => order.id !== orderId);
        this.saveOrdersData();
        this.updateOrdersDisplay();
        this.showNotification('Order deleted!', 'success');
    },

    calculateOrdersStats() {
        const pending = this.ordersData.filter(order => order.status === 'pending').length;
        const completed = this.ordersData.filter(order => order.status === 'completed').length;
        const totalRevenue = this.ordersData
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        return {
            pending,
            completed,
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders: this.ordersData.length
        };
    },

    updateOrdersDisplay() {
        const stats = this.calculateOrdersStats();
        
        // Update summary cards
        const pendingEl = document.querySelector('.orders-summary-card:nth-child(1) div:nth-child(3)');
        const completedEl = document.querySelector('.orders-summary-card:nth-child(2) div:nth-child(3)');
        const revenueEl = document.querySelector('.orders-summary-card:nth-child(3) div:nth-child(3)');
        
        if (pendingEl) pendingEl.textContent = stats.pending;
        if (completedEl) completedEl.textContent = stats.completed;
        if (revenueEl) revenueEl.textContent = `$${stats.totalRevenue}`;

        // Update orders table
        this.renderOrdersTable();
    },

    renderOrdersTable() {
        const ordersContainer = document.querySelector('.orders-container');
        if (!ordersContainer) return;

        if (this.ordersData.length === 0) {
            ordersContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No orders yet</div>
                    <div style="font-size: 14px; color: #999;">Create your first order</div>
                </div>
            `;
            return;
        }

        const recentOrders = this.ordersData.slice(0, 10);
        
        ordersContainer.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Order #</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Customer</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Product</th>
                            <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #666;">Qty</th>
                            <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #666;">Total</th>
                            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #666;">Status</th>
                            <th style="text-align: center; padding: 12px 16px; font-weight: 600; color: #666;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentOrders.map(order => `
                            <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                <td style="padding: 12px 16px; font-weight: 500;">${order.orderNumber}</td>
                                <td style="padding: 12px 16px; color: #666;">${order.customer}</td>
                                <td style="padding: 12px 16px; font-weight: 500;">${order.product}</td>
                                <td style="padding: 12px 16px; text-align: right; color: #666;">${order.quantity}</td>
                                <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #10b981;">$${order.total.toFixed(2)}</td>
                                <td style="padding: 12px 16px;">
                                    <span style="
                                        padding: 4px 8px;
                                        border-radius: 6px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        background: ${order.status === 'completed' ? '#d1fae5' : order.status === 'pending' ? '#fef3c7' : '#fee2e2'};
                                        color: ${order.status === 'completed' ? '#065f46' : order.status === 'pending' ? '#92400e' : '#991b1b'};
                                    ">${order.status}</span>
                                </td>
                                <td style="padding: 12px 16px; text-align: center;">
                                    <div style="display: flex; gap: 8px; justify-content: center;">
                                        ${order.status === 'pending' ? `
                                            <button class="complete-order-btn" data-order-id="${order.id}" style="
                                                background: rgba(16, 185, 129, 0.1);
                                                border: 1px solid rgba(16, 185, 129, 0.2);
                                                border-radius: 6px;
                                                padding: 6px 12px;
                                                color: #10b981;
                                                font-size: 12px;
                                                cursor: pointer;
                                            ">Complete</button>
                                        ` : ''}
                                        <button class="delete-order-btn" data-order-id="${order.id}" style="
                                            background: rgba(239, 68, 68, 0.1);
                                            border: 1px solid rgba(239, 68, 68, 0.2);
                                            border-radius: 6px;
                                            padding: 6px 12px;
                                            color: #ef4444;
                                            font-size: 12px;
                                            cursor: pointer;
                                        ">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.setupOrdersTableListeners();
    },

    setupOrdersTableListeners() {
        // Complete order buttons
        const completeButtons = document.querySelectorAll('.complete-order-btn');
        completeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-order-id');
                this.updateOrderStatus(orderId, 'completed');
            });
        });

        // Delete order buttons
        const deleteButtons = document.querySelectorAll('.delete-order-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-order-id');
                if (confirm('Are you sure you want to delete this order?')) {
                    this.deleteOrder(orderId);
                }
            });
        });
    },

    showCreateOrderModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Create New Order</h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>

                <form id="create-order-form">
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Customer Name *</label>
                            <input type="text" name="customer" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " placeholder="Enter customer name">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Product *</label>
                            <input type="text" name="product" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " placeholder="Enter product name">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Quantity *</label>
                                <input type="number" name="quantity" min="1" required style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                " placeholder="0">
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Price ($) *</label>
                                <input type="number" name="price" min="0" step="0.01" required style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                " placeholder="0.00">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Delivery Date</label>
                            <input type="date" name="deliveryDate" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Notes</label>
                            <textarea name="notes" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                                resize: vertical;
                                min-height: 80px;
                            " placeholder="Special instructions..."></textarea>
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="submit" style="
                                flex: 1;
                                background: #10b981;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Create Order</button>
                            <button type="button" class="cancel-modal" style="
                                flex: 1;
                                background: #6b7280;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        modal.querySelector('input[type="date"]').min = today;

        document.body.appendChild(modal);

        // Event listeners for modal
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#create-order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const orderData = Object.fromEntries(formData);
            
            this.addOrder(orderData);
            closeModal();
        });
    },

    renderOrders() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Orders</h1>
                    <p style="color: #666; font-size: 16px;">Manage customer orders and deliveries</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="create-order" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">📋</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Create Order</div>
                                <div style="font-size: 12px; color: #666;">Add new customer order</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="orders-report" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">📊</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Orders Report</div>
                                <div style="font-size: 12px; color: #666;">Generate report</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Orders Summary -->
                <div class="orders-summary" style="margin-bottom: 30px;">
                    <div class="summary-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <div class="orders-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #f59e0b; margin-bottom: 12px;">⏳</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Pending Orders</div>
                            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">0</div>
                        </div>

                        <div class="orders-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">✅</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Completed Orders</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">0</div>
                        </div>

                        <div class="orders-summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #3b82f6; margin-bottom: 12px;">💰</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Revenue</div>
                            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">$0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="recent-orders">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px;">Recent Orders</h2>
                        <button style="
                            background: rgba(59, 130, 246, 0.1);
                            border: 1px solid rgba(59, 130, 246, 0.2);
                            border-radius: 12px;
                            padding: 10px 16px;
                            color: #3b82f6;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                        ">View All</button>
                    </div>
                    
                    <div class="orders-container" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No orders yet</div>
                            <div style="font-size: 14px; color: #999;">Create your first order</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupOrdersEventListeners();
        this.updateOrdersDisplay();
    },

    setupOrdersEventListeners() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });

            // Add click handlers for action buttons
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                switch (action) {
                    case 'create-order':
                        this.showCreateOrderModal();
                        break;
                    case 'orders-report':
                        this.generateOrdersReport();
                        break;
                }
            });
        });
    },

    generateOrdersReport() {
        if (this.ordersData.length === 0) {
            this.showNotification('No orders data available for report', 'info');
            return;
        }

        const stats = this.calculateOrdersStats();
        const recentOrders = this.ordersData.slice(0, 10);
        
        const report = `
Orders Report - ${new Date().toLocaleDateString()}

📊 Order Statistics:
• Pending Orders: ${stats.pending}
• Completed Orders: ${stats.completed}
• Total Revenue: $${stats.totalRevenue}
• Total Orders: ${stats.totalOrders}

Recent Orders:
${recentOrders.map(order => 
    `• ${order.orderNumber} - ${order.customer} - ${order.product} - $${order.total.toFixed(2)} - ${order.status}`
).join('\n')}
        `.trim();

        alert(report);
        this.showNotification('Orders report generated!', 'success');
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders module registered');
}
