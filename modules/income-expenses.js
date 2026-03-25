// modules/income-expenses.js - COMPLETE FIXED VERSION
console.log('💰 Loading Income & Expenses module...');

const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {},
};

// Add these properties (replace your existing ones)
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
    isCapturing: false,  // Add this
    captureTimeout: null, // Add this

    // Add this near the top of your module properties
cameraFacingMode: 'environment', // 'environment' for back camera, 'user' for front
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
    
    // Check if we can access camera
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
async initialize() {  // ← ADD async
    console.log('💰 Initializing Income & Expenses...');
    
    this.element = document.getElementById('content-area');
    if (!this.element) {
        console.error('Content area element not found');
        return false;
    }

    // Check if Firebase services are available
    this.isFirebaseAvailable = !!(window.firebase && window.db);
    console.log('Firebase available:', this.isFirebaseAvailable, {
        firebase: !!window.firebase,
        db: !!window.db
    });

    if (window.StyleManager) {
        StyleManager.registerModule(this.name, this.element, this);
    }

    // Setup network detection
    this.setupNetworkDetection();
    
    // Load transactions - WAIT for this to complete
    await this.loadData();  // ← ADD await

    // Setup real-time sync
    if (this.isFirebaseAvailable) {
        this.setupRealtimeSync();
    }
    
    // Load receipts from Firebase - WAIT for this too
    await this.loadReceiptsFromFirebase();  // ← ADD await

    // Setup global click handler for receipts
    this.setupReceiptActionListeners();
    
    // Process any pending syncs (don't need to await this)
    if (this.isFirebaseAvailable) {
        setTimeout(() => {
            this.syncLocalTransactionsToFirebase();
        }, 3000);
    }

    // Make sure receiptQueue is initialized
    this.receiptQueue = this.receiptQueue || [];
    
    // Listen for sales from Orders module
    this.setupSalesListeners();  
            
    this.renderModule();  // ← Now this happens AFTER data is loaded
    this.initialized = true;
    
    // Connect to Data Broadcaster
    this.connectToDataBroadcaster();
    
    console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions');
    return true;
},
    
    // ✅ FIXED: Moved inside the module
    connectToDataBroadcaster() {
        console.log('🔌 Income module attempting to connect to Data Broadcaster...');
        
        // Try multiple times (in case broadcaster loads later)
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryConnect = () => {
            attempts++;
            
            if (window.DataBroadcaster && window.DataBroadcaster.on) {
                console.log('✅ Income module connected to Data Broadcaster!');
                
                // Listen for sales updates
                window.DataBroadcaster.on('sales:updated', (data) => {
                    console.log('📨 Income module received sales update:', data);
                    this.handleSalesUpdate(data.sales || data);
                });
                
                // Also listen for general finance updates
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

    // ✅ FIXED: Moved inside the module
    setupFallbackListeners() {
        window.addEventListener('sales-updated', (event) => {
            console.log('📨 Received sales update via fallback:', event.detail);
            this.handleSalesUpdate(event.detail.sales || event.detail);
        });
    },

    // ✅ FIXED: Moved inside the module
    handleSalesUpdate(salesData) {
        console.log(`💰 Processing ${salesData?.length || 0} sales for income`);
        
        // Convert sales to income transactions
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
            
            // Add to income data
            if (!window.incomeData) window.incomeData = [];
            
            // Merge without duplicates
            const existingIds = new Set(window.incomeData.map(t => t.id));
            const newTransactions = incomeTransactions.filter(t => !existingIds.has(t.id));
            
            window.incomeData = [...window.incomeData, ...newTransactions];
            
            // Update UI if income module is active
            if (window.app?.currentSection === 'income-expenses') {
                this.refreshIncomeDisplay();
            }
            
            // Show notification
            if (typeof this.showNotification === 'function') {
                this.showNotification(`💰 Added ${newTransactions.length} sales to income`, 'success');
            }
        }
    },

    refreshIncomeDisplay() {
        // Refresh the transactions list
        this.updateTransactionsList();
        this.updateStats();
        this.updateCategoryBreakdown();
    },

    setupSalesListeners() {
        console.log('📡 Setting up sales listeners...');
        
        // Try different possible event systems
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
        
        // Listen via custom events
        window.addEventListener('sale-completed', (event) => {
            console.log('💰 Sale completed custom event received:', event.detail);
            this.addIncomeFromSale(event.detail);
        });
        
        // Also listen for other possible event names
        window.addEventListener('order-completed', (event) => {
            console.log('💰 Order completed event received:', event.detail);
            this.addIncomeFromSale(event.detail);
        });
        
        console.log('✅ Fallback sales listeners setup complete');
    },

   addIncomeFromSale(saleData) {
    console.log('➕ Adding income from sale:', saleData);
    
    // Skip if this sale came from this device and was auto-created
    if (saleData.sourceDeviceId === this.getDeviceId() && saleData.source === 'income-module') {
        console.log('⚠️ Skipping - this sale was auto-created from this device');
        return;
    }
    
    // Check if this order was already added
    const existingTransaction = this.transactions.find(t => 
        t.reference === `ORDER-${saleData.orderId}` || 
        (t.source === 'orders-module' && t.orderId === saleData.orderId) ||
        t.id === saleData.transactionId
    );
    
    if (existingTransaction) {
        console.log('⚠️ Sale already added as income, skipping:', existingTransaction.id);
        return;
    }
    
    // Create transaction data
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
        sourceDeviceId: saleData.sourceDeviceId || 'external'  // ← ADD THIS
    };
    
    // Add to transactions array
    if (!this.transactions) this.transactions = [];
    this.transactions.unshift(transactionData);
    
    // Save to localStorage
    try {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        console.log('💾 Saved sale to localStorage:', transactionData.id);
    } catch (storageError) {
        console.warn('⚠️ Failed to save to localStorage:', storageError);
    }
    
    // Save to Firebase if available
    if (this.isFirebaseAvailable && window.db) {
        this.saveTransactionToFirebase(transactionData)
            .then(() => {
                console.log('✅ Sale saved to Firebase');
            })
            .catch(error => {
                console.warn('⚠️ Failed to save sale to Firebase:', error.message);
            });
    }
    
    // Update UI
    this.updateStats();
    this.updateTransactionsList();
    this.updateCategoryBreakdown();
    
    // Show notification
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
            
            if (this.isFirebaseAvailable) {
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
    console.log('Loading transactions...');
    
    try {
        // Your existing loadData code here...
        const saved = localStorage.getItem('farm-transactions');
        if (saved) {
            this.transactions = JSON.parse(saved);
            console.log('📁 Loaded from localStorage:', this.transactions.length);
        } else {
            this.transactions = [];
        }
        
        // ========== ADD THIS ==========
        // Load from Firebase and merge
        if (this.isFirebaseAvailable && window.db) {
            await this.loadFromFirebase();
        }
        // ==============================
        
        // Sort and save
        this.transactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA;
        });
        
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
    } catch (error) {
        console.error('❌ Error loading transactions:', error);
    }
},

 // ==================== SYNC METHODS (ADD THESE) ====================

// Get device ID
getDeviceId() {
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
},

// Load from Firebase (no duplication)
async loadFromFirebase() {
    try {
        const user = window.firebase.auth().currentUser;
        if (!user) return;
        
        console.log('☁️ Loading from Firebase...');
        
        const snapshot = await window.db.collection('users')
            .doc(user.uid)
            .collection('transactions')
            .orderBy('date', 'desc')
            .get();
        
        if (snapshot.empty) return;
        
        // Create map of existing transactions
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
        
        // Save merged data
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        
    } catch (error) {
        console.error('Error loading from Firebase:', error);
    }
},

// Save to Firebase (single path)
async saveToFirebase() {
    if (!this.isFirebaseAvailable || !window.db) return false;
    
    try {
        const user = window.firebase.auth().currentUser;
        if (!user) return false;
        
        console.log('💾 Saving to Firebase...');
        
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

// Setup real-time sync
setupRealtimeSync() {
    if (!this.isFirebaseAvailable || !window.db) return;
    
    const user = window.firebase.auth().currentUser;
    if (!user) return;
    
    if (this.realtimeUnsubscribe) {
        this.realtimeUnsubscribe();
    }
    
    console.log('📡 Setting up real-time sync...');
    
    this.realtimeUnsubscribe = window.db.collection('users')
        .doc(user.uid)
        .collection('transactions')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const remote = change.doc.data();
                    const myDeviceId = this.getDeviceId();
                    
                    // Skip if this change came from this device
                    if (remote.deviceId === myDeviceId) return;
                    
                    console.log(`🔄 Received from other device: ${remote.id}`);
                    
                    const existingIndex = this.transactions.findIndex(t => t.id === remote.id);
                    
                    if (existingIndex === -1) {
                        this.transactions.unshift(remote);
                    } else {
                        this.transactions[existingIndex] = remote;
                    }
                    
                    // Sort and save
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
        });
    
    console.log('✅ Real-time sync active');
},

    saveData() {
    console.log('💾 Saving transactions to localStorage');
    localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
    
    // ========== ADD THIS ==========
    // Also save to Firebase
    if (this.isFirebaseAvailable) {
        this.saveToFirebase();
    }
    // ==============================
},

    setupExpenseBroadcast() {
    if (window.DataBroadcaster) {
        window.DataBroadcaster.on('expense-created', (data) => {
            console.log('💰 Income received expense:', data);
            // This is already handled by normal transaction saving
        });
    }
},
    
async saveTransaction(transactionData) {
    console.log('Saving transaction...', transactionData);
    
    // Add to transactions array
    if (!this.transactions) this.transactions = [];
    
    const existingIndex = this.transactions.findIndex(t => t.id === transactionData.id);
    const isNewTransaction = existingIndex < 0;
    const oldTransaction = existingIndex >= 0 ? this.transactions[existingIndex] : null;
    
    // Generate ID if needed
    const transactionId = transactionData.id || Date.now();
    const myDeviceId = this.getDeviceId();
    
    const finalTransaction = {
        ...transactionData,
        id: transactionId,
        sourceDeviceId: myDeviceId,  // ← ADD THIS - marks where it came from
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
    
    // Sort
    this.transactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
    });
    
    // Save to localStorage
    this.saveData();
    
    // Save to Firebase (for sync)
    if (this.isFirebaseAvailable) {
        await this.saveToFirebase();
    }
    
    // Update UI
    this.updateStats();
    this.updateTransactionsList();
    this.updateCategoryBreakdown();
    
    // ==================== KEEP BROADCASTS WITH SOURCE CHECK ====================
    
    // 1. Broadcast general transaction update (with source info)
    this.broadcastTransactionUpdate(finalTransaction, isNewTransaction, oldTransaction);
    
    // 2. If this is an INCOME transaction, create sale (skip if from sales module)
    if (finalTransaction.type === 'income' && isNewTransaction && 
        (!finalTransaction.source || !finalTransaction.source.includes('sales'))) {
        await this.createSaleFromIncome(finalTransaction);
    }
    
    // 3. If this is an EXPENSE transaction, handle inventory updates
    if (finalTransaction.type === 'expense') {
        await this.handleExpenseIntegration(finalTransaction, isNewTransaction, oldTransaction);
    }
    
    // 4. If this is a FEED expense, handle feed-specific logic
    if (finalTransaction.type === 'expense' && this.isFeedRelated(finalTransaction)) {
        await this.handleFeedExpense(finalTransaction);
    }
    
    // 5. If this is a MEDICAL expense, handle medical inventory
    if (finalTransaction.type === 'expense' && this.isMedicalRelated(finalTransaction)) {
        await this.handleMedicalExpense(finalTransaction);
    }
    
    // 6. If this is an EQUIPMENT expense, handle equipment inventory
    if (finalTransaction.type === 'expense' && this.isEquipmentRelated(finalTransaction)) {
        await this.handleEquipmentExpense(finalTransaction);
    }
    
    // 7. Broadcast to dashboard
    this.broadcastToDashboard(finalTransaction);
    
    return true;
},

// ==================== INTEGRATION METHODS ====================

broadcastTransactionUpdate: function(transactionData, isNew, oldTransaction) {
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
        sourceDeviceId: transactionData.sourceDeviceId || this.getDeviceId()  // ← ADD THIS
    };
    
    // Broadcast via Data Broadcaster
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('transaction-updated', updateData);
    }
    
    // Also dispatch custom event
    const event = new CustomEvent('transaction-updated', { detail: updateData });
    window.dispatchEvent(event);
},

