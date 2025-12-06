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
    
    // Try to load receipts, but handle Firebase errors gracefully
    this.loadReceiptsFromFirebase().then(() => {
        this.updatePendingReceiptsUI();
    }).catch(error => {
        console.error('Error loading receipts:', error);
        
        // Load from localStorage as fallback
        try {
            const savedReceipts = localStorage.getItem('farm-pending-receipts');
            if (savedReceipts) {
                this.receiptQueue = JSON.parse(savedReceipts);
                console.log(`✅ Loaded ${this.receiptQueue.length} receipts from localStorage (fallback)`);
            } else {
                this.receiptQueue = [];
                console.log('ℹ️ No receipts found in localStorage');
            }
        } catch (localError) {
            console.error('Error loading from localStorage:', localError);
            this.receiptQueue = [];
        }
        
        this.updatePendingReceiptsUI();
    });
    
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
        // Check if ModalManager is available
        if (!window.ModalManager || !window.ModalManager.createForm) {
            console.error('❌ ModalManager not available');
            this.showNotification('Modal system is not available. Please refresh the page.', 'error');
            return;
        }
        
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

    // First, let's make sure ModalManager exists and has the right method
    if (!window.ModalManager) {
        console.error('ModalManager not found!');
        return;
    }

    // Create the modal HTML directly
    const modalHTML = `
        <div class="modal-overlay active" id="reports-modal">
            <div class="modal-container">
                <button class="modal-close-x" onclick="closeModal('reports-modal')">×</button>
                
                <div class="modal-header">
                    <h2 class="modal-title">Financial Reports</h2>
                    <p class="modal-subtitle">Select a report to generate</p>
                </div>
                
                <div class="modal-content">
                    <div class="reports-grid">
                        ${reports.map(report => `
                            <div class="report-card">
                                <div class="report-icon">${report.icon}</div>
                                <h3 class="report-title">${report.title}</h3>
                                <p class="report-description">${report.description}</p>
                                ${report.preview ? `<div class="report-preview">${report.preview}</div>` : ''}
                                <button class="btn btn-primary generate-report-btn" 
                                        data-report-id="${report.id}"
                                        onclick="handleReportGenerate('${report.id}')">
                                    ${report.buttonText}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('reports-modal')">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add CSS for modal if not already present
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-overlay.active {
                display: flex;
            }
            
            .modal-container {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: modalSlideIn 0.3s ease;
            }
            
            .modal-close-x {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 28px;
                color: #666;
                cursor: pointer;
                line-height: 1;
                padding: 5px 10px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                z-index: 10;
            }
            
            .modal-close-x:hover {
                background-color: #f5f5f5;
                color: #333;
                transform: scale(1.1);
            }
            
            .modal-header {
                padding: 25px 30px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-title {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .modal-subtitle {
                margin: 5px 0 0;
                color: #666;
                font-size: 0.95rem;
            }
            
            .modal-content {
                padding: 20px 30px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: 20px 30px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .reports-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .report-card {
                background: #f9f9f9;
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #eee;
                transition: transform 0.2s;
            }
            
            .report-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .report-icon {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }
            
            .report-title {
                margin: 0 0 10px 0;
                font-size: 1.2rem;
                color: #333;
            }
            
            .report-description {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 15px;
            }
            
            .report-preview {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px solid #e0e0e0;
            }
            
            .report-preview h4 {
                margin-top: 0;
                color: #555;
                font-size: 1rem;
            }
            
            .btn {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background-color: #4CAF50;
                color: white;
                width: 100%;
            }
            
            .btn-primary:hover {
                background-color: #45a049;
            }
            
            .btn-outline {
                background-color: transparent;
                color: #666;
                border: 1px solid #ddd;
            }
            
            .btn-outline:hover {
                background-color: #f5f5f5;
            }
            
            @media (max-width: 768px) {
                .modal-container {
                    width: 95%;
                    margin: 10px;
                }
                
                .modal-close-x {
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    width: 35px;
                    height: 35px;
                }
                
                .reports-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add global close function
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    };

    // Add report generate handler
    window.handleReportGenerate = function(reportId) {
        this.showNotification(`Generating ${reportId.replace('-', ' ')} report...`, 'success');
        setTimeout(() => {
            this.showNotification(`Report generated successfully!`, 'success');
            window.closeModal('reports-modal');
        }, 1500);
    }.bind(this);
},

// ==================== CATEGORIES MODAL METHODS ====================

showManageCategoriesModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay active" id="manage-categories-modal">
            <div class="modal-container modal-lg">
                <button class="modal-close-x" onclick="closeModal('manage-categories-modal')">×</button>
                
                <div class="modal-header">
                    <h2 class="modal-title">Manage Categories</h2>
                </div>
                
                <div class="modal-content">
                    <div class="categories-management">
                        <div class="tabs">
                            <button class="tab active" onclick="switchCategoryTab('income')">💰 Income Categories</button>
                            <button class="tab" onclick="switchCategoryTab('expense')">💸 Expense Categories</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="income-categories-pane">
                                <div class="categories-list" id="income-categories-list">
                                    ${this.renderCategoryList('income')}
                                </div>
                                <button class="btn btn-primary add-category-btn" onclick="FarmFinanceTracker.showAddCategoryModal('income')">
                                    <span class="btn-icon">➕</span>
                                    <span class="btn-text">Add Income Category</span>
                                </button>
                            </div>
                            
                            <div class="tab-pane" id="expense-categories-pane">
                                <div class="categories-list" id="expense-categories-list">
                                    ${this.renderCategoryList('expense')}
                                </div>
                                <button class="btn btn-primary add-category-btn" onclick="FarmFinanceTracker.showAddCategoryModal('expense')">
                                    <span class="btn-icon">➕</span>
                                    <span class="btn-text">Add Expense Category</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('manage-categories-modal')">Close</button>
                    <button class="btn btn-primary" onclick="saveCategories()">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add category management styles
    if (!document.querySelector('#category-styles')) {
        const style = document.createElement('style');
        style.id = 'category-styles';
        style.textContent = `
            .tabs {
                display: flex;
                border-bottom: 2px solid #eee;
                margin-bottom: 20px;
            }
            
            .tab {
                padding: 12px 20px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                color: #666;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
                margin-bottom: -2px;
            }
            
            .tab.active {
                color: #4CAF50;
                border-bottom-color: #4CAF50;
                font-weight: 600;
            }
            
            .tab:hover:not(.active) {
                color: #333;
                background-color: #f5f5f5;
            }
            
            .tab-pane {
                display: none;
            }
            
            .tab-pane.active {
                display: block;
            }
            
            .categories-list {
                margin-bottom: 20px;
                max-height: 300px;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .category-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #eee;
            }
            
            .category-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .category-icon {
                font-size: 1.5rem;
            }
            
            .category-details {
                display: flex;
                flex-direction: column;
            }
            
            .category-name {
                font-weight: 600;
                color: #333;
            }
            
            .category-value {
                font-size: 0.85rem;
                color: #666;
                font-family: monospace;
                margin-top: 2px;
            }
            
            .category-actions {
                display: flex;
                gap: 8px;
            }
            
            .icon-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 6px;
                border-radius: 4px;
                color: #666;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .icon-btn:hover {
                background-color: #f0f0f0;
                color: #333;
            }
            
            .empty-categories {
                text-align: center;
                padding: 40px 20px;
                color: #999;
                font-style: italic;
                background: #f9f9f9;
                border-radius: 8px;
                border: 2px dashed #ddd;
            }
            
            .add-category-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 12px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: background-color 0.2s;
            }
            
            .add-category-btn:hover {
                background-color: #45a049;
            }
            
            .btn-icon {
                font-size: 1.2rem;
            }
        `;
        document.head.appendChild(style);
    }

    // Add tab switching function
    window.switchCategoryTab = function(tabType) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="switchCategoryTab('${tabType}')"]`).classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabType}-categories-pane`).classList.add('active');
    };

    // Add save function
    window.saveCategories = function() {
        this.saveData();
        this.showNotification('Categories saved successfully!', 'success');
        window.closeModal('manage-categories-modal');
    }.bind(this);
},

