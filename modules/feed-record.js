// modules/feed-record.js - COMPLETE CSP-COMPLIANT VERSION WITH ALL FUNCTIONALITY
console.log('🌾 Loading feed-record module...');

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

    // ==================== CORE FUNCTIONS ====================
    initialize() {
        console.log('🌾 Initializing Feed Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
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
            this.broadcastDataChange('feed-record', {
                records: this.feedRecords,
                inventory: this.feedInventory,
                birdsStock: this.birdsStock
            });
            
        } catch (error) {
            console.error('❌ Error saving feed data:', error);
        }
    },

    // ==================== MODULE RENDERING ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const formTitle = this.isEditing ? 'Edit Feed Record' : 'Record Feed Usage';
        const submitButtonText = this.isEditing ? 'Update Record' : 'Save Record';

        this.element.innerHTML = `
            <div class="feed-record-module">
                <div class="module-header">
                    <h1>Feed Records</h1>
                    <p>Track feed usage and inventory</p>
                </div>

                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="action-button" data-action="record-feed">
                            <div class="action-icon">📝</div>
                            <div class="action-text">
                                <div class="action-title">Record Feed</div>
                                <div class="action-desc">Log feed usage</div>
                            </div>
                        </button>
                        <button class="action-button" data-action="add-stock">
                            <div class="action-icon">📦</div>
                            <div class="action-text">
                                <div class="action-title">Add Stock</div>
                                <div class="action-desc">Add feed to inventory</div>
                            </div>
                        </button>
                        <button class="action-button" data-action="adjust-birds">
                            <div class="action-icon">🐔</div>
                            <div class="action-text">
                                <div class="action-title">Adjust Birds</div>
                                <div class="action-desc">Update bird count</div>
                            </div>
                        </button>
                        <button class="action-button" data-action="export-records">
                            <div class="action-icon">📤</div>
                            <div class="action-text">
                                <div class="action-title">Export Data</div>
                                <div class="action-desc">Export feed records</div>
                            </div>
                        </button>
                    </div>
                </div>

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

                <div class="inventory-section">
                    <h2>Feed Inventory</h2>
                    <div class="inventory-grid">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <div class="form-section">
                    <h2>${formTitle}</h2>
                    <form id="feed-record-form" class="feed-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Feed Type</label>
                                <select id="feed-type" required>
                                    <option value="">Select feed type</option>
                                    ${this.feedInventory.map(item => `
                                        <option value="${item.feedType}">
                                            ${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed (${item.currentStock}kg)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Quantity (kg)</label>
                                <input type="number" id="feed-quantity" step="0.1" min="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea id="feed-notes" rows="2" placeholder="Feeding details..."></textarea>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-button" id="feed-submit-btn">${submitButtonText}</button>
                            ${this.isEditing ? '<button type="button" class="btn-outline" id="cancel-edit-btn">Cancel</button>' : ''}
                        </div>
                    </form>
                </div>

                <div class="records-section">
                    <div class="section-header">
                        <h2>Recent Feed Records</h2>
                        <button class="btn-outline" data-action="export-records">Export</button>
                    </div>
                    <div class="records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
                </div>
            </div>
        `;

        // Populate form if editing
        if (this.isEditing && this.editingRecordId) {
            this.populateEditForm();
        }

        this.setupEventListeners();
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const totalInventoryValue = this.feedInventory.reduce((sum, item) => sum + (item.currentStock * item.costPerKg), 0);
        const lowStockItems = this.feedInventory.filter(item => item.currentStock <= item.minStock).length;
        
        return { totalStock, totalInventoryValue, lowStockItems };
    },

    renderInventoryOverview() {
        if (this.feedInventory.length === 0) {
            return '<div class="no-inventory">No feed inventory yet. Add some stock!</div>';
        }

        return this.feedInventory.map(item => {
            const isLowStock = item.currentStock <= item.minStock;
            const statusColor = isLowStock ? '#ef4444' : '#10b981';
            
            return `
                <div class="inventory-card">
                    <div class="inventory-header">
                        <div class="inventory-type">${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed</div>
                        <div class="inventory-status" style="color: ${statusColor}">
                            ${isLowStock ? 'Low Stock' : 'Good'}
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
                    </div>
                    <div class="inventory-actions">
                        <button class="btn-icon" data-action="edit-inventory" data-id="${item.id}" title="Edit Inventory">
                            ✏️
                        </button>
                        <button class="btn-icon" data-action="delete-inventory" data-id="${item.id}" title="Delete Inventory">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return '<div class="no-records">No feed records yet. Record your first feed usage!</div>';
        }

        return this.feedRecords.slice(0, 10).map(record => `
            <div class="record-item" data-id="${record.id}">
                <div class="record-header">
                    <div class="record-type">${record.feedType.charAt(0).toUpperCase() + record.feedType.slice(1)} Feed</div>
                    <div class="record-date">${record.date}</div>
                </div>
                <div class="record-details">
                    <div class="detail">${record.quantity} kg</div>
                    <div class="detail">${record.birdsFed} birds</div>
                    <div class="detail">${this.formatCurrency(record.cost)}</div>
                </div>
                ${record.notes ? `<div class="record-notes">${record.notes}</div>` : ''}
                <div class="record-actions">
                    <button class="btn-icon" data-action="edit-record" data-id="${record.id}" title="Edit Record">
                        ✏️
                    </button>
                    <button class="btn-icon" data-action="delete-record" data-id="${record.id}" title="Delete Record">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        this.removeAllEventListeners();
        
        if (!this.element) return;

        // Event delegation for all buttons
        this.addEventListener(this.element, 'click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            
            e.preventDefault();
            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');
            
            switch(action) {
                case 'record-feed':
                    this.scrollToForm();
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
                case 'edit-record':
                    if (id) this.editFeedRecord(parseInt(id));
                    break;
                case 'delete-record':
                    if (id) this.deleteFeedRecord(parseInt(id));
                    break;
                case 'edit-inventory':
                    if (id) this.editInventoryItem(parseInt(id));
                    break;
                case 'delete-inventory':
                    if (id) this.deleteInventoryItem(parseInt(id));
                    break;
                case 'cancel-edit':
                    this.cancelEdit();
                    break;
            }
        });

        // Form submission
        const form = this.element.querySelector('#feed-record-form');
        if (form) {
            this.addEventListener(form, 'submit', (e) => {
                e.preventDefault();
                this.saveFeedRecord();
            });
        }

        // Cancel button
        const cancelBtn = this.element.querySelector('#cancel-edit-btn');
        if (cancelBtn) {
            this.addEventListener(cancelBtn, 'click', () => {
                this.cancelEdit();
            });
        }
    },

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

    // ==================== FORM HANDLING ====================
    scrollToForm() {
        const formSection = this.element.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
            formSection.classList.add('highlight');
            setTimeout(() => formSection.classList.remove('highlight'), 1000);
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
        const submitBtn = this.element.querySelector('#feed-submit-btn');

        if (feedTypeSelect) feedTypeSelect.value = record.feedType;
        if (quantityInput) quantityInput.value = record.quantity;
        if (notesTextarea) notesTextarea.value = record.notes || '';
        if (submitBtn) submitBtn.textContent = 'Update Record';
    },

    saveFeedRecord() {
        const feedType = this.element.querySelector('#feed-type').value;
        const quantity = parseFloat(this.element.querySelector('#feed-quantity').value);
        const notes = this.element.querySelector('#feed-notes').value;

        if (!feedType || !quantity || quantity <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Find inventory item
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            this.showNotification('Invalid feed type selected', 'error');
            return;
        }

        if (this.isEditing && this.editingRecordId) {
            this.updateFeedRecord(this.editingRecordId, feedType, quantity, notes);
        } else {
            this.createFeedRecord(feedType, quantity, notes);
        }
    },

    createFeedRecord(feedType, quantity, notes) {
        if (inventoryItem.currentStock < quantity) {
            this.showNotification(`Insufficient stock! Only ${inventoryItem.currentStock}kg available.`, 'error');
            return;
        }

        // Create record
        const newRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            feedType,
            quantity,
            birdsFed: this.birdsStock,
            cost: quantity * inventoryItem.costPerKg,
            notes
        };

        // Update inventory
        inventoryItem.currentStock -= quantity;

        // Save record
        this.feedRecords.unshift(newRecord);
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        
        this.showNotification(`Recorded ${quantity}kg of ${feedType} feed usage!`, 'success');
    },

    editFeedRecord(recordId) {
        this.isEditing = true;
        this.editingRecordId = recordId;
        this.renderModule();
    },

    updateFeedRecord(recordId, feedType, quantity, notes) {
        const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
        if (recordIndex === -1) {
            this.showNotification('Record not found', 'error');
            this.cancelEdit();
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
            this.showNotification(`Cannot adjust stock below zero!`, 'error');
            return;
        }

        // Update inventory
        inventoryItem.currentStock = newStock;

        // Update record
        const updatedRecord = {
            ...oldRecord,
            feedType,
            quantity,
            cost: quantity * inventoryItem.costPerKg,
            notes,
            updatedAt: new Date().toISOString()
        };

        this.feedRecords[recordIndex] = updatedRecord;
        this.saveData();
        this.cancelEdit();
        this.renderModule();
        this.syncStatsWithSharedData();
        
        this.showNotification(`Feed record updated!`, 'success');
    },

    deleteFeedRecord(recordId) {
        if (!confirm('Are you sure you want to delete this feed record?')) {
            return;
        }

        const record = this.feedRecords.find(r => r.id === recordId);
        if (!record) return;

        // Return stock to inventory
        const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
        if (inventoryItem) {
            inventoryItem.currentStock += record.quantity;
        }

        // Remove record
        this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        
        this.showNotification('Feed record deleted!', 'success');
    },

    cancelEdit() {
        this.isEditing = false;
        this.editingRecordId = null;
        this.renderModule();
    },

    // ==================== INVENTORY MANAGEMENT ====================
    showAddStockDialog() {
        const feedType = prompt('Enter feed type (starter/grower/finisher/layer):');
        if (!feedType) return;
        
        const quantity = parseFloat(prompt(`Enter quantity to add to ${feedType} (kg):`, '0'));
        if (!quantity || quantity <= 0) {
            this.showNotification('Invalid quantity', 'error');
            return;
        }

        this.addToInventory(feedType, quantity);
    },

    editInventoryItem(itemId) {
        const item = this.feedInventory.find(i => i.id === itemId);
        if (!item) {
            this.showNotification('Inventory item not found', 'error');
            return;
        }

        const newCost = parseFloat(prompt(`Current cost: ${item.costPerKg}/kg\nEnter new cost per kg:`, item.costPerKg.toString()));
        const newMinStock = parseInt(prompt(`Current min stock: ${item.minStock}kg\nEnter new minimum stock:`, item.minStock.toString()));

        if (newCost && newCost > 0) {
            item.costPerKg = newCost;
        }
        if (newMinStock && newMinStock >= 0) {
            item.minStock = newMinStock;
        }

        this.saveData();
        this.renderModule();
        this.showNotification('Inventory item updated!', 'success');
    },

    deleteInventoryItem(itemId) {
        const item = this.feedInventory.find(i => i.id === itemId);
        if (!item) return;

        if (item.currentStock > 0) {
            if (!confirm(`This inventory item has ${item.currentStock}kg remaining. Are you sure you want to delete it?`)) {
                return;
            }
        }

        this.feedInventory = this.feedInventory.filter(i => i.id !== itemId);
        this.saveData();
        this.renderModule();
        this.showNotification('Inventory item deleted!', 'success');
    },

    addToInventory(feedType, quantity) {
        const normalizedFeedType = feedType.toLowerCase();
        const item = this.feedInventory.find(i => i.feedType === normalizedFeedType);
        
        if (item) {
            item.currentStock += quantity;
        } else {
            this.feedInventory.push({
                id: Date.now(),
                feedType: normalizedFeedType,
                currentStock: quantity,
                unit: 'kg',
                costPerKg: 2.5,
                minStock: 20
            });
        }
        
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        this.showNotification(`Added ${quantity}kg to ${feedType} inventory!`, 'success');
    },

    // ==================== BIRD MANAGEMENT ====================
    showAdjustBirdsDialog() {
        const newCount = parseInt(prompt(`Current birds: ${this.birdsStock}\nEnter new bird count:`, this.birdsStock.toString()));
        if (!newCount || newCount < 0) {
            this.showNotification('Invalid bird count', 'error');
            return;
        }

        this.adjustBirdCount(newCount);
    },

    adjustBirdCount(newCount) {
        this.birdsStock = newCount;
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        this.showNotification(`Bird count adjusted to ${newCount}!`, 'success');
    },

    // ==================== EXPORT ====================
    exportFeedRecords() {
        const data = {
            records: this.feedRecords,
            inventory: this.feedInventory,
            stats: this.calculateStats(),
            birdsStock: this.birdsStock,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
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
    },

    // ==================== UTILITIES ====================
    getTypeIcon(type) {
        const icons = {
            'news': '📰',
            'update': '🔄',
            'alert': '⚠️',
            'announcement': '📢',
            'default': '📄'
        };
        return icons[type] || icons.default;
    },

    applyThemeStyles(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--bg-secondary', '#2a2a2a');
        } else {
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#666');
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f9f9f9');
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
            return;
        }
        
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(`${type.toUpperCase()}: ${message}`);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
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

    broadcastDataChange(moduleName, data) {
        const event = new CustomEvent('farmDataChanged', {
            detail: { 
                module: moduleName,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }
};

// ==================== STYLES ====================
const feedRecordStyles = `
    .feed-record-module {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .module-header {
        margin-bottom: 30px;
    }

    .module-header h1 {
        color: var(--text-primary, #1a1a1a);
        font-size: 28px;
        margin-bottom: 8px;
        font-weight: 600;
    }

    .module-header p {
        color: var(--text-secondary, #666);
        font-size: 16px;
    }

    .quick-actions {
        margin-bottom: 30px;
    }

    .quick-actions h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }

    .action-button {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: left;
        width: 100%;
    }

    .action-button:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color, #3b82f6);
        background: var(--bg-hover, #f8f9fa);
    }

    .action-icon {
        font-size: 32px;
        flex-shrink: 0;
    }

    .action-text {
        flex: 1;
    }

    .action-title {
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
        margin-bottom: 4px;
    }

    .action-desc {
        color: var(--text-secondary, #666);
        font-size: 12px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

    .inventory-section {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 30px;
    }

    .inventory-section h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .inventory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .inventory-card {
        padding: 16px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        transition: all 0.3s ease;
        background: var(--bg-primary, white);
        position: relative;
    }

    .inventory-card:hover {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
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

    .form-section {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 30px;
    }

    .form-section.highlight {
        animation: highlight 1s ease;
    }

    @keyframes highlight {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }

    .form-section h2 {
        color: var(--text-primary, #1a1a1a);
        font-size: 20px;
        margin-bottom: 20px;
        font-weight: 600;
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

    .form-group label {
        font-weight: 500;
        color: var(--text-primary, #1a1a1a);
        font-size: 14px;
    }

    .form-group select,
    .form-group input,
    .form-group textarea {
        padding: 12px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--bg-primary, white);
        color: var(--text-primary, #1a1a1a);
        transition: border-color 0.2s ease;
    }

    .form-group select:focus,
    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-buttons {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .submit-button {
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

    .submit-button:hover {
        background: var(--primary-dark, #2563eb);
        transform: translateY(-1px);
    }

    .records-section {
        background: var(--bg-primary, white);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        padding: 24px;
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
        font-weight: 600;
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

    .records-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .record-item {
        padding: 16px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        transition: all 0.3s ease;
        background: var(--bg-primary, white);
        position: relative;
    }

    .record-item:hover {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

    .detail {
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
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .record-item:hover .record-actions {
        opacity: 1;
    }

    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
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

    .no-inventory,
    .no-records {
        text-align: center;
        color: var(--text-secondary, #666);
        padding: 40px 20px;
        background: var(--bg-secondary, #f9f9f9);
        border-radius: 8px;
        border: 2px dashed var(--border-color, #e0e0e0);
        grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .actions-grid {
            grid-template-columns: 1fr;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .inventory-grid {
            grid-template-columns: 1fr;
        }
        
        .record-actions {
            position: static;
            opacity: 1;
            margin-top: 12px;
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
