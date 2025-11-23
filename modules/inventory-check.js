// modules/inventory-check.js
FarmModules.registerModule('inventory-check', {
    name: 'Inventory',
    icon: '📦',
    template: `
        <div id="inventory-check" class="section active">
            <div class="module-header">
                <h1>Inventory Management</h1>
                <p>Track and manage your farm inventory</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-inventory-item">
                        <span>➕</span> Add Item
                    </button>
                    <button class="btn btn-secondary" id="quick-check">
                        <span>🔍</span> Quick Check
                    </button>
                    <button class="btn btn-info" id="generate-order">
                        <span>📋</span> Generate Order
                    </button>
                    <button class="btn btn-outline" id="export-inventory">
                        <span>📥</span> Export
                    </button>
                </div>
            </div>

            <!-- Inventory Summary -->
            <div class="inventory-summary">
                <div class="summary-card total-items">
                    <div class="summary-icon">📦</div>
                    <div class="summary-content">
                        <h3>Total Items</h3>
                        <div class="summary-value" id="total-items-count">0</div>
                        <div class="summary-trend">Across all categories</div>
                    </div>
                </div>
                <div class="summary-card low-stock">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-content">
                        <h3>Low Stock</h3>
                        <div class="summary-value" id="low-stock-count">0</div>
                        <div class="summary-trend">Need reordering</div>
                    </div>
                </div>
                <div class="summary-card out-of-stock">
                    <div class="summary-icon">❌</div>
                    <div class="summary-content">
                        <h3>Out of Stock</h3>
                        <div class="summary-value" id="out-of-stock-count">0</div>
                        <div class="summary-trend">Urgent attention needed</div>
                    </div>
                </div>
                <div class="summary-card total-value">
                    <div class="summary-icon">💰</div>
                    <div class="summary-content">
                        <h3>Total Value</h3>
                        <div class="summary-value" id="total-inventory-value">$0.00</div>
                        <div class="summary-trend">Current stock value</div>
                    </div>
                </div>
            </div>

            <!-- Filters and Search -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>Category:</label>
                    <select id="category-filter" class="filter-select">
                        <option value="all">All Categories</option>
                        <option value="seeds">Seeds</option>
                        <option value="feed">Animal Feed</option>
                        <option value="fertilizer">Fertilizer</option>
                        <option value="equipment">Equipment</option>
                        <option value="tools">Tools</option>
                        <option value="medical">Medical Supplies</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Stock Status:</label>
                    <select id="stock-filter" class="filter-select">
                        <option value="all">All Items</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="adequate">Adequate Stock</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Location:</label>
                    <select id="location-filter" class="filter-select">
                        <option value="all">All Locations</option>
                        <!-- Locations will be populated dynamically -->
                    </select>
                </div>
                <div class="filter-group">
                    <input type="text" id="search-inventory" placeholder="Search inventory..." class="search-input">
                </div>
            </div>

            <!-- Inventory Grid -->
            <div class="inventory-grid" id="inventory-grid">
                <!-- Inventory items will be rendered here -->
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                        <button class="btn btn-primary" id="add-first-item">Add First Item</button>
                    </div>
                </div>
            </div>

            <!-- Low Stock Alert Section -->
            <div class="alerts-section" id="low-stock-alerts" style="display: none;">
                <div class="alert-header">
                    <h3>⚠️ Low Stock Alerts</h3>
                    <button class="btn btn-text" id="dismiss-alerts">Dismiss All</button>
                </div>
                <div class="alerts-grid" id="alerts-grid">
                    <!-- Low stock alerts will be populated here -->
                </div>
            </div>
        </div>
    `,

    sidebar: `
        <div class="inventory-sidebar">
            <h3>Quick Categories</h3>
            <div class="category-stats">
                <div class="category-stat" data-category="seeds">
                    <span class="category-icon">🌱</span>
                    <span class="category-name">Seeds</span>
                    <span class="category-count" id="seeds-count">0</span>
                </div>
                <div class="category-stat" data-category="feed">
                    <span class="category-icon">🌾</span>
                    <span class="category-name">Animal Feed</span>
                    <span class="category-count" id="feed-count">0</span>
                </div>
                <div class="category-stat" data-category="fertilizer">
                    <span class="category-icon">🧪</span>
                    <span class="category-name">Fertilizer</span>
                    <span class="category-count" id="fertilizer-count">0</span>
                </div>
                <div class="category-stat" data-category="equipment">
                    <span class="category-icon">🚜</span>
                    <span class="category-name">Equipment</span>
                    <span class="category-count" id="equipment-count">0</span>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Updates</h3>
                <div id="inventory-updates">
                    <div class="no-updates">No recent updates</div>
                </div>
            </div>

            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <button class="sidebar-btn" id="check-low-stock">
                    <span>🔍</span> Check Low Stock
                </button>
                <button class="sidebar-btn" id="update-all-quantities">
                    <span>🔄</span> Update Quantities
                </button>
                <button class="sidebar-btn" id="export-stock-report">
                    <span>📊</span> Stock Report
                </button>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('Inventory Check module initializing...');
        this.loadInventoryData();
        this.attachEventListeners();
        this.updateSummary();
        this.checkLowStockAlerts();
    },

    loadInventoryData: function() {
        const inventory = FarmModules.appData.inventory || [];
        this.renderInventoryGrid(inventory);
        this.updateCategoryStats();
        this.updateRecentUpdates();
        this.updateLocationFilters();
    },

    renderInventoryGrid: function(inventory) {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        if (inventory.length === 0) {
            grid.innerHTML = `
                <div class="empty-inventory">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h4>No inventory items yet</h4>
                        <p>Start by adding your first inventory item</p>
                        <button class="btn btn-primary" id="add-first-item">Add First Item</button>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = inventory.map(item => `
            <div class="inventory-item ${this.getStockStatusClass(item)}" data-id="${item.id}">
                <div class="item-header">
                    <div class="item-category ${item.category}">
                        <span class="category-icon">${this.getCategoryIcon(item.category)}</span>
                        <span class="category-name">${this.formatCategory(item.category)}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon edit-item" title="Edit" data-id="${item.id}">✏️</button>
                        <button class="btn-icon delete-item" title="Delete" data-id="${item.id}">🗑️</button>
                    </div>
                </div>
                
                <div class="item-content">
                    <h4 class="item-name">${item.name || 'Unnamed Item'}</h4>
                    <p class="item-description">${item.description || 'No description'}</p>
                    
                    <div class="item-details">
                        <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">
                                <span class="quantity ${this.getQuantityStatus(item)}">${item.quantity || 0}</span>
                                <span class="unit">${item.unit || 'units'}</span>
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value location">${item.location || 'Not specified'}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Supplier:</span>
                            <span class="detail-value supplier">${item.supplier || 'Not specified'}</span>
                        </div>
                        
                        ${item.cost ? `
                        <div class="detail-row">
                            <span class="detail-label">Unit Cost:</span>
                            <span class="detail-value cost">$${parseFloat(item.cost).toFixed(2)}</span>
                        </div>
                        ` : ''}
                        
                        ${item.expiryDate ? `
                        <div class="detail-row">
                            <span class="detail-label">Expires:</span>
                            <span class="detail-value expiry ${this.getExpiryStatus(item)}">${this.formatDate(item.expiryDate)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="item-footer">
                    <div class="stock-status">
                        <span class="status-badge ${this.getStockStatusClass(item)}">
                            ${this.getStockStatusText(item)}
                        </span>
                    </div>
                    <div class="last-updated">
                        Updated: ${this.formatDate(item.lastUpdated || item.dateAdded)}
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateSummary: function() {
        const inventory = FarmModules.appData.inventory || [];
        
        const totalItems = inventory.length;
        const lowStockCount = inventory.filter(item => this.isLowStock(item)).length;
        const outOfStockCount = inventory.filter(item => this.isOutOfStock(item)).length;
        const totalValue = inventory.reduce((sum, item) => {
            const quantity = parseInt(item.quantity) || 0;
            const cost = parseFloat(item.cost) || 0;
            return sum + (quantity * cost);
        }, 0);

        this.updateElement('total-items-count', totalItems);
        this.updateElement('low-stock-count', lowStockCount);
        this.updateElement('out-of-stock-count', outOfStockCount);
        this.updateElement('total-inventory-value', `$${totalValue.toFixed(2)}`);
    },

    updateCategoryStats: function() {
        const inventory = FarmModules.appData.inventory || [];
        const categories = {};

        inventory.forEach(item => {
            const category = item.category || 'other';
            categories[category] = (categories[category] || 0) + 1;
        });

        // Update category counts in sidebar
        Object.keys(categories).forEach(category => {
            const element = document.getElementById(`${category}-count`);
            if (element) {
                element.textContent = categories[category];
            }
        });
    },

    updateRecentUpdates: function() {
        const inventory = FarmModules.appData.inventory || [];
        const recentUpdates = inventory
            .sort((a, b) => new Date(b.lastUpdated || b.dateAdded) - new Date(a.lastUpdated || a.dateAdded))
            .slice(0, 5);

        const container = document.getElementById('inventory-updates');
        if (!container) return;

        if (recentUpdates.length === 0) {
            container.innerHTML = '<div class="no-updates">No recent updates</div>';
            return;
        }

        container.innerHTML = recentUpdates.map(item => `
            <div class="update-item">
                <div class="update-icon">${this.getCategoryIcon(item.category)}</div>
                <div class="update-content">
                    <div class="update-name">${item.name || 'Unnamed Item'}</div>
                    <div class="update-details">
                        <span class="quantity">${item.quantity || 0} ${item.unit || 'units'}</span>
                        <span class="update-time">${this.formatRelativeTime(item.lastUpdated || item.dateAdded)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    checkLowStockAlerts: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockItems = inventory.filter(item => this.isLowStock(item) || this.isOutOfStock(item));

        const alertsSection = document.getElementById('low-stock-alerts');
        const alertsGrid = document.getElementById('alerts-grid');

        if (lowStockItems.length === 0) {
            alertsSection.style.display = 'none';
            return;
        }

        alertsSection.style.display = 'block';
        alertsGrid.innerHTML = lowStockItems.map(item => `
            <div class="alert-item ${this.getStockStatusClass(item)}">
                <div class="alert-icon">
                    ${this.isOutOfStock(item) ? '❌' : '⚠️'}
                </div>
                <div class="alert-content">
                    <div class="alert-title">${item.name || 'Unnamed Item'}</div>
                    <div class="alert-details">
                        Current stock: ${item.quantity || 0} ${item.unit || 'units'}
                        ${item.minStock ? ` (Min: ${item.minStock})` : ''}
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-primary order-item" data-id="${item.id}">
                        Order
                    </button>
                    <button class="btn btn-sm btn-outline update-stock" data-id="${item.id}">
                        Update
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Utility functions for inventory
    getStockStatusClass: function(item) {
        if (this.isOutOfStock(item)) return 'out-of-stock';
        if (this.isLowStock(item)) return 'low-stock';
        return 'adequate-stock';
    },

    getStockStatusText: function(item) {
        if (this.isOutOfStock(item)) return 'Out of Stock';
        if (this.isLowStock(item)) return 'Low Stock';
        return 'Adequate';
    },

    isLowStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        const minStock = parseInt(item.minStock) || 0;
        return quantity > 0 && quantity <= minStock;
    },

    isOutOfStock: function(item) {
        const quantity = parseInt(item.quantity) || 0;
        return quantity === 0;
    },

    getQuantityStatus: function(item) {
        if (this.isOutOfStock(item)) return 'critical';
        if (this.isLowStock(item)) return 'warning';
        return 'good';
    },

    getCategoryIcon: function(category) {
        const icons = {
            seeds: '🌱',
            feed: '🌾',
            fertilizer: '🧪',
            equipment: '🚜',
            tools: '🛠️',
            medical: '💊',
            other: '📦'
        };
        return icons[category] || '📦';
    },

    getExpiryStatus: function(item) {
        if (!item.expiryDate) return '';
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'expired';
        if (diffDays < 7) return 'expiring-soon';
        return '';
    },

    formatCategory: function(category) {
        if (!category) return 'Other';
        return category.charAt(0).toUpperCase() + category.slice(1);
    },

    formatRelativeTime: function(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return this.formatDate(dateString);
        } catch (e) {
            return 'Unknown';
        }
    },

    attachEventListeners: function() {
        // Add item buttons
        document.getElementById('add-inventory-item')?.addEventListener('click', () => this.showAddItemModal());
        document.getElementById('add-first-item')?.addEventListener('click', () => this.showAddItemModal());

        // Filter events
        document.getElementById('category-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('stock-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('location-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('search-inventory')?.addEventListener('input', 
            this.debounce(() => this.applyFilters(), 300)
        );

        // Alert actions
        document.getElementById('dismiss-alerts')?.addEventListener('click', () => {
            document.getElementById('low-stock-alerts').style.display = 'none';
        });

        // Item actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-item')) {
                const itemId = e.target.closest('.edit-item').dataset.id;
                this.editItem(itemId);
            }
            if (e.target.closest('.delete-item')) {
                const itemId = e.target.closest('.delete-item').dataset.id;
                this.deleteItem(itemId);
            }
            if (e.target.closest('.order-item')) {
                const itemId = e.target.closest('.order-item').dataset.id;
                this.orderItem(itemId);
            }
            if (e.target.closest('.update-stock')) {
                const itemId = e.target.closest('.update-stock').dataset.id;
                this.updateStock(itemId);
            }
        });

        // Sidebar actions
        document.getElementById('check-low-stock')?.addEventListener('click', () => this.checkLowStockAlerts());
        document.getElementById('update-all-quantities')?.addEventListener('click', () => this.showBulkUpdateModal());
        document.getElementById('export-stock-report')?.addEventListener('click', () => this.exportStockReport());
    },

    applyFilters: function() {
        const inventory = FarmModules.appData.inventory || [];
        let filtered = [...inventory];

        // Category filter
        const categoryFilter = document.getElementById('category-filter').value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        // Stock status filter
        const stockFilter = document.getElementById('stock-filter').value;
        if (stockFilter !== 'all') {
            filtered = filtered.filter(item => {
                if (stockFilter === 'low') return this.isLowStock(item);
                if (stockFilter === 'out') return this.isOutOfStock(item);
                if (stockFilter === 'adequate') return !this.isLowStock(item) && !this.isOutOfStock(item);
                return true;
            });
        }

        // Location filter
        const locationFilter = document.getElementById('location-filter').value;
        if (locationFilter !== 'all') {
            filtered = filtered.filter(item => item.location === locationFilter);
        }

        // Search filter
        const searchTerm = document.getElementById('search-inventory').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(item => 
                (item.name || '').toLowerCase().includes(searchTerm) ||
                (item.description || '').toLowerCase().includes(searchTerm) ||
                (item.supplier || '').toLowerCase().includes(searchTerm) ||
                (item.location || '').toLowerCase().includes(searchTerm)
            );
        }

        this.renderInventoryGrid(filtered);
    },

    updateLocationFilters: function() {
        const inventory = FarmModules.appData.inventory || [];
        const locations = [...new Set(inventory.map(item => item.location).filter(Boolean))];
        
        const select = document.getElementById('location-filter');
        if (!select) return;

        const allOption = select.querySelector('option[value="all"]');
        select.innerHTML = '';
        select.appendChild(allOption);

        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            select.appendChild(option);
        });
    },

    showAddItemModal: function() {
        // Simulate adding a sample item
        const newItem = {
            id: 'inv-' + Date.now(),
            name: 'Sample Animal Feed',
            category: 'feed',
            description: 'High-quality animal feed for livestock',
            quantity: 25,
            unit: 'bags',
            minStock: 10,
            location: 'Storage Shed A',
            supplier: 'Farm Supply Co.',
            cost: 45.00,
            lastUpdated: new Date().toISOString(),
            dateAdded: new Date().toISOString()
        };

        if (!FarmModules.appData.inventory) {
            FarmModules.appData.inventory = [];
        }
        FarmModules.appData.inventory.push(newItem);

        this.loadInventoryData();
        this.updateSummary();
        this.checkLowStockAlerts();

        this.showNotification('Inventory item added successfully!', 'success');
    },

    editItem: function(itemId) {
        this.showNotification('Edit item: ' + itemId, 'info');
    },

    deleteItem: function(itemId) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            FarmModules.appData.inventory = FarmModules.appData.inventory.filter(item => item.id !== itemId);
            this.loadInventoryData();
            this.updateSummary();
            this.checkLowStockAlerts();
            this.showNotification('Inventory item deleted', 'success');
        }
    },

    orderItem: function(itemId) {
        this.showNotification('Ordering item: ' + itemId, 'info');
    },

    updateStock: function(itemId) {
        this.showNotification('Updating stock for: ' + itemId, 'info');
    },

    showBulkUpdateModal: function() {
        this.showNotification('Bulk update modal would open here', 'info');
    },

    exportStockReport: function() {
        this.showNotification('Exporting stock report...', 'info');
    },

    // Shared utility functions
    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
