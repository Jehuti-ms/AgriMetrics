// modules/profile.js - COMPLETE WITH ALL IMPLEMENTATIONS + DATA BROADCASTER
console.log('👤 Loading profile module with Data Broadcaster...');

// DATA BROADCASTER INTEGRATION
const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {},
    subscribe: () => {}
};

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    currentInputValues: {},
    broadcastSubscriptions: [],

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('👤 Initializing profile with Data Broadcaster...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            this.registerWithStyleManager();
        }
        
        // SETUP BROADCASTER SUBSCRIPTIONS
        this.setupBroadcasterSubscriptions();
        
        this.renderModule();
        this.initialized = true;
        
        // Broadcast profile load
        Broadcaster.recordCreated('profile', {
            action: 'profile_loaded',
            userId: this.getCurrentUserId(),
            timestamp: new Date().toISOString(),
            module: 'profile'
        });
        
        // Sync with other modules for stats
        this.syncWithOtherModules();
        
        return true;
    },

    onThemeChange(theme) {
        console.log(`Profile module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    // ==================== DATA BROADCASTER METHODS ====================
    setupBroadcasterSubscriptions() {
        // Listen for profile-related broadcasts
        Broadcaster.subscribe('profile', (event) => {
            this.handleBroadcastEvent(event);
        });
        
        // Listen for broadcasts from other modules
        Broadcaster.subscribe('all', (event) => {
            this.handleExternalBroadcast(event);
        });
    },

    handleBroadcastEvent(event) {
        console.log('📡 Profile received broadcast:', event);
        
        switch(event.action) {
            case 'profile_updated':
                this.refreshProfileData(event.data);
                break;
                
            case 'theme_changed':
                this.updateThemeDisplay(event.theme);
                break;
                
            case 'currency_changed':
                this.updateCurrencyDisplay(event.currency);
                break;
                
            case 'user_status_changed':
                this.updateUserStatus(event.status);
                break;
                
            case 'data_synced':
                this.updateSyncStatus('✅ Synced');
                break;
                
            case 'data_sync_failed':
                this.updateSyncStatus('❌ Sync failed');
                break;
                
            case 'settings_changed':
                this.updateSettingsFromBroadcast(event.settings);
                break;
        }
    },

    handleExternalBroadcast(event) {
        // Handle broadcasts from other modules
        switch(event.module) {
            case 'income-expenses':
                if (event.action === 'transaction_created' || 
                    event.action === 'transaction_updated' ||
                    event.action === 'transaction_deleted') {
                    this.updateStatsFromModules();
                }
                break;
                
            case 'inventory':
                if (event.action.includes('inventory')) {
                    this.updateStatsFromModules();
                }
                break;
                
            case 'orders':
                if (event.action.includes('order')) {
                    this.updateStatsFromModules();
                }
                break;
                
            case 'customers':
                if (event.action.includes('customer')) {
                    this.updateStatsFromModules();
                }
                break;
        }
    },

    broadcastProfileUpdate(oldData, newData, changedFields = []) {
        Broadcaster.recordUpdated('profile', {
            id: 'user_profile',
            oldData: oldData,
            newData: newData,
            timestamp: new Date().toISOString(),
            action: 'profile_updated',
            module: 'profile',
            changedFields: changedFields,
            userId: this.getCurrentUserId()
        });
    },

    broadcastSettingChange(setting, oldValue, newValue) {
        Broadcaster.recordUpdated('profile', {
            action: 'setting_changed',
            setting: setting,
            oldValue: oldValue,
            newValue: newValue,
            timestamp: new Date().toISOString(),
            module: 'profile',
            userId: this.getCurrentUserId()
        });
        
        // Special broadcasts for important settings
        if (setting === 'theme') {
            Broadcaster.recordCreated('profile', {
                action: 'theme_changed',
                theme: newValue,
                timestamp: new Date().toISOString(),
                module: 'profile',
                userId: this.getCurrentUserId()
            });
        }
        
        if (setting === 'currency') {
            Broadcaster.recordCreated('profile', {
                action: 'currency_changed',
                currency: newValue,
                timestamp: new Date().toISOString(),
                module: 'profile',
                userId: this.getCurrentUserId()
            });
        }
    },

    broadcastDataAction(action, data = {}) {
        Broadcaster.recordCreated('profile', {
            action: action,
            timestamp: new Date().toISOString(),
            module: 'profile',
            userId: this.getCurrentUserId(),
            ...data
        });
    },

    broadcastDataDeleted(action, data = {}) {
        Broadcaster.recordDeleted('profile', {
            action: action,
            timestamp: new Date().toISOString(),
            module: 'profile',
            userId: this.getCurrentUserId(),
            ...data
        });
    },

    // ==================== STYLEMANAGER INTEGRATION ====================
    registerWithStyleManager() {
        if (window.StyleManager && window.StyleManager.registerModule) {
            window.StyleManager.registerModule(this.name, this.element, {
                onThemeChange: (theme) => this.onThemeChange(theme),
                onStyleUpdate: () => this.ensureFormStyles()
            });
        }
    },

    ensureFormStyles() {
        const formInputs = this.element?.querySelectorAll('input, select, textarea');
        formInputs?.forEach(input => {
            if (!input.classList.contains('form-input') && !input.classList.contains('setting-control')) {
                if (input.type !== 'checkbox' && input.type !== 'radio') {
                    input.classList.add('form-input');
                }
            }
        });
    },

    // ==================== SYNC WITH OTHER MODULES ====================
    syncWithOtherModules() {
        if (window.FarmModules) {
            window.addEventListener('farm-data-updated', () => {
                this.updateAllDisplays();
            });
            
            // Sync with inventory module specifically
            if (window.InventoryCheckModule) {
                setInterval(() => {
                    this.syncInventoryStats();
                }, 5000);
            }
        }
    },

    syncInventoryStats() {
        if (window.InventoryCheckModule && typeof window.InventoryCheckModule.calculateStats === 'function') {
            const stats = window.InventoryCheckModule.calculateStats();
            if (stats && window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats.totalInventoryItems = stats.totalItems;
                window.FarmModules.appData.profile.dashboardStats.lowStockItems = stats.lowStockItems;
                window.FarmModules.appData.profile.dashboardStats.outOfStockItems = stats.outOfStockItems;
                window.FarmModules.appData.profile.dashboardStats.inventoryValue = stats.totalValue;
            }
        }
        
        // Sync orders stats
        if (window.FarmModules.appData.orders) {
            const orders = window.FarmModules.appData.orders;
            window.FarmModules.appData.profile.dashboardStats.totalOrders = orders.length;
            window.FarmModules.appData.profile.dashboardStats.totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        }
        
        // Sync customers stats
        if (window.FarmModules.appData.customers) {
            window.FarmModules.appData.profile.dashboardStats.totalCustomers = window.FarmModules.appData.customers.length;
        }
    },

    updateStatsFromModules() {
        const stats = window.FarmModules.appData.profile.dashboardStats || {};
        this.syncInventoryStats();
        window.FarmModules.appData.profile.dashboardStats = stats;
        
        // Broadcast stats update
        this.broadcastDataAction('stats_updated', { stats: stats });
    },

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Profile</h1>
                    <p class="module-subtitle">Manage your farm information and settings</p>
                    <div class="broadcast-status" style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                        <span id="broadcast-indicator">📡</span>
                        <span id="broadcast-status">Connected to Data Broadcaster</span>
                    </div>
                </div>

                <div class="profile-content">
                    <!-- Farm Stats Overview -->
                    <div class="stats-overview">
                        <div class="stat-card glass-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-content">
                                <h3>Total Revenue</h3>
                                <div class="stat-value" id="total-revenue">$0</div>
                                <div class="stat-update" id="revenue-update" style="font-size: 12px; color: var(--text-secondary);">Live updates</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-content">
                                <h3>Inventory Items</h3>
                                <div class="stat-value" id="total-inventory">0</div>
                                <div class="stat-update" id="inventory-update" style="font-size: 12px; color: var(--text-secondary);">Live updates</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-content">
                                <h3>Total Orders</h3>
                                <div class="stat-value" id="total-orders">0</div>
                                <div class="stat-update" id="orders-update" style="font-size: 12px; color: var(--text-secondary);">Live updates</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-content">
                                <h3>Customers</h3>
                                <div class="stat-value" id="total-customers">0</div>
                                <div class="stat-update" id="customers-update" style="font-size: 12px; color: var(--text-secondary);">Live updates</div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-card glass-card">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <span class="avatar-icon">🚜</span>
                            </div>
                            <div class="profile-info">
                                <h2 id="profile-farm-name">My Farm</h2>
                                <p id="profile-farmer-name">Farm Manager</p>
                                <p class="profile-email" id="profile-email">Loading...</p>
                                <div class="profile-stats">
                                    <span class="stat-badge" id="member-since">Member since: Today</span>
                                    <span class="stat-badge" id="data-entries">Data entries: 0</span>
                                    <span class="stat-badge" id="sync-status">🔄 Syncing...</span>
                                    <span class="stat-badge" id="broadcast-badge" style="background: var(--primary-color); color: white;">📡 Live</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-details glass-card">
                        <h3>Farm Information</h3>
                        <form id="profile-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-name" class="form-label">Farm Name</label>
                                    <input type="text" id="farm-name" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="farmer-name" class="form-label">Farmer Name</label>
                                    <input type="text" id="farmer-name" class="form-input" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-type" class="form-label">Farm Type</label>
                                    <select id="farm-type" class="form-input">
                                        <option value="">Select farm type</option>
                                        <option value="crop">Crop Farm</option>
                                        <option value="livestock">Livestock Farm</option>
                                        <option value="dairy">Dairy Farm</option>
                                        <option value="poultry">Poultry Farm</option>
                                        <option value="mixed">Mixed Farming</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="farm-location" class="form-label">Farm Location</label>
                                    <input type="text" id="farm-location" class="form-input" placeholder="e.g., City, State">
                                </div>
                            </div>
                            
                            <!-- REMEMBER USER SETTING -->
                            <div class="form-group">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Remember Me</h4>
                                        <p>Keep me logged in on this device</p>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" id="remember-user" checked>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">💾 Save Profile</button>
                                <button type="button" class="btn-secondary" id="sync-now-btn">🔄 Sync Now</button>
                                <button type="button" class="btn-outline" id="reset-profile">Reset to Current</button>
                            </div>
                        </form>
                    </div>

                    <div class="settings-section glass-card">
                        <h3>Application Settings</h3>
                        <div class="settings-list">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Default Currency</h4>
                                    <p>Set your preferred currency</p>
                                </div>
                                <select id="default-currency" class="setting-control">
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="GBP">British Pound (£)</option>
                                    <option value="BBD">Barbadian Dollar (BBD$)</option>
                                    <option value="CAD">Canadian Dollar (C$)</option>
                                    <option value="AUD">Australian Dollar (A$)</option>
                                    <option value="JMD">Jamaican Dollar (J$)</option>
                                    <option value="TTD">Trinidad & Tobago Dollar (TT$)</option>
                                    <option value="XCD">East Caribbean Dollar (EC$)</option>
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Low Stock Threshold</h4>
                                    <p>Set when to receive low inventory alerts</p>
                                </div>
                                <input type="number" id="low-stock-threshold" class="setting-control" min="1" max="100" value="10">
                                <span class="setting-unit">items</span>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Auto-sync to Cloud</h4>
                                    <p>Automatically sync data to Firebase</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="auto-sync" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                    
                            <!-- DATA PERSISTENCE SETTINGS -->
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Local Data Storage</h4>
                                    <p>Store data locally in your browser</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="local-storage" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                    
                            <!-- THEME SETTINGS -->
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Theme</h4>
                                    <p>Choose your preferred theme</p>
                                </div>
                                <select id="theme-selector" class="setting-control">
                                    <option value="auto">Auto (System)</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="nature">Nature</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="data-management glass-card">
                        <h3>Data Management</h3>
                        <div class="data-stats">
                            <div class="data-stat">
                                <label>Orders:</label>
                                <span id="orders-count">0 records</span>
                            </div>
                            <div class="data-stat">
                                <label>Inventory:</label>
                                <span id="inventory-count">0 items</span>
                            </div>
                            <div class="data-stat">
                                <label>Customers:</label>
                                <span id="customers-count">0 customers</span>
                            </div>
                            <div class="data-stat">
                                <label>Products:</label>
                                <span id="products-count">0 products</span>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-outline" id="export-data">📥 Export All Data</button>
                            <button class="btn-outline" id="import-data">📤 Import Data</button>
                            <button class="btn-primary" id="clear-all-data" style="background: var(--gradient-danger);">⚠️ Clear All Data</button>
                            <button class="btn-outline" id="logout-btn" style="color: #ef4444; border-color: #ef4444;">🚪 Logout</button>
                        </div>
                    </div>

                    <!-- BACKUP & RESTORE SECTION -->
                    <div class="backup-section glass-card">
                        <h3>Backup & Restore</h3>
                        <div class="backup-actions">
                            <button class="btn-outline" id="create-backup">💾 Create Backup</button>
                            <button class="btn-outline" id="restore-backup">🔄 Restore Backup</button>
                            <button class="btn-outline" id="view-backups">📋 View Backups</button>
                        </div>
                        <div id="backup-list" class="backup-list">
                            <!-- Backup list will be populated here -->
                        </div>
                    </div>

                    <!-- BROADCAST LOG SECTION (DEBUG) -->
                    <div class="broadcast-log glass-card" style="margin-top: 24px; display: none;" id="broadcast-log-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3>📡 Data Broadcaster Log</h3>
                            <button class="btn-outline" id="toggle-broadcast-log">Show/Hide</button>
                        </div>
                        <div id="broadcast-log-content" style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; background: var(--glass-bg); padding: 12px; border-radius: 8px;">
                            <!-- Broadcast log will appear here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadUserData();
        this.setupEventListeners();
        this.updateAllDisplays();
        this.loadBackupList();
        
        // RESTORE USER INPUT AFTER RENDER
        this.restoreUserInput();
        
        // Ensure form styles are applied
        this.ensureFormStyles();
        
        // Start broadcast log (for debugging)
        this.startBroadcastLog();
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        // Profile form
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateProfileForm()) {
                this.saveProfile();
            }
        });

        // Sync now button
        document.getElementById('sync-now-btn')?.addEventListener('click', () => {
            this.syncNow();
        });

        // Reset button
        document.getElementById('reset-profile')?.addEventListener('click', () => {
            this.updateAllDisplays();
            this.showNotification('Profile form reset to current values', 'info');
        });

        // Settings changes
        document.getElementById('default-currency')?.addEventListener('change', (e) => {
            this.saveUserInput('default-currency', e.target.value);
            this.saveSetting('currency', e.target.value);
        });

        document.getElementById('low-stock-threshold')?.addEventListener('change', (e) => {
            this.saveUserInput('low-stock-threshold', e.target.value);
            this.saveSetting('lowStockThreshold', parseInt(e.target.value));
        });

        document.getElementById('auto-sync')?.addEventListener('change', (e) => {
            this.saveUserInput('auto-sync', e.target.checked);
            this.saveSetting('autoSync', e.target.checked);
        });

        // Theme selector
        document.getElementById('theme-selector')?.addEventListener('change', (e) => {
            this.saveUserInput('theme-selector', e.target.value);
            this.changeTheme(e.target.value);
        });

        // REMEMBER USER FUNCTIONALITY
        document.getElementById('remember-user')?.addEventListener('change', (e) => {
            this.saveUserInput('remember-user', e.target.checked);
            this.saveSetting('rememberUser', e.target.checked);
            this.updateUserPersistence();
        });

        // Local storage setting
        document.getElementById('local-storage')?.addEventListener('change', (e) => {
            this.saveUserInput('local-storage', e.target.checked);
            this.saveSetting('localStorageEnabled', e.target.checked);
            if (!e.target.checked) {
                this.showNotification('Local storage disabled. Data will only be saved to cloud.', 'warning');
            }
        });

        // TRACK INPUT CHANGES IN REAL-TIME
        document.getElementById('farm-name')?.addEventListener('input', (e) => {
            this.saveUserInput('farm-name', e.target.value);
        });

        document.getElementById('farmer-name')?.addEventListener('input', (e) => {
            this.saveUserInput('farmer-name', e.target.value);
        });

        document.getElementById('farm-type')?.addEventListener('change', (e) => {
            this.saveUserInput('farm-type', e.target.value);
        });

        document.getElementById('farm-location')?.addEventListener('input', (e) => {
            this.saveUserInput('farm-location', e.target.value);
        });

        // Data management
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data')?.addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            this.clearAllData();
        });

        // Backup & Restore
        document.getElementById('create-backup')?.addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('restore-backup')?.addEventListener('click', () => {
            this.restoreBackup();
        });

        document.getElementById('view-backups')?.addEventListener('click', () => {
            this.viewBackups();
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Broadcast log toggle
        document.getElementById('toggle-broadcast-log')?.addEventListener('click', () => {
            this.toggleBroadcastLog();
        });
    },

    // ==================== BROADCAST LOG METHODS ====================
    startBroadcastLog() {
        // Log broadcasts for debugging
        const logContent = document.getElementById('broadcast-log-content');
        if (!logContent) return;

        // Add existing broadcast handler to also log
        const originalHandleBroadcast = this.handleBroadcastEvent;
        this.handleBroadcastEvent = (event) => {
            this.logBroadcast(event);
            return originalHandleBroadcast.call(this, event);
        };
    },

    logBroadcast(event) {
        const logContent = document.getElementById('broadcast-log-content');
        if (!logContent) return;

        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `
            <div style="padding: 4px 0; border-bottom: 1px solid var(--glass-border);">
                <span style="color: #666;">[${time}]</span>
                <span style="color: var(--primary-color); margin: 0 8px;">${event.module || 'unknown'}</span>
                <span style="color: var(--text-primary);">${event.action || 'unknown'}</span>
                ${event.changedFields ? `<span style="color: #888; margin-left: 8px;">(${event.changedFields.join(', ')})</span>` : ''}
            </div>
        `;
        
        logContent.prepend(logEntry);
        
        // Keep only last 20 entries
        const entries = logContent.children;
        if (entries.length > 20) {
            logContent.removeChild(entries[entries.length - 1]);
        }
    },

    toggleBroadcastLog() {
        const logSection = document.getElementById('broadcast-log-section');
        if (logSection) {
            logSection.style.display = logSection.style.display === 'none' ? 'block' : 'none';
        }
    },

    // ==================== FORM VALIDATION ====================
    validateProfileForm() {
        const farmName = this.getValue('farm-name');
        const farmerName = this.getValue('farmer-name');
        
        if (!farmName || !farmName.trim()) {
            this.showNotification('Farm name is required', 'error');
            document.getElementById('farm-name')?.focus();
            return false;
        }
        
        if (!farmerName || !farmerName.trim()) {
            this.showNotification('Farmer name is required', 'error');
            document.getElementById('farmer-name')?.focus();
            return false;
        }
        
        if (farmName.length < 2) {
            this.showNotification('Farm name must be at least 2 characters', 'error');
            document.getElementById('farm-name')?.focus();
            return false;
        }
        
        if (farmerName.length < 2) {
            this.showNotification('Farmer name must be at least 2 characters', 'error');
            document.getElementById('farmer-name')?.focus();
            return false;
        }
        
        return true;
    },

    // ==================== USER INPUT MANAGEMENT ====================
    saveUserInput(elementId, value) {
        this.currentInputValues[elementId] = value;
    },

    restoreUserInput() {
        Object.keys(this.currentInputValues).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.currentInputValues[elementId];
                } else {
                    element.value = this.currentInputValues[elementId];
                }
            }
        });
    },

    // ==================== USER DATA MANAGEMENT ====================
    async loadUserData() {
        try {
            const currentUser = this.getCurrentUser();
            
            // Initialize profile data structure
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {
                    farmName: window.FarmModules.appData.farmName || 'My Farm',
                    farmerName: currentUser?.displayName || 'Farm Manager',
                    email: currentUser?.email || 'No email',
                    farmType: 'poultry',
                    farmLocation: '',
                    currency: 'USD',
                    lowStockThreshold: 10,
                    autoSync: true,
                    rememberUser: true,
                    localStorageEnabled: true,
                    theme: 'auto',
                    memberSince: new Date().toISOString(),
                    lastSync: null,
                    userId: currentUser?.uid
                };
            }

            // Initialize dashboard stats
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }

            // Try to load from Firebase
            await this.loadFromFirebase();
            
            // Update user persistence
            this.updateUserPersistence();
            
            // Broadcast profile loaded
            this.broadcastDataAction('profile_data_loaded', {
                farmName: window.FarmModules.appData.profile.farmName,
                hasFirebase: !!this.getCurrentUser()
            });
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.handleFirebaseError(error);
        }
    },

    // ==================== USER PERSISTENCE ====================
    updateUserPersistence() {
        const rememberUser = window.FarmModules.appData.profile?.rememberUser !== false;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const persistence = rememberUser 
                ? firebase.auth.Auth.Persistence.LOCAL
                : firebase.auth.Auth.Persistence.SESSION;
            
            firebase.auth().setPersistence(persistence)
                .then(() => {
                    console.log('User persistence set to:', rememberUser ? 'LOCAL' : 'SESSION');
                    this.broadcastDataAction('user_persistence_updated', { persistence: rememberUser ? 'local' : 'session' });
                })
                .catch((error) => {
                    console.error('Error setting auth persistence:', error);
                    this.handleFirebaseError(error);
                });
        }
    },

    // ==================== THEME MANAGEMENT ====================
    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.applyTheme(theme);
            this.saveSetting('theme', theme);
            this.showNotification(`Theme changed to ${theme}`, 'success');
        }
    },

    updateThemeDisplay(theme) {
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector && themeSelector.value !== theme) {
            themeSelector.value = theme;
            this.saveUserInput('theme-selector', theme);
        }
    },

    updateCurrencyDisplay(currency) {
        const currencySelector = document.getElementById('default-currency');
        if (currencySelector && currencySelector.value !== currency) {
            currencySelector.value = currency;
            this.saveUserInput('default-currency', currency);
        }
    },

    // ==================== PROFILE MANAGEMENT ====================
    async saveProfile() {
        try {
            const oldProfile = JSON.parse(JSON.stringify(window.FarmModules.appData.profile));
            const profile = window.FarmModules.appData.profile;
            
            // Use current input values or fall back to saved values
            profile.farmName = this.currentInputValues['farm-name'] || this.getValue('farm-name') || profile.farmName;
            profile.farmerName = this.currentInputValues['farmer-name'] || this.getValue('farmer-name') || profile.farmerName;
            profile.farmType = this.currentInputValues['farm-type'] || this.getValue('farm-type') || profile.farmType;
            profile.farmLocation = this.currentInputValues['farm-location'] || this.getValue('farm-location') || profile.farmLocation;
            profile.rememberUser = this.currentInputValues['remember-user'] !== undefined ? this.currentInputValues['remember-user'] : this.getChecked('remember-user');
            profile.localStorageEnabled = this.currentInputValues['local-storage'] !== undefined ? this.currentInputValues['local-storage'] : this.getChecked('local-storage');

            window.FarmModules.appData.farmName = profile.farmName;

            // Update user persistence settings
            this.updateUserPersistence();

            // Auto-save to Firebase if enabled
            if (profile.autoSync) {
                await this.saveToFirebase();
            }

            // Save to local storage if enabled
            if (profile.localStorageEnabled) {
                this.saveToLocalStorage();
            }

            // BROADCAST PROFILE UPDATE
            const changedFields = this.getChangedFields(oldProfile, profile);
            this.broadcastProfileUpdate(oldProfile, profile, changedFields);
            
            this.updateAllDisplays();
            this.showNotification('Profile saved successfully!', 'success');
            
            // Clear current input values after successful save
            this.currentInputValues = {};
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    },

    getChangedFields(oldData, newData) {
        const changedFields = [];
        for (const key in oldData) {
            if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                changedFields.push(key);
            }
        }
        return changedFields;
    },

    refreshProfileData(data) {
        // Called when profile is updated via broadcast
        if (data && data.farmName) {
            window.FarmModules.appData.profile = {
                ...window.FarmModules.appData.profile,
                ...data
            };
            this.updateAllDisplays();
            this.showNotification('Profile updated from another tab', 'info');
        }
    },

    // ==================== SETTINGS MANAGEMENT ====================
    async saveSetting(setting, value) {
        try {
            const oldValue = window.FarmModules.appData.profile[setting];
            window.FarmModules.appData.profile[setting] = value;
            
            // BROADCAST SETTING CHANGE
            this.broadcastSettingChange(setting, oldValue, value);
            
            // Auto-save to Firebase if enabled
            if (window.FarmModules.appData.profile.autoSync) {
                await this.saveToFirebase();
            }
            
            // Save to local storage
            this.saveToLocalStorage();
            
            this.showNotification('Setting updated', 'info');
        } catch (error) {
            console.error('Error saving setting:', error);
            this.showNotification('Error saving setting', 'error');
        }
    },

    updateSettingsFromBroadcast(settings) {
        // Update settings from broadcast
        if (settings) {
            window.FarmModules.appData.profile = {
                ...window.FarmModules.appData.profile,
                ...settings
            };
            this.updateSettings();
        }
    },

    // ==================== SYNC METHODS ====================
    async syncNow() {
        this.updateSyncStatus('🔄 Syncing...');
        
        // BROADCAST SYNC START
        this.broadcastDataAction('sync_started');
        
        try {
            const profile = window.FarmModules.appData.profile;
            let cloudSuccess = false;
            let localSuccess = false;

            // Sync to Firebase if auto-sync enabled
            if (profile.autoSync) {
                cloudSuccess = await this.saveToFirebase();
            }

            // Sync to local storage if enabled
            if (profile.localStorageEnabled) {
                this.saveToLocalStorage();
                localSuccess = true;
            }

            if (cloudSuccess) {
                // BROADCAST SYNC SUCCESS
                this.broadcastDataAction('data_synced', { destination: 'firebase' });
                this.showNotification('Data synced with cloud and local storage!', 'success');
                this.updateSyncStatus('✅ Synced');
            } else if (localSuccess) {
                this.showNotification('Data saved to local storage!', 'success');
                this.updateSyncStatus('💾 Local');
            } else {
                // BROADCAST SYNC FAILURE
                this.broadcastDataAction('data_sync_failed', { error: 'Unknown error' });
                this.showNotification('Sync failed. Data not saved.', 'error');
                this.updateSyncStatus('❌ Failed');
            }
        } catch (error) {
            // BROADCAST SYNC FAILURE
            this.broadcastDataAction('data_sync_failed', { error: error.message });
            console.error('Sync error:', error);
            this.showNotification('Sync failed', 'error');
            this.updateSyncStatus('❌ Failed');
        }
    },

    // ==================== BACKUP & RESTORE ====================
    createBackup() {
        try {
            const backupData = {
                appData: window.FarmModules.appData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                exportDate: new Date().toLocaleString()
            };
            
            const backupStr = JSON.stringify(backupData, null, 2);
            const backupBlob = new Blob([backupStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(backupBlob);
            link.download = `farm-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            
            // BROADCAST BACKUP CREATED
            this.broadcastDataAction('backup_created', {
                timestamp: backupData.timestamp,
                size: backupStr.length
            });
            
            this.showNotification('Backup created successfully!', 'success');
        } catch (error) {
            console.error('Backup creation error:', error);
            this.showNotification('Error creating backup', 'error');
        }
    },

    async restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // Validate backup file
                    if (!backupData.appData || !backupData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    if (confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
                        // BROADCAST BACKUP RESTORE START
                        this.broadcastDataAction('backup_restore_started', {
                            timestamp: backupData.timestamp
                        });
                        
                        const oldData = JSON.parse(JSON.stringify(window.FarmModules.appData));
                        window.FarmModules.appData = backupData.appData;
                        
                        // BROADCAST DATA REPLACED
                        this.broadcastDataDeleted('all_data_replaced', {
                            oldData: oldData,
                            newData: window.FarmModules.appData
                        });
                        
                        this.showNotification('Backup restored successfully!', 'success');
                        this.updateAllDisplays();
                        
                        // Save restored data
                        this.saveToLocalStorage();
                        if (window.FarmModules.appData.profile.autoSync) {
                            this.saveToFirebase();
                        }
                        
                        // Trigger data update event for other modules
                        window.dispatchEvent(new CustomEvent('farm-data-updated'));
                    }
                } catch (error) {
                    console.error('Backup restore error:', error);
                    this.showNotification('Error restoring backup: Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    loadBackupList() {
        try {
            const backupList = document.getElementById('backup-list');
            if (backupList) {
                const backups = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('farm-backup-')) {
                        try {
                            const backup = JSON.parse(localStorage.getItem(key));
                            backups.push({
                                key: key,
                                timestamp: backup.timestamp,
                                date: new Date(backup.timestamp).toLocaleString()
                            });
                        } catch (e) {
                            console.warn('Invalid backup in storage:', key);
                        }
                    }
                }
                
                if (backups.length > 0) {
                    backupList.innerHTML = `
                        <div style="margin-top: 1rem;">
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Local Backups</h4>
                            ${backups.map(backup => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--glass-bg); border-radius: 8px; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${backup.date}</span>
                                    <button class="btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="ProfileModule.restoreLocalBackup('${backup.key}')">
                                        Restore
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    backupList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No local backups found</p>';
                }
            }
        } catch (error) {
            console.error('Error loading backup list:', error);
        }
    },

    restoreLocalBackup(backupKey) {
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            if (backupData && confirm('Restore this backup? Current data will be replaced.')) {
                // BROADCAST LOCAL BACKUP RESTORE
                this.broadcastDataAction('local_backup_restored', {
                    backupKey: backupKey,
                    timestamp: backupData.timestamp
                });
                
                window.FarmModules.appData = backupData.appData;
                this.showNotification('Backup restored successfully!', 'success');
                this.updateAllDisplays();
                window.dispatchEvent(new CustomEvent('farm-data-updated'));
            }
        } catch (error) {
            console.error('Error restoring local backup:', error);
            this.showNotification('Error restoring backup', 'error');
        }
    },

    viewBackups() {
        this.loadBackupList();
        this.showNotification('Backup list refreshed', 'info');
    },

    // ==================== DATA MANAGEMENT ====================
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    this.mergeImportedData(importData);
                } catch (error) {
                    this.showNotification('Error importing data: Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    mergeImportedData(importData) {
        try {
            // BROADCAST IMPORT START
            this.broadcastDataAction('data_import_started');
            
            let importedCount = 0;
            
            if (importData.orders && Array.isArray(importData.orders)) {
                window.FarmModules.appData.orders = [...window.FarmModules.appData.orders, ...importData.orders];
                importedCount += importData.orders.length;
            }
            
            if (importData.inventory && Array.isArray(importData.inventory)) {
                window.FarmModules.appData.inventory = [...window.FarmModules.appData.inventory, ...importData.inventory];
                importedCount += importData.inventory.length;
            }
            
            if (importData.customers && Array.isArray(importData.customers)) {
                window.FarmModules.appData.customers = [...window.FarmModules.appData.customers, ...importData.customers];
                importedCount += importData.customers.length;
            }
            
            if (importData.products && Array.isArray(importData.products)) {
                window.FarmModules.appData.products = [...window.FarmModules.appData.products, ...importData.products];
                importedCount += importData.products.length;
            }
            
            // BROADCAST IMPORT COMPLETE
            this.broadcastDataAction('data_imported', { itemsImported: importedCount });
            
            this.showNotification(`Successfully imported ${importedCount} items!`, 'success');
            this.updateAllDisplays();
            window.dispatchEvent(new CustomEvent('farm-data-updated'));
            
            // Auto-save imported data
            this.saveToLocalStorage();
            if (window.FarmModules.appData.profile.autoSync) {
                this.saveToFirebase();
            }
            
        } catch (error) {
            console.error('Error merging imported data:', error);
            this.showNotification('Error importing data', 'error');
        }
    },

    exportData() {
        try {
            const exportData = {
                appData: window.FarmModules.appData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                exportDate: new Date().toLocaleString(),
                summary: {
                    orders: window.FarmModules.appData.orders?.length || 0,
                    inventory: window.FarmModules.appData.inventory?.length || 0,
                    customers: window.FarmModules.appData.customers?.length || 0,
                    products: window.FarmModules.appData.products?.length || 0
                }
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `farm-data-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            
            // BROADCAST DATA EXPORT
            this.broadcastDataAction('data_exported', { 
                summary: exportData.summary,
                size: dataStr.length 
            });
            
            this.showNotification('All farm data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting data', 'error');
        }
    },

    clearAllData() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including orders, inventory, and customers. This cannot be undone!')) {
            if (confirm('THIS IS YOUR LAST WARNING! All data will be permanently deleted!')) {
                try {
                    // BROADCAST DATA CLEARANCE START
                    this.broadcastDataAction('data_clearance_started');
                    
                    const oldData = JSON.parse(JSON.stringify(window.FarmModules.appData));
                    
                    window.FarmModules.appData.orders = [];
                    window.FarmModules.appData.inventory = [];
                    window.FarmModules.appData.customers = [];
                    window.FarmModules.appData.products = [];
                    
                    // Clear dashboard stats
                    if (window.FarmModules.appData.profile.dashboardStats) {
                        window.FarmModules.appData.profile.dashboardStats = {};
                    }
                    
                    // Clear current input values
                    this.currentInputValues = {};
                    
                    // BROADCAST DATA CLEARED
                    this.broadcastDataDeleted('all_data_cleared', { oldData: oldData });
                    
                    // Save empty state
                    this.saveToLocalStorage();
                    if (window.FarmModules.appData.profile.autoSync) {
                        this.saveToFirebase();
                    }
                    
                    this.showNotification('All data cleared successfully', 'success');
                    this.updateAllDisplays();
                    window.dispatchEvent(new CustomEvent('farm-data-updated'));
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showNotification('Error clearing data', 'error');
                }
            }
        }
    },

    // ==================== FIREBASE METHODS ====================
    async loadFromFirebase() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                this.updateSyncStatus('🔒 Login to sync');
                // Try to load from local storage instead
                this.loadFromLocalStorage();
                return;
            }

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(currentUser.uid)
                    .get();

                if (userDoc.exists) {
                    const firebaseData = userDoc.data();
                    // Merge Firebase data with local data
                    window.FarmModules.appData.profile = {
                        ...window.FarmModules.appData.profile,
                        ...firebaseData,
                        memberSince: window.FarmModules.appData.profile.memberSince || firebaseData.memberSince
                    };
                    console.log('✅ Profile data loaded from Firebase');
                    this.updateSyncStatus('✅ Synced');
                    
                    // BROADCAST FIREBASE LOAD
                    this.broadcastDataAction('firebase_data_loaded');
                } else {
                    // Create user document in Firebase
                    await this.saveToFirebase();
                }
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            this.updateSyncStatus('❌ Sync failed');
            this.handleFirebaseError(error);
            // Fallback to local storage
            this.loadFromLocalStorage();
        }
    },

    async saveToFirebase() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                this.updateSyncStatus('🔒 Login to sync');
                return false;
            }

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const profileData = {
                    ...window.FarmModules.appData.profile,
                    lastSync: new Date().toISOString(),
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    userId: currentUser.uid
                };

                await firebase.firestore()
                    .collection('users')
                    .doc(currentUser.uid)
                    .set(profileData, { merge: true });

                console.log('✅ Profile data saved to Firebase');
                this.updateSyncStatus('✅ Synced');
                
                // BROADCAST FIREBASE SAVE
                this.broadcastDataAction('firebase_data_saved');
                return true;
            }
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            this.updateSyncStatus('❌ Sync failed');
            this.handleFirebaseError(error);
            return false;
        }
    },

    handleFirebaseError(error) {
        console.error('Firebase error:', error);
        let message = 'Sync failed';
        
        if (error.code === 'permission-denied') {
            message = 'Permission denied. Please check your Firebase rules.';
        } else if (error.code === 'unavailable') {
            message = 'Network unavailable. Please check your connection.';
        } else if (error.code === 'not-found') {
            message = 'User data not found in cloud.';
        } else {
            message = `Sync error: ${error.message}`;
        }
        
        this.showNotification(message, 'error');
    },

    // ==================== LOCAL STORAGE METHODS ====================
    saveToLocalStorage() {
        try {
            localStorage.setItem('farm-profile', JSON.stringify(window.FarmModules.appData.profile));
            localStorage.setItem('farm-orders', JSON.stringify(window.FarmModules.appData.orders || []));
            localStorage.setItem('farm-inventory', JSON.stringify(window.FarmModules.appData.inventory || []));
            localStorage.setItem('farm-customers', JSON.stringify(window.FarmModules.appData.customers || []));
            localStorage.setItem('farm-products', JSON.stringify(window.FarmModules.appData.products || []));
            console.log('✅ Data saved to local storage');
            
            // BROADCAST LOCAL SAVE
            this.broadcastDataAction('local_data_saved');
        } catch (error) {
            console.error('Error saving to local storage:', error);
            this.showNotification('Error saving to local storage', 'error');
        }
    },

    loadFromLocalStorage() {
        try {
            const savedProfile = localStorage.getItem('farm-profile');
            const savedOrders = localStorage.getItem('farm-orders');
            const savedInventory = localStorage.getItem('farm-inventory');
            const savedCustomers = localStorage.getItem('farm-customers');
            const savedProducts = localStorage.getItem('farm-products');

            if (savedProfile) {
                window.FarmModules.appData.profile = {
                    ...window.FarmModules.appData.profile,
                    ...JSON.parse(savedProfile)
                };
            }
            if (savedOrders) window.FarmModules.appData.orders = JSON.parse(savedOrders);
            if (savedInventory) window.FarmModules.appData.inventory = JSON.parse(savedInventory);
            if (savedCustomers) window.FarmModules.appData.customers = JSON.parse(savedCustomers);
            if (savedProducts) window.FarmModules.appData.products = JSON.parse(savedProducts);

            console.log('✅ Data loaded from local storage');
            
            // BROADCAST LOCAL LOAD
            this.broadcastDataAction('local_data_loaded');
            return true;
        } catch (error) {
            console.error('Error loading from local storage:', error);
            this.showNotification('Error loading from local storage', 'error');
            return false;
        }
    },

    // ==================== LOGOUT HANDLER ====================
    async handleLogout() {
        console.log('=== LOGOUT DEBUG ===');
        console.log('1. Current URL:', window.location.href);
        console.log('2. Firebase user:', firebase?.auth()?.currentUser);
        
        const rememberUser = window.FarmModules.appData.profile?.rememberUser;
        
        if (confirm('Are you sure you want to logout?' + (rememberUser ? '\n\nYou have "Remember Me" enabled. Your data will be saved for next login.' : ''))) {
            try {
                // BROADCAST LOGOUT START
                this.broadcastDataAction('logout_started', { rememberUser: rememberUser });
                
                // 1. Switch UI to auth IMMEDIATELY
                console.log('🔄 Switching UI to auth screen...');
                document.getElementById('app-container').classList.add('hidden');
                document.getElementById('auth-container').classList.remove('hidden');
                
                // 2. Clear Firebase
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    console.log('🔥 Signing out from Firebase...');
                    await firebase.auth().signOut();
                    console.log('✅ Firebase signed out');
                }
                
                // 3. Clear auth localStorage
                const authKeys = ['firebase:', 'auth_', 'user_'];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (authKeys.some(authKey => key.includes(authKey))) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Removed auth key: ${key}`);
                    }
                }
                
                // 4. Handle "Remember Me" - only clear data if disabled
                if (!rememberUser) {
                    console.log('🧹 Clearing app data (Remember Me disabled)');
                    const appKeys = ['farm-', 'profileData', 'transactions', 'sales', 'inventory'];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (appKeys.some(appKey => key.includes(appKey))) {
                            localStorage.removeItem(key);
                            console.log(`🗑️ Removed app key: ${key}`);
                        }
                    }
                    
                    // Reset app data
                    window.FarmModules.appData = {
                        profile: {
                            farmName: 'My Farm',
                            farmerName: 'Farm Manager',
                            farmType: 'poultry',
                            currency: 'USD',
                            lowStockThreshold: 10,
                            autoSync: true,
                            rememberUser: true,
                            localStorageEnabled: true,
                            memberSince: new Date().toISOString()
                        },
                        orders: [],
                        inventory: [],
                        customers: [],
                        products: []
                    };
                }
                
                // BROADCAST LOGOUT COMPLETE
                this.broadcastDataAction('logout_completed', { 
                    rememberUser: rememberUser,
                    dataCleared: !rememberUser 
                });
                
                this.showNotification('Logged out successfully', 'success');
                
                console.log('✅ Logout complete - showing login screen');
                
                // Optional: Clear any URL parameters
                if (window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname);
                }
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
                
                // Still ensure we show auth screen on error
                document.getElementById('app-container')?.classList.add('hidden');
                document.getElementById('auth-container')?.classList.remove('hidden');
            }
        }
    },

    // ==================== DISPLAY METHODS ====================
    updateAllDisplays() {
        this.updateStatsFromModules();
        this.updateProfileInfo();
        this.updateStatsOverview();
        this.updateDataManagement();
        this.updateSettings();
    },

    updateProfileInfo() {
        const profile = window.FarmModules.appData.profile;
        const currentUser = this.getCurrentUser();
        
        const farmName = profile.farmName || 'My Farm';
        const farmerName = profile.farmerName || 'Farm Manager';
        const email = profile.email || currentUser?.email || 'No email';
        
        this.updateElement('profile-farm-name', farmName);
        this.updateElement('profile-farmer-name', farmerName);
        this.updateElement('profile-email', email);
        
        // Only set values if user hasn't modified them
        if (!this.currentInputValues['farm-name']) {
            this.setValue('farm-name', farmName);
        }
        if (!this.currentInputValues['farmer-name']) {
            this.setValue('farmer-name', farmerName);
        }
        if (!this.currentInputValues['farm-type']) {
            this.setValue('farm-type', profile.farmType);
        }
        if (!this.currentInputValues['farm-location']) {
            this.setValue('farm-location', profile.farmLocation);
        }
        
        const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
        this.updateElement('member-since', `Member since: ${memberSince}`);
    },

    updateStatsOverview() {
        this.updateStatsFromModules();
        const stats = window.FarmModules.appData.profile.dashboardStats || {};
        
        this.updateElement('total-revenue', this.formatCurrency(stats.totalRevenue || 0));
        this.updateElement('total-orders', stats.totalOrders || 0);
        this.updateElement('total-inventory', stats.totalInventoryItems || 0);
        this.updateElement('total-customers', stats.totalCustomers || 0);
        
        const totalEntries = (stats.totalOrders || 0) + (stats.totalInventoryItems || 0) + (stats.totalCustomers || 0);
        this.updateElement('data-entries', `Data entries: ${totalEntries}`);
    },

    updateDataManagement() {
        const orders = window.FarmModules.appData.orders || [];
        const inventory = window.FarmModules.appData.inventory || [];
        const customers = window.FarmModules.appData.customers || [];
        const products = window.FarmModules.appData.products || [];
        
        this.updateElement('orders-count', `${orders.length} records`);
        this.updateElement('inventory-count', `${inventory.length} items`);
        this.updateElement('customers-count', `${customers.length} customers`);
        this.updateElement('products-count', `${products.length} products`);
    },

    updateSettings() {
        const profile = window.FarmModules.appData.profile;
        
        // Only update settings if user hasn't modified them
        if (!this.currentInputValues['default-currency']) {
            this.setValue('default-currency', profile.currency || 'USD');
        }
        if (!this.currentInputValues['low-stock-threshold']) {
            this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        }
        if (this.currentInputValues['auto-sync'] === undefined) {
            this.setChecked('auto-sync', profile.autoSync !== false);
        }
        if (this.currentInputValues['remember-user'] === undefined) {
            this.setChecked('remember-user', profile.rememberUser !== false);
        }
        if (this.currentInputValues['local-storage'] === undefined) {
            this.setChecked('local-storage', profile.localStorageEnabled !== false);
        }
        if (!this.currentInputValues['theme-selector']) {
            this.setValue('theme-selector', profile.theme || 'auto');
        }
    },

    updateUserStatus(status) {
        // Update UI based on user status
        const badge = document.getElementById('broadcast-badge');
        if (badge) {
            if (status === 'online') {
                badge.textContent = '📡 Online';
                badge.style.background = 'var(--success-color)';
            } else if (status === 'offline') {
                badge.textContent = '📡 Offline';
                badge.style.background = 'var(--danger-color)';
            }
        }
    },

    // ==================== UTILITY METHODS ====================
    showNotification(message, type = 'info') {
        // Try core module first
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } 
        // Fallback to native
        else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else if (type === 'warning') {
            console.warn('⚠️ ' + message);
            alert('⚠️ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    },

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    },

    getChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    },

    setChecked(id, checked) {
        const element = document.getElementById(id);
        if (element) element.checked = !!checked;
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency(amount) {
        const currency = window.FarmModules.appData.profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    getCurrentUser() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        return null;
    },

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.uid : 'anonymous';
    },

    updateSyncStatus(status) {
        const syncElement = document.getElementById('sync-status');
        if (syncElement) {
            syncElement.textContent = status;
        }
    }
};

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'profile.js';
    const MODULE_OBJECT = ProfileModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module with Data Broadcaster...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully with Data Broadcaster!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
