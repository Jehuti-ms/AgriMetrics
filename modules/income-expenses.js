// modules/income-expenses.js - FIXED AWAIT ERROR
console.log('💰 Loading Income & Expenses module...');

const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {}
};

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    categories: ['feed', 'medical', 'equipment', 'labor', 'utilities', 'sales', 'other'],
    currentEditingId: null,
    receiptQueue: [],
    cameraStream: null,
    receiptPreview: null,
    isFirebaseAvailable: false,
    currentUploadTask: null,
    cameraFacingMode: 'environment',
    lastSwitchClick: 0,

    // ==================== INITIALIZATION ====================
   initialize() {
    console.log('💰 Initializing Income & Expenses...');
    
    this.element = document.getElementById('content-area');
    if (!this.element) {
        console.error('Content area element not found');
        return false;
    }

    // Check if Firebase services are available
    this.isFirebaseAvailable = !!(window.db && window.storage);
    console.log('Firebase available:', this.isFirebaseAvailable, {
        db: !!window.db,
        storage: !!window.storage,
        firebase: !!window.firebase
    });

    if (window.StyleManager) {
        StyleManager.registerModule(this.name, this.element, this);
    }

    this.loadData();
    this.cleanupBrokenReceipts();
    this.loadReceiptsFromFirebase();
    this.renderModule();
    this.initialized = true;
    
    console.log('✅ Income & Expenses initialized');
    return true;
},

    onThemeChange(theme) {
        console.log(`Income & Expenses updating for theme: ${theme}`);
    },
    
    // ==================== DATA MANAGEMENT ====================
    loadData() {
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
        console.log('Loaded transactions:', this.transactions.length);
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
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
            }
        ];
    },

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
                /* Firebase Receipt Styles */
                .import-receipts-container { padding: 20px; }
                .section-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
                .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .card-button { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .card-button:hover { transform: translateY(-2px); border-color: var(--primary-color); background: var(--primary-color)10; }
                .card-button:disabled { opacity: 0.5; cursor: not-allowed; }
                .card-icon { font-size: 32px; margin-bottom: 4px; }
                .card-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
                .card-subtitle { font-size: 12px; color: var(--text-secondary); }
                
                .camera-section .glass-card { margin-bottom: 24px; }
                .camera-preview { width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
                .camera-preview video { width: 100%; height: 100%; object-fit: cover; }
                .camera-controls { display: flex; gap: 12px; justify-content: center; }
                
                .upload-area { border: 2px dashed var(--glass-border); border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
                .upload-area.drag-over { border-color: var(--primary-color); background: var(--primary-color)10; }
                .upload-icon { font-size: 48px; margin-bottom: 16px; }
                .upload-subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 8px; }
                .upload-formats { color: var(--text-secondary); font-size: 12px; margin-bottom: 20px; }
                
                .upload-progress { background: var(--glass-bg); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .progress-info h4 { font-size: 14px; color: var(--text-primary); margin-bottom: 12px; }
                .progress-container { width: 100%; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
                .progress-bar { height: 100%; background: var(--primary-color); width: 0%; transition: width 0.3s; }
                .progress-details { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); }
                
                .receipts-grid { display: flex; flex-direction: column; gap: 12px; }
                .receipt-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px; }
                .receipt-preview img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
                .receipt-info { flex: 1; }
                .receipt-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
                .receipt-meta { display: flex; gap: 8px; font-size: 12px; color: var(--text-secondary); }
                .receipt-status { font-weight: 600; }
                .status-pending { color: #f59e0b; }
                .status-processed { color: #10b981; }
                .status-error { color: #ef4444; }
                
                .empty-state { text-align: center; padding: 40px 20px; }
                .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; }
                
                .receipt-queue-badge { background: #ef4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 12px; margin-left: 8px; }
                .firebase-badge { background: #ffa000; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; margin-left: 4px; }
                
                /* Spinner Animation */
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spinner { width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
                
                /* Make button children not interfere with clicks */
                #upload-receipt-btn * { pointer-events: none; }
                .firebase-badge, .receipt-queue-badge { pointer-events: none; }
                
                /* RECEIPT ATTACHMENT FIXES */
                #receipt-upload-area:hover {
                    border-color: var(--primary-color);
                    background: var(--primary-color)10;
                }
                
                #receipt-preview-container {
                    transition: all 0.3s ease;
                }
                
                #receipt-preview-container.hidden {
                    display: none !important;
                }
                
                #image-preview.hidden {
                    display: none !important;
                }
                
                /* Fix modal z-index */
                .popout-modal {
                    z-index: 9999;
                }
                
                /* Receipt preview styling */
                .receipt-preview-item {
                    background: var(--glass-bg);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    border: 1px solid var(--glass-border);
                }

                /* Camera specific fixes */
                .camera-section {
                    transition: all 0.3s ease;
                }
                
                .camera-preview {
                    width: 100%;
                    height: 300px;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 16px;
                    position: relative;
                }
                
                .camera-preview video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    background: #000;
                    display: block;
                }
                
                #camera-preview {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: #000 !important;
                }
                
                .camera-controls {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    padding: 16px;
                    flex-wrap: wrap;
                }
                
                #camera-status {
                    font-size: 14px;
                    color: var(--text-secondary);
                    padding: 4px 8px;
                    background: var(--glass-bg);
                    border-radius: 4px;
                }
                
                /* Ensure camera section is visible when shown */
                #camera-section[style*="display: block"] {
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
            </style>

            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Income & Expenses</h1>
                    <p class="module-subtitle">Track farm finances and cash flow</p>
                    <div class="header-actions">
                       <button class="btn btn-primary" id="add-transaction">
                            ➕ Add Transaction
                        </button>
                        <button class="btn btn-primary" id="upload-receipt-btn" style="display: flex; align-items: center; gap: 8px;">
                             📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span class="receipt-queue-badge" id="receipt-count-badge">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                <!-- Pending Receipts Section -->
                ${pendingReceipts.length > 0 ? `
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;" id="pending-receipts-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">📋 Pending Receipts (${pendingReceipts.length})</h3>
                            <div style="display: flex; gap: 12px;">
                                <button class="btn btn-outline" id="refresh-receipts-btn">
                                    <span class="btn-icon">🔄</span>
                                    <span class="btn-text">Refresh</span>
                                </button>
                                <button class="btn btn-primary" id="process-all-receipts">
                                    ⚡ Process All
                                </button>
                            </div>
                        </div>
                        <div id="pending-receipts-list">
                            ${this.renderPendingReceiptsList(pendingReceipts)}
                        </div>
                    </div>
                ` : ''}

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

            <!-- ==================== MODALS ==================== -->
            <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📥 Import Receipts ${this.isFirebaseAvailable ? '(Firebase)' : '(Local)'}</h3>
                        <button class="popout-modal-close" id="close-import-receipts">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="import-receipts-content">
                            <!-- Content loaded dynamically -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-outline" id="cancel-import-receipts">Cancel</button>
                        <button class="btn btn-primary" id="process-receipts-btn" style="display: none;">
                            <span class="btn-icon">⚡</span>
                            <span class="btn-text">Process Receipts</span>
                        </button>
                    </div>
                </div>
            </div>

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

                            <!-- Receipt Section -->
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Receipt (Optional)</label>
                                <div id="receipt-upload-area" style="border: 2px dashed var(--glass-border); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; margin-bottom: 12px;">
                                    <div style="font-size: 48px; margin-bottom: 8px;">📄</div>
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Attach Receipt</div>
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
                                    
                                    <!-- Process Button -->
                                    <button type="button" id="process-receipt-btn" class="btn-outline" style="width: 100%; margin-top: 8px;">
                                        🔍 Extract Information from Receipt
                                    </button>
                                </div>
                            </div>

                            <!-- OCR Results -->
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
        `;

        this.setupEventListeners();
        this.setupReceiptFormHandlers();
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Main buttons
        this.setupButton('add-transaction', () => this.showTransactionModal());
        
        const uploadReceiptBtn = document.getElementById('upload-receipt-btn');
        if (uploadReceiptBtn) {
            console.log('Adding click listener to upload-receipt-btn');
            uploadReceiptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showImportReceiptsModal();
                return false;
            });
        }
                
        // Quick actions
        this.setupButton('add-income-btn', () => this.showAddIncome());
        this.setupButton('add-expense-btn', () => this.showAddExpense());
        this.setupButton('financial-report-btn', () => this.generateFinancialReport());
        this.setupButton('category-analysis-btn', () => this.generateCategoryAnalysis());
        
        // Transaction modal
        this.setupButton('save-transaction', () => this.saveTransaction());
        this.setupButton('delete-transaction', () => this.deleteTransaction());
        this.setupButton('cancel-transaction', () => this.hideTransactionModal());
        this.setupButton('close-transaction-modal', () => this.hideTransactionModal());
        
        // Import receipts modal
        this.setupButton('close-import-receipts', () => this.hideImportReceiptsModal());
        this.setupButton('cancel-import-receipts', () => this.hideImportReceiptsModal());
        
        // Refresh receipts
        this.setupButton('refresh-receipts-btn', () => this.loadReceiptsFromFirebase());
        this.setupButton('process-all-receipts', () => this.processPendingReceipts());
        
        // Other buttons
        this.setupButton('export-transactions', () => this.exportTransactions());
        
        // Filter
        const transactionFilter = document.getElementById('transaction-filter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', (e) => {
                this.filterTransactions(e.target.value);
            });
        }
        
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
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });
    },

    // ==================== FIXED: LOAD RECEIPTS FROM FIREBASE ====================
    loadReceiptsFromFirebase() {
        console.log('Loading receipts from Firebase...');
        
        // Create a helper function that handles async operations
        const loadData = () => {
            try {
                if (this.isFirebaseAvailable && window.db) {
                    // Load from Firebase - using then/catch instead of async/await
                    const receiptsRef = window.db.collection('receipts');
                    receiptsRef
                        .where('status', '==', 'pending')
                        .orderBy('uploadedAt', 'desc')
                        .limit(10)
                        .get()
                        .then(snapshot => {
                            this.receiptQueue = [];
                            snapshot.forEach(doc => {
                                this.receiptQueue.push(doc.data());
                            });
                            
                            console.log('Loaded receipts from Firebase:', this.receiptQueue.length);
                            this.updateReceiptQueueUI();
                        })
                        .catch(error => {
                            console.error('Error loading from Firebase:', error);
                            this.loadFromLocalStorage();
                        });
                } else {
                    this.loadFromLocalStorage();
                }
            } catch (error) {
                console.error('Error in loadReceiptsFromFirebase:', error);
                this.loadFromLocalStorage();
            }
        };
        
        // Call the helper function
        loadData();
    },

    loadFromLocalStorage() {
        // Load from localStorage and fix broken blob URLs
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        
        // Filter out broken blob URLs
        this.receiptQueue = localReceipts.filter(r => {
            if (r.downloadURL && r.downloadURL.startsWith('blob:')) {
                console.warn('Skipping broken blob URL receipt:', r.name);
                return false;
            }
            return r.status === 'pending';
        });
        
        console.log('Loaded receipts from localStorage:', this.receiptQueue.length);
        
        // Clean up localStorage by removing broken receipts
        const validReceipts = localReceipts.filter(r => !r.downloadURL?.startsWith('blob:'));
        if (validReceipts.length !== localReceipts.length) {
            localStorage.setItem('local-receipts', JSON.stringify(validReceipts));
            console.log('Cleaned up broken blob URLs from localStorage');
        }
        
        this.updateReceiptQueueUI();
    },

   // ==================== CAMERA METHODS ====================
initializeCamera() {
    console.log('📷 Initializing camera...');
    
    try {
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('❌ Camera preview element not found');
            this.showNotification('Camera preview element missing', 'error');
            this.showUploadInterface();
            return;
        }
        
        // Clear any existing video
        video.srcObject = null;
        
        // Stop any existing stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        if (status) status.textContent = 'Requesting camera...';
        
        // Camera constraints
        const constraints = {
            video: {
                facingMode: this.cameraFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('✅ Camera access granted');
                this.cameraStream = stream;
                video.srcObject = stream;
                
                // Wait for video to be ready
                video.onloadedmetadata = () => {
                    video.play().then(() => {
                        console.log('📹 Video is playing');
                        if (status) {
                            status.textContent = this.cameraFacingMode === 'user' ? 'Front Camera' : 'Rear Camera';
                        }
                    }).catch(error => {
                        console.error('❌ Video play error:', error);
                        if (status) status.textContent = 'Playback error';
                    });
                };
                
                // Update switch button
                const switchBtn = document.getElementById('switch-camera');
                if (switchBtn) {
                    const nextMode = this.cameraFacingMode === 'user' ? 'Rear' : 'Front';
                    switchBtn.innerHTML = `
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Switch to ${nextMode} Camera</span>
                    `;
                }
            })
            .catch(error => {
                console.error('❌ Camera error:', error.name, error.message);
                
                if (status) status.textContent = 'Camera Error';
                
                // Fallback: try without facing mode constraints
                console.log('🔄 Trying fallback camera...');
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(stream => {
                    this.cameraStream = stream;
                    video.srcObject = stream;
                    
                    if (status) status.textContent = 'Camera Ready';
                    
                    // Hide switch button since we can't control facing mode
                    const switchBtn = document.getElementById('switch-camera');
                    if (switchBtn) switchBtn.style.display = 'none';
                })
                .catch(fallbackError => {
                    console.error('❌ Fallback camera error:', fallbackError);
                    this.showNotification('Camera access denied. Please upload files instead.', 'error');
                    this.showUploadInterface();
                });
            });
            
    } catch (error) {
        console.error('🚨 Camera initialization error:', error);
        this.showNotification('Camera initialization failed', 'error');
        this.showUploadInterface();
    }
},

// ==================== CAMERA MANAGEMENT METHODS ====================
capturePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const status = document.getElementById('camera-status');
    
    if (!video || !canvas) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    canvas.toBlob((blob) => {
        if (blob) {
            if (status) status.textContent = 'Processing photo...';
            
            // Create file object
            const file = new File([blob], `receipt_${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            
            // Upload receipt
            this.uploadReceiptToFirebase(file)
                .then(() => {
                    if (status) status.textContent = 'Photo captured!';
                    this.showNotification('Receipt photo captured!', 'success');
                    
                    // Switch back to upload interface
                    setTimeout(() => {
                        this.stopCamera();
                        const cameraSection = document.getElementById('camera-section');
                        const uploadSection = document.getElementById('upload-section');
                        const recentSection = document.getElementById('recent-section');
                        
                        if (cameraSection) cameraSection.style.display = 'none';
                        if (uploadSection) uploadSection.style.display = 'block';
                        if (recentSection) recentSection.style.display = 'block';
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error uploading photo:', error);
                    this.showNotification('Failed to upload photo', 'error');
                });
        }
    }, 'image/jpeg', 0.9);
},

