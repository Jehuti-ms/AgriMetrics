// modules/dashboard.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }

        this.renderDashboard();
        this.setupEventListeners();
        this.initialized = true;
        
        // Load and display stats from shared data
        this.loadAndDisplayStats();
        
        console.log('✅ Dashboard initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Dashboard updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
    },

    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
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
                            -webkit-backup-filter: blur(20px);
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
                            -webkit-backup-filter: blur(20px);
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
                            -webkit-backup-filter: blur(20px);
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
                            -webkit-backup-filter: blur(20px);
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
                            -webkit-backup-filter: blur(20px);
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
                            -webkit-backup-filter: blur(20px);
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
                        <div class="stat-card" id="revenue-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="total-revenue">$0.00</div>
                            <div style="font-size: 14px; color: #666;">Total Revenue</div>
                        </div>

                        <div class="stat-card" id="expense-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">💸</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="total-expenses">$0.00</div>
                            <div style="font-size: 14px; color: #666;">Total Expenses</div>
                        </div>

                        <div class="stat-card" id="inventory-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="inventory-items">0</div>
                            <div style="font-size: 14px; color: #666;">Inventory Items</div>
                        </div>

                        <div class="stat-card" id="birds-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="active-birds">0</div>
                            <div style="font-size: 14px; color: #666;">Active Birds</div>
                        </div>

                        <!-- Additional Stats Cards -->
                        <div class="stat-card" id="orders-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="total-orders">0</div>
                            <div style="font-size: 14px; color: #666;">Total Orders</div>
                        </div>

                        <div class="stat-card" id="profit-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="net-profit">$0.00</div>
                            <div style="font-size: 14px; color: #666;">Net Profit</div>
                        </div>

                        <div class="stat-card" id="customers-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="total-customers">0</div>
                            <div style="font-size: 14px; color: #666;">Customers</div>
                        </div>

                        <div class="stat-card" id="products-card" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backup-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">🛒</div>
                            <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;" id="total-products">0</div>
                            <div style="font-size: 14px; color: #666;">Products</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Recent Activity</h2>
                    <div class="activity-list" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backup-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 20px;
                    ">
                        <div id="activity-content">
                            <div style="text-align: center; color: #666; padding: 40px 20px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                                <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                                <div style="font-size: 14px; color: #999;">Start by adding your first record</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <button id="refresh-stats-btn" class="btn-outline" style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 12px;
                        padding: 12px 24px;
                        cursor: pointer;
                        font-size: 14px;
                        color: #666;
                        transition: all 0.3s ease;
                    ">
                        🔄 Refresh Stats
                    </button>
                </div>
            </div>
        `;

        // Add event listeners to quick action buttons
        this.setupQuickActions();
        this.setupRefreshButton();
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

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayStats();
                if (window.coreModule && window.coreModule.showNotification) {
                    window.coreModule.showNotification('Stats refreshed!', 'success');
                }
            });

            // Add hover effect
            refreshBtn.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            });

            refreshBtn.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });
        }
    },

    // UPDATED METHOD: Load and display stats from shared data
    loadAndDisplayStats() {
        // Get stats from shared data
        const profileStats = this.getProfileStats();
        
        // Update dashboard stats
        this.updateDashboardStats(profileStats);
        
        // Update recent activity
        this.updateRecentActivity(profileStats);
    },

    // UPDATED METHOD: Get stats from shared data (no ProfileModule dependency)
    getProfileStats() {
        let stats = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            totalInventoryItems: 0,
            totalBirds: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            monthlyRevenue: 0,
            completedOrders: 0
        };

        // Try to get stats from shared FarmModules data
        if (window.FarmModules && window.FarmModules.appData) {
            const sharedStats = window.FarmModules.appData.profile?.dashboardStats;
            if (sharedStats) {
                stats = { ...stats, ...sharedStats };
            }
        }

        // Fallback to localStorage if shared data not available
        if (stats.totalIncome === 0) {
            const savedStats = localStorage.getItem('farm-dashboard-stats');
            if (savedStats) {
                stats = { ...stats, ...JSON.parse(savedStats) };
            }
        }

        return stats;
    },

    // NEW METHOD: Update shared data (for other modules to call)
    updateDashboardStats(newStats) {
        // Update shared data structure
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            Object.assign(window.FarmModules.appData.profile.dashboardStats, newStats);
        }

        // Update the UI
        this.updateDashboardDisplay(newStats);
    },

    // NEW METHOD: Add recent activity (for other modules to call)
    addRecentActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

        if (!window.FarmModules.appData.profile) {
            window.FarmModules.appData.profile = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats) {
            window.FarmModules.appData.profile.dashboardStats = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats.recentActivities) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = [];
        }

        // Add new activity to beginning of array
        window.FarmModules.appData.profile.dashboardStats.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        // Keep only last 10 activities
        if (window.FarmModules.appData.profile.dashboardStats.recentActivities.length > 10) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = 
                window.FarmModules.appData.profile.dashboardStats.recentActivities.slice(0, 10);
        }

        // Update UI
        this.updateRecentActivity(this.getProfileStats());
    },

    // UPDATED METHOD: Update dashboard display with current stats
    updateDashboardDisplay(stats) {
        // Update main stats cards
        this.updateStatCard('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
        this.updateStatCard('active-birds', stats.totalBirds || 0);
        this.updateStatCard('total-orders', stats.totalOrders || 0);
        this.updateStatCard('net-profit', this.formatCurrency(stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0));
        this.updateStatCard('total-customers', stats.totalCustomers || 0);
        this.updateStatCard('total-products', stats.totalProducts || 0);

        // Update profit card color based on value
        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0;
            const profitColor = netProfit >= 0 ? '#22c55e' : '#ef4444';
            profitCard.style.borderLeft = `4px solid ${profitColor}`;
        }

        // Update revenue card with monthly indicator
        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0) {
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.style.fontSize = '12px';
            monthlyIndicator.style.color = '#22c55e';
            monthlyIndicator.style.marginTop = '4px';
            monthlyIndicator.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
            revenueCard.appendChild(monthlyIndicator);
        }
    },

    // UPDATED METHOD: Update individual stat card
    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.textContent = value;
            }, 150);
        }
    },

    // UPDATED METHOD: Update recent activity section
    updateRecentActivity(stats) {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        // Get activities from shared data
        const activities = [];
        const recentActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];

        if (recentActivities.length > 0) {
            // Use activities from shared data
            recentActivities.forEach(activity => {
                activities.push({
                    icon: activity.icon || '📊',
                    text: activity.message || activity.text || 'Activity',
                    time: this.formatTimeAgo(activity.timestamp)
                });
            });
        } else {
            // Generate activity items based on stats as fallback
            if (stats.totalOrders > 0) {
                activities.push({
                    icon: '📋',
                    text: `${stats.completedOrders || 0} orders completed`,
                    time: 'Recently'
                });
            }

            if (stats.totalRevenue > 0) {
                activities.push({
                    icon: '💰',
                    text: `${this.formatCurrency(stats.totalRevenue)} total revenue`,
                    time: 'Updated'
                });
            }

            if (stats.totalInventoryItems > 0) {
                activities.push({
                    icon: '📦',
                    text: `${stats.totalInventoryItems} inventory items managed`,
                    time: 'Current'
                });
            }

            if (stats.totalBirds > 0) {
                activities.push({
                    icon: '🐔',
                    text: `${stats.totalBirds} birds in stock`,
                    time: 'Active'
                });
            }

            if (stats.totalCustomers > 0) {
                activities.push({
                    icon: '👥',
                    text: `${stats.totalCustomers} customers registered`,
                    time: 'Total'
                });
            }
        }

        if (activities.length === 0) {
            // Show default message if no activities
            activityContent.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                    <div style="font-size: 14px; color: #999;">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        // Show activity items
        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
                        <div style="font-size: 20px;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1a1a1a; font-size: 14px;">${activity.text}</div>
                            <div style="font-size: 12px; color: #666;">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // NEW METHOD: Format time ago for activity timestamps
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    },

    // UPDATED METHOD: Force refresh stats (can be called from other modules)
    refreshStats() {
        this.loadAndDisplayStats();
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
        if (targetModule) {
            // FIX: Use the correct method to switch sections
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(targetModule);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(targetModule);
            } else {
                // Fallback: manually trigger navigation
                const event = new CustomEvent('sectionChange', { 
                    detail: { section: targetModule } 
                });
                document.dispatchEvent(event);
            }
            
            // Show notification
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
            }
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Income & Expenses',
            'add-expense': 'Income & Expenses', 
            'check-inventory': 'Inventory Check',
            'record-feed': 'Feed Records',
            'add-production': 'Production',
            'view-reports': 'Reports'
        };
        return names[action] || action;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
}

// ==================== CORRECT REGISTRATION ====================
// Add at the BOTTOM of dashboard.js

(function() {
    console.log('📦 Registering dashboard module...');
    
    // Use the module object defined in THIS file
    const moduleName = 'dashboard';
    const moduleObject = DashboardModule; // NOT SalesRecordModule!
    
    if (window.FarmModules) {
        FarmModules.registerModule(moduleName, moduleObject);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
