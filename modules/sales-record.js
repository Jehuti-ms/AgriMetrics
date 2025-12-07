// modules/sales-record.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('💰 Loading Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,

    initialize() {
        console.log('💰 Initializing Sales Records...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }
        
        this.loadSalesData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Sales Records initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler
    onThemeChange(theme) {
        console.log(`Sales module updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
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
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="today-sales">${this.formatCurrency(todaySales)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);" id="today-date">${new Date().toLocaleDateString()}</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="week-sales">${this.formatCurrency(weekSales)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">7 days</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="month-sales">${this.formatCurrency(monthSales)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">30 days</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="top-product">${topProduct}</div>
                        <div style="font-size: 14px; color: var(--text-secondary;" id="top-product-revenue">${this.formatCurrency(topRevenue)}</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-sale-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new sale record</span>
                    </button>
                    <button class="quick-action-btn" id="daily-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Daily Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Today's sales summary</span>
                    </button>
                    <button class="quick-action-btn" id="top-products-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Top Products</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Best selling items</span>
                    </button>
                    <button class="quick-action-btn" id="export-sales-btn">
                        <div style="font-size: 32px;">💾</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export sales records</span>
                    </button>
                </div>

                <!-- Quick Sale Form -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">⚡ Quick Sale</h3>
                    <form id="quick-sale-form">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                            <div>
                                <label class="form-label">Product *</label>
                                <select id="quick-product" required class="form-input">
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
                            <div>
                                <label class="form-label">Qty *</label>
                                <input type="number" id="quick-quantity" placeholder="0" required class="form-input" min="1">
                            </div>
                            <div>
                                <label class="form-label">Unit</label>
                                <select id="quick-unit" class="form-input">
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="units">units</option>
                                    <option value="dozen">dozen</option>
                                    <option value="case">case</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Price *</label>
                                <input type="number" id="quick-price" placeholder="0.00" step="0.01" required class="form-input" min="0">
                            </div>
                            <div>
                                <button type="submit" class="btn-primary" style="height: 42px;">Record Sale</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Sales Records Table -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📋 Recent Sales</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="period-filter" class="form-input" style="width: auto;">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                    <div id="sales-table">
                        ${this.renderSalesTable('today')}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS - Added at the end to overlay content -->
            <!-- Sales Record Modal -->
            <div id="sale-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="sale-modal-title">Record Sale</h3>
                        <button class="popout-modal-close" id="close-sale-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id" value="">
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Customer Name</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Product *</label>
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
                                <div>
                                    <label class="form-label">Unit *</label>
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

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity *</label>
                                    <input type="number" id="sale-quantity" class="form-input" min="0.01" step="0.01" required placeholder="0.00">
                                </div>
                                <div>
                                    <label class="form-label">Unit Price ($) *</label>
                                    <input type="number" id="sale-price" class="form-input" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Payment Method *</label>
                                    <select id="sale-payment" class="form-input" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="mobile">Mobile Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial Payment</option>
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Notes (Optional)</label>
                                <textarea id="sale-notes" class="form-input" placeholder="Sale notes, customer details, etc." rows="3"></textarea>
                            </div>

                            <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 16px;">
                                <h4 style="color: var(--text-primary); margin: 0; text-align: center;">
                                    Sale Total: <span id="sale-total-amount" style="color: var(--primary-color);">$0.00</span>
                                </h4>
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

            <!-- Daily Report Modal -->
            <div id="daily-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="daily-report-title">Daily Sales Report</h3>
                        <button class="popout-modal-close" id="close-daily-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="daily-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-daily-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-daily-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Top Products Modal -->
            <div id="top-products-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="top-products-title">Top Products Report</h3>
                        <button class="popout-modal-close" id="close-top-products">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="top-products-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-top-products">🖨️ Print</button>
                        <button class="btn-primary" id="close-top-products-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
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
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No sales recorded</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first sale to get started</div>
                </div>
            `;
        }

        // Show most recent sales first
        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Product</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Customer</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Quantity</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Unit Price</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Total</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Payment</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedSales.map(sale => {
                            const paymentClass = sale.paymentStatus === 'paid' ? 'paid' : 
                                                sale.paymentStatus === 'pending' ? 'pending' : 'partial';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(sale.date)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 500;">${this.formatProductName(sale.product)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary);">${sale.customer || 'Walk-in'}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${sale.quantity} ${sale.unit}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatCurrency(sale.unitPrice)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                    <td style="padding: 12px 8px;">
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                            background: ${paymentClass === 'paid' ? '#d1fae5' : 
                                                       paymentClass === 'pending' ? '#fef3c7' : '#fef2f2'}; 
                                            color: ${paymentClass === 'paid' ? '#065f46' : 
                                                    paymentClass === 'pending' ? '#92400e' : '#991b1b'};">
                                            ${sale.paymentStatus || 'paid'}
                                        </span>
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-sale" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-sale" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
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
        document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('daily-report-btn')?.addEventListener('click', () => this.generateDailyReport());
        document.getElementById('top-products-btn')?.addEventListener('click', () => this.generateTopProductsReport());
        document.getElementById('export-sales-btn')?.addEventListener('click', () => this.exportSales());
        
        // Sale modal handlers
        document.getElementById('save-sale')?.addEventListener('click', () => this.saveSale());
        document.getElementById('delete-sale')?.addEventListener('click', () => this.deleteSale());
        document.getElementById('cancel-sale')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('close-sale-modal')?.addEventListener('click', () => this.hideSaleModal());
        
        // Report modal handlers
        document.getElementById('close-daily-report')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('close-daily-report-btn')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('print-daily-report')?.addEventListener('click', () => this.printDailyReport());
        
        document.getElementById('close-top-products')?.addEventListener('click', () => this.hideTopProductsModal());
        document.getElementById('close-top-products-btn')?.addEventListener('click', () => this.hideTopProductsModal());
        document.getElementById('print-top-products')?.addEventListener('click', () => this.printTopProductsReport());
        
        // Real-time total calculation
        document.getElementById('sale-quantity')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('sale-price')?.addEventListener('input', () => this.calculateSaleTotal());

        // Filter
        document.getElementById('period-filter')?.addEventListener('change', (e) => {
            document.getElementById('sales-table').innerHTML = this.renderSalesTable(e.target.value);
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
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

    // MODAL CONTROL METHODS
    showSaleModal() {
        this.hideAllModals();
        document.getElementById('sale-modal').classList.remove('hidden');
    },

    hideSaleModal() {
        document.getElementById('sale-modal').classList.add('hidden');
    },

    showDailyReportModal() {
        this.hideAllModals();
        document.getElementById('daily-report-modal').classList.remove('hidden');
    },

    hideDailyReportModal() {
        document.getElementById('daily-report-modal').classList.add('hidden');
    },

    showTopProductsModal() {
        this.hideAllModals();
        document.getElementById('top-products-modal').classList.remove('hidden');
    },

    hideTopProductsModal() {
        document.getElementById('top-products-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideSaleModal();
        this.hideDailyReportModal();
        this.hideTopProductsModal();
    },

    // REPORT METHODS
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        const todaySales = sales.filter(sale => sale.date === today);
        
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 Daily Sales Report</h4>';
        
        if (todaySales.length === 0) {
            report += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h5 style="color: #374151; margin-bottom: 8px;">No sales today</h5>
                <p style="color: var(--text-secondary);">No sales recorded for ${today}</p>
            </div>`;
        } else {
            // Summary
            report += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 TODAY\'S SUMMARY:</h5>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Sales</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${todaySales.length}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Items Sold</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalItems}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Average Sale</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(todaySales.length > 0 ? totalRevenue / todaySales.length : 0)}</div>
                    </div>
                </div>
            </div>`;
            
            // Sales breakdown
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">🧾 SALES BREAKDOWN:</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            todaySales.forEach(sale => {
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(sale.product)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Customer: ${sale.customer || 'Walk-in'} • ${sale.paymentMethod}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(sale.totalAmount)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${sale.quantity} ${sale.unit} @ ${this.formatCurrency(sale.unitPrice)}</div>
                        </div>
                    </div>
                </div>`;
            });
            report += '</div></div>';
            
            // Payment methods
            const paymentMethods = {};
            todaySales.forEach(sale => {
                if (!paymentMethods[sale.paymentMethod]) {
                    paymentMethods[sale.paymentMethod] = 0;
                }
                paymentMethods[sale.paymentMethod] += sale.totalAmount;
            });
            
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">💳 PAYMENT METHODS:</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            Object.entries(paymentMethods).forEach(([method, amount]) => {
                const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: var(--text-primary);">${method.toUpperCase()}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(amount)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex-grow: 1; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: var(--primary-color); border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 12px; color: var(--text-secondary);">${percentage}%</span>
                    </div>
                </div>`;
            });
            report += '</div></div>';
        }
        
        report += '</div>';

        document.getElementById('daily-report-content').innerHTML = report;
        document.getElementById('daily-report-title').textContent = `Daily Report - ${today}`;
        this.showDailyReportModal();
    },

    generateTopProductsReport() {
        const sales = window.FarmModules.appData.sales || [];
        const productStats = {};
        
        // Calculate product statistics
        sales.forEach(sale => {
            const productName = this.formatProductName(sale.product);
            if (!productStats[productName]) {
                productStats[productName] = {
                    revenue: 0,
                    quantity: 0,
                    salesCount: 0
                };
            }
            productStats[productName].revenue += sale.totalAmount;
            productStats[productName].quantity += sale.quantity;
            productStats[productName].salesCount += 1;
        });
        
        // Sort by revenue
        const sortedProducts = Object.entries(productStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 10); // Top 10 products
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">🏆 Top Products Report</h4>';
        
        if (sortedProducts.length === 0) {
            report += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <h5 style="color: #374151; margin-bottom: 8px;">No sales data</h5>
                <p style="color: var(--text-secondary);">Record some sales to see product performance</p>
            </div>`;
        } else {
            // Top products table
            report += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 TOP PERFORMING PRODUCTS:</h5>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Rank</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Product</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Revenue</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Quantity Sold</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Sales Count</th>
                            </tr>
                        </thead>
                        <tbody>`;
            
            sortedProducts.forEach(([productName, stats], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '.';
                report += `
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 12px 8px; font-weight: bold; color: var(--text-primary);">${medal}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 500;">${productName}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(stats.revenue)}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary);">${stats.quantity.toFixed(2)}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary);">${stats.salesCount}</td>
                    </tr>
                `;
            });
            
            report += `</tbody>
                    </table>
                </div>
            </div>`;
            
            // Chart visualization
            const top5 = sortedProducts.slice(0, 5);
            const maxRevenue = top5.length > 0 ? Math.max(...top5.map(([, stats]) => stats.revenue)) : 0;
            
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📊 REVENUE DISTRIBUTION (Top 5):</h5>
                <div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            top5.forEach(([productName, stats]) => {
                const percentage = maxRevenue > 0 ? Math.round((stats.revenue / maxRevenue) * 100) : 0;
                report += `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${productName}</span>
                            <span style="color: var(--text-secondary); font-size: 14px;">${this.formatCurrency(stats.revenue)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex-grow: 1; height: 12px; background: var(--glass-border); border-radius: 6px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: var(--primary-color); border-radius: 6px;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            report += `</div>
            </div>`;
            
            // Summary
            const totalRevenueAll = Object.values(productStats).reduce((sum, stats) => sum + stats.revenue, 0);
            const totalQuantityAll = Object.values(productStats).reduce((sum, stats) => sum + stats.quantity, 0);
            const totalSalesCountAll = Object.values(productStats).reduce((sum, stats) => sum + stats.salesCount, 0);
            const topProductRevenue = sortedProducts.length > 0 ? sortedProducts[0][1].revenue : 0;
            const topProductPercentage = totalRevenueAll > 0 ? Math.round((topProductRevenue / totalRevenueAll) * 100) : 0;
            
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📋 PERFORMANCE SUMMARY:</h5>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Products</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${Object.keys(productStats).length}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenueAll)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Quantity</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalQuantityAll.toFixed(2)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Top Product Share</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${topProductPercentage}%</div>
                    </div>
                </div>
            </div>`;
        }
        
        report += '</div>';

        document.getElementById('top-products-content').innerHTML = report;
        document.getElementById('top-products-title').textContent = 'Top Products Report';
        this.showTopProductsModal();
    },

    // PRINT METHODS
    printDailyReport() {
        this.printReport('daily-report-content', 'daily-report-title');
    },

    printTopProductsReport() {
        this.printReport('top-products-content', 'top-products-title');
    },

    printReport(contentId, titleId) {
        const reportContent = document.getElementById(contentId).innerHTML;
        const reportTitle = document.getElementById(titleId).textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #1f2937;
                            line-height: 1.6;
                        }
                        .report-content { 
                            max-width: 800px; 
                            margin: 0 auto;
                        }
                        h4 { 
                            color: #1f2937; 
                            border-bottom: 2px solid #3b82f6; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        h5 { 
                            color: #374151; 
                            margin: 20px 0 10px 0;
                        }
                        .stats-grid { 
                            display: grid; 
                            grid-template-columns: repeat(2, 1fr); 
                            gap: 15px; 
                            margin: 15px 0; 
                        }
                        .stat-item { 
                            padding: 10px; 
                            background: #f8f9fa; 
                            border-radius: 5px; 
                            text-align: center; 
                        }
                        @media print {
                            body { margin: 0.5in; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #6b7280; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    ${reportContent}
                    <div class="no-print" style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                        Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // EXISTING METHODS (keep as they were)
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
        const headers = ['Date', 'Product', 'Customer', 'Quantity', 'Unit', 'Unit Price', 'Total', 'Payment Method', 'Payment Status', 'Notes'];
        const rows = sales.map(sale => [
            sale.date,
            this.formatProductName(sale.product),
            sale.customer || 'Walk-in',
            sale.quantity,
            sale.unit,
            sale.unitPrice,
            sale.totalAmount,
            sale.paymentMethod,
            sale.paymentStatus || 'paid',
            sale.notes || ''
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

    // UTILITY METHODS
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
    console.log('✅ Sales Records module registered with StyleManager integration');
}
