// modules/broiler-mortality.js - COMPLETE WITH MODALS AND REPORTS
console.log('Loading broiler mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    element: null,
    mortalityData: [],

    initialize() {
        console.log('😔 Initializing Broiler Health & Mortality...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('❌ Content area not found for broiler-mortality module');
            return false;
        }

        // ✅ FIXED: Use this.name instead of this.id
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
            console.log('🎨 Broiler-mortality module registered with StyleManager');
        } else {
            console.warn('⚠️ StyleManager not available');
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Broiler Health & Mortality initialized');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Broiler Health & Mortality updating for theme: ${theme}`);
    },

    loadData() {
        // Load from localStorage or use demo data
        const savedData = localStorage.getItem('farm-mortality-data');
        if (savedData) {
            this.mortalityData = JSON.parse(savedData);
        } else {
            this.mortalityData = this.getDemoData();
            this.saveData();
        }
        console.log('📊 Loaded mortality data:', this.mortalityData.length, 'records');
    },

    saveData() {
        localStorage.setItem('farm-mortality-data', JSON.stringify(this.mortalityData));
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
            },
            { 
                id: 4, 
                date: '2024-03-12', 
                quantity: 2, 
                cause: 'heat-stress', 
                age: 45,
                notes: 'High temperatures, increased ventilation needed' 
            },
            { 
                id: 5, 
                date: '2024-03-11', 
                quantity: 1, 
                cause: 'nutritional', 
                age: 30,
                notes: 'Underweight, poor feed conversion' 
            }
        ];
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container" data-module="broiler-mortality">
                <!-- Module Header -->
                <div class="module-header">
                    <div class="module-header-content">
                        <h1 class="module-title">Broiler Health & Mortality</h1>
                        <p class="module-subtitle">Monitor flock health and track losses</p>
                    </div>
                    <div class="module-header-actions">
                        <button class="btn btn-primary" id="generate-health-report">
                            <span class="btn-icon">📊</span>
                            Health Report
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="glass-card stat-card">
                        <div class="stat-icon">😔</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-losses">0</div>
                            <div class="stat-label">Total Losses</div>
                            <div class="stat-subtitle">birds</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="mortality-rate">0%</div>
                            <div class="stat-label">Mortality Rate</div>
                            <div class="stat-subtitle">current rate</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">🐔</div>
                        <div class="stat-content">
                            <div class="stat-value" id="current-birds">0</div>
                            <div class="stat-label">Current Birds</div>
                            <div class="stat-subtitle">in stock</div>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value" id="records-count">0</div>
                            <div class="stat-label">Records</div>
                            <div class="stat-subtitle">entries</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="glass-card quick-action-card" id="record-mortality-btn">
                        <div class="quick-action-icon">📝</div>
                        <div class="quick-action-content">
                            <h3>Record Mortality</h3>
                            <p>Log bird losses and causes</p>
                        </div>
                    </button>
                    <button class="glass-card quick-action-card" id="trend-analysis-btn">
                        <div class="quick-action-icon">📈</div>
                        <div class="quick-action-content">
                            <h3>Trend Analysis</h3>
                            <p>View mortality patterns</p>
                        </div>
                    </button>
                    <button class="glass-card quick-action-card" id="cause-analysis-btn">
                        <div class="quick-action-icon">🔍</div>
                        <div class="quick-action-content">
                            <h3>Cause Analysis</h3>
                            <p>Analyze death causes</p>
                        </div>
                    </button>
                </div>

                <!-- Mortality Form -->
                <div class="glass-card form-card">
                    <div class="card-header">
                        <h2>📝 Record Mortality</h2>
                    </div>
                    <div class="card-body">
                        <form id="mortality-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="mortality-date" class="form-label">Date *</label>
                                    <input type="date" id="mortality-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="mortality-quantity" class="form-label">Number of Birds *</label>
                                    <input type="number" id="mortality-quantity" class="form-input" min="1" required placeholder="0">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="mortality-cause" class="form-label">Cause of Death *</label>
                                    <select id="mortality-cause" class="form-select" required>
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
                                    <label for="mortality-age" class="form-label">Bird Age (days)</label>
                                    <input type="number" id="mortality-age" class="form-input" min="1" max="70" placeholder="Optional">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="mortality-notes" class="form-label">Observations & Notes</label>
                                <textarea id="mortality-notes" class="form-textarea" rows="3" placeholder="Symptoms, location, time of discovery, environmental conditions..."></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <span class="btn-icon">💾</span>
                                    Save Mortality Record
                                </button>
                                <button type="reset" class="btn btn-text">Clear Form</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Mortality Records -->
                <div class="glass-card table-card">
                    <div class="card-header">
                        <h2>📊 Recent Mortality Records</h2>
                        <div class="card-actions">
                            <select id="mortality-filter" class="form-select">
                                <option value="all">All Causes</option>
                                <option value="disease">Disease</option>
                                <option value="predator">Predator</option>
                                <option value="natural">Natural</option>
                                <option value="stress">Stress</option>
                            </select>
                            <button class="btn btn-text" id="export-mortality">
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
                </div>

            <!-- Health Report Modal -->
                <div id="health-report-modal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="health-report-title">Health Report</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="health-report-content" class="modal-report-content">
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
        `;

        this.updateStats();
        this.renderMortalityTable();
        this.setupEventListeners();
    },

    updateStats() {
        const totalLosses = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = this.getCurrentStock();
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';

        // Update DOM elements
        this.updateElement('total-losses', totalLosses.toLocaleString());
        this.updateElement('mortality-rate', mortalityRate + '%');
        this.updateElement('current-birds', currentStock.toLocaleString());
        this.updateElement('records-count', this.mortalityData.length.toLocaleString());

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
        // Try to get from localStorage first, then fallback to default
        const savedStock = localStorage.getItem('farm-birds-stock');
        return savedStock ? parseInt(savedStock) : 1000;
    },

    renderMortalityTable(filter = 'all') {
        const tbody = document.getElementById('mortality-body');
        if (!tbody) return;
        
        let filteredMortality = this.mortalityData;
        if (filter !== 'all') {
            if (filter === 'stress') {
                filteredMortality = this.mortalityData.filter(record => 
                    record.cause === 'heat-stress' || record.cause === 'cold-stress'
                );
            } else {
                filteredMortality = this.mortalityData.filter(record => record.cause === filter);
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
                        <div class="cause-cell">
                            <span class="cause-icon">${this.getCauseIcon(record.cause)}</span>
                            <span class="${causeClass}">${this.formatCause(record.cause)}</span>
                        </div>
                    </td>
                    <td><strong class="loss">${record.quantity}</strong> birds</td>
                    <td>${record.age ? record.age + ' days' : '-'}</td>
                    <td class="notes-cell">${record.notes || '-'}</td>
                    <td class="actions-cell">
                        <button class="btn-icon edit-mortality" data-id="${record.id}" title="Edit">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="btn-icon delete-mortality" data-id="${record.id}" title="Delete">
                            <span class="icon">🗑️</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners() {
        // Mortality form
        const mortalityForm = document.getElementById('mortality-form');
        if (mortalityForm) {
            mortalityForm.addEventListener('submit', (e) => this.handleMortalitySubmit(e));
        }

        // Set default date to today
        const dateInput = document.getElementById('mortality-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Quick action buttons
        document.getElementById('record-mortality-btn')?.addEventListener('click', () => {
            document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
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

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
                this.closeModal('health-report-modal');
            }
            if (e.target.classList.contains('modal')) {
                this.closeModal('health-report-modal');
            }
        });

        // Print report
        document.getElementById('print-health-report')?.addEventListener('click', () => {
            this.printHealthReport();
        });
    },

    handleMortalitySubmit(e) {
        e.preventDefault();
        
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
        this.mortalityData.unshift(mortalityData);
        this.saveData();
        this.updateStats();
        this.renderMortalityTable();
        
        console.log('✅ Mortality record added:', mortalityData);
    },

    editMortality(recordId) {
        const record = this.mortalityData.find(r => r.id == recordId);
        
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
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    },

    deleteMortality(recordId) {
        if (confirm('Are you sure you want to delete this mortality record?')) {
            this.mortalityData = this.mortalityData.filter(r => r.id != recordId);
            this.saveData();
            this.updateStats();
            this.renderMortalityTable();
            this.showNotification('Mortality record deleted successfully', 'success');
        }
    },

    generateHealthReport(type = 'overview') {
        console.log('📊 Generating health report:', type);
        
        const stats = this.calculateDetailedStats();

        let reportTitle = 'Health Overview Report';
        let reportContent = '';

        switch (type) {
            case 'trends':
                reportTitle = 'Mortality Trends Analysis';
                reportContent = this.generateTrendsReport(stats);
                break;
            case 'causes':
                reportTitle = 'Cause Analysis Report';
                reportContent = this.generateCausesReport(stats);
                break;
            default:
                reportTitle = 'Health Overview Report';
                reportContent = this.generateOverviewReport(stats);
        }

        this.showHealthReportModal(reportTitle, reportContent);
    },

    generateOverviewReport(stats) {
        return `
            <div class="report-section">
                <h4>📊 Flock Health Overview</h4>
                <div class="stats-grid compact">
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

    generateTrendsReport(stats) {
        const weeklyTrends = this.calculateWeeklyTrends();
        
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
                    ${this.mortalityData.slice(0, 8).map(record => `
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

    generateCausesReport(stats) {
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
        const totalLosses = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = this.getCurrentStock();
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';

        // Cause distribution
        const causeDistribution = {};
        this.mortalityData.forEach(record => {
            causeDistribution[record.cause] = (causeDistribution[record.cause] || 0) + record.quantity;
        });

        return {
            totalLosses,
            mortalityRate,
            currentStock,
            recordsCount: this.mortalityData.length,
            causeDistribution
        };
    },

    calculateWeeklyTrends() {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekStr = `Week ${4-i}`;
            const weekMortality = this.mortalityData.filter(record => {
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
        this.openModal('health-report-modal');
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Add close handlers
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.onclick = () => this.closeModal(modalId);
            });
            
            // Close when clicking outside
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            };
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
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
        const csv = this.convertToCSV(this.mortalityData);
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
        
        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    // Utility methods
    getCauseIcon(cause) {
        const icons = {
            'natural': '🌿', 'disease': '🤒', 'predator': '🦊', 'accident': '⚠️',
            'heat-stress': '🔥', 'cold-stress': '❄️', 'nutritional': '🍽️', 'other': '❓'
        };
        return icons[cause] || '❓';
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes', 'disease': 'Disease', 'predator': 'Predator',
            'accident': 'Accident', 'heat-stress': 'Heat Stress', 'cold-stress': 'Cold Stress',
            'nutritional': 'Nutritional', 'other': 'Other'
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
    console.log('✅ Broiler Health & Mortality module registered');
} else {
    console.error('❌ FarmModules framework not found');
}