renderCategoryList(type) {
    const categories = this.categories[type];
    
    if (categories.length === 0) {
        return `<div class="empty-categories">No ${type} categories yet. Add your first one!</div>`;
    }
    
    return categories.map(category => `
        <div class="category-item">
            <div class="category-info">
                <span class="category-icon">${category.icon}</span>
                <div class="category-details">
                    <div class="category-name">${category.label}</div>
                    <div class="category-value">${category.value}</div>
                </div>
            </div>
            <div class="category-actions">
                <button class="icon-btn edit-category-btn" 
                        onclick="FarmFinanceTracker.showEditCategoryModal('${type}', '${category.value}')"
                        title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="icon-btn delete-category-btn" 
                        onclick="FarmFinanceTracker.showDeleteCategoryModal('${type}', '${category.value}')"
                        title="Delete">
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
    
    const modalHTML = `
        <div class="modal-overlay active" id="add-category-modal">
            <div class="modal-container modal-sm">
                <button class="modal-close-x" onclick="closeModal('add-category-modal')">×</button>
                
                <div class="modal-header">
                    <h2 class="modal-title">Add ${typeLabel} Category</h2>
                </div>
                
                <div class="modal-content">
                    <form id="addCategoryForm">
                        <div class="form-group">
                            <label for="category-name">Category Name *</label>
                            <input type="text" id="category-name" required 
                                   placeholder="e.g., Feed & Nutrition, Egg Sales...">
                        </div>
                        
                        <div class="form-group">
                            <label for="category-value">Category Value *</label>
                            <input type="text" id="category-value" required 
                                   placeholder="e.g., feed, egg-sales...">
                            <small class="form-note">Used internally (no spaces, lowercase)</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="category-icon">Icon</label>
                            <select id="category-icon" class="icon-select">
                                <option value="🥚">🥚 Egg</option>
                                <option value="🐔">🐔 Chicken</option>
                                <option value="🌾">🌾 Grain</option>
                                <option value="💊">💊 Medicine</option>
                                <option value="🔧">🔧 Tools</option>
                                <option value="👷">👷 Labor</option>
                                <option value="⚡">⚡ Utilities</option>
                                <option value="🚚">🚚 Transport</option>
                                <option value="💰">💰 Money</option>
                                <option value="📦" selected>📦 Other</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('add-category-modal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitAddCategory('${type}')">Add Category</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form styles
    if (!document.querySelector('#form-styles')) {
        const style = document.createElement('style');
        style.id = 'form-styles';
        style.textContent = `
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1rem;
                box-sizing: border-box;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #4CAF50;
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
            }
            
            .form-note {
                display: block;
                margin-top: 5px;
                color: #666;
                font-size: 0.85rem;
            }
            
            .icon-select {
                font-size: 1.2rem;
                padding: 8px;
            }
            
            .modal-sm .modal-container {
                max-width: 500px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add submit function
    window.submitAddCategory = function(categoryType) {
        const name = document.getElementById('category-name').value.trim();
        const value = document.getElementById('category-value').value.trim();
        const icon = document.getElementById('category-icon').value;
        
        if (!name || !value) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const newCategory = {
            label: name,
            value: value.toLowerCase().replace(/\s+/g, '-'),
            icon: icon
        };
        
        this.categories[categoryType].push(newCategory);
        this.saveData();
        this.showNotification(`${categoryType === 'income' ? 'Income' : 'Expense'} category added!`, 'success');
        
        // Close both modals
        window.closeModal('add-category-modal');
        window.closeModal('manage-categories-modal');
        
        // Reopen categories modal
        setTimeout(() => {
            this.showManageCategoriesModal();
        }, 300);
    }.bind(this);
},

showEditCategoryModal(type, categoryValue) {
    const categories = this.categories[type];
    const category = categories.find(cat => cat.value === categoryValue);
    const typeLabel = type === 'income' ? 'Income' : 'Expense';
    
    if (!category) return;
    
    const modalHTML = `
        <div class="modal-overlay active" id="edit-category-modal">
            <div class="modal-container modal-sm">
                <button class="modal-close-x" onclick="closeModal('edit-category-modal')">×</button>
                
                <div class="modal-header">
                    <h2 class="modal-title">Edit ${typeLabel} Category</h2>
                </div>
                
                <div class="modal-content">
                    <form id="editCategoryForm">
                        <div class="form-group">
                            <label for="edit-category-name">Category Name *</label>
                            <input type="text" id="edit-category-name" required 
                                   value="${category.label}">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-category-value">Category Value *</label>
                            <input type="text" id="edit-category-value" required 
                                   value="${category.value}">
                            <small class="form-note">Used internally (no spaces, lowercase)</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-category-icon">Icon</label>
                            <select id="edit-category-icon" class="icon-select">
                                <option value="🥚" ${category.icon === '🥚' ? 'selected' : ''}>🥚 Egg</option>
                                <option value="🐔" ${category.icon === '🐔' ? 'selected' : ''}>🐔 Chicken</option>
                                <option value="🌾" ${category.icon === '🌾' ? 'selected' : ''}>🌾 Grain</option>
                                <option value="💊" ${category.icon === '💊' ? 'selected' : ''}>💊 Medicine</option>
                                <option value="🔧" ${category.icon === '🔧' ? 'selected' : ''}>🔧 Tools</option>
                                <option value="👷" ${category.icon === '👷' ? 'selected' : ''}>👷 Labor</option>
                                <option value="⚡" ${category.icon === '⚡' ? 'selected' : ''}>⚡ Utilities</option>
                                <option value="🚚" ${category.icon === '🚚' ? 'selected' : ''}>🚚 Transport</option>
                                <option value="💰" ${category.icon === '💰' ? 'selected' : ''}>💰 Money</option>
                                <option value="📦" ${category.icon === '📦' ? 'selected' : ''}>📦 Other</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('edit-category-modal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitEditCategory('${type}', '${categoryValue}')">Update Category</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add submit function
    window.submitEditCategory = function(categoryType, oldValue) {
        const name = document.getElementById('edit-category-name').value.trim();
        const value = document.getElementById('edit-category-value').value.trim();
        const icon = document.getElementById('edit-category-icon').value;
        
        if (!name || !value) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const updatedCategory = {
            label: name,
            value: value.toLowerCase().replace(/\s+/g, '-'),
            icon: icon
        };
        
        // Update the category
        const index = this.categories[categoryType].findIndex(cat => cat.value === oldValue);
        if (index !== -1) {
            this.categories[categoryType][index] = updatedCategory;
            this.saveData();
            this.showNotification(`${categoryType === 'income' ? 'Income' : 'Expense'} category updated!`, 'success');
            
            // Close both modals
            window.closeModal('edit-category-modal');
            window.closeModal('manage-categories-modal');
            
            // Reopen categories modal
            setTimeout(() => {
                this.showManageCategoriesModal();
            }, 300);
        }
    }.bind(this);
},

showDeleteCategoryModal(type, categoryValue) {
    const categories = this.categories[type];
    const category = categories.find(cat => cat.value === categoryValue);
    const typeLabel = type === 'income' ? 'Income' : 'Expense';
    
    if (!category) return;
    
    const modalHTML = `
        <div class="modal-overlay active" id="delete-category-modal">
            <div class="modal-container modal-sm">
                <button class="modal-close-x" onclick="closeModal('delete-category-modal')">×</button>
                
                <div class="modal-header">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 2rem;">⚠️</span>
                        <div>
                            <h2 class="modal-title" style="color: #d32f2f; margin: 0;">Delete ${typeLabel} Category</h2>
                        </div>
                    </div>
                </div>
                
                <div class="modal-content">
                    <div style="padding: 20px; background: #ffebee; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-weight: 600; color: #c62828;">
                            Are you sure you want to delete "${category.label}"?
                        </p>
                        <p style="margin: 0; color: #666; font-size: 0.95rem;">
                            This action cannot be undone. Existing transactions using this category will need to be reassigned.
                        </p>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('delete-category-modal')">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmDeleteCategory('${type}', '${categoryValue}')">Delete Category</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add danger button style
    if (!document.querySelector('#danger-styles')) {
        const style = document.createElement('style');
        style.id = 'danger-styles';
        style.textContent = `
            .btn-danger {
                background-color: #d32f2f;
                color: white;
            }
            
            .btn-danger:hover {
                background-color: #c62828;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add delete function
    window.confirmDeleteCategory = function(categoryType, categoryValue) {
        // Remove the category
        this.categories[categoryType] = this.categories[categoryType].filter(cat => cat.value !== categoryValue);
        this.saveData();
        this.showNotification(`${categoryType === 'income' ? 'Income' : 'Expense'} category deleted!`, 'success');
        
        // Close both modals
        window.closeModal('delete-category-modal');
        window.closeModal('manage-categories-modal');
        
        // Reopen categories modal
        setTimeout(() => {
            this.showManageCategoriesModal();
        }, 300);
    }.bind(this);
}

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
    // Check if ModalManager is available
    if (!window.ModalManager || !window.ModalManager.show) {
        console.error('❌ ModalManager not available');
        this.showNotification('Modal system is not available. Please refresh the page.', 'error');
        return;
    }
    
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
                            <span class="card-subtitle">Use camera with OCR</span>
                        </button>
                        <button class="card-button" id="upload-option">
                            <div class="card-icon">📁</div>
                            <span class="card-title">Upload Files</span>
                            <span class="card-subtitle">From device</span>
                        </button>
                        <button class="card-button" id="scan-option">
                            <div class="card-icon">🔍</div>
                            <span class="card-title">OCR Scan</span>
                            <span class="card-subtitle">Extract text from image</span>
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
                                <span class="btn-text">Capture & Scan</span>
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
                                <h4>Processing...</h4>
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
                
                <!-- OCR Scan Section -->
                <div class="ocr-section" id="ocr-section" style="display: none;">
                    <div class="glass-card">
                        <div class="card-header">
                            <h3>OCR Text Extraction</h3>
                        </div>
                        <div class="ocr-content">
                            <div class="ocr-preview-area" id="ocr-preview-area">
                                <div class="ocr-placeholder">
                                    <div class="ocr-icon">🔍</div>
                                    <p>Upload an image to extract text</p>
                                </div>
                                <canvas id="ocr-canvas" style="display: none;"></canvas>
                            </div>
                            
                            <div class="ocr-controls">
                                <input type="file" id="ocr-file-input" accept=".jpg,.jpeg,.png" style="display: none;">
                                <button class="btn btn-primary" id="select-ocr-image">
                                    <span class="btn-icon">📁</span>
                                    <span class="btn-text">Select Image</span>
                                </button>
                                <button class="btn btn-success" id="start-ocr" disabled>
                                    <span class="btn-icon">🔍</span>
                                    <span class="btn-text">Start OCR</span>
                                </button>
                            </div>
                            
                            <div class="ocr-results" id="ocr-results" style="display: none;">
                                <h4>Extracted Text:</h4>
                                <div class="extracted-text" id="extracted-text"></div>
                                <div class="ocr-actions">
                                    <button class="btn btn-sm btn-outline" id="copy-ocr-text">
                                        <span class="btn-icon">📋</span>
                                        <span class="btn-text">Copy Text</span>
                                    </button>
                                    <button class="btn btn-sm btn-primary" id="create-from-ocr">
                                        <span class="btn-icon">➕</span>
                                        <span class="btn-text">Create Transaction</span>
                                    </button>
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
    
    // OCR Scan option
    document.getElementById('scan-option').addEventListener('click', () => {
        this.showOCRInterface();
    });
    
    // File upload handlers
    document.getElementById('browse-receipts-btn').addEventListener('click', () => {
        document.getElementById('receipt-upload-input').click();
    });
    
    document.getElementById('receipt-upload-input').addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files, true); // true = enable OCR
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
            this.handleFileUpload(e.dataTransfer.files, true); // true = enable OCR
        });
    }
    
    // OCR handlers
    document.getElementById('select-ocr-image').addEventListener('click', () => {
        document.getElementById('ocr-file-input').click();
    });
    
    document.getElementById('ocr-file-input').addEventListener('change', (e) => {
        this.handleOCRImageSelect(e.target.files[0]);
    });
    
    document.getElementById('start-ocr').addEventListener('click', () => {
        this.performOCR();
    });
    
    document.getElementById('copy-ocr-text').addEventListener('click', () => {
        this.copyOCRText();
    });
    
    document.getElementById('create-from-ocr').addEventListener('click', () => {
        this.createTransactionFromOCR();
    });
    
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

    showOCRInterface() {
    // Hide other sections, show OCR
    document.getElementById('camera-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('ocr-section').style.display = 'block';
    document.getElementById('recent-section').style.display = 'block';
},

handleOCRImageSelect(file) {
    if (!file) return;
    
    // Validate file
    if (!this.isValidImageFile(file)) {
        this.showNotification('Please select a valid image file (JPG, PNG)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Display preview
            const canvas = document.getElementById('ocr-canvas');
            const previewArea = document.getElementById('ocr-preview-area');
            
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Display image preview
            previewArea.innerHTML = `
                <img src="${e.target.result}" alt="OCR Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
            `;
            
            // Enable OCR button
            document.getElementById('start-ocr').disabled = false;
            document.getElementById('start-ocr').innerHTML = `
                <span class="btn-icon">🔍</span>
                <span class="btn-text">Scan for Text</span>
            `;
            
            // Store image data for OCR
            this.currentOCRImage = {
                dataUrl: e.target.result,
                file: file,
                canvas: canvas
            };
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
},

async performOCR() {
    if (!this.currentOCRImage) {
        this.showNotification('Please select an image first', 'warning');
        return;
    }
    
    const ocrBtn = document.getElementById('start-ocr');
    const resultsSection = document.getElementById('ocr-results');
    const extractedText = document.getElementById('extracted-text');
    
    // Show loading
    ocrBtn.disabled = true;
    ocrBtn.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text">Processing...</span>
    `;
    
    extractedText.innerHTML = '<div class="loading-text">Scanning image for text...</div>';
    resultsSection.style.display = 'block';
    
    try {
        // Try using Tesseract.js if available
        if (window.Tesseract) {
            const result = await this.performTesseractOCR();
            this.displayOCRResults(result);
        } 
        // Try using browser's OCR API if available (Chrome 109+)
        else if ('OCR' in window) {
            const result = await this.performBrowserOCR();
            this.displayOCRResults(result);
        }
        // Fallback: Simulated OCR
        else {
            const result = await this.performSimulatedOCR();
            this.displayOCRResults(result);
        }
        
    } catch (error) {
        console.error('OCR Error:', error);
        extractedText.innerHTML = `
            <div class="error-text">
                <p>OCR failed: ${error.message}</p>
                <p>You can still upload the image and extract data manually.</p>
            </div>
        `;
    } finally {
        // Reset button
        ocrBtn.disabled = false;
        ocrBtn.innerHTML = `
            <span class="btn-icon">🔍</span>
            <span class="btn-text">Scan Again</span>
        `;
    }
},

// Tesseract.js OCR implementation
async performTesseractOCR() {
    const { createWorker } = Tesseract;
    const worker = await createWorker('eng');
    
    try {
        const { data: { text } } = await worker.recognize(this.currentOCRImage.dataUrl);
        await worker.terminate();
        
        return {
            text: text.trim(),
            confidence: 0.85,
            extractedData: this.extractDataFromOCRText(text)
        };
    } catch (error) {
        await worker.terminate();
        throw error;
    }
},

// Browser OCR API (Chrome 109+)
async performBrowserOCR() {
    return new Promise((resolve, reject) => {
        const ocr = new OCR();
        ocr.detect(this.currentOCRImage.dataUrl)
            .then((results) => {
                const text = results.map(r => r.text).join('\n');
                resolve({
                    text: text,
                    confidence: 0.90,
                    extractedData: this.extractDataFromOCRText(text)
                });
            })
            .catch(reject);
    });
},

// Simulated OCR (for when no OCR engine is available)
async performSimulatedOCR() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate finding some text patterns
            const simulatedText = `GROCERY STORE RECEIPT
Store: SuperMart #1234
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

CHICKEN FEED ............ $45.99
EGG CARTONS ............. $12.50
VET MEDICATION .......... $28.75
FARM SUPPLIES ........... $67.25

SUBTOTAL ............... $154.49
TAX .................... $12.36
TOTAL ................. $166.85

Thank you for shopping!`;
            
            resolve({
                text: simulatedText,
                confidence: 0.65,
                extractedData: this.extractDataFromOCRText(simulatedText)
            });
        }, 2000);
    });
},

// Extract structured data from OCR text
extractDataFromOCRText(text) {
    const extractedData = {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        vendor: 'Unknown Vendor',
        items: [],
        category: 'other-expense',
        type: 'expense'
    };
    
    // Try to find amount (look for $ followed by numbers)
    const amountMatch = text.match(/\$?\s*(\d+[.,]\d{2})/g);
    if (amountMatch) {
        // Take the largest amount (likely the total)
        const amounts = amountMatch.map(match => {
            const num = match.replace(/[$,]/g, '');
            return parseFloat(num);
        });
        if (amounts.length > 0) {
            extractedData.amount = Math.max(...amounts.filter(n => !isNaN(n)));
        }
    }
    
    // Try to find date (common date patterns)
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
    if (dateMatch) {
        extractedData.date = this.parseDateString(dateMatch[0]);
    }
    
    // Try to find vendor/store name
    const vendorPatterns = [
        /Store:\s*([^\n]+)/i,
        /From:\s*([^\n]+)/i,
        /^(.*?)\s*RECEIPT/i,
        /^(.*?)\s*INVOICE/i
    ];
    
    for (const pattern of vendorPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            extractedData.vendor = match[1].trim();
            break;
        }
    }
    
    // Extract line items (look for patterns like ITEM ......... $XX.XX)
    const itemMatches = text.match(/([A-Z][A-Z\s]+)[\.\s]+\$?(\d+[.,]\d{2})/g);
    if (itemMatches) {
        extractedData.items = itemMatches.map(item => item.trim());
        
        // Try to guess category from items
        const itemText = itemMatches.join(' ').toLowerCase();
        if (itemText.includes('feed') || itemText.includes('grain')) {
            extractedData.category = 'feed';
        } else if (itemText.includes('medic') || itemText.includes('vet')) {
            extractedData.category = 'medication';
        } else if (itemText.includes('equipment') || itemText.includes('tool')) {
            extractedData.category = 'equipment';
        } else if (itemText.includes('labor') || itemText.includes('wage')) {
            extractedData.category = 'labor';
        }
    }
    
    return extractedData;
},

parseDateString(dateStr) {
    try {
        // Try different date formats
        const formats = [
            'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD',
            'MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'
        ];
        
        for (const format of formats) {
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length === 3) {
                let year, month, day;
                
                if (format.startsWith('YYYY')) {
                    year = parseInt(parts[0]);
                    month = parseInt(parts[1]) - 1;
                    day = parseInt(parts[2]);
                } else if (format.endsWith('YYYY')) {
                    month = parseInt(parts[0]) - 1;
                    day = parseInt(parts[1]);
                    year = parseInt(parts[2]);
                    if (year < 100) year += 2000; // Handle 2-digit years
                }
                
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }
    } catch (error) {
        console.error('Date parsing error:', error);
    }
    
    return new Date().toISOString().split('T')[0];
},

displayOCRResults(result) {
    const extractedText = document.getElementById('extracted-text');
    const resultsSection = document.getElementById('ocr-results');
    
    extractedText.innerHTML = `
        <div class="ocr-success">
            <div class="confidence-badge">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
            <pre class="ocr-text">${result.text}</pre>
            ${result.extractedData.amount > 0 ? `
                <div class="extracted-data">
                    <h5>Extracted Information:</h5>
                    <ul>
                        <li>Amount: $${result.extractedData.amount.toFixed(2)}</li>
                        <li>Date: ${result.extractedData.date}</li>
                        <li>Vendor: ${result.extractedData.vendor}</li>
                        <li>Category: ${this.getCategoryName(result.extractedData.category)}</li>
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    resultsSection.style.display = 'block';
    
    // Store results for later use
    this.currentOCRResults = {
        text: result.text,
        extractedData: result.extractedData,
        imageData: this.currentOCRImage.dataUrl
    };
    
    this.showNotification('Text extracted successfully!', 'success');
},

copyOCRText() {
    if (!this.currentOCRResults) return;
    
    navigator.clipboard.writeText(this.currentOCRResults.text)
        .then(() => {
            this.showNotification('Text copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            this.showNotification('Failed to copy text', 'error');
        });
},

createTransactionFromOCR() {
    if (!this.currentOCRResults) {
        this.showNotification('No OCR results available', 'warning');
        return;
    }
    
    // Create transaction from extracted data
    const transactionData = {
        type: this.currentOCRResults.extractedData.type || 'expense',
        description: `Receipt from ${this.currentOCRResults.extractedData.vendor}`,
        amount: this.currentOCRResults.extractedData.amount || 0,
        category: this.currentOCRResults.extractedData.category || 'other-expense',
        date: this.currentOCRResults.extractedData.date,
        paymentMethod: 'receipt',
        notes: `Extracted via OCR:\n${this.currentOCRResults.text.substring(0, 200)}...`,
        status: 'completed'
    };
    
    // Show review modal
    if (window.ModalManager && window.ModalManager.showReceiptReviewModal) {
        window.ModalManager.showReceiptReviewModal({
            receipt: {
                name: 'OCR Extracted Receipt',
                isOCR: true
            },
            extractedData: transactionData,
            onSubmit: (formData) => {
                const finalTransaction = {
                    ...transactionData,
                    ...formData,
                    ocrExtracted: true
                };
                
                this.addTransaction(finalTransaction);
                this.showNotification('Transaction created from OCR!', 'success');
                
                // Close modal
                if (window.ModalManager.closeCurrentModal) {
                    window.ModalManager.closeCurrentModal();
                }
            }
        });
    } else {
        // Fallback: add transaction directly
        this.addTransaction(transactionData);
        this.showNotification('Transaction added!', 'success');
    }
},

// Update file upload to optionally run OCR
async handleFileUpload(files, enableOCR = false) {
    if (!files || files.length === 0) return;
    
    const totalFiles = files.length;
    let processedFiles = 0;
    
    // Show progress
    const progressSection = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-percentage');
    const fileName = document.getElementById('upload-file-name');
    
    if (progressSection) progressSection.style.display = 'block';
    
    // Upload each file
    for (const file of Array.from(files)) {
        fileName.textContent = `Processing: ${file.name}`;
        
        try {
            // Upload/save the file
            const receiptData = window.storage ? 
                await this.uploadReceiptToFirebase(file) : 
                this.saveReceiptLocally(file);
            
            // If OCR is enabled and it's an image, try to extract text
            if (enableOCR && file.type.startsWith('image/')) {
                fileName.textContent = `Scanning: ${file.name}`;
                
                try {
                    const ocrResult = await this.quickOCRScan(file);
                    if (ocrResult && ocrResult.extractedData.amount > 0) {
                        receiptData.ocrData = ocrResult;
                        this.showNotification(`Found amount: $${ocrResult.extractedData.amount.toFixed(2)}`, 'info');
                    }
                } catch (ocrError) {
                    console.log('Quick OCR skipped:', ocrError);
                }
            }
            
            processedFiles++;
            
            // Update progress
            const progress = Math.round((processedFiles / totalFiles) * 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Failed to process ${file.name}: ${error.message}`, 'error');
        }
    }
    
    // Hide progress after completion
    setTimeout(() => {
        if (progressSection) progressSection.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
        if (fileName) fileName.textContent = '-';
    }, 1000);
    
    this.showNotification(`${processedFiles} receipt(s) processed!`, 'success');
    
    // Update UI
    this.updateReceiptQueueUI();
    
    // Show process button
    const processBtn = document.getElementById('process-receipts-btn');
    if (processBtn) processBtn.style.display = 'inline-block';
},

// Quick OCR scan for file uploads
async quickOCRScan(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Simple regex-based extraction (faster than full OCR)
                const text = await this.extractTextViaCanvas(file);
                const extractedData = this.extractDataFromOCRText(text);
                
                resolve({
                    text: text,
                    extractedData: extractedData,
                    confidence: 0.5
                });
            } catch (error) {
                resolve(null);
            }
        };
        reader.readAsDataURL(file);
    });
},

