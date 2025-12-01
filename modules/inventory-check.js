// modules/inventory-check.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('Loading inventory-check module...');

const InventoryCheckModule = {
    name: 'inventory-check',
    initialized: false,
    inventory: [],
    categories: ['feed', 'medical', 'packaging', 'equipment', 'cleaning', 'other'],
    element: null,

    initialize() {
        console.log('📦 Initializing Inventory Check...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        // Sync initial stats with profile
        this.syncStatsWithProfile();
        
        console.log('✅ Inventory Check initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Inventory Check updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
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
        if (!this.element) return;

        const stats = this.calculateStats();
        const lowStockItems = this.getLowStockItems();

        this.element.innerHTML = `
         <div id="inventory-check" class="module-container">
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

            <!-- POPOUT MODALS - Added at the end to overlay content -->
            <!-- Inventory Report Popout Modal -->
            <div id="inventory-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="inventory-report-title">Inventory Report</h3>
                        <button class="popout-modal-close" id="close-inventory-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="inventory-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-inventory-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-inventory-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Low Stock Report Popout Modal -->
            <div id="low-stock-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="low-stock-report-title">Low Stock Report</h3>
                        <button class="popout-modal-close" id="close-low-stock-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="low-stock-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-low-stock-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-low-stock-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Stock Check Popout Modal -->
            <div id="stock-check-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="stock-check-title">Stock Check Report</h3>
                        <button class="popout-modal-close" id="close-stock-check">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="stock-check-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-stock-check">🖨️ Print</button>
                        <button class="btn-primary" id="close-stock-check-btn">Close</button>
                    </div>
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
        
        // Popout modal handlers
        document.getElementById('close-inventory-report')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('close-inventory-report-btn')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('print-inventory-report')?.addEventListener('click', () => this.printInventoryReport());
        
        document.getElementById('close-low-stock-report')?.addEventListener('click', () => this.hideLowStockReportModal());
        document.getElementById('close-low-stock-report-btn')?.addEventListener('click', () => this.hideLowStockReportModal());
        document.getElementById('print-low-stock-report')?.addEventListener('click', () => this.printLowStockReport());
        
        document.getElementById('close-stock-check')?.addEventListener('click', () => this.hideStockCheckModal());
        document.getElementById('close-stock-check-btn')?.addEventListener('click', () => this.hideStockCheckModal());
        document.getElementById('print-stock-check')?.addEventListener('click', () => this.printStockCheck());
        
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

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
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

    // MODAL CONTROL METHODS
    showInventoryReportModal() {
        document.getElementById('inventory-report-modal').classList.remove('hidden');
    },

    hideInventoryReportModal() {
        document.getElementById('inventory-report-modal').classList.add('hidden');
    },

    showLowStockReportModal() {
        document.getElementById('low-stock-report-modal').classList.remove('hidden');
    },

    hideLowStockReportModal() {
        document.getElementById('low-stock-report-modal').classList.add('hidden');
    },

    showStockCheckModal() {
        document.getElementById('stock-check-modal').classList.remove('hidden');
    },

    hideStockCheckModal() {
        document.getElementById('stock-check-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideInventoryReportModal();
        this.hideLowStockReportModal();
        this.hideStockCheckModal();
    },

    // KEEP ALL EXISTING FORM METHODS EXACTLY THE SAME
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

    // UPDATE REPORT METHODS TO USE POPOUT MODALS
    showStockCheck() {
        const lowStock = this.getLowStockItems();
        const outOfStock = this.getOutOfStockItems();
        const stats = this.calculateStats();
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📦 Stock Check Report</h4>';
        
        if (lowStock.length > 0) {
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: #f59e0b; margin-bottom: 12px;">⚠️ LOW STOCK ITEMS (${lowStock.length}):</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            lowStock.forEach(item => {
                report += `<div style="padding: 8px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <strong>${item.name}</strong>: ${item.currentStock} ${item.unit} (min: ${item.minStock} ${item.unit})
                </div>`;
            });
            report += '</div></div>';
        }
        
        if (outOfStock.length > 0) {
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: #ef4444; margin-bottom: 12px;">❌ OUT OF STOCK (${outOfStock.length}):</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            outOfStock.forEach(item => {
                report += `<div style="padding: 8px; background: #fee2e2; border-radius: 6px; border-left: 4px solid #ef4444;">
                    <strong>${item.name}</strong>: 0 ${item.unit}
                </div>`;
            });
            report += '</div></div>';
        }
        
        if (lowStock.length === 0 && outOfStock.length === 0) {
            report += `<div style="text-align: center; padding: 20px; background: #d1fae5; border-radius: 8px; border-left: 4px solid #22c55e;">
                <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                <strong style="color: #065f46;">All items are adequately stocked!</strong>
            </div>`;
        }
        
        report += `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Items</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.totalItems}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Value</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(stats.totalValue)}</div>
                </div>
            </div>
        </div>`;
        
        report += '</div>';

        document.getElementById('stock-check-content').innerHTML = report;
        document.getElementById('stock-check-title').textContent = 'Stock Check Report';
        this.showStockCheckModal();
    },

    generateLowStockReport() {
        const lowStock = this.getLowStockItems();
        const outOfStock = this.getOutOfStockItems();
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📋 LOW STOCK & REORDER REPORT</h4>';
        
        if (outOfStock.length === 0 && lowStock.length === 0) {
            report += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h5 style="color: #065f46; margin-bottom: 8px;">No low stock items!</h5>
                <p style="color: var(--text-secondary);">All inventory is adequately stocked</p>
            </div>`;
        } else {
            if (outOfStock.length > 0) {
                report += `<div style="margin-bottom: 24px;">
                    <h5 style="color: #ef4444; margin-bottom: 16px; padding: 8px 12px; background: #fee2e2; border-radius: 6px;">🚨 URGENT - OUT OF STOCK:</h5>
                    <div style="display: flex; flex-direction: column; gap: 12px;">`;
                outOfStock.forEach(item => {
                    const suggestedOrder = item.minStock * 2;
                    report += `<div style="padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${item.name}</div>
                        <div style="color: #dc2626; font-size: 14px; margin-bottom: 8px;">
                            <strong>ORDER ${suggestedOrder} ${item.unit}</strong> (Supplier: ${item.supplier || 'Not specified'})
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Current: 0 ${item.unit} • Min: ${item.minStock} ${item.unit}</div>
                    </div>`;
                });
                report += '</div></div>';
            }
            
            if (lowStock.length > 0) {
                report += `<div style="margin-bottom: 20px;">
                    <h5 style="color: #f59e0b; margin-bottom: 16px; padding: 8px 12px; background: #fef3c7; border-radius: 6px;">📉 LOW STOCK - REORDER SOON:</h5>
                    <div style="display: flex; flex-direction: column; gap: 12px;">`;
                lowStock.forEach(item => {
                    const suggestedOrder = Math.max(item.minStock * 2 - item.currentStock, 10);
                    report += `<div style="padding: 12px; background: #fffbeb; border-radius: 8px; border: 1px solid #fcd34d;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${item.name}</div>
                        <div style="color: #d97706; font-size: 14px; margin-bottom: 8px;">
                            <strong>Order ${suggestedOrder} ${item.unit}</strong> - ${item.currentStock} ${item.unit} left
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Min stock: ${item.minStock} ${item.unit} • Supplier: ${item.supplier || 'Not specified'}</div>
                    </div>`;
                });
                report += '</div></div>';
            }
        }
        
        report += '</div>';

        document.getElementById('low-stock-report-content').innerHTML = report;
        document.getElementById('low-stock-report-title').textContent = 'Low Stock Report';
        this.showLowStockReportModal();
    },

    generateInventoryReport() {
        const stats = this.calculateStats();
        const categoryData = {};
        
        this.categories.forEach(cat => {
            const items = this.inventory.filter(item => item.category === cat);
            categoryData[cat] = {
                count: items.length,
                totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0),
                lowStock: items.filter(item => item.currentStock <= item.minStock).length
            };
        });

        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 COMPLETE INVENTORY REPORT</h4>';
        
        // Overview Section
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 OVERVIEW:</h5>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Items</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.totalItems}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Items in Stock</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.inStock}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Value</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(stats.totalValue)}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Low Stock Items</div>
                    <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">${stats.lowStockItems}</div>
                </div>
            </div>
        </div>`;
        
        // Category Breakdown
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">🗂️ CATEGORY BREAKDOWN:</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">`;
        this.categories.forEach(cat => {
            const data = categoryData[cat];
            if (data.count > 0) {
                const lowStockColor = data.lowStock > 0 ? '#f59e0b' : '#22c55e';
                report += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(cat)}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${data.count} items</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(data.totalValue)}</div>
                        <div style="font-size: 12px; color: ${lowStockColor};">${data.lowStock} low stock</div>
                    </div>
                </div>`;
            }
        });
        report += '</div></div>';
        
        // Low Stock Summary
        const lowStock = this.getLowStockItems();
        report += `<div style="margin-bottom: 20px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">⚠️ LOW STOCK SUMMARY:</h5>`;
        if (lowStock.length > 0) {
            report += '<div style="display: flex; flex-direction: column; gap: 8px;">';
            lowStock.forEach(item => {
                const statusColor = item.currentStock === 0 ? '#ef4444' : '#f59e0b';
                report += `<div style="padding: 8px; background: ${statusColor}10; border-radius: 6px; border-left: 4px solid ${statusColor};">
                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${item.currentStock} ${item.unit} (min: ${item.minStock} ${item.unit}) • ${this.formatCategory(item.category)}
                    </div>
                </div>`;
            });
            report += '</div>';
        } else {
            report += `<div style="text-align: center; padding: 20px; background: #d1fae5; border-radius: 8px;">
                <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                <strong style="color: #065f46;">No low stock items</strong>
            </div>`;
        }
        report += '</div>';
        
        report += '</div>';

        document.getElementById('inventory-report-content').innerHTML = report;
        document.getElementById('inventory-report-title').textContent = 'Complete Inventory Report';
        this.showInventoryReportModal();
    },

    // PRINT METHODS
    printInventoryReport() {
        this.printReport('inventory-report-content', 'inventory-report-title');
    },

    printLowStockReport() {
        this.printReport('low-stock-report-content', 'low-stock-report-title');
    },

    printStockCheck() {
        this.printReport('stock-check-content', 'stock-check-title');
    },

    printReport(contentId, titleId) {
        const reportContent = document.getElementById(contentId).innerHTML;
        const reportTitle = document.getElementById(titleId).textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #1f2937;
                            line-height: 1.6;
                        }
                        .report-content { 
                            max-width: 800px; 
                            margin: 0 auto;
                        }
                        h4 { 
                            color: #1f2937; 
                            border-bottom: 2px solid #3b82f6; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        h5 { 
                            color: #374151; 
                            margin: 20px 0 10px 0;
                        }
                        .stats-grid { 
                            display: grid; 
                            grid-template-columns: repeat(2, 1fr); 
                            gap: 15px; 
                            margin: 15px 0; 
                        }
                        .stat-item { 
                            padding: 10px; 
                            background: #f8f9fa; 
                            border-radius: 5px; 
                            text-align: center; 
                        }
                        .alert-item { 
                            padding: 8px; 
                            margin: 5px 0; 
                            border-left: 4px solid; 
                            border-radius: 4px; 
                        }
                        @media print {
                            body { margin: 0.5in; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #6b7280; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    ${reportContent}
                    <div class="no-print" style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                        Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // KEEP ALL EXISTING DATA METHODS EXACTLY THE SAME
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
        
        // SYNC WITH PROFILE - Update inventory stats
        this.syncStatsWithProfile();
        
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
        
        // SYNC WITH PROFILE - Update stats after stock change
        this.syncStatsWithProfile();
        
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
            
            // SYNC WITH PROFILE - Update stats after deletion
            this.syncStatsWithProfile();
            
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
            item.currentStock += amount;
            item.lastRestocked = new Date().toISOString().split('T')[0];
            
            this.saveData();
            this.renderModule();
            
            // SYNC WITH PROFILE - Update stats after restock
            this.syncStatsWithProfile();
            
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

    // KEEP THE EXISTING SYNC AND UTILITY METHODS:
    syncStatsWithProfile() {
        const stats = this.calculateStats();
        
        if (window.ProfileModule && window.profileInstance) {
            window.profileInstance.updateStats({
                totalInventoryItems: stats.totalItems,
                inStockItems: stats.inStock,
                lowStockItems: stats.lowStockItems,
                outOfStockItems: stats.outOfStockItems,
                inventoryValue: stats.totalValue
            });
        }
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
