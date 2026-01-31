// modules/income-expenses.js - COMPLETE FIXED VERSION
console.log('💰 Loading Income & Expenses module...');

const Broadcaster = window.DataBroadcaster || {
    recordCreated: () => {},
    recordUpdated: () => {},
    recordDeleted: () => {}
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
    
    // ==================== INITIALIZATION ====================
    initialize() {
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
        
        // Load transactions
        this.loadData();
        
        // Load receipts from Firebase
        this.loadReceiptsFromFirebase();

        // Setup global click handler for receipts
        this.setupReceiptActionListeners();
        
        // Process any pending syncs
        if (this.isFirebaseAvailable) {
            setTimeout(() => {
                this.syncLocalTransactionsToFirebase();
            }, 3000);
        }

        // Make sure receiptQueue is initialized
        this.receiptQueue = this.receiptQueue || [];
                
        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Income & Expenses updating for theme: ${theme}`);
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
            
            // Try to load from Firebase first
            if (this.isFirebaseAvailable && window.db) {
                try {
                    const user = window.firebase.auth().currentUser;
                    if (user) {
                        console.log('👤 User authenticated:', user.uid);
                        
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
                            
                            // Sort locally after loading
                            this.transactions.sort((a, b) => {
                                const dateA = new Date(a.createdAt || a.date);
                                const dateB = new Date(b.createdAt || b.date);
                                return dateB - dateA;
                            });
                            
                            console.log('✅ Loaded transactions from Firebase:', this.transactions.length);
                            
                            // Save to localStorage for offline use
                            localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                            localStorage.setItem('last-firebase-sync', new Date().toISOString());
                            
                            loadedFromFirebase = true;
                        }
                    }
                } catch (firebaseError) {
                    console.error('❌ Firebase load error:', firebaseError);
                    
                    if (firebaseError.code === 'permission-denied') {
                        this.showNotification(
                            'Firebase permission denied. Using local data for now.',
                            'warning'
                        );
                    }
                }
            }
            
            // Fallback to localStorage if Firebase failed or no data
            if (!loadedFromFirebase) {
                console.log('🔄 Falling back to localStorage');
                const saved = localStorage.getItem('farm-transactions');
                this.transactions = saved ? JSON.parse(saved) : this.getDemoData();
                
                // Add source marker for local transactions
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
            this.transactions = this.getDemoData();
            console.log('📝 Loaded demo transactions:', this.transactions.length);
        }
    },
    
    getDemoData() {
        return [
            {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                category: 'sales',
                amount: 1500,
                description: 'Corn harvest sale',
                paymentMethod: 'cash',
                reference: 'INV001',
                notes: 'First harvest of the season',
                receipt: null,
                userId: 'demo',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'demo'
            }
        ];
    },

    saveData() {
        localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
        console.log('💾 Saved transactions to localStorage:', this.transactions.length);
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

    // ==================== CAMERA METHODS ====================
    initializeCamera() {
        console.log('📷 Initializing camera...');
        
        try {
            const video = document.getElementById('camera-preview');
            const status = document.getElementById('camera-status');
            
            if (!video) {
                console.error('❌ Camera preview element not found');
                this.showNotification('Camera preview element missing', 'error');
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
            
            const constraints = {
                video: {
                    facingMode: this.cameraFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    console.log('✅ Camera access granted');
                    this.cameraStream = stream;
                    video.srcObject = stream;
                    
                    video.play()
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
                            console.error('❌ Video play error:', error);
                            this.showNotification('Failed to start camera playback', 'error');
                        });
                })
                .catch(error => {
                    console.error('❌ Camera error:', error);
                    let errorMessage = 'Camera access denied.';
                    if (error.name === 'NotFoundError') {
                        errorMessage = 'No camera found on this device.';
                    } else if (error.name === 'NotAllowedError') {
                        errorMessage = 'Camera permission denied.';
                    }
                    this.showNotification(errorMessage, 'error');
                    this.showUploadInterface();
                });
                
        } catch (error) {
            console.error('🚨 Camera initialization error:', error);
            this.showNotification('Camera initialization failed', 'error');
            this.showUploadInterface();
        }
    },

    capturePhoto() {
        console.log('📸 Capturing photo...');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        if (!video || !canvas) {
            console.error('Video or canvas element not found');
            this.showNotification('Camera elements missing', 'error');
            return;
        }
        
        if (!this.cameraStream || video.paused || video.readyState < 2) {
            console.error('Camera not ready');
            this.showNotification('Camera not ready. Please wait for camera to initialize.', 'error');
            return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        
        try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            if (status) status.textContent = 'Processing photo...';
            
            video.style.filter = 'brightness(150%) contrast(120%)';
            setTimeout(() => {
                video.style.filter = '';
            }, 200);
            
            const dataURL = canvas.toDataURL('image/jpeg', 0.85);
            
            if (status) status.textContent = 'Saving photo...';
            
            this.showCaptureLoading(true);
            
            const timestamp = Date.now();
            const receipt = this.createReceiptFromBase64(dataURL, timestamp);
            
            this.saveReceiptLocally(receipt);
            
            this.saveReceiptToFirebase(receipt)
                .then(() => {
                    if (status) status.textContent = 'Photo saved!';
                    this.showCaptureSuccess(receipt);
                    this.showNotification('✅ Receipt saved!', 'success');
                    
                    this.updateModalReceiptsList();
                    this.updateReceiptQueueUI();
                    
                    setTimeout(() => {
                        this.showCaptureLoading(false);
                        this.showUploadInterface();
                    }, 2000);
                })
                .catch(error => {
                    console.error('❌ Firebase save error:', error);
                    if (status) status.textContent = 'Saved locally';
                    this.showCaptureSuccess(receipt);
                    this.showNotification('✅ Receipt saved locally!', 'success');
                    
                    this.updateModalReceiptsList();
                    this.updateReceiptQueueUI();
                    
                    setTimeout(() => {
                        this.showCaptureLoading(false);
                        this.showUploadInterface();
                    }, 2000);
                });
            
        } catch (error) {
            console.error('❌ Capture error:', error);
            if (status) status.textContent = 'Error';
            this.showCaptureLoading(false);
            this.showNotification('Failed to capture photo', 'error');
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

    async saveReceiptToFirebase(receipt) {
        if (!this.isFirebaseAvailable || !window.db) {
            throw new Error('Firebase not available');
        }
        
        const user = window.firebase?.auth?.().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        console.log('📤 Saving receipt to Firestore (base64):', receipt.id);
        
        try {
            const firebaseReceipt = {
                id: receipt.id,
                name: receipt.name,
                base64Data: receipt.base64Data,
                size: receipt.size,
                type: receipt.type,
                status: receipt.status,
                userId: user.uid,
                uploadedAt: receipt.uploadedAt,
                storageType: 'firestore-base64',
                metadata: receipt.metadata
            };
            
            await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
            
            console.log('✅ Saved to Firestore:', receipt.id);
            return true;
            
        } catch (error) {
            console.error('❌ Firestore save error:', error);
            throw error;
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

    stopCamera() {
        console.log('🛑 Stopping camera...');
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const video = document.getElementById('camera-preview');
        if (video) {
            video.srcObject = null;
            video.pause();
        }
        
        console.log('✅ Camera stopped');
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
    handleFileUpload(files) {
        console.log('🎯 ========== handleFileUpload START ==========');
        console.log('📁 Number of files:', files.length);
        
        if (!files || files.length === 0) {
            console.log('❌ No files');
            return;
        }
        
        const file = files[0];
        console.log('📄 Processing file:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('✅ FileReader loaded successfully');
            
            try {
                const dataURL = e.target.result;
                const receiptId = 'upload_' + Date.now();
                
                const receipt = {
                    id: receiptId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataURL: dataURL,
                    status: 'pending',
                    uploadedAt: new Date().toISOString(),
                    source: 'upload'
                };
                
                console.log('📦 Receipt created:', receipt);
                
                console.log('💾 Calling saveReceiptLocally...');
                if (this.saveReceiptLocally) {
                    this.saveReceiptLocally(receipt);
                    console.log('✅ Called saveReceiptLocally');
                } else {
                    console.error('❌ saveReceiptLocally not found!');
                }
                
                console.log('🔍 Checking receiptQueue after save:', {
                    length: this.receiptQueue.length,
                    containsReceipt: this.receiptQueue.some(r => r.id === receiptId),
                    lastReceipt: this.receiptQueue[0]
                });
                
                console.log('🔄 Updating UI...');
                this.updateReceiptQueueUI();
                this.updateModalReceiptsList();
                
                console.log('🔔 Showing notification...');
                this.showNotification(`Uploaded: ${file.name}`, 'success');
                
                console.log('🪟 Showing success modal...');
                this.showSimpleSuccessModal([receipt]);
                
                console.log('✅ ========== handleFileUpload SUCCESS ==========');
                
            } catch (error) {
                console.error('❌ Error in handleFileUpload:', error);
                this.showNotification('Upload failed: ' + error.message, 'error');
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            this.showNotification('Failed to read file', 'error');
        };
        
        reader.onabort = () => {
            console.error('❌ FileReader aborted');
            this.showNotification('File reading cancelled', 'error');
        };
        
        console.log('📖 Starting FileReader readAsDataURL...');
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
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-receipt-btn')) {
                const btn = e.target.closest('.delete-receipt-btn');
                const receiptId = btn.dataset.receiptId;
                
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🗑️ Delete button clicked:', receiptId);
                    this.confirmAndDeleteReceipt(receiptId);
                }
            }
            
            if (e.target.closest('.process-receipt-btn, .process-btn')) {
                const btn = e.target.closest('.process-receipt-btn, .process-btn');
                const receiptId = btn.dataset.receiptId;
                
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔍 Process button clicked:', receiptId);
                    this.processSingleReceipt(receiptId);
                }
            }
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
    showImportReceiptsModal() {
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
            console.log('✅ Modal fully initialized');
        }, 100);
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
            const title = document.getElementById('transaction-modal-title');
            if (title) title.textContent = 'Add Transaction';
            this.clearReceiptPreview();
            
            if (transactionId) {
                setTimeout(() => this.editTransaction(transactionId), 50);
            }
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
    showQuickActionsView() {
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
    },

    showUploadInterface() {
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

    showCameraInterface() {
        console.log('📷 Showing camera interface...');
        
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        const quickActionsSection = document.querySelector('.quick-actions-section');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (quickActionsSection) quickActionsSection.style.display = 'none';
        if (cameraSection) {
            cameraSection.style.display = 'block';
            this.initializeCamera();
        }
        if (recentSection) recentSection.style.display = 'block';
        
        console.log('✅ Camera interface shown');
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
            this.showQuickActionsView();
        });

        setupModalButton('back-to-main-view', () => {
            console.log('🔙 Back to main view clicked');
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

    setupDragAndDrop() {
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
    },

    setupFileInput() {
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
    },

    setupEventListeners() {
        console.log('Setting up event listeners (event delegation)...');
        
        if (this._globalClickHandler) {
            document.removeEventListener('click', this._globalClickHandler);
            document.removeEventListener('change', this._globalChangeHandler);
        }
        
        this._globalClickHandler = (e) => {
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
        
        console.log('✅ Event delegation setup complete');
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
        
        let userId = 'anonymous';
        if (window.firebase && window.firebase.auth().currentUser) {
            userId = window.firebase.auth().currentUser.uid;
        }
        
        const id = document.getElementById('transaction-id')?.value || Date.now();
        const date = document.getElementById('transaction-date')?.value;
        const type = document.getElementById('transaction-type')?.value;
        const category = document.getElementById('transaction-category')?.value;
        const amount = parseFloat(document.getElementById('transaction-amount')?.value || 0);
        const description = document.getElementById('transaction-description')?.value || '';
        const paymentMethod = document.getElementById('transaction-payment')?.value || 'cash';
        const reference = document.getElementById('transaction-reference')?.value || '';
        const notes = document.getElementById('transaction-notes')?.value || '';
        
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        let receiptData = null;
        if (this.receiptPreview) {
            receiptData = {
                id: this.receiptPreview.id,
                name: this.receiptPreview.name,
                downloadURL: this.receiptPreview.downloadURL,
                size: this.receiptPreview.size,
                type: this.receiptPreview.type,
                uploadedAt: this.receiptPreview.uploadedAt,
                status: 'attached'
            };
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
            receipt: receiptData,
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const existingIndex = this.transactions.findIndex(t => t.id == id);
        
        try {
            if (existingIndex > -1) {
                this.transactions[existingIndex] = transactionData;
                
                localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                
                if (this.isFirebaseAvailable && window.db) {
                    try {
                        await window.db.collection('transactions')
                            .doc(id.toString())
                            .set(transactionData, { merge: true });
                        console.log('✅ Transaction updated in Firebase:', id);
                    } catch (firebaseError) {
                        console.warn('⚠️ Failed to update in Firebase:', firebaseError.message);
                        this.showNotification('Saved locally (Firebase error)', 'warning');
                    }
                }
                
                this.showNotification('Transaction updated successfully!', 'success');
                
            } else {
                transactionData.id = transactionData.id || Date.now();
                this.transactions.unshift(transactionData);
                
                localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                
                if (this.isFirebaseAvailable && window.db) {
                    try {
                        await window.db.collection('transactions')
                            .doc(transactionData.id.toString())
                            .set(transactionData);
                        console.log('✅ Transaction saved to Firebase:', transactionData.id);
                    } catch (firebaseError) {
                        console.warn('⚠️ Failed to save to Firebase:', firebaseError.message);
                        this.showNotification('Saved locally (Firebase error)', 'warning');
                    }
                }
                
                this.showNotification('Transaction saved successfully!', 'success');
            }
            
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            
            this.hideTransactionModal();
            
        } catch (error) {
            console.error('Error saving transaction:', error);
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
                #import-receipts-modal {
                    display: none !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100vh !important; /* FIXED: Use viewport height */
                    background: rgba(0, 0, 0, 0.8) !important;
                    backdrop-filter: blur(10px) !important;
                    z-index: 9999 !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                }
                
                #import-receipts-modal:not(.hidden) {
                    display: flex !important;
                }
                
                /* Center all modals */
                .popout-modal {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100vh !important; /* FIXED: Use viewport height */
                    background: rgba(0, 0, 0, 0.8) !important;
                    backdrop-filter: blur(10px) !important;
                    z-index: 9999 !important;
                    padding: 20px !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                }
                
                .popout-modal.hidden {
                    display: none !important;
                }
                
                .popout-modal-content {
                    background: var(--background-color) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                    max-width: 600px !important;
                    width: 90% !important;
                    max-height: calc(90vh - 40px) !important; /* FIXED: Account for padding */
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                    margin: auto !important;
                    position: relative !important;
                    border-top: 4px solid;
                    border-image: linear-gradient(90deg, #10b981, #34d399, #10b981) 1;
                }
                
                @media (max-width: 768px) {
                    .popout-modal-content {
                        width: 95% !important;
                        max-height: calc(85vh - 20px) !important;
                        margin: auto !important;
                    }
                    
                    #import-receipts-modal,
                    .popout-modal {
                        padding: 10px !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                }
                
                @media (max-height: 700px) {
                    .popout-modal-content {
                        max-height: calc(95vh - 40px) !important;
                    }
                }
                
                /* Drag & drop styles */
                #receipt-upload-area.drag-over {
                    border-color: #3b82f6 !important;
                    background: rgba(59, 130, 246, 0.1) !important;
                    border-style: solid !important;
                }
                
                #drop-area.drag-over {
                    border-color: #3b82f6 !important;
                    background: rgba(59, 130, 246, 0.1) !important;
                }
                
                /* GREEN GRADIENT HEADER */
                .popout-modal-header {
                    position: sticky !important;
                    top: 0 !important;
                    background: var(--glass-bg) !important;
                    z-index: 100 !important;
                    border-radius: 20px 20px 0 0 !important;
                    overflow: hidden !important;
                    padding-top: 4px !important;
                }
                
                .popout-modal-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #10b981, #34d399, #10b981);
                    z-index: 101 !important;
                }
                
                /* EVEN FOOTER BUTTONS */
                .popout-modal-footer {
                    display: flex !important;
                    gap: 12px !important;
                    padding: 16px 24px !important;
                    border-top: 1px solid var(--glass-border) !important;
                    background: var(--glass-bg) !important;
                }
                
                .popout-modal-footer .btn {
                    flex: 1 !important;
                    min-width: 0 !important;
                    padding: 12px !important;
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
                }
                
                .popout-modal-footer .btn-primary {
                    background: #10b981 !important;
                    color: white !important;
                    border-color: #10b981 !important;
                }
                
                .popout-modal-footer .btn-outline {
                    background: transparent !important;
                    color: var(--text-primary) !important;
                    border-color: var(--glass-border) !important;
                }
                
                .popout-modal-footer .btn-danger {
                    background: #fef2f2 !important;
                    color: #dc2626 !important;
                    border-color: #fecaca !important;
                }
                
                .popout-modal-footer .btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                }
                
                .popout-modal-footer .btn-primary:hover {
                    background: #0da271 !important;
                    border-color: #0da271 !important;
                }
                
                .popout-modal-footer .btn:active {
                    transform: translateY(0) !important;
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
                        <button class="btn btn-outline" id="cancel-import-receipts" style="flex: 1; min-width: 0; padding: 12px; font-size: 16px; font-weight: 600;">Cancel</button>
                        <button class="btn btn-primary" id="process-receipts-btn" style="flex: 1; min-width: 0; padding: 12px; font-size: 16px; font-weight: 600; display: none; position: relative;">
                            <span class="btn-icon">⚡</span>
                            <span class="btn-text">Process Receipts</span>
                            <span id="process-receipts-count" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 12px; padding: 3px 8px; font-size: 12px; font-weight: 700; border: 2px solid white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); min-width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                                0
                            </span>
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
                        z-index: 10;
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
                ${receipts.map(receipt => `
                    <div class="pending-receipt-item" data-receipt-id="${receipt.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div class="receipt-info" style="display: flex; align-items: center; gap: 12px;">
                            <span class="receipt-icon" style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                            <div class="receipt-details">
                                <div class="receipt-name" style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${receipt.name}</div>
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
                            ${receipt.downloadURL ? `
                                <a href="${receipt.downloadURL.startsWith('http') ? receipt.downloadURL : '#'}" 
                                           target="_blank" 
                                           class="btn btn-sm btn-outline" 
                                           title="View receipt" 
                                           style="padding: 6px 12px;"
                                           onclick="${!receipt.downloadURL.startsWith('http') ? 'event.preventDefault(); alert(\'Receipt unavailable\');' : ''}"> 
                                    <span class="btn-icon">👁️</span>
                                </a>
                            ` : ''}
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
                `).join('')}
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
                                        <span>${transaction.date || 'No date'}</span>
                                        <span>•</span>
                                        <span>${transaction.category || 'Uncategorized'}</span>
                                        <span>•</span>
                                        <span>${transaction.paymentMethod || 'Cash'}</span>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div class="${amountClass}" style="font-weight: bold; font-size: 16px; color: ${isIncome ? '#10b981' : '#ef4444'};">
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
            processBtn.style.display = 'flex';
            processCount.textContent = pendingCount;
            processCount.style.display = 'flex';
            processBtn.title = `Process ${pendingCount} pending receipt${pendingCount !== 1 ? 's' : ''}`;
        } else {
            processBtn.style.display = 'none';
            processCount.style.display = 'none';
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
    }
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

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
