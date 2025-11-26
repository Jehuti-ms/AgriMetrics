// modules/dashboard.js - PWA Style
console.log('Loading dashboard module...');

class DashboardModule {
    constructor() {
        this.moduleId = 'dashboard';
        this.moduleName = 'Dashboard';
        this.initialized = false;
    }

    init() {
        console.log('📊 Initializing dashboard module...');
        this.initialized = true;
        
        // Load any dashboard-specific data
        this.loadDashboardData();
        
        return true;
    }

    render(container) {
        console.log('🎨 Rendering dashboard...');
        
        container.innerHTML = this.getDashboardHTML();
        this.attachEventListeners();
        this.updateDashboardStats();
        
        // Add PWA-style animations
        this.animateDashboard();
    }

    getDashboardHTML() {
        const user = window.authManager?.auth?.currentUser;
        const userName = user?.displayName || user?.email || 'Farmer';
        
        return `
            <div class="dashboard-container">
                <!-- Welcome Section -->
                <div class="welcome-section">
                    <h1>Welcome back, ${userName}! 👋</h1>
                    <p>Here's what's happening with your farm today</p>
                </div>

                <!-- Quick Stats Overview -->
                <div class="stats-overview">
                    <div class="stats-grid" id="stats-grid">
                        <div class="stat-card">
                            <div class="icon">💰</div>
                            <div class="value" id="revenue-value">$0.00</div>
                            <div class="label">Total Revenue</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon">💸</div>
                            <div class="value" id="expenses-value">$0.00</div>
                            <div class="label">Total Expenses</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon">📦</div>
                            <div class="value" id="inventory-value">0</div>
                            <div class="label">Inventory Items</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon">🐔</div>
                            <div class="value" id="birds-value">0</div>
                            <div class="label">Active Birds</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div class="icon">💰</div>
                            <div class="title">Add Income</div>
                            <div class="description">Record new income</div>
                        </button>
                        <button class="quick-action-btn" data-action="add-expense">
                            <div class="icon">💸</div>
                            <div class="title">Add Expense</div>
                            <div class="description">Record new expense</div>
                        </button>
                        <button class="quick-action-btn" data-action="check-inventory">
                            <div class="icon">📦</div>
                            <div class="title">Check Inventory</div>
                            <div class="description">View stock levels</div>
                        </button>
                        <button class="quick-action-btn" data-action="record-feed">
                            <div class="icon">🌾</div>
                            <div class="title">Record Feed</div>
                            <div class="description">Log feed usage</div>
                        </button>
                        <button class="quick-action-btn" data-action="add-production">
                            <div class="icon">🚜</div>
                            <div class="title">Production</div>
                            <div class="description">Record production</div>
                        </button>
                        <button class="quick-action-btn" data-action="view-reports">
                            <div class="icon">📈</div>
                            <div class="title">View Reports</div>
                            <div class="description">Analytics & insights</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                    <div class="activity-header">
                        <h2>Recent Activity</h2>
                        <button class="btn-text" id="refresh-activity">
                            <span class="icon">🔄</span>
                            Refresh
                        </button>
                    </div>
                    <div class="activity-list" id="activity-list">
                        <div class="empty-state">
                            <div class="icon">📊</div>
                            <div>No recent activity</div>
                            <div class="subtext">Start by adding your first record</div>
                        </div>
                    </div>
                </div>

                <!-- Farm Insights -->
                <div class="insights-section">
                    <h2>Farm Insights</h2>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <div class="insight-icon">🌱</div>
                            <div class="insight-content">
                                <h3>Production Tips</h3>
                                <p>Monitor feed conversion ratios for better efficiency</p>
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">💡</div>
                            <div class="insight-content">
                                <h3>Best Practices</h3>
                                <p>Regular inventory checks prevent stock shortages</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Quick action buttons
        const actionButtons = document.querySelectorAll('.quick-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleQuickAction(e.currentTarget.dataset.action);
            });
            
            // PWA: Add ripple effect
            this.addRippleEffect(button);
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-activity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshActivity();
            });
        }

        // PWA: Pull to refresh
        this.setupPullToRefresh();
    }

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
        if (targetModule && window.FarmModules) {
            // Show loading feedback
            this.showActionFeedback(action);
            
            // Navigate to module
            setTimeout(() => {
                window.FarmModules.showModule(targetModule);
            }, 500);
        }
    }

    showActionFeedback(action) {
        const button = document.querySelector(`[data-action="${action}"]`);
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <div class="loading-spinner-small"></div>
                <div class="title">Loading...</div>
            `;
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 2000);
        }
    }

    updateDashboardStats() {
        // Calculate stats from app data
        const data = window.FarmModules?.appData || {};
        
        // Update revenue
        const revenue = data.transactions
            ?.filter(t => t.type === 'income')
            ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;
        
        // Update expenses
        const expenses = data.transactions
            ?.filter(t => t.type === 'expense')
            ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;
        
        // Update inventory count
        const inventoryCount = data.inventory?.length || 0;
        
        // Update stats in UI
        this.updateStatElement('revenue-value', `$${revenue.toLocaleString()}`);
        this.updateStatElement('expenses-value', `$${expenses.toLocaleString()}`);
        this.updateStatElement('inventory-value', inventoryCount.toString());
        
        // Update recent activity
        this.updateRecentActivity();
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.textContent = value;
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }

    updateRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const data = window.FarmModules?.appData || {};
        const activities = [];

        // Get recent transactions
        if (data.transactions) {
            data.transactions.slice(-5).forEach(transaction => {
                activities.push({
                    type: transaction.type,
                    description: `${transaction.type === 'income' ? 'Income' : 'Expense'}: ${transaction.description}`,
                    amount: transaction.amount,
                    date: transaction.date,
                    icon: transaction.type === 'income' ? '💰' : '💸'
                });
            });
        }

        // Get recent inventory changes
        if (data.inventory) {
            data.inventory.slice(-3).forEach(item => {
                activities.push({
                    type: 'inventory',
                    description: `Inventory: ${item.name}`,
                    detail: `Stock: ${item.quantity}`,
                    date: item.lastUpdated,
                    icon: '📦'
                });
            });
        }

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📊</div>
                    <div>No recent activity</div>
                    <div class="subtext">Start by adding your first record</div>
                </div>
            `;
            return;
        }

        // Sort by date and take latest 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivities = activities.slice(0, 5);

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    ${activity.detail ? `<div class="activity-detail">${activity.detail}</div>` : ''}
                    <div class="activity-date">${this.formatDate(activity.date)}</div>
                </div>
                ${activity.amount ? `<div class="activity-amount ${activity.type}">${activity.amount}</div>` : ''}
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }

    refreshActivity() {
        const refreshBtn = document.getElementById('refresh-activity');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<span class="icon">⏳</span> Refreshing...';
            refreshBtn.disabled = true;
        }

        // Simulate API call
        setTimeout(() => {
            this.updateDashboardStats();
            if (refreshBtn) {
                refreshBtn.innerHTML = '<span class="icon">🔄</span> Refresh';
                refreshBtn.disabled = false;
            }
            
            // Show success feedback
            this.showNotification('Activity refreshed', 'success');
        }, 1000);
    }

    animateDashboard() {
        // Animate stats cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });

        // Animate action buttons
        const actionButtons = document.querySelectorAll('.quick-action-btn');
        actionButtons.forEach((button, index) => {
            button.style.animationDelay = `${0.5 + (index * 0.05)}s`;
            button.classList.add('animate-in');
        });
    }

    addRippleEffect(button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    setupPullToRefresh() {
        // PWA: Basic pull-to-refresh implementation
        let startY = 0;
        const contentArea = document.getElementById('content-area');
        
        if (contentArea) {
            contentArea.addEventListener('touchstart', (e) => {
                startY = e.touches[0].pageY;
            });

            contentArea.addEventListener('touchmove', (e) => {
                const y = e.touches[0].pageY;
                if (y > startY + 100 && window.scrollY === 0) {
                    this.refreshActivity();
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        // Use core module notification if available, otherwise fallback
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            // Simple fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${type === 'success' ? 'var(--success)' : 
                           type === 'error' ? 'var(--error)' : 'var(--info)'};
                color: white;
                padding: var(--spacing-3) var(--spacing-4);
                border-radius: var(--radius-medium);
                z-index: 1000;
                font: var(--label-large);
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    loadDashboardData() {
        // Load any dashboard-specific data from Firestore or localStorage
        console.log('📥 Loading dashboard data...');
        // Implementation for loading specific dashboard data
    }
}

// Register the module
const dashboardModule = new DashboardModule();
window.FarmModules.registerModule('dashboard', dashboardModule);
window.DashboardModule = dashboardModule;

console.log('✅ Dashboard module registered');
