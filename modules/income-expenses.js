// modules/income-expenses.js - FIXED FOR UPDATED FIREBASE RULES
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
                    
                    // SIMPLIFIED QUERY: No orderBy to avoid index requirement
                    const snapshot = await window.db.collection('transactions')
                        .where('userId', '==', user.uid)
                        .limit(100) // Just limit, no ordering
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
                            return dateB - dateA; // Newest first
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
                console.log('Error details:', {
                    code: firebaseError.code,
                    message: firebaseError.message
                });
                
                // Show user-friendly error
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
        // Ultimate fallback to demo data
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
    // ==================== FIXED: LOAD RECEIPTS FROM FIREBASE (BASE64 VERSION) ====================
async loadReceiptsFromFirebase() {
    console.log('Loading receipts from Firebase...');
    
    try {
        if (this.isFirebaseAvailable && window.db) {
            const user = window.firebase?.auth?.().currentUser;
            if (user) {
                try {
                    // SIMPLIFIED QUERY: No complex where clauses, no orderBy
                    const snapshot = await window.db.collection('receipts')
                        .where('userId', '==', user.uid)
                        .limit(50)
                        .get();
                    
                    if (!snapshot.empty) {
                        const firebaseReceipts = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            
                            // Filter for pending receipts locally
                            if (data.status === 'pending') {
                                // Convert base64 back to data URL if needed
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
                        
                        // Merge with existing receipts
                        this.mergeReceipts(firebaseReceipts);
                        
                        this.updateReceiptQueueUI();
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ Firebase receipts load error:', error.message);
                    if (error.code === 'failed-precondition') {
                        console.log('This query requires an index. Please create it in Firebase Console.');
                    }
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ General receipts load error:', error.message);
    }
    
    // Fallback to localStorage
    this.loadFromLocalStorage();
},

mergeReceipts(firebaseReceipts) {
    // Get local receipts
    const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
    
    // Create a map to avoid duplicates
    const receiptMap = new Map();
    
    // First add all Firebase receipts
    firebaseReceipts.forEach(receipt => {
        receiptMap.set(receipt.id, receipt);
    });
    
    // Then add local receipts that aren't in Firebase
    localReceipts.forEach(localReceipt => {
        if (!receiptMap.has(localReceipt.id)) {
            receiptMap.set(localReceipt.id, {
                ...localReceipt,
                source: 'local'
            });
        }
    });
    
    // Convert back to array
    this.receiptQueue = Array.from(receiptMap.values())
        .filter(r => r.status === 'pending') // Only keep pending receipts
        .sort((a, b) => {
            // Sort by upload date, newest first
            const dateA = new Date(a.uploadedAt);
            const dateB = new Date(b.uploadedAt);
            return dateB - dateA;
        });
    
    console.log('✅ Merged receipts. Total:', this.receiptQueue.length);
    
    // Save the merged list locally
    localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
},
    
    // ==================== GET RECEIPT URL HELPER ====================
getReceiptURL(receipt) {
    if (!receipt) return '';
    
    // If we already have a dataURL, use it
    if (receipt.dataURL) return receipt.dataURL;
    
    // If we have base64Data, convert it
    if (receipt.base64Data && receipt.type) {
        return `data:${receipt.type};base64,${receipt.base64Data}`;
    }
    
    // Fallback to downloadURL
    return receipt.downloadURL || '';
},

// Update the receipt preview method to use this:
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
    
    // Get the image URL
    const imageURL = this.getReceiptURL(receipt);
    
    // Show image preview if it's an image
    if (receipt.type?.startsWith('image/') && receiptImage && imagePreview && imageURL) {
        receiptImage.src = imageURL;
        imagePreview.classList.remove('hidden');
    } else if (imagePreview) {
        imagePreview.classList.add('hidden');
    }
},
    
    loadFromLocalStorage() {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        this.receiptQueue = localReceipts.filter(r => r.status === 'pending');
        console.log('📁 Loaded receipts from localStorage:', this.receiptQueue.length);
        this.updateReceiptQueueUI();
    },

    cleanupBrokenReceipts() {
        console.log('🔄 Checking for broken receipts...');
        
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const validReceipts = localReceipts.filter(r => 
            r.downloadURL && (r.downloadURL.startsWith('data:') || r.downloadURL.startsWith('http'))
        );
        
        if (validReceipts.length !== localReceipts.length) {
            localStorage.setItem('local-receipts', JSON.stringify(validReceipts));
            console.log(`🗑️ Cleaned up ${localReceipts.length - validReceipts.length} broken receipts`);
        }
        
        this.receiptQueue = this.receiptQueue.filter(r => 
            r.downloadURL && (r.downloadURL.startsWith('data:') || r.downloadURL.startsWith('http'))
        );
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
            
            // Clear any existing video
            video.srcObject = null;
            video.pause();
            
            // Stop any existing stream
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

// ==================== FIXED CAMERA CAPTURE WITH BASE64 ====================
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
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    
    try {
        // Capture frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (status) status.textContent = 'Processing photo...';
        
        // Flash effect
        video.style.filter = 'brightness(150%) contrast(120%)';
        setTimeout(() => {
            video.style.filter = '';
        }, 200);
        
        // Convert to Data URL (Base64)
        const dataURL = canvas.toDataURL('image/jpeg', 0.85);
        
        if (status) status.textContent = 'Saving photo...';
        
        // Show loading
        this.showCaptureLoading(true);
        
        // Generate receipt data
        const timestamp = Date.now();
        const receipt = this.createReceiptFromBase64(dataURL, timestamp);
        
        // Save locally first
        this.saveReceiptLocally(receipt);
        
        // Try to save to Firebase in background
        this.saveReceiptToFirebase(receipt)
            .then(() => {
                if (status) status.textContent = 'Photo saved!';
                this.showCaptureSuccess(receipt);
                this.showNotification('✅ Receipt saved!', 'success');
                
                // Update UI
                this.updateModalReceiptsList();
                this.updateReceiptQueueUI();
                
                // Return to upload view
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
                
                // Update UI even if Firebase fails
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

// ==================== CREATE RECEIPT FROM BASE64 ====================
createReceiptFromBase64(dataURL, timestamp) {
    // Extract base64 data from data URL
    const base64Data = dataURL.split(',')[1];
    
    // Calculate approximate size (1 character ≈ 1 byte for base64)
    const approxSize = Math.floor(base64Data.length * 0.75);
    
    const receiptId = `camera_${timestamp}`;
    
    return {
        id: receiptId,
        name: `receipt_${timestamp}.jpg`,
        base64Data: base64Data, // Store as base64 for Firestore
        dataURL: dataURL, // Keep full dataURL for local use
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

// ==================== SAVE RECEIPT LOCALLY ====================
saveReceiptLocally(receipt) {
    // Store in memory
    this.receiptQueue.unshift(receipt);
    
    // Store in localStorage for persistence
    const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
    localReceipts.unshift(receipt);
    localStorage.setItem('local-receipts', JSON.stringify(localReceipts));
    
    console.log('✅ Saved to localStorage:', receipt.id);
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
        
        // Add CSS for animations
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
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    
    try {
        // Capture frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (status) status.textContent = 'Processing photo...';
        
        // Flash effect
        video.style.filter = 'brightness(150%) contrast(120%)';
        setTimeout(() => {
            video.style.filter = '';
        }, 200);
        
        // Convert to Data URL (Base64)
        const dataURL = canvas.toDataURL('image/jpeg', 0.85);
        
        if (status) status.textContent = 'Saving photo...';
        
        // Show loading
        this.showCaptureLoading(true);
        
        // Generate receipt data
        const timestamp = Date.now();
        const receipt = this.createReceiptFromBase64(dataURL, timestamp);
        
        // Save locally first
        this.saveReceiptLocally(receipt);
        
        // Try to save to Firebase in background
        this.saveReceiptToFirebase(receipt)
            .then(() => {
                if (status) status.textContent = 'Photo saved!';
                this.showCaptureSuccess(receipt);
                this.showNotification('✅ Receipt saved!', 'success');
                
                // Update UI
                this.updateModalReceiptsList();
                this.updateReceiptQueueUI();
                
                // Return to upload view
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
                
                // Update UI even if Firebase fails
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
    // Extract base64 data from data URL
    const base64Data = dataURL.split(',')[1];
    
    // Calculate approximate size (1 character ≈ 1 byte for base64)
    const approxSize = Math.floor(base64Data.length * 0.75);
    
    const receiptId = `camera_${timestamp}`;
    
    return {
        id: receiptId,
        name: `receipt_${timestamp}.jpg`,
        base64Data: base64Data, // Store as base64 for Firestore
        dataURL: dataURL, // Keep full dataURL for local use
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
    // Store in memory
    this.receiptQueue.unshift(receipt);
    
    // Store in localStorage for persistence
    const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
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
        // Prepare receipt data for Firestore
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
        
        // Save to Firestore
        await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
        
        console.log('✅ Saved to Firestore:', receipt.id);
        return true;
        
    } catch (error) {
        console.error('❌ Firestore save error:', error);
        throw error;
    }
},

showCaptureSuccess: function(receipt) {
    // Create success modal
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
        max-height: 85vh; /* ADD THIS: Limit height */
        overflow-y: auto; /* ADD THIS: Make scrollable */
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add CSS animation
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
        /* Custom scrollbar for the modal */
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
    
    // Get image preview if available
    let imagePreview = '';
    if (receipt.type?.startsWith('image/')) {
        imagePreview = `
            <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; animation: pulse 2s ease-in-out; max-height: 200px; overflow: hidden;"> <!-- ADD max-height -->
                <img src="${receipt.dataURL}" 
                     alt="Receipt preview" 
                     style="width: 100%; max-height: 200px; object-fit: contain; background: #f8fafc;">
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div style="position: relative; min-height: 0;"> <!-- ADD min-height: 0 -->
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
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;"> <!-- ADD flex-wrap -->
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
                               min-width: 140px;"> <!-- ADD min-width -->
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
                               min-width: 140px;"> <!-- ADD min-width -->
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
    
    // Add event listeners
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
        // Stay in camera view
        const status = document.getElementById('camera-status');
        if (status) status.textContent = 'Ready';
    });
    
    document.getElementById('delete-captured-btn')?.addEventListener('click', () => {
        if (confirm(`Delete "${receipt.name}"? This action cannot be undone.`)) {
            modal.remove();
            this.deleteReceiptFromAllSources(receipt.id);
        }
    });
    
    // Auto-close after 10 seconds if not clicked
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
    
    // Close when clicking outside
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

getReceiptURL(receipt) {
    if (!receipt) return '';
    
    // If we already have a dataURL, use it
    if (receipt.dataURL) return receipt.dataURL;
    
    // If we have base64Data, convert it
    if (receipt.base64Data && receipt.type) {
        return `data:${receipt.type};base64,${receipt.base64Data}`;
    }
    
    // Fallback to downloadURL
    return receipt.downloadURL || '';
},

// ==================== UPDATE: FIXED UPLOAD RECEIPT TO FIREBASE (BASE64) ====================
uploadReceiptToFirebase(file, onProgress = null) {
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
                
                // Create receipt object
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
                
                // Save locally first
                this.saveReceiptLocally(receipt);
                
                // Try to save to Firebase
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
    
// ==================== UPDATE: FIXED LOAD RECEIPTS FROM FIREBASE ====================
async loadReceiptsFromFirebase() {
    console.log('Loading receipts from Firebase...');
    
    try {
        if (this.isFirebaseAvailable && window.db) {
            const user = window.firebase?.auth?.().currentUser;
            if (user) {
                try {
                    // Try to load receipts without complex queries that need indexes
                    const snapshot = await window.db.collection('receipts')
                        .where('userId', '==', user.uid)
                        .limit(50)
                        .get();
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            
                            // Only add pending receipts
                            if (data.status !== 'pending') return;
                            
                            // Convert base64 back to data URL if needed
                            let downloadURL = data.dataURL;
                            if (!downloadURL && data.base64Data) {
                                downloadURL = `data:${data.type || 'image/jpeg'};base64,${data.base64Data}`;
                            }
                            
                            const receipt = {
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
                                userId: data.userId,
                                source: 'firebase'
                            };
                            
                            // Add to queue if not already there
                            const existingIndex = this.receiptQueue.findIndex(r => r.id === receipt.id);
                            if (existingIndex === -1) {
                                this.receiptQueue.push(receipt);
                            }
                        });
                        
                        console.log('✅ Loaded receipts from Firestore:', this.receiptQueue.filter(r => r.source === 'firebase').length);
                        
                        // Update localStorage
                        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
                        
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
    
    // Fallback to localStorage
    this.loadFromLocalStorage();
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
        console.log('=== HANDLE FILE UPLOAD ===');
        console.log('Files received:', files.length);
        
        if (!files || files.length === 0) return;
        
        let processedFiles = 0;
        const totalFiles = files.length;
        
        const processNextFile = (index) => {
            if (index >= files.length) {
                if (processedFiles > 0) {
                    this.showNotification(`${processedFiles} receipt(s) uploaded successfully!`, 'success');
                    this.updateReceiptQueueUI();
                    this.updateProcessReceiptsButton();
                }
                return;
            }
            
            const file = files[index];
            
            // Validate file
            if (!this.isValidReceiptFile(file)) {
                this.showNotification(`Skipped ${file.name}: Invalid file type or size`, 'warning');
                processNextFile(index + 1);
                return;
            }
            
            // Upload to Firebase
            this.uploadReceiptToFirebase(file)
                .then(() => {
                    processedFiles++;
                    console.log(`✅ File uploaded: ${file.name}`);
                    processNextFile(index + 1);
                })
                .catch(error => {
                    console.error(`❌ Upload failed for ${file.name}:`, error);
                    this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
                    processNextFile(index + 1);
                });
        };
        
        // Start processing
        processNextFile(0);
    },

   // ==================== FIXED: UPLOAD RECEIPT TO FIREBASE (BASE64 VERSION) ====================
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
                
                // Create receipt object
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
                
                // Save locally first
                this.saveReceiptLocally(receipt);
                
                // Try to save to Firebase
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
        
        // Use event delegation for delete buttons
        document.addEventListener('click', (e) => {
            // Check for delete button click
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
            
            // Check for process button click
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

// Add at the top with other module properties
isDeleting: false,

confirmAndDeleteReceipt: function(receiptId) {
    console.log(`🗑️ Confirming deletion for receipt: ${receiptId}`);
    
    // Prevent if already deleting
    if (this.isDeleting) {
        this.showNotification('Please wait for previous delete to complete', 'warning');
        return;
    }
    
    // Get the receipt FIRST
    const receipt = this.receiptQueue.find(r => r.id === receiptId);
    if (!receipt) {
        this.showNotification('Receipt not found', 'error');
        return;
    }
    
    // Use a more specific selector - target ONLY delete buttons
    const deleteBtn = document.querySelector(`.delete-receipt-btn[data-receipt-id="${receiptId}"]`);
    const originalContent = deleteBtn ? deleteBtn.innerHTML : '';
    
    // Store the receipt name before showing confirmation
    const receiptName = receipt.name;
    
    // Single confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${receiptName}"?\n\nThis action cannot be undone.`)) {
        // Show immediate visual feedback
        if (deleteBtn) {
            deleteBtn.innerHTML = '<span class="btn-icon">⏳</span> Deleting...';
            deleteBtn.disabled = true;
            deleteBtn.classList.add('deleting');
        }
        
        // Proceed with deletion
        this.deleteReceiptFromAllSources(receiptId);
    } else {
        // User cancelled - restore button state
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalContent;
            deleteBtn.classList.remove('deleting');
        }
        console.log('Delete cancelled by user');
    }
},

deleteReceiptFromAllSources: async function(receiptId) {
    // Prevent multiple simultaneous deletes
    if (this.isDeleting) {
        this.showNotification('Please wait for previous delete to complete', 'warning');
        return;
    }
    
    // Get the receipt FIRST
    const receipt = this.receiptQueue.find(r => r.id === receiptId);
    if (!receipt) {
        this.showNotification('Receipt not found', 'error');
        return;
    }
    
    this.isDeleting = true;
    
    try {
        // Delete from Firebase Storage if it's a Firebase receipt
        if (receipt.storageType === 'firebase' && receipt.fileName && window.storage) {
            try {
                const storageRef = window.storage.ref();
                await storageRef.child(receipt.fileName).delete();
                console.log('✅ Deleted from Firebase Storage:', receipt.fileName);
            } catch (error) {
                console.warn('⚠️ Could not delete from Firebase Storage:', error.message);
            }
        }
        
        // Delete from Firestore
        if (this.isFirebaseAvailable && window.db) {
            try {
                await window.db.collection('receipts').doc(receiptId).delete();
                console.log('✅ Deleted from Firestore:', receiptId);
            } catch (error) {
                console.warn('⚠️ Could not delete from Firestore:', error.message);
            }
        }
        
        // Remove from memory
        this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
        
        // Remove from localStorage
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const updatedReceipts = localReceipts.filter(r => r.id !== receiptId);
        localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
        
        // Update UI
        this.updateReceiptQueueUI();
        this.updateModalReceiptsList();
        this.updateProcessReceiptsButton();
        
        // Show success
        this.showNotification(`"${receipt.name}" deleted successfully`, 'success');
        
        console.log('✅ Receipt deleted');
        
    } catch (error) {
        console.error('❌ Error deleting receipt:', error);
        this.showNotification('Failed to delete receipt', 'error');
    } finally {
        // Always reset the flag
        setTimeout(() => {
            this.isDeleting = false;
        }, 1000);
    }
},

    // ==================== RENDER METHODS ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const recentTransactions = this.getRecentTransactions(10);
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
                /* Firebase Receipt Styles */
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
                
                /* Spinner Animation */
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spinner { width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
                
                /* Make button children not interfere with clicks */
                #upload-receipt-btn * { pointer-events: none; }
                .firebase-badge, .receipt-queue-badge { pointer-events: none; }
                
                /* RECEIPT ATTACHMENT FIXES */
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
                
                /* Fix modal z-index */
                .popout-modal {
                    z-index: 9999;
                }
                
                /* Receipt preview styling */
                .receipt-preview-item {
                    background: var(--glass-bg);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    border: 1px solid var(--glass-border);
                }

               /* ========= Ensure camera preview is visible ========== */
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
            
            /* Make sure camera section shows when display:block */
            #camera-section {
                display: none;
            }
            
            #camera-section[style*="display: block"],
            #camera-section[style*="display:block"] {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* Button styling for better visibility */
            #camera-option {
                border: 2px solid transparent;
                transition: all 0.2s;
            }
            
            #camera-option:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            /* ==================== BASE MODAL STYLES ==================== */

.popout-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center; /* Default: center vertically */
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
}

.popout-modal-content {
    background: var(--background-color);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin: auto;
}

.popout-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--glass-bg);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    margin: 0;
    flex-shrink: 0;
}

/* ==================== FIX: HEADER AT TOP ON SMALL/MEDIUM SCREENS ==================== */
/* This overrides the vertical centering for screens 900px and below */

@media (max-width: 900px) {
    .popout-modal {
        align-items: flex-start !important; /* Force to top */
        padding-top: 0 !important; /* Remove top padding */
        padding-bottom: 10px; /* Keep small bottom padding */
    }
    
    .popout-modal-content {
        margin-top: 0 !important; /* Remove auto margin that causes centering */
        margin-bottom: auto; /* Push to top */
    }
    
    .popout-modal-header {
        margin-top: 0 !important; /* Ensure no margin above header */
        padding-top: 16px; /* Keep original padding */
    }
}

/* ==================== RESPONSIVE BREAKPOINTS ==================== */

/* Medium screens (901px to 768px) - Already handled above */

/* Tablet screens (768px and below) */
@media (max-width: 768px) {
    .popout-modal {
        padding: 0 15px 15px; /* Top:0, Sides:15px, Bottom:15px */
    }
    
    .popout-modal-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .popout-modal-header {
        padding: 12px 18px;
    }
    
    .popout-modal-title {
        font-size: 18px;
    }
}

/* Mobile screens (640px and below) */
@media (max-width: 640px) {
    .popout-modal {
        padding: 0 10px 10px; /* Top:0, Sides:10px, Bottom:10px */
    }
    
    .popout-modal-content {
        width: 100%;
        max-height: 95vh;
        border-radius: 16px;
    }
    
    .popout-modal-header {
        padding: 12px 16px;
        border-radius: 16px 16px 0 0;
    }
}

/* Very small phones (400px and below) - full screen */
@media (max-width: 400px) {
    .popout-modal {
        padding: 0 !important; /* No padding on any side */
    }
    
    .popout-modal-content {
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        margin: 0;
    }
    
    .popout-modal-header {
        padding: 12px 16px;
        border-radius: 0;
    }
}

/* ==================== REST OF THE STYLES (UNCHANGED) ==================== */

.popout-modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
    flex: 1;
}

.popout-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    line-height: 1;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    flex-shrink: 0;
    margin-left: 12px;
}

.popout-modal-close:hover {
    background: var(--glass-bg-hover);
    color: var(--text-primary);
}

.popout-modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.popout-modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid var(--glass-border);
    background: var(--glass-bg);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    gap: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
}

/* ==================== FOOTER BUTTON STYLES ==================== */

.popout-modal-footer .btn {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
}

#cancel-import-receipts {
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
}

#cancel-import-receipts:hover {
    border-color: var(--text-secondary);
    background: var(--glass-bg-hover);
}

#process-receipts-btn {
    position: relative;
    padding-right: 40px;
    overflow: visible;
    background: linear-gradient(135deg, var(--primary-color), #4f46e5);
    border: none;
    color: white;
}

#process-receipts-btn:hover {
    background: linear-gradient(135deg, #4f46e5, var(--primary-color));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

#process-receipts-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    border-radius: 12px;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 700;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    min-width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    line-height: 1;
}

/* Stack buttons on medium/small screens */
@media (max-width: 900px) {
    .popout-modal-footer {
        flex-direction: column;
        gap: 12px;
    }
    
    .popout-modal-footer .btn {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        min-height: 48px;
        font-size: 15px;
    }
    
    #process-receipts-btn {
        order: -1;
    }
}

/* ==================== IMPORT OPTION BUTTON FIXES ==================== */

.import-option {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 12px 16px;
    width: 100%;
    box-sizing: border-box;
}

.import-option-icon {
    flex-shrink: 0;
    margin-right: 12px;
    width: 24px;
    height: 24px;
}

/* CRITICAL FIX: Prevents text truncation in flexbox */
.import-option-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-size: 16px;
}

