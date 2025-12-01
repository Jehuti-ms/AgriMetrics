const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentStats: {},

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
                        <button class="btn btn-outline btn-icon" id="export-sales-top">
                            <span class="btn-icon-text">📤</span>
                            <span>Export</span>
                        </button>
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
                            <h3 class="sidebar-title">Filters</h3>
                            <div class="filter-section">
                                <label for="period-filter">Time Period</label>
                                <select id="period-filter" class="filter-select">
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                            <div class="filter-section">
                                <label for="product-filter">Product</label>
                                <select id="product-filter" class="filter-select">
                                    <option value="all">All Products</option>
                                </select>
                            </div>
                            <div class="filter-section">
                                <label for="status-filter">Payment Status</label>
                                <select id="status-filter" class="filter-select">
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <button class="btn btn-outline btn-block" id="apply-filters">
                                <span class="btn-icon-text">🔍</span>
                                <span>Apply Filters</span>
                            </button>
                        </div>
                    </div>

                    <!-- Right Column - Sales Table -->
                    <div class="content-main">
                        <div class="main-card glass-card">
                            <div class="card-header">
                                <h3 class="card-title">Sales Records</h3>
                                <div class="card-actions">
                                    <button class="btn btn-text btn-icon" id="print-sales" title="Print">
                                        <span class="btn-icon-text">🖨️</span>
                                    </button>
                                    <button class="btn btn-text btn-icon" id="export-sales" title="Export">
                                        <span class="btn-icon-text">📤</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
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
                                            <td colspan="8" class="empty-state">
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
                                    <span>Showing <span id="showing-count">0</span> of <span id="total-count">0</span> sales</span>
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

                <!-- Sales Modal -->
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

    loadSalesData() {
        if (!window.FarmModules || !window.FarmModules.appData) {
            console.error('FarmModules or appData not found');
            window.FarmModules = window.FarmModules || {};
            window.FarmModules.appData = window.FarmModules.appData || {};
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        console.log('📊 Loaded sales data:', window.FarmModules.appData.sales.length, 'records');
    },

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
            topProduct,
            topProductRevenue: topRevenue
        };

        // Update table summary
        this.updateElement('showing-count', sales.length);
        this.updateElement('total-count', sales.length);
    },

    getSalesForPeriod(sales, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= cutoffDate;
        }).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    },

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
                    <td colspan="8" class="empty-state">
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
    },

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    },

    formatDate(dateStr, format = 'long') {
        try {
            const d = new Date(dateStr);
            if (format === 'short') {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        return product.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

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

        // Export buttons
        const exportBtns = ['export-sales-top', 'export-sales'];
        exportBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.exportSalesData();
                });
            }
        });

        // Filter controls
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.renderSalesTable(e.target.value);
            });
        }

        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyAdvancedFilters();
            });
        }

        // Modal controls
        const modalCloseBtns = document.querySelectorAll('.modal-close');
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
                window.print();
            });
        }

        // Pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('sale-modal');
            if (e.target === modal) {
                this.hideSaleModal();
            }
        });
    },

    showSaleModal(saleData = null) {
        const modal = document.getElementById('sale-modal');
        const modalTitle = document.getElementById('sale-modal-title');
        const deleteBtn = document.getElementById('delete-sale');
        const form = document.getElementById('sale-form');

        if (saleData) {
            // Edit mode
            modalTitle.textContent = 'Edit Sale';
            deleteBtn.style.display = 'inline-block';
            // Populate form with saleData
        } else {
            // Add mode
            modalTitle.textContent = 'Record Sale';
            deleteBtn.style.display = 'none';
            form.reset();
            // Set today's date as default
            const dateField = document.getElementById('sale-date');
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }

        modal.classList.remove('hidden');
    },

    hideSaleModal() {
        const modal = document.getElementById('sale-modal');
        modal.classList.add('hidden');
    },

    handleQuickSale() {
        console.log('Quick sale handler - implement this method');
        // Implement quick sale logic here
        alert('Quick sale functionality coming soon!');
    },

    handleSaveSale() {
        console.log('Save sale handler - implement this method');
        // Implement save sale logic here
        alert('Save sale functionality coming soon!');
        this.hideSaleModal();
    },

    exportSalesData() {
        console.log('Export sales triggered');
        // Implement export logic here
        alert('Export functionality coming soon!');
    },

    applyAdvancedFilters() {
        const period = document.getElementById('period-filter').value;
        const product = document.getElementById('product-filter').value;
        const status = document.getElementById('status-filter').value;
        
        console.log('Applying filters:', { period, product, status });
        this.renderSalesTable(period);
    },

    changePage(direction) {
        console.log('Change page:', direction);
        // Implement pagination logic
    },

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

        const statsUpdateEvent = new CustomEvent('salesStatsUpdated', {
            detail: this.currentStats
        });
        document.dispatchEvent(statsUpdateEvent);
    }
};

// Register the module
if (window.FarmModules) {
    if (typeof window.FarmModules.registerModule === 'function') {
        window.FarmModules.registerModule('sales-record', SalesRecordModule);
        console.log('✅ Sales Records module registered');
    } else {
        console.error('FarmModules.registerModule is not a function');
        window.FarmModules.registerModule = function(name, module) {
            window.FarmModules.modules = window.FarmModules.modules || {};
            window.FarmModules.modules[name] = module;
            console.log(`Module ${name} registered manually`);
        };
        window.FarmModules.registerModule('sales-record', SalesRecordModule);
    }
} else {
    console.error('FarmModules not found. Make sure framework.js is loaded first.');
    window.FarmModules = {
        modules: {},
        appData: {},
        registerModule: function(name, module) {
            this.modules[name] = module;
            console.log(`Module ${name} registered in fallback`);
        }
    };
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
}
