// modules/income-expenses.js - CORRECTED VERSION
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    categories: ['feed', 'medical', 'equipment', 'labor', 'utilities', 'sales', 'other'],
    currentEditingId: null,
    receiptPreview: null,
    cameraStream: null,
    scannerStream: null,
    cameraFacingMode: null,

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

        // Set up event listeners after DOM is created
        this.setupEventListeners();
    },

    // MODAL CONTROL METHODS
    showTransactionModal(transactionId = null) {
        console.log('Opening transaction modal...');
        this.hideAllModals();
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        this.currentEditingId = transactionId;
        
        const form = document.getElementById('transaction-form');
        if (form) {
            form.reset();
            const dateInput = document.getElementById('transaction-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            const deleteBtn = document.getElementById('delete-transaction');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            const title = document.getElementById('transaction-modal-title');
            if (title) {
                title.textContent = 'Add Transaction';
            }
            this.clearReceiptPreview();
            const ocrResults = document.getElementById('ocr-results');
            if (ocrResults) {
                ocrResults.classList.add('hidden');
            }
            
            // If editing existing transaction
            if (transactionId) {
                this.editTransaction(transactionId);
            }
        }
    },

    hideTransactionModal() {
        console.log('Closing transaction modal...');
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showReceiptUploadModal() {
        console.log('Opening receipt upload modal...');
        this.hideAllModals();
        const modal = document.getElementById('receipt-upload-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        const processing = document.getElementById('processing-indicator');
        if (processing) {
            processing.classList.add('hidden');
        }
        
        const camera = document.getElementById('camera-interface');
        if (camera) {
            camera.classList.add('hidden');
        }
        
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.classList.remove('hidden');
        }
        
        // Reset file input
        const fileInput = document.getElementById('receipt-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    },

    hideReceiptUploadModal() {
        console.log('Closing receipt upload modal...');
        const modal = document.getElementById('receipt-upload-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.stopCamera();
    },

    showScannerModal() {
        console.log('Opening scanner modal...');
        this.hideAllModals();
        const modal = document.getElementById('receipt-scanner-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        this.startScannerCamera();
    },

    hideScannerModal() {
        console.log('Closing scanner modal...');
        const modal = document.getElementById('receipt-scanner-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.stopScannerCamera();
    },

    showFinancialReportModal() {
        console.log('Opening financial report modal...');
        this.hideAllModals();
        const modal = document.getElementById('financial-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideFinancialReportModal() {
        console.log('Closing financial report modal...');
        const modal = document.getElementById('financial-report-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showCategoryAnalysisModal() {
        console.log('Opening category analysis modal...');
        this.hideAllModals();
        const modal = document.getElementById('category-analysis-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideCategoryAnalysisModal() {
        console.log('Closing category analysis modal...');
        const modal = document.getElementById('category-analysis-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    hideAllModals() {
        console.log('Hiding all modals...');
        this.hideTransactionModal();
        this.hideReceiptUploadModal();
        this.hideScannerModal();
        this.hideFinancialReportModal();
        this.hideCategoryAnalysisModal();
    },

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Main buttons
        const addTransactionBtn = document.getElementById('add-transaction');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                console.log('Add Transaction button clicked');
                this.showTransactionModal();
            });
        }

        const uploadReceiptBtn = document.getElementById('upload-receipt-btn');
        if (uploadReceiptBtn) {
            uploadReceiptBtn.addEventListener('click', () => {
                console.log('Upload Receipt button clicked');
                this.showReceiptUploadModal();
            });
        }
        
        // Quick action buttons
        const addIncomeBtn = document.getElementById('add-income-btn');
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => {
                console.log('Add Income button clicked');
                this.showAddIncome();
            });
        }

        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                console.log('Add Expense button clicked');
                this.showAddExpense();
            });
        }

        const financialReportBtn = document.getElementById('financial-report-btn');
        if (financialReportBtn) {
            financialReportBtn.addEventListener('click', () => {
                console.log('Financial Report button clicked');
                this.generateFinancialReport();
            });
        }

        const categoryAnalysisBtn = document.getElementById('category-analysis-btn');
        if (categoryAnalysisBtn) {
            categoryAnalysisBtn.addEventListener('click', () => {
                console.log('Category Analysis button clicked');
                this.generateCategoryAnalysis();
            });
        }
        
        // Transaction modal handlers
        const saveTransactionBtn = document.getElementById('save-transaction');
        if (saveTransactionBtn) {
            saveTransactionBtn.addEventListener('click', () => this.saveTransaction());
        }

        const deleteTransactionBtn = document.getElementById('delete-transaction');
        if (deleteTransactionBtn) {
            deleteTransactionBtn.addEventListener('click', () => this.deleteTransaction());
        }

        const cancelTransactionBtn = document.getElementById('cancel-transaction');
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener('click', () => this.hideTransactionModal());
        }

        const closeTransactionModalBtn = document.getElementById('close-transaction-modal');
        if (closeTransactionModalBtn) {
            closeTransactionModalBtn.addEventListener('click', () => this.hideTransactionModal());
        }
        
        // Receipt upload handlers
        const closeReceiptModalBtn = document.getElementById('close-receipt-modal');
        if (closeReceiptModalBtn) {
            closeReceiptModalBtn.addEventListener('click', () => this.hideReceiptUploadModal());
        }

        const cancelReceiptUploadBtn = document.getElementById('cancel-receipt-upload');
        if (cancelReceiptUploadBtn) {
            cancelReceiptUploadBtn.addEventListener('click', () => this.hideReceiptUploadModal());
        }

        const closeScannerModalBtn = document.getElementById('close-scanner-modal');
        if (closeScannerModalBtn) {
            closeScannerModalBtn.addEventListener('click', () => this.hideScannerModal());
        }
        
        // Report modal handlers
        const closeFinancialReportBtn = document.getElementById('close-financial-report');
        if (closeFinancialReportBtn) {
            closeFinancialReportBtn.addEventListener('click', () => this.hideFinancialReportModal());
        }

        const closeFinancialReportBtn2 = document.getElementById('close-financial-report-btn');
        if (closeFinancialReportBtn2) {
            closeFinancialReportBtn2.addEventListener('click', () => this.hideFinancialReportModal());
        }

        const printFinancialReportBtn = document.getElementById('print-financial-report');
        if (printFinancialReportBtn) {
            printFinancialReportBtn.addEventListener('click', () => this.printFinancialReport());
        }
        
        const closeCategoryAnalysisBtn = document.getElementById('close-category-analysis');
        if (closeCategoryAnalysisBtn) {
            closeCategoryAnalysisBtn.addEventListener('click', () => this.hideCategoryAnalysisModal());
        }

        const closeCategoryAnalysisBtn2 = document.getElementById('close-category-analysis-btn');
        if (closeCategoryAnalysisBtn2) {
            closeCategoryAnalysisBtn2.addEventListener('click', () => this.hideCategoryAnalysisModal());
        }

        const printCategoryAnalysisBtn = document.getElementById('print-category-analysis');
        if (printCategoryAnalysisBtn) {
            printCategoryAnalysisBtn.addEventListener('click', () => this.printCategoryAnalysis());
        }
        
        // Filter
        const transactionFilter = document.getElementById('transaction-filter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', (e) => {
                this.filterTransactions(e.target.value);
            });
        }
        
        // Export
        const exportTransactionsBtn = document.getElementById('export-transactions');
        if (exportTransactionsBtn) {
            exportTransactionsBtn.addEventListener('click', () => {
                this.exportTransactions();
            });
        }
        
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
        const takePhotoBtn = document.getElementById('take-photo-btn');
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', () => {
                this.startCamera();
            });
        }
        
        const chooseExistingBtn = document.getElementById('choose-existing-btn');
        if (chooseExistingBtn) {
            chooseExistingBtn.addEventListener('click', () => {
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
        }
        
        // Capture button
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                this.capturePhoto();
            });
        }
        
        // Switch camera
        const switchCameraBtn = document.getElementById('switch-camera-btn');
        if (switchCameraBtn) {
            switchCameraBtn.addEventListener('click', () => {
                this.switchCamera();
            });
        }
        
        // Cancel camera
        const cancelCameraBtn = document.getElementById('cancel-camera-btn');
        if (cancelCameraBtn) {
            cancelCameraBtn.addEventListener('click', () => {
                this.stopCamera();
                const cameraInterface = document.getElementById('camera-interface');
                if (cameraInterface) {
                    cameraInterface.classList.add('hidden');
                }
                const dropZone = document.getElementById('drop-zone');
                if (dropZone) {
                    dropZone.classList.remove('hidden');
                }
            });
        }
        
        // Scanner modal
        const scanReceiptBtn = document.getElementById('scan-receipt-btn');
        if (scanReceiptBtn) {
            scanReceiptBtn.addEventListener('click', () => {
                this.showScannerModal();
            });
        }
        
        const scanCaptureBtn = document.getElementById('scan-capture-btn');
        if (scanCaptureBtn) {
            scanCaptureBtn.addEventListener('click', () => {
                this.captureScannerPhoto();
            });
        }
        
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
        
        if (receiptUploadInput) {
            receiptUploadInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleTransactionReceiptUpload(e.target.files[0]);
                }
            });
        }
        
        // Remove receipt button
        const removeReceiptBtn = document.getElementById('remove-receipt');
        if (removeReceiptBtn) {
            removeReceiptBtn.addEventListener('click', () => {
                this.clearReceiptPreview();
            });
        }
        
        // Process receipt OCR button
        const processReceiptBtn = document.getElementById('process-receipt-btn');
        if (processReceiptBtn) {
            processReceiptBtn.addEventListener('click', () => {
                this.processReceiptOCR();
            });
        }
        
        // Use OCR data button
        const useOCRDataBtn = document.getElementById('use-ocr-data');
        if (useOCRDataBtn) {
            useOCRDataBtn.addEventListener('click', () => {
                this.applyOCRData();
            });
        }
        
        // Capture photo in transaction modal
        const capturePhotoBtn = document.getElementById('capture-photo-btn');
        if (capturePhotoBtn) {
            capturePhotoBtn.addEventListener('click', () => {
                this.capturePhotoForTransaction();
            });
        }
    },

    // HELPER METHODS
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

    generateFinancialReport() {
        console.log('Generating financial report...');
        // For now, just show the modal with basic content
        const reportContent = document.getElementById('financial-report-content');
        if (reportContent) {
            reportContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
                    <h4 style="color: var(--text-primary); margin-bottom: 8px;">Financial Report</h4>
                    <p style="color: var(--text-secondary);">Detailed financial report coming soon...</p>
                    <div style="margin-top: 24px; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <p style="color: var(--text-secondary);">This feature will include:</p>
                        <ul style="text-align: left; color: var(--text-secondary); margin-top: 8px;">
                            <li>Income vs Expenses charts</li>
                            <li>Category breakdown analysis</li>
                            <li>Monthly trends and forecasts</li>
                            <li>Profitability analysis</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        this.showFinancialReportModal();
    },

    generateCategoryAnalysis() {
        console.log('Generating category analysis...');
        // For now, just show the modal with basic content
        const analysisContent = document.getElementById('category-analysis-content');
        if (analysisContent) {
            analysisContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                    <h4 style="color: var(--text-primary); margin-bottom: 8px;">Category Analysis</h4>
                    <p style="color: var(--text-secondary);">Detailed category analysis coming soon...</p>
                    <div style="margin-top: 24px; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <p style="color: var(--text-secondary);">This feature will include:</p>
                        <ul style="text-align: left; color: var(--text-secondary); margin-top: 8px;">
                            <li>Category spending trends</li>
                            <li>Income sources analysis</li>
                            <li>Expense optimization suggestions</li>
                            <li>Budget vs actual comparisons</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        this.showCategoryAnalysisModal();
    },

    printFinancialReport() {
        console.log('Printing financial report...');
        window.print();
    },

    printCategoryAnalysis() {
        console.log('Printing category analysis...');
        window.print();
    },

    // RECEIPT HANDLING METHODS (simplified for now)
    handleReceiptFile(file) {
        console.log('Handling receipt file:', file.name);
        this.showNotification(`Receipt "${file.name}" uploaded successfully!`, 'success');
        this.hideReceiptUploadModal();
        this.showTransactionModal();
    },

    handleTransactionReceiptUpload(file) {
        console.log('Handling transaction receipt:', file.name);
        this.showNotification(`Receipt "${file.name}" attached to transaction`, 'success');
    },

    clearReceiptPreview() {
        console.log('Clearing receipt preview');
        this.receiptPreview = null;
        const previewContainer = document.getElementById('receipt-preview-container');
        if (previewContainer) {
            previewContainer.classList.add('hidden');
        }
        const ocrResults = document.getElementById('ocr-results');
        if (ocrResults) {
            ocrResults.classList.add('hidden');
        }
        const receiptInput = document.getElementById('receipt-upload');
        if (receiptInput) {
            receiptInput.value = '';
        }
    },

    processReceiptOCR() {
        console.log('Processing receipt OCR');
        this.showNotification('OCR processing started...', 'info');
    },

    applyOCRData() {
        console.log('Applying OCR data');
        this.showNotification('OCR data applied to form', 'success');
    },

    async startCamera() {
        console.log('Starting camera...');
        try {
            const cameraInterface = document.getElementById('camera-interface');
            if (cameraInterface) {
                cameraInterface.classList.remove('hidden');
            }
            const dropZone = document.getElementById('drop-zone');
            if (dropZone) {
                dropZone.classList.add('hidden');
            }
            
            // Simple camera implementation
            this.showNotification('Camera feature requires device permission', 'info');
        } catch (error) {
            console.error('Camera error:', error);
            this.showNotification('Could not access camera', 'error');
        }
    },

    async startScannerCamera() {
        console.log('Starting scanner camera...');
        this.showNotification('Scanner camera starting...', 'info');
    },

    stopCamera() {
        console.log('Stopping camera');
    },

    stopScannerCamera() {
        console.log('Stopping scanner camera');
    },

    switchCamera() {
        console.log('Switching camera');
        this.showNotification('Switching camera...', 'info');
    },

    capturePhoto() {
        console.log('Capturing photo');
        this.showNotification('Photo captured!', 'success');
        this.hideReceiptUploadModal();
        this.showTransactionModal();
    },

    captureScannerPhoto() {
        console.log('Capturing scanner photo');
        this.showNotification('Scanner photo captured!', 'success');
        this.hideScannerModal();
        this.showTransactionModal();
    },

    capturePhotoForTransaction() {
        console.log('Capturing photo for transaction');
        this.showNotification('Opening camera for receipt...', 'info');
        this.hideTransactionModal();
        setTimeout(() => {
            this.showReceiptUploadModal();
        }, 300);
    },

    // TRANSACTION CRUD METHODS
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
            this.showReceiptPreview();
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
        } else {
            // Add new
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

    viewReceipt(transactionId) {
        console.log('Viewing receipt for transaction:', transactionId);
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction || !transaction.receipt) {
            this.showNotification('No receipt available for this transaction', 'info');
            return;
        }
        
        this.showNotification('Opening receipt viewer...', 'info');
        // In a real implementation, this would open a receipt viewer modal
    },

    exportTransactions() {
        console.log('Exporting transactions...');
        // Simple export implementation
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

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}
