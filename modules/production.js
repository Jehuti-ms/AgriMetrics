// modules/production.js - UPDATED WITH MODAL MANAGER
console.log('Loading production module...');

const ProductionModule = {
    name: 'Production Records',
    icon: '🚜',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Production Records</h1>
                <p>Track your farm production and yields</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="generate-report-btn">
                        📊 Generate Report
                    </button>
                </div>
            </div>

            <!-- Production Stats -->
            <div class="production-stats">
                <div class="stat-card">
                    <div class="stat-icon">🥚</div>
                    <div class="stat-content">
                        <h3>Eggs Today</h3>
                        <div class="stat-value" id="today-eggs">0</div>
                        <div class="stat-period">pieces</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🐔</div>
                    <div class="stat-content">
                        <h3>Birds This Week</h3>
                        <div class="stat-value" id="week-birds">0</div>
                        <div class="stat-period">birds</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>Total Records</h3>
                        <div class="stat-value" id="total-records">0</div>
                        <div class="stat-period">entries</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <h3>Avg Quality</h3>
                        <div class="stat-value" id="avg-quality">0.0</div>
                        <div class="stat-period">/5.0</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-grid">
                <button class="quick-action-card" id="record-production-btn">
                    <div class="quick-action-icon">📝</div>
                    <div class="quick-action-content">
                        <h4>Record Production</h4>
                        <p>Log daily production data</p>
                    </div>
                </button>
                <button class="quick-action-card" id="view-trends-btn">
                    <div class="quick-action-icon">📈</div>
                    <div class="quick-action-content">
                        <h4>View Trends</h4>
                        <p>Analyze production patterns</p>
                    </div>
                </button>
                <button class="quick-action-card" id="quality-report-btn">
                    <div class="quick-action-icon">⭐</div>
                    <div class="quick-action-content">
                        <h4>Quality Report</h4>
                        <p>Product quality analysis</p>
                    </div>
                </button>
            </div>

            <!-- Production Form -->
            <div class="production-form card">
                <h3>Record Production</h3>
                <form id="production-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-type">Product Type *</label>
                            <select id="product-type" required>
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
                            <label for="production-date">Date *</label>
                            <input type="date" id="production-date" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="production-quantity">Quantity *</label>
                            <input type="number" id="production-quantity" min="1" required placeholder="0">
                        </div>
                        <div class="form-group">
                            <label for="production-unit">Unit *</label>
                            <select id="production-unit" required>
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
                            <label for="production-quality">Quality *</label>
                            <select id="production-quality" required>
                                <option value="excellent">Excellent</option>
                                <option value="grade-a">Grade A</option>
                                <option value="grade-b">Grade B</option>
                                <option value="standard">Standard</option>
                                <option value="rejects">Rejects</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="production-batch">Batch ID</label>
                            <input type="text" id="production-batch" placeholder="Optional batch number">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="production-notes">Notes</label>
                        <textarea id="production-notes" rows="3" placeholder="Production details, observations, special conditions..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Save Production Record</button>
                </form>
            </div>

            <!-- Recent Production -->
            <div class="production-records card">
                <div class="card-header">
                    <h3>Recent Production</h3>
                    <div class="filter-controls">
                        <select id="production-filter">
                            <option value="all">All Products</option>
                            <option value="eggs">Eggs</option>
                            <option value="broilers">Broilers</option>
                            <option value="layers">Layers</option>
                            <option value="milk">Milk</option>
                        </select>
                        <button class="btn btn-text" id="export-production">Export</button>
                    </div>
                </div>
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

            <!-- Production Report Modal -->
            <div id="production-report-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="production-report-title">Production Report</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="production-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-text" id="print-production-report">🖨️ Print</button>
                        <button class="btn btn-primary modal-close">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .production-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .stat-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 1.75rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            opacity: 0.9;
        }

        .stat-content h3 {
            margin: 0 0 0.75rem 0;
            font-size: 0.95rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-color);
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }

        .stat-period {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .quick-action-card {
            background: var(--card-bg);
            border: 2px dashed var(--border-color);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .quick-action-card:hover {
            border-color: var(--primary-color);
            background: var(--bg-color);
            transform: translateY(-2px);
        }

        .quick-action-icon {
            font-size: 3rem;
            opacity: 0.8;
        }

        .quick-action-content h4 {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
            font-weight: 700;
        }

        .quick-action-content p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .production-form {
            margin: 2rem 0;
        }

        .production-records {
            margin: 2rem 0;
        }

        .production-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }

        .quality-badge {
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: capitalize;
            letter-spacing: 0.5px;
        }

        .quality-excellent {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .quality-grade-a {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }

        .quality-grade-b {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }

        .quality-standard {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
        }

        .quality-rejects {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 4rem;
            opacity: 0.3;
            margin-bottom: 1.5rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 1rem 0;
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
            font-size: 1rem;
        }

        @media (max-width: 768px) {
            .production-stats {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .quick-actions-grid {
                grid-template-columns: 1fr;
            }

            .production-records .card-header {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
        }
    `,

    initialize() {
        console.log('🚜 Initializing production module...');
        this.loadData();
        this.updateStats();
        this.renderProductionTable();
        
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Production event listeners attached');
        }, 100);
    },

    loadData() {
        if (!FarmModules.appData.production) {
            FarmModules.appData.production = this.getDemoData();
        }
        console.log('📊 Loaded production data:', FarmModules.appData.production.length, 'records');
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

    updateStats() {
        const production = FarmModules.appData.production || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's eggs
        const todayEggs = production
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        // Calculate weekly birds
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];
        
        const weekBirds = production
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

        const avgQuality = production.length > 0 
            ? (production.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / production.length).toFixed(1)
            : '0.0';

        // Update DOM elements
        this.updateElement('today-eggs', todayEggs.toLocaleString());
        this.updateElement('week-birds', weekBirds.toLocaleString());
        this.updateElement('total-records', production.length.toLocaleString());
        this.updateElement('avg-quality', avgQuality);
    },

    renderProductionTable(filter = 'all') {
        const tbody = document.getElementById('production-body');
        if (!tbody) return;

        const production = FarmModules.appData.production || [];
        
        let filteredProduction = production;
        if (filter !== 'all') {
            filteredProduction = production.filter(record => record.product === filter);
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
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">${this.getProductIcon(record.product)}</span>
                            <span style="text-transform: capitalize;">${this.formatProductName(record.product)}</span>
                        </div>
                    </td>
                    <td><strong>${record.quantity}</strong> ${record.unit}</td>
                    <td><span class="${qualityClass}">${this.formatQuality(record.quality)}</span></td>
                    <td>${record.batch || '-'}</td>
                    <td>${record.notes || '-'}</td>
                    <td class="production-actions">
                        <button class="btn-icon edit-production" data-id="${record.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-production" data-id="${record.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners() {
        console.log('🔗 Attaching production event listeners...');

        // Production form
        const productionForm = document.getElementById('production-form');
        if (productionForm) {
            productionForm.addEventListener('submit', (e) => this.handleProductionSubmit(e));
            console.log('✅ Production form listener attached');
        }

        // Set default date to today
        const dateInput = document.getElementById('production-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Quick action buttons
        document.getElementById('record-production-btn')?.addEventListener('click', () => {
            document.getElementById('production-form').scrollIntoView({ behavior: 'smooth' });
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

        // Report modal buttons
        document.getElementById('print-production-report')?.addEventListener('click', () => {
            this.printProductionReport();
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

        console.log('✅ All production event listeners attached');
    },

    handleProductionSubmit(e) {
        e.preventDefault();
        console.log('💾 Saving production record...');
        
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
        if (!FarmModules.appData.production) {
            FarmModules.appData.production = [];
        }

        FarmModules.appData.production.unshift(productionData);
        
        this.updateStats();
        this.renderProductionTable();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'production_recorded',
            production: productionData
        });
        
        console.log('✅ Production record added:', productionData);
    },

    editProduction(recordId) {
        console.log('✏️ Editing production record:', recordId);
        
        const production = FarmModules.appData.production || [];
        const record = production.find(r => r.id == recordId);
        
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
        document.getElementById('production-form').scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Production form populated for editing');
    },

    deleteProduction(recordId) {
        if (confirm('Are you sure you want to delete this production record?')) {
            const production = FarmModules.appData.production || [];
            const record = production.find(r => r.id == recordId);
            
            FarmModules.appData.production = production.filter(r => r.id != recordId);
            
            this.updateStats();
            this.renderProductionTable();
            
            // Add recent activity
            if (record) {
                this.addRecentActivity({
                    type: 'production_deleted',
                    production: record
                });
            }
            
            this.showNotification('Production record deleted successfully', 'success');
            console.log('✅ Production record deleted:', recordId);
        }
    },

    generateProductionReport(type = 'overview') {
        console.log('📊 Generating production report:', type);
        
        const production = FarmModules.appData.production || [];
        const stats = this.calculateDetailedStats();

        let reportTitle = 'Production Overview';
        let reportContent = '';

        switch (type) {
            case 'trends':
                reportTitle = 'Production Trends Analysis';
                reportContent = this.generateTrendsReport(stats, production);
                break;
            case 'quality':
                reportTitle = 'Quality Analysis Report';
                reportContent = this.generateQualityReport(stats, production);
                break;
            default:
                reportTitle = 'Production Overview Report';
                reportContent = this.generateOverviewReport(stats, production);
        }

        this.showProductionReportModal(reportTitle, reportContent);
    },

    generateOverviewReport(stats, production) {
        return `
            <div class="report-section">
                <h4>📊 Production Overview</h4>
                <div class="stats-grid">
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

            <div class="report-section">
                <h4>📈 Product Distribution</h4>
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

            <div class="report-section">
                <h4>⭐ Quality Distribution</h4>
                <div class="distribution-list">
                    ${Object.entries(stats.qualityDistribution).map(([quality, count]) => `
                        <div class="distribution-item">
                            <span class="quality-name">${this.formatQuality(quality)}</span>
                            <span class="quality-count">${count} records</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateTrendsReport(stats, production) {
        // Calculate weekly trends
        const weeklyTrends = this.calculateWeeklyTrends(production);
        
        return `
            <div class="report-section">
                <h4>📈 Weekly Production Trends</h4>
                <div class="trends-grid">
                    ${weeklyTrends.map(week => `
                        <div class="trend-item">
                            <div class="trend-week">${week.week}</div>
                            <div class="trend-eggs">🥚 ${week.eggs}</div>
                            <div class="trend-birds">🐔 ${week.birds}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4>📅 Recent Activity</h4>
                <div class="activity-list">
                    ${production.slice(0, 8).map(record => `
                        <div class="activity-item">
                            <div class="activity-date">${this.formatDate(record.date)}</div>
                            <div class="activity-product">${this.getProductIcon(record.product)} ${this.formatProductName(record.product)}</div>
                            <div class="activity-quantity">${record.quantity} ${record.unit}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateQualityReport(stats, production) {
        return `
            <div class="report-section">
                <h4>⭐ Quality Overview</h4>
                <div class="quality-stats">
                    <div class="quality-item excellent">
                        <div class="quality-label">Excellent</div>
                        <div class="quality-count">${stats.qualityDistribution.excellent || 0}</div>
                    </div>
                    <div class="quality-item grade-a">
                        <div class="quality-label">Grade A</div>
                        <div class="quality-count">${stats.qualityDistribution['grade-a'] || 0}</div>
                    </div>
                    <div class="quality-item grade-b">
                        <div class="quality-label">Grade B</div>
                        <div class="quality-count">${stats.qualityDistribution['grade-b'] || 0}</div>
                    </div>
                    <div class="quality-item standard">
                        <div class="quality-label">Standard</div>
                        <div class="quality-count">${stats.qualityDistribution.standard || 0}</div>
                    </div>
                    <div class="quality-item rejects">
                        <div class="quality-label">Rejects</div>
                        <div class="quality-count">${stats.qualityDistribution.rejects || 0}</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Quality by Product</h4>
                <div class="product-quality-list">
                    ${Object.entries(stats.productQuality).map(([product, qualities]) => `
                        <div class="product-quality-item">
                            <div class="product-header">
                                <span class="product-icon">${this.getProductIcon(product)}</span>
                                <span class="product-name">${this.formatProductName(product)}</span>
                            </div>
                            <div class="quality-breakdown">
                                ${Object.entries(qualities).map(([quality, count]) => `
                                    <span class="quality-tag ${quality}">${this.formatQuality(quality)}: ${count}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    calculateDetailedStats() {
        const production = FarmModules.appData.production || [];
        const today = new Date().toISOString().split('T')[0];
        
        const todayEggs = production
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysStr = last7Days.toISOString().split('T')[0];
        
        const weekBirds = production
            .filter(record => record.date >= last7DaysStr && 
                           (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        // Product distribution
        const productDistribution = {};
        production.forEach(record => {
            productDistribution[record.product] = (productDistribution[record.product] || 0) + record.quantity;
        });

        // Quality distribution
        const qualityDistribution = {};
        production.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

        // Product quality breakdown
        const productQuality = {};
        production.forEach(record => {
            if (!productQuality[record.product]) {
                productQuality[record.product] = {};
            }
            productQuality[record.product][record.quality] = (productQuality[record.product][record.quality] || 0) + 1;
        });

        // Average quality
        const qualityScores = {
            'excellent': 5, 'grade-a': 4, 'grade-b': 3, 'standard': 2, 'rejects': 1
        };
        const avgQuality = production.length > 0 
            ? (production.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / production.length).toFixed(1)
            : '0.0';

        return {
            totalRecords: production.length,
            todayEggs,
            weekBirds,
            avgQuality,
            productDistribution,
            qualityDistribution,
            productQuality
        };
    },

    calculateWeeklyTrends(production) {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekStr = `Week ${4-i}`;
            const weekProduction = production.filter(record => {
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

    showProductionReportModal(title, content) {
        document.getElementById('production-report-title').textContent = title;
        document.getElementById('production-report-content').innerHTML = content;
        ModalManager.open('production-report-modal');
    },

    printProductionReport() {
        const reportContent = document.getElementById('production-report-content').innerHTML;
        const reportTitle = document.getElementById('production-report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h4 { color: #1a1a1a; margin-bottom: 10px; }
                        .report-section { margin-bottom: 20px; }
                        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0; }
                        .stat-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
                        .stat-label { font-size: 12px; color: #666; }
                        .stat-number { font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>${reportTitle}</h2>
                    <div>Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    exportProduction() {
        const production = FarmModules.appData.production || [];
        const csv = this.convertToCSV(production);
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
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    addRecentActivity(activityData) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        switch (activityData.type) {
            case 'production_recorded':
                activity = {
                    type: 'production_recorded',
                    message: `Production: ${this.formatProductName(activityData.production.product)} - ${activityData.production.quantity} ${activityData.production.unit}`,
                    icon: '🚜'
                };
                break;
            case 'production_deleted':
                activity = {
                    type: 'production_deleted',
                    message: `Deleted production: ${this.formatProductName(activityData.production.product)}`,
                    icon: '🗑️'
                };
                break;
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    // Utility methods
    getProductIcon(product) {
        const icons = {
            'eggs': '🥚',
            'broilers': '🐔',
            'layers': '🐓',
            'pork': '🐖',
            'beef': '🐄',
            'milk': '🥛',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    formatProductName(product) {
        const names = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'pork': 'Pork',
            'beef': 'Beef',
            'milk': 'Milk',
            'other': 'Other'
        };
        return names[product] || product;
    },

    formatQuality(quality) {
        const qualities = {
            'excellent': 'Excellent',
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'standard': 'Standard',
            'rejects': 'Rejects'
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
} else {
    console.error('FarmModules framework not found');
}