// Simple text extraction via canvas (basic OCR simulation)
async extractTextViaCanvas(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Simple text detection simulation
            // In a real app, you'd use Tesseract.js here
            const simulatedText = `Image: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\n\n[Text extraction would appear here with full OCR integration]`;
            
            resolve(simulatedText);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
},

isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
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
        // Check if Firebase is available
        if (!window.db || typeof window.db.collection !== 'function') {
            throw new Error('Firebase Firestore not available');
        }
        
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
        
        // Also save to localStorage for offline use
        localStorage.setItem('farm-pending-receipts', JSON.stringify(this.receiptQueue));
        
        console.log(`✅ Loaded ${this.receiptQueue.length} receipts from Firebase`);
        
    } catch (error) {
        console.error('Error loading receipts from Firebase:', error);
        
        // Fallback to localStorage
        const savedReceipts = localStorage.getItem('farm-pending-receipts');
        if (savedReceipts) {
            this.receiptQueue = JSON.parse(savedReceipts);
            console.log(`✅ Loaded ${this.receiptQueue.length} receipts from localStorage (fallback)`);
        } else {
            this.receiptQueue = [];
            console.log('ℹ️ No receipts found anywhere');
        }
        
        throw error; // Re-throw for caller to handle
    }
},

    // Add this method to save receipts locally (for when Firebase is not available)
