// modules/dashboard.js - COMPLETE CSP COMPLIANT VERSION
console.log('📊 Loading dashboard module...');

const DashboardModule = {
    name: 'dashboard',
    initialized: false,
    _actionInProgress: false,
    _filterInProgress: false,   
    _toggleInProgress: false,   
    _refreshInProgress: false,
    element: null,
    activityFilter: '7d',
    realTimeInterval: null,
    autoRefresh: true,
    lastUpdateTime: null,
    eventListeners: [],
    _eventListeners: [],

    // ==================== INITIALIZATION ====================
initialize() {
    console.log('📊 Initializing Dashboard...');
    
    this.element = document.getElementById('content-area');
    if (!this.element) {
        console.error('❌ Content area not found');
        return false;
    }

    // Register with StyleManager if available
    if (window.StyleManager) {
        StyleManager.registerModule(this.name, this.element, this);
    }

    // Initialize with empty state first
    this.initialized = true;

    // Check immediately if data is already there
    this.checkDataServiceReady();
    
    // Show loading state
    this.showLoadingState();
    
    // Render dashboard
    this.renderDashboard();
    
    // Load data asynchronously
    setTimeout(() => {
        this.updateStats();
        this.startRealTimeUpdates();
    }, 100);
    
   // ===== LISTEN FOR DATA SERVICE EVENTS =====
window.addEventListener('farm-data-loaded', () => {
    console.log('📡 Dashboard received farm-data-loaded event');
    this.updateStats();  // ← Changed
});

window.addEventListener('farm-data-updated', () => {
    console.log('📡 Dashboard received farm-data-updated event');
    this.updateStats();  // ← Changed
});

window.addEventListener('storage', (e) => {
    if (e.key && (e.key.includes('farm-') || e.key.includes('FarmData'))) {
        console.log('📡 Storage change detected:', e.key);
        setTimeout(() => this.updateStats(), 300);  // ← Changed
    }
});

// ===== INCREASED TIMEOUT TO 10 SECONDS =====
let attempts = 0;
const maxAttempts = 10;
const checkInterval = setInterval(() => {
    attempts++;
    
    // Check if FarmData has transactions
    if (window.FarmData && window.FarmData.transactions?.length > 0) {
        console.log(`📊 Data found after ${attempts}s, updating dashboard`);
        this.updateStats();  // ← Changed
        clearInterval(checkInterval);
    }
    // Check if any of the module data is available
    else if (window.FarmData && (
        window.FarmData.sales?.length > 0 || 
        window.FarmData.expenses?.length > 0 ||
        window.FarmData.transactions?.length > 0
    )) {
        console.log(`📊 Module data found after ${attempts}s, updating dashboard`);
        this.updateStats();  // ← Changed
        clearInterval(checkInterval);
    }
    // Also check localStorage directly as fallback
    else {
        try {
            const transactions = localStorage.getItem('farm-transactions');
            if (transactions && JSON.parse(transactions).length > 0) {
                console.log(`📊 localStorage data found after ${attempts}s`);
                this.updateStats();  // ← Changed
                clearInterval(checkInterval);
            }
        } catch (e) {}
    }
    
    // Stop after 10 seconds
    if (attempts >= maxAttempts) {
        console.log('⏱️ Data check timeout - showing whatever we have');
        this.updateStats();  // ← Changed
        clearInterval(checkInterval);
    }
}, 1000);
    
    // ===== IMMEDIATE REFRESH AFTER DATA SERVICE INIT =====
    // Check if Data Service is already initialized
    if (window.DataService && window.DataService.data) {
        setTimeout(() => this.loadAndDisplayStats(), 500);
    }
    
    this.setupGlobalListeners();
    
    console.log('✅ Dashboard initialized with real-time updates and data loading');
    return true;
},

    checkDataServiceReady() {
    if (window.DataService && window.DataService.data) {
        const data = window.DataService.data;
        if (data.transactions?.length > 0 || data.sales?.length > 0) {
            console.log('✅ Data Service already has data');
            this.updateStats(); 
            return true;
        }
    }
    return false;
},

// Add this helper method if you don't have it
showLoadingState() {
    // Optional: Show a loading spinner or message
    console.log('⏳ Dashboard waiting for data...');
},
    
 // Add this method after initialize()
setupGlobalListeners() {
    console.log('📡 Setting up global listeners for dashboard...');
    
    // Listen for events from other modules
    const events = [
        'sale-completed', 
        'expense-recorded', 
        'income-recorded',
        'production-created', 
        'inventory-updated', 
        'feed-recorded',
        'mortality-recorded', 
        'order-created', 
        'order-completed',
        'customer-added',
        'stock-updated'
    ];

    // Remove existing listeners first (to avoid duplicates)
    if (this._eventListeners) {
        this._eventListeners.forEach(({event, handler}) => {
            window.removeEventListener(event, handler);
        });
    }
    
    this._eventListeners = [];

    // ===== DATA SERVICE EVENTS (UPDATED WITH PROPER CLEANUP) =====
    const dataEvents = [
        'farm-data-loaded',
        'farm-data-updated',
        'farm-transactions-updated',
        'farm-sales-updated'
    ];
    
    dataEvents.forEach(event => {
        const handler = () => {
            console.log(`📡 Dashboard received: ${event}`);
            if (this.initialized) {
                setTimeout(() => this.updateStats(), 200);
            }
        };
        
        window.addEventListener(event, handler);
        this._eventListeners.push({event, handler}); // ← NOW PROPERLY ADDED
    });

    // Add module event listeners (using standard window events)
    events.forEach(event => {
        const handler = () => {
            console.log(`📡 Dashboard received: ${event}`);
            if (this.initialized) {
                setTimeout(() => this.updateStats(), 200);
            }
        };
        
        window.addEventListener(event, handler);
        this._eventListeners.push({event, handler});
    });

    // Listen for storage changes (for cross-tab sync)
    const storageHandler = (e) => {
        if (e.key && (e.key.includes('farm-') || e.key.includes('FarmModules'))) {
            console.log('📡 Storage change detected:', e.key);
            if (this.initialized) {
                setTimeout(() => this.updateStats(), 300);
            }
        }
    };
    
    window.addEventListener('storage', storageHandler);
    this._eventListeners.push({event: 'storage', handler: storageHandler});

    // ===== FIXED: Check DataBroadcaster API properly =====
    if (window.DataBroadcaster) {
        console.log('📡 DataBroadcaster found, type:', typeof window.DataBroadcaster);
        
        // Method 1: If it has an 'on' method
        if (typeof window.DataBroadcaster.on === 'function') {
            const broadcasterEvents = [
                'sale-completed', 'expense-recorded', 'income-recorded',
                'production-created', 'inventory-updated', 'feed-recorded',
                'mortality-recorded', 'order-created', 'order-completed'
            ];
            
            broadcasterEvents.forEach(event => {
                // Note: DataBroadcaster might need special cleanup
                window.DataBroadcaster.on(event, () => {
                    console.log(`📡 Dashboard received broadcaster: ${event}`);
                    if (this.initialized) {
                        setTimeout(() => this.updateStats(), 150);
                    }
                });
            });
        }
        // Method 2: If it has an 'addEventListener' method
        else if (typeof window.DataBroadcaster.addEventListener === 'function') {
            const broadcasterEvents = [
                'sale-completed', 'expense-recorded', 'income-recorded',
                'production-created', 'inventory-updated', 'feed-recorded',
                'mortality-recorded', 'order-created', 'order-completed'
            ];
            
            broadcasterEvents.forEach(event => {
                const handler = () => {
                    console.log(`📡 Dashboard received broadcaster: ${event}`);
                    if (this.initialized) {
                        setTimeout(() => this.updateStats(), 150);
                    }
                };
                
                window.DataBroadcaster.addEventListener(event, handler);
                // Note: Can't easily add to _eventListeners if DataBroadcaster has different cleanup
            });
        }
        // Method 3: If it has a 'subscribe' method
        else if (typeof window.DataBroadcaster.subscribe === 'function') {
            const broadcasterEvents = [
                'sale-completed', 'expense-recorded', 'income-recorded',
                'production-created', 'inventory-updated', 'feed-recorded',
                'mortality-recorded', 'order-created', 'order-completed'
            ];
            
            broadcasterEvents.forEach(event => {
                window.DataBroadcaster.subscribe(event, () => {
                    console.log(`📡 Dashboard received broadcaster: ${event}`);
                    if (this.initialized) {
                        setTimeout(() => this.updateStats(), 150);
                    }
                });
            });
        }
        else {
            console.log('📡 DataBroadcaster exists but no compatible method found');
        }
    }

    // Listen for module activations
    const moduleActivatedHandler = (e) => {
        if (e.detail && e.detail.module) {
            console.log(`📡 Module activated: ${e.detail.module}`);
            if (this.initialized) {
                setTimeout(() => this.updateStats(), 200);
            }
        }
    };
    
    document.addEventListener('moduleActivated', moduleActivatedHandler);
    this._eventListeners.push({event: 'moduleActivated', handler: moduleActivatedHandler});

    console.log(`✅ Dashboard listening to ${events.length + dataEvents.length} events`);
},

    // dashboard.js - Fix stats loading
    loadAndDisplayStats() {
    console.log('📊 Loading and displaying stats...');
    
    // Use the same logic as updateStats
    let sales = [];
    let transactions = [];
    let inventory = [];
    
    if (window.UnifiedDataService) {
        sales = window.UnifiedDataService.get('sales') || [];
        transactions = window.UnifiedDataService.get('transactions') || [];
        inventory = window.UnifiedDataService.get('inventory') || [];
        
        console.log(`📊 Data counts - Sales: ${sales.length}, Transactions: ${transactions.length}, Inventory: ${inventory.length}`);
    } else if (window.FarmData) {
        sales = window.FarmData.sales || [];
        transactions = window.FarmData.transactions || [];
        inventory = window.FarmData.inventory || [];
    }
    
    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const inventoryCount = inventory.length;
    
    // Update DOM elements
    const revenueEl = document.getElementById('total-revenue');
    if (revenueEl) revenueEl.textContent = this.formatCurrency(totalRevenue);
    
    const expensesEl = document.getElementById('total-expenses');
    if (expensesEl) expensesEl.textContent = this.formatCurrency(totalExpenses);
    
    const profitEl = document.getElementById('net-profit');
    if (profitEl) profitEl.textContent = this.formatCurrency(netProfit);
    
    const inventoryEl = document.getElementById('inventory-items');
    if (inventoryEl) inventoryEl.textContent = inventoryCount;
    
    // If we have data, don't show loading message
    if (totalRevenue > 0 || totalExpenses > 0 || inventoryCount > 0) {
        console.log(`✅ Dashboard updated - Revenue: ${this.formatCurrency(totalRevenue)}, Expenses: ${this.formatCurrency(totalExpenses)}`);
    } else {
        console.log('⚠️ Stats are empty, waiting for data...');
        // Show loading message but don't overwrite
        const statsContainer = document.querySelector('.stats-overview');
        if (statsContainer && !statsContainer.querySelector('.stat-value')?.textContent !== '0') {
            // Only show loading if truly empty
        }
    }
},
    
    showDashboardLoading() {
        const statsContainer = document.getElementById('dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>Loading your farm data...</p>
                    <small>This may take a moment</small>
                </div>
            `;
        }
    }, 
    
    onThemeChange(theme) {
        console.log(`🎨 Dashboard updating for theme: ${theme}`);
        // Apply theme-specific styles if needed
        if (this.element) {
            this.element.setAttribute('data-theme', theme);
        }
    },

    // ==================== EVENT HANDLER MANAGEMENT ====================
    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler });
    },

    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    },

    // ==================== EVENT HANDLERS ====================
  setupEventListeners() {
    console.log('📡 Setting up global listeners for dashboard...');
    
    // Clear existing listeners
    this.removeAllEventListeners();
    
    if (!this.element) return;
    
    // ===== LISTEN TO UNIFIED DATA SERVICE =====
    if (window.UnifiedDataService) {
        window.UnifiedDataService.on('sales-updated', () => this.updateStats());
        window.UnifiedDataService.on('transactions-updated', () => this.updateStats());
        window.UnifiedDataService.on('inventory-updated', () => this.updateStats());
        window.UnifiedDataService.on('production-updated', () => this.updateStats());
        window.UnifiedDataService.on('data-saved', () => this.updateStats());
        window.UnifiedDataService.on('realtime-update', () => this.updateStats());
    }
    
    // ===== LISTEN TO CUSTOM EVENTS =====
    const events = ['sale-completed', 'farm-data-updated', 'dashboard-update'];
    events.forEach(event => {
        window.addEventListener(event, () => this.updateStats());
    });
    
    // ===== SINGLE CLICK HANDLER FOR ALL BUTTONS =====
    this.element.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const actionType = actionBtn.getAttribute('data-action');
        console.log('🎯 Dashboard action:', actionType);
        
        // Handle different action types
        switch(actionType) {
            case 'add-income':
            case 'add-expense':
            case 'check-inventory':
            case 'record-feed':
            case 'add-production':
            case 'view-reports':
                this.handleQuickAction(actionType);
                break;
                
            case 'filter-activity':
                const filter = actionBtn.getAttribute('data-filter');
                if (filter) {
                    this.setActivityFilter(filter);
                }
                break;
                
            case 'refresh-stats':
                this.handleRefreshStats();
                break;
                
            case 'view-activity':
                const activityId = actionBtn.getAttribute('data-activity-id');
                if (activityId) {
                    this.handleActivityClick(activityId);
                }
                break;
        }
    });
    
    console.log('✅ Dashboard event listeners set up');
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
        
        console.log('🎯 Dashboard action:', action);
        
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
                
            case 'filter-activity':
                if (filter) {
                    this.setActivityFilter(filter);
                }
                break;
        }
    },

    handleElementChange(event) {
        const target = event.target;
        
        if (target.id === 'real-time-toggle') {
            this.handleRealTimeToggle(target.checked);
        }
    },

    // ==================== DATA CHANGE LISTENERS ====================
    setupDataChangeListeners() {
    // Listen for custom events when data changes
    const dataChangedHandler = (e) => {
        console.log('📡 Data changed detected:', e.detail?.module);
        if (this.autoRefresh && this.initialized) {
            setTimeout(() => this.updateStats(), 300);  // Changed from loadAndDisplayStats
        }
    };

    // Listen for storage changes (for cross-tab updates)
    const storageChangedHandler = (e) => {
        if (e.key && e.key.includes('farm-')) {
            console.log('💾 Storage change detected:', e.key);
            if (this.autoRefresh && this.initialized) {
                setTimeout(() => this.updateStats(), 500);  // Changed from loadAndDisplayStats
            }
        }
    };

    this.addEventListener(document, 'farmDataChanged', dataChangedHandler);
    this.addEventListener(window, 'storage', storageChangedHandler);
},
    
    // ==================== REAL-TIME UPDATES ====================
    startRealTimeUpdates() {
        // Clear any existing interval
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }

        if (this.autoRefresh) {
            // Update every 30 seconds
            this.realTimeInterval = setInterval(() => {
                if (document.visibilityState === 'visible' && this.initialized) {
                     this.updateStats();
                    console.log('🔄 Auto-refreshed dashboard stats');
                }
            }, 30000);
        }
    },

handleRealTimeToggle(enabled) {
    // Prevent multiple calls
    if (this._toggleInProgress) return;
    this._toggleInProgress = true;
    
    this.autoRefresh = enabled;
    localStorage.setItem('dashboard-auto-refresh', enabled.toString());
    this.startRealTimeUpdates();
    
    // Update UI
    const refreshBtn = this.element.querySelector('#refresh-stats-btn');
    if (refreshBtn) {
        if (enabled) {
            refreshBtn.classList.add('refreshing');
            refreshBtn.setAttribute('data-refreshing', 'true');
        } else {
            refreshBtn.classList.remove('refreshing');
            refreshBtn.removeAttribute('data-refreshing');
        }
    }
    
    // Single notification
    this.showNotification(`Auto-refresh ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'info');
    
    setTimeout(() => {
        this._toggleInProgress = false;
    }, 500);
},

handleRefreshStats() {
    if (!this.initialized) return;
    
    // Prevent multiple refreshes
    if (this._refreshInProgress) return;
    this._refreshInProgress = true;
    
    // Show syncing state
    const refreshBtn = this.element.querySelector('#refresh-stats-btn');
    const originalHTML = refreshBtn ? refreshBtn.innerHTML : '';
    if (refreshBtn) {
        refreshBtn.innerHTML = '🔄 Syncing...';
        refreshBtn.disabled = true;
    }
    
    // Refresh stats
    this.updateStats();
    
    // Reset button after delay
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            refreshBtn.classList.add('refreshing-animation');
            setTimeout(() => {
                refreshBtn.classList.remove('refreshing-animation');
            }, 1000);
        }
        // Single notification
        this.showNotification('Dashboard refreshed!', 'success');
        
        this._refreshInProgress = false;
    }, 1000);
},
    
    async syncAllModulesWithFirebase() {
    console.log('☁️ Syncing all modules with Firebase...');
    
    const syncPromises = [];
    
    // Income-Expenses module
    if (window.IncomeExpensesModule) {
        if (typeof window.IncomeExpensesModule.loadFromFirebase === 'function') {
            syncPromises.push(window.IncomeExpensesModule.loadFromFirebase());
        } else if (typeof window.IncomeExpensesModule.syncFromCloud === 'function') {
            syncPromises.push(window.IncomeExpensesModule.syncFromCloud());
        }
    }
    
    // Sales module
    if (window.SalesRecordModule) {
        if (typeof window.SalesRecordModule.loadFromFirebase === 'function') {
            syncPromises.push(window.SalesRecordModule.loadFromFirebase());
        }
    }
    
    // Orders module
    if (window.OrdersModule) {
        if (typeof window.OrdersModule.loadFromFirebase === 'function') {
            syncPromises.push(window.OrdersModule.loadFromFirebase());
        }
    }
    
    // Production module
    if (window.ProductionModule) {
        if (typeof window.ProductionModule.loadFromFirebase === 'function') {
            syncPromises.push(window.ProductionModule.loadFromFirebase());
        }
    }
    
    // Inventory module
    if (window.InventoryModule) {
        if (typeof window.InventoryModule.loadFromFirebase === 'function') {
            syncPromises.push(window.InventoryModule.loadFromFirebase());
        }
    }
    
    // Feed module
    if (window.FeedModule) {
        if (typeof window.FeedModule.loadFromFirebase === 'function') {
            syncPromises.push(window.FeedModule.loadFromFirebase());
        }
    }
    
    // Broiler Mortality module
    if (window.BroilerMortalityModule) {
        if (typeof window.BroilerMortalityModule.loadFromFirebase === 'function') {
            syncPromises.push(window.BroilerMortalityModule.loadFromFirebase());
        }
    }
    
    // Wait for all modules to sync
    await Promise.all(syncPromises);
    
    console.log(`✅ Synced ${syncPromises.length} modules with Firebase`);
    
    // Update last sync time
    this.lastSyncTime = new Date().toISOString();
    localStorage.setItem('dashboard-last-sync', this.lastSyncTime);
    
    return syncPromises.length;
},

    // ==================== DASHBOARD RENDERING ====================
    renderDashboard() {
        if (!this.element || !this.initialized) return;

        // Load auto-refresh preference
        const savedAutoRefresh = localStorage.getItem('dashboard-auto-refresh');
        if (savedAutoRefresh !== null) {
            this.autoRefresh = savedAutoRefresh === 'true';
        }

        this.element.innerHTML = `
            <div class="dashboard-container">
                <!-- Welcome Section -->
                <div class="welcome-section">
                    <h1>Welcome to Farm Management</h1>
                    <p>Manage your farm operations efficiently</p>
                </div>

                               
                <!-- Stats Overview -->
                <div class="stats-overview">
                
                    <!-- Overview Heading -->
                <h2 class="section-title">📊 Overview</h2>

                    <div class="stats-grid">
                        <div class="stat-card" id="total-revenue-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value" id="total-revenue">$0.00</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                        <div class="stat-card" id="total-expenses-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-value" id="total-expenses">$0.00</div>
                            <div class="stat-label">Total Expenses</div>
                        </div>
                        <div class="stat-card" id="inventory-items-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-value" id="inventory-items">0</div>
                            <div class="stat-label">Inventory Items</div>
                        </div>
                        <div class="stat-card" id="active-birds-card">
                            <div class="stat-icon">🐔</div>
                            <div class="stat-value" id="active-birds">0</div>
                            <div class="stat-label">Active Birds</div>
                        </div>
                        <div class="stat-card" id="total-orders-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-orders">0</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card" id="net-profit-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value" id="net-profit">$0.00</div>
                            <div class="stat-label">Net Profit</div>
                        </div>
                        <div class="stat-card" id="total-customers-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value" id="total-customers">0</div>
                            <div class="stat-label">Customers</div>
                        </div>
                        <div class="stat-card" id="total-products-card">
                            <div class="stat-icon">🛒</div>
                            <div class="stat-value" id="total-products">0</div>
                            <div class="stat-label">Products</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-actions">
                
                   <!-- Quick Actions Heading -->
                    <h2 class="section-title" style="margin-top: 24px;">⚡ Quick Actions</h2>

                    <div class="actions-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div class="action-icon">💰</div>
                            <span class="action-title">Add Income</span>
                            <span class="action-desc">Record new income</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-expense">
                            <div class="action-icon">💸</div>
                            <span class="action-title">Add Expense</span>
                            <span class="action-desc">Record new expense</span>
                        </button>

                        <button class="quick-action-btn" data-action="check-inventory">
                            <div class="action-icon">📦</div>
                            <span class="action-title">Check Inventory</span>
                            <span class="action-desc">View stock levels</span>
                        </button>

                        <button class="quick-action-btn" data-action="record-feed">
                            <div class="action-icon">🌾</div>
                            <span class="action-title">Record Feed</span>
                            <span class="action-desc">Log feed usage</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-production">
                            <div class="action-icon">🚜</div>
                            <span class="action-title">Production</span>
                            <span class="action-desc">Record production</span>
                        </button>

                        <button class="quick-action-btn" data-action="view-reports">
                            <div class="action-icon">📈</div>
                            <span class="action-title">View Reports</span>
                            <span class="action-desc">Analytics & insights</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity with Filters -->
                <div class="recent-activity">
                    <div class="activity-filter-container">
                        <h2>Recent Activity</h2>
                        
                        <div class="filter-controls">
                            <div class="time-filter-buttons">
                                <button class="time-filter-btn ${this.activityFilter === '24h' ? 'active' : ''}" 
                                        data-action="filter-activity"
                                        data-filter="24h">
                                    24H
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '7d' ? 'active' : ''}" 
                                        data-action="filter-activity"
                                        data-filter="7d">
                                    7 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === '30d' ? 'active' : ''}" 
                                        data-action="filter-activity"
                                        data-filter="30d">
                                    30 Days
                                </button>
                                <button class="time-filter-btn ${this.activityFilter === 'all' ? 'active' : ''}" 
                                        data-action="filter-activity"
                                        data-filter="all">
                                    All Time
                                </button>
                            </div>
                            
                            <div class="real-time-toggle">
                                <span>Auto-refresh:</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" ${this.autoRefresh ? 'checked' : ''} 
                                           id="real-time-toggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="activity-list">
                        <div id="activity-content">
                            <div class="loading-activities">
                                <div class="loading-icon">⏳</div>
                                <div class="loading-text">Loading activities...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- In renderDashboard(), update the refresh section -->
            <div class="refresh-section">
                <button id="refresh-stats-btn" 
                        data-action="refresh-stats"
                        class="${this.autoRefresh ? 'refreshing' : ''}">
                    🔄 Refresh & Sync
                </button>
                ${this.autoRefresh ? '<div class="auto-refresh-status">Auto-refresh enabled (every 30s)</div>' : ''}
                ${this.lastUpdateTime ? `<div class="last-updated">Last updated: ${this.formatTimeAgo(this.lastUpdateTime)}</div>` : ''}
                <div class="last-sync-time"></div>
            </div>
        `;

        this.setupEventListeners();
        this.updateRecentActivity();
    },

    // ==================== ACTIVITY FILTER ====================
   setActivityFilter(filter) {
    // Prevent multiple calls
    if (this._filterInProgress) return;
    this._filterInProgress = true;
    
    this.activityFilter = filter;
    
    // Update active button states
    const buttons = this.element.querySelectorAll('.time-filter-btn');
    buttons.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        const isActive = btnFilter === filter;
        
        if (isActive) {
            btn.classList.add('active');
            btn.setAttribute('data-active', 'true');
        } else {
            btn.classList.remove('active');
            btn.removeAttribute('data-active');
        }
    });
    
    // Reload activities with new filter
    this.updateRecentActivity();
    
    // Single notification
    const filterNames = {
        '24h': 'last 24 hours',
        '7d': 'last 7 days',
        '30d': 'last 30 days',
        'all': 'all time'
    };
    this.showNotification(`Showing activities from ${filterNames[filter] || filter}`, 'info');
    
    setTimeout(() => {
        this._filterInProgress = false;
    }, 500);
    
    console.log(`🔍 Activity filter set to: ${filter}`);
},
    
    // ==================== QUICK ACTIONS ====================
  handleQuickAction(action) {
    console.log(`⚡ Quick action: ${action}`);
    
    // Prevent multiple clicks
    if (this._actionInProgress) return;
    this._actionInProgress = true;
    
    switch(action) {
        case 'add-income':
        case 'add-expense':
            if (window.app && window.app.showSection) {
                window.app.showSection('income-expenses');
                this.showNotification('Opening Income & Expenses...', 'info');
            }
            break;
            
        case 'check-inventory':
            if (window.app && window.app.showSection) {
                window.app.showSection('inventory-check');
                this.showNotification('Opening Inventory...', 'info');
            }
            break;
            
        case 'record-feed':
            if (window.app && window.app.showSection) {
                window.app.showSection('feed-record');
                this.showNotification('Opening Feed Records...', 'info');
            }
            break;
            
        case 'add-production':
            if (window.app && window.app.showSection) {
                window.app.showSection('production');
                this.showNotification('Opening Production...', 'info');
            }
            break;
            
        case 'view-reports':
            if (window.app && window.app.showSection) {
                window.app.showSection('reports');
                this.showNotification('Opening Reports...', 'info');
            }
            break;
            
        default:
            console.log(`Unknown action: ${action}`);
    }
    
    // Reset after 500ms
    setTimeout(() => {
        this._actionInProgress = false;
    }, 500);
},
    
    navigateToModule(moduleName) {
    console.log(`🔍 Navigating to module: ${moduleName}`);
    
    // Try different navigation methods
    if (window.app && typeof window.app.showSection === 'function') {
        window.app.showSection(moduleName);
    } else if (window.FarmManagementApp && typeof window.FarmManagementApp.showSection === 'function') {
        window.FarmManagementApp.showSection(moduleName);
    } else if (window.FarmModules && typeof window.FarmModules.renderModule === 'function') {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            window.FarmModules.renderModule(moduleName, contentArea);
        }
    } else {
        // Fallback: try to find and click the nav item
        const navItem = document.querySelector(`.nav-item[data-view="${moduleName}"]`);
        if (navItem) {
            navItem.click();
        } else {
            console.error(`Cannot navigate to ${moduleName}`);
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
        if (!activityId) return;
        
        const activities = this.getActivities();
        const activity = activities.find(a => a.id == activityId);
        
        if (activity && activity.module) {
            if (window.app && window.app.showSection) {
                window.app.showSection(activity.module);
                this.showNotification(`Navigating to ${this.formatModuleName(activity.module)}`, 'info');
            }
        }
    },

    getActivities() {
        let activities = [];
        
        // Get activities from all modules
        const moduleActivities = this.getActivitiesFromModules();
        const sharedActivities = window.FarmModules?.appData?.profile?.dashboardStats?.recentActivities || [];
        
        // Combine all activities
        activities = [...moduleActivities, ...sharedActivities];
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.date || a.time || 0);
            const timeB = new Date(b.timestamp || b.date || b.time || 0);
            return timeB - timeA;
        });
        
        // Apply time filter
        activities = this.filterActivitiesByTime(activities);
        
        // Limit to 20 activities
        return activities.slice(0, 20);
    },

