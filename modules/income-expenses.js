// modules/income-expenses.js - COMPLETE WORKING VERSION WITH PROPER REGISTRATION
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',  // This must match the name used in navigation
    displayName: 'Income & Expenses',  // Display name for UI
    icon: '💰',
    initialized: false,
    element: null,
    transactions: [],
    receiptQueue: [],
    cameraStream: null,
    receiptPreview: null,
    isFirebaseAvailable: false,
    isOnline: true,
    
    // ==================== INITIALIZATION ====================
    async initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        this.isFirebaseAvailable = !!(window.firebase && window.db);
        
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.setupNetworkDetection();
        await this.loadData();
        await this.loadReceipts();
        
        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions');
        return true;
    },

    // ==================== NETWORK DETECTION ====================
    setupNetworkDetection() {
        this.isOnline = navigator.onLine;
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Back online. Syncing data...', 'info');
            this.syncToFirebase();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('You are offline. Changes saved locally.', 'info');
        });
    },

    // ==================== DATA MANAGEMENT ====================
    async loadData() {
        console.log('Loading transactions...');
        
        try {
            // Try to load from localStorage first
            const saved = localStorage.getItem('farm-transactions');
            this.transactions = saved ? JSON.parse(saved) : [];
            
            // Then try to load from Firebase and merge
            if (this.isFirebaseAvailable && window.db) {
                await this.loadFromFirebase();
            }
            
            console.log('📁 Loaded transactions:', this.transactions.length);
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
            this.transactions = [];
        }
    },

    async loadFromFirebase() {
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) return;
            
            const snapshot = await window.db.collection('transactions')
                .where('userId', '==', user.uid)
                .limit(100)
                .get();
            
            const firebaseTransactions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                firebaseTransactions.push({
                    id: data.id,
                    date: data.date,
                    type: data.type,
                    category: data.category,
                    amount: parseFloat(data.amount) || 0,
                    description: data.description || '',
                    paymentMethod: data.paymentMethod || 'cash',
                    reference: data.reference || '',
                    notes: data.notes || '',
                    receipt: data.receipt || null
                });
            });
            
            // Merge with local transactions (keep newest)
            const merged = [...this.transactions];
            firebaseTransactions.forEach(fbTx => {
                const exists = merged.some(localTx => localTx.id === fbTx.id);
                if (!exists) {
                    merged.push(fbTx);
                }
            });
            
            this.transactions = merged.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.saveToLocalStorage();
            
        } catch (error) {
            console.warn('⚠️ Firebase load error:', error);
        }
    },

    saveToLocalStorage() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    },

    async syncToFirebase() {
        if (!this.isOnline || !this.isFirebaseAvailable || !window.db) return;
        
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) return;
            
            for (const transaction of this.transactions) {
                await window.db.collection('transactions')
                    .doc(transaction.id.toString())
                    .set({
                        ...transaction,
                        userId: user.uid,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
            }
            console.log('✅ Synced to Firebase');
        } catch (error) {
            console.warn('⚠️ Sync error:', error);
        }
    },

    // ==================== RECEIPT MANAGEMENT ====================
    async loadReceipts() {
        const saved = localStorage.getItem('farm-receipts');
        this.receiptQueue = saved ? JSON.parse(saved) : [];
        console.log('📁 Loaded receipts:', this.receiptQueue.length);
    },

    saveReceipts() {
        localStorage.setItem('farm-receipts', JSON.stringify(this.receiptQueue));
    },

    saveReceiptFromFile(file, dataURL) {
        const receipt = {
            id: 'receipt_' + Date.now(),
            name: file.name,
            type: file.type,
            size: file.size,
            dataURL: dataURL,
            status: 'pending',
            uploadedAt: new Date().toISOString()
        };
        
        this.receiptQueue.unshift(receipt);
        this.saveReceipts();
        this.updateReceiptQueueUI();
        this.showNotification(`✅ Receipt saved: ${file.name}`, 'success');
    },

    // ==================== SIMPLE CAMERA ====================
    initializeCamera() {
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) return;
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                this.cameraStream = stream;
                video.srcObject = stream;
                if (status) status.textContent = 'Camera Ready';
                return video.play();
            })
            .catch(error => {
                console.error('Camera error:', error);
                if (status) status.textContent = 'Camera unavailable';
                this.showNotification('Camera access denied', 'error');
            });
    },

    capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        if (!video || !video.srcObject) {
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(blob => {
            const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            
            if (status) status.textContent = 'Photo captured!';
            this.showNotification('📸 Photo captured!', 'success');
            this.saveReceiptFromFile(file, imageUrl);
            
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

    // ==================== FILE UPLOAD ====================
    handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.saveReceiptFromFile(file, e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                this.processReceiptFile(file);
            }
        }
    },

    processReceiptFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.saveReceiptFromFile(file, e.target.result);
        };
        reader.readAsDataURL(file);
    },

    processSingleReceipt(receiptId) {
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) return;
        
        this.showTransactionModal();
        
        setTimeout(() => {
            const descInput = document.getElementById('transaction-description');
            if (descInput) descInput.value = `Receipt: ${receipt.name}`;
            
            this.receiptPreview = receipt;
            this.showReceiptPreviewInTransactionModal(receipt);
            this.markReceiptAsProcessed(receiptId);
        }, 100);
    },

    markReceiptAsProcessed(receiptId) {
        const index = this.receiptQueue.findIndex(r => r.id === receiptId);
        if (index !== -1) {
            this.receiptQueue[index].status = 'processed';
            this.saveReceipts();
            this.updateReceiptQueueUI();
        }
    },

    // ==================== TRANSACTIONS ====================
    async saveTransaction() {
        const date = document.getElementById('transaction-date')?.value;
        const type = document.getElementById('transaction-type')?.value;
        const category = document.getElementById('transaction-category')?.value;
        const amount = parseFloat(document.getElementById('transaction-amount')?.value || 0);
        const description = document.getElementById('transaction-description')?.value.trim();
        const paymentMethod = document.getElementById('transaction-payment')?.value || 'cash';
        const reference = document.getElementById('transaction-reference')?.value || '';
        const notes = document.getElementById('transaction-notes')?.value || '';
        
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            date,
            type,
            category,
            amount,
            description,
            paymentMethod,
            reference,
            notes,
            receipt: this.receiptPreview ? {
                id: this.receiptPreview.id,
                name: this.receiptPreview.name,
                dataURL: this.receiptPreview.dataURL
            } : null,
            createdAt: new Date().toISOString()
        };
        
        this.transactions.unshift(transaction);
        this.saveToLocalStorage();
        await this.syncToFirebase();
        
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.hideTransactionModal();
        this.receiptPreview = null;
        
        this.showNotification('Transaction saved successfully!', 'success');
    },

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.syncToFirebase();
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            this.showNotification('Transaction deleted', 'success');
        }
    },

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        this.showTransactionModal();
        
        setTimeout(() => {
            document.getElementById('transaction-id').value = transaction.id;
            document.getElementById('transaction-date').value = transaction.date;
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-category').value = transaction.category;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-description').value = transaction.description;
            document.getElementById('transaction-payment').value = transaction.paymentMethod;
            document.getElementById('transaction-reference').value = transaction.reference;
            document.getElementById('transaction-notes').value = transaction.notes;
            
            if (transaction.receipt) {
                this.receiptPreview = transaction.receipt;
                this.showReceiptPreviewInTransactionModal(transaction.receipt);
            }
            
            document.getElementById('delete-transaction').style.display = 'block';
            document.getElementById('transaction-modal-title').textContent = 'Edit Transaction';
        }, 100);
    },

    // ==================== UI RENDERING ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
                .income-expenses-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .quick-action-btn {
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .quick-action-btn:hover {
                    background: #e8f5e9;
                    border-color: #4CAF50;
                    transform: translateY(-2px);
                }
                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .transaction-item:hover {
                    background: #f9f9f9;
                    transform: translateX(4px);
                }
                .amount-income { color: #4CAF50; font-weight: bold; }
                .amount-expense { color: #f44336; font-weight: bold; }
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-primary {
                    background: #4CAF50;
                    color: white;
                }
                .btn-outline {
                    background: transparent;
                    border: 1px solid #4CAF50;
                    color: #4CAF50;
                }
                .btn-danger {
                    background: #f44336;
                    color: white;
                }
                .form-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 600;
                }
                .popout-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .popout-modal.hidden { display: none; }
                .popout-modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .popout-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .popout-modal-body { padding: 20px; }
                .popout-modal-footer {
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .camera-preview {
                    width: 100%;
                    height: 300px;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .camera-preview video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .camera-controls {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }
                .upload-area {
                    border: 2px dashed #ddd;
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                }
                .hidden { display: none !important; }
                @media (max-width: 768px) {
                    .stats-grid, .quick-actions { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 480px) {
                    .stats-grid, .quick-actions { grid-template-columns: 1fr; }
                }
            </style>

            <div class="income-expenses-container">
                <div class="module-header">
                    <h1>💰 Income & Expenses</h1>
                    <p>Track farm finances and cash flow</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-transaction">➕ Add Transaction</button>
                        <button class="btn btn-primary" id="import-receipts-btn">
                            📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span class="badge">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                ${pendingReceipts.length > 0 ? `
                    <div class="receipts-section">
                        <h3>📋 Pending Receipts (${pendingReceipts.length})</h3>
                        <div id="pending-receipts-list">
                            ${this.renderPendingReceipts(pendingReceipts)}
                        </div>
                    </div>
                ` : ''}

                <div class="stats-grid">
                    <div class="stat-card">
                        <div>💰</div>
                        <div class="stat-value" id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                        <div>Total Income</div>
                    </div>
                    <div class="stat-card">
                        <div>📊</div>
                        <div class="stat-value" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div>Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div>📈</div>
                        <div class="stat-value" id="net-income">${this.formatCurrency(stats.netIncome)}</div>
                        <div>Net Income</div>
                    </div>
                    <div class="stat-card">
                        <div>💳</div>
                        <div class="stat-value">${stats.transactionCount}</div>
                        <div>Transactions</div>
                    </div>
                </div>

                <div class="quick-actions">
                    <button class="quick-action-btn" id="add-income-btn">💰 Add Income</button>
                    <button class="quick-action-btn" id="add-expense-btn">💸 Add Expense</button>
                    <button class="quick-action-btn" id="financial-report-btn">📊 Financial Report</button>
                    <button class="quick-action-btn" id="export-transactions-btn">📁 Export</button>
                </div>

                <div class="transactions-section">
                    <h3>📋 Recent Transactions</h3>
                    <div id="transactions-list">
                        ${this.renderTransactionsList(this.getRecentTransactions(10))}
                    </div>
                </div>

                <div class="category-section">
                    <h3>📊 Category Breakdown</h3>
                    <div id="category-breakdown">
                        ${this.renderCategoryBreakdown()}
                    </div>
                </div>
            </div>

            <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="popout-modal hidden">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3>📥 Import Receipts</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div class="upload-methods">
                            <button class="btn btn-primary" id="camera-option" style="width: 100%; margin-bottom: 12px;">📷 Take Photo</button>
                            <button class="btn btn-primary" id="upload-option" style="width: 100%;">📁 Upload Files</button>
                        </div>
                        
                        <div id="camera-section" class="hidden">
                            <div class="camera-preview">
                                <video id="camera-preview" autoplay playsinline></video>
                                <canvas id="camera-canvas" style="display: none;"></canvas>
                            </div>
                            <div class="camera-controls">
                                <button class="btn btn-outline" id="capture-photo">📸 Capture</button>
                                <button class="btn btn-outline" id="switch-camera">🔄 Switch</button>
                                <button class="btn btn-outline" id="cancel-camera">✖️ Cancel</button>
                            </div>
                        </div>
                        
                        <div id="upload-section">
                            <div class="upload-area" id="drop-area">
                                <div>📁</div>
                                <h4>Drop files here or click to browse</h4>
                                <p>JPG, PNG, PDF (Max 10MB)</p>
                                <input type="file" id="file-input" accept="image/*,.pdf" multiple style="display: none;">
                                <button class="btn btn-primary" id="browse-btn">Browse Files</button>
                            </div>
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-outline close-modal">Close</button>
                    </div>
                </div>
            </div>

            <!-- Transaction Modal -->
            <div id="transaction-modal" class="popout-modal hidden">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3 id="transaction-modal-title">Add Transaction</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id">
                            
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
                                <input type="number" id="transaction-amount" class="form-input" step="0.01" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Description *</label>
                                <input type="text" id="transaction-description" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Payment Method</label>
                                <select id="transaction-payment" class="form-input">
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Reference Number</label>
                                <input type="text" id="transaction-reference" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea id="transaction-notes" class="form-input" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group" id="receipt-preview-container" style="display: none;">
                                <label class="form-label">Receipt Attached</label>
                                <div class="receipt-preview">
                                    <img id="receipt-image-preview" style="max-width: 100%; max-height: 150px; border-radius: 4px;">
                                    <div id="receipt-filename"></div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-outline" id="cancel-transaction">Cancel</button>
                        <button class="btn btn-danger hidden" id="delete-transaction">Delete</button>
                        <button class="btn btn-primary" id="save-transaction">Save</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateStats();
    },

    renderPendingReceipts(receipts) {
        return receipts.map(receipt => `
            <div class="receipt-item" data-id="${receipt.id}">
                <div>
                    <strong>${receipt.name}</strong>
                    <div class="receipt-meta">${this.formatFileSize(receipt.size)} • Pending</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary process-receipt" data-id="${receipt.id}">Process</button>
                    <button class="btn btn-sm btn-outline delete-receipt" data-id="${receipt.id}">Delete</button>
                </div>
            </div>
        `).join('');
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) {
            return '<div class="empty-state">No transactions yet. Add your first transaction!</div>';
        }
        
        return transactions.map(t => `
            <div class="transaction-item" data-id="${t.id}">
                <div>
                    <div class="transaction-description">${t.description}</div>
                    <div class="transaction-meta">${this.formatDate(t.date)} • ${t.category} • ${t.paymentMethod}</div>
                </div>
                <div class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
                </div>
            </div>
        `).join('');
    },

    renderCategoryBreakdown() {
        const categories = {};
        this.transactions.forEach(t => {
            if (!categories[t.category]) categories[t.category] = { income: 0, expense: 0 };
            categories[t.category][t.type] += t.amount;
        });
        
        if (Object.keys(categories).length === 0) {
            return '<div class="empty-state">No category data yet</div>';
        }
        
        return Object.entries(categories).map(([cat, data]) => `
            <div class="category-item" style="margin-bottom: 12px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div class="category-name" style="font-weight: bold;">${cat}</div>
                <div class="category-income" style="color: #4CAF50;">Income: ${this.formatCurrency(data.income)}</div>
                <div class="category-expense" style="color: #f44336;">Expense: ${this.formatCurrency(data.expense)}</div>
                <div class="category-net">Net: ${this.formatCurrency(data.income - data.expense)}</div>
            </div>
        `).join('');
    },

    // ==================== UI UPDATES ====================
    updateReceiptQueueUI() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        const list = document.getElementById('pending-receipts-list');
        if (list) list.innerHTML = this.renderPendingReceipts(pendingReceipts);
        
        const badge = document.querySelector('#import-receipts-btn .badge');
        if (badge) badge.textContent = pendingReceipts.length;
    },

    updateStats() {
        const stats = this.calculateStats();
        const totalIncome = document.getElementById('total-income');
        const totalExpenses = document.getElementById('total-expenses');
        const netIncome = document.getElementById('net-income');
        
        if (totalIncome) totalIncome.textContent = this.formatCurrency(stats.totalIncome);
        if (totalExpenses) totalExpenses.textContent = this.formatCurrency(stats.totalExpenses);
        if (netIncome) netIncome.textContent = this.formatCurrency(stats.netIncome);
    },

    updateTransactionsList() {
        const list = document.getElementById('transactions-list');
        if (list) list.innerHTML = this.renderTransactionsList(this.getRecentTransactions(10));
    },

    updateCategoryBreakdown() {
        const breakdown = document.getElementById('category-breakdown');
        if (breakdown) breakdown.innerHTML = this.renderCategoryBreakdown();
    },

    // ==================== MODAL CONTROLS ====================
    showTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const dateInput = document.getElementById('transaction-date');
            if (dateInput && !dateInput.value) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            const deleteBtn = document.getElementById('delete-transaction');
            if (deleteBtn) deleteBtn.style.display = 'none';
            const title = document.getElementById('transaction-modal-title');
            if (title) title.textContent = 'Add Transaction';
            this.receiptPreview = null;
            this.clearReceiptPreview();
        }
    },

    hideTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('transaction-form');
        if (form) form.reset();
        this.receiptPreview = null;
        this.clearReceiptPreview();
    },

    showImportReceiptsModal() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const cameraSection = document.getElementById('camera-section');
            const uploadSection = document.getElementById('upload-section');
            if (cameraSection) cameraSection.classList.add('hidden');
            if (uploadSection) uploadSection.classList.remove('hidden');
        }
    },

    hideImportReceiptsModal() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) modal.classList.add('hidden');
    },

    showReceiptPreviewInTransactionModal(receipt) {
        const container = document.getElementById('receipt-preview-container');
        const img = document.getElementById('receipt-image-preview');
        const filename = document.getElementById('receipt-filename');
        
        if (container && img && filename && receipt.dataURL) {
            container.style.display = 'block';
            img.src = receipt.dataURL;
            filename.textContent = receipt.name;
        }
    },

    clearReceiptPreview() {
        const container = document.getElementById('receipt-preview-container');
        if (container) container.style.display = 'none';
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        // Main buttons
        const addTransaction = document.getElementById('add-transaction');
        if (addTransaction) addTransaction.addEventListener('click', () => this.showTransactionModal());
        
        const importReceipts = document.getElementById('import-receipts-btn');
        if (importReceipts) importReceipts.addEventListener('click', () => this.showImportReceiptsModal());
        
        const addIncome = document.getElementById('add-income-btn');
        if (addIncome) addIncome.addEventListener('click', () => {
            this.showTransactionModal();
            const typeSelect = document.getElementById('transaction-type');
            if (typeSelect) typeSelect.value = 'income';
            this.updateCategoryOptions('income');
        });
        
        const addExpense = document.getElementById('add-expense-btn');
        if (addExpense) addExpense.addEventListener('click', () => {
            this.showTransactionModal();
            const typeSelect = document.getElementById('transaction-type');
            if (typeSelect) typeSelect.value = 'expense';
            this.updateCategoryOptions('expense');
        });
        
        const financialReport = document.getElementById('financial-report-btn');
        if (financialReport) financialReport.addEventListener('click', () => this.generateFinancialReport());
        
        const exportTransactions = document.getElementById('export-transactions-btn');
        if (exportTransactions) exportTransactions.addEventListener('click', () => this.exportTransactions());
        
        // Transaction modal
        const saveTransaction = document.getElementById('save-transaction');
        if (saveTransaction) saveTransaction.addEventListener('click', () => this.saveTransaction());
        
        const deleteTransaction = document.getElementById('delete-transaction');
        if (deleteTransaction) deleteTransaction.addEventListener('click', () => {
            const id = document.getElementById('transaction-id')?.value;
            if (id) this.deleteTransaction(parseInt(id));
        });
        
        const cancelTransaction = document.getElementById('cancel-transaction');
        if (cancelTransaction) cancelTransaction.addEventListener('click', () => this.hideTransactionModal());
        
        // Import modal
        const cameraOption = document.getElementById('camera-option');
        if (cameraOption) cameraOption.addEventListener('click', () => {
            const cameraSection = document.getElementById('camera-section');
            const uploadSection = document.getElementById('upload-section');
            if (cameraSection) cameraSection.classList.remove('hidden');
            if (uploadSection) uploadSection.classList.add('hidden');
            this.initializeCamera();
        });
        
        const uploadOption = document.getElementById('upload-option');
        if (uploadOption) uploadOption.addEventListener('click', () => {
            const uploadSection = document.getElementById('upload-section');
            const cameraSection = document.getElementById('camera-section');
            if (uploadSection) uploadSection.classList.remove('hidden');
            if (cameraSection) cameraSection.classList.add('hidden');
            this.stopCamera();
        });
        
        const capturePhoto = document.getElementById('capture-photo');
        if (capturePhoto) capturePhoto.addEventListener('click', () => this.capturePhoto());
        
        const switchCamera = document.getElementById('switch-camera');
        if (switchCamera) switchCamera.addEventListener('click', () => this.switchCamera());
        
        const cancelCamera = document.getElementById('cancel-camera');
        if (cancelCamera) cancelCamera.addEventListener('click', () => {
            this.stopCamera();
            const cameraSection = document.getElementById('camera-section');
            const uploadSection = document.getElementById('upload-section');
            if (cameraSection) cameraSection.classList.add('hidden');
            if (uploadSection) uploadSection.classList.remove('hidden');
        });
        
        const browseBtn = document.getElementById('browse-btn');
        if (browseBtn) browseBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.click();
        });
        
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
            e.target.value = '';
        });
        
        // Drag & drop
        const dropArea = document.getElementById('drop-area');
        if (dropArea) {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.style.borderColor = '#4CAF50';
            });
            dropArea.addEventListener('dragleave', () => {
                dropArea.style.borderColor = '#ddd';
            });
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.style.borderColor = '#ddd';
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideTransactionModal();
                this.hideImportReceiptsModal();
            });
        });
        
        // Receipt actions (delegated)
        document.addEventListener('click', (e) => {
            const processBtn = e.target.closest('.process-receipt');
            if (processBtn) {
                const id = processBtn.dataset.id;
                if (id) this.processSingleReceipt(id);
            }
            
            const deleteBtn = e.target.closest('.delete-receipt');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (id && confirm('Delete this receipt?')) {
                    this.receiptQueue = this.receiptQueue.filter(r => r.id !== id);
                    this.saveReceipts();
                    this.updateReceiptQueueUI();
                    this.showNotification('Receipt deleted', 'success');
                }
            }
            
            const transactionItem = e.target.closest('.transaction-item');
            if (transactionItem) {
                const id = transactionItem.dataset.id;
                if (id) this.editTransaction(parseInt(id));
            }
        });
        
        // Type change updates categories
        const typeSelect = document.getElementById('transaction-type');
        if (typeSelect) typeSelect.addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });
        
        // Set today's date
        const dateInput = document.getElementById('transaction-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },
    
    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('transaction-category');
        if (!categorySelect) return;
        
        const incomeOptions = `
            <option value="">Select Category</option>
            <optgroup label="Income">
                <option value="sales">Sales</option>
                <option value="services">Services</option>
                <option value="grants">Grants/Subsidies</option>
                <option value="other-income">Other Income</option>
            </optgroup>
        `;
        
        const expenseOptions = `
            <option value="">Select Category</option>
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
        `;
        
        categorySelect.innerHTML = type === 'income' ? incomeOptions : expenseOptions;
    },

    // ==================== CAMERA FUNCTIONS ====================
    switchCamera() {
        if (!this.cameraStream) return;
        
        const video = document.getElementById('camera-preview');
        if (!video) return;
        
        // Stop current stream
        this.cameraStream.getTracks().forEach(track => track.stop());
        
        // Get available devices
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length <= 1) {
                this.showNotification('Only one camera available', 'info');
                this.initializeCamera();
                return;
            }
            
            // Switch to next camera
            const currentDeviceId = this.currentDeviceId;
            let nextDevice = videoDevices.find(d => d.deviceId !== currentDeviceId);
            if (!nextDevice) nextDevice = videoDevices[0];
            
            this.currentDeviceId = nextDevice.deviceId;
            
            navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: nextDevice.deviceId } },
                audio: false
            }).then(stream => {
                this.cameraStream = stream;
                video.srcObject = stream;
                video.play();
            }).catch(error => {
                console.error('Camera switch error:', error);
                this.initializeCamera();
            });
        });
    },

    // ==================== EXPORT FUNCTIONS ====================
    exportTransactions() {
        if (this.transactions.length === 0) {
            this.showNotification('No transactions to export', 'info');
            return;
        }
        
        const data = {
            exportDate: new Date().toISOString(),
            totalTransactions: this.transactions.length,
            summary: this.calculateStats(),
            transactions: this.transactions
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Transactions exported successfully!', 'success');
    },

    exportAsCSV() {
        if (this.transactions.length === 0) {
            this.showNotification('No transactions to export', 'info');
            return;
        }
        
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Reference', 'Notes'];
        const rows = this.transactions.map(t => [
            t.date,
            t.type,
            t.category,
            t.amount,
            t.description,
            t.paymentMethod,
            t.reference || '',
            t.notes || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Transactions exported as CSV!', 'success');
    },

    // ==================== REPORT FUNCTIONS ====================
    generateFinancialReport() {
        const stats = this.calculateStats();
        const monthlyData = this.getMonthlyData();
        const categories = this.getCategorySummary();
        
        const report = {
            generatedAt: new Date().toISOString(),
            summary: stats,
            monthlyBreakdown: monthlyData,
            categoryBreakdown: categories,
            transactions: this.transactions
        };
        
        // Display report in modal
        this.showReportModal(report);
    },

    getMonthlyData() {
        const monthly = {};
        
        this.transactions.forEach(t => {
            const month = t.date.substring(0, 7); // YYYY-MM
            if (!monthly[month]) {
                monthly[month] = { income: 0, expense: 0, count: 0 };
            }
            monthly[month][t.type] += t.amount;
            monthly[month].count++;
        });
        
        return Object.entries(monthly)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({
                month,
                ...data,
                net: data.income - data.expense
            }));
    },

    getCategorySummary() {
        const categories = {};
        
        this.transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = { income: 0, expense: 0, count: 0 };
            }
            categories[t.category][t.type] += t.amount;
            categories[t.category].count++;
        });
        
        return Object.entries(categories)
            .map(([category, data]) => ({
                category,
                ...data,
                net: data.income - data.expense
            }))
            .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    },

    showReportModal(report) {
        const modal = document.createElement('div');
        modal.className = 'popout-modal';
        modal.innerHTML = `
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header">
                    <h3>📊 Financial Report</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="popout-modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="report-summary">
                        <h4>Summary</h4>
                        <div class="stats-grid" style="margin-bottom: 20px; grid-template-columns: repeat(3, 1fr);">
                            <div class="stat-card">
                                <div>💰 Total Income</div>
                                <div style="font-size: 24px; color: #4CAF50;">${this.formatCurrency(report.summary.totalIncome)}</div>
                            </div>
                            <div class="stat-card">
                                <div>💸 Total Expenses</div>
                                <div style="font-size: 24px; color: #f44336;">${this.formatCurrency(report.summary.totalExpenses)}</div>
                            </div>
                            <div class="stat-card">
                                <div>📈 Net Income</div>
                                <div style="font-size: 24px; color: ${report.summary.netIncome >= 0 ? '#4CAF50' : '#f44336'};">${this.formatCurrency(report.summary.netIncome)}</div>
                            </div>
                        </div>
                        
                        <h4>Monthly Breakdown</h4>
                        <div class="monthly-table">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th style="padding: 8px; text-align: left;">Month</th>
                                        <th style="padding: 8px; text-align: right;">Income</th>
                                        <th style="padding: 8px; text-align: right;">Expenses</th>
                                        <th style="padding: 8px; text-align: right;">Net</th>
                                        <th style="padding: 8px; text-align: center;">Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.monthlyBreakdown.map(m => `
                                        <tr>
                                            <td style="padding: 8px;">${m.month}</td>
                                            <td style="padding: 8px; text-align: right; color: #4CAF50;">${this.formatCurrency(m.income)}</td>
                                            <td style="padding: 8px; text-align: right; color: #f44336;">${this.formatCurrency(m.expense)}</td>
                                            <td style="padding: 8px; text-align: right; color: ${m.net >= 0 ? '#4CAF50' : '#f44336'};">${this.formatCurrency(m.net)}</td>
                                            <td style="padding: 8px; text-align: center;">${m.count}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <h4>Category Breakdown</h4>
                        <div class="category-table">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th style="padding: 8px; text-align: left;">Category</th>
                                        <th style="padding: 8px; text-align: right;">Income</th>
                                        <th style="padding: 8px; text-align: right;">Expenses</th>
                                        <th style="padding: 8px; text-align: right;">Net</th>
                                        <th style="padding: 8px; text-align: center;">Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.categoryBreakdown.map(c => `
                                        <tr>
                                            <td style="padding: 8px;">${c.category}</td>
                                            <td style="padding: 8px; text-align: right; color: #4CAF50;">${this.formatCurrency(c.income)}</td>
                                            <td style="padding: 8px; text-align: right; color: #f44336;">${this.formatCurrency(c.expense)}</td>
                                            <td style="padding: 8px; text-align: right; color: ${c.net >= 0 ? '#4CAF50' : '#f44336'};">${this.formatCurrency(c.net)}</td>
                                            <td style="padding: 8px; text-align: center;">${c.count}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn btn-primary" id="export-report-csv">Export as CSV</button>
                    <button class="btn btn-primary" id="export-report-json">Export as JSON</button>
                    <button class="btn btn-outline close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Export buttons
        const exportCSV = modal.querySelector('#export-report-csv');
        if (exportCSV) exportCSV.addEventListener('click', () => this.exportReportAsCSV(report));
        
        const exportJSON = modal.querySelector('#export-report-json');
        if (exportJSON) exportJSON.addEventListener('click', () => this.exportReportAsJSON(report));
        
        // Close modal
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    exportReportAsCSV(report) {
        // Export monthly data
        const monthlyHeaders = ['Month', 'Income', 'Expenses', 'Net', 'Transactions'];
        const monthlyRows = report.monthlyBreakdown.map(m => [
            m.month,
            m.income,
            m.expense,
            m.net,
            m.count
        ]);
        
        const categoryHeaders = ['Category', 'Income', 'Expenses', 'Net', 'Transactions'];
        const categoryRows = report.categoryBreakdown.map(c => [
            c.category,
            c.income,
            c.expense,
            c.net,
            c.count
        ]);
        
        const csvContent = [
            'FINANCIAL REPORT SUMMARY',
            `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
            `Total Income: ${report.summary.totalIncome}`,
            `Total Expenses: ${report.summary.totalExpenses}`,
            `Net Income: ${report.summary.netIncome}`,
            `Total Transactions: ${report.summary.transactionCount}`,
            '',
            'MONTHLY BREAKDOWN',
            monthlyHeaders.join(','),
            ...monthlyRows.map(row => row.join(',')),
            '',
            'CATEGORY BREAKDOWN',
            categoryHeaders.join(','),
            ...categoryRows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported as CSV!', 'success');
    },

    exportReportAsJSON(report) {
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported as JSON!', 'success');
    },

    // ==================== HELPER FUNCTIONS ====================
    calculateStats() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            transactionCount: this.transactions.length
        };
    },

    getRecentTransactions(limit = 10) {
        return [...this.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatFileSize(bytes) {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    },

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    },

    // ==================== CLEANUP ====================
    destroy() {
        console.log('🧹 Cleaning up Income & Expenses module...');
        this.stopCamera();
        if (this.element) {
            this.element.innerHTML = '';
        }
        this.initialized = false;
    }
};

// Register the module with the framework
if (window.FarmModules && window.FarmModules.registerModule) {
    console.log('💰 Registering income-expenses module with FarmModules...');
    window.FarmModules.registerModule(IncomeExpensesModule);
} else if (window.App && window.App.registerModule) {
    console.log('💰 Registering income-expenses module with App...');
    window.App.registerModule(IncomeExpensesModule);
} else {
    console.log('💰 Income & Expenses module loaded, waiting for framework...');
    // Wait for framework to be ready
    window.addEventListener('farmmodules-ready', () => {
        if (window.FarmModules && window.FarmModules.registerModule) {
            window.FarmModules.registerModule(IncomeExpensesModule);
        }
    });
}

// Also make it available globally for debugging
window.IncomeExpensesModule = IncomeExpensesModule;

console.log('✅ Income & Expenses module loaded and ready');
