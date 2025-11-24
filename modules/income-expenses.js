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
                        💰 Add Income
                    </button>
                    <button class="btn btn-secondary" id="add-expense-btn">
                        💸 Add Expense
                    </button>
                </div>
            </div>

            <div class="summary-cards">
                <div class="summary-card income">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Income</h3>
                        <div class="summary-value" id="total-income-summary">$0.00</div>
                    </div>
                </div>
                <div class="summary-card expense">
                    <div class="summary-icon">💸</div>
                    <div class="summary-content">
                        <h3>Total Expenses</h3>
                        <div class="summary-value" id="total-expenses-summary">$0.00</div>
                    </div>
                </div>
                <div class="summary-card net">
                    <div class="summary-icon">📈</div>
                    <div class="summary-content">
                        <h3>Net Profit</h3>
                        <div class="summary-value" id="net-profit-summary">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="table-section">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-body">
                            <tr>
                                <td colspan="5" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">💰</span>
                                        <h4>No transactions yet</h4>
                                        <p>Start tracking your farm's income and expenses</p>
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
                    <td colspan="5" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">💰</span>
                            <h4>No transactions yet</h4>
                            <p>Start tracking your farm's income and expenses</p>
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
                    <span class="type-badge ${transaction.type}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td class="transaction-actions">
                    <button class="btn-icon delete-transaction" onclick="FarmModules.getModule('income-expenses').deleteTransaction('${transaction.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    updateSummaryCards: function() {
        const transactions = FarmModules.appData.transactions || [];

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const netProfit = totalIncome - totalExpenses;

        this.updateElement('total-income-summary', this.formatCurrency(totalIncome));
        this.updateElement('total-expenses-summary', this.formatCurrency(totalExpenses));
        this.updateElement('net-profit-summary', this.formatCurrency(netProfit));
    },

    attachEventListeners: function() {
        const addIncomeBtn = document.getElementById('add-income-btn');
        const addExpenseBtn = document.getElementById('add-expense-btn');

        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.addSampleTransaction('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.addSampleTransaction('expense'));
        }
    },

    addSampleTransaction: function(type) {
        if (!FarmModules.appData.transactions) {
            FarmModules.appData.transactions = [];
        }

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
            date: new Date().toISOString().split('T')[0]
        };

        FarmModules.appData.transactions.push(newTransaction);
        
        this.loadTransactionData();
        this.updateSummaryCards();
        
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    deleteTransaction: function(transactionId) {
        FarmModules.appData.transactions = FarmModules.appData.transactions.filter(t => t.id !== transactionId);
        this.loadTransactionData();
        this.updateSummaryCards();
        this.showNotification('Transaction deleted', 'success');
    },

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

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        }
    }
});
