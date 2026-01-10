// modules/profile.js - FIXED VERSION (EVENT LISTENER ISSUE ONLY)
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
                
                /* NEW: Installation Guide Styles */
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
                
                /* NEW: Support Section Styles */
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
                                <!-- PLACEHOLDER TEXT - Will be updated by JavaScript -->
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
                                    <input type="text" id="farm-name" class="form-input" required 
                                           placeholder="Enter farm name">
                                </div>
                                <div class="form-group">
                                    <label for="farmer-name" class="form-label">Farmer Name *</label>
                                    <input type="text" id="farmer-name" class="form-input" required 
                                           placeholder="Enter your name">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-email" class="form-label">Farm Email</label>
                                    <input type="email" id="farm-email" class="form-input" 
                                           placeholder="farm@example.com">
                                </div>
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
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="farm-location" class="form-label">Farm Location</label>
                                    <input type="text" id="farm-location" class="form-input" 
                                           placeholder="e.g., City, State">
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
                    
                    <!-- PDF EXPORT SECTION - SINGLE SECTION ONLY -->
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

                    <!-- NEW: Mobile Installation Guide -->
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

                    <!-- NEW: Support & Help Section -->
                    <div class="support-section glass-card">
                        <h3>🆘 Support & Help</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Get help with the Farm Manager app</p>
                        
                        <div class="support-channels">
                            <div class="support-channel">
                                <div class="support-channel-icon">📧</div>
                                <div class="support-channel-content">
                                    <h4>Email Support</h4>
                                    <p>farm-support@example.com</p>
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

        this.setupEventListeners();
        this.loadUserData(); 

        // 🔥 Add a small delay to ensure DOM is ready
    setTimeout(() => {
        console.log('🕒 DEBUG - DOM should be ready now');
        console.log('🕒 DEBUG - Farm name input value:', document.getElementById('farm-name')?.value);
    }, 100);
        
    },

    // ==================== FIXED EVENT LISTENERS ====================
