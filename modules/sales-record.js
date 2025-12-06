// modules/sales-record.js - UPDATED WITH MODAL MANAGER
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

           // Replace your sales modal HTML with this:
`
<!-- Sales Popout Modal - Consistent with Inventory -->
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
                            <!-- ... product options ... -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sale-unit">Unit *</label>
                        <select id="sale-unit" required>
                            <option value="kg">Kilograms (kg)</option>
                            <!-- ... unit options ... -->
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
                            <!-- ... payment options ... -->
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
        <div class="popout-modal-footer">
            <button type="button" class="btn btn-text" id="cancel-sale">Cancel</button>
            <button type="button" class="btn btn-danger" id="delete-sale" style="display: none;">Delete</button>
            <button type="button" class="btn btn-primary" id="save-sale">Save Sale</button>
        </div>
    </div>
</div>
`,

    styles: `
        .sales-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 1.75rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .summary-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .summary-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            opacity: 0.9;
            display: inline-block;
            padding: 0.75rem;
            background: var(--bg-color);
            border-radius: 12px;
        }

        .summary-content h3 {
            margin: 0 0 0.75rem 0;
            font-size: 0.95rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .summary-value {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-color);
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }

        .summary-period {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .quick-sale {
            margin: 2rem 0;
            border-radius: 16px;
            border: 2px dashed var(--border-color);
            background: var(--bg-color);
            transition: all 0.3s ease;
        }

        .quick-sale:hover {
            border-color: var(--primary-color);
            background: var(--card-bg);
        }

        .quick-sale h3 {
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quick-sale h3::before {
            content: '⚡';
            font-size: 1.2em;
        }

        .quick-sale .form-row.compact {
            margin-bottom: 0;
            gap: 1rem;
        }

        .quick-sale .form-group {
            flex: 1;
            min-width: 120px;
        }

        .quick-sale .btn-compact {
            white-space: nowrap;
            padding: 0.75rem 1.5rem;
        }

        .sales-records {
            margin: 2rem 0;
            border-radius: 16px;
            overflow: hidden;
        }

        .sales-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }

        .sales-records .card-header h3 {
            color: var(--text-color);
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .sales-records .card-header h3::before {
            content: '📋';
            font-size: 1.2em;
        }

        .filter-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .filter-controls select {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.5rem 1rem;
            color: var(--text-color);
            font-size: 0.9rem;
        }

        .sale-total {
            background: linear-gradient(135deg, var(--success-light), var(--bg-color));
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 1.5rem;
            text-align: center;
            border: 2px solid var(--success-color);
        }

        .sale-total h4 {
            margin: 0;
            color: var(--text-color);
            font-size: 1.2rem;
        }

        #sale-total-amount {
            color: var(--success-color);
            font-weight: 800;
            font-size: 1.5rem;
        }

        .payment-badge {
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: capitalize;
            letter-spacing: 0.5px;
        }

        .payment-paid {
            background: linear-gradient(135deg, var(--success-color), #10b981);
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .payment-pending {
            background: linear-gradient(135deg, var(--warning-color), #f59e0b);
            color: white;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .payment-partial {
            background: linear-gradient(135deg, var(--info-color), #3b82f6);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 4rem;
            opacity: 0.3;
            margin-bottom: 1.5rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 1rem 0;
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
            font-size: 1rem;
        }

        .sale-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }

        .btn-icon {
            background: none;
            border: none;
            padding: 0.5rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1.1rem;
        }

        .btn-icon:hover {
            background: var(--bg-color);
            transform: scale(1.1);
        }

        .edit-sale:hover {
            color: var(--primary-color);
        }

        .delete-sale:hover {
            color: var(--danger-color);
        }

        @media (max-width: 768px) {
            .sales-summary {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .summary-card {
                padding: 1.5rem;
            }
            
            .sales-records .card-header {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .filter-controls {
                justify-content: space-between;
            }
        }
    `,

    initialize: function() {
        console.log('💰 Sales Records module initializing...');
        this.loadSalesData();
        this.updateSummary();
        this.renderSalesTable();
        
        // Sync initial stats with dashboard
        this.syncStatsWithDashboard();
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Sales event listeners attached');
        }, 100);
    },

    loadSalesData: function() {
        if (!FarmModules.appData.sales) {
            FarmModules.appData.sales = [];
        }
        console.log('📊 Loaded sales data:', FarmModules.appData.sales.length, 'records');
    },

    updateSummary: function() {
        const sales = FarmModules.appData.sales || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Update today's date display
        const todayElement = document.getElementById('today-date');
        if (todayElement) {
            todayElement.textContent = new Date().toLocaleDateString();
        }

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

        // Calculate additional stats for dashboard sync
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        const paidSales = sales.filter(sale => sale.paymentStatus === 'paid').length;
        const pendingSales = sales.filter(sale => sale.paymentStatus === 'pending').length;

        // Store stats for sync
        this.currentStats = {
            totalSales,
            totalRevenue,
            todaySales,
            weekSales,
            monthSales,
            avgSaleValue,
            paidSales,
            pendingSales,
            topProduct,
            topProductRevenue: topRevenue
        };
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
        if (!tbody) {
            console.error('❌ Sales table body not found');
            return;
        }

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

        console.log('📋 Rendered sales table with', filteredSales.length, 'records');
    },

    attachEventListeners: function() {
        console.log('🔗 Attaching sales event listeners...');

        // Quick sale form
        const quickForm = document.getElementById('quick-sale-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
            console.log('✅ Quick sale form listener attached');
        }

        // Modal buttons - UPDATED TO USE MODALMANAGER
        const addSaleBtn = document.getElementById('add-sale');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => this.showSaleModal());
            console.log('✅ Add sale button listener attached');
        }

        const saveSaleBtn = document.getElementById('save-sale');
        if (saveSaleBtn) {
            saveSaleBtn.addEventListener('click', () => this.saveSale());
            console.log('✅ Save sale button listener attached');
        }

        const deleteSaleBtn = document.getElementById('delete-sale');
        if (deleteSaleBtn) {
            deleteSaleBtn.addEventListener('click', () => this.deleteSale());
            console.log('✅ Delete sale button listener attached');
        }

        // Real-time total calculation
        const quantityInput = document.getElementById('sale-quantity');
        const priceInput = document.getElementById('sale-price');
        
        if (quantityInput) {
            quantityInput.addEventListener('input', () => this.calculateSaleTotal());
        }
        if (priceInput) {
            priceInput.addEventListener('input', () => this.calculateSaleTotal());
        }

        // Filter
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.renderSalesTable(e.target.value);
            });
            console.log('✅ Period filter listener attached');
        }