createSaleFromIncome: async function(transactionData) {
    console.log('💰 Creating sale from income transaction:', transactionData);
    
    // Check if this sale was already created from this transaction
    if (transactionData.saleCreated) {
        console.log('⚠️ Sale already created for this transaction, skipping');
        return;
    }
    
    // Determine product from description or category
    let product = 'other';
    const desc = transactionData.description?.toLowerCase() || '';
    const cat = transactionData.category?.toLowerCase() || '';
    
    // Product mapping
    if (desc.includes('egg') || cat.includes('egg')) product = 'eggs';
    else if (desc.includes('broiler') || cat.includes('broiler')) product = 'broilers-dressed';
    else if (desc.includes('layer') || cat.includes('layer')) product = 'layers';
    else if (desc.includes('milk') || cat.includes('milk')) product = 'milk';
    else if (desc.includes('pork') || cat.includes('pork')) product = 'pork';
    else if (desc.includes('beef') || cat.includes('beef')) product = 'beef';
    else if (desc.includes('goat') || cat.includes('goat')) product = 'goat';
    else if (desc.includes('lamb') || cat.includes('lamb')) product = 'lamb';
    else if (desc.includes('tomato') || cat.includes('tomato')) product = 'tomatoes';
    else if (desc.includes('lettuce') || cat.includes('lettuce')) product = 'lettuce';
    else if (desc.includes('carrot') || cat.includes('carrot')) product = 'carrots';
    else if (desc.includes('potato') || cat.includes('potato')) product = 'potatoes';
    else if (desc.includes('honey') || cat.includes('honey')) product = 'honey';
    
    const saleData = {
        id: 'INC-' + transactionData.id,
        date: transactionData.date,
        customer: this.extractCustomerFromDescription(transactionData.description) || 'Walk-in',
        product: product,
        unit: this.getUnitForProduct(product),
        quantity: 1,
        unitPrice: transactionData.amount,
        totalAmount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod || 'cash',
        paymentStatus: 'paid',
        notes: `Auto-generated from income: ${transactionData.description}`,
        source: 'income-module',
        transactionId: transactionData.id,
        sourceDeviceId: transactionData.sourceDeviceId || this.getDeviceId()  // ← ADD THIS
    };
    
    // Mark original transaction to prevent loop
    transactionData.saleCreated = true;
    
    // Broadcast to Sales module
    if (window.DataBroadcaster) {
        console.log('📢 Broadcasting income-sale-created');
        window.DataBroadcaster.emit('income-sale-created', saleData);
    }
    
    // Direct update if sales module exists
    if (window.SalesRecordModule && typeof window.SalesRecordModule.addSale === 'function') {
        console.log('💰 Directly updating SalesRecordModule');
        window.SalesRecordModule.addSale(saleData);
    }
    
    // Also dispatch custom event
    const event = new CustomEvent('income-sale-created', { detail: saleData });
    window.dispatchEvent(event);
    
    this.showNotification(`✅ Created sale record from income`, 'success');
},

handleExpenseIntegration: async function(transactionData, isNew, oldTransaction) {
    console.log('📦 Handling expense integration:', transactionData);
    
    // Prepare expense data for other modules
    const expenseData = {
        id: transactionData.id,
        date: transactionData.date,
        description: transactionData.description,
        category: transactionData.category,
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
        reference: transactionData.reference,
        notes: transactionData.notes,
        source: 'income-module',
        isNew: isNew,
        oldAmount: oldTransaction?.amount || 0
    };
    
    // Broadcast to all modules
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('expense-recorded', expenseData);
    }
    
    // Also dispatch custom event
    const event = new CustomEvent('expense-recorded', { detail: expenseData });
    window.dispatchEvent(event);
    
    // Update inventory module if available
    await this.updateInventoryFromExpense(transactionData);
},

updateInventoryFromExpense: async function(expenseData) {
    console.log('📦 Updating inventory from expense:', expenseData);
    
    // Only process if expense is for inventory items
    const inventoryCategories = ['feed', 'medical', 'equipment', 'packaging', 'cleaning'];
    if (!inventoryCategories.includes(expenseData.category)) {
        return;
    }
    
    // Determine item details
    let itemName = expenseData.description || 'Unknown item';
    let quantity = this.estimateQuantityFromExpense(expenseData);
    let unit = this.getUnitForCategory(expenseData.category);
    
    // Update InventoryCheckModule if available
    if (window.InventoryCheckModule && window.InventoryCheckModule.inventory) {
        console.log('📦 Updating InventoryCheckModule');
        
        // Find existing item or create new
        let inventoryItem = window.InventoryCheckModule.inventory.find(item => 
            item.category === expenseData.category && 
            (item.name?.toLowerCase().includes(itemName.toLowerCase()) || 
             item.name?.toLowerCase().includes(expenseData.category))
        );
        
        if (inventoryItem) {
            // Update existing
            const oldStock = inventoryItem.currentStock;
            inventoryItem.currentStock += quantity;
            inventoryItem.lastRestocked = expenseData.date;
            
            console.log(`✅ Updated ${inventoryItem.name}: ${oldStock} → ${inventoryItem.currentStock}`);
        } else {
            // Create new inventory item
            const newItem = {
                id: Date.now(),
                name: this.formatItemName(expenseData.description, expenseData.category),
                category: expenseData.category,
                currentStock: quantity,
                unit: unit,
                minStock: this.getMinStockForCategory(expenseData.category),
                costPerKg: expenseData.amount / quantity,
                supplier: this.extractSupplier(expenseData.notes),
                lastRestocked: expenseData.date,
                notes: `Purchased: ${expenseData.description}`
            };
            
            window.InventoryCheckModule.inventory.push(newItem);
            console.log('✅ Created new inventory item:', newItem);
        }
        
        // Save inventory module
        if (typeof window.InventoryCheckModule.saveData === 'function') {
            window.InventoryCheckModule.saveData();
        }
        
        // Broadcast inventory update
        if (window.DataBroadcaster) {
            window.DataBroadcaster.emit('inventory-updated', {
                module: 'income-expenses',
                category: expenseData.category,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Also update FarmData
    if (window.FarmData) {
        if (!window.FarmData.inventory) {
            window.FarmData.inventory = [];
        }
        
        const farmDataItem = window.FarmData.inventory.find(item => 
            item.category === expenseData.category && 
            item.name?.toLowerCase().includes(itemName.toLowerCase())
        );
        
        if (farmDataItem) {
            farmDataItem.quantity = (farmDataItem.quantity || 0) + quantity;
            farmDataItem.lastUpdated = expenseData.date;
        } else {
            window.FarmData.inventory.push({
                id: Date.now(),
                name: this.formatItemName(expenseData.description, expenseData.category),
                category: expenseData.category,
                quantity: quantity,
                unit: unit,
                cost: expenseData.amount,
                purchased: expenseData.date
            });
        }
        
        // Dispatch farm data updated event
        window.dispatchEvent(new CustomEvent('farm-data-updated', {
            detail: { module: 'income-expenses', action: 'inventory-updated' }
        }));
    }
},

handleFeedExpense: async function(expenseData) {
    console.log('🌾 Handling feed expense:', expenseData);
    
    const feedData = {
        id: expenseData.id,
        date: expenseData.date,
        description: expenseData.description,
        amount: expenseData.amount,
        feedType: this.extractFeedType(expenseData.description),
        quantity: this.estimateFeedQuantity(expenseData),
        source: 'income-module'
    };
    
    // Broadcast to Feed module
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('feed-purchased', feedData);
    }
    
    // Direct update if Feed module exists
    if (window.FeedRecordModule && window.FeedRecordModule.feedInventory) {
        console.log('🌾 Directly updating FeedRecordModule');
        
        const feedItem = window.FeedRecordModule.feedInventory.find(item => 
            item.feedType === feedData.feedType
        );
        
        if (feedItem) {
            feedItem.currentStock += feedData.quantity;
            feedItem.lastRestocked = expenseData.date;
            
            if (typeof window.FeedRecordModule.saveData === 'function') {
                window.FeedRecordModule.saveData();
            }
        }
    }
    
    const event = new CustomEvent('feed-purchased', { detail: feedData });
    window.dispatchEvent(event);
},

handleMedicalExpense: function(expenseData) {
    console.log('💊 Handling medical expense:', expenseData);
    
    const medicalData = {
        id: expenseData.id,
        date: expenseData.date,
        description: expenseData.description,
        amount: expenseData.amount,
        type: this.extractMedicalType(expenseData.description),
        quantity: this.estimateMedicalQuantity(expenseData),
        source: 'income-module'
    };
    
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('medical-purchased', medicalData);
    }
    
    const event = new CustomEvent('medical-purchased', { detail: medicalData });
    window.dispatchEvent(event);
},

handleEquipmentExpense: function(expenseData) {
    console.log('🔧 Handling equipment expense:', expenseData);
    
    const equipmentData = {
        id: expenseData.id,
        date: expenseData.date,
        description: expenseData.description,
        amount: expenseData.amount,
        type: 'equipment',
        quantity: 1,
        source: 'income-module'
    };
    
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('equipment-purchased', equipmentData);
    }
    
    const event = new CustomEvent('equipment-purchased', { detail: equipmentData });
    window.dispatchEvent(event);
},

broadcastToDashboard: function(transactionData) {
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

isFeedRelated: function(transactionData) {
    const desc = transactionData.description?.toLowerCase() || '';
    const cat = transactionData.category?.toLowerCase() || '';
    return cat.includes('feed') || desc.includes('feed') || 
           desc.includes('starter') || desc.includes('grower') || 
           desc.includes('finisher') || desc.includes('layer');
},

isMedicalRelated: function(transactionData) {
    const desc = transactionData.description?.toLowerCase() || '';
    const cat = transactionData.category?.toLowerCase() || '';
    return cat.includes('medical') || cat.includes('vet') || 
           desc.includes('vaccine') || desc.includes('medicine') ||
           desc.includes('treatment');
},

isEquipmentRelated: function(transactionData) {
    const desc = transactionData.description?.toLowerCase() || '';
    const cat = transactionData.category?.toLowerCase() || '';
    return cat.includes('equipment') || cat.includes('tool') ||
           desc.includes('trough') || desc.includes('feeder') ||
           desc.includes('waterer');
},

extractCustomerFromDescription: function(description) {
    if (!description) return null;
    
    const patterns = [
        /from\s+([A-Za-z\s]+)/i,
        /customer:\s*([A-Za-z\s]+)/i,
        /sale to\s+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
},

getUnitForProduct: function(product) {
    const units = {
        'eggs': 'dozen',
        'broilers-dressed': 'birds',
        'broilers-live': 'birds',
        'layers': 'birds',
        'milk': 'liters',
        'pork': 'kg',
        'beef': 'kg',
        'goat': 'kg',
        'lamb': 'kg',
        'tomatoes': 'kg',
        'lettuce': 'heads',
        'carrots': 'kg',
        'potatoes': 'kg',
        'honey': 'kg',
        'other': 'units'
    };
    
    return units[product] || 'units';
},

estimateQuantityFromExpense: function(expenseData) {
    // Try to extract quantity from description
    const desc = expenseData.description || '';
    const match = desc.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms|bags|units)/i);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    
    // Estimate based on amount (assuming $10 per unit average)
    return Math.max(1, Math.floor(expenseData.amount / 10));
},

getUnitForCategory: function(category) {
    const units = {
        'feed': 'kg',
        'medical': 'bottles',
        'equipment': 'pcs',
        'packaging': 'pcs',
        'cleaning': 'bottles',
        'other': 'units'
    };
    return units[category] || 'units';
},

formatItemName: function(description, category) {
    if (description && description.length > 3) {
        // Capitalize first letter of each word
        return description.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .substring(0, 50);
    }
    
    // Default names
    const defaultNames = {
        'feed': 'Animal Feed',
        'medical': 'Medical Supplies',
        'equipment': 'Farm Equipment',
        'packaging': 'Packaging Materials',
        'cleaning': 'Cleaning Supplies',
        'other': 'Miscellaneous Items'
    };
    
    return defaultNames[category] || 'Inventory Item';
},

getMinStockForCategory: function(category) {
    const mins = {
        'feed': 50,
        'medical': 10,
        'equipment': 5,
        'packaging': 100,
        'cleaning': 20,
        'other': 10
    };
    return mins[category] || 10;
},

extractSupplier: function(notes) {
    if (!notes) return '';
    
    const match = notes.match(/supplier:\s*([A-Za-z\s]+)/i);
    return match ? match[1].trim() : '';
},

extractFeedType: function(description) {
    if (!description) return 'other';
    
    const desc = description.toLowerCase();
    if (desc.includes('starter')) return 'starter';
    if (desc.includes('grower')) return 'grower';
    if (desc.includes('finisher')) return 'finisher';
    if (desc.includes('layer')) return 'layer';
    if (desc.includes('broiler')) return 'broiler';
    return 'other';
},

extractMedicalType: function(description) {
    if (!description) return 'other';
    
    const desc = description.toLowerCase();
    if (desc.includes('vaccine')) return 'vaccine';
    if (desc.includes('antibiotic')) return 'antibiotic';
    if (desc.includes('vitamin')) return 'vitamin';
    if (desc.includes('deworm')) return 'dewormer';
    return 'medicine';
},

estimateFeedQuantity: function(expenseData) {
    // Try to extract quantity from description
    const desc = expenseData.description || '';
    const match = desc.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms|bags)/i);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    
    // Estimate based on amount (assuming $15 per 50kg bag)
    return Math.round(expenseData.amount / 15 * 50);
},

