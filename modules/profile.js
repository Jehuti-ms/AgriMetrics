// modules/profile.js - COMPLETE VERSION WITH ALL FUNCTIONALITY
console.log('👤 Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    currentInputValues: {},
    pdfDataCache: {
        inventory: null,
        orders: null,
        customers: null,
        products: null,
        lastUpdated: {}
    },

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
        // Listen for data updates from other modules
        window.addEventListener('farm-data-updated', () => {
            this.updateStatsFromModules();
        });
        
        window.addEventListener('inventory-updated', () => {
            this.updatePDFDataCache('inventory', 'update', window.FarmModules.appData.inventory);
            this.updateStatsFromModules();
        });
        
        window.addEventListener('orders-updated', () => {
            this.updatePDFDataCache('orders', 'update', window.FarmModules.appData.orders);
            this.updateStatsFromModules();
        });
    },

    // ==================== MAIN RENDER - WITH ALL SECTIONS ====================
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
                
                /* Installation Guide */
                .guide-steps {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .step {
                    text-align: center;
                    padding: 20px;
                    background: var(--glass-bg);
                    border-radius: 12px;
                }
                
                .step-number {
                    width: 40px;
                    height: 40px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin: 0 auto 12px;
                }
                
                .step h4 {
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                }
                
                .step p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                .guide-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }
                
                .guide-actions button {
                    flex: 1;
                }
                
                /* Support Section */
                .support-channels {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 20px;
                }
                
                .support-channel {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                }
                
                .support-channel-icon {
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--glass-bg);
                    border-radius: 50%;
                }
                
                .support-channel-content {
                    flex: 1;
                }
                
                .support-channel h4 {
                    margin: 0 0 4px 0;
                    color: var(--text-primary);
                }
                
                .support-channel p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                .support-channel-actions {
                    display: flex;
                    gap: 8px;
                }
                
                /* Backup Section */
                .backup-actions {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .backup-list {
                    max-height: 200px;
                    overflow-y: auto;
                    padding: 16px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                }
                
                .backup-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .backup-item:last-child {
                    border-bottom: none;
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
                    
                    .guide-steps {
                        grid-template-columns: 1fr;
                    }
                    
                    .guide-actions {
                        flex-direction: column;
                    }
                    
                    .backup-actions {
                        flex-direction: column;
                    }
                    
                    .support-channel {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .support-channel-actions {
                        width: 100%;
                        justify-content: center;
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
                                <p class="profile-email" id="profile-email">Loading...</p>
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

                    <!-- Backup & Restore -->
                    <div class="backup-section glass-card">
                        <h3>💾 Backup & Restore</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Create backups of your farm data</p>
                        
                        <div class="backup-actions">
                            <button class="btn-outline" id="create-backup">Create Backup</button>
                            <button class="btn-outline" id="restore-backup">Restore Backup</button>
                            <button class="btn-outline" id="view-backups">View Backups</button>
                        </div>
                        
                        <div id="backup-list" class="backup-list">
                            <!-- Backup list will be loaded here -->
                        </div>
                    </div>

                    <!-- Mobile Installation Guide -->
                    <div class="installation-guide glass-card">
                        <h3>📱 Install on Mobile</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Get the app-like experience on your phone or tablet</p>
                        
                        <div class="guide-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <h4>Open in Browser</h4>
                                <p>Visit this app in Safari (iOS) or Chrome (Android)</p>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <h4>Tap Share Button</h4>
                                <p>Look for <strong>📤 Share</strong> or <strong>⋮ Menu</strong></p>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <h4>Add to Home Screen</h4>
                                <p>Select <strong>"Add to Home Screen"</strong></p>
                            </div>
                        </div>
                        
                        <div class="guide-actions">
                            <button class="btn-outline" id="send-install-link">
                                📧 Send Installation Link
                            </button>
                            <button class="btn-outline" id="show-qr-code">
                                📱 Show QR Code
                            </button>
                        </div>
                    </div>

                    <!-- Support & Help -->
                    <div class="support-section glass-card">
                        <h3>🆘 Support & Help</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Get help with the Farm Manager app</p>
                        
                        <div class="support-channels">
                            <div class="support-channel">
                                <div class="support-channel-icon">📧</div>
                                <div class="support-channel-content">
                                    <h4>Email Support</h4>
                                    <p>farm-support@yourcompany.com</p>
                                </div>
                                <div class="support-channel-actions">
                                    <button class="btn-outline" data-action="copy-email">📋 Copy</button>
                                </div>
                            </div>
                            
                            <div class="support-channel">
                                <div class="support-channel-icon">💬</div>
                                <div class="support-channel-content">
                                    <h4>Team Channel</h4>
                                    <p>#farm-management</p>
                                </div>
                                <div class="support-channel-actions">
                                    <button class="btn-outline" data-action="open-slack">↗️ Open</button>
                                </div>
                            </div>
                            
                            <div class="support-channel">
                                <div class="support-channel-icon">📖</div>
                                <div class="support-channel-content">
                                    <h4>Quick Guide</h4>
                                    <p>One-page reference guide</p>
                                </div>
                                <div class="support-channel-actions">
                                    <button class="btn-outline" data-action="open-guide">📄 Open</button>
                                    <button class="btn-outline" data-action="download-guide">📥 PDF</button>
                                </div>
                            </div>
                            
                            <div class="support-channel">
                                <div class="support-channel-icon">🎥</div>
                                <div class="support-channel-content">
                                    <h4>Video Tutorials</h4>
                                    <p>Step-by-step video guides</p>
                                </div>
                                <div class="support-channel-actions">
                                    <button class="btn-outline" data-action="watch-tutorials">▶️ Watch</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadUserData();
        this.setupEventListeners();
        this.updateAllDisplays();
        this.loadBackupList();
    },

    // ==================== EVENT LISTENERS ====================
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
            this.loadUserData();
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

        document.getElementById('local-storage')?.addEventListener('change', (e) => {
            this.saveSetting('localStorageEnabled', e.target.checked);
        });

        // Theme selector
        document.getElementById('theme-selector')?.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Remember user
        document.getElementById('remember-user')?.addEventListener('change', (e) => {
            this.saveSetting('rememberUser', e.target.checked);
            this.updateUserPersistence();
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

        // Backup & Restore
        document.getElementById('create-backup')?.addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('restore-backup')?.addEventListener('click', () => {
            this.restoreBackup();
        });

        document.getElementById('view-backups')?.addEventListener('click', () => {
            this.loadBackupList();
        });

        // Mobile Installation
        document.getElementById('send-install-link')?.addEventListener('click', () => {
            this.sendInstallationLink();
        });

        document.getElementById('show-qr-code')?.addEventListener('click', () => {
            this.showQRCode();
        });

        // Support section event delegation
        this.element.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            e.preventDefault();
            const action = button.getAttribute('data-action');
            
            switch(action) {
                case 'copy-email':
                    this.copyToClipboard('farm-support@yourcompany.com');
                    break;
                    
                case 'open-slack':
                    this.openSlackChannel();
                    break;
                    
                case 'open-guide':
                    this.openQuickGuide();
                    break;
                    
                case 'download-guide':
                    this.downloadQuickGuide();
                    break;
                    
                case 'watch-tutorials':
                    this.openYouTubeTutorials();
                    break;
            }
        });
    },

    // ==================== NEW METHODS FOR ADDED SECTIONS ====================

    // Backup & Restore Methods
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

    restoreBackup() {
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
                    
                    if (!backupData.appData || !backupData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    if (confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
                        window.FarmModules.appData = backupData.appData;
                        this.showNotification('Backup restored successfully!', 'success');
                        this.updateAllDisplays();
                        this.saveToLocalStorage();
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
            if (!backupList) return;
            
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
                            <div class="backup-item">
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">${backup.date}</span>
                                <button class="btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.ProfileModule.restoreLocalBackup('${backup.key}')">
                                    Restore
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                backupList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No local backups found</p>';
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
                this.saveToLocalStorage();
                window.dispatchEvent(new CustomEvent('farm-data-updated'));
            }
        } catch (error) {
            console.error('Error restoring local backup:', error);
            this.showNotification('Error restoring backup', 'error');
        }
    },

    // PDF Export Methods
    exportProfilePDF() {
        this.updatePDFStatus('Generating Profile Report...');
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 83); // Green color
            doc.text('Farm Profile Report', 20, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            // Farm Information
            const profile = this.getCurrentProfile();
            let yPos = 40;
            
            doc.setFontSize(14);
            doc.text('Farm Information', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            doc.text(`Farm Name: ${profile.farmName || 'Not set'}`, 20, yPos);
            yPos += 8;
            doc.text(`Farmer: ${profile.farmerName || 'Not set'}`, 20, yPos);
            yPos += 8;
            doc.text(`Type: ${profile.farmType || 'Not set'}`, 20, yPos);
            yPos += 8;
            doc.text(`Location: ${profile.farmLocation || 'Not set'}`, 20, yPos);
            yPos += 15;
            
            // Farm Statistics
            doc.setFontSize(14);
            doc.text('Farm Statistics', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            const stats = this.getFarmStats();
            doc.text(`Total Revenue: $${stats.totalRevenue.toLocaleString()}`, 20, yPos);
            yPos += 8;
            doc.text(`Total Orders: ${stats.totalOrders}`, 20, yPos);
            yPos += 8;
            doc.text(`Inventory Items: ${stats.totalInventory}`, 20, yPos);
            yPos += 8;
            doc.text(`Customers: ${stats.totalCustomers}`, 20, yPos);
            yPos += 15;
            
            // Settings Summary
            doc.setFontSize(14);
            doc.text('Application Settings', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            const settings = this.getCurrentSettings();
            doc.text(`Currency: ${settings.currency}`, 20, yPos);
            yPos += 8;
            doc.text(`Low Stock Threshold: ${settings.lowStockThreshold} items`, 20, yPos);
            yPos += 8;
            doc.text(`Auto-sync: ${settings.autoSync ? 'Enabled' : 'Disabled'}`, 20, yPos);
            yPos += 8;
            doc.text(`Theme: ${settings.theme}`, 20, yPos);
            
            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
            
            // Save the PDF
            doc.save(`Farm-Profile-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            this.updatePDFStatus('Profile report downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.updatePDFStatus('Error generating PDF', 'error');
        }
    },

    exportInventoryPDF() {
        this.updatePDFStatus('Generating Inventory Report...');
        
        try {
            const inventory = window.FarmModules.appData.inventory || [];
            if (inventory.length === 0) {
                this.updatePDFStatus('No inventory data to export', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 83);
            doc.text('Inventory Report', 20, 20);
            
            // Summary
            const totalItems = inventory.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
            const totalValue = inventory.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.price) || 0)), 0);
            const lowStockItems = inventory.filter(item => (parseInt(item.quantity) || 0) <= 10).length;
            
            let yPos = 40;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Items: ${totalItems}`, 20, yPos);
            yPos += 8;
            doc.text(`Total Value: $${totalValue.toLocaleString()}`, 20, yPos);
            yPos += 8;
            doc.text(`Low Stock Items: ${lowStockItems}`, 20, yPos);
            yPos += 15;
            
            // Table header
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(33, 150, 83);
            doc.rect(20, yPos, 170, 8, 'F');
            doc.text('Item', 22, yPos + 6);
            doc.text('Quantity', 80, yPos + 6);
            doc.text('Price', 120, yPos + 6);
            doc.text('Value', 150, yPos + 6);
            yPos += 10;
            
            // Table rows
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            
            inventory.forEach((item, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const quantity = parseInt(item.quantity) || 0;
                const price = parseFloat(item.price) || 0;
                const value = quantity * price;
                const isLowStock = quantity <= 10;
                
                if (isLowStock) {
                    doc.setTextColor(220, 53, 69); // Red for low stock
                }
                
                doc.text(item.name || 'Unnamed', 22, yPos + 6);
                doc.text(quantity.toString(), 80, yPos + 6);
                doc.text(`$${price.toFixed(2)}`, 120, yPos + 6);
                doc.text(`$${value.toFixed(2)}`, 150, yPos + 6);
                
                if (isLowStock) {
                    doc.setTextColor(0, 0, 0);
                }
                
                yPos += 8;
            });
            
            doc.save(`Inventory-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            this.updatePDFStatus('Inventory report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Inventory PDF export error:', error);
            this.updatePDFStatus('Error generating inventory report', 'error');
        }
    },

    exportSalesPDF() {
        this.updatePDFStatus('Generating Sales Report...');
        
        try {
            const orders = window.FarmModules.appData.orders || [];
            if (orders.length === 0) {
                this.updatePDFStatus('No sales data to export', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 83);
            doc.text('Sales Report', 20, 20);
            
            // Summary
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
            const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
            
            let yPos = 40;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Orders: ${orders.length}`, 20, yPos);
            yPos += 8;
            doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, yPos);
            yPos += 8;
            doc.text(`Average Order: $${avgOrderValue.toFixed(2)}`, 20, yPos);
            yPos += 15;
            
            // Recent Orders Table
            doc.setFontSize(14);
            doc.text('Recent Orders', 20, yPos);
            yPos += 10;
            
            // Table header
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(33, 150, 83);
            doc.rect(20, yPos, 170, 8, 'F');
            doc.text('Order ID', 22, yPos + 6);
            doc.text('Customer', 60, yPos + 6);
            doc.text('Date', 110, yPos + 6);
            doc.text('Amount', 150, yPos + 6);
            yPos += 10;
            
            // Table rows (show last 20 orders)
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            
            const recentOrders = orders.slice(-20).reverse();
            recentOrders.forEach((order, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.text(order.orderId || `ORD-${index + 1}`, 22, yPos + 6);
                doc.text(order.customerName || 'Unknown', 60, yPos + 6);
                doc.text(order.date || 'N/A', 110, yPos + 6);
                doc.text(`$${(parseFloat(order.total) || 0).toFixed(2)}`, 150, yPos + 6);
                
                yPos += 8;
            });
            
            doc.save(`Sales-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            this.updatePDFStatus('Sales report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Sales PDF export error:', error);
            this.updatePDFStatus('Error generating sales report', 'error');
        }
    },

    exportAllPDF() {
        this.updatePDFStatus('Generating Complete Report...');
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Page 1: Cover
            doc.setFontSize(24);
            doc.setTextColor(33, 150, 83);
            doc.text('Farm Manager Complete Report', 20, 100);
            
            doc.setFontSize(16);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 120);
            
            doc.setFontSize(12);
            doc.text('Contains: Profile, Inventory, Sales, and Analytics', 20, 140);
            
            // Page 2: Profile
            doc.addPage();
            this.exportProfileToPDF(doc, 20);
            
            // Page 3: Inventory
            doc.addPage();
            this.exportInventoryToPDF(doc, 20);
            
            // Page 4: Sales
            doc.addPage();
            this.exportSalesToPDF(doc, 20);
            
            doc.save(`Complete-Farm-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            this.updatePDFStatus('Complete report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Complete PDF export error:', error);
            this.updatePDFStatus('Error generating complete report', 'error');
        }
    },

    // Helper methods for PDF export
    exportProfileToPDF(doc, startY) {
        doc.setFontSize(16);
        doc.setTextColor(33, 150, 83);
        doc.text('Farm Profile', 20, startY);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        const profile = this.getCurrentProfile();
        let yPos = startY + 15;
        
        doc.text(`Farm Name: ${profile.farmName || 'Not set'}`, 20, yPos);
        yPos += 10;
        doc.text(`Farmer: ${profile.farmerName || 'Not set'}`, 20, yPos);
        yPos += 10;
        doc.text(`Type: ${profile.farmType || 'Not set'}`, 20, yPos);
        yPos += 10;
        doc.text(`Location: ${profile.farmLocation || 'Not set'}`, 20, yPos);
        yPos += 15;
        
        const stats = this.getFarmStats();
        doc.text(`Total Revenue: $${stats.totalRevenue.toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Total Orders: ${stats.totalOrders}`, 20, yPos);
        yPos += 10;
        doc.text(`Inventory Items: ${stats.totalInventory}`, 20, yPos);
        yPos += 10;
        doc.text(`Customers: ${stats.totalCustomers}`, 20, yPos);
    },

    exportInventoryToPDF(doc, startY) {
        const inventory = window.FarmModules.appData.inventory || [];
        
        doc.setFontSize(16);
        doc.setTextColor(33, 150, 83);
        doc.text('Inventory Summary', 20, startY);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let yPos = startY + 15;
        doc.text(`Total Items: ${inventory.length}`, 20, yPos);
        
        if (inventory.length > 0) {
            yPos += 20;
            doc.setFontSize(14);
            doc.text('Top 10 Items by Quantity:', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            const topItems = [...inventory]
                .sort((a, b) => (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0))
                .slice(0, 10);
            
            topItems.forEach((item, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const quantity = parseInt(item.quantity) || 0;
                doc.text(`${index + 1}. ${item.name || 'Unnamed'}: ${quantity} units`, 25, yPos);
                yPos += 8;
            });
        }
    },

    exportSalesToPDF(doc, startY) {
        const orders = window.FarmModules.appData.orders || [];
        
        doc.setFontSize(16);
        doc.setTextColor(33, 150, 83);
        doc.text('Sales Analysis', 20, startY);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let yPos = startY + 15;
        
        if (orders.length > 0) {
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
            const avgOrder = totalRevenue / orders.length;
            
            doc.text(`Total Orders: ${orders.length}`, 20, yPos);
            yPos += 10;
            doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, yPos);
            yPos += 10;
            doc.text(`Average Order Value: $${avgOrder.toFixed(2)}`, 20, yPos);
            yPos += 20;
            
            // Show monthly trend if we have dates
            const ordersWithDates = orders.filter(o => o.date);
            if (ordersWithDates.length > 0) {
                const monthlyData = {};
                ordersWithDates.forEach(order => {
                    const month = order.date ? order.date.substring(0, 7) : 'Unknown';
                    monthlyData[month] = (monthlyData[month] || 0) + (parseFloat(order.total) || 0);
                });
                
                doc.setFontSize(14);
                doc.text('Monthly Revenue:', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                Object.entries(monthlyData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .forEach(([month, revenue]) => {
                        if (yPos > 270) {
                            doc.addPage();
                            yPos = 20;
                        }
                        
                        doc.text(`${month}: $${revenue.toFixed(2)}`, 25, yPos);
                        yPos += 8;
                    });
            }
        } else {
            doc.text('No sales data available', 20, yPos);
        }
    },

    updatePDFStatus(message, type = 'info') {
        const statusEl = document.getElementById('pdf-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = type === 'success' ? 'var(--success-color)' :
                                  type === 'error' ? 'var(--error-color)' :
                                  type === 'warning' ? 'var(--warning-color)' :
                                  'var(--text-secondary)';
        }
    },

    // Mobile Installation Methods
    sendInstallationLink() {
        const email = prompt('Enter email address to send installation link:');
        if (email && email.includes('@')) {
            const currentUrl = window.location.href;
            const subject = 'Install Farm Manager App';
            const body = `Hello,

Install the Farm Manager app on your mobile device:

📱 Install Instructions:
1. Open this link on your mobile: ${currentUrl}
2. Tap the Share button (📤)
3. Select "Add to Home Screen"

This will install the app for quick access!

Best regards,
Farm Manager Team`;
            
            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
            this.showNotification('Email opened with installation instructions', 'success');
        } else if (email) {
            this.showNotification('Please enter a valid email address', 'error');
        }
    },

    showQRCode() {
        const currentUrl = window.location.href;
        
        // Create QR Code modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div class="glass-card" style="padding: 2rem; text-align: center; max-width: 90%; max-height: 90%; overflow: auto;">
                <h3 style="margin-bottom: 1rem;">Scan to Install</h3>
                <div id="qrcode" style="background: white; padding: 1rem; margin: 0 auto 1rem auto; display: inline-block;"></div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Scan this QR code with your mobile device</p>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" id="close-qr">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Generate QR code
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById('qrcode'), {
                text: currentUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            document.getElementById('qrcode').innerHTML = `
                <div style="padding: 2rem; background: #f0f0f0; border-radius: 8px;">
                    <p>URL: ${currentUrl}</p>
                    <p><small>QR Code library not loaded</small></p>
                </div>
            `;
        }
        
        // Close button
        document.getElementById('close-qr').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },

    // Support Methods
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Clipboard error:', err);
            this.showNotification('Failed to copy', 'error');
        });
    },

    openSlackChannel() {
        // In a real app, this would open Slack
        window.open('https://slack.com', '_blank');
        this.showNotification('Opening team channel...', 'info');
    },

    openQuickGuide() {
        // Create a simple guide modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div class="glass-card" style="padding: 2rem; max-width: 600px; max-height: 80%; overflow: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0;">📖 Quick Guide</h3>
                    <button class="btn-outline" id="close-guide">✕</button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🏠 Dashboard</h4>
                        <p style="color: var(--text-secondary); margin: 0;">Overview of your farm's key metrics and quick actions.</p>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📦 Inventory</h4>
                        <p style="color: var(--text-secondary); margin: 0;">Manage your farm products, track quantities, and set reorder points.</p>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">💰 Orders</h4>
                        <p style="color: var(--text-secondary); margin: 0;">Create and manage customer orders, track payments, and generate invoices.</p>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📊 Analytics</h4>
                        <p style="color: var(--text-secondary); margin: 0;">Visualize your farm's performance with charts and reports.</p>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">👤 Profile</h4>
                        <p style="color: var(--text-secondary); margin: 0;">Manage your farm settings, export data, and configure the app.</p>
                    </div>
                    
                    <div style="background: var(--glass-bg); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">💡 Quick Tips</h4>
                        <ul style="color: var(--text-secondary); margin: 0; padding-left: 1.2rem;">
                            <li>Use keyboard shortcuts for faster navigation</li>
                            <li>Export regular backups of your data</li>
                            <li>Set up low stock alerts for inventory items</li>
                            <li>Use the mobile app for on-the-go access</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-guide').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },

    downloadQuickGuide() {
        const guideContent = `
Farm Manager - Quick Guide
==========================

📋 Key Features:

1. 🏠 DASHBOARD
   - Real-time farm metrics
   - Quick action buttons
   - Recent activity feed

2. 📦 INVENTORY MANAGEMENT
   - Add/edit/delete products
   - Track stock levels
   - Set reorder alerts
   - Manage categories

3. 💰 ORDER MANAGEMENT
   - Create customer orders
   - Process payments
   - Generate invoices
   - Track order history

4. 📊 ANALYTICS & REPORTS
   - Sales trends
   - Inventory analysis
   - Customer insights
   - Export to PDF

5. 👤 PROFILE & SETTINGS
   - Farm information
   - User preferences
   - Data backup/restore
   - Theme customization

🚀 Getting Started:

1. Set up your farm profile
2. Add your products to inventory
3. Create your first customer order
4. Explore analytics dashboard
5. Configure your preferences

💡 Tips & Tricks:

• Use keyboard shortcuts for faster navigation
• Set up low stock alerts (Profile → Settings)
• Export regular backups of your data
• Install the mobile app for on-the-go access
• Use the search function to find anything quickly

🔧 Support:

• Email: farm-support@yourcompany.com
• Team Channel: #farm-management
• Documentation: Open Quick Guide in app

📱 Mobile App:

1. Open this app in mobile browser
2. Tap Share button (📤)
3. Select "Add to Home Screen"

Generated on: ${new Date().toLocaleString()}
        `;
        
        const blob = new Blob([guideContent], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Farm-Manager-Quick-Guide.txt';
        link.click();
        URL.revokeObjectURL(link.href);
        
        this.showNotification('Quick guide downloaded!', 'success');
    },

    openYouTubeTutorials() {
        // In a real app, this would link to actual tutorial videos
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div class="glass-card" style="padding: 2rem; max-width: 500px; text-align: center;">
                <h3 style="margin-bottom: 1rem;">🎥 Video Tutorials</h3>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: var(--text-secondary); margin: 0 0 1rem 0;">Coming soon! Video tutorials are being prepared.</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">In the meantime, check out our Quick Guide for instructions.</p>
                </div>
                <button class="btn-primary" id="close-tutorials">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-tutorials').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },

    // ==================== EXISTING DATA METHODS ====================
    loadUserData() {
        const data = window.FarmModules.appData.profile || {
            farmName: "My Farm",
            farmerName: "Farm Manager",
            email: "farmer@example.com",
            farmType: "",
            farmLocation: ""
        };

        // Load form values
        document.getElementById('farm-name').value = data.farmName;
        document.getElementById('farmer-name').value = data.farmerName;
        document.getElementById('farm-type').value = data.farmType || "";
        document.getElementById('farm-location').value = data.farmLocation || "";
        
        // Update display elements
        document.getElementById('profile-farm-name').textContent = data.farmName;
        document.getElementById('profile-farmer-name').textContent = data.farmerName;
        document.getElementById('profile-email').textContent = data.email || "farmer@example.com";
        
        // Load settings
        this.loadSettings();
    },

    saveProfile() {
        const profileData = {
            farmName: document.getElementById('farm-name').value,
            farmerName: document.getElementById('farmer-name').value,
            farmType: document.getElementById('farm-type').value,
            farmLocation: document.getElementById('farm-location').value,
            lastUpdated: new Date().toISOString()
        };

        // Save to app data
        window.FarmModules.appData.profile = profileData;
        
        // Update display
        document.getElementById('profile-farm-name').textContent = profileData.farmName;
        document.getElementById('profile-farmer-name').textContent = profileData.farmerName;
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        this.showNotification('Profile saved successfully!', 'success');
        window.dispatchEvent(new CustomEvent('profile-updated'));
    },

    loadSettings() {
        const settings = window.FarmModules.appData.settings || {
            currency: 'USD',
            lowStockThreshold: 10,
            autoSync: true,
            localStorageEnabled: true,
            theme: 'auto',
            rememberUser: true
        };

        // Update form controls
        document.getElementById('default-currency').value = settings.currency;
        document.getElementById('low-stock-threshold').value = settings.lowStockThreshold;
        document.getElementById('auto-sync').checked = settings.autoSync;
        document.getElementById('local-storage').checked = settings.localStorageEnabled;
        document.getElementById('theme-selector').value = settings.theme || 'auto';
        document.getElementById('remember-user').checked = settings.rememberUser || true;
    },

    saveSetting(key, value) {
        if (!window.FarmModules.appData.settings) {
            window.FarmModules.appData.settings = {};
        }
        
        window.FarmModules.appData.settings[key] = value;
        this.saveToLocalStorage();
        this.showNotification('Setting saved!', 'success');
    },

    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.setTheme(theme);
            this.saveSetting('theme', theme);
        }
    },

    updateUserPersistence() {
        const rememberUser = document.getElementById('remember-user')?.checked || true;
        this.saveSetting('rememberUser', rememberUser);
        // In a real app, this would manage login persistence
        this.showNotification(`User will ${rememberUser ? '' : 'not '}be remembered`, 'info');
    },

    // ==================== DATA MANAGEMENT ====================
    exportData() {
        const dataStr = JSON.stringify(window.FarmModules.appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        this.showNotification('Data exported successfully!', 'success');
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
                    const importedData = JSON.parse(event.target.result);
                    
                    if (!importedData.profile) {
                        throw new Error('Invalid data format');
                    }
                    
                    if (confirm('Import this data? This will replace all current data.')) {
                        window.FarmModules.appData = importedData;
                        this.showNotification('Data imported successfully!', 'success');
                        this.updateAllDisplays();
                        this.saveToLocalStorage();
                        window.dispatchEvent(new CustomEvent('farm-data-updated'));
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Error importing data', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    clearAllData() {
        if (confirm('⚠️ WARNING: This will delete ALL data including orders, inventory, and customers. This cannot be undone. Are you sure?')) {
            window.FarmModules.appData = {
                profile: {
                    farmName: "My Farm",
                    farmerName: "Farm Manager",
                    email: "farmer@example.com"
                },
                settings: window.FarmModules.appData.settings || {},
                inventory: [],
                orders: [],
                customers: [],
                products: []
            };
            
            this.saveToLocalStorage();
            this.updateAllDisplays();
            this.showNotification('All data cleared', 'warning');
            window.dispatchEvent(new CustomEvent('farm-data-updated'));
        }
    },

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear user session data (but keep app data if remember me is enabled)
            const rememberUser = document.getElementById('remember-user')?.checked || true;
            
            if (!rememberUser) {
                localStorage.removeItem('farmManagerData');
            }
            
            // In a real app, this would redirect to login
            this.showNotification('Logged out successfully', 'info');
            
            // Refresh to show logged out state
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    },

    // ==================== SYNC & UPDATE METHODS ====================
    syncNow() {
        this.showNotification('Syncing data...', 'info');
        
        // Simulate sync delay
        setTimeout(() => {
            this.saveToLocalStorage();
            this.updateStatsFromModules();
            this.showNotification('Data synchronized successfully!', 'success');
        }, 1000);
    },

    updateAllDisplays() {
        this.updateStatsFromModules();
        this.updateDataCounts();
        this.updatePDFDataCache();
    },

    updateStatsFromModules() {
        const inventory = window.FarmModules.appData.inventory || [];
        const orders = window.FarmModules.appData.orders || [];
        const customers = window.FarmModules.appData.customers || [];
        
        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + (parseFloat(order.total) || 0);
        }, 0);
        
        // Update UI elements
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('total-inventory').textContent = inventory.length.toString();
        document.getElementById('total-orders').textContent = orders.length.toString();
        document.getElementById('total-customers').textContent = customers.length.toString();
        
        // Update profile stats
        const dataEntries = inventory.length + orders.length + customers.length;
        document.getElementById('data-entries').textContent = `Data entries: ${dataEntries}`;
        
        // Update sync status
        const syncEl = document.getElementById('sync-status');
        if (syncEl) {
            syncEl.textContent = '✅ Synced';
            syncEl.style.color = 'var(--success-color)';
        }
    },

    updateDataCounts() {
        const inventory = window.FarmModules.appData.inventory || [];
        const orders = window.FarmModules.appData.orders || [];
        const customers = window.FarmModules.appData.customers || [];
        const products = window.FarmModules.appData.products || [];
        
        document.getElementById('inventory-count').textContent = `${inventory.length} items`;
        document.getElementById('orders-count').textContent = `${orders.length} records`;
        document.getElementById('customers-count').textContent = `${customers.length} customers`;
        document.getElementById('products-count').textContent = `${products.length} products`;
    },

    updatePDFDataCache(section, action, data) {
        if (!section) {
            // Update all sections
            this.pdfDataCache.inventory = window.FarmModules.appData.inventory || [];
            this.pdfDataCache.orders = window.FarmModules.appData.orders || [];
            this.pdfDataCache.customers = window.FarmModules.appData.customers || [];
            this.pdfDataCache.products = window.FarmModules.appData.products || [];
            this.pdfDataCache.lastUpdated = new Date().toISOString();
        } else if (data) {
            this.pdfDataCache[section] = data;
            this.pdfDataCache.lastUpdated[section] = new Date().toISOString();
        }
    },

    // ==================== UTILITY METHODS ====================
    getCurrentProfile() {
        return window.FarmModules.appData.profile || {
            farmName: "My Farm",
            farmerName: "Farm Manager"
        };
    },

    getCurrentSettings() {
        return window.FarmModules.appData.settings || {
            currency: 'USD',
            lowStockThreshold: 10,
            autoSync: true,
            theme: 'auto'
        };
    },

    getFarmStats() {
        const inventory = window.FarmModules.appData.inventory || [];
        const orders = window.FarmModules.appData.orders || [];
        const customers = window.FarmModules.appData.customers || [];
        
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        
        return {
            totalRevenue: totalRevenue,
            totalOrders: orders.length,
            totalInventory: inventory.length,
            totalCustomers: customers.length
        };
    },

    saveToLocalStorage() {
        try {
            localStorage.setItem('farmManagerData', JSON.stringify(window.FarmModules.appData));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('LocalStorage save error:', error);
        }
    },

    showNotification(message, type = 'info') {
        // Use existing notification system or create simple alert
        if (window.StyleManager && window.StyleManager.showNotification) {
            window.StyleManager.showNotification(message, type);
        } else {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                color: white;
                border-radius: 8px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }
    }
};

// Add CSS animations for notifications
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Export module
window.ProfileModule = ProfileModule;
console.log('👤 Profile module loaded successfully!');
