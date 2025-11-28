// modules/profile.js
FarmModules.registerModule('profile', {
    name: 'Profile',
    icon: '👤',
    
    template: `
        <div class="profile-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Farm Profile</h1>
                <p class="module-subtitle-pwa">Manage your farm information and settings</p>
            </div>

            <div class="profile-content">
                <!-- Farm Stats Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa" id="total-transactions">0</div>
                        <div class="stat-label-pwa">Total Transactions</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📦</div>
                        <div class="stat-value-pwa" id="total-inventory">0</div>
                        <div class="stat-label-pwa">Inventory Items</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🌾</div>
                        <div class="stat-value-pwa" id="total-feed-records">0</div>
                        <div class="stat-label-pwa">Feed Records</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📈</div>
                        <div class="stat-value-pwa" id="farm-value">$0</div>
                        <div class="stat-label-pwa">Farm Value</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <div class="quick-grid-pwa">
                        <a href="#" class="quick-action-btn-pwa" id="quick-edit-profile">
                            <div class="quick-icon-pwa">✏️</div>
                            <div class="quick-title-pwa">Edit Profile</div>
                            <div class="quick-desc-pwa">Update farm details</div>
                        </a>
                        <a href="#" class="quick-action-btn-pwa" id="quick-export-data">
                            <div class="quick-icon-pwa">📥</div>
                            <div class="quick-title-pwa">Export Data</div>
                            <div class="quick-desc-pwa">Backup all farm data</div>
                        </a>
                        <a href="#" class="quick-action-btn-pwa" id="quick-settings">
                            <div class="quick-icon-pwa">⚙️</div>
                            <div class="quick-title-pwa">Settings</div>
                            <div class="quick-desc-pwa">App preferences</div>
                        </a>
                    </div>
                </div>

                <!-- Farm Information Form -->
                <div class="form-container-pwa">
                    <h3 class="form-title-pwa">Farm Information</h3>
                    <form id="profile-form">
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Name *</label>
                                <input type="text" id="farm-name" class="form-input-pwa" placeholder="Enter farm name" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farmer Name *</label>
                                <input type="text" id="farmer-name" class="form-input-pwa" placeholder="Enter your name" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Email Address *</label>
                                <input type="email" id="profile-email" class="form-input-pwa" placeholder="your.email@example.com" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Phone Number</label>
                                <input type="tel" id="profile-phone" class="form-input-pwa" placeholder="+1 (555) 123-4567">
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Type</label>
                                <select id="farm-type" class="form-select-pwa">
                                    <option value="">Select farm type</option>
                                    <option value="poultry">Poultry Farm</option>
                                    <option value="dairy">Dairy Farm</option>
                                    <option value="crop">Crop Farm</option>
                                    <option value="livestock">Livestock Farm</option>
                                    <option value="mixed">Mixed Farming</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Size (acres)</label>
                                <input type="number" id="farm-size" class="form-input-pwa" placeholder="e.g., 100" min="0" step="0.1">
                            </div>
                        </div>
                        
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Farm Location</label>
                            <input type="text" id="farm-location" class="form-input-pwa" placeholder="Enter farm address">
                        </div>
                        
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Farm Description</label>
                            <textarea id="farm-description" class="form-input-pwa" placeholder="Describe your farm operations, specialties, or any other relevant information..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary-pwa">
                                <span class="btn-icon">💾</span>
                                Save Profile
                            </button>
                            <button type="button" class="btn btn-outline-pwa" id="reset-profile">
                                <span class="btn-icon">🔄</span>
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Account Settings -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Account Settings</h3>
                    </div>
                    
                    <div class="settings-grid">
                        <div class="setting-group">
                            <label class="form-label-pwa">Default Currency</label>
                            <select id="default-currency" class="form-select-pwa">
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                                <option value="BBD">Barbadian Dollar (BBD$)</option>
                                <option value="CAD">Canadian Dollar (C$)</option>
                                <option value="AUD">Australian Dollar (A$)</option>
                                <option value="JMD">Jamaican Dollar (J$)</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label class="form-label-pwa">Low Stock Threshold</label>
                            <div class="input-with-unit">
                                <input type="number" id="low-stock-threshold" class="form-input-pwa" value="10" min="1" max="1000">
                                <span class="input-unit">items</span>
                            </div>
                            <div class="form-help-pwa">Receive alerts when inventory drops below this level</div>
                        </div>
                        
                        <div class="setting-group">
                            <label class="form-label-pwa">Date Format</label>
                            <select id="date-format" class="form-select-pwa">
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Data Management</h3>
                    </div>
                    
                    <div class="data-stats">
                        <div class="data-stat-item">
                            <span class="data-stat-label">Total Transactions:</span>
                            <span class="data-stat-value" id="data-transactions">0 records</span>
                        </div>
                        <div class="data-stat-item">
                            <span class="data-stat-label">Inventory Items:</span>
                            <span class="data-stat-value" id="data-inventory">0 items</span>
                        </div>
                        <div class="data-stat-item">
                            <span class="data-stat-label">Feed Records:</span>
                            <span class="data-stat-value" id="data-feed-records">0 entries</span>
                        </div>
                        <div class="data-stat-item">
                            <span class="data-stat-label">Total Data Size:</span>
                            <span class="data-stat-value" id="data-total-size">0 KB</span>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary-pwa" id="export-all-data">
                            <span class="btn-icon">📥</span>
                            Export All Data
                        </button>
                        <button class="btn btn-outline-pwa" id="clear-transactions">
                            <span class="btn-icon">🗑️</span>
                            Clear Transactions
                        </button>
                        <button class="btn btn-danger-pwa" id="clear-all-data">
                            <span class="btn-icon">⚠️</span>
                            Clear All Data
                        </button>
                    </div>
                </div>

                <!-- Account Actions -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Account</h3>
                    </div>
                    
                    <div class="action-buttons">
                        ${window.app && window.app.isDemoMode ? 
                            `<button class="btn btn-primary-pwa" id="demo-login">
                                <span class="btn-icon">🔐</span>
                                Switch to Real Account
                            </button>` : 
                            `<button class="btn btn-outline-pwa" id="logout-profile">
                                <span class="btn-icon">🚪</span>
                                Logout
                            </button>`
                        }
                        <button class="btn btn-text-pwa" id="refresh-data">
                            <span class="btn-icon">🔄</span>
                            Refresh Data
                        </button>
                    </div>
                    
                    <div class="account-info">
                        <div class="account-info-item">
                            <span class="account-info-label">Member Since:</span>
                            <span class="account-info-value" id="member-since">Loading...</span>
                        </div>
                        <div class="account-info-item">
                            <span class="account-info-label">Last Login:</span>
                            <span class="account-info-value" id="last-login">Loading...</span>
                        </div>
                        <div class="account-info-item">
                            <span class="account-info-label">App Version:</span>
                            <span class="account-info-value">1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Profile module initializing...');
        this.showContent();
        this.setupEventListeners();
        this.loadProfileData();
        this.updateStats();
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        contentArea.innerHTML = this.template;
        console.log('✅ Profile content loaded');
    },

    setupEventListeners: function() {
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[id]');
            if (!target) return;

            switch(target.id) {
                case 'quick-edit-profile':
                    e.preventDefault();
                    this.scrollToForm();
                    break;
                case 'quick-export-data':
                    e.preventDefault();
                    this.exportAllData();
                    break;
                case 'quick-settings':
                    e.preventDefault();
                    this.scrollToSettings();
                    break;
                case 'reset-profile':
                    e.preventDefault();
                    this.resetForm();
                    break;
                case 'export-all-data':
                    e.preventDefault();
                    this.exportAllData();
                    break;
                case 'clear-transactions':
                    e.preventDefault();
                    this.clearTransactions();
                    break;
                case 'clear-all-data':
                    e.preventDefault();
                    this.clearAllData();
                    break;
                case 'logout-profile':
                    e.preventDefault();
                    this.logout();
                    break;
                case 'demo-login':
                    e.preventDefault();
                    this.showDemoLoginMessage();
                    break;
                case 'refresh-data':
                    e.preventDefault();
                    this.refreshData();
                    break;
            }
        });

        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'profile-form') {
                e.preventDefault();
                this.saveProfile();
            }
        });

        // Real-time settings changes
        document.addEventListener('change', (e) => {
            const target = e.target;
            if (target.id === 'default-currency' || target.id === 'low-stock-threshold' || target.id === 'date-format') {
                this.saveSettings();
            }
        });

        console.log('✅ Profile event listeners setup');
    },

    loadProfileData: function() {
        console.log('Loading profile data...');
        
        // Load from app data or use defaults
        const appData = FarmModules.appData || {};
        const profile = appData.profile || {};
        const currentUser = this.getCurrentUser();
        
        // Set form values
        this.setValue('farm-name', profile.farmName || currentUser?.farmName || 'My Farm');
        this.setValue('farmer-name', profile.farmerName || currentUser?.displayName || 'Farmer');
        this.setValue('profile-email', profile.email || currentUser?.email || '');
        this.setValue('profile-phone', profile.phone || '');
        this.setValue('farm-type', profile.farmType || '');
        this.setValue('farm-size', profile.farmSize || '');
        this.setValue('farm-location', profile.farmLocation || '');
        this.setValue('farm-description', profile.farmDescription || '');
        
        // Set settings
        this.setValue('default-currency', profile.currency || 'USD');
        this.setValue('low-stock-threshold', profile.lowStockThreshold || 10);
        this.setValue('date-format', profile.dateFormat || 'MM/DD/YYYY');
        
        // Set account info
        this.updateElement('member-since', profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today');
        this.updateElement('last-login', new Date().toLocaleString());
        
        console.log('✅ Profile data loaded');
    },

    updateStats: function() {
        const appData = FarmModules.appData || {};
        const sales = appData.sales || [];
        const inventory = appData.inventory || [];
        const feedRecords = appData.feedRecords || [];
        
        // Calculate farm value
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
        const salesRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const farmValue = inventoryValue + salesRevenue;
        
        // Update stats cards
        this.updateElement('total-transactions', sales.length);
        this.updateElement('total-inventory', inventory.length);
        this.updateElement('total-feed-records', feedRecords.length);
        this.updateElement('farm-value', this.formatCurrency(farmValue));
        
        // Update data management stats
        this.updateElement('data-transactions', `${sales.length} records`);
        this.updateElement('data-inventory', `${inventory.length} items`);
        this.updateElement('data-feed-records', `${feedRecords.length} entries`);
        
        // Calculate data size
        const dataSize = JSON.stringify(appData).length;
        const sizeInKB = (dataSize / 1024).toFixed(2);
        this.updateElement('data-total-size', `${sizeInKB} KB`);
    },

    saveProfile: function() {
        console.log('Saving profile...');
        
        if (!FarmModules.appData) {
            FarmModules.appData = {};
        }
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {};
        }
        
        const profile = FarmModules.appData.profile;
        
        // Save form data
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');
        profile.email = this.getValue('profile-email');
        profile.phone = this.getValue('profile-phone');
        profile.farmType = this.getValue('farm-type');
        profile.farmSize = this.getValue('farm-size');
        profile.farmLocation = this.getValue('farm-location');
        profile.farmDescription = this.getValue('farm-description');
        
        // Set member since if not set
        if (!profile.memberSince) {
            profile.memberSince = new Date().toISOString();
        }
        
        // Update app data
        FarmModules.appData.farmName = profile.farmName;
        
        this.showNotification('Profile saved successfully!', 'success');
        this.updateStats();
        console.log('✅ Profile saved');
    },

    saveSettings: function() {
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {};
        }
        
        const profile = FarmModules.appData.profile;
        profile.currency = this.getValue('default-currency');
        profile.lowStockThreshold = parseInt(this.getValue('low-stock-threshold')) || 10;
        profile.dateFormat = this.getValue('date-format');
        
        this.showNotification('Settings updated', 'info');
    },

    resetForm: function() {
        if (confirm('Reset form to saved values?')) {
            this.loadProfileData();
            this.showNotification('Form reset to saved values', 'info');
        }
    },

    exportAllData: function() {
        const appData = FarmModules.appData || {};
        const dataStr = JSON.stringify(appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('All farm data exported successfully!', 'success');
    },

    clearTransactions: function() {
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            if (!FarmModules.appData) FarmModules.appData = {};
            FarmModules.appData.sales = [];
            this.showNotification('All transactions cleared', 'success');
            this.updateStats();
        }
    },

    clearAllData: function() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data including sales, inventory, and feed records. This cannot be undone!')) {
            if (!FarmModules.appData) FarmModules.appData = {};
            FarmModules.appData.sales = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.feedRecords = [];
            this.showNotification('All data cleared successfully', 'success');
            this.updateStats();
        }
    },

    logout: function() {
        if (confirm('Are you sure you want to log out?')) {
            console.log('Logging out...');
            
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
        FarmModules.appData = {};
        this.showNotification('You have been logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    },

    showDemoLoginMessage: function() {
        this.showNotification('Real account features coming soon!', 'info');
    },

    refreshData: function() {
        this.updateStats();
        this.showNotification('Data refreshed', 'success');
    },

    scrollToForm: function() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    scrollToSettings: function() {
        const settings = document.querySelector('.transactions-section-pwa');
        if (settings) {
            settings.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    getCurrentUser: function() {
        if (window.farmModules?.firebase?.getCurrentUser) {
            return window.farmModules.firebase.getCurrentUser();
        }
        if (window.authModule?.getCurrentUser) {
            return window.authModule.getCurrentUser();
        }
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser();
        }
        return null;
    },

    formatCurrency: function(amount) {
        const profile = FarmModules.appData?.profile || {};
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: profile.currency || 'USD'
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