getActivitiesFromModules() {
        const activities = [];
        const now = new Date();
        
        // Get sales from UnifiedDataService
        if (window.UnifiedDataService) {
            const sales = window.UnifiedDataService.get('sales') || [];
            sales.slice(-10).reverse().forEach((sale, index) => {
                if (sale.date) {
                    activities.push({
                        id: sale.id || `act-sales-${Date.now()}-${index}`,
                        timestamp: sale.date,
                        icon: '💰',
                        title: 'Sale Completed',
                        description: `${sale.customer || 'Customer'} - ${this.formatCurrency(sale.totalAmount || 0)}`,
                        module: 'sales-record',
                        data: sale
                    });
                }
            });
            
            // Get transactions from UnifiedDataService
            const transactions = window.UnifiedDataService.get('transactions') || [];
            transactions.slice(-10).reverse().forEach((t, index) => {
                if (t.date) {
                    activities.push({
                        id: t.id || `act-trans-${Date.now()}-${index}`,
                        timestamp: t.date,
                        icon: t.type === 'income' ? '💰' : '💸',
                        title: t.type === 'income' ? 'Income Recorded' : 'Expense Recorded',
                        description: `${t.description || t.category || 'Transaction'} - ${this.formatCurrency(t.amount || 0)}`,
                        module: 'income-expenses',
                        data: t
                    });
                }
            });
        }
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return activities;
    },
    
    async syncWithFirebase() {
    console.log('🔄 Syncing dashboard with Firebase...');
    
    // Refresh all modules that have Firebase data
    if (window.IncomeExpensesModule && window.IncomeExpensesModule.loadFromFirebase) {
        await window.IncomeExpensesModule.loadFromFirebase();
    }
    
    if (window.SalesRecordModule && window.SalesRecordModule.loadFromFirebase) {
        await window.SalesRecordModule.loadFromFirebase();
    }
    
    if (window.OrdersModule && window.OrdersModule.loadFromFirebase) {
        await window.OrdersModule.loadFromFirebase();
    }
    
    if (window.ProductionModule && window.ProductionModule.loadFromFirebase) {
        await window.ProductionModule.loadFromFirebase();
    }
    
    // Reload dashboard stats
    this.loadAndDisplayStats();
    
    console.log('✅ Dashboard synced with Firebase');
},

    getModuleIcon(moduleName) {
        const icons = {
            'income-expenses': '💰',
            'inventory-check': '📦',
            'feed-record': '🌾',
            'production': '🚜',
            'sales-record': '🛒',
            'orders': '📋',
            'broiler-mortality': '😔',
            'default': '📊'
        };
        return icons[moduleName] || icons.default;
    },

    getActivityTitle(moduleName, item) {
        const titles = {
            'income-expenses': item.type === 'income' ? 'Income Recorded' : 'Expense Recorded',
            'inventory-check': 'Inventory Updated',
            'feed-record': 'Feed Recorded',
            'production': 'Production Recorded',
            'sales-record': 'Sale Completed',
            'orders': item.status === 'completed' ? 'Order Completed' : 'New Order',
            'broiler-mortality': 'Mortality Recorded',
            'default': 'Activity Recorded'
        };
        return titles[moduleName] || titles.default;
    },

    getActivityDescription(moduleName, item) {
        const descriptions = {
            'income-expenses': `${item.description || 'Transaction'} - $${parseFloat(item.amount || 0).toFixed(2)}`,
            'inventory-check': `${item.itemName || 'Item'} - Qty: ${item.quantity || 0}`,
            'feed-record': `${item.feedType || 'Feed'} - ${item.quantity || 0}kg`,
            'production': `${item.product || 'Product'} - ${item.quantity || 0} units`,
            'sales-record': `${item.customerName || 'Customer'} - $${parseFloat(item.total || 0).toFixed(2)}`,
            'orders': `Order #${item.id || item.orderId || ''} - ${item.customerName || 'Customer'}`,
            'broiler-mortality': `${item.quantity || 0} birds - ${item.cause || 'Unknown cause'}`,
            'default': 'New activity recorded'
        };
        return descriptions[moduleName] || descriptions.default;
    },

     filterActivitiesByTime(activities) {
        const now = new Date();
        
        return activities.filter(activity => {
            try {
                const activityDate = new Date(activity.timestamp || activity.date || activity.time || now);
                const timeDiff = now - activityDate;
                const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                
                switch(this.activityFilter) {
                    case '24h':
                        return timeDiff <= 24 * 60 * 60 * 1000;
                    case '7d':
                        return daysDiff <= 7;
                    case '30d':
                        return daysDiff <= 30;
                    case 'all':
                    default:
                        return true;
                }
            } catch (e) {
                return false;
            }
        });
    },

    updateRecentActivity() {
        const activityContent = document.getElementById('activity-content');
        if (!activityContent) return;

        const activities = this.getActivities();
        const filteredActivities = this.filterActivitiesByTime(activities);
        
        if (filteredActivities.length === 0) {
            activityContent.innerHTML = `
                <div class="no-activity">
                    <div class="no-activity-icon">📊</div>
                    <div class="no-activity-title">No activity found</div>
                    <div class="no-activity-desc">No activities for the selected time period</div>
                </div>
            `;
            return;
        }

        activityContent.innerHTML = `
            <div class="activity-items-container">
                ${filteredActivities.map((activity, index) => `
                    <div class="activity-item ${index < 3 ? 'new-activity' : ''}" 
                         data-action="view-activity" 
                         data-activity-id="${activity.id}">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-meta">
                                <div class="activity-time">
                                    <span class="time-icon">🕒</span>
                                    <span class="time-text">${this.formatTimeAgo(activity.timestamp)}</span>
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
    },
    
    formatModuleName(moduleName) {
        const names = {
            'income-expenses': 'Finance',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed',
            'production': 'Production',
            'sales-record': 'Sales',
            'orders': 'Orders',
            'broiler-mortality': 'Health',
            'default': 'General'
        };
        return names[moduleName] || names.default;
    },

    // ==================== STATS MANAGEMENT ====================
   loadAndDisplayStats() {
    // Redirect to updateStats - this prevents the "Stats are empty" message
    console.log('📊 loadAndDisplayStats redirected to updateStats');
    this.updateStats();
},

    // Add this method to your DashboardModule (around line 300-400 area)