// Update show/hide methods to match inventory pattern
showSaleModal() {
    const modal = document.getElementById('sale-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Also set inline styles for consistency
        modal.style.display = 'flex';
    }
},

hideSaleModal() {
    const modal = document.getElementById('sale-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
},

// Update close button handler
setupEventListeners() {
    // Close button
    document.getElementById('close-sale-modal')?.addEventListener('click', () => {
        this.hideSaleModal();
    });
    
    // Cancel button
    document.getElementById('cancel-sale')?.addEventListener('click', () => {
        this.hideSaleModal();
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('popout-modal')) {
            this.hideSaleModal();
        }
    });
},
        // Export
        const exportBtn = document.getElementById('export-sales');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSales();
            });
            console.log('✅ Export button listener attached');
        }

        // Sale actions (delegated event listeners)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-sale')) {
                const saleId = e.target.closest('.edit-sale').dataset.id;
                console.log('✏️ Edit sale clicked:', saleId);
                this.editSale(saleId);
            }
            if (e.target.closest('.delete-sale')) {
                const saleId = e.target.closest('.delete-sale').dataset.id;
                console.log('🗑️ Delete sale clicked:', saleId);
                this.deleteSaleRecord(saleId);
            }
        });

        console.log('✅ All sales event listeners attached successfully');
    },

    handleQuickSale: function() {
        console.log('🔄 Handling quick sale...');
        
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

    // UPDATED: Using ModalManager instead of custom modal handling
    showSaleModal: function(saleId = null) {
        console.log('📱 Showing sale modal with ModalManager...');
        
        // Reset form and prepare modal
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
        
        // Use ModalManager to open the modal
        ModalManager.open('sale-modal');
        console.log('✅ Sale modal shown with ModalManager');
    },

    calculateSaleTotal: function() {
        const quantity = parseFloat(document.getElementById('sale-quantity').value) || 0;
        const price = parseFloat(document.getElementById('sale-price').value) || 0;
        const total = quantity * price;
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    saveSale: function() {
        console.log('💾 Saving sale...');
        
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

        // UPDATED: Use ModalManager to close modal
        ModalManager.close('sale-modal');
    },

    addSale: function(saleData) {
        if (!FarmModules.appData.sales) {
            FarmModules.appData.sales = [];
        }

        FarmModules.appData.sales.push(saleData);
        
        this.updateSummary();
        this.renderSalesTable();
        
        // SYNC WITH DASHBOARD - Update sales stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'sale_recorded',
            sale: saleData
        });
        
        this.showNotification('Sale recorded successfully!', 'success');
        console.log('✅ Sale added:', saleData);
    },

    editSale: function(saleId) {
        console.log('✏️ Editing sale:', saleId);
        
        const sales = FarmModules.appData.sales || [];
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
        
        console.log('✅ Sale form populated for editing');
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
            
            // SYNC WITH DASHBOARD - Update sales stats
            this.syncStatsWithDashboard();
            
            // Add recent activity
            this.addRecentActivity({
                type: 'sale_updated',
                sale: sales[saleIndex]
            });
            
            this.showNotification('Sale updated successfully!', 'success');
            console.log('✅ Sale updated:', saleId);
        }
    },

    deleteSale: function() {
        const saleId = document.getElementById('sale-id').value;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            // UPDATED: Use ModalManager to close modal
            ModalManager.close('sale-modal');
        }
    },

    deleteSaleRecord: function(saleId) {
        if (confirm('Are you sure you want to delete this sale?')) {
            const sales = FarmModules.appData.sales || [];
            const sale = sales.find(s => s.id === saleId);
            
            FarmModules.appData.sales = sales.filter(s => s.id !== saleId);
            
            this.updateSummary();
            this.renderSalesTable();
            
            // SYNC WITH DASHBOARD - Update sales stats after deletion
            this.syncStatsWithDashboard();
            
            // Add recent activity
            if (sale) {
                this.addRecentActivity({
                    type: 'sale_deleted',
                    sale: sale
                });
            }
            
            this.showNotification('Sale deleted successfully', 'success');
            console.log('✅ Sale deleted:', saleId);
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
        console.log('✅ Sales exported');
    },

    // UPDATED METHOD: Sync sales stats with dashboard (no ProfileModule dependency)
    syncStatsWithDashboard: function() {
        const stats = this.currentStats;
        
        // Update shared data structure
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            // Update sales stats in shared data
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalSales: stats.totalSales,
                totalRevenue: stats.totalRevenue,
                todaySales: stats.todaySales,
                weeklySales: stats.weekSales,
                monthlySales: stats.monthSales,
                avgSaleValue: stats.avgSaleValue
            });
        }
        
        // Notify dashboard module if available
        if (window.FarmModules && window.FarmModules.modules.dashboard) {
            window.FarmModules.modules.dashboard.updateDashboardStats({
                totalSales: stats.totalSales,
                totalRevenue: stats.totalRevenue,
                todaySales: stats.todaySales,
                weeklySales: stats.weekSales,
                monthlySales: stats.monthSales,
                avgSaleValue: stats.avgSaleValue
            });
        }
    },

    // NEW METHOD: Add recent activity to dashboard
    addRecentActivity: function(activityData) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        switch (activityData.type) {
            case 'sale_recorded':
                activity = {
                    type: 'sale_recorded',
                    message: `Sale: ${this.formatProductName(activityData.sale.product)} - ${this.formatCurrency(activityData.sale.totalAmount)}`,
                    icon: '💰'
                };
                break;
            case 'sale_updated':
                activity = {
                    type: 'sale_updated',
                    message: `Updated sale: ${this.formatProductName(activityData.sale.product)}`,
                    icon: '✏️'
                };
                break;
            case 'sale_deleted':
                activity = {
                    type: 'sale_deleted',
                    message: `Deleted sale: ${this.formatProductName(activityData.sale.product)}`,
                    icon: '🗑️'
                };
                break;
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    // NEW METHOD: Get sales summary for other modules
    getSalesSummary: function() {
        const stats = this.currentStats;
        const sales = FarmModules.appData.sales || [];
        
        return {
            ...stats,
            recentSales: sales.slice(0, 10), // Last 10 sales
            topProducts: this.getTopProducts(5),
            salesTrend: this.getSalesTrend(30) // Last 30 days
        };
    },

    // NEW METHOD: Get top products by revenue
    getTopProducts: function(limit = 5) {
        const productSales = {};
        const sales = FarmModules.appData.sales || [];
        
        sales.forEach(sale => {
            if (!productSales[sale.product]) {
                productSales[sale.product] = {
                    revenue: 0,
                    quantity: 0,
                    salesCount: 0
                };
            }
            productSales[sale.product].revenue += sale.totalAmount;
            productSales[sale.product].quantity += sale.quantity;
            productSales[sale.product].salesCount += 1;
        });

        return Object.entries(productSales)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, limit)
            .map(([product, data]) => ({
                product: this.formatProductName(product),
                revenue: data.revenue,
                quantity: data.quantity,
                salesCount: data.salesCount
            }));
    },

    // NEW METHOD: Get sales trend data
    getSalesTrend: function(days = 30) {
        const sales = FarmModules.appData.sales || [];
        const trend = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dailySales = sales
                .filter(sale => sale.date === dateString)
                .reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            trend.push({
                date: dateString,
                revenue: dailySales,
                salesCount: sales.filter(sale => sale.date === dateString).length
            });
        }
        
        return trend;
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
        if (element) {
            element.textContent = value;
        } else {
            console.warn('❌ Element not found:', id);
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
});
