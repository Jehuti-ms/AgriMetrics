// modules/feed-record.js - COMPLETE WITH FARMDATA INTEGRATION
console.log('Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 0, // Start at 0, will get from FarmData
    element: null,
    broadcaster: null,
    dataService: null,

 async initialize() {
    console.log('🌾 Initializing Feed Records...');
    
    this.element = document.getElementById('content-area');
    if (!this.element) return false;

    // Get UnifiedDataService
    this.dataService = window.UnifiedDataService;
    
    // Get broadcaster if available (for backward compatibility)
    if (window.Broadcaster && typeof window.Broadcaster.on === 'function') {
        this.broadcaster = window.Broadcaster;
        console.log('📡 Feed module connected to Broadcaster');
    } else {
        // Create dummy broadcaster to prevent errors
        this.broadcaster = {
            on: function() {},
            broadcast: function() {},
            emit: function() {}
        };
    }

    if (window.StyleManager) {
        StyleManager.registerModule(this.name, this.element, this);
    }

    await this.loadData();
    await this.syncWithFarmData();
    this.setupRealtimeSync();
    this.renderModule();
    this.setupEventListeners();
    this.setupBroadcasterListeners();
    this.initialized = true;
    
    console.log('✅ Feed Records initialized with UnifiedDataService');
    return true;
},

initializeLegacy() {
    console.log('⚠️ Using legacy initialization for Feed Records...');
    
    this.element = document.getElementById('content-area');
    if (!this.element) return false;

    if (window.Broadcaster) {
        this.broadcaster = window.Broadcaster;
    }

    if (window.StyleManager) {
        StyleManager.registerModule(this.name, this.element, this);
    }

    this.loadDataLegacy();
    this.syncWithFarmDataLegacy();
    this.renderModule();
    this.setupEventListeners();
    this.setupBroadcasterListeners();
    this.initialized = true;
    
    return true;
},
    
    // ===== NEW: Setup broadcaster listeners =====
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        // Listen for bird count updates
        this.broadcaster.on('birds-updated', (data) => {
            console.log('📡 Feed module received birds-updated:', data);
            if (data.count !== undefined) {
                this.birdsStock = data.count;
                this.saveData();
                this.updateBirdCountDisplay();
            }
        });
        
        // Listen for inventory updates
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Feed module received inventory-updated:', data);
            // Could update feed inventory if needed
        });
        
        // Listen for FarmData loaded event
        window.addEventListener('farm-data-loaded', () => {
            console.log('📡 Feed module received farm-data-loaded event');
            this.syncWithFarmData();
        });
        
        window.addEventListener('farm-data-updated', () => {
            console.log('📡 Feed module received farm-data-updated event');
            this.syncWithFarmData();
        });
    },

    syncWithFarmDataLegacy() {
    console.log('🔄 Syncing Feed module with FarmData (legacy)...');
    // This is a fallback - just call the main sync method
    this.syncWithFarmData();
},
    
    // ===== NEW: Sync with FarmData =====
    syncWithFarmData() {
        console.log('🔄 Syncing Feed module with FarmData...');
        
        if (window.FarmData) {
            // Get bird count from FarmData
            let birdCount = 0;
            
            // Try from inventory first
            if (window.FarmData.inventory && Array.isArray(window.FarmData.inventory)) {
                const birdItem = window.FarmData.inventory.find(item => 
                    item.name?.toLowerCase().includes('bird') || 
                    item.name?.toLowerCase().includes('broiler') ||
                    item.category?.toLowerCase().includes('poultry')
                );
                
                if (birdItem && birdItem.quantity) {
                    birdCount = parseInt(birdItem.quantity) || 0;
                }
            }
            
            // Try from transactions
            if (birdCount === 0 && window.FarmData.transactions) {
                // Look for bird purchases
                const birdPurchases = window.FarmData.transactions.filter(t => 
                    t.description?.toLowerCase().includes('bird') || 
                    t.description?.toLowerCase().includes('broiler')
                );
                
                // This is approximate - you might want to track bird count separately
                if (birdPurchases.length > 0) {
                    console.log(`📊 Found ${birdPurchases.length} bird-related transactions`);
                }
            }
            
            // Also check mortality data
            if (window.FarmData.mortality && window.FarmData.mortality.initialStock) {
                const initialStock = window.FarmData.mortality.initialStock;
                const totalMortality = (window.FarmData.mortality.records || [])
                    .reduce((sum, record) => sum + (record.quantity || 0), 0);
                const calculated = Math.max(0, initialStock - totalMortality);
                if (calculated > 0) {
                    birdCount = calculated;
                }
            }
            
            // Update bird stock if we found a real count
            if (birdCount > 0) {
                this.birdsStock = birdCount;
                console.log(`✅ Feed module synced: birdsStock = ${this.birdsStock}`);
            } else {
                // Check localStorage as fallback
                const savedBirds = localStorage.getItem('farm-birds-stock');
                if (savedBirds) {
                    this.birdsStock = parseInt(savedBirds);
                } else {
                    this.birdsStock = 0; // No fake 1000!
                }
            }
            
            // Update FarmData with our feed data
            if (!window.FarmData.feed) {
                window.FarmData.feed = {
                    records: this.feedRecords,
                    inventory: this.feedInventory
                };
            } else {
                window.FarmData.feed.records = this.feedRecords;
                window.FarmData.feed.inventory = this.feedInventory;
            }
            
            // Dispatch event that feed data is updated
            window.dispatchEvent(new CustomEvent('feed-data-updated', {
                detail: {
                    birdsStock: this.birdsStock,
                    records: this.feedRecords.length,
                    inventory: this.feedInventory.length
                }
            }));
        }
        
        this.updateBirdCountDisplay();
    },

    // ===== NEW: Update bird count display =====
    updateBirdCountDisplay() {
        const birdElement = document.getElementById('birds-stock-display');
        if (birdElement) {
            birdElement.textContent = this.birdsStock;
        }
        
        // Also update the stat card if it exists
        const statBirdElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (statBirdElement) {
            statBirdElement.textContent = this.birdsStock;
        }
    },

    onThemeChange(theme) {
        console.log(`Feed Records updating for theme: ${theme}`);
    },

   async loadData() {
    console.log('Loading feed data...');
    
    // Try UnifiedDataService first
    if (this.dataService) {
        this.feedRecords = this.dataService.get('feedRecords') || [];
        this.feedInventory = this.dataService.get('feedInventory') || [];
        
        // Get birds stock from inventory
        const inventory = this.dataService.get('inventory') || [];
        const birdItem = inventory.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler')
        );
        this.birdsStock = birdItem?.quantity || 0;
        
        console.log('📊 Loaded from UnifiedDataService:', {
            records: this.feedRecords.length,
            inventory: this.feedInventory.length,
            birds: this.birdsStock
        });
    }
    
    // If no data, try localStorage
    if (this.feedRecords.length === 0 && this.feedInventory.length === 0) {
        this.loadDataLegacy();
    }
    
    // If still no inventory, add default demo data
   // if (this.feedInventory.length === 0) {
    //    this.addDefaultFeedInventory();
   // }
},

