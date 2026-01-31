 // modules/income-expenses.js - COMPLETE FIXED VERSION
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    categories: {
        income: ['sales', 'services', 'grants', 'other-income'],
        expense: ['feed', 'medical', 'equipment', 'labor', 'utilities', 'maintenance', 'transport', 'marketing', 'other-expense']
    },
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
        console.log('Firebase available:', this.isFirebaseAvailable);

        // Setup network detection
        this.setupNetworkDetection();
        
        // Load transactions
        this.loadData();
        
        // Load receipts from Firebase
        if (this.isFirebaseAvailable) {
            this.loadReceiptsFromFirebase();
        }

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
                                    date: data.date || new Date().toISOString().split('T')[0],
                                    type: data.type || 'expense',
                                    category: data.category || 'other-expense',
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
                            
                            // Sort by date (newest first)
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
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        return [
            {
                id: Date.now(),
                date: now.toISOString().split('T')[0],
                type: 'income',
                category: 'sales',
                amount: 1500,
                description: 'Corn harvest sale',
                paymentMethod: 'cash',
                reference: 'INV001',
                notes: 'First harvest of the season',
                receipt: null,
                userId: 'demo',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                source: 'demo'
            },
            {
                id: Date.now() + 1,
                date: yesterday.toISOString().split('T')[0],
                type: 'expense',
                category: 'feed',
                amount: 450,
                description: 'Animal feed purchase',
                paymentMethod: 'card',
                reference: 'FED001',
                notes: 'Monthly feed supply',
                receipt: null,
                userId: 'demo',
                createdAt: yesterday.toISOString(),
                updatedAt: yesterday.toISOString(),
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
        if (!this.isFirebaseAvailable || !window.db) {
            console.log('Firebase not available, loading from localStorage');
            this.loadFromLocalStorage();
            return;
        }
        
        console.log('Loading receipts from Firebase...');
        
        try {
            const user = window.firebase?.auth?.().currentUser;
            if (!user) {
                console.log('User not authenticated, loading from localStorage');
                this.loadFromLocalStorage();
                return;
            }
            
            const snapshot = await window.db.collection('receipts')
                .where('userId', '==', user.uid)
                .limit(50)
                .get();
            
            const firebaseReceipts = [];
            
            if (!snapshot.empty) {
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
            }
            
            this.mergeReceipts(firebaseReceipts);
            
        } catch (error) {
            console.warn('⚠️ Firebase receipts load error:', error.message);
            this.loadFromLocalStorage();
        }
    },

    mergeReceipts(firebaseReceipts) {
        const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        const receiptMap = new Map();
        
        // Add Firebase receipts first
        firebaseReceipts.forEach(receipt => {
            receiptMap.set(receipt.id, receipt);
        });
        
        // Add local receipts if not already in map
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
        this.updateReceiptQueueUI();
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
   async initializeCamera() {
    console.log('📷 Initializing camera...');
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
    
    try {
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('❌ Camera preview element not found');
            this.showNotification('Camera preview element missing', 'error');
            this.showUploadInterface();
            return;
        }
        
        // Stop existing stream first
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Reset video element
        video.srcObject = null;
        video.pause();
        video.load();
        
        if (status) status.textContent = 'Requesting camera access...';
        
        // Detect screen size and adjust constraints
        const screenWidth = window.innerWidth;
        let constraints;
        
        if (screenWidth >= 768 && screenWidth <= 1024) {
            // Medium screens: use more compatible settings
            console.log('📱 Medium screen detected, using basic constraints');
            constraints = {
                video: {
                    facingMode: this.cameraFacingMode,
                    width: { ideal: 640 },  // Lower resolution for compatibility
                    height: { ideal: 480 }
                },
                audio: false
            };
        } else {
            // Other screens: normal constraints
            constraints = {
                video: {
                    facingMode: this.cameraFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
        }
        
        console.log('Using constraints:', constraints);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('✅ Camera access granted');
        this.cameraStream = stream;
        video.srcObject = stream;
        
        // Force video dimensions to match stream
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log('Camera settings:', settings);
        
        // Set video dimensions
        if (settings.width && settings.height) {
            video.style.width = '100%';
            video.style.height = '100%';
            console.log(`Video dimensions set to: ${settings.width}x${settings.height}`);
        }
        
        // Play video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
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
            }).catch(error => {
                console.error('Video play error:', error);
                // Try again without waiting for promise
                setTimeout(() => {
                    video.play().catch(e => {
                        console.error('Video play retry failed:', e);
                        this.showNotification('Camera preview failed', 'error');
                    });
                }, 100);
            });
        }
        
    } catch (error) {
        console.error('❌ Camera error:', error);
        let errorMessage = 'Camera access denied.';
        if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is already in use by another application. Please close other camera apps.';
            // Try fallback with minimal constraints
            this.tryMinimalCameraSetup();
            return;
        } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'Camera constraints cannot be satisfied. Trying simpler settings...';
            this.tryMinimalCameraSetup();
            return;
        }
        this.showNotification(errorMessage, 'error');
        this.showUploadInterface();
    }
},

