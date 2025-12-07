// modules/income-expenses.js - UPDATED WITH RECEIPT UPLOAD, OCR, AND PHOTO
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    categories: ['feed', 'medical', 'equipment', 'labor', 'utilities', 'sales', 'other'],
    currentEditingId: null,
    receiptPreview: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized with StyleManager');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Income & Expenses updating for theme: ${theme}`);
    },

    loadData() {
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            {
                id: 1,
                date: '2024-03-15',
                type: 'income',
                category: 'sales',
                description: 'Egg sales - Market day',
                amount: 450.00,
                paymentMethod: 'cash',
                reference: 'EGG-001',
                receipt: null,
                notes: 'Sold 30 dozen eggs at $15/dozen'
            },
            {
                id: 2,
                date: '2024-03-14',
                type: 'expense',
                category: 'feed',
                description: 'Chicken feed purchase',
                amount: 120.00,
                paymentMethod: 'card',
                reference: 'INV-78910',
                receipt: null,
                notes: '50kg starter feed from FeedCo'
            },
            {
                id: 3,
                date: '2024-03-13',
                type: 'expense',
                category: 'medical',
                description: 'Vaccines and supplements',
                amount: 85.50,
                paymentMethod: 'transfer',
                reference: 'MED-001',
                receipt: null,
                notes: 'Monthly health supplies'
            }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Income & Expenses</h1>
                    <p class="module-subtitle">Track farm finances and cash flow</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-transaction">
                            ➕ Add Transaction
                        </button>
                        <button class="btn btn-outline" id="upload-receipt-btn" style="display: flex; align-items: center; gap: 8px;">
                            📄 Upload Receipt
                        </button>
                    </div>
                </div>

                <!-- Financial Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Income</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="net-income">${this.formatCurrency(stats.netIncome)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Net Income</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💳</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.transactionCount}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Transactions</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn">
                        <div style="font-size: 32px;">💰</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Income</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record farm income</span>
                    </button>
                    <button class="quick-action-btn" id="add-expense-btn">
                        <div style="font-size: 32px;">💸</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Expense</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Record farm expenses</span>
                    </button>
                    <button class="quick-action-btn" id="financial-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Financial Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View financial summary</span>
                    </button>
                    <button class="quick-action-btn" id="category-analysis-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Category Analysis</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Breakdown by category</span>
                    </button>
                </div>

                <!-- Recent Transactions -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📋 Recent Transactions</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="transaction-filter" class="form-input" style="width: auto;">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                            <button class="btn-outline" id="export-transactions">Export</button>
                        </div>
                    </div>
                    <div id="transactions-list">
                        ${this.renderTransactionsList(recentTransactions)}
                    </div>
                </div>

                <!-- Category Breakdown -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">📊 Category Breakdown</h3>
                    <div id="category-breakdown">
                        ${this.renderCategoryBreakdown()}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS - Added at the end to overlay content -->
            <!-- Transaction Modal -->
            <div id="transaction-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="transaction-modal-title">Add Transaction</h3>
                        <button class="popout-modal-close" id="close-transaction-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id" value="">
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date *</label>
                                    <input type="date" id="transaction-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Type *</label>
                                    <select id="transaction-type" class="form-input" required>
                                        <option value="income">💰 Income</option>
                                        <option value="expense">💸 Expense</option>
                                    </select>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Category *</label>
                                    <select id="transaction-category" class="form-input" required>
                                        <option value="">Select Category</option>
                                        <optgroup label="Income">
                                            <option value="sales">Sales</option>
                                            <option value="services">Services</option>
                                            <option value="grants">Grants/Subsidies</option>
                                            <option value="other-income">Other Income</option>
                                        </optgroup>
                                        <optgroup label="Expenses">
                                            <option value="feed">Feed</option>
                                            <option value="medical">Medical/Vet</option>
                                            <option value="equipment">Equipment</option>
                                            <option value="labor">Labor</option>
                                            <option value="utilities">Utilities</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="transport">Transport</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="other-expense">Other Expenses</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Amount ($) *</label>
                                    <input type="number" id="transaction-amount" class="form-input" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Description *</label>
                                <input type="text" id="transaction-description" class="form-input" required placeholder="Enter transaction description">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Payment Method</label>
                                    <select id="transaction-payment" class="form-input">
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Reference Number</label>
                                    <input type="text" id="transaction-reference" class="form-input" placeholder="Invoice/Receipt #">
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Notes (Optional)</label>
                                <textarea id="transaction-notes" class="form-input" placeholder="Additional notes about this transaction" rows="3"></textarea>
                            </div>

                            <!-- Receipt Upload Section -->
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Receipt (Optional)</label>
                                <div id="receipt-upload-area" style="border: 2px dashed var(--glass-border); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; margin-bottom: 12px;">
                                    <div style="font-size: 48px; margin-bottom: 8px;">📄</div>
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Upload Receipt</div>
                                    <div style="color: var(--text-secondary); font-size: 14px;">Click to upload or drag & drop</div>
                                    <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Supports JPG, PNG, PDF (Max 10MB)</div>
                                    <input type="file" id="receipt-upload" accept="image/*,.pdf" style="display: none;">
                                </div>
                                
                                <!-- Receipt Preview -->
                                <div id="receipt-preview-container" class="hidden">
                                    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--glass-bg); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="font-size: 24px;">📄</div>
                                            <div>
                                                <div style="font-weight: 600; color: var(--text-primary);" id="receipt-filename">receipt.jpg</div>
                                                <div style="font-size: 12px; color: var(--text-secondary);" id="receipt-size">2.5 MB</div>
                                            </div>
                                        </div>
                                        <button type="button" id="remove-receipt" class="btn-icon" style="color: var(--text-secondary);">🗑️</button>
                                    </div>
                                    
                                    <!-- Image Preview -->
                                    <div id="image-preview" class="hidden" style="margin-bottom: 12px;">
                                        <img id="receipt-image-preview" src="" alt="Receipt preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid var(--glass-border);">
                                    </div>
                                    
                                    <!-- OCR Button -->
                                    <button type="button" id="process-receipt-btn" class="btn-outline" style="width: 100%; margin-top: 8px;">
                                        🔍 Extract Information from Receipt
                                    </button>
                                    
                                    <!-- Camera Capture -->
                                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                                        <button type="button" id="capture-photo-btn" class="btn-outline" style="flex: 1;">
                                            📸 Capture Photo
                                        </button>
                                        <button type="button" id="scan-receipt-btn" class="btn-outline" style="flex: 1;">
                                            🔍 Scan Receipt
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- OCR Results (Auto-filled from receipt) -->
                            <div id="ocr-results" class="hidden" style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="color: #1e40af; margin: 0;">📄 Extracted from Receipt</h4>
                                    <button type="button" id="use-ocr-data" class="btn-primary" style="font-size: 12px; padding: 4px 8px;">Apply</button>
                                </div>
                                <div id="ocr-details" style="font-size: 14px; color: #374151;">
                                    <!-- OCR extracted details will appear here -->
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-transaction">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-transaction" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
                </div>
            </div>

            <!-- Receipt Upload Modal -->
            <div id="receipt-upload-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 500px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Upload Receipt</h3>
                        <button class="popout-modal-close" id="close-receipt-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📄</div>
                            <h4 style="color: var(--text-primary); margin-bottom: 8px;">Upload Receipt for Processing</h4>
                            <p style="color: var(--text-secondary); margin-bottom: 24px;">Upload a receipt photo or PDF to automatically extract transaction details</p>
                            
                            <div style="border: 2px dashed var(--glass-border); border-radius: 12px; padding: 40px; margin-bottom: 24px; cursor: pointer;" id="drop-zone">
                                <div style="font-size: 48px; margin-bottom: 16px;">⬆️</div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Drag & Drop Receipt Here</div>
                                <div style="color: var(--text-secondary); font-size: 14px;">or click to browse files</div>
                                <input type="file" id="receipt-file-input" accept="image/*,.pdf" style="display: none;">
                            </div>
                            
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 24px;">
                                Supported formats: JPG, PNG, PDF (Max 10MB)
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <button type="button" id="take-photo-btn" class="btn-outline" style="width: 100%;">
                                    📸 Take Photo
                                </button>
                                <button type="button" id="choose-existing-btn" class="btn-outline" style="width: 100%;">
                                    📁 Choose from Gallery
                                </button>
                            </div>
                        </div>
                        
                        <!-- Camera Interface -->
                        <div id="camera-interface" class="hidden">
                            <div style="text-align: center;">
                                <h4 style="color: var(--text-primary); margin-bottom: 16px;">📸 Camera</h4>
                                <video id="camera-preview" autoplay playsinline style="width: 100%; max-height: 300px; background: #000; border-radius: 8px; margin-bottom: 16px;"></video>
                                <div style="display: flex; gap: 12px; justify-content: center;">
                                    <button type="button" id="capture-btn" class="btn-primary">
                                        📷 Capture
                                    </button>
                                    <button type="button" id="switch-camera-btn" class="btn-outline">
                        🔄 Switch Camera
                                    </button>
                                    <button type="button" id="cancel-camera-btn" class="btn-outline">
                                        ❌ Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Processing Indicator -->
                        <div id="processing-indicator" class="hidden" style="text-align: center; padding: 40px 20px;">
                            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top: 4px solid var(--primary-color); border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
                            <h4 style="color: var(--text-primary); margin-bottom: 8px;">Processing Receipt</h4>
                            <p style="color: var(--text-secondary);">Extracting information from your receipt...</p>
                            <div id="ocr-progress" style="margin-top: 16px; color: var(--text-secondary); font-size: 14px;">
                                Analyzing text... 0%
                            </div>
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-receipt-upload">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Financial Report Modal -->
            <div id="financial-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="financial-report-title">Financial Report</h3>
                        <button class="popout-modal-close" id="close-financial-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="financial-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-financial-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-financial-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Category Analysis Modal -->
            <div id="category-analysis-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="category-analysis-title">Category Analysis</h3>
                        <button class="popout-modal-close" id="close-category-analysis">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="category-analysis-content">
                            <!-- Analysis content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-category-analysis">🖨️ Print</button>
                        <button class="btn-primary" id="close-category-analysis-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Receipt Scanner Fullscreen -->
            <div id="receipt-scanner-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 100%; height: 100%; background: #000;">
                    <div class="popout-modal-header" style="background: rgba(0,0,0,0.7);">
                        <h3 class="popout-modal-title" style="color: white;">Receipt Scanner</h3>
                        <button class="popout-modal-close" id="close-scanner-modal" style="color: white;">&times;</button>
                    </div>
                    <div class="popout-modal-body" style="padding: 0; height: calc(100% - 60px);">
                        <div style="position: relative; height: 100%;">
                            <video id="scanner-preview" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; height: 200px; border: 3px solid #22c55e; border-radius: 12px; pointer-events: none;"></div>
                            <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: white; background: rgba(0,0,0,0.5); padding: 16px;">
                                <div style="margin-bottom: 8px;">Hold steady and align receipt within the frame</div>
                                <button type="button" id="scan-capture-btn" class="btn-primary" style="font-size: 18px; padding: 12px 32px;">
                                    📷 Capture Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const net = income - expenses;
        
        return {
            totalIncome: income,
            totalExpenses: expenses,
            netIncome: net,
            transactionCount: this.transactions.length
        };
    },

    getRecentTransactions(limit = 10) {
        return this.transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No transactions yet</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first income or expense</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${transactions.map(transaction => {
                    const isIncome = transaction.type === 'income';
                    const amountColor = isIncome ? '#22c55e' : '#ef4444';
                    const icon = isIncome ? '💰' : '💸';
                    const categoryIcon = this.getCategoryIcon(transaction.category);
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="font-size: 20px;">${icon}</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${transaction.description}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${this.formatDate(transaction.date)} • 
                                        ${categoryIcon} ${this.formatCategory(transaction.category)}
                                        ${transaction.reference ? ` • Ref: ${transaction.reference}` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="text-align: right;">
                                    <div style="font-weight: bold; color: ${amountColor}; font-size: 18px;">
                                        ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${transaction.paymentMethod || 'No payment method'}
                                    </div>
                                </div>
                                ${transaction.receipt ? `
                                    <button class="btn-icon view-receipt" data-id="${transaction.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="View Receipt">
                                        📄
                                    </button>
                                ` : ''}
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-icon edit-transaction" data-id="${transaction.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Edit">
                                        ✏️
                                    </button>
                                    <button class="btn-icon delete-transaction" data-id="${transaction.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderCategoryBreakdown() {
        const categoryData = {};
        
        // Initialize all categories
        this.categories.forEach(cat => {
            categoryData[cat] = { income: 0, expense: 0 };
        });
        
        // Calculate totals
        this.transactions.forEach(transaction => {
            if (categoryData[transaction.category]) {
                if (transaction.type === 'income') {
                    categoryData[transaction.category].income += transaction.amount;
                } else {
                    categoryData[transaction.category].expense += transaction.amount;
                }
            }
        });

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                ${Object.entries(categoryData).filter(([_, data]) => data.income > 0 || data.expense > 0).map(([category, data]) => {
                    const icon = this.getCategoryIcon(category);
                    const total = data.income - data.expense;
                    
                    return `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 20px;">${icon}</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(category)}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Income:</span>
                                <span style="font-weight: 600; color: #22c55e;">${this.formatCurrency(data.income)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Expenses:</span>
                                <span style="font-weight: 600; color: #ef4444;">${this.formatCurrency(data.expense)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--glass-border);">
                                <span style="color: var(--text-primary); font-weight: 600;">Net:</span>
                                <span style="font-weight: bold; color: ${total >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(total)}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    setupEventListeners() {
        // Main buttons
        document.getElementById('add-transaction')?.addEventListener('click', () => this.showTransactionModal());
        document.getElementById('upload-receipt-btn')?.addEventListener('click', () => this.showReceiptUploadModal());
        
        // Quick action buttons
        document.getElementById('add-income-btn')?.addEventListener('click', () => this.showAddIncome());
        document.getElementById('add-expense-btn')?.addEventListener('click', () => this.showAddExpense());
        document.getElementById('financial-report-btn')?.addEventListener('click', () => this.generateFinancialReport());
        document.getElementById('category-analysis-btn')?.addEventListener('click', () => this.generateCategoryAnalysis());
        
        // Transaction modal handlers
        document.getElementById('save-transaction')?.addEventListener('click', () => this.saveTransaction());
        document.getElementById('delete-transaction')?.addEventListener('click', () => this.deleteTransaction());
        document.getElementById('cancel-transaction')?.addEventListener('click', () => this.hideTransactionModal());
        document.getElementById('close-transaction-modal')?.addEventListener('click', () => this.hideTransactionModal());
        
        // Receipt upload handlers
        document.getElementById('close-receipt-modal')?.addEventListener('click', () => this.hideReceiptUploadModal());
        document.getElementById('cancel-receipt-upload')?.addEventListener('click', () => this.hideReceiptUploadModal());
        document.getElementById('close-scanner-modal')?.addEventListener('click', () => this.hideScannerModal());
        
        // Report modal handlers
        document.getElementById('close-financial-report')?.addEventListener('click', () => this.hideFinancialReportModal());
        document.getElementById('close-financial-report-btn')?.addEventListener('click', () => this.hideFinancialReportModal());
        document.getElementById('print-financial-report')?.addEventListener('click', () => this.printFinancialReport());
        
        document.getElementById('close-category-analysis')?.addEventListener('click', () => this.hideCategoryAnalysisModal());
        document.getElementById('close-category-analysis-btn')?.addEventListener('click', () => this.hideCategoryAnalysisModal());
        document.getElementById('print-category-analysis')?.addEventListener('click', () => this.printCategoryAnalysis());
        
        // Filter
        document.getElementById('transaction-filter')?.addEventListener('change', (e) => {
            this.filterTransactions(e.target.value);
        });
        
        // Export
        document.getElementById('export-transactions')?.addEventListener('click', () => {
            this.exportTransactions();
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });
        
        // Edit/delete transaction buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-transaction')) {
                const id = e.target.closest('.edit-transaction').dataset.id;
                this.editTransaction(id);
            }
            if (e.target.closest('.delete-transaction')) {
                const id = e.target.closest('.delete-transaction').dataset.id;
                this.deleteTransactionRecord(id);
            }
            if (e.target.closest('.view-receipt')) {
                const id = e.target.closest('.view-receipt').dataset.id;
                this.viewReceipt(id);
            }
        });
        
        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
        
        // Receipt upload specific handlers
        this.setupReceiptUploadHandlers();
    },

    setupReceiptUploadHandlers() {
        // Drop zone for file upload
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('receipt-file-input');
        
        if (dropZone && fileInput) {
            // Click to upload
            dropZone.addEventListener('click', () => fileInput.click());
            
            // Drag and drop
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--primary-color)';
                dropZone.style.backgroundColor = 'var(--primary-color)10';
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = 'var(--glass-border)';
                dropZone.style.backgroundColor = '';
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--glass-border)';
                dropZone.style.backgroundColor = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleReceiptFile(files[0]);
                }
            });
        }
        
        // File input change
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleReceiptFile(e.target.files[0]);
            }
        });
        
        // Camera buttons
        document.getElementById('take-photo-btn')?.addEventListener('click', () => {
            this.startCamera();
        });
        
        document.getElementById('choose-existing-btn')?.addEventListener('click', () => {
            // Create file input for gallery
            const galleryInput = document.createElement('input');
            galleryInput.type = 'file';
            galleryInput.accept = 'image/*';
            galleryInput.multiple = false;
            galleryInput.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.handleReceiptFile(e.target.files[0]);
                }
            };
            galleryInput.click();
        });
        
        // Capture button
        document.getElementById('capture-btn')?.addEventListener('click', () => {
            this.capturePhoto();
        });
        
        // Switch camera
        document.getElementById('switch-camera-btn')?.addEventListener('click', () => {
            this.switchCamera();
        });
        
        // Cancel camera
        document.getElementById('cancel-camera-btn')?.addEventListener('click', () => {
            this.stopCamera();
            document.getElementById('camera-interface').classList.add('hidden');
            document.getElementById('drop-zone').classList.remove('hidden');
        });
        
        // Scanner modal
        document.getElementById('scan-receipt-btn')?.addEventListener('click', () => {
            this.showScannerModal();
        });
        
        document.getElementById('scan-capture-btn')?.addEventListener('click', () => {
            this.captureScannerPhoto();
        });
        
        // In transaction modal receipt handlers
        const receiptUploadArea = document.getElementById('receipt-upload-area');
        const receiptUploadInput = document.getElementById('receipt-upload');
        
        if (receiptUploadArea && receiptUploadInput) {
            receiptUploadArea.addEventListener('click', () => receiptUploadInput.click());
            
            receiptUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                receiptUploadArea.style.borderColor = 'var(--primary-color)';
                receiptUploadArea.style.backgroundColor = 'var(--primary-color)10';
            });
            
            receiptUploadArea.addEventListener('dragleave', () => {
                receiptUploadArea.style.borderColor = 'var(--glass-border)';
                receiptUploadArea.style.backgroundColor = '';
            });
            
            receiptUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                receiptUploadArea.style.borderColor = 'var(--glass-border)';
                receiptUploadArea.style.backgroundColor = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleTransactionReceiptUpload(files[0]);
                }
            });
        }
        
        receiptUploadInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleTransactionReceiptUpload(e.target.files[0]);
            }
        });
        
        // Remove receipt button
        document.getElementById('remove-receipt')?.addEventListener('click', () => {
            this.clearReceiptPreview();
        });
        
        // Process receipt OCR button
        document.getElementById('process-receipt-btn')?.addEventListener('click', () => {
            this.processReceiptOCR();
        });
        
        // Use OCR data button
        document.getElementById('use-ocr-data')?.addEventListener('click', () => {
            this.applyOCRData();
        });
        
        // Capture photo in transaction modal
        document.getElementById('capture-photo-btn')?.addEventListener('click', () => {
            this.capturePhotoForTransaction();
        });
    },

    // MODAL CONTROL METHODS
    showTransactionModal(transactionId = null) {
        this.hideAllModals();
        document.getElementById('transaction-modal').classList.remove('hidden');
        this.currentEditingId = transactionId;
        
        const form = document.getElementById('transaction-form');
        if (form) {
            form.reset();
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('delete-transaction').style.display = 'none';
            document.getElementById('transaction-modal-title').textContent = 'Add Transaction';
            this.clearReceiptPreview();
            document.getElementById('ocr-results').classList.add('hidden');
            
            // If editing existing transaction
            if (transactionId) {
                this.editTransaction(transactionId);
            }
        }
    },

    hideTransactionModal() {
        document.getElementById('transaction-modal').classList.add('hidden');
    },

    showReceiptUploadModal() {
        this.hideAllModals();
        document.getElementById('receipt-upload-modal').classList.remove('hidden');
        document.getElementById('processing-indicator').classList.add('hidden');
        document.getElementById('camera-interface').classList.add('hidden');
        document.getElementById('drop-zone').classList.remove('hidden');
        
        // Reset file input
        const fileInput = document.getElementById('receipt-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    },

    hideReceiptUploadModal() {
        document.getElementById('receipt-upload-modal').classList.add('hidden');
        this.stopCamera();
    },

    showScannerModal() {
        this.hideAllModals();
        document.getElementById('receipt-scanner-modal').classList.remove('hidden');
        this.startScannerCamera();
    },

    hideScannerModal() {
        document.getElementById('receipt-scanner-modal').classList.add('hidden');
        this.stopScannerCamera();
    },

    hideAllModals() {
        this.hideTransactionModal();
        this.hideReceiptUploadModal();
        this.hideScannerModal();
        this.hideFinancialReportModal();
        this.hideCategoryAnalysisModal();
    },

    // RECEIPT HANDLING METHODS
    handleReceiptFile(file) {
        if (!file) return;
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File is too large. Maximum size is 10MB.', 'error');
            return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Invalid file type. Please upload JPG, PNG, or PDF.', 'error');
            return;
        }
        
        console.log('📄 Processing receipt file:', file.name, file.type);
        
        // Show processing indicator
        document.getElementById('processing-indicator').classList.remove('hidden');
        document.getElementById('drop-zone').classList.add('hidden');
        document.getElementById('camera-interface').classList.add('hidden');
        
        // Process the receipt
        this.processReceiptFile(file);
    },

    async processReceiptFile(file) {
        try {
            // Read file as data URL
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const dataUrl = e.target.result;
                
                // Simulate OCR processing with progress
                this.simulateOCRProcessing();
                
                // In a real implementation, you would send this to an OCR API
                // For demo purposes, we'll simulate extracting data
                setTimeout(() => {
                    this.extractReceiptData(dataUrl, file);
                }, 2000);
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing receipt:', error);
            this.showNotification('Error processing receipt. Please try again.', 'error');
            document.getElementById('processing-indicator').classList.add('hidden');
            document.getElementById('drop-zone').classList.remove('hidden');
        }
    },

    simulateOCRProcessing() {
        let progress = 0;
        const progressElement = document.getElementById('ocr-progress');
        
        const interval = setInterval(() => {
            progress += 10;
            if (progressElement) {
                progressElement.textContent = `Analyzing text... ${progress}%`;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    },

    extractReceiptData(dataUrl, file) {
        // Simulate OCR extraction
        // In a real app, this would use Tesseract.js or an OCR API
        const mockExtractedData = {
            vendor: 'Farm Supplies Inc.',
            date: new Date().toISOString().split('T')[0],
            totalAmount: Math.round(Math.random() * 500) + 50,
            items: [
                { name: 'Chicken Feed', amount: 89.99 },
                { name: 'Supplements', amount: 24.50 }
            ],
            tax: 9.25,
            reference: 'INV-' + Math.floor(Math.random() * 10000)
        };
        
        // Hide processing indicator
        document.getElementById('processing-indicator').classList.add('hidden');
        
        // Show success and populate transaction form
        this.showNotification('Receipt processed successfully! Transaction form populated.', 'success');
        this.hideReceiptUploadModal();
        this.showTransactionModal();
        
        // Populate form with extracted data
        setTimeout(() => {
            this.populateFormFromReceipt(mockExtractedData, file, dataUrl);
        }, 500);
    },

    populateFormFromReceipt(data, file, dataUrl) {
        // Set transaction as expense (most receipts are expenses)
        document.getElementById('transaction-type').value = 'expense';
        
        // Set date
        if (data.date) {
            document.getElementById('transaction-date').value = data.date;
        }
        
        // Set amount
        if (data.totalAmount) {
            document.getElementById('transaction-amount').value = data.totalAmount.toFixed(2);
        }
        
        // Set description
        let description = data.vendor || 'Receipt from vendor';
        if (data.items && data.items.length > 0) {
            description += ' - ' + data.items.map(item => item.name).join(', ');
        }
        document.getElementById('transaction-description').value = description.substring(0, 100);
        
        // Set category (try to auto-detect based on items)
        let category = 'other-expense';
        if (description.toLowerCase().includes('feed')) {
            category = 'feed';
        } else if (description.toLowerCase().includes('medical') || description.toLowerCase().includes('vet')) {
            category = 'medical';
        } else if (description.toLowerCase().includes('equipment')) {
            category = 'equipment';
        }
        document.getElementById('transaction-category').value = category;
        
        // Set reference number
        if (data.reference) {
            document.getElementById('transaction-reference').value = data.reference;
        }
        
        // Set notes with extracted details
        let notes = `Extracted from receipt:\n`;
        if (data.vendor) notes += `Vendor: ${data.vendor}\n`;
        if (data.date) notes += `Date: ${data.date}\n`;
        if (data.items) {
            notes += `Items: ${data.items.map(item => `${item.name}: $${item.amount}`).join(', ')}\n`;
        }
        if (data.tax) notes += `Tax: $${data.tax}\n`;
        document.getElementById('transaction-notes').value = notes;
        
        // Store receipt data
        this.receiptPreview = {
            filename: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            dataUrl: dataUrl
        };
        
        // Show receipt preview in transaction form
        this.showReceiptPreview();
        
        // Show OCR results summary
        this.showOCRResults(data);
    },

    showReceiptPreview() {
        if (!this.receiptPreview) return;
        
        const previewContainer = document.getElementById('receipt-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const receiptImage = document.getElementById('receipt-image-preview');
        
        if (previewContainer) {
            previewContainer.classList.remove('hidden');
            document.getElementById('receipt-filename').textContent = this.receiptPreview.filename;
            document.getElementById('receipt-size').textContent = this.receiptPreview.size;
            
            // Show image preview if it's an image
            if (this.receiptPreview.type.startsWith('image/')) {
                imagePreview.classList.remove('hidden');
                if (receiptImage) {
                    receiptImage.src = this.receiptPreview.dataUrl;
                }
            } else {
                imagePreview.classList.add('hidden');
            }
        }
    },

    showOCRResults(data) {
        const ocrResults = document.getElementById('ocr-results');
        const ocrDetails = document.getElementById('ocr-details');
        
        if (ocrResults && ocrDetails) {
            ocrResults.classList.remove('hidden');
            
            let detailsHtml = '';
            if (data.vendor) detailsHtml += `<div><strong>Vendor:</strong> ${data.vendor}</div>`;
            if (data.date) detailsHtml += `<div><strong>Date:</strong> ${data.date}</div>`;
            if (data.totalAmount) detailsHtml += `<div><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</div>`;
            if (data.reference) detailsHtml += `<div><strong>Reference:</strong> ${data.reference}</div>`;
            if (data.items && data.items.length > 0) {
                detailsHtml += `<div><strong>Items:</strong><ul style="margin: 4px 0 0 20px;">`;
                data.items.forEach(item => {
                    detailsHtml += `<li>${item.name}: $${item.amount.toFixed(2)}</li>`;
                });
                detailsHtml += `</ul></div>`;
            }
            
            ocrDetails.innerHTML = detailsHtml;
        }
    },

    clearReceiptPreview() {
        this.receiptPreview = null;
        document.getElementById('receipt-preview-container').classList.add('hidden');
        document.getElementById('ocr-results').classList.add('hidden');
        const receiptInput = document.getElementById('receipt-upload');
        if (receiptInput) receiptInput.value = '';
    },

    applyOCRData() {
        // This is already applied when showing OCR results
        this.showNotification('OCR data applied to form', 'success');
        document.getElementById('ocr-results').classList.add('hidden');
    },

    // CAMERA METHODS
    async startCamera() {
        try {
            document.getElementById('camera-interface').classList.remove('hidden');
            document.getElementById('drop-zone').classList.add('hidden');
            
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            const video = document.getElementById('camera-preview');
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.cameraStream;
            
            // Store current camera facing mode
            this.cameraFacingMode = 'environment';
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showNotification('Could not access camera. Please check permissions.', 'error');
            document.getElementById('camera-interface').classList.add('hidden');
            document.getElementById('drop-zone').classList.remove('hidden');
        }
    },

    async startScannerCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            
            const video = document.getElementById('scanner-preview');
            this.scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.scannerStream;
        } catch (error) {
            console.error('Error accessing scanner camera:', error);
            this.showNotification('Could not access camera for scanner.', 'error');
            this.hideScannerModal();
        }
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const video = document.getElementById('camera-preview');
        if (video) {
            video.srcObject = null;
        }
    },

    stopScannerCamera() {
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(track => track.stop());
            this.scannerStream = null;
        }
        
        const video = document.getElementById('scanner-preview');
        if (video) {
            video.srcObject = null;
        }
    },

    async switchCamera() {
        if (!this.cameraStream) return;
        
        try {
            // Stop current stream
            this.cameraStream.getTracks().forEach(track => track.stop());
            
            // Switch facing mode
            const newFacingMode = this.cameraFacingMode === 'environment' ? 'user' : 'environment';
            
            const constraints = {
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraFacingMode = newFacingMode;
            
            const video = document.getElementById('camera-preview');
            video.srcObject = this.cameraStream;
        } catch (error) {
            console.error('Error switching camera:', error);
            this.showNotification('Could not switch camera.', 'error');
        }
    },

    capturePhoto() {
        if (!this.cameraStream) return;
        
        const video = document.getElementById('camera-preview');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
                this.handleReceiptFile(file);
            }
        }, 'image/jpeg', 0.9);
        
        // Stop camera
        this.stopCamera();
    },

    captureScannerPhoto() {
        if (!this.scannerStream) return;
        
        const video = document.getElementById('scanner-preview');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `scanned_receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
                this.handleReceiptFile(file);
                this.hideScannerModal();
            }
        }, 'image/jpeg', 0.9);
    },

    capturePhotoForTransaction() {
        // Create a camera interface within the transaction modal
        this.showNotification('Opening camera... Please capture receipt photo.', 'info');
        
        // For simplicity, we'll open the receipt upload modal with camera
        setTimeout(() => {
            this.hideTransactionModal();
            this.showReceiptUploadModal();
            this.startCamera();
        }, 500);
    },

    handleTransactionReceiptUpload(file) {
        if (!file) return;
        
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File is too large. Maximum size is 10MB.', 'error');
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Invalid file type. Please upload JPG, PNG, or PDF.', 'error');
            return;
        }
        
        // Store receipt data
        const reader = new FileReader();
        reader.onload = (e) => {
            this.receiptPreview = {
                filename: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                dataUrl: e.target.result
            };
            this.showReceiptPreview();
        };
        reader.readAsDataURL(file);
    },

    async processReceiptOCR() {
        if (!this.receiptPreview) {
            this.showNotification('Please upload a receipt first.', 'error');
            return;
        }
        
        this.showNotification('Processing receipt with OCR...', 'info');
        
        // Simulate OCR processing
        setTimeout(() => {
            const mockData = {
                vendor: 'Farm Equipment Supply',
                date: new Date().toISOString().split('T')[0],
                totalAmount: 245.75,
                items: [
                    { name: 'Water Trough', amount: 125.00 },
                    { name: 'Feeding System', amount: 120.75 }
                ],
                reference: 'EQP-' + Math.floor(Math.random() * 10000)
            };
            
            this.populateFormFromReceipt(mockData, 
                new File([], this.receiptPreview.filename), 
                this.receiptPreview.dataUrl
            );
        }, 1500);
    },

    // TRANSACTION METHODS
    showAddIncome() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'income';
        document.getElementById('transaction-category').value = 'sales';
        document.getElementById('transaction-modal-title').textContent = 'Add Income';
    },

    showAddExpense() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'expense';
        document.getElementById('transaction-category').value = 'feed';
        document.getElementById('transaction-modal-title').textContent = 'Add Expense';
    },

    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction) return;
        
        this.currentEditingId = transactionId;
        
        // Populate form
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-payment').value = transaction.paymentMethod || 'cash';
        document.getElementById('transaction-reference').value = transaction.reference || '';
        document.getElementById('transaction-notes').value = transaction.notes || '';
        document.getElementById('delete-transaction').style.display = 'block';
        document.getElementById('transaction-modal-title').textContent = 'Edit Transaction';
        
        // Handle receipt if exists
        if (transaction.receipt) {
            this.receiptPreview = transaction.receipt;
            this.showReceiptPreview();
        }
    },

    saveTransaction() {
        const form = document.getElementById('transaction-form');
        if (!form) return;
        
        // Get form data
        const transactionData = {
            id: this.currentEditingId || Date.now(),
            date: document.getElementById('transaction-date').value,
            type: document.getElementById('transaction-type').value,
            category: document.getElementById('transaction-category').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            description: document.getElementById('transaction-description').value.trim(),
            paymentMethod: document.getElementById('transaction-payment').value,
            reference: document.getElementById('transaction-reference').value.trim(),
            notes: document.getElementById('transaction-notes').value.trim(),
            receipt: this.receiptPreview || null
        };
        
        // Validate
        if (!transactionData.date || !transactionData.amount || !transactionData.description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (transactionData.amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        // Save or update
        if (this.currentEditingId) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id == this.currentEditingId);
            if (index !== -1) {
                this.transactions[index] = transactionData;
                this.showNotification('Transaction updated successfully!', 'success');
            }
        } else {
            // Add new transaction
            this.transactions.unshift(transactionData);
            this.showNotification('Transaction saved successfully!', 'success');
        }
        
        // Save to localStorage
        this.saveData();
        
        // Update UI
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        
        // Close modal
        this.hideTransactionModal();
    },

    deleteTransaction() {
        const transactionId = document.getElementById('transaction-id').value;
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.deleteTransactionRecord(transactionId);
            this.hideTransactionModal();
        }
    },

    deleteTransactionRecord(transactionId) {
        this.transactions = this.transactions.filter(t => t.id != transactionId);
        this.saveData();
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.showNotification('Transaction deleted successfully', 'success');
    },

    viewReceipt(transactionId) {
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction || !transaction.receipt) return;
        
        // Open receipt in new tab
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${transaction.description}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .receipt-container { max-width: 600px; margin: 0 auto; }
                        .receipt-header { text-align: center; margin-bottom: 30px; }
                        .receipt-details { margin-bottom: 20px; }
                        .receipt-image { max-width: 100%; border: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="receipt-header">
                            <h1>Receipt</h1>
                            <p>${transaction.description}</p>
                        </div>
                        <div class="receipt-details">
                            <p><strong>Date:</strong> ${transaction.date}</p>
                            <p><strong>Amount:</strong> ${this.formatCurrency(transaction.amount)}</p>
                            <p><strong>Reference:</strong> ${transaction.reference || 'N/A'}</p>
                        </div>
                        <img src="${transaction.receipt.dataUrl}" alt="Receipt" class="receipt-image">
                    </div>
                </body>
            </html>
        `);
        receiptWindow.document.close();
    },

    filterTransactions(filter) {
        let filtered = this.transactions;
        
        if (filter === 'income') {
            filtered = this.transactions.filter(t => t.type === 'income');
        } else if (filter === 'expense') {
            filtered = this.transactions.filter(t => t.type === 'expense');
        }
        
        const recent = filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
        document.getElementById('transactions-list').innerHTML = this.renderTransactionsList(recent);
    },

    // REPORT METHODS (similar to other modules)
    generateFinancialReport() {
        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(20);
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">💰 Financial Report</h4>';
        
        // Add report content similar to other modules
        // ... (implement financial report content)
        
        report += '</div>';
        
        document.getElementById('financial-report-content').innerHTML = report;
        document.getElementById('financial-report-title').textContent = 'Financial Report';
        this.showFinancialReportModal();
    },

    generateCategoryAnalysis() {
        // Implement category analysis
        // ... (similar to other modules)
    },

    // UTILITY METHODS
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getCategoryIcon(category) {
        const icons = {
            'sales': '💰', 'services': '🛠️', 'grants': '🏛️', 'other-income': '💼',
            'feed': '🌾', 'medical': '💊', 'equipment': '🔧', 'labor': '👷',
            'utilities': '⚡', 'maintenance': '🔨', 'transport': '🚚', 'marketing': '📢',
            'other-expense': '📦'
        };
        return icons[category] || '📦';
    },

    formatCategory(category) {
        const names = {
            'sales': 'Sales', 'services': 'Services', 'grants': 'Grants', 'other-income': 'Other Income',
            'feed': 'Feed', 'medical': 'Medical', 'equipment': 'Equipment', 'labor': 'Labor',
            'utilities': 'Utilities', 'maintenance': 'Maintenance', 'transport': 'Transport',
            'marketing': 'Marketing', 'other-expense': 'Other Expenses'
        };
        return names[category] || category;
    },

    updateStats() {
        const stats = this.calculateStats();
        this.updateElement('total-income', this.formatCurrency(stats.totalIncome));
        this.updateElement('total-expenses', this.formatCurrency(stats.totalExpenses));
        this.updateElement('net-income', this.formatCurrency(stats.netIncome));
    },

    updateTransactionsList() {
        const recent = this.getRecentTransactions(10);
        document.getElementById('transactions-list').innerHTML = this.renderTransactionsList(recent);
    },

    updateCategoryBreakdown() {
        document.getElementById('category-breakdown').innerHTML = this.renderCategoryBreakdown();
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    },

    exportTransactions() {
        const csv = this.convertToCSV(this.transactions);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Transactions exported successfully!', 'success');
    },

    convertToCSV(transactions) {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference', 'Notes'];
        const rows = transactions.map(transaction => [
            transaction.date,
            transaction.type,
            this.formatCategory(transaction.category),
            transaction.description,
            transaction.amount,
            transaction.paymentMethod || '',
            transaction.reference || '',
            transaction.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with receipt upload feature');
}