loadDataLegacy() {
    const savedRecords = localStorage.getItem('farm-feed-records');
    const savedInventory = localStorage.getItem('farm-feed-inventory');
    const savedBirds = localStorage.getItem('farm-birds-stock');
    
    this.feedRecords = savedRecords ? JSON.parse(savedRecords) : [];
    this.feedInventory = savedInventory ? JSON.parse(savedInventory) : [];
    this.birdsStock = savedBirds ? parseInt(savedBirds) : 0;
    
    console.log('📊 Loaded from localStorage:', {
        records: this.feedRecords.length,
        inventory: this.feedInventory.length,
        birds: this.birdsStock
    });
},

/*addDefaultFeedInventory() {
    console.log('📦 Adding default feed inventory...');
    
    this.feedInventory = [
        {
            id: Date.now(),
            feedType: 'starter',
            currentStock: 100,
            unit: 'kg',
            costPerKg: 2.50,
            minStock: 20
        },
        {
            id: Date.now() + 1,
            feedType: 'grower',
            currentStock: 80,
            unit: 'kg',
            costPerKg: 2.30,
            minStock: 20
        },
        {
            id: Date.now() + 2,
            feedType: 'finisher',
            currentStock: 60,
            unit: 'kg',
            costPerKg: 2.20,
            minStock: 15
        },
        {
            id: Date.now() + 3,
            feedType: 'layer',
            currentStock: 50,
            unit: 'kg',
            costPerKg: 2.40,
            minStock: 15
        }
    ];
    
    // Save to UnifiedDataService if available
    if (this.dataService) {
        for (const item of this.feedInventory) {
            this.dataService.save('feedInventory', item);
        }
    }
    
    this.saveData();
    console.log('✅ Added default feed inventory:', this.feedInventory.length, 'items');
}, */

