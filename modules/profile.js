// modules/profile.js - COMPLETE WITH ALL IMPLEMENTATIONS
console.log('Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    currentInputValues: {},

    initialize() {
        console.log('👤 Initializing profile...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            this.registerWithStyleManager();
        }
        
        this.renderModule();
        this.initialized = true;
        
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

    // STYLEMANAGER INTEGRATION
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

    // SYNC WITH OTHER MODULES FOR REAL-TIME STATS
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

    // ENHANCED INVENTORY STATS SYNC
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

    // UPDATE STATS FROM OTHER MODULES
    updateStatsFromModules() {
        const stats = window.FarmModules.appData.profile.dashboardStats || {};
        
        // Get inventory stats
        this.syncInventoryStats();
        
        window.FarmModules.appData.profile.dashboardStats = stats;
    },

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
    },

    // TRACK USER INPUT IN REAL-TIME
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
    },

    // FORM VALIDATION
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

    // SAVE USER INPUT TO PREVENT LOSS
    saveUserInput(elementId, value) {
        this.currentInputValues[elementId] = value;
    },

    // RESTORE USER INPUT AFTER RENDER
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

    // USER PERSISTENCE METHODS
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
                    this.handleFirebaseError(error);
                });
        }
    },

    // THEME MANAGEMENT
    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.applyTheme(theme);
            this.saveSetting('theme', theme);
            this.showNotification(`Theme changed to ${theme}`, 'success');
        }
    },

    // BACKUP & RESTORE FUNCTIONALITY
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
                    
                    // Validate backup file
                    if (!backupData.appData || !backupData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    if (confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
                        window.FarmModules.appData = backupData.appData;
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
                // Check localStorage for backups
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

    // IMPORT DATA FUNCTIONALITY
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

    // FIREBASE METHODS
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

    // FIREBASE ERROR HANDLING
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

    // LOCAL STORAGE METHODS
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

    // DATA MANAGEMENT METHODS
    async saveProfile() {
        try {
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

            this.updateAllDisplays();
            this.showNotification('Profile saved successfully!', 'success');
            
            // Clear current input values after successful save
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
                    
                    // Clear dashboard stats
                    if (window.FarmModules.appData.profile.dashboardStats) {
                        window.FarmModules.appData.profile.dashboardStats = {};
                    }
                    
                    // Clear current input values
                    this.currentInputValues = {};
                    
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

    async handleLogout() {
        const rememberUser = window.FarmModules.appData.profile?.rememberUser;
        
        if (confirm('Are you sure you want to logout?' + (rememberUser ? '\n\nYou have "Remember Me" enabled. You will stay logged in on this device unless you clear browser data.' : ''))) {
            try {
                // Sign out from Firebase
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    await firebase.auth().signOut();
                }
                
                // Only clear local data if "Remember Me" is disabled
                if (!rememberUser) {
                    localStorage.removeItem('farm-user');
                    localStorage.removeItem('farm-orders');
                    localStorage.removeItem('farm-inventory');
                    localStorage.removeItem('farm-customers');
                    localStorage.removeItem('farm-products');
                    localStorage.removeItem('farm-profile');
                    // Clear current input values
                    this.currentInputValues = {};
                }
                
                // Reset app data (but keep profile settings if remembering user)
                if (!rememberUser) {
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
                
                this.showNotification(rememberUser ? 
                    'Logged out (data saved for next login)' : 
                    'Logged out successfully', 'success');
                
                // Redirect to login page or reload
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
            }
        }
    },

    // DISPLAY METHODS
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

    // NOTIFICATION SYSTEM
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

    // UTILITY METHODS
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
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
}

console.log('✅ Profile module registered with ALL implementations');
