// modules/inventory-check.js - UPDATED WITH MODALS
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
        
        // Sync initial stats with profile
        this.syncStatsWithProfile();
        
        return true;
    },

    // ... (previous loadData, getDemoData, renderModule methods remain the same) ...

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

    // ... (previous calculateStats, getLowStockItems, renderInventoryList, etc. remain the same) ...

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

    // ... (previous form handling methods remain the same) ...

    showStockCheck() {
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📦 Stock Check Report</h4>';
        
        const lowStock = this.getLowStockItems();
        const outOfStock = this.getOutOfStockItems();
        
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
        
        const stats = this.calculateStats();
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

        this.showReportsModal('Stock Check Report', report);
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

        this.showReportsModal('Low Stock Report', report);
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

        this.showReportsModal('Complete Inventory Report', report);
    },

    showReportsModal(title, content) {
        const modal = document.getElementById('reports-modal');
        const modalTitle = document.getElementById('reports-modal-title');
        const modalContent = document.getElementById('reports-content');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
        }
    },

    hideReportsModal() {
        const modal = document.getElementById('reports-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    printReport() {
        const reportContent = document.getElementById('reports-content');
        if (reportContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Inventory Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                            .report-content { max-width: 800px; margin: 0 auto; }
                            h4 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                            h5 { color: #2c3e50; margin: 20px 0 10px 0; }
                            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
                            .stat-item { padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; }
                            .alert-item { padding: 8px; margin: 5px 0; border-left: 4px solid; border-radius: 4px; }
                            @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${reportContent.innerHTML}
                        <div class="no-print" style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                            Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },

    // ... (previous syncStatsWithProfile, formatCurrency, saveData methods remain the same) ...
};

if (window.FarmModules) {
    window.FarmModules.registerModule('inventory-check', InventoryCheckModule);
}