setupRealtimeSync() {
    if (!this.dataService) return;
    
    console.log('📡 Setting up real-time sync for feed...');
    
    // Listen for feed record updates
    this.dataService.on('feedRecords-updated', (records) => {
        console.log('🔄 Feed records updated from unified service:', records?.length);
        this.feedRecords = records || [];
        this.renderModule();
    });
    
    // Listen for feed inventory updates
    this.dataService.on('feedInventory-updated', (inventory) => {
        console.log('🔄 Feed inventory updated from unified service:', inventory?.length);
        this.feedInventory = inventory || [];
        this.renderModule();
    });
    
    // Listen for inventory updates (bird count)
    this.dataService.on('inventory-updated', (inventory) => {
        const birdItem = inventory?.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler')
        );
        if (birdItem && birdItem.quantity !== this.birdsStock) {
            this.birdsStock = birdItem.quantity;
            this.updateBirdCountDisplay();
        }
    });
},
    
      renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                </div>

               <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🌾</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalStock} kg</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="birds-stock-display">${this.birdsStock}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds to Feed</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalInventoryValue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Inventory Value</div>
                    </div>
                </div>

                 <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-feed-btn">
                        <div style="font-size: 32px;">📝</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Feed</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Log feed usage</span>
                    </button>
                    <button class="quick-action-btn" id="add-stock-btn">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Stock</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add feed to inventory</span>
                    </button>
                    <button class="quick-action-btn" id="adjust-birds-btn">
                        <div style="font-size: 32px;">🐔</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Adjust Birds</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Update bird count</span>
                    </button>
                </div>

                <!-- Inventory Overview -->
                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">Feed Inventory</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <!-- Simple Form -->
                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="feed-form-title">Record Feed Usage</h3>
                    <form id="feed-record-form">
                        <input type="hidden" id="feed-record-id" value="">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label class="form-label">Feed Type</label>
                                <select class="form-input" id="feed-type" required>
                                    <option value="">Select feed type</option>
                                    
                                    <!-- Poultry Feeds -->
                                    <optgroup label="🐔 Poultry Feeds">
                                        ${['starter', 'grower', 'finisher', 'layer', 'broiler'].map(type => {
                                            const inventoryItem = this.feedInventory.find(item => item.feedType === type);
                                            const isLowStock = inventoryItem && inventoryItem.currentStock <= inventoryItem.minStock;
                                            const stockText = inventoryItem ? ` (${inventoryItem.currentStock}kg available)` : '';
                                            return `<option value="${type}" ${isLowStock ? 'disabled' : ''}>${type.charAt(0).toUpperCase() + type.slice(1)} Feed${stockText}${isLowStock ? ' - LOW STOCK' : ''}</option>`;
                                        }).join('')}
                                    </optgroup>
                                    
                                    <!-- Rabbit Feeds -->
                                    <optgroup label="🐇 Rabbit Feeds">
                                        ${['rabbit-starter', 'rabbit-grower', 'rabbit-breeder', 'rabbit-finisher'].map(type => {
                                            const displayName = type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                            const inventoryItem = this.feedInventory.find(item => item.feedType === type);
                                            const isLowStock = inventoryItem && inventoryItem.currentStock <= inventoryItem.minStock;
                                            const stockText = inventoryItem ? ` (${inventoryItem.currentStock}kg available)` : '';
                                            return `<option value="${type}" ${isLowStock ? 'disabled' : ''}>${displayName}${stockText}${isLowStock ? ' - LOW STOCK' : ''}</option>`;
                                        }).join('')}
                                    </optgroup>
                                    
                                    <!-- Sheep Feeds -->
                                    <optgroup label="🐑 Sheep Feeds">
                                        ${['sheep-starter', 'sheep-grower', 'sheep-finisher', 'sheep-maintenance', 'sheep-lactating'].map(type => {
                                            const displayName = type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                            const inventoryItem = this.feedInventory.find(item => item.feedType === type);
                                            const isLowStock = inventoryItem && inventoryItem.currentStock <= inventoryItem.minStock;
                                            const stockText = inventoryItem ? ` (${inventoryItem.currentStock}kg available)` : '';
                                            return `<option value="${type}" ${isLowStock ? 'disabled' : ''}>${displayName}${stockText}${isLowStock ? ' - LOW STOCK' : ''}</option>`;
                                        }).join('')}
                                    </optgroup>
                                    
                                    <!-- Goat Feeds -->
                                    <optgroup label="🐐 Goat Feeds">
                                        ${['goat-starter', 'goat-grower', 'goat-finisher', 'goat-maintenance', 'goat-lactating'].map(type => {
                                            const displayName = type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                            const inventoryItem = this.feedInventory.find(item => item.feedType === type);
                                            const isLowStock = inventoryItem && inventoryItem.currentStock <= inventoryItem.minStock;
                                            const stockText = inventoryItem ? ` (${inventoryItem.currentStock}kg available)` : '';
                                            return `<option value="${type}" ${isLowStock ? 'disabled' : ''}>${displayName}${stockText}${isLowStock ? ' - LOW STOCK' : ''}</option>`;
                                        }).join('')}
                                    </optgroup>
                                    
                                    <!-- Other Feeds -->
                                    <optgroup label="📦 Other Feeds">
                                        <option value="cattle">Cattle Feed</option>
                                        <option value="pig">Pig Feed</option>
                                        <option value="duck">Duck Feed</option>
                                        <option value="turkey">Turkey Feed</option>
                                        <option value="fish">Fish Feed</option>
                                        <option value="other">Other Feed</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Quantity (kg)</label>
                                <input type="number" class="form-input" id="feed-quantity" step="0.1" min="0.1" required>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="feed-notes" rows="2" placeholder="Feeding details..."></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="submit" class="btn-primary" id="feed-submit-btn">Save Record</button>
                            <button type="button" class="btn-outline" id="cancel-feed-edit" style="display: none;">Cancel Edit</button>
                            <button type="button" class="btn-outline" id="cancel-feed-form">Cancel</button>
                        </div>
                    </form>
                </div>
                
                <!-- Feed Records List with Edit/Delete -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📋 Feed Usage Records</h3>
                        <button class="btn-outline" id="export-feed-records">Export</button>
                    </div>
                    <div id="feed-records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
                </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const totalInventoryValue = this.feedInventory.reduce((sum, item) => sum + (item.currentStock * item.costPerKg), 0);
        return { totalStock, totalInventoryValue };
    },

    renderInventoryOverview() {
        return this.feedInventory.map(item => {
            const isLowStock = item.currentStock <= item.minStock;
            const stockStatus = isLowStock ? 'Low Stock' : 'Good';
            const statusColor = isLowStock ? '#ef4444' : '#10b981';
            
            return `
                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                            ${item.feedType}
                        </span>
                        <span style="font-size: 12px; color: ${statusColor}; font-weight: 600;">
                            ${stockStatus}
                        </span>
                    </div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">
                        ${item.currentStock} ${item.unit}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Min: ${item.minStock}${item.unit} • ${this.formatCurrency(item.costPerKg)}/kg
                    </div>
                </div>
            `;
        }).join('');
    },

   renderFeedRecordsList() {
    if (this.feedRecords.length === 0) {
        return `
            <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No feed records yet</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Record your first feed usage above</div>
            </div>
        `;
    }

    // Sort by date (newest first) and take last 5
    const sortedRecords = [...this.feedRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentRecords = sortedRecords.slice(0, 5);

    return recentRecords.map(record => {
        // Calculate cost if available, otherwise show N/A
        const costDisplay = record.cost ? this.formatCurrency(record.cost) : 'N/A';
        const costPerKg = record.cost && record.quantity ? (record.cost / record.quantity).toFixed(2) : 'N/A';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 12px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                        ${this.formatFeedType(record.feedType)}
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary);">
                        ${this.formatDate(record.date)} • ${record.quantity} kg
                        ${record.birdsFed ? ` • ${record.birdsFed} birds` : ''}
                    </div>
                    ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">📝 ${record.notes}</div>` : ''}
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                        ${costDisplay}
                    </div>
                    ${costPerKg !== 'N/A' ? `<div style="font-size: 12px; color: var(--text-secondary);">${costPerKg}/kg</div>` : ''}
                </div>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                    <button class="edit-feed-record" data-id="${record.id}" 
                            style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: #3b82f6; font-size: 16px;" 
                            title="Edit Record">
                        ✏️
                    </button>
                    <button class="delete-feed-record" data-id="${record.id}" 
                            style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: #ef4444; font-size: 16px;" 
                            title="Delete Record">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
},
    
   setupEventListeners() {
    // Form submission
    document.getElementById('feed-record-form')?.addEventListener('submit', (e) => this.handleFeedRecordSubmit(e));
    
    // Quick action buttons
    document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
    document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showAddStockForm());
    document.getElementById('adjust-birds-btn')?.addEventListener('click', () => this.showAdjustBirdsForm());
    document.getElementById('export-feed-records')?.addEventListener('click', () => this.exportFeedRecords());
    
    // Cancel buttons
    document.getElementById('cancel-feed-form')?.addEventListener('click', () => this.cancelFeedForm());
    document.getElementById('cancel-feed-edit')?.addEventListener('click', () => this.cancelFeedEdit());
    
    // Edit/delete buttons (event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-feed-record')) {
            const id = parseInt(e.target.closest('.edit-feed-record').dataset.id);
            this.editFeedRecord(id);
        }
        else if (e.target.closest('.delete-feed-record')) {
            const id = parseInt(e.target.closest('.delete-feed-record').dataset.id);
            this.deleteFeedRecord(id);
        }
    });
},

    handleFeedRecordSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('feed-submit-btn');
        const isEditMode = submitBtn.textContent === 'Update Record';
        const recordId = submitBtn.dataset.editingId;
        
        const feedType = document.getElementById('feed-type').value;
        const quantity = parseFloat(document.getElementById('feed-quantity').value);
        const notes = document.getElementById('feed-notes').value;
        
        if (isEditMode && recordId) {
            this.updateFeedRecord(parseInt(recordId), feedType, quantity, notes);
        } else {
            this.createFeedRecord(feedType, quantity, notes);
        }
    },

   // ==================== FEED RECORD CRUD ====================

