// modules/income-expenses.js - SIMPLE WORKING VERSION
console.log('💰 Loading Income & Expenses module...');

const IncomeExpensesModule = {
    name: 'income-expenses',
    initialized: false,
    element: null,
    transactions: [],
    receiptQueue: [],
    cameraStream: null,
    
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
                /* CRITICAL MODAL FIX */
                #import-receipts-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                }
                
                #import-receipts-modal:not(.hidden) {
                    display: flex !important;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow: auto;
                }
                
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 10px;
                }
                
                .btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }
                
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }
                
                .btn-outline {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }
                
                .drag-drop-area {
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    padding: 40px 20px;
                    text-align: center;
                    background: #f9fafb;
                    cursor: pointer;
                    margin-bottom: 20px;
                }
                
                .drag-drop-area.drag-over {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }
                
                .camera-preview {
                    width: 100%;
                    height: 300px;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                
                .camera-preview video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .hidden {
                    display: none !important;
                }
            </style>

            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header" style="margin-bottom: 30px;">
                    <h1 style="margin: 0 0 8px 0; color: #1f2937;">Income & Expenses</h1>
                    <p style="margin: 0 0 20px 0; color: #6b7280;">Track farm finances and cash flow</p>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-primary" id="add-transaction">
                            ➕ Add Transaction
                        </button>
                        <button class="btn btn-primary" id="upload-receipt-btn">
                            📄 Import Receipts
                            ${pendingReceipts.length > 0 ? `<span style="background: #ef4444; color: white; border-radius: 10px; padding: 2px 6px; margin-left: 8px;">${pendingReceipts.length}</span>` : ''}
                        </button>
                    </div>
                </div>

                <!-- Pending Receipts -->
                ${pendingReceipts.length > 0 ? `
                    <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="margin: 0; color: #1f2937;">📋 Pending Receipts (${pendingReceipts.length})</h3>
                            <button class="btn btn-primary" id="process-all-receipts">
                                ⚡ Process All
                            </button>
                        </div>
                        ${this.renderPendingReceiptsList(pendingReceipts)}
                    </div>
                ` : ''}

                <!-- Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="color: #6b7280; margin-bottom: 8px;">Total Income</div>
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">${this.formatCurrency(stats.totalIncome)}</div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="color: #6b7280; margin-bottom: 8px;">Total Expenses</div>
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${this.formatCurrency(stats.totalExpenses)}</div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="color: #6b7280; margin-bottom: 8px;">Net Income</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${stats.netIncome >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(stats.netIncome)}</div>
                    </div>
                </div>
            </div>

            <!-- Import Receipts Modal -->
            <div id="import-receipts-modal" class="hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="margin: 0;">📥 Import Receipts</h3>
                        <button class="btn btn-outline" id="close-import-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="modal-content-area">
                            <!-- Will be filled dynamically -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancel-import">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // ==================== MODAL FUNCTIONS ====================
    showImportReceiptsModal() {
        console.log('📥 Showing import receipts modal');
        
        // Stop any running camera
        this.stopCamera();
        
        const modal = document.getElementById('import-receipts-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Set modal content
            const contentArea = document.getElementById('modal-content-area');
            if (contentArea) {
                contentArea.innerHTML = this.renderImportReceiptsContent();
            }
            
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

    renderImportReceiptsContent() {
        return `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #374151;">Choose Method</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <button class="btn btn-outline" id="camera-option" style="display: flex; flex-direction: column; align-items: center; padding: 24px 16px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📷</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Take Photo</div>
                        <div style="font-size: 12px; color: #6b7280;">Use camera</div>
                    </button>
                    <button class="btn btn-outline" id="upload-option" style="display: flex; flex-direction: column; align-items: center; padding: 24px 16px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Upload Files</div>
                        <div style="font-size: 12px; color: #6b7280;">From device</div>
                    </button>
                </div>
            </div>
            
            <!-- Camera Section (hidden by default) -->
            <div id="camera-section" class="hidden">
                <div class="camera-preview">
                    <video id="camera-preview" autoplay playsinline></video>
                </div>
                <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;">
                    <button class="btn btn-outline" id="switch-camera">🔄 Switch</button>
                    <button class="btn btn-primary" id="capture-photo">📸 Capture</button>
                    <button class="btn btn-outline" id="back-to-options">← Back</button>
                </div>
                <div id="camera-status" style="text-align: center; color: #6b7280; font-size: 14px;">Ready</div>
            </div>
            
            <!-- Upload Section (hidden by default) -->
            <div id="upload-section" class="hidden">
                <div class="drag-drop-area" id="drop-area">
                    <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Drop files here</div>
                    <div style="color: #6b7280; margin-bottom: 16px;">or click to browse</div>
                    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">JPG</span>
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PNG</span>
                        <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PDF</span>
                    </div>
                </div>
                <input type="file" id="file-input" accept="image/*,.pdf" multiple style="display: none;">
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-outline" id="back-to-options-upload">← Back to Options</button>
                </div>
            </div>
            
            <!-- Recent Receipts -->
            <div id="recent-section">
                <h4 style="margin: 24px 0 16px 0; color: #374151;">📋 Recent Receipts</h4>
                ${this.receiptQueue.length > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${this.receiptQueue.slice(0, 5).map(receipt => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                                    <div>
                                        <div style="font-weight: 600;">${receipt.name}</div>
                                        <div style="font-size: 12px; color: #6b7280;">${this.formatFileSize(receipt.size || 0)} • ${receipt.status || 'pending'}</div>
                                    </div>
                                </div>
                                <button class="btn btn-outline btn-sm" onclick="IncomeExpensesModule.processReceipt('${receipt.id}')" style="padding: 4px 8px; font-size: 12px;">
                                    Process
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 20px; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                        <div>No receipts yet</div>
                    </div>
                `}
            </div>
        `;
    },

    // ==================== CAMERA FUNCTIONS ====================
    showCameraInterface() {
        console.log('📷 Showing camera interface');
        
        document.getElementById('camera-section').classList.remove('hidden');
        document.getElementById('upload-section').classList.add('hidden');
        document.getElementById('recent-section').classList.add('hidden');
        
        this.initializeCamera();
    },

    initializeCamera() {
        console.log('Initializing camera...');
        
        const video = document.getElementById('camera-preview');
        const status = document.getElementById('camera-status');
        
        if (!video) {
            console.error('Camera preview element not found');
            return;
        }
        
        // Stop any existing stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        
        if (status) status.textContent = 'Starting camera...';
        
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false 
        })
        .then(stream => {
            console.log('✅ Camera access granted');
            this.cameraStream = stream;
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                video.play();
                if (status) status.textContent = 'Camera ready';
            };
        })
        .catch(error => {
            console.error('Camera error:', error);
            if (status) status.textContent = 'Camera error';
            this.showNotification('Camera access denied', 'error');
        });
    },

    capturePhoto() {
        console.log('Capturing photo...');
        
        const video = document.getElementById('camera-preview');
        const canvas = document.createElement('canvas');
        const status = document.getElementById('camera-status');
        
        if (!video || !this.cameraStream) {
            this.showNotification('Camera not ready', 'error');
            return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (status) status.textContent = 'Processing...';
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        const timestamp = Date.now();
        
        const receipt = {
            id: 'camera_' + timestamp,
            name: 'receipt_' + timestamp + '.jpg',
            dataURL: dataURL,
            size: Math.floor(dataURL.length * 0.75),
            type: 'image/jpeg',
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            source: 'camera'
        };
        
        this.receiptQueue.unshift(receipt);
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        
        if (status) status.textContent = 'Photo saved!';
        this.showNotification('Receipt saved successfully', 'success');
        
        // Update UI
        this.updateReceiptsDisplay();
        
        // Go back to options after 2 seconds
        setTimeout(() => {
            this.showOptionsView();
        }, 2000);
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const video = document.getElementById('camera-preview');
        if (video) {
            video.srcObject = null;
        }
    },

    // ==================== UPLOAD FUNCTIONS ====================
    showUploadInterface() {
        console.log('📁 Showing upload interface');
        
        document.getElementById('upload-section').classList.remove('hidden');
        document.getElementById('camera-section').classList.add('hidden');
        document.getElementById('recent-section').classList.add('hidden');
        
        this.setupDragAndDrop();
    },

    showOptionsView() {
        document.getElementById('camera-section').classList.add('hidden');
        document.getElementById('upload-section').classList.add('hidden');
        document.getElementById('recent-section').classList.remove('hidden');
        this.stopCamera();
    },

    setupDragAndDrop() {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        
        if (!dropArea || !fileInput) return;
        
        // Click to browse
        dropArea.onclick = () => {
            fileInput.click();
        };
        
        // File input change
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleFiles(e.target.files);
                fileInput.value = '';
            }
        };
        
        // Drag and drop
        dropArea.ondragover = (e) => {
            e.preventDefault();
            dropArea.classList.add('drag-over');
        };
        
        dropArea.ondragleave = (e) => {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
        };
        
        dropArea.ondrop = (e) => {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
            }
        };
    },

    handleFiles(files) {
        console.log('Handling files:', files.length);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file
            if (!file.type.match('image.*') && file.type !== 'application/pdf') {
                this.showNotification(`Skipped ${file.name}: Not an image or PDF`, 'warning');
                continue;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                this.showNotification(`Skipped ${file.name}: File too large`, 'warning');
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
                
                this.receiptQueue.unshift(receipt);
                localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
                
                this.showNotification(`Uploaded: ${file.name}`, 'success');
                this.updateReceiptsDisplay();
            };
            
            reader.readAsDataURL(file);
        }
        
        // Update recent section
        const recentSection = document.getElementById('recent-section');
        if (recentSection) {
            recentSection.innerHTML = `
                <h4 style="margin: 24px 0 16px 0; color: #374151;">📋 Recent Receipts</h4>
                ${this.receiptQueue.slice(0, 5).map(receipt => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                            <div>
                                <div style="font-weight: 600;">${receipt.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">${this.formatFileSize(receipt.size || 0)} • ${receipt.status || 'pending'}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="IncomeExpensesModule.processReceipt('${receipt.id}')" style="padding: 4px 8px; font-size: 12px;">
                            Process
                        </button>
                    </div>
                `).join('')}
            `;
        }
    },

    // ==================== EVENT HANDLERS ====================
    setupEventListeners() {
        // Main buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'upload-receipt-btn' || e.target.closest('#upload-receipt-btn')) {
                this.showImportReceiptsModal();
            }
            
            if (e.target.id === 'add-transaction' || e.target.closest('#add-transaction')) {
                this.showTransactionModal();
            }
            
            if (e.target.id === 'process-all-receipts' || e.target.closest('#process-all-receipts')) {
                this.processAllReceipts();
            }
        });
    },

    setupModalHandlers() {
        // Modal close buttons
        const closeModal = () => this.hideImportReceiptsModal();
        document.getElementById('close-import-modal')?.addEventListener('click', closeModal);
        document.getElementById('cancel-import')?.addEventListener('click', closeModal);
        
        // Camera option
        document.getElementById('camera-option')?.addEventListener('click', () => {
            this.showCameraInterface();
        });
        
        // Upload option
        document.getElementById('upload-option')?.addEventListener('click', () => {
            this.showUploadInterface();
        });
        
        // Camera controls
        document.getElementById('switch-camera')?.addEventListener('click', () => {
            this.switchCamera();
        });
        
        document.getElementById('capture-photo')?.addEventListener('click', () => {
            this.capturePhoto();
        });
        
        document.getElementById('back-to-options')?.addEventListener('click', () => {
            this.showOptionsView();
        });
        
        document.getElementById('back-to-options-upload')?.addEventListener('click', () => {
            this.showOptionsView();
        });
    },

    switchCamera() {
        console.log('Switching camera...');
        // For now, just reinitialize with same mode
        this.stopCamera();
        setTimeout(() => {
            this.initializeCamera();
        }, 300);
    },

    // ==================== RECEIPT PROCESSING ====================
    processReceipt(receiptId) {
        console.log('Processing receipt:', receiptId);
        const receipt = this.receiptQueue.find(r => r.id === receiptId);
        
        if (receipt) {
            this.showNotification(`Processing ${receipt.name}`, 'info');
            
            // In a real app, you would process the receipt here
            // For now, just mark as processed
            receipt.status = 'processed';
            localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
            
            this.showNotification(`${receipt.name} processed`, 'success');
            this.updateReceiptsDisplay();
        }
    },

    processAllReceipts() {
        const pending = this.receiptQueue.filter(r => r.status === 'pending');
        
        if (pending.length === 0) {
            this.showNotification('No pending receipts to process', 'info');
            return;
        }
        
        pending.forEach(receipt => {
            receipt.status = 'processed';
        });
        
        localStorage.setItem('local-receipts', JSON.stringify(this.receiptQueue));
        
        this.showNotification(`Processed ${pending.length} receipt(s)`, 'success');
        this.updateReceiptsDisplay();
    },

    updateReceiptsDisplay() {
        // Update the main UI
        this.renderModule();
        
        // Also update modal if open
        const recentSection = document.getElementById('recent-section');
        if (recentSection && !recentSection.classList.contains('hidden')) {
            recentSection.innerHTML = `
                <h4 style="margin: 24px 0 16px 0; color: #374151;">📋 Recent Receipts</h4>
                ${this.receiptQueue.slice(0, 5).map(receipt => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                            <div>
                                <div style="font-weight: 600;">${receipt.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">${this.formatFileSize(receipt.size || 0)} • ${receipt.status || 'pending'}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="IncomeExpensesModule.processReceipt('${receipt.id}')" style="padding: 4px 8px; font-size: 12px;">
                            Process
                        </button>
                    </div>
                `).join('')}
            `;
        }
    },

    // ==================== HELPER METHODS ====================
    renderPendingReceiptsList(receipts) {
        if (receipts.length === 0) return '<div style="color: #6b7280; text-align: center;">No pending receipts</div>';
        
        return receipts.map(receipt => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">${receipt.type?.startsWith('image/') ? '🖼️' : '📄'}</div>
                    <div>
                        <div style="font-weight: 600;">${receipt.name}</div>
                        <div style="font-size: 12px; color: #6b7280;">${this.formatFileSize(receipt.size || 0)} • ${receipt.status || 'pending'}</div>
                    </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="IncomeExpensesModule.processReceipt('${receipt.id}')" style="padding: 4px 8px; font-size: 12px;">
                    Process
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
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    showTransactionModal() {
        // Simple transaction modal
        alert('Add Transaction feature would open here. For now, receipts work!');
    }
};

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('income-expenses', IncomeExpensesModule);
    console.log('✅ Income & Expenses module registered');
}

// Make it globally available
window.IncomeExpensesModule = IncomeExpensesModule;
