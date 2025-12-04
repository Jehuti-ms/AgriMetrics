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
    <div id="dashboard" class="module-container">

      <!-- Welcome Section -->
      <div class="content-column">
        <h1 class="section-title">Welcome to Farm Management</h1>
        <p class="section-subtitle">Manage your farm operations efficiently</p>
      </div>

      <!-- Quick Actions -->
      <div class="content-column">
        <h2 class="section-title">Quick Actions</h2>
        <div class="card-button-group">
          <button class="card-button" data-action="add-income">💰 Add Income</button>
          <button class="card-button" data-action="add-expense">💸 Add Expense</button>
          <button class="card-button" data-action="check-inventory">📦 Check Inventory</button>
          <button class="card-button" data-action="record-feed">🌾 Record Feed</button>
          <button class="card-button" data-action="add-production">🚜 Production</button>
          <button class="card-button" data-action="view-reports">📈 View Reports</button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="content-column">
        <h2 class="section-title">Overview</h2>
        <div class="stats-inline">
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
      <div class="content-column">
        <h2 class="section-title">Recent Activity</h2>
        <div class="transactions-list">
          <div id="transactions-content">
            <div class="empty-state">
              <div class="empty-icon">📊</div>
              <div class="empty-title">No recent activity</div>
              <div class="empty-subtitle">Start by adding your first record</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="content-column">
        <button id="refresh-stats-btn" class="btn-outline">
          🔄 Refresh Stats
        </button>
      </div>

    </div>
  `;
}


    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.dashboard-quick-action-btn');
        
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
            if (netProfit >= 0) {
                profitCard.classList.add('profit-positive');
                profitCard.classList.remove('profit-negative');
            } else {
                profitCard.classList.add('profit-negative');
                profitCard.classList.remove('profit-positive');
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
                <div class="dashboard-empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No recent activity</div>
                    <div class="empty-subtitle">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div class="activity-items-container">
                ${activities.map(activity => `
                    <div class="dashboard-activity-item">
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
            'check-inventory': 'inventory-check',
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
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to container
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('notification-fadeout');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    },

    addActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

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