updateStats() {
    console.log('📊 Updating dashboard stats...');
    
    // Get fresh data from UnifiedDataService
    let sales = [];
    let transactions = [];
    let inventory = [];
    
    if (window.UnifiedDataService) {
        sales = window.UnifiedDataService.get('sales') || [];
        transactions = window.UnifiedDataService.get('transactions') || [];
        inventory = window.UnifiedDataService.get('inventory') || [];
        
        console.log(`📊 Data counts - Sales: ${sales.length}, Transactions: ${transactions.length}, Inventory: ${inventory.length}`);
    }
    
    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const inventoryCount = inventory.length;
    
    // Get bird count
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
    
    console.log(`✅ Dashboard updated - Revenue: ${this.formatCurrency(totalRevenue)}, Expenses: ${this.formatCurrency(totalExpenses)}`);
},
    
updateDashboardStats(totalRevenue, totalExpenses, netProfit, inventoryCount, lowStockItems) {
    // Helper method to update the stat cards
    const statMappings = [
        { id: 'total-revenue', value: this.formatCurrency(totalRevenue) },
        { id: 'total-expenses', value: this.formatCurrency(totalExpenses) },
        { id: 'net-profit', value: this.formatCurrency(netProfit) },
        { id: 'inventory-items', value: inventoryCount },
        { id: 'low-stock-items', value: lowStockItems }
    ];
    
    statMappings.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
            element.classList.add('stat-updated');
            setTimeout(() => element.classList.remove('stat-updated'), 500);
        }
    });
},
    
