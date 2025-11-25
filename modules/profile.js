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
                            <div class="avatar-placeholder">
                                ${this.getUserInitials()}
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
                                <label for="profile-email">Email Address *</label>
                                <input type="email" id="profile-email" required placeholder="your.email@example.com">
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
                                <label for="profile-farm-size">Farm Size (acres)</label>
                                <input type="number" id="profile-farm-size" min="0" placeholder="0">
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
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            color: white;
        }

        .profile-info h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            color: var(--text-color);
        }

        .profile-email {
            margin: 0 0 0.25rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .profile-role {
            margin: 0;
            color: var(--primary-color);
            font-weight: 500;
            font-size: 0.9rem;
        }

        .profile-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-color);
        }

        .stat-item {
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--text-muted);
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

        .danger-zone {
            border: 1px solid var(--error-color);
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

        @media (max-width: 768px) {
            .profile-header {
                flex-direction: column;
                text-align: center;
            }

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
        if (firebase?.auth?.().currentUser) {
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
        const [firstName, lastName] = displayName.split(' ') || ['', ''];
        const email = user.email || '';
        
        // Set form values
        const firstNameField = document.getElementById('profile-first-name');
        const lastNameField = document.getElementById('profile-last-name');
        const emailField = document.getElementById('profile-email');
        
        if (firstNameField) firstNameField.value = firstName;
        if (lastNameField) lastNameField.value = lastName;
        if (emailField) emailField.value = email;
        
        // Load additional profile data from storage
        this.loadAdditionalProfileData();
    },

    loadAdditionalProfileData: function() {
        // Load farm-specific data from localStorage or appData
        const profileData = FarmModules.appData.profile || {};
        
        const farmNameField = document.getElementById('profile-farm-name');
        const phoneField = document.getElementById('profile-phone');
        const locationField = document.getElementById('profile-location');
        const farmSizeField = document.getElementById('profile-farm-size');
        const bioField = document.getElementById('profile-bio');
        
        if (farmNameField) farmNameField.value = profileData.farmName || '';
        if (phoneField) phoneField.value = profileData.phone || '';
        if (locationField) locationField.value = profileData.location || '';
        if (farmSizeField) farmSizeField.value = profileData.farmSize || '';
        if (bioField) bioField.value = profileData.bio || '';
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
        const firstNameField = document.getElementById('profile-first-name');
        const lastNameField = document.getElementById('profile-last-name');
        const emailField = document.getElementById('profile-email');
        const farmNameField = document.getElementById('profile-farm-name');
        const phoneField = document.getElementById('profile-phone');
        const locationField = document.getElementById('profile-location');
        const farmSizeField = document.getElementById('profile-farm-size');
        const bioField = document.getElementById('profile-bio');
        
        if (firstNameField) firstNameField.value = profileData.firstName || '';
        if (lastNameField) lastNameField.value = profileData.lastName || '';
        if (emailField) emailField.value = email;
        if (farmNameField) farmNameField.value = profileData.farmName || '';
        if (phoneField) phoneField.value = profileData.phone || '';
        if (locationField) locationField.value = profileData.location || '';
        if (farmSizeField) farmSizeField.value = profileData.farmSize || '';
        if (bioField) bioField.value = profileData.bio || '';
        
        // Update avatar
        this.updateUserAvatar(displayName);
    },

    updateUserAvatar: function(displayName) {
        const avatarElement = document.querySelector('.avatar-placeholder');
        if (avatarElement) {
            avatarElement.textContent = this.getUserInitials(displayName);
        }
    },

    getUserInitials: function(displayName = '') {
        if (!displayName) {
            const user = this.getCurrentUser();
            displayName = user?.displayName || 'Farm Manager';
        }
        
        return displayName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'FM';
    },

    updateProfileStats: function() {
        // Calculate stats from app data
        const sales = FarmModules.appData.sales || [];
        const production = FarmModules.appData.production || [];
        const profile = FarmModules.appData.profile || {};
        
        // Farm size
        const farmSize = profile.farmSize || 0;
        this.updateElement('profile-farm-size', farmSize);
        
        // Livestock count (placeholder - would need livestock data)
        const livestockCount = production
            .filter(record => record.type === 'livestock')
            .reduce((sum, record) => sum + (record.animalCount || 0), 0);
        this.updateElement('profile-livestock', livestockCount);
        
        // Monthly production
        const currentMonth = new Date().getMonth();
        const monthlyProduction = production
            .filter(record => new Date(record.date).getMonth() === currentMonth)
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
        const notificationBtn = document.getElementById('notification-settings');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotificationSettings();
            });
        }
        
        const privacyBtn = document.getElementById('privacy-settings');
        if (privacyBtn) {
            privacyBtn.addEventListener('click', () => {
                this.showPrivacySettings();
            });
        }
        
        const passwordBtn = document.getElementById('change-password');
        if (passwordBtn) {
            passwordBtn.addEventListener('click', () => {
                this.showChangePassword();
            });
        }
        
        // Delete account
        const deleteBtn = document.getElementById('delete-account');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.confirmDeleteAccount();
            });
        }
        
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
            firstName: document.getElementById('profile-first-name').value,
            lastName: document.getElementById('profile-last-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            farmName: document.getElementById('profile-farm-name').value,
            location: document.getElementById('profile-location').value,
            farmSize: parseInt(document.getElementById('profile-farm-size').value) || 0,
            bio: document.getElementById('profile-bio').value
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
        
        // Update Firebase user if available
        this.updateFirebaseProfile(formData);
        
        // Update stats
        this.updateProfileStats();
        
        this.showNotification('Profile updated successfully!', 'success');
    },

    updateFirebaseProfile: function(profileData) {
        const user = this.getCurrentUser();
        if (user && user.updateProfile) {
            const displayName = `${profileData.firstName} ${profileData.lastName}`.trim();
            
            user.updateProfile({
                displayName: displayName
            }).then(() => {
                console.log('✅ Firebase profile updated');
            }).catch(error => {
                console.error('❌ Error updating Firebase profile:', error);
            });
        }
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
        // Implementation would depend on your auth system
        this.showNotification('Account deletion would be processed here', 'warning');
    },

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

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
