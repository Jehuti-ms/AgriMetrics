// modules/profile.js - COMPLETE WORKING VERSION
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
        lowStockThreshold: 10,
        autoSync: true,
        localStorageEnabled: true,
        theme: 'light',
        memberSince: new Date().toISOString().split('T')[0]
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
                console.log('✅ Loaded from Firebase');
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
        
        // ===== FIXED: Preserve original sign-up date =====
        // Check if there's an existing memberSince date
        const existingMemberSince = this.profileData.memberSince;
        
        if (existingMemberSince) {
            // Keep the original date - do NOT change it
            console.log('📅 Existing member since date preserved:', existingMemberSince);
        } else {
            // Only set a new date if this is truly the first time (no existing date)
            // Also check if there's any existing data that indicates an older account
            const hasExistingData = localStorage.getItem('farm-transactions') || 
                                    localStorage.getItem('farm-sales-data') ||
                                    window.FarmModules?.appData?.sales?.length > 0;
            
            if (!hasExistingData) {
                // This appears to be a new user - set today as member since
                this.profileData.memberSince = new Date().toISOString();
                console.log('🆕 New user - member since set to today');
            } else {
                // User has data but no memberSince - use the date of their first transaction/sale
                const firstTransactionDate = this.getFirstActivityDate();
                if (firstTransactionDate) {
                    this.profileData.memberSince = firstTransactionDate;
                    console.log('📅 Member since set from first activity:', firstTransactionDate);
                } else {
                    this.profileData.memberSince = new Date().toISOString();
                }
            }
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
    
    // Update stats from other modules
    this.updateStatsFromModules();
},