// Add a fallback method for minimal camera setup:
async tryMinimalCameraSetup() {
    console.log('🔄 Trying minimal camera setup...');
    
    try {
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) return;
        
        if (status) status.textContent = 'Trying alternative setup...';
        
        // Minimal constraints that should work on any device
        const minimalConstraints = {
            video: true, // Let the browser decide everything
            audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(minimalConstraints);
        
        console.log('✅ Minimal camera setup successful');
        this.cameraStream = stream;
        video.srcObject = stream;
        
        // Force play
        video.play().catch(() => {
            // Ignore play errors for minimal setup
        });
        
        if (status) status.textContent = 'Camera Ready (Basic Mode)';
        
    } catch (error) {
        console.error('❌ Minimal camera setup also failed:', error);
        this.showNotification('Camera not available. Please use file upload instead.', 'error');
        this.showUploadInterface();
    }
},

attemptCameraAccess(video, status, resolve, reject, isRetry = false) {
    const constraints = isRetry ? {
        video: true,  // Simple constraints for retry
        audio: false
    } : {
        video: {
            facingMode: this.cameraFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };
    
    console.log(isRetry ? '🔄 Retrying with simple constraints...' : '📷 Trying camera access...');
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            console.log('✅ Camera access granted' + (isRetry ? ' with simple constraints' : ''));
            this.cameraStream = stream;
            video.srcObject = stream;
            
            // Set up video play
            this.setupVideoPlayback(video, status, resolve, reject);
        })
        .catch(error => {
            console.error('❌ Camera error:', error);
            
            if (!isRetry && error.name === 'NotReadableError') {
                // First try failed with NotReadableError, retry with simpler constraints
                console.log('🔄 Camera in use, retrying with simpler constraints...');
                setTimeout(() => {
                    this.attemptCameraAccess(video, status, resolve, reject, true);
                }, 500);
                return;
            }
            
            // Show appropriate error message
            let errorMessage = 'Camera access denied.';
            if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found on this device.';
            } else if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera permission denied. Please allow camera access.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Camera constraints cannot be satisfied.';
            }
            
            this.showNotification(errorMessage, 'error');
            this.showUploadInterface();
            reject(error);
        });
},

