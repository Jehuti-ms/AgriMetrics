// modules/dashboard.js - COMPLETE CSP COMPLIANT VERSION
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,
    element: null,
    activityFilter: '7d',
    realTimeInterval: null,
    autoRefresh: true,
    lastUpdateTime: null,

    // ==================== INITIALIZATION ====================
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
        // Update any theme-specific styles if needed
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        this.removeEventListeners();
        
        // Main event delegation
        this.element.addEventListener('click', this.handleElementClick.bind(this));
        this.element.addEventListener('change', this.handleElementChange.bind(this));
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        
        // Data change listeners
        this.setupDataChangeListeners();
    },

    removeEventListeners() {
        // Clone element to remove all event listeners
        if (this.element && this.element.parentNode) {
            const newElement = this.element.cloneNode(true);
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
        
        // Clear real-time interval
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
    },

    handleElementClick(event) {
        const target = event.target;
        const button = target.closest('[data-action]');
        
        if (!button) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const action = button.getAttribute('data-action');
        const filter = button.getAttribute('data-filter');
        const activityId = button.getAttribute('data-activity-id');
        
        console.log('Dashboard action:', action);
        
        switch(action) {
            case 'add-income':
            case 'add-expense':
            case 'check-inventory':
            case 'record-feed':
            case 'add-production':
            case 'view-reports':
                this.handleQuickAction(action);
                break;
                
            case 'refresh-stats':
                this.handleRefreshStats();
                break;
                
            case 'view-activity':
                this.handleActivityClick(activityId);
                break;
        }
        
        // Handle filter buttons
        if (filter) {
            this.setActivityFilter(filter);
        }
    },

    handleElementChange(event) {
        const target = event.target;
        
        if (target.id === 'real-time-toggle') {
            this.handleRealTimeToggle(target.checked);
        }
    },

    handleMouseEnter(event) {
        const button = event.target.closest('[data-action]');
        if (button) {
            if (button.classList.contains('quick-action-btn') || button.id === 'refresh-stats-btn') {
                button.style.transform = 'translateY(-4px)';
                button.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            } else if (button.classList.contains('time-filter-btn')) {
                if (!button.classList.contains('active')) {
                    button.style.background = 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
                    button.style.borderColor = 'var(--primary-color, #3b82f6)';
                }
            } else if (button.classList.contains('activity-item') || button.closest('.activity-item')) {
                const activityItem = button.closest('.activity-item');
                if (activityItem) {
                    activityItem.style.transform = 'translateY(-2px)';
                    activityItem.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                    activityItem.style.borderColor = 'var(--primary-color, #3b82f6)';
                }
            }
        }
    },

    handleMouseLeave(event) {
        const button = event.target.closest('[data-action]');
        if (button) {
            if (button.classList.contains('quick-action-btn') || button.id === 'refresh-stats-btn') {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            } else if (button.classList.contains('time-filter-btn')) {
                if (!button.classList.contains('active')) {
                    button.style.background = 'var(--card-bg, rgba(255, 255, 255, 0.9))';
                    button.style.borderColor = 'var(--border-color, #e0e0e0)';
                }
            } else if (button.classList.contains('activity-item') || button.closest('.activity-item')) {
                const activityItem = button.closest('.activity-item');
                if (activityItem) {
                    activityItem.style.transform = 'translateY(0)';
                    activityItem.style.boxShadow = 'none';
                    activityItem.style.borderColor = 'var(--border-color, #e0e0e0)';
                }
            }
        }
    },

    // ==================== DATA CHANGE LISTENERS ====================
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

    // ==================== REAL-TIME UPDATES ====================
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

    handleRealTimeToggle(enabled) {
        this.autoRefresh = enabled;
        this.startRealTimeUpdates();
        
        // Update UI
        const refreshBtn = this.element.querySelector('#refresh-stats-btn');
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
        
        // Save preference
        localStorage.setItem('dashboard-auto-refresh', this.autoRefresh.toString());
    },

    handleRefreshStats() {
        this.loadAndDisplayStats();
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Stats refreshed!', 'success');
        }
    },

    // ==================== DASHBOARD RENDERING ====================
    renderDashboard() {
        if (!this.element) return;

        // Load auto-refresh preference
        const savedAutoRefresh = localStorage.getItem('dashboard-auto-refresh');
        if (savedAutoRefresh !== null) {
            this.autoRefresh = savedAutoRefresh === 'true';
        }

        this.element.innerHTML = `
            <div class="dashboard-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Welcome Section -->
                <div class="welcome-section" style="margin-bottom: 30px;">
                    <h1 style="color: var(--text-primary, #1a1a1a); font-size: 28px; margin-bottom: 8px;">Welcome to Farm Management</h1>
                    <p style="color: var(--text-secondary, #666); font-size: 16px;">Manage your farm operations efficiently</p>
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
                    <h2 style="color: var(--text-primary, #1a1a1a); font-size: 20px; margin-bottom: 20px;">Overview</h2>
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
                    <div class="activity-filter-container" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                        gap: 16px;
                    ">
                        <h2 style="color: var(--text-primary, #1a1a1a); font-size: 20px; margin: 0;">Recent Activity</h2>
                        
                        <div class="filter-controls" style="
                            display: flex;
                            gap: 12px;
                            align-items: center;
                        ">
                            <div class="time-filter-buttons" style="
                                display: flex;
                                gap: 8px;
                                flex-wrap: wrap;
                            ">
                                <button class="time-filter-btn ${this.activityFilter === '24h' ? 'active' : ''}" 
                                        data-filter="24h"
                                        data-action="filter-activity"
                                        style="
                                            padding: 6px 12px;
                                            border: 1px solid var(--border-color, #e0e0e0);
                                            background: ${this.activityFilter === '24h' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg, rgba(255, 255, 255, 0.9))'};
                                            border-radius: 20px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            color: ${this.activityFilter === '24h' ? 'white' : 'var(--text-secondary, #666)'};
                                            cursor: pointer;
                                            transition: all 0.2s ease;
                                            border-color: ${this.activityFilter === '24h' ? 'var(--primary-color, #3b82f6)' : 'var(--border-color, #e0e0e0)'};
                                        ">
                                    24H
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '7d' ? 'active' : ''}" 
                                        data-filter="7d"
                                        data-action="filter-activity"
                                        style="
                                            padding: 6px 12px;
                                            border: 1px solid var(--border-color, #e0e0e0);
                                            background: ${this.activityFilter === '7d' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg, rgba(255, 255, 255, 0.9))'};
                                            border-radius: 20px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            color: ${this.activityFilter === '7d' ? 'white' : 'var(--text-secondary, #666)'};
                                            cursor: pointer;
                                            transition: all 0.2s ease;
                                            border-color: ${this.activityFilter === '7d' ? 'var(--primary-color, #3b82f6)' : 'var(--border-color, #e0e0e0)'};
                                        ">
                                    7 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '30d' ? 'active' : ''}" 
                                        data-filter="30d"
                                        data-action="filter-activity"
                                        style="
                                            padding: 6px 12px;
                                            border: 1px solid var(--border-color, #e0e0e0);
                                            background: ${this.activityFilter === '30d' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg, rgba(255, 255, 255, 0.9))'};
                                            border-radius: 20px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            color: ${this.activityFilter === '30d' ? 'white' : 'var(--text-secondary, #666)'};
                                            cursor: pointer;
                                            transition: all 0.2s ease;
                                            border-color: ${this.activityFilter === '30d' ? 'var(--primary-color, #3b82f6)' : 'var(--border-color, #e0e0e0)'};
                                        ">
                                    30 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === 'all' ? 'active' : ''}" 
                                        data-filter="all"
                                        data-action="filter-activity"
                                        style="
                                            padding: 6px 12px;
                                            border: 1px solid var(--border-color, #e0e0e0);
                                            background: ${this.activityFilter === 'all' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg, rgba(255, 255, 255, 0.9))'};
                                            border-radius: 20px;
                                            font-size: 13px;
                                            font-weight: 500;
                                            color: ${this.activityFilter === 'all' ? 'white' : 'var(--text-secondary, #666)'};
                                            cursor: pointer;
                                            transition: all 0.2s ease;
                                            border-color: ${this.activityFilter === 'all' ? 'var(--primary-color, #3b82f6)' : 'var(--border-color, #e0e0e0)'};
                                        ">
                                    All Time
                                </button>
                            </div>
                            
                            <div class="real-time-toggle" style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 13px;
                                color: var(--text-secondary, #666);
                            ">
                                <span>Auto-refresh:</span>
                                <label class="toggle-switch" style="
                                    position: relative;
                                    display: inline-block;
                                    width: 40px;
                                    height: 20px;
                                ">
                                    <input type="checkbox" ${this.autoRefresh ? 'checked' : ''} 
                                           id="real-time-toggle"
                                           style="opacity: 0; width: 0; height: 0;">
                                    <span class="toggle-slider" style="
                                        position: absolute;
                                        cursor: pointer;
                                        top: 0;
                                        left: 0;
                                        right: 0;
                                        bottom: 0;
                                        background-color: #ccc;
                                        transition: .3s;
                                        border-radius: 20px;
                                        ${this.autoRefresh ? 'background-color: var(--primary-color, #3b82f6);' : ''}
                                    ">
                                        <span style="
                                            position: absolute;
                                            content: '';
                                            height: 16px;
                                            width: 16px;
                                            left: 2px;
                                            bottom: 2px;
                                            background-color: white;
                                            transition: .3s;
                                            border-radius: 50%;
                                            ${this.autoRefresh ? 'transform: translateX(20px);' : ''}
                                        "></span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="activity-list" style="
                        background: var(--card-bg, rgba(255, 255, 255, 0.9));
                        border: 1px solid var(--border-color, #e0e0e0);
                        border-radius: 16px;
                        padding: 20px;
                        min-height: 300px;
                    ">
                        <div id="activity-content">
                            <div style="text-align: center; color: var(--text-secondary, #666); padding: 40px 20px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                                <div style="font-size: 16px; margin-bottom: 8px;">Loading activities...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Refresh Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <button id="refresh-stats-btn" class="${this.autoRefresh ? 'refreshing' : ''}" 
                            data-action="refresh-stats"
                            style="
                                background: var(--card-bg, rgba(255, 255, 255, 0.9));
                                border: 1px solid var(--border-color, #e0e0e0);
                                border-radius: 12px;
                                padding: 12px 24px;
                                cursor: pointer;
                                font-size: 14px;
                                color: var(--text-secondary, #666);
                                transition: all 0.3s ease;
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                position: relative;
                            ">
                        🔄 Refresh Now
                    </button>
                    ${this.autoRefresh ? '<div style="font-size: 12px; color: var(--text-secondary, #666); margin-top: 8px;">Auto-refresh enabled (every 30s)</div>' : ''}
                    ${this.lastUpdateTime ? `<div style="font-size: 11px; color: var(--text-secondary, #666); margin-top: 4px;">Last updated: ${this.formatTimeAgo(this.lastUpdateTime)}</div>` : ''}
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                
                .time-filter-btn:hover {
                    background: var(--hover-bg, rgba(0, 0, 0, 0.05)) !important;
                    border-color: var(--primary-color, #3b82f6) !important;
                }
                
                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: var(--card-bg, rgba(255, 255, 255, 0.9));
                    border-radius: 12px;
                    border: 1px solid var(--border-color, #e0e0e0);
                    transition: all 0.2s ease;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                
                .activity-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    border-color: var(--primary-color, #3b82f6);
                }
                
                .activity-item.new {
                    animation: fadeIn 0.5s ease;
                    border-left: 3px solid var(--primary-color, #3b82f6);
                }
                
                .stat-card {
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
            </style>
        `;

        this.setupEventListeners();
    },

    // ==================== ACTIVITY FILTER ====================
    setActivityFilter(filter) {
        this.activityFilter = filter;
        
        // Update active button
        const buttons = this.element.querySelectorAll('.time-filter-btn');
        buttons.forEach(btn => {
            const isActive = btn.getAttribute('data-filter') === filter;
            btn.style.background = isActive ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg, rgba(255, 255, 255, 0.9))';
            btn.style.color = isActive ? 'white' : 'var(--text-secondary, #666)';
            btn.style.borderColor = isActive ? 'var(--primary-color, #3b82f6)' : 'var(--border-color, #e0e0e0)';
        });
        
        // Reload activities with new filter
        this.updateRecentActivity();
        
        console.log(`Activity filter set to: ${filter}`);
    },

    // ==================== QUICK ACTIONS ====================
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
            // Try to navigate to the module
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(targetModule);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(targetModule);
            } else if (window.FarmModules && window.FarmModules.renderModule) {
                window.FarmModules.renderModule(targetModule);
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

    // ==================== ACTIVITY MANAGEMENT ====================
    handleActivityClick(activityId) {
        const activities = this.getActivities();
        const activity = activities.find(a => a.id == activityId);
        
        if (activity && activity.module) {
            // Navigate to the module
            if (window.FarmManagementApp) {
                window.FarmManagementApp.showSection(activity.module);
            } else if (window.app && window.app.showSection) {
                window.app.showSection(activity.module);
            } else if (window.FarmModules && window.FarmModules.renderModule) {
                window.FarmModules.renderModule(activity.module);
            }
            
            // Show notification
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification(`Navigating to ${this.formatModuleName(activity.module)}`, 'info');
            }
        }
    },

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
                            if (item.date || item.createdAt || item.timestamp) {
                                activities.push({
                                    id: item.id || Date.now(),
                                    timestamp: item.date || item.createdAt || item.timestamp || new Date().toISOString(),
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

    filterActivitiesByTime(activities) {
        const now = new Date();
        
        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp || activity.date || activity.time || now);
            
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

    updateRecentActivity() {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = this.getActivities();
        
        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="no-activity">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; color: var(--text-primary, #1a1a1a); margin-bottom: 8px;">No activity found</div>
                    <div style="font-size: 14px; color: var(--text-secondary, #666);">No activities for the selected time period</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map((activity, index) => `
                    <div class="activity-item ${index < 3 ? 'new' : ''}" 
                         data-action="view-activity" 
                         data-activity-id="${activity.id}"
                         style="
                            display: flex;
                            align-items: flex-start;
                            gap: 12px;
                            padding: 16px;
                            background: var(--card-bg, rgba(255, 255, 255, 0.9));
                            border-radius: 12px;
                            border: 1px solid var(--border-color, #e0e0e0);
                            transition: all 0.2s ease;
                            margin-bottom: 8px;
                            cursor: pointer;
                            ${index < 3 ? 'animation: fadeIn 0.5s ease; border-left: 3px solid var(--primary-color, #3b82f6);' : ''}
                         ">
                        <div class="activity-icon" style="
                            font-size: 20px;
                            padding: 8px;
                            background: var(--glass-bg, rgba(255, 255, 255, 0.8));
                            border-radius: 10px;
                            min-width: 40px;
                            text-align: center;
                        ">
                            ${activity.icon}
                        </div>
                        <div class="activity-content" style="flex: 1;">
                            <div class="activity-title" style="
                                font-weight: 600;
                                color: var(--text-primary, #1a1a1a);
                                font-size: 14px;
                                margin-bottom: 4px;
                            ">
                                ${activity.title}
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary, #666); margin-bottom: 8px;">
                                ${activity.description}
                            </div>
                            <div class="activity-meta" style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                font-size: 12px;
                                color: var(--text-secondary, #666);
                            ">
                                <div class="activity-time" style="display: flex; align-items: center; gap: 4px;">
                                    <span>🕒</span>
                                    <span>${this.formatTimeAgo(activity.timestamp)}</span>
                                </div>
                                <div class="activity-module" style="
                                    background: var(--tag-bg, rgba(59, 130, 246, 0.1));
                                    padding: 2px 8px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    color: var(--primary-color, #3b82f6);
                                ">
                                    ${this.formatModuleName(activity.module)}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

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

    // ==================== STATS MANAGEMENT ====================
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
                background: var(--card-bg, rgba(255, 255, 255, 0.9));
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            ">
                <div style="font-size: 24px; margin-bottom: 8px;">${stat.icon}</div>
                <div style="font-size: 24px; font-weight: bold; color: var(--text-primary, #1a1a1a); margin-bottom: 4px;" id="${stat.id}">${stat.value}</div>
                <div style="font-size: 14px; color: var(--text-secondary, #666);">${stat.label}</div>
            </div>
        `).join('');
    },

    loadAndDisplayStats() {
        const profileStats = this.getProfileStats();
        this.updateDashboardStats(profileStats);
        this.updateRecentActivity();
        this.lastUpdateTime = new Date().toISOString();
        
        // Update last updated time in UI
        const lastUpdatedEl = this.element.querySelector('#refresh-stats-btn')?.nextElementSibling?.nextElementSibling;
        if (lastUpdatedEl && this.lastUpdateTime) {
            lastUpdatedEl.textContent = `Last updated: ${this.formatTimeAgo(this.lastUpdateTime)}`;
        }
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
        const profitCard = document.getElementById('net-profit-card');
        if (profitCard) {
            const netProfit = stats.netProfit || (stats.totalIncome - stats.totalExpenses) || 0;
            const profitColor = netProfit >= 0 ? '#22c55e' : '#ef4444';
            profitCard.style.borderLeft = `4px solid ${profitColor}`;
        }

        // Update revenue card with monthly indicator
        const revenueCard = document.getElementById('total-revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0) {
            // Remove existing indicator if any
            const existingIndicator = revenueCard.querySelector('.monthly-indicator');
            if (existingIndicator) existingIndicator.remove();
            
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.className = 'monthly-indicator';
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
            // Add animation
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.textContent = value;
            }, 150);
        }
    },

    // ==================== BROADCAST METHODS ====================
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

    refreshStats() {
        this.loadAndDisplayStats();
    },

    // ==================== UTILITY METHODS ====================
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

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    cleanup() {
        // Stop real-time updates
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
        
        // Remove event listeners
        this.removeEventListeners();
        
        // Remove data change listeners
        document.removeEventListener('farmDataChanged', this.setupDataChangeListeners);
        window.removeEventListener('storage', this.setupDataChangeListeners);
        
        this.initialized = false;
        console.log('🔄 Dashboard module cleaned up');
    }
};

// ==================== REGISTRATION ====================
window.DashboardModule = DashboardModule;

(function() {
    console.log('📦 Registering dashboard module...');
    
    if (window.FarmModules) {
        const moduleName = DashboardModule.name || 'dashboard';
        FarmModules.registerModule(moduleName, DashboardModule);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.log('📦 Dashboard module loaded (standalone mode)');
    }
})();