createFeedRecord(feedType, quantity, notes) {
    console.log('📝 Creating feed record:', { feedType, quantity, notes });
    
    // Check if feed type has sufficient stock
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (!inventoryItem) {
        this.showNotification('Invalid feed type selected!', 'error');
        return;
    }
    
    if (inventoryItem.currentStock < quantity) {
        this.showNotification(`Insufficient ${feedType} feed. Available: ${inventoryItem.currentStock}kg`, 'error');
        return;
    }
    
    const date = new Date().toISOString().split('T')[0];
    const oldStock = inventoryItem.currentStock;
    
    // Create record
    const formData = {
        id: Date.now(),
        date: date,
        feedType: feedType,
        quantity: quantity,
        cost: this.calculateCost(feedType, quantity),
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    // Update inventory
    inventoryItem.currentStock -= quantity;
    
    // Add to records
    this.feedRecords.unshift(formData);
    this.saveData();
    
    // Broadcast to other modules
    this.broadcastFeedRecorded(formData, feedType, quantity, inventoryItem, oldStock);
    
    // Update UI
    this.updateFeedInventoryDisplay();
    this.renderModule();
    this.resetFeedForm();
    
    this.showNotification(`Recorded ${quantity}kg ${feedType} feed usage!`, 'success');
},

async updateFeedRecord(recordId, feedType, quantity, notes) {
    console.log('✏️ Updating feed record:', recordId, { feedType, quantity, notes });
    
    const originalRecord = this.feedRecords.find(r => r.id === recordId);
    if (!originalRecord) {
        this.showNotification('Record not found', 'error');
        return;
    }
    
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (!inventoryItem) {
        this.showNotification('Invalid feed type selected!', 'error');
        return;
    }
    
    // Calculate stock adjustment
    const stockAdjustment = originalRecord.quantity - quantity;
    const newStock = inventoryItem.currentStock + stockAdjustment;
    
    if (newStock < 0) {
        this.showNotification('Cannot adjust stock below zero!', 'error');
        return;
    }
    
    // Update inventory
    inventoryItem.currentStock = newStock;
    
    // Update record
    const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        const updatedRecord = {
            ...originalRecord,
            feedType,
            quantity,
            notes,
            updatedAt: new Date().toISOString()
        };
        
        this.feedRecords[recordIndex] = updatedRecord;
        this.saveData();
        
        // Broadcast update
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-updated', {
                id: recordId,
                oldData: originalRecord,
                newData: updatedRecord,
                timestamp: new Date().toISOString()
            });
        }
        
        // Update UI
        this.updateFeedInventoryDisplay();
        this.renderModule();
        this.resetFeedForm();
        
        this.showNotification(`Feed record updated!`, 'success');
    }
},

async deleteFeedRecord(recordId) {
    console.log('🗑️ Deleting feed record:', recordId);
    
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) {
        this.showNotification('Record not found', 'error');
        return;
    }
    
    if (!confirm(`Delete feed record for ${this.formatFeedType(record.feedType)} (${record.quantity}kg)?`)) {
        return;
    }
    
    // Filter out the record
    const newRecords = this.feedRecords.filter(r => r.id !== recordId);
    
    // Update local
    this.feedRecords = newRecords;
    
    // Save to localStorage
    localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
    
    // 🔥 CRITICAL: Save filtered array to Firebase
    if (this.dataService) {
        await this.dataService.save('feedRecords', this.feedRecords);
        console.log('✅ Saved updated array to UnifiedDataService');
    }
    
    // Add quantity back to inventory
    const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
    if (inventoryItem) {
        inventoryItem.currentStock += record.quantity;
        if (this.dataService) {
            await this.dataService.save('feedInventory', inventoryItem);
        }
    }
    
    // Re-render
    this.renderModule();
    
    this.showNotification('Feed record deleted!', 'success');
    
    if (this.broadcaster) {
        this.broadcaster.broadcast('feed-deleted', {
            id: recordId,
            feedType: record.feedType,
            quantity: record.quantity
        });
    }
},

