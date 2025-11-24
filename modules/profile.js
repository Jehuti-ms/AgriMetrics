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
                            <button type="submit" class="btn btn-primary">Save Profile</button>
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
        this.loadRealData();
        this.attachEventListeners();
        this.updateAllDisplays();
    },

    loadRealData: function() {
        // Initialize profile with real data from app
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {
                farmName: FarmModules.appData.farmName || 'My Farm',
                farmerName: FarmModules.appData.user?.displayName || 'Farmer',
                email: FarmModules.appData.user?.email || 'No email',
                farmType: '',
                farmSize: '',
                farmLocation: '',
                farmDescription: '',
                currency: 'USD',
                lowStockThreshold: 10,
                autoBackup: true,
                memberSince: new Date().toISOString()
            };
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
        const user = FarmModules.appData.user;
        
        // Use real user data
        const farmName = profile.farmName || user?.farmName || 'My Farm';
        const farmerName = profile.farmerName || user?.displayName || 'Farmer';
        const email = profile.email || user?.email || 'No email';
        
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
        const transactions = FarmModules.appData.transactions || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedTransactions = FarmModules.appData.feedTransactions || [];
        
        // Calculate farm value (inventory value + cash flow)
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0);
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
        const netProfit = income - expenses;
        const farmValue = inventoryValue + netProfit;
        
        this.updateElement('total-transactions', transactions.length);
        this.updateElement('total-inventory', inventory.length);
        this.updateElement('total-feed-records', feedTransactions.length);
        this.updateElement('farm-value', this.formatCurrency(farmValue));
        
        // Update data entries count
        const totalEntries = transactions.length + inventory.length + feedTransactions.length;
        this.updateElement('data-entries', `Data entries: ${totalEntries}`);
    },

    updateDataManagement: function() {
        const transactions = FarmModules.appData.transactions || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedTransactions = FarmModules.appData.feedTransactions || [];
        
        this.updateElement('transactions-count', `${transactions.length} records`);
        this.updateElement('inventory-count', `${inventory.length} items`);
        this.updateElement('feed-records-count', `${feedTransactions.length} entries`);
        
        // Calculate approximate data size
        const dataSize = JSON.stringify(FarmModules.appData).length;
        const sizeInKB = (dataSize / 1024).toFixed(2);
        this.updateElement('total-data-size', `${sizeInKB} KB`);
    },

    updateSettings: function() {
        const profile = FarmModules.appData.profile;
        
        this.setValue('default-currency', profile.currency || 'USD');
        this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        this.setChecked('auto-backup', profile.autoBackup !== false);
    },

    attachEventListeners: function() {
        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Reset button
        document.getElementById('reset-profile').addEventListener('click', () => {
            this.updateAllDisplays();
            this.showNotification('Profile form reset to current values', 'info');
        });

        // Settings changes
        document.getElementById('default-currency').addEventListener('change', (e) => {
            this.saveSetting('currency', e.target.value);
        });

        document.getElementById('low-stock-threshold').addEventListener('change', (e) => {
            this.saveSetting('lowStockThreshold', parseInt(e.target.value));
        });

        document.getElementById('auto-backup').addEventListener('change', (e) => {
            this.saveSetting('autoBackup', e.target.checked);
        });

        // Data management
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-transactions').addEventListener('click', () => {
            this.clearTransactions();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Account actions
        const logoutBtn = document.getElementById('logout-profile');
        const demoLoginBtn = document.getElementById('demo-login');
        const refreshBtn = document.getElementById('refresh-data');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.app) window.app.logout();
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

    saveProfile: function() {
        const profile = FarmModules.appData.profile;
        
        profile.farmName = document.getElementById('farm-name').value;
        profile.farmerName = document.getElementById('farmer-name').value;
        profile.farmType = document.getElementById('farm-type').value;
        profile.farmSize = document.getElementById('farm-size').value;
        profile.farmLocation = document.getElementById('farm-location').value;
        profile.farmDescription = document.getElementById('farm-description').value;

        // Also update main app data
        FarmModules.appData.farmName = profile.farmName;
        if (FarmModules.appData.user) {
            FarmModules.appData.user.farmName = profile.farmName;
            FarmModules.appData.user.displayName = profile.farmerName;
        }

        this.updateAllDisplays();
        this.showNotification('Profile saved successfully!', 'success');
    },

    saveSetting: function(setting, value) {
        FarmModules.appData.profile[setting] = value;
        this.showNotification('Setting updated', 'info');
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
            FarmModules.appData.transactions = [];
            this.showNotification('All transactions cleared', 'success');
            this.updateAllDisplays();
        }
    },

    clearAllData: function() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including transactions, inventory, and feed records. This cannot be undone!')) {
            FarmModules.appData.transactions = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.feedTransactions = [];
            FarmModules.appData.feedStock = { current: 0, unit: 'kg', lowStockThreshold: 100 };
            
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

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
