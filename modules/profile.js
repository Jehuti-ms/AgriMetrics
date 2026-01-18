// modules/profile.js - COMPLETE FIXED VERSION
console.log('👤 Loading profile module with all fixes...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    isDarkMode: false, // Track dark mode state
    
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

    // ✅ Listen for global theme changes
    document.addEventListener('theme-changed', (e) => {
        this.onThemeChange(e.detail.theme);
    });
    
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
                /* 🔥 FIX: Center logout button text */
                #logout-btn {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    text-align: center !important;
                }
                
                /* 🔥 FIX: Ensure icon and text are centered */
                #logout-btn i, #logout-btn span {
                    display: inline-block;
                    vertical-align: middle;
                }
                
                /* Rest of your styles remain the same */
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
                .guide-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                .step { text-align: center; padding: 20px; background: var(--glass-bg); border-radius: 12px; }
                .step-number { width: 40px; height: 40px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 12px; }
                .step h4 { margin: 0 0 8px 0; color: var(--text-primary); }
                .step p { margin: 0; font-size: 14px; color: var(--text-secondary); }
                .guide-actions { display: flex; gap: 12px; margin-top: 20px; }
                .support-channels { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
                .support-channel { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--glass-bg); border-radius: 8px; }
                .support-channel-icon { font-size: 24px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--glass-bg); border-radius: 50%; }
                .support-channel-content { flex: 1; }
                .support-channel h4 { margin: 0 0 4px 0; color: var(--text-primary); }
                .support-channel p { margin: 0; font-size: 14px; color: var(--text-secondary); }
                .support-channel-actions { display: flex; gap: 8px; }
                
                /* 🔥 FIX: Enhanced logout button styling */
                #logout-btn {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s;
                    margin-top: 8px;
                    width: 100%;
                    min-height: 44px;
                }
                
                #logout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                }
                
                #logout-btn:active {
                    transform: translateY(0);
                }
                
                #logout-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                #logout-btn .logout-spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Logout confirmation modal */
                .logout-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease-out;
                }
                
                .logout-modal-content {
                    background: var(--card-bg);
                    padding: 32px;
                    border-radius: 16px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    animation: slideUp 0.3s ease-out;
                    border: 1px solid var(--glass-border);
                }
                
                .logout-modal h3 {
                    color: var(--text-primary);
                    margin-bottom: 16px;
                    font-size: 24px;
                }
                
                .logout-modal p {
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                    line-height: 1.5;
                }
                
                .logout-modal-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .logout-confirm-btn {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    min-width: 120px;
                }
                
                .logout-cancel-btn {
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    border: 1px solid var(--glass-border);
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    min-width: 120px;
                }
                
                .logout-confirm-btn:hover {
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                }
                
                .logout-cancel-btn:hover {
                    background: var(--glass-bg-hover);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 768px) { 
                    .form-row { grid-template-columns: 1fr; } 
                    .stats-overview { grid-template-columns: repeat(2, 1fr); } 
                    .pdf-buttons-container { grid-template-columns: repeat(2, 1fr); } 
                    .action-buttons { flex-direction: column; } 
                    .action-buttons button { width: 100%; } 
                    .guide-steps { grid-template-columns: 1fr; } 
                    .guide-actions { flex-direction: column; } 
                    .support-channel { flex-direction: column; text-align: center; } 
                    .support-channel-actions { width: 100%; justify-content: center; }
                    .logout-modal-buttons { flex-direction: column; }
                    .logout-modal-content { padding: 24px; }
                }
                
                @media (max-width: 480px) { 
                    .stats-overview { grid-template-columns: 1fr; } 
                    .pdf-buttons-container { grid-template-columns: 1fr; } 
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
                                <!-- 🔥 FIXED: Direct save button -->
                                <button type="button" class="btn-primary" id="save-profile-btn">
                                    <i class="fas fa-save"></i> Save Profile
                                </button>
                                <button type="button" class="btn-secondary" id="sync-now-btn">
                                    <i class="fas fa-sync"></i> Sync Now
                                </button>
                                <button type="button" class="btn-outline" id="reset-profile">
                                    <i class="fas fa-undo"></i> Reset Form
                                </button>
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
                            <button class="btn-outline" id="export-data">
                                <i class="fas fa-download"></i> Export All Data
                            </button>
                            <button class="btn-outline" id="import-data">
                                <i class="fas fa-upload"></i> Import Data
                            </button>
                            <button class="btn-primary" id="clear-all-data" style="background: var(--gradient-danger);">
                                <i class="fas fa-exclamation-triangle"></i> Clear All Data
                            </button>
                            <!-- Profile logout --> 
                              <button type="button" id="profile-logout-btn" class="logout-btn" title="Logout"> 
                              <i class="fas fa-sign-out-alt"></i> Logout 
                            </button>
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

                    <!-- Support & Help Section -->
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

        // Set up everything with proper timing
        setTimeout(() => {
            this.setupEventListeners();
            this.loadUserData();
            this.updateStatsFromModules();
        }, 100);
    },

    // ==================== EVENT LISTENERS - ULTIMATE FIX ====================
    setupEventListeners() {
        console.log('🔧 Setting up profile event listeners - DEBUG MODE');
        
        // Clear any existing listeners first
        this.removeAllEventListeners();
        
        // 🔥 FIX 1: Direct save button handler with ONE listener
        const saveBtn = document.getElementById('save-profile-btn');
        console.log('🔍 Save button found:', !!saveBtn);
        
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                console.log('💾 Save button clicked - SINGLE HANDLER');
                this.handleSaveProfile();
            };
            console.log('✅ Save button listener added');
        }
        
        // 🔥 FIX 2: Form submit prevention
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.onsubmit = (e) => {
                e.preventDefault();
                console.log('📋 Form submission prevented');
                return false;
            };
        }
        
        // 🔥 FIX 3: Farm name tracking with SINGLE listener
        const farmNameInput = document.getElementById('farm-name');
        if (farmNameInput) {
            // Only track changes, don't save automatically
            farmNameInput.oninput = (e) => {
                console.log('🏷️ Farm name changed to:', e.target.value);
            };
        }
        
        // Other buttons - SINGLE handlers
        const syncBtn = document.getElementById('sync-now-btn');
        if (syncBtn) {
            syncBtn.onclick = () => this.syncNow();
        }
        
        const resetBtn = document.getElementById('reset-profile');
        if (resetBtn) {
            resetBtn.onclick = () => {
                this.loadUserData();
                this.showNotification('Form reset to saved values', 'info');
            };
        }
        
        // Settings - SINGLE handlers
        const currencySelect = document.getElementById('default-currency');
        if (currencySelect) {
            currencySelect.onchange = (e) => {
                this.saveSetting('currency', e.target.value);
            };
        }
        
        const thresholdInput = document.getElementById('low-stock-threshold');
        if (thresholdInput) {
            thresholdInput.onchange = (e) => {
                this.saveSetting('lowStockThreshold', parseInt(e.target.value));
            };
        }
        
        const autoSyncCheck = document.getElementById('auto-sync');
        if (autoSyncCheck) {
            autoSyncCheck.onchange = (e) => {
                this.saveSetting('autoSync', e.target.checked);
            };
        }
        
        const localStorageCheck = document.getElementById('local-storage');
        if (localStorageCheck) {
            localStorageCheck.onchange = (e) => {
                this.saveSetting('localStorageEnabled', e.target.checked);
            };
        }
        
        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) {
            themeSelect.onchange = (e) => {
                this.changeTheme(e.target.value);
            };
        }
        
        // PDF Export - SINGLE handlers
        document.getElementById('export-profile-pdf')?.addEventListener('click', () => this.exportProfilePDF());
        document.getElementById('export-inventory-pdf')?.addEventListener('click', () => this.exportInventoryPDF());
        document.getElementById('export-sales-pdf')?.addEventListener('click', () => this.exportSalesPDF());
        document.getElementById('export-all-pdf')?.addEventListener('click', () => this.exportAllPDF());
        
        // Data management - SINGLE handlers
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-all-data')?.addEventListener('click', () => this.clearAllData());
        
        // 🔥 FIX 4: Logout button - SINGLE robust handler
        const logoutBtn = document.getElementById('logout-btn');
        console.log('🔍 Logout button found:', !!logoutBtn);
        
        if (logoutBtn) {
            // Remove any existing listeners
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            // Get fresh reference
            const freshLogoutBtn = document.getElementById('logout-btn');
            
            // SINGLE onclick handler
            freshLogoutBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Logout button clicked - DIRECT HANDLER');
                this.showLogoutConfirmation();
            };
            
            console.log('✅ Logout button listener added');
        } else {
            console.error('❌ Logout button NOT FOUND');
        }
        
        // Mobile installation
        document.getElementById('send-install-link')?.addEventListener('click', () => this.sendInstallationLink());
        document.getElementById('show-qr-code')?.addEventListener('click', () => this.showQRCode());
        
        // Support section - event delegation (single listener)
        this.element.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            e.preventDefault();
            const action = button.getAttribute('data-action');
            
            switch(action) {
                case 'copy-email':
                    this.copyToClipboard('farm-support@example.com');
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
        
        console.log('✅ All event listeners set up with SINGLE handlers');
    },
    
    // 🔥 NEW: Remove all existing event listeners
    removeAllEventListeners() {
        console.log('🧹 Removing existing event listeners...');
        
        // Get all buttons and remove event listeners
        const allButtons = this.element.querySelectorAll('button');
        allButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Get all inputs and remove event listeners
        const allInputs = this.element.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        });
        
        console.log('✅ Old listeners removed');
    },

    // ==================== LOGOUT SYSTEM - FIXED ====================
    showLogoutConfirmation() {
        console.log('🔒 Showing logout confirmation...');
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'logout-modal';
        modal.innerHTML = `
            <!-- Add this to your profile section -->
            <div class="logout-confirmation" id="logout-confirmation">
                <div class="logout-modal">
                    <div class="logout-modal-header">
                        <div class="logout-modal-icon">⚠️</div>
                        <h3 class="logout-modal-title">Confirm Logout</h3>
                        <p class="logout-modal-message">
                            Are you sure you want to logout? Any unsaved changes will be lost.
                        </p>
                    </div>
                    <div class="logout-modal-actions">
                        <button type="button" class="logout-modal-cancel" id="logout-cancel">Cancel</button>
                        <button type="button" class="logout-modal-confirm" id="logout-confirm">Logout</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ Logout modal created');
        
        // Add event listeners with delay
        setTimeout(() => {
            const cancelBtn = document.getElementById('logout-cancel');
            const confirmBtn = document.getElementById('logout-confirm');
            
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    console.log('❌ Logout cancelled');
                    document.body.removeChild(modal);
                };
            }
            
            if (confirmBtn) {
                confirmBtn.onclick = async () => {
                    console.log('✅ Logout confirmed');
                    await this.performLogout();
                    document.body.removeChild(modal);
                };
            }
            
            // Close on background click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    console.log('📦 Background click - closing modal');
                    document.body.removeChild(modal);
                }
            };
            
            console.log('✅ Modal listeners added');
        }, 50);
    },

   // ==================== LOGOUT SYSTEM - WITH PERSISTENCE ====================
async performLogout() {
    console.log('🚪 Starting logout process WITH PERSISTENCE...');
    
    const logoutBtn = document.getElementById('logout-btn');
    const originalHTML = logoutBtn?.innerHTML || '';
    
    try {
        // Disable button and show loading
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        }
        
        // 🔥 CRITICAL: SAVE PROFILE DATA BEFORE LOGOUT
        console.log('💾 Backing up profile data before logout...');
        const currentProfile = this.getCurrentProfileForPersistence();
        
        if (currentProfile) {
            // Save profile to multiple locations for persistence
            this.backupProfileForPersistence(currentProfile);
        }
        
        // 1. Firebase logout (optional - doesn't affect local data)
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().signOut) {
            console.log('🔥 Attempting Firebase logout...');
            try {
                await firebase.auth().signOut();
                console.log('✅ Firebase logout successful');
            } catch (firebaseError) {
                console.warn('⚠️ Firebase logout error:', firebaseError.message);
            }
        }
        
        // 2. Clear ONLY authentication/session data, NOT profile data
        console.log('🧹 Clearing authentication data ONLY...');
        this.clearAuthenticationDataOnly();
        
        // 3. Show success message
        this.showNotification('Logged out successfully! Redirecting...', 'success');
        
        // 4. Reset button
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-check"></i> Logged out!';
            logoutBtn.style.background = '#10b981';
        }
        
        // 5. Redirect to home/login page
        console.log('🔄 Redirecting...');
        setTimeout(() => {
            window.location.href = window.location.origin + window.location.pathname;
            window.location.reload(true);
        }, 1500);
        
    } catch (error) {
        console.error('❌ Logout process error:', error);
        
        // Reset button
        if (logoutBtn) {
            logoutBtn.innerHTML = originalHTML;
            logoutBtn.disabled = false;
        }
        
        this.showNotification('Logout failed: ' + error.message, 'error');
    }
},

// 🔥 NEW: Get current profile for persistence
getCurrentProfileForPersistence() {
    try {
        // Get current profile from app data
        const profile = window.FarmModules.appData?.profile;
        
        if (!profile) {
            console.log('⚠️ No profile found in app data');
            
            // Try to load from localStorage
            const savedProfile = localStorage.getItem('farm-profile');
            if (savedProfile) {
                return JSON.parse(savedProfile);
            }
            return null;
        }
        
        console.log('📋 Current profile for backup:', {
            farmName: profile.farmName,
            email: profile.email,
            lastUpdated: profile.lastUpdated
        });
        
        return profile;
        
    } catch (error) {
        console.error('❌ Error getting profile for persistence:', error);
        return null;
    }
},

// 🔥 NEW: Backup profile to multiple locations
backupProfileForPersistence(profile) {
    if (!profile) {
        console.warn('⚠️ No profile to backup');
        return;
    }
    
    console.log('💾 Backing up profile for persistence...');
    
    try {
        // 1. Save to general farm-profile (main storage)
        localStorage.setItem('farm-profile', JSON.stringify(profile));
        console.log('✅ Saved to farm-profile');
        
        // 2. Save with user email as key
        if (profile.email) {
            const userKey = `farm-profile-${profile.email}`;
            localStorage.setItem(userKey, JSON.stringify(profile));
            console.log('✅ Saved to user-specific key:', userKey);
        }
        
        // 3. Save as last-known-profile
        localStorage.setItem('farm-last-known-profile', JSON.stringify(profile));
        console.log('✅ Saved as last-known-profile');
        
        // 4. Save farm name separately for quick access
        if (profile.farmName) {
            localStorage.setItem('farm-last-name', profile.farmName);
            console.log('✅ Saved farm name separately:', profile.farmName);
        }
        
        // 5. Create a timestamped backup
        const backupKey = `farm-profile-backup-${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify({
            ...profile,
            backupTimestamp: new Date().toISOString()
        }));
        console.log('✅ Created timestamped backup');
        
    } catch (error) {
        console.error('❌ Error backing up profile:', error);
    }
},

