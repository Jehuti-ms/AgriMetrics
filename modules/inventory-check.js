// modules/inventory-check.js - PWA Style
console.log('Loading inventory-check module...');

class InventoryCheckModule {
    constructor() {
        this.moduleId = 'inventory-check';
        this.moduleName = 'Inventory';
        this.inventory = [];
        this.filter = 'all';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }

    init() {
        console.log('📦 Initializing inventory module...');
        this.loadInventory();
        return true;
    }

    render(container) {
        console.log('🎨 Rendering inventory...');
        
        container.innerHTML = this.getModuleHTML();
        this.attachEventListeners();
        this.renderInventory();
        this.updateInventorySummary();
        
        this.animateContent();
    }

    getModuleHTML() {
        return `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1>Inventory Management</h1>
                        <p>Track your farm supplies and stock levels</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-item-btn">
                            <span class="icon">➕</span>
                            Add Item
                        </button>
                        <button class="btn btn-secondary" id="quick-count-btn">
                            <span class="icon">🔢</span>
                            Quick Count
                        </button>
                    </div>
                </div>

                <!-- Inventory Summary -->
                <div class="inventory-summary">
                    <div class="summary-card">
                        <div class="summary-icon">📦</div>
                        <div class="summary-content">
                            <div class="summary-label">Total Items</div>
                            <div class="summary-value" id="total-items">0</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">⚠️</div>
                        <div class="summary-content">
                            <div class="summary-label">Low Stock</div>
                            <div class="summary-value" id="low-stock-items">0</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">💰</div>
                        <div class="summary-content">
                            <div class="summary-label">Total Value</div>
                            <div class="summary-value" id="total-value">$0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Inventory Controls -->
                <div class="inventory-controls">
                    <div class="search-box">
                        <span class="icon">🔍</span>
                        <input type="text" id="search-inventory" placeholder="Search inventory...">
                    </div>
                    <div class="control-group">
                        <select id="category-filter">
                            <option value="all">All Categories</option>
                            <option value="feed">Feed</option>
                            <option value="medicine">Medicine</option>
                            <option value="equipment">Equipment</option>
                            <option value="supplies">Supplies</option>
                            <option value="other">Other</option>
                        </select>
                        <select id="sort-by">
                            <option value="name">Sort by Name</option>
                            <option value="quantity">Sort by Quantity</option>
                            <option value="category">Sort by Category</option>
                            <option value="lastUpdated">Sort by Date</option>
                        </select>
                        <button class="btn-text" id="toggle-sort-order">
                            <span class="icon" id="sort-icon">⬆️</span>
                        </button>
                    </div>
                </div>

                <!-- Inventory Grid -->
                <div class="inventory-grid" id="inventory-grid">
                    <div class="empty-state">
                        <div class="icon">📦</div>
                        <div>No inventory items yet</div>
                        <div class="subtext">Add your first inventory item to get started</div>
                    </div>
                </div>

                <!-- Low Stock Alert -->
                <div class="alert-banner hidden" id="low-stock-alert">
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-content">
                        <strong>Low Stock Alert</strong>
                        <span id="low-stock-count">0 items</span> are running low
                    </div>
                    <button class="btn-text" id="view-low-stock">View Items</button>
                </div>
            </div>

            <!-- Add/Edit Item Modal -->
            <div class="modal-overlay hidden" id="inventory-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="inventory-modal-title">Add Inventory Item</h3>
                        <button class="modal-close" id="inventory-modal-close">×</button>
                    </div>
                    <form class="modal-form" id="inventory-form">
                        <input type="hidden" id="item-id">
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Item Name</label>
                                <input type="text" id="item-name" required 
                                       placeholder="e.g., Chicken Feed, Vaccines">
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select id="item-category" required>
                                    <option value="">Select Category</option>
                                    <option value="feed">Feed</option>
                                    <option value="medicine">Medicine & Vaccines</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="supplies">Supplies</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Current Quantity</label>
                                <input type="number" id="item-quantity" required 
                                       min="0" step="1" placeholder="0">
                            </div>
                            <div class="form-group">
                                <label>Unit</label>
                                <select id="item-unit" required>
                                    <option value="bags">Bags</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="liters">Liters</option>
                                    <option value="units">Units</option>
                                    <option value="bottles">Bottles</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Low Stock Threshold</label>
                                <input type="number" id="item-threshold" required 
                                       min="1" step="1" placeholder="10">
                            </div>
                            <div class="form-group">
                                <label>Unit Cost ($)</label>
                                <input type="number" id="item-cost" step="0.01" 
                                       min="0" placeholder="0.00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Supplier (Optional)</label>
                            <input type="text" id="item-supplier" 
                                   placeholder="e.g., Farm Supplies Inc.">
                        </div>

                        <div class="form-group">
                            <label>Notes (Optional)</label>
                            <textarea id="item-notes" rows="3" 
                                      placeholder="Additional notes about this item"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="inventory-cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <span class="icon">💾</span>
                                Save Item
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Quick Count Modal -->
            <div class="modal-overlay hidden" id="quick-count-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Quick Stock Count</h3>
                        <button class="modal-close" id="quick-count-close">×</button>
                    </div>
                    <div class="modal-form">
                        <div class="quick-count-list" id="quick-count-list">
                            <!-- Items will be populated here -->
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="quick-count-cancel">
                                Cancel
                            </button>
                            <button type="button" class="btn btn-primary" id="save-quick-count">
                                <span class="icon">💾</span>
                                Save Counts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Action buttons
        document.getElementById('add-item-btn').addEventListener('click', () => {
            this.showInventoryModal();
        });

        document.getElementById('quick-count-btn').addEventListener('click', () => {
            this.showQuickCountModal();
        });

        // Search and filters
        document.getElementById('search-inventory').addEventListener('input', (e) => {
            this.searchInventory(e.target.value);
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderInventory();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderInventory();
        });

        document.getElementById('toggle-sort-order').addEventListener('click', () => {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            this.updateSortIcon();
            this.renderInventory();
        });

        // Low stock alert
        document.getElementById('view-low-stock').addEventListener('click', () => {
            this.filter = 'low-stock';
            document.getElementById('category-filter').value = 'all';
            this.renderInventory();
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Inventory modal
        const modal = document.getElementById('inventory-modal');
        const form = document.getElementById('inventory-form');
        const closeBtn = document.getElementById('inventory-modal-close');
        const cancelBtn = document.getElementById('inventory-cancel-btn');

        closeBtn.addEventListener('click', () => this.hideInventoryModal());
        cancelBtn.addEventListener('click', () => this.hideInventoryModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideInventoryModal();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveInventoryItem();
        });

        // Quick count modal
        const quickCountModal = document.getElementById('quick-count-modal');
        const quickCountClose = document.getElementById('quick-count-close');
        const quickCountCancel = document.getElementById('quick-count-cancel');
        const saveQuickCount = document.getElementById('save-quick-count');

        quickCountClose.addEventListener('click', () => this.hideQuickCountModal());
        quickCountCancel.addEventListener('click', () => this.hideQuickCountModal());
        quickCountModal.addEventListener('click', (e) => {
            if (e.target === quickCountModal) this.hideQuickCountModal();
        });

        saveQuickCount.addEventListener('click', () => this.saveQuickCount());
    }

    showInventoryModal(item = null) {
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');
        const form = document.getElementById('inventory-form');

        this.editingItem = item;

        if (item) {
            title.textContent = 'Edit Inventory Item';
            this.populateItemForm(item);
        } else {
            title.textContent = 'Add Inventory Item';
            form.reset();
            // Set default threshold
            document.getElementById('item-threshold').value = 10;
        }

        modal.classList.remove('hidden');
        document.getElementById('item-name').focus();
    }

    populateItemForm(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name || '';
        document.getElementById('item-category').value = item.category || '';
        document.getElementById('item-quantity').value = item.quantity || 0;
        document.getElementById('item-unit').value = item.unit || 'units';
        document.getElementById('item-threshold').value = item.lowStockThreshold || 10;
        document.getElementById('item-cost').value = item.unitCost || '';
        document.getElementById('item-supplier').value = item.supplier || '';
        document.getElementById('item-notes').value = item.notes || '';
    }

    hideInventoryModal() {
        document.getElementById('inventory-modal').classList.add('hidden');
        this.editingItem = null;
    }

    saveInventoryItem() {
        const formData = new FormData(document.getElementById('inventory-form'));
        const item = {
            id: this.editingItem ? this.editingItem.id : this.generateId(),
            name: formData.get('item-name'),
            category: formData.get('item-category'),
            quantity: parseInt(formData.get('item-quantity')),
            unit: formData.get('item-unit'),
            lowStockThreshold: parseInt(formData.get('item-threshold')),
            unitCost: parseFloat(formData.get('item-cost')) || 0,
            supplier: formData.get('item-supplier'),
            notes: formData.get('item-notes'),
            lastUpdated: new Date().toISOString(),
            createdAt: this.editingItem ? this.editingItem.createdAt : new Date().toISOString()
        };

        if (this.editingItem) {
            // Update existing item
            const index = this.inventory.findIndex(i => i.id === this.editingItem.id);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventory[index], ...item };
            }
        } else {
            // Add new item
            this.inventory.unshift(item);
        }

        this.saveInventory();
        this.renderInventory();
        this.updateInventorySummary();
        this.hideInventoryModal();

        this.showNotification(
            `Item ${this.editingItem ? 'updated' : 'added'} successfully`,
            'success'
        );
    }

    deleteInventoryItem(id) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveInventory();
            this.renderInventory();
            this.updateInventorySummary();
            this.showNotification('Item deleted', 'success');
        }
    }

    adjustQuantity(id, change) {
        const item = this.inventory.find(i => i.id === id);
        if (item) {
            const newQuantity = Math.max(0, item.quantity + change);
            item.quantity = newQuantity;
            item.lastUpdated = new Date().toISOString();
            
            this.saveInventory();
            this.renderInventory();
            this.updateInventorySummary();
            
            this.showNotification(
                `Quantity updated to ${newQuantity}`,
                'success'
            );
        }
    }

    renderInventory() {
        const container = document.getElementById('inventory-grid');
        if (!container) return;

        let filteredItems = this.inventory;

        // Apply category filter
        if (this.filter !== 'all') {
            if (this.filter === 'low-stock') {
                filteredItems = filteredItems.filter(item => 
                    item.quantity <= item.lowStockThreshold
                );
            } else {
                filteredItems = filteredItems.filter(item => item.category === this.filter);
            }
        }

        // Apply search
        if (this.currentSearch) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(this.currentSearch) ||
                item.supplier?.toLowerCase().includes(this.currentSearch) ||
                item.notes?.toLowerCase().includes(this.currentSearch)
            );
        }

        // Sort items
        filteredItems.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];
            
            if (this.sortBy === 'name') {
                aValue = aValue?.toLowerCase();
                bValue = bValue?.toLowerCase();
            }
            
            if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        if (filteredItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <div>No items found</div>
                    <div class="subtext">${this.currentSearch ? 'Try a different search' : 'Add your first item'}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredItems.map(item => `
            <div class="inventory-card ${item.quantity <= item.lowStockThreshold ? 'low-stock' : ''}" 
                 data-id="${item.id}">
                <div class="card-header">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-actions">
                        <button class="btn-icon edit-item" title="Edit">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="btn-icon delete-item" title="Delete">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="item-details">
                        <div class="detail-row">
                            <span class="label">Category:</span>
                            <span class="value">${this.formatCategory(item.category)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Supplier:</span>
                            <span class="value">${item.supplier || 'Not specified'}</span>
                        </div>
                        ${item.notes ? `
                        <div class="detail-row">
                            <span class="label">Notes:</span>
                            <span class="value">${item.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="quantity-section">
                        <div class="quantity-display">
                            <div class="quantity-value ${item.quantity <= item.lowStockThreshold ? 'low' : ''}">
                                ${item.quantity} ${item.unit}
                            </div>
                            <div class="quantity-label">
                                ${item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                            </div>
                        </div>
                        <div class="quantity-controls">
                            <button class="btn-icon quantity-btn decrease" title="Decrease">
                                <span class="icon">➖</span>
                            </button>
                            <button class="btn-icon quantity-btn increase" title="Increase">
                                <span class="icon">➕</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="item-meta">
                        <span class="last-updated">
                            Updated: ${this.formatDate(item.lastUpdated)}
                        </span>
                        ${item.unitCost > 0 ? `
                        <span class="item-value">
                            Value: $${(item.quantity * item.unitCost).toFixed(2)}
                        </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.inventory-card').dataset.id;
                const item = this.inventory.find(i => i.id === itemId);
                if (item) this.showInventoryModal(item);
            });
        });

        container.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.inventory-card').dataset.id;
                this.deleteInventoryItem(itemId);
            });
        });

        container.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.inventory-card').dataset.id;
                this.adjustQuantity(itemId, -1);
            });
        });

        container.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.inventory-card').dataset.id;
                this.adjustQuantity(itemId, 1);
            });
        });
    }

    showQuickCountModal() {
        const modal = document.getElementById('quick-count-modal');
        const list = document.getElementById('quick-count-list');
        
        list.innerHTML = this.inventory.map(item => `
            <div class="quick-count-item">
                <div class="count-item-info">
                    <div class="count-item-name">${item.name}</div>
                    <div class="count-item-details">
                        ${this.formatCategory(item.category)} • Current: ${item.quantity} ${item.unit}
                    </div>
                </div>
                <div class="count-input-group">
                    <button class="count-btn decrease-count">-</button>
                    <input type="number" class="count-input" data-id="${item.id}" 
                           value="${item.quantity}" min="0">
                    <button class="count-btn increase-count">+</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for count buttons
        list.querySelectorAll('.decrease-count').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.nextElementSibling;
                input.value = Math.max(0, parseInt(input.value) - 1);
            });
        });

        list.querySelectorAll('.increase-count').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                input.value = parseInt(input.value) + 1;
            });
        });

        modal.classList.remove('hidden');
    }

    hideQuickCountModal() {
        document.getElementById('quick-count-modal').classList.add('hidden');
    }

    saveQuickCount() {
        const inputs = document.querySelectorAll('.count-input');
        let updatedCount = 0;

        inputs.forEach(input => {
            const itemId = input.dataset.id;
            const newQuantity = parseInt(input.value);
            const item = this.inventory.find(i => i.id === itemId);
            
            if (item && item.quantity !== newQuantity) {
                item.quantity = newQuantity;
                item.lastUpdated = new Date().toISOString();
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            this.saveInventory();
            this.renderInventory();
            this.updateInventorySummary();
            this.showNotification(`${updatedCount} items updated`, 'success');
        }

        this.hideQuickCountModal();
    }

    updateInventorySummary() {
        const totalItems = this.inventory.length;
        const lowStockItems = this.inventory.filter(item => 
            item.quantity <= item.lowStockThreshold
        ).length;
        
        const totalValue = this.inventory.reduce((sum, item) => {
            return sum + (item.quantity * (item.unitCost || 0));
        }, 0);

        this.updateElement('total-items', totalItems.toString());
        this.updateElement('low-stock-items', lowStockItems.toString());
        this.updateElement('total-value', `$${totalValue.toFixed(2)}`);

        // Show/hide low stock alert
        const alert = document.getElementById('low-stock-alert');
        const countElement = document.getElementById('low-stock-count');
        
        if (lowStockItems > 0) {
            alert.classList.remove('hidden');
            countElement.textContent = `${lowStockItems} items`;
        } else {
            alert.classList.add('hidden');
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateSortIcon() {
        const icon = document.getElementById('sort-icon');
        if (icon) {
            icon.textContent = this.sortOrder === 'asc' ? '⬆️' : '⬇️';
        }
    }

    searchInventory(query) {
        this.currentSearch = query.toLowerCase();
        this.renderInventory();
    }

    loadInventory() {
        const savedData = window.FarmModules?.appData?.inventory;
        if (savedData && Array.isArray(savedData)) {
            this.inventory = savedData;
        } else {
            try {
                const localData = localStorage.getItem('farm-inventory');
                if (localData) {
                    this.inventory = JSON.parse(localData);
                }
            } catch (error) {
                console.error('Error loading inventory:', error);
            }
        }
    }

    saveInventory() {
        if (window.FarmModules) {
            window.FarmModules.appData.inventory = this.inventory;
            window.FarmModules.saveDataToStorage();
        }
        
        try {
            localStorage.setItem('farm-inventory', JSON.stringify(this.inventory));
        } catch (error) {
            console.error('Error saving inventory:', error);
        }
    }

    formatCategory(category) {
        const categories = {
            'feed': 'Feed',
            'medicine': 'Medicine & Vaccines',
            'equipment': 'Equipment',
            'supplies': 'Supplies',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    animateContent() {
        const cards = document.querySelectorAll('.inventory-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('animate-in');
        });
    }

    showNotification(message, type = 'info') {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Register the module
const inventoryModule = new InventoryCheckModule();
window.FarmModules.registerModule('inventory-check', inventoryModule);
window.InventoryCheckModule = inventoryModule;

console.log('✅ Inventory Check module registered');