estimateMedicalQuantity: function(expenseData) {
    const desc = expenseData.description || '';
    const match = desc.match(/(\d+(?:\.\d+)?)\s*(?:bottles|vials|units)/i);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    
    return Math.max(1, Math.floor(expenseData.amount / 25));
},
     
    // ==================== RECEIPT MANAGEMENT ====================
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

    // ==================== SIMPLIFIED CAMERA METHODS ====================

// Initialize camera
/*initializeCamera: function() {
    console.log('📷 Initializing camera...');
    
    const video = document.getElementById('camera-preview');
    const status = document.getElementById('camera-status');
    
    if (!video) {
        console.error('Video element not found');
        this.showNotification('Camera error', 'error');
        return;
    }
    
    // Stop any existing stream
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
    }
    
    // Add required attributes for mobile
    video.setAttribute('playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.srcObject = null;
    
    if (status) status.textContent = 'Requesting camera...';
    
    // Simple constraints for mobile
    const constraints = {
        video: {
            facingMode: this.cameraFacingMode,
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
            
            return video.play();
        })
        .then(() => {
            console.log('✅ Camera playing');
            const cameraType = this.cameraFacingMode === 'user' ? 'Front' : 'Rear';
            if (status) status.textContent = `${cameraType} Camera Ready`;
            
            // Update switch button
            const switchBtn = document.getElementById('switch-camera');
            if (switchBtn) {
                const nextMode = this.cameraFacingMode === 'user' ? 'Rear' : 'Front';
                switchBtn.innerHTML = `<span class="btn-icon">🔄</span> Switch to ${nextMode}`;
            }
        })
        .catch(error => {
            console.error('❌ Camera error:', error);
            
            let message = 'Camera access failed';
            if (error.name === 'NotAllowedError') message = 'Camera permission denied';
            else if (error.name === 'NotFoundError') message = 'No camera found';
            else if (error.name === 'NotReadableError') message = 'Camera is busy';
            
            if (status) status.textContent = 'Camera unavailable';
            this.showNotification(message, 'error');
            
            // Show upload option after delay
            setTimeout(() => {
                if (confirm('Camera not available. Upload file instead?')) {
                    this.showUploadInterface();
                }
            }, 2000);
        });
}, */

    initializeCamera: function() {
    console.log('📷 Initializing camera...');
    
    // First, ensure any existing stream is stopped
    this.stopCamera();
    
    const video = document.getElementById('camera-preview');
    const status = document.getElementById('camera-status');
    
    if (!video) {
        console.error('Video element not found');
        this.showNotification('Camera error', 'error');
        return;
    }
    
    // Reset video element completely
    video.pause();
    video.srcObject = null;
    video.load();
    video.removeAttribute('src');
    video.removeAttribute('srcObject');
    
    // Add required attributes
    video.setAttribute('playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    
    if (status) status.textContent = 'Requesting camera...';
    
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not supported');
        if (status) status.textContent = 'Camera not supported';
        this.showNotification('Camera not supported in this browser', 'error');
        return;
    }
    
    // Small delay to ensure cleanup
    setTimeout(() => {
        // Try with basic constraints first (more compatible)
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
                
                // Update switch button
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
                    // Try with even simpler constraints
                    this.initializeCameraFallback();
                    return;
                }
                
                if (status) status.textContent = 'Camera unavailable';
                this.showNotification(errorMessage, 'error');
                
                // Show upload interface after delay
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

    checkCameraAvailability: function() {
    return new Promise((resolve) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            resolve(false);
            return;
        }
        
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const hasCamera = devices.some(device => device.kind === 'videoinput');
                console.log('📹 Camera available:', hasCamera);
                resolve(hasCamera);
            })
            .catch(() => {
                resolve(false);
            });
    });
},
    
// Fallback camera initialization with minimal constraints
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

// Stop camera
/*stopCamera: function() {
    console.log('🛑 Stopping camera');
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
    }
    const video = document.getElementById('camera-preview');
    if (video) {
        video.srcObject = null;
    }
},

// Switch camera
switchCamera: function() {
    console.log('🔄 Switching camera');
    
    const now = Date.now();
    if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1000) {
        console.log('⏳ Please wait');
        return;
    }
    this.lastSwitchClick = now;
    
    this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
    this.stopCamera();
    setTimeout(() => this.initializeCamera(), 300);
}, */

    stopCamera: function() {
    console.log('🛑 Stopping camera aggressively...');
    
    // 1. Stop all tracks in the stream
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
    
    // 2. Clear all video elements
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
    
    // 3. Specifically target the camera preview
    const preview = document.getElementById('camera-preview');
    if (preview) {
        preview.srcObject = null;
        preview.pause();
        preview.removeAttribute('src');
        preview.load();
    }
    
    // 4. Remove any camera sections from DOM
    const cameraSection = document.getElementById('camera-section');
    if (cameraSection) {
        cameraSection.style.display = 'none';
    }
    
    // 5. Force garbage collection hint
    this.cameraStream = null;
    
    console.log('✅ Camera fully stopped and cleaned up');
},

// Completely reset and rebuild camera interface
resetAndShowCamera: function() {
    console.log('🔄 Resetting and showing camera interface...');
    
    // 1. Stop any existing camera streams
    this.stopCamera();
    
    // 2. Remove existing camera section if any
    const existingCameraSection = document.getElementById('camera-section');
    if (existingCameraSection) {
        existingCameraSection.remove();
    }
    
    // 3. Find the import receipts content container
    const importReceiptsContent = document.getElementById('import-receipts-content');
    if (!importReceiptsContent) {
        console.error('❌ Import receipts content not found');
        return;
    }
    
    // 4. Create fresh camera section HTML
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
    
    // 5. Insert camera section after the quick actions section
    const quickActionsSection = importReceiptsContent.querySelector('.quick-actions-section');
    if (quickActionsSection) {
        quickActionsSection.insertAdjacentHTML('afterend', cameraHTML);
    } else {
        importReceiptsContent.insertAdjacentHTML('beforeend', cameraHTML);
    }
    
    // 6. Hide other sections
    const uploadSection = document.getElementById('upload-section');
    const recentSection = document.getElementById('recent-section');
    const quickActions = document.querySelector('.quick-actions-section');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (recentSection) recentSection.style.display = 'none';
    if (quickActions) quickActions.style.display = 'none';
    
    // 7. Initialize camera with a slight delay
    setTimeout(() => {
        this.initializeCameraWithRetry();
    }, 100);
},

// Initialize camera with retry logic
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
    
    // Reset video element
    video.pause();
    video.srcObject = null;
    video.load();
    
    // Add required attributes
    video.setAttribute('playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    
    if (status) status.textContent = 'Requesting camera...';
    
    // Simple constraints for better compatibility
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
            
            // Wait for video to be ready
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve).catch(resolve);
                };
            });
        })
        .then(() => {
            console.log('📹 Video playing successfully');
            if (status) status.textContent = 'Camera Ready';
            
            // Attach button handlers after camera is ready
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
            
            // Show upload interface as fallback
            setTimeout(() => {
                if (confirm('Camera not available. Would you like to upload a file instead?')) {
                    this.showUploadInterface();
                }
            }, 2000);
        });
},

// Attach camera button handlers
attachCameraButtonHandlers: function() {
    console.log('🔧 Attaching camera button handlers...');
    
    // Capture button
    const captureBtn = document.getElementById('capture-photo-btn');
    if (captureBtn) {
        // Remove old listeners
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
    
    // Switch camera button
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
    
    // Cancel/Back button
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

// Switch camera and reinitialize
switchCameraAndReinit: function() {
    console.log('🔄 Switching camera...');
    
    const now = Date.now();
    if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1500) {
        console.log('⏳ Please wait before switching camera again');
        return;
    }
    this.lastSwitchClick = now;
    
    // Toggle facing mode
    this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
    console.log('📱 New camera mode:', this.cameraFacingMode);
    
    // Stop current stream
    this.stopCamera();
    
    // Reinitialize with new facing mode
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
    
    // Disable button
    this.isCapturing = true;
    if (captureBtn) {
        captureBtn.disabled = true;
        captureBtn.style.opacity = '0.5';
    }
    
    if (status) status.textContent = 'Capturing...';
    
    // Set canvas size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw video frame
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Flash effect
    video.style.opacity = '0.7';
    setTimeout(() => video.style.opacity = '1', 100);
    
    // Get image data as blob
    canvas.toBlob((blob) => {
        const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        if (status) status.textContent = 'Photo captured!';
        this.showNotification('📸 Photo captured!', 'success');
        
        // Stop camera
        this.stopCamera();
        
        // Hide camera section
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'none';
        }
        
        // Show the image viewer with options (Edit, Save, Retake, Delete)
        this.showSimpleImageViewer(file);
        
        // Re-enable button
        if (captureBtn) {
            captureBtn.disabled = false;
            captureBtn.style.opacity = '1';
        }
        this.isCapturing = false;
        
    }, 'image/jpeg', 0.9);
},

// Helper: Convert dataURL to File object
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

    
   // SIMPLE TEST VIEWER - ADD THIS AFTER capturePhoto
/*showSimpleImageViewer: function(file) {
    console.log('🖼️ SIMPLE VIEWER - SHOWING WITH OPTIONS');
    
    // Force remove camera
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
        // Remove any existing viewer
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
                    <button id="save-image-btn" style="flex: 1; min-width: 120px; padding: 12px 20px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">✓ Save to Receipt</button>
                    
                    <button id="edit-image-btn" style="flex: 1; min-width: 120px; padding: 12px 20px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">✎ Edit Crop</button>
                    
                    <button id="retake-image-btn" style="flex: 1; min-width: 120px; padding: 12px 20px; background: linear-gradient(135deg, #FF9800, #F57C00); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">↺ Retake Photo</button>
                    
                    <button id="cancel-image-btn" style="flex: 1; min-width: 120px; padding: 12px 20px; background: #f5f5f5; color: #666; border: 1px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">✕ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add hover effects
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
        
        // Save button - save to receipt
        document.getElementById('save-image-btn').onclick = () => {
            console.log('💾 Saving image to receipt');
            modal.remove();
            
            // Call the original save function
            const imageUrl = URL.createObjectURL(file);
            this.saveReceiptFromFile(file, imageUrl);
        };
        
        // Edit button - go back to cropper
        document.getElementById('edit-image-btn').onclick = () => {
            console.log('✎ Editing crop again');
            modal.remove();
            
            // Re-open cropper with the same image
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof window.openCropper === 'function') {
                    window.openCropper(e.target.result, (croppedFile) => {
                        console.log('📷 Re-cropped file received');
                        
                        // Show viewer again with new cropped image
                        setTimeout(() => {
                            this.showSimpleImageViewer(croppedFile);
                        }, 100);
                        
                    }, file.name);
                }
            };
            reader.readAsDataURL(file);
        };
        
        // Retake button - go back to camera
        document.getElementById('retake-image-btn').onclick = () => {
            console.log('↺ Retaking photo');
            modal.remove();
            
            // Reopen the import modal and show camera
            const importModal = document.getElementById('import-receipts-modal');
            if (importModal) {
                importModal.style.display = 'flex';
                importModal.classList.remove('hidden');
                
                // Trigger camera option click
                setTimeout(() => {
                    document.getElementById('camera-option')?.click();
                }, 100);
            }
        };
        
        // Cancel button - go back to main menu
        document.getElementById('cancel-image-btn').onclick = () => {
            console.log('✕ Cancelled');
            modal.remove();
            
            // Show the import modal with quick actions
            const importModal = document.getElementById('import-receipts-modal');
            if (importModal) {
                importModal.style.display = 'flex';
                importModal.classList.remove('hidden');
                
                const quickActions = document.getElementById('quick-actions-view');
                if (quickActions) quickActions.style.display = 'block';
            }
        };
    };
    reader.readAsDataURL(file);
}, */

   showSimpleImageViewer: function(file) {
    console.log('🖼️ SIMPLE VIEWER - SHOWING WITH OPTIONS');
    
    // Force remove camera
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
        // Remove any existing viewer
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
            <div style="
                background: white; 
                padding: 25px; 
                border-radius: 16px; 
                text-align: center; 
                max-width: 90%; 
                max-height: 90%; 
                overflow-y: auto; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 20px; color: #2E7D32; font-weight: 600;">Review Image</h3>
                
                <div style="
                    max-width: 100%; 
                    max-height: 50vh; 
                    overflow: hidden; 
                    margin-bottom: 20px; 
                    border-radius: 8px; 
                    border: 2px solid #e0e0e0;
                ">
                    <img src="${e.target.result}" style="width: 100%; height: auto; display: block;">
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                    <button id="edit-image-btn" style="
                        flex: 1;
                        min-width: 100px;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        ✎ Edit Image
                    </button>
                    
                    <button id="save-image-btn" style="
                        flex: 1;
                        min-width: 100px;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #4CAF50, #2E7D32);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        ✓ Save
                    </button>
                    
                    <button id="retake-image-btn" style="
                        flex: 1;
                        min-width: 100px;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        ↺ Retake
                    </button>
                    
                    <button id="delete-image-btn" style="
                        flex: 1;
                        min-width: 100px;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Get button references
        const editBtn = document.getElementById('edit-image-btn');
        const saveBtn = document.getElementById('save-image-btn');
        const retakeBtn = document.getElementById('retake-image-btn');
        const deleteBtn = document.getElementById('delete-image-btn');
        
        // Edit button - open cropper for editing
        if (editBtn) {
            editBtn.onclick = () => {
                console.log('✎ Edit button clicked - opening cropper');
                modal.remove();
                this.showStandardCropper(file);
            };
        }
        
        // Save button - save to receipt
        if (saveBtn) {
            saveBtn.onclick = () => {
                console.log('💾 Save button clicked');
                modal.remove();
                // Convert to base64 directly for storage
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Data = e.target.result;
                    this.saveReceiptFromFile(file, base64Data);
                };
                reader.readAsDataURL(file);
            };
        }
        
       // Retake button - go back to camera
        if (retakeBtn) {
            retakeBtn.onclick = () => {
                console.log('↺ Retake button clicked - going back to camera');
                modal.remove();
                
                // Force stop any existing camera
                this.stopCamera();
                
                // Make sure we're in the import modal
                const importModal = document.getElementById('import-receipts-modal');
                if (importModal) {
                    importModal.style.display = 'flex';
                    importModal.classList.remove('hidden');
                }
                
                // Reset and show camera with fresh interface
                setTimeout(() => {
                    this.resetAndShowCamera();
                }, 200);
            };
        }
        
       // Delete button - discard image
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                console.log('🗑️ Delete button clicked');
                modal.remove();
                this.showNotification('Image discarded', 'info');
                
                // Show the import modal with quick actions
                const importModal = document.getElementById('import-receipts-modal');
                if (importModal) {
                    importModal.style.display = 'flex';
                    importModal.classList.remove('hidden');
                    
                    // Make sure quick actions are visible
                    setTimeout(() => {
                        this.showQuickActionsView();
                    }, 100);
                }
            };
        }
        
        // Add hover effects to all buttons
        const allButtons = [editBtn, saveBtn, retakeBtn, deleteBtn];
        allButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = 'none';
                });
            }
        });
    };
    reader.readAsDataURL(file);
},
    
