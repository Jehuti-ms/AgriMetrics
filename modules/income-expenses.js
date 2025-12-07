// modules/income-expenses.js - UPGRADED WITH FIREBASE RECEIPTS
console.log('💰 Loading Income & Expenses module (Upgraded)...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    categories: ['feed', 'medical', 'equipment', 'labor', 'utilities', 'sales', 'other'],
    currentEditingId: null,
    receiptQueue: [], // Firebase pending receipts
    cameraStream: null,
    scannerStream: null,
    receiptPreview: null,
    isFirebaseAvailable: false,

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('💰 Initializing Income & Expenses with Firebase Receipts...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        // Check Firebase availability
        this.isFirebaseAvailable = !!(window.firebase && window.firebase.storage && window.firebase.firestore);
        console.log('Firebase available:', this.isFirebaseAvailable);

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.loadData();
        this.loadReceiptsFromFirebase(); // Load receipts on startup
        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized with Firebase Receipts');
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
                .card-button:disabled:hover { transform: none; border-color: var(--glass-border); background: var(--glass-bg); }
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
                        <button class="btn btn-outline" id="upload-receipt-btn" style="display: flex; align-items: center; gap: 8px;">
                            📄 Import Receipts
                            ${this.isFirebaseAvailable ? '<span class="firebase-badge">Firebase</span>' : ''}
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
                            ${this.renderImportReceiptsModal()}
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

            <!-- Receipt Scanner Modal -->
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

            <!-- Financial Report Modal -->
            <div id="financial-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Financial Report</h3>
                        <button class="popout-modal-close" id="close-financial-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="financial-report-content"></div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-financial-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-financial-report-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // ==================== FIREBASE RECEIPT METHODS ====================
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
                        ${this.isFirebaseAvailable ? `
                            <button class="card-button" id="firebase-option">
                                <div class="card-icon">🔥</div>
                                <span class="card-title">From Firebase</span>
                                <span class="card-subtitle">Load existing</span>
                            </button>
                        ` : ''}
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
                
                <!-- Upload Area -->
                <div class="upload-section" id="upload-section">
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
                        </div>
                        
                        <!-- Upload Progress -->
                        <div class="upload-progress" id="upload-progress" style="display: none;">
                            <div class="progress-info">
                                <h4>Uploading to ${this.isFirebaseAvailable ? 'Firebase' : 'Local Storage'}...</h4>
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
                
                <!-- Recent Receipts -->
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
                            <a href="${receipt.downloadURL}" target="_blank" class="btn btn-sm btn-outline" title="View" style="padding: 6px 12px;">
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
                            <span class="btn-icon">🔍</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ==================== MODAL CONTROL METHODS ====================
    showImportReceiptsModal() {
        console.log('Showing import receipts modal');
        this.hideAllModals();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Update modal content
            const content = document.getElementById('import-receipts-content');
            if (content) {
                content.innerHTML = this.renderImportReceiptsModal();
            }
            this.setupImportReceiptsHandlers();
        }
    },

    hideImportReceiptsModal() {
        const modal = document.getElementById('import-receipts-modal');
        if (modal) modal.classList.add('hidden');
        this.stopCamera();
    },

    showCameraInterface() {
        const uploadSection = document.getElementById('upload-section');
        const cameraSection = document.getElementById('camera-section');
        const recentSection = document.getElementById('recent-section');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (cameraSection) cameraSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'none';
        
        this.initializeCamera();
    },

    showUploadInterface() {
        const uploadSection = document.getElementById('upload-section');
        const cameraSection = document.getElementById('camera-section');
        const recentSection = document.getElementById('recent-section');
        
        if (cameraSection) cameraSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
    },

    // ==================== CAMERA METHODS ====================
    async initializeCamera() {
        try {
            const video = document.getElementById('camera-preview');
            const status = document.getElementById('camera-status');
            
            if (!video) return;
            
            // Get camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            video.srcObject = stream;
            this.cameraStream = stream;
            if (status) status.textContent = 'Camera Ready';
            
        } catch (error) {
            console.error('Camera error:', error);
            this.showNotification('Camera access denied. Please upload files instead.', 'error');
            this.showUploadInterface();
        }
    },

    async switchCamera() {
        if (!this.cameraStream) return;
        
        const video = document.getElementById('camera-preview');
        if (!video) return;
        
        const tracks = this.cameraStream.getTracks();
        
        // Stop current tracks
        tracks.forEach(track => track.stop());
        
        try {
            // Get current facing mode
            const currentTrack = tracks.find(track => track.kind === 'video');
            const currentFacingMode = currentTrack?.getSettings()?.facingMode || 'environment';
            
            // Switch facing mode
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            
            // Get new stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: false
            });
            
            video.srcObject = stream;
            this.cameraStream = stream;
            
            this.showNotification(`Switched to ${newFacingMode === 'user' ? 'front' : 'rear'} camera`, 'success');
            
        } catch (error) {
            console.error('Switch camera error:', error);
            this.showNotification('Failed to switch camera', 'error');
        }
    },

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
        canvas.toBlob(async (blob) => {
            if (blob) {
                if (status) status.textContent = 'Processing photo...';
                
                // Create file object
                const file = new File([blob], `receipt_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                
                // Upload receipt
                await this.uploadReceiptToFirebase(file);
                
                if (status) status.textContent = 'Photo captured!';
                this.showNotification('Receipt photo captured!', 'success');
                
                // Switch back to upload interface
                setTimeout(() => {
                    this.stopCamera();
                    this.showUploadInterface();
                }, 1000);
            }
        }, 'image/jpeg', 0.9);
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        const video = document.getElementById('camera-preview');
        if (video) video.srcObject = null;
    },

    // ==================== FIREBASE UPLOAD METHODS ====================
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const totalFiles = files.length;
        let processedFiles = 0;
        
        // Show progress
        const progressSection = document.getElementById('upload-progress');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-percentage');
        const fileName = document.getElementById('upload-file-name');
        
        if (progressSection) progressSection.style.display = 'block';
        
        // Upload each file
        for (const file of Array.from(files)) {
            if (fileName) fileName.textContent = `Uploading: ${file.name}`;
            
            try {
                await this.uploadReceiptToFirebase(file);
                processedFiles++;
                
                // Update progress
                const progress = Math.round((processedFiles / totalFiles) * 100);
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
                
            } catch (error) {
                console.error('Upload error:', error);
                this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
            }
        }
        
        // Hide progress after completion
        setTimeout(() => {
            if (progressSection) progressSection.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
            if (fileName) fileName.textContent = '-';
        }, 1000);
        
        this.showNotification(`${processedFiles} receipt(s) uploaded successfully!`, 'success');
        
        // Update UI
        this.updateReceiptQueueUI();
        
        // Show process button
        const processBtn = document.getElementById('process-receipts-btn');
        if (processBtn) processBtn.style.display = 'inline-block';
    },

    async uploadReceiptToFirebase(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        
        // Validate file
        if (!this.isValidReceiptFile(file)) {
            throw new Error('Invalid file type or size (max 10MB, JPG/PNG/PDF only)');
        }
        
        if (this.isFirebaseAvailable) {
            // Upload to Firebase
            return this.uploadToFirebase(file);
        } else {
            // Store locally
            return this.storeReceiptLocally(file);
        }
    },

    async uploadToFirebase(file) {
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `receipts/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            
            // Create storage reference
            const storageRef = window.storage.ref();
            const fileRef = storageRef.child(fileName);
            
            // Upload file to Firebase Storage
            const uploadTask = fileRef.put(file);
            
            // Wait for upload to complete
            const snapshot = await uploadTask;
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Create receipt record in Firestore
            const receiptId = `receipt_${timestamp}`;
            const receiptData = {
                id: receiptId,
                name: file.name,
                originalName: file.name,
                fileName: fileName,
                downloadURL: downloadURL,
                size: file.size,
                type: file.type,
                status: 'pending',
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: this.getCurrentUser() || 'unknown',
                metadata: {
                    contentType: file.type,
                    size: file.size
                }
            };
            
            // Save to Firestore
            await window.db.collection('receipts').doc(receiptId).set(receiptData);
            
            // Add to local queue
            this.receiptQueue.push(receiptData);
            
            return receiptData;
        } catch (error) {
            console.error('Firebase upload error:', error);
            throw new Error(`Firebase upload failed: ${error.message}`);
        }
    },

    storeReceiptLocally(file) {
        const timestamp = Date.now();
        const receiptId = `local_${timestamp}`;
        const receiptData = {
            id: receiptId,
            name: file.name,
            originalName: file.name,
            fileName: file.name,
            downloadURL: URL.createObjectURL(file),
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
        
        return receiptData;
    },

    async loadReceiptsFromFirebase() {
        try {
            if (this.isFirebaseAvailable) {
                // Load from Firebase
                const receiptsRef = window.db.collection('receipts');
                const snapshot = await receiptsRef
                    .where('status', '==', 'pending')
                    .orderBy('uploadedAt', 'desc')
                    .limit(10)
                    .get();
                
                this.receiptQueue = [];
                snapshot.forEach(doc => {
                    this.receiptQueue.push(doc.data());
                });
                
                console.log('Loaded receipts from Firebase:', this.receiptQueue.length);
            } else {
                // Load from localStorage
                const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
                this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
                console.log('Loaded receipts from localStorage:', this.receiptQueue.length);
            }
            
            // Update UI
            this.updateReceiptQueueUI();
            
        } catch (error) {
            console.error('Error loading receipts:', error);
        }
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

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Main buttons
        this.setupButton('add-transaction', () => this.showTransactionModal());
        this.setupButton('upload-receipt-btn', () => this.showImportReceiptsModal());
        
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
        
        // Initialize receipt action listeners
        setTimeout(() => {
            this.setupReceiptActionListeners();
        }, 100);
    },

    setupImportReceiptsHandlers() {
        // Camera option
        this.setupButton('camera-option', () => this.showCameraInterface());
        
        // Upload option
        this.setupButton('upload-option', () => this.showUploadInterface());
        
        // Firebase option
        this.setupButton('firebase-option', () => {
            this.loadReceiptsFromFirebase();
            this.showUploadInterface();
        });
        
        // File upload handlers
        this.setupButton('browse-receipts-btn', () => {
            document.getElementById('receipt-upload-input').click();
        });
        
        const fileInput = document.getElementById('receipt-upload-input');
        if (fileInput) {
            fileInput.onchange = (e) => {
                this.handleFileUpload(e.target.files);
            };
        }
        
        // Drag and drop
        const dropArea = document.getElementById('drop-area');
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
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
        
        // Camera controls
        this.setupButton('capture-photo', () => this.capturePhoto());
        this.setupButton('switch-camera', () => this.switchCamera());
        this.setupButton('cancel-camera', () => {
            this.stopCamera();
            this.showUploadInterface();
        });
        
        // Refresh receipts
        this.setupButton('refresh-receipts', () => {
            this.loadReceiptsFromFirebase();
            const recentList = document.getElementById('recent-receipts-list');
            if (recentList) {
                recentList.innerHTML = this.renderRecentReceiptsList();
            }
        });
        
        // Process button
        this.setupButton('process-receipts-btn', () => this.processPendingReceipts());
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
                this.deleteReceipt(receiptId);
            });
        });
    },

    setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    },

    // ==================== ADD THESE METHODS TO IncomeExpensesModule ====================

        // ==================== ADD MISSING METHODS HERE ====================
    
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

    generateFinancialReport() {
        console.log('Generating financial report...');
        const reportContent = document.getElementById('financial-report-content');
        if (reportContent) {
            const stats = this.calculateStats();
            const byMonth = this.getTransactionsByMonth();
            
            reportContent.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 24px; text-align: center;">Financial Report</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
                        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px;">
                            <div style="font-size: 14px; color: #0284c7; margin-bottom: 4px;">Total Income</div>
                            <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${this.formatCurrency(stats.totalIncome)}</div>
                        </div>
                        <div style="background: #fef2f2; padding: 16px; border-radius: 8px;">
                            <div style="font-size: 14px; color: #dc2626; margin-bottom: 4px;">Total Expenses</div>
                            <div style="font-size: 24px; font-weight: bold; color: #b91c1c;">${this.formatCurrency(stats.totalExpenses)}</div>
                        </div>
                        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px;">
                            <div style="font-size: 14px; color: #16a34a; margin-bottom: 4px;">Net Income</div>
                            <div style="font-size: 24px; font-weight: bold; color: ${stats.netIncome >= 0 ? '#15803d' : '#dc2626'};">${this.formatCurrency(stats.netIncome)}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Total Transactions</div>
                            <div style="font-size: 24px; font-weight: bold; color: #334155;">${stats.transactionCount}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 16px;">Monthly Overview</h4>
                        <div style="background: var(--glass-bg); border-radius: 8px; padding: 16px;">
                            ${byMonth.length > 0 ? `
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${byMonth.slice(0, 6).map(month => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                                            <div>
                                                <div style="font-weight: 600; color: var(--text-primary);">${month.month}</div>
                                                <div style="font-size: 12px; color: var(--text-secondary);">${month.transactions} transactions</div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="color: #22c55e; font-weight: 600;">${this.formatCurrency(month.income)}</div>
                                                <div style="color: #ef4444; font-size: 12px;">${this.formatCurrency(month.expenses)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                                    No monthly data available
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 16px;">Top Categories</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            ${this.getTopCategories(5).map(category => `
                                <div style="background: var(--glass-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <span style="font-size: 20px;">${this.getCategoryIcon(category.name)}</span>
                                        <span style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(category.name)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: var(--text-secondary); font-size: 14px;">Total:</span>
                                        <span style="font-weight: 600; color: ${category.type === 'income' ? '#22c55e' : '#ef4444'};">${this.formatCurrency(category.amount)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="font-weight: 600; color: #334155;">Report Generated</div>
                            <div style="color: #64748b; font-size: 14px;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
                        </div>
                        <div style="color: #64748b; font-size: 14px; text-align: center;">
                            Farm Financial Report • Powered by Farm Management System
                        </div>
                    </div>
                </div>
            `;
        }
        this.showModal('financial-report-modal');
    },

    generateCategoryAnalysis() {
        console.log('Generating category analysis...');
        const analysisContent = document.getElementById('category-analysis-content');
        if (analysisContent) {
            const categoryData = this.getCategoryAnalysisData();
            
            analysisContent.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 24px; text-align: center;">Category Analysis</h3>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 16px;">Income Categories</h4>
                        <div style="background: var(--glass-bg); border-radius: 8px; padding: 16px;">
                            ${categoryData.income.length > 0 ? `
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${categoryData.income.map(cat => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f0f9ff; border-radius: 6px;">
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <span style="font-size: 20px;">${this.getCategoryIcon(cat.name)}</span>
                                                <div>
                                                    <div style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(cat.name)}</div>
                                                    <div style="font-size: 12px; color: var(--text-secondary);">${cat.count} transactions</div>
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-weight: bold; color: #22c55e; font-size: 18px;">${this.formatCurrency(cat.amount)}</div>
                                                <div style="color: #0284c7; font-size: 12px;">${cat.percentage}% of income</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                                    No income data available
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 16px;">Expense Categories</h4>
                        <div style="background: var(--glass-bg); border-radius: 8px; padding: 16px;">
                            ${categoryData.expense.length > 0 ? `
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${categoryData.expense.map(cat => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fef2f2; border-radius: 6px;">
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <span style="font-size: 20px;">${this.getCategoryIcon(cat.name)}</span>
                                                <div>
                                                    <div style="font-weight: 600; color: var(--text-primary);">${this.formatCategory(cat.name)}</div>
                                                    <div style="font-size: 12px; color: var(--text-secondary);">${cat.count} transactions</div>
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-weight: bold; color: #ef4444; font-size: 18px;">${this.formatCurrency(cat.amount)}</div>
                                                <div style="color: #dc2626; font-size: 12px;">${cat.percentage}% of expenses</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                                    No expense data available
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="font-size: 20px;">💡</div>
                            <div>
                                <div style="font-weight: 600; color: #334155;">Analysis Insights</div>
                                <div style="color: #64748b; font-size: 14px;">
                                    ${this.getCategoryInsights(categoryData)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        this.showModal('category-analysis-modal');
    },

    showModal(modalId) {
        this.hideAllModals();
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('hidden');
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
        }
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
            receipt: this.receiptPreview || null
        };
        
        // Check if editing existing transaction
        const existingIndex = this.transactions.findIndex(t => t.id == id);
        if (existingIndex > -1) {
            // Update existing
            this.transactions[existingIndex] = transactionData;
            this.showNotification('Transaction updated successfully!', 'success');
            
            // If this was from a pending receipt, mark it as processed
            if (this.receiptPreview?.id) {
                this.markReceiptAsProcessed(this.receiptPreview.id);
            }
        } else {
            // Add new
            transactionData.id = transactionData.id || Date.now();
            this.transactions.unshift(transactionData);
            this.showNotification('Transaction saved successfully!', 'success');
            
            // If this was from a pending receipt, mark it as processed
            if (this.receiptPreview?.id) {
                this.markReceiptAsProcessed(this.receiptPreview.id);
            }
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

    markReceiptAsProcessed(receiptId) {
        const receiptIndex = this.receiptQueue.findIndex(r => r.id === receiptId);
        if (receiptIndex > -1) {
            // Update status locally
            this.receiptQueue[receiptIndex].status = 'processed';
            
            // Update in Firebase if available
            if (this.isFirebaseAvailable && window.db) {
                window.db.collection('receipts').doc(receiptId).update({
                    status: 'processed',
                    processedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Update UI
            this.updateReceiptQueueUI();
            
            this.showNotification('Receipt marked as processed', 'success');
        }
    },

    deleteTransaction() {
        const transactionId = document.getElementById('transaction-id')?.value;
        if (!transactionId) return;
        
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

    printFinancialReport() {
        console.log('Printing financial report...');
        window.print();
    },

    printCategoryAnalysis() {
        console.log('Printing category analysis...');
        window.print();
    },

    // ==================== HELPER METHODS ====================
    getTransactionsByMonth() {
        const months = {};
        
        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            if (!months[monthKey]) {
                months[monthKey] = {
                    month: monthName,
                    income: 0,
                    expenses: 0,
                    transactions: 0
                };
            }
            
            if (transaction.type === 'income') {
                months[monthKey].income += transaction.amount;
            } else {
                months[monthKey].expenses += transaction.amount;
            }
            
            months[monthKey].transactions++;
        });
        
        return Object.values(months).sort((a, b) => {
            const [aYear, aMonth] = a.month.split(' ');
            const [bYear, bMonth] = b.month.split(' ');
            return new Date(bYear, new Date(`${bMonth} 1, ${bYear}`).getMonth()) - 
                   new Date(aYear, new Date(`${aMonth} 1, ${aYear}`).getMonth());
        });
    },

    getTopCategories(limit = 5) {
        const categoryTotals = {};
        
        this.transactions.forEach(transaction => {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = {
                    name: transaction.category,
                    amount: 0,
                    type: transaction.type,
                    count: 0
                };
            }
            
            categoryTotals[transaction.category].amount += transaction.amount;
            categoryTotals[transaction.category].count++;
        });
        
        return Object.values(categoryTotals)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);
    },

    getCategoryAnalysisData() {
        const incomeCategories = {};
        const expenseCategories = {};
        
        let totalIncome = 0;
        let totalExpenses = 0;
        
        // Calculate totals
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
                if (!incomeCategories[transaction.category]) {
                    incomeCategories[transaction.category] = {
                        name: transaction.category,
                        amount: 0,
                        count: 0
                    };
                }
                incomeCategories[transaction.category].amount += transaction.amount;
                incomeCategories[transaction.category].count++;
            } else {
                totalExpenses += transaction.amount;
                if (!expenseCategories[transaction.category]) {
                    expenseCategories[transaction.category] = {
                        name: transaction.category,
                        amount: 0,
                        count: 0
                    };
                }
                expenseCategories[transaction.category].amount += transaction.amount;
                expenseCategories[transaction.category].count++;
            }
        });
        
        // Calculate percentages
        Object.values(incomeCategories).forEach(cat => {
            cat.percentage = totalIncome > 0 ? Math.round((cat.amount / totalIncome) * 100) : 0;
        });
        
        Object.values(expenseCategories).forEach(cat => {
            cat.percentage = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
        });
        
        return {
            income: Object.values(incomeCategories).sort((a, b) => b.amount - a.amount),
            expense: Object.values(expenseCategories).sort((a, b) => b.amount - a.amount),
            totalIncome,
            totalExpenses
        };
    },

    getCategoryInsights(categoryData) {
        const insights = [];
        
        if (categoryData.income.length > 0) {
            const topIncome = categoryData.income[0];
            insights.push(`Top income source: ${this.formatCategory(topIncome.name)} (${topIncome.percentage}% of total income)`);
        }
        
        if (categoryData.expense.length > 0) {
            const topExpense = categoryData.expense[0];
            insights.push(`Largest expense: ${this.formatCategory(topExpense.name)} (${topExpense.percentage}% of total expenses)`);
        }
        
        if (categoryData.totalIncome > 0 && categoryData.totalExpenses > 0) {
            const profitMargin = ((categoryData.totalIncome - categoryData.totalExpenses) / categoryData.totalIncome * 100).toFixed(1);
            insights.push(`Profit margin: ${profitMargin}%`);
        }
        
        return insights.length > 0 ? insights.join(' • ') : 'Add more transactions to see insights';
    }
    // ==================== END OF MISSING METHODS ====================
    
    // ==================== RECEIPT PROCESSING ====================
    async processSingleReceipt(receiptId) {
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
                    // For now, just show a message
                    this.showNotification('Auto-extract coming soon. Please fill in the details manually.', 'info');
                };
            }
        }
    },

    async processPendingReceipts() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pendingReceipts.length === 0) {
            this.showNotification('No pending receipts to process', 'info');
            return;
        }
        
        if (pendingReceipts.length === 1) {
            await this.processSingleReceipt(pendingReceipts[0].id);
        } else {
            this.showNotification(`Open the Import Receipts modal to process ${pendingReceipts.length} receipts`, 'info');
            this.showImportReceiptsModal();
        }
    },

    async deleteReceipt(receiptId) {
        if (!confirm('Are you sure you want to delete this receipt?')) return;
        
        try {
            const receipt = this.receiptQueue.find(r => r.id === receiptId);
            
            if (this.isFirebaseAvailable && receipt?.fileName && window.storage) {
                // Delete from Firebase Storage
                const storageRef = window.storage.ref();
                await storageRef.child(receipt.fileName).delete();
                
                // Delete from Firestore
                if (window.db) {
                    await window.db.collection('receipts').doc(receiptId).delete();
                }
            } else {
                // Delete from localStorage
                const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
                const updatedReceipts = localReceipts.filter(r => r.id !== receiptId);
                localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
            }
            
            // Remove from local queue
            this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
            
            // Update UI
            this.updateReceiptQueueUI();
            
            this.showNotification('Receipt deleted successfully', 'success');
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete receipt', 'error');
        }
    },

    // ==================== UTILITY METHODS ====================
    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return validTypes.includes(file.type) && file.size <= maxSize;
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

    // ==================== EXISTING TRANSACTION METHODS (minimal changes) ====================
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

    // ... (keep all your existing transaction CRUD methods, stats, etc.)
    // They should work as-is with the new Firebase integration

    // Add these missing modal methods:
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
            
            if (transactionId) this.editTransaction(transactionId);
        }
    },

    hideTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.add('hidden');
        this.receiptPreview = null;
    },

    clearReceiptPreview() {
        const previewContainer = document.getElementById('receipt-preview-container');
        if (previewContainer) previewContainer.classList.add('hidden');
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) imagePreview.classList.add('hidden');
    },

    hideAllModals() {
        this.hideTransactionModal();
        this.hideImportReceiptsModal();
        const scannerModal = document.getElementById('receipt-scanner-modal');
        if (scannerModal) scannerModal.classList.add('hidden');
        const reportModal = document.getElementById('financial-report-modal');
        if (reportModal) reportModal.classList.add('hidden');
    },

    // Add these format methods:
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
            // Simple alert fallback
            const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
            console.log(`%c${type.toUpperCase()}: ${message}`, `color: ${colors[type] || '#000'}; font-weight: bold;`);
        }
    }
};

// Add the missing methods (renderCategoryBreakdown, editTransaction, saveTransaction, etc.)
// ... (copy all your existing transaction methods here)

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with Firebase Receipts');
}