setupEventListeners() {
    console.log('🔍 DEBUG - Setting up profile event listeners');
    
    // Get the form element
    const profileForm = document.getElementById('profile-form');
    console.log('🔍 DEBUG - Profile form found:', !!profileForm);
    
    if (profileForm) {
        // Profile form - FIXED: Use ProfileModule directly
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('🔍 DEBUG - Profile form submitted');
            
            // DEBUG: Check form values right before saving
            const farmNameValue = document.getElementById('farm-name')?.value;
            console.log('🔍 DEBUG - Farm name value at submit time:', farmNameValue);
            
            ProfileModule.saveProfile();
        });
    } else {
        console.error('❌ ERROR: Profile form not found!');
    }
    
    // Sync now button - FIXED
    document.getElementById('sync-now-btn')?.addEventListener('click', () => {
        console.log('🔍 DEBUG - Sync now clicked');
        ProfileModule.syncNow();
    });

    // Reset button - FIXED
    document.getElementById('reset-profile')?.addEventListener('click', () => {
        console.log('🔍 DEBUG - Reset profile clicked');
        ProfileModule.loadUserData();
        ProfileModule.showNotification('Profile form reset to current values', 'info');
    });

    // Settings changes - FIXED
    document.getElementById('default-currency')?.addEventListener('change', (e) => {
        ProfileModule.saveSetting('currency', e.target.value);
    });

    document.getElementById('low-stock-threshold')?.addEventListener('change', (e) => {
        ProfileModule.saveSetting('lowStockThreshold', parseInt(e.target.value));
    });

    document.getElementById('auto-sync')?.addEventListener('change', (e) => {
        ProfileModule.saveSetting('autoSync', e.target.checked);
    });

    document.getElementById('local-storage')?.addEventListener('change', (e) => {
        ProfileModule.saveSetting('localStorageEnabled', e.target.checked);
    });

    // Theme selector - FIXED
    document.getElementById('theme-selector')?.addEventListener('change', (e) => {
        ProfileModule.changeTheme(e.target.value);
    });

    // Remember user - FIXED
    document.getElementById('remember-user')?.addEventListener('change', (e) => {
        ProfileModule.saveSetting('rememberUser', e.target.checked);
        ProfileModule.updateUserPersistence();
    });

    // PDF Export buttons - FIXED
    document.getElementById('export-profile-pdf')?.addEventListener('click', () => {
        ProfileModule.exportProfilePDF();
    });

    document.getElementById('export-inventory-pdf')?.addEventListener('click', () => {
        ProfileModule.exportInventoryPDF();
    });

    document.getElementById('export-sales-pdf')?.addEventListener('click', () => {
        ProfileModule.exportSalesPDF();
    });

    document.getElementById('export-all-pdf')?.addEventListener('click', () => {
        ProfileModule.exportAllPDF();
    });

    // Data management - FIXED
    document.getElementById('export-data')?.addEventListener('click', () => {
        ProfileModule.exportData();
    });

    document.getElementById('import-data')?.addEventListener('click', () => {
        ProfileModule.importData();
    });

    document.getElementById('clear-all-data')?.addEventListener('click', () => {
        ProfileModule.clearAllData();
    });

    // Logout button - FIXED
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        ProfileModule.handleLogout();
    });

    // NEW: Mobile Installation buttons - FIXED
    document.getElementById('send-install-link')?.addEventListener('click', () => {
        ProfileModule.sendInstallationLink();
    });

    document.getElementById('show-qr-code')?.addEventListener('click', () => {
        ProfileModule.showQRCode();
    });

    // NEW: Support section event delegation - FIXED
    this.element.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        e.preventDefault();
        const action = button.getAttribute('data-action');
        
        console.log('🔍 DEBUG - Support action clicked:', action);
        
        switch(action) {
            case 'copy-email':
                ProfileModule.copyToClipboard('farm-support@example.com');
                break;
                
            case 'open-slack':
                ProfileModule.openSlackChannel();
                break;
                
            case 'open-guide':
                ProfileModule.openQuickGuide();
                break;
                
            case 'download-guide':
                ProfileModule.downloadQuickGuide();
                break;
                
            case 'watch-tutorials':
                ProfileModule.openYouTubeTutorials();
                break;
        }
    });
    
    console.log('✅ DEBUG - All profile event listeners set up');
},  // <-- THIS WAS MISSING! Add this closing brace
    
    // ==================== USER DATA MANAGEMENT ====================
 async loadUserData() {
    try {
        console.log('🔍 DEBUG - Loading user data...');
        
        // Initialize profile data if it doesn't exist
        if (!window.FarmModules.appData.profile) {
            console.log('🔍 DEBUG - Creating new profile data');
            window.FarmModules.appData.profile = {
                farmName: window.FarmModules.appData.farmName || 'My Farm',
                farmerName: 'Farm Manager',
                email: '',
                farmType: '',
                farmLocation: '',
                currency: 'USD',
                lowStockThreshold: 10,
                autoSync: true,
                rememberUser: true,
                localStorageEnabled: true,
                theme: 'auto',
                memberSince: new Date().toISOString()
            };
        }

        console.log('🔍 DEBUG - Profile data exists:', window.FarmModules.appData.profile);
        
        // Load from local storage
        this.loadFromLocalStorage();

        // 🔥🔥🔥 FIX: Update BOTH profile card AND form inputs
        this.updateProfileDisplay();
        
        console.log('✅ DEBUG - User data loaded');
    } catch (error) {
        console.error('Error loading user data:', error);
    }
},

