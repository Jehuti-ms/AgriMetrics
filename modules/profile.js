// modules/profile.js - UPDATED TO FOLLOW StyleManager PATTERN
console.log('Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,

    initialize() {
        console.log('👤 Initializing profile...');
        
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
        console.log(`Profile module: Theme changed to ${theme}`);
        // Re-render or update styles when theme changes
        if (this.initialized) {
            this.renderModule();
        }
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
                                    <label for="farm-name">Farm Name</label>
                                    <input type="text" id="farm-name" placeholder="Enter farm name" required>
                                </div>
                                <div class="form-group">
                                    <label for="farmer-name">Farmer Name</label>
                                    <input type="text" id="farmer-name" placeholder="Enter your name" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-type">Farm Type</label>
                                    <select id="farm-type">
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
                                    <label for="farm-location">Farm Location</label>
                                    <input type="text" id="farm-location" placeholder="Enter farm location">
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
                        </div>
                        <div class="action-buttons">
                            <button class="btn-secondary" id="export-data">📥 Export All Data</button>
                            <button class="btn-danger" id="clear-all-data">⚠️ Clear All Data</button>
                            <button class="btn-outline" id="logout-btn" style="color: #ef4444; border-color: #ef4444;">🚪 Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadUserData();
        this.setupEventListeners();
        this.updateAllDisplays();
    },

    setupEventListeners() {
        // Profile form
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
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
            this.saveSetting('currency', e.target.value);
        });

        document.getElementById('low-stock-threshold')?.addEventListener('change', (e) => {
            this.saveSetting('lowStockThreshold', parseInt(e.target.value));
        });

        document.getElementById('auto-sync')?.addEventListener('change', (e) => {
            this.saveSetting('autoSync', e.target.checked);
        });

        // Data management
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            this.clearAllData();
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
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
                    memberSince: new Date().toISOString(),
                    lastSync: null
                };
            }

            // Initialize dashboard stats if not exists
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }

            // Try to load from Firebase
            await this.loadFromFirebase();
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    async loadFromFirebase() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                this.updateSyncStatus('🔒 Login to sync');
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
                    uid: currentUser.uid
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
            return false;
        }
    },

    updateSyncStatus(status) {
        const syncElement = document.getElementById('sync-status');
        if (syncElement) {
            syncElement.textContent = status;
        }
    },

    updateAllDisplays() {
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
        
        // Update form with current data
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        this.setValue('farm-type', profile.farmType);
        this.setValue('farm-location', profile.farmLocation);
        
        // Member since
        const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
        this.updateElement('member-since', `Member since: ${memberSince}`);
    },

    updateStatsOverview() {
        // Get stats from shared dashboard data
        const dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
        
        const totalRevenue = dashboardStats.totalRevenue || 
                           dashboardStats.totalIncome || 
                           window.FarmModules.appData.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
        
        const totalOrders = dashboardStats.totalOrders || window.FarmModules.appData.orders?.length || 0;
        const totalInventory = dashboardStats.totalInventoryItems || window.FarmModules.appData.inventory?.length || 0;
        const totalCustomers = dashboardStats.totalCustomers || window.FarmModules.appData.customers?.length || 0;
        
        this.updateElement('total-revenue', this.formatCurrency(totalRevenue));
        this.updateElement('total-orders', totalOrders);
        this.updateElement('total-inventory', totalInventory);
        this.updateElement('total-customers', totalCustomers);
        
        const totalEntries = totalOrders + totalInventory + totalCustomers;
        this.updateElement('data-entries', `Data entries: ${totalEntries}`);
    },

    updateDataManagement() {
        const orders = window.FarmModules.appData.orders || [];
        const inventory = window.FarmModules.appData.inventory || [];
        const customers = window.FarmModules.appData.customers || [];
        
        this.updateElement('orders-count', `${orders.length} records`);
        this.updateElement('inventory-count', `${inventory.length} items`);
        this.updateElement('customers-count', `${customers.length} customers`);
    },

    updateSettings() {
        const profile = window.FarmModules.appData.profile;
        
        this.setValue('default-currency', profile.currency || 'USD');
        this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        this.setChecked('auto-sync', profile.autoSync !== false);
    },

    async saveProfile() {
        const profile = window.FarmModules.appData.profile;
        
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');
        profile.farmType = this.getValue('farm-type');
        profile.farmLocation = this.getValue('farm-location');

        window.FarmModules.appData.farmName = profile.farmName;

        // Auto-save to Firebase if enabled
        if (profile.autoSync) {
            await this.saveToFirebase();
        }

        this.updateAllDisplays();
        this.showNotification('Profile saved successfully!', 'success');
    },

    async saveSetting(setting, value) {
        window.FarmModules.appData.profile[setting] = value;
        
        // Auto-save to Firebase if enabled
        if (window.FarmModules.appData.profile.autoSync) {
            await this.saveToFirebase();
        }
        
        this.showNotification('Setting updated', 'info');
    },

    async syncNow() {
        this.updateSyncStatus('🔄 Syncing...');
        const success = await this.saveToFirebase();
        
        if (success) {
            this.showNotification('Data synced with cloud!', 'success');
        } else {
            this.showNotification('Sync failed. Check your connection.', 'error');
        }
    },

    exportData() {
        const dataStr = JSON.stringify(window.FarmModules.appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('All farm data exported successfully!', 'success');
    },

    clearAllData() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including orders, inventory, and customers. This cannot be undone!')) {
            window.FarmModules.appData.orders = [];
            window.FarmModules.appData.inventory = [];
            window.FarmModules.appData.customers = [];
            window.FarmModules.appData.products = [];
            
            // Clear dashboard stats
            if (window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            this.showNotification('All data cleared successfully', 'success');
            this.updateAllDisplays();
        }
    },

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                // Sign out from Firebase
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    await firebase.auth().signOut();
                }
                
                // Clear local data
                localStorage.removeItem('farm-user');
                localStorage.removeItem('farm-orders');
                localStorage.removeItem('farm-inventory');
                localStorage.removeItem('farm-customers');
                localStorage.removeItem('farm-products');
                
                // Reset app data
                window.FarmModules.appData = {
                    profile: {
                        farmName: 'My Farm',
                        farmerName: 'Farm Manager',
                        farmType: 'poultry',
                        currency: 'USD',
                        lowStockThreshold: 10,
                        autoSync: true,
                        memberSince: new Date().toISOString()
                    },
                    orders: [],
                    inventory: [],
                    customers: [],
                    products: []
                };
                
                this.showNotification('Logged out successfully', 'success');
                
                // Redirect to login page or reload
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
            }
        }
    },

    formatCurrency(amount) {
        const currency = window.FarmModules.appData.profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    },

    setChecked(id, checked) {
        const element = document.getElementById(id);
        if (element) element.checked = !!checked;
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    getCurrentUser() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        return null;
    },

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
}

console.log('✅ Profile module registered');
