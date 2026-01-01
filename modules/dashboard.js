// modules/dashboard.js - UPDATED WITH REAL-TIME FILTERS
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,
    element: null,
    activityFilter: '7d', // Default to last 7 days
    realTimeInterval: null,
    autoRefresh: true,

    initialize() {
        console.log('📊 Initializing Dashboard...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.renderDashboard();
        this.setupEventListeners();
        this.initialized = true;
        
        this.loadAndDisplayStats();
        this.startRealTimeUpdates();
        
        console.log('✅ Dashboard initialized with real-time updates');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Dashboard updating for theme: ${theme}`);
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupRefreshButton();
        this.setupActivityFilter();
        this.setupRealTimeToggle();
        
        // Listen for data changes from other modules
        this.setupDataChangeListeners();
    },

    // NEW: Setup data change listeners
    setupDataChangeListeners() {
        // Listen for custom events when data changes
        document.addEventListener('farmDataChanged', (e) => {
            console.log('📡 Data changed detected:', e.detail?.module);
            if (this.autoRefresh) {
                this.loadAndDisplayStats();
            }
        });

        // Listen for storage changes (for cross-tab updates)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('farm-')) {
                console.log('💾 Storage change detected:', e.key);
                if (this.autoRefresh) {
                    setTimeout(() => this.loadAndDisplayStats(), 500);
                }
            }
        });
    },

    // NEW: Start real-time updates
    startRealTimeUpdates() {
        // Clear any existing interval
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }

        if (this.autoRefresh) {
            // Update every 30 seconds
            this.realTimeInterval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    this.loadAndDisplayStats();
                    console.log('🔄 Auto-refreshed dashboard stats');
                }
            }, 30000);
        }
    },

    // UPDATED renderDashboard() method with activity filter
    renderDashboard() {
        if (!this.element) return;

        this.element.innerHTML = `
            <style>
                /* Activity Filter Styles */
                .activity-filter-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .filter-controls {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .time-filter-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .time-filter-btn {
                    padding: 6px 12px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .time-filter-btn:hover {
                    background: var(--hover-bg);
                    border-color: var(--primary-color);
                }

                .time-filter-btn.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .real-time-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 20px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .3s;
                    border-radius: 20px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: var(--primary-color);
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(20px);
                }

                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: var(--card-bg);
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    transition: all 0.2s ease;
                    margin-bottom: 8px;
                }

                .activity-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    border-color: var(--primary-color);
                }

                .activity-icon {
                    font-size: 20px;
                    padding: 8px;
                    background: var(--glass-bg);
                    border-radius: 10px;
                    min-width: 40px;
                    text-align: center;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 14px;
                    margin-bottom: 4px;
                }

                .activity-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .activity-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .activity-module {
                    background: var(--tag-bg);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                }

                .no-activity {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }

                .loading-activity {
                    text-align: center;
                    padding: 30px;
                    color: var(--text-secondary);
                }

                .activity-stats {
                    display: flex;
                    gap: 8px;
                    margin-top: 4px;
                }

                .stat-badge {
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 500;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .activity-item.new {
                    animation: fadeIn 0.5s ease;
                    border-left: 3px solid var(--primary-color);
                }

                /* Refresh indicator */
                .refreshing {
                    position: relative;
                }

                .refreshing::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
            </style>

            <div class="dashboard-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Welcome Section -->
                <div class="welcome-section" style="margin-bottom: 30px;">
                    <h1 style="color: var(--text-primary); font-size: 28px; margin-bottom: 8px;">Welcome to Farm Management</h1>
                    <p style="color: var(--text-secondary); font-size: 16px;">Manage your farm operations efficiently</p>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-action-grid" style="margin-bottom: 40px;">
                    <h2 style="color: var(--text-primary); font-size: 20px; margin-bottom: 20px;">Quick Actions</h2>
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 16px;
                        margin-bottom: 30px;
                    ">
                        ${this.renderQuickActions()}
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview" style="margin-bottom: 40px;">
                    <h2 style="color: var(--text-primary); font-size: 20px; margin-bottom: 20px;">Overview</h2>
                    <div class="stats-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        ${this.renderStatCards()}
                    </div>
                </div>

                <!-- Recent Activity with Filters -->
                <div class="recent-activity">
                    <div class="activity-filter-container">
                        <h2 style="color: var(--text-primary); font-size: 20px; margin: 0;">Recent Activity</h2>
                        
                        <div class="filter-controls">
                            <div class="time-filter-buttons">
                                <button class="time-filter-btn ${this.activityFilter === '24h' ? 'active' : ''}" data-filter="24h">
                                    24H
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '7d' ? 'active' : ''}" data-filter="7d">
                                    7 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '30d' ? 'active' : ''}" data-filter="30d">
                                    30 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === 'all' ? 'active' : ''}" data-filter="all">
                                    All Time
                                </button>
                            </div>
                            
                            <div class="real-time-toggle">
                                <span>Auto-refresh:</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" ${this.autoRefresh ? 'checked' : ''} id="real-time-toggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="activity-list" style="
                        background: var(--card-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 16px;
                        padding: 20px;
                        min-height: 300px;
                    ">
                        <div id="activity-content" class="loading-activity">
                            <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                                <div style="font-size: 16px; margin-bottom: 8px;">Loading activities...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <button id="refresh-stats-btn" class="btn-outline ${this.autoRefresh ? 'refreshing' : ''}" style="
                        background: var(--card-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 12px;
                        padding: 12px 24px;
                        cursor: pointer;
                        font-size: 14px;
                        color: var(--text-secondary);
                        transition: all 0.3s ease;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        🔄 Refresh Now
                    </button>
                    ${this.autoRefresh ? '<div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Auto-refresh enabled (every 30s)</div>' : ''}
                </div>
            </div>
        `;

        this.setupQuickActions();
        this.setupRefreshButton();
        this.setupActivityFilter();
        this.setupRealTimeToggle();
    },

    // NEW: Setup activity filter
    setupActivityFilter() {
        const filterButtons = document.querySelectorAll('.time-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setActivityFilter(filter);
            });
        });
    },

    // NEW: Setup real-time toggle
    setupRealTimeToggle() {
        const toggle = document.getElementById('real-time-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                this.startRealTimeUpdates();
                
                // Update UI
                const refreshBtn = document.getElementById('refresh-stats-btn');
                if (refreshBtn) {
                    if (this.autoRefresh) {
                        refreshBtn.classList.add('refreshing');
                    } else {
                        refreshBtn.classList.remove('refreshing');
                    }
                }
                
                if (window.coreModule && window.coreModule.showNotification) {
                    window.coreModule.showNotification(
                        `Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`,
                        this.autoRefresh ? 'success' : 'info'
                    );
                }
            });
        }
    },

    // NEW: Set activity filter
    setActivityFilter(filter) {
        this.activityFilter = filter;
        
        // Update active button
        document.querySelectorAll('.time-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Reload activities with new filter
        this.updateRecentActivity();
        
        console.log(`Activity filter set to: ${filter}`);
    },

    // UPDATED: Get activities with time filter
    getActivities() {
        let activities = [];
        const now = new Date();
        
        // Get activities from all modules
        const moduleActivities = this.getActivitiesFromModules();
        const recentActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];
        
        // Combine all activities
        activities = [...moduleActivities, ...recentActivities];
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp || b.date || b.time) - new Date(a.timestamp || a.date || a.time));
        
        // Apply time filter
        activities = this.filterActivitiesByTime(activities);
        
        return activities;
    },

    // NEW: Get activities from all modules
    getActivitiesFromModules() {
        const activities = [];
        
        // Check localStorage for recent activities from all modules
        const modules = ['income-expenses', 'inventory-check', 'feed-record', 'production', 'sales-record', 'orders', 'broiler-mortality'];
        
        modules.forEach(moduleName => {
            try {
                const moduleData = localStorage.getItem(`farm-${moduleName}-data`) || 
                                  localStorage.getItem(`${moduleName}-data`);
                
                if (moduleData) {
                    const data = JSON.parse(moduleData);
                    if (Array.isArray(data)) {
                        // Get recent items (last 5)
                        const recentItems = data.slice(-5).reverse();
                        
                        recentItems.forEach(item => {
                            if (item.date || item.createdAt) {
                                activities.push({
                                    id: item.id || Date.now(),
                                    timestamp: item.date || item.createdAt || new Date().toISOString(),
                                    icon: this.getModuleIcon(moduleName),
                                    title: this.getActivityTitle(moduleName, item),
                                    description: this.getActivityDescription(moduleName, item),
                                    module: moduleName,
                                    data: item
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.log(`Error getting activities from ${moduleName}:`, error);
            }
        });
        
        return activities;
    },

    // NEW: Get module icon
    getModuleIcon(moduleName) {
        const icons = {
            'income-expenses': '💰',
            'inventory-check': '📦',
            'feed-record': '🌾',
            'production': '🚜',
            'sales-record': '🛒',
            'orders': '📋',
            'broiler-mortality': '😔'
        };
        return icons[moduleName] || '📊';
    },

    // NEW: Get activity title
    getActivityTitle(moduleName, item) {
        const titles = {
            'income-expenses': item.type === 'income' ? 'Income Recorded' : 'Expense Recorded',
            'inventory-check': 'Inventory Updated',
            'feed-record': 'Feed Recorded',
            'production': 'Production Recorded',
            'sales-record': 'Sale Completed',
            'orders': item.status === 'completed' ? 'Order Completed' : 'New Order',
            'broiler-mortality': 'Mortality Recorded'
        };
        return titles[moduleName] || 'Activity';
    },

    // NEW: Get activity description
    getActivityDescription(moduleName, item) {
        switch(moduleName) {
            case 'income-expenses':
                return `${item.description || 'Transaction'} - $${parseFloat(item.amount || 0).toFixed(2)}`;
            case 'inventory-check':
                return `${item.itemName || 'Item'} - Qty: ${item.quantity || 0}`;
            case 'feed-record':
                return `${item.feedType || 'Feed'} - ${item.quantity || 0}kg`;
            case 'production':
                return `${item.product || 'Product'} - ${item.quantity || 0} units`;
            case 'sales-record':
                return `${item.customerName || 'Customer'} - $${parseFloat(item.total || 0).toFixed(2)}`;
            case 'orders':
                return `Order #${item.id || ''} - ${item.customerName || 'Customer'}`;
            case 'broiler-mortality':
                return `${item.quantity || 0} birds - ${item.cause || 'Unknown cause'}`;
            default:
                return 'New activity recorded';
        }
    },

    // NEW: Filter activities by time
    filterActivitiesByTime(activities) {
        const now = new Date();
        
        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp || activity.date || activity.time);
            
            switch(this.activityFilter) {
                case '24h':
                    return (now - activityDate) <= 24 * 60 * 60 * 1000;
                case '7d':
                    return (now - activityDate) <= 7 * 24 * 60 * 60 * 1000;
                case '30d':
                    return (now - activityDate) <= 30 * 24 * 60 * 60 * 1000;
                case 'all':
                default:
                    return true;
            }
        });
    },

    // UPDATED: Update recent activity section
    updateRecentActivity() {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = this.getActivities();
        
        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="no-activity">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px;">No activity found</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">No activities for the selected time period</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map((activity, index) => `
                    <div class="activity-item ${index < 3 ? 'new' : ''}" data-activity-id="${activity.id}">
                        <div class="activity-icon">
                            ${activity.icon}
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">${activity.title}</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                                ${activity.description}
                            </div>
                            <div class="activity-meta">
                                <div class="activity-time">
                                    <span>🕒</span>
                                    <span>${this.formatTimeAgo(activity.timestamp)}</span>
                                </div>
                                <div class="activity-module">
                                    ${this.formatModuleName(activity.module)}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers to activity items
        this.setupActivityClickHandlers();
    },

    // NEW: Setup activity click handlers
    setupActivityClickHandlers() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const activityId = item.dataset.activityId;
                this.handleActivityClick(activityId);
            });
        });
    },

    // NEW: Handle activity click
    handleActivityClick(activityId) {
        // Find the activity
        const activities = this.getActivities();
        const activity = activities.find(a => a.id == activityId);
        
        if (activity && activity.module) {
            // Navigate to the module
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(activity.module);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(activity.module);
            }
            
            // Show notification
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification(`Navigating to ${this.formatModuleName(activity.module)}`, 'info');
            }
        }
    },

    // NEW: Format module name
    formatModuleName(moduleName) {
        const names = {
            'income-expenses': 'Finance',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed',
            'production': 'Production',
            'sales-record': 'Sales',
            'orders': 'Orders',
            'broiler-mortality': 'Health'
        };
        return names[moduleName] || moduleName;
    },

    // NEW: Broadcast data change (call this from other modules when data changes)
    broadcastDataChange(moduleName, data) {
        const event = new CustomEvent('farmDataChanged', {
            detail: { 
                module: moduleName,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
        
        // Also update localStorage for cross-tab sync
        localStorage.setItem('farm-last-update', new Date().toISOString());
    },

    // Keep existing methods but update them to use new features
    loadAndDisplayStats() {
        const profileStats = this.getProfileStats();
        this.updateDashboardStats(profileStats);
        this.updateRecentActivity(); // Now uses the time filter
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

        // Add new activity with timestamp
        const newActivity = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        };

        window.FarmModules.appData.profile.dashboardStats.recentActivities.unshift(newActivity);

        // Keep only last 20 activities
        if (window.FarmModules.appData.profile.dashboardStats.recentActivities.length > 20) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = 
                window.FarmModules.appData.profile.dashboardStats.recentActivities.slice(0, 20);
        }

        // Update UI immediately
        this.updateRecentActivity();
        
        // Broadcast change
        this.broadcastDataChange('dashboard', newActivity);
    },

    // Helper methods for rendering
    renderQuickActions() {
        const actions = [
            { icon: '💰', label: 'Add Income', action: 'add-income', desc: 'Record new income' },
            { icon: '💸', label: 'Add Expense', action: 'add-expense', desc: 'Record new expense' },
            { icon: '📦', label: 'Check Inventory', action: 'check-inventory', desc: 'View stock levels' },
            { icon: '🌾', label: 'Record Feed', action: 'record-feed', desc: 'Log feed usage' },
            { icon: '🚜', label: 'Production', action: 'add-production', desc: 'Record production' },
            { icon: '📈', label: 'View Reports', action: 'view-reports', desc: 'Analytics & insights' }
        ];

        return actions.map(action => `
            <button class="quick-action-btn" data-action="${action.action}" style="
                background: var(--card-bg);
                border: 1px solid var(--glass-border);
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
                <div style="font-size: 32px;">${action.icon}</div>
                <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${action.label}</span>
                <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">${action.desc}</span>
            </button>
        `).join('');
    },

    renderStatCards() {
        const stats = [
            { id: 'total-revenue', icon: '💰', label: 'Total Revenue', value: '$0.00' },
            { id: 'total-expenses', icon: '💸', label: 'Total Expenses', value: '$0.00' },
            { id: 'inventory-items', icon: '📦', label: 'Inventory Items', value: '0' },
            { id: 'active-birds', icon: '🐔', label: 'Active Birds', value: '0' },
            { id: 'total-orders', icon: '📋', label: 'Total Orders', value: '0' },
            { id: 'net-profit', icon: '📊', label: 'Net Profit', value: '$0.00' },
            { id: 'total-customers', icon: '👥', label: 'Customers', value: '0' },
            { id: 'total-products', icon: '🛒', label: 'Products', value: '0' }
        ];

        return stats.map(stat => `
            <div class="stat-card" id="${stat.id}-card" style="
                background: var(--card-bg);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            ">
                <div style="font-size: 24px; margin-bottom: 8px;">${stat.icon}</div>
                <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="${stat.id}">${stat.value}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">${stat.label}</div>
            </div>
        `).join('');
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
// Add this to enable real-time updates from other modules
window.DashboardModule = DashboardModule;

// ==================== CORRECT REGISTRATION ====================
// Add at the BOTTOM of dashboard.js

(function() {
    console.log('📦 Registering dashboard module...');
    
    // Use the module object defined in THIS file
    const moduleName = 'dashboard.js';
    const moduleObject = DashboardModule; // NOT SalesRecordModule!
    
    if (window.FarmModules) {
        FarmModules.registerModule(moduleName, moduleObject);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
