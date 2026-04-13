// modules/dashboard.js - FIXED VERSION
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,
    element: null,
    activityFilter: '7d',
    realTimeInterval: null,
    autoRefresh: true,
    lastUpdateTime: null,
    eventListeners: [],
    _eventListeners: [],

    initialize() {
        console.log('📊 Initializing Dashboard...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.initialized = true;
        this.renderDashboard();
        this.loadAndDisplayStats();
        this.startRealTimeUpdates();
        this.setupEventListeners();
        
        console.log('✅ Dashboard initialized');
        return true;
    },

    renderDashboard() {
        if (!this.element || !this.initialized) return;

        const savedAutoRefresh = localStorage.getItem('dashboard-auto-refresh');
        if (savedAutoRefresh !== null) {
            this.autoRefresh = savedAutoRefresh === 'true';
        }

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Dashboard</h1>
                    <p class="module-subtitle">Your farm at a glance</p>
                </div>

                <!-- ===== OVERVIEW HEADING ===== -->
                <h2 class="section-title">📊 Overview</h2>
                
                <!-- Stats Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-revenue">$0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💸</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-expenses">$0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="inventory-items">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Inventory Items</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="active-birds">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Active Birds</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-orders">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="net-profit">$0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Net Profit</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-customers">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Customers</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🛒</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-products">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Products</div>
                    </div>
                </div>

                <!-- ===== QUICK ACTION HEADING ===== -->
                <h2 class="section-title" style="margin-top: 24px;">⚡ Quick Actions</h2>
                
                <!-- Quick Actions Grid -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" data-action="add-sale">
                        <div style="font-size: 32px;">💰</div>
                        <span style="font-size: 14px; font-weight: 600;">Record Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Add new sale</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-expense">
                        <div style="font-size: 32px;">💸</div>
                        <span style="font-size: 14px; font-weight: 600;">Add Expense</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Record expense</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-inventory">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600;">Add Inventory</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Manage stock</span>
                    </button>
                    <button class="quick-action-btn" data-action="record-mortality">
                        <div style="font-size: 32px;">😔</div>
                        <span style="font-size: 14px; font-weight: 600;">Record Loss</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Track mortality</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-production">
                        <div style="font-size: 32px;">🚜</div>
                        <span style="font-size: 14px; font-weight: 600;">Add Production</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Record production</span>
                    </button>
                    <button class="quick-action-btn" data-action="view-reports">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600;">View Reports</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Analytics</span>
                    </button>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card" style="margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                        <h3 style="color: var(--text-primary); margin: 0;">📋 Recent Activity</h3>
                        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                            <div class="time-filter-buttons" style="display: flex; gap: 8px;">
                                <button class="time-filter-btn ${this.activityFilter === '24h' ? 'active' : ''}" data-filter="24h">24H</button>
                                <button class="time-filter-btn ${this.activityFilter === '7d' ? 'active' : ''}" data-filter="7d">7 Days</button>
                                <button class="time-filter-btn ${this.activityFilter === '30d' ? 'active' : ''}" data-filter="30d">30 Days</button>
                                <button class="time-filter-btn ${this.activityFilter === 'all' ? 'active' : ''}" data-filter="all">All Time</button>
                            </div>
                            <div class="real-time-toggle" style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 13px;">Auto-refresh:</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="real-time-toggle" ${this.autoRefresh ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <button id="refresh-stats-btn" class="btn-outline" style="padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                                <span>🔄</span> Refresh
                            </button>
                        </div>
                    </div>
                    <div id="activity-content">
                        <div class="loading-activities" style="text-align: center; padding: 40px;">
                            <div class="loading-icon">⏳</div>
                            <div class="loading-text">Loading activities...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateRecentActivity();
    },

    setupEventListeners() {
        console.log('🔧 Setting up dashboard event listeners...');
        
        // Use event delegation for all clicks
        this.element.addEventListener('click', (e) => {
            const target = e.target;
            
            // Quick action buttons
            const actionBtn = target.closest('[data-action]');
            if (actionBtn) {
                e.preventDefault();
                const action = actionBtn.getAttribute('data-action');
                console.log('🎯 Dashboard action:', action);
                this.handleQuickAction(action);
                return;
            }
            
            // Filter buttons
            const filterBtn = target.closest('.time-filter-btn');
            if (filterBtn) {
                e.preventDefault();
                const filter = filterBtn.getAttribute('data-filter');
                if (filter) {
                    this.setActivityFilter(filter);
                }
                return;
            }
            
            // Refresh button
            if (target.closest('#refresh-stats-btn')) {
                e.preventDefault();
                this.handleRefreshStats();
                return;
            }
        });
        
        // Real-time toggle
        const realTimeToggle = document.getElementById('real-time-toggle');
        if (realTimeToggle) {
            realTimeToggle.addEventListener('change', (e) => {
                this.handleRealTimeToggle(e.target.checked);
            });
        }
        
        // Listen for data updates from UnifiedDataService
        if (window.UnifiedDataService) {
            window.UnifiedDataService.on('sales-updated', () => this.updateStats());
            window.UnifiedDataService.on('transactions-updated', () => this.updateStats());
            window.UnifiedDataService.on('inventory-updated', () => this.updateStats());
            window.UnifiedDataService.on('data-saved', () => this.updateStats());
        }
        
        // Listen for custom events
        window.addEventListener('sale-completed', () => this.updateStats());
        window.addEventListener('farm-data-updated', () => this.updateStats());
        
        console.log('✅ Dashboard event listeners set up');
    },

    handleQuickAction(action) {
        console.log(`⚡ Handling quick action: ${action}`);
        
        switch(action) {
            case 'add-sale':
                if (window.SalesRecordModule && typeof window.SalesRecordModule.showSaleModal === 'function') {
                    window.SalesRecordModule.showSaleModal();
                } else if (window.app && window.app.showSection) {
                    window.app.showSection('sales-record');
                    setTimeout(() => {
                        if (window.SalesRecordModule && window.SalesRecordModule.showSaleModal) {
                            window.SalesRecordModule.showSaleModal();
                        }
                    }, 500);
                }
                break;
                
            case 'add-expense':
                if (window.app && window.app.showSection) {
                    window.app.showSection('income-expenses');
                    setTimeout(() => {
                        if (window.IncomeExpensesModule && window.IncomeExpensesModule.showAddExpense) {
                            window.IncomeExpensesModule.showAddExpense();
                        }
                    }, 500);
                }
                break;
                
            case 'add-inventory':
                if (window.app && window.app.showSection) {
                    window.app.showSection('inventory-check');
                    setTimeout(() => {
                        const addBtn = document.getElementById('add-item-btn');
                        if (addBtn) addBtn.click();
                    }, 500);
                }
                break;
                
            case 'record-mortality':
                if (window.app && window.app.showSection) {
                    window.app.showSection('broiler-mortality');
                    setTimeout(() => {
                        const recordBtn = document.getElementById('record-mortality-btn');
                        if (recordBtn) recordBtn.click();
                    }, 500);
                }
                break;
                
            case 'add-production':
                if (window.app && window.app.showSection) {
                    window.app.showSection('production');
                    setTimeout(() => {
                        const addBtn = document.getElementById('add-production-btn');
                        if (addBtn) addBtn.click();
                    }, 500);
                }
                break;
                
            case 'view-reports':
                if (window.app && window.app.showSection) {
                    window.app.showSection('reports');
                }
                break;
                
            default:
                console.log(`Unknown action: ${action}`);
        }
    },

    setActivityFilter(filter) {
        this.activityFilter = filter;
        
        // Update active button states
        const buttons = this.element.querySelectorAll('.time-filter-btn');
        buttons.forEach(btn => {
            const btnFilter = btn.getAttribute('data-filter');
            if (btnFilter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.updateRecentActivity();
        console.log(`🔍 Activity filter set to: ${filter}`);
    },

    handleRealTimeToggle(enabled) {
        this.autoRefresh = enabled;
        localStorage.setItem('dashboard-auto-refresh', enabled.toString());
        this.startRealTimeUpdates();
        this.showNotification(`Auto-refresh ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'info');
    },

    handleRefreshStats() {
        console.log('🔄 Refreshing dashboard stats...');
        
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            const originalHTML = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span>⏳</span> Syncing...';
            refreshBtn.disabled = true;
            
            setTimeout(() => {
                this.updateStats();
                refreshBtn.innerHTML = originalHTML;
                refreshBtn.disabled = false;
                this.showNotification('Dashboard refreshed!', 'success');
            }, 1000);
        } else {
            this.updateStats();
        }
    },

    startRealTimeUpdates() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }

        if (this.autoRefresh) {
            this.realTimeInterval = setInterval(() => {
                if (document.visibilityState === 'visible' && this.initialized) {
                    this.updateStats();
                    console.log('🔄 Auto-refreshed dashboard stats');
                }
            }, 30000);
        }
    },

    updateStats() {
        console.log('📊 Updating dashboard stats...');
        
        // Get data from UnifiedDataService
        let sales = [];
        let transactions = [];
        let inventory = [];
        let orders = [];
        let customers = [];
        
        if (window.UnifiedDataService) {
            sales = window.UnifiedDataService.get('sales') || [];
            transactions = window.UnifiedDataService.get('transactions') || [];
            inventory = window.UnifiedDataService.get('inventory') || [];
            orders = window.UnifiedDataService.get('orders') || [];
            customers = window.UnifiedDataService.get('customers') || [];
        }
        
        // Calculate totals
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const inventoryCount = inventory.length;
        
        // Get bird count from inventory
        let birdCount = 0;
        const birdItem = inventory.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler')
        );
        if (birdItem) birdCount = birdItem.currentStock || birdItem.quantity || 0;
        
        // Update DOM elements
        const revenueEl = document.getElementById('total-revenue');
        if (revenueEl) revenueEl.textContent = this.formatCurrency(totalRevenue);
        
        const expensesEl = document.getElementById('total-expenses');
        if (expensesEl) expensesEl.textContent = this.formatCurrency(totalExpenses);
        
        const profitEl = document.getElementById('net-profit');
        if (profitEl) profitEl.textContent = this.formatCurrency(netProfit);
        
        const inventoryEl = document.getElementById('inventory-items');
        if (inventoryEl) inventoryEl.textContent = inventoryCount;
        
        const birdsEl = document.getElementById('active-birds');
        if (birdsEl) birdsEl.textContent = birdCount;
        
        const ordersEl = document.getElementById('total-orders');
        if (ordersEl) ordersEl.textContent = orders.length;
        
        const customersEl = document.getElementById('total-customers');
        if (customersEl) customersEl.textContent = customers.length;
        
        const productsEl = document.getElementById('total-products');
        if (productsEl) {
            const uniqueProducts = new Set(sales.map(s => s.product));
            productsEl.textContent = uniqueProducts.size;
        }
        
        console.log(`✅ Dashboard updated - Revenue: ${this.formatCurrency(totalRevenue)}, Expenses: ${this.formatCurrency(totalExpenses)}`);
        
        // Update recent activity
        this.updateRecentActivity();
    },

    updateRecentActivity() {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;
        
        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; color: var(--text-primary);">No recent activity</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add sales, expenses, or inventory to see activity here</div>
                </div>
            `;
            return;
        }
        
        activityContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div class="activity-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 24px;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${activity.title}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${activity.description}</div>
                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${this.formatTimeAgo(activity.timestamp)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getRecentActivities() {
        const activities = [];
        const now = new Date();
        const filterDays = this.activityFilter === '24h' ? 1 : this.activityFilter === '7d' ? 7 : this.activityFilter === '30d' ? 30 : 365;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filterDays);
        
        // Get sales
        if (window.UnifiedDataService) {
            const sales = window.UnifiedDataService.get('sales') || [];
            sales.forEach(sale => {
                const saleDate = new Date(sale.date);
                if (saleDate >= cutoffDate) {
                    activities.push({
                        icon: '💰',
                        title: 'Sale Recorded',
                        description: `${this.formatProductName(sale.product)} - ${this.formatCurrency(sale.totalAmount)}`,
                        timestamp: sale.date
                    });
                }
            });
            
            // Get transactions (expenses)
            const transactions = window.UnifiedDataService.get('transactions') || [];
            transactions.forEach(t => {
                if (t.type === 'expense') {
                    const transDate = new Date(t.date);
                    if (transDate >= cutoffDate) {
                        activities.push({
                            icon: '💸',
                            title: 'Expense Recorded',
                            description: `${t.category || 'Expense'} - ${this.formatCurrency(t.amount)}`,
                            timestamp: t.date
                        });
                    }
                } else if (t.type === 'income') {
                    const transDate = new Date(t.date);
                    if (transDate >= cutoffDate) {
                        activities.push({
                            icon: '💰',
                            title: 'Income Recorded',
                            description: `${t.category || 'Income'} - ${this.formatCurrency(t.amount)}`,
                            timestamp: t.date
                        });
                    }
                }
            });
        }
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Return last 10 activities
        return activities.slice(0, 10);
    },

    formatProductName(product) {
        const names = {
            'broilers-dressed-bird': 'Broilers (Dressed/Bird)',
            'broilers-live': 'Broilers (Live)',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'goat': 'Goat',
            'lamb': 'Lamb'
        };
        return names[product] || product || 'Product';
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Just now';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);
        
        if (diffSeconds < 60) return 'Just now';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
        if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    },

    loadAndDisplayStats() {
        this.updateStats();
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },

    unload() {
        console.log('📦 Unloading Dashboard module...');
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
        this.initialized = false;
        this.element = null;
    }
};

// Register the module
(function() {
    const MODULE_NAME = 'dashboard';
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, DashboardModule);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    }
    window.DashboardModule = DashboardModule;
})();
