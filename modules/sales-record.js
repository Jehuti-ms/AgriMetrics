// modules/sales-record.js - FIXED VERSION WITH POPOUT MODAL
console.log('💰 Loading Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,

    initialize() {
        console.log('💰 Initializing Sales Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            this.registerWithStyleManager();
        }
        
        this.loadSalesData();
        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Sales Records initialized');
        return true;
    },

    registerWithStyleManager() {
        if (window.StyleManager && window.StyleManager.registerModule) {
            window.StyleManager.registerModule(this.name, this.element, {
                onThemeChange: (theme) => this.onThemeChange(theme),
                onStyleUpdate: () => this.ensureFormStyles()
            });
        }
    },

    onThemeChange(theme) {
        console.log(`Sales module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    ensureFormStyles() {
        const formInputs = this.element?.querySelectorAll('input, select, textarea');
        formInputs?.forEach(input => {
            if (!input.classList.contains('form-input') && !input.classList.contains('form-compact')) {
                if (input.type !== 'checkbox' && input.type !== 'radio') {
                    input.classList.add('form-input');
                }
            }
        });
    },

    loadSalesData() {
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        console.log('📊 Loaded sales data:', window.FarmModules.appData.sales.length, 'records');
    },

    renderModule() {
        if (!this.element) return;

        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        
        // Calculate statistics
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const weekSales = this.getSalesForPeriod(7);
        const monthSales = this.getSalesForPeriod(30);
        
        // Find top product
        const productSales = {};
        sales.forEach(sale => {
            if (!productSales[sale.product]) {
                productSales[sale.product] = 0;
            }
            productSales[sale.product] += sale.totalAmount;
        });

        let topProduct = '-';
        let topRevenue = 0;
        Object.entries(productSales).forEach(([product, revenue]) => {
            if (revenue > topRevenue) {
                topProduct = this.formatProductName(product);
                topRevenue = revenue;
            }
        });

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Track product sales and revenue</p>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-sale">
                            ➕ Record Sale
                        </button>
                    </div>
                </div>

                <!-- Sales Summary -->
                <div class="stats-overview">
                    <div class="stat-card glass-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <h3>Today's Sales</h3>
                            <div class="stat-value" id="today-sales">${this.formatCurrency(todaySales)}</div>
                            <div class="stat-period" id="today-date">${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="stat-card glass-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <h3>This Week</h3>
                            <div class="stat-value" id="week-sales">${this.formatCurrency(weekSales)}</div>
                            <div class="stat-period">7 days</div>
                        </div>
                    </div>
                    <div class="stat-card glass-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <h3>This Month</h3>
                            <div class="stat-value" id="month-sales">${this.formatCurrency(monthSales)}</div>
                            <div class="stat-period">30 days</div>
                        </div>
                    </div>
                    <div class="stat-card glass-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <h3>Top Product</h3>
                            <div class="stat-value" id="top-product">${topProduct}</div>
                            <div class="stat-period" id="top-product-revenue">${this.formatCurrency(topRevenue)}</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Sale Form -->
                <div class="glass-card quick-sale">
                    <h3> Quick Sale</h3>
                    <form id="quick-sale-form">
                        <div class="form-row compact">
                            <div class="form-group">
                                <select id="quick-product" required class="form-input form-compact">
                                    <option value="">Select Product</option>
                                    <optgroup label="Livestock">
                                        <option value="broilers-live">Broilers (Live)</option>
                                        <option value="broilers-dressed">Broilers (Dressed)</option>
                                        <option value="eggs">Eggs</option>
                                        <option value="pork">Pork</option>
                                        <option value="beef">Beef</option>
                                    </optgroup>
                                    <optgroup label="Produce">
                                        <option value="tomatoes">Tomatoes</option>
                                        <option value="peppers">Peppers</option>
                                        <option value="cucumbers">Cucumbers</option>
                                        <option value="lettuce">Lettuce</option>
                                        <option value="carrots">Carrots</option>
                                        <option value="potatoes">Potatoes</option>
                                    </optgroup>
                                    <optgroup label="Other">
                                        <option value="honey">Honey</option>
                                        <option value="milk">Milk</option>
                                        <option value="cheese">Cheese</option>
                                        <option value="other">Other</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="number" id="quick-quantity" placeholder="Qty" required class="form-input form-compact" min="1">
                            </div>
                            <div class="form-group">
                                <select id="quick-unit" class="form-input form-compact">
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="units">units</option>
                                    <option value="dozen">dozen</option>
                                    <option value="case">case</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="number" id="quick-price" placeholder="Price" step="0.01" required class="form-input form-compact" min="0">
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-primary btn-compact">Record Sale</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Sales Records Table -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3>📋 Recent Sales</h3>
                        <div class="filter-controls">
                            <select id="period-filter" class="form-input form-compact">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                            <button class="btn-outline" id="export-sales">Export</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <div id="sales-table">
                            ${this.renderSalesTable('today')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sales Popout Modal -->
            <div id="sale-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="sale-modal-title">Record Sale</h3>
                        <button class="popout-modal-close" id="close-sale-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id" value="">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-date" class="form-label">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-customer" class="form-label">Customer Name</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-product" class="form-label">Product *</label>
                                    <select id="sale-product" class="form-input" required>
                                        <option value="">Select Product</option>
                                        <optgroup label="Livestock">
                                            <option value="broilers-live">Broilers (Live)</option>
                                            <option value="broilers-dressed">Broilers (Dressed)</option>
                                            <option value="eggs">Eggs</option>
                                            <option value="pork">Pork</option>
                                            <option value="beef">Beef</option>
                                            <option value="chicken-parts">Chicken Parts</option>
                                        </optgroup>
                                        <optgroup label="Produce">
                                            <option value="tomatoes">Tomatoes</option>
                                            <option value="peppers">Peppers</option>
                                            <option value="cucumbers">Cucumbers</option>
                                            <option value="lettuce">Lettuce</option>
                                            <option value="carrots">Carrots</option>
                                            <option value="potatoes">Potatoes</option>
                                            <option value="onions">Onions</option>
                                            <option value="cabbage">Cabbage</option>
                                        </optgroup>
                                        <optgroup label="Dairy">
                                            <option value="milk">Milk</option>
                                            <option value="cheese">Cheese</option>
                                            <option value="yogurt">Yogurt</option>
                                            <option value="butter">Butter</option>
                                        </optgroup>
                                        <optgroup label="Other">
                                            <option value="honey">Honey</option>
                                            <option value="jam">Jam/Preserves</option>
                                            <option value="bread">Bread</option>
                                            <option value="other">Other</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-unit" class="form-label">Unit *</label>
                                    <select id="sale-unit" class="form-input" required>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="units">Units</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="case">Case</option>
                                        <option value="crate">Crate</option>
                                        <option value="bag">Bag</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="jar">Jar</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-quantity" class="form-label">Quantity *</label>
                                    <input type="number" id="sale-quantity" class="form-input" min="0.01" step="0.01" required placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="sale-price" class="form-label">Unit Price ($) *</label>
                                    <input type="number" id="sale-price" class="form-input" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-payment" class="form-label">Payment Method *</label>
                                    <select id="sale-payment" class="form-input" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="mobile">Mobile Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-status" class="form-label">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial Payment</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="sale-notes" class="form-label">Notes (Optional)</label>
                                <textarea id="sale-notes" class="form-input" placeholder="Sale notes, customer details, etc." rows="3"></textarea>
                            </div>

                            <div class="sale-total">
                                <h4>Sale Total: <span id="sale-total-amount">$0.00</span></h4>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-sale">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-sale" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-sale">Save Sale</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.ensureFormStyles();
    },

    renderSalesTable(period = 'today') {
        const sales = window.FarmModules.appData.sales || [];
        
        let filteredSales = sales;
        if (period !== 'all') {
            const cutoffDate = new Date();
            if (period === 'today') {
                cutoffDate.setDate(cutoffDate.getDate() - 1);
            } else if (period === 'week') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (period === 'month') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            }
            filteredSales = sales.filter(sale => new Date(sale.date) >= cutoffDate);
        }

        if (filteredSales.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-content">
                        <div class="empty-icon">💰</div>
                        <h4>No sales recorded yet</h4>
                        <p>Start recording your product sales</p>
                    </div>
                </div>
            `;
        }

        // Show most recent sales first
        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
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
                <tbody>
                    ${sortedSales.map(sale => {
                        const paymentClass = `payment-badge payment-${sale.paymentStatus || 'paid'}`;
                        
                        return `
                            <tr>
                                <td>${this.formatDate(sale.date)}</td>
                                <td>${this.formatProductName(sale.product)}</td>
                                <td>${sale.customer || 'Walk-in'}</td>
                                <td>${sale.quantity} ${sale.unit}</td>
                                <td>${this.formatCurrency(sale.unitPrice)}</td>
                                <td><strong>${this.formatCurrency(sale.totalAmount)}</strong></td>
                                <td><span class="${paymentClass}">${sale.paymentStatus || 'paid'}</span></td>
                                <td class="sale-actions">
                                    <button class="btn-icon edit-sale" data-id="${sale.id}" title="Edit">✏️</button>
                                    <button class="btn-icon delete-sale" data-id="${sale.id}" title="Delete">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    setupEventListeners() {
        // Quick sale form
        document.getElementById('quick-sale-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickSale();
        });

        // Modal buttons
        document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('save-sale')?.addEventListener('click', () => this.saveSale());
        document.getElementById('delete-sale')?.addEventListener('click', () => this.deleteSale());
        document.getElementById('cancel-sale')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('close-sale-modal')?.addEventListener('click', () => this.hideSaleModal());

        // Real-time total calculation
        document.getElementById('sale-quantity')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('sale-price')?.addEventListener('input', () => this.calculateSaleTotal());

        // Filter
        document.getElementById('period-filter')?.addEventListener('change', (e) => {
            document.getElementById('sales-table').innerHTML = this.renderSalesTable(e.target.value);
        });

        // Export
        document.getElementById('export-sales')?.addEventListener('click', () => this.exportSales());

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideSaleModal();
            }
        });

        // Edit/delete sale buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-sale')) {
                const saleId = e.target.closest('.edit-sale').dataset.id;
                this.editSale(saleId);
            }
            if (e.target.closest('.delete-sale')) {
                const saleId = e.target.closest('.delete-sale').dataset.id;
                this.deleteSaleRecord(saleId);
            }
        });
    },

    handleQuickSale() {
        const product = document.getElementById('quick-product').value;
        const quantity = parseFloat(document.getElementById('quick-quantity').value);
        const unit = document.getElementById('quick-unit').value;
        const price = parseFloat(document.getElementById('quick-price').value);

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            quantity: quantity,
            unit: unit,
            unitPrice: price,
            totalAmount: quantity * price,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            customer: 'Walk-in'
        };

        this.addSale(saleData);
        
        // Reset form
        document.getElementById('quick-sale-form').reset();
        this.showNotification('Sale recorded successfully!', 'success');
    },

    showSaleModal(saleId = null) {
        // Reset form
        const form = document.getElementById('sale-form');
        if (form) {
            form.reset();
            document.getElementById('sale-id').value = '';
            document.getElementById('sale-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('delete-sale').style.display = 'none';
            document.getElementById('sale-total-amount').textContent = '$0.00';
            document.getElementById('sale-modal-title').textContent = 'Record Sale';
            
            // If editing existing sale, populate the form
            if (saleId) {
                this.editSale(saleId);
            }
        }
        
        // Show modal
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideSaleModal() {
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    calculateSaleTotal() {
        const quantity = parseFloat(document.getElementById('sale-quantity').value) || 0;
        const price = parseFloat(document.getElementById('sale-price').value) || 0;
        const total = quantity * price;
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    saveSale() {
        const form = document.getElementById('sale-form');
        if (!form) {
            console.error('❌ Sale form not found');
            return;
        }

        const saleId = document.getElementById('sale-id').value;
        const date = document.getElementById('sale-date').value;
        const customer = document.getElementById('sale-customer').value;
        const product = document.getElementById('sale-product').value;
        const unit = document.getElementById('sale-unit').value;
        const quantity = parseFloat(document.getElementById('sale-quantity').value);
        const unitPrice = parseFloat(document.getElementById('sale-price').value);
        const paymentMethod = document.getElementById('sale-payment').value;
        const paymentStatus = document.getElementById('sale-status').value;
        const notes = document.getElementById('sale-notes').value;

        if (!date || !product || !quantity || !unitPrice || !paymentMethod) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        if (unitPrice < 0) {
            this.showNotification('Price cannot be negative', 'error');
            return;
        }

        const saleData = {
            id: saleId || 'SALE-' + Date.now().toString().slice(-6),
            date: date,
            customer: customer || 'Walk-in',
            product: product,
            unit: unit,
            quantity: quantity,
            unitPrice: unitPrice,
            totalAmount: quantity * unitPrice,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            notes: notes
        };

        if (saleId) {
            this.updateSale(saleId, saleData);
        } else {
            this.addSale(saleData);
        }

        this.hideSaleModal();
    },

    addSale(saleData) {
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }

        window.FarmModules.appData.sales.push(saleData);
        this.saveToLocalStorage();
        this.updateSummary();
        this.updateSalesTable();
        this.showNotification('Sale recorded successfully!', 'success');
    },

    editSale(saleId) {
        const sales = window.FarmModules.appData.sales || [];
        const sale = sales.find(s => s.id === saleId);
        
        if (!sale) {
            console.error('❌ Sale not found:', saleId);
            return;
        }

        // Populate form fields
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-quantity').value = sale.quantity;
        document.getElementById('sale-price').value = sale.unitPrice;
        document.getElementById('sale-payment').value = sale.paymentMethod;
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        document.getElementById('delete-sale').style.display = 'block';
        document.getElementById('sale-modal-title').textContent = 'Edit Sale';
        
        this.calculateSaleTotal();
        this.showSaleModal();
    },

    updateSale(saleId, saleData) {
        const sales = window.FarmModules.appData.sales || [];
        const saleIndex = sales.findIndex(s => s.id === saleId);
        
        if (saleIndex !== -1) {
            window.FarmModules.appData.sales[saleIndex] = {
                ...sales[saleIndex],
                ...saleData
            };
            
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateSalesTable();
            this.showNotification('Sale updated successfully!', 'success');
        }
    },

    deleteSale() {
        const saleId = document.getElementById('sale-id').value;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideSaleModal();
        }
    },

    deleteSaleRecord(saleId) {
        if (confirm('Are you sure you want to delete this sale?')) {
            window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
            
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateSalesTable();
            this.showNotification('Sale deleted successfully', 'success');
        }
    },

    exportSales() {
        const sales = window.FarmModules.appData.sales || [];
        const csv = this.convertToCSV(sales);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Sales exported successfully!', 'success');
    },

    getSalesForPeriod(days) {
        const sales = window.FarmModules.appData.sales || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return sales
            .filter(sale => new Date(sale.date) >= cutoffDate)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
    },

    updateSummary() {
        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const weekSales = this.getSalesForPeriod(7);
        const monthSales = this.getSalesForPeriod(30);
        
        // Find top product
        const productSales = {};
        sales.forEach(sale => {
            if (!productSales[sale.product]) {
                productSales[sale.product] = 0;
            }
            productSales[sale.product] += sale.totalAmount;
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
        this.updateElement('today-date', new Date().toLocaleDateString());
    },

    updateSalesTable() {
        const periodFilter = document.getElementById('period-filter');
        const period = periodFilter ? periodFilter.value : 'today';
        document.getElementById('sales-table').innerHTML = this.renderSalesTable(period);
    },

    convertToCSV(sales) {
        const headers = ['Date', 'Product', 'Customer', 'Quantity', 'Unit', 'Unit Price', 'Total', 'Payment Method', 'Payment Status'];
        const rows = sales.map(sale => [
            sale.date,
            this.formatProductName(sale.product),
            sale.customer,
            sale.quantity,
            sale.unit,
            this.formatCurrency(sale.unitPrice),
            this.formatCurrency(sale.totalAmount),
            sale.paymentMethod,
            sale.paymentStatus || 'paid'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    saveToLocalStorage() {
        try {
            localStorage.setItem('farm-sales', JSON.stringify(window.FarmModules.appData.sales));
            console.log('✅ Sales data saved to local storage');
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    },

    // Utility methods
    formatProductName(product) {
        const productNames = {
            'broilers-live': 'Broilers (Live)',
            'broilers-dressed': 'Broilers (Dressed)',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'onions': 'Onions',
            'cabbage': 'Cabbage',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'yogurt': 'Yogurt',
            'butter': 'Butter',
            'honey': 'Honey',
            'jam': 'Jam/Preserves',
            'bread': 'Bread',
            'other': 'Other'
        };
        return productNames[product] || product;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else if (type === 'warning') {
            console.warn('⚠️ ' + message);
            alert('⚠️ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
}

console.log('✅ Sales Records module registered with all fixes');
