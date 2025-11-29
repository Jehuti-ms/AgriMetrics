// modules/inventory-check.js - FIXED WITH WORKING POPOUT MODALS
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
                    <h1 class="module-title">Inventory Management</h1>
                    <p class="module-subtitle">Track and manage your farm inventory</p>
                </div>

                <!-- Stats Overview -->
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
                    <button class="quick-action-btn" id="inventory-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Inventory Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Full inventory analysis</span>
                    </button>
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
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Inventory List -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">All Inventory Items</h3>
                        <button class="btn-primary" id="show-add-item-btn">Add New Item</button>
                    </div>
                    <div id="inventory-list">
                        ${this.renderInventoryList()}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS - These will overlay the entire page -->
            <!-- Add Item Modal -->
            <div id="add-item-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Add Inventory Item</h3>
                        <button class="popout-modal-close" id="close-add-item-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
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
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-add-item">Cancel</button>
                        <button type="button" class="btn-primary" id="save-inventory-item">Save Item</button>
                    </div>
                </div>
            </div>

            <!-- Inventory Report Modal -->
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
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalItems = this.inventory.length;
        const inStock = this.inventory.filter(item => item.currentStock > 0).length;
        const totalValue = this.inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
        const lowStockItems = this.getLowStockItems().length;
        
        return { totalItems, inStock, totalValue, lowStockItems };
    },

    getLowStockItems() {
        return this.inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0);
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
                                    </div>
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
        // Modal triggers
        document.getElementById('show-add-item-btn')?.addEventListener('click', () => this.showAddItemModal());
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.showAddItemModal());
        document.getElementById('inventory-report-btn')?.addEventListener('click', () => this.generateInventoryReport());
        
        // Add item modal
        document.getElementById('close-add-item-modal')?.addEventListener('click', () => this.hideAddItemModal());
        document.getElementById('cancel-add-item')?.addEventListener('click', () => this.hideAddItemModal());
        document.getElementById('save-inventory-item')?.addEventListener('click', () => this.handleInventorySubmit());
        
        // Report modal
        document.getElementById('close-inventory-report')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('close-inventory-report-btn')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('print-inventory-report')?.addEventListener('click', () => this.printInventoryReport());

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });
    },

    showAddItemModal() {
        document.getElementById('add-item-modal').classList.remove('hidden');
        document.getElementById('inventory-form').reset();
    },

    hideAddItemModal() {
        document.getElementById('add-item-modal').classList.add('hidden');
    },

    showInventoryReportModal() {
        document.getElementById('inventory-report-modal').classList.remove('hidden');
    },

    hideInventoryReportModal() {
        document.getElementById('inventory-report-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideAddItemModal();
        this.hideInventoryReportModal();
    },

    handleInventorySubmit() {
        const form = document.getElementById('inventory-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

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
        this.hideAddItemModal();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Inventory item added successfully!', 'success');
        }
    },

    // In the generateInventoryReport method, replace inline styles with classes:
generateInventoryReport() {
    const stats = this.calculateStats();
    
    const reportContent = `
        <div class="report-section">
            <h4 class="report-section-title">Inventory Overview</h4>
            <div class="stats-grid-compact">
                <div class="stat-card-compact stat-primary">
                    <div class="stat-label">Total Items</div>
                    <div class="stat-value">${stats.totalItems}</div>
                </div>
                <div class="stat-card-compact stat-success">
                    <div class="stat-label">In Stock</div>
                    <div class="stat-value">${stats.inStock}</div>
                </div>
                <div class="stat-card-compact stat-warning">
                    <div class="stat-label">Low Stock</div>
                    <div class="stat-value">${stats.lowStockItems}</div>
                </div>
                <div class="stat-card-compact stat-info">
                    <div class="stat-label">Total Value</div>
                    <div class="stat-value">${this.formatCurrency(stats.totalValue)}</div>
                </div>
            </div>
        </div>

        <div class="report-section">
            <h4 class="report-section-title">Category Breakdown</h4>
            <div class="category-list">
                ${this.categories.map(cat => {
                    const categoryItems = this.inventory.filter(item => item.category === cat);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
                    
                    return categoryItems.length > 0 ? `
                        <div class="category-item">
                            <div class="category-header">
                                <span class="category-icon">${this.getCategoryIcon(cat)}</span>
                                <div class="category-info">
                                    <div class="category-name">${this.formatCategory(cat)}</div>
                                    <div class="category-count">${categoryItems.length} items</div>
                                </div>
                            </div>
                            <div class="category-value">${this.formatCurrency(categoryValue)}</div>
                        </div>
                    ` : '';
                }).join('')}
            </div>
        </div>
    `;

    document.getElementById('inventory-report-content').innerHTML = reportContent;
    this.showInventoryReportModal();
}
    
    printInventoryReport() {
        const reportContent = document.getElementById('inventory-report-content').innerHTML;
        const reportTitle = document.getElementById('inventory-report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h4 { color: #1a1a1a; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h2>${reportTitle}</h2>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
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
}
