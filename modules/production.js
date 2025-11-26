// modules/production.js
console.log('Loading production module...');

class ProductionModule {
    constructor() {
        this.name = 'production';
        this.initialized = false;
        this.productionData = [];
        this.container = null;
    }

    async initialize() {
        console.log('🏭 Initializing production tracking...');
        await this.loadProductionData();
        this.render();
        this.initialized = true;
        return true;
    }

    async loadProductionData() {
        try {
            if (window.db) {
                this.productionData = await window.db.getAll('production');
            } else {
                const savedData = localStorage.getItem('farm-production');
                this.productionData = savedData ? JSON.parse(savedData) : this.getSampleData();
            }
        } catch (error) {
            console.error('Error loading production data:', error);
            this.productionData = this.getSampleData();
        }
    }

    getSampleData() {
        return [
            {
                id: 'prod_1',
                product: 'Eggs',
                quantity: 1200,
                unit: 'pieces',
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                batch: 'BATCH-001',
                quality: 'Grade A',
                notes: 'Normal production',
                timestamp: new Date().toISOString()
            },
            {
                id: 'prod_2',
                product: 'Broiler Chickens',
                quantity: 500,
                unit: 'birds',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                batch: 'BATCH-002',
                quality: 'Grade A',
                notes: 'Ready for market',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    async saveProductionData() {
        try {
            if (window.db) {
                await window.db.clear('production');
                for (const record of this.productionData) {
                    await window.db.put('production', record);
                }
            } else {
                localStorage.setItem('farm-production', JSON.stringify(this.productionData));
            }
        } catch (error) {
            console.error('Error saving production data:', error);
        }
    }

    async addProductionRecord(recordData) {
        const record = {
            id: `prod_${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            product: recordData.product,
            quantity: parseInt(recordData.quantity),
            unit: recordData.unit,
            batch: recordData.batch,
            quality: recordData.quality,
            notes: recordData.notes || '',
            productionType: recordData.productionType || 'regular'
        };

        this.productionData.unshift(record);
        await this.saveProductionData();
        await this.updateDisplay();
        this.showToast('Production record added!', 'success');
    }

    async updateProductionRecord(recordId, updates) {
        const index = this.productionData.findIndex(record => record.id === recordId);
        if (index !== -1) {
            this.productionData[index] = {
                ...this.productionData[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveProductionData();
            await this.updateDisplay();
            this.showToast('Production record updated!', 'success');
        }
    }

    async deleteProductionRecord(recordId) {
        this.productionData = this.productionData.filter(record => record.id !== recordId);
        await this.saveProductionData();
        await this.updateDisplay();
        this.showToast('Production record deleted!', 'success');
    }

    calculateStats() {
        const today = new Date().toDateString();
        const todayProduction = this.productionData.filter(record => 
            new Date(record.timestamp).toDateString() === today
        );
        
        const totalToday = todayProduction.reduce((sum, record) => sum + record.quantity, 0);
        const totalAllTime = this.productionData.reduce((sum, record) => sum + record.quantity, 0);
        
        // Group by product type
        const productStats = {};
        this.productionData.forEach(record => {
            if (!productStats[record.product]) {
                productStats[record.product] = 0;
            }
            productStats[record.product] += record.quantity;
        });

        const topProduct = Object.entries(productStats).sort((a, b) => b[1] - a[1])[0];

        return {
            today: totalToday,
            allTime: totalAllTime,
            todayRecords: todayProduction.length,
            topProduct: topProduct ? `${topProduct[0]} (${topProduct[1]})` : 'None',
            uniqueProducts: Object.keys(productStats).length
        };
    }

    render() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = this.getTemplate();
        this.container = contentArea.querySelector('.production-container');
        this.setupEventListeners();
        this.updateDisplay();
    }

    getTemplate() {
        return `
            <div class="production-container">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h1 class="header-title">Production</h1>
                        <p class="header-subtitle">Track farm production and yields</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-production-btn">
                            <i class="icon">➕</i>
                            Add Record
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon today">📅</div>
                        <div class="stat-content">
                            <div class="stat-value" id="today-production">0</div>
                            <div class="stat-label">Today's Production</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon total">🏭</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-production">0</div>
                            <div class="stat-label">Total Production</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon product">⭐</div>
                        <div class="stat-content">
                            <div class="stat-value" id="top-product">None</div>
                            <div class="stat-label">Top Product</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon items">📦</div>
                        <div class="stat-content">
                            <div class="stat-value" id="unique-products">0</div>
                            <div class="stat-label">Products</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <div class="action-buttons-grid">
                        <button class="action-card" data-action="eggs">
                            <div class="action-icon">🥚</div>
                            <div class="action-text">Egg Production</div>
                        </button>
                        <button class="action-card" data-action="broilers">
                            <div class="action-icon">🐔</div>
                            <div class="action-text">Broiler Production</div>
                        </button>
                        <button class="action-card" data-action="crops">
                            <div class="action-icon">🌱</div>
                            <div class="action-text">Crop Harvest</div>
                        </button>
                        <button class="action-card" data-action="daily">
                            <div class="action-icon">📊</div>
                            <div class="action-text">Daily Summary</div>
                        </button>
                    </div>
                </div>

                <!-- Production Records -->
                <div class="table-container">
                    <div class="table-header">
                        <h3>Recent Production Records</h3>
                        <div class="table-actions">
                            <button class="btn-text" id="export-production-btn">
                                <i class="icon">📤</i>
                                Export
                            </button>
                        </div>
                    </div>
                    <div class="table-content" id="production-table-content">
                        <!-- Records will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    async updateDisplay() {
        if (!this.container) return;

        const stats = this.calculateStats();
        
        // Update stats
        this.updateElement('#today-production', stats.today);
        this.updateElement('#total-production', stats.allTime);
        this.updateElement('#top-product', stats.topProduct);
        this.updateElement('#unique-products', stats.uniqueProducts);

        // Update table
        await this.renderProductionTable();
    }

    updateElement(selector, content) {
        const element = this.container?.querySelector(selector);
        if (element) element.textContent = content;
    }

    async renderProductionTable() {
        const tableContent = this.container?.querySelector('#production-table-content');
        if (!tableContent) return;

        if (this.productionData.length === 0) {
            tableContent.innerHTML = this.getEmptyState();
            return;
        }

        tableContent.innerHTML = this.getProductionTable();
        this.setupTableEventListeners();
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🏭</div>
                <h3>No Production Records</h3>
                <p>Start tracking your farm's production output</p>
                <button class="btn-primary" id="add-first-production-btn">
                    Add First Record
                </button>
            </div>
        `;
    }

    getProductionTable() {
        const recentRecords = this.productionData.slice(0, 15);
        
        return `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Batch</th>
                            <th class="text-right">Quantity</th>
                            <th>Unit</th>
                            <th>Quality</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRecords.map(record => `
                            <tr class="production-row" data-record-id="${record.id}">
                                <td>
                                    <div class="date-primary">${record.date}</div>
                                </td>
                                <td class="product-cell">
                                    <div class="product-name">${record.product}</div>
                                    <div class="product-type">${record.productionType}</div>
                                </td>
                                <td class="batch-cell">${record.batch}</td>
                                <td class="text-right">
                                    <div class="quantity">${record.quantity.toLocaleString()}</div>
                                </td>
                                <td class="unit-cell">${record.unit}</td>
                                <td>
                                    <span class="quality-badge quality-${record.quality.toLowerCase().replace(' ', '-')}">${record.quality}</span>
                                </td>
                                <td class="text-center">
                                    <div class="action-buttons">
                                        <button class="btn-icon danger delete-production-btn" data-record-id="${record.id}" title="Delete record">
                                            <i class="icon">🗑️</i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        // Add production record button
        this.container.querySelector('#add-production-btn')?.addEventListener('click', () => {
            this.showAddProductionModal();
        });

        // Add first record button (empty state)
        this.container.querySelector('#add-first-production-btn')?.addEventListener('click', () => {
            this.showAddProductionModal();
        });

        // Export button
        this.container.querySelector('#export-production-btn')?.addEventListener('click', () => {
            this.exportProductionData();
        });

        // Quick action buttons
        this.container.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    setupTableEventListeners() {
        // Delete production record buttons
        this.container?.querySelectorAll('.delete-production-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-record-id');
                this.confirmDeleteRecord(recordId);
            });
        });
    }

    showAddProductionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Production Record</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="add-production-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="production-product">Product *</label>
                            <select id="production-product" name="product" required>
                                <option value="">Select product...</option>
                                <option value="Eggs">Eggs</option>
                                <option value="Broiler Chickens">Broiler Chickens</option>
                                <option value="Layers">Layers</option>
                                <option value="Tomatoes">Tomatoes</option>
                                <option value="Potatoes">Potatoes</option>
                                <option value="Carrots">Carrots</option>
                                <option value="Lettuce">Lettuce</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="production-type">Production Type</label>
                            <select id="production-type" name="productionType">
                                <option value="regular">Regular</option>
                                <option value="harvest">Harvest</option>
                                <option value="processing">Processing</option>
                                <option value="packaging">Packaging</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="production-quantity">Quantity *</label>
                            <input type="number" id="production-quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="production-unit">Unit *</label>
                            <select id="production-unit" name="unit" required>
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="lb">Pounds</option>
                                <option value="dozen">Dozen</option>
                                <option value="crate">Crate</option>
                                <option value="box">Box</option>
                                <option value="birds">Birds</option>
                                <option value="liters">Liters</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="production-batch">Batch ID *</label>
                            <input type="text" id="production-batch" name="batch" required>
                        </div>
                        <div class="form-group">
                            <label for="production-quality">Quality Grade</label>
                            <select id="production-quality" name="quality">
                                <option value="Grade A">Grade A</option>
                                <option value="Grade B">Grade B</option>
                                <option value="Grade C">Grade C</option>
                                <option value="Organic">Organic</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label for="production-notes">Notes</label>
                            <textarea id="production-notes" name="notes" rows="3" placeholder="Additional production notes..."></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Add Record</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal event listeners
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        modal.querySelector('#add-production-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const recordData = Object.fromEntries(formData);
            
            await this.addProductionRecord(recordData);
            closeModal();
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'eggs':
                this.showQuickEggProductionModal();
                break;
            case 'broilers':
                this.showQuickBroilerProductionModal();
                break;
            case 'crops':
                this.showQuickCropProductionModal();
                break;
            case 'daily':
                this.generateDailySummary();
                break;
        }
    }

    showQuickEggProductionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Quick Egg Production</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="egg-production-form" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="egg-quantity">Eggs Collected *</label>
                            <input type="number" id="egg-quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="egg-batch">Batch/House *</label>
                            <input type="text" id="egg-batch" name="batch" required>
                        </div>
                        <div class="form-group">
                            <label for="egg-quality">Quality</label>
                            <select id="egg-quality" name="quality">
                                <option value="Grade A">Grade A</option>
                                <option value="Grade B">Grade B</option>
                                <option value="Grade C">Grade C</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Record Eggs</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        modal.querySelector('#egg-production-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const recordData = {
                product: 'Eggs',
                quantity: formData.get('quantity'),
                unit: 'pieces',
                batch: formData.get('batch'),
                quality: formData.get('quality'),
                productionType: 'regular',
                notes: 'Egg collection'
            };
            
            await this.addProductionRecord(recordData);
            closeModal();
        });
    }

    showQuickBroilerProductionModal() {
        // Similar implementation for broiler production
        this.showToast('Broiler production feature coming soon!', 'info');
    }

    showQuickCropProductionModal() {
        // Similar implementation for crop production
        this.showToast('Crop production feature coming soon!', 'info');
    }

    generateDailySummary() {
        const stats = this.calculateStats();
        const today = new Date().toLocaleDateString();
        
        const summary = `
📊 Daily Production Summary - ${today}

🏭 Total Today: ${stats.today} units
📦 Products: ${stats.uniqueProducts}
⭐ Top Product: ${stats.topProduct}
📝 Records Today: ${stats.todayRecords}

Keep up the great work! 🚜
        `.trim();

        alert(summary);
    }

    confirmDeleteRecord(recordId) {
        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(recordId);
        }
    }

    async exportProductionData() {
        if (this.productionData.length === 0) {
            this.showToast('No production data to export', 'warning');
            return;
        }

        const csvContent = this.convertToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Production data exported!', 'success');
    }

    convertToCSV() {
        const headers = ['Date', 'Product', 'Production Type', 'Batch', 'Quantity', 'Unit', 'Quality', 'Notes'];
        const rows = this.productionData.map(record => [
            record.date,
            record.product,
            record.productionType,
            record.batch,
            record.quantity,
            record.unit,
            record.quality,
            record.notes
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    async cleanup() {
        this.initialized = false;
        this.container = null;
    }
}

// Register module
if (window.FarmModules) {
    window.FarmModules.registerModule('production', new ProductionModule());
    console.log('✅ Production module registered');
}
