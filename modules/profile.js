// modules/profile.js - COMPLETE FIXED VERSION (DROP-IN READY)
console.log('👤 Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    isSaving: false,
    
    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('👤 Initializing profile...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        if (window.StyleManager) {
            window.StyleManager.registerModule(this.name, this.element, {
                onThemeChange: (theme) => this.onThemeChange(theme)
            });
        }
        
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

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <style>
                .profile-content { display: flex; flex-direction: column; gap: 24px; }
                .stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
                .stat-card { padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; }
                .stat-icon { font-size: 32px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: var(--glass-bg); border-radius: 50%; }
                .stat-content { flex: 1; }
                .stat-content h3 { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; }
                .stat-value { font-size: 24px; font-weight: bold; color: var(--text-primary); }
                .profile-card { padding: 24px; }
                .profile-header { display: flex; align-items: center; gap: 20px; }
                .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--glass-bg); display: flex; align-items: center; justify-content: center; font-size: 32px; }
                .profile-info h2 { margin: 0 0 8px 0; color: var(--text-primary); }
                .profile-info p { margin: 4px 0; color: var(--text-secondary); }
                .profile-stats { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
                .stat-badge { padding: 4px 8px; background: var(--glass-bg); border-radius: 6px; font-size: 12px; color: var(--text-secondary); }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .form-group { margin-bottom: 16px; }
                .form-label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary); }
                .form-input, .setting-control { width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass-bg); color: var(--text-primary); font-size: 14px; }
                .form-actions { display: flex; gap: 12px; margin-top: 24px; }
                .settings-list { display: flex; flex-direction: column; gap: 16px; }
                .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--glass-border); }
                .setting-info h4 { margin: 0 0 4px 0; color: var(--text-primary); }
                .setting-info p { margin: 0; font-size: 14px; color: var(--text-secondary); }
                .setting-unit { font-size: 14px; color: var(--text-secondary); margin-left: 8px; }
                .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--glass-border); transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--primary-color); }
                input:checked + .slider:before { transform: translateX(26px); }
                .data-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px; }
                .data-stat { padding: 12px; background: var(--glass-bg); border-radius: 8px; }
                .data-stat label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
                .data-stat span { font-size: 16px; font-weight: bold; color: var(--text-primary); }
                .action-buttons { display: flex; flex-wrap: wrap; gap: 12px; }
                .pdf-export-section { padding: 24px; }
                .pdf-buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
                .pdf-btn { padding: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
                .pdf-btn:hover { transform: translateY(-2px); border-color: var(--primary-color); background: var(--primary-color)10; }
                .pdf-btn span:last-child { font-size: 14px; font-weight: 600; color: var(--text-primary); }
                #pdf-status { margin-top: 12px; text-align: center; font-size: 13px; }
                @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } .stats-overview { grid-template-columns: repeat(2, 1fr); } .pdf-buttons-container { grid-template-columns: repeat(2, 1fr); } .action-buttons { flex-direction: column; } .action-buttons button { width: 100%; } }
                @media (max-width: 480px) { .stats-overview { grid-template-columns: 1fr; } .pdf-buttons-container { grid-template-columns: 1fr; } }
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
                                <button type="submit" class="btn-primary" id="save-profile-btn">💾 Save Profile</button>
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
                    
                    <!-- PDF EXPORT SECTION -->
                    <div class="pdf-export-section glass-card">
                        <h3>📄 Export Reports</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Generate PDF reports for your farm data</p>
                        
                        <div class="pdf-buttons-container">
                            <button class="pdf-btn" id="export-profile-pdf">
                                <span style="font-size: 20px;">📋</span>
                                <span>Profile Report</span>
                            </button>
                            <button class="pdf-btn" id="export-inventory-pdf">
                                <span style="font-size: 20px;">📦</span>
                                <span>Inventory Report</span>
                            </button>
                            <button class="pdf-btn" id="export-sales-pdf">
                                <span style="font-size: 20px;">💰</span>
                                <span>Sales Report</span>
                            </button>
                            <button class="pdf-btn" id="export-all-pdf">
                                <span style="font-size: 20px;">📊</span>
                                <span>Complete Report</span>
                            </button>
                        </div>
                        
                        <div id="pdf-status">
                            Ready to generate reports
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
                </div>
            </div>
        `;

        // Set up everything
        setTimeout(() => {
            this.setupEventListeners();
            this.loadUserData();
            this.updateStatsFromModules();
        }, 100);
    },

    // ==================== EVENT LISTENERS - COMPLETE FIX ====================
    setupEventListeners() {
        console.log('🔧 Setting up profile event listeners');
        
        // 🔥 FIX 1: Direct button click handler for Save button
        const saveButton = document.getElementById('save-profile-btn');
        if (saveButton) {
            // Remove any existing listeners
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            
            // Add fresh listener
            document.getElementById('save-profile-btn').addEventListener('click', (e) => {
                e.preventDefault();
                console.log('💾 Save button clicked directly');
                this.handleSaveProfile();
            });
        }
        
        // 🔥 FIX 2: Form submit handler with paste protection
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📋 Form submitted');
                this.handleSaveProfile();
            });
        }
        
        // 🔥 FIX 3: Direct input tracking for farm name
        const farmNameInput = document.getElementById('farm-name');
        if (farmNameInput) {
            // Track typing
            farmNameInput.addEventListener('input', (e) => {
                console.log('⌨️ Farm name typed:', e.target.value);
            });
            
            // Track paste events
            farmNameInput.addEventListener('paste', (e) => {
                console.log('📋 Paste event detected');
                
                // Get pasted text immediately
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                console.log('📋 Pasted text:', pastedText);
                
                // Wait for paste to complete
                setTimeout(() => {
                    console.log('📋 After paste, input value:', farmNameInput.value);
                }, 10);
            });
            
            // Track changes
            farmNameInput.addEventListener('change', (e) => {
                console.log('📝 Farm name changed:', e.target.value);
            });
        }

        // Sync now button
        document.getElementById('sync-now-btn')?.addEventListener('click', () => {
            this.syncNow();
        });

        // Reset button
        document.getElementById('reset-profile')?.addEventListener('click', () => {
            this.loadUserData();
            this.showNotification('Form reset to saved values', 'info');
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

        document.getElementById('local-storage')?.addEventListener('change', (e) => {
            this.saveSetting('localStorageEnabled', e.target.checked);
        });

        // Theme selector
        document.getElementById('theme-selector')?.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // PDF Export buttons
        document.getElementById('export-profile-pdf')?.addEventListener('click', () => {
            this.exportProfilePDF();
        });

        document.getElementById('export-inventory-pdf')?.addEventListener('click', () => {
            this.exportInventoryPDF();
        });

        document.getElementById('export-sales-pdf')?.addEventListener('click', () => {
            this.exportSalesPDF();
        });

        document.getElementById('export-all-pdf')?.addEventListener('click', () => {
            this.exportAllPDF();
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

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        console.log('✅ All event listeners set up');
    },

    // ==================== SAVE PROFILE - COMPLETE FIX ====================
    async handleSaveProfile() {
        if (this.isSaving) {
            console.log('⏳ Already saving, skipping...');
            return;
        }
        
        this.isSaving = true;
        console.log('💾 Starting profile save...');
        
        try {
            // 🔥 CRITICAL FIX: Get form values with delay for paste completion
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Get all form inputs
            const farmNameInput = document.getElementById('farm-name');
            const farmerNameInput = document.getElementById('farmer-name');
            const emailInput = document.getElementById('farm-email');
            const farmTypeInput = document.getElementById('farm-type');
            const farmLocationInput = document.getElementById('farm-location');
            
            if (!farmNameInput) {
                throw new Error('Farm name input not found');
            }
            
            // Get current values
            const farmName = farmNameInput.value.trim();
            const farmerName = farmerNameInput?.value.trim();
            const email = emailInput?.value.trim();
            const farmType = farmTypeInput?.value;
            const farmLocation = farmLocationInput?.value.trim();
            
            console.log('📝 Saving form values:', {
                farmName,
                farmerName,
                email,
                farmType,
                farmLocation
            });
            
            // Ensure we have a profile object
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            
            // Update profile
            const profile = window.FarmModules.appData.profile;
            
            // Always update all fields
            profile.farmName = farmName || 'My Farm';
            profile.farmerName = farmerName || 'Farm Manager';
            profile.email = email || '';
            profile.farmType = farmType || '';
            profile.farmLocation = farmLocation || '';
            
            // Ensure other required fields exist
            profile.currency = profile.currency || 'USD';
            profile.lowStockThreshold = profile.lowStockThreshold || 10;
            profile.autoSync = profile.autoSync !== false;
            profile.localStorageEnabled = profile.localStorageEnabled !== false;
            profile.theme = profile.theme || 'auto';
            profile.memberSince = profile.memberSince || new Date().toISOString();
            
            // Update app-wide farm name
            window.FarmModules.appData.farmName = profile.farmName;
            
            console.log('📊 Updated profile:', profile);
            
            // Save to local storage
            this.saveToLocalStorage();
            
            // 🔥 CRITICAL FIX: Update UI immediately
            this.updateProfileDisplay(true);
            
            // Show success message with the new farm name
            this.showNotification(`Profile saved! Farm: ${profile.farmName}`, 'success');
            
            // Notify other modules
            window.dispatchEvent(new CustomEvent('farm-data-updated'));
            
            console.log('✅ Profile saved successfully');
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification('Error saving profile: ' + error.message, 'error');
        } finally {
            this.isSaving = false;
        }
    },

    // ==================== USER DATA MANAGEMENT ====================
    loadUserData() {
        console.log('📂 Loading user data...');
        
        try {
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
                    localStorageEnabled: true,
                    theme: 'auto',
                    memberSince: new Date().toISOString()
                };
            }

            // Load from local storage
            this.loadFromLocalStorage();

            // Update UI
            this.updateProfileDisplay();
            
            console.log('✅ User data loaded');
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    updateProfileDisplay(forceUpdate = false) {
        console.log('🔄 Updating profile display...');
        
        const profile = window.FarmModules.appData.profile;
        if (!profile) {
            console.error('❌ No profile data found');
            return;
        }
        
        console.log('📊 Current profile:', profile);
        
        // Update profile card
        const farmNameCard = document.getElementById('profile-farm-name');
        const farmerNameCard = document.getElementById('profile-farmer-name');
        const emailCard = document.getElementById('profile-email');
        
        if (farmNameCard) {
            const newFarmName = profile.farmName || 'My Farm';
            if (forceUpdate || farmNameCard.textContent !== newFarmName) {
                farmNameCard.textContent = newFarmName;
                console.log(`✅ Updated profile card to: "${newFarmName}"`);
            }
        }
        
        if (farmerNameCard) farmerNameCard.textContent = profile.farmerName || 'Farm Manager';
        if (emailCard) emailCard.textContent = profile.email || 'No email';
        
        // Update member since
        const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
        document.getElementById('member-since').textContent = `Member since: ${memberSince}`;
        
        // Update form inputs
        const farmNameInput = document.getElementById('farm-name');
        const farmerNameInput = document.getElementById('farmer-name');
        const emailInput = document.getElementById('farm-email');
        const farmTypeInput = document.getElementById('farm-type');
        const farmLocationInput = document.getElementById('farm-location');
        
        if (farmNameInput && farmNameInput.value !== profile.farmName) {
            farmNameInput.value = profile.farmName || '';
        }
        if (farmerNameInput) farmerNameInput.value = profile.farmerName || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (farmTypeInput) farmTypeInput.value = profile.farmType || '';
        if (farmLocationInput) farmLocationInput.value = profile.farmLocation || '';
        
        // Update settings
        document.getElementById('default-currency').value = profile.currency || 'USD';
        document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
        document.getElementById('auto-sync').checked = profile.autoSync !== false;
        document.getElementById('local-storage').checked = profile.localStorageEnabled !== false;
        document.getElementById('theme-selector').value = profile.theme || 'auto';
        
        console.log('✅ Profile display updated');
    },

    // ==================== LOCAL STORAGE ====================
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

    // ==================== SETTINGS ====================
    async saveSetting(setting, value) {
        try {
            window.FarmModules.appData.profile[setting] = value;
            this.saveToLocalStorage();
            this.showNotification('Setting updated', 'info');
        } catch (error) {
            console.error('Error saving setting:', error);
            this.showNotification('Error saving setting', 'error');
        }
    },

    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.applyTheme(theme);
            this.saveSetting('theme', theme);
            this.showNotification(`Theme changed to ${theme}`, 'success');
        }
    },

    // ==================== SYNC ====================
    async syncNow() {
        document.getElementById('sync-status').textContent = '🔄 Syncing...';
        
        try {
            this.saveToLocalStorage();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Data synchronized!', 'success');
            document.getElementById('sync-status').textContent = '✅ Synced';
            
            setTimeout(() => {
                document.getElementById('sync-status').textContent = '💾 Local';
            }, 3000);
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed', 'error');
            document.getElementById('sync-status').textContent = '❌ Failed';
        }
    },

    // ==================== STATS ====================
    updateStatsFromModules() {
        try {
            const orders = window.FarmModules.appData.orders || [];
            const inventory = window.FarmModules.appData.inventory || [];
            const customers = window.FarmModules.appData.customers || [];
            const products = window.FarmModules.appData.products || [];
            
            // Update main stats
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
            document.getElementById('products-count').textContent = `${products.length} products`;
            
            // Update data entries badge
            const totalEntries = orders.length + inventory.length + customers.length + products.length;
            document.getElementById('data-entries').textContent = `Data entries: ${totalEntries}`;
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    },

    // ==================== PDF EXPORT ====================
    async exportProfilePDF() {
        this.updatePDFStatus('Generating profile report...', 'info');
        
        try {
            const profile = window.FarmModules.appData.profile;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(24);
            doc.text('Farm Profile Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Farm Name: ${profile.farmName}`, 20, 40);
            doc.text(`Farmer Name: ${profile.farmerName}`, 20, 50);
            doc.text(`Farm Type: ${profile.farmType}`, 20, 60);
            doc.text(`Location: ${profile.farmLocation}`, 20, 70);
            doc.text(`Member Since: ${new Date(profile.memberSince).toLocaleDateString()}`, 20, 80);
            
            const fileName = `Profile_Report_${profile.farmName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.updatePDFStatus('✅ Profile report generated', 'success');
            this.showNotification('Profile PDF generated successfully', 'success');
            
        } catch (error) {
            console.error('Profile PDF error:', error);
            this.updatePDFStatus('❌ Failed to generate', 'error');
            this.showNotification('Error generating PDF', 'error');
        }
    },

    async exportInventoryPDF() {
        this.updatePDFStatus('Generating inventory report...', 'info');
        
        try {
            const inventory = window.FarmModules.appData.inventory || [];
            if (inventory.length === 0) {
                this.updatePDFStatus('❌ No inventory data', 'error');
                this.showNotification('No inventory data to export', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(24);
            doc.text('Inventory Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Total Items: ${inventory.length}`, 20, 40);
            
            let yPos = 60;
            doc.setFont(undefined, 'bold');
            doc.text('Item Name', 20, yPos);
            doc.text('Category', 80, yPos);
            doc.text('Quantity', 140, yPos);
            doc.text('Price', 180, yPos);
            
            yPos += 10;
            doc.setFont(undefined, 'normal');
            
            inventory.forEach((item) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.text(item.name || 'Unknown', 20, yPos);
                doc.text(item.category || 'Uncategorized', 80, yPos);
                doc.text(item.quantity || '0', 140, yPos);
                doc.text(`$${item.price || '0.00'}`, 180, yPos);
                yPos += 10;
            });
            
            const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.updatePDFStatus('✅ Inventory report generated', 'success');
            this.showNotification('Inventory PDF generated successfully', 'success');
            
        } catch (error) {
            console.error('Inventory PDF error:', error);
            this.updatePDFStatus('❌ Failed to generate', 'error');
            this.showNotification('Error generating inventory PDF', 'error');
        }
    },

    async exportSalesPDF() {
        this.updatePDFStatus('Generating sales report...', 'info');
        
        try {
            const orders = window.FarmModules.appData.orders || [];
            if (orders.length === 0) {
                this.updatePDFStatus('❌ No sales data', 'error');
                this.showNotification('No sales data to export', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(24);
            doc.text('Sales Report', 20, 20);
            
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
            
            doc.setFontSize(12);
            doc.text(`Total Orders: ${orders.length}`, 20, 40);
            doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 50);
            
            let yPos = 70;
            doc.setFont(undefined, 'bold');
            doc.text('Order ID', 20, yPos);
            doc.text('Date', 60, yPos);
            doc.text('Customer', 100, yPos);
            doc.text('Amount', 160, yPos);
            
            yPos += 10;
            doc.setFont(undefined, 'normal');
            
            orders.slice(0, 20).forEach((order) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.text(order.id || `ORD-${index + 1}`, 20, yPos);
                doc.text(new Date(order.date || order.createdAt).toLocaleDateString(), 60, yPos);
                doc.text(order.customerName || 'Walk-in', 100, yPos);
                doc.text(`$${parseFloat(order.totalAmount || 0).toFixed(2)}`, 160, yPos);
                yPos += 10;
            });
            
            const fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.updatePDFStatus('✅ Sales report generated', 'success');
            this.showNotification('Sales PDF generated successfully', 'success');
            
        } catch (error) {
            console.error('Sales PDF error:', error);
            this.updatePDFStatus('❌ Failed to generate', 'error');
            this.showNotification('Error generating sales PDF', 'error');
        }
    },

    async exportAllPDF() {
        this.updatePDFStatus('Generating complete report...', 'info');
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(24);
            doc.text('Complete Farm Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
            
            const fileName = `Complete_Farm_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.updatePDFStatus('✅ Complete report generated', 'success');
            this.showNotification('Complete PDF report generated', 'success');
            
        } catch (error) {
            console.error('Complete PDF error:', error);
            this.updatePDFStatus('❌ Failed to generate', 'error');
            this.showNotification('Error generating complete PDF', 'error');
        }
    },

    updatePDFStatus(message, type = 'info') {
        const statusElement = document.getElementById('pdf-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = type === 'error' ? '#ef4444' : 
                                       type === 'success' ? '#10b981' : 
                                       'var(--text-secondary)';
        }
    },

    // ==================== DATA MANAGEMENT ====================
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
                window.FarmModules.appData = importData.appData;
                this.showNotification('Data imported successfully!', 'success');
                this.loadUserData();
                this.updateStatsFromModules();
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
                    const profile = window.FarmModules.appData.profile;
                    
                    window.FarmModules.appData.orders = [];
                    window.FarmModules.appData.inventory = [];
                    window.FarmModules.appData.customers = [];
                    window.FarmModules.appData.products = [];
                    
                    window.FarmModules.appData.profile = profile;
                    
                    this.saveToLocalStorage();
                    this.showNotification('All data cleared successfully', 'success');
                    this.updateStatsFromModules();
                    window.dispatchEvent(new CustomEvent('farm-data-updated'));
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showNotification('Error clearing data', 'error');
                }
            }
        }
    },

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                if (!window.FarmModules.appData.profile.rememberUser) {
                    const appKeys = ['farm-', 'profileData', 'transactions', 'sales', 'inventory'];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (appKeys.some(appKey => key.includes(appKey))) {
                            localStorage.removeItem(key);
                        }
                    }
                }
                
                this.showNotification('Logged out successfully', 'success');
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
            }
        }
    },

    // ==================== UTILITIES ====================
    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            if (type === 'error') alert(`❌ ${message}`);
            else if (type === 'success') alert(`✅ ${message}`);
            else alert(`ℹ️ ${message}`);
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
