const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentStats: {},
    exportFormat: 'csv', // default export format

    initialize() {
        console.log('💰 Sales Records module initializing...');
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        this.loadSalesData();
        this.renderModule();
        this.updateSummary();
        this.renderSalesTable();

        // Sync initial stats with dashboard
        this.syncStatsWithDashboard();

        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Sales event listeners attached');
        }, 100);

        this.initialized = true;
        
        // Register with StyleManager
        if (window.StyleManager) {
            const moduleContainer = this.element.querySelector('#sales-record');
            if (moduleContainer) {
                window.StyleManager.registerModule('sales-record', moduleContainer);
            }
        }
        
        return true;
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="sales-record" class="module-container">
                <!-- Modern PWA Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-text">
                            <h1 class="module-title">Sales Records</h1>
                            <p class="module-subtitle">Track product sales and revenue performance</p>
                        </div>
                        <div class="header-stats">
                            <div class="stat-badge">
                                <span class="stat-icon">📈</span>
                                <span class="stat-value" id="total-sales-count">${window.FarmModules?.appData?.sales?.length || 0}</span>
                                <span class="stat-label">Total Sales</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">💰</span>
                                <span class="stat-value" id="total-revenue">${this.formatCurrency(window.FarmModules?.appData?.sales?.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) || 0)}</span>
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

                <!-- Export Settings Modal -->
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

                <!-- Export Progress Modal -->
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

                <!-- Sales Summary Cards -->
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

                <!-- Main Content Area -->
                <div class="module-content">
                    <!-- Left Column - Quick Actions & Filters -->
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

                    <!-- Right Column - Sales Table -->
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
                                        <tr>
                                            <td colspan="9" class="empty-state">
                                                <div class="empty-content">
                                                    <span class="empty-icon">💰</span>
                                                    <h4>No sales recorded yet</h4>
                                                    <p>Start recording your product sales to see data here</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="table-footer">
                                <div class="table-summary">
                                    <span id="selected-count">0 selected</span>
                                    <button class="btn btn-text btn-sm" id="export-selected" style="margin-left: 12px;" disabled>
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

                <!-- Sales Modal (unchanged) -->
                <div id="sale-modal" class="modal hidden">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h3 id="sale-modal-title">Record Sale</h3>
                            <button class="modal-close btn-icon">
                                <span>&times;</span>
                            </button>
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
                                    <label for="sale-customer">Customer Name (Optional)</label>
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
                                    <textarea id="sale-notes" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-text modal-close">Cancel</button>
                            <button type="button" class="btn btn-danger" id="delete-sale" style="display: none;">Delete Sale</button>
                            <button type="button" class="btn btn-primary" id="save-sale">Save Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ... (keep all previous methods up to attachEventListeners)

    attachEventListeners() {
        console.log('🔗 Attaching sales event listeners...');

        // Quick sale form
        const quickForm = document.getElementById('quick-sale-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
        }

        // Header buttons
        const addSaleBtn = document.getElementById('add-sale');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => {
                this.showSaleModal();
            });
        }

        const refreshBtn = document.getElementById('refresh-sales');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadSalesData();
                this.updateSummary();
                this.renderSalesTable();
            });
        }

        // Export dropdown
        const exportDropdown = document.getElementById('export-dropdown');
        const exportMenu = document.getElementById('export-menu');
        if (exportDropdown && exportMenu) {
            exportDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                exportMenu.classList.toggle('hidden');
            });

            // Close dropdown when clicking elsewhere
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
            const exportSettingsBtn = document.getElementById('export-settings');
            if (exportSettingsBtn) {
                exportSettingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showExportSettings();
                    exportMenu.classList.add('hidden');
                });
            }
        }

        // Quick export buttons
        const quickExportButtons = ['export-today', 'export-week', 'export-month', 'export-all'];
        quickExportButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const period = id.replace('export-', '');
                    this.quickExport(period);
                });
            }
        });

        // Export selected button
        const exportSelectedBtn = document.getElementById('export-selected');
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', () => {
                this.exportSelectedSales();
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-sales');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAllSales(e.target.checked);
            });
        }

        // Export settings modal
        const exportSettingsModal = document.getElementById('export-settings-modal');
        const exportSettingsCloseBtns = exportSettingsModal?.querySelectorAll('.modal-close');
        if (exportSettingsCloseBtns) {
            exportSettingsCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    exportSettingsModal.classList.add('hidden');
                });
            });
        }

        // Apply export settings
        const applyExportBtn = document.getElementById('apply-export-settings');
        if (applyExportBtn) {
            applyExportBtn.addEventListener('click', () => {
                this.applyExportSettings();
            });
        }

        // Cancel export button
        const cancelExportBtn = document.getElementById('cancel-export');
        if (cancelExportBtn) {
            cancelExportBtn.addEventListener('click', () => {
                this.hideExportProgress();
            });
        }

        // Modal controls (existing)
        const modalCloseBtns = document.querySelectorAll('.modal-close:not(#export-settings-modal .modal-close)');
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideSaleModal();
            });
        });

        const saveSaleBtn = document.getElementById('save-sale');
        if (saveSaleBtn) {
            saveSaleBtn.addEventListener('click', () => {
                this.handleSaveSale();
            });
        }

        // Print button
        const printBtn = document.getElementById('print-sales');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printSalesReport();
            });
        }

        // Filter controls (existing)
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.renderSalesTable(e.target.value);
            });
        }

        // Pagination (existing)
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

        // Click outside modal to close (existing)
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('sale-modal');
            if (e.target === modal) {
                this.hideSaleModal();
            }
            const exportModal = document.getElementById('export-settings-modal');
            if (e.target === exportModal) {
                exportModal.classList.add('hidden');
            }
            const progressModal = document.getElementById('export-progress-modal');
            if (e.target === progressModal) {
                // Don't close progress modal on outside click
            }
        });
    },

    // EXPORT FUNCTIONALITY METHODS

    showExportSettings() {
        const modal = document.getElementById('export-settings-modal');
        modal.classList.remove('hidden');
    },

    applyExportSettings() {
        const modal = document.getElementById('export-settings-modal');
        const form = document.getElementById('export-settings-form');
        
        // Get settings from form
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        const filename = document.getElementById('export-filename').value || `sales-report-${new Date().toISOString().split('T')[0]}`;
        const includeSummary = document.getElementById('include-summary').checked;
        
        // Get selected columns
        const columnCheckboxes = form.querySelectorAll('input[name="export-columns"]:checked');
        const selectedColumns = Array.from(columnCheckboxes).map(cb => cb.value);
        
        // Get format
        const formatRadio = form.querySelector('input[name="export-format"]:checked');
        const format = formatRadio ? formatRadio.value : 'csv';
        
        // Close settings modal
        modal.classList.add('hidden');
        
        // Start export with settings
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
        
        switch(period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case 'all':
                startDate = null; // All time
                break;
        }
        
        const filename = `sales-${period}-${new Date().toISOString().split('T')[0]}`;
        
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
        const selectedCheckboxes = document.querySelectorAll('.sale-checkbox:checked');
        if (selectedCheckboxes.length === 0) return;
        
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
        const sales = window.FarmModules?.appData?.sales || [];
        const selectedSales = sales.filter(sale => selectedIds.includes(sale.id));
        
        if (selectedSales.length === 0) {
            alert('No sales selected for export');
            return;
        }
        
        this.exportSalesData({
            sales: selectedSales,
            filename: `selected-sales-${new Date().toISOString().split('T')[0]}`,
            format: this.exportFormat,
            includeSummary: false
        });
    },

    async exportSalesData(options = {}) {
        const {
            startDate = null,
            endDate = null,
            filename = `sales-report-${new Date().toISOString().split('T')[0]}`,
            format = 'csv',
            columns = ['date', 'product', 'customer', 'quantity', 'unitPrice', 'totalAmount', 'paymentStatus'],
            includeSummary = true,
            sales = null
        } = options;
        
        // Show progress modal
        this.showExportProgress();
        this.updateExportProgress(10, 'Filtering sales data...');
        
        // Get sales data
        let salesData = sales || window.FarmModules?.appData?.sales || [];
        
        // Filter by date range if specified
        if (startDate && endDate) {
            salesData = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });
        }
        
        this.updateExportProgress(30, `Processing ${salesData.length} sales records...`);
        
        // Prepare data based on selected columns
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
        
        const headers = columns.map(col => columnMap[col] || col);
        const rows = salesData.map(sale => {
            return columns.map(col => {
                switch(col) {
                    case 'date':
                        return this.formatDate(sale.date, 'export');
                    case 'unitPrice':
                    case 'totalAmount':
                        return sale[col] || 0;
                    case 'paymentStatus':
                        return sale[col] ? sale[col].charAt(0).toUpperCase() + sale[col].slice(1) : 'Paid';
                    default:
                        return sale[col] || '';
                }
            });
        });
        
        this.updateExportProgress(60, 'Generating export file...');
        
        // Generate file based on format
        let fileContent, mimeType, fileExtension;
        
        switch(format) {
            case 'csv':
                [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, includeSummary, salesData);
                break;
            case 'excel':
                [fileContent, mimeType, fileExtension] = await this.generateExcel(headers, rows, includeSummary, salesData, filename);
                break;
            case 'pdf':
                [fileContent, mimeType, fileExtension] = await this.generatePDF(headers, rows, includeSummary, salesData, filename);
                break;
            default:
                [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, includeSummary, salesData);
        }
        
        this.updateExportProgress(90, 'Finalizing export...');
        
        // Download file
        this.downloadFile(fileContent, `${filename}.${fileExtension}`, mimeType);
        
        // Update last export info
        this.updateLastExportInfo();
        
        this.updateExportProgress(100, 'Export completed successfully!');
        
        // Close progress modal after delay
        setTimeout(() => {
            this.hideExportProgress();
        }, 1500);
    },

    generateCSV(headers, rows, includeSummary, salesData) {
        let csvContent = headers.join(',') + '\n';
        
        // Add data rows
        rows.forEach(row => {
            csvContent += row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma or quotes
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',') + '\n';
        });
        
        // Add summary if requested
        if (includeSummary) {
            csvContent += '\n\nSUMMARY\n';
            csvContent += `Total Sales,${salesData.length}\n`;
            const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            csvContent += `Total Revenue,${this.formatCurrency(totalRevenue, false)}\n`;
            const avgSale = salesData.length > 0 ? totalRevenue / salesData.length : 0;
            csvContent += `Average Sale,${this.formatCurrency(avgSale, false)}\n`;
            
            // Payment summary
            const paidCount = salesData.filter(s => s.paymentStatus === 'paid').length;
            const pendingCount = salesData.filter(s => s.paymentStatus === 'pending').length;
            csvContent += `Paid Sales,${paidCount}\n`;
            csvContent += `Pending Sales,${pendingCount}\n`;
            
            // Date range
            if (salesData.length > 0) {
                const dates = salesData.map(s => new Date(s.date));
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                csvContent += `Date Range,${this.formatDate(minDate.toISOString().split('T')[0], 'export')} to ${this.formatDate(maxDate.toISOString().split('T')[0], 'export')}\n`;
            }
        }
        
        return [csvContent, 'text/csv;charset=utf-8;', 'csv'];
    },

    async generateExcel(headers, rows, includeSummary, salesData, filename) {
        // For now, we'll create a CSV that Excel can open
        // In a real implementation, you would use a library like SheetJS
        console.log('Excel export would use SheetJS library in production');
        return this.generateCSV(headers, rows, includeSummary, salesData);
    },

    async generatePDF(headers, rows, includeSummary, salesData, filename) {
        // For now, we'll create a basic HTML page that can be printed as PDF
        // In a real implementation, you would use a library like jsPDF or html2pdf
        console.log('PDF export would use jsPDF library in production');
        
        // Create HTML table
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
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
        
        if (includeSummary) {
            const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            const avgSale = salesData.length > 0 ? totalRevenue / salesData.length : 0;
            const paidCount = salesData.filter(s => s.paymentStatus === 'paid').length;
            const pendingCount = salesData.filter(s => s.paymentStatus === 'pending').length;
            
            htmlContent += `
                <div class="summary">
                    <h2>Summary</h2>
                    <p><strong>Total Sales:</strong> ${salesData.length}</p>
                    <p><strong>Total Revenue:</strong> ${this.formatCurrency(totalRevenue)}</p>
                    <p><strong>Average Sale:</strong> ${this.formatCurrency(avgSale)}</p>
                    <p><strong>Paid Sales:</strong> ${paidCount}</p>
                    <p><strong>Pending Sales:</strong> ${pendingCount}</p>
                </div>
            `;
        }
        
        htmlContent += `
                <div class="footer">
                    <p>Report generated by Farm Management System</p>
                </div>
            </body>
            </html>
        `;
        
        // For PDF, we'll open in new window for printing
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        return [htmlContent, 'text/html', 'html'];
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

    printSalesReport() {
        const salesData = window.FarmModules?.appData?.sales || [];
        const printWindow = window.open('', '_blank');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
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
                        ${salesData.map(sale => `
                            <tr>
                                <td>${this.formatDate(sale.date, 'export')}</td>
                                <td>${this.formatProductName(sale.product)}</td>
                                <td>${sale.customer || 'Walk-in'}</td>
                                <td>${sale.quantity} ${sale.unit || 'units'}</td>
                                <td>${this.formatCurrency(sale.unitPrice, false)}</td>
                                <td>${this.formatCurrency(sale.totalAmount, false)}</td>
                                <td>${sale.paymentStatus ? sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1) : 'Paid'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="summary">
                    <h2>Summary</h2>
                    <p><strong>Total Sales:</strong> ${salesData.length}</p>
                    <p><strong>Total Revenue:</strong> ${this.formatCurrency(salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0))}</p>
                    <p><strong>Average Sale:</strong> ${this.formatCurrency(salesData.length > 0 ? salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / salesData.length : 0)}</p>
                </div>
                
                <div class="footer">
                    <p>Report generated by Farm Management System</p>
                </div>
                
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

    toggleSelectAllSales(checked) {
        const checkboxes = document.querySelectorAll('.sale-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateSelectedCount();
    },

    updateSelectedCount() {
        const selectedCount = document.querySelectorAll('.sale-checkbox:checked').length;
        const exportSelectedBtn = document.getElementById('export-selected');
        const selectedCountSpan = document.getElementById('selected-count');
        
        if (selectedCountSpan) {
            selectedCountSpan.textContent = `${selectedCount} selected`;
        }
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedCount === 0;
        }
    },

    updateLastExportInfo() {
        const lastExportInfo = document.getElementById('last-export-info');
        if (lastExportInfo) {
            lastExportInfo.textContent = `Last export: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    },

    showExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        modal.classList.remove('hidden');
    },

    hideExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        modal.classList.add('hidden');
        // Reset progress
        this.updateExportProgress(0, '');
    },

    updateExportProgress(percent, message) {
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        const exportDetails = document.getElementById('export-details');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        if (exportDetails && percent === 100) {
            const salesCount = window.FarmModules?.appData?.sales?.length || 0;
            exportDetails.innerHTML = `
                <div class="export-success">
                    <span style="color: var(--status-paid); font-size: 24px;">✓</span>
                    <div>
                        <strong>Export successful!</strong>
                        <p>${salesCount} records exported</p>
                        <p>File saved to your downloads folder</p>
                    </div>
                </div>
            `;
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
            return dateStr;
        }
    },

    // ... (keep all other existing methods)

    // Update renderSalesTable to include checkboxes
    renderSalesTable(period = 'today') {
        const tbody = document.getElementById('sales-body');
        if (!tbody) return;

        const sales = window.FarmModules?.appData?.sales || [];
        let filteredSales = sales;

        if (period !== 'all') {
            const cutoffDate = new Date();
            if (period === 'today') cutoffDate.setDate(cutoffDate.getDate() - 1);
            else if (period === 'week') cutoffDate.setDate(cutoffDate.getDate() - 7);
            else if (period === 'month') cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            filteredSales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= cutoffDate;
            });
        }

        if (filteredSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">💰</span>
                            <h4>No sales found</h4>
                            <p>${period === 'all' ? 'Start recording your sales' : `No sales in the ${period}`}</p>
                        </div>
                    </td>
                </tr>
            `;
            this.updateElement('showing-count', 0);
            return;
        }

        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedSales.map(sale => {
            const paymentClass = `status-badge status-${sale.paymentStatus || 'paid'}`;
            const statusText = sale.paymentStatus === 'paid' ? 'Paid' : 
                              sale.paymentStatus === 'pending' ? 'Pending' : 'Cancelled';
            
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="sale-checkbox" value="${sale.id}" onchange="window.FarmModules.modules['sales-record'].updateSelectedCount()">
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
                    <td>${sale.quantity} <span class="text-muted">${sale.unit || 'units'}</span></td>
                    <td>${this.formatCurrency(sale.unitPrice)}</td>
                    <td><strong>${this.formatCurrency(sale.totalAmount)}</strong></td>
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

        this.updateElement('showing-count', filteredSales.length);
        this.updateSelectedCount();
    }
};

// ... (keep the rest of the module registration code)
