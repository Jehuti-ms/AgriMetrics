// COMPLETE FINANCE TRACKER WITH ALL MODALS WORKING
const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    currentEditingId: null,
    receiptPreview: null,
    cameraStream: null,
    scannerStream: null,
    cameraFacingMode: 'environment',
    categories: ['sales', 'services', 'grants', 'other-income', 'feed', 'medical', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'marketing', 'other-expense'],

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized with ALL features');
        return true;
    },

    loadData() {
        const saved = localStorage.getItem('farm-transactions');
        this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        this.showNotification('Data saved successfully!', 'success');
    },

    getDemoData() {
        return [
            {
                id: 1,
                date: '2024-03-20',
                type: 'income',
                category: 'sales',
                description: 'Egg Sales - Market Day',
                amount: 1250.75,
                paymentMethod: 'cash',
                reference: 'INV-001',
                notes: 'Sold 50 crates of eggs',
                receipt: null
            },
            {
                id: 2,
                date: '2024-03-19',
                type: 'expense',
                category: 'feed',
                description: 'Chicken Feed Purchase',
                amount: 850.50,
                paymentMethod: 'card',
                reference: 'INV-789',
                notes: 'Premium organic feed',
                receipt: null
            },
            {
                id: 3,
                date: '2024-03-18',
                type: 'expense',
                category: 'medical',
                description: 'Veterinary Supplies',
                amount: 320.25,
                paymentMethod: 'transfer',
                reference: 'MED-2024',
                notes: 'Vaccines and supplements',
                receipt: null
            },
            {
                id: 4,
                date: '2024-03-17',
                type: 'income',
                category: 'services',
                description: 'Farm Consultation',
                amount: 500.00,
                paymentMethod: 'transfer',
                reference: 'CON-001',
                notes: 'Consulting services',
                receipt: null
            },
            {
                id: 5,
                date: '2024-03-16',
                type: 'expense',
                category: 'equipment',
                description: 'Watering System',
                amount: 1200.00,
                paymentMethod: 'card',
                reference: 'EQP-789',
                notes: 'Automatic watering system',
                receipt: null
            }
        ];
    },

    renderModule() {
        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <div>
                        <h1 class="module-title">💰 Income & Expenses</h1>
                        <p class="module-subtitle">Track farm finances and cash flow</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-transaction">
                            ➕ Add Transaction
                        </button>
                        <button class="btn btn-outline" id="upload-receipt-btn">
                            📄 Upload Receipt
                        </button>
                    </div>
                </div>

                <!-- Financial Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value" id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                        <div class="stat-label">Total Income</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div class="stat-label">Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-value" id="net-income">${this.formatCurrency(stats.netIncome)}</div>
                        <div class="stat-label">Net Income</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💳</div>
                        <div class="stat-value">${stats.transactionCount}</div>
                        <div class="stat-label">Transactions</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn">
                        <div class="quick-action-icon">💰</div>
                        <span class="quick-action-title">Add Income</span>
                        <span class="quick-action-subtitle">Record farm income</span>
                    </button>
                    <button class="quick-action-btn" id="add-expense-btn">
                        <div class="quick-action-icon">💸</div>
                        <span class="quick-action-title">Add Expense</span>
                        <span class="quick-action-subtitle">Record farm expenses</span>
                    </button>
                    <button class="quick-action-btn" id="financial-report-btn">
                        <div class="quick-action-icon">📊</div>
                        <span class="quick-action-title">Financial Report</span>
                        <span class="quick-action-subtitle">View financial summary</span>
                    </button>
                    <button class="quick-action-btn" id="category-analysis-btn">
                        <div class="quick-action-icon">📋</div>
                        <span class="quick-action-title">Category Analysis</span>
                        <span class="quick-action-subtitle">Breakdown by category</span>
                    </button>
                </div>

                <!-- Recent Transactions -->
                <div class="section-card">
                    <div class="section-header">
                        <h3>📋 Recent Transactions</h3>
                        <div class="section-actions">
                            <select id="transaction-filter" class="form-select">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                            <button class="btn btn-outline" id="export-transactions">Export</button>
                        </div>
                    </div>
                    <div id="transactions-list">
                        ${this.renderTransactionsList(recentTransactions)}
                    </div>
                </div>

                <!-- Category Breakdown -->
                <div class="section-card">
                    <h3>📊 Category Breakdown</h3>
                    <div id="category-breakdown">
                        ${this.renderCategoryBreakdown()}
                    </div>
                </div>
            </div>

            <!-- ========== MODALS ========== -->
            
            <!-- Transaction Modal -->
            <div id="transaction-modal" class="modal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 id="transaction-modal-title">Add Transaction</h3>
                        <button class="modal-close" id="close-transaction-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id" value="">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Date *</label>
                                    <input type="date" id="transaction-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Type *</label>
                                    <select id="transaction-type" class="form-input" required>
                                        <option value="income">💰 Income</option>
                                        <option value="expense">💸 Expense</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
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
                                <div class="form-group">
                                    <label class="form-label">Amount ($) *</label>
                                    <input type="number" id="transaction-amount" class="form-input" step="0.01" min="0" required placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Description *</label>
                                <input type="text" id="transaction-description" class="form-input" required placeholder="Enter transaction description">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Payment Method</label>
                                    <select id="transaction-payment" class="form-input">
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Reference Number</label>
                                    <input type="text" id="transaction-reference" class="form-input" placeholder="Invoice/Receipt #">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notes (Optional)</label>
                                <textarea id="transaction-notes" class="form-input" placeholder="Additional notes about this transaction" rows="3"></textarea>
                            </div>

                            <!-- Receipt Upload Section -->
                            <div class="form-group">
                                <label class="form-label">Receipt (Optional)</label>
                                <div id="receipt-upload-area" class="drop-zone">
                                    <div class="drop-zone-icon">📄</div>
                                    <div class="drop-zone-title">Upload Receipt</div>
                                    <div class="drop-zone-subtitle">Click to upload or drag & drop</div>
                                    <div class="drop-zone-info">Supports JPG, PNG, PDF (Max 10MB)</div>
                                    <input type="file" id="receipt-upload" accept="image/*,.pdf" style="display: none;">
                                </div>
                                
                                <!-- Receipt Preview -->
                                <div id="receipt-preview-container" class="hidden">
                                    <div class="receipt-preview-header">
                                        <div class="receipt-file-info">
                                            <div class="receipt-icon">📄</div>
                                            <div>
                                                <div class="receipt-filename" id="receipt-filename">receipt.jpg</div>
                                                <div class="receipt-size" id="receipt-size">2.5 MB</div>
                                            </div>
                                        </div>
                                        <button type="button" id="remove-receipt" class="btn-icon">🗑️</button>
                                    </div>
                                    
                                    <!-- Image Preview -->
                                    <div id="image-preview" class="hidden">
                                        <img id="receipt-image-preview" src="" alt="Receipt preview">
                                    </div>
                                    
                                    <!-- OCR Button -->
                                    <button type="button" id="process-receipt-btn" class="btn btn-outline full-width">
                                        🔍 Extract Information from Receipt
                                    </button>
                                    
                                    <!-- Camera Capture -->
                                    <div class="camera-actions">
                                        <button type="button" id="capture-photo-btn" class="btn btn-outline">
                                            📸 Capture Photo
                                        </button>
                                        <button type="button" id="scan-receipt-btn" class="btn btn-outline">
                                            🔍 Scan Receipt
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- OCR Results -->
                            <div id="ocr-results" class="hidden">
                                <div class="ocr-header">
                                    <h4>📄 Extracted from Receipt</h4>
                                    <button type="button" id="use-ocr-data" class="btn btn-primary">Apply</button>
                                </div>
                                <div id="ocr-details"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" id="cancel-transaction">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-transaction" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
                </div>
            </div>

            <!-- Receipt Upload Modal -->
            <div id="receipt-upload-modal" class="modal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Upload Receipt</h3>
                        <button class="modal-close" id="close-receipt-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-container">
                            <div class="upload-icon">📄</div>
                            <h4>Upload Receipt for Processing</h4>
                            <p>Upload a receipt photo or PDF to automatically extract transaction details</p>
                            
                            <div class="drop-zone-lg" id="drop-zone-main">
                                <div class="drop-zone-lg-icon">⬆️</div>
                                <div class="drop-zone-lg-title">Drag & Drop Receipt Here</div>
                                <div class="drop-zone-lg-subtitle">or click to browse files</div>
                                <input type="file" id="receipt-file-input" accept="image/*,.pdf" style="display: none;">
                            </div>
                            
                            <div class="upload-info">
                                Supported formats: JPG, PNG, PDF (Max 10MB)
                            </div>
                            
                            <div class="upload-actions">
                                <button type="button" id="take-photo-btn" class="btn btn-outline full-width">
                                    📸 Take Photo
                                </button>
                                <button type="button" id="choose-existing-btn" class="btn btn-outline full-width">
                                    📁 Choose from Gallery
                                </button>
                            </div>
                        </div>
                        
                        <!-- Camera Interface -->
                        <div id="camera-interface" class="hidden">
                            <h4>📸 Camera</h4>
                            <div class="camera-preview-container">
                                <video id="camera-preview" autoplay playsinline></video>
                                <div class="camera-overlay"></div>
                            </div>
                            <div class="camera-controls">
                                <button type="button" id="capture-btn" class="btn btn-primary">
                                    📷 Capture
                                </button>
                                <button type="button" id="switch-camera-btn" class="btn btn-outline">
                                    🔄 Switch Camera
                                </button>
                                <button type="button" id="cancel-camera-btn" class="btn btn-outline">
                                    ❌ Cancel
                                </button>
                            </div>
                        </div>
                        
                        <!-- Processing Indicator -->
                        <div id="processing-indicator" class="hidden">
                            <div class="spinner"></div>
                            <h4>Processing Receipt</h4>
                            <p>Extracting information from your receipt...</p>
                            <div id="ocr-progress">Analyzing text... 0%</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" id="cancel-receipt-upload">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Financial Report Modal -->
            <div id="financial-report-modal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 id="financial-report-title">Financial Report</h3>
                        <button class="modal-close" id="close-financial-report">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="financial-report-content">
                            ${this.renderFinancialReport()}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="print-financial-report">🖨️ Print</button>
                        <button class="btn btn-primary" id="close-financial-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Category Analysis Modal -->
            <div id="category-analysis-modal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 id="category-analysis-title">Category Analysis</h3>
                        <button class="modal-close" id="close-category-analysis">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="category-analysis-content">
                            ${this.renderCategoryAnalysis()}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="print-category-analysis">🖨️ Print</button>
                        <button class="btn btn-primary" id="close-category-analysis-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Receipt Scanner Modal -->
            <div id="receipt-scanner-modal" class="modal">
                <div class="modal-content" style="max-width: 100%; height: 100%; background: #000;">
                    <div class="modal-header" style="background: rgba(0,0,0,0.7);">
                        <h3 style="color: white;">Receipt Scanner</h3>
                        <button class="modal-close" id="close-scanner-modal" style="color: white;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 0; height: calc(100% - 60px);">
                        <div class="scanner-container">
                            <video id="scanner-preview" autoplay playsinline></video>
                            <div class="scanner-overlay"></div>
                            <div class="scanner-controls">
                                <p>Hold steady and align receipt within the frame</p>
                                <button type="button" id="scan-capture-btn" class="btn btn-primary">
                                    📷 Capture Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeModals();
    },

    initializeModals() {
        // Add modal CSS
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            
            .modal.active {
                display: flex;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-body {
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
            }
            
            .hidden {
                display: none !important;
            }
            
            .btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-outline {
                background: white;
                border: 2px solid #e5e7eb;
                color: #374151;
            }
            
            .btn-outline:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-danger:hover {
                background: #dc2626;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: #374151;
            }
            
            .form-input {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #3b82f6;
            }
            
            .form-select {
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            }
            
            .drop-zone {
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .drop-zone:hover {
                border-color: #3b82f6;
                background: #f8fafc;
            }
            
            .full-width {
                width: 100%;
            }
            
            .camera-actions {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            #ocr-results {
                background: #f0f9ff;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
                border: 1px solid #bfdbfe;
            }
            
            .ocr-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .module-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .module-title {
                font-size: 2rem;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .module-subtitle {
                color: #6b7280;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .stat-icon {
                font-size: 32px;
                margin-bottom: 12px;
            }
            
            .stat-value {
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .stat-label {
                color: #6b7280;
                font-size: 14px;
            }
            
            .quick-action-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .quick-action-btn {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .quick-action-btn:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border-color: #3b82f6;
            }
            
            .quick-action-icon {
                font-size: 32px;
            }
            
            .quick-action-title {
                font-weight: 600;
                color: #1f2937;
            }
            
            .quick-action-subtitle {
                color: #6b7280;
                font-size: 12px;
                text-align: center;
            }
            
            .section-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .section-actions {
                display: flex;
                gap: 12px;
            }
            
            .transaction-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .transaction-item:last-child {
                border-bottom: none;
            }
            
            .transaction-info h4 {
                margin: 0 0 4px 0;
                color: #1f2937;
            }
            
            .transaction-meta {
                color: #6b7280;
                font-size: 14px;
            }
            
            .transaction-amount {
                font-weight: bold;
                font-size: 18px;
            }
            
            .income {
                color: #10b981;
            }
            
            .expense {
                color: #ef4444;
            }
            
            .transaction-actions {
                display: flex;
                gap: 8px;
            }
            
            .category-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                margin-bottom: 8px;
            }
            
            .category-name {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);
    },

    setupEventListeners() {
        // Main buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-transaction')) this.showTransactionModal();
            if (e.target.closest('#upload-receipt-btn')) this.showReceiptUploadModal();
            if (e.target.closest('#add-income-btn')) this.showAddIncome();
            if (e.target.closest('#add-expense-btn')) this.showAddExpense();
            if (e.target.closest('#financial-report-btn')) this.showFinancialReport();
            if (e.target.closest('#category-analysis-btn')) this.showCategoryAnalysis();
            if (e.target.closest('#export-transactions')) this.exportTransactions();
            
            // Modal close buttons
            if (e.target.closest('#close-transaction-modal')) this.hideModal('transaction-modal');
            if (e.target.closest('#cancel-transaction')) this.hideModal('transaction-modal');
            if (e.target.closest('#close-receipt-modal')) this.hideModal('receipt-upload-modal');
            if (e.target.closest('#cancel-receipt-upload')) this.hideModal('receipt-upload-modal');
            if (e.target.closest('#close-financial-report')) this.hideModal('financial-report-modal');
            if (e.target.closest('#close-financial-report-btn')) this.hideModal('financial-report-modal');
            if (e.target.closest('#close-category-analysis')) this.hideModal('category-analysis-modal');
            if (e.target.closest('#close-category-analysis-btn')) this.hideModal('category-analysis-modal');
            if (e.target.closest('#close-scanner-modal')) this.hideModal('receipt-scanner-modal');
            
            // Transaction form buttons
            if (e.target.closest('#save-transaction')) this.saveTransaction();
            if (e.target.closest('#delete-transaction')) this.deleteTransaction();
            
            // Receipt buttons
            if (e.target.closest('#process-receipt-btn')) this.processReceiptOCR();
            if (e.target.closest('#use-ocr-data')) this.applyOCRData();
            if (e.target.closest('#remove-receipt')) this.clearReceiptPreview();
            if (e.target.closest('#capture-photo-btn')) this.capturePhotoForTransaction();
            if (e.target.closest('#scan-receipt-btn')) this.showScannerModal();
            
            // Upload modal buttons
            if (e.target.closest('#take-photo-btn')) this.startCamera();
            if (e.target.closest('#choose-existing-btn')) this.chooseFromGallery();
            if (e.target.closest('#capture-btn')) this.capturePhoto();
            if (e.target.closest('#switch-camera-btn')) this.switchCamera();
            if (e.target.closest('#cancel-camera-btn')) this.cancelCamera();
            
            // Scanner buttons
            if (e.target.closest('#scan-capture-btn')) this.captureScannerPhoto();
            
            // Print buttons
            if (e.target.closest('#print-financial-report')) this.printReport();
            if (e.target.closest('#print-category-analysis')) this.printCategoryAnalysis();
            
            // Edit/Delete transaction buttons
            if (e.target.closest('.edit-transaction')) {
                const id = e.target.closest('.edit-transaction').dataset.id;
                this.editTransaction(parseInt(id));
            }
            if (e.target.closest('.delete-transaction')) {
                const id = e.target.closest('.delete-transaction').dataset.id;
                this.deleteTransactionRecord(parseInt(id));
            }
        });
        
        // Filter change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'transaction-filter') {
                this.filterTransactions(e.target.value);
            }
        });
        
        // File uploads
        document.addEventListener('change', (e) => {
            if (e.target.id === 'receipt-upload') {
                this.handleTransactionReceiptUpload(e.target.files[0]);
            }
            if (e.target.id === 'receipt-file-input') {
                this.handleReceiptFile(e.target.files[0]);
            }
        });
        
        // Drag and drop
        const setupDropZone = (id, callback) => {
            const dropZone = document.getElementById(id);
            if (dropZone) {
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = '#3b82f6';
                    dropZone.style.background = '#f8fafc';
                });
                
                dropZone.addEventListener('dragleave', () => {
                    dropZone.style.borderColor = '#d1d5db';
                    dropZone.style.background = '';
                });
                
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.style.borderColor = '#d1d5db';
                    dropZone.style.background = '';
                    const file = e.dataTransfer.files[0];
                    if (file) callback(file);
                });
                
                dropZone.addEventListener('click', () => {
                    if (id === 'receipt-upload-area') {
                        document.getElementById('receipt-upload').click();
                    } else if (id === 'drop-zone-main') {
                        document.getElementById('receipt-file-input').click();
                    }
                });
            }
        };
        
        setupDropZone('receipt-upload-area', (file) => this.handleTransactionReceiptUpload(file));
        setupDropZone('drop-zone-main', (file) => this.handleReceiptFile(file));
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    },

    // ========== MODAL CONTROL METHODS ==========
    
    showModal(id) {
        this.hideAllModals();
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    },

    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
        this.stopCamera();
        this.stopScannerCamera();
    },

    showTransactionModal(id = null) {
        this.currentEditingId = id;
        this.showModal('transaction-modal');
        
        // Reset form or load data
        const form = document.getElementById('transaction-form');
        if (form) form.reset();
        
        // Set default date
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        
        // Set modal title and buttons
        const title = document.getElementById('transaction-modal-title');
        const deleteBtn = document.getElementById('delete-transaction');
        
        if (id) {
            // Editing existing transaction
            title.textContent = 'Edit Transaction';
            deleteBtn.style.display = 'block';
            this.loadTransactionData(id);
        } else {
            // Adding new transaction
            title.textContent = 'Add Transaction';
            deleteBtn.style.display = 'none';
        }
    },

    showAddIncome() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'income';
        document.getElementById('transaction-modal-title').textContent = 'Add Income';
    },

    showAddExpense() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'expense';
        document.getElementById('transaction-modal-title').textContent = 'Add Expense';
    },

    showReceiptUploadModal() {
        this.showModal('receipt-upload-modal');
        // Reset camera interface
        document.getElementById('camera-interface').classList.add('hidden');
        document.getElementById('processing-indicator').classList.add('hidden');
    },

    showScannerModal() {
        this.showModal('receipt-scanner-modal');
        this.startScannerCamera();
    },

    showFinancialReport() {
        this.showModal('financial-report-modal');
        this.updateFinancialReport();
    },

    showCategoryAnalysis() {
        this.showModal('category-analysis-modal');
        this.updateCategoryAnalysis();
    },

    // ========== CAMERA METHODS ==========
    
    async startCamera() {
        try {
            const constraints = {
                video: { facingMode: this.cameraFacingMode }
            };
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('camera-preview');
            if (video) {
                video.srcObject = this.cameraStream;
            }
            document.getElementById('camera-interface').classList.remove('hidden');
        } catch (err) {
            console.error('Camera error:', err);
            this.showNotification('Could not access camera', 'error');
        }
    },

    async startScannerCamera() {
        try {
            const constraints = {
                video: { facingMode: 'environment' }
            };
            this.scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('scanner-preview');
            if (video) {
                video.srcObject = this.scannerStream;
            }
        } catch (err) {
            console.error('Scanner camera error:', err);
            this.showNotification('Could not access scanner camera', 'error');
        }
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    },

    stopScannerCamera() {
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(track => track.stop());
            this.scannerStream = null;
        }
    },

    switchCamera() {
        this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
        this.stopCamera();
        this.startCamera();
    },

    cancelCamera() {
        this.stopCamera();
        document.getElementById('camera-interface').classList.add('hidden');
    },

    capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            this.handleReceiptFile(blob, 'camera-capture.jpg');
            this.stopCamera();
            this.hideModal('receipt-upload-modal');
        }, 'image/jpeg', 0.9);
    },

    captureScannerPhoto() {
        const video = document.getElementById('scanner-preview');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            this.handleReceiptFile(blob, 'scanner-capture.jpg');
            this.hideModal('receipt-scanner-modal');
            this.showTransactionModal();
        }, 'image/jpeg', 0.9);
    },

    capturePhotoForTransaction() {
        this.hideModal('transaction-modal');
        setTimeout(() => {
            this.showReceiptUploadModal();
        }, 300);
    },

    chooseFromGallery() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                this.handleReceiptFile(e.target.files[0]);
            }
        };
        input.click();
    },

    // ========== RECEIPT PROCESSING ==========
    
    handleReceiptFile(file) {
        console.log('Processing receipt file:', file.name);
        
        // Show processing indicator
        document.getElementById('processing-indicator').classList.remove('hidden');
        document.getElementById('camera-interface').classList.add('hidden');
        
        // Simulate OCR processing
        setTimeout(() => {
            this.hideModal('receipt-upload-modal');
            this.showTransactionModal();
            
            // Simulate OCR results
            this.simulateOCRProcessing(file);
        }, 2000);
    },

    handleTransactionReceiptUpload(file) {
        console.log('Uploading receipt for transaction:', file.name);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.receiptPreview = e.target.result;
            this.showReceiptPreview(file);
        };
        reader.readAsDataURL(file);
    },

    showReceiptPreview(file) {
        const container = document.getElementById('receipt-preview-container');
        const filename = document.getElementById('receipt-filename');
        const size = document.getElementById('receipt-size');
        
        if (container && filename && size) {
            container.classList.remove('hidden');
            filename.textContent = file.name;
            size.textContent = this.formatFileSize(file.size);
            
            // Show image preview for images
            if (file.type.startsWith('image/')) {
                const imagePreview = document.getElementById('image-preview');
                const img = document.getElementById('receipt-image-preview');
                if (imagePreview && img) {
                    img.src = this.receiptPreview;
                    imagePreview.classList.remove('hidden');
                }
            }
        }
    },

    clearReceiptPreview() {
        this.receiptPreview = null;
        const container = document.getElementById('receipt-preview-container');
        if (container) {
            container.classList.add('hidden');
        }
    },

    simulateOCRProcessing(file) {
        // Mock OCR data based on file
        const mockData = {
            amount: Math.random() * 500 + 50,
            date: new Date().toISOString().split('T')[0],
            merchant: file.name.includes('feed') ? 'Farm Supply Store' : 
                     file.name.includes('medical') ? 'Veterinary Clinic' : 
                     file.name.includes('market') ? 'Local Market' : 'Unknown Merchant',
            category: file.name.includes('feed') ? 'feed' : 
                     file.name.includes('medical') ? 'medical' : 
                     file.name.includes('equipment') ? 'equipment' : 'other-expense'
        };
        
        // Show OCR results
        const ocrResults = document.getElementById('ocr-results');
        const ocrDetails = document.getElementById('ocr-details');
        
        if (ocrResults && ocrDetails) {
            ocrResults.classList.remove('hidden');
            ocrDetails.innerHTML = `
                <div style="font-size: 14px; color: #374151;">
                    <div><strong>Merchant:</strong> ${mockData.merchant}</div>
                    <div><strong>Amount:</strong> ${this.formatCurrency(mockData.amount)}</div>
                    <div><strong>Date:</strong> ${mockData.date}</div>
                    <div><strong>Suggested Category:</strong> ${this.formatCategory(mockData.category)}</div>
                </div>
            `;
            
            // Auto-apply OCR data
            setTimeout(() => {
                this.applyOCRData(mockData);
            }, 1000);
        }
    },

    processReceiptOCR() {
        if (!this.receiptPreview) {
            this.showNotification('Please upload a receipt first', 'warning');
            return;
        }
        
        this.showNotification('Processing receipt OCR...', 'info');
        
        // Simulate OCR processing
        setTimeout(() => {
            const mockData = {
                amount: 125.50,
                date: new Date().toISOString().split('T')[0],
                merchant: 'Farm Supply Store',
                category: 'feed'
            };
            
            const ocrResults = document.getElementById('ocr-results');
            const ocrDetails = document.getElementById('ocr-details');
            
            if (ocrResults && ocrDetails) {
                ocrResults.classList.remove('hidden');
                ocrDetails.innerHTML = `
                    <div style="font-size: 14px; color: #374151;">
                        <div><strong>Merchant:</strong> ${mockData.merchant}</div>
                        <div><strong>Amount:</strong> ${this.formatCurrency(mockData.amount)}</div>
                        <div><strong>Date:</strong> ${mockData.date}</div>
                        <div><strong>Suggested Category:</strong> ${this.formatCategory(mockData.category)}</div>
                    </div>
                `;
            }
            
            this.showNotification('OCR processing complete!', 'success');
        }, 1500);
    },

    applyOCRData(data) {
        // Auto-fill form with OCR data
        const amountInput = document.getElementById('transaction-amount');
        const dateInput = document.getElementById('transaction-date');
        const categorySelect = document.getElementById('transaction-category');
        const descriptionInput = document.getElementById('transaction-description');
        
        if (amountInput) amountInput.value = data.amount.toFixed(2);
        if (dateInput) dateInput.value = data.date;
        if (categorySelect) categorySelect.value = data.category;
        if (descriptionInput) descriptionInput.value = `Purchase from ${data.merchant}`;
        
        this.showNotification('OCR data applied to form', 'success');
    },

    // ========== TRANSACTION CRUD ==========
    
    loadTransactionData(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-payment').value = transaction.paymentMethod;
        document.getElementById('transaction-reference').value = transaction.reference || '';
        document.getElementById('transaction-notes').value = transaction.notes || '';
        
        if (transaction.receipt) {
            this.receiptPreview = transaction.receipt;
            // We would need to reconstruct the file object from base64
            // For now, just show that receipt exists
            this.showNotification('Transaction has attached receipt', 'info');
        }
    },

    saveTransaction() {
        // Get form data
        const id = parseInt(document.getElementById('transaction-id').value) || Date.now();
        const date = document.getElementById('transaction-date').value;
        const type = document.getElementById('transaction-type').value;
        const category = document.getElementById('transaction-category').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const description = document.getElementById('transaction-description').value;
        const paymentMethod = document.getElementById('transaction-payment').value;
        const reference = document.getElementById('transaction-reference').value;
        const notes = document.getElementById('transaction-notes').value;
        
        // Validation
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id,
            date,
            type,
            category,
            amount,
            description,
            paymentMethod,
            reference,
            notes,
            receipt: this.receiptPreview
        };
        
        // Check if editing existing transaction
        const existingIndex = this.transactions.findIndex(t => t.id === id);
        if (existingIndex > -1) {
            // Update existing
            this.transactions[existingIndex] = transaction;
            this.showNotification('Transaction updated successfully!', 'success');
        } else {
            // Add new
            this.transactions.unshift(transaction);
            this.showNotification('Transaction saved successfully!', 'success');
        }
        
        // Save to localStorage
        this.saveData();
        
        // Update UI
        this.updateUI();
        
        // Close modal
        this.hideModal('transaction-modal');
    },

    deleteTransaction() {
        const id = parseInt(document.getElementById('transaction-id').value);
        if (!id) return;
        
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.deleteTransactionRecord(id);
            this.hideModal('transaction-modal');
        }
    },

    deleteTransactionRecord(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.updateUI();
        this.showNotification('Transaction deleted successfully', 'success');
    },

    editTransaction(id) {
        this.showTransactionModal(id);
    },

    // ========== FILTERING & EXPORT ==========
    
    filterTransactions(filter) {
        let filtered = [...this.transactions];
        
        if (filter === 'income') {
            filtered = filtered.filter(t => t.type === 'income');
        } else if (filter === 'expense') {
            filtered = filtered.filter(t => t.type === 'expense');
        }
        
        this.updateTransactionsList(filtered);
    },

    updateTransactionsList(transactions = null) {
        const list = transactions || this.getRecentTransactions(10);
        const container = document.getElementById('transactions-list');
        if (container) {
            container.innerHTML = this.renderTransactionsList(list);
        }
    },

    exportTransactions() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Transactions exported successfully!', 'success');
    },

    // ========== REPORTS ==========
    
    updateFinancialReport() {
        const content = document.getElementById('financial-report-content');
        if (content) {
            content.innerHTML = this.renderFinancialReport();
        }
    },

    updateCategoryAnalysis() {
        const content = document.getElementById('category-analysis-content');
        if (content) {
            content.innerHTML = this.renderCategoryAnalysis();
        }
    },

    printReport() {
        window.print();
    },

    printCategoryAnalysis() {
        window.print();
    },

    // ========== UI UPDATES ==========
    
    updateUI() {
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
    },

    updateStats() {
        const stats = this.calculateStats();
        
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        updateElement('total-income', this.formatCurrency(stats.totalIncome));
        updateElement('total-expenses', this.formatCurrency(stats.totalExpenses));
        updateElement('net-income', this.formatCurrency(stats.netIncome));
    },

    updateCategoryBreakdown() {
        const container = document.getElementById('category-breakdown');
        if (container) {
            container.innerHTML = this.renderCategoryBreakdown();
        }
    },

    // ========== RENDER METHODS ==========
    
    calculateStats() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netIncome = totalIncome - totalExpenses;
        
        return {
            totalIncome,
            totalExpenses,
            netIncome,
            transactionCount: this.transactions.length
        };
    },

    getRecentTransactions(limit = 10) {
        return [...this.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) {
            return `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No transactions yet</div>
                    <div style="font-size: 14px;">Record your first income or expense</div>
                </div>
            `;
        }

        return transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        ${this.formatDate(transaction.date)} • 
                        ${this.getCategoryIcon(transaction.category)} ${this.formatCategory(transaction.category)}
                        ${transaction.reference ? ` • Ref: ${transaction.reference}` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        ${transaction.receipt ? `
                            <button class="btn-icon view-receipt" data-id="${transaction.id}" title="View Receipt">
                                📄
                            </button>
                        ` : ''}
                        <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderCategoryBreakdown() {
        const categories = {};
        
        // Initialize all categories
        this.categories.forEach(cat => {
            categories[cat] = { income: 0, expense: 0 };
        });
        
        // Calculate totals
        this.transactions.forEach(transaction => {
            if (categories[transaction.category]) {
                if (transaction.type === 'income') {
                    categories[transaction.category].income += transaction.amount;
                } else {
                    categories[transaction.category].expense += transaction.amount;
                }
            }
        });
        
        const categoriesWithData = Object.entries(categories)
            .filter(([_, data]) => data.income > 0 || data.expense > 0);
        
        if (categoriesWithData.length === 0) {
            return `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No category data</div>
                    <div style="font-size: 14px;">Add transactions to see category breakdown</div>
                </div>
            `;
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                ${categoriesWithData.map(([category, data]) => {
                    const total = data.income - data.expense;
                    return `
                        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 20px;">${this.getCategoryIcon(category)}</div>
                                <div style="font-weight: 600; color: #1f2937;">${this.formatCategory(category)}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #6b7280;">Income:</span>
                                <span style="font-weight: 600; color: #10b981;">${this.formatCurrency(data.income)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #6b7280;">Expenses:</span>
                                <span style="font-weight: 600; color: #ef4444;">${this.formatCurrency(data.expense)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                <span style="color: #1f2937; font-weight: 600;">Net:</span>
                                <span style="font-weight: bold; color: ${total >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(total)}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderFinancialReport() {
        const stats = this.calculateStats();
        const monthlyData = this.getMonthlyData();
        
        return `
            <div style="padding: 20px;">
                <h4 style="margin-bottom: 20px; color: #1f2937;">Financial Summary</h4>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #0284c7;">${this.formatCurrency(stats.totalIncome)}</div>
                        <div style="color: #6b7280; font-size: 14px;">Total Income</div>
                    </div>
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div style="color: #6b7280; font-size: 14px;">Total Expenses</div>
                    </div>
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${this.formatCurrency(stats.netIncome)}</div>
                        <div style="color: #6b7280; font-size: 14px;">Net Income</div>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 16px; color: #1f2937;">Monthly Trends</h4>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <div id="monthly-chart-placeholder" style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                        <div style="color: #6b7280;">Monthly income vs expenses chart would appear here</div>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 16px; color: #1f2937;">Top Categories</h4>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                    ${this.renderCategoryBreakdownForReport()}
                </div>
            </div>
        `;
    },

    renderCategoryAnalysis() {
        return `
            <div style="padding: 20px;">
                <h4 style="margin-bottom: 20px; color: #1f2937;">Category Analysis</h4>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
                    <div>
                        <h5 style="margin-bottom: 16px; color: #16a34a;">Top Income Categories</h5>
                        ${this.renderTopCategories('income')}
                    </div>
                    <div>
                        <h5 style="margin-bottom: 16px; color: #dc2626;">Top Expense Categories</h5>
                        ${this.renderTopCategories('expense')}
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h5 style="margin-bottom: 16px; color: #1f2937;">Category Distribution</h5>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <div id="category-chart-placeholder" style="text-align: center; padding: 40px;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                            <div style="color: #6b7280;">Category distribution chart would appear here</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTopCategories(type) {
        const categories = {};
        
        this.transactions
            .filter(t => t.type === type)
            .forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });
        
        const sorted = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sorted.length === 0) {
            return `<div style="color: #6b7280; text-align: center; padding: 20px;">No ${type} data</div>`;
        }
        
        return sorted.map(([category, amount]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${this.getCategoryIcon(category)}</span>
                    <span>${this.formatCategory(category)}</span>
                </div>
                <span style="font-weight: bold; color: ${type === 'income' ? '#16a34a' : '#dc2626'}">
                    ${this.formatCurrency(amount)}
                </span>
            </div>
        `).join('');
    },

    renderCategoryBreakdownForReport() {
        const categories = {};
        
        this.transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                categories[t.category].income += t.amount;
            } else {
                categories[t.category].expense += t.amount;
            }
        });
        
        return Object.entries(categories).map(([category, data]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${this.getCategoryIcon(category)}
                    <span>${this.formatCategory(category)}</span>
                </div>
                <div style="display: flex; gap: 20px;">
                    <span style="color: #16a34a; min-width: 80px; text-align: right;">
                        ${this.formatCurrency(data.income)}
                    </span>
                    <span style="color: #dc2626; min-width: 80px; text-align: right;">
                        ${this.formatCurrency(data.expense)}
                    </span>
                    <span style="font-weight: bold; min-width: 80px; text-align: right;">
                        ${this.formatCurrency(data.income - data.expense)}
                    </span>
                </div>
            </div>
        `).join('');
    },

    // ========== UTILITY METHODS ==========
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    formatCategory(category) {
        const names = {
            'sales': 'Sales',
            'services': 'Services',
            'grants': 'Grants',
            'other-income': 'Other Income',
            'feed': 'Feed',
            'medical': 'Medical',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'utilities': 'Utilities',
            'maintenance': 'Maintenance',
            'transport': 'Transport',
            'marketing': 'Marketing',
            'other-expense': 'Other Expenses'
        };
        return names[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    getCategoryIcon(category) {
        const icons = {
            'sales': '💰',
            'services': '🛠️',
            'grants': '🏛️',
            'other-income': '💼',
            'feed': '🌾',
            'medical': '💊',
            'equipment': '🔧',
            'labor': '👷',
            'utilities': '⚡',
            'maintenance': '🔨',
            'transport': '🚚',
            'marketing': '📢',
            'other-expense': '📦'
        };
        return icons[category] || '📝';
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    getMonthlyData() {
        const monthly = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthly[key] = { income: 0, expense: 0 };
        }
        
        // Fill with data
        this.transactions.forEach(t => {
            const date = new Date(t.date);
            const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (monthly[key]) {
                if (t.type === 'income') {
                    monthly[key].income += t.amount;
                } else {
                    monthly[key].expense += t.amount;
                }
            }
        });
        
        return monthly;
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            background: ${type === 'error' ? '#fef2f2' : type === 'success' ? '#f0fdf4' : '#eff6ff'};
            color: ${type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#1d4ed8'};
            border: 1px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#bbf7d0' : '#dbeafe'};
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Initialize the module when the page loads
window.addEventListener('DOMContentLoaded', () => {
    IncomeExpensesModule.initialize();
});
