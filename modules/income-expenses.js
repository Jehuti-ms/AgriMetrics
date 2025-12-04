// modules/income-expenses.js - Modal Manager Version
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    id: 'income-expenses',
    initialized: false,
    element: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Ensure CSS is loaded
        this.ensureModuleCSS();
        
        // Render module
        this.renderModule();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load data
        this.loadAndDisplayData();
        
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized successfully');
        return true;
    },

    ensureModuleCSS() {
        // Check if module CSS is already loaded
        const existingLinks = document.querySelectorAll('link[href*="income-expenses.css"]');
        if (existingLinks.length > 0) {
            return;
        }
        
        // Load module CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/income-expenses.css';
        link.onerror = () => {
            console.warn('⚠️ income-expenses.css not found');
        };
        document.head.appendChild(link);
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container income">
                
                <!-- Header -->
                <div class="module-header header-flex">
                    <div class="header-left">
                        <h1>Income & Expenses</h1>
                        <p class="module-subtitle">Track your farm's financial health</p>
                        
                        <!-- Stats inline with icons -->
                        <div class="stats-inline">
                            <span class="stat-item">💰 <span id="inline-total-income">$0.00</span> Total Income</span>
                            <span class="stat-item">💸 <span id="inline-total-expenses">$0.00</span> Total Expenses</span>
                            <span class="stat-item">🪙 <span id="inline-net-profit">$0.00</span> Net Profit</span>
                        </div>
                    </div>
                    
                    <!-- Right side: Add Transaction + Import Receipts -->
                    <div class="header-right">
                        <button id="add-transaction-btn" class="btn-primary">
                            <span class="btn-icon">➕</span>
                            <span class="btn-text">Add Transaction</span>
                        </button>
                        <button id="import-receipts-btn" class="btn-primary">
                            <span class="btn-icon">📥</span>
                            <span class="btn-text">Import Receipts</span>
                        </button>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="card-grid">
                        <button id="quick-income-btn" class="card-button" data-action="quick-income">
                            <div class="card-icon">💰</div>
                            <span class="card-title">Quick Income</span>
                            <span class="card-subtitle">Record income instantly</span>
                        </button>
                        <button id="quick-expense-btn" class="card-button" data-action="quick-expense">
                            <div class="card-icon">🧾</div>
                            <span class="card-title">Quick Expense</span>
                            <span class="card-subtitle">Record expense instantly</span>
                        </button>
                        <button id="view-reports-btn" class="card-button" data-action="view-reports">
                            <div class="card-icon">📊</div>
                            <span class="card-title">View Reports</span>
                            <span class="card-subtitle">Financial analytics</span>
                        </button>
                        <button id="manage-categories-btn" class="card-button" data-action="manage-categories">
                            <div class="card-icon">📂</div>
                            <span class="card-title">Categories</span>
                            <span class="card-subtitle">Manage categories</span>
                        </button>
                    </div>
                </div>
                
                <!-- Financial Overview -->
                <div class="overview-section">
                    <h2 class="section-title">Financial Overview</h2>
                    <div class="card-grid">
                        <div class="stat-card" id="monthly-income-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value" id="monthly-income">$0.00</div>
                            <div class="stat-label">This Month</div>
                        </div>
                        <div class="stat-card" id="avg-monthly-card">
                            <div class="stat-icon">📈</div>
                            <div class="stat-value" id="avg-monthly-income">$0.00</div>
                            <div class="stat-label">Avg Monthly</div>
                        </div>
                        <div class="stat-card" id="transactions-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-transactions">0</div>
                            <div class="stat-label">Transactions</div>
                        </div>
                        <div class="stat-card" id="categories-card">
                            <div class="stat-icon">📂</div>
                            <div class="stat-value" id="total-categories">0</div>
                            <div class="stat-label">Categories</div>
                        </div>
                        <div class="stat-card" id="balance-card">
                            <div class="stat-icon">🏦</div>
                            <div class="stat-value" id="current-balance">$0.00</div>
                            <div class="stat-label">Current Balance</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Transactions & Expense Categories -->
                <div class="content-columns">
                    
                    <!-- Recent Transactions -->
                    <div class="content-column">
                        <div class="glass-card">
                            <div class="card-header header-flex">
                                <h3>Recent Transactions</h3>
                                <button class="btn-outline" id="clear-all">Clear All</button>
                            </div>
                            <div id="transactions-list">
                                <!-- Transaction rows populated dynamically -->
                                <div class="transaction-row">
                                    <span class="date-col">📅 2025-12-01</span>
                                    <span class="desc-col">💰 Egg Sales</span>
                                    <span class="category-col">📂 Income</span>
                                    <span class="amount-col">💵 $250.00</span>
                                    <span class="actions-col">
                                        <button class="icon-btn">✏️</button>
                                        <button class="icon-btn">🗑️</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Expense Categories -->
                    <div class="content-column">
                        <div class="glass-card">
                          <div class="module-header header-flex">
                            <h3>Expense Categories</h3>
                            <button class="btn-outline" id="clear-categories">Clear All</button>
                          </div>
                          <div id="categories-list">
                            <div class="transaction-row">
                              <span class="transaction-desc">📂 Feed & Nutrition</span>
                              <span class="transaction-amount">💵 $1,500.00</span>
                              <span class="transaction-percent">📊 22.7%</span>
                              <span class="transaction-actions">
                                <button class="icon-btn">✏️</button>
                                <button class="icon-btn">🗑️</button>
                              </span>
                            </div>
                          </div>
                        </div>
                    </div>
                    
                </div>

                <!-- Footer -->
                <div class="module-footer">
                    <div class="footer-left">
                        <button id="refresh-data-btn" class="btn-primary">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Refresh Data</span>
                        </button>
                    </div>
                    <div class="footer-right">
                        <button id="export-data-btn" class="card-button" data-action="export-data">
                            <span class="card-icon">📤</span>
                            <span class="card-title">Export Data</span>
                            <span class="card-subtitle">Export to CSV/Excel</span>
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    },

    setupEventListeners() {
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.handleQuickAction('quick-income'));
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.handleQuickAction('quick-expense'));
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.handleQuickAction('view-reports'));
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => this.handleQuickAction('manage-categories'));
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.handleQuickAction('export-data'));
        
        // Primary buttons
        document.getElementById('add-transaction-btn')?.addEventListener('click', () => this.showAddTransactionModal());
        document.getElementById('import-receipts-btn')?.addEventListener('click', () => this.importReceipts());
        document.getElementById('clear-all')?.addEventListener('click', () => this.clearAllTransactions());
        document.getElementById('refresh-data-btn')?.addEventListener('click', () => {
            this.loadAndDisplayData();
            this.showNotification('Data refreshed!', 'success');
        });
        
        // Clear categories button
        document.getElementById('clear-categories')?.addEventListener('click', () => this.clearAllCategories());
    },

    loadAndDisplayData() {
        const data = this.getModuleData();
        this.updateDashboardDisplay(data);
        this.updateTransactionsList(data);
        this.updateCategoriesList(data);
    },

    getModuleData() {
        let data = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            monthlyIncome: 0,
            avgMonthlyIncome: 0,
            totalTransactions: 0,
            totalCategories: 0,
            currentBalance: 0,
            recentTransactions: [],
            expenseCategories: []
        };

        // Try to get data from FarmModules
        if (window.FarmModules && window.FarmModules.appData) {
            const sharedData = window.FarmModules.appData.incomeExpenses;
            if (sharedData) {
                data = { ...data, ...sharedData };
            }
        }

        // Fallback to localStorage
        const savedData = localStorage.getItem('farm-income-expenses-data');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            data = { ...data, ...parsedData };
        }

        // Use sample data for demo if empty
        if (data.totalIncome === 0 && data.totalExpenses === 0) {
            data = this.getSampleData();
        }

        return data;
    },

    getSampleData() {
        return {
            totalIncome: 12500,
            totalExpenses: 8500,
            netProfit: 4000,
            monthlyIncome: 3200,
            avgMonthlyIncome: 2800,
            totalTransactions: 24,
            totalCategories: 8,
            currentBalance: 5200,
            recentTransactions: [
                {
                    id: 1,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Chicken Sales - Batch #45',
                    category: 'Poultry Sales',
                    type: 'income',
                    amount: 2500,
                    status: 'completed',
                    icon: '💰'
                },
                {
                    id: 2,
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    description: 'Feed Purchase - Premium',
                    category: 'Feed & Nutrition',
                    type: 'expense',
                    amount: 800,
                    status: 'completed',
                    icon: '💸'
                },
                {
                    id: 3,
                    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                    description: 'Egg Sales - Wholesale',
                    category: 'Egg Sales',
                    type: 'income',
                    amount: 1200,
                    status: 'completed',
                    icon: '💰'
                },
                {
                    id: 4,
                    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                    description: 'Vaccination Supplies',
                    category: 'Healthcare',
                    type: 'expense',
                    amount: 350,
                    status: 'completed',
                    icon: '💸'
                },
                {
                    id: 5,
                    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
                    description: 'Equipment Maintenance',
                    category: 'Equipment',
                    type: 'expense',
                    amount: 450,
                    status: 'pending',
                    icon: '💸'
                }
            ],
            expenseCategories: [
                { name: 'Feed & Nutrition', amount: 1500, count: 8, icon: '🌾' },
                { name: 'Healthcare', amount: 450, count: 3, icon: '💊' },
                { name: 'Equipment', amount: 1200, count: 5, icon: '🔧' },
                { name: 'Labor', amount: 2800, count: 12, icon: '👷' },
                { name: 'Utilities', amount: 650, count: 4, icon: '⚡' }
            ]
        };
    },

    updateDashboardDisplay(data) {
        // Update inline stats
        this.updateInlineStat('inline-total-income', this.formatCurrency(data.totalIncome));
        this.updateInlineStat('inline-total-expenses', this.formatCurrency(data.totalExpenses));
        this.updateInlineStat('inline-net-profit', this.formatCurrency(data.netProfit));
        
        // Update card stats
        this.updateCardStat('monthly-income', this.formatCurrency(data.monthlyIncome));
        this.updateCardStat('avg-monthly-income', this.formatCurrency(data.avgMonthlyIncome));
        this.updateCardStat('total-transactions', data.totalTransactions);
        this.updateCardStat('total-categories', data.totalCategories);
        this.updateCardStat('current-balance', this.formatCurrency(data.currentBalance));
        
        // Update card styling based on values
        this.updateCardStatus('balance-card', data.currentBalance, 'balance');
        this.updateCardStatus('monthly-income-card', data.monthlyIncome, 'income');
    },

    updateInlineStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    updateCardStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('value-updating');
            setTimeout(() => {
                element.classList.remove('value-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateCardStatus(cardId, value, type) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        // Remove existing status classes
        card.classList.remove('status-positive', 'status-negative', 'status-neutral');
        
        if (type === 'balance') {
            if (value > 0) {
                card.classList.add('status-positive');
            } else if (value < 0) {
                card.classList.add('status-negative');
            } else {
                card.classList.add('status-neutral');
            }
        } else if (type === 'income') {
            if (value > 0) {
                card.classList.add('status-positive');
            } else {
                card.classList.add('status-neutral');
            }
        }
    },

    updateTransactionsList(data) {
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="transaction-row empty-state">
                    <span class="desc-col">📋 No transactions yet</span>
                    <span class="category-col">➕ Add your first income or expense record</span>
                </div>
            `;
            return;
        }

        // Show only recent 5 transactions
        const recentTransactions = transactions.slice(0, 5);
        
        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-row transaction-${transaction.type}" data-id="${transaction.id}">
                <span class="date-col">📅 ${this.formatDate(transaction.date)}</span>
                <span class="desc-col">${transaction.icon} ${transaction.description}</span>
                <span class="category-col">📂 ${transaction.category}</span>
                <span class="amount-col ${transaction.type}">
                    ${transaction.type === 'income' ? '💵 +' : '💸 -'}${this.formatCurrency(transaction.amount)}
                </span>
                <span class="actions-col">
                    <button class="icon-btn edit-transaction" data-id="${transaction.id}">✏️</button>
                    <button class="icon-btn delete-transaction" data-id="${transaction.id}">🗑️</button>
                </span>
            </div>
        `).join('');

        // Add event listeners to transaction action buttons
        this.setupTransactionActionListeners();
    },

    setupTransactionActionListeners() {
        // Edit transaction buttons
        document.querySelectorAll('.edit-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
                this.editTransaction(transactionId);
            });
        });
        
        // Delete transaction buttons
        document.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteTransaction(transactionId);
            });
        });
    },

    updateCategoriesList(data) {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        const categories = data.expenseCategories || [];

        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="data-row empty-state">
                    <span class="desc-col">📋 No categories yet</span>
                    <span class="category-col">➕ Add expenses to see categories</span>
                </div>
            `;
            return;
        }

        // Calculate total expenses for percentage
        const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);

        categoriesList.innerHTML = categories.map(category => {
            const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : 0;
            return `
                <div class="data-row" data-category="${category.name}">
                    <span class="desc-col">${category.icon} ${category.name}</span>
                    <span class="amount-col">💵 ${this.formatCurrency(category.amount)}</span>
                    <span class="percentage-col">📊 ${percentage}%</span>
                    <span class="actions-col">
                        <button class="icon-btn edit-category" data-category="${category.name}">✏️</button>
                        <button class="icon-btn delete-category" data-category="${category.name}">🗑️</button>
                    </span>
                </div>
            `;
        }).join('');

        // Add event listeners to category action buttons
        this.setupCategoryActionListeners();
    },

    setupCategoryActionListeners() {
        // Edit category buttons
        document.querySelectorAll('.edit-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryName = e.currentTarget.getAttribute('data-category');
                this.editCategory(categoryName);
            });
        });
        
        // Delete category buttons
        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryName = e.currentTarget.getAttribute('data-category');
                this.deleteCategory(categoryName);
            });
        });
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        switch (action) {
            case 'quick-income':
                this.showAddTransactionModal({ type: 'income' });
                break;
            case 'quick-expense':
                this.showAddTransactionModal({ type: 'expense' });
                break;
            case 'view-reports':
                this.showReportsModal();
                break;
            case 'manage-categories':
                this.showManageCategoriesModal();
                break;
            case 'export-data':
                this.exportData();
                break;
            default:
                this.showNotification(`Action "${action}" not implemented yet`, 'info');
        }
    },

    showAddTransactionModal(prefill = null) {
        const fields = [
            {
                type: 'select',
                name: 'transaction-type',
                label: 'Type',
                required: true,
                options: [
                    { value: 'income', label: 'Income' },
                    { value: 'expense', label: 'Expense' }
                ],
                value: prefill?.type || 'expense'
            },
            {
                type: 'number',
                name: 'amount',
                label: 'Amount',
                required: true,
                min: 0.01,
                step: 0.01,
                large: true,
                placeholder: '0.00',
                value: prefill?.amount || '',
                note: 'Enter the transaction amount'
            },
            {
                type: 'select',
                name: 'category',
                label: 'Category',
                required: true,
                options: this.getCategoryOptions(prefill?.type || 'expense'),
                value: prefill?.category || ''
            },
            {
                type: 'text',
                name: 'description',
                label: 'Description',
                required: true,
                placeholder: 'Enter transaction description...',
                value: prefill?.description || ''
            },
            {
                type: 'date',
                name: 'date',
                label: 'Date',
                required: true,
                value: prefill?.date || new Date().toISOString().split('T')[0]
            }
        ];

        // If editing an existing transaction, modify the form
        const isEditing = prefill?.id;
        const modalTitle = isEditing ? 'Edit Transaction' : 'Add Transaction';
        const submitText = isEditing ? 'Update Transaction' : 'Save Transaction';

        window.ModalManager.createQuickForm({
            id: 'transaction-form-modal',
            title: modalTitle,
            size: 'modal-md',
            fields: fields,
            submitText: submitText,
            onSubmit: (formData) => {
                const transactionData = {
                    type: formData['transaction-type'],
                    amount: parseFloat(formData.amount),
                    category: this.getCategoryName(formData.category),
                    description: formData.description,
                    date: formData.date,
                    status: 'completed',
                    icon: this.getTransactionIcon(formData['transaction-type'])
                };

                if (isEditing) {
                    transactionData.id = prefill.id;
                    this.updateTransaction(transactionData);
                } else {
                    this.addTransaction(transactionData);
                }
            }
        });
    },

    getCategoryOptions(type) {
        const categories = type === 'income' ? 
            [
                { value: 'egg-sales', label: 'Egg Sales' },
                { value: 'poultry-sales', label: 'Poultry Sales' },
                { value: 'crop-sales', label: 'Crop Sales' },
                { value: 'other-income', label: 'Other Income' }
            ] : 
            [
                { value: 'feed', label: 'Feed & Nutrition' },
                { value: 'medication', label: 'Healthcare' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'labor', label: 'Labor' },
                { value: 'utilities', label: 'Utilities' },
                { value: 'transportation', label: 'Transportation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'other', label: 'Other' }
            ];
        
        // Add empty option
        return [{ value: '', label: 'Select category' }, ...categories];
    },

    showReportsModal() {
        const reports = [
            {
                id: 'income-statement',
                title: 'Income Statement',
                icon: '📊',
                description: 'Revenue, expenses, and net profit',
                preview: '<p>Shows your farm\'s financial performance over a period of time.</p>',
                buttonText: 'Generate Report'
            },
            {
                id: 'category-breakdown',
                title: 'Category Breakdown',
                icon: '📈',
                description: 'Expense distribution by category',
                preview: '<p>Visual breakdown of where your money is being spent.</p>',
                buttonText: 'View Breakdown'
            },
            {
                id: 'monthly-trends',
                title: 'Monthly Trends',
                icon: '📅',
                description: 'Income and expense trends',
                preview: '<p>Track your financial performance month over month.</p>',
                buttonText: 'View Trends'
            },
            {
                id: 'yearly-summary',
                title: 'Yearly Summary',
                icon: '📋',
                description: 'Annual financial summary',
                preview: '<p>Complete overview of your farm\'s yearly financial performance.</p>',
                buttonText: 'View Summary'
            }
        ];

        window.ModalManager.showReports({
            id: 'reports-modal',
            title: 'Financial Reports',
            subtitle: 'Select a report to generate',
            reports: reports,
            onReportSelect: (reportId) => {
                this.showNotification(`Generating ${reportId.replace('-', ' ')} report...`, 'success');
                // Implement report generation logic here
            }
        });
    },

    showManageCategoriesModal() {
        this.showNotification('Categories management coming soon!', 'info');
    },

    importReceipts() {
        window.ModalManager.alert({
            title: 'Import Receipts',
            message: 'This feature is coming soon!',
            details: 'You will be able to upload and scan receipts for automatic transaction entry.',
            icon: '📥'
        });
    },

    exportData() {
        this.showNotification('Exporting data to CSV...', 'success');
        
        // Get current data
        const data = this.getModuleData();
        
        // Create CSV content
        let csvContent = "Date,Description,Category,Type,Amount,Status\n";
        
        data.recentTransactions.forEach(transaction => {
            csvContent += `"${transaction.date}","${transaction.description}","${transaction.category}",${transaction.type},${transaction.amount},${transaction.status}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    editTransaction(transactionId) {
        const data = this.getModuleData();
        const transaction = data.recentTransactions.find(t => t.id === transactionId);
        
        if (transaction) {
            this.showAddTransactionModal({
                id: transactionId,
                type: transaction.type,
                amount: transaction.amount,
                category: this.getCategoryValue(transaction.category),
                description: transaction.description,
                date: transaction.date
            });
        }
    },

    updateTransaction(updatedTransaction) {
        let data = this.getModuleData();
        
        // Find and update the transaction
        const index = data.recentTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (index !== -1) {
            // Store old transaction for recalculation
            const oldTransaction = data.recentTransactions[index];
            
            // Update the transaction
            data.recentTransactions[index] = {
                ...oldTransaction,
                ...updatedTransaction,
                icon: this.getTransactionIcon(updatedTransaction.type)
            };
            
            // Recalculate totals
            this.recalculateTotals(data);
            
            // Update categories
            this.updateCategoriesData(data, updatedTransaction, oldTransaction);
            
            // Save updated data
            this.saveData(data);
            
            // Refresh display
            this.loadAndDisplayData();
            
            this.showNotification('Transaction updated successfully!', 'success');
        }
    },

    deleteTransaction(transactionId) {
        window.ModalManager.confirm({
            title: 'Delete Transaction',
            message: 'Are you sure you want to delete this transaction?',
            danger: true,
            confirmText: 'Delete'
        }).then(confirmed => {
            if (confirmed) {
                // Get current data
                let data = this.getModuleData();
                
                // Store transaction before deletion for category updates
                const transactionToDelete = data.recentTransactions.find(t => t.id === transactionId);
                
                // Remove transaction
                data.recentTransactions = data.recentTransactions.filter(t => t.id !== transactionId);
                
                // Update categories when deleting expense
                if (transactionToDelete && transactionToDelete.type === 'expense') {
                    this.updateCategoriesOnDelete(data, transactionToDelete);
                }
                
                // Recalculate totals
                this.recalculateTotals(data);
                
                // Save updated data
                this.saveData(data);
                
                // Refresh display
                this.loadAndDisplayData();
                
                this.showNotification('Transaction deleted successfully!', 'success');
            }
        });
    },

    updateCategoriesOnDelete(data, deletedTransaction) {
        const category = data.expenseCategories.find(c => c.name === deletedTransaction.category);
        if (category) {
            category.amount -= deletedTransaction.amount;
            category.count -= 1;
            
            // Remove category if no transactions left
            if (category.count <= 0) {
                data.expenseCategories = data.expenseCategories.filter(c => c.name !== deletedTransaction.category);
            }
        }
        
        data.totalCategories = data.expenseCategories.length;
    },

    addTransaction(transaction) {
        let data = this.getModuleData();
        
        // Add new transaction
        const newTransaction = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            ...transaction
        };
        
        data.recentTransactions.unshift(newTransaction);
        
        // Update totals
        if (transaction.type === 'income') {
            data.totalIncome += transaction.amount;
        } else {
            data.totalExpenses += transaction.amount;
        }
        
        data.netProfit = data.totalIncome - data.totalExpenses;
        data.totalTransactions = data.recentTransactions.length;
        data.currentBalance = data.netProfit;
        
        // Update categories for expenses
        if (transaction.type === 'expense') {
            this.updateCategoriesData(data, transaction);
        }
        
        // Update monthly averages (simplified)
        data.monthlyIncome = data.totalIncome / 4; // Assuming 4 months
        data.avgMonthlyIncome = data.monthlyIncome;
        
        // Save data
        this.saveData(data);
        
        // Refresh display
        this.loadAndDisplayData();
        
        this.showNotification('Transaction added successfully!', 'success');
    },

    updateCategoriesData(data, newTransaction, oldTransaction = null) {
        if (newTransaction.type === 'expense') {
            // If editing, remove old category amounts first
            if (oldTransaction && oldTransaction.category !== newTransaction.category) {
                const oldCategory = data.expenseCategories.find(c => c.name === oldTransaction.category);
                if (oldCategory) {
                    oldCategory.amount -= oldTransaction.amount;
                    oldCategory.count -= 1;
                    
                    // Remove old category if no transactions left
                    if (oldCategory.count <= 0) {
                        data.expenseCategories = data.expenseCategories.filter(c => c.name !== oldTransaction.category);
                    }
                }
            }
            
            // Find or create category for new transaction
            let category = data.expenseCategories.find(c => c.name === newTransaction.category);
            
            if (category) {
                category.amount += newTransaction.amount;
                category.count += 1;
            } else {
                data.expenseCategories.push({
                    name: newTransaction.category,
                    amount: newTransaction.amount,
                    count: 1,
                    icon: this.getCategoryIcon(newTransaction.category)
                });
            }
            
            data.totalCategories = data.expenseCategories.length;
        }
    },

    recalculateTotals(data) {
        // Recalculate totals from all transactions
        data.totalIncome = data.recentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        data.totalExpenses = data.recentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        data.netProfit = data.totalIncome - data.totalExpenses;
        data.totalTransactions = data.recentTransactions.length;
        data.currentBalance = data.netProfit;
        
        // Update monthly averages (simplified)
        data.monthlyIncome = data.totalIncome / 4; // Assuming 4 months
        data.avgMonthlyIncome = data.monthlyIncome;
    },

    clearAllTransactions() {
        window.ModalManager.confirm({
            title: 'Clear All Transactions',
            message: 'Are you sure you want to clear ALL transactions?',
            details: 'This action cannot be undone. All transaction data will be permanently deleted.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Clear All'
        }).then(confirmed => {
            if (confirmed) {
                // Create fresh data structure
                const freshData = {
                    totalIncome: 0,
                    totalExpenses: 0,
                    netProfit: 0,
                    monthlyIncome: 0,
                    avgMonthlyIncome: 0,
                    totalTransactions: 0,
                    totalCategories: 0,
                    currentBalance: 0,
                    recentTransactions: [],
                    expenseCategories: []
                };
                
                // Save fresh data
                this.saveData(freshData);
                
                // Refresh display
                this.loadAndDisplayData();
                
                this.showNotification('All transactions cleared!', 'success');
            }
        });
    },

    clearAllCategories() {
        window.ModalManager.confirm({
            title: 'Clear All Categories',
            message: 'Are you sure you want to clear ALL expense categories?',
            details: 'Category data will be reset. Existing transactions will remain but categories will be recalculated.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Clear Categories'
        }).then(confirmed => {
            if (confirmed) {
                let data = this.getModuleData();
                data.expenseCategories = [];
                data.totalCategories = 0;
                
                // Save updated data
                this.saveData(data);
                
                // Refresh display
                this.loadAndDisplayData();
                
                this.showNotification('All categories cleared!', 'success');
            }
        });
    },

    editCategory(categoryName) {
        this.showNotification(`Editing category: ${categoryName}`, 'info');
    },

    deleteCategory(categoryName) {
        window.ModalManager.confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete "${categoryName}"?`,
            details: 'All transactions in this category will be moved to "Other"',
            danger: true,
            confirmText: 'Delete Category'
        }).then(confirmed => {
            if (confirmed) {
                let data = this.getModuleData();
                
                // Remove the category
                data.expenseCategories = data.expenseCategories.filter(c => c.name !== categoryName);
                data.totalCategories = data.expenseCategories.length;
                
                // Save updated data
                this.saveData(data);
                
                // Refresh display
                this.loadAndDisplayData();
                
                this.showNotification(`Category "${categoryName}" deleted`, 'success');
            }
        });
    },

    saveData(data) {
        // Save to FarmModules
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.incomeExpenses) {
                window.FarmModules.appData.incomeExpenses = {};
            }
            window.FarmModules.appData.incomeExpenses = data;
        }
        
        // Save to localStorage
        localStorage.setItem('farm-income-expenses-data', JSON.stringify(data));
        
        console.log('💾 Income & Expenses data saved');
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    getTransactionIcon(type) {
        return type === 'income' ? '💰' : '💸';
    },

    getCategoryValue(categoryName) {
        const categoryMap = {
            'Egg Sales': 'egg-sales',
            'Poultry Sales': 'poultry-sales',
            'Crop Sales': 'crop-sales',
            'Feed & Nutrition': 'feed',
            'Feed': 'feed',
            'Healthcare': 'medication',
            'Medication': 'medication',
            'Equipment': 'equipment',
            'Labor': 'labor',
            'Utilities': 'utilities',
            'Transportation': 'transportation',
            'Maintenance': 'maintenance',
            'Other': 'other',
            'Other Income': 'other-income'
        };
        
        return categoryMap[categoryName] || 'other';
    },

    getCategoryName(categoryValue) {
        const categoryMap = {
            'egg-sales': 'Egg Sales',
            'poultry-sales': 'Poultry Sales',
            'crop-sales': 'Crop Sales',
            'feed': 'Feed & Nutrition',
            'medication': 'Healthcare',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'utilities': 'Utilities',
            'transportation': 'Transportation',
            'maintenance': 'Maintenance',
            'other': 'Other',
            'other-income': 'Other Income'
        };
        
        return categoryMap[categoryValue] || 'Other';
    },

    getCategoryIcon(categoryName) {
        const iconMap = {
            'Feed & Nutrition': '🌾',
            'Healthcare': '💊',
            'Medication': '💊',
            'Equipment': '🔧',
            'Labor': '👷',
            'Utilities': '⚡',
            'Transportation': '🚚',
            'Maintenance': '🔨',
            'Egg Sales': '🥚',
            'Poultry Sales': '🐔',
            'Crop Sales': '🌽',
            'Other': '📦',
            'Other Income': '💰'
        };
        
        return iconMap[categoryName] || '📂';
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        const bgColor = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        }[type] || '#3b82f6';
        
        notification.style.backgroundColor = bgColor;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animations if not already present
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Register the module when FarmModules is available
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
} else {
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            clearInterval(checkFarmModules);
            window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
            console.log('✅ Income & Expenses module registered after wait');
        }
    }, 100);
}

// Export for global access
window.IncomeExpensesModule = IncomeExpensesModule;
