// modules/income-expenses.js
FarmModules.registerModule('income-expenses', {
    name: 'Income & Expenses',
    icon: '💰',
    template: `
        <div id="income-expenses" class="section active">
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
                    <button class="btn btn-info" id="import-transactions">
                        <span>📤</span> Import
                    </button>
                    <button class="btn btn-outline" id="export-transactions">
                        <span>📥</span> Export
                    </button>
                </div>
            </div>

            <!-- Summary Cards -->
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
                <div class="summary-card average">
                    <div class="summary-icon">📊</div>
                    <div class="summary-content">
                        <h3>Avg. Daily</h3>
                        <div class="summary-value" id="average-daily">$0.00</div>
                        <div class="summary-period">Income</div>
                    </div>
                </div>
            </div>

            <!-- Filters and Search -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>Date Range:</label>
                    <select id="date-range-filter" class="filter-select">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month" selected>This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Type:</label>
                    <select id="type-filter" class="filter-select">
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Category:</label>
                    <select id="category-filter" class="filter-select">
                        <option value="all">All Categories</option>
                        <!-- Categories will be populated dynamically -->
                    </select>
                </div>
                <div class="filter-group">
                    <input type="text" id="search-transactions" placeholder="Search transactions..." class="search-input">
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="table-section">
                <div class="table-header">
                    <h3>Transactions</h3>
                    <div class="table-actions">
                        <button class="btn btn-text" id="bulk-edit">Bulk Edit</button>
                        <button class="btn btn-text" id="delete-selected">Delete Selected</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table" id="transactions-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all"></th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-body">
                            <tr>
                                <td colspan="8" class="empty-state">
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

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Income vs Expenses Trend</h3>
                        <select id="chart-period" class="chart-filter">
                            <option value="month">Monthly</option>
                            <option value="quarter">Quarterly</option>
                            <option value="year">Yearly</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="trendChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Expense Categories</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="categoryChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `,

    sidebar: `
        <div class="income-expenses-sidebar">
            <h3>Quick Categories</h3>
            <div class="category-list">
                <div class="category-item income" data-category="crop-sales">
                    <span class="category-icon">🌱</span>
                    <span class="category-name">Crop Sales</span>
                    <span class="category-amount" id="crop-sales-amount">$0</span>
                </div>
                <div class="category-item income" data-category="livestock-sales">
                    <span class="category-icon">🐄</span>
                    <span class="category-name">Livestock Sales</span>
                    <span class="category-amount" id="livestock-sales-amount">$0</span>
                </div>
                <div class="category-item expense" data-category="feed-supplies">
                    <span class="category-icon">🌾</span>
                    <span class="category-name">Feed & Supplies</span>
                    <span class="category-amount" id="feed-supplies-amount">$0</span>
                </div>
                <div class="category-item expense" data-category="equipment">
                    <span class="category-icon">🚜</span>
                    <span class="category-name">Equipment</span>
                    <span class="category-amount" id="equipment-amount">$0</span>
                </div>
                <div class="category-item expense" data-category="labor">
                    <span class="category-icon">👨‍🌾</span>
                    <span class="category-name">Labor</span>
                    <span class="category-amount" id="labor-amount">$0</span>
                </div>
            </div>

            <div class="recent-categories">
                <h3>Recent Categories</h3>
                <div id="recent-categories-list">
                    <!-- Dynamically populated -->
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Income & Expenses module initializing...');
        this.loadTransactionData();
        this.attachEventListeners();
        this.initializeCharts();
        this.updateSummaryCards();
    },

    loadTransactionData: function() {
        const transactions = FarmModules.appData.transactions || [];
        this.renderTransactionsTable(transactions);
        this.updateCategoryFilters();
        this.updateQuickCategories();
        this.updateRecentCategories();
    },

    renderTransactionsTable: function(transactions) {
        const tbody = document.getElementById('transactions-body');
        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
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
            <tr class="transaction-row ${transaction.type}" data-id="${transaction.id}">
                <td><input type="checkbox" class="transaction-checkbox" value="${transaction.id}"></td>
                <td>${this.formatDate(transaction.date)}</td>
                <td class="transaction-description">
                    <div class="description-text">${transaction.description || 'No description'}</div>
                    ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                </td>
                <td>
                    <span class="category-badge ${transaction.category}">${this.formatCategory(transaction.category)}</span>
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">${transaction.type === 'income' ? 'Income' : 'Expense'}</span>
                </td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${parseFloat(transaction.value || 0).toFixed(2)}
                </td>
                <td>${transaction.paymentMethod || 'Cash'}</td>
                <td class="transaction-actions">
                    <button class="btn-icon edit-transaction" title="Edit" data-id="${transaction.id}">
                        ✏️
                    </button>
                    <button class="btn-icon delete-transaction" title="Delete" data-id="${transaction.id}">
                        🗑️
                    </button>
                    ${transaction.receipt ? `
                    <button class="btn-icon view-receipt" title="View Receipt" data-id="${transaction.id}">
                        📄
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    updateSummaryCards: function() {
        const transactions = FarmModules.appData.transactions || [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter transactions for current month
        const monthlyTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);

        const netProfit = totalIncome - totalExpenses;
        const averageDaily = totalIncome / now.getDate();

        this.updateElement('total-income-summary', `$${totalIncome.toFixed(2)}`);
        this.updateElement('total-expenses-summary', `$${totalExpenses.toFixed(2)}`);
        this.updateElement('net-profit-summary', `$${netProfit.toFixed(2)}`);
        this.updateElement('average-daily', `$${averageDaily.toFixed(2)}`);
    },

    updateQuickCategories: function() {
        const transactions = FarmModules.appData.transactions || [];
        const categories = {};

        transactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = { income: 0, expense: 0 };
            }
            categories[transaction.category][transaction.type] += parseFloat(transaction.value) || 0;
        });

        // Update quick category amounts
        Object.keys(categories).forEach(category => {
            const element = document.getElementById(`${category.replace(/\s+/g, '-')}-amount`);
            if (element) {
                const total = categories[category].income - categories[category].expense;
                element.textContent = `$${Math.abs(total).toFixed(0)}`;
                element.className = `category-amount ${total >= 0 ? 'positive' : 'negative'}`;
            }
        });
    },

    updateRecentCategories: function() {
        const transactions = FarmModules.appData.transactions || [];
        const recentCategories = [...new Set(transactions.slice(-10).map(t => t.category))].slice(0, 5);
        
        const container = document.getElementById('recent-categories-list');
        if (!container) return;

        if (recentCategories.length === 0) {
            container.innerHTML = '<div class="no-categories">No recent categories</div>';
            return;
        }

        container.innerHTML = recentCategories.map(category => `
            <div class="recent-category-item" data-category="${category}">
                <span class="category-name">${this.formatCategory(category)}</span>
                <button class="btn-icon filter-by-category" data-category="${category}">🔍</button>
            </div>
        `).join('');
    },

    updateCategoryFilters: function() {
        const transactions = FarmModules.appData.transactions || [];
        const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
        
        const select = document.getElementById('category-filter');
        if (!select) return;

        // Keep the "All Categories" option and add new ones
        const allOption = select.querySelector('option[value="all"]');
        select.innerHTML = '';
        select.appendChild(allOption);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.formatCategory(category);
            select.appendChild(option);
        });
    },

    initializeCharts: function() {
        if (typeof Chart === 'undefined') return;

        this.renderTrendChart();
        this.renderCategoryChart();
    },

    renderTrendChart: function() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const transactions = FarmModules.appData.transactions || [];
        const last6Months = this.getLast6Months();

        const incomeData = last6Months.map(month => 
            transactions.filter(t => t.type === 'income' && this.isSameMonth(t.date, month))
                .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0)
        );

        const expenseData = last6Months.map(month => 
            transactions.filter(t => t.type === 'expense' && this.isSameMonth(t.date, month))
                .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0)
        );

        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last6Months.map(month => month.toLocaleDateString('en', { month: 'short' })),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    renderCategoryChart: function() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const transactions = FarmModules.appData.transactions || [];
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const categories = {};
        expenseTransactions.forEach(transaction => {
            const category = transaction.category || 'Other';
            categories[category] = (categories[category] || 0) + (parseFloat(transaction.value) || 0);
        });

        if (ctx.chart) ctx.chart.destroy();

        ctx.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(cat => this.formatCategory(cat)),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#4caf50', '#2196f3', '#ff9800', '#9c27b0', 
                        '#607d8b', '#795548', '#ff5722', '#009688'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    },

    attachEventListeners: function() {
        // Add transaction buttons
        document.getElementById('add-income-btn')?.addEventListener('click', () => this.showAddTransactionModal('income'));
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.showAddTransactionModal('expense'));
        document.getElementById('add-first-transaction')?.addEventListener('click', () => this.showAddTransactionModal('income'));

        // Filter events
        document.getElementById('date-range-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('type-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('category-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('search-transactions')?.addEventListener('input', 
            this.debounce(() => this.applyFilters(), 300)
        );

        // Table actions
        document.getElementById('select-all')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        document.getElementById('delete-selected')?.addEventListener('click', () => this.deleteSelectedTransactions());

        // Quick category filters
        document.querySelectorAll('.filter-by-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.recent-category-item').dataset.category;
                document.getElementById('category-filter').value = category;
                this.applyFilters();
            });
        });

        // Transaction row actions
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
    },

    applyFilters: function() {
        const transactions = FarmModules.appData.transactions || [];
        let filtered = [...transactions];

        // Date range filter
        const dateRange = document.getElementById('date-range-filter').value;
        filtered = this.filterByDateRange(filtered, dateRange);

        // Type filter
        const typeFilter = document.getElementById('type-filter').value;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter').value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        // Search filter
        const searchTerm = document.getElementById('search-transactions').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => 
                (t.description || '').toLowerCase().includes(searchTerm) ||
                (t.notes || '').toLowerCase().includes(searchTerm) ||
                (t.category || '').toLowerCase().includes(searchTerm)
            );
        }

        this.renderTransactionsTable(filtered);
    },

    filterByDateRange: function(transactions, range) {
        const now = new Date();
        let startDate;

        switch (range) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return transactions;
        }

        return transactions.filter(t => new Date(t.date) >= startDate);
    },

    showAddTransactionModal: function(type = 'income') {
        // This would open a modal for adding transactions
        // For now, we'll simulate adding a transaction
        const newTransaction = {
            id: 'temp-' + Date.now(),
            type: type,
            description: `${type === 'income' ? 'Farm' : 'Equipment'} Sale`,
            value: type === 'income' ? 1500 : 450,
            category: type === 'income' ? 'crop-sales' : 'equipment',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            notes: 'Sample transaction'
        };

        // Add to app data
        if (!FarmModules.appData.transactions) {
            FarmModules.appData.transactions = [];
        }
        FarmModules.appData.transactions.push(newTransaction);

        // Refresh the view
        this.loadTransactionData();
        this.updateSummaryCards();
        this.initializeCharts();

        // Show success message
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    editTransaction: function(transactionId) {
        // Would open edit modal
        this.showNotification('Edit transaction: ' + transactionId, 'info');
    },

    deleteTransaction: function(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            FarmModules.appData.transactions = FarmModules.appData.transactions.filter(t => t.id !== transactionId);
            this.loadTransactionData();
            this.updateSummaryCards();
            this.initializeCharts();
            this.showNotification('Transaction deleted successfully', 'success');
        }
    },

    deleteSelectedTransactions: function() {
        const selected = document.querySelectorAll('.transaction-checkbox:checked');
        if (selected.length === 0) {
            this.showNotification('No transactions selected', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selected.length} transactions?`)) {
            selected.forEach(checkbox => {
                const transactionId = checkbox.value;
                FarmModules.appData.transactions = FarmModules.appData.transactions.filter(t => t.id !== transactionId);
            });

            this.loadTransactionData();
            this.updateSummaryCards();
            this.initializeCharts();
            this.showNotification(`${selected.length} transactions deleted`, 'success');
        }
    },

    toggleSelectAll: function(checked) {
        document.querySelectorAll('.transaction-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    },

    // Utility functions
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

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        // Use the core module's notification system
        if (window.coreModule) {
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
    },

    getLast6Months: function() {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(new Date(date.getFullYear(), date.getMonth(), 1));
        }
        return months;
    },

    isSameMonth: function(dateString, month) {
        try {
            const date = new Date(dateString);
            return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
        } catch (e) {
            return false;
        }
    }
});
