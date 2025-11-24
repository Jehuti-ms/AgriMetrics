// modules/inventory-check.js
FarmModules.registerModule('inventory-check', {
    name: 'Inventory',
    icon: '📦',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Inventory Management</h1>
                <p>Track and manage your farm inventory</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-inventory-item">
                        ➕ Add Item
                    </button>
                </div>
            </div>

            <!-- Quick Add Form -->
            <div class="quick-add-form card">
                <h3>Quick Add Item</h3>
                <form id="quick-inventory-form" class="form-inline">
                    <div class="form-row compact">
                        <div class="form-group">
                            <input type="text" id="quick-name" placeholder="Item Name" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <select id="quick-category" required class="form-compact">
                                <option value="seeds">Seeds</option>
                                <option value="feed">Feed</option>
                                <option value="equipment">Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-quantity" placeholder="Qty" required class="form-compact">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Add</button>
                            <button type="button" class="btn btn-text btn-compact" id="show-detailed-inventory">
                                Detailed ➔
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="inventory-summary">
                <div class="summary-card">
                    <div class="summary-icon">📦</div>
                    <div class="summary-content">
                        <h3>Total Items</h3>
                        <div class="summary-value" id="total-items-count">0</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h3>Low Stock</h3>
                        <div class="summary-value" id="low-stock-count">0</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Value</h3>
                        <div class="summary-value" id="total-inventory-value">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="inventory-grid" id="inventory-grid">
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Inventory Item Modal -->
        <div id="inventory-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="inventory-modal-title">Add Inventory Item</h3>
                    <button class="btn-icon close-inventory-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="inventory-form">
                        <input type="hidden" id="inventory-id">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="inventory-name">Item Name *</label>
                                <input type="text" id="inventory-name" required placeholder="Enter item name">
                            </div>
                            <div class="form-group">
                                <label for="inventory-category">Category *</label>
                                <select id="inventory-category" required>
                                    <option value="">Select Category</option>
                                    <option value="seeds">Seeds</option>
                                    <option value="feed">Animal Feed</option>
                                    <option value="fertilizer">Fertilizer</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="tools">Tools</option>
                                    <option value="medical">Medical Supplies</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="inventory-description">Description</label>
                            <textarea id="inventory-description" placeholder="Enter item description..." rows="2"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="inventory-quantity">Quantity *</label>
                                <input type="number" id="inventory-quantity" min="0" required placeholder="0">
                            </div>
                            <div class="form-group">
                                <label for="inventory-unit">Unit *</label>
                                <select id="inventory-unit" required>
                                    <option value="units">Units</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="lbs">Pounds (lbs)</option>
                                    <option value="liters">Liters</option>
                                    <option value="gallons">Gallons</option>
                                    <option value="bags">Bags</option>
                                    <option value="boxes">Boxes</option>
                                    <option value="packs">Packs</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="inventory-cost">Unit Cost ($)</label>
                                <input type="number" id="inventory-cost" step="0.01" min="0" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label for="inventory-minstock">Minimum Stock</label>
                                <input type="number" id="inventory-minstock" min="0" placeholder="10">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="inventory-location">Storage Location</label>
                            <input type="text" id="inventory-location" placeholder="e.g., Storage Shed A">
                        </div>
                        <div class="form-group">
                            <label for="inventory-supplier">Supplier (Optional)</label>
                            <input type="text" id="inventory-supplier" placeholder="Supplier name">
                        </div>
                        <div class="form-group">
                            <label for="inventory-expiry">Expiry Date (Optional)</label>
                            <input type="date" id="inventory-expiry">
                        </div>
                        
                        <!-- Documentation Upload Section -->
                        <div class="form-group">
                            <label for="inventory-documents">Attach Documents (Optional)</label>
                            <div class="file-upload-area" id="inventory-upload-area">
                                <div class="file-upload-placeholder">
                                    <span class="upload-icon">📎</span>
                                    <p>Drop documentation files here or click to browse</p>
                                    <small>Supports: JPG, PNG, PDF, DOC (Max: 5MB each)</small>
                                </div>
                                <input type="file" id="inventory-documents" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" style="display: none;">
                            </div>
                            <div class="uploaded-files" id="uploaded-files-list"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-text close-inventory-modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="delete-inventory-item" style="display: none;">Delete</button>
                    <button type="submit" form="inventory-form" class="btn btn-primary">Save Item</button>
                </div>
            </div>
        </div>
    `,

    styles: `
        .inventory-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 1px solid var(--border-color);
        }

        .summary-icon {
            font-size: 2rem;
            opacity: 0.8;
        }

        .summary-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .inventory-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .inventory-item {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .inventory-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .inventory-item.low-stock {
            border-left: 4px solid var(--danger-color);
        }

        .inventory-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .inventory-item-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0;
            color: var(--text-color);
        }

        .inventory-item-category {
            background: var(--primary-light);
            color: var(--primary-color);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .inventory-item-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .detail-item label {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: block;
            margin-bottom: 0.25rem;
        }

        .detail-item .value {
            font-weight: 600;
            color: var(--text-color);
        }

        .inventory-item-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }

        .quick-add-form {
            margin: 1.5rem 0;
        }

        .form-row.compact {
            display: flex;
            gap: 0.75rem;
            align-items: end;
            flex-wrap: wrap;
        }

        .form-compact {
            height: 38px;
            padding: 0.5rem 0.75rem;
        }

        .btn-compact {
            height: 38px;
            padding: 0.5rem 1rem;
        }

        .file-upload-area {
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .file-upload-area:hover {
            border-color: var(--primary-color);
        }

        .file-upload-area.dragover {
            border-color: var(--primary-color);
            background: var(--primary-light);
        }

        .upload-icon {
            font-size: 2rem;
            opacity: 0.7;
            margin-bottom: 0.5rem;
            display: block;
        }

        .uploaded-file {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem;
            background: var(--bg-color);
            border-radius: 6px;
            margin-top: 0.5rem;
        }

        .uploaded-file-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .file-remove {
            color: var(--danger-color);
            cursor: pointer;
            padding: 0.25rem;
        }

        .text-danger {
            color: var(--danger-color);
        }

        .empty-inventory {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }
    `,

    scripts: function() {
        let inventory = JSON.parse(localStorage.getItem('farmos_inventory') || '[]');
        let editingId = null;

        // Initialize the module
        this.init = function() {
            bindEvents();
            renderInventory();
            updateSummary();
        };

        function bindEvents() {
            // Quick add form
            $('#quick-inventory-form').on('submit', handleQuickAdd);
            
            // Detailed form
            $('#inventory-form').on('submit', handleInventorySubmit);
            
            // Modal controls - FIXED: Proper event binding
            $('#add-inventory-item').on('click', function() {
                openInventoryModal();
            });
            
            $('.close-inventory-modal').on('click', closeInventoryModal);
            
            $('#show-detailed-inventory').on('click', function() {
                openInventoryModal();
            });
            
            // Delete item
            $('#delete-inventory-item').on('click', handleDeleteItem);
            
            // File upload handling
            setupFileUpload();

            // Close modal when clicking outside
            $('#inventory-modal').on('click', function(e) {
                if (e.target === this) {
                    closeInventoryModal();
                }
            });
        }

        function handleQuickAdd(e) {
            e.preventDefault();
            
            const item = {
                name: $('#quick-name').val().trim(),
                category: $('#quick-category').val(),
                quantity: parseInt($('#quick-quantity').val()) || 0,
                unit: 'units',
                cost: 0,
                minStock: 10,
                description: '',
                location: '',
                supplier: '',
                expiry: '',
                documents: [],
                createdAt: new Date().toISOString(),
                id: Date.now().toString()
            };

            if (!item.name) {
                showNotification('Please enter an item name', 'error');
                return;
            }

            inventory.push(item);
            saveInventory();
            renderInventory();
            updateSummary();
            
            // Reset form
            $('#quick-inventory-form')[0].reset();
            showNotification('Item added successfully!', 'success');
        }

        function handleInventorySubmit(e) {
            e.preventDefault();
            
            const itemData = {
                name: $('#inventory-name').val().trim(),
                category: $('#inventory-category').val(),
                description: $('#inventory-description').val().trim(),
                quantity: parseInt($('#inventory-quantity').val()) || 0,
                unit: $('#inventory-unit').val(),
                cost: parseFloat($('#inventory-cost').val()) || 0,
                minStock: parseInt($('#inventory-minstock').val()) || 0,
                location: $('#inventory-location').val().trim(),
                supplier: $('#inventory-supplier').val().trim(),
                expiry: $('#inventory-expiry').val(),
                documents: getUploadedDocuments(),
                updatedAt: new Date().toISOString()
            };

            if (!itemData.name || !itemData.category) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (editingId) {
                // Update existing item
                const index = inventory.findIndex(item => item.id === editingId);
                if (index !== -1) {
                    inventory[index] = { ...inventory[index], ...itemData };
                    showNotification('Item updated successfully!', 'success');
                }
            } else {
                // Add new item
                itemData.createdAt = new Date().toISOString();
                itemData.id = Date.now().toString();
                inventory.push(itemData);
                showNotification('Item added successfully!', 'success');
            }

            saveInventory();
            renderInventory();
            updateSummary();
            closeInventoryModal();
        }

        function openInventoryModal(item = null) {
            editingId = item ? item.id : null;
            
            // Reset form first
            $('#inventory-form')[0].reset();
            setUploadedDocuments([]);
            
            if (item) {
                $('#inventory-modal-title').text('Edit Inventory Item');
                $('#inventory-id').val(item.id);
                $('#inventory-name').val(item.name);
                $('#inventory-category').val(item.category);
                $('#inventory-description').val(item.description);
                $('#inventory-quantity').val(item.quantity);
                $('#inventory-unit').val(item.unit);
                $('#inventory-cost').val(item.cost);
                $('#inventory-minstock').val(item.minStock);
                $('#inventory-location').val(item.location);
                $('#inventory-supplier').val(item.supplier);
                $('#inventory-expiry').val(item.expiry);
                setUploadedDocuments(item.documents || []);
                $('#delete-inventory-item').show();
            } else {
                $('#inventory-modal-title').text('Add Inventory Item');
                $('#delete-inventory-item').hide();
            }

            $('#inventory-modal').removeClass('hidden');
        }

        function closeInventoryModal() {
            $('#inventory-modal').addClass('hidden');
            editingId = null;
        }

        function handleDeleteItem() {
            if (!editingId) return;

            if (confirm('Are you sure you want to delete this inventory item?')) {
                inventory = inventory.filter(item => item.id !== editingId);
                saveInventory();
                renderInventory();
                updateSummary();
                closeInventoryModal();
                showNotification('Item deleted successfully', 'success');
            }
        }

        function setupFileUpload() {
            const uploadArea = $('#inventory-upload-area');
            const fileInput = $('#inventory-documents');

            uploadArea.on('click', function() {
                fileInput.click();
            });
            
            uploadArea.on('dragover', function(e) {
                e.preventDefault();
                uploadArea.addClass('dragover');
            });
            
            uploadArea.on('dragleave', function() {
                uploadArea.removeClass('dragover');
            });
            
            uploadArea.on('drop', function(e) {
                e.preventDefault();
                uploadArea.removeClass('dragover');
                handleFiles(e.originalEvent.dataTransfer.files);
            });
            
            fileInput.on('change', function(e) {
                handleFiles(e.target.files);
            });
        }

        function handleFiles(files) {
            const uploadedFiles = getUploadedDocuments();
            
            for (let file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    showNotification(`File ${file.name} is too large (max 5MB)`, 'error');
                    continue;
                }

                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                };

                // In a real app, you would upload the file to a server
                // For now, we'll just store the file info
                uploadedFiles.push(fileData);
            }

            setUploadedDocuments(uploadedFiles);
        }

        function getUploadedDocuments() {
            const filesData = $('#uploaded-files-list').attr('data-files');
            return filesData ? JSON.parse(filesData) : [];
        }

        function setUploadedDocuments(files) {
            $('#uploaded-files-list').attr('data-files', JSON.stringify(files));
            
            if (files.length === 0) {
                $('#uploaded-files-list').html('');
                return;
            }

            const filesHtml = files.map(file => `
                <div class="uploaded-file">
                    <div class="uploaded-file-info">
                        <span class="file-icon">📎</span>
                        <span>${escapeHtml(file.name)}</span>
                        <small>(${(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    </div>
                    <span class="file-remove" data-file-id="${file.id}">🗑️</span>
                </div>
            `).join('');

            $('#uploaded-files-list').html(filesHtml);

            // Add remove handlers
            $('.file-remove').on('click', function() {
                const fileId = $(this).data('file-id');
                const updatedFiles = files.filter(f => f.id !== fileId);
                setUploadedDocuments(updatedFiles);
            });
        }

        function renderInventory() {
            const grid = $('#inventory-grid');
            
            if (inventory.length === 0) {
                grid.html(`
                    <div class="empty-inventory">
                        <div class="empty-content">
                            <span class="empty-icon">📦</span>
                            <h4>No inventory items yet</h4>
                            <p>Start by adding your first inventory item</p>
                        </div>
                    </div>
                `);
                return;
            }

            const inventoryHtml = inventory.map(item => {
                const isLowStock = item.quantity <= item.minStock;
                const totalValue = (item.quantity * item.cost).toFixed(2);
                
                return `
                    <div class="inventory-item ${isLowStock ? 'low-stock' : ''}" data-id="${item.id}">
                        <div class="inventory-item-header">
                            <h4 class="inventory-item-name">${escapeHtml(item.name)}</h4>
                            <span class="inventory-item-category">${getCategoryLabel(item.category)}</span>
                        </div>
                        
                        <div class="inventory-item-details">
                            <div class="detail-item">
                                <label>Quantity</label>
                                <div class="value">${item.quantity} ${item.unit}</div>
                            </div>
                            <div class="detail-item">
                                <label>Value</label>
                                <div class="value">$${totalValue}</div>
                            </div>
                            <div class="detail-item">
                                <label>Location</label>
                                <div class="value">${item.location || 'Not specified'}</div>
                            </div>
                            <div class="detail-item">
                                <label>Status</label>
                                <div class="value ${isLowStock ? 'text-danger' : ''}">
                                    ${isLowStock ? 'Low Stock' : 'In Stock'}
                                </div>
                            </div>
                        </div>

                        ${item.description ? `
                            <div class="inventory-item-description">
                                <label>Description:</label>
                                <p>${escapeHtml(item.description)}</p>
                            </div>
                        ` : ''}

                        <div class="inventory-item-actions">
                            <button class="btn btn-text btn-sm edit-inventory-item">Edit</button>
                            <button class="btn btn-primary btn-sm use-inventory-item">Use</button>
                        </div>
                    </div>
                `;
            }).join('');

            grid.html(inventoryHtml);

            // Add event listeners to inventory items
            $('.edit-inventory-item').on('click', function(e) {
                e.stopPropagation();
                const itemId = $(this).closest('.inventory-item').data('id');
                const item = inventory.find(i => i.id === itemId);
                if (item) openInventoryModal(item);
            });

            $('.use-inventory-item').on('click', function(e) {
                e.stopPropagation();
                const itemId = $(this).closest('.inventory-item').data('id');
                // Implement inventory usage functionality
                showNotification('Use inventory functionality coming soon!', 'info');
            });

            // Click on item to edit
            $('.inventory-item').on('click', function(e) {
                if (!$(e.target).closest('.inventory-item-actions').length) {
                    const itemId = $(this).data('id');
                    const item = inventory.find(i => i.id === itemId);
                    if (item) openInventoryModal(item);
                }
            });
        }

        function updateSummary() {
            const totalItems = inventory.length;
            const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length;
            const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

            $('#total-items-count').text(totalItems);
            $('#low-stock-count').text(lowStockCount);
            $('#total-inventory-value').text('$' + totalValue.toFixed(2));
        }

        function getCategoryLabel(category) {
            const labels = {
                'seeds': 'Seeds',
                'feed': 'Animal Feed',
                'fertilizer': 'Fertilizer',
                'equipment': 'Equipment',
                'tools': 'Tools',
                'medical': 'Medical Supplies',
                'other': 'Other'
            };
            return labels[category] || category;
        }

        function saveInventory() {
            localStorage.setItem('farmos_inventory', JSON.stringify(inventory));
        }

        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function showNotification(message, type = 'info') {
            // Use the farm OS notification system
            if (window.showFarmNotification) {
                window.showFarmNotification(message, type);
            } else {
                alert(message);
            }
        }

        // Initialize the module
        this.init();
    }
});
