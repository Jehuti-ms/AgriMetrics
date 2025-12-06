// modules/income-expenses.js - With Receipt Import Feature
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
        
        // Render module
        this.renderModule();
        
        // Load existing data first
        this.loadData();
        
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

    // ... [All other methods remain exactly as they were in the previous code] ...
    // I'll include the key methods but you already have them

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

    // ... [Continue with all the other methods you already have] ...
    // Make sure all methods from your original code are included here

    // IMPORTANT: Make sure all methods are properly defined
    // I'll show a few more critical methods to ensure completeness:

    addTransaction(transactionData) {
        console.log('➕ Adding transaction:', transactionData);
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

    getCategoryIcon(categoryName) {
        // Find in income categories
        const incomeCat = this.categories.income.find(cat => cat.label === categoryName);
        if (incomeCat) return incomeCat.icon;
        
        // Find in expense categories
        const expenseCat = this.categories.expense.find(cat => cat.label === categoryName);
        if (expenseCat) return expenseCat.icon;
        
        return '📦';
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

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
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

    // ... [Make sure to include ALL other methods from your original code] ...
    // This includes: updateDashboardDisplay, updateTransactionsList, updateCategoriesList,
    // showAddTransactionModal, showReportsModal, showManageCategoriesModal,
    // exportData, clearAllTransactions, and all the receipt import methods

};

// Fix for initialization - ensure module is properly exported
if (typeof window !== 'undefined') {
    // Register the module when FarmModules is available
    if (window.FarmModules) {
        window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
        console.log('✅ Income & Expenses module registered');
    } else {
        // Wait for FarmModules to be available
        const checkFarmModules = setInterval(() => {
            if (window.FarmModules) {
                clearInterval(checkFarmModules);
                window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
                console.log('✅ Income & Expenses module registered after wait');
            }
        }, 100);
        
        // Also try to initialize if called directly
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('📄 DOM loaded, checking for manual initialization...');
            });
        }
    }

    // Export for global access
    window.IncomeExpensesModule = IncomeExpensesModule;
}

// Also export as ES module if supported
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncomeExpensesModule;
}

console.log('✅ Income & Expenses module loaded (waiting for initialization)');
