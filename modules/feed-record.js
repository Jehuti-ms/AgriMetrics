// modules/feed-record.js - COMPLETE WITH UNIFIED DATA SERVICE INTEGRATION
console.log('🌾 Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 0,
    element: null,
    broadcaster: null,
    dataService: null,
    currentEditingId: null,

    // ==================== INITIALIZATION ====================
    async initialize() {
        console.log('🌾 Initializing Feed Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Get reference to UnifiedDataService
        this.dataService = window.UnifiedDataService;
        
        if (!this.dataService) {
            console.warn('⚠️ UnifiedDataService not available, using legacy mode');
            return this.initializeLegacy();
        }

        // Get broadcaster if available (fallback for legacy events)
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Feed module connected to Broadcaster');
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        // Load data from unified service
        await this.loadData();
        
        // Sync with FarmData (legacy compatibility)
        await this.syncWithFarmData();
        
        // Setup real-time sync
        this.setupRealtimeSync();
        
        // Render module
        this.renderModule();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup broadcaster listeners (legacy)
        this.setupBroadcasterListeners();
        
        this.initialized = true;
        
        // Update sync status
        this.updateSyncStatus(this.dataService.getSyncStatus());
        
        console.log('✅ Feed Records initialized with UnifiedDataService');
        console.log('📊 Sync status:', this.dataService.getSyncStatus());
        console.log('📦 Pending operations:', this.dataService.offlineQueue?.length || 0);
        
        return true;
    },

    /**
     * Legacy initialization for backward compatibility
     */
    initializeLegacy() {
        console.log('⚠️ Using legacy initialization for Feed Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Feed module connected to Broadcaster');
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
        
        console.log('✅ Feed Records initialized with StyleManager (legacy mode)');
        return true;
    },

    // ==================== DATA LOADING ====================
    async loadData() {
        console.log('Loading feed data from UnifiedDataService...');
        
        try {
            // Get from unified service
            this.feedRecords = this.dataService.get('feedRecords') || [];
            this.feedInventory = this.dataService.get('feedInventory') || [];
            
            // Get birds stock from inventory
            const inventory = this.dataService.get('inventory') || [];
            const birdItem = inventory.find(item => 
                item.name?.toLowerCase().includes('bird') || 
                item.name?.toLowerCase().includes('broiler') ||
                item.name?.toLowerCase().includes('chicken') ||
                item.category?.toLowerCase().includes('poultry')
            );
            
            this.birdsStock = birdItem?.quantity || 0;
            
            // Also check localStorage for any data that might not be in unified service yet
            if (this.feedRecords.length === 0) {
                const savedRecords = localStorage.getItem('farm-feed-records');
                if (savedRecords) {
                    const localRecords = JSON.parse(savedRecords);
                    console.log(`📁 Found ${localRecords.length} feed records in localStorage, importing...`);
                    
                    for (const record of localRecords) {
                        await this.dataService.save('feedRecords', record);
                    }
                    this.feedRecords = this.dataService.get('feedRecords') || [];
                }
            }
            
            if (this.feedInventory.length === 0) {
                const savedInventory = localStorage.getItem('farm-feed-inventory');
                if (savedInventory) {
                    const localInventory = JSON.parse(savedInventory);
                    console.log(`📁 Found ${localInventory.length} inventory items in localStorage, importing...`);
                    
                    for (const item of localInventory) {
                        await this.dataService.save('feedInventory', item);
                    }
                    this.feedInventory = this.dataService.get('feedInventory') || [];
                }
            }
            
            // If still no bird stock, check farm-birds-storage
            if (this.birdsStock === 0) {
                const savedBirds = localStorage.getItem('farm-birds-stock');
                if (savedBirds) {
                    this.birdsStock = parseInt(savedBirds);
                    if (this.birdsStock > 0) {
                        await this.updateBirdStockInUnifiedService(this.birdsStock);
                    }
                }
            }
            
            console.log(`✅ Loaded: ${this.feedRecords.length} feed records, ${this.feedInventory.length} inventory items, ${this.birdsStock} birds`);
            
        } catch (error) {
            console.error('❌ Error loading feed data from unified service:', error);
            this.loadDataLegacy();
        }
    },

    loadDataLegacy() {
        console.log('Loading feed data from localStorage (legacy)...');
        
        const savedRecords = localStorage.getItem('farm-feed-records');
        const savedInventory = localStorage.getItem('farm-feed-inventory');
        const savedBirds = localStorage.getItem('farm-birds-stock');
        
        this.feedRecords = savedRecords ? JSON.parse(savedRecords) : [];
        this.feedInventory = savedInventory ? JSON.parse(savedInventory) : [];
        this.birdsStock = savedBirds ? parseInt(savedBirds) : 0;
        
        console.log(`✅ Legacy load: ${this.feedRecords.length} records, ${this.feedInventory.length} inventory, ${this.birdsStock} birds`);
    },

    saveData() {
        if (this.dataService) {
            // Unified service handles saving - we just need to save locally for UI
            localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
            localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
            localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
        } else {
            // Legacy save
            localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
            localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
            localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
        }
        console.log('💾 Saved feed data:', this.feedRecords.length, 'records');
    },

    // ==================== REAL-TIME SYNC ====================
    setupRealtimeSync() {
        console.log('📡 Setting up real-time sync for feed...');
        
        if (!this.dataService) return;
        
        // Listen for feed record updates
        this.dataService.on('feedRecords-updated', (records) => {
            console.log('🔄 Feed records updated from unified service:', records?.length);
            const oldCount = this.feedRecords.length;
            this.feedRecords = records || [];
            
            if (oldCount !== this.feedRecords.length) {
                this.renderModule();
                this.showNotification(`📱 ${this.feedRecords.length - oldCount > 0 ? 'New' : 'Updated'} feed records synced`, 'info');
            }
        });
        
        // Listen for feed inventory updates
        this.dataService.on('feedInventory-updated', (inventory) => {
            console.log('🔄 Feed inventory updated from unified service:', inventory?.length);
            this.feedInventory = inventory || [];
            this.renderModule();
        });
        
        // Listen for inventory updates (bird count)
        this.dataService.on('inventory-updated', async (inventory) => {
            const birdItem = inventory?.find(item => 
                item.name?.toLowerCase().includes('bird') || 
                item.name?.toLowerCase().includes('broiler') ||
                item.name?.toLowerCase().includes('chicken')
            );
            
            if (birdItem && birdItem.quantity !== this.birdsStock) {
                const oldCount = this.birdsStock;
                this.birdsStock = birdItem.quantity;
                this.updateBirdCountDisplay();
                console.log(`🐔 Bird count updated: ${oldCount} → ${this.birdsStock}`);
                
                if (this.birdsStock > oldCount) {
                    this.showNotification(`📱 Bird count increased to ${this.birdsStock} (synced from another device)`, 'info');
                } else if (this.birdsStock < oldCount) {
                    this.showNotification(`📱 Bird count decreased to ${this.birdsStock} (synced from another device)`, 'info');
                }
            }
        });
        
        // Listen for sync status changes
        this.dataService.on('sync-completed', (status) => {
            console.log('✅ Sync completed for feed module:', status);
            this.updateSyncStatus(status);
            
            if (status.successCount > 0) {
                this.showNotification(`✅ Synced ${status.successCount} feed record(s)`, 'success');
            }
        });
        
        // Listen for offline queue updates
        this.dataService.on('offline-operation-queued', (data) => {
            console.log('📦 Feed operation queued:', data);
            this.updateSyncStatus({ pendingRemaining: data.queueLength });
        });
    },

    updateSyncStatus(status) {
        const statusElement = document.getElementById('feed-sync-status');
        if (!statusElement) return;
        
        if (this.dataService && !this.dataService.isOnline) {
            statusElement.textContent = `📴 Offline`;
            statusElement.style.color = '#f44336';
        } else if (status.pendingRemaining > 0) {
            statusElement.textContent = `⏳ Syncing (${status.pendingRemaining} pending)`;
            statusElement.style.color = '#FF9800';
        } else {
            statusElement.textContent = `✅ Synced`;
            statusElement.style.color = '#4CAF50';
        }
    },

    // ==================== FARM DATA SYNC ====================
    async syncWithFarmData() {
        console.log('🔄 Syncing Feed module with FarmData...');
        
        if (this.dataService) {
            const inventory = this.dataService.get('inventory') || [];
            const birdItem = inventory.find(item => 
                item.name?.toLowerCase().includes('bird') || 
                item.name?.toLowerCase().includes('broiler') ||
                item.category?.toLowerCase().includes('poultry')
            );
            
            if (birdItem && birdItem.quantity) {
                this.birdsStock = parseInt(birdItem.quantity) || 0;
            }
            
            if (window.FarmData) {
                if (!window.FarmData.feed) {
                    window.FarmData.feed = { records: this.feedRecords, inventory: this.feedInventory };
                } else {
                    window.FarmData.feed.records = this.feedRecords;
                    window.FarmData.feed.inventory = this.feedInventory;
                    window.FarmData.feed.birdsStock = this.birdsStock;
                }
            }
            
            this.updateBirdCountDisplay();
        } else {
            this.syncWithFarmDataLegacy();
        }
    },

    syncWithFarmDataLegacy() {
        console.log('🔄 Syncing Feed module with FarmData (legacy)...');
        
        if (window.FarmData) {
            let birdCount = 0;
            
            if (window.FarmData.inventory && Array.isArray(window.FarmData.inventory)) {
                const birdItem = window.FarmData.inventory.find(item => 
                    item.name?.toLowerCase().includes('bird') || 
                    item.name?.toLowerCase().includes('broiler') ||
                    item.category?.toLowerCase().includes('poultry')
                );
                if (birdItem && birdItem.quantity) birdCount = parseInt(birdItem.quantity) || 0;
            }
            
            if (birdCount > 0) {
                this.birdsStock = birdCount;
            } else {
                const savedBirds = localStorage.getItem('farm-birds-stock');
                this.birdsStock = savedBirds ? parseInt(savedBirds) : 0;
            }
            
            if (!window.FarmData.feed) {
                window.FarmData.feed = { records: this.feedRecords, inventory: this.feedInventory };
            } else {
                window.FarmData.feed.records = this.feedRecords;
                window.FarmData.feed.inventory = this.feedInventory;
            }
            
            window.dispatchEvent(new CustomEvent('feed-data-updated', {
                detail: { birdsStock: this.birdsStock, records: this.feedRecords.length, inventory: this.feedInventory.length }
            }));
        }
        
        this.updateBirdCountDisplay();
    },

    updateFarmDataLegacy(formData) {
        if (!window.FarmData) return;
        
        if (!window.FarmData.feed) {
            window.FarmData.feed = { records: [], usage: [] };
        }
        
        window.FarmData.feed.usage = window.FarmData.feed.usage || [];
        window.FarmData.feed.usage.push({
            id: formData.id,
            date: formData.date,
            feedType: formData.feedType,
            quantity: formData.quantity,
            cost: formData.cost,
            birdsFed: this.birdsStock,
            notes: formData.notes
        });
        
        window.dispatchEvent(new CustomEvent('farm-data-updated', {
            detail: { module: 'feed-record', action: 'feed-used', data: formData }
        }));
    },

    // ==================== CORE FUNCTIONALITY ====================
    async createFeedRecord(feedType, quantity, notes) {
        console.log('Creating feed record via unified service...');
        
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected!', 'error');
            return null;
        }
        
        if (inventoryItem.currentStock < quantity) {
            this.showNotification(`Insufficient stock! Only ${inventoryItem.currentStock}kg available.`, 'error');
            return null;
        }

        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            feedType: feedType,
            quantity: quantity,
            cost: this.calculateCost(feedType, quantity),
            notes: notes,
            birdsFed: this.birdsStock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const oldStock = inventoryItem.currentStock;
        
        try {
            let result;
            
            if (this.dataService) {
                // Save feed record
                const feedResult = await this.dataService.save('feedRecords', formData);
                if (!feedResult.success) {
                    this.showNotification('Error saving feed record: ' + (feedResult.error || 'Unknown error'), 'error');
                    return null;
                }
                
                // Update inventory
                inventoryItem.currentStock -= quantity;
                await this.dataService.save('feedInventory', inventoryItem);
                
                // Create expense record
                const expenseData = {
                    id: Date.now() + 1,
                    date: formData.date,
                    type: 'expense',
                    category: 'feed',
                    description: `Feed: ${feedType} - ${quantity}kg`,
                    amount: formData.cost,
                    paymentMethod: 'cash',
                    reference: `FEED-${formData.id.toString().slice(-6)}`,
                    notes: notes || `Feed usage record #${formData.id}`,
                    source: 'feed-module',
                    feedRecordId: formData.id,
                    feedType: feedType,
                    quantity: quantity,
                    birdsFed: this.birdsStock
                };
                
                await this.dataService.save('transactions', expenseData);
                
                // Update local arrays
                this.feedRecords = this.dataService.get('feedRecords') || [];
                this.feedInventory = this.dataService.get('feedInventory') || [];
                
                result = feedResult;
            } else {
                result = await this.saveFeedRecordLegacy(formData, inventoryItem, oldStock);
            }
            
            if (!result.success) {
                this.showNotification('Error saving feed record: ' + (result.error || 'Unknown error'), 'error');
                return null;
            }
            
            // Broadcast feed recorded
            await this.broadcastFeedRecorded(formData, oldStock, inventoryItem.currentStock);
            
            // Broadcast expense to modules
            const expenseData = {
                id: Date.now() + 1,
                date: formData.date,
                type: 'expense',
                category: 'feed',
                description: `Feed: ${feedType} - ${quantity}kg`,
                amount: formData.cost,
                paymentMethod: 'cash',
                reference: `FEED-${formData.id.toString().slice(-6)}`,
                notes: notes || `Feed usage record #${formData.id}`,
                source: 'feed-module',
                feedRecordId: formData.id
            };
            await this.broadcastExpenseToModules(expenseData);
            
            // Update main inventory module
            await this.updateMainInventoryModule(feedType, quantity, formData.date);
            
            // Update FarmData (legacy compatibility)
            this.updateFarmDataLegacy(formData);
            
            // Check low stock alert
            this.checkLowStockAlert(inventoryItem, feedType);
            
            // Broadcast feed analytics
            this.broadcastFeedAnalytics(formData);
            
            // Update UI
            if (!this.dataService) {
                this.feedRecords.unshift(formData);
                this.saveData();
                this.renderModule();
            }
            
            const offlineMsg = result.offline ? ' (will sync when online)' : '';
            this.showNotification(`Recorded ${formData.quantity}kg ${feedType} feed usage!${offlineMsg}`, 'success');
            
            if (this.dataService) {
                this.updateSyncStatus(this.dataService.getSyncStatus());
            }
            
            return formData;
            
        } catch (error) {
            console.error('❌ Error in createFeedRecord:', error);
            this.showNotification('Error creating feed record: ' + error.message, 'error');
            return null;
        }
    },

    async saveFeedRecordLegacy(formData, inventoryItem, oldStock) {
        console.log('Saving feed record via legacy method...');
        
        try {
            inventoryItem.currentStock -= formData.quantity;
            this.feedRecords.unshift(formData);
            this.saveData();
            this.updateFarmData();
            return { success: true, offline: false };
        } catch (error) {
            console.error('Legacy save error:', error);
            return { success: false, error: error.message };
        }
    },

    async updateFeedRecord(recordId, feedType, quantity, notes) {
        console.log('💾 UPDATING FEED RECORD:', recordId);
        
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected!', 'error');
            return;
        }
        
        const originalRecord = this.feedRecords.find(r => r.id === recordId);
        if (!originalRecord) return;
        
        const stockAdjustment = originalRecord.quantity - quantity;
        const newStock = inventoryItem.currentStock + stockAdjustment;
        
        if (newStock < 0) {
            this.showNotification(`Cannot adjust stock below zero!`, 'error');
            return;
        }
        
        const updatedRecord = {
            ...originalRecord,
            feedType,
            quantity,
            cost: this.calculateCost(feedType, quantity),
            notes,
            updatedAt: new Date().toISOString()
        };
        
        if (this.dataService) {
            await this.dataService.update('feedRecords', recordId, updatedRecord);
            inventoryItem.currentStock = newStock;
            await this.dataService.save('feedInventory', inventoryItem);
        } else {
            inventoryItem.currentStock = newStock;
            const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
            if (recordIndex !== -1) {
                this.feedRecords[recordIndex] = updatedRecord;
                this.saveData();
            }
        }
        
        this.renderModule();
        this.cancelFeedEdit();
        
        this.broadcastFeedUpdated(recordId, originalRecord, updatedRecord);
        this.showNotification(`Feed record updated!`, 'success');
    },

    async deleteFeedRecord(recordId) {
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) return;
        
        if (confirm(`Delete feed record for ${record.quantity}kg of ${record.feedType} feed?`)) {
            const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
            let stockReturned = 0;
            
            if (inventoryItem) {
                stockReturned = record.quantity;
                inventoryItem.currentStock += record.quantity;
            }
            
            if (this.dataService) {
                await this.dataService.delete('feedRecords', recordId);
                if (inventoryItem) {
                    await this.dataService.save('feedInventory', inventoryItem);
                }
            } else {
                this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
                this.saveData();
            }
            
            this.renderModule();
            this.broadcastFeedDeleted(recordId, record);
            this.showNotification('Feed record deleted!', 'success');
        }
    },

    // ==================== BROADCAST METHODS ====================
    async broadcastFeedRecorded(formData, oldStock, newStock) {
        const broadcastData = {
            id: formData.id,
            feedType: formData.feedType,
            quantity: formData.quantity,
            birdsFed: this.birdsStock,
            cost: formData.cost,
            oldStock: oldStock,
            newStock: newStock,
            timestamp: new Date().toISOString()
        };
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-recorded', broadcastData);
        }
        
        window.dispatchEvent(new CustomEvent('feed-recorded', { detail: broadcastData }));
        
        if (this.dataService) {
            this.dataService.broadcast('feed-recorded', broadcastData);
        }
    },

    async broadcastExpenseToModules(expenseData) {
        if (this.broadcaster) {
            this.broadcaster.broadcast('expense-recorded', expenseData);
        }
        
        window.dispatchEvent(new CustomEvent('expense-recorded', { detail: expenseData }));
        
        if (this.dataService) {
            this.dataService.broadcast('expense-recorded', expenseData);
        }
        
        if (window.IncomeExpensesModule && window.IncomeExpensesModule.transactions) {
            window.IncomeExpensesModule.transactions.unshift(expenseData);
            if (typeof window.IncomeExpensesModule.saveData === 'function') {
                window.IncomeExpensesModule.saveData();
            }
            if (window.app?.currentSection === 'income-expenses') {
                window.IncomeExpensesModule.renderModule();
            }
        }
    },

    broadcastFeedUpdated(recordId, oldRecord, newRecord) {
        const broadcastData = {
            id: recordId,
            oldData: oldRecord,
            newData: newRecord,
            timestamp: new Date().toISOString()
        };
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-updated', broadcastData);
        }
        
        if (this.dataService) {
            this.dataService.broadcast('feed-updated', broadcastData);
        }
    },

    broadcastFeedDeleted(recordId, record) {
        const broadcastData = {
            id: recordId,
            data: record,
            timestamp: new Date().toISOString()
        };
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('feed-deleted', broadcastData);
        }
        
        if (this.dataService) {
            this.dataService.broadcast('feed-deleted', broadcastData);
        }
    },

    broadcastFeedAnalytics(formData) {
        const costPerBird = this.birdsStock > 0 ? formData.cost / this.birdsStock : 0;
        console.log(`📊 Feed cost analytics: $${costPerBird.toFixed(2)} per bird`);
        
        const analyticsData = {
            module: 'feed-record',
            feedType: formData.feedType,
            totalCost: formData.cost,
            birdsFed: this.birdsStock,
            costPerBird: costPerBird,
            quantity: formData.quantity,
            date: formData.date,
            timestamp: new Date().toISOString()
        };
        
        if (this.broadcaster && this.birdsStock > 0) {
            this.broadcaster.broadcast('feed-cost-analytics', analyticsData);
        }
        
        if (this.dataService && this.birdsStock > 0) {
            this.dataService.broadcast('feed-cost-analytics', analyticsData);
        }
        
        window.dispatchEvent(new CustomEvent('feed-cost-analytics', { detail: analyticsData }));
    },

    // ==================== INVENTORY INTEGRATION ====================
    async updateMainInventoryModule(feedType, quantity, date) {
        if (!window.InventoryCheckModule || !window.InventoryCheckModule.inventory) {
            console.log('⚠️ Inventory module not available');
            return;
        }
        
        console.log('📦 Updating main Inventory module feed stock');
        
        const mainInventoryItem = window.InventoryCheckModule.inventory.find(item => 
            item.category === 'feed' && 
            item.name?.toLowerCase().includes(feedType.toLowerCase())
        );
        
        if (mainInventoryItem) {
            const mainOldStock = mainInventoryItem.currentStock;
            mainInventoryItem.currentStock -= quantity;
            mainInventoryItem.lastRestocked = date;
            
            if (typeof window.InventoryCheckModule.saveData === 'function') {
                window.InventoryCheckModule.saveData();
            }
            
            const inventoryUpdateData = {
                module: 'feed-record',
                itemId: mainInventoryItem.id,
                itemName: mainInventoryItem.name,
                oldStock: mainOldStock,
                newStock: mainInventoryItem.currentStock,
                timestamp: new Date().toISOString()
            };
            
            if (this.broadcaster) this.broadcaster.broadcast('inventory-updated', inventoryUpdateData);
            if (this.dataService) this.dataService.broadcast('inventory-updated', inventoryUpdateData);
            window.dispatchEvent(new CustomEvent('inventory-updated', { detail: inventoryUpdateData }));
        } else {
            if (confirm(`Feed type "${feedType}" not found in main inventory. Would you like to create it?`)) {
                const newItem = {
                    id: Date.now(),
                    name: `${feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed`,
                    category: 'feed',
                    currentStock: 0,
                    unit: 'kg',
                    minStock: 20,
                    costPerKg: 2.5,
                    notes: `Auto-created from feed record`
                };
                window.InventoryCheckModule.inventory.push(newItem);
                if (typeof window.InventoryCheckModule.saveData === 'function') {
                    window.InventoryCheckModule.saveData();
                }
                this.showNotification(`Created "${newItem.name}" in inventory`, 'info');
            }
        }
    },

    checkLowStockAlert(inventoryItem, feedType) {
        if (inventoryItem.currentStock <= inventoryItem.minStock) {
            this.showNotification(`⚠️ Low stock: ${feedType} feed (${inventoryItem.currentStock}kg remaining)`, 'warning');
            
            const alertData = {
                module: 'feed-record',
                itemType: 'feed',
                feedType: feedType,
                currentStock: inventoryItem.currentStock,
                minStock: inventoryItem.minStock,
                suggestedOrder: inventoryItem.minStock * 2,
                timestamp: new Date().toISOString()
            };
            
            if (this.broadcaster) this.broadcaster.broadcast('low-stock-alert', alertData);
            if (this.dataService) this.dataService.broadcast('low-stock-alert', alertData);
            window.dispatchEvent(new CustomEvent('low-stock-alert', { detail: alertData }));
            
            if (window.InventoryCheckModule && typeof window.InventoryCheckModule.showNotification === 'function') {
                window.InventoryCheckModule.showNotification(`⚠️ Low feed: ${feedType} (${inventoryItem.currentStock}kg left)`, 'warning');
            }
        }
    },

    async updateBirdStockInUnifiedService(newStock) {
        if (!this.dataService) return;
        
        const inventory = this.dataService.get('inventory') || [];
        const birdItem = inventory.find(item => 
            item.name?.toLowerCase().includes('bird') || 
            item.name?.toLowerCase().includes('broiler')
        );
        
        if (birdItem) {
            await this.dataService.update('inventory', birdItem.id, { quantity: newStock });
        } else {
            const newBirdItem = {
                id: Date.now(),
                name: 'Broiler Birds',
                category: 'poultry',
                quantity: newStock,
                unit: 'birds',
                minStock: 10,
                cost: 0
            };
            await this.dataService.save('inventory', newBirdItem);
        }
        
        this.birdsStock = newStock;
        localStorage.setItem('farm-birds-stock', newStock.toString());
        this.updateBirdCountDisplay();
    },

    // ==================== QUICK ACTIONS ====================
    showFeedForm() {
        document.getElementById('feed-record-form')?.scrollIntoView({ behavior: 'smooth' });
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

    async addToInventory(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        
        if (inventoryItem) {
            const oldStock = inventoryItem.currentStock;
            inventoryItem.currentStock += quantity;
            
            if (this.dataService) {
                await this.dataService.save('feedInventory', inventoryItem);
            } else {
                this.saveData();
            }
            
            this.renderModule();
            
            const updateData = {
                feedType: feedType,
                quantity: quantity,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock,
                timestamp: new Date().toISOString()
            };
            
            if (this.broadcaster) this.broadcaster.broadcast('inventory-updated', updateData);
            if (this.dataService) this.dataService.broadcast('inventory-updated', updateData);
            
            this.showNotification(`Added ${quantity}kg to ${feedType} inventory!`, 'success');
        } else {
            const newItem = {
                id: Date.now(),
                feedType: feedType,
                currentStock: quantity,
                unit: 'kg',
                costPerKg: 2.5,
                minStock: 20
            };
            
            if (this.dataService) {
                await this.dataService.save('feedInventory', newItem);
            } else {
                this.feedInventory.push(newItem);
                this.saveData();
            }
            
            this.renderModule();
            
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

    showAdjustBirdsForm() {
        const newCount = parseInt(prompt(`Current birds: ${this.birdsStock}\nEnter new bird count:`));
        if (isNaN(newCount) || newCount < 0) {
            this.showNotification('Invalid bird count entered!', 'error');
            return;
        }
        
        this.adjustBirdCount(newCount);
    },

    async adjustBirdCount(newCount) {
        const oldCount = this.birdsStock;
        this.birdsStock = newCount;
        
        if (this.dataService) {
            await this.updateBirdStockInUnifiedService(newCount);
        } else {
            this.saveData();
        }
        
        this.updateBirdCountDisplay();
        
        const updateData = {
            oldCount: oldCount,
            newCount: newCount,
            timestamp: new Date().toISOString()
        };
        
        if (this.broadcaster) this.broadcaster.broadcast('birds-updated', updateData);
        if (this.dataService) this.dataService.broadcast('birds-updated', updateData);
        window.dispatchEvent(new CustomEvent('birds-updated', { detail: updateData }));
        
        this.showNotification(`Adjusted bird count to ${newCount}!`, 'success');
    },

    // ==================== UI RENDER METHODS ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <style>
                .cause-summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
                .cause-item { padding: 20px; background: var(--glass-bg); border-radius: 16px; border: 1px solid var(--glass-border); transition: all 0.3s ease; display: flex; flex-direction: column; }
                .cause-item:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12); border-color: var(--primary-color); }
                .cause-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border); }
                .cause-icon { font-size: 24px; flex-shrink: 0; }
                .cause-title { font-weight: 600; font-size: 16px; color: var(--text-primary); flex-grow: 1; }
                .cause-stats { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; flex-grow: 1; }
                .cause-stat { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
                .cause-stat-label { font-size: 14px; color: var(--text-secondary); }
                .cause-stat-value { font-weight: 600; font-size: 14px; color: var(--text-primary); }
                .cause-stat-percentage { font-weight: 700; font-size: 16px; color: var(--primary-color); }
                .cause-actions { display: flex; gap: 10px; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--glass-border); }
                .delete-cause-records { flex: 1; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 10px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .delete-cause-records:hover { background: #ef4444; color: white; transform: translateY(-2px); }
                .view-cause-details { flex: 1; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #3b82f6; padding: 10px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .view-cause-details:hover { background: #3b82f6; color: white; transform: translateY(-2px); }
                .btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
                .edit-mortality:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .delete-mortality:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .quick-action-btn { background: var(--card-bg); border: 2px solid var(--border-color); border-radius: 16px; padding: 20px 16px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .quick-action-btn:hover { border-color: var(--primary-color); transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); }
                .glass-card.highlighted { animation: pulse-highlight 2s ease; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(59, 130, 246, 0.15) !important; }
                @keyframes pulse-highlight { 0%, 100% { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(59, 130, 246, 0.15); } 50% { box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.4), 0 12px 40px rgba(59, 130, 246, 0.25); } }
                html { scroll-behavior: smooth; }
            </style>
                
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                    <div class="sync-status" id="feed-sync-status" style="font-size: 12px; margin-top: 8px;"></div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card"><div style="font-size: 24px; margin-bottom: 8px;">🌾</div><div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalStock} kg</div><div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div></div>
                    <div class="stat-card"><div style="font-size: 24px; margin-bottom: 8px;">🐔</div><div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="birds-stock-display">${this.birdsStock}</div><div style="font-size: 14px; color: var(--text-secondary);">Birds to Feed</div></div>
                    <div class="stat-card"><div style="font-size: 24px; margin-bottom: 8px;">💰</div><div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalInventoryValue)}</div><div style="font-size: 14px; color: var(--text-secondary);">Inventory Value</div></div>
                </div>

                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-feed-btn"><div style="font-size: 32px;">📝</div><span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Feed</span><span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Log feed usage</span></button>
                    <button class="quick-action-btn" id="add-stock-btn"><div style="font-size: 32px;">📦</div><span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Stock</span><span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add feed to inventory</span></button>
                    <button class="quick-action-btn" id="adjust-birds-btn"><div style="font-size: 32px;">🐔</div><span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Adjust Birds</span><span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Update bird count</span></button>
                </div>

                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">Feed Inventory</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="feed-form-title">Record Feed Usage</h3>
                    <form id="feed-record-form">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div><label class="form-label">Feed Type</label><select class="form-input" id="feed-type" required><option value="">Select feed type</option>${this.feedInventory.map(item => `<option value="${item.feedType}" ${item.currentStock <= item.minStock ? 'disabled' : ''}>${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed ${item.currentStock <= item.minStock ? '(Low Stock)' : ''}</option>`).join('')}</select></div>
                            <div><label class="form-label">Quantity (kg)</label><input type="number" class="form-input" id="feed-quantity" step="0.1" min="0.1" required></div>
                        </div>
                        <div style="margin-bottom: 20px;"><label class="form-label">Notes</label><textarea class="form-input" id="feed-notes" rows="2" placeholder="Feeding details..."></textarea></div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="submit" class="btn-primary" id="feed-submit-btn">Save Record</button>
                            <button type="button" class="btn-outline" id="cancel-feed-form">Cancel</button>
                            <button type="button" class="btn-outline" id="cancel-feed-edit" style="display: none;">Cancel Edit</button>
                        </div>
                    </form>
                </div>
                    
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Feed Records</h3>
                        <button class="btn-outline" id="export-feed-records">Export</button>
                    </div>
                    <div id="feed-records-list">${this.renderFeedRecordsList()}</div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    renderInventoryOverview() {
        return this.feedInventory.map(item => {
            const isLowStock = item.currentStock <= item.minStock;
            const statusColor = isLowStock ? '#ef4444' : '#10b981';
            return `
                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${item.feedType}</span>
                        <span style="font-size: 12px; color: ${statusColor}; font-weight: 600;">${isLowStock ? 'Low Stock' : 'Good'}</span>
                    </div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${item.currentStock} ${item.unit}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Min: ${item.minStock}${item.unit} • ${this.formatCurrency(item.costPerKg)}/kg</div>
                </div>
            `;
        }).join('');
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return `<div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;"><div style="font-size: 48px; margin-bottom: 16px;">🌾</div><div style="font-size: 16px; margin-bottom: 8px;">No feed records yet</div><div style="font-size: 14px; color: var(--text-secondary);">Record your first feed usage</div></div>`;
        }

        return this.feedRecords.slice(0, 5).map(record => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 12px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${record.feedType} Feed</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${record.date} • ${record.quantity}kg • ${record.birdsFed} birds</div>
                    ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${record.notes}</div>` : ''}
                </div>
                <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
                    <div><div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">${this.formatCurrency(record.cost)}</div><div style="font-size: 12px; color: var(--text-secondary);">${(record.cost / record.quantity).toFixed(2)}/kg</div></div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon edit-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Edit Record">✏️</button>
                        <button class="btn-icon delete-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Delete Record">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const totalInventoryValue = this.feedInventory.reduce((sum, item) => sum + (item.currentStock * item.costPerKg), 0);
        return { totalStock, totalInventoryValue };
    },

    calculateCost(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        return quantity * (inventoryItem?.costPerKg || 2.5);
    },

    // ==================== UI HELPERS ====================
    updateBirdCountDisplay() {
        const birdElement = document.getElementById('birds-stock-display');
        if (birdElement) birdElement.textContent = this.birdsStock;
        const statBirdElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (statBirdElement) statBirdElement.textContent = this.birdsStock;
    },

    cancelFeedForm() {
        document.getElementById('feed-record-form').reset();
        document.getElementById('feed-form-title').textContent = 'Record Feed Usage';
        const submitBtn = document.getElementById('feed-submit-btn');
        submitBtn.textContent = 'Save Record';
        delete submitBtn.dataset.editingId;
        document.getElementById('cancel-feed-edit').style.display = 'none';
        this.showNotification('Form cleared', 'info');
    },

    cancelFeedEdit() {
        document.getElementById('feed-record-form').reset();
        document.getElementById('feed-form-title').textContent = 'Record Feed Usage';
        const submitBtn = document.getElementById('feed-submit-btn');
        submitBtn.textContent = 'Save Record';
        delete submitBtn.dataset.editingId;
        document.getElementById('cancel-feed-edit').style.display = 'none';
        this.showNotification('Edit cancelled', 'info');
    },

    editFeedRecord(recordId) {
        console.log('🌾 EDITING FEED RECORD:', recordId);
        
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) {
            this.showNotification('Feed record not found', 'error');
            return;
        }
        
        this.showFeedForm();
        
        setTimeout(() => {
            document.getElementById('feed-type').value = record.feedType;
            document.getElementById('feed-quantity').value = record.quantity;
            document.getElementById('feed-notes').value = record.notes || '';
            document.getElementById('feed-form-title').textContent = 'Edit Feed Record';
            const submitBtn = document.getElementById('feed-submit-btn');
            submitBtn.textContent = 'Update Record';
            submitBtn.dataset.editingId = recordId;
            document.getElementById('cancel-feed-edit').style.display = 'inline-block';
        }, 100);
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
        
        if (this.broadcaster) this.broadcaster.broadcast('feed-exported', { count: this.feedRecords.length, timestamp: new Date().toISOString() });
        this.showNotification('Feed records exported successfully!', 'success');
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        document.getElementById('feed-record-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('feed-submit-btn');
            const isEditMode = submitBtn.textContent === 'Update Record';
            const recordId = submitBtn.dataset.editingId;
            
            const feedType = document.getElementById('feed-type').value;
            const quantity = parseFloat(document.getElementById('feed-quantity').value);
            const notes = document.getElementById('feed-notes').value;
            
            if (isEditMode && recordId) {
                await this.updateFeedRecord(parseInt(recordId), feedType, quantity, notes);
            } else {
                await this.createFeedRecord(feedType, quantity, notes);
            }
        });
        
        document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
        document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showAddStockForm());
        document.getElementById('adjust-birds-btn')?.addEventListener('click', () => this.showAdjustBirdsForm());
        document.getElementById('export-feed-records')?.addEventListener('click', () => this.exportFeedRecords());
        document.getElementById('cancel-feed-form')?.addEventListener('click', () => this.cancelFeedForm());
        document.getElementById('cancel-feed-edit')?.addEventListener('click', () => this.cancelFeedEdit());
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-feed-record')) {
                const id = parseInt(e.target.closest('.edit-feed-record').dataset.id);
                this.editFeedRecord(id);
            } else if (e.target.closest('.delete-feed-record')) {
                const id = parseInt(e.target.closest('.delete-feed-record').dataset.id);
                this.deleteFeedRecord(id);
            }
        });
        
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => e.currentTarget.style.transform = 'translateY(-4px)');
            button.addEventListener('mouseleave', (e) => e.currentTarget.style.transform = 'translateY(0)');
        });
    },

    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('birds-updated', (data) => {
            console.log('📡 Feed module received birds-updated:', data);
            if (data.count !== undefined) {
                this.birdsStock = data.count;
                this.saveData();
                this.updateBirdCountDisplay();
            }
        });
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Feed module received inventory-updated:', data);
        });
        
        window.addEventListener('farm-data-loaded', () => this.syncWithFarmData());
        window.addEventListener('farm-data-updated', () => this.syncWithFarmData());
    },

    // ==================== UTILITY METHODS ====================
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            const notification = document.createElement('div');
            notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'}; color: white; border-radius: 8px; z-index: 10000;`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    },

    onThemeChange(theme) {
        console.log(`Feed Records updating for theme: ${theme}`);
        if (this.initialized) this.renderModule();
    },

    unload() {
        console.log('📦 Unloading Feed module...');
        if (this.broadcaster) this.broadcaster = null;
        const modal = document.getElementById('feed-modal');
        if (modal) modal.classList.add('hidden');
        this.initialized = false;
        this.element = null;
        this.currentEditingId = null;
        console.log('✅ Feed module unloaded');
    }
};

// ==================== REGISTRATION ====================
if (window.FarmModules) {
    window.FarmModules.registerModule('feed-record', FeedRecordModule);
    console.log('✅ Feed Records module registered with UnifiedDataService');
}

window.FeedRecordModule = FeedRecordModule;

(function() {
    console.log(`📦 Registering feed-record module...`);
    if (window.FarmModules) {
        FarmModules.registerModule('feed-record', FeedRecordModule);
        console.log(`✅ feed-record module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
