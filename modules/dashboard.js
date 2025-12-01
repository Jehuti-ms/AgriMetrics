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
window.ReportsModule = ReportsModule;
