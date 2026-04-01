// modules/income-expenses.js - COMPLETE WITH ALL METHODS
console.log('💰 Loading Income & Expenses module...');

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
    isOnline: true,
    isDeleting: false,
    isCapturing: false,
    captureTimeout: null,
    dataService: null,
    realtimeUnsubscribe: null,
    _globalClickHandler: null,
    _globalChangeHandler: null,

    // ==================== INITIALIZATION ====================
    async initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        this.dataService = window.UnifiedDataService;
        
        if (!this.dataService) {
            console.error('❌ UnifiedDataService not available! Falling back to legacy mode...');
            return this.initializeLegacy();
        }

        let waitCount = 0;
        while (!this.dataService.db && waitCount < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
        }
        
        this.isFirebaseAvailable = !!(this.dataService.db && this.dataService.userId);
        console.log('Firebase available:', this.isFirebaseAvailable);
        console.log('UnifiedDataService online:', this.dataService.isOnline);

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.setupNetworkDetection();
        await this.loadData();

        if (this.isFirebaseAvailable) {
            this.setupRealtimeSync();
        }
        
        await this.loadReceipts();
        this.setupReceiptActionListeners();
        
        if (this.isFirebaseAvailable && this.dataService.offlineQueue?.length > 0) {
            setTimeout(() => this.dataService.processOfflineQueue(), 3000);
        }

        this.receiptQueue = this.receiptQueue || [];
        this.setupSalesListeners();
        this.renderModule();
        this.initialized = true;
        this.connectToDataBroadcaster();
        this.updateSyncStatus(this.dataService.getSyncStatus());
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions');
        return true;
    },

    async initializeLegacy() {
        console.log('⚠️ Using legacy initialization (no UnifiedDataService)');
        
        let waitCount = 0;
        while (!window.db && waitCount < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
        }
        
        this.isFirebaseAvailable = !!(window.firebase && window.db);
        console.log('Firebase available:', this.isFirebaseAvailable);

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.setupNetworkDetection();
        await this.loadDataLegacy();

        if (this.isFirebaseAvailable) {
            this.setupRealtimeSyncLegacy();
        }
        
        await this.loadReceiptsFromFirebase();
        this.setupReceiptActionListeners();
        
        if (this.isFirebaseAvailable) {
            setTimeout(() => this.syncLocalTransactionsToFirebase(), 3000);
        }

        this.receiptQueue = this.receiptQueue || [];
        this.setupSalesListeners();
        this.renderModule();  // This is the line that was causing the error
        this.initialized = true;
        this.connectToDataBroadcaster();
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions (legacy mode)');
        return true;
    },

    // ==================== RENDER MODULE ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Income & Expenses</h1>
                    <p class="module-subtitle">Track farm finances and cash flow</p>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="add-transaction">➕ Add Transaction</button>
                        <button class="btn btn-primary" id="upload-receipt-btn" style="display: flex; align-items: center; gap: 8px;">
                            📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span class="receipt-queue-badge" id="receipt-count-badge">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                ${pendingReceipts.length > 0 ? `
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;" id="pending-receipts-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">📋 Pending Receipts (${pendingReceipts.length})</h3>
                            <div style="display: flex; gap: 12px;">
                                <button class="btn btn-outline" id="refresh-receipts-btn">🔄 Refresh</button>
                                <button class="btn btn-primary" id="process-all-receipts">⚡ Process All</button>
                            </div>
                        </div>
                        <div id="pending-receipts-list">
                            ${this.renderPendingReceiptsList(pendingReceipts)}
                        </div>
                    </div>
                ` : ''}

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

                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn"><div style="font-size: 32px;">💰</div><span>Add Income</span></button>
                    <button class="quick-action-btn" id="add-expense-btn"><div style="font-size: 32px;">💸</div><span>Add Expense</span></button>
                    <button class="quick-action-btn" id="financial-report-btn"><div style="font-size: 32px;">📊</div><span>Financial Report</span></button>
                    <button class="quick-action-btn" id="category-analysis-btn"><div style="font-size: 32px;">📋</div><span>Category Analysis</span></button>
                </div>

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

                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">📊 Category Breakdown</h3>
                    <div id="category-breakdown">
                        ${this.renderCategoryBreakdown()}
                    </div>
                </div>
            </div>

            <div id="import-receipts-modal" class="popout-modal hidden">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📥 Import Receipts</h3>
                        <button class="popout-modal-close" id="close-import-receipts">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="import-receipts-content">
                            ${this.renderImportReceiptsModal()}
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn btn-outline" id="cancel-import-receipts">Cancel</button>
                        <button class="btn btn-primary hidden" id="process-receipts-btn">⚡ Process Receipts<span id="process-receipts-count">0</span></button>
                    </div>
                </div>
            </div>
            
            <div id="transaction-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="transaction-modal-title">Add Transaction</h3>
                        <button class="popout-modal-close" id="close-transaction-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div><label class="form-label">Date *</label><input type="date" id="transaction-date" class="form-input" value="${this.getLocalDate()}" required></div>
                                <div><label class="form-label">Type *</label><select id="transaction-type" class="form-input" required><option value="income">💰 Income</option><option value="expense">💸 Expense</option></select></div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div><label class="form-label">Category *</label><select id="transaction-category" class="form-input" required><option value="">Select Category</option></select></div>
                                <div><label class="form-label">Amount ($) *</label><input type="number" id="transaction-amount" class="form-input" step="0.01" min="0" required placeholder="0.00"></div>
                            </div>
                            <div style="margin-bottom: 16px;"><label class="form-label">Description *</label><input type="text" id="transaction-description" class="form-input" required placeholder="Enter transaction description"></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div><label class="form-label">Payment Method</label><select id="transaction-payment" class="form-input"><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Bank Transfer</option></select></div>
                                <div><label class="form-label">Reference Number</label><input type="text" id="transaction-reference" class="form-input" placeholder="Invoice/Receipt #"></div>
                            </div>
                            <div style="margin-bottom: 16px;"><label class="form-label">Notes</label><textarea id="transaction-notes" class="form-input" rows="3"></textarea></div>
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
        setTimeout(() => this.setupReceiptActionListeners(), 100);
    },

    renderImportReceiptsModal() {
        return `
            <div class="import-receipts-container">
                <div class="quick-actions-section">
                    <h2 class="section-title">Upload Method</h2>
                    <div class="card-grid">
                        <button class="card-button" id="camera-option"><div class="card-icon">📷</div><span class="card-title">Take Photo</span></button>
                        <button class="card-button" id="upload-option"><div class="card-icon">📁</div><span class="card-title">Upload Files</span></button>
                    </div>
                </div>
                <div id="upload-section" style="display: none;">
                    <div class="upload-dropzone" id="receipt-dropzone"><div class="dropzone-icon">📁</div><h4>Drop receipt files here</h4><p>or click to browse</p><input type="file" id="receipt-file-input" accept="image/*,.pdf" multiple style="display: none;"></div>
                </div>
                <div class="camera-section" id="camera-section" style="display: none;">
                    <div class="glass-card"><div class="camera-preview"><video id="camera-preview" autoplay playsinline></video></div>
                    <div class="camera-controls"><button class="btn btn-primary" id="capture-photo">📸 Capture</button><button class="btn btn-outline" id="cancel-camera">Cancel</button></div></div>
                </div>
                <div class="recent-section" id="recent-section"><div id="recent-receipts-list">${this.renderRecentReceiptsList()}</div></div>
            </div>
        `;
    },

    renderPendingReceiptsList(receipts) {
        if (receipts.length === 0) return '<div style="text-align: center; padding: 40px;">No pending receipts</div>';
        return receipts.map(r => `<div class="pending-receipt-item"><span>${r.name}</span><button class="process-receipt-btn" data-receipt-id="${r.id}">Process</button><button class="delete-receipt-btn" data-receipt-id="${r.id}">Delete</button></div>`).join('');
    },

    renderRecentReceiptsList() {
        if (this.receiptQueue.length === 0) return '<div>No receipts</div>';
        return this.receiptQueue.slice(0, 5).map(r => `<div>${r.name}</div>`).join('');
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) return '<div style="text-align: center; padding: 40px;">No transactions</div>';
        return transactions.map(t => `
            <div class="transaction-item" data-id="${t.id}" style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">
                <div><strong>${t.date}</strong><br>${t.description}</div>
                <div style="text-align: right;"><span style="color: ${t.type === 'income' ? 'green' : 'red'}">${t.type === 'income' ? '+' : '-'}$${t.amount}</span><br>${t.category}</div>
            </div>
        `).join('');
    },

    renderCategoryBreakdown() {
        const incomeByCat = {};
        const expenseByCat = {};
        this.transactions.forEach(t => {
            if (t.type === 'income') incomeByCat[t.category] = (incomeByCat[t.category] || 0) + t.amount;
            else expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
        });
        return `<div><h4>Income</h4>${Object.entries(incomeByCat).map(([c, a]) => `<div>${c}: $${a}</div>`).join('')}</div><div><h4>Expenses</h4>${Object.entries(expenseByCat).map(([c, a]) => `<div>${c}: $${a}</div>`).join('')}</div>`;
    },

    // ==================== DATA LOADING ====================
    async loadData() {
        console.log('Loading transactions from UnifiedDataService...');
        try {
            this.transactions = this.dataService.get('transactions') || [];
            if (this.transactions.length === 0) {
                const saved = localStorage.getItem('farm-transactions');
                if (saved) {
                    const localTransactions = JSON.parse(saved);
                    for (const t of localTransactions) await this.dataService.save('transactions', t);
                    this.transactions = this.dataService.get('transactions') || [];
                }
            }
            this.transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            console.log(`✅ Loaded ${this.transactions.length} transactions`);
        } catch (error) {
            console.error('Error loading transactions:', error);
            await this.loadDataLegacy();
        }
    },

    async loadDataLegacy() {
        console.log('Loading transactions from localStorage (legacy)...');
        try {
            const saved = localStorage.getItem('farm-transactions');
            this.transactions = saved ? JSON.parse(saved) : [];
            if (this.isFirebaseAvailable && window.db) await this.loadFromFirebaseLegacy();
            this.transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
        }
    },

    async loadFromFirebaseLegacy() {
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) return;
            const snapshot = await window.db.collection('users').doc(user.uid).collection('transactions').orderBy('date', 'desc').get();
            if (snapshot.empty) return;
            const existingMap = new Map(this.transactions.map(t => [t.id?.toString(), t]));
            snapshot.forEach(doc => {
                const data = doc.data();
                const id = doc.id;
                if (!existingMap.has(id)) {
                    this.transactions.push({ id, ...data });
                    existingMap.set(id, data);
                }
            });
            console.log(`✅ Firebase sync complete, total: ${this.transactions.length}`);
        } catch (error) {
            console.error('Error loading from Firebase:', error);
        }
    },

    // ==================== SYNC METHODS ====================
    setupRealtimeSync() {
        if (!this.dataService) return;
        this.dataService.on('transactions-updated', (transactions) => {
            this.transactions = transactions || [];
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
        });
        this.dataService.on('sync-completed', (status) => this.updateSyncStatus(status));
    },

    setupRealtimeSyncLegacy() {
        if (!this.isFirebaseAvailable || !window.db) return;
        const user = window.firebase.auth().currentUser;
        if (!user) return;
        if (this.realtimeUnsubscribe) this.realtimeUnsubscribe();
        this.realtimeUnsubscribe = window.db.collection('users').doc(user.uid).collection('transactions').onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    const remote = change.doc.data();
                    const existingIndex = this.transactions.findIndex(t => t.id == remote.id);
                    if (existingIndex === -1) this.transactions.unshift(remote);
                    else this.transactions[existingIndex] = remote;
                    this.transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
                    localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                    this.updateStats();
                    this.updateTransactionsList();
                    this.updateCategoryBreakdown();
                }
            });
        });
    },

    async syncLocalTransactionsToFirebase() {
        if (!this.isOnline || !this.isFirebaseAvailable || !window.db) return;
        const user = window.firebase.auth().currentUser;
        if (!user) return;
        const localTransactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        for (const t of localTransactions) {
            if (t.source === 'demo') continue;
            await window.db.collection('users').doc(user.uid).collection('transactions').doc(t.id.toString()).set({ ...t, userId: user.uid, syncedAt: new Date().toISOString() }, { merge: true });
        }
    },

    // ==================== NETWORK DETECTION ====================
    setupNetworkDetection() {
        this.isOnline = navigator.onLine;
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Back online. Syncing data...', 'info');
            if (this.dataService) this.dataService.processOfflineQueue();
            else if (this.isFirebaseAvailable) this.syncLocalTransactionsToFirebase();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('You are offline. Changes saved locally.', 'info');
        });
    },

    // ==================== RECEIPTS ====================
    async loadReceipts() {
        if (this.dataService) await this.loadReceiptsFromUnifiedService();
        else await this.loadReceiptsFromFirebase();
    },

    async loadReceiptsFromUnifiedService() {
        try {
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
            if (this.isFirebaseAvailable) await this.loadReceiptsFromFirebase();
            this.updateReceiptQueueUI();
        } catch (error) {
            this.receiptQueue = [];
        }
    },

    async loadReceiptsFromFirebase() {
        try {
            if (!this.isFirebaseAvailable || !window.db) return;
            const user = window.firebase.auth().currentUser;
            if (!user) return;
            const snapshot = await window.db.collection('receipts').where('userId', '==', user.uid).limit(50).get();
            if (!snapshot.empty) {
                const firebaseReceipts = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'pending') {
                        firebaseReceipts.push({
                            id: data.id || doc.id,
                            name: data.name,
                            dataURL: data.dataURL,
                            size: data.size,
                            type: data.type,
                            status: 'pending',
                            uploadedAt: data.uploadedAt
                        });
                    }
                });
                this.mergeReceipts(firebaseReceipts);
                this.updateReceiptQueueUI();
            }
        } catch (error) {
            console.warn('Error loading receipts:', error);
        }
        this.loadFromLocalStorage();
    },

    loadFromLocalStorage() {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
        this.updateReceiptQueueUI();
    },

    mergeReceipts(firebaseReceipts) {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const receiptMap = new Map();
        firebaseReceipts.forEach(r => receiptMap.set(r.id, r));
        localReceipts.forEach(r => { if (!receiptMap.has(r.id)) receiptMap.set(r.id, { ...r, source: 'local' }); });
        this.receiptQueue = Array.from(receiptMap.values()).filter(r => r.status === 'pending').sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
    },

    saveReceiptToStorage(receipt) {
        this.receiptQueue.unshift(receipt);
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
        if (existingIndex !== -1) localReceipts.splice(existingIndex, 1);
        localReceipts.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
    },

    // ==================== SALES INTEGRATION ====================
    setupSalesListeners() {
        window.addEventListener('sale-completed', (event) => this.addIncomeFromSale(event.detail));
        window.addEventListener('order-completed', (event) => this.addIncomeFromSale(event.detail));
    },

    addIncomeFromSale(saleData) {
        const existing = this.transactions.find(t => t.reference === `ORDER-${saleData.orderId}`);
        if (existing) return;
        const transaction = {
            id: Date.now(),
            date: saleData.date || new Date().toISOString().split('T')[0],
            type: 'income',
            category: 'sales',
            amount: saleData.amount,
            description: saleData.description || `Sale from order`,
            paymentMethod: saleData.paymentMethod || 'cash',
            reference: `ORDER-${saleData.orderId}`,
            source: 'orders-module',
            orderId: saleData.orderId
        };
        this.transactions.unshift(transaction);
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        if (this.dataService) this.dataService.save('transactions', transaction);
        else if (this.isFirebaseAvailable) this.saveTransactionToFirebase(transaction);
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.showNotification(`💰 Income added from order: ${this.formatCurrency(saleData.amount)}`, 'success');
    },

    // ==================== TRANSACTION CRUD ====================
    async saveTransaction() {
        const transactionData = {
            id: document.getElementById('transaction-id')?.value || Date.now(),
            date: document.getElementById('transaction-date')?.value,
            type: document.getElementById('transaction-type')?.value,
            category: document.getElementById('transaction-category')?.value,
            amount: parseFloat(document.getElementById('transaction-amount')?.value) || 0,
            description: document.getElementById('transaction-description')?.value,
            paymentMethod: document.getElementById('transaction-payment')?.value,
            reference: document.getElementById('transaction-reference')?.value,
            notes: document.getElementById('transaction-notes')?.value
        };
        
        if (!transactionData.date || !transactionData.type || !transactionData.amount || !transactionData.description) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const existingIndex = this.transactions.findIndex(t => t.id == transactionData.id);
        if (existingIndex >= 0) this.transactions[existingIndex] = transactionData;
        else this.transactions.unshift(transactionData);
        
        this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
        if (this.dataService) await this.dataService.save('transactions', transactionData);
        else if (this.isFirebaseAvailable) await this.saveTransactionToFirebase(transactionData);
        
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.hideTransactionModal();
        this.showNotification('Transaction saved!', 'success');
    },

    async deleteTransaction() {
        const id = document.getElementById('transaction-id')?.value;
        if (!id || !confirm('Delete this transaction?')) return;
        
        this.transactions = this.transactions.filter(t => t.id != id);
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
        if (this.dataService) await this.dataService.delete('transactions', id);
        else if (this.isFirebaseAvailable && window.db) await window.db.collection('transactions').doc(id.toString()).delete();
        
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.hideTransactionModal();
        this.showNotification('Transaction deleted!', 'success');
    },

    async saveTransactionToFirebase(transaction) {
        const user = window.firebase.auth().currentUser;
        if (!user) return;
        await window.db.collection('users').doc(user.uid).collection('transactions').doc(transaction.id.toString()).set(transaction, { merge: true });
    },

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id == id);
        if (!transaction) return;
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
        this.showTransactionModal();
    },

    // ==================== UI UPDATES ====================
    updateStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        document.getElementById('total-income')?.textContent = this.formatCurrency(income);
        document.getElementById('total-expenses')?.textContent = this.formatCurrency(expenses);
        document.getElementById('net-income')?.textContent = this.formatCurrency(income - expenses);
    },

    updateTransactionsList() {
        const filter = document.getElementById('transaction-filter')?.value || 'all';
        const filtered = filter === 'all' ? this.transactions : this.transactions.filter(t => t.type === filter);
        document.getElementById('transactions-list').innerHTML = this.renderTransactionsList(filtered.slice(0, 10));
    },

    updateCategoryBreakdown() {
        document.getElementById('category-breakdown').innerHTML = this.renderCategoryBreakdown();
    },

    updateReceiptQueueUI() {
        const pending = this.receiptQueue.filter(r => r.status === 'pending');
        const badge = document.getElementById('receipt-count-badge');
        if (pending.length > 0) {
            if (badge) badge.textContent = pending.length;
            else document.getElementById('upload-receipt-btn')?.insertAdjacentHTML('beforeend', `<span class="receipt-queue-badge">${pending.length}</span>`);
        } else if (badge) badge.remove();
        document.getElementById('pending-receipts-list').innerHTML = this.renderPendingReceiptsList(pending);
        this.updateProcessReceiptsButton();
    },

    updateModalReceiptsList() {
        document.getElementById('recent-receipts-list').innerHTML = this.renderRecentReceiptsList();
        this.updateProcessReceiptsButton();
    },

    updateProcessReceiptsButton() {
        const pending = this.receiptQueue.filter(r => r.status === 'pending').length;
        const btn = document.getElementById('process-receipts-btn');
        const count = document.getElementById('process-receipts-count');
        if (btn && count) {
            if (pending > 0) {
                btn.classList.remove('hidden');
                count.textContent = pending;
                count.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
                count.classList.add('hidden');
            }
        }
    },

    updateSyncStatus(status) {
        const el = document.getElementById('income-sync-status');
        if (!el) return;
        if (this.dataService && !this.dataService.isOnline) {
            el.textContent = '📴 Offline';
            el.style.color = '#f44336';
        } else if (status?.pendingRemaining > 0) {
            el.textContent = `⏳ Syncing (${status.pendingRemaining} pending)`;
            el.style.color = '#FF9800';
        } else {
            el.textContent = '✅ Synced';
            el.style.color = '#4CAF50';
        }
    },

    // ==================== MODAL CONTROLS ====================
    showTransactionModal() {
        this.hideAllModals();
        document.getElementById('transaction-modal').classList.remove('hidden');
        document.getElementById('transaction-date').value = this.getLocalDate();
        document.getElementById('delete-transaction').style.display = 'none';
        document.getElementById('transaction-modal-title').textContent = 'Add Transaction';
    },

    hideTransactionModal() {
        document.getElementById('transaction-modal').classList.add('hidden');
        document.getElementById('transaction-form').reset();
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

    showImportReceiptsModal() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        }
        this.setupImportReceiptsHandlers();
        this.showQuickActionsView();
    },

    hideImportReceiptsModal() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    },

    hideAllModals() {
        document.querySelectorAll('.popout-modal').forEach(m => m.classList.add('hidden'));
        this.stopCamera();
    },

    showQuickActionsView() {
        this.stopCamera();
        document.getElementById('camera-section')?.style.setProperty('display', 'none');
        document.getElementById('upload-section')?.style.setProperty('display', 'none');
        document.querySelector('.quick-actions-section')?.style.setProperty('display', 'block');
        document.getElementById('recent-section')?.style.setProperty('display', 'block');
    },

    showUploadInterface() {
        this.stopCamera();
        document.getElementById('camera-section')?.style.setProperty('display', 'none');
        document.getElementById('upload-section')?.style.setProperty('display', 'block');
        document.querySelector('.quick-actions-section')?.style.setProperty('display', 'none');
        document.getElementById('recent-section')?.style.setProperty('display', 'block');
        setTimeout(() => this.setupDragAndDrop(), 100);
    },

    showCameraInterface() {
        this.resetAndShowCamera();
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(t => t.stop());
            this.cameraStream = null;
        }
        const video = document.getElementById('camera-preview');
        if (video) video.srcObject = null;
    },

    resetAndShowCamera() {
        this.stopCamera();
        const existing = document.getElementById('camera-section');
        if (existing) existing.remove();
        const container = document.getElementById('import-receipts-content');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', `<div class="camera-section" id="camera-section"><video id="camera-preview" autoplay playsinline></video><button class="btn-primary" id="capture-photo">📸 Capture</button><button class="btn-outline" id="cancel-camera">Cancel</button></div>`);
        this.initializeCamera();
    },

    initializeCamera() {
        const video = document.getElementById('camera-preview');
        if (!video) return;
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            this.cameraStream = stream;
            video.srcObject = stream;
        }).catch(err => {
            console.error('Camera error:', err);
            this.showNotification('Camera access denied', 'error');
            this.showUploadInterface();
        });
    },

    capturePhoto() {
        const video = document.getElementById('camera-preview');
        if (!video || !video.srcObject) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.showSimpleImageViewer(file);
            this.stopCamera();
        }, 'image/jpeg');
    },

    showSimpleImageViewer(file) {
        const reader = new FileReader();
        reader.onload = e => {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:100000;display:flex;align-items:center;justify-content:center';
            modal.innerHTML = `<div style="background:white;padding:20px;border-radius:10px;max-width:90%"><img src="${e.target.result}" style="max-width:100%;max-height:60vh"><div style="margin-top:20px"><button id="save-img">Save</button><button id="cancel-img">Cancel</button></div></div>`;
            document.body.appendChild(modal);
            document.getElementById('save-img')?.addEventListener('click', () => {
                this.saveReceiptFromFile(file, e.target.result);
                modal.remove();
                this.hideImportReceiptsModal();
            });
            document.getElementById('cancel-img')?.addEventListener('click', () => modal.remove());
        };
        reader.readAsDataURL(file);
    },

    saveReceiptFromFile(file, dataURL) {
        const receipt = {
            id: `receipt_${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataURL: dataURL,
            status: 'pending',
            uploadedAt: new Date().toISOString()
        };
        this.saveReceiptToStorage(receipt);
        this.showNotification('Receipt saved!', 'success');
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        if (this._globalClickHandler) document.removeEventListener('click', this._globalClickHandler);
        if (this._globalChangeHandler) document.removeEventListener('change', this._globalChangeHandler);
        
        this._globalClickHandler = (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.id;
            if (id === 'add-transaction') this.showTransactionModal();
            else if (id === 'add-income-btn') this.showAddIncome();
            else if (id === 'add-expense-btn') this.showAddExpense();
            else if (id === 'save-transaction') this.saveTransaction();
            else if (id === 'delete-transaction') this.deleteTransaction();
            else if (id === 'cancel-transaction') this.hideTransactionModal();
            else if (id === 'upload-receipt-btn') this.showImportReceiptsModal();
            else if (id === 'process-all-receipts') this.processPendingReceipts();
            else if (id === 'export-transactions') this.exportTransactions();
            else if (id === 'financial-report-btn') this.generateFinancialReport();
            else if (id === 'category-analysis-btn') this.generateCategoryAnalysis();
            else if (id === 'capture-photo') this.capturePhoto();
            else if (id === 'cancel-camera') { this.stopCamera(); this.showQuickActionsView(); }
            else if (id === 'upload-option') this.showUploadInterface();
            else if (id === 'camera-option') this.showCameraInterface();
            
            const transactionItem = e.target.closest('.transaction-item');
            if (transactionItem && transactionItem.dataset.id) this.editTransaction(transactionItem.dataset.id);
        };
        
        this._globalChangeHandler = (e) => {
            if (e.target.id === 'transaction-filter') this.updateTransactionsList();
        };
        
        document.addEventListener('click', this._globalClickHandler);
        document.addEventListener('change', this._globalChangeHandler);
    },

    setupImportReceiptsHandlers() {
        const setup = (id, handler) => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = (e) => { e.preventDefault(); handler(); };
        };
        setup('upload-option', () => this.showUploadInterface());
        setup('camera-option', () => this.showCameraInterface());
        setup('cancel-camera', () => { this.stopCamera(); this.showQuickActionsView(); });
        setup('back-to-main-view', () => { this.stopCamera(); this.showQuickActionsView(); });
        setup('capture-photo', () => this.capturePhoto());
        setup('refresh-receipts', () => this.loadReceiptsFromFirebase());
        this.setupFileInput();
        this.setupDragAndDrop();
    },

    setupFileInput() {
        let input = document.getElementById('receipt-file-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'receipt-file-input';
            input.accept = 'image/*,.pdf';
            input.multiple = true;
            input.style.display = 'none';
            document.body.appendChild(input);
        }
        input.onchange = (e) => {
            if (e.target.files?.length) this.handleFileUpload(e.target.files);
            e.target.value = '';
        };
    },

    setupDragAndDrop() {
        const dropArea = document.getElementById('receipt-dropzone');
        if (!dropArea) return;
        dropArea.ondragover = e => { e.preventDefault(); dropArea.classList.add('drag-over'); };
        dropArea.ondragleave = () => dropArea.classList.remove('drag-over');
        dropArea.ondrop = e => {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
            if (e.dataTransfer.files?.length) this.handleFileUpload(e.dataTransfer.files);
        };
        dropArea.onclick = () => document.getElementById('receipt-file-input')?.click();
    },

    handleFileUpload(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = e => this.saveReceiptFromFile(file, e.target.result);
                reader.readAsDataURL(file);
            } else {
                this.saveReceiptFromFile(file, '');
            }
        }
    },

    setupReceiptFormHandlers() {
        const uploadArea = document.getElementById('receipt-upload-area');
        const fileInput = document.getElementById('receipt-upload');
        if (uploadArea && fileInput) {
            uploadArea.onclick = () => fileInput.click();
            fileInput.onchange = e => {
                if (e.target.files?.[0]) this.handleTransactionReceiptUpload(e.target.files[0]);
            };
        }
        document.getElementById('remove-receipt')?.addEventListener('click', () => this.clearReceiptPreview());
    },

    handleTransactionReceiptUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please upload an image file', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            this.receiptPreview = { name: file.name, downloadURL: e.target.result };
            this.showReceiptPreviewInTransactionModal(this.receiptPreview);
        };
        reader.readAsDataURL(file);
    },

    showReceiptPreviewInTransactionModal(receipt) {
        const container = document.getElementById('receipt-preview-container');
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('receipt-image-preview');
        if (container && preview && img) {
            container.classList.remove('hidden');
            img.src = receipt.downloadURL;
            preview.classList.remove('hidden');
            document.getElementById('receipt-filename').textContent = receipt.name;
        }
    },

    clearReceiptPreview() {
        const container = document.getElementById('receipt-preview-container');
        if (container) container.classList.add('hidden');
        document.getElementById('receipt-upload').value = '';
        this.receiptPreview = null;
    },

    setupReceiptActionListeners() {
        document.addEventListener('click', e => {
            const process = e.target.closest('.process-receipt-btn');
            if (process && process.dataset.receiptId) this.processSingleReceipt(process.dataset.receiptId);
            const del = e.target.closest('.delete-receipt-btn');
            if (del && del.dataset.receiptId) this.confirmAndDeleteReceipt(del.dataset.receiptId);
        });
    },

    processSingleReceipt(id) {
        const receipt = this.receiptQueue.find(r => r.id === id);
        if (!receipt) return;
        this.showTransactionModal();
        setTimeout(() => {
            document.getElementById('transaction-description').value = `Receipt: ${receipt.name}`;
            this.receiptPreview = receipt;
            this.showReceiptPreviewInTransactionModal(receipt);
            this.markReceiptAsProcessed(id);
        }, 100);
    },

    processPendingReceipts() {
        const pending = this.receiptQueue.filter(r => r.status === 'pending');
        pending.forEach((r, i) => setTimeout(() => this.processSingleReceipt(r.id), i * 1000));
    },

    markReceiptAsProcessed(id) {
        const idx = this.receiptQueue.findIndex(r => r.id === id);
        if (idx !== -1) {
            this.receiptQueue[idx].status = 'processed';
            this.saveReceiptsToLocalStorage();
            this.updateReceiptQueueUI();
        }
    },

    saveReceiptsToLocalStorage() {
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
    },

    confirmAndDeleteReceipt(id) {
        if (confirm('Delete this receipt?')) this.deleteReceiptFromAllSources(id);
    },

    deleteReceiptFromAllSources(id) {
        this.receiptQueue = this.receiptQueue.filter(r => r.id !== id);
        this.saveReceiptsToLocalStorage();
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.showNotification('Receipt deleted', 'success');
    },

    // ==================== UTILITY METHODS ====================
    connectToDataBroadcaster() {
        if (window.DataBroadcaster) {
            window.DataBroadcaster.on('sales:updated', data => this.handleSalesUpdate(data.sales || data));
        }
    },

    handleSalesUpdate(salesData) {
        if (salesData && Array.isArray(salesData)) {
            const income = salesData.map(s => ({
                id: Date.now() + Math.random(),
                date: s.date,
                description: `Sale: ${s.product || s.customer}`,
                amount: s.total || 0,
                category: 'Sales Revenue',
                type: 'income',
                source: 'sales'
            }));
            this.transactions.push(...income);
            this.saveData();
            this.updateStats();
            this.updateTransactionsList();
        }
    },

    getDeviceId() {
        let id = localStorage.getItem('device-id');
        if (!id) {
            id = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device-id', id);
        }
        return id;
    },

    getLocalDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, netIncome: income - expenses, transactionCount: this.transactions.length };
    },

    getRecentTransactions(limit = 10) {
        return this.transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    showNotification(message, type = 'info') {
        if (window.coreModule?.showNotification) window.coreModule.showNotification(message, type);
        else {
            const div = document.createElement('div');
            div.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;background:${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};color:white;border-radius:8px;z-index:10000`;
            div.textContent = message;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
    },

    exportTransactions() {
        const data = { transactions: this.transactions, stats: this.calculateStats(), exportDate: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.showNotification('Transactions exported', 'success');
    },

    generateFinancialReport() {
        const stats = this.calculateStats();
        const report = `Farm Financial Report\nGenerated: ${new Date().toLocaleDateString()}\n\nTotal Income: ${this.formatCurrency(stats.totalIncome)}\nTotal Expenses: ${this.formatCurrency(stats.totalExpenses)}\nNet Income: ${this.formatCurrency(stats.netIncome)}\nTotal Transactions: ${stats.transactionCount}`;
        const blob = new Blob([report], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.showNotification('Report generated', 'success');
    },

    generateCategoryAnalysis() {
        const incomeByCat = {};
        const expenseByCat = {};
        this.transactions.forEach(t => {
            if (t.type === 'income') incomeByCat[t.category] = (incomeByCat[t.category] || 0) + t.amount;
            else expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
        });
        let csv = 'Category,Type,Amount\n';
        Object.entries(incomeByCat).forEach(([c, a]) => csv += `"${c}",income,${a}\n`);
        Object.entries(expenseByCat).forEach(([c, a]) => csv += `"${c}",expense,${a}\n`);
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `category-analysis-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.showNotification('Category analysis exported', 'success');
    },

    unload() {
        console.log('📦 Unloading Income & Expenses module...');
        this.stopCamera();
        if (this._globalClickHandler) document.removeEventListener('click', this._globalClickHandler);
        if (this._globalChangeHandler) document.removeEventListener('change', this._globalChangeHandler);
        if (this.realtimeUnsubscribe) this.realtimeUnsubscribe();
        this.hideAllModals();
        this.initialized = false;
        this.element = null;
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

window.IncomeExpensesModule = IncomeExpensesModule;