// 🔥 NEW: Clear ONLY authentication data
clearAuthenticationDataOnly() {
    console.log('🔐 Clearing authentication data only...');
    
    const keysToRemove = [];
    const keysToKeep = [];
    
    // Scan localStorage and categorize keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Keys to REMOVE (authentication/session data)
        if (key.includes('firebase') && key.includes('auth')) {
            keysToRemove.push(key);
        } else if (key.includes('session') || key.includes('token')) {
            keysToRemove.push(key);
        } else if (key === 'farm-current-user' || key === 'firebase-auth-token') {
            keysToRemove.push(key);
        }
        
        // Keys to KEEP (profile/data)
        if (key.startsWith('farm-profile') || 
            key.includes('farm-data') ||
            key.includes('farm-last') ||
            key.includes('profile') && !key.includes('token')) {
            keysToKeep.push(key);
        }
    }
    
    console.log('🗑️ Removing authentication keys:', keysToRemove);
    console.log('💾 Keeping data keys:', keysToKeep);
    
    // Remove only authentication keys
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`❌ Removed: ${key}`);
    });
    
    // Clear sessionStorage (session data only)
    sessionStorage.clear();
    
    console.log('✅ Authentication cleared, profile data preserved');
},
    
    // 🔥 FIX: Clear only session data, keep profile
    clearSessionData() {
        console.log('🗑️ Clearing session data (keeping profile)...');
        
        // Clear Firebase auth data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('firebase') && key.includes('auth')) {
                localStorage.removeItem(key);
            }
        }
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Keep farm-profile and user-specific profiles
        // Don't clear farm-profile, farm-user-profile, or farm-profile-email keys
        
        console.log('✅ Session data cleared, profile preserved');
    },

    // ==================== SAVE PROFILE - FIXED (NO DUPLICATE LISTENERS) ====================
    async handleSaveProfile() {
        console.log('💾 Starting profile save - SINGLE ENTRY POINT');
        
        try {
            // Small delay to ensure any paste/typing completes
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Get current values directly
            const farmNameInput = document.getElementById('farm-name');
            const farmerNameInput = document.getElementById('farmer-name');
            const emailInput = document.getElementById('farm-email');
            const farmTypeInput = document.getElementById('farm-type');
            const farmLocationInput = document.getElementById('farm-location');
            
            if (!farmNameInput) {
                throw new Error('Farm name input not found');
            }
            
            // Get CURRENT values
            const farmName = farmNameInput.value.trim();
            const farmerName = farmerNameInput?.value.trim();
            const email = emailInput?.value.trim();
            const farmType = farmTypeInput?.value;
            const farmLocation = farmLocationInput?.value.trim();
            
            console.log('📝 SAVING farm name:', farmName);
            
            // Ensure profile exists
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            
            const profile = window.FarmModules.appData.profile;
            
            // Update profile
            profile.farmName = farmName || 'My Farm';
            profile.farmerName = farmerName || 'Farm Manager';
            profile.email = email || '';
            profile.farmType = farmType || '';
            profile.farmLocation = farmLocation || '';
            profile.lastUpdated = new Date().toISOString();
            
            // 🔥 FIX: Ensure persistence
            profile.currency = profile.currency || 'USD';
            profile.lowStockThreshold = profile.lowStockThreshold || 10;
            profile.autoSync = profile.autoSync !== false;
            profile.localStorageEnabled = profile.localStorageEnabled !== false;
            profile.theme = profile.theme || 'light'; // 🔥 Default to light
            profile.memberSince = profile.memberSince || new Date().toISOString();
            
            // Update app data
            window.FarmModules.appData.farmName = profile.farmName;
            
            console.log('📊 Profile to save:', profile);
            
            // 🔥 FIX: Save to localStorage with multiple keys for persistence
            this.saveToLocalStorage();
            
            // Also save with user email as key for user-specific persistence
            if (profile.email) {
                const userKey = `farm-profile-${profile.email}`;
                localStorage.setItem(userKey, JSON.stringify(profile));
                console.log('✅ Profile saved with user key:', userKey);
            }
            
            // Force immediate UI update
            this.updateProfileDisplay(true);
            
            // Show success
            this.showNotification(`✅ Profile saved! Farm: ${profile.farmName}`, 'success');
            
            // Notify other modules
            window.dispatchEvent(new CustomEvent('farm-data-updated', {
                detail: { farmName: profile.farmName }
            }));
            
            console.log('✅ Profile saved successfully');
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification('Error saving profile: ' + error.message, 'error');
        }
    },

    // ==================== USER DATA MANAGEMENT - WITH PERSISTENCE ====================
    // ==================== USER DATA MANAGEMENT - ENHANCED PERSISTENCE ====================
