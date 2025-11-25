// modules/sales-record.js
FarmModules.registerModule('sales-record', {
    name: 'Sales Records',
    icon: '💰',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Sales Records</h1>
                <p>Track product sales and revenue</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-sale">
                        ➕ Record Sale
                    </button>
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
                    <div class="form-row compact">
                        <div class="form-group">
                            <select id="quick-product" required class="form-compact">
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
                            <input type="number" id="quick-quantity" placeholder="Qty" required class="form-compact" min="1">
                        </div>
                        <div class="form-group">
                            <select id="quick-unit" class="form-compact">
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                                <option value="units">units</option>
                                <option value="dozen">dozen</option>
                                <option value="case">case</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-price" placeholder="Price" step="0.01" required class="form-compact" min="0">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Record Sale</button>
                        </div>
                    </div>
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
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-date">Sale Date *</label>
                                    <input type="date" id="sale-date" required>
                                </div>
                                <div class="form-group">
                                    <label for="sale-customer">Customer Name</label>
                                    <input type="text" id="sale-customer" placeholder="Customer name (optional)">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-product">Product *</label>
                                    <select id="sale-product" required>
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
                                    <label for="sale-unit">Unit *</label>
                                    <select id="sale-unit" required>
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
                                    <label for="sale-quantity">Quantity *</label>
                                    <input type="number" id="sale-quantity" min="0.01" step="0.01" required placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="sale-price">Unit Price ($) *</label>
                                    <input type="number" id="sale-price" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sale-payment">Payment Method *</label>
                                    <select id="sale-payment" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="mobile">Mobile Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sale-status">Payment Status</label>
                                    <select id="sale-status">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial Payment</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="sale-notes">Notes (Optional)</label>
                                <textarea id="sale-notes" placeholder="Sale notes, customer details, etc." rows="3"></textarea>
                            </div>

                            <div class="sale-total">
                                <h4>Sale Total: <span id="sale-total-amount">$0.00</span></h4>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-sale" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-sale">Save Sale</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .sales-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
        }

        .summary-icon {
            font-size: 2rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }

        .summary-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .summary-period {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .quick-sale {
            margin: 1.5rem 0;
        }

        .quick-sale .form-row.compact {
            margin-bottom: 0;
        }

        .sales-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .filter-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .sale-total {
            background: var(--bg-color);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        }

        .sale-total h4 {
            margin: 0;
            color: var(--text-color);
        }

        #sale-total-amount {
            color: var(--success-color);
            font-weight: 700;
        }

        .payment-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
        }

        .payment-paid {
            background: var(--success-light);
            color: var(--success-color);
        }

        .payment-pending {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .payment-partial {
            background: var(--info-light);
            color: var(--info-dark);
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
        }
    `,

    initialize: function() {
        console.log('Sales Records module initializing...');
        this.loadSalesData();
        this.attachEventListeners();
        this.updateSummary();
        this.renderSalesTable();
    },

    loadSalesData: function() {
        if (!FarmModules.appData.sales) {
            FarmModules.appData.sales = [];
        }
    },

    updateSummary: function() {
        const sales = FarmModules.appData.sales || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Update today's date display
        document.getElementById('today-date').textContent = new Date().toLocaleDateString();

        // Calculate sales for different periods
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);

        const weekSales = this.getSalesForPeriod(sales, 7);
        const monthSales = this.getSalesForPeriod(sales, 30);

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
    },

    getSalesForPeriod: function(sales, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return sales
            .filter(sale => new Date(sale.date) >= cutoffDate)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
    },

    renderSalesTable: function(period = 'today') {
        const tbody = document.getElementById('sales-body');
        const sales = FarmModules.appData.sales || [];

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

        // Show most recent sales first
        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedSales.map(sale => {
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
        }).join('');
    },

    attachEventListeners: function() {
        // Quick sale form
        document.getElementById('quick-sale-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickSale();
        });

        // Modal buttons
        document.getElementById('add-sale').addEventListener('click', () => this.showSaleModal());
        document.getElementById('save-sale').addEventListener('click', () => this.saveSale());
        document.getElementById('delete-sale').addEventListener('click', () => this.deleteSale());

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Real-time total calculation
        document.getElementById('sale-quantity').addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('sale-price').addEventListener('input', () => this.calculateSaleTotal());

        // Filter
        document.getElementById('period-filter').addEventListener('change', (e) => {
            this.renderSalesTable(e.target.value);
        });

        // Export
        document.getElementById('export-sales').addEventListener('click', () => {
            this.exportSales();
        });

        // Sale actions
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

        // Modal backdrop
        document.getElementById('sale-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
    },

    handleQuickSale: function() {
        const product = document.getElementById('quick-product').value;
        const quantity = parseFloat(document.getElementById('quick-quantity').value);
        const unit = document.getElementById('quick-unit').value;
        const price = parseFloat(document.getElementById('quick-price').value);

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const saleData = {
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

    showSaleModal: function() {
        const modal = document.getElementById('sale-modal');
        const title = document.getElementById('sale-modal-title');
        const form = document.getElementById('sale-form');

        if (modal && title && form) {
            form.reset();
            document.getElementById('sale-id').value = '';
            document.getElementById('sale-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('delete-sale').style.display = 'none';
            document.getElementById('sale-total-amount').textContent = '$0.00';
            
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    calculateSaleTotal: function() {
        const quantity = parseFloat(document.getElementById('sale-quantity').value) || 0;
        const price = parseFloat(document.getElementById('sale-price').value) || 0;
        const total = quantity * price;
        
        document.getElementById('sale-total-amount').textContent = this.formatCurrency(total);
    },

    saveSale: function() {
        const form = document.getElementById('sale-form');
        if (!form) return;

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

        this.hideModal();
    },

    addSale: function(saleData) {
        if (!FarmModules.appData.sales) {
            FarmModules.appData.sales = [];
        }

        const newSale = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            ...saleData
        };

        FarmModules.appData.sales.push(newSale);
        
        this.updateSummary();
        this.renderSalesTable();
        
        this.showNotification('Sale recorded successfully!', 'success');
    },

    editSale: function(saleId) {
        const sales = FarmModules.appData.sales || [];
        const sale = sales.find(s => s.id === saleId);
        
        if (!sale) return;

        const modal = document.getElementById('sale-modal');
        const title = document.getElementById('sale-modal-title');

        if (modal && title) {
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
            
            this.calculateSaleTotal();
            
            title.textContent = 'Edit Sale';
            modal.classList.remove('hidden');
        }
    },

    updateSale: function(saleId, saleData) {
        const sales = FarmModules.appData.sales || [];
        const saleIndex = sales.findIndex(s => s.id === saleId);
        
        if (saleIndex !== -1) {
            sales[saleIndex] = {
                ...sales[saleIndex],
                ...saleData
            };
            
            this.updateSummary();
            this.renderSalesTable();
            this.showNotification('Sale updated successfully!', 'success');
        }
    },

    deleteSale: function() {
        const saleId = document.getElementById('sale-id').value;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideModal();
        }
    },

    deleteSaleRecord: function(saleId) {
        if (confirm('Are you sure you want to delete this sale?')) {
            FarmModules.appData.sales = FarmModules.appData.sales.filter(s => s.id !== saleId);
            
            this.updateSummary();
            this.renderSalesTable();
            this.showNotification('Sale deleted successfully', 'success');
        }
    },

    exportSales: function() {
        const sales = FarmModules.appData.sales || [];
        const csv = this.convertToCSV(sales);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Sales exported successfully!', 'success');
    },

    convertToCSV: function(sales) {
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

    formatProductName: function(product) {
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

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