/* Adjust for very small screens */
@media (max-width: 400px) {
    .import-option-text {
        font-size: 14px;
    }
    
    .import-option {
        padding: 10px 12px;
        min-height: 44px;
    }
    
    .import-option-icon {
        margin-right: 10px;
        width: 22px;
        height: 22px;
    }
}

/* ==================== SCROLLING FIXES ==================== */

.popout-modal-body {
    padding-bottom: 30px;
}

.import-options-container {
    padding-bottom: 8px;
}
   /* ====== Animation for photo capture ===== */
@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.new-receipt {
    animation: pulse 2s infinite;
}

/* Success modal animation */
@keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, -40%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
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

                /* ==================== IMPORT RECEIPTS MODAL SPECIFIC STYLES ==================== */

/* Container spacing */
.import-receipts-container {
    padding: 20px;
}

/* Section styling */
.quick-actions-section {
    margin-bottom: 24px;
}

.upload-section,
.camera-section,
.recent-section {
    margin-bottom: 24px;
    animation: fadeIn 0.3s ease-out;
}

/* Card header enhancements */
.card-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--glass-bg);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.card-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

/* Card body padding */
.glass-card > :not(.card-header) {
    padding: 24px;
}

/* Camera status styling */
.camera-status {
    font-size: 14px;
    color: #10b981;
    font-weight: 500;
    padding: 4px 12px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 20px;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Receipts list container */
.receipts-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 16px;
}

