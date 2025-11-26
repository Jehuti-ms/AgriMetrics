// modules/income-expenses.js - ENHANCED PWA STYLE
console.log('Loading enhanced PWA income-expenses module...');

class IncomeExpensesModule {
    constructor() {
        this.moduleId = 'income-expenses';
        this.moduleName = 'Income & Expenses';
        this.transactions = [];
        this.filter = 'all';
        this.editingTransaction = null;
        this.currentView = 'list';
        this.categories = {
            income: ['Crop Sales', 'Livestock Sales', 'Equipment Rental', 'Government Grants', 'Other Income'],
            expense: ['Feed & Supplements', 'Veterinary Care', 'Equipment Maintenance', 'Labor Costs', 'Utilities', 'Seeds & Plants', 'Fuel', 'Rent', 'Other Expenses']
        };
    }

    init() {
        console.log('💰 Initializing enhanced income-expenses module...');
        this.loadTransactions();
        return true;
    }

    render(container) {
        console.log('🎨 Rendering enhanced income-expenses interface...');
        
        container.innerHTML = this.getModuleHTML();
        this.attachEventListeners();
        this.renderTransactions();
        this.updateFinancialSummary();
        this.setupOfflineDetection();
        
        return true;
    }

    getModuleHTML() {
        return `
            <div class="module-container">
                <!-- Enhanced Header -->
                <div class="module-header enhanced-header">
                    <div class="header-content">
                        <div class="header-badge">💰 FINANCIAL MANAGEMENT</div>
                        <h1>Income & Expenses</h1>
                        <p>Track all farm financial transactions with advanced analytics</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary with-icon" id="add-income-btn">
                            <span class="btn-icon">💰</span>
                            Add Income
                        </button>
                        <button class="btn btn-secondary with-icon" id="add-expense-btn">
                            <span class="btn-icon">💸</span>
                            Add Expense
                        </button>
                    </div>
                </div>

                <!-- Financial Summary -->
                <div class="financial-summary enhanced-summary">
                    <div class="summary-card income-card">
                        <div class="summary-header">
                            <div class="summary-icon">📈</div>
                            <div class="summary-trend" id="income-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Total Income</div>
                            <div class="summary-value" id="total-income">$0.00</div>
                            <div class="summary-subtext" id="income-period">This month</div>
                        </div>
                    </div>
                    
                    <div class="summary-card expense-card">
                        <div class="summary-header">
                            <div class="summary-icon">📉</div>
                            <div class="summary-trend" id="expense-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Total Expenses</div>
                            <div class="summary-value" id="total-expenses">$0.00</div>
                            <div class="summary-subtext" id="expense-period">This month</div>
                        </div>
                    </div>
                    
                    <div class="summary-card net-card">
                        <div class="summary-header">
                            <div class="summary-icon">⚖️</div>
                            <div class="summary-trend" id="net-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Net Profit</div>
                            <div class="summary-value" id="net-profit">$0.00</div>
                            <div class="summary-subtext" id="profit-status">Calculating...</div>
                        </div>
                    </div>
                    
                    <div class="summary-card efficiency-card">
                        <div class="summary-header">
                            <div class="summary-icon">📊</div>
                            <div class="summary-trend" id="efficiency-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Profit Margin</div>
                            <div class="summary-value" id="profit-margin">0%</div>
                            <div class="summary-subtext">Return on operations</div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Controls -->
                <div class="finance-controls enhanced-controls">
                    <div class="control-group left-controls">
                        <div class="filter-group">
                            <label>Transaction Type</label>
                            <select id="type-filter" class="enhanced-select">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Time Period</label>
                            <select id="time-filter" class="enhanced-select">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week" selected>This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Category</label>
                            <select id="category-filter" class="enhanced-select">
                                <option value="all">All Categories</option>
                                <!-- Categories populated dynamically -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="control-group right-controls">
                        <div class="search-box">
                            <input type="text" id="transaction-search" placeholder="Search transactions..." class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        <div class="view-toggle enhanced-toggle">
                            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
                                <span class="btn-icon">📋</span>
                                List
                            </button>
                            <button class="view-btn ${this.currentView === 'chart' ? 'active' : ''}" data-view="chart">
                                <span class="btn-icon">📊</span>
                                Charts
                            </button>
                            <button class="view-btn" data-view="export">
                                <span class="btn-icon">📤</span>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sync Status -->
                <div class="sync-status-bar" id="sync-status">
                    <div class="sync-indicator online">
                        <span class="sync-dot"></span>
                        <span class="sync-text">All changes saved online</span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="finance-content enhanced-content">
                    <!-- List View -->
                    <div class="content-view ${this.currentView === 'list' ? 'active' : ''}" id="list-view">
                        <div class="transactions-table enhanced-table">
                            <div class="table-header sticky-header">
                                <div class="table-row">
                                    <div class="table-cell">Date</div>
                                    <div class="table-cell">Type</div>
                                    <div class="table-cell">Category</div>
                                    <div class="table-cell">Description</div>
                                    <div class="table-cell">Amount</div>
                                    <div class="table-cell">Status</div>
                                    <div class="table-cell actions-cell">Actions</div>
                                </div>
                            </div>
                            <div class="table-body" id="transactions-table-body">
                                <!-- Transactions populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chart View -->
                    <div class="content-view ${this.currentView === 'chart' ? 'active' : ''}" id="chart-view">
                        <div class="charts-grid">
                            <div class="chart-card full-width">
                                <div class="chart-header">
                                    <h4>Income vs Expenses Trend</h4>
                                    <select id="chart-period" class="chart-control">
                                        <option value="7">Last 7 Days</option>
                                        <option value="30" selected>Last 30 Days</option>
                                        <option value="90">Last 90 Days</option>
                                        <option value="365">Last Year</option>
                                    </select>
                                </div>
                                <div class="chart-container">
                                    <canvas id="trend-chart"></canvas>
                                </div>
                            </div>
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h4>Income Categories</h4>
                                </div>
                                <div class="chart-container">
                                    <canvas id="income-pie-chart"></canvas>
                                </div>
                            </div>
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h4>Expense Categories</h4>
                                </div>
                                <div class="chart-container">
                                    <canvas id="expense-pie-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Export View -->
                    <div class="content-view" id="export-view">
                        <div class="export-options modern-card">
                            <h3>Export Financial Data</h3>
                            <div class="export-form">
                                <div class="form-group">
                                    <label>Export Format</label>
                                    <select id="export-format" class="enhanced-select">
                                        <option value="csv">CSV (Excel)</option>
                                        <option value="json">JSON</option>
                                        <option value="pdf">PDF Report</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <div class="date-range">
                                        <input type="date" id="export-start-date" class="enhanced-input">
                                        <span>to</span>
                                        <input type="date" id="export-end-date" class="enhanced-input">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Include</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="include-income" checked>
                                            <span class="checkmark"></span>
                                            Income Transactions
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="include-expenses" checked>
                                            <span class="checkmark"></span>
                                            Expense Transactions
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="include-summary" checked>
                                            <span class="checkmark"></span>
                                            Financial Summary
                                        </label>
                                    </div>
                                </div>
                                <button class="btn btn-primary with-icon" id="generate-export">
                                    <span class="btn-icon">📤</span>
                                    Generate Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Add Floating Button -->
                <div class="floating-actions">
                    <button class="floating-btn primary" id="quick-add-btn" title="Quick Add Transaction">
                        <span class="floating-icon">+</span>
                    </button>
                </div>
            </div>

            <!-- Add Transaction Modal -->
            <div class="modal-overlay enhanced-modal hidden" id="transaction-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="transaction-modal-title">Add Transaction</h3>
                        <button class="modal-close" id="transaction-modal-close">×</button>
                    </div>
                    <form class="modal-form enhanced-form" id="transaction-form">
                        <input type="hidden" id="transaction-id">
                        
                        <div class="form-section">
                            <h4>Transaction Details</h4>
                            <div class="form-grid triple">
                                <div class="form-group">
                                    <label for="transaction-type">Type *</label>
                                    <select id="transaction-type" required class="enhanced-select">
                                        <option value="income">💰 Income</option>
                                        <option value="expense">💸 Expense</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="transaction-date">Date *</label>
                                    <input type="date" id="transaction-date" required class="enhanced-input">
                                </div>
                                <div class="form-group">
                                    <label for="transaction-category">Category *</label>
                                    <select id="transaction-category" required class="enhanced-select">
                                        <option value="">Select category...</option>
                                        <!-- Categories populated dynamically -->
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <div class="form-grid double">
                                <div class="form-group">
                                    <label for="transaction-amount">Amount ($) *</label>
                                    <input type="number" id="transaction-amount" required 
                                           step="0.01" min="0.01" placeholder="0.00"
                                           class="enhanced-input">
                                </div>
                                <div class="form-group">
                                    <label for="transaction-method">Payment Method</label>
                                    <select id="transaction-method" class="enhanced-select">
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="mobile">Mobile Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <label for="transaction-description">Description</label>
                            <textarea id="transaction-description" rows="3" 
                                      placeholder="Describe this transaction (optional)"
                                      class="enhanced-textarea"></textarea>
                        </div>

                        <div class="form-section">
                            <label for="transaction-notes">Additional Notes</label>
                            <textarea id="transaction-notes" rows="2" 
                                      placeholder="Any additional information..."
                                      class="enhanced-textarea"></textarea>
                        </div>

                        <div class="form-preview" id="transaction-preview">
                            <!-- Preview will be shown here -->
                        </div>

                        <div class="form-actions enhanced-actions">
                            <button type="button" class="btn btn-secondary" id="transaction-cancel-btn">
                                Cancel
                            </button>
                            <div class="action-group">
                                <button type="button" class="btn btn-outline" id="save-draft-btn">
                                    Save Draft
                                </button>
                                <button type="submit" class="btn btn-primary with-icon">
                                    <span class="btn-icon">💾</span>
                                    Save Transaction
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Quick Add Modal -->
            <div class="modal-overlay quick-modal hidden" id="quick-add-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Quick Add Transaction</h3>
                        <button class="modal-close" id="quick-modal-close">×</button>
                    </div>
                    <div class="quick-form" id="quick-add-form">
                        <div class="quick-options">
                            <button class="quick-option" data-type="income" data-category="Crop Sales">
                                <span class="option-icon">🌾</span>
                                <span class="option-label">Crop Sale</span>
                            </button>
                            <button class="quick-option" data-type="income" data-category="Livestock Sales">
                                <span class="option-icon">🐔</span>
                                <span class="option-label">Livestock Sale</span>
                            </button>
                            <button class="quick-option" data-type="expense" data-category="Feed & Supplements">
                                <span class="option-icon">🌾</span>
                                <span class="option-label">Feed Purchase</span>
                            </button>
                            <button class="quick-option" data-type="expense" data-category="Veterinary Care">
                                <span class="option-icon">💊</span>
                                <span class="option-label">Vet Expense</span>
                            </button>
                        </div>
                        <div class="quick-details hidden" id="quick-details">
                            <input type="number" class="quick-amount" placeholder="Amount" step="0.01" min="0.01">
                            <button class="btn btn-primary" id="confirm-quick-add">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Action buttons
        document.getElementById('add-income-btn').addEventListener('click', () => {
            this.showTransactionModal('income');
        });

        document.getElementById('add-expense-btn').addEventListener('click', () => {
            this.showTransactionModal('expense');
        });

        // Filters
        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filterTransactions();
        });

        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.filterTransactions();
            this.updateFinancialSummary();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterTransactions();
        });

        // Search
        document.getElementById('transaction-search').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Chart controls
        const chartPeriod = document.getElementById('chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.renderCharts();
            });
        }

        // Export
        document.getElementById('generate-export').addEventListener('click', () => {
            this.generateExport();
        });

        // Floating action button
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.showQuickAddModal();
        });

        // Modal events
        this.setupModalEvents();
        this.setupQuickModalEvents();

        // Offline detection
        this.setupOfflineDetection();
    }

    setupModalEvents() {
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const closeBtn = document.getElementById('transaction-modal-close');
        const cancelBtn = document.getElementById('transaction-cancel-btn');
        const typeSelect = document.getElementById('transaction-type');
        const categorySelect = document.getElementById('transaction-category');
        const amountInput = document.getElementById('transaction-amount');

        // Close events
        closeBtn.addEventListener('click', () => this.hideTransactionModal());
        cancelBtn.addEventListener('click', () => this.hideTransactionModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideTransactionModal();
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });

        // Dynamic form updates
        typeSelect.addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
            this.updateTransactionPreview();
        });

        amountInput.addEventListener('input', () => this.updateTransactionPreview());

        // Set default date
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];

        // Initialize categories
        this.updateCategoryOptions('income');
    }

    setupQuickModalEvents() {
        const modal = document.getElementById('quick-add-modal');
        const closeBtn = document.getElementById('quick-modal-close');
        const quickOptions = document.querySelectorAll('.quick-option');
        const confirmBtn = document.getElementById('confirm-quick-add');

        closeBtn.addEventListener('click', () => this.hideQuickAddModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideQuickAddModal();
        });

        quickOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const category = e.currentTarget.dataset.category;
                this.selectQuickOption(type, category);
            });
        });

        confirmBtn.addEventListener('click', () => {
            this.confirmQuickAdd();
        });
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.updateSyncStatus('online');
            this.syncOfflineTransactions();
        });

        window.addEventListener('offline', () => {
            this.updateSyncStatus('offline');
        });

        this.updateSyncStatus(navigator.onLine ? 'online' : 'offline');
    }

    updateSyncStatus(status) {
        const syncBar = document.getElementById('sync-status');
        if (!syncBar) return;

        const indicator = syncBar.querySelector('.sync-indicator');
        const text = syncBar.querySelector('.sync-text');

        if (status === 'online') {
            indicator.className = 'sync-indicator online';
            text.textContent = 'All changes saved online';
        } else {
            indicator.className = 'sync-indicator offline';
            text.textContent = 'Working offline - changes will sync when online';
        }
    }

    showTransactionModal(type = 'income', transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');
        const form = document.getElementById('transaction-form');
        const typeSelect = document.getElementById('transaction-type');

        this.editingTransaction = transaction;

        if (transaction) {
            title.textContent = 'Edit Transaction';
            this.populateTransactionForm(transaction);
        } else {
            title.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
            form.reset();
            typeSelect.value = type;
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
        }

        this.updateCategoryOptions(type);
        this.updateTransactionPreview();
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('transaction-amount').focus();
        }, 100);
    }

    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('transaction-category');
        if (!categorySelect) return;

        const categories = this.categories[type] || [];
        categorySelect.innerHTML = '<option value="">Select category...</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Also update filter dropdown
        this.updateCategoryFilter();
    }

    updateCategoryFilter() {
        const filterSelect = document.getElementById('category-filter');
        if (!filterSelect) return;

        const allCategories = [...this.categories.income, ...this.categories.expense];
        const uniqueCategories = [...new Set(allCategories)];
        
        // Keep current selection
        const currentValue = filterSelect.value;
        
        filterSelect.innerHTML = '<option value="all">All Categories</option>';
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterSelect.appendChild(option);
        });
        
        // Restore selection if it exists
        if (uniqueCategories.includes(currentValue)) {
            filterSelect.value = currentValue;
        }
    }

    populateTransactionForm(transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-method').value = transaction.method || 'cash';
        document.getElementById('transaction-description').value = transaction.description || '';
        document.getElementById('transaction-notes').value = transaction.notes || '';
    }

    hideTransactionModal() {
        document.getElementById('transaction-modal').classList.add('hidden');
        this.editingTransaction = null;
    }

    saveTransaction() {
        const formData = new FormData(document.getElementById('transaction-form'));
        const transaction = {
            id: this.editingTransaction ? this.editingTransaction.id : this.generateId(),
            type: formData.get('transaction-type'),
            date: formData.get('transaction-date'),
            category: formData.get('transaction-category'),
            amount: parseFloat(formData.get('transaction-amount')),
            method: formData.get('transaction-method'),
            description: formData.get('transaction-description'),
            notes: formData.get('transaction-notes'),
            createdAt: this.editingTransaction ? this.editingTransaction.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            synced: navigator.onLine
        };

        if (this.editingTransaction) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === this.editingTransaction.id);
            if (index !== -1) {
                this.transactions[index] = { ...this.transactions[index], ...transaction };
            }
        } else {
            // Add new transaction
            this.transactions.unshift(transaction);
        }

        this.saveTransactions();
        this.renderTransactions();
        this.updateFinancialSummary();
        this.hideTransactionModal();

        this.showNotification(
            `Transaction ${this.editingTransaction ? 'updated' : 'added'} successfully`,
            'success'
        );

        // Sync if online
        if (navigator.onLine) {
            this.syncTransactions();
        }
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(transaction => transaction.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateFinancialSummary();
            this.showNotification('Transaction deleted successfully', 'success');
        }
    }

    renderTransactions() {
        const container = document.getElementById('transactions-table-body');
        if (!container) return;

        let filteredTransactions = this.getFilteredTransactions();

        if (filteredTransactions.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        container.innerHTML = filteredTransactions.map(transaction => this.getTransactionHTML(transaction)).join('');
        this.attachTransactionEventListeners();
    }

    getFilteredTransactions() {
        let filtered = [...this.transactions];

        // Apply type filter
        const typeFilter = document.getElementById('type-filter').value;
        if (typeFilter && typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Apply category filter
        const categoryFilter = document.getElementById('category-filter').value;
        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        // Apply time filter
        filtered = this.applyTimeFilter(filtered);

        // Apply search filter
        const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.description?.toLowerCase().includes(searchTerm) ||
                t.category?.toLowerCase().includes(searchTerm) ||
                t.notes?.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    applyTimeFilter(transactions) {
        const now = new Date();
        switch (this.filter) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                return transactions.filter(t => t.date === today);
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return transactions.filter(t => new Date(t.date) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return transactions.filter(t => new Date(t.date) >= monthAgo);
            case 'quarter':
                const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                return transactions.filter(t => new Date(t.date) >= quarterAgo);
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return transactions.filter(t => new Date(t.date) >= yearAgo);
            default:
                return transactions;
        }
    }

    getEmptyStateHTML() {
        return `
            <div class="table-row empty-row">
                <div class="table-cell" colspan="7">
                    <div class="empty-state enhanced-empty">
                        <div class="empty-icon">💰</div>
                        <h4>No Transactions Found</h4>
                        <p>Get started by recording your first income or expense</p>
                        <div class="empty-actions">
                            <button class="btn btn-primary" onclick="incomeExpensesModule.showTransactionModal('income')">
                                Add First Income
                            </button>
                            <button class="btn btn-secondary" onclick="incomeExpensesModule.showTransactionModal('expense')">
                                Add First Expense
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTransactionHTML(transaction) {
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountPrefix = isIncome ? '+' : '-';
        const status = transaction.synced ? 'synced' : 'pending';

        return `
            <div class="table-row transaction-${transaction.type}" data-id="${transaction.id}">
                <div class="table-cell">
                    <div class="date-display">
                        <div class="date-main">${this.formatDate(transaction.date)}</div>
                        <div class="date-sub">${this.formatTime(transaction.createdAt)}</div>
                    </div>
                </div>
                <div class="table-cell">
                    <span class="type-badge type-${transaction.type}">
                        ${isIncome ? '💰' : '💸'} ${transaction.type}
                    </span>
                </div>
                <div class="table-cell">
                    <div class="category-info">
                        <div class="category-name">${transaction.category}</div>
                        ${transaction.method ? `<div class="method-badge">${transaction.method}</div>` : ''}
                    </div>
                </div>
                <div class="table-cell">
                    <div class="description">
                        <div class="description-main">${transaction.description || 'No description'}</div>
                        ${transaction.notes ? `<div class="description-notes">${transaction.notes}</div>` : ''}
                    </div>
                </div>
                <div class="table-cell">
                    <span class="amount ${amountClass}">
                        ${amountPrefix}$${transaction.amount.toFixed(2)}
                    </span>
                </div>
                <div class="table-cell">
                    <span class="status-badge status-${status}">
                        ${status === 'synced' ? '✅ Synced' : '⏳ Pending'}
                    </span>
                </div>
                <div class="table-cell actions-cell">
                    <div class="action-buttons">
                        <button class="btn-icon edit-transaction" title="Edit transaction">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="btn-icon delete-transaction" title="Delete transaction">
                            <span class="icon">🗑️</span>
                        </button>
                        <button class="btn-icon duplicate-transaction" title="Duplicate transaction">
                            <span class="icon">📋</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachTransactionEventListeners() {
        const container = document.getElementById('transactions-table-body');

        container.querySelectorAll('.edit-transaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('.table-row').dataset.id;
                const transaction = this.transactions.find(t => t.id === transactionId);
                if (transaction) this.showTransactionModal(transaction.type, transaction);
            });
        });

        container.querySelectorAll('.delete-transaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('.table-row').dataset.id;
                this.deleteTransaction(transactionId);
            });
        });

        container.querySelectorAll('.duplicate-transaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('.table-row').dataset.id;
                const transaction = this.transactions.find(t => t.id === transactionId);
                if (transaction) {
                    const duplicated = {
                        ...transaction,
                        id: this.generateId(),
                        date: new Date().toISOString().split('T')[0],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    this.transactions.unshift(duplicated);
                    this.saveTransactions();
                    this.renderTransactions();
                    this.updateFinancialSummary();
                    this.showNotification('Transaction duplicated successfully', 'success');
                }
            });
        });
    }

    updateFinancialSummary() {
        const filteredTransactions = this.getFilteredTransactions();
        
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netProfit = income - expenses;
        const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

        this.updateElement('total-income', `$${income.toFixed(2)}`);
        this.updateElement('total-expenses', `$${expenses.toFixed(2)}`);
        this.updateElement('net-profit', `$${netProfit.toFixed(2)}`);
        this.updateElement('profit-margin', `${profitMargin.toFixed(1)}%`);

        // Update trends
        this.updateTrends(income, expenses, netProfit, profitMargin);
    }

    updateTrends(income, expenses, netProfit, profitMargin) {
        // This would compare with previous period data
        // For now, we'll set neutral trends
        this.updateElement('income-trend', '→');
        this.updateElement('expense-trend', '→');
        this.updateElement('net-trend', netProfit >= 0 ? '↗' : '↘');
        this.updateElement('efficiency-trend', profitMargin >= 0 ? '↗' : '↘');
        
        this.updateElement('profit-status', netProfit >= 0 ? 'Profitable' : 'Loss');
    }

    switchView(view) {
        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide views
        document.getElementById('list-view').classList.toggle('active', view === 'list');
        document.getElementById('chart-view').classList.toggle('active', view === 'chart');
        document.getElementById('export-view').classList.toggle('active', view === 'export');

        if (view === 'chart') {
            setTimeout(() => this.renderCharts(), 100);
        }
    }

    renderCharts() {
        // Chart implementation would go here
        console.log('Rendering financial charts...');
        // You would use Chart.js to render the trend chart and pie charts
    }

    generateExport() {
        const format = document.getElementById('export-format').value;
        const startDate = document.getElementById('export-start-date').value;
        const endDate = document.getElementById('export-end-date').value;
        
        const includeIncome = document.getElementById('include-income').checked;
        const includeExpenses = document.getElementById('include-expenses').checked;
        const includeSummary = document.getElementById('include-summary').checked;

        let dataToExport = this.transactions;

        // Filter by date range
        if (startDate) {
            dataToExport = dataToExport.filter(t => t.date >= startDate);
        }
        if (endDate) {
            dataToExport = dataToExport.filter(t => t.date <= endDate);
        }

        // Filter by type
        if (!includeIncome) {
            dataToExport = dataToExport.filter(t => t.type !== 'income');
        }
        if (!includeExpenses) {
            dataToExport = dataToExport.filter(t => t.type !== 'expense');
        }

        this.showNotification(`Exporting ${dataToExport.length} transactions as ${format.toUpperCase()}`, 'info');
        
        // Actual export implementation would go here
        // This would generate and download the file
    }

    showQuickAddModal() {
        document.getElementById('quick-add-modal').classList.remove('hidden');
    }

    hideQuickAddModal() {
        document.getElementById('quick-add-modal').classList.add('hidden');
        document.getElementById('quick-details').classList.add('hidden');
    }

    selectQuickOption(type, category) {
        this.selectedQuickType = type;
        this.selectedQuickCategory = category;
        
        document.getElementById('quick-details').classList.remove('hidden');
        document.querySelector('.quick-amount').focus();
    }

    confirmQuickAdd() {
        const amountInput = document.querySelector('.quick-amount');
        const amount = parseFloat(amountInput.value);

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const transaction = {
            id: this.generateId(),
            type: this.selectedQuickType,
            date: new Date().toISOString().split('T')[0],
            category: this.selectedQuickCategory,
            amount: amount,
            method: 'cash',
            description: `Quick ${this.selectedQuickType}: ${this.selectedQuickCategory}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            synced: navigator.onLine
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateFinancialSummary();
        this.hideQuickAddModal();

        this.showNotification('Transaction added successfully', 'success');
    }

    filterTransactions() {
        this.renderTransactions();
        this.updateFinancialSummary();
    }

    handleSearch(searchTerm) {
        this.renderTransactions();
    }

    loadTransactions() {
        const stored = localStorage.getItem('farm_transactions');
        if (stored) {
            this.transactions = JSON.parse(stored);
        }
        this.updateCategoryFilter();
    }

    saveTransactions() {
        localStorage.setItem('farm_transactions', JSON.stringify(this.transactions));
    }

    syncTransactions() {
        // Sync with backend if online
        if (navigator.onLine) {
            console.log('Syncing transactions with server...');
            // Implementation for syncing with Firebase or other backend
        }
    }

    syncOfflineTransactions() {
        // Sync any transactions that were created while offline
        const pendingTransactions = this.transactions.filter(t => !t.synced);
        if (pendingTransactions.length > 0) {
            console.log(`Syncing ${pendingTransactions.length} offline transactions...`);
            pendingTransactions.forEach(t => t.synced = true);
            this.saveTransactions();
            this.renderTransactions();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    updateTransactionPreview() {
        // Implementation for transaction preview
    }

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize and register the module
window.incomeExpensesModule = new IncomeExpensesModule();

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Enhanced PWA income-expenses module registered');
}
