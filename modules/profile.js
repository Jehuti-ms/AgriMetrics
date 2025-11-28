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

                <div class="form-container-pwa">
                    <h3 class="form-title-pwa">Farm Information</h3>
                    <form id="profile-form">
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Name</label>
                                <input type="text" id="farm-name" class="form-input-pwa" placeholder="Enter farm name" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farmer Name</label>
                                <input type="text" id="farmer-name" class="form-input-pwa" placeholder="Enter your name" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Type</label>
                                <select id="farm-type" class="form-select-pwa">
                                    <option value="">Select farm type</option>
                                    <option value="crop">Crop Farm</option>
                                    <option value="livestock">Livestock Farm</option>
                                    <option value="dairy">Dairy Farm</option>
                                    <option value="poultry">Poultry Farm</option>
                                    <option value="mixed">Mixed Farming</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farm Size (acres)</label>
                                <input type="number" id="farm-size" class="form-input-pwa" placeholder="e.g., 100" min="0">
                            </div>
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Farm Location</label>
                            <input type="text" id="farm-location" class="form-input-pwa" placeholder="Enter farm location">
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Farm Description</label>
                            <textarea id="farm-description" class="form-input-pwa" placeholder="Describe your farm..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary-pwa">Save Profile</button>
                            <button type="button" class="btn btn-outline-pwa" id="reset-profile">Reset to Current</button>
                        </div>
                    </form>
                </div>

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
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="form-label-pwa">Low Stock Threshold</label>
                            <input type="number" id="low-stock-threshold" class="form-input-pwa" value="10" min="1">
                        </div>
                    </div>
                </div>

                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Data Management</h3>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-primary-pwa" id="export-data">📥 Export All Data</button>
                        <button class="btn btn-outline-pwa" id="clear-data">🗑️ Clear All Data</button>
                    </div>
                </div>

                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Account</h3>
                    </div>
                    <div class="action-buttons">
                        ${window.app && window.app.isDemoMode ? 
                            '<button class="btn btn-primary-pwa" id="demo-login">🔐 Switch to Real Account</button>' : 
                            '<button class="btn btn-outline-pwa" id="logout-profile">🚪 Logout</button>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Profile module initializing...');
        this.loadRealData();
        this.attachEventListeners();
        this.updateAllDisplays();
    },

    loadRealData: function() {
        console.log('Loading profile data...');
        
        const userData = window.userData || {};
        const profileData = userData.profile || {};
        
        const farmName = profileData.farmName || 'My Farm';
        const farmerName = profileData.farmerName || 'Farmer';
        const email = profileData.email || 'user@example.com';
        
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        
        console.log('Profile data loaded safely');
    },

    getCurrentUser: function() {
        if (window.farmModules?.firebase?.getCurrentUser) {
            return window.farmModules.firebase.getCurrentUser();
        }
        if (window.authModule?.getCurrentUser) {
            return window.authModule.getCurrentUser();
        }
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        return null;
    },

    updateAllDisplays: function() {
        this.updateProfileInfo();
        this.updateStatsOverview();
    },

    updateProfileInfo: function() {
        const profile = FarmModules.appData.profile || {};
        const currentUser = this.getCurrentUser();
        
        const farmName = profile.farmName || currentUser?.farmName || 'My Farm';
        const farmerName = profile.farmerName || currentUser?.displayName || 'Farmer';
        
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        this.setValue('farm-type', profile.farmType);
        this.setValue('farm-size', profile.farmSize);
        this.setValue('farm-location', profile.farmLocation);
        this.setValue('farm-description', profile.farmDescription);
    },

    updateStatsOverview: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
        const salesRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const farmValue = inventoryValue + salesRevenue;
        
        this.updateElement('total-transactions', sales.length);
        this.updateElement('total-inventory', inventory.length);
        this.updateElement('total-feed-records', feedRecords.length);
        this.updateElement('farm-value', this.formatCurrency(farmValue));
    },

    attachEventListeners: function() {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        const resetBtn = document.getElementById('reset-profile');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.updateAllDisplays();
                this.showNotification('Profile form reset', 'info');
            });
        }

        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        const logoutBtn = document.getElementById('logout-profile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },

    saveProfile: function() {
        const profile = FarmModules.appData.profile || {};
        
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');
        profile.farmType = this.getValue('farm-type');
        profile.farmSize = this.getValue('farm-size');
        profile.farmLocation = this.getValue('farm-location');
        profile.farmDescription = this.getValue('farm-description');

        FarmModules.appData.farmName = profile.farmName;
        this.showNotification('Profile saved successfully!', 'success');
    },

    logout: function() {
        if (confirm('Are you sure you want to log out?')) {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    this.handleLogoutSuccess();
                }).catch(error => {
                    this.handleLogoutSuccess();
                });
            } else {
                this.handleLogoutSuccess();
            }
        }
    },

    handleLogoutSuccess: function() {
        FarmModules.appData = {};
        this.showNotification('Logged out successfully', 'success');
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
        
        this.showNotification('Data exported successfully!', 'success');
    },

    clearAllData: function() {
        if (confirm('Clear ALL farm data? This cannot be undone!')) {
            FarmModules.appData.sales = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.feedRecords = [];
            this.showNotification('All data cleared', 'success');
            this.updateAllDisplays();
        }
    },

    formatCurrency: function(amount) {
        const profile = FarmModules.appData.profile || {};
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