stopCamera() {
    console.log('🛑 Stopping camera...');
    
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => {
            console.log('📹 Stopping track:', track.kind);
            track.stop();
        });
        this.cameraStream = null;
    }
    
    const video = document.getElementById('camera-preview');
    if (video) {
        video.srcObject = null;
        video.pause();
    }
    
    console.log('✅ Camera stopped');
},

showUploadInterface() {
    console.log('📤 Showing upload interface...');
    
    // Stop camera if active
    this.stopCamera();
    
    // Get all sections
    const uploadSection = document.getElementById('upload-section');
    const cameraSection = document.getElementById('camera-section');
    const recentSection = document.getElementById('recent-section');
    
    // Show upload, hide camera
    if (uploadSection) {
        uploadSection.style.display = 'block';
        console.log('✅ Upload section shown');
    }
    
    if (cameraSection) {
        cameraSection.style.display = 'none';
        console.log('✅ Camera section hidden');
    }
    
    // Show recent section only if there are receipts
    if (recentSection) {
        if (this.receiptQueue.length > 0) {
            recentSection.style.display = 'block';
            console.log('✅ Recent section shown (has receipts)');
        } else {
            recentSection.style.display = 'none';
            console.log('✅ Recent section hidden (no receipts)');
        }
    }
    
    console.log('✅ Upload interface shown');
},

