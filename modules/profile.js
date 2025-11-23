// Profile Module
FarmModules.registerModule('profile', {
    name: 'Profile',
    icon: '👤',
    template: `
        <div id="profile" class="section">
            <div class="profile-section">
                <div class="profile-header">
                    <div class="profile-avatar" id="profile-avatar">U</div>
                    <div class="profile-info">
                        <h2 id="profile-display-name">User Name</h2>
                        <p id="profile-email">user@example.com</p>
                        <p id="profile-farm-name">Farm Name</p>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-card">
                        <span class="stat-number" id="total-records">0</span>
                        <span class="stat-label">Total Records</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="active-projects-count">0</span>
                        <span class="stat-label">Active Projects</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="monthly-sales">$0</span>
                        <span class="stat-label">Monthly Sales</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="data-synced">Yes</span>
                        <span class="stat-label">Data Synced</span>
                    </div>
                </div>
                
                <h3>Account Information</h3>
                <form id="profile-form">
                    <div class="form-group">
                        <label for="edit-display-name">Full Name</label>
                        <input type="text" id="edit-display-name" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-farm-name">Farm Name</label>
                        <input type="text" id="edit-farm-name" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" readonly>
                        <small style="color: #666;">Email cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label for="edit-phone">Phone Number</label>
                        <input type="tel" id="edit-phone" placeholder="Enter your phone number">
                    </div>
                    <div class="form-group">
                        <label for="edit-location">Farm Location</label>
                        <input type="text" id="edit-location" placeholder="Enter your farm location">
                    </div>
                    <div class="form-group">
                        <label for="edit-bio">About Your Farm</label>
                        <textarea id="edit-bio" rows="4" placeholder="Tell us about your farm..."></textarea>
                    </div>
                    <button type="submit" class="btn">Update Profile</button>
                </form>
            </div>
        </div>
    `,
    
    sidebar: `
        <h3>Account</h3>
        <ul>
            <li><a href="#" class="sidebar-link" data-target="profile">Profile Settings</a></li>
            <li><a href="#" id="change-password-sidebar">Change Password</a></li>
            <li><a href="#" id="export-data">Export Data</a></li>
            <li><a href="#" id="delete-account">Delete Account</a></li>
        </ul>
        
        <h3>Sync Status</h3>
        <div class="sync-info">
            <p>Last Sync: <span id="last-sync-time">Just now</span></p>
            <p>Status: <span id="sync-status-text">Online</span></p>
        </div>
    `,
    
    initialize: function() {
        this.loadProfileData();
        this.attachEventListeners();
    },
    
    loadProfileData: function() {
        const user = FirebaseAuth.getCurrentUser();
        if (user) {
            this.updateProfileForm(user);
            this.loadUserProfile(user.uid);
        }
    },
    
    updateProfileForm: function(user) {
        document.getElementById('profile-display-name').textContent = user.displayName || 'User Name';
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('edit-display-name').value = user.displayName || '';
        document.getElementById('edit-email').value = user.email;
        
        // Update avatar
        const avatar = document.getElementById('profile-avatar');
        if (avatar && user.displayName) {
            const nameParts = user.displayName.split(' ');
            const userInitials = nameParts.map(part => part[0]).join('').toUpperCase();
            avatar.textContent = userInitials || 'U';
        }
    },
    
    loadUserProfile: function(userId) {
        FirestoreService.getUserProfile(userId)
            .then((doc) => {
                if (doc.exists) {
                    const profile = doc.data();
                    document.getElementById('profile-farm-name').textContent = profile.farmName || 'Farm Name';
                    document.getElementById('edit-farm-name').value = profile.farmName || '';
                    document.getElementById('edit-phone').value = profile.phone || '';
                    document.getElementById('edit-location').value = profile.location || '';
                    document.getElementById('edit-bio').value = profile.bio || '';
                    
                    this.updateStats();
                }
            })
            .catch((error) => {
                console.error('Error loading profile:', error);
            });
    },
    
    attachEventListeners: function() {
        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }
        
        // Sidebar links
        document.getElementById('change-password-sidebar').addEventListener('click', () => {
            FarmModules.modules.auth.showChangePasswordModal();
        });
        
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('delete-account').addEventListener('click', () => this.deleteAccount());
    },
    
    handleProfileUpdate: function(e) {
        e.preventDefault();
        
        const user = FirebaseAuth.getCurrentUser();
        if (!user) return;
        
        const profileData = {
            displayName: document.getElementById('edit-display-name').value,
            farmName: document.getElementById('edit-farm-name').value,
            phone: document.getElementById('edit-phone').value,
            location: document.getElementById('edit-location').value,
            bio: document.getElementById('edit-bio').value
        };
        
        // Update Firebase auth profile
        user.updateProfile({
            displayName: profileData.displayName
        }).then(() => {
            // Update Firestore profile
            return FirestoreService.updateUserProfile(user.uid, profileData);
        }).then(() => {
            alert('Profile updated successfully!');
            this.updateProfileForm(user);
            FarmModules.modules.auth.updateUserInterface(user);
        }).catch((error) => {
            alert('Error updating profile: ' + error.message);
        });
    },
    
    updateStats: function() {
        // Calculate total records
        const totalRecords = Object.values(FarmModules.appData).reduce((total, data) => total + data.length, 0);
        document.getElementById('total-records').textContent = totalRecords;
        
        // Active projects
        const activeProjects = FarmModules.appData.projects.length;
        document.getElementById('active-projects-count').textContent = activeProjects;
        
        // Monthly sales
        const currentMonth = new Date().getMonth();
        const monthlySales = FarmModules.appData.sales
            .filter(sale => new Date(sale.saleDate).getMonth() === currentMonth)
            .reduce((total, sale) => total + (sale.totalSales || 0), 0);
        document.getElementById('monthly-sales').textContent = `$${monthlySales.toFixed(2)}`;
        
        // Sync status
        document.getElementById('data-synced').textContent = navigator.onLine ? 'Yes' : 'No';
        document.getElementById('sync-status-text').textContent = navigator.onLine ? 'Online' : 'Offline';
        document.getElementById('last-sync-time').textContent = new Date().toLocaleTimeString();
    },
    
    exportData: function() {
        const dataStr = JSON.stringify(FarmModules.appData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    },
    
    deleteAccount: function() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
            return;
        }
        
        const user = FirebaseAuth.getCurrentUser();
        if (!user) return;
        
        // First, delete all user data from Firestore
        const deletePromises = [];
        const dataTypes = ['inventory', 'transactions', 'production', 'orders', 'sales', 'projects', 'feedRecords'];
        
        dataTypes.forEach(dataType => {
            deletePromises.push(
                firebase.firestore().collection('users').doc(user.uid).collection(dataType).get()
                    .then((snapshot) => {
                        const batch = firebase.firestore().batch();
                        snapshot.forEach((doc) => {
                            batch.delete(doc.ref);
                        });
                        return batch.commit();
                    })
            );
        });
        
        // Delete user profile
        deletePromises.push(
            firebase.firestore().collection('users').doc(user.uid).delete()
        );
        
        Promise.all(deletePromises)
            .then(() => {
                // Delete the user account
                return user.delete();
            })
            .then(() => {
                alert('Account deleted successfully.');
                FarmModules.modules.auth.handleAuthFailure();
            })
            .catch((error) => {
                console.error('Error deleting account:', error);
                alert('Error deleting account. You may need to reauthenticate.');
            });
    }
});
