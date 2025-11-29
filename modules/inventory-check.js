// modules/inventory-check.js - UPDATED WITH SHARED DATA PATTERN
console.log('Loading inventory-check module...');

const InventoryCheckModule = {
    name: 'inventory-check',
    initialized: false,
    inventory: [],
    categories: ['feed', 'medical', 'packaging', 'equipment', 'cleaning', 'other'],

    initialize() {
        console.log('📦 Initializing inventory check...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        
        // Sync initial stats with dashboard
        this.syncStatsWithDashboard();
        
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-inventory');
        this.inventory = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { 
                id: 1, 
                name: 'Chicken Feed - Starter', 
                category: 'feed', 
                currentStock: 50, 
                unit: 'kg', 
                minStock: 20, 
                cost: 2.5,
                supplier: 'FeedCo',
                lastRestocked: '2024-03-10',
                notes: 'For chicks 0-3 weeks'
            },
            { 
                id: 2, 
                name: 'Egg Cartons - Large', 
                category: 'packaging', 
                currentStock: 200, 
                unit: 'pcs', 
                minStock: 50, 
                cost: 0.5,
                supplier: 'Packaging Inc',
                lastRestocked: '2024-03-12',
                notes: '30-dozen capacity'
            },
            { 
                id: 3, 
                name: 'Poultry Vaccines', 
                category: 'medical', 
                currentStock: 5, 
                unit: 'bottles', 
                minStock: 10, 
                cost: 15,
                supplier: 'VetSupply',
                lastRestocked: '2024-03-05',
                notes: 'Keep refrigerated'
            },
            { 
                id: 4, 
                name: 'Water Troughs', 
                category: 'equipment', 
                currentStock: 8, 
                unit: 'pcs', 
                minStock: 5, 
                cost: 25,
                supplier: 'FarmGear',
                lastRestocked: '2024-02-28',
                notes: '10L capacity'
            },
            { 
                id: 5, 
                name: 'Disinfectant Spray', 
                category: 'cleaning', 
                currentStock: 3, 
                unit: 'bottles', 
                minStock: 5, 
                cost: 8,
                supplier: 'CleanCo',
                lastRestocked: '2024-03-08',
                notes: 'For equipment cleaning'
            }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();
        const lowStockItems = this.getLowStockItems();

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
                        <div style="font-size: 24px; font-weight: bold; color: ${lowStockItems.length > 0 ? '#f59e0b' : '#22c55e'}; margin-bottom: 4px;">${lowStockItems.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Low Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalValue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Value</div>
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
                    <button class="quick-action-btn" id="low-stock-report-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Low Stock Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View items to reorder</span>
                    </button>
                    <button class="quick-action-btn" id="inventory-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Inventory Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Full inventory analysis</span>
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
                                    <input type="text" class="form-input" id="item-name" required placeholder="e.g., Chicken Feed - Starter">
                                </div>
                                <div>
                                    <label class="form-label">Category</label>
                                    <select class="form-input" id="item-category" required>
                                        <option value="">Select category</option>
                                        ${this.categories.map(cat => `
                                            <option value="${cat}">${this.formatCategory(cat)}</option>
                                        `).join('')}
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
                                    <input type="text" class="form-input" id="item-unit" required placeholder="e.g., kg, pcs, bottles">
                                </div>
                                <div>
                                    <label class="form-label">Min Stock Level</label>
                                    <input type="number" class="form-input" id="min-stock" min="0" required>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Cost per Unit ($)</label>
                                    <input type="number" class="form-input" id="item-cost" step="0.01" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Supplier</label>
                                    <input type="text" class="form-input" id="item-supplier" placeholder="Supplier name">
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" id="item-notes" rows="3" placeholder="Storage instructions, usage notes, etc."></textarea>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Item</button>
                                <button type="button" class="btn-outline" id="cancel-inventory-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Stock Update Form -->
                <div id="stock-update-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="stock-update-title">Update Stock Level</h3>
                        <form id="stock-update-form">
                            <input type="hidden" id="update-item-id">
                            <div style="margin-bottom: 16px;">
                                <div style="font-weight: 600; color: var(--text-primary); font-size: 18px;" id="update-item-name"></div>
                                <div style="font-size: 14px; color: var(--text-secondary);" id="update-item-details"></div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Current Stock</label>
                                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; font-weight: 600; color: var(--text-primary);" id="current-stock-display"></div>
                                </div>
                                <div>
                                    <label class="form-label">New Stock Level</label>
                                    <input type="number" class="form-input" id="new-stock-level" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Update Reason</label>
                                <select class="form-input" id="stock-update-reason" required>
                                    <option value="restock">Restock/New Delivery</option>
                                    <option value="usage">Daily Usage</option>
                                    <option value="damage">Damage/Loss</option>
                                    <option value="adjustment">Stock Adjustment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Update Stock</button>
                                <button type="button" class="btn-outline" id="cancel-stock-update">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Reports Modal -->
                <div id="reports-modal" class="modal hidden">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3 id="reports-modal-title">Inventory Report</h3>
                            <button class="btn-icon close-reports-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="reports-content" style="max-height: 400px; overflow-y: auto; padding: 10px;">
                                <!-- Report content will be inserted here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-outline close-reports-modal">Close</button>
                            <button type="button" class="btn-primary" id="print-report">Print Report</button>
                        </div>
                    </div>
                </div>

                <!-- Low Stock Alerts -->
                ${lowStockItems.length > 0 ? `
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">⚠️ Low Stock Alerts</h3>
                            <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
                                ${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            ${lowStockItems.map(item => `
                                <div style="padding: 12px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${item.name}</div>
                                    <div style="font-size: 14px; color: #92400e;">
                                        ${item.currentStock} ${item.unit} • Min: ${item.minStock} ${item.unit}
                                    </div>
                                    <button class="btn-outline restock-item" data-id="${item.id}" style="margin-top: 8px; padding: 4px 12px; font-size: 12px; width: 100%;">
                                        Restock Now
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Inventory List -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">All Inventory Items</h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" id="category-filter" style="width: auto;">
                                <option value="">All Categories</option>
                                ${this.categories.map(cat => `
                                    <option value="${cat}">${this.formatCategory(cat)}</option>
                                `).join('')}
                            </select>
                            <button class="btn-primary" id="show-add-form">Add Item</button>
                        </div>
                    </div>
                    <div id="inventory-list">
                        ${this.renderInventoryList()}
                    </div>
                </div>

                <!-- Category Summary -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Inventory by Category</h3>
                    <div id="category-summary">
                        ${this.renderCategorySummary()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // KEEP ALL THE EXISTING METHODS EXACTLY AS THEY WERE WORKING
    calculateStats() {
        const totalItems = this.inventory.length;
        const inStock = this.inventory.filter(item => item.currentStock > 0).length;
        const totalValue = this.inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
        const lowStockItems = this.getLowStockItems().length;
        const outOfStockItems = this.getOutOfStockItems().length;
        
        return { totalItems, inStock, totalValue, lowStockItems, outOfStockItems };
    },

    getLowStockItems() {
        return this.inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0);
    },

    getOutOfStockItems() {
        return this.inventory.filter(item => item.currentStock === 0);
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
                    const totalValue = item.currentStock * item.cost;
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 20px;">${this.getCategoryIcon(item.category)}</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${this.formatCategory(item.category)} • ${item.supplier || 'No supplier'}
                                        ${item.lastRestocked ? ` • Last: ${item.lastRestocked}` : ''}
                                    </div>
                                    ${item.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${item.notes}</div>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="text-align: right;">
                                    <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                                        ${item.currentStock} ${item.unit}
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        Min: ${item.minStock} ${item.unit} • ${this.formatCurrency(totalValue)}
                                    </div>
                                </div>
                                <div style="padding: 4px 12px; border-radius: 12px; background: ${statusColor}20; color: ${statusColor}; font-size: 12px; font-weight: 600;">
                                    ${status} Stock
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-icon update-stock" data-id="${item.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Update Stock">
                                        ✏️
                                    </button>
                                    <button class="btn-icon delete-item" data-id="${item.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Delete Item">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderCategorySummary() {
        const categoryData = {};
        this.categories.forEach(cat => {
            categoryData[cat] = {
                count: 0,
                totalValue: 0,
                lowStock: 0
            };
        });

        this.inventory.forEach(item => {
            if (categoryData[item.category]) {
                categoryData[item.category].count++;
                categoryData[item.category].totalValue += item.currentStock * item.cost;
                if (item.currentStock <= item.minStock) {
                    categoryData[item.category].lowStock++;
                }
            }
        });

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                ${this.categories.map(cat => {
                    const data = categoryData[cat];
                    return `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 20px;">${this.getCategoryIcon(cat)}</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(cat)}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Items:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${data.count}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Value:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(data.totalValue)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Low Stock:</span>
                                <span style="font-weight: 600; color: ${data.lowStock > 0 ? '#f59e0b' : '#22c55e'};">${data.lowStock}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getStockStatus(item) {
        if (item.currentStock === 0) return 'Out of Stock';
        if (item.currentStock <= item.minStock) return 'Low';
        return 'Adequate';
    },

    getCategoryIcon(category) {
        const icons = {
            'feed': '🌾',
            'medical': '💊',
            'packaging': '📦',
            'equipment': '🔧',
            'cleaning': '🧼',
            'other': '📋'
        };
        return icons[category] || '📦';
    },

    formatCategory(category) {
        const categories = {
            'feed': 'Feed',
            'medical': 'Medical',
            'packaging': 'Packaging',
            'equipment': 'Equipment',
            'cleaning': 'Cleaning',
            'other': 'Other'
        };
        return categories[category] || category;
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-add-form')?.addEventListener('click', () => this.showInventoryForm());
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.showInventoryForm());
        document.getElementById('stock-check-btn')?.addEventListener('click', () => this.showStockCheck());
        document.getElementById('low-stock-report-btn')?.addEventListener('click', () => this.generateLowStockReport());
        document.getElementById('inventory-report-btn')?.addEventListener('click', () => this.generateInventoryReport());
        
        // Form handlers
        document.getElementById('inventory-form')?.addEventListener('submit', (e) => this.handleInventorySubmit(e));
        document.getElementById('stock-update-form')?.addEventListener('submit', (e) => this.handleStockUpdate(e));
        document.getElementById('cancel-inventory-form')?.addEventListener('click', () => this.hideInventoryForm());
        document.getElementById('cancel-stock-update')?.addEventListener('click', () => this.hideStockUpdate());
        
        // Report modal handlers
        document.querySelectorAll('.close-reports-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideReportsModal());
        });
        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());
        
        // Category filter
        document.getElementById('category-filter')?.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        
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
            if (e.target.closest('.restock-item')) {
                const id = parseInt(e.target.closest('.restock-item').dataset.id);
                this.quickRestock(id);
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

    showUpdateStockForm(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        document.getElementById('stock-update-container').classList.remove('hidden');
        document.getElementById('update-item-id').value = item.id;
        document.getElementById('update-item-name').textContent = item.name;
        document.getElementById('update-item-details').textContent = `${this.formatCategory(item.category)} • ${item.supplier || 'No supplier'}`;
        document.getElementById('current-stock-display').textContent = `${item.currentStock} ${item.unit}`;
        document.getElementById('new-stock-level').value = item.currentStock;
        document.getElementById('stock-update-form').reset();
        
        document.getElementById('stock-update-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideStockUpdate() {
        document.getElementById('stock-update-container').classList.add('hidden');
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
            cost: parseFloat(document.getElementById('item-cost').value),
            supplier: document.getElementById('item-supplier').value || '',
            lastRestocked: new Date().toISOString().split('T')[0],
            notes: document.getElementById('item-notes').value || ''
        };

        this.inventory.unshift(formData);
        this.saveData();
        this.renderModule();
        
        // SYNC WITH DASHBOARD - Update inventory stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'item_added',
            item: formData
        });
        
        if (window.coreModule) {
            window.coreModule.showNotification('Inventory item added successfully!', 'success');
        }
    },

    handleStockUpdate(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('update-item-id').value);
        const newStock = parseInt(document.getElementById('new-stock-level').value);
        const reason = document.getElementById('stock-update-reason').value;

        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        const oldStock = item.currentStock;
        item.currentStock = newStock;
        
        if (reason === 'restock') {
            item.lastRestocked = new Date().toISOString().split('T')[0];
        }

        this.saveData();
        this.renderModule();
        
        // SYNC WITH DASHBOARD - Update stats after stock change
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'stock_updated',
            item: item,
            oldStock: oldStock,
            newStock: newStock,
            reason: reason
        });
        
        if (window.coreModule) {
            const change = newStock - oldStock;
            const changeText = change > 0 ? `+${change}` : change;
            window.coreModule.showNotification(`Stock updated: ${changeText} ${item.unit} (${reason})`, 'success');
        }
    },

    deleteItem(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderModule();
            
            // SYNC WITH DASHBOARD - Update stats after deletion
            this.syncStatsWithDashboard();
            
            // Add recent activity
            this.addRecentActivity({
                type: 'item_deleted',
                item: item
            });
            
            if (window.coreModule) {
                window.coreModule.showNotification('Item deleted successfully!', 'success');
            }
        }
    },

    quickRestock(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        const suggestedRestock = Math.max(item.minStock * 2, item.currentStock + 10);
        const restockAmount = prompt(`Restock "${item.name}"\nCurrent: ${item.currentStock} ${item.unit}\nMin: ${item.minStock} ${item.unit}\nEnter amount to add:`, suggestedRestock.toString());
        
        if (restockAmount !== null && !isNaN(restockAmount)) {
            const amount = parseInt(restockAmount);
            const oldStock = item.currentStock;
            item.currentStock += amount;
            item.lastRestocked = new Date().toISOString().split('T')[0];
            
            this.saveData();
            this.renderModule();
            
            // SYNC WITH DASHBOARD - Update stats after restock
            this.syncStatsWithDashboard();
            
            // Add recent activity
            this.addRecentActivity({
                type: 'restocked',
                item: item,
                amount: amount
            });
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Restocked ${amount} ${item.unit} of ${item.name}`, 'success');
            }
        }
    },

    filterByCategory(category) {
        const items = document.querySelectorAll('#inventory-list > div > div');
        items.forEach(item => {
            const itemCategory = item.querySelector('div > div:nth-child(2) > div:nth-child(2)')?.textContent;
            if (!category || (itemCategory && itemCategory.includes(this.formatCategory(category)))) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    // KEEP ALL THE MODAL REPORT METHODS EXACTLY AS THEY WERE
    showStockCheck() {
        // ... (keep all the existing showStockCheck code exactly as is)
    },

    generateLowStockReport() {
        // ... (keep all the existing generateLowStockReport code exactly as is)
    },

    generateInventoryReport() {
        // ... (keep all the existing generateInventoryReport code exactly as is)
    },

    showReportsModal(title, content) {
        // ... (keep all the existing showReportsModal code exactly as is)
    },

    hideReportsModal() {
        // ... (keep all the existing hideReportsModal code exactly as is)
    },

    printReport() {
        // ... (keep all the existing printReport code exactly as is)
    },

    // UPDATED METHOD: Sync inventory stats with dashboard (no ProfileModule dependency)
    syncStatsWithDashboard() {
        const stats = this.calculateStats();
        
        // Update shared data structure
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            // Update inventory stats in shared data
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalInventoryItems: stats.totalItems,
                inventoryValue: stats.totalValue
            });
        }
        
        // Notify dashboard module if available
        if (window.FarmModules && window.FarmModules.modules.dashboard) {
            window.FarmModules.modules.dashboard.updateDashboardStats({
                totalInventoryItems: stats.totalItems,
                inventoryValue: stats.totalValue
            });
        }
    },

    // NEW METHOD: Add recent activity to dashboard
    addRecentActivity(activityData) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        switch (activityData.type) {
            case 'item_added':
                activity = {
                    type: 'inventory_item_added',
                    message: `Added: ${activityData.item.name}`,
                    icon: '📦'
                };
                break;
            case 'stock_updated':
                const change = activityData.newStock - activityData.oldStock;
                const changeText = change > 0 ? `+${change}` : change;
                activity = {
                    type: 'stock_updated',
                    message: `Stock ${changeText} ${activityData.item.unit}: ${activityData.item.name}`,
                    icon: '✏️'
                };
                break;
            case 'item_deleted':
                activity = {
                    type: 'inventory_item_deleted',
                    message: `Deleted: ${activityData.item.name}`,
                    icon: '🗑️'
                };
                break;
            case 'restocked':
                activity = {
                    type: 'inventory_restocked',
                    message: `Restocked +${activityData.amount} ${activityData.item.unit}: ${activityData.item.name}`,
                    icon: '📈'
                };
                break;
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    // NEW METHOD: Get inventory summary for other modules
    getInventorySummary() {
        const stats = this.calculateStats();
        return {
            ...stats,
            lowStockItems: this.getLowStockItems(),
            outOfStockItems: this.getOutOfStockItems(),
            categories: this.categories.map(cat => {
                const items = this.inventory.filter(item => item.category === cat);
                return {
                    name: cat,
                    count: items.length,
                    value: items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0)
                };
            })
        };
    },

    // NEW METHOD: Check if specific item is low stock
    isLowStock(itemId) {
        const item = this.inventory.find(item => item.id === itemId);
        return item ? item.currentStock <= item.minStock : false;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    saveData() {
        localStorage.setItem('farm-inventory', JSON.stringify(this.inventory));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('inventory-check', InventoryCheckModule);
    console.log('✅ Inventory Check module registered');
}