switchCamera() {
    console.log('🔄 Switching camera...');
    
    // Debounce to prevent rapid clicks
    const now = Date.now();
    if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1500) {
        console.log('⏳ Please wait before switching camera again');
        return;
    }
    this.lastSwitchClick = now;
    
    // Toggle camera facing mode
    this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
    
    // Update status
    const status = document.getElementById('camera-status');
    if (status) {
        status.textContent = 'Switching...';
    }
    
    // Stop and restart camera with new facing mode
    this.stopCamera();
    
    setTimeout(() => {
        this.initializeCamera();
    }, 300);
},

showUploadInterfaceFromCamera() {
    console.log('📤 Switching from camera to upload...');
    
    // Clear status
    const status = document.getElementById('camera-status');
    if (status) status.textContent = 'Ready';
    
    // Stop camera
    this.stopCamera();
    
    // Hide camera, show upload and recent
    const cameraSection = document.getElementById('camera-section');
    const uploadSection = document.getElementById('upload-section');
    const recentSection = document.getElementById('recent-section');
    
    if (cameraSection) {
        cameraSection.style.display = 'none';
        console.log('✅ Camera section hidden');
    }
    
    if (uploadSection) {
        uploadSection.style.display = 'block';
        console.log('✅ Upload section shown');
    }
    
    if (recentSection) {
        recentSection.style.display = this.receiptQueue.length > 0 ? 'block' : 'none';
        console.log(`✅ Recent section ${this.receiptQueue.length > 0 ? 'shown' : 'hidden'}`);
    }
},

    debugCamera() {
    console.log('🔍 Camera Debug:');
    
    const sections = ['camera-section', 'upload-section', 'recent-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}:`, {
            exists: !!el,
            display: el?.style?.display,
            computedDisplay: el ? window.getComputedStyle(el).display : 'N/A',
            inDOM: el?.parentNode ? true : false
        });
    });
    
    const video = document.getElementById('camera-preview');
    if (video) {
        console.log('📹 Video:', {
            hasStream: !!video.srcObject,
            playing: !video.paused,
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        });
    }
},
    
// ==================== MODAL CONTROL METHODS ====================
showImportReceiptsModal() {
    console.log('=== SHOW IMPORT RECEIPTS MODAL ===');
    
    // Hide all other modals
    this.hideAllModals();
    
    // Get or create modal
    let modal = document.getElementById('import-receipts-modal');
    if (!modal) {
        console.error('Modal not found in DOM!');
        return;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Update content
    const content = document.getElementById('import-receipts-content');
    if (content) {
        content.innerHTML = this.renderImportReceiptsModal();
    }
    
    // Setup handlers
    this.setupImportReceiptsHandlers();
    
    // Setup DIRECT upload handlers after a short delay
    setTimeout(() => {
        const dropArea = document.getElementById('drop-area');
        const browseBtn = document.getElementById('browse-receipts-btn');
        
        if (dropArea) {
            console.log('✅ Adding direct click handler to upload area');
            dropArea.onclick = () => {
                console.log('📁 Direct click on upload area');
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.jpg,.jpeg,.png,.pdf';
                input.onchange = (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        console.log('📁 Files selected via direct handler:', e.target.files.length);
                        this.handleFileUpload(e.target.files);
                    }
                };
                input.click();
            };
        }
        
        if (browseBtn) {
            console.log('✅ Adding direct click handler to browse button');
            browseBtn.onclick = (e) => {
                e.stopPropagation();
                console.log('📁 Direct click on browse button');
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.jpg,.jpeg,.png,.pdf';
                input.onchange = (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        console.log('📁 Files selected via button handler:', e.target.files.length);
                        this.handleFileUpload(e.target.files);
                    }
                };
                input.click();
            };
        }
        
        // Also setup drag and drop
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
                console.log('📁 Files dropped:', e.dataTransfer.files?.length || 0);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });
        }
    }, 100);
    
    console.log('✅ Modal should now be visible');
},

renderImportReceiptsModal() {
    return `
        <div class="import-receipts-container">
            <!-- Quick Options -->
            <div class="quick-actions-section">
                <h2 class="section-title">Upload Method</h2>
                <div class="card-grid">
                    <button class="card-button" id="camera-option">
                        <div class="card-icon">📷</div>
                        <span class="card-title">Take Photo</span>
                        <span class="card-subtitle">Use camera</span>
                    </button>
                    <button class="card-button" id="upload-option">
                        <div class="card-icon">📁</div>
                        <span class="card-title">Upload Files</span>
                        <span class="card-subtitle">From device</span>
                    </button>
                </div>
            </div>
            
            <!-- Upload Area (Always visible by default) -->
            <div class="upload-section" id="upload-section" style="display: block;">
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
                        <div class="upload-area" id="drop-area" onclick="document.getElementById('receipt-upload-input')?.click();">
                    </div>
                    
                    <!-- Upload Progress -->
                    <div class="upload-progress" id="upload-progress" style="display: none;">
                        <div class="progress-info">
                            <h4>Uploading...</h4>
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
                            <span class="btn-text">Capture</span>
                        </button>
                        <button class="btn btn-outline" id="cancel-camera">
                            <span class="btn-icon">✖️</span>
                            <span class="btn-text">Cancel</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Recent Receipts Section -->
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
    `;
},
    
setupImportReceiptsHandlers() {
    console.log('Setting up import receipt handlers');
    
   // Camera option - FIXED VERSION
this.setupButton('camera-option', () => {
    console.log('🎯 Button #camera-option clicked');
    
    // Get all sections
    const cameraSection = document.getElementById('camera-section');
    const uploadSection = document.getElementById('upload-section');
    const recentSection = document.getElementById('recent-section');
    
    // Debug logging
    console.log('📊 Section states before:', {
        camera: cameraSection?.style.display,
        upload: uploadSection?.style.display,
        recent: recentSection?.style.display
    });
    
    // Show camera, hide everything else
    if (cameraSection) {
        cameraSection.style.display = 'block';
        cameraSection.style.visibility = 'visible';
        cameraSection.style.opacity = '1';
        console.log('✅ Camera section shown');
    }
    
    if (uploadSection) {
        uploadSection.style.display = 'none';
        console.log('✅ Upload section hidden');
    }
    
    if (recentSection) {
        recentSection.style.display = 'none';
        console.log('✅ Recent section hidden');
    }
    
    // Set camera mode and initialize
    this.cameraFacingMode = 'environment'; // Use back camera by default
    
    // Stop any existing camera
    this.stopCamera();
    
    // Initialize camera immediately, not after delay
    setTimeout(() => {
        this.initializeCamera();
    }, 50); // Small delay to ensure DOM is updated
});

    // Upload option
this.setupButton('upload-option', () => {
    console.log('🎯 Button #upload-option clicked');
    this.showUploadInterface();
});
               
    // Camera controls
    this.setupButton('capture-photo', () => this.capturePhoto());
    this.setupButton('switch-camera', () => this.switchCamera());
    this.setupButton('cancel-camera', () => {
    console.log('❌ Cancel camera clicked');
    this.showUploadInterface();
});
    
    // Refresh receipts button
    this.setupButton('refresh-receipts', () => {
        console.log('🔄 Refresh receipts clicked');
        this.loadReceiptsFromFirebase();
        const recentList = document.getElementById('recent-receipts-list');
        if (recentList) {
            recentList.innerHTML = this.renderRecentReceiptsList();
        }
        this.showNotification('Receipts list refreshed', 'success');
    });
},
    
    // ==================== UPLOAD HANDLERS SETUP ====================
