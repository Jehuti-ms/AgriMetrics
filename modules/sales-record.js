/**
 * COMPLETE SALES RECORD MODULE
 * Version: 3.0.0
 * Features: Production Integration, Weight-based Sales, Broadcaster Support
 * Date: 2024-01-21
 */

console.log('💰 Loading Complete Sales Record Module v3.0...');

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
        
        // Check for content area
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }
        
        // Check dependencies
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
        // Check for essential dependencies
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
            
            // Broadcast data saved event
            this.broadcast('sales-data-saved', {
                count: window.FarmModules.appData.sales.length,
                timestamp: new Date().toISOString()
            });
            
            // Update stats
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
        
        // Listen for order completions
        this.broadcaster.on('order-completed', (data) => {
            console.log('📦 Converting order to sale:', data);
            this.convertOrderToSale(data);
        });
        
        // Listen for production updates
        this.broadcaster.on('production-updated', (data) => {
            console.log('🏭 Production updated, refreshing available items');
            this.refreshProductionItems();
        });
        
        // Listen for inventory updates
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
        
        // Broadcast income update
        this.broadcast('income-updated', {
            amount: sale.totalAmount,
            type: 'sales',
            source: 'sales-record'
        });
        
        // Broadcast meat-specific event if applicable
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
            <div class="sales-module-container">
                <!-- Header Section -->
                <div class="sales-header">
                    <div class="header-content">
                        <h1 class="module-title">
                            <span class="header-icon">💰</span>
                            Sales Records
                        </h1>
                        <p class="module-subtitle">Track sales, revenue, and production integration</p>
                    </div>
                    <div class="header-actions">
                        <button class="sales-btn sales-btn-primary" id="sales-btn-new">
                            <span class="btn-icon">➕</span>
                            Record Sale
                        </button>
                        <button class="sales-btn sales-btn-secondary" id="sales-btn-production">
                            <span class="btn-icon">🏭</span>
                            Sell from Production
                        </button>
                    </div>
                </div>
                
                <!-- Stats Dashboard -->
                <div class="stats-dashboard">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value" id="stat-today-revenue">${this.formatCurrency(stats.todayRevenue)}</div>
                        <div class="stat-label">Today's Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value" id="stat-total-sales">${stats.totalSales}</div>
                        <div class="stat-label">Total Sales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🍗</div>
                        <div class="stat-value" id="stat-meat-weight">${stats.meatWeight.toFixed(1)} kg</div>
                        <div class="stat-label">Meat Sold</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🐄</div>
                        <div class="stat-value" id="stat-animals-sold">${stats.animalsSold}</div>
                        <div class="stat-label">Animals Sold</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h3 class="section-title">
                        <span class="section-icon">⚡</span>
                        Quick Actions
                    </h3>
                    <div class="actions-grid">
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
                <div class="production-integration-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">🔄</span>
                            Production Integration
                        </h3>
                        <p class="section-subtitle">Sell items directly from production records</p>
                    </div>
                    <div id="production-items-container">
                        ${this.renderProductionItems()}
                    </div>
                </div>
                
                <!-- Recent Sales Table -->
                <div class="sales-table-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">📋</span>
                            Recent Sales
                        </h3>
                        <div class="table-controls">
                            <select id="sales-period-filter" class="sales-filter-select">
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
            <div class="sales-modal" id="sales-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="sales-modal-title">Record New Sale</h3>
                        <button class="modal-close" id="sales-modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="sales-form">
                            <input type="hidden" id="sale-id">
                            <input type="hidden" id="production-source-id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-date" class="form-label">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-customer" class="form-label">Customer</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>
                            
                            <div class="form-row">
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
                            <div id="meat-sale-section" class="sale-type-section" style="display: none;">
                                <div class="section-header">
                                    <div class="section-icon">🍗</div>
                                    <h4>Meat Sale Details</h4>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="meat-animal-count" class="form-label">Number of Animals *</label>
                                        <input type="number" id="meat-animal-count" class="form-input" min="1" step="1">
                                    </div>
                                    <div class="form-group">
                                        <label for="meat-weight" class="form-label">Total Weight *</label>
                                        <div class="input-with-unit">
                                            <input type="number" id="meat-weight" class="form-input" min="0.1" step="0.1">
                                            <select id="meat-weight-unit" class="form-unit-select">
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
                            <div id="standard-sale-section" class="sale-type-section">
                                <div class="section-header">
                                    <div class="section-icon">📦</div>
                                    <h4>Standard Sale Details</h4>
                                </div>
                                <div class="form-row">
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
                            
                            <div class="form-row">
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
                            
                            <div class="sale-total-display">
                                <div class="total-label">Sale Total:</div>
                                <div class="total-amount" id="sale-total-display">$0.00</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="sales-btn sales-btn-secondary" id="sales-modal-cancel">Cancel</button>
                        <button class="sales-btn sales-btn-danger" id="sales-modal-delete" style="display: none;">Delete</button>
                        <button class="sales-btn sales-btn-primary" id="sales-modal-save">Save Sale</button>
                    </div>
                </div>
            </div>
            
            <!-- Production Items Modal -->
            <div class="sales-modal" id="production-items-modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-icon">🏭</span>
                            Available Production Items
                        </h3>
                        <button class="modal-close" id="production-modal-close">&times;</button>
                    </div>
                    <div class="modal-body" id="production-items-list">
                        <!-- Production items will be loaded here -->
                    </div>
                    <div class="modal-footer">
                        <button class="sales-btn sales-btn-secondary" id="production-modal-close-btn">Close</button>
                        <button class="sales-btn sales-btn-primary" id="production-modal-new">New Sale</button>
                    </div>
                </div>
            </div>
            
            <!-- Report Modal -->
            <div class="sales-modal" id="report-modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-icon">📊</span>
                            Sales Report
                        </h3>
                        <button class="modal-close" id="report-modal-close">&times;</button>
                    </div>
                    <div class="modal-body" id="report-content">
                        <!-- Report content will be loaded here -->
                    </div>
                    <div class="modal-footer">
                        <button class="sales-btn sales-btn-secondary" id="report-modal-close-btn">Close</button>
                        <button class="sales-btn sales-btn-primary" id="report-modal-print">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize date picker
        this.initializeDatePicker();
        
        console.log('✅ Module rendered successfully');
    },

    // ==================== RENDER HELPER FUNCTIONS ====================

    renderProductOptions() {
        const productGroups = {
            'Livestock (Meat)': [
                { value: 'broilers-dressed', label: 'Broilers (Dressed)', emoji: '🍗' },
                { value: 'pork', label: 'Pork', emoji: '🐖' },
                { value: 'beef', label: 'Beef', emoji: '🐄' },
                { value: 'chicken-parts', label: 'Chicken Parts', emoji: '🍗' },
                { value: 'goat', label: 'Goat', emoji: '🐐' },
                { value: 'lamb', label: 'Lamb', emoji: '🐑' }
            ],
            'Poultry': [
                { value: 'broilers-live', label: 'Broilers (Live)', emoji: '🐔' },
                { value: 'layers', label: 'Layers', emoji: '🐓' },
                { value: 'chicks', label: 'Baby Chicks', emoji: '🐤' }
            ],
            'Eggs & Dairy': [
                { value: 'eggs', label: 'Eggs', emoji: '🥚' },
                { value: 'milk', label: 'Milk', emoji: '🥛' },
                { value: 'cheese', label: 'Cheese', emoji: '🧀' },
                { value: 'yogurt', label: 'Yogurt', emoji: '🥛' }
            ],
            'Produce': [
                { value: 'tomatoes', label: 'Tomatoes', emoji: '🍅' },
                { value: 'peppers', label: 'Peppers', emoji: '🌶️' },
                { value: 'cucumbers', label: 'Cucumbers', emoji: '🥒' },
                { value: 'lettuce', label: 'Lettuce', emoji: '🥬' }
            ],
            'Other Products': [
                { value: 'honey', label: 'Honey', emoji: '🍯' },
                { value: 'bread', label: 'Bread', emoji: '🍞' },
                { value: 'other', label: 'Other', emoji: '📦' }
            ]
        };
        
        let html = '';
        
        for (const [groupName, products] of Object.entries(productGroups)) {
            html += `<optgroup label="${groupName}">`;
            products.forEach(product => {
                html += `<option value="${product.value}">${product.emoji} ${product.label}</option>`;
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
            { value: 'crates', label: 'Crates', category: 'count' },
            { value: 'bags', label: 'Bags', category: 'count' }
        ];
        
        // Group by category
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
        // Get production data
        const productionData = JSON.parse(localStorage.getItem('farm_production_data') || '[]');
        const availableItems = this.getAvailableProductionItems(productionData);
        
        if (availableItems.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🏭</div>
                    <h4 class="empty-title">No Production Items Available</h4>
                    <p class="empty-message">Add production records to sell them here</p>
                    <button class="sales-btn sales-btn-secondary" data-action="navigate-to-production">
                        Go to Production Module
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="production-items-grid">
                ${availableItems.slice(0, 4).map(item => `
                    <div class="production-item-card" data-item-id="${item.id}">
                        <div class="item-header">
                            <span class="item-icon">${this.getProductIcon(item.product)}</span>
                            <span class="item-name">${this.formatProductName(item.product)}</span>
                        </div>
                        <div class="item-details">
                            <div class="detail-row">
                                <span class="detail-label">Available:</span>
                                <span class="detail-value">${item.availableQuantity} ${item.unit}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Produced:</span>
                                <span class="detail-value">${this.formatDate(item.date)}</span>
                            </div>
                            ${item.notes ? `
                                <div class="detail-row">
                                    <span class="detail-label">Notes:</span>
                                    <span class="detail-value notes">${item.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                        <button class="sales-btn sales-btn-small sales-btn-primary" 
                                data-action="sell-production-item" 
                                data-item-id="${item.id}">
                            Sell This Item
                        </button>
                    </div>
                `).join('')}
            </div>
            ${availableItems.length > 4 ? `
                <div class="view-more-section">
                    <button class="sales-btn sales-btn-link" data-action="view-all-production">
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
                    <h4 class="empty-title">No Sales Found</h4>
                    <p class="empty-message">Record your first sale to get started</p>
                </div>
            `;
        }
        
        return `
            <div class="sales-table-wrapper">
                <table class="sales-table">
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
                                    <div class="product-cell">
                                        <span class="product-icon">${this.getProductIcon(sale.product)}</span>
                                        <span class="product-name">${this.formatProductName(sale.product)}</span>
                                    </div>
                                </td>
                                <td>${sale.customer || 'Walk-in'}</td>
                                <td>${this.formatQuantity(sale)}</td>
                                <td>${this.formatCurrency(sale.unitPrice)}/${this.getUnitDisplay(sale)}</td>
                                <td class="total-cell">${this.formatCurrency(sale.totalAmount)}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="action-btn edit-btn" data-action="edit-sale" data-sale-id="${sale.id}" title="Edit">
                                            ✏️
                                        </button>
                                        <button class="action-btn delete-btn" data-action="delete-sale" data-sale-id="${sale.id}" title="Delete">
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

    // ==================== EVENT HANDLING SYSTEM ====================

    setupEventSystem() {
        // Remove any existing listeners
        this.removeEventListeners();
        
        // Set up click delegation
        this.setupClickDelegation();
        
        // Set up input/change listeners
        this.setupInputListeners();
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
                // Quick actions
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
                    
                // Production items
                case 'sell-production-item':
                    const itemId = target.dataset.itemId || target.closest('[data-item-id]')?.dataset.itemId;
                    if (itemId) this.sellProductionItem(itemId);
                    break;
                    
                // Navigation
                case 'navigate-to-production':
                    this.navigateToProduction();
                    break;
                    
                // Table actions
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

    setupInputListeners() {
        // Global input/change listeners
        document.addEventListener('input', this.handleGlobalInput.bind(this));
        document.addEventListener('change', this.handleGlobalChange.bind(this));
    },

    handleGlobalInput(e) {
        // Handle any global input events if needed
    },

    handleGlobalChange(e) {
        // Handle any global change events if needed
    },

    removeEventListeners() {
        // Clean up event listeners
        const eventTypes = ['click', 'input', 'change'];
        eventTypes.forEach(type => {
            document.removeEventListener(type, this.handleGlobalInput);
            document.removeEventListener(type, this.handleGlobalChange);
        });
    },

    // ==================== SALE MANAGEMENT FUNCTIONS ====================

    showSaleModal(saleData = null) {
        const modal = document.getElementById('sales-modal');
        if (!modal) return;
        
        // Reset form first
        this.resetSaleForm();
        
        if (saleData) {
            // Edit mode
            this.currentSaleId = saleData.id;
            document.getElementById('sales-modal-title').textContent = 'Edit Sale';
            document.getElementById('sales-modal-delete').style.display = 'inline-block';
            this.populateSaleForm(saleData);
        } else {
            // New sale mode
            this.currentSaleId = null;
            document.getElementById('sales-modal-title').textContent = 'Record New Sale';
            document.getElementById('sales-modal-delete').style.display = 'none';
            
            // If we have pending production sale, pre-fill
            if (this.pendingProductionSale) {
                this.prefillFromProduction(this.pendingProductionSale);
                this.pendingProductionSale = null;
            }
        }
        
        // Show modal
        modal.classList.add('active');
        
        // Initialize date
        this.initializeDatePicker();
        
        // Calculate initial total
        this.calculateTotal();
    },

    resetSaleForm() {
        const form = document.getElementById('sales-form');
        if (form) form.reset();
        
        // Set default date
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = this.getCurrentDate();
        }
        
        // Set default payment method
        const paymentSelect = document.getElementById('sale-payment');
        if (paymentSelect) paymentSelect.value = 'cash';
        
        // Set default status
        const statusSelect = document.getElementById('sale-status');
        if (statusSelect) statusSelect.value = 'paid';
        
        // Reset hidden fields
        document.getElementById('sale-id').value = '';
        document.getElementById('production-source-id').value = '';
        
        // Reset sections
        document.getElementById('meat-sale-section').style.display = 'none';
        document.getElementById('standard-sale-section').style.display = 'block';
    },

    populateSaleForm(sale) {
        // Populate basic fields
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        // Populate sale type specific fields
        if (this.isMeatProduct(sale.product)) {
            document.getElementById('meat-animal-count').value = sale.animalCount || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice || '';
        } else {
            document.getElementById('standard-quantity').value = sale.quantity || '';
            document.getElementById('standard-price').value = sale.unitPrice || '';
        }
        
        // Handle product change
        this.handleProductChange();
        
        // Update total
        this.calculateTotal();
    },

    prefillFromProduction(productionData) {
        if (!productionData) return;
        
        // Set product
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.value = productionData.product || '';
            this.handleProductChange();
        }
        
        // Set unit
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = productionData.unit || '';
        
        // Set quantity
        if (this.isMeatProduct(productionData.product)) {
            document.getElementById('meat-animal-count').value = productionData.availableQuantity || '';
        } else {
            document.getElementById('standard-quantity').value = productionData.availableQuantity || '';
        }
        
        // Set source ID
        document.getElementById('production-source-id').value = productionData.id || '';
        
        // Add note
        const notesField = document.getElementById('sale-notes');
        if (notesField && productionData.id) {
            notesField.value = `From production: ${productionData.product} (ID: ${productionData.id})`;
        }
        
        // Set default price
        this.setDefaultPrice(productionData.product);
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        const isMeat = this.isMeatProduct(product);
        
        // Show/hide sections
        document.getElementById('meat-sale-section').style.display = isMeat ? 'block' : 'none';
        document.getElementById('standard-sale-section').style.display = isMeat ? 'none' : 'block';
        
        // Set appropriate unit
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
        
        // Set weight unit for meat
        if (isMeat) {
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit && !weightUnit.value) {
                weightUnit.value = 'kg';
            }
            this.updateMeatPriceLabel();
        }
        
        // Set default price
        this.setDefaultPrice(product);
        
        // Recalculate total
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
        
        // Update display
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
        
        // Get production source if any
        const productionSourceId = formData.get('production-source-id');
        if (productionSourceId) {
            sale.productionSourceId = productionSourceId;
            sale.productionSource = true;
        }
        
        // Add sale type specific data
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
        
        // Required fields
        if (!sale.date) errors.push('Sale date is required');
        if (!sale.product) errors.push('Product is required');
        if (!sale.unit) errors.push('Unit is required');
        if (!sale.paymentMethod) errors.push('Payment method is required');
        
        // Validate based on product type
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
            // Update existing sale
            this.updateSale(this.currentSaleId, saleData);
            this.showNotification('Sale updated successfully!', 'success');
        } else {
            // Add new sale
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
            
            // Broadcast update
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
        
        // Remove from array
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        
        // Broadcast deletion
        this.broadcast('sale-deleted', {
            saleId: saleId,
            amount: sale.totalAmount
        });
        
        // Update UI and save
        this.renderModule();
        this.saveData();
        this.showNotification('Sale deleted successfully', 'success');
        
        // Close modal if open
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
        
        // Load production items
        this.loadProductionItems();
        
        // Show modal
        modal.classList.add('active');
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
                    <h4 class="empty-title">No Production Items Available</h4>
                    <p class="empty-message">Add production records to sell them here</p>
                    <button class="sales-btn sales-btn-secondary" data-action="navigate-to-production">
                        Go to Production Module
                    </button>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="production-items-full-grid">
                ${availableItems.map(item => `
                    <div class="production-item-full-card" data-item-id="${item.id}">
                        <div class="item-full-header">
                            <span class="item-full-icon">${this.getProductIcon(item.product)}</span>
                            <div class="item-full-info">
                                <h4 class="item-full-name">${this.formatProductName(item.product)}</h4>
                                <div class="item-full-date">Produced: ${this.formatDate(item.date)}</div>
                            </div>
                        </div>
                        <div class="item-full-stats">
                            <div class="stat-item">
                                <div class="stat-label">Total Produced</div>
                                <div class="stat-value">${item.quantity} ${item.unit}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Available</div>
                                <div class="stat-value available">${item.availableQuantity} ${item.unit}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Sold</div>
                                <div class="stat-value">${item.quantity - item.availableQuantity} ${item.unit}</div>
                            </div>
                        </div>
                        ${item.notes ? `
                            <div class="item-full-notes">
                                <div class="notes-label">Notes:</div>
                                <div class="notes-content">${item.notes}</div>
                            </div>
                        ` : ''}
                        <div class="item-full-actions">
                            <button class="sales-btn sales-btn-primary" 
                                    data-action="sell-production-item" 
                                    data-item-id="${item.id}">
                                <span class="btn-icon">💰</span>
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
        
        // Calculate sold quantities from sales
        window.FarmModules.appData.sales.forEach(sale => {
            if (sale.productionSourceId) {
                soldItems[sale.productionSourceId] = (soldItems[sale.productionSourceId] || 0) + sale.quantity;
            }
        });
        
        // Filter and map available items
        return productionData
            .filter(item => {
                const sold = soldItems[item.id] || 0;
                return (item.quantity - sold) > 0;
            })
            .map(item => ({
                ...item,
                availableQuantity: item.quantity - (soldItems[item.id] || 0)
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
    },

    sellProductionItem(itemId) {
        const productionData = JSON.parse(localStorage.getItem('farm_production_data') || '[]');
        const item = productionData.find(p => p.id === itemId);
        
        if (!item) {
            this.showNotification('Production item not found', 'error');
            return;
        }
        
        // Get available quantity
        const availableItems = this.getAvailableProductionItems(productionData);
        const availableItem = availableItems.find(a => a.id === itemId);
        
        if (!availableItem || availableItem.availableQuantity <= 0) {
            this.showNotification('This production item is no longer available', 'error');
            return;
        }
        
        // Set as pending production sale
        this.pendingProductionSale = availableItem;
        
        // Close production modal and open sale modal
        this.hideProductionModal();
        this.showSaleModal();
    },

    refreshProductionItems() {
        // Refresh the production items display
        const container = document.getElementById('production-items-container');
        if (container) {
            container.innerHTML = this.renderProductionItems();
        }
        
        // Refresh modal if open
        const modalContainer = document.getElementById('production-items-list');
        if (modalContainer) {
            this.loadProductionItems();
        }
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
        
        // Group by product
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
        
        // Group by payment method
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
            <div class="report-content">
                <div class="report-header">
                    <h2 class="report-title">${title}</h2>
                    <div class="report-date">${this.formatDate(date)}</div>
                </div>
                
                <div class="report-summary-stats">
                    <div class="summary-stat">
                        <div class="summary-value">${sales.length}</div>
                        <div class="summary-label">Total Sales</div>
                    </div>
                    <div class="summary-stat">
                        <div class="summary-value">${this.formatCurrency(totalRevenue)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="summary-stat">
                        <div class="summary-value">${this.formatCurrency(avgSale)}</div>
                        <div class="summary-label">Average Sale</div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3 class="section-title">📦 Products Sold</h3>
                    <div class="report-table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Revenue</th>
                                    <th>Average Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(productSummary).map(([product, data]) => `
                                    <tr>
                                        <td>${product}</td>
                                        <td>${data.quantity}</td>
                                        <td>${this.formatCurrency(data.revenue)}</td>
                                        <td>${this.formatCurrency(data.revenue / data.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3 class="section-title">💳 Payment Methods</h3>
                    <div class="payment-methods-grid">
                        ${Object.entries(paymentSummary).map(([method, data]) => `
                            <div class="payment-method-card">
                                <div class="payment-method-name">${method.toUpperCase()}</div>
                                <div class="payment-stats">
                                    <div class="payment-count">${data.count} sales</div>
                                    <div class="payment-amount">${this.formatCurrency(data.revenue)}</div>
                                </div>
                                <div class="payment-percentage">
                                    ${((data.revenue / totalRevenue) * 100).toFixed(1)}% of total
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="report-footer">
                    <div class="report-generated">
                        Generated on ${this.formatDate(new Date().toISOString())}
                    </div>
                </div>
            </div>
        `;
    },

    showReportModal(content) {
        const modal = document.getElementById('report-modal');
        const container = document.getElementById('report-content');
        
        if (!modal || !container) return;
        
        container.innerHTML = content;
        modal.classList.add('active');
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
                    .summary { display: flex; justify-content: space-between; margin: 20px 0; }
                    .summary-item { text-align: center; }
                    .summary-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
                    .summary-label { font-size: 14px; color: #666; }
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

    // ==================== QUICK SALE FUNCTIONS ====================

    showQuickSaleForm() {
        const formHTML = `
            <div class="quick-sale-form">
                <h4 class="form-title">⚡ Quick Sale</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Product</label>
                        <select class="form-input" id="quick-sale-product">
                            <option value="broilers-dressed">🍗 Broilers (Dressed)</option>
                            <option value="eggs">🥚 Eggs</option>
                            <option value="milk">🥛 Milk</option>
                            <option value="tomatoes">🍅 Tomatoes</option>
                            <option value="broilers-live">🐔 Broilers (Live)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" class="form-input" id="quick-sale-quantity" value="1" min="1">
                    </div>
                    <div class="form-group">
                        <label>Unit Price</label>
                        <input type="number" class="form-input" id="quick-sale-price" step="0.01" min="0">
                    </div>
                </div>
                <div class="form-group">
                    <label>Customer (optional)</label>
                    <input type="text" class="form-input" id="quick-sale-customer" placeholder="Customer name">
                </div>
                <div class="quick-sale-total">
                    Total: <span id="quick-sale-total">$0.00</span>
                </div>
                <div class="form-actions">
                    <button type="button" class="sales-btn sales-btn-secondary" data-action="cancel-quick-sale">Cancel</button>
                    <button type="button" class="sales-btn sales-btn-primary" data-action="save-quick-sale">Record Sale</button>
                </div>
            </div>
        `;
        
        // Create and show modal
        this.showCustomModal(formHTML, 'quick-sale-modal');
        
        // Set up event listeners
        this.setupQuickSaleListeners();
    },

    setupQuickSaleListeners() {
        const modal = document.getElementById('quick-sale-modal');
        if (!modal) return;
        
        // Calculate total on input
        modal.querySelector('#quick-sale-quantity')?.addEventListener('input', () => this.calculateQuickSaleTotal());
        modal.querySelector('#quick-sale-price')?.addEventListener('input', () => this.calculateQuickSaleTotal());
        modal.querySelector('#quick-sale-product')?.addEventListener('change', () => this.setQuickDefaultPrice());
        
        // Save button
        modal.querySelector('[data-action="save-quick-sale"]')?.addEventListener('click', () => this.saveQuickSale());
        
        // Cancel button
        modal.querySelector('[data-action="cancel-quick-sale"]')?.addEventListener('click', () => {
            this.hideModal('quick-sale-modal');
        });
        
        // Set initial price
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

    // ==================== MODAL MANAGEMENT ====================

    showCustomModal(content, modalId) {
        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create new modal
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'sales-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="modal-close" data-action="close-custom-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(modal);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Add close button listener
        modal.querySelector('[data-action="close-custom-modal"]')?.addEventListener('click', () => {
            modal.remove();
        });
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
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

    // ==================== NAVIGATION FUNCTIONS ====================

    navigateToProduction() {
        console.log('🔄 Navigating to Production module...');
        
        // Try multiple navigation strategies
        if (window.FarmModules && window.FarmModules.Production) {
            // Direct module access
            if (typeof window.FarmModules.Production.initialize === 'function') {
                window.FarmModules.Production.initialize();
                return true;
            }
        }
        
        if (window.FarmModules && window.FarmModules.showModule) {
            // Use module loader
            window.FarmModules.showModule('production');
            return true;
        }
        
        if (window.FarmModules && window.FarmModules.modules) {
            // Search in modules map
            const module = window.FarmModules.modules.get('production') || 
                          window.FarmModules.modules.get('Production');
            if (module && typeof module.initialize === 'function') {
                module.initialize();
                return true;
            }
        }
        
        // Fallback to hash navigation
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

    // ==================== UTILITY FUNCTIONS ====================

    getCurrentDate() {
        // Use DateUtils if available, otherwise fallback
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
        
        // Use DateUtils if available
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
                // Get sales from today
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
        
        // Set to meat product
        setTimeout(() => {
            const productSelect = document.getElementById('sale-product');
            if (productSelect) {
                productSelect.value = 'broilers-dressed';
                this.handleProductChange();
            }
        }, 100);
    },

    showProductionItems() {
        this.showProductionModal();
    },

    initializeDatePicker() {
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            // Set max date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.max = today;
            
            // Set value if empty
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
        // Implement inventory check logic here
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `sales-notification sales-notification-${type}`;
        notification.textContent = message;
        
        // Add styles
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
        
        // Set background based on type
        const backgrounds = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        
        notification.style.backgroundColor = backgrounds[type] || '#3b82f6';
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // ==================== MODULE LIFECYCLE ====================

    unload() {
        console.log('📦 Unloading Sales Record Module...');
        
        // Clean up event listeners
        this.removeEventListeners();
        
        // Clear references
        this.element = null;
        this.broadcaster = null;
        this.initialized = false;
        
        console.log('✅ Sales Record Module unloaded');
    }
};

// ==================== MODULE REGISTRATION ====================

(function registerSalesModule() {
    console.log('📝 Registering Sales Record Module...');
    
    // Ensure FarmModules exists
    if (!window.FarmModules) {
        console.error('❌ FarmModules framework not found');
        window.FarmModules = {};
    }
    
    // Register the module
    window.FarmModules.SalesRecord = SalesRecordModule;
    window.FarmModules.Sales = SalesRecordModule;
    
    // Add to modules map
    if (!window.FarmModules.modules) {
        window.FarmModules.modules = new Map();
    }
    
    window.FarmModules.modules.set('sales-record', SalesRecordModule);
    window.FarmModules.modules.set('sales', SalesRecordModule);
    
    console.log('✅ Sales Record Module registered successfully');
    
    // Auto-initialize if in content area context
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

// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesRecordModule;
}
