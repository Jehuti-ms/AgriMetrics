// In your income-expenses.js module, update the renderModule method:
renderModule() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const stats = this.calculateStats();

    contentArea.innerHTML = `
        <div class="income-expenses-module">
            <!-- Enhanced PWA Header -->
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Income & Expenses</h1>
                <p class="module-subtitle-pwa">Manage your farm finances</p>
            </div>

            <!-- Enhanced Stats Grid -->
            <div class="stats-grid-pwa">
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">💰</div>
                    <div class="stat-value-pwa">${this.formatCurrency(stats.totalIncome)}</div>
                    <div class="stat-label-pwa">Total Income</div>
                </div>
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">💸</div>
                    <div class="stat-value-pwa">${this.formatCurrency(stats.totalExpenses)}</div>
                    <div class="stat-label-pwa">Total Expenses</div>
                </div>
                <div class="stat-card-pwa">
                    <div class="stat-icon-pwa">📊</div>
                    <div class="stat-value-pwa" style="${stats.netProfit >= 0 ? 'color: var(--success-color)' : 'color: var(--error-color)'}">
                        ${this.formatCurrency(stats.netProfit)}
                    </div>
                    <div class="stat-label-pwa">Net Profit</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-pwa">
                <div class="quick-grid-pwa">
                    <button class="quick-action-btn-pwa" id="add-income-btn">
                        <div class="quick-icon-pwa">💰</div>
                        <div class="quick-text-pwa">
                            <div class="quick-title-pwa">Add Income</div>
                            <div class="quick-desc-pwa">Record new income</div>
                        </div>
                    </button>
                    <button class="quick-action-btn-pwa" id="add-expense-btn">
                        <div class="quick-icon-pwa">💸</div>
                        <div class="quick-text-pwa">
                            <div class="quick-title-pwa">Add Expense</div>
                            <div class="quick-desc-pwa">Record new expense</div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Transaction Form -->
            <div id="transaction-form-container" class="form-container-pwa hidden">
                <h3 class="form-title-pwa" id="form-title">Add Transaction</h3>
                <form id="transaction-form">
                    <div class="form-grid-pwa">
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Type</label>
                            <select class="form-select-pwa" id="transaction-type" required>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div class="form-group-pwa">
                            <label class="form-label-pwa">Amount</label>
                            <input type="number" class="form-input-pwa" id="transaction-amount" step="0.01" min="0" required>
                        </div>
                    </div>
                    <!-- ... rest of form ... -->
                    <div style="display: flex; gap: 12px;">
                        <button type="submit" class="btn-primary-pwa">Save Transaction</button>
                        <button type="button" class="btn-outline-pwa" id="cancel-form">Cancel</button>
                    </div>
                </form>
            </div>

            <!-- Transactions List -->
            <div class="transactions-section-pwa">
                <div class="section-header-pwa">
                    <h3 class="section-title-pwa">Recent Transactions</h3>
                    <button class="btn-outline-pwa" id="clear-all">Clear All</button>
                </div>
                <div class="transactions-list-pwa" id="transactions-list">
                    ${this.renderTransactionsList()}
                </div>
            </div>
        </div>
    `;

    this.setupEventListeners();
}
