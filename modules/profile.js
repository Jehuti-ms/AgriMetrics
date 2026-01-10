// modules/profile.js - FIXED PASTE ISSUE
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
        
        if (window.StyleManager) {
            window.StyleManager.registerModule(this.name, this.element, {
                onThemeChange: (theme) => this.onThemeChange(theme)
            });
        }
        
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

    setupDataSync() {
        window.addEventListener('farm-data-updated', () => {
            this.updateStatsFromModules();
        });
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <style>
                /* ... your existing styles ... */
            </style>
            
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Profile</h1>
                    <p class="module-subtitle">Manage your farm information and settings</p>
                </div>

                <div class="profile-content">
                    <!-- Farm Stats Overview -->
                    <div class="stats-overview">
                        <!-- ... your existing stats cards ... -->
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
                                    <!-- 🔥 ADDED: Debug display for pasted values -->
                                    <div id="paste-debug" style="font-size: 11px; color: #666; margin-top: 4px; display: none;">
                                        Last pasted value: <span id="pasted-value"></span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="farmer-name" class="form-label">Farmer Name *</label>
                                    <input type="text" id="farmer-name" name="farmer-name" class="form-input" required 
                                           placeholder="Enter your name">
                                </div>
                            </div>
                            
                            <!-- ... rest of your form ... -->
                            
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">💾 Save Profile</button>
                                <button type="button" class="btn-secondary" id="sync-now-btn">🔄 Sync Now</button>
                                <button type="button" class="btn-outline" id="reset-profile">Reset to Current</button>
                            </div>
                        </form>
                    </div>

                    <!-- ... rest of your sections ... -->
                </div>
            </div>
        `;

        // Wait for DOM, then set up
        setTimeout(() => {
            this.setupEventListeners();
            this.loadUserData();
            this.updateStatsFromModules();
        }, 50);
    },

    // ==================== FIXED EVENT LISTENERS - PASTE FIX ====================
    setupEventListeners() {
        console.log('🔧 Setting up profile event listeners');
        
        // Get the form element
        const profileForm = document.getElementById('profile-form');
        if (!profileForm) {
            console.error('❌ Profile form not found');
            return;
        }
        
        // 🔥 FIX: Handle paste events FIRST
        const farmNameInput = document.getElementById('farm-name');
        if (farmNameInput) {
            // Track paste events
            farmNameInput.addEventListener('paste', (e) => {
                console.log('📋 Paste event triggered');
                
                // Get the pasted text
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                console.log('📋 Pasted text:', pastedText);
                
                // Show debug info
                const debugDiv = document.getElementById('paste-debug');
                const pastedSpan = document.getElementById('pasted-value');
                if (debugDiv && pastedSpan) {
                    pastedSpan.textContent = pastedText;
                    debugDiv.style.display = 'block';
                    
                    // Hide after 3 seconds
                    setTimeout(() => {
                        debugDiv.style.display = 'none';
                    }, 3000);
                }
                
                // Wait for paste to complete, THEN update
                setTimeout(() => {
                    console.log('📋 After paste completion, input value:', farmNameInput.value);
                }, 10);
            });
            
            // Also track input events (for typing)
            farmNameInput.addEventListener('input', (e) => {
                console.log('⌨️ Input event:', e.target.value);
            });
        }
        
        // Form submission with PASTE FIX
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('✅ Form submitted');
            
            // 🔥 CRITICAL FIX: Add small delay to ensure paste completes
            setTimeout(() => {
                // Get current value AFTER paste completes
                const farmNameValue = document.getElementById('farm-name')?.value;
                console.log('🔥 FINAL farm name value at save:', farmNameValue);
                
                this.saveProfile();
            }, 50); // Small delay to ensure DOM updates
        });

        // Other buttons
        document.getElementById('sync-now-btn')?.addEventListener('click', () => this.syncNow());
        document.getElementById('reset-profile')?.addEventListener('click', () => {
            this.loadUserData();
            this.showNotification('Form reset to saved values', 'info');
        });

        // Settings
        document.getElementById('default-currency')?.addEventListener('change', (e) => {
            this.saveSetting('currency', e.target.value);
        });
        document.getElementById('low-stock-threshold')?.addEventListener('change', (e) => {
            this.saveSetting('lowStockThreshold', parseInt(e.target.value));
        });
        document.getElementById('auto-sync')?.addEventListener('change', (e) => {
            this.saveSetting('autoSync', e.target.checked);
        });
        document.getElementById('theme-selector')?.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Data management
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-all-data')?.addEventListener('click', () => this.clearAllData());

        console.log('✅ All event listeners set up');
    },

    // ==================== FIXED saveProfile FOR PASTING ====================
    async saveProfile() {
        console.log('💾 Saving profile...');
        
        try {
            // Get form values with PASTE SAFETY
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
            
            // Get current values - ensure we get the LATEST
            const farmName = farmNameInput.value.trim();
            const farmerName = farmerNameInput?.value.trim();
            const email = emailInput?.value.trim();
            const farmType = farmTypeInput?.value;
            const farmLocation = farmLocationInput?.value.trim();
            
            console.log('📝 FINAL Form values being saved:', {
                farmName,
                farmerName,
                email,
                farmType,
                farmLocation
            });
            
            // Update profile object
            let profile = window.FarmModules.appData.profile;
            if (!profile) {
                profile = {};
            }
            
            // Always update with form values
            profile.farmName = farmName || 'My Farm';
            profile.farmerName = farmerName || 'Farm Manager';
            profile.email = email || '';
            profile.farmType = farmType || '';
            profile.farmLocation = farmLocation || '';
            
            console.log(`✅ Updated farmName to: "${profile.farmName}"`);
            
            // Update app data
            window.FarmModules.appData.profile = profile;
            window.FarmModules.appData.farmName = profile.farmName;
            
            console.log('📊 Final profile object:', profile);
            
            // Save to local storage
            this.saveToLocalStorage();
            
            // 🔥 FORCE update the profile card IMMEDIATELY
            this.updateProfileCardImmediately(profile);
            
            // Show notification
            this.showNotification(`Profile saved! Farm name: ${profile.farmName}`, 'success');
            console.log('✅ Profile saved successfully');
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    },
    
    // 🔥 NEW METHOD: Force immediate update of profile card
    updateProfileCardImmediately(profile) {
        console.log('⚡ Force updating profile card immediately');
        
        // Update profile card
        const farmNameCard = document.getElementById('profile-farm-name');
        const farmerNameCard = document.getElementById('profile-farmer-name');
        const emailCard = document.getElementById('profile-email');
        
        if (farmNameCard) {
            farmNameCard.textContent = profile.farmName || 'My Farm';
            console.log(`⚡ Updated card to: "${farmNameCard.textContent}"`);
        }
        if (farmerNameCard) farmerNameCard.textContent = profile.farmerName || 'Farm Manager';
        if (emailCard) emailCard.textContent = profile.email || 'No email';
        
        // Also update member since if needed
        if (profile.memberSince) {
            const memberSince = new Date(profile.memberSince).toLocaleDateString();
            document.getElementById('member-since').textContent = `Member since: ${memberSince}`;
        }
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
        if (!profile) {
            console.error('❌ No profile data found');
            return;
        }
        
        console.log('📊 Current profile data:', profile);
        
        // Update profile card
        this.updateProfileCardImmediately(profile);
        
        // Update form inputs
        const farmNameInput = document.getElementById('farm-name');
        const farmerNameInput = document.getElementById('farmer-name');
        const emailInput = document.getElementById('farm-email');
        const farmTypeInput = document.getElementById('farm-type');
        const farmLocationInput = document.getElementById('farm-location');
        
        if (farmNameInput) {
            farmNameInput.value = profile.farmName || '';
            console.log(`✅ Set farm-name input to: "${profile.farmName}"`);
        }
        
        if (farmerNameInput) farmerNameInput.value = profile.farmerName || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (farmTypeInput) farmTypeInput.value = profile.farmType || '';
        if (farmLocationInput) farmLocationInput.value = profile.farmLocation || '';
        
        // Update settings
        document.getElementById('default-currency').value = profile.currency || 'USD';
        document.getElementById('low-stock-threshold').value = profile.lowStockThreshold || 10;
        document.getElementById('auto-sync').checked = profile.autoSync !== false;
        document.getElementById('theme-selector').value = profile.theme || 'auto';
        
        console.log('✅ Profile display updated');
    },

    // ... rest of your methods (saveSetting, saveToLocalStorage, etc.) ...

    showNotification(message, type = 'info') {
        // Your existing notification code
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(`${type === 'error' ? '❌' : '✅'} ${message}`);
        }
    }
};

// ==================== REGISTRATION ====================
if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
    console.log('✅ Profile module registered');
}