setupUploadHandlers() {
    console.log('🔧 Setting up upload handlers...');
    
    // Browse receipts button - SIMPLIFIED DIRECT APPROACH
    const browseBtn = document.getElementById('browse-receipts-btn');
    if (browseBtn) {
        console.log('✅ Found browse button, setting up direct click handler');
        
        // Remove old listener and add new one
        const newBrowseBtn = browseBtn.cloneNode(true);
        browseBtn.parentNode.replaceChild(newBrowseBtn, browseBtn);
        
        newBrowseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 DIRECT: Browse button clicked');
            
            const fileInput = document.getElementById('receipt-upload-input');
            if (fileInput) {
                console.log('📁 DIRECT: Clicking file input');
                fileInput.click();
            } else {
                console.error('❌ File input not found');
                // Create a file input if it doesn't exist
                this.createFileInput();
            }
        });
    } else {
        console.error('❌ Browse button not found in setupUploadHandlers');
    }
    
    // File input handler - SIMPLIFIED
    const fileInput = document.getElementById('receipt-upload-input');
    if (fileInput) {
        console.log('✅ Found file input, setting up change handler');
        
        // Remove old handler
        fileInput.onchange = null;
        
        // Add new handler
        fileInput.addEventListener('change', (e) => {
            console.log('📁 FILE INPUT: Files selected:', e.target.files?.length || 0);
            if (e.target.files && e.target.files.length > 0) {
                console.log('📁 Starting upload of', e.target.files.length, 'files');
                this.handleFileUpload(e.target.files);
            } else {
                console.log('📁 No files selected');
            }
        });
    }
    
    // Drag and drop area
    const dropArea = document.getElementById('drop-area');
    if (dropArea) {
        console.log('✅ Found drop area');
        
        // Add drag and drop listeners
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
            console.log('📁 Files dropped:', e.dataTransfer.files?.length || 0);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files);
            }
        });
    }
},

// Add this helper method if file input doesn't exist
createFileInput() {
    console.log('🔧 Creating file input');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'receipt-upload-input';
    fileInput.multiple = true;
    fileInput.accept = '.jpg,.jpeg,.png,.pdf';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
        console.log('📁 Created file input: Files selected:', e.target.files?.length || 0);
        if (e.target.files && e.target.files.length > 0) {
            this.handleFileUpload(e.target.files);
        }
    });
    
    document.body.appendChild(fileInput);
    return fileInput;
},
    
showTransactionModal(transactionId = null) {
    this.hideAllModals();
    const modal = document.getElementById('transaction-modal');
    if (modal) modal.classList.remove('hidden');
    this.currentEditingId = transactionId;
    
    const form = document.getElementById('transaction-form');
    if (form) {
        form.reset();
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        const deleteBtn = document.getElementById('delete-transaction');
        if (deleteBtn) deleteBtn.style.display = 'none';
        const title = document.getElementById('transaction-modal-title');
        if (title) title.textContent = 'Add Transaction';
        this.clearReceiptPreview();
        const ocrResults = document.getElementById('ocr-results');
        if (ocrResults) ocrResults.classList.add('hidden');
        
        if (transactionId) {
            setTimeout(() => this.editTransaction(transactionId), 50);
        }
    }
},

hideTransactionModal() {
    const modal = document.getElementById('transaction-modal');
    if (modal) modal.classList.add('hidden');
    this.currentEditingId = null;
    this.receiptPreview = null;
    this.clearReceiptPreview();
    const form = document.getElementById('transaction-form');
    if (form) form.reset();
},

hideImportReceiptsModal() {
    const modal = document.getElementById('import-receipts-modal');
    if (modal) modal.classList.add('hidden');
    this.stopCamera();
},

hideAllModals() {
    this.hideTransactionModal();
    this.hideImportReceiptsModal();
    const scannerModal = document.getElementById('receipt-scanner-modal');
    if (scannerModal) scannerModal.classList.add('hidden');
    const reportModal = document.getElementById('financial-report-modal');
    if (reportModal) reportModal.classList.add('hidden');
},

// ==================== TRANSACTION METHODS ====================
showAddIncome() {
    this.showTransactionModal();
    const typeSelect = document.getElementById('transaction-type');
    if (typeSelect) typeSelect.value = 'income';
    const categorySelect = document.getElementById('transaction-category');
    if (categorySelect) categorySelect.value = 'sales';
    const title = document.getElementById('transaction-modal-title');
    if (title) title.textContent = 'Add Income';
},

showAddExpense() {
    this.showTransactionModal();
    const typeSelect = document.getElementById('transaction-type');
    if (typeSelect) typeSelect.value = 'expense';
    const categorySelect = document.getElementById('transaction-category');
    if (categorySelect) categorySelect.value = 'feed';
    const title = document.getElementById('transaction-modal-title');
    if (title) title.textContent = 'Add Expense';
},

saveTransaction() {
    console.log('Saving transaction...');
    
    // Get form values
    const id = document.getElementById('transaction-id')?.value || Date.now();
    const date = document.getElementById('transaction-date')?.value;
    const type = document.getElementById('transaction-type')?.value;
    const category = document.getElementById('transaction-category')?.value;
    const amount = parseFloat(document.getElementById('transaction-amount')?.value || 0);
    const description = document.getElementById('transaction-description')?.value || '';
    const paymentMethod = document.getElementById('transaction-payment')?.value || 'cash';
    const reference = document.getElementById('transaction-reference')?.value || '';
    const notes = document.getElementById('transaction-notes')?.value || '';
    
    // Validate
    if (!date || !type || !category || !amount || !description) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        this.showNotification('Amount must be greater than 0', 'error');
        return;
    }
    
    // Create receipt object with proper structure
    let receiptData = null;
    if (this.receiptPreview) {
        receiptData = {
            id: this.receiptPreview.id,
            name: this.receiptPreview.name,
            downloadURL: this.receiptPreview.downloadURL,
            size: this.receiptPreview.size,
            type: this.receiptPreview.type,
            uploadedAt: this.receiptPreview.uploadedAt,
            status: 'attached'
        };
    }
    
    const transactionData = {
        id: parseInt(id),
        date,
        type,
        category,
        amount,
        description,
        paymentMethod,
        reference,
        notes,
        receipt: receiptData
    };
    
    // Check if editing existing transaction
    const existingIndex = this.transactions.findIndex(t => t.id == id);
    if (existingIndex > -1) {
        // Update existing
        const oldTransaction = this.transactions[existingIndex];
        this.transactions[existingIndex] = transactionData;
        
        // Broadcast update
        Broadcaster.recordUpdated('income-expenses', {
            id: transactionData.id,
            oldData: oldTransaction,
            newData: transactionData,
            timestamp: new Date().toISOString()
        });
        
        this.showNotification('Transaction updated successfully!', 'success');
    } else {
        // Add new
        transactionData.id = transactionData.id || Date.now();
        this.transactions.unshift(transactionData);
        
        // Broadcast creation
        Broadcaster.recordCreated('income-expenses', {
            ...transactionData,
            timestamp: new Date().toISOString(),
            module: 'income-expenses',
            action: 'transaction_created'
        });
        
        this.showNotification('Transaction saved successfully!', 'success');
    }
    
    // If this was from a pending receipt, mark it as processed
    if (this.receiptPreview?.id && this.receiptPreview.id.startsWith('receipt_')) {
        this.markReceiptAsProcessed(this.receiptPreview.id);
    }
    
    // Save to localStorage
    this.saveData();
    
    // Clear receipt preview after saving
    this.receiptPreview = null;
    
    // Update UI
    this.updateStats();
    this.updateTransactionsList();
    this.updateCategoryBreakdown();
    
    // Close modal
    this.hideTransactionModal();
},

