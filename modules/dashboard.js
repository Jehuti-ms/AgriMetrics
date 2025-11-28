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
// modules/dashboard.js
console.log('Loading dashboard module...');

FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="dashboard-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Farm Dashboard</h1>
                <p class="module-subtitle-pwa">Overview of your farm operations and performance</p>
            </div>

            <div class="dashboard-content">
                <!-- Stats Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa">$0</div>
                        <div class="stat-label-pwa">Today's Revenue</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📦</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Pending Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🥚</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Eggs Today</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🐔</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Total Birds</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <h3 class="section-title-pwa">Quick Actions</h3>
                    <div class="quick-grid-pwa">
                        <button class="quick-action-btn-pwa" data-action="add-production">
                            <div class="quick-icon-pwa">📈</div>
                            <div class="quick-title-pwa">Add Production</div>
                            <div class="quick-desc-pwa">Record daily production</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="record-feed">
                            <div class="quick-icon-pwa">🌾</div>
                            <div class="quick-title-pwa">Record Feed</div>
                            <div class="quick-desc-pwa">Log feed consumption</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="add-income">
                            <div class="quick-icon-pwa">💵</div>
                            <div class="quick-title-pwa">Add Income</div>
                            <div class="quick-desc-pwa">Record income</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Activity</h3>
                        <a href="#" class="view-all-link">View All</a>
                    </div>
                    
                    <div class="transactions-list">
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-title">No recent activity</div>
                            <div class="empty-desc">Start using the app to see activity here</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('📊 Initializing dashboard...');
        this.showContent();
        this.setupEventListeners();
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        contentArea.innerHTML = this.template;
        console.log('✅ Dashboard content loaded');
    },

    setupEventListeners: function() {
        // Simple click handlers for now
        document.addEventListener('click', (e) => {
            const quickActionBtn = e.target.closest('.quick-action-btn-pwa');
            if (quickActionBtn) {
                e.preventDefault();
                const action = quickActionBtn.getAttribute('data-action');
                alert('Quick action: ' + action);
            }
        });
    }
});

console.log('✅ Dashboard module registered');