editFeedRecord(recordId) {
    console.log('✏️ Editing feed record:', recordId);
    
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) {
        this.showNotification('Record not found', 'error');
        return;
    }
    
    // Get form elements with null checks
    const feedTypeSelect = document.getElementById('feed-type');
    const feedQuantityInput = document.getElementById('feed-quantity');
    const feedNotesInput = document.getElementById('feed-notes');
    const formTitle = document.getElementById('feed-form-title');
    const submitBtn = document.getElementById('feed-submit-btn');
    const cancelEditBtn = document.getElementById('cancel-feed-edit');
    
    // Check if essential elements exist
    if (!feedTypeSelect) {
        console.error('Feed type select not found');
        this.showNotification('Form error: feed type field missing', 'error');
        return;
    }
    
    if (!feedQuantityInput) {
        console.error('Feed quantity input not found');
        this.showNotification('Form error: quantity field missing', 'error');
        return;
    }
    
    if (!formTitle) {
        console.error('Form title not found');
        this.showNotification('Form error', 'error');
        return;
    }
    
    if (!submitBtn) {
        console.error('Submit button not found');
        this.showNotification('Form error: submit button missing', 'error');
        return;
    }
    
    // Populate form
    feedTypeSelect.value = record.feedType;
    feedQuantityInput.value = record.quantity;
    if (feedNotesInput) feedNotesInput.value = record.notes || '';
    
    // Change form title and button
    formTitle.textContent = 'Edit Feed Record';
    submitBtn.textContent = 'Update Record';
    submitBtn.dataset.editingId = recordId;
    
    // Safely handle cancel edit button
    if (cancelEditBtn) {
        cancelEditBtn.style.display = 'inline-block';
    }
    
    // Scroll to form
    const formContainer = document.querySelector('.glass-card');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    this.showNotification('Edit mode: Update the fields and click Update Record', 'info');
},

cancelFeedEdit() {
    console.log('Cancelling feed edit');
    
    const formTitle = document.getElementById('feed-form-title');
    const submitBtn = document.getElementById('feed-submit-btn');
    const cancelEditBtn = document.getElementById('cancel-feed-edit');
    const feedForm = document.getElementById('feed-record-form');
    
    if (formTitle) formTitle.textContent = 'Record Feed Usage';
    
    if (submitBtn) {
        submitBtn.textContent = 'Save Record';
        delete submitBtn.dataset.editingId;
    }
    
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    
    if (feedForm) feedForm.reset();
    
    this.showNotification('Edit cancelled', 'info');
},

calculateCost(feedType, quantity) {
    // Get cost from inventory or use default pricing
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (inventoryItem && inventoryItem.costPerKg) {
        return inventoryItem.costPerKg * quantity;
    }
    
    // Default pricing if not available
    const defaultPrices = {
        'starter': 2.50,
        'grower': 2.30,
        'finisher': 2.20,
        'layer': 2.40,
        'broiler': 2.35
    };
    
    const pricePerKg = defaultPrices[feedType] || 2.50;
    return pricePerKg * quantity;
},

formatFeedType(feedType) {
    if (!feedType) return 'Unknown Feed';
    
    const formats = {
        'starter': 'Starter Feed',
        'grower': 'Grower Feed',
        'finisher': 'Finisher Feed',
        'layer': 'Layer Feed',
        'broiler': 'Broiler Feed',
        'rabbit-starter': 'Rabbit Starter',
        'rabbit-grower': 'Rabbit Grower',
        'rabbit-breeder': 'Rabbit Breeder',
        'rabbit-finisher': 'Rabbit Finisher',
        'sheep-starter': 'Sheep Starter',
        'sheep-grower': 'Sheep Grower',
        'sheep-finisher': 'Sheep Finisher',
        'sheep-maintenance': 'Sheep Maintenance',
        'sheep-lactating': 'Sheep Lactating',
        'goat-starter': 'Goat Starter',
        'goat-grower': 'Goat Grower',
        'goat-finisher': 'Goat Finisher',
        'goat-maintenance': 'Goat Maintenance',
        'goat-lactating': 'Goat Lactating',
        'cattle': 'Cattle Feed',
        'pig': 'Pig Feed',
        'duck': 'Duck Feed',
        'turkey': 'Turkey Feed',
        'fish': 'Fish Feed',
        'other': 'Other Feed'
    };
    
    return formats[feedType] || feedType.charAt(0).toUpperCase() + feedType.slice(1).replace('-', ' ');
},
    
    // ==================== INTEGRATION BROADCASTS ====================
async broadcastFeedRecorded(formData, feedType, quantity, inventoryItem, oldStock) {
    // 1. Broadcast feed recorded
    if (this.broadcaster) {
        this.broadcaster.broadcast('feed-recorded', {
            id: formData.id,
            feedType: feedType,
            quantity: quantity,
            birdsFed: this.birdsStock,
            timestamp: new Date().toISOString()
        });
    }
    
    // 2. Dispatch custom event
    window.dispatchEvent(new CustomEvent('feed-recorded', {
        detail: {
            feedType: feedType,
            quantity: quantity,
            oldStock: oldStock,
            newStock: inventoryItem.currentStock
        }
    }));
    
    // 3. Create and broadcast expense record
    const expenseData = {
        id: Date.now() + 1,
        date: formData.date,
        type: 'expense',
        category: 'feed',
        description: `Feed: ${feedType} - ${quantity}kg`,
        amount: formData.cost || 0,
        paymentMethod: 'cash',
        reference: `FEED-${formData.id.toString().slice(-6)}`,
        notes: formData.notes || `Feed usage record #${formData.id}`,
        source: 'feed-module',
        feedRecordId: formData.id,
        feedType: feedType,
        quantity: quantity,
        birdsFed: this.birdsStock
    };
    
    if (this.broadcaster) {
        this.broadcaster.broadcast('expense-recorded', expenseData);
    }
    
    // 4. Direct update to Income module
    if (window.IncomeExpensesModule && window.IncomeExpensesModule.transactions) {
        window.IncomeExpensesModule.transactions.unshift(expenseData);
        window.IncomeExpensesModule.saveData();
        if (window.app?.currentSection === 'income-expenses') {
            window.IncomeExpensesModule.renderModule();
        }
    }
    
    // 5. Update main inventory module
    await this.updateMainInventory(feedType, quantity, formData.date);
    
    // 6. Update FarmData
    this.updateFarmDataFeed(formData, feedType, quantity);
    
    // 7. Check low stock alert
    this.checkLowStockAlert(inventoryItem, feedType);
    
    // 8. Broadcast cost analytics
    this.broadcastCostAnalytics(formData, feedType, quantity);
},