editTransaction(transactionId) {
    console.log('Editing transaction:', transactionId);
    const transaction = this.transactions.find(t => t.id == transactionId);
    if (!transaction) {
        this.showNotification('Transaction not found', 'error');
        return;
    }
    
    // Populate form
    const idInput = document.getElementById('transaction-id');
    if (idInput) idInput.value = transaction.id;
    
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) dateInput.value = transaction.date;
    
    const typeSelect = document.getElementById('transaction-type');
    if (typeSelect) typeSelect.value = transaction.type;
    
    const categorySelect = document.getElementById('transaction-category');
    if (categorySelect) categorySelect.value = transaction.category;
    
    const amountInput = document.getElementById('transaction-amount');
    if (amountInput) amountInput.value = transaction.amount;
    
    const descriptionInput = document.getElementById('transaction-description');
    if (descriptionInput) descriptionInput.value = transaction.description;
    
    const paymentSelect = document.getElementById('transaction-payment');
    if (paymentSelect) paymentSelect.value = transaction.paymentMethod || 'cash';
    
    const referenceInput = document.getElementById('transaction-reference');
    if (referenceInput) referenceInput.value = transaction.reference || '';
    
    const notesInput = document.getElementById('transaction-notes');
    if (notesInput) notesInput.value = transaction.notes || '';
    
    const deleteBtn = document.getElementById('delete-transaction');
    if (deleteBtn) deleteBtn.style.display = 'block';
    
    const title = document.getElementById('transaction-modal-title');
    if (title) title.textContent = 'Edit Transaction';
    
    // Handle receipt if exists
    if (transaction.receipt) {
        this.receiptPreview = transaction.receipt;
        this.showReceiptPreviewInTransactionModal(transaction.receipt);
    } else {
        this.receiptPreview = null;
        this.clearReceiptPreview();
    }
    
    // Show modal if not already visible
    const modal = document.getElementById('transaction-modal');
    if (modal && modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    }
},

deleteTransaction() {
    const transactionId = document.getElementById('transaction-id')?.value;
    if (!transactionId) {
        this.showNotification('No transaction selected', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this transaction?')) {
        this.deleteTransactionRecord(transactionId);
        this.hideTransactionModal();
    }
},

deleteTransactionRecord(transactionId) {
    const transaction = this.transactions.find(t => t.id == transactionId);
    if (!transaction) return;
    
    // Remove from array
    this.transactions = this.transactions.filter(t => t.id != transactionId);
    
    // Broadcast deletion
    Broadcaster.recordDeleted('income-expenses', {
        id: transactionId,
        data: transaction,
        timestamp: new Date().toISOString(),
        module: 'income-expenses',
        action: 'transaction_deleted'
    });
    
    // Save to localStorage
    this.saveData();
    
    // Update UI
    this.updateStats();
    this.updateTransactionsList();
    this.updateCategoryBreakdown();
    
    this.showNotification('Transaction deleted successfully', 'success');
},

// ==================== RECEIPT FORM HANDLERS ====================
setupReceiptFormHandlers() {
    console.log('Setting up receipt form handlers...');
    
    const uploadArea = document.getElementById('receipt-upload-area');
    const fileInput = document.getElementById('receipt-upload');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleTransactionReceiptUpload(e.target.files[0]);
            }
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'var(--primary-color)10';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--glass-border)';
            uploadArea.style.background = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--glass-border)';
            uploadArea.style.background = '';
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.handleTransactionReceiptUpload(e.dataTransfer.files[0]);
            }
        });
    }
    
    // Remove receipt button
    this.setupButton('remove-receipt', () => {
        this.receiptPreview = null;
        this.clearReceiptPreview();
        const fileInput = document.getElementById('receipt-upload');
        if (fileInput) fileInput.value = '';
    });
    
    // Process receipt button (OCR)
    this.setupButton('process-receipt-btn', () => {
        if (this.receiptPreview) {
            this.showOCRSuggestion(this.receiptPreview);
        } else {
            this.showNotification('Please attach a receipt first', 'warning');
        }
    });
},

// ==================== RECEIPT UPLOAD & PREVIEW METHODS ====================
handleTransactionReceiptUpload(file) {
    if (!this.isValidReceiptFile(file)) {
        this.showNotification('Invalid file. Please use JPG, PNG, or PDF under 10MB', 'error');
        return;
    }
    
    // Create a preview for the transaction form
    this.createReceiptPreview(file);
},

createReceiptPreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // Create receipt preview object
        this.receiptPreview = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            originalName: file.name,
            fileName: file.name,
            downloadURL: e.target.result, // Data URL
            size: file.size,
            type: file.type,
            status: 'pending',
            uploadedAt: new Date(),
            uploadedBy: 'local-user',
            metadata: {
                contentType: file.type,
                size: file.size
            }
        };
        
        // Show preview in form
        this.showReceiptPreviewInTransactionModal(this.receiptPreview);
        
        this.showNotification(`Receipt "${file.name}" attached`, 'success');
    };
    
    reader.onerror = () => {
        this.showNotification('Failed to read file', 'error');
    };
    
    reader.readAsDataURL(file);
},

showReceiptPreviewInTransactionModal(receipt) {
    const previewContainer = document.getElementById('receipt-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const receiptImage = document.getElementById('receipt-image-preview');
    const filename = document.getElementById('receipt-filename');
    const filesize = document.getElementById('receipt-size');
    
    if (!previewContainer || !filename || !filesize) return;
    
    previewContainer.classList.remove('hidden');
    filename.textContent = receipt.name;
    filesize.textContent = this.formatFileSize(receipt.size || 0);
    
    // Show image preview if it's an image
    if (receipt.type?.startsWith('image/') && receiptImage && imagePreview) {
        receiptImage.src = receipt.downloadURL;
        imagePreview.classList.remove('hidden');
    } else if (imagePreview) {
        imagePreview.classList.add('hidden');
    }
},

clearReceiptPreview() {
    const previewContainer = document.getElementById('receipt-preview-container');
    if (previewContainer) previewContainer.classList.add('hidden');
    
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) imagePreview.classList.add('hidden');
    
    const filename = document.getElementById('receipt-filename');
    if (filename) filename.textContent = 'receipt.jpg';
    
    const filesize = document.getElementById('receipt-size');
    if (filesize) filesize.textContent = '0 KB';
    
    const receiptImage = document.getElementById('receipt-image-preview');
    if (receiptImage) receiptImage.src = '';
    
    // Reset file input
    const fileInput = document.getElementById('receipt-upload');
    if (fileInput) fileInput.value = '';
},