// Also update handleFileUpload to hide any active camera
handleFileUpload: async function(files) {
    console.log('🎯 ========== handleFileUpload START ==========');
    console.log('📁 Number of files:', files.length);
    
    if (!files || files.length === 0) {
        console.log('❌ No files');
        return;
    }
    
    // Hide camera if it's showing
    const cameraSection = document.getElementById('camera-section');
    if (cameraSection && cameraSection.style.display !== 'none') {
        cameraSection.style.display = 'none';
        this.stopCamera();
    }
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Processing file ${i+1}:`, file.name);
        
        // Convert file to base64 directly (no blob URL!)
        const base64Data = await this.fileToBase64(file);
        console.log(`✅ Converted to base64, length: ${base64Data.length}`);
        
        // For images, offer cropping
        if (file.type.startsWith('image/')) {
            setTimeout(async () => {
                if (confirm(`Crop "${file.name}"?`)) {
                    try {
                        await this.loadCropperLibrary();
                        this.showStandardCropperWithBase64(file, base64Data);
                    } catch (error) {
                        console.error('Failed to load cropper:', error);
                        this.saveReceiptFromFile(file, base64Data);
                    }
                } else {
                    this.saveReceiptFromFile(file, base64Data);
                }
            }, i * 500);
        } else {
            // For non-images (PDFs), process directly
            this.saveReceiptFromFile(file, base64Data);
        }
    }
},

// Helper: Convert file to base64
fileToBase64: function(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
},

// ==================== CROPPER WITH DEBUGGING ====================
cropperInstance: null,
currentImageFile: null,
cropperLibraryLoaded: false,

    
// Find this line in your file - it's near the end of all your functions
// ==================== CROPPER METHOD ====================
showStandardCropper: function(file) {
    console.log('🔧 Opening cropper for:', file.name);
    
    // Force remove ALL camera elements first
    const cameraSection = document.getElementById('camera-section');
    if (cameraSection) {
        cameraSection.remove();
    }
    
    // Also remove any stray video elements
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
        
        // Create modal
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
            <div style="
                background: white;
                width: 95%;
                max-width: 600px;
                height: 90vh;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="
                    background: #22c55e;
                    color: white;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin:0;">✂️ Crop Receipt</h3>
                    <button id="close-${modalId}" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 28px;
                        cursor: pointer;
                        width: 44px;
                        height: 44px;
                    ">&times;</button>
                </div>
                
                <!-- Image -->
                <div style="
                    flex: 1;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                ">
                    <img id="crop-image-${modalId}" src="${imageUrl}" style="max-width: 100%; max-height: 100%; display: block;">
                </div>
                
                <!-- Controls -->
                <div style="
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #ddd;
                ">
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        margin-bottom: 16px;
                    ">
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
        
        // Initialize cropper
        img.onload = () => {
            setTimeout(() => {
                if (this.cropperInstance) {
                    this.cropperInstance.destroy();
                }
                
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
        
        // Controls
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
            // Show the image viewer again
            this.showSimpleImageViewer(file);
        };
        
        document.getElementById(`close-${modalId}`).onclick = () => {
            if (this.cropperInstance) {
                this.cropperInstance.destroy();
                this.cropperInstance = null;
            }
            modal.remove();
            // Show the image viewer again
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
                
                // Show the viewer with the cropped image
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
    
    // Function to load Cropper library with CSP compliance
loadCropperLibrary: function() {
    return new Promise((resolve, reject) => {
        if (this.cropperLibraryLoaded) {
            resolve();
            return;
        }
        
        console.log('📦 Loading Cropper library...');
        
        // Check if already loaded
        if (window.Cropper) {
            console.log('✅ Cropper already loaded');
            this.cropperLibraryLoaded = true;
            resolve();
            return;
        }
        
        // Try to load from CDN (it might still work despite CSP warning)
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
        script.onload = () => {
            console.log('✅ Cropper JS loaded');
            
            // Try to load CSS - if CSP blocks it, we'll use inline styles
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
            link.onload = () => {
                console.log('✅ Cropper CSS loaded');
                this.cropperLibraryLoaded = true;
                resolve();
            };
            link.onerror = () => {
                console.warn('⚠️ Cropper CSS blocked by CSP, using inline styles');
                // Inject critical cropper styles inline
                this.injectCropperStyles();
                this.cropperLibraryLoaded = true;
                resolve();
            };
            document.head.appendChild(link);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Cropper JS');
            reject(new Error('Failed to load Cropper library'));
        };
        document.head.appendChild(script);
    });
},

// Inject critical cropper styles inline (CSP compliant)
injectCropperStyles: function() {
    const styleId = 'cropper-inline-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .cropper-container {
            direction: ltr;
            font-size: 0;
            line-height: 0;
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            touch-action: none;
            user-select: none;
        }
        .cropper-wrap-box {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
        .cropper-canvas {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: #e0e0e0;
        }
        .cropper-drag-box {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0,0,0,0.2);
        }
        .cropper-crop-box {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
        .cropper-modal {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0,0,0,0.5);
        }
        .cropper-view-box {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            outline: 2px solid #22c55e;
            outline-color: rgba(34,197,94,0.75);
        }
        .cropper-face {
            position: absolute;
            top: 0;
            left: 0;
            background: rgba(255,255,255,0.1);
        }
        .cropper-line {
            position: absolute;
            background: #22c55e;
        }
        .cropper-point {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #22c55e;
            border: 2px solid white;
            border-radius: 50%;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Injected inline cropper styles');
},

  saveCroppedReceipt: function(file, imageUrl) {
    console.log('💾 Saving cropped receipt:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const base64Data = e.target.result;
        const receiptId = `camera_${Date.now()}`;
        
        const receipt = {
            id: receiptId,
            name: file.name,
            type: file.type,
            size: file.size,
            dataURL: base64Data,
            downloadURL: base64Data,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            source: 'camera',
            cropped: true
        };
        
        this.saveReceiptToStorage(receipt);
        this.showNotification('✅ Cropped receipt saved!', 'success');
        this.updateModalReceiptsList();
        this.updateReceiptQueueUI();
        this.showCaptureSuccess(receipt);
    };
    
    reader.readAsDataURL(file);
},
    
// Save receipt from file (keep your existing method)
saveReceiptFromFile: function(file, dataURL) {
    console.log('💾 Saving receipt:', file.name);
    
    // If dataURL is a blob URL, we need to convert it to base64
    if (dataURL && dataURL.startsWith('blob:')) {
        console.log('📸 Converting blob URL to base64...');
        
        // Fetch the blob data and convert to base64
        fetch(dataURL)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Data = e.target.result;
                    console.log('✅ Converted to base64, length:', base64Data.length);
                    this.saveReceiptWithBase64(file, base64Data);
                };
                reader.onerror = (error) => {
                    console.error('❌ Failed to convert blob to base64:', error);
                    this.saveReceiptWithBase64(file, dataURL); // Fallback
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('❌ Failed to fetch blob:', error);
                this.saveReceiptWithBase64(file, dataURL);
            });
    } else {
        // Already a data URL or base64
        this.saveReceiptWithBase64(file, dataURL);
    }
},

saveReceiptWithBase64: function(file, base64Data) {
    const receiptId = `receipt_${Date.now()}`;
    
    // Extract base64 data without the prefix if needed
    let imageData = base64Data;
    let mimeType = file.type;
    
    // If it's already a data URL with prefix, keep it
    if (base64Data.startsWith('data:')) {
        // Extract just the base64 part for storage efficiency
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            mimeType = matches[1];
            const base64Only = matches[2];
            
            const receipt = {
                id: receiptId,
                name: file.name,
                type: mimeType,
                size: file.size,
                dataURL: base64Data, // Store full data URL for easy display
                downloadURL: base64Data, // Also store in downloadURL for compatibility
                base64Data: base64Only, // Store just the base64 part
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
    
    // Fallback: store as is
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
    
    // Save locally
    this.receiptQueue.unshift(receipt);
    
    const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
    const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
    if (existingIndex !== -1) {
        localReceipts.splice(existingIndex, 1);
    }
    localReceipts.unshift(receipt);
    localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
    
    console.log('✅ Saved to localStorage, receipt data length:', receipt.dataURL?.length);
    
    // Try Firebase save
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
    
    // Update UI
    this.updateReceiptQueueUI();
    this.updateModalReceiptsList();
    this.showCaptureSuccess(receipt);
},
    
    saveCroppedReceipt(file, imageUrl) {
        console.log('💾 Saving cropped receipt:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const dataURL = e.target.result;
            const receiptId = `camera_${Date.now()}`;
            
            const receipt = {
                id: receiptId,
                name: file.name,
                type: file.type,
                size: file.size,
                dataURL: dataURL,
                downloadURL: imageUrl,
                status: 'pending',
                uploadedAt: new Date().toISOString(),
                source: 'camera',
                cropped: true
            };
            
            this.saveReceiptLocally(receipt);
            this.saveReceiptToFirebase(receipt)
                .then(() => {
                    this.showNotification('✅ Cropped receipt saved!', 'success');
                    this.updateModalReceiptsList();
                    this.updateReceiptQueueUI();
                    this.showCaptureSuccess(receipt);
                })
                .catch(error => {
                    console.error('❌ Firebase save error:', error);
                    this.showNotification('✅ Receipt saved locally!', 'success');
                    this.updateModalReceiptsList();
                    this.updateReceiptQueueUI();
                    this.showCaptureSuccess(receipt);
                });
        };
        
        reader.readAsDataURL(file);
    },

       
   initializeCamera() {
    console.log('📷 Initializing camera...');
    
    try {
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        const cameraSection = document.getElementById('camera-section');
        
        if (!video) {
            console.error('❌ Camera preview element not found');
            this.showNotification('Camera preview element missing', 'error');
            this.showUploadInterface();
            return;
        }
        
        // CRITICAL FOR MOBILE: Add playsinline attribute
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        
        // First check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ Camera API not supported in this browser');
            if (status) status.textContent = 'Camera not supported';
            this.showNotification('Camera not supported in this browser', 'error');
            this.showUploadInterface();
            return;
        }
        
        video.srcObject = null;
        video.pause();
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        if (status) status.textContent = 'Requesting camera access...';
        
        // SIMPLIFIED constraints for mobile
        const constraints = {
            video: {
                facingMode: this.cameraFacingMode,
                width: { ideal: 720 }, // Lower resolution for mobile
                height: { ideal: 720 }
            },
            audio: false
        };
        
        console.log('📱 Requesting camera with mobile-friendly constraints');
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('✅ Camera access granted');
                this.cameraStream = stream;
                video.srcObject = stream;
                
                // For mobile, we need to handle video differently
                video.setAttribute('playsinline', 'true');
                video.setAttribute('autoplay', 'true');
                
                return video.play();
            })
            .then(() => {
                console.log('📹 Video is playing successfully');
                const cameraType = this.cameraFacingMode === 'user' ? 'Front' : 'Rear';
                if (status) status.textContent = `${cameraType} Camera - Ready`;
                
                const switchBtn = document.getElementById('switch-camera');
                if (switchBtn) {
                    const nextMode = this.cameraFacingMode === 'user' ? 'Rear' : 'Front';
                    switchBtn.innerHTML = `
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Switch to ${nextMode}</span>
                    `;
                }
            })
            .catch(error => {
                console.error('❌ Camera error:', error);
                
                // Better error messages for mobile
                let errorMessage = 'Camera access denied. ';
                
                if (error.name === 'NotReadableError' || error.message.includes('NotReadableError')) {
                    errorMessage = 'Camera is busy. Close other apps using the camera.';
                } else if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
                    errorMessage = 'Camera permission denied. Please check browser settings.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No camera found on this device.';
                } else if (error.message.includes('Constraint')) {
                    errorMessage = 'Camera does not support required settings.';
                }
                
                if (status) status.textContent = 'Camera unavailable';
                this.showNotification(errorMessage, 'error');
                
                // Show upload interface as fallback
                setTimeout(() => {
                    this.showUploadInterface();
                }, 2000);
            });
            
    } catch (error) {
        console.error('🚨 Camera initialization error:', error);
        this.showNotification('Camera initialization failed', 'error');
        this.showUploadInterface();
    }
},
   
    createReceiptFromBase64(dataURL, timestamp) {
        const base64Data = dataURL.split(',')[1];
        const approxSize = Math.floor(base64Data.length * 0.75);
        const receiptId = `camera_${timestamp}`;
        
        return {
            id: receiptId,
            name: `receipt_${timestamp}.jpg`,
            base64Data: base64Data,
            dataURL: dataURL,
            size: approxSize,
            type: 'image/jpeg',
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            storageType: 'firestore-base64',
            metadata: {
                capturedAt: new Date().toISOString(),
                quality: 'medium',
                resolution: 'original'
            }
        };
    },

    saveReceiptLocally(receipt) {
        this.receiptQueue.unshift(receipt);
        
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        
        const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
        if (existingIndex !== -1) {
            localReceipts.splice(existingIndex, 1);
        }
        
        localReceipts.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
        
        console.log('✅ Saved to localStorage:', receipt.id);
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
        
        // Prepare receipt for Firestore
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
        
        // Save to Firestore
        await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
        
        console.log('✅ Receipt saved to Firebase successfully:', receipt.id);
        
        // Update local storage to mark as synced
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
    
    showCaptureLoading(show) {
        let overlay = document.getElementById('capture-loading-overlay');
        
        if (show && !overlay) {
            overlay = document.createElement('div');
            overlay.id = 'capture-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                color: white;
                animation: fadeIn 0.3s ease-out;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; border: 6px solid rgba(255, 255, 255, 0.2); border-top: 6px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Saving Receipt...</div>
                    <div style="font-size: 16px; opacity: 0.8;">Please wait while we save your photo</div>
                    <div style="margin-top: 24px; font-size: 14px; opacity: 0.6;">✓ Saved locally</div>
                    <div style="font-size: 14px; opacity: 0.6;">🔄 Syncing to cloud...</div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        } else if (!show && overlay) {
            overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
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
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            text-align: center;
            max-width: 400px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translate(-50%, -40%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            #capture-success-modal::-webkit-scrollbar {
                width: 6px;
            }
            #capture-success-modal::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 3px;
            }
            #capture-success-modal::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);
        
        let imagePreview = '';
        if (receipt.type?.startsWith('image/')) {
            imagePreview = `
                <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; animation: pulse 2s ease-in-out; max-height: 200px; overflow: hidden;">
                    <img src="${receipt.dataURL}" 
                         alt="Receipt preview" 
                         style="width: 100%; max-height: 200px; object-fit: contain; background: #f8fafc;">
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div style="position: relative; min-height: 0;">
                <div style="font-size: 64px; color: #10b981; margin-bottom: 16px; animation: pulse 2s ease-in-out;">✅</div>
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
                    <button id="process-now-btn" 
                            style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                                   color: white; 
                                   border: none; 
                                   padding: 14px 24px; 
                                   border-radius: 10px; 
                                   font-weight: 700; 
                                   cursor: pointer; 
                                   flex: 1;
                                   font-size: 16px;
                                   transition: all 0.2s;
                                   min-width: 140px;">
                        🔍 Process Now
                    </button>
                    <button id="close-success-modal" 
                            style="background: #f1f5f9; 
                                   color: #374151; 
                                   border: none; 
                                   padding: 14px 24px; 
                                   border-radius: 10px; 
                                   font-weight: 700; 
                                   cursor: pointer; 
                                   flex: 1;
                                   font-size: 16px;
                                   transition: all 0.2s;
                                   min-width: 140px;">
                        Done
                    </button>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button id="take-another-btn" 
                            style="background: none; 
                                   color: #3b82f6; 
                                   border: 2px solid #3b82f6; 
                                   padding: 10px 20px; 
                                   border-radius: 8px; 
                                   font-weight: 600; 
                                   cursor: pointer; 
                                   width: 100%;
                                   margin-bottom: 8px;
                                   transition: all 0.2s;">
                        📸 Take Another Photo
                    </button>
                    <button id="delete-captured-btn" 
                            style="background: #fef2f2; 
                                   color: #dc2626; 
                                   border: 2px solid #fecaca; 
                                   padding: 10px 20px; 
                                   border-radius: 8px; 
                                   font-weight: 600; 
                                   cursor: pointer; 
                                   width: 100%;
                                   transition: all 0.2s;">
                        🗑️ Delete this receipt
                    </button>
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

   stopCamera: function() {
    console.log('🛑 Stopping camera aggressively...');
    
    // 1. Stop all tracks in the stream
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
    
    // 2. Clear all video elements
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
    
    // 3. Specifically target the camera preview
    const preview = document.getElementById('camera-preview');
    if (preview) {
        preview.srcObject = null;
        preview.pause();
        preview.removeAttribute('src');
        preview.load();
    }
    
    // 4. Reset camera status
    const status = document.getElementById('camera-status');
    if (status) {
        status.textContent = 'Camera stopped';
    }
    
    console.log('✅ Camera fully stopped and cleaned up');
},

    switchCamera() {
        console.log('🔄 Switching camera...');
        
        const now = Date.now();
        if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1500) {
            console.log('⏳ Please wait before switching camera again');
            return;
        }
        this.lastSwitchClick = now;
        
        this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
        
        this.stopCamera();
        
        setTimeout(() => {
            this.initializeCamera();
        }, 300);
    },

    // ==================== FILE UPLOAD ====================
   /* handleFileUpload: function(files) {
    console.log('🎯 ========== handleFileUpload START ==========');
    console.log('📁 Number of files:', files.length);
    
    if (!files || files.length === 0) {
        console.log('❌ No files');
        return;
    }
    
    // Process each file directly without cropping
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Processing file ${i+1}:`, file.name);
        this.processReceiptFile(file);
    }
},

*/

    // Handle file upload cropper library edition
    handleFileUpload: function(files) {
    console.log('🎯 ========== handleFileUpload START ==========');
    console.log('📁 Number of files:', files.length);
    
    if (!files || files.length === 0) {
        console.log('❌ No files');
        return;
    }
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Processing file ${i+1}:`, file.name);
        
        // For images, offer cropping
        if (file.type.startsWith('image/')) {
            setTimeout(() => {
                if (confirm(`Crop "${file.name}"?`)) {
                    this.showStandardCropper(file);
                } else {
                    this.processReceiptFile(file);
                }
            }, i * 500); // Delay for multiple files
        } else {
            // For non-images (PDFs), process directly
            this.processReceiptFile(file);
        }
    }
},
    
    // Add this function before processCroppedReceipt
showReceiptCropperModal: function(file) {
    console.log('✂️ Simple image viewer for:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const imageUrl = e.target.result;
        
        // Create a unique ID
        const modalId = 'simple-modal-' + Date.now();
        
        // Ultra simple modal with just view and save
        const modalHTML = `
            <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:black; z-index:100000; display:flex; flex-direction:column;">
                
                <!-- Image container -->
                <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:10px;">
                    <img src="${imageUrl}" style="max-width:100%; max-height:80vh; object-fit:contain;">
                </div>
                
                <!-- Simple button bar -->
                <div style="display:flex; padding:20px; gap:10px; background:#222;">
                    <button id="cancel-${modalId}" style="flex:1; padding:20px; background:#f44336; color:white; border:none; border-radius:10px; font-size:18px; font-weight:bold;">CANCEL</button>
                    <button id="save-${modalId}" style="flex:1; padding:20px; background:#4CAF50; color:white; border:none; border-radius:10px; font-size:18px; font-weight:bold;">SAVE</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Get buttons
        const cancelBtn = document.getElementById(`cancel-${modalId}`);
        const saveBtn = document.getElementById(`save-${modalId}`);
        const modal = document.getElementById(modalId);
        
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                modal.remove();
                if (confirm('Save without cropping?')) {
                    // Just save the original
                    this.processReceiptFile(file);
                }
            }.bind(this);
        }
        
        if (saveBtn) {
            saveBtn.onclick = function() {
                modal.remove();
                // Save with a simple message
                this.showNotification('📸 Saving receipt...', 'info');
                this.processReceiptFile(file);
            }.bind(this);
        }
        
        console.log('✅ Simple modal created');
    };
    
    reader.readAsDataURL(file);
},
    
    showSimpleSuccessModal(receipts) {
        console.log('🎉 Showing success modal for', receipts.length, 'receipt(s)');
        
        const modalId = 'upload-success-modal-' + Date.now();
        
        const modalHTML = `
            <div id="${modalId}" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 10px;
                padding: 20px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 99999;
                border: 2px solid #4CAF50;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 40px;">✅</div>
                    <h3 style="margin: 10px 0; color: #333;">Upload Complete!</h3>
                    <p style="color: #666; margin: 0;">
                        Successfully uploaded: <strong>${receipts[0].name}</strong>
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="${modalId}-ok-btn" style="
                        flex: 1;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 5px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        OK
                    </button>
                </div>
            </div>
            
            <div id="${modalId}-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 99998;
            "></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ Modal shown!');
        
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            const overlay = document.getElementById(modalId + '-overlay');
            const okButton = document.getElementById(modalId + '-ok-btn');
            
            if (okButton) {
                okButton.addEventListener('click', () => {
                    if (modal) modal.remove();
                    if (overlay) overlay.remove();
                });
            }
            
            if (overlay) {
                overlay.addEventListener('click', () => {
                    if (modal) modal.remove();
                    if (overlay) overlay.remove();
                });
            }
        }, 10);
    },

    showUploadSuccessModal(receipts) {
        console.log('🪟 CREATING SUCCESS MODAL for', receipts.length, 'receipts');
        
        const existingModal = document.getElementById('upload-success-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="upload-success-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                padding: 30px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 999999;
                border: 3px solid #4CAF50;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
                    <h2 style="margin: 0 0 10px 0; color: #333;">Upload Successful!</h2>
                    <p style="color: #666; margin: 0 0 20px 0;">
                        ${receipts.length} file(s) uploaded successfully
                    </p>
                </div>
                
                <div style="
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 25px;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    ${receipts.map((receipt, i) => `
                        <div style="
                            padding: 8px;
                            border-bottom: ${i < receipts.length - 1 ? '1px solid #ddd' : 'none'};
                            display: flex;
                            align-items: center;
                        ">
                            <span style="margin-right: 10px; font-size: 20px;">
                                ${receipt.type.includes('image') ? '🖼️' : '📄'}
                            </span>
                            <span style="flex-grow: 1; font-weight: 500;">${receipt.name}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="process-btn" style="
                        flex: 1;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        🚀 Process Now
                    </button>
                    <button id="close-btn" style="
                        flex: 1;
                        background: #666;
                        color: white;
                        border: none;
                        padding: 15px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
            </div>
            
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 999998;
            " id="modal-overlay"></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ Modal added to page');
        
        const module = window.IncomeExpensesModule || 
                      (window.FarmModules && window.FarmModules.getModule('income-expenses'));
        
        document.getElementById('close-btn').onclick = function() {
            document.getElementById('upload-success-modal').remove();
            document.getElementById('modal-overlay').remove();
        };
        
        document.getElementById('modal-overlay').onclick = function() {
            document.getElementById('upload-success-modal').remove();
            document.getElementById('modal-overlay').remove();
        };
        
        document.getElementById('process-btn').onclick = function() {
            document.getElementById('upload-success-modal').remove();
            document.getElementById('modal-overlay').remove();
            
            if (module && module.processPendingReceipts) {
                module.processPendingReceipts();
            }
        };
        
        console.log('✅ Modal event listeners added');
    },

    async uploadReceiptToFirebase(file, onProgress = null) {
        console.log('📤 Uploading receipt:', file.name);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const dataURL = e.target.result;
                    const base64Data = dataURL.split(',')[1];
                    const approxSize = Math.floor(base64Data.length * 0.75);
                    const timestamp = Date.now();
                    const receiptId = `upload_${timestamp}`;
                    
                    const receipt = {
                        id: receiptId,
                        name: file.name,
                        base64Data: base64Data,
                        dataURL: dataURL,
                        size: approxSize,
                        type: file.type,
                        status: 'pending',
                        uploadedAt: new Date().toISOString(),
                        storageType: 'firestore-base64',
                        metadata: {
                            uploadedAt: new Date().toISOString(),
                            originalSize: file.size,
                            fileType: file.type
                        }
                    };
                    
                    this.saveReceiptLocally(receipt);
                    
                    if (this.isFirebaseAvailable && window.db) {
                        const user = window.firebase?.auth?.().currentUser;
                        if (user) {
                            const firebaseReceipt = {
                                ...receipt,
                                userId: user.uid
                            };
                            
                            try {
                                await window.db.collection('receipts').doc(receiptId).set(firebaseReceipt);
                                console.log('✅ Saved to Firestore:', receiptId);
                            } catch (firestoreError) {
                                console.warn('⚠️ Firestore save failed, keeping local:', firestoreError.message);
                            }
                        }
                    }
                    
                    resolve(receipt);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    },

    // ==================== DELETE FUNCTIONALITY ====================
   setupReceiptActionListeners() {
    console.log('🔧 Setting up receipt action listeners...');
    
    // Use event delegation on document
    document.addEventListener('click', (e) => {
        // Handle delete button
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
        
        // Handle process button
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
        
        // Handle view button (NEW)
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
    
    // Try dataURL first (should be full data URL now)
    if (receipt.dataURL && receipt.dataURL.startsWith('data:')) {
        console.log('✅ Found dataURL (base64)');
        return receipt.dataURL;
    }
    
    // Try downloadURL
    if (receipt.downloadURL && receipt.downloadURL.startsWith('data:')) {
        console.log('✅ Found downloadURL (base64)');
        return receipt.downloadURL;
    }
    
    // Reconstruct from base64Data
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
    console.log('Image URL type:', imageUrl.substring(0, 50));
    
    // Remove any existing viewer
    const existingViewer = document.getElementById('receipt-viewer-modal');
    if (existingViewer) {
        existingViewer.remove();
    }
    
    // Create modal
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
        <div style="
            background: white;
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            cursor: default;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        ">
            <div style="
                background: linear-gradient(135deg, #22c55e, #16a34a);
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">👁️</span>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${this.escapeHtml(receiptName)}</h3>
                </div>
                <button id="close-viewer-btn" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            <div style="
                padding: 20px;
                max-height: 70vh;
                overflow: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                min-height: 200px;
            ">
                <img src="${imageUrl}" 
                     alt="${this.escapeHtml(receiptName)}" 
                     style="max-width: 100%; max-height: 60vh; object-fit: contain; border-radius: 8px;"
                     onerror="this.parentElement.innerHTML='<div style=\'text-align:center;color:#666;padding:40px;\'>⚠️ Image failed to load</div>'">
            </div>
            <div style="
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: white;
            ">
                <button id="download-receipt-btn" style="
                    padding: 8px 20px;
                    background: #22c55e;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    📥 Download
                </button>
                <button id="close-viewer-footer-btn" style="
                    padding: 8px 20px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close button handlers
    const closeBtn = document.getElementById('close-viewer-btn');
    const closeFooterBtn = document.getElementById('close-viewer-footer-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', () => modal.remove());
    }
    
    // Download button handler
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
        
        // Ensure camera section exists in DOM after render
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
            
            // Hide delete button for new transactions
            const deleteBtn = document.getElementById('delete-transaction');
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            // Show delete button for editing
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

    // ==================== VIEW MANAGEMENT ====================
  /*  showQuickActionsView() {
        console.log('🏠 Showing quick actions view...');
        
        this.stopCamera();
        
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        const quickActionsSection = document.querySelector('.quick-actions-section');
        
        if (cameraSection) cameraSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'none';
        if (quickActionsSection) quickActionsSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
    }, */

    showQuickActionsView: function() {
    console.log('🏠 Showing quick actions view...');
    
    // Stop camera
    this.stopCamera();
    
    // Hide camera section
    const cameraSection = document.getElementById('camera-section');
    if (cameraSection) cameraSection.style.display = 'none';
    
    // Hide upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'none';
    
    // Show quick actions
    const quickActionsSection = document.querySelector('.quick-actions-section');
    if (quickActionsSection) quickActionsSection.style.display = 'block';
    
    // Show recent section
    const recentSection = document.getElementById('recent-section');
    if (recentSection) recentSection.style.display = 'block';
    
    console.log('✅ Quick actions view shown');
},

    /*showUploadInterface() {
        console.log('📁 Showing upload interface...');
        
        this.stopCamera();
        
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        const quickActionsSection = document.querySelector('.quick-actions-section');
        
        if (cameraSection) cameraSection.style.display = 'none';
        if (quickActionsSection) quickActionsSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
        
        console.log('✅ Upload interface shown');
        
        setTimeout(() => {
            this.setupDragAndDrop();
        }, 100);
    },

   showCameraInterface: function() {
    console.log('📷 Showing camera interface...');
    
    const cameraSection = document.getElementById('camera-section');
    const uploadSection = document.getElementById('upload-section');
    const recentSection = document.getElementById('recent-section');
    const quickActionsSection = document.querySelector('.quick-actions-section');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (quickActionsSection) quickActionsSection.style.display = 'none';
    if (cameraSection) {
        cameraSection.style.display = 'block';
        
        // Quick check if camera might be available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const status = document.getElementById('camera-status');
            if (status) status.textContent = 'Camera not supported';
            this.showNotification('Camera not supported in this browser', 'warning');
            
            // Show upload option after 3 seconds
            setTimeout(() => {
                if (confirm('Camera not available. Would you like to upload a file instead?')) {
                    this.showUploadInterface();
                }
            }, 3000);
        } else {
            this.initializeCamera();
        }
        
    }
    if (recentSection) recentSection.style.display = 'block';
    
    console.log('✅ Camera interface shown');
}, */

showCameraInterface: function() {
    console.log('📷 Showing camera interface...');
    
    // Use the new reset method that rebuilds everything
    this.resetAndShowCamera();
},

    recreateCameraSection: function() {
    console.log('🔧 Recreating camera section...');
    
    // Find the import receipts container
    const importReceiptsContent = document.getElementById('import-receipts-content');
    if (!importReceiptsContent) {
        console.error('❌ Import receipts content not found');
        return;
    }
    
    // Check if camera section already exists
    if (document.getElementById('camera-section')) {
        console.log('✅ Camera section already exists');
        return;
    }
    
    // Create camera section HTML
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
    
    // Insert after recent section or at the end
    const recentSection = document.getElementById('recent-section');
    if (recentSection) {
        recentSection.insertAdjacentHTML('afterend', cameraSectionHTML);
    } else {
        importReceiptsContent.insertAdjacentHTML('beforeend', cameraSectionHTML);
    }
    
    console.log('✅ Camera section recreated');
},
    
    showUploadInterface: function() {
    console.log('📁 Showing upload interface...');
    
    // Stop camera first
    this.stopCamera();
    
    // Hide camera section
    const cameraSection = document.getElementById('camera-section');
    if (cameraSection) cameraSection.style.display = 'none';
    
    // Show upload section
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) uploadSection.style.display = 'block';
    
    // Show recent section
    const recentSection = document.getElementById('recent-section');
    if (recentSection) recentSection.style.display = 'block';
    
    // Hide quick actions
    const quickActionsSection = document.querySelector('.quick-actions-section');
    if (quickActionsSection) quickActionsSection.style.display = 'none';
    
    // IMPORTANT: Re-setup drag and drop listeners
    setTimeout(() => {
        this.setupDragAndDrop();
        console.log('✅ Drag and drop re-initialized for upload section');
    }, 100);
},

    checkCameraAvailability() {
        return new Promise((resolve) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                resolve(false);
                return;
            }
            
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    const hasCamera = devices.some(device => device.kind === 'videoinput');
                    resolve(hasCamera);
                })
                .catch(() => {
                    resolve(false);
                });
        });
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
            this.stopCamera(); // Stop camera stream when canceling
            this.showQuickActionsView();
        });

        setupModalButton('back-to-main-view', () => {
            console.log('🔙 Back to main view clicked');
            this.stopCamera(); // Stop camera when going back
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

   /* setupDragAndDrop() {
        console.log('🔧 Setting up drag and drop...');
        
        const dropArea = document.getElementById('receipt-upload-area');
        if (!dropArea) {
            console.log('ℹ️ No receipt-upload-area found');
            return;
        }
        
        dropArea.ondragover = null;
        dropArea.ondragleave = null;
        dropArea.ondrop = null;
        dropArea.onclick = null;
        
        dropArea.onclick = () => {
            console.log('📁 Drop area clicked');
            const fileInput = document.getElementById('receipt-upload-input');
            if (fileInput) {
                fileInput.click();
            }
        };
        
        dropArea.ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
            console.log('📁 Drag over drop area');
        };
        
        dropArea.ondragleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            console.log('📁 Drag left drop area');
        };
        
        dropArea.ondrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            
            console.log('📁 Files dropped on receipt-upload-area');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                console.log(`📤 Processing ${e.dataTransfer.files.length} dropped file(s)`);
                this.handleFileUpload(e.dataTransfer.files);
            }
        };
        
        console.log('✅ Drag and drop setup complete');
    }, */

    setupDragAndDrop: function() {
    console.log('🔧 Setting up drag and drop...');
    
    const dropArea = document.getElementById('receipt-dropzone');
    if (!dropArea) {
        console.log('ℹ️ No receipt-dropzone found');
        return;
    }
    
    // Remove existing listeners first to prevent duplicates
    dropArea.removeEventListener('click', this._dropAreaClickHandler);
    dropArea.removeEventListener('dragover', this._dropAreaDragOverHandler);
    dropArea.removeEventListener('dragleave', this._dropAreaDragLeaveHandler);
    dropArea.removeEventListener('drop', this._dropAreaDropHandler);
    
    // Create bound handlers
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
    
    // Add new listeners
    dropArea.addEventListener('click', this._dropAreaClickHandler);
    dropArea.addEventListener('dragover', this._dropAreaDragOverHandler);
    dropArea.addEventListener('dragleave', this._dropAreaDragLeaveHandler);
    dropArea.addEventListener('drop', this._dropAreaDropHandler);
    
    console.log('✅ Drag and drop setup complete');
},

  /*  setupFileInput() {
        console.log('📁 Setting up file input...');
        
        let fileInput = document.getElementById('receipt-upload-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'receipt-upload-input';
            fileInput.name = 'receipt-upload-input';
            fileInput.accept = 'image/*,.pdf,.jpg,.jpeg,.png,.heic,.heif';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.setAttribute('data-dynamic', 'true');
            document.body.appendChild(fileInput);
            console.log('✅ Created new file input');
        }
        
        fileInput.onchange = null;
        
        const fileInputHandler = (e) => {
            console.log('📁 File input changed!');
            
            if (e.target.files && e.target.files.length > 0) {
                console.log(`Processing ${e.target.files.length} file(s)`);
                this.handleFileUpload(e.target.files);
                e.target.value = '';
            }
        };
        
        fileInput.addEventListener('change', fileInputHandler.bind(this));
        console.log('✅ File input setup complete');
    }, */

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
    
    // Remove existing listener to avoid duplicates
    if (this._fileInputHandler) {
        fileInput.removeEventListener('change', this._fileInputHandler);
    }
    
    this._fileInputHandler = (e) => {
        console.log('📁 File input changed!');
        if (e.target.files && e.target.files.length > 0) {
            console.log(`Processing ${e.target.files.length} file(s)`);
            this.handleFileUpload(e.target.files);
            e.target.value = ''; // Reset so same file can be uploaded again
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
            // ===== NEW: Handle transaction item clicks for editing =====
            const transactionItem = e.target.closest('.transaction-item');
            if (transactionItem) {
                const transactionId = transactionItem.dataset.id;
                if (transactionId) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📝 Transaction item clicked for editing:', transactionId);
                    this.editTransaction(transactionId);
                    return; // Important: stop here so button clicks inside don't trigger twice
                }
            }
            
            // Handle button clicks
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
        
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        // Try to parse the date
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

    // ==================== TRANSACTION METHODS ====================
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

    async saveTransaction() {
        console.log('Saving transaction...');
        
        // Improved Firebase auth check
        let userId = 'anonymous';
        try {
            if (window.firebase && window.firebase.auth) {
                const auth = window.firebase.auth();
                if (auth && auth.currentUser) {
                    userId = auth.currentUser.uid;
                    console.log('✅ User ID:', userId);
                }
            }
        } catch (authError) {
            console.warn('⚠️ Error getting user:', authError);
        }
        
        // Get form values with validation
        const idInput = document.getElementById('transaction-id');
        const dateInput = document.getElementById('transaction-date');
        const typeInput = document.getElementById('transaction-type');
        const categoryInput = document.getElementById('transaction-category');
        const amountInput = document.getElementById('transaction-amount');
        const descriptionInput = document.getElementById('transaction-description');
        const paymentInput = document.getElementById('transaction-payment');
        const referenceInput = document.getElementById('transaction-reference');
        const notesInput = document.getElementById('transaction-notes');
        
        // Check if elements exist
        if (!dateInput || !typeInput || !categoryInput || !amountInput || !descriptionInput) {
            console.error('❌ Required form elements not found');
            this.showNotification('Form elements not found', 'error');
            return;
        }
        
        const id = idInput?.value || Date.now();
        const date = dateInput.value;
        const type = typeInput.value;
        const category = categoryInput.value;
        const amount = parseFloat(amountInput.value) || 0;
        const description = descriptionInput.value.trim();
        const paymentMethod = paymentInput?.value || 'cash';
        const reference = referenceInput?.value || '';
        const notes = notesInput?.value || '';
        
        // Validate required fields
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        // Prepare receipt data if exists
        let receiptData = null;
        if (this.receiptPreview && this.receiptPreview.downloadURL) {
            receiptData = {
                id: this.receiptPreview.id || `receipt_${Date.now()}`,
                name: this.receiptPreview.name || 'receipt.jpg',
                downloadURL: this.receiptPreview.downloadURL,
                size: this.receiptPreview.size || 0,
                type: this.receiptPreview.type || 'image/jpeg',
                uploadedAt: this.receiptPreview.uploadedAt || new Date().toISOString(),
                status: 'attached'
            };
        }
        
        // Ensure ID is a number
        const transactionId = typeof id === 'string' ? parseInt(id) || Date.now() : id;
        
        const transactionData = {
            id: transactionId,
            date,
            type,
            category,
            amount,
            description,
            paymentMethod,
            reference,
            notes,
            receipt: receiptData,
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Check if transaction exists
        const existingIndex = this.transactions ? this.transactions.findIndex(t => t.id == transactionId) : -1;
        
        try {
            if (existingIndex > -1) {
                // Update existing transaction
                this.transactions[existingIndex] = transactionData;
                console.log('📝 Updated existing transaction:', transactionId);
            } else {
                // Add new transaction
                if (!idInput?.value) {
                    transactionData.id = Date.now(); // Generate new ID for new transactions
                }
                if (!this.transactions) this.transactions = [];
                this.transactions.unshift(transactionData);
                console.log('➕ Added new transaction:', transactionData.id);
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                console.log('💾 Saved to localStorage');
            } catch (storageError) {
                console.warn('⚠️ Failed to save to localStorage:', storageError);
            }
            
            // Save to Firebase if available
            if (this.isFirebaseAvailable && window.db) {
                try {
                    const docRef = window.db.collection('transactions')
                        .doc(transactionData.id.toString());
                    
                    await docRef.set(transactionData, { merge: true });
                    console.log('✅ Transaction saved to Firebase:', transactionData.id);
                    
                    // Verify the save
                    const savedDoc = await docRef.get();
                    if (savedDoc.exists) {
                        console.log('✅ Firebase save verified');
                    }
                    
                    this.showNotification('Transaction saved successfully!', 'success');
                } catch (firebaseError) {
                    console.warn('⚠️ Firebase error:', firebaseError.message);
                    this.showNotification('Saved locally (Firebase error: ' + firebaseError.message + ')', 'warning');
                }
            } else {
                console.log('💾 Firebase not available, saved locally only');
                this.showNotification('Transaction saved locally!', 'success');
            }
            
            // Update UI
            if (typeof this.updateStats === 'function') this.updateStats();
            if (typeof this.updateTransactionsList === 'function') this.updateTransactionsList();
            if (typeof this.updateCategoryBreakdown === 'function') this.updateCategoryBreakdown();
            
            // Close modal
            if (typeof this.hideTransactionModal === 'function') {
                this.hideTransactionModal();
            }
            
            // Clear form if needed
            this.clearTransactionForm?.();
            
        } catch (error) {
            console.error('❌ Error saving transaction:', error);
            this.showNotification('Error saving transaction: ' + error.message, 'error');
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

    async deleteTransactionRecord(transactionId) {
        const transaction = this.transactions.find(t => t.id == transactionId);
        if (!transaction) return;
        
        this.transactions = this.transactions.filter(t => t.id != transactionId);
        this.saveData();
        
        if (this.isFirebaseAvailable && window.db) {
            try {
                await window.db.collection('transactions')
                    .doc(transactionId.toString())
                    .delete();
            } catch (firebaseError) {
                console.warn('Failed to delete from Firestore:', firebaseError.message);
            }
        }
        
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        
        this.showNotification('Transaction deleted successfully', 'success');
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

    // ==================== SYNC METHODS ====================
    async syncLocalTransactionsToFirebase() {
        if (!this.isOnline || !this.isFirebaseAvailable || !window.db) {
            console.log('Skipping sync - offline or Firebase unavailable');
            return;
        }
        
        console.log('🔄 Syncing local transactions to Firebase...');
        
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

    async saveTransactionToFirebase(transactionData) {
        if (!this.isFirebaseAvailable || !window.db) {
            throw new Error('Firebase not available');
        }
        
        const user = window.firebase?.auth?.().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        try {
            const transactionWithUser = {
                ...transactionData,
                userId: user.uid,
                updatedAt: new Date().toISOString()
            };
            
            await window.db.collection('transactions')
                .doc(transactionData.id.toString())
                .set(transactionWithUser, { merge: true });
            
            console.log('✅ Saved transaction to Firebase:', transactionData.id);
            return true;
            
        } catch (error) {
            console.error('❌ Firestore save error:', error);
            throw error;
        }
    },

    // ==================== UI RENDERING ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
         /* ==================== CRITICAL MODAL FIXES ==================== */

/* 1. MODAL CONTAINER */
.popout-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.85) !important;
    backdrop-filter: blur(10px) !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    overflow: auto !important;
}

.popout-modal.hidden {
    display: none !important;
}

/* Remove the duplicate #import-receipts-modal styles - they're covered by .popout-modal above */
#import-receipts-modal {
    /* All styles moved to .popout-modal above */
}

/* 2. MODAL CONTENT */
.popout-modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    max-width: 800px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    width: 90%;
    margin: auto !important;
}

/* Specific modal sizes */
#import-receipts-modal .popout-modal-content {
    max-width: 850px;
    max-height: 90vh;
}

#transaction-modal .popout-modal-content {
    max-width: 600px;
    max-height: 85vh;
}

/* 3. GREEN GRADIENT HEADER */
.popout-modal-header {
    padding: 16px 24px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-shrink: 0 !important;
    min-height: 60px !important;
    background: linear-gradient(135deg, #22c55e, #14b8a6, #16a34a) !important;
    color: white !important;
    position: relative !important;
    border-radius: 16px 16px 0 0 !important;
    overflow: hidden !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25) !important;
}

.popout-modal-title {
    margin: 0 !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    color: white !important;
}

.popout-modal-close {
    background: none !important;
    border: none !important;
    font-size: 24px !important;
    cursor: pointer !important;
    color: white !important;
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
}

.popout-modal-close:hover {
    background: rgba(255, 255, 255, 0.2) !important;
}

/* 4. FOOTER WITH EVEN BUTTONS */
.popout-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #e5e7eb !important;
    display: flex !important;
    gap: 12px !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-shrink: 0 !important;
    background: white !important;
    width: 100% !important;
    box-sizing: border-box !important;
    min-height: 72px !important;
    border-bottom-left-radius: 16px !important;
    border-bottom-right-radius: 16px !important;
}

/* Specific modal footers */
#import-receipts-modal .popout-modal-footer {
    justify-content: space-between !important;
}

