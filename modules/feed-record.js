// modules/feed-record.js - COMPLETE CSP COMPLIANT VERSION
console.log('🌾 Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 1000,
    element: null,
    eventListeners: [],
    editingRecordId: null,

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('🌾 Initializing Feed Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Register with StyleManager if available
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        this.syncStatsWithSharedData();
        
        console.log('✅ Feed Records initialized');
        return true;
    },

    onThemeChange(theme) {
        console.log(`🎨 Feed Records updating for theme: ${theme}`);
        if (this.element) {
            this.element.setAttribute('data-theme', theme);
        }
    },

    // ==================== EVENT HANDLER MANAGEMENT ====================
    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler });
    },

    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    },

    // ==================== DATA MANAGEMENT ====================
    loadData() {
        try {
            const savedRecords = localStorage.getItem('farm-feed-records');
            const savedInventory = localStorage.getItem('farm-feed-inventory');
            const savedBirds = localStorage.getItem('farm-birds-stock');
            
            this.feedRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoRecords();
            this.feedInventory = savedInventory ? JSON.parse(savedInventory) : this.getDemoInventory();
            this.birdsStock = savedBirds ? parseInt(savedBirds) : 1000;
        } catch (error) {
            console.error('❌ Error loading feed data:', error);
            this.feedRecords = this.getDemoRecords();
            this.feedInventory = this.getDemoInventory();
            this.birdsStock = 1000;
        }
    },

    getDemoRecords() {
        return [
            { 
                id: 1, 
                date: new Date().toISOString().split('T')[0], 
                feedType: 'starter', 
                quantity: 50, 
                birdsFed: 500, 
                cost: 125, 
                notes: 'Morning feeding',
                timestamp: new Date().toISOString()
            },
            { 
                id: 2, 
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
                feedType: 'grower', 
                quantity: 45, 
                birdsFed: 480, 
                cost: 112.5, 
                notes: 'Regular feeding',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            { 
                id: 3, 
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0], 
                feedType: 'finisher', 
                quantity: 40, 
                birdsFed: 450, 
                cost: 100, 
                notes: 'Evening feeding',
                timestamp: new Date(Date.now() - 172800000).toISOString()
            }
        ];
    },

    getDemoInventory() {
        return [
            { 
                id: 1, 
                feedType: 'starter', 
                currentStock: 150, 
                unit: 'kg', 
                costPerKg: 2.5, 
                minStock: 50,
                lastUpdated: new Date().toISOString()
            },
            { 
                id: 2, 
                feedType: 'grower', 
                currentStock: 120, 
                unit: 'kg', 
                costPerKg: 2.3, 
                minStock: 40,
                lastUpdated: new Date().toISOString()
            },
            { 
                id: 3, 
                feedType: 'finisher', 
                currentStock: 100, 
                unit: 'kg', 
                costPerKg: 2.2, 
                minStock: 30,
                lastUpdated: new Date().toISOString()
            },
            { 
                id: 4, 
                feedType: 'layer', 
                currentStock: 80, 
                unit: 'kg', 
                costPerKg: 2.4, 
                minStock: 20,
                lastUpdated: new Date().toISOString()
            }
        ];
    },

    saveData() {
        try {
            localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
            localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
            localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
        } catch (error) {
            console.error('❌ Error saving feed data:', error);
        }
    },

    // ==================== MODULE RENDERING ====================
    renderModule() {
        if (!this.element || !this.initialized) return;

        const stats = this.calculateStats();
        const isEditMode = this.editingRecordId !== null;

        this.element.innerHTML = `
            <div class="feed-record-container">
                <!-- Header -->
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="quick-action-btn" data-action="record-feed">
                            <div class="action-icon">📝</div>
                            <span class="action-title">Record Feed</span>
                            <span class="action-desc">Log feed usage</span>
                        </button>
                        <button class="quick-action-btn" data-action="add-stock">
                            <div class="action-icon">📦</div>
                            <span class="action-title">Add Stock</span>
                            <span class="action-desc">Add feed to inventory</span>
                        </button>
                        <button class="quick-action-btn" data-action="adjust-birds">
                            <div class="action-icon">🐔</div>
                            <span class="action-title">Adjust Birds</span>
                            <span class="action-desc">Update bird count</span>
                        </button>
                        <button class="quick-action-btn" data-action="export-records">
                            <div class="action-icon">📤</div>
                            <span class="action-title">Export Data</span>
                            <span class="action-desc">Export feed records</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-overview">
                    <h2>Overview</h2>
                    <div class="stats-grid">
                        <div class="stat-card" id="total-stock-card">
                            <div class="stat-icon">🌾</div>
                            <div class="stat-value" id="total-stock">${stats.totalStock} kg</div>
                            <div class="stat-label">Current Stock</div>
                        </div>
                        <div class="stat-card" id="birds-count-card">
                            <div class="stat-icon">🐔</div>
                            <div class="stat-value" id="birds-count">${this.birdsStock}</div>
                            <div class="stat-label">Birds to Feed</div>
                        </div>
                        <div class="stat-card" id="inventory-value-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value" id="inventory-value">${this.formatCurrency(stats.totalInventoryValue)}</div>
                            <div class="stat-label">Inventory Value</div>
                        </div>
                        <div class="stat-card" id="low-stock-count-card">
                            <div class="stat-icon">⚠️</div>
                            <div class="stat-value" id="low-stock-count">${stats.lowStockItems}</div>
                            <div class="stat-label">Low Stock Items</div>
                        </div>
                    </div>
                </div>

                <!-- Feed Inventory -->
                <div class="inventory-section">
                    <div class="section-header">
                        <h2>Feed Inventory</h2>
                        <button class="btn-outline" data-action="refresh-inventory">🔄 Refresh</button>
                    </div>
                    <div class="inventory-grid">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <!-- Feed Record Form -->
                <div class="form-section">
                    <div class="section-header">
                        <h2 id="feed-form-title">${isEditMode ? 'Edit Feed Record' : 'Record Feed Usage'}</h2>
                        ${isEditMode ? `
                            <button class="btn-outline" data-action="cancel-edit">Cancel Edit</button>
                        ` : ''}
                    </div>
                    <form id="feed-record-form" class="feed-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="feed-type">Feed Type</label>
                                <select class="form-select" id="feed-type" data-field="feedType" required>
                                    <option value="">Select feed type</option>
                                    ${this.feedInventory.map(item => `
                                        <option value="${item.feedType}" 
                                                data-stock="${item.currentStock}"
                                                data-min-stock="${item.minStock}"
                                                ${item.currentStock <= item.minStock ? 'class="low-stock"' : ''}>
                                            ${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed 
                                            (${item.currentStock}kg available)
                                        </option>
                                    `).join('')}
                                </select>
                                <div class="form-hint" id="stock-info"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="feed-quantity">Quantity (kg)</label>
                                <input type="number" class="form-input" id="feed-quantity" 
                                       data-field="quantity" step="0.1" min="0.1" required>
                                <div class="form-hint">Enter amount used</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="feed-notes">Notes</label>
                            <textarea class="form-textarea" id="feed-notes" 
                                      data-field="notes" rows="2" placeholder="Feeding details..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary" id="feed-submit-btn" 
                                    data-action="${isEditMode ? 'update-record' : 'save-record'}">
                                ${isEditMode ? 'Update Record' : 'Save Record'}
                            </button>
                            ${isEditMode ? `
                                <button type="button" class="btn-outline" data-action="cancel-edit">Cancel</button>
                            ` : ''}
                        </div>
                    </form>
                </div>

                <!-- Recent Feed Records -->
                <div class="records-section">
                    <div class="section-header">
                        <h2>Recent Feed Records</h2>
                        <div class="section-actions">
                            <button class="btn-outline" data-action="export-records">Export</button>
                            <button class="btn-outline" data-action="clear-records">Clear All</button>
                        </div>
                    </div>
                    <div class="records-list" id="feed-records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        
        // If in edit mode, populate form
        if (isEditMode) {
            this.populateEditForm();
        }
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const totalInventoryValue = this.feedInventory.reduce((sum, item) => 
            sum + (item.currentStock * item.costPerKg), 0);
        const lowStockItems = this.feedInventory.filter(item => 
            item.currentStock <= item.minStock).length;
        
        return { totalStock, totalInventoryValue, lowStockItems };
    },

    renderInventoryOverview() {
        if (this.feedInventory.length === 0) {
            return `
                <div class="empty-inventory">
                    <div class="empty-icon">📦</div>
                    <div class="empty-title">No feed inventory</div>
                    <div class="empty-desc">Add feed stock to get started</div>
                </div>
            `;
        }

        return this.feedInventory.map(item => {
            const isLowStock = item.currentStock <= item.minStock;
            const statusClass = isLowStock ? 'low-stock' : 'good-stock';
            const statusText = isLowStock ? 'Low Stock' : 'Good';
            const statusColor = isLowStock ? 'var(--error-color, #ef4444)' : 'var(--success-color, #10b981)';
            
            return `
                <div class="inventory-card ${statusClass}" 
                     data-inventory-id="${item.id}"
                     data-action="inventory-details">
                    <div class="inventory-header">
                        <div class="inventory-type">${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed</div>
                        <div class="inventory-status" style="color: ${statusColor}">
                            ${statusText}
                        </div>
                    </div>
                    <div class="inventory-stock">
                        <span class="stock-amount">${item.currentStock}</span>
                        <span class="stock-unit">${item.unit}</span>
                    </div>
                    <div class="inventory-details">
                        <div class="detail-item">
                            <span class="detail-label">Min Stock:</span>
                            <span class="detail-value">${item.minStock}${item.unit}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cost:</span>
                            <span class="detail-value">${this.formatCurrency(item.costPerKg)}/kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Value:</span>
                            <span class="detail-value">${this.formatCurrency(item.currentStock * item.costPerKg)}</span>
                        </div>
                    </div>
                    <div class="inventory-actions">
                        <button class="btn-icon" data-action="add-to-inventory" data-feed-type="${item.feedType}" title="Add Stock">
                            ➕
                        </button>
                        <button class="btn-icon" data-action="edit-inventory" data-inventory-id="${item.id}" title="Edit">
                            ✏️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return `
                <div class="empty-records">
                    <div class="empty-icon">🌾</div>
                    <div class="empty-title">No feed records yet</div>
                    <div class="empty-desc">Record your first feed usage</div>
                </div>
            `;
        }

        return this.feedRecords.slice(0, 10).map(record => `
            <div class="record-card" data-record-id="${record.id}">
                <div class="record-header">
                    <div class="record-type">
                        <span class="record-icon">🌾</span>
                        <span class="record-feed-type">${record.feedType.charAt(0).toUpperCase() + record.feedType.slice(1)} Feed</span>
                    </div>
                    <div class="record-date">${this.formatDate(record.date)}</div>
                </div>
                <div class="record-details">
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">${record.quantity} kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Birds Fed:</span>
                            <span class="detail-value">${record.birdsFed}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cost:</span>
                            <span class="detail-value">${this.formatCurrency(record.cost)}</span>
                        </div>
                    </div>
                    ${record.notes ? `
                        <div class="record-notes">
                            <span class="notes-label">Notes:</span>
                            <span class="notes-text">${record.notes}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="record-actions">
                    <button class="btn-icon" data-action="edit-record" data-record-id="${record.id}" title="Edit Record">
                        ✏️
                    </button>
                    <button class="btn-icon" data-action="delete-record" data-record-id="${record.id}" title="Delete Record">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ==================== EVENT HANDLERS ====================
   // ==================== EVENT HANDLERS ====================
setupEventListeners() {
    this.removeAllEventListeners();
    
    if (!this.element) return;

    // Main event delegation
    this.addEventListener(this.element, 'click', this.handleElementClick.bind(this));
    this.addEventListener(this.element, 'change', this.handleElementChange.bind(this));
    this.addEventListener(this.element, 'submit', this.handleFormSubmit.bind(this));

    // Form-specific listeners
    const feedTypeSelect = this.element.querySelector('#feed-type');
    const feedQuantityInput = this.element.querySelector('#feed-quantity');
    
    if (feedTypeSelect) {
        this.addEventListener(feedTypeSelect, 'change', this.updateStockInfo.bind(this));
    }
    
    if (feedQuantityInput) {
        this.addEventListener(feedQuantityInput, 'input', this.validateQuantity.bind(this));
    }
},

handleElementClick(event) {
    const target = event.target;
    const button = target.closest('[data-action]');
    
    if (!button) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const action = button.getAttribute('data-action');
    const recordId = button.getAttribute('data-record-id');
    const inventoryId = button.getAttribute('data-inventory-id');
    const feedType = button.getAttribute('data-feed-type');
    
    console.log('🌾 Feed action:', action);
    
    switch(action) {
        case 'record-feed':  // ADD THIS CASE
            this.showFeedForm();
            break;
            
        case 'add-stock':
            this.showAddStockDialog();
            break;
            
        case 'adjust-birds':
            this.showAdjustBirdsDialog();
            break;
            
        case 'export-records':
            this.exportFeedRecords();
            break;
            
        case 'clear-records':
            this.clearAllRecords();
            break;
            
        case 'refresh-inventory':
            this.refreshInventory();
            break;
            
        case 'save-record':
        case 'update-record':
            // Handled by form submission
            break;
            
        case 'cancel-edit':
            this.cancelEdit();
            break;
            
        case 'edit-record':
            if (recordId) this.editFeedRecord(parseInt(recordId));
            break;
            
        case 'delete-record':
            if (recordId) this.deleteFeedRecord(parseInt(recordId));
            break;
            
        case 'add-to-inventory':
            if (feedType) this.showAddToInventoryDialog(feedType);
            break;
            
        case 'edit-inventory':
            if (inventoryId) this.editInventoryItem(parseInt(inventoryId));
            break;
            
        case 'inventory-details':
            // Show inventory details modal
            const card = target.closest('.inventory-card');
            if (card) {
                const inventoryId = card.getAttribute('data-inventory-id');
                this.showInventoryDetails(parseInt(inventoryId));
            }
            break;
            
        default:
            console.log('⚠️ Unhandled action:', action);
    }
},
    
    handleElementChange(event) {
        const target = event.target;
        
        if (target.id === 'feed-type') {
            this.updateStockInfo();
        } else if (target.id === 'feed-quantity') {
            this.validateQuantity();
        }
    },

    handleFormSubmit(event) {
        if (event.target.id === 'feed-record-form') {
            event.preventDefault();
            this.handleFeedRecordSubmit();
        }
    },

    // ==================== FORM HANDLING ====================
    handleFeedRecordSubmit() {
        const feedType = document.getElementById('feed-type').value;
        const quantity = parseFloat(document.getElementById('feed-quantity').value);
        const notes = document.getElementById('feed-notes').value;
        
        if (!feedType || isNaN(quantity) || quantity <= 0) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        // Check stock availability
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected', 'error');
            return;
        }

        if (this.editingRecordId !== null) {
            this.updateFeedRecord(this.editingRecordId, feedType, quantity, notes);
        } else {
            this.createFeedRecord(feedType, quantity, notes);
        }
    },

    createFeedRecord(feedType, quantity, notes) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected', 'error');
            return;
        }

        if (inventoryItem.currentStock < quantity) {
            this.showNotification(
                `Insufficient stock! Only ${inventoryItem.currentStock}kg available.`,
                'error'
            );
            return;
        }

        const newRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            feedType: feedType,
            quantity: quantity,
            birdsFed: this.birdsStock,
            cost: this.calculateCost(feedType, quantity),
            notes: notes,
            timestamp: new Date().toISOString()
        };

        // Update inventory
        const oldStock = inventoryItem.currentStock;
        inventoryItem.currentStock -= quantity;
        inventoryItem.lastUpdated = new Date().toISOString();

        // Add record
        this.feedRecords.unshift(newRecord);
        this.saveData();
        
        // Update UI
        this.renderModule();
        this.syncStatsWithSharedData();
        
        // Show success message
        this.showNotification(
            `Recorded ${quantity}kg of ${feedType} feed usage!`,
            'success'
        );

        // Broadcast event
        this.broadcastDataChange('feed-record', {
            type: 'feed_record_created',
            record: newRecord,
            inventoryUpdate: {
                feedType: feedType,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock,
                change: -quantity
            }
        });

        // Reset form
        this.resetForm();
    },

    editFeedRecord(recordId) {
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) {
            this.showNotification('Record not found', 'error');
            return;
        }

        this.editingRecordId = recordId;
        this.renderModule();
    },

    populateEditForm() {
        if (!this.editingRecordId) return;

        const record = this.feedRecords.find(r => r.id === this.editingRecordId);
        if (!record) return;

        // Wait for DOM to update
        setTimeout(() => {
            document.getElementById('feed-type').value = record.feedType;
            document.getElementById('feed-quantity').value = record.quantity;
            document.getElementById('feed-notes').value = record.notes || '';
            
            this.updateStockInfo();
        }, 100);
    },

    updateFeedRecord(recordId, feedType, quantity, notes) {
        const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
        if (recordIndex === -1) {
            this.showNotification('Record not found', 'error');
            return;
        }

        const oldRecord = this.feedRecords[recordIndex];
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected', 'error');
            return;
        }

        // Calculate stock adjustment
        const stockAdjustment = oldRecord.quantity - quantity;
        const newStock = inventoryItem.currentStock + stockAdjustment;

        if (newStock < 0) {
            this.showNotification(
                `Cannot adjust stock below zero! Current: ${inventoryItem.currentStock}kg`,
                'error'
            );
            return;
        }

        // Update inventory
        const oldStock = inventoryItem.currentStock;
        inventoryItem.currentStock = newStock;
        inventoryItem.lastUpdated = new Date().toISOString();

        // Update record
        const updatedRecord = {
            ...oldRecord,
            feedType: feedType,
            quantity: quantity,
            cost: this.calculateCost(feedType, quantity),
            notes: notes,
            updatedAt: new Date().toISOString()
        };

        this.feedRecords[recordIndex] = updatedRecord;
        this.saveData();
        
        // Update UI
        this.editingRecordId = null;
        this.renderModule();
        this.syncStatsWithSharedData();
        
        // Show success message
        this.showNotification('Feed record updated!', 'success');

        // Broadcast event
        this.broadcastDataChange('feed-record', {
            type: 'feed_record_updated',
            oldRecord: oldRecord,
            newRecord: updatedRecord,
            inventoryUpdate: {
                feedType: feedType,
                oldStock: oldStock,
                newStock: newStock,
                change: stockAdjustment
            }
        });
    },

    deleteFeedRecord(recordId) {
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) return;

        if (!confirm(`Delete feed record for ${record.quantity}kg of ${record.feedType} feed?`)) {
            return;
        }

        // Return stock to inventory
        const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
        if (inventoryItem) {
            inventoryItem.currentStock += record.quantity;
            inventoryItem.lastUpdated = new Date().toISOString();
        }

        // Remove record
        this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
        this.saveData();
        
        // Update UI
        this.renderModule();
        this.syncStatsWithSharedData();
        
        // Show success message
        this.showNotification('Feed record deleted!', 'success');

        // Broadcast event
        this.broadcastDataChange('feed-record', {
            type: 'feed_record_deleted',
            record: record,
            inventoryUpdate: inventoryItem ? {
                feedType: record.feedType,
                stockReturned: record.quantity,
                newStock: inventoryItem.currentStock
            } : null
        });
    },

    cancelEdit() {
        this.editingRecordId = null;
        this.resetForm();
        this.renderModule();
    },

    resetForm() {
        const form = document.getElementById('feed-record-form');
        if (form) {
            form.reset();
            this.updateStockInfo();
        }
    },

    // ==================== INVENTORY MANAGEMENT ====================
    showAddToInventoryDialog(feedType) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) return;

        const quantity = parseFloat(prompt(
            `Add stock to ${feedType} feed\nCurrent stock: ${inventoryItem.currentStock}kg\nMinimum stock: ${inventoryItem.minStock}kg\n\nEnter quantity to add (kg):`,
            '0'
        ));

        if (isNaN(quantity) || quantity <= 0) {
            this.showNotification('Invalid quantity entered', 'error');
            return;
        }

        this.addToInventory(feedType, quantity);
    },

    showAddStockDialog() {
        const feedType = prompt(
            'Enter feed type (starter/grower/finisher/layer):\nOr enter a new feed type:'
        );
        
        if (!feedType || feedType.trim() === '') {
            this.showNotification('Feed type is required', 'error');
            return;
        }

        const normalizedFeedType = feedType.toLowerCase().trim();
        const existingItem = this.feedInventory.find(item => 
            item.feedType.toLowerCase() === normalizedFeedType);

        let quantity = 0;
        if (existingItem) {
            quantity = parseFloat(prompt(
                `Add stock to ${normalizedFeedType} feed\nCurrent stock: ${existingItem.currentStock}kg\n\nEnter quantity to add (kg):`,
                '0'
            ));
        } else {
            quantity = parseFloat(prompt(
                `Create new ${normalizedFeedType} feed inventory\n\nEnter initial stock quantity (kg):`,
                '100'
            ));
        }

        if (isNaN(quantity) || quantity <= 0) {
            this.showNotification('Invalid quantity entered', 'error');
            return;
        }

        this.addToInventory(normalizedFeedType, quantity);
    },

    addToInventory(feedType, quantity) {
        let inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        
        if (inventoryItem) {
            // Update existing item
            const oldStock = inventoryItem.currentStock;
            inventoryItem.currentStock += quantity;
            inventoryItem.lastUpdated = new Date().toISOString();
            
            this.saveData();
            this.renderModule();
            this.syncStatsWithSharedData();
            
            this.showNotification(
                `Added ${quantity}kg to ${feedType} inventory!`,
                'success'
            );

            this.broadcastDataChange('feed-record', {
                type: 'inventory_stock_added',
                feedType: feedType,
                quantityAdded: quantity,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock
            });
        } else {
            // Create new inventory item
            const newItem = {
                id: Date.now(),
                feedType: feedType,
                currentStock: quantity,
                unit: 'kg',
                costPerKg: 2.5,
                minStock: 20,
                lastUpdated: new Date().toISOString()
            };
            
            this.feedInventory.push(newItem);
            this.saveData();
            this.renderModule();
            this.syncStatsWithSharedData();
            
            this.showNotification(
                `Created new ${feedType} inventory with ${quantity}kg!`,
                'success'
            );

            this.broadcastDataChange('feed-record', {
                type: 'inventory_item_created',
                item: newItem
            });
        }
    },

    editInventoryItem(inventoryId) {
        const item = this.feedInventory.find(i => i.id === inventoryId);
        if (!item) return;

        const newCost = parseFloat(prompt(
            `Edit ${item.feedType} feed\nCurrent cost: $${item.costPerKg}/kg\n\nEnter new cost per kg:`,
            item.costPerKg.toString()
        ));

        if (isNaN(newCost) || newCost <= 0) {
            this.showNotification('Invalid cost entered', 'error');
            return;
        }

        const newMinStock = parseInt(prompt(
            `Edit ${item.feedType} feed\nCurrent min stock: ${item.minStock}kg\n\nEnter new minimum stock:`,
            item.minStock.toString()
        ));

        if (isNaN(newMinStock) || newMinStock < 0) {
            this.showNotification('Invalid minimum stock entered', 'error');
            return;
        }

        const oldItem = { ...item };
        item.costPerKg = newCost;
        item.minStock = newMinStock;
        item.lastUpdated = new Date().toISOString();
        
        this.saveData();
        this.renderModule();
        
        this.showNotification(
            `${item.feedType} feed settings updated!`,
            'success'
        );

        this.broadcastDataChange('feed-record', {
            type: 'inventory_item_updated',
            oldItem: oldItem,
            newItem: item
        });
    },

    showInventoryDetails(inventoryId) {
        const item = this.feedInventory.find(i => i.id === inventoryId);
        if (!item) return;

        const details = `
Feed Type: ${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)}
Current Stock: ${item.currentStock}${item.unit}
Minimum Stock: ${item.minStock}${item.unit}
Cost per kg: ${this.formatCurrency(item.costPerKg)}
Total Value: ${this.formatCurrency(item.currentStock * item.costPerKg)}
Last Updated: ${this.formatDateTime(item.lastUpdated)}
        `.trim();

        alert(details);
    },

    refreshInventory() {
        this.renderModule();
        this.showNotification('Inventory refreshed!', 'info');
    },

    // ==================== BIRD COUNT MANAGEMENT ====================
    showAdjustBirdsDialog() {
        const newCount = parseInt(prompt(
            `Adjust Bird Count\nCurrent birds: ${this.birdsStock}\n\nEnter new bird count:`,
            this.birdsStock.toString()
        ));

        if (isNaN(newCount) || newCount < 0) {
            this.showNotification('Invalid bird count entered', 'error');
            return;
        }

        this.adjustBirdCount(newCount);
    },

    adjustBirdCount(newCount) {
        const oldCount = this.birdsStock;
        this.birdsStock = newCount;
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        
        this.showNotification(
            `Bird count adjusted from ${oldCount} to ${newCount}!`,
            'success'
        );

        this.broadcastDataChange('feed-record', {
            type: 'bird_count_adjusted',
            oldCount: oldCount,
            newCount: newCount
        });
    },

    // ==================== EXPORT & CLEAR ====================
    exportFeedRecords() {
        const dataStr = JSON.stringify({
            feedRecords: this.feedRecords,
            feedInventory: this.feedInventory,
            birdsStock: this.birdsStock,
            exportDate: new Date().toISOString()
        }, null, 2);
        
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feed-records-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Feed records exported successfully!', 'success');

        this.broadcastDataChange('feed-record', {
            type: 'records_exported',
            count: this.feedRecords.length,
            inventoryCount: this.feedInventory.length
        });
    },

    clearAllRecords() {
        if (!confirm('Are you sure you want to clear all feed records? This action cannot be undone.')) {
            return;
        }

        const oldCount = this.feedRecords.length;
        this.feedRecords = [];
        this.saveData();
        this.renderModule();
        
        this.showNotification(
            `Cleared ${oldCount} feed records!`,
            'success'
        );

        this.broadcastDataChange('feed-record', {
            type: 'records_cleared',
            count: oldCount
        });
    },

    // ==================== FORM VALIDATION ====================
    updateStockInfo() {
        const feedTypeSelect = document.getElementById('feed-type');
        const stockInfo = document.getElementById('stock-info');
        
        if (!feedTypeSelect || !stockInfo) return;
        
        const selectedOption = feedTypeSelect.options[feedTypeSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            stockInfo.textContent = '';
            return;
        }

        const currentStock = parseFloat(selectedOption.getAttribute('data-stock') || 0);
        const minStock = parseFloat(selectedOption.getAttribute('data-min-stock') || 0);
        
        if (currentStock <= minStock) {
            stockInfo.textContent = `⚠️ Low stock! Only ${currentStock}kg available (min: ${minStock}kg)`;
            stockInfo.style.color = 'var(--error-color, #ef4444)';
        } else {
            stockInfo.textContent = `✅ ${currentStock}kg available`;
            stockInfo.style.color = 'var(--success-color, #10b981)';
        }
    },

    validateQuantity() {
        const quantityInput = document.getElementById('feed-quantity');
        const feedTypeSelect = document.getElementById('feed-type');
        
        if (!quantityInput || !feedTypeSelect) return;
        
        const quantity = parseFloat(quantityInput.value);
        const selectedOption = feedTypeSelect.options[feedTypeSelect.selectedIndex];
        const currentStock = selectedOption ? parseFloat(selectedOption.getAttribute('data-stock') || 0) : 0;
        
        if (isNaN(quantity) || quantity <= 0) {
            quantityInput.style.borderColor = 'var(--error-color, #ef4444)';
        } else if (quantity > currentStock) {
            quantityInput.style.borderColor = 'var(--warning-color, #f59e0b)';
        } else {
            quantityInput.style.borderColor = 'var(--success-color, #10b981)';
        }
    },

    // ==================== UTILITY METHODS ====================
