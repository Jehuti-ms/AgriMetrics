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
        return true;
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="sales-record" class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Track product sales and revenue</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-sale">➕ Record Sale</button>
                    </div>
                </div>

                <!-- Sales Summary -->
                <div class="sales-summary">
                    <div class="summary-card">
                        <div class="summary-icon">📈</div>
                        <div class="summary-content">
                            <h3>Today's Sales</h3>
                            <div class="summary-value" id="today-sales">$0</div>
                            <div class="summary-period" id="today-date">Today</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">📊</div>
                        <div class="summary-content">
                            <h3>This Week</h3>
                            <div class="summary-value" id="week-sales">$0</div>
                            <div class="summary-period">7 days</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">💰</div>
                        <div class="summary-content">
                            <h3>This Month</h3>
                            <div class="summary-value" id="month-sales">$0</div>
                            <div class="summary-period">30 days</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">🎯</div>
                        <div class="summary-content">
                            <h3>Top Product</h3>
                            <div class="summary-value" id="top-product">-</div>
                            <div class="summary-period" id="top-product-revenue">$0</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Sale Form -->
                <div class="quick-sale card">
                    <h3>Quick Sale</h3>
                    <form id="quick-sale-form" class="form-inline">
                        <!-- form fields here -->
                        <input type="text" placeholder="Product name" required>
                        <input type="number" placeholder="Quantity" required min="1">
                        <input type="number" placeholder="Price per unit" required step="0.01" min="0">
                        <button type="submit" class="btn btn-primary">Add Sale</button>
                    </form>
                </div>

                <!-- Sales Records -->
                <div class="sales-records card">
                    <div class="card-header">
                        <h3>Recent Sales</h3>
                        <div class="filter-controls">
                            <select id="period-filter">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                            <button class="btn btn-text" id="export-sales">Export</button>
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
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="sales-body">
                                <tr>
                                    <td colspan="8" class="empty-state">
                                        <div class="empty-content">
                                            <span class="empty-icon">💰</span>
                                            <h4>No sales recorded yet</h4>
                                            <p>Start recording your product sales</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Sales Modal -->
                <div id="sale-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="sale-modal-title">Record Sale</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="sale-form">
                                <div class="form-group">
                                    <label>Product</label>
                                    <input type="text" id="sale-product" required>
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" id="sale-quantity" required min="1">
                                </div>
                                <div class="form-group">
                                    <label>Unit Price</label>
                                    <input type="number" id="sale-unit-price" required step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Customer Name (Optional)</label>
                                    <input type="text" id="sale-customer">
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

        const todayElement = document.getElementById('today-date');
        if (todayElement) {
            todayElement.textContent = new Date().toLocaleDateString();
        }

        const todaySales = sales.filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        const weekSales = this.getSalesForPeriod(sales, 7);
        const monthSales = this.getSalesForPeriod(sales, 30);

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

        this.updateElement('today-sales', this.formatCurrency(todaySales));
        this.updateElement('week-sales', this.formatCurrency(weekSales));
        this.updateElement('month-sales', this.formatCurrency(monthSales));
        this.updateElement('top-product', topProduct);
        this.updateElement('top-product-revenue', this.formatCurrency(topRevenue));

        this.currentStats = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
            todaySales,
            weekSales,
            monthSales,
            avgSaleValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / sales.length : 0,
            paidSales: sales.filter(sale => sale.paymentStatus === 'paid').length,
            pendingSales: sales.filter(sale => sale.paymentStatus === 'pending').length,
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
            return;
        }

        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedSales.map(sale => {
            const paymentClass = `payment-badge payment-${sale.paymentStatus || 'paid'}`;
            return `
                <tr>
                    <td>${this.formatDate(sale.date)}</td>
                    <td>${this.formatProductName(sale.product)}</td>
                    <td>${sale.customer || 'Walk-in'}</td>
                    <td>${sale.quantity} ${sale.unit || 'units'}</td>
                    <td>${this.formatCurrency(sale.unitPrice)}</td>
                    <td><strong>${this.formatCurrency(sale.totalAmount)}</strong></td>
                    <td><span class="${paymentClass}">${sale.paymentStatus || 'paid'}</span></td>
                    <td class="sale-actions">
                        <button class="btn-icon edit-sale" data-id="${sale.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-sale" data-id="${sale.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    },

    formatDate(dateStr) {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString();
        } catch (e) {
            return dateStr;
        }
    },

    formatProductName(product) {
        if (!product) return 'Unknown';
        return product.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    attachEventListeners() {
        console.log('🔗 Attaching sales event listeners...');

        const quickForm = document.getElementById('quick-sale-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
        }

        const addSaleBtn = document.getElementById('add-sale');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => {
                document.getElementById('sale-modal').classList.remove('hidden');
            });
        }

        const exportBtn = document.getElementById('export-sales');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                console.log('📤 Export sales triggered');
                // implement export logic here
            });
        }

        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.renderSalesTable(e.target.value);
            });
        }

        // Modal close buttons
        const modalCloseBtns = document.querySelectorAll('.modal-close');
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('sale-modal').classList.add('hidden');
            });
        });

        // Save sale button
        const saveSaleBtn = document.getElementById('save-sale');
        if (saveSaleBtn) {
            saveSaleBtn.addEventListener('click', () => {
                this.handleSaveSale();
            });
        }
    },

    handleQuickSale() {
        console.log('Quick sale handler - implement this method');
        // Implement quick sale logic here
    },

    handleSaveSale() {
        console.log('Save sale handler - implement this method');
        // Implement save sale logic here
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
    // Make sure registerModule exists
    if (typeof window.FarmModules.registerModule === 'function') {
        window.FarmModules.registerModule('sales-record', SalesRecordModule);
        console.log('✅ Sales Records module registered');
    } else {
        console.error('FarmModules.registerModule is not a function');
        // Create it if it doesn't exist
        window.FarmModules.registerModule = function(name, module) {
            window.FarmModules.modules = window.FarmModules.modules || {};
            window.FarmModules.modules[name] = module;
            console.log(`Module ${name} registered manually`);
        };
        window.FarmModules.registerModule('sales-record', SalesRecordModule);
    }
} else {
    console.error('FarmModules not found. Make sure framework.js is loaded first.');
    // Create a global object if FarmModules doesn't exist
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
