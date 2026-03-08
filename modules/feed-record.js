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

    initialize() {
        console.log('🌾 Initializing Feed Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Get broadcaster if available
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Feed module connected to Broadcaster');
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.loadData();
        this.syncWithFarmData(); // Get real bird count from FarmData
        this.renderModule();
        this.setupEventListeners();
        this.setupBroadcasterListeners();
        this.initialized = true;
        
        console.log('✅ Feed Records initialized with StyleManager');
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

    loadData() {
        const savedRecords = localStorage.getItem('farm-feed-records');
        const savedInventory = localStorage.getItem('farm-feed-inventory');
        const savedBirds = localStorage.getItem('farm-birds-stock');
        
        this.feedRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoRecords();
        this.feedInventory = savedInventory ? JSON.parse(savedInventory) : this.getDemoInventory();
        
        // Don't default to 1000 - use FarmData or saved value
        if (savedBirds) {
            this.birdsStock = parseInt(savedBirds);
        } else {
            this.birdsStock = 0; // Will be updated by syncWithFarmData
        }
    },

    getDemoRecords() {
        return [
            { id: 1, date: '2024-03-15', feedType: 'starter', quantity: 50, birdsFed: 500, cost: 125, notes: 'Morning feeding' },
            { id: 2, date: '2024-03-14', feedType: 'grower', quantity: 45, birdsFed: 480, cost: 112.5, notes: 'Regular feeding' },
            { id: 3, date: '2024-03-13', feedType: 'finisher', quantity: 40, birdsFed: 450, cost: 100, notes: 'Evening feeding' }
        ];
    },

    getDemoInventory() {
        return [
            { id: 1, feedType: 'starter', currentStock: 150, unit: 'kg', costPerKg: 2.5, minStock: 50 },
            { id: 2, feedType: 'grower', currentStock: 120, unit: 'kg', costPerKg: 2.3, minStock: 40 },
            { id: 3, feedType: 'finisher', currentStock: 100, unit: 'kg', costPerKg: 2.2, minStock: 30 },
            { id: 4, feedType: 'layer', currentStock: 80, unit: 'kg', costPerKg: 2.4, minStock: 20 }
        ];
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
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Feed Type</label>
                                    <select class="form-input" id="feed-type" required>
                                        <option value="">Select feed type</option>
                                        ${this.feedInventory.map(item => `
                                            <option value="${item.feedType}" ${item.currentStock <= item.minStock ? 'disabled' : ''}>
                                                ${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed 
                                                ${item.currentStock <= item.minStock ? '(Low Stock)' : ''}
                                            </option>
                                        `).join('')}
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
                                <button type="button" class="btn-outline" id="cancel-feed-form">Cancel</button>
                                <button type="button" class="btn-outline" id="cancel-feed-edit" style="display: none;">Cancel Edit</button>
                            </div>
                        </form>
                    </div>
                    
                <!-- Recent Records -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Feed Records</h3>
                        <button class="btn-outline" id="export-feed-records">Export</button>
                    </div>
                    <div id="feed-records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
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
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first feed usage</div>
                </div>
            `;
        }

        return this.feedRecords.slice(0, 5).map(record => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 12px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                        ${record.feedType} Feed
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary);">
                        ${record.date} • ${record.quantity}kg • ${record.birdsFed} birds
                    </div>
                    ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${record.notes}</div>` : ''}
                </div>
                <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
                    <div>
                        <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                            ${this.formatCurrency(record.cost)}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            ${(record.cost / record.quantity).toFixed(2)}/kg
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon edit-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Edit Record">
                            ✏️
                        </button>
                        <button class="btn-icon delete-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Delete Record">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
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

    createFeedRecord(feedType, quantity, notes) {
        // Check if feed type has sufficient stock
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected!', 'error');
            return;
        }
        
        if (inventoryItem.currentStock < quantity) {
            this.showNotification(`Insufficient stock! Only ${inventoryItem.currentStock}kg available.`, 'error');
            return;
        }

        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            feedType: feedType,
            quantity: quantity,
            cost: this.calculateCost(feedType, quantity),
            notes: notes,
            birdsFed: this.birdsStock
        };

        // Update inventory
        const oldStock = inventoryItem.currentStock;
        inventoryItem.currentStock -= quantity;
        
        this.feedRecords.unshift(formData);
        this.saveData();
        this.updateFarmData();
        this.renderModule();
        
        // Broadcast feed recorded
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-recorded', {
                id: formData.id,
                feedType: feedType,
                quantity: quantity,
                birdsFed: this.birdsStock,
                timestamp: new Date().toISOString()
            });
        }
        
        // Also dispatch custom event
        window.dispatchEvent(new CustomEvent('feed-recorded', {
            detail: {
                feedType: feedType,
                quantity: quantity,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock
            }
        }));
        
        this.showNotification(`Recorded ${formData.quantity}kg ${feedType} feed usage!`, 'success');
    },

    cancelFeedForm() {
    console.log('❌ Cancelling feed form');
    
    // Reset form
    document.getElementById('feed-record-form').reset();
    
    // Reset form title and button
    document.getElementById('feed-form-title').textContent = 'Record Feed Usage';
    const submitBtn = document.getElementById('feed-submit-btn');
    submitBtn.textContent = 'Save Record';
    delete submitBtn.dataset.editingId;
    
    // Hide edit cancel button
    document.getElementById('cancel-feed-edit').style.display = 'none';
    
    // Scroll back to top of form or hide it? Usually just reset
    this.showNotification('Form cleared', 'info');
},
    
    editFeedRecord(recordId) {
        console.log('🌾 EDITING FEED RECORD:', recordId);
        
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) {
            this.showNotification('Feed record not found', 'error');
            return;
        }
        
        // Scroll to form
        this.showFeedForm();
        
        // Wait for form to render, then populate
        setTimeout(() => {
            // Populate form
            document.getElementById('feed-type').value = record.feedType;
            document.getElementById('feed-quantity').value = record.quantity;
            document.getElementById('feed-notes').value = record.notes || '';
            
            // Change form title and button
            document.getElementById('feed-form-title').textContent = 'Edit Feed Record';
            const submitBtn = document.getElementById('feed-submit-btn');
            submitBtn.textContent = 'Update Record';
            submitBtn.dataset.editingId = recordId;
            
            // Show cancel button
            document.getElementById('cancel-feed-edit').style.display = 'inline-block';
            
            console.log('✅ Feed record form populated for editing');
            
        }, 100);
    },

    updateFeedRecord(recordId, feedType, quantity, notes) {
        console.log('💾 UPDATING FEED RECORD:', recordId);
        
        // Check if feed type has sufficient stock (considering we're editing, not adding new)
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected!', 'error');
            return;
        }
        
        // Find the original record to check stock adjustments
        const originalRecord = this.feedRecords.find(r => r.id === recordId);
        if (!originalRecord) return;
        
        // Calculate stock adjustment
        const stockAdjustment = originalRecord.quantity - quantity;
        const newStock = inventoryItem.currentStock + stockAdjustment;
        
        if (newStock < 0) {
            this.showNotification(`Cannot adjust stock below zero!`, 'error');
            return;
        }
        
        // Update inventory
        inventoryItem.currentStock = newStock;
        
        // Update record
        const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
        if (recordIndex !== -1) {
            const oldRecord = this.feedRecords[recordIndex];
            const updatedRecord = {
                ...oldRecord,
                feedType,
                quantity,
                cost: this.calculateCost(feedType, quantity),
                notes
            };
            
            this.feedRecords[recordIndex] = updatedRecord;
            this.saveData();
            this.updateFarmData();
            this.renderModule();
            this.cancelFeedEdit();
            
            // Broadcast update
            if (this.broadcaster) {
                this.broadcaster.broadcast('feed-updated', {
                    id: recordId,
                    oldData: oldRecord,
                    newData: updatedRecord,
                    timestamp: new Date().toISOString()
                });
            }
            
            this.showNotification(`Feed record updated!`, 'success');
        }
    },
   
    cancelFeedEdit() {
    console.log('❌ Cancelling feed edit');
    
    // Reset form
    document.getElementById('feed-record-form').reset();
    
    // Reset form title and button
    document.getElementById('feed-form-title').textContent = 'Record Feed Usage';
    const submitBtn = document.getElementById('feed-submit-btn');
    submitBtn.textContent = 'Save Record';
    delete submitBtn.dataset.editingId;
    
    // Hide edit cancel button
    document.getElementById('cancel-feed-edit').style.display = 'none';
    
    this.showNotification('Edit cancelled', 'info');
},
    
    deleteFeedRecord(recordId) {
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) return;
        
        if (confirm(`Delete feed record for ${record.quantity}kg of ${record.feedType} feed?`)) {
            // Return stock to inventory when deleting
            const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
            let stockReturned = 0;
            let newStock = 0;
            
            if (inventoryItem) {
                stockReturned = record.quantity;
                inventoryItem.currentStock += record.quantity;
                newStock = inventoryItem.currentStock;
            }
            
            // Remove record
            this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
            this.saveData();
            this.updateFarmData();
            this.renderModule();
            
            // Broadcast deletion
            if (this.broadcaster) {
                this.broadcaster.broadcast('feed-deleted', {
                    id: recordId,
                    data: record,
                    timestamp: new Date().toISOString()
                });
            }
            
            this.showNotification('Feed record deleted!', 'success');
        }
    },

    showFeedForm() {
        document.getElementById('feed-record-form').scrollIntoView({ behavior: 'smooth' });
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
                costPerKg: 2.5, // Default cost
                minStock: 20
            };
            this.feedInventory.push(newItem);
            this.saveData();
            this.updateFarmData();
            this.renderModule();
            
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

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'feed-record.js';
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
