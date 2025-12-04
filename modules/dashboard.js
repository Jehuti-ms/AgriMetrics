// modules/dashboard.js - CSS-BASED VERSION (Clean)
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    id: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Ensure CSS is loaded
        this.ensureDashboardCSS();
        
        // Render dashboard
        this.renderDashboard();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load stats
        this.loadAndDisplayStats();
        
        this.initialized = true;
        
        console.log('✅ Dashboard initialized successfully');
        return true;
    },

    ensureDashboardCSS() {
        // Check if dashboard CSS is already loaded
        const existingLinks = document.querySelectorAll('link[href*="dashboard.css"]');
        if (existingLinks.length > 0) {
            return;
        }
        
        // Load dashboard CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/dashboard.css';
        link.onerror = () => {
            console.warn('⚠️ dashboard.css not found');
        };
        document.head.appendChild(link);
    },

    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="dashboard" class="module-container dashboard">
                
                <!-- Welcome Section -->
                <div class="welcome-section">
                    <div class="module-header header-flex">
                        <div class="header-left">
                            <h1>Welcome to Farm Management</h1>
                            <p class="module-subtitle">Manage your farm operations efficiently</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="card-grid">
                        <button class="card-button" data-action="add-income">
                            <div class="card-icon">💰</div>
                            <span class="card-title">Add Income</span>
                            <span class="card-subtitle">Record new income</span>
                        </button>
                        <button class="card-button" data-action="add-expense">
                            <div class="card-icon">💸</div>
                            <span class="card-title">Add Expense</span>
                            <span class="card-subtitle">Record new expense</span>
                        </button>
                        <button class="card-button" data-action="check-inventory">
                            <div class="card-icon">📦</div>
                            <span class="card-title">Check Inventory</span>
                            <span class="card-subtitle">View inventory status</span>
                        </button>
                        <button class="card-button" data-action="record-feed">
                            <div class="card-icon">🌾</div>
                            <span class="card-title">Record Feed</span>
                            <span class="card-subtitle">Log feed consumption</span>
                        </button>
                        <button class="card-button" data-action="add-production">
                            <div class="card-icon">🚜</div>
                            <span class="card-title">Production</span>
                            <span class="card-subtitle">Add production records</span>
                        </button>
                        <button class="card-button" data-action="view-reports">
                            <div class="card-icon">📈</div>
                            <span class="card-title">View Reports</span>
                            <span class="card-subtitle">Analytics and insights</span>
                        </button>
                    </div>
                </div>
                
                <!-- Stats Overview -->
                <div class="overview-section">
                    <h2 class="section-title">Overview</h2>
                    <div class="card-grid">
                        <div class="stat-card" id="revenue-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value" id="total-revenue">$0.00</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                        <div class="stat-card" id="expense-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-value" id="total-expenses">$0.00</div>
                            <div class="stat-label">Total Expenses</div>
                        </div>
                        <div class="stat-card" id="inventory-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-value" id="inventory-items">0</div>
                            <div class="stat-label">Inventory Items</div>
                        </div>
                        <div class="stat-card" id="birds-card">
                            <div class="stat-icon">🐔</div>
                            <div class="stat-value" id="active-birds">0</div>
                            <div class="stat-label">Active Birds</div>
                        </div>
                        <div class="stat-card" id="orders-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-orders">0</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card" id="profit-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value" id="net-profit">$0.00</div>
                            <div class="stat-label">Net Profit</div>
                        </div>
                        <div class="stat-card" id="customers-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value" id="total-customers">0</div>
                            <div class="stat-label">Customers</div>
                        </div>
                        <div class="stat-card" id="products-card">
                            <div class="stat-icon">🛒</div>
                            <div class="stat-value" id="total-products">0</div>
                            <div class="stat-label">Products</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="recent-activity-section">
                    <div class="glass-card">
                        <div class="card-header header-flex">
                            <h3>Recent Activity</h3>
                            <button class="btn-outline" id="view-all-activity">View All</button>
                        </div>
                        <div id="activity-content">
                            <div class="empty-state">
                                <div class="empty-icon">📊</div>
                                <div class="empty-title">No recent activity</div>
                                <div class="empty-subtitle">Start by adding your first record</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Refresh Button -->
                <div class="module-footer">
                    <div class="footer-left">
                        <button id="refresh-stats-btn" class="btn-primary">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Refresh Stats</span>
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
        this.setupViewAllActivity();
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.card-button[data-action]');
        
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    },

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayStats();
                this.showNotification('Stats refreshed!', 'success');
            });
        }
    },

    setupViewAllActivity() {
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showNotification('Viewing all activity...', 'info');
                // Future: Implement detailed activity view
            });
        }
    },

    loadAndDisplayStats() {
        const stats = this.getDashboardStats();
        this.updateDashboardDisplay(stats);
        this.updateRecentActivity(stats);
    },

    getDashboardStats() {
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

        // Try to get stats from FarmModules
        if (window.FarmModules && window.FarmModules.appData) {
            const sharedStats = window.FarmModules.appData.profile?.dashboardStats;
            if (sharedStats) {
                stats = { ...stats, ...sharedStats };
            }
        }

        // Fallback to localStorage
        if (stats.totalIncome === 0) {
            const savedStats = localStorage.getItem('farm-dashboard-stats');
            if (savedStats) {
                stats = { ...stats, ...JSON.parse(savedStats) };
            }
        }

        // Calculate net profit if not provided
        if (stats.netProfit === 0 && (stats.totalIncome > 0 || stats.totalExpenses > 0)) {
            stats.netProfit = (stats.totalIncome || stats.totalRevenue || 0) - stats.totalExpenses;
        }

        return stats;
    },

    updateDashboardDisplay(stats) {
        this.updateStatCard('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
        this.updateStatCard('active-birds', stats.totalBirds || 0);
        this.updateStatCard('total-orders', stats.totalOrders || 0);
        this.updateStatCard('net-profit', this.formatCurrency(stats.netProfit || 0));
        this.updateStatCard('total-customers', stats.totalCustomers || 0);
        this.updateStatCard('total-products', stats.totalProducts || 0);

        // Update profit card styling
        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || 0;
            profitCard.classList.remove('profit-positive', 'profit-negative');
            if (netProfit > 0) {
                profitCard.classList.add('profit-positive');
            } else if (netProfit < 0) {
                profitCard.classList.add('profit-negative');
            }
        }

        // Update monthly revenue indicator
        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0) {
            // Remove existing indicator if present
            const existingIndicator = revenueCard.querySelector('.monthly-indicator');
            if (existingIndicator) existingIndicator.remove();
            
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.className = 'monthly-indicator';
            monthlyIndicator.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
            revenueCard.appendChild(monthlyIndicator);
        }
    },

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation
            element.classList.add('stat-updating');
            
            // Update value after animation
            setTimeout(() => {
                element.classList.remove('stat-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateRecentActivity(stats) {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = [];
        
        // Get recent activities from FarmModules
        const recentActivities = window.FarmModules?.appData?.profile?.recentActivities || [];

        if (recentActivities.length > 0) {
            recentActivities.forEach(activity => {
                activities.push({
                    icon: activity.icon || '📊',
                    text: activity.message || activity.text || 'Activity',
                    time: this.formatTimeAgo(activity.timestamp)
                });
            });
        } else {
            // Generate default activities from stats
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
        }

        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-subtitle">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div class="activity-list">
                ${activities.slice(0, 5).map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': 'income-expenses',
            'add-expense': 'income-expenses', 
            'check-inventory': 'inventory',
            'record-feed': 'feed-record',
            'add-production': 'production',
            'view-reports': 'reports'
        };

        const targetModule = actionMap[action];
        if (targetModule && window.app && window.app.showSection) {
            window.app.showSection(targetModule);
            this.showNotification(`Opening ${this.getActionName(action)}...`, 'info');
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Income & Expenses',
            'add-expense': 'Income & Expenses', 
            'check-inventory': 'Inventory',
            'record-feed': 'Feed Records',
            'add-production': 'Production',
            'view-reports': 'Reports'
        };
        return names[action] || action;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        const bgColor = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        }[type] || '#3b82f6';
        
        notification.style.backgroundColor = bgColor;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animations if not already present
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    addActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

        if (!window.FarmModules.appData.profile) {
            window.FarmModules.appData.profile = {};
        }
        
        if (!window.FarmModules.appData.profile.recentActivities) {
            window.FarmModules.appData.profile.recentActivities = [];
        }

        window.FarmModules.appData.profile.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        // Keep only last 10 activities
        if (window.FarmModules.appData.profile.recentActivities.length > 10) {
            window.FarmModules.appData.profile.recentActivities = 
                window.FarmModules.appData.profile.recentActivities.slice(0, 10);
        }

        this.updateRecentActivity(this.getDashboardStats());
    }
};

// Register the module when FarmModules is available
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Dashboard module registered');
} else {
    // Wait for FarmModules to be available
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            clearInterval(checkFarmModules);
            window.FarmModules.registerModule('dashboard', DashboardModule);
            console.log('✅ Dashboard module registered after wait');
        }
    }, 100);
}

// Export for global access
window.DashboardModule = DashboardModule;
