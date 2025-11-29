// modules/dashboard.js
console.log('Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,

    initialize() {
        console.log('📊 Initializing dashboard...');
        this.renderDashboard();
        this.initialized = true;
        return true;
    },

     // Update profile stats with current data on dashboard load
    if (window.ProfileModule && window.profileInstance) {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        const orders = FarmModules.appData.orders || [];
        
        const totalSalesValue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        const totalOrderValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        window.profileInstance.updateStats({
            totalTransactions: sales.length,
            totalInventory: inventory.length,
            totalFeedRecords: feedRecords.length,
            totalOrders: orders.length,
            totalSales: totalSalesValue + totalOrderValue
        });
    }
}

    renderDashboard() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="dashboard-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Welcome Section -->
                <div class="welcome-section" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Welcome to Farm Management</h1>
                    <p style="color: #666; font-size: 16px;">Manage your farm operations efficiently</p>
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
                        <button class="quick-action-btn" data-action="add-income" style="
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
                            <div style="font-size: 32px;">💰</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Add Income</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Record new income</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-expense" style="
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
                            <div style="font-size: 32px;">💸</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Add Expense</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Record new expense</span>
                        </button>

                        <button class="quick-action-btn" data-action="check-inventory" style="
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
                            <div style="font-size: 32px;">📦</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Check Inventory</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">View stock levels</span>
                        </button>

                        <button class="quick-action-btn" data-action="record-feed" style="
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
                            <div style="font-size: 32px;">🌾</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Record Feed</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Log feed usage</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-production" style="
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
                            <div style="font-size: 32px;">🚜</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">Production</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Record production</span>
                        </button>

                        <button class="quick-action-btn" data-action="view-reports" style="
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
                            <div style="font-size: 32px;">📈</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">View Reports</span>
                            <span style="font-size: 12px; color: #666; text-align: center;">Analytics & insights</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview" style="margin-bottom: 40px;">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Overview</h2>
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
                            <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">$0.00</div>
                            <div style="font-size: 14px; color: #666;">Total Revenue</div>
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
                            <div style="font-size: 24px; margin-bottom: 8px;">💸</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">$0.00</div>
                            <div style="font-size: 14px; color: #666;">Total Expenses</div>
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
                            <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">0</div>
                            <div style="font-size: 14px; color: #666;">Inventory Items</div>
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
                            <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">0</div>
                            <div style="font-size: 14px; color: #666;">Active Birds</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Recent Activity</h2>
                    <div class="activity-list" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div style="text-align: center; color: #666; padding: 40px 20px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                            <div style="font-size: 14px; color: #999;">Start by adding your first record</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to quick action buttons
        this.setupQuickActions();
    },

    setupQuickActions() {
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
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses',
            'check-inventory': 'inventory-check',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };

        const targetModule = actionMap[action];
        if (targetModule && window.app) {
            window.app.showSection(targetModule);
            
            // Show notification
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
            }
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Income',
            'add-expense': 'Expenses',
            'check-inventory': 'Inventory',
            'record-feed': 'Feed Record',
            'add-production': 'Production',
            'view-reports': 'Reports'
        };
        return names[action] || action;
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
}
