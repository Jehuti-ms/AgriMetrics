// modules/income-expenses.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],
    element: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        this.id = 'income-expenses';
        
        // Sync initial stats with shared data
        this.syncStatsWithDashboard();
        
        console.log('✅ Income & Expenses initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Income & Expenses updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
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
        <div class="income-container module-container">
            <!-- Standard Header -->
            <div class="module-header">
                <h1 class="module-title">Income & Expenses</h1>
                <p class="module-subtitle">Manage your farm finances</p>
            </div>

            <!-- Stats Overview -->
            <div class="stats-overview glass-card">
                <h2>Overview</h2>
                <div class="stats-grid">
                    <div class="summary-card stat-card">
                        <div>💰</div>
                        <div id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                        <div>Total Income</div>
                    </div>
                    <div class="summary-card stat-card">
                        <div>💸</div>
                        <div id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div>Total Expenses</div>
                    </div>
                    <div class="summary-card stat-card">
                        <div>📊</div>
                        <div id="net-profit" style="color:${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">
                            ${this.formatCurrency(stats.netProfit)}
                        </div>
                        <div>Net Profit</div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="quick-actions glass-card">
                <h2>Actions</h2>
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn">
                        <div>💰</div>
                        <span>Add Income</span>
                        <span>Record new income</span>
                    </button>
                    <button class="quick-action-btn" id="add-expense-btn">
                        <div>💸</div>
                        <span>Add Expense</span>
                        <span>Record new expense</span>
                    </button>
                </div>
            </div>

            <!-- Transaction Form (Hidden by default) -->
            <div id="transaction-form-container" class="hidden">
                <div class="glass-card">
                    <h3 id="form-title">Add Transaction</h3>
                    <form id="transaction-form">
                        <div class="form-row">
                            <div>
                                <label for="transaction-type">Type</label>
                                <select id="transaction-type" required>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label for="transaction-amount">Amount</label>
                                <input type="number" id="transaction-amount" step="0.01" min="0" required>
                            </div>
                        </div>
                        <div>
                            <label for="transaction-category">Category</label>
                            <select id="transaction-category" required>
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
                        <div>
                            <label for="transaction-description">Description</label>
                            <input type="text" id="transaction-description" required>
                        </div>
                        <div>
                            <label for="transaction-date">Date</label>
                            <input type="date" id="transaction-date" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Save Transaction</button>
                            <button type="button" class="btn-outline" id="cancel-form">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="recent-transactions glass-card">
                <div class="card-header">
                    <h3>Recent Transactions</h3>
                    <button class="btn-outline" id="clear-all">Clear All</button>
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
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${transaction.type === 'income' ? '💰' : '💸'}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${transaction.description}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">${transaction.category} • ${transaction.date}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-weight: bold; color: ${transaction.type === 'income' ? '#22c55e' : '#ef4444'};">
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

    // UPDATED METHOD: Sync financial stats with dashboard (no ProfileModule dependency)
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
        
        // Notify dashboard via custom event instead of direct method call
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

    // NEW METHOD: Add recent activity to dashboard
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

    // NEW METHOD: Get financial summary for other modules
    getFinancialSummary() {
        const stats = this.calculateStats();
        return {
            ...stats,
            transactions: this.transactions.length,
            recentTransactions: this.transactions.slice(0, 5) // Last 5 transactions
        };
    },

    // NEW METHOD: Import transactions from other sources
    importTransactions(newTransactions) {
        this.transactions = [...this.transactions, ...newTransactions];
        this.saveData();
        this.renderModule();
        this.syncStatsWithDashboard();
        
        // Add import activity
        this.addRecentActivity({
            type: 'import',
            message: `Imported ${newTransactions.length} transactions`
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}
