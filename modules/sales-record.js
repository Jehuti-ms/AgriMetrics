// sales-record.js - COMPLETE DROP-IN MODULE
console.log('🔧 Loading Sales Record module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentStats: {},
    exportFormat: 'csv',
    currentPage: 1,
    pageSize: 10,
    selectedSales: new Set(),
    allSalesSelected: false,

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('💰 Sales Records module initializing...');
        
        // Get the content area
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Load data
        this.loadSalesData();
        
        // Render the module
        this.renderModule();
        
        // Update UI
        this.updateSummary();
        this.renderSalesTable();
        this.updatePagination();
        
        // Sync with dashboard
        this.syncStatsWithDashboard();

        // Attach event listeners
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Sales event listeners attached');
        }, 100);

        this.initialized = true;
        
        // Register with StyleManager if available
        if (window.StyleManager) {
            const moduleContainer = this.element.querySelector('#sales-record');
            if (moduleContainer) {
                window.StyleManager.registerModule('sales-record', moduleContainer);
            }
        }
        
        console.log('✅ Sales Records module initialized successfully');
        return true;
    },

    // ==================== DATA MANAGEMENT ====================
    loadSalesData() {
        // Ensure FarmModules exists
        if (!window.FarmModules) {
            console.warn('⚠️ FarmModules not found, creating...');
            window.FarmModules = {
                modules: {},
                appData: {},
                registerModule: function(name, module) {
                    this.modules[name] = module;
                }
            };
        }
        
        // Ensure appData exists
        if (!window.FarmModules.appData) {
            window.FarmModules.appData = {};
        }
        
        // Initialize sales data if not exists
        if (!window.FarmModules.appData.sales) {
            console.log('📝 Initializing sales data structure');
            window.FarmModules.appData.sales = this.getDemoData();
        }
        
        console.log(`📊 Loaded ${window.FarmModules.appData.sales.length} sales records`);
        return window.FarmModules.appData.sales;
    },

    getDemoData() {
        return [
            {
                id: '1',
                date: new Date().toISOString().split('T')[0],
                product: 'organic-eggs',
                customer: 'Local Market',
                quantity: 50,
                unit: 'dozen',
                unitPrice: 5.50,
                totalAmount: 275.00,
                paymentStatus: 'paid',
                notes: 'Weekly delivery'
            },
            {
                id: '2',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                product: 'broiler-chicken',
                customer: 'Restaurant ABC',
                quantity: 25,
                unit: 'birds',
                unitPrice: 12.00,
                totalAmount: 300.00,
                paymentStatus: 'pending',
                notes: 'Large order'
            },
            {
                id: '3',
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
                product: 'free-range-eggs',
                customer: 'Farmers Market',
                quantity: 30,
                unit: 'dozen',
                unitPrice: 6.00,
                totalAmount: 180.00,
                paymentStatus: 'paid',
                notes: 'Special order'
            },
            {
                id: '4',
                date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
                product: 'corn',
                customer: 'Wholesaler',
                quantity: 100,
                unit: 'kg',
                unitPrice: 2.50,
                totalAmount: 250.00,
                paymentStatus: 'paid',
                notes: 'Bulk order'
            },
            {
                id: '5',
                date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
                product: 'tomatoes',
                customer: 'Grocery Store',
                quantity: 75,
                unit: 'kg',
                unitPrice: 3.00,
                totalAmount: 225.00,
                paymentStatus: 'cancelled',
                notes: 'Cancelled due to quality issues'
            }
        ];
    },

    saveSalesData() {
        if (window.FarmModules && window.FarmModules.appData) {
            console.log('💾 Saving sales data...');
            // Data is already in memory, nothing to do unless you need localStorage
        }
    },

    // ==================== RENDERING ====================
    renderModule() {
        if (!this.element) return;

        try {
            this.element.innerHTML = this.getModuleHTML();
            console.log('✅ Sales module rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering sales module:', error);
            this.showErrorState();
        }
    },

    getModuleHTML() {
        return `
            <div id="sales-record" class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-text">
                            <h1 class="module-title">Sales Records</h1>
                            <p class="module-subtitle">Track product sales and revenue performance</p>
                        </div>
                        <div class="header-stats">
                            <div class="stat-badge">
                                <span class="stat-icon">📈</span>
                                <span class="stat-value" id="total-sales-count">0</span>
                                <span class="stat-label">Total Sales</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">💰</span>
                                <span class="stat-value" id="total-revenue">$0</span>
                                <span class="stat-label">Revenue</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary btn-icon" id="add-sale">
                            <span class="btn-icon-text">➕</span>
                            <span>Record Sale</span>
                        </button>
                        <button class="btn btn-outline btn-icon" id="refresh-sales">
                            <span class="btn-icon-text">🔄</span>
                            <span>Refresh</span>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline btn-icon" id="export-dropdown">
                                <span class="btn-icon-text">📤</span>
                                <span>Export</span>
                                <span class="dropdown-arrow">▼</span>
                            </button>
                            <div class="dropdown-menu hidden" id="export-menu">
                                <button class="dropdown-item" data-format="csv">
                                    <span class="dropdown-icon">📄</span>
                                    Export as CSV
                                </button>
                                <button class="dropdown-item" data-format="excel">
                                    <span class="dropdown-icon">📊</span>
                                    Export as Excel
                                </button>
                                <button class="dropdown-item" data-format="pdf">
                                    <span class="dropdown-icon">📑</span>
                                    Export as PDF
                                </button>
                                <button class="dropdown-item" data-format="print">
                                    <span class="dropdown-icon">🖨️</span>
                                    Print Report
                                </button>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item" id="export-settings">
                                    <span class="dropdown-icon">⚙️</span>
                                    Export Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="sales-summary">
                    <div class="summary-card glass-card">
                        <div class="summary-icon">📈</div>
                        <div class="summary-content">
                            <h3>Today's Sales</h3>
                            <div class="summary-value" id="today-sales">$0</div>
                            <div class="summary-period" id="today-date">Today</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">📊</div>
                        <div class="summary-content">
                            <h3>This Week</h3>
                            <div class="summary-value" id="week-sales">$0</div>
                            <div class="summary-period">7 days</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">💰</div>
                        <div class="summary-content">
                            <h3>This Month</h3>
                            <div class="summary-value" id="month-sales">$0</div>
                            <div class="summary-period">30 days</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">🎯</div>
                        <div class="summary-content">
                            <h3>Top Product</h3>
                            <div class="summary-value" id="top-product">-</div>
                            <div class="summary-period" id="top-product-revenue">$0</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="module-content">
                    <!-- Sidebar -->
                    <div class="content-sidebar">
                        <div class="sidebar-card glass-card">
                            <h3 class="sidebar-title">Quick Sale</h3>
                            <form id="quick-sale-form" class="quick-form">
                                <div class="form-group">
                                    <label for="quick-product">Product</label>
                                    <input type="text" id="quick-product" placeholder="Enter product name" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="quick-quantity">Quantity</label>
                                        <input type="number" id="quick-quantity" placeholder="0" min="1" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="quick-price">Price</label>
                                        <input type="number" id="quick-price" placeholder="0.00" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="quick-customer">Customer (Optional)</label>
                                    <input type="text" id="quick-customer" placeholder="Customer name">
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <span class="btn-icon-text">💾</span>
                                    <span>Add Quick Sale</span>
                                </button>
                            </form>
                        </div>

                        <div class="sidebar-card glass-card">
                            <h3 class="sidebar-title">Quick Export</h3>
                            <div class="quick-export-options">
                                <button class="btn btn-outline btn-block" id="export-today">
                                    <span class="btn-icon-text">📈</span>
                                    <span>Today's Sales</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-week">
                                    <span class="btn-icon-text">📊</span>
                                    <span>This Week</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-month">
                                    <span class="btn-icon-text">💰</span>
                                    <span>This Month</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-all">
                                    <span class="btn-icon-text">📋</span>
                                    <span>All Sales</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Main Table Area -->
                    <div class="content-main">
                        <div class="main-card glass-card">
                            <div class="card-header">
                                <h3 class="card-title">Sales Records</h3>
                                <div class="card-actions">
                                    <div class="export-info" id="last-export-info">
                                        Last export: Never
                                    </div>
                                    <button class="btn btn-text btn-icon" id="print-sales" title="Print">
                                        <span class="btn-icon-text">🖨️</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="filter-bar">
                                <div class="filter-group">
                                    <label>Period</label>
                                    <select id="period-filter" class="filter-select">
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Status</label>
                                    <select id="status-filter" class="filter-select">
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button class="btn btn-outline" id="apply-filters">
                                    <span class="btn-icon-text">🔍</span>
                                    <span>Filter</span>
                                </button>
                                <button class="btn btn-text" id="clear-filters">
                                    Clear
                                </button>
                            </div>
                            
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th><input type="checkbox" id="select-all-sales" title="Select all"></th>
                                            <th>Date</th>
                                            <th>Product</th>
                                            <th>Customer</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sales-body">
                                        <!-- Sales will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="table-footer">
                                <div class="table-summary">
                                    <span id="selected-count">0 selected</span>
                                    <button class="btn btn-text btn-sm" id="export-selected" disabled>
                                        Export Selected
                                    </button>
                                </div>
                                <div class="pagination">
                                    <button class="btn btn-text" id="prev-page" disabled>
                                        <span class="btn-icon-text">←</span>
                                        <span>Previous</span>
                                    </button>
                                    <span class="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></span>
                                    <button class="btn btn-text" id="next-page" disabled>
                                        <span>Next</span>
                                        <span class="btn-icon-text">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modals -->
                ${this.getSaleModalHTML()}
                ${this.getExportSettingsModalHTML()}
                ${this.getExportProgressModalHTML()}
            </div>
        `;
    },

    getSaleModalHTML() {
        return `
            <div id="sale-modal" class="modal hidden">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h3 id="sale-modal-title">Record Sale</h3>
                        <button class="modal-close btn-icon">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="sale-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-product">Product</label>
                                    <input type="text" id="sale-product" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-date">Date</label>
                                    <input type="date" id="sale-date" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-quantity">Quantity</label>
                                    <input type="number" id="sale-quantity" required min="1">
                                </div>
                                <div class="form-group">
                                    <label for="sale-unit-price">Unit Price ($)</label>
                                    <input type="number" id="sale-unit-price" required step="0.01" min="0">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="sale-customer">Customer (Optional)</label>
                                <input type="text" id="sale-customer">
                            </div>
                            <div class="form-group">
                                <label for="sale-payment">Payment Status</label>
                                <select id="sale-payment">
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="sale-notes">Notes (Optional)</label>
                                <textarea id="sale-notes" rows="3" placeholder="Additional details..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text modal-close">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-sale" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-sale">Save Sale</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExportSettingsModalHTML() {
        return `
            <div id="export-settings-modal" class="modal hidden">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h3>Export Settings</h3>
                        <button class="modal-close btn-icon">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="export-settings-form">
                            <div class="form-group">
                                <label>Date Range</label>
                                <div class="form-row">
                                    <div class="form-group">
                                        <input type="date" id="export-start-date" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}">
                                        <label for="export-start-date" class="sub-label">Start Date</label>
                                    </div>
                                    <div class="form-group">
                                        <input type="date" id="export-end-date" value="${new Date().toISOString().split('T')[0]}">
                                        <label for="export-end-date" class="sub-label">End Date</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Include Columns</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="date" checked> Date
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="product" checked> Product
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="customer" checked> Customer
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="quantity" checked> Quantity
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="unitPrice" checked> Unit Price
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="totalAmount" checked> Total Amount
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="paymentStatus" checked> Payment Status
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="export-columns" value="notes"> Notes
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>File Name</label>
                                <input type="text" id="export-filename" value="sales-report-${new Date().toISOString().split('T')[0]}" placeholder="Enter file name">
                            </div>
                            
                            <div class="form-group">
                                <label>Format Options</label>
                                <div class="radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="export-format" value="csv" checked> CSV (Compatible with Excel)
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="export-format" value="excel"> Excel (.xlsx)
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="export-format" value="pdf"> PDF Document
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Include Summary</label>
                                <label class="switch">
                                    <input type="checkbox" id="include-summary" checked>
                                    <span class="switch-slider"></span>
                                    <span class="switch-label">Include sales summary in export</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text modal-close">Cancel</button>
                        <button type="button" class="btn btn-primary" id="apply-export-settings">Apply & Export</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExportProgressModalHTML() {
        return `
            <div id="export-progress-modal" class="modal hidden">
                <div class="modal-content glass-card" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Exporting Sales Data</h3>
                    </div>
                    <div class="modal-body">
                        <div class="export-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="export-progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="progress-text" id="export-progress-text">Preparing export...</div>
                            <div class="progress-details" id="export-details"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text" id="cancel-export">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    },

    showErrorState() {
        this.element.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h2 style="margin-bottom: 16px;">Error Loading Sales Module</h2>
                <p style="margin-bottom: 24px;">There was an error loading the sales module. Please try refreshing the page.</p>
                <button onclick="window.location.reload()" style="
                    padding: 10px 24px;
                    background: var(--primary-500);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">Refresh Page</button>
            </div>
        `;
    },

    // ==================== SUMMARY & STATS ====================
    updateSummary() {
        const sales = window.FarmModules?.appData?.sales || [];
        const today = new Date().toISOString().split('T')[0];

        // Update header stats
        this.updateElement('total-sales-count', sales.length);
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        this.updateElement('total-revenue', this.formatCurrency(totalRevenue));

        // Update today's date
        const todayElement = document.getElementById('today-date');
        if (todayElement) {
            todayElement.textContent = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Calculate sales figures
        const todaySales = sales.filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        const weekSales = this.getSalesForPeriod(sales, 7);
        const monthSales = this.getSalesForPeriod(sales, 30);

        // Calculate top product
        const productSales = {};
        sales.forEach(sale => {
            if (!productSales[sale.product]) productSales[sale.product] = 0;
            productSales[sale.product] += (sale.totalAmount || 0);
        });

        let topProduct = '-';
        let topRevenue = 0;
        Object.entries(productSales).forEach(([product, revenue]) => {
            if (revenue > topRevenue) {
                topProduct = this.formatProductName(product);
                topRevenue = revenue;
            }
        });

        // Update summary cards
        this.updateElement('today-sales', this.formatCurrency(todaySales));
        this.updateElement('week-sales', this.formatCurrency(weekSales));
        this.updateElement('month-sales', this.formatCurrency(monthSales));
        this.updateElement('top-product', topProduct);
        this.updateElement('top-product-revenue', this.formatCurrency(topRevenue));

        // Update current stats
        this.currentStats = {
            totalSales: sales.length,
            totalRevenue: totalRevenue,
            todaySales,
            weekSales,
            monthSales,
            avgSaleValue: sales.length > 0 ? totalRevenue / sales.length : 0,
            paidSales: sales.filter(sale => sale.paymentStatus === 'paid').length,
            pendingSales: sales.filter(sale => sale.paymentStatus === 'pending').length,
            cancelledSales: sales.filter(sale => sale.paymentStatus === 'cancelled').length,
            topProduct,
            topProductRevenue: topRevenue
        };
    },

    getSalesForPeriod(sales, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= cutoffDate;
        }).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    },

    // ==================== TABLE RENDERING ====================
    renderSalesTable(period = 'today', status = 'all') {
        const tbody = document.getElementById('sales-body');
        if (!tbody) return;

        let sales = window.FarmModules?.appData?.sales || [];
        
        // Apply period filter
        if (period !== 'all') {
            const cutoffDate = new Date();
            if (period === 'today') cutoffDate.setDate(cutoffDate.getDate() - 1);
            else if (period === 'week') cutoffDate.setDate(cutoffDate.getDate() - 7);
            else if (period === 'month') cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            sales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= cutoffDate;
            });
        }
        
        // Apply status filter
        if (status !== 'all') {
            sales = sales.filter(sale => sale.paymentStatus === status);
        }
        
        // Pagination
        const totalPages = Math.ceil(sales.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, sales.length);
        const pageSales = sales.slice(startIndex, endIndex);
        
        if (pageSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">💰</span>
                            <h4>No sales found</h4>
                            <p>${period === 'all' ? 'Start recording your sales' : `No sales match your filters`}</p>
                        </div>
                    </td>
                </tr>
            `;
            this.updateElement('showing-count', 0);
            return;
        }

        const sortedSales = pageSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedSales.map(sale => {
            const paymentClass = `status-badge status-${sale.paymentStatus || 'paid'}`;
            const statusText = sale.paymentStatus === 'paid' ? 'Paid' : 
                              sale.paymentStatus === 'pending' ? 'Pending' : 'Cancelled';
            
            const isSelected = this.selectedSales.has(sale.id);
            
            return `
                <tr data-sale-id="${sale.id}">
                    <td>
                        <input type="checkbox" class="sale-checkbox" value="${sale.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>
                        <div class="date-cell">
                            <span class="date-day">${this.formatDate(sale.date, 'short')}</span>
                            <span class="date-time">${this.formatTime(sale.date)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="product-cell">
                            <span class="product-name">${this.formatProductName(sale.product)}</span>
                            ${sale.notes ? `<span class="product-notes" title="${sale.notes}">📝</span>` : ''}
                        </div>
                    </td>
                    <td>${sale.customer || '<span class="text-muted">Walk-in</span>'}</td>
                    <td>${sale.quantity || 0} <span class="text-muted">${sale.unit || 'units'}</span></td>
                    <td>${this.formatCurrency(sale.unitPrice || 0)}</td>
                    <td><strong>${this.formatCurrency(sale.totalAmount || 0)}</strong></td>
                    <td><span class="${paymentClass}">${statusText}</span></td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn-icon edit-sale" data-id="${sale.id}" title="Edit">
                                <span>✏️</span>
                            </button>
                            <button class="btn-icon delete-sale" data-id="${sale.id}" title="Delete">
                                <span>🗑️</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.updatePagination(totalPages);
        this.updateSelectedCount();
    },

    updatePagination(totalPages) {
        this.updateElement('current-page', this.currentPage);
        this.updateElement('total-pages', totalPages);
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    },

    // ==================== EVENT HANDLERS ====================
    attachEventListeners() {
        console.log('🔗 Attaching sales event listeners...');

        try {
            // Quick sale form
            const quickForm = document.getElementById('quick-sale-form');
            if (quickForm) {
                quickForm.addEventListener('submit', (e) => this.handleQuickSale(e));
            }

            // Header buttons
            document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
            document.getElementById('refresh-sales')?.addEventListener('click', () => this.refreshSales());

            // Export dropdown
            this.setupExportDropdown();
            
            // Quick export buttons
            ['export-today', 'export-week', 'export-month', 'export-all'].forEach(id => {
                document.getElementById(id)?.addEventListener('click', () => {
                    const period = id.replace('export-', '');
                    this.quickExport(period);
                });
            });

            // Export selected button
            document.getElementById('export-selected')?.addEventListener('click', () => this.exportSelectedSales());

            // Select all checkbox
            document.getElementById('select-all-sales')?.addEventListener('change', (e) => {
                this.toggleSelectAllSales(e.target.checked);
            });

            // Filter controls
            document.getElementById('apply-filters')?.addEventListener('click', () => this.applyFilters());
            document.getElementById('clear-filters')?.addEventListener('click', () => this.clearFilters());
            
            // Period filter
            document.getElementById('period-filter')?.addEventListener('change', (e) => {
                this.currentPage = 1;
                this.renderSalesTable(e.target.value, document.getElementById('status-filter').value);
            });
            
            // Status filter
            document.getElementById('status-filter')?.addEventListener('change', (e) => {
                this.currentPage = 1;
                this.renderSalesTable(document.getElementById('period-filter').value, e.target.value);
            });

            // Modal controls
            this.setupModalControls();

            // Print button
            document.getElementById('print-sales')?.addEventListener('click', () => this.printSalesReport());

            // Apply export settings
            document.getElementById('apply-export-settings')?.addEventListener('click', () => this.applyExportSettings());

            // Cancel export button
            document.getElementById('cancel-export')?.addEventListener('click', () => this.hideExportProgress());

            // Pagination
            document.getElementById('prev-page')?.addEventListener('click', () => this.prevPage());
            document.getElementById('next-page')?.addEventListener('click', () => this.nextPage());

            // Checkbox change events
            document.addEventListener('change', (e) => {
                if (e.target.classList.contains('sale-checkbox')) {
                    this.handleSaleCheckbox(e.target);
                }
            });

            // Delete and edit buttons (event delegation)
            document.addEventListener('click', (e) => {
                if (e.target.closest('.delete-sale')) {
                    const id = e.target.closest('.delete-sale').dataset.id;
                    this.deleteSale(id);
                }
                if (e.target.closest('.edit-sale')) {
                    const id = e.target.closest('.edit-sale').dataset.id;
                    this.editSale(id);
                }
            });

            // Click outside modals to close
            window.addEventListener('click', (e) => {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (e.target === modal && !modal.classList.contains('hidden')) {
                        modal.classList.add('hidden');
                    }
                });
            });

            console.log('✅ All sales event listeners attached successfully');
        } catch (error) {
            console.error('❌ Error attaching event listeners:', error);
        }
    },

    setupExportDropdown() {
        const exportDropdown = document.getElementById('export-dropdown');
        const exportMenu = document.getElementById('export-menu');
        
        if (!exportDropdown || !exportMenu) return;
        
        exportDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            exportMenu.classList.add('hidden');
        });

        // Export format selection
        const exportItems = exportMenu.querySelectorAll('.dropdown-item[data-format]');
        exportItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const format = item.getAttribute('data-format');
                if (format === 'print') {
                    this.printSalesReport();
                } else {
                    this.exportFormat = format;
                    this.showExportSettings();
                }
                exportMenu.classList.add('hidden');
            });
        });

        // Export settings button
        document.getElementById('export-settings')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showExportSettings();
            exportMenu.classList.add('hidden');
        });
    },

    setupModalControls() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Save sale button
        document.getElementById('save-sale')?.addEventListener('click', () => this.saveSale());
    },

    // ==================== SALE MANAGEMENT ====================
    handleQuickSale(e) {
        e.preventDefault();
        
        const product = document.getElementById('quick-product').value.trim();
        const quantity = parseFloat(document.getElementById('quick-quantity').value);
        const price = parseFloat(document.getElementById('quick-price').value);
        const customer = document.getElementById('quick-customer').value.trim();

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const sale = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            product: product.toLowerCase().replace(/\s+/g, '-'),
            customer: customer || undefined,
            quantity: quantity,
            unit: 'units',
            unitPrice: price,
            totalAmount: quantity * price,
            paymentStatus: 'paid',
            notes: 'Quick sale'
        };

        this.addSale(sale);
        document.getElementById('quick-sale-form').reset();
        
        this.showNotification('Quick sale added successfully!', 'success');
    },

    showSaleModal(saleId = null) {
        const modal = document.getElementById('sale-modal');
        const modalTitle = document.getElementById('sale-modal-title');
        const deleteBtn = document.getElementById('delete-sale');
        const form = document.getElementById('sale-form');
        const dateField = document.getElementById('sale-date');

        if (saleId) {
            // Edit mode
            const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
            if (!sale) return;
            
            modalTitle.textContent = 'Edit Sale';
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => this.deleteSale(saleId);
            
            // Populate form
            document.getElementById('sale-product').value = sale.product;
            document.getElementById('sale-date').value = sale.date;
            document.getElementById('sale-quantity').value = sale.quantity;
            document.getElementById('sale-unit-price').value = sale.unitPrice;
            document.getElementById('sale-customer').value = sale.customer || '';
            document.getElementById('sale-payment').value = sale.paymentStatus;
            document.getElementById('sale-notes').value = sale.notes || '';
        } else {
            // Add mode
            modalTitle.textContent = 'Record Sale';
            deleteBtn.style.display = 'none';
            if (form) form.reset();
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }

        modal.classList.remove('hidden');
    },

    saveSale() {
        const form = document.getElementById('sale-form');
        const product = document.getElementById('sale-product').value.trim();
        const date = document.getElementById('sale-date').value;
        const quantity = parseFloat(document.getElementById('sale-quantity').value);
        const unitPrice = parseFloat(document.getElementById('sale-unit-price').value);
        const customer = document.getElementById('sale-customer').value.trim();
        const paymentStatus = document.getElementById('sale-payment').value;
        const notes = document.getElementById('sale-notes').value.trim();

        if (!product || !date || !quantity || !unitPrice) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const sale = {
            id: Date.now().toString(),
            date: date,
            product: product.toLowerCase().replace(/\s+/g, '-'),
            customer: customer || undefined,
            quantity: quantity,
            unit: 'units',
            unitPrice: unitPrice,
            totalAmount: quantity * unitPrice,
            paymentStatus: paymentStatus,
            notes: notes || undefined
        };

        this.addSale(sale);
        document.getElementById('sale-modal').classList.add('hidden');
        
        this.showNotification('Sale saved successfully!', 'success');
    },

    addSale(sale) {
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        window.FarmModules.appData.sales.unshift(sale);
        this.saveSalesData();
        this.updateSummary();
        this.renderSalesTable();
        this.syncStatsWithDashboard();
    },

    editSale(saleId) {
        this.showSaleModal(saleId);
    },

    deleteSale(saleId) {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        this.selectedSales.delete(saleId);
        this.saveSalesData();
        this.updateSummary();
        this.renderSalesTable();
        this.syncStatsWithDashboard();
        
        this.showNotification('Sale deleted successfully!', 'success');
    },

    refreshSales() {
        this.loadSalesData();
        this.updateSummary();
        this.renderSalesTable();
        this.showNotification('Sales data refreshed!', 'success');
    },

    // ==================== FILTERS ====================
    applyFilters() {
        const period = document.getElementById('period-filter').value;
        const status = document.getElementById('status-filter').value;
        this.currentPage = 1;
        this.renderSalesTable(period, status);
    },

    clearFilters() {
        document.getElementById('period-filter').value = 'today';
        document.getElementById('status-filter').value = 'all';
        this.currentPage = 1;
        this.renderSalesTable('today', 'all');
    },

    // ==================== SELECTION ====================
    toggleSelectAllSales(checked) {
        const checkboxes = document.querySelectorAll('.sale-checkbox');
        const sales = window.FarmModules?.appData?.sales || [];
        
        if (checked) {
            // Add all sales on current page to selection
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                this.selectedSales.add(checkbox.value);
            });
            this.allSalesSelected = true;
        } else {
            // Clear all selections
            checkboxes.forEach(checkbox => checkbox.checked = false);
            this.selectedSales.clear();
            this.allSalesSelected = false;
        }
        
        this.updateSelectedCount();
    },

    handleSaleCheckbox(checkbox) {
        const saleId = checkbox.value;
        
        if (checkbox.checked) {
            this.selectedSales.add(saleId);
        } else {
            this.selectedSales.delete(saleId);
            this.allSalesSelected = false;
            document.getElementById('select-all-sales').checked = false;
        }
        
        this.updateSelectedCount();
    },

    updateSelectedCount() {
        const selectedCount = this.selectedSales.size;
        const exportSelectedBtn = document.getElementById('export-selected');
        const selectedCountSpan = document.getElementById('selected-count');
        
        if (selectedCountSpan) {
            selectedCountSpan.textContent = `${selectedCount} selected`;
        }
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedCount === 0;
        }
    },

    // ==================== PAGINATION ====================
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderSalesTable(
                document.getElementById('period-filter').value,
                document.getElementById('status-filter').value
            );
        }
    },

    nextPage() {
        const sales = window.FarmModules?.appData?.sales || [];
        const totalPages = Math.ceil(sales.length / this.pageSize);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderSalesTable(
                document.getElementById('period-filter').value,
                document.getElementById('status-filter').value
            );
        }
    },

    // ==================== EXPORT FUNCTIONALITY ====================
    showExportSettings() {
        document.getElementById('export-settings-modal').classList.remove('hidden');
    },

    applyExportSettings() {
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        const filename = document.getElementById('export-filename').value || `sales-report-${new Date().toISOString().split('T')[0]}`;
        const includeSummary = document.getElementById('include-summary').checked;
        
        // Get selected columns
        const columnCheckboxes = document.querySelectorAll('input[name="export-columns"]:checked');
        const selectedColumns = Array.from(columnCheckboxes).map(cb => cb.value);
        
        // Get format
        const formatRadio = document.querySelector('input[name="export-format"]:checked');
        const format = formatRadio ? formatRadio.value : 'csv';
        
        document.getElementById('export-settings-modal').classList.add('hidden');
        
        this.exportSalesData({
            startDate,
            endDate,
            filename,
            format,
            columns: selectedColumns,
            includeSummary
        });
    },

    quickExport(period) {
        const endDate = new Date();
        let startDate = new Date();
        let filename = '';

        switch(period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                filename = `sales-today-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                filename = `sales-week-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'month':
                startDate.setDate(endDate.getDate() - 30);
                filename = `sales-month-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'all':
                startDate = null;
                filename = `all-sales-${new Date().toISOString().split('T')[0]}`;
                break;
        }

        this.exportSalesData({
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate.toISOString().split('T')[0],
            filename,
            format: 'csv',
            columns: ['date', 'product', 'customer', 'quantity', 'unitPrice', 'totalAmount', 'paymentStatus'],
            includeSummary: true
        });
    },

    exportSelectedSales() {
        if (this.selectedSales.size === 0) {
            this.showNotification('No sales selected for export', 'error');
            return;
        }
        
        const selectedSales = window.FarmModules.appData.sales.filter(s => this.selectedSales.has(s.id));
        
        this.exportSalesData({
            sales: selectedSales,
            filename: `selected-sales-${new Date().toISOString().split('T')[0]}`,
            format: this.exportFormat,
            includeSummary: false
        });
    },

    async exportSalesData(options = {}) {
        this.showExportProgress();
        this.updateExportProgress(10, 'Preparing sales data...');
        
        let sales = options.sales || window.FarmModules?.appData?.sales || [];
        
        // Filter by date range if specified
        if (options.startDate && options.endDate) {
            sales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= new Date(options.startDate) && 
                       saleDate <= new Date(options.endDate);
            });
        }
        
        this.updateExportProgress(30, `Processing ${sales.length} sales records...`);
        
        // Prepare export data
        const columnMap = {
            date: 'Date',
            product: 'Product',
            customer: 'Customer',
            quantity: 'Quantity',
            unitPrice: 'Unit Price',
            totalAmount: 'Total Amount',
            paymentStatus: 'Payment Status',
            notes: 'Notes'
        };
        
        const columns = options.columns || ['date', 'product', 'customer', 'quantity', 'unitPrice', 'totalAmount', 'paymentStatus'];
        const headers = columns.map(col => columnMap[col] || col);
        
        const rows = sales.map(s => {
            return columns.map(col => {
                switch(col) {
                    case 'date':
                        return this.formatDate(s.date, 'export');
                    case 'product':
                        return this.formatProductName(s.product);
                    case 'unitPrice':
                    case 'totalAmount':
                        return s[col] || 0;
                    case 'paymentStatus':
                        return s[col] ? s[col].charAt(0).toUpperCase() + s[col].slice(1) : 'Paid';
                    default:
                        return s[col] || '';
                }
            });
        });
        
        this.updateExportProgress(60, 'Generating export file...');
        
        // Generate file
        let fileContent, mimeType, fileExtension;
        const filename = options.filename || `sales-${new Date().toISOString().split('T')[0]}`;
        const format = options.format || 'csv';
        
        if (format === 'csv') {
            [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, options.includeSummary, sales);
        } else if (format === 'excel') {
            [fileContent, mimeType, fileExtension] = await this.generateExcel(headers, rows, options.includeSummary, sales, filename);
        } else if (format === 'pdf') {
            [fileContent, mimeType, fileExtension] = await this.generatePDF(headers, rows, options.includeSummary, sales, filename);
        } else {
            [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, options.includeSummary, sales);
        }
        
        this.updateExportProgress(90, 'Finalizing export...');
        this.downloadFile(fileContent, `${filename}.${fileExtension}`, mimeType);
        this.updateLastExportInfo();
        this.updateExportProgress(100, 'Export completed successfully!');
        
        setTimeout(() => {
            this.hideExportProgress();
        }, 1500);
    },

    generateCSV(headers, rows, includeSummary, sales) {
        let csvContent = headers.join(',') + '\n';
        
        rows.forEach(row => {
            csvContent += row.map(cell => {
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',') + '\n';
        });
        
        if (includeSummary && sales.length > 0) {
            const stats = this.currentStats;
            csvContent += '\n\nSALES SUMMARY\n';
            csvContent += `Total Sales,${stats.totalSales}\n`;
            csvContent += `Total Revenue,${this.formatCurrency(stats.totalRevenue, false)}\n`;
            csvContent += `Today's Sales,${this.formatCurrency(stats.todaySales, false)}\n`;
            csvContent += `This Week's Sales,${this.formatCurrency(stats.weekSales, false)}\n`;
            csvContent += `This Month's Sales,${this.formatCurrency(stats.monthSales, false)}\n`;
            csvContent += `Average Sale Value,${this.formatCurrency(stats.avgSaleValue, false)}\n`;
            csvContent += `Paid Sales,${stats.paidSales}\n`;
            csvContent += `Pending Sales,${stats.pendingSales}\n`;
            csvContent += `Cancelled Sales,${stats.cancelledSales}\n`;
            csvContent += `Top Product,${stats.topProduct}\n`;
            csvContent += `Top Product Revenue,${this.formatCurrency(stats.topProductRevenue, false)}\n`;
            
            if (sales.length > 0) {
                const dates = sales.map(s => new Date(s.date));
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                csvContent += `Date Range,${this.formatDate(minDate.toISOString().split('T')[0], 'export')} to ${this.formatDate(maxDate.toISOString().split('T')[0], 'export')}\n`;
            }
        }
        
        return [csvContent, 'text/csv;charset=utf-8;', 'csv'];
    },

    async generateExcel(headers, rows, includeSummary, sales, filename) {
        // For now, create CSV that Excel can open
        console.log('Excel export would use SheetJS library in production');
        return this.generateCSV(headers, rows, includeSummary, sales);
    },

    async generatePDF(headers, rows, includeSummary, sales, filename) {
        // For now, create HTML that can be printed as PDF
        console.log('PDF export would use jsPDF library in production');
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Sales Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
        
        if (includeSummary && sales.length > 0) {
            const stats = this.currentStats;
            htmlContent += `
                <div class="summary">
                    <h2>Sales Summary</h2>
                    <p><strong>Total Sales:</strong> ${stats.totalSales}</p>
                    <p><strong>Total Revenue:</strong> ${this.formatCurrency(stats.totalRevenue)}</p>
                    <p><strong>Today's Sales:</strong> ${this.formatCurrency(stats.todaySales)}</p>
                    <p><strong>This Week's Sales:</strong> ${this.formatCurrency(stats.weekSales)}</p>
                    <p><strong>This Month's Sales:</strong> ${this.formatCurrency(stats.monthSales)}</p>
                    <p><strong>Top Product:</strong> ${stats.topProduct} (${this.formatCurrency(stats.topProductRevenue)})</p>
                </div>
            `;
        }
        
        htmlContent += `
                <div class="footer">
                    <p>Report generated by Farm Management System</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        return [htmlContent, 'text/html', 'html'];
    },

    printSalesReport() {
        const sales = window.FarmModules?.appData?.sales || [];
        const stats = this.currentStats;
        
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                    .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; }
                    .paid { color: green; }
                    .pending { color: orange; }
                    .cancelled { color: red; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Sales Report</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                    <button class="no-print" onclick="window.print()">Print Report</button>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>Sales Summary</h3>
                        <p><strong>Total Sales:</strong> ${stats.totalSales}</p>
                        <p><strong>Total Revenue:</strong> ${this.formatCurrency(stats.totalRevenue)}</p>
                        <p><strong>Today's Sales:</strong> ${this.formatCurrency(stats.todaySales)}</p>
                    </div>
                    <div class="summary-card">
                        <h3>Performance</h3>
                        <p><strong>This Week:</strong> ${this.formatCurrency(stats.weekSales)}</p>
                        <p><strong>This Month:</strong> ${this.formatCurrency(stats.monthSales)}</p>
                        <p><strong>Top Product:</strong> ${stats.topProduct}</p>
                    </div>
                </div>
                
                <h2>Sales Records</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(s => `
                            <tr>
                                <td>${this.formatDate(s.date, 'export')}</td>
                                <td>${this.formatProductName(s.product)}</td>
                                <td>${s.customer || 'Walk-in'}</td>
                                <td>${s.quantity} ${s.unit || 'units'}</td>
                                <td>${this.formatCurrency(s.unitPrice)}</td>
                                <td>${this.formatCurrency(s.totalAmount)}</td>
                                <td class="${s.paymentStatus}">${s.paymentStatus ? s.paymentStatus.charAt(0).toUpperCase() + s.paymentStatus.slice(1) : 'Paid'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    updateLastExportInfo() {
        const lastExportInfo = document.getElementById('last-export-info');
        if (lastExportInfo) {
            lastExportInfo.textContent = `Last export: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    },

    showExportProgress() {
        document.getElementById('export-progress-modal').classList.remove('hidden');
    },

    hideExportProgress() {
        document.getElementById('export-progress-modal').classList.add('hidden');
        this.updateExportProgress(0, '');
    },

    updateExportProgress(percent, message) {
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        const exportDetails = document.getElementById('export-details');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        
        if (exportDetails && percent === 100) {
            exportDetails.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                    <span style="color: #22c55e; font-size: 24px;">✓</span>
                    <div>
                        <strong>Export successful!</strong>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">File saved to your downloads folder</p>
                    </div>
                </div>
            `;
        }
    },

    // ==================== UTILITIES ====================
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    showNotification(message, type = 'info') {
        const types = {
            success: { icon: '✅', color: '#22c55e' },
            error: { icon: '❌', color: '#ef4444' },
            info: { icon: 'ℹ️', color: '#3b82f6' }
        };
        
        const config = types[type] || types.info;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            border-left: 4px solid ${config.color};
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <span style="font-size: 20px;">${config.icon}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add CSS animations if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    formatCurrency(amount, includeSymbol = true) {
        if (includeSymbol) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        } else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        }
    },

    formatDate(dateStr, format = 'long') {
        try {
            const d = new Date(dateStr);
            if (format === 'short') {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (format === 'export') {
                return d.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
            return d.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            console.warn(`⚠️ Error formatting date: ${dateStr}`, e);
            return dateStr;
        }
    },

    formatTime(dateStr) {
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            return '';
        }
    },

    formatProductName(product) {
        if (!product) return 'Unknown';
        return product.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    // ==================== DASHBOARD INTEGRATION ====================
    syncStatsWithDashboard() {
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }

            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalSales: this.currentStats.totalSales,
                totalRevenue: this.currentStats.totalRevenue,
                todaySales: this.currentStats.todaySales,
                weekSales: this.currentStats.weekSales,
                monthSales: this.currentStats.monthSales,
                avgSaleValue: this.currentStats.avgSaleValue,
                paidSales: this.currentStats.paidSales,
                pendingSales: this.currentStats.pendingSales,
                topProduct: this.currentStats.topProduct,
                topProductRevenue: this.currentStats.topProductRevenue
            });
        }

        // Dispatch event for dashboard updates
        const event = new CustomEvent('salesStatsUpdated', { detail: this.currentStats });
        document.dispatchEvent(event);
    }
};

