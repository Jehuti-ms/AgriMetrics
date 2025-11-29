// modules/inventory-check.js - COMPLETE REWRITE
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
            }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();
        const lowStockItems = this.getLowStockItems();
        const outOfStockItems = this.getOutOfStockItems();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Inventory Management</h1>
                    <p class="module-subtitle">Track and manage your farm inventory</p>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-value">${stats.totalItems}</div>
                        <div class="stat-label">Total Items</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.inStock}</div>
                        <div class="stat-label">In Stock</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-value ${lowStockItems.length > 0 ? 'stat-warning' : 'stat-success'}">${lowStockItems.length}</div>
                        <div class="stat-label">Low Stock</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${this.formatCurrency(stats.totalValue)}</div>
                        <div class="stat-label">Total Value</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-item-btn">
                        <div class="quick-action-icon">➕</div>
                        <span class="quick-action-title">Add Item</span>
                        <span class="quick-action-subtitle">Add new inventory item</span>
                    </button>
                    <button class="quick-action-btn" id="stock-check-btn">
                        <div class="quick-action-icon">🔍</div>
                        <span class="quick-action-title">Stock Check</span>
                        <span class="quick-action-subtitle">Update stock levels</span>
                    </button>
                    <button class="quick-action-btn" id="low-stock-report-btn">
                        <div class="quick-action-icon">📋</div>
                        <span class="quick-action-title">Low Stock Report</span>
                        <span class="quick-action-subtitle">View items to reorder</span>
                    </button>
                    <button class="quick-action-btn" id="inventory-report-btn">
                        <div class="quick-action-icon">📈</div>
                        <span class="quick-action-title">Inventory Report</span>
                        <span class="quick-action-subtitle">Full inventory analysis</span>
                    </button>
                </div>

                <!-- Critical Alerts -->
                ${lowStockItems.length > 0 || outOfStockItems.length > 0 ? `
                    <div class="alerts-section">
                        ${outOfStockItems.length > 0 ? `
                            <div class="alert-card alert-critical">
                                <div class="alert-header">
                                    <div class="alert-icon">❌</div>
                                    <div class="alert-title">Out of Stock</div>
                                    <div class="alert-count">${outOfStockItems.length} items</div>
                                </div>
                                <div class="alert-items">
                                    ${outOfStockItems.map(item => `
                                        <div class="alert-item">
                                            <span class="alert-item-name">${item.name}</span>
                                            <span class="alert-item-details">0 ${item.unit} • Min: ${item.minStock} ${item.unit}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${lowStockItems.length > 0 ? `
                            <div class="alert-card alert-warning">
                                <div class="alert-header">
                                    <div class="alert-icon">⚠️</div>
                                    <div class="alert-title">Low Stock</div>
                                    <div class="alert-count">${lowStockItems.length} items</div>
                                </div>
                                <div class="alert-items">
                                    ${lowStockItems.map(item => `
                                        <div class="alert-item">
                                            <span class="alert-item-name">${item.name}</span>
                                            <span class="alert-item-details">${item.currentStock} ${item.unit} • Min: ${item.minStock} ${item.unit}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Inventory List -->
                <div class="glass-card">
                    <div class="section-header">
                        <h3 class="section-title">All Inventory Items</h3>
                        <div class="section-actions">
                            <select class="form-select" id="category-filter">
                                <option value="">All Categories</option>
                                ${this.categories.map(cat => `
                                    <option value="${cat}">${this.formatCategory(cat)}</option>
                                `).join('')}
                            </select>
                            <button class="btn-primary" id="show-add-item-btn">Add New Item</button>
                        </div>
                    </div>
                    <div id="inventory-list">
                        ${this.renderInventoryList()}
                    </div>
                </div>

                <!-- Category Summary -->
                <div class="glass-card">
                    <h3 class="section-title">Inventory by Category</h3>
                    <div class="category-summary">
                        ${this.renderCategorySummary()}
                    </div>
                </div>
            </div>

            <!-- Add Item Modal -->
            <div id="add-item-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Add Inventory Item</h3>
                        <button class="popout-modal-close" id="close-add-item-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="inventory-form" class="modal-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Item Name</label>
                                    <input type="text" class="form-input" id="item-name" required placeholder="e.g., Chicken Feed - Starter">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Category</label>
                                    <select class="form-input" id="item-category" required>
                                        <option value="">Select category</option>
                                        ${this.categories.map(cat => `
                                            <option value="${cat}">${this.formatCategory(cat)}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Current Stock</label>
                                    <input type="number" class="form-input" id="current-stock" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Unit</label>
                                    <input type="text" class="form-input" id="item-unit" required placeholder="e.g., kg, pcs, bottles">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Min Stock Level</label>
                                    <input type="number" class="form-input" id="min-stock" min="0" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Cost per Unit ($)</label>
                                    <input type="number" class="form-input" id="item-cost" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Supplier</label>
                                    <input type="text" class="form-input" id="item-supplier" placeholder="Supplier name">
                                </div>
                            </div>
                            <div class="form-group">
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

            <!-- Low Stock Report Modal -->
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
        `;

        this.setupEventListeners();
    },

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
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <div class="empty-title">No inventory items</div>
                    <div class="empty-subtitle">Add your first inventory item to get started</div>
                </div>
            `;
        }

        return `
            <div class="inventory-list">
                ${this.inventory.map(item => {
                    const status = this.getStockStatus(item);
                    const statusClass = this.getStockStatusClass(item);
                    const totalValue = item.currentStock * item.cost;
                    
                    return `
                        <div class="inventory-item" data-category="${item.category}">
                            <div class="item-main">
                                <div class="item-icon ${item.category}">${this.getCategoryIcon(item.category)}</div>
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-meta">
                                        <span class="item-category">${this.formatCategory(item.category)}</span>
                                        <span class="item-supplier">${item.supplier || 'No supplier'}</span>
                                        ${item.lastRestocked ? `<span class="item-restocked">Last: ${item.lastRestocked}</span>` : ''}
                                    </div>
                                    ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
                                </div>
                            </div>
                            <div class="item-stock">
                                <div class="stock-info">
                                    <div class="stock-quantity">${item.currentStock} ${item.unit}</div>
                                    <div class="stock-minimum">Min: ${item.minStock} ${item.unit}</div>
                                    <div class="stock-value">${this.formatCurrency(totalValue)}</div>
                                </div>
                                <div class="stock-status ${statusClass}">
                                    ${status}
                                </div>
                                <div class="item-actions">
                                    <button class="btn-icon update-stock" data-id="${item.id}" title="Update Stock">
                                        <span class="icon">✏️</span>
                                    </button>
                                    <button class="btn-icon delete-item" data-id="${item.id}" title="Delete Item">
                                        <span class="icon">🗑️</span>
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
                lowStock: 0,
                outOfStock: 0
            };
        });

        this.inventory.forEach(item => {
            if (categoryData[item.category]) {
                categoryData[item.category].count++;
                categoryData[item.category].totalValue += item.currentStock * item.cost;
                if (item.currentStock === 0) {
                    categoryData[item.category].outOfStock++;
                } else if (item.currentStock <= item.minStock) {
                    categoryData[item.category].lowStock++;
                }
            }
        });

        return `
            <div class="category-grid">
                ${this.categories.map(cat => {
                    const data = categoryData[cat];
                    return `
                        <div class="category-card">
                            <div class="category-header">
                                <div class="category-icon ${cat}">${this.getCategoryIcon(cat)}</div>
                                <div class="category-name">${this.formatCategory(cat)}</div>
                            </div>
                            <div class="category-stats">
                                <div class="category-stat">
                                    <span class="stat-label">Items:</span>
                                    <span class="stat-value">${data.count}</span>
                                </div>
                                <div class="category-stat">
                                    <span class="stat-label">Value:</span>
                                    <span class="stat-value">${this.formatCurrency(data.totalValue)}</span>
                                </div>
                                <div class="category-stat">
                                    <span class="stat-label">Low Stock:</span>
                                    <span class="stat-value ${data.lowStock > 0 ? 'stat-warning' : ''}">${data.lowStock}</span>
                                </div>
                                <div class="category-stat">
                                    <span class="stat-label">Out of Stock:</span>
                                    <span class="stat-value ${data.outOfStock > 0 ? 'stat-danger' : ''}">${data.outOfStock}</span>
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
        if (item.currentStock <= item.minStock) return 'Low Stock';
        return 'Adequate';
    },

    getStockStatusClass(item) {
        if (item.currentStock === 0) return 'status-out';
        if (item.currentStock <= item.minStock) return 'status-low';
        return 'status-adequate';
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
        document.getElementById('low-stock-report-btn')?.addEventListener('click', () => this.generateLowStockReport());
        
        // Add item modal
        document.getElementById('close-add-item-modal')?.addEventListener('click', () => this.hideAddItemModal());
        document.getElementById('cancel-add-item')?.addEventListener('click', () => this.hideAddItemModal());
        document.getElementById('save-inventory-item')?.addEventListener('click', () => this.handleInventorySubmit());
        
        // Report modals
        document.getElementById('close-inventory-report')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('close-inventory-report-btn')?.addEventListener('click', () => this.hideInventoryReportModal());
        document.getElementById('print-inventory-report')?.addEventListener('click', () => this.printInventoryReport());
        
        document.getElementById('close-low-stock-report')?.addEventListener('click', () => this.hideLowStockReportModal());
        document.getElementById('close-low-stock-report-btn')?.addEventListener('click', () => this.hideLowStockReportModal());
        document.getElementById('print-low-stock-report')?.addEventListener('click', () => this.printLowStockReport());

        // Category filter
        document.getElementById('category-filter')?.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        
        // Item actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-item')) {
                const id = parseInt(e.target.closest('.delete-item').dataset.id);
                this.deleteItem(id);
            }
            if (e.target.closest('.update-stock')) {
                const id = parseInt(e.target.closest('.update-stock').dataset.id);
                this.updateStock(id);
            }
        });

        // Close modals when clicking outside
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

    showLowStockReportModal() {
        document.getElementById('low-stock-report-modal').classList.remove('hidden');
    },

    hideLowStockReportModal() {
        document.getElementById('low-stock-report-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideAddItemModal();
        this.hideInventoryReportModal();
        this.hideLowStockReportModal();
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

    generateInventoryReport() {
        const stats = this.calculateStats();
        const categoryData = this.getCategoryData();
        
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
                <div class="category-breakdown">
                    ${Object.entries(categoryData).map(([category, data]) => data.count > 0 ? `
                        <div class="breakdown-item">
                            <div class="breakdown-header">
                                <span class="breakdown-icon">${this.getCategoryIcon(category)}</span>
                                <span class="breakdown-name">${this.formatCategory(category)}</span>
                            </div>
                            <div class="breakdown-stats">
                                <div class="breakdown-stat">
                                    <span class="stat-label">Items:</span>
                                    <span class="stat-value">${data.count}</span>
                                </div>
                                <div class="breakdown-stat">
                                    <span class="stat-label">Value:</span>
                                    <span class="stat-value">${this.formatCurrency(data.totalValue)}</span>
                                </div>
                                <div class="breakdown-stat">
                                    <span class="stat-label">Low Stock:</span>
                                    <span class="stat-value ${data.lowStock > 0 ? 'stat-warning' : ''}">${data.lowStock}</span>
                                </div>
                            </div>
                        </div>
                    ` : '').join('')}
                </div>
            </div>

            <div class="report-section">
                <h4 class="report-section-title">Inventory Value Analysis</h4>
                <div class="value-analysis">
                    <div class="value-total">
                        <div class="value-label">Total Inventory Value</div>
                        <div class="value-amount">${this.formatCurrency(stats.totalValue)}</div>
                    </div>
                    <div class="value-breakdown">
                        ${Object.entries(categoryData)
                            .filter(([_, data]) => data.totalValue > 0)
                            .map(([category, data]) => `
                                <div class="value-item">
                                    <div class="value-category">
                                        <span class="value-icon">${this.getCategoryIcon(category)}</span>
                                        <span class="value-name">${this.formatCategory(category)}</span>
                                    </div>
                                    <div class="value-details">
                                        <span class="value-percentage">${((data.totalValue / stats.totalValue) * 100).toFixed(1)}%</span>
                                        <span class="value-amount">${this.formatCurrency(data.totalValue)}</span>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('inventory-report-content').innerHTML = reportContent;
        document.getElementById('inventory-report-title').textContent = 'Complete Inventory Report';
        this.showInventoryReportModal();
    },

    generateLowStockReport() {
        const lowStockItems = this.getLowStockItems();
        const outOfStockItems = this.getOutOfStockItems();
        const allCriticalItems = [...lowStockItems, ...outOfStockItems];

        if (allCriticalItems.length === 0) {
            const reportContent = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <div class="empty-title">No Critical Stock Items</div>
                    <div class="empty-subtitle">All inventory items are adequately stocked</div>
                </div>
            `;
            document.getElementById('low-stock-report-content').innerHTML = reportContent;
            document.getElementById('low-stock-report-title').textContent = 'Low Stock Report';
            this.showLowStockReportModal();
            return;
        }

        const reportContent = `
            <div class="report-section">
                <h4 class="report-section-title">Critical Stock Summary</h4>
                <div class="critical-summary">
                    <div class="critical-stat">
                        <div class="critical-count critical-out">${outOfStockItems.length}</div>
                        <div class="critical-label">Out of Stock</div>
                    </div>
                    <div class="critical-stat">
                        <div class="critical-count critical-low">${lowStockItems.length}</div>
                        <div class="critical-label">Low Stock</div>
                    </div>
                    <div class="critical-stat">
                        <div class="critical-count critical-total">${allCriticalItems.length}</div>
                        <div class="critical-label">Total Critical</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4 class="report-section-title">Critical Items</h4>
                <div class="critical-items">
                    ${allCriticalItems.map(item => {
                        const isOutOfStock = item.currentStock === 0;
                        const statusClass = isOutOfStock ? 'critical-out' : 'critical-low';
                        const statusText = isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK';
                        const suggestedOrder = Math.max(item.minStock - item.currentStock, item.minStock * 0.5);
                        
                        return `
                            <div class="critical-item ${statusClass}">
                                <div class="critical-header">
                                    <div class="critical-main">
                                        <div class="critical-icon">${this.getCategoryIcon(item.category)}</div>
                                        <div class="critical-details">
                                            <div class="critical-name">${item.name}</div>
                                            <div class="critical-meta">
                                                <span class="critical-category">${this.formatCategory(item.category)}</span>
                                                <span class="critical-supplier">${item.supplier || 'No supplier'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="critical-status">${statusText}</div>
                                </div>
                                <div class="critical-stats">
                                    <div class="critical-stat">
                                        <span class="stat-label">Current:</span>
                                        <span class="stat-value">${item.currentStock} ${item.unit}</span>
                                    </div>
                                    <div class="critical-stat">
                                        <span class="stat-label">Minimum:</span>
                                        <span class="stat-value">${item.minStock} ${item.unit}</span>
                                    </div>
                                    <div class="critical-stat">
                                        <span class="stat-label">Suggested Order:</span>
                                        <span class="stat-value success">${suggestedOrder} ${item.unit}</span>
                                    </div>
                                    <div class="critical-stat">
                                        <span class="stat-label">Cost:</span>
                                        <span class="stat-value">${this.formatCurrency(item.cost)}/${item.unit}</span>
                                    </div>
                                </div>
                                ${item.notes ? `<div class="critical-notes">${item.notes}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        document.getElementById('low-stock-report-content').innerHTML = reportContent;
        document.getElementById('low-stock-report-title').textContent = 'Low Stock Report';
        this.showLowStockReportModal();
    },

    getCategoryData() {
        const categoryData = {};
        this.categories.forEach(cat => {
            categoryData[cat] = {
                count: 0,
                totalValue: 0,
                lowStock: 0,
                outOfStock: 0
            };
        });

        this.inventory.forEach(item => {
            if (categoryData[item.category]) {
                categoryData[item.category].count++;
                categoryData[item.category].totalValue += item.currentStock * item.cost;
                if (item.currentStock === 0) {
                    categoryData[item.category].outOfStock++;
                } else if (item.currentStock <= item.minStock) {
                    categoryData[item.category].lowStock++;
                }
            }
        });

        return categoryData;
    },

    filterByCategory(category) {
        const items = document.querySelectorAll('.inventory-item');
        items.forEach(item => {
            if (!category || item.dataset.category === category) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    deleteItem(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Item deleted successfully!', 'success');
            }
        }
    },

    updateStock(id) {
        const item = this.inventory.find(item => item.id === id);
        if (!item) return;

        const newStock = prompt(`Update stock for "${item.name}"\nCurrent: ${item.currentStock} ${item.unit}\nMinimum: ${item.minStock} ${item.unit}\nEnter new stock level:`, item.currentStock.toString());
        
        if (newStock !== null && !isNaN(newStock)) {
            const stock = parseInt(newStock);
            item.currentStock = stock;
            if (stock > item.currentStock) {
                item.lastRestocked = new Date().toISOString().split('T')[0];
            }
            
            this.saveData();
            this.renderModule();
            
            if (window.coreModule) {
                window.coreModule.showNotification(`Stock updated to ${stock} ${item.unit}`, 'success');
            }
        }
    },

    printInventoryReport() {
        this.printReport('inventory-report-content', 'inventory-report-title');
    },

    printLowStockReport() {
        this.printReport('low-stock-report-content', 'low-stock-report-title');
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
                        .report-section { 
                            margin-bottom: 30px; 
                            break-inside: avoid;
                        }
                        .report-section-title {
                            color: #1f2937;
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 16px;
                            border-bottom: 2px solid #3b82f6;
                            padding-bottom: 8px;
                        }
                        .stats-grid-compact {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 12px;
                            margin-bottom: 20px;
                        }
                        .stat-card-compact {
                            padding: 16px;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e5e7eb;
                        }
                        .stat-primary { background: #eff6ff; }
                        .stat-success { background: #f0fdf4; }
                        .stat-warning { background: #fef3c7; }
                        .stat-info { background: #faf5ff; }
                        .stat-label {
                            font-size: 14px;
                            color: #6b7280;
                            margin-bottom: 4px;
                        }
                        .stat-value {
                            font-size: 20px;
                            font-weight: 700;
                            color: #1f2937;
                        }
                        .critical-item {
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 16px;
                            margin-bottom: 12px;
                            break-inside: avoid;
                        }
                        .critical-out { border-left: 4px solid #dc2626; background: #fef2f2; }
                        .critical-low { border-left: 4px solid #d97706; background: #fef3c7; }
                        @media print {
                            body { margin: 0.5in; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #6b7280; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
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