// 🔥🔥🔥 NEW METHOD: Updates both profile card AND form inputs
updateProfileDisplay() {
    console.log('🔍 DEBUG - Updating profile display (card + form)');
    
    const profile = window.FarmModules.appData.profile;
    
    if (!profile) {
        console.error('❌ ERROR: No profile data found');
        return;
    }
    
    // 1. Update Profile Card
    document.getElementById('profile-farm-name').textContent = profile.farmName || 'My Farm';
    document.getElementById('profile-farmer-name').textContent = profile.farmerName || 'Farm Manager';
    document.getElementById('profile-email').textContent = profile.email || 'No email';
    
    const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
    document.getElementById('member-since').textContent = `Member since: ${memberSince}`;
    
    // 2. Update Form Inputs
    const farmNameInput = document.getElementById('farm-name');
    const farmerNameInput = document.getElementById('farmer-name');
    const emailInput = document.getElementById('farm-email');
    const farmTypeInput = document.getElementById('farm-type');
    const farmLocationInput = document.getElementById('farm-location');
    
    if (farmNameInput) {
        farmNameInput.value = profile.farmName || '';
        console.log(`✅ DEBUG - Set farm-name input to: "${profile.farmName}"`);
    }
    
    if (farmerNameInput) {
        farmerNameInput.value = profile.farmerName || '';
        console.log(`✅ DEBUG - Set farmer-name input to: "${profile.farmerName}"`);
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
    
    // 3. Update Settings
    document.getElementById('default-currency').value = profile.currency || 'USD';
    document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
    document.getElementById('auto-sync').checked = profile.autoSync !== false;
    document.getElementById('remember-user').checked = profile.rememberUser !== false;
    document.getElementById('local-storage').checked = profile.localStorageEnabled !== false;
    document.getElementById('theme-selector').value = profile.theme || 'auto';
    
    console.log('✅ DEBUG - Profile display updated (both card and form)');
},
    
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

    // ==================== PDF EXPORT METHODS ====================
    async exportProfilePDF() {
        this.updatePDFStatus('Generating profile report...', 'info');
        
        try {
            const profile = window.FarmModules.appData.profile;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add content
            doc.setFontSize(24);
            doc.text('Farm Profile Report', 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Farm Name: ${profile.farmName}`, 20, 40);
            doc.text(`Farmer Name: ${profile.farmerName}`, 20, 50);
            doc.text(`Farm Type: ${profile.farmType}`, 20, 60);
            doc.text(`Location: ${profile.farmLocation}`, 20, 70);
            doc.text(`Member Since: ${new Date(profile.memberSince).toLocaleDateString()}`, 20, 80);
            
            // Save
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
            
            // Header
            doc.setFontSize(24);
            doc.text('Inventory Report', 20, 20);
            
            // Summary
            doc.setFontSize(12);
            doc.text(`Total Items: ${inventory.length}`, 20, 40);
            
            let yPos = 60;
            // Table headers
            doc.setFont(undefined, 'bold');
            doc.text('Item Name', 20, yPos);
            doc.text('Category', 80, yPos);
            doc.text('Quantity', 140, yPos);
            doc.text('Price', 180, yPos);
            
            yPos += 10;
            doc.setFont(undefined, 'normal');
            
            // Table rows
            inventory.forEach((item, index) => {
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
            
            // Save
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
            
            // Header
            doc.setFontSize(24);
            doc.text('Sales Report', 20, 20);
            
            // Summary
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
            
            doc.setFontSize(12);
            doc.text(`Total Orders: ${orders.length}`, 20, 40);
            doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 50);
            
            let yPos = 70;
            // Table headers
            doc.setFont(undefined, 'bold');
            doc.text('Order ID', 20, yPos);
            doc.text('Date', 60, yPos);
            doc.text('Customer', 100, yPos);
            doc.text('Amount', 160, yPos);
            
            yPos += 10;
            doc.setFont(undefined, 'normal');
            
            // Table rows
            orders.slice(0, 20).forEach((order, index) => {
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
            
            // Save
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
            
            // Add profile
            doc.setFontSize(24);
            doc.text('Complete Farm Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
            
            // Add page breaks and call individual report methods
            // This is a simplified version - you could enhance it
            doc.addPage();
            await this.addProfileToPDF(doc);
            
            doc.addPage();
            await this.addInventoryToPDF(doc);
            
            doc.addPage();
            await this.addSalesToPDF(doc);
            
            // Save
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

    // ==================== UTILITY METHODS ====================
    updatePDFStatus(message, type = 'info') {
        const statusElement = document.getElementById('pdf-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = type === 'error' ? '#ef4444' : 
                                       type === 'success' ? '#10b981' : 
                                       'var(--text-secondary)';
        }
    },

    updateAllDisplays() {
        console.log('🔍 DEBUG - Updating all displays');
        this.updateProfileInfo();
        this.updateStatsOverview();
        this.updateDataManagement();
    },

updateProfileInfo() {
    console.log('🔍 DEBUG - Updating profile info');
    
    const profile = window.FarmModules.appData.profile;
    
    console.log('🔍 DEBUG - Current profile data:', {
        farmName: profile.farmName,
        farmerName: profile.farmerName,
        email: profile.email
    });
    
    // Get the DOM elements
    const farmNameElement = document.getElementById('profile-farm-name');
    const farmNameInput = document.getElementById('farm-name');
    
    console.log('🔍 DEBUG - DOM elements found:', {
        profileCardElement: !!farmNameElement,
        formInputElement: !!farmNameInput
    });
    
   if (farmNameElement) {
        console.log(`🔄 DEBUG - Changing profile card from "${farmNameElement.textContent}" to "${profile.farmName}"`);
        farmNameElement.textContent = profile.farmName || 'My Farm';
    }
    
    if (farmNameInput) {
        console.log(`🔄 DEBUG - Setting form input value to "${profile.farmName}"`);
        farmNameInput.value = profile.farmName || '';
    }
    
    // Update farmer name
    document.getElementById('profile-farmer-name').textContent = profile.farmerName || 'Farm Manager';
    document.getElementById('farmer-name').value = profile.farmerName || '';

    // Update profile card only
    document.getElementById('profile-farmer-name').textContent = profile.farmerName || 'Farm Manager';
    
    // Update email
     const displayEmail = profile.email || 'No email';
    document.getElementById('profile-email').textContent = displayEmail;
    document.getElementById('farm-email').value = profile.email || '';
    
    // Update other fields
    document.getElementById('farm-type').value = profile.farmType || '';
    document.getElementById('farm-location').value = profile.farmLocation || '';
    
   const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'Today';
    document.getElementById('member-since').textContent = `Member since: ${memberSince}`;
    
    // Update settings (these are checkboxes/selects, not text inputs)
    document.getElementById('default-currency').value = profile.currency || 'USD';
    document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
    document.getElementById('auto-sync').checked = profile.autoSync !== false;
    document.getElementById('remember-user').checked = profile.rememberUser !== false;
    document.getElementById('local-storage').checked = profile.localStorageEnabled !== false;
    document.getElementById('theme-selector').value = profile.theme || 'auto';
    
    console.log('✅ DEBUG - Profile info updated (form inputs preserved)');
},
    
    updateStatsOverview() {
        const stats = window.FarmModules.appData.profile.dashboardStats || {};
        
        document.getElementById('total-revenue').textContent = this.formatCurrency(stats.totalRevenue || 0);
        document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('total-inventory').textContent = stats.totalInventoryItems || 0;
        document.getElementById('total-customers').textContent = stats.totalCustomers || 0;
        
        const totalEntries = (stats.totalOrders || 0) + (stats.totalInventoryItems || 0) + (stats.totalCustomers || 0);
        document.getElementById('data-entries').textContent = `Data entries: ${totalEntries}`;
    },

    updateDataManagement() {
        const orders = window.FarmModules.appData.orders || [];
        const inventory = window.FarmModules.appData.inventory || [];
        const customers = window.FarmModules.appData.customers || [];
        const products = window.FarmModules.appData.products || [];
        
        document.getElementById('orders-count').textContent = `${orders.length} records`;
        document.getElementById('inventory-count').textContent = `${inventory.length} items`;
        document.getElementById('customers-count').textContent = `${customers.length} customers`;
        document.getElementById('products-count').textContent = `${products.length} products`;
    },

    updateStatsFromModules() {
        // Sync stats from other modules
        const orders = window.FarmModules.appData.orders || [];
        const inventory = window.FarmModules.appData.inventory || [];
        const customers = window.FarmModules.appData.customers || [];
        
        window.FarmModules.appData.profile.dashboardStats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0),
            totalInventoryItems: inventory.length,
            totalCustomers: customers.length
        };
        
        this.updateStatsOverview();
    },

    updatePDFDataCache(moduleName, action, data) {
        const now = new Date().toISOString();
        
        switch(moduleName) {
            case 'inventory':
                this.pdfDataCache.inventory = data || [];
                this.pdfDataCache.lastUpdated.inventory = now;
                break;
            case 'orders':
                this.pdfDataCache.orders = data || [];
                this.pdfDataCache.lastUpdated.orders = now;
                break;
            case 'customers':
                this.pdfDataCache.customers = data || [];
                this.pdfDataCache.lastUpdated.customers = now;
                break;
        }
    },

    // ==================== LOCAL STORAGE METHODS ====================
    saveToLocalStorage() {
        try {
            localStorage.setItem('farm-profile', JSON.stringify(window.FarmModules.appData.profile));
            console.log('✅ Profile saved to local storage');
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    },

    loadFromLocalStorage() {
        try {
            const savedProfile = localStorage.getItem('farm-profile');
            if (savedProfile) {
                window.FarmModules.appData.profile = {
                    ...window.FarmModules.appData.profile,
                    ...JSON.parse(savedProfile)
                };
                console.log('✅ Profile loaded from local storage');
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

    updateUserPersistence() {
        const rememberUser = window.FarmModules.appData.profile?.rememberUser !== false;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const persistence = rememberUser 
                ? firebase.auth.Auth.Persistence.LOCAL
                : firebase.auth.Auth.Persistence.SESSION;
            
            firebase.auth().setPersistence(persistence)
                .then(() => {
                    console.log('User persistence set to:', rememberUser ? 'LOCAL' : 'SESSION');
                })
                .catch((error) => {
                    console.error('Error setting auth persistence:', error);
                });
        }
    },

    async syncNow() {
        document.getElementById('sync-status').textContent = '🔄 Syncing...';
        
        try {
            // Save to local storage
            this.saveToLocalStorage();
            
            // Here you would add Firebase sync if needed
            this.showNotification('Data saved to local storage!', 'success');
            document.getElementById('sync-status').textContent = '💾 Local';
            
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
                window.FarmModules.appData = importData.appData;
                this.showNotification('Data imported successfully!', 'success');
                this.updateAllDisplays();
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
                    window.FarmModules.appData.orders = [];
                    window.FarmModules.appData.inventory = [];
                    window.FarmModules.appData.customers = [];
                    window.FarmModules.appData.products = [];
                    
                    if (window.FarmModules.appData.profile.dashboardStats) {
                        window.FarmModules.appData.profile.dashboardStats = {};
                    }
                    
                    this.saveToLocalStorage();
                    
                    this.showNotification('All data cleared successfully', 'success');
                    this.updateAllDisplays();
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
                // Clear data if not remembering user
                if (!window.FarmModules.appData.profile.rememberUser) {
                    const appKeys = ['farm-', 'profileData', 'transactions', 'sales', 'inventory'];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (appKeys.some(appKey => key.includes(appKey))) {
                            localStorage.removeItem(key);
                        }
                    }
                }
                
                // Show notification
                this.showNotification('Logged out successfully', 'success');
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Error during logout', 'error');
            }
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else if (type === 'warning') {
            console.warn('⚠️ ' + message);
            alert('⚠️ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    },

    formatCurrency(amount) {
        const currency = window.FarmModules.appData.profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // ==================== NEW MOBILE INSTALLATION METHODS ====================
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
                <div id="qrcode-container" style="background: white; padding: 1rem; margin: 0 auto 1rem auto; display: inline-block;"></div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Scan this QR code with your mobile device</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 1rem;">URL: ${currentUrl}</p>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" id="close-qr">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Generate QR code (if QRCode library is loaded)
        const qrContainer = document.getElementById('qrcode-container');
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: currentUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrContainer.innerHTML = `
                <div style="padding: 2rem; background: #f0f0f0; border-radius: 8px;">
                    <p>Please scan this URL:</p>
                    <p style="word-break: break-all; font-size: 12px;">${currentUrl}</p>
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

    // ==================== NEW SUPPORT METHODS ====================
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Clipboard error:', err);
            this.showNotification('Failed to copy', 'error');
        });
    },

    openSlackChannel() {
        this.showNotification('Slack integration would open here', 'info');
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

📱 Mobile App:

1. Open this app in mobile browser
2. Tap Share button (📤)
3. Select "Add to Home Screen"

🔧 Support: farm-support@example.com

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
        // Simple modal for tutorials
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
                    <p style="color: var(--text-secondary); margin: 0 0 1rem 0;">Video tutorials are coming soon!</p>
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

    // PDF helper methods (if they exist in your original)
    async addProfileToPDF(doc) {
        // Implementation if needed
    },

    async addInventoryToPDF(doc) {
        // Implementation if needed
    },

    async addSalesToPDF(doc) {
        // Implementation if needed
    }
};

// ==================== REGISTRATION ====================
if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
    console.log('✅ Profile module registered');
}
