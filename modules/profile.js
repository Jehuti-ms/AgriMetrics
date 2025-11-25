// modules/profile.js
FarmModules.registerModule('profile', {
    name: 'Profile',
    icon: '👤',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>User Profile</h1>
                <p>Manage your account settings and preferences</p>
            </div>

            <div class="profile-container">
                <!-- Profile Card -->
                <div class="profile-card card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <div class="avatar-placeholder" id="profile-avatar">
                                FM
                            </div>
                        </div>
                        <div class="profile-info">
                            <h2 id="profile-display-name">Loading...</h2>
                            <p id="profile-email" class="profile-email">Loading email...</p>
                            <p id="profile-role" class="profile-role">Farm Manager</p>
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value" id="profile-farm-size">0</div>
                            <div class="stat-label">Farm Size (acres)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="profile-livestock">0</div>
                            <div class="stat-label">Livestock Count</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="profile-production">0</div>
                            <div class="stat-label">Monthly Production</div>
                        </div>
                    </div>
                </div>

                <!-- Profile Form -->
                <div class="profile-form card">
                    <h3>Profile Information</h3>
                    <form id="profile-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="profile-first-name">First Name *</label>
                                <input type="text" id="profile-first-name" required placeholder="Enter your first name">
                            </div>
                            <div class="form-group">
                                <label for="profile-last-name">Last Name *</label>
                                <input type="text" id="profile-last-name" required placeholder="Enter your last name">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profile-email-input">Email Address *</label>
                                <input type="email" id="profile-email-input" required placeholder="your.email@example.com">
                            </div>
                            <div class="form-group">
                                <label for="profile-phone">Phone Number</label>
                                <input type="tel" id="profile-phone" placeholder="+1 (555) 000-0000">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="profile-farm-name">Farm Name</label>
                            <input type="text" id="profile-farm-name" placeholder="Enter your farm name">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profile-location">Location</label>
                                <input type="text" id="profile-location" placeholder="City, State">
                            </div>
                            <div class="form-group">
                                <label for="profile-farm-size-input">Farm Size (acres)</label>
                                <input type="number" id="profile-farm-size-input" min="0" placeholder="0">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="profile-bio">Bio</label>
                            <textarea id="profile-bio" placeholder="Tell us about your farm and experience..." rows="4"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-text" id="cancel-profile">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="save-profile">Save Changes</button>
                        </div>
                    </form>
                </div>

                <!-- Account Settings -->
                <div class="account-settings card">
                    <h3>Account Settings</h3>
                    <div class="settings-list">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Notification Preferences</h4>
                                <p>Manage how you receive notifications</p>
                            </div>
                            <button class="btn btn-text" id="notification-settings">Configure</button>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Privacy Settings</h4>
                                <p>Control your privacy and data sharing</p>
                            </div>
                            <button class="btn btn-text" id="privacy-settings">Manage</button>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Change Password</h4>
                                <p>Update your account password</p>
                            </div>
                            <button class="btn btn-text" id="change-password">Change</button>
                        </div>
                    </div>
                </div>

                <!-- Session Management -->
                <div class="session-management card">
                    <h3>Session</h3>
                    <div class="session-actions">
                        <div class="session-info">
                            <h4>Log Out</h4>
                            <p>Sign out of your account on this device</p>
                        </div>
                        <button class="btn btn-warning" id="logout-button">Log Out</button>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="danger-zone card">
                    <h3>Danger Zone</h3>
                    <div class="danger-actions">
                        <div class="danger-info">
                            <h4>Delete Account</h4>
                            <p>Permanently delete your account and all data</p>
                        </div>
                        <button class="btn btn-danger" id="delete-account">Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .profile-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .profile-card {
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: relative;
            overflow: hidden;
        }

        .profile-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.1);
            z-index: 1;
        }

        .profile-card > * {
            position: relative;
            z-index: 2;
        }

        .profile-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .profile-avatar {
            flex-shrink: 0;
        }

        .avatar-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .profile-info h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            color: white;
            font-weight: 600;
        }

        .profile-email {
            margin: 0 0 0.25rem 0;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }

        .profile-role {
            margin: 0;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            font-size: 0.9rem;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            display: inline-block;
        }

        .profile-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-item {
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.8);
        }

        .profile-form {
            margin-bottom: 2rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
        }

        .account-settings {
            margin-bottom: 2rem;
        }

        .settings-list {
            space-y: 0.5rem;
        }

        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .setting-item:last-child {
            border-bottom: none;
        }

        .setting-info h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            color: var(--text-color);
        }

        .setting-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .session-management {
            margin-bottom: 2rem;
            border-left: 4px solid var(--warning-color);
        }

        .session-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .session-info h4 {
            margin: 0 0 0.25rem 0;
            color: var(--warning-dark);
        }

        .session-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .danger-zone {
            border: 1px solid var(--error-color);
            border-left: 4px solid var(--error-color);
        }

        .danger-zone h3 {
            color: var(--error-color);
        }

        .danger-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .danger-info h4 {
            margin: 0 0 0.25rem 0;
            color: var(--error-color);
        }

        .danger-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .btn-warning {
            background: var(--warning-color);
            color: var(--warning-dark);
            border: 1px solid var(--warning-dark);
        }

        .btn-warning:hover {
            background: var(--warning-dark);
            color: white;
        }

        @media (max-width: 768px) {
            .profile-header {
                flex-direction: column;
                text-align: center;
            }

            .session-actions,
            .danger-actions {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }
        }
    `,

    initialize: function() {
        console.log('👤 Profile module initializing...');
        this.loadUserProfile();
        this.attachEventListeners();
        this.updateProfileStats();
    },

    loadUserProfile: function() {
        // Try to get user data from Firebase auth first
        const currentUser = this.getCurrentUser();
        
        if (currentUser) {
            this.populateProfileFromAuth(currentUser);
        } else {
            // Fallback to stored profile data
            this.loadStoredProfile();
        }
    },

    getCurrentUser: function() {
        // Try to get user from Firebase auth
        if (window.farmModules?.firebase?.getCurrentUser) {
            return window.farmModules.firebase.getCurrentUser();
        }
        
        // Fallback to auth module
        if (window.authModule?.getCurrentUser) {
            return window.authModule.getCurrentUser();
        }
        
        // Check Firebase auth directly
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        
        return null;
    },

    populateProfileFromAuth: function(user) {
        console.log('👤 Loading profile from auth:', user);
        
        const displayName = user.displayName || 'Farm Manager';
        const email = user.email || 'No email';
        
        // Update profile header
        this.updateElement('profile-display-name', displayName);
        this.updateElement('profile-email', email);
        
        // Update form fields
        this.populateFormFields(user);
        
        // Update avatar with user initials
        this.updateUserAvatar(displayName);
    },

    populateFormFields: function(user) {
        const displayName = user.displayName || '';
        const names = displayName.split(' ');
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        const email = user.email || '';
        
        // Set form values
        this.setInputValue('profile-first-name', firstName);
        this.setInputValue('profile-last-name', lastName);
        this.setInputValue('profile-email-input', email);
        
        // Load additional profile data from storage
        this.loadAdditionalProfileData();
    },

    loadAdditionalProfileData: function() {
        // Load farm-specific data from localStorage or appData
        const profileData = FarmModules.appData.profile || {};
        
        this.setInputValue('profile-farm-name', profileData.farmName || '');
        this.setInputValue('profile-phone', profileData.phone || '');
        this.setInputValue('profile-location', profileData.location || '');
        this.setInputValue('profile-farm-size-input', profileData.farmSize || '');
        this.setInputValue('profile-bio', profileData.bio || '');
    },

    loadStoredProfile: function() {
        console.log('📁 Loading stored profile data');
        
        // Load from appData or localStorage
        const profileData = FarmModules.appData.profile || {
            firstName: 'Farm',
            lastName: 'Manager',
            email: 'user@example.com',
            farmName: 'My Farm',
            farmSize: 0,
            location: ''
        };
        
        const displayName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Farm Manager';
        const email = profileData.email || 'user@example.com';
        
        // Update profile header
        this.updateElement('profile-display-name', displayName);
        this.updateElement('profile-email', email);
        
        // Update form fields
        this.setInputValue('profile-first-name', profileData.firstName || '');
        this.setInputValue('profile-last-name', profileData.lastName || '');
        this.setInputValue('profile-email-input', email);
        this.setInputValue('profile-farm-name', profileData.farmName || '');
        this.setInputValue('profile-phone', profileData.phone || '');
        this.setInputValue('profile-location', profileData.location || '');
        this.setInputValue('profile-farm-size-input', profileData.farmSize || '');
        this.setInputValue('profile-bio', profileData.bio || '');
        
        // Update avatar
        this.updateUserAvatar(displayName);
    },

    updateUserAvatar: function(displayName) {
        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement) {
            avatarElement.textContent = this.getUserInitials(displayName);
        }
    },

    getUserInitials: function(displayName) {
        if (!displayName || displayName === 'Farm Manager') {
            return 'FM';
        }
        
        return displayName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    updateProfileStats: function() {
        // Calculate stats from app data
        const production = FarmModules.appData.production || [];
        const profile = FarmModules.appData.profile || {};
        
        // Farm size
        const farmSize = profile.farmSize || 0;
        this.updateElement('profile-farm-size', farmSize);
        
        // Livestock count (placeholder)
        const livestockCount = production
            .filter(record => record.type === 'livestock')
            .reduce((sum, record) => sum + (record.animalCount || 0), 0);
        this.updateElement('profile-livestock', livestockCount);
        
        // Monthly production
        const currentMonth = new Date().getMonth();
        const monthlyProduction = production
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth;
            })
            .reduce((sum, record) => sum + (record.amount || 0), 0);
        this.updateElement('profile-production', this.formatAmount(monthlyProduction));
    },

    attachEventListeners: function() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-profile');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.loadUserProfile(); // Reload original data
            });
        }
        
        // Settings buttons
        const buttons = [
            { id: 'notification-settings', method: 'showNotificationSettings' },
            { id: 'privacy-settings', method: 'showPrivacySettings' },
            { id: 'change-password', method: 'showChangePassword' },
            { id: 'logout-button', method: 'logout' },
            { id: 'delete-account', method: 'confirmDeleteAccount' }
        ];
        
        buttons.forEach(({ id, method }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this[method]();
                });
            }
        });
        
        // Real-time display name update
        const firstNameField = document.getElementById('profile-first-name');
        const lastNameField = document.getElementById('profile-last-name');
        
        if (firstNameField && lastNameField) {
            const updateDisplayName = () => {
                const firstName = firstNameField.value || '';
                const lastName = lastNameField.value || '';
                const displayName = `${firstName} ${lastName}`.trim() || 'Farm Manager';
                this.updateElement('profile-display-name', displayName);
                this.updateUserAvatar(displayName);
            };
            
            firstNameField.addEventListener('input', updateDisplayName);
            lastNameField.addEventListener('input', updateDisplayName);
        }
    },

    saveProfile: function() {
        console.log('💾 Saving profile...');
        
        const formData = {
            firstName: this.getInputValue('profile-first-name'),
            lastName: this.getInputValue('profile-last-name'),
            email: this.getInputValue('profile-email-input'),
            phone: this.getInputValue('profile-phone'),
            farmName: this.getInputValue('profile-farm-name'),
            location: this.getInputValue('profile-location'),
            farmSize: parseInt(this.getInputValue('profile-farm-size-input')) || 0,
            bio: this.getInputValue('profile-bio')
        };
        
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.email) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Save to appData
        if (!FarmModules.appData.profile) {
            FarmModules.appData.profile = {};
        }
        
        FarmModules.appData.profile = { ...FarmModules.appData.profile, ...formData };
        
        // Update stats
        this.updateProfileStats();
        
        this.showNotification('Profile updated successfully!', 'success');
    },

    logout: function() {
        if (confirm('Are you sure you want to log out?')) {
            console.log('🚪 Logging out...');
            
            // Try Firebase logout first
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    this.handleLogoutSuccess();
                }).catch(error => {
                    console.error('Firebase logout error:', error);
                    this.handleLogoutSuccess();
                });
            } else {
                this.handleLogoutSuccess();
            }
        }
    },

    handleLogoutSuccess: function() {
        // Clear app data
        FarmModules.appData = {};
        
        // Show logout message
        this.showNotification('You have been logged out successfully', 'success');
        
        // Redirect to login or reload page
        setTimeout(() => {
            window.location.href = '/'; // or your login page
        }, 1500);
    },

    showNotificationSettings: function() {
        this.showNotification('Notification settings would open here', 'info');
    },

    showPrivacySettings: function() {
        this.showNotification('Privacy settings would open here', 'info');
    },

    showChangePassword: function() {
        this.showNotification('Password change would open here', 'info');
    },

    confirmDeleteAccount: function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            this.deleteAccount();
        }
    },

    deleteAccount: function() {
        this.showNotification('Account deletion would be processed here', 'warning');
    },

    // Utility methods
    formatAmount: function(amount) {
        if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return Math.round(amount);
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    setInputValue: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    },

    getInputValue: function(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});

console.log('✅ Profile module loaded and registered');
