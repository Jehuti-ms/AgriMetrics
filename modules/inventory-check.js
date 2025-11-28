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
                    <button class="btn btn-primary" id="add-inventory-btn">
                        ➕ Add Item
                    </button>
                </div>
            </div>

            <!-- Quick Add Form -->
            <div class="quick-add-form card">
                <h3>Quick Add Item</h3>
                <form id="quick-inventory-form" class="form-inline">
                    <div class="form-row compact">
                        <div class="form-group">
                            <input type="text" id="quick-name" placeholder="Item Name" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <select id="quick-category" required class="form-compact">
                                <option value="seeds">Seeds</option>
                                <option value="feed">Feed</option>
                                <option value="equipment">Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-quantity" placeholder="Qty" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Add</button>
                            <button type="button" class="btn btn-text btn-compact" id="show-detailed-form">
                                Detailed ➔
                            </button>
                        </div>
                    </div>
                </form>
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

            <!-- Inventory Modal -->
            <div id="inventory-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="inventory-modal-title">Add Inventory Item</h3>
                        <button class="btn-icon close-modal">&times;</button>
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
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-inventory">Save Item</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Inventory module initializing...');
        this.loadInventoryData();
        this.attachEventListeners();
        this.updateSummaryCards();
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

        grid.innerHTML = inventory.map(item => {
            const isLowStock = item.quantity <= item.minStock;
            const totalValue = (item.quantity * item.cost).toFixed(2);
            
            return `
                <div class="inventory-item ${isLowStock ? 'low-stock' : ''}" data-id="${item.id}">
                    <div class="inventory-item-header">
                        <h4 class="inventory-item-name">${this.escapeHtml(item.name)}</h4>
                        <span class="inventory-item-category">${this.formatCategory(item.category)}</span>
                    </div>
                    
                    <div class="inventory-item-details">
                        <div class="detail-item">
                            <label>Quantity</label>
                            <div class="value">${item.quantity} ${item.unit}</div>
                        </div>
                        <div class="detail-item">
                            <label>Value</label>
                            <div class="value">$${totalValue}</div>
                        </div>
                        <div class="detail-item">
                            <label>Location</label>
                            <div class="value">${item.location || 'Not specified'}</div>
                        </div>
                        <div class="detail-item">
                            <label>Status</label>
                            <div class="value ${isLowStock ? 'text-danger' : ''}">
                                ${isLowStock ? 'Low Stock' : 'In Stock'}
                            </div>
                        </div>
                    </div>

                    ${item.description ? `
                        <div class="inventory-item-description">
                            <label>Description:</label>
                            <p>${this.escapeHtml(item.description)}</p>
                        </div>
                    ` : ''}

                    <div class="inventory-item-actions">
                        <button class="btn btn-text btn-sm edit-inventory" data-id="${item.id}">Edit</button>
                        <button class="btn btn-primary btn-sm use-inventory" data-id="${item.id}">Use</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateSummaryCards: function() {
        const inventory = FarmModules.appData.inventory || [];

        const totalItems = inventory.length;
        const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

        this.updateElement('total-items-count', totalItems);
        this.updateElement('low-stock-count', lowStockCount);
        this.updateElement('total-inventory-value', this.formatCurrency(totalValue));
    },

    attachEventListeners: function() {
        // Quick form submission
        const quickForm = document.getElementById('quick-inventory-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickAdd();
            });
        }

        // Show detailed form
        const showDetailedBtn = document.getElementById('show-detailed-form');
        if (showDetailedBtn) {
            showDetailedBtn.addEventListener('click', () => {
                this.showInventoryModal();
            });
        }

        // Add inventory button
        const addInventoryBtn = document.getElementById('add-inventory-btn');
        if (addInventoryBtn) {
            addInventoryBtn.addEventListener('click', () => this.showInventoryModal());
        }

        // Modal events
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
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
            if (e.target.closest('.use-inventory')) {
                const itemId = e.target.closest('.use-inventory').dataset.id;
                this.useInventory(itemId);
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('inventory-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    },

    handleQuickAdd: function() {
        const name = document.getElementById('quick-name').value;
        const category = document.getElementById('quick-category').value;
        const quantity = parseInt(document.getElementById('quick-quantity').value);

        if (!name || !quantity) {
            this.showNotification('Please fill in name and quantity', 'error');
            return;
        }

        if (quantity < 0) {
            this.showNotification('Quantity must be 0 or greater', 'error');
            return;
        }

        const inventoryData = {
            name: name,
            category: category,
            quantity: quantity,
            unit: 'units',
            cost: 0,
            minStock: 10,
            description: 'Added via quick form',
            location: '',
            supplier: '',
            expiry: ''
        };

        this.addInventory(inventoryData);
        
        // Clear quick form
        document.getElementById('quick-name').value = '';
        document.getElementById('quick-quantity').value = '';
        
        this.showNotification('Item added successfully!', 'success');
    },

    showInventoryModal: function() {
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');
        const form = document.getElementById('inventory-form');

        if (modal && title && form) {
            // Reset form
            form.reset();
            document.getElementById('inventory-id').value = '';
            
            // Set today's date as default for expiry (optional)
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            document.getElementById('inventory-expiry').value = nextMonth.toISOString().split('T')[0];
            
            // Set default min stock
            document.getElementById('inventory-minstock').value = '10';
            
            // Show modal
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('inventory-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveInventory: function() {
        const form = document.getElementById('inventory-form');
        if (!form) return;

        const inventoryId = document.getElementById('inventory-id').value;
        const name = document.getElementById('inventory-name').value;
        const category = document.getElementById('inventory-category').value;
        const description = document.getElementById('inventory-description').value;
        const quantity = parseInt(document.getElementById('inventory-quantity').value);
        const unit = document.getElementById('inventory-unit').value;
        const cost = parseFloat(document.getElementById('inventory-cost').value) || 0;
        const minStock = parseInt(document.getElementById('inventory-minstock').value) || 0;
        const location = document.getElementById('inventory-location').value;
        const supplier = document.getElementById('inventory-supplier').value;
        const expiry = document.getElementById('inventory-expiry').value;

        // Validation
        if (!name || !category || quantity === undefined) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity < 0) {
            this.showNotification('Quantity must be 0 or greater', 'error');
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
            expiry: expiry
        };

        if (inventoryId) {
            // Update existing inventory
            this.updateInventory(inventoryId, inventoryData);
        } else {
            // Add new inventory
            this.addInventory(inventoryData);
        }

        this.hideModal();
    },

    addInventory: function(inventoryData) {
        if (!FarmModules.appData.inventory) {
            FarmModules.appData.inventory = [];
        }

        const newInventory = {
            id: 'inv-' + Date.now(),
            ...inventoryData,
            createdAt: new Date().toISOString()
        };

        FarmModules.appData.inventory.push(newInventory);
        
        this.loadInventoryData();
        this.updateSummaryCards();
        
        this.showNotification('Item added successfully!', 'success');
    },

    editInventory: function(inventoryId) {
        const inventory = FarmModules.appData.inventory || [];
        const item = inventory.find(i => i.id === inventoryId);
        
        if (!item) return;

        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');

        if (modal && title) {
            // Fill form with inventory data
            document.getElementById('inventory-id').value = item.id;
            document.getElementById('inventory-name').value = item.name || '';
            document.getElementById('inventory-category').value = item.category || '';
            document.getElementById('inventory-description').value = item.description || '';
            document.getElementById('inventory-quantity').value = item.quantity || '';
            document.getElementById('inventory-unit').value = item.unit || 'units';
            document.getElementById('inventory-cost').value = item.cost || '';
            document.getElementById('inventory-minstock').value = item.minStock || '10';
            document.getElementById('inventory-location').value = item.location || '';
            document.getElementById('inventory-supplier').value = item.supplier || '';
            document.getElementById('inventory-expiry').value = item.expiry || '';
            
            title.textContent = 'Edit Inventory Item';
            modal.classList.remove('hidden');
        }
    },

    updateInventory: function(inventoryId, inventoryData) {
        const inventory = FarmModules.appData.inventory || [];
        const index = inventory.findIndex(i => i.id === inventoryId);
        
        if (index !== -1) {
            inventory[index] = {
                ...inventory[index],
                ...inventoryData,
                updatedAt: new Date().toISOString()
            };
            
            this.loadInventoryData();
            this.updateSummaryCards();
            this.showNotification('Item updated successfully!', 'success');
        }
    },

    useInventory: function(inventoryId) {
        const inventory = FarmModules.appData.inventory || [];
        const item = inventory.find(i => i.id === inventoryId);
        
        if (!item) return;

        const quantity = prompt(`How many ${item.unit} of ${item.name} would you like to use?`, "1");
        if (quantity === null) return;

        const useQuantity = parseInt(quantity);
        if (isNaN(useQuantity) || useQuantity <= 0) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }

        if (useQuantity > item.quantity) {
            this.showNotification(`Not enough stock. Only ${item.quantity} ${item.unit} available.`, 'error');
            return;
        }

        // Update quantity
        item.quantity -= useQuantity;
        item.updatedAt = new Date().toISOString();
        
        this.loadInventoryData();
        this.updateSummaryCards();
        this.showNotification(`Used ${useQuantity} ${item.unit} of ${item.name}`, 'success');
    },

    formatCategory: function(category) {
        if (!category) return 'Uncategorized';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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

    escapeHtml: function(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        }
    }
});
