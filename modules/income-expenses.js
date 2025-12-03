// modules/income-expenses.js - CSS-BASED VERSION (Matching Dashboard style)
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
                <!-- Welcome Section -->
                <div class="income-header">
                      <div class="income-header-left">
                        <h1 class="income-title">Income & Expenses</h1>
                        <p class="income-subtitle">Track your farm's financial health</p>
                    
                        <!-- Stats inline in white with icons -->
                        <div class="income-stats-inline">
                          <span class="income-stat">💰 $0.00 Total Income</span>
                          <span class="income-stat">💸 $0.00 Total Expenses</span>
                          <span class="income-stat">🪙 $0.00 Net Profit</span>
                        </div>
                      </div>
                    
                      <!-- Right side: Add Transaction + Import Receipts -->
                      <div class="income-header-right">
                        <button class="income-transaction-btn">➕ Transaction</button>
                        <button class="income-action-btn" onclick="openImportModal()">📥 Import Receipts</button>
                      </div>
                    </div>
                     
                 <!-- Quick Actions -->
                      <div class="income-quick-actions">
                        <h2 class="income-section-title">Quick Actions</h2>
                        <div class="income-actions-grid">
                          <button class="income-action-btn" onclick="openIncomeModal()">
                            <div class="action-icon">💰</div>
                            <span class="action-title">Quick Income</span>
                            <span class="action-subtitle">Record income instantly</span>
                          </button>
                    
                          <button class="income-action-btn" onclick="openExpenseModal()">
                            <div class="action-icon">🧾</div>
                            <span class="action-title">Quick Expense</span>
                            <span class="action-subtitle">Record expense instantly</span>
                          </button>
                    
                          <button class="income-action-btn" onclick="navigateToReports()">
                            <div class="action-icon">📊</div>
                            <span class="action-title">View Reports</span>
                            <span class="action-subtitle">Financial analytics</span>
                          </button>
                    
                          <button class="income-action-btn" onclick="openCategories()">
                            <div class="action-icon">📂</div>
                            <span class="action-title">Categories</span>
                            <span class="action-subtitle">Manage categories</span>
                          </button>
                        </div>
                      </div>
                    
                      <!-- Financial Overview -->
                      <div class="income-overview">
                        <h2 class="income-section-title">Financial Overview</h2>
                        <div class="income-stats-grid">
                          <div class="income-stat-card"><div class="stat-icon">📅</div><div class="stat-value">$0.00</div><div class="stat-label">This Month</div></div>
                          <div class="income-stat-card"><div class="stat-icon">📈</div><div class="stat-value">$0.00</div><div class="stat-label">Avg Monthly</div></div>
                          <div class="income-stat-card"><div class="stat-icon">📋</div><div class="stat-value">0</div><div class="stat-label">Transactions</div></div>
                          <div class="income-stat-card"><div class="stat-icon">📂</div><div class="stat-value">0</div><div class="stat-label">Categories</div></div>
                          <div class="income-stat-card"><div class="stat-icon">🏦</div><div class="stat-value">$0.00</div><div class="stat-label">Current Balance</div></div>
                        </div>
                      </div>
                    
                      <!-- Recent Transactions -->
                      <div class="income-recent">
                        <div class="income-activity-header">
                          <h2 class="income-section-title">Recent Transactions</h2>
                          <button class="btn-secondary" id="view-all-transactions">View All</button>
                        </div>
                        <div class="income-activity-list">
                          <div id="transactions-content">
                            <div class="income-empty-state">
                              <div class="empty-icon">📋</div>
                              <div class="empty-title">No transactions yet</div>
                              <div class="empty-subtitle">Add your first income or expense record</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                      <!-- Expense Categories -->
                      <div class="income-categories">
                        <h2 class="income-section-title">Expense Categories</h2>
                        <div class="income-activity-list">
                          <div id="categories-content">
                            <div class="income-empty-state">
                              <div class="empty-icon">📊</div>
                              <div class="empty-title">No categories yet</div>
                              <div class="empty-subtitle">Add expenses to see categories</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                      <!-- Footer -->
                      <div class="income-footer">
                        <div class="income-refresh-container">
                          <button id="refresh-income-btn" class="income-refresh-btn">🔄 Refresh Data</button>
                        </div>
                        <div class="income-modal-triggers">
                          <button class="income-action-btn" onclick="openImportModal()">📥 Import Receipts</button>
                          <button class="income-action-btn" onclick="openExportModal()">📤 Export Data</button>
                        </div>
                      </div>
                    </div>
                    
                  <div class="income-footer">
                      <div class="income-refresh-container">
                        <button id="refresh-income-btn" class="income-refresh-btn">🔄 Refresh Data</button>
                      </div>
                      <div class="income-modal-triggers">
                        <button class="income-action-btn" onclick="openExportModal()">📤 Export Data</button>
                      </div>
                    </div>

        `;
    },
S
    setupEventListeners() {
        this.setupQuickActions();
        this.setupActionButtons();
    },

    setupQuickActions() {
        const quickActionButtons = document.querySelectorAll('.dashboard-quick-action-btn');
        
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    },

    setupActionButtons() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayData();
                this.showNotification('Data refreshed!', 'success');
            });
        }
        
        // Add transaction button
        const addBtn = document.getElementById('add-transaction-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showNotification('Add transaction clicked', 'info');
            });
        }
        
        // View all transactions button
        const viewAllBtn = document.getElementById('view-all-transactions');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showNotification('View all transactions clicked', 'info');
            });
        }
    },

    loadAndDisplayData() {
        const data = this.getModuleData();
        this.updateDashboardDisplay(data);
        this.updateTransactionsList(data);
        this.updateCategoriesList(data);
    },

    getModuleData() {
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
            monthlyIncome: 3200,
            avgMonthlyIncome: 2800,
            totalTransactions: 24,
            totalCategories: 8,
            currentBalance: 5200,
            recentTransactions: [
                {
                    id: 1,
                    date: '2024-01-15',
                    description: 'Chicken Sales - Batch #45',
                    category: 'Livestock Sales',
                    type: 'income',
                    amount: 2500,
                    status: 'completed',
                    icon: '💰'
                },
                {
                    id: 2,
                    date: '2024-01-14',
                    description: 'Feed Purchase - Premium',
                    category: 'Feed & Nutrition',
                    type: 'expense',
                    amount: 800,
                    status: 'completed',
                    icon: '🌾'
                },
                {
                    id: 3,
                    date: '2024-01-13',
                    description: 'Egg Sales - Wholesale',
                    category: 'Product Sales',
                    type: 'income',
                    amount: 1200,
                    status: 'completed',
                    icon: '🥚'
                },
                {
                    id: 4,
                    date: '2024-01-12',
                    description: 'Vaccination Supplies',
                    category: 'Healthcare',
                    type: 'expense',
                    amount: 350,
                    status: 'completed',
                    icon: '💊'
                },
                {
                    id: 5,
                    date: '2024-01-11',
                    description: 'Equipment Maintenance',
                    category: 'Equipment',
                    type: 'expense',
                    amount: 450,
                    status: 'pending',
                    icon: '🔧'
                }
            ],
            expenseCategories: [
                { name: 'Feed & Nutrition', amount: 1500, count: 8, icon: '🌾' },
                { name: 'Healthcare', amount: 450, count: 3, icon: '💊' },
                { name: 'Equipment', amount: 1200, count: 5, icon: '🔧' },
                { name: 'Labor', amount: 2800, count: 12, icon: '👷' },
                { name: 'Utilities', amount: 650, count: 4, icon: '⚡' }
            ]
        };
    },

    updateDashboardDisplay(data) {
        this.updateStatCard('total-income', this.formatCurrency(data.totalIncome));
        this.updateStatCard('total-expenses', this.formatCurrency(data.totalExpenses));
        this.updateStatCard('net-profit', this.formatCurrency(data.netProfit));
        this.updateStatCard('monthly-income', this.formatCurrency(data.monthlyIncome));
        this.updateStatCard('avg-monthly-income', this.formatCurrency(data.avgMonthlyIncome));
        this.updateStatCard('total-transactions', data.totalTransactions);
        this.updateStatCard('total-categories', data.totalCategories);
        this.updateStatCard('current-balance', this.formatCurrency(data.currentBalance));

        // Update profit card styling
        const profitCard = document.getElementById('net-profit-card');
        if (profitCard) {
            if (data.netProfit >= 0) {
                profitCard.classList.add('profit-positive');
                profitCard.classList.remove('profit-negative');
            } else {
                profitCard.classList.add('profit-negative');
                profitCard.classList.remove('profit-positive');
            }
        }

        // Update balance card styling
        const balanceCard = document.getElementById('balance-card');
        if (balanceCard) {
            if (data.currentBalance >= 0) {
                balanceCard.classList.add('profit-positive');
                balanceCard.classList.remove('profit-negative');
            } else {
                balanceCard.classList.add('profit-negative');
                balanceCard.classList.remove('profit-positive');
            }
        }

        // Add monthly income indicator
        const monthlyCard = document.getElementById('monthly-income-card');
        if (monthlyCard && data.monthlyIncome > 0) {
            // Remove existing indicator if present
            const existingIndicator = monthlyCard.querySelector('.monthly-indicator');
            if (existingIndicator) existingIndicator.remove();
            
            const monthlyIndicator = document.createElement('div');
            monthlyIndicator.className = 'monthly-indicator';
            monthlyIndicator.textContent = `Current month`;
            monthlyCard.appendChild(monthlyIndicator);
        }
    },

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation
            element.classList.add('stat-updating');
            
            // Update value after animation
            setTimeout(() => {
                element.classList.remove('stat-updating');
                element.textContent = value;
            }, 300);
        }
    },

    updateTransactionsList(data) {
        const transactionsContent = document.getElementById('transactions-content');
        if (!transactionsContent) return;

        const transactions = data.recentTransactions || [];

        if (transactions.length === 0) {
            transactionsContent.innerHTML = `
                <div class="dashboard-empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">No transactions yet</div>
                    <div class="empty-subtitle">Add your first income or expense record</div>
                </div>
            `;
            return;
        }

        transactionsContent.innerHTML = `
            <div class="activity-items-container">
                ${transactions.map(transaction => `
                    <div class="dashboard-activity-item transaction-${transaction.type}">
                        <div class="activity-icon">${transaction.icon || '💰'}</div>
                        <div class="activity-content">
                            <div class="activity-text">${transaction.description}</div>
                            <div class="activity-details">
                                <span class="activity-category">${transaction.category}</span>
                                <span class="activity-amount ${transaction.type}">
                                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                </span>
                            </div>
                            <div class="activity-time">${this.formatDate(transaction.date)}</div>
                        </div>
                        <div class="activity-status status-${transaction.status}">
                            ${transaction.status}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateCategoriesList(data) {
        const categoriesContent = document.getElementById('categories-content');
        if (!categoriesContent) return;

        const categories = data.expenseCategories || [];

        if (categories.length === 0) {
            categoriesContent.innerHTML = `
                <div class="dashboard-empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No categories yet</div>
                    <div class="empty-subtitle">Add expenses to see categories</div>
                </div>
            `;
            return;
        }

        categoriesContent.innerHTML = `
            <div class="activity-items-container">
                ${categories.map(category => `
                    <div class="dashboard-activity-item category-item">
                        <div class="activity-icon">${category.icon || '📂'}</div>
                        <div class="activity-content">
                            <div class="activity-text">${category.name}</div>
                            <div class="activity-details">
                                <span class="activity-count">${category.count || 0} transactions</span>
                                <span class="activity-amount expense">
                                    ${this.formatCurrency(category.amount)}
                                </span>
                            </div>
                            <div class="activity-progress">
                                <div class="progress-bar" style="width: ${Math.min((category.amount / 5000) * 100, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    handleQuickAction(action) {
        console.log(`Quick action: ${action}`);
        
        const actionMap = {
            'add-income': this.addIncome.bind(this),
            'add-expense': this.addExpense.bind(this),
            'view-reports': 'reports',
            'manage-categories': this.manageCategories.bind(this),
            'import-data': this.importData.bind(this),
            'export-data': this.exportData.bind(this)
        };

        if (action === 'view-reports' && window.app && window.app.showSection) {
            window.app.showSection('reports');
            this.showNotification('Opening Reports...', 'info');
        } else if (typeof actionMap[action] === 'function') {
            actionMap[action]();
        } else {
            this.showNotification(`Action "${action}" not implemented yet`, 'info');
        }
    },

    addIncome() {
        this.showNotification('Adding new income record...', 'success');
        // TODO: Open income modal
    },

    addExpense() {
        this.showNotification('Adding new expense record...', 'success');
        // TODO: Open expense modal
    },

    manageCategories() {
        this.showNotification('Managing categories...', 'info');
    },

    importData() {
        this.showNotification('Importing data...', 'info');
    },

    exportData() {
        this.showNotification('Exporting data...', 'info');
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
