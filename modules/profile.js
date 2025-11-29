// modules/profile.js
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
                            <h3>Total Transactions</h3>
                            <div class="stat-value" id="total-transactions">0</div>
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
                        <div class="stat-icon">🌾</div>
                        <div class="stat-content">
                            <h3>Feed Records</h3>
                            <div class="stat-value" id="total-feed-records">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <h3>Farm Value</h3>
                            <div class="stat-value" id="farm-value">$0</div>
                        </div>
                    </div>
                </div>

                <div class="profile-card card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <span class="avatar-icon">🚜</span>
                        </div>
                        <div class="profile-info">
                            <h2 id="profile-farm-name">Loading...</h2>
                            <p id="profile-farmer-name">Loading...</p>
                            <p class="profile-email" id="profile-email">Loading...</p>
                            <div class="profile-stats">
                                <span class="stat-badge" id="member-since">Member since: Loading...</span>
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
                                <label for="farm-size">Farm Size (acres)</label>
                                <input type="number" id="farm-size" placeholder="e.g., 100" min="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="farm-location">Farm Location</label>
                            <input type="text" id="farm-location" placeholder="Enter farm location">
                        </div>
                        <div class="form-group">
                            <label for="farm-description">Farm Description</label>
                            <textarea id="farm-description" placeholder="Describe your farm..." rows="3"></textarea>
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
                                <h4>Theme Preference</h4>
                                <p>Choose your preferred theme</p>
                            </div>
                            <select id="theme-preference" class="setting-control">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto (System)</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Default Currency</h4>
                                <p>Set your preferred currency for financial records</p>
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
                                <h4>Auto-backup Data</h4>
                                <p>Automatically backup your farm data</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="auto-backup" checked>
                                <span class="slider"></span>
                            </label>
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
                            <label>Transactions:</label>
                            <span id="transactions-count">0 records</span>
                        </div>
                        <div class="data-stat">
                            <label>Inventory:</label>
                            <span id="inventory-count">0 items</span>
                        </div>
                        <div class="data-stat">
                            <label>Feed Records:</label>
                            <span id="feed-records-count">0 entries</span>
                        </div>
                        <div class="data-stat">
                            <label>Total Data:</label>
                            <span id="total-data-size">0 KB</span>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="export-data">📥 Export All Data</button>
                        <button class="btn btn-warning" id="clear-transactions">🗑️ Clear Transactions</button>
                        <button class="btn btn-danger" id="clear-all-data">⚠️ Clear All Data</button>
                    </div>
                </div>

                <div class="account-actions card">
                    <h3>Account</h3>
                    <div class="action-buttons">
                        ${window.app && window.app.isDemoMode ? 
                            '<button class="btn btn-primary" id="demo-login">🔐 Switch to Real Account</button>' : 
                            '<button class="btn btn-secondary" id="logout-profile">🚪 Logout</button>'
                        }
                        <button class="btn btn-text" id="refresh-data">🔄 Refresh Data</button>
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

        .profile-details, .settings-section, .data-management, .account-actions {
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
                    farmerName: currentUser?.displayName || 'Farmer',
                    email: currentUser?.email || 'No email',
                    farmType: '',
                    farmSize: '',
                    farmLocation: '',
                    farmDescription: '',
                    currency: 'USD',
                    lowStockThreshold: 10,
                    autoBackup: true,
                    autoSync: true,
                    theme: 'auto',
                    memberSince: new Date().toISOString(),
                    lastSync: null,
                    preferences: {
                        notifications: true,
                        language: 'en'
                    }
                };
            }

            // Try to load from Firebase
            await this.loadFromFirebase();
            
            // Apply theme preference
            this.applyThemePreference(FarmModules.appData.profile.theme);
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    async loadFromFirebase() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) return;

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
                        // Don't override memberSince if it already exists
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
            if (!currentUser || !currentUser.uid) return;

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
        
        // Use actual user data instead of hardcoded values
        const farmName = profile.farmName || currentUser?.farmName || 'My Farm';
        const farmerName = profile.farmerName || currentUser?.displayName || 'Farmer';
        const email = profile.email || currentUser?.email || 'No email';
        
        this.updateElement('profile-farm-name', farmName);
        this.updateElement('profile-farmer-name', farmerName);
        this.updateElement('profile-email', email);
        
        // Update form with current data
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        this.setValue('farm-type', profile.farmType);
        this.setValue('farm-size', profile.farmSize);
        this.setValue('farm-location', profile.farmLocation);
        this.setValue('farm-description', profile.farmDescription);
        
        // Member since
        const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
        this.updateElement('member-since', `Member since: ${memberSince}`);
    },

    updateStatsOverview: function() {
        // Real data from other modules
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        // Calculate farm value (inventory value + sales revenue)
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
        const salesRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const farmValue = inventoryValue + salesRevenue;
        
        this.updateElement('total-transactions', sales.length);
        this.updateElement('total-inventory', inventory.length);
        this.updateElement('total-feed-records', feedRecords.length);
        this.updateElement('farm-value', this.formatCurrency(farmValue));
        
        // Update data entries count
        const totalEntries = sales.length + inventory.length + feedRecords.length;
        this.updateElement('data-entries', `Data entries: ${totalEntries}`);
    },

    updateDataManagement: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        this.updateElement('transactions-count', `${sales.length} records`);
        this.updateElement('inventory-count', `${inventory.length} items`);
        this.updateElement('feed-records-count', `${feedRecords.length} entries`);
        
        // Calculate approximate data size
        const dataSize = JSON.stringify(FarmModules.appData).length;
        const sizeInKB = (dataSize / 1024).toFixed(2);
        this.updateElement('total-data-size', `${sizeInKB} KB`);
    },

    updateSettings: function() {
        const profile = FarmModules.appData.profile;
        
        this.setValue('default-currency', profile.currency || 'USD');
        this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        this.setValue('theme-preference', profile.theme || 'auto');
        this.setChecked('auto-backup', profile.autoBackup !== false);
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

        // Settings changes with auto-save
        this.attachSettingListeners();

        // Data management
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const clearTransBtn = document.getElementById('clear-transactions');
        if (clearTransBtn) {
            clearTransBtn.addEventListener('click', () => {
                this.clearTransactions();
            });
        }

        const clearAllBtn = document.getElementById('clear-all-data');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // Account actions
        const logoutBtn = document.getElementById('logout-profile');
        const demoLoginBtn = document.getElementById('demo-login');
        const refreshBtn = document.getElementById('refresh-data');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', () => {
                this.showNotification('Real account features coming soon!', 'info');
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateAllDisplays();
                this.showNotification('Data refreshed', 'success');
            });
        }
    },

    attachSettingListeners() {
        // Auto-save settings with debounce
        const settings = [
            { id: 'default-currency', key: 'currency' },
            { id: 'low-stock-threshold', key: 'lowStockThreshold', transform: parseInt },
            { id: 'theme-preference', key: 'theme' },
            { id: 'auto-backup', key: 'autoBackup', type: 'checkbox' },
            { id: 'auto-sync', key: 'autoSync', type: 'checkbox' }
        ];

        settings.forEach(setting => {
            const element = document.getElementById(setting.id);
            if (element) {
                if (setting.type === 'checkbox') {
                    element.addEventListener('change', this.debounce(() => {
                        this.saveSetting(setting.key, element.checked);
                    }, 500));
                } else {
                    element.addEventListener('change', this.debounce(() => {
                        let value = element.value;
                        if (setting.transform) {
                            value = setting.transform(value);
                        }
                        this.saveSetting(setting.key, value);
                    }, 500));
                }
            }
        });
    },

    async saveProfile() {
        const profile = FarmModules.appData.profile;
        
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');
        profile.farmType = this.getValue('farm-type');
        profile.farmSize = this.getValue('farm-size');
        profile.farmLocation = this.getValue('farm-location');
        profile.farmDescription = this.getValue('farm-description');

        // Also update main app data
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
        
        // Special handling for theme changes
        if (setting === 'theme') {
            this.applyThemePreference(value);
        }
        
        // Auto-save to Firebase if enabled
        if (FarmModules.appData.profile.autoSync) {
            await this.saveToFirebase();
        }
        
        this.showNotification('Setting updated', 'info');
    },

    applyThemePreference(theme) {
        const body = document.body;
        body.classList.remove('dark-mode', 'light-mode');
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            // Auto mode - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
            }
        }
        
        // Update dark mode toggle icon if it exists
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('span:first-child');
            const label = darkModeToggle.querySelector('.nav-label');
            const isDarkMode = body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                icon.textContent = '☀️';
                label.textContent = 'Light';
            } else {
                icon.textContent = '🌙';
                label.textContent = 'Dark';
            }
        }
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

    logout: function() {
        if (confirm('Are you sure you want to log out?')) {
            console.log('🚪 Logging out...');
            
            // Try Firebase logout first
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    this.handleLogoutSuccess();
                }).catch(error => {
                    console.error('Firebase logout error:', error);
                    this.handleLogoutSuccess();
                });
            } else {
                this.handleLogoutSuccess();
            }
        }
    },

    handleLogoutSuccess: function() {
        // Clear app data
        FarmModules.appData = {};
        
        // Show logout message
        this.showNotification('You have been logged out successfully', 'success');
        
        // Redirect to login or reload page
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
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

    clearTransactions: function() {
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            FarmModules.appData.sales = [];
            this.showNotification('All transactions cleared', 'success');
            this.updateAllDisplays();
        }
    },

    clearAllData: function() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including sales, inventory, and feed records. This cannot be undone!')) {
            FarmModules.appData.sales = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.feedRecords = [];
            
            this.showNotification('All data cleared successfully', 'success');
            this.updateAllDisplays();
        }
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: FarmModules.appData.profile?.currency || 'USD'
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
        // Try to get user from Firebase auth
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        
        // Fallback to auth module
        if (window.authModule?.getCurrentUser) {
            return window.authModule.getCurrentUser();
        }
        
        return null;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
