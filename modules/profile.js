// modules/profile.js
console.log('Loading profile module...');

const ProfileModule = {
    name: 'profile',
    initialized: false,
    profileData: {},

    initialize() {
        console.log('👤 Initializing profile...');
        this.loadProfileData();
        this.renderProfile();
        this.initialized = true;
        return true;
    },

    loadProfileData() {
        const savedData = localStorage.getItem('farm-profile-data');
        if (savedData) {
            this.profileData = JSON.parse(savedData);
        } else {
            // Default profile data
            this.profileData = {
                farmName: 'Green Valley Farm',
                farmType: 'Poultry & Crops',
                ownerName: 'Farm Manager',
                email: 'manager@farm.com',
                phone: '+1 (555) 123-4567',
                address: '123 Farm Road, Agricultural City, FS 12345',
                established: '2010',
                size: '50 acres',
                employees: '12',
                specialties: ['Broiler Chickens', 'Egg Production', 'Organic Vegetables']
            };
        }
    },

    saveProfileData() {
        localStorage.setItem('farm-profile-data', JSON.stringify(this.profileData));
    },

    updateProfile(updatedData) {
        this.profileData = { ...this.profileData, ...updatedData };
        this.saveProfileData();
        this.updateProfileDisplay();
        this.showNotification('Profile updated successfully!', 'success');
    },

    updateProfileDisplay() {
        // Update profile information in the UI
        const farmNameEl = document.querySelector('.farm-name');
        const farmTypeEl = document.querySelector('.farm-type');
        const ownerNameEl = document.querySelector('.owner-name');
        const emailEl = document.querySelector('.profile-email');
        const phoneEl = document.querySelector('.profile-phone');
        const addressEl = document.querySelector('.profile-address');
        const establishedEl = document.querySelector('.established');
        const sizeEl = document.querySelector('.farm-size');
        const employeesEl = document.querySelector('.employees');

        if (farmNameEl) farmNameEl.textContent = this.profileData.farmName;
        if (farmTypeEl) farmTypeEl.textContent = this.profileData.farmType;
        if (ownerNameEl) ownerNameEl.textContent = this.profileData.ownerName;
        if (emailEl) emailEl.textContent = this.profileData.email;
        if (phoneEl) phoneEl.textContent = this.profileData.phone;
        if (addressEl) addressEl.textContent = this.profileData.address;
        if (establishedEl) establishedEl.textContent = this.profileData.established;
        if (sizeEl) sizeEl.textContent = this.profileData.size;
        if (employeesEl) employeesEl.textContent = this.profileData.employees;

        // Update specialties
        const specialtiesContainer = document.querySelector('.specialties-container');
        if (specialtiesContainer) {
            specialtiesContainer.innerHTML = this.profileData.specialties
                .map(specialty => `
                    <span style="
                        background: rgba(16, 185, 129, 0.1);
                        color: #065f46;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                    ">${specialty}</span>
                `).join('');
        }
    },

    showEditProfileModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Edit Farm Profile</h3>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>

                <form id="edit-profile-form">
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Farm Name *</label>
                            <input type="text" name="farmName" value="${this.profileData.farmName}" required style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Farm Type</label>
                            <input type="text" name="farmType" value="${this.profileData.farmType}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Owner Name</label>
                            <input type="text" name="ownerName" value="${this.profileData.ownerName}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Email</label>
                            <input type="email" name="email" value="${this.profileData.email}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Phone</label>
                            <input type="tel" name="phone" value="${this.profileData.phone}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Address</label>
                            <textarea name="address" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                                resize: vertical;
                                min-height: 60px;
                            ">${this.profileData.address}</textarea>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Established</label>
                                <input type="text" name="established" value="${this.profileData.established}" style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                ">
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Farm Size</label>
                                <input type="text" name="size" value="${this.profileData.size}" style="
                                    width: 100%;
                                    padding: 12px 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    box-sizing: border-box;
                                ">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Number of Employees</label>
                            <input type="text" name="employees" value="${this.profileData.employees}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            ">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Specialties (comma-separated)</label>
                            <input type="text" name="specialties" value="${this.profileData.specialties.join(', ')}" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                            " placeholder="e.g., Broiler Chickens, Egg Production">
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="submit" style="
                                flex: 1;
                                background: #10b981;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Save Changes</button>
                            <button type="button" class="cancel-modal" style="
                                flex: 1;
                                background: #6b7280;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 12px 24px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            ">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for modal
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.cancel-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedData = Object.fromEntries(formData);
            
            // Convert specialties string to array
            updatedData.specialties = updatedData.specialties.split(',').map(s => s.trim()).filter(s => s);
            
            this.updateProfile(updatedData);
            closeModal();
        });
    },

    exportAllData() {
        // Collect all data from localStorage
        const allData = {
            profile: this.profileData,
            sales: JSON.parse(localStorage.getItem('farm-sales-data') || '[]'),
            production: JSON.parse(localStorage.getItem('farm-production-data') || '[]'),
            mortality: JSON.parse(localStorage.getItem('farm-mortality-data') || '[]'),
            orders: JSON.parse(localStorage.getItem('farm-orders-data') || '[]'),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('All data exported successfully!', 'success');
    },

    resetAllData() {
        if (confirm('⚠️ WARNING: This will delete ALL your data and cannot be undone! Are you absolutely sure?')) {
            if (confirm('This is your final warning. All farm data will be permanently deleted. Continue?')) {
                // Clear all localStorage data
                localStorage.removeItem('farm-sales-data');
                localStorage.removeItem('farm-production-data');
                localStorage.removeItem('farm-mortality-data');
                localStorage.removeItem('farm-orders-data');
                localStorage.removeItem('farm-profile-data');
                
                // Reset profile to defaults
                this.profileData = {
                    farmName: 'Green Valley Farm',
                    farmType: 'Poultry & Crops',
                    ownerName: 'Farm Manager',
                    email: 'manager@farm.com',
                    phone: '+1 (555) 123-4567',
                    address: '123 Farm Road, Agricultural City, FS 12345',
                    established: '2010',
                    size: '50 acres',
                    employees: '12',
                    specialties: ['Broiler Chickens', 'Egg Production', 'Organic Vegetables']
                };
                this.saveProfileData();
                
                this.updateProfileDisplay();
                this.showNotification('All data has been reset to defaults.', 'success');
                
                // Refresh the page to ensure clean state
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    },

    renderProfile() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="module-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Farm Profile</h1>
                    <p style="color: #666; font-size: 16px;">Manage your farm information and settings</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-bottom: 30px;">
                    <div class="actions-grid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                    ">
                        <button class="action-btn" data-action="edit-profile" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">✏️</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Edit Profile</div>
                                <div style="font-size: 12px; color: #666;">Update farm information</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="export-data" style="
                            background: rgba(255, 255, 255, 0.9);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">📤</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">Export Data</div>
                                <div style="font-size: 12px; color: #666;">Backup all farm data</div>
                            </div>
                        </button>

                        <button class="action-btn" data-action="reset-data" style="
                            background: rgba(255, 87, 87, 0.1);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(255, 87, 87, 0.2);
                            border-radius: 16px;
                            padding: 24px 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="font-size: 28px;">🔄</div>
                            <div style="text-align: left;">
                                <div style="font-size: 16px; font-weight: 600; color: #ef4444;">Reset Data</div>
                                <div style="font-size: 12px; color: #ef4444;">Clear all farm data</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Farm Information -->
                <div class="profile-section" style="margin-bottom: 30px;">
                    <div style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 30px;
                    ">
                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 30px;">
                            <div>
                                <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;" class="farm-name">${this.profileData.farmName}</h2>
                                <p style="color: #666; font-size: 16px;" class="farm-type">${this.profileData.farmType}</p>
                            </div>
                            <div style="font-size: 48px;">🏠</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
                            <div>
                                <h3 style="color: #1a1a1a; font-size: 16px; margin-bottom: 16px; font-weight: 600;">Contact Information</h3>
                                <div style="display: grid; gap: 12px;">
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Owner</div>
                                        <div style="font-size: 16px; font-weight: 500;" class="owner-name">${this.profileData.ownerName}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Email</div>
                                        <div style="font-size: 16px;" class="profile-email">${this.profileData.email}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Phone</div>
                                        <div style="font-size: 16px;" class="profile-phone">${this.profileData.phone}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Address</div>
                                        <div style="font-size: 16px;" class="profile-address">${this.profileData.address}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style="color: #1a1a1a; font-size: 16px; margin-bottom: 16px; font-weight: 600;">Farm Details</h3>
                                <div style="display: grid; gap: 12px;">
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Established</div>
                                        <div style="font-size: 16px; font-weight: 500;" class="established">${this.profileData.established}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Farm Size</div>
                                        <div style="font-size: 16px;" class="farm-size">${this.profileData.size}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Employees</div>
                                        <div style="font-size: 16px;" class="employees">${this.profileData.employees}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Specialties</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px;" class="specialties-container">
                                            ${this.profileData.specialties.map(specialty => `
                                                <span style="
                                                    background: rgba(16, 185, 129, 0.1);
                                                    color: #065f46;
                                                    padding: 4px 8px;
                                                    border-radius: 6px;
                                                    font-size: 12px;
                                                    font-weight: 500;
                                                ">${specialty}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="data-section">
                    <div style="
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        border-radius: 16px;
                        padding: 30px;
                    ">
                        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 20px;">Data Management</h2>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px;">
                                <div style="font-size: 32px; margin-bottom: 12px;">💰</div>
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Sales Records</div>
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;" id="sales-count">0</div>
                            </div>

                            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px;">
                                <div style="font-size: 32px; margin-bottom: 12px;">🏭</div>
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Production Records</div>
                                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;" id="production-count">0</div>
                            </div>

                            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px;">
                                <div style="font-size: 32px; margin-bottom: 12px;">🐔</div>
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Mortality Records</div>
                                <div style="font-size: 24px; font-weight: bold; color: #ef4444;" id="mortality-count">0</div>
                            </div>

                            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px;">
                                <div style="font-size: 32px; margin-bottom: 12px;">📋</div>
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Order Records</div>
                                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;" id="orders-count">0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupProfileEventListeners();
        this.updateDataCounts();
    },

    updateDataCounts() {
        const salesCount = JSON.parse(localStorage.getItem('farm-sales-data') || '[]').length;
        const productionCount = JSON.parse(localStorage.getItem('farm-production-data') || '[]').length;
        const mortalityCount = JSON.parse(localStorage.getItem('farm-mortality-data') || '[]').length;
        const ordersCount = JSON.parse(localStorage.getItem('farm-orders-data') || '[]').length;

        document.getElementById('sales-count').textContent = salesCount;
        document.getElementById('production-count').textContent = productionCount;
        document.getElementById('mortality-count').textContent = mortalityCount;
        document.getElementById('orders-count').textContent = ordersCount;
    },

    setupProfileEventListeners() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            });

            // Add click handlers for action buttons
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                switch (action) {
                    case 'edit-profile':
                        this.showEditProfileModal();
                        break;
                    case 'export-data':
                        this.exportAllData();
                        break;
                    case 'reset-data':
                        this.resetAllData();
                        break;
                }
            });
        });
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('profile', ProfileModule);
    console.log('✅ Profile module registered');
}