/* Scrollbar styling for receipts list */
.receipts-list::-webkit-scrollbar {
    width: 6px;
}

.receipts-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.receipts-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}

.receipts-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* Button icon spacing */
.btn-icon {
    font-size: 16px;
    line-height: 1;
}

.btn-text {
    margin-left: 8px;
}

/* Pending receipt items */
.pending-receipt-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    transition: all 0.2s ease;
    margin-bottom: 8px;
}

.pending-receipt-item:hover {
    background: var(--glass-bg-hover);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.receipt-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.receipt-details {
    flex: 1;
}

.receipt-actions {
    display: flex;
    gap: 8px;
}

/* Receipt preview in transaction modal */
#receipt-preview-container {
    margin-top: 16px;
    padding: 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
}

#image-preview {
    text-align: center;
    margin-top: 16px;
}

#receipt-image-preview {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid var(--glass-border);
    object-fit: contain;
}

/* Camera controls container */
.camera-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 20px;
    background: var(--glass-bg);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

/* Responsive camera controls */
@media (max-width: 768px) {
    .camera-controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .camera-controls .btn {
        width: 100%;
    }
    
    .receipt-actions {
        flex-direction: column;
        align-items: flex-end;
    }
    
    .pending-receipt-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .receipt-info {
        justify-content: space-between;
    }
}

