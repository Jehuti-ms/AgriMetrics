// modules/dashboard.js - CORRECTED VERSION (No Theme Switching)
console.log('Loading dashboard module with Style Manager integration...');

const DashboardModule = {
    name: 'dashboard',
    id: 'dashboard',
    initialized: false,
    element: null,

    initialize() {
        console.log('📊 Initializing Dashboard with StyleManager...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Register with StyleManager
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

    // StyleManager integration methods
    onThemeChange(theme) {
        console.log(`Dashboard updating for theme: ${theme}`);
        this.applyThemeStyles();
    },

    onStyleUpdate(styles) {
        console.log('Dashboard styles updated:', styles);
        this.applyThemeStyles();
    },

    applyThemeStyles() {
        if (!this.element || !window.StyleManager) return;
        
        const theme = StyleManager.getCurrentTheme();
        const styles = StyleManager.getModuleStyles(this.id);
        
        // Apply background styles
        this.element.style.backgroundColor = styles?.backgroundColor || 
            (theme === 'dark' ? '#1a1a1a' : '#f5f5f5');
        
        // ✅ Force white header text as requested
        const welcomeHeader = this.element.querySelector('.welcome-section h1');
        if (welcomeHeader) {
            welcomeHeader.style.color = '#ffffff';
        }
        
        // Update all other text elements based on theme
        this.updateTextColors(theme, styles);
        
        // Update card backgrounds
        this.updateCardStyles(theme, styles);
        
        // Update button styles
        this.updateButtonStyles(theme, styles);
    },

    updateTextColors(theme, styles) {
        // Update section titles (except welcome header which stays white)
        const sectionTitles = this.element.querySelectorAll('.section-title, .welcome-subtitle');
        sectionTitles.forEach(el => {
            const textColor = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            el.style.color = textColor;
        });

        // Update stat values
        const statValues = this.element.querySelectorAll('.stat-value');
        statValues.forEach(el => {
            const textColor = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            el.style.color = textColor;
        });

        // Update stat labels and subtitles
        const secondaryText = this.element.querySelectorAll('.stat-label, .action-subtitle, .action-title, .empty-title, .empty-subtitle');
        secondaryText.forEach(el => {
            const secondaryColor = theme === 'dark' ? '#a0a0a0' : '#666666';
            el.style.color = secondaryColor;
        });
    },

    updateCardStyles(theme, styles) {
        const cards = this.element.querySelectorAll('.stat-card, .activity-list, .quick-action-btn');
        cards.forEach(card => {
            card.style.backgroundColor = styles?.cardBackground || 
                (theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            card.style.borderColor = styles?.borderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        });
    },

    updateButtonStyles(theme, styles) {
        const buttons = this.element.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.backgroundColor = styles?.buttonBackground || 
                (theme === 'dark' ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            button.style.color = styles?.buttonTextColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            button.style.borderColor = styles?.buttonBorderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)');
        });
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
    },

    renderDashboard() {
        if (!this.element) return;

        // Clean, semantic HTML without theme controls
        this.element.innerHTML = `
            <div id="dashboard" class="module-container">
                <!-- Welcome Section with white header text -->
                <div class="welcome-section">
                    <h1 class="welcome-header">Welcome to Farm Management</h1>
                    <p class="welcome-subtitle" style="color: white; margin: 0; padding: 0;">
                      Manage your farm operations efficiently
                    </p>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-actions">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div class="action-icon">💰</div>
                            <span class="action-title">Add Income</span>
                            <span class="action-subtitle">Record new income</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-expense">
                            <div class="action-icon">💸</div>
                            <span class="action-title">Add Expense</span>
                            <span class="action-subtitle">Record new expense</span>
                        </button>

                        <button class="quick-action-btn" data-action="check-inventory">
                            <div class="action-icon">📦</div>
                            <span class="action-title">Check Inventory</span>
                            <span class="action-subtitle">View stock levels</span>
                        </button>

                        <button class="quick-action-btn" data-action="record-feed">
                            <div class="action-icon">🌾</div>
                            <span class="action-title">Record Feed</span>
                            <span class="action-subtitle">Log feed usage</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-production">
                            <div class="action-icon">🚜</div>
                            <span class="action-title">Production</span>
                            <span class="action-subtitle">Record production</span>
                        </button>

                        <button class="quick-action-btn" data-action="view-reports">
                            <div class="action-icon">📈</div>
                            <span class="action-title">View Reports</span>
                            <span class="action-subtitle">Analytics & insights</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview">
                    <h2 class="section-title">Overview</h2>
                    <div class="stats-grid">
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
                <div class="recent-activity">
                    <h2 class="section-title">Recent Activity</h2>
                    <div class="activity-list">
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
                <div class="refresh-section">
                    <button id="refresh-stats-btn" class="btn-outline">
                        🔄 Refresh Stats
                    </button>
                </div>
            </div>
        `;

        // Apply initial layout styles
        this.applyInitialStyles();
        
        // Add event listeners
        this.setupQuickActions();
        this.setupRefreshButton();
        
        // Apply theme styles from StyleManager
        if (window.StyleManager) {
            this.applyThemeStyles();
        }
    },

    applyInitialStyles() {
        // Layout-only styles (these won't be overridden by theme)
        const container = this.element.querySelector('.dashboard-container');
        if (container) {
            container.style.padding = '20px';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
        }

        const welcomeSection = this.element.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.marginBottom = '30px';
        }

        // ✅ Force white header text (fixed requirement)
        const welcomeHeader = this.element.querySelector('.welcome-header');
        if (welcomeHeader) {
            welcomeHeader.style.fontSize = '28px';
            welcomeHeader.style.marginBottom = '8px';
            welcomeHeader.style.color = '#ffffff';
            welcomeHeader.style.fontWeight = '600';
        }

        const welcomeSubtitle = this.element.querySelector('.welcome-subtitle');
        if (welcomeSubtitle) {
            welcomeSubtitle.style.fontSize = '16px';
        }

        // Section titles layout
        const sectionTitles = this.element.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.fontSize = '20px';
            title.style.marginBottom = '20px';
            title.style.fontWeight = '600';
        });

        // Quick actions grid layout
        const actionsGrid = this.element.querySelector('.actions-grid');
        if (actionsGrid) {
            actionsGrid.style.display = 'grid';
            actionsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
            actionsGrid.style.gap = '16px';
            actionsGrid.style.marginBottom = '30px';
        }

        // Quick action buttons layout
        const actionButtons = this.element.querySelectorAll('.quick-action-btn');
        actionButtons.forEach(btn => {
            btn.style.borderRadius = '16px';
            btn.style.padding = '24px 16px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.3s ease';
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.gap = '12px';
            btn.style.minHeight = '120px';
            btn.style.border = '1px solid';
            btn.style.backdropFilter = 'blur(20px)';
            btn.style.WebkitBackdropFilter = 'blur(20px)';
            btn.style.fontFamily = 'inherit';
        });

        // Action icons layout
        const actionIcons = this.element.querySelectorAll('.action-icon');
        actionIcons.forEach(icon => {
            icon.style.fontSize = '32px';
            icon.style.lineHeight = '1';
        });

        // Action titles layout
        const actionTitles = this.element.querySelectorAll('.action-title');
        actionTitles.forEach(title => {
            title.style.fontSize = '14px';
            title.style.fontWeight = '600';
            title.style.textAlign = 'center';
            title.style.lineHeight = '1.2';
        });

        // Action subtitles layout
        const actionSubtitles = this.element.querySelectorAll('.action-subtitle');
        actionSubtitles.forEach(subtitle => {
            subtitle.style.fontSize = '12px';
            subtitle.style.textAlign = 'center';
            subtitle.style.lineHeight = '1.3';
        });

        // Stats grid layout
        const statsGrid = this.element.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.style.display = 'grid';
            statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
            statsGrid.style.gap = '16px';
            statsGrid.style.marginBottom = '40px';
        }

        // Stat cards layout
        const statCards = this.element.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.borderRadius = '16px';
            card.style.padding = '20px';
            card.style.textAlign = 'center';
            card.style.border = '1px solid';
            card.style.backdropFilter = 'blur(20px)';
            card.style.WebkitBackdropFilter = 'blur(20px)';
            card.style.transition = 'transform 0.2s ease';
        });

        // Stat icons layout
        const statIcons = this.element.querySelectorAll('.stat-icon');
        statIcons.forEach(icon => {
            icon.style.fontSize = '24px';
            icon.style.marginBottom = '8px';
            icon.style.lineHeight = '1';
        });

        // Stat values layout
        const statValues = this.element.querySelectorAll('.stat-value');
        statValues.forEach(value => {
            value.style.fontSize = '24px';
            value.style.fontWeight = 'bold';
            value.style.marginBottom = '4px';
            value.style.lineHeight = '1.2';
        });

        // Stat labels layout
        const statLabels = this.element.querySelectorAll('.stat-label');
        statLabels.forEach(label => {
            label.style.fontSize = '14px';
            label.style.lineHeight = '1.3';
        });

        // Activity list layout
        const activityList = this.element.querySelector('.activity-list');
        if (activityList) {
            activityList.style.borderRadius = '16px';
            activityList.style.padding = '20px';
            activityList.style.border = '1px solid';
            activityList.style.backdropFilter = 'blur(20px)';
            activityList.style.WebkitBackdropFilter = 'blur(20px)';
            activityList.style.minHeight = '200px';
        }

        // Empty state layout
        const emptyState = this.element.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
        }

        const emptyIcon = this.element.querySelector('.empty-icon');
        if (emptyIcon) {
            emptyIcon.style.fontSize = '48px';
            emptyIcon.style.marginBottom = '16px';
            emptyIcon.style.lineHeight = '1';
        }

        const emptyTitle = this.element.querySelector('.empty-title');
        if (emptyTitle) {
            emptyTitle.style.fontSize = '16px';
            emptyTitle.style.marginBottom = '8px';
            emptyTitle.style.fontWeight = '600';
        }

        const emptySubtitle = this.element.querySelector('.empty-subtitle');
        if (emptySubtitle) {
            emptySubtitle.style.fontSize = '14px';
        }

        // Refresh button layout
        const refreshBtn = this.element.querySelector('#refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.style.borderRadius = '12px';
            refreshBtn.style.padding = '12px 24px';
            refreshBtn.style.cursor = 'pointer';
            refreshBtn.style.fontSize = '14px';
            refreshBtn.style.transition = 'all 0.3s ease';
            refreshBtn.style.border = '1px solid';
            refreshBtn.style.backdropFilter = 'blur(20px)';
            refreshBtn.style.WebkitBackdropFilter = 'blur(20px)';
            refreshBtn.style.fontFamily = 'inherit';
        }

        const refreshSection = this.element.querySelector('.refresh-section');
        if (refreshSection) {
            refreshSection.style.textAlign = 'center';
            refreshSection.style.marginTop = '30px';
        }
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });

            // Add hover effects (these are behavioral, not theme-based)
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

    // ... [rest of the methods remain exactly the same as your original] ...
    // All the stats loading, updating, and business logic methods
    // from your original code remain unchanged

    loadAndDisplayStats() {
        const profileStats = this.getProfileStats();
        this.updateDashboardStats(profileStats);
        this.updateRecentActivity(profileStats);
    },

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

        if (window.FarmModules && window.FarmModules.appData) {
            const sharedStats = window.FarmModules.appData.profile?.dashboardStats;
            if (sharedStats) {
                stats = { ...stats, ...sharedStats };
            }
        }

        if (stats.totalIncome === 0) {
            const savedStats = localStorage.getItem('farm-dashboard-stats');
            if (savedStats) {
                stats = { ...stats, ...JSON.parse(savedStats) };
            }
        }

        return stats;
    },

    updateDashboardStats(newStats) {
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            Object.assign(window.FarmModules.appData.profile.dashboardStats, newStats);
        }

        this.updateDashboardDisplay(newStats);
    },

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

        window.FarmModules.appData.profile.dashboardStats.recentActivities.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        if (window.FarmModules.appData.profile.dashboardStats.recentActivities.length > 10) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = 
                window.FarmModules.appData.profile.dashboardStats.recentActivities.slice(0, 10);
        }

        this.updateRecentActivity(this.getProfileStats());
    },

    updateDashboardDisplay(stats) {
        this.updateStatCard('total-revenue', this.formatCurrency(stats.totalRevenue || stats.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateStatCard('inventory-items', stats.totalInventoryItems || 0);
        this.updateStatCard('active-birds', stats.totalBirds || 0);
        this.updateStatCard('total-orders', stats.totalOrders || 0);
        this.updateStatCard('net-profit', this.formatCurrency(stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0));
        this.updateStatCard('total-customers', stats.totalCustomers || 0);
        this.updateStatCard('total-products', stats.totalProducts || 0);

        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0;
            const profitColor = netProfit >= 0 ? '#22c55e' : '#ef4444';
            profitCard.style.borderLeft = `4px solid ${profitColor}`;
        }

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

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.textContent = value;
            }, 150);
        }
    },

    updateRecentActivity(stats) {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = [];
        const recentActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];

        if (recentActivities.length > 0) {
            recentActivities.forEach(activity => {
                activities.push({
                    icon: activity.icon || '📊',
                    text: activity.message || activity.text || 'Activity',
                    time: this.formatTimeAgo(activity.timestamp)
                });
            });
        } else {
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
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
                        <div style="font-size: 20px;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 14px;">${activity.text}</div>
                            <div style="font-size: 12px; opacity: 0.7;">${activity.time}</div>
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
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(targetModule);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(targetModule);
            } else {
                const event = new CustomEvent('sectionChange', { 
                    detail: { section: targetModule } 
                });
                document.dispatchEvent(event);
            }
            
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
    console.log('✅ Dashboard module registered with StyleManager integration');
}

// Export for global access
window.DashboardModule = DashboardModule;
