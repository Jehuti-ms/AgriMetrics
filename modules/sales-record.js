// modules/sales-record.js - REWRITTEN FOR CONSISTENCY
console.log('Loading sales-record module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    sales: [],

    initialize() {
        console.log('💰 Initializing sales records...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-sales');
        this.sales = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            {
                id: 1,
                date: '2024-03-15',
                product: 'eggs',
                customer: 'Local Market',
                quantity: 120,
                unit: 'units',
                unitPrice: 0.25,
                totalAmount: 30,
                paymentMethod: 'cash',
                paymentStatus: 'paid'
            },
            {
                id: 2,
                date: '2024-03-14',
                product: 'broilers-dressed',
                customer: 'Restaurant Supply',
                quantity: 50,
                unit: 'kg',
                unitPrice: 4.5,
                totalAmount: 225,
                paymentMethod: 'transfer',
                paymentStatus: 'paid'
            }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="sales-module">
                <!-- Header -->
                <div class="module-header-pwa">
                    <h1 class="module-title-pwa">Sales Records</h1>
                    <p class="module-subtitle-pwa">Track product sales and revenue</p>
                </div>

                <!-- Sales Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📈</div>
                        <div class="stat-value-pwa">${this.formatCurrency(stats.todaySales)}</div>
                        <div class="stat-label-pwa">Today's Sales</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📊</div>
                        <div class="stat-value-pwa">${this.formatCurrency(stats.weekSales)}</div>
                        <div class="stat-label-pwa">This Week</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa">${this.formatCurrency(stats.monthSales)}</div>
                        <div class="stat-label-pwa">This Month</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🎯</div>
                        <div class="stat-value-pwa">${stats.topProduct}</div>
                        <div class="stat-label-pwa">Top Product</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <div class="quick-grid-pwa">
                        <button class="quick-action-btn-pwa" id="add-sale-btn">
                            <div class="quick-icon-pwa">➕</div>
                            <div class="quick-text-pwa">
                                <div class="quick-title-pwa">Record Sale</div>
                                <div class="quick-desc-pwa">Add new sale record</div>
                            </div>
                        </button>
                        <button class="quick-action-btn-pwa" id="export-sales-btn">
                            <div class="quick-icon-pwa">📤</div>
                            <div class="quick-text-pwa">
                                <div class="quick-title-pwa">Export Data</div>
                                <div class="quick-desc-pwa">Export sales to CSV</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Quick Sale Form -->
                <div id="sale-form-container" class="form-container-pwa hidden">
                    <h3 class="form-title-pwa" id="sale-form-title">Record Sale</h3>
                    <form id="sale-form">
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Product</label>
                                <select class="form-select-pwa" id="sale-product" required>
                                    <option value="">Select Product</option>
                                    <option value="eggs">Eggs</option>
                                    <option value="broilers-live">Broilers (Live)</option>
                                    <option value="broilers-dressed">Broilers (Dressed)</option>
                                    <option value="chicken-parts">Chicken Parts</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Customer</label>
                                <input type="text" class="form-input-pwa" id="sale-customer" placeholder="Customer name">
                            </div>
                        </div>
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Quantity</label>
                                <input type="number" class="form-input-pwa" id="sale-quantity" min="0.01" step="0.01" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Unit</label>
                                <select class="form-select-pwa" id="sale-unit" required>
                                    <option value="units">Units</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="lbs">Pounds</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Unit Price ($)</label>
                                <input type="number" class="form-input-pwa" id="sale-price" step="0.01" min="0" required>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Payment Method</label>
                                <select class="form-select-pwa" id="sale-payment" required>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Date</label>
                            <input type="date" class="form-input-pwa" id="sale-date" required>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button type="submit" class="btn-primary-pwa">Save Sale</button>
                            <button type="button" class="btn-outline-pwa" id="cancel-sale-form">Cancel</button>
                        </div>
                    </form>
                </div>

                <!-- Sales Records -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Sales</h3>
                        <button class="btn-outline-pwa" id="clear-sales">Clear All</button>
                    </div>
                    <div class="transactions-list-pwa" id="sales-list">
                        ${this.renderSalesList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todaySales = this.sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);

        const weekSales = this.getSalesForPeriod(7);
        const monthSales = this.getSalesForPeriod(30);

        // Find top product
        const productSales = {};
        this.sales.forEach(sale => {
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

        return { todaySales, weekSales, monthSales, topProduct };
    },

    getSalesForPeriod(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.sales
            .filter(sale => new Date(sale.date) >= cutoffDate)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
    },

    renderSalesList() {
        if (this.sales.length === 0) {
            return `
                <div class="empty-state-pwa">
                    <div class="empty-icon-pwa">💰</div>
                    <div class="empty-title-pwa">No sales recorded yet</div>
                    <div class="empty-desc-pwa">Start by recording your first sale</div>
                </div>
            `;
        }

        return this.sales.slice().reverse().map(sale => {
            return `
                <div class="transaction-item-pwa" data-id="${sale.id}">
                    <div class="transaction-info-pwa">
                        <div class="transaction-icon-pwa">💰</div>
                        <div class="transaction-details-pwa">
                            <div class="transaction-title-pwa">${this.formatProductName(sale.product)}</div>
                            <div class="transaction-meta-pwa">
                                <span>${sale.customer || 'Walk-in'}</span>
                                <span>•</span>
                                <span>${sale.date}</span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount-pwa">
                        ${this.formatCurrency(sale.totalAmount)}
                    </div>
                </div>
            `;
        }).join('');
    },

    setupEventListeners() {
        // Add sale button
        document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleForm());
        
        // Form handlers
        document.getElementById('sale-form')?.addEventListener('submit', (e) => this.handleSaleSubmit(e));
        document.getElementById('cancel-sale-form')?.addEventListener('click', () => this.hideSaleForm());
        
        // Export button
        document.getElementById('export-sales-btn')?.addEventListener('click', () => this.exportSales());
        
        // Clear sales button
        document.getElementById('clear-sales')?.addEventListener('click', () => this.clearAllSales());

        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = today;

        // Delete sale handlers
        document.addEventListener('click', (e) => {
            const saleItem = e.target.closest('.transaction-item-pwa');
            if (saleItem) {
                const id = parseInt(saleItem.dataset.id);
                this.deleteSale(id);
            }
        });
    },

    showSaleForm() {
        const formContainer = document.getElementById('sale-form-container');
        const dateInput = document.getElementById('sale-date');
        
        formContainer.classList.remove('hidden');
        dateInput.value = new Date().toISOString().split('T')[0];
        
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    hideSaleForm() {
        const formContainer = document.getElementById('sale-form-container');
        formContainer.classList.add('hidden');
        document.getElementById('sale-form').reset();
    },

    handleSaleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('sale-date').value,
            product: document.getElementById('sale-product').value,
            customer: document.getElementById('sale-customer').value,
            quantity: parseFloat(document.getElementById('sale-quantity').value),
            unit: document.getElementById('sale-unit').value,
            unitPrice: parseFloat(document.getElementById('sale-price').value),
            totalAmount: parseFloat(document.getElementById('sale-quantity').value) * parseFloat(document.getElementById('sale-price').value),
            paymentMethod: document.getElementById('sale-payment').value,
            paymentStatus: 'paid'
        };

        this.sales.push(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Sale recorded successfully!', 'success');
        }
    },

    deleteSale(id) {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.sales = this.sales.filter(sale => sale.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Sale deleted!', 'success');
            }
        }
    },

    clearAllSales() {
        if (confirm('Are you sure you want to clear all sales? This cannot be undone.')) {
            this.sales = [];
            this.saveData();
            this.renderModule();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('All sales cleared!', 'success');
            }
        }
    },

    exportSales() {
        const csv = this.convertToCSV(this.sales);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Sales exported successfully!', 'success');
        }
    },

    convertToCSV(sales) {
        const headers = ['Date', 'Product', 'Customer', 'Quantity', 'Unit', 'Unit Price', 'Total', 'Payment Method'];
        const rows = sales.map(sale => [
            sale.date,
            this.formatProductName(sale.product),
            sale.customer,
            sale.quantity,
            sale.unit,
            this.formatCurrency(sale.unitPrice),
            this.formatCurrency(sale.totalAmount),
            sale.paymentMethod
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    formatProductName(product) {
        const productNames = {
            'eggs': 'Eggs',
            'broilers-live': 'Broilers (Live)',
            'broilers-dressed': 'Broilers (Dressed)',
            'chicken-parts': 'Chicken Parts',
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

    saveData() {
        localStorage.setItem('farm-sales', JSON.stringify(this.sales));
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
    console.log('✅ Sales Record module registered');
}