/* Drag and drop visual feedback */
.drag-over {
    background: rgba(79, 70, 229, 0.1) !important;
    border-color: var(--primary-color) !important;
    border-style: solid !important;
}

/* File input styling */
#receipt-upload-input {
    display: none;
}

/* Browse button */
#browse-receipts-btn {
    margin-top: 16px;
    padding: 12px 24px;
    background: linear-gradient(135deg, var(--primary-color), #4f46e5);
    border: none;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

#browse-receipts-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* Animation for new receipts */
@keyframes highlight {
    0% { background-color: rgba(16, 185, 129, 0.2); }
    100% { background-color: transparent; }
}

.new-receipt-highlight {
    animation: highlight 2s ease-out;
}

/* Status colors */
.status-pending { color: #f59e0b; }
.status-processed { color: #10b981; }
.status-attached { color: #3b82f6; }
.status-error { color: #ef4444; }

/* Progress bar animation */
@keyframes progress {
    0% { background-position: 0 0; }
    100% { background-position: 40px 0; }
}

.progress-bar.uploading {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    background-size: 40px 40px;
    animation: progress 2s linear infinite;
}

/* Modal footer spacing */
.popout-modal-footer {
    gap: 12px;
}

/* Camera option styling */
#camera-option {
    border: 2px solid transparent;
}

#camera-option:hover {
    border-color: var(--primary-color);
}

/* Upload option styling */
#upload-option {
    border: 2px solid transparent;
}

#upload-option:hover {
    border-color: var(--primary-color);
}

/* Empty state for receipts */
.receipts-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
}

