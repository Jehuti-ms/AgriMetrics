// modules/orders.js - Orders Management Module
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,

    initialize() {
        console.log('📦 Initializing orders...');
        this.renderModule();
        this.initialized = true;
        return true;
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="dashboard-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Welcome Section -->
                <div class="welcome-section" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Orders Management</h1>
                    <p style="color: #666; font-size: 16px;">Manage customer orders, track status, and process deliveries</p>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-actions" style="margin-bottom: 40px;">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Quick Actions</h2>
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 16px;
                        margin-bottom: 30px;
                    ">
                        <button class="quick-action-btn" data-action="create-order" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 16px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 12px;
                            min-height: 120px;
                        ">
                            <div style="font-size: 32px;">➕</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Create Order</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">New customer order</span>
                        </button>

                        <button class="quick-action-btn" data-action="pending-orders" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 16px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 12px;
                            min-height: 120px;
                        ">
                            <div style="font-size: 32px;">⏳</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Pending Orders</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Awaiting processing</span>
                        </button>

                        <button class="quick-action-btn" data-action="today-orders" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 16px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 12px;
                            min-height: 120px;
                        ">
                            <div style="font-size: 32px;">📅</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Today's Orders</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Due for delivery</span>
                        </button>

                        <button class="quick-action-btn" data-action="completed-orders" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 16px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 12px;
                            min-height: 120px;
                        ">
                            <div style="font-size: 32px;">✅</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Completed</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Delivered orders</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview" style="margin-bottom: 40px;">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Orders Overview</h2>
                    <div class="stats-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <div class="stat-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="pending-count">0</div>
                            <div style="font-size: 14px; color: #666;">Pending Orders</div>
                        </div>

                        <div class="stat-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="completed-count">0</div>
                            <div style="font-size: 14px; color: #666;">Completed Orders</div>
                        </div>

                        <div class="stat-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="today-count">0</div>
                            <div style="font-size: 14px; color: #666;">Today's Orders</div>
                        </div>

                        <div class="stat-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="revenue-amount">$0</div>
                            <div style="font-size: 14px; color: #666;">Total Revenue</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="recent-activity">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0;">Recent Orders</h2>
                        <div style="display: flex; gap: 12px;">
                            <select id="order-filter" style="
                                padding: 8px 12px;
                                border: 1px solid rgba(0, 0, 0, 0.1);
                                border-radius: 8px;
                                background: rgba(255, 255, 255, 0.9);
                                backdrop-filter: blur(20px);
                                color: #1a1a1a;
                                font-size: 14px;
                            ">
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div style="position: relative;">
                                <input type="text" id="order-search" placeholder="Search orders..." style="
                                    padding: 8px 12px 8px 36px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    background: rgba(255, 255, 255, 0.9);
                                    backdrop-filter: blur(20px);
                                    color: #1a1a1a;
                                    font-size: 14px;
                                    width: 200px;
                                ">
                                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666;">🔍</span>
                            </div>
                        </div>
                    </div>
                    <div class="activity-list" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        ${this.renderOrdersList()}
                    </div>
                </div>
            </div>

            <!-- Create Order Modal -->
            <div id="create-order-modal" class="modal hidden">
                <div class="modal-content" style="
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 16px;
                    padding: 0;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <div class="modal-header" style="
                        padding: 24px;
                        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 style="color: #1a1a1a; margin: 0; font-size: 20px;">Create New Order</h3>
                        <button class="close-modal" id="close-create-modal" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            color: #666;
                            cursor: pointer;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <form id="create-order-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                                <div>
                                    <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-size: 14px;">Customer</label>
                                    <select id="customer-select" required style="
                                        width: 100%;
                                        padding: 10px 12px;
                                        border: 1px solid rgba(0, 0, 0, 0.1);
                                        border-radius: 8px;
                                        background: rgba(255, 255, 255, 0.9);
                                        backdrop-filter: blur(20px);
                                        color: #1a1a1a;
                                        font-size: 14px;
                                    ">
                                        <option value="">Select Customer</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-size: 14px;">Order Date</label>
                                    <input type="date" id="order-date" required value="${new Date().toISOString().split('T')[0]}" style="
                                        width: 100%;
                                        padding: 10px 12px;
                                        border: 1px solid rgba(0, 0, 0, 0.1);
                                        border-radius: 8px;
                                        background: rgba(255, 255, 255, 0.9);
                                        backdrop-filter: blur(20px);
                                        color: #1a1a1a;
                                        font-size: 14px;
                                    ">
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                                <div>
                                    <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-size: 14px;">Delivery Date</label>
                                    <input type="date" id="delivery-date" required style="
                                        width: 100%;
                                        padding: 10px 12px;
                                        border: 1px solid rgba(0, 0, 0, 0.1);
                                        border-radius: 8px;
                                        background: rgba(255, 255, 255, 0.9);
                                        backdrop-filter: blur(20px);
                                        color: #1a1a1a;
                                        font-size: 14px;
                                    ">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-size: 14px;">Status</label>
                                    <select id="order-status" style="
                                        width: 100%;
                                        padding: 10px 12px;
                                        border: 1px solid rgba(0, 0, 0, 0.1);
                                        border-radius: 8px;
                                        background: rgba(255, 255, 255, 0.9);
                                        backdrop-filter: blur(20px);
                                        color: #1a1a1a;
                                        font-size: 14px;
                                    ">
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px; padding: 20px; background: rgba(255, 255, 255, 0.5); border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.1);">
                                <h4 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 16px;">Order Items</h4>
                                <div id="order-items">
                                    <div class="order-item" style="margin-bottom: 12px;">
                                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: end;">
                                            <select class="product-select" required style="
                                                padding: 8px 12px;
                                                border: 1px solid rgba(0, 0, 0, 0.1);
                                                border-radius: 8px;
                                                background: rgba(255, 255, 255, 0.9);
                                                backdrop-filter: blur(20px);
                                                color: #1a1a1a;
                                                font-size: 14px;
                                            ">
                                                <option value="">Select Product</option>
                                                <option value="eggs">Eggs</option>
                                                <option value="broilers">Broilers</option>
                                                <option value="layers">Layers</option>
                                            </select>
                                            <input type="number" class="quantity-input" placeholder="Qty" min="1" required style="
                                                padding: 8px 12px;
                                                border: 1px solid rgba(0, 0, 0, 0.1);
                                                border-radius: 8px;
                                                background: rgba(255, 255, 255, 0.9);
                                                backdrop-filter: blur(20px);
                                                color: #1a1a1a;
                                                font-size: 14px;
                                            ">
                                            <input type="number" class="price-input" placeholder="Price" step="0.01" min="0" required style="
                                                padding: 8px 12px;
                                                border: 1px solid rgba(0, 0, 0, 0.1);
                                                border-radius: 8px;
                                                background: rgba(255, 255, 255, 0.9);
                                                backdrop-filter: blur(20px);
                                                color: #1a1a1a;
                                                font-size: 14px;
                                            ">
                                            <button type="button" class="remove-item" style="
                                                padding: 8px 12px;
                                                border: 1px solid rgba(0, 0, 0, 0.1);
                                                border-radius: 8px;
                                                background: rgba(255, 255, 255, 0.9);
                                                backdrop-filter: blur(20px);
                                                color: #666;
                                                cursor: pointer;
                                                font-size: 14px;
                                            ">Remove</button>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" id="add-item" style="
                                    padding: 8px 16px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    background: rgba(255, 255, 255, 0.9);
                                    backdrop-filter: blur(20px);
                                    color: #1a1a1a;
                                    cursor: pointer;
                                    font-size: 14px;
                                    margin-top: 8px;
                                ">+ Add Item</button>
                            </div>
                            
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-size: 14px;">Notes</label>
                                <textarea id="order-notes" rows="3" placeholder="Any special instructions..." style="
                                    width: 100%;
                                    padding: 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    background: rgba(255, 255, 255, 0.9);
                                    backdrop-filter: blur(20px);
                                    color: #1a1a1a;
                                    font-size: 14px;
                                    resize: vertical;
                                "></textarea>
                            </div>
                            
                            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.1);">
                                <button type="button" id="cancel-order" style="
                                    padding: 10px 20px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    background: rgba(255, 255, 255, 0.9);
                                    backdrop-filter: blur(20px);
                                    color: #666;
                                    cursor: pointer;
                                    font-size: 14px;
                                    font-weight: 600;
                                ">Cancel</button>
                                <button type="submit" style="
                                    padding: 10px 20px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    background: #1a1a1a;
                                    color: white;
                                    cursor: pointer;
                                    font-size: 14px;
                                    font-weight: 600;
                                ">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateOrderStats();
        this.loadCustomers();
        
        // Set delivery date to tomorrow by default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('delivery-date').value = tomorrow.toISOString().split('T')[0];
    },

    renderOrdersList() {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        
        if (orders.length === 0) {
            return `
                <div style="text-align: center; color: #666; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No orders yet</div>
                    <div style="font-size: 14px; color: #999;">Create your first order to get started</div>
                </div>
            `;
        }

        const recentOrders = orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${recentOrders.map(order => `
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.5);
                        border-radius: 12px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 18px;
                                background: ${this.getStatusColor(order.status).background};
                                color: ${this.getStatusColor(order.status).color};
                            ">
                                ${this.getStatusIcon(order.status)}
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1a1a1a; font-size: 14px;">
                                    Order #${order.id} - ${order.customerName}
                                </div>
                                <div style="font-size: 12px; color: #666;">
                                    ${order.orderDate} • ${order.items.length} items • ${this.formatCurrency(order.totalAmount)}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="view-order" data-order-id="${order.id}" style="
                                padding: 6px 12px;
                                border: 1px solid rgba(0, 0, 0, 0.1);
                                border-radius: 6px;
                                background: rgba(255, 255, 255, 0.9);
                                backdrop-filter: blur(20px);
                                color: #666;
                                cursor: pointer;
                                font-size: 12px;
                            ">View</button>
                            ${order.status === 'pending' ? `
                                <button class="process-order" data-order-id="${order.id}" style="
                                    padding: 6px 12px;
                                    border: 1px solid rgba(0, 0, 0, 0.1);
                                    border-radius: 6px;
                                    background: #1a1a1a;
                                    color: white;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">Process</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateOrderStats() {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        
        const pendingCount = orders.filter(order => order.status === 'pending').length;
        const completedCount = orders.filter(order => order.status === 'completed').length;
        const todayCount = orders.filter(order => {
            const today = new Date().toISOString().split('T')[0];
            return order.deliveryDate === today;
        }).length;
        
        const revenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('today-count').textContent = todayCount;
        document.getElementById('revenue-amount').textContent = this.formatCurrency(revenue);
    },

    setupEventListeners() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });

            // Add hover effects
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });
        });

        // Filter and search
        document.getElementById('order-filter')?.addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('order-search')?.addEventListener('input', (e) => this.searchOrders(e.target.value));
        
        // Modal controls
        document.getElementById('close-create-modal')?.addEventListener('click', () => this.closeCreateModal());
        document.getElementById('cancel-order')?.addEventListener('click', () => this.closeCreateModal());
        
        // Create order form
        document.getElementById('create-order-form')?.addEventListener('submit', (e) => this.createOrder(e));
        document.getElementById('add-item')?.addEventListener('click', () => this.addOrderItem());
        
        // Event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-order')) {
                const orderId = e.target.getAttribute('data-order-id');
                this.viewOrder(orderId);
            }
            
            if (e.target.classList.contains('process-order')) {
                const orderId = e.target.getAttribute('data-order-id');
                this.processOrder(orderId);
            }
            
            if (e.target.classList.contains('remove-item')) {
                this.removeOrderItem(e.target);
            }
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const createModal = document.getElementById('create-order-modal');
            if (e.target === createModal) {
                this.closeCreateModal();
            }
        });
    },

    handleQuickAction(action) {
        const actionMap = {
            'create-order': () => this.showCreateOrderModal(),
            'pending-orders': () => this.filterOrders('pending'),
            'today-orders': () => this.filterOrders('today'),
            'completed-orders': () => this.filterOrders('completed')
        };

        const actionHandler = actionMap[action];
        if (actionHandler) {
            actionHandler();
        }
    },

    loadCustomers() {
        const customers = JSON.parse(localStorage.getItem('farm-customers') || '[]');
        const customerSelect = document.getElementById('customer-select');
        
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
        });
    },

    showCreateOrderModal() {
        document.getElementById('create-order-modal').classList.remove('hidden');
    },

    closeCreateModal() {
        document.getElementById('create-order-modal').classList.add('hidden');
        document.getElementById('create-order-form').reset();
        
        // Reset to single item
        const orderItems = document.getElementById('order-items');
        orderItems.innerHTML = `
            <div class="order-item" style="margin-bottom: 12px;">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: end;">
                    <select class="product-select" required style="
                        padding: 8px 12px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        color: #1a1a1a;
                        font-size: 14px;
                    ">
                        <option value="">Select Product</option>
                        <option value="eggs">Eggs</option>
                        <option value="broilers">Broilers</option>
                        <option value="layers">Layers</option>
                    </select>
                    <input type="number" class="quantity-input" placeholder="Qty" min="1" required style="
                        padding: 8px 12px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        color: #1a1a1a;
                        font-size: 14px;
                    ">
                    <input type="number" class="price-input" placeholder="Price" step="0.01" min="0" required style="
                        padding: 8px 12px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        color: #1a1a1a;
                        font-size: 14px;
                    ">
                    <button type="button" class="remove-item" style="
                        padding: 8px 12px;
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        color: #666;
                        cursor: pointer;
                        font-size: 14px;
                    ">Remove</button>
                </div>
            </div>
        `;
    },

    addOrderItem() {
        const orderItems = document.getElementById('order-items');
        const newItem = document.createElement('div');
        newItem.className = 'order-item';
        newItem.style.marginBottom = '12px';
        newItem.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; align-items: end;">
                <select class="product-select" required style="
                    padding: 8px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    color: #1a1a1a;
                    font-size: 14px;
                ">
                    <option value="">Select Product</option>
                    <option value="eggs">Eggs</option>
                    <option value="broilers">Broilers</option>
                    <option value="layers">Layers</option>
                </select>
                <input type="number" class="quantity-input" placeholder="Qty" min="1" required style="
                    padding: 8px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    color: #1a1a1a;
                    font-size: 14px;
                ">
                <input type="number" class="price-input" placeholder="Price" step="0.01" min="0" required style="
                    padding: 8px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    color: #1a1a1a;
                    font-size: 14px;
                ">
                <button type="button" class="remove-item" style="
                    padding: 8px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    color: #666;
                    cursor: pointer;
                    font-size: 14px;
                ">Remove</button>
            </div>
        `;
        orderItems.appendChild(newItem);
    },

    removeOrderItem(button) {
        const orderItems = document.getElementById('order-items');
        if (orderItems.children.length > 1) {
            button.closest('.order-item').remove();
        }
    },

    createOrder(e) {
        e.preventDefault();
        
        const customerId = document.getElementById('customer-select').value;
        const customerName = document.getElementById('customer-select').options[document.getElementById('customer-select').selectedIndex].text;
        const orderDate = document.getElementById('order-date').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const status = document.getElementById('order-status').value;
        const notes = document.getElementById('order-notes').value;
        
        // Validate items
        const items = [];
        let totalAmount = 0;
        let valid = true;
        
        document.querySelectorAll('.order-item').forEach(item => {
            const productSelect = item.querySelector('.product-select');
            const quantityInput = item.querySelector('.quantity-input');
            const priceInput = item.querySelector('.price-input');
            
            if (!productSelect.value || !quantityInput.value || !priceInput.value) {
                valid = false;
                return;
            }
            
            const quantity = parseInt(quantityInput.value);
            const price = parseFloat(priceInput.value);
            const itemTotal = quantity * price;
            
            items.push({
                product: productSelect.value,
                productName: productSelect.options[productSelect.selectedIndex].text,
                quantity: quantity,
                price: price,
                total: itemTotal
            });
            
            totalAmount += itemTotal;
        });
        
        if (!valid) {
            if (window.coreModule) {
                window.coreModule.showNotification('Please fill all item fields', 'error');
            }
            return;
        }
        
        // Create order object
        const order = {
            id: Date.now(),
            customerId: parseInt(customerId),
            customerName: customerName,
            orderDate: orderDate,
            deliveryDate: deliveryDate,
            status: status,
            items: items,
            totalAmount: totalAmount,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        orders.push(order);
        localStorage.setItem('farm-orders', JSON.stringify(orders));
        
        // Close modal and refresh
        this.closeCreateModal();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Order created successfully!', 'success');
        }
    },

    viewOrder(orderId) {
        // Implementation for viewing order details
        if (window.coreModule) {
            window.coreModule.showNotification('View order details for #' + orderId, 'info');
        }
    },

    processOrder(orderId) {
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id == orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'processing';
            localStorage.setItem('farm-orders', JSON.stringify(orders));
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Order processing started!', 'success');
            }
        }
    },

    filterOrders(status) {
        // Implementation for filtering orders
        if (window.coreModule) {
            window.coreModule.showNotification('Filtering orders: ' + status, 'info');
        }
    },

    searchOrders(query) {
        // Implementation for searching orders
        if (query) {
            if (window.coreModule) {
                window.coreModule.showNotification('Searching for: ' + query, 'info');
            }
        }
    },

    // Helper methods
    getStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'processing': '🔄',
            'completed': '✅',
            'cancelled': '❌'
        };
        return icons[status] || '📦';
    },

    getStatusColor(status) {
        const colors = {
            'pending': { background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
            'processing': { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
            'completed': { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
            'cancelled': { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
        };
        return colors[status] || { background: 'rgba(0, 0, 0, 0.1)', color: '#666' };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Add modal CSS
const ordersCSS = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal.hidden {
        display: none;
    }

    @media (max-width: 768px) {
        .actions-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
        }
        
        .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
        }
        
        .modal-content {
            width: 95% !important;
            margin: 20px;
        }
    }
`;

// Inject CSS
if (!document.querySelector('#orders-module-css')) {
    const style = document.createElement('style');
    style.id = 'orders-module-css';
    style.textContent = ordersCSS;
    document.head.appendChild(style);
}

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
}
