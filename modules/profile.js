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
                <div class="profile-card card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <span class="avatar-icon">🚜</span>
                        </div>
                        <div class="profile-info">
                            <h2 id="profile-farm-name">Green Valley Farm</h2>
                            <p id="profile-farmer-name">Demo Farmer</p>
                            <p class="profile-email" id="profile-email">demo@farm.com</p>
                        </div>
                    </div>
                </div>

                <div class="profile-details card">
                    <h3>Farm Information</h3>
                    <form id="profile-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="farm-name">Farm Name</label>
                                <input type="text" id="farm-name" placeholder="Enter farm name">
                            </div>
                            <div class="form-group">
                                <label for="farmer-name">Farmer Name</label>
                                <input type="text" id="farmer-name" placeholder="Enter your name">
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
                                <input type="number" id="farm-size" placeholder="e.g., 100">
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
                            <button type="button" class="btn btn-text" id="reset-profile">Reset</button>
                        </div>
                    </form>
                </div>

                <div class="settings-section card">
                    <h3>Settings</h3>
                    <div class="settings-list">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Units System</h4>
                                <p>Choose between metric or imperial units</p>
                            </div>
                            <select id="units-system" class="setting-control">
                                <option value="metric">Metric (kg, liters)</option>
                                <option value="imperial">Imperial (lbs, gallons)</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Low Stock Alerts</h4>
                                <p>Receive notifications when inventory is low</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="low-stock-alerts" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Monthly Reports</h4>
                                <p>Automatically generate monthly reports</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="monthly-reports" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="account-actions card">
                    <h3>Account Actions</h3>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="export-data">Export Farm Data</button>
                        <button class="btn btn-text" id="clear-data">Clear All Data</button>
                        ${window.app && !window.app.isDemoMode ? 
                            '<button class="btn btn-danger" id="logout-profile">Logout</button>' : 
                            '<button class="btn btn-primary" id="demo-login">Switch to Real Account</button>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .profile-content {
            max-width: 800px;
            margin: 0 auto;
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

        .profile-email {
            font-size: 0.9rem;
        }

        .profile-details, .settings-section, .account-actions {
            margin-bottom: 1.5rem;
        }

        .settings-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
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
            min-width: 200px;
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
        this.loadProfileData();
        this.attachEventListeners();
        this.updateProfileDisplay();
    },

    loadProfileData: function() {
        // Initialize profile data if it doesn't exist
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {
                farmName: 'Green Valley Farm',
                farmerName: 'Demo Farmer',
                email: 'demo@farm.com',
                farmType: '',
                farmSize: '',
                farmLocation: '',
                farmDescription: '',
                unitsSystem: 'metric',
                lowStockAlerts: true,
                monthlyReports: true
            };
        }
        
        // Load user data if available
        if (FarmModules.appData.user) {
            const user = FarmModules.appData.user;
            if (user.farmName) FarmModules.appData.profile.farmName = user.farmName;
            if (user.displayName) FarmModules.appData.profile.farmerName = user.displayName;
            if (user.email) FarmModules.appData.profile.email = user.email;
        }
    },

    updateProfileDisplay: function() {
        const profile = FarmModules.appData.profile;
        
        // Update header display
        this.updateElement('profile-farm-name', profile.farmName);
        this.updateElement('profile-farmer-name', profile.farmerName);
        this.updateElement('profile-email', profile.email);
        
        // Update form fields
        this.setValue('farm-name', profile.farmName);
        this.setValue('farmer-name', profile.farmerName);
        this.setValue('farm-type', profile.farmType);
        this.setValue('farm-size', profile.farmSize);
        this.setValue('farm-location', profile.farmLocation);
        this.setValue('farm-description', profile.farmDescription);
        
        // Update settings
        this.setValue('units-system', profile.unitsSystem);
        this.setChecked('low-stock-alerts', profile.lowStockAlerts);
        this.setChecked('monthly-reports', profile.monthlyReports);
    },

    attachEventListeners: function() {
        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Reset button
        document.getElementById('reset-profile').addEventListener('click', () => {
            this.resetProfile();
        });

        // Settings changes
        document.getElementById('units-system').addEventListener('change', (e) => {
            this.saveSetting('unitsSystem', e.target.value);
        });

        document.getElementById('low-stock-alerts').addEventListener('change', (e) => {
            this.saveSetting('lowStockAlerts', e.target.checked);
        });

        document.getElementById('monthly-reports').addEventListener('change', (e) => {
            this.saveSetting('monthlyReports', e.target.checked);
        });

        // Account actions
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });

        // Logout/demo login
        const logoutBtn = document.getElementById('logout-profile');
        const demoLoginBtn = document.getElementById('demo-login');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.app) window.app.logout();
            });
        }
        
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', () => {
                this.showNotification('Real account login coming soon!', 'info');
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

        // Update display
        this.updateProfileDisplay();
        
        this.showNotification('Profile saved successfully!', 'success');
    },

    saveSetting: function(setting, value) {
        FarmModules.appData.profile[setting] = value;
        this.showNotification('Setting updated', 'info');
    },

    resetProfile: function() {
        if (confirm('Are you sure you want to reset your profile? This will clear all your farm information.')) {
            FarmModules.appData.profile = {
                farmName: 'Green Valley Farm',
                farmerName: 'Demo Farmer',
                email: 'demo@farm.com',
                farmType: '',
                farmSize: '',
                farmLocation: '',
                farmDescription: '',
                unitsSystem: 'metric',
                lowStockAlerts: true,
                monthlyReports: true
            };
            
            this.updateProfileDisplay();
            this.showNotification('Profile reset to defaults', 'info');
        }
    },

    exportData: function() {
        const dataStr = JSON.stringify(FarmModules.appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Farm data exported successfully!', 'success');
    },

    clearData: function() {
        if (confirm('Are you sure you want to clear all farm data? This cannot be undone.')) {
            FarmModules.appData.transactions = [];
            FarmModules.appData.inventory = [];
            FarmModules.appData.feedTransactions = [];
            FarmModules.appData.feedStock = { current: 0, unit: 'kg', lowStockThreshold: 100 };
            
            this.showNotification('All data cleared successfully', 'success');
            
            // Refresh current module to show empty states
            if (FarmModules.currentModule) {
                FarmModules.initializeModule(FarmModules.currentModule);
            }
        }
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
