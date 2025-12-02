// modules/income-expenses.js - USING MODAL MANAGER
console.log('Loading income-expenses module with Modal Manager...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],
    element: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Load CSS if not already loaded
        this.loadCSS();

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        this.syncStatsWithDashboard();
        
        console.log('✅ Income & Expenses initialized');
        return true;
    },

    loadCSS() {
        // Check if module CSS is already loaded
        if (document.querySelector('link[href*="income-expenses.css"]')) {
            return;
        }
        
        // Create link element for module-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/income-expenses.css';
        document.head.appendChild(link);
    },

    loadData() {
        // Load from localStorage or use demo data
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { id: 1, type: 'income', amount: 1500, category: 'egg-sales', description: 'Egg sales March', date: '2024-03-15' },
            { id: 2, type: 'expense', amount: 200, category: 'feed', description: 'Chicken feed', date: '2024-03-14' },
            { id: 3, type: 'income', amount: 800, category: 'poultry-sales', description: 'Broiler sales', date: '2024-03-10' },
            { id: 4, type: 'expense', amount: 150, category: 'medication', description: 'Vaccines', date: '2024-03-08' },
            { id: 5, type: 'income', amount: 350, category: 'crop-sales', description: 'Vegetable sales', date: '2024-03-05' }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container">
                <!-- Modern Header -->
                <div class="ie-module-header">
                    <div class="ie-header-content">
                        <div class="ie-header-text">
                            <h1 class="ie-module-title">Income & Expenses</h1>
                            <p class="ie-module-subtitle">Track your farm's financial health</p>
                        </div>
                        <div class="ie-header-stats">
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">📈</span>
                                <span class="ie-stat-value" id="total-income">${this.formatCurrency(stats.totalIncome, false)}</span>
                                <span class="ie-stat-label">Total Income</span>
                            </div>
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">📊</span>
                                <span class="ie-stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses, false)}</span>
                                <span class="ie-stat-label">Total Expenses</span>
                            </div>
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">💰</span>
                                <span class="ie-stat-value" id="net-profit" style="color: ${stats.netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">
                                    ${this.formatCurrency(stats.netProfit, false)}
                                </span>
                                <span class="ie-stat-label">Net Profit</span>
                            </div>
                        </div>
                    </div>
                    <div class="ie-header-actions">
                        <button class="btn btn-primary" id="add-income-btn">
                            <span>💰 Add Income</span>
                        </button>
                        <button class="btn btn-outline" id="add-expense-btn">
                            <span>💸 Add Expense</span>
                        </button>
                    </div>
                </div>

                <!-- Financial Summary Cards -->
                <div class="ie-financial-summary">
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">📈</div>
                        <div class="ie-summary-content">
                            <h3>Monthly Income</h3>
                            <div class="ie-summary-value" id="monthly-income">${this.formatCurrency(this.getMonthlyIncome())}</div>
                            <div class="ie-summary-period">This Month</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">📊</div>
                        <div class="ie-summary-content">
                            <h3>Monthly Expenses</h3>
                            <div class="ie-summary-value" id="monthly-expenses">${this.formatCurrency(this.getMonthlyExpenses())}</div>
                            <div class="ie-summary-period">This Month</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">💰</div>
                        <div class="ie-summary-content">
                            <h3>Profit Margin</h3>
                            <div class="ie-summary-value" id="profit-margin">${stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) + '%' : '0%'}</div>
                            <div class="ie-summary-period">Efficiency</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">🎯</div>
                        <div class="ie-summary-content">
                            <h3>Top Category</h3>
                            <div class="ie-summary-value" id="top-category">${this.getTopCategory()}</div>
                            <div class="ie-summary-period">${this.formatCurrency(this.getTopCategoryAmount())}</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="ie-quick-action-grid">
                    <button class="ie-quick-action-btn" id="quick-income-btn">
                        <div class="ie-quick-action-icon">💰</div>
                        <span class="ie-quick-action-title">Quick Income</span>
                        <span class="ie-quick-action-desc">Record income instantly</span>
                    </button>
                    <button class="ie-quick-action-btn" id="quick-expense-btn">
                        <div class="ie-quick-action-icon">💸</div>
                        <span class="ie-quick-action-title">Quick Expense</span>
                        <span class="ie-quick-action-desc">Record expense instantly</span>
                    </button>
                    <button class="ie-quick-action-btn" id="view-reports-btn">
                        <div class="ie-quick-action-icon">📊</div>
                        <span class="ie-quick-action-title">View Reports</span>
                        <span class="ie-quick-action-desc">Financial analytics</span>
                    </button>
                    <button class="ie-quick-action-btn" id="export-data-btn">
                        <div class="ie-quick-action-icon">📤</div>
                        <span class="ie-quick-action-title">Export Data</span>
                        <span class="ie-quick-action-desc">Export transactions</span>
                    </button>
                </div>

                <!-- Transaction Form (Hidden by default) -->
                <div id="transaction-form-container" class="ie-hidden">
                    <div class="ie-form-container">
                        <h3 class="ie-form-title" id="form-title">Add Transaction</h3>
                        <form id="transaction-form">
                            <div class="ie-form-row">
                                <div class="ie-form-group">
                                    <label class="ie-form-label">Type</label>
                                    <select class="ie-form-input" id="transaction-type" required>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div class="ie-form-group">
                                    <label class="ie-form-label">Amount</label>
                                    <input type="number" class="ie-form-input" id="transaction-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="ie-form-group">
                                <label class="ie-form-label">Category</label>
                                <select class="ie-form-input" id="transaction-category" required>
                                    <option value="">Select category</option>
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
                            <div class="ie-form-group">
                                <label class="ie-form-label">Description</label>
                                <input type="text" class="ie-form-input" id="transaction-description" required>
                            </div>
                            <div class="ie-form-group">
                                <label class="ie-form-label">Date</label>
                                <input type="date" class="ie-form-input" id="transaction-date" required>
                            </div>
                            <div class="ie-form-actions">
                                <button type="submit" class="btn btn-primary">Save Transaction</button>
                                <button type="button" class="btn btn-outline" id="cancel-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="ie-transactions-card">
                    <div class="ie-card-header">
                        <h3 class="ie-card-title">Recent Transactions</h3>
                        <button class="btn btn-outline" id="clear-all">Clear All</button>
                    </div>
                    <div id="transactions-list">
                        ${this.renderTransactionsList()}
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    },

    // ==================== MODAL METHODS ====================
    showQuickIncomeModal() {
        ModalManager.createQuickForm({
            id: 'quick-income-modal',
            title: 'Quick Income',
            subtitle: 'Record a new income transaction',
            fields: [
                {
                    name: 'amount',
                    type: 'number',
                    label: 'Amount (USD)',
                    required: true,
                    large: true,
                    min: 0,
                    step: 0.01,
                    placeholder: '0.00',
                    autofocus: true,
                    note: 'Enter the income amount'
                },
                {
                    name: 'category',
                    type: 'category',
                    label: 'Category',
                    required: true,
                    defaultValue: 'other',
                    categories: [
                        { value: 'egg-sales', label: 'Egg Sales' },
                        { value: 'poultry-sales', label: 'Poultry Sales' },
                        { value: 'crop-sales', label: 'Crop Sales' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'description',
                    type: 'text',
                    label: 'Description (Optional)',
                    required: false,
                    placeholder: 'Brief description'
                }
            ],
            onSubmit: (data) => {
                const transaction = {
                    id: Date.now(),
                    type: 'income',
                    amount: data.amount,
                    category: data.category,
                    description: data.description || 'Quick Income Entry',
                    date: new Date().toISOString().split('T')[0]
                };
                
                this.addQuickTransaction(transaction);
            }
        });
    },

    showQuickExpenseModal() {
        ModalManager.createQuickForm({
            id: 'quick-expense-modal',
            title: 'Quick Expense',
            subtitle: 'Record a new expense transaction',
            fields: [
                {
                    name: 'amount',
                    type: 'number',
                    label: 'Amount (USD)',
                    required: true,
                    large: true,
                    min: 0,
                    step: 0.01,
                    placeholder: '0.00',
                    autofocus: true,
                    note: 'Enter the expense amount'
                },
                {
                    name: 'category',
                    type: 'category',
                    label: 'Category',
                    required: true,
                    defaultValue: 'other',
                    categories: [
                        { value: 'feed', label: 'Feed' },
                        { value: 'medication', label: 'Medication' },
                        { value: 'equipment', label: 'Equipment' },
                        { value: 'labor', label: 'Labor' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'description',
                    type: 'text',
                    label: 'Description (Optional)',
                    required: false,
                    placeholder: 'Brief description'
                }
            ],
            onSubmit: (data) => {
                const transaction = {
                    id: Date.now(),
                    type: 'expense',
                    amount: data.amount,
                    category: data.category,
                    description: data.description || 'Quick Expense Entry',
                    date: new Date().toISOString().split('T')[0]
                };
                
                this.addQuickTransaction(transaction);
            }
        });
    },

    showViewReportsModal() {
        const stats = this.calculateStats();
        const monthlyIncome = this.getMonthlyIncome();
        const monthlyExpenses = this.getMonthlyExpenses();
        
        ModalManager.showReports({
            title: 'Financial Reports',
            subtitle: 'Select a report to generate',
            reports: [
                {
                    id: 'profit-loss',
                    icon: '📊',
                    title: 'Profit & Loss',
                    description: 'Income vs expenses report',
                    preview: `
                        <h4 class="font-semibold mb-2">Profit & Loss Report</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Total Income:</span>
                                <span class="font-semibold text-success">${this.formatCurrency(stats.totalIncome)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Total Expenses:</span>
                                <span class="font-semibold text-danger">${this.formatCurrency(stats.totalExpenses)}</span>
                            </div>
                            <div class="flex justify-between border-t pt-2">
                                <span>Net Profit:</span>
                                <span class="font-semibold ${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}">
                                    ${this.formatCurrency(stats.netProfit)}
                                </span>
                            </div>
                        </div>
                    `
                },
                {
                    id: 'monthly-trends',
                    icon: '📈',
                    title: 'Monthly Trends',
                    description: 'Income/expense trends',
                    preview: `
                        <h4 class="font-semibold mb-2">Monthly Trends Report</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>This Month Income:</span>
                                <span class="font-semibold text-success">${this.formatCurrency(monthlyIncome)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>This Month Expenses:</span>
                                <span class="font-semibold text-danger">${this.formatCurrency(monthlyExpenses)}</span>
                            </div>
                            <p class="text-tertiary text-sm mt-2">Shows trends over the last 12 months</p>
                        </div>
                    `
                },
                {
                    id: 'category-breakdown',
                    icon: '🧮',
                    title: 'Category Breakdown',
                    description: 'By income/expense type',
                    preview: `
                        <h4 class="font-semibold mb-2">Category Breakdown</h4>
                        <p class="text-tertiary">Breakdown of transactions by category.</p>
                        <p class="text-tertiary text-sm mt-2">Top Category: ${this.getTopCategory()}</p>
                    `
                },
                {
                    id: 'yearly-summary',
                    icon: '📅',
                    title: 'Yearly Summary',
                    description: 'Annual performance',
                    preview: `
                        <h4 class="font-semibold mb-2">Yearly Summary Report</h4>
                        <p class="text-tertiary">Annual performance report for the current year.</p>
                    `
                },
                {
                    id: 'export-data',
                    icon: '📤',
                    title: 'Export Data',
                    description: 'Download all data',
                    buttonText: 'Export Data',
                    preview: `
                        <h4 class="font-semibold mb-2">Export Data</h4>
                        <p class="text-tertiary">Export all transaction data as JSON, CSV, or PDF.</p>
                        <p class="text-tertiary text-sm mt-2">Total Transactions: ${this.transactions.length}</p>
                    `
                },
                {
                    id: 'print-report',
                    icon: '🖨️',
                    title: 'Print Report',
                    description: 'Printable version',
                    buttonText: 'Print Report',
                    preview: `
                        <h4 class="font-semibold mb-2">Print Report</h4>
                        <p class="text-tertiary">Generate a printer-friendly version of the selected report.</p>
                    `
                }
            ],
            onReportSelect: (reportId) => {
                switch(reportId) {
                    case 'export-data':
                        this.exportData();
                        break;
                    case 'print-report':
                        window.print();
                        break;
                    default:
                        this.generateReport(reportId);
                }
            }
        });
    },

    generateReport(reportType) {
        // Show loading modal
        const loadingId = ModalManager.showLoading({
            message: `Generating ${reportType.replace('-', ' ')} report...`
        });
        
        // Simulate report generation
        setTimeout(() => {
            ModalManager.hideLoading();
            
            // Show success alert
            ModalManager.alert({
                title: 'Report Generated',
                message: `The ${reportType.replace('-', ' ')} report has been generated successfully.`,
                icon: '✅',
                type: 'modal-success'
            });
            
            // Here you would implement actual report generation logic
            // For example, generate PDF, show in new window, etc.
            console.log(`Generating report: ${reportType}`);
        }, 1500);
    },

    // ==================== SETUP EVENT LISTENERS ====================
    setupEventListeners() {
        // Add transaction buttons
        document.getElementById('add-income-btn')?.addEventListener('click', () => this.showTransactionForm('income'));
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.showTransactionForm('expense'));
        
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.showQuickIncomeModal());
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.showQuickExpenseModal());
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.showViewReportsModal());
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        
        // Form handlers
        document.getElementById('transaction-form')?.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('cancel-form')?.addEventListener('click', () => this.hideTransactionForm());
        
        // Clear all button with confirmation modal
        document.getElementById('clear-all')?.addEventListener('click', () => {
            ModalManager.confirm({
                title: 'Clear All Transactions',
                message: 'Are you sure you want to clear all transactions?',
                details: 'This action cannot be undone.',
                icon: '⚠️',
                type: 'modal-danger',
                danger: true,
                confirmText: 'Clear All'
            }).then((confirmed) => {
                if (confirmed) {
                    this.clearAllTransactions();
                }
            });
        });
        
        // Delete buttons with confirmation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ie-delete-btn')) {
                const id = parseInt(e.target.closest('.ie-delete-btn').dataset.id);
                const transaction = this.transactions.find(t => t.id === id);
                
                if (transaction) {
                    ModalManager.confirm({
                        title: 'Delete Transaction',
                        message: `Are you sure you want to delete this ${transaction.type}?`,
                        details: `${transaction.description} - ${this.formatCurrency(transaction.amount)}`,
                        icon: '🗑️',
                        type: 'modal-warning',
                        confirmText: 'Delete'
                    }).then((confirmed) => {
                        if (confirmed) {
                            this.deleteTransaction(id);
                        }
                    });
                }
            }
        });

        // Hover effects for quick action buttons
        const quickActionButtons = document.querySelectorAll('.ie-quick-action-btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    // ==================== REST OF YOUR METHODS (keep them exactly as they were) ====================
    calculateStats() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        return {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            totalTransactions: this.transactions.length
        };
    },

    getMonthlyIncome() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.transactions
            .filter(t => {
                if (t.type !== 'income') return false;
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    getMonthlyExpenses() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.transactions
            .filter(t => {
                if (t.type !== 'expense') return false;
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    getTopCategory() {
        const categoryTotals = {};
        this.transactions.forEach(t => {
            if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
            categoryTotals[t.category] += t.amount || 0;
        });
        
        let topCategory = 'None';
        let topAmount = 0;
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > topAmount) {
                topCategory = this.formatCategoryName(category);
                topAmount = amount;
            }
        });
        
        return topCategory;
    },

    getTopCategoryAmount() {
        const categoryTotals = {};
        this.transactions.forEach(t => {
            if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
            categoryTotals[t.category] += t.amount || 0;
        });
        
        let topAmount = 0;
        Object.values(categoryTotals).forEach(amount => {
            if (amount > topAmount) topAmount = amount;
        });
        
        return topAmount;
    },

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return `
                <div class="ie-empty-state">
                    <div class="ie-empty-content">
                        <span class="ie-empty-icon">📋</span>
                        <h4>No transactions yet</h4>
                        <p>Add your first transaction to get started</p>
                    </div>
                </div>
            `;
        }

        const recentTransactions = this.transactions.slice(0, 10);

        return `
            <div class="ie-transactions-list">
                ${recentTransactions.map(transaction => `
                    <div class="ie-transaction-item">
                        <div class="ie-transaction-icon">${transaction.type === 'income' ? '💰' : '💸'}</div>
                        <div class="ie-transaction-details">
                            <div class="ie-transaction-description">${transaction.description}</div>
                            <div class="ie-transaction-meta">
                                <span class="transaction-category">${this.formatCategoryName(transaction.category)}</span>
                                <span class="transaction-date">${transaction.date}</span>
                            </div>
                        </div>
                        <div class="ie-transaction-amount ${transaction.type}">
                            <span>${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}</span>
                            <button class="ie-delete-btn" data-id="${transaction.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showTransactionForm(type) {
        const formContainer = document.getElementById('transaction-form-container');
        const formTitle = document.getElementById('form-title');
        const typeSelect = document.getElementById('transaction-type');
        const dateInput = document.getElementById('transaction-date');
        
        formTitle.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
        typeSelect.value = type;
        dateInput.value = new Date().toISOString().split('T')[0];
        
        formContainer.classList.remove('ie-hidden');
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transactions exported successfully!', 'success');
        }
    },

    addQuickTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveData();
        this.renderModule();
        this.syncStatsWithDashboard();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction added successfully!', 'success');
        }
    },

    hideTransactionForm() {
        document.getElementById('transaction-form-container').classList.add('ie-hidden');
        document.getElementById('transaction-form').reset();
    },

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            type: document.getElementById('transaction-type').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            description: document.getElementById('transaction-description').value,
            date: document.getElementById('transaction-date').value
        };

        this.transactions.unshift(formData);
        this.saveData();
        this.renderModule();
        
        this.syncStatsWithDashboard();
        this.addRecentActivity(formData);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction added successfully!', 'success');
        }
    },

    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.renderModule();
        
        this.syncStatsWithDashboard();
        
        if (transaction) {
            this.addRecentActivity({
                ...transaction,
                type: 'deletion',
                message: `Deleted ${transaction.type}: ${transaction.description}`
            });
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction deleted!', 'success');
        }
    },

    clearAllTransactions() {
        this.transactions = [];
        this.saveData();
        this.renderModule();
        
        this.syncStatsWithDashboard();
        this.addRecentActivity({
            type: 'clear',
            message: 'Cleared all transactions'
        });
        
        if (window.coreModule) {
            window.coreModule.showNotification('All transactions cleared!', 'success');
        }
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    },

    syncStatsWithDashboard() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalIncome: stats.totalIncome,
                totalExpenses: stats.totalExpenses,
                totalRevenue: stats.totalIncome,
                netProfit: stats.netProfit
            });
        }
        
        const statsUpdateEvent = new CustomEvent('financialStatsUpdated', {
            detail: {
                totalIncome: stats.totalIncome,
                totalExpenses: stats.totalExpenses,
                totalRevenue: stats.totalIncome,
                netProfit: stats.netProfit
            }
        });
        document.dispatchEvent(statsUpdateEvent);
    },

    addRecentActivity(transaction) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        if (transaction.type === 'income') {
            activity = {
                type: 'income_added',
                message: `Income: ${transaction.description} - ${this.formatCurrency(transaction.amount)}`,
                icon: '💰'
            };
        } else if (transaction.type === 'expense') {
            activity = {
                type: 'expense_added',
                message: `Expense: ${transaction.description} - ${this.formatCurrency(transaction.amount)}`,
                icon: '💸'
            };
        } else if (transaction.type === 'deletion') {
            activity = {
                type: 'transaction_deleted',
                message: transaction.message,
                icon: '🗑️'
            };
        } else if (transaction.type === 'clear') {
            activity = {
                type: 'transactions_cleared',
                message: transaction.message,
                icon: '📋'
            };
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    formatCategoryName(category) {
        if (!category) return 'Unknown';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatCurrency(amount, includeSymbol = true) {
        if (includeSymbol) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount || 0);
        } else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}
