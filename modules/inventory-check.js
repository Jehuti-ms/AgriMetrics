// modules/sales-record.js - COMPLETE WITH MODALS & FIXES
console.log('💰 Loading Sales Records Module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    sales: [],
    
    // Settings
    settings: {
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        taxRate: 0.0,
        defaultCategory: 'Eggs',
        defaultPaymentMethod: 'Cash',
        defaultCustomerType: 'Walk-in',
        enableReceipts: true,
        autoGenerateReceiptId: true,
        receiptPrefix: 'SALE-'
    },
    
    // Categories for sales
    categories: ['Eggs', 'Broilers', 'Layers', 'Poultry Meat', 'Chicks', 'Manure/Fertilizer', 'Crops', 'Other'],
    
    // Payment methods
    paymentMethods: ['Cash', 'Bank Transfer', 'Mobile Money', 'Credit', 'Other'],
    
    // Customer types
    customerTypes: ['Regular', 'Wholesaler', 'Retailer', 'Walk-in', 'Online'],
    
    // Initialize module
    initialize() {
        console.log('📊 Initializing SalesRecord module...');
        
        // Get content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager
        if (window.StyleManager) {
            window.StyleManager.registerModule(this.name, this.element, this);
        }
        
        this.loadSettings();
        this.loadSales();
        this.migrateSalesDates();
        this.renderModule();
        this.setupEventListeners();
        this.updateStats();
        this.registerWithReports();
        
        this.initialized = true;
        console.log('✅ SalesRecord module initialized');
        return true;
    },
    
    onThemeChange(theme) {
        console.log(`SalesRecord module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },
    
    // ==================== DATA MANAGEMENT ====================
    loadSales() {
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
            
        } catch (e) {
            console.error('❌ Error loading sales:', e);
            this.sales = [];
        }
    },
    
    getDefaultSettings() {
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
    
    loadSettings() {
        const saved = localStorage.getItem('farm_sales_settings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                this.settings = this.getDefaultSettings();
            }
        }
    },
    
    saveSettings() {
        try {
            localStorage.setItem('farm_sales_settings', JSON.stringify(this.settings));
            return true;
        } catch (e) {
            console.error('❌ Error saving settings:', e);
            return false;
        }
    },
    
    saveToStorage() {
        try {
            const data = {
                version: '2.0',
                sales: this.sales,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('farm_sales_v2', JSON.stringify(data));
            console.log('💾 Sales data saved successfully');
            
            // Update reports module data
            this.updateReportsData();
            
            return true;
        } catch (e) {
            console.error('❌ Error saving sales:', e);
            return false;
        }
    },
    
    convertLegacySale(legacySale) {
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
    
    // ==================== DATE FIXES ====================
    normalizeDate(dateString) {
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
    
    migrateSalesDates() {
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
    
    // ==================== SALES OPERATIONS ====================
    generateReceiptId() {
        const prefix = this.settings.receiptPrefix || 'SALE-';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    },
    
    addSale(saleData) {
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
        
        this.sales.unshift(newSale);
        this.saveToStorage();
        this.updateStats();
        
        if (this.element && document.getElementById('sales-container')) {
            this.renderModule();
        }
        
        console.log(`✅ Sale added: ${receiptId} - ${newSale.product} for ${this.formatCurrency(newSale.grandTotal)}`);
        
        // Show receipt if enabled
        if (this.settings.enableReceipts) {
            this.showReceiptModal(newSale);
        }
        
        return newSale;
    },
    
    updateSale(id, updates) {
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
        
        if (this.element && document.getElementById('sales-container')) {
            this.renderModule();
        }
        
        console.log(`✏️ Sale updated: ${sale.receiptId}`);
        return true;
    },
    
    deleteSale(id) {
        const index = this.sales.findIndex(sale => sale.id === id);
        if (index === -1) return false;
        
        const deleted = this.sales.splice(index, 1)[0];
        this.saveToStorage();
        this.updateStats();
        
        if (this.element && document.getElementById('sales-container')) {
            this.renderModule();
        }
        
        console.log(`🗑️ Sale deleted: ${deleted.receiptId} - ${deleted.product}`);
        return true;
    },
    
    // ==================== UI RENDERING ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Manage and track your farm sales</p>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatCurrency(this.getTotalSalesAmount())}</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.sales.length}</div>
                            <div class="stat-label">Total Sales</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatCurrency(this.getAverageSaleValue())}</div>
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
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-sale-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record a new sale</span>
                    </button>
                    <button class="quick-action-btn" id="generate-report-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Sales Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Generate sales report</span>
                    </button>
                    <button class="quick-action-btn" id="export-sales-btn">
                        <div style="font-size: 32px;">📥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export sales to CSV/JSON</span>
                    </button>
                    <button class="quick-action-btn" id="manage-customers-btn">
                        <div style="font-size: 32px;">👥</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Customers</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Manage customers</span>
                    </button>
                </div>

                <!-- Recent Sales Table -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Sales</h3>
                        <button class="btn-primary" id="view-all-sales-btn">View All</button>
                    </div>
                    ${this.renderSalesTable()}
                </div>

                <!-- Summary -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Sales Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Total Sales Count</div>
                            <div class="summary-value">${this.sales.length}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Revenue</div>
                            <div class="summary-value">${this.formatCurrency(this.getTotalSalesAmount())}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Average Sale Value</div>
                            <div class="summary-value">${this.formatCurrency(this.getAverageSaleValue())}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Top Product</div>
                            <div class="summary-value">${this.getTopProduct()}</div>
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

            <!-- Report Modal -->
            <div id="sales-report-modal" class="modal-overlay hidden">
                <div class="modal-container" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>📊 Sales Report</h3>
                        <button class="modal-close" id="close-report-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="sales-report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-outline" id="print-report-btn">🖨️ Print</button>
                        <button class="btn-primary" id="close-report-modal-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },
    
    renderSalesTable() {
        if (this.sales.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No sales records yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Click "Add Sale" to record your first sale</div>
                </div>
            `;
        }

        const recentSales = this.sales.slice(0, 10);
        
        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--glass-hover);">
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Date</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Receipt ID</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Product</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Customer</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Amount</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary); font-weight: 600; border-bottom: 1px solid var(--glass-border);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentSales.map(sale => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px; color: var(--text-primary);">${sale.date}</td>
                                <td style="padding: 12px;">
                                    <span style="font-family: monospace; background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px;">${sale.receiptId}</span>
                                </td>
                                <td style="padding: 12px; color: var(--text-primary);">
                                    <div style="font-weight: 600;">${sale.product}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${sale.category}</div>
                                </td>
                                <td style="padding: 12px; color: var(--text-primary);">
                                    <div style="font-weight: 600;">${sale.customerName}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${sale.customerType}</div>
                                </td>
                                <td style="padding: 12px;">
                                    <div style="font-weight: bold; color: var(--text-primary);">${this.formatCurrency(sale.grandTotal)}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${sale.quantity} × ${this.formatCurrency(sale.price)}</div>
                                </td>
                                <td style="padding: 12px;">
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn-icon view-sale-btn" data-id="${sale.id}" title="View">
                                            👁️
                                        </button>
                                        <button class="btn-icon delete-sale-btn" data-id="${sale.id}" title="Delete">
                                            🗑️
                                        </button>
                                        <button class="btn-icon receipt-btn" data-id="${sale.id}" title="Receipt">
                                            🧾
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
    
    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        // Add sale button
        const addSaleBtn = document.getElementById('add-sale-btn');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => this.showAddSaleModal());
        }
        
        // Report button
        const reportBtn = document.getElementById('generate-report-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.showSalesReportModal());
        }
        
        // Export button
        const exportBtn = document.getElementById('export-sales-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSales());
        }
        
        // View all button
        const viewAllBtn = document.getElementById('view-all-sales-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllSales());
        }
        
        // Modal buttons
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelSaleBtn = document.getElementById('cancel-sale-btn');
        const saveSaleBtn = document.getElementById('save-sale-btn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.hideAddSaleModal());
        if (cancelSaleBtn) cancelSaleBtn.addEventListener('click', () => this.hideAddSaleModal());
        if (saveSaleBtn) saveSaleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveNewSale();
        });
        
        // Report modal buttons
        const closeReportBtn = document.getElementById('close-report-btn');
        const closeReportModalBtn = document.getElementById('close-report-modal-btn');
        const printReportBtn = document.getElementById('print-report-btn');
        
        if (closeReportBtn) closeReportBtn.addEventListener('click', () => this.hideSalesReportModal());
        if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', () => this.hideSalesReportModal());
        if (printReportBtn) printReportBtn.addEventListener('click', () => this.printSalesReport());
        
        // Receipt modal buttons
        const printReceiptBtn = document.getElementById('print-receipt-btn');
        const closeReceiptBtn = document.getElementById('close-receipt-btn');
        
        if (printReceiptBtn) printReceiptBtn.addEventListener('click', () => this.printReceipt());
        if (closeReceiptBtn) closeReceiptBtn.addEventListener('click', () => this.hideReceiptModal());
        
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
        
        // Close modals on overlay click
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'add-sale-modal') this.hideAddSaleModal();
                    if (modal.id === 'receipt-modal') this.hideReceiptModal();
                    if (modal.id === 'sales-report-modal') this.hideSalesReportModal();
                }
            });
        });
        
        // Attach dynamic button listeners
        setTimeout(() => {
            this.attachDynamicEventListeners();
        }, 100);
    },
    
    attachDynamicEventListeners() {
        // View sale buttons
        document.querySelectorAll('.view-sale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewSale(id);
            });
        });
        
        // Delete sale buttons
        document.querySelectorAll('.delete-sale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.confirmDeleteSale(id);
            });
        });
        
        // Receipt buttons
        document.querySelectorAll('.receipt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const sale = this.sales.find(s => s.id === id);
                if (sale) {
                    this.showReceiptModal(sale);
                }
            });
        });
    },
    
    // ==================== MODAL OPERATIONS ====================
    showAddSaleModal() {
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
    
    hideAddSaleModal() {
        const modal = document.getElementById('add-sale-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    showReceiptModal(sale) {
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
    
    hideReceiptModal() {
        const modal = document.getElementById('receipt-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    showSalesReportModal() {
        const modal = document.getElementById('sales-report-modal');
        const content = document.getElementById('sales-report-content');
        
        if (!modal || !content) return;
        
        const reportHTML = this.generateSalesReportHTML();
        content.innerHTML = reportHTML;
        modal.classList.remove('hidden');
    },
    
    hideSalesReportModal() {
        const modal = document.getElementById('sales-report-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    saveNewSale() {
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
    
    // ==================== UTILITY METHODS ====================
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.settings.currency || 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    getTotalSalesAmount() {
        return this.sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    },
    
    getAverageSaleValue() {
        return this.sales.length > 0 ? 
            this.getTotalSalesAmount() / this.sales.length : 0;
    },
    
    getTopProduct() {
        if (this.sales.length === 0) return 'N/A';
        
        const productCounts = {};
        this.sales.forEach(sale => {
            productCounts[sale.product] = (productCounts[sale.product] || 0) + 1;
        });
        
        return Object.entries(productCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
    },
    
    updateStats() {
        // Update any stats displays if needed
    },
    
    updateReportsData() {
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.sales = {
                total: this.getTotalSalesAmount(),
                count: this.sales.length,
                average: this.getAverageSaleValue()
            };
        }
    },
    
    registerWithReports() {
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.salesModule = this;
        }
    },
    
    // ==================== REPORT GENERATION ====================
    generateSalesReportHTML() {
        const total = this.getTotalSalesAmount();
        const avg = this.getAverageSaleValue();
        const count = this.sales.length;
        const topProduct = this.getTopProduct();
        
        const salesByCategory = {};
        this.sales.forEach(sale => {
            salesByCategory[sale.category] = (salesByCategory[sale.category] || 0) + sale.grandTotal;
        });
        
        return `
            <div class="report-content">
                <h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 SALES REPORT</h4>
                
                <div style="margin-bottom: 24px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 OVERVIEW:</h5>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Total Sales</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${count}</div>
                        </div>
                        <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(total)}</div>
                        </div>
                        <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Average Sale</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(avg)}</div>
                        </div>
                        <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Top Product</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${topProduct}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">🗂️ REVENUE BY CATEGORY:</h5>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${Object.entries(salesByCategory).map(([category, amount]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${category}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(amount)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">📅 DATE RANGE:</h5>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-weight: 600; color: var(--text-primary);">${this.getDateRange()}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    getDateRange() {
        if (this.sales.length === 0) return 'No sales';
        
        const dates = this.sales.map(s => new Date(s.date));
        const oldest = new Date(Math.min(...dates));
        const newest = new Date(Math.max(...dates));
        
        return `${oldest.toLocaleDateString()} - ${newest.toLocaleDateString()}`;
    },
    
    exportSales() {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                totalSales: this.sales.length,
                totalRevenue: this.getTotalSalesAmount(),
                version: '2.0'
            },
            sales: this.sales
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `sales-export-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('📤 Sales exported successfully');
    },
    
    printReceipt() {
        const receiptContent = document.getElementById('receipt-content');
        if (!receiptContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Sales Receipt</title>
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
    
    printSalesReport() {
        const reportContent = document.getElementById('sales-report-content');
        if (!reportContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Sales Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h4 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        h5 { color: #374151; margin: 20px 0 10px 0; }
                        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
                        .stat-item { padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; }
                        @media print { body { margin: 0.5in; } }
                    </style>
                </head>
                <body>
                    <h1>Sales Report</h1>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0;">
                    ${reportContent.innerHTML}
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
    
    viewSale(id) {
        const sale = this.sales.find(s => s.id === id);
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
    
    confirmDeleteSale(id) {
        const sale = this.sales.find(s => s.id === id);
        if (!sale) return;
        
        if (confirm(`Are you sure you want to delete sale ${sale.receiptId}?\n\nProduct: ${sale.product}\nAmount: ${this.formatCurrency(sale.grandTotal)}\n\nThis action cannot be undone.`)) {
            this.deleteSale(id);
        }
    },
    
    showAllSales() {
        // For now, just refresh with all sales
        this.renderModule();
    },
    
    // ==================== DEBUG METHODS ====================
    debugAllSalesDates() {
        console.group('🔍 Sales Date Debug Info');
        console.log(`Total sales: ${this.sales.length}`);
        console.log('Current date formats:');
        this.sales.forEach((sale, index) => {
            const isStandard = /^\d{4}-\d{2}-\d{2}$/.test(sale.date);
            console.log(`${index + 1}. ${sale.date} - ${sale.receiptId} - ${sale.product} ${isStandard ? '✅' : '❌'}`);
        });
        console.groupEnd();
    },
    
    testAddSampleSales() {
        const samples = [
            {
                product: 'Grade A Eggs',
                quantity: 120,
                price: 0.25,
                category: 'Eggs',
                customerName: 'Local Market',
                paymentMethod: 'Cash'
            },
            {
                product: 'Broilers',
                quantity: 50,
                price: 8.50,
                category: 'Poultry Meat',
                customerName: 'Restaurant XYZ',
                paymentMethod: 'Bank Transfer'
            }
        ];
        
        const today = new Date().toISOString().split('T')[0];
        
        samples.forEach(sample => {
            this.addSale({
                ...sample,
                date: today
            });
        });
        
        console.log('✅ Added sample sales for testing');
        this.debugAllSalesDates();
    }
};

// ==================== MODULE REGISTRATION ====================
// Register with FarmModules framework (EXACTLY LIKE INVENTORY-CHECK)
if (window.FarmModules) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
    console.log('✅ SalesRecord module registered successfully!');
} else {
    console.error('❌ FarmModules framework not found!');
}

// ==================== GLOBAL ACCESS ====================
// Also expose globally for backward compatibility
window.FarmModules = window.FarmModules || {};
window.FarmModules.SalesRecord = SalesRecordModule;

console.log('✅ SalesRecord module loaded successfully!');
