// modules/sales-record.js - COMPLETE FIXED WITH ALL INTEGRATIONS
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,
    broadcaster: null,
    dataService: null,
    sales: [],

    async initialize() {
        console.log('💰 Initializing Enhanced Sales Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Get UnifiedDataService
        this.dataService = window.UnifiedDataService;
        this.broadcaster = window.DataBroadcaster || window.Broadcaster || null;
        
        // Initialize sales array
        if (!window.FarmModules) window.FarmModules = {};
        if (!window.FarmModules.appData) window.FarmModules.appData = {};
        if (!window.FarmModules.appData.sales) window.FarmModules.appData.sales = [];
        this.sales = window.FarmModules.appData.sales;
        
        // Load saved sales
        this.loadSalesData();
        
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.renderModule();
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ Enhanced Sales Records initialized with', this.sales.length, 'sales');
        return true;
    },

    loadSalesData() {
        const saved = localStorage.getItem('farm-sales-data');
        if (saved) {
            try {
                this.sales = JSON.parse(saved);
                window.FarmModules.appData.sales = this.sales;
                console.log('📊 Loaded sales data:', this.sales.length);
            } catch (e) {
                console.error('Error loading sales:', e);
                this.sales = [];
            }
        }
        
        // Also try to load from UnifiedDataService
        if (this.dataService) {
            const unifiedSales = this.dataService.get('sales');
            if (unifiedSales && unifiedSales.length > 0 && unifiedSales.length !== this.sales.length) {
                this.sales = unifiedSales;
                this.saveSalesData();
                console.log('📊 Synced sales from UnifiedDataService:', this.sales.length);
            }
        }
    },

    saveSalesData() {
        localStorage.setItem('farm-sales-data', JSON.stringify(this.sales));
        window.FarmModules.appData.sales = this.sales;
        
        // Save to UnifiedDataService
        if (this.dataService) {
            for (const sale of this.sales) {
                this.dataService.save('sales', sale);
            }
        }
        
        // Update all dependent modules
        this.updateIncomeModule();
        this.updateDashboard();
    },

    updateIncomeModule() {
        console.log('💰 Updating Income module with sales data...');
        
        // Create income transactions from all sales
        const incomeTransactions = this.sales.map(sale => ({
            id: sale.id,
            date: sale.date,
            type: 'income',
            category: 'sales',
            amount: sale.totalAmount,
            description: `Sale: ${this.formatProductName(sale.product)} - ${sale.customer || 'Walk-in'}`,
            paymentMethod: sale.paymentMethod || 'cash',
            reference: sale.id,
            notes: sale.notes || '',
            source: 'sales-module',
            saleId: sale.id,
            createdAt: sale.createdAt || new Date().toISOString()
        }));
        
        // Method 1: Direct update to IncomeExpensesModule
        if (window.IncomeExpensesModule) {
            if (!window.IncomeExpensesModule.transactions) {
                window.IncomeExpensesModule.transactions = [];
            }
            
            // Merge transactions (avoid duplicates)
            const existingIds = new Set(window.IncomeExpensesModule.transactions.map(t => t.saleId).filter(id => id));
            const newTransactions = incomeTransactions.filter(t => !existingIds.has(t.saleId));
            
            if (newTransactions.length > 0) {
                window.IncomeExpensesModule.transactions.unshift(...newTransactions);
                // Sort by date
                window.IncomeExpensesModule.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                if (typeof window.IncomeExpensesModule.saveData === 'function') {
                    window.IncomeExpensesModule.saveData();
                }
                if (typeof window.IncomeExpensesModule.updateStats === 'function') {
                    window.IncomeExpensesModule.updateStats();
                }
                if (typeof window.IncomeExpensesModule.updateTransactionsList === 'function') {
                    window.IncomeExpensesModule.updateTransactionsList();
                }
                console.log('✅ Income module updated with', newTransactions.length, 'new transactions');
            }
        }
        
        // Method 2: Save to UnifiedDataService
        if (this.dataService) {
            for (const transaction of incomeTransactions) {
                this.dataService.save('transactions', transaction);
            }
        }
        
        // Method 3: Dispatch event for any listeners
        window.dispatchEvent(new CustomEvent('sales-updated', {
            detail: { sales: this.sales, transactions: incomeTransactions }
        }));
        
        if (this.broadcaster && typeof this.broadcaster.emit === 'function') {
            this.broadcaster.emit('sales:updated', { sales: this.sales });
            this.broadcaster.emit('income-updated', { amount: this.getTotalRevenue(), source: 'sales' });
        }
    },

    updateDashboard() {
        console.log('📊 Updating dashboard...');
        
        const totalRevenue = this.getTotalRevenue();
        const todayRevenue = this.getTodayRevenue();
        
        // Dispatch event for dashboard
        window.dispatchEvent(new CustomEvent('dashboard-update', {
            detail: {
                type: 'sales',
                amount: totalRevenue,
                todayAmount: todayRevenue,
                timestamp: new Date().toISOString()
            }
        }));
        
        // Also update FarmData for dashboard
        if (window.FarmData) {
            window.FarmData.sales = this.sales;
            window.dispatchEvent(new CustomEvent('farm-data-updated', {
                detail: { module: 'sales-record', data: this.sales }
            }));
        }
        
        if (this.broadcaster && typeof this.broadcaster.broadcast === 'function') {
            this.broadcaster.broadcast('sales-stats', {
                totalRevenue: totalRevenue,
                todayRevenue: todayRevenue,
                totalSales: this.sales.length
            });
        }
    },

    getTotalRevenue() {
        return this.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    },

    getTodayRevenue() {
        const today = new Date().toISOString().split('T')[0];
        return this.sales.filter(sale => sale.date === today).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    },

    updateSalesStats() {
        const sales = this.sales;
        const today = new Date().toISOString().split('T')[0];
        
        const todaySales = sales.filter(sale => sale.date === today);
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const todaySalesEl = document.getElementById('today-sales');
        if (todaySalesEl) todaySalesEl.textContent = this.formatCurrency(todayRevenue);
        
        const totalSalesEl = document.getElementById('total-sales');
        if (totalSalesEl) totalSalesEl.textContent = sales.length;
        
        const totalRevenueEl = document.getElementById('total-revenue');
        if (totalRevenueEl) totalRevenueEl.textContent = this.formatCurrency(totalRevenue);
        
        // Calculate meat sales
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        
        const totalAnimalsEl = document.getElementById('total-animals');
        if (totalAnimalsEl) totalAnimalsEl.textContent = totalAnimals;
        
        const totalMeatWeightEl = document.getElementById('total-meat-weight');
        if (totalMeatWeightEl) {
            const totalWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
            totalMeatWeightEl.textContent = totalWeight.toFixed(2);
        }
        
        console.log('📊 Stats updated - Today:', this.formatCurrency(todayRevenue), 'Total:', this.formatCurrency(totalRevenue));
    },

    renderSalesTable(period = 'all') {
        const sales = this.sales;
        
        let filteredSales = sales;
        const today = new Date().toISOString().split('T')[0];
        
        if (period === 'today') {
            filteredSales = sales.filter(sale => sale.date === today);
        } else if (period === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredSales = sales.filter(sale => new Date(sale.date) >= weekAgo);
        } else if (period === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            filteredSales = sales.filter(sale => new Date(sale.date) >= monthAgo);
        } else if (period === 'meat') {
            const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
            filteredSales = sales.filter(sale => meatProducts.includes(sale.product));
        }

        if (filteredSales.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No sales recorded</div>
                    <div style="font-size: 14px;">Click "Record Sale" to add your first sale</div>
                </div>
            `;
        }

        const sortedSales = [...filteredSales].sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left;">Date</th>
                            <th style="padding: 12px 8px; text-align: left;">Product</th>
                            <th style="padding: 12px 8px; text-align: left;">Customer</th>
                            <th style="padding: 12px 8px; text-align: left;">Quantity</th>
                            <th style="padding: 12px 8px; text-align: left;">Unit Price</th>
                            <th style="padding: 12px 8px; text-align: left;">Total</th>
                            <th style="padding: 12px 8px; text-align: left;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedSales.map(sale => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px 8px;">${this.formatDate(sale.date)}</td>
                                <td style="padding: 12px 8px;">${this.formatProductName(sale.product)}</td>
                                <td style="padding: 12px 8px;">${sale.customer || 'Walk-in'}</td>
                                <td style="padding: 12px 8px;">${sale.quantity} ${sale.unit || 'units'}</td>
                                <td style="padding: 12px 8px;">${this.formatCurrency(sale.unitPrice)}</td>
                                <td style="padding: 12px 8px; font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                <td style="padding: 12px 8px;">
                                    <button class="edit-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; margin-right: 8px;">✏️</button>
                                    <button class="delete-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer;">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderModule() {
        if (!this.element) return;

        const todayRevenue = this.getTodayRevenue();
        const totalRevenue = this.getTotalRevenue();
        
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        const meatSales = this.sales.filter(sale => meatProducts.includes(sale.product));
        const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Track product sales and revenue</p>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-sale-btn">➕ Record Sale</button>
                    </div>
                </div>

               <h2 class="section-title">📊 Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="today-sales">${this.formatCurrency(todayRevenue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Today's Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-revenue">${this.formatCurrency(totalRevenue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-animals">${totalAnimals}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Animals Sold</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⚖️</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-meat-weight">${totalMeatWeight.toFixed(2)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Meat Weight (kg)</div>
                    </div>
                </div>
                
                                <!-- Quick Actions -->
                <h2 class="section-title" style="margin-top: 24px;">⚡ Quick Actions</h2>
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-sale-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new sale record</span>
                    </button>
                    <button class="quick-action-btn" id="meat-sales-btn">
                        <div style="font-size: 32px;">🍗</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Meat Sales</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View meat sales report</span>
                    </button>
                    <button class="quick-action-btn" id="daily-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Daily Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Today's sales summary</span>
                    </button>
                    <button class="quick-action-btn" id="export-sales-btn">
                        <div style="font-size: 32px;">💾</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export sales records</span>
                    </button>
                </div>
                <div class="glass-card" style="margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary);">📋 Sales Records</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="period-filter" class="form-input" style="width: auto;">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                                <option value="meat">Meat Sales Only</option>
                            </select>
                            <button class="btn-outline" id="export-sales-btn">Export</button>
                        </div>
                    </div>
                    <div id="sales-table">
                        ${this.renderSalesTable('today')}
                    </div>
                </div>
            </div>

            <!-- Sale Modal -->
            <div id="sale-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Record Sale</h3>
                        <button class="popout-modal-close" id="close-sale-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id" value="">
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Customer Name</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name">
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Product *</label>
                                <select id="sale-product" class="form-input" required>
                                    <option value="">Select Product</option>
                                    <optgroup label="🐔 Poultry - Dressed (per bird)">
                                        <option value="broilers-dressed-bird">🍗 Broilers (Dressed/Bird) - per bird</option>
                                    </optgroup>
                                    <optgroup label="🐔 Poultry - Live (per bird)">
                                        <option value="broilers-live">🐔 Broilers (Live) - per bird</option>
                                        <option value="layers">🐓 Layers - per bird</option>
                                    </optgroup>
                                    <optgroup label="🥚 Eggs">
                                        <option value="eggs">🥚 Eggs</option>
                                    </optgroup>
                                    <optgroup label="🐄 Livestock Meat (by weight)">
                                        <option value="pork">🐖 Pork</option>
                                        <option value="beef">🐄 Beef</option>
                                        <option value="goat">🐐 Goat</option>
                                        <option value="lamb">🐑 Lamb</option>
                                    </optgroup>
                                </select>
                            </div>

                            <!-- Meat Sale Fields -->
                            <div id="meat-section" style="display: none;">
                                <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                                    <h4 style="color: #22c55e; margin-bottom: 12px;">🐔 Bird/Meat Sale Details</h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Weight Unit *</label>
                                            <select id="meat-weight-unit" class="form-input">
                                                <option value="bird">Bird</option>
                                                <option value="kg">kg</option>
                                                <option value="lbs">lbs</option>
                                            </select>
                                        </div>
                                        <div id="meat-animal-count-container">
                                            <label class="form-label">Number of Birds *</label>
                                            <input type="number" id="meat-animal-count" class="form-input" min="1" placeholder="0">
                                        </div>
                                        <div>
                                            <label class="form-label" id="meat-weight-label">Total Weight *</label>
                                            <input type="number" id="meat-weight" class="form-input" step="0.1" placeholder="0">
                                        </div>
                                        <div>
                                            <label class="form-label" id="meat-price-label">Price per kg *</label>
                                            <input type="number" id="meat-price" class="form-input" step="0.01" placeholder="0.00">
                                        </div>
                                    </div>
                                    <div style="margin-top: 12px; padding: 12px; background: #d1fae5; border-radius: 8px;">
                                        <strong>💰 Total Amount:</strong> $<span id="meat-total-amount">0.00</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Standard Product Fields -->
                            <div id="standard-section">
                                <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                                    <h4 style="color: #0ea5e9; margin-bottom: 12px;">📦 Product Details</h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Unit *</label>
                                            <select id="sale-unit" class="form-input" required>
                                                <option value="kg">kg</option>
                                                <option value="lbs">lbs</option>
                                                <option value="dozen">dozen</option>
                                                <option value="piece">piece</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="form-label">Quantity *</label>
                                            <input type="number" id="standard-quantity" class="form-input" step="0.01" placeholder="0">
                                        </div>
                                        <div>
                                            <label class="form-label">Price per Unit *</label>
                                            <input type="number" id="standard-price" class="form-input" step="0.01" placeholder="0.00">
                                        </div>
                                    </div>
                                    <div style="margin-top: 12px; padding: 12px; background: #dbeafe; border-radius: 8px;">
                                        <strong>💰 Total Amount:</strong> $<span id="standard-total-amount">0.00</span>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Payment Method</label>
                                    <select id="sale-payment" class="form-input">
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Notes</label>
                                <textarea id="sale-notes" class="form-input" rows="2" placeholder="Additional notes..."></textarea>
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
                        <h3 class="popout-modal-title">Daily Sales Report</h3>
                        <button class="popout-modal-close" id="close-daily-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="daily-report-content"></div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-daily-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-daily-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Meat Sales Modal -->
            <div id="meat-sales-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Meat Sales Report</h3>
                        <button class="popout-modal-close" id="close-meat-sales">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="meat-sales-content"></div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-meat-sales">🖨️ Print</button>
                        <button class="btn-primary" id="close-meat-sales-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateSalesStats();
    },

    setupEventListeners() {
        // Add Sale button
        const addSaleBtns = document.querySelectorAll('#add-sale-btn');
        addSaleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showSaleModal());
        });

        // Close modal buttons
        const closeModal = document.getElementById('close-sale-modal');
        if (closeModal) closeModal.addEventListener('click', () => this.hideSaleModal());
        
        const cancelSale = document.getElementById('cancel-sale');
        if (cancelSale) cancelSale.addEventListener('click', () => this.hideSaleModal());

        // Save sale button
        const saveSale = document.getElementById('save-sale');
        if (saveSale) {
            const newSaveBtn = saveSale.cloneNode(true);
            saveSale.parentNode.replaceChild(newSaveBtn, saveSale);
            newSaveBtn.addEventListener('click', () => this.saveSale());
        }

        // Delete sale button
        const deleteSale = document.getElementById('delete-sale');
        if (deleteSale) deleteSale.addEventListener('click', () => this.deleteSale());

        // Product change handler
        const productSelect = document.getElementById('sale-product');
        if (productSelect) productSelect.addEventListener('change', () => this.handleProductChange());

        // Weight unit change handler
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) weightUnit.addEventListener('change', () => this.handleWeightUnitChange());

        // Quantity/Price input handlers
        const animalCount = document.getElementById('meat-animal-count');
        if (animalCount) animalCount.addEventListener('input', () => this.calculateTotal());
        
        const meatWeight = document.getElementById('meat-weight');
        if (meatWeight) meatWeight.addEventListener('input', () => this.calculateTotal());
        
        const meatPrice = document.getElementById('meat-price');
        if (meatPrice) meatPrice.addEventListener('input', () => this.calculateTotal());
        
        const standardQty = document.getElementById('standard-quantity');
        if (standardQty) standardQty.addEventListener('input', () => this.calculateTotal());
        
        const standardPrice = document.getElementById('standard-price');
        if (standardPrice) standardPrice.addEventListener('input', () => this.calculateTotal());

        // Filter change
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                const salesTable = document.getElementById('sales-table');
                if (salesTable) {
                    salesTable.innerHTML = this.renderSalesTable(e.target.value);
                }
            });
        }

        // Meat sales report button
        const meatSalesBtn = document.getElementById('meat-sales-btn');
        if (meatSalesBtn) meatSalesBtn.addEventListener('click', () => this.generateMeatSalesReport());

        // Daily report button
        const dailyReportBtn = document.getElementById('daily-report-btn');
        if (dailyReportBtn) dailyReportBtn.addEventListener('click', () => this.generateDailyReport());

        // Close report modals
        const closeDailyReport = document.getElementById('close-daily-report');
        if (closeDailyReport) closeDailyReport.addEventListener('click', () => this.hideDailyReportModal());
        
        const closeDailyReportBtn = document.getElementById('close-daily-report-btn');
        if (closeDailyReportBtn) closeDailyReportBtn.addEventListener('click', () => this.hideDailyReportModal());
        
        const printDailyReport = document.getElementById('print-daily-report');
        if (printDailyReport) printDailyReport.addEventListener('click', () => this.printDailyReport());
        
        const closeMeatSales = document.getElementById('close-meat-sales');
        if (closeMeatSales) closeMeatSales.addEventListener('click', () => this.hideMeatSalesModal());
        
        const closeMeatSalesBtn = document.getElementById('close-meat-sales-btn');
        if (closeMeatSalesBtn) closeMeatSalesBtn.addEventListener('click', () => this.hideMeatSalesModal());
        
        const printMeatSales = document.getElementById('print-meat-sales');
        if (printMeatSales) printMeatSales.addEventListener('click', () => this.printMeatSalesReport());

        // Edit/Delete buttons (event delegation)
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-sale-btn');
            if (editBtn) {
                const saleId = editBtn.getAttribute('data-id');
                this.editSale(saleId);
            }
            
            const deleteBtn = e.target.closest('.delete-sale-btn');
            if (deleteBtn) {
                const saleId = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this sale?')) {
                    this.deleteSaleRecord(saleId);
                }
            }
        });
    },

    showSaleModal() {
        this.hideAllModals();
        const modal = document.getElementById('sale-modal');
        if (modal) modal.classList.remove('hidden');
        
        // Reset form
        const form = document.getElementById('sale-form');
        if (form) form.reset();
        
        // Set today's date
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Hide delete button for new sale
        const deleteBtn = document.getElementById('delete-sale');
        if (deleteBtn) deleteBtn.style.display = 'none';
        
        // Clear sale ID
        const saleIdInput = document.getElementById('sale-id');
        if (saleIdInput) saleIdInput.value = '';
        
        // Default to meat section showing
        this.handleProductChange();
        this.calculateTotal();
    },

    hideSaleModal() {
        const modal = document.getElementById('sale-modal');
        if (modal) modal.classList.add('hidden');
    },

    hideDailyReportModal() {
        const modal = document.getElementById('daily-report-modal');
        if (modal) modal.classList.add('hidden');
    },

    hideMeatSalesModal() {
        const modal = document.getElementById('meat-sales-modal');
        if (modal) modal.classList.add('hidden');
    },

    hideAllModals() {
        this.hideSaleModal();
        this.hideDailyReportModal();
        this.hideMeatSalesModal();
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        const isMeatProduct = meatProducts.includes(product);
        
        if (isMeatProduct) {
            if (meatSection) meatSection.style.display = 'block';
            if (standardSection) standardSection.style.display = 'none';
            
            // Set default unit for bird products
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit && product === 'broilers-dressed-bird') {
                weightUnit.value = 'bird';
                this.handleWeightUnitChange();
            }
        } else {
            if (meatSection) meatSection.style.display = 'none';
            if (standardSection) standardSection.style.display = 'block';
        }
        
        this.calculateTotal();
    },

    handleWeightUnitChange() {
        const weightUnit = document.getElementById('meat-weight-unit');
        const unit = weightUnit ? weightUnit.value : 'kg';
        
        const animalCountContainer = document.getElementById('meat-animal-count-container');
        const weightLabel = document.getElementById('meat-weight-label');
        const priceLabel = document.getElementById('meat-price-label');
        
        if (unit === 'bird') {
            if (animalCountContainer) animalCountContainer.style.display = 'block';
            if (weightLabel) weightLabel.textContent = 'Number of Birds *';
            if (priceLabel) priceLabel.textContent = 'Price per Bird *';
        } else {
            if (animalCountContainer) animalCountContainer.style.display = 'none';
            if (weightLabel) weightLabel.textContent = 'Total Weight *';
            if (priceLabel) priceLabel.textContent = `Price per ${unit} *`;
        }
        
        this.calculateTotal();
    },

    calculateTotal() {
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        const isMeatProduct = meatProducts.includes(product);
        
        let total = 0;
        
        if (isMeatProduct) {
            const weightUnit = document.getElementById('meat-weight-unit');
            const unit = weightUnit ? weightUnit.value : 'kg';
            const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
            
            if (unit === 'bird') {
                const birdCount = parseInt(document.getElementById('meat-animal-count')?.value) || 0;
                total = birdCount * price;
                console.log(`Bird calculation: ${birdCount} birds × ${price} = $${total}`);
            } else {
                const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
                total = weight * price;
                console.log(`Weight calculation: ${weight} ${unit} × ${price} = $${total}`);
            }
            
            const totalSpan = document.getElementById('meat-total-amount');
            if (totalSpan) totalSpan.textContent = total.toFixed(2);
        } else {
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
            total = quantity * price;
            
            const totalSpan = document.getElementById('standard-total-amount');
            if (totalSpan) totalSpan.textContent = total.toFixed(2);
        }
        
        return total;
    },

    async saveSale() {
        console.log('💾 SAVING SALE...');
        
        try {
            const productSelect = document.getElementById('sale-product');
            const product = productSelect ? productSelect.value : '';
            
            if (!product) {
                this.showNotification('Please select a product', 'error');
                return;
            }
            
            // Get date
            let date = document.getElementById('sale-date')?.value;
            if (!date) {
                date = new Date().toISOString().split('T')[0];
            }
            
            const customer = document.getElementById('sale-customer')?.value || 'Walk-in';
            const paymentMethod = document.getElementById('sale-payment')?.value || 'cash';
            const paymentStatus = document.getElementById('sale-status')?.value || 'paid';
            const notes = document.getElementById('sale-notes')?.value || '';
            
            const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
            const isMeatProduct = meatProducts.includes(product);
            
            let saleData;
            
            if (isMeatProduct) {
                const weightUnit = document.getElementById('meat-weight-unit');
                const unit = weightUnit ? weightUnit.value : 'kg';
                const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
                
                let quantity = 0;
                let totalAmount = 0;
                
                if (unit === 'bird') {
                    quantity = parseInt(document.getElementById('meat-animal-count')?.value) || 0;
                    totalAmount = quantity * price;
                } else {
                    quantity = parseFloat(document.getElementById('meat-weight')?.value) || 0;
                    totalAmount = quantity * price;
                }
                
                if (quantity <= 0) {
                    this.showNotification('Please enter quantity', 'error');
                    return;
                }
                
                if (price <= 0) {
                    this.showNotification('Please enter price', 'error');
                    return;
                }
                
                saleData = {
                    id: 'SALE-' + Date.now(),
                    date: date,
                    customer: customer,
                    product: product,
                    unit: unit,
                    quantity: quantity,
                    unitPrice: price,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    notes: notes,
                    animalCount: unit === 'bird' ? quantity : 0,
                    weight: unit !== 'bird' ? quantity : 0,
                    weightUnit: unit,
                    createdAt: new Date().toISOString()
                };
            } else {
                const unit = document.getElementById('sale-unit')?.value || 'unit';
                const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
                const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
                const totalAmount = quantity * price;
                
                if (quantity <= 0) {
                    this.showNotification('Please enter quantity', 'error');
                    return;
                }
                
                if (price <= 0) {
                    this.showNotification('Please enter price', 'error');
                    return;
                }
                
                saleData = {
                    id: 'SALE-' + Date.now(),
                    date: date,
                    customer: customer,
                    product: product,
                    unit: unit,
                    quantity: quantity,
                    unitPrice: price,
                    totalAmount: totalAmount,
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    notes: notes,
                    createdAt: new Date().toISOString()
                };
            }
            
            console.log('Sale Data:', saleData);
            
            // Add to sales array
            this.sales.unshift(saleData);
            this.saveSalesData();
            
            // Update income module
            this.updateIncomeModule();
            
            // Update dashboard
            this.updateDashboard();
            
            // Update UI
            this.updateSalesStats();
            
            // Refresh the sales table
            const periodFilter = document.getElementById('period-filter');
            const filterValue = periodFilter ? periodFilter.value : 'today';
            const salesTable = document.getElementById('sales-table');
            if (salesTable) {
                salesTable.innerHTML = this.renderSalesTable(filterValue);
            }
            
            this.hideSaleModal();
            this.showNotification(`✅ Sale saved: ${this.formatCurrency(saleData.totalAmount)}`, 'success');
            console.log('✅ Sale saved successfully');
            
        } catch (error) {
            console.error('Error saving sale:', error);
            this.showNotification('Error saving sale: ' + error.message, 'error');
        }
    },

    deleteSaleRecord(saleId) {
        const index = this.sales.findIndex(s => s.id === saleId);
        if (index !== -1) {
            this.sales.splice(index, 1);
            this.saveSalesData();
            this.updateSalesStats();
            this.updateIncomeModule();
            this.updateDashboard();
            
            const periodFilter = document.getElementById('period-filter');
            const filterValue = periodFilter ? periodFilter.value : 'today';
            const salesTable = document.getElementById('sales-table');
            if (salesTable) {
                salesTable.innerHTML = this.renderSalesTable(filterValue);
            }
            
            this.showNotification('Sale deleted successfully', 'success');
        }
    },

    editSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;
        
        this.showSaleModal();
        
        // Populate form
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        // Show delete button
        const deleteBtn = document.getElementById('delete-sale');
        if (deleteBtn) deleteBtn.style.display = 'block';
        
        this.handleProductChange();
        
        // Populate meat or standard fields
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        if (meatProducts.includes(sale.product)) {
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit) weightUnit.value = sale.weightUnit || 'bird';
            this.handleWeightUnitChange();
            
            if (sale.weightUnit === 'bird') {
                const animalCount = document.getElementById('meat-animal-count');
                if (animalCount) animalCount.value = sale.quantity;
            } else {
                const meatWeight = document.getElementById('meat-weight');
                if (meatWeight) meatWeight.value = sale.quantity;
            }
            
            const meatPrice = document.getElementById('meat-price');
            if (meatPrice) meatPrice.value = sale.unitPrice;
        } else {
            const standardQty = document.getElementById('standard-quantity');
            if (standardQty) standardQty.value = sale.quantity;
            
            const standardPrice = document.getElementById('standard-price');
            if (standardPrice) standardPrice.value = sale.unitPrice;
            
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) unitSelect.value = sale.unit || 'kg';
        }
        
        this.calculateTotal();
    },

    deleteSale() {
        const saleId = document.getElementById('sale-id').value;
        if (saleId && confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideSaleModal();
        }
    },

    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const todaySales = this.sales.filter(sale => sale.date === today);
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        let content = `
            <div style="padding: 20px;">
                <h2 style="text-align: center;">Daily Sales Report</h2>
                <p style="text-align: center;">${this.formatDate(today)}</p>
                <hr>
                <div style="text-align: center; margin: 20px 0;">
                    <h3>Total Revenue: ${this.formatCurrency(totalRevenue)}</h3>
                    <p>Total Sales: ${todaySales.length} transactions</p>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                         <tr style="border-bottom: 1px solid #ddd;">
                            <th style="padding: 8px;">Product</th>
                            <th style="padding: 8px;">Quantity</th>
                            <th style="padding: 8px;">Amount</th>
                         </tr>
                    </thead>
                    <tbody>
                        ${todaySales.map(sale => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 8px;">${this.formatProductName(sale.product)}</td>
                                <td style="padding: 8px;">${sale.quantity} ${sale.unit || ''}</td>
                                <td style="padding: 8px;">${this.formatCurrency(sale.totalAmount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        const contentDiv = document.getElementById('daily-report-content');
        if (contentDiv) contentDiv.innerHTML = content;
        
        const modal = document.getElementById('daily-report-modal');
        if (modal) modal.classList.remove('hidden');
    },

    generateMeatSalesReport() {
        const meatProducts = ['broilers-dressed-bird', 'broilers-live', 'pork', 'beef', 'goat', 'lamb'];
        const meatSales = this.sales.filter(sale => meatProducts.includes(sale.product));
        const totalRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        
        let content = `
            <div style="padding: 20px;">
                <h2 style="text-align: center;">Meat Sales Report</h2>
                <hr>
                <div style="text-align: center; margin: 20px 0;">
                    <h3>Total Revenue: ${this.formatCurrency(totalRevenue)}</h3>
                    <p>Total Animals: ${totalAnimals}</p>
                    <p>Total Transactions: ${meatSales.length}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                         <tr style="border-bottom: 1px solid #ddd;">
                            <th style="padding: 8px;">Date</th>
                            <th style="padding: 8px;">Product</th>
                            <th style="padding: 8px;">Quantity</th>
                            <th style="padding: 8px;">Amount</th>
                         </tr>
                    </thead>
                    <tbody>
                        ${meatSales.map(sale => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 8px;">${this.formatDate(sale.date)}</td>
                                <td style="padding: 8px;">${this.formatProductName(sale.product)}</td>
                                <td style="padding: 8px;">${sale.quantity} ${sale.unit || ''}</td>
                                <td style="padding: 8px;">${this.formatCurrency(sale.totalAmount)}</td>
                             </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        const contentDiv = document.getElementById('meat-sales-content');
        if (contentDiv) contentDiv.innerHTML = content;
        
        const modal = document.getElementById('meat-sales-modal');
        if (modal) modal.classList.remove('hidden');
    },

    printDailyReport() {
        const content = document.getElementById('daily-report-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Daily Sales Report</title>
            <style>body{font-family:Arial;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;}</style>
            </head><body>${content}</body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    printMeatSalesReport() {
        const content = document.getElementById('meat-sales-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Meat Sales Report</title>
            <style>body{font-family:Arial;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;}</style>
            </head><body>${content}</body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    formatProductName(product) {
        const names = {
            'broilers-dressed-bird': 'Broilers (Dressed/Bird)',
            'broilers-live': 'Broilers (Live)',
            'layers': 'Layers',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'goat': 'Goat',
            'lamb': 'Lamb'
        };
        return names[product] || product;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

// Register the module
(function() {
    const MODULE_NAME = 'sales-record';
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, SalesRecordModule);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    }
    window.SalesRecordModule = SalesRecordModule;
    window.SalesModule = SalesRecordModule;
})();
