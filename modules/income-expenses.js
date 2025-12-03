// modules/income-expenses.js - CSS-BASED VERSION (Clean)
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
                    <p class="module-subtitle">Track your farm's financial transactions</p>
                </div>

                <!-- Quick Actions -->
                <div class="module-quick-actions">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-action="add-income">
                            <div class="action-icon">💰</div>
                            <span class="action-title">Add Income</span>
                            <span class="action-subtitle">Record new income</span>
                        </button>

                        <button class="quick-action-btn" data-action="add-expense">
                            <div class="action-icon">💸</div>
                            <span class="action-title">Add Expense</span>
                            <span class="action-subtitle">Record new expense</span>
                        </button>

                        <button class="quick-action-btn" data-action="view-reports">
                            <div class="action-icon">📈</div>
                            <span class="action-title">View Reports</span>
                            <span class="action-subtitle">Financial analytics</span>
                        </button>
                    </div>
                </div>

                <!-- Summary Stats -->
                <div class="summary-stats">
                    <h2 class="section-title">Financial Summary</h2>
                    <div class="stats-grid">
                        <div class="summary-stat-card" id="total-income-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value" id="total-income">$0.00</div>
                            <div class="stat-label">Total Income</div>
                        </div>

                        <div class="summary-stat-card" id="total-expenses-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-value" id="total-expenses">$0.00</div>
                            <div class="stat-label">Total Expenses</div>
                        </div>

                        <div class="summary-stat-card" id="net-profit-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value" id="net-profit">$0.00</div>
                            <div class="stat-label">Net Profit</div>
                        </div>

                        <div class="summary-stat-card" id="monthly-income-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value" id="monthly-income">$0.00</div>
                            <div class="stat-label">This Month</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="recent-transactions">
                    <div class="section-header">
                        <h2 class="section-title">Recent Transactions</h2>
                        <button class="btn-secondary" id="view-all-transactions">
                            View All
                        </button>
                    </div>
                    
                    <div class="transactions-table-container">
                        <div id="transactions-content">
                            <div class="empty-state">
                                <div class="empty-icon">📋</div>
                                <div class="empty-title">No transactions yet</div>
                                <div class="empty-subtitle">Add your first income or expense</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Categories Overview -->
                <div class="categories-overview">
                    <h2 class="section-title">Expense Categories</h2>
                    <div class="categories-grid" id="categories-content">
                        <div class="category-item">
                            <div class="category-icon">🌾</div>
                            <div class="category-info">
                                <div class="category-name">Feed</div>
                                <div class="category-amount">$0.00</div>
                            </div>
                        </div>
                        <div class="category-item">
                            <div class="category-icon">💊</div>
                            <div class="category-info">
                                <div class="category-name">Medication</div>
                                <div class="category-amount">$0.00</div>
                            </div>
                        </div>
                        <div class="category-item">
                            <div class="category-icon">🚜</div>
                            <div class="category-info">
                                <div class="category-name">Equipment</div>
                                <div class="category-amount">$0.00</div>
                            </div>
                        </div>
                        <div class="category-item">
                            <div class="category-icon">👥</div>
                            <div class="category-info">
                                <div class="category-name">Labor</div>
                                <div class="category-amount">$0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        this.setupQuickActions();
        this.setupTransactionButtons();
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    },

    setupTransactionButtons() {
        const viewAllBtn = document.getElementById('view-all-transactions');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showNotification('View all transactions clicked!', 'info');
            });
        }
    },

    loadAndDisplayData() {
        const data = this.getModuleData();
        this.updateSummaryStats(data);
        this.updateRecentTransactions(data);
        this.updateCategoryOverview(data);
    },

    getModuleData() {
        let data = {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            monthlyIncome: 0,
            recentTransactions: [],
            expenseCategories: {}
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

        return data;
    },

    updateSummaryStats(data) {
        this.updateStatCard('total-income', this.formatCurrency(data.totalIncome || 0));
        this.updateStatCard('total-expenses', this.formatCurrency(data.totalExpenses || 0));
        this.updateStatCard('net-profit', this.formatCurrency(data.netProfit || 0));
        this.updateStatCard('monthly-income', this.formatCurrency(data.monthlyIncome || 0));

        // Update profit card styling
        const profitCard = document.getElementById('net-profit-card');
        if (profitCard) {
            const netProfit = data.netProfit || 0;
            if (netProfit >= 0) {
                profitCard.classList.add('profit-positive');
                profitCard.classList.remove('profit-negative');
            } else {
                profitCard.classList.add('profit-negative');
                profitCard.classList.remove('profit-positive');
            }
        }
    },

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('stat-updating');
            setTimeout(() => {
                element.classList.remove('stat-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateRecentTransactions(data) {
        const transactionsContent = document.getElementById('transactions-content');
        if (!transactionsContent) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            // Add some sample transactions for demo
            const sampleTransactions = [
                {
                    id: 1,
                    type: 'income',
                    description: 'Chicken Sales',
                    amount: 2500,
                    date: '2024-01-15',
                    category: 'Sales'
                },
                {
                    id: 2,
                    type: 'expense',
                    description: 'Feed Purchase',
                    amount: 800,
                    date: '2024-01-14',
                    category: 'Feed'
                },
                {
                    id: 3,
                    type: 'income',
                    description: 'Egg Sales',
                    amount: 1200,
                    date: '2024-01-13',
                    category: 'Sales'
                },
                {
                    id: 4,
                    type: 'expense',
                    description: 'Vaccination',
                    amount: 350,
                    date: '2024-01-12',
                    category: 'Medication'
                }
            ];

            if (sampleTransactions.length === 0) {
                transactionsContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-title">No transactions yet</div>
                        <div class="empty-subtitle">Add your first income or expense</div>
                    </div>
                `;
                return;
            }

            transactionsContent.innerHTML = `
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sampleTransactions.map(transaction => `
                            <tr class="transaction-row transaction-${transaction.type}">
                                <td>${this.formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>
                                    <span class="category-badge category-${transaction.category.toLowerCase()}">
                                        ${transaction.category}
                                    </span>
                                </td>
                                <td>
                                    <span class="transaction-type type-${transaction.type}">
                                        ${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}
                                    </span>
                                </td>
                                <td class="transaction-amount ${transaction.type}">
                                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },

    updateCategoryOverview(data) {
        const categoriesContent = document.getElementById('categories-content');
        if (!categoriesContent) return;

        const categories = data.expenseCategories || {
            'Feed': 0,
            'Medication': 0,
            'Equipment': 0,
            'Labor': 0,
            'Utilities': 0,
            'Other': 0
        };

        // Update with sample data for demo
        const sampleCategories = [
            { name: 'Feed', amount: 1500, icon: '🌾' },
            { name: 'Medication', amount: 450, icon: '💊' },
            { name: 'Equipment', amount: 1200, icon: '🚜' },
            { name: 'Labor', amount: 2800, icon: '👥' },
            { name: 'Utilities', amount: 650, icon: '⚡' },
            { name: 'Other', amount: 300, icon: '📦' }
        ];

        categoriesContent.innerHTML = sampleCategories.map(category => `
            <div class="category-item">
                <div class="category-icon">${category.icon}</div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-amount">${this.formatCurrency(category.amount)}</div>
                </div>
                <div class="category-progress">
                    <div class="progress-bar" style="width: ${Math.min((category.amount / 5000) * 100, 100)}%"></div>
                </div>
            </div>
        `).join('');
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': 'open-add-income-modal',
            'add-expense': 'open-add-expense-modal',
            'view-reports': 'reports'
        };

        if (action === 'view-reports' && window.app && window.app.showSection) {
            window.app.showSection('reports');
            this.showNotification('Opening Reports...', 'info');
        } else {
            this.showNotification(`${this.getActionName(action)} feature coming soon!`, 'info');
        }
    },

    getActionName(action) {
        const names = {
            'add-income': 'Add Income',
            'add-expense': 'Add Expense',
            'view-reports': 'Reports'
        };
        return names[action] || action;
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