setupVideoPlayback(video, status, resolve, reject) {
    // Try multiple methods to play the video
    const playVideo = () => {
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
                
                resolve(true);
            })
            .catch(playError => {
                console.error('❌ Video play error:', playError);
                
                // Try playing with a timeout
                setTimeout(() => {
                    video.play()
                        .then(() => {
                            console.log('📹 Video playing after retry');
                            if (status) status.textContent = 'Camera Ready';
                            resolve(true);
                        })
                        .catch(retryError => {
                            console.error('❌ Video play retry failed:', retryError);
                            this.showNotification('Failed to start camera', 'error');
                            reject(retryError);
                        });
                }, 300);
            });
    };
    
    // Try to play when metadata loads
    video.onloadedmetadata = playVideo;
    
    // Fallback if metadata doesn't load quickly
    setTimeout(() => {
        if (video.paused && video.readyState >= 2) {
            playVideo();
        }
    }, 1000);
    
    // Another fallback for slow devices
    setTimeout(() => {
        if (video.paused) {
            console.log('⏱️ Forcing video play after timeout');
            video.play().catch(() => {});
        }
    }, 2000);
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
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        
        try {
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            if (status) status.textContent = 'Processing photo...';
            
            // Add visual feedback
            video.style.filter = 'brightness(150%) contrast(120%)';
            setTimeout(() => {
                video.style.filter = '';
            }, 200);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/jpeg', 0.85);
            
            if (status) status.textContent = 'Saving photo...';
            
            this.showCaptureLoading(true);
            
            const timestamp = Date.now();
            const receipt = this.createReceiptFromBase64(dataURL, timestamp);
            
            // Save locally
            this.saveReceiptLocally(receipt);
            
            // Try to save to Firebase
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
    // Ensure receipt has storageType
    if (!receipt.storageType) {
        receipt.storageType = receipt.base64Data ? 'firestore-base64' : 'local';
    }
    
    // Remove if already exists
    this.receiptQueue = this.receiptQueue.filter(r => r.id !== receipt.id);
    
    // Add to beginning of queue
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
        const existingOverlay = document.getElementById('capture-loading-overlay');
        
        if (show) {
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            const overlay = document.createElement('div');
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
            `;
            
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
            
            // Add spinner animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
        } else if (existingOverlay) {
            existingOverlay.remove();
        }
    },

    showCaptureSuccess(receipt) {
        const existingModal = document.getElementById('capture-success-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
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
        `;
        
        let imagePreview = '';
        if (receipt.type?.startsWith('image/')) {
            imagePreview = `
                <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; max-height: 200px; overflow: hidden;">
                    <img src="${receipt.dataURL}" 
                         alt="Receipt preview" 
                         style="width: 100%; max-height: 200px; object-fit: contain; background: #f8fafc;">
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
                                   margin-bottom: 8px;">
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
                                   width: 100%;">
                        🗑️ Delete this receipt
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('process-now-btn').addEventListener('click', () => {
            modal.remove();
            setTimeout(() => {
                this.processSingleReceipt(receipt.id);
            }, 100);
        });
        
        document.getElementById('close-success-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('take-another-btn').addEventListener('click', () => {
            modal.remove();
            const status = document.getElementById('camera-status');
            if (status) status.textContent = 'Ready';
        });
        
        document.getElementById('delete-captured-btn').addEventListener('click', () => {
            if (confirm(`Delete "${receipt.name}"? This action cannot be undone.`)) {
                modal.remove();
                this.deleteReceiptFromAllSources(receipt.id);
            }
        });
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 10000);
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
    console.log('🎯 Handling file upload:', files.length, 'files');
    
    if (!files || files.length === 0) {
        return;
    }
    
    // Process each file
    Array.from(files).forEach(file => {
        console.log('📄 Processing file:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const dataURL = e.target.result;
                const receiptId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // FIX: Properly extract base64Data from dataURL
                const base64Data = dataURL.split(',')[1]; // Extract base64 part after comma
                
                const receipt = {
                    id: receiptId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataURL: dataURL,
                    base64Data: base64Data, // FIX: Include the base64Data
                    status: 'pending',
                    uploadedAt: new Date().toISOString(),
                    source: 'upload',
                    storageType: 'firestore-base64' // FIX: Add storageType
                };
                
                console.log('📦 Receipt created:', receipt);
                
                // Save locally
                this.saveReceiptLocally(receipt);
                
                // Try to save to Firebase
                if (this.isFirebaseAvailable) {
                    this.saveReceiptToFirebase(receipt).catch(error => {
                        console.warn('⚠️ Failed to save to Firebase:', error.message);
                    });
                }
                
                // Update UI
                this.updateReceiptQueueUI();
                this.updateModalReceiptsList();
                
                this.showNotification(`Uploaded: ${file.name}`, 'success');
                
            } catch (error) {
                console.error('❌ Error processing file:', error);
                this.showNotification('Upload failed: ' + error.message, 'error');
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            this.showNotification('Failed to read file', 'error');
        };
        
        reader.readAsDataURL(file);
    });
},

// Also fix the saveReceiptToFirebase method to handle the data properly:
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
        // FIX: Ensure we have all required fields
        const firebaseReceipt = {
            id: receipt.id,
            name: receipt.name,
            base64Data: receipt.base64Data || '', // FIX: Ensure it's never undefined
            size: receipt.size || 0,
            type: receipt.type || 'application/octet-stream',
            status: receipt.status || 'pending',
            userId: user.uid,
            uploadedAt: receipt.uploadedAt || new Date().toISOString(),
            storageType: receipt.storageType || 'firestore-base64',
            metadata: receipt.metadata || {}
        };
        
        // FIX: Remove undefined properties
        Object.keys(firebaseReceipt).forEach(key => {
            if (firebaseReceipt[key] === undefined) {
                delete firebaseReceipt[key];
            }
        });
        
        await window.db.collection('receipts').doc(receipt.id).set(firebaseReceipt);
        
        console.log('✅ Saved to Firestore:', receipt.id);
        return true;
        
    } catch (error) {
        console.error('❌ Firestore save error:', error);
        throw error;
    }
},

    // ==================== DELETE FUNCTIONALITY ====================
    setupReceiptActionListeners() {
        console.log('🔧 Setting up receipt action listeners...');
        
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-receipt-btn');
            if (deleteBtn) {
                const receiptId = deleteBtn.dataset.receiptId;
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.confirmAndDeleteReceipt(receiptId);
                }
            }
            
            const processBtn = e.target.closest('.process-receipt-btn, .process-btn');
            if (processBtn) {
                const receiptId = processBtn.dataset.receiptId;
                if (receiptId) {
                    e.preventDefault();
                    e.stopPropagation();
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
        
        if (confirm(`Are you sure you want to delete "${receipt.name}"?\n\nThis action cannot be undone.`)) {
            this.deleteReceiptFromAllSources(receiptId);
        }
    },

    async deleteReceiptFromAllSources(receiptId) {
        if (this.isDeleting) {
            return;
        }
        
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        if (!receipt) {
            return;
        }
        
        this.isDeleting = true;
        
        try {
            // Delete from Firebase Storage if applicable
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
            
            // Remove from local arrays
            this.receiptQueue = this.receiptQueue.filter(r => r.id !== receiptId);
            
            const localReceipts = JSON.parse(localStorage.getItem('local-receipts') || '[]');
            const updatedReceipts = localReceipts.filter(r => r.id !== receiptId);
            localStorage.setItem('local-receipts', JSON.stringify(updatedReceipts));
            
            // Update UI
            this.updateReceiptQueueUI();
            this.updateModalReceiptsList();
            this.updateProcessReceiptsButton();
            
            this.showNotification(`"${receipt.name}" deleted successfully`, 'success');
            
        } catch (error) {
            console.error('❌ Error deleting receipt:', error);
            this.showNotification('Failed to delete receipt', 'error');
        } finally {
            this.isDeleting = false;
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
            console.log('✅ Modal shown');
        } else {
            console.error('❌ Modal element not found');
            return;
        }
        
        // Load content
        const importReceiptsContent = document.getElementById('import-receipts-content');
        if (importReceiptsContent) {
            importReceiptsContent.innerHTML = this.renderImportReceiptsModal();
        }
        
        // Setup handlers after a short delay
        setTimeout(() => {
            this.setupImportReceiptsHandlers();
            this.setupFileInput();
            this.setupDragAndDrop();
            this.showQuickActionsView();
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
        
        // Reset file input
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
        
        // Setup drag and drop after showing
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
        
        // Force reflow to ensure DOM is ready
        void cameraSection.offsetHeight;
        
        // Initialize camera with a delay to ensure video element is ready
        setTimeout(() => {
            const video = document.getElementById('camera-preview');
            if (video) {
                // Reset video element
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
            }
            
            setTimeout(() => {
                this.initializeCamera();
            }, 50);
        }, 100);
    }
    if (recentSection) recentSection.style.display = 'block';
    
    console.log('✅ Camera interface shown');
},
 
    // ==================== EVENT HANDLERS ====================
    setupImportReceiptsHandlers() {
        console.log('Setting up import receipt handlers');
        
        // Helper function to setup buttons
        const setupButton = (id, handler) => {
            const button = document.getElementById(id);
            if (button) {
                // Remove existing listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handler.call(this, e);
                });
            }
        };
        
        // Setup all modal buttons
        setupButton('upload-option', () => this.showUploadInterface());
        setupButton('camera-option', () => this.showCameraInterface());
        setupButton('cancel-camera', () => this.showQuickActionsView());
        setupButton('back-to-main-view', () => this.showQuickActionsView());
        setupButton('capture-photo', () => this.capturePhoto());
        setupButton('switch-camera', () => this.switchCamera());
        setupButton('refresh-receipts', () => this.refreshReceiptsList());
        
        // Process receipts button
        const processBtn = document.getElementById('process-receipts-btn');
        if (processBtn) {
            processBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');
                
                if (pendingReceipts.length === 0) {
                    this.showNotification('No pending receipts to process', 'info');
                    return;
                }
                
                if (confirm(`Process ${pendingReceipts.length} pending receipts?`)) {
                    this.processPendingReceipts();
                }
            });
        }
    },

    refreshReceiptsList() {
        console.log('🔄 Refresh receipts clicked');
        const recentList = document.getElementById('recent-receipts-list');
        if (recentList) {
            recentList.innerHTML = this.renderRecentReceiptsList();
        }
        this.showNotification('Receipts list refreshed', 'success');
    },

    setupDragAndDrop() {
        console.log('🔧 Setting up drag and drop...');
        
        const dropArea = document.getElementById('receipt-dropzone');
        if (!dropArea) {
            console.log('ℹ️ No drop area found');
            return;
        }
        
        // Clear existing handlers
        dropArea.ondragover = null;
        dropArea.ondragleave = null;
        dropArea.ondrop = null;
        dropArea.onclick = null;
        
        // Click handler
        dropArea.onclick = () => {
            const fileInput = document.getElementById('receipt-file-input');
            if (fileInput) {
                fileInput.click();
            }
        };
        
        // Drag handlers
        dropArea.ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
        };
        
        dropArea.ondragleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
        };
        
        dropArea.ondrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files);
            }
        };
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
        
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
                e.target.value = '';
            }
        };
    },

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Remove existing handlers
        if (this._globalClickHandler) {
            document.removeEventListener('click', this._globalClickHandler);
            document.removeEventListener('change', this._globalChangeHandler);
        }
        
        // Global click handler
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
        
        // Global change handler
        this._globalChangeHandler = (e) => {
            if (e.target.id === 'transaction-filter') {
                this.filterTransactions(e.target.value);
            }
        };
        
        document.addEventListener('click', this._globalClickHandler);
        document.addEventListener('change', this._globalChangeHandler);
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
        
        // Fill form with transaction data
        const fields = {
            'transaction-id': transaction.id,
            'transaction-date': transaction.date,
            'transaction-type': transaction.type,
            'transaction-category': transaction.category,
            'transaction-amount': transaction.amount,
            'transaction-description': transaction.description,
            'transaction-payment': transaction.paymentMethod || 'cash',
            'transaction-reference': transaction.reference || '',
            'transaction-notes': transaction.notes || ''
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        const deleteBtn = document.getElementById('delete-transaction');
        if (deleteBtn) deleteBtn.style.display = 'block';
        
        const title = document.getElementById('transaction-modal-title');
        if (title) title.textContent = 'Edit Transaction';
        
        if (transaction.receipt) {
            this.receiptPreview = transaction.receipt;
            this.showReceiptPreviewInTransactionModal(transaction.receipt);
        }
    },

    async saveTransaction() {
        console.log('Saving transaction...');
        
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
        
        // Validation
        if (!date || !type || !category || !amount || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }
        
        // Prepare receipt data
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
        
        // Prepare transaction data
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
                // Update existing transaction
                this.transactions[existingIndex] = transactionData;
                this.saveData();
                
                if (this.isFirebaseAvailable && window.db) {
                    try {
                        await window.db.collection('transactions')
                            .doc(id.toString())
                            .set(transactionData, { merge: true });
                    } catch (firebaseError) {
                        console.warn('⚠️ Failed to update in Firebase:', firebaseError.message);
                    }
                }
                
                this.showNotification('Transaction updated successfully!', 'success');
                
            } else {
                // Add new transaction
                transactionData.id = transactionData.id || Date.now();
                this.transactions.unshift(transactionData);
                this.saveData();
                
                if (this.isFirebaseAvailable && window.db) {
                    try {
                        await window.db.collection('transactions')
                            .doc(transactionData.id.toString())
                            .set(transactionData);
                    } catch (firebaseError) {
                        console.warn('⚠️ Failed to save to Firebase:', firebaseError.message);
                    }
                }
                
                this.showNotification('Transaction saved successfully!', 'success');
            }
            
            // Update UI
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
        
        // Remove from local array
        this.transactions = this.transactions.filter(t => t.id != transactionId);
        this.saveData();
        
        // Remove from Firebase
        if (this.isFirebaseAvailable && window.db) {
            try {
                await window.db.collection('transactions')
                    .doc(transactionId.toString())
                    .delete();
            } catch (firebaseError) {
                console.warn('Failed to delete from Firestore:', firebaseError.message);
            }
        }
        
        // Update UI
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
        
        // Open transaction modal for this receipt
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
            
            // Attach receipt to transaction
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

    // ==================== UI RENDERING ====================
   renderModule() {
    if (!this.element) return;

    const stats = this.calculateStats();
    const recentTransactions = this.getRecentTransactions(10);
    const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

    this.element.innerHTML = `
            <style>
                /* ==================== CSS VARIABLES ==================== */
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.95);
                    --glass-border: rgba(229, 231, 235, 0.8);
                    --primary-color: #3b82f6;
                    --primary-color-light: rgba(59, 130, 246, 0.1);
                    --text-primary: #1f2937;
                    --text-secondary: #6b7280;
                    --danger-color: #ef4444;
                    --warning-color: #f59e0b;
                    --success-color: #10b981;
                    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                                               
                /* ==================== BASE STYLES ==================== */
                .module-container { padding: 20px; }
                .module-header { margin-bottom: 30px; }
                .module-title { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
                .module-subtitle { color: var(--text-secondary); margin: 0 0 20px 0; }
                .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: white; border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--glass-border); text-align: center; }
                .quick-action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                
                .quick-action-btn {
                    background: white;
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                
                .quick-action-btn:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .glass-card { background: white; border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--glass-border); margin-bottom: 24px; }
                
                .form-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--glass-border);
                    border-radius: 6px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .form-grid-2col {
                 display: grid;
                 grid-template-columns: 1fr 1fr;
                 gap: 16px;
                 margin-bottom: 16px;
               }

                .form-input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--primary-color-light); }
                .form-label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px; }
                
                .upload-dropzone {
                    border: 2px dashed var(--glass-border);
                    border-radius: 10px;
                    padding: 40px 20px;
                    text-align: center;
                    background: #f9fafb;
                    margin-bottom: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .upload-dropzone-margin {
                 margin-bottom: 12px;
               }

                .upload-dropzone:hover { border-color: var(--primary-color); background: #f0f1ff; }
                .dropzone-icon { font-size: 48px; color: #9ca3af; margin-bottom: 16px; }
                .dropzone-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
                .dropzone-subtitle { color: var(--text-secondary); margin-bottom: 20px; }
                .file-type-badge { background: var(--glass-border); color: var(--text-primary); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 0 2px; }
                
                /* Camera section */
                .camera-preview-container {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                
                #camera-preview {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scaleX(-1);
                }
                
                .camera-controls {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .camera-controls .btn {
                    flex: 1;
                    min-width: 120px;
                    max-width: 200px;
                }
              
                /* Other styles */
                .status-pending { color: var(--warning-color); }
                .status-processed { color: var(--success-color); }
                .status-error { color: var(--danger-color); }
                .receipt-queue-badge { background: var(--danger-color); color: white; border-radius: 10px; padding: 2px 6px; font-size: 12px; margin-left: 8px; }
                .hidden { display: none !important; }

          /* ==================== COMPLETE FIX - REPLACE ALL MODAL CSS ==================== */
/* Only use this block - delete everything else related to modals */

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
}

#import-receipts-modal .popout-modal-content {
    max-width: 850px;
    max-height: 90vh;
}

#import-receipts-modal .modal-footer-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: space-between; /* spreads Cancel left, Process right */
  align-items: center;
}

#transaction-modal .popout-modal-content {
    max-width: 600px;
    max-height: 85vh;
}