// ==================== BULK FILE UPLOAD METHODS ====================
handleFileUpload(files) {
    console.log('=== HANDLE FILE UPLOAD CALLED ===');
    console.log('Files received:', files);
    console.log('Number of files:', files.length);
    
    if (!files || files.length === 0) {
        console.error('❌ No files provided');
        return;
    }
    
    // Show progress with cancel button
    const progressSection = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-percentage');
    const fileName = document.getElementById('upload-file-name');
    
    if (progressSection) {
        progressSection.style.display = 'block';
        progressSection.innerHTML = `
            <div class="progress-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4>Uploading...</h4>
                    <button class="btn btn-sm btn-outline" id="cancel-upload-btn" style="font-size: 12px;">
                        ❌ Cancel Upload
                    </button>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" id="upload-progress-bar"></div>
                </div>
                <div class="progress-details">
                    <span id="upload-file-name">-</span>
                    <span id="upload-percentage">0%</span>
                </div>
                <div id="upload-status" style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                    Preparing upload...
                </div>
            </div>
        `;
        
        // Add cancel button handler
        document.getElementById('cancel-upload-btn')?.addEventListener('click', () => {
            cancelled = true;
            if (this.currentUploadTask) {
                this.currentUploadTask.cancel();
                this.showNotification('Upload cancelled', 'warning');
            }
        });
    }
    
    // Upload each file
    const uploadNextFile = (index) => {
        if (cancelled || index >= files.length) {
            // Hide progress after completion
            setTimeout(() => {
                if (progressSection) {
                    progressSection.style.display = 'none';
                }
                if (progressBar) progressBar.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
                if (fileName) fileName.textContent = '-';
            }, 1000);
            
            if (!cancelled && processedFiles > 0) {
                this.showNotification(`${processedFiles} receipt(s) uploaded successfully!`, 'success');
                this.updateReceiptQueueUI();
            }
            
            // Reset upload task
            this.currentUploadTask = null;
            return;
        }
        
        const file = files[index];
        
        if (fileName) fileName.textContent = `Uploading: ${file.name}`;
        const statusElement = document.getElementById('upload-status');
        if (statusElement) statusElement.textContent = `Uploading ${processedFiles + 1} of ${totalFiles}: ${file.name}`;
        
        try {
            // Validate file before upload
            if (!this.isValidReceiptFile(file)) {
                this.showNotification(`Skipped ${file.name}: Invalid file type or size`, 'warning');
                uploadNextFile(index + 1);
                return;
            }
            
            // Upload with progress tracking
            this.uploadReceiptToFirebase(file, (progress) => {
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
            })
            .then(() => {
                processedFiles++;
                
                // Update overall progress
                const overallProgress = Math.round((processedFiles / totalFiles) * 100);
                if (progressBar) progressBar.style.width = `${overallProgress}%`;
                if (progressText) progressText.textContent = `${overallProgress}%`;
                
                // Upload next file
                uploadNextFile(index + 1);
            })
            .catch(error => {
                console.error('Upload error:', error);
                if (error.message.includes('cancelled')) {
                    this.showNotification('Upload cancelled', 'info');
                } else {
                    this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
                }
                uploadNextFile(index + 1);
            });
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
            uploadNextFile(index + 1);
        }
    };
    
    // Start uploading
    uploadNextFile(0);
},

uploadReceiptToFirebase(file, onProgress = null) {
    if (!file) {
        return Promise.reject(new Error('No file provided'));
    }
    
    // Validate file
    if (!this.isValidReceiptFile(file)) {
        return Promise.reject(new Error('Invalid file type or size (max 10MB, JPG/PNG/PDF only)'));
    }
    
    if (this.isFirebaseAvailable) {
        // Upload to Firebase with progress tracking
        return this.uploadToFirebase(file, onProgress);
    } else {
        // Store locally
        return this.storeReceiptLocally(file);
    }
},

storeReceiptLocally(file) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const receiptId = `local_${timestamp}`;
        const reader = new FileReader();
        
        reader.onload = () => {
            const receiptData = {
                id: receiptId,
                name: file.name,
                originalName: file.name,
                fileName: file.name,
                downloadURL: reader.result, // Data URL
                size: file.size,
                type: file.type,
                status: 'pending',
                uploadedAt: new Date(),
                uploadedBy: 'local-user',
                metadata: {
                    contentType: file.type,
                    size: file.size
                }
            };
            
            this.receiptQueue.push(receiptData);
            
            // Store in localStorage for persistence
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            localReceipts.push(receiptData);
            localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
            
            // Broadcast local receipt creation
            Broadcaster.recordCreated('income-expenses', {
                ...receiptData,
                timestamp: new Date().toISOString(),
                module: 'income-expenses',
                action: 'receipt_uploaded',
                storageType: 'local'
            });
            
            resolve(receiptData);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
},

