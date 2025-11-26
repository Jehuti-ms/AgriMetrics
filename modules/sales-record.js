// modules/sales-record.js
console.log('Loading sales-record module...');

class SalesRecordModule {
    constructor() {
        this.name = 'sales-record';
        this.initialized = false;
        this.salesData = [];
        this.container = null;
    }

    async initialize() {
        console.log('💰 Initializing sales records...');
        
        // Load sales data from IndexedDB or localStorage
        await this.loadSalesData();
        
        // Render the module
        this.render();
        
        this.initialized = true;
        return true;
    }

    async loadSalesData() {
        try {
            // Try to load from IndexedDB first (PWA style)
            if (window.db) {
                this.salesData = await window.db.getAll('sales');
            } else {
                // Fallback to localStorage
                const savedData = localStorage.getItem('farm-sales-data');
                this.salesData = savedData ? JSON.parse(savedData) : [];
            }
        } catch (error) {
            console.error('Error loading sales data:', error);
            this.salesData = [];
        }
    }

    async saveSalesData() {
        try {
            if (window.db) {
                // Clear existing data and save all
                await window.db.clear('sales');
                for (const sale of this.salesData) {
                    await window.db.put('sales', sale);
                }
            } else {
                localStorage.setItem('farm-sales-data', JSON.stringify(this.salesData));
            }
        } catch (error) {
            console.error('Error saving sales data:', error);
        }
    }