#transaction-modal .popout-modal-footer {
    justify-content: space-between !important;
}

/* 5. EQUAL BUTTON WIDTHS */
.popout-modal-footer .btn {
    flex: 1 !important;
    min-width: 0 !important;
    padding: 12px 16px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
    border: 2px solid transparent !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    height: auto !important;
    line-height: normal !important;
}

/* 6. GREEN BUTTONS (Match header) */
.popout-modal-footer .btn-primary {
    background: linear-gradient(135deg, #22c55e, #16a34a) !important;
    color: white !important;
    border-color: transparent !important;
}

.popout-modal-footer .btn-primary:hover {
    background: linear-gradient(135deg, #16a34a, #15803d) !important;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
}

/* CANCEL BUTTON - USING YOUR VARIABLES */
.popout-modal-footer .btn-outline {
    /* Use your theme variables */
    background-color: var(--modal-footer-bg) !important;
    color: var(--modal-footer-text) !important;
    border: 1px solid var(--modal-input-border) !important;
    
    /* Consistent styling */
    border-radius: var(--radius-lg) !important;
    font-weight: 600 !important;
    padding: 12px 26px !important;
    transition: var(--transition-normal) !important;
    
    /* Remove any transform that might cause flickering */
    transform: none !important;
}

.popout-modal-footer .btn-outline:hover {
    background-color: var(--modal-btn-text-hover) !important;
    border-color: var(--text-secondary) !important;
    color: var(--modal-footer-text) !important;
    /* Optional: subtle shadow instead of transform */
    box-shadow: var(--shadow-sm) !important;
}

/* Process Receipts button */
#process-receipts-btn {
    position: relative !important; /* For the badge positioning */
    overflow: visible !important; /* Let badge show outside */
}

/* Process Receipts count badge */
#process-receipts-count {
    position: absolute !important;
    top: -8px !important;
    right: -8px !important;
    background: #ef4444 !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 3px 8px !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    border: 2px solid white !important;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
    min-width: 22px !important;
    height: 22px !important;
    display: flex !important; /* ← Remove this inline display */
    align-items: center !important;
    justify-content: center !important;
    z-index: 10 !important;
}

