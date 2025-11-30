// modules/broiler-mortality.js - UPDATED WITH MODAL MANAGER
console.log('Loading broiler mortality module...');

const BroilerMortalityModule = {
    name: 'Broiler Health & Mortality',
    icon: '😔',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Broiler Health & Mortality</h1>
                <p>Monitor flock health and track losses</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="generate-health-report">
                        📊 Health Report
                    </button>
                </div>
            </div>

            <!-- Mortality Stats -->
            <div class="mortality-stats">
                <div class="stat-card">
                    <div class="stat-icon">😔</div>
                    <div class="stat-content">
                        <h3>Total Losses</h3>
                        <div class="stat-value" id="total-losses">0</div>
                        <div class="stat-period">birds</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>Mortality Rate</h3>
                        <div class="stat-value" id="mortality-rate">0%</div>
                        <div class="stat-period">current rate</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🐔</div>
                    <div class="stat-content">
                        <h3>Current Birds</h3>
                        <div class="stat-value" id="current-birds">0</div>
                        <div class="stat-period">in stock</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h3>Records</h3>
                        <div class="stat-value" id="records-count">0</div>
                        <div class="stat-period">entries</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-grid">
                <button class="quick-action-card" id="record-mortality-btn">
                    <div class="quick-action-icon">📝</div>
                    <div class="quick-action-content">
                        <h4>Record Mortality</h4>
                        <p>Log bird losses and causes</p>
                    </div>
                </button>
                <button class="quick-action-card" id="trend-analysis-btn">
                    <div class="quick-action-icon">📈</div>
                    <div class="quick-action-content">
                        <h4>Trend Analysis</h4>
                        <p>View mortality patterns</p>
                    </div>
                </button>
                <button class="quick-action-card" id="cause-analysis-btn">
                    <div class="quick-action-icon">🔍</div>
                    <div class="quick-action-content">
                        <h4>Cause Analysis</h4>
                        <p>Analyze death causes</p>
                    </div>
                </button>
            </div>

            <!-- Mortality Form -->
            <div class="mortality-form card">
                <h3>Record Mortality</h3>
                <form id="mortality-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="mortality-date">Date *</label>
                            <input type="date" id="mortality-date" required>
                        </div>
                        <div class="form-group">
                            <label for="mortality-quantity">Number of Birds *</label>
                            <input type="number" id="mortality-quantity" min="1" required placeholder="0">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="mortality-cause">Cause of Death *</label>
                            <select id="mortality-cause" required>
                                <option value="">Select Cause</option>
                                <option value="natural">Natural Causes</option>
                                <option value="disease">Disease</option>
                                <option value="predator">Predator</option>
                                <option value="accident">Accident</option>
                                <option value="heat-stress">Heat Stress</option>
                                <option value="cold-stress">Cold Stress</option>
                                <option value="nutritional">Nutritional Issues</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="mortality-age">Bird Age (days)</label>
                            <input type="number" id="mortality-age" min="1" max="70" placeholder="Optional">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="mortality-notes">Observations & Notes</label>
                        <textarea id="mortality-notes" rows="3" placeholder="Symptoms, location, time of discovery, environmental conditions..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Save Mortality Record</button>
                </form>
            </div>

            <!-- Recent Mortality Records -->
            <div class="mortality-records card">
                <div class="card-header">
                    <h3>Recent Mortality Records</h3>
                    <div class="filter-controls">
                        <select id="mortality-filter">
                            <option value="all">All Causes</option>
                            <option value="disease">Disease</option>
                            <option value="predator">Predator</option>
                            <option value="natural">Natural</option>
                            <option value="stress">Stress</option>
                        </select>
                        <button class="btn btn-text" id="export-mortality">Export</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Cause</th>
                                <th>Quantity</th>
                                <th>Age</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="mortality-body">
                            <!-- Mortality records will be rendered here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Health Report Modal -->
            <div id="health-report-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="health-report-title">Health Report</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="health-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-text" id="print-health-report">🖨️ Print</button>
                        <button class="btn btn-primary modal-close">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .mortality-stats {
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

        .mortality-form {
            margin: 2rem 0;
        }

        .mortality-records {
            margin: 2rem 0;
        }

        .mortality-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }

        .cause-badge {
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: capitalize;
            letter-spacing: 0.5px;
        }

        .cause-natural {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .cause-disease {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .cause-predator {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }

        .cause-accident {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
        }

        .cause-heat-stress {
            background: linear-gradient(135deg, #ea580c, #c2410c);
            color: white;
        }

        .cause-cold-stress {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
        }

        .cause-nutritional {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
        }

        .cause-other {
            background: linear-gradient(135deg, #6b7280, #4b5563);
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

        .mortality-rate-warning {
            color: var(--danger-color) !important;
        }

        .mortality-rate-normal {
            color: var(--success-color) !important;
        }

        @media (max-width: 768px) {
            .mortality-stats {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .quick-actions-grid {
                grid-template-columns: 1fr;
            }

            .mortality-records .card-header {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
        }
    `,

    initialize() {
        console.log('😔 Initializing broiler mortality module...');
        this.loadData();
        this.updateStats();
        this.renderMortalityTable();
        
        setTimeout(() => {
            this.attachEventListeners();
            console.log('✅ Mortality event listeners attached');
        }, 100);
    },

    loadData() {
        if (!FarmModules.appData.mortality) {
            FarmModules.appData.mortality = this.getDemoData();
        }
        console.log('📊 Loaded mortality data:', FarmModules.appData.mortality.length, 'records');
    },

    getDemoData() {
        return [
            { 
                id: 1, 
                date: new Date().toISOString().split('T')[0], 
                quantity: 2, 
                cause: 'natural', 
                age: 35,
                notes: 'Found during morning check' 
            },
            { 
                id: 2, 
                date: '2024-03-14', 
                quantity: 1, 
                cause: 'predator', 
                age: 42,
                notes: 'Fox attack overnight, coop breach detected' 
            },
            { 
                id: 3, 
                date: '2024-03-13', 
                quantity: 3, 
                cause: 'disease', 
                age: 28,
                notes: 'Respiratory symptoms observed, isolated immediately' 
            }
        ];
    },

    updateStats() {
        const mortality = FarmModules.appData.mortality || [];
        const totalLosses = mortality.reduce((sum, record) => sum + record.quantity, 0);
        
        // Get current stock from inventory or use default
        const currentStock = this.getCurrentStock();
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';

        // Update DOM elements
        this.updateElement('total-losses', totalLosses.toLocaleString());
        this.updateElement('mortality-rate', mortalityRate + '%');
        this.updateElement('current-birds', currentStock.toLocaleString());
        this.updateElement('records-count', mortality.length.toLocaleString());

        // Update mortality rate color based on threshold
        const mortalityRateElement = document.getElementById('mortality-rate');
        if (mortalityRateElement) {
            if (parseFloat(mortalityRate) > 5) {
                mortalityRateElement.classList.add('mortality-rate-warning');
                mortalityRateElement.classList.remove('mortality-rate-normal');
            } else {
                mortalityRateElement.classList.add('mortality-rate-normal');
                mortalityRateElement.classList.remove('mortality-rate-warning');
            }
        }
    },

    getCurrentStock() {
        // Try to get from inventory first, then fallback to localStorage, then default
        if (FarmModules.appData.inventory) {
            const broilerStock = FarmModules.appData.inventory.find(item => 
                item.type === 'broilers' || item.name?.toLowerCase().includes('broiler')
            );
            if (broilerStock) {
                return broilerStock.quantity || 1000;
            }
        }
        
        const savedStock = localStorage.getItem('farm-birds-stock');
        return savedStock ? parseInt(savedStock) : 1000;
    },

    renderMortalityTable(filter = 'all') {
        const tbody = document.getElementById('mortality-body');
        if (!tbody) return;

        const mortality = FarmModules.appData.mortality || [];
        
        let filteredMortality = mortality;
        if (filter !== 'all') {
            if (filter === 'stress') {
                filteredMortality = mortality.filter(record => 
                    record.cause === 'heat-stress' || record.cause === 'cold-stress'
                );
            } else {
                filteredMortality = mortality.filter(record => record.cause === filter);
            }
        }

        if (filteredMortality.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">😔</span>
                            <h4>No mortality records</h4>
                            <p>${filter === 'all' ? 'No losses recorded - great job!' : `No ${filter} mortality records`}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show most recent first
        const sortedMortality = filteredMortality.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedMortality.map(record => {
            const causeClass = `cause-badge cause-${record.cause}`;
            
            return `
                <tr>
                    <td>${this.formatDate(record.date)}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">${this.getCauseIcon(record.cause)}</span>
                            <span class="${causeClass}">${this.formatCause(record.cause)}</span>
                        </div>
                    </td>
                    <td><strong class="loss">${record.quantity}</strong> birds</td>
                    <td>${record.age ? record.age + ' days' : '-'}</td>
                    <td>${record.notes || '-'}</td>
                    <td class="mortality-actions">
                        <button class="btn-icon edit-mortality" data-id="${record.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-mortality" data-id="${record.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners() {
        console.log('🔗 Attaching mortality event listeners...');

        // Mortality form
        const mortalityForm = document.getElementById('mortality-form');
        if (mortalityForm) {
            mortalityForm.addEventListener('submit', (e) => this.handleMortalitySubmit(e));
            console.log('✅ Mortality form listener attached');
        }

        // Set default date to today
        const dateInput = document.getElementById('mortality-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Quick action buttons
        document.getElementById('record-mortality-btn')?.addEventListener('click', () => {
            document.getElementById('mortality-form').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('trend-analysis-btn')?.addEventListener('click', () => {
            this.generateHealthReport('trends');
        });

        document.getElementById('cause-analysis-btn')?.addEventListener('click', () => {
            this.generateHealthReport('causes');
        });

        document.getElementById('generate-health-report')?.addEventListener('click', () => {
            this.generateHealthReport('overview');
        });

        // Filter
        document.getElementById('mortality-filter')?.addEventListener('change', (e) => {
            this.renderMortalityTable(e.target.value);
        });

        // Export
        document.getElementById('export-mortality')?.addEventListener('click', () => {
            this.exportMortality();
        });

        // Report modal buttons
        document.getElementById('print-health-report')?.addEventListener('click', () => {
            this.printHealthReport();
        });

        // Mortality actions (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-mortality')) {
                const recordId = e.target.closest('.edit-mortality').dataset.id;
                this.editMortality(recordId);
            }
            if (e.target.closest('.delete-mortality')) {
                const recordId = e.target.closest('.delete-mortality').dataset.id;
                this.deleteMortality(recordId);
            }
        });

        console.log('✅ All mortality event listeners attached');
    },

    handleMortalitySubmit(e) {
        e.preventDefault();
        console.log('💾 Saving mortality record...');
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('mortality-date').value,
            quantity: parseInt(document.getElementById('mortality-quantity').value),
            cause: document.getElementById('mortality-cause').value,
            age: document.getElementById('mortality-age').value ? parseInt(document.getElementById('mortality-age').value) : null,
            notes: document.getElementById('mortality-notes').value || ''
        };

        // Validate required fields
        if (!formData.date || !formData.quantity || !formData.cause) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (formData.quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        this.addMortality(formData);
        
        // Reset form
        document.getElementById('mortality-form').reset();
        document.getElementById('mortality-date').value = new Date().toISOString().split('T')[0];
        
        this.showNotification('Mortality record saved successfully!', 'success');
    },

    addMortality(mortalityData) {
        if (!FarmModules.appData.mortality) {
            FarmModules.appData.mortality = [];
        }

        FarmModules.appData.mortality.unshift(mortalityData);
        
        this.updateStats();
        this.renderMortalityTable();
        
        // Add recent activity
        this.addRecentActivity({
            type: 'mortality_recorded',
            mortality: mortalityData
        });
        
        console.log('✅ Mortality record added:', mortalityData);
    },

    editMortality(recordId) {
        console.log('✏️ Editing mortality record:', recordId);
        
        const mortality = FarmModules.appData.mortality || [];
        const record = mortality.find(r => r.id == recordId);
        
        if (!record) {
            console.error('❌ Mortality record not found:', recordId);
            return;
        }

        // Populate form for editing
        document.getElementById('mortality-date').value = record.date;
        document.getElementById('mortality-quantity').value = record.quantity;
        document.getElementById('mortality-cause').value = record.cause;
        document.getElementById('mortality-age').value = record.age || '';
        document.getElementById('mortality-notes').value = record.notes || '';

        // Scroll to form
        document.getElementById('mortality-form').scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Mortality form populated for editing');
    },

    deleteMortality(recordId) {
        if (confirm('Are you sure you want to delete this mortality record?')) {
            const mortality = FarmModules.appData.mortality || [];
            const record = mortality.find(r => r.id == recordId);
            
            FarmModules.appData.mortality = mortality.filter(r => r.id != recordId);
            
            this.updateStats();
            this.renderMortalityTable();
            
            // Add recent activity
            if (record) {
                this.addRecentActivity({
                    type: 'mortality_deleted',
                    mortality: record
                });
            }
            
            this.showNotification('Mortality record deleted successfully', 'success');
            console.log('✅ Mortality record deleted:', recordId);
        }
    },

    generateHealthReport(type = 'overview') {
        console.log('📊 Generating health report:', type);
        
        const mortality = FarmModules.appData.mortality || [];
        const stats = this.calculateDetailedStats();

        let reportTitle = 'Health Overview Report';
        let reportContent = '';

        switch (type) {
            case 'trends':
                reportTitle = 'Mortality Trends Analysis';
                reportContent = this.generateTrendsReport(stats, mortality);
                break;
            case 'causes':
                reportTitle = 'Cause Analysis Report';
                reportContent = this.generateCausesReport(stats, mortality);
                break;
            default:
                reportTitle = 'Health Overview Report';
                reportContent = this.generateOverviewReport(stats, mortality);
        }

        this.showHealthReportModal(reportTitle, reportContent);
    },

    generateOverviewReport(stats, mortality) {
        return `
            <div class="report-section">
                <h4>📊 Flock Health Overview</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Current Bird Count</div>
                        <div class="stat-number">${stats.currentStock}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total Mortality</div>
                        <div class="stat-number">${stats.totalLosses}</div>
                    </div>
                    <div class="stat-item ${stats.mortalityRate > 5 ? 'stat-warning' : 'stat-success'}">
                        <div class="stat-label">Mortality Rate</div>
                        <div class="stat-number">${stats.mortalityRate}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Records</div>
                        <div class="stat-number">${stats.recordsCount}</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>🔍 Mortality by Cause</h4>
                <div class="distribution-list">
                    ${Object.entries(stats.causeDistribution).map(([cause, quantity]) => `
                        <div class="distribution-item">
                            <div class="cause-info">
                                <span class="cause-icon">${this.getCauseIcon(cause)}</span>
                                <span class="cause-name">${this.formatCause(cause)}</span>
                            </div>
                            <div class="cause-quantity">${quantity} birds</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4>💡 Health Recommendations</h4>
                <div class="recommendation-box ${this.getRecommendationLevel(stats.mortalityRate, stats.causeDistribution)}">
                    <p>${this.getHealthRecommendations(stats.mortalityRate, stats.causeDistribution)}</p>
                </div>
            </div>
        `;
    },

    generateTrendsReport(stats, mortality) {
        const weeklyTrends = this.calculateWeeklyTrends(mortality);
        
        return `
            <div class="report-section">
                <h4>📈 Weekly Mortality Trends</h4>
                <div class="trends-grid">
                    ${weeklyTrends.map(week => `
                        <div class="trend-item">
                            <div class="trend-week">${week.week}</div>
                            <div class="trend-losses">😔 ${week.losses} birds</div>
                            <div class="trend-rate">${week.rate}% rate</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4>📅 Recent Mortality Activity</h4>
                <div class="activity-list">
                    ${mortality.slice(0, 8).map(record => `
                        <div class="activity-item">
                            <div class="activity-date">${this.formatDate(record.date)}</div>
                            <div class="activity-details">
                                <span class="activity-cause">${this.getCauseIcon(record.cause)} ${this.formatCause(record.cause)}</span>
                                <span class="activity-quantity">${record.quantity} birds</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    generateCausesReport(stats, mortality) {
        return `
            <div class="report-section">
                <h4>🔍 Detailed Cause Analysis</h4>
                <div class="cause-analysis">
                    ${Object.entries(stats.causeDistribution).map(([cause, quantity]) => {
                        const percentage = ((quantity / stats.totalLosses) * 100).toFixed(1);
                        return `
                            <div class="cause-analysis-item">
                                <div class="cause-header">
                                    <span class="cause-icon">${this.getCauseIcon(cause)}</span>
                                    <span class="cause-name">${this.formatCause(cause)}</span>
                                </div>
                                <div class="cause-stats">
                                    <span class="cause-count">${quantity} birds</span>
                                    <span class="cause-percentage">${percentage}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4>🎯 Preventive Actions</h4>
                <div class="preventive-actions">
                    ${this.getPreventiveActions(stats.causeDistribution)}
                </div>
            </div>
        `;
    },

    calculateDetailedStats() {
        const mortality = FarmModules.appData.mortality || [];
        const totalLosses = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = this.getCurrentStock();
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';

        // Cause distribution
        const causeDistribution = {};
        mortality.forEach(record => {
            causeDistribution[record.cause] = (causeDistribution[record.cause] || 0) + record.quantity;
        });

        return {
            totalLosses,
            mortalityRate,
            currentStock,
            recordsCount: mortality.length,
            causeDistribution
        };
    },

    calculateWeeklyTrends(mortality) {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekStr = `Week ${4-i}`;
            const weekMortality = mortality.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startDate && recordDate <= endDate;
            });

            const losses = weekMortality.reduce((sum, record) => sum + record.quantity, 0);
            const weeklyStock = this.getCurrentStock(); // Simplified - in real app, track weekly stock
            const rate = weeklyStock > 0 ? ((losses / weeklyStock) * 100).toFixed(2) : '0.00';

            weeks.push({ week: weekStr, losses, rate });
        }
        return weeks;
    },

    getRecommendationLevel(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) return 'recommendation-critical';
        if (mortalityRate > 5) return 'recommendation-warning';
        if (causeDistribution.disease > 0) return 'recommendation-info';
        return 'recommendation-success';
    },

    getHealthRecommendations(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) {
            return "⚠️ CRITICAL: Mortality rate is very high! Immediate veterinary consultation required. Isolate sick birds and review all management practices including feed quality, water supply, and environmental conditions.";
        } else if (mortalityRate > 5) {
            return "⚠️ WARNING: Elevated mortality rate detected. Monitor flock closely, check feed and water quality, ensure proper ventilation, and consider preventive measures. Review biosecurity protocols.";
        } else if (causeDistribution.disease > 0) {
            return "🦠 Disease cases present. Enhance biosecurity measures, consider vaccination program, monitor for symptoms in the flock, and maintain strict sanitation practices. Isolate affected birds immediately.";
        } else if (causeDistribution.predator > 0) {
            return "🦊 Predator activity detected. Strengthen coop security with reinforced fencing, install predator deterrents, conduct regular perimeter checks, and ensure proper nighttime enclosure.";
        } else if (causeDistribution['heat-stress'] > 0 || causeDistribution['cold-stress'] > 0) {
            return "🌡️ Environmental stress detected. Ensure adequate ventilation and temperature control, provide fresh water, adjust feeding schedules, and provide appropriate shelter from extreme weather.";
        } else {
            return "✅ Excellent flock health! Maintain current management practices, continue regular monitoring, ensure proper nutrition, and keep up with preventive care and biosecurity measures.";
        }
    },

    getPreventiveActions(causeDistribution) {
        const actions = [];
        
        if (causeDistribution.disease > 0) {
            actions.push("🦠 **Disease Prevention**: Implement strict biosecurity, vaccination program, regular health checks, and immediate isolation of sick birds.");
        }
        
        if (causeDistribution.predator > 0) {
            actions.push("🦊 **Predator Control**: Reinforce coop security, install motion-activated lights, use predator-proof fencing, and conduct regular perimeter checks.");
        }
        
        if (causeDistribution['heat-stress'] > 0) {
            actions.push("🔥 **Heat Stress Management**: Ensure adequate ventilation, provide cool fresh water, install misting systems, and provide shade structures.");
        }
        
        if (causeDistribution['cold-stress'] > 0) {
            actions.push("❄️ **Cold Stress Protection**: Provide adequate insulation, ensure dry bedding, protect from drafts, and consider supplemental heating in extreme cold.");
        }
        
        if (causeDistribution.nutritional > 0) {
            actions.push("🍽️ **Nutritional Management**: Review feed quality and formulation, ensure proper feeding schedules, provide balanced nutrition, and monitor feed consumption.");
        }

        if (actions.length === 0) {
            actions.push("✅ **General Best Practices**: Continue regular health monitoring, maintain clean environment, provide balanced nutrition, and follow biosecurity protocols.");
        }

        return actions.map(action => `<div class="preventive-action">${action}</div>`).join('');
    },

    showHealthReportModal(title, content) {
        document.getElementById('health-report-title').textContent = title;
        document.getElementById('health-report-content').innerHTML = content;
        ModalManager.open('health-report-modal');
    },

    printHealthReport() {
        const reportContent = document.getElementById('health-report-content').innerHTML;
        const reportTitle = document.getElementById('health-report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
                        h4 { color: #1a1a1a; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .report-section { margin-bottom: 25px; break-inside: avoid; }
                        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
                        .stat-item { padding: 12px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
                        .stat-label { font-size: 12px; color: #666; margin-bottom: 5px; }
                        .stat-number { font-size: 18px; font-weight: bold; }
                        .stat-warning { background: #fef3c7; border-color: #f59e0b; }
                        .stat-success { background: #f0fdf4; border-color: #16a34a; }
                        .recommendation-box { padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid; }
                        .recommendation-critical { background: #fef2f2; border-left-color: #dc2626; }
                        .recommendation-warning { background: #fef3c7; border-left-color: #d97706; }
                        .recommendation-info { background: #eff6ff; border-left-color: #3b82f6; }
                        .recommendation-success { background: #f0fdf4; border-left-color: #16a34a; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #666; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    exportMortality() {
        const mortality = FarmModules.appData.mortality || [];
        const csv = this.convertToCSV(mortality);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mortality-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Mortality data exported successfully!', 'success');
    },

    convertToCSV(mortality) {
        const headers = ['Date', 'Cause', 'Quantity', 'Age', 'Notes'];
        const rows = mortality.map(record => [
            record.date,
            this.formatCause(record.cause),
            record.quantity,
            record.age || '',
            record.notes
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    addRecentActivity(activityData) {
        if (!window.FarmModules || !window.FarmModules.modules.dashboard) return;
        
        let activity;
        
        switch (activityData.type) {
            case 'mortality_recorded':
                activity = {
                    type: 'mortality_recorded',
                    message: `Mortality: ${activityData.mortality.quantity} birds - ${this.formatCause(activityData.mortality.cause)}`,
                    icon: '😔'
                };
                break;
            case 'mortality_deleted':
                activity = {
                    type: 'mortality_deleted',
                    message: `Deleted mortality record: ${this.formatCause(activityData.mortality.cause)}`,
                    icon: '🗑️'
                };
                break;
        }
        
        if (activity) {
            window.FarmModules.modules.dashboard.addRecentActivity(activity);
        }
    },

    // Utility methods
    getCauseIcon(cause) {
        const icons = {
            'natural': '🌿',
            'disease': '🤒',
            'predator': '🦊',
            'accident': '⚠️',
            'heat-stress': '🔥',
            'cold-stress': '❄️',
            'nutritional': '🍽️',
            'other': '❓'
        };
        return icons[cause] || '❓';
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'cold-stress': 'Cold Stress',
            'nutritional': 'Nutritional',
            'other': 'Other'
        };
        return causes[cause] || cause;
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
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
} else {
    console.error('FarmModules framework not found');
}
