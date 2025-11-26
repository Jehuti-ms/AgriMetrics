// modules/dashboard.js - ENHANCED PWA STYLE
console.log('Loading enhanced PWA dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,

    initialize() {
        console.log('📊 Initializing enhanced dashboard...');
        this.renderDashboard();
        this.initialized = true;
        this.setupServiceWorker();
        return true;
    },

    renderDashboard() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="dashboard-container">
                <!-- Welcome Section -->
                <div class="welcome-section modern-card">
                    <div class="welcome-content">
                        <h1 class="welcome-title">Welcome to Farm Management</h1>
                        <p class="welcome-subtitle">Manage your farm operations efficiently with modern tools</p>
                        <div class="welcome-badges">
                            <span class="badge online-badge">
                                <span class="badge-dot"></span>
                                Online
                            </span>
                            <span class="badge demo-badge">Demo Mode</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-section">
                    <h2 class="section-title">Quick Overview</h2>
                    <div class="stats-grid">
                        <div class="stat-card revenue-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-content">
                                <h3 class="stat-label">Total Revenue</h3>
                                <div class="stat-value" id="total-revenue">$0.00</div>
                                <div class="stat-trend positive">+0% this month</div>
                            </div>
                        </div>
                        
                        <div class="stat-card expense-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-content">
                                <h3 class="stat-label">Total Expenses</h3>
                                <div class="stat-value" id="total-expenses">$0.00</div>
                                <div class="stat-trend negative">+0% this month</div>
                            </div>
                        </div>
                        
                        <div class="stat-card inventory-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-content">
                                <h3 class="stat-label">Inventory Items</h3>
                                <div class="stat-value" id="inventory-count">0</div>
                                <div class="stat-trend">All categories</div>
                            </div>
                        </div>
                        
                        <div class="stat-card livestock-card">
                            <div class="stat-icon">🐔</div>
                            <div class="stat-content">
                                <h3 class="stat-label">Active Birds</h3>
                                <div class="stat-value" id="livestock-count">0</div>
                                <div class="stat-trend">Healthy</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div class="action-icon">💰</div>
                            <div class="action-content">
                                <div class="action-title">Add Income</div>
                                <div class="action-desc">Record new revenue</div>
                            </div>
                        </button>

                        <button class="quick-action-btn" data-action="add-expense">
                            <div class="action-icon">💸</div>
                            <div class="action-content">
                                <div class="action-title">Add Expense</div>
                                <div class="action-desc">Log farm costs</div>
                            </div>
                        </button>

                        <button class="quick-action-btn" data-action="check-inventory">
                            <div class="action-icon">📦</div>
                            <div class="action-content">
                                <div class="action-title">Inventory</div>
                                <div class="action-desc">Check stock levels</div>
                            </div>
                        </button>

                        <button class="quick-action-btn" data-action="record-feed">
                            <div class="action-icon">🌾</div>
                            <div class="action-content">
                                <div class="action-title">Feed Record</div>
                                <div class="action-desc">Log feed usage</div>
                            </div>
                        </button>

                        <button class="quick-action-btn" data-action="add-production">
                            <div class="action-icon">🚜</div>
                            <div class="action-content">
                                <div class="action-title">Production</div>
                                <div class="action-desc">Record output</div>
                            </div>
                        </button>

                        <button class="quick-action-btn" data-action="view-reports">
                            <div class="action-icon">📈</div>
                            <div class="action-content">
                                <div class="action-title">Reports</div>
                                <div class="action-desc">View analytics</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="activity-section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Activity</h2>
                        <button class="btn-text" id="refresh-activity">Refresh</button>
                    </div>
                    <div class="activity-list modern-card">
                        <div class="empty-activity">
                            <div class="empty-icon">📊</div>
                            <h3>No recent activity</h3>
                            <p>Start by adding your first record to see activity here</p>
                            <button class="btn btn-primary" data-action="add-income">
                                Add First Record
                            </button>
                        </div>
                    </div>
                </div>

                <!-- PWA Features -->
                <div class="pwa-features">
                    <div class="feature-card modern-card">
                        <h3>📱 PWA Ready</h3>
                        <p>This app works offline and can be installed on your device</p>
                        <div class="feature-badges">
                            <span class="feature-badge">Offline Support</span>
                            <span class="feature-badge">Fast Loading</span>
                            <span class="feature-badge">Installable</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupDashboardInteractions();
        this.updateDashboardStats();
    },

    setupDashboardInteractions() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-activity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshActivity();
            });
        }

        // Add hover effects
        this.setupHoverEffects();
    },

    setupHoverEffects() {
        const cards = document.querySelectorAll('.modern-card, .quick-action-btn');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
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
            // Show loading feedback
            this.showActionFeedback(action);
            
            // Navigate to module
            setTimeout(() => {
                window.app.showSection(targetModule);
            }, 300);
        }
    },

    showActionFeedback(action) {
        // You can add a small notification or loading state
        console.log(`Opening ${action}...`);
    },

    updateDashboardStats() {
        // Update with real data from your app
        const revenue = this.calculateTotalRevenue();
        const expenses = this.calculateTotalExpenses();
        const inventoryCount = this.getInventoryCount();
        const livestockCount = this.getLivestockCount();

        this.updateElement('total-revenue', `$${revenue.toFixed(2)}`);
        this.updateElement('total-expenses', `$${expenses.toFixed(2)}`);
        this.updateElement('inventory-count', inventoryCount);
        this.updateElement('livestock-count', livestockCount);
    },

    calculateTotalRevenue() {
        // Replace with actual data calculation
        const sales = FarmModules.appData.sales || [];
        return sales.reduce((total, sale) => total + (sale.amount || 0), 0);
    },

    calculateTotalExpenses() {
        // Replace with actual data calculation
        const expenses = FarmModules.appData.expenses || [];
        return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    },

    getInventoryCount() {
        const inventory = FarmModules.appData.inventory || [];
        return inventory.length;
    },

    getLivestockCount() {
        // Replace with actual livestock data
        return 0;
    },

    refreshActivity() {
        // Show loading state
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = `
                <div class="loading-activity">
                    <div class="loading-spinner"></div>
                    <p>Refreshing activity...</p>
                </div>
            `;
        }

        // Simulate API call
        setTimeout(() => {
            this.updateDashboardStats();
            this.showNotification('Activity refreshed', 'success');
            this.renderActivityList();
        }, 1000);
    },

    renderActivityList() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        // Get recent activity from app data
        const recentActivity = this.getRecentActivity();
        
        if (recentActivity.length === 0) {
            activityList.innerHTML = `
                <div class="empty-activity">
                    <div class="empty-icon">📊</div>
                    <h3>No recent activity</h3>
                    <p>Start by adding your first record</p>
                    <button class="btn btn-primary" data-action="add-income">
                        Add First Record
                    </button>
                </div>
            `;
            
            // Re-attach event listener
            const addRecordBtn = activityList.querySelector('button');
            if (addRecordBtn) {
                addRecordBtn.addEventListener('click', () => {
                    this.handleQuickAction('add-income');
                });
            }
            return;
        }

        // Render activity items
        activityList.innerHTML = recentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                <div class="activity-amount ${activity.type}">${activity.amount}</div>
            </div>
        `).join('');
    },

    getRecentActivity() {
        // Combine activity from different modules
        const activities = [];
        
        // Add sales activities
        const sales = FarmModules.appData.sales || [];
        sales.slice(0, 5).forEach(sale => {
            activities.push({
                icon: '💰',
                title: 'Sale Recorded',
                description: `Sale of ${sale.item || 'product'}`,
                time: this.formatTime(sale.date),
                amount: `+$${sale.amount || 0}`,
                type: 'income'
            });
        });

        // Add expense activities
        const expenses = FarmModules.appData.expenses || [];
        expenses.slice(0, 5).forEach(expense => {
            activities.push({
                icon: '💸',
                title: 'Expense Recorded',
                description: expense.category || 'Farm expense',
                time: this.formatTime(expense.date),
                amount: `-$${expense.amount || 0}`,
                type: 'expense'
            });
        });

        // Sort by time and return latest 5
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);
    },

    formatTime(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    setupServiceWorker() {
        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    },

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type}: ${message}`);
        }
    }
};

// Register the enhanced module
if (window.FarmModules) {
    window.FarmModules.registerModule('dashboard', DashboardModule);
    console.log('✅ Enhanced PWA dashboard module registered');
}
