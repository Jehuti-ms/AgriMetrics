// modules/production.js - COMPLETELY REWRITTEN WITH PROPER STYLEMANAGER INTEGRATION
console.log('Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    element: null,
    productionData: [],

    initialize() {
        console.log('🚜 Initializing Production Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found for production module');
            return false;
        }

        // ✅ PROPER StyleManager registration
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
        // Load from localStorage or use demo data
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
            },
            { 
                id: 3, 
                date: '2024-03-13', 
                product: 'broilers', 
                quantity: 50, 
                unit: 'birds', 
                quality: 'excellent', 
                batch: 'BATCH-002',
                notes: 'Weekly harvest' 
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

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="glass-card quick-action-card" id="record-production-btn">
                        <div class="quick-action-icon">📝</div>
                        <div class="quick-action-content">
                            <h3>Record Production</h3>
                            <p>Log daily production data</p>
                        </div>
                    </button>
                    <button class="glass-card quick-action-card" id="view-trends-btn">
                        <div class="quick-action-icon">📈</div>
                        <div class="quick-action-content">
                            <h3>View Trends</h3>
                            <p>Analyze production patterns</p>
                        </div>
                    </button>
                    <button class="glass-card quick-action-card" id="quality-report-btn">
                        <div class="quick-action-icon">⭐</div>
                        <div class="quick-action-content">
                            <h3>Quality Report</h3>
                            <p>Product quality analysis</p>
                        </div>
                    </button>
                </div>

                <!-- Production Form -->
                <div class="glass-card form-card">
                    <div class="card-header">
                        <h2>📝 Record Production</h2>
                    </div>
                    <div class="card-body">
                        <form id="production-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="product-type" class="form-label">Product Type *</label>
                                    <select id="product-type" class="form-select" required>
                                        <option value="">Select Product</option>
                                        <option value="eggs">Eggs</option>
                                        <option value="broilers">Broilers</option>
                                        <option value="layers">Layers</option>
                                        <option value="pork">Pork</option>
                                        <option value="beef">Beef</option>
                                        <option value="milk">Milk</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="production-date" class="form-label">Date *</label>
                                    <input type="date" id="production-date" class="form-input" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="production-quantity" class="form-label">Quantity *</label>
                                    <input type="number" id="production-quantity" class="form-input" min="1" required placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label for="production-unit" class="form-label">Unit *</label>
                                    <select id="production-unit" class="form-select" required>
                                        <option value="pieces">Pieces</option>
                                        <option value="birds">Birds</option>
                                        <option value="kg">Kilograms</option>
                                        <option value="lbs">Pounds</option>
                                        <option value="liters">Liters</option>
                                        <option value="crates">Crates</option>
                                        <option value="cartons">Cartons</option>
                                        <option value="dozen">Dozen</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="production-quality" class="form-label">Quality *</label>
                                    <select id="production-quality" class="form-select" required>
                                        <option value="excellent">Excellent</option>
                                        <option value="grade-a">Grade A</option>
                                        <option value="grade-b">Grade B</option>
                                        <option value="standard">Standard</option>
                                        <option value="rejects">Rejects</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="production-batch" class="form-label">Batch ID</label>
                                    <input type="text" id="production-batch" class="form-input" placeholder="Optional batch number">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="production-notes" class="form-label">Notes</label>
                                <textarea id="production-notes" class="form-textarea" rows="3" placeholder="Production details, observations, special conditions..."></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <span class="btn-icon">💾</span>
                                    Save Production Record
                                </button>
                                <button type="reset" class="btn btn-text">Clear Form</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Production -->
                <div class="glass-card table-card">
                    <div class="card-header">
                        <h2>📊 Recent Production</h2>
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
            </div>
        `;

        this.updateStats();
        this.renderProductionTable();
        this.setupEventListeners();
    },

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's eggs
        const todayEggs = this.productionData
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        // Calculate weekly birds
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];
        
        const weekBirds = this.productionData
            .filter(record => record.date >= last7DaysStr && 
                           (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        // Calculate average quality
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

        // Update DOM elements
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
                            <span class="empty-icon">🚜</span>
                            <h4>No production records</h4>
                            <p>${filter === 'all' ? 'Start recording your production' : `No ${filter} production records`}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show most recent first
        const sortedProduction = filteredProduction.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedProduction.map(record => {
            const qualityClass = `quality-badge quality-${record.quality}`;
            
            return `
                <tr>
                    <td>${this.formatDate(record.date)}</td>
                    <td>
                        <div class="product-cell">
                            <span class="product-icon">${this.getProductIcon(record.product)}</span>
                            <span class="product-name">${this.formatProductName(record.product)}</span>
                        </div>
                    </td>
                    <td><strong>${record.quantity.toLocaleString()}</strong> ${record.unit}</td>
                    <td><span class="${qualityClass}">${this.formatQuality(record.quality)}</span></td>
                    <td>${record.batch || '-'}</td>
                    <td class="notes-cell">${record.notes || '-'}</td>
                    <td class="actions-cell">
                        <button class="btn-icon edit-production" data-id="${record.id}" title="Edit">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="btn-icon delete-production" data-id="${record.id}" title="Delete">
                            <span class="icon">🗑️</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners() {
        // Production form
        const productionForm = document.getElementById('production-form');
        if (productionForm) {
            productionForm.addEventListener('submit', (e) => this.handleProductionSubmit(e));
        }

        // Set default date to today
        const dateInput = document.getElementById('production-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Quick action buttons
        document.getElementById('record-production-btn')?.addEventListener('click', () => {
            document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('view-trends-btn')?.addEventListener('click', () => {
            this.generateProductionReport('trends');
        });

        document.getElementById('quality-report-btn')?.addEventListener('click', () => {
            this.generateProductionReport('quality');
        });

        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            this.generateProductionReport('overview');
        });

        // Filter
        document.getElementById('production-filter')?.addEventListener('change', (e) => {
            this.renderProductionTable(e.target.value);
        });

        // Export
        document.getElementById('export-production')?.addEventListener('click', () => {
            this.exportProduction();
        });

        // Production actions (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-production')) {
                const recordId = e.target.closest('.edit-production').dataset.id;
                this.editProduction(recordId);
            }
            if (e.target.closest('.delete-production')) {
                const recordId = e.target.closest('.delete-production').dataset.id;
                this.deleteProduction(recordId);
            }
        });
    },

    handleProductionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('production-date').value,
            product: document.getElementById('product-type').value,
            quantity: parseInt(document.getElementById('production-quantity').value),
            unit: document.getElementById('production-unit').value,
            quality: document.getElementById('production-quality').value,
            batch: document.getElementById('production-batch').value || '',
            notes: document.getElementById('production-notes').value || ''
        };

        // Validate required fields
        if (!formData.date || !formData.product || !formData.quantity || !formData.unit || !formData.quality) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (formData.quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        this.addProduction(formData);
        
        // Reset form
        document.getElementById('production-form').reset();
        document.getElementById('production-date').value = new Date().toISOString().split('T')[0];
        
        this.showNotification('Production record saved successfully!', 'success');
    },

    addProduction(productionData) {
        this.productionData.unshift(productionData);
        this.saveData();
        this.updateStats();
        this.renderProductionTable();
        
        console.log('✅ Production record added:', productionData);
    },

    editProduction(recordId) {
        const record = this.productionData.find(r => r.id == recordId);
        
        if (!record) {
            console.error('❌ Production record not found:', recordId);
            return;
        }

        // Populate form for editing
        document.getElementById('production-date').value = record.date;
        document.getElementById('product-type').value = record.product;
        document.getElementById('production-quantity').value = record.quantity;
        document.getElementById('production-unit').value = record.unit;
        document.getElementById('production-quality').value = record.quality;
        document.getElementById('production-batch').value = record.batch || '';
        document.getElementById('production-notes').value = record.notes || '';

        // Scroll to form
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    },

    deleteProduction(recordId) {
        if (confirm('Are you sure you want to delete this production record?')) {
            this.productionData = this.productionData.filter(r => r.id != recordId);
            this.saveData();
            this.updateStats();
            this.renderProductionTable();
            this.showNotification('Production record deleted successfully', 'success');
        }
    },

    generateProductionReport(type = 'overview') {
        const stats = this.calculateDetailedStats();
        let reportTitle = 'Production Overview';
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
                reportTitle = 'Production Overview Report';
                reportContent = this.generateOverviewReport(stats);
        }

        this.showProductionReportModal(reportTitle, reportContent);
    },

    generateOverviewReport(stats) {
        return `
            <div class="report-section">
                <h4>📊 Production Overview</h4>
                <div class="stats-grid compact">
                    <div class="stat-item">
                        <div class="stat-label">Total Records</div>
                        <div class="stat-number">${stats.totalRecords}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Today's Eggs</div>
                        <div class="stat-number">${stats.todayEggs}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Weekly Birds</div>
                        <div class="stat-number">${stats.weekBirds}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Avg Quality</div>
                        <div class="stat-number">${stats.avgQuality}/5.0</div>
                    </div>
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
            avgQuality
        };
    },

    generateTrendsReport(stats) {
        return `<div class="report-section"><p>Trends report coming soon...</p></div>`;
    },

    generateQualityReport(stats) {
        return `<div class="report-section"><p>Quality report coming soon...</p></div>`;
    },

    showProductionReportModal(title, content) {
        // Simple alert for now - can be enhanced with proper modal
        alert(`${title}\n\n${content.replace(/<[^>]*>/g, '')}`);
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
            return new Date(dateString).toLocaleDateString();
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
