// modules/sales-record.js - FULLY WORKING
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
            { id: 1, date: '2024-03-15', product: 'eggs', quantity: 400, unit: 'pieces', price: 0.25, total: 100, customer: 'Local Market' },
            { id: 2, date: '2024-03-14', product: 'broilers', quantity: 20, unit: 'birds', price: 8.50, total: 170, customer: 'Restaurant A' },
            { id: 3, date: '2024-03-12', product: 'manure', quantity: 10, unit: 'bags', price: 5.00, total: 50, customer: 'Garden Center' }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Track your farm sales</p>
                </div>

                <!-- Sales Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalRevenue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalSales}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Sales</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.avgSale)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Sale</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-sale-btn">
                        <div style="font-size: 32px;">💰</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new sale</span>
                    </button>
                    <button class="quick-action-btn" id="sales-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Sales Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View sales analytics</span>
                    </button>
                </div>

                <!-- Sales Form -->
                <div id="sales-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Record Sale</h3>
                        <form id="sales-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Product</label>
                                    <select class="form-input" id="sale-product" required>
                                        <option value="eggs">Eggs</option>
                                        <option value="broilers">Broilers</option>
                                        <option value="layers">Layers</option>
                                        <option value="manure">Manure</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" id="sale-date" required>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity</label>
                                    <input type="number" class="form-input" id="sale-quantity" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Unit Price ($)</label>
                                    <input type="number" class="form-input" id="sale-price" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Customer</label>
                                <input type="text" class="form-input" id="sale-customer" required>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Sale</button>
                                <button type="button" class="btn-outline" id="cancel-sales-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Sales -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Sales</h3>
                        <button class="btn-primary" id="show-sales-form">Record Sale</button>
                    </div>
                    <div id="sales-list">
                        ${this.renderSalesList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSales = this.sales.length;
        const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

        return { totalRevenue, totalSales, avgSale };
    },

    renderSalesList() {
        if (this.sales.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No sales records</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first sale to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.sales.map(sale => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${this.getProductIcon(sale.product)}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${sale.product}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    ${sale.date} • ${sale.customer}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">${this.formatCurrency(sale.total)}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${sale.quantity} ${sale.unit} @ ${this.formatCurrency(sale.price)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getProductIcon(product) {
        const icons = {
            'eggs': '🥚',
            'broilers': '🐔',
            'layers': '🐓',
            'manure': '💩',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-sales-form')?.addEventListener('click', () => this.showSalesForm());
        document.getElementById('record-sale-btn')?.addEventListener('click', () => this.showSalesForm());
        document.getElementById('sales-report-btn')?.addEventListener('click', () => this.generateSalesReport());
        
        // Form handlers
        document.getElementById('sales-form')?.addEventListener('submit', (e) => this.handleSalesSubmit(e));
        document.getElementById('cancel-sales-form')?.addEventListener('click', () => this.hideSalesForm());
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = today;

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
    },

    showSalesForm() {
        document.getElementById('sales-form-container').classList.remove('hidden');
        document.getElementById('sales-form').reset();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sale-date').value = today;
        
        document.getElementById('sales-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideSalesForm() {
        document.getElementById('sales-form-container').classList.add('hidden');
    },

    handleSalesSubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('sale-quantity').value);
        const price = parseFloat(document.getElementById('sale-price').value);
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('sale-date').value,
            product: document.getElementById('sale-product').value,
            quantity: quantity,
            unit: this.getUnitForProduct(document.getElementById('sale-product').value),
            price: price,
            total: quantity * price,
            customer: document.getElementById('sale-customer').value
        };

        this.sales.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Sale recorded!', 'success');
        }
    },

    getUnitForProduct(product) {
        const units = {
            'eggs': 'pieces',
            'broilers': 'birds',
            'layers': 'birds',
            'manure': 'bags',
            'other': 'units'
        };
        return units[product] || 'units';
    },

    generateSalesReport() {
        const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = this.sales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        let report = `📊 Sales Report\n\n`;
        report += `Total Revenue: ${this.formatCurrency(totalRevenue)}\n`;
        report += `Total Items Sold: ${totalItems}\n`;
        report += `Number of Sales: ${this.sales.length}\n\n`;
        report += `Top Products:\n`;

        const productSales = {};
        this.sales.forEach(sale => {
            if (!productSales[sale.product]) {
                productSales[sale.product] = 0;
            }
            productSales[sale.product] += sale.total;
        });

        Object.entries(productSales).forEach(([product, revenue]) => {
            report += `• ${product}: ${this.formatCurrency(revenue)}\n`;
        });

        alert(report);
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

if (window.FarmModules) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
}