.popout-modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    min-height: 60px;
    background: white;
    position: relative;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}

.popout-modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.popout-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.popout-modal-close:hover {
    background: #f3f4f6;
}

.popout-modal-body {
    padding: 0;
    overflow-y: auto;
    flex: 1;
    min-height: 200px;
}

/* ==================== FOOTER FIX - NO FLOATING ==================== */
.popout-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    background: white;
    width: 100%;
    box-sizing: border-box;
    min-height: 72px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    position: relative;
}

/* IMPORT RECEIPTS FOOTER */
#import-receipts-modal .popout-modal-footer {
    justify-content: space-between;
}

#import-receipts-modal .modal-footer-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}

/* TRANSACTION FOOTER */
#transaction-modal .popout-modal-footer {
    justify-content: space-between;
}

.receipt-image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.receipt-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

/* ==================== BUTTON FIXES - NO FLOATING ==================== */
/* Base button styles - NO position: relative here */
.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    white-space: nowrap;
    min-width: 120px;
    height: 44px;
    font-size: 14px;
    box-sizing: border-box;
    flex-shrink: 0;
    position: static !important; /* ADD THIS */
    float: none !important; /* ADD THIS */
    /* CRITICAL: No position:relative here */
}

 .btn-small {
   padding: 6px 12px;
   font-size: 13px;
   height: auto;
 }


