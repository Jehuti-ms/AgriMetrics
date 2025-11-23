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
                        <span>➕</span> Add Item
                    </button>
                </div>
            </div>

            <div class="inventory-summary">
                <div class="summary-card">
                    <div class="summary-icon">📦</div>
                    <div class="summary-content">
                        <h3>Total Items</h3>
                        <div class="summary-value" id="total-items-count">0</div>
                        <div class="summary-trend">Across all categories</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h3>Low Stock</h3>
                        <div class="summary-value" id="low-stock-count">0</div>
                        <div class="summary-trend">Need reordering</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Value</h3>
                        <div class="summary-value" id="total-inventory-value">$0.00</div>
                        <div class="summary-trend">Current stock value</div>
                    </div>
                </div>
            </div>

            <div class="inventory-grid" id="inventory-grid">
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                        <button class="btn btn-primary" id="add-first-item">Add First Item</button>
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
                        <button class="btn btn-primary" id="add-first-item">Add First Item</button>
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
                        <button class="btn-icon edit-item" title="Edit">✏️</button>
                        <button class="btn-icon delete-item" title="Delete">🗑️</button>
                    </div>
                </div>
                
                <div class="item-content">
                    <h4 class="item-name">${item.name || 'Unnamed Item'}</h4>
                    <p class="item-description">${item.description || 'No description'}</p>
                    
                    <div class="item-details">
                        <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">
                                <span class="quantity">${item.quantity || 0}</span>
                                <span class="unit">${item.unit || 'units'}</span>
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value location">${item.location || 'Not specified'}</span>
                        </div>
                        
                        ${item.cost ? `
                        <div class="detail-row">
                            <span class="detail-label">Unit Cost:</span>
                            <span class="detail-value cost">${this.formatCurrency(item.cost)}</span>
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
                    <div class="last-updated">
                        Updated: ${this.formatDate(item.lastUpdated || item.dateAdded)}
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
        // Add item buttons
        const addItemBtn = document.getElementById('add-inventory-item');
        const addFirstBtn = document.getElementById('add-first-item');

        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addSampleItem());
        }
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => this.addSampleItem());
        }
    },

    addSampleItem: function() {
        if (!FarmModules.appData.inventory) {
            FarmModules.appData.inventory = [];
        }

        const categories = ['seeds', 'feed', 'equipment', 'tools'];
        const names = {
            seeds: ['Corn Seeds', 'Wheat Seeds', 'Vegetable Seeds', 'Fruit Seeds'],
            feed: ['Animal Feed', 'Poultry Feed', 'Cattle Feed', 'Organic Feed'],
            equipment: ['Tractor Parts', 'Irrigation Kit', 'Fencing', 'Tools'],
            tools: ['Shovel', 'Rake', 'Pruner', 'Wheelbarrow']
        };

        const category = categories[Math.floor(Math.random() * categories.length)];
        const nameList = names[category];

        const newItem = {
            id: 'inv-' + Date.now(),
            name: nameList[Math.floor(Math.random() * nameList.length)],
            category: category,
            description: `High-quality ${category} for farm use`,
            quantity: Math.floor(Math.random() * 100) + 1,
            unit: category === 'seeds' ? 'kg' : category === 'feed' ? 'bags' : 'units',
            location: 'Storage Shed ' + (Math.floor(Math.random() * 3) + 1),
            cost: Math.floor(Math.random() * 100) + 10,
            minStock: 10,
            lastUpdated: new Date().toISOString(),
            dateAdded: new Date().toISOString()
        };

        FarmModules.appData.inventory.push(newItem);

        this.loadInventoryData();
        this.updateSummary();

        this.showNotification('Inventory item added successfully!', 'success');
    },

    // Utility functions
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
            equipment: '🚜',
            tools: '🛠️'
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
            return 'Recent';
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