async updateMainInventory(feedType, quantity, date) {
    if (!window.InventoryCheckModule?.inventory) return;
    
    const mainInventoryItem = window.InventoryCheckModule.inventory.find(item => 
        item.category === 'feed' && 
        item.name?.toLowerCase().includes(feedType.toLowerCase())
    );
    
    if (mainInventoryItem) {
        const mainOldStock = mainInventoryItem.currentStock;
        mainInventoryItem.currentStock -= quantity;
        mainInventoryItem.lastRestocked = date;
        
        if (typeof window.InventoryCheckModule.saveData === 'function') {
            await window.InventoryCheckModule.saveData();
        }
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('inventory-updated', {
                module: 'feed-record',
                itemId: mainInventoryItem.id,
                itemName: mainInventoryItem.name,
                oldStock: mainOldStock,
                newStock: mainInventoryItem.currentStock
            });
        }
    }
},

updateFarmDataFeed(formData, feedType, quantity) {
    if (!window.FarmData) return;
    
    window.FarmData.feed = window.FarmData.feed || { records: [], usage: [] };
    window.FarmData.feed.usage = window.FarmData.feed.usage || [];
    
    window.FarmData.feed.usage.push({
        id: formData.id,
        date: formData.date,
        feedType: feedType,
        quantity: quantity,
        cost: formData.cost,
        birdsFed: this.birdsStock,
        notes: formData.notes
    });
    
    window.dispatchEvent(new CustomEvent('farm-data-updated', {
        detail: { module: 'feed-record', action: 'feed-used' }
    }));
},

checkLowStockAlert(inventoryItem, feedType) {
    if (inventoryItem.currentStock <= inventoryItem.minStock) {
        this.showNotification(`⚠️ Low stock: ${feedType} feed (${inventoryItem.currentStock}kg remaining)`, 'warning');
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('low-stock-alert', {
                module: 'feed-record',
                itemType: 'feed',
                feedType: feedType,
                currentStock: inventoryItem.currentStock,
                minStock: inventoryItem.minStock,
                suggestedOrder: inventoryItem.minStock * 2
            });
        }
    }
},

broadcastCostAnalytics(formData, feedType, quantity) {
    const costPerBird = this.birdsStock > 0 ? (formData.cost || 0) / this.birdsStock : 0;
    
    if (this.broadcaster && this.birdsStock > 0) {
        this.broadcaster.broadcast('feed-cost-analytics', {
            module: 'feed-record',
            feedType: feedType,
            totalCost: formData.cost,
            birdsFed: this.birdsStock,
            costPerBird: costPerBird,
            quantity: quantity,
            date: formData.date
        });
    }
},

// ==================== FORM METHODS ====================

resetFeedForm() {
    const form = document.getElementById('feed-record-form');
    if (form) form.reset();
    
    document.getElementById('feed-record-id').value = '';
    document.getElementById('feed-form-title').textContent = 'Record Feed Usage';
    
    const submitBtn = document.getElementById('feed-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Save Record';
    
    const cancelEditBtn = document.getElementById('cancel-feed-edit');
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
},

cancelFeedForm() {
    this.resetFeedForm();
    this.showNotification('Form cleared', 'info');
},

showFeedForm() {
    document.getElementById('feed-record-form').scrollIntoView({ behavior: 'smooth' });
},

// ==================== EDIT/DELETE METHODS ====================

editFeedRecord(recordId) {
    console.log('✏️ Editing feed record:', recordId);
    
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) {
        this.showNotification('Record not found', 'error');
        return;
    }
    
    // Get form elements
    const feedTypeSelect = document.getElementById('feed-type');
    const feedQuantityInput = document.getElementById('feed-quantity');
    const feedNotesInput = document.getElementById('feed-notes');
    const formTitle = document.getElementById('feed-form-title');
    const submitBtn = document.getElementById('feed-submit-btn');
    const cancelEditBtn = document.getElementById('cancel-feed-edit');
    
    if (!feedTypeSelect || !feedQuantityInput || !formTitle || !submitBtn) {
        console.error('Form elements not found');
        this.showNotification('Could not load edit form', 'error');
        return;
    }
    
    // Populate form
    feedTypeSelect.value = record.feedType;
    feedQuantityInput.value = record.quantity;
    if (feedNotesInput) feedNotesInput.value = record.notes || '';
    
    // Change form title and button
    formTitle.textContent = 'Edit Feed Record';
    submitBtn.textContent = 'Update Record';
    submitBtn.dataset.editingId = recordId;
    
    // Safely handle cancel edit button (create if doesn't exist)
    if (cancelEditBtn) {
        cancelEditBtn.style.display = 'inline-block';
    } else {
        // Create the cancel edit button if it doesn't exist
        const buttonContainer = submitBtn?.parentNode;
        if (buttonContainer && !cancelEditBtn) {
            const newCancelBtn = document.createElement('button');
            newCancelBtn.type = 'button';
            newCancelBtn.className = 'btn-outline';
            newCancelBtn.id = 'cancel-feed-edit';
            newCancelBtn.textContent = 'Cancel Edit';
            newCancelBtn.style.display = 'inline-block';
            newCancelBtn.addEventListener('click', () => this.cancelFeedEdit());
            buttonContainer.insertBefore(newCancelBtn, submitBtn);
        }
    }
    
    // Scroll to form
    const formContainer = document.querySelector('.glass-card');
    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
    
    this.showNotification('Edit mode: Update the fields and click Update Record', 'info');
},

