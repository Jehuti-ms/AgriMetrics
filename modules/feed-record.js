// modules/feed-record.js - COMPLETE REWRITE WITH ALL FUNCTIONALITY
console.log('🌾 Loading feed-record module...');

// Data Broadcaster integration
const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {}
};

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 1000,
    element: null,
    eventListeners: [],
    isEditing: false,
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
        console.log(`Feed Records updating for theme: ${theme}`);
        this.applyThemeStyles(theme);
    },

    cleanup() {
        this.removeAllEventListeners();
        this.initialized = false;
        this.element = null;
        this.isEditing = false;
        this.editingRecordId = null;
        console.log('🧹 Feed-record module cleaned up');
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
                date: '2024-03-15', 
                feedType: 'starter', 
                quantity: 50, 
                birdsFed: 500, 
                cost: 125, 
                notes: 'Morning feeding' 
            },
            { 
                id: 2, 
                date: '2024-03-14', 
                feedType: 'grower', 
                quantity: 45, 
                birdsFed: 480, 
                cost: 112.5, 
                notes: 'Regular feeding' 
            },
            { 
                id: 3, 
                date: '2024-03-13', 
                feedType: 'finisher', 
                quantity: 40, 
                birdsFed: 450, 
                cost: 100, 
                notes: 'Evening feeding' 
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
                minStock: 50 
            },
            { 
                id: 2, 
                feedType: 'grower', 
                currentStock: 120, 
                unit: 'kg', 
                costPerKg: 2.3, 
                minStock: 40 
            },
            { 
                id: 3, 
                feedType: 'finisher', 
                currentStock: 100, 
                unit: 'kg', 
                costPerKg: 2.2, 
                minStock: 30 
            },
            { 
                id: 4, 
                feedType: 'layer', 
                currentStock: 80, 
                unit: 'kg', 
                costPerKg: 2.4, 
                minStock: 20 
            }
        ];
    },

    saveData() {
        try {
            localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
            localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
            localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
            
            // Broadcast data change
            this.broadcastDataChange();
        } catch (error) {
            console.error('❌ Error saving feed data:', error);
        }
    },

    broadcastDataChange() {
        if (Broadcaster && Broadcaster.recordCreated) {
            Broadcaster.recordCreated('feed-record', {
                action: 'data_updated',
                timestamp: new Date().toISOString(),
                recordsCount: this.feedRecords.length,
                inventoryCount: this.feedInventory.length,
                birdsStock: this.birdsStock
            });
        }
    },

    // ==================== EVENT LISTENER MANAGEMENT ====================
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    },

    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    },

    // ==================== MODULE RENDERING ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const formTitle = this.isEditing ? 'Edit Feed Record' : 'Record Feed Usage';
        const submitButtonText = this.isEditing ? 'Update Record' : 'Save Record';

        this.element.innerHTML = `
            <div class="module-container" id="feed-record-module">
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" data-action="record-feed">
                        <div class="action-icon">📝</div>
                        <div class="action-text">
                            <div class="action-title">Record Feed</div>
                            <div class="action-desc">Log feed usage</div>
                        </div>
                    </button>
                    <button class="quick-action-btn" data-action="add-stock">
                        <div class="action-icon">📦</div>
                        <div class="action-text">
                            <div class="action-title">Add Stock</div>
                            <div class="action-desc">Add feed to inventory</div>
                        </div>
                    </button>
                    <button class="quick-action-btn" data-action="adjust-birds">
                        <div class="action-icon">🐔</div>
                        <div class="action-text">
                            <div class="action-title">Adjust Birds</div>
                            <div class="action-desc">Update bird count</div>
                        </div>
                    </button>
                    <button class="quick-action-btn" data-action="export-records">
                        <div class="action-icon">📤</div>
                        <div class="action-text">
                            <div class="action-title">Export Data</div>
                            <div class="action-desc">Export feed records</div>
                        </div>
                    </button>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🌾</div>
                        <div class="stat-value">${stats.totalStock} kg</div>
                        <div class="stat-label">Current Stock</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🐔</div>
                        <div class="stat-value">${this.birdsStock}</div>
                        <div class="stat-label">Birds to Feed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${this.formatCurrency(stats.totalInventoryValue)}</div>
                        <div class="stat-label">Inventory Value</div>
                    </div>
                </div>

                <!-- Inventory Overview -->
                <div class="glass-card inventory-section">
                    <h3 class="section-title">Feed Inventory</h3>
                    <div class="inventory-grid">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <!-- Form Section with ID for easy scrolling -->
                <div class="glass-card form-section" id="feed-form-section">
                    <h3 class="section-title" id="feed-form-title">${formTitle}</h3>
                    <form id="feed-record-form" class="feed-form">
                        <div class="form-row">
                            <div class="form-group">
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
                            <div class="form-group">
                                <label class="form-label">Quantity (kg)</label>
                                <input type="number" class="form-input" id="feed-quantity" step="0.1" min="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="feed-notes" rows="2" placeholder="Feeding details..."></textarea>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn-primary" id="feed-submit-btn">${submitButtonText}</button>
                            ${this.isEditing ? '<button type="button" class="btn-outline" id="cancel-feed-edit">Cancel Edit</button>' : ''}
                        </div>
                    </form>
                </div>

                <!-- Recent Records -->
                <div class="glass-card records-section">
                    <div class="section-header">
                        <h3 class="section-title">Recent Feed Records</h3>
                        <button class="btn-outline" data-action="export-records">Export</button>
                    </div>
                    <div id="feed-records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
                </div>
            </div>
        `;

        // Populate form if editing
        if (this.isEditing && this.editingRecordId) {
            setTimeout(() => this.populateEditForm(), 50);
        }

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
                <div class="inventory-item" style="border-left: 4px solid ${statusColor};">
                    <div class="inventory-header">
                        <span class="inventory-type">${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)}</span>
                        <span class="inventory-status" style="color: ${statusColor};">${stockStatus}</span>
                    </div>
                    <div class="inventory-stock">
                        ${item.currentStock} ${item.unit}
                    </div>
                    <div class="inventory-details">
                        <span class="detail">Min: ${item.minStock}${item.unit}</span>
                        <span class="detail">${this.formatCurrency(item.costPerKg)}/kg</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return `
                <div class="no-records">
                    <div class="empty-icon">🌾</div>
                    <div class="empty-title">No feed records yet</div>
                    <div class="empty-desc">Record your first feed usage</div>
                </div>
            `;
        }

        return this.feedRecords.slice(0, 5).map(record => `
            <div class="record-item">
                <div class="record-main">
                    <div class="record-header">
                        <span class="record-type">${record.feedType.charAt(0).toUpperCase() + record.feedType.slice(1)} Feed</span>
                        <span class="record-date">${record.date}</span>
                    </div>
                    <div class="record-details">
                        <span class="detail">${record.quantity}kg</span>
                        <span class="detail">${record.birdsFed} birds</span>
                        <span class="detail">${this.formatCurrency(record.cost)}</span>
                    </div>
                    ${record.notes ? `<div class="record-notes">${record.notes}</div>` : ''}
                </div>
                <div class="record-actions">
                    <div class="record-cost">
                        <div class="cost-amount">${this.formatCurrency(record.cost)}</div>
                        <div class="cost-per-kg">${(record.cost / record.quantity).toFixed(2)}/kg</div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-icon edit-feed-record" data-id="${record.id}" title="Edit Record">
                            ✏️
                        </button>
                        <button class="btn-icon delete-feed-record" data-id="${record.id}" title="Delete Record">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        this.removeAllEventListeners();
        
        if (!this.element) return;

        // Main event delegation for all buttons
        this.addEventListener(this.element, 'click', (e) => {
            // Handle Record Feed button and other action buttons
            const actionButton = e.target.closest('[data-action]');
            if (actionButton) {
                e.preventDefault();
                const action = actionButton.getAttribute('data-action');
                console.log(`🌾 Action clicked: ${action}`);
                
                switch(action) {
                    case 'record-feed':
                        this.scrollToForm();
                        break;
                    case 'add-stock':
                        this.showAddStockForm();
                        break;
                    case 'adjust-birds':
                        this.showAdjustBirdsForm();
                        break;
                    case 'export-records':
                        this.exportFeedRecords();
                        break;
                }
                return;
            }
            
            // Handle edit/delete buttons
            const editButton = e.target.closest('.edit-feed-record');
            const deleteButton = e.target.closest('.delete-feed-record');
            
            if (editButton) {
                e.preventDefault();
                const id = parseInt(editButton.getAttribute('data-id'));
                this.editFeedRecord(id);
            } else if (deleteButton) {
                e.preventDefault();
                const id = parseInt(deleteButton.getAttribute('data-id'));
                this.deleteFeedRecord(id);
            }
        });

        // Form submission
        const form = this.element.querySelector('#feed-record-form');
        if (form) {
            this.addEventListener(form, 'submit', (e) => {
                e.preventDefault();
                this.handleFeedRecordSubmit(e);
            });
        }

        // Cancel edit button
        const cancelBtn = this.element.querySelector('#cancel-feed-edit');
        if (cancelBtn) {
            this.addEventListener(cancelBtn, 'click', (e) => {
                e.preventDefault();
                this.cancelFeedEdit();
            });
        }
    },

    // ==================== FORM HANDLING ====================
    scrollToForm() {
        console.log('🎯 scrollToForm() called');
        
        const formSection = this.element.querySelector('#feed-form-section');
        if (formSection) {
            console.log('✅ Found form section, scrolling...');
            
            // Visual feedback on button
            const recordFeedBtn = this.element.querySelector('[data-action="record-feed"]');
            if (recordFeedBtn) {
                recordFeedBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    recordFeedBtn.style.transform = '';
                }, 200);
            }
            
            // Scroll to form with smooth animation
            formSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Highlight the form
            formSection.classList.add('highlight');
            setTimeout(() => {
                formSection.classList.remove('highlight');
            }, 2000);
            
            // Focus on first input
            setTimeout(() => {
                const feedTypeSelect = this.element.querySelector('#feed-type');
                if (feedTypeSelect) {
                    feedTypeSelect.focus();
                    console.log('🎯 Focused on feed type select');
                }
            }, 500);
        } else {
            console.error('❌ Form section not found');
            // Fallback: scroll to bottom
            this.element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    populateEditForm() {
        const record = this.feedRecords.find(r => r.id === this.editingRecordId);
        if (!record) {
            this.showNotification('Record not found', 'error');
            this.cancelEdit();
            return;
        }

        const feedTypeSelect = this.element.querySelector('#feed-type');
        const quantityInput = this.element.querySelector('#feed-quantity');
        const notesTextarea = this.element.querySelector('#feed-notes');

        if (feedTypeSelect) feedTypeSelect.value = record.feedType;
        if (quantityInput) quantityInput.value = record.quantity;
        if (notesTextarea) notesTextarea.value = record.notes || '';
    },

    handleFeedRecordSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.element.querySelector('#feed-submit-btn');
        const isEditMode = submitBtn.textContent === 'Update Record';
        const recordId = this.editingRecordId;
        
        const feedType = this.element.querySelector('#feed-type').value;
        const quantity = parseFloat(this.element.querySelector('#feed-quantity').value);
        const notes = this.element.querySelector('#feed-notes').value;
        
        if (!feedType || !quantity || quantity <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (isEditMode && recordId) {
            this.updateFeedRecord(recordId, feedType, quantity, notes);
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
        inventoryItem.currentStock -= quantity;
        
        this.feedRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        
        // Broadcast creation
        Broadcaster.recordCreated('feed-record', {
            ...formData,
            timestamp: new Date().toISOString(),
            module: 'feed-record',
            action: 'feed_record_created',
            inventoryImpact: {
                feedType: feedType,
                stockChange: -quantity,
                newStock: inventoryItem.currentStock
            }
        });
        
        this.showNotification(`Recorded ${formData.quantity}kg ${feedType} feed usage!`, 'success');
    },

    editFeedRecord(recordId) {
        console.log('🌾 EDITING FEED RECORD:', recordId);
        
        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) {
            this.showNotification('Feed record not found', 'error');
            return;
        }
        
        this.isEditing = true;
        this.editingRecordId = recordId;
        
        // Scroll to form first
        this.scrollToForm();
        
        // Then render with edit mode
        setTimeout(() => {
            this.renderModule();
        }, 300);
    },

    updateFeedRecord(recordId, feedType, quantity, notes) {
        console.log('💾 UPDATING FEED RECORD:', recordId);
        
        // Check if feed type has sufficient stock
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected!', 'error');
            return;
        }
        
        // Find the original record
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
            this.cancelEdit();
            this.renderModule();
            this.syncStatsWithSharedData();
            
            // Broadcast update
            Broadcaster.recordUpdated('feed-record', {
                id: recordId,
                oldData: oldRecord,
                newData: updatedRecord,
                timestamp: new Date().toISOString(),
                module: 'feed-record',
                action: 'feed_record_updated',
                inventoryImpact: {
                    feedType: feedType,
                    stockChange: stockAdjustment,
                    newStock: newStock
                }
            });
            
            this.showNotification(`Feed record updated!`, 'success');
        }
    },

    cancelFeedEdit() {
        this.isEditing = false;
        this.editingRecordId = null;
        this.renderModule();
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
            this.renderModule();
            this.syncStatsWithSharedData();
            
            // Broadcast deletion
            Broadcaster.recordDeleted('feed-record', {
                id: recordId,
                data: record,
                timestamp: new Date().toISOString(),
                module: 'feed-record',
                action: 'feed_record_deleted',
                inventoryImpact: {
                    feedType: record.feedType,
                    stockReturned: stockReturned,
                    newStock: newStock
                }
            });
            
            this.showNotification('Feed record deleted!', 'success');
        }
    },

    // ==================== INVENTORY MANAGEMENT ====================
    showAddStockForm() {
        const feedType = prompt('Enter feed type (starter/grower/finisher/layer):');
        if (!feedType) return;
        
        const quantity = parseFloat(prompt(`Enter quantity to add to ${feedType} (kg):`, '0'));
        if (isNaN(quantity) || quantity <= 0) {
            this.showNotification('Invalid quantity entered!', 'error');
            return;
        }

        this.addToInventory(feedType, quantity);
    },

    addToInventory(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (inventoryItem) {
            const oldStock = inventoryItem.currentStock;
            inventoryItem.currentStock += quantity;
            this.saveData();
            this.renderModule();
            this.syncStatsWithSharedData();
            
            // Broadcast inventory addition
            Broadcaster.recordCreated('feed-record', {
                id: `inventory_${Date.now()}`,
                feedType: feedType,
                quantity: quantity,
                oldStock: oldStock,
                newStock: inventoryItem.currentStock,
                timestamp: new Date().toISOString(),
                module: 'feed-record',
                action: 'inventory_stock_added'
            });
            
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
            this.renderModule();
            this.syncStatsWithSharedData();
            
            // Broadcast new inventory creation
            Broadcaster.recordCreated('feed-record', {
                id: newItem.id,
                feedType: feedType,
                quantity: quantity,
                oldStock: 0,
                newStock: quantity,
                timestamp: new Date().toISOString(),
                module: 'feed-record',
                action: 'inventory_item_created'
            });
            
            this.showNotification(`Created new ${feedType} inventory with ${quantity}kg!`, 'success');
        }
    },

    // ==================== BIRD MANAGEMENT ====================
    showAdjustBirdsForm() {
        const newCount = parseInt(prompt(`Current birds: ${this.birdsStock}\nEnter new bird count:`, this.birdsStock.toString()));
        if (isNaN(newCount) || newCount < 0) {
            this.showNotification('Invalid bird count entered!', 'error');
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
        
        // Broadcast bird count adjustment
        Broadcaster.recordUpdated('feed-record', {
            id: 'birds_count',
            oldCount: oldCount,
            newCount: newCount,
            timestamp: new Date().toISOString(),
            module: 'feed-record',
            action: 'birds_count_adjusted'
        });
        
        this.showNotification(`Adjusted bird count to ${newCount}!`, 'success');
    },

    // ==================== EXPORT ====================
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
        Broadcaster.recordCreated('feed-record', {
            action: 'export_feed_records',
            count: this.feedRecords.length,
            timestamp: new Date().toISOString(),
            module: 'feed-record'
        });
        
        this.showNotification('Feed records exported successfully!', 'success');
    },

    // ==================== UTILITIES ====================
    calculateCost(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        return quantity * (inventoryItem?.costPerKg || 2.5);
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

    applyThemeStyles(theme) {
        // Apply theme-specific styles
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
        } else {
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#666');
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
    }
};

// ==================== STYLES ====================
const feedRecordStyles = `
    #feed-record-module {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .module-header {
        margin-bottom: 30px;
        padding: 20px;
        background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--secondary-color, #10b981) 100%);
        border-radius: 12px;
        color: white;
    }

    .module-title {
        font-size: 28px;
        margin: 0 0 8px 0;
        font-weight: 700;
        color: white;
    }

    .module-subtitle {
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
        color: white;
    }

    .quick-action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
    }

    .quick-action-btn {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        width: 100%;
    }

    .quick-action-btn:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color, #3b82f6);
    }

    .action-icon {
        font-size: 32px;
    }

    .action-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .action-title {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
    }

    .action-desc {
        color: var(--text-secondary, #666);
        font-size: 12px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
    }

    .stat-card {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color, #3b82f6);
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
        color: var(--text-secondary, #666);
        font-size: 14px;
    }

    .glass-card {
        background: var(--glass-bg, rgba(255, 255, 255, 0.9));
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .inventory-section {
        padding: 24px;
        margin: 24px 0;
    }

    .form-section {
        padding: 24px;
        margin: 24px 0;
        transition: all 0.3s ease;
    }

    .form-section.highlight {
        animation: highlight 2s ease;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    @keyframes highlight {
        0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            border-color: var(--primary-color, #3b82f6);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            border-color: var(--primary-color, #3b82f6);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            border-color: var(--border-color, #e0e0e0);
        }
    }

    .records-section {
        padding: 24px;
    }

    .section-title {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .inventory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }

    .inventory-item {
        padding: 16px;
        background: var(--bg-primary, white);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e0e0e0);
    }

    .inventory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .inventory-type {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        text-transform: capitalize;
    }

    .inventory-status {
        font-size: 12px;
        font-weight: 600;
    }

    .inventory-stock {
        font-size: 20px;
        font-weight: bold;
        color: var(--text-primary, #1a1a1a);
        margin-bottom: 8px;
    }

    .inventory-details {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-secondary, #666);
    }

    .feed-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-label {
        font-weight: 500;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
    }

    .form-input {
        padding: 12px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--bg-primary, white);
        color: var(--text-primary, #1a1a1a);
        transition: border-color 0.2s ease;
    }

    .form-input:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-buttons {
        display: flex;
        gap: 12px;
        align-items: center;
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
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-outline:hover {
        background: var(--bg-hover, #f5f5f5);
        border-color: var(--primary-color, #3b82f6);
    }

    .record-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: var(--bg-primary, white);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e0e0e0);
        margin-bottom: 12px;
    }

    .record-main {
        flex: 1;
    }

    .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .record-type {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        text-transform: capitalize;
    }

    .record-date {
        color: var(--text-secondary, #666);
        font-size: 14px;
    }

    .record-details {
        display: flex;
        gap: 16px;
        margin-bottom: 8px;
    }

    .record-details .detail {
        color: var(--text-secondary, #666);
        font-size: 14px;
    }

    .record-notes {
        color: var(--text-secondary, #666);
        font-size: 14px;
        font-style: italic;
        padding-top: 8px;
        border-top: 1px solid var(--border-light, #f0f0f0);
    }

    .record-actions {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .record-cost {
        text-align: right;
    }

    .cost-amount {
        font-weight: bold;
        color: var(--text-primary, #1a1a1a);
        font-size: 18px;
    }

    .cost-per-kg {
        font-size: 12px;
        color: var(--text-secondary, #666);
    }

    .action-buttons {
        display: flex;
        gap: 8px;
    }

    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        font-size: 14px;
        transition: all 0.2s ease;
        color: var(--text-secondary, #666);
    }

    .btn-icon:hover {
        background: var(--bg-hover, #f5f5f5);
        color: var(--text-primary, #1a1a1a);
        transform: scale(1.1);
    }

    .no-records {
        text-align: center;
        color: var(--text-secondary, #666);
        padding: 40px 20px;
    }

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .empty-title {
        font-size: 16px;
        margin-bottom: 8px;
        font-weight: 600;
    }

    .empty-desc {
        font-size: 14px;
    }

    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .quick-action-grid {
            grid-template-columns: 1fr;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .inventory-grid {
            grid-template-columns: 1fr;
        }
        
        .record-item {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
        }
        
        .record-actions {
            justify-content: space-between;
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
        FarmModules.registerModule('feed-record', FeedRecordModule);
        console.log('✅ feed-record module registered successfully!');
    }
    
    // Also register with .js extension for compatibility
    if (window.FarmModules) {
        FarmModules.registerModule('feed-record.js', FeedRecordModule);
        console.log('✅ feed-record.js module registered successfully!');
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
    
    // Apply enhancements when module loads
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
