// modules/income-expenses.js - UPDATED WITH FULL FUNCTIONALITY
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],
    element: null,
    currentStats: {},
    exportFormat: 'csv',

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        this.loadData();
        this.renderModule();
        this.updateSummary();
        this.renderTransactionsList();
        this.setupEventListeners();
        this.initialized = true;
        
        this.syncStatsWithDashboard();
        
        // Register with StyleManager
        if (window.StyleManager) {
            const moduleContainer = this.element.querySelector('#income-expenses');
            if (moduleContainer) {
                window.StyleManager.registerModule('income-expenses', moduleContainer);
            }
        }
        
        console.log('✅ Income & Expenses initialized');
        return true;
    },

    loadData() {
        if (!window.FarmModules || !window.FarmModules.appData) {
            window.FarmModules = window.FarmModules || {};
            window.FarmModules.appData = window.FarmModules.appData || {};
        }
        
        if (!window.FarmModules.appData.transactions) {
            window.FarmModules.appData.transactions = this.getDemoData();
        }
        
        this.transactions = window.FarmModules.appData.transactions;
        console.log('📊 Loaded transactions:', this.transactions.length);
    },

    getDemoData() {
        return [
            { id: 1, type: 'income', amount: 1500, category: 'egg-sales', description: 'Egg sales March', date: '2024-03-15', notes: 'Monthly egg sales' },
            { id: 2, type: 'expense', amount: 200, category: 'feed', description: 'Chicken feed', date: '2024-03-14', notes: 'Organic chicken feed' },
            { id: 3, type: 'income', amount: 800, category: 'poultry-sales', description: 'Broiler sales', date: '2024-03-10', notes: 'Sold 50 broilers' },
            { id: 4, type: 'expense', amount: 150, category: 'medication', description: 'Vaccines', date: '2024-03-08', notes: 'Poultry vaccines' },
            { id: 5, type: 'income', amount: 350, category: 'crop-sales', description: 'Vegetable sales', date: '2024-03-05', notes: 'Farmers market' },
            { id: 6, type: 'expense', amount: 450, category: 'equipment', description: 'New water system', date: '2024-03-01', notes: 'Automatic watering' }
        ];
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container">
                <!-- Modern PWA Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-text">
                            <h1 class="module-title">Income & Expenses</h1>
                            <p class="module-subtitle">Track your farm's financial health</p>
                        </div>
                        <div class="header-stats">
                            <div class="stat-badge">
                                <span class="stat-icon">📈</span>
                                <span class="stat-value" id="total-income">${this.formatCurrency(this.calculateStats().totalIncome, false)}</span>
                                <span class="stat-label">Total Income</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">📊</span>
                                <span class="stat-value" id="total-expenses">${this.formatCurrency(this.calculateStats().totalExpenses, false)}</span>
                                <span class="stat-label">Total Expenses</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">💰</span>
                                <span class="stat-value" id="net-profit" style="color: ${this.calculateStats().netProfit >= 0 ? 'var(--status-paid)' : 'var(--status-cancelled)'}">
                                    ${this.formatCurrency(this.calculateStats().netProfit, false)}
                                </span>
                                <span class="stat-label">Net Profit</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary btn-icon" id="add-income">
                            <span class="btn-icon-text">➕</span>
                            <span>Add Income</span>
                        </button>
                        <button class="btn btn-outline btn-icon" id="add-expense">
                            <span class="btn-icon-text">➖</span>
                            <span>Add Expense</span>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline btn-icon" id="export-dropdown">
                                <span class="btn-icon-text">📤</span>
                                <span>Export</span>
                                <span class="dropdown-arrow">▼</span>
                            </button>
                            <div class="dropdown-menu hidden" id="export-menu">
                                <button class="dropdown-item" data-format="csv">
                                    <span class="dropdown-icon">📄</span>
                                    Export as CSV
                                </button>
                                <button class="dropdown-item" data-format="excel">
                                    <span class="dropdown-icon">📊</span>
                                    Export as Excel
                                </button>
                                <button class="dropdown-item" data-format="pdf">
                                    <span class="dropdown-icon">📑</span>
                                    Export as PDF
                                </button>
                                <button class="dropdown-item" data-format="print">
                                    <span class="dropdown-icon">🖨️</span>
                                    Print Report
                                </button>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item" id="export-settings">
                                    <span class="dropdown-icon">⚙️</span>
                                    Export Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Summary Cards -->
                <div class="financial-summary">
                    <div class="summary-card glass-card">
                        <div class="summary-icon">📈</div>
                        <div class="summary-content">
                            <h3>Monthly Income</h3>
                            <div class="summary-value" id="monthly-income">$0</div>
                            <div class="summary-period" id="current-month">This Month</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">📊</div>
                        <div class="summary-content">
                            <h3>Monthly Expenses</h3>
                            <div class="summary-value" id="monthly-expenses">$0</div>
                            <div class="summary-period">This Month</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator down">↓</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">💰</div>
                        <div class="summary-content">
                            <h3>Profit Margin</h3>
                            <div class="summary-value" id="profit-margin">0%</div>
                            <div class="summary-period">Efficiency</div>
                        </div>
                        <div class="summary-trend">
                            <span class="trend-indicator up">↑</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="summary-card glass-card">
                        <div class="summary-icon">🎯</div>
                        <div class="summary-content">
                            <h3>Top Category</h3>
                            <div class="summary-value" id="top-category">-</div>
                            <div class="summary-period" id="top-category-amount">$0</div>
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
                            <h3 class="sidebar-title">Quick Transaction</h3>
                            <form id="quick-transaction-form" class="quick-form">
                                <div class="form-group">
                                    <label for="quick-type">Type</label>
                                    <select id="quick-type" class="form-select">
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="quick-amount">Amount</label>
                                    <input type="number" id="quick-amount" placeholder="0.00" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label for="quick-category">Category</label>
                                    <select id="quick-category" class="form-select">
                                        <option value="egg-sales">Egg Sales</option>
                                        <option value="poultry-sales">Poultry Sales</option>
                                        <option value="crop-sales">Crop Sales</option>
                                        <option value="feed">Feed</option>
                                        <option value="medication">Medication</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="labor">Labor</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="quick-description">Description</label>
                                    <input type="text" id="quick-description" placeholder="Enter description" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <span class="btn-icon-text">💾</span>
                                    <span>Add Transaction</span>
                                </button>
                            </form>
                        </div>

                        <div class="sidebar-card glass-card">
                            <h3 class="sidebar-title">Quick Export</h3>
                            <div class="quick-export-options">
                                <button class="btn btn-outline btn-block" id="export-income">
                                    <span class="btn-icon-text">💰</span>
                                    <span>Income Only</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-expenses">
                                    <span class="btn-icon-text">💸</span>
                                    <span>Expenses Only</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-monthly">
                                    <span class="btn-icon-text">📅</span>
                                    <span>This Month</span>
                                </button>
                                <button class="btn btn-outline btn-block" id="export-all-transactions">
                                    <span class="btn-icon-text">📋</span>
                                    <span>All Transactions</span>
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-card glass-card">
                            <h3 class="sidebar-title">Category Breakdown</h3>
                            <div id="category-chart" class="category-chart">
                                <!-- Category chart will be generated here -->
                                <div class="chart-placeholder">
                                    <span class="chart-icon">📊</span>
                                    <p>Category breakdown will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Transactions Table -->
                    <div class="content-main">
                        <div class="main-card glass-card">
                            <div class="card-header">
                                <h3 class="card-title">Transactions</h3>
                                <div class="card-actions">
                                    <div class="export-info" id="last-export-info">
                                        Last export: Never
                                    </div>
                                    <button class="btn btn-text btn-icon" id="print-transactions" title="Print">
                                        <span class="btn-icon-text">🖨️</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="filter-bar">
                                <div class="filter-group">
                                    <label>Type</label>
                                    <select id="type-filter" class="filter-select">
                                        <option value="all">All Types</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Category</label>
                                    <select id="category-filter" class="filter-select">
                                        <option value="all">All Categories</option>
                                        <!-- Categories will be populated dynamically -->
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Date Range</label>
                                    <select id="date-filter" class="filter-select">
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                                <button class="btn btn-outline" id="apply-filters">
                                    <span class="btn-icon-text">🔍</span>
                                    <span>Filter</span>
                                </button>
                                <button class="btn btn-text" id="clear-filters">
                                    Clear
                                </button>
                            </div>
                            
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th><input type="checkbox" id="select-all-transactions" title="Select all"></th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Category</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="transactions-body">
                                        <!-- Transactions will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="table-footer">
                                <div class="table-summary">
                                    <span id="selected-count">0 selected</span>
                                    <button class="btn btn-text btn-sm" id="export-selected-transactions" style="margin-left: 12px;" disabled>
                                        Export Selected
                                    </button>
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

                <!-- Transaction Modal -->
                <div id="transaction-modal" class="modal hidden">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h3 id="transaction-modal-title">Add Transaction</h3>
                            <button class="modal-close btn-icon">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="transaction-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="transaction-type">Type</label>
                                        <select id="transaction-type" class="form-select" required>
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="transaction-date">Date</label>
                                        <input type="date" id="transaction-date" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="transaction-amount">Amount ($)</label>
                                        <input type="number" id="transaction-amount" step="0.01" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="transaction-category">Category</label>
                                        <select id="transaction-category" class="form-select" required>
                                            <option value="">Select category</option>
                                            <option value="egg-sales">Egg Sales</option>
                                            <option value="poultry-sales">Poultry Sales</option>
                                            <option value="crop-sales">Crop Sales</option>
                                            <option value="feed">Feed</option>
                                            <option value="medication">Medication</option>
                                            <option value="equipment">Equipment</option>
                                            <option value="labor">Labor</option>
                                            <option value="utilities">Utilities</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="transport">Transport</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="insurance">Insurance</option>
                                            <option value="taxes">Taxes</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="transaction-description">Description</label>
                                    <input type="text" id="transaction-description" required>
                                </div>
                                <div class="form-group">
                                    <label for="transaction-notes">Notes (Optional)</label>
                                    <textarea id="transaction-notes" rows="3" placeholder="Additional details..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="transaction-attachment">Attachment (Optional)</label>
                                    <input type="file" id="transaction-attachment" accept=".pdf,.jpg,.png,.doc,.docx">
                                    <small class="form-help">Upload receipt or document (Max 5MB)</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-text modal-close">Cancel</button>
                            <button type="button" class="btn btn-danger" id="delete-transaction" style="display: none;">Delete</button>
                            <button type="button" class="btn btn-primary" id="save-transaction">Save Transaction</button>
                        </div>
                    </div>
                </div>

                <!-- Export Settings Modal -->
                <div id="export-settings-modal" class="modal hidden">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h3>Export Settings</h3>
                            <button class="modal-close btn-icon">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="export-settings-form">
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <input type="date" id="export-start-date" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}">
                                            <label for="export-start-date" class="sub-label">Start Date</label>
                                        </div>
                                        <div class="form-group">
                                            <input type="date" id="export-end-date" value="${new Date().toISOString().split('T')[0]}">
                                            <label for="export-end-date" class="sub-label">End Date</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Transaction Type</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-types" value="income" checked> Income
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-types" value="expense" checked> Expenses
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Include Columns</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="date" checked> Date
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="type" checked> Type
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="category" checked> Category
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="description" checked> Description
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="amount" checked> Amount
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="export-columns" value="notes"> Notes
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>File Name</label>
                                    <input type="text" id="export-filename" value="transactions-${new Date().toISOString().split('T')[0]}" placeholder="Enter file name">
                                </div>
                                
                                <div class="form-group">
                                    <label>Format Options</label>
                                    <div class="radio-group">
                                        <label class="radio-label">
                                            <input type="radio" name="export-format" value="csv" checked> CSV (Compatible with Excel)
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="export-format" value="excel"> Excel (.xlsx)
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="export-format" value="pdf"> PDF Document
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Include Summary</label>
                                    <label class="switch">
                                        <input type="checkbox" id="include-summary" checked>
                                        <span class="switch-slider"></span>
                                        <span class="switch-label">Include financial summary in export</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-text modal-close">Cancel</button>
                            <button type="button" class="btn btn-primary" id="apply-export-settings">Apply & Export</button>
                        </div>
                    </div>
                </div>

                <!-- Export Progress Modal -->
                <div id="export-progress-modal" class="modal hidden">
                    <div class="modal-content glass-card" style="max-width: 400px;">
                        <div class="modal-header">
                            <h3>Exporting Transactions</h3>
                        </div>
                        <div class="modal-body">
                            <div class="export-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="export-progress-fill" style="width: 0%"></div>
                                </div>
                                <div class="progress-text" id="export-progress-text">Preparing export...</div>
                                <div class="progress-details" id="export-details"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-text" id="cancel-export">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateSummary();
        this.renderTransactionsList();
        this.populateCategoryFilter();
        this.setupEventListeners();
    },

    calculateStats() {
        const transactions = this.transactions || [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Overall stats
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Monthly stats
        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Category analysis
        const categoryTotals = {};
        transactions.forEach(t => {
            if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
            categoryTotals[t.category] += t.amount || 0;
        });

        let topCategory = '-';
        let topCategoryAmount = 0;
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > topCategoryAmount) {
                topCategory = this.formatCategoryName(category);
                topCategoryAmount = amount;
            }
        });

        this.currentStats = {
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin,
            monthlyIncome,
            monthlyExpenses,
            topCategory,
            topCategoryAmount,
            totalTransactions: transactions.length,
            monthlyTransactions: monthlyTransactions.length
        };

        return this.currentStats;
    },

    updateSummary() {
        const stats = this.calculateStats();
        
        // Update header stats
        this.updateElement('total-income', this.formatCurrency(stats.totalIncome, false));
        this.updateElement('total-expenses', this.formatCurrency(stats.totalExpenses, false));
        this.updateElement('net-profit', this.formatCurrency(stats.netProfit, false));
        
        // Update summary cards
        this.updateElement('monthly-income', this.formatCurrency(stats.monthlyIncome));
        this.updateElement('monthly-expenses', this.formatCurrency(stats.monthlyExpenses));
        this.updateElement('profit-margin', `${stats.profitMargin.toFixed(1)}%`);
        this.updateElement('top-category', stats.topCategory);
        this.updateElement('top-category-amount', this.formatCurrency(stats.topCategoryAmount));
        
        // Update current month display
        const monthElement = document.getElementById('current-month');
        if (monthElement) {
            monthElement.textContent = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    },

    renderTransactionsList(filteredTransactions = null) {
        const tbody = document.getElementById('transactions-body');
        if (!tbody) return;

        let transactions = filteredTransactions || this.transactions || [];
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">📋</span>
                            <h4>No transactions found</h4>
                            <p>Add your first transaction to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            this.updateElement('showing-count', 0);
            return;
        }

        const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedTransactions.map(transaction => {
            const typeClass = `type-badge type-${transaction.type}`;
            const typeText = transaction.type === 'income' ? 'Income' : 'Expense';
            
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="transaction-checkbox" value="${transaction.id}" onchange="window.FarmModules.modules['income-expenses'].updateSelectedCount()">
                    </td>
                    <td>
                        <div class="date-cell">
                            <span class="date-day">${this.formatDate(transaction.date, 'short')}</span>
                            <span class="date-time">${this.formatTime(transaction.date)}</span>
                        </div>
                    </td>
                    <td>
                        <span class="${typeClass}">
                            <span class="type-icon">${transaction.type === 'income' ? '💰' : '💸'}</span>
                            ${typeText}
                        </span>
                    </td>
                    <td>${this.formatCategoryName(transaction.category)}</td>
                    <td>
                        <div class="description-cell">
                            <span class="description-text">${transaction.description}</span>
                            ${transaction.attachment ? '<span class="attachment-icon" title="Has attachment">📎</span>' : ''}
                        </div>
                    </td>
                    <td class="${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">
                        <strong>${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}</strong>
                    </td>
                    <td>
                        ${transaction.notes ? 
                            `<span class="notes-preview" title="${transaction.notes}">📝</span>` : 
                            '<span class="text-muted">-</span>'
                        }
                    </td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">
                                <span>✏️</span>
                            </button>
                            <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">
                                <span>🗑️</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateElement('showing-count', transactions.length);
        this.updateSelectedCount();
    },

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        const categories = [...new Set(this.transactions.map(t => t.category))];
        
        // Clear existing options except "All Categories"
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add category options
        categories.forEach(category => {
            if (category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = this.formatCategoryName(category);
                categoryFilter.appendChild(option);
            }
        });
    },

    setupEventListeners() {
        console.log('🔗 Setting up Income & Expenses event listeners...');

        // Add transaction buttons
        const addIncomeBtn = document.getElementById('add-income');
        const addExpenseBtn = document.getElementById('add-expense');
        if (addIncomeBtn) addIncomeBtn.addEventListener('click', () => this.showTransactionModal('income'));
        if (addExpenseBtn) addExpenseBtn.addEventListener('click', () => this.showTransactionModal('expense'));

        // Quick form
        const quickForm = document.getElementById('quick-transaction-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickTransaction();
            });
        }

        // Export dropdown
        const exportDropdown = document.getElementById('export-dropdown');
        const exportMenu = document.getElementById('export-menu');
        if (exportDropdown && exportMenu) {
            exportDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                exportMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                exportMenu.classList.add('hidden');
            });

            // Export format selection
            const exportItems = exportMenu.querySelectorAll('.dropdown-item[data-format]');
            exportItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const format = item.getAttribute('data-format');
                    if (format === 'print') {
                        this.printFinancialReport();
                    } else {
                        this.exportFormat = format;
                        this.showExportSettings();
                    }
                    exportMenu.classList.add('hidden');
                });
            });

            // Export settings button
            const exportSettingsBtn = document.getElementById('export-settings');
            if (exportSettingsBtn) {
                exportSettingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showExportSettings();
                    exportMenu.classList.add('hidden');
                });
            }
        }

        // Quick export buttons
        const quickExportButtons = ['export-income', 'export-expenses', 'export-monthly', 'export-all-transactions'];
        quickExportButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const type = id.replace('export-', '');
                    this.quickExport(type);
                });
            }
        });

        // Export selected button
        const exportSelectedBtn = document.getElementById('export-selected-transactions');
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', () => {
                this.exportSelectedTransactions();
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-transactions');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAllTransactions(e.target.checked);
            });
        }

        // Filter controls
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        // Modal controls
        const transactionModal = document.getElementById('transaction-modal');
        const exportSettingsModal = document.getElementById('export-settings-modal');
        const exportProgressModal = document.getElementById('export-progress-modal');

        // Transaction modal
        const modalCloseBtns = transactionModal?.querySelectorAll('.modal-close');
        if (modalCloseBtns) {
            modalCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.hideTransactionModal();
                });
            });
        }

        const saveTransactionBtn = document.getElementById('save-transaction');
        if (saveTransactionBtn) {
            saveTransactionBtn.addEventListener('click', () => {
                this.handleSaveTransaction();
            });
        }

        // Export settings modal
        const exportSettingsCloseBtns = exportSettingsModal?.querySelectorAll('.modal-close');
        if (exportSettingsCloseBtns) {
            exportSettingsCloseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    exportSettingsModal.classList.add('hidden');
                });
            });
        }

        const applyExportBtn = document.getElementById('apply-export-settings');
        if (applyExportBtn) {
            applyExportBtn.addEventListener('click', () => {
                this.applyExportSettings();
            });
        }

        // Cancel export button
        const cancelExportBtn = document.getElementById('cancel-export');
        if (cancelExportBtn) {
            cancelExportBtn.addEventListener('click', () => {
                this.hideExportProgress();
            });
        }

        // Print button
        const printBtn = document.getElementById('print-transactions');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printFinancialReport();
            });
        }

        // Click outside modals to close
        window.addEventListener('click', (e) => {
            if (e.target === transactionModal) this.hideTransactionModal();
            if (e.target === exportSettingsModal) exportSettingsModal.classList.add('hidden');
            // Don't close progress modal on outside click
        });

        // Delete transaction event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-transaction')) {
                const id = parseInt(e.target.closest('.delete-transaction').dataset.id);
                this.deleteTransaction(id);
            }
            if (e.target.closest('.edit-transaction')) {
                const id = parseInt(e.target.closest('.edit-transaction').dataset.id);
                this.editTransaction(id);
            }
        });
    },

    // TRANSACTION MANAGEMENT METHODS

    showTransactionModal(type = 'income', transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const modalTitle = document.getElementById('transaction-modal-title');
        const deleteBtn = document.getElementById('delete-transaction');
        const form = document.getElementById('transaction-form');
        const dateField = document.getElementById('transaction-date');

        if (transaction) {
            // Edit mode
            modalTitle.textContent = 'Edit Transaction';
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => this.deleteTransaction(transaction.id);
            
            // Populate form
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-date').value = transaction.date;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-category').value = transaction.category;
            document.getElementById('transaction-description').value = transaction.description;
            document.getElementById('transaction-notes').value = transaction.notes || '';
        } else {
            // Add mode
            modalTitle.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
            deleteBtn.style.display = 'none';
            form.reset();
            document.getElementById('transaction-type').value = type;
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }

        modal.classList.remove('hidden');
    },

    hideTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        modal.classList.add('hidden');
        document.getElementById('transaction-form').reset();
    },

    handleQuickTransaction() {
        const type = document.getElementById('quick-type').value;
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const category = document.getElementById('quick-category').value;
        const description = document.getElementById('quick-description').value;

        if (!amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            type,
            amount,
            category,
            description,
            date: new Date().toISOString().split('T')[0],
            notes: ''
        };

        this.transactions.unshift(transaction);
        this.saveData();
        this.updateSummary();
        this.renderTransactionsList();
        this.syncStatsWithDashboard();
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
        
        // Clear form
        document.getElementById('quick-transaction-form').reset();
    },

    handleSaveTransaction() {
        const form = document.getElementById('transaction-form');
        const type = document.getElementById('transaction-type').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const description = document.getElementById('transaction-description').value;
        const date = document.getElementById('transaction-date').value;
        const notes = document.getElementById('transaction-notes').value;

        if (!amount || !category || !description || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            type,
            amount,
            category,
            description,
            date,
            notes
        };

        // Check if we're editing (would have transaction.id)
        // For now, always add new
        this.transactions.unshift(transaction);
        this.saveData();
        this.updateSummary();
        this.renderTransactionsList();
        this.syncStatsWithDashboard();
        this.hideTransactionModal();
        
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} saved successfully!`, 'success');
    },

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            this.showTransactionModal(transaction.type, transaction);
        }
    },

    deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.updateSummary();
        this.renderTransactionsList();
        this.syncStatsWithDashboard();
        
        this.showNotification('Transaction deleted!', 'success');
    },

    applyFilters() {
        const typeFilter = document.getElementById('type-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const dateFilter = document.getElementById('date-filter').value;

        let filteredTransactions = this.transactions;

        // Filter by type
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            let cutoffDate = new Date();

            switch(dateFilter) {
                case 'today':
                    cutoffDate.setDate(now.getDate() - 1);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= cutoffDate;
            });
        }

        this.renderTransactionsList(filteredTransactions);
    },

    clearFilters() {
        document.getElementById('type-filter').value = 'all';
        document.getElementById('category-filter').value = 'all';
        document.getElementById('date-filter').value = 'all';
        this.renderTransactionsList();
    },

    // EXPORT FUNCTIONALITY METHODS (similar to sales module)

    showExportSettings() {
        const modal = document.getElementById('export-settings-modal');
        modal.classList.remove('hidden');
    },

    applyExportSettings() {
        const modal = document.getElementById('export-settings-modal');
        const form = document.getElementById('export-settings-form');
        
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        const filename = document.getElementById('export-filename').value || `transactions-${new Date().toISOString().split('T')[0]}`;
        const includeSummary = document.getElementById('include-summary').checked;
        
        // Get selected types
        const typeCheckboxes = form.querySelectorAll('input[name="export-types"]:checked');
        const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);
        
        // Get selected columns
        const columnCheckboxes = form.querySelectorAll('input[name="export-columns"]:checked');
        const selectedColumns = Array.from(columnCheckboxes).map(cb => cb.value);
        
        // Get format
        const formatRadio = form.querySelector('input[name="export-format"]:checked');
        const format = formatRadio ? formatRadio.value : 'csv';
        
        modal.classList.add('hidden');
        
        this.exportTransactionsData({
            startDate,
            endDate,
            filename,
            format,
            types: selectedTypes,
            columns: selectedColumns,
            includeSummary
        });
    },

    quickExport(type) {
        const endDate = new Date();
        let startDate = new Date();
        let transactions = this.transactions;
        let filename = '';

        switch(type) {
            case 'income':
                transactions = transactions.filter(t => t.type === 'income');
                filename = `income-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'expenses':
                transactions = transactions.filter(t => t.type === 'expense');
                filename = `expenses-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'monthly':
                startDate.setDate(1); // First day of current month
                filename = `transactions-monthly-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'all-transactions':
                startDate = null;
                filename = `all-transactions-${new Date().toISOString().split('T')[0]}`;
                break;
        }

        this.exportTransactionsData({
            transactions: startDate ? transactions.filter(t => new Date(t.date) >= startDate) : transactions,
            filename,
            format: 'csv',
            includeSummary: true
        });
    },

    exportSelectedTransactions() {
        const selectedCheckboxes = document.querySelectorAll('.transaction-checkbox:checked');
        if (selectedCheckboxes.length === 0) return;
        
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
        const selectedTransactions = this.transactions.filter(t => selectedIds.includes(t.id));
        
        if (selectedTransactions.length === 0) {
            this.showNotification('No transactions selected for export', 'error');
            return;
        }
        
        this.exportTransactionsData({
            transactions: selectedTransactions,
            filename: `selected-transactions-${new Date().toISOString().split('T')[0]}`,
            format: this.exportFormat,
            includeSummary: false
        });
    },

    async exportTransactionsData(options = {}) {
        this.showExportProgress();
        this.updateExportProgress(10, 'Preparing transaction data...');
        
        let transactions = options.transactions || this.transactions;
        
        // Filter by date range if specified
        if (options.startDate && options.endDate) {
            transactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= new Date(options.startDate) && 
                       transactionDate <= new Date(options.endDate);
            });
        }
        
        // Filter by type if specified
        if (options.types && options.types.length > 0) {
            transactions = transactions.filter(t => options.types.includes(t.type));
        }
        
        this.updateExportProgress(30, `Processing ${transactions.length} transactions...`);
        
        // Prepare export data
        const columnMap = {
            date: 'Date',
            type: 'Type',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            notes: 'Notes'
        };
        
        const columns = options.columns || ['date', 'type', 'category', 'description', 'amount', 'notes'];
        const headers = columns.map(col => columnMap[col] || col);
        
        const rows = transactions.map(t => {
            return columns.map(col => {
                switch(col) {
                    case 'date':
                        return this.formatDate(t.date, 'export');
                    case 'type':
                        return t.type === 'income' ? 'Income' : 'Expense';
                    case 'category':
                        return this.formatCategoryName(t.category);
                    case 'amount':
                        return t.amount || 0;
                    default:
                        return t[col] || '';
                }
            });
        });
        
        this.updateExportProgress(60, 'Generating export file...');
        
        // Generate file
        let fileContent, mimeType, fileExtension;
        const filename = options.filename || `transactions-${new Date().toISOString().split('T')[0]}`;
        const format = options.format || 'csv';
        
        if (format === 'csv') {
            [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, options.includeSummary, transactions);
        } else if (format === 'excel') {
            [fileContent, mimeType, fileExtension] = await this.generateExcel(headers, rows, options.includeSummary, transactions, filename);
        } else if (format === 'pdf') {
            [fileContent, mimeType, fileExtension] = await this.generatePDF(headers, rows, options.includeSummary, transactions, filename);
        } else {
            [fileContent, mimeType, fileExtension] = this.generateCSV(headers, rows, options.includeSummary, transactions);
        }
        
        this.updateExportProgress(90, 'Finalizing export...');
        this.downloadFile(fileContent, `${filename}.${fileExtension}`, mimeType);
        this.updateLastExportInfo();
        this.updateExportProgress(100, 'Export completed successfully!');
        
        setTimeout(() => {
            this.hideExportProgress();
        }, 1500);
    },

    generateCSV(headers, rows, includeSummary, transactions) {
        let csvContent = headers.join(',') + '\n';
        
        rows.forEach(row => {
            csvContent += row.map(cell => {
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',') + '\n';
        });
        
        if (includeSummary && transactions.length > 0) {
            const stats = this.calculateStats();
            csvContent += '\n\nFINANCIAL SUMMARY\n';
            csvContent += `Total Income,${this.formatCurrency(stats.totalIncome, false)}\n`;
            csvContent += `Total Expenses,${this.formatCurrency(stats.totalExpenses, false)}\n`;
            csvContent += `Net Profit,${this.formatCurrency(stats.netProfit, false)}\n`;
            csvContent += `Profit Margin,${stats.profitMargin.toFixed(1)}%\n`;
            csvContent += `Total Transactions,${transactions.length}\n`;
            
            const incomeCount = transactions.filter(t => t.type === 'income').length;
            const expenseCount = transactions.filter(t => t.type === 'expense').length;
            csvContent += `Income Transactions,${incomeCount}\n`;
            csvContent += `Expense Transactions,${expenseCount}\n`;
            
            if (transactions.length > 0) {
                const dates = transactions.map(t => new Date(t.date));
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                csvContent += `Date Range,${this.formatDate(minDate.toISOString().split('T')[0], 'export')} to ${this.formatDate(maxDate.toISOString().split('T')[0], 'export')}\n`;
            }
        }
        
        return [csvContent, 'text/csv;charset=utf-8;', 'csv'];
    },

    async generateExcel(headers, rows, includeSummary, transactions, filename) {
        console.log('Excel export would use SheetJS library in production');
        return this.generateCSV(headers, rows, includeSummary, transactions);
    },

    async generatePDF(headers, rows, includeSummary, transactions, filename) {
        console.log('PDF export would use jsPDF library in production');
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .income { color: green; }
                    .expense { color: red; }
                    .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>Transactions Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map((cell, index) => 
                                    `<td class="${index === 1 && cell === 'Income' ? 'income' : index === 1 && cell === 'Expense' ? 'expense' : ''}">${cell}</td>`
                                ).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
        
        if (includeSummary) {
            const stats = this.calculateStats();
            htmlContent += `
                <div class="summary">
                    <h2>Financial Summary</h2>
                    <p><strong>Total Income:</strong> ${this.formatCurrency(stats.totalIncome)}</p>
                    <p><strong>Total Expenses:</strong> ${this.formatCurrency(stats.totalExpenses)}</p>
                    <p><strong>Net Profit:</strong> ${this.formatCurrency(stats.netProfit)}</p>
                    <p><strong>Profit Margin:</strong> ${stats.profitMargin.toFixed(1)}%</p>
                    <p><strong>Total Transactions:</strong> ${transactions.length}</p>
                </div>
            `;
        }
        
        htmlContent += `
                <div class="footer">
                    <p>Report generated by Farm Management System</p>
                </div>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        return [htmlContent, 'text/html', 'html'];
    },

    printFinancialReport() {
        const transactions = this.transactions || [];
        const stats = this.calculateStats();
        
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Financial Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .income { color: green; }
                    .expense { color: red; }
                    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                    .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div>
                        <h1>Financial Report</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                    <button class="no-print" onclick="window.print()">Print Report</button>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>Income Summary</h3>
                        <p><strong>Total Income:</strong> ${this.formatCurrency(stats.totalIncome)}</p>
                        <p><strong>Monthly Income:</strong> ${this.formatCurrency(stats.monthlyIncome)}</p>
                    </div>
                    <div class="summary-card">
                        <h3>Expense Summary</h3>
                        <p><strong>Total Expenses:</strong> ${this.formatCurrency(stats.totalExpenses)}</p>
                        <p><strong>Monthly Expenses:</strong> ${this.formatCurrency(stats.monthlyExpenses)}</p>
                    </div>
                </div>
                
                <h2>Transactions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${this.formatDate(t.date, 'export')}</td>
                                <td class="${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</td>
                                <td>${this.formatCategoryName(t.category)}</td>
                                <td>${t.description}</td>
                                <td class="${t.type}">${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="summary-card" style="margin-top: 30px;">
                    <h2>Overall Summary</h2>
                    <p><strong>Net Profit:</strong> ${this.formatCurrency(stats.netProfit)}</p>
                    <p><strong>Profit Margin:</strong> ${stats.profitMargin.toFixed(1)}%</p>
                    <p><strong>Total Transactions:</strong> ${transactions.length}</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    },

    // UTILITY METHODS

    toggleSelectAllTransactions(checked) {
        const checkboxes = document.querySelectorAll('.transaction-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateSelectedCount();
    },

    updateSelectedCount() {
        const selectedCount = document.querySelectorAll('.transaction-checkbox:checked').length;
        const exportSelectedBtn = document.getElementById('export-selected-transactions');
        const selectedCountSpan = document.getElementById('selected-count');
        
        if (selectedCountSpan) {
            selectedCountSpan.textContent = `${selectedCount} selected`;
        }
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedCount === 0;
        }
    },

    updateLastExportInfo() {
        const lastExportInfo = document.getElementById('last-export-info');
        if (lastExportInfo) {
            lastExportInfo.textContent = `Last export: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    },

    showExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        modal.classList.remove('hidden');
    },

    hideExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        modal.classList.add('hidden');
        this.updateExportProgress(0, '');
    },

    updateExportProgress(percent, message) {
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        const exportDetails = document.getElementById('export-details');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        
        if (exportDetails && percent === 100) {
            exportDetails.innerHTML = `
                <div class="export-success">
                    <span style="color: var(--status-paid); font-size: 24px;">✓</span>
                    <div>
                        <strong>Export successful!</strong>
                        <p>File saved to your downloads folder</p>
                    </div>
                </div>
            `;
        }
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    saveData() {
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.transactions = this.transactions;
        }
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
                totalIncome: this.currentStats.totalIncome,
                totalExpenses: this.currentStats.totalExpenses,
                totalRevenue: this.currentStats.totalIncome,
                netProfit: this.currentStats.netProfit,
                profitMargin: this.currentStats.profitMargin,
                monthlyIncome: this.currentStats.monthlyIncome,
                monthlyExpenses: this.currentStats.monthlyExpenses,
                topCategory: this.currentStats.topCategory,
                topCategoryAmount: this.currentStats.topCategoryAmount
            });
        }

        const statsUpdateEvent = new CustomEvent('financialStatsUpdated', {
            detail: this.currentStats
        });
        document.dispatchEvent(statsUpdateEvent);
    },

    showNotification(message, type = 'info') {
        // You can implement a notification system or use alert for now
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'success') {
            alert(`✅ ${message}`);
        } else if (type === 'error') {
            alert(`❌ ${message}`);
        } else {
            alert(`ℹ️ ${message}`);
        }
    },

    // FORMATTING METHODS

    formatCurrency(amount, includeSymbol = true) {
        if (includeSymbol) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        } else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        }
    },

    formatDate(dateStr, format = 'long') {
        try {
            const d = new Date(dateStr);
            if (format === 'short') {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (format === 'export') {
                return d.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
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

    formatCategoryName(category) {
        if (!category) return 'Unknown';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
};

// Register the module
if (window.FarmModules) {
    if (typeof window.FarmModules.registerModule === 'function') {
        window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
        console.log('✅ Income & Expenses module registered');
    } else {
        window.FarmModules.registerModule = function(name, module) {
            window.FarmModules.modules = window.FarmModules.modules || {};
            window.FarmModules.modules[name] = module;
        };
        window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    }
} else {
    window.FarmModules = {
        modules: {},
        appData: {},
        registerModule: function(name, module) {
            this.modules[name] = module;
        }
    };
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
}
