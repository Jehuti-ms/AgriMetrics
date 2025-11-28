// modules/inventory-check.js - FULLY WORKING
console.log('Loading inventory-check module...');

const InventoryCheckModule = {
    name: 'inventory-check',
    initialized: false,
    inventory: [],

    initialize() {
        console.log('📦 Initializing inventory check...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-inventory');
        this.inventory = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { id: 1, name: 'Chicken Feed', category: 'feed', currentStock: 50, unit: 'kg', minStock: 20, cost: 25 },
            { id: 2, name: 'Egg Cartons', category: 'packaging', currentStock: 200, unit: 'pcs', minStock: 50, cost: 0.5 },
            { id: 3, name: 'Vaccines', category: 'medical', currentStock: 5, unit: 'bottles', minStock: 10, cost: 15 }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Inventory Check</h1>
                    <p class="module-subtitle">Manage your farm inventory</p>
                </div>

                <!-- Inventory Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalItems}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Items</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.inStock}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">In Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.lowStock}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Low Stock</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-item-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Item</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new inventory item</span>
                    </button>
                    <button class="quick-action-btn" id="stock-check-btn">
                        <div style="font-size: 32px;">🔍</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Stock Check</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Update stock levels</span>
                    </button>
                </div>

                <!-- Add Item Form -->
                <div id="inventory-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add Inventory Item</h3>
                        <form id="inventory-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Item Name</label>
                                    <input type="text" class="form-input" id="item-name" required>
                                </div>
                                <div>
                                    <label class="form-label">Category</label>
                                    <select class="form-input" id="item-category" required>
                                        <option value="feed">Feed</option>
                                        <option value="medical">Medical</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Current Stock</label>
                                    <input type="number" class="form-input" id="current-stock" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-input" id="item-unit" required>
                                </div>
                                <div>
                                    <label class="form-label">Min Stock Level</label>
                                    <input type="number" class="form-input" id="min-stock" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Cost per Unit ($)</label>
                                <input type="number" class="form-input" id="item-cost" step="0.01" min="0" required>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Item</button>
                                <button type="button" class="btn-outline" id="cancel-inventory-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Inventory List -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Inventory Items</h3>
                        <button class="btn-primary" id="show-add-form">Add Item</button>
                    </div>
                    <div id="inventory-list">
                        ${this.renderInventoryList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalItems = this.inventory.length;
        const inStock = this.inventory.filter(item => item.currentStock > 0).length;
        const lowStock = this.inventory.filter(item => item.currentStock <= item.minStock).length;
        
        return { totalItems, inStock, lowStock };
    },

    renderInventoryList() {
        if (this.inventory.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No inventory items</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add your first inventory item to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.inventory.map(item => {
                    const status = this.getStockStatus(item);
                    const statusColor = status === 'Adequate' ? '#22c55e' : status === 'Low' ? '#f59e0b' : '#ef4444';
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 20px;">${this.getCategoryIcon(item.category)}</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${item.currentStock} ${item.unit} • $${item.cost}/${item.unit}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="padding: 4px 12px; border-radius: 12px; background: ${statusColor}20; color: ${statusColor}; font-size: 12px; font-weight: 600;">
                                    ${status} Stock
                                </div>
                                <button class="btn-icon update-stock" data-id="${item.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);">
                                    ✏️
                                </button>
                                <button class="btn-icon delete-item" data-id="${item.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getStockStatus(item) {
        if (item.currentStock === 0) return 'Out';
        if (item.currentStock <= item.minStock) return 'Low';
        return 'Adequate';
    },

    getCategoryIcon(category) {
        const icons = {
            'feed': '🌾',
            'medical': '💊',
            'packaging': '📦',
            'equipment': '🔧',
            'other': '📋'
        };
        return icons[category] || '📦';
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-add-form')?.addEventListener('click', () => this.showInventoryForm());
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.showInventoryForm());
        document.getElementById('stock-check-btn')?.addEventListener('click', () => this.showStockCheck());
        
        // Form handlers
        document.getElementById('inventory-form')?.addEventListener('submit', (e) => this.handleInventorySubmit(e));
        document.getElementById('cancel-inventory-form')?.addEventListener('click', () => this.hideInventoryForm());
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-item')) {
                const id = parseInt(e.target.closest('.delete-item').dataset.id);
                this.deleteItem(id);
            }
            if (e.target.closest('.update-stock')) {
                const id = parseInt(e.target.closest('.update-stock').dataset.id);
                this.showUpdateStockForm(id);
            }
        });

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    showInventoryForm() {
        document.getElementById('inventory-form-container').classList.remove('hidden');
        document.getElementById('inventory-form').reset();
        document.getElementById('inventory-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideInventoryForm() {
        document.getElementById('inventory-form-container').classList.add('hidden');
    },

    handleInventorySubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            currentStock: parseInt(document.getElementById('current-stock').value),
            unit: document.getElementById('item-unit').value,
            minStock: parseInt(document.getElementById('min-stock').value),
            cost: parseFloat(document.getElementById('item-cost').value)
        };

        this.inventory.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Inventory item added successfully!', 'success');
        }
    },

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Item deleted!', 'success');
            }
        }
    },

    showUpdateStockForm(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        const newStock = prompt(`Update stock for ${item.name}\nCurrent: ${item.currentStock} ${item.unit}\nEnter new quantity:`, item.currentStock);
        
        if (newStock !== null && !isNaN(newStock)) {
            item.currentStock = parseInt(newStock);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Stock updated!', 'success');
            }
        }
    },

    showStockCheck() {
        let report = 'Stock Check Report:\n\n';
        this.inventory.forEach(item => {
            const status = this.getStockStatus(item);
            report += `${item.name}: ${item.currentStock} ${item.unit} (${status})\n`;
        });
        
        alert(report);
    },

    saveData() {
        localStorage.setItem('farm-inventory', JSON.stringify(this.inventory));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('inventory-check', InventoryCheckModule);
}
