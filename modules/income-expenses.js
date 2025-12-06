// modules/income-expenses.js - With Receipt Import Feature
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    id: 'income-expenses',
    initialized: false,
    element: null,
    categories: {
        income: [
            { value: 'egg-sales', label: 'Egg Sales', icon: '🥚' },
            { value: 'poultry-sales', label: 'Poultry Sales', icon: '🐔' },
            { value: 'crop-sales', label: 'Crop Sales', icon: '🌽' },
            { value: 'dairy-sales', label: 'Dairy Sales', icon: '🥛' },
            { value: 'meat-sales', label: 'Meat Sales', icon: '🥩' },
            { value: 'farm-tourism', label: 'Farm Tourism', icon: '🏞️' },
            { value: 'consulting', label: 'Consulting Services', icon: '💼' },
            { value: 'grants', label: 'Grants & Subsidies', icon: '💰' },
            { value: 'other-income', label: 'Other Income', icon: '📦' }
        ],
        expense: [
            { value: 'feed', label: 'Feed & Nutrition', icon: '🌾' },
            { value: 'medication', label: 'Healthcare', icon: '💊' },
            { value: 'equipment', label: 'Equipment', icon: '🔧' },
            { value: 'labor', label: 'Labor', icon: '👷' },
            { value: 'utilities', label: 'Utilities', icon: '⚡' },
            { value: 'transportation', label: 'Transportation', icon: '🚚' },
            { value: 'maintenance', label: 'Maintenance', icon: '🔨' },
            { value: 'seeds-plants', label: 'Seeds & Plants', icon: '🌱' },
            { value: 'fertilizer', label: 'Fertilizer', icon: '🧪' },
            { value: 'insurance', label: 'Insurance', icon: '🛡️' },
            { value: 'rent', label: 'Rent & Leases', icon: '🏠' },
            { value: 'marketing', label: 'Marketing', icon: '📢' },
            { value: 'taxes', label: 'Taxes', icon: '🧾' },
            { value: 'other-expense', label: 'Other Expense', icon: '📦' }
        ]
    },
    receiptQueue: [],
    currentReceipt: null,

    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        // Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found');
            return false;
        }

        // Ensure CSS is loaded
        this.ensureModuleCSS();
        
        // Load existing data first
        this.loadData();
        
        // Render module
        this.renderModule();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load and display data
        this.loadAndDisplayData();
        
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized successfully');
        return true;
    },

    ensureModuleCSS() {
        // Check if module CSS is already loaded
        const existingLinks = document.querySelectorAll('link[href*="income-expenses.css"]');
        if (existingLinks.length > 0) {
            return;
        }
        
        // Load module CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/income-expenses.css';
        link.onerror = () => {
            console.warn('⚠️ income-expenses.css not found');
        };
        document.head.appendChild(link);
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div id="income-expenses" class="module-container income">
                
                <!-- Header -->
                <div class="module-header header-flex">
                    <div class="header-left">
                        <h1>Income & Expenses</h1>
                        <p class="module-subtitle">Track your farm's financial health</p>
                        
                        <!-- Stats inline with icons -->
                        <div class="stats-inline">
                            <span class="stat-item">💰 <span id="inline-total-income">$0.00</span> Total Income</span>
                            <span class="stat-item">💸 <span id="inline-total-expenses">$0.00</span> Total Expenses</span>
                            <span class="stat-item">🪙 <span id="inline-net-profit">$0.00</span> Net Profit</span>
                        </div>
                    </div>
                    
                    <!-- Right side: Add Transaction + Import Receipts -->
                    <div class="header-right">
                        <button id="add-transaction-btn" class="btn btn-primary">
                            <span class="btn-icon">➕</span>
                            <span class="btn-text">Add Transaction</span>
                        </button>
                        <button id="import-receipts-btn" class="btn btn-secondary">
                            <span class="btn-icon">📥</span>
                            <span class="btn-text">Import Receipts</span>
                            <span id="receipt-count-badge" class="badge badge-error" style="display: none">0</span>
                        </button>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="card-grid">
                        <button id="quick-income-btn" class="card-button" data-action="quick-income">
                            <div class="card-icon">💰</div>
                            <span class="card-title">Quick Income</span>
                            <span class="card-subtitle">Record income instantly</span>
                        </button>
                        <button id="quick-expense-btn" class="card-button" data-action="quick-expense">
                            <div class="card-icon">🧾</div>
                            <span class="card-title">Quick Expense</span>
                            <span class="card-subtitle">Record expense instantly</span>
                        </button>
                        <button id="view-reports-btn" class="card-button" data-action="view-reports">
                            <div class="card-icon">📊</div>
                            <span class="card-title">View Reports</span>
                            <span class="card-subtitle">Financial analytics</span>
                        </button>
                        <button id="manage-categories-btn" class="card-button" data-action="manage-categories">
                            <div class="card-icon">📂</div>
                            <span class="card-title">Categories</span>
                            <span class="card-subtitle">Manage categories</span>
                        </button>
                    </div>
                </div>
                
                <!-- Financial Overview -->
                <div class="overview-section">
                    <h2 class="section-title">Financial Overview</h2>
                    <div class="card-grid">
                        <div class="stat-card" id="monthly-income-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value" id="monthly-income">$0.00</div>
                            <div class="stat-label">This Month</div>
                        </div>
                        <div class="stat-card" id="avg-monthly-card">
                            <div class="stat-icon">📈</div>
                            <div class="stat-value" id="avg-monthly-income">$0.00</div>
                            <div class="stat-label">Avg Monthly</div>
                        </div>
                        <div class="stat-card" id="transactions-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="total-transactions">0</div>
                            <div class="stat-label">Transactions</div>
                        </div>
                        <div class="stat-card" id="categories-card">
                            <div class="stat-icon">📂</div>
                            <div class="stat-value" id="total-categories">0</div>
                            <div class="stat-label">Categories</div>
                        </div>
                        <div class="stat-card" id="balance-card">
                            <div class="stat-icon">🏦</div>
                            <div class="stat-value" id="current-balance">$0.00</div>
                            <div class="stat-label">Current Balance</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Transactions & Expense Categories -->
                <div class="content-columns">
                    
                    <!-- Recent Transactions -->
                    <div class="content-column">
                        <div class="glass-card">
                            <div class="header-flex">
                                <h3>Recent Transactions</h3>
                                <button class="btn btn-outline" id="clear-all-transactions">Clear All</button>
                            </div>
                            <div id="transactions-list" class="transactions-list">
                                <!-- Transaction rows will be populated dynamically -->
                            </div>
                        </div>
                    </div>

                    <!-- Expense Categories -->
                    <div class="content-column">
                        <div class="glass-card">
                            <div class="header-flex">
                                <h3>Expense Categories</h3>
                                <button class="btn btn-outline" id="manage-categories-btn-2">Manage</button>
                            </div>
                            <div id="categories-list" class="categories-list">
                                <!-- Categories will be populated dynamically -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Receipts Section (Hidden by default) -->
                <div id="pending-receipts-section" class="pending-receipts-section" style="display: none;">
                    <div class="glass-card">
                        <div class="header-flex">
                            <h3>📥 Pending Receipts</h3>
                            <div class="header-right">
                                <button id="process-all-receipts" class="btn btn-primary">
                                    <span class="btn-icon">⚡</span>
                                    <span class="btn-text">Process All</span>
                                </button>
                                <button id="clear-pending-receipts" class="btn btn-outline">
                                    <span class="btn-icon">🗑️</span>
                                    <span class="btn-text">Clear All</span>
                                </button>
                            </div>
                        </div>
                        <div id="pending-receipts-list" class="pending-receipts-list">
                            <!-- Pending receipts will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="module-footer">
                    <div class="footer-left">
                        <button id="refresh-data-btn" class="btn btn-primary">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Refresh Data</span>
                        </button>
                    </div>
                    <div class="footer-right">
                        <button id="export-data-btn" class="btn btn-secondary" data-action="export-data">
                            <span class="btn-icon">📤</span>
                            <span class="btn-text">Export Data</span>
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    },

    setupEventListeners() {
        // Quick action buttons
        document.getElementById('quick-income-btn')?.addEventListener('click', () => this.showAddTransactionModal({ type: 'income' }));
        document.getElementById('quick-expense-btn')?.addEventListener('click', () => this.showAddTransactionModal({ type: 'expense' }));
        document.getElementById('view-reports-btn')?.addEventListener('click', () => this.showReportsModal());
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => this.showManageCategoriesModal());
        document.getElementById('manage-categories-btn-2')?.addEventListener('click', () => this.showManageCategoriesModal());
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        
        // Primary buttons
        document.getElementById('add-transaction-btn')?.addEventListener('click', () => this.showAddTransactionModal());
        document.getElementById('import-receipts-btn')?.addEventListener('click', () => this.showImportReceiptsModal());
        document.getElementById('clear-all-transactions')?.addEventListener('click', () => this.clearAllTransactions());
        document.getElementById('refresh-data-btn')?.addEventListener('click', () => {
            this.loadAndDisplayData();
            this.showNotification('Data refreshed!', 'success');
        });
        
        // Pending receipts buttons (will be added after section renders)
        setTimeout(() => {
            document.getElementById('process-all-receipts')?.addEventListener('click', () => this.processAllReceipts());
            document.getElementById('clear-pending-receipts')?.addEventListener('click', () => this.clearAllPendingReceipts());
        }, 100);
    },

    // ... [Previous methods remain the same until importReceipts function] ...

    // ==================== RECEIPT IMPORT FEATURE ====================

    showImportReceiptsModal() {
        window.ModalManager.show({
            id: 'import-receipts-modal',
            title: 'Import Receipts',
            subtitle: 'Upload receipts to automatically extract transactions',
            size: 'modal-lg',
            content: `
                <div class="receipt-import-container">
                    <!-- Upload Zone -->
                    <div class="upload-zone" id="receipt-dropzone">
                        <div class="upload-icon">📥</div>
                        <h3>Drop receipt files here</h3>
                        <p class="upload-subtitle">or click to browse</p>
                        <p class="upload-formats">Supported formats: JPG, PNG, PDF, HEIC</p>
                        <input type="file" id="receipt-file-input" multiple accept=".jpg,.jpeg,.png,.pdf,.heic,.heif" style="display: none;">
                        <button class="btn btn-primary" id="browse-receipts-btn">
                            <span class="btn-icon">📁</span>
                            <span class="btn-text">Browse Files</span>
                        </button>
                    </div>
                    
                    <!-- Upload Progress -->
                    <div id="upload-progress" class="upload-progress" style="display: none;">
                        <h4>Uploading Receipts</h4>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="upload-progress-bar"></div>
                        </div>
                        <div class="progress-text" id="upload-progress-text">0%</div>
                        <div id="upload-details"></div>
                    </div>
                    
                    <!-- Processing Results -->
                    <div id="processing-results" class="processing-results" style="display: none;">
                        <h4>Processing Results</h4>
                        <div id="processing-summary"></div>
                        <div id="extracted-receipts-list"></div>
                    </div>
                    
                    <!-- OCR Tips -->
                    <div class="ocr-tips">
                        <h4>💡 Tips for Best Results</h4>
                        <ul>
                            <li>Ensure receipts are well-lit and clear</li>
                            <li>Take photos from directly above the receipt</li>
                            <li>Include the entire receipt in the frame</li>
                            <li>For PDFs, ensure text is selectable</li>
                            <li>Check extracted data before saving</li>
                        </ul>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" data-action="close">Cancel</button>
                <button class="btn btn-primary" id="process-receipts-btn" disabled>
                    <span class="btn-icon">🔍</span>
                    <span class="btn-text">Process Receipts</span>
                </button>
            `,
            onOpen: () => {
                this.setupReceiptImportHandlers();
            },
            onClose: () => {
                // Clean up any ongoing processes
                this.receiptQueue = [];
            }
        });
    },

    setupReceiptImportHandlers() {
        const dropzone = document.getElementById('receipt-dropzone');
        const fileInput = document.getElementById('receipt-file-input');
        const browseBtn = document.getElementById('browse-receipts-btn');
        const processBtn = document.getElementById('process-receipts-btn');
        const closeBtn = document.querySelector('[data-action="close"]');

        // Browse button handler
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change handler
        fileInput.addEventListener('change', (e) => {
            this.handleReceiptFiles(e.target.files);
        });

        // Drag and drop handlers
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            this.handleReceiptFiles(e.dataTransfer.files);
        });

        // Process button handler
        processBtn.addEventListener('click', () => {
            this.processReceiptUploads();
        });

        // Close button handler
        closeBtn.addEventListener('click', () => {
            window.ModalManager.closeCurrentModal();
        });

        // Click on dropzone to browse
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
    },

    handleReceiptFiles(files) {
        if (!files || files.length === 0) return;

        const validFiles = [];
        const invalidFiles = [];

        // Validate files
        Array.from(files).forEach(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|heic|heif)$/i)) {
                invalidFiles.push({ name: file.name, reason: 'Invalid file type' });
                return;
            }
            
            if (file.size > maxSize) {
                invalidFiles.push({ name: file.name, reason: 'File too large (max 10MB)' });
                return;
            }
            
            validFiles.push(file);
        });

        // Show validation results
        if (invalidFiles.length > 0) {
            let errorMessage = 'Some files were rejected:\n';
            invalidFiles.forEach(file => {
                errorMessage += `• ${file.name}: ${file.reason}\n`;
            });
            this.showNotification(errorMessage, 'error');
        }

        if (validFiles.length === 0) {
            this.showNotification('No valid receipt files selected', 'error');
            return;
        }

        // Add files to queue
        validFiles.forEach(file => {
            this.receiptQueue.push({
                id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                status: 'pending',
                previewUrl: null
            });
        });

        // Update UI
        this.updateReceiptUploadUI();
    },

    updateReceiptUploadUI() {
        const processBtn = document.getElementById('process-receipts-btn');
        const uploadProgress = document.getElementById('upload-progress');
        const dropzone = document.getElementById('receipt-dropzone');
        const processingResults = document.getElementById('processing-results');

        if (this.receiptQueue.length > 0) {
            processBtn.disabled = false;
            
            // Show upload progress section
            uploadProgress.style.display = 'block';
            
            // Update dropzone message
            dropzone.innerHTML = `
                <div class="upload-icon">📄</div>
                <h3>${this.receiptQueue.length} receipt${this.receiptQueue.length > 1 ? 's' : ''} selected</h3>
                <p class="upload-subtitle">Ready to process</p>
                <div class="file-list-preview">
                    ${this.receiptQueue.slice(0, 3).map(receipt => `
                        <div class="file-item">
                            <span class="file-icon">${this.getFileIcon(receipt.type)}</span>
                            <span class="file-name">${receipt.name}</span>
                            <span class="file-size">${receipt.size}</span>
                        </div>
                    `).join('')}
                    ${this.receiptQueue.length > 3 ? 
                        `<div class="file-more">+ ${this.receiptQueue.length - 3} more files</div>` : 
                        ''}
                </div>
                <button class="btn btn-outline" id="clear-queue-btn" style="margin-top: 1rem;">
                    <span class="btn-icon">🗑️</span>
                    <span class="btn-text">Clear Queue</span>
                </button>
            `;

            // Add clear queue button handler
            document.getElementById('clear-queue-btn')?.addEventListener('click', () => {
                this.receiptQueue = [];
                this.updateReceiptUploadUI();
            });

            // Hide processing results if shown
            if (processingResults) {
                processingResults.style.display = 'none';
            }
        } else {
            processBtn.disabled = true;
            uploadProgress.style.display = 'none';
            
            // Reset dropzone
            dropzone.innerHTML = `
                <div class="upload-icon">📥</div>
                <h3>Drop receipt files here</h3>
                <p class="upload-subtitle">or click to browse</p>
                <p class="upload-formats">Supported formats: JPG, PNG, PDF, HEIC</p>
                <button class="btn btn-primary" id="browse-receipts-btn">
                    <span class="btn-icon">📁</span>
                    <span class="btn-text">Browse Files</span>
                </button>
            `;
        }
    },

    async processReceiptUploads() {
        const uploadProgress = document.getElementById('upload-progress');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-progress-text');
        const uploadDetails = document.getElementById('upload-details');
        const processingResults = document.getElementById('processing-results');
        const processingSummary = document.getElementById('processing-summary');
        const extractedList = document.getElementById('extracted-receipts-list');

        // Show processing section
        processingResults.style.display = 'block';
        processingSummary.innerHTML = '<div class="processing-status">⏳ Processing receipts...</div>';
        extractedList.innerHTML = '';

        let processedCount = 0;
        let successCount = 0;
        let failedCount = 0;
        const extractedReceipts = [];

        // Process each receipt
        for (const receipt of this.receiptQueue) {
            processedCount++;
            
            // Update progress
            const progress = Math.round((processedCount / this.receiptQueue.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            uploadDetails.innerHTML = `Processing ${receipt.name} (${processedCount}/${this.receiptQueue.length})`;
            
            try {
                // Simulate OCR processing
                await this.simulateOCRProcessing(receipt);
                
                // Extract data from receipt
                const extractedData = this.extractReceiptData(receipt);
                
                if (extractedData) {
                    receipt.extractedData = extractedData;
                    receipt.status = 'extracted';
                    successCount++;
                    
                    // Add to extracted list
                    extractedReceipts.push(receipt);
                    
                    // Update UI with extracted receipt
                    extractedList.innerHTML += this.renderExtractedReceipt(receipt);
                } else {
                    receipt.status = 'failed';
                    receipt.error = 'Could not extract data from receipt';
                    failedCount++;
                    
                    extractedList.innerHTML += `
                        <div class="extracted-receipt failed">
                            <div class="receipt-header">
                                <span class="receipt-icon">❌</span>
                                <span class="receipt-name">${receipt.name}</span>
                            </div>
                            <div class="receipt-error">Failed to extract data</div>
                        </div>
                    `;
                }
            } catch (error) {
                receipt.status = 'failed';
                receipt.error = error.message;
                failedCount++;
                
                extractedList.innerHTML += `
                    <div class="extracted-receipt failed">
                        <div class="receipt-header">
                            <span class="receipt-icon">❌</span>
                            <span class="receipt-name">${receipt.name}</span>
                        </div>
                        <div class="receipt-error">Processing error: ${error.message}</div>
                    </div>
                `;
            }

            // Add small delay for realistic processing
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update summary
        processingSummary.innerHTML = `
            <div class="processing-complete">
                <div class="status-icon">✅</div>
                <div class="status-details">
                    <h4>Processing Complete</h4>
                    <p>Successfully extracted ${successCount} of ${this.receiptQueue.length} receipts</p>
                    ${failedCount > 0 ? `<p class="text-error">${failedCount} receipt(s) failed to process</p>` : ''}
                </div>
            </div>
        `;

        // Update footer buttons
        const footer = document.querySelector('.modal-footer');
        footer.innerHTML = `
            <button class="btn btn-outline" data-action="close">Close</button>
            ${successCount > 0 ? `
                <button class="btn btn-primary" id="save-extracted-btn">
                    <span class="btn-icon">💾</span>
                    <span class="btn-text">Save ${successCount} Transaction(s)</span>
                </button>
                <button class="btn btn-secondary" id="review-extracted-btn">
                    <span class="btn-icon">👁️</span>
                    <span class="btn-text">Review & Edit</span>
                </button>
            ` : ''}
        `;

        // Add save button handler
        if (successCount > 0) {
            document.getElementById('save-extracted-btn')?.addEventListener('click', () => {
                this.saveExtractedReceipts(extractedReceipts.filter(r => r.status === 'extracted'));
            });

            document.getElementById('review-extracted-btn')?.addEventListener('click', () => {
                this.showReceiptReviewModal(extractedReceipts.filter(r => r.status === 'extracted'));
            });
        }
    },

    simulateOCRProcessing(receipt) {
        return new Promise((resolve, reject) => {
            // Simulate OCR processing time (1-3 seconds)
            const processingTime = 1000 + Math.random() * 2000;
            
            setTimeout(() => {
                // Simulate occasional failures
                if (Math.random() < 0.1) { // 10% failure rate
                    reject(new Error('OCR processing failed - image quality too low'));
                    return;
                }

                // Generate preview URL for images
                if (receipt.file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        receipt.previewUrl = e.target.result;
                        resolve();
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(receipt.file);
                } else {
                    resolve();
                }
            }, processingTime);
        });
    },

    extractReceiptData(receipt) {
        // Simulate data extraction from receipt
        // In a real app, this would use OCR API like Tesseract.js, Google Vision, etc.
        
        const receiptTypes = [
            {
                type: 'feed',
                vendors: ['Tractor Supply', 'Purina', 'Nutrena', 'Farm Supply Co'],
                items: ['Chicken Feed', 'Layer Pellets', 'Grower Feed', 'Organic Feed']
            },
            {
                type: 'equipment',
                vendors: ['Home Depot', 'Lowe\'s', 'Tractor Supply', 'Northern Tool'],
                items: ['Tools', 'Equipment', 'Repair Parts', 'Maintenance Supplies']
            },
            {
                type: 'medication',
                vendors: ['Vet Clinic', 'Animal Health', 'Farm Vet', 'Pharmacy'],
                items: ['Vaccines', 'Antibiotics', 'Supplements', 'First Aid']
            },
            {
                type: 'utilities',
                vendors: ['Electric Company', 'Water Dept', 'Gas Company', 'Internet Provider'],
                items: ['Electricity', 'Water Bill', 'Internet', 'Phone']
            },
            {
                type: 'supplies',
                vendors: ['Walmart', 'Target', 'Amazon', 'Local Market'],
                items: ['Cleaning Supplies', 'Office Supplies', 'Packaging', 'Miscellaneous']
            }
        ];

        // Pick a random receipt type for simulation
        const receiptType = receiptTypes[Math.floor(Math.random() * receiptTypes.length)];
        const vendor = receiptType.vendors[Math.floor(Math.random() * receiptType.vendors.length)];
        const item = receiptType.items[Math.floor(Math.random() * receiptType.items.length)];
        
        // Generate random but realistic amounts
        const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
        const tax = parseFloat((amount * 0.08).toFixed(2));
        const total = parseFloat((amount + tax).toFixed(2));
        
        // Generate random date (within last 30 days)
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const dateStr = date.toISOString().split('T')[0];

        return {
            vendor: vendor,
            description: `${item} Purchase`,
            amount: total,
            date: dateStr,
            category: receiptType.type,
            tax: tax,
            items: [
                { name: item, quantity: 1, price: amount }
            ],
            confidence: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)), // 70-100% confidence
            rawText: `RECEIPT\n${vendor}\n${dateStr}\n${item}: $${amount}\nTax: $${tax}\nTotal: $${total}\nThank you!`
        };
    },

    renderExtractedReceipt(receipt) {
        const data = receipt.extractedData;
        return `
            <div class="extracted-receipt" data-receipt-id="${receipt.id}">
                <div class="receipt-header">
                    <span class="receipt-icon">${this.getFileIcon(receipt.type)}</span>
                    <span class="receipt-name">${receipt.name}</span>
                    <span class="receipt-confidence" style="color: ${data.confidence > 0.9 ? '#10b981' : data.confidence > 0.7 ? '#f59e0b' : '#ef4444'}">
                        ${Math.round(data.confidence * 100)}% confidence
                    </span>
                </div>
                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="detail-label">Vendor:</span>
                        <span class="detail-value">${data.vendor}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${data.description}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value amount">${this.formatCurrency(data.amount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${this.formatDate(data.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value category">${this.getCategoryName(data.category)}</span>
                    </div>
                    <div class="receipt-actions">
                        <button class="btn btn-sm btn-outline edit-extracted-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">✏️</span>
                            <span class="btn-text">Edit</span>
                        </button>
                        <button class="btn btn-sm btn-primary save-extracted-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">💾</span>
                            <span class="btn-text">Save</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    saveExtractedReceipts(receipts) {
        let savedCount = 0;
        
        receipts.forEach(receipt => {
            const data = receipt.extractedData;
            
            const transactionData = {
                type: 'expense',
                description: `${data.vendor} - ${data.description}`,
                amount: data.amount,
                category: this.getCategoryName(data.category),
                date: data.date,
                paymentMethod: 'credit-card', // Assume credit card for receipts
                notes: `Imported from receipt: ${receipt.name}\n${data.rawText}`,
                source: 'receipt-import'
            };
            
            this.addTransaction(transactionData);
            savedCount++;
            
            // Mark as saved
            receipt.status = 'saved';
        });

        // Clear queue
        this.receiptQueue = this.receiptQueue.filter(r => r.status !== 'saved');
        
        // Show success message
        this.showNotification(`Successfully saved ${savedCount} transaction(s) from receipts!`, 'success');
        
        // Close modal
        window.ModalManager.closeCurrentModal();
        
        // Refresh data
        this.loadAndDisplayData();
    },

    showReceiptReviewModal(receipts) {
        window.ModalManager.show({
            id: 'receipt-review-modal',
            title: 'Review Extracted Receipts',
            subtitle: 'Verify and edit extracted data before saving',
            size: 'modal-xl',
            content: `
                <div class="receipt-review-container">
                    <div class="review-instructions">
                        <p>Please review the extracted data from your receipts. You can edit any field before saving to transactions.</p>
                    </div>
                    <div id="review-receipts-list" class="review-receipts-list">
                        ${receipts.map(receipt => this.renderReviewReceiptForm(receipt)).join('')}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" id="save-reviewed-btn">
                    <span class="btn-icon">💾</span>
                    <span class="btn-text">Save All Transactions</span>
                </button>
            `,
            onOpen: () => {
                // Add save button handler
                document.getElementById('save-reviewed-btn').addEventListener('click', () => {
                    this.saveReviewedReceipts();
                });

                // Add cancel button handler
                document.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                    window.ModalManager.closeCurrentModal();
                });

                // Setup individual save buttons
                receipts.forEach(receipt => {
                    const saveBtn = document.querySelector(`[data-receipt-id="${receipt.id}"] .save-individual-btn`);
                    const editBtn = document.querySelector(`[data-receipt-id="${receipt.id}"] .edit-review-btn`);
                    
                    if (saveBtn) {
                        saveBtn.addEventListener('click', () => {
                            this.saveIndividualReceipt(receipt);
                        });
                    }
                    
                    if (editBtn) {
                        editBtn.addEventListener('click', () => {
                            this.showEditExtractedReceiptModal(receipt);
                        });
                    }
                });
            }
        });
    },

    renderReviewReceiptForm(receipt) {
        const data = receipt.extractedData;
        return `
            <div class="review-receipt-form" data-receipt-id="${receipt.id}">
                <div class="review-receipt-header">
                    <div class="receipt-info">
                        <span class="receipt-icon">${this.getFileIcon(receipt.type)}</span>
                        <span class="receipt-name">${receipt.name}</span>
                    </div>
                    <div class="receipt-actions">
                        <button class="btn btn-sm btn-outline edit-review-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">✏️</span>
                            <span class="btn-text">Edit</span>
                        </button>
                        <button class="btn btn-sm btn-primary save-individual-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">💾</span>
                            <span class="btn-text">Save</span>
                        </button>
                    </div>
                </div>
                
                <div class="review-form-fields">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Vendor</label>
                            <input type="text" class="form-input" value="${data.vendor}" data-field="vendor">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" class="form-input" value="${data.description}" data-field="description">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Amount ($)</label>
                            <input type="number" class="form-input" value="${data.amount}" step="0.01" data-field="amount">
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" class="form-input" value="${data.date}" data-field="date">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select class="form-input" data-field="category">
                                ${this.categories.expense.map(cat => `
                                    <option value="${cat.value}" ${data.category === cat.value ? 'selected' : ''}>
                                        ${cat.icon} ${cat.label}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Payment Method</label>
                            <select class="form-input" data-field="paymentMethod">
                                <option value="cash">💵 Cash</option>
                                <option value="credit-card" selected>💳 Credit Card</option>
                                <option value="debit-card">🏦 Debit Card</option>
                                <option value="check">📝 Check</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea class="form-input" rows="2" data-field="notes">Imported from receipt: ${receipt.name}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    saveReviewedReceipts() {
        const receiptForms = document.querySelectorAll('.review-receipt-form');
        let savedCount = 0;
        
        receiptForms.forEach(form => {
            const receiptId = form.dataset.receiptId;
            const receipt = this.receiptQueue.find(r => r.id === receiptId);
            
            if (!receipt) return;
            
            // Get updated values from form
            const vendor = form.querySelector('[data-field="vendor"]').value;
            const description = form.querySelector('[data-field="description"]').value;
            const amount = parseFloat(form.querySelector('[data-field="amount"]').value);
            const date = form.querySelector('[data-field="date"]').value;
            const category = form.querySelector('[data-field="category"]').value;
            const paymentMethod = form.querySelector('[data-field="paymentMethod"]').value;
            const notes = form.querySelector('[data-field="notes"]').value;
            
            const transactionData = {
                type: 'expense',
                description: `${vendor} - ${description}`,
                amount: amount,
                category: this.getCategoryName(category),
                date: date,
                paymentMethod: paymentMethod,
                notes: notes,
                source: 'receipt-import'
            };
            
            this.addTransaction(transactionData);
            savedCount++;
            
            // Mark as saved
            receipt.status = 'saved';
        });

        // Clear saved receipts from queue
        this.receiptQueue = this.receiptQueue.filter(r => r.status !== 'saved');
        
        // Show success and close modal
        this.showNotification(`Successfully saved ${savedCount} transaction(s)!`, 'success');
        window.ModalManager.closeCurrentModal();
        
        // Refresh data
        this.loadAndDisplayData();
    },

    saveIndividualReceipt(receipt) {
        const form = document.querySelector(`[data-receipt-id="${receipt.id}"]`);
        if (!form) return;
        
        // Get updated values from form
        const vendor = form.querySelector('[data-field="vendor"]').value;
        const description = form.querySelector('[data-field="description"]').value;
        const amount = parseFloat(form.querySelector('[data-field="amount"]').value);
        const date = form.querySelector('[data-field="date"]').value;
        const category = form.querySelector('[data-field="category"]').value;
        const paymentMethod = form.querySelector('[data-field="paymentMethod"]').value;
        const notes = form.querySelector('[data-field="notes"]').value;
        
        const transactionData = {
            type: 'expense',
            description: `${vendor} - ${description}`,
            amount: amount,
            category: this.getCategoryName(category),
            date: date,
            paymentMethod: paymentMethod,
            notes: notes,
            source: 'receipt-import'
        };
        
        this.addTransaction(transactionData);
        
        // Mark as saved
        receipt.status = 'saved';
        
        // Remove from UI
        form.remove();
        
        // Update button text if no receipts left
        const remainingForms = document.querySelectorAll('.review-receipt-form');
        if (remainingForms.length === 0) {
            document.getElementById('save-reviewed-btn').innerHTML = `
                <span class="btn-icon">✅</span>
                <span class="btn-text">All Saved - Close</span>
            `;
        }
        
        this.showNotification('Transaction saved successfully!', 'success');
    },

    showEditExtractedReceiptModal(receipt) {
        const data = receipt.extractedData;
        
        const fields = [
            {
                type: 'text',
                name: 'vendor',
                label: 'Vendor',
                required: true,
                value: data.vendor
            },
            {
                type: 'text',
                name: 'description',
                label: 'Description',
                required: true,
                value: data.description
            },
            {
                type: 'number',
                name: 'amount',
                label: 'Amount ($)',
                required: true,
                min: 0.01,
                step: 0.01,
                value: data.amount
            },
            {
                type: 'date',
                name: 'date',
                label: 'Date',
                required: true,
                value: data.date
            },
            {
                type: 'select',
                name: 'category',
                label: 'Category',
                required: true,
                options: this.categories.expense.map(cat => ({
                    value: cat.value,
                    label: `${cat.icon} ${cat.label}`
                })),
                value: data.category
            },
            {
                type: 'select',
                name: 'paymentMethod',
                label: 'Payment Method',
                options: [
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'credit-card', label: '💳 Credit Card' },
                    { value: 'debit-card', label: '🏦 Debit Card' },
                    { value: 'check', label: '📝 Check' }
                ],
                value: 'credit-card'
            },
            {
                type: 'textarea',
                name: 'notes',
                label: 'Notes',
                rows: 3,
                value: `Imported from receipt: ${receipt.name}`
            }
        ];

        window.ModalManager.createForm({
            id: 'edit-extracted-receipt-modal',
            title: 'Edit Extracted Receipt',
            subtitle: receipt.name,
            size: 'modal-md',
            fields: fields,
            submitText: 'Update & Save',
            onSubmit: (formData) => {
                // Update receipt data
                receipt.extractedData = {
                    ...data,
                    vendor: formData.vendor,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    category: formData.category,
                    paymentMethod: formData.paymentMethod
                };
                
                // Update the review form
                const form = document.querySelector(`[data-receipt-id="${receipt.id}"]`);
                if (form) {
                    form.querySelector('[data-field="vendor"]').value = formData.vendor;
                    form.querySelector('[data-field="description"]').value = formData.description;
                    form.querySelector('[data-field="amount"]').value = formData.amount;
                    form.querySelector('[data-field="date"]').value = formData.date;
                    form.querySelector('[data-field="category"]').value = formData.category;
                    form.querySelector('[data-field="paymentMethod"]').value = formData.paymentMethod;
                    form.querySelector('[data-field="notes"]').value = `Imported from receipt: ${receipt.name}`;
                }
                
                this.showNotification('Receipt data updated!', 'success');
            }
        });
    },

    processAllReceipts() {
        // Process all pending receipts at once
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        if (pendingReceipts.length === 0) return;
        
        this.showNotification(`Processing ${pendingReceipts.length} receipt(s)...`, 'info');
        
        // Simulate processing
        setTimeout(() => {
            pendingReceipts.forEach(receipt => {
                receipt.status = 'processed';
                const extractedData = this.extractReceiptData(receipt);
                if (extractedData) {
                    receipt.extractedData = extractedData;
                    this.addTransaction({
                        type: 'expense',
                        description: `${extractedData.vendor} - ${extractedData.description}`,
                        amount: extractedData.amount,
                        category: this.getCategoryName(extractedData.category),
                        date: extractedData.date,
                        paymentMethod: 'credit-card',
                        notes: `Auto-imported from receipt: ${receipt.name}`,
                        source: 'receipt-auto-import'
                    });
                }
            });
            
            // Clear processed receipts
            this.receiptQueue = this.receiptQueue.filter(r => r.status !== 'processed');
            this.updatePendingReceiptsUI();
            
            this.showNotification(`Auto-processed ${pendingReceipts.length} receipt(s)!`, 'success');
            this.loadAndDisplayData();
        }, 2000);
    },

    clearAllPendingReceipts() {
        window.ModalManager.confirm({
            title: 'Clear All Pending Receipts',
            message: 'Are you sure you want to clear all pending receipts?',
            details: 'This action cannot be undone. Any unprocessed receipts will be permanently removed.',
            icon: '⚠️',
            danger: true,
            confirmText: 'Clear All'
        }).then(confirmed => {
            if (confirmed) {
                this.receiptQueue = [];
                this.updatePendingReceiptsUI();
                this.showNotification('All pending receipts cleared!', 'success');
            }
        });
    },

    updatePendingReceiptsUI() {
        const pendingSection = document.getElementById('pending-receipts-section');
        const pendingList = document.getElementById('pending-receipts-list');
        const badge = document.getElementById('receipt-count-badge');
        
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pendingReceipts.length > 0) {
            // Show section
            pendingSection.style.display = 'block';
            
            // Update badge
            badge.textContent = pendingReceipts.length;
            badge.style.display = 'inline-block';
            
            // Update list
            pendingList.innerHTML = pendingReceipts.map(receipt => `
                <div class="pending-receipt-item">
                    <div class="receipt-info">
                        <span class="receipt-icon">${this.getFileIcon(receipt.type)}</span>
                        <div class="receipt-details">
                            <div class="receipt-name">${receipt.name}</div>
                            <div class="receipt-meta">${receipt.size} • Added ${this.formatTimeAgo(receipt.id)}</div>
                        </div>
                    </div>
                    <div class="receipt-actions">
                        <button class="btn btn-sm btn-primary process-individual-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">🔍</span>
                            <span class="btn-text">Process</span>
                        </button>
                        <button class="btn btn-sm btn-outline remove-receipt-btn" data-receipt-id="${receipt.id}">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            pendingReceipts.forEach(receipt => {
                const processBtn = pendingList.querySelector(`[data-receipt-id="${receipt.id}"].process-individual-btn`);
                const removeBtn = pendingList.querySelector(`[data-receipt-id="${receipt.id}"].remove-receipt-btn`);
                
                if (processBtn) {
                    processBtn.addEventListener('click', () => {
                        this.processIndividualReceipt(receipt);
                    });
                }
                
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        this.removeReceiptFromQueue(receipt.id);
                    });
                }
            });
        } else {
            // Hide section
            pendingSection.style.display = 'none';
            badge.style.display = 'none';
        }
    },

    processIndividualReceipt(receipt) {
        this.showNotification(`Processing ${receipt.name}...`, 'info');
        
        setTimeout(() => {
            const extractedData = this.extractReceiptData(receipt);
            if (extractedData) {
                // Show edit modal for this receipt
                this.showAddTransactionModal({
                    type: 'expense',
                    description: `${extractedData.vendor} - ${extractedData.description}`,
                    amount: extractedData.amount,
                    category: this.getCategoryValue(this.getCategoryName(extractedData.category)),
                    date: extractedData.date,
                    paymentMethod: 'credit-card',
                    notes: `Imported from receipt: ${receipt.name}`
                });
                
                // Remove from queue
                this.removeReceiptFromQueue(receipt.id);
            } else {
                this.showNotification(`Failed to process ${receipt.name}`, 'error');
            }
        }, 1000);
    },

    removeReceiptFromQueue(receiptId) {
        this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
        this.updatePendingReceiptsUI();
        this.showNotification('Receipt removed from queue', 'info');
    },

    // ==================== UTILITY FUNCTIONS ====================

    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('heic') || fileType.includes('heif')) return '📱';
        return '📄';
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const idTime = parseInt(timestamp.split('-')[1]);
        const diff = now - idTime;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
        return Math.floor(diff / 86400000) + ' days ago';
    },

    // ... [Rest of the previous methods remain the same] ...
};

// Register the module when FarmModules is available
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
} else {
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            clearInterval(checkFarmModules);
            window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
            console.log('✅ Income & Expenses module registered after wait');
        }
    }, 100);
}

// Export for global access
window.IncomeExpensesModule = IncomeExpensesModule;
