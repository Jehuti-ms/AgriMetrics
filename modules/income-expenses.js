// modules/income-expenses.js - CSS-BASED VERSION (Complete with CSS matching)
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
      <div class="income-header header-flex">
        <div class="income-header-left">
          <h1 class="income-title">Income & Expenses</h1>
          <p class="income-subtitle">Track your farm's financial health</p>
          
          <!-- Stats inline in white with icons -->
          <div class="income-stats-inline">
            <span class="income-stat">💰 <span id="inline-total-income">$0.00</span> Total Income</span>
            <span class="income-stat">💸 <span id="inline-total-expenses">$0.00</span> Total Expenses</span>
            <span class="income-stat">🪙 <span id="inline-net-profit">$0.00</span> Net Profit</span>
          </div>
        </div>
        
        <!-- Right side: Add Transaction + Import Receipts -->
        <div class="income-header-right">
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
      <div class="income-quick-actions">
        <h2 class="income-section-title">Quick Actions</h2>
        <div class="card-grid">
          <button id="quick-income-btn" class="card-button" data-action="quick-income">
            <div class="action-icon">💰</div>
            <span class="action-title">Quick Income</span>
            <span class="action-subtitle">Record income instantly</span>
          </button>
          
          <button id="quick-expense-btn" class="card-button" data-action="quick-expense">
            <div class="action-icon">🧾</div>
            <span class="action-title">Quick Expense</span>
            <span class="action-subtitle">Record expense instantly</span>
          </button>
          
          <button id="view-reports-btn" class="card-button" data-action="view-reports">
            <div class="action-icon">📊</div>
            <span class="action-title">View Reports</span>
            <span class="action-subtitle">Financial analytics</span>
          </button>
          
          <button id="manage-categories-btn" class="card-button" data-action="manage-categories">
            <div class="action-icon">📂</div>
            <span class="action-title">Categories</span>
            <span class="action-subtitle">Manage categories</span>
          </button>
        </div>
      </div>
      
      <!-- Financial Overview -->
      <div class="income-overview">
        <h2 class="income-section-title">Financial Overview</h2>
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
      
<!-- Recent Transactions Section -->
<div class="income-recent">
  <div class="glass-card">
    <div class="header-flex">
      <h2 class="income-section-title">Recent Transactions</h2>
      <div class="header-flex">
        <button class="btn-primary" id="add-transaction-btn">
          <span class="btn-icon">➕</span>
          <span class="btn-text">Add Transaction</span>
        </button>
        <button class="btn-outline" id="view-all-transactions">
          <span class="btn-icon">📋</span>
          <span class="btn-text">View All</span>
        </button>
      </div>
    </div>

    <div class="card-grid" id="transactions-content">
      <!-- Example transaction card -->
      <div class="info-card">
        <div class="info-header">
          <div class="info-icon">💸</div>
          <div class="info-title">Feed Purchase — $120.00</div>
        </div>
        <div class="info-subtitle">Category: Expense · Date: 2025-12-01</div>
        <div class="info-notes">Purchased 3 bags of layer mash</div>
        <div class="info-actions">
          <button class="btn-outline edit-transaction">Edit</button>
          <button class="btn-outline delete-transaction">Delete</button>
        </div>
      </div>

      <!-- Empty state -->
      <div class="info-card income-empty-state hidden">
        <div class="info-icon">📋</div>
        <div class="info-title">No transactions yet</div>
        <div class="info-notes">Add your first income or expense record</div>
      </div>
    </div>
  </div>
</div>

<!-- Expense Categories Section -->
<div class="income-categories">
  <div class="glass-card">
    <h2 class="income-section-title">Expense Categories</h2>

    <div class="card-grid" id="categories-content">
      <!-- Example category card -->
      <div class="info-card">
        <div class="info-header">
          <div class="info-icon">📂</div>
          <div class="info-title">Feed</div>
        </div>
        <div class="info-subtitle">Total: $120.00 · 45% of expenses</div>
        <div class="info-notes">Includes layer mash, starter crumble</div>
      </div>

      <!-- Empty state -->
      <div class="info-card income-empty-state hidden">
        <div class="info-icon">📊</div>
        <div class="info-title">No categories yet</div>
        <div class="info-notes">Add expenses to see categories</div>
      </div>
    </div>
  </div>
</div>

