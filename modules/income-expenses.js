// modules/income-expenses.js - PWA Style
console.log('Loading income-expenses module...');

class IncomeExpensesModule {
    constructor() {
        this.moduleId = 'income-expenses';
        this.moduleName = 'Income & Expenses';
        this.transactions = [];
        this.filter = 'all';
        this.editingId = null;
    }

    init() {
        console.log('💰 Initializing income-expenses module...');
        this.loadTransactions();
        return true;
    }

    render(container) {
        console.log('🎨 Rendering income-expenses...');
        
        container.innerHTML = this.getModuleHTML();
        this.attachEventListeners();
        this.renderTransactions();
        
        // PWA: Animate content
        this.animateContent();
    }

    getModuleHTML() {
        return `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1>Income & Expenses</h1>
                        <p>Track your farm's financial transactions</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-transaction-btn">
                            <span class="icon">➕</span>
                            Add Transaction
                        </button>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="summary-cards">
                    <div class="summary-card income">
                        <div class="summary-icon">💰</div>
                        <div class="summary-content">
                            <div class="summary-label">Total Income</div>
                            <div class="summary-value" id="total-income">$0.00</div>
                        </div>
                    </div>
                    <div class="summary-card expense">
                        <div class="summary-icon">💸</div>
                        <div class="summary-content">
                            <div class="summary-label">Total Expenses</div>
                            <div class="summary-value" id="total-expenses">$0.00</div>
                        </div>
                    </div>
                    <div class="summary-card net">
                        <div class="summary-icon">📊</div>
                        <div class="summary-content">
                            <div class="summary-label">Net Balance</div>
                            <div class="summary-value" id="net-balance">$0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="toolbar">
                    <div class="search-box">
                        <span class="icon">🔍</span>
                        <input type="text" id="search-input" placeholder="Search transactions...">
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
                            All
                        </button>
                        <button class="filter-btn ${this.filter === 'income' ? 'active' : ''}" data-filter="income">
                            Income
                        </button>
                        <button class="filter-btn ${this.filter === 'expense' ? 'active' : ''}" data-filter="expense">
                            Expenses
                        </button>
                    </div>
                </div>

                <!-- Transactions List -->
                <div class="transactions-section">
                    <div class="section-header">
                        <h2>Recent Transactions</h2>
                        <div class="section-actions">
                            <button class="btn-text" id="export-btn">
                                <span class="icon">📤</span>
                                Export
                            </button>
                        </div>
                    </div>
                    <div class="transactions-list" id="transactions-list">
                        <div class="empty-state">
                            <div class="icon">💸</div>
                            <div>No transactions yet</div>
                            <div class="subtext">Add your first income or expense</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transaction Modal -->
            <div class="modal-overlay hidden" id="transaction-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">Add Transaction</h3>
                        <button class="modal-close" id="modal-close">×</button>
                    </div>
                    <form class="modal-form" id="transaction-form">
                        <input type="hidden" id="transaction-id">
                        
                        <div class="form-group">
                            <label>Type</label>
                            <div class="radio-group">
                                <label class="radio-option">
                                    <input type="radio" name="type" value="income" checked>
                                    <span class="radio-label">Income</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="type" value="expense">
                                    <span class="radio-label">Expense</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="description" required 
                                       placeholder="e.g., Chicken sales, Feed purchase">
                            </div>
                            <div class="form-group">
                                <label>Amount ($)</label>
                                <input type="number" id="amount" required 
                                       step="0.01" min="0.01" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select id="category" required>
                                    <option value="">Select category</option>
                                    <optgroup label="Income">
                                        <option value="livestock-sales">Livestock Sales</option>
                                        <option value="crop-sales">Crop Sales</option>
                                        <option value="equipment-rental">Equipment Rental</option>
                                        <option value="other-income">Other Income</option>
                                    </optgroup>
                                    <optgroup label="Expenses">
                                        <option value="feed">Feed</option>
                                        <option value="vaccines">Vaccines & Medicine</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="labor">Labor</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="other-expense">Other Expense</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" id="date" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Notes (Optional)</label>
                            <textarea id="notes" rows="3" 
                                      placeholder="Additional notes about this transaction"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <span class="icon">💾</span>
                                Save Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Add transaction button
        document.getElementById('add-transaction-btn').addEventListener('click', () => {
            this.showTransactionModal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTransactions(e.target.value);
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportTransactions();
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('cancel-btn');

        // Open/close modal
        closeBtn.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });

        // Set today's date as default
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }

    showTransactionModal(transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('transaction-form');

        this.editingId = transaction ? transaction.id : null;

        if (transaction) {
            title.textContent = 'Edit Transaction';
            this.populateForm(transaction);
        } else {
            title.textContent = 'Add Transaction';
            form.reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.remove('hidden');
        document.getElementById('description').focus();
    }

    populateForm(transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
        document.getElementById('description').value = transaction.description || '';
        document.getElementById('amount').value = transaction.amount || '';
        document.getElementById('category').value = transaction.category || '';
        document.getElementById('date').value = transaction.date || '';
        document.getElementById('notes').value = transaction.notes || '';
    }

    hideModal() {
        document.getElementById('transaction-modal').classList.add('hidden');
        this.editingId = null;
    }

    saveTransaction() {
        const formData = new FormData(document.getElementById('transaction-form'));
        const transaction = {
            id: this.editingId || this.generateId(),
            type: formData.get('type'),
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            date: formData.get('date'),
            notes: formData.get('notes'),
            createdAt: this.editingId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.editingId) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.transactions[index] = { ...this.transactions[index], ...transaction };
            }
        } else {
            // Add new transaction
            this.transactions.unshift(transaction);
        }

        this.saveTransactions();
        this.renderTransactions();
        this.updateSummary();
        this.hideModal();

        this.showNotification(
            `Transaction ${this.editingId ? 'updated' : 'added'} successfully`,
            'success'
        );
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateSummary();
            this.showNotification('Transaction deleted', 'success');
        }
    }

    setFilter(filter) {
        this.filter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTransactions();
    }

    searchTransactions(query) {
        this.currentSearch = query.toLowerCase();
        this.renderTransactions();
    }

    renderTransactions() {
        const container = document.getElementById('transactions-list');
        if (!container) return;

        let filteredTransactions = this.transactions;

        // Apply filter
        if (this.filter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === this.filter);
        }

        // Apply search
        if (this.currentSearch) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.description.toLowerCase().includes(this.currentSearch) ||
                t.category.toLowerCase().includes(this.currentSearch) ||
                t.notes.toLowerCase().includes(this.currentSearch)
            );
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <div>No transactions found</div>
                    <div class="subtext">${this.currentSearch ? 'Try a different search' : 'Add your first transaction'}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-icon ${transaction.type}">
                    ${transaction.type === 'income' ? '💰' : '💸'}
                </div>
                <div class="transaction-content">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${this.formatCategory(transaction.category)}</span>
                        <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                        ${transaction.notes ? `<span class="transaction-notes">${transaction.notes}</span>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-icon edit-btn" title="Edit">
                        <span class="icon">✏️</span>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete">
                        <span class="icon">🗑️</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to action buttons
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('.transaction-item').dataset.id;
                const transaction = this.transactions.find(t => t.id === transactionId);
                if (transaction) this.showTransactionModal(transaction);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('.transaction-item').dataset.id;
                this.deleteTransaction(transactionId);
            });
        });
    }

    updateSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const net = income - expenses;

        this.updateElement('total-income', `$${income.toFixed(2)}`);
        this.updateElement('total-expenses', `$${expenses.toFixed(2)}`);
        this.updateElement('net-balance', `$${net.toFixed(2)}`);

        // Update color based on net balance
        const netElement = document.getElementById('net-balance');
        if (netElement) {
            netElement.style.color = net >= 0 ? 'var(--success)' : 'var(--error)';
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    exportTransactions() {
        const data = this.transactions.map(t => ({
            Date: t.date,
            Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
            Description: t.description,
            Category: this.formatCategory(t.category),
            Amount: t.amount,
            Notes: t.notes || ''
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Transactions exported successfully', 'success');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0] || {});
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        return csv;
    }

    loadTransactions() {
        // Load from FarmModules appData or localStorage
        const savedData = window.FarmModules?.appData?.transactions;
        if (savedData && Array.isArray(savedData)) {
            this.transactions = savedData;
        } else {
            // Try localStorage as fallback
            try {
                const localData = localStorage.getItem('farm-transactions');
                if (localData) {
                    this.transactions = JSON.parse(localData);
                }
            } catch (error) {
                console.error('Error loading transactions:', error);
            }
        }
        
        this.updateSummary();
    }

    saveTransactions() {
        // Save to FarmModules appData
        if (window.FarmModules) {
            window.FarmModules.appData.transactions = this.transactions;
            window.FarmModules.saveDataToStorage();
        }
        
        // Also save to localStorage as backup
        try {
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving transactions:', error);
        }
    }

    formatCategory(category) {
        const categories = {
            'livestock-sales': 'Livestock Sales',
            'crop-sales': 'Crop Sales',
            'equipment-rental': 'Equipment Rental',
            'other-income': 'Other Income',
            'feed': 'Feed',
            'vaccines': 'Vaccines & Medicine',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'utilities': 'Utilities',
            'other-expense': 'Other Expense'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    animateContent() {
        // Animate summary cards
        const cards = document.querySelectorAll('.summary-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }

    showNotification(message, type = 'info') {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            // Simple fallback
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Register the module
const incomeExpensesModule = new IncomeExpensesModule();
window.FarmModules.registerModule('income-expenses', incomeExpensesModule);
window.IncomeExpensesModule = incomeExpensesModule;

console.log('✅ Income & Expenses module registered');
