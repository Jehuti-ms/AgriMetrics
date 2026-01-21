/**
 * COMPLETE SALES RECORD MODULE
 * Version: 3.0.0 - Using Existing StyleManager CSS
 * Features: Production Integration, Weight-based Sales, Broadcaster Support
 * Date: 2024-01-21
 */

console.log('💰 Loading Sales Record Module v3.0...');

const SalesRecordModule = {
    name: 'sales-record',
    version: '3.0.0',
    initialized: false,
    element: null,
    currentSaleId: null,
    broadcaster: null,
    pendingProductionSale: null,

    // ==================== CORE INITIALIZATION ====================
    
    initialize() {
        console.log('🔄 Initializing Sales Record Module...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }
        
        if (!this.checkDependencies()) {
            console.error('❌ Missing required dependencies');
            return false;
        }
        
        // Connect to broadcaster if available
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Connected to Data Broadcaster');
        }
        
        // Initialize data
        this.loadData();
        
        // Set up event system
        this.setupEventSystem();
        
        // Render the module
        this.renderModule();
        
        // Set up broadcaster listeners
        this.setupBroadcasterListeners();
        
        this.initialized = true;
        console.log('✅ Sales Record Module initialized successfully');
        
        // Broadcast ready status
        this.broadcast('sales-module-ready', {
            version: this.version,
            salesCount: this.getSales().length
        });
        
        return true;
    },

    checkDependencies() {
        if (!window.FarmModules) {
            console.error('❌ FarmModules framework not found');
            return false;
        }
        
        // Initialize data structure if needed
        if (!window.FarmModules.appData) {
            window.FarmModules.appData = {};
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        return true;
    },

    loadData() {
        try {
            const savedData = localStorage.getItem('farm_sales_data');
            if (savedData) {
                window.FarmModules.appData.sales = JSON.parse(savedData);
                console.log(`📊 Loaded ${window.FarmModules.appData.sales.length} sales records`);
            }
        } catch (error) {
            console.error('❌ Error loading sales data:', error);
            window.FarmModules.appData.sales = [];
        }
    },

    saveData() {
        try {
            localStorage.setItem('farm_sales_data', JSON.stringify(window.FarmModules.appData.sales));
            console.log('💾 Sales data saved');
            
            this.broadcast('sales-data-saved', {
                count: window.FarmModules.appData.sales.length,
                timestamp: new Date().toISOString()
            });
            
            this.updateDashboardStats();
            
            return true;
        } catch (error) {
            console.error('❌ Error saving sales data:', error);
            this.showNotification('Failed to save sales data', 'error');
            return false;
        }
    },

    // ==================== BROADCASTER INTEGRATION ====================

    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('order-completed', (data) => {
            console.log('📦 Converting order to sale:', data);
            this.convertOrderToSale(data);
        });
        
        this.broadcaster.on('production-updated', (data) => {
            console.log('🏭 Production updated, refreshing available items');
            this.refreshProductionItems();
        });
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📦 Inventory updated, checking stock');
            this.checkInventoryLevels(data);
        });
    },

    broadcast(event, data) {
        if (!this.broadcaster) return;
        
        const eventData = {
            module: this.name,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.broadcaster.broadcast(event, eventData);
    },

    broadcastSaleRecorded(sale) {
        this.broadcast('sale-recorded', {
            saleId: sale.id,
            product: sale.product,
            quantity: sale.quantity,
            weight: sale.weight,
            totalAmount: sale.totalAmount,
            customer: sale.customer,
            date: sale.date
        });
        
        this.broadcast('income-updated', {
            amount: sale.totalAmount,
            type: 'sales',
            source: 'sales-record'
        });
        
        if (this.isMeatProduct(sale.product)) {
            this.broadcast('meat-sold', {
                product: sale.product,
                weight: sale.weight,
                animals: sale.animalCount,
                amount: sale.totalAmount
            });
        }
    },

    updateDashboardStats() {
        const stats = this.calculateStats();
        this.broadcast('sales-stats-updated', stats);
    },

    // ==================== MODULE RENDERING ====================

    renderModule() {
        if (!this.element) return;
        
        const stats = this.calculateStats();
        
        this.element.innerHTML = `
            <div class="module-container">
                <!-- Header Section -->
                <div class="module-header">
                    <div class="header-title">
                        <h1 class="module-title">💰 Sales Records</h1>
                        <p class="module-subtitle">Track sales, revenue, and production integration</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="sales-btn-new">
                            ➕ Record Sale
                        </button>
                        <button class="btn btn-secondary" id="sales-btn-production">
                            🏭 Sell from Production
                        </button>
                    </div>
                </div>
                
                <!-- Stats Dashboard -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${this.formatCurrency(stats.todayRevenue)}</div>
                        <div class="stat-label">Today's Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${stats.totalSales}</div>
                        <div class="stat-label">Total Sales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🍗</div>
                        <div class="stat-value">${stats.meatWeight.toFixed(1)} kg</div>
                        <div class="stat-label">Meat Sold</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🐄</div>
                        <div class="stat-value">${stats.animalsSold}</div>
                        <div class="stat-label">Animals Sold</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3>⚡ Quick Actions</h3>
                    <div class="action-grid">
                        <button class="action-card" data-action="quick-sale">
                            <div class="action-icon">💰</div>
                            <div class="action-title">Quick Sale</div>
                            <div class="action-desc">Fast transaction</div>
                        </button>
                        <button class="action-card" data-action="meat-sale">
                            <div class="action-icon">🍗</div>
                            <div class="action-title">Meat Sale</div>
                            <div class="action-desc">Weight-based sale</div>
                        </button>
                        <button class="action-card" data-action="production-sale">
                            <div class="action-icon">🏭</div>
                            <div class="action-title">From Production</div>
                            <div class="action-desc">Sell produced items</div>
                        </button>
                        <button class="action-card" data-action="daily-report">
                            <div class="action-icon">📈</div>
                            <div class="action-title">Daily Report</div>
                            <div class="action-desc">Today's summary</div>
                        </button>
                    </div>
                </div>
                
                <!-- Production Integration -->
                <div class="glass-card production-section">
                    <div class="section-header">
                        <h3>🔄 Production Integration</h3>
                        <p>Sell items directly from production records</p>
                    </div>
                    <div id="production-items-container">
                        ${this.renderProductionItems()}
                    </div>
                </div>
                
                <!-- Recent Sales Table -->
                <div class="sales-section">
                    <div class="section-header">
                        <h3>📋 Recent Sales</h3>
                        <div class="filter-controls">
                            <select id="sales-period-filter" class="form-select">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                    <div id="sales-table-container">
                        ${this.renderSalesTable('today')}
                    </div>
                </div>
            </div>
            
            <!-- Sale Modal -->
            <div class="popout-modal hidden" id="sales-modal">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="sales-modal-title">Record New Sale</h3>
                        <button class="popout-modal-close" id="sales-modal-close">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="sales-form">
                            <input type="hidden" id="sale-id">
                            <input type="hidden" id="production-source-id">
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-date" class="form-label">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-customer" class="form-label">Customer</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-product" class="form-label">Product *</label>
                                    <select id="sale-product" class="form-input" required>
                                        <option value="">Select Product</option>
                                        ${this.renderProductOptions()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-unit" class="form-label">Unit *</label>
                                    <select id="sale-unit" class="form-input" required>
                                        <option value="">Select Unit</option>
                                        ${this.renderUnitOptions()}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Meat Sale Section -->
                            <div id="meat-sale-section" style="display: none; margin-bottom: 20px;">
                                <div class="form-section-header">
                                    <span class="section-icon">🍗</span> Meat Sale Details
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="meat-animal-count" class="form-label">Number of Animals *</label>
                                        <input type="number" id="meat-animal-count" class="form-input" min="1" step="1">
                                    </div>
                                    <div class="form-group">
                                        <label for="meat-weight" class="form-label">Total Weight *</label>
                                        <div style="display: flex;">
                                            <input type="number" id="meat-weight" class="form-input" min="0.1" step="0.1" style="border-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;">
                                            <select id="meat-weight-unit" class="form-input" style="border-top-left-radius: 0; border-bottom-left-radius: 0; width: auto;">
                                                <option value="kg">kg</option>
                                                <option value="lbs">lbs</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="meat-price" class="form-label">Price per kg *</label>
                                    <input type="number" id="meat-price" class="form-input" min="0" step="0.01">
                                </div>
                            </div>
                            
                            <!-- Standard Sale Section -->
                            <div id="standard-sale-section">
                                <div class="form-section-header">
                                    <span class="section-icon">📦</span> Standard Sale Details
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="standard-quantity" class="form-label">Quantity *</label>
                                        <input type="number" id="standard-quantity" class="form-input" min="0.01" step="0.01">
                                    </div>
                                    <div class="form-group">
                                        <label for="standard-price" class="form-label">Unit Price *</label>
                                        <input type="number" id="standard-price" class="form-input" min="0" step="0.01">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sale-payment" class="form-label">Payment Method *</label>
                                    <select id="sale-payment" class="form-input" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="mobile">Mobile Payment</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-status" class="form-label">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="sale-notes" class="form-label">Notes</label>
                                <textarea id="sale-notes" class="form-input" rows="3" placeholder="Additional notes..."></textarea>
                            </div>
                            
                            <div class="total-display">
                                <div class="total-label">Sale Total:</div>
                                <div class="total-amount" id="sale-total-display">$0.00</div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-secondary" id="sales-modal-cancel">Cancel</button>
                        <button class="btn btn-danger" id="sales-modal-delete" style="display: none;">Delete</button>
                        <button class="btn btn-primary" id="sales-modal-save">Save Sale</button>
                    </div>
                </div>
            </div>
            
            <!-- Production Items Modal -->
            <div class="popout-modal hidden" id="production-items-modal">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">🏭 Available Production Items</h3>
                        <button class="popout-modal-close" id="production-modal-close">&times;</button>
                    </div>
                    <div class="popout-modal-body" id="production-items-list">
                        <!-- Production items will be loaded here -->
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-secondary" id="production-modal-close-btn">Close</button>
                        <button class="btn btn-primary" id="production-modal-new">New Sale</button>
                    </div>
                </div>
            </div>
            
            <!-- Report Modal -->
            <div class="popout-modal hidden" id="report-modal">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📊 Sales Report</h3>
                        <button class="popout-modal-close" id="report-modal-close">&times;</button>
                    </div>
                    <div class="popout-modal-body" id="report-content">
                        <!-- Report content will be loaded here -->
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-secondary" id="report-modal-close-btn">Close</button>
                        <button class="btn btn-primary" id="report-modal-print">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.initializeDatePicker();
        console.log('✅ Module rendered successfully');
    },

    // ==================== RENDER HELPER FUNCTIONS ====================

    renderProductOptions() {
        const productGroups = {
            'Livestock (Meat)': [
                { value: 'broilers-dressed', label: 'Broilers (Dressed)' },
                { value: 'pork', label: 'Pork' },
                { value: 'beef', label: 'Beef' },
                { value: 'chicken-parts', label: 'Chicken Parts' },
                { value: 'goat', label: 'Goat' },
                { value: 'lamb', label: 'Lamb' }
            ],
            'Poultry': [
                { value: 'broilers-live', label: 'Broilers (Live)' },
                { value: 'layers', label: 'Layers' },
                { value: 'chicks', label: 'Baby Chicks' }
            ],
            'Eggs & Dairy': [
                { value: 'eggs', label: 'Eggs' },
                { value: 'milk', label: 'Milk' },
                { value: 'cheese', label: 'Cheese' },
                { value: 'yogurt', label: 'Yogurt' }
            ],
            'Produce': [
                { value: 'tomatoes', label: 'Tomatoes' },
                { value: 'peppers', label: 'Peppers' },
                { value: 'cucumbers', label: 'Cucumbers' },
                { value: 'lettuce', label: 'Lettuce' }
            ],
            'Other': [
                { value: 'honey', label: 'Honey' },
                { value: 'bread', label: 'Bread' },
                { value: 'other', label: 'Other' }
            ]
        };
        
        let html = '';
        for (const [groupName, products] of Object.entries(productGroups)) {
            html += `<optgroup label="${groupName}">`;
            products.forEach(product => {
                html += `<option value="${product.value}">${product.label}</option>`;
            });
            html += '</optgroup>';
        }
        return html;
    },

    renderUnitOptions() {
        const units = [
            { value: 'kg', label: 'Kilograms (kg)', category: 'weight' },
            { value: 'lbs', label: 'Pounds (lbs)', category: 'weight' },
            { value: 'birds', label: 'Birds', category: 'count' },
            { value: 'animals', label: 'Animals', category: 'count' },
            { value: 'dozen', label: 'Dozen', category: 'count' },
            { value: 'pieces', label: 'Pieces', category: 'count' },
            { value: 'liters', label: 'Liters', category: 'volume' },
            { value: 'cases', label: 'Cases', category: 'count' },
            { value: 'crates', label: 'Crates', category: 'count' }
        ];
        
        const grouped = {};
        units.forEach(unit => {
            if (!grouped[unit.category]) grouped[unit.category] = [];
            grouped[unit.category].push(unit);
        });
        
        let html = '';
        for (const [category, categoryUnits] of Object.entries(grouped)) {
            const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
            html += `<optgroup label="${categoryLabel}">`;
            categoryUnits.forEach(unit => {
                html += `<option value="${unit.value}">${unit.label}</option>`;
            });
            html += '</optgroup>';
        }
        return html;
    },

    renderProductionItems() {
        const productionData = JSON.parse(localStorage.getItem('farm_production_data') || '[]');
        const availableItems = this.getAvailableProductionItems(productionData);
        
        if (availableItems.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🏭</div>
                    <h4>No Production Items Available</h4>
                    <p>Add production records to sell them here</p>
                    <button class="btn btn-secondary" data-action="navigate-to-production">
                        Go to Production Module
                    </button>
                </div>
            `;
        }
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                ${availableItems.slice(0, 4).map(item => `
                    <div class="production-item" data-item-id="${item.id}">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <span style="font-size: 24px;">${this.getProductIcon(item.product)}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(item.product)}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Produced: ${this.formatDate(item.date)}</div>
                            </div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Available:</span>
                                <span style="font-weight: 500; color: var(--text-primary);">${item.availableQuantity} ${item.unit}</span>
                            </div>
                        </div>
                        <button class="btn btn-small btn-primary" 
                                data-action="sell-production-item" 
                                data-item-id="${item.id}"
                                style="width: 100%;">
                            Sell This Item
                        </button>
                    </div>
                `).join('')}
            </div>
            ${availableItems.length > 4 ? `
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-link" data-action="view-all-production">
                        View all ${availableItems.length} production items →
                    </button>
                </div>
            ` : ''}
        `;
    },

    renderSalesTable(period = 'today') {
        const sales = this.getFilteredSales(period);
        
        if (sales.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h4>No Sales Found</h4>
                    <p>Record your first sale to get started</p>
                </div>
            `;
        }
        
        return `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr data-sale-id="${sale.id}">
                                <td>${this.formatDate(sale.date)}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 18px;">${this.getProductIcon(sale.product)}</span>
                                        <span>${this.formatProductName(sale.product)}</span>
                                    </div>
                                </td>
                                <td>${sale.customer || 'Walk-in'}</td>
                                <td>${this.formatQuantity(sale)}</td>
                                <td>${this.formatCurrency(sale.unitPrice)}/${this.getUnitDisplay(sale)}</td>
                                <td style="font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                <td>
                                    <div style="display: flex; gap: 4px;">
                                        <button class="btn-icon" data-action="edit-sale" data-sale-id="${sale.id}" title="Edit">
                                            ✏️
                                        </button>
                                        <button class="btn-icon" data-action="delete-sale" data-sale-id="${sale.id}" title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ==================== EVENT HANDLING ====================

    setupEventSystem() {
        this.removeEventListeners();
        this.setupClickDelegation();
    },

    setupEventListeners() {
        // Main action buttons
        document.getElementById('sales-btn-new')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('sales-btn-production')?.addEventListener('click', () => this.showProductionModal());
        
        // Modal close buttons
        document.getElementById('sales-modal-close')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('sales-modal-cancel')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('production-modal-close')?.addEventListener('click', () => this.hideProductionModal());
        document.getElementById('production-modal-close-btn')?.addEventListener('click', () => this.hideProductionModal());
        document.getElementById('report-modal-close')?.addEventListener('click', () => this.hideReportModal());
        document.getElementById('report-modal-close-btn')?.addEventListener('click', () => this.hideReportModal());
        
        // Sale modal actions
        document.getElementById('sales-modal-save')?.addEventListener('click', () => this.saveSale());
        document.getElementById('sales-modal-delete')?.addEventListener('click', () => this.deleteSale());
        
        // Production modal actions
        document.getElementById('production-modal-new')?.addEventListener('click', () => {
            this.hideProductionModal();
            this.showSaleModal();
        });
        
        // Report modal actions
        document.getElementById('report-modal-print')?.addEventListener('click', () => this.printReport());
        
        // Filter change
        document.getElementById('sales-period-filter')?.addEventListener('change', (e) => {
            this.filterSales(e.target.value);
        });
        
        // Form field changes
        document.getElementById('sale-product')?.addEventListener('change', () => this.handleProductChange());
        document.getElementById('standard-quantity')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('standard-price')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('meat-animal-count')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('meat-weight')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('meat-price')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('meat-weight-unit')?.addEventListener('change', () => this.updateMeatPriceLabel());
    },

    setupClickDelegation() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset.action || target.closest('[data-action]')?.dataset.action;
            
            if (!action) return;
            
            e.preventDefault();
            
            switch (action) {
                case 'quick-sale':
                    this.showQuickSaleForm();
                    break;
                case 'meat-sale':
                    this.showMeatSaleForm();
                    break;
                case 'production-sale':
                    this.showProductionModal();
                    break;
                case 'daily-report':
                    this.generateDailyReport();
                    break;
                case 'view-all-production':
                    this.showProductionModal();
                    break;
                case 'sell-production-item':
                    const itemId = target.dataset.itemId || target.closest('[data-item-id]')?.dataset.itemId;
                    if (itemId) this.sellProductionItem(itemId);
                    break;
                case 'navigate-to-production':
                    this.navigateToProduction();
                    break;
                case 'edit-sale':
                    const saleId = target.dataset.saleId || target.closest('[data-sale-id]')?.dataset.saleId;
                    if (saleId) this.editSale(saleId);
                    break;
                case 'delete-sale':
                    const deleteId = target.dataset.saleId || target.closest('[data-sale-id]')?.dataset.saleId;
                    if (deleteId) this.confirmDeleteSale(deleteId);
                    break;
            }
        });
    },

    removeEventListeners() {
        // Clean up if needed
    },

    // ==================== SALE MANAGEMENT FUNCTIONS ====================

    showSaleModal(saleData = null) {
        const modal = document.getElementById('sales-modal');
        if (!modal) return;
        
        this.resetSaleForm();
        
        if (saleData) {
            this.currentSaleId = saleData.id;
            document.getElementById('sales-modal-title').textContent = 'Edit Sale';
            document.getElementById('sales-modal-delete').style.display = 'inline-block';
            this.populateSaleForm(saleData);
        } else {
            this.currentSaleId = null;
            document.getElementById('sales-modal-title').textContent = 'Record New Sale';
            document.getElementById('sales-modal-delete').style.display = 'none';
            
            if (this.pendingProductionSale) {
                this.prefillFromProduction(this.pendingProductionSale);
                this.pendingProductionSale = null;
            }
        }
        
        modal.classList.remove('hidden');
        this.initializeDatePicker();
        this.calculateTotal();
    },

    resetSaleForm() {
        const form = document.getElementById('sales-form');
        if (form) form.reset();
        
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = this.getCurrentDate();
        }
        
        const paymentSelect = document.getElementById('sale-payment');
        if (paymentSelect) paymentSelect.value = 'cash';
        
        const statusSelect = document.getElementById('sale-status');
        if (statusSelect) statusSelect.value = 'paid';
        
        document.getElementById('sale-id').value = '';
        document.getElementById('production-source-id').value = '';
        
        document.getElementById('meat-sale-section').style.display = 'none';
        document.getElementById('standard-sale-section').style.display = 'block';
    },

    populateSaleForm(sale) {
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        if (this.isMeatProduct(sale.product)) {
            document.getElementById('meat-animal-count').value = sale.animalCount || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice || '';
        } else {
            document.getElementById('standard-quantity').value = sale.quantity || '';
            document.getElementById('standard-price').value = sale.unitPrice || '';
        }
        
        this.handleProductChange();
        this.calculateTotal();
    },

    prefillFromProduction(productionData) {
        if (!productionData) return;
        
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.value = productionData.product || '';
            this.handleProductChange();
        }
        
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = productionData.unit || '';
        
        if (this.isMeatProduct(productionData.product)) {
            document.getElementById('meat-animal-count').value = productionData.availableQuantity || '';
        } else {
            document.getElementById('standard-quantity').value = productionData.availableQuantity || '';
        }
        
        document.getElementById('production-source-id').value = productionData.id || '';
        
        const notesField = document.getElementById('sale-notes');
        if (notesField && productionData.id) {
            notesField.value = `From production: ${productionData.product} (ID: ${productionData.id})`;
        }
        
        this.setDefaultPrice(productionData.product);
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        const isMeat = this.isMeatProduct(product);
        
        document.getElementById('meat-sale-section').style.display = isMeat ? 'block' : 'none';
        document.getElementById('standard-sale-section').style.display = isMeat ? 'none' : 'block';
        
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect && !unitSelect.value) {
            if (isMeat) {
                unitSelect.value = 'animals';
            } else if (product === 'eggs') {
                unitSelect.value = 'dozen';
            } else if (product === 'milk') {
                unitSelect.value = 'liters';
            } else {
                unitSelect.value = 'kg';
            }
        }
        
        if (isMeat) {
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit && !weightUnit.value) {
                weightUnit.value = 'kg';
            }
            this.updateMeatPriceLabel();
        }
        
        this.setDefaultPrice(product);
        this.calculateTotal();
    },

    updateMeatPriceLabel() {
        const weightUnit = document.getElementById('meat-weight-unit');
        const priceLabel = document.querySelector('label[for="meat-price"]');
        
        if (weightUnit && priceLabel) {
            const unit = weightUnit.value === 'lbs' ? 'lb' : 'kg';
            priceLabel.textContent = `Price per ${unit} *`;
        }
    },

    calculateTotal() {
        const product = document.getElementById('sale-product')?.value;
        let total = 0;
        
        if (this.isMeatProduct(product)) {
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
            total = weight * price;
        } else {
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
            total = quantity * price;
        }
        
        const totalDisplay = document.getElementById('sale-total-display');
        if (totalDisplay) {
            totalDisplay.textContent = this.formatCurrency(total);
        }
        
        return total;
    },

    collectSaleData() {
        const form = document.getElementById('sales-form');
        const formData = new FormData(form);
        
        const sale = {
            id: this.currentSaleId || 'SALE-' + Date.now(),
            date: formData.get('sale-date'),
            customer: formData.get('sale-customer'),
            product: formData.get('sale-product'),
            unit: formData.get('sale-unit'),
            paymentMethod: formData.get('sale-payment'),
            paymentStatus: formData.get('sale-status'),
            notes: formData.get('sale-notes'),
            createdAt: new Date().toISOString()
        };
        
        const productionSourceId = formData.get('production-source-id');
        if (productionSourceId) {
            sale.productionSourceId = productionSourceId;
            sale.productionSource = true;
        }
        
        if (this.isMeatProduct(sale.product)) {
            sale.animalCount = parseInt(formData.get('meat-animal-count')) || 0;
            sale.weight = parseFloat(formData.get('meat-weight')) || 0;
            sale.weightUnit = formData.get('meat-weight-unit');
            sale.unitPrice = parseFloat(formData.get('meat-price')) || 0;
            sale.quantity = sale.animalCount;
            sale.totalAmount = sale.weight * sale.unitPrice;
        } else {
            sale.quantity = parseFloat(formData.get('standard-quantity')) || 0;
            sale.unitPrice = parseFloat(formData.get('standard-price')) || 0;
            sale.totalAmount = sale.quantity * sale.unitPrice;
        }
        
        return sale;
    },

    validateSale(sale) {
        const errors = [];
        
        if (!sale.date) errors.push('Sale date is required');
        if (!sale.product) errors.push('Product is required');
        if (!sale.unit) errors.push('Unit is required');
        if (!sale.paymentMethod) errors.push('Payment method is required');
        
        if (this.isMeatProduct(sale.product)) {
            if (!sale.animalCount || sale.animalCount <= 0) errors.push('Number of animals must be greater than 0');
            if (!sale.weight || sale.weight <= 0) errors.push('Weight must be greater than 0');
            if (!sale.unitPrice || sale.unitPrice <= 0) errors.push('Price must be greater than 0');
        } else {
            if (!sale.quantity || sale.quantity <= 0) errors.push('Quantity must be greater than 0');
            if (!sale.unitPrice || sale.unitPrice <= 0) errors.push('Price must be greater than 0');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    saveSale() {
        const saleData = this.collectSaleData();
        const validation = this.validateSale(saleData);
        
        if (!validation.isValid) {
            this.showNotification(validation.errors.join(', '), 'error');
            return;
        }
        
        if (this.currentSaleId) {
            this.updateSale(this.currentSaleId, saleData);
            this.showNotification('Sale updated successfully!', 'success');
        } else {
            this.addSale(saleData);
            this.showNotification('Sale recorded successfully!', 'success');
        }
        
        this.hideSaleModal();
        this.renderModule();
        this.saveData();
    },

    addSale(sale) {
        window.FarmModules.appData.sales.push(sale);
        this.broadcastSaleRecorded(sale);
    },

    updateSale(saleId, updatedData) {
        const index = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
        if (index !== -1) {
            const oldSale = window.FarmModules.appData.sales[index];
            window.FarmModules.appData.sales[index] = { ...oldSale, ...updatedData };
            
            this.broadcast('sale-updated', {
                saleId: saleId,
                oldTotal: oldSale.totalAmount,
                newTotal: updatedData.totalAmount
            });
        }
    },

    confirmDeleteSale(saleId) {
        if (confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
            this.deleteSale(saleId);
        }
    },

    deleteSale(saleId) {
        const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (!sale) {
            this.showNotification('Sale not found', 'error');
            return;
        }
        
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        
        this.broadcast('sale-deleted', {
            saleId: saleId,
            amount: sale.totalAmount
        });
        
        this.renderModule();
        this.saveData();
        this.showNotification('Sale deleted successfully', 'success');
        
        this.hideSaleModal();
    },

    editSale(saleId) {
        const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (sale) {
            this.showSaleModal(sale);
        } else {
            this.showNotification('Sale not found', 'error');
        }
    },

    // ==================== PRODUCTION INTEGRATION ====================

    showProductionModal() {
        const modal = document.getElementById('production-items-modal');
        if (!modal) return;
        
        this.loadProductionItems();
        modal.classList.remove('hidden');
    },

    loadProductionItems() {
        const container = document.getElementById('production-items-list');
        if (!container) return;
        
        const productionData = JSON.parse(localStorage.getItem('farm_production_data') || '[]');
        const availableItems = this.getAvailableProductionItems(productionData);
        
        if (availableItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏭</div>
                    <h4>No Production Items Available</h4>
                    <p>Add production records to sell them here</p>
                    <button class="btn btn-secondary" data-action="navigate-to-production">
                        Go to Production Module
                    </button>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; max-height: 60vh; overflow-y: auto; padding: 8px;">
                ${availableItems.map(item => `
                    <div class="production-item-card" data-item-id="${item.id}">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <span style="font-size: 32px; background: #f3f4f6; padding: 12px; border-radius: 8px;">
                                ${this.getProductIcon(item.product)}
                            </span>
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 4px 0; font-size: 16px; color: var(--text-primary);">
                                    ${this.formatProductName(item.product)}
                                </h4>
                                <div style="font-size: 13px; color: var(--text-secondary);">
                                    Produced: ${this.formatDate(item.date)}
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; text-align: center;">
                            <div>
                                <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                                    Total Produced
                                </div>
                                <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
                                    ${item.quantity} ${item.unit}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                                    Available
                                </div>
                                <div style="font-size: 16px; font-weight: 600; color: #10b981;">
                                    ${item.availableQuantity} ${item.unit}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                                    Sold
                                </div>
                                <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
                                    ${item.quantity - item.availableQuantity} ${item.unit}
                                </div>
                            </div>
                        </div>
                        ${item.notes ? `
                            <div style="background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 13px;">
                                <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">Notes:</div>
                                <div style="color: #6b7280; line-height: 1.5;">${item.notes}</div>
                            </div>
                        ` : ''}
                        <div style="text-align: center;">
                            <button class="btn btn-primary" 
                                    data-action="sell-production-item" 
                                    data-item-id="${item.id}"
                                    style="width: 100%;">
                                <span style="margin-right: 8px;">💰</span>
                                Sell This Item
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    },

    getAvailableProductionItems(productionData) {
        const soldItems = {};
        
        window.FarmModules.appData.sales.forEach(sale => {
            if (sale.productionSourceId) {
                soldItems[sale.productionSourceId] = (soldItems[sale.productionSourceId] || 0) + sale.quantity;
            }
        });
        
        return productionData
            .filter(item => {
                const sold = soldItems[item.id] || 0;
                return (item.quantity - sold) > 0;
            })
            .map(item => ({
                ...item,
                availableQuantity: item.quantity - (soldItems[item.id] || 0)
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    sellProductionItem(itemId) {
        const productionData = JSON.parse(localStorage.getItem('farm_production_data') || '[]');
        const item = productionData.find(p => p.id === itemId);
        
        if (!item) {
            this.showNotification('Production item not found', 'error');
            return;
        }
        
        const availableItems = this.getAvailableProductionItems(productionData);
        const availableItem = availableItems.find(a => a.id === itemId);
        
        if (!availableItem || availableItem.availableQuantity <= 0) {
            this.showNotification('This production item is no longer available', 'error');
            return;
        }
        
        this.pendingProductionSale = availableItem;
        this.hideProductionModal();
        this.showSaleModal();
    },

    refreshProductionItems() {
        const container = document.getElementById('production-items-container');
        if (container) {
            container.innerHTML = this.renderProductionItems();
        }
        
        const modalContainer = document.getElementById('production-items-list');
        if (modalContainer) {
            this.loadProductionItems();
        }
    },

    // ==================== UTILITY FUNCTIONS ====================

    getCurrentDate() {
        if (window.DateUtils && window.DateUtils.getToday) {
            return window.DateUtils.getToday();
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDate(dateString) {
        if (!dateString) return '';
        
        if (window.DateUtils && window.DateUtils.formatDate) {
            return window.DateUtils.formatDate(dateString);
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    },

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatProductName(product) {
        const productNames = {
            'broilers-dressed': 'Broilers (Dressed)',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
            'broilers-live': 'Broilers (Live)',
            'layers': 'Layers',
            'chicks': 'Baby Chicks',
            'eggs': 'Eggs',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'yogurt': 'Yogurt',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'honey': 'Honey',
            'bread': 'Bread'
        };
        
        return productNames[product] || product.charAt(0).toUpperCase() + product.slice(1).replace(/-/g, ' ');
    },

    getProductIcon(product) {
        const productIcons = {
            'broilers-dressed': '🍗',
            'pork': '🐖',
            'beef': '🐄',
            'chicken-parts': '🍗',
            'goat': '🐐',
            'lamb': '🐑',
            'broilers-live': '🐔',
            'layers': '🐓',
            'chicks': '🐤',
            'eggs': '🥚',
            'milk': '🥛',
            'cheese': '🧀',
            'yogurt': '🥛',
            'tomatoes': '🍅',
            'peppers': '🌶️',
            'cucumbers': '🥒',
            'lettuce': '🥬',
            'honey': '🍯',
            'bread': '🍞'
        };
        
        return productIcons[product] || '📦';
    },

    isMeatProduct(product) {
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        return meatProducts.includes(product);
    },

    formatQuantity(sale) {
        if (this.isMeatProduct(sale.product)) {
            if (sale.weight && sale.weightUnit) {
                return `${sale.animalCount || sale.quantity} animals (${sale.weight} ${sale.weightUnit})`;
            }
            return `${sale.animalCount || sale.quantity} animals`;
        }
        return `${sale.quantity} ${sale.unit}`;
    },

    getUnitDisplay(sale) {
        if (this.isMeatProduct(sale.product) && sale.weightUnit) {
            return sale.weightUnit;
        }
        return sale.unit;
    },

    getSales() {
        return window.FarmModules.appData.sales || [];
    },

    getFilteredSales(period) {
        const sales = this.getSales();
        
        if (period === 'all' || sales.length === 0) {
            return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (period) {
            case 'today':
                const today = this.getCurrentDate();
                return sales
                    .filter(sale => sale.date === today)
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            default:
                return sales;
        }
        
        return sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= cutoffDate;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    filterSales(period) {
        const container = document.getElementById('sales-table-container');
        if (container) {
            container.innerHTML = this.renderSalesTable(period);
        }
    },

    calculateStats() {
        const sales = this.getSales();
        const today = this.getCurrentDate();
        
        const todaySales = sales.filter(s => s.date === today);
        const meatSales = sales.filter(s => this.isMeatProduct(s.product));
        
        return {
            todayRevenue: todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
            totalSales: sales.length,
            meatWeight: meatSales.reduce((sum, s) => sum + (s.weight || 0), 0),
            animalsSold: meatSales.reduce((sum, s) => sum + (s.animalCount || s.quantity || 0), 0)
        };
    },

    setDefaultPrice(product) {
        const defaultPrices = {
            'broilers-dressed': 5.50,
            'pork': 4.25,
            'beef': 6.75,
            'chicken-parts': 3.95,
            'goat': 5.25,
            'lamb': 6.50,
            'broilers-live': 4.00,
            'layers': 12.00,
            'chicks': 2.50,
            'eggs': 3.25,
            'milk': 2.50,
            'cheese': 6.00,
            'yogurt': 3.50,
            'tomatoes': 1.75,
            'peppers': 2.25,
            'cucumbers': 1.50,
            'lettuce': 1.25,
            'honey': 8.00,
            'bread': 2.75
        };
        
        const price = defaultPrices[product];
        if (price) {
            if (this.isMeatProduct(product)) {
                const priceInput = document.getElementById('meat-price');
                if (priceInput && !priceInput.value) {
                    priceInput.value = price;
                    this.calculateTotal();
                }
            } else {
                const priceInput = document.getElementById('standard-price');
                if (priceInput && !priceInput.value) {
                    priceInput.value = price;
                    this.calculateTotal();
                }
            }
        }
    },

    showMeatSaleForm() {
        this.showSaleModal();
        
        setTimeout(() => {
            const productSelect = document.getElementById('sale-product');
            if (productSelect) {
                productSelect.value = 'broilers-dressed';
                this.handleProductChange();
            }
        }, 100);
    },

    initializeDatePicker() {
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.max = today;
            
            if (!dateInput.value) {
                dateInput.value = today;
            }
        }
    },

    convertOrderToSale(orderData) {
        console.log('📦 Converting order to sale:', orderData);
        
        const sale = {
            id: 'ORDER-' + (orderData.id || Date.now()),
            date: this.getCurrentDate(),
            product: this.mapOrderProduct(orderData.items),
            quantity: this.calculateOrderQuantity(orderData.items),
            unit: 'items',
            unitPrice: this.calculateAveragePrice(orderData),
            totalAmount: orderData.totalAmount || 0,
            customer: orderData.customerName || 'Order Customer',
            paymentMethod: 'order',
            paymentStatus: 'paid',
            notes: `Converted from order ${orderData.id ? '#' + orderData.id : ''}`,
            orderSource: true,
            orderId: orderData.id,
            createdAt: new Date().toISOString()
        };
        
        this.addSale(sale);
        this.renderModule();
        this.saveData();
        this.showNotification(`Order converted to sale`, 'success');
    },

    mapOrderProduct(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return 'other';
        }
        
        const productMap = {
            'broilers': 'broilers-dressed',
            'chickens': 'broilers-dressed',
            'eggs': 'eggs',
            'milk': 'milk',
            'tomatoes': 'tomatoes',
            'peppers': 'peppers'
        };
        
        const firstItem = items[0];
        return productMap[firstItem.productId] || productMap[firstItem.name?.toLowerCase()] || 'other';
    },

    calculateOrderQuantity(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    calculateAveragePrice(orderData) {
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return 0;
        }
        
        const totalQuantity = this.calculateOrderQuantity(orderData.items);
        if (totalQuantity <= 0) return 0;
        
        return (orderData.totalAmount || 0) / totalQuantity;
    },

    checkInventoryLevels(inventoryData) {
        console.log('📦 Checking inventory levels:', inventoryData);
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        const backgrounds = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        
        notification.style.backgroundColor = backgrounds[type] || '#3b82f6';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    hideSaleModal() {
        this.hideModal('sales-modal');
        this.currentSaleId = null;
        this.pendingProductionSale = null;
    },

    hideProductionModal() {
        this.hideModal('production-items-modal');
    },

    hideReportModal() {
        this.hideModal('report-modal');
    },

    // ==================== QUICK SALE FUNCTIONS ====================

    showQuickSaleForm() {
        const formHTML = `
            <div style="padding: 20px;">
                <h4 style="margin: 0 0 20px 0; font-size: 18px; color: var(--text-primary); text-align: center;">
                    ⚡ Quick Sale
                </h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px;">
                            Product
                        </label>
                        <select class="form-input" id="quick-sale-product">
                            <option value="broilers-dressed">Broilers (Dressed)</option>
                            <option value="eggs">Eggs</option>
                            <option value="milk">Milk</option>
                            <option value="tomatoes">Tomatoes</option>
                            <option value="broilers-live">Broilers (Live)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px;">
                            Quantity
                        </label>
                        <input type="number" class="form-input" id="quick-sale-quantity" value="1" min="1">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px;">
                            Unit Price
                        </label>
                        <input type="number" class="form-input" id="quick-sale-price" step="0.01" min="0">
                    </div>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px;">
                        Customer (optional)
                    </label>
                    <input type="text" class="form-input" id="quick-sale-customer" placeholder="Customer name">
                </div>
                <div style="text-align: center; font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 20px 0;">
                    Total: <span id="quick-sale-total">$0.00</span>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" data-action="cancel-quick-sale">Cancel</button>
                    <button class="btn btn-primary" data-action="save-quick-sale">Record Sale</button>
                </div>
            </div>
        `;
        
        this.showCustomModal(formHTML, 'quick-sale-modal');
        this.setupQuickSaleListeners();
    },

    setupQuickSaleListeners() {
        const modal = document.getElementById('quick-sale-modal');
        if (!modal) return;
        
        modal.querySelector('#quick-sale-quantity')?.addEventListener('input', () => this.calculateQuickSaleTotal());
        modal.querySelector('#quick-sale-price')?.addEventListener('input', () => this.calculateQuickSaleTotal());
        modal.querySelector('#quick-sale-product')?.addEventListener('change', () => this.setQuickDefaultPrice());
        
        modal.querySelector('[data-action="save-quick-sale"]')?.addEventListener('click', () => this.saveQuickSale());
        modal.querySelector('[data-action="cancel-quick-sale"]')?.addEventListener('click', () => {
            this.hideModal('quick-sale-modal');
        });
        
        this.setQuickDefaultPrice();
        this.calculateQuickSaleTotal();
    },

    calculateQuickSaleTotal() {
        const modal = document.getElementById('quick-sale-modal');
        if (!modal) return;
        
        const quantity = parseFloat(modal.querySelector('#quick-sale-quantity')?.value) || 0;
        const price = parseFloat(modal.querySelector('#quick-sale-price')?.value) || 0;
        const total = quantity * price;
        
        const totalElement = modal.querySelector('#quick-sale-total');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    setQuickDefaultPrice() {
        const modal = document.getElementById('quick-sale-modal');
        if (!modal) return;
        
        const productSelect = modal.querySelector('#quick-sale-product');
        const priceInput = modal.querySelector('#quick-sale-price');
        
        if (!productSelect || !priceInput) return;
        
        const product = productSelect.value;
        const defaultPrices = {
            'broilers-dressed': 5.50,
            'eggs': 3.25,
            'milk': 2.50,
            'tomatoes': 1.75,
            'broilers-live': 4.00
        };
        
        if (defaultPrices[product] && !priceInput.value) {
            priceInput.value = defaultPrices[product];
            this.calculateQuickSaleTotal();
        }
    },

    saveQuickSale() {
        const modal = document.getElementById('quick-sale-modal');
        if (!modal) return;
        
        const product = modal.querySelector('#quick-sale-product')?.value;
        const quantity = parseFloat(modal.querySelector('#quick-sale-quantity')?.value) || 0;
        const price = parseFloat(modal.querySelector('#quick-sale-price')?.value) || 0;
        const customer = modal.querySelector('#quick-sale-customer')?.value;
        
        if (!product || quantity <= 0 || price <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const sale = {
            id: 'QS-' + Date.now(),
            date: this.getCurrentDate(),
            product: product,
            quantity: quantity,
            unit: 'units',
            unitPrice: price,
            totalAmount: quantity * price,
            customer: customer || 'Walk-in',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            createdAt: new Date().toISOString()
        };
        
        this.addSale(sale);
        this.hideModal('quick-sale-modal');
        this.renderModule();
        this.saveData();
        this.showNotification('Quick sale recorded!', 'success');
    },

    showCustomModal(content, modalId) {
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'popout-modal';
        modal.innerHTML = `
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <button class="popout-modal-close" data-action="close-custom-modal">&times;</button>
                </div>
                <div class="popout-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.querySelector('[data-action="close-custom-modal"]')?.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.classList.remove('hidden');
    },

    // ==================== REPORT FUNCTIONS ====================

    generateDailyReport() {
        const today = this.getCurrentDate();
        const sales = this.getFilteredSales('today');
        
        if (sales.length === 0) {
            this.showNotification('No sales recorded today', 'info');
            return;
        }
        
        const reportContent = this.generateReportContent('Today\'s Sales Report', today, sales);
        this.showReportModal(reportContent);
    },

    generateReportContent(title, date, sales) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;
        
        const productSummary = {};
        sales.forEach(sale => {
            const productName = this.formatProductName(sale.product);
            if (!productSummary[productName]) {
                productSummary[productName] = {
                    quantity: 0,
                    revenue: 0,
                    count: 0
                };
            }
            productSummary[productName].quantity += sale.quantity;
            productSummary[productName].revenue += sale.totalAmount;
            productSummary[productName].count++;
        });
        
        const paymentSummary = {};
        sales.forEach(sale => {
            const method = sale.paymentMethod || 'cash';
            if (!paymentSummary[method]) {
                paymentSummary[method] = {
                    count: 0,
                    revenue: 0
                };
            }
            paymentSummary[method].count++;
            paymentSummary[method].revenue += sale.totalAmount;
        });
        
        return `
            <div style="padding: 20px;">
                <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--glass-border);">
                    <h2 style="margin: 0 0 8px 0; color: var(--text-primary);">${title}</h2>
                    <div style="color: var(--text-secondary); font-size: 14px;">${this.formatDate(date)}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
                    <div style="text-align: center; padding: 20px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 4px;">
                            ${sales.length}
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Sales</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 4px;">
                            ${this.formatCurrency(totalRevenue)}
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 4px;">
                            ${this.formatCurrency(avgSale)}
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Average Sale</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">📦 Products Sold</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="padding: 12px; text-align: left; color: var(--text-secondary); background: var(--glass-bg);">
                                        Product
                                    </th>
                                    <th style="padding: 12px; text-align: left; color: var(--text-secondary); background: var(--glass-bg);">
                                        Quantity
                                    </th>
                                    <th style="padding: 12px; text-align: left; color: var(--text-secondary); background: var(--glass-bg);">
                                        Revenue
                                    </th>
                                    <th style="padding: 12px; text-align: left; color: var(--text-secondary); background: var(--glass-bg);">
                                        Avg Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(productSummary).map(([product, data]) => `
                                    <tr>
                                        <td style="padding: 12px; border-bottom: 1px solid var(--glass-border); color: var(--text-primary);">
                                            ${product}
                                        </td>
                                        <td style="padding: 12px; border-bottom: 1px solid var(--glass-border); color: var(--text-primary);">
                                            ${data.quantity}
                                        </td>
                                        <td style="padding: 12px; border-bottom: 1px solid var(--glass-border); color: var(--text-primary);">
                                            ${this.formatCurrency(data.revenue)}
                                        </td>
                                        <td style="padding: 12px; border-bottom: 1px solid var(--glass-border); color: var(--text-primary);">
                                            ${this.formatCurrency(data.revenue / data.quantity)}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">💳 Payment Methods</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${Object.entries(paymentSummary).map(([method, data]) => `
                            <div style="background: var(--glass-bg); border-radius: 8px; padding: 16px; border: 1px solid var(--glass-border);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
                                    ${method.toUpperCase()}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">
                                    ${data.count} sales
                                </div>
                                <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">
                                    ${this.formatCurrency(data.revenue)}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                    ${((data.revenue / totalRevenue) * 100).toFixed(1)}% of total
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid var(--glass-border); color: var(--text-secondary); font-size: 13px;">
                    Generated on ${this.formatDate(new Date().toISOString())}
                </div>
            </div>
        `;
    },

    showReportModal(content) {
        const modal = document.getElementById('report-modal');
        const container = document.getElementById('report-content');
        
        if (!modal || !container) return;
        
        container.innerHTML = content;
        modal.classList.remove('hidden');
    },

    printReport() {
        const printContent = document.getElementById('report-content')?.innerHTML;
        if (!printContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        Print Report
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // ==================== NAVIGATION ====================

    navigateToProduction() {
        console.log('🔄 Navigating to Production module...');
        
        if (window.FarmModules && window.FarmModules.Production) {
            if (typeof window.FarmModules.Production.initialize === 'function') {
                window.FarmModules.Production.initialize();
                return true;
            }
        }
        
        if (window.FarmModules && window.FarmModules.showModule) {
            window.FarmModules.showModule('production');
            return true;
        }
        
        if (window.FarmModules && window.FarmModules.modules) {
            const module = window.FarmModules.modules.get('production') || 
                          window.FarmModules.modules.get('Production');
            if (module && typeof module.initialize === 'function') {
                module.initialize();
                return true;
            }
        }
        
        window.location.hash = '#production';
        setTimeout(() => {
            if (window.location.hash === '#production') {
                location.reload();
            } else {
                this.showNotification('Please select "Production" from the sidebar menu', 'info');
            }
        }, 100);
        
        return false;
    },

    // ==================== MODULE LIFECYCLE ====================

    unload() {
        console.log('📦 Unloading Sales Record Module...');
        
        this.removeEventListeners();
        
        this.element = null;
        this.broadcaster = null;
        this.initialized = false;
        
        console.log('✅ Sales Record Module unloaded');
    }
};

// ==================== MODULE REGISTRATION ====================

(function registerSalesModule() {
    console.log('📝 Registering Sales Record Module...');
    
    if (!window.FarmModules) {
        console.error('❌ FarmModules framework not found');
        window.FarmModules = {};
    }
    
    window.FarmModules.SalesRecord = SalesRecordModule;
    window.FarmModules.Sales = SalesRecordModule;
    
    if (!window.FarmModules.modules) {
        window.FarmModules.modules = new Map();
    }
    
    window.FarmModules.modules.set('sales-record', SalesRecordModule);
    window.FarmModules.modules.set('sales', SalesRecordModule);
    
    console.log('✅ Sales Record Module registered successfully');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('content-area') && !SalesRecordModule.initialized) {
                SalesRecordModule.initialize();
            }
        });
    } else if (document.getElementById('content-area') && !SalesRecordModule.initialized) {
        setTimeout(() => SalesRecordModule.initialize(), 100);
    }
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesRecordModule;
}