    async addSale(saleData) {
        const sale = {
            id: `sale_${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            product: saleData.product,
            quantity: parseInt(saleData.quantity),
            price: parseFloat(saleData.price),
            total: parseFloat(saleData.quantity) * parseFloat(saleData.price),
            customer: saleData.customer || 'Walk-in Customer',
            category: saleData.category || 'General'
        };
        
        this.salesData.unshift(sale);
        await this.saveSalesData();
        await this.updateDisplay();
        this.showToast('Sale recorded successfully!', 'success');
    }

    async deleteSale(saleId) {
        this.salesData = this.salesData.filter(sale => sale.id !== saleId);
        await this.saveSalesData();
        await this.updateDisplay();
        this.showToast('Sale deleted successfully!', 'success');
    }

    calculateSummary() {
        const totalSales = this.salesData.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = this.salesData.reduce((sum, sale) => sum + sale.quantity, 0);
        const avgSale = this.salesData.length > 0 ? totalSales / this.salesData.length : 0;

        return {
            totalSales: totalSales.toFixed(2),
            totalItems,
            avgSale: avgSale.toFixed(2),
            transactionCount: this.salesData.length
        };
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.sales-record-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="sales-record-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Sales Records</h1>
                        <p class="header-subtitle">Track product sales and revenue</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" id="record-sale-btn">
                            <i class="icon">➕</i>
                            Record Sale
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon revenue">💰</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-sales">$0.00</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon items">📦</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-items">0</div>
                            <div class="stat-label">Items Sold</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon average">📈</div>
                        <div class="stat-content">
                            <div class="stat-value" id="avg-sale">$0.00</div>
                            <div class="stat-label">Average Sale</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon transactions">🧾</div>
                        <div class="stat-content">
                            <div class="stat-value" id="transaction-count">0</div>
                            <div class="stat-label">Transactions</div>
                        </div>
                    </div>
                </div>

                <!-- Actions Bar -->
                <div class="actions-bar">
                    <div class="search-box">
                        <i class="icon">🔍</i>
                        <input type="text" id="sales-search" placeholder="Search sales...">
                    </div>
                    <div class="action-buttons">
                        <button class="btn-secondary" id="export-sales-btn">
                            <i class="icon">📤</i>
                            Export
                        </button>
                        <button class="btn-secondary" id="generate-report-btn">
                            <i class="icon">📊</i>
                            Report
                        </button>
                    </div>
                </div>

                <!-- Sales Table -->
                <div class="table-container">
                    <div class="table-header">
                        <h3>Recent Sales</h3>
                        <div class="table-actions">
                            <button class="btn-text" id="filter-sales-btn">
                                <i class="icon">🔧</i>
                                Filter
                            </button>
                        </div>
                    </div>
                    <div class="table-content" id="sales-table-content">
                        <!-- Sales table will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    async updateDisplay() {
        if (!this.container) return;

        const summary = this.calculateSummary();
        
        // Update stats
        this.updateElement('#total-sales', `$${summary.totalSales}`);
        this.updateElement('#total-items', summary.totalItems);
        this.updateElement('#avg-sale', `$${summary.avgSale}`);
        this.updateElement('#transaction-count', summary.transactionCount);

        // Update sales table
        await this.renderSalesTable();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    async renderSalesTable() {
        const tableContent = this.container?.querySelector('#sales-table-content');
        if (!tableContent) return;

        if (this.salesData.length === 0) {
            tableContent.innerHTML = this.getEmptyState();
            return;
        }

        tableContent.innerHTML = this.getSalesTable();
        this.setupTableEventListeners();
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No Sales Recorded</h3>
                <p>Start recording your sales to see them here</p>
                <button class="btn-primary" id="add-first-sale-btn">
                    Record First Sale
                </button>
            </div>
        `;
    }

    getSalesTable() {
        const recentSales = this.salesData.slice(0, 20);
        
        return `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Total</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentSales.map(sale => `
                            <tr class="sale-row" data-sale-id="${sale.id}">
                                <td>
                                    <div class="date-primary">${sale.date.split(',')[0]}</div>
                                    <div class="date-secondary">${sale.date.split(',')[1]?.trim()}</div>
                                </td>
                                <td class="product-cell">
                                    <div class="product-name">${sale.product}</div>
                                    ${sale.category ? `<div class="product-category">${sale.category}</div>` : ''}
                                </td>
                                <td class="customer-cell">${sale.customer}</td>
                                <td class="text-right">${sale.quantity}</td>
                                <td class="text-right">$${sale.price.toFixed(2)}</td>
                                <td class="text-right">
                                    <div class="amount">$${sale.total.toFixed(2)}</div>
                                </td>
                                <td class="text-center">
                                    <div class="action-buttons">
                                        <button class="btn-icon danger delete-sale-btn" data-sale-id="${sale.id}" title="Delete sale">
                                            <i class="icon">🗑️</i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        // Record sale button
        this.container.querySelector('#record-sale-btn')?.addEventListener('click', () => {
            this.showRecordSaleModal();
        });

        // Add first sale button (empty state)
        this.container.querySelector('#add-first-sale-btn')?.addEventListener('click', () => {
            this.showRecordSaleModal();
        });

        // Export button
        this.container.querySelector('#export-sales-btn')?.addEventListener('click', () => {
            this.exportSalesData();
        });

        // Report button
        this.container.querySelector('#generate-report-btn')?.addEventListener('click', () => {
            this.generateSalesReport();
        });

        // Search functionality
        const searchInput = this.container.querySelector('#sales-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSales(e.target.value);
            });
        }
    }

    setupTableEventListeners() {
        // Delete sale buttons
        this.container?.querySelectorAll('.delete-sale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const saleId = e.currentTarget.getAttribute('data-sale-id');
                this.confirmDeleteSale(saleId);
            });
        });

        // Row click for potential detail view
        this.container?.querySelectorAll('.sale-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.action-buttons')) {
                    const saleId = row.getAttribute('data-sale-id');
                    this.showSaleDetails(saleId);
                }
            });
        });
    }

    showRecordSaleModal() {
        // Create and show modal for recording sales
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Record New Sale</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="record-sale-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="sale-product">Product Name *</label>
                            <input type="text" id="sale-product" name="product" required>
                        </div>
                        <div class="form-group">
                            <label for="sale-category">Category</label>
                            <select id="sale-category" name="category">
                                <option value="General">General</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Meat">Meat</option>
                                <option value="Grains">Grains</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sale-customer">Customer</label>
                            <input type="text" id="sale-customer" name="customer" placeholder="Walk-in Customer">
                        </div>
                        <div class="form-group">
                            <label for="sale-quantity">Quantity *</label>
                            <input type="number" id="sale-quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="sale-price">Price ($) *</label>
                            <input type="number" id="sale-price" name="price" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Record Sale</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal event listeners
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#record-sale-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const saleData = Object.fromEntries(formData);
            
            await this.addSale(saleData);
            closeModal();
        });
    }

    confirmDeleteSale(saleId) {
        // Show confirmation dialog
        if (confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
            this.deleteSale(saleId);
        }
    }

    showSaleDetails(saleId) {
        const sale = this.salesData.find(s => s.id === saleId);
        if (!sale) return;

        // Simple detail view - could be enhanced with a proper modal
        const detailText = `
Sale Details:
- Product: ${sale.product}
- Customer: ${sale.customer}
- Quantity: ${sale.quantity}
- Price: $${sale.price.toFixed(2)}
- Total: $${sale.total.toFixed(2)}
- Date: ${sale.date}
        `.trim();

        alert(detailText);
    }

    filterSales(searchTerm) {
        const rows = this.container?.querySelectorAll('.sale-row');
        if (!rows) return;

        const term = searchTerm.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    async exportSalesData() {
        if (this.salesData.length === 0) {
            this.showToast('No sales data to export', 'warning');
            return;
        }

        const csvContent = this.convertToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Sales data exported successfully!', 'success');
    }

    convertToCSV() {
        const headers = ['Date', 'Product', 'Category', 'Customer', 'Quantity', 'Price', 'Total'];
        const rows = this.salesData.map(sale => [
            sale.date,
            sale.product,
            sale.category,
            sale.customer,
            sale.quantity,
            sale.price.toFixed(2),
            sale.total.toFixed(2)
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    generateSalesReport() {
        if (this.salesData.length === 0) {
            this.showToast('No sales data available for report', 'warning');
            return;
        }

        const summary = this.calculateSummary();
        const report = `
📊 Sales Report - ${new Date().toLocaleDateString()}

💰 Total Revenue: $${summary.totalSales}
📦 Items Sold: ${summary.totalItems}
📈 Average Sale: $${summary.avgSale}
🧾 Transactions: ${summary.transactionCount}

Recent Sales:
${this.salesData.slice(0, 10).map(sale => 
    `• ${sale.date.split(',')[0]} - ${sale.product} - $${sale.total.toFixed(2)}`
).join('\n')}
        `.trim();

        // Show report in alert (could be enhanced with proper modal)
        alert(report);
        this.showToast('Sales report generated!', 'success');
    }

    showToast(message, type = 'info') {
        // Use the existing toast system from the PWA
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            // Fallback
            alert(message);
        }
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('sales-record', new SalesRecordModule());
    console.log('✅ Sales Record module registered');
}