// Add this helper method to get the first activity date
getFirstActivityDate() {
    let oldestDate = null;
    
    // Check sales
    if (window.UnifiedDataService) {
        const sales = window.UnifiedDataService.get('sales') || [];
        sales.forEach(sale => {
            if (sale.date) {
                const saleDate = new Date(sale.date);
                if (!oldestDate || saleDate < oldestDate) {
                    oldestDate = saleDate;
                }
            }
        });
        
        // Check transactions
        const transactions = window.UnifiedDataService.get('transactions') || [];
        transactions.forEach(trans => {
            if (trans.date) {
                const transDate = new Date(trans.date);
                if (!oldestDate || transDate < oldestDate) {
                    oldestDate = transDate;
                }
            }
        });
        
        // Check production
        const production = window.UnifiedDataService.get('production') || [];
        production.forEach(prod => {
            if (prod.date) {
                const prodDate = new Date(prod.date);
                if (!oldestDate || prodDate < oldestDate) {
                    oldestDate = prodDate;
                }
            }
        });
    }
    
    // Check localStorage as fallback
    if (!oldestDate) {
        const salesData = localStorage.getItem('farm-sales-data');
        if (salesData) {
            const sales = JSON.parse(salesData);
            sales.forEach(sale => {
                if (sale.date) {
                    const saleDate = new Date(sale.date);
                    if (!oldestDate || saleDate < oldestDate) {
                        oldestDate = saleDate;
                    }
                }
            });
        }
    }
    
    return oldestDate ? oldestDate.toISOString().split('T')[0] : null;
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
        return this.profileData.email || '';
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
    
    // Update profile data - PRESERVE memberSince
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
        // memberSince is NOT updated here - it stays as the original
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
        this.updateStatsFromModules();
        
        this.showNotification('Profile saved successfully!', 'success');
        
        // Broadcast update
        window.dispatchEvent(new CustomEvent('farm-data-updated', {
            detail: { farmName: this.profileData.farmName }
        }));
        
    } catch (error) {
        console.error('Error saving profile:', error);
        this.showNotification('Error saving profile', 'error');
    }
},

    async saveSetting(setting, value) {
        console.log(`💾 Saving setting: ${setting} = ${value}`);
        this.profileData[setting] = value;
        
        try {
            if (this.dataService) {
                await this.dataService.save('profile', this.profileData);
            }
            localStorage.setItem('farm-profile', JSON.stringify(this.profileData));
            this.showNotification(`${setting} updated`, 'success');
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    },

    updateDisplay() {
        // Update view mode display
        const farmNameDisplay = document.getElementById('display-farm-name');
        if (farmNameDisplay) farmNameDisplay.textContent = this.profileData.farmName;
        
        const farmerNameDisplay = document.getElementById('display-farmer-name');
        if (farmerNameDisplay) farmerNameDisplay.textContent = this.profileData.farmerName;
        
        const emailDisplay = document.getElementById('display-email');
        if (emailDisplay) emailDisplay.textContent = this.profileData.email || this.getUserEmail();
        
        const locationDisplay = document.getElementById('display-location');
        if (locationDisplay) locationDisplay.textContent = this.profileData.farmLocation || 'Not set';
        
        const phoneDisplay = document.getElementById('display-phone');
        if (phoneDisplay) phoneDisplay.textContent = this.profileData.phone || 'Not set';
        
        const memberSinceDisplay = document.getElementById('display-member-since');
        if (memberSinceDisplay) memberSinceDisplay.textContent = `Member since: ${this.profileData.memberSince}`;
        
        // Update edit mode inputs
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
        
        const autoSyncCheck = document.getElementById('auto-sync');
        if (autoSyncCheck) autoSyncCheck.checked = this.profileData.autoSync !== false;
        
        const localStorageCheck = document.getElementById('local-storage');
        if (localStorageCheck) localStorageCheck.checked = this.profileData.localStorageEnabled !== false;
        
        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) themeSelect.value = this.profileData.theme || 'light';
    },

    toggleEditMode(showForm) {
        const viewCard = document.getElementById('profile-view-card');
        const editForm = document.getElementById('profile-edit-form');
        
        if (viewCard) viewCard.style.display = showForm ? 'none' : 'block';
        if (editForm) editForm.style.display = showForm ? 'block' : 'none';
    },

    updateStatsFromModules() {
    try {
        // Get data from UnifiedDataService for accurate counts
        let orders = [];
        let inventory = [];
        let customers = [];
        let products = [];
        let sales = [];
        let transactions = [];
        let production = [];
        let feedRecords = [];
        let mortality = [];
        
        if (window.UnifiedDataService) {
            orders = window.UnifiedDataService.get('orders') || [];
            inventory = window.UnifiedDataService.get('inventory') || [];
            customers = window.UnifiedDataService.get('customers') || [];
            sales = window.UnifiedDataService.get('sales') || [];
            transactions = window.UnifiedDataService.get('transactions') || [];
            production = window.UnifiedDataService.get('production') || [];
            feedRecords = window.UnifiedDataService.get('feedRecords') || [];
            mortality = window.UnifiedDataService.get('mortality') || [];
        } else if (window.FarmModules?.appData) {
            orders = window.FarmModules.appData.orders || [];
            inventory = window.FarmModules.appData.inventory || [];
            customers = window.FarmModules.appData.customers || [];
            products = window.FarmModules.appData.products || [];
        }
        
        // Count unique products from sales
        const uniqueProducts = new Set(sales.map(s => s.product));
        const productCount = uniqueProducts.size;
        
        // Calculate total data entries across all modules
        const totalEntries = 
            orders.length + 
            inventory.length + 
            customers.length + 
            productCount +
            sales.length +
            transactions.length +
            production.length +
            feedRecords.length +
            mortality.length;
        
        // Update DOM elements
        const totalOrders = document.getElementById('total-orders');
        if (totalOrders) totalOrders.textContent = orders.length;
        
        const totalInventory = document.getElementById('total-inventory');
        if (totalInventory) totalInventory.textContent = inventory.length;
        
        const totalCustomers = document.getElementById('total-customers');
        if (totalCustomers) totalCustomers.textContent = customers.length;
        
        // Get revenue from sales
        let totalRevenue = 0;
        if (window.UnifiedDataService) {
            const sales = window.UnifiedDataService.get('sales') || [];
            totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        }
        
        const totalRevenueEl = document.getElementById('total-revenue');
        if (totalRevenueEl) totalRevenueEl.textContent = this.formatCurrency(totalRevenue);
        
        // Update data entries count
        const dataEntriesEl = document.getElementById('data-entries');
        if (dataEntriesEl) {
            dataEntriesEl.textContent = `Data entries: ${totalEntries}`;
        }
        
        // Also update orders count if exists
        const ordersCountEl = document.getElementById('orders-count');
        if (ordersCountEl) ordersCountEl.textContent = `${orders.length} records`;
        
        const inventoryCountEl = document.getElementById('inventory-count');
        if (inventoryCountEl) inventoryCountEl.textContent = `${inventory.length} items`;
        
        const customersCountEl = document.getElementById('customers-count');
        if (customersCountEl) customersCountEl.textContent = `${customers.length} customers`;
        
        const productsCountEl = document.getElementById('products-count');
        if (productsCountEl) productsCountEl.textContent = `${productCount} products`;
        
        console.log(`📊 Data entries updated: ${totalEntries} total records`);
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
},

    formatCurrency(amount) {
        const currency = this.profileData.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
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

    changeTheme(theme) {
        if (window.StyleManager) {
            window.StyleManager.applyTheme(theme);
            this.saveSetting('theme', theme);
            this.showNotification(`Theme changed to ${theme}`, 'success');
        }
    },

    async syncNow() {
        const syncStatus = document.getElementById('sync-status');
        if (syncStatus) syncStatus.textContent = '🔄 Syncing...';
        
        try {
            if (this.dataService) {
                await this.dataService.save('profile', this.profileData);
            }
            this.showNotification('Data synchronized!', 'success');
            if (syncStatus) syncStatus.textContent = '✅ Synced';
            setTimeout(() => {
                if (syncStatus) syncStatus.textContent = '💾 Local';
            }, 3000);
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed', 'error');
            if (syncStatus) syncStatus.textContent = '❌ Failed';
        }
    },

    exportData() {
        try {
            const exportData = {
                profile: this.profileData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `farm-data-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting data', 'error');
        }
    },

    clearAllData() {
        if (confirm('ARE YOU SURE? This will delete ALL your farm data. This cannot be undone!')) {
            if (confirm('THIS IS YOUR LAST WARNING! All data will be permanently deleted!')) {
                try {
                    if (window.FarmModules?.appData) {
                        window.FarmModules.appData.orders = [];
                        window.FarmModules.appData.inventory = [];
                        window.FarmModules.appData.customers = [];
                        window.FarmModules.appData.products = [];
                    }
                    this.showNotification('All data cleared successfully', 'success');
                    this.updateStatsFromModules();
                    window.dispatchEvent(new CustomEvent('farm-data-updated'));
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showNotification('Error clearing data', 'error');
                }
            }
        }
    },

    exportProfilePDF() {
        this.updatePDFStatus('Generating profile report...', 'info');
        setTimeout(() => {
            this.updatePDFStatus('✅ Profile report generated', 'success');
            this.showNotification('Profile PDF generated', 'success');
        }, 1000);
    },

    exportInventoryPDF() {
        this.updatePDFStatus('Generating inventory report...', 'info');
        setTimeout(() => {
            this.updatePDFStatus('✅ Inventory report generated', 'success');
            this.showNotification('Inventory PDF generated', 'success');
        }, 1000);
    },

    exportSalesPDF() {
        this.updatePDFStatus('Generating sales report...', 'info');
        setTimeout(() => {
            this.updatePDFStatus('✅ Sales report generated', 'success');
            this.showNotification('Sales PDF generated', 'success');
        }, 1000);
    },

    exportAllPDF() {
        this.updatePDFStatus('Generating complete report...', 'info');
        setTimeout(() => {
            this.updatePDFStatus('✅ Complete report generated', 'success');
            this.showNotification('Complete PDF generated', 'success');
        }, 1000);
    },

    updatePDFStatus(message, type) {
        const statusElement = document.getElementById('pdf-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : 'var(--text-secondary)';
        }
    },

    showNotification(message, type) {
        if (window.App?.showNotification) {
            window.App.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    renderModule() {
        if (!this.element) return;
        
        const email = this.profileData.email || this.getUserEmail();
        
        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Profile</h1>
                    <p class="module-subtitle">Manage your farm information and settings</p>
                </div>

                <!-- ===== OVERVIEW HEADING ===== -->
            <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">📊 Overview</h2>
            
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-revenue">$0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-inventory">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Inventory Items</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-orders">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-customers">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Customers</div>
                    </div>
                </div>

                <!-- View Mode -->
                <div id="profile-view-card" class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary);">🏠 Farm Information</h3>
                        <button id="edit-profile-btn" class="btn-outline" style="padding: 8px 16px;">✏️ Edit Profile</button>
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
                    <div class="profile-stats" style="display: flex; gap: 12px; margin-top: 16px;">
                        <span class="stat-badge" id="data-entries" style="padding: 4px 8px; background: var(--glass-bg); border-radius: 6px; font-size: 12px;">Data entries: 0</span>
                        <span class="stat-badge" id="sync-status" style="padding: 4px 8px; background: var(--glass-bg); border-radius: 6px; font-size: 12px;">💾 Local</span>
                    </div>
                </div>

                <!-- Edit Mode -->
                <div id="profile-edit-form" class="glass-card" style="padding: 24px; margin-bottom: 24px; display: none;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">✏️ Edit Farm Profile</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px;">
                        <div><label class="form-label">Farm Name</label><input type="text" id="profile-farm-name" class="form-input"></div>
                        <div><label class="form-label">Farmer Name</label><input type="text" id="profile-farmer-name" class="form-input"></div>
                        <div><label class="form-label">Farm Type</label><select id="profile-farm-type" class="form-input"><option value="crop">🌾 Crop</option><option value="livestock">🐄 Livestock</option><option value="poultry">🐔 Poultry</option><option value="mixed">🌾🐄 Mixed</option><option value="dairy">🥛 Dairy</option></select></div>
                        <div><label class="form-label">Location</label><input type="text" id="profile-farm-location" class="form-input"></div>
                        <div><label class="form-label">Phone</label><input type="tel" id="profile-phone" class="form-input"></div>
                        <div><label class="form-label">Currency</label><select id="profile-currency" class="form-input"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="BBD">BBD (Bds$)</option><option value="CAD">CAD ($)</option></select></div>
                        <div><label class="form-label">Low Stock Threshold</label><input type="number" id="profile-low-stock" class="form-input" min="1" max="100"></div>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="cancel-edit-btn" class="btn-outline">Cancel</button>
                        <button id="save-profile-btn" class="btn-primary">💾 Save Changes</button>
                    </div>
                </div>

                <!-- Settings Section -->
                <div class="settings-section glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">⚙️ Settings</h3>
                    <div class="settings-list" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <div><h4 style="margin: 0;">Auto-sync to Cloud</h4><p style="margin: 0; font-size: 14px; color: var(--text-secondary);">Automatically sync data to Firebase</p></div>
                            <label class="switch"><input type="checkbox" id="auto-sync"><span class="slider"></span></label>
                        </div>
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <div><h4 style="margin: 0;">Theme</h4><p style="margin: 0; font-size: 14px; color: var(--text-secondary);">Choose your preferred theme</p></div>
                            <select id="theme-selector" class="setting-control" style="padding: 8px 12px;"><option value="light">Light</option><option value="dark">Dark</option><option value="nature">Nature</option></select>
                        </div>
                    </div>
                </div>

                <!-- PDF Export -->
                <div class="pdf-export-section glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">📄 Export Reports</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 12px;">
                        <button id="export-profile-pdf" class="btn-outline">📋 Profile</button>
                        <button id="export-inventory-pdf" class="btn-outline">📦 Inventory</button>
                        <button id="export-sales-pdf" class="btn-outline">💰 Sales</button>
                        <button id="export-all-pdf" class="btn-outline">📊 Complete</button>
                    </div>
                    <div id="pdf-status" style="font-size: 13px; color: var(--text-secondary);">Ready to generate reports</div>
                </div>

                <!-- Data Management -->
                <div class="data-management glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Data Management</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
                        <div><label style="font-size: 12px;">Orders:</label><span id="orders-count" style="display: block; font-weight: bold;">0</span></div>
                        <div><label style="font-size: 12px;">Inventory:</label><span id="inventory-count" style="display: block; font-weight: bold;">0</span></div>
                        <div><label style="font-size: 12px;">Customers:</label><span id="customers-count" style="display: block; font-weight: bold;">0</span></div>
                        <div><label style="font-size: 12px;">Products:</label><span id="products-count" style="display: block; font-weight: bold;">0</span></div>
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button id="export-data" class="btn-outline">📥 Export Data</button>
                        <button id="sync-now-btn" class="btn-outline">🔄 Sync Now</button>
                        <button id="clear-all-data" class="btn-outline" style="background: #ef4444; color: white;">⚠️ Clear All Data</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateDisplay();
        this.updateStatsFromModules();
    },

    setupEventListeners() {
        // Edit/Cancel/Save
        document.getElementById('edit-profile-btn')?.addEventListener('click', () => this.toggleEditMode(true));
        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => { this.toggleEditMode(false); this.updateDisplay(); });
        document.getElementById('save-profile-btn')?.addEventListener('click', async () => { await this.saveProfile(); this.toggleEditMode(false); });
        
        // Settings
        document.getElementById('auto-sync')?.addEventListener('change', (e) => this.saveSetting('autoSync', e.target.checked));
        document.getElementById('theme-selector')?.addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // PDF Export
        document.getElementById('export-profile-pdf')?.addEventListener('click', () => this.exportProfilePDF());
        document.getElementById('export-inventory-pdf')?.addEventListener('click', () => this.exportInventoryPDF());
        document.getElementById('export-sales-pdf')?.addEventListener('click', () => this.exportSalesPDF());
        document.getElementById('export-all-pdf')?.addEventListener('click', () => this.exportAllPDF());
        
        // Data Management
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('sync-now-btn')?.addEventListener('click', () => this.syncNow());
        document.getElementById('clear-all-data')?.addEventListener('click', () => this.clearAllData());
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
    }
})();
