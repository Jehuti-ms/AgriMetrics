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
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Transaction Modal -->
            <div id="transaction-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="transaction-modal-title">Add Transaction</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id">
                            <div class="form-group">
                                <label for="transaction-type">Type:</label>
                                <select id="transaction-type" required>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="transaction-description">Description:</label>
                                <input type="text" id="transaction-description" required placeholder="Enter transaction description">
                            </div>
                            <div class="form-group">
                                <label for="transaction-amount">Amount ($):</label>
                                <input type="number" id="transaction-amount" step="0.01" min="0" required placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label for="transaction-category">Category:</label>
                                <select id="transaction-category" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="Income Categories">
                                        <option value="crop-sales">Crop Sales</option>
                                        <option value="livestock-sales">Livestock Sales</option>
                                        <option value="dairy-products">Dairy Products</option>
                                        <option value="poultry-products">Poultry Products</option>
                                        <option value="other-income">Other Income</option>
                                    </optgroup>
                                    <optgroup label="Expense Categories">
                                        <option value="feed-supplies">Feed & Supplies</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="labor">Labor</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="seeds-plants">Seeds & Plants</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="other-expenses">Other Expenses</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="transaction-date">Date:</label>
                                <input type="date" id="transaction-date" required>
                            </div>
                            <div class="form-group">
                                <label for="transaction-notes">Notes (Optional):</label>
                                <textarea id="transaction-notes" placeholder="Add any additional notes..." rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
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
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row ${transaction.type}">
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <div class="transaction-description">
                        <strong>${transaction.description}</strong>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="category-badge">${this.formatCategory(transaction.category)}</span>
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td class="transaction-actions">
                    <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">✏️</button>
                    <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">🗑️</button>
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
        // Add transaction buttons
        const addIncomeBtn = document.getElementById('add-income-btn');
        const addExpenseBtn = document.getElementById('add-expense-btn');

        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.showTransactionModal('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.showTransactionModal('expense'));
        }

        // Modal events
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Save transaction
        const saveBtn = document.getElementById('save-transaction');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTransaction());
        }

        // Edit and delete transactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-transaction')) {
                const transactionId = e.target.closest('.edit-transaction').dataset.id;
                this.editTransaction(transactionId);
            }
            if (e.target.closest('.delete-transaction')) {
                const transactionId = e.target.closest('.delete-transaction').dataset.id;
                this.deleteTransaction(transactionId);
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    },

    showTransactionModal: function(type = 'income') {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');
        const form = document.getElementById('transaction-form');

        if (modal && title && form) {
            // Reset form
            form.reset();
            document.getElementById('transaction-id').value = '';
            
            // Set type and title
            document.getElementById('transaction-type').value = type;
            title.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
            
            // Set today's date as default
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            
            // Show modal
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveTransaction: function() {
        const form = document.getElementById('transaction-form');
        if (!form) return;

        const transactionId = document.getElementById('transaction-id').value;
        const type = document.getElementById('transaction-type').value;
        const description = document.getElementById('transaction-description').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const date = document.getElementById('transaction-date').value;
        const notes = document.getElementById('transaction-notes').value;

        // Validation
        if (!description || !amount || !category || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        const transactionData = {
            type: type,
            description: description,
            amount: amount,
            category: category,
            date: date,
            notes: notes
        };

        if (transactionId) {
            // Update existing transaction
            this.updateTransaction(transactionId, transactionData);
        } else {
            // Add new transaction
            this.addTransaction(transactionData);
        }

        this.hideModal();
    },

    addTransaction: function(transactionData) {
        if (!FarmModules.appData.transactions) {
            FarmModules.appData.transactions = [];
        }

        const newTransaction = {
            id: 'tx-' + Date.now(),
            ...transactionData
        };

        FarmModules.appData.transactions.push(newTransaction);
        
        this.loadTransactionData();
        this.updateSummaryCards();
        
        this.showNotification(`${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    editTransaction: function(transactionId) {
        const transactions = FarmModules.appData.transactions || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');

        if (modal && title) {
            // Fill form with transaction data
            document.getElementById('transaction-id').value = transaction.id;
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-description').value = transaction.description || '';
            document.getElementById('transaction-amount').value = transaction.amount || '';
            document.getElementById('transaction-category').value = transaction.category || '';
            document.getElementById('transaction-date').value = transaction.date || '';
            document.getElementById('transaction-notes').value = transaction.notes || '';
            
            title.textContent = `Edit ${transaction.type === 'income' ? 'Income' : 'Expense'}`;
            modal.classList.remove('hidden');
        }
    },

    updateTransaction: function(transactionId, transactionData) {
        const transactions = FarmModules.appData.transactions || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                ...transactionData
            };
            
            this.loadTransactionData();
            this.updateSummaryCards();
            this.showNotification('Transaction updated successfully!', 'success');
        }
    },

    deleteTransaction: function(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            FarmModules.appData.transactions = FarmModules.appData.transactions.filter(t => t.id !== transactionId);
            this.loadTransactionData();
            this.updateSummaryCards();
            this.showNotification('Transaction deleted successfully', 'success');
        }
    },

    formatCategory: function(category) {
        if (!category) return 'Uncategorized';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
