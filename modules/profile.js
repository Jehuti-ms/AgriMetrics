// modules/profile.js - SIMPLIFIED WORKING VERSION
console.log('👤 Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    element: null,
    dataService: null,
    profileData: {
        farmName: 'My Farm',
        farmerName: 'Farm Manager',
        email: '',
        farmType: 'mixed',
        farmLocation: '',
        phone: '',
        currency: 'BBD',
        lowStockThreshold: 10
    },

    async initialize() {
        console.log('👤 Initializing Profile Module...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Get UnifiedDataService
        this.dataService = window.UnifiedDataService || null;
        
        // Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        await this.loadProfile();
        this.renderModule();
        
        this.initialized = true;
        console.log('✅ Profile module initialized');
        return true;
    },

    async loadProfile() {
        console.log('📂 Loading profile...');
        
        const userEmail = this.getUserEmail();
        
        try {
            // Try to load from Firebase first
            if (this.dataService) {
                const savedProfile = await this.dataService.get('profile');
                if (savedProfile && savedProfile.farmName) {
                    this.profileData = { ...this.profileData, ...savedProfile };
                    console.log('✅ Loaded from Firebase:', this.profileData);
                }
            }
            
            // Check localStorage for additional data
            const localProfile = localStorage.getItem('farm-profile');
            if (localProfile) {
                const parsed = JSON.parse(localProfile);
                this.profileData = { ...this.profileData, ...parsed };
                console.log('📁 Merged from localStorage');
            }
            
            // Set email if not set
            if (!this.profileData.email && userEmail) {
                this.profileData.email = userEmail;
            }
            
            // Ensure memberSince exists
            if (!this.profileData.memberSince) {
                this.profileData.memberSince = new Date().toISOString().split('T')[0];
            }
            
        } catch (error) {
            console.error('Error loading profile:', error);
        }
        
        console.log('📊 Final profile:', this.profileData);
    },

    getUserEmail() {
        try {
            if (window.firebase?.auth()?.currentUser) {
                return window.firebase.auth().currentUser.email;
            }
            const authUser = localStorage.getItem('firebase:authUser');
            if (authUser) {
                const user = JSON.parse(authUser);
                return user.email;
            }
        } catch (e) {}
        return '';
    },

    async saveProfile() {
        console.log('💾 Saving profile...');
        
        // Get values from form
        const farmName = document.getElementById('profile-farm-name')?.value || this.profileData.farmName;
        const farmerName = document.getElementById('profile-farmer-name')?.value || this.profileData.farmerName;
        const farmType = document.getElementById('profile-farm-type')?.value || this.profileData.farmType;
        const farmLocation = document.getElementById('profile-farm-location')?.value || this.profileData.farmLocation;
        const phone = document.getElementById('profile-phone')?.value || this.profileData.phone;
        const currency = document.getElementById('profile-currency')?.value || this.profileData.currency;
        const lowStockThreshold = parseInt(document.getElementById('profile-low-stock')?.value) || this.profileData.lowStockThreshold;
        
        // Update profile data
        this.profileData = {
            ...this.profileData,
            farmName,
            farmerName,
            farmType,
            farmLocation,
            phone,
            currency,
            lowStockThreshold,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            // Save to Firebase
            if (this.dataService) {
                await this.dataService.save('profile', this.profileData);
                console.log('✅ Saved to Firebase');
            }
            
            // Save to localStorage
            localStorage.setItem('farm-profile', JSON.stringify(this.profileData));
            if (this.profileData.email) {
                localStorage.setItem(`farm-profile-${this.profileData.email}`, JSON.stringify(this.profileData));
            }
            
            // Update display
            this.updateDisplay();
            
            this.showNotification('Profile saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    },

    updateDisplay() {
        // Update profile card
        const farmNameCard = document.getElementById('display-farm-name');
        if (farmNameCard) farmNameCard.textContent = this.profileData.farmName;
        
        const farmerNameCard = document.getElementById('display-farmer-name');
        if (farmerNameCard) farmerNameCard.textContent = this.profileData.farmerName;
        
        const emailCard = document.getElementById('display-email');
        if (emailCard) emailCard.textContent = this.profileData.email || this.getUserEmail();
        
        const locationCard = document.getElementById('display-location');
        if (locationCard) locationCard.textContent = this.profileData.farmLocation || 'Not set';
        
        const phoneCard = document.getElementById('display-phone');
        if (phoneCard) phoneCard.textContent = this.profileData.phone || 'Not set';
        
        const memberSinceCard = document.getElementById('display-member-since');
        if (memberSinceCard) memberSinceCard.textContent = `Member since: ${this.profileData.memberSince}`;
        
        // Update form inputs
        const farmNameInput = document.getElementById('profile-farm-name');
        if (farmNameInput) farmNameInput.value = this.profileData.farmName;
        
        const farmerNameInput = document.getElementById('profile-farmer-name');
        if (farmerNameInput) farmerNameInput.value = this.profileData.farmerName;
        
        const farmTypeSelect = document.getElementById('profile-farm-type');
        if (farmTypeSelect) farmTypeSelect.value = this.profileData.farmType;
        
        const farmLocationInput = document.getElementById('profile-farm-location');
        if (farmLocationInput) farmLocationInput.value = this.profileData.farmLocation || '';
        
        const phoneInput = document.getElementById('profile-phone');
        if (phoneInput) phoneInput.value = this.profileData.phone || '';
        
        const currencySelect = document.getElementById('profile-currency');
        if (currencySelect) currencySelect.value = this.profileData.currency;
        
        const lowStockInput = document.getElementById('profile-low-stock');
        if (lowStockInput) lowStockInput.value = this.profileData.lowStockThreshold;
    },

    toggleEditMode(showForm) {
        const viewCard = document.getElementById('profile-view-card');
        const editForm = document.getElementById('profile-edit-form');
        
        if (viewCard) viewCard.style.display = showForm ? 'none' : 'block';
        if (editForm) editForm.style.display = showForm ? 'block' : 'none';
    },

    renderModule() {
        if (!this.element) return;
        
        const email = this.profileData.email || this.getUserEmail();
        
        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Profile</h1>
                    <p class="module-subtitle">Manage your farm information</p>
                </div>

                <!-- View Mode -->
                <div id="profile-view-card" class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary);">🏠 Farm Information</h3>
                        <button id="edit-profile-btn" class="btn-outline">✏️ Edit Profile</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Farm Name</div>
                            <div id="display-farm-name" style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${this.profileData.farmName}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Farmer Name</div>
                            <div id="display-farmer-name" style="font-size: 16px; color: var(--text-primary);">${this.profileData.farmerName}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Farm Type</div>
                            <div id="display-farm-type" style="font-size: 16px; color: var(--text-primary);">${this.formatFarmType(this.profileData.farmType)}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Location</div>
                            <div id="display-location" style="font-size: 16px; color: var(--text-primary);">${this.profileData.farmLocation || 'Not set'}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Phone</div>
                            <div id="display-phone" style="font-size: 16px; color: var(--text-primary);">${this.profileData.phone || 'Not set'}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Email</div>
                            <div id="display-email" style="font-size: 16px; color: var(--text-primary);">${email}</div>
                        </div>
                    </div>
                    <div id="display-member-since" style="margin-top: 16px; font-size: 12px; color: var(--text-secondary);">
                        Member since: ${this.profileData.memberSince}
                    </div>
                </div>

                <!-- Edit Mode (Hidden by default) -->
                <div id="profile-edit-form" class="glass-card" style="padding: 24px; display: none;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">✏️ Edit Farm Profile</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label class="form-label">Farm Name</label>
                            <input type="text" id="profile-farm-name" class="form-input" value="${this.profileData.farmName}">
                        </div>
                        <div>
                            <label class="form-label">Farmer Name</label>
                            <input type="text" id="profile-farmer-name" class="form-input" value="${this.profileData.farmerName}">
                        </div>
                        <div>
                            <label class="form-label">Farm Type</label>
                            <select id="profile-farm-type" class="form-input">
                                <option value="crop" ${this.profileData.farmType === 'crop' ? 'selected' : ''}>🌾 Crop</option>
                                <option value="livestock" ${this.profileData.farmType === 'livestock' ? 'selected' : ''}>🐄 Livestock</option>
                                <option value="poultry" ${this.profileData.farmType === 'poultry' ? 'selected' : ''}>🐔 Poultry</option>
                                <option value="mixed" ${this.profileData.farmType === 'mixed' ? 'selected' : ''}>🌾🐄 Mixed</option>
                                <option value="dairy" ${this.profileData.farmType === 'dairy' ? 'selected' : ''}>🥛 Dairy</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Location</label>
                            <input type="text" id="profile-farm-location" class="form-input" value="${this.profileData.farmLocation || ''}">
                        </div>
                        <div>
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="profile-phone" class="form-input" value="${this.profileData.phone || ''}">
                        </div>
                        <div>
                            <label class="form-label">Currency</label>
                            <select id="profile-currency" class="form-input">
                                <option value="USD" ${this.profileData.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                <option value="EUR" ${this.profileData.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                                <option value="GBP" ${this.profileData.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                                <option value="BBD" ${this.profileData.currency === 'BBD' ? 'selected' : ''}>BBD (Bds$)</option>
                                <option value="CAD" ${this.profileData.currency === 'CAD' ? 'selected' : ''}>CAD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Low Stock Threshold</label>
                            <input type="number" id="profile-low-stock" class="form-input" value="${this.profileData.lowStockThreshold}" min="1" max="100">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="cancel-edit-btn" class="btn-outline">Cancel</button>
                        <button id="save-profile-btn" class="btn-primary">💾 Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateDisplay();
    },

    setupEventListeners() {
        // Edit button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.onclick = () => this.toggleEditMode(true);
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.toggleEditMode(false);
                this.updateDisplay(); // Reset form values
            };
        }
        
        // Save button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                await this.saveProfile();
                this.toggleEditMode(false);
            };
        }
    },

    formatFarmType(type) {
        const types = {
            'crop': '🌾 Crop Farming',
            'livestock': '🐄 Livestock',
            'poultry': '🐔 Poultry',
            'mixed': '🌾🐄 Mixed Farming',
            'dairy': '🥛 Dairy'
        };
        return types[type] || 'Mixed Farming';
    },

    showNotification(message, type = 'info') {
        if (window.App?.showNotification) {
            window.App.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
            alert(message);
        }
    },

    unload() {
        console.log('📦 Unloading Profile module...');
        this.initialized = false;
    }
};

// Register the module
(function() {
    const MODULE_NAME = 'profile';
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, ProfileModule);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