/* Camera section buttons - ensure they don't float */
#camera-section .btn,
.camera-controls .btn,
#switch-camera,
#cancel-camera,
#capture-photo {
    position: static; /* Default positioning */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 120px;
    max-width: 200px;
    margin: 0;
}

/* Camera controls */
.camera-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
}

/* Camera preview */
.camera-preview-container {
    width: 100%;
    height: 400px;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
    position: relative;
}

#camera-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
    display: block;
}

/* Ensure camera section works */
#camera-section {
    width: 100%;
}

/* Button colors */
.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-outline {
    background: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-outline:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.btn-danger {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

.btn-danger:hover {
    background: #fecaca;
}

#process-receipts-btn {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 160px;
}

#process-receipts-count {
    margin-left: 8px;
    background: #ef4444;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 700;
    min-width: 24px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* ==================== RESPONSIVE FIXES ==================== */

@media (min-width: 768px) and (max-width: 1199px) {
  .camera-preview-container {
    height: 350px;
  }
  .camera-controls .btn {
    min-width: 140px;
  }
}

@media (max-width: 767px) {
  .camera-preview-container {
    height: 300px;
  }
  .camera-controls {
    flex-direction: column;
  }
  .camera-controls .btn {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .camera-preview-container {
    height: 250px;
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
                        <button class="btn btn-primary" id="upload-receipt-btn">
                             📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span class="receipt-queue-badge">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                <!-- Pending Receipts Section -->
                ${pendingReceipts.length > 0 ? `
                    <div class="glass-card" id="pending-receipts-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: #1f2937; font-size: 20px;">📋 Pending Receipts (${pendingReceipts.length})</h3>
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

                <!-- Financial Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;" id="total-income">${this.formatCurrency(stats.totalIncome)}</div>
                        <div style="font-size: 14px; color: #6b7280;">Total Income</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;" id="total-expenses">${this.formatCurrency(stats.totalExpenses)}</div>
                        <div style="font-size: 14px; color: #6b7280;">Total Expenses</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;" id="net-income">${this.formatCurrency(stats.netIncome)}</div>
                        <div style="font-size: 14px; color: #6b7280;">Net Income</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💳</div>
                        <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;">${stats.transactionCount}</div>
                        <div style="font-size: 14px; color: #6b7280;">Transactions</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-income-btn">
                        <div style="font-size: 32px;">💰</div>
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Add Income</span>
                        <span style="font-size: 12px; color: #6b7280; text-align: center;">Record farm income</span>
                    </button>
                    <button class="quick-action-btn" id="add-expense-btn">
                        <div style="font-size: 32px;">💸</div>
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Add Expense</span>
                        <span style="font-size: 12px; color: #6b7280; text-align: center;">Record farm expenses</span>
                    </button>
                    <button class="quick-action-btn" id="financial-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Financial Report</span>
                        <span style="font-size: 12px; color: #6b7280; text-align: center;">View financial summary</span>
                    </button>
                    <button class="quick-action-btn" id="category-analysis-btn">
                        <div style="font-size: 32px;">📋</div>
                        <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Category Analysis</span>
                        <span style="font-size: 12px; color: #6b7280; text-align: center;">Breakdown by category</span>
                    </button>
                </div>

                <!-- Recent Transactions -->
                <div class="glass-card" style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: #1f2937; font-size: 20px;">📋 Recent Transactions</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="transaction-filter" class="form-input" style="width: auto;">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                            <button class="btn btn-outline" id="export-transactions">Export</button>
                        </div>
                    </div>
                    <div id="transactions-list">
                        ${this.renderTransactionsList(recentTransactions)}
                    </div>
                </div>

                <!-- Category Breakdown -->
                <div class="glass-card">
                    <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 20px;">📊 Category Breakdown</h3>
                    <div id="category-breakdown">
                        ${this.renderCategoryBreakdown()}
                    </div>
                </div>
            </div>

            <!-- ==================== MODALS ==================== -->
           <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="popout-modal hidden">
                <div class="popout-modal-content transaction-modal-content">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📥 Import Receipts</h3>
                        <button class="popout-modal-close" id="close-import-receipts">&times;</button>
                    </div>
                    
                    <div class="popout-modal-body">
                        <div class="import-receipts-content-wrapper" id="import-receipts-content">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="popout-modal-footer">
                     <div class="modal-footer-buttons">
                       <button class="btn btn-outline" id="cancel-import-receipts">Cancel</button>
                       <button class="btn btn-primary" id="process-receipts-btn">
                         ⚡ Process Receipts
                         <span id="process-receipts-count">0</span>
                       </button>
                     </div>
                   </div>
                </div>
            </div>
            
            <!-- Transaction Modal -->
            <div id="transaction-modal" class="popout-modal hidden">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="transaction-modal-title">Add Transaction</h3>
                        <button class="popout-modal-close" id="close-transaction-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id" value="">
                            
                            <div class="form-grid-2col">
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

                          <!-- Recent Receipts List -->
                           <!-- Receipt List -->
                             <div id="receipt-list">
                               <!-- Single receipt row -->
                               <div class="receipt-row">
                                 <div class="receipt-info">
                                   <div class="receipt-icon">📄</div>
                                   <div>
                                     <div class="receipt-filename">Feed_Report_2026-01-19.pdf</div>
                                     <div class="receipt-size">7.86 KB • Pending • Jan 29, 2026</div>
                                   </div>
                                 </div>
                                 <div class="receipt-actions">
                                   <button type="button" class="btn btn-outline btn-small">🔍 Process</button>
                                   <button type="button" class="btn btn-outline btn-small">🗑️ Delete</button>
                                 </div>
                               </div>
                             
                               <!-- Add more .receipt-row blocks for each uploaded file -->
                             </div>

                              <!-- Image Preview -->
                              <div id="image-preview" class="hidden" style="margin-bottom: 12px;">
                                <img id="receipt-image-preview" src="" alt="Receipt preview" class="receipt-image-preview">
                              </div>
                            </div>

                    <div class="popout-modal-footer">
                        <button type="button" class="btn btn-outline" id="cancel-transaction">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-transaction" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.setupReceiptFormHandlers();
        this.setupReceiptActionListeners();
        this.setupTransactionClickHandlers(); 
    },

    renderImportReceiptsModal() {
        return `

         <style>
            /* Add responsive camera styles */
            .camera-preview-container {
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 75%; /* 4:3 aspect ratio for camera */
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .camera-preview-container video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: scaleX(-1); /* Mirror for selfie view */
            }
            
            /* For medium screens, ensure proper sizing */
            @media (min-width: 768px) and (max-width: 1024px) {
                .camera-preview-container {
                    padding-bottom: 66.67%; /* 3:2 aspect ratio for medium screens */
                    max-height: 400px;
                }
                
                .camera-section .glass-card {
                    margin: 0 auto;
                    max-width: 600px;
                }
            }
            
            /* For very small screens */
            @media (max-width: 480px) {
                .camera-preview-container {
                    padding-bottom: 100%; /* Square aspect ratio */
                }
            }
        </style>
        
            <div style="padding: 20px;">
                <div class="quick-actions-section">
                    <h2 class="section-title" style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">Upload Method</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <button class="quick-action-btn" id="camera-option" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <div style="font-size: 32px;">📷</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Take Photo</span>
                            <span style="font-size: 12px; color: #6b7280;">Use camera</span>
                        </button>
                        <button class="quick-action-btn" id="upload-option" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <div style="font-size: 32px;">📁</div>
                            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">Upload Files</span>
                            <span style="font-size: 12px; color: #6b7280;">From device</span>
                        </button>
                    </div>
                </div>
                
                <!-- UPLOAD SECTION -->
                <div id="upload-section" style="display: none;">
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
                    
                    <!-- Upload Dropzone -->
                    <div class="upload-dropzone" id="receipt-dropzone">
                        <div class="dropzone-content">
                            <div class="dropzone-icon">📁</div>
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
                </div>
                
               <!-- CAMERA SECTION -->
                   <div class="camera-section" id="camera-section" style="display: none;">
                    <div class="glass-card" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: #1f2937; font-size: 18px;">📷 Camera</h3>
                            <div id="camera-status" style="color: #6b7280; font-size: 14px;">Ready</div>
                        </div>
                        <div class="camera-preview-container">
                        <video id="camera-preview" autoplay playsinline></video>
                        <canvas id="camera-canvas" style="display: none;"></canvas>
                    </div>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                            <button class="btn btn-outline" id="switch-camera">
                                🔄 Switch Camera
                            </button>
                            <button class="btn btn-primary" id="capture-photo">
                                📸 Capture
                            </button>
                            <button class="btn btn-outline" id="cancel-camera">
                                ✖️ Back to Upload
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- RECENT SECTION -->
                <div class="recent-section" id="recent-section" style="display: block;">
                    <div class="glass-card" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; margin-top: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: #1f2937; font-size: 18px;">📋 Recent Receipts</h3>
                            <button class="btn btn-outline" id="refresh-receipts">
                                🔄 Refresh
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
                <div style="text-align: center; color: #6b7280; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No pending receipts</div>
                    <div style="font-size: 14px; color: #6b7280;">Upload receipts to get started</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${receipts.map(receipt => `
                    <div data-receipt-id="${receipt.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                            <div>
                                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${receipt.name}</div>
                                <div style="font-size: 12px; color: #6b7280; display: flex; gap: 8px; align-items: center;">
                                    <span>${this.formatFileSize(receipt.size || 0)}</span>
                                    <span>•</span>
                                    <span class="status-pending">Pending</span>
                                    <span>•</span>
                                    <span>${this.formatFirebaseTimestamp(receipt.uploadedAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-outline process-receipt-btn" 
                                    data-receipt-id="${receipt.id}" 
                                    style="padding: 6px 12px;">
                                🔍 Process
                            </button>
                            <button class="btn btn-danger delete-receipt-btn" 
                                    data-receipt-id="${receipt.id}" 
                                    style="padding: 6px 12px;" 
                                    title="Delete receipt">
                                🗑️
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
                <div style="text-align: center; color: #6b7280; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <h4 style="margin: 0 0 8px 0; color: #6b7280;">No receipts found</h4>
                    <p style="margin: 0; color: #6b7280;">Upload receipts to get started</p>
                </div>
            `;
        }
        
        const recentReceipts = this.receiptQueue.slice(0, 5);
        
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${recentReceipts.map(receipt => {
                    return `
                        <div data-receipt-id="${receipt.id}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div style="font-size: 24px;">📄</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${receipt.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">
                                    <span>${this.formatFileSize(receipt.size || 0)}</span>
                                    <span> • </span>
                                    <span class="status-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-outline process-btn" 
                                        data-receipt-id="${receipt.id}"
                                        style="white-space: nowrap; padding: 6px 12px;">
                                    🔍 Process
                                </button>
                                <button class="btn btn-danger delete-receipt-btn" 
                                        data-receipt-id="${receipt.id}"
                                        style="padding: 6px 12px;" 
                                        title="Delete receipt">
                                    🗑️
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
            <div style="text-align: center; color: #6b7280; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No transactions found</div>
                <div style="font-size: 14px; color: #6b7280;">Add your first transaction to get started</div>
            </div>
        `;
    }

    // Generate unique IDs for each transaction row
    const transactionRows = transactions.map(transaction => {
        const rowId = `transaction-row-${transaction.id}`;
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const icon = isIncome ? '💰' : '💸';
        
        return `
            <div id="${rowId}" class="transaction-item" data-id="${transaction.id}" 
                 style="display: flex; justify-content: space-between; align-items: center; 
                        padding: 16px; background: #f9fafb; border-radius: 8px; 
                        border: 1px solid #e5e7eb; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">${icon}</span>
                    <div>
                        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                            ${transaction.description || 'No description'}
                        </div>
                        <div style="display: flex; gap: 8px; font-size: 12px; color: #6b7280;">
                            <span>${transaction.date || 'No date'}</span>
                            <span>•</span>
                            <span>${transaction.category || 'Uncategorized'}</span>
                            <span>•</span>
                            <span>${transaction.paymentMethod || 'Cash'}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="${amountClass}" style="font-weight: bold; font-size: 16px;">
                        ${isIncome ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    ${transaction.reference ? `
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            Ref: ${transaction.reference}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Store transaction IDs for later event attachment
    this.transactionIds = transactions.map(t => t.id);
    
    return `
        <div style="display: flex; flex-direction: column; gap: 8px;" id="transactions-container">
            ${transactionRows}
        </div>
    `;
},

    setupTransactionClickHandlers() {
    // Clear existing handlers first
    if (this.transactionClickHandler) {
        document.removeEventListener('click', this.transactionClickHandler);
    }
    
    // Use event delegation for transaction items
    this.transactionClickHandler = (e) => {
        const transactionItem = e.target.closest('.transaction-item');
        if (transactionItem) {
            const transactionId = transactionItem.dataset.id;
            if (transactionId) {
                e.preventDefault();
                e.stopPropagation();
                this.editTransaction(transactionId);
            }
        }
    };
    
    document.addEventListener('click', this.transactionClickHandler);
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
                    <h4 style="color: #1f2937; margin-bottom: 16px; font-size: 16px;">💰 Income</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${Object.entries(incomeByCategory).length > 0 ? 
                            Object.entries(incomeByCategory)
                                .sort(([,a], [,b]) => b - a)
                                .map(([category, amount]) => {
                                    const percentage = totalIncome > 0 ? (amount / totalIncome * 100).toFixed(1) : 0;
                                    return `
                                        <div style="margin-bottom: 8px;">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                                <span style="font-size: 14px; color: #1f2937;">${category}</span>
                                                <span style="font-weight: 600; font-size: 14px; color: #10b981;">${this.formatCurrency(amount)}</span>
                                            </div>
                                            <div style="height: 6px; background: #d1fae5; border-radius: 3px; overflow: hidden;">
                                                <div style="height: 100%; width: ${percentage}%; background: #10b981; border-radius: 3px;"></div>
                                            </div>
                                            <div style="text-align: right; font-size: 12px; color: #6b7280; margin-top: 2px;">
                                                ${percentage}%
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            : `
                                <div style="text-align: center; color: #6b7280; padding: 20px;">
                                    No income recorded yet
                                </div>
                            `
                        }
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #1f2937; margin-bottom: 16px; font-size: 16px;">💸 Expenses</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${Object.entries(expensesByCategory).length > 0 ? 
                            Object.entries(expensesByCategory)
                                .sort(([,a], [,b]) => b - a)
                                .map(([category, amount]) => {
                                    const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
                                    return `
                                        <div style="margin-bottom: 8px;">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                                <span style="font-size: 14px; color: #1f2937;">${category}</span>
                                                <span style="font-weight: 600; font-size: 14px; color: #ef4444;">${this.formatCurrency(amount)}</span>
                                            </div>
                                            <div style="height: 6px; background: #fee2e2; border-radius: 3px; overflow: hidden;">
                                                <div style="height: 100%; width: ${percentage}%; background: #ef4444; border-radius: 3px;"></div>
                                            </div>
                                            <div style="text-align: right; font-size: 12px; color: #6b7280; margin-top: 2px;">
                                                ${percentage}%
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            : `
                                <div style="text-align: center; color: #6b7280; padding: 20px;">
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
                    const span = document.createElement('span');
                    span.className = 'receipt-queue-badge';
                    span.id = 'receipt-count-badge';
                    span.textContent = pendingReceipts.length;
                    uploadBtn.appendChild(span);
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
                    <div style="text-align: center; color: #6b7280; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No pending receipts</div>
                        <div style="font-size: 14px; color: #6b7280;">Upload receipts to get started</div>
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
            pendingList.innerHTML = this.renderPendingReceiptsList(pendingReceipts);
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
            processBtn.title = `Process ${pendingCount} pending receipt${pendingCount !== 1 ? 's' : ''}`;
        } else {
            processBtn.style.display = 'none';
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
        return this.transactions
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
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
            return false;
        }
        
        if (file.size > maxSize) {
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
        
        const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
        
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
        this.showNotification('Category analysis feature coming soon!', 'info');
    }
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

// Make module globally available
window.IncomeExpensesModule = IncomeExpensesModule;
