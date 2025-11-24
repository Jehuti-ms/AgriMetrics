// modules/income-expenses.js
FarmModules.registerModule('income-expenses', {
    name: 'Income & Expenses',
    icon: '💰',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Income & Expenses</h1>
                <p>Track your farm's financial transactions</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-income-btn">
                        💰 Add Income
                    </button>
                    <button class="btn btn-secondary" id="add-expense-btn">
                        💸 Add Expense
                    </button>
                </div>
            </div>

            <!-- Quick Add Form -->
            <div class="quick-add-form card">
                <h3>Quick Add Transaction</h3>
                <form id="quick-transaction-form" class="form-inline">
                    <div class="form-row compact">
                        <div class="form-group">
                            <select id="quick-type" required class="form-compact">
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="text" id="quick-description" placeholder="Description" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-amount" step="0.01" placeholder="Amount" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Add</button>
                            <button type="button" class="btn btn-text btn-compact" id="show-detailed-form">
                                Detailed ➔
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="summary-cards">
                <div class="summary-card income">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Income</h3>
                        <div class="summary-value" id="total-income-summary">$0.00</div>
                    </div>
                </div>
                <div class="summary-card expense">
                    <div class="summary-icon">💸</div>
                    <div class="summary-content">
                        <h3>Total Expenses</h3>
                        <div class="summary-value" id="total-expenses-summary">$0.00</div>
                    </div>
                </div>
                <div class="summary-card net">
                    <div class="summary-icon">📈</div>
                    <div class="summary-content">
                        <h3>Net Profit</h3>
                        <div class="summary-value" id="net-profit-summary">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="table-section">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Receipts</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-body">
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">💰</span>
                                        <h4>No transactions yet</h4>
                                        <p>Start tracking your farm's income and expenses</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Transaction Modal -->
            <div id="transaction-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="transaction-modal-title">Add Transaction</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="transaction-form">
                            <input type="hidden" id="transaction-id">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="transaction-type">Type:</label>
                                    <select id="transaction-type" required>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="transaction-date">Date:</label>
                                    <input type="date" id="transaction-date" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="transaction-description">Description:</label>
                                <input type="text" id="transaction-description" required placeholder="Enter transaction description">
                            </div>
                            <div class="form-group">
                                <label for="transaction-amount">Amount ($):</label>
                                <input type="number" id="transaction-amount" step="0.01" min="0" required placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label for="transaction-category">Category:</label>
                                <select id="transaction-category" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="Income Categories">
                                        <option value="crop-sales">Crop Sales</option>
                                        <option value="livestock-sales">Livestock Sales</option>
                                        <option value="dairy-products">Dairy Products</option>
                                        <option value="poultry-products">Poultry Products</option>
                                        <option value="other-income">Other Income</option>
                                    </optgroup>
                                    <optgroup label="Expense Categories">
                                        <option value="feed-supplies">Feed & Supplies</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="labor">Labor</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="seeds-plants">Seeds & Plants</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="other-expenses">Other Expenses</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="transaction-notes">Notes (Optional):</label>
                                <textarea id="transaction-notes" placeholder="Add any additional notes..." rows="3"></textarea>
                            </div>
                            
                            <!-- Receipt Upload Section -->
                            <div class="form-group">
                                <label for="transaction-receipt">Attach Receipt (Optional):</label>
                                <div class="file-upload-area" id="receipt-upload-area">
                                    <div class="file-upload-placeholder">
                                        <span class="upload-icon">📎</span>
                                        <p>Drop receipt files here or click to browse</p>
                                        <small>Supports: JPG, PNG, PDF (Max: 5MB)</small>
                                    </div>
                                    <input type="file" id="transaction-receipt" 
                                           accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                                           multiple
                                           style="display: none;">
                                </div>
                                <div id="receipt-preview" class="file-preview-container"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-transaction">Save Transaction</button>
                    </div>
                </div>
            </div>

            <!-- Receipt Viewer Modal -->
            <div id="receipt-viewer-modal" class="modal hidden">
                <div class="modal-content receipt-viewer">
                    <div class="modal-header">
                        <h3>Receipt Viewer</h3>
                        <button class="btn-icon close-receipt-viewer">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="receipt-viewer-content">
                            <!-- Receipt content will be displayed here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-receipt-viewer">Close</button>
                        <button type="button" class="btn btn-primary" id="download-receipt">Download</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Income & Expenses module initializing...');
        this.loadTransactionData();
        this.attachEventListeners();
        this.updateSummaryCards();
    },

    loadTransactionData: function() {
        const transactions = FarmModules.appData.transactions || [];
        this.renderTransactionsTable(transactions);
    },

    renderTransactionsTable: function(transactions) {
        const tbody = document.getElementById('transactions-body');
        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">💰</span>
                            <h4>No transactions yet</h4>
                            <p>Start tracking your farm's income and expenses</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row ${transaction.type}">
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <div class="transaction-description">
                        <strong>${transaction.description}</strong>
                        ${transaction.notes ? `<div class="transaction-notes">${transaction.notes}</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="category-badge">${this.formatCategory(transaction.category)}</span>
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td class="transaction-receipts">
                    ${transaction.receipts && transaction.receipts.length > 0 ? `
                        <div class="receipt-thumbnails">
                            ${transaction.receipts.slice(0, 3).map((receipt, index) => `
                                <div class="receipt-thumbnail" data-transaction-id="${transaction.id}" data-receipt-index="${index}">
                                    ${this.getFileIcon(receipt.type)}
                                    ${transaction.receipts.length > 3 && index === 2 ? `<span class="more-count">+${transaction.receipts.length - 3}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<span class="no-receipt">—</span>'}
                </td>
                <td class="transaction-actions">
                    <button class="btn-icon edit-transaction" data-id="${transaction.id}" title="Edit">✏️</button>
                    <button class="btn-icon delete-transaction" data-id="${transaction.id}" title="Delete">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    updateSummaryCards: function() {
        const transactions = FarmModules.appData.transactions || [];

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const netProfit = totalIncome - totalExpenses;

        this.updateElement('total-income-summary', this.formatCurrency(totalIncome));
        this.updateElement('total-expenses-summary', this.formatCurrency(totalExpenses));
        this.updateElement('net-profit-summary', this.formatCurrency(netProfit));
    },

    attachEventListeners: function() {
        // Quick form submission
        const quickForm = document.getElementById('quick-transaction-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickAdd();
            });
        }

        // Show detailed form
        const showDetailedBtn = document.getElementById('show-detailed-form');
        if (showDetailedBtn) {
            showDetailedBtn.addEventListener('click', () => {
                const type = document.getElementById('quick-type').value;
                this.showTransactionModal(type);
            });
        }

        // Add transaction buttons
        const addIncomeBtn = document.getElementById('add-income-btn');
        const addExpenseBtn = document.getElementById('add-expense-btn');

        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.showTransactionModal('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.showTransactionModal('expense'));
        }

        // Modal events
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Save transaction
        const saveBtn = document.getElementById('save-transaction');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTransaction());
        }

        // File upload events
        this.setupFileUpload();

        // Receipt viewer events
        const closeReceiptViewer = document.querySelector('.close-receipt-viewer');
        if (closeReceiptViewer) {
            closeReceiptViewer.addEventListener('click', () => this.hideReceiptViewer());
        }

        const downloadReceiptBtn = document.getElementById('download-receipt');
        if (downloadReceiptBtn) {
            downloadReceiptBtn.addEventListener('click', () => this.downloadReceipt());
        }

        // Receipt thumbnail clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.receipt-thumbnail')) {
                const thumbnail = e.target.closest('.receipt-thumbnail');
                const transactionId = thumbnail.dataset.transactionId;
                const receiptIndex = parseInt(thumbnail.dataset.receiptIndex);
                this.viewReceipt(transactionId, receiptIndex);
            }
        });

        // Edit and delete transactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-transaction')) {
                const transactionId = e.target.closest('.edit-transaction').dataset.id;
                this.editTransaction(transactionId);
            }
            if (e.target.closest('.delete-transaction')) {
                const transactionId = e.target.closest('.delete-transaction').dataset.id;
                this.deleteTransaction(transactionId);
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Close receipt viewer on backdrop click
        const receiptViewerModal = document.getElementById('receipt-viewer-modal');
        if (receiptViewerModal) {
            receiptViewerModal.addEventListener('click', (e) => {
                if (e.target === receiptViewerModal) {
                    this.hideReceiptViewer();
                }
            });
        }
    },

    handleQuickAdd: function() {
        const type = document.getElementById('quick-type').value;
        const description = document.getElementById('quick-description').value;
        const amount = parseFloat(document.getElementById('quick-amount').value);

        if (!description || !amount) {
            this.showNotification('Please fill in description and amount', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        const transactionData = {
            type: type,
            description: description,
            amount: amount,
            category: type === 'income' ? 'other-income' : 'other-expenses',
            date: new Date().toISOString().split('T')[0],
            notes: 'Added via quick form'
        };

        this.addTransaction(transactionData);
        
        // Clear quick form
        document.getElementById('quick-description').value = '';
        document.getElementById('quick-amount').value = '';
        
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    setupFileUpload: function() {
        const uploadArea = document.getElementById('receipt-upload-area');
        const fileInput = document.getElementById('transaction-receipt');
        const previewContainer = document.getElementById('receipt-preview');

        if (!uploadArea || !fileInput) return;

        // Click to browse
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleFileSelection(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
    },

    handleFileSelection: function(files) {
        const previewContainer = document.getElementById('receipt-preview');
        if (!previewContainer) return;

        // Clear existing previews
        previewContainer.innerHTML = '';

        Array.from(files).forEach(file => {
            if (!this.validateFile(file)) {
                return;
            }

            const fileItem = this.createFilePreview(file);
            previewContainer.appendChild(fileItem);
        });
    },

    validateFile: function(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.showNotification('Invalid file type. Please upload JPG, PNG, or PDF files.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 5MB.', 'error');
            return false;
        }

        return true;
    },

    createFilePreview: function(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${this.getFileIcon(file.type)}</span>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="btn-icon remove-file" title="Remove file">🗑️</button>
        `;

        // Remove file button
        const removeBtn = fileItem.querySelector('.remove-file');
        removeBtn.addEventListener('click', () => {
            fileItem.remove();
        });

        return fileItem;
    },

    getFileIcon: function(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.includes('word')) return '📝';
        return '📎';
    },

    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getReceiptFiles: function() {
        const previewContainer = document.getElementById('receipt-preview');
        const fileInput = document.getElementById('transaction-receipt');
        
        if (!previewContainer || !fileInput) return [];

        const files = Array.from(fileInput.files || []);
        
        return files.map(file => ({
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            size: file.size,
            file: file
        }));
    },

    showTransactionModal: function(type = 'income') {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');
        const form = document.getElementById('transaction-form');

        if (modal && title && form) {
            // Reset form
            form.reset();
            document.getElementById('transaction-id').value = '';
            
            // Clear file previews
            const previewContainer = document.getElementById('receipt-preview');
            if (previewContainer) previewContainer.innerHTML = '';
            
            // Set type and title
            document.getElementById('transaction-type').value = type;
            title.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
            
            // Set today's date as default
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            
            // Show modal
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveTransaction: function() {
        const form = document.getElementById('transaction-form');
        if (!form) return;

        const transactionId = document.getElementById('transaction-id').value;
        const type = document.getElementById('transaction-type').value;
        const description = document.getElementById('transaction-description').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const date = document.getElementById('transaction-date').value;
        const notes = document.getElementById('transaction-notes').value;
        const receiptFiles = this.getReceiptFiles();

        // Validation
        if (!description || !amount || !category || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        const transactionData = {
            type: type,
            description: description,
            amount: amount,
            category: category,
            date: date,
            notes: notes,
            receipts: receiptFiles
        };

        if (transactionId) {
            // Update existing transaction
            this.updateTransaction(transactionId, transactionData);
        } else {
            // Add new transaction
            this.addTransaction(transactionData);
        }

        this.hideModal();
    },

    addTransaction: function(transactionData) {
        if (!FarmModules.appData.transactions) {
            FarmModules.appData.transactions = [];
        }

        const newTransaction = {
            id: 'tx-' + Date.now(),
            ...transactionData
        };

        FarmModules.appData.transactions.push(newTransaction);
        
        this.loadTransactionData();
        this.updateSummaryCards();
        
        this.showNotification(`${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    },

    editTransaction: function(transactionId) {
        const transactions = FarmModules.appData.transactions || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;

        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');

        if (modal && title) {
            // Fill form with transaction data
            document.getElementById('transaction-id').value = transaction.id;
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-description').value = transaction.description || '';
            document.getElementById('transaction-amount').value = transaction.amount || '';
            document.getElementById('transaction-category').value = transaction.category || '';
            document.getElementById('transaction-date').value = transaction.date || '';
            document.getElementById('transaction-notes').value = transaction.notes || '';
            
            // Note: File previews would need special handling for existing files
            const previewContainer = document.getElementById('receipt-preview');
            if (previewContainer) previewContainer.innerHTML = 'Existing receipts cannot be edited in demo mode';
            
            title.textContent = `Edit ${transaction.type === 'income' ? 'Income' : 'Expense'}`;
            modal.classList.remove('hidden');
        }
    },

    updateTransaction: function(transactionId, transactionData) {
        const transactions = FarmModules.appData.transactions || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                ...transactionData
            };
            
            this.loadTransactionData();
            this.updateSummaryCards();
            this.showNotification('Transaction updated successfully!', 'success');
        }
    },

    deleteTransaction: function(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            FarmModules.appData.transactions = FarmModules.appData.transactions.filter(t => t.id !== transactionId);
            this.loadTransactionData();
            this.updateSummaryCards();
            this.showNotification('Transaction deleted successfully', 'success');
        }
    },

    viewReceipt: function(transactionId, receiptIndex) {
        const transactions = FarmModules.appData.transactions || [];
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction || !transaction.receipts || !transaction.receipts[receiptIndex]) {
            this.showNotification('Receipt not found', 'error');
            return;
        }

        const receipt = transaction.receipts[receiptIndex];
        const viewerModal = document.getElementById('receipt-viewer-modal');
        const viewerContent = document.getElementById('receipt-viewer-content');

        if (viewerModal && viewerContent) {
            let content = '';
            
            if (receipt.type === 'image') {
                content = `
                    <div class="receipt-image-viewer">
                        <div class="image-placeholder">
                            <span class="file-icon-large">🖼️</span>
                            <p>Image preview would appear here</p>
                        </div>
                        <div class="receipt-info">
                            <h4>${receipt.name}</h4>
                            <p>Size: ${this.formatFileSize(receipt.size)}</p>
                            <p>Type: Image File</p>
                        </div>
                    </div>
                `;
            } else {
                content = `
                    <div class="receipt-document-viewer">
                        <div class="document-icon">📄</div>
                        <div class="receipt-info">
                            <h4>${receipt.name}</h4>
                            <p>Size: ${this.formatFileSize(receipt.size)}</p>
                            <p>Type: Document File</p>
                            <p>This is a document file. Please download to view.</p>
                        </div>
                    </div>
                `;
            }

            viewerContent.innerHTML = content;
            viewerModal.classList.remove('hidden');

            // Store current receipt info for download
            this.currentReceipt = { transactionId, receiptIndex, receipt };
        }
    },

    hideReceiptViewer: function() {
        const viewerModal = document.getElementById('receipt-viewer-modal');
        if (viewerModal) {
            viewerModal.classList.add('hidden');
            this.currentReceipt = null;
        }
    },

    downloadReceipt: function() {
        if (!this.currentReceipt) return;

        const { receipt } = this.currentReceipt;
        
        // In a real app, this would download the actual file
        // For demo purposes, we'll create a placeholder
        const link = document.createElement('a');
        link.href = '#'; // In real app, this would be the file URL
        link.download = receipt.name;
        link.click();
        
        this.showNotification(`Downloading ${receipt.name}...`, 'info');
    },

    formatCategory: function(category) {
        if (!category) return 'Uncategorized';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        }
    }
});