deleteFeedRecord(recordId) {
    // Prevent multiple simultaneous deletes
    if (this._isDeleting) {
        console.log('Delete already in progress, ignoring');
        return;
    }
    
    console.log('🗑️ Deleting feed record:', recordId);
    
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) {
        this.showNotification('Record not found', 'error');
        return;
    }
    
    if (!confirm(`Delete feed record for ${this.formatFeedType(record.feedType)} (${record.quantity}kg)?`)) {
        return;
    }
    
    this._isDeleting = true;
    
    try {
        // Add quantity back to inventory
        const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
        if (inventoryItem) {
            inventoryItem.currentStock += record.quantity;
        }
        
        // Remove record
        this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
        this.saveData();
        
        // Update UI
        this.renderModule();
        
        this.showNotification('Feed record deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting record:', error);
        this.showNotification('Error deleting record', 'error');
    } finally {
        setTimeout(() => {
            this._isDeleting = false;
        }, 500);
    }
},
    
async updateFeedRecord(recordId, feedType, quantity, notes) {
    const originalRecord = this.feedRecords.find(r => r.id === recordId);
    if (!originalRecord) return;
    
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (!inventoryItem) {
        this.showNotification('Invalid feed type selected!', 'error');
        return;
    }
    
    // Calculate stock adjustment
    const stockAdjustment = originalRecord.quantity - quantity;
    const newStock = inventoryItem.currentStock + stockAdjustment;
    
    if (newStock < 0) {
        this.showNotification('Cannot adjust stock below zero!', 'error');
        return;
    }
    
    // Update inventory
    inventoryItem.currentStock = newStock;
    
    // Update record
    const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        const updatedRecord = {
            ...originalRecord,
            feedType,
            quantity,
            notes,
            updatedAt: new Date().toISOString()
        };
        
        this.feedRecords[recordIndex] = updatedRecord;
        await this.saveData();
        this.renderModule();
        this.resetFeedForm();
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-updated', {
                id: recordId,
                oldData: originalRecord,
                newData: updatedRecord
            });
        }
        
        this.showNotification('Feed record updated!', 'success');
    }
},
    
    showAddStockForm() {
        const feedType = prompt('Enter feed type (starter/grower/finisher/layer):');
        if (!feedType) return;
        
        const quantity = parseFloat(prompt(`Enter quantity to add to ${feedType} (kg):`));
        if (isNaN(quantity) || quantity <= 0) {
            this.showNotification('Invalid quantity entered!', 'error');
            return;
        }

        this.addToInventory(feedType, quantity);
    },

    showAdjustBirdsForm() {
        const newCount = parseInt(prompt(`Current birds: ${this.birdsStock}\nEnter new bird count:`));
        if (isNaN(newCount) || newCount < 0) {
            this.showNotification('Invalid bird count entered!', 'error');
            return;
        }

        this.adjustBirdCount(newCount);
    },

   addToInventory(feedType, quantity) {
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (inventoryItem) {
        const oldStock = inventoryItem.currentStock;
        inventoryItem.currentStock += quantity;
        this.saveData();
        this.updateFarmData();
        this.renderModule();
        
        // Save to UnifiedDataService
        if (this.dataService) {
            this.dataService.save('feedInventory', inventoryItem);
        }
        
        // Broadcast inventory addition
        if (this.broadcaster) {
            this.broadcaster.broadcast('inventory-updated', {
                feedType: feedType,
                quantity: quantity,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock,
                timestamp: new Date().toISOString()
            });
        }
        
        this.showNotification(`Added ${quantity}kg to ${feedType} inventory!`, 'success');
    } else {
        // Create new inventory item
        const newItem = {
            id: Date.now(),
            feedType: feedType,
            currentStock: quantity,
            unit: 'kg',
            costPerKg: 2.5,
            minStock: 20
        };
        this.feedInventory.push(newItem);
        this.saveData();
        this.updateFarmData();
        this.renderModule();
        
        // Save to UnifiedDataService
        if (this.dataService) {
            this.dataService.save('feedInventory', newItem);
        }
        
        // Broadcast new inventory creation
        if (this.broadcaster) {
            this.broadcaster.broadcast('inventory-created', {
                feedType: feedType,
                quantity: quantity,
                timestamp: new Date().toISOString()
            });
        }
        
        this.showNotification(`Created new ${feedType} inventory with ${quantity}kg!`, 'success');
    }
},

    adjustBirdCount(newCount) {
        const oldCount = this.birdsStock;
        this.birdsStock = newCount;
        this.saveData();
        this.updateFarmData();
        this.updateBirdCountDisplay();
        
        // Broadcast bird count adjustment
        if (this.broadcaster) {
            this.broadcaster.broadcast('birds-updated', {
                oldCount: oldCount,
                newCount: newCount,
                timestamp: new Date().toISOString()
            });
        }
        
        // Also dispatch custom event
        window.dispatchEvent(new CustomEvent('birds-updated', {
            detail: {
                oldCount: oldCount,
                newCount: newCount
            }
        }));
        
        this.showNotification(`Adjusted bird count to ${newCount}!`, 'success');
    },

    exportFeedRecords() {
        const dataStr = JSON.stringify(this.feedRecords, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feed-records-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Broadcast export
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-exported', {
                count: this.feedRecords.length,
                timestamp: new Date().toISOString()
            });
        }
        
        this.showNotification('Feed records exported successfully!', 'success');
    },

    calculateCost(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        return quantity * (inventoryItem?.costPerKg || 2.5);
    },

    // ===== NEW: Update FarmData =====
    updateFarmData() {
        if (window.FarmData) {
            // Update FarmData with feed information
            if (!window.FarmData.feed) {
                window.FarmData.feed = {
                    records: this.feedRecords,
                    inventory: this.feedInventory,
                    birdsStock: this.birdsStock
                };
            } else {
                window.FarmData.feed.records = this.feedRecords;
                window.FarmData.feed.inventory = this.feedInventory;
                window.FarmData.feed.birdsStock = this.birdsStock;
            }
            
            // Also update the birds count in inventory if needed
            if (window.FarmData.inventory) {
                const birdItem = window.FarmData.inventory.find(item => 
                    item.name?.toLowerCase().includes('bird')
                );
                if (birdItem) {
                    birdItem.quantity = this.birdsStock;
                }
            }
            
            // Dispatch update event
            window.dispatchEvent(new CustomEvent('farm-data-updated', {
                detail: { module: 'feed-record' }
            }));
        }
        
        this.syncStatsWithSharedData();
    },

    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.birdsStock;
            window.FarmModules.appData.profile.dashboardStats.totalFeedStock = stats.totalStock;
            window.FarmModules.appData.profile.dashboardStats.inventoryValue = stats.totalInventoryValue;
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(`${type.toUpperCase()}: ${message}`);
        }
    },

    formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Try to parse as YYYY-MM-DD
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            }
            return dateString;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('Date formatting error:', error);
        return dateString;
    }
},

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    saveData() {
    localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
    localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
    localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
    
    // Save to UnifiedDataService
    if (this.dataService) {
        // Save feed records
        for (const record of this.feedRecords) {
            this.dataService.save('feedRecords', record);
        }
        // Save feed inventory
        for (const item of this.feedInventory) {
            this.dataService.save('feedInventory', item);
        }
        // Update bird stock in inventory
        const inventory = this.dataService.get('inventory') || [];
        const birdItem = inventory.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler')
        );
        if (birdItem) {
            this.dataService.update('inventory', birdItem.id, { quantity: this.birdsStock });
        }
    }
},

    updateFeedInventoryDisplay() {
    // This method is called but may not exist
    console.log('Updating feed inventory display');
    // The renderModule already handles this, so just re-render if needed
    if (this.initialized) {
        this.renderModule();
    }
},
    
    unload() {
        console.log('📦 Unloading Feed module...');
        
        // Clean up
        if (this.broadcaster) {
            this.broadcaster = null;
        }
        
        // Hide any open modals
        const modal = document.getElementById('feed-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Reset state
        this.initialized = false;
        this.element = null;
        this.currentEditingId = null;
        
        console.log('✅ Feed module unloaded');
    }
};