/* Add this for hiding the badge */
#process-receipts-count.hidden {
    display: none !important;
}

#process-receipts-btn:hover {
    background: linear-gradient(135deg, #16a34a, #15803d) !important;
}

/* ========== Responsive adjustments ========== */
@media (max-width: 767px) {
    .popout-modal-footer .btn {
        padding: 14px 16px !important; /* Slightly taller on mobile */
        font-size: 15px !important;
    }
    
    .popout-modal-content {
        max-height: calc(90vh - 80px) !important;
        margin-top: 0 !important;
        width: 95% !important;
    }
    
    .popout-modal-footer {
        flex-direction: column;
    }
    
    .popout-modal-footer .btn {
        width: 100% !important;
    }
}

@media (max-width: 480px) {
    .popout-modal {
        padding-top: 50px !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
    }
    
    .popout-modal-content {
        max-height: calc(95vh - 60px) !important;
        width: 100% !important;
        border-radius: 12px !important;
    }
    
    .popout-modal-header {
        padding: 12px 16px !important;
        min-height: 56px !important;
    }
    
    .popout-modal-title {
        font-size: 16px !important;
    }
}

/* =========== Drag & drop styles =========== */
#receipt-upload-area.drag-over {
    border-color: #3b82f6 !important;
    background: rgba(59, 130, 246, 0.1) !important;
    border-style: solid !important;
}

