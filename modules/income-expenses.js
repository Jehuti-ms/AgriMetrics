// modules/income-expenses.js - COMPLETE WITH UNIFIED DATA SERVICE INTEGRATION
console.log('💰 Loading Income & Expenses module...');

const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {},
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
    isOnline: true,
    isDeleting: false,
    isCapturing: false,
    captureTimeout: null,
    dataService: null,

    cameraFacingMode: 'environment',
    lastSwitchClick: 0,
      
    // Add this debug method
    debugCameraCapture: function() {
        console.log('🔍 DEBUG: Camera Capture Diagnostics');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        console.log('Video element:', video);
        console.log('Canvas element:', canvas);
        console.log('Camera stream exists:', !!this.cameraStream);
        
        if (video) {
            console.log('Video readyState:', video.readyState);
            console.log('Video paused:', video.paused);
            console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
            console.log('Video srcObject:', video.srcObject);
        }
        
        if (this.cameraStream) {
            const tracks = this.cameraStream.getTracks();
            console.log('Camera tracks:', tracks.length);
            tracks.forEach((track, i) => {
                console.log(`Track ${i}:`, {
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState,
                    settings: track.getSettings ? track.getSettings() : 'N/A'
                });
            });
        }
        
        if (navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    const videoDevices = devices.filter(d => d.kind === 'videoinput');
                    console.log('📹 Available cameras:', videoDevices.length);
                    videoDevices.forEach((d, i) => {
                        console.log(`Camera ${i}:`, d.label || 'Unnamed camera');
                    });
                })
                .catch(err => console.error('Error enumerating devices:', err));
        }
        
        return {
            videoFound: !!video,
            canvasFound: !!canvas,
            streamActive: !!this.cameraStream,
            ready: video ? video.readyState >= 2 : false
        };
    },
    
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

        // Setup network detection (using unified service's status)
        this.setupNetworkDetection();
        
        // Load data from unified service
        await this.loadData();

        // Setup real-time sync via unified service
        if (this.isFirebaseAvailable) {
            this.setupRealtimeSync();
        }
        
        // Load receipts (using unified service or localStorage)
        await this.loadReceiptsFromUnifiedService();
        
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

    // ✅ FIXED: Moved inside the module
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

    setupSalesListeners() {
        console.log('📡 Setting up sales listeners...');
        
        const possibleEventSystems = [
            { obj: window.DataBroadcaster, name: 'DataBroadcaster' },
            { obj: window.broadcaster, name: 'broadcaster' },
            { obj: window.Broadcaster, name: 'Broadcaster' },
            { obj: window.EventBus, name: 'EventBus' },
            { obj: window.PubSub, name: 'PubSub' }
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
        
        if (this.dataService) {
            this.dataService.save('transactions', transactionData);
        } else if (this.isFirebaseAvailable && window.db) {
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
        });
    },

    // ==================== DATA MANAGEMENT ====================
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
            // Fallback to legacy load
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
    
    loadFromLocalStorage() {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
        console.log('📁 Loaded receipts from localStorage:', this.receiptQueue.length);
        this.updateReceiptQueueUI();
    },

    saveReceiptsToLocalStorage() {
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        console.log('💾 Saved receipts to localStorage:', this.receiptQueue.length);
    },

    getReceiptURL(receipt) {
        if (!receipt) return '';
        
        if (receipt.dataURL) return receipt.dataURL;
        
        if (receipt.base64Data && receipt.type) {
            return `data:${receipt.type};base64,${receipt.base64Data}`;
        }
        
        return receipt.downloadURL || '';
    },

    // ==================== CAMERA METHODS ====================
    initializeCamera: function() {
        console.log('📷 Initializing camera...');
        
        this.stopCamera();
        
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('Video element not found');
            this.showNotification('Camera error', 'error');
            return;
        }
        
        video.pause();
        video.srcObject = null;
        video.load();
        video.removeAttribute('src');
        video.removeAttribute('srcObject');
        
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        
        if (status) status.textContent = 'Requesting camera...';
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ Camera API not supported');
            if (status) status.textContent = 'Camera not supported';
            this.showNotification('Camera not supported in this browser', 'error');
            return;
        }
        
        setTimeout(() => {
            const basicConstraints = {
                video: true,
                audio: false
            };
            
            console.log('📱 Requesting camera with basic constraints');
            
            navigator.mediaDevices.getUserMedia(basicConstraints)
                .then(stream => {
                    console.log('✅ Camera access granted with basic constraints');
                    this.cameraStream = stream;
                    video.srcObject = stream;
                    return video.play();
                })
                .then(() => {
                    console.log('📹 Video playing successfully');
                    if (status) status.textContent = 'Camera Ready';
                    
                    const switchBtn = document.getElementById('switch-camera');
                    if (switchBtn) {
                        const nextMode = this.cameraFacingMode === 'user' ? 'Rear' : 'Front';
                        switchBtn.innerHTML = `<span class="btn-icon">🔄</span> <span class="btn-text">Switch to ${nextMode}</span>`;
                    }
                })
                .catch(error => {
                    console.error('❌ Camera error:', error);
                    
                    let errorMessage = 'Camera access failed. ';
                    if (error.name === 'NotAllowedError') {
                        errorMessage = 'Camera permission denied. Please check browser settings and refresh.';
                    } else if (error.name === 'NotFoundError') {
                        errorMessage = 'No camera found on this device.';
                    } else if (error.name === 'NotReadableError') {
                        errorMessage = 'Camera is busy. Please close other apps using the camera and refresh the page.';
                    } else if (error.name === 'OverconstrainedError') {
                        errorMessage = 'Camera constraints too strict. Trying fallback...';
                        this.initializeCameraFallback();
                        return;
                    }
                    
                    if (status) status.textContent = 'Camera unavailable';
                    this.showNotification(errorMessage, 'error');
                    
                    setTimeout(() => {
                        if (confirm('Camera not available. Would you like to upload a file instead?')) {
                            this.showUploadInterface();
                        } else {
                            this.showQuickActionsView();
                        }
                    }, 2000);
                });
        }, 300);
    },

    initializeCameraFallback: function() {
        console.log('📷 Trying fallback camera initialization...');
        
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) return;
        
        if (status) status.textContent = 'Trying fallback...';
        
        const fallbackConstraints = {
            video: {
                width: { min: 320, ideal: 640 },
                height: { min: 240, ideal: 480 }
            },
            audio: false
        };
        
        navigator.mediaDevices.getUserMedia(fallbackConstraints)
            .then(stream => {
                console.log('✅ Fallback camera succeeded!');
                this.cameraStream = stream;
                video.srcObject = stream;
                return video.play();
            })
            .then(() => {
                console.log('📹 Fallback camera playing');
                if (status) status.textContent = 'Camera Ready (Fallback mode)';
                this.showNotification('Camera working in fallback mode', 'info');
            })
            .catch(fallbackError => {
                console.error('❌ Fallback also failed:', fallbackError);
                if (status) status.textContent = 'Camera unavailable';
                this.showNotification('Camera not available. Please upload a file instead.', 'error');
                
                setTimeout(() => {
                    this.showUploadInterface();
                }, 2000);
            });
    },

    stopCamera: function() {
        console.log('🛑 Stopping camera aggressively...');
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                try {
                    track.stop();
                    track.enabled = false;
                    console.log(`✅ Stopped track: ${track.kind}`);
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
                console.log(`✅ Cleared video: ${video.id || 'unnamed'}`);
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
        
        console.log('✅ Camera fully stopped and cleaned up');
    },

    resetAndShowCamera: function() {
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

    initializeCameraWithRetry: function(retryCount = 0) {
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

    attachCameraButtonHandlers: function() {
        console.log('🔧 Attaching camera button handlers...');
        
        const captureBtn = document.getElementById('capture-photo-btn');
        if (captureBtn) {
            const newCaptureBtn = captureBtn.cloneNode(true);
            captureBtn.parentNode.replaceChild(newCaptureBtn, captureBtn);
            
            newCaptureBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📸 Capture button clicked');
                this.capturePhoto();
            };
            console.log('✅ Capture button handler attached');
        } else {
            console.warn('⚠️ Capture button not found');
        }
        
        const switchBtn = document.getElementById('switch-camera-btn');
        if (switchBtn) {
            const newSwitchBtn = switchBtn.cloneNode(true);
            switchBtn.parentNode.replaceChild(newSwitchBtn, switchBtn);
            
            newSwitchBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Switch camera button clicked');
                this.switchCameraAndReinit();
            };
            console.log('✅ Switch camera button handler attached');
        }
        
        const cancelBtn = document.getElementById('cancel-camera-btn');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✖️ Cancel camera button clicked');
                this.stopCamera();
                this.showQuickActionsView();
            };
            console.log('✅ Cancel button handler attached');
        }
    },

    switchCameraAndReinit: function() {
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
    
    capturePhoto: function() {
        console.log('📸 Capture photo');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        const captureBtn = document.getElementById('capture-photo');
        
        if (!video || !video.srcObject) {
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        this.isCapturing = true;
        if (captureBtn) {
            captureBtn.disabled = true;
            captureBtn.style.opacity = '0.5';
        }
        
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
            
            if (captureBtn) {
                captureBtn.disabled = false;
                captureBtn.style.opacity = '1';
            }
            this.isCapturing = false;
            
        }, 'image/jpeg', 0.9);
    },

    dataURLtoFile: function(dataurl, filename) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    },

    showSimpleImageViewer: function(file) {
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
            
            const editBtn = document.getElementById('edit-image-btn');
            const saveBtn = document.getElementById('save-image-btn');
            const retakeBtn = document.getElementById('retake-image-btn');
            const deleteBtn = document.getElementById('delete-image-btn');
            
            if (editBtn) {
                editBtn.onclick = () => {
                    console.log('✎ Edit button clicked - opening cropper');
                    modal.remove();
                    this.showStandardCropper(file);
                };
            }
            
            if (saveBtn) {
                saveBtn.onclick = () => {
                    console.log('💾 Save button clicked');
                    modal.remove();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64Data = e.target.result;
                        this.saveReceiptFromFile(file, base64Data);
                    };
                    reader.readAsDataURL(file);
                };
            }
            
            if (retakeBtn) {
                retakeBtn.onclick = () => {
                    console.log('↺ Retake button clicked - going back to camera');
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
                };
            }
            
            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    console.log('🗑️ Delete button clicked');
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
                };
            }
        };
        reader.readAsDataURL(file);
    },
    
    // ==================== FILE UPLOAD ====================
    handleFileUpload: async function(files) {
        console.log('🎯 ========== handleFileUpload START ==========');
        console.log('📁 Number of files:', files.length);
        
        if (!files || files.length === 0) {
            console.log('❌ No files');
            return;
        }
        
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection && cameraSection.style.display !== 'none') {
            cameraSection.style.display = 'none';
            this.stopCamera();
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`📄 Processing file ${i+1}:`, file.name);
            
            const base64Data = await this.fileToBase64(file);
            console.log(`✅ Converted to base64, length: ${base64Data.length}`);
            
            if (file.type.startsWith('image/')) {
                setTimeout(async () => {
                    if (confirm(`Crop "${file.name}"?`)) {
                        try {
                            await this.loadCropperLibrary();
                            this.showStandardCropper(file);
                        } catch (error) {
                            console.error('Failed to load cropper:', error);
                            this.saveReceiptFromFile(file, base64Data);
                        }
                    } else {
                        this.saveReceiptFromFile(file, base64Data);
                    }
                }, i * 500);
            } else {
                this.saveReceiptFromFile(file, base64Data);
            }
        }
    },

    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // ==================== CROPPER ====================
    cropperInstance: null,
    currentImageFile: null,
    cropperLibraryLoaded: false,

    showStandardCropper: function(file) {
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
    
    loadCropperLibrary: function() {
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

    injectCropperStyles: function() {
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
        console.log('✅ Injected inline cropper styles');
    },

    saveReceiptFromFile: function(file, dataURL) {
        console.log('💾 Saving receipt:', file.name);
        this.saveReceiptWithBase64(file, dataURL);
    },

    saveReceiptWithBase64: function(file, base64Data) {
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

    saveReceiptToStorage: function(receipt) {
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
        
        if (this.isFirebaseAvailable) {
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
        }
        
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.showCaptureSuccess(receipt);
    },

    saveReceiptToFirebase: async function(receipt) {
        console.log('📤 Attempting to save receipt to Firebase:', receipt.id);
        
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

    showCaptureSuccess: function(receipt) {
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

    showUploadInterface: function() {
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
            console.log('✅ Drag and drop re-initialized for upload section');
        }, 100);
    },

    showCameraInterface: function() {
        console.log('📷 Showing camera interface...');
        this.resetAndShowCamera();
    },

    showQuickActionsView: function() {
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
        
        console.log('✅ Quick actions view shown');
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
                    console.log('🗑️ Delete button clicked:', receiptId);
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
                    console.log('🔍 Process button clicked:', receiptId);
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
                    console.log('👁️ View button clicked for:', receiptName);
                    this.showReceiptViewer(imageUrl, receiptName);
                } else {
                    console.warn('No image URL for receipt:', receiptId);
                    this.showNotification('Receipt preview not available', 'warning');
                }
                return;
            }
        });
    },

    getReceiptImageUrl(receipt) {
        if (!receipt) return null;
        
        if (receipt.dataURL && receipt.dataURL.startsWith('data:')) {
            console.log('✅ Found dataURL (base64)');
            return receipt.dataURL;
        }
        
        if (receipt.downloadURL && receipt.downloadURL.startsWith('data:')) {
            console.log('✅ Found downloadURL (base64)');
            return receipt.downloadURL;
        }
        
        if (receipt.base64Data && receipt.type) {
            console.log('✅ Reconstructing from base64Data');
            return `data:${receipt.type};base64,${receipt.base64Data}`;
        }
        
        console.log('❌ No valid image data found');
        return null;
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        
        const closeBtn = document.getElementById('close-viewer-btn');
        const closeFooterBtn = document.getElementById('close-viewer-footer-btn');
        
        if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
        if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => modal.remove());
        
        const downloadBtn = document.getElementById('download-receipt-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = receiptName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                this.showNotification('Downloading receipt...', 'success');
            });
        }
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
            console.log('Delete cancelled by user');
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
                    console.log('✅ Deleted from Firebase Storage:', receipt.fileName);
                } catch (error) {
                    console.warn('⚠️ Could not delete from Firebase Storage:', error.message);
                }
            }
            
            if (this.isFirebaseAvailable && window.db) {
                try {
                    await window.db.collection('receipts').doc(receiptId).delete();
                    console.log('✅ Deleted from Firestore:', receiptId);
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
            
            console.log('✅ Receipt deleted');
            
        } catch (error) {
            console.error('❌ Error deleting receipt:', error);
            this.showNotification('Failed to delete receipt', 'error');
        } finally {
            setTimeout(() => {
                this.isDeleting = false;
            }, 1000);
        }
    },
  
    // ==================== MODAL MANAGEMENT ====================
    showImportReceiptsModal: function() {
        console.log('=== SHOW IMPORT RECEIPTS MODAL ===');
        
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            modal.style.zIndex = '10000';
            console.log('✅ Modal shown with display: flex');
        } else {
            console.error('❌ Modal element not found');
            return;
        }
        
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (importReceiptsContent) {
            importReceiptsContent.innerHTML = this.renderImportReceiptsModal();
        }
        
        setTimeout(() => {
            console.log('🔄 Setting up handlers...');
            this.setupImportReceiptsHandlers();
            this.setupFileInput();
            this.showQuickActionsView();
            this.ensureCameraSectionExists();
            console.log('✅ Modal fully initialized');
        }, 100);
    },

    ensureCameraSectionExists: function() {
        const cameraSection = document.getElementById('camera-section');
        if (!cameraSection) {
            console.log('🔧 Camera section missing, recreating...');
            this.recreateCameraSection();
        }
    },

    hideImportReceiptsModal() {
        console.log('❌ Closing import receipts modal');
        
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
            console.log('✅ Modal hidden');
        }
        
        const fileInput = document.getElementById('receipt-upload-input');
        if (fileInput) {
            fileInput.value = '';
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

    // ==================== EVENT HANDLERS ====================
    setupImportReceiptsHandlers() {
        console.log('Setting up import receipt handlers');
        
        const setupModalButton = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                console.log(`✅ Setting up modal button: ${id}`);
                
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Modal button clicked: ${id}`);
                    handler.call(this, e);
                };
                
                return newButton;
            } else {
                console.log(`ℹ️ Modal button ${id} not found`);
                return null;
            }
        };
        
        setupModalButton('upload-option', () => {
            console.log('📁 Upload Files button clicked');
            this.showUploadInterface();
        });

        setupModalButton('camera-option', () => {
            console.log('🎯 Camera button clicked');
            this.showCameraInterface();
        });

        setupModalButton('cancel-camera', () => {
            console.log('❌ Cancel camera clicked');
            this.stopCamera();
            this.showQuickActionsView();
        });

        setupModalButton('back-to-main-view', () => {
            console.log('🔙 Back to main view clicked');
            this.stopCamera();
            this.showQuickActionsView();
        });

        setupModalButton('capture-photo', () => this.capturePhoto());
        setupModalButton('switch-camera', () => this.switchCamera());

        setupModalButton('refresh-receipts', () => {
            console.log('🔄 Refresh receipts clicked');
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

    setupDragAndDrop: function() {
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
            console.log('📁 Drop area clicked');
            const fileInput = document.getElementById('receipt-file-input');
            if (fileInput) {
                fileInput.click();
            }
        };
        
        this._dropAreaDragOverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
            console.log('📁 Drag over drop area');
        };
        
        this._dropAreaDragLeaveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            console.log('📁 Drag left drop area');
        };
        
        this._dropAreaDropHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            
            console.log('📁 Files dropped on receipt-dropzone');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                console.log(`📤 Processing ${e.dataTransfer.files.length} dropped file(s)`);
                this.handleFileUpload(e.dataTransfer.files);
            }
        };
        
        dropArea.addEventListener('click', this._dropAreaClickHandler);
        dropArea.addEventListener('dragover', this._dropAreaDragOverHandler);
        dropArea.addEventListener('dragleave', this._dropAreaDragLeaveHandler);
        dropArea.addEventListener('drop', this._dropAreaDropHandler);
        
        console.log('✅ Drag and drop setup complete');
    },

    setupFileInput: function() {
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
            console.log('✅ Created new file input');
        }
        
        if (this._fileInputHandler) {
            fileInput.removeEventListener('change', this._fileInputHandler);
        }
        
        this._fileInputHandler = (e) => {
            console.log('📁 File input changed!');
            if (e.target.files && e.target.files.length > 0) {
                console.log(`Processing ${e.target.files.length} file(s)`);
                this.handleFileUpload(e.target.files);
                e.target.value = '';
            }
        };
        
        fileInput.addEventListener('change', this._fileInputHandler);
        console.log('✅ File input setup complete');
    },

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
            
            console.log(`Button clicked: ${buttonId}`);
            
            switch(buttonId) {
                case 'add-transaction':
                    this.showTransactionModal();
                    break;
                case 'upload-receipt-btn':
                    this.showImportReceiptsModal();
                    break;
                case 'add-income-btn':
                    this.showAddIncome();
                    break;
                case 'add-expense-btn':
                    this.showAddExpense();
                    break;
                case 'financial-report-btn':
                    this.generateFinancialReport();
                    break;
                case 'category-analysis-btn':
                    this.generateCategoryAnalysis();
                    break;
                case 'save-transaction':
                    this.saveTransaction();
                    break;
                case 'delete-transaction':
                    this.deleteTransaction();
                    break;
                case 'cancel-transaction':
                    this.hideTransactionModal();
                    break;
                case 'close-transaction-modal':
                    this.hideTransactionModal();
                    break;
                case 'close-import-receipts':
                    this.hideImportReceiptsModal();
                    break;
                case 'cancel-import-receipts':
                    this.hideImportReceiptsModal();
                    break;
                case 'refresh-receipts-btn':
                    this.loadReceiptsFromFirebase();
                    this.showNotification('Receipts refreshed', 'success');
                    break;
                case 'process-all-receipts':
                    this.processPendingReceipts();
                    break;
                case 'export-transactions':
                    this.exportTransactions();
                    break;
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

    // ============== Date Helper ===================
    formatDateForInput(dateString) {
        if (!dateString) return new Date().toISOString().split('T')[0];
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
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

    // ==================== RECEIPT PROCESSING ====================
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

    // ==================== UI RENDERING ====================
    // ==================== UI RENDERING - FULL ORIGINAL VERSION ====================
renderModule() {
    if (!this.element) return;

    const stats = this.calculateStats();
    const recentTransactions = this.getRecentTransactions(10);
    const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

    this.element.innerHTML = `
        <style>
            /* Keep all your original styles here - they should already be in your file */
            /* The styles from your original income-expenses.js should remain unchanged */
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
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title">📥 Import Receipts</h3>
                    <button class="popout-modal-close" id="close-import-receipts">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="import-receipts-content">
                        <!-- Content loaded dynamically -->
                    </div>
                </div>
                <div class="popout-modal-footer" style="display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--glass-border);">
                    <button class="btn btn-outline" id="cancel-import-receipts">Cancel</button>
                    <button class="btn btn-primary hidden" id="process-receipts-btn">
                        <span class="btn-icon">⚡</span>
                        <span class="btn-text">Process Receipts</span>
                        <span id="process-receipts-count">0</span>
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
                                <input type="date" id="transaction-date" class="form-input" value="${this.getLocalDate()}" required>
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
                                    
                                    <!-- Income Categories -->
                                    <optgroup label="💰 Income">
                                        <option value="broilers-income">Broilers</option>
                                        <option value="layers-income">Layers</option>
                                        <option value="ducks-income">Ducks</option>
                                        <option value="sheep-income">Sheep</option>
                                        <option value="goats-income">Goats</option>
                                        <option value="rabbits-income">Rabbits</option>
                                        <option value="crops">Crops/Produce</option>
                                        <option value="eggs">Eggs</option>
                                        <option value="milk">Milk/Dairy</option>
                                        <option value="wool">Wool/Fiber</option>
                                        <option value="breeding">Breeding Stock</option>
                                        <option value="services">Services</option>
                                        <option value="grants">Grants/Subsidies</option>
                                        <option value="other-income">Other Income</option>
                                    </optgroup>
                                    
                                    <!-- Expense Categories -->
                                    <optgroup label="💸 Expenses">
                                        <!-- Animal-specific feed -->
                                        <option value="feed-broilers">Feed - Broilers</option>
                                        <option value="feed-layers">Feed - Layers</option>
                                        <option value="feed-ducks">Feed - Ducks</option>
                                        <option value="feed-sheep">Feed - Sheep</option>
                                        <option value="feed-goats">Feed - Goats</option>
                                        <option value="feed-rabbits">Feed - Rabbits</option>
                                        
                                        <!-- Medical/Vet by animal -->
                                        <option value="medical-broilers">Medical - Broilers</option>
                                        <option value="medical-layers">Medical - Layers</option>
                                        <option value="medical-ducks">Medical - Ducks</option>
                                        <option value="medical-sheep">Medical - Sheep</option>
                                        <option value="medical-goats">Medical - Goats</option>
                                        <option value="medical-rabbits">Medical - Rabbits</option>
                                        
                                        <!-- General farm expenses -->
                                        <option value="bedding">Bedding/Litter</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="labor">Labor</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="transport">Transport</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="fencing">Fencing</option>
                                        <option value="buildings">Buildings/Shelter</option>
                                        <option value="water">Water Systems</option>
                                        <option value="electricity">Electricity</option>
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
                <div class="popout-modal-footer" style="display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--glass-border);">
                    <button type="button" class="btn-outline" id="cancel-transaction" style="flex: 1; min-width: 0; padding: 12px; font-size: 16px; font-weight: 600;">Cancel</button>
                    <button type="button" class="btn-danger" id="delete-transaction" style="flex: 1; min-width: 0; padding: 12px; font-size: 16px; font-weight: 600; display: none;">Delete</button>
                    <button type="button" class="btn-primary" id="save-transaction" style="flex: 1; min-width: 0; padding: 12px; font-size: 16px; font-weight: 600;">Save Transaction</button>
                </div>
            </div>
        </div>
    `;

    this.setupEventListeners();
    this.setupReceiptFormHandlers();
    
    setTimeout(() => {
        this.setupReceiptActionListeners();
    }, 100);
},

renderImportReceiptsModal() {
    // Keep your original renderImportReceiptsModal method
    return `
        <div class="import-receipts-container">
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
            <div id="upload-section" style="display: none;">
                <div class="upload-system-container">
                    <div class="upload-dropzone" id="receipt-dropzone">
                        <div class="dropzone-icon">📁</div>
                        <h4 class="dropzone-title">Drop receipt files here</h4>
                        <p class="dropzone-subtitle">or click to browse</p>
                        <input type="file" id="receipt-file-input" accept="image/*,.pdf" multiple style="display: none;">
                    </div>
                </div>
            </div>
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
            <div class="recent-section" id="recent-section">
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
                                <button class="btn btn-sm btn-outline view-receipt-btn" 
                                        data-receipt-id="${receipt.id}"
                                        data-receipt-url="${this.escapeHtml(imageUrl)}"
                                        data-receipt-name="${this.escapeHtml(receipt.name)}"
                                        style="padding: 6px 12px;" 
                                        title="View receipt">
                                    <span class="btn-icon">👁️</span>
                                    <span class="btn-text">View</span>
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-outline view-receipt-btn-disabled" 
                                        disabled
                                        style="padding: 6px 12px; opacity: 0.5;" 
                                        title="Preview not available">
                                    <span class="btn-icon">👁️</span>
                                    <span class="btn-text">View</span>
                                </button>
                            `}
                            <button class="btn btn-sm btn-primary process-receipt-btn" 
                                    data-receipt-id="${receipt.id}" 
                                    style="padding: 6px 12px;">
                                <span class="btn-icon">🔍</span>
                                <span class="btn-text">Process</span>
                            </button>
                            <button class="btn btn-sm btn-danger delete-receipt-btn" 
                                    data-receipt-id="${receipt.id}" 
                                    style="padding: 6px 12px;" 
                                    title="Delete receipt">
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
                                `<img src="${receipt.downloadURL}" alt="${receipt.name}" 
                                      loading="lazy" 
                                      style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : 
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
                            <button class="btn btn-sm btn-outline process-btn" 
                                    data-receipt-id="${receipt.id}"
                                    style="white-space: nowrap; padding: 6px 12px;">
                                🔍 Process
                            </button>
                            <button class="btn btn-sm btn-danger delete-receipt-btn" 
                                    data-receipt-id="${receipt.id}"
                                    style="padding: 6px 12px;" 
                                    title="Delete receipt">
                                🗑️ Delete
                            </button>
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
                    <div class="transaction-item" data-id="${transaction.id}" 
                         style="display: flex; justify-content: space-between; align-items: center; 
                                padding: 16px; background: var(--glass-bg); border-radius: 8px; 
                                border: 1px solid var(--glass-border); cursor: pointer;"
                         onclick="IncomeExpensesModule.editTransaction(${transaction.id})">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${icon}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
                                    ${transaction.description || 'No description'}
                                </div>
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
                            <div style="font-weight: bold; font-size: 16px; color: ${isIncome ? '#10b981' : '#ef4444'};">
                                ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                            </div>
                            ${transaction.reference ? `
                                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                    Ref: ${transaction.reference}
                                </div>
                            ` : ''}
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
                        Object.entries(incomeByCategory)
                            .sort(([,a], [,b]) => b - a)
                            .map(([category, amount]) => {
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
                                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                                            ${percentage}%
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        : `
                            <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                                No income recorded yet
                            </div>
                        `
                    }
                </div>
            </div>
            
            <div>
                <h4 style="color: var(--text-primary); margin-bottom: 16px; font-size: 16px;">💸 Expenses</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${Object.entries(expensesByCategory).length > 0 ? 
                        Object.entries(expensesByCategory)
                            .sort(([,a], [,b]) => b - a)
                            .map(([category, amount]) => {
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
                                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                                            ${percentage}%
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        : `
                            <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                                No expenses recorded yet
                            </div>
                        `
                    }
                </div>
            </div>
        </div>
    `;
},
    // ==================== UI UPDATES ====================
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
                pendingSection.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;"><div style="font-size: 48px; margin-bottom: 16px;">📄</div><div style="font-size: 16px; margin-bottom: 8px;">No pending receipts</div><div style="font-size: 14px; color: var(--text-secondary);">Upload receipts to get started</div></div>`;
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

    // ==================== UTILITY METHODS ====================
    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
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

    filterTransactions(filterType) {
        console.log('Filtering transactions by:', filterType);
        this.updateTransactionsList();
    },

    filterTransactionsByType(filterType) {
        if (filterType === 'all') return this.transactions;
        if (filterType === 'income') return this.transactions.filter(t => t.type === 'income');
        if (filterType === 'expense') return this.transactions.filter(t => t.type === 'expense');
        return this.transactions;
    },

    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024;
        
        if (!file || !validTypes.includes(file.type)) {
            console.warn('Invalid file type:', file?.type);
            return false;
        }
        
        if (file.size > maxSize) {
            console.warn('File too large:', file.size);
            return false;
        }
        
        return true;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    },

    // ==================== DATE HANDLING ====================
    getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateForStorage(dateInput) {
        if (!dateInput) return this.getLocalDate();
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            return dateInput;
        }
        
        const date = new Date(dateInput);
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

    compareDates(dateA, dateB) {
        const dA = new Date(dateA);
        const dB = new Date(dateB);
        return dB - dA;
    },

    // ==================== EXPORT & REPORT ====================
    exportTransactions() {
        console.log('Exporting transactions...');
        
        const data = {
            transactions: this.transactions,
            stats: this.calculateStats(),
            exportDate: new Date().toISOString(),
            receiptCount: this.receiptQueue.length
        };
        
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
            const closeBtn = document.getElementById('close-category-btn');
            const closeModalBtn = document.getElementById('close-category-analysis');
            const exportBtn = document.getElementById('export-category-analysis');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.hideAllModals());
            if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.hideAllModals());
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportCategoryAnalysis());
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

    // ==================== BROADCAST METHODS ====================
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
    console.log('✅ Income & Expenses module registered');
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
