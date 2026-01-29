// modules/income-expenses.js - WORKING CAMERA & UPLOAD VERSION
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    receiptQueue: [],
    cameraStream: null,
    cameraFacingMode: 'environment',
    isCameraInitialized: false,
    
    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('💰 Initializing Income & Expenses...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        this.receiptQueue = JSON.parse(localStorage.getItem('local-receipts') || '[]');
        this.transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Income & Expenses initialized');
        return true;
    },

    // ==================== RENDER MODULE ====================
    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const pendingReceipts = this.receiptQueue.filter(r => r.status === 'pending');

        this.element.innerHTML = `
            <style>
                /* ============ MODAL FIXES ============ */
                #import-receipts-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                #import-receipts-modal:not(.hidden) {
                    display: flex !important;
                }
                
                #import-receipts-content {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }
                
                .modal-body {
                    padding: 20px;
                    flex: 1;
                    overflow-y: auto;
                }
                
                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 12px;
                    background: #f8fafc;
                }
                
                /* ============ BUTTON STYLES ============ */
                .btn {
                    padding: 12px 20px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                
                .btn-outline {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }
                
                .btn-outline:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }
                
                .btn-sm {
                    padding: 8px 16px;
                    font-size: 13px;
                }
                
                /* ============ DRAG & DROP ============ */
                .drag-drop-area {
                    border: 3px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    background: #f9fafb;
                    cursor: pointer;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                }
                
                .drag-drop-area:hover {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }
                
                .drag-drop-area.drag-over {
                    border-color: #3b82f6;
                    background: #eff6ff;
                    border-style: solid;
                }
                
                /* ============ CAMERA STYLES ============ */
                .camera-container {
                    width: 100%;
                    margin-bottom: 20px;
                }
                
                .camera-preview {
                    width: 100%;
                    height: 300px;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 16px;
                }
                
                .camera-preview video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scaleX(-1); /* Mirror for front camera feel */
                }
                
                .camera-controls {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                /* ============ UTILITY ============ */
                .hidden {
                    display: none !important;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 16px 0;
                }
                
                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .option-card {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 24px 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                
                .option-card:hover {
                    border-color: #3b82f6;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .option-card .icon {
                    font-size: 32px;
                }
                
                .option-card .title {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 14px;
                }
                
                .option-card .subtitle {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                /* ============ RECEIPT LIST ============ */
                .receipt-list {
                    max-height: 200px;
                    overflow-y: auto;
                    margin-top: 16px;
                }
                
                .receipt-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border: 1px solid #e5e7eb;
                }
                
                .receipt-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .receipt-icon {
                    font-size: 24px;
                }
                
                .receipt-name {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                }
                
                .receipt-meta {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                /* ============ STATUS ============ */
                .status-pending {
                    color: #f59e0b;
                    font-weight: 600;
                }
                
                .status-processed {
                    color: #10b981;
                    font-weight: 600;
                }
            </style>

            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px;">Income & Expenses</h1>
                    <p style="margin: 0 0 20px 0; color: #6b7280;">Track farm finances and cash flow</p>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-primary" id="add-transaction">
                            <span style="font-size: 18px;">➕</span>
                            <span>Add Transaction</span>
                        </button>
                        <button class="btn btn-primary" id="upload-receipt-btn">
                            <span style="font-size: 18px;">📄</span>
                            <span>Import Receipts</span>
                            ${pendingReceipts.length > 0 ? `
                                <span style="background: #ef4444; color: white; border-radius: 10px; padding: 2px 8px; margin-left: 8px; font-size: 12px;">
                                    ${pendingReceipts.length}
                                </span>
                            ` : ''}
                        </button>
                    </div>
                </div>

                <!-- Pending Receipts -->
                ${pendingReceipts.length > 0 ? `
                    <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: #1f2937; font-size: 18px;">
                                <span style="font-size: 20px;">📋</span>
                                Pending Receipts (${pendingReceipts.length})
                            </h3>
                            <button class="btn btn-primary" id="process-all-receipts">
                                <span style="font-size: 16px;">⚡</span>
                                <span>Process All</span>
                            </button>
                        </div>
                        <div class="receipt-list">
                            ${this.renderPendingReceiptsList(pendingReceipts)}
                        </div>
                    </div>
                ` : ''}

                <!-- Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="font-size: 24px; color: #10b981;">💰</div>
                            <div>
                                <div style="color: #6b7280; font-size: 14px;">Total Income</div>
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${this.formatCurrency(stats.totalIncome)}</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="font-size: 24px; color: #ef4444;">📊</div>
                            <div>
                                <div style="color: #6b7280; font-size: 14px;">Total Expenses</div>
                                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${this.formatCurrency(stats.totalExpenses)}</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="font-size: 24px; color: ${stats.netIncome >= 0 ? '#10b981' : '#ef4444'};">📈</div>
                            <div>
                                <div style="color: #6b7280; font-size: 14px;">Net Income</div>
                                <div style="font-size: 24px; font-weight: bold; color: ${stats.netIncome >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(stats.netIncome)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="hidden">
                <div id="import-receipts-content">
                    <div class="modal-header">
                        <h3 style="margin: 0; color: #1f2937;">📥 Import Receipts</h3>
                        <button class="btn btn-outline btn-sm" id="close-import-modal" style="padding: 8px; width: 36px; height: 36px; font-size: 20px;">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-body-content">
                        <!-- Content loaded dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancel-import" style="flex: 1;">Cancel</button>
                    </div>
                </div>
            </div>
            
            <!-- Canvas for capturing photos (hidden) -->
            <canvas id="camera-canvas" style="display: none;"></canvas>
        `;

        this.setupEventListeners();
    },

    // ==================== MODAL FUNCTIONS ====================
    showImportReceiptsModal() {
        console.log('📥 Showing import receipts modal');
        
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            this.showMainOptions();
            
            // Setup modal handlers
            setTimeout(() => {
                this.setupModalHandlers();
            }, 100);
        }
    },

    hideImportReceiptsModal() {
        console.log('❌ Hiding import receipts modal');
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showMainOptions() {
        const body = document.getElementById('modal-body-content');
        if (!body) return;
        
        body.innerHTML = `
            <div>
                <div class="section-title">Choose Upload Method</div>
                <div class="card-grid">
                    <div class="option-card" id="camera-option">
                        <div class="icon">📷</div>
                        <div class="title">Take Photo</div>
                        <div class="subtitle">Use camera</div>
                    </div>
                    <div class="option-card" id="upload-option">
                        <div class="icon">📁</div>
                        <div class="title">Upload Files</div>
                        <div class="subtitle">From device</div>
                    </div>
                </div>
                
                <div class="section-title">Recent Receipts</div>
                ${this.receiptQueue.length > 0 ? `
                    <div class="receipt-list">
                        ${this.receiptQueue.slice(0, 5).map(receipt => `
                            <div class="receipt-item">
                                <div class="receipt-info">
                                    <div class="receipt-icon">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                                    <div>
                                        <div class="receipt-name">${receipt.name}</div>
                                        <div class="receipt-meta">
                                            ${this.formatFileSize(receipt.size || 0)} • 
                                            <span class="status-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-outline btn-sm process-btn" data-id="${receipt.id}">
                                    🔍 Process
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                        <div>No receipts yet</div>
                        <div style="font-size: 14px; margin-top: 8px;">Upload or take photos to get started</div>
                    </div>
                `}
            </div>
        `;
    },

    // ==================== CAMERA FUNCTIONS ====================
    showCameraInterface() {
        console.log('📷 Showing camera interface');
        
        const body = document.getElementById('modal-body-content');
        if (!body) return;
        
        body.innerHTML = `
            <div>
                <div class="section-title">Camera</div>
                <div class="camera-container">
                    <div class="camera-preview">
                        <video id="camera-preview" autoplay playsinline></video>
                        <div id="camera-status" style="position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; color: white; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
                            Initializing camera...
                        </div>
                    </div>
                    <div class="camera-controls">
                        <button class="btn btn-outline" id="switch-camera">
                            <span>🔄</span>
                            <span>Switch</span>
                        </button>
                        <button class="btn btn-primary" id="capture-photo">
                            <span>📸</span>
                            <span>Capture</span>
                        </button>
                        <button class="btn btn-outline" id="back-to-options">
                            <span>←</span>
                            <span>Back</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.initializeCamera();
    },

    initializeCamera() {
        console.log('📷 Initializing camera...');
        
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('❌ Camera preview element not found');
            this.showNotification('Camera preview not available', 'error');
            return;
        }
        
        // Clear any existing stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        video.srcObject = null;
        
        if (status) {
            status.textContent = 'Requesting camera access...';
        }
        
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
                this.isCameraInitialized = true;
                
                video.onloadedmetadata = () => {
                    video.play().then(() => {
                        console.log('📹 Video is playing');
                        if (status) {
                            status.textContent = 'Ready - Tap capture button';
                        }
                    }).catch(error => {
                        console.error('❌ Video play error:', error);
                        if (status) {
                            status.textContent = 'Playback error';
                        }
                        this.showNotification('Failed to start camera', 'error');
                    });
                };
                
                video.onerror = (error) => {
                    console.error('❌ Video error:', error);
                    if (status) {
                        status.textContent = 'Camera error';
                    }
                };
            })
            .catch(error => {
                console.error('❌ Camera access error:', error);
                if (status) {
                    status.textContent = 'Camera denied';
                }
                
                let errorMessage = 'Camera access denied';
                if (error.name === 'NotFoundError') {
                    errorMessage = 'No camera found on this device';
                } else if (error.name === 'NotAllowedError') {
                    errorMessage = 'Camera permission denied. Please enable camera access in browser settings.';
                }
                
                this.showNotification(errorMessage, 'error');
                
                // Fallback to upload interface
                setTimeout(() => {
                    this.showUploadInterface();
                }, 1000);
            });
    },

    capturePhoto() {
        console.log('📸 Capturing photo...');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const status = document.getElementById('camera-status');
        
        if (!video || !canvas) {
            console.error('Camera elements not found');
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        if (!this.cameraStream || video.paused) {
            console.error('Camera not ready');
            this.showNotification('Camera not ready. Please wait.', 'error');
            return;
        }
        
        if (status) status.textContent = 'Capturing...';
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        
        try {
            // Draw the current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Flash effect
            video.style.filter = 'brightness(150%) contrast(120%)';
            setTimeout(() => {
                video.style.filter = '';
            }, 200);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/jpeg', 0.85);
            
            if (status) status.textContent = 'Saving...';
            
            // Create receipt object
            const timestamp = Date.now();
            const receipt = {
                id: `camera_${timestamp}`,
                name: `receipt_${timestamp}.jpg`,
                dataURL: dataURL,
                size: Math.floor(dataURL.length * 0.75), // Approximate size
                type: 'image/jpeg',
                status: 'pending',
                uploadedAt: new Date().toISOString(),
                source: 'camera'
            };
            
            // Save locally
            this.saveReceiptLocally(receipt);
            
            if (status) status.textContent = 'Saved!';
            
            this.showNotification('✅ Receipt saved!', 'success');
            
            // Update UI
            this.updateReceiptsDisplay();
            
            // Show success and return to main view
            setTimeout(() => {
                this.showMainOptions();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Capture error:', error);
            if (status) status.textContent = 'Error';
            this.showNotification('Failed to capture photo', 'error');
        }
    },

    stopCamera() {
        console.log('🛑 Stopping camera...');
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            this.cameraStream = null;
        }
        
        this.isCameraInitialized = false;
        
        const video = document.getElementById('camera-preview');
        if (video) {
            video.srcObject = null;
            video.pause();
        }
    },

    switchCamera() {
        console.log('🔄 Switching camera...');
        
        this.cameraFacingMode = this.cameraFacingMode === 'environment' ? 'user' : 'environment';
        this.stopCamera();
        
        setTimeout(() => {
            this.initializeCamera();
        }, 300);
    },

    // ==================== UPLOAD FUNCTIONS ====================
    showUploadInterface() {
        console.log('📁 Showing upload interface');
        
        const body = document.getElementById('modal-body-content');
        if (!body) return;
        
        body.innerHTML = `
            <div>
                <div class="section-title">Upload Files</div>
                <div class="drag-drop-area" id="drop-area">
                    <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">Drop files here</div>
                    <div style="color: #6b7280; margin-bottom: 16px;">or click to browse</div>
                    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">JPG</span>
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">PNG</span>
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">PDF</span>
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">HEIC</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 24px;">
                    <button class="btn btn-outline" id="back-to-options-upload">
                        <span>←</span>
                        <span>Back to Options</span>
                    </button>
                </div>
                
                <input type="file" id="file-input" accept="image/*,.pdf,.heic,.heif" multiple style="display: none;">
            </div>
        `;
        
        this.setupDragAndDrop();
    },

    setupDragAndDrop() {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        
        if (!dropArea || !fileInput) return;
        
        // Remove existing listeners
        dropArea.onclick = null;
        dropArea.ondragover = null;
        dropArea.ondragleave = null;
        dropArea.ondrop = null;
        fileInput.onchange = null;
        
        // Click to browse
        dropArea.onclick = () => {
            console.log('📁 Drop area clicked');
            fileInput.click();
        };
        
        // File input change
        fileInput.onchange = (e) => {
            console.log('📁 File input changed');
            if (e.target.files && e.target.files.length > 0) {
                this.handleFiles(e.target.files);
                fileInput.value = '';
            }
        };
        
        // Drag over
        dropArea.ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
        };
        
        // Drag leave
        dropArea.ondragleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
        };
        
        // Drop
        dropArea.ondrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            
            console.log('📁 Files dropped');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
            }
        };
    },

    handleFiles(files) {
        console.log(`📁 Processing ${files.length} file(s)`);
        
        let processedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];
            if (!validTypes.includes(file.type.toLowerCase())) {
                console.warn(`Skipped ${file.name}: Invalid type ${file.type}`);
                skippedCount++;
                continue;
            }
            
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                console.warn(`Skipped ${file.name}: File too large (${file.size} bytes)`);
                skippedCount++;
                continue;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const receipt = {
                    id: 'upload_' + Date.now() + '_' + i,
                    name: file.name,
                    dataURL: e.target.result,
                    size: file.size,
                    type: file.type,
                    status: 'pending',
                    uploadedAt: new Date().toISOString(),
                    source: 'upload'
                };
                
                this.saveReceiptLocally(receipt);
                processedCount++;
                
                console.log(`✅ Saved: ${file.name}`);
                
                // If this is the last file, show notification
                if (processedCount + skippedCount === files.length) {
                    let message = `Uploaded ${processedCount} file${processedCount !== 1 ? 's' : ''}`;
                    if (skippedCount > 0) {
                        message += ` (skipped ${skippedCount})`;
                    }
                    this.showNotification(message, 'success');
                    
                    // Update UI
                    this.updateReceiptsDisplay();
                    this.showMainOptions();
                }
            };
            
            reader.onerror = () => {
                console.error(`Failed to read file: ${file.name}`);
                skippedCount++;
            };
            
            reader.readAsDataURL(file);
        }
        
        if (files.length === 0) {
            this.showNotification('No files selected', 'warning');
        }
    },

    saveReceiptLocally(receipt) {
        this.receiptQueue.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        console.log(`💾 Saved receipt to localStorage: ${receipt.name}`);
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        // Remove existing listeners
        const oldHandler = this._globalClickHandler;
        if (oldHandler) {
            document.removeEventListener('click', oldHandler);
        }
        
        // New global click handler
        this._globalClickHandler = (e) => {
            // Import Receipts button
            if (e.target.id === 'upload-receipt-btn' || e.target.closest('#upload-receipt-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.showImportReceiptsModal();
            }
            
            // Add Transaction button
            if (e.target.id === 'add-transaction' || e.target.closest('#add-transaction')) {
                e.preventDefault();
                e.stopPropagation();
                this.showTransactionModal();
            }
            
            // Process All button
            if (e.target.id === 'process-all-receipts' || e.target.closest('#process-all-receipts')) {
                e.preventDefault();
                e.stopPropagation();
                this.processAllReceipts();
            }
        };
        
        document.addEventListener('click', this._globalClickHandler);
    },

    setupModalHandlers() {
        // Modal close buttons
        const closeModal = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideImportReceiptsModal();
        };
        
        document.getElementById('close-import-modal')?.addEventListener('click', closeModal);
        document.getElementById('cancel-import')?.addEventListener('click', closeModal);
        
        // Camera option
        document.getElementById('camera-option')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showCameraInterface();
        });
        
        // Upload option
        document.getElementById('upload-option')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showUploadInterface();
        });
        
        // Camera controls (delegated since they're created dynamically)
        document.addEventListener('click', (e) => {
            // Switch camera
            if (e.target.id === 'switch-camera' || e.target.closest('#switch-camera')) {
                e.preventDefault();
                e.stopPropagation();
                this.switchCamera();
            }
            
            // Capture photo
            if (e.target.id === 'capture-photo' || e.target.closest('#capture-photo')) {
                e.preventDefault();
                e.stopPropagation();
                this.capturePhoto();
            }
            
            // Back to options from camera
            if (e.target.id === 'back-to-options' || e.target.closest('#back-to-options')) {
                e.preventDefault();
                e.stopPropagation();
                this.showMainOptions();
                this.stopCamera();
            }
            
            // Back to options from upload
            if (e.target.id === 'back-to-options-upload' || e.target.closest('#back-to-options-upload')) {
                e.preventDefault();
                e.stopPropagation();
                this.showMainOptions();
            }
            
            // Process individual receipt buttons
            if (e.target.classList.contains('process-btn') || e.target.closest('.process-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.process-btn');
                const receiptId = btn?.dataset?.id;
                if (receiptId) {
                    this.processReceipt(receiptId);
                }
            }
        });
    },

    // ==================== RECEIPT PROCESSING ====================
    processReceipt(receiptId) {
        console.log('🔍 Processing receipt:', receiptId);
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        
        if (receipt) {
            this.showNotification(`Processing "${receipt.name}"...`, 'info');
            
            // Mark as processed
            receipt.status = 'processed';
            localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
            
            this.showNotification(`✅ "${receipt.name}" processed`, 'success');
            this.updateReceiptsDisplay();
        }
    },

    processAllReceipts() {
        const pending = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pending.length === 0) {
            this.showNotification('No pending receipts to process', 'info');
            return;
        }
        
        this.showNotification(`Processing ${pending.length} receipt${pending.length !== 1 ? 's' : ''}...`, 'info');
        
        pending.forEach(receipt => {
            receipt.status = 'processed';
        });
        
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        
        this.showNotification(`✅ Processed ${pending.length} receipt${pending.length !== 1 ? 's' : ''}`, 'success');
        this.updateReceiptsDisplay();
    },

    updateReceiptsDisplay() {
        // Re-render the module to update everything
        this.renderModule();
        
        // Also update modal if open
        const modal = document.getElementById('import-receipts-modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.showMainOptions();
        }
    },

    // ==================== HELPER METHODS ====================
    renderPendingReceiptsList(receipts) {
        if (receipts.length === 0) return '<div style="color: #6b7280; text-align: center; padding: 20px;">No pending receipts</div>';
        
        return receipts.map(receipt => `
            <div class="receipt-item">
                <div class="receipt-info">
                    <div class="receipt-icon">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                    <div>
                        <div class="receipt-name">${receipt.name}</div>
                        <div class="receipt-meta">
                            ${this.formatFileSize(receipt.size || 0)} • 
                            <span class="status-${receipt.status || 'pending'}">${receipt.status || 'pending'}</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="IncomeExpensesModule.processReceipt('${receipt.id}')">
                    🔍 Process
                </button>
            </div>
        `).join('');
    },

    calculateStats() {
        const income = this.transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = this.transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const net = income - expenses;
        
        return {
            totalIncome: income,
            totalExpenses: expenses,
            netIncome: net,
            transactionCount: this.transactions.length
        };
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
        console.log(`${type}: ${message}`);
        
        // Remove existing notification
        const existing = document.getElementById('income-expenses-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'income-expenses-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 100000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Add animation style
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    showTransactionModal() {
        alert('Add Transaction feature would open here.\n\nFor this demo, focus on:\n1. 📸 Take photos with camera\n2. 📁 Upload files\n3. 🔍 Process receipts');
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

// Make it globally available
window.IncomeExpensesModule = IncomeExpensesModule;
