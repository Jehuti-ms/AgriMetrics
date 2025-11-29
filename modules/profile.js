// modules/profile.js - UPDATED WITH SHARED DATA PATTERN & LOGOUT
console.log('Loading profile module...');

FarmModules.registerModule('profile', {
    name: 'Profile',
    icon: '👤',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Farm Profile</h1>
                <p>Manage your farm information and settings</p>
            </div>

            <div class="profile-content">
                <!-- Farm Stats Overview -->
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <h3>Total Revenue</h3>
                            <div class="stat-value" id="total-revenue">$0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-content">
                            <h3>Inventory Items</h3>
                            <div class="stat-value" id="total-inventory">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-content">
                            <h3>Total Orders</h3>
                            <div class="stat-value" id="total-orders">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <h3>Customers</h3>
                            <div class="stat-value" id="total-customers">0</div>
                        </div>
                    </div>
                </div>

                <div class="profile-card card">
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

                <div class="profile-details card">
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
                                    <option value="poultry">Poultry Farm</option>
                                    <option value="crop">Crop Farm</option>
                                    <option value="livestock">Livestock Farm</option>
                                    <option value="dairy">Dairy Farm</option>
                                    <option value="mixed">Mixed Farming</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="farm-location">Farm Location</label>
                                <input type="text" id="farm-location" placeholder="Enter farm location">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">💾 Save Profile</button>
                            <button type="button" class="btn btn-secondary" id="sync-now-btn">🔄 Sync Now</button>
                            <button type="button" class="btn btn-text" id="reset-profile">Reset to Current</button>
                        </div>
                    </form>
                </div>

                <div class="settings-section card">
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

                <div class="data-management card">
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
                        <button class="btn btn-secondary" id="export-data">📥 Export All Data</button>
                        <button class="btn btn-danger" id="clear-all-data">⚠️ Clear All Data</button>
                        <!-- ADD LOGOUT BUTTON -->
                        <button class="btn btn-text" id="logout-btn" style="color: #ef4444; border-color: #ef4444;">🚪 Logout</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .profile-content {
            max-width: 900px;
            margin: 0 auto;
        }

        .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .stat-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .stat-icon {
            font-size: 2rem;
            opacity: 0.8;
        }

        .stat-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .profile-card {
            margin-bottom: 1.5rem;
        }

        .profile-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--primary-light);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-icon {
            font-size: 2.5rem;
        }

        .profile-info h2 {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
        }

        .profile-info p {
            margin: 0.25rem 0;
            color: var(--text-muted);
        }

        .profile-stats {
            margin-top: 0.5rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .stat-badge {
            background: var(--bg-color);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            color: var(--text-muted);
            border: 1px solid var(--border-color);
        }

        .profile-details, .settings-section, .data-management {
            margin-bottom: 1.5rem;
        }

        .settings-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .setting-item:last-child {
            border-bottom: none;
        }

        .setting-info h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
        }

        .setting-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .setting-control {
            min-width: 150px;
        }

        .setting-unit {
            margin-left: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .data-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: var(--bg-color);
            border-radius: 8px;
        }

        .data-stat {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
        }

        .data-stat label {
            font-weight: 500;
            color: var(--text-muted);
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }

        /* Switch styles */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--border-color);
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--primary-color);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }
    `,

    initialize: function() {
        console.log('Profile module initializing...');
        
        this.loadUserData();
        this.attachEventListeners();
        this.updateAllDisplays();
    },

    async loadUserData() {
        try {
            const currentUser = this.getCurrentUser();
            
            // Initialize profile data structure
            if (!FarmModules.appData.profile) {
                FarmModules.appData.profile = {
                    farmName: FarmModules.appData.farmName || 'My Farm',
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
            if (!FarmModules.appData.profile.dashboardStats) {
                FarmModules.appData.profile.dashboardStats = {};
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
                    FarmModules.appData.profile = {
                        ...FarmModules.appData.profile,
                        ...firebaseData,
                        memberSince: FarmModules.appData.profile.memberSince || firebaseData.memberSince
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
                    ...FarmModules.appData.profile,
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

    updateAllDisplays: function() {
        this.updateProfileInfo();
        this.updateStatsOverview();
        this.updateDataManagement();
        this.updateSettings();
    },

    updateProfileInfo: function() {
        const profile = FarmModules.appData.profile;
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

    updateStatsOverview: function() {
        // Get stats from shared dashboard data
        const dashboardStats = FarmModules.appData.profile.dashboardStats || {};
        
        const totalRevenue = dashboardStats.totalRevenue || 
                           dashboardStats.totalIncome || 
                           FarmModules.appData.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
        
        const totalOrders = dashboardStats.totalOrders || FarmModules.appData.orders?.length || 0;
        const totalInventory = dashboardStats.totalInventoryItems || FarmModules.appData.inventory?.length || 0;
        const totalCustomers = dashboardStats.totalCustomers || FarmModules.appData.customers?.length || 0;
        
        this.updateElement('total-revenue', this.formatCurrency(totalRevenue));
        this.updateElement('total-orders', totalOrders);
        this.updateElement('total-inventory', totalInventory);
        this.updateElement('total-customers', totalCustomers);
        
        const totalEntries = totalOrders + totalInventory + totalCustomers;
        this.updateElement('data-entries', `Data entries: ${totalEntries}`);
    },

    updateDataManagement: function() {
        const orders = FarmModules.appData.orders || [];
        const inventory = FarmModules.appData.inventory || [];
        const customers = FarmModules.appData.customers || [];
        
        this.updateElement('orders-count', `${orders.length} records`);
        this.updateElement('inventory-count', `${inventory.length} items`);
        this.updateElement('customers-count', `${customers.length} customers`);
    },

    updateSettings: function() {
        const profile = FarmModules.appData.profile;
        
        this.setValue('default-currency', profile.currency || 'USD');
        this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        this.setChecked('auto-sync', profile.autoSync !== false);
    },

    attachEventListeners: function() {
        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Sync now button
        const syncBtn = document.getElementById('sync-now-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.syncNow();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-profile');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.updateAllDisplays();
                this.showNotification('Profile form reset to current values', 'info');
            });
        }

        // Settings changes
        const currencySelect = document.getElementById('default-currency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.saveSetting('currency', currencySelect.value);
            });
        }

        const thresholdInput = document.getElementById('low-stock-threshold');
        if (thresholdInput) {
            thresholdInput.addEventListener('change', () => {
                this.saveSetting('lowStockThreshold', parseInt(thresholdInput.value));
            });
        }

        const autoSyncCheckbox = document.getElementById('auto-sync');
        if (autoSyncCheckbox) {
            autoSyncCheckbox.addEventListener('change', () => {
                this.saveSetting('autoSync', autoSyncCheckbox.checked);
            });
        }

        // Data management
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const clearAllBtn = document.getElementById('clear-all-data');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // ADDED: Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    },

    async saveProfile() {
        const profile = FarmModules.appData.profile;
        
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');
        profile.farmType = this.getValue('farm-type');
        profile.farmLocation = this.getValue('farm-location');

        FarmModules.appData.farmName = profile.farmName;

        // Auto-save to Firebase if enabled
        if (profile.autoSync) {
            await this.saveToFirebase();
        }

        this.updateAllDisplays();
        this.showNotification('Profile saved successfully!', 'success');
    },

    async saveSetting(setting, value) {
        FarmModules.appData.profile[setting] = value;
        
        // Auto-save to Firebase if enabled
        if (FarmModules.appData.profile.autoSync) {
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

    exportData: function() {
        const dataStr = JSON.stringify(FarmModules.appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('All farm data exported successfully!', 'success');
    },

    clearAllData: function() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including orders, inventory, and customers. This cannot be undone!')) {
            FarmModules.appData.orders = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.customers = [];
            FarmModules.appData.products = [];
            
            // Clear dashboard stats
            if (FarmModules.appData.profile.dashboardStats) {
                FarmModules.appData.profile.dashboardStats = {};
            }
            
            this.showNotification('All data cleared successfully', 'success');
            this.updateAllDisplays();
        }
    },

    // ADDED: Logout handler
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
                FarmModules.appData = {
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

    formatCurrency: function(amount) {
        const currency = FarmModules.appData.profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    getValue: function(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    setValue: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    },

    setChecked: function(id, checked) {
        const element = document.getElementById(id);
        if (element) element.checked = !!checked;
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    getCurrentUser: function() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        return null;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});

console.log('✅ Profile module registered');
