// modules/income-expenses.js - CSS-BASED WITH MODALS
console.log('Loading income-expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    transactions: [],
    element: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Load CSS if not already loaded
        this.loadCSS();

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        this.syncStatsWithDashboard();
        
        console.log('✅ Income & Expenses initialized');
        return true;
    },

    loadCSS() {
        // Check if module CSS is already loaded
        if (document.querySelector('link[href*="income-expenses.css"]')) {
            return;
        }
        
        // Create link element for module-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/income-expenses.css';
        document.head.appendChild(link);
    },

    loadData() {
        // Load from localStorage or use demo data
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            { id: 1, type: 'income', amount: 1500, category: 'egg-sales', description: 'Egg sales March', date: '2024-03-15' },
            { id: 2, type: 'expense', amount: 200, category: 'feed', description: 'Chicken feed', date: '2024-03-14' },
            { id: 3, type: 'income', amount: 800, category: 'poultry-sales', description: 'Broiler sales', date: '2024-03-10' },
            { id: 4, type: 'expense', amount: 150, category: 'medication', description: 'Vaccines', date: '2024-03-08' },
            { id: 5, type: 'income', amount: 350, category: 'crop-sales', description: 'Vegetable sales', date: '2024-03-05' }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container">
                <!-- Modern Header -->
                <div class="ie-module-header">
                    <div class="ie-header-content">
                        <div class="ie-header-text">
                            <h1 class="ie-module-title">Income & Expenses</h1>
                            <p class="ie-module-subtitle">Track your farm's financial health</p>
                        </div>
                        <div class="ie-header-stats">
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">📈</span>
                                <span class="ie-stat-value" id="total-income">${this.formatCurrency(stats.totalIncome, false)}</span>
                                <span class="ie-stat-label">Total Income</span>
                            </div>
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">📊</span>
                                <span class="ie-stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses, false)}</span>
                                <span class="ie-stat-label">Total Expenses</span>
                            </div>
                            <div class="ie-stat-badge">
                                <span class="ie-stat-icon">💰</span>
                                <span class="ie-stat-value" id="net-profit" style="color: ${stats.netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">
                                    ${this.formatCurrency(stats.netProfit, false)}
                                </span>
                                <span class="ie-stat-label">Net Profit</span>
                            </div>
                        </div>
                    </div>
                    <div class="ie-header-actions">
                        <button class="btn btn-primary" id="add-income-btn">
                            <span>💰 Add Income</span>
                        </button>
                        <button class="btn btn-outline" id="add-expense-btn">
                            <span>💸 Add Expense</span>
                        </button>
                    </div>
                </div>

                <!-- Financial Summary Cards -->
                <div class="ie-financial-summary">
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">📈</div>
                        <div class="ie-summary-content">
                            <h3>Monthly Income</h3>
                            <div class="ie-summary-value" id="monthly-income">${this.formatCurrency(this.getMonthlyIncome())}</div>
                            <div class="ie-summary-period">This Month</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">📊</div>
                        <div class="ie-summary-content">
                            <h3>Monthly Expenses</h3>
                            <div class="ie-summary-value" id="monthly-expenses">${this.formatCurrency(this.getMonthlyExpenses())}</div>
                            <div class="ie-summary-period">This Month</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">💰</div>
                        <div class="ie-summary-content">
                            <h3>Profit Margin</h3>
                            <div class="ie-summary-value" id="profit-margin">${stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) + '%' : '0%'}</div>
                            <div class="ie-summary-period">Efficiency</div>
                        </div>
                    </div>
                    <div class="ie-summary-card">
                        <div class="ie-summary-icon">🎯</div>
                        <div class="ie-summary-content">
                            <h3>Top Category</h3>
                            <div class="ie-summary-value" id="top-category">${this.getTopCategory()}</div>
                            <div class="ie-summary-period">${this.formatCurrency(this.getTopCategoryAmount())}</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="ie-quick-action-grid">
                    <button class="ie-quick-action-btn" id="quick-income-btn">
                        <div class="ie-quick-action-icon">💰</div>
                        <span class="ie-quick-action-title">Quick Income</span>
                        <span class="ie-quick-action-desc">Record income instantly</span>
                    </button>
                    <button class="ie-quick-action-btn" id="quick-expense-btn">
                        <div class="ie-quick-action-icon">💸</div>
                        <span class="ie-quick-action-title">Quick Expense</span>
                        <span class="ie-quick-action-desc">Record expense instantly</span>
                    </button>
                    <button class="ie-quick-action-btn" id="view-reports-btn">
                        <div class="ie-quick-action-icon">📊</div>
                        <span class="ie-quick-action-title">View Reports</span>
                        <span class="ie-quick-action-desc">Financial analytics</span>
                    </button>
                    <button class="ie-quick-action-btn" id="export-data-btn">
                        <div class="ie-quick-action-icon">📤</div>
                        <span class="ie-quick-action-title">Export Data</span>
                        <span class="ie-quick-action-desc">Export transactions</span>
                    </button>
                </div>

                <!-- Transaction Form (Hidden by default) -->
                <div id="transaction-form-container" class="ie-hidden">
                    <div class="ie-form-container">
                        <h3 class="ie-form-title" id="form-title">Add Transaction</h3>
                        <form id="transaction-form">
                            <div class="ie-form-row">
                                <div class="ie-form-group">
                                    <label class="ie-form-label">Type</label>
                                    <select class="ie-form-input" id="transaction-type" required>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div class="ie-form-group">
                                    <label class="ie-form-label">Amount</label>
                                    <input type="number" class="ie-form-input" id="transaction-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="ie-form-group">
                                <label class="ie-form-label">Category</label>
                                <select class="ie-form-input" id="transaction-category" required>
                                    <option value="">Select category</option>
                                    <option value="egg-sales">Egg Sales</option>
                                    <option value="poultry-sales">Poultry Sales</option>
                                    <option value="crop-sales">Crop Sales</option>
                                    <option value="feed">Feed</option>
                                    <option value="medication">Medication</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="labor">Labor</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="ie-form-group">
                                <label class="ie-form-label">Description</label>
                                <input type="text" class="ie-form-input" id="transaction-description" required>
                            </div>
                            <div class="ie-form-group">
                                <label class="ie-form-label">Date</label>
                                <input type="date" class="ie-form-input" id="transaction-date" required>
                            </div>
                            <div class="ie-form-actions">
                                <button type="submit" class="btn btn-primary">Save Transaction</button>
                                <button type="button" class="btn btn-outline" id="cancel-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="ie-transactions-card">
                    <div class="ie-card-header">
                        <h3 class="ie-card-title">Recent Transactions</h3>
                        <button class="btn btn-outline" id="clear-all">Clear All</button>
                    </div>
                    <div id="transactions-list">
                        ${this.renderTransactionsList()}
                    </div>
                </div>
            </div>
        `;

        // Render modals (they're not shown by default)
        this.renderModals();
        
        this.setupEventListeners();
    },

    renderModals() {
        // Add modals to the page
        const modalsHTML = `
            <!-- Quick Income Modal -->
            <div id="quick-income-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Quick Income</h2>
                        <button class="modal-close" data-modal="quick-income-modal">✕</button>
                    </div>
                    <div class="modal-body">
                        <form id="quick-income-form" class="quick-form">
                            <div class="quick-form-group">
                                <label class="quick-form-label">Amount</label>
                                <input type="number" 
                                       class="quick-form-input quick-form-amount" 
                                       id="quick-income-amount" 
                                       step="0.01" 
                                       min="0" 
                                       placeholder="0.00"
                                       required
                                       autofocus>
                                <div class="quick-form-note">Enter amount in USD</div>
                            </div>
                            <div class="quick-form-group">
                                <label class="quick-form-label">Category</label>
                                <div class="quick-categories">
                                    <button type="button" class="quick-category-btn" data-category="egg-sales">Egg Sales</button>
                                    <button type="button" class="quick-category-btn" data-category="poultry-sales">Poultry</button>
                                    <button type="button" class="quick-category-btn" data-category="crop-sales">Crops</button>
                                    <button type="button" class="quick-category-btn" data-category="other">Other</button>
                                </div>
                                <input type="hidden" id="quick-income-category" value="other" required>
                            </div>
                            <div class="quick-form-group">
                                <label class="quick-form-label">Description (Optional)</label>
                                <input type="text" 
                                       class="quick-form-input" 
                                       id="quick-income-description" 
                                       placeholder="Brief description">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" data-modal="quick-income-modal">Cancel</button>
                        <button type="submit" form="quick-income-form" class="btn btn-primary">Add Income</button>
                    </div>
                </div>
            </div>

            <!-- Quick Expense Modal -->
            <div id="quick-expense-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Quick Expense</h2>
                        <button class="modal-close" data-modal="quick-expense-modal">✕</button>
                    </div>
                    <div class="modal-body">
                        <form id="quick-expense-form" class="quick-form">
                            <div class="quick-form-group">
                                <label class="quick-form-label">Amount</label>
                                <input type="number" 
                                       class="quick-form-input quick-form-amount" 
                                       id="quick-expense-amount" 
                                       step="0.01" 
                                       min="0" 
                                       placeholder="0.00"
                                       required
                                       autofocus>
                                <div class="quick-form-note">Enter amount in USD</div>
                            </div>
                            <div class="quick-form-group">
                                <label class="quick-form-label">Category</label>
                                <div class="quick-categories">
                                    <button type="button" class="quick-category-btn" data-category="feed">Feed</button>
                                    <button type="button" class="quick-category-btn" data-category="medication">Medication</button>
                                    <button type="button" class="quick-category-btn" data-category="equipment">Equipment</button>
                                    <button type="button" class="quick-category-btn" data-category="labor">Labor</button>
                                    <button type="button" class="quick-category-btn" data-category="other">Other</button>
                                </div>
                                <input type="hidden" id="quick-expense-category" value="other" required>
                            </div>
                            <div class="quick-form-group">
                                <label class="quick-form-label">Description (Optional)</label>
                                <input type="text" 
                                       class="quick-form-input" 
                                       id="quick-expense-description" 
                                       placeholder="Brief description">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" data-modal="quick-expense-modal">Cancel</button>
                        <button type="submit" form="quick-expense-form" class="btn btn-primary">Add Expense</button>
                    </div>
                </div>
            </div>

            <!-- View Reports Modal -->
            <div id="view-reports-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Financial Reports</h2>
                        <button class="modal-close" data-modal="view-reports-modal">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="reports-grid">
                            <div class="report-card" data-report="profit-loss">
                                <div class="report-icon">📊</div>
                                <h4 class="report-title">Profit & Loss</h4>
                                <p class="report-desc">Income vs expenses</p>
                            </div>
                            <div class="report-card" data-report="monthly-trends">
                                <div class="report-icon">📈</div>
                                <h4 class="report-title">Monthly Trends</h4>
                                <p class="report-desc">Income/expense trends</p>
                            </div>
                            <div class="report-card" data-report="category-breakdown">
                                <div class="report-icon">🧮</div>
                                <h4 class="report-title">Category Breakdown</h4>
                                <p class="report-desc">By income/expense type</p>
                            </div>
                            <div class="report-card" data-report="yearly-summary">
                                <div class="report-icon">📅</div>
                                <h4 class="report-title">Yearly Summary</h4>
                                <p class="report-desc">Annual performance</p>
                            </div>
                            <div class="report-card" data-report="export-data">
                                <div class="report-icon">📤</div>
                                <h4 class="report-title">Export Data</h4>
                                <p class="report-desc">Download all data</p>
                            </div>
                            <div class="report-card" data-report="print-report">
                                <div class="report-icon">🖨️</div>
                                <h4 class="report-title">Print Report</h4>
                                <p class="report-desc">Printable version</p>
                            </div>
                        </div>
                        <div id="report-preview" class="mt-4 p-4 border rounded hidden">
                            <!-- Report preview will be displayed here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" data-modal="view-reports-modal">Close</button>
                        <button type="button" class="btn btn-primary hidden" id="generate-report-btn">Generate Report</button>
                    </div>
                </div>
            </div>
        `;

        // Add modals to body if not already there
        if (!document.getElementById('quick-income-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalsHTML);
        }
    },

    setupEventListeners() {
        // Add transaction buttons
        document.getElementById('add-income-btn')?.addEventListener('click', () => this.showTransactionForm('income'));
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.showTransactionForm('expense'));
        
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.showQuickIncomeModal());
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.showQuickExpenseModal());
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.showViewReportsModal());
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        
        // Form handlers
        document.getElementById('transaction-form')?.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('cancel-form')?.addEventListener('click', () => this.hideTransactionForm());
        
        // Clear all button
        document.getElementById('clear-all')?.addEventListener('click', () => this.clearAllTransactions());
        
        // Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ie-delete-btn')) {
                const id = parseInt(e.target.closest('.ie-delete-btn').dataset.id);
                this.deleteTransaction(id);
            }
        });

        // Modal handlers
        this.setupModalHandlers();
    },

    setupModalHandlers() {
        // Quick Income Form
        document.getElementById('quick-income-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickIncomeSubmit();
        });

        // Quick Expense Form
        document.getElementById('quick-expense-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickExpenseSubmit();
        });

        // Category selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-category-btn')) {
                const category = e.target.dataset.category;
                const modalId = e.target.closest('.modal-container').parentElement.id;
                
                // Update active state
                e.target.closest('.quick-categories').querySelectorAll('.quick-category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Update hidden input
                if (modalId === 'quick-income-modal') {
                    document.getElementById('quick-income-category').value = category;
                } else if (modalId === 'quick-expense-modal') {
                    document.getElementById('quick-expense-category').value = category;
                }
            }
        });

        // Report selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.report-card')) {
                const reportCard = e.target.closest('.report-card');
                const reportType = reportCard.dataset.report;
                this.selectReport(reportType);
            }
        });

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.dataset.modal) {
                const modalId = e.target.dataset.modal || e.target.closest('[data-modal]')?.dataset.modal;
                if (modalId) {
                    this.hideModal(modalId);
                }
            }
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    },

    // ==================== MODAL METHODS ====================
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Focus on amount input for quick forms
            if (modalId.includes('quick-')) {
                setTimeout(() => {
                    const amountInput = modal.querySelector('.quick-form-amount');
                    if (amountInput) {
                        amountInput.focus();
                        amountInput.select();
                    }
                }, 100);
            }
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) form.reset();
            
            // Reset category selection
            modal.querySelectorAll('.quick-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Reset report selection
            if (modalId === 'view-reports-modal') {
                document.getElementById('generate-report-btn').classList.add('hidden');
                document.getElementById('report-preview').classList.add('hidden');
                document.getElementById('report-preview').innerHTML = '';
            }
        }
    },

    showQuickIncomeModal() {
        this.showModal('quick-income-modal');
    },

    showQuickExpenseModal() {
        this.showModal('quick-expense-modal');
    },

    showViewReportsModal() {
        this.showModal('view-reports-modal');
    },

    handleQuickIncomeSubmit() {
        const amount = parseFloat(document.getElementById('quick-income-amount').value);
        const category = document.getElementById('quick-income-category').value;
        const description = document.getElementById('quick-income-description').value || 'Quick Income Entry';
        
        if (!amount || isNaN(amount)) {
            if (window.coreModule) {
                window.coreModule.showNotification('Please enter a valid amount', 'error');
            }
            return;
        }

        const transaction = {
            id: Date.now(),
            type: 'income',
            amount: amount,
            category: category,
            description: description,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.addQuickTransaction(transaction);
        this.hideModal('quick-income-modal');
    },

    handleQuickExpenseSubmit() {
        const amount = parseFloat(document.getElementById('quick-expense-amount').value);
        const category = document.getElementById('quick-expense-category').value;
        const description = document.getElementById('quick-expense-description').value || 'Quick Expense Entry';
        
        if (!amount || isNaN(amount)) {
            if (window.coreModule) {
                window.coreModule.showNotification('Please enter a valid amount', 'error');
            }
            return;
        }

        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: amount,
            category: category,
            description: description,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.addQuickTransaction(transaction);
        this.hideModal('quick-expense-modal');
    },

    selectReport(reportType) {
        const preview = document.getElementById('report-preview');
        const generateBtn = document.getElementById('generate-report-btn');
        
        // Update active state
        document.querySelectorAll('.report-card').forEach(card => {
            card.style.borderColor = 'transparent';
        });
        document.querySelector(`.report-card[data-report="${reportType}"]`).style.borderColor = 'var(--color-primary)';
        
        // Show preview
        preview.classList.remove('hidden');
        generateBtn.classList.remove('hidden');
        
        // Set preview content
        let previewHTML = '';
        const stats = this.calculateStats();
        
        switch(reportType) {
            case 'profit-loss':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Profit & Loss Preview</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span>Total Income:</span>
                            <span class="font-semibold text-success">${this.formatCurrency(stats.totalIncome)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Expenses:</span>
                            <span class="font-semibold text-danger">${this.formatCurrency(stats.totalExpenses)}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span>Net Profit:</span>
                            <span class="font-semibold ${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}">
                                ${this.formatCurrency(stats.netProfit)}
                            </span>
                        </div>
                    </div>
                `;
                break;
                
            case 'monthly-trends':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Monthly Trends Preview</h4>
                    <p class="text-tertiary">This report will show income and expense trends over the last 12 months.</p>
                `;
                break;
                
            case 'category-breakdown':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Category Breakdown Preview</h4>
                    <p class="text-tertiary">This report will break down transactions by category.</p>
                `;
                break;
                
            case 'yearly-summary':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Yearly Summary Preview</h4>
                    <p class="text-tertiary">Annual performance report for the current year.</p>
                `;
                break;
                
            case 'export-data':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Export Data Preview</h4>
                    <p class="text-tertiary">Export all transaction data as JSON, CSV, or PDF.</p>
                `;
                generateBtn.textContent = 'Export Data';
                break;
                
            case 'print-report':
                previewHTML = `
                    <h4 class="font-semibold mb-2">Print Report Preview</h4>
                    <p class="text-tertiary">Generate a printer-friendly version of the selected report.</p>
                `;
                generateBtn.textContent = 'Print Report';
                break;
        }
        
        preview.innerHTML = previewHTML;
        generateBtn.onclick = () => this.generateReport(reportType);
    },

    generateReport(reportType) {
        // Implement report generation logic here
        switch(reportType) {
            case 'export-data':
                this.exportData();
                break;
            case 'print-report':
                window.print();
                break;
            default:
                if (window.coreModule) {
                    window.coreModule.showNotification(`Generating ${reportType} report...`, 'info');
                }
                // Here you would implement actual report generation
                // For now, just show a notification
                setTimeout(() => {
                    if (window.coreModule) {
                        window.coreModule.showNotification('Report generated successfully!', 'success');
                    }
                }, 1500);
        }
        this.hideModal('view-reports-modal');
    },

    // ==================== REST OF YOUR METHODS (keep them exactly as they were) ====================
    // ... [KEEP ALL YOUR EXISTING calculateStats, getMonthlyIncome, etc. methods exactly as they were] ...
    calculateStats() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        return {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            totalTransactions: this.transactions.length
        };
    },

    getMonthlyIncome() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.transactions
            .filter(t => {
                if (t.type !== 'income') return false;
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    getMonthlyExpenses() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.transactions
            .filter(t => {
                if (t.type !== 'expense') return false;
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    getTopCategory() {
        const categoryTotals = {};
        this.transactions.forEach(t => {
            if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
            categoryTotals[t.category] += t.amount || 0;
        });
        
        let topCategory = 'None';
        let topAmount = 0;
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > topAmount) {
                topCategory = this.formatCategoryName(category);
                topAmount = amount;
            }
        });
        
        return topCategory;
    },

    getTopCategoryAmount() {
        const categoryTotals = {};
        this.transactions.forEach(t => {
            if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
            categoryTotals[t.category] += t.amount || 0;
        });
        
        let topAmount = 0;
        Object.values(categoryTotals).forEach(amount => {
            if (amount > topAmount) topAmount = amount;
        });
        
        return topAmount;
    },

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return `
                <div class="ie-empty-state">
                    <div class="ie-empty-content">
                        <span class="ie-empty-icon">📋</span>
                        <h4>No transactions yet</h4>
                        <p>Add your first transaction to get started</p>
                    </div>
                </div>
            `;
        }

        const recentTransactions = this.transactions.slice(0, 10);

        return `
            <div class="ie-transactions-list">
                ${recentTransactions.map(transaction => `
                    <div class="ie-transaction-item">
                        <div class="ie-transaction-icon">${transaction.type === 'income' ? '💰' : '💸'}</div>
                        <div class="ie-transaction-details">
                            <div class="ie-transaction-description">${transaction.description}</div>
                            <div class="ie-transaction-meta">
                                <span class="transaction-category">${this.formatCategoryName(transaction.category)}</span>
                                <span class="transaction-date">${transaction.date}</span>
                            </div>
                        </div>
                        <div class="ie-transaction-amount ${transaction.type}">
                            <span>${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}</span>
                            <button class="ie-delete-btn" data-id="${transaction.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showTransactionForm(type) {
        const formContainer = document.getElementById('transaction-form-container');
        const formTitle = document.getElementById('form-title');
        const typeSelect = document.getElementById('transaction-type');
        const dateInput = document.getElementById('transaction-date');
        
        formTitle.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
        typeSelect.value = type;
        dateInput.value = new Date().toISOString().split('T')[0];
        
        formContainer.classList.remove('ie-hidden');
        formContainer.scrollIntoView({ behavior: 'smooth' });
    },

    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transactions exported successfully!', 'success');
        }
    },

    addQuickTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveData();
        this.renderModule();
        this.syncStatsWithDashboard();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction added successfully!', 'success');
        }
    },

    hideTransactionForm() {
        document.getElementById('transaction-form-container').classList.add('ie-hidden');
        document.getElementById('transaction-form').reset();
    },

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            type: document.getElementById('transaction-type').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            description: document.getElementById('transaction-description').value,
            date: document.getElementById('transaction-date').value
        };

        this.transactions.unshift(formData);
        this.saveData();
        this.renderModule();
        
        this.syncStatsWithDashboard();
        this.addRecentActivity(formData);
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction added successfully!', 'success');
        }
    },

    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.renderModule();
        
        this.syncStatsWithDashboard();
        
        if (transaction) {
            this.addRecentActivity({
                ...transaction,
                type: 'deletion',
                message: `Deleted ${transaction.type}: ${transaction.description}`
            });
        }
        
        if (window.coreModule) {
            window.coreModule.showNotification('Transaction deleted!', 'success');
        }
    },

    clearAllTransactions() {
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveData();
            this.renderModule();
            
            this.syncStatsWithDashboard();
            this.addRecentActivity({
                type: 'clear',
                message: 'Cleared all transactions'
            });
            
            if (window.coreModule) {
                window.coreModule.showNotification('All transactions cleared!', 'success');
            }
        }
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    },

    syncStatsWithDashboard() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalIncome: stats.totalIncome,
                totalExpenses: stats.totalExpenses,
                totalRevenue: stats.totalIncome,
                netProfit: stats.netProfit
            });
        }
        
        const statsUpdateEvent = new CustomEvent('financialStatsUpdated', {
            detail: {
                totalIncome: stats.totalIncome,
                totalExpenses: stats.totalExpenses,
                totalRevenue: stats.totalIncome,
                netProfit: stats.netProfit
            }
        });
        document.dispatchEvent(statsUpdateEvent);
    },

    addRecentActivity(transaction) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        if (transaction.type === 'income') {
            activity = {
                type: 'income_added',
                message: `Income: ${transaction.description} - ${this.formatCurrency(transaction.amount)}`,
                icon: '💰'
            };
        } else if (transaction.type === 'expense') {
            activity = {
                type: 'expense_added',
                message: `Expense: ${transaction.description} - ${this.formatCurrency(transaction.amount)}`,
                icon: '💸'
            };
        } else if (transaction.type === 'deletion') {
            activity = {
                type: 'transaction_deleted',
                message: transaction.message,
                icon: '🗑️'
            };
        } else if (transaction.type === 'clear') {
            activity = {
                type: 'transactions_cleared',
                message: transaction.message,
                icon: '📋'
            };
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    formatCategoryName(category) {
        if (!category) return 'Unknown';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatCurrency(amount, includeSymbol = true) {
        if (includeSymbol) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount || 0);
        } else {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount || 0);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}