loadUserData() {
    console.log('📂 Loading user data with ENHANCED persistence...');
    
    try {
        let loadedProfile = null;
        let source = '';
        
        // 🔥 ENHANCED: Try multiple persistence methods in order
        const loadAttempts = [
            // 1. Try user-specific storage (by email)
            () => {
                const email = this.getCurrentUserEmail();
                if (email) {
                    const userKey = `farm-profile-${email}`;
                    const data = localStorage.getItem(userKey);
                    if (data) {
                        return { data: JSON.parse(data), source: `user-key: ${userKey}` };
                    }
                }
                return null;
            },
            
            // 2. Try general farm-profile
            () => {
                const data = localStorage.getItem('farm-profile');
                if (data) {
                    return { data: JSON.parse(data), source: 'farm-profile' };
                }
                return null;
            },
            
            // 3. Try last-known-profile
            () => {
                const data = localStorage.getItem('farm-last-known-profile');
                if (data) {
                    return { data: JSON.parse(data), source: 'last-known-profile' };
                }
                return null;
            },
            
            // 4. Try any backup
            () => {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('farm-profile-backup-')) {
                        const data = localStorage.getItem(key);
                        if (data) {
                            return { data: JSON.parse(data), source: `backup: ${key}` };
                        }
                    }
                }
                return null;
            }
        ];
        
        // Try each method
        for (const attempt of loadAttempts) {
            const result = attempt();
            if (result) {
                loadedProfile = result.data;
                source = result.source;
                console.log(`✅ Loaded profile from ${source}`);
                break;
            }
        }
        
        // 5. Create default if none found
        if (!loadedProfile) {
            console.log('🆕 Creating new profile');
            loadedProfile = {
                farmName: 'My Farm',
                farmerName: 'Farm Manager',
                email: this.getCurrentUserEmail() || '',
                farmType: '',
                farmLocation: '',
                currency: 'USD',
                lowStockThreshold: 10,
                autoSync: true,
                localStorageEnabled: true,
                theme: 'light',
                memberSince: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            source = 'new-default';
        }
        
        // 🔥 CRITICAL: Restore farm name from separate storage if available
        const savedFarmName = localStorage.getItem('farm-last-name');
        if (savedFarmName && savedFarmName !== 'My Farm') {
            console.log(`🏷️ Restoring farm name from backup: "${savedFarmName}"`);
            loadedProfile.farmName = savedFarmName;
        }
        
        // Ensure theme is light
        if (loadedProfile.theme === 'dark' || loadedProfile.theme === 'auto') {
            loadedProfile.theme = 'light';
            console.log('🌞 Forced light theme');
        }
        
        // Update app data
        window.FarmModules.appData.profile = loadedProfile;
        window.FarmModules.appData.farmName = loadedProfile.farmName;
        
        // Update UI
        this.updateProfileDisplay();
        
        console.log(`✅ User data loaded from: ${source}`);
        console.log(`🏷️ Farm name: "${loadedProfile.farmName}"`);
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
},
    
    // 🔥 NEW: Get current user email for persistence
    getCurrentUserEmail() {
        try {
            // Try Firebase first
            if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
                return firebase.auth().currentUser.email;
            }
            
            // Try localStorage
            const userData = localStorage.getItem('farm-current-user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.email;
            }
            
            // Try profile data
            if (window.FarmModules.appData.profile?.email) {
                return window.FarmModules.appData.profile.email;
            }
            
            return null;
        } catch (e) {
            console.error('Error getting user email:', e);
            return null;
        }
    },

    updateProfileDisplay(forceUpdate = false) {
        console.log('🔄 Updating profile display...');
        
        const profile = window.FarmModules.appData.profile;
        if (!profile) return;
        
        console.log('📊 Displaying profile name:', profile.farmName);
        
        // Update profile card
        const farmNameCard = document.getElementById('profile-farm-name');
        const farmerNameCard = document.getElementById('profile-farmer-name');
        const emailCard = document.getElementById('profile-email');
        
        if (farmNameCard) {
            farmNameCard.textContent = profile.farmName || 'My Farm';
            console.log(`✅ Updated profile card to: "${profile.farmName}"`);
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
        
        if (farmNameInput) {
            farmNameInput.value = profile.farmName || '';
            console.log(`✅ Set form input to: "${profile.farmName}"`);
        }
        if (farmerNameInput) farmerNameInput.value = profile.farmerName || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (farmTypeInput) farmTypeInput.value = profile.farmType || '';
        if (farmLocationInput) farmLocationInput.value = profile.farmLocation || '';
        
        // Update settings - ensure light theme
        document.getElementById('default-currency').value = profile.currency || 'USD';
        document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
        document.getElementById('auto-sync').checked = profile.autoSync !== false;
        document.getElementById('local-storage').checked = profile.localStorageEnabled !== false;
        
        // 🔥 FIX: Force light theme in selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = 'light'; // Always set to light
            console.log('🌞 Forced theme selector to light');
        }
        
        console.log('✅ Profile display updated');
    },

    // ==================== LOCAL STORAGE ====================
    saveToLocalStorage() {
        try {
            const profile = window.FarmModules.appData.profile;
            if (!profile) return;
            
            // Save to general storage
            localStorage.setItem('farm-profile', JSON.stringify(profile));
            console.log('💾 Profile saved to farm-profile');
            
            // Also save with user email as key
            if (profile.email) {
                const userKey = `farm-profile-${profile.email}`;
                localStorage.setItem(userKey, JSON.stringify(profile));
                console.log('💾 Profile saved to user key:', userKey);
            }
            
        } catch (error) {
            console.error('Error saving to local storage:', error);
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
        // 🔥 FIX: Only allow light theme
        if (theme === 'dark' || theme === 'auto') {
            this.showNotification('Dark mode is disabled. Using light theme.', 'info');
            theme = 'light';
            
            // Update selector
            const themeSelector = document.getElementById('theme-selector');
            if (themeSelector) {
                themeSelector.value = 'light';
            }
        }
        
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
            
            document.getElementById('total-orders').textContent = orders.length;
            document.getElementById('total-inventory').textContent = inventory.length;
            document.getElementById('total-customers').textContent = customers.length;
            
            const totalRevenue = orders.reduce((sum, order) => {
                return sum + (parseFloat(order.totalAmount) || 0);
            }, 0);
            document.getElementById('total-revenue').textContent = this.formatCurrency(totalRevenue);
            
            document.getElementById('orders-count').textContent = `${orders.length} records`;
            document.getElementById('inventory-count').textContent = `${inventory.length} items`;
            document.getElementById('customers-count').textContent = `${customers.length} customers`;
            document.getElementById('products-count').textContent = `${products.length} products`;
            
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

    // ==================== MOBILE INSTALLATION ====================
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
        
        document.getElementById('close-qr').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },

    // ==================== SUPPORT METHODS ====================
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

    // ==================== UTILITIES ====================
    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            if (type === 'error') alert(`❌ ${message}`);
            else if (type === 'success') alert(`✅ ${message}`);
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
    console.log('✅ Profile module registered with all fixes');
}

// 🔥 QUICK FIX FOR LOGOUT BUTTON - Run this in console if needed
function forceLogoutFix() {
    console.log('🔧 Forcing logout button fix...');
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            console.log('🚪 FORCED logout click!');
            if (confirm('Logout?')) {
                alert('Logout would happen here');
            }
        };
        console.log('✅ Forced logout fix applied');
    }
}
