// upload-system.js - COMPLETE UPLOAD SYSTEM FUNCTIONALITY
class UploadSystem {
    constructor() {
        this.currentMode = 'receipts';
        this.receiptFiles = [];
        this.transactionFiles = [];
        this.parsedTransactions = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        
        this.initialize();
    }
    
    initialize() {
        console.log('🚀 Upload System Initializing...');
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        console.log('✅ Upload System Ready!');
    }
    
    initializeElements() {
        // Mode toggle
        this.modeInputs = document.querySelectorAll('input[name="upload-mode"]');
        
        // Sections
        this.sections = {
            receipts: document.querySelector('[data-mode="receipts"]'),
            transactions: document.querySelector('[data-mode="transactions"]')
        };
        
        // Receipt elements
        this.receiptElements = {
            dropzone: document.getElementById('receipt-dropzone'),
            fileInput: document.getElementById('receipt-file-input'),
            progressContainer: document.getElementById('receipt-progress-container'),
            progressFill: document.getElementById('receipt-progress-fill'),
            fileInfo: document.getElementById('receipt-file-info'),
            progressText: document.getElementById('receipt-progress-text'),
            cancelBtn: document.getElementById('cancel-receipt-upload'),
            filesList: document.getElementById('receipt-files-list'),
            countBadge: document.getElementById('receipt-count'),
            processBtn: document.getElementById('process-receipts-btn'),
            template: document.getElementById('receipt-file-template')
        };
        
        // Transaction elements
        this.transactionElements = {
            dropzone: document.getElementById('transaction-dropzone'),
            fileInput: document.getElementById('transaction-file-input'),
            progressContainer: document.getElementById('transaction-progress-container'),
            progressFill: document.getElementById('transaction-progress-fill'),
            fileInfo: document.getElementById('transaction-file-info'),
            progressText: document.getElementById('transaction-progress-text'),
            cancelBtn: document.getElementById('cancel-transaction-upload'),
            previewTable: document.getElementById('transaction-preview'),
            countBadge: document.getElementById('transaction-count'),
            importBtn: document.getElementById('import-transactions-btn'),
            rowTemplate: document.getElementById('transaction-row-template'),
            summaryTotal: document.getElementById('summary-total'),
            summaryAmount: document.getElementById('summary-amount'),
            summaryDateRange: document.getElementById('summary-date-range'),
            previewPrev: document.getElementById('preview-prev'),
            previewNext: document.getElementById('preview-next'),
            previewRange: document.getElementById('preview-range'),
            clearPreview: document.getElementById('clear-preview')
        };
        
        // Common elements
        this.commonElements = {
            statusMessage: document.getElementById('status-message'),
            processButtons: document.querySelectorAll('.btn-process')
        };
    }
    
