// modules/profile.js - COMPLETE WITH ALL IMPLEMENTATIONS + DATA BROADCASTER
console.log('👤 Loading profile module with Data Broadcaster...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    currentInputValues: {},
    broadcastSubscriptions: [],

   // ADD PDF CACHE:
    pdfDataCache: {
        inventory: null,
        orders: null,
        customers: null,
        products: null,
        lastUpdated: {}
    }, 

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('👤 Initializing profile...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager
        if (window.StyleManager) {
            this.registerWithStyleManager();
        }
        
        // Setup broadcaster (safe)
        this.safeSetupBroadcaster();

         // Initialize PDF service
        this.initializePDFService();
        
        this.renderModule();
        this.initialized = true;
        
        // Sync with other modules
        this.syncWithOtherModules();
        
        return true;
    },

    onThemeChange(theme) {
        console.log(`Profile module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    // ==================== SAFE BROADCASTER SETUP ====================
    safeSetupBroadcaster() {
        console.log('Setting up broadcaster...');
        
        // Try to use broadcaster if available
        if (Broadcaster && Broadcaster.recordCreated) {
            try {
                Broadcaster.recordCreated('profile', {
                    action: 'profile_loaded',
                    timestamp: new Date().toISOString(),
                    module: 'profile'
                });
            } catch (error) {
                console.log('Broadcaster recordCreated failed:', error);
            }
        }
        
        // Setup event listeners for other modules
        this.setupModuleEventListeners();
    },

    setupModuleEventListeners() {
        // Listen for data updates from other modules
        window.addEventListener('farm-data-updated', () => {
            this.updateStatsFromModules();
        });
        
        // Listen for inventory updates
        window.addEventListener('inventory-updated', () => {
            this.updateStatsFromModules();
        });
        
        // Listen for order updates
        window.addEventListener('orders-updated', () => {
            this.updateStatsFromModules();
        });
        
        // Listen for sales updates
        window.addEventListener('sales-updated', () => {
            this.updateStatsFromModules();
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
        // Initial sync
        this.updateStatsFromModules();
        
        // Periodic sync
        setInterval(() => {
            this.updateStatsFromModules();
        }, 10000);
    },

    syncInventoryStats() {
        // Get inventory stats if module exists
        if (window.InventoryCheckModule && typeof window.InventoryCheckModule.calculateStats === 'function') {
            try {
                const stats = window.InventoryCheckModule.calculateStats();
                if (stats) {
                    window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
                    window.FarmModules.appData.profile.dashboardStats.totalInventoryItems = stats.totalItems || 0;
                    window.FarmModules.appData.profile.dashboardStats.lowStockItems = stats.lowStockItems || 0;
                    window.FarmModules.appData.profile.dashboardStats.inventoryValue = stats.totalValue || 0;
                }
            } catch (error) {
                console.log('Inventory stats sync error:', error);
            }
        }
        
        // Get orders stats
        if (window.FarmModules.appData.orders) {
            const orders = window.FarmModules.appData.orders;
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            window.FarmModules.appData.profile.dashboardStats.totalOrders = orders.length || 0;
            window.FarmModules.appData.profile.dashboardStats.totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        }
        
        // Get customers stats
        if (window.FarmModules.appData.customers) {
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            window.FarmModules.appData.profile.dashboardStats.totalCustomers = window.FarmModules.appData.customers.length || 0;
        }
    },

    updateStatsFromModules() {
        this.syncInventoryStats();
        this.updateStatsOverview();
    },

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Profile</h1>
                    <p class="module-subtitle">Manage your farm information and settings</p>
                </div>

                <div class="profile-content">
                    <!-- Farm Stats Overview -->
                    <div class="stats-overview">
                        <div class="stat-card glass-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-content">
                                <h3>Total Revenue</h3>
                                <div class="stat-value" id="total-revenue">$0</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-content">
                                <h3>Inventory Items</h3>
                                <div class="stat-value" id="total-inventory">0</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-content">
                                <h3>Total Orders</h3>
                                <div class="stat-value" id="total-orders">0</div>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-content">
                                <h3>Customers</h3>
                                <div class="stat-value" id="total-customers">0</div>
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
                    
                    <!-- ADD THIS INSTALLATION GUIDE SECTION RIGHT HERE -->
                    <div class="installation-guide glass-card" style="margin-top: 24px;">
                        <h3>📱 Install on Mobile</h3>
                        <div class="guide-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Open in Browser</h4>
                                    <p>Visit this app in Safari (iOS) or Chrome (Android)</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Tap Share Button</h4>
                                    <p>Look for <strong>📤 Share</strong> or <strong>⋮ Menu</strong></p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Add to Home Screen</h4>
                                    <p>Select <strong>"Add to Home Screen"</strong></p>
                                </div>
                            </div>
                        </div>
                        <div class="guide-actions" style="display: flex; gap: 12px; margin-top: 20px;">
                            <button class="btn-outline" id="send-install-link" style="flex: 1;">
                                📧 Send Installation Link
                            </button>
                            <button class="btn-outline" id="show-qr-code" style="flex: 1;">
                                📱 Show QR Code
                            </button>
                        </div>
                    </div>
                    
                    <!-- USER MANAGEMENT SECTION (ADMIN ONLY) -->
                    <div class="user-management glass-card" style="margin-top: 24px; ${this.isAdmin() ? '' : 'display: none;'}">
                        <h3>👥 Department User Management</h3>
                        <div class="user-stats" style="display: flex; gap: 16px; margin-bottom: 20px;">
                            <div style="flex: 1; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                                <div style="font-size: 14px; color: var(--text-secondary);">Total Users</div>
                                <div style="font-size: 24px; font-weight: bold;" id="total-users-count">0</div>
                            </div>
                            <div style="flex: 1; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                                <div style="font-size: 14px; color: var(--text-secondary);">Active Today</div>
                                <div style="font-size: 24px; font-weight: bold;" id="active-users-count">0</div>
                            </div>
                            <div style="flex: 1; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                                <div style="font-size: 14px; color: var(--text-secondary);">Pending Invites</div>
                                <div style="font-size: 24px; font-weight: bold;" id="pending-invites-count">0</div>
                            </div>
                        </div>
                        
                        <div class="user-actions" style="display: flex; gap: 12px; margin-bottom: 20px;">
                            <button class="btn-primary" id="invite-user-btn">
                                ✉️ Invite New User
                            </button>
                            <button class="btn-outline" id="bulk-invite-btn">
                                📋 Bulk Import Users
                            </button>
                            <button class="btn-outline" id="export-users-btn">
                                📥 Export User List
                            </button>
                            <button class="btn-outline" id="view-users-btn">
                                👁️ View All Users
                            </button>
                        </div>
                        
                        <div id="users-list-container" style="display: none;">
                            <h4 style="margin-bottom: 16px;">Department Users</h4>
                            <div id="users-list" style="max-height: 300px; overflow-y: auto;">
                                <!-- Users will be loaded here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- SUPPORT SECTION -->
                    <div class="support-section glass-card" style="margin-top: 24px;">
                        <h3>🆘 Support & Help</h3>
                        <div class="support-channels">
                            <div class="support-channel" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--glass-bg); border-radius: 8px; margin-bottom: 12px;">
                                <div style="font-size: 24px;">📧</div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0; color: var(--text-primary);">Email Support</h4>
                                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">farm-support@yourcompany.com</p>
                                </div>
                                <button class="btn-outline" data-action="copy-email" style="margin-left: auto;">📋 Copy</button>
                            </div>
                            
                            <div class="support-channel" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--glass-bg); border-radius: 8px; margin-bottom: 12px;">
                                <div style="font-size: 24px;">💬</div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0; color: var(--text-primary);">Team Channel</h4>
                                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">#farm-management</p>
                                </div>
                                <button class="btn-outline" data-action="open-slack" style="margin-left: auto;">↗️ Open</button>
                            </div>
                            
                            <div class="support-channel" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--glass-bg); border-radius: 8px; margin-bottom: 12px;">
                                <div style="font-size: 24px;">📖</div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0; color: var(--text-primary);">Quick Guide</h4>
                                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">One-page reference</p>
                                </div>
                                <button class="btn-outline" data-action="open-guide" style="margin-left: auto;">📄 Open</button>
                                <button class="btn-outline" data-action="download-guide">📥 PDF</button>
                            </div>
                            
                            <div class="support-channel" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                                <div style="font-size: 24px;">🎥</div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0; color: var(--text-primary);">Video Tutorials</h4>
                                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">Step-by-step guides</p>
                                </div>
                                <button class="btn-outline" data-action="watch-tutorials" style="margin-left: auto;">▶️ Watch</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadUserData();
        this.setupEventListeners();
        this.updateAllDisplays();
        this.loadBackupList();
        this.restoreUserInput();
        this.ensureFormStyles();
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

        // Installation guide buttons
            document.getElementById('send-install-link')?.addEventListener('click', () => {
            this.sendInstallationLink();
        });
        
            document.getElementById('show-qr-code')?.addEventListener('click', () => {
            this.showQRCode();
        });
        
        // Local storage setting
        document.getElementById('local-storage')?.addEventListener('change', (e) => {
            this.saveUserInput('local-storage', e.target.checked);
            this.saveSetting('localStorageEnabled', e.target.checked);
            if (!e.target.checked) {
                this.showNotification('Local storage disabled. Data will only be saved to cloud.', 'warning');
            }
        });

        // User management listeners
            document.getElementById('invite-user-btn')?.addEventListener('click', () => {
                this.inviteNewUser();
            });
            
            document.getElementById('view-users-btn')?.addEventListener('click', () => {
                this.toggleUsersList();
            });
            
            document.getElementById('export-users-btn')?.addEventListener('click', () => {
                this.exportUserList();
            });
            
            document.getElementById('bulk-invite-btn')?.addEventListener('click', () => {
                this.bulkImportUsers();
            });
       

        // TRACK INPUT CHANGES
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

        // ✅ ADD: Support section event listeners
   /* document.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.getAttribute('data-action');
        
        switch(action) {
            case 'copy-email':
                this.copyToClipboard('farm-support@yourcompany.com');
                break;
                
            case 'open-slack':
                this.openSlackChannel();
                break;
                
            case 'open-guide':
                this.openQuickGuide();
                break;
                
            case 'download-guide':
                this.downloadQuickGuide();
                break;
                
            case 'watch-tutorials':
                this.openYouTubeTutorials();
                break;
        }
    });
    }, */

                // ✅ BEST: Event delegation on module element
        this.element.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            e.preventDefault();
            const action = button.getAttribute('data-action');
            console.log('👤 Profile module action:', action);
            
            switch(action) {
                case 'copy-email':
                    this.copyToClipboard('farm-support@yourcompany.com');
                    break;
                    
                case 'open-slack':
                    this.openSlackChannel();
                    break;
                    
                case 'open-guide':
                    this.openQuickGuide();
                    break;
                    
                case 'download-guide':
                    this.downloadQuickGuide();
                    break;
                    
                case 'watch-tutorials':
                    this.openYouTubeTutorials();
                    break;
                    
                // Also handle other profile module actions
                case 'record-feed':
                case 'add-stock':
                case 'adjust-birds':
                case 'export-records':
                    // Handle other actions if needed
                    break;
            }
        });
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
            
            // Initialize profile data
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
                    lastSync: null
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
                })
                .catch((error) => {
                    console.error('Error setting auth persistence:', error);
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

    // ==================== PROFILE MANAGEMENT ====================
    async saveProfile() {
        try {
            const profile = window.FarmModules.appData.profile;
            
            profile.farmName = this.currentInputValues['farm-name'] || this.getValue('farm-name') || profile.farmName;
            profile.farmerName = this.currentInputValues['farmer-name'] || this.getValue('farmer-name') || profile.farmerName;
            profile.farmType = this.currentInputValues['farm-type'] || this.getValue('farm-type') || profile.farmType;
            profile.farmLocation = this.currentInputValues['farm-location'] || this.getValue('farm-location') || profile.farmLocation;
            profile.rememberUser = this.currentInputValues['remember-user'] !== undefined ? this.currentInputValues['remember-user'] : this.getChecked('remember-user');
            profile.localStorageEnabled = this.currentInputValues['local-storage'] !== undefined ? this.currentInputValues['local-storage'] : this.getChecked('local-storage');

            window.FarmModules.appData.farmName = profile.farmName;

            // Update user persistence
            this.updateUserPersistence();

            // Auto-save to Firebase if enabled
            if (profile.autoSync) {
                await this.saveToFirebase();
            }

            // Save to local storage if enabled
            if (profile.localStorageEnabled) {
                this.saveToLocalStorage();
            }

            this.updateAllDisplays();
            this.showNotification('Profile saved successfully!', 'success');
            
            // Clear current input values
            this.currentInputValues = {};
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    },

    async saveSetting(setting, value) {
        try {
            window.FarmModules.appData.profile[setting] = value;
            
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

    async syncNow() {
        this.updateSyncStatus('🔄 Syncing...');
        
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
                this.showNotification('Data synced with cloud and local storage!', 'success');
                this.updateSyncStatus('✅ Synced');
            } else if (localSuccess) {
                this.showNotification('Data saved to local storage!', 'success');
                this.updateSyncStatus('💾 Local');
            } else {
                this.showNotification('Sync failed. Data not saved.', 'error');
                this.updateSyncStatus('❌ Failed');
            }
        } catch (error) {
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
                    
                    if (!backupData.appData || !backupData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    if (confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
                        window.FarmModules.appData = backupData.appData;
                        this.showNotification('Backup restored successfully!', 'success');
                        this.updateAllDisplays();
                        
                        this.saveToLocalStorage();
                        if (window.FarmModules.appData.profile.autoSync) {
                            this.saveToFirebase();
                        }
                        
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
            
            this.showNotification(`Successfully imported ${importedCount} items!`, 'success');
            this.updateAllDisplays();
            window.dispatchEvent(new CustomEvent('farm-data-updated'));
            
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
                    window.FarmModules.appData.orders = [];
                    window.FarmModules.appData.inventory = [];
                    window.FarmModules.appData.customers = [];
                    window.FarmModules.appData.products = [];
                    
                    if (window.FarmModules.appData.profile.dashboardStats) {
                        window.FarmModules.appData.profile.dashboardStats = {};
                    }
                    
                    this.currentInputValues = {};
                    
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
                    window.FarmModules.appData.profile = {
                        ...window.FarmModules.appData.profile,
                        ...firebaseData,
                        memberSince: window.FarmModules.appData.profile.memberSince || firebaseData.memberSince
                    };
                    console.log('✅ Profile data loaded from Firebase');
                    this.updateSyncStatus('✅ Synced');
                } else {
                    await this.saveToFirebase();
                }
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            this.updateSyncStatus('❌ Sync failed');
            this.handleFirebaseError(error);
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
                    displayName: currentUser.displayName
                };

                await firebase.firestore()
                    .collection('users')
                    .doc(currentUser.uid)
                    .set(profileData, { merge: true });

                console.log('✅ Profile data saved to Firebase');
                this.updateSyncStatus('✅ Synced');
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
            return true;
        } catch (error) {
            console.error('Error loading from local storage:', error);
            this.showNotification('Error loading from local storage', 'error');
            return false;
        }
    },

    // ==================== LOGOUT HANDLER ====================
    async handleLogout() {
        const rememberUser = window.FarmModules.appData.profile?.rememberUser;
        
        if (confirm('Are you sure you want to logout?' + (rememberUser ? '\n\nYou have "Remember Me" enabled. Your data will be saved for next login.' : ''))) {
            try {
                // Switch UI to auth
                document.getElementById('app-container').classList.add('hidden');
                document.getElementById('auth-container').classList.remove('hidden');
                
                // Clear Firebase
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    await firebase.auth().signOut();
                }
                
                // Clear auth localStorage
                const authKeys = ['firebase:', 'auth_', 'user_'];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (authKeys.some(authKey => key.includes(authKey))) {
                        localStorage.removeItem(key);
                    }
                }
                
                // Handle "Remember Me"
                if (!rememberUser) {
                    const appKeys = ['farm-', 'profileData', 'transactions', 'sales', 'inventory'];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (appKeys.some(appKey => key.includes(appKey))) {
                            localStorage.removeItem(key);
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
                
                this.showNotification('Logged out successfully', 'success');
                
                if (window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname);
                }
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
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

    // ==================== UTILITY METHODS ====================
    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else if (type === 'error') {
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

    updateSyncStatus(status) {
        const syncElement = document.getElementById('sync-status');
        if (syncElement) {
            syncElement.textContent = status;
        }
    },

    // ==================== MOBILE INSTALLATION METHODS ====================
    
    showQRCode() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'popout-modal';
        modal.innerHTML = `
            <div class="popout-modal-content" style="max-width: 400px; text-align: center;">
                <div class="popout-modal-header">
                    <h3>📱 Scan to Install</h3>
                    <button class="popout-modal-close" id="close-qr-modal">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div style="padding: 20px;">
                        <!-- QR Code Placeholder -->
                        <div id="qr-code-container" style="width: 256px; height: 256px; margin: 0 auto 20px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
                                <div style="color: var(--text-secondary); font-size: 14px;">Scan with phone camera</div>
                            </div>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: var(--text-primary);">Installation Steps:</p>
                            <ol style="text-align: left; margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 14px;">
                                <li>Open camera app on phone</li>
                                <li>Point camera at this screen</li>
                                <li>Tap the notification/link that appears</li>
                                <li>Tap "Add to Home Screen" when prompted</li>
                            </ol>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">Or copy this link:</p>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="app-url" value="${window.location.href}" readonly style="flex: 1; padding: 8px 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass-bg); color: var(--text-primary);">
                                <button class="btn-outline" id="copy-url" style="white-space: nowrap;">📋 Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        document.getElementById('close-qr-modal')?.addEventListener('click', () => {
            modal.remove();
        });
        
        // Copy URL button
        document.getElementById('copy-url')?.addEventListener('click', () => {
            const urlInput = document.getElementById('app-url');
            urlInput.select();
            document.execCommand('copy');
            this.showNotification('URL copied to clipboard!', 'success');
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    sendInstallationLink() {
        const email = prompt('Enter department member email address:');
        if (!email) return;
        
        const subject = 'Farm Manager App - Installation Instructions';
        const body = `Hello!

You're invited to install the Farm Manager app on your mobile device.

**App Features:**
• Track farm inventory and sales
• Manage orders and customers
• Record production data
• Generate reports
• Sync data across devices

**Installation Steps:**

1. **Open this link on your mobile device:**
${window.location.href}

2. **Add to Home Screen:**
- iOS (iPhone/iPad): Tap Share (📤) → "Add to Home Screen"
- Android: Tap Menu (⋮) → "Install app" or "Add to Home Screen"

3. **Log in using your credentials.**

**Your login:**
Email: ${email}
(Your password was provided separately)

**Support:**
If you need assistance, please contact your department administrator.

Best regards,
Farm Management Team`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Try to open email client
        window.location.href = mailtoLink;
        
        // Fallback: Show manual copy option
        setTimeout(() => {
            if (confirm('Email client opened? If not, would you like to copy the instructions to clipboard instead?')) {
                navigator.clipboard.writeText(body)
                    .then(() => this.showNotification('Instructions copied to clipboard!', 'success'))
                    .catch(() => {
                        // Fallback for older browsers
                        const textarea = document.createElement('textarea');
                        textarea.value = body;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        this.showNotification('Instructions copied to clipboard!', 'success');
                    });
            }
        }, 1000);
    },

// ==================== ADMIN & USER MANAGEMENT ====================
isAdmin() {
    // Check if current user is admin
    const currentUser = this.getCurrentUser();
    const profile = window.FarmModules.appData.profile;
    return currentUser && (
        currentUser.email === profile.email || 
        profile.role === 'admin' ||
        currentUser.email.includes('admin') ||
        currentUser.email.includes('manager')
    );
},

async loadDepartmentUsers() {
    if (!this.isAdmin()) return;
    
    try {
        // Load from Firebase if available
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const usersSnapshot = await firebase.firestore()
                .collection('department_users')
                .get();
            
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            window.FarmModules.appData.departmentUsers = users;
            this.updateUserStats(users);
            this.renderUsersList(users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
},

updateUserStats(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.lastActive && 
        new Date(u.lastActive) > new Date(Date.now() - 24*60*60*1000)).length;
    const pendingInvites = users.filter(u => u.status === 'pending').length;
    
    this.updateElement('total-users-count', totalUsers);
    this.updateElement('active-users-count', activeUsers);
    this.updateElement('pending-invites-count', pendingInvites);
},

renderUsersList(users) {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                <div>No department users yet</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            ${users.map(user => `
                <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: ${this.getUserColor(user.email)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            ${user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${user.name || 'No name'}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${user.email}</div>
                            <div style="display: flex; gap: 8px; margin-top: 4px;">
                                <span class="user-badge" style="background: ${user.status === 'active' ? '#10b981' : '#f59e0b'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">
                                    ${user.status || 'pending'}
                                </span>
                                <span style="font-size: 11px; color: var(--text-secondary);">
                                    ${user.role || 'user'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${user.status === 'pending' ? `
                            <button class="btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="ProfileModule.resendInvite('${user.email}')">
                                🔄 Resend
                            </button>
                        ` : ''}
                        <button class="btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="ProfileModule.viewUserDetails('${user.id}')">
                            👁️ View
                        </button>
                        <button class="btn-outline" style="padding: 4px 8px; font-size: 12px; color: #ef4444;" onclick="ProfileModule.removeUser('${user.id}')">
                            🗑️ Remove
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
},

getUserColor(email) {
    // Generate consistent color from email
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
},

async inviteNewUser() {
    if (!this.isAdmin()) {
        this.showNotification('Admin access required', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'popout-modal';
    modal.innerHTML = `
        <div class="popout-modal-content" style="max-width: 500px;">
            <div class="popout-modal-header">
                <h3>✉️ Invite New User</h3>
                <button class="popout-modal-close" id="close-invite-modal">&times;</button>
            </div>
            <div class="popout-modal-body">
                <form id="invite-user-form">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Full Name *</label>
                        <input type="text" id="user-name" class="form-input" required placeholder="Enter full name">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Email Address *</label>
                        <input type="email" id="user-email" class="form-input" required placeholder="user@department.com">
                    </div>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <select id="user-role" class="form-input">
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department</label>
                            <select id="user-department" class="form-input">
                                <option value="operations">Operations</option>
                                <option value="sales">Sales</option>
                                <option value="inventory">Inventory</option>
                                <option value="management">Management</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Welcome Message</label>
                        <textarea id="welcome-message" class="form-input" rows="4" placeholder="Personalized welcome message...">Welcome to the Farm Management System! Your account has been created. Please use the credentials below to log in.</textarea>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Send Welcome Email</h4>
                                <p>Send login credentials via email</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="send-welcome-email" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="password-section" style="display: none;">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="form-label">Temporary Password</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="temp-password" class="form-input" value="${this.generatePassword()}" readonly>
                                <button type="button" class="btn-outline" onclick="ProfileModule.generateNewPassword()">🔄 New</button>
                                <button type="button" class="btn-outline" onclick="ProfileModule.copyPassword()">📋 Copy</button>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                User will be prompted to change password on first login
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="popout-modal-footer">
                <button type="button" class="btn-outline" id="cancel-invite">Cancel</button>
                <button type="button" class="btn-primary" id="send-invite">Send Invitation</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-invite-modal')?.addEventListener('click', () => modal.remove());
    document.getElementById('cancel-invite')?.addEventListener('click', () => modal.remove());
    
    document.getElementById('send-invite')?.addEventListener('click', async () => {
        await this.sendUserInvitation();
        modal.remove();
    });
    
    // Show/hide password section
    document.getElementById('send-welcome-email')?.addEventListener('change', (e) => {
        document.getElementById('password-section').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
},

generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
},

async sendUserInvitation() {
    const userName = document.getElementById('user-name')?.value;
    const userEmail = document.getElementById('user-email')?.value;
    const userRole = document.getElementById('user-role')?.value;
    const userDept = document.getElementById('user-department')?.value;
    const welcomeMessage = document.getElementById('welcome-message')?.value;
    const sendEmail = document.getElementById('send-welcome-email')?.checked;
    const tempPassword = document.getElementById('temp-password')?.value;
    
    if (!userName || !userEmail) {
        this.showNotification('Name and email are required', 'error');
        return;
    }
    
    try {
        // Create user in Firebase Authentication
        if (sendEmail && tempPassword) {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(userEmail, tempPassword);
            
            // Send email verification
            await userCredential.user.sendEmailVerification();
        }
        
        // Save user data to Firestore
        const userData = {
            name: userName,
            email: userEmail,
            role: userRole,
            department: userDept,
            status: 'pending',
            invitedBy: this.getCurrentUser().email,
            invitedAt: new Date().toISOString(),
            lastActive: null
        };
        
        await firebase.firestore()
            .collection('department_users')
            .doc(userEmail.replace(/[^a-zA-Z0-9]/g, '_'))
            .set(userData);
        
        // Send welcome email if requested
        if (sendEmail) {
            await this.sendWelcomeEmail(userEmail, userName, tempPassword, welcomeMessage);
        }
        
        this.showNotification(`Invitation sent to ${userEmail}`, 'success');
        this.loadDepartmentUsers();
        
    } catch (error) {
        console.error('Error sending invitation:', error);
        this.showNotification(`Invitation failed: ${error.message}`, 'error');
    }
},

async sendWelcomeEmail(email, name, password, welcomeMessage) {
    const subject = `Welcome to Farm Manager - Your Account Details`;
    const body = `Dear ${name},

${welcomeMessage || 'Welcome to the Farm Management System! Your account has been created.'}

**Your Login Details:**
• App URL: ${window.location.origin}
• Email: ${email}
• Temporary Password: ${password}

**Important:**
1. Use the temporary password above for your first login
2. You will be prompted to create a new password
3. Please verify your email address when prompted

**Getting Started:**
1. Install the app on your mobile device (see instructions below)
2. Log in with the credentials above
3. Explore the dashboard and modules
4. Watch the tutorial videos in the Help section

**Need Help?**
• Quick Start Guide: [Attached PDF]
• Support Channel: ${this.getSupportChannel()}
• Admin Contact: ${this.getCurrentUser().email}

Best regards,
Farm Management Team

---
Installation Instructions:
1. Open ${window.location.origin} on your mobile device
2. Tap Share (📤) → "Add to Home Screen" (iOS)
3. Tap Menu (⋮) → "Install app" (Android)
4. Launch like a regular app!`;

    // Send email
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    // Also save a record of the email
    await firebase.firestore()
        .collection('email_logs')
        .add({
            to: email,
            subject: subject,
            sentAt: new Date().toISOString(),
            type: 'welcome_email'
        });
},

getSupportChannel() {
    // This should be configurable in settings
    return window.FarmModules.appData.profile.supportChannel || 
           'slack://channel?team=YOUR_TEAM&id=YOUR_CHANNEL';
}, 

toggleUsersList() {
    const container = document.getElementById('users-list-container');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        if (container.style.display === 'block') {
            this.loadDepartmentUsers();
        }
    }
},

exportUserList() {
    const users = window.FarmModules.appData.departmentUsers || [];
    const csvContent = [
        ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Active', 'Invited By'].join(','),
        ...users.map(user => [
            `"${user.name || ''}"`,
            `"${user.email || ''}"`,
            `"${user.role || ''}"`,
            `"${user.department || ''}"`,
            `"${user.status || ''}"`,
            `"${user.lastActive || ''}"`,
            `"${user.invitedBy || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `farm-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showNotification('User list exported', 'success');
},

// ==================== SUPPORT METHODS ====================
  
copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => this.showNotification('Copied to clipboard!', 'success'))
        .catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Copied to clipboard!', 'success');
        });
},

openQuickGuide() {
    const guideWindow = window.open('', '_blank');
    guideWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Farm Manager Quick Guide</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #2E7D32; }
                .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                .step { margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>Farm Manager Quick Guide</h1>
            <div class="section">
                <h2>📱 Installation</h2>
                <div class="step">1. Open ${window.location.origin} on mobile</div>
                <div class="step">2. Tap Share → Add to Home Screen</div>
                <div class="step">3. Launch like a regular app</div>
            </div>
            <div class="section">
                <h2>🔑 Login</h2>
                <div class="step">• Email: Provided in welcome email</div>
                <div class="step">• Password: Temporary password (change on first login)</div>
            </div>
            <div class="section">
                <h2>📞 Support</h2>
                <div class="step">• Email: farm-support@yourcompany.com</div>
                <div class="step">• Slack: #farm-management</div>
                <div class="step">• Hours: Mon-Fri, 8AM-6PM</div>
            </div>
        </body>
        </html>
    `);
    guideWindow.document.close();
},

downloadQuickGuide() {
    // This would generate a PDF using a library like jsPDF
    // For now, provide a downloadable HTML file
    const guideContent = `...quick guide HTML content...`;
    const blob = new Blob([guideContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Farm-Manager-Quick-Guide.html';
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showNotification('Quick guide downloaded', 'success');
},

    // ==================== SUPPORT & HELP METHODS ====================

// ✅ ADD: Copy to clipboard method
copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            this.showNotification('Copied to clipboard!', 'success');
            console.log('✅ Text copied:', text);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Copied to clipboard!', 'success');
        });
},

// ✅ ADD: Open Quick Guide method
openQuickGuide() {
    console.log('📖 Opening quick guide...');
    
    // Create a simple modal with quick guide content
    const modal = document.createElement('div');
    modal.className = 'popout-modal';
    modal.innerHTML = `
        <div class="popout-modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div class="popout-modal-header">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">📖</span>
                    Farm Manager Quick Guide
                </h3>
                <button class="popout-modal-close" data-action="close-quick-guide">&times;</button>
            </div>
            <div class="popout-modal-body" style="padding: 24px;">
                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">📱 Installation</h4>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                        <p style="margin: 0 0 8px 0; color: var(--text-primary);">
                            <strong>Step 1:</strong> Open ${window.location.origin} on your mobile device
                        </p>
                        <p style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 14px;">
                            • iOS: Use Safari browser<br>
                            • Android: Use Chrome browser
                        </p>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                        <p style="margin: 0 0 8px 0; color: var(--text-primary);">
                            <strong>Step 2:</strong> Tap the Share button
                        </p>
                        <p style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 14px;">
                            • iOS: Tap the <strong>📤 Share</strong> icon in Safari<br>
                            • Android: Tap the <strong>⋮ Menu</strong> button in Chrome
                        </p>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px;">
                        <p style="margin: 0 0 8px 0; color: var(--text-primary);">
                            <strong>Step 3:</strong> Select "Add to Home Screen"
                        </p>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">
                            Follow the prompts to install the app on your home screen
                        </p>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">🔑 Login & Setup</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px;">
                            <h5 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 14px;">First Time Login</h5>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 13px;">
                                • Use the email and temporary password provided<br>
                                • You'll be prompted to create a new password<br>
                                • Verify your email address
                            </p>
                        </div>
                        <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px;">
                            <h5 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 14px;">Profile Setup</h5>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 13px;">
                                • Complete your farm profile information<br>
                                • Set your preferred currency<br>
                                • Configure notification preferences
                            </p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">🚜 Key Features</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div style="background: var(--glass-bg); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                            <div style="font-size: 13px; color: var(--text-primary);">Income & Expenses</div>
                        </div>
                        <div style="background: var(--glass-bg); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                            <div style="font-size: 13px; color: var(--text-primary);">Inventory Tracking</div>
                        </div>
                        <div style="background: var(--glass-bg); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                            <div style="font-size: 13px; color: var(--text-primary);">Production Records</div>
                        </div>
                        <div style="background: var(--glass-bg); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                            <div style="font-size: 13px; color: var(--text-primary);">Reports & Analytics</div>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1)); padding: 20px; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px;">📞 Need Help?</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">
                        • Email: farm-support@yourcompany.com<br>
                        • Team Channel: #farm-management<br>
                        • Hours: Monday-Friday, 8AM-6PM
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for the close button
    const closeButton = modal.querySelector('.popout-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.remove();
            console.log('Quick guide closed via X button');
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            console.log('Quick guide closed via outside click');
        }
    });
    
    // Close with Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape' && document.body.contains(modal)) {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
            console.log('Quick guide closed via Escape key');
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Clean up event listener when modal is removed
    const observer = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', escapeHandler);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    this.showNotification('Quick guide opened', 'info');
},
    
// ✅ ADD: Download Quick Guide method
downloadQuickGuide() {
    console.log('📥 Downloading quick guide...');
    
    // Create HTML content for the guide
    const guideContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Farm Manager Quick Guide</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    max-width: 800px; 
                    margin: 0 auto;
                    line-height: 1.6;
                }
                h1 { 
                    color: #2E7D32; 
                    border-bottom: 3px solid #2E7D32;
                    padding-bottom: 10px;
                }
                h2 { color: #1B5E20; margin-top: 30px; }
                .section { 
                    margin: 20px 0; 
                    padding: 15px; 
                    background: #f8f9fa; 
                    border-radius: 8px;
                    border-left: 4px solid #4CAF50;
                }
                .step { 
                    margin: 15px 0; 
                    padding: 10px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e0e0e0;
                }
                .step-number {
                    display: inline-block;
                    background: #4CAF50;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 24px;
                    margin-right: 10px;
                }
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                .feature {
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    text-align: center;
                }
                .contact-info {
                    background: #e8f5e9;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <h1>Farm Manager Quick Guide</h1>
            
            <div class="section">
                <h2>📱 Installation Instructions</h2>
                
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Open in Browser</strong>
                    <p>Visit ${window.location.origin} on your mobile device's browser (Safari for iOS, Chrome for Android).</p>
                </div>
                
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Tap Share Button</strong>
                    <p>Look for the share icon (📤 on iOS) or menu button (⋮ on Android) in your browser.</p>
                </div>
                
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Add to Home Screen</strong>
                    <p>Select "Add to Home Screen" from the menu and follow the prompts.</p>
                </div>
            </div>

            <div class="section">
                <h2>🔑 Login & Account Setup</h2>
                <ul>
                    <li><strong>First Login:</strong> Use the credentials provided in your welcome email</li>
                    <li><strong>Password Reset:</strong> You'll be prompted to create a new password on first login</li>
                    <li><strong>Profile Setup:</strong> Complete your farm information in the Profile section</li>
                    <li><strong>Remember Me:</strong> Enable "Remember Me" to stay logged in on your device</li>
                </ul>
            </div>

            <div class="section">
                <h2>🚜 Key Features Overview</h2>
                <div class="feature-grid">
                    <div class="feature">
                        <div style="font-size: 24px; margin-bottom: 10px;">💰</div>
                        <div><strong>Income & Expenses</strong></div>
                        <div style="font-size: 12px; color: #666;">Track all farm transactions</div>
                    </div>
                    <div class="feature">
                        <div style="font-size: 24px; margin-bottom: 10px;">📦</div>
                        <div><strong>Inventory</strong></div>
                        <div style="font-size: 12px; color: #666;">Manage stock levels and orders</div>
                    </div>
                    <div class="feature">
                        <div style="font-size: 24px; margin-bottom: 10px;">🐔</div>
                        <div><strong>Production</strong></div>
                        <div style="font-size: 12px; color: #666;">Record daily production data</div>
                    </div>
                    <div class="feature">
                        <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                        <div><strong>Reports</strong></div>
                        <div style="font-size: 12px; color: #666;">Generate detailed analytics</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📞 Support Information</h2>
                <div class="contact-info">
                    <p><strong>Email Support:</strong> farm-support@yourcompany.com</p>
                    <p><strong>Team Channel:</strong> #farm-management</p>
                    <p><strong>Support Hours:</strong> Monday-Friday, 8AM-6PM</p>
                    <p><strong>Urgent Issues:</strong> Contact your department administrator</p>
                </div>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; text-align: center;">
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <p>Farm Manager System v1.0 • © ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </body>
        </html>
    `;
    
    // Create and trigger download
    const blob = new Blob([guideContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Farm_Manager_Quick_Guide.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('Quick guide downloaded!', 'success');
},

// ✅ ADD: Open YouTube tutorial method
openYouTubeTutorials() {
    // Replace with your actual YouTube playlist URL
    const youtubeUrl = 'https://youtube.com/playlist?list=YOUR_PLAYLIST';
    window.open(youtubeUrl, '_blank');
    this.showNotification('Opening YouTube tutorials...', 'info');
},

// ✅ ADD: Open Slack channel method
openSlackChannel() {
    // Try to open Slack app, fallback to web
    const slackUrl = 'slack://channel?team=YOUR_TEAM&id=YOUR_CHANNEL';
    const webUrl = 'https://your-company.slack.com/archives/YOUR_CHANNEL';
    
    // Try to open Slack app
    window.location.href = slackUrl;
    
    // Fallback after timeout
    setTimeout(() => {
        if (!document.hidden) {
            window.open(webUrl, '_blank');
        }
    }, 500);
},
    
// ==================== PDF FUNCTIONALITY ====================

initializePDFService() {
    console.log('📄 Initializing PDF service...');
    
    // Simple check - jsPDF should be loaded from HTML
    if (typeof jspdf === 'undefined') {
        console.error('❌ jsPDF not loaded');
        this.showNotification('PDF service not available', 'error');
        return false;
    }
    
    console.log('✅ PDF Service ready');
    
    // Add PDF buttons to UI
    setTimeout(() => {
        this.addPDFButtons();
    }, 500);
    
    return true;
},
    
/* loadJSPDF() {
    // Just check if jsPDF is available (it should be from HTML)
    return new Promise((resolve, reject) => {
        if (typeof jspdf !== 'undefined') {
            console.log('✅ jsPDF is ready (loaded from HTML)');
            resolve();
        } else {
            console.error('❌ jsPDF not found. Make sure it\'s loaded in index.html');
            reject(new Error('jsPDF library not loaded'));
        }
    });
}, */

getUserDataForPDF() {
    const currentUser = this.getCurrentUser();
    const profile = window.FarmModules.appData.profile;
    
    return {
        name: profile.farmerName || currentUser?.displayName || 'Farm Manager',
        email: profile.email || currentUser?.email || 'Not specified',
        role: 'Farmer/Owner',
        createdAt: profile.memberSince || new Date().toISOString(),
        lastLogin: profile.lastSync || new Date().toISOString(),
        phone: profile.phone || 'Not specified',
        address: profile.farmLocation || 'Not specified'
    };
},

getFarmDataForPDF() {
    const profile = window.FarmModules.appData.profile;
    
    return {
        farmName: profile.farmName || 'My Farm',
        farmId: `FARM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        location: profile.farmLocation || 'Not specified',
        size: profile.farmSize || 'Not specified',
        farmType: profile.farmType || 'Mixed Farming',
        primaryCrop: profile.primaryCrop || 'Various',
        livestockType: profile.livestockType || 'Poultry/Livestock',
        establishedDate: profile.establishedDate || 'Not specified'
    };
},

addPDFButtons() {
    // Add PDF export button to profile UI
    setTimeout(() => {
        const profileContainer = document.querySelector('.profile-content');
        if (!profileContainer) return;
        
        // Check if button already exists
        if (document.getElementById('export-pdf-btn')) return;
        
        // Create PDF export section
        const pdfSection = document.createElement('div');
        pdfSection.className = 'pdf-export-section glass-card';
        pdfSection.innerHTML = `
            <h3 style="margin-bottom: 16px; color: var(--text-primary);">📄 Export Reports</h3>
            <div class="pdf-buttons-container">
                <button class="pdf-btn profile" id="export-profile-pdf">
                    <span style="font-size: 20px;">📋</span>
                    <span>Export Profile</span>
                </button>
                <button class="pdf-btn report" id="export-inventory-pdf">
                    <span style="font-size: 20px;">📦</span>
                    <span>Inventory Report</span>
                </button>
                <button class="pdf-btn receipt" id="export-sales-pdf">
                    <span style="font-size: 20px;">💰</span>
                    <span>Sales Report</span>
                </button>
                <button class="pdf-btn" id="export-custom-pdf">
                    <span style="font-size: 20px;">⚙️</span>
                    <span>Custom Report</span>
                </button>
            </div>
            <div id="pdf-status" style="margin-top: 16px; font-size: 14px; color: var(--text-secondary); text-align: center;"></div>
        `;
        
        // Insert after stats overview
        const statsSection = profileContainer.querySelector('.stats-overview');
        if (statsSection) {
            statsSection.parentNode.insertBefore(pdfSection, statsSection.nextSibling);
        } else {
            profileContainer.insertBefore(pdfSection, profileContainer.firstChild);
        }
        
        // Add event listeners
        document.getElementById('export-profile-pdf')?.addEventListener('click', () => this.exportProfilePDF());
        document.getElementById('export-inventory-pdf')?.addEventListener('click', () => this.exportInventoryPDF());
        document.getElementById('export-sales-pdf')?.addEventListener('click', () => this.exportSalesPDF());
        document.getElementById('export-custom-pdf')?.addEventListener('click', () => this.exportCustomPDF());
        
        console.log('✅ PDF export buttons added to profile');
        
    }, 1000);
},

updatePDFStatus(status, type = 'info') {
    const statusElement = document.getElementById('pdf-status');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.style.color = type === 'error' ? '#ef4444' : 
                                   type === 'success' ? '#10b981' : 
                                   'var(--text-secondary)';
    }
},

async exportProfilePDF() {
    if (!window.pdfService) {
        this.showNotification('PDF service not available. Please reload the page.', 'error');
        return;
    }
    
    const button = document.getElementById('export-profile-pdf');
    const originalText = button?.innerHTML || 'Export Profile';
    
    if (button) {
        button.innerHTML = '<span class="pdf-loading">⏳ Generating</span>';
        button.disabled = true;
    }
    
    this.updatePDFStatus('Generating profile PDF...');
    
    try {
        const result = window.pdfService.generateProfilePDF();
        
        if (result.success) {
            this.updatePDFStatus(`✅ PDF generated: ${result.fileName}`, 'success');
            this.showNotification(`Profile PDF exported: ${result.fileName}`, 'success');
        } else {
            this.updatePDFStatus(`❌ Failed: ${result.error}`, 'error');
            this.showNotification(`PDF generation failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('PDF export error:', error);
        this.updatePDFStatus('❌ Export failed', 'error');
        this.showNotification('Error generating PDF', 'error');
    } finally {
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
},

async exportInventoryPDF() {
    if (!window.pdfService) {
        this.showNotification('PDF service not available', 'error');
        return;
    }
    
    const button = document.getElementById('export-inventory-pdf');
    const originalText = button?.innerHTML || 'Inventory Report';
    
    if (button) {
        button.innerHTML = '<span class="pdf-loading">⏳ Generating</span>';
        button.disabled = true;
    }
    
    this.updatePDFStatus('Generating inventory report...');
    
    try {
        const inventoryData = window.FarmModules.appData.inventory || [];
        const result = this.generateInventoryPDF(inventoryData);
        
        if (result.success) {
            this.updatePDFStatus(`✅ Inventory report exported`, 'success');
            this.showNotification('Inventory PDF generated', 'success');
        } else {
            this.updatePDFStatus(`❌ Failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Inventory PDF error:', error);
        this.updatePDFStatus('❌ Export failed', 'error');
    } finally {
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
},

    generateInventoryPDF() {
    // Use cached data or fall back to appData
    const inventoryData = this.pdfDataCache.inventory || 
                         window.FarmModules.appData.inventory || [];
    
    if (inventoryData.length === 0) {
        this.showNotification('No inventory data to export', 'warning');
        return;
    }
    
    // Add broadcaster info to PDF
    const lastUpdated = this.pdfDataCache.lastUpdated.inventory || 
                       'Never updated';
    
    // Your existing PDF generation code, but with broadcaster info
    const result = this._generateInventoryPDFWithBroadcasterInfo(
        inventoryData, 
        lastUpdated
    );
    
    // Broadcast that we generated a PDF
    if (result.success) {
        DataBroadcaster.recordCreated('profile', {
            action: 'pdf_export',
            reportType: 'inventory',
            fileName: result.fileName,
            itemCount: inventoryData.length
        });
    }
},
    
generateInventoryPDF(inventoryItems) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const farmName = window.FarmModules.appData.profile?.farmName || 'My Farm';
        const now = new Date();
        
        // ===== HEADER WITH BROADCASTER INFO =====
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('INVENTORY REPORT', 105, 20, { align: 'center' });
        
        // Report metadata with Data Broadcaster info
        doc.text(`Report ID: INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 20, 45);
        
        // Data source info (from broadcaster cache)
        if (this.pdfDataCache?.lastUpdated?.inventory) {
            doc.text(`Last Updated: ${new Date(this.pdfDataCache.lastUpdated.inventory).toLocaleString()}`, 20, 59);
        }
        
        // ===== ENHANCED SUMMARY STATISTICS =====
        // Summary box with colored background
        doc.setFillColor(240, 248, 255);
        doc.rect(20, yPos - 10, 170, 40, 'F');
        
        // More detailed stats
        const lowStockThreshold = window.FarmModules.appData.profile?.lowStockThreshold || 10;
        const lowStockItems = inventoryItems.filter(item => (item.quantity || 0) <= lowStockThreshold).length;
        const outOfStockItems = inventoryItems.filter(item => (item.quantity || 0) <= 0).length;
        
        // Color-coded status
        doc.setTextColor(lowStockItems > 0 ? [220, 38, 38] : [34, 197, 94]);
        doc.text(`Low Stock: ${lowStockItems} items`, col2X, yPos + 10);
        
        // ===== GROUPED BY CATEGORY =====
        // Items grouped by category instead of one big table
        const itemsByCategory = {};
        inventoryItems.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!itemsByCategory[category]) {
                itemsByCategory[category] = [];
            }
            itemsByCategory[category].push(item);
        });
        
        // ===== PROFESSIONAL FOOTER =====
        // Confidential notice and page numbers
        doc.text('CONFIDENTIAL - For internal use only', 105, 285, { align: 'center' });
        
        // Page numbers for multi-page reports
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // ===== BROADCASTER INTEGRATION =====
        // Broadcast the PDF generation event
        if (window.DataBroadcaster) {
            window.DataBroadcaster.recordCreated('profile', {
                action: 'pdf_export',
                reportType: 'inventory',
                fileName: fileName,
                itemCount: totalItems,
                totalValue: totalValue,
                lowStockCount: lowStockItems,
                timestamp: now.toISOString()
            });
        }
        
        // ===== BETTER ERROR HANDLING =====
        // Update UI status
        this.updatePDFStatus(`✅ Inventory report exported (${totalItems} items)`, 'success');
        
        return { 
            success: true, 
            fileName: fileName,
            stats: {
                totalItems,
                totalValue,
                lowStockItems,
                outOfStockItems
            }
        };
        
    } catch (error) {
        console.error('Inventory PDF generation error:', error);
        this.updatePDFStatus('❌ Failed to generate inventory report', 'error');
        this.showNotification(`Error: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
},

async exportSalesPDF() {
    if (!window.pdfService) {
        this.showNotification('PDF service not available', 'error');
        return;
    }
    
    const button = document.getElementById('export-sales-pdf');
    const originalText = button?.innerHTML || 'Sales Report';
    
    if (button) {
        button.innerHTML = '<span class="pdf-loading">⏳ Generating</span>';
        button.disabled = true;
    }
    
    this.updatePDFStatus('Generating sales report...');
    
    try {
        const salesData = window.FarmModules.appData.orders || [];
        const result = this.generateSalesPDF(salesData);
        
        if (result.success) {
            this.updatePDFStatus(`✅ Sales report exported`, 'success');
            this.showNotification('Sales PDF generated', 'success');
        } else {
            this.updatePDFStatus(`❌ Failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Sales PDF error:', error);
        this.updatePDFStatus('❌ Export failed', 'error');
    } finally {
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
},

generateSalesPDF(salesData) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('Sales Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Farm: ${window.FarmModules.appData.profile.farmName}`, 105, 30, { align: 'center' });
        doc.text(`Period: ${new Date().getFullYear()}`, 105, 37, { align: 'center' });
        
        // Summary stats
        let yPos = 50;
        doc.setFontSize(14);
        doc.setTextColor(46, 125, 50);
        doc.text('Sales Summary', 20, yPos);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
        
        const totalSales = salesData.length;
        const totalRevenue = salesData.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
        const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        doc.text(`Total Sales: ${totalSales}`, 20, yPos);
        doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, yPos + 7);
        doc.text(`Average Sale: $${avgSale.toFixed(2)}`, 20, yPos + 14);
        
        // Monthly breakdown
        yPos += 30;
        const monthlySales = this.calculateMonthlySales(salesData);
        
        doc.setFontSize(14);
        doc.setTextColor(46, 125, 50);
        doc.text('Monthly Breakdown', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        monthlySales.forEach((month, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`${month.name}: $${month.amount.toFixed(2)} (${month.count} sales)`, 20, yPos);
            yPos += 7;
        });
        
        // Top customers
        yPos += 10;
        const topCustomers = this.getTopCustomers(salesData);
        
        if (topCustomers.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(46, 125, 50);
            doc.text('Top Customers', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            topCustomers.slice(0, 5).forEach((customer, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`${index + 1}. ${customer.name}: $${customer.total.toFixed(2)}`, 20, yPos);
                yPos += 7;
            });
        }
        
        // Save PDF
        const fileName = `Sales_Report_${window.FarmModules.appData.profile.farmName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Sales PDF generation error:', error);
        return { success: false, error: error.message };
    }
},

calculateMonthlySales(salesData) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyData = months.map((name, index) => ({
        name,
        amount: 0,
        count: 0
    }));
    
    salesData.forEach(sale => {
        const saleDate = new Date(sale.date || sale.createdAt || Date.now());
        const monthIndex = saleDate.getMonth();
        
        if (monthlyData[monthIndex]) {
            monthlyData[monthIndex].amount += parseFloat(sale.totalAmount) || 0;
            monthlyData[monthIndex].count += 1;
        }
    });
    
    return monthlyData;
},

getTopCustomers(salesData) {
    const customerMap = {};
    
    salesData.forEach(sale => {
        const customerName = sale.customerName || 'Walk-in Customer';
        if (!customerMap[customerName]) {
            customerMap[customerName] = {
                name: customerName,
                total: 0,
                count: 0
            };
        }
        customerMap[customerName].total += parseFloat(sale.totalAmount) || 0;
        customerMap[customerName].count += 1;
    });
    
    return Object.values(customerMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
},

exportCustomPDF() {
    const modal = document.createElement('div');
    modal.className = 'popout-modal';
    modal.innerHTML = `
        <div class="popout-modal-content" style="max-width: 500px;">
            <div class="popout-modal-header">
                <h3>⚙️ Custom Report</h3>
                <button class="popout-modal-close" id="close-custom-modal">&times;</button>
            </div>
            <div class="popout-modal-body">
                <div style="padding: 20px;">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Report Type</label>
                        <select id="report-type" class="form-input">
                            <option value="summary">Farm Summary</option>
                            <option value="financial">Financial Overview</option>
                            <option value="production">Production Report</option>
                            <option value="inventory">Inventory Analysis</option>
                            <option value="customer">Customer Report</option>
                        </select>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Date Range</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <input type="date" id="start-date" class="form-input" value="${new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]}">
                            <input type="date" id="end-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Include Sections</label>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="include-summary" checked>
                                <span>Summary</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="include-charts" checked>
                                <span>Charts</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="include-tables" checked>
                                <span>Data Tables</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="include-recommendations" checked>
                                <span>Recommendations</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label">Report Title</label>
                        <input type="text" id="report-title" class="form-input" value="${window.FarmModules.appData.profile.farmName} Report">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Include Executive Summary</h4>
                                <p>Add a summary page for management</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="executive-summary" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="popout-modal-footer">
                <button type="button" class="btn-outline" id="cancel-custom">Cancel</button>
                <button type="button" class="btn-primary" id="generate-custom">Generate Report</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-custom-modal')?.addEventListener('click', () => modal.remove());
    document.getElementById('cancel-custom')?.addEventListener('click', () => modal.remove());
    
    document.getElementById('generate-custom')?.addEventListener('click', () => {
        this.generateCustomReport();
        modal.remove();
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
},

// Custom Reports

generateCustomReport(reportType = 'profile') {
    try {
        this.showNotification(`Generating ${reportType} report...`, 'info');
        
        // Get data based on report type
        let pdfBlob;
        const pdfService = new PDFService();
        
        switch(reportType) {
            case 'profile':
                const userData = this.getCurrentUserData();
                const activityLog = this.getUserActivityLog();
                pdfBlob = pdfService.generateUserProfileReport(userData, activityLog);
                break;
                
            case 'team':
                const teamMembers = this.getTeamMembers();
                pdfBlob = pdfService.generateTeamReport(teamMembers);
                break;
                
            case 'activity':
                const activities = this.getRecentActivities();
                const filters = this.getReportFilters();
                pdfBlob = pdfService.generateActivityReport(activities, filters);
                break;
                
            default:
                throw new Error('Unknown report type');
        }
        
        // Generate filename
        const filename = this.generateReportFilename(reportType);
        
        // Download
        this.downloadPDF(pdfBlob, filename);
        
        this.showNotification(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`, 'success');
        
    } catch (error) {
        console.error('Report generation failed:', error);
        this.showNotification(`Failed to generate report: ${error.message}`, 'error');
    }
},

// Helper methods
getCurrentUserData() {
    // Replace with actual data fetching
    return {
        id: this.userProfile?.id,
        name: this.userProfile?.fullName || this.userProfile?.name,
        email: this.userProfile?.email,
        phone: this.userProfile?.phone,
        role: this.userProfile?.role,
        department: this.userProfile?.department,
        position: this.userProfile?.position,
        status: this.userProfile?.status || 'Active',
        createdAt: this.userProfile?.createdAt,
        lastLogin: this.userProfile?.lastLogin,
        loginCount: this.userProfile?.stats?.loginCount,
        documentsCount: this.userProfile?.stats?.documentsCreated,
        // Add more fields as needed
    };
},

    generateFarmSummaryPDF() {
    try {
        this.showNotification('Generating farm summary report...', 'info');
        
        // Get all data from cache
        const farmData = {
            profile: window.FarmModules.appData.profile || {},
            inventory: this.pdfDataCache.inventory || window.FarmModules.appData.inventory || [],
            orders: this.pdfDataCache.orders || window.FarmModules.appData.orders || [],
            customers: this.pdfDataCache.customers || window.FarmModules.appData.customers || [],
            products: this.pdfDataCache.products || window.FarmModules.appData.products || [],
            generatedAt: new Date().toISOString(),
            dataSources: Object.entries(this.pdfDataCache.lastUpdated).map(([key, value]) => ({
                module: key,
                lastUpdated: value
            }))
        };
        
        // Generate comprehensive PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title with broadcaster badge
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('FARM MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('COMPREHENSIVE REPORT', 105, 30, { align: 'center' });
        
        // Data source info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report combines data from ${farmData.dataSources.length} modules`, 105, 40, { align: 'center' });
        
        let yPos = 50;
        
        // Farm Profile
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('FARM PROFILE', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.text(`Farm Name: ${farmData.profile.farmName || 'Not set'}`, 20, yPos);
        yPos += 7;
        doc.text(`Farmer: ${farmData.profile.farmerName || 'Not set'}`, 20, yPos);
        yPos += 7;
        doc.text(`Farm Type: ${farmData.profile.farmType || 'Not set'}`, 20, yPos);
        yPos += 15;
        
        // Statistics Section
        doc.setFontSize(14);
        doc.text('SYSTEM STATISTICS', 20, yPos);
        yPos += 10;
        
        const stats = [
            [`Inventory Items:`, farmData.inventory.length],
            [`Total Orders:`, farmData.orders.length],
            [`Customers:`, farmData.customers.length],
            [`Products:`, farmData.products.length],
            [`Total Revenue:`, `$${farmData.orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0).toFixed(2)}`]
        ];
        
        doc.setFontSize(11);
        stats.forEach(([label, value]) => {
            doc.text(label, 20, yPos);
            doc.text(value.toString(), 100, yPos);
            yPos += 7;
        });
        
        yPos += 10;
        
        // Data Sources Section
        doc.setFontSize(14);
        doc.text('DATA SOURCES (via Data Broadcaster)', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        farmData.dataSources.forEach((source, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`• ${source.module}: ${new Date(source.lastUpdated).toLocaleString()}`, 25, yPos);
            yPos += 6;
        });
        
        // Save PDF
        const fileName = `Farm_Summary_${farmData.profile.farmName?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        // Broadcast PDF generation
        DataBroadcaster.recordCreated('profile', {
            action: 'pdf_export',
            reportType: 'farm_summary',
            fileName: fileName,
            modulesIncluded: farmData.dataSources.map(s => s.module),
            timestamp: new Date().toISOString()
        });
        
        this.showNotification('Farm summary report generated!', 'success');
        
    } catch (error) {
        console.error('Farm summary PDF error:', error);
        this.showNotification('Error generating farm summary', 'error');
    }
},
    
getUserActivityLog() {
    // Replace with actual activity data
    return this.userActivities || [
        {
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            type: 'Login',
            description: 'User logged into the system',
            ip: '192.168.1.1'
        },
        // Add more activities
    ];
},

getTeamMembers() {
    // Replace with actual team data
    return this.teamData || [
        {
            name: 'John Doe',
            role: 'Manager',
            department: 'Engineering',
            status: 'Active',
            lastActive: new Date(),
            performance: 'Excellent'
        },
        // Add more team members
    ];
},

getRecentActivities() {
    // Replace with actual activities
    return this.recentActivities || [];
},

getReportFilters() {
    return {
        dateRange: 'Last 30 days',
        user: this.userProfile?.name
    };
},

generateReportFilename(reportType) {
    const timestamp = new Date().toISOString().split('T')[0];
    const username = this.userProfile?.name?.replace(/\s+/g, '_') || 'user';
    
    const prefixes = {
        profile: 'User_Profile_Report',
        team: 'Team_Report',
        activity: 'Activity_Report'
    };
    
    return `${prefixes[reportType]}_${username}_${timestamp}.pdf`;
},

downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
},

// Add UI methods for report selection
showReportOptions() {
    // You can implement a modal or dropdown for report type selection
    const reportTypes = [
        { id: 'profile', label: 'Personal Profile Report', icon: '👤' },
        { id: 'team', label: 'Team Report', icon: '👥' },
        { id: 'activity', label: 'Activity Report', icon: '📊' }
    ];
    
    // Show selection UI (simplified example)
    const selected = prompt(
        'Select report type:\n1. Profile Report\n2. Team Report\n3. Activity Report\n\nEnter 1, 2, or 3:'
    );
    
    const typeMap = { '1': 'profile', '2': 'team', '3': 'activity' };
    if (typeMap[selected]) {
        this.generateCustomReport(typeMap[selected]);
    }
},

    // Add this method to ProfileModule:
setupPDFDataSync() {
    console.log('📡 Setting up PDF data sync from broadcaster...');
    
    // Listen for data changes from all modules
    document.addEventListener('farmDataChanged', (event) => {
        const { module, action, data } = event.detail;
        
        // Update our cache when data changes
        this.updatePDFDataCache(module, action, data);
        
        // Refresh PDF buttons if they exist
        this.refreshPDFData();
    });
    
    // Also listen for specific module updates
    window.addEventListener('inventory-updated', () => {
        this.updatePDFDataCache('inventory', 'update', window.FarmModules.appData.inventory);
    });
    
    window.addEventListener('orders-updated', () => {
        this.updatePDFDataCache('orders', 'update', window.FarmModules.appData.orders);
    });
    
    window.addEventListener('sales-updated', () => {
        this.updatePDFDataCache('sales', 'update', window.FarmModules.appData.orders); // sales are orders
    });
},

updatePDFDataCache(moduleName, action, data) {
    const now = new Date().toISOString();
    
    switch(moduleName) {
        case 'inventory':
        case 'inventory-check':
            this.pdfDataCache.inventory = window.FarmModules.appData.inventory || [];
            this.pdfDataCache.lastUpdated.inventory = now;
            break;
            
        case 'orders':
        case 'sales-record':
            this.pdfDataCache.orders = window.FarmModules.appData.orders || [];
            this.pdfDataCache.lastUpdated.orders = now;
            break;
            
        case 'customers':
            this.pdfDataCache.customers = window.FarmModules.appData.customers || [];
            this.pdfDataCache.lastUpdated.customers = now;
            break;
            
        case 'products':
        case 'production':
            this.pdfDataCache.products = window.FarmModules.appData.products || [];
            this.pdfDataCache.lastUpdated.products = now;
            break;
    }
    
    console.log(`📡 PDF cache updated for ${moduleName} (${action})`);
},

refreshPDFData() {
    // Update any PDF UI elements that show live data
    this.updatePDFStatus(`Data updated at ${new Date().toLocaleTimeString()}`, 'info');
}
};

// ==================== COMPLETE PDF SERVICE ====================
class PDFService {
    constructor() {
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF library is not loaded. Please include jsPDF in your project.');
        }
        this.doc = new jspdf.jsPDF();
        this.margin = 20;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.pageHeight = this.doc.internal.pageSize.height;
        this.currentY = this.margin;
        this.pageNumber = 1;
    }
    
    // ===== MAIN REPORT METHODS =====
    
    generateUserProfileReport(userData, activityLog = []) {
        this.doc = new jspdf.jsPDF();
        this.currentY = this.margin;
        this.pageNumber = 1;
        
        // Cover Page
        this.addCoverPage(userData);
        this.doc.addPage();
        this.pageNumber++;
        this.currentY = this.margin;
        
        // Table of Contents
        this.addTableOfContents();
        this.doc.addPage();
        this.pageNumber++;
        this.currentY = this.margin;
        
        // Personal Information
        this.addPersonalInfoSection(userData);
        this.addPageBreak();
        
        // Activity History
        this.addActivitySection(activityLog);
        this.addPageBreak();
        
        // Statistics
        this.addStatisticsSection(userData);
        
        // Footer on all pages
        this.addFooter();
        
        return this.doc.output('blob');
    }
    
    generateTeamReport(teamMembers = []) {
        this.doc = new jspdf.jsPDF('landscape');
        this.currentY = this.margin;
        
        // Title
        this.doc.setFontSize(24);
        this.doc.setFont("helvetica", "bold");
        this.doc.text('TEAM REPORT', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 25;
        
        // Generation info
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(`Generated: ${new Date().toLocaleString()}`, this.pageWidth - this.margin, this.currentY, { align: 'right' });
        this.currentY += 20;
        
        // Team Members Table
        this.addTeamTable(teamMembers);
        
        this.addFooter();
        return this.doc.output('blob');
    }
    
    generateActivityReport(activities = [], filters = {}) {
        this.doc = new jspdf.jsPDF();
        this.currentY = this.margin;
        
        // Title with filters
        this.doc.setFontSize(20);
        this.doc.setFont("helvetica", "bold");
        this.doc.text('ACTIVITY REPORT', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 15;
        
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "normal");
        
        // Show filters if any
        if (filters.dateRange) {
            this.doc.text(`Date Range: ${filters.dateRange}`, this.margin, this.currentY);
            this.currentY += 7;
        }
        if (filters.user) {
            this.doc.text(`User: ${filters.user}`, this.margin, this.currentY);
            this.currentY += 7;
        }
        
        this.currentY += 10;
        
        // Activities List
        this.addActivitiesList(activities);
        
        this.addFooter();
        return this.doc.output('blob');
    }
    
    // ===== SECTION BUILDERS =====
    
    addCoverPage(userData) {
        this.doc.setFillColor(41, 128, 185);
        this.doc.rect(0, 0, this.pageWidth, 100, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(32);
        this.doc.setFont("helvetica", "bold");
        this.doc.text('PROFILE REPORT', this.pageWidth / 2, 60, { align: 'center' });
        
        this.doc.setFontSize(18);
        this.doc.text(userData.name || 'User Profile', this.pageWidth / 2, 80, { align: 'center' });
        
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(14);
        this.doc.text('Confidential Document', this.pageWidth / 2, 150, { align: 'center' });
        
        this.doc.setFontSize(12);
        this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, 170, { align: 'center' });
    }
    
    addTableOfContents() {
        this.doc.setFontSize(18);
        this.doc.setFont("helvetica", "bold");
        this.doc.text('TABLE OF CONTENTS', this.margin, this.currentY);
        this.currentY += 20;
        
        const sections = [
            '1. Personal Information',
            '2. Activity History',
            '3. Statistics & Analytics',
            '4. Account Summary'
        ];
        
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "normal");
        
        sections.forEach(section => {
            this.doc.text(section, this.margin + 10, this.currentY);
            this.doc.text(`.......... ${this.pageNumber}`, this.pageWidth - this.margin - 20, this.currentY, { align: 'right' });
            this.currentY += 15;
        });
    }
    
    addPersonalInfoSection(userData) {
        this.addSectionHeader('Personal Information');
        
        const infoGroups = [
            {
                title: 'Basic Information',
                fields: [
                    ['Full Name', userData.fullName || userData.name || 'N/A'],
                    ['Email Address', userData.email || 'N/A'],
                    ['Phone Number', userData.phone || 'N/A'],
                    ['User ID', userData.id || userData.userId || 'N/A']
                ]
            },
            {
                title: 'Account Details',
                fields: [
                    ['Member Since', userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'],
                    ['Account Status', userData.status || 'Active'],
                    ['Last Login', userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never'],
                    ['User Role', userData.role || 'Standard User']
                ]
            },
            {
                title: 'Profile Information',
                fields: [
                    ['Department', userData.department || 'N/A'],
                    ['Position', userData.position || 'N/A'],
                    ['Location', userData.location || 'N/A'],
                    ['Employee ID', userData.employeeId || 'N/A']
                ]
            }
        ];
        
        infoGroups.forEach(group => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.pageNumber++;
                this.currentY = this.margin;
            }
            
            this.doc.setFontSize(14);
            this.doc.setFont("helvetica", "bold");
            this.doc.text(group.title, this.margin, this.currentY);
            this.currentY += 8;
            
            this.doc.setFontSize(11);
            this.doc.setFont("helvetica", "normal");
            
            group.fields.forEach(([label, value]) => {
                this.doc.setFont("helvetica", "bold");
                this.doc.text(`${label}:`, this.margin, this.currentY);
                this.doc.setFont("helvetica", "normal");
                this.doc.text(value, this.margin + 60, this.currentY);
                this.currentY += 7;
            });
            
            this.currentY += 10;
        });
    }
    
    addActivitySection(activities = []) {
        this.addSectionHeader('Activity History');
        
        if (activities.length === 0) {
            this.doc.setFontSize(11);
            this.doc.text('No activity recorded', this.margin, this.currentY);
            this.currentY += 15;
            return;
        }
        
        // Activity Table Headers
        const headers = [['Date', 'Time', 'Activity Type', 'Description', 'IP Address']];
        const rows = activities.slice(0, 50).map(activity => [
            activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A',
            activity.time || 'N/A',
            activity.type || 'Unknown',
            activity.description || 'No description',
            activity.ip || 'N/A'
        ]);
        
        this.addTable(headers.concat(rows), [30, 25, 40, 80, 40]);
    }
    
    addStatisticsSection(userData) {
        this.addSectionHeader('Statistics & Analytics');
        
        const stats = [
            ['Total Logins', userData.loginCount || '0'],
            ['Documents Created', userData.documentsCount || '0'],
            ['Tasks Completed', userData.tasksCompleted || '0'],
            ['Team Members', userData.teamSize || '1'],
            ['Avg. Session Time', userData.avgSessionTime || 'N/A'],
            ['Last Active', userData.lastActive || 'N/A']
        ];
        
        // Simple bar chart visualization
        this.doc.setFontSize(11);
        stats.forEach(([label, value], index) => {
            const y = this.currentY + (index * 15);
            this.doc.text(label, this.margin, y);
            
            // Draw a simple bar
            const barWidth = Math.min(parseInt(value) * 2, 100);
            this.doc.setFillColor(52, 152, 219);
            this.doc.rect(this.margin + 60, y - 4, barWidth, 6, 'F');
            
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(value.toString(), this.margin + 65, y);
            this.doc.setTextColor(0, 0, 0);
        });
        
        this.currentY += (stats.length * 15) + 20;
    }
    
    addTeamTable(teamMembers) {
        const headers = [['Name', 'Role', 'Department', 'Status', 'Last Active', 'Performance']];
        const rows = teamMembers.map(member => [
            member.name,
            member.role,
            member.department,
            member.status,
            member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never',
            member.performance || 'N/A'
        ]);
        
        this.addTable(headers.concat(rows), [40, 35, 40, 30, 40, 35]);
    }
    
    addActivitiesList(activities) {
        this.doc.setFontSize(12);
        
        activities.forEach((activity, index) => {
            if (this.currentY > 270) {
                this.doc.addPage();
                this.pageNumber++;
                this.currentY = this.margin;
                this.addFooter();
            }
            
            // Activity item with icon
            this.doc.setFont("helvetica", "bold");
            this.doc.text('•', this.margin, this.currentY);
            this.doc.text(activity.title || 'Activity', this.margin + 10, this.currentY);
            
            this.doc.setFont("helvetica", "normal");
            this.doc.setFontSize(10);
            this.doc.text(activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A', 
                         this.pageWidth - this.margin, this.currentY, { align: 'right' });
            
            this.currentY += 6;
            
            if (activity.description) {
                this.doc.text(activity.description, this.margin + 10, this.currentY);
                this.currentY += 6;
            }
            
            this.currentY += 10;
        });
    }
    
    // ===== HELPER METHODS =====
    
    addSectionHeader(title) {
        if (this.currentY > 250) {
            this.doc.addPage();
            this.pageNumber++;
            this.currentY = this.margin;
        }
        
        this.doc.setFontSize(16);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(41, 128, 185);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 12;
        
        // Underline
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY - 2, this.margin + 100, this.currentY - 2);
        this.currentY += 8;
        
        this.doc.setTextColor(0, 0, 0);
    }
    
    addTable(data, columnWidths) {
        const startY = this.currentY;
        const tableTop = startY + 10;
        
        // Draw headers
        this.doc.setFillColor(41, 128, 185);
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "bold");
        
        let xPos = this.margin;
        data[0].forEach((header, i) => {
            this.doc.rect(xPos, tableTop - 8, columnWidths[i], 10, 'F');
            this.doc.text(header, xPos + 5, tableTop);
            xPos += columnWidths[i];
        });
        
        // Draw rows
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont("helvetica", "normal");
        
        data.slice(1).forEach((row, rowIndex) => {
            xPos = this.margin;
            const yPos = tableTop + 10 + (rowIndex * 10);
            
            // Alternate row colors
            if (rowIndex % 2 === 0) {
                this.doc.setFillColor(245, 245, 245);
                this.doc.rect(this.margin, yPos - 4, columnWidths.reduce((a, b) => a + b, 0), 10, 'F');
            }
            
            row.forEach((cell, cellIndex) => {
                this.doc.text(cell.toString(), xPos + 5, yPos);
                xPos += columnWidths[cellIndex];
            });
            
            this.currentY = yPos + 10;
        });
        
        this.currentY += 20;
    }
    
    addPageBreak() {
        this.doc.addPage();
        this.pageNumber++;
        this.currentY = this.margin;
    }
    
    addFooter() {
        const totalPages = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);
            
            // Page number
            this.doc.setFontSize(10);
            this.doc.setTextColor(128, 128, 128);
            this.doc.text(
                `Page ${i} of ${totalPages}`,
                this.pageWidth - this.margin,
                this.pageHeight - 10,
                { align: 'right' }
            );
            
            // Confidential watermark
            this.doc.setFontSize(8);
            this.doc.text(
                'CONFIDENTIAL',
                this.pageWidth / 2,
                this.pageHeight - 10,
                { align: 'center' }
            );
            
            // Generated date
            this.doc.text(
                `Generated: ${new Date().toLocaleDateString()}`,
                this.margin,
                this.pageHeight - 10
            );
        }
    }
}

// ==================== AUTO-REGISTRATION WITH BOTH NAMES ====================
if (typeof ProfileModule !== 'undefined') {
    (function() {
        if (window.FarmModules) {
            // Register as 'profile' (main name)
            window.FarmModules.registerModule('profile', ProfileModule);
            
            // Also register as 'profile.js' for compatibility
            window.FarmModules.registerModule('profile.js', ProfileModule);
            
            console.log('✅ Profile module registered with both names: "profile" and "profile.js"');
        }
    })();
}

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'profile';
    const MODULE_OBJECT = ProfileModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module with Data Broadcaster...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
