// modules/reports.js - FIXED StyleManager integration
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    id: 'reports',
    initialized: false,
    element: null,

    initialize() {
        console.log('📈 Initializing Reports with StyleManager...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // FIXED: Use registerModule instead of registerComponent
        if (window.StyleManager && window.StyleManager.registerModule) {
            window.StyleManager.registerModule(this.name, this.element, this);
        }

        this.renderReports();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Reports initialized with StyleManager');
        return true;
    },

    // StyleManager integration methods
    onThemeChange(theme) {
        console.log(`Reports updating for theme: ${theme}`);
        this.applyThemeStyles();
    },

    onStyleUpdate(styles) {
        console.log('Reports styles updated:', styles);
        this.applyThemeStyles();
    },

    applyThemeStyles() {
        if (!this.element || !window.StyleManager) return;
        
        // Get current theme from StyleManager
        const theme = window.StyleManager.currentTheme || 'light';
        
        // Get module styles if available
        const styles = window.StyleManager.getModuleStyles ? 
                      window.StyleManager.getModuleStyles(this.name) : null;
        
        // Apply background styles
        this.element.style.backgroundColor = styles?.backgroundColor || 
            (theme === 'dark' ? '#1a1a1a' : '#f5f5f5');
        
        // Apply module-specific styles
        this.applyModuleStyles(theme, styles);
    },

    applyModuleStyles(theme, styles) {
        // Apply styles to reports elements
        const sectionTitles = this.element.querySelectorAll('.section-title');
        sectionTitles.forEach(el => {
            const textColor = styles?.textColor || 
                (theme === 'dark' ? '#ffffff' : '#1a1a1a');
            el.style.color = textColor;
        });

        // Apply to charts container, etc.
        const containers = this.element.querySelectorAll('.chart-container, .report-section');
        containers.forEach(container => {
            container.style.backgroundColor = styles?.cardBackground || 
                (theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            container.style.borderColor = styles?.borderColor || 
                (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        });
    },

    setupEventListeners() {
        // Your reports event listeners here
    },

    renderReports() {
        if (!this.element) return;

        // Reports HTML structure
        this.element.innerHTML = `
            <div id="reports" class="module-container">
                <div class="reports-header">
                    <h1 class="welcome-header" style="color: #ffffff;">Reports & Analytics</h1>
                    <p class="welcome-subtitle">Analyze your farm performance</p>
                </div>

                <!-- Your reports content here -->
                <div class="reports-content">
                    <h2 class="section-title">Farm Reports</h2>
                    <div class="chart-container">
                        <p>Reports content will go here...</p>
                    </div>
                </div>
            </div>
        `;

        this.applyLayoutStyles();
        this.applyThemeStyles();
    },

    applyLayoutStyles() {
        const container = this.element.querySelector('#reports');
        if (container) {
            container.style.padding = '20px';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
        }

        const welcomeHeader = this.element.querySelector('.welcome-header');
        if (welcomeHeader) {
            welcomeHeader.style.fontSize = '28px';
            welcomeHeader.style.marginBottom = '8px';
            welcomeHeader.style.fontWeight = '600';
            welcomeHeader.style.color = '#ffffff'; // Force white
        }
    },

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

        // Quick action buttons - layout only
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
            btn.style.fontFamily = 'inherit';
            btn.style.backdropFilter = 'blur(20px)';
            btn.style.WebkitBackdropFilter = 'blur(20px)';
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

        // Stat cards - layout only
        const statCards = this.element.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.borderRadius = '16px';
            card.style.padding = '20px';
            card.style.textAlign = 'center';
            card.style.transition = 'transform 0.2s ease';
            card.style.backdropFilter = 'blur(20px)';
            card.style.WebkitBackdropFilter = 'blur(20px)';
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
            activityList.style.minHeight = '200px';
            activityList.style.backdropFilter = 'blur(20px)';
            activityList.style.WebkitBackdropFilter = 'blur(20px)';
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
            refreshBtn.style.fontFamily = 'inherit';
            refreshBtn.style.backdropFilter = 'blur(20px)';
            refreshBtn.style.WebkitBackdropFilter = 'blur(20px)';
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

            // Hover effects (behavioral, not theme-based)
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

            // Hover effect
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

    // ... [rest of your methods remain exactly the same - they're fine] ...

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
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px;">
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
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered');
}

// Export for global access
window.ReportsModule = ReportsModule;// modules/reports.js - UPDATED TO FOLLOW StyleManager PATTERN
console.log('Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,

    initialize() {
        console.log('📈 Initializing reports...');
        
        // Get content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.renderModule();
        this.initialized = true;
        return true;
    },

    onThemeChange(theme) {
        console.log(`Reports module: Theme changed to ${theme}`);
        // Re-render or update styles when theme changes
        if (this.initialized) {
            this.renderModule();
        }
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Report Categories -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sales Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Health Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Feed Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🏆</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Comprehensive Farm Report</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report" style="width: 100%; background: linear-gradient(135deg, #22c55e, #3b82f6);">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden" style="margin-top: 32px;">
                    <div class="output-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report Output</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-outline" id="print-report">
                                🖨️ Print
                            </button>
                            <button class="btn-outline" id="export-report">
                                📥 Export
                            </button>
                            <button class="btn-outline" id="close-report">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <div class="output-content" style="padding: 24px;">
                        <div id="report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Farm Activity</h3>
                    <div id="recent-activity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Report generation buttons
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
        document.querySelector('.generate-sales-report')?.addEventListener('click', () => this.generateSalesReport());
        document.querySelector('.generate-health-report')?.addEventListener('click', () => this.generateHealthReport());
        document.querySelector('.generate-feed-report')?.addEventListener('click', () => this.generateFeedReport());
        document.querySelector('.generate-comprehensive-report')?.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report action buttons
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
        document.getElementById('export-report')?.addEventListener('click', () => this.exportReport());
        document.getElementById('close-report')?.addEventListener('click', () => this.closeReport());
    },

    renderQuickStats() {
        const stats = this.getFarmStats();
        
        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Birds</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalBirds}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalProduction}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Low Stock Items</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e'};">${stats.lowStockItems}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Feed Used</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalFeedUsed} kg</div>
            </div>
        `;
    },

    getFarmStats() {
        if (window.FarmModules && window.FarmModules.appData && window.FarmModules.appData.profile && window.FarmModules.appData.profile.dashboardStats) {
            const sharedStats = window.FarmModules.appData.profile.dashboardStats;
            return {
                totalRevenue: sharedStats.totalRevenue || 0,
                netProfit: sharedStats.netProfit || 0,
                totalBirds: sharedStats.totalBirds || 0,
                totalProduction: sharedStats.totalProduction || 0,
                lowStockItems: sharedStats.lowStockItems || 0,
                totalFeedUsed: sharedStats.totalFeedUsed || 0
            };
        }

        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');

        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return {
            totalRevenue,
            netProfit,
            totalBirds: currentStock,
            totalProduction,
            lowStockItems,
            totalFeedUsed
        };
    },

    renderRecentActivity() {
        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Start using the app to see activity here</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${activity.icon}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${activity.description}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">${activity.date}</div>
                            </div>
                        </div>
                        ${activity.amount !== null ? `
                            <div style="font-weight: bold; color: var(--text-primary);">
                                ${this.formatCurrency(activity.amount)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    getRecentActivities() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]').slice(0, 3);
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]').slice(0, 3);
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]').slice(0, 3);
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]').slice(0, 3);
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]').slice(0, 3);

        const activities = [];

        transactions.forEach(transaction => {
            activities.push({
                type: 'transaction',
                date: transaction.date,
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount,
                icon: transaction.type === 'income' ? '💰' : '💸'
            });
        });

        sales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: sale.date,
                description: `📦 Sale: ${sale.items?.length || 0} items`,
                amount: sale.totalAmount,
                icon: '📦'
            });
        });

        production.forEach(record => {
            activities.push({
                type: 'production',
                date: record.date,
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null,
                icon: '🚜'
            });
        });

        feedRecords.forEach(record => {
            activities.push({
                type: 'feed',
                date: record.date,
                description: `🌾 Feed: ${record.quantity}kg ${record.feedType}`,
                amount: record.cost,
                icon: '🌾'
            });
        });

        mortalityRecords.forEach(record => {
            activities.push({
                type: 'mortality',
                date: record.date,
                description: `😔 Mortality: ${record.quantity} birds (${this.formatCause(record.cause)})`,
                amount: null,
                icon: '😔'
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        return activities.slice(0, 5);
    },

    generateFinancialReport() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        const incomeByCategory = {};
        incomeTransactions.forEach(transaction => {
            incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
        });

        const expensesByCategory = {};
        expenseTransactions.forEach(transaction => {
            expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        });

        const reportContent = `
            <div class="report-section">
                <h4>💰 Financial Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(totalExpenses)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Profit Margin</span>
                    <span class="metric-value ${profitMargin >= 0 ? 'profit' : 'expense'}">${profitMargin.toFixed(1)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Income by Category</h4>
                ${Object.entries(incomeByCategory).map(([category, amount]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCategory(category)}</span>
                        <span class="metric-value income">${this.formatCurrency(amount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>📉 Expenses by Category</h4>
                ${Object.entries(expensesByCategory).map(([category, amount]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCategory(category)}</span>
                        <span class="metric-value expense">${this.formatCurrency(amount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Financial Insights</h4>
                <div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; color: #166534;">
                        ${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Financial Performance Report', reportContent);
    },

    generateProductionReport() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        
        const productionByProduct = {};
        production.forEach(record => {
            productionByProduct[record.product] = (productionByProduct[record.product] || 0) + record.quantity;
        });

        const qualityDistribution = {};
        production.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

        const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        const mortalityRate = currentStock > 0 ? (totalMortality / currentStock) * 100 : 0;

        const reportContent = `
            <div class="report-section">
                <h4>🚜 Production Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Production</span>
                    <span class="metric-value">${totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Current Stock</span>
                    <span class="metric-value">${currentStock} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Mortality</span>
                    <span class="metric-value">${totalMortality} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'expense' : 'profit'}">${mortalityRate.toFixed(2)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Production by Product</h4>
                ${Object.entries(productionByProduct).map(([product, quantity]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatProductName(product)}</span>
                        <span class="metric-value">${quantity} units</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>⭐ Quality Distribution</h4>
                ${Object.entries(qualityDistribution).map(([quality, count]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatQuality(quality)}</span>
                        <span class="metric-value">${count} records</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>📈 Production Insights</h4>
                <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af;">
                        ${this.getProductionInsights(totalProduction, mortalityRate, qualityDistribution)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Production Analysis Report', reportContent);
    },

    generateInventoryReport() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
        const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

        const reportContent = `
            <div class="report-section">
                <h4>📦 Inventory Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Items</span>
                    <span class="metric-value">${inventory.length + feedInventory.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Low Stock Items</span>
                    <span class="metric-value ${lowStockItems.length > 0 ? 'warning' : 'profit'}">${lowStockItems.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Inventory Value</span>
                    <span class="metric-value income">${this.formatCurrency(totalInventoryValue)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>⚠️ Low Stock Alerts</h4>
                ${lowStockItems.length > 0 ? lowStockItems.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${item.name}</span>
                        <span class="metric-value warning">${item.currentStock} / ${item.minStock}</span>
                    </div>
                `).join('') : '<p style="color: #22c55e;">✅ All items are sufficiently stocked</p>'}
            </div>

            <div class="report-section">
                <h4>🌾 Feed Inventory</h4>
                ${feedInventory.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                        <span class="metric-value ${item.currentStock <= item.minStock ? 'warning' : ''}">${item.currentStock} kg</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Inventory Analysis Report', reportContent);
    },

    generateSalesReport() {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

        const reportContent = `
            <div class="report-section">
                <h4>📊 Sales Performance</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Sales</span>
                    <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Number of Sales</span>
                    <span class="metric-value">${sales.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Recent Sales</h4>
                ${sales.slice(0, 5).map(sale => `
                    <div class="metric-row">
                        <span class="metric-label">${sale.date} - ${sale.customer || 'Walk-in'}</span>
                        <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Sales Insights</h4>
                <div style="padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af;">
                        ${this.getSalesInsights(sales.length, totalSales)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Sales Performance Report', reportContent);
    },

    generateHealthReport() {
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const birdsStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        
        const totalMortality = mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        const mortalityRate = birdsStock > 0 ? (totalMortality / birdsStock) * 100 : 0;

        const causeBreakdown = {};
        mortalityRecords.forEach(record => {
            causeBreakdown[record.cause] = (causeBreakdown[record.cause] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🐔 Flock Health Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Current Bird Count</span>
                    <span class="metric-value">${birdsStock}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Mortality</span>
                    <span class="metric-value">${totalMortality} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'expense' : 'profit'}">${mortalityRate.toFixed(2)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Mortality by Cause</h4>
                ${Object.entries(causeBreakdown).map(([cause, count]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatCause(cause)}</span>
                        <span class="metric-value">${count} birds</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>💡 Health Recommendations</h4>
                <div style="padding: 16px; background: #fef7ed; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;">
                        ${this.getHealthRecommendations(mortalityRate, causeBreakdown)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Flock Health Report', reportContent);
    },

    generateFeedReport() {
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + record.cost, 0);
        
        const feedTypeBreakdown = {};
        feedRecords.forEach(record => {
            feedTypeBreakdown[record.feedType] = (feedTypeBreakdown[record.feedType] || 0) + record.quantity;
        });

        const reportContent = `
            <div class="report-section">
                <h4>🌾 Feed Consumption Summary</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Used</span>
                    <span class="metric-value">${totalFeedUsed} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Cost</span>
                    <span class="metric-value expense">${this.formatCurrency(totalFeedCost)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Cost per kg</span>
                    <span class="metric-value">${this.formatCurrency(totalFeedCost / totalFeedUsed)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Feed Usage by Type</h4>
                ${Object.entries(feedTypeBreakdown).map(([feedType, quantity]) => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatFeedType(feedType)}</span>
                        <span class="metric-value">${quantity} kg</span>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h4>📦 Current Feed Inventory</h4>
                ${feedInventory.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${this.formatFeedType(item.feedType)}</span>
                        <span class="metric-value ${item.currentStock <= item.minStock ? 'warning' : ''}">
                            ${item.currentStock} kg (min: ${item.minStock}kg)
                        </span>
                    </div>
                `).join('')}
            </div>
        `;

        this.showReport('Feed Consumption Report', reportContent);
    },

    generateComprehensiveReport() {
        const stats = this.getFarmStats();
        
        const reportContent = `
            <div class="report-section">
                <h2>🏆 Comprehensive Farm Report</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="padding: 20px; background: #f0f9ff; border-radius: 12px;">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">Financial Health</h4>
                        <div class="metric-row">
                            <span>Revenue:</span>
                            <span class="income">${this.formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div class="metric-row">
                            <span>Profit:</span>
                            <span class="${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                    <div style="padding: 20px; background: #f0fdf4; border-radius: 12px;">
                        <h4 style="color: #166534; margin-bottom: 10px;">Production</h4>
                        <div class="metric-row">
                            <span>Total Birds:</span>
                            <span>${stats.totalBirds}</span>
                        </div>
                        <div class="metric-row">
                            <span>Production:</span>
                            <span>${stats.totalProduction} units</span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="padding: 20px; background: #fef7ed; border-radius: 12px;">
                        <h4 style="color: #92400e; margin-bottom: 10px;">Inventory</h4>
                        <div class="metric-row">
                            <span>Low Stock Items:</span>
                            <span class="${stats.lowStockItems > 0 ? 'warning' : 'profit'}">${stats.lowStockItems}</span>
                        </div>
                        <div class="metric-row">
                            <span>Feed Used:</span>
                            <span>${stats.totalFeedUsed} kg</span>
                        </div>
                    </div>
                    <div style="padding: 20px; background: #fae8ff; border-radius: 12px;">
                        <h4 style="color: #86198f; margin-bottom: 10px;">Performance</h4>
                        <div class="metric-row">
                            <span>Farm Score:</span>
                            <span style="color: #22c55e; font-weight: bold;">85%</span>
                        </div>
                        <div class="metric-row">
                            <span>Status:</span>
                            <span style="color: #22c55e;">Excellent</span>
                        </div>
                    </div>
                </div>

                <div class="report-section" style="margin-top: 30px;">
                    <h4>📈 Overall Assessment</h4>
                    <div style="padding: 20px; background: linear-gradient(135deg, #dcfce7, #dbeafe); border-radius: 12px;">
                        <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">
                            Your farm is performing well with strong financial results and good production metrics. 
                            Continue monitoring inventory levels and maintain current operational practices for sustained success.
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.showReport('Comprehensive Farm Report', reportContent);
    },

    showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').classList.remove('hidden');
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        document.getElementById('report-output').classList.add('hidden');
    },

    printReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Farm Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-section { margin-bottom: 30px; }
                        .metric-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .metric-label { font-weight: 600; }
                        .metric-value { font-weight: bold; }
                        .income { color: #22c55e; }
                        .expense { color: #ef4444; }
                        .profit { color: #22c55e; }
                        .warning { color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <h1>${document.getElementById('report-title').textContent}</h1>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    exportReport() {
        const reportTitle = document.getElementById('report-title').textContent;
        const reportContent = document.getElementById('report-content').textContent;
        
        const blob = new Blob([`${reportTitle}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${reportContent}`], {
            type: 'text/plain'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Report exported successfully!', 'success');
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatCategory(category) {
        const categories = {
            'egg-sales': 'Egg Sales',
            'poultry-sales': 'Poultry Sales',
            'crop-sales': 'Crop Sales',
            'feed': 'Feed',
            'medication': 'Medication',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'other': 'Other'
        };
        return categories[category] || category;
    },

    formatProductName(product) {
        const products = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'pork': 'Pork',
            'beef': 'Beef',
            'milk': 'Milk',
            'other': 'Other'
        };
        return products[product] || product;
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C',
            'rejects': 'Rejects'
        };
        return qualities[quality] || quality;
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'other': 'Other'
        };
        return causes[cause] || cause;
    },

    formatFeedType(feedType) {
        const types = {
            'starter': 'Starter',
            'grower': 'Grower',
            'finisher': 'Finisher',
            'layer': 'Layer'
        };
        return types[feedType] || feedType;
    },

    getFinancialInsights(income, expenses, netProfit, profitMargin) {
        if (netProfit < 0) {
            return "⚠️ Your farm is operating at a loss. Consider reviewing expenses and increasing revenue streams.";
        } else if (profitMargin < 10) {
            return "📈 Profit margin is low. Focus on cost optimization and premium product offerings.";
        } else if (profitMargin > 25) {
            return "🎉 Excellent profitability! Consider reinvesting in farm expansion or improvements.";
        } else {
            return "✅ Healthy financial performance. Maintain current operations and monitor trends.";
        }
    },

    getProductionInsights(totalProduction, mortalityRate, qualityDistribution) {
        if (totalProduction === 0) return "No production data recorded. Start tracking your farm's output.";
        if (mortalityRate > 10) return "⚠️ High mortality rate affecting production. Review flock management practices.";
        if (qualityDistribution['excellent'] > qualityDistribution['grade-b']) {
            return "✅ Excellent quality production! Maintain current standards and practices.";
        }
        return "Good production levels. Focus on quality improvement and mortality reduction.";
    },

    getSalesInsights(salesCount, totalSales) {
        if (salesCount === 0) return "No sales recorded yet. Focus on marketing and customer acquisition.";
        if (totalSales < 1000) return "Sales are starting. Consider expanding product offerings and marketing efforts.";
        if (totalSales > 5000) return "Strong sales performance! Consider scaling operations and exploring new markets.";
        return "Steady sales performance. Continue current strategies and monitor customer feedback.";
    },

    getHealthRecommendations(mortalityRate, causeBreakdown) {
        if (mortalityRate > 10) return "⚠️ High mortality rate detected! Immediate veterinary consultation recommended.";
        if (mortalityRate > 5) return "Monitor flock health closely. Review feeding, housing, and environmental conditions.";
        if (causeBreakdown.disease > 0) return "Disease cases detected. Implement biosecurity measures and consider vaccination.";
        return "✅ Good flock health. Maintain current management practices and regular monitoring.";
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
}
