// modules/orders.js
console.log('Loading orders module...');

const OrdersModule = {
    name: 'orders',
    initialized: false,

    initialize() {
        console.log('📋 Initializing orders...');
        this.renderOrders();
        this.initialized = true;
        return true;
    },

    renderOrders() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Order Management</h1>
                    <p style="color: #666; font-size: 16px;">Manage customer orders and deliveries</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="new-order" style="
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
                            <div style="font-size: 28px;">➕</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">New Order</div>
                                <div style="font-size: 12px; color: #666;">Create customer order</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="pending-orders" style="
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
                            <div style="font-size: 28px;">⏳</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Pending</div>
                                <div style="font-size: 12px; color: #666;">View pending orders</div>
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
                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #3b82f6; margin-bottom: 12px;">📥</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Total Orders</div>
                            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">0</div>
                        </div>

                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #f59e0b; margin-bottom: 12px;">⏳</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Pending</div>
                            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">0</div>
                        </div>

                        <div class="summary-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; color: #10b981; margin-bottom: 12px;">✅</div>
                            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Completed</div>
                            <div style="font-size: 28px; font-weight: bold; color: #10b981;">0</div>
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
                            <div style="font-size: 14px; color: #999;">Create your first customer order</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
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
        });
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('orders', OrdersModule);
    console.log('✅ Orders module registered');
}