   setupEventListeners() {
    // Check if browse button exists
    if (!this.browseBtn) {
        console.error('❌ UploadSystem: Browse button not found');
        this.browseBtn = document.getElementById('browse-receipts-btn') || 
                        document.getElementById('upload-receipt-btn');
    }
    
    if (this.browseBtn) {
        this.browseBtn.addEventListener('click', () => this.openFileDialog());
    } else {
        console.warn('⚠️ UploadSystem: No browse button found, skipping');
    }
    
    // Check if file input exists
    if (!this.fileInput) {
        console.error('❌ UploadSystem: File input not found');
        this.fileInput = document.getElementById('receipt-upload-input');
    }
    
    if (this.fileInput) {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    } else {
        console.warn('⚠️ UploadSystem: No file input found, will create dynamically');
    }

       // Add null checks:
        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => this.openFileDialog());
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Mode toggle
        this.modeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.switchMode(e.target.value));
        });
        
        // Receipt file input
        this.receiptElements.fileInput.addEventListener('change', (e) => 
            this.handleReceiptFiles(e.target.files));
        
        // Transaction file input
        this.transactionElements.fileInput.addEventListener('change', (e) => 
            this.handleTransactionFiles(e.target.files));
        
        // Cancel buttons
        this.receiptElements.cancelBtn.addEventListener('click', () => 
            this.cancelUpload('receipts'));
        this.transactionElements.cancelBtn.addEventListener('click', () => 
            this.cancelUpload('transactions'));
        
        // Process buttons
        this.receiptElements.processBtn.addEventListener('click', () => 
            this.processReceipts());
        this.transactionElements.importBtn.addEventListener('click', () => 
            this.importTransactions());
        
        // Preview navigation
        this.transactionElements.previewPrev.addEventListener('click', () => 
            this.changePage(-1));
        this.transactionElements.previewNext.addEventListener('click', () => 
            this.changePage(1));
        this.transactionElements.clearPreview.addEventListener('click', () => 
            this.clearTransactionPreview());
    }
    
    setupDragAndDrop() {
        // Receipt dropzone
        this.setupDropzone(this.receiptElements.dropzone, 
            (files) => this.handleReceiptFiles(files));
        
        // Transaction dropzone
        this.setupDropzone(this.transactionElements.dropzone,
            (files) => this.handleTransactionFiles(files));
    }
    
    setupDropzone(dropzone, callback) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('drag-over');
            }, false);
        });
        
        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                callback(files);
            }
        }, false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    switchMode(mode) {
        console.log(`Switching to ${mode} mode`);
        this.currentMode = mode;
        
        // Hide all sections
        Object.values(this.sections).forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        this.sections[mode].classList.add('active');
        
        // Update process button mode
        this.commonElements.processButtons.forEach(btn => {
            btn.setAttribute('data-mode', mode);
        });
        
        this.showStatus(`Switched to ${mode} mode`, 'info');
    }
    
    // RECEIPT HANDLING
    async handleReceiptFiles(files) {
        const fileArray = Array.from(files);
        console.log(`📷 Handling ${fileArray.length} receipt file(s)`);
        
        for (const file of fileArray) {
            if (!this.validateReceiptFile(file)) {
                this.showStatus(`Invalid file: ${file.name}`, 'error');
                continue;
            }
            
            await this.uploadReceiptFile(file);
        }
    }
    
    validateReceiptFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/heic', 'image/heif'];
        const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.heic', '.heif'];
        
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        const hasValidType = validTypes.includes(file.type) || file.type === '';
        
        return hasValidExtension || hasValidType;
    }
    
    async uploadReceiptFile(file) {
        return new Promise((resolve) => {
            console.log(`⬆️ Uploading receipt: ${file.name}`);
            
            // Show progress container
            this.receiptElements.progressContainer.classList.add('active');
            this.receiptElements.fileInfo.textContent = file.name;
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                
                this.receiptElements.progressFill.style.width = `${progress}%`;
                this.receiptElements.progressText.textContent = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    this.onReceiptUploadComplete(file);
                    resolve();
                }
            }, 100);
        });
    }
    
    onReceiptUploadComplete(file) {
        // Add to files list
        const receiptFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            status: 'uploaded',
            uploadDate: new Date()
        };
        
        this.receiptFiles.push(receiptFile);
        
        // Update UI
        this.addReceiptToList(receiptFile);
        this.updateReceiptCount();
        
        // Hide progress after delay
        setTimeout(() => {
            this.receiptElements.progressContainer.classList.remove('active');
            this.receiptElements.progressFill.style.width = '0%';
            this.receiptElements.progressText.textContent = '0%';
        }, 1000);
        
        this.showStatus(`Uploaded: ${file.name}`, 'success');
    }
    
    addReceiptToList(receiptFile) {
        const template = this.receiptElements.template.content.cloneNode(true);
        const fileItem = template.querySelector('.file-item');
        
        // Set file data
        fileItem.querySelector('[data-name]').textContent = receiptFile.name;
        fileItem.querySelector('[data-size]').textContent = this.formatFileSize(receiptFile.size);
        fileItem.querySelector('[data-status]').textContent = receiptFile.status;
        fileItem.querySelector('[data-status]').classList.add('completed');
        
        // Set up actions
        fileItem.querySelector('[data-action="preview"]').addEventListener('click', () => {
            this.previewReceipt(receiptFile);
        });
        
        fileItem.querySelector('[data-action="delete"]').addEventListener('click', () => {
            this.removeReceipt(receiptFile.id);
        });
        
        // Add to list
        const emptyState = this.receiptElements.filesList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        this.receiptElements.filesList.appendChild(fileItem);
        
        // Enable process button if we have files
        if (this.receiptFiles.length > 0) {
            this.receiptElements.processBtn.disabled = false;
        }
    }
    
    updateReceiptCount() {
        this.receiptElements.countBadge.textContent = this.receiptFiles.length;
    }
    
    removeReceipt(fileId) {
        this.receiptFiles = this.receiptFiles.filter(file => file.id !== fileId);
        
        // Rebuild list
        this.receiptElements.filesList.innerHTML = '';
        
        if (this.receiptFiles.length === 0) {
            this.receiptElements.filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No receipts uploaded yet</p>
                </div>
            `;
            this.receiptElements.processBtn.disabled = true;
        } else {
            this.receiptFiles.forEach(file => this.addReceiptToList(file));
        }
        
        this.updateReceiptCount();
        this.showStatus('Receipt removed', 'info');
    }
    
    async processReceipts() {
        if (this.receiptFiles.length === 0) return;
        
        console.log(`🔍 Processing ${this.receiptFiles.length} receipt(s)`);
        this.showStatus('Processing receipts...', 'info');
        
        // Simulate processing
        await this.simulateProcessing();
        
        // In a real app, you would:
        // 1. Send to OCR API
        // 2. Extract data
        // 3. Create transactions
        // 4. Update database
        
        this.showStatus(`Processed ${this.receiptFiles.length} receipt(s) successfully!`, 'success');
        
        // Clear after processing
        setTimeout(() => {
            this.receiptFiles = [];
            this.receiptElements.filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No receipts uploaded yet</p>
                </div>
            `;
            this.updateReceiptCount();
            this.receiptElements.processBtn.disabled = true;
        }, 2000);
    }
    
    // TRANSACTION HANDLING
    async handleTransactionFiles(files) {
        const fileArray = Array.from(files);
        console.log(`📊 Handling ${fileArray.length} transaction file(s)`);
        
        for (const file of fileArray) {
            if (!this.validateTransactionFile(file)) {
                this.showStatus(`Invalid file: ${file.name}`, 'error');
                continue;
            }
            
            await this.processTransactionFile(file);
        }
    }
    
    validateTransactionFile(file) {
        const validExtensions = ['.csv', '.xlsx', '.xls', '.txt'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    }
    
    async processTransactionFile(file) {
        console.log(`📄 Processing transaction file: ${file.name}`);
        
        // Show progress
        this.transactionElements.progressContainer.classList.add('active');
        this.transactionElements.fileInfo.textContent = `Parsing: ${file.name}`;
        
        try {
            const transactions = await this.parseFile(file);
            this.parsedTransactions = [...this.parsedTransactions, ...transactions];
            
            this.updateTransactionPreview();
            this.updateTransactionSummary();
            
            this.showStatus(`Parsed ${transactions.length} transactions from ${file.name}`, 'success');
            
        } catch (error) {
            console.error('Error parsing file:', error);
            this.showStatus(`Error parsing ${file.name}: ${error.message}`, 'error');
        } finally {
            // Hide progress
            setTimeout(() => {
                this.transactionElements.progressContainer.classList.remove('active');
                this.transactionElements.progressFill.style.width = '0%';
                this.transactionElements.progressText.textContent = '0%';
            }, 1000);
        }
    }
    
    async parseFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'csv') {
            return await this.parseCSV(file);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            return await this.parseExcel(file);
        } else {
            throw new Error('Unsupported file format');
        }
    }
    
    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const text = event.target.result;
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    if (lines.length < 2) {
                        resolve([]);
                        return;
                    }
                    
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    const transactions = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const values = this.parseCSVLine(lines[i]);
                        const transaction = this.mapCSVToTransaction(values, headers);
                        
                        if (transaction.amount && transaction.description) {
                            transactions.push(transaction);
                        }
                    }
                    
                    resolve(transactions);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    async parseExcel(file) {
        // Note: This requires xlsx library to be loaded
        // For now, we'll simulate parsing
        console.log('Excel parsing would require xlsx library');
        
        // Simulate parsing with dummy data
        return [
            {
                date: new Date().toISOString().split('T')[0],
                description: 'Sample Transaction 1',
                amount: 100.50,
                category: 'Office Supplies',
                type: 'expense'
            },
            {
                date: new Date().toISOString().split('T')[0],
                description: 'Sample Transaction 2',
                amount: 250.00,
                category: 'Software',
                type: 'expense'
            }
        ];
    }
    
    parseCSVLine(line) {
        // Simple CSV parsing - in production, use a library
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }
    
    mapCSVToTransaction(values, headers) {
        // Map headers to transaction fields
        const mapHeader = (possibleNames) => {
            for (const name of possibleNames) {
                const index = headers.findIndex(h => h.includes(name));
                if (index !== -1 && values[index]) {
                    return values[index];
                }
            }
            return '';
        };
        
        const rawAmount = mapHeader(['amount', 'debit', 'credit']);
        const amount = parseFloat(rawAmount?.replace(/[^0-9.-]/g, '')) || 0;
        
        return {
            date: mapHeader(['date', 'transaction date']) || new Date().toISOString().split('T')[0],
            description: mapHeader(['description', 'transaction', 'details']) || 'Unknown',
            amount: Math.abs(amount),
            category: mapHeader(['category', 'type']) || 'Uncategorized',
            type: amount >= 0 ? 'expense' : 'income'
        };
    }
    
    updateTransactionPreview() {
        const tbody = this.transactionElements.previewTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (this.parsedTransactions.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5">
                        <div class="empty-state">
                            <i class="fas fa-file-excel"></i>
                            <p>Upload a file to preview transactions</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.parsedTransactions.length);
        const pageTransactions = this.parsedTransactions.slice(startIndex, endIndex);
        
        // Add rows
        pageTransactions.forEach(transaction => {
            const template = this.transactionElements.rowTemplate.content.cloneNode(true);
            const row = template.querySelector('tr');
            
            row.querySelector('[data-field="date"]').textContent = transaction.date;
            row.querySelector('[data-field="description"]').textContent = transaction.description;
            row.querySelector('[data-field="amount"]').textContent = 
                `$${transaction.amount.toFixed(2)}`;
            row.querySelector('[data-field="category"]').textContent = transaction.category;
            row.querySelector('[data-field="type"]').textContent = transaction.type;
            
            tbody.appendChild(row);
        });
        
        // Update navigation
        this.transactionElements.previewRange.textContent = 
            `${startIndex + 1}-${endIndex} of ${this.parsedTransactions.length}`;
        
        this.transactionElements.previewPrev.disabled = this.currentPage === 1;
        this.transactionElements.previewNext.disabled = 
            endIndex >= this.parsedTransactions.length;
        
        // Enable import button
        this.transactionElements.importBtn.disabled = false;
    }
    
    updateTransactionSummary() {
        if (this.parsedTransactions.length === 0) {
            this.transactionElements.summaryTotal.textContent = '0';
            this.transactionElements.summaryAmount.textContent = '$0.00';
            this.transactionElements.summaryDateRange.textContent = '-';
            this.transactionElements.countBadge.textContent = '0';
            return;
        }
        
        // Calculate totals
        const totalAmount = this.parsedTransactions.reduce((sum, t) => sum + t.amount, 0);
        const dates = this.parsedTransactions.map(t => new Date(t.date)).filter(d => !isNaN(d.getTime()));
        
        let dateRange = '-';
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            dateRange = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
        }
        
        // Update UI
        this.transactionElements.summaryTotal.textContent = this.parsedTransactions.length;
        this.transactionElements.summaryAmount.textContent = `$${totalAmount.toFixed(2)}`;
        this.transactionElements.summaryDateRange.textContent = dateRange;
        this.transactionElements.countBadge.textContent = this.parsedTransactions.length;
    }
    
    changePage(direction) {
        const newPage = this.currentPage + direction;
        const totalPages = Math.ceil(this.parsedTransactions.length / this.itemsPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.updateTransactionPreview();
        }
    }
    
    clearTransactionPreview() {
        this.parsedTransactions = [];
        this.currentPage = 1;
        this.updateTransactionPreview();
        this.updateTransactionSummary();
        this.transactionElements.importBtn.disabled = true;
        this.showStatus('Preview cleared', 'info');
    }
    
    async importTransactions() {
        if (this.parsedTransactions.length === 0) return;
        
        console.log(`💾 Importing ${this.parsedTransactions.length} transaction(s)`);
        this.showStatus('Importing transactions...', 'info');
        
        // Simulate import
        await this.simulateProcessing();
        
        // In a real app, you would:
        // 1. Validate transactions
        // 2. Check for duplicates
        // 3. Save to database
        // 4. Update UI
        
        const successCount = this.parsedTransactions.length;
        this.showStatus(`Successfully imported ${successCount} transaction(s)!`, 'success');
        
        // Clear after import
        setTimeout(() => {
            this.clearTransactionPreview();
        }, 3000);
    }
    
    // HELPER METHODS
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showStatus(message, type = 'info') {
        const statusEl = this.commonElements.statusMessage;
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusEl.className = 'status-message';
        }, 5000);
    }
    
    cancelUpload(mode) {
        if (mode === 'receipts') {
            this.receiptElements.progressContainer.classList.remove('active');
            this.receiptElements.progressFill.style.width = '0%';
            this.receiptElements.progressText.textContent = '0%';
        } else {
            this.transactionElements.progressContainer.classList.remove('active');
            this.transactionElements.progressFill.style.width = '0%';
            this.transactionElements.progressText.textContent = '0%';
        }
        
        this.showStatus('Upload cancelled', 'warning');
    }
    
    previewReceipt(receiptFile) {
        console.log('Previewing receipt:', receiptFile.name);
        // In a real app, you would show a modal with the receipt
        alert(`Preview receipt: ${receiptFile.name}\n\nThis would open in a modal or new tab.`);
    }
    
    simulateProcessing() {
        return new Promise(resolve => {
            // Simulate progress
            let progress = 0;
            const targetProgress = 100;
            const interval = setInterval(() => {
                progress += 10;
                
                if (this.currentMode === 'receipts') {
                    this.receiptElements.progressFill.style.width = `${progress}%`;
                    this.receiptElements.progressText.textContent = `${progress}%`;
                } else {
                    this.transactionElements.progressFill.style.width = `${progress}%`;
                    this.transactionElements.progressText.textContent = `${progress}%`;
                }
                
                if (progress >= targetProgress) {
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
            }, 100);
        });
    }
}

let uploadSystemInstance = null;

function initUploadSystem() {
    if (!uploadSystemInstance) {
        console.log('🚀 Initializing Upload System...');
        uploadSystemInstance = new UploadSystem();
        window.uploadSystem = uploadSystemInstance;
        window.debugUploadSystem = uploadSystemInstance;
    }
    return uploadSystemInstance;
}

// Initialize only when needed
window.initUploadSystem = initUploadSystem;

// Or initialize when DOM is ready if elements exist
document.addEventListener('DOMContentLoaded', () => {
    // Check if upload system elements exist
    const hasUploadSystem = document.getElementById('upload-system') || 
                          document.getElementById('receipt-dropzone') || 
                          document.getElementById('transaction-dropzone');
    
    if (hasUploadSystem) {
        console.log('📁 Upload System elements found, initializing...');
        initUploadSystem();
    } else {
        console.log('📁 Upload System elements not found, will initialize when needed');
    }
});

// Add after your UploadSystem class definition
console.log('📁 Upload System script loaded successfully!');
console.log('UploadSystem class available:', typeof UploadSystem);