<!-- Transaction Form (Initially hidden) -->
<div id="transaction-form-container" class="hidden">
  <div class="glass-card">
    <h3 id="form-title">Add Transaction</h3>
    <form id="transaction-form">
      <div class="form-grid">
        <div>
          <label class="form-label">Type</label>
          <select class="form-input" id="transaction-type" required>
            <option value="income">Income</option>
            <option value="expense" selected>Expense</option>
          </select>
        </div>
        <div>
          <label class="form-label">Amount</label>
          <input type="number" class="form-input" id="transaction-amount" step="0.01" min="0" required>
        </div>
      </div>
      <div>
        <label class="form-label">Category</label>
        <select class="form-input" id="transaction-category" required>
          <option value="">Select category</option>
          <option value="egg-sales">Egg Sales</option>
          <option value="poultry-sales">Poultry Sales</option>
          <option value="crop-sales">Crop Sales</option>
          <option value="feed" selected>Feed</option>
          <option value="medication">Medication</option>
          <option value="equipment">Equipment</option>
          <option value="labor">Labor</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label class="form-label">Description</label>
        <input type="text" class="form-input" id="transaction-description" required>
      </div>
      <div>
        <label class="form-label">Date</label>
        <input type="date" class="form-input" id="transaction-date" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Save Transaction</button>
        <button type="button" class="btn-outline" id="cancel-form">Cancel</button>
      </div>
    </form>
  </div>
</div>

<!-- Footer -->
<div class="income-footer">
  <div class="income-refresh-container">
    <button id="refresh-data-btn" class="btn-primary">
      <span class="btn-icon">🔄</span>
      <span class="btn-text">Refresh Data</span>
    </button>
  </div>
  <div class="income-modal-triggers">
    <button id="export-data-btn" class="card-button" data-action="export-data">
      <span class="action-icon">📤</span>
      <span class="action-title">Export Data</span>
      <span class="action-subtitle">Export to CSV/Excel</span>
    </button>
  </div>
