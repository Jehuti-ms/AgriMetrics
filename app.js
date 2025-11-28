// modules/profile.js
console.log('🔧 Profile module loading...');

// Check if FarmModules exists
if (typeof FarmModules === 'undefined') {
    console.error('❌ FarmModules is not defined');
} else {
    console.log('✅ FarmModules found, registering profile module...');
}

const ProfileModule = {
    name: 'Profile',
    icon: '👤',
    
    template: `
        <div class="profile-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Farm Profile</h1>
                <p class="module-subtitle-pwa">Manage your farm information and settings</p>
            </div>

            <div class="profile-content">
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
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary-pwa">Save Profile</button>
                        </div>
                    </form>
                </div>

                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Account</h3>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline-pwa" id="logout-profile">🚪 Logout</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('🎯 Profile module INITIALIZING...');
        
        // Check if content area exists
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ content-area not found');
            return false;
        }
        
        console.log('✅ Content area found, loading template...');
        
        // Ensure appData exists
        if (!FarmModules.appData) {
            FarmModules.appData = {};
            console.log('✅ Created FarmModules.appData');
        }
        
        this.loadRealData();
        this.attachEventListeners();
        this.updateAllDisplays();
        
        console.log('✅ Profile module fully initialized');
        return true;
    },

    loadRealData: function() {
        console.log('📝 Loading profile data...');
        
        const userData = window.userData || {};
        const profileData = userData.profile || {};
        
        const farmName = profileData.farmName || 'My Farm';
        const farmerName = profileData.farmerName || 'Farmer';
        
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        
        console.log('✅ Profile data loaded');
    },

    updateAllDisplays: function() {
        console.log('🔄 Updating profile displays...');
        this.updateProfileInfo();
        this.updateStatsOverview();
    },

    updateProfileInfo: function() {
        console.log('👤 Updating profile info...');
        const appData = FarmModules.appData || {};
        const profile = appData.profile || {};
        const currentUser = this.getCurrentUser();
        
        const farmName = profile.farmName || currentUser?.farmName || 'My Farm';
        const farmerName = profile.farmerName || currentUser?.displayName || 'Farmer';
        
        this.setValue('farm-name', farmName);
        this.setValue('farmer-name', farmerName);
        console.log('✅ Profile info updated');
    },

    updateStatsOverview: function() {
        console.log('📊 Updating stats overview...');
        const appData = FarmModules.appData || {};
        const sales = appData.sales || [];
        const inventory = appData.inventory || [];
        const feedRecords = appData.feedRecords || [];
        
        this.updateElement('total-transactions', sales.length);
        this.updateElement('total-inventory', inventory.length);
        this.updateElement('total-feed-records', feedRecords.length);
        console.log('✅ Stats overview updated');
    },

    getCurrentUser: function() {
        return null; // Simplified for now
    },

    attachEventListeners: function() {
        console.log('🎯 Attaching event listeners...');
        
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
            console.log('✅ Profile form listener attached');
        } else {
            console.error('❌ Profile form not found');
        }

        const logoutBtn = document.getElementById('logout-profile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
            console.log('✅ Logout button listener attached');
        } else {
            console.error('❌ Logout button not found');
        }
        
        console.log('✅ All event listeners attached');
    },

    saveProfile: function() {
        console.log('💾 Saving profile...');
        if (!FarmModules.appData) {
            FarmModules.appData = {};
        }
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {};
        }
        
        const profile = FarmModules.appData.profile;
        profile.farmName = this.getValue('farm-name');
        profile.farmerName = this.getValue('farmer-name');

        this.showNotification('Profile saved successfully!', 'success');
        console.log('✅ Profile saved');
    },

    logout: function() {
        if (confirm('Are you sure you want to log out?')) {
            FarmModules.appData = {};
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    },

    getValue: function(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    setValue: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
            console.log(`✅ Set ${id} to: ${value}`);
        } else {
            console.error(`❌ Element ${id} not found`);
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`✅ Updated ${id} to: ${value}`);
        } else {
            console.error(`❌ Element ${id} not found`);
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

// Register the module
try {
    FarmModules.registerModule('profile', ProfileModule);
    console.log('✅ Profile module registered successfully');
} catch (error) {
    console.error('❌ Failed to register profile module:', error);
}