// ==================== MODULE REGISTRATION ====================
console.log('🔧 Registering Sales Record module...');

// Self-executing registration
(function() {
    // Ensure window exists
    if (typeof window === 'undefined') {
        console.error('❌ Window object not available');
        return;
    }
    
    // Create FarmModules if it doesn't exist
    if (!window.FarmModules) {
        console.log('📦 Creating FarmModules global object');
        window.FarmModules = {
            modules: {},
            appData: {},
            registerModule: function(name, module) {
                console.log(`📝 Registering module: ${name}`);
                this.modules = this.modules || {};
                this.modules[name] = module;
                console.log(`✅ Module ${name} registered successfully`);
            }
        };
    }
    
    // Register the module
    try {
        if (typeof window.FarmModules.registerModule === 'function') {
            window.FarmModules.registerModule('sales-record', SalesRecordModule);
            console.log('🎯 Sales Records module registered with FarmModules');
        } else {
            console.warn('⚠️ FarmModules.registerModule not a function, using fallback');
            window.FarmModules.modules = window.FarmModules.modules || {};
            window.FarmModules.modules['sales-record'] = SalesRecordModule;
            console.log('🔄 Sales Records module registered via fallback');
        }
    } catch (error) {
        console.error('❌ Error registering sales-record module:', error);
        // Last resort registration
        window.salesRecordModule = SalesRecordModule;
        console.log('⚠️ Sales Records module assigned to window.salesRecordModule');
    }
    
    // Log success
    console.log('✅ Sales Record module loaded and ready');
})();

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesRecordModule;
}