</div>

  `;
},

    setupEventListeners() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.income-action-btn[data-action]');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
        
        // Primary buttons
        const addTransactionBtn = document.getElementById('add-transaction-btn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.openAddTransactionModal();
            });
        }
        
        const importReceiptsBtn = document.getElementById('import-receipts-btn');
        if (importReceiptsBtn) {
            importReceiptsBtn.addEventListener('click', () => {
                this.importReceipts();
            });
        }
        
        const viewAllBtn = document.getElementById('view-all-transactions');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.viewAllTransactions();
            });
        }
        
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayData();
                this.showNotification('Data refreshed!', 'success');
            });
        }
        
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
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
                    date: '2024-01-15',
                    description: 'Chicken Sales - Batch #45',
                    category: 'Livestock Sales',
                    type: 'income',
                    amount: 2500,
                    status: 'completed',
                    icon: '💰'
                },
                {
                    id: 2,
                    date: '2024-01-14',
                    description: 'Feed Purchase - Premium',
                    category: 'Feed & Nutrition',
                    type: 'expense',
                    amount: 800,
                    status: 'completed',
                    icon: '🌾'
                },
                {
                    id: 3,
                    date: '2024-01-13',
                    description: 'Egg Sales - Wholesale',
                    category: 'Product Sales',
                    type: 'income',
                    amount: 1200,
                    status: 'completed',
                    icon: '🥚'
                },
                {
                    id: 4,
                    date: '2024-01-12',
                    description: 'Vaccination Supplies',
                    category: 'Healthcare',
                    type: 'expense',
                    amount: 350,
                    status: 'completed',
                    icon: '💊'
                },
                {
                    id: 5,
                    date: '2024-01-11',
                    description: 'Equipment Maintenance',
                    category: 'Equipment',
                    type: 'expense',
                    amount: 450,
                    status: 'pending',
                    icon: '🔧'
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
        const transactionsContent = document.getElementById('transactions-content');
        if (!transactionsContent) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            transactionsContent.innerHTML = `
                <div class="income-empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">No transactions yet</div>
                    <div class="empty-subtitle">Add your first income or expense record</div>
                </div>
            `;
            return;
        }

        transactionsContent.innerHTML = `
            <div class="transactions-container">
                ${transactions.map(transaction => `
                    <div class="transaction-item transaction-${transaction.type}" data-id="${transaction.id}">
                        <div class="transaction-icon">${transaction.icon || this.getTransactionIcon(transaction.type)}</div>
                        <div class="transaction-details">
                            <div class="transaction-main">
                                <div class="transaction-description">${transaction.description}</div>
                                <div class="transaction-amount ${transaction.type}">
                                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                </div>
                            </div>
                            <div class="transaction-meta">
                                <span class="transaction-category">${transaction.category}</span>
                                <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                                <span class="transaction-status status-${transaction.status}">${transaction.status}</span>
                            </div>
                        </div>
                        <div class="transaction-actions">
                            <button class="transaction-action-btn edit-btn" data-id="${transaction.id}" title="Edit">
                                ✏️
                            </button>
                            <button class="transaction-action-btn delete-btn" data-id="${transaction.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners to transaction action buttons
        this.setupTransactionActionListeners();
    },

    getTransactionIcon(type) {
        return type === 'income' ? '💰' : '💸';
    },

    setupTransactionActionListeners() {
        const editButtons = document.querySelectorAll('.transaction-action-btn.edit-btn');
        const deleteButtons = document.querySelectorAll('.transaction-action-btn.delete-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.currentTarget.getAttribute('data-id');
                this.editTransaction(transactionId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.currentTarget.getAttribute('data-id');
                this.deleteTransaction(transactionId);
            });
        });
    },

    updateCategoriesList(data) {
        const categoriesContent = document.getElementById('categories-content');
        if (!categoriesContent) return;

        const categories = data.expenseCategories || [];

        if (categories.length === 0) {
            categoriesContent.innerHTML = `
                <div class="income-empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No categories yet</div>
                    <div class="empty-subtitle">Add expenses to see categories</div>
                </div>
            `;
            return;
        }

        // Calculate total expenses for percentage
        const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);

        categoriesContent.innerHTML = `
            <div class="categories-container">
                ${categories.map(category => {
                    const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : 0;
                    return `
                        <div class="category-item">
                            <div class="category-header">
                                <div class="category-icon">${category.icon || '📂'}</div>
                                <div class="category-info">
                                    <div class="category-name">${category.name}</div>
                                    <div class="category-count">${category.count || 0} transactions</div>
                                </div>
                                <div class="category-amount">${this.formatCurrency(category.amount)}</div>
                            </div>
                            <div class="category-progress">
                                <div class="progress-bar" style="width: ${percentage}%"></div>
                            </div>
                            <div class="category-percentage">${percentage}% of expenses</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        switch (action) {
            case 'quick-income':
                this.openQuickIncomeModal();
                break;
            case 'quick-expense':
                this.openQuickExpenseModal();
                break;
            case 'view-reports':
                if (window.app && window.app.showSection) {
                    window.app.showSection('reports');
                    this.showNotification('Opening Reports...', 'info');
                }
                break;
            case 'manage-categories':
                this.openManageCategoriesModal();
                break;
            case 'export-data':
                this.exportData();
                break;
            default:
                this.showNotification(`Action "${action}" not implemented yet`, 'info');
        }
    },

    openAddTransactionModal() {
        this.showNotification('Opening Add Transaction modal...', 'info');
        // TODO: Implement modal opening
        // You can use your existing ModalManager here
        if (window.ModalManager) {
            // window.ModalManager.openModal('add-transaction-modal');
        }
    },

    openQuickIncomeModal() {
        this.showNotification('Opening Quick Income form...', 'info');
        // TODO: Implement quick income modal
    },

    openQuickExpenseModal() {
        this.showNotification('Opening Quick Expense form...', 'info');
        // TODO: Implement quick expense modal
    },

    openManageCategoriesModal() {
        this.showNotification('Opening Categories Manager...', 'info');
        // TODO: Implement categories management modal
    },

    importReceipts() {
        this.showNotification('Import receipts feature coming soon!', 'info');
        // TODO: Implement file upload for receipts
    },

    viewAllTransactions() {
        this.showNotification('Showing all transactions...', 'info');
        // TODO: Navigate to detailed transactions view or open modal
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
        this.showNotification(`Editing transaction #${transactionId}...`, 'info');
        // TODO: Implement transaction editing
    },

    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            // Get current data
            let data = this.getModuleData();
            
            // Remove transaction
            data.recentTransactions = data.recentTransactions.filter(t => t.id != transactionId);
            
            // Recalculate totals
            this.recalculateTotals(data);
            
            // Save updated data
            this.saveData(data);
            
            // Refresh display
            this.loadAndDisplayData();
            
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    },

    recalculateTotals(data) {
        // Recalculate totals from remaining transactions
        data.totalIncome = data.recentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        data.totalExpenses = data.recentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        data.netProfit = data.totalIncome - data.totalExpenses;
        data.totalTransactions = data.recentTransactions.length;
        
        // Update current balance (simplified)
        data.currentBalance = data.netProfit;
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('notification-fadeout');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
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
        
        // Update categories
        this.updateCategoriesData(data, transaction);
        
        // Save data
        this.saveData(data);
        
        // Refresh display
        this.loadAndDisplayData();
        
        this.showNotification('Transaction added successfully!', 'success');
    },

    updateCategoriesData(data, transaction) {
        if (transaction.type === 'expense') {
            // Find or create category
            let category = data.expenseCategories.find(c => c.name === transaction.category);
            
            if (category) {
                category.amount += transaction.amount;
                category.count += 1;
            } else {
                data.expenseCategories.push({
                    name: transaction.category,
                    amount: transaction.amount,
                    count: 1,
                    icon: this.getCategoryIcon(transaction.category)
                });
            }
            
            data.totalCategories = data.expenseCategories.length;
        }
    },

    getCategoryIcon(categoryName) {
        const iconMap = {
            'Feed & Nutrition': '🌾',
            'Healthcare': '💊',
            'Equipment': '🔧',
            'Labor': '👷',
            'Utilities': '⚡',
            'Livestock Sales': '🐔',
            'Product Sales': '🥚',
            'Transportation': '🚚',
            'Maintenance': '🔨',
            'Other': '📦'
        };
        
        return iconMap[categoryName] || '📂';
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