#drop-area.drag-over {
    border-color: #3b82f6 !important;
    background: rgba(59, 130, 246, 0.1) !important;
}

.hidden {
    display: none !important;
}


                
                
                /* ==================== BASE STYLES ==================== */
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
                
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spinner { width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
                
                #upload-receipt-btn * { pointer-events: none; }
                .firebase-badge, .receipt-queue-badge { pointer-events: none; }
                
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
                
                .popout-modal {
                    z-index: 9999;
                }
                
                .receipt-preview-item {
                    background: var(--glass-bg);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    border: 1px solid var(--glass-border);
                }

                .camera-preview {
                    width: 100%;
                    height: 400px;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 20px;
                    position: relative;
                    display: block !important;
                }
                
                .camera-preview video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover;
                    display: block !important;
                    background: #000 !important;
                }
                
                #camera-section {
                    display: none;
                }
                
                #camera-section[style*="display: block"],
                #camera-section[style*="display:block"] {
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                #camera-option {
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                
                #camera-option:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .new-receipt {
                    animation: pulse 2s infinite;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, -40%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }

                .delete-receipt-btn {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .delete-receipt-btn:hover {
                    background-color: #dc2626 !important;
                    color: white !important;
                }
                .btn-danger {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                .btn-danger:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                }
                .btn-sm {
                    padding: 6px 12px;
                    font-size: 14px;
                    border-radius: 6px;
                }

                .delete-receipt-btn.deleting {
                    opacity: 0.7;
                    cursor: not-allowed;
                    background-color: #9ca3af !important;
                }

                .receipt-modal-scrollable {
                    max-height: 70vh !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                }

                .receipt-content-wrapper {
                    max-width: 800px !important;
                    margin: 0 auto !important;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    line-height: 1.5 !important;
                    font-family: monospace !important;
                    font-size: 14px !important;
                }

                .receipt-text-container {
                    overflow-x: hidden !important;
                    padding-right: 10px !important;
                }

                .receipt-modal-scrollable::-webkit-scrollbar {
                    width: 8px !important;
                }

                .receipt-modal-scrollable::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1) !important;
                    border-radius: 4px !important;
                }

                .receipt-modal-scrollable::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border-radius: 4px !important;
                }

                .receipt-modal-scrollable::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.4) !important;
                }

                @media (max-width: 768px) {
                    .receipt-modal-scrollable {
                        max-height: 80vh !important;
                        padding: 15px !important;
                    }
                    
                    .receipt-content-wrapper {
                        font-size: 12px !important;
                    }
                }

                @media (max-width: 480px) {
                    .receipt-modal-scrollable {
                        max-height: 85vh !important;
                        padding: 10px !important;
                    }
                }

                .process-receipt-btn,
                .delete-receipt-btn {
                    display: inline-flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    z-index: 10 !important;
                }

                @media (min-width: 769px) {
                    .pending-receipt-item {
                        position: relative;
                        padding-right: 200px !important;
                    }
                    
                    .receipt-actions {
                        position: absolute !important;
                        right: 16px !important;
                        top: 50% !important;
                        transform: translateY(-50%) !important;
                        display: flex !important;
                        gap: 8px !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        z-index: 100 !important;
                    }
                    
                    .receipt-actions .btn {
                        min-width: 80px !important;
                        height: 36px !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        white-space: nowrap !important;
                    }
                }

                @media (max-width: 768px) {
                    .pending-receipt-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    
                    .receipt-actions {
                        display: flex !important;
                        justify-content: flex-end;
                        gap: 8px;
                        margin-top: 12px;
                    }
                }

                .receipt-card .receipt-actions,
                .pending-receipt-item .receipt-actions {
                    overflow: visible !important;
                    clip: auto !important;
                    clip-path: none !important;
                    height: auto !important;
                    width: auto !important;
                }

                .upload-area {
                    min-height: 200px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: var(--glass-bg) !important;
                    border: 2px dashed var(--glass-border) !important;
                    border-radius: 12px !important;
                    padding: 40px 20px !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                }

                .upload-area:hover {
                    border-color: var(--primary-color) !important;
                    background: var(--primary-color)10 !important;
                }

                .upload-icon {
                    font-size: 64px !important;
                    margin-bottom: 16px !important;
                    color: var(--text-secondary) !important;
                }

                .upload-section, .camera-section, .recent-section {
                    min-height: 100px !important;
                    margin-bottom: 24px !important;
                }

                .glass-card {
                    min-height: 150px !important;
                }

                .upload-system-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    max-width: 100%;
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e5e7eb;
                }

                .upload-dropzone {
                    border: 2px dashed #d1d5db;
                    border-radius: 10px;
                    padding: 40px 20px;
                    text-align: center;
                    background: #f9fafb;
                    margin-bottom: 20px;
                    cursor: pointer;
                }

                .upload-dropzone:hover {
                    border-color: #4f46e5;
                    background: #f0f1ff;
                }

                .dropzone-icon {
                    font-size: 48px;
                    color: #9ca3af;
                    margin-bottom: 16px;
                }

                .dropzone-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #374151;
                }

                .dropzone-subtitle {
                    color: #6b7280;
                    margin-bottom: 20px;
                }

                 /* ==================== ADD THIS CROPPER CSS ==================== */
    /* Cropper touch interaction fixes */
    #receipt-cropper-modal {
        touch-action: none;
    }
    
    #receipt-cropper-image {
        touch-action: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        max-width: 100%;
        height: auto;
    }
    
    .cropper-container {
        touch-action: none !important;
        max-height: 50vh !important;
    }
    
    .cropper-crop-box,
    .cropper-drag-box,
    .cropper-face,
    .cropper-line,
    .cropper-point {
        touch-action: none !important;
    }
    
    .cropper-point {
        width: 30px !important;
        height: 30px !important;
        background: #4CAF50 !important;
        opacity: 0.8 !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
    }
    
    /* Mobile-friendly control buttons */
    .cropper-control-btn {
        min-width: 60px;
        min-height: 44px;
        font-size: 20px;
        border-radius: 8px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        cursor: pointer;
        transition: all 0.2s;
        margin: 4px;
    }
    
    .cropper-control-btn:active {
        background: #e0e0e0;
        transform: scale(0.95);
    }
    
    #cancel-receipt-crop, #apply-receipt-crop {
        min-height: 48px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    #cancel-receipt-crop {
        background: #f44336;
        color: white;
    }
    
    #apply-receipt-crop {
        background: #4CAF50;
        color: white;
    }
    
    #cancel-receipt-crop:active, #apply-receipt-crop:active {
        transform: scale(0.98);
        opacity: 0.9;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .cropper-point {
            width: 40px !important;
            height: 40px !important;
        }
        
        .cropper-control-btn {
            min-width: 70px;
            min-height: 48px;
            font-size: 22px;
        }
    }
    
    /* Cropper container sizing */
    #cropper-container {
        touch-action: none;
        background: #f0f0f0;
        min-height: 300px;
        max-height: 50vh;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
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
        `;

        this.setupEventListeners();
        this.setupReceiptFormHandlers();
        
        setTimeout(() => {
            this.setupReceiptActionListeners();
        }, 100);
    },

    renderImportReceiptsModal() {
        return `
               <div class="import-receipts-container">
                    <!-- GREEN GRADIENT HEADER -->
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #10b981, #34d399, #10b981);
                        border-radius: 20px 20px 0 0;
                        z-index: 1000 !important;
                    "></div>
                    
                    <div class="quick-actions-section" style="padding-top: 8px;">  <!-- ONLY KEEP THIS ONE -->
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
                
                <!-- UPLOAD SECTION -->
                <div id="upload-section" style="display: none;">
                    <div class="upload-system-container" id="upload-system">
                        <!-- BACK BUTTON HEADER -->
                        <div style="display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                            <button class="btn btn-outline" id="back-to-main-view" 
                                    style="display: flex; align-items: center; gap: 8px; margin-right: 16px; padding: 8px 16px;">
                                <span>←</span>
                                <span>Back</span>
                            </button>
                            <div>
                                <h3 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                                    📤 Upload Files
                                </h3>
                                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                                    Drag & drop or select files from your device
                                </p>
                            </div>
                        </div>
                        
                        <!-- Receipts Upload Section -->
                        <div class="upload-section active" data-mode="receipts">
                            <div class="upload-header" style="margin-bottom: 24px;">
                                <h3 class="upload-title">
                                    📄 Upload Receipts
                                </h3>
                                <p class="upload-subtitle">Take photos or scan receipts to track expenses</p>
                            </div>
                            
                            <div class="upload-dropzone" id="receipt-dropzone">
                                <div class="dropzone-content">
                                    <div class="dropzone-icon">
                                        📁
                                    </div>
                                    <h4 class="dropzone-title">Drop receipt files here</h4>
                                    <p class="dropzone-subtitle">or click to browse</p>
                                    <div class="file-types">
                                        <span class="file-type-badge">JPG</span>
                                        <span class="file-type-badge">PNG</span>
                                        <span class="file-type-badge">PDF</span>
                                        <span class="file-type-badge">HEIC</span>
                                    </div>
                                </div>
                                <input type="file" id="receipt-file-input" 
                                       accept="image/*,.pdf,.heic,.heif" 
                                       multiple 
                                       class="dropzone-input" style="display: none;">
                            </div>
                            
                            <div class="uploaded-files-container" style="margin-top: 24px;">
                                <h5 class="files-title">
                                    📎 Uploaded Receipts
                                    <span class="badge" id="receipt-count">0</span>
                                </h5>
                                <div class="files-list" id="receipt-files-list">
                                    <div class="empty-state">
                                        📭
                                        <p>No receipts uploaded yet</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- CAMERA SECTION -->
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
                
                <!-- RECENT SECTION -->
                <div class="recent-section" id="recent-section" style="display: block;">
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

    renderReceiptViewButton(receipt) {
    // Check if we have a viewable image
    const imageUrl = this.getReceiptImageUrl(receipt);
    
    if (imageUrl) {
        // For images, create a button that opens a modal viewer
        return `
            <button class="btn btn-sm btn-outline view-receipt-btn" 
                    data-receipt-id="${receipt.id}"
                    data-receipt-url="${this.escapeHtml(imageUrl)}"
                    data-receipt-name="${this.escapeHtml(receipt.name)}"
                    style="padding: 6px 12px;" 
                    title="View receipt">
                <span class="btn-icon">👁️</span>
                <span class="btn-text">View</span>
            </button>
        `;
    } else {
        // Fallback for PDFs or unavailable images
        return `
            <button class="btn btn-sm btn-outline" 
                    onclick="event.preventDefault(); alert('Receipt preview not available for ${this.escapeHtml(receipt.name)}');" 
                    style="padding: 6px 12px;" 
                    title="View receipt">
                <span class="btn-icon">👁️</span>
                <span class="btn-text">View</span>
            </button>
        `;
    }
},

