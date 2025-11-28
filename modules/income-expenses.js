// modules/income-expenses.js - USE THIS EXACT VERSION
console.log('Loading income-expenses module...');

FarmModules.registerModule('income-expenses', {
    name: 'Income & Expenses',
    icon: '💰',
    
    template: `
        <div class="income-expenses-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Income & Expenses</h1>
                <p class="module-subtitle-pwa">Manage your farm finances</p>
            </div>

            <div class="stats-grid-pwa">
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">💰</div>
                    <div class="stat-value-pwa">$0</div>
                    <div class="stat-label-pwa">Total Income</div>
                </div>
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">💸</div>
                    <div class="stat-value-pwa">$0</div>
                    <div class="stat-label-pwa">Total Expenses</div>
                </div>
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">📊</div>
                    <div class="stat-value-pwa">$0</div>
                    <div class="stat-label-pwa">Net Profit</div>
                </div>
            </div>

            <div class="quick-actions-pwa">
                <div class="quick-grid-pwa">
                    <button class="quick-action-btn-pwa" id="add-income-btn">
                        <div class="quick-icon-pwa">💰</div>
                        <div class="quick-title-pwa">Add Income</div>
                        <div class="quick-desc-pwa">Record new income</div>
                    </button>
                    <button class="quick-action-btn-pwa" id="add-expense-btn">
                        <div class="quick-icon-pwa">💸</div>
                        <div class="quick-title-pwa">Add Expense</div>
                        <div class="quick-desc-pwa">Record new expense</div>
                    </button>
                </div>
            </div>

            <div class="transactions-section-pwa">
                <div class="section-header-pwa">
                    <h3 class="section-title-pwa">Recent Transactions</h3>
                    <button class="btn-outline-pwa" id="clear-all">Clear All</button>
                </div>
                <div class="transactions-list-pwa" id="transactions-list">
                    <!-- Transactions will load here -->
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('💰 Initializing income & expenses...');
        this.loadData();
        this.showContent();
        this.setupEventListeners();
        this.updateStats();
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }
        contentArea.innerHTML = this.template;
        this.renderTransactionsList();
    },

    loadData: function() {
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : [];
    },

    renderTransactionsList: function() {
        const list = document.getElementById('transactions-list');
        if (!list) return;

        if (this.transactions.length === 0) {
            list.innerHTML = '<div class="empty-state">No transactions yet</div>';
            return;
        }

        list.innerHTML = this.transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-icon">${t.type === 'income' ? '💰' : '💸'}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${t.description}</div>
                    <div class="transaction-meta">${t.category} • ${t.date}</div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount}
                </div>
            </div>
        `).join('');
    },

    setupEventListeners: function() {
        // Just basic click handlers - no changes
        document.getElementById('add-income-btn')?.addEventListener('click', () => {
            this.addTransaction('income');
        });
        document.getElementById('add-expense-btn')?.addEventListener('click', () => {
            this.addTransaction('expense');
        });
        document.getElementById('clear-all')?.addEventListener('click', () => {
            this.clearTransactions();
        });
    },

    addTransaction: function(type) {
        const amount = prompt(`Enter ${type} amount:`);
        if (!amount) return;

        const transaction = {
            id: Date.now(),
            type: type,
            amount: parseFloat(amount),
            description: prompt('Description:') || `${type} transaction`,
            category: 'other',
            date: new Date().toISOString().split('T')[0]
        };

        this.transactions.push(transaction);
        this.saveData();
        this.renderTransactionsList();
        this.updateStats();
    },

    clearTransactions: function() {
        if (confirm('Clear all transactions?')) {
            this.transactions = [];
            this.saveData();
            this.renderTransactionsList();
            this.updateStats();
        }
    },

    updateStats: function() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const profit = income - expenses;

        // Update the stats cards
        const stats = document.querySelectorAll('.stat-value-pwa');
        if (stats[0]) stats[0].textContent = `$${income}`;
        if (stats[1]) stats[1].textContent = `$${expenses}`;
        if (stats[2]) stats[2].textContent = `$${profit}`;
    },

    saveData: function() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    }
});

console.log('✅ Income & Expenses module registered');