.receipts-empty-state .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

/* Loading state */
.loading-receipts {
    text-align: center;
    padding: 40px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--glass-border);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

/* File size indicator */
.file-size {
    font-size: 11px;
    color: var(--text-tertiary);
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
}

/* Camera switch button styling */
#switch-camera {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Capture button emphasis */
#capture-photo {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    font-weight: 600;
}

#capture-photo:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: scale(1.05);
}

/* Form input focus states for modal */
.import-receipts-container input:focus,
.import-receipts-container button:focus,
.import-receipts-container select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Mobile optimizations */
@media (max-width: 480px) {
    .import-receipts-container {
        padding: 16px;
    }
    
    .card-grid {
        grid-template-columns: 1fr;
    }
    
    .camera-preview {
        height: 300px;
    }
    
    .upload-area {
        padding: 32px 16px;
    }
    
    .upload-icon {
        font-size: 40px;
    }
    
    .popout-modal-body {
        padding: 16px;
    }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    .card-button {
        background: rgba(0, 0, 0, 0.3);
    }
    
    .upload-area {
        background: rgba(0, 0, 0, 0.2);
    }
    
    .pending-receipt-item {
        background: rgba(0, 0, 0, 0.25);
    }

.delete-receipt-btn.deleting {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: #9ca3af !important;
}

/* Add these new styles for receipt modal */
.receipt-modal-scrollable {
    max-height: 70vh !important; /* Limit height to 70% of viewport */
    overflow-y: auto !important; /* Make it scrollable */
    padding: 20px !important;
}

.receipt-content-wrapper {
    max-width: 800px !important; /* Limit width */
    margin: 0 auto !important;
    white-space: pre-wrap !important; /* Preserve line breaks */
    word-wrap: break-word !important; /* Break long words */
    line-height: 1.5 !important;
    font-family: monospace !important; /* Better for receipt text */
    font-size: 14px !important;
}

/* For very long receipts, add smoother scrolling */
.receipt-text-container {
    overflow-x: hidden !important;
    padding-right: 10px !important;
}

/* Custom scrollbar for receipt modal */
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

/* Mobile responsive adjustments */
@media (max-width: 768px) {
    .receipt-modal-scrollable {
        max-height: 80vh !important;
        padding: 15px !important;
    }
    
    .receipt-content-wrapper {
        font-size: 12px !important;
    }

@media (max-width: 480px) {
    .receipt-modal-scrollable {
        max-height: 85vh !important;
        padding: 10px !important;
    }

/* ==================== FIX: BUTTON VISIBILITY ON LARGE SCREENS ==================== */

/* Ensure process and delete buttons are always visible */
.process-receipt-btn,
.delete-receipt-btn {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
}

/* Fix for receipt cards on large screens */
@media (min-width: 769px) {
    .pending-receipt-item {
        position: relative;
        padding-right: 200px !important; /* Make room for buttons */
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
    
    /* Ensure buttons have proper sizing */
    .receipt-actions .btn {
        min-width: 80px !important;
        height: 36px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        white-space: nowrap !important;
    }
}

/* For smaller screens - buttons are already visible */
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

/* Ensure buttons are not hidden by parent containers */
.receipt-card .receipt-actions,
.pending-receipt-item .receipt-actions {
    overflow: visible !important;
    clip: auto !important;
    clip-path: none !important;
    height: auto !important;
    width: auto !important;
}
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
                    <div class="popout-modal-footer">
                        <button class="btn btn-outline" id="cancel-import-receipts" style="flex: 1; min-width: 0;">Cancel</button>
                        <button class="btn btn-primary" id="process-receipts-btn" style="display: none; flex: 1; min-width: 0; position: relative;">
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
        
        // Setup receipt action listeners
        setTimeout(() => {
            this.setupReceiptActionListeners();
        }, 100);
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

    updateReceiptQueueUI() {
        // Update badge
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
            
            // Update pending section
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
        
        // Update process button
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

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Setup button helper
        const setupButton = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handler.call(this, e);
                });
            }
        };
        
        // Main buttons
        setupButton('add-transaction', () => this.showTransactionModal());
        setupButton('upload-receipt-btn', () => this.showImportReceiptsModal());
               
        // Quick actions
        setupButton('add-income-btn', () => this.showAddIncome());
        setupButton('add-expense-btn', () => this.showAddExpense());
        setupButton('financial-report-btn', () => this.generateFinancialReport());
        setupButton('category-analysis-btn', () => this.generateCategoryAnalysis());
        
        // Transaction modal
        setupButton('save-transaction', () => this.saveTransaction());
        setupButton('delete-transaction', () => this.deleteTransaction());
        setupButton('cancel-transaction', () => this.hideTransactionModal());
        setupButton('close-transaction-modal', () => this.hideTransactionModal());
        
        // Import receipts modal
        setupButton('close-import-receipts', () => this.hideImportReceiptsModal());
        setupButton('cancel-import-receipts', () => this.hideImportReceiptsModal());
        
        // Refresh receipts
        setupButton('refresh-receipts-btn', () => {
            this.loadReceiptsFromFirebase();
            this.showNotification('Receipts refreshed', 'success');
        });
        setupButton('process-all-receipts', () => this.processPendingReceipts());
        
        // Other buttons
        setupButton('export-transactions', () => this.exportTransactions());
        
        // Filter
        const transactionFilter = document.getElementById('transaction-filter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', (e) => {
                this.filterTransactions(e.target.value);
            });
        }
    },

    testFirebaseConnection() {
        console.log('🔧 Testing Firebase connection...');
        
        if (!window.firebase || !window.firebase.auth().currentUser) {
            this.showNotification('Please sign in first', 'error');
            return;
        }
        
        const user = window.firebase.auth().currentUser;
        this.showNotification(`User: ${user.email} (${user.uid})`, 'info');
        
        // Test Firestore write
        if (window.db) {
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                userId: user.uid,
                message: 'Firebase test from Income & Expenses'
            };
            
            window.db.collection('tests').doc('test_doc').set(testData)
                .then(() => {
                    this.showNotification('✅ Firestore write successful!', 'success');
                    console.log('✅ Firestore test passed');
                    
                    // Clean up test document
                    setTimeout(() => {
                        window.db.collection('tests').doc('test_doc').delete();
                    }, 5000);
                })
                .catch(error => {
                    this.showNotification(`❌ Firestore error: ${error.message}`, 'error');
                    console.error('❌ Firestore test failed:', error);
                });
        } else {
            this.showNotification('❌ Firestore not available', 'error');
        }
    },

    async saveTransaction() {
        console.log('Saving transaction...');
        
        // Get current user
        let userId = 'anonymous';
        if (window.firebase && window.firebase.auth().currentUser) {
            userId = window.firebase.auth().currentUser.uid;
        }
        
        // Get form values
        const id = document.getElementById('transaction-id')?.value || Date.now();
        const date = document.getElementById('transaction-date')?.value;
        const type = document.getElementById('transaction-type')?.value;
        const category = document.getElementById('transaction-category')?.value;
        const amount = parseFloat(document.getElementById('transaction-amount')?.value || 0);
        const description = document.getElementById('transaction-description')?.value || '';
        const paymentMethod = document.getElementById('transaction-payment')?.value || 'cash';
        const reference = document.getElementById('transaction-reference')?.value || '';
        const notes = document.getElementById('transaction-notes')?.value || '';
        
        // Validate
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        // Create receipt object
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
            userId: userId, // CRITICAL: Add userId
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Check if editing existing transaction
        const existingIndex = this.transactions.findIndex(t => t.id == id);
        
        try {
            if (existingIndex > -1) {
                // Update existing
                this.transactions[existingIndex] = transactionData;
                
                // 1. Save to localStorage FIRST
                localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                
                // 2. Try to save to Firebase
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
                // Add new
                transactionData.id = transactionData.id || Date.now();
                this.transactions.unshift(transactionData);
                
                // 1. Save to localStorage FIRST
                localStorage.setItem('farm-transactions', JSON.stringify(this.transactions));
                
                // 2. Try to save to Firebase
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
            
            // Update UI
            this.updateStats();
            this.updateTransactionsList();
            this.updateCategoryBreakdown();
            
            // Close modal
            this.hideTransactionModal();
            
        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showNotification('Error saving transaction: ' + error.message, 'error');
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

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            // Simple notification
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

       // ==================== MISSING METHODS FROM SECOND VERSION ====================

    saveReceiptsToLocalStorage() {
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        console.log('💾 Saved receipts to localStorage:', this.receiptQueue.length);
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

    // ==================== TRANSACTION METHODS (Missing) ====================
    
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

    
    // ==================== RECEIPT FORM HANDLERS (Missing) ====================

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

    // ==================== IMPORT RECEIPTS MODAL (Missing) ====================

    showImportReceiptsModal() {
        console.log('=== SHOW IMPORT RECEIPTS MODAL ===');
        
        this.hideAllModals();
        
        let modal = document.getElementById('import-receipts-modal');
        if (!modal) {
            console.error('Modal not found in DOM!');
            return;
        }
        
        modal.classList.remove('hidden');
        
        const content = document.getElementById('import-receipts-content');
        if (content) {
            content.innerHTML = this.renderImportReceiptsModal();
        }
        
        this.setupImportReceiptsHandlers();
        this.updateProcessReceiptsButton();
    },

    renderImportReceiptsModal() {
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
                
                <div class="upload-section" id="upload-section" style="display: block;">
                    <div class="glass-card">
                        <div class="card-header">
                            <h3>Upload Receipts</h3>
                        </div>
                        <div class="upload-area" id="drop-area">
                            <div class="upload-icon">📄</div>
                            <h4>Drag & Drop Receipts</h4>
                            <p class="upload-subtitle">or click to browse files</p>
                            <p class="upload-formats">Supports: JPG, PNG, PDF (Max 10MB)</p>
                            <input type="file" id="receipt-upload-input" multiple 
                                   accept=".jpg,.jpeg,.png,.pdf" style="display: none;">
                            <button class="btn btn-primary" id="browse-receipts-btn">
                                <span class="btn-icon">📁</span>
                                <span class="btn-text">Browse Files</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="camera-section" id="camera-section" style="display: none;">
                    <div class="glass-card">
                        <div class="card-header header-flex">
                            <h3>Camera Preview</h3>
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
                                <span class="btn-text">Cancel</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="recent-section" id="recent-section" style="${this.receiptQueue.length > 0 ? '' : 'display: none;'}">
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

    setupImportReceiptsHandlers() {
        console.log('Setting up import receipt handlers');
        
        const cameraOptionBtn = document.getElementById('camera-option');
        if (cameraOptionBtn) {
            cameraOptionBtn.addEventListener('click', () => {
                console.log('🎯 Camera button clicked');
                
                const cameraSection = document.getElementById('camera-section');
                const uploadSection = document.getElementById('upload-section');
                const recentSection = document.getElementById('recent-section');
                
                if (uploadSection) uploadSection.style.display = 'none';
                if (recentSection) recentSection.style.display = 'none';
                
                if (cameraSection) {
                    cameraSection.style.display = 'block';
                    
                    setTimeout(() => {
                        console.log('🔄 Initializing camera...');
                        this.initializeCamera();
                    }, 100);
                }
            });
        }
        
        const uploadOptionBtn = document.getElementById('upload-option');
        if (uploadOptionBtn) {
            uploadOptionBtn.addEventListener('click', () => {
                console.log('📁 Upload button clicked');
                this.showUploadInterface();
            });
        }
        
        const setupButton = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handler.call(this, e);
                });
            }
        };
        
        setupButton('capture-photo', () => this.capturePhoto());
        setupButton('switch-camera', () => this.switchCamera());
        setupButton('cancel-camera', () => {
            console.log('❌ Cancel camera clicked');
            this.showUploadInterface();
        });
        
        setupButton('refresh-receipts', () => {
            console.log('🔄 Refresh receipts clicked');
            const recentList = document.getElementById('recent-receipts-list');
            if (recentList) {
                recentList.innerHTML = this.renderRecentReceiptsList();
            }
            this.showNotification('Receipts list refreshed', 'success');
        });
        
        setupButton('process-receipts-btn', () => {
            const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
            
            if (pendingReceipts.length === 0) {
                this.showNotification('No pending receipts to process', 'info');
                return;
            }
            
            if (pendingReceipts.length === 1) {
                this.processSingleReceipt(pendingReceipts[0].id);
            } else {
                if (confirm(`Process ${pendingReceipts.length} pending receipts?`)) {
                    pendingReceipts.forEach((receipt, index) => {
                        setTimeout(() => {
                            this.processSingleReceipt(receipt.id);
                        }, index * 500);
                    });
                }
            }
        });
        
        this.setupUploadHandlers();
    },

    setupUploadHandlers() {
        console.log('🔧 Setting up upload handlers...');
        
        const browseBtn = document.getElementById('browse-receipts-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const fileInput = document.getElementById('receipt-upload-input');
                if (fileInput) {
                    fileInput.click();
                }
            });
        }
        
        const fileInput = document.getElementById('receipt-upload-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('📁 Files selected:', e.target.files?.length || 0);
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files);
                }
            });
        }
        
        const dropArea = document.getElementById('drop-area');
        if (dropArea) {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('drag-over');
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('drag-over');
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('drag-over');
                console.log('📁 Files dropped:', e.dataTransfer.files?.length || 0);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });
        }
    },

    // ==================== UPLOAD INTERFACE METHODS (Missing) ====================

    showUploadInterface() {
        console.log('📁 Showing upload interface...');
        
        this.stopCamera();
        
        const cameraSection = document.getElementById('camera-section');
        const uploadSection = document.getElementById('upload-section');
        const recentSection = document.getElementById('recent-section');
        
        if (cameraSection) cameraSection.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'block';
        if (recentSection && this.receiptQueue.length > 0) {
            recentSection.style.display = 'block';
        } else if (recentSection) {
            recentSection.style.display = 'none';
        }
    },

    // ==================== VALIDATION METHODS (Missing) ====================

    isValidReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
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

    // ==================== PROCESS RECEIPTS METHODS (Missing) ====================

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

    // ==================== SYNC METHODS (Missing) ====================

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
        
        // Get all local transactions
        const localTransactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        if (localTransactions.length === 0) {
            console.log('✅ No local transactions to sync');
            return;
        }
        
        console.log(`Found ${localTransactions.length} local transactions`);
        
        // Sync each transaction
        for (const transaction of localTransactions) {
            try {
                // Skip demo transactions
                if (transaction.source === 'demo') continue;
                
                const transactionWithUser = {
                    ...transaction,
                    userId: user.uid,
                    syncedAt: new Date().toISOString()
                };
                
                // Use transaction ID as document ID
                await window.db.collection('transactions')
                    .doc(transaction.id.toString())
                    .set(transactionWithUser, { merge: true });
                
                console.log(`✅ Synced transaction: ${transaction.id}`);
                
            } catch (error) {
                console.warn(`⚠️ Failed to sync transaction ${transaction.id}:`, error.message);
                // Continue with other transactions
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
        // Ensure transaction has userId
        const transactionWithUser = {
            ...transactionData,
            userId: user.uid,
            updatedAt: new Date().toISOString()
        };
        
        // Save to Firestore
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

    // ==================== UI UPDATE METHODS (Missing) ====================

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

    // ==================== TRANSACTION LIST RENDER (Missing) ====================

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

    // ==================== EXPORT METHODS (Missing) ====================

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

    // ==================== REPORT GENERATION (Missing) ====================

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

    // ==================== MODAL MANAGEMENT (Missing) ====================

    showModal(title, content) {
        this.hideAllModals();
        
        const modal = document.createElement('div');
        modal.className = 'popout-modal';
        modal.id = 'custom-modal';
        modal.innerHTML = content;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.remove('hidden'), 10);
    },

    hideAllModals() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        this.stopCamera();
    },

    hideImportReceiptsModal() {
        const modal = document.getElementById('import-receipts-modal');
        if (modal) modal.classList.add('hidden');
        this.stopCamera();
    },

    // ==================== TIMESTAMP FORMATTING (Missing) ====================

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