updateLastSyncTime() {
    const lastSync = localStorage.getItem('dashboard-last-sync');
    if (!lastSync) return;
    
    const lastSyncEl = this.element?.querySelector('.last-sync-time');
    if (lastSyncEl) {
        lastSyncEl.textContent = `Last cloud sync: ${this.formatTimeAgo(lastSync)}`;
    }
},

 getProfileStats() {
    // Use FarmData if available (from Data Service)
    if (window.FarmData) {
        const data = window.FarmData;
        
        // Calculate from transactions
        const income = data.transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = data.transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        // Get bird count from inventory or broiler module
        let totalBirds = 0;
        
        // Try to get from inventory
        const birdItem = data.inventory.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler') ||
            item.category?.toLowerCase().includes('poultry')
        );
        
        if (birdItem) {
            totalBirds = birdItem.quantity || 0;
        }
        
        // Try from mortality module if available
        if (window.BroilerMortalityModule && window.BroilerMortalityModule.getCurrentStock) {
            totalBirds = window.BroilerMortalityModule.getCurrentStock() || totalBirds;
        }
        
        return {
            totalRevenue: income,
            totalExpenses: expenses,
            netProfit: income - expenses,
            totalInventoryItems: data.inventory.length,
            totalBirds: this.getBirdCount(data),
            totalOrders: data.orders?.length || 0,
            totalCustomers: data.customers?.length || 0,
            totalProducts: data.sales.length,
            monthlyRevenue: this.getMonthlyRevenue(data.sales),
            completedOrders: data.orders?.filter(o => o.status === 'completed').length || 0
        };
    }
    
    // Fallback to old method if FarmData not available
    return this.calculateStatsFromLocalStorage();
},

    getMonthlyRevenue(sales) {
    if (!sales || sales.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return sales
        .filter(s => new Date(s.date || s.createdAt || 0) > thirtyDaysAgo)
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
},

    getBirdCount(data) {
    if (!data) return 0;
    
    // Try from inventory
    const birdItem = data.inventory.find(item => 
        item.name?.toLowerCase().includes('bird') || 
        item.name?.toLowerCase().includes('broiler') ||
        item.category?.toLowerCase().includes('poultry')
    );
    
    if (birdItem) {
        return birdItem.quantity || 0;
    }
    
    // Try from mortality module
    if (window.BroilerMortalityModule) {
        if (typeof window.BroilerMortalityModule.getCurrentStock === 'function') {
            return window.BroilerMortalityModule.getCurrentStock();
        }
    }
    
    return 0;
},
    
    calculateStatsFromStorage(targetStats) {
        // Calculate from income-expenses module
        try {
            const incomeData = localStorage.getItem('farm-income-expenses-data');
            if (incomeData) {
                const items = JSON.parse(incomeData);
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        const amount = parseFloat(item.amount) || 0;
                        if (item.type === 'income') {
                            targetStats.totalIncome += amount;
                            targetStats.totalRevenue += amount;
                        } else if (item.type === 'expense') {
                            targetStats.totalExpenses += amount;
                        }
                    });
                }
            }
        } catch (e) {
            console.log('⚠️ Error calculating income/expense stats:', e);
        }

        // Calculate net profit
        targetStats.netProfit = targetStats.totalIncome - targetStats.totalExpenses;
        
        // Save calculated stats
        localStorage.setItem('farm-dashboard-calculated-stats', JSON.stringify(targetStats));
    },

    updateDashboardDisplay(stats) {
        // Update all stat cards
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
            const profitColor = netProfit >= 0 ? 'var(--profit-color, #22c55e)' : 'var(--loss-color, #ef4444)';
            profitCard.style.borderLeft = `4px solid ${profitColor}`;
        }

        // Add monthly indicator to revenue card
        const revenueCard = document.getElementById('total-revenue-card');
        if (revenueCard && stats.monthlyRevenue > 0) {
            let indicator = revenueCard.querySelector('.monthly-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'monthly-indicator';
                revenueCard.appendChild(indicator);
            }
            indicator.textContent = `+${this.formatCurrency(stats.monthlyRevenue)} this month`;
        }
    },

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            element.classList.add('stat-updated');
            setTimeout(() => {
                element.classList.remove('stat-updated');
            }, 500);
        }
    },

    updateLastUpdatedTime() {
        const lastUpdatedEl = this.element?.querySelector('.last-updated');
        if (lastUpdatedEl && this.lastUpdateTime) {
            lastUpdatedEl.textContent = `Last updated: ${this.formatTimeAgo(this.lastUpdateTime)}`;
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
        
        // Update sync timestamp
        localStorage.setItem('farm-last-sync', new Date().toISOString());
    },

    addRecentActivity(activity) {
        if (!window.FarmModules || !window.FarmModules.appData) {
            // Store in localStorage as fallback
            const activities = JSON.parse(localStorage.getItem('farm-recent-activities') || '[]');
            activities.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...activity
            });
            
            // Keep only last 20
            if (activities.length > 20) activities.length = 20;
            localStorage.setItem('farm-recent-activities', JSON.stringify(activities));
            return;
        }

        // Use shared data structure
        if (!window.FarmModules.appData.profile) {
            window.FarmModules.appData.profile = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats) {
            window.FarmModules.appData.profile.dashboardStats = {};
        }
        if (!window.FarmModules.appData.profile.dashboardStats.recentActivities) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities = [];
        }

        // Add new activity
        const newActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...activity
        };

        window.FarmModules.appData.profile.dashboardStats.recentActivities.unshift(newActivity);
        
        // Keep only last 20
        if (window.FarmModules.appData.profile.dashboardStats.recentActivities.length > 20) {
            window.FarmModules.appData.profile.dashboardStats.recentActivities.length = 20;
        }

        // Update UI
        this.updateRecentActivity();
        this.broadcastDataChange('dashboard', newActivity);
    },

    refreshStats() {
        this.updateStats();
    },

    // ==================== NOTIFICATION SYSTEM ====================
   showNotification(message, type = 'info') {
    // Remove any existing notification to prevent stacking
    const existingNotifications = document.querySelectorAll('.dashboard-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Use core module notification if available
    if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
        window.coreModule.showNotification(message, type);
        return;
    }
    
    // Fallback: create simple notification
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `dashboard-notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
},
    
    // ==================== UTILITY METHODS ====================
    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        
        try {
            const now = new Date();
            const time = new Date(timestamp);
            const diffInSeconds = Math.floor((now - time) / 1000);
            
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
            return `${Math.floor(diffInSeconds / 604800)}w ago`;
        } catch (e) {
            return 'Recently';
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    cleanup() {
        console.log('🧹 Cleaning up dashboard module...');
        
        // Stop real-time updates
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
        
        // Remove event listeners
        this.removeAllEventListeners();
        
        // Reset state
        this.initialized = false;
        this.element = null;
        
        console.log('✅ Dashboard module cleaned up');
    },

  // Update your unload method to clean up listeners
unload() {
    console.log('📦 Unloading Dashboard module...');
    
    // Clean up any intervals
    if (this.realTimeInterval) {
        clearInterval(this.realTimeInterval);
        this.realTimeInterval = null;
    }
    
    // Remove event listeners
    if (this._eventListeners) {
        this._eventListeners.forEach(({event, handler}) => {
            window.removeEventListener(event, handler);
        });
        this._eventListeners = [];
    }
    
    // Reset state
    this.initialized = false;
    this.element = null;
    
    console.log('✅ Dashboard module unloaded');
}
    
};

// ==================== STYLES ====================
const dashboardStyles = `
    .dashboard-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .welcome-section {
        margin-bottom: 30px;
    }

    .welcome-section h1 {
        color: var(--text-primary, #1a1a1a);
        font-size: 28px;
        margin-bottom: 8px;
    }

    .welcome-section p {
        color: var(--text-secondary, #666);
        font-size: 16px;
    }

    .quick-actions {
        margin-bottom: 40px;
    }

    .quick-actions h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
    }

    .quick-action-btn {
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
        border: none;
        outline: none;
    }

    .quick-action-btn:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
        font-size: 32px;
    }

    .action-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
    }

    .action-desc {
        font-size: 12px;
        color: var(--text-secondary, #666);
        text-align: center;
    }

    .stats-overview {
        margin-bottom: 40px;
    }

    .stats-overview h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }

    .stat-card {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
        font-size: 24px;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 14px;
        color: var(--text-secondary, #666);
    }

    .stat-updated {
        animation: pulse 0.5s ease;
    }

    .recent-activity {
        margin-bottom: 30px;
    }

    .activity-filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
    }

    .activity-filter-container h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin: 0;
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
        border: 1px solid var(--border-color, #e0e0e0);
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary, #666);
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        outline: none;
    }

    .time-filter-btn.active {
        background: var(--primary-color, #3b82f6);
        color: white;
        border-color: var(--primary-color, #3b82f6);
    }

    .time-filter-btn:hover:not(.active) {
        background: var(--hover-bg, rgba(0, 0, 0, 0.05));
        border-color: var(--primary-color, #3b82f6);
    }

    .real-time-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-secondary, #666);
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
        background-color: var(--primary-color, #3b82f6);
    }

    input:checked + .toggle-slider:before {
        transform: translateX(20px);
    }

    .activity-list {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 16px;
        padding: 20px;
        min-height: 300px;
    }

    .loading-activities {
        text-align: center;
        color: var(--text-secondary, #666);
        padding: 40px 20px;
    }

    .loading-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .loading-text {
        font-size: 16px;
    }

    .no-activity {
        text-align: center;
        padding: 40px 20px;
    }

    .no-activity-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .no-activity-title {
        font-size: 16px;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 8px;
    }

    .no-activity-desc {
        font-size: 14px;
        color: var(--text-secondary, #666);
    }

    .activity-items-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        cursor: pointer;
    }

    .activity-item.new-activity {
        animation: fadeIn 0.5s ease;
        border-left: 3px solid var(--primary-color, #3b82f6);
    }

    .activity-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        border-color: var(--primary-color, #3b82f6);
    }

    .activity-icon {
        font-size: 20px;
        padding: 8px;
        background: var(--glass-bg, rgba(255, 255, 255, 0.8));
        border-radius: 10px;
        min-width: 40px;
        text-align: center;
    }

    .activity-content {
        flex: 1;
        min-width: 0;
    }

    .activity-title {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
        margin-bottom: 4px;
    }

    .activity-description {
        font-size: 13px;
        color: var(--text-secondary, #666);
        margin-bottom: 8px;
    }

    .activity-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text-secondary, #666);
    }

    .activity-time {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .time-icon {
        font-size: 11px;
    }

    .activity-module {
        background: var(--tag-bg, rgba(59, 130, 246, 0.1));
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        color: var(--primary-color, #3b82f6);
    }

    .refresh-section {
        text-align: center;
        margin-top: 30px;
    }

    #refresh-stats-btn {
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
        border: none;
        outline: none;
    }

    #refresh-stats-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

    .refreshing-animation {
        animation: rotate 1s linear infinite;
    }

    .auto-refresh-status {
        font-size: 12px;
        color: var(--text-secondary, #666);
        margin-top: 8px;
    }

    .last-updated {
        font-size: 11px;
        color: var(--text-secondary, #666);
        margin-top: 4px;
    }

    .monthly-indicator {
        font-size: 12px;
        color: #22c55e;
        margin-top: 4px;
    }

    /* Animations */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        50% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

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

/* The switch container */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
}

/* Hide the default checkbox */
.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
}

/* The slider pill - force it to fill completely */
.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1 !important;
    transition: 0.3s;
    border-radius: 24px !important;
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
}

/* The slider dot/knob */
.toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    top: 2px;
    background-color: white !important;
    transition: 0.3s;
    border-radius: 50% !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    z-index: 2;
}

/* When checked - ENTIRE pill turns green */
input:checked + .toggle-slider {
    background-color: #22c55e !important;
}

/* Move the dot to the right when checked */
input:checked + .toggle-slider:before {
    transform: translateX(22px);
}

/* Make sure the pill background is solid */
.toggle-switch {
    background: transparent !important;
}

.toggle-slider {
    background-clip: border-box !important;
}

`;

// ==================== REGISTRATION ====================
window.DashboardModule = DashboardModule;

(function() {
    console.log('📦 Registering dashboard module...');
    
    // Add styles to document
    if (!document.querySelector('#dashboard-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'dashboard-styles';
        styleElement.textContent = dashboardStyles;
        document.head.appendChild(styleElement);
    }
    
    // Register module
    if (window.FarmModules) {
        const moduleName = DashboardModule.name || 'dashboard';
        FarmModules.registerModule(moduleName, DashboardModule);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.log('📦 Dashboard module loaded (standalone mode)');
    }
})();