showFeedForm() {
    try {
        const formSection = this.element.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Highlight the form briefly
            formSection.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            setTimeout(() => {
                formSection.style.boxShadow = 'none';
            }, 1000);
            
            // Focus on the first input field
            setTimeout(() => {
                const feedTypeSelect = document.getElementById('feed-type');
                if (feedTypeSelect) {
                    feedTypeSelect.focus();
                }
            }, 300);
        } else {
            console.error('❌ Form section not found');
            this.showNotification('Form section not found', 'error');
        }
    } catch (error) {
        console.error('❌ Error showing feed form:', error);
        this.showNotification('Error showing feed form', 'error');
    }
},

    calculateCost(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        const costPerKg = inventoryItem?.costPerKg || 2.5;
        return parseFloat((quantity * costPerKg).toFixed(2));
    },

    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.birdsStock;
            window.FarmModules.appData.profile.dashboardStats.totalFeedStock = stats.totalStock;
            window.FarmModules.appData.profile.dashboardStats.inventoryValue = stats.totalInventoryValue;
            window.FarmModules.appData.profile.dashboardStats.lowStockItems = stats.lowStockItems;
        }
    },

    broadcastDataChange(moduleName, data) {
        const event = new CustomEvent('farmDataChanged', {
            detail: { 
                module: moduleName,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
            return;
        }
        
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create and show a simple notification
        const notification = document.createElement('div');
        notification.className = `feed-notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    cleanup() {
        console.log('🧹 Cleaning up feed-record module...');
        
        // Remove event listeners
        this.removeAllEventListeners();
        
        // Reset state
        this.initialized = false;
        this.element = null;
        this.editingRecordId = null;
        
        console.log('✅ Feed-record module cleaned up');
    },

    // ==================== DEBUG HELPERS ====================
    debugCheckButtons() {
        console.log('🔍 Debug: Checking buttons...');
        
        // Check if quick action buttons exist
        const buttons = this.element?.querySelectorAll('[data-action]') || [];
        console.log(`Found ${buttons.length} action buttons:`);
        
        buttons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            const text = btn.textContent.trim();
            console.log(`  - ${action}: "${text.substring(0, 30)}..."`);
        });
        
        // Specifically check for record-feed button
        const recordFeedBtn = this.element?.querySelector('[data-action="record-feed"]');
        if (recordFeedBtn) {
            console.log('✅ Record Feed button found:', recordFeedBtn);
        } else {
            console.error('❌ Record Feed button NOT found!');
            
            // Try to find it by other means
            const possibleButtons = this.element?.querySelectorAll('button') || [];
            console.log('All buttons found:');
            possibleButtons.forEach(btn => {
                if (btn.textContent.includes('Record Feed') || 
                    btn.textContent.includes('📝')) {
                    console.log('  - Possible match:', btn);
                }
            });
        }
    }
};  // <-- This is the END of FeedRecordModule

// ==================== STYLES ====================
const feedRecordStyles = `
    .feed-record-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .module-header {
        margin-bottom: 30px;
    }

    .module-title {
        color: var(--text-primary, #1a1a1a);
        font-size: 28px;
        margin-bottom: 8px;
    }

    .module-subtitle {
        color: var(--text-secondary, #666);
        font-size: 16px;
    }

    .quick-actions {
        margin-bottom: 40px;
    }

    .quick-actions h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
    }

    .quick-action-btn {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        padding: 24px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        min-height: 120px;
        border: none;
        outline: none;
        width: 100%;
    }

    .quick-action-btn:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
        font-size: 32px;
    }

    .action-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
    }

    .action-desc {
        font-size: 12px;
        color: var(--text-secondary, #666);
        text-align: center;
    }

    .stats-overview {
        margin-bottom: 40px;
    }

    .stats-overview h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }

    .stat-card {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
        font-size: 24px;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 14px;
        color: var(--text-secondary, #666);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .section-header h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin: 0;
    }

    .section-actions {
        display: flex;
        gap: 8px;
    }

    .inventory-section,
    .form-section,
    .records-section {
        margin-bottom: 40px;
    }

    .inventory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .inventory-card {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .inventory-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    }

    .inventory-card.low-stock {
        border-left: 4px solid var(--error-color, #ef4444);
    }

    .inventory-card.good-stock {
        border-left: 4px solid var(--success-color, #10b981);
    }

    .inventory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .inventory-type {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        text-transform: capitalize;
    }

    .inventory-status {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.1);
    }

    .inventory-card.good-stock .inventory-status {
        background: rgba(16, 185, 129, 0.1);
    }

    .inventory-stock {
        font-size: 32px;
        font-weight: bold;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 12px;
    }

    .stock-amount {
        font-size: 32px;
    }

    .stock-unit {
        font-size: 16px;
        color: var(--text-secondary, #666);
        margin-left: 4px;
    }

    .inventory-details {
        margin-bottom: 16px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 13px;
    }

    .detail-label {
        color: var(--text-secondary, #666);
    }

    .detail-value {
        color: var(--text-primary, #1a1a1a);
        font-weight: 500;
    }

    .inventory-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .btn-icon {
        background: none;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        font-size: 16px;
        color: var(--text-secondary, #666);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
    }

    .btn-icon:hover {
        background: var(--hover-bg, rgba(0, 0, 0, 0.05));
        transform: scale(1.1);
    }

    .empty-inventory,
    .empty-records {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--text-secondary, #666);
        padding: 40px 20px;
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 2px dashed var(--border-color, #e0e0e0);
        border-radius: 16px;
    }

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .empty-title {
        font-size: 16px;
        margin-bottom: 8px;
        color: var(--text-primary, #1a1a1a);
    }

    .empty-desc {
        font-size: 14px;
    }

    .feed-form {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 16px;
        padding: 24px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
    }

    .form-select,
    .form-input,
    .form-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--input-bg, rgba(255, 255, 255, 0.9));
        color: var(--text-primary, #1a1a1a);
        transition: border-color 0.2s ease;
    }

    .form-select:focus,
    .form-input:focus,
    .form-textarea:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-hint {
        font-size: 12px;
        color: var(--text-secondary, #666);
        margin-top: 4px;
    }

    option.low-stock {
        color: var(--error-color, #ef4444);
    }

    .form-actions {
        display: flex;
        gap: 12px;
    }

    .btn-primary {
        background: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-primary:hover {
        background: var(--primary-dark, #2563eb);
        transform: translateY(-1px);
    }

    .btn-outline {
        background: transparent;
        color: var(--text-primary, #1a1a1a);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .btn-outline:hover {
        background: var(--hover-bg, rgba(0, 0, 0, 0.05));
        border-color: var(--primary-color, #3b82f6);
    }

    .records-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .record-card {
        background: var(--card-bg, rgba(255, 255, 255, 0.9));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
    }

    .record-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        border-color: var(--primary-color, #3b82f6);
    }

    .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .record-type {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .record-icon {
        font-size: 20px;
    }

    .record-feed-type {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        text-transform: capitalize;
    }

    .record-date {
        font-size: 14px;
        color: var(--text-secondary, #666);
    }

    .record-details {
        margin-bottom: 16px;
    }

    .detail-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 12px;
    }

    .record-notes {
        padding: 12px;
        background: var(--glass-bg, rgba(255, 255, 255, 0.8));
        border-radius: 8px;
        font-size: 13px;
    }

    .notes-label {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        margin-right: 8px;
    }

    .notes-text {
        color: var(--text-secondary, #666);
    }

    .record-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    /* Animations */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .record-card {
        animation: fadeIn 0.3s ease;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .actions-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        .stats-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        .inventory-grid {
            grid-template-columns: 1fr;
        }
        
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
        
        .section-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
`;

// ==================== REGISTRATION ====================
window.FeedRecordModule = FeedRecordModule;

(function() {
    console.log('📦 Registering feed-record module...');
    
    // Add styles to document
    if (!document.querySelector('#feed-record-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'feed-record-styles';
        styleElement.textContent = feedRecordStyles;
        document.head.appendChild(styleElement);
    }
    
    // Register module
    if (window.FarmModules) {
        const moduleName = FeedRecordModule.name || 'feed-record';
        FarmModules.registerModule(moduleName, FeedRecordModule);
        console.log(`✅ ${moduleName} module registered successfully!`);
    } else {
        console.log('📦 Feed-record module loaded (standalone mode)');
    }
})();
