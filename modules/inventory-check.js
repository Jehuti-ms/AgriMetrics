// modules/inventory-check.js
FarmModules.registerModule('inventory-check', {
    name: 'Inventory',
    icon: '📦',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Inventory Management</h1>
                <p>Track and manage your farm inventory</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-inventory-item">
                        ➕ Add Item
                    </button>
                </div>
            </div>

            <div class="inventory-summary">
                <div class="summary-card">
                    <div class="summary-icon">📦</div>
                    <div class="summary-content">
                        <h3>Total Items</h3>
                        <div class="summary-value" id="total-items-count">0</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h3>Low Stock</h3>
                        <div class="summary-value" id="low-stock-count">0</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Value</h3>
                        <div class="summary-value" id="total-inventory-value">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="inventory-grid" id="inventory-grid">
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                    </div>
                </div>
            </div>

            <!-- Inventory Item Modal -->
            <div id="inventory-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="inventory-modal-title">Add Inventory Item</h3>
                        <button class="btn-icon close-inventory-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="inventory-form">
                            <input type="hidden" id="inventory-id">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="inventory-name">Item Name:</label>
                                    <input type="text" id="inventory-name" required placeholder="Enter item name">
                                </div>
                                <div class="form-group">
                                    <label for="inventory-category">Category:</label>
                                    <select id="inventory-category" required>
                                        <option value="">Select Category</option>
                                        <option value="seeds">Seeds</option>
                                        <option value="feed">Animal Feed</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="tools">Tools</option>
                                        <option value="medical">Medical Supplies</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inventory-description">Description:</label>
                                <textarea id="inventory-description" placeholder="Enter item description..." rows="2"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="inventory-quantity">Quantity:</label>
                                    <input type="number" id="inventory-quantity" min="0" required placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label for="inventory-unit">Unit:</label>
                                    <select id="inventory-unit" required>
                                        <option value="units">Units</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="liters">Liters</option>
                                        <option value="gallons">Gallons</option>
                                        <option value="bags">Bags</option>
                                        <option value="boxes">Boxes</option>
                                        <option value="packs">Packs</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="inventory-cost">Unit Cost ($):</label>
                                    <input type="number" id="inventory-cost" step="0.01" min="0" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="inventory-minstock">Minimum Stock:</label>
                                    <input type="number" id="inventory-minstock" min="0" placeholder="10">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inventory-location">Storage Location:</label>
                                <input type="text" id="inventory-location" placeholder="e.g., Storage Shed A">
                            </div>
                            <div class="form-group">
                                <label for="inventory-supplier">Supplier (Optional):</label>
                                <input type="text" id="inventory-supplier" placeholder="Supplier name">
                            </div>
                            <div class="form-group">
                                <label for="inventory-expiry">Expiry Date (Optional):</label>
                                <input type="date" id="inventory-expiry">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-inventory-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-inventory">Save Item</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Inventory Check module initializing...');
        this.loadInventoryData();
        this.attachEventListeners();
        this.updateSummary();
    },

    loadInventoryData: function() {
        const inventory = FarmModules.appData.inventory || [];
        this.renderInventoryGrid(inventory);
    },

    renderInventoryGrid: function(inventory) {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        if (inventory.length === 0) {
            grid.innerHTML = `
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = inventory.map(item => `
            <div class="inventory-item">
                <div class="item-header">
                    <div class="item-category">
                        <span class="category-icon">${this.getCategoryIcon(item.category)}</span>
                        <span class="category-name">${this.formatCategory(item.category)}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon edit-inventory" data-id="${item.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-inventory" data-id="${item.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                
                <div class="item-content">
                    <h4 class="item-name">${item.name || 'Unnamed Item'}</h4>
                    <p class="item-description">${item.description || 'No description'}</p>
                    
                    <div class="item-details">
                        <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">
                                <span class="quantity ${this.getQuantityStatus(item)}">${item.quantity || 0}</span>
                                <span class="unit">${item.unit || 'units'}</span>
                            </span>
                        </div>
                        
                        ${item.cost ? `
                        <div class="detail-row">
                            <span class="detail-label">Unit Cost:</span>
                            <span class="detail-value cost">${this.formatCurrency(item.cost)}</span>
                        </div>
                        ` : ''}
                        
                        ${item.location ? `
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value location">${item.location}</span>
                        </div>
                        ` : ''}
                        
                        ${item.supplier ? `
                        <div class="detail-row">
                            <span class="detail-label">Supplier:</span>
                            <span class="detail-value supplier">${item.supplier}</span>
                        </div>
                        ` : ''}
                        
                        ${item.expiryDate ? `
                        <div class="detail-row">
                            <span class="detail-label">Expires:</span>
                            <span class="detail-value expiry ${this.getExpiryStatus(item)}">${this.formatDate(item.expiryDate)}</span>
                        </div>
                        ` : ''}
                        
                        ${item.minStock ? `
                        <div class="detail-row">
                            <span class="detail-label">Min Stock:</span>
                            <span class="detail-value">${item.minStock}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="item-footer">
                    <div class="stock-status">
                        <span class="status-badge ${this.getStockStatusClass(item)}">
                            ${this.getStockStatusText(item)}
                        </span>
                    </div>
                    <div class="item-value">
                        ${item.cost && item.quantity ? this.formatCurrency(item.cost * item.quantity) : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateSummary: function() {
        const inventory = FarmModules.appData.inventory || [];
        
        const totalItems = inventory.length;
        const lowStockCount = inventory.filter(item => this.isLowStock(item)).length;
        const totalValue = inventory.reduce((sum, item) => {
            const quantity = parseInt(item.quantity) || 0;
            const cost = parseFloat(item.cost) || 0;
            return sum + (quantity * cost);
        }, 0);

        this.updateElement('total-items-count', totalItems);
        this.updateElement('low-stock-count', lowStockCount);
        this.updateElement('total-inventory-value', this.formatCurrency(totalValue));
    },

    attachEventListeners: function() {
        // Add item button
        const addItemBtn = document.getElementById('add-inventory-item');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showInventoryModal());
        }

        // Modal events
        const closeButtons = document.querySelectorAll('.close-inventory-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideInventoryModal());
        });

        // Save inventory
        const saveBtn = document.getElementById('save-inventory');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveInventory());
        }

        // Edit and delete inventory items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-inventory')) {
                const itemId = e.target.closest('.edit-inventory').dataset.id;
                this.editInventory(itemId);
            }
            if (e.target.closest('.delete-inventory')) {
                const itemId = e.target.closest('.delete-inventory').dataset.id;
                this.deleteInventory(itemId);
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('inventory-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideInventoryModal();
                }
            });
        }
    },

    showInventoryModal: function() {
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');
        const form = document.getElementById('inventory-form');

        if (modal && title && form) {
            // Reset form
            form.reset();
            document.getElementById('inventory-id').value = '';
            
            // Set default values
            document.getElementById('inventory-unit').value = 'units';
            document.getElementById('inventory-minstock').value = '10';
            document.getElementById('inventory-category').value = '';
            
            title.textContent = 'Add Inventory Item';
            modal.classList.remove('hidden');
        }
    },

    hideInventoryModal: function() {
        const modal = document.getElementById('inventory-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveInventory: function() {
        const form = document.getElementById('inventory-form');
        if (!form) return;

        const itemId = document.getElementById('inventory-id').value;
        const name = document.getElementById('inventory-name').value;
        const category = document.getElementById('inventory-category').value;
        const description = document.getElementById('inventory-description').value;
        const quantity = parseInt(document.getElementById('inventory-quantity').value);
        const unit = document.getElementById('inventory-unit').value;
        const cost = parseFloat(document.getElementById('inventory-cost').value) || 0;
        const minStock = parseInt(document.getElementById('inventory-minstock').value) || 0;
        const location = document.getElementById('inventory-location').value;
        const supplier = document.getElementById('inventory-supplier').value;
        const expiryDate = document.getElementById('inventory-expiry').value;

        // Validation
        if (!name || !category || isNaN(quantity)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity < 0) {
            this.showNotification('Quantity cannot be negative', 'error');
            return;
        }

        const inventoryData = {
            name: name,
            category: category,
            description: description,
            quantity: quantity,
            unit: unit,
            cost: cost,
            minStock: minStock,
            location: location,
            supplier: supplier,
            expiryDate: expiryDate,
            lastUpdated: new Date().toISOString()
        };

        if (itemId) {
            // Update existing item
            this.updateInventory(itemId, inventoryData);
        } else {
            // Add new item
            inventoryData.dateAdded = new Date().toISOString();
            this.addInventory(inventoryData);
        }

        this.hideInventoryModal();
    },

    addInventory: function(inventoryData) {
        if (!FarmModules.appData.inventory) {
            FarmModules.appData.inventory = [];
        }

        const newItem = {
            id: 'inv-' + Date.now(),
            ...inventoryData
        };

        FarmModules.appData.inventory.push(newItem);

        this.loadInventoryData();
        this.updateSummary();

        this.showNotification('Inventory item added successfully!', 'success');
    },

    editInventory: function(itemId) {
        const inventory = FarmModules.appData.inventory || [];
        const item = inventory.find(i => i.id === itemId);
        
        if (!item) return;

        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');

        if (modal && title) {
            // Fill form with item data
            document.getElementById('inventory-id').value = item.id;
            document.getElementById('inventory-name').value = item.name || '';
            document.getElementById('inventory-category').value = item.category || '';
            document.getElementById('inventory-description').value = item.description || '';
            document.getElementById('inventory-quantity').value = item.quantity || '';
            document.getElementById('inventory-unit').value = item.unit || 'units';
            document.getElementById('inventory-cost').value = item.cost || '';
            document.getElementById('inventory-minstock').value = item.minStock || '';
            document.getElementById('inventory-location').value = item.location || '';
            document.getElementById('inventory-supplier').value = item.supplier || '';
            document.getElementById('inventory-expiry').value = item.expiryDate || '';
            
            title.textContent = 'Edit Inventory Item';
            modal.classList.remove('hidden');
        }
    },

    updateInventory: function(itemId, inventoryData) {
        const inventory = FarmModules.appData.inventory || [];
        const index = inventory.findIndex(i => i.id === itemId);
        
        if (index !== -1) {
            inventory[index] = {
                ...inventory[index],
                ...inventoryData
            };
            
            this.loadInventoryData();
            this.updateSummary();
            this.showNotification('Inventory item updated successfully!', 'success');
        }
    },

    deleteInventory: function(itemId) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            FarmModules.appData.inventory = FarmModules.appData.inventory.filter(i => i.id !== itemId);
            this.loadInventoryData();
            this.updateSummary();
            this.showNotification('Inventory item deleted successfully', 'success');
        }
    },

    getStockStatusClass: function(item) {
        if (this.isOutOfStock(item)) return 'out-of-stock';
        if (this.isLowStock(item)) return 'low-stock';
        return 'adequate-stock';
    },

    getStockStatusText: function(item) {
        if (this.isOutOfStock(item)) return 'Out of Stock';
        if (this.isLowStock(item)) return 'Low Stock';
        return 'Adequate';
    },

    getQuantityStatus: function(item) {
        if (this.isOutOfStock(item)) return 'critical';
        if (this.isLowStock(item)) return 'warning';
        return 'good';
    },

    getExpiryStatus: function(item) {
        if (!item.expiryDate) return '';
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'expired';
        if (diffDays < 7) return 'expiring-soon';
        return '';
    },

    isLowStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        const minStock = parseInt(item.minStock) || 10;
        return quantity > 0 && quantity <= minStock;
    },

    isOutOfStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        return quantity === 0;
    },

    getCategoryIcon: function(category) {
        const icons = {
            seeds: '🌱',
            feed: '🌾',
            fertilizer: '🧪',
            equipment: '🚜',
            tools: '🛠️',
            medical: '💊',
            other: '📦'
        };
        return icons[category] || '📦';
    },

    formatCategory: function(category) {
        if (!category) return 'Other';
        return category.charAt(0).toUpperCase() + category.slice(1);
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        }
    }
});
