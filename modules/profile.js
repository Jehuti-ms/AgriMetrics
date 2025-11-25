// modules/profile.js
FarmModules.registerModule('profile', {
    name: 'Profile',
    icon: '👤',
    
    template: `
        <div class="section active">
            <!-- Profile will be shown as a modal, so this section can be minimal -->
            <div class="module-header">
                <h1>User Profile</h1>
                <p>Manage your account settings</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="open-profile-modal">
                        👤 Edit Profile
                    </button>
                </div>
            </div>

            <!-- Quick Profile Preview -->
            <div class="profile-preview card">
                <div class="preview-header">
                    <div class="preview-avatar">
                        <div class="avatar" id="preview-avatar">FM</div>
                    </div>
                    <div class="preview-info">
                        <h3 id="preview-name">Farm Manager</h3>
                        <p id="preview-email">user@example.com</p>
                        <p id="preview-farm">My Farm</p>
                    </div>
                </div>
                <div class="preview-stats">
                    <div class="stat">
                        <div class="stat-value" id="preview-farm-size">0</div>
                        <div class="stat-label">Acres</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="preview-livestock">0</div>
                        <div class="stat-label">Animals</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="preview-production">0</div>
                        <div class="stat-label">Production</div>
                    </div>
                </div>
            </div>

            <!-- Profile Modal -->
            <div id="profile-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>User Profile</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
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
                                <textarea id="profile-bio" placeholder="Tell us about your farm and experience..." rows="3"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-text" id="logout-btn">Log Out</button>
                                <div>
                                    <button type="button" class="btn btn-text close-modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .profile-preview {
            max-width: 500px;
            margin: 2rem auto;
        }

        .preview-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .preview-avatar {
            flex-shrink: 0;
        }

        .avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
        }

        .preview-info h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1.25rem;
            color: var(--text-color);
        }

        .preview-info p {
            margin: 0 0 0.25rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .preview-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .stat {
            text-align: center;
        }

        .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        #logout-btn {
            color: var(--warning-color);
            border-color: var(--warning-color);
        }

        #logout-btn:hover {
            background: var(--warning-color);
            color: white;
        }
    `,

    initialize: function() {
        console.log('👤 Profile module initializing...');
        this.loadUserProfile();
        this.attachEventListeners();
        this.updatePreview();
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
        const email = user.email || 'user@example.com';
        
        // Update preview
        this.updateElement('preview-name', displayName);
        this.updateElement('preview-email', email);
        this.updateAvatar(displayName);
        
        // Update modal form fields
        this.populateFormFields(user);
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
        this.setInputValue('profile-email', email);
        
        // Load additional profile data from storage
        this.loadAdditionalProfileData();
    },

    loadAdditionalProfileData: function() {
        // Load farm-specific data from localStorage or appData
        const profileData = FarmModules.appData.profile || {};
        
        this.setInputValue('profile-farm-name', profileData.farmName || '');
        this.setInputValue('profile-phone', profileData.phone || '');
        this.setInputValue('profile-location', profileData.location || '');
        this.setInputValue('profile-farm-size', profileData.farmSize || '');
        this.setInputValue('profile-bio', profileData.bio || '');
        
        // Update preview
        this.updateElement('preview-farm', profileData.farmName || 'My Farm');
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
        
        // Update preview
        this.updateElement('preview-name', displayName);
        this.updateElement('preview-email', email);
        this.updateElement('preview-farm', profileData.farmName || 'My Farm');
        this.updateAvatar(displayName);
        
        // Update form fields
        this.setInputValue('profile-first-name', profileData.firstName || '');
        this.setInputValue('profile-last-name', profileData.lastName || '');
        this.setInputValue('profile-email', email);
        this.setInputValue('profile-farm-name', profileData.farmName || '');
        this.setInputValue('profile-phone', profileData.phone || '');
        this.setInputValue('profile-location', profileData.location || '');
        this.setInputValue('profile-farm-size', profileData.farmSize || '');
        this.setInputValue('profile-bio', profileData.bio || '');
    },

    updatePreview: function() {
        // Calculate stats from app data
        const production = FarmModules.appData.production || [];
        const profile = FarmModules.appData.profile || {};
        
        // Farm size
        const farmSize = profile.farmSize || 0;
        this.updateElement('preview-farm-size', farmSize);
        
        // Livestock count
        const livestockCount = production
            .filter(record => record.type === 'livestock')
            .reduce((sum, record) => sum + (record.animalCount || 0), 0);
        this.updateElement('preview-livestock', livestockCount);
        
        // Monthly production
        const currentMonth = new Date().getMonth();
        const monthlyProduction = production
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth;
            })
            .reduce((sum, record) => sum + (record.amount || 0), 0);
        this.updateElement('preview-production', this.formatAmount(monthlyProduction));
    },

    updateAvatar: function(displayName) {
        const avatarElement = document.getElementById('preview-avatar');
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

    attachEventListeners: function() {
        // Open modal button
        const openBtn = document.getElementById('open-profile-modal');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.showModal();
            });
        }

        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Modal close events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal();
            });
        });

        // Modal backdrop
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideModal();
                }
            });
        }

        // Real-time preview updates
        const firstNameField = document.getElementById('profile-first-name');
        const lastNameField = document.getElementById('profile-last-name');
        const farmNameField = document.getElementById('profile-farm-name');
        
        if (firstNameField && lastNameField) {
            const updatePreviewName = () => {
                const firstName = firstNameField.value || '';
                const lastName = lastNameField.value || '';
                const displayName = `${firstName} ${lastName}`.trim() || 'Farm Manager';
                this.updateElement('preview-name', displayName);
                this.updateAvatar(displayName);
            };
            
            firstNameField.addEventListener('input', updatePreviewName);
            lastNameField.addEventListener('input', updatePreviewName);
        }

        if (farmNameField) {
            farmNameField.addEventListener('input', () => {
                const farmName = farmNameField.value || 'My Farm';
                this.updateElement('preview-farm', farmName);
            });
        }
    },

    showModal: function() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveProfile: function() {
        console.log('💾 Saving profile...');
        
        const formData = {
            firstName: this.getInputValue('profile-first-name'),
            lastName: this.getInputValue('profile-last-name'),
            email: this.getInputValue('profile-email'),
            phone: this.getInputValue('profile-phone'),
            farmName: this.getInputValue('profile-farm-name'),
            location: this.getInputValue('profile-location'),
            farmSize: parseInt(this.getInputValue('profile-farm-size')) || 0,
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
        
        // Update preview
        this.updatePreview();
        
        this.showNotification('Profile updated successfully!', 'success');
        this.hideModal();
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
            window.location.href = '/';
        }, 1500);
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