getReceiptImageUrl(receipt) {
    // Try different possible URL sources
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

escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
},

    showReceiptViewer(imageUrl, receiptName) {
    console.log('🖼️ Showing receipt viewer for:', receiptName);
    
    // Remove any existing viewer
    const existingViewer = document.getElementById('receipt-viewer-modal');
    if (existingViewer) {
        existingViewer.remove();
    }
    
    // Create modal
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
        <div style="
            background: white;
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            cursor: default;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        ">
            <div style="
                background: linear-gradient(135deg, #22c55e, #16a34a);
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">👁️</span>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${this.escapeHtml(receiptName)}</h3>
                </div>
                <button id="close-viewer-btn" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            <div style="
                padding: 20px;
                max-height: 70vh;
                overflow: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
            ">
                <img src="${imageUrl}" 
                     alt="${this.escapeHtml(receiptName)}" 
                     style="max-width: 100%; max-height: 60vh; object-fit: contain; border-radius: 8px;">
            </div>
            <div style="
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: white;
            ">
                <button id="download-receipt-btn" style="
                    padding: 8px 20px;
                    background: #22c55e;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    📥 Download
                </button>
                <button id="close-viewer-footer-btn" style="
                    padding: 8px 20px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close button handlers
    const closeBtn = document.getElementById('close-viewer-btn');
    const closeFooterBtn = document.getElementById('close-viewer-footer-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', () => modal.remove());
    }
    
    // Download button handler
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
        
        const recentReceipts = this.receiptQueue
            .slice(0, 5)
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
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
                    const amountClass = isIncome ? 'amount-income' : 'amount-expense';
                    const icon = isIncome ? '💰' : '💸';
                    
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
                                        <span>${this.formatDate(transaction.date) || 'No date'}</span>
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
            processBtn.classList.remove('hidden'); // ← Use class instead of style
            processCount.textContent = pendingCount;
            processCount.classList.remove('hidden'); // ← Use class for count too
            processBtn.title = `Process ${pendingCount} pending receipt${pendingCount !== 1 ? 's' : ''}`;
        } else {
            processBtn.classList.add('hidden'); // ← Use class instead of style
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
        
        const date = typeof timestamp === 'string' ? new Date(timestamp) : 
                    timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
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
            ${recentTransactions.map(t => 
                `${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${this.formatCurrency(t.amount)} | ${t.description}`
            ).join('\n')}
            
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
        Object.entries(incomeByCategory).forEach(([category, amount]) => {
            breakdown += `  ${category}: ${this.formatCurrency(amount)}\n`;
        });
        
        breakdown += '\nEXPENSES:\n';
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            breakdown += `  ${category}: ${this.formatCurrency(amount)}\n`;
        });
        
        return breakdown;
    },

    generateCategoryAnalysis() {
        const modalContent = `
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title">📊 Category Analysis</h3>
                    <button class="popout-modal-close" id="close-category-analysis">&times;</button>
                </div>
                <div class="popout-modal-body">
                    ${this.renderCategoryBreakdown()}
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="export-category-analysis">Export as CSV</button>
                    <button class="btn-primary" id="close-category-btn">Close</button>
                </div>
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
        
        Object.entries(incomeByCategory).forEach(([category, amount]) => {
            csv += `"${category}",income,${amount}\n`;
        });
        
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            csv += `"${category}",expense,${amount}\n`;
        });
        
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

    // Add this right before the final closing brace of IncomeExpensesModule
unload() {
    console.log('📦 Unloading Income & Expenses module...');
    
    // Stop camera if active
    this.stopCamera();
    
    // Remove event listeners
    if (this._globalClickHandler) {
        document.removeEventListener('click', this._globalClickHandler);
        this._globalClickHandler = null;
    }
    if (this._globalChangeHandler) {
        document.removeEventListener('change', this._globalChangeHandler);
        this._globalChangeHandler = null;
    }
    
    // Hide any open modals
    this.hideAllModals();
    
    // Clean up file input if created
    const fileInput = document.getElementById('receipt-upload-input');
    if (fileInput && fileInput.hasAttribute('data-dynamic')) {
        fileInput.remove();
    }

    // Clean up real-time listener
    if (this.realtimeUnsubscribe) {
        this.realtimeUnsubscribe();
        this.realtimeUnsubscribe = null;
    }
    
    // Reset state
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

// MAKE IT GLOBAL - ADD THIS LINE!
window.IncomeExpensesModule = IncomeExpensesModule;

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



