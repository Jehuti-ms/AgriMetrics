// modules/inventory.js - USING MODAL MANAGER
console.log('Loading Inventory module with Modal Manager...');

const InventoryModule = {
    name: 'inventory',
    initialized: false,
    inventoryItems: [],
    element: null,
    currentFilter: 'all',
    searchQuery: '',

    initialize() {
        console.log('📦 Initializing Inventory...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Load CSS if not already loaded
        this.loadCSS();

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Inventory initialized');
        return true;
    },

    loadCSS() {
        // Check if module CSS is already loaded
        if (document.querySelector('link[href*="inventory.css"]')) {
            return;
        }
        
        // Create link element for module-specific CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/inventory.css';
        document.head.appendChild(link);
    },

    loadData() {
        // Load from localStorage or use demo data
        const saved = localStorage.getItem('farm-inventory');
        this.inventoryItems = saved ? JSON.parse(saved) : this.getDemoData();
    },

    getDemoData() {
        return [
            {
                id: 1,
                name: 'Chicken Feed',
                category: 'feed',
                quantity: 42,
                unit: 'bags',
                lowStockThreshold: 10,
                status: 'in-stock',
                lastUpdated: '2024-03-15',
                price: 25.99,
                supplier: 'Farm Supplies Inc'
            },
            {
                id: 2,
                name: 'Egg Cartons',
                category: 'packaging',
                quantity: 8,
                unit: 'cases',
                lowStockThreshold: 5,
                status: 'low-stock',
                lastUpdated: '2024-03-14',
                price: 12.50,
                supplier: 'Packaging Plus'
            },
            {
                id: 3,
                name: 'Poultry Vaccines',
                category: 'medication',
                quantity: 0,
                unit: 'vials',
                lowStockThreshold: 5,
                status: 'out-of-stock',
                lastUpdated: '2024-03-10',
                price: 45.00,
                supplier: 'Vet Supplies Co'
            },
            {
                id: 4,
                name: 'Broiler Chicks',
                category: 'livestock',
                quantity: 120,
                unit: 'birds',
                lowStockThreshold: 50,
                status: 'in-stock',
                lastUpdated: '2024-03-12',
                price: 3.50,
                supplier: 'Hatchery Farms'
            },
            {
                id: 5,
                name: 'Fertilizer',
                category: 'crops',
                quantity: 15,
                unit: 'bags',
                lowStockThreshold: 5,
                status: 'in-stock',
                lastUpdated: '2024-03-08',
                price: 32.99,
                supplier: 'Agri-Grow'
            },
            {
                id: 6,
                name: 'Water Troughs',
                category: 'equipment',
                quantity: 2,
                unit: 'units',
                lowStockThreshold: 2,
                status: 'on-order',
                lastUpdated: '2024-03-05',
                price: 89.99,
                supplier: 'Farm Equipment Ltd'
            }
        ];
    },

    calculateStats() {
        const totalItems = this.inventoryItems.length;
        const totalValue = this.inventoryItems.reduce((sum, item) => 
            sum + (item.quantity * (item.price || 0)), 0);
        
        const lowStockItems = this.inventoryItems.filter(item => 
            item.status === 'low-stock' || item.status === 'out-of-stock').length;
        
        const categories = [...new Set(this.inventoryItems.map(item => item.category))];
        
        return {
            totalItems,
            totalValue,
            lowStockItems,
            categories: categories.length,
            inStockItems: this.inventoryItems.filter(item => item.status === 'in-stock').length
        };
    },

    getFilteredItems() {
        let filtered = this.inventoryItems;
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.supplier?.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    },

    getCategoryItems(category) {
        return this.inventoryItems.filter(item => item.category === category);
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();
        const filteredItems = this.getFilteredItems();
        const categories = [...new Set(this.inventoryItems.map(item => item.category))];

        this.element.innerHTML = `
            <div id="inventory" class="module-container">
                <!-- Modern Header -->
                <div class="inv-module-header">
                    <div class="inv-header-content">
                        <div class="inv-header-text">
                            <h1 class="inv-module-title">Inventory Management</h1>
                            <p class="inv-module-subtitle">Track and manage your farm's stock levels</p>
                        </div>
                    </div>
                </div>

                <!-- Inventory Stats -->
                <div class="inv-stats-grid">
                    <div class="inv-stat-card">
                        <div class="inv-stat-icon">📦</div>
                        <div class="inv-stat-value">${stats.totalItems}</div>
                        <div class="inv-stat-label">Total Items</div>
                    </div>
                    <div class="inv-stat-card">
                        <div class="inv-stat-icon">💰</div>
                        <div class="inv-stat-value">${this.formatCurrency(stats.totalValue)}</div>
                        <div class="inv-stat-label">Total Value</div>
                    </div>
                    <div class="inv-stat-card">
                        <div class="inv-stat-icon">⚠️</div>
                        <div class="inv-stat-value">${stats.lowStockItems}</div>
                        <div class="inv-stat-label">Low Stock</div>
                    </div>
                    <div class="inv-stat-card">
                        <div class="inv-stat-icon">📋</div>
                        <div class="inv-stat-value">${stats.categories}</div>
                        <div class="inv-stat-label">Categories</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="inv-quick-actions">
                    <button class="inv-quick-btn primary" id="add-item-btn">
                        <div class="inv-quick-icon">➕</div>
                        <div>
                            <div class="inv-quick-title">Add Item</div>
                            <div class="inv-quick-desc">Add new inventory item</div>
                        </div>
                    </button>
                    
                    <button class="inv-quick-btn" id="quick-check-btn">
                        <div class="inv-quick-icon">🔍</div>
                        <div>
                            <div class="inv-quick-title">Quick Check</div>
                            <div class="inv-quick-desc">Check stock levels</div>
                        </div>
                    </button>
                    
                    <button class="inv-quick-btn" id="reorder-btn">
                        <div class="inv-quick-icon">🔄</div>
                        <div>
                            <div class="inv-quick-title">Reorder</div>
                            <div class="inv-quick-desc">Place reorder</div>
                        </div>
                    </button>
                    
                    <button class="inv-quick-btn" id="inventory-report-btn">
                        <div class="inv-quick-icon">📊</div>
                        <div>
                            <div class="inv-quick-title">Reports</div>
                            <div class="inv-quick-desc">View reports</div>
                        </div>
                    </button>
                </div>

                <!-- Search and Filters -->
                <div class="inv-search-section">
                    <div class="inv-search-row">
                        <input type="text" 
                               class="inv-search-input" 
                               id="inventory-search" 
                               placeholder="Search inventory items..."
                               value="${this.searchQuery}">
                        <button class="btn btn-outline" id="clear-search-btn">
                            Clear
                        </button>
                    </div>
                    
                    <div class="inv-category-filters">
                        <button class="inv-category-filter ${this.currentFilter === 'all' ? 'active' : ''}" 
                                data-filter="all">
                            All Items
                        </button>
                        ${categories.map(category => `
                            <button class="inv-category-filter ${this.currentFilter === category ? 'active' : ''}" 
                                    data-filter="${category}">
                                ${this.formatCategoryName(category)}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Inventory Table -->
                <div class="inv-table-container">
                    <div class="inv-table-header">
                        <h3 class="inv-table-title">Inventory Items</h3>
                        <div>
                            <span class="text-tertiary text-sm">
                                Showing ${filteredItems.length} of ${this.inventoryItems.length} items
                            </span>
                        </div>
                    </div>
                    
                    ${filteredItems.length === 0 ? this.renderEmptyState() : this.renderInventoryTable(filteredItems)}
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    },

    renderEmptyState() {
        return `
            <div class="inv-empty-state">
                <div class="inv-empty-icon">📦</div>
                <h3 class="inv-empty-title">No items found</h3>
                <p class="inv-empty-desc">
                    ${this.searchQuery ? 
                        'No items match your search. Try a different search term.' : 
                        'Add your first inventory item to get started.'}
                </p>
                ${!this.searchQuery ? `
                    <button class="btn btn-primary" id="add-first-item-btn">
                        ➕ Add First Item
                    </button>
                ` : ''}
            </div>
        `;
    },

    renderInventoryTable(items) {
        return `
            <div style="overflow-x: auto;">
                <table class="inv-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr data-id="${item.id}">
                                <td>
                                    <div style="font-weight: 600; color: var(--color-text-primary);">
                                        ${item.name}
                                    </div>
                                    ${item.supplier ? `
                                        <div style="font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px;">
                                            ${item.supplier}
                                        </div>
                                    ` : ''}
                                </td>
                                <td>
                                    <span style="padding: 4px 8px; background: var(--color-bg-tertiary); 
                                          border-radius: 6px; font-size: 12px;">
                                        ${this.formatCategoryName(item.category)}
                                    </span>
                                </td>
                                <td>
                                    <div class="inv-quantity ${item.quantity <= item.lowStockThreshold ? 'low' : ''} 
                                         ${item.quantity === 0 ? 'critical' : ''}">
                                        ${item.quantity} ${item.unit}
                                    </div>
                                    ${item.lowStockThreshold ? `
                                        <div style="font-size: 11px; color: var(--color-text-tertiary); margin-top: 2px;">
                                            Low: ${item.lowStockThreshold}
                                        </div>
                                    ` : ''}
                                </td>
                                <td>
                                    <span class="inv-status ${item.status}">
                                        ${this.formatStatus(item.status)}
                                    </span>
                                </td>
                                <td>
                                    ${this.formatDate(item.lastUpdated)}
                                </td>
                                <td>
                                    ${this.formatCurrency(item.quantity * (item.price || 0))}
                                </td>
                                <td>
                                    <div class="inv-actions">
                                        <button class="inv-action-btn edit" data-action="edit" data-id="${item.id}">
                                            Edit
                                        </button>
                                        <button class="inv-action-btn delete" data-action="delete" data-id="${item.id}">
                                            Delete
                                        </button>
                                        <button class="inv-action-btn view" data-action="view" data-id="${item.id}">
                                            View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ==================== MODAL METHODS ====================
    showAddItemModal() {
        ModalManager.createQuickForm({
            id: 'add-item-modal',
            title: 'Add Inventory Item',
            subtitle: 'Add a new item to your inventory',
            size: 'modal-lg',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    label: 'Item Name',
                    required: true,
                    placeholder: 'e.g., Chicken Feed, Egg Cartons',
                    autofocus: true
                },
                {
                    name: 'category',
                    type: 'category',
                    label: 'Category',
                    required: true,
                    defaultValue: 'feed',
                    categories: [
                        { value: 'feed', label: 'Feed' },
                        { value: 'medication', label: 'Medication' },
                        { value: 'equipment', label: 'Equipment' },
                        { value: 'livestock', label: 'Livestock' },
                        { value: 'crops', label: 'Crops' },
                        { value: 'packaging', label: 'Packaging' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'quantity',
                    type: 'number',
                    label: 'Current Quantity',
                    required: true,
                    min: 0,
                    step: 1,
                    placeholder: '0',
                    note: 'Current stock level'
                },
                {
                    name: 'unit',
                    type: 'select',
                    label: 'Unit of Measure',
                    required: true,
                    options: [
                        { value: 'bags', label: 'Bags' },
                        { value: 'cases', label: 'Cases' },
                        { value: 'vials', label: 'Vials' },
                        { value: 'birds', label: 'Birds' },
                        { value: 'units', label: 'Units' },
                        { value: 'liters', label: 'Liters' },
                        { value: 'kg', label: 'Kilograms' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'lowStockThreshold',
                    type: 'number',
                    label: 'Low Stock Threshold',
                    required: true,
                    min: 0,
                    step: 1,
                    placeholder: '5',
                    note: 'Alert when stock falls below this number'
                },
                {
                    name: 'price',
                    type: 'number',
                    label: 'Unit Price (USD)',
                    required: false,
                    min: 0,
                    step: 0.01,
                    placeholder: '0.00',
                    note: 'Price per unit (optional)'
                },
                {
                    name: 'supplier',
                    type: 'text',
                    label: 'Supplier (Optional)',
                    required: false,
                    placeholder: 'Supplier name'
                },
                {
                    name: 'notes',
                    type: 'textarea',
                    label: 'Notes (Optional)',
                    required: false,
                    placeholder: 'Additional notes...',
                    rows: 3
                }
            ],
            onSubmit: (data) => {
                const newItem = {
                    id: Date.now(),
                    name: data.name,
                    category: data.category,
                    quantity: parseInt(data.quantity) || 0,
                    unit: data.unit,
                    lowStockThreshold: parseInt(data.lowStockThreshold) || 0,
                    price: parseFloat(data.price) || 0,
                    supplier: data.supplier || '',
                    notes: data.notes || '',
                    lastUpdated: new Date().toISOString().split('T')[0],
                    status: this.calculateStatus(parseInt(data.quantity) || 0, parseInt(data.lowStockThreshold) || 0)
                };
                
                this.addInventoryItem(newItem);
            }
        });
    },

    showEditItemModal(item) {
        ModalManager.createQuickForm({
            id: 'edit-item-modal',
            title: 'Edit Inventory Item',
            subtitle: 'Update item details',
            size: 'modal-lg',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    label: 'Item Name',
                    required: true,
                    value: item.name,
                    autofocus: true
                },
                {
                    name: 'category',
                    type: 'category',
                    label: 'Category',
                    required: true,
                    defaultValue: item.category,
                    categories: [
                        { value: 'feed', label: 'Feed' },
                        { value: 'medication', label: 'Medication' },
                        { value: 'equipment', label: 'Equipment' },
                        { value: 'livestock', label: 'Livestock' },
                        { value: 'crops', label: 'Crops' },
                        { value: 'packaging', label: 'Packaging' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'quantity',
                    type: 'number',
                    label: 'Current Quantity',
                    required: true,
                    min: 0,
                    step: 1,
                    value: item.quantity,
                    note: 'Current stock level'
                },
                {
                    name: 'unit',
                    type: 'select',
                    label: 'Unit of Measure',
                    required: true,
                    value: item.unit,
                    options: [
                        { value: 'bags', label: 'Bags' },
                        { value: 'cases', label: 'Cases' },
                        { value: 'vials', label: 'Vials' },
                        { value: 'birds', label: 'Birds' },
                        { value: 'units', label: 'Units' },
                        { value: 'liters', label: 'Liters' },
                        { value: 'kg', label: 'Kilograms' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    name: 'lowStockThreshold',
                    type: 'number',
                    label: 'Low Stock Threshold',
                    required: true,
                    min: 0,
                    step: 1,
                    value: item.lowStockThreshold,
                    note: 'Alert when stock falls below this number'
                },
                {
                    name: 'price',
                    type: 'number',
                    label: 'Unit Price (USD)',
                    required: false,
                    min: 0,
                    step: 0.01,
                    value: item.price || 0,
                    note: 'Price per unit (optional)'
                },
                {
                    name: 'supplier',
                    type: 'text',
                    label: 'Supplier (Optional)',
                    required: false,
                    value: item.supplier || ''
                },
                {
                    name: 'notes',
                    type: 'textarea',
                    label: 'Notes (Optional)',
                    required: false,
                    value: item.notes || '',
                    rows: 3
                }
            ],
            onSubmit: (data) => {
                const updatedItem = {
                    ...item,
                    name: data.name,
                    category: data.category,
                    quantity: parseInt(data.quantity) || 0,
                    unit: data.unit,
                    lowStockThreshold: parseInt(data.lowStockThreshold) || 0,
                    price: parseFloat(data.price) || 0,
                    supplier: data.supplier || '',
                    notes: data.notes || '',
                    lastUpdated: new Date().toISOString().split('T')[0],
                    status: this.calculateStatus(parseInt(data.quantity) || 0, parseInt(data.lowStockThreshold) || 0)
                };
                
                this.updateInventoryItem(updatedItem);
            }
        });
    },

    showQuickCheckModal() {
        const lowStockItems = this.inventoryItems.filter(item => 
            item.status === 'low-stock' || item.status === 'out-of-stock');
        
        let content;
        
        if (lowStockItems.length === 0) {
            content = `
                <div class="confirmation-content">
                    <div class="confirmation-icon" style="color: var(--color-success);">✅</div>
                    <p class="confirmation-message">All items are in stock!</p>
                    <p class="confirmation-details">No low stock items found.</p>
                </div>
            `;
        } else {
            const itemsList = lowStockItems.map(item => `
                <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                ${item.name}
                            </div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary);">
                                ${item.quantity} ${item.unit} remaining
                            </div>
                        </div>
                        <span class="inv-status ${item.status}">
                            ${this.formatStatus(item.status)}
                        </span>
                    </div>
                </div>
            `).join('');
            
            content = `
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--color-text-primary);">
                        Low Stock Items (${lowStockItems.length})
                    </h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${itemsList}
                    </div>
                    <div style="margin-top: 16px; padding: 12px; background: var(--color-bg-tertiary); 
                         border-radius: 8px; font-size: 14px; color: var(--color-text-secondary);">
                        ⚠️ Consider reordering these items soon.
                    </div>
                </div>
            `;
        }
        
        ModalManager.show({
            id: 'quick-check-modal',
            title: 'Quick Stock Check',
            subtitle: 'Low stock items summary',
            size: 'modal-md',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                ${lowStockItems.length > 0 ? `
                    <button type="button" class="btn btn-primary" id="reorder-low-stock-btn">
                        Reorder All
                    </button>
                ` : ''}
            `,
            onOpen: () => {
                // Add reorder button handler
                const reorderBtn = document.getElementById('reorder-low-stock-btn');
                if (reorderBtn) {
                    reorderBtn.addEventListener('click', () => {
                        this.showReorderModal();
                        ModalManager.closeCurrentModal();
                    });
                }
                
                // Add close button handler
                const closeBtn = document.querySelector('[data-action="close"]');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => ModalManager.closeCurrentModal());
                }
            }
        });
    },

    showReorderModal(itemId = null) {
        let itemsToReorder;
        
        if (itemId) {
            const item = this.inventoryItems.find(i => i.id === itemId);
            itemsToReorder = item ? [item] : [];
        } else {
            itemsToReorder = this.inventoryItems.filter(item => 
                item.status === 'low-stock' || item.status === 'out-of-stock');
        }
        
        if (itemsToReorder.length === 0) {
            ModalManager.alert({
                title: 'No Items to Reorder',
                message: 'All items are currently in stock.',
                icon: '✅'
            });
            return;
        }
        
        const itemsList = itemsToReorder.map(item => `
            <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: 600; color: var(--color-text-primary);">
                        ${item.name}
                    </div>
                    <span class="inv-status ${item.status}">
                        ${this.formatStatus(item.status)}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                    <div>
                        <span style="color: var(--color-text-tertiary);">Current:</span>
                        <span style="margin-left: 8px; font-weight: 600;">
                            ${item.quantity} ${item.unit}
                        </span>
                    </div>
                    <div>
                        <span style="color: var(--color-text-tertiary);">Low Stock:</span>
                        <span style="margin-left: 8px; font-weight: 600;">
                            ${item.lowStockThreshold}
                        </span>
                    </div>
                </div>
                <div style="margin-top: 8px;">
                    <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px;">
                        Reorder Quantity:
                    </div>
                    <input type="number" 
                           class="quick-form-input" 
                           style="width: 100px; padding: 8px 12px; font-size: 14px;"
                           id="reorder-qty-${item.id}"
                           value="${Math.max(10, item.lowStockThreshold * 2)}"
                           min="1"
                           step="1">
                    <span style="margin-left: 8px; color: var(--color-text-secondary);">
                        ${item.unit}
                    </span>
                </div>
            </div>
        `).join('');
        
        const totalValue = itemsToReorder.reduce((sum, item) => {
            const qty = Math.max(10, item.lowStockThreshold * 2);
            return sum + (qty * (item.price || 0));
        }, 0);
        
        ModalManager.createQuickForm({
            id: 'reorder-modal',
            title: 'Place Reorder',
            subtitle: 'Order low stock items from suppliers',
            size: 'modal-lg',
            fields: [
                {
                    name: 'supplierName',
                    type: 'text',
                    label: 'Supplier Name',
                    required: true,
                    placeholder: 'e.g., Farm Supplies Inc',
                    autofocus: true
                },
                {
                    name: 'orderNotes',
                    type: 'textarea',
                    label: 'Order Notes (Optional)',
                    required: false,
                    placeholder: 'Special instructions, delivery requirements...',
                    rows: 3
                },
                {
                    name: 'deliveryDate',
                    type: 'text',
                    label: 'Expected Delivery Date',
                    required: false,
                    placeholder: 'YYYY-MM-DD or "ASAP"'
                }
            ],
            content: `
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">
                        Items to Reorder (${itemsToReorder.length})
                    </h4>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--color-border-light); 
                         border-radius: 8px; margin-bottom: 16px;">
                        ${itemsList}
                    </div>
                    <div style="padding: 12px; background: var(--color-bg-tertiary); border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span style="color: var(--color-text-secondary);">Estimated Total:</span>
                            <span style="font-weight: 600; color: var(--color-text-primary);">
                                ${this.formatCurrency(totalValue)}
                            </span>
                        </div>
                    </div>
                </div>
            `,
            onSubmit: (data) => {
                // Get reorder quantities
                const orderItems = itemsToReorder.map(item => {
                    const qtyInput = document.getElementById(`reorder-qty-${item.id}`);
                    const quantity = parseInt(qtyInput?.value) || Math.max(10, item.lowStockThreshold * 2);
                    
                    return {
                        id: item.id,
                        name: item.name,
                        quantity: quantity,
                        unit: item.unit,
                        price: item.price || 0,
                        total: quantity * (item.price || 0)
                    };
                });
                
                const totalOrderValue = orderItems.reduce((sum, item) => sum + item.total, 0);
                
                // Create order record
                const order = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    supplierName: data.supplierName,
                    orderNotes: data.orderNotes || '',
                    deliveryDate: data.deliveryDate || '',
                    items: orderItems,
                    totalValue: totalOrderValue,
                    status: 'pending'
                };
                
                this.placeReorder(order);
            }
        });
    },

    showInventoryReportsModal() {
        const stats = this.calculateStats();
        const categories = this.getCategoryBreakdown();
        
        ModalManager.showReports({
            id: 'inventory-reports-modal',
            title: 'Inventory Reports',
            subtitle: 'Generate inventory analysis reports',
            reports: [
                {
                    id: 'stock-summary',
                    icon: '📋',
                    title: 'Stock Summary',
                    description: 'Current stock levels',
                    preview: `
                        <h4 class="font-semibold mb-2">Stock Summary Report</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Total Items:</span>
                                <span class="font-semibold">${stats.totalItems}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Total Value:</span>
                                <span class="font-semibold">${this.formatCurrency(stats.totalValue)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Low Stock Items:</span>
                                <span class="font-semibold text-warning">${stats.lowStockItems}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Categories:</span>
                                <span class="font-semibold">${stats.categories}</span>
                            </div>
                        </div>
                    `
                },
                {
                    id: 'category-breakdown',
                    icon: '📊',
                    title: 'Category Breakdown',
                    description: 'Stock by category',
                    preview: `
                        <h4 class="font-semibold mb-2">Category Breakdown</h4>
                        <div class="space-y-2" style="max-height: 200px; overflow-y: auto;">
                            ${categories.map(cat => `
                                <div class="flex justify-between items-center">
                                    <span>${cat.name}:</span>
                                    <span class="font-semibold">${cat.count} items</span>
                                </div>
                            `).join('')}
                        </div>
                    `
                },
                {
                    id: 'low-stock-report',
                    icon: '⚠️',
                    title: 'Low Stock Report',
                    description: 'Items needing reorder',
                    preview: `
                        <h4 class="font-semibold mb-2">Low Stock Report</h4>
                        <p class="text-tertiary">Lists all items below their low stock threshold.</p>
                        <p class="text-tertiary text-sm mt-2">
                            Low Stock Items: <span class="font-semibold">${stats.lowStockItems}</span>
                        </p>
                    `
                },
                {
                    id: 'value-report',
                    icon: '💰',
                    title: 'Value Report',
                    description: 'Inventory valuation',
                    preview: `
                        <h4 class="font-semibold mb-2">Inventory Value Report</h4>
                        <p class="text-tertiary">Detailed valuation of all inventory items.</p>
                        <p class="text-tertiary text-sm mt-2">
                            Total Value: <span class="font-semibold">${this.formatCurrency(stats.totalValue)}</span>
                        </p>
                    `
                },
                {
                    id: 'export-inventory',
                    icon: '📤',
                    title: 'Export Data',
                    description: 'Export inventory data',
                    buttonText: 'Export Data',
                    preview: `
                        <h4 class="font-semibold mb-2">Export Inventory Data</h4>
                        <p class="text-tertiary">Export all inventory data as JSON, CSV, or PDF.</p>
                        <p class="text-tertiary text-sm mt-2">
                            Total Items: <span class="font-semibold">${stats.totalItems}</span>
                        </p>
                    `
                },
                {
                    id: 'print-inventory',
                    icon: '🖨️',
                    title: 'Print Report',
                    description: 'Printable version',
                    buttonText: 'Print Report',
                    preview: `
                        <h4 class="font-semibold mb-2">Print Inventory Report</h4>
                        <p class="text-tertiary">Generate a printer-friendly version of the selected report.</p>
                    `
                }
            ],
            onReportSelect: (reportId) => {
                switch(reportId) {
                    case 'export-inventory':
                        this.exportInventoryData();
                        break;
                    case 'print-inventory':
                        window.print();
                        break;
                    default:
                        this.generateInventoryReport(reportId);
                }
            }
        });
    },

    showViewItemModal(itemId) {
        const item = this.inventoryItems.find(i => i.id === itemId);
        if (!item) return;
        
        const content = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Item Details</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Name</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">${item.name}</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Category</div>
                            <div>
                                <span style="padding: 4px 8px; background: var(--color-bg-tertiary); 
                                      border-radius: 6px; font-size: 12px;">
                                    ${this.formatCategoryName(item.category)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Supplier</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                ${item.supplier || 'Not specified'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--color-text-primary);">Stock Information</h4>
                    <div class="space-y-3">
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Current Stock</div>
                            <div style="font-weight: 600; color: var(--color-text-primary); font-size: 18px;">
                                ${item.quantity} ${item.unit}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Status</div>
                            <span class="inv-status ${item.status}">
                                ${this.formatStatus(item.status)}
                            </span>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Low Stock Threshold</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                ${item.lowStockThreshold} ${item.unit}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 2px;">Last Updated</div>
                            <div style="font-weight: 600; color: var(--color-text-primary);">
                                ${this.formatDate(item.lastUpdated)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${item.notes ? `
                <div style="margin-top: 24px;">
                    <h4 style="margin-bottom: 8px; color: var(--color-text-primary);">Notes</h4>
                    <div style="padding: 12px; background: var(--color-bg-tertiary); border-radius: 8px; font-size: 14px;">
                        ${item.notes}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-top: 24px; padding: 16px; background: var(--color-bg-tertiary); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; color: var(--color-text-tertiary);">Current Value</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--color-text-primary);">
                            ${this.formatCurrency(item.quantity * (item.price || 0))}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: var(--color-text-tertiary); text-align: right;">Unit Price</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--color-text-primary);">
                            ${this.formatCurrency(item.price || 0)} per ${item.unit}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        ModalManager.show({
            id: `view-item-${itemId}`,
            title: item.name,
            subtitle: 'Inventory Item Details',
            size: 'modal-lg',
            content: content,
            footer: `
                <button type="button" class="btn btn-outline" data-action="close">Close</button>
                <button type="button" class="btn btn-primary" data-action="edit" data-id="${itemId}">
                    Edit Item
                </button>
                <button type="button" class="btn btn-warning" data-action="reorder" data-id="${itemId}">
                    Reorder
                </button>
            `,
            onOpen: () => {
                // Add button handlers
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const id = parseInt(btn.dataset.id);
                        
                        ModalManager.closeCurrentModal();
                        
                        switch(action) {
                            case 'edit':
                                this.showEditItemModal(item);
                                break;
                            case 'reorder':
                                this.showReorderModal(id);
                                break;
                        }
                    });
                });
            }
        });
    },

    // ==================== SETUP EVENT LISTENERS ====================
    setupEventListeners() {
        // Quick action buttons
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.showAddItemModal());
        document.getElementById('quick-check-btn')?.addEventListener('click', () => this.showQuickCheckModal());
        document.getElementById('reorder-btn')?.addEventListener('click', () => this.showReorderModal());
        document.getElementById('inventory-report-btn')?.addEventListener('click', () => this.showInventoryReportsModal());
        
        // Add first item button
        document.getElementById('add-first-item-btn')?.addEventListener('click', () => this.showAddItemModal());
        
        // Search and filter
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderModule();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.renderModule();
                }
            });
        }
        
        document.getElementById('clear-search-btn')?.addEventListener('click', () => {
            this.searchQuery = '';
            this.renderModule();
        });
        
        // Category filters
        document.querySelectorAll('.inv-category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.renderModule();
            });
        });
        
        // Table action buttons
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            
            const action = actionBtn.dataset.action;
            const id = parseInt(actionBtn.dataset.id);
            
            if (!id) return;
            
            switch(action) {
                case 'edit':
                    const itemToEdit = this.inventoryItems.find(item => item.id === id);
                    if (itemToEdit) {
                        this.showEditItemModal(itemToEdit);
                    }
                    break;
                    
                case 'delete':
                    const itemToDelete = this.inventoryItems.find(item => item.id === id);
                    if (itemToDelete) {
                        ModalManager.confirm({
                            title: 'Delete Inventory Item',
                            message: `Are you sure you want to delete "${itemToDelete.name}"?`,
                            details: 'This action cannot be undone.',
                            icon: '🗑️',
                            type: 'modal-danger',
                            danger: true,
                            confirmText: 'Delete'
                        }).then((confirmed) => {
                            if (confirmed) {
                                this.deleteInventoryItem(id);
                            }
                        });
                    }
                    break;
                    
                case 'view':
                    this.showViewItemModal(id);
                    break;
            }
        });
    },

    // ==================== INVENTORY METHODS ====================
    addInventoryItem(item) {
        this.inventoryItems.unshift(item);
        this.saveData();
        this.renderModule();
        
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Show success notification
        ModalManager.alert({
            title: 'Item Added',
            message: `"${item.name}" has been added to inventory.`,
            icon: '✅',
            type: 'modal-success'
        });
    },

    updateInventoryItem(updatedItem) {
        const index = this.inventoryItems.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            this.inventoryItems[index] = updatedItem;
            this.saveData();
            this.renderModule();
            
            // Update dashboard stats
            this.updateDashboardStats();
            
            // Show success notification
            ModalManager.alert({
                title: 'Item Updated',
                message: `"${updatedItem.name}" has been updated.`,
                icon: '✅',
                type: 'modal-success'
            });
        }
    },

    deleteInventoryItem(id) {
        const item = this.inventoryItems.find(item => item.id === id);
        if (!item) return;
        
        this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
        this.saveData();
        this.renderModule();
        
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Show success notification
        ModalManager.alert({
            title: 'Item Deleted',
            message: `"${item.name}" has been removed from inventory.`,
            icon: '✅',
            type: 'modal-success'
        });
    },

    placeReorder(order) {
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('farm-orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('farm-orders', JSON.stringify(orders));
        
        // Show success notification
        ModalManager.alert({
            title: 'Order Placed',
            message: `Order #${order.id} has been placed with ${order.supplierName}.`,
            details: `Total value: ${this.formatCurrency(order.totalValue)}`,
            icon: '✅',
            type: 'modal-success'
        });
        
        // Here you would typically send to backend or email supplier
        console.log('Order placed:', order);
    },

    calculateStatus(quantity, lowStockThreshold) {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= lowStockThreshold) return 'low-stock';
        return 'in-stock';
    },

    getCategoryBreakdown() {
        const categories = {};
        
        this.inventoryItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = {
                    name: this.formatCategoryName(item.category),
                    count: 0,
                    value: 0
                };
            }
            categories[item.category].count++;
            categories[item.category].value += item.quantity * (item.price || 0);
        });
        
        return Object.values(categories).sort((a, b) => b.count - a.count);
    },

    generateInventoryReport(reportId) {
        // Show loading modal
        const loadingId = ModalManager.showLoading({
            message: `Generating ${reportId.replace('-', ' ')} report...`
        });
        
        // Simulate report generation
        setTimeout(() => {
            ModalManager.hideLoading();
            
            // Show success alert
            ModalManager.alert({
                title: 'Report Generated',
                message: `The ${reportId.replace('-', ' ')} report has been generated successfully.`,
                icon: '✅',
                type: 'modal-success'
            });
            
            // Here you would implement actual report generation logic
            console.log(`Generating inventory report: ${reportId}`);
        }, 1500);
    },

    exportInventoryData() {
        const dataStr = JSON.stringify(this.inventoryItems, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        ModalManager.alert({
            title: 'Data Exported',
            message: 'Inventory data has been exported successfully.',
            icon: '✅',
            type: 'modal-success'
        });
    },

    updateDashboardStats() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            if (!window.FarmModules.appData.profile) {
                window.FarmModules.appData.profile = {};
            }
            if (!window.FarmModules.appData.profile.dashboardStats) {
                window.FarmModules.appData.profile.dashboardStats = {};
            }
            
            // Update inventory stats in shared data
            Object.assign(window.FarmModules.appData.profile.dashboardStats, {
                totalInventoryItems: stats.totalItems,
                inventoryValue: stats.totalValue
            });
            
            // Dispatch event to update dashboard
            const statsUpdateEvent = new CustomEvent('inventoryStatsUpdated', {
                detail: {
                    totalInventoryItems: stats.totalItems,
                    inventoryValue: stats.totalValue
                }
            });
            document.dispatchEvent(statsUpdateEvent);
        }
    },

    saveData() {
        localStorage.setItem('farm-inventory', JSON.stringify(this.inventoryItems));
    },

    // ==================== HELPER METHODS ====================
    formatCategoryName(category) {
        if (!category) return 'Unknown';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatStatus(status) {
        const statusMap = {
            'in-stock': 'In Stock',
            'low-stock': 'Low Stock',
            'out-of-stock': 'Out of Stock',
            'on-order': 'On Order'
        };
        return statusMap[status] || status;
    },

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('inventory', InventoryModule);
    console.log('✅ Inventory module registered');
}
