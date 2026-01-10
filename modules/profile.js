// modules/profile.js - COMPLETELY REWRITTEN FIXED VERSION
console.log('👤 Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    
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
            window.StyleManager.registerModule(this.name, this.element, {
                onThemeChange: (theme) => this.onThemeChange(theme)
            });
        }
        
        // Setup data sync
        this.setupDataSync();
        
        this.renderModule();
        this.initialized = true;
        
        return true;
    },

    onThemeChange(theme) {
        console.log(`Profile module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    // ==================== DATA SYNC ====================
    setupDataSync() {
        window.addEventListener('farm-data-updated', () => {
            this.updateStatsFromModules();
        });
    },

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <style>
                /* Profile specific styles */
                .profile-content {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }
                
                .stat-card {
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .stat-icon {
                    font-size: 32px;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--glass-bg);
                    border-radius: 50%;
                }
                
                .stat-content {
                    flex: 1;
                }
                
                .stat-content h3 {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }
                
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .profile-card {
                    padding: 24px;
                }
                
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--glass-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                }
                
                .profile-info h2 {
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                }
                
                .profile-info p {
                    margin: 4px 0;
                    color: var(--text-secondary);
                }
                
                .profile-stats {
                    display: flex;
                    gap: 12px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }
                
                .stat-badge {
                    padding: 4px 8px;
                    background: var(--glass-bg);
                    border-radius: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                /* Form Styles */
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .form-input, .setting-control {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }
                
                /* Settings */
                .settings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .setting-info h4 {
                    margin: 0 0 4px 0;
                    color: var(--text-primary);
                }
                
                .setting-info p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                .setting-unit {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-left: 8px;
                }
                
                /* Switch */
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
                    background-color: var(--glass-border);
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
                
                /* Data Management */
                .data-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }
                
                .data-stat {
                    padding: 12px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                }
                
                .data-stat label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }
                
                .data-stat span {
                    font-size: 16px;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .action-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                
                /* PDF Export Section */
                .pdf-export-section {
                    padding: 24px;
                }
                
                .pdf-buttons-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .pdf-btn {
                    padding: 16px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .pdf-btn:hover {
                    transform: translateY(-2px);
                    border-color: var(--primary-color);
                    background: var(--primary-color)10;
                }
                
                .pdf-btn span:last-child {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                #pdf-status {
                    margin-top: 12px;
                    text-align: center;
                    font-size: 13px;
                }
                
                /* Mobile responsive */
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .pdf-buttons-container {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .action-buttons button {
                        width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }
                    
                    .pdf-buttons-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
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

                    <!-- Profile Information Card -->
                    <div class="profile-card glass-card">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <span class="avatar-icon">🚜</span>
                            </div>
                            <div class="profile-info">
                                <h2 id="profile-farm-name">My Farm</h2>
                                <p id="profile-farmer-name">Farm Manager</p>
                                <p class="profile-email" id="profile-email">No email</p>
                                <div class="profile-stats">
                                    <span class="stat-badge" id="member-since">Member since: Today</span>
                                    <span class="stat-badge" id="data-entries">Data entries: 0</span>
                                    <span class="stat-badge" id="sync-status">🔄 Syncing...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Farm Information Form -->
                    <div class="profile-details glass-card">
                        <h3>Farm Information</h3>
                        <form id="profile-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-name" class="form-label">Farm Name *</label>
                                    <input type="text" id="farm-name" name="farm-name" class="form-input" required 
                                           placeholder="Enter farm name">
                                </div>
                                <div class="form-group">
                                    <label for="farmer-name" class="form-label">Farmer Name *</label>
                                    <input type="text" id="farmer-name" name="farmer-name" class="form-input" required 
                                           placeholder="Enter your name">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-email" class="form-label">Farm Email</label>
                                    <input type="email" id="farm-email" name="farm-email" class="form-input" 
                                           placeholder="farm@example.com">
                                </div>
                                <div class="form-group">
                                    <label for="farm-type" class="form-label">Farm Type</label>
                                    <select id="farm-type" name="farm-type" class="form-input">
                                        <option value="">Select farm type</option>
                                        <option value="crop">Crop Farm</option>
                                        <option value="livestock">Livestock Farm</option>
                                        <option value="dairy">Dairy Farm</option>
                                        <option value="poultry">Poultry Farm</option>
                                        <option value="mixed">Mixed Farming</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-location" class="form-label">Farm Location</label>
                                    <input type="text" id="farm-location" name="farm-location" class="form-input" 
                                           placeholder="e.g., City, State">
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">💾 Save Profile</button>
                                <button type="button" class="btn-secondary" id="sync-now-btn">🔄 Sync Now</button>
                                <button type="button" class="btn-outline" id="reset-profile">Reset to Current</button>
                            </div>
                        </form>
                    </div>

                    <!-- Application Settings -->
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
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Theme</h4>
                                    <p>Choose your preferred theme</p>
                                </div>
                                <select id="theme-selector" class="setting-control">
                                    <option value="auto">Auto (System)</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Data Management -->
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
                            <button class="btn-outline" id="export-data">📥 Export All Data</button>
                            <button class="btn-outline" id="import-data">📤 Import Data</button>
                            <button class="btn-primary" id="clear-all-data" style="background: var(--gradient-danger);">⚠️ Clear All Data</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Wait a moment for DOM to be ready, then set up everything
        setTimeout(() => {
            this.setupEventListeners();
            this.loadUserData();
            this.updateStatsFromModules();
        }, 50);
    },

    // ==================== FIXED EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('🔧 Setting up profile event listeners');
        
        // Form submission - WORKING FIX
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            // Remove any existing listeners by cloning
            const newForm = profileForm.cloneNode(true);
            profileForm.parentNode.replaceChild(newForm, profileForm);
            
            // Get fresh form reference
            const freshForm = document.getElementById('profile-form');
            
            freshForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('✅ Form submitted');
                this.saveProfile();
            });
            
            // Debug: Add input listeners to farm name field
            const farmNameInput = document.getElementById('farm-name');
            if (farmNameInput) {
                farmNameInput.addEventListener('input', (e) => {
                    console.log('⌨️ Farm name input:', e.target.value);
                });
                
                farmNameInput.addEventListener('change', (e) => {
                    console.log('📝 Farm name changed:', e.target.value);
                });
                
                farmNameInput.addEventListener('paste', (e) => {
                    setTimeout(() => {
                        console.log('📋 Farm name pasted:', e.target.value);
                    }, 10);
                });
            }
        }

        // Other buttons
        const syncBtn = document.getElementById('sync-now-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncNow());
        }

        const resetBtn = document.getElementById('reset-profile');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.loadUserData();
                this.showNotification('Form reset to saved values', 'info');
            });
        }

        // Settings
        const currencySelect = document.getElementById('default-currency');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.saveSetting('currency', e.target.value);
            });
        }

        const lowStockInput = document.getElementById('low-stock-threshold');
        if (lowStockInput) {
            lowStockInput.addEventListener('change', (e) => {
                this.saveSetting('lowStockThreshold', parseInt(e.target.value));
            });
        }

        const autoSyncCheck = document.getElementById('auto-sync');
        if (autoSyncCheck) {
            autoSyncCheck.addEventListener('change', (e) => {
                this.saveSetting('autoSync', e.target.checked);
            });
        }

        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        // Data management
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        const clearBtn = document.getElementById('clear-all-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        console.log('✅ All event listeners set up');
    },

    // ==================== USER DATA MANAGEMENT ====================
    loadUserData() {
        console.log('📂 Loading user data...');
        
        // Initialize profile data if it doesn't exist
        if (!window.FarmModules.appData.profile) {
            console.log('🆕 Creating new profile data');
            window.FarmModules.appData.profile = {
                farmName: window.FarmModules.appData.farmName || 'My Farm',
                farmerName: 'Farm Manager',
                email: '',
                farmType: '',
                farmLocation: '',
                currency: 'USD',
                lowStockThreshold: 10,
                autoSync: true,
                theme: 'auto',
                memberSince: new Date().toISOString()
            };
        }

        // Load from local storage
        this.loadFromLocalStorage();

        // Update UI with loaded data
        this.updateProfileDisplay();
        
        console.log('✅ User data loaded');
    },

    updateProfileDisplay() {
        console.log('🔄 Updating profile display...');
        
        const profile = window.FarmModules.appData.profile;
        if (!profile) return;
        
        console.log('📊 Profile data:', profile);
        
        // Update profile card
        document.getElementById('profile-farm-name').textContent = profile.farmName || 'My Farm';
        document.getElementById('profile-farmer-name').textContent = profile.farmerName || 'Farm Manager';
        document.getElementById('profile-email').textContent = profile.email || 'No email';
        
        const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
        document.getElementById('member-since').textContent = `Member since: ${memberSince}`;
        
        // Update form inputs - THIS WAS THE MISSING PART!
        const farmNameInput = document.getElementById('farm-name');
        const farmerNameInput = document.getElementById('farmer-name');
        const emailInput = document.getElementById('farm-email');
        const farmTypeInput = document.getElementById('farm-type');
        const farmLocationInput = document.getElementById('farm-location');
        
        if (farmNameInput) {
            farmNameInput.value = profile.farmName || '';
            console.log(`✅ Set farm-name input to: "${profile.farmName}"`);
        }
        
        if (farmerNameInput) {
            farmerNameInput.value = profile.farmerName || '';
        }
        
        if (emailInput) {
            emailInput.value = profile.email || '';
        }
        
        if (farmTypeInput) {
            farmTypeInput.value = profile.farmType || '';
        }
        
        if (farmLocationInput) {
            farmLocationInput.value = profile.farmLocation || '';
        }
        
        // Update settings
        document.getElementById('default-currency').value = profile.currency || 'USD';
        document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
        document.getElementById('auto-sync').checked = profile.autoSync !== false;
        document.getElementById('theme-selector').value = profile.theme || 'auto';
        
        console.log('✅ Profile display updated');
    },

    async saveProfile() {
        console.log('💾 Saving profile...');
        
        try {
            // Get form values DIRECTLY from inputs
            const farmNameInput = document.getElementById('farm-name');
            const farmerNameInput = document.getElementById('farmer-name');
            const emailInput = document.getElementById('farm-email');
            const farmTypeInput = document.getElementById('farm-type');
            const farmLocationInput = document.getElementById('farm-location');
            
            if (!farmNameInput) {
                console.error('❌ Farm name input not found');
                this.showNotification('Error: Farm name field not found', 'error');
                return;
            }
            
            // Get current values
            const farmName = farmNameInput.value.trim();
            const farmerName = farmerNameInput?.value.trim();
            const email = emailInput?.value.trim();
            const farmType = farmTypeInput?.value;
            const farmLocation = farmLocationInput?.value.trim();
            
            console.log('📝 Form values:', {
                farmName,
                farmerName,
                email,
                farmType,
                farmLocation
            });
            
            // Update profile object
            const profile = window.FarmModules.appData.profile || {};
            
            // Only update if value is not empty
            if (farmName) {
                profile.farmName = farmName;
                console.log(`✅ Updated farmName to: "${farmName}"`);
            }
            
            if (farmerName) {
                profile.farmerName = farmerName;
            }
            
            if (email) {
                profile.email = email;
            }
            
            if (farmType) {
                profile.farmType = farmType;
            }
            
            if (farmLocation) {
                profile.farmLocation = farmLocation;
            }
            
            // Update app data
            window.FarmModules.appData.profile = profile;
            window.FarmModules.appData.farmName = profile.farmName;
            
            console.log('📊 Updated profile:', profile);
            
            // Save to local storage
            this.saveToLocalStorage();
            
            // Update UI
            this.updateProfileDisplay();
            
            // Notify other modules
            window.dispatchEvent(new CustomEvent('farm-data-updated'));
            
            this.showNotification('Profile saved successfully!', 'success');
            console.log('✅ Profile saved');
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    },

    async saveSetting(setting, value) {
        try {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            
            window.FarmModules.appData.profile[setting] = value;
            this.saveToLocalStorage();
            this.showNotification('Setting updated', 'info');
        } catch (error) {
            console.error('Error saving setting:', error);
            this.showNotification('Error saving setting', 'error');
        }
    },

    // ==================== UTILITY METHODS ====================
    updateStatsFromModules() {
        const orders = window.FarmModules.appData.orders || [];
        const inventory = window.FarmModules.appData.inventory || [];
        const customers = window.FarmModules.appData.customers || [];
        
        // Update stats
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('total-inventory').textContent = inventory.length;
        document.getElementById('total-customers').textContent = customers.length;
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);
        
        document.getElementById('total-revenue').textContent = this.formatCurrency(totalRevenue);
        
        // Update data management stats
        document.getElementById('orders-count').textContent = `${orders.length} records`;
        document.getElementById('inventory-count').textContent = `${inventory.length} items`;
        document.getElementById('customers-count').textContent = `${customers.length} customers`;
        
        // Update data entries badge
        const totalEntries = orders.length + inventory.length + customers.length;
        document.getElementById('data-entries').textContent = `Data entries: ${totalEntries}`;
    },

    // ==================== LOCAL STORAGE METHODS ====================
    saveToLocalStorage() {
        try {
            localStorage.setItem('farm-profile', JSON.stringify(window.FarmModules.appData.profile));
            console.log('💾 Profile saved to local storage');
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    },

    loadFromLocalStorage() {
        try {
            const savedProfile = localStorage.getItem('farm-profile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                window.FarmModules.appData.profile = {
                    ...window.FarmModules.appData.profile,
                    ...parsedProfile
                };
                console.log('📂 Profile loaded from local storage');
            }
        } catch (error) {
            console.error('Error loading from local storage:', error);
        }
    },

    // ==================== OTHER METHODS ====================
    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.applyTheme(theme);
            this.saveSetting('theme', theme);
            this.showNotification(`Theme changed to ${theme}`, 'success');
        }
    },

    async syncNow() {
        document.getElementById('sync-status').textContent = '🔄 Syncing...';
        
        try {
            // Save to local storage
            this.saveToLocalStorage();
            
            // Simulate sync delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Data synchronized!', 'success');
            document.getElementById('sync-status').textContent = '✅ Synced';
            
            // Reset status after 3 seconds
            setTimeout(() => {
                document.getElementById('sync-status').textContent = '💾 Local';
            }, 3000);
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed', 'error');
            document.getElementById('sync-status').textContent = '❌ Failed';
        }
    },

    exportData() {
        try {
            const exportData = {
                appData: window.FarmModules.appData,
                timestamp: new Date().toISOString(),
                version: '1.0'
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
            if (importData.appData) {
                // Merge imported data with existing data
                window.FarmModules.appData = {
                    ...window.FarmModules.appData,
                    ...importData.appData
                };
                
                this.showNotification('Data imported successfully!', 'success');
                this.loadUserData();
                this.updateStatsFromModules();
                
                // Notify other modules
                window.dispatchEvent(new CustomEvent('farm-data-updated'));
                
                this.saveToLocalStorage();
            } else {
                this.showNotification('Invalid data format', 'error');
            }
        } catch (error) {
            console.error('Error merging imported data:', error);
            this.showNotification('Error importing data', 'error');
        }
    },

    clearAllData() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data. This cannot be undone!')) {
            if (confirm('THIS IS YOUR LAST WARNING! All data will be permanently deleted!')) {
                try {
                    // Clear data arrays but keep profile
                    const profile = window.FarmModules.appData.profile;
                    
                    window.FarmModules.appData.orders = [];
                    window.FarmModules.appData.inventory = [];
                    window.FarmModules.appData.customers = [];
                    window.FarmModules.appData.products = [];
                    
                    // Restore profile
                    window.FarmModules.appData.profile = profile;
                    
                    this.saveToLocalStorage();
                    
                    this.showNotification('All data cleared successfully', 'success');
                    this.updateStatsFromModules();
                    
                    // Notify other modules
                    window.dispatchEvent(new CustomEvent('farm-data-updated'));
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showNotification('Error clearing data', 'error');
                }
            }
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            
            console.log(`%c${type.toUpperCase()}: ${message}`, `color: ${colors[type] || '#6b7280'}; font-weight: bold;`);
            
            // Simple alert fallback
            if (type === 'error') {
                alert(`❌ ${message}`);
            } else if (type === 'success') {
                alert(`✅ ${message}`);
            }
        }
    },

    formatCurrency(amount) {
        const currency = window.FarmModules.appData.profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
};

// ==================== REGISTRATION ====================
if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
    console.log('✅ Profile module registered');
}