// ==================== REGISTRATION ====================

if (window.FarmModules) {
    window.FarmModules.registerModule('feed-record', FeedRecordModule);
    console.log('✅ Feed Records module registered');
}

// Make globally accessible
window.FeedRecordModule = FeedRecordModule;

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'feed-record';
    const MODULE_OBJECT = FeedRecordModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();

// ==================== ENHANCE EDIT BUTTONS ====================
(function() {
    'use strict';
    
    console.log('🌾 Loading feed record edit button enhancements...');
    
    function enhanceFeedEditButtons() {
        const editButtons = document.querySelectorAll('.edit-feed-record');
        const deleteButtons = document.querySelectorAll('.delete-feed-record');
        
        editButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.2)';
                btn.style.color = '#3b82f6';
                btn.style.background = 'rgba(59, 130, 246, 0.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.color = '';
                btn.style.background = '';
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.2)';
                btn.style.color = '#ef4444';
                btn.style.background = 'rgba(239, 68, 68, 0.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.color = '';
                btn.style.background = '';
            });
        });
    }
    
    // Apply when module loads
    setTimeout(() => {
        enhanceFeedEditButtons();
        
        // Re-apply when switching to feed-record
        document.addEventListener('click', function(e) {
            if (e.target.closest('[href*="#feed-record"], [onclick*="feed-record"]')) {
                setTimeout(enhanceFeedEditButtons, 500);
            }
        });
    }, 1000);
    
    console.log('✅ Feed record edit enhancements loaded');
    
})();

// ==================== BUTTON SIZE FIX ====================
(function() {
    // Create style element for button fixes
    const styleId = 'feed-record-button-fix';
    
    // Remove existing fix if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    
    // CSS to make buttons smaller
    styleElement.textContent = `
        /* Override quick action button sizes in feed-record module only */
        #content-area .quick-action-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
        }
        
        #content-area .quick-action-btn {
            padding: 12px !important;
            min-height: 80px !important;
            border-radius: 8px !important;
            gap: 6px !important;
        }
        
        #content-area .quick-action-btn > div {
            font-size: 24px !important;
            margin-bottom: 2px !important;
        }
        
        #content-area .quick-action-btn > span:nth-of-type(1) {
            font-size: 12px !important;
            line-height: 1.2 !important;
        }
        
        #content-area .quick-action-btn > span:nth-of-type(2) {
            font-size: 10px !important;
            line-height: 1.2 !important;
        }
        
        /* Make stats cards smaller too */
        #content-area .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            gap: 12px !important;
        }
        
        #content-area .stat-card {
            padding: 12px !important;
        }
        
        #content-area .stat-card > div:nth-of-type(1) {
            font-size: 20px !important;
            margin-bottom: 4px !important;
        }
        
        #content-area .stat-card > div:nth-of-type(2) {
            font-size: 18px !important;
            margin-bottom: 2px !important;
        }
        
        #content-area .stat-card > div:nth-of-type(3) {
            font-size: 11px !important;
        }
    `;
    
    // Add to document
    document.head.appendChild(styleElement);
    console.log('✅ Feed record button size fix applied');
})();
