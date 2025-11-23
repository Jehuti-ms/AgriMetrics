// modules/income-expenses.js
FarmModules.registerModule('income-expenses', {
    name: 'Income & Expenses',
    icon: '💰',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Income & Expenses</h1>
                <p>Track your farm's financial transactions</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-income-btn">
                        <span>💰</span> Add Income
                    </button>
                    <button class="btn btn-secondary" id="add-expense-btn">
                        <span>💸</span> Add Expense
                    </button>
                </div>
            </div>

            <div class="summary-cards">
                <div class="summary-card income">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Income</h3>
                        <div class="summary-value" id="total-income-summary">$0.00</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
                <div class="summary-card expense">
                    <div class="summary-icon">💸</div>
                    <div class="summary-content">
                        <h3>Total Expenses</h3>
                        <div class="summary-value" id="total-expenses-summary">$0.00</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
                <div class="summary-card net">
                    <div class="summary-icon">📈</div>
                    <div class="summary-content">
                        <h3>Net Profit</h3>
                        <div class="summary-value" id="net-profit-summary">$0.00</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
            </div>

            <div class="filters-section">
                <div class="filter-group">
                    <select id="type-filter" class="filter-select">
                        <option value="all">All Transactions</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                    </select>
                </div>
                <div class="filter-group">
                    <input type="text" id="search-transactions" placeholder="Search transactions..." class="search-input">
                </div>
            </div>

            <div class="table-section">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-body">
                            <tr>
                                <td colspan="6" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">💰</span>
                                        <h4>No transactions yet</h4>
                                        <p>Start tracking your farm's income and expenses</p>
                                        <button class="btn btn-primary" id="add-first-transaction">Add First Transaction</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Income & Expenses module initializing...');
        this.loadTransactionData();
        this.attachEventListeners();
        this.updateSummaryCards();
    },

    loadTransactionData: function() {
        const transactions = FarmModules.appData.transactions || [];
        this.renderTransactionsTable(transactions);
    },

    renderTransactionsTable: function(transactions) {
        const tbody = document.getElementById('transactions-body');
        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">💰</span>
                            <h4>No transactions yet</h4>
                            <p>Start tracking your farm's income and expenses</p>
                            <button class="btn btn-primary" id="add-first-transaction">Add First Transaction</button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row ${transaction.type}">
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description || 'No description'}</td>
                <td>
                    <span class="category-badge">${this.formatCategory(transaction.category)}</span>
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount || transaction.value)}
                </td>
                <td class="transaction-actions">
                    <button class="btn-icon edit-transaction" title="Edit">✏️</button>
                    <button class="btn-icon delete-transaction" title="Delete">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    updateSummaryCards: function() {
        const transactions = FarmModules.appData.transactions || [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.value) || 0), 0);

        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.value) || 0), 0);

        const netProfit = totalIncome - totalExpenses;

        this.updateElement('total-income-summary', this.formatCurrency(totalIncome));
        this.updateElement('total-expenses-summary', this.formatCurrency(totalExpenses));
        this.updateElement('net-profit-summary', this.formatCurrency(netProfit));
    },

    attachEventListeners: function() {
        // Add transaction buttons
        const addIncomeBtn = document.getElementById('add-income-btn');
        const addExpenseBtn = document.getElementById('add-expense-btn');
        const addFirstBtn = document.getElementById('add-first-transaction');

        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.addSampleTransaction('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.addSampleTransaction('expense'));
        }
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => this.addSampleTransaction('income'));
        }

        // Filter events
        const typeFilter = document.getElementById('type-filter');
        const searchInput = document.getElementById('search-transactions');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        }
    },

    applyFilters: function() {
        const transactions = FarmModules.appData.transactions || [];
        let filtered = [...transactions];

        // Type filter
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter && typeFilter.value !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter.value);
        }

        // Search filter
        const searchInput = document.getElementById('search-transactions');
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(t => 
                (t.description || '').toLowerCase().includes(searchTerm) ||
                (t.category || '').toLowerCase().includes(searchTerm)
            );
        }

        this.renderTransactionsTable(filtered);
    },

    addSampleTransaction: function(type) {
        if (!FarmModules.appData.transactions) {
            FarmModules.appData.transactions = [];
        }

        const categories = {
            income: ['crop-sales', 'livestock-sales', 'dairy-products'],
            expense: ['feed-supplies', 'equipment', 'labor', 'maintenance']
        };

        const descriptions = {
            income: ['Corn Harvest Sale', 'Cattle Sale', 'Milk Production', 'Egg Sales'],
            expense: ['Animal Feed Purchase', 'Equipment Maintenance', 'Worker Wages', 'Seed Purchase']
        };

        const newTransaction = {
            id: 'tx-' + Date.now(),
            type: type,
            description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
            amount: type === 'income' ? 
                Math.floor(Math.random() * 5000) + 1000 : 
                Math.floor(Math.random() * 1000) + 100,
            category: categories[type][Math.floor(Math.random() * categories[type].length)],
            date: new Date().toISOString().split('T')[0]
        };

        FarmModules.appData.transactions.push(newTransaction);
        
        // Refresh the view
        this.loadTransactionData();
        this.updateSummaryCards();
        
        // Show success message
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    // Utility functions
    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    formatCategory: function(category) {
        if (!category) return 'Uncategorized';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
