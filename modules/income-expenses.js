// modules/income-expenses.js
console.log('💰 Income & Expenses module loading...');

// Define the module
const IncomeExpensesModule = {
    name: 'income-expenses',
    version: '1.0.0',
    description: 'Track farm income and expenses with receipt scanning',
    
    // Framework required properties
    initialized: false,
    element: null,
    currentPage: null,
    
    // Module specific properties
    transactions: [],
    categories: ['sales', 'services', 'grants', 'other-income', 'feed', 'medical', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'marketing', 'other-expense'],
    currentEditingId: null,
    receiptPreview: null,
    cameraStream: null,
    scannerStream: null,
    cameraFacingMode: 'environment',
    
    // ========== FRAMEWORK REQUIRED METHODS ==========
    
    initialize() {
        console.log('💰 Initializing Income & Expenses module...');
        
        try {
            // Get the content area from the framework
            this.element = document.getElementById('content-area');
            if (!this.element) {
                console.error('❌ Content area element not found');
                return false;
            }
            
            // Load existing data
            this.loadData();
            
            // Render the module
            this.render();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ Income & Expenses module initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing module:', error);
            return false;
        }
    },
    
    render() {
        if (!this.element) {
            console.error('Cannot render: element not found');
            return;
        }
        
        try {
            const stats = this.calculateStats();
            const recentTransactions = this.getRecentTransactions(10);
            
            this.element.innerHTML = `
                <div class="module-container">
                    <!-- Header -->
                    <div class="module-header">
                        <div>
                            <h1 class="module-title">
                                <i class="fas fa-chart-line"></i> Income & Expenses
                            </h1>
                            <p class="module-subtitle">Track farm finances and cash flow</p>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="add-transaction">
                                <i class="fas fa-plus"></i> Add Transaction
                            </button>
                            <button class="btn btn-outline" id="upload-receipt-btn">
                                <i class="fas fa-receipt"></i> Upload Receipt
                            </button>
                        </div>
                    </div>

                    <!-- Stats Overview -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="stat-value" id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                            <div class="stat-label">Total Income</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                            <div class="stat-label">Total Expenses</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div class="stat-value" id="net-income">${this.formatCurrency(stats.netIncome)}</div>
                            <div class="stat-label">Net Income</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="stat-value">${stats.transactionCount}</div>
                            <div class="stat-label">Transactions</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-action-grid">
                        <button class="quick-action-btn" id="add-income-btn">
                            <div class="quick-action-icon">
                                <i class="fas fa-hand-holding-usd"></i>
                            </div>
                            <span class="quick-action-title">Add Income</span>
                            <span class="quick-action-subtitle">Record farm revenue</span>
                        </button>
                        
                        <button class="quick-action-btn" id="add-expense-btn">
                            <div class="quick-action-icon">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </div>
                            <span class="quick-action-title">Add Expense</span>
                            <span class="quick-action-subtitle">Track farm costs</span>
                        </button>
                        
                        <button class="quick-action-btn" id="financial-report-btn">
                            <div class="quick-action-icon">
                                <i class="fas fa-chart-pie"></i>
                            </div>
                            <span class="quick-action-title">Financial Report</span>
                            <span class="quick-action-subtitle">View detailed analysis</span>
                        </button>
                        
                        <button class="quick-action-btn" id="category-analysis-btn">
                            <div class="quick-action-icon">
                                <i class="fas fa-tags"></i>
                            </div>
                            <span class="quick-action-title">Category Analysis</span>
                            <span class="quick-action-subtitle">Breakdown by category</span>
                        </button>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="section-card">
                        <div class="section-header">
                            <h3><i class="fas fa-history"></i> Recent Transactions</h3>
                            <div class="section-actions">
                                <select id="transaction-filter" class="form-select">
                                    <option value="all">All Transactions</option>
                                    <option value="income">Income Only</option>
                                    <option value="expense">Expenses Only</option>
                                </select>
                                <button class="btn btn-outline" id="export-transactions">
                                    <i class="fas fa-download"></i> Export
                                </button>
                            </div>
                        </div>
                        <div id="transactions-list">
                            ${this.renderTransactionsList(recentTransactions)}
                        </div>
                    </div>

                    <!-- Category Breakdown -->
                    <div class="section-card">
                        <h3><i class="fas fa-chart-bar"></i> Category Breakdown</h3>
                        <div id="category-breakdown">
                            ${this.renderCategoryBreakdown()}
                        </div>
                    </div>
                </div>

                <!-- ========== MODALS ========== -->
                
                <!-- Transaction Modal -->
                <div id="transaction-modal" class="modal-overlay" style="display: none;">
                    ${this.renderTransactionModal()}
                </div>

                <!-- Receipt Upload Modal -->
                <div id="receipt-upload-modal" class="modal-overlay" style="display: none;">
                    ${this.renderReceiptUploadModal()}
                </div>

                <!-- Financial Report Modal -->
                <div id="financial-report-modal" class="modal-overlay" style="display: none;">
                    ${this.renderFinancialReportModal()}
                </div>

                <!-- Category Analysis Modal -->
                <div id="category-analysis-modal" class="modal-overlay" style="display: none;">
                    ${this.renderCategoryAnalysisModal()}
                </div>

                <!-- Receipt Scanner Modal -->
                <div id="receipt-scanner-modal" class="modal-overlay" style="display: none;">
                    ${this.renderReceiptScannerModal()}
                </div>
            `;
            
            // Inject CSS if not already present
            this.injectStyles();
            
            console.log('✅ Module rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering module:', error);
            this.element.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Finance Tracker</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    },
    
    // Framework cleanup method
    cleanup() {
        console.log('🧹 Cleaning up Income & Expenses module...');
        this.stopCamera();
        this.stopScannerCamera();
        this.hideAllModals();
        this.initialized = false;
    },
    
    // ========== DATA MANAGEMENT ==========
    
    loadData() {
        try {
            const saved = localStorage.getItem('farm_finance_transactions');
            this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
            console.log(`📊 Loaded ${this.transactions.length} transactions`);
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.transactions = this.getDemoData();
        }
    },
    
    saveData() {
        try {
            localStorage.setItem('farm_finance_transactions', JSON.stringify(this.transactions));
            console.log('💾 Data saved successfully');
            this.showNotification('Data saved successfully!', 'success');
        } catch (error) {
            console.error('❌ Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    },
    
    getDemoData() {
        return [
            {
                id: 1,
                date: '2024-03-20',
                type: 'income',
                category: 'sales',
                description: 'Egg Sales - Weekly Market',
                amount: 1250.75,
                paymentMethod: 'cash',
                reference: 'INV-001',
                notes: 'Sold 50 crates of eggs',
                receipt: null,
                createdAt: new Date().toISOString()
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
                receipt: null,
                createdAt: new Date().toISOString()
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
                receipt: null,
                createdAt: new Date().toISOString()
            }
        ];
    },
    
    // ========== EVENT LISTENERS ==========
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Main buttons
            if (e.target.closest('#add-transaction')) {
                this.showTransactionModal();
            }
            if (e.target.closest('#upload-receipt-btn')) {
                this.showReceiptUploadModal();
            }
            if (e.target.closest('#add-income-btn')) {
                this.showAddIncome();
            }
            if (e.target.closest('#add-expense-btn')) {
                this.showAddExpense();
            }
            if (e.target.closest('#financial-report-btn')) {
                this.showFinancialReport();
            }
            if (e.target.closest('#category-analysis-btn')) {
                this.showCategoryAnalysis();
            }
            if (e.target.closest('#export-transactions')) {
                this.exportTransactions();
            }
            
            // Modal close buttons
            if (e.target.closest('#close-transaction-modal') || 
                e.target.closest('#cancel-transaction')) {
                this.hideTransactionModal();
            }
            if (e.target.closest('#close-receipt-modal') || 
                e.target.closest('#cancel-receipt-upload')) {
                this.hideReceiptUploadModal();
            }
            if (e.target.closest('#close-financial-report') || 
                e.target.closest('#close-financial-report-btn')) {
                this.hideFinancialReportModal();
            }
            if (e.target.closest('#close-category-analysis') || 
                e.target.closest('#close-category-analysis-btn')) {
                this.hideCategoryAnalysisModal();
            }
            if (e.target.closest('#close-scanner-modal')) {
                this.hideScannerModal();
            }
            
            // Transaction form buttons
            if (e.target.closest('#save-transaction')) {
                this.saveTransaction();
            }
            if (e.target.closest('#delete-transaction')) {
                this.deleteTransaction();
            }
            
            // Receipt buttons
            if (e.target.closest('#process-receipt-btn')) {
                this.processReceiptOCR();
            }
            if (e.target.closest('#use-ocr-data')) {
                this.applyOCRData();
            }
            if (e.target.closest('#remove-receipt')) {
                this.clearReceiptPreview();
            }
            if (e.target.closest('#capture-photo-btn')) {
                this.capturePhotoForTransaction();
            }
            if (e.target.closest('#scan-receipt-btn')) {
                this.showScannerModal();
            }
            
            // Upload modal buttons
            if (e.target.closest('#take-photo-btn')) {
                this.startCamera();
            }
            if (e.target.closest('#choose-existing-btn')) {
                this.chooseFromGallery();
            }
            if (e.target.closest('#capture-btn')) {
                this.capturePhoto();
            }
            if (e.target.closest('#switch-camera-btn')) {
                this.switchCamera();
            }
            if (e.target.closest('#cancel-camera-btn')) {
                this.cancelCamera();
            }
            
            // Scanner buttons
            if (e.target.closest('#scan-capture-btn')) {
                this.captureScannerPhoto();
            }
            
            // Print buttons
            if (e.target.closest('#print-financial-report')) {
                window.print();
            }
            if (e.target.closest('#print-category-analysis')) {
                window.print();
            }
            
            // Edit/Delete transaction buttons (delegated)
            if (e.target.closest('.edit-transaction')) {
                const id = parseInt(e.target.closest('.edit-transaction').dataset.id);
                this.editTransaction(id);
            }
            if (e.target.closest('.delete-transaction')) {
                const id = parseInt(e.target.closest('.delete-transaction').dataset.id);
                if (confirm('Are you sure you want to delete this transaction?')) {
                    this.deleteTransactionRecord(id);
                }
            }
            if (e.target.closest('.view-receipt')) {
                const id = parseInt(e.target.closest('.view-receipt').dataset.id);
                this.viewReceipt(id);
            }
            
            // Close modals when clicking outside
            if (e.target.classList.contains('modal-overlay')) {
                this.hideAllModals();
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
                if (e.target.files[0]) {
                    this.handleTransactionReceiptUpload(e.target.files[0]);
                }
            }
            if (e.target.id === 'receipt-file-input') {
                if (e.target.files[0]) {
                    this.handleReceiptFile(e.target.files[0]);
                }
            }
        });
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'transaction-form') {
                e.preventDefault();
                this.saveTransaction();
            }
        });
        
        console.log('✅ Event listeners setup complete');
    },
    
    setupDragAndDrop() {
        // Receipt upload area in transaction modal
        const receiptUploadArea = document.getElementById('receipt-upload-area');
        if (receiptUploadArea) {
            receiptUploadArea.addEventListener('click', () => {
                document.getElementById('receipt-upload').click();
            });
            
            receiptUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                receiptUploadArea.style.borderColor = '#3b82f6';
                receiptUploadArea.style.background = '#f8fafc';
            });
            
            receiptUploadArea.addEventListener('dragleave', () => {
                receiptUploadArea.style.borderColor = '#d1d5db';
                receiptUploadArea.style.background = '';
            });
            
            receiptUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                receiptUploadArea.style.borderColor = '#d1d5db';
                receiptUploadArea.style.background = '';
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleTransactionReceiptUpload(file);
                }
            });
        }
        
        // Main upload drop zone
        const dropZoneMain = document.getElementById('drop-zone-main');
        if (dropZoneMain) {
            dropZoneMain.addEventListener('click', () => {
                document.getElementById('receipt-file-input').click();
            });
            
            dropZoneMain.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZoneMain.style.borderColor = '#3b82f6';
                dropZoneMain.style.background = '#f8fafc';
            });
            
            dropZoneMain.addEventListener('dragleave', () => {
                dropZoneMain.style.borderColor = '#d1d5db';
                dropZoneMain.style.background = '';
            });
            
            dropZoneMain.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZoneMain.style.borderColor = '#d1d5db';
                dropZoneMain.style.background = '';
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleReceiptFile(file);
                }
            });
        }
    },
    
    // ========== MODAL CONTROL METHODS ==========
    
    showModal(id) {
        this.hideAllModals();
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    
    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    hideAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
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
        const cameraInterface = document.getElementById('camera-interface');
        if (cameraInterface) cameraInterface.classList.add('hidden');
        const processingIndicator = document.getElementById('processing-indicator');
        if (processingIndicator) processingIndicator.classList.add('hidden');
    },
    
    showScannerModal() {
        this.showModal('receipt-scanner-modal');
        this.startScannerCamera();
    },
    
    hideScannerModal() {
        this.hideModal('receipt-scanner-modal');
        this.stopScannerCamera();
    },
    
    showFinancialReport() {
        this.showModal('financial-report-modal');
        this.updateFinancialReport();
    },
    
    hideFinancialReportModal() {
        this.hideModal('financial-report-modal');
    },
    
    showCategoryAnalysis() {
        this.showModal('category-analysis-modal');
        this.updateCategoryAnalysis();
    },
    
    hideCategoryAnalysisModal() {
        this.hideModal('category-analysis-modal');
    },
    
    hideTransactionModal() {
        this.hideModal('transaction-modal');
        this.clearReceiptPreview();
        this.currentEditingId = null;
    },
    
    hideReceiptUploadModal() {
        this.hideModal('receipt-upload-modal');
        this.stopCamera();
    },
    
    // ========== CAMERA METHODS ==========
    
    async startCamera() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not available');
            }
            
            const constraints = {
                video: { 
                    facingMode: this.cameraFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('camera-preview');
            if (video) {
                video.srcObject = this.cameraStream;
                video.play().catch(e => console.error('Video play error:', e));
            }
            
            const cameraInterface = document.getElementById('camera-interface');
            if (cameraInterface) cameraInterface.classList.remove('hidden');
            
            const dropZoneMain = document.getElementById('drop-zone-main');
            if (dropZoneMain) dropZoneMain.style.display = 'none';
            
        } catch (error) {
            console.error('❌ Camera error:', error);
            this.showNotification('Could not access camera. Please check permissions.', 'error');
        }
    },
    
    async startScannerCamera() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not available');
            }
            
            const constraints = {
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            
            this.scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('scanner-preview');
            if (video) {
                video.srcObject = this.scannerStream;
                video.play().catch(e => console.error('Video play error:', e));
            }
            
        } catch (error) {
            console.error('❌ Scanner camera error:', error);
            this.showNotification('Could not access scanner camera. Please check permissions.', 'error');
        }
    },
    
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            this.cameraStream = null;
        }
    },
    
    stopScannerCamera() {
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(track => {
                track.stop();
            });
            this.scannerStream = null;
        }
    },
    
    switchCamera() {
        this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
        this.stopCamera();
        setTimeout(() => this.startCamera(), 100);
    },
    
    cancelCamera() {
        this.stopCamera();
        const cameraInterface = document.getElementById('camera-interface');
        if (cameraInterface) cameraInterface.classList.add('hidden');
        
        const dropZoneMain = document.getElementById('drop-zone-main');
        if (dropZoneMain) dropZoneMain.style.display = 'block';
    },
    
    capturePhoto() {
        const video = document.getElementById('camera-preview');
        if (!video || !video.videoWidth) {
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                this.handleReceiptFile(file);
                this.stopCamera();
                this.hideReceiptUploadModal();
            }
        }, 'image/jpeg', 0.9);
    },
    
    captureScannerPhoto() {
        const video = document.getElementById('scanner-preview');
        if (!video || !video.videoWidth) {
            this.showNotification('Scanner not ready', 'error');
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'scanner-capture.jpg', { type: 'image/jpeg' });
                this.handleReceiptFile(file);
                this.hideScannerModal();
            }
        }, 'image/jpeg', 0.9);
    },
    
    capturePhotoForTransaction() {
        this.hideTransactionModal();
        setTimeout(() => {
            this.showReceiptUploadModal();
        }, 300);
    },
    
    chooseFromGallery() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleReceiptFile(e.target.files[0]);
            }
        };
        input.click();
    },
    
    // ========== RECEIPT PROCESSING ==========
    
    handleReceiptFile(file) {
        console.log('📄 Processing receipt file:', file.name);
        
        // Show processing indicator
        const processingIndicator = document.getElementById('processing-indicator');
        if (processingIndicator) {
            processingIndicator.classList.remove('hidden');
        }
        
        const cameraInterface = document.getElementById('camera-interface');
        if (cameraInterface) {
            cameraInterface.classList.add('hidden');
        }
        
        // Simulate OCR processing
        setTimeout(() => {
            this.hideReceiptUploadModal();
            this.showTransactionModal();
            
            // Simulate OCR results
            this.simulateOCRProcessing(file);
            
            // Also upload to transaction
            this.handleTransactionReceiptUpload(file);
        }, 2000);
    },
    
    handleTransactionReceiptUpload(file) {
        console.log('📄 Uploading receipt for transaction:', file.name);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.receiptPreview = e.target.result;
            this.showReceiptPreview(file);
        };
        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
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
        const receiptInput = document.getElementById('receipt-upload');
        if (receiptInput) {
            receiptInput.value = '';
        }
    },
    
    simulateOCRProcessing(file) {
        // Mock OCR data based on file
        const mockData = {
            amount: Math.random() * 500 + 50,
            date: new Date().toISOString().split('T')[0],
            merchant: file.name.includes('feed') ? 'Farm Supply Store' : 
                     file.name.includes('medical') ? 'Veterinary Clinic' : 
                     file.name.includes('market') ? 'Local Market' : 'General Store',
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
    
    viewReceipt(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction || !transaction.receipt) {
            this.showNotification('No receipt available for this transaction', 'info');
            return;
        }
        
        // Open receipt in new window
        const receiptWindow = window.open();
        if (receiptWindow) {
            receiptWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt - Transaction #${id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            img { max-width: 100%; height: auto; }
                        </style>
                    </head>
                    <body>
                        <h1>Receipt</h1>
                        <p><strong>Transaction:</strong> ${transaction.description}</p>
                        <p><strong>Date:</strong> ${this.formatDate(transaction.date)}</p>
                        <p><strong>Amount:</strong> ${this.formatCurrency(transaction.amount)}</p>
                        <img src="${transaction.receipt}" alt="Receipt">
                        <p><button onclick="window.print()">Print</button></p>
                    </body>
                </html>
            `);
        }
    },
    
    // ========== TRANSACTION CRUD ==========
    
    loadTransactionData(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) {
            console.error('Transaction not found:', id);
            return;
        }
        
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-payment').value = transaction.paymentMethod || 'cash';
        document.getElementById('transaction-reference').value = transaction.reference || '';
        document.getElementById('transaction-notes').value = transaction.notes || '';
        
        if (transaction.receipt) {
            this.receiptPreview = transaction.receipt;
            // Create a mock file object for preview
            const mockFile = {
                name: 'receipt.jpg',
                size: 1024 * 1024, // 1MB
                type: 'image/jpeg'
            };
            this.showReceiptPreview(mockFile);
        }
    },
    
    saveTransaction() {
        // Get form data
        const id = parseInt(document.getElementById('transaction-id').value) || Date.now();
        const date = document.getElementById('transaction-date').value;
        const type = document.getElementById('transaction-type').value;
        const category = document.getElementById('transaction-category').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const description = document.getElementById('transaction-description').value.trim();
        const paymentMethod = document.getElementById('transaction-payment').value;
        const reference = document.getElementById('transaction-reference').value.trim();
        const notes = document.getElementById('transaction-notes').value.trim();
        
        // Validation
        if (!date) {
            this.showNotification('Please select a date', 'error');
            return;
        }
        if (!type) {
            this.showNotification('Please select transaction type', 'error');
            return;
        }
        if (!category) {
            this.showNotification('Please select a category', 'error');
            return;
        }
        if (!amount || amount <= 0 || isNaN(amount)) {
            this.showNotification('Please enter a valid amount greater than 0', 'error');
            return;
        }
        if (!description) {
            this.showNotification('Please enter a description', 'error');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id,
            date,
            type,
            category,
            amount: parseFloat(amount.toFixed(2)),
            description,
            paymentMethod,
            reference,
            notes,
            receipt: this.receiptPreview,
            createdAt: new Date().toISOString()
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
        this.hideTransactionModal();
    },
    
    deleteTransaction() {
        const idInput = document.getElementById('transaction-id');
        if (!idInput || !idInput.value) return;
        
        const id = parseInt(idInput.value);
        this.deleteTransactionRecord(id);
        this.hideTransactionModal();
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
        
        const exportFileDefaultName = `farm-transactions-${new Date().toISOString().split('T')[0]}.json`;
        
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
    
    renderTransactionModal() {
        return `
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
                                <div class="drop-zone-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="drop-zone-title">Upload Receipt</div>
                                <div class="drop-zone-subtitle">Click to upload or drag & drop</div>
                                <div class="drop-zone-info">Supports JPG, PNG, PDF (Max 10MB)</div>
                                <input type="file" id="receipt-upload" accept="image/*,.pdf" style="display: none;">
                            </div>
                            
                            <!-- Receipt Preview -->
                            <div id="receipt-preview-container" class="hidden">
                                <div class="receipt-preview-header">
                                    <div class="receipt-file-info">
                                        <div class="receipt-icon">
                                            <i class="fas fa-file-alt"></i>
                                        </div>
                                        <div>
                                            <div class="receipt-filename" id="receipt-filename">receipt.jpg</div>
                                            <div class="receipt-size" id="receipt-size">2.5 MB</div>
                                        </div>
                                    </div>
                                    <button type="button" id="remove-receipt" class="btn-icon">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                
                                <!-- Image Preview -->
                                <div id="image-preview" class="hidden">
                                    <img id="receipt-image-preview" src="" alt="Receipt preview">
                                </div>
                                
                                <!-- OCR Button -->
                                <button type="button" id="process-receipt-btn" class="btn btn-outline full-width">
                                    <i class="fas fa-search"></i> Extract Information from Receipt
                                </button>
                                
                                <!-- Camera Capture -->
                                <div class="camera-actions">
                                    <button type="button" id="capture-photo-btn" class="btn btn-outline">
                                        <i class="fas fa-camera"></i> Capture Photo
                                    </button>
                                    <button type="button" id="scan-receipt-btn" class="btn btn-outline">
                                        <i class="fas fa-qrcode"></i> Scan Receipt
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- OCR Results -->
                        <div id="ocr-results" class="hidden">
                            <div class="ocr-header">
                                <h4><i class="fas fa-file-alt"></i> Extracted from Receipt</h4>
                                <button type="button" id="use-ocr-data" class="btn btn-primary">Apply</button>
                            </div>
                            <div id="ocr-details"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" id="cancel-transaction">Cancel</button>
                    <button type="button" class="btn btn-danger" id="delete-transaction" style="display: none;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button type="button" class="btn btn-primary" id="save-transaction">
                        <i class="fas fa-save"></i> Save Transaction
                    </button>
                </div>
            </div>
        `;
    },
    
    renderReceiptUploadModal() {
        return `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-receipt"></i> Upload Receipt</h3>
                    <button class="modal-close" id="close-receipt-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upload-container">
                        <div class="upload-icon">
                            <i class="fas fa-file-upload"></i>
                        </div>
                        <h4>Upload Receipt for Processing</h4>
                        <p>Upload a receipt photo or PDF to automatically extract transaction details</p>
                        
                        <div class="drop-zone-lg" id="drop-zone-main">
                            <div class="drop-zone-lg-icon">
                                <i class="fas fa-upload"></i>
                            </div>
                            <div class="drop-zone-lg-title">Drag & Drop Receipt Here</div>
                            <div class="drop-zone-lg-subtitle">or click to browse files</div>
                            <input type="file" id="receipt-file-input" accept="image/*,.pdf" style="display: none;">
                        </div>
                        
                        <div class="upload-info">
                            Supported formats: JPG, PNG, PDF (Max 10MB)
                        </div>
                        
                        <div class="upload-actions">
                            <button type="button" id="take-photo-btn" class="btn btn-outline full-width">
                                <i class="fas fa-camera"></i> Take Photo
                            </button>
                            <button type="button" id="choose-existing-btn" class="btn btn-outline full-width">
                                <i class="fas fa-folder-open"></i> Choose from Gallery
                            </button>
                        </div>
                    </div>
                    
                    <!-- Camera Interface -->
                    <div id="camera-interface" class="hidden">
                        <h4><i class="fas fa-camera"></i> Camera</h4>
                        <div class="camera-preview-container">
                            <video id="camera-preview" autoplay playsinline></video>
                            <div class="camera-overlay"></div>
                        </div>
                        <div class="camera-controls">
                            <button type="button" id="capture-btn" class="btn btn-primary">
                                <i class="fas fa-camera"></i> Capture
                            </button>
                            <button type="button" id="switch-camera-btn" class="btn btn-outline">
                                <i class="fas fa-sync"></i> Switch Camera
                            </button>
                            <button type="button" id="cancel-camera-btn" class="btn btn-outline">
                                <i class="fas fa-times"></i> Cancel
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
        `;
    },
    
    renderFinancialReportModal() {
        return `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 id="financial-report-title"><i class="fas fa-chart-pie"></i> Financial Report</h3>
                    <button class="modal-close" id="close-financial-report">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="financial-report-content">
                        ${this.renderFinancialReport()}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="print-financial-report">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn btn-primary" id="close-financial-report-btn">Close</button>
                </div>
            </div>
        `;
    },
    
    renderCategoryAnalysisModal() {
        return `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 id="category-analysis-title"><i class="fas fa-tags"></i> Category Analysis</h3>
                    <button class="modal-close" id="close-category-analysis">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="category-analysis-content">
                        ${this.renderCategoryAnalysis()}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="print-category-analysis">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn btn-primary" id="close-category-analysis-btn">Close</button>
                </div>
            </div>
        `;
    },
    
    renderReceiptScannerModal() {
        return `
            <div class="modal-content" style="max-width: 100%; height: 100%; background: #000;">
                <div class="modal-header" style="background: rgba(0,0,0,0.7);">
                    <h3 style="color: white;"><i class="fas fa-qrcode"></i> Receipt Scanner</h3>
                    <button class="modal-close" id="close-scanner-modal" style="color: white;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0; height: calc(100% - 60px);">
                    <div class="scanner-container">
                        <video id="scanner-preview" autoplay playsinline></video>
                        <div class="scanner-overlay"></div>
                        <div class="scanner-controls">
                            <p>Hold steady and align receipt within the frame</p>
                            <button type="button" id="scan-capture-btn" class="btn btn-primary">
                                <i class="fas fa-camera"></i> Capture Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
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
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <h4>No transactions yet</h4>
                    <p>Record your first income or expense to get started</p>
                    <button class="btn btn-primary" onclick="window.FarmModules.modules['income-expenses'].showTransactionModal()">
                        <i class="fas fa-plus"></i> Add Transaction
                    </button>
                </div>
            `;
        }

        return `
            <div class="transactions-list">
                ${transactions.map(transaction => {
                    const isIncome = transaction.type === 'income';
                    const amountColor = isIncome ? '#10b981' : '#ef4444';
                    const icon = isIncome ? '💰' : '💸';
                    const categoryIcon = this.getCategoryIcon(transaction.category);
                    
                    return `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <div class="transaction-icon">${icon}</div>
                                <div class="transaction-details">
                                    <h4 class="transaction-title">${transaction.description}</h4>
                                    <div class="transaction-meta">
                                        <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                                        <span class="transaction-category">${categoryIcon} ${this.formatCategory(transaction.category)}</span>
                                        ${transaction.reference ? `<span class="transaction-reference">Ref: ${transaction.reference}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="transaction-actions">
                                <div class="transaction-amount" style="color: ${amountColor};">
                                    ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                </div>
                                <div class="transaction-buttons">
                                    ${transaction.receipt ? `
                                        <button class="btn-icon view-receipt" data-id="${transaction.id}" title="View Receipt">
                                            <i class="fas fa-receipt"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">
                                        <i class="fas fa-trash"></i>
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
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h4>No category data</h4>
                    <p>Add transactions to see category breakdown</p>
                </div>
            `;
        }

        return `
            <div class="categories-grid">
                ${categoriesWithData.map(([category, data]) => {
                    const total = data.income - data.expense;
                    const icon = this.getCategoryIcon(category);
                    
                    return `
                        <div class="category-card">
                            <div class="category-header">
                                <div class="category-icon">${icon}</div>
                                <h4 class="category-name">${this.formatCategory(category)}</h4>
                            </div>
                            <div class="category-stats">
                                <div class="category-stat">
                                    <span class="stat-label">Income:</span>
                                    <span class="stat-value income">${this.formatCurrency(data.income)}</span>
                                </div>
                                <div class="category-stat">
                                    <span class="stat-label">Expenses:</span>
                                    <span class="stat-value expense">${this.formatCurrency(data.expense)}</span>
                                </div>
                                <div class="category-stat total">
                                    <span class="stat-label">Net:</span>
                                    <span class="stat-value ${total >= 0 ? 'income' : 'expense'}">
                                        ${this.formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderFinancialReport() {
        const stats = this.calculateStats();
        
        return `
            <div class="report-container">
                <div class="report-header">
                    <h4>Financial Summary</h4>
                    <div class="report-date">${new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                
                <div class="report-summary">
                    <div class="summary-card income">
                        <div class="summary-value">${this.formatCurrency(stats.totalIncome)}</div>
                        <div class="summary-label">Total Income</div>
                    </div>
                    <div class="summary-card expense">
                        <div class="summary-value">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div class="summary-label">Total Expenses</div>
                    </div>
                    <div class="summary-card net">
                        <div class="summary-value">${this.formatCurrency(stats.netIncome)}</div>
                        <div class="summary-label">Net Income</div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h5>Monthly Trends</h5>
                    <div class="chart-placeholder">
                        <i class="fas fa-chart-line"></i>
                        <p>Monthly income vs expenses chart</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h5>Category Breakdown</h5>
                    ${this.renderCategoryBreakdownForReport()}
                </div>
            </div>
        `;
    },
    
    renderCategoryAnalysis() {
        return `
            <div class="analysis-container">
                <div class="analysis-section">
                    <h4>Income Categories</h4>
                    ${this.renderTopCategories('income')}
                </div>
                
                <div class="analysis-section">
                    <h4>Expense Categories</h4>
                    ${this.renderTopCategories('expense')}
                </div>
                
                <div class="analysis-section">
                    <h4>Category Distribution</h4>
                    <div class="chart-placeholder">
                        <i class="fas fa-chart-pie"></i>
                        <p>Category distribution chart</p>
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
            return `<div class="empty-categories">No ${type} data available</div>`;
        }
        
        return `
            <div class="top-categories">
                ${sorted.map(([category, amount]) => `
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-icon">${this.getCategoryIcon(category)}</span>
                            <span class="category-name">${this.formatCategory(category)}</span>
                        </div>
                        <span class="category-amount ${type}">
                            ${this.formatCurrency(amount)}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
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
        
        return `
            <div class="report-categories">
                <div class="report-categories-header">
                    <span>Category</span>
                    <span>Income</span>
                    <span>Expense</span>
                    <span>Net</span>
                </div>
                ${Object.entries(categories).map(([category, data]) => {
                    const net = data.income - data.expense;
                    return `
                        <div class="report-category-item">
                            <span class="category-name">
                                ${this.getCategoryIcon(category)} ${this.formatCategory(category)}
                            </span>
                            <span class="category-income">${this.formatCurrency(data.income)}</span>
                            <span class="category-expense">${this.formatCurrency(data.expense)}</span>
                            <span class="category-net ${net >= 0 ? 'positive' : 'negative'}">
                                ${this.formatCurrency(net)}
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // ========== UTILITY METHODS ==========
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    },
    
    formatCategory(category) {
        const names = {
            'sales': 'Sales',
            'services': 'Services',
            'grants': 'Grants/Subsidies',
            'other-income': 'Other Income',
            'feed': 'Feed',
            'medical': 'Medical/Vet',
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
    
    injectStyles() {
        if (document.getElementById('income-expenses-styles')) {
            return; // Styles already injected
        }
        
        const styles = document.createElement('style');
        styles.id = 'income-expenses-styles';
        styles.textContent = `
            /* Income & Expenses Module Styles */
            
            .module-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .module-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
            }
            
            .module-title {
                font-size: 2rem;
                margin: 0 0 8px 0;
                color: white;
            }
            
            .module-subtitle {
                margin: 0;
                opacity: 0.9;
                color: white;
            }
            
            .header-actions {
                display: flex;
                gap: 12px;
            }
            
            .btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
                font-size: 14px;
            }
            
            .btn-primary {
                background: white;
                color: #667eea;
            }
            
            .btn-primary:hover {
                background: #f8fafc;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .btn-outline {
                background: transparent;
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
            }
            
            .btn-outline:hover {
                background: rgba(255,255,255,0.1);
                border-color: white;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-danger:hover {
                background: #dc2626;
            }
            
            .btn-icon {
                background: none;
                border: none;
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #6b7280;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-icon:hover {
                background: #f3f4f6;
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
                transition: transform 0.2s;
            }
            
            .stat-card:hover {
                transform: translateY(-4px);
            }
            
            .stat-icon {
                font-size: 32px;
                color: #667eea;
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
                gap: 12px;
            }
            
            .quick-action-btn:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border-color: #667eea;
            }
            
            .quick-action-icon {
                font-size: 32px;
                color: #667eea;
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
                align-items: center;
            }
            
            .form-select {
                padding: 8px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            }
            
            /* Modal Overlay */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                border-radius: 4px;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            /* Form Styles */
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
                font-size: 14px;
            }
            
            .form-input {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #667eea;
            }
            
            textarea.form-input {
                min-height: 100px;
                resize: vertical;
            }
            
            /* Drop Zone */
            .drop-zone {
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 16px;
            }
            
            .drop-zone:hover {
                border-color: #667eea;
                background: #f8fafc;
            }
            
            .drop-zone-icon {
                font-size: 48px;
                color: #9ca3af;
                margin-bottom: 12px;
            }
            
            .drop-zone-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .drop-zone-subtitle {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 4px;
            }
            
            .drop-zone-info {
                color: #9ca3af;
                font-size: 12px;
            }
            
            .drop-zone-lg {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 40px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 24px;
            }
            
            .drop-zone-lg-icon {
                font-size: 64px;
                color: #9ca3af;
                margin-bottom: 16px;
            }
            
            .drop-zone-lg-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 8px;
            }
            
            .drop-zone-lg-subtitle {
                color: #6b7280;
                font-size: 14px;
            }
            
            .hidden {
                display: none !important;
            }
            
            .full-width {
                width: 100%;
            }
            
            /* Transactions List */
            .transactions-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .transaction-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                transition: background-color 0.2s;
            }
            
            .transaction-item:hover {
                background: #f1f5f9;
            }
            
            .transaction-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .transaction-icon {
                font-size: 20px;
            }
            
            .transaction-details {
                flex: 1;
            }
            
            .transaction-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                color: #1f2937;
            }
            
            .transaction-meta {
                display: flex;
                gap: 12px;
                font-size: 14px;
                color: #6b7280;
            }
            
            .transaction-actions {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .transaction-amount {
                font-weight: bold;
                font-size: 18px;
                min-width: 100px;
                text-align: right;
            }
            
            .transaction-buttons {
                display: flex;
                gap: 8px;
            }
            
            /* Categories Grid */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 16px;
            }
            
            .category-card {
                background: #f8fafc;
                border-radius: 8px;
                padding: 16px;
                border: 1px solid #e5e7eb;
            }
            
            .category-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .category-icon {
                font-size: 20px;
            }
            
            .category-name {
                margin: 0;
                font-size: 16px;
                color: #1f2937;
            }
            
            .category-stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .category-stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .stat-label {
                color: #6b7280;
                font-size: 14px;
            }
            
            .stat-value {
                font-weight: 600;
                font-size: 14px;
            }
            
            .stat-value.income {
                color: #10b981;
            }
            
            .stat-value.expense {
                color: #ef4444;
            }
            
            .category-stat.total {
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #e5e7eb;
                font-weight: bold;
            }
            
            /* Empty States */
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6b7280;
            }
            
            .empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #9ca3af;
            }
            
            .empty-state h4 {
                margin: 0 0 8px 0;
                color: #4b5563;
            }
            
            .empty-state p {
                margin: 0 0 16px 0;
                font-size: 14px;
            }
            
            /* Camera Preview */
            .camera-preview-container {
                position: relative;
                width: 100%;
                max-width: 400px;
                margin: 0 auto 20px;
            }
            
            #camera-preview, #scanner-preview {
                width: 100%;
                height: auto;
                border-radius: 8px;
                background: #000;
            }
            
            .camera-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 200px;
                border: 3px solid #22c55e;
                border-radius: 12px;
                pointer-events: none;
            }
            
            .camera-controls {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .scanner-container {
                position: relative;
                height: 100%;
            }
            
            .scanner-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 200px;
                border: 3px solid #22c55e;
                border-radius: 12px;
                pointer-events: none;
            }
            
            .scanner-controls {
                position: absolute;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
                color: white;
                background: rgba(0,0,0,0.5);
                padding: 16px;
            }
            
            /* Upload Container */
            .upload-container {
                text-align: center;
                padding: 20px;
            }
            
            .upload-icon {
                font-size: 64px;
                color: #667eea;
                margin-bottom: 20px;
            }
            
            .upload-container h4 {
                margin: 0 0 8px 0;
                color: #1f2937;
            }
            
            .upload-container p {
                color: #6b7280;
                margin-bottom: 24px;
            }
            
            .upload-info {
                color: #9ca3af;
                font-size: 12px;
                margin-bottom: 24px;
            }
            
            .upload-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            /* Processing Indicator */
            #processing-indicator {
                text-align: center;
                padding: 40px 20px;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            #processing-indicator h4 {
                margin: 0 0 8px 0;
                color: #1f2937;
            }
            
            #processing-indicator p {
                color: #6b7280;
                margin-bottom: 16px;
            }
            
            #ocr-progress {
                color: #9ca3af;
                font-size: 14px;
            }
            
            /* Receipt Preview */
            .receipt-preview-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 12px;
            }
            
            .receipt-file-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .receipt-icon {
                font-size: 24px;
                color: #667eea;
            }
            
            .receipt-filename {
                font-weight: 600;
                color: #1f2937;
            }
            
            .receipt-size {
                font-size: 12px;
                color: #6b7280;
            }
            
            #image-preview {
                margin-bottom: 12px;
            }
            
            #receipt-image-preview {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .camera-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            /* OCR Results */
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
            
            .ocr-header h4 {
                margin: 0;
                color: #1e40af;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Report Styles */
            .report-container {
                padding: 20px;
            }
            
            .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .report-header h4 {
                margin: 0;
                color: #1f2937;
            }
            
            .report-date {
                color: #6b7280;
                font-size: 14px;
            }
            
            .report-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .summary-card {
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            
            .summary-card.income {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
            }
            
            .summary-card.expense {
                background: #fef2f2;
                border: 1px solid #fecaca;
            }
            
            .summary-card.net {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
            }
            
            .summary-value {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .summary-card.income .summary-value {
                color: #16a34a;
            }
            
            .summary-card.expense .summary-value {
                color: #dc2626;
            }
            
            .summary-card.net .summary-value {
                color: #2563eb;
            }
            
            .summary-label {
                color: #6b7280;
                font-size: 14px;
            }
            
            .report-section {
                margin-bottom: 30px;
            }
            
            .report-section h5 {
                margin: 0 0 16px 0;
                color: #1f2937;
                font-size: 18px;
            }
            
            .chart-placeholder {
                background: #f8fafc;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
                color: #6b7280;
            }
            
            .chart-placeholder i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #9ca3af;
            }
            
            .chart-placeholder p {
                margin: 0;
            }
            
            .report-categories {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .report-categories-header {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 16px;
                padding: 12px 16px;
                background: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .report-category-item {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 16px;
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                align-items: center;
            }
            
            .report-category-item:last-child {
                border-bottom: none;
            }
            
            .category-name {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #1f2937;
            }
            
            .category-income {
                color: #16a34a;
                font-weight: 500;
            }
            
            .category-expense {
                color: #dc2626;
                font-weight: 500;
            }
            
            .category-net {
                font-weight: bold;
            }
            
            .category-net.positive {
                color: #16a34a;
            }
            
            .category-net.negative {
                color: #dc2626;
            }
            
            /* Analysis Styles */
            .analysis-container {
                padding: 20px;
            }
            
            .analysis-section {
                margin-bottom: 30px;
            }
            
            .analysis-section h4 {
                margin: 0 0 16px 0;
                color: #1f2937;
                font-size: 18px;
            }
            
            .top-categories {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .category-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
            }
            
            .category-info {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .category-amount {
                font-weight: bold;
                font-size: 16px;
            }
            
            .category-amount.income {
                color: #16a34a;
            }
            
            .category-amount.expense {
                color: #dc2626;
            }
            
            .empty-categories {
                padding: 20px;
                text-align: center;
                color: #6b7280;
                background: #f8fafc;
                border-radius: 8px;
                font-size: 14px;
            }
            
            /* Notification Styles */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 8px;
                background: white;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .notification.success {
                border-left: 4px solid #10b981;
            }
            
            .notification.error {
                border-left: 4px solid #ef4444;
            }
            
            .notification.info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification.warning {
                border-left: 4px solid #f59e0b;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .module-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                    text-align: center;
                }
                
                .header-actions {
                    justify-content: center;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid,
                .quick-action-grid {
                    grid-template-columns: 1fr;
                }
                
                .report-summary {
                    grid-template-columns: 1fr;
                }
                
                .categories-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    max-width: 100%;
                    margin: 10px;
                }
                
                .transaction-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .transaction-actions {
                    justify-content: space-between;
                }
                
                .report-categories-header,
                .report-category-item {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(el => el.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : 'ℹ️';
        
        notification.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// ========== FRAMEWORK REGISTRATION ==========
// This is the key part that registers the module with your framework

console.log('📦 Registering Income & Expenses module...');

// Check if FarmModules exists and register
if (typeof window.FarmModules !== 'undefined') {
    // Register with the framework
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with FarmModules');
} else {
    // Fallback: Create global reference
    window.IncomeExpensesModule = IncomeExpensesModule;
    console.log('⚠️ FarmModules not found, module available as window.IncomeExpensesModule');
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('content-area')) {
                IncomeExpensesModule.initialize();
            }
        });
    } else {
        setTimeout(() => {
            if (document.getElementById('content-area')) {
                IncomeExpensesModule.initialize();
            }
        }, 100);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncomeExpensesModule;
}
