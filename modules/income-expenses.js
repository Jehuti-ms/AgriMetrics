// modules/income-expenses.js - FULLY WORKING (CORRECTED)
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],

    initialize() {
        console.log('💰 Initializing income & expenses...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
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
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="income-expenses-module">
                <!-- Enhanced PWA Header -->
                <div class="module-header-pwa">
                    <h1 class="module-title-pwa">Income & Expenses</h1>
                    <p class="module-subtitle-pwa">Manage your farm finances</p>
                </div>

                <!-- Enhanced Stats Grid -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa">${this.formatCurrency(stats.totalIncome)}</div>
                        <div class="stat-label-pwa">Total Income</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💸</div>
                        <div class="stat-value-pwa">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div class="stat-label-pwa">Total Expenses</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📊</div>
                        <div class="stat-value-pwa" style="${stats.netProfit >= 0 ? 'color: var(--success-color)' : 'color: var(--error-color)'}">
                            ${this.formatCurrency(stats.netProfit)}
                        </div>
                        <div class="stat-label-pwa">Net Profit</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <div class="quick-grid-pwa">
                        <button class="quick-action-btn-pwa" id="add-income-btn">
                            <div class="quick-icon-pwa">💰</div>
                            <div class="quick-text-pwa">
                                <div class="quick-title-pwa">Add Income</div>
                                <div class="quick-desc-pwa">Record new income</div>
                            </div>
                        </button>
                        <button class="quick-action-btn-pwa" id="add-expense-btn">
                            <div class="quick-icon-pwa">💸</div>
                            <div class="quick-text-pwa">
                                <div class="quick-title-pwa">Add Expense</div>
                                <div class="quick-desc-pwa">Record new expense</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Transaction Form -->
                <div id="transaction-form-container" class="form-container-pwa hidden">
                    <h3 class="form-title-pwa" id="form-title">Add Transaction</h3>
                    <form id="transaction-form">
                        <div class="form-grid-pwa">
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Type</label>
                                <select class="form-select-pwa" id="transaction-type" required>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div class="form-group-pwa">
                                <label class="form-label-pwa">Amount</label>
                                <input type="number" class="form-input-pwa" id="transaction-amount" step="0.01" min="0" required>
                            </div>
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Category</label>
                            <select class="form-select-pwa" id="transaction-category" required>
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
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Description</label>
                            <input type="text" class="form-input-pwa" id="transaction-description" required>
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Date</label>
                            <input type="date" class="form-input-pwa" id="transaction-date" required>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button type="submit" class="btn-primary-pwa">Save Transaction</button>
                            <button type="button" class="btn-outline-pwa" id="cancel-form">Cancel</button>
                        </div>
                    </form>
                </div>

                <!-- Transactions List -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Transactions</h3>
                        <button class="btn-outline-pwa" id="clear-all">Clear All</button>
                    </div>
                    <div class="transactions-list-pwa" id="transactions-list">
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
            netProfit: totalIncome - totalExpenses
        };
    },

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return `
                <div class="empty-state-pwa">
                    <div class="empty-icon-pwa">📋</div>
                    <div class="empty-title-pwa">No transactions yet</div>
                    <div class="empty-desc-pwa">Add your first transaction to get started</div>
                </div>
            `;
        }

        return this.transactions.map(transaction => {
            const isIncome = transaction.type === 'income';
            const icon = isIncome ? '💰' : '💸';
            const amountClass = isIncome ? 'income' : 'expense';
            
            return `
                <div class="transaction-item-pwa ${transaction.type}" data-id="${transaction.id}">
                    <div class="transaction-info-pwa">
                        <div class="transaction-icon-pwa">${icon}</div>
                        <div class="transaction-details-pwa">
                            <div class="transaction-title-pwa">${transaction.description}</div>
                            <div class="transaction-meta-pwa">
                                <span>${this.formatCategory(transaction.category)}</span>
                                <span>•</span>
                                <span>${transaction.date}</span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount-pwa ${amountClass}">
                        ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
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
        
        // Delete transaction handlers
        document.addEventListener('click', (e) => {
            const transactionItem = e.target.closest('.transaction-item-pwa');
            if (transactionItem) {
                const id = parseInt(transactionItem.dataset.id);
                this.deleteTransaction(id);
            }
        });

        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) dateInput.value = today;

        // Add hover effects to quick action buttons
        const quickButtons = document.querySelectorAll('.quick-action-btn-pwa');
        quickButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
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
        const formContainer = document.getElementById('transaction-form-container');
        formContainer.classList.add('hidden');
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
        
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification('Transaction added successfully!', 'success');
        }
    },

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveData();
            this.renderModule();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('Transaction deleted!', 'success');
            }
        }
    },

    clearAllTransactions() {
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveData();
            this.renderModule();
            
            if (window.coreModule && window.coreModule.showNotification) {
                window.coreModule.showNotification('All transactions cleared!', 'success');
            }
        }
    },

    formatCategory(category) {
        const categories = {
            'egg-sales': 'Egg Sales',
            'poultry-sales': 'Poultry Sales',
            'crop-sales': 'Crop Sales',
            'feed': 'Feed',
            'medication': 'Medication',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'other': 'Other'
        };
        return categories[category] || category;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    }
};

// Register the module
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered successfully');
} else {
    console.error('❌ FarmModules framework not available');
}
