// modules/profile.js
console.log('Loading profile module...');

class ProfileModule {
    constructor() {
        this.name = 'profile';
        this.initialized = false;
        this.container = null;
        this.userData = {};
        this.farmData = {};
    }

    async initialize() {
        console.log('👤 Initializing profile...');
        await this.loadProfileData();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadProfileData() {
        try {
            if (window.db) {
                this.userData = await window.db.get('profile', 'user') || this.getDefaultUserData();
                this.farmData = await window.db.get('profile', 'farm') || this.getDefaultFarmData();
            } else {
                this.userData = JSON.parse(localStorage.getItem('farm-user-profile') || 'null') || this.getDefaultUserData();
                this.farmData = JSON.parse(localStorage.getItem('farm-data') || 'null') || this.getDefaultFarmData();
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.userData = this.getDefaultUserData();
            this.farmData = this.getDefaultFarmData();
        }
    }

    getDefaultUserData() {
        return {
            id: 'user_1',
            name: 'Farm Manager',
            email: 'manager@farm.com',
            phone: '+1 (555) 123-4567',
            role: 'Farm Manager',
            joinDate: new Date().toISOString(),
            avatar: '👨‍🌾',
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            preferences: {
                theme: 'light',
                language: 'en',
                currency: 'USD',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };
    }

    getDefaultFarmData() {
        return {
            id: 'farm_1',
            name: 'Green Valley Farm',
            type: 'Poultry & Crops',
            address: {
                street: '123 Farm Road',
                city: 'Agricultural City',
                state: 'Farm State',
                zipCode: '12345',
                country: 'United States'
            },
            contact: {
                phone: '+1 (555) 123-4567',
                email: 'info@greenvalleyfarm.com',
                website: 'www.greenvalleyfarm.com'
            },
            operations: {
                established: '2010',
                size: '50 acres',
                employees: 12,
                specialties: ['Broiler Chickens', 'Egg Production', 'Organic Vegetables']
            },
            settings: {
                units: 'metric',
                dateFormat: 'MM/DD/YYYY',
                autoBackup: true,
                dataRetention: 365
            }
        };
    }

    async saveProfileData() {
        try {
            if (window.db) {
                await window.db.put('profile', this.userData, 'user');
                await window.db.put('profile', this.farmData, 'farm');
            } else {
                localStorage.setItem('farm-user-profile', JSON.stringify(this.userData));
                localStorage.setItem('farm-data', JSON.stringify(this.farmData));
            }
        } catch (error) {
            console.error('Error saving profile data:', error);
        }
    }

    async updateUserProfile(updates) {
        this.userData = { ...this.userData, ...updates };
        await this.saveProfileData();
        await this.updateDisplay();
        this.showToast('Profile updated successfully!', 'success');
    }

    async updateFarmProfile(updates) {
        this.farmData = { ...this.farmData, ...updates };
        await this.saveProfileData();
        await this.updateDisplay();
        this.showToast('Farm information updated!', 'success');
    }

    async updatePreferences(updates) {
        this.userData.preferences = { ...this.userData.preferences, ...updates };
        await this.saveProfileData();
        this.showToast('Preferences saved!', 'success');
    }

    async updateNotificationSettings(updates) {
        this.userData.notifications = { ...this.userData.notifications, ...updates };
        await this.saveProfileData();
        this.showToast('Notification settings updated!', 'success');
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.profile-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="profile-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Profile & Settings</h1>
                        <p class="header-subtitle">Manage your account and farm information</p>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="profile-grid">
                    <!-- Left Column - User Profile -->
                    <div class="profile-column">
                        <!-- User Card -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>👤 Personal Information</h3>
                                <button class="btn-text" id="edit-profile-btn">
                                    <i class="icon">✏️</i>
                                    Edit
                                </button>
                            </div>
                            <div class="card-content">
                                <div class="avatar-section">
                                    <div class="avatar-large" id="user-avatar">👨‍🌾</div>
                                    <div class="avatar-info">
                                        <div class="user-name" id="user-name">Farm Manager</div>
                                        <div class="user-role" id="user-role">Farm Manager</div>
                                    </div>
                                </div>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Email</label>
                                        <div class="info-value" id="user-email">manager@farm.com</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Phone</label>
                                        <div class="info-value" id="user-phone">+1 (555) 123-4567</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Member Since</label>
                                        <div class="info-value" id="user-join-date">${new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Farm Information -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>🏠 Farm Information</h3>
                                <button class="btn-text" id="edit-farm-btn">
                                    <i class="icon">✏️</i>
                                    Edit
                                </button>
                            </div>
                            <div class="card-content">
                                <div class="farm-header">
                                    <div class="farm-avatar">🏠</div>
                                    <div class="farm-info">
                                        <div class="farm-name" id="farm-name">Green Valley Farm</div>
                                        <div class="farm-type" id="farm-type">Poultry & Crops</div>
                                    </div>
                                </div>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Address</label>
                                        <div class="info-value" id="farm-address">123 Farm Road, Agricultural City</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Contact</label>
                                        <div class="info-value" id="farm-contact">+1 (555) 123-4567</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Established</label>
                                        <div class="info-value" id="farm-established">2010</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Farm Size</label>
                                        <div class="info-value" id="farm-size">50 acres</div>
                                    </div>
                                    <div class="info-item">
                                        <label>Employees</label>
                                        <div class="info-value" id="farm-employees">12</div>
                                    </div>
                                </div>
                                <div class="specialties">
                                    <label>Specialties</label>
                                    <div class="tags-container" id="farm-specialties">
                                        <!-- Tags will be populated here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Settings -->
                    <div class="settings-column">
                        <!-- Preferences -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>⚙️ Preferences</h3>
                            </div>
                            <div class="card-content">
                                <div class="setting-group">
                                    <label for="theme-select">Theme</label>
                                    <select id="theme-select" class="setting-select">
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label for="language-select">Language</label>
                                    <select id="language-select" class="setting-select">
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label for="currency-select">Currency</label>
                                    <select id="currency-select" class="setting-select">
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label for="units-select">Measurement Units</label>
                                    <select id="units-select" class="setting-select">
                                        <option value="metric">Metric (kg, cm)</option>
                                        <option value="imperial">Imperial (lb, in)</option>
                                    </select>
                                </div>
                                <div class="setting-group">
                                    <label for="date-format-select">Date Format</label>
                                    <select id="date-format-select" class="setting-select">
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>🔔 Notifications</h3>
                            </div>
                            <div class="card-content">
                                <div class="setting-group toggle-group">
                                    <label for="email-notifications">Email Notifications</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="email-notifications" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-group toggle-group">
                                    <label for="sms-notifications">SMS Notifications</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="sms-notifications">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-group toggle-group">
                                    <label for="push-notifications">Push Notifications</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="push-notifications" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-group toggle-group">
                                    <label for="auto-backup">Automatic Backup</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="auto-backup" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>🔧 Actions</h3>
                            </div>
                            <div class="card-content">
                                <div class="action-buttons-vertical">
                                    <button class="btn-secondary full-width" id="export-data-btn">
                                        <i class="icon">📤</i>
                                        Export All Data
                                    </button>
                                    <button class="btn-secondary full-width" id="backup-btn">
                                        <i class="icon">💾</i>
                                        Create Backup
                                    </button>
                                    <button class="btn-secondary full-width" id="clear-cache-btn">
                                        <i class="icon">🧹</i>
                                        Clear Cache
                                    </button>
                                    <button class="btn-danger full-width" id="reset-data-btn">
                                        <i class="icon">🔄</i>
                                        Reset All Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- System Info -->
                        <div class="profile-card">
                            <div class="card-header">
                                <h3>📊 System Information</h3>
                            </div>
                            <div class="card-content">
                                <div class="system-info">
                                    <div class="system-item">
                                        <label>App Version</label>
                                        <div class="system-value">1.0.0</div>
                                    </div>
                                    <div class="system-item">
                                        <label>Last Backup</label>
                                        <div class="system-value" id="last-backup">Never</div>
                                    </div>
                                    <div class="system-item">
                                        <label>Data Size</label>
                                        <div class="system-value" id="data-size">Calculating...</div>
                                    </div>
                                    <div class="system-item">
                                        <label>Storage</label>
                                        <div class="system-value" id="storage-type">Local Storage</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async updateDisplay() {
        if (!this.container) return;

        // Update user information
        this.updateElement('#user-avatar', this.userData.avatar);
        this.updateElement('#user-name', this.userData.name);
        this.updateElement('#user-role', this.userData.role);
        this.updateElement('#user-email', this.userData.email);
        this.updateElement('#user-phone', this.userData.phone);
        this.updateElement('#user-join-date', new Date(this.userData.joinDate).toLocaleDateString());

        // Update farm information
        this.updateElement('#farm-name', this.farmData.name);
        this.updateElement('#farm-type', this.farmData.type);
        this.updateElement('#farm-address', `${this.farmData.address.street}, ${this.farmData.address.city}`);
        this.updateElement('#farm-contact', this.farmData.contact.phone);
        this.updateElement('#farm-established', this.farmData.operations.established);
        this.updateElement('#farm-size', this.farmData.operations.size);
        this.updateElement('#farm-employees', this.farmData.operations.employees);

        // Update specialties tags
        const specialtiesContainer = this.container.querySelector('#farm-specialties');
        if (specialtiesContainer) {
            specialtiesContainer.innerHTML = this.farmData.operations.specialties
                .map(specialty => `<span class="tag">${specialty}</span>`)
                .join('');
        }

        // Update preferences
        this.updateSelect('#theme-select', this.userData.preferences.theme);
        this.updateSelect('#language-select', this.userData.preferences.language);
        this.updateSelect('#currency-select', this.userData.preferences.currency);
        this.updateSelect('#units-select', this.farmData.settings.units);
        this.updateSelect('#date-format-select', this.farmData.settings.dateFormat);

        // Update notification toggles
        this.updateToggle('#email-notifications', this.userData.notifications.email);
        this.updateToggle('#sms-notifications', this.userData.notifications.sms);
        this.updateToggle('#push-notifications', this.userData.notifications.push);
        this.updateToggle('#auto-backup', this.farmData.settings.autoBackup);

        // Update system info
        await this.updateSystemInfo();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    updateSelect(selector, value) {
        const select = this.container?.querySelector(selector);
        if (select) select.value = value;
    }

    updateToggle(selector, checked) {
        const toggle = this.container?.querySelector(selector);
        if (toggle) toggle.checked = checked;
    }

    async updateSystemInfo() {
        // Calculate data size
        let totalSize = 0;
        const keys = [
            'farm-sales-data', 'farm-production', 'farm-broiler-mortality', 
            'farm-orders', 'farm-user-profile', 'farm-data'
        ];
        
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        });

        this.updateElement('#data-size', this.formatBytes(totalSize));
        this.updateElement('#storage-type', window.db ? 'IndexedDB' : 'Local Storage');
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    setupEventListeners() {
        if (!this.container) return;

        // Edit profile button
        this.container.querySelector('#edit-profile-btn')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        // Edit farm button
        this.container.querySelector('#edit-farm-btn')?.addEventListener('click', () => {
            this.showEditFarmModal();
        });

        // Preference changes
        this.container.querySelector('#theme-select')?.addEventListener('change', (e) => {
            this.updatePreferences({ theme: e.target.value });
        });

        this.container.querySelector('#language-select')?.addEventListener('change', (e) => {
            this.updatePreferences({ language: e.target.value });
        });

        this.container.querySelector('#currency-select')?.addEventListener('change', (e) => {
            this.updatePreferences({ currency: e.target.value });
        });

        this.container.querySelector('#units-select')?.addEventListener('change', (e) => {
            this.updateFarmProfile({ 
                settings: { ...this.farmData.settings, units: e.target.value }
            });
        });

        this.container.querySelector('#date-format-select')?.addEventListener('change', (e) => {
            this.updateFarmProfile({ 
                settings: { ...this.farmData.settings, dateFormat: e.target.value }
            });
        });

        // Notification toggles
        this.container.querySelector('#email-notifications')?.addEventListener('change', (e) => {
            this.updateNotificationSettings({ email: e.target.checked });
        });

        this.container.querySelector('#sms-notifications')?.addEventListener('change', (e) => {
            this.updateNotificationSettings({ sms: e.target.checked });
        });

        this.container.querySelector('#push-notifications')?.addEventListener('change', (e) => {
            this.updateNotificationSettings({ push: e.target.checked });
        });

        this.container.querySelector('#auto-backup')?.addEventListener('change', (e) => {
            this.updateFarmProfile({ 
                settings: { ...this.farmData.settings, autoBackup: e.target.checked }
            });
        });

        // Action buttons
        this.container.querySelector('#export-data-btn')?.addEventListener('click', () => {
            this.exportAllData();
        });

        this.container.querySelector('#backup-btn')?.addEventListener('click', () => {
            this.createBackup();
        });

        this.container.querySelector('#clear-cache-btn')?.addEventListener('click', () => {
            this.clearCache();
        });

        this.container.querySelector('#reset-data-btn')?.addEventListener('click', () => {
            this.confirmResetData();
        });
    }

    showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Profile</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="edit-profile-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="profile-name">Full Name *</label>
                            <input type="text" id="profile-name" name="name" value="${this.userData.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email Address *</label>
                            <input type="email" id="profile-email" name="email" value="${this.userData.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-phone">Phone Number</label>
                            <input type="tel" id="profile-phone" name="phone" value="${this.userData.phone}">
                        </div>
                        <div class="form-group">
                            <label for="profile-role">Role</label>
                            <input type="text" id="profile-role" name="role" value="${this.userData.role}">
                        </div>
                        <div class="form-group">
                            <label for="profile-avatar">Avatar Emoji</label>
                            <input type="text" id="profile-avatar" name="avatar" value="${this.userData.avatar}" maxlength="2">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        modal.querySelector('#edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updates = Object.fromEntries(formData);
            
            await this.updateUserProfile(updates);
            closeModal();
        });
    }

    showEditFarmModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Farm Information</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="edit-farm-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="farm-name">Farm Name *</label>
                            <input type="text" id="farm-name" name="name" value="${this.farmData.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="farm-type">Farm Type</label>
                            <input type="text" id="farm-type" name="type" value="${this.farmData.type}">
                        </div>
                        <div class="form-group">
                            <label for="farm-street">Street Address</label>
                            <input type="text" id="farm-street" name="street" value="${this.farmData.address.street}">
                        </div>
                        <div class="form-group">
                            <label for="farm-city">City</label>
                            <input type="text" id="farm-city" name="city" value="${this.farmData.address.city}">
                        </div>
                        <div class="form-group">
                            <label for="farm-state">State</label>
                            <input type="text" id="farm-state" name="state" value="${this.farmData.address.state}">
                        </div>
                        <div class="form-group">
                            <label for="farm-zip">ZIP Code</label>
                            <input type="text" id="farm-zip" name="zipCode" value="${this.farmData.address.zipCode}">
                        </div>
                        <div class="form-group">
                            <label for="farm-phone">Contact Phone</label>
                            <input type="tel" id="farm-phone" name="contactPhone" value="${this.farmData.contact.phone}">
                        </div>
                        <div class="form-group">
                            <label for="farm-email">Contact Email</label>
                            <input type="email" id="farm-email" name="contactEmail" value="${this.farmData.contact.email}">
                        </div>
                        <div class="form-group">
                            <label for="farm-established">Year Established</label>
                            <input type="number" id="farm-established" name="established" value="${this.farmData.operations.established}">
                        </div>
                        <div class="form-group">
                            <label for="farm-size">Farm Size</label>
                            <input type="text" id="farm-size" name="size" value="${this.farmData.operations.size}">
                        </div>
                        <div class="form-group">
                            <label for="farm-employees">Number of Employees</label>
                            <input type="number" id="farm-employees" name="employees" value="${this.farmData.operations.employees}">
                        </div>
                        <div class="form-group full-width">
                            <label for="farm-specialties">Specialties (comma-separated)</label>
                            <input type="text" id="farm-specialties" name="specialties" value="${this.farmData.operations.specialties.join(', ')}">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        modal.querySelector('#edit-farm-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const updates = {
                name: data.name,
                type: data.type,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    country: this.farmData.address.country
                },
                contact: {
                    phone: data.contactPhone,
                    email: data.contactEmail,
                    website: this.farmData.contact.website
                },
                operations: {
                    established: data.established,
                    size: data.size,
                    employees: parseInt(data.employees),
                    specialties: data.specialties.split(',').map(s => s.trim()).filter(s => s)
                }
            };
            
            await this.updateFarmProfile(updates);
            closeModal();
        });
    }

    async exportAllData() {
        const allData = {
            user: this.userData,
            farm: this.farmData,
            sales: JSON.parse(localStorage.getItem('farm-sales-data') || '[]'),
            production: JSON.parse(localStorage.getItem('farm-production') || '[]'),
            mortality: JSON.parse(localStorage.getItem('farm-broiler-mortality') || '[]'),
            orders: JSON.parse(localStorage.getItem('farm-orders') || '[]'),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast('All data exported successfully!', 'success');
    }

    async createBackup() {
        // For now, we'll use export as backup
        await this.exportAllData();
        this.updateElement('#last-backup', new Date().toLocaleString());
        this.showToast('Backup created successfully!', 'success');
    }

    async clearCache() {
        if (confirm('Are you sure you want to clear the cache? This will not delete your data.')) {
            // Clear service worker cache if exists
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Clear any other cached data
            localStorage.removeItem('app-cache');
            
            this.showToast('Cache cleared successfully!', 'success');
        }
    }

    confirmResetData() {
        if (confirm('⚠️ WARNING: This will delete ALL your data and cannot be undone! Are you absolutely sure?')) {
            if (confirm('This is your final warning. All farm data will be permanently deleted. Continue?')) {
                this.resetAllData();
            }
        }
    }

    async resetAllData() {
        try {
            // Clear all localStorage data
            const keys = [
                'farm-sales-data', 'farm-production', 'farm-broiler-mortality',
                'farm-orders', 'farm-user-profile', 'farm-data'
            ];
            
            keys.forEach(key => localStorage.removeItem(key));

            // Clear IndexedDB if used
            if (window.db) {
                await window.db.clear('sales');
                await window.db.clear('production');
                await window.db.clear('broiler-mortality');
                await window.db.clear('orders');
                await window.db.clear('profile');
            }

            // Reload profile data to get defaults
            await this.loadProfileData();
            await this.updateDisplay();

            this.showToast('All data has been reset to defaults.', 'success');
            
            // Refresh the page to ensure clean state
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showToast('Error resetting data', 'error');
        }
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('profile', new ProfileModule());
    console.log('✅ Profile module registered');
}
