// modules/income-expenses.js - CSS-BASED VERSION (Refactored)
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    id: 'income-expenses',
    initialized: false,
    element: null,

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
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load data
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
            <div id="income-expenses" class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Income & Expenses</h1>
                    <p class="module-subtitle">Track and manage financial records</p>
                </div>

                <!-- Quick Actions -->
                <div class="module-card">
                    <button class="module-action-btn" data-action="add-income">
                        <span class="btn-icon">💰</span>
                        <span class="btn-text">Add Income</span>
                    </button>
                    <button class="module-action-btn" data-action="add-expense">
                        <span class="btn-icon">💸</span>
                        <span class="btn-text">Add Expense</span>
                    </button>
                </div>

                <!-- Summary Cards -->
                <div class="module-section">
                    <h2 class="section-title">Financial Overview</h2>
                    <div class="cards-grid">
                        <div class="summary-card income-card">
                            <div class="card-icon">💰</div>
                            <div class="card-content">
                                <div class="card-label">Total Income</div>
                                <div class="card-value" id="total-income">$0.00</div>
                                <div class="card-trend positive">+12% this month</div>
                            </div>
                        </div>
                        
                        <div class="summary-card expense-card">
                            <div class="card-icon">💸</div>
                            <div class="card-content">
                                <div class="card-label">Total Expenses</div>
                                <div class="card-value" id="total-expenses">$0.00</div>
                                <div class="card-trend">Monthly average</div>
                            </div>
                        </div>
                        
                        <div class="summary-card profit-card">
                            <div class="card-icon">📊</div>
                            <div class="card-content">
                                <div class="card-label">Net Profit</div>
                                <div class="card-value" id="net-profit">$0.00</div>
                                <div class="card-trend positive">Profit margin</div>
                            </div>
                        </div>
                        
                        <div class="summary-card monthly-card">
                            <div class="card-icon">📅</div>
                            <div class="card-content">
                                <div class="card-label">This Month</div>
                                <div class="card-value" id="monthly-total">$0.00</div>
                                <div class="card-trend">Current period</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="module-section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Transactions</h2>
                        <button class="btn-secondary" id="view-all-btn">
                            View All →
                        </button>
                    </div>
                    
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
                            <tbody id="transactions-table-body">
                                <!-- Transactions will be loaded here -->
                                <tr class="empty-row">
                                    <td colspan="6">
                                        <div class="empty-state">
                                            <div class="empty-icon">📋</div>
                                            <div class="empty-text">No transactions yet</div>
                                            <div class="empty-subtext">Add your first income or expense record</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Expense Categories -->
                <div class="module-section">
                    <h2 class="section-title">Expense Categories</h2>
                    <div class="categories-container" id="categories-container">
                        <!-- Categories will be loaded here -->
                        <div class="loading-categories">
                            <div class="loading-spinner"></div>
                            <p>Loading categories...</p>
                        </div>
                    </div>
                </div>

                <!-- Monthly Chart -->
                <div class="module-section">
                    <h2 class="section-title">Monthly Trends</h2>
                    <div class="chart-container">
                        <div class="chart-placeholder">
                            <div class="chart-icon">📈</div>
                            <div class="chart-text">Income vs Expenses Chart</div>
                            <div class="chart-subtext">Visualize your financial trends</div>
                            <button class="btn-secondary" id="generate-report-btn">Generate Report</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Action buttons
        const actionButtons = document.querySelectorAll('.module-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleAction(action);
            });
        });
        
        // View all button
        const viewAllBtn = document.getElementById('view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showNotification('View all transactions clicked', 'info');
            });
        }
        
        // Generate report button
        const reportBtn = document.getElementById('generate-report-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }
    },

    loadAndDisplayData() {
        const data = this.getModuleData();
        this.updateSummaryCards(data);
        this.updateTransactionsTable(data);
        this.updateCategories(data);
    },

    getModuleData() {
        let data = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            monthlyTotal: 0,
            recentTransactions: [],
            expenseCategories: {},
            monthlyTrends: []
        };

        // Try to get data from FarmModules
        if (window.FarmModules && window.FarmModules.appData) {
            const sharedData = window.FarmModules.appData.incomeExpenses;
            if (sharedData) {
                data = { ...data, ...sharedData };
            }
        }

        // Fallback to localStorage
        if (data.totalIncome === 0) {
            const savedData = localStorage.getItem('farm-income-expenses-data');
            if (savedData) {
                data = { ...data, ...JSON.parse(savedData) };
            }
        }

        // Calculate net profit if not provided
        if (data.netProfit === 0) {
            data.netProfit = data.totalIncome - data.totalExpenses;
        }

        // Use sample data for demo if empty
        if (data.totalIncome === 0) {
            data = this.getSampleData();
        }

        return data;
    },

    getSampleData() {
        return {
            totalIncome: 12500,
            totalExpenses: 8500,
            netProfit: 4000,
            monthlyTotal: 3200,
            recentTransactions: [
                {
                    id: 1,
                    date: '2024-01-15',
                    description: 'Chicken Sales - Batch #45',
                    category: 'Livestock',
                    type: 'income',
                    amount: 2500,
                    status: 'completed'
                },
                {
                    id: 2,
                    date: '2024-01-14',
                    description: 'Feed Purchase - Premium',
                    category: 'Feed',
                    type: 'expense',
                    amount: 800,
                    status: 'completed'
                },
                {
                    id: 3,
                    date: '2024-01-13',
                    description: 'Egg Sales - Wholesale',
                    category: 'Products',
                    type: 'income',
                    amount: 1200,
                    status: 'completed'
                },
                {
                    id: 4,
                    date: '2024-01-12',
                    description: 'Vaccination Supplies',
                    category: 'Healthcare',
                    type: 'expense',
                    amount: 350,
                    status: 'completed'
                },
                {
                    id: 5,
                    date: '2024-01-11',
                    description: 'Equipment Maintenance',
                    category: 'Equipment',
                    type: 'expense',
                    amount: 450,
                    status: 'pending'
                }
            ],
            expenseCategories: {
                'Feed': 1500,
                'Healthcare': 450,
                'Equipment': 1200,
                'Labor': 2800,
                'Utilities': 650,
                'Other': 895
            },
            monthlyTrends: [
                { month: 'Jan', income: 3200, expenses: 2100 },
                { month: 'Dec', income: 2800, expenses: 1900 },
                { month: 'Nov', income: 3100, expenses: 2200 }
            ]
        };
    },

    updateSummaryCards(data) {
        this.updateCardValue('total-income', this.formatCurrency(data.totalIncome));
        this.updateCardValue('total-expenses', this.formatCurrency(data.totalExpenses));
        this.updateCardValue('net-profit', this.formatCurrency(data.netProfit));
        this.updateCardValue('monthly-total', this.formatCurrency(data.monthlyTotal));
        
        // Update profit card styling
        const profitCard = document.querySelector('.profit-card');
        if (profitCard) {
            if (data.netProfit >= 0) {
                profitCard.classList.add('positive');
                profitCard.classList.remove('negative');
            } else {
                profitCard.classList.add('negative');
                profitCard.classList.remove('positive');
            }
        }
    },

    updateCardValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('value-updating');
            setTimeout(() => {
                element.classList.remove('value-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateTransactionsTable(data) {
        const tableBody = document.getElementById('transactions-table-body');
        if (!tableBody) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <div class="empty-text">No transactions yet</div>
                            <div class="empty-subtext">Add your first income or expense record</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row transaction-${transaction.type}">
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>
                    <span class="category-badge category-${transaction.category.toLowerCase()}">
                        ${transaction.category}
                    </span>
                </td>
                <td>
                    <span class="type-badge type-${transaction.type}">
                        ${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                    </span>
                </td>
                <td class="amount-cell ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <button class="table-action-btn" data-id="${transaction.id}" title="Edit">
                        ✏️
                    </button>
                    <button class="table-action-btn delete-btn" data-id="${transaction.id}" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to action buttons
        this.setupTableActionListeners();
    },

    setupTableActionListeners() {
        const actionButtons = document.querySelectorAll('.table-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.currentTarget.getAttribute('data-id');
                const isDelete = e.currentTarget.classList.contains('delete-btn');
                
                if (isDelete) {
                    this.deleteTransaction(transactionId);
                } else {
                    this.editTransaction(transactionId);
                }
            });
        });
    },

    updateCategories(data) {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const categories = data.expenseCategories || {};
        const totalExpenses = data.totalExpenses || 1; // Avoid division by zero

        if (Object.keys(categories).length === 0) {
            container.innerHTML = `
                <div class="empty-categories">
                    <div class="empty-icon">📊</div>
                    <div class="empty-text">No categories yet</div>
                </div>
            `;
            return;
        }

        container.innerHTML = Object.entries(categories).map(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            return `
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-name">${category}</div>
                        <div class="category-amount">${this.formatCurrency(amount)}</div>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="category-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    },

    handleAction(action) {
        console.log(`Action: ${action}`);
        
        const actionMap = {
            'add-income': this.addIncome.bind(this),
            'add-expense': this.addExpense.bind(this)
        };

        if (actionMap[action]) {
            actionMap[action]();
        } else {
            this.showNotification(`Action "${action}" not implemented yet`, 'info');
        }
    },

    addIncome() {
        this.showNotification('Adding new income record...', 'success');
        // TODO: Open income modal
        // window.ModalManager?.openModal('add-income-modal');
    },

    addExpense() {
        this.showNotification('Adding new expense record...', 'success');
        // TODO: Open expense modal
        // window.ModalManager?.openModal('add-expense-modal');
    },

    editTransaction(transactionId) {
        this.showNotification(`Editing transaction #${transactionId}`, 'info');
    },

    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.showNotification(`Deleted transaction #${transactionId}`, 'warning');
            // TODO: Implement actual deletion
            this.loadAndDisplayData(); // Refresh data
        }
    },

    generateReport() {
        this.showNotification('Generating financial report...', 'info');
        // TODO: Implement report generation
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
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
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('notification-fadeout');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    },

    addTransaction(transaction) {
        if (!window.FarmModules || !window.FarmModules.appData) return;

        if (!window.FarmModules.appData.incomeExpenses) {
            window.FarmModules.appData.incomeExpenses = {};
        }

        if (!window.FarmModules.appData.incomeExpenses.recentTransactions) {
            window.FarmModules.appData.incomeExpenses.recentTransactions = [];
        }

        window.FarmModules.appData.incomeExpenses.recentTransactions.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...transaction
        });

        // Keep only last 20 transactions
        if (window.FarmModules.appData.incomeExpenses.recentTransactions.length > 20) {
            window.FarmModules.appData.incomeExpenses.recentTransactions = 
                window.FarmModules.appData.incomeExpenses.recentTransactions.slice(0, 20);
        }

        this.loadAndDisplayData();
    }
};

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
