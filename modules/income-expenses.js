// modules/income-expenses.js - COMPLETE WITH UNIFIED DATA SERVICE INTEGRATION
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

    // ==================== INITIALIZATION ====================
    async initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        // Get reference to UnifiedDataService
        this.dataService = window.UnifiedDataService;
        
        if (!this.dataService) {
            console.error('❌ UnifiedDataService not available! Falling back to legacy mode...');
            return this.initializeLegacy();
        }

        // Wait for Firebase to be ready (via data service)
        let waitCount = 0;
        while (!this.dataService.db && waitCount < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
        }
        
        this.isFirebaseAvailable = !!(this.dataService.db && this.dataService.userId);
        console.log('Firebase available:', this.isFirebaseAvailable);
        console.log('UnifiedDataService online:', this.dataService.isOnline);
        console.log('Pending operations:', this.dataService.offlineQueue?.length || 0);

        // Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        // Setup network detection
        this.setupNetworkDetection();
        
        // Load data from unified service
        await this.loadData();

        // Setup real-time sync
        this.setupRealtimeSync();
        
        // Load receipts
        await this.loadReceipts();
        
        // Setup receipt action listeners
        this.setupReceiptActionListeners();
        
        // Sync any pending operations if online
        if (this.isFirebaseAvailable && this.dataService.offlineQueue?.length > 0) {
            console.log(`📦 Found ${this.dataService.offlineQueue.length} pending operations, syncing...`);
            setTimeout(() => {
                this.dataService.processOfflineQueue();
            }, 3000);
        }

        this.receiptQueue = this.receiptQueue || [];
        this.setupSalesListeners();
        
        // Render module
        this.renderModule();
        this.initialized = true;
        
        // Connect to data broadcaster for backward compatibility
        this.connectToDataBroadcaster();
        
        // Update sync status in UI
        this.updateSyncStatus(this.dataService.getSyncStatus());
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions');
        console.log('📊 Sync status:', this.dataService.getSyncStatus());
        
        return true;
    },

    /**
     * Legacy initialization for backward compatibility
     */
    async initializeLegacy() {
        console.log('⚠️ Using legacy initialization (no UnifiedDataService)');
        
        // Wait for Firebase to be ready
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

        // Setup real-time sync (legacy)
        if (this.isFirebaseAvailable) {
            this.setupRealtimeSyncLegacy();
        }
        
        await this.loadReceiptsFromFirebase();
        this.setupReceiptActionListeners();
        
        if (this.isFirebaseAvailable) {
            setTimeout(() => {
                this.syncLocalTransactionsToFirebase();
            }, 3000);
        }

        this.receiptQueue = this.receiptQueue || [];
        this.setupSalesListeners();  
        this.renderModule();
        this.initialized = true;
        this.connectToDataBroadcaster();
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions (legacy mode)');
        return true;
    },

    // ==================== NETWORK DETECTION ====================
    setupNetworkDetection() {
        this.isOnline = navigator.onLine;
        console.log(`🌐 Initial network status: ${this.isOnline ? 'Online' : 'Offline'}`);
        
        window.addEventListener('online', () => {
            console.log('🌐 Device came online');
            this.isOnline = true;
            this.showNotification('Back online. Syncing data...', 'info');
            
            if (this.dataService) {
                this.dataService.processOfflineQueue();
            } else if (this.isFirebaseAvailable) {
                this.syncLocalTransactionsToFirebase();
                this.loadReceiptsFromFirebase();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Device went offline');
            this.isOnline = false;
            this.showNotification('You are offline. Changes saved locally.', 'info');
            this.updateSyncStatus({ pendingRemaining: this.dataService?.offlineQueue?.length || 0 });
        });
    },

    // ==================== DATA LOADING ====================
    async loadData() {
        console.log('Loading transactions from UnifiedDataService...');
        
        try {
            // Get transactions from unified service
            this.transactions = this.dataService.get('transactions') || [];
            
            // Also check localStorage for any data that might not be in unified service yet
            if (this.transactions.length === 0) {
                const saved = localStorage.getItem('farm-transactions');
                if (saved) {
                    const localTransactions = JSON.parse(saved);
                    console.log(`📁 Found ${localTransactions.length} transactions in localStorage, importing...`);
                    
                    // Import to unified service
                    for (const transaction of localTransactions) {
                        await this.dataService.save('transactions', transaction);
                    }
                    
                    // Reload from unified service
                    this.transactions = this.dataService.get('transactions') || [];
                }
            }
            
            // Sort by date (newest first)
            this.transactions.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateB - dateA;
            });
            
            console.log(`✅ Loaded ${this.transactions.length} transactions from UnifiedDataService`);
            
            // Update sync status
            this.updateSyncStatus(this.dataService.getSyncStatus());
            
        } catch (error) {
            console.error('❌ Error loading transactions from unified service:', error);
            await this.loadDataLegacy();
        }
    },

    async loadDataLegacy() {
        console.log('Loading transactions from localStorage (legacy)...');
        
        try {
            const saved = localStorage.getItem('farm-transactions');
            if (saved) {
                this.transactions = JSON.parse(saved);
                console.log('📁 Loaded from localStorage:', this.transactions.length);
            } else {
                this.transactions = [];
            }
            
            // Load from Firebase and merge if available
            if (this.isFirebaseAvailable && window.db && !this.dataService) {
                await this.loadFromFirebaseLegacy();
            }
            
            // Sort and save
            this.transactions.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateB - dateA;
            });
            
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
            
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
            this.transactions = [];
        }
    },

    async loadFromFirebaseLegacy() {
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) return;
            
            console.log('☁️ Loading from Firebase (legacy)...');
            
            const snapshot = await window.db.collection('users')
                .doc(user.uid)
                .collection('transactions')
                .orderBy('date', 'desc')
                .get();
            
            if (snapshot.empty) return;
            
            const existingMap = new Map();
            this.transactions.forEach(t => {
                if (t.id) existingMap.set(t.id.toString(), t);
            });
            
            let newCount = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const firebaseId = doc.id.toString();
                
                if (!existingMap.has(firebaseId)) {
                    existingMap.set(firebaseId, {
                        id: firebaseId,
                        date: data.date,
                        type: data.type,
                        category: data.category,
                        amount: parseFloat(data.amount) || 0,
                        description: data.description || '',
                        paymentMethod: data.paymentMethod || 'cash',
                        reference: data.reference || '',
                        notes: data.notes || '',
                        receipt: data.receipt || null,
                        userId: data.userId || user.uid,
                        createdAt: data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt || new Date().toISOString(),
                        source: 'firebase'
                    });
                    newCount++;
                }
            });
            
            this.transactions = Array.from(existingMap.values());
            console.log(`✅ Firebase sync: +${newCount} new, total: ${this.transactions.length}`);
            
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
            
        } catch (error) {
            console.error('Error loading from Firebase:', error);
        }
    },

    // ==================== SYNC METHODS ====================
    setupRealtimeSync() {
        console.log('📡 Setting up real-time sync...');
        
        if (!this.dataService) {
            console.log('❌ UnifiedDataService not available');
            return false;
        }
        
        // Listen for transaction updates from unified service
        this.dataService.on('transactions-updated', (transactions) => {
            console.log('🔄 Transactions updated from unified service:', transactions?.length);
            this.transactions = transactions || [];
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
        });
        
        // Listen for sync status changes
        this.dataService.on('sync-completed', (status) => {
            console.log('✅ Sync completed:', status);
            this.updateSyncStatus(status);
            
            if (status.successCount > 0) {
                this.showNotification(`✅ Synced ${status.successCount} transaction(s)`, 'success');
            }
        });
        
        // Listen for offline queue updates
        this.dataService.on('offline-operation-queued', (data) => {
            console.log('📦 Operation queued:', data);
            this.updateSyncStatus({ pendingRemaining: data.queueLength });
        });
        
        return true;
    },

    setupRealtimeSyncLegacy() {
        console.log('📡 Setting up legacy real-time sync...');
        
        if (!this.isFirebaseAvailable || !window.db) {
            console.log('❌ Firebase not available');
            return false;
        }
        
        const user = window.firebase.auth().currentUser;
        if (!user) {
            console.log('❌ No user logged in');
            return false;
        }
        
        if (this.realtimeUnsubscribe) {
            this.realtimeUnsubscribe();
            this.realtimeUnsubscribe = null;
        }
        
        console.log('Setting up listener for user:', user.uid);
        
        try {
            this.realtimeUnsubscribe = window.db.collection('users')
                .doc(user.uid)
                .collection('transactions')
                .onSnapshot((snapshot) => {
                    console.log(`🔄 Received ${snapshot.docChanges().length} changes from Firebase`);
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added' || change.type === 'modified') {
                            const remote = change.doc.data();
                            const myDeviceId = this.getDeviceId();
                            
                            if (remote.deviceId === myDeviceId) {
                                return;
                            }
                            
                            const existingIndex = this.transactions.findIndex(t => t.id == remote.id);
                            
                            if (existingIndex === -1) {
                                this.transactions.unshift(remote);
                            } else {
                                this.transactions[existingIndex] = remote;
                            }
                            
                            this.transactions.sort((a, b) => {
                                const dateA = new Date(a.date || a.createdAt);
                                const dateB = new Date(b.date || b.createdAt);
                                return dateB - dateA;
                            });
                            
                            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                            this.updateStats();
                            this.updateTransactionsList();
                            this.updateCategoryBreakdown();
                            
                            this.showNotification(`📱 New transaction from another device`, 'info');
                        }
                    });
                }, (error) => {
                    console.error('❌ Real-time sync error:', error);
                    this.realtimeUnsubscribe = null;
                });
            
            console.log('✅ Legacy real-time sync active');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to set up legacy real-time sync:', error);
            return false;
        }
    },

    async syncLocalTransactionsToFirebase() {
        if (this.dataService) {
            await this.dataService.processOfflineQueue();
            return;
        }
        
        if (!this.isOnline || !this.isFirebaseAvailable || !window.db) {
            console.log('Skipping sync - offline or Firebase unavailable');
            return;
        }
        
        console.log('🔄 Syncing local transactions to Firebase (legacy)...');
        
        try {
            const user = window.firebase?.auth?.().currentUser;
            if (!user) {
                console.log('User not authenticated, skipping sync');
                return;
            }
            
            const localTransactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
            
            if (localTransactions.length === 0) {
                console.log('✅ No local transactions to sync');
                return;
            }
            
            console.log(`Found ${localTransactions.length} local transactions`);
            
            for (const transaction of localTransactions) {
                try {
                    if (transaction.source === 'demo') continue;
                    
                    const transactionWithUser = {
                        ...transaction,
                        userId: user.uid,
                        syncedAt: new Date().toISOString()
                    };
                    
                    await window.db.collection('transactions')
                        .doc(transaction.id.toString())
                        .set(transactionWithUser, { merge: true });
                    
                    console.log(`✅ Synced transaction: ${transaction.id}`);
                    
                } catch (error) {
                    console.warn(`⚠️ Failed to sync transaction ${transaction.id}:`, error.message);
                }
            }
            
            console.log('✅ Transaction sync complete');
            
        } catch (error) {
            console.error('❌ Error syncing transactions to Firebase:', error);
        }
    },

    async saveToFirebaseLegacy() {
        if (!this.isFirebaseAvailable || !window.db) return false;
        
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) return false;
            
            console.log('💾 Saving to Firebase (legacy)...');
            
            for (const transaction of this.transactions) {
                await window.db.collection('users')
                    .doc(user.uid)
                    .collection('transactions')
                    .doc(transaction.id.toString())
                    .set({
                        ...transaction,
                        userId: user.uid,
                        deviceId: this.getDeviceId(),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
            }
            
            console.log('✅ Saved to Firebase');
            return true;
            
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            return false;
        }
    },

    // ==================== TRANSACTION CRUD ====================
    async saveTransaction(transactionData) {
        console.log('Saving transaction via unified service...', transactionData);
        
        const now = new Date().toISOString();
        const formattedDate = this.formatDateForStorage(transactionData.date);
        
        const finalTransaction = {
            ...transactionData,
            date: formattedDate,
            updatedAt: now,
            createdAt: transactionData.createdAt || now
        };
        
        if (!finalTransaction.id) {
            finalTransaction.id = Date.now().toString();
        }
        
        let result;
        
        if (this.dataService) {
            result = await this.dataService.save('transactions', finalTransaction);
        } else {
            result = await this.saveTransactionLegacy(finalTransaction);
        }
        
        if (result.success) {
            if (!this.dataService) {
                const existingIndex = this.transactions.findIndex(t => t.id === finalTransaction.id);
                if (existingIndex >= 0) {
                    this.transactions[existingIndex] = finalTransaction;
                } else {
                    this.transactions.unshift(finalTransaction);
                }
                
                this.transactions.sort((a, b) => {
                    return this.compareDates(a.date, b.date);
                });
            }
            
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            
            const offlineMsg = result.offline ? ' (will sync when online)' : '';
            this.showNotification(`Transaction saved!${offlineMsg}`, 'success');
            
            if (finalTransaction.type === 'income') {
                this.broadcastIncomeToSales(finalTransaction);
            }
            
            if (finalTransaction.type === 'expense') {
                this.broadcastExpenseToInventory(finalTransaction);
            }
            
            if (this.dataService) {
                this.updateSyncStatus(this.dataService.getSyncStatus());
            }
        } else {
            this.showNotification('Error saving transaction: ' + (result.error || 'Unknown error'), 'error');
        }
        
        return result;
    },

    async saveTransactionLegacy(transactionData) {
        console.log('Saving transaction via legacy method...');
        
        if (!this.transactions) this.transactions = [];
        
        const existingIndex = this.transactions.findIndex(t => t.id === transactionData.id);
        const myDeviceId = this.getDeviceId();
        
        const finalTransaction = {
            ...transactionData,
            sourceDeviceId: myDeviceId,
            updatedAt: new Date().toISOString(),
            deviceId: myDeviceId
        };
        
        if (!finalTransaction.createdAt) {
            finalTransaction.createdAt = finalTransaction.updatedAt;
        }
        
        if (existingIndex >= 0) {
            this.transactions[existingIndex] = finalTransaction;
        } else {
            this.transactions.unshift(finalTransaction);
        }
        
        this.transactions.sort((a, b) => {
            return this.compareDates(a.date, b.date);
        });
        
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
        if (this.isFirebaseAvailable) {
            await this.saveToFirebaseLegacy();
        }
        
        return { success: true, id: finalTransaction.id, data: finalTransaction };
    },

    async deleteTransaction(transactionId) {
        console.log('Deleting transaction via unified service:', transactionId);
        
        let result;
        
        if (this.dataService) {
            result = await this.dataService.delete('transactions', transactionId);
        } else {
            result = await this.deleteTransactionLegacy(transactionId);
        }
        
        if (result.success) {
            if (!this.dataService) {
                this.transactions = this.transactions.filter(t => t.id != transactionId);
            }
            
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            
            const offlineMsg = result.offline ? ' (will sync when online)' : '';
            this.showNotification(`Transaction deleted!${offlineMsg}`, 'success');
        } else {
            this.showNotification('Error deleting transaction: ' + (result.error || 'Unknown error'), 'error');
        }
        
        return result;
    },

    async deleteTransactionLegacy(transactionId) {
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction) return { success: false, error: 'Transaction not found' };
        
        this.transactions = this.transactions.filter(t => t.id != transactionId);
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
        if (this.isFirebaseAvailable && window.db) {
            try {
                await window.db.collection('transactions')
                    .doc(transactionId.toString())
                    .delete();
            } catch (firebaseError) {
                console.warn('Failed to delete from Firestore:', firebaseError.message);
            }
        }
        
        return { success: true };
    },

    async updateTransaction(transactionId, updates) {
        console.log('Updating transaction via unified service:', transactionId);
        
        let result;
        
        if (this.dataService) {
            result = await this.dataService.update('transactions', transactionId, updates);
        } else {
            result = await this.updateTransactionLegacy(transactionId, updates);
        }
        
        if (result.success) {
            if (!this.dataService) {
                const index = this.transactions.findIndex(t => t.id == transactionId);
                if (index !== -1) {
                    this.transactions[index] = { ...this.transactions[index], ...updates, updatedAt: new Date().toISOString() };
                }
            }
            
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            
            const offlineMsg = result.offline ? ' (will sync when online)' : '';
            this.showNotification(`Transaction updated!${offlineMsg}`, 'success');
        } else {
            this.showNotification('Error updating transaction: ' + (result.error || 'Unknown error'), 'error');
        }
        
        return result;
    },

    async updateTransactionLegacy(transactionId, updates) {
        const index = this.transactions.findIndex(t => t.id == transactionId);
        if (index === -1) return { success: false, error: 'Transaction not found' };
        
        this.transactions[index] = { ...this.transactions[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
        if (this.isFirebaseAvailable && window.db) {
            try {
                await window.db.collection('transactions')
                    .doc(transactionId.toString())
                    .update(updates);
            } catch (firebaseError) {
                console.warn('Failed to update in Firestore:', firebaseError.message);
            }
        }
        
        return { success: true };
    },

    // ==================== RECEIPT MANAGEMENT ====================
    async loadReceipts() {
        console.log('Loading receipts...');
        
        if (this.dataService) {
            await this.loadReceiptsFromUnifiedService();
        } else {
            await this.loadReceiptsFromFirebase();
        }
    },

    async loadReceiptsFromUnifiedService() {
        console.log('Loading receipts from UnifiedDataService...');
        
        try {
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
            console.log('📁 Loaded receipts from localStorage:', this.receiptQueue.length);
            
            if (this.isFirebaseAvailable && window.db) {
                await this.loadReceiptsFromFirebase();
            }
            
            this.updateReceiptQueueUI();
            
        } catch (error) {
            console.warn('⚠️ Error loading receipts:', error.message);
            this.receiptQueue = [];
        }
    },

    async loadReceiptsFromFirebase() {
        console.log('Loading receipts from Firebase...');
        
        try {
            if (this.isFirebaseAvailable && window.db) {
                const user = window.firebase?.auth?.().currentUser;
                if (user) {
                    try {
                        const snapshot = await window.db.collection('receipts')
                            .where('userId', '==', user.uid)
                            .limit(50)
                            .get();
                        
                        if (!snapshot.empty) {
                            const firebaseReceipts = [];
                            snapshot.forEach(doc => {
                                const data = doc.data();
                                
                                if (data.status === 'pending') {
                                    let downloadURL = data.dataURL;
                                    if (!downloadURL && data.base64Data) {
                                        downloadURL = `data:${data.type || 'image/jpeg'};base64,${data.base64Data}`;
                                    }
                                    
                                    firebaseReceipts.push({
                                        id: data.id || doc.id,
                                        name: data.name || 'Unnamed receipt',
                                        downloadURL: downloadURL,
                                        dataURL: downloadURL,
                                        base64Data: data.base64Data,
                                        size: data.size || 0,
                                        type: data.type || 'image/jpeg',
                                        status: data.status || 'pending',
                                        uploadedAt: data.uploadedAt || new Date().toISOString(),
                                        storageType: data.storageType || 'firestore-base64',
                                        userId: data.userId || user.uid,
                                        source: 'firebase'
                                    });
                                }
                            });
                            
                            console.log('✅ Loaded receipts from Firebase:', firebaseReceipts.length);
                            
                            this.mergeReceipts(firebaseReceipts);
                            this.updateReceiptQueueUI();
                            return;
                        }
                    } catch (error) {
                        console.warn('⚠️ Firebase receipts load error:', error.message);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ General receipts load error:', error.message);
        }
        
        this.loadFromLocalStorage();
    },

    loadFromLocalStorage() {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
        console.log('📁 Loaded receipts from localStorage:', this.receiptQueue.length);
        this.updateReceiptQueueUI();
    },

    mergeReceipts(firebaseReceipts) {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const receiptMap = new Map();
        
        firebaseReceipts.forEach(receipt => {
            receiptMap.set(receipt.id, receipt);
        });
        
        localReceipts.forEach(localReceipt => {
            if (!receiptMap.has(localReceipt.id)) {
                receiptMap.set(localReceipt.id, {
                    ...localReceipt,
                    source: 'local'
                });
            }
        });
        
        this.receiptQueue = Array.from(receiptMap.values())
            .filter(r => r.status === 'pending')
            .sort((a, b) => {
                const dateA = new Date(a.uploadedAt);
                const dateB = new Date(b.uploadedAt);
                return dateB - dateA;
            });
        
        console.log('✅ Merged receipts. Total:', this.receiptQueue.length);
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
    },

    saveReceiptsToLocalStorage() {
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        console.log('💾 Saved receipts to localStorage:', this.receiptQueue.length);
    },

    async saveReceiptToFirebase(receipt) {
        if (this.dataService) {
            console.log('Using UnifiedDataService for receipt save');
            await this.dataService.save('receipts', receipt);
            return true;
        }
        
        console.log('📤 Attempting to save receipt to Firebase (legacy):', receipt.id);
        
        if (!this.isFirebaseAvailable || !window.db) {
            console.log('❌ Firebase not available, skipping save');
            return false;
        }
        
        try {
            const user = window.firebase?.auth?.().currentUser;
            if (!user) {
                console.log('❌ No authenticated user, skipping Firebase save');
                return false;
            }
            
            const firebaseReceipt = {
                id: receipt.id,
                name: receipt.name,
                dataURL: receipt.dataURL,
                size: receipt.size,
                type: receipt.type,
                status: receipt.status || 'pending',
                userId: user.uid,
                uploadedAt: receipt.uploadedAt || new Date().toISOString(),
                source: receipt.source || 'camera',
                cropped: receipt.cropped || false,
                transactionId: receipt.transactionId || null,
                syncedAt: new Date().toISOString()
            };
            
            await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
            
            console.log('✅ Receipt saved to Firebase successfully:', receipt.id);
            
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            const updatedReceipts = localReceipts.map(r => 
                r.id === receipt.id ? {...r, synced: true, syncedAt: new Date().toISOString()} : r
            );
            localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving receipt to Firebase:', error);
            return false;
        }
    },

    saveReceiptToStorage(receipt) {
        console.log('💾 Saving receipt to storage:', receipt.name);
        
        this.receiptQueue.unshift(receipt);
        
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
        if (existingIndex !== -1) {
            localReceipts.splice(existingIndex, 1);
        }
        localReceipts.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
        
        console.log('✅ Saved to localStorage, receipt data length:', receipt.dataURL?.length);
        
        this.saveReceiptToFirebase(receipt)
            .then(success => {
                if (success) {
                    console.log('✅ Receipt synced to Firebase');
                } else {
                    console.log('📱 Receipt saved locally only');
                }
            })
            .catch(err => {
                console.log('⚠️ Firebase save failed, keeping local only:', err);
            });
        
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.showCaptureSuccess(receipt);
    },

    getReceiptURL(receipt) {
        if (!receipt) return '';
        
        if (receipt.dataURL) return receipt.dataURL;
        
        if (receipt.base64Data && receipt.type) {
            return `data:${receipt.type};base64,${receipt.base64Data}`;
        }
        
        return receipt.downloadURL || '';
    },

    getReceiptImageUrl(receipt) {
        if (!receipt) return null;
        
        if (receipt.dataURL && receipt.dataURL.startsWith('data:')) {
            return receipt.dataURL;
        }
        if (receipt.downloadURL && receipt.downloadURL.startsWith('http')) {
            return receipt.downloadURL;
        }
        if (receipt.base64Data && receipt.type) {
            return `data:${receipt.type};base64,${receipt.base64Data}`;
        }
        return null;
    },

    // ==================== SALES INTEGRATION ====================
    setupSalesListeners() {
        console.log('📡 Setting up sales listeners...');
        
        const possibleEventSystems = [
            { obj: window.DataBroadcaster, name: 'DataBroadcaster' },
            { obj: window.broadcaster, name: 'broadcaster' },
            { obj: window.Broadcaster, name: 'Broadcaster' },
            { obj: window.EventBus, name: 'EventBus' }
        ];
        
        let listenerAttached = false;
        
        for (const system of possibleEventSystems) {
            if (system.obj && typeof system.obj.on === 'function') {
                system.obj.on('sale-completed', (saleData) => {
                    console.log(`💰 Sale completed via ${system.name}:`, saleData);
                    this.addIncomeFromSale(saleData);
                });
                console.log(`✅ Listener attached to ${system.name}`);
                listenerAttached = true;
                break;
            }
        }
        
        if (!listenerAttached) {
            console.log('⚠️ No event system found, using fallback');
            this.setupFallbackSalesListener();
        }
    },

    setupFallbackSalesListener() {
        console.log('📡 Setting up fallback sales listener (custom events)');
        
        window.addEventListener('sale-completed', (event) => {
            console.log('💰 Sale completed custom event received:', event.detail);
            this.addIncomeFromSale(event.detail);
        });
        
        window.addEventListener('order-completed', (event) => {
            console.log('💰 Order completed event received:', event.detail);
            this.addIncomeFromSale(event.detail);
        });
        
        console.log('✅ Fallback sales listeners setup complete');
    },

    addIncomeFromSale(saleData) {
        console.log('➕ Adding income from sale:', saleData);
        
        if (saleData.sourceDeviceId === this.getDeviceId() && saleData.source === 'income-module') {
            console.log('⚠️ Skipping - this sale was auto-created from this device');
            return;
        }
        
        const existingTransaction = this.transactions.find(t => 
            t.reference === `ORDER-${saleData.orderId}` || 
            (t.source === 'orders-module' && t.orderId === saleData.orderId) ||
            t.id === saleData.transactionId
        );
        
        if (existingTransaction) {
            console.log('⚠️ Sale already added as income, skipping:', existingTransaction.id);
            return;
        }
        
        const transactionData = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: saleData.date || new Date().toISOString().split('T')[0],
            type: 'income',
            category: 'sales',
            amount: saleData.amount,
            description: saleData.description || `Sale from order`,
            paymentMethod: saleData.paymentMethod || 'cash',
            reference: saleData.reference || `ORDER-${saleData.orderId}`,
            notes: saleData.notes || `Auto-generated from order #${saleData.orderId}`,
            receipt: null,
            userId: window.firebase?.auth()?.currentUser?.uid || 'anonymous',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'orders-module',
            orderId: saleData.orderId,
            customerName: saleData.customerName,
            sourceDeviceId: saleData.sourceDeviceId || 'external'
        };
        
        if (!this.transactions) this.transactions = [];
        this.transactions.unshift(transactionData);
        
        try {
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
            console.log('💾 Saved sale to localStorage:', transactionData.id);
        } catch (storageError) {
            console.warn('⚠️ Failed to save to localStorage:', storageError);
        }
        
        if (this.isFirebaseAvailable && window.db) {
            this.saveTransactionToFirebase(transactionData)
                .then(() => {
                    console.log('✅ Sale saved to Firebase');
                })
                .catch(error => {
                    console.warn('⚠️ Failed to save sale to Firebase:', error.message);
                });
        }
        
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        
        this.showNotification(`💰 Income added from order #${saleData.orderId}: ${this.formatCurrency(saleData.amount)}`, 'success');
        
        console.log('✅ Income added successfully:', transactionData);
    },

    // ==================== BROADCAST METHODS ====================
    connectToDataBroadcaster() {
        console.log('🔌 Income module attempting to connect to Data Broadcaster...');
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryConnect = () => {
            attempts++;
            
            if (window.DataBroadcaster && window.DataBroadcaster.on) {
                console.log('✅ Income module connected to Data Broadcaster!');
                
                window.DataBroadcaster.on('sales:updated', (data) => {
                    console.log('📨 Income module received sales update:', data);
                    this.handleSalesUpdate(data.sales || data);
                });
                
                window.DataBroadcaster.on('finance:updated', (data) => {
                    console.log('💰 Finance update received:', data);
                    this.refreshIncomeDisplay();
                });
                
                return true;
            }
            
            if (attempts < maxAttempts) {
                console.log(`⏳ Waiting for Data Broadcaster... (${attempts}/${maxAttempts})`);
                setTimeout(tryConnect, 500);
            } else {
                console.log('⚠️ Using fallback event system');
                this.setupFallbackListeners();
            }
        };
        
        tryConnect();
    },

    setupFallbackListeners() {
        window.addEventListener('sales-updated', (event) => {
            console.log('📨 Received sales update via fallback:', event.detail);
            this.handleSalesUpdate(event.detail.sales || event.detail);
        });
    },

    handleSalesUpdate(salesData) {
        console.log(`💰 Processing ${salesData?.length || 0} sales for income`);
        
        if (salesData && Array.isArray(salesData)) {
            const incomeTransactions = salesData.map(sale => ({
                id: sale.id || Date.now() + Math.random(),
                date: sale.date || new Date().toISOString().split('T')[0],
                description: `Sale: ${sale.product || sale.customer || 'Farm sale'}`,
                amount: sale.total || 0,
                category: 'Sales Revenue',
                type: 'income',
                source: 'sales'
            }));
            
            if (!window.incomeData) window.incomeData = [];
            
            const existingIds = new Set(window.incomeData.map(t => t.id));
            const newTransactions = incomeTransactions.filter(t => !existingIds.has(t.id));
            
            window.incomeData = [...window.incomeData, ...newTransactions];
            
            if (window.app?.currentSection === 'income-expenses') {
                this.refreshIncomeDisplay();
            }
            
            if (typeof this.showNotification === 'function') {
                this.showNotification(`💰 Added ${newTransactions.length} sales to income`, 'success');
            }
        }
    },

    refreshIncomeDisplay() {
        this.updateTransactionsList();
        this.updateStats();
        this.updateCategoryBreakdown();
    },

    broadcastIncomeToSales(transaction) {
        if (this.dataService) {
            this.dataService.broadcast('income-recorded', {
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id,
                timestamp: new Date().toISOString()
            });
        }
        
        if (window.DataBroadcaster) {
            window.DataBroadcaster.emit('income-recorded', {
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id
            });
        }
        
        window.dispatchEvent(new CustomEvent('income-recorded', {
            detail: {
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id
            }
        }));
    },

    broadcastExpenseToInventory(transaction) {
        if (this.dataService) {
            this.dataService.broadcast('expense-recorded', {
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id,
                timestamp: new Date().toISOString()
            });
        }
        
        if (window.DataBroadcaster) {
            window.DataBroadcaster.emit('expense-recorded', {
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id
            });
        }
        
        window.dispatchEvent(new CustomEvent('expense-recorded', {
            detail: {
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                date: transaction.date,
                source: 'income-module',
                transactionId: transaction.id
            }
        }));
    },

    broadcastTransactionUpdate(transactionData, isNew, oldTransaction) {
        console.log('📢 Broadcasting transaction update');
        
        const updateData = {
            id: transactionData.id,
            date: transactionData.date,
            type: transactionData.type,
            category: transactionData.category,
            amount: transactionData.amount,
            description: transactionData.description,
            isNew: isNew,
            timestamp: new Date().toISOString(),
            oldData: oldTransaction || null,
            sourceDeviceId: transactionData.sourceDeviceId || this.getDeviceId()
        };
        
        if (window.DataBroadcaster) {
            window.DataBroadcaster.emit('transaction-updated', updateData);
        }
        
        const event = new CustomEvent('transaction-updated', { detail: updateData });
        window.dispatchEvent(event);
    },

    broadcastToDashboard(transactionData) {
        console.log('📊 Broadcasting to dashboard');
        
        if (transactionData.type === 'income') {
            if (window.DataBroadcaster) {
                window.DataBroadcaster.emit('income-updated', {
                    amount: transactionData.amount,
                    source: 'transaction',
                    transactionId: transactionData.id,
                    timestamp: new Date().toISOString()
                });
            }
        } else if (transactionData.type === 'expense') {
            if (window.DataBroadcaster) {
                window.DataBroadcaster.emit('expense-updated', {
                    amount: transactionData.amount,
                    source: 'transaction',
                    transactionId: transactionData.id,
                    timestamp: new Date().toISOString()
                });
            }
        }
    },

    // ==================== HELPER METHODS ====================
    getDeviceId() {
        let deviceId = localStorage.getItem('device-id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device-id', deviceId);
        }
        return deviceId;
    },

    getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateForStorage(dateString) {
        if (!dateString) return this.getLocalDate();
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return this.getLocalDate();
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateForDisplay(dateString) {
        if (!dateString) return 'No date';
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatDate(dateString) {
        return this.formatDateForDisplay(dateString);
    },

    compareDates(dateA, dateB) {
        const dA = new Date(dateA);
        const dB = new Date(dateB);
        return dB - dA;
    },

    updateSyncStatus(status) {
        const syncElement = document.getElementById('income-sync-status');
        if (!syncElement) return;
        
        if (this.dataService && !this.dataService.isOnline) {
            syncElement.textContent = `📴 Offline`;
            syncElement.style.color = '#f44336';
        } else if (status.pendingRemaining > 0) {
            syncElement.textContent = `⏳ Syncing (${status.pendingRemaining} pending)`;
            syncElement.style.color = '#FF9800';
        } else {
            syncElement.textContent = `✅ Synced`;
            syncElement.style.color = '#4CAF50';
        }
    },

    // ==================== RECEIPT UI METHODS ====================
    updateReceiptQueueUI() {
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
            
            const pendingList = document.getElementById('pending-receipts-list');
            if (pendingList) {
                pendingList.innerHTML = this.renderPendingReceiptsList(pendingReceipts);
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
        
        this.updateProcessReceiptsButton();
    },

    updateModalReceiptsList() {
        const recentList = document.getElementById('recent-receipts-list');
        if (recentList) {
            recentList.innerHTML = this.renderRecentReceiptsList();
        }
        
        const pendingList = document.getElementById('pending-receipts-list');
        if (pendingList) {
            const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
            if (pendingReceipts.length > 0) {
                pendingList.innerHTML = this.renderPendingReceiptsList(pendingReceipts);
            }
        }
        
        this.updateProcessReceiptsButton();
    },

    updateProcessReceiptsButton() {
        const processBtn = document.getElementById('process-receipts-btn');
        const processCount = document.getElementById('process-receipts-count');
        
        if (!processBtn || !processCount) return;
        
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        const pendingCount = pendingReceipts.length;
        
        if (pendingCount > 0) {
            processBtn.classList.remove('hidden');
            processCount.textContent = pendingCount;
            processCount.classList.remove('hidden');
            processBtn.title = `Process ${pendingCount} pending receipt${pendingCount !== 1 ? 's' : ''}`;
        } else {
            processBtn.classList.add('hidden');
            processCount.classList.add('hidden');
        }
    },

    processSingleReceipt(receiptId) {
        console.log(`🔍 Processing single receipt: ${receiptId}`);
        
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) {
            this.showNotification('Receipt not found', 'error');
            return;
        }
        
        this.showNotification(`Processing "${receipt.name}"...`, 'info');
        
        this.showTransactionModal();
        
        setTimeout(() => {
            const amountInput = document.getElementById('transaction-amount');
            const descriptionInput = document.getElementById('transaction-description');
            
            if (amountInput) {
                amountInput.focus();
            }
            
            if (descriptionInput) {
                descriptionInput.value = `Receipt: ${receipt.name}`;
            }
            
            if (receipt.type && receipt.type.startsWith('image/')) {
                this.receiptPreview = {
                    ...receipt,
                    status: 'processed'
                };
                
                this.showReceiptPreviewInTransactionModal(receipt);
                this.markReceiptAsProcessed(receiptId);
            }
        }, 500);
    },

    processPendingReceipts() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pendingReceipts.length === 0) {
            this.showNotification('No pending receipts to process', 'info');
            return;
        }
        
        this.showNotification(`Processing ${pendingReceipts.length} receipt(s)...`, 'info');
        
        pendingReceipts.forEach((receipt, index) => {
            setTimeout(() => {
                this.processSingleReceipt(receipt.id);
            }, index * 1000);
        });
    },

    markReceiptAsProcessed(receiptId) {
        const receiptIndex = this.receiptQueue.findIndex(r => r.id === receiptId);
        if (receiptIndex === -1) return;
        
        this.receiptQueue[receiptIndex].status = 'processed';
        this.receiptQueue[receiptIndex].processedAt = new Date().toISOString();
        
        this.saveReceiptsToLocalStorage();
        
        if (this.isFirebaseAvailable && window.db) {
            window.db.collection('receipts').doc(receiptId).update({
                status: 'processed',
                processedAt: new Date().toISOString()
            }).catch(error => {
                console.warn('Failed to update receipt in Firestore:', error.message);
            });
        }
        
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
    },

    // ==================== CAMERA METHODS (SIMPLIFIED) ====================
    stopCamera() {
        console.log('🛑 Stopping camera...');
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                try {
                    track.stop();
                    track.enabled = false;
                } catch (e) {
                    console.warn('⚠️ Error stopping track:', e);
                }
            });
            this.cameraStream = null;
        }
        
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            try {
                if (video.srcObject) {
                    const stream = video.srcObject;
                    if (stream.getTracks) {
                        stream.getTracks().forEach(track => {
                            try { track.stop(); } catch (e) {}
                        });
                    }
                }
                video.srcObject = null;
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (e) {
                console.warn('⚠️ Error clearing video:', e);
            }
        });
        
        const preview = document.getElementById('camera-preview');
        if (preview) {
            preview.srcObject = null;
            preview.pause();
            preview.removeAttribute('src');
            preview.load();
        }
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'none';
        }
        
        this.cameraStream = null;
        console.log('✅ Camera fully stopped');
    },

    // ==================== TRANSACTION UI ====================
    editTransaction(transactionId) {
        console.log('Editing transaction:', transactionId);
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction) {
            this.showNotification('Transaction not found', 'error');
            return;
        }
        
        const idInput = document.getElementById('transaction-id');
        if (idInput) idInput.value = transaction.id;
        
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) dateInput.value = transaction.date || this.getLocalDate();
        
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
        
        if (transaction.receipt) {
            this.receiptPreview = transaction.receipt;
            this.showReceiptPreviewInTransactionModal(transaction.receipt);
        } else {
            this.receiptPreview = null;
            this.clearReceiptPreview();
        }
        
        const modal = document.getElementById('transaction-modal');
        if (modal && modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
        }
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
            
            if (transactionId) {
                if (deleteBtn) deleteBtn.style.display = 'block';
            }
            
            const title = document.getElementById('transaction-modal-title');
            if (title) title.textContent = transactionId ? 'Edit Transaction' : 'Add Transaction';
            this.clearReceiptPreview();
        }
    },

    hideTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.add('hidden');
        this.currentEditingId = null;
        this.receiptPreview = null;
        this.clearReceiptPreview();
    },

    showAddIncome() {
        this.showTransactionModal();
        const typeSelect = document.getElementById('transaction-type');
        if (typeSelect) typeSelect.value = 'income';
        const title = document.getElementById('transaction-modal-title');
        if (title) title.textContent = 'Add Income';
    },

    showAddExpense() {
        this.showTransactionModal();
        const typeSelect = document.getElementById('transaction-type');
        if (typeSelect) typeSelect.value = 'expense';
        const title = document.getElementById('transaction-modal-title');
        if (title) title.textContent = 'Add Expense';
    },

    hideAllModals() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.stopCamera();
    },

    showImportReceiptsModal() {
        console.log('=== SHOW IMPORT RECEIPTS MODAL ===');
        
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            modal.style.zIndex = '10000';
        } else {
            console.error('❌ Modal element not found');
            return;
        }
        
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (importReceiptsContent) {
            importReceiptsContent.innerHTML = this.renderImportReceiptsModal();
        }
        
        setTimeout(() => {
            this.setupImportReceiptsHandlers();
            this.setupFileInput();
            this.showQuickActionsView();
            this.ensureCameraSectionExists();
        }, 100);
    },

    hideImportReceiptsModal() {
        console.log('❌ Closing import receipts modal');
        
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        
        const fileInput = document.getElementById('receipt-upload-input');
        if (fileInput) {
            fileInput.value = '';
        }
    },

    showQuickActionsView() {
        console.log('🏠 Showing quick actions view...');
        
        this.stopCamera();
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) cameraSection.style.display = 'none';
        
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) uploadSection.style.display = 'none';
        
        const quickActionsSection = document.querySelector('.quick-actions-section');
        if (quickActionsSection) quickActionsSection.style.display = 'block';
        
        const recentSection = document.getElementById('recent-section');
        if (recentSection) recentSection.style.display = 'block';
    },

    showUploadInterface() {
        console.log('📁 Showing upload interface...');
        
        this.stopCamera();
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) cameraSection.style.display = 'none';
        
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) uploadSection.style.display = 'block';
        
        const recentSection = document.getElementById('recent-section');
        if (recentSection) recentSection.style.display = 'block';
        
        const quickActionsSection = document.querySelector('.quick-actions-section');
        if (quickActionsSection) quickActionsSection.style.display = 'none';
        
        setTimeout(() => {
            this.setupDragAndDrop();
        }, 100);
    },

    showCameraInterface() {
        console.log('📷 Showing camera interface...');
        this.resetAndShowCamera();
    },

    resetAndShowCamera() {
        console.log('🔄 Resetting and showing camera interface...');
        
        this.stopCamera();
        
        const existingCameraSection = document.getElementById('camera-section');
        if (existingCameraSection) {
            existingCameraSection.remove();
        }
        
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (!importReceiptsContent) {
            console.error('❌ Import receipts content not found');
            return;
        }
        
        const cameraHTML = `
            <div class="camera-section" id="camera-section" style="display: block;">
                <div class="glass-card">
                    <div class="card-header header-flex">
                        <h3>📷 Camera</h3>
                        <div class="camera-status" id="camera-status">Initializing...</div>
                    </div>
                    <div class="camera-preview">
                        <video id="camera-preview" autoplay playsinline></video>
                        <canvas id="camera-canvas" style="display: none;"></canvas>
                    </div>
                    <div class="camera-controls">
                        <button class="btn btn-outline" id="switch-camera-btn">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Switch Camera</span>
                        </button>
                        <button class="btn btn-primary" id="capture-photo-btn">
                            <span class="btn-icon">📸</span>
                            <span class="btn-text">Capture</span>
                        </button>
                        <button class="btn btn-outline" id="cancel-camera-btn">
                            <span class="btn-icon">✖️</span>
                            <span class="btn-text">Back</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const quickActionsSection = importReceiptsContent.querySelector('.quick-actions-section');
        if (quickActionsSection) {
            quickActionsSection.insertAdjacentHTML('afterend', cameraHTML);
        } else {
            importReceiptsContent.insertAdjacentHTML('beforeend', cameraHTML);
        }
        
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        const quickActions = document.querySelector('.quick-actions-section');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (recentSection) recentSection.style.display = 'none';
        if (quickActions) quickActions.style.display = 'none';
        
        setTimeout(() => {
            this.initializeCameraWithRetry();
        }, 100);
    },

    ensureCameraSectionExists() {
        const cameraSection = document.getElementById('camera-section');
        if (!cameraSection) {
            console.log('🔧 Camera section missing, recreating...');
            this.recreateCameraSection();
        }
    },

    recreateCameraSection() {
        console.log('🔧 Recreating camera section...');
        
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (!importReceiptsContent) {
            console.error('❌ Import receipts content not found');
            return;
        }
        
        if (document.getElementById('camera-section')) {
            console.log('✅ Camera section already exists');
            return;
        }
        
        const cameraSectionHTML = `
            <div class="camera-section" id="camera-section" style="display: none;">
                <div class="glass-card">
                    <div class="card-header header-flex">
                        <h3>📷 Camera</h3>
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
                            <span class="btn-text">Back to Upload</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const recentSection = document.getElementById('recent-section');
        if (recentSection) {
            recentSection.insertAdjacentHTML('afterend', cameraSectionHTML);
        } else {
            importReceiptsContent.insertAdjacentHTML('beforeend', cameraSectionHTML);
        }
        
        console.log('✅ Camera section recreated');
    },

    initializeCameraWithRetry(retryCount = 0) {
        console.log(`📷 Initializing camera (attempt ${retryCount + 1})...`);
        
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('❌ Video element not found');
            if (retryCount < 3) {
                setTimeout(() => this.initializeCameraWithRetry(retryCount + 1), 500);
            }
            return;
        }
        
        video.pause();
        video.srcObject = null;
        video.load();
        
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        
        if (status) status.textContent = 'Requesting camera...';
        
        const constraints = {
            video: {
                facingMode: this.cameraFacingMode || 'environment',
                width: { ideal: 720 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('✅ Camera access granted');
                this.cameraStream = stream;
                video.srcObject = stream;
                
                return new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        video.play().then(resolve).catch(resolve);
                    };
                });
            })
            .then(() => {
                console.log('📹 Video playing successfully');
                if (status) status.textContent = 'Camera Ready';
                this.attachCameraButtonHandlers();
            })
            .catch(error => {
                console.error('❌ Camera error:', error);
                
                let errorMessage = 'Camera access failed. ';
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Camera permission denied. Please check browser settings.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No camera found on this device.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'Camera is busy. Please close other apps using the camera.';
                }
                
                if (status) status.textContent = 'Camera unavailable';
                this.showNotification(errorMessage, 'error');
                
                setTimeout(() => {
                    if (confirm('Camera not available. Would you like to upload a file instead?')) {
                        this.showUploadInterface();
                    }
                }, 2000);
            });
    },

    attachCameraButtonHandlers() {
        console.log('🔧 Attaching camera button handlers...');
        
        const captureBtn = document.getElementById('capture-photo-btn');
        if (captureBtn) {
            const newCaptureBtn = captureBtn.cloneNode(true);
            captureBtn.parentNode.replaceChild(newCaptureBtn, captureBtn);
            
            newCaptureBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.capturePhoto();
            };
        }
        
        const switchBtn = document.getElementById('switch-camera-btn');
        if (switchBtn) {
            const newSwitchBtn = switchBtn.cloneNode(true);
            switchBtn.parentNode.replaceChild(newSwitchBtn, switchBtn);
            
            newSwitchBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.switchCameraAndReinit();
            };
        }
        
        const cancelBtn = document.getElementById('cancel-camera-btn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.stopCamera();
                this.showQuickActionsView();
            };
        }
    },

    switchCameraAndReinit() {
        console.log('🔄 Switching camera...');
        
        const now = Date.now();
        if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1500) {
            console.log('⏳ Please wait before switching camera again');
            return;
        }
        this.lastSwitchClick = now;
        
        this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
        console.log('📱 New camera mode:', this.cameraFacingMode);
        
        this.stopCamera();
        
        setTimeout(() => {
            this.initializeCameraWithRetry();
        }, 300);
    },

    capturePhoto() {
        console.log('📸 Capture photo');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        if (!video || !video.srcObject) {
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        this.isCapturing = true;
        
        if (status) status.textContent = 'Capturing...';
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        video.style.opacity = '0.7';
        setTimeout(() => video.style.opacity = '1', 100);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            if (status) status.textContent = 'Photo captured!';
            this.showNotification('📸 Photo captured!', 'success');
            
            this.stopCamera();
            
            const cameraSection = document.getElementById('camera-section');
            if (cameraSection) {
                cameraSection.style.display = 'none';
            }
            
            this.showSimpleImageViewer(file);
            this.isCapturing = false;
            
        }, 'image/jpeg', 0.9);
    },

    showSimpleImageViewer(file) {
        console.log('🖼️ SIMPLE VIEWER - SHOWING WITH OPTIONS');
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) cameraSection.remove();
        
        const importModal = document.getElementById('import-receipts-modal');
        if (importModal) {
            importModal.style.display = 'none';
            importModal.classList.add('hidden');
        }
        
        this.stopCamera();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const existingViewer = document.getElementById('image-review-modal');
            if (existingViewer) existingViewer.remove();
            
            const modal = document.createElement('div');
            modal.id = 'image-review-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 25px; border-radius: 16px; text-align: center; max-width: 90%; max-height: 90%; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <h3 style="margin-bottom: 20px; color: #2E7D32; font-weight: 600;">Review Image</h3>
                    <div style="max-width: 100%; max-height: 50vh; overflow: hidden; margin-bottom: 20px; border-radius: 8px; border: 2px solid #e0e0e0;">
                        <img src="${e.target.result}" style="width: 100%; height: auto; display: block;">
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                        <button id="edit-image-btn" style="flex:1; min-width:100px; padding:12px 20px; background:linear-gradient(135deg,#2196F3,#1976D2); color:white; border:none; border-radius:8px; cursor:pointer;">✎ Edit Image</button>
                        <button id="save-image-btn" style="flex:1; min-width:100px; padding:12px 20px; background:linear-gradient(135deg,#4CAF50,#2E7D32); color:white; border:none; border-radius:8px; cursor:pointer;">✓ Save</button>
                        <button id="retake-image-btn" style="flex:1; min-width:100px; padding:12px 20px; background:linear-gradient(135deg,#FF9800,#F57C00); color:white; border:none; border-radius:8px; cursor:pointer;">↺ Retake</button>
                        <button id="delete-image-btn" style="flex:1; min-width:100px; padding:12px 20px; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; border-radius:8px; cursor:pointer;">🗑️ Delete</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('edit-image-btn')?.addEventListener('click', () => {
                modal.remove();
                this.showStandardCropper(file);
            });
            
            document.getElementById('save-image-btn')?.addEventListener('click', () => {
                modal.remove();
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.saveReceiptFromFile(file, e.target.result);
                };
                reader.readAsDataURL(file);
            });
            
            document.getElementById('retake-image-btn')?.addEventListener('click', () => {
                modal.remove();
                this.stopCamera();
                const importModal = document.getElementById('import-receipts-modal');
                if (importModal) {
                    importModal.style.display = 'flex';
                    importModal.classList.remove('hidden');
                }
                setTimeout(() => {
                    this.resetAndShowCamera();
                }, 200);
            });
            
            document.getElementById('delete-image-btn')?.addEventListener('click', () => {
                modal.remove();
                this.showNotification('Image discarded', 'info');
                const importModal = document.getElementById('import-receipts-modal');
                if (importModal) {
                    importModal.style.display = 'flex';
                    importModal.classList.remove('hidden');
                }
                setTimeout(() => {
                    this.showQuickActionsView();
                }, 100);
            });
        };
        reader.readAsDataURL(file);
    },

    saveReceiptFromFile(file, dataURL) {
        console.log('💾 Saving receipt:', file.name);
        this.saveReceiptWithBase64(file, dataURL);
    },

    saveReceiptWithBase64(file, base64Data) {
        const receiptId = `receipt_${Date.now()}`;
        
        let imageData = base64Data;
        let mimeType = file.type;
        
        if (base64Data.startsWith('data:')) {
            const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                const base64Only = matches[2];
                
                const receipt = {
                    id: receiptId,
                    name: file.name,
                    type: mimeType,
                    size: file.size,
                    dataURL: base64Data,
                    downloadURL: base64Data,
                    base64Data: base64Only,
                    status: 'pending',
                    uploadedAt: new Date().toISOString(),
                    source: file.source || 'camera',
                    cropped: false,
                    storageType: 'base64'
                };
                
                this.saveReceiptToStorage(receipt);
                return;
            }
        }
        
        const receipt = {
            id: receiptId,
            name: file.name,
            type: file.type,
            size: file.size,
            dataURL: base64Data,
            downloadURL: base64Data,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            source: file.source || 'camera',
            cropped: false,
            storageType: 'base64'
        };
        
        this.saveReceiptToStorage(receipt);
    },

    showCaptureSuccess(receipt) {
        const modal = document.createElement('div');
        modal.id = 'capture-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 10002;
            text-align: center;
            max-width: 400px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease-out;
        `;
        
        let imagePreview = '';
        if (receipt.type?.startsWith('image/')) {
            imagePreview = `
                <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; max-height: 200px; overflow: hidden;">
                    <img src="${receipt.dataURL}" alt="Receipt preview" style="width: 100%; max-height: 200px; object-fit: contain; background: #f8fafc;">
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div style="position: relative; min-height: 0;">
                <div style="font-size: 64px; color: #10b981; margin-bottom: 16px;">✅</div>
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Photo Saved!</h3>
                <p style="color: #6b7280; margin-bottom: 20px; font-size: 16px;">Your receipt has been saved to local storage.</p>
                ${imagePreview}
                <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #374151; font-size: 14px;">File:</span>
                        <span style="color: #1f2937; font-size: 14px;">${receipt.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #374151; font-size: 14px;">Size:</span>
                        <span style="color: #1f2937; font-size: 14px;">${this.formatFileSize(receipt.size || 0)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; color: #374151; font-size: 14px;">Status:</span>
                        <span style="color: #f59e0b; font-weight: bold; font-size: 14px;">Pending</span>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
                    <button id="process-now-btn" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; font-size: 16px;">🔍 Process Now</button>
                    <button id="close-success-modal" style="background: #f1f5f9; color: #374151; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; font-size: 16px;">Done</button>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button id="take-another-btn" style="background: none; color: #3b82f6; border: 2px solid #3b82f6; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 8px;">📸 Take Another Photo</button>
                    <button id="delete-captured-btn" style="background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">🗑️ Delete this receipt</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('process-now-btn')?.addEventListener('click', () => {
            modal.remove();
            setTimeout(() => {
                this.processSingleReceipt(receipt.id);
            }, 100);
        });
        
        document.getElementById('close-success-modal')?.addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('take-another-btn')?.addEventListener('click', () => {
            modal.remove();
            const status = document.getElementById('camera-status');
            if (status) status.textContent = 'Ready';
        });
        
        document.getElementById('delete-captured-btn')?.addEventListener('click', () => {
            if (confirm(`Delete "${receipt.name}"? This action cannot be undone.`)) {
                modal.remove();
                this.deleteReceiptFromAllSources(receipt.id);
            }
        });
        
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        modal.remove();
                    }
                }, 300);
            }
        }, 10000);
        
        const closeOnClickOutside = (e) => {
            if (!modal.contains(e.target)) {
                modal.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeOnClickOutside);
        }, 100);
    },

    // ==================== DELETE FUNCTIONALITY ====================
    setupReceiptActionListeners() {
        console.log('🔧 Setting up receipt action listeners...');
        
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-receipt-btn');
            if (deleteBtn) {
                const receiptId = deleteBtn.dataset.receiptId;
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.confirmAndDeleteReceipt(receiptId);
                }
                return;
            }
            
            const processBtn = e.target.closest('.process-receipt-btn');
            if (processBtn) {
                const receiptId = processBtn.dataset.receiptId;
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.processSingleReceipt(receiptId);
                }
                return;
            }
            
            const viewBtn = e.target.closest('.view-receipt-btn');
            if (viewBtn) {
                const receiptId = viewBtn.dataset.receiptId;
                const imageUrl = viewBtn.dataset.receiptUrl;
                const receiptName = viewBtn.dataset.receiptName;
                
                e.preventDefault();
                e.stopPropagation();
                
                if (imageUrl) {
                    this.showReceiptViewer(imageUrl, receiptName);
                } else {
                    this.showNotification('Receipt preview not available', 'warning');
                }
                return;
            }
        });
    },

    showReceiptViewer(imageUrl, receiptName) {
        console.log('🖼️ Showing receipt viewer for:', receiptName);
        
        const existingViewer = document.getElementById('receipt-viewer-modal');
        if (existingViewer) existingViewer.remove();
        
        const modal = document.createElement('div');
        modal.id = 'receipt-viewer-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        
        modal.innerHTML = `
            <div style="background: white; max-width: 90%; max-height: 90%; border-radius: 12px; overflow: hidden; position: relative; cursor: default; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">👁️</span>
                        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${this.escapeHtml(receiptName)}</h3>
                    </div>
                    <button id="close-viewer-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
                </div>
                <div style="padding: 20px; max-height: 70vh; overflow: auto; display: flex; align-items: center; justify-content: center; background: #f5f5f5; min-height: 200px;">
                    <img src="${imageUrl}" alt="${this.escapeHtml(receiptName)}" style="max-width: 100%; max-height: 60vh; object-fit: contain; border-radius: 8px;" onerror="this.parentElement.innerHTML='<div style=\'text-align:center;color:#666;padding:40px;\'>⚠️ Image failed to load</div>'">
                </div>
                <div style="padding: 16px 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; background: white;">
                    <button id="download-receipt-btn" style="padding: 8px 20px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">📥 Download</button>
                    <button id="close-viewer-footer-btn" style="padding: 8px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.getElementById('close-viewer-btn')?.addEventListener('click', () => modal.remove());
        document.getElementById('close-viewer-footer-btn')?.addEventListener('click', () => modal.remove());
        
        document.getElementById('download-receipt-btn')?.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = receiptName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.showNotification('Downloading receipt...', 'success');
        });
    },

    confirmAndDeleteReceipt(receiptId) {
        console.log(`🗑️ Confirming deletion for receipt: ${receiptId}`);
        
        if (this.isDeleting) {
            this.showNotification('Please wait for previous delete to complete', 'warning');
            return;
        }
        
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) {
            this.showNotification('Receipt not found', 'error');
            return;
        }
        
        const deleteBtn = document.querySelector(`.delete-receipt-btn[data-receipt-id="${receiptId}"]`);
        const originalContent = deleteBtn ? deleteBtn.innerHTML : '';
        const receiptName = receipt.name;
        
        if (window.confirm(`Are you sure you want to delete "${receiptName}"?\n\nThis action cannot be undone.`)) {
            if (deleteBtn) {
                deleteBtn.innerHTML = '<span class="btn-icon">⏳</span> Deleting...';
                deleteBtn.disabled = true;
                deleteBtn.classList.add('deleting');
            }
            
            this.deleteReceiptFromAllSources(receiptId);
        } else {
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalContent;
                deleteBtn.classList.remove('deleting');
            }
        }
    },

    deleteReceiptFromAllSources: async function(receiptId) {
        if (this.isDeleting) {
            this.showNotification('Please wait for previous delete to complete', 'warning');
            return;
        }
        
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) {
            this.showNotification('Receipt not found', 'error');
            return;
        }
        
        this.isDeleting = true;
        
        try {
            if (receipt.storageType === 'firebase' && receipt.fileName && window.storage) {
                try {
                    const storageRef = window.storage.ref();
                    await storageRef.child(receipt.fileName).delete();
                } catch (error) {
                    console.warn('⚠️ Could not delete from Firebase Storage:', error.message);
                }
            }
            
            if (this.isFirebaseAvailable && window.db) {
                try {
                    await window.db.collection('receipts').doc(receiptId).delete();
                } catch (error) {
                    console.warn('⚠️ Could not delete from Firestore:', error.message);
                }
            }
            
            this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
            
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            const updatedReceipts = localReceipts.filter(r => r.id !== receiptId);
            localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
            
            this.updateReceiptQueueUI();
            this.updateModalReceiptsList();
            this.updateProcessReceiptsButton();
            
            this.showNotification(`"${receipt.name}" deleted successfully`, 'success');
            
        } catch (error) {
            console.error('❌ Error deleting receipt:', error);
            this.showNotification('Failed to delete receipt', 'error');
        } finally {
            setTimeout(() => {
                this.isDeleting = false;
            }, 1000);
        }
    },

    // ==================== EVENT HANDLERS ====================
    setupImportReceiptsHandlers() {
        console.log('Setting up import receipt handlers');
        
        const setupModalButton = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handler.call(this, e);
                };
                return newButton;
            }
            return null;
        };
        
        setupModalButton('upload-option', () => this.showUploadInterface());
        setupModalButton('camera-option', () => this.showCameraInterface());
        setupModalButton('cancel-camera', () => {
            this.stopCamera();
            this.showQuickActionsView();
        });
        setupModalButton('back-to-main-view', () => {
            this.stopCamera();
            this.showQuickActionsView();
        });
        setupModalButton('capture-photo', () => this.capturePhoto());
        setupModalButton('switch-camera', () => this.switchCamera());
        
        setupModalButton('refresh-receipts', () => {
            const recentList = document.getElementById('recent-receipts-list');
            if (recentList) {
                recentList.innerHTML = this.renderRecentReceiptsList();
            }
            this.showNotification('Receipts list refreshed', 'success');
        });
        
        const processBtn = document.getElementById('process-receipts-btn');
        if (processBtn) {
            processBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
                if (pendingReceipts.length === 0) {
                    this.showNotification('No pending receipts to process', 'info');
                    return;
                }
                
                if (confirm(`Process ${pendingReceipts.length} pending receipts?`)) {
                    pendingReceipts.forEach((receipt, index) => {
                        setTimeout(() => {
                            this.processSingleReceipt(receipt.id);
                        }, index * 500);
                    });
                }
            };
        }
        
        this.setupFileInput();
        setTimeout(() => {
            this.setupDragAndDrop();
        }, 500);
    },

    setupFileInput() {
        console.log('📁 Setting up file input...');
        
        let fileInput = document.getElementById('receipt-file-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'receipt-file-input';
            fileInput.accept = 'image/*,.pdf,.jpg,.jpeg,.png,.heic,.heif';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        
        if (this._fileInputHandler) {
            fileInput.removeEventListener('change', this._fileInputHandler);
        }
        
        this._fileInputHandler = (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
                e.target.value = '';
            }
        };
        
        fileInput.addEventListener('change', this._fileInputHandler);
    },

    setupDragAndDrop() {
        console.log('🔧 Setting up drag and drop...');
        
        const dropArea = document.getElementById('receipt-dropzone');
        if (!dropArea) {
            console.log('ℹ️ No receipt-dropzone found');
            return;
        }
        
        dropArea.removeEventListener('click', this._dropAreaClickHandler);
        dropArea.removeEventListener('dragover', this._dropAreaDragOverHandler);
        dropArea.removeEventListener('dragleave', this._dropAreaDragLeaveHandler);
        dropArea.removeEventListener('drop', this._dropAreaDropHandler);
        
        this._dropAreaClickHandler = () => {
            const fileInput = document.getElementById('receipt-file-input');
            if (fileInput) fileInput.click();
        };
        
        this._dropAreaDragOverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
        };
        
        this._dropAreaDragLeaveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
        };
        
        this._dropAreaDropHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files);
            }
        };
        
        dropArea.addEventListener('click', this._dropAreaClickHandler);
        dropArea.addEventListener('dragover', this._dropAreaDragOverHandler);
        dropArea.addEventListener('dragleave', this._dropAreaDragLeaveHandler);
        dropArea.addEventListener('drop', this._dropAreaDropHandler);
    },

    handleFileUpload(files) {
        console.log('🎯 ========== handleFileUpload START ==========');
        console.log('📁 Number of files:', files.length);
        
        if (!files || files.length === 0) return;
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection && cameraSection.style.display !== 'none') {
            cameraSection.style.display = 'none';
            this.stopCamera();
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            const base64Data = this.fileToBase64(file);
            
            if (file.type.startsWith('image/')) {
                setTimeout(async () => {
                    if (confirm(`Crop "${file.name}"?`)) {
                        try {
                            await this.loadCropperLibrary();
                            this.showStandardCropper(file);
                        } catch (error) {
                            console.error('Failed to load cropper:', error);
                            this.saveReceiptFromFile(file, await base64Data);
                        }
                    } else {
                        this.saveReceiptFromFile(file, await base64Data);
                    }
                }, i * 500);
            } else {
                base64Data.then(data => {
                    this.saveReceiptFromFile(file, data);
                });
            }
        }
    },

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    showStandardCropper(file) {
        console.log('🔧 Opening cropper for:', file.name);
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) cameraSection.remove();
        
        const video = document.getElementById('camera-preview');
        if (video) {
            video.srcObject = null;
            video.remove();
        }
        
        const importModal = document.getElementById('import-receipts-modal');
        if (importModal) {
            importModal.style.display = 'none';
            importModal.classList.add('hidden');
        }
        
        this.stopCamera();
        this.currentImageFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const modalId = 'crop-modal-' + Date.now();
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: black;
                z-index: 9999999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            modal.innerHTML = `
                <div style="background: white; width: 95%; max-width: 600px; height: 90vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;">
                    <div style="background: #22c55e; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin:0;">✂️ Crop Receipt</h3>
                        <button id="close-${modalId}" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="flex: 1; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <img id="crop-image-${modalId}" src="${imageUrl}" style="max-width: 100%; max-height: 100%; display: block;">
                    </div>
                    <div style="padding: 16px; background: white; border-top: 1px solid #ddd;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px;">
                            <button id="zoom-in-${modalId}" style="padding: 14px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;">🔍+ Zoom In</button>
                            <button id="zoom-out-${modalId}" style="padding: 14px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;">🔍- Zoom Out</button>
                            <button id="rotate-${modalId}" style="padding: 14px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;">↻ Rotate</button>
                            <button id="reset-${modalId}" style="padding: 14px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;">🔄 Reset</button>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button id="cancel-${modalId}" style="flex: 1; padding: 16px; background: #f44336; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancel</button>
                            <button id="save-${modalId}" style="flex: 1; padding: 16px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Apply Crop</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const img = document.getElementById(`crop-image-${modalId}`);
            
            img.onload = () => {
                setTimeout(() => {
                    if (this.cropperInstance) this.cropperInstance.destroy();
                    
                    this.cropperInstance = new Cropper(img, {
                        aspectRatio: NaN,
                        viewMode: 1,
                        dragMode: 'crop',
                        autoCropArea: 0.8,
                        guides: true,
                        center: true,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        background: false
                    });
                }, 100);
            };
            
            document.getElementById(`zoom-in-${modalId}`).onclick = () => {
                if (this.cropperInstance) this.cropperInstance.zoom(0.1);
            };
            
            document.getElementById(`zoom-out-${modalId}`).onclick = () => {
                if (this.cropperInstance) this.cropperInstance.zoom(-0.1);
            };
            
            document.getElementById(`rotate-${modalId}`).onclick = () => {
                if (this.cropperInstance) this.cropperInstance.rotate(90);
            };
            
            document.getElementById(`reset-${modalId}`).onclick = () => {
                if (this.cropperInstance) this.cropperInstance.reset();
            };
            
            document.getElementById(`cancel-${modalId}`).onclick = () => {
                if (this.cropperInstance) {
                    this.cropperInstance.destroy();
                    this.cropperInstance = null;
                }
                modal.remove();
                this.showSimpleImageViewer(file);
            };
            
            document.getElementById(`close-${modalId}`).onclick = () => {
                if (this.cropperInstance) {
                    this.cropperInstance.destroy();
                    this.cropperInstance = null;
                }
                modal.remove();
                this.showSimpleImageViewer(file);
            };
            
            document.getElementById(`save-${modalId}`).onclick = () => {
                if (!this.cropperInstance) return;
                
                const croppedCanvas = this.cropperInstance.getCroppedCanvas({
                    maxWidth: 1200,
                    maxHeight: 1200
                });
                
                croppedCanvas.toBlob((blob) => {
                    const croppedFile = new File([blob], this.currentImageFile.name, { type: 'image/jpeg' });
                    this.showSimpleImageViewer(croppedFile);
                    this.cropperInstance.destroy();
                    this.cropperInstance = null;
                    modal.remove();
                    this.showNotification('✅ Image cropped! Review and save.', 'success');
                }, 'image/jpeg', 0.95);
            };
        };
        reader.readAsDataURL(file);
    },

    loadCropperLibrary() {
        return new Promise((resolve, reject) => {
            if (this.cropperLibraryLoaded) {
                resolve();
                return;
            }
            
            if (window.Cropper) {
                this.cropperLibraryLoaded = true;
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
            script.onload = () => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
                link.onload = () => {
                    this.cropperLibraryLoaded = true;
                    resolve();
                };
                link.onerror = () => {
                    this.injectCropperStyles();
                    this.cropperLibraryLoaded = true;
                    resolve();
                };
                document.head.appendChild(link);
            };
            script.onerror = () => {
                reject(new Error('Failed to load Cropper library'));
            };
            document.head.appendChild(script);
        });
    },

    injectCropperStyles() {
        const styleId = 'cropper-inline-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cropper-container { direction: ltr; font-size: 0; line-height: 0; position: relative !important; width: 100% !important; height: 100% !important; touch-action: none; user-select: none; }
            .cropper-wrap-box { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
            .cropper-canvas { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: #e0e0e0; }
            .cropper-drag-box { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0.2); }
            .cropper-crop-box { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
            .cropper-modal { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0.5); }
            .cropper-view-box { position: absolute; top: 0; right: 0; bottom: 0; left: 0; outline: 2px solid #22c55e; outline-color: rgba(34,197,94,0.75); }
            .cropper-face { position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.1); }
            .cropper-line { position: absolute; background: #22c55e; }
            .cropper-point { position: absolute; width: 10px; height: 10px; background: #22c55e; border: 2px solid white; border-radius: 50%; }
        `;
        document.head.appendChild(style);
    },

    // ==================== UI RENDER METHODS ====================
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
            <div style="display: flex; flex-direction: column; gap: 12px;" id="pending-receipts-grid">
                ${receipts.map(receipt => {
                    const imageUrl = this.getReceiptImageUrl(receipt);
                    return `
                        <div class="pending-receipt-item" data-receipt-id="${receipt.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div class="receipt-info" style="display: flex; align-items: center; gap: 12px;">
                                <span class="receipt-icon" style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                                <div class="receipt-details">
                                    <div class="receipt-name" style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${this.escapeHtml(receipt.name)}</div>
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
                                ${imageUrl ? `
                                    <button class="btn btn-sm btn-outline view-receipt-btn" data-receipt-id="${receipt.id}" data-receipt-url="${this.escapeHtml(imageUrl)}" data-receipt-name="${this.escapeHtml(receipt.name)}" style="padding: 6px 12px;" title="View receipt">
                                        <span class="btn-icon">👁️</span>
                                        <span class="btn-text">View</span>
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-outline view-receipt-btn-disabled" disabled style="padding: 6px 12px; opacity: 0.5;" title="Preview not available">
                                        <span class="btn-icon">👁️</span>
                                        <span class="btn-text">View</span>
                                    </button>
                                `}
                                <button class="btn btn-sm btn-primary process-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;">
                                    <span class="btn-icon">🔍</span>
                                    <span class="btn-text">Process</span>
                                </button>
                                <button class="btn btn-sm btn-danger delete-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;" title="Delete receipt">
                                    <span class="btn-icon">🗑️</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
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
        
        const recentReceipts = this.receiptQueue.slice(0, 5).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        return `
            <div class="receipts-grid" id="recent-receipts-grid">
                ${recentReceipts.map(receipt => {
                    return `
                        <div class="receipt-card" data-receipt-id="${receipt.id}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px;">
                            <div class="receipt-preview">
                                ${receipt.type?.startsWith('image/') && receipt.downloadURL?.startsWith('http') ? 
                                    `<img src="${receipt.downloadURL}" alt="${receipt.name}" loading="lazy" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : 
                                    `<div class="file-icon" style="font-size: 24px;">📄</div>`
                                }
                            </div>
                            <div class="receipt-info" style="flex: 1;">
                                <div class="receipt-name" style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${receipt.name}</div>
                                <div class="receipt-meta" style="font-size: 12px; color: var(--text-secondary);">
                                    <span class="receipt-size">${this.formatFileSize(receipt.size || 0)}</span>
                                    <span>•</span>
                                    <span class="receipt-status status-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-sm btn-outline process-btn" data-receipt-id="${receipt.id}" style="white-space: nowrap; padding: 6px 12px;">🔍 Process</button>
                                <button class="btn btn-sm btn-danger delete-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;" title="Delete receipt">🗑️ Delete</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No transactions found</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Add your first transaction to get started</div>
                </div>
            `;
        }
        
        return `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${transactions.map(transaction => {
                    const isIncome = transaction.type === 'income';
                    const icon = isIncome ? '💰' : '💸';
                    const displayDate = this.formatDateForDisplay(transaction.date);
                    
                    return `
                        <div class="transaction-item" data-id="${transaction.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer;" onclick="IncomeExpensesModule.editTransaction(${transaction.id})">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 24px;">${icon}</span>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${transaction.description || 'No description'}</div>
                                    <div style="display: flex; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                                        <span>${displayDate}</span>
                                        <span>•</span>
                                        <span>${transaction.category || 'Uncategorized'}</span>
                                        <span>•</span>
                                        <span>${transaction.paymentMethod || 'Cash'}</span>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; font-size: 16px; color: ${isIncome ? '#10b981' : '#ef4444'};">${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}</div>
                                ${transaction.reference ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Ref: ${transaction.reference}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderCategoryBreakdown() {
        const incomeByCategory = {};
        const expensesByCategory = {};
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });
        
        const totalIncome = this.calculateStats().totalIncome;
        const totalExpenses = this.calculateStats().totalExpenses;
        
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div>
                    <h4 style="color: var(--text-primary); margin-bottom: 16px; font-size: 16px;">💰 Income</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${Object.entries(incomeByCategory).length > 0 ? 
                            Object.entries(incomeByCategory).sort(([,a], [,b]) => b - a).map(([category, amount]) => {
                                const percentage = totalIncome > 0 ? (amount / totalIncome * 100).toFixed(1) : 0;
                                return `
                                    <div style="margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="font-size: 14px; color: var(--text-primary);">${category}</span>
                                            <span style="font-weight: 600; font-size: 14px; color: #10b981;">${this.formatCurrency(amount)}</span>
                                        </div>
                                        <div style="height: 6px; background: #d1fae5; border-radius: 3px; overflow: hidden;">
                                            <div style="height: 100%; width: ${percentage}%; background: #10b981; border-radius: 3px;"></div>
                                        </div>
                                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${percentage}%</div>
                                    </div>
                                `;
                            }).join('')
                            : `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No income recorded yet</div>`
                        }
                    </div>
                </div>
                <div>
                    <h4 style="color: var(--text-primary); margin-bottom: 16px; font-size: 16px;">💸 Expenses</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${Object.entries(expensesByCategory).length > 0 ? 
                            Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a).map(([category, amount]) => {
                                const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
                                return `
                                    <div style="margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="font-size: 14px; color: var(--text-primary);">${category}</span>
                                            <span style="font-weight: 600; font-size: 14px; color: #ef4444;">${this.formatCurrency(amount)}</span>
                                        </div>
                                        <div style="height: 6px; background: #fee2e2; border-radius: 3px; overflow: hidden;">
                                            <div style="height: 100%; width: ${percentage}%; background: #ef4444; border-radius: 3px;"></div>
                                        </div>
                                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${percentage}%</div>
                                    </div>
                                `;
                            }).join('')
                            : `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No expenses recorded yet</div>`
                        }
                    </div>
                </div>
            </div>
        `;
    },

    renderImportReceiptsModal() {
        return `
            <div class="import-receipts-container">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #10b981, #34d399, #10b981); border-radius: 20px 20px 0 0; z-index: 1000 !important;"></div>
                <div class="quick-actions-section" style="padding-top: 8px;">
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
                <div id="upload-section" style="display: none;">
                    <div class="upload-system-container" id="upload-system">
                        <div style="display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                            <button class="btn btn-outline" id="back-to-main-view" style="display: flex; align-items: center; gap: 8px; margin-right: 16px; padding: 8px 16px;"><span>←</span><span>Back</span></button>
                            <div><h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">📤 Upload Files</h3><p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Drag & drop or select files from your device</p></div>
                        </div>
                        <div class="upload-section active" data-mode="receipts">
                            <div class="upload-header" style="margin-bottom: 24px;"><h3 class="upload-title">📄 Upload Receipts</h3><p class="upload-subtitle">Take photos or scan receipts to track expenses</p></div>
                            <div class="upload-dropzone" id="receipt-dropzone">
                                <div class="dropzone-content">
                                    <div class="dropzone-icon">📁</div>
                                    <h4 class="dropzone-title">Drop receipt files here</h4>
                                    <p class="dropzone-subtitle">or click to browse</p>
                                    <div class="file-types"><span class="file-type-badge">JPG</span><span class="file-type-badge">PNG</span><span class="file-type-badge">PDF</span><span class="file-type-badge">HEIC</span></div>
                                </div>
                                <input type="file" id="receipt-file-input" accept="image/*,.pdf,.heic,.heif" multiple class="dropzone-input" style="display: none;">
                            </div>
                            <div class="uploaded-files-container" style="margin-top: 24px;">
                                <h5 class="files-title">📎 Uploaded Receipts <span class="badge" id="receipt-count">0</span></h5>
                                <div class="files-list" id="receipt-files-list"><div class="empty-state">📭<p>No receipts uploaded yet</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="camera-section" id="camera-section" style="display: none;">
                    <div class="glass-card">
                        <div class="card-header header-flex"><h3>📷 Camera</h3><div class="camera-status" id="camera-status">Ready</div></div>
                        <div class="camera-preview"><video id="camera-preview" autoplay playsinline></video><canvas id="camera-canvas" style="display: none;"></canvas></div>
                        <div class="camera-controls">
                            <button class="btn btn-outline" id="switch-camera"><span class="btn-icon">🔄</span><span class="btn-text">Switch Camera</span></button>
                            <button class="btn btn-primary" id="capture-photo"><span class="btn-icon">📸</span><span class="btn-text">Capture</span></button>
                            <button class="btn btn-outline" id="cancel-camera"><span class="btn-icon">✖️</span><span class="btn-text">Back to Upload</span></button>
                        </div>
                    </div>
                </div>
                <div class="recent-section" id="recent-section" style="display: block;">
                    <div class="glass-card">
                        <div class="card-header header-flex"><h3>📋 Recent Receipts</h3><button class="btn btn-outline" id="refresh-receipts"><span class="btn-icon">🔄</span><span class="btn-text">Refresh</span></button></div>
                        <div id="recent-receipts-list" class="receipts-list">${this.renderRecentReceiptsList()}</div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==================== UI UPDATE METHODS ====================
    updateStats() {
        const stats = this.calculateStats();
        
        const totalIncome = document.getElementById('total-income');
        if (totalIncome) totalIncome.textContent = this.formatCurrency(stats.totalIncome);
        
        const totalExpenses = document.getElementById('total-expenses');
        if (totalExpenses) totalExpenses.textContent = this.formatCurrency(stats.totalExpenses);
        
        const netIncome = document.getElementById('net-income');
        if (netIncome) netIncome.textContent = this.formatCurrency(stats.netIncome);
    },

    updateTransactionsList() {
        const filterValue = document.getElementById('transaction-filter')?.value || 'all';
        const filteredTransactions = this.filterTransactionsByType(filterValue);
        const recentTransactions = filteredTransactions.slice(0, 10);
        
        const transactionsList = document.getElementById('transactions-list');
        if (transactionsList) {
            transactionsList.innerHTML = this.renderTransactionsList(recentTransactions);
        }
    },

    updateCategoryBreakdown() {
        const categoryBreakdown = document.getElementById('category-breakdown');
        if (categoryBreakdown) {
            categoryBreakdown.innerHTML = this.renderCategoryBreakdown();
        }
    },

    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const net = income - expenses;
        
        return { totalIncome: income, totalExpenses: expenses, netIncome: net, transactionCount: this.transactions.length };
    },

    getRecentTransactions(limit = 10) {
        return this.transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    },

    filterTransactionsByType(filterType) {
        if (filterType === 'all') return this.transactions;
        if (filterType === 'income') return this.transactions.filter(t => t.type === 'income');
        if (filterType === 'expense') return this.transactions.filter(t => t.type === 'expense');
        return this.transactions;
    },

    // ==================== UTILITY METHODS ====================
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    formatFirebaseTimestamp(timestamp) {
        if (!timestamp) return 'Unknown date';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024;
        if (!file || !validTypes.includes(file.type)) return false;
        if (file.size > maxSize) return false;
        return true;
    },

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
                color: white;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    },

    // ==================== EXPORT METHODS ====================
    exportTransactions() {
        console.log('Exporting transactions...');
        
        const data = { transactions: this.transactions, stats: this.calculateStats(), exportDate: new Date().toISOString(), receiptCount: this.receiptQueue.length };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-transactions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Transactions exported successfully', 'success');
    },

    generateFinancialReport() {
        console.log('Generating financial report...');
        
        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(20);
        
        const report = `
            Farm Financial Report
            Generated: ${new Date().toLocaleDateString()}
            
            ======================
            SUMMARY
            ======================
            Total Income: ${this.formatCurrency(stats.totalIncome)}
            Total Expenses: ${this.formatCurrency(stats.totalExpenses)}
            Net Income: ${this.formatCurrency(stats.netIncome)}
            Total Transactions: ${stats.transactionCount}
            
            ======================
            RECENT TRANSACTIONS (Last 20)
            ======================
            ${recentTransactions.map(t => `${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${this.formatCurrency(t.amount)} | ${t.description}`).join('\n')}
            
            ======================
            CATEGORY BREAKDOWN
            ======================
            ${this.renderTextCategoryBreakdown()}
        `;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Financial report generated', 'success');
    },

    renderTextCategoryBreakdown() {
        const incomeByCategory = {};
        const expensesByCategory = {};
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });
        
        let breakdown = 'INCOME:\n';
        Object.entries(incomeByCategory).forEach(([category, amount]) => { breakdown += `  ${category}: ${this.formatCurrency(amount)}\n`; });
        breakdown += '\nEXPENSES:\n';
        Object.entries(expensesByCategory).forEach(([category, amount]) => { breakdown += `  ${category}: ${this.formatCurrency(amount)}\n`; });
        return breakdown;
    },

    generateCategoryAnalysis() {
        const modalContent = `
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header"><h3 class="popout-modal-title">📊 Category Analysis</h3><button class="popout-modal-close" id="close-category-analysis">&times;</button></div>
                <div class="popout-modal-body">${this.renderCategoryBreakdown()}</div>
                <div class="popout-modal-footer"><button class="btn-outline" id="export-category-analysis">Export as CSV</button><button class="btn-primary" id="close-category-btn">Close</button></div>
            </div>
        `;
        
        this.showModal('Category Analysis', modalContent);
        
        setTimeout(() => {
            document.getElementById('close-category-btn')?.addEventListener('click', () => this.hideAllModals());
            document.getElementById('close-category-analysis')?.addEventListener('click', () => this.hideAllModals());
            document.getElementById('export-category-analysis')?.addEventListener('click', () => this.exportCategoryAnalysis());
        }, 100);
    },

    exportCategoryAnalysis() {
        const incomeByCategory = {};
        const expensesByCategory = {};
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
            } else {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });
        
        let csv = 'Category,Type,Amount\n';
        Object.entries(incomeByCategory).forEach(([category, amount]) => { csv += `"${category}",income,${amount}\n`; });
        Object.entries(expensesByCategory).forEach(([category, amount]) => { csv += `"${category}",expense,${amount}\n`; });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `category-analysis-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Category analysis exported as CSV', 'success');
    },

    showModal(title, content) {
        this.hideAllModals();
        const modal = document.createElement('div');
        modal.className = 'popout-modal';
        modal.id = 'custom-modal';
        modal.innerHTML = content;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.remove('hidden'), 10);
    },

    // ==================== RECEIPT FORM HANDLERS ====================
    setupReceiptFormHandlers() {
        const uploadArea = document.getElementById('receipt-upload-area');
        const fileInput = document.getElementById('receipt-upload');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleTransactionReceiptUpload(e.target.files[0]);
                }
            });
        }
        
        const removeBtn = document.getElementById('remove-receipt');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.receiptPreview = null;
                this.clearReceiptPreview();
                const fileInput = document.getElementById('receipt-upload');
                if (fileInput) fileInput.value = '';
            });
        }
    },

    handleTransactionReceiptUpload(file) {
        if (!this.isValidReceiptFile(file)) {
            this.showNotification('Invalid file. Please use JPG, PNG, or PDF under 10MB', 'error');
            return;
        }
        this.createReceiptPreview(file);
    },

    createReceiptPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.receiptPreview = {
                id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                downloadURL: e.target.result,
                size: file.size,
                type: file.type,
                status: 'pending',
                uploadedAt: new Date(),
                uploadedBy: 'local-user'
            };
            this.showReceiptPreviewInTransactionModal(this.receiptPreview);
            this.showNotification(`Receipt "${file.name}" attached`, 'success');
        };
        reader.onerror = () => { this.showNotification('Failed to read file', 'error'); };
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
        const fileInput = document.getElementById('receipt-upload');
        if (fileInput) fileInput.value = '';
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('Setting up event listeners (event delegation)...');
        
        if (this._globalClickHandler) {
            document.removeEventListener('click', this._globalClickHandler);
            document.removeEventListener('change', this._globalChangeHandler);
        }
        
        this._globalClickHandler = (e) => {
            const transactionItem = e.target.closest('.transaction-item');
            if (transactionItem) {
                const transactionId = transactionItem.dataset.id;
                if (transactionId) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📝 Transaction item clicked for editing:', transactionId);
                    this.editTransaction(transactionId);
                    return;
                }
            }
            
            const button = e.target.closest('button');
            if (!button) return;
            const buttonId = button.id;
            if (!buttonId) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            switch(buttonId) {
                case 'add-transaction': this.showTransactionModal(); break;
                case 'upload-receipt-btn': this.showImportReceiptsModal(); break;
                case 'add-income-btn': this.showAddIncome(); break;
                case 'add-expense-btn': this.showAddExpense(); break;
                case 'financial-report-btn': this.generateFinancialReport(); break;
                case 'category-analysis-btn': this.generateCategoryAnalysis(); break;
                case 'save-transaction': this.saveTransaction(); break;
                case 'delete-transaction': this.deleteTransaction(); break;
                case 'cancel-transaction': this.hideTransactionModal(); break;
                case 'close-transaction-modal': this.hideTransactionModal(); break;
                case 'close-import-receipts': this.hideImportReceiptsModal(); break;
                case 'cancel-import-receipts': this.hideImportReceiptsModal(); break;
                case 'refresh-receipts-btn': this.loadReceiptsFromFirebase(); this.showNotification('Receipts refreshed', 'success'); break;
                case 'process-all-receipts': this.processPendingReceipts(); break;
                case 'export-transactions': this.exportTransactions(); break;
            }
        };
        
        this._globalChangeHandler = (e) => {
            if (e.target.id === 'transaction-filter') {
                this.filterTransactions(e.target.value);
            }
        };
        
        document.addEventListener('click', this._globalClickHandler);
        document.addEventListener('change', this._globalChangeHandler);
        
        console.log('✅ Event delegation setup complete with transaction item editing');
    },

    filterTransactions(filterType) {
        console.log('Filtering transactions by:', filterType);
        this.updateTransactionsList();
    },

    // ==================== UNLOAD METHOD ====================
    unload() {
        console.log('📦 Unloading Income & Expenses module...');
        
        this.stopCamera();
        
        if (this._globalClickHandler) {
            document.removeEventListener('click', this._globalClickHandler);
            this._globalClickHandler = null;
        }
        if (this._globalChangeHandler) {
            document.removeEventListener('change', this._globalChangeHandler);
            this._globalChangeHandler = null;
        }
        
        this.hideAllModals();
        
        const fileInput = document.getElementById('receipt-upload-input');
        if (fileInput && fileInput.hasAttribute('data-dynamic')) {
            fileInput.remove();
        }
        
        if (this.realtimeUnsubscribe) {
            this.realtimeUnsubscribe();
            this.realtimeUnsubscribe = null;
        }
        
        this.initialized = false;
        this.element = null;
        this.currentEditingId = null;
        this.receiptQueue = [];
        this.cameraStream = null;
        this.receiptPreview = null;
        
        console.log('✅ Income & Expenses module unloaded');
    }
};

// =============== Register with FarmModules framework ===================
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered with UnifiedDataService');
}

window.IncomeExpensesModule = IncomeExpensesModule;

(function() {
    console.log(`📦 Registering income-expenses module...`);
    if (window.FarmModules) {
        window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
        console.log(`✅ income-expenses module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