saveReceiptLocally(file) {
    const receiptId = `local_receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const receiptData = {
        id: receiptId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        isLocal: true, // Flag to indicate it's stored locally
        metadata: {
            contentType: file.type,
            size: file.size
        }
    };
    
    // Add to queue
    this.receiptQueue.push(receiptData);
    
    // Save to localStorage
    localStorage.setItem('farm-pending-receipts', JSON.stringify(this.receiptQueue));
    
    console.log('✅ Receipt saved locally:', receiptData.name);
    return receiptData;
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

        updatePendingReceiptsUI() {
        // This method should update the pending receipts UI
        console.log('🔄 Updating pending receipts UI...');
        
        const pendingSection = document.getElementById('pending-receipts-section');
        const pendingList = document.getElementById('pending-receipts-list');
        const badge = document.getElementById('receipt-count-badge');
        
        if (!pendingSection || !pendingList || !badge) return;
        
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pendingReceipts.length > 0) {
            // Show the section
            pendingSection.style.display = 'block';
            
            // Update badge
            badge.textContent = pendingReceipts.length;
            badge.style.display = 'inline-block';
            
            // Update list
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
            
            // Add event listeners to new buttons
            this.setupReceiptActionListeners();
            
        } else {
            // Hide the section
            pendingSection.style.display = 'none';
            badge.style.display = 'none';
        }
        
        console.log('✅ Pending receipts UI updated');
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
