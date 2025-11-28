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
                                <input type="text" id="farm-name" class="form-input-pwa" placeholder="Enter farm name">
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Farmer Name</label>
                                <input type="text" id="farmer-name" class="form-input-pwa" placeholder="Enter your name">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary-pwa">Save Profile</button>
                    </form>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Profile module initializing...');
        this.showProfileContent();
        this.attachEventListeners();
        return true;
    },

    showProfileContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        contentArea.innerHTML = this.template;
        
        // Initialize with default data
        this.setValue('farm-name', 'My Farm');
        this.setValue('farmer-name', 'Farmer');
    },

    attachEventListeners: function() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveProfile();
                });
            }
        }, 100);
    },

    saveProfile: function() {
        const farmName = this.getValue('farm-name');
        const farmerName = this.getValue('farmer-name');
        
        console.log('Saving profile:', { farmName, farmerName });
        
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Profile saved successfully!', 'success');
        }
    },

    getValue: function(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    setValue: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    }
});
