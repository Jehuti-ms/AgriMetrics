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
        <style>
            /* ===== CAUSE SUMMARY STYLES ===== */
            .cause-summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .cause-item {
                padding: 20px;
                background: var(--glass-bg);
                border-radius: 16px;
                border: 1px solid var(--glass-border);
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            
            .cause-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
                border-color: var(--primary-color);
            }
            
            .cause-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--glass-border);
            }
            
            .cause-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .cause-title {
                font-weight: 600;
                font-size: 16px;
                color: var(--text-primary);
                flex-grow: 1;
            }
            
            .cause-stats {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
                flex-grow: 1;
            }
            
            .cause-stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
            }
            
            .cause-stat-label {
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .cause-stat-value {
                font-weight: 600;
                font-size: 14px;
                color: var(--text-primary);
            }
            
            .cause-stat-percentage {
                font-weight: 700;
                font-size: 16px;
                color: var(--primary-color);
            }
            
            /* ===== CAUSE ACTIONS (BUTTONS) ===== */
            .cause-actions {
                display: flex;
                gap: 10px;
                margin-top: auto; /* Pushes buttons to bottom */
                padding-top: 16px;
                border-top: 1px solid var(--glass-border);
            }
            
            .delete-cause-records {
                flex: 1;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid #ef4444;
                color: #ef4444;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                min-height: 40px;
            }
            
            .delete-cause-records:hover {
                background: #ef4444;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
            }
            
            .view-cause-details {
                flex: 1;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid #3b82f6;
                color: #3b82f6;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                min-height: 40px;
            }
            
            .view-cause-details:hover {
                background: #3b82f6;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            
            /* ===== MORTALITY TABLE BUTTONS ===== */
            .btn-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: none;
                border: none;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .edit-mortality:hover {
                background: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
            }
            
            .delete-mortality:hover {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            /* ===== QUICK ACTIONS ===== */
            .quick-action-btn {
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                border-radius: 16px;
                padding: 20px 16px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .quick-action-btn:hover {
                border-color: var(--primary-color);
                transform: translateY(-4px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }
            
            /* ===== MODERN MORTALITY CAUSE BUTTONS ===== */
            .mortality-cause-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
                margin: 20px 0;
            }
            
            .mortality-cause-btn {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #dee2e6;
                border-radius: 12px;
                padding: 16px 12px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .mortality-cause-btn:hover {
                transform: translateY(-2px);
                border-color: #6c757d;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            }
            
            .mortality-cause-btn.active {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-color: #2196f3;
                box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
            }
            
            .mortality-cause-btn.critical {
                background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                border-color: #f44336;
            }
            
            .mortality-cause-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .mortality-cause-label {
                font-weight: 600;
                color: #2d3436;
                font-size: 0.95rem;
            }
            
            .mortality-cause-percentage {
                font-weight: 700;
                font-size: 1rem;
                color: #2196f3;
            }
            
            .mortality-cause-btn.critical .mortality-cause-percentage {
                color: #f44336;
            }
            
            .mortality-cause-count {
                color: #6c757d;
                font-size: 0.85rem;
                margin-top: 4px;
            }
            
            .mortality-cause-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #2196f3, #4fc3f7);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }
            
            .mortality-cause-btn:hover::before {
                transform: scaleX(1);
            }
            
            .mortality-cause-btn.active::before {
                transform: scaleX(1);
            }
            
            /* ===== RESPONSIVE DESIGN ===== */
            @media (max-width: 768px) {
                .cause-summary-grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 16px;
                }
                
                .cause-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .delete-cause-records,
                .view-cause-details {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .cause-summary-grid {
                    grid-template-columns: 1fr;
                }
                
                .cause-item {
                    padding: 16px;
                }
            }
        </style>
        <div class="module-container">
            <!-- Module Header -->
            <div class="module-header">
                <h1 class="module-title">Broiler Health & Mortality</h1>
                <p class="module-subtitle">Monitor flock health and track losses</p>
            </div>

            <!-- Mortality Overview Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">😔</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-losses">0</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Total Losses</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="mortality-rate">0%</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Mortality Rate</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="current-birds">0</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Current Birds</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="records-count">0</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Records</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-action-grid">
                <button class="quick-action-btn" id="record-mortality-btn">
                    <div style="font-size: 32px;">📝</div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Loss</span>
                    <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Log bird losses and causes</span>
                </button>
                <button class="quick-action-btn" id="trend-analysis-btn">
                    <div style="font-size: 32px;">📊</div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Trend Analysis</span>
                    <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View mortality patterns</span>
                </button>
                <button class="quick-action-btn" id="cause-analysis-btn">
                    <div style="font-size: 32px;">🔍</div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Cause Analysis</span>
                    <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Analyze death causes</span>
                </button>
                <button class="quick-action-btn" id="health-report-btn">
                    <div style="font-size: 32px;">💡</div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Health Report</span>
                    <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Detailed health analysis</span>
                </button>
            </div>

            <!-- Quick Mortality Form -->
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📝 Quick Mortality Entry</h3>
                <form id="quick-mortality-form">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
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
                            <button type="submit" class="btn-primary" style="height: 42px;">Record Loss</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Recent Mortality Records -->
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--text-primary); font-size: 20px;">📊 Recent Mortality Records</h3>
                    <div style="display: flex; gap: 12px;">
                        <select id="mortality-filter" class="form-input" style="width: auto;">
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
            <div class="glass-card" style="padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">🔍 Mortality by Cause</h3>
                <div id="cause-summary">
                    ${this.renderCauseSummary()}
                </div>
            </div>
        </div>

        <!-- POPOUT MODALS - Added at the end to overlay content -->
        <!-- Mortality Record Modal -->
        <div id="mortality-modal" class="popout-modal hidden">
            <div class="popout-modal-content" style="max-width: 600px;">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="mortality-modal-title">Record Mortality</h3>
                    <button class="popout-modal-close" id="close-mortality-modal">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <form id="mortality-form">
                        <input type="hidden" id="mortality-id" value="">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label class="form-label">Date *</label>
                                <input type="date" id="mortality-date" class="form-input" required>
                            </div>
                            <div>
                                <label class="form-label">Number of Birds *</label>
                                <input type="number" id="mortality-quantity" class="form-input" min="1" required placeholder="0">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
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

                        <div style="margin-bottom: 16px;">
                            <label class="form-label">Observations & Notes</label>
                            <textarea id="mortality-notes" class="form-input" placeholder="Symptoms, location, time of discovery, environmental conditions..." rows="3"></textarea>
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
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="health-report-title">Health Report</h3>
                    <button class="popout-modal-close" id="close-health-report">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="health-report-content">
                        <!-- Report content will be inserted here -->
                    </div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-health-report">🖨️ Print</button>
                    <button class="btn-primary" id="close-health-report-btn">Close</button>
                </div>
            </div>
        </div>

        <!-- Trend Analysis Modal -->
        <div id="trend-analysis-modal" class="popout-modal hidden">
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="trend-analysis-title">Mortality Trend Analysis</h3>
                    <button class="popout-modal-close" id="close-trend-analysis">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="trend-analysis-content">
                        <!-- Trend analysis content will be inserted here -->
                    </div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-trend-analysis">🖨️ Print</button>
                    <button class="btn-primary" id="close-trend-analysis-btn">Close</button>
                </div>
            </div>
        </div>

        <!-- Cause Analysis Modal -->
        <div id="cause-analysis-modal" class="popout-modal hidden">
            <div class="popout-modal-content" style="max-width: 800px;">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="cause-analysis-title">Cause Analysis Report</h3>
                    <button class="popout-modal-close" id="close-cause-analysis">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="cause-analysis-content">
                        <!-- Cause analysis content will be inserted here -->
                    </div>
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
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😔</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No mortality records</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${filter === 'all' ? 'No losses recorded - great job!' : `No ${filter} mortality records`}</div>
                </div>
            `;
        }

        const sortedMortality = filteredMortality.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Cause</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Quantity</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Age</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Notes</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedMortality.map(record => {
                            const causeColor = this.getCauseColor(record.cause);
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">${this.getCauseIcon(record.cause)}</span>
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                                background: ${causeColor}20; color: ${causeColor};">
                                                ${this.formatCause(record.cause)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="font-weight: 600; color: #ef4444;">${record.quantity}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">birds</div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary);">${record.age ? record.age + ' days' : '-'}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${record.notes || '-'}</td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-mortality" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-mortality" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
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
                <div class="cause-item" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😊</div>
                    <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px;">No mortality by cause data</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record some mortality data to see cause analysis</div>
                </div>
            </div>
        `;
    }

     return `
        <div class="cause-summary-grid">
            ${causesWithData.map(cause => {
                const data = causeData[cause];
                const percentage = totalLosses > 0 ? Math.round((data.totalQuantity / totalLosses) * 100) : 0;
                const causeColor = this.getCauseColor(cause);
                
                 return `
                    <div class="cause-item" data-cause="${cause}">
                        <div class="cause-header">
                            <div class="cause-icon">${this.getCauseIcon(cause)}</div>
                            <div class="cause-title" style="color: ${causeColor};">${this.formatCause(cause)}</div>
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
                                <span class="cause-stat-percentage" style="color: ${causeColor};">${percentage}%</span>
                            </div>
                        </div>
                        
                        <!-- 🔥 FIXED BUTTON CONTAINER -->
                        <div class="cause-actions">
                            <button class="delete-cause-records" data-cause="${cause}" title="Delete all ${this.formatCause(cause)} records">
                                <span style="font-size: 14px;">🗑️</span>
                                <span>Delete All</span>
                            </button>
                            <button class="view-cause-details" data-cause="${cause}" title="View ${this.formatCause(cause)} details">
                                <span style="font-size: 14px;">🔍</span>
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
    console.log('🔍=== VIEW DETAILS FUNCTION START ===');
    console.log('Cause parameter:', cause);
    console.log('this context:', this);
    
    const causeName = this.formatCause(cause);
    const causeRecords = this.mortalityData.filter(record => record.cause === cause);
    
    console.log(`Found ${causeRecords.length} records for "${causeName}"`);
    
    if (causeRecords.length === 0) {
        this.showNotification(`No ${causeName} records found`, 'info');
        console.log('⚠️ No records found, showing notification');
        return;
    }
    
    // 1. Update the filter dropdown
    const filterSelect = document.getElementById('mortality-filter');
    console.log('Filter select element:', filterSelect);
    
    if (filterSelect) {
        // Map the cause to the filter value
        let filterValue = cause;
        if (cause === 'heat-stress' || cause === 'cold-stress') {
            filterValue = 'stress'; // The dropdown has "stress" for both heat and cold
        }
        
        console.log('Setting filter to:', filterValue);
        filterSelect.value = filterValue;
    } else {
        console.log('❌ Filter select not found!');
    }
    
    // 2. Update the mortality table
    const tableElement = document.getElementById('mortality-table');
    console.log('Table element:', tableElement);
    
    if (tableElement) {
        console.log('Updating table with filter:', cause);
        // Filter the table to show only this cause
        if (cause === 'heat-stress' || cause === 'cold-stress') {
            // Show all stress records
            tableElement.innerHTML = this.renderMortalityTable('stress');
        } else {
            // Show only this specific cause
            tableElement.innerHTML = this.renderMortalityTable(cause);
        }
        
        // Re-attach event listeners for edit/delete buttons
        this.setupTableClickHandler();
        console.log('✅ Table updated successfully');
    } else {
        console.log('❌ Table element not found!');
    }
    
    // 3. Show notification
    this.showNotification(`Showing ${causeRecords.length} ${causeName} records`, 'info');
    
    // 4. Scroll to the mortality table (optional, but nice UX)
    setTimeout(() => {
        const tableSection = document.querySelector('.glass-card:has(#mortality-table)');
        console.log('Table section for scrolling:', tableSection);
        
        if (tableSection) {
            tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add visual highlight
            tableSection.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            tableSection.style.transition = 'box-shadow 0.3s ease';
            
            setTimeout(() => {
                tableSection.style.boxShadow = '';
            }, 2000);
        }
    }, 300);
    
    console.log('✅=== VIEW DETAILS FUNCTION END ===');
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

    // REPORT METHODS
    generateHealthReport() {
        const stats = this.calculateDetailedStats();
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">😔 Flock Health & Mortality Report</h4>';
        
        // Summary Section
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📊 FLOCK HEALTH SUMMARY:</h5>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Current Stock</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.currentStock}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Losses</div>
                    <div style="font-size: 18px; font-weight: bold; color: #ef4444;">${stats.totalLosses}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Mortality Rate</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${parseFloat(stats.mortalityRate) > 5 ? '#ef4444' : parseFloat(stats.mortalityRate) > 2 ? '#f59e0b' : '#22c55e'};">${stats.mortalityRate}%</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Records</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.recordsCount}</div>
                </div>
            </div>
        </div>`;
        
        // Cause Distribution
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">🔍 MORTALITY BY CAUSE:</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">`;
        
        Object.entries(stats.causeDistribution).forEach(([cause, quantity]) => {
            const percentage = stats.totalLosses > 0 ? Math.round((quantity / stats.totalLosses) * 100) : 0;
            const causeColor = this.getCauseColor(cause);
            
            report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${causeColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">${this.getCauseIcon(cause)}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${this.formatCause(cause)}</span>
                    </div>
                    <span style="font-weight: 600; color: var(--text-primary);">${quantity} birds</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex-grow: 1; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: ${causeColor}; border-radius: 4px;"></div>
                    </div>
                    <span style="font-size: 12px; color: var(--text-secondary);">${percentage}%</span>
                </div>
            </div>`;
        });
        report += '</div></div>';
        
        // Health Recommendations
        report += `<div style="margin-bottom: 20px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">💡 HEALTH RECOMMENDATIONS:</h5>
            <div style="padding: 16px; background: ${this.getRecommendationLevel(stats.mortalityRate, stats.causeDistribution)}; border-radius: 8px; border-left: 4px solid ${this.getRecommendationColor(stats.mortalityRate, stats.causeDistribution)};">
                ${this.getHealthRecommendations(stats.mortalityRate, stats.causeDistribution)}
            </div>
        </div>`;
        
        // Recent Activity
        const recentMortality = this.mortalityData.slice(0, 5);
        if (recentMortality.length > 0) {
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📋 RECENT MORTALITY ACTIVITY (Last 5):</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            
            recentMortality.forEach(record => {
                const causeColor = this.getCauseColor(record.cause);
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${causeColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatDate(record.date)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                <span style="display: inline-flex; align-items: center; gap: 4px;">
                                    ${this.getCauseIcon(record.cause)} ${this.formatCause(record.cause)}
                                </span>
                                ${record.age ? ` • ${record.age} days old` : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: #ef4444;">${record.quantity} birds</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${record.notes ? 'Has notes' : 'No notes'}</div>
                        </div>
                    </div>
                </div>`;
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
        analysis += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📈 Mortality Trend Analysis</h4>';
        
        if (weeklyTrends.length === 0) {
            analysis += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <h5 style="color: #374151; margin-bottom: 8px;">Not enough data</h5>
                <p style="color: var(--text-secondary);">Need more mortality records to analyze trends</p>
            </div>`;
        } else {
            // Weekly Trends
            analysis += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📅 WEEKLY MORTALITY TRENDS:</h5>
                <div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            weeklyTrends.forEach((week, index) => {
                const trendColor = week.rate > 5 ? '#ef4444' : week.rate > 2 ? '#f59e0b' : '#22c55e';
                const trendIcon = week.rate > 5 ? '📈⚠️' : week.rate > 2 ? '📈' : '📉✅';
                
                analysis += `<div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid ${trendColor}20;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary);">Week ${index + 1}</span>
                        <span style="font-size: 18px;">${trendIcon}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Losses</div>
                            <div style="font-size: 18px; font-weight: bold; color: #ef4444;">${week.losses}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">birds</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Rate</div>
                            <div style="font-size: 18px; font-weight: bold; color: ${trendColor};">${week.rate}%</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">of flock</div>
                        </div>
                    </div>
                </div>`;
            });
            analysis += '</div></div>';
            
            // Recommendations
            const latestWeek = weeklyTrends[weeklyTrends.length - 1];
            const previousWeek = weeklyTrends.length > 1 ? weeklyTrends[weeklyTrends.length - 2] : null;
            
            if (previousWeek && latestWeek.rate > 0) {
                const change = ((latestWeek.rate - previousWeek.rate) / previousWeek.rate * 100).toFixed(1);
                
                analysis += `<div style="margin-bottom: 20px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">💡 TREND INSIGHTS:</h5>
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${parseFloat(change) >= 0 ? '#ef4444' : '#22c55e'};">`;
                
                if (parseFloat(change) > 10) {
                    analysis += `<div style="color: #ef4444; font-weight: 600; margin-bottom: 8px;">🚨 CRITICAL: Mortality rate increased by ${change}%</div>
                    <div style="color: #374151; font-size: 14px;">
                        <p>⚠️ Immediate action required:</p>
                        <ul style="margin-left: 20px; margin-top: 8px;">
                            <li>Consult with veterinarian immediately</li>
                            <li>Review feed quality and water supply</li>
                            <li>Check environmental conditions (temperature, ventilation)</li>
                            <li>Consider isolating affected birds</li>
                        </ul>
                    </div>`;
                } else if (parseFloat(change) > 0) {
                    analysis += `<div style="color: #f59e0b; font-weight: 600; margin-bottom: 8px;">⚠️ WARNING: Mortality rate increased by ${change}%</div>
                    <div style="color: #374151; font-size: 14px;">
                        <p>Monitor closely and consider:</p>
                        <ul style="margin-left: 20px; margin-top: 8px;">
                            <li>Review biosecurity measures</li>
                            <li>Check flock health more frequently</li>
                            <li>Ensure proper nutrition and water quality</li>
                            <li>Monitor environmental stressors</li>
                        </ul>
                    </div>`;
                } else if (parseFloat(change) < 0) {
                    analysis += `<div style="color: #22c55e; font-weight: 600; margin-bottom: 8px;">✅ GOOD NEWS: Mortality rate decreased by ${Math.abs(change)}%</div>
                    <div style="color: #374151; font-size: 14px;">
                        <p>Current management practices are effective. Continue to:</p>
                        <ul style="margin-left: 20px; margin-top: 8px;">
                            <li>Maintain current health protocols</li>
                            <li>Continue regular monitoring</li>
                            <li>Keep up with preventive care</li>
                            <li>Monitor for any new issues</li>
                        </ul>
                    </div>`;
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
        analysis += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">🔍 Mortality Cause Analysis</h4>';
        
        if (Object.keys(stats.causeDistribution).length === 0) {
            analysis += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <h5 style="color: #374151; margin-bottom: 8px;">No mortality data</h5>
                <p style="color: var(--text-secondary);">Record some mortality data to analyze causes</p>
            </div>`;
        } else {
            // Detailed cause analysis
            analysis += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📊 DETAILED CAUSE BREAKDOWN:</h5>
                <div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            Object.entries(stats.causeDistribution).forEach(([cause, quantity]) => {
                const percentage = stats.totalLosses > 0 ? ((quantity / stats.totalLosses) * 100).toFixed(1) : 0;
                const causeColor = this.getCauseColor(cause);
                
                analysis += `<div style="padding: 16px; background: ${causeColor}10; border-radius: 8px; border-left: 4px solid ${causeColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${this.getCauseIcon(cause)}</span>
                            <span style="font-weight: 600; color: ${causeColor};">${this.formatCause(cause)}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: ${causeColor}; font-size: 18px;">${quantity} birds</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${percentage}% of total</div>
                        </div>
                    </div>
                    <div style="background: var(--glass-bg); border-radius: 6px; padding: 12px; margin-top: 8px;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">💡 Prevention Recommendations:</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">
                            ${this.getCausePrevention(cause)}
                        </div>
                    </div>
                </div>`;
            });
            analysis += '</div></div>';
            
            // Top causes
            const topCauses = Object.entries(stats.causeDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            if (topCauses.length > 0) {
                analysis += `<div style="margin-bottom: 20px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">🏆 TOP 3 CAUSES OF MORTALITY:</h5>
                    <div style="display: flex; flex-direction: column; gap: 8px;">`;
                
                topCauses.forEach(([cause, quantity], index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                    const percentage = ((quantity / stats.totalLosses) * 100).toFixed(1);
                    const causeColor = this.getCauseColor(cause);
                    
                    analysis += `<div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px;">${medal}</div>
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatCause(cause)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${quantity} birds (${percentage}%)</div>
                        </div>
                        <div style="font-size: 24px; color: ${causeColor};">${this.getCauseIcon(cause)}</div>
                    </div>`;
                });
                analysis += '</div></div>';
            }
            
            // Preventive actions
            analysis += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">🛡️ PREVENTIVE ACTION PLAN:</h5>
                <div style="padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    ${this.getPreventiveActions(stats.causeDistribution)}
                </div>
            </div>`;
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
