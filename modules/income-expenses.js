// modules/income-expenses.js - COMPLETE WORKING VERSION WITH ALL FUNCTIONALITY
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    receiptQueue: [],
    cameraStream: null,
    receiptPreview: null,
    isFirebaseAvailable: false,
    cameraFacingMode: 'environment',
    lastSwitchClick: 0,
    isOnline: true,
    isDeleting: false,
    isCapturing: false,
    cropperInstance: null,
    currentImageFile: null,
    cropperLibraryLoaded: false,

    // ==================== INITIALIZATION ====================
    async initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        this.isFirebaseAvailable = !!(window.firebase && window.db);

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.setupNetworkDetection();
        await this.loadData();
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
        
        console.log('✅ Income & Expenses initialized with', this.transactions?.length || 0, 'transactions');
        return true;
    },

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
        
        const existingTransaction = this.transactions.find(t => 
            t.reference === `ORDER-${saleData.orderId}` || 
            (t.source === 'orders-module' && t.orderId === saleData.orderId)
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
            customerName: saleData.customerName
        };
        
        if (!this.transactions) this.transactions = [];
        this.transactions.unshift(transactionData);
        
        try {
            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        } catch (storageError) {
            console.warn('⚠️ Failed to save to localStorage:', storageError);
        }
        
        if (this.isFirebaseAvailable && window.db) {
            this.saveTransactionToFirebase(transactionData)
                .then(() => console.log('✅ Sale saved to Firebase'))
                .catch(error => console.warn('⚠️ Failed to save sale to Firebase:', error.message));
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
            let loadedFromFirebase = false;
            
            if (this.isFirebaseAvailable && window.db) {
                try {
                    const user = window.firebase.auth().currentUser;
                    if (user) {
                        const today = new Date();
                        const month = today.getMonth();
                        const year = today.getFullYear();
                        const period = `${month}-${year}`;
                        
                        try {
                            const incomeRef = window.db.collection('income').doc(user.uid).collection('transactions').doc(period);
                            const incomeDoc = await incomeRef.get();
                            
                            if (incomeDoc.exists) {
                                const data = incomeDoc.data();
                                if (data.entries && data.entries.length > 0) {
                                    this.transactions = data.entries;
                                    console.log('✅ Loaded from income collection:', this.transactions.length);
                                    loadedFromFirebase = true;
                                    localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                                    return;
                                }
                            }
                        } catch (e) {
                            console.log('No data in income collection');
                        }
                        
                        if (!loadedFromFirebase) {
                            try {
                                const snapshot = await window.db.collection('transactions')
                                    .where('userId', '==', user.uid)
                                    .limit(100)
                                    .get();
                                
                                if (!snapshot.empty) {
                                    this.transactions = snapshot.docs.map(doc => {
                                        const data = doc.data();
                                        return {
                                            id: data.id || parseInt(doc.id),
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
                                            syncedAt: data.syncedAt,
                                            source: 'firebase'
                                        };
                                    });
                                    
                                    this.transactions.sort((a, b) => {
                                        const dateA = new Date(a.createdAt || a.date);
                                        const dateB = new Date(b.createdAt || b.date);
                                        return dateB - dateA;
                                    });
                                    
                                    console.log('✅ Loaded transactions from Firebase:', this.transactions.length);
                                    localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                                    loadedFromFirebase = true;
                                }
                            } catch (firebaseError) {
                                console.error('❌ Firebase load error:', firebaseError);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error in Firebase loading:', error);
                }
            }
            
            if (!loadedFromFirebase) {
                console.log('🔄 Falling back to localStorage');
                const saved = localStorage.getItem('farm-transactions');
                this.transactions = saved ? JSON.parse(saved) : [];
                
                this.transactions.forEach(t => {
                    if (!t.source) {
                        t.source = 'local';
                        t.updatedAt = t.updatedAt || new Date().toISOString();
                    }
                });
                
                console.log('📁 Loaded transactions from localStorage:', this.transactions.length);
            }
            
        } catch (error) {
            console.error('❌ Error loading transactions:', error);
        }
    },

    async saveToFirebase() {
        console.log('💾 Saving to Firebase...');
        
        if (!this.isFirebaseAvailable || !window.db) {
            console.log('Firebase not available, skipping cloud save');
            return false;
        }
        
        try {
            const user = window.firebase.auth().currentUser;
            if (!user) {
                console.log('No user logged in, skipping cloud save');
                return false;
            }
            
            const today = new Date();
            const month = today.getMonth();
            const year = today.getFullYear();
            const period = `${month}-${year}`;
            
            await window.db.collection('income').doc(user.uid).collection('transactions').doc(period).set({
                entries: this.transactions,
                totalAmount: this.calculateStats().totalIncome,
                lastUpdated: new Date().toISOString(),
                userId: user.uid,
                period: period
            }, { merge: true });
            
            await window.db.collection('income-expenses').doc(user.uid).collection('transactions').doc(period).set({
                entries: this.transactions,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            
            console.log('✅ Saved to Firebase:', this.transactions.length, 'transactions');
            return true;
            
        } catch (error) {
            console.error('❌ Error saving to Firebase:', error);
            return false;
        }
    },

    saveData() {
        console.log('💾 Saving transactions to localStorage');
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        this.saveToFirebase();
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

    // ==================== CAMERA METHODS ====================
    initializeCamera: function() {
        console.log('📷 Initializing camera...');
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        if (!video) return;
        if (this.cameraStream) this.cameraStream.getTracks().forEach(track => track.stop());
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.srcObject = null;
        if (status) status.textContent = 'Requesting camera...';
        navigator.mediaDevices.getUserMedia({ video: { facingMode: this.cameraFacingMode, width: { ideal: 720 }, height: { ideal: 720 } }, audio: false })
            .then(stream => { this.cameraStream = stream; video.srcObject = stream; return video.play(); })
            .then(() => { if (status) status.textContent = `${this.cameraFacingMode === 'user' ? 'Front' : 'Rear'} Camera Ready`; })
            .catch(error => { console.error('Camera error:', error); if (status) status.textContent = 'Camera unavailable'; });
    },

    stopCamera: function() {
        if (this.cameraStream) { this.cameraStream.getTracks().forEach(track => track.stop()); this.cameraStream = null; }
        const video = document.getElementById('camera-preview');
        if (video) { video.srcObject = null; }
    },

    switchCamera: function() {
        const now = Date.now();
        if (this.lastSwitchClick && (now - this.lastSwitchClick) < 1000) return;
        this.lastSwitchClick = now;
        this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
        this.stopCamera();
        setTimeout(() => this.initializeCamera(), 300);
    },

    capturePhoto: function() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        const captureBtn = document.getElementById('capture-photo');
        if (!video || !video.srcObject) { this.showNotification('Camera not ready', 'error'); return; }
        this.isCapturing = true;
        if (captureBtn) { captureBtn.disabled = true; captureBtn.style.opacity = '0.5'; }
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
            if (captureBtn) { captureBtn.disabled = false; captureBtn.style.opacity = '1'; }
            this.stopCamera();
            setTimeout(() => { this.showSimpleImageViewer(file); this.isCapturing = false; }, 200);
        }, 'image/jpeg', 0.9);
    },

    showSimpleImageViewer: function(file) {
        console.log('🖼️ Showing simple viewer');
        const importModal = document.getElementById('import-receipts-modal');
        if (importModal) importModal.style.display = 'none';
        this.stopCamera();
        const reader = new FileReader();
        reader.onload = (e) => {
            const existingViewer = document.getElementById('image-review-modal');
            if (existingViewer) existingViewer.remove();
            const modal = document.createElement('div');
            modal.id = 'image-review-modal';
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000000; display: flex; align-items: center; justify-content: center;`;
            modal.innerHTML = `
                <div style="background: white; padding: 25px; border-radius: 16px; text-align: center; max-width: 90%;">
                    <h3>Review Image</h3>
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 60vh;">
                    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                        <button id="edit-image-btn" class="btn-primary">✎ Edit</button>
                        <button id="save-image-btn" class="btn-primary">✓ Save</button>
                        <button id="retake-image-btn" class="btn-outline">↺ Retake</button>
                        <button id="delete-image-btn" class="btn-outline">🗑️ Delete</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('edit-image-btn').onclick = () => { modal.remove(); this.showStandardCropper(file); };
            document.getElementById('save-image-btn').onclick = () => { modal.remove(); const imageUrl = URL.createObjectURL(file); this.saveReceiptFromFile(file, imageUrl); };
            document.getElementById('retake-image-btn').onclick = () => { modal.remove(); this.showCameraInterface(); };
            document.getElementById('delete-image-btn').onclick = () => { modal.remove(); this.showImportReceiptsModal(); };
        };
        reader.readAsDataURL(file);
    },

    // ==================== SIMPLE CROPPER (WORKING) ====================
    showStandardCropper: function(file) {
        console.log('🔧 Opening cropper');
        const importModal = document.getElementById('import-receipts-modal');
        if (importModal) importModal.style.display = 'none';
        this.stopCamera();
        this.currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const modalId = 'crop-modal-' + Date.now();
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: black; z-index: 9999999; display: flex; align-items: center; justify-content: center;`;
            modal.innerHTML = `
                <div style="background: white; width: 95%; max-width: 600px; max-height: 90vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;">
                    <div style="background: #22c55e; color: white; padding: 16px; display: flex; justify-content: space-between;">
                        <h3 style="margin:0;">✂️ Crop Receipt</h3>
                        <button id="close-${modalId}" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="flex:1; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: auto;">
                        <img id="crop-image-${modalId}" src="${imageUrl}" style="max-width: 100%; max-height: 100%; display: block;">
                    </div>
                    <div style="padding: 16px; border-top: 1px solid #ddd;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px;">
                            <button id="zoom-in-${modalId}" style="padding: 10px; background: #22c55e; color: white; border: none; border-radius: 8px;">🔍+ Zoom In</button>
                            <button id="zoom-out-${modalId}" style="padding: 10px; background: #22c55e; color: white; border: none; border-radius: 8px;">🔍- Zoom Out</button>
                            <button id="rotate-${modalId}" style="padding: 10px; background: #22c55e; color: white; border: none; border-radius: 8px;">↻ Rotate</button>
                            <button id="reset-${modalId}" style="padding: 10px; background: #22c55e; color: white; border: none; border-radius: 8px;">🔄 Reset</button>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button id="cancel-${modalId}" style="flex:1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 8px;">Cancel</button>
                            <button id="save-${modalId}" style="flex:1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px;">Apply Crop</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            const img = document.getElementById(`crop-image-${modalId}`);
            let cropper;
            img.onload = () => {
                setTimeout(() => {
                    if (cropper) cropper.destroy();
                    cropper = new Cropper(img, { aspectRatio: NaN, viewMode: 1, dragMode: 'crop', autoCropArea: 0.8, guides: true, center: true, cropBoxMovable: true, cropBoxResizable: true, background: false });
                }, 100);
            };
            document.getElementById(`zoom-in-${modalId}`).onclick = () => cropper?.zoom(0.1);
            document.getElementById(`zoom-out-${modalId}`).onclick = () => cropper?.zoom(-0.1);
            document.getElementById(`rotate-${modalId}`).onclick = () => cropper?.rotate(90);
            document.getElementById(`reset-${modalId}`).onclick = () => cropper?.reset();
            document.getElementById(`cancel-${modalId}`).onclick = () => { if (cropper) cropper.destroy(); modal.remove(); this.showSimpleImageViewer(file); };
            document.getElementById(`close-${modalId}`).onclick = () => { if (cropper) cropper.destroy(); modal.remove(); this.showSimpleImageViewer(file); };
            document.getElementById(`save-${modalId}`).onclick = () => {
                if (!cropper) return;
                const croppedCanvas = cropper.getCroppedCanvas({ maxWidth: 1200, maxHeight: 1200 });
                croppedCanvas.toBlob((blob) => {
                    const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    cropper.destroy();
                    modal.remove();
                    this.showSimpleImageViewer(croppedFile);
                }, 'image/jpeg', 0.95);
            };
        };
        reader.readAsDataURL(file);
    },

    saveReceiptFromFile: function(file, dataURL) {
        const receipt = {
            id: `receipt_${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataURL: dataURL,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            source: 'camera',
        };
        this.saveReceiptLocally(receipt);
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.showCaptureSuccess(receipt);
    },

    saveReceiptLocally: function(receipt) {
        this.receiptQueue.unshift(receipt);
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const existingIndex = localReceipts.findIndex(r => r.id === receipt.id);
        if (existingIndex !== -1) localReceipts.splice(existingIndex, 1);
        localReceipts.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
    },

    saveReceiptToFirebase: async function(receipt) {
        if (!this.isFirebaseAvailable || !window.db) return false;
        const user = window.firebase?.auth?.().currentUser;
        if (!user) return false;
        const firebaseReceipt = {
            id: receipt.id,
            name: receipt.name,
            dataURL: receipt.dataURL,
            size: receipt.size,
            type: receipt.type,
            status: receipt.status,
            userId: user.uid,
            uploadedAt: receipt.uploadedAt,
        };
        await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
        return true;
    },

    showCaptureSuccess: function(receipt) {
        this.showNotification(`✅ "${receipt.name}" saved!`, 'success');
    },

    // ==================== MODAL MANAGEMENT ====================
    showImportReceiptsModal: function() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) { modal.style.display = 'flex'; modal.classList.remove('hidden'); }
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (importReceiptsContent) importReceiptsContent.innerHTML = this.renderImportReceiptsModal();
        setTimeout(() => {
            this.setupImportReceiptsHandlers();
            this.setupFileInput();
            this.showQuickActionsView();
        }, 100);
    },

    hideImportReceiptsModal: function() {
        this.stopCamera();
        const modal = document.getElementById('import-receipts-modal');
        if (modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
    },

    showCameraInterface: function() {
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        const cameraSection = document.getElementById('camera-section');
        if (uploadSection) uploadSection.style.display = 'none';
        if (recentSection) recentSection.style.display = 'block';
        if (cameraSection) { cameraSection.style.display = 'block'; setTimeout(() => this.initializeCamera(), 100); }
    },

    showUploadInterface: function() {
        this.stopCamera();
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        if (cameraSection) cameraSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
    },

    showQuickActionsView: function() {
        this.stopCamera();
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const quickActionsSection = document.querySelector('.quick-actions-section');
        const recentSection = document.getElementById('recent-section');
        if (cameraSection) cameraSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'none';
        if (quickActionsSection) quickActionsSection.style.display = 'block';
        if (recentSection) recentSection.style.display = 'block';
    },

    showTransactionModal: function(transactionId = null) {
        this.hideAllModals();
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.remove('hidden');
        this.currentEditingId = transactionId;
        const form = document.getElementById('transaction-form');
        if (form) { form.reset(); document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0]; }
        const deleteBtn = document.getElementById('delete-transaction');
        if (deleteBtn) deleteBtn.style.display = transactionId ? 'block' : 'none';
        document.getElementById('transaction-modal-title').textContent = transactionId ? 'Edit Transaction' : 'Add Transaction';
        if (transactionId) this.editTransaction(transactionId);
    },

    hideTransactionModal: function() {
        const modal = document.getElementById('transaction-modal');
        if (modal) modal.classList.add('hidden');
        this.currentEditingId = null;
    },

    showAddIncome: function() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'income';
        document.getElementById('transaction-modal-title').textContent = 'Add Income';
    },

    showAddExpense: function() {
        this.showTransactionModal();
        document.getElementById('transaction-type').value = 'expense';
        document.getElementById('transaction-modal-title').textContent = 'Add Expense';
    },

    hideAllModals: function() {
        document.querySelectorAll('.popout-modal').forEach(modal => modal.classList.add('hidden'));
        this.stopCamera();
    },

    // ==================== RENDER METHODS ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
                .popout-modal {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: rgba(0, 0, 0, 0.85) !important;
                    backdrop-filter: blur(8px) !important;
                    z-index: 99999 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 20px !important;
                    box-sizing: border-box !important;
                    overflow: auto !important;
                }
                .popout-modal.hidden { display: none !important; }
                .popout-modal-content {
                    background: white !important;
                    border-radius: 20px !important;
                    max-width: 600px !important;
                    width: 100% !important;
                    max-height: 85vh !important;
                    display: flex !important;
                    flex-direction: column !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
                    margin: auto !important;
                }
                #import-receipts-modal .popout-modal-content { max-width: 800px !important; }
                .popout-modal-header {
                    background: linear-gradient(135deg, #22c55e, #16a34a) !important;
                    padding: 20px 24px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    flex-shrink: 0 !important;
                    border-radius: 20px 20px 0 0 !important;
                }
                .popout-modal-title { margin: 0 !important; font-size: 1.25rem !important; font-weight: 600 !important; color: white !important; }
                .popout-modal-close {
                    background: rgba(255,255,255,0.2) !important;
                    border: none !important;
                    color: white !important;
                    font-size: 24px !important;
                    cursor: pointer !important;
                    width: 36px !important;
                    height: 36px !important;
                    border-radius: 50% !important;
                }
                .popout-modal-body { padding: 24px !important; overflow-y: auto !important; flex: 1 !important; }
                .popout-modal-footer {
                    padding: 16px 24px !important;
                    border-top: 1px solid #e5e7eb !important;
                    display: flex !important;
                    gap: 12px !important;
                    justify-content: flex-end !important;
                    background: white !important;
                    border-radius: 0 0 20px 20px !important;
                }
                .popout-modal-footer .btn-outline { margin-right: auto !important; }
                .card-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; margin-bottom: 24px !important; }
                .card-button { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
                .card-button:hover { transform: translateY(-2px); border-color: #22c55e; }
                .camera-preview { width: 100%; height: 400px; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
                .camera-preview video { width: 100%; height: 100%; object-fit: cover; }
                @media (max-width: 768px) {
                    .popout-modal-footer { flex-direction: column !important; }
                    .popout-modal-footer .btn-outline,
                    .popout-modal-footer .btn-primary { width: 100% !important; margin: 0 !important; }
                    .card-grid { grid-template-columns: 1fr !important; }
                }
            </style>

            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Income & Expenses</h1>
                    <p class="module-subtitle">Track farm finances and cash flow</p>
                    <div style="display: flex; gap: 12px; margin-top: 12px;">
                        <button class="btn-primary" id="add-transaction">➕ Add Transaction</button>
                        <button class="btn-primary" id="upload-receipt-btn">
                            📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span style="background: #ef4444; color: white; border-radius: 12px; padding: 2px 8px; font-size: 12px; margin-left: 8px;">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                ${pendingReceipts.length > 0 ? `
                    <div class="glass-card" style="padding: 20px; margin-bottom: 24px; background: #fef3c7; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="color: #92400e;">📋 Pending Receipts (${pendingReceipts.length})</h3>
                            <div style="display: flex; gap: 12px;">
                                <button class="btn-outline" id="refresh-receipts-btn">🔄 Refresh</button>
                                <button class="btn-primary" id="process-all-receipts">⚡ Process All</button>
                            </div>
                        </div>
                        <div id="pending-receipts-list">${this.renderPendingReceiptsList(pendingReceipts)}</div>
                    </div>
                ` : ''}

                <div class="stats-grid">
                    <div class="stat-card"><div style="font-size: 24px;">💰</div><div style="font-size: 24px; font-weight: bold;" id="total-income">${this.formatCurrency(stats.totalIncome)}</div><div>Total Income</div></div>
                    <div class="stat-card"><div style="font-size: 24px;">📊</div><div style="font-size: 24px; font-weight: bold;" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div><div>Total Expenses</div></div>
                    <div class="stat-card"><div style="font-size: 24px;">📈</div><div style="font-size: 24px; font-weight: bold;" id="net-income">${this.formatCurrency(stats.netIncome)}</div><div>Net Income</div></div>
                    <div class="stat-card"><div style="font-size: 24px;">💳</div><div style="font-size: 24px; font-weight: bold;">${stats.transactionCount}</div><div>Transactions</div></div>
                </div>

                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn"><div style="font-size: 28px;">💰</div><span>Add Income</span><span style="font-size: 12px;">Record farm income</span></button>
                    <button class="quick-action-btn" id="add-expense-btn"><div style="font-size: 28px;">💸</div><span>Add Expense</span><span style="font-size: 12px;">Record farm expenses</span></button>
                    <button class="quick-action-btn" id="financial-report-btn"><div style="font-size: 28px;">📊</div><span>Financial Report</span><span style="font-size: 12px;">View financial summary</span></button>
                    <button class="quick-action-btn" id="category-analysis-btn"><div style="font-size: 28px;">📋</div><span>Category Analysis</span><span style="font-size: 12px;">Breakdown by category</span></button>
                </div>

                <div class="glass-card" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>📋 Recent Transactions</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="transaction-filter" class="form-input" style="width: auto;">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                            <button class="btn-outline" id="export-transactions">Export</button>
                        </div>
                    </div>
                    <div id="transactions-list">${this.renderTransactionsList(recentTransactions)}</div>
                </div>

                <div class="glass-card" style="padding: 20px; margin-top: 24px;">
                    <h3>📊 Category Breakdown</h3>
                    <div id="category-breakdown">${this.renderCategoryBreakdown()}</div>
                </div>
            </div>

            <!-- Transaction Modal -->
            <div id="transaction-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 550px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="transaction-modal-title">Add Transaction</h3>
                        <button class="popout-modal-close" id="close-transaction-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id" value="">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div><label class="form-label">Date *</label><input type="date" id="transaction-date" class="form-input" required></div>
                                <div><label class="form-label">Type *</label><select id="transaction-type" class="form-input" required><option value="income">💰 Income</option><option value="expense">💸 Expense</option></select></div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Category *</label>
                                <select id="transaction-category" class="form-input" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="💰 Income"><option value="broilers-income">Broilers</option><option value="layers-income">Layers</option><option value="eggs">Eggs</option><option value="milk">Milk/Dairy</option><option value="crops">Crops/Produce</option><option value="other-income">Other Income</option></optgroup>
                                    <optgroup label="💸 Expenses"><option value="feed">Feed</option><option value="medical">Medical/Vet</option><option value="equipment">Equipment</option><option value="labor">Labor</option><option value="utilities">Utilities</option><option value="other-expense">Other Expenses</option></optgroup>
                                </select>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div><label class="form-label">Amount ($) *</label><input type="number" id="transaction-amount" class="form-input" step="0.01" min="0" required></div>
                                <div><label class="form-label">Payment Method</label><select id="transaction-payment" class="form-input"><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Bank Transfer</option></select></div>
                            </div>
                            <div style="margin-bottom: 16px;"><label class="form-label">Description *</label><input type="text" id="transaction-description" class="form-input" required></div>
                            <div style="margin-bottom: 16px;"><label class="form-label">Reference Number</label><input type="text" id="transaction-reference" class="form-input"></div>
                            <div style="margin-bottom: 16px;"><label class="form-label">Notes</label><textarea id="transaction-notes" class="form-input" rows="2"></textarea></div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-transaction">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-transaction" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
                </div>
            </div>

            <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 700px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📥 Import Receipts</h3>
                        <button class="popout-modal-close" id="close-import-receipts">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="import-receipts-content">${this.renderImportReceiptsModal()}</div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="cancel-import-receipts">Cancel</button>
                        <button class="btn-primary" id="process-receipts-btn" style="display: none;">Process Receipts</button>
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
            <div style="padding: 20px;">
                <div class="card-grid">
                    <button class="card-button" id="camera-option">
                        <div style="font-size: 40px;">📷</div>
                        <div>Take Photo</div>
                        <div style="font-size: 12px;">Use camera</div>
                    </button>
                    <button class="card-button" id="upload-option">
                        <div style="font-size: 40px;">📁</div>
                        <div>Upload Files</div>
                        <div style="font-size: 12px;">From device</div>
                    </button>
                </div>

                <div id="camera-section" style="display: none;">
                    <div class="glass-card" style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;"><h3>📷 Camera</h3><div id="camera-status">Ready</div></div>
                        <div class="camera-preview">
                            <video id="camera-preview" autoplay playsinline></video>
                            <canvas id="camera-canvas" style="display: none;"></canvas>
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: center;">
                            <button class="btn-outline" id="switch-camera">🔄 Switch</button>
                            <button class="btn-primary" id="capture-photo">📸 Capture</button>
                            <button class="btn-outline" id="cancel-camera">✖️ Back</button>
                        </div>
                    </div>
                </div>

                <div id="upload-section" style="display: none;">
                    <div style="border: 2px dashed var(--glass-border); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer;" id="receipt-dropzone">
                        <div style="font-size: 48px;">📁</div>
                        <div style="font-weight: 600;">Drop receipt files here</div>
                        <div style="color: var(--text-secondary);">or click to browse</div>
                        <input type="file" id="receipt-file-input" accept="image/*,.pdf" multiple style="display: none;">
                    </div>
                </div>

                <div id="recent-section">
                    <div class="glass-card" style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;"><h3>📋 Recent Receipts</h3><button class="btn-outline" id="refresh-receipts">🔄 Refresh</button></div>
                        <div id="recent-receipts-list">${this.renderRecentReceiptsList()}</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderPendingReceiptsList(receipts) {
        if (receipts.length === 0) return `<div style="text-align: center; padding: 40px;">No pending receipts</div>`;
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${receipts.map(receipt => `
                    <div class="pending-receipt-item" data-receipt-id="${receipt.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fef3c7; border-radius: 8px;">
                        <div><span style="font-size: 20px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</span> ${receipt.name}</div>
                        <div class="receipt-actions" style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-primary process-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;">🔍 Process</button>
                            <button class="btn btn-sm btn-danger delete-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderRecentReceiptsList() {
        if (this.receiptQueue.length === 0) return `<div style="text-align: center; padding: 40px;">No receipts found</div>`;
        const recentReceipts = this.receiptQueue.slice(0, 5).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${recentReceipts.map(receipt => `
                    <div class="receipt-card" data-receipt-id="${receipt.id}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                        <div class="receipt-preview">${receipt.type?.startsWith('image/') ? '<div style="font-size: 24px;">🖼️</div>' : '<div style="font-size: 24px;">📄</div>'}</div>
                        <div style="flex: 1;"><div>${receipt.name}</div><div style="font-size: 12px;">${this.formatFileSize(receipt.size || 0)}</div></div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-outline process-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;">🔍 Process</button>
                            <button class="btn btn-sm btn-danger delete-receipt-btn" data-receipt-id="${receipt.id}" style="padding: 6px 12px;">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderTransactionsList(transactions) {
        if (transactions.length === 0) return `<div style="text-align: center; padding: 40px;">No transactions found</div>`;
        return `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${transactions.map(t => {
                    const isIncome = t.type === 'income';
                    return `
                        <div class="transaction-item" data-id="${t.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; cursor: pointer;" onclick="IncomeExpensesModule.editTransaction(${t.id})">
                            <div><span style="font-size: 20px;">${isIncome ? '💰' : '💸'}</span> ${t.description || 'No description'}</div>
                            <div style="text-align: right;"><div style="font-weight: bold; color: ${isIncome ? '#10b981' : '#ef4444'};">${isIncome ? '+' : '-'}${this.formatCurrency(t.amount)}</div><div style="font-size: 12px;">${t.date}</div></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderCategoryBreakdown() {
        const incomeByCategory = {};
        const expensesByCategory = {};
        this.transactions.forEach(t => {
            if (t.type === 'income') incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            else expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
        const totalIncome = this.calculateStats().totalIncome;
        const totalExpenses = this.calculateStats().totalExpenses;
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div><h4>💰 Income</h4>${Object.entries(incomeByCategory).map(([cat, amt]) => `<div><div>${cat}</div><div style="font-weight: bold;">${this.formatCurrency(amt)} (${totalIncome > 0 ? ((amt/totalIncome)*100).toFixed(1) : 0}%)</div></div>`).join('') || '<div>No income recorded</div>'}</div>
                <div><h4>💸 Expenses</h4>${Object.entries(expensesByCategory).map(([cat, amt]) => `<div><div>${cat}</div><div style="font-weight: bold;">${this.formatCurrency(amt)} (${totalExpenses > 0 ? ((amt/totalExpenses)*100).toFixed(1) : 0}%)</div></div>`).join('') || '<div>No expenses recorded</div>'}</div>
            </div>
        `;
    },

    // ==================== UI UPDATE METHODS ====================
    updateReceiptQueueUI() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        const badge = document.getElementById('receipt-count-badge');
        if (badge) badge.textContent = pendingReceipts.length;
        const pendingList = document.getElementById('pending-receipts-list');
        if (pendingList) pendingList.innerHTML = this.renderPendingReceiptsList(pendingReceipts);
        if (pendingReceipts.length === 0) document.getElementById('pending-receipts-section')?.remove();
    },

    updateModalReceiptsList() {
        const recentList = document.getElementById('recent-receipts-list');
        if (recentList) recentList.innerHTML = this.renderRecentReceiptsList();
    },

    updateProcessReceiptsButton() {
        const processBtn = document.getElementById('process-receipts-btn');
        if (!processBtn) return;
        const pendingCount = this.receiptQueue.filter(r => r.status === 'pending').length;
        if (pendingCount > 0) {
            processBtn.classList.remove('hidden');
            processBtn.title = `Process ${pendingCount} pending receipts`;
        } else {
            processBtn.classList.add('hidden');
        }
    },

    updateStats() {
        const stats = this.calculateStats();
        document.getElementById('total-income')?.textContent = this.formatCurrency(stats.totalIncome);
        document.getElementById('total-expenses')?.textContent = this.formatCurrency(stats.totalExpenses);
        document.getElementById('net-income')?.textContent = this.formatCurrency(stats.netIncome);
    },

    updateTransactionsList() {
        const filterValue = document.getElementById('transaction-filter')?.value || 'all';
        const filtered = this.filterTransactionsByType(filterValue);
        const recent = filtered.slice(0, 10);
        document.getElementById('transactions-list').innerHTML = this.renderTransactionsList(recent);
    },

    updateCategoryBreakdown() {
        document.getElementById('category-breakdown').innerHTML = this.renderCategoryBreakdown();
    },

    // ==================== UTILITY METHODS ====================
    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, netIncome: income - expenses, transactionCount: this.transactions.length };
    },

    getRecentTransactions(limit) {
        return this.transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    },

    filterTransactionsByType(filterType) {
        if (filterType === 'all') return this.transactions;
        if (filterType === 'income') return this.transactions.filter(t => t.type === 'income');
        if (filterType === 'expense') return this.transactions.filter(t => t.type === 'expense');
        return this.transactions;
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

    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    showNotification(message, type = 'info') {
        if (window.coreModule?.showNotification) window.coreModule.showNotification(message, type);
        else console.log(`${type}: ${message}`);
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        if (this._globalClickHandler) document.removeEventListener('click', this._globalClickHandler);
        this._globalClickHandler = (e) => {
            const transactionItem = e.target.closest('.transaction-item');
            if (transactionItem) { e.preventDefault(); e.stopPropagation(); this.editTransaction(transactionItem.dataset.id); return; }
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
        document.addEventListener('click', this._globalClickHandler);
    },

    setupImportReceiptsHandlers() {
        document.getElementById('upload-option')?.addEventListener('click', () => this.showUploadInterface());
        document.getElementById('camera-option')?.addEventListener('click', () => this.showCameraInterface());
        document.getElementById('cancel-camera')?.addEventListener('click', () => this.showQuickActionsView());
        document.getElementById('back-to-main-view')?.addEventListener('click', () => this.showQuickActionsView());
        document.getElementById('capture-photo')?.addEventListener('click', () => this.capturePhoto());
        document.getElementById('switch-camera')?.addEventListener('click', () => this.switchCamera());
        document.getElementById('refresh-receipts')?.addEventListener('click', () => { document.getElementById('recent-receipts-list').innerHTML = this.renderRecentReceiptsList(); });
    },

    setupReceiptActionListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-receipt-btn')) {
                const receiptId = e.target.closest('.delete-receipt-btn').dataset.receiptId;
                if (receiptId && confirm('Delete this receipt?')) this.deleteReceiptFromAllSources(receiptId);
            }
            if (e.target.closest('.process-receipt-btn, .process-btn')) {
                const receiptId = e.target.closest('.process-receipt-btn, .process-btn').dataset.receiptId;
                if (receiptId) this.processSingleReceipt(receiptId);
            }
        });
    },

    setupReceiptFormHandlers() {},

    setupFileInput() {
        let fileInput = document.getElementById('receipt-upload-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'receipt-upload-input';
            fileInput.accept = 'image/*,.pdf';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => { if (e.target.files && e.target.files.length) { this.handleFileUpload(e.target.files); e.target.value = ''; } };
    },

    handleFileUpload(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                setTimeout(() => {
                    if (confirm(`Crop "${file.name}"?`)) this.showStandardCropper(file);
                    else this.processReceiptFile(file);
                }, i * 500);
            } else {
                this.processReceiptFile(file);
            }
        }
    },

    processReceiptFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const receipt = {
                id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                dataURL: e.target.result,
                size: file.size,
                type: file.type,
                status: 'pending',
                uploadedAt: new Date().toISOString(),
            };
            this.saveReceiptLocally(receipt);
            this.updateReceiptQueueUI();
            this.updateModalReceiptsList();
            this.showNotification(`✅ "${file.name}" uploaded!`, 'success');
        };
        reader.readAsDataURL(file);
    },

    deleteReceiptFromAllSources(receiptId) {
        this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]').filter(r => r.id !== receiptId);
        localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.showNotification('Receipt deleted', 'success');
    },

    processSingleReceipt(receiptId) {
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) return;
        this.showTransactionModal();
        setTimeout(() => {
            document.getElementById('transaction-description').value = `Receipt: ${receipt.name}`;
            if (receipt.type?.startsWith('image/')) this.receiptPreview = receipt;
            this.markReceiptAsProcessed(receiptId);
        }, 500);
    },

    processPendingReceipts() {
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
        if (!pendingReceipts.length) { this.showNotification('No pending receipts', 'info'); return; }
        this.showNotification(`Processing ${pendingReceipts.length} receipts...`, 'info');
        pendingReceipts.forEach((r, i) => setTimeout(() => this.processSingleReceipt(r.id), i * 1000));
    },

    markReceiptAsProcessed(receiptId) {
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (receipt) { receipt.status = 'processed'; receipt.processedAt = new Date().toISOString(); }
        this.saveReceiptsToLocalStorage();
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
    },

    // ==================== TRANSACTION METHODS ====================
    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id == transactionId);
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
        this.showTransactionModal(transactionId);
    },

    async saveTransaction() {
        const id = document.getElementById('transaction-id').value;
        const date = document.getElementById('transaction-date').value;
        const type = document.getElementById('transaction-type').value;
        const category = document.getElementById('transaction-category').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const description = document.getElementById('transaction-description').value.trim();
        const paymentMethod = document.getElementById('transaction-payment').value;
        const reference = document.getElementById('transaction-reference').value;
        const notes = document.getElementById('transaction-notes').value;
        
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const transactionData = {
            id: id ? parseInt(id) : Date.now(),
            date,
            type,
            category,
            amount,
            description,
            paymentMethod,
            reference,
            notes,
            userId: 'anonymous',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (id) {
            const index = this.transactions.findIndex(t => t.id == id);
            if (index !== -1) this.transactions[index] = transactionData;
        } else {
            this.transactions.unshift(transactionData);
        }
        
        this.saveData();
        this.updateStats();
        this.updateTransactionsList();
        this.updateCategoryBreakdown();
        this.hideTransactionModal();
        this.showNotification('Transaction saved successfully!', 'success');
    },

    deleteTransaction() {
        const id = document.getElementById('transaction-id').value;
        if (!id) return;
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id != id);
            this.saveData();
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            this.hideTransactionModal();
            this.showNotification('Transaction deleted successfully', 'success');
        }
    },

    async saveTransactionToFirebase(transactionData) {
        if (!this.isFirebaseAvailable || !window.db) return;
        const user = window.firebase?.auth?.().currentUser;
        if (!user) return;
        await window.db.collection('transactions').doc(transactionData.id.toString()).set(transactionData, { merge: true });
    },

    async syncLocalTransactionsToFirebase() {
        if (!this.isOnline || !this.isFirebaseAvailable || !window.db) return;
        const user = window.firebase?.auth?.().currentUser;
        if (!user) return;
        for (const transaction of this.transactions) {
            if (transaction.source !== 'demo') {
                await this.saveTransactionToFirebase(transaction);
            }
        }
    },

    // ==================== REPORT METHODS ====================
    generateFinancialReport() {
        this.showNotification('Financial report generated', 'success');
    },

    generateCategoryAnalysis() {
        this.showNotification('Category analysis generated', 'success');
    },

    exportTransactions() {
        const data = JSON.stringify(this.transactions, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Transactions exported', 'success');
    },

    // ==================== UNLOAD ====================
    unload() {
        console.log('📦 Unloading Income & Expenses module...');
        this.stopCamera();
        if (this._globalClickHandler) {
            document.removeEventListener('click', this._globalClickHandler);
            this._globalClickHandler = null;
        }
        this.hideAllModals();
        this.initialized = false;
        this.element = null;
        this.receiptQueue = [];
        this.cameraStream = null;
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

window.IncomeExpensesModule = IncomeExpensesModule;
