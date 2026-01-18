// modules/broiler-mortality.js - COMPLETE FIXED VERSION
console.log('😔 Loading broiler mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    element: null,
    mortalityData: [],
    currentRecordId: null,

    initialize() {
        console.log('😔 Initializing Broiler Health & Mortality...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Broiler Health & Mortality initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler
    onThemeChange(theme) {
        console.log(`Broiler Health & Mortality updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
    },

    loadData() {
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
        <div class="module-container">
            <!-- Module Header -->
            <div class="module-header">
                <h1 class="module-title">Broiler Health & Mortality</h1>
                <p class="module-subtitle">Monitor flock health and track losses</p>
            </div>

            <!-- Mortality Overview Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">😔</div>
                    <div class="stat-value" id="total-losses">0</div>
                    <div class="stat-label">Total Losses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value" id="mortality-rate">0%</div>
                    <div class="stat-label">Mortality Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🐔</div>
                    <div class="stat-value" id="current-birds">0</div>
                    <div class="stat-label">Current Birds</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value" id="records-count">0</div>
                    <div class="stat-label">Records</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-action-grid">
                <button class="quick-action-btn" id="record-mortality-btn">
                    <div class="action-icon">📝</div>
                    <span class="action-title">Record Loss</span>
                    <span class="action-desc">Log bird losses and causes</span>
                </button>
                <button class="quick-action-btn" id="trend-analysis-btn">
                    <div class="action-icon">📊</div>
                    <span class="action-title">Trend Analysis</span>
                    <span class="action-desc">View mortality patterns</span>
                </button>
                <button class="quick-action-btn" id="cause-analysis-btn">
                    <div class="action-icon">🔍</div>
                    <span class="action-title">Cause Analysis</span>
                    <span class="action-desc">Analyze death causes</span>
                </button>
                <button class="quick-action-btn" id="health-report-btn">
                    <div class="action-icon">💡</div>
                    <span class="action-title">Health Report</span>
                    <span class="action-desc">Detailed health analysis</span>
                </button>
            </div>

            <!-- Quick Mortality Form -->
            <div class="glass-card quick-mortality">
                <h3 class="section-title">📝 Quick Mortality Entry</h3>
                <form id="quick-mortality-form">
                    <div class="form-grid">
                        <div>
                            <label class="form-label">Qty *</label>
                            <input type="number" id="quick-quantity" placeholder="0" required class="form-input" min="1">
                        </div>
                        <div>
                            <label class="form-label">Cause *</label>
                            <select id="quick-cause" required class="form-input">
                                <option value="">Select Cause</option>
                                <option value="natural">🌿 Natural</option>
                                <option value="disease">🤒 Disease</option>
                                <option value="predator">🦊 Predator</option>
                                <option value="heat-stress">🔥 Heat Stress</option>
                                <option value="cold-stress">❄️ Cold Stress</option>
                                <option value="nutritional">🍽️ Nutritional</option>
                                <option value="other">❓ Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Age (days)</label>
                            <input type="number" id="quick-age" placeholder="Optional" class="form-input" min="1" max="70">
                        </div>
                        <div>
                            <button type="submit" class="btn-primary">Record Loss</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Recent Mortality Records -->
            <div class="glass-card mortality-records">
                <div class="section-header">
                    <h3 class="section-title">📊 Recent Mortality Records</h3>
                    <div class="section-actions">
                        <select id="mortality-filter" class="form-input">
                            <option value="all">All Causes</option>
                            <option value="disease">Disease</option>
                            <option value="predator">Predator</option>
                            <option value="natural">Natural</option>
                            <option value="stress">Stress</option>
                            <option value="nutritional">Nutritional</option>
                            <option value="other">Other</option>
                        </select>
                        <button class="btn-outline" id="export-mortality-btn">Export</button>
                    </div>
                </div>
                <div id="mortality-table">
                    ${this.renderMortalityTable('all')}
                </div>
            </div>

            <!-- Cause Distribution -->
            <div class="glass-card cause-distribution">
                <h3 class="section-title">🔍 Mortality by Cause</h3>
                <div id="cause-summary">
                    ${this.renderCauseSummary()}
                </div>
            </div>
        </div>

        <!-- POPOUT MODALS -->
        <!-- Mortality Record Modal -->
        <div id="mortality-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="mortality-modal-title">Record Mortality</h3>
                    <button class="popout-modal-close" id="close-mortality-modal">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <form id="mortality-form">
                        <input type="hidden" id="mortality-id" value="">
                        <div class="form-grid">
                            <div>
                                <label class="form-label">Date *</label>
                                <input type="date" id="mortality-date" class="form-input" required>
                            </div>
                            <div>
                                <label class="form-label">Number of Birds *</label>
                                <input type="number" id="mortality-quantity" class="form-input" min="1" required placeholder="0">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div>
                                <label class="form-label">Cause of Death *</label>
                                <select id="mortality-cause" class="form-input" required>
                                    <option value="">Select Cause</option>
                                    <option value="natural">🌿 Natural Causes</option>
                                    <option value="disease">🤒 Disease</option>
                                    <option value="predator">🦊 Predator</option>
                                    <option value="accident">⚠️ Accident</option>
                                    <option value="heat-stress">🔥 Heat Stress</option>
                                    <option value="cold-stress">❄️ Cold Stress</option>
                                    <option value="nutritional">🍽️ Nutritional Issues</option>
                                    <option value="other">❓ Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Bird Age (days)</label>
                                <input type="number" id="mortality-age" class="form-input" min="1" max="70" placeholder="Optional">
                            </div>
                        </div>
                        <div>
                            <label class="form-label">Observations & Notes</label>
                            <textarea id="mortality-notes" class="form-input" rows="3"
                                placeholder="Symptoms, location, time of discovery, environmental conditions..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="popout-modal-footer">
                    <button type="button" class="btn-outline" id="cancel-mortality">Cancel</button>
                    <button type="button" class="btn-danger" id="delete-mortality" style="display: none;">Delete</button>
                    <button type="button" class="btn-primary" id="save-mortality">Save Record</button>
                </div>
            </div>
        </div>

                <!-- Health Report Modal -->
        <div id="health-report-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="health-report-title">Health Report</h3>
                    <button class="popout-modal-close" id="close-health-report">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="health-report-content"></div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-health-report">🖨️ Print</button>
                    <button class="btn-primary" id="close-health-report-btn">Close</button>
                </div>
            </div>
        </div>

        <!-- Trend Analysis Modal -->
        <div id="trend-analysis-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="trend-analysis-title">Mortality Trend Analysis</h3>
                    <button class="popout-modal-close" id="close-trend-analysis">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="trend-analysis-content"></div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-trend-analysis">🖨️ Print</button>
                    <button class="btn-primary" id="close-trend-analysis-btn">Close</button>
                </div>
            </div>
        </div>

        <!-- Cause Analysis Modal -->
        <div id="cause-analysis-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="cause-analysis-title">Cause Analysis Report</h3>
                    <button class="popout-modal-close" id="close-cause-analysis">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="cause-analysis-content"></div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-cause-analysis">🖨️ Print</button>
                    <button class="btn-primary" id="close-cause-analysis-btn">Close</button>
                </div>
            </div>
        </div>
    `;

    this.updateStats();
    this.setupEventListeners();
},

    
    updateStats() {
        const totalLosses = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = this.getCurrentStock();
        const mortalityRate = currentStock > 0 ? ((totalLosses / currentStock) * 100).toFixed(2) : '0.00';

        this.updateElement('total-losses', totalLosses.toLocaleString());
        this.updateElement('mortality-rate', mortalityRate + '%');
        this.updateElement('current-birds', currentStock.toLocaleString());
        this.updateElement('records-count', this.mortalityData.length.toLocaleString());

        // Update mortality rate color based on threshold
        const mortalityRateElement = document.getElementById('mortality-rate');
        if (mortalityRateElement) {
            if (parseFloat(mortalityRate) > 5) {
                mortalityRateElement.style.color = '#ef4444';
            } else if (parseFloat(mortalityRate) > 2) {
                mortalityRateElement.style.color = '#f59e0b';
            } else {
                mortalityRateElement.style.color = '#22c55e';
            }
        }
    },

    getCurrentStock() {
        const savedStock = localStorage.getItem('farm-birds-stock');
        return savedStock ? parseInt(savedStock) : 1000;
    },

    renderMortalityTable(filter = 'all') {
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
    return `
        <div class="mortality-empty">
            <div class="empty-icon">😔</div>
            <div class="empty-title">No mortality records</div>
            <div class="empty-desc">
                ${filter === 'all' ? 'No losses recorded - great job!' : `No ${filter} mortality records`}
            </div>
        </div>
    `;
}

const sortedMortality = filteredMortality
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

return `
    <div class="table-wrapper">
        <table class="report-table mortality-table">
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
            <tbody>
                ${sortedMortality.map(record => {
                    const causeColor = this.getCauseColor(record.cause);

                    return `
                        <tr>
                            <td>${this.formatDate(record.date)}</td>
                            <td>
                                <div class="cause-cell">
                                    <span class="cause-icon">${this.getCauseIcon(record.cause)}</span>
                                    <span class="cause-badge" style="color:${causeColor}; background:${causeColor}20;">
                                        ${this.formatCause(record.cause)}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div class="quantity-cell">
                                    <div class="quantity-value">${record.quantity}</div>
                                    <div class="quantity-label">birds</div>
                                </div>
                            </td>
                            <td>${record.age ? record.age + ' days' : '-'}</td>
                            <td class="notes-cell">${record.notes || '-'}</td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn-icon edit-mortality" data-id="${record.id}" title="Edit">✏️</button>
                                    <button class="btn-icon delete-mortality" data-id="${record.id}" title="Delete">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    </div>
`;
},

renderCauseSummary() {
    const causeData = {};
    const causes = ['natural', 'disease', 'predator', 'heat-stress', 'cold-stress', 'nutritional', 'other'];
    
    // Calculate data for each cause
    causes.forEach(cause => {
        const causeRecords = this.mortalityData.filter(record => record.cause === cause);
        causeData[cause] = {
            count: causeRecords.length,
            totalQuantity: causeRecords.reduce((sum, record) => sum + record.quantity, 0),
            avgAge: causeRecords.length > 0 ? 
                Math.round(causeRecords.reduce((sum, record) => sum + (record.age || 0), 0) / causeRecords.length) : 0,
            recordIds: causeRecords.map(record => record.id)
        };
    });

    const totalLosses = this.mortalityData.reduce((sum, record) => sum + record.quantity, 0);

    // Filter to only show causes that have data
    const causesWithData = causes.filter(cause => causeData[cause].totalQuantity > 0);
    
   if (causesWithData.length === 0) {
    return `
        <div class="cause-summary-grid">
            <div class="cause-item cause-empty">
                <div class="empty-icon">😊</div>
                <div class="empty-title">No mortality by cause data</div>
                <div class="empty-desc">
                    Record some mortality data to see cause analysis
                </div>
            </div>
        </div>
    `;
}

return `
    <div class="cause-summary-grid">
        ${causesWithData.map(cause => {
            const data = causeData[cause];
            const percentage = totalLosses > 0
                ? Math.round((data.totalQuantity / totalLosses) * 100)
                : 0;
            const causeColor = this.getCauseColor(cause);

            return `
                <div class="cause-item" data-cause="${cause}">
                    <div class="cause-header">
                        <div class="cause-icon">${this.getCauseIcon(cause)}</div>
                        <div class="cause-title" style="color:${causeColor};">
                            ${this.formatCause(cause)}
                        </div>
                    </div>

                    <div class="cause-stats">
                        <div class="cause-stat">
                            <span class="cause-stat-label">Losses:</span>
                            <span class="cause-stat-value">${data.totalQuantity} birds</span>
                        </div>
                        <div class="cause-stat">
                            <span class="cause-stat-label">Records:</span>
                            <span class="cause-stat-value">${data.count}</span>
                        </div>
                        <div class="cause-stat">
                            <span class="cause-stat-label">Share:</span>
                            <span class="cause-stat-percentage" style="color:${causeColor};">
                                ${percentage}%
                            </span>
                        </div>
                    </div>

                    <div class="cause-actions">
                        <button class="delete-cause-records" data-cause="${cause}"
                                title="Delete all ${this.formatCause(cause)} records">
                            <span class="action-icon">🗑️</span>
                            <span>Delete All</span>
                        </button>
                        <button class="view-cause-details" data-cause="${cause}"
                                title="View ${this.formatCause(cause)} details">
                            <span class="action-icon">🔍</span>
                            <span>View Details</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('')}
    </div>
`;
},
    
    setupEventListeners() {
        console.log('🔧 Setting up broiler mortality event listeners...');
        
        // Quick form
        const quickForm = document.getElementById('quick-mortality-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickMortality();
            });
        }

        // Modal buttons
        const recordBtn = document.getElementById('record-mortality-btn');
        if (recordBtn) recordBtn.addEventListener('click', () => this.showMortalityModal());
        
        const healthBtn = document.getElementById('health-report-btn');
        if (healthBtn) healthBtn.addEventListener('click', () => this.generateHealthReport());
        
        const trendBtn = document.getElementById('trend-analysis-btn');
        if (trendBtn) trendBtn.addEventListener('click', () => this.generateTrendAnalysis());
        
        const causeBtn = document.getElementById('cause-analysis-btn');
        if (causeBtn) causeBtn.addEventListener('click', () => this.generateCauseAnalysis());
        
        const exportBtn = document.getElementById('export-mortality-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportMortality());
        
        // Mortality modal handlers
        const saveBtn = document.getElementById('save-mortality');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveMortality());
        
        const deleteBtn = document.getElementById('delete-mortality');
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteMortality());
        
        const cancelBtn = document.getElementById('cancel-mortality');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideMortalityModal());
        
        const closeModalBtn = document.getElementById('close-mortality-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.hideMortalityModal());
        
        // Report modal handlers
        const closeHealthBtn = document.getElementById('close-health-report');
        if (closeHealthBtn) closeHealthBtn.addEventListener('click', () => this.hideHealthReportModal());
        
        const closeHealthBtn2 = document.getElementById('close-health-report-btn');
        if (closeHealthBtn2) closeHealthBtn2.addEventListener('click', () => this.hideHealthReportModal());
        
        const printHealthBtn = document.getElementById('print-health-report');
        if (printHealthBtn) printHealthBtn.addEventListener('click', () => this.printHealthReport());
        
        // Trend analysis modal handlers
        const closeTrendBtn = document.getElementById('close-trend-analysis');
        if (closeTrendBtn) closeTrendBtn.addEventListener('click', () => this.hideTrendAnalysisModal());
        
        const closeTrendBtn2 = document.getElementById('close-trend-analysis-btn');
        if (closeTrendBtn2) closeTrendBtn2.addEventListener('click', () => this.hideTrendAnalysisModal());
        
        const printTrendBtn = document.getElementById('print-trend-analysis');
        if (printTrendBtn) printTrendBtn.addEventListener('click', () => this.printTrendAnalysis());
        
        // Cause analysis modal handlers
        const closeCauseBtn = document.getElementById('close-cause-analysis');
        if (closeCauseBtn) closeCauseBtn.addEventListener('click', () => this.hideCauseAnalysisModal());
        
        const closeCauseBtn2 = document.getElementById('close-cause-analysis-btn');
        if (closeCauseBtn2) closeCauseBtn2.addEventListener('click', () => this.hideCauseAnalysisModal());
        
        const printCauseBtn = document.getElementById('print-cause-analysis');
        if (printCauseBtn) printCauseBtn.addEventListener('click', () => this.printCauseAnalysis());
        
        // Filter
        const filterSelect = document.getElementById('mortality-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const filterValue = e.target.value;
                console.log('🔍 Filter changed to:', filterValue);
                document.getElementById('mortality-table').innerHTML = this.renderMortalityTable(filterValue);
                // Setup event listeners after table re-render
                this.setupTableClickHandler();
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });

        // Setup table click handler
        this.setupTableClickHandler();
    },

    // NEW: Universal table click handler
    setupTableClickHandler() {
        console.log('🔧 Setting up table click handler...');
        
        // Remove existing handler to avoid duplicates
        document.removeEventListener('click', this.handleTableClickBound);
        
        // Create bound version for removal
        this.handleTableClickBound = this.handleTableClick.bind(this);
        
        // Add new handler
        document.addEventListener('click', this.handleTableClickBound);
    },

    // NEW: Handle clicks on edit/delete buttons
    // Update the handleTableClick method to include cause summary button handling
handleTableClick(e) {
    // Check for edit button
    const editButton = e.target.closest('.edit-mortality');
    if (editButton) {
        e.preventDefault();
        e.stopPropagation();
        const recordId = editButton.dataset.id;
        console.log('✅ Edit button clicked:', recordId);
        this.editMortality(recordId);
        return;
    }
    
    // Check for delete button
    const deleteButton = e.target.closest('.delete-mortality');
    if (deleteButton) {
        e.preventDefault();
        e.stopPropagation();
        const recordId = deleteButton.dataset.id;
        console.log('✅ Delete button clicked:', recordId);
        this.deleteMortalityRecord(recordId);
        return;
    }
    
    // NEW: Check for delete all cause records button
    const deleteCauseButton = e.target.closest('.delete-cause-records');
    if (deleteCauseButton) {
        e.preventDefault();
        e.stopPropagation();
        const cause = deleteCauseButton.dataset.cause;
        console.log('🗑️ Delete all records for cause:', cause);
        this.deleteAllCauseRecords(cause);
        return;
    }
    
    // NEW: Check for view cause details button
    const viewCauseButton = e.target.closest('.view-cause-details');
    if (viewCauseButton) {
        e.preventDefault();
        e.stopPropagation();
        const cause = viewCauseButton.dataset.cause;
        console.log('🔍 View details for cause:', cause);
        this.viewCauseDetails(cause);
        return;
    }
},

    // NEW METHOD: Delete all records for a specific cause
deleteAllCauseRecords(cause) {
    const causeName = this.formatCause(cause);
    const causeRecords = this.mortalityData.filter(record => record.cause === cause);
    
    if (causeRecords.length === 0) {
        this.showNotification(`No ${causeName} records to delete`, 'info');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete ALL ${causeRecords.length} ${causeName} records? This will remove ${causeRecords.reduce((sum, record) => sum + record.quantity, 0)} birds from the records.`;
    
    if (confirm(confirmMessage)) {
        // Keep records that are NOT from this cause
        this.mortalityData = this.mortalityData.filter(record => record.cause !== cause);
        
        this.saveData();
        this.updateStats();
        this.updateMortalityTable();
        this.updateCauseSummary();
        
        this.showNotification(`All ${causeName} records (${causeRecords.length}) deleted successfully`, 'success');
    }
},

// NEW METHOD: View details for a specific cause
// FIXED: View details for a specific cause
viewCauseDetails(cause) {
    console.log('🔍 View details for cause:', cause);
    
    const causeName = this.formatCause(cause);
    const causeRecords = this.mortalityData.filter(record => record.cause === cause);
    
    if (causeRecords.length === 0) {
        this.showNotification(`No ${causeName} records found`, 'info');
        return;
    }
    
    // 1. Update the filter dropdown
    const filterSelect = document.getElementById('mortality-filter');
    if (filterSelect) {
        let filterValue = cause;
        if (cause === 'heat-stress' || cause === 'cold-stress') {
            filterValue = 'stress';
        }
        filterSelect.value = filterValue;
    }
    
    // 2. Update the mortality table
    const tableElement = document.getElementById('mortality-table');
    if (tableElement) {
        if (cause === 'heat-stress' || cause === 'cold-stress') {
            tableElement.innerHTML = this.renderMortalityTable('stress');
        } else {
            tableElement.innerHTML = this.renderMortalityTable(cause);
        }
        
        this.setupTableClickHandler();
    }
    
    // 3. Show notification
    this.showNotification(`Showing ${causeRecords.length} ${causeName} records`, 'info');
    
    // 4. 🔥 IMPROVED SCROLLING - Scroll to the table section
    setTimeout(() => {
        // Find the mortality records card (the one containing the table)
        const mortalityCards = document.querySelectorAll('.glass-card');
        let targetCard = null;
        
        // Look for the card that contains the mortality table
        mortalityCards.forEach(card => {
            if (card.querySelector('#mortality-table')) {
                targetCard = card;
            }
        });
        
        if (targetCard) {
            console.log('📜 Found table card, scrolling...');
            
            // Calculate position to scroll to (a bit above the card)
            const cardPosition = targetCard.getBoundingClientRect().top + window.pageYOffset;
            const headerOffset = 100; // Adjust this to account for fixed headers
            
            // Smooth scroll to position
            window.scrollTo({
                top: cardPosition - headerOffset,
                behavior: 'smooth'
            });
            
            // Add visual highlight effect
            const originalBoxShadow = targetCard.style.boxShadow;
            const originalBorder = targetCard.style.border;
            
            targetCard.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.4), 0 8px 32px rgba(59, 130, 246, 0.2)';
            targetCard.style.border = '2px solid #3b82f6';
            targetCard.style.transition = 'all 0.3s ease';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                targetCard.style.boxShadow = originalBoxShadow;
                targetCard.style.border = originalBorder;
            }, 2000);
        } else {
            console.log('⚠️ Could not find table card to scroll to');
            // Fallback: Scroll to top of content area
            document.getElementById('content-area')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 100); // Small delay to ensure table is rendered
    
    // 5. Highlight the cause card briefly
    const causeCards = document.querySelectorAll('.cause-item');
    causeCards.forEach(card => {
        if (card.dataset.cause === cause) {
            const originalBorder = card.style.border;
            const originalShadow = card.style.boxShadow;
            
            card.style.border = '2px solid #3b82f6';
            card.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            
            setTimeout(() => {
                card.style.border = originalBorder;
                card.style.boxShadow = originalShadow;
            }, 1500);
        }
    });
},
    
    // MODAL CONTROL METHODS
    showMortalityModal() {
        this.hideAllModals();
        document.getElementById('mortality-modal').classList.remove('hidden');
        this.currentRecordId = null;
        document.getElementById('mortality-form').reset();
        document.getElementById('mortality-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('delete-mortality').style.display = 'none';
        document.getElementById('mortality-modal-title').textContent = 'Record Mortality';
    },

    hideMortalityModal() {
        document.getElementById('mortality-modal').classList.add('hidden');
    },

    showHealthReportModal() {
        this.hideAllModals();
        document.getElementById('health-report-modal').classList.remove('hidden');
    },

    hideHealthReportModal() {
        document.getElementById('health-report-modal').classList.add('hidden');
    },

    showTrendAnalysisModal() {
        this.hideAllModals();
        document.getElementById('trend-analysis-modal').classList.remove('hidden');
    },

    hideTrendAnalysisModal() {
        document.getElementById('trend-analysis-modal').classList.add('hidden');
    },

    showCauseAnalysisModal() {
        this.hideAllModals();
        document.getElementById('cause-analysis-modal').classList.remove('hidden');
    },

    hideCauseAnalysisModal() {
        document.getElementById('cause-analysis-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideMortalityModal();
        this.hideHealthReportModal();
        this.hideTrendAnalysisModal();
        this.hideCauseAnalysisModal();
    },

    generateHealthReport() {
    const stats = this.calculateDetailedStats();

    let report = '<div class="report-content">';
    report += '<h4 class="report-heading">😔 Flock Health & Mortality Report</h4>';

    // Summary Section
    report += `
        <div class="report-section summary">
            <h5 class="section-subtitle">📊 FLOCK HEALTH SUMMARY:</h5>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Current Stock</div>
                    <div class="summary-value">${stats.currentStock}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Losses</div>
                    <div class="summary-value losses">${stats.totalLosses}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Mortality Rate</div>
                    <div class="summary-value rate ${parseFloat(stats.mortalityRate) > 5 ? 'rate-high' : parseFloat(stats.mortalityRate) > 2 ? 'rate-medium' : 'rate-low'}">
                        ${stats.mortalityRate}%
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Records</div>
                    <div class="summary-value">${stats.recordsCount}</div>
                </div>
            </div>
        </div>
    `;

    // Cause Distribution
    report += `
        <div class="report-section cause-distribution">
            <h5 class="section-subtitle">🔍 MORTALITY BY CAUSE:</h5>
            <div class="cause-list">
    `;

    Object.entries(stats.causeDistribution).forEach(([cause, quantity]) => {
        const percentage = stats.totalLosses > 0 ? Math.round((quantity / stats.totalLosses) * 100) : 0;
        const causeColor = this.getCauseColor(cause);

        report += `
            <div class="cause-card" style="border-left-color:${causeColor};">
                <div class="cause-header">
                    <div class="cause-info">
                        <span class="cause-icon">${this.getCauseIcon(cause)}</span>
                        <span class="cause-name">${this.formatCause(cause)}</span>
                    </div>
                    <span class="cause-quantity">${quantity} birds</span>
                </div>
                <div class="cause-bar">
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${percentage}%; background:${causeColor};"></div>
                    </div>
                    <span class="bar-label">${percentage}%</span>
                </div>
            </div>
        `;
    });

    report += '</div></div>';

    // Health Recommendations
    report += `
        <div class="report-section recommendations">
            <h5 class="section-subtitle">💡 HEALTH RECOMMENDATIONS:</h5>
            <div class="recommendation-box"
                 style="background:${this.getRecommendationLevel(stats.mortalityRate, stats.causeDistribution)};
                        border-left-color:${this.getRecommendationColor(stats.mortalityRate, stats.causeDistribution)};">
                ${this.getHealthRecommendations(stats.mortalityRate, stats.causeDistribution)}
            </div>
        </div>
    `;

    // Recent Activity
    const recentMortality = this.mortalityData.slice(0, 5);
    if (recentMortality.length > 0) {
        report += `
            <div class="report-section recent-activity">
                <h5 class="section-subtitle">📋 RECENT MORTALITY ACTIVITY (Last 5):</h5>
                <div class="activity-list">
        `;

        recentMortality.forEach(record => {
            const causeColor = this.getCauseColor(record.cause);
            report += `
                <div class="activity-card" style="border-left-color:${causeColor};">
                    <div class="activity-header">
                        <div class="activity-info">
                            <div class="activity-date">${this.formatDate(record.date)}</div>
                            <div class="activity-meta">
                                <span class="activity-cause">
                                    ${this.getCauseIcon(record.cause)} ${this.formatCause(record.cause)}
                                </span>
                                ${record.age ? ` • ${record.age} days old` : ''}
                            </div>
                        </div>
                        <div class="activity-stats">
                            <div class="activity-quantity">${record.quantity} birds</div>
                            <div class="activity-notes">${record.notes ? 'Has notes' : 'No notes'}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        report += '</div></div>';
    }
        
        report += '</div>';

        document.getElementById('health-report-content').innerHTML = report;
        document.getElementById('health-report-title').textContent = 'Flock Health & Mortality Report';
        this.showHealthReportModal();
    },

   generateTrendAnalysis() {
    const weeklyTrends = this.calculateWeeklyTrends();

    let analysis = '<div class="report-content">';
    analysis += '<h4 class="report-heading">📈 Mortality Trend Analysis</h4>';

    if (weeklyTrends.length === 0) {
        analysis += `
            <div class="trend-empty">
                <div class="empty-icon">📊</div>
                <h5 class="empty-title">Not enough data</h5>
                <p class="empty-desc">Need more mortality records to analyze trends</p>
            </div>
        `;
    } else {
        analysis += `
            <div class="report-section weekly-trends">
                <h5 class="section-subtitle">📅 WEEKLY MORTALITY TRENDS:</h5>
                <div class="trend-list">
        `;

        weeklyTrends.forEach((week, index) => {
            const trendColor = week.rate > 5 ? '#ef4444' : week.rate > 2 ? '#f59e0b' : '#22c55e';
            const trendIcon = week.rate > 5 ? '📈⚠️' : week.rate > 2 ? '📈' : '📉✅';

            analysis += `
                <div class="trend-card" style="border-color:${trendColor}20;">
                    <div class="trend-header">
                        <span class="trend-week">Week ${index + 1}</span>
                        <span class="trend-icon">${trendIcon}</span>
                    </div>
                    <div class="trend-grid">
                        <div class="trend-cell">
                            <div class="trend-label">Losses</div>
                            <div class="trend-value losses">${week.losses}</div>
                            <div class="trend-sub">birds</div>
                        </div>
                        <div class="trend-cell">
                            <div class="trend-label">Rate</div>
                            <div class="trend-value" style="color:${trendColor};">${week.rate}%</div>
                            <div class="trend-sub">of flock</div>
                        </div>
                    </div>
                </div>
            `;
        });

        analysis += '</div></div>';
    }
           
            // Recommendations
            const latestWeek = weeklyTrends[weeklyTrends.length - 1];
            const previousWeek = weeklyTrends.length > 1 ? weeklyTrends[weeklyTrends.length - 2] : null;
            
           if (previousWeek && latestWeek.rate > 0) {
    const change = ((latestWeek.rate - previousWeek.rate) / previousWeek.rate * 100).toFixed(1);

    analysis += `
        <div class="report-section trend-insights">
            <h5 class="section-subtitle">💡 TREND INSIGHTS:</h5>
            <div class="insight-box ${parseFloat(change) >= 0 ? 'insight-negative' : 'insight-positive'}">
    `;

    if (parseFloat(change) > 10) {
        analysis += `
            <div class="insight-critical">🚨 CRITICAL: Mortality rate increased by ${change}%</div>
            <div class="insight-details">
                <p>⚠️ Immediate action required:</p>
                <ul>
                    <li>Consult with veterinarian immediately</li>
                    <li>Review feed quality and water supply</li>
                    <li>Check environmental conditions (temperature, ventilation)</li>
                    <li>Consider isolating affected birds</li>
                </ul>
            </div>
        `;
    } else if (parseFloat(change) > 0) {
        analysis += `
            <div class="insight-warning">⚠️ WARNING: Mortality rate increased by ${change}%</div>
            <div class="insight-details">
                <p>Monitor closely and consider:</p>
                <ul>
                    <li>Review biosecurity measures</li>
                    <li>Check flock health more frequently</li>
                    <li>Ensure proper nutrition and water quality</li>
                    <li>Monitor environmental stressors</li>
                </ul>
            </div>
        `;
    } else if (parseFloat(change) < 0) {
        analysis += `
            <div class="insight-good">✅ GOOD NEWS: Mortality rate decreased by ${Math.abs(change)}%</div>
            <div class="insight-details">
                <p>Current management practices are effective. Continue to:</p>
                <ul>
                    <li>Maintain current health protocols</li>
                    <li>Continue regular monitoring</li>
                    <li>Keep up with preventive care</li>
                    <li>Monitor for any new issues</li>
                </ul>
            </div>
        `;
    }

    analysis += '</div></div>';
}
   }
        
        analysis += '</div>';

        document.getElementById('trend-analysis-content').innerHTML = analysis;
        document.getElementById('trend-analysis-title').textContent = 'Mortality Trend Analysis';
        this.showTrendAnalysisModal();
    },

    generateCauseAnalysis() {
    const stats = this.calculateDetailedStats();

    let analysis = '<div class="report-content">';
    analysis += '<h4 class="report-heading">🔍 Mortality Cause Analysis</h4>';

    if (Object.keys(stats.causeDistribution).length === 0) {
        analysis += `
            <div class="cause-empty">
                <div class="empty-icon">📊</div>
                <h5 class="empty-title">No mortality data</h5>
                <p class="empty-desc">Record some mortality data to analyze causes</p>
            </div>
        `;
    } else {
        // Detailed cause analysis
        analysis += `
            <div class="report-section cause-breakdown">
                <h5 class="section-subtitle">📊 DETAILED CAUSE BREAKDOWN:</h5>
                <div class="cause-list">
        `;

        Object.entries(stats.causeDistribution).forEach(([cause, quantity]) => {
            const percentage = stats.totalLosses > 0 ? ((quantity / stats.totalLosses) * 100).toFixed(1) : 0;
            const causeColor = this.getCauseColor(cause);

            analysis += `
                <div class="cause-card" style="background:${causeColor}10; border-left-color:${causeColor};">
                    <div class="cause-header">
                        <div class="cause-info">
                            <span class="cause-icon">${this.getCauseIcon(cause)}</span>
                            <span class="cause-name" style="color:${causeColor};">${this.formatCause(cause)}</span>
                        </div>
                        <div class="cause-stats">
                            <div class="cause-quantity" style="color:${causeColor};">${quantity} birds</div>
                            <div class="cause-percentage">${percentage}% of total</div>
                        </div>
                    </div>
                    <div class="cause-recommendation">
                        <div class="recommendation-title">💡 Prevention Recommendations:</div>
                        <div class="recommendation-text">
                            ${this.getCausePrevention(cause)}
                        </div>
                    </div>
                </div>
            `;
        });

        analysis += '</div></div>';

        // Top causes
        const topCauses = Object.entries(stats.causeDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topCauses.length > 0) {
            analysis += `
                <div class="report-section top-causes">
                    <h5 class="section-subtitle">🏆 TOP 3 CAUSES OF MORTALITY:</h5>
                    <div class="top-cause-list">
            `;

            topCauses.forEach(([cause, quantity], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const percentage = ((quantity / stats.totalLosses) * 100).toFixed(1);
                const causeColor = this.getCauseColor(cause);

                analysis += `
                    <div class="top-cause-card">
                        <div class="medal">${medal}</div>
                        <div class="top-cause-info">
                            <div class="top-cause-name">${this.formatCause(cause)}</div>
                            <div class="top-cause-meta">${quantity} birds (${percentage}%)</div>
                        </div>
                        <div class="top-cause-icon" style="color:${causeColor};">${this.getCauseIcon(cause)}</div>
                    </div>
                `;
            });

            analysis += '</div></div>';
        }
    }

    analysis += '</div>'; // close report-content
    return analysis;
}

           // Preventive actions
            analysis += `
                <div class="report-section preventive-actions">
                    <h5 class="section-subtitle">🛡️ PREVENTIVE ACTION PLAN:</h5>
                    <div class="preventive-box">
                        ${this.getPreventiveActions(stats.causeDistribution)}
                    </div>
                </div>
            `;
            }

        analysis += '</div>';

        document.getElementById('cause-analysis-content').innerHTML = analysis;
        document.getElementById('cause-analysis-title').textContent = 'Mortality Cause Analysis';
        this.showCauseAnalysisModal();
    },

    // PRINT METHODS
    printHealthReport() {
        this.printReport('health-report-content', 'health-report-title');
    },

    printTrendAnalysis() {
        this.printReport('trend-analysis-content', 'trend-analysis-title');
    },

    printCauseAnalysis() {
        this.printReport('cause-analysis-content', 'cause-analysis-title');
    },

    printReport(contentId, titleId) {
        const reportContent = document.getElementById(contentId).innerHTML;
        const reportTitle = document.getElementById(titleId).textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #1f2937;
                            line-height: 1.6;
                        }
                        .report-content { 
                            max-width: 800px; 
                            margin: 0 auto;
                        }
                        h4 { 
                            color: #1f2937; 
                            border-bottom: 2px solid #3b82f6; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        h5 { 
                            color: #374151; 
                            margin: 20px 0 10px 0;
                        }
                        .stats-grid { 
                            display: grid; 
                            grid-template-columns: repeat(4, 1fr); 
                            gap: 15px; 
                            margin: 15px 0; 
                        }
                        .stat-item { 
                            padding: 10px; 
                            background: #f8f9fa; 
                            border-radius: 5px; 
                            text-align: center; 
                        }
                        @media print {
                            body { margin: 0.5in; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <div style="color: #6b7280; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                    ${reportContent}
                    <div class="no-print" style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
                        Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // EXISTING METHODS (keep as they were)
    handleQuickMortality() {
        const quantity = parseInt(document.getElementById('quick-quantity').value);
        const cause = document.getElementById('quick-cause').value;
        const age = document.getElementById('quick-age').value ? parseInt(document.getElementById('quick-age').value) : null;

        if (!quantity || !cause) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        const mortalityData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            quantity: quantity,
            cause: cause,
            age: age,
            notes: 'Quick entry'
        };

        this.addMortality(mortalityData);
        
        // Reset form
        document.getElementById('quick-mortality-form').reset();
        this.showNotification('Mortality recorded successfully!', 'success');
    },

    saveMortality() {
        const form = document.getElementById('mortality-form');
        if (!form) {
            console.error('❌ Mortality form not found');
            return;
        }

        const mortalityId = document.getElementById('mortality-id').value;
        const date = document.getElementById('mortality-date').value;
        const quantity = parseInt(document.getElementById('mortality-quantity').value);
        const cause = document.getElementById('mortality-cause').value;
        const age = document.getElementById('mortality-age').value ? parseInt(document.getElementById('mortality-age').value) : null;
        const notes = document.getElementById('mortality-notes').value.trim();

        if (!date || !quantity || !cause) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quantity <= 0) {
            this.showNotification('Quantity must be greater than 0', 'error');
            return;
        }

        const mortalityData = {
            id: mortalityId || Date.now(),
            date: date,
            quantity: quantity,
            cause: cause,
            age: age,
            notes: notes || ''
        };

        if (mortalityId) {
            this.updateMortality(mortalityId, mortalityData);
        } else {
            this.addMortality(mortalityData);
        }

        this.hideMortalityModal();
    },

    addMortality(mortalityData) {
        this.mortalityData.unshift(mortalityData);
        this.saveData();
        this.updateStats();
        this.updateMortalityTable();
        this.updateCauseSummary();
        this.showNotification('Mortality record saved successfully!', 'success');
    },

    editMortality(recordId) {
        const mortality = this.mortalityData.find(m => m.id == recordId);
        
        if (!mortality) {
            console.error('❌ Mortality not found:', recordId);
            return;
        }

        // Populate form fields
        document.getElementById('mortality-id').value = mortality.id;
        document.getElementById('mortality-date').value = mortality.date;
        document.getElementById('mortality-quantity').value = mortality.quantity;
        document.getElementById('mortality-cause').value = mortality.cause;
        document.getElementById('mortality-age').value = mortality.age || '';
        document.getElementById('mortality-notes').value = mortality.notes || '';
        document.getElementById('delete-mortality').style.display = 'block';
        document.getElementById('mortality-modal-title').textContent = 'Edit Mortality Record';
        
        this.showMortalityModal();
    },

    updateMortality(mortalityId, mortalityData) {
        const mortalityIndex = this.mortalityData.findIndex(m => m.id == mortalityId);
        
        if (mortalityIndex !== -1) {
            this.mortalityData[mortalityIndex] = {
                ...this.mortalityData[mortalityIndex],
                ...mortalityData
            };
            
            this.saveData();
            this.updateStats();
            this.updateMortalityTable();
            this.updateCauseSummary();
            this.showNotification('Mortality record updated successfully!', 'success');
        }
    },

    deleteMortality() {
        const mortalityId = document.getElementById('mortality-id').value;
        
        if (confirm('Are you sure you want to delete this mortality record?')) {
            this.deleteMortalityRecord(mortalityId);
            this.hideMortalityModal();
        }
    },

    deleteMortalityRecord(mortalityId) {
        if (confirm('Are you sure you want to delete this mortality record?')) {
            this.mortalityData = this.mortalityData.filter(m => m.id != mortalityId);
            
            this.saveData();
            this.updateStats();
            this.updateMortalityTable();
            this.updateCauseSummary();
            this.showNotification('Mortality record deleted successfully', 'success');
        }
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
            const weeklyStock = this.getCurrentStock();
            const rate = weeklyStock > 0 ? ((losses / weeklyStock) * 100).toFixed(2) : '0.00';

            weeks.push({ week: weekStr, losses, rate });
        }
        return weeks;
    },

    getRecommendationLevel(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) return '#fef2f2';
        if (mortalityRate > 5) return '#fef3c7';
        if (causeDistribution.disease > 0) return '#eff6ff';
        return '#f0fdf4';
    },

    getRecommendationColor(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) return '#dc2626';
        if (mortalityRate > 5) return '#d97706';
        if (causeDistribution.disease > 0) return '#3b82f6';
        return '#16a34a';
    },

    getHealthRecommendations(mortalityRate, causeDistribution) {
        mortalityRate = parseFloat(mortalityRate);
        
        if (mortalityRate > 10) {
            return "⚠️ <strong>CRITICAL:</strong> Mortality rate is very high! Immediate veterinary consultation required. Isolate sick birds and review all management practices including feed quality, water supply, and environmental conditions.";
        } else if (mortalityRate > 5) {
            return "⚠️ <strong>WARNING:</strong> Elevated mortality rate detected. Monitor flock closely, check feed and water quality, ensure proper ventilation, and consider preventive measures. Review biosecurity protocols.";
        } else if (causeDistribution.disease > 0) {
            return "🦠 <strong>DISEASE DETECTED:</strong> Enhance biosecurity measures, consider vaccination program, monitor for symptoms in the flock, and maintain strict sanitation practices. Isolate affected birds immediately.";
        } else if (causeDistribution.predator > 0) {
            return "🦊 <strong>PREDATOR ACTIVITY:</strong> Strengthen coop security with reinforced fencing, install predator deterrents, conduct regular perimeter checks, and ensure proper nighttime enclosure.";
        } else if (causeDistribution['heat-stress'] > 0 || causeDistribution['cold-stress'] > 0) {
            return "🌡️ <strong>ENVIRONMENTAL STRESS:</strong> Ensure adequate ventilation and temperature control, provide fresh water, adjust feeding schedules, and provide appropriate shelter from extreme weather.";
        } else {
            return "✅ <strong>EXCELLENT FLOCK HEALTH:</strong> Maintain current management practices, continue regular monitoring, ensure proper nutrition, and keep up with preventive care and biosecurity measures.";
        }
    },

    getCausePrevention(cause) {
        const preventions = {
            'natural': 'Monitor aging flock, provide comfortable environment, ensure proper nutrition for older birds.',
            'disease': 'Implement strict biosecurity, vaccination program, regular health checks, immediate isolation of sick birds.',
            'predator': 'Reinforce coop security, install motion-activated lights, use predator-proof fencing, regular perimeter checks.',
            'heat-stress': 'Ensure adequate ventilation, provide cool fresh water, install misting systems, provide shade structures.',
            'cold-stress': 'Provide adequate insulation, ensure dry bedding, protect from drafts, consider supplemental heating.',
            'nutritional': 'Review feed quality and formulation, ensure proper feeding schedules, provide balanced nutrition.',
            'other': 'Investigate specific causes, document patterns, consult with veterinarian for unusual cases.'
        };
        return preventions[cause] || 'Monitor and document all cases for pattern recognition.';
    },

    getPreventiveActions(causeDistribution) {
        const actions = [];
        
        if (causeDistribution.disease > 0) {
            actions.push("🦠 <strong>Disease Prevention:</strong> Implement strict biosecurity, vaccination program, regular health checks, and immediate isolation of sick birds.");
        }
        
        if (causeDistribution.predator > 0) {
            actions.push("🦊 <strong>Predator Control:</strong> Reinforce coop security, install motion-activated lights, use predator-proof fencing, and conduct regular perimeter checks.");
        }
        
        if (causeDistribution['heat-stress'] > 0) {
            actions.push("🔥 <strong>Heat Stress Management:</strong> Ensure adequate ventilation, provide cool fresh water, install misting systems, and provide shade structures.");
        }
        
        if (causeDistribution['cold-stress'] > 0) {
            actions.push("❄️ <strong>Cold Stress Protection:</strong> Provide adequate insulation, ensure dry bedding, protect from drafts, and consider supplemental heating in extreme cold.");
        }
        
        if (causeDistribution.nutritional > 0) {
            actions.push("🍽️ <strong>Nutritional Management:</strong> Review feed quality and formulation, ensure proper feeding schedules, provide balanced nutrition, and monitor feed consumption.");
        }

        if (actions.length === 0) {
            actions.push("✅ <strong>General Best Practices:</strong> Continue regular health monitoring, maintain clean environment, provide balanced nutrition, and follow biosecurity protocols.");
        }

        return actions.join('<br><br>');
    },

    updateMortalityTable() {
        const periodFilter = document.getElementById('mortality-filter');
        const filter = periodFilter ? periodFilter.value : 'all';
        console.log('🔄 Updating mortality table with filter:', filter);
        
        // Update the table HTML
        document.getElementById('mortality-table').innerHTML = this.renderMortalityTable(filter);
        
        // Re-attach event listeners after table is updated
        this.setupTableClickHandler();
    },

   updateCauseSummary() {
    const causeSummaryElement = document.getElementById('cause-summary');
    if (causeSummaryElement) {
        causeSummaryElement.innerHTML = this.renderCauseSummary();
    }
},

    convertToCSV(mortality) {
        const headers = ['Date', 'Cause', 'Quantity', 'Age', 'Notes'];
        const rows = mortality.map(record => [
            record.date,
            this.formatCause(record.cause),
            record.quantity,
            record.age || '',
            record.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    // UTILITY METHODS
    getCauseIcon(cause) {
        const icons = {
            'natural': '🌿', 'disease': '🤒', 'predator': '🦊', 'accident': '⚠️',
            'heat-stress': '🔥', 'cold-stress': '❄️', 'nutritional': '🍽️', 'other': '❓'
        };
        return icons[cause] || '❓';
    },

    getCauseColor(cause) {
        const colors = {
            'natural': '#10b981', // green
            'disease': '#ef4444', // red
            'predator': '#8b5cf6', // purple
            'accident': '#f59e0b', // amber
            'heat-stress': '#f97316', // orange
            'cold-stress': '#3b82f6', // blue
            'nutritional': '#84cc16', // lime
            'other': '#6b7280' // gray
        };
        return colors[cause] || '#6b7280';
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

    showNotification(message, type = 'info') {
        if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
            window.coreModule.showNotification(message, type);
        } else if (type === 'error') {
            console.error('❌ ' + message);
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.log('✅ ' + message);
            alert('✅ ' + message);
        } else if (type === 'warning') {
            console.warn('⚠️ ' + message);
            alert('⚠️ ' + message);
        } else {
            console.log('ℹ️ ' + message);
            alert('ℹ️ ' + message);
        }
    }
};

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'broiler-mortality'; // e.g., 'dashboard'
    const MODULE_OBJECT = BroilerMortalityModule; // e.g., DashboardModule
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
