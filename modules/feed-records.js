// modules/feed-record.js
FarmModules.registerModule('feed-record', {
    name: 'Feed Records',
    icon: '🌾',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Feed Management</h1>
                <p>Track feed purchases, usage, and inventory</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-feed-transaction">
                        ➕ Add Transaction
                    </button>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions card">
                <h3>Quick Actions</h3>
                <div class="form-row compact">
                    <div class="form-group">
                        <input type="number" id="quick-purchase-amount" placeholder="Amount bought" class="form-compact">
                    </div>
                    <div class="form-group">
                        <select id="quick-purchase-unit" class="form-compact">
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                            <option value="bags">bags</option>
                            <option value="tons">tons</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-primary btn-compact" id="quick-purchase">Record Purchase</button>
                    </div>
                </div>
                <div class="form-row compact">
                    <div class="form-group">
                        <input type="number" id="quick-usage-amount" placeholder="Amount used" class="form-compact">
                    </div>
                    <div class="form-group">
                        <select id="quick-usage-unit" class="form-compact">
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                            <option value="bags">bags</option>
                            <option value="tons">tons</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-secondary btn-compact" id="quick-usage">Record Usage</button>
                    </div>
                </div>
            </div>

            <!-- Feed Summary -->
            <div class="feed-summary">
                <div class="summary-card">
                    <div class="summary-icon">📦</div>
                    <div class="summary-content">
                        <h3>Current Stock</h3>
                        <div class="summary-value" id="current-stock">0 kg</div>
                        <div class="summary-trend" id="stock-trend">No change</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🛒</div>
                    <div class="summary-content">
                        <h3>Total Purchased</h3>
                        <div class="summary-value" id="total-purchased">0 kg</div>
                        <div class="summary-period">This month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🐄</div>
                    <div class="summary-content">
                        <h3>Total Used</h3>
                        <div class="summary-value" id="total-used">0 kg</div>
                        <div class="summary-period">This month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h3>Low Stock Alert</h3>
                        <div class="summary-value" id="low-stock-alert">OK</div>
                        <div class="summary-period" id="stock-status">Adequate stock</div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="recent-transactions card">
                <div class="card-header">
                    <h3>Recent Feed Transactions</h3>
                    <button class="btn btn-text" id="view-all-transactions">View All</button>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Feed Type</th>
                                <th>Amount</th>
                                <th>Remaining Stock</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="feed-transactions-body">
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">🌾</span>
                                        <h4>No feed transactions yet</h4>
                                        <p>Start recording your feed purchases and usage</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Feed Transaction Modal -->
            <div id="feed-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="feed-modal-title">Add Feed Transaction</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="feed-form">
                            <input type="hidden" id="feed-id">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="feed-type">Transaction Type:</label>
                                    <select id="feed-type" required>
                                        <option value="">Select Type</option>
                                        <option value="purchase">Purchase</option>
                                        <option value="usage">Usage</option>
                                        <option value="adjustment">Stock Adjustment</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="feed-date">Date:</label>
                                    <input type="date" id="feed-date" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="feed-category">Feed Category:</label>
                                    <select id="feed-category" required>
                                        <option value="">Select Category</option>
                                        <option value="poultry">Poultry Feed</option>
                                        <option value="cattle">Cattle Feed</option>
                                        <option value="swine">Swine Feed</option>
                                        <option value="sheep">Sheep Feed</option>
                                        <option value="horse">Horse Feed</option>
                                        <option value="fish">Fish Feed</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="feed-brand">Brand (Optional):</label>
                                    <input type="text" id="feed-brand" placeholder="Feed brand">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="feed-amount">Amount:</label>
                                    <input type="number" id="feed-amount" step="0.01" min="0" required placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="feed-unit">Unit:</label>
                                    <select id="feed-unit" required>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="bags">Bags</option>
                                        <option value="tons">Tons</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="feed-cost">Cost per Unit ($):</label>
                                    <input type="number" id="feed-cost" step="0.01" min="0" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="feed-supplier">Supplier (Optional):</label>
                                    <input type="text" id="feed-supplier" placeholder="Supplier name">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="feed-notes">Notes (Optional):</label>
                                <textarea id="feed-notes" placeholder="Add any additional notes..." rows="3"></textarea>
                            </div>
                            <div class="form-group" id="animal-group" style="display: none;">
                                <label for="feed-animals">Animals Fed (For Usage):</label>
                                <input type="text" id="feed-animals" placeholder="e.g., Chickens, Cows, etc.">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-feed">Save Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .feed-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
        }

        .summary-icon {
            font-size: 2rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }

        .summary-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .summary-trend, .summary-period {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .summary-trend.positive {
            color: var(--success-color);
        }

        .summary-trend.negative {
            color: var(--danger-color);
        }

        .quick-actions {
            margin: 1.5rem 0;
        }

        .quick-actions .form-row.compact {
            margin-bottom: 0.75rem;
        }

        .quick-actions .form-row.compact:last-child {
            margin-bottom: 0;
        }

        .recent-transactions .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .transaction-type.purchase {
            color: var(--success-color);
            font-weight: 600;
        }

        .transaction-type.usage {
            color: var(--danger-color);
            font-weight: 600;
        }

        .transaction-type.adjustment {
            color: var(--warning-color);
            font-weight: 600;
        }

        .stock-low {
            color: var(--danger-color);
            font-weight: 600;
        }

        .stock-adequate {
            color: var(--success-color);
        }

        .stock-warning {
            color: var(--warning-color);
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
        }
    `,

    initialize: function() {
        console.log('Feed Records module initializing...');
        this.loadFeedData();
        this.attachEventListeners();
        this.updateSummary();
    },

    loadFeedData: function() {
        // Initialize feed data if it doesn't exist
        if (!FarmModules.appData.feedTransactions) {
            FarmModules.appData.feedTransactions = [];
        }
        if (!FarmModules.appData.feedStock) {
            FarmModules.appData.feedStock = {
                current: 0,
                unit: 'kg',
                lowStockThreshold: 100
            };
        }
        this.renderTransactionsTable();
    },

    renderTransactionsTable: function() {
        const tbody = document.getElementById('feed-transactions-body');
        if (!tbody) return;

        const transactions = FarmModules.appData.feedTransactions || [];

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">🌾</span>
                            <h4>No feed transactions yet</h4>
                            <p>Start recording your feed purchases and usage</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show only last 10 transactions for recent view
        const recentTransactions = transactions.slice(-10).reverse();

        tbody.innerHTML = recentTransactions.map(transaction => {
            const typeClass = `transaction-type ${transaction.type}`;
            const typeLabel = transaction.type === 'purchase' ? 'Purchase' : 
                            transaction.type === 'usage' ? 'Usage' : 'Adjustment';
            
            return `
                <tr>
                    <td>${this.formatDate(transaction.date)}</td>
                    <td><span class="${typeClass}">${typeLabel}</span></td>
                    <td>${this.formatCategory(transaction.category)}</td>
                    <td>${transaction.amount} ${transaction.unit}</td>
                    <td>${transaction.remainingStock || FarmModules.appData.feedStock.current} ${FarmModules.appData.feedStock.unit}</td>
                    <td>${transaction.notes || '—'}</td>
                    <td class="transaction-actions">
                        <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateSummary: function() {
        const transactions = FarmModules.appData.feedTransactions || [];
        const stock = FarmModules.appData.feedStock || { current: 0, unit: 'kg' };

        // Calculate totals for current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const totalPurchased = monthlyTransactions
            .filter(t => t.type === 'purchase')
            .reduce((sum, t) => sum + this.convertToKg(t.amount, t.unit), 0);

        const totalUsed = monthlyTransactions
            .filter(t => t.type === 'usage')
            .reduce((sum, t) => sum + this.convertToKg(t.amount, t.unit), 0);

        const currentStockKg = this.convertToKg(stock.current, stock.unit);

        // Update summary cards
        this.updateElement('current-stock', `${stock.current.toFixed(1)} ${stock.unit}`);
        this.updateElement('total-purchased', `${totalPurchased.toFixed(1)} kg`);
        this.updateElement('total-used', `${totalUsed.toFixed(1)} kg`);

        // Stock trend
        const trendElement = document.getElementById('stock-trend');
        if (trendElement && transactions.length > 0) {
            const lastTransaction = transactions[transactions.length - 1];
            if (lastTransaction) {
                const change = lastTransaction.type === 'purchase' ? '↗ Increase' : 
                             lastTransaction.type === 'usage' ? '↘ Decrease' : '→ Adjustment';
                trendElement.textContent = change;
                trendElement.className = 'summary-trend ' + 
                    (lastTransaction.type === 'purchase' ? 'positive' : 
                     lastTransaction.type === 'usage' ? 'negative' : '');
            }
        }

        // Low stock alert
        const alertElement = document.getElementById('low-stock-alert');
        const statusElement = document.getElementById('stock-status');
        if (alertElement && statusElement) {
            if (currentStockKg <= stock.lowStockThreshold * 0.2) {
                alertElement.textContent = 'CRITICAL';
                alertElement.className = 'summary-value stock-low';
                statusElement.textContent = 'Very low stock!';
            } else if (currentStockKg <= stock.lowStockThreshold) {
                alertElement.textContent = 'LOW';
                alertElement.className = 'summary-value stock-warning';
                statusElement.textContent = 'Time to reorder';
            } else {
                alertElement.textContent = 'OK';
                alertElement.className = 'summary-value stock-adequate';
                statusElement.textContent = 'Adequate stock';
            }
        }
    },

    convertToKg: function(amount, unit) {
        const conversions = {
            'kg': 1,
            'lbs': 0.453592,
            'bags': 25, // assuming 25kg per bag
            'tons': 1000
        };
        return amount * (conversions[unit] || 1);
    },

    attachEventListeners: function() {
        // Quick actions
        const quickPurchaseBtn = document.getElementById('quick-purchase');
        const quickUsageBtn = document.getElementById('quick-usage');
        
        if (quickPurchaseBtn) {
            quickPurchaseBtn.addEventListener('click', () => this.handleQuickPurchase());
        }
        if (quickUsageBtn) {
            quickUsageBtn.addEventListener('click', () => this.handleQuickUsage());
        }

        // Modal open button
        const addTransactionBtn = document.getElementById('add-feed-transaction');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => this.showFeedModal());
        }

        // Modal events
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Save feed transaction
        const saveBtn = document.getElementById('save-feed');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveFeedTransaction());
        }

        // Transaction type change
        const feedTypeSelect = document.getElementById('feed-type');
        if (feedTypeSelect) {
            feedTypeSelect.addEventListener('change', (e) => this.handleTypeChange(e.target.value));
        }

        // Edit and delete transactions
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

        // View all transactions
        const viewAllBtn = document.getElementById('view-all-transactions');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllTransactions());
        }

        // Close modal on backdrop click
        const modal = document.getElementById('feed-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    },

    handleQuickPurchase: function() {
        const amount = parseFloat(document.getElementById('quick-purchase-amount').value);
        const unit = document.getElementById('quick-purchase-unit').value;

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        this.recordFeedTransaction('purchase', amount, unit, 'Quick purchase');
        document.getElementById('quick-purchase-amount').value = '';
        this.showNotification('Purchase recorded successfully!', 'success');
    },

    handleQuickUsage: function() {
        const amount = parseFloat(document.getElementById('quick-usage-amount').value);
        const unit = document.getElementById('quick-usage-unit').value;

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        // Check if enough stock
        const currentStock = FarmModules.appData.feedStock.current;
        const usageInStockUnit = this.convertUnits(amount, unit, FarmModules.appData.feedStock.unit);
        
        if (usageInStockUnit > currentStock) {
            this.showNotification(`Not enough stock. Only ${currentStock} ${FarmModules.appData.feedStock.unit} available.`, 'error');
            return;
        }

        this.recordFeedTransaction('usage', amount, unit, 'Quick usage');
        document.getElementById('quick-usage-amount').value = '';
        this.showNotification('Usage recorded successfully!', 'success');
    },

    recordFeedTransaction: function(type, amount, unit, notes = '') {
        const transaction = {
            id: 'feed-' + Date.now(),
            type: type,
            amount: amount,
            unit: unit,
            category: 'other',
            date: new Date().toISOString().split('T')[0],
            notes: notes,
            cost: 0,
            supplier: ''
        };

        // Update stock
        this.updateStock(transaction);
        transaction.remainingStock = FarmModules.appData.feedStock.current;

        // Add to transactions
        FarmModules.appData.feedTransactions.push(transaction);
        
        this.renderTransactionsTable();
        this.updateSummary();
    },

    updateStock: function(transaction) {
        const stock = FarmModules.appData.feedStock;
        const amountInStockUnit = this.convertUnits(transaction.amount, transaction.unit, stock.unit);

        if (transaction.type === 'purchase') {
            stock.current += amountInStockUnit;
        } else if (transaction.type === 'usage') {
            stock.current -= amountInStockUnit;
        }
        // For adjustment type, you would set stock.current to a specific value
    },

    convertUnits: function(amount, fromUnit, toUnit) {
        const conversions = {
            'kg': { 'kg': 1, 'lbs': 2.20462, 'bags': 0.04, 'tons': 0.001 },
            'lbs': { 'kg': 0.453592, 'lbs': 1, 'bags': 0.0181437, 'tons': 0.000453592 },
            'bags': { 'kg': 25, 'lbs': 55.1156, 'bags': 1, 'tons': 0.025 },
            'tons': { 'kg': 1000, 'lbs': 2204.62, 'bags': 40, 'tons': 1 }
        };

        return amount * (conversions[fromUnit][toUnit] || 1);
    },

    showFeedModal: function() {
        const modal = document.getElementById('feed-modal');
        const title = document.getElementById('feed-modal-title');
        const form = document.getElementById('feed-form');

        if (modal && title && form) {
            form.reset();
            document.getElementById('feed-id').value = '';
            document.getElementById('feed-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('animal-group').style.display = 'none';
            
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('feed-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    handleTypeChange: function(type) {
        const animalGroup = document.getElementById('animal-group');
        if (animalGroup) {
            animalGroup.style.display = type === 'usage' ? 'block' : 'none';
        }
    },

    saveFeedTransaction: function() {
        const form = document.getElementById('feed-form');
        if (!form) return;

        const transactionId = document.getElementById('feed-id').value;
        const type = document.getElementById('feed-type').value;
        const category = document.getElementById('feed-category').value;
        const amount = parseFloat(document.getElementById('feed-amount').value);
        const unit = document.getElementById('feed-unit').value;
        const date = document.getElementById('feed-date').value;
        const cost = parseFloat(document.getElementById('feed-cost').value) || 0;
        const supplier = document.getElementById('feed-supplier').value;
        const notes = document.getElementById('feed-notes').value;
        const brand = document.getElementById('feed-brand').value;
        const animals = document.getElementById('feed-animals').value;

        // Validation
        if (!type || !category || !amount || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        // Check stock for usage
        if (type === 'usage') {
            const currentStock = FarmModules.appData.feedStock.current;
            const usageInStockUnit = this.convertUnits(amount, unit, FarmModules.appData.feedStock.unit);
            
            if (usageInStockUnit > currentStock) {
                this.showNotification(`Not enough stock. Only ${currentStock} ${FarmModules.appData.feedStock.unit} available.`, 'error');
                return;
            }
        }

        const transactionData = {
            type: type,
            category: category,
            amount: amount,
            unit: unit,
            date: date,
            cost: cost,
            supplier: supplier,
            notes: notes,
            brand: brand,
            animals: type === 'usage' ? animals : ''
        };

        if (transactionId) {
            this.updateTransaction(transactionId, transactionData);
        } else {
            this.addTransaction(transactionData);
        }

        this.hideModal();
    },

    addTransaction: function(transactionData) {
        if (!FarmModules.appData.feedTransactions) {
            FarmModules.appData.feedTransactions = [];
        }

        const newTransaction = {
            id: 'feed-' + Date.now(),
            ...transactionData
        };

        // Update stock
        this.updateStock(newTransaction);
        newTransaction.remainingStock = FarmModules.appData.feedStock.current;

        FarmModules.appData.feedTransactions.push(newTransaction);
        
        this.renderTransactionsTable();
        this.updateSummary();
        
        this.showNotification('Transaction recorded successfully!', 'success');
    },

    editTransaction: function(transactionId) {
        const transactions = FarmModules.appData.feedTransactions || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const modal = document.getElementById('feed-modal');
        const title = document.getElementById('feed-modal-title');

        if (modal && title) {
            document.getElementById('feed-id').value = transaction.id;
            document.getElementById('feed-type').value = transaction.type;
            document.getElementById('feed-category').value = transaction.category;
            document.getElementById('feed-amount').value = transaction.amount;
            document.getElementById('feed-unit').value = transaction.unit;
            document.getElementById('feed-date').value = transaction.date;
            document.getElementById('feed-cost').value = transaction.cost || '';
            document.getElementById('feed-supplier').value = transaction.supplier || '';
            document.getElementById('feed-notes').value = transaction.notes || '';
            document.getElementById('feed-brand').value = transaction.brand || '';
            document.getElementById('feed-animals').value = transaction.animals || '';
            
            this.handleTypeChange(transaction.type);
            
            title.textContent = 'Edit Feed Transaction';
            modal.classList.remove('hidden');
        }
    },

    updateTransaction: function(transactionId, transactionData) {
        const transactions = FarmModules.appData.feedTransactions || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            // For simplicity, we'll remove and re-add to recalculate stock
            const oldTransaction = transactions[index];
            
            // Reverse the old transaction's effect on stock
            const reverseTransaction = { ...oldTransaction };
            reverseTransaction.type = reverseTransaction.type === 'purchase' ? 'usage' : 'purchase';
            this.updateStock(reverseTransaction);
            
            // Remove old transaction
            transactions.splice(index, 1);
            
            // Add new transaction
            this.addTransaction(transactionData);
        }
    },

    deleteTransaction: function(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            const transactions = FarmModules.appData.feedTransactions || [];
            const transaction = transactions.find(t => t.id === transactionId);
            
            if (transaction) {
                // Reverse the transaction's effect on stock
                const reverseTransaction = { ...transaction };
                reverseTransaction.type = reverseTransaction.type === 'purchase' ? 'usage' : 'purchase';
                this.updateStock(reverseTransaction);
                
                // Remove from transactions
                FarmModules.appData.feedTransactions = transactions.filter(t => t.id !== transactionId);
                
                this.renderTransactionsTable();
                this.updateSummary();
                this.showNotification('Transaction deleted successfully', 'success');
            }
        }
    },

    showAllTransactions: function() {
        // For now, just show a notification. In a full implementation, this would show all transactions
        this.showNotification('Showing all transactions', 'info');
        // You could implement a full table view here
    },

    formatCategory: function(category) {
        if (!category) return 'Uncategorized';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
                color: white;
                border-radius: 4px;
                z-index: 1000;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }
});
