// modules/broiler-mortality.js
FarmModules.registerModule('broiler-mortality', {
    name: 'Broiler Mortality',
    icon: '🐔',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Broiler Mortality Tracking</h1>
                <p>Track broiler purchases, mortality, and available stock</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-broiler-transaction">
                        ➕ Add Record
                    </button>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions card">
                <h3>Quick Actions</h3>
                <div class="form-row compact">
                    <div class="form-group">
                        <input type="number" id="quick-purchase-chicks" placeholder="Chicks bought" class="form-compact" min="0">
                    </div>
                    <div class="form-group">
                        <input type="number" id="quick-purchase-cost" placeholder="Total cost" class="form-compact" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-primary btn-compact" id="quick-purchase">Record Purchase</button>
                    </div>
                </div>
                <div class="form-row compact">
                    <div class="form-group">
                        <input type="number" id="quick-mortality-count" placeholder="Deaths recorded" class="form-compact" min="0">
                    </div>
                    <div class="form-group">
                        <input type="text" id="quick-mortality-cause" placeholder="Cause of death" class="form-compact">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-secondary btn-compact" id="quick-mortality">Record Mortality</button>
                    </div>
                </div>
            </div>

            <!-- Broiler Summary -->
            <div class="broiler-summary">
                <div class="summary-card">
                    <div class="summary-icon">🐣</div>
                    <div class="summary-content">
                        <h3>Total Purchased</h3>
                        <div class="summary-value" id="total-purchased">0</div>
                        <div class="summary-period">Chicks</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚰️</div>
                    <div class="summary-content">
                        <h3>Total Mortality</h3>
                        <div class="summary-value" id="total-mortality">0</div>
                        <div class="summary-period">Deaths</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🐔</div>
                    <div class="summary-content">
                        <h3>Available for Slaughter</h3>
                        <div class="summary-value" id="available-broilers">0</div>
                        <div class="summary-period">Live broilers</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📊</div>
                    <div class="summary-content">
                        <h3>Mortality Rate</h3>
                        <div class="summary-value" id="mortality-rate">0%</div>
                        <div class="summary-period">Loss percentage</div>
                    </div>
                </div>
            </div>

            <!-- Batch Overview -->
            <div class="batch-overview card">
                <div class="card-header">
                    <h3>Current Batches</h3>
                    <button class="btn btn-text" id="view-batch-history">View History</button>
                </div>
                <div id="batch-container">
                    <div class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">🐔</span>
                            <h4>No broiler batches yet</h4>
                            <p>Start by recording your first broiler purchase</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity card">
                <div class="card-header">
                    <h3>Recent Activity</h3>
                    <button class="btn btn-text" id="view-all-activity">View All</button>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Batch ID</th>
                                <th>Count</th>
                                <th>Details</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="broiler-activity-body">
                            <tr>
                                <td colspan="6" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">📝</span>
                                        <h4>No activity yet</h4>
                                        <p>Broiler transactions will appear here</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Broiler Transaction Modal -->
            <div id="broiler-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="broiler-modal-title">Add Broiler Record</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="broiler-form">
                            <input type="hidden" id="broiler-id">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="broiler-type">Record Type:</label>
                                    <select id="broiler-type" required>
                                        <option value="">Select Type</option>
                                        <option value="purchase">Chick Purchase</option>
                                        <option value="mortality">Mortality</option>
                                        <option value="slaughter">Slaughter</option>
                                        <option value="adjustment">Stock Adjustment</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="broiler-date">Date:</label>
                                    <input type="date" id="broiler-date" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="broiler-batch">Batch ID:</label>
                                    <input type="text" id="broiler-batch" placeholder="e.g., BATCH-001" required>
                                </div>
                                <div class="form-group">
                                    <label for="broiler-count">Count:</label>
                                    <input type="number" id="broiler-count" min="0" required placeholder="0">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="broiler-cost">Total Cost ($):</label>
                                    <input type="number" id="broiler-cost" step="0.01" min="0" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="broiler-supplier">Supplier (Optional):</label>
                                    <input type="text" id="broiler-supplier" placeholder="Supplier name">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="broiler-notes">Notes (Optional):</label>
                                <textarea id="broiler-notes" placeholder="Add any additional notes..." rows="3"></textarea>
                            </div>
                            <div class="form-group" id="mortality-details" style="display: none;">
                                <label for="broiler-cause">Cause of Death (Optional):</label>
                                <input type="text" id="broiler-cause" placeholder="e.g., Disease, Accident, etc.">
                            </div>
                            <div class="form-group" id="slaughter-details" style="display: none;">
                                <label for="broiler-weight">Average Weight (kg):</label>
                                <input type="number" id="broiler-weight" step="0.01" min="0" placeholder="0.00">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-broiler">Save Record</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .broiler-summary {
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

        .summary-period {
            font-size: 0.8rem;
            color: var(--text-muted);
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

        .batch-overview, .recent-activity {
            margin-bottom: 1.5rem;
        }

        .batch-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .batch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .batch-id {
            font-weight: 600;
            color: var(--text-color);
        }

        .batch-date {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .batch-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 0.5rem;
        }

        .batch-stat {
            text-align: center;
        }

        .batch-stat-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 0.25rem;
        }

        .batch-stat-value {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .mortality-high {
            color: var(--danger-color);
        }

        .mortality-medium {
            color: var(--warning-color);
        }

        .mortality-low {
            color: var(--success-color);
        }

        .transaction-type.purchase {
            color: var(--success-color);
            font-weight: 600;
        }

        .transaction-type.mortality {
            color: var(--danger-color);
            font-weight: 600;
        }

        .transaction-type.slaughter {
            color: var(--info-color);
            font-weight: 600;
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
        console.log('Broiler Mortality module initializing...');
        this.loadBroilerData();
        this.attachEventListeners();
        this.updateSummary();
        this.renderBatchOverview();
        this.renderActivityTable();
    },

    loadBroilerData: function() {
        if (!FarmModules.appData.broilerBatches) {
            FarmModules.appData.broilerBatches = [];
        }
        if (!FarmModules.appData.broilerTransactions) {
            FarmModules.appData.broilerTransactions = [];
        }
    },

    updateSummary: function() {
        const batches = FarmModules.appData.broilerBatches || [];
        const transactions = FarmModules.appData.broilerTransactions || [];

        const totalPurchased = batches.reduce((sum, batch) => sum + batch.initialCount, 0);
        const totalMortality = transactions
            .filter(t => t.type === 'mortality')
            .reduce((sum, t) => sum + t.count, 0);
        const totalSlaughtered = transactions
            .filter(t => t.type === 'slaughter')
            .reduce((sum, t) => sum + t.count, 0);

        const availableBroilers = totalPurchased - totalMortality - totalSlaughtered;
        const mortalityRate = totalPurchased > 0 ? (totalMortality / totalPurchased * 100) : 0;

        this.updateElement('total-purchased', totalPurchased);
        this.updateElement('total-mortality', totalMortality);
        this.updateElement('available-broilers', availableBroilers);
        this.updateElement('mortality-rate', mortalityRate.toFixed(1) + '%');
    },

    renderBatchOverview: function() {
        const container = document.getElementById('batch-container');
        const batches = FarmModules.appData.broilerBatches || [];

        if (batches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-content">
                        <span class="empty-icon">🐔</span>
                        <h4>No broiler batches yet</h4>
                        <p>Start by recording your first broiler purchase</p>
                    </div>
                </div>
            `;
            return;
        }

        // Show only active batches (with remaining broilers)
        const activeBatches = batches.filter(batch => {
            const batchTransactions = FarmModules.appData.broilerTransactions.filter(t => t.batchId === batch.id);
            const mortality = batchTransactions.filter(t => t.type === 'mortality').reduce((sum, t) => sum + t.count, 0);
            const slaughtered = batchTransactions.filter(t => t.type === 'slaughter').reduce((sum, t) => sum + t.count, 0);
            return (batch.initialCount - mortality - slaughtered) > 0;
        });

        if (activeBatches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-content">
                        <span class="empty-icon">✅</span>
                        <h4>All batches completed</h4>
                        <p>All broilers have been processed. Start a new batch!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = activeBatches.map(batch => {
            const batchTransactions = FarmModules.appData.broilerTransactions.filter(t => t.batchId === batch.id);
            const mortality = batchTransactions.filter(t => t.type === 'mortality').reduce((sum, t) => sum + t.count, 0);
            const slaughtered = batchTransactions.filter(t => t.type === 'slaughter').reduce((sum, t) => sum + t.count, 0);
            const remaining = batch.initialCount - mortality - slaughtered;
            const mortalityRate = (mortality / batch.initialCount * 100).toFixed(1);

            let mortalityClass = 'mortality-low';
            if (mortalityRate > 10) mortalityClass = 'mortality-medium';
            if (mortalityRate > 20) mortalityClass = 'mortality-high';

            return `
                <div class="batch-card">
                    <div class="batch-header">
                        <span class="batch-id">${batch.id}</span>
                        <span class="batch-date">Started: ${this.formatDate(batch.purchaseDate)}</span>
                    </div>
                    <div class="batch-stats">
                        <div class="batch-stat">
                            <div class="batch-stat-label">Initial</div>
                            <div class="batch-stat-value">${batch.initialCount}</div>
                        </div>
                        <div class="batch-stat">
                            <div class="batch-stat-label">Deaths</div>
                            <div class="batch-stat-value mortality">${mortality}</div>
                        </div>
                        <div class="batch-stat">
                            <div class="batch-stat-label">Slaughtered</div>
                            <div class="batch-stat-value">${slaughtered}</div>
                        </div>
                        <div class="batch-stat">
                            <div class="batch-stat-label">Remaining</div>
                            <div class="batch-stat-value">${remaining}</div>
                        </div>
                        <div class="batch-stat">
                            <div class="batch-stat-label">Mortality Rate</div>
                            <div class="batch-stat-value ${mortalityClass}">${mortalityRate}%</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderActivityTable: function() {
        const tbody = document.getElementById('broiler-activity-body');
        const transactions = FarmModules.appData.broilerTransactions || [];

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">📝</span>
                            <h4>No activity yet</h4>
                            <p>Broiler transactions will appear here</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const recentTransactions = transactions.slice(-10).reverse();

        tbody.innerHTML = recentTransactions.map(transaction => {
            const typeClass = `transaction-type ${transaction.type}`;
            const typeLabel = transaction.type === 'purchase' ? 'Purchase' : 
                            transaction.type === 'mortality' ? 'Mortality' : 
                            transaction.type === 'slaughter' ? 'Slaughter' : 'Adjustment';
            
            return `
                <tr>
                    <td>${this.formatDate(transaction.date)}</td>
                    <td><span class="${typeClass}">${typeLabel}</span></td>
                    <td>${transaction.batchId}</td>
                    <td>${transaction.count}</td>
                    <td>${transaction.cause || transaction.notes || '—'}</td>
                    <td class="transaction-actions">
                        <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners: function() {
        document.getElementById('quick-purchase').addEventListener('click', () => this.handleQuickPurchase());
        document.getElementById('quick-mortality').addEventListener('click', () => this.handleQuickMortality());
        document.getElementById('add-broiler-transaction').addEventListener('click', () => this.showBroilerModal());
        document.getElementById('save-broiler').addEventListener('click', () => this.saveBroilerTransaction());

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        document.getElementById('broiler-type').addEventListener('change', (e) => this.handleTypeChange(e.target.value));

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

        document.getElementById('broiler-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
    },

    handleQuickPurchase: function() {
        const count = parseInt(document.getElementById('quick-purchase-chicks').value);
        const cost = parseFloat(document.getElementById('quick-purchase-cost').value) || 0;

        if (!count || count <= 0) {
            this.showNotification('Please enter a valid number of chicks', 'error');
            return;
        }

        const batchId = 'BATCH-' + Date.now().toString().slice(-6);
        
        this.recordBroilerTransaction('purchase', count, batchId, 'Quick purchase', cost);
        
        // Create batch record
        FarmModules.appData.broilerBatches.push({
            id: batchId,
            initialCount: count,
            purchaseDate: new Date().toISOString().split('T')[0],
            cost: cost
        });

        document.getElementById('quick-purchase-chicks').value = '';
        document.getElementById('quick-purchase-cost').value = '';
        this.showNotification('Broiler purchase recorded successfully!', 'success');
    },

    handleQuickMortality: function() {
        const count = parseInt(document.getElementById('quick-mortality-count').value);
        const cause = document.getElementById('quick-mortality-cause').value;

        if (!count || count <= 0) {
            this.showNotification('Please enter a valid number of deaths', 'error');
            return;
        }

        const batches = FarmModules.appData.broilerBatches || [];
        if (batches.length === 0) {
            this.showNotification('No broiler batches found. Please record a purchase first.', 'error');
            return;
        }

        // Use the most recent batch
        const latestBatch = batches[batches.length - 1];
        
        // Check if we have enough broilers
        const batchTransactions = FarmModules.appData.broilerTransactions.filter(t => t.batchId === latestBatch.id);
        const currentMortality = batchTransactions.filter(t => t.type === 'mortality').reduce((sum, t) => sum + t.count, 0);
        const currentSlaughter = batchTransactions.filter(t => t.type === 'slaughter').reduce((sum, t) => sum + t.count, 0);
        const available = latestBatch.initialCount - currentMortality - currentSlaughter;

        if (count > available) {
            this.showNotification(`Only ${available} broilers available in batch ${latestBatch.id}`, 'error');
            return;
        }

        this.recordBroilerTransaction('mortality', count, latestBatch.id, 'Quick mortality record', 0, cause);
        
        document.getElementById('quick-mortality-count').value = '';
        document.getElementById('quick-mortality-cause').value = '';
        this.showNotification('Mortality recorded successfully!', 'success');
    },

    recordBroilerTransaction: function(type, count, batchId, notes = '', cost = 0, cause = '') {
        const transaction = {
            id: 'broiler-' + Date.now(),
            type: type,
            count: count,
            batchId: batchId,
            date: new Date().toISOString().split('T')[0],
            notes: notes,
            cost: cost,
            cause: cause
        };

        FarmModules.appData.broilerTransactions.push(transaction);
        
        this.updateSummary();
        this.renderBatchOverview();
        this.renderActivityTable();
    },

    showBroilerModal: function() {
        const modal = document.getElementById('broiler-modal');
        const title = document.getElementById('broiler-modal-title');
        const form = document.getElementById('broiler-form');

        if (modal && title && form) {
            form.reset();
            document.getElementById('broiler-id').value = '';
            document.getElementById('broiler-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('mortality-details').style.display = 'none';
            document.getElementById('slaughter-details').style.display = 'none';
            
            // Generate default batch ID
            document.getElementById('broiler-batch').value = 'BATCH-' + Date.now().toString().slice(-6);
            
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('broiler-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    handleTypeChange: function(type) {
        const mortalityDetails = document.getElementById('mortality-details');
        const slaughterDetails = document.getElementById('slaughter-details');
        
        mortalityDetails.style.display = type === 'mortality' ? 'block' : 'none';
        slaughterDetails.style.display = type === 'slaughter' ? 'block' : 'none';
    },

    saveBroilerTransaction: function() {
        const form = document.getElementById('broiler-form');
        if (!form) return;

        const transactionId = document.getElementById('broiler-id').value;
        const type = document.getElementById('broiler-type').value;
        const batchId = document.getElementById('broiler-batch').value;
        const count = parseInt(document.getElementById('broiler-count').value);
        const date = document.getElementById('broiler-date').value;
        const cost = parseFloat(document.getElementById('broiler-cost').value) || 0;
        const supplier = document.getElementById('broiler-supplier').value;
        const notes = document.getElementById('broiler-notes').value;
        const cause = document.getElementById('broiler-cause').value;
        const weight = document.getElementById('broiler-weight').value;

        if (!type || !batchId || !count || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (count <= 0) {
            this.showNotification('Count must be greater than 0', 'error');
            return;
        }

        // For mortality and slaughter, check available stock
        if (type === 'mortality' || type === 'slaughter') {
            const batches = FarmModules.appData.broilerBatches || [];
            const batch = batches.find(b => b.id === batchId);
            
            if (!batch) {
                this.showNotification('Batch not found. Please check the Batch ID.', 'error');
                return;
            }

            const batchTransactions = FarmModules.appData.broilerTransactions.filter(t => t.batchId === batchId);
            const currentMortality = batchTransactions.filter(t => t.type === 'mortality').reduce((sum, t) => sum + t.count, 0);
            const currentSlaughter = batchTransactions.filter(t => t.type === 'slaughter').reduce((sum, t) => sum + t.count, 0);
            const available = batch.initialCount - currentMortality - currentSlaughter;

            if (count > available) {
                this.showNotification(`Only ${available} broilers available in batch ${batchId}`, 'error');
                return;
            }
        }

        // For purchases, create batch record
        if (type === 'purchase' && !transactionId) {
            FarmModules.appData.broilerBatches.push({
                id: batchId,
                initialCount: count,
                purchaseDate: date,
                cost: cost,
                supplier: supplier
            });
        }

        const transactionData = {
            type: type,
            batchId: batchId,
            count: count,
            date: date,
            cost: cost,
            supplier: supplier,
            notes: notes,
            cause: cause,
            weight: weight
        };

        if (transactionId) {
            this.updateTransaction(transactionId, transactionData);
        } else {
            this.addTransaction(transactionData);
        }

        this.hideModal();
    },

    addTransaction: function(transactionData) {
        if (!FarmModules.appData.broilerTransactions) {
            FarmModules.appData.broilerTransactions = [];
        }

        const newTransaction = {
            id: 'broiler-' + Date.now(),
            ...transactionData
        };

        FarmModules.appData.broilerTransactions.push(newTransaction);
        
        this.updateSummary();
        this.renderBatchOverview();
        this.renderActivityTable();
        
        this.showNotification('Transaction recorded successfully!', 'success');
    },

    editTransaction: function(transactionId) {
        const transactions = FarmModules.appData.broilerTransactions || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const modal = document.getElementById('broiler-modal');
        const title = document.getElementById('broiler-modal-title');

        if (modal && title) {
            document.getElementById('broiler-id').value = transaction.id;
            document.getElementById('broiler-type').value = transaction.type;
            document.getElementById('broiler-batch').value = transaction.batchId;
            document.getElementById('broiler-count').value = transaction.count;
            document.getElementById('broiler-date').value = transaction.date;
            document.getElementById('broiler-cost').value = transaction.cost || '';
            document.getElementById('broiler-supplier').value = transaction.supplier || '';
            document.getElementById('broiler-notes').value = transaction.notes || '';
            document.getElementById('broiler-cause').value = transaction.cause || '';
            document.getElementById('broiler-weight').value = transaction.weight || '';
            
            this.handleTypeChange(transaction.type);
            
            title.textContent = 'Edit Broiler Record';
            modal.classList.remove('hidden');
        }
    },

    updateTransaction: function(transactionId, transactionData) {
        const transactions = FarmModules.appData.broilerTransactions || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                ...transactionData
            };
            
            this.updateSummary();
            this.renderBatchOverview();
            this.renderActivityTable();
            this.showNotification('Transaction updated successfully!', 'success');
        }
    },

    deleteTransaction: function(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            FarmModules.appData.broilerTransactions = FarmModules.appData.broilerTransactions.filter(t => t.id !== transactionId);
            
            this.updateSummary();
            this.renderBatchOverview();
            this.renderActivityTable();
            this.showNotification('Transaction deleted successfully', 'success');
        }
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
            alert(message);
        }
    }
});
