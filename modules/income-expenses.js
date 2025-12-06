// modules/income-expenses.js - Complete with all methods
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    id: 'income-expenses',
    initialized: false,
    element: null,
    categories: {
        income: [
            { value: 'egg-sales', label: 'Egg Sales', icon: '🥚' },
            { value: 'poultry-sales', label: 'Poultry Sales', icon: '🐔' },
            { value: 'crop-sales', label: 'Crop Sales', icon: '🌽' },
            { value: 'dairy-sales', label: 'Dairy Sales', icon: '🥛' },
            { value: 'meat-sales', label: 'Meat Sales', icon: '🥩' },
            { value: 'farm-tourism', label: 'Farm Tourism', icon: '🏞️' },
            { value: 'consulting', label: 'Consulting Services', icon: '💼' },
            { value: 'grants', label: 'Grants & Subsidies', icon: '💰' },
            { value: 'other-income', label: 'Other Income', icon: '📦' }
        ],
        expense: [
            { value: 'feed', label: 'Feed & Nutrition', icon: '🌾' },
            { value: 'medication', label: 'Healthcare', icon: '💊' },
            { value: 'equipment', label: 'Equipment', icon: '🔧' },
            { value: 'labor', label: 'Labor', icon: '👷' },
            { value: 'utilities', label: 'Utilities', icon: '⚡' },
            { value: 'transportation', label: 'Transportation', icon: '🚚' },
            { value: 'maintenance', label: 'Maintenance', icon: '🔨' },
            { value: 'seeds-plants', label: 'Seeds & Plants', icon: '🌱' },
            { value: 'fertilizer', label: 'Fertilizer', icon: '🧪' },
            { value: 'insurance', label: 'Insurance', icon: '🛡️' },
            { value: 'rent', label: 'Rent & Leases', icon: '🏠' },
            { value: 'marketing', label: 'Marketing', icon: '📢' },
            { value: 'taxes', label: 'Taxes', icon: '🧾' },
            { value: 'other-expense', label: 'Other Expense', icon: '📦' }
        ]
    },
    receiptQueue: [],
    currentReceipt: null,

    // ==================== INITIALIZATION METHODS ====================

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Ensure CSS is loaded
        this.ensureModuleCSS();
        
        // Load existing data first
        this.loadData();
        
        // Render module
        this.renderModule();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load and display data
        this.loadAndDisplayData();
        
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized successfully');
        return true;
    },

    ensureModuleCSS() {
        // Check if module CSS is already loaded
        const existingLinks = document.querySelectorAll('link[href*="income-expenses.css"]');
        if (existingLinks.length > 0) {
            return;
        }
        
        // Load module CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/income-expenses.css';
        link.onerror = () => {
            console.warn('⚠️ income-expenses.css not found');
        };
        document.head.appendChild(link);
    },

    // ==================== CORE METHODS ====================

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container income">
                
                <!-- Header -->
                <div class="module-header header-flex">
                    <div class="header-left">
                        <h1>Income & Expenses</h1>
                        <p class="module-subtitle">Track your farm's financial health</p>
                        
                        <!-- Stats inline with icons -->
                        <div class="stats-inline">
                            <span class="stat-item">💰 <span id="inline-total-income">$0.00</span> Total Income</span>
                            <span class="stat-item">💸 <span id="inline-total-expenses">$0.00</span> Total Expenses</span>
                            <span class="stat-item">🪙 <span id="inline-net-profit">$0.00</span> Net Profit</span>
                        </div>
                    </div>
                    
                    <!-- Right side: Add Transaction + Import Receipts -->
                    <div class="header-right">
                        <button id="add-transaction-btn" class="btn btn-primary">
                            <span class="btn-icon">➕</span>
                            <span class="btn-text">Add Transaction</span>
                        </button>
                        <button id="import-receipts-btn" class="btn btn-secondary">
                            <span class="btn-icon">📥</span>
                            <span class="btn-text">Import Receipts</span>
                            <span id="receipt-count-badge" class="badge badge-error" style="display: none">0</span>
                        </button>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="card-grid">
                        <button id="quick-income-btn" class="card-button" data-action="quick-income">
                            <div class="card-icon">💰</div>
                            <span class="card-title">Quick Income</span>
                            <span class="card-subtitle">Record income instantly</span>
                        </button>
                        <button id="quick-expense-btn" class="card-button" data-action="quick-expense">
                            <div class="card-icon">🧾</div>
                            <span class="card-title">Quick Expense</span>
                            <span class="card-subtitle">Record expense instantly</span>
                        </button>
                        <button id="view-reports-btn" class="card-button" data-action="view-reports">
                            <div class="card-icon">📊</div>
                            <span class="card-title">View Reports</span>
                            <span class="card-subtitle">Financial analytics</span>
                        </button>
                        <button id="manage-categories-btn" class="card-button" data-action="manage-categories">
                            <div class="card-icon">📂</div>
                            <span class="card-title">Categories</span>
                            <span class="card-subtitle">Manage categories</span>
                        </button>
                    </div>
                </div>
                
                <!-- Financial Overview -->
                <div class="overview-section">
                    <h2 class="section-title">Financial Overview</h2>
                    <div class="card-grid">
                        <div class="stat-card" id="monthly-income-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value" id="monthly-income">$0.00</div>
                            <div class="stat-label">This Month</div>
                        </div>
                        <div class="stat-card" id="avg-monthly-card">
                            <div class="stat-icon">📈</div>
                            <div class="stat-value" id="avg-monthly-income">$0.00</div>
                            <div class="stat-label">Avg Monthly</div>
                        </div>
                        <div class="stat-card" id="transactions-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-transactions">0</div>
                            <div class="stat-label">Transactions</div>
                        </div>
                        <div class="stat-card" id="categories-card">
                            <div class="stat-icon">📂</div>
                            <div class="stat-value" id="total-categories">0</div>
                            <div class="stat-label">Categories</div>
                        </div>
                        <div class="stat-card" id="balance-card">
                            <div class="stat-icon">🏦</div>
                            <div class="stat-value" id="current-balance">$0.00</div>
                            <div class="stat-label">Current Balance</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Transactions & Expense Categories -->
                <div class="content-columns">
                    
                    <!-- Recent Transactions -->
                    <div class="content-column">
                        <div class="glass-card">
                            <div class="header-flex">
                                <h3>Recent Transactions</h3>
                                <button class="btn btn-outline" id="clear-all-transactions">Clear All</button>
                            </div>
                            <div id="transactions-list" class="transactions-list">
                                <!-- Transaction rows will be populated dynamically -->
                            </div>
                        </div>
                    </div>

                    <!-- Expense Categories -->
                    <div class="content-column">
                        <div class="glass-card">
                            <div class="header-flex">
                                <h3>Expense Categories</h3>
                                <button class="btn btn-outline" id="manage-categories-btn-2">Manage</button>
                            </div>
                            <div id="categories-list" class="categories-list">
                                <!-- Categories will be populated dynamically -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Receipts Section (Hidden by default) -->
                <div id="pending-receipts-section" class="pending-receipts-section" style="display: none;">
                    <div class="glass-card">
                        <div class="header-flex">
                            <h3>📥 Pending Receipts</h3>
                            <div class="header-right">
                                <button id="process-all-receipts" class="btn btn-primary">
                                    <span class="btn-icon">⚡</span>
                                    <span class="btn-text">Process All</span>
                                </button>
                                <button id="clear-pending-receipts" class="btn btn-outline">
                                    <span class="btn-icon">🗑️</span>
                                    <span class="btn-text">Clear All</span>
                                </button>
                            </div>
                        </div>
                        <div id="pending-receipts-list" class="pending-receipts-list">
                            <!-- Pending receipts will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="module-footer">
                    <div class="footer-left">
                        <button id="refresh-data-btn" class="btn btn-primary">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Refresh Data</span>
                        </button>
                    </div>
                    <div class="footer-right">
                        <button id="export-data-btn" class="btn btn-secondary" data-action="export-data">
                            <span class="btn-icon">📤</span>
                            <span class="btn-text">Export Data</span>
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    },

    loadData() {
        console.log('📊 Loading Income & Expenses data...');
        // Try to load from localStorage
        const savedData = localStorage.getItem('farm-income-expenses-data');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData.categories) {
                    this.categories = parsedData.categories;
                    console.log('✅ Categories loaded from localStorage');
                }
            } catch (e) {
                console.error('Error loading data:', e);
            }
        } else {
            console.log('ℹ️ No saved data found, using default categories');
        }
    },

    saveData() {
        console.log('💾 Saving Income & Expenses data...');
        // Save categories to localStorage
        const dataToSave = {
            categories: this.categories,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('farm-income-expenses-data', JSON.stringify(dataToSave));
        console.log('✅ Data saved to localStorage');
    },

    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.showAddTransactionModal({ type: 'income' }));
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.showAddTransactionModal({ type: 'expense' }));
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.showReportsModal());
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => this.showManageCategoriesModal());
        document.getElementById('manage-categories-btn-2')?.addEventListener('click', () => this.showManageCategoriesModal());
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        
        // Primary buttons
        document.getElementById('add-transaction-btn')?.addEventListener('click', () => this.showAddTransactionModal());
        document.getElementById('import-receipts-btn')?.addEventListener('click', () => this.showImportReceiptsModal());
        document.getElementById('clear-all-transactions')?.addEventListener('click', () => this.clearAllTransactions());
        document.getElementById('refresh-data-btn')?.addEventListener('click', () => {
            this.loadAndDisplayData();
            this.showNotification('Data refreshed!', 'success');
        });
        
        // Pending receipts buttons (will be added after section renders)
        setTimeout(() => {
            document.getElementById('process-all-receipts')?.addEventListener('click', () => this.processAllReceipts());
            document.getElementById('clear-pending-receipts')?.addEventListener('click', () => this.clearAllPendingReceipts());
        }, 100);
        
        console.log('✅ Event listeners set up');
    },

    loadAndDisplayData() {
        console.log('🔄 Loading and displaying data...');
        const data = this.getModuleData();
        this.updateDashboardDisplay(data);
        this.updateTransactionsList(data);
        this.updateCategoriesList(data);
        this.updatePendingReceiptsUI();
        console.log('✅ Data loaded and displayed');
    },

    // ==================== DATA MANAGEMENT METHODS ====================

    getModuleData() {
        console.log('📈 Getting module data...');
        let data = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            monthlyIncome: 0,
            avgMonthlyIncome: 0,
            totalTransactions: 0,
            totalCategories: 0,
            currentBalance: 0,
            recentTransactions: [],
            expenseCategories: []
        };

        // Try to get data from localStorage
        const savedData = localStorage.getItem('farm-transactions');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData.transactions) {
                    data.recentTransactions = parsedData.transactions;
                    
                    // Calculate totals
                    data.totalIncome = data.recentTransactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0);
                        
                    data.totalExpenses = data.recentTransactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0);
                        
                    data.netProfit = data.totalIncome - data.totalExpenses;
                    data.totalTransactions = data.recentTransactions.length;
                    data.currentBalance = data.netProfit;
                    
                    // Calculate expense categories
                    const categoryMap = {};
                    data.recentTransactions
                        .filter(t => t.type === 'expense')
                        .forEach(t => {
                            if (!categoryMap[t.category]) {
                                categoryMap[t.category] = { amount: 0, count: 0 };
                            }
                            categoryMap[t.category].amount += t.amount;
                            categoryMap[t.category].count += 1;
                        });
                    
                    data.expenseCategories = Object.entries(categoryMap).map(([name, stats]) => ({
                        name,
                        amount: stats.amount,
                        count: stats.count,
                        icon: this.getCategoryIcon(name)
                    }));
                    
                    data.totalCategories = data.expenseCategories.length;
                    
                    // Calculate monthly data
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const currentMonthIncome = data.recentTransactions
                        .filter(t => {
                            const date = new Date(t.date);
                            return t.type === 'income' && 
                                   date.getMonth() === currentMonth && 
                                   date.getFullYear() === currentYear;
                        })
                        .reduce((sum, t) => sum + t.amount, 0);
                    
                    data.monthlyIncome = currentMonthIncome;
                    data.avgMonthlyIncome = data.totalIncome / Math.max(1, (new Date().getMonth() + 1));
                    
                    console.log(`✅ Loaded ${data.totalTransactions} transactions from localStorage`);
                }
            } catch (e) {
                console.error('Error loading transaction data:', e);
            }
        }

        // Use sample data for demo if empty
        if (data.totalTransactions === 0) {
            console.log('ℹ️ Using sample data for demo');
            data = this.getSampleData();
        }

        return data;
    },

    getSampleData() {
        console.log('🎭 Generating sample data...');
        const sampleTransactions = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                description: 'Egg Sales - Weekly Batch',
                category: 'Egg Sales',
                type: 'income',
                amount: 1200,
                status: 'completed',
                icon: '🥚'
            },
            {
                id: 2,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                description: 'Organic Chicken Feed',
                category: 'Feed & Nutrition',
                type: 'expense',
                amount: 450,
                status: 'completed',
                icon: '🌾'
            },
            {
                id: 3,
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                description: 'Chicken Sales - Batch #42',
                category: 'Poultry Sales',
                type: 'income',
                amount: 2800,
                status: 'completed',
                icon: '🐔'
            },
            {
                id: 4,
                date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                description: 'Veterinary Services',
                category: 'Healthcare',
                type: 'expense',
                amount: 320,
                status: 'completed',
                icon: '💊'
            },
            {
                id: 5,
                date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
                description: 'Farm Equipment Repair',
                category: 'Maintenance',
                type: 'expense',
                amount: 180,
                status: 'completed',
                icon: '🔧'
            }
        ];
        
        // Calculate totals from sample transactions
        const totalIncome = sampleTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = sampleTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netProfit = totalIncome - totalExpenses;
        
        // Calculate expense categories
        const categoryMap = {};
        sampleTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryMap[t.category]) {
                    categoryMap[t.category] = { amount: 0, count: 0 };
                }
                categoryMap[t.category].amount += t.amount;
                categoryMap[t.category].count += 1;
            });
        
        const expenseCategories = Object.entries(categoryMap).map(([name, stats]) => ({
            name,
            amount: stats.amount,
            count: stats.count,
            icon: this.getCategoryIcon(name)
        }));
        
        return {
            totalIncome,
            totalExpenses,
            netProfit,
            monthlyIncome: 3200,
            avgMonthlyIncome: 2800,
            totalTransactions: sampleTransactions.length,
            totalCategories: expenseCategories.length,
            currentBalance: netProfit,
            recentTransactions: sampleTransactions,
            expenseCategories
        };
    },

    updateDashboardDisplay(data) {
        // Update inline stats
        this.updateInlineStat('inline-total-income', this.formatCurrency(data.totalIncome));
        this.updateInlineStat('inline-total-expenses', this.formatCurrency(data.totalExpenses));
        this.updateInlineStat('inline-net-profit', this.formatCurrency(data.netProfit));
        
        // Update card stats
        this.updateCardStat('monthly-income', this.formatCurrency(data.monthlyIncome));
        this.updateCardStat('avg-monthly-income', this.formatCurrency(data.avgMonthlyIncome));
        this.updateCardStat('total-transactions', data.totalTransactions);
        this.updateCardStat('total-categories', data.totalCategories);
        this.updateCardStat('current-balance', this.formatCurrency(data.currentBalance));
        
        // Update card styling based on values
        this.updateCardStatus('balance-card', data.currentBalance, 'balance');
        this.updateCardStatus('monthly-income-card', data.monthlyIncome, 'income');
    },

    updateInlineStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    updateCardStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('value-updating');
            setTimeout(() => {
                element.classList.remove('value-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateCardStatus(cardId, value, type) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        // Remove existing status classes
        card.classList.remove('status-positive', 'status-negative', 'status-neutral');
        
        if (type === 'balance') {
            if (value > 0) {
                card.classList.add('status-positive');
            } else if (value < 0) {
                card.classList.add('status-negative');
            } else {
                card.classList.add('status-neutral');
            }
        } else if (type === 'income') {
            if (value > 0) {
                card.classList.add('status-positive');
            } else {
                card.classList.add('status-neutral');
            }
        }
    },

    updateTransactionsList(data) {
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h4>No transactions yet</h4>
                    <p>Add your first income or expense record</p>
                    <button class="btn btn-primary" id="add-first-transaction">Add Transaction</button>
                </div>
            `;
            
            document.getElementById('add-first-transaction')?.addEventListener('click', () => {
                this.showAddTransactionModal();
            });
            
            return;
        }

        // Show only recent 5 transactions
        const recentTransactions = transactions.slice(0, 5);
        
        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-row transaction-${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-main">
                    <div class="transaction-icon">${transaction.icon || this.getTransactionIcon(transaction.type)}</div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-meta">
                            <span class="transaction-date">📅 ${this.formatDate(transaction.date)}</span>
                            <span class="transaction-category">📂 ${transaction.category}</span>
                        </div>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="icon-btn edit-transaction" data-id="${transaction.id}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn delete-transaction" data-id="${transaction.id}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to transaction action buttons
        this.setupTransactionActionListeners();
    },

    setupTransactionActionListeners() {
        // Edit transaction buttons
        document.querySelectorAll('.edit-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
                this.editTransaction(transactionId);
            });
        });
        
        // Delete transaction buttons
        document.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteTransaction(transactionId);
            });
        });
    },

    updateCategoriesList(data) {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        const categories = data.expenseCategories || [];

        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <h4>No expense categories</h4>
                    <p>Add expenses to see categories</p>
                </div>
            `;
            return;
        }

        // Calculate total expenses for percentage
        const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);

        categoriesList.innerHTML = categories.map(category => {
            const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : 0;
            return `
                <div class="category-row" data-category="${category.name}">
                    <div class="category-main">
                        <div class="category-icon">${category.icon}</div>
                        <div class="category-details">
                            <div class="category-name">${category.name}</div>
                            <div class="category-meta">${category.count} transactions</div>
                        </div>
                    </div>
                    <div class="category-amount">
                        ${this.formatCurrency(category.amount)}
                        <div class="category-percentage">${percentage}%</div>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== TRANSACTION MODAL METHODS ====================

    showAddTransactionModal(prefill = null) {
        const isEditing = prefill?.id;
        const modalTitle = isEditing ? 'Edit Transaction' : 'Add Transaction';
        
        // Get current transaction type for category filtering
        const currentType = prefill?.type || 'expense';
        
        const fields = [
            {
                type: 'select',
                name: 'transaction-type',
                label: 'Transaction Type',
                required: true,
                options: [
                    { value: 'income', label: '💰 Income' },
                    { value: 'expense', label: '💸 Expense' }
                ],
                value: currentType
            },
            {
                type: 'text',
                name: 'description',
                label: 'Description',
                required: true,
                placeholder: 'e.g., Egg sales, Feed purchase, Equipment repair...',
                value: prefill?.description || ''
            },
            {
                type: 'number',
                name: 'amount',
                label: 'Amount ($)',
                required: true,
                min: 0.01,
                step: 0.01,
                placeholder: '0.00',
                value: prefill?.amount || '',
                note: 'Enter the transaction amount in dollars'
            },
            {
                type: 'select',
                name: 'category',
                label: 'Category',
                required: true,
                options: this.getCategoryOptions(currentType, prefill?.category),
                value: prefill?.category || ''
            },
            {
                type: 'date',
                name: 'date',
                label: 'Date',
                required: true,
                value: prefill?.date || new Date().toISOString().split('T')[0]
            },
            {
                type: 'select',
                name: 'payment-method',
                label: 'Payment Method',
                options: [
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'bank-transfer', label: '🏦 Bank Transfer' },
                    { value: 'credit-card', label: '💳 Credit Card' },
                    { value: 'check', label: '📝 Check' },
                    { value: 'mobile-payment', label: '📱 Mobile Payment' },
                    { value: 'other', label: '📦 Other' }
                ],
                value: prefill?.paymentMethod || 'cash'
            },
            {
                type: 'textarea',
                name: 'notes',
                label: 'Notes (Optional)',
                placeholder: 'Add any additional notes about this transaction...',
                rows: 3,
                value: prefill?.notes || ''
            }
        ];

        window.ModalManager.createForm({
            id: 'transaction-form-modal',
            title: modalTitle,
            size: 'modal-lg',
            fields: fields,
            submitText: isEditing ? 'Update Transaction' : 'Save Transaction',
            onSubmit: (formData) => {
                const transactionData = {
                    type: formData['transaction-type'],
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    category: this.getCategoryName(formData.category),
                    date: formData.date,
                    paymentMethod: formData['payment-method'],
                    notes: formData.notes,
                    status: 'completed'
                };

                if (isEditing) {
                    transactionData.id = prefill.id;
                    this.updateTransaction(transactionData);
                } else {
                    this.addTransaction(transactionData);
                }
            }
        });

        // Add dynamic category updating when transaction type changes
        const modal = document.getElementById('transaction-form-modal');
        if (modal) {
            const typeSelect = modal.querySelector('[name="transaction-type"]');
            const categorySelect = modal.querySelector('[name="category"]');
            
            if (typeSelect && categorySelect) {
                typeSelect.addEventListener('change', (e) => {
                    const newType = e.target.value;
                    const categoryOptions = this.getCategoryOptions(newType);
                    
                    // Update category select options
                    categorySelect.innerHTML = categoryOptions.map(opt => 
                        `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                });
            }
        }
    },

    getCategoryOptions(type, currentCategory = '') {
        const categories = type === 'income' ? this.categories.income : this.categories.expense;
        
        const options = categories.map(cat => ({
            value: cat.value,
            label: `${cat.icon} ${cat.label}`,
            selected: currentCategory === cat.value
        }));
        
        // Add empty option at the beginning
        return [{ value: '', label: 'Select a category', selected: !currentCategory }, ...options];
    },

    getCategoryName(categoryValue) {
        // Find in income categories
        const incomeCat = this.categories.income.find(cat => cat.value === categoryValue);
        if (incomeCat) return incomeCat.label;
        
        // Find in expense categories
        const expenseCat = this.categories.expense.find(cat => cat.value === categoryValue);
        if (expenseCat) return expenseCat.label;
        
        return 'Other';
    },

    getCategoryIcon(categoryName) {
        // Find in income categories
        const incomeCat = this.categories.income.find(cat => cat.label === categoryName);
        if (incomeCat) return incomeCat.icon;
        
        // Find in expense categories
        const expenseCat = this.categories.expense.find(cat => cat.label === categoryName);
        if (expenseCat) return expenseCat.icon;
        
        return '📦';
    },

    getTransactionIcon(type) {
        return type === 'income' ? '💰' : '💸';
    },

    addTransaction(transactionData) {
        // Get existing transactions
        const existingData = localStorage.getItem('farm-transactions');
        let transactions = [];
        
        if (existingData) {
            try {
                const parsed = JSON.parse(existingData);
                transactions = parsed.transactions || [];
            } catch (e) {
                console.error('Error loading existing transactions:', e);
            }
        }
        
        // Add new transaction
        const newTransaction = {
            id: Date.now(),
            ...transactionData,
            icon: this.getCategoryIcon(transactionData.category),
            createdAt: new Date().toISOString()
        };
        
        transactions.unshift(newTransaction);
        
        // Save to localStorage
        localStorage.setItem('farm-transactions', JSON.stringify({ 
            transactions,
            lastUpdated: new Date().toISOString() 
        }));
        
        // Refresh display
        this.loadAndDisplayData();
        
        // Show success notification
        this.showNotification(
            `${transactionData.type === 'income' ? 'Income' : 'Expense'} recorded successfully!`,
            'success'
        );
    },

    editTransaction(transactionId) {
        // Get existing transactions
        const existingData = localStorage.getItem('farm-transactions');
        if (!existingData) return;
        
        try {
            const parsed = JSON.parse(existingData);
            const transaction = parsed.transactions?.find(t => t.id === transactionId);
            
            if (transaction) {
                this.showAddTransactionModal({
                    id: transaction.id,
                    type: transaction.type,
                    description: transaction.description,
                    amount: transaction.amount,
                    category: this.getCategoryValue(transaction.category),
                    date: transaction.date,
                    paymentMethod: transaction.paymentMethod || 'cash',
                    notes: transaction.notes || ''
                });
            }
        } catch (e) {
            console.error('Error editing transaction:', e);
        }
    },

    getCategoryValue(categoryName) {
        // Find in income categories
        const incomeCat = this.categories.income.find(cat => cat.label === categoryName);
        if (incomeCat) return incomeCat.value;
        
        // Find in expense categories
        const expenseCat = this.categories.expense.find(cat => cat.label === categoryName);
        if (expenseCat) return expenseCat.value;
        
        return 'other';
    },

    updateTransaction(updatedTransaction) {
        // Get existing transactions
        const existingData = localStorage.getItem('farm-transactions');
        if (!existingData) return;
        
        try {
            const parsed = JSON.parse(existingData);
            const transactions = parsed.transactions || [];
            
            // Find and update transaction
            const index = transactions.findIndex(t => t.id === updatedTransaction.id);
            if (index !== -1) {
                transactions[index] = {
                    ...transactions[index],
                    ...updatedTransaction,
                    icon: this.getCategoryIcon(updatedTransaction.category),
                    updatedAt: new Date().toISOString()
                };
                
                // Save updated transactions
                localStorage.setItem('farm-transactions', JSON.stringify({ 
                    transactions,
                    lastUpdated: new Date().toISOString() 
                }));
                
                // Refresh display
                this.loadAndDisplayData();
                
                // Show success notification
                this.showNotification('Transaction updated successfully!', 'success');
            }
        } catch (e) {
            console.error('Error updating transaction:', e);
            this.showNotification('Error updating transaction', 'error');
        }
    },

    deleteTransaction(transactionId) {
        window.ModalManager.confirm({
            title: 'Delete Transaction',
            message: 'Are you sure you want to delete this transaction?',
            details: 'This action cannot be undone.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Delete'
        }).then(confirmed => {
            if (confirmed) {
                // Get existing transactions
                const existingData = localStorage.getItem('farm-transactions');
                if (!existingData) return;
                
                try {
                    const parsed = JSON.parse(existingData);
                    const transactions = parsed.transactions || [];
                    
                    // Filter out the transaction to delete
                    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
                    
                    // Save updated transactions
                    localStorage.setItem('farm-transactions', JSON.stringify({ 
                        transactions: updatedTransactions,
                        lastUpdated: new Date().toISOString() 
                    }));
                    
                    // Refresh display
                    this.loadAndDisplayData();
                    
                    // Show success notification
                    this.showNotification('Transaction deleted successfully!', 'success');
                } catch (e) {
                    console.error('Error deleting transaction:', e);
                    this.showNotification('Error deleting transaction', 'error');
                }
            }
        });
    },

    clearAllTransactions() {
        window.ModalManager.confirm({
            title: 'Clear All Transactions',
            message: 'Are you sure you want to clear ALL transactions?',
            details: 'This will permanently delete all transaction records. This action cannot be undone.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Clear All'
        }).then(confirmed => {
            if (confirmed) {
                localStorage.removeItem('farm-transactions');
                this.loadAndDisplayData();
                this.showNotification('All transactions cleared!', 'success');
            }
        });
    },

    // ==================== REPORTS MODAL METHOD ====================

    showReportsModal() {
        const reports = [
            {
                id: 'income-statement',
                title: 'Income Statement',
                icon: '📊',
                description: 'Revenue, expenses, and net profit',
                preview: `
                    <div class="report-preview">
                        <h4>Income Statement Preview</h4>
                        <p>Shows your farm's financial performance over a selected period.</p>
                        <div class="preview-stats">
                            <div class="preview-stat">
                                <span class="label">Total Income:</span>
                                <span class="value positive">$12,500.00</span>
                            </div>
                            <div class="preview-stat">
                                <span class="label">Total Expenses:</span>
                                <span class="value negative">$8,500.00</span>
                            </div>
                            <div class="preview-stat">
                                <span class="label">Net Profit:</span>
                                <span class="value positive">$4,000.00</span>
                            </div>
                        </div>
                    </div>
                `,
                buttonText: 'Generate Report'
            },
            {
                id: 'category-breakdown',
                title: 'Category Breakdown',
                icon: '📈',
                description: 'Expense distribution by category',
                preview: `
                    <div class="report-preview">
                        <h4>Category Breakdown Preview</h4>
                        <p>Visual breakdown of where your money is being spent.</p>
                        <div class="preview-chart">
                            <div class="chart-bar" style="width: 40%">Feed & Nutrition</div>
                            <div class="chart-bar" style="width: 25%">Labor</div>
                            <div class="chart-bar" style="width: 15%">Equipment</div>
                            <div class="chart-bar" style="width: 10%">Healthcare</div>
                            <div class="chart-bar" style="width: 10%">Other</div>
                        </div>
                    </div>
                `,
                buttonText: 'View Breakdown'
            },
            {
                id: 'monthly-trends',
                title: 'Monthly Trends',
                icon: '📅',
                description: 'Income and expense trends',
                preview: `
                    <div class="report-preview">
                        <h4>Monthly Trends Preview</h4>
                        <p>Track your financial performance month over month.</p>
                        <div class="trend-preview">
                            <div class="trend-month">
                                <span>Jan: <span class="positive">+$2,800</span></span>
                            </div>
                            <div class="trend-month">
                                <span>Feb: <span class="positive">+$3,200</span></span>
                            </div>
                            <div class="trend-month">
                                <span>Mar: <span class="positive">+$2,900</span></span>
                            </div>
                            <div class="trend-month">
                                <span>Apr: <span class="positive">+$3,600</span></span>
                            </div>
                        </div>
                    </div>
                `,
                buttonText: 'View Trends'
            },
            {
                id: 'yearly-summary',
                title: 'Yearly Summary',
                icon: '📋',
                description: 'Annual financial summary',
                preview: `
                    <div class="report-preview">
                        <h4>Yearly Summary Preview</h4>
                        <p>Complete overview of your farm's yearly financial performance.</p>
                        <div class="yearly-stats">
                            <div class="yearly-stat">
                                <span class="label">Total Income:</span>
                                <span class="value">$38,400.00</span>
                            </div>
                            <div class="yearly-stat">
                                <span class="label">Total Expenses:</span>
                                <span class="value">$25,600.00</span>
                            </div>
                            <div class="yearly-stat">
                                <span class="label">Yearly Profit:</span>
                                <span class="value positive">$12,800.00</span>
                            </div>
                        </div>
                    </div>
                `,
                buttonText: 'View Summary'
            }
        ];

        window.ModalManager.showReports({
            id: 'reports-modal',
            title: 'Financial Reports',
            subtitle: 'Select a report to generate',
            reports: reports,
            onReportSelect: (reportId) => {
                this.showNotification(`Generating ${reportId.replace('-', ' ')} report...`, 'success');
                // In a real app, you would generate and show the actual report here
                setTimeout(() => {
                    this.showNotification(`Report generated successfully!`, 'success');
                }, 1500);
            }
        });
    },

    // ==================== CATEGORIES MODAL METHODS ====================

    showManageCategoriesModal() {
        window.ModalManager.show({
            id: 'manage-categories-modal',
            title: 'Manage Categories',
            size: 'modal-lg',
            content: `
                <div class="categories-management">
                    <div class="tabs">
                        <button class="tab active" data-tab="income">💰 Income Categories</button>
                        <button class="tab" data-tab="expense">💸 Expense Categories</button>
                    </div>
                    
                    <div class="tab-content">
                        <div class="tab-pane active" id="income-categories">
                            <div class="categories-list" id="income-categories-list">
                                ${this.renderCategoryList('income')}
                            </div>
                            <button class="btn btn-primary add-category-btn" data-type="income">
                                <span class="btn-icon">➕</span>
                                <span class="btn-text">Add Income Category</span>
                            </button>
                        </div>
                        
                        <div class="tab-pane" id="expense-categories">
                            <div class="categories-list" id="expense-categories-list">
                                ${this.renderCategoryList('expense')}
                            </div>
                            <button class="btn btn-primary add-category-btn" data-type="expense">
                                <span class="btn-icon">➕</span>
                                <span class="btn-text">Add Expense Category</span>
                            </button>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" data-action="close">Close</button>
                <button class="btn btn-primary" data-action="save-categories">Save Changes</button>
            `,
            onOpen: () => {
                // Tab switching
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        const tabType = e.target.dataset.tab;
                        
                        // Update active tab
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        e.target.classList.add('active');
                        
                        // Show corresponding content
                        document.querySelectorAll('.tab-pane').forEach(pane => {
                            pane.classList.remove('active');
                        });
                        document.getElementById(`${tabType}-categories`).classList.add('active');
                    });
                });
                
                // Add category buttons
                document.querySelectorAll('.add-category-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const type = btn.dataset.type;
                        this.showAddCategoryModal(type);
                    });
                });
                
                // Edit category buttons
                document.querySelectorAll('.edit-category-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const categoryValue = e.target.closest('.category-item').dataset.value;
                        const type = e.target.closest('.category-item').dataset.type;
                        this.showEditCategoryModal(type, categoryValue);
                    });
                });
                
                // Delete category buttons
                document.querySelectorAll('.delete-category-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const categoryValue = e.target.closest('.category-item').dataset.value;
                        const type = e.target.closest('.category-item').dataset.type;
                        this.showDeleteCategoryModal(type, categoryValue);
                    });
                });
                
                // Save button
                document.querySelector('[data-action="save-categories"]').addEventListener('click', () => {
                    this.saveData();
                    this.showNotification('Categories saved successfully!', 'success');
                    window.ModalManager.closeCurrentModal();
                });
                
                // Close button
                document.querySelector('[data-action="close"]').addEventListener('click', () => {
                    window.ModalManager.closeCurrentModal();
                });
            }
        });
    },

    renderCategoryList(type) {
        const categories = this.categories[type];
        
        if (categories.length === 0) {
            return `<div class="empty-categories">No ${type} categories yet. Add your first one!</div>`;
        }
        
        return categories.map(category => `
            <div class="category-item" data-type="${type}" data-value="${category.value}">
                <div class="category-info">
                    <span class="category-icon">${category.icon}</span>
                    <div class="category-details">
                        <div class="category-name">${category.label}</div>
                        <div class="category-value">${category.value}</div>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="icon-btn edit-category-btn" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn delete-category-btn" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showAddCategoryModal(type) {
        const typeLabel = type === 'income' ? 'Income' : 'Expense';
        
        window.ModalManager.createForm({
            id: 'add-category-modal',
            title: `Add ${typeLabel} Category`,
            size: 'modal-sm',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Category Name',
                    required: true,
                    placeholder: 'e.g., Feed & Nutrition, Egg Sales...'
                },
                {
                    type: 'text',
                    name: 'value',
                    label: 'Category Value',
                    required: true,
                    placeholder: 'e.g., feed, egg-sales...',
                    note: 'Used internally (no spaces, lowercase)'
                },
                {
                    type: 'select',
                    name: 'icon',
                    label: 'Icon',
                    options: [
                        { value: '🥚', label: '🥚 Egg' },
                        { value: '🐔', label: '🐔 Chicken' },
                        { value: '🌾', label: '🌾 Grain' },
                        { value: '💊', label: '💊 Medicine' },
                        { value: '🔧', label: '🔧 Tools' },
                        { value: '👷', label: '👷 Labor' },
                        { value: '⚡', label: '⚡ Utilities' },
                        { value: '🚚', label: '🚚 Transport' },
                        { value: '💰', label: '💰 Money' },
                        { value: '📦', label: '📦 Other' }
                    ],
                    value: '📦'
                }
            ],
            submitText: 'Add Category',
            onSubmit: (formData) => {
                const newCategory = {
                    label: formData.name,
                    value: formData.value,
                    icon: formData.icon
                };
                
                this.categories[type].push(newCategory);
                this.saveData();
                this.showNotification(`${typeLabel} category added!`, 'success');
                
                // Refresh the categories modal if it's open
                const manageModal = document.getElementById('manage-categories-modal');
                if (manageModal) {
                    window.ModalManager.closeCurrentModal();
                    setTimeout(() => {
                        this.showManageCategoriesModal();
                    }, 300);
                }
            }
        });
    },

    showEditCategoryModal(type, categoryValue) {
        const categories = this.categories[type];
        const category = categories.find(cat => cat.value === categoryValue);
        const typeLabel = type === 'income' ? 'Income' : 'Expense';
        
        if (!category) return;
        
        window.ModalManager.createForm({
            id: 'edit-category-modal',
            title: `Edit ${typeLabel} Category`,
            size: 'modal-sm',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Category Name',
                    required: true,
                    value: category.label
                },
                {
                    type: 'text',
                    name: 'value',
                    label: 'Category Value',
                    required: true,
                    value: category.value,
                    note: 'Used internally (no spaces, lowercase)'
                },
                {
                    type: 'select',
                    name: 'icon',
                    label: 'Icon',
                    options: [
                        { value: '🥚', label: '🥚 Egg' },
                        { value: '🐔', label: '🐔 Chicken' },
                        { value: '🌾', label: '🌾 Grain' },
                        { value: '💊', label: '💊 Medicine' },
                        { value: '🔧', label: '🔧 Tools' },
                        { value: '👷', label: '👷 Labor' },
                        { value: '⚡', label: '⚡ Utilities' },
                        { value: '🚚', label: '🚚 Transport' },
                        { value: '💰', label: '💰 Money' },
                        { value: '📦', label: '📦 Other' }
                    ],
                    value: category.icon
                }
            ],
            submitText: 'Update Category',
            onSubmit: (formData) => {
                const updatedCategory = {
                    label: formData.name,
                    value: formData.value,
                    icon: formData.icon
                };
                
                // Update the category
                const index = categories.findIndex(cat => cat.value === categoryValue);
                if (index !== -1) {
                    this.categories[type][index] = updatedCategory;
                    this.saveData();
                    this.showNotification(`${typeLabel} category updated!`, 'success');
                    
                    // Refresh the categories modal if it's open
                    const manageModal = document.getElementById('manage-categories-modal');
                    if (manageModal) {
                        window.ModalManager.closeCurrentModal();
                        setTimeout(() => {
                            this.showManageCategoriesModal();
                        }, 300);
                    }
                }
            }
        });
    },

    showDeleteCategoryModal(type, categoryValue) {
        const categories = this.categories[type];
        const category = categories.find(cat => cat.value === categoryValue);
        const typeLabel = type === 'income' ? 'Income' : 'Expense';
        
        if (!category) return;
        
        window.ModalManager.confirm({
            title: `Delete ${typeLabel} Category`,
            message: `Are you sure you want to delete "${category.label}"?`,
            details: 'This action cannot be undone. Existing transactions using this category will need to be reassigned.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Delete Category'
        }).then(confirmed => {
            if (confirmed) {
                // Remove the category
                this.categories[type] = categories.filter(cat => cat.value !== categoryValue);
                this.saveData();
                this.showNotification(`${typeLabel} category deleted!`, 'success');
                
                // Refresh the categories modal if it's open
                const manageModal = document.getElementById('manage-categories-modal');
                if (manageModal) {
                    window.ModalManager.closeCurrentModal();
                    setTimeout(() => {
                        this.showManageCategoriesModal();
                    }, 300);
                }
            }
        });
    },

    // ==================== EXPORT DATA METHOD ====================

    exportData() {
        // Get current data
        const data = this.getModuleData();
        
        // Create CSV content
        let csvContent = "Date,Type,Description,Category,Amount,Payment Method,Status\n";
        
        data.recentTransactions.forEach(transaction => {
            csvContent += `"${transaction.date}","${transaction.type}","${transaction.description}","${transaction.category}",${transaction.amount},"${transaction.paymentMethod || 'cash'}",${transaction.status}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `farm-transactions-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    },

    // ==================== UTILITY METHODS ====================

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    showNotification(message, type = 'info') {
        if (window.ModalManager && window.ModalManager[type]) {
            window.ModalManager[type]({
                title: type.charAt(0).toUpperCase() + type.slice(1),
                message: message
            });
        } else {
            // Fallback to simple alert
            alert(message);
        }
    },

    // ==================== REAL FIREBASE RECEIPT METHODS ====================

    showImportReceiptsModal() {
        // Use your ModalManager with dashboard styling
        window.ModalManager.show({
            id: 'import-receipts-modal',
            title: '📥 Import Receipts',
            size: 'modal-lg',
            content: `
                <div class="import-receipts-container">
                    
                    <!-- Quick Options (Dashboard Style) -->
                    <div class="quick-actions-section">
                        <h2 class="section-title">Upload Method</h2>
                        <div class="card-grid">
                            <button class="card-button" id="camera-option">
                                <div class="card-icon">📷</div>
                                <span class="card-title">Take Photo</span>
                                <span class="card-subtitle">Use camera</span>
                            </button>
                            <button class="card-button" id="upload-option">
                                <div class="card-icon">📁</div>
                                <span class="card-title">Upload Files</span>
                                <span class="card-subtitle">From device</span>
                            </button>
                            <button class="card-button" id="scan-option" disabled>
                                <div class="card-icon">🔍</div>
                                <span class="card-title">Scan (Coming Soon)</span>
                                <span class="card-subtitle">Auto-extract</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Camera Interface -->
                    <div class="camera-section" id="camera-section" style="display: none;">
                        <div class="glass-card">
                            <div class="card-header header-flex">
                                <h3>Camera Preview</h3>
                                <div class="camera-status" id="camera-status">Ready</div>
                            </div>
                            <div class="camera-preview">
                                <video id="camera-preview" autoplay playsinline></video>
                                <canvas id="camera-canvas" style="display: none;"></canvas>
                            </div>
                            <div class="camera-controls">
                                <button class="btn btn-outline" id="switch-camera">
                                    <span class="btn-icon">🔄</span>
                                    <span class="btn-text">Switch Camera</span>
                                </button>
                                <button class="btn btn-primary" id="capture-photo">
                                    <span class="btn-icon">📸</span>
                                    <span class="btn-text">Capture</span>
                                </button>
                                <button class="btn btn-outline" id="cancel-camera">
                                    <span class="btn-icon">✖️</span>
                                    <span class="btn-text">Cancel</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upload Area -->
                    <div class="upload-section" id="upload-section" style="display: none;">
                        <div class="glass-card">
                            <div class="card-header">
                                <h3>Upload Receipts</h3>
                            </div>
                            <div class="upload-area" id="drop-area">
                                <div class="upload-icon">📄</div>
                                <h4>Drag & Drop Receipts</h4>
                                <p class="upload-subtitle">or click to browse files</p>
                                <p class="upload-formats">Supports: JPG, PNG, PDF (Max 10MB)</p>
                                <input type="file" id="receipt-upload-input" multiple 
                                       accept=".jpg,.jpeg,.png,.pdf" style="display: none;">
                                <button class="btn btn-primary" id="browse-receipts-btn">
                                    <span class="btn-icon">📁</span>
                                    <span class="btn-text">Browse Files</span>
                                </button>
                            </div>
                            
                            <!-- Upload Progress -->
                            <div class="upload-progress" id="upload-progress" style="display: none;">
                                <div class="progress-info">
                                    <h4>Uploading to Firebase...</h4>
                                    <div class="progress-container">
                                        <div class="progress-bar" id="upload-progress-bar"></div>
                                    </div>
                                    <div class="progress-details">
                                        <span id="upload-file-name">-</span>
                                        <span id="upload-percentage">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Receipts -->
                    <div class="recent-section" id="recent-section" style="${this.receiptQueue.length > 0 ? '' : 'display: none;'}">
                        <div class="glass-card">
                            <div class="card-header header-flex">
                                <h3>📋 Recent Receipts</h3>
                                <button class="btn btn-outline" id="refresh-receipts">
                                    <span class="btn-icon">🔄</span>
                                    <span class="btn-text">Refresh</span>
                                </button>
                            </div>
                            <div id="recent-receipts-list" class="receipts-list">
                                ${this.renderRecentReceiptsList()}
                            </div>
                        </div>
                    </div>
                    
                </div>
            `,
            footer: `
                <button class="btn btn-outline" data-action="close">Cancel</button>
                <button class="btn btn-primary" id="process-receipts-btn" style="display: none;">
                    <span class="btn-icon">⚡</span>
                    <span class="btn-text">Process Receipts</span>
                </button>
            `,
            onOpen: () => {
                this.setupImportReceiptsHandlers();
            }
        });
    },

    setupImportReceiptsHandlers() {
        // Camera option
        document.getElementById('camera-option').addEventListener('click', () => {
            this.showCameraInterface();
        });
        
        // Upload option
        document.getElementById('upload-option').addEventListener('click', () => {
            this.showUploadInterface();
        });
        
        // File upload handlers
        document.getElementById('browse-receipts-btn').addEventListener('click', () => {
            document.getElementById('receipt-upload-input').click();
        });
        
        document.getElementById('receipt-upload-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // Drag and drop
        const dropArea = document.getElementById('drop-area');
        if (dropArea) {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('drag-over');
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('drag-over');
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('drag-over');
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
        
        // Refresh receipts
        document.getElementById('refresh-receipts')?.addEventListener('click', () => {
            this.loadReceiptsFromFirebase();
        });
        
        // Process button
        document.getElementById('process-receipts-btn')?.addEventListener('click', () => {
            this.processPendingReceipts();
        });
    },

    showCameraInterface() {
        // Hide upload, show camera
        document.getElementById('upload-section').style.display = 'none';
        document.getElementById('camera-section').style.display = 'block';
        document.getElementById('recent-section').style.display = 'none';
        
        this.initializeCamera();
    },

    showUploadInterface() {
        // Hide camera, show upload
        document.getElementById('camera-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('recent-section').style.display = 'block';
    },

    async initializeCamera() {
        try {
            const video = document.getElementById('camera-preview');
            const status = document.getElementById('camera-status');
            
            // Get camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            video.srcObject = stream;
            this.cameraStream = stream;
            status.textContent = 'Camera Ready';
            
            // Setup capture button
            document.getElementById('capture-photo').onclick = () => this.capturePhoto();
            
            // Setup switch camera
            document.getElementById('switch-camera').onclick = () => this.switchCamera();
            
            // Setup cancel
            document.getElementById('cancel-camera').onclick = () => {
                this.stopCamera();
                this.showUploadInterface();
            };
            
        } catch (error) {
            console.error('Camera error:', error);
            this.showNotification('Camera access denied. Please upload files instead.', 'error');
            this.showUploadInterface();
        }
    },

    async switchCamera() {
        if (!this.cameraStream) return;
        
        const video = document.getElementById('camera-preview');
        const tracks = this.cameraStream.getTracks();
        
        // Stop current tracks
        tracks.forEach(track => track.stop());
        
        try {
            // Get current facing mode
            const currentTrack = tracks.find(track => track.kind === 'video');
            const currentFacingMode = currentTrack.getSettings().facingMode;
            
            // Switch facing mode
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            
            // Get new stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: false
            });
            
            video.srcObject = stream;
            this.cameraStream = stream;
            
            this.showNotification(`Switched to ${newFacingMode === 'user' ? 'front' : 'rear'} camera`, 'success');
            
        } catch (error) {
            console.error('Switch camera error:', error);
            this.showNotification('Failed to switch camera', 'error');
        }
    },

    capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (blob) {
                status.textContent = 'Processing photo...';
                
                // Create file object
                const file = new File([blob], `receipt_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                
                // Upload to Firebase
                await this.uploadReceiptToFirebase(file);
                
                status.textContent = 'Photo captured!';
                this.showNotification('Receipt photo captured!', 'success');
                
                // Switch back to upload interface
                setTimeout(() => {
                    this.stopCamera();
                    this.showUploadInterface();
                }, 1000);
            }
        }, 'image/jpeg', 0.9);
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        const video = document.getElementById('camera-preview');
        if (video) video.srcObject = null;
    },

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const totalFiles = files.length;
        let processedFiles = 0;
        
        // Show progress
        const progressSection = document.getElementById('upload-progress');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-percentage');
        const fileName = document.getElementById('upload-file-name');
        
        if (progressSection) progressSection.style.display = 'block';
        
        // Upload each file to Firebase
        for (const file of Array.from(files)) {
            fileName.textContent = `Uploading: ${file.name}`;
            
            try {
                await this.uploadReceiptToFirebase(file);
                processedFiles++;
                
                // Update progress
                const progress = Math.round((processedFiles / totalFiles) * 100);
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
                
            } catch (error) {
                console.error('Upload error:', error);
                this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
            }
        }
        
        // Hide progress after completion
        setTimeout(() => {
            if (progressSection) progressSection.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
            if (fileName) fileName.textContent = '-';
        }, 1000);
        
        this.showNotification(`${processedFiles} receipt(s) uploaded to Firebase!`, 'success');
        
        // Update UI
        this.updateReceiptQueueUI();
        
        // Show process button
        const processBtn = document.getElementById('process-receipts-btn');
        if (processBtn) processBtn.style.display = 'inline-block';
    },

    async uploadReceiptToFirebase(file) {
        if (!file || !window.storage) {
            throw new Error('Firebase storage not available');
        }
        
        // Validate file
        if (!this.isValidReceiptFile(file)) {
            throw new Error('Invalid file type or size');
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `receipts/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Create storage reference
        const storageRef = window.storage.ref();
        const fileRef = storageRef.child(fileName);
        
        // Upload file to Firebase Storage
        const uploadTask = fileRef.put(file);
        
        // Wait for upload to complete
        const snapshot = await uploadTask;
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Create receipt record in Firestore
        const receiptId = `receipt_${timestamp}`;
        const receiptData = {
            id: receiptId,
            name: file.name,
            originalName: file.name,
            fileName: fileName,
            downloadURL: downloadURL,
            size: file.size,
            type: file.type,
            status: 'pending',
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            uploadedBy: this.getCurrentUser() || 'unknown',
            metadata: {
                contentType: file.type,
                size: file.size
            }
        };
        
        // Save to Firestore
        await window.db.collection('receipts').doc(receiptId).set(receiptData);
        
        // Add to local queue
        this.receiptQueue.push(receiptData);
        
        return receiptData;
    },

    async loadReceiptsFromFirebase() {
        try {
            const receiptsRef = window.db.collection('receipts');
            const snapshot = await receiptsRef
                .where('status', '==', 'pending')
                .orderBy('uploadedAt', 'desc')
                .limit(10)
                .get();
            
            this.receiptQueue = [];
            snapshot.forEach(doc => {
                this.receiptQueue.push(doc.data());
            });
            
            // Update UI
            this.updateReceiptQueueUI();
            this.showNotification('Receipts loaded from Firebase', 'success');
            
        } catch (error) {
            console.error('Error loading receipts:', error);
            this.showNotification('Failed to load receipts', 'error');
        }
    },

    renderRecentReceiptsList() {
        if (this.receiptQueue.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h4>No pending receipts</h4>
                    <p>Upload some receipts to get started</p>
                </div>
            `;
        }
        
        return `
            <div class="receipts-grid">
                ${this.receiptQueue.slice(0, 5).map(receipt => `
                    <div class="receipt-card" data-id="${receipt.id}">
                        <div class="receipt-preview">
                            ${receipt.type.startsWith('image/') ? 
                                `<img src="${receipt.downloadURL}" alt="${receipt.name}" loading="lazy">` : 
                                `<div class="file-icon">📄</div>`
                            }
                        </div>
                        <div class="receipt-info">
                            <div class="receipt-name">${receipt.name}</div>
                            <div class="receipt-meta">
                                <span class="receipt-size">${this.formatFileSize(receipt.size)}</span>
                                <span class="receipt-status status-${receipt.status}">${receipt.status}</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline process-btn" data-id="${receipt.id}">
                            <span class="btn-icon">🔍</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateReceiptQueueUI() {
        // Update main page UI
        const pendingSection = document.getElementById('pending-receipts-section');
        const pendingList = document.getElementById('pending-receipts-list');
        const badge = document.getElementById('receipt-count-badge');
        
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (badge) {
            badge.textContent = pendingReceipts.length;
            badge.style.display = pendingReceipts.length > 0 ? 'inline-block' : 'none';
        }
        
        if (pendingSection && pendingList) {
            if (pendingReceipts.length > 0) {
                pendingSection.style.display = 'block';
                
                pendingList.innerHTML = pendingReceipts.map(receipt => `
                    <div class="pending-receipt-item" data-id="${receipt.id}">
                        <div class="receipt-info">
                            <span class="receipt-icon">${receipt.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                            <div class="receipt-details">
                                <div class="receipt-name">${receipt.name}</div>
                                <div class="receipt-meta">
                                    <span>${this.formatFileSize(receipt.size)}</span>
                                    <span>•</span>
                                    <span class="receipt-status status-pending">Pending</span>
                                    <span>•</span>
                                    <span>${this.formatFirebaseTimestamp(receipt.uploadedAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="receipt-actions">
                            <a href="${receipt.downloadURL}" target="_blank" class="btn btn-sm btn-outline" title="View">
                                <span class="btn-icon">👁️</span>
                            </a>
                            <button class="btn btn-sm btn-primary process-receipt-btn" data-id="${receipt.id}">
                                <span class="btn-icon">🔍</span>
                                <span class="btn-text">Process</span>
                            </button>
                            <button class="btn btn-sm btn-outline remove-receipt-btn" data-id="${receipt.id}">
                                <span class="btn-icon">🗑️</span>
                            </button>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners
                this.setupReceiptActionListeners();
                
            } else {
                pendingSection.style.display = 'none';
            }
        }
    },

    setupReceiptActionListeners() {
        // Process buttons
        document.querySelectorAll('.process-receipt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const receiptId = e.currentTarget.dataset.id;
                this.processSingleReceipt(receiptId);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-receipt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const receiptId = e.currentTarget.dataset.id;
                this.deleteReceiptFromFirebase(receiptId);
            });
        });
    },

    processSingleReceipt(receiptId) {
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) return;
        
        // For now, simulate some extracted data (in real app, use OCR)
        const extractedData = {
            amount: 0.00,
            vendor: 'Unknown Vendor',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            category: 'other-expense'
        };
        
        // Show review modal
        this.showReceiptReviewModal(receipt, extractedData);
    },

    async deleteReceiptFromFirebase(receiptId) {
        const confirm = await window.ModalManager.confirm({
            title: 'Delete Receipt',
            message: 'Are you sure you want to delete this receipt?',
            details: 'This will remove it from Firebase Storage and Firestore.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Delete'
        });
        
        if (!confirm) return;
        
        try {
            const receipt = this.receiptQueue.find(r => r.id === receiptId);
            
            // Delete from Storage
            if (receipt?.fileName) {
                const storageRef = window.storage.ref();
                await storageRef.child(receipt.fileName).delete();
            }
            
            // Delete from Firestore
            await window.db.collection('receipts').doc(receiptId).delete();
            
            // Remove from local queue
            this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
            
            // Update UI
            this.updateReceiptQueueUI();
            
            this.showNotification('Receipt deleted successfully', 'success');
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete receipt', 'error');
        }
    },

    processPendingReceipts() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pendingReceipts.length === 0) {
            this.showNotification('No pending receipts to process!', 'warning');
            return;
        }
        
        // Process each receipt
        pendingReceipts.forEach((receipt, index) => {
            setTimeout(() => {
                this.processSingleReceipt(receipt.id);
            }, index * 1000); // Stagger processing
        });
    },

    processAllReceipts() {
        this.processPendingReceipts();
    },

    clearAllPendingReceipts() {
        if (this.receiptQueue.length === 0) {
            this.showNotification('No pending receipts to clear!', 'info');
            return;
        }
        
        window.ModalManager.confirm({
            title: 'Clear All Pending Receipts',
            message: 'Are you sure you want to clear ALL pending receipts?',
            details: 'This will remove all uploaded receipts from the queue. Extracted data will be lost.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Clear All'
        }).then(confirmed => {
            if (confirmed) {
                this.receiptQueue = [];
                this.updateReceiptQueueUI();
                this.showNotification('All pending receipts cleared!', 'success');
            }
        });
    },

    // Utility methods
    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return validTypes.includes(file.type) && file.size <= maxSize;
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatFirebaseTimestamp(timestamp) {
        if (!timestamp) return 'Recently';
        
        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate(); // Firestore Timestamp
        } else if (timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            date = new Date(timestamp);
        }
        
        return this.formatTimeAgo(date);
    },

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    },

    getCurrentUser() {
        // Get current user from Firebase Auth or your app state
        if (firebase.auth().currentUser) {
            return firebase.auth().currentUser.uid;
        }
        
        // Fallback to localStorage or app data
        if (window.FarmModules?.appData?.profile?.userId) {
            return window.FarmModules.appData.profile.userId;
        }
        
        return 'anonymous';
    },

    showReceiptReviewModal(receipt, extractedData) {
        // Determine if this looks like income or expense based on data
        const isLikelyIncome = extractedData.category && 
                              (extractedData.category.includes('sales') || 
                               extractedData.category.includes('income'));
        
        const defaultType = isLikelyIncome ? 'income' : 'expense';
        
        // Create form fields based on extracted data
        const fields = [
            {
                type: 'select',
                name: 'transaction-type',
                label: 'Transaction Type',
                value: defaultType,
                options: [
                    { value: 'income', label: '💰 Income' },
                    { value: 'expense', label: '💸 Expense' }
                ]
            },
            {
                type: 'text',
                name: 'description',
                label: 'Description',
                value: `Receipt: ${receipt.name}`,
                required: true
            },
            {
                type: 'number',
                name: 'amount',
                label: 'Amount',
                value: extractedData.amount || 0,
                required: true,
                min: 0.01
            },
            {
                type: 'select',
                name: 'category',
                label: 'Category',
                value: extractedData.category || 'other-expense',
                options: this.getCategoryOptions(defaultType, extractedData.category)
            },
            {
                type: 'text',
                name: 'vendor',
                label: 'Vendor/Supplier',
                value: extractedData.vendor || ''
            },
            {
                type: 'date',
                name: 'date',
                label: 'Date',
                value: extractedData.date || new Date().toISOString().split('T')[0]
            },
            {
                type: 'textarea',
                name: 'notes',
                label: 'Notes',
                value: `Extracted from receipt: ${receipt.name}\nItems: ${extractedData.items?.join(', ') || 'Various items'}`,
                rows: 3
            }
        ];
        
        window.ModalManager.createForm({
            id: 'receipt-review-modal',
            title: '🔍 Review Extracted Data',
            subtitle: `From: ${receipt.name}`,
            size: 'modal-lg',
            fields: fields,
            submitText: 'Add Transaction',
            onSubmit: (formData) => {
                // Create transaction from form data
                const transactionData = {
                    type: formData['transaction-type'],
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    category: this.getCategoryName(formData.category),
                    date: formData.date,
                    paymentMethod: 'receipt',
                    notes: formData.notes,
                    vendor: formData.vendor,
                    receiptId: receipt.id,
                    receiptName: receipt.name,
                    receiptURL: receipt.downloadURL,
                    status: 'completed'
                };
                
                // Add to transactions
                this.addTransaction(transactionData);
                
                // Update receipt status in Firebase
                this.updateReceiptStatus(receipt.id, 'processed');
                
                // Remove from local queue
                this.receiptQueue = this.receiptQueue.filter(r => r.id !== receipt.id);
                
                // Update UI
                this.updateReceiptQueueUI();
                
                this.showNotification('Transaction added from receipt!', 'success');
            }
        });
    },

    async updateReceiptStatus(receiptId, status) {
        try {
            await window.db.collection('receipts').doc(receiptId).update({
                status: status,
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating receipt status:', error);
        }
    }

}; // This closes the IncomeExpensesModule object

// Register the module when FarmModules is available
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
} else {
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            clearInterval(checkFarmModules);
            window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
            console.log('✅ Income & Expenses module registered after wait');
        }
    }, 100);
}

// Export for global access
window.IncomeExpensesModule = IncomeExpensesModule;
console.log('✅ Income & Expenses module loaded (waiting for initialization)');
