// modules/sales-record.js - COMPLETE FULL FUNCTIONALITY VERSION
console.log('💰 Loading COMPLETE Sales Records Module...');

// SalesRecord Module - FULL FUNCTIONALITY
window.FarmModules = window.FarmModules || {};
window.FarmModules.SalesRecord = {
    // Version for migration
    version: '2.0',
    
    // Sales data structure
    sales: [],
    
    // Categories for sales
    categories: [
        'Eggs', 'Broilers', 'Layers', 'Poultry Meat', 
        'Chicks', 'Manure/Fertilizer', 'Crops', 'Other'
    ],
    
    // Payment methods
    paymentMethods: ['Cash', 'Bank Transfer', 'Mobile Money', 'Credit', 'Other'],
    
    // Customer types
    customerTypes: ['Regular', 'Wholesaler', 'Retailer', 'Walk-in', 'Online'],
    
    // Initialize module
    init: function() {
        console.log('📊 SalesRecord module initialized - FULL VERSION');
        this.loadSettings();
        this.loadSales();
        this.migrateSalesDates();
        this.renderSalesDashboard();
        this.setupEventListeners();
        this.updateStats();
        
        // Register with reports module if available
        this.registerWithReports();
        
        return true;
    },
    
    // ========== DATA MANAGEMENT ==========
    
    // Load sales from localStorage
    loadSales: function() {
        try {
            // Try version 2 first
            const savedV2 = localStorage.getItem('farm_sales_v2');
            if (savedV2) {
                const data = JSON.parse(savedV2);
                this.sales = data.sales || [];
                this.settings = data.settings || this.getDefaultSettings();
                console.log(`📈 Loaded ${this.sales.length} sales records (v2)`);
                return;
            }
            
            // Try legacy version
            const legacy = localStorage.getItem('farm_sales');
            if (legacy) {
                const legacyData = JSON.parse(legacy);
                if (Array.isArray(legacyData)) {
                    // Convert legacy format to v2
                    this.sales = legacyData.map(sale => this.convertLegacySale(sale));
                    this.saveToStorage();
                    console.log(`📈 Migrated ${this.sales.length} legacy sales records to v2`);
                } else {
                    this.sales = [];
                }
            } else {
                this.sales = [];
            }
            
            // Load settings
            this.loadSettings();
            
        } catch (e) {
            console.error('❌ Error loading sales:', e);
            this.sales = [];
            this.settings = this.getDefaultSettings();
        }
    },
    
    // Get default settings
    getDefaultSettings: function() {
        return {
            currency: 'USD',
            dateFormat: 'YYYY-MM-DD',
            taxRate: 0.0,
            defaultCategory: 'Eggs',
            defaultPaymentMethod: 'Cash',
            defaultCustomerType: 'Walk-in',
            enableReceipts: true,
            autoGenerateReceiptId: true,
            receiptPrefix: 'SALE-'
        };
    },
    
    // Load settings
    loadSettings: function() {
        const saved = localStorage.getItem('farm_sales_settings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                this.settings = this.getDefaultSettings();
            }
        } else {
            this.settings = this.getDefaultSettings();
        }
    },
    
    // Save settings
    saveSettings: function() {
        try {
            localStorage.setItem('farm_sales_settings', JSON.stringify(this.settings));
            return true;
        } catch (e) {
            console.error('❌ Error saving settings:', e);
            return false;
        }
    },
    
    // Save to storage
    saveToStorage: function() {
        try {
            const data = {
                version: this.version,
                sales: this.sales,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('farm_sales_v2', JSON.stringify(data));
            console.log('💾 Sales data saved successfully');
            
            // Also update reports module data
            this.updateReportsData();
            
            return true;
        } catch (e) {
            console.error('❌ Error saving sales:', e);
            return false;
        }
    },
    
    // Convert legacy sale format
    convertLegacySale: function(legacySale) {
        const now = new Date().toISOString();
        return {
            id: legacySale.id || Date.now(),
            date: this.normalizeDate(legacySale.date || now),
            product: legacySale.product || 'Unknown',
            category: legacySale.category || 'Other',
            quantity: parseFloat(legacySale.quantity) || 0,
            price: parseFloat(legacySale.price) || 0,
            total: parseFloat(legacySale.total) || 0,
            customerName: legacySale.customer || 'Walk-in',
            customerType: 'Walk-in',
            paymentMethod: 'Cash',
            paymentStatus: 'paid',
            notes: '',
            timestamp: legacySale.timestamp || now,
            updatedAt: now,
            receiptId: `SALE-${legacySale.id || Date.now().toString().slice(-6)}`
        };
    },
    
    // ========== DATE MANAGEMENT ==========
    
    // Normalize date to YYYY-MM-DD
    normalizeDate: function(dateString) {
        if (!dateString) {
            return new Date().toISOString().split('T')[0];
        }
        
        // If already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.warn(`⚠️ Could not parse date: ${dateString}, using today's date`);
            return new Date().toISOString().split('T')[0];
        }
    },
    
    // Migrate all sales dates to YYYY-MM-DD format
    migrateSalesDates: function() {
        if (!this.sales.length) return;
        
        let migratedCount = 0;
        const now = new Date().toISOString();
        
        this.sales = this.sales.map(sale => {
            const originalDate = sale.date;
            const normalizedDate = this.normalizeDate(originalDate);
            
            if (originalDate !== normalizedDate) {
                migratedCount++;
                console.log(`🔄 Migrating: ${originalDate} → ${normalizedDate}`);
                return { 
                    ...sale, 
                    date: normalizedDate,
                    updatedAt: now
                };
            }
            return sale;
        });
        
        if (migratedCount > 0) {
            this.saveToStorage();
            console.log(`✅ Migrated ${migratedCount} sales records to YYYY-MM-DD format`);
        }
    },
    
    // ========== SALES OPERATIONS ==========
    
    // Generate receipt ID
    generateReceiptId: function() {
        const prefix = this.settings.receiptPrefix || 'SALE-';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    },
    
    // Add a new sale
    addSale: function(saleData) {
        const receiptId = this.settings.autoGenerateReceiptId ? 
            this.generateReceiptId() : saleData.receiptId;
        
        const total = (saleData.quantity || 0) * (saleData.price || 0);
        const tax = total * (this.settings.taxRate / 100);
        
        const newSale = {
            id: Date.now(),
            receiptId: receiptId,
            date: this.normalizeDate(saleData.date),
            product: saleData.product?.trim() || '',
            category: saleData.category || this.settings.defaultCategory,
            quantity: parseFloat(saleData.quantity) || 0,
            price: parseFloat(saleData.price) || 0,
            total: total,
            tax: tax,
            grandTotal: total + tax,
            customerName: saleData.customerName?.trim() || 'Walk-in',
            customerType: saleData.customerType || this.settings.defaultCustomerType,
            customerPhone: saleData.customerPhone || '',
            customerEmail: saleData.customerEmail || '',
            paymentMethod: saleData.paymentMethod || this.settings.defaultPaymentMethod,
            paymentStatus: saleData.paymentStatus || 'paid',
            notes: saleData.notes || '',
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: saleData.createdBy || 'user'
        };
        
        this.sales.unshift(newSale); // Add to beginning
        this.saveToStorage();
        this.updateStats();
        
        // Refresh UI if sales dashboard is visible
        if (document.getElementById('sales-container')) {
            this.renderSalesDashboard();
        }
        
        console.log(`✅ Sale added: ${receiptId} - ${newSale.product} for ${this.formatCurrency(newSale.grandTotal)}`);
        
        // Show receipt if enabled
        if (this.settings.enableReceipts) {
            this.showReceipt(newSale);
        }
        
        return newSale;
    },
    
    // Update a sale
    updateSale: function(id, updates) {
        const index = this.sales.findIndex(sale => sale.id === id);
        if (index === -1) return false;
        
        const sale = this.sales[index];
        const total = (updates.quantity || sale.quantity) * (updates.price || sale.price);
        const tax = total * (this.settings.taxRate / 100);
        
        this.sales[index] = {
            ...sale,
            ...updates,
            date: updates.date ? this.normalizeDate(updates.date) : sale.date,
            total: total,
            tax: tax,
            grandTotal: total + tax,
            updatedAt: new Date().toISOString()
        };
        
        this.saveToStorage();
        this.updateStats();
        
        // Refresh UI
        if (document.getElementById('sales-container')) {
            this.renderSalesDashboard();
        }
        
        console.log(`✏️ Sale updated: ${sale.receiptId}`);
        return true;
    },
    
    // Delete a sale
    deleteSale: function(id) {
        const index = this.sales.findIndex(sale => sale.id === id);
        if (index === -1) return false;
        
        const deleted = this.sales.splice(index, 1)[0];
        this.saveToStorage();
        this.updateStats();
        
        // Refresh UI
        if (document.getElementById('sales-container')) {
            this.renderSalesDashboard();
        }
        
        console.log(`🗑️ Sale deleted: ${deleted.receiptId} - ${deleted.product}`);
        return true;
    },
    
    // ========== QUERIES & FILTERS ==========
    
    // Get sales by date range
    getSalesByDateRange: function(startDate, endDate) {
        return this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return saleDate >= start && saleDate <= end;
        });
    },
    
    // Get sales by category
    getSalesByCategory: function(category) {
        return this.sales.filter(sale => sale.category === category);
    },
    
    // Get sales by customer
    getSalesByCustomer: function(customerName) {
        return this.sales.filter(sale => 
            sale.customerName.toLowerCase().includes(customerName.toLowerCase()));
    },
    
    // Get sales by payment method
    getSalesByPaymentMethod: function(method) {
        return this.sales.filter(sale => sale.paymentMethod === method);
    },
    
    // Get sales by payment status
    getSalesByPaymentStatus: function(status) {
        return this.sales.filter(sale => sale.paymentStatus === status);
    },
    
    // Search sales
    searchSales: function(query) {
        const lowerQuery = query.toLowerCase();
        return this.sales.filter(sale => 
            sale.product.toLowerCase().includes(lowerQuery) ||
            sale.customerName.toLowerCase().includes(lowerQuery) ||
            sale.receiptId.toLowerCase().includes(lowerQuery) ||
            sale.notes.toLowerCase().includes(lowerQuery)
        );
    },
    
    // ========== STATISTICS ==========
    
    // Get total sales amount
    getTotalSalesAmount: function() {
        return this.sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    },
    
    // Get sales count
    getSalesCount: function() {
        return this.sales.length;
    },
    
    // Get average sale value
    getAverageSaleValue: function() {
        return this.sales.length > 0 ? 
            this.getTotalSalesAmount() / this.sales.length : 0;
    },
    
    // Get sales by month
    getSalesByMonth: function() {
        const monthlySales = {};
        
        this.sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlySales[monthYear]) {
                monthlySales[monthYear] = {
                    total: 0,
                    count: 0,
                    date: monthYear
                };
            }
            
            monthlySales[monthYear].total += sale.grandTotal;
            monthlySales[monthYear].count++;
        });
        
        return Object.values(monthlySales)
            .sort((a, b) => a.date.localeCompare(b.date));
    },
    
    // Get top products
    getTopProducts: function(limit = 5) {
        const productTotals = {};
        
        this.sales.forEach(sale => {
            if (!productTotals[sale.product]) {
                productTotals[sale.product] = {
                    product: sale.product,
                    total: 0,
                    quantity: 0,
                    count: 0
                };
            }
            
            productTotals[sale.product].total += sale.grandTotal;
            productTotals[sale.product].quantity += sale.quantity;
            productTotals[sale.product].count++;
        });
        
        return Object.values(productTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    },
    
    // Get top customers
    getTopCustomers: function(limit = 5) {
        const customerTotals = {};
        
        this.sales.forEach(sale => {
            if (!customerTotals[sale.customerName]) {
                customerTotals[sale.customerName] = {
                    name: sale.customerName,
                    type: sale.customerType,
                    total: 0,
                    count: 0
                };
            }
            
            customerTotals[sale.customerName].total += sale.grandTotal;
            customerTotals[sale.customerName].count++;
        });
        
        return Object.values(customerTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    },
    
    // Get category breakdown
    getCategoryBreakdown: function() {
        const categoryTotals = {};
        
        this.sales.forEach(sale => {
            if (!categoryTotals[sale.category]) {
                categoryTotals[sale.category] = {
                    category: sale.category,
                    total: 0,
                    count: 0
                };
            }
            
            categoryTotals[sale.category].total += sale.grandTotal;
            categoryTotals[sale.category].count++;
        });
        
        return Object.values(categoryTotals)
            .sort((a, b) => b.total - a.total);
    },
    
    // Get payment method breakdown
    getPaymentMethodBreakdown: function() {
        const methodTotals = {};
        
        this.sales.forEach(sale => {
            if (!methodTotals[sale.paymentMethod]) {
                methodTotals[sale.paymentMethod] = {
                    method: sale.paymentMethod,
                    total: 0,
                    count: 0
                };
            }
            
            methodTotals[sale.paymentMethod].total += sale.grandTotal;
            methodTotals[sale.paymentMethod].count++;
        });
        
        return Object.values(methodTotals)
            .sort((a, b) => b.total - a.total);
    },
    
    // Update stats display
    updateStats: function() {
        const totalSales = this.getTotalSalesAmount();
        const salesCount = this.getSalesCount();
        const avgSale = this.getAverageSaleValue();
        
        // Update dashboard stats if exists
        const statsContainer = document.getElementById('sales-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <div class="stat-value">${this.formatCurrency(totalSales)}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">${salesCount}</div>
                        <div class="stat-label">Total Sales</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <div class="stat-value">${this.formatCurrency(avgSale)}</div>
                        <div class="stat-label">Avg. Sale</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <div class="stat-value">${this.sales.length > 0 ? this.sales[0].date : 'N/A'}</div>
                        <div class="stat-label">Latest Sale</div>
                    </div>
                </div>
            `;
        }
        
        // Update shared app data for reports module
        this.updateReportsData();
    },
    
    // Update reports module data
    updateReportsData: function() {
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.sales = {
                total: this.getTotalSalesAmount(),
                count: this.getSalesCount(),
                average: this.getAverageSaleValue(),
                byMonth: this.getSalesByMonth(),
                topProducts: this.getTopProducts(),
                topCustomers: this.getTopCustomers(),
                byCategory: this.getCategoryBreakdown(),
                byPaymentMethod: this.getPaymentMethodBreakdown()
            };
        }
    },
    
    // ========== UI RENDERING ==========
    
    // Render sales dashboard
    renderSalesDashboard: function() {
        const container = document.getElementById('sales-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="sales-dashboard">
                <!-- Header -->
                <div class="dashboard-header">
                    <h2>📊 Sales Management</h2>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-sale-btn">
                            + Add Sale
                        </button>
                        <button class="btn-outline" id="refresh-sales-btn">
                            🔄 Refresh
                        </button>
                        <button class="btn-outline" id="export-sales-btn">
                            📥 Export
                        </button>
                    </div>
                </div>
                
                <!-- Stats Overview -->
                <div id="sales-stats" class="stats-grid">
                    <!-- Stats will be populated by updateStats() -->
                </div>
                
                <!-- Filters -->
                <div class="filters-section">
                    <div class="filter-group">
                        <input type="date" id="date-filter" class="filter-input" 
                               placeholder="Filter by date">
                        <select id="category-filter" class="filter-input">
                            <option value="">All Categories</option>
                            ${this.categories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                        <select id="payment-filter" class="filter-input">
                            <option value="">All Payment Methods</option>
                            ${this.paymentMethods.map(method => 
                                `<option value="${method}">${method}</option>`
                            ).join('')}
                        </select>
                        <input type="text" id="search-filter" class="filter-input" 
                               placeholder="Search sales...">
                        <button class="btn-outline" id="clear-filters-btn">
                            Clear
                        </button>
                    </div>
                </div>
                
                <!-- Sales Table -->
                <div class="table-container">
                    <table class="sales-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Receipt ID</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Customer</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sales-table-body">
                            ${this.renderSalesTableRows()}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="pagination" id="sales-pagination">
                    <!-- Pagination will be added dynamically -->
                </div>
                
                <!-- Summary -->
                <div class="summary-section">
                    <div class="summary-card">
                        <h3>Summary</h3>
                        <div class="summary-row">
                            <span>Total Sales:</span>
                            <span>${this.sales.length}</span>
                        </div>
                        <div class="summary-row">
                            <span>Total Revenue:</span>
                            <span>${this.formatCurrency(this.getTotalSalesAmount())}</span>
                        </div>
                        <div class="summary-row">
                            <span>Average Sale:</span>
                            <span>${this.formatCurrency(this.getAverageSaleValue())}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add Sale Modal -->
            <div id="add-sale-modal" class="modal-overlay hidden">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>➕ Add New Sale</h3>
                        <button class="modal-close" id="close-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-sale-form" class="modal-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" id="sale-date" required 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Product *</label>
                                    <input type="text" id="sale-product" required 
                                           placeholder="Enter product name">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category</label>
                                    <select id="sale-category">
                                        ${this.categories.map(cat => 
                                            `<option value="${cat}">${cat}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Customer Name</label>
                                    <input type="text" id="sale-customer" 
                                           placeholder="Customer name">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Quantity *</label>
                                    <input type="number" id="sale-quantity" required 
                                           step="0.01" min="0.01" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label>Price *</label>
                                    <input type="number" id="sale-price" required 
                                           step="0.01" min="0.01" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label>Total</label>
                                    <input type="text" id="sale-total" disabled 
                                           placeholder="Auto-calculated">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Payment Method</label>
                                    <select id="sale-payment-method">
                                        ${this.paymentMethods.map(method => 
                                            `<option value="${method}">${method}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Payment Status</label>
                                    <select id="sale-payment-status">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="sale-notes" rows="3" 
                                          placeholder="Additional notes..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-outline" id="cancel-sale-btn">Cancel</button>
                        <button class="btn-primary" id="save-sale-btn">Save Sale</button>
                    </div>
                </div>
            </div>
            
            <!-- Receipt Modal -->
            <div id="receipt-modal" class="modal-overlay hidden">
                <div class="modal-container receipt-modal">
                    <div class="receipt-content" id="receipt-content">
                        <!-- Receipt content will be generated here -->
                    </div>
                    <div class="receipt-actions">
                        <button class="btn-outline" id="print-receipt-btn">🖨️ Print</button>
                        <button class="btn-outline" id="close-receipt-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize stats
        this.updateStats();
        
        // Add event listeners
        this.setupDashboardListeners();
    },
    
    // Render sales table rows
    renderSalesTableRows: function(salesToShow = this.sales) {
        if (salesToShow.length === 0) {
            return `
                <tr>
                    <td colspan="10" class="no-data">
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                            <div style="font-size: 16px; margin-bottom: 8px;">No sales records found</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">
                                Click "Add Sale" to create your first sale
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        return salesToShow.slice(0, 50).map(sale => `
            <tr data-sale-id="${sale.id}">
                <td>${sale.date}</td>
                <td><span class="receipt-id">${sale.receiptId}</span></td>
                <td>${sale.product}</td>
                <td><span class="category-badge">${sale.category}</span></td>
                <td>${sale.customerName}</td>
                <td>${sale.quantity}</td>
                <td>${this.formatCurrency(sale.price)}</td>
                <td><strong>${this.formatCurrency(sale.grandTotal)}</strong></td>
                <td>
                    <span class="payment-badge ${sale.paymentStatus}">
                        ${sale.paymentMethod} (${sale.paymentStatus})
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon view-sale" data-id="${sale.id}" title="View">
                        👁️
                    </button>
                    <button class="btn-icon edit-sale" data-id="${sale.id}" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon delete-sale" data-id="${sale.id}" title="Delete">
                        🗑️
                    </button>
                    <button class="btn-icon receipt-sale" data-id="${sale.id}" title="Receipt">
                        🧾
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    // ========== EVENT LISTENERS ==========
    
    // Setup event listeners
    setupEventListeners: function() {
        // Add global listeners if needed
    },
    
    // Setup dashboard listeners
    setupDashboardListeners: function() {
        // Add sale button
        const addSaleBtn = document.getElementById('add-sale-btn');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => this.showAddSaleModal());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-sales-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshSales());
        }
        
        // Export button
        const exportBtn = document.getElementById('export-sales-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSales());
        }
        
        // Filter inputs
        const dateFilter = document.getElementById('date-filter');
        const categoryFilter = document.getElementById('category-filter');
        const paymentFilter = document.getElementById('payment-filter');
        const searchFilter = document.getElementById('search-filter');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        
        if (dateFilter) dateFilter.addEventListener('change', () => this.applyFilters());
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.applyFilters());
        if (paymentFilter) paymentFilter.addEventListener('change', () => this.applyFilters());
        if (searchFilter) searchFilter.addEventListener('input', () => this.applyFilters());
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        
        // Modal buttons
        this.setupModalListeners();
        
        // Auto-calculate total
        const quantityInput = document.getElementById('sale-quantity');
        const priceInput = document.getElementById('sale-price');
        const totalInput = document.getElementById('sale-total');
        
        if (quantityInput && priceInput && totalInput) {
            const calculateTotal = () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const total = quantity * price;
                const tax = total * (this.settings.taxRate / 100);
                totalInput.value = this.formatCurrency(total + tax);
            };
            
            quantityInput.addEventListener('input', calculateTotal);
            priceInput.addEventListener('input', calculateTotal);
        }
    },
    
    // Setup modal listeners
    setupModalListeners: function() {
        // Close modal buttons
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelSaleBtn = document.getElementById('cancel-sale-btn');
        const closeReceiptBtn = document.getElementById('close-receipt-btn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.hideAddSaleModal());
        if (cancelSaleBtn) cancelSaleBtn.addEventListener('click', () => this.hideAddSaleModal());
        if (closeReceiptBtn) closeReceiptBtn.addEventListener('click', () => this.hideReceipt());
        
        // Save sale button
        const saveSaleBtn = document.getElementById('save-sale-btn');
        if (saveSaleBtn) {
            saveSaleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveNewSale();
            });
        }
        
        // Print receipt button
        const printReceiptBtn = document.getElementById('print-receipt-btn');
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => this.printReceipt());
        }
        
        // Close modals on overlay click
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    },
    
    // ========== FILTERING ==========
    
    // Apply filters
    applyFilters: function() {
        const dateFilter = document.getElementById('date-filter')?.value;
        const categoryFilter = document.getElementById('category-filter')?.value;
        const paymentFilter = document.getElementById('payment-filter')?.value;
        const searchFilter = document.getElementById('search-filter')?.value;
        
        let filteredSales = this.sales;
        
        // Apply date filter
        if (dateFilter) {
            filteredSales = filteredSales.filter(sale => sale.date === dateFilter);
        }
        
        // Apply category filter
        if (categoryFilter) {
            filteredSales = filteredSales.filter(sale => sale.category === categoryFilter);
        }
        
        // Apply payment method filter
        if (paymentFilter) {
            filteredSales = filteredSales.filter(sale => sale.paymentMethod === paymentFilter);
        }
        
        // Apply search filter
        if (searchFilter) {
            filteredSales = this.searchSales(searchFilter);
        }
        
        // Update table
        const tableBody = document.getElementById('sales-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.renderSalesTableRows(filteredSales);
            
            // Re-attach event listeners to action buttons
            this.attachRowActionListeners();
        }
        
        // Update summary
        this.updateFilteredSummary(filteredSales);
    },
    
    // Clear filters
    clearFilters: function() {
        const dateFilter = document.getElementById('date-filter');
        const categoryFilter = document.getElementById('category-filter');
        const paymentFilter = document.getElementById('payment-filter');
        const searchFilter = document.getElementById('search-filter');
        
        if (dateFilter) dateFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (paymentFilter) paymentFilter.value = '';
        if (searchFilter) searchFilter.value = '';
        
        this.applyFilters();
    },
    
    // Update filtered summary
    updateFilteredSummary: function(filteredSales) {
        const total = filteredSales.reduce((sum, sale) => sum + sale.grandTotal, 0);
        const avg = filteredSales.length > 0 ? total / filteredSales.length : 0;
        
        const summaryContainer = document.querySelector('.summary-card');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <h3>Summary ${filteredSales.length !== this.sales.length ? '(Filtered)' : ''}</h3>
                <div class="summary-row">
                    <span>Total Sales:</span>
                    <span>${filteredSales.length}</span>
                </div>
                <div class="summary-row">
                    <span>Total Revenue:</span>
                    <span>${this.formatCurrency(total)}</span>
                </div>
                <div class="summary-row">
                    <span>Average Sale:</span>
                    <span>${this.formatCurrency(avg)}</span>
                </div>
            `;
        }
    },
    
    // Attach row action listeners
    attachRowActionListeners: function() {
        // View buttons
        document.querySelectorAll('.view-sale').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.viewSale(id);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-sale').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editSale(id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-sale').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.confirmDeleteSale(id);
            });
        });
        
        // Receipt buttons
        document.querySelectorAll('.receipt-sale').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showReceipt(this.getSaleById(id));
            });
        });
    },
    
    // ========== MODAL OPERATIONS ==========
    
    // Show add sale modal
    showAddSaleModal: function() {
        const modal = document.getElementById('add-sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Reset form
            const form = document.getElementById('add-sale-form');
            if (form) form.reset();
            
            // Set today's date
            const dateInput = document.getElementById('sale-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Set default category
            const categorySelect = document.getElementById('sale-category');
            if (categorySelect) {
                categorySelect.value = this.settings.defaultCategory;
            }
        }
    },
    
    // Hide add sale modal
    hideAddSaleModal: function() {
        const modal = document.getElementById('add-sale-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    // Save new sale
    saveNewSale: function() {
        const form = document.getElementById('add-sale-form');
        if (!form || !form.checkValidity()) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        
        const saleData = {
            date: document.getElementById('sale-date').value,
            product: document.getElementById('sale-product').value,
            category: document.getElementById('sale-category').value,
            quantity: document.getElementById('sale-quantity').value,
            price: document.getElementById('sale-price').value,
            customerName: document.getElementById('sale-customer').value || 'Walk-in',
            paymentMethod: document.getElementById('sale-payment-method').value,
            paymentStatus: document.getElementById('sale-payment-status').value,
            notes: document.getElementById('sale-notes').value
        };
        
        this.addSale(saleData);
        this.hideAddSaleModal();
    },
    
    // View sale details
    viewSale: function(id) {
        const sale = this.getSaleById(id);
        if (!sale) return;
        
        alert(`Sale Details:\n
Receipt ID: ${sale.receiptId}
Date: ${sale.date}
Product: ${sale.product}
Category: ${sale.category}
Customer: ${sale.customerName}
Quantity: ${sale.quantity}
Price: ${this.formatCurrency(sale.price)}
Total: ${this.formatCurrency(sale.grandTotal)}
Payment: ${sale.paymentMethod} (${sale.paymentStatus})
Notes: ${sale.notes || 'None'}`);
    },
    
    // Edit sale
    editSale: function(id) {
        const sale = this.getSaleById(id);
        if (!sale) return;
        
        // For now, show view modal
        this.viewSale(id);
        // TODO: Implement proper edit modal
        console.log('Edit sale:', sale);
    },
    
    // Confirm delete sale
    confirmDeleteSale: function(id) {
        const sale = this.getSaleById(id);
        if (!sale) return;
        
        if (confirm(`Are you sure you want to delete sale ${sale.receiptId}?\n\nProduct: ${sale.product}\nAmount: ${this.formatCurrency(sale.grandTotal)}\n\nThis action cannot be undone.`)) {
            this.deleteSale(id);
        }
    },
    
    // Get sale by ID
    getSaleById: function(id) {
        return this.sales.find(sale => sale.id === id);
    },
    
    // ========== RECEIPT FUNCTIONS ==========
    
    // Show receipt
    showReceipt: function(sale) {
        const modal = document.getElementById('receipt-modal');
        const content = document.getElementById('receipt-content');
        
        if (!modal || !content || !sale) return;
        
        const receiptHTML = `
            <div class="receipt">
                <div class="receipt-header">
                    <h2>${window.FarmModules?.appData?.profile?.farmName || 'Farm'} Receipt</h2>
                    <div class="receipt-id">${sale.receiptId}</div>
                </div>
                
                <div class="receipt-info">
                    <div class="info-row">
                        <span>Date:</span>
                        <span>${sale.date}</span>
                    </div>
                    <div class="info-row">
                        <span>Time:</span>
                        <span>${new Date(sale.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>
                
                <div class="receipt-items">
                    <div class="item-header">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                        <span>Total</span>
                    </div>
                    <div class="item-row">
                        <span>${sale.product}</span>
                        <span>${sale.quantity}</span>
                        <span>${this.formatCurrency(sale.price)}</span>
                        <span>${this.formatCurrency(sale.total)}</span>
                    </div>
                </div>
                
                <div class="receipt-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${this.formatCurrency(sale.total)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (${this.settings.taxRate}%):</span>
                        <span>${this.formatCurrency(sale.tax)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>GRAND TOTAL:</span>
                        <span>${this.formatCurrency(sale.grandTotal)}</span>
                    </div>
                </div>
                
                <div class="receipt-payment">
                    <div class="payment-info">
                        <div><strong>Payment Method:</strong> ${sale.paymentMethod}</div>
                        <div><strong>Status:</strong> ${sale.paymentStatus}</div>
                    </div>
                </div>
                
                <div class="receipt-customer">
                    <div><strong>Customer:</strong> ${sale.customerName}</div>
                    ${sale.customerPhone ? `<div><strong>Phone:</strong> ${sale.customerPhone}</div>` : ''}
                </div>
                
                <div class="receipt-footer">
                    <p>Thank you for your business!</p>
                    <p class="footer-note">
                        ${window.FarmModules?.appData?.profile?.receiptFooter || 
                          'Please keep this receipt for your records.'}
                    </p>
                </div>
            </div>
        `;
        
        content.innerHTML = receiptHTML;
        modal.classList.remove('hidden');
    },
    
    // Hide receipt
    hideReceipt: function() {
        const modal = document.getElementById('receipt-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    // Print receipt
    printReceipt: function() {
        const receiptContent = document.getElementById('receipt-content');
        if (!receiptContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .receipt { width: 300px; margin: 0 auto; }
                        .receipt-header { text-align: center; margin-bottom: 20px; }
                        .receipt-id { font-size: 12px; color: #666; }
                        .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                        .item-header, .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; }
                        .item-header { border-bottom: 1px solid #000; padding-bottom: 5px; font-weight: bold; }
                        .item-row { padding: 5px 0; }
                        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                        .grand-total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                        .receipt-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    ${receiptContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    },
    
    // ========== EXPORT FUNCTIONS ==========
    
    // Export sales
    exportSales: function(format = 'json') {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                totalSales: this.sales.length,
                totalRevenue: this.getTotalSalesAmount(),
                version: this.version
            },
            sales: this.sales,
            summary: {
                byMonth: this.getSalesByMonth(),
                topProducts: this.getTopProducts(),
                topCustomers: this.getTopCustomers(),
                byCategory: this.getCategoryBreakdown(),
                byPaymentMethod: this.getPaymentMethodBreakdown()
            }
        };
        
        if (format === 'json') {
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `sales-export-${Date.now()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } else if (format === 'csv') {
            // CSV export implementation
            this.exportToCSV();
        }
        
        console.log('📤 Sales exported successfully');
    },
    
    // Export to CSV
    exportToCSV: function() {
        const headers = ['Date', 'Receipt ID', 'Product', 'Category', 'Customer', 'Quantity', 'Price', 'Total', 'Tax', 'Grand Total', 'Payment Method', 'Payment Status'];
        
        const csvRows = [
            headers.join(','),
            ...this.sales.map(sale => [
                sale.date,
                sale.receiptId,
                `"${sale.product.replace(/"/g, '""')}"`,
                sale.category,
                `"${sale.customerName.replace(/"/g, '""')}"`,
                sale.quantity,
                sale.price,
                sale.total,
                sale.tax,
                sale.grandTotal,
                sale.paymentMethod,
                sale.paymentStatus
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-export-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },
    
    // ========== UTILITY FUNCTIONS ==========
    
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.settings.currency || 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    // Refresh sales
    refreshSales: function() {
        this.loadSales();
        this.renderSalesDashboard();
        console.log('🔄 Sales data refreshed');
    },
    
    // Register with reports module
    registerWithReports: function() {
        // Share data with reports module
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.salesModule = this;
            console.log('✅ Sales module registered with reports');
        }
    },
    
    // Debug functions
    debugAllSalesDates: function() {
        console.group('🔍 Sales Date Debug Info');
        console.log(`Total sales: ${this.sales.length}`);
        console.log('Current date formats:');
        this.sales.forEach((sale, index) => {
            const isStandard = /^\d{4}-\d{2}-\d{2}$/.test(sale.date);
            console.log(`${index + 1}. ${sale.date} - ${sale.receiptId} - ${sale.product} ${isStandard ? '✅' : '❌'}`);
        });
        console.groupEnd();
    },
    
    // Test functions
    testAddSampleSales: function() {
        const samples = [
            {
                product: 'Grade A Eggs',
                quantity: 120,
                price: 0.25,
                category: 'Eggs',
                customerName: 'Local Market',
                customerType: 'Wholesaler',
                paymentMethod: 'Cash'
            },
            {
                product: 'Broilers',
                quantity: 50,
                price: 8.50,
                category: 'Poultry Meat',
                customerName: 'Restaurant XYZ',
                customerType: 'Regular',
                paymentMethod: 'Bank Transfer'
            },
            {
                product: 'Day-old Chicks',
                quantity: 200,
                price: 1.20,
                category: 'Chicks',
                customerName: 'Farm ABC',
                customerType: 'Regular',
                paymentMethod: 'Mobile Money'
            },
            {
                product: 'Organic Manure',
                quantity: 500,
                price: 0.15,
                category: 'Manure/Fertilizer',
                customerName: 'Garden Center',
                customerType: 'Retailer',
                paymentMethod: 'Cash'
            }
        ];
        
        const today = new Date();
        const dates = [
            today.toISOString().split('T')[0],
            new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
            new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0],
            new Date(today.setDate(today.getDate() - 3)).toISOString().split('T')[0]
        ];
        
        samples.forEach((sample, index) => {
            this.addSale({
                ...sample,
                date: dates[index % dates.length]
            });
        });
        
        console.log('✅ Added sample sales for testing');
        this.debugAllSalesDates();
    },
    
    // Clear all sales (use with caution!)
    clearAllSales: function() {
        if (confirm('⚠️ ARE YOU SURE?\n\nThis will delete ALL sales records permanently.\nThis action cannot be undone.\n\nType "DELETE ALL" to confirm:')) {
            const confirmation = prompt('Type "DELETE ALL" to confirm:');
            if (confirmation === 'DELETE ALL') {
                this.sales = [];
                this.saveToStorage();
                this.renderSalesDashboard();
                console.log('🗑️ All sales records cleared');
            } else {
                console.log('❌ Clear operation cancelled');
            }
        }
    }
};

// ==================== STYLES ====================
const salesStyles = `
    /* Sales Dashboard Styles */
    .sales-dashboard {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }
    
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .dashboard-header h2 {
        color: var(--text-primary);
        margin: 0;
        font-size: 28px;
        font-weight: 700;
    }
    
    .header-actions {
        display: flex;
        gap: 12px;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    }
    
    .stat-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        border-color: var(--glass-hover);
    }
    
    .stat-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1));
        border-radius: 12px;
    }
    
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
    }
    
    .filters-section {
        margin-bottom: 24px;
        padding: 20px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
    }
    
    .filter-group {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .filter-input {
        padding: 12px 16px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 14px;
        min-width: 180px;
        flex: 1;
    }
    
    .filter-input:focus {
        outline: none;
        border-color: #3b82f6;
    }
    
    .table-container {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 24px;
    }
    
    .sales-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .sales-table thead {
        background: var(--glass-hover);
    }
    
    .sales-table th {
        padding: 16px;
        text-align: left;
        color: var(--text-primary);
        font-weight: 600;
        font-size: 14px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .sales-table td {
        padding: 16px;
        color: var(--text-secondary);
        font-size: 14px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .sales-table tr:last-child td {
        border-bottom: none;
    }
    
    .sales-table tr:hover {
        background: var(--glass-hover);
    }
    
    .receipt-id {
        font-family: monospace;
        background: rgba(59, 130, 246, 0.1);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
    }
    
    .category-badge {
        background: rgba(34, 197, 94, 0.1);
        color: #166534;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .payment-badge {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .payment-badge.paid {
        background: rgba(34, 197, 94, 0.1);
        color: #166534;
    }
    
    .payment-badge.pending {
        background: rgba(245, 158, 11, 0.1);
        color: #92400e;
    }
    
    .payment-badge.partial {
        background: rgba(59, 130, 246, 0.1);
        color: #1e40af;
    }
    
    .actions-cell {
        display: flex;
        gap: 8px;
    }
    
    .btn-icon {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
    }
    
    .btn-icon:hover {
        background: var(--glass-hover);
        transform: translateY(-2px);
    }
    
    .summary-section {
        margin-top: 24px;
    }
    
    .summary-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 24px;
    }
    
    .summary-card h3 {
        color: var(--text-primary);
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .summary-row:last-child {
        border-bottom: none;
    }
    
    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }
    
    .modal-overlay.hidden {
        display: none;
    }
    
    .modal-container {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .modal-header h3 {
        color: var(--text-primary);
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: var(--glass-hover);
        color: var(--text-primary);
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .form-group label {
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px 16px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 14px;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
    }
    
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 24px;
        border-top: 1px solid var(--glass-border);
    }
    
    /* Receipt Modal */
    .receipt-modal {
        max-width: 400px;
    }
    
    .receipt {
        padding: 24px;
    }
    
    .receipt-header {
        text-align: center;
        margin-bottom: 24px;
    }
    
    .receipt-header h2 {
        color: var(--text-primary);
        margin: 0 0 8px 0;
        font-size: 24px;
    }
    
    .receipt-info {
        margin-bottom: 24px;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        color: var(--text-secondary);
    }
    
    .receipt-items {
        margin-bottom: 24px;
    }
    
    .item-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--glass-border);
        color: var(--text-primary);
        font-weight: 600;
    }
    
    .item-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .receipt-totals {
        margin-bottom: 24px;
    }
    
    .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--glass-border);
    }
    
    .grand-total {
        font-weight: bold;
        font-size: 18px;
        color: var(--text-primary);
        border-bottom: none;
        padding-top: 16px;
        margin-top: 16px;
        border-top: 2px solid var(--glass-border);
    }
    
    .receipt-payment {
        margin-bottom: 24px;
        padding: 16px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 12px;
    }
    
    .receipt-customer {
        margin-bottom: 24px;
        padding: 16px;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 12px;
    }
    
    .receipt-footer {
        text-align: center;
        color: var(--text-secondary);
        font-size: 14px;
        padding-top: 16px;
        border-top: 1px solid var(--glass-border);
    }
    
    .receipt-actions {
        display: flex;
        gap: 12px;
        padding: 24px;
        border-top: 1px solid var(--glass-border);
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .filter-group {
            flex-direction: column;
            align-items: stretch;
        }
        
        .header-actions {
            flex-wrap: wrap;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .sales-table {
            display: block;
            overflow-x: auto;
        }
        
        .modal-container {
            margin: 20px;
        }
    }
`;

// Add styles to document
if (!document.getElementById('sales-module-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'sales-module-styles';
    styleElement.textContent = salesStyles;
    document.head.appendChild(styleElement);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other modules to load
    setTimeout(() => {
        console.log('🚀 Initializing SalesRecord module...');
        window.FarmModules.SalesRecord.init();
        
        // Test if working
        console.log('SalesRecord ready! Try: FarmModules.SalesRecord.debugAllSalesDates()');
        console.log('Available commands:');
        console.log('- FarmModules.SalesRecord.testAddSampleSales()');
        console.log('- FarmModules.SalesRecord.exportSales()');
        console.log('- FarmModules.SalesRecord.getTotalSalesAmount()');
    }, 500);
});

console.log('✅ SalesRecord module loaded successfully!');