// ==================== RECEIPT PROCESSING METHODS ====================
renderRecentReceiptsList() {
    if (this.receiptQueue.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <h4>No receipts found</h4>
                <p>Upload receipts to get started</p>
            </div>
        `;
    }
    
    return `
        <div class="receipts-grid">
            ${this.receiptQueue.slice(0, 5).map(receipt => `
                <div class="receipt-card" data-id="${receipt.id}">
                    <div class="receipt-preview">
                        ${receipt.type?.startsWith('image/') ? 
                            `<img src="${receipt.downloadURL}" alt="${receipt.name}" loading="lazy" style="max-width: 60px; max-height: 60px; border-radius: 4px;">` : 
                            `<div class="file-icon" style="font-size: 24px;">📄</div>`
                        }
                    </div>
                    <div class="receipt-info">
                        <div class="receipt-name">${receipt.name}</div>
                        <div class="receipt-meta">
                            <span class="receipt-size">${this.formatFileSize(receipt.size || 0)}</span>
                            <span class="receipt-status status-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline process-btn" data-id="${receipt.id}">
                        🔍 Extract Information from Receipt
                    </button>
                </div>
            `).join('')}
        </div>
    `;
},

renderPendingReceiptsList(receipts) {
    if (receipts.length === 0) {
        return `
            <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No pending receipts</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Upload receipts to get started</div>
            </div>
        `;
    }

    return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${receipts.map(receipt => `
                <div class="pending-receipt-item" data-id="${receipt.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                    <div class="receipt-info" style="display: flex; align-items: center; gap: 12px;">
                        <span class="receipt-icon" style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                        <div class="receipt-details">
                            <div class="receipt-name" style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${receipt.name}</div>
                            <div class="receipt-meta" style="font-size: 12px; color: var(--text-secondary); display: flex; gap: 8px; align-items: center;">
                                <span>${this.formatFileSize(receipt.size || 0)}</span>
                                <span>•</span>
                                <span class="receipt-status status-pending" style="color: #f59e0b;">Pending</span>
                                <span>•</span>
                                <span>${this.formatFirebaseTimestamp(receipt.uploadedAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="receipt-actions" style="display: flex; gap: 8px;">
                      <a href="${this.isValidReceiptURL(receipt.downloadURL) ? receipt.downloadURL : '#'}" 
                               target="_blank" 
                               class="btn btn-sm btn-outline" 
                               title="${this.isValidReceiptURL(receipt.downloadURL) ? 'View' : 'Receipt unavailable'}" 
                               style="padding: 6px 12px;"
                               onclick="${!this.isValidReceiptURL(receipt.downloadURL) ? 'event.preventDefault(); alert(\'Receipt file is no longer available. Please re-upload.\');' : ''}"> 
                        <span class="btn-icon">👁️</span>
                        </a>
                        <button class="btn btn-sm btn-primary process-receipt-btn" data-id="${receipt.id}" style="padding: 6px 12px;">
                            <span class="btn-icon">🔍</span>
                            <span class="btn-text">Process</span>
                        </button>
                        <button class="btn btn-sm btn-outline remove-receipt-btn" data-id="${receipt.id}" style="padding: 6px 12px;">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
},

updateReceiptQueueUI() {
    // Update badge
    const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
    const badge = document.getElementById('receipt-count-badge');
    
    if (pendingReceipts.length > 0) {
        if (!badge) {
            const uploadBtn = document.getElementById('upload-receipt-btn');
            if (uploadBtn) {
                uploadBtn.innerHTML += `<span class="receipt-queue-badge" id="receipt-count-badge">${pendingReceipts.length}</span>`;
            }
        } else {
            badge.textContent = pendingReceipts.length;
        }
        
        // Update pending section
        const pendingList = document.getElementById('pending-receipts-list');
        if (pendingList) {
            pendingList.innerHTML = this.renderPendingReceiptsList(pendingReceipts);
            this.setupReceiptActionListeners();
        }
    } else {
        if (badge) badge.remove();
        
        const pendingSection = document.getElementById('pending-receipts-section');
        if (pendingSection) {
            pendingSection.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No pending receipts</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Upload receipts to get started</div>
                </div>
            `;
        }
    }
},

setupReceiptActionListeners() {
    // Process buttons
    document.querySelectorAll('.process-receipt-btn, .process-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const receiptId = e.currentTarget.dataset.id;
            this.processSingleReceipt(receiptId);
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const receiptId = e.currentTarget.dataset.id;
            this.deleteReceipt(receiptId, true);
        });
    });
},

processSingleReceipt(receiptId) {
    const receipt = this.receiptQueue.find(r => r.id === receiptId);
    if (!receipt) {
        this.showNotification('Receipt not found', 'error');
        return;
    }
    
    this.showNotification(`Processing ${receipt.name}...`, 'info');
    
    // Close import modal if open
    this.hideImportReceiptsModal();
    
    // Create transaction from receipt
    this.showTransactionModal();
    
    // Pre-fill form with receipt data
    setTimeout(() => {
        this.prefillFromReceipt(receipt);
    }, 100);
},

prefillFromReceipt(receipt) {
    const form = document.getElementById('transaction-form');
    if (!form) return;
    
    // Set receipt data
    this.receiptPreview = receipt;
    
    // Show receipt preview
    const previewContainer = document.getElementById('receipt-preview-container');
    const imagePreview = document.getElementById('receipt-image-preview');
    const filename = document.getElementById('receipt-filename');
    const filesize = document.getElementById('receipt-size');
    
    if (previewContainer) {
        previewContainer.classList.remove('hidden');
        
        if (filename) filename.textContent = receipt.name;
        if (filesize) filesize.textContent = this.formatFileSize(receipt.size || 0);
        
        if (imagePreview && receipt.type?.startsWith('image/')) {
            imagePreview.src = receipt.downloadURL;
            imagePreview.style.display = 'block';
        }
    }
    
    // Auto-fill description
    const descriptionInput = document.getElementById('transaction-description');
    if (descriptionInput) {
        descriptionInput.value = `Receipt: ${receipt.name}`;
    }
    
    // Set today's date
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Suggest category
    const categoryInput = document.getElementById('transaction-category');
    if (categoryInput) {
        // Try to guess category from receipt name
        const name = receipt.name.toLowerCase();
        if (name.includes('feed')) categoryInput.value = 'feed';
        else if (name.includes('medical') || name.includes('vet')) categoryInput.value = 'medical';
        else if (name.includes('equipment')) categoryInput.value = 'equipment';
        else if (name.includes('utility') || name.includes('electric') || name.includes('water')) categoryInput.value = 'utilities';
        else if (name.includes('labor') || name.includes('salary') || name.includes('wage')) categoryInput.value = 'labor';
    }
    
    // Show OCR suggestion
    this.showOCRSuggestion(receipt);
},

showOCRSuggestion(receipt) {
    const ocrResults = document.getElementById('ocr-results');
    const ocrDetails = document.getElementById('ocr-details');
    
    if (ocrResults && ocrDetails) {
        ocrResults.classList.remove('hidden');
        ocrDetails.innerHTML = `
            <div style="margin-bottom: 8px;">
                <span style="font-weight: 600;">Source:</span>
                <span style="margin-left: 8px; color: #1e40af;">${receipt.name}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="font-weight: 600;">Uploaded:</span>
                <span style="margin-left: 8px; color: #1e40af;">${this.formatFirebaseTimestamp(receipt.uploadedAt)}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="font-weight: 600;">Status:</span>
                <span style="margin-left: 8px; color: #f59e0b;">Pending processing</span>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                <em>Fill in the transaction details and save to mark as processed</em>
            </div>
        `;
        
        // Setup apply button
        const useOCRBtn = document.getElementById('use-ocr-data');
        if (useOCRBtn) {
            useOCRBtn.onclick = () => {
                this.showNotification('Auto-extract coming soon. Please fill in the details manually.', 'info');
            };
        }
    }
},

processPendingReceipts() {
    const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
    
    if (pendingReceipts.length === 0) {
        this.showNotification('No pending receipts to process', 'info');
        return;
    }
    
    if (pendingReceipts.length === 1) {
        this.processSingleReceipt(pendingReceipts[0].id);
    } else {
        this.showNotification(`Open the Import Receipts modal to process ${pendingReceipts.length} receipts`, 'info');
        this.showImportReceiptsModal();
    }
},

deleteReceipt(receiptId, deleteFromStorage = true) {
    const receipt = this.receiptQueue.find(r => r.id === receiptId);
    if (!receipt) {
        this.showNotification('Receipt not found', 'error');
        return;
    }
    
    // Confirm deletion
    const confirmMessage = deleteFromStorage 
        ? 'Are you sure you want to delete this receipt? This will remove it from storage.'
        : 'Are you sure you want to remove this receipt from the queue?';
    
    if (!confirm(confirmMessage)) return;
    
    try {
        let deleteSuccessful = true;
        
        // Delete from storage if requested and available
        if (deleteFromStorage && receipt.fileName) {
            if (this.isFirebaseAvailable && window.storage) {
                // Try to delete from Firebase storage
                const storageRef = window.storage.ref();
                storageRef.child(receipt.fileName).delete()
                    .then(() => {
                        this.showNotification('Receipt deleted from storage', 'success');
                        
                        // Broadcast storage deletion
                        Broadcaster.recordDeleted('income-expenses', {
                            id: receiptId,
                            data: receipt,
                            timestamp: new Date().toISOString(),
                            module: 'income-expenses',
                            action: 'receipt_deleted_from_storage',
                            storageType: 'firebase'
                        });
                    })
                    .catch(storageError => {
                        console.error('Storage delete error:', storageError);
                        deleteSuccessful = false;
                        this.showNotification('Could not delete from storage (file might not exist)', 'warning');
                    });
            }
        }
        
        // Delete from Firestore if available
        if (this.isFirebaseAvailable && window.db) {
            window.db.collection('receipts').doc(receiptId).delete()
                .catch(firestoreError => {
                    console.error('Firestore delete error:', firestoreError);
                    // Don't fail the entire operation if Firestore delete fails
                });
        }
        
        // Delete from localStorage if it's a local receipt
        if (receipt.id.startsWith('local_')) {
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            const updatedReceipts = localReceipts.filter(r => r.id !== receiptId);
            localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
        }
        
        // Remove from local queue
        this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
        
        // Broadcast queue removal
        Broadcaster.recordDeleted('income-expenses', {
            id: receiptId,
            data: receipt,
            timestamp: new Date().toISOString(),
            module: 'income-expenses',
            action: deleteFromStorage ? 'receipt_deleted_completely' : 'receipt_removed_from_queue',
            deletedFromStorage: deleteFromStorage
        });
        
        // Update UI
        this.updateReceiptQueueUI();
        
        if (deleteSuccessful) {
            this.showNotification('Receipt deleted successfully', 'success');
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        this.showNotification('Failed to delete receipt', 'error');
    }
},

markReceiptAsProcessed(receiptId) {
    console.log(`Marking receipt ${receiptId} as processed...`);
    
    // Find receipt in queue
    const receiptIndex = this.receiptQueue.findIndex(r => r.id === receiptId);
    if (receiptIndex > -1) {
        this.receiptQueue[receiptIndex].status = 'processed';
        
        // Update Firebase if available
        if (this.isFirebaseAvailable && window.db) {
            try {
                window.db.collection('receipts').doc(receiptId).update({
                    status: 'processed',
                    processedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error updating receipt in Firebase:', error);
            }
        }
        
        // Update localStorage for local receipts
        if (receiptId.startsWith('local_')) {
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            const localIndex = localReceipts.findIndex(r => r.id === receiptId);
            if (localIndex > -1) {
                localReceipts[localIndex].status = 'processed';
                localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
            }
        }
        
        // Update UI
        this.updateReceiptQueueUI();
        
        this.showNotification('Receipt marked as processed', 'success');
    }
},

// ==================== DATA CALCULATION METHODS ====================
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
                const hasReceipt = transaction.receipt && this.isValidReceiptURL(transaction.receipt.downloadURL);
                
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
                            ${hasReceipt ? `
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
    
    // Add additional categories
    ['sales', 'services', 'grants', 'other-income', 'maintenance', 'transport', 'marketing', 'other-expense'].forEach(category => {
        if (!categoryData[category]) {
            categoryData[category] = { income: 0, expense: 0 };
        }
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

    const categoriesWithData = Object.entries(categoryData).filter(([_, data]) => data.income > 0 || data.expense > 0);
    
    if (categoriesWithData.length === 0) {
        return `
            <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No category data</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Add transactions to see category breakdown</div>
            </div>
        `;
    }

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
            ${categoriesWithData.map(([category, data]) => {
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

// ==================== UI UPDATE METHODS ====================
updateStats() {
    const stats = this.calculateStats();
    this.updateElement('total-income', this.formatCurrency(stats.totalIncome));
    this.updateElement('total-expenses', this.formatCurrency(stats.totalExpenses));
    this.updateElement('net-income', this.formatCurrency(stats.netIncome));
},

updateTransactionsList() {
    const recent = this.getRecentTransactions(10);
    const transactionsList = document.getElementById('transactions-list');
    if (transactionsList) {
        transactionsList.innerHTML = this.renderTransactionsList(recent);
    }
},

updateCategoryBreakdown() {
    const categoryBreakdown = document.getElementById('category-breakdown');
    if (categoryBreakdown) {
        categoryBreakdown.innerHTML = this.renderCategoryBreakdown();
    }
},

updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
},

    // ==================== FIXED: UPLOAD TO FIREBASE ====================
   uploadToFirebase(file, onProgress = null) {
    return new Promise((resolve, reject) => {
        console.log('📤 Starting Firebase upload for:', file.name);
        
        // Check if Firebase Storage is available
        if (!window.storage) {
            console.error('❌ Firebase Storage not available');
            reject(new Error('Firebase Storage not available'));
            return;
        }
        
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `receipts/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            
            // Create storage reference
            const storageRef = window.storage.ref();
            const fileRef = storageRef.child(fileName);
            
            console.log('📤 Uploading to:', fileName);
            
            // Upload file
            const uploadTask = fileRef.put(file);
            
            // Track upload progress
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`📤 Upload progress: ${Math.round(progress)}%`);
                    if (onProgress) onProgress(Math.round(progress));
                },
                (error) => {
                    console.error('❌ Upload error:', error);
                    reject(new Error(`Upload failed: ${error.message}`));
                },
                () => {
                    // Upload complete
                    uploadTask.snapshot.ref.getDownloadURL()
                        .then(downloadURL => {
                            console.log('✅ Upload complete, URL:', downloadURL);
                            
                            // Create receipt object
                            const receiptId = `receipt_${timestamp}`;
                            const receiptData = {
                                id: receiptId,
                                name: file.name,
                                downloadURL: downloadURL,
                                size: file.size,
                                type: file.type,
                                status: 'pending',
                                uploadedAt: new Date().toISOString()
                            };
                            
                            console.log('✅ Receipt data created:', receiptData);
                            resolve(receiptData);
                        })
                        .catch(error => {
                            console.error('❌ Error getting download URL:', error);
                            reject(error);
                        });
                }
            );
            
        } catch (error) {
            console.error('❌ Firebase upload error:', error);
            reject(new Error(`Firebase upload failed: ${error.message}`));
        }
    });
},
    
    // ==================== UTILITY METHODS ====================
filterTransactions(filter) {
    let filtered = this.transactions;
    
    if (filter === 'income') {
        filtered = this.transactions.filter(t => t.type === 'income');
    } else if (filter === 'expense') {
        filtered = this.transactions.filter(t => t.type === 'expense');
    }
    
    const recent = filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    const transactionsList = document.getElementById('transactions-list');
    if (transactionsList) {
        transactionsList.innerHTML = this.renderTransactionsList(recent);
    }
},

exportTransactions() {
    console.log('Exporting transactions...');
    const dataStr = JSON.stringify(this.transactions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showNotification('Transactions exported successfully!', 'success');
},

viewReceipt(transactionId) {
    console.log('Viewing receipt for transaction:', transactionId);
    const transaction = this.transactions.find(t => t.id == transactionId);
    if (!transaction || !transaction.receipt) {
        this.showNotification('No receipt available for this transaction', 'info');
        return;
    }
    
    // Open receipt in new window
    window.open(transaction.receipt.downloadURL, '_blank');
},

generateFinancialReport() {
    console.log('Generating financial report...');
    this.showNotification('Financial report feature coming soon', 'info');
},

generateCategoryAnalysis() {
    console.log('Generating category analysis...');
    this.showNotification('Category analysis feature coming soon', 'info');
},

cleanupBrokenReceipts() {
    console.log('🔄 Checking for broken receipts...');
    
    // Clean local receipts
    const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
    const validReceipts = localReceipts.filter(r => this.isValidReceiptURL(r.downloadURL));
    
    let cleanedCount = 0;
    
    if (validReceipts.length !== localReceipts.length) {
        cleanedCount = localReceipts.length - validReceipts.length;
        localStorage.setItem('local-receipts', JSON.stringify(validReceipts));
        console.log(`🗑️ Cleaned up ${cleanedCount} broken receipts`);
    }
    
    // Clean local queue
    const beforeClean = this.receiptQueue.length;
    this.receiptQueue = this.receiptQueue.filter(r => this.isValidReceiptURL(r.downloadURL));
    cleanedCount += (beforeClean - this.receiptQueue.length);
    
    if (cleanedCount > 0) {
        this.showNotification(`Cleaned up ${cleanedCount} broken receipt(s)`, 'info');
    } else {
        console.log('✅ No broken receipts found');
    }
    
    // Update UI
    this.updateReceiptQueueUI();
},

    setupButton(id, handler) {
        console.log(`🔧 Setting up button: ${id}`);
        
        const setupButtonIfExists = () => {
            const button = document.getElementById(id);
            if (button) {
                console.log(`✅ Button #${id} found, setting up...`);
                
                // Clone to remove old listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 Button #${id} clicked`);
                    handler.call(this, e);
                });
                
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (!setupButtonIfExists()) {
            console.log(`⏳ Button #${id} not found yet, will retry...`);
            
            // Retry a few times with delay
            let attempts = 0;
            const maxAttempts = 5;
            const interval = setInterval(() => {
                attempts++;
                console.log(`Retry ${attempts} for button #${id}...`);
                
                if (setupButtonIfExists() || attempts >= maxAttempts) {
                    clearInterval(interval);
                    if (attempts >= maxAttempts) {
                        console.error(`❌ Button #${id} never appeared after ${maxAttempts} attempts`);
                    }
                }
            }, 200);
        }
    },

    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return validTypes.includes(file.type) && file.size <= maxSize;
    },

    isValidReceiptURL(url) {
        if (!url) return false;
        
        // Check for different URL types
        if (url.startsWith('blob:')) {
            // Blob URLs are temporary and often broken
            return false;
        }
        
        if (url.startsWith('data:')) {
            // Data URLs are permanent and valid
            return true;
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // HTTP URLs are valid
            return true;
        }
        
        // Firebase Storage URLs
        if (url.includes('firebasestorage.googleapis.com')) {
            return true;
        }
        
        return false;
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
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            date = new Date(timestamp);
        }
        
        return this.formatTimeAgo(date);
    },

    formatTimeAgo(date) {
        if (!date || isNaN(date.getTime())) return 'Recently';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    },

    getCurrentUser() {
        if (window.firebase?.auth?.().currentUser) {
            return window.firebase.auth().currentUser.uid;
        }
        
        if (window.FarmModules?.appData?.profile?.userId) {
            return window.FarmModules.appData.profile.userId;
        }
        
        return 'anonymous';
    },

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

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(`${type.toUpperCase()}: ${message}`);
        }
    },

    // ... [Add other necessary methods here, ensuring no async/await issues]
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with Firebase Receipts');
}

// Universal registration
(function() {
    console.log(`📦 Registering income-expenses module...`);
    
    if (window.FarmModules) {
        window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
        console.log(`✅ income-expenses module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
