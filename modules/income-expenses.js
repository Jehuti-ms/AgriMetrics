// modules/income-expenses.js - UPDATED WITH HEADER STATS INTEGRATION
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],
    element: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        // ✅ Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule('income-expenses', this.element);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        // Sync initial stats with shared data
        this.syncStatsWithDashboard();
        
        console.log('✅ Income & Expenses initialized with StyleManager');
        return true;
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
            { id: 3, type: 'income', amount: 800, category: 'poultry-sales', description: 'Broiler sales', date: '2024-03-10' }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container">
                <!-- Modern PWA Header with Stats -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-text">
                            <h1 class="module-title">Income & Expenses</h1>
                            <p class="module-subtitle">Track your farm's financial health</p>
                        </div>
                        <!-- Header Stats -->
                        <div class="header-stats">
                            <div class="stat-badge">
                                <span class="stat-icon">📈</span>
                                <span class="stat-value" id="total-income">${this.formatCurrency(stats.totalIncome, false)}</span>
                                <span class="stat-label">Total Income</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">📊</span>
                                <span class="stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses, false)}</span>
                                <span class="stat-label">Total Expenses</span>
                            </div>
                            <div class="stat-badge">
                                <span class="stat-icon">💰</span>
                                <span class="stat-value" id="net-profit" style="color: ${stats.netProfit >= 0 ? 'var(--status-paid)' : 'var(--status-cancelled)'}">
                                    ${this.formatCurrency(stats.netProfit, false)}
                                </span>
                                <span class="stat-label">Net Profit</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary btn-icon" id="add-income-btn">
                            <span class="btn-icon-text">💰</span>
                            <span>Add Income</span>
                        </button>
                        <button class="btn btn-outline btn-icon" id="add-expense-btn">
                            <span class="btn-icon-text">💸</span>
                            <span>Add Expense</span>
                        </button>
                    </div>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="quick-income-btn">
                        <div style="font-size: 32px;">💰</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Quick Income</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record income instantly</span>
                    </button>
                    <button class="quick-action-btn" id="quick-expense-btn">
                        <div style="font-size: 32px;">💸</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Quick Expense</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record expense instantly</span>
                    </button>
                    <button class="quick-action-btn" id="view-reports-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">View Reports</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Financial analytics</span>
                    </button>
                    <button class="quick-action-btn" id="export-data-btn">
                        <div style="font-size: 32px;">📤</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export transactions</span>
                    </button>
                </div>

                <!-- Transaction Form (Hidden by default) -->
                <div id="transaction-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;" id="form-title">Add Transaction</h3>
                        <form id="transaction-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Type</label>
                                    <select class="form-input" id="transaction-type" required>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Amount</label>
                                    <input type="number" class="form-input" id="transaction-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Category</label>
                                <select class="form-input" id="transaction-category" required>
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
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Description</label>
                                <input type="text" class="form-input" id="transaction-description" required>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-input" id="transaction-date" required>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn btn-primary">Save Transaction</button>
                                <button type="button" class="btn btn-outline" id="cancel-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">Recent Transactions</h3>
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

    calculateStats() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            totalTransactions: this.transactions.length
        };
    },

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No transactions yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add your first transaction to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.transactions.map(transaction => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${transaction.type === 'income' ? '💰' : '💸'}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${transaction.description}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">${this.formatCategoryName(transaction.category)} • ${transaction.date}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-weight: bold; color: ${transaction.type === 'income' ? 'var(--status-paid)' : 'var(--status-cancelled)'};">
                                ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                            </div>
                            <button class="btn-icon delete-transaction" data-id="${transaction.id}" style="background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: var(--text-secondary);">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    setupEventListeners() {
        // Add transaction buttons
        document.getElementById('add-income-btn')?.addEventListener('click', () => this.showTransactionForm('income'));
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.showTransactionForm('expense'));
        
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.showQuickIncomeForm());
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.showQuickExpenseForm());
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.viewReports());
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        
        // Form handlers
        document.getElementById('transaction-form')?.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('cancel-form')?.addEventListener('click', () => this.hideTransactionForm());
        
        // Clear all button
        document.getElementById('clear-all')?.addEventListener('click', () => this.clearAllTransactions());
        
        // Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-transaction')) {
                const id = parseInt(e.target.closest('.delete-transaction').dataset.id);
                this.deleteTransaction(id);
            }
        });

        // Hover effects for quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    showTransactionForm(type) {
        const formContainer = document.getElementById('transaction-form-container');
        const formTitle = document.getElementById('form-title');
        const typeSelect = document.getElementById('transaction-type');
        const dateInput = document.getElementById('transaction-date');
        
        formTitle.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
        typeSelect.value = type;
        dateInput.value = new Date().toISOString().split('T')[0];
        
        formContainer.classList.remove('hidden');
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    showQuickIncomeForm() {
        const amount = prompt('Enter income amount:');
        if (amount && !isNaN(parseFloat(amount))) {
            const transaction = {
                id: Date.now(),
                type: 'income',
                amount: parseFloat(amount),
                category: 'other',
                description: 'Quick Income Entry',
                date: new Date().toISOString().split('T')[0]
            };
            this.addQuickTransaction(transaction);
        }
    },

    showQuickExpenseForm() {
        const amount = prompt('Enter expense amount:');
        if (amount && !isNaN(parseFloat(amount))) {
            const transaction = {
                id: Date.now(),
                type: 'expense',
                amount: parseFloat(amount),
                category: 'other',
                description: 'Quick Expense Entry',
                date: new Date().toISOString().split('T')[0]
            };
            this.addQuickTransaction(transaction);
        }
    },

    viewReports() {
        // Navigate to reports module if available
        if (window.FarmModules && window.FarmModules.modules.reports) {
            window.FarmModules.showModule('reports');
        } else {
            alert('Reports module not available');
        }
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
        document.getElementById('transaction-form-container').classList.add('hidden');
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
        
        // SYNC WITH DASHBOARD - Update financial stats
        this.syncStatsWithDashboard();
        
        // Add recent activity
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
        
        // SYNC WITH DASHBOARD - Update stats after deletion
        this.syncStatsWithDashboard();
        
        // Add deletion activity
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
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveData();
            this.renderModule();
            
            // SYNC WITH DASHBOARD - Reset financial stats
            this.syncStatsWithDashboard();
            
            // Add clear activity
            this.addRecentActivity({
                type: 'clear',
                message: 'Cleared all transactions'
            });
            
            if (window.coreModule) {
                window.coreModule.showNotification('All transactions cleared!', 'success');
            }
        }
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    },

    // Sync financial stats with dashboard
    syncStatsWithDashboard() {
        const stats = this.calculateStats();
        
        // Update shared data structure
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            // Update financial stats in shared data
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalIncome: stats.totalIncome,
                totalExpenses: stats.totalExpenses,
                totalRevenue: stats.totalIncome, // For dashboard compatibility
                netProfit: stats.netProfit
            });
        }
        
        // Notify dashboard via custom event
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

    // Add recent activity to dashboard
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

    // Helper method to format category names
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
            }).format(amount);
        } else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with header stats');
}
