// modules/production.js - PROPER MODAL LAYOUT
console.log('Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    element: null,
    productionData: [],
    currentRecordId: null,
    recordToDelete: null,

    initialize() {
        console.log('🚜 Initializing Production Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found for production module');
            return false;
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
            console.log('🎨 Production module registered with StyleManager');
        } else {
            console.warn('⚠️ StyleManager not available');
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Production Records initialized');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Production Records updating for theme: ${theme}`);
    },

    loadData() {
        const savedData = localStorage.getItem('farm-production-data');
        if (savedData) {
            this.productionData = JSON.parse(savedData);
        } else {
            this.productionData = this.getDemoData();
            this.saveData();
        }
        console.log('📊 Loaded production data:', this.productionData.length, 'records');
    },

    saveData() {
        localStorage.setItem('farm-production-data', JSON.stringify(this.productionData));
    },

    getDemoData() {
        return [
            { 
                id: 1, 
                date: new Date().toISOString().split('T')[0], 
                product: 'eggs', 
                quantity: 450, 
                unit: 'pieces', 
                quality: 'grade-a', 
                batch: 'BATCH-001',
                notes: 'Morning collection' 
            },
            { 
                id: 2, 
                date: '2024-03-14', 
                product: 'eggs', 
                quantity: 420, 
                unit: 'pieces', 
                quality: 'grade-a', 
                batch: 'BATCH-001',
                notes: 'Regular production' 
            }
        ];
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container" data-module="production">
                <!-- Module Header -->
                <div class="module-header">
                    <div class="module-header-content">
                        <h1 class="module-title">Production Records</h1>
                        <p class="module-subtitle">Track your farm production and yields</p>
                    </div>
                    <div class="module-header-actions">
                        <button class="btn btn-primary" id="generate-report-btn">
                            <span class="btn-icon">📊</span>
                            Generate Report
                        </button>
                        <button class="btn btn-primary" id="new-production-btn">
                            <span class="btn-icon">➕</span>
                            New Record
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="glass-card stat-card">
                        <div class="stat-icon">🥚</div>
                        <div class="stat-content">
                            <div class="stat-value" id="today-eggs">0</div>
                            <div class="stat-label">Eggs Today</div>
                            <div class="stat-subtitle">pieces</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">🐔</div>
                        <div class="stat-content">
                            <div class="stat-value" id="week-birds">0</div>
                            <div class="stat-label">Birds This Week</div>
                            <div class="stat-subtitle">birds</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-records">0</div>
                            <div class="stat-label">Total Records</div>
                            <div class="stat-subtitle">entries</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <div class="stat-value" id="avg-quality">0.0</div>
                            <div class="stat-label">Avg Quality</div>
                            <div class="stat-subtitle">/5.0</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Production Table -->
                <div class="glass-card table-card">
                    <div class="card-header">
                        <h2>📊 Recent Production Records</h2>
                        <div class="card-actions">
                            <select id="production-filter" class="form-select">
                                <option value="all">All Products</option>
                                <option value="eggs">Eggs</option>
                                <option value="broilers">Broilers</option>
                                <option value="layers">Layers</option>
                                <option value="milk">Milk</option>
                            </select>
                            <button class="btn btn-text" id="export-production">
                                <span class="btn-icon">📤</span>
                                Export
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Quality</th>
                                        <th>Batch</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="production-body">
                                    <!-- Production records will be rendered here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Production Record Modal -->
                <div id="production-modal" class="modal hidden">
                    <div class="modal-backdrop"></div>
                    <div class="modal-container">
                        <div class="modal-window">
                            <div class="modal-header">
                                <div class="modal-title-wrapper">
                                    <h3 id="production-modal-title" class="modal-title">New Production Record</h3>
                                    <p class="modal-subtitle">Add details about your farm production</p>
                                </div>
                                <button class="modal-close-btn" aria-label="Close modal">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="modal-body">
                                <form id="production-modal-form" class="modal-form">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal-product-type" class="form-label">
                                                <span class="label-text">Product Type</span>
                                                <span class="required">*</span>
                                            </label>
                                            <select id="modal-product-type" class="form-select" required>
                                                <option value="">Select Product</option>
                                                <option value="eggs">🥚 Eggs</option>
                                                <option value="broilers">🐔 Broilers</option>
                                                <option value="layers">🐓 Layers</option>
                                                <option value="pork">🐖 Pork</option>
                                                <option value="beef">🐄 Beef</option>
                                                <option value="milk">🥛 Milk</option>
                                                <option value="other">📦 Other</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="modal-production-date" class="form-label">
                                                <span class="label-text">Date</span>
                                                <span class="required">*</span>
                                            </label>
                                            <input type="date" id="modal-production-date" class="form-input" required>
                                        </div>
                                    </div>

                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal-production-quantity" class="form-label">
                                                <span class="label-text">Quantity</span>
                                                <span class="required">*</span>
                                            </label>
                                            <div class="input-with-unit">
                                                <input type="number" id="modal-production-quantity" class="form-input" min="1" required placeholder="0">
                                                <span class="input-unit" id="quantity-unit">pieces</span>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="modal-production-unit" class="form-label">
                                                <span class="label-text">Unit</span>
                                                <span class="required">*</span>
                                            </label>
                                            <select id="modal-production-unit" class="form-select" required>
                                                <option value="pieces">Pieces</option>
                                                <option value="birds">Birds</option>
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="lbs">Pounds (lbs)</option>
                                                <option value="liters">Liters (L)</option>
                                                <option value="crates">Crates</option>
                                                <option value="cartons">Cartons</option>
                                                <option value="dozen">Dozen</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal-production-quality" class="form-label">
                                                <span class="label-text">Quality</span>
                                                <span class="required">*</span>
                                            </label>
                                            <select id="modal-production-quality" class="form-select quality-select" required>
                                                <option value="excellent">⭐ Excellent</option>
                                                <option value="grade-a">🟢 Grade A</option>
                                                <option value="grade-b">🟡 Grade B</option>
                                                <option value="standard">🔵 Standard</option>
                                                <option value="rejects">🔴 Rejects</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="modal-production-batch" class="form-label">
                                                <span class="label-text">Batch ID</span>
                                                <span class="optional">(optional)</span>
                                            </label>
                                            <input type="text" id="modal-production-batch" class="form-input" placeholder="BATCH-001">
                                        </div>
                                    </div>

                                    <div class="form-group full-width">
                                        <label for="modal-production-notes" class="form-label">
                                            <span class="label-text">Notes</span>
                                            <span class="optional">(optional)</span>
                                        </label>
                                        <textarea id="modal-production-notes" class="form-textarea" rows="4" placeholder="Add production details, observations, special conditions, or any other relevant information..."></textarea>
                                    </div>
                                </form>
                            </div>
                            
                            <div class="modal-footer">
                                <div class="footer-actions">
                                    <button type="button" class="btn btn-text modal-close">Cancel</button>
                                    <button type="submit" form="production-modal-form" class="btn btn-primary">
                                        <span class="btn-icon">💾</span>
                                        Save Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Production Report Modal -->
                <div id="production-report-modal" class="modal hidden">
                    <div class="modal-backdrop"></div>
                    <div class="modal-container">
                        <div class="modal-window large-modal">
                            <div class="modal-header">
                                <div class="modal-title-wrapper">
                                    <h3 id="production-report-title" class="modal-title">Production Report</h3>
                                    <p class="modal-subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                                </div>
                                <button class="modal-close-btn" aria-label="Close modal">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="modal-body">
                                <div id="production-report-content" class="report-content">
                                    <!-- Report content will be inserted here -->
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <div class="footer-actions">
                                    <button class="btn btn-text" id="print-production-report">
                                        <span class="btn-icon">🖨️</span>
                                        Print Report
                                    </button>
                                    <button class="btn btn-primary modal-close">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Delete Confirmation Modal -->
                <div id="production-delete-modal" class="modal hidden">
                    <div class="modal-backdrop"></div>
                    <div class="modal-container">
                        <div class="modal-window small-modal">
                            <div class="modal-header">
                                <div class="modal-title-wrapper">
                                    <h3 class="modal-title">Delete Record</h3>
                                    <p class="modal-subtitle">This action cannot be undone</p>
                                </div>
                                <button class="modal-close-btn" aria-label="Close modal">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="modal-body">
                                <div class="delete-confirmation">
                                    <div class="delete-icon">🗑️</div>
                                    <div class="delete-content">
                                        <h4>Are you sure?</h4>
                                        <p>You are about to delete this production record. This will permanently remove it from your records.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <div class="footer-actions">
                                    <button class="btn btn-text modal-close">Cancel</button>
                                    <button class="btn btn-danger" id="confirm-delete-production">
                                        <span class="btn-icon">🗑️</span>
                                        Delete Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateStats();
        this.renderProductionTable();
        this.setupEventListeners();
    },

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayEggs = this.productionData
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];
        
        const weekBirds = this.productionData
            .filter(record => record.date >= last7DaysStr && 
                           (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        const qualityScores = {
            'excellent': 5,
            'grade-a': 4,
            'grade-b': 3,
            'standard': 2,
            'rejects': 1
        };

        const avgQuality = this.productionData.length > 0 
            ? (this.productionData.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / this.productionData.length).toFixed(1)
            : '0.0';

        this.updateElement('today-eggs', todayEggs.toLocaleString());
        this.updateElement('week-birds', weekBirds.toLocaleString());
        this.updateElement('total-records', this.productionData.length.toLocaleString());
        this.updateElement('avg-quality', avgQuality);
    },

    renderProductionTable(filter = 'all') {
        const tbody = document.getElementById('production-body');
        if (!tbody) return;
        
        let filteredProduction = this.productionData;
        if (filter !== 'all') {
            filteredProduction = this.productionData.filter(record => record.product === filter);
        }

        if (filteredProduction.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-content">
                            <div class="empty-icon">🚜</div>
                            <h4>No production records found</h4>
                            <p>${filter === 'all' ? 'Get started by adding your first production record' : `No ${filter} production records found`}</p>
                            <button class="btn btn-primary" id="add-first-record">
                                <span class="btn-icon">➕</span>
                                Add First Record
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            document.getElementById('add-first-record')?.addEventListener('click', () => {
                this.openProductionModal();
            });
            
            return;
        }

        const sortedProduction = filteredProduction.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedProduction.map(record => {
            const qualityClass = `quality-badge quality-${record.quality}`;
            
            return `
                <tr>
                    <td>
                        <div class="date-cell">
                            <span class="date-day">${this.formatDate(record.date)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="product-cell">
                            <span class="product-icon">${this.getProductIcon(record.product)}</span>
                            <span class="product-name">${this.formatProductName(record.product)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="quantity-cell">
                            <span class="quantity-value">${record.quantity.toLocaleString()}</span>
                            <span class="quantity-unit">${record.unit}</span>
                        </div>
                    </td>
                    <td><span class="${qualityClass}">${this.formatQuality(record.quality)}</span></td>
                    <td>${record.batch ? `<span class="batch-badge">${record.batch}</span>` : '-'}</td>
                    <td class="notes-cell">${record.notes || '-'}</td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit edit-production" data-id="${record.id}" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button class="btn-icon btn-delete delete-production" data-id="${record.id}" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners() {
        // New record button
        document.getElementById('new-production-btn')?.addEventListener('click', () => {
            this.openProductionModal();
        });

        // Unit selection updates quantity unit display
        const unitSelect = document.getElementById('modal-production-unit');
        const quantityUnit = document.getElementById('quantity-unit');
        if (unitSelect && quantityUnit) {
            unitSelect.addEventListener('change', (e) => {
                quantityUnit.textContent = e.target.value;
            });
        }

        // Set default date in modal when opened
        const dateInput = document.getElementById('modal-production-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Production form submission
        const productionForm = document.getElementById('production-modal-form');
        if (productionForm) {
            productionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductionSave();
            });
        }

        // Filter
        document.getElementById('production-filter')?.addEventListener('change', (e) => {
            this.renderProductionTable(e.target.value);
        });

        // Export
        document.getElementById('export-production')?.addEventListener('click', () => {
            this.exportProduction();
        });

        // Report generation
        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            this.generateProductionReport('overview');
        });

        // Production actions (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-production')) {
                const recordId = e.target.closest('.edit-production').dataset.id;
                this.editProduction(recordId);
            }
            if (e.target.closest('.delete-production')) {
                const recordId = e.target.closest('.delete-production').dataset.id;
                this.openDeleteModal(recordId);
            }
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            // Close modal when clicking close button
            if (e.target.closest('.modal-close-btn') || e.target.closest('.modal-close')) {
                this.closeAllModals();
            }
            
            // Close modal when clicking backdrop
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.querySelector('.modal.hidden')) {
                this.closeAllModals();
            }
        });

        // Delete confirmation
        document.getElementById('confirm-delete-production')?.addEventListener('click', () => {
            this.confirmDeleteProduction();
        });

        // Print report
        document.getElementById('print-production-report')?.addEventListener('click', () => {
            this.printProductionReport();
        });
    },

    openProductionModal(recordId = null) {
        this.currentRecordId = recordId;
        const modal = document.getElementById('production-modal');
        const title = document.getElementById('production-modal-title');
        const form = document.getElementById('production-modal-form');

        if (recordId) {
            // Edit mode
            const record = this.productionData.find(r => r.id == recordId);
            if (record) {
                title.textContent = 'Edit Production Record';
                document.getElementById('modal-production-date').value = record.date;
                document.getElementById('modal-product-type').value = record.product;
                document.getElementById('modal-production-quantity').value = record.quantity;
                document.getElementById('modal-production-unit').value = record.unit;
                document.getElementById('modal-production-quality').value = record.quality;
                document.getElementById('modal-production-batch').value = record.batch || '';
                document.getElementById('modal-production-notes').value = record.notes || '';
                
                // Update quantity unit display
                const quantityUnit = document.getElementById('quantity-unit');
                if (quantityUnit) {
                    quantityUnit.textContent = record.unit;
                }
            }
        } else {
            // Add mode
            title.textContent = 'New Production Record';
            if (form) form.reset();
            document.getElementById('modal-production-date').value = new Date().toISOString().split('T')[0];
            
            // Reset quantity unit display
            const quantityUnit = document.getElementById('quantity-unit');
            if (quantityUnit) {
                quantityUnit.textContent = 'pieces';
            }
        }

        modal.classList.remove('hidden');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('modal-product-type')?.focus();
        }, 100);
    },

    handleProductionSave() {
        const formData = {
            id: this.currentRecordId || Date.now(),
            date: document.getElementById('modal-production-date').value,
            product: document.getElementById('modal-product-type').value,
            quantity: parseInt(document.getElementById('modal-production-quantity').value),
            unit: document.getElementById('modal-production-unit').value,
            quality: document.getElementById('modal-production-quality').value,
            batch: document.getElementById('modal-production-batch').value.trim() || '',
            notes: document.getElementById('modal-production-notes').value.trim() || ''
        };

        // Validation
        if (!formData.date || !formData.product || !formData.quantity || !formData.unit || !formData.quality) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (formData.quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        if (this.currentRecordId) {
            // Update existing record
            const index = this.productionData.findIndex(r => r.id == this.currentRecordId);
            if (index !== -1) {
                this.productionData[index] = formData;
                this.showNotification('Production record updated successfully!', 'success');
            }
        } else {
            // Add new record
            this.productionData.unshift(formData);
            this.showNotification('Production record saved successfully!', 'success');
        }

        this.saveData();
        this.updateStats();
        this.renderProductionTable();
        this.closeAllModals();
    },

    editProduction(recordId) {
        this.openProductionModal(recordId);
    },

    openDeleteModal(recordId) {
        this.recordToDelete = recordId;
        document.getElementById('production-delete-modal').classList.remove('hidden');
    },

    confirmDeleteProduction() {
        if (this.recordToDelete) {
            this.productionData = this.productionData.filter(r => r.id != this.recordToDelete);
            this.saveData();
            this.updateStats();
            this.renderProductionTable();
            this.showNotification('Production record deleted successfully', 'success');
            this.recordToDelete = null;
            this.closeAllModals();
        }
    },

    generateProductionReport(type = 'overview') {
        const stats = this.calculateDetailedStats();
        let reportTitle = 'Production Overview Report';
        let reportContent = '';

        switch (type) {
            case 'trends':
                reportTitle = 'Production Trends Analysis';
                reportContent = this.generateTrendsReport(stats);
                break;
            case 'quality':
                reportTitle = 'Quality Analysis Report';
                reportContent = this.generateQualityReport(stats);
                break;
            default:
                reportContent = this.generateOverviewReport(stats);
        }

        // Update the report modal title
        document.getElementById('production-report-title').textContent = reportTitle;
        document.querySelector('#production-report-modal .modal-subtitle').textContent = `Generated on ${new Date().toLocaleDateString()}`;
        
        // Insert report content
        document.getElementById('production-report-content').innerHTML = reportContent;
        
        // Open the modal
        this.openReportModal();
    },

    generateOverviewReport(stats) {
        return `
            <div class="report-overview">
                <div class="report-header">
                    <h4>📊 Production Overview</h4>
                </div>
                <div class="report-stats">
                    <div class="stat-card-report">
                        <div class="stat-icon-report">📝</div>
                        <div class="stat-content-report">
                            <div class="stat-value-report">${stats.totalRecords}</div>
                            <div class="stat-label-report">Total Records</div>
                        </div>
                    </div>
                    <div class="stat-card-report">
                        <div class="stat-icon-report">🥚</div>
                        <div class="stat-content-report">
                            <div class="stat-value-report">${stats.todayEggs}</div>
                            <div class="stat-label-report">Today's Eggs</div>
                        </div>
                    </div>
                    <div class="stat-card-report">
                        <div class="stat-icon-report">🐔</div>
                        <div class="stat-content-report">
                            <div class="stat-value-report">${stats.weekBirds}</div>
                            <div class="stat-label-report">Weekly Birds</div>
                        </div>
                    </div>
                    <div class="stat-card-report">
                        <div class="stat-icon-report">⭐</div>
                        <div class="stat-content-report">
                            <div class="stat-value-report">${stats.avgQuality}/5.0</div>
                            <div class="stat-label-report">Avg Quality</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h5>📈 Product Distribution</h5>
                <div class="distribution-list">
                    ${Object.entries(stats.productDistribution).map(([product, quantity]) => `
                        <div class="distribution-item">
                            <div class="product-info">
                                <span class="product-icon">${this.getProductIcon(product)}</span>
                                <span class="product-name">${this.formatProductName(product)}</span>
                            </div>
                            <div class="product-quantity">${quantity} units</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateTrendsReport(stats) {
        const weeklyTrends = this.calculateWeeklyTrends();
        
        return `
            <div class="report-section">
                <h5>📈 Weekly Production Trends</h5>
                <div class="trends-grid">
                    ${weeklyTrends.map(week => `
                        <div class="trend-card">
                            <div class="trend-header">${week.week}</div>
                            <div class="trend-body">
                                <div class="trend-item">
                                    <span class="trend-icon">🥚</span>
                                    <span class="trend-value">${week.eggs}</span>
                                    <span class="trend-label">Eggs</span>
                                </div>
                                <div class="trend-item">
                                    <span class="trend-icon">🐔</span>
                                    <span class="trend-value">${week.birds}</span>
                                    <span class="trend-label">Birds</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateQualityReport(stats) {
        return `
            <div class="report-section">
                <h5>⭐ Quality Distribution</h5>
                <div class="quality-grid">
                    ${Object.entries(stats.qualityDistribution).map(([quality, count]) => `
                        <div class="quality-card quality-${quality}">
                            <div class="quality-icon">${this.getQualityIcon(quality)}</div>
                            <div class="quality-content">
                                <div class="quality-name">${this.formatQuality(quality)}</div>
                                <div class="quality-count">${count} records</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    calculateDetailedStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayEggs = this.productionData
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];
        
        const weekBirds = this.productionData
            .filter(record => record.date >= last7DaysStr && 
                           (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        const productDistribution = {};
        this.productionData.forEach(record => {
            productDistribution[record.product] = (productDistribution[record.product] || 0) + record.quantity;
        });

        const qualityDistribution = {};
        this.productionData.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

        const qualityScores = {
            'excellent': 5, 'grade-a': 4, 'grade-b': 3, 'standard': 2, 'rejects': 1
        };
        const avgQuality = this.productionData.length > 0 
            ? (this.productionData.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / this.productionData.length).toFixed(1)
            : '0.0';

        return {
            totalRecords: this.productionData.length,
            todayEggs,
            weekBirds,
            avgQuality,
            productDistribution,
            qualityDistribution
        };
    },

    calculateWeeklyTrends() {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekStr = this.getWeekLabel(startDate);
            const weekProduction = this.productionData.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startDate && recordDate <= endDate;
            });

            const eggs = weekProduction
                .filter(record => record.product === 'eggs')
                .reduce((sum, record) => sum + record.quantity, 0);

            const birds = weekProduction
                .filter(record => record.product === 'broilers' || record.product === 'layers')
                .reduce((sum, record) => sum + record.quantity, 0);

            weeks.push({ week: weekStr, eggs, birds });
        }
        return weeks;
    },

    getWeekLabel(date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
    },

    openReportModal() {
        document.getElementById('production-report-modal').classList.remove('hidden');
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.currentRecordId = null;
        this.recordToDelete = null;
    },

    printProductionReport() {
        const reportContent = document.getElementById('production-report-content').innerHTML;
        const reportTitle = document.getElementById('production-report-title').textContent;
        const reportSubtitle = document.querySelector('#production-report-modal .modal-subtitle').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #333; }
                        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
                        .print-title { color: #2c3e50; margin-bottom: 5px; }
                        .print-subtitle { color: #7f8c8d; margin-bottom: 20px; }
                        .print-date { color: #95a5a6; font-size: 14px; }
                        .report-section { margin: 30px 0; break-inside: avoid; }
                        h5 { color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px; }
                        .report-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                        .stat-card-report { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; text-align: center; }
                        .stat-value-report { font-size: 24px; font-weight: bold; color: #2c3e50; }
                        .stat-label-report { color: #7f8c8d; font-size: 14px; margin-top: 5px; }
                        .distribution-list { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
                        .distribution-item { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #f5f5f5; }
                        .distribution-item:last-child { border-bottom: none; }
                        .product-info { display: flex; align-items: center; gap: 10px; }
                        .product-quantity { font-weight: bold; color: #2c3e50; }
                        .trends-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
                        .trend-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; }
                        .trend-header { font-weight: bold; color: #34495e; margin-bottom: 10px; }
                        .trend-item { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
                        @media print {
                            body { margin: 20px; }
                            .print-header { margin-bottom: 20px; }
                            .report-stats { grid-template-columns: repeat(2, 1fr); }
                            .trends-grid { grid-template-columns: repeat(1, 1fr); }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1 class="print-title">${reportTitle}</h1>
                        <div class="print-subtitle">Farm Production Report</div>
                        <div class="print-date">${reportSubtitle}</div>
                    </div>
                    ${reportContent}
                    <div style="margin-top: 40px; text-align: center; color: #95a5a6; font-size: 12px;">
                        Report generated by Farm Management System
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    },

    exportProduction() {
        const csv = this.convertToCSV(this.productionData);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `production-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Production data exported successfully!', 'success');
    },

    convertToCSV(production) {
        const headers = ['Date', 'Product', 'Quantity', 'Unit', 'Quality', 'Batch', 'Notes'];
        const rows = production.map(record => [
            record.date,
            this.formatProductName(record.product),
            record.quantity,
            record.unit,
            this.formatQuality(record.quality),
            record.batch,
            record.notes
        ]);
        
        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    // Utility methods
    getProductIcon(product) {
        const icons = {
            'eggs': '🥚', 'broilers': '🐔', 'layers': '🐓', 'pork': '🐖',
            'beef': '🐄', 'milk': '🥛', 'other': '📦'
        };
        return icons[product] || '📦';
    },

    getQualityIcon(quality) {
        const icons = {
            'excellent': '⭐',
            'grade-a': '🟢',
            'grade-b': '🟡',
            'standard': '🔵',
            'rejects': '🔴'
        };
        return icons[quality] || '⚪';
    },

    formatProductName(product) {
        const names = {
            'eggs': 'Eggs', 'broilers': 'Broilers', 'layers': 'Layers',
            'pork': 'Pork', 'beef': 'Beef', 'milk': 'Milk', 'other': 'Other'
        };
        return names[product] || product;
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent', 'grade-a': 'Grade A', 'grade-b': 'Grade B',
            'standard': 'Standard', 'rejects': 'Rejects'
        };
        return qualities[quality] || quality;
    },

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

// Register with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('production', ProductionModule);
    console.log('✅ Production Records module registered');
} else {
    console.error('❌ FarmModules framework not found');
}
