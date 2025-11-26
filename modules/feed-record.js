// modules/feed-record.js - Enhanced Feed Management
console.log('🌾 Loading enhanced feed records module...');

class FeedRecordModule {
    constructor() {
        this.moduleId = 'feed-record';
        this.moduleName = 'Feed Management';
        this.feedRecords = [];
        this.filter = 'all';
        this.selectedBatch = 'all';
        this.currentView = 'list';
        this.editingRecord = null;
        this.feedTypes = {
            'starter': { name: 'Starter Feed', protein: '20-22%', age: '0-3 weeks' },
            'grower': { name: 'Grower Feed', protein: '18-20%', age: '3-6 weeks' },
            'finisher': { name: 'Finisher Feed', protein: '16-18%', age: '6-8 weeks' },
            'layer': { name: 'Layer Feed', protein: '16-18%', age: '18+ weeks' },
            'broiler': { name: 'Broiler Feed', protein: '20-22%', age: 'All stages' },
            'organic': { name: 'Organic Feed', protein: '16-18%', age: 'All stages' },
            'custom': { name: 'Custom Mix', protein: 'Varies', age: 'Varies' }
        };
    }

    init() {
        console.log('🌾 Initializing enhanced feed management...');
        this.loadFeedRecords();
        this.setupDefaultData();
        return true;
    }

    setupDefaultData() {
        // Add sample data if no records exist
        if (this.feedRecords.length === 0) {
            const sampleRecords = [
                {
                    id: 'sample-1',
                    type: 'purchase',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    batch: 'Broiler Batch A',
                    feedType: 'starter',
                    quantity: 500,
                    unitCost: 0.85,
                    notes: 'Initial stock purchase',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'sample-2',
                    type: 'usage',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    batch: 'Broiler Batch A',
                    feedType: 'starter',
                    quantity: 45,
                    unitCost: 0,
                    notes: 'Daily feeding',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.feedRecords.push(...sampleRecords);
            this.saveFeedRecords();
        }
    }

    render(container) {
        console.log('🎨 Rendering enhanced feed management interface...');
        
        container.innerHTML = this.getModuleHTML();
        this.attachEventListeners();
        this.renderFeedRecords();
        this.updateFeedSummary();
        this.updateBatchFilter();
        this.animateContent();
        
        // Initialize charts if needed
        if (this.currentView === 'chart') {
            setTimeout(() => this.renderFeedChart(), 500);
        }
    }

    getModuleHTML() {
        return `
            <div class="module-container">
                <!-- Enhanced Header with Quick Stats -->
                <div class="module-header enhanced-header">
                    <div class="header-content">
                        <div class="header-badge">🌾 FEED MANAGEMENT</div>
                        <h1>Feed Tracking & Analytics</h1>
                        <p>Monitor consumption, costs, and inventory in real-time</p>
                    </div>
                    <div class="header-actions">
                        <div class="quick-stats">
                            <div class="quick-stat">
                                <span class="stat-label">Stock Level</span>
                                <span class="stat-value" id="quick-stock">0 kg</span>
                            </div>
                            <div class="quick-stat">
                                <span class="stat-label">Weekly Use</span>
                                <span class="stat-value" id="quick-usage">0 kg</span>
                            </div>
                        </div>
                        <button class="btn btn-primary with-icon" id="add-feed-record-btn">
                            <span class="btn-icon">📝</span>
                            Record Usage
                        </button>
                        <button class="btn btn-secondary with-icon" id="add-feed-purchase-btn">
                            <span class="btn-icon">📦</span>
                            Add Stock
                        </button>
                    </div>
                </div>

                <!-- Enhanced Summary Cards -->
                <div class="feed-summary enhanced-summary">
                    <div class="summary-card stock-card">
                        <div class="summary-header">
                            <div class="summary-icon">📊</div>
                            <div class="summary-trend" id="stock-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Current Inventory</div>
                            <div class="summary-value" id="current-stock">0 kg</div>
                            <div class="summary-subtext" id="stock-status">Loading...</div>
                        </div>
                    </div>
                    
                    <div class="summary-card usage-card">
                        <div class="summary-header">
                            <div class="summary-icon">⚡</div>
                            <div class="summary-trend" id="usage-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">7-Day Consumption</div>
                            <div class="summary-value" id="weekly-usage">0 kg</div>
                            <div class="summary-subtext" id="usage-comparison">vs last week</div>
                        </div>
                    </div>
                    
                    <div class="summary-card cost-card">
                        <div class="summary-header">
                            <div class="summary-icon">💰</div>
                            <div class="summary-trend" id="cost-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Feed Cost</div>
                            <div class="summary-value" id="feed-cost">$0.00</div>
                            <div class="summary-subtext" id="cost-per-bird">$0.00/bird</div>
                        </div>
                    </div>
                    
                    <div class="summary-card efficiency-card">
                        <div class="summary-header">
                            <div class="summary-icon">📈</div>
                            <div class="summary-trend" id="efficiency-trend">→</div>
                        </div>
                        <div class="summary-content">
                            <div class="summary-label">Feed Efficiency</div>
                            <div class="summary-value" id="feed-efficiency">0.0</div>
                            <div class="summary-subtext">FCR (Feed Conversion Ratio)</div>
                        </div>
                    </div>
                </div>

                <!-- Smart Alerts Section -->
                <div class="alerts-container" id="alerts-container">
                    <!-- Alerts will be dynamically generated -->
                </div>

                <!-- Enhanced Controls -->
                <div class="feed-controls enhanced-controls">
                    <div class="control-group left-controls">
                        <div class="filter-group">
                            <label>Batch Filter</label>
                            <select id="batch-filter" class="enhanced-select">
                                <option value="all">All Batches</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Time Period</label>
                            <select id="time-filter" class="enhanced-select">
                                <option value="today">Today</option>
                                <option value="week" selected>This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Feed Type</label>
                            <select id="feed-type-filter" class="enhanced-select">
                                <option value="all">All Types</option>
                                ${Object.entries(this.feedTypes).map(([key, type]) => 
                                    `<option value="${key}">${type.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="control-group right-controls">
                        <div class="search-box">
                            <input type="text" id="feed-search" placeholder="Search records..." class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        <div class="view-toggle enhanced-toggle">
                            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
                                <span class="btn-icon">📋</span>
                                List
                            </button>
                            <button class="view-btn ${this.currentView === 'chart' ? 'active' : ''}" data-view="chart">
                                <span class="btn-icon">📊</span>
                                Analytics
                            </button>
                            <button class="view-btn" data-view="insights">
                                <span class="btn-icon">💡</span>
                                Insights
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="feed-content enhanced-content">
                    <!-- List View -->
                    <div class="content-view ${this.currentView === 'list' ? 'active' : ''}" id="list-view">
                        <div class="records-table enhanced-table">
                            <div class="table-header sticky-header">
                                <div class="table-row">
                                    <div class="table-cell">Date</div>
                                    <div class="table-cell">Type</div>
                                    <div class="table-cell">Batch</div>
                                    <div class="table-cell">Feed Details</div>
                                    <div class="table-cell">Quantity</div>
                                    <div class="table-cell">Cost</div>
                                    <div class="table-cell">Status</div>
                                    <div class="table-cell actions-cell">Actions</div>
                                </div>
                            </div>
                            <div class="table-body" id="feed-records-table">
                                <!-- Records will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chart View -->
                    <div class="content-view ${this.currentView === 'chart' ? 'active' : ''}" id="chart-view">
                        <div class="charts-grid">
                            <div class="chart-card full-width">
                                <div class="chart-header">
                                    <h4>Feed Consumption Trend</h4>
                                    <select id="chart-period" class="chart-control">
                                        <option value="7">Last 7 Days</option>
                                        <option value="30">Last 30 Days</option>
                                        <option value="90">Last 90 Days</option>
                                    </select>
                                </div>
                                <div class="chart-container">
                                    <canvas id="consumption-trend-chart"></canvas>
                                </div>
                            </div>
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h4>Feed Type Distribution</h4>
                                </div>
                                <div class="chart-container">
                                    <canvas id="feed-type-chart"></canvas>
                                </div>
                            </div>
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h4>Cost Analysis</h4>
                                </div>
                                <div class="chart-container">
                                    <canvas id="cost-analysis-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Insights View -->
                    <div class="content-view" id="insights-view">
                        <div class="insights-grid">
                            <div class="insight-card">
                                <div class="insight-icon">💡</div>
                                <h4>Optimization Tips</h4>
                                <div class="insight-content" id="optimization-tips">
                                    <!-- Tips will be generated dynamically -->
                                </div>
                            </div>
                            <div class="insight-card">
                                <div class="insight-icon">📋</div>
                                <h4>Feed Schedule</h4>
                                <div class="insight-content" id="feed-schedule">
                                    <!-- Schedule will be generated dynamically -->
                                </div>
                            </div>
                            <div class="insight-card">
                                <div class="insight-icon">🎯</div>
                                <h4>Performance Metrics</h4>
                                <div class="insight-content" id="performance-metrics">
                                    <!-- Metrics will be generated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Action Footer -->
                <div class="quick-actions-footer">
                    <button class="quick-action" data-action="quick-usage">
                        <span class="action-icon">⚡</span>
                        Quick Usage
                    </button>
                    <button class="quick-action" data-action="inventory-check">
                        <span class="action-icon">📦</span>
                        Check Stock
                    </button>
                    <button class="quick-action" data-action="generate-report">
                        <span class="action-icon">📄</span>
                        Export Report
                    </button>
                </div>
            </div>

            <!-- Enhanced Feed Record Modal -->
            <div class="modal-overlay enhanced-modal hidden" id="feed-record-modal">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h3 id="feed-modal-title">Record Feed Activity</h3>
                        <button class="modal-close" id="feed-modal-close">×</button>
                    </div>
                    <form class="modal-form enhanced-form" id="feed-record-form">
                        <input type="hidden" id="record-id">
                        
                        <div class="form-section">
                            <h4>Basic Information</h4>
                            <div class="form-grid triple">
                                <div class="form-group">
                                    <label for="record-type">Activity Type *</label>
                                    <select id="record-type" required class="enhanced-select">
                                        <option value="usage">📝 Feed Usage</option>
                                        <option value="purchase">📦 Feed Purchase</option>
                                        <option value="adjustment">⚖️ Stock Adjustment</option>
                                        <option value="waste">🗑️ Feed Waste</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="record-date">Date *</label>
                                    <input type="date" id="record-date" required class="enhanced-input">
                                </div>
                                <div class="form-group">
                                    <label for="batch-name">Batch/Group *</label>
                                    <input type="text" id="batch-name" required 
                                           list="batch-suggestions"
                                           placeholder="e.g., Broiler Batch A, Layers Group 1"
                                           class="enhanced-input">
                                    <datalist id="batch-suggestions"></datalist>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Feed Details</h4>
                            <div class="form-grid triple">
                                <div class="form-group">
                                    <label for="feed-type">Feed Type *</label>
                                    <select id="feed-type" required class="enhanced-select">
                                        <option value="">Select feed type...</option>
                                        ${Object.entries(this.feedTypes).map(([key, type]) => 
                                            `<option value="${key}" data-protein="${type.protein}" data-age="${type.age}">
                                                ${type.name} (${type.protein})
                                            </option>`
                                        ).join('')}
                                    </select>
                                    <div class="field-info" id="feed-type-info"></div>
                                </div>
                                <div class="form-group">
                                    <label for="quantity">Quantity (kg) *</label>
                                    <input type="number" id="quantity" required 
                                           step="0.1" min="0.1" placeholder="0.0"
                                           class="enhanced-input">
                                </div>
                                <div class="form-group">
                                    <label for="unit-cost">Cost per kg ($)</label>
                                    <input type="number" id="unit-cost" step="0.001" 
                                           min="0" placeholder="0.000"
                                           class="enhanced-input">
                                </div>
                            </div>
                        </div>

                        <div class="form-section" id="additional-fields">
                            <!-- Additional fields based on record type -->
                        </div>

                        <div class="form-section">
                            <label for="feed-notes">Notes & Observations</label>
                            <textarea id="feed-notes" rows="3" 
                                      placeholder="Any additional information, observations, or special instructions..."
                                      class="enhanced-textarea"></textarea>
                        </div>

                        <div class="form-preview" id="form-preview">
                            <!-- Preview of the record will be shown here -->
                        </div>

                        <div class="form-actions enhanced-actions">
                            <button type="button" class="btn btn-secondary" id="feed-cancel-btn">
                                Cancel
                            </button>
                            <div class="action-group">
                                <button type="button" class="btn btn-outline" id="save-draft-btn">
                                    Save Draft
                                </button>
                                <button type="submit" class="btn btn-primary with-icon">
                                    <span class="btn-icon">💾</span>
                                    Save Record
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Quick Usage Modal -->
            <div class="modal-overlay quick-modal hidden" id="quick-usage-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Quick Feed Usage</h3>
                        <button class="modal-close" id="quick-modal-close">×</button>
                    </div>
                    <div class="quick-form" id="quick-usage-form">
                        <!-- Quick form will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Action buttons
        document.getElementById('add-feed-record-btn').addEventListener('click', () => {
            this.showFeedModal('usage');
        });

        document.getElementById('add-feed-purchase-btn').addEventListener('click', () => {
            this.showFeedModal('purchase');
        });

        // Enhanced filters
        document.getElementById('batch-filter').addEventListener('change', (e) => {
            this.selectedBatch = e.target.value;
            this.renderFeedRecords();
            this.updateFeedSummary();
        });

        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderFeedRecords();
            this.updateFeedSummary();
        });

        document.getElementById('feed-type-filter').addEventListener('change', () => {
            this.renderFeedRecords();
        });

        // Search functionality
        document.getElementById('feed-search').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.currentTarget.dataset.action);
            });
        });

        // Chart controls
        const chartPeriod = document.getElementById('chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.renderFeedChart();
            });
        }

        // Modal events
        this.setupModalEvents();
        this.setupQuickModalEvents();
    }

    setupModalEvents() {
        const modal = document.getElementById('feed-record-modal');
        const form = document.getElementById('feed-record-form');
        const closeBtn = document.getElementById('feed-modal-close');
        const cancelBtn = document.getElementById('feed-cancel-btn');
        const recordType = document.getElementById('record-type');
        const feedType = document.getElementById('feed-type');
        const quantity = document.getElementById('quantity');
        const unitCost = document.getElementById('unit-cost');

        // Close events
        closeBtn.addEventListener('click', () => this.hideFeedModal());
        cancelBtn.addEventListener('click', () => this.hideFeedModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideFeedModal();
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFeedRecord();
        });

        // Dynamic form updates
        recordType.addEventListener('change', (e) => {
            this.updateModalForType(e.target.value);
            this.updateFormPreview();
        });

        feedType.addEventListener('change', (e) => {
            this.updateFeedTypeInfo(e.target.value);
            this.updateFormPreview();
        });

        quantity.addEventListener('input', () => this.updateFormPreview());
        unitCost.addEventListener('input', () => this.updateFormPreview());

        // Set default date
        document.getElementById('record-date').value = new Date().toISOString().split('T')[0];

        // Load batch suggestions
        this.updateBatchSuggestions();
    }

    setupQuickModalEvents() {
        const modal = document.getElementById('quick-usage-modal');
        const closeBtn = document.getElementById('quick-modal-close');

        closeBtn.addEventListener('click', () => this.hideQuickModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideQuickModal();
        });
    }

    showFeedModal(type = 'usage', record = null) {
        const modal = document.getElementById('feed-record-modal');
        const title = document.getElementById('feed-modal-title');
        const form = document.getElementById('feed-record-form');
        const recordType = document.getElementById('record-type');

        this.editingRecord = record;

        if (record) {
            title.textContent = 'Edit Feed Record';
            this.populateFeedForm(record);
        } else {
            title.textContent = this.getModalTitle(type);
            form.reset();
            recordType.value = type;
            document.getElementById('record-date').value = new Date().toISOString().split('T')[0];
        }

        this.updateModalForType(type);
        this.updateFormPreview();
        modal.classList.remove('hidden');
        
        // Focus on first field
        setTimeout(() => {
            document.getElementById('batch-name').focus();
        }, 100);
    }

    getModalTitle(type) {
        const titles = {
            'usage': '📝 Record Feed Usage',
            'purchase': '📦 Add Feed Purchase',
            'adjustment': '⚖️ Stock Adjustment',
            'waste': '🗑️ Record Feed Waste'
        };
        return titles[type] || 'Record Feed Activity';
    }

    updateModalForType(type) {
        const additionalFields = document.getElementById('additional-fields');
        const unitCostField = document.getElementById('unit-cost').closest('.form-group');

        switch (type) {
            case 'purchase':
                unitCostField.style.display = 'block';
                additionalFields.innerHTML = `
                    <h4>Purchase Details</h4>
                    <div class="form-grid double">
                        <div class="form-group">
                            <label for="supplier">Supplier</label>
                            <input type="text" id="supplier" placeholder="Supplier name" class="enhanced-input">
                        </div>
                        <div class="form-group">
                            <label for="delivery-date">Delivery Date</label>
                            <input type="date" id="delivery-date" class="enhanced-input">
                        </div>
                    </div>
                `;
                break;

            case 'usage':
                unitCostField.style.display = 'none';
                additionalFields.innerHTML = `
                    <h4>Usage Details</h4>
                    <div class="form-grid double">
                        <div class="form-group">
                            <label for="feeding-time">Feeding Time</label>
                            <select id="feeding-time" class="enhanced-select">
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                                <option value="full-day">Full Day</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="birds-count">Number of Birds</label>
                            <input type="number" id="birds-count" placeholder="Approximate count" class="enhanced-input">
                        </div>
                    </div>
                `;
                break;

            case 'waste':
                unitCostField.style.display = 'none';
                additionalFields.innerHTML = `
                    <h4>Waste Details</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="waste-reason">Reason for Waste</label>
                            <select id="waste-reason" class="enhanced-select">
                                <option value="spoilage">Spoilage</option>
                                <option value="contamination">Contamination</option>
                                <option value="overfeeding">Overfeeding</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                `;
                break;

            default:
                unitCostField.style.display = 'block';
                additionalFields.innerHTML = '';
        }

        // Set delivery date to today for purchases
        if (type === 'purchase') {
            const deliveryDate = document.getElementById('delivery-date');
            if (deliveryDate && !deliveryDate.value) {
                deliveryDate.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    updateFeedTypeInfo(feedType) {
        const infoElement = document.getElementById('feed-type-info');
        if (this.feedTypes[feedType]) {
            const type = this.feedTypes[feedType];
            infoElement.innerHTML = `
                <span class="info-badge">Protein: ${type.protein}</span>
                <span class="info-badge">Age: ${type.age}</span>
            `;
            infoElement.style.display = 'block';
        } else {
            infoElement.style.display = 'none';
        }
    }

    updateFormPreview() {
        const preview = document.getElementById('form-preview');
        const formData = new FormData(document.getElementById('feed-record-form'));
        
        const recordType = formData.get('record-type');
        const quantity = parseFloat(formData.get('quantity') || 0);
        const unitCost = parseFloat(formData.get('unit-cost') || 0);
        const feedType = formData.get('feed-type');
        
        if (quantity > 0 && feedType) {
            const feedTypeName = this.feedTypes[feedType]?.name || feedType;
            const totalCost = quantity * unitCost;
            
            preview.innerHTML = `
                <div class="preview-header">Record Preview</div>
                <div class="preview-content">
                    <div class="preview-item">
                        <span class="preview-label">Activity:</span>
                        <span class="preview-value">${this.getModalTitle(recordType)}</span>
                    </div>
                    <div class="preview-item">
                        <span class="preview-label">Feed Type:</span>
                        <span class="preview-value">${feedTypeName}</span>
                    </div>
                    <div class="preview-item">
                        <span class="preview-label">Quantity:</span>
                        <span class="preview-value ${recordType === 'usage' || recordType === 'waste' ? 'negative' : 'positive'}">
                            ${recordType === 'usage' || recordType === 'waste' ? '-' : '+'}${quantity} kg
                        </span>
                    </div>
                    ${totalCost > 0 ? `
                    <div class="preview-item">
                        <span class="preview-label">Total Cost:</span>
                        <span class="preview-value">$${totalCost.toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    populateFeedForm(record) {
        document.getElementById('record-id').value = record.id;
        document.getElementById('record-type').value = record.type;
        document.getElementById('record-date').value = record.date;
        document.getElementById('batch-name').value = record.batch;
        document.getElementById('feed-type').value = record.feedType;
        document.getElementById('quantity').value = record.quantity;
        document.getElementById('unit-cost').value = record.unitCost || '';
        document.getElementById('feed-notes').value = record.notes || '';

        // Populate additional fields based on record type
        if (record.supplier) {
            document.getElementById('supplier').value = record.supplier;
        }
        if (record.deliveryDate) {
            document.getElementById('delivery-date').value = record.deliveryDate;
        }
        if (record.feedingTime) {
            document.getElementById('feeding-time').value = record.feedingTime;
        }
        if (record.birdsCount) {
            document.getElementById('birds-count').value = record.birdsCount;
        }
        if (record.wasteReason) {
            document.getElementById('waste-reason').value = record.wasteReason;
        }

        this.updateFeedTypeInfo(record.feedType);
    }

    hideFeedModal() {
        document.getElementById('feed-record-modal').classList.add('hidden');
        this.editingRecord = null;
    }

    saveFeedRecord() {
        const formData = new FormData(document.getElementById('feed-record-form'));
        const record = {
            id: this.editingRecord ? this.editingRecord.id : this.generateId(),
            type: formData.get('record-type'),
            date: formData.get('record-date'),
            batch: formData.get('batch-name'),
            feedType: formData.get('feed-type'),
            quantity: parseFloat(formData.get('quantity')),
            unitCost: parseFloat(formData.get('unit-cost')) || 0,
            notes: formData.get('feed-notes'),
            createdAt: this.editingRecord ? this.editingRecord.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Additional fields based on record type
        if (record.type === 'purchase') {
            record.supplier = formData.get('supplier');
            record.deliveryDate = formData.get('delivery-date');
        } else if (record.type === 'usage') {
            record.feedingTime = formData.get('feeding-time');
            record.birdsCount = parseInt(formData.get('birds-count')) || 0;
        } else if (record.type === 'waste') {
            record.wasteReason = formData.get('waste-reason');
        }

        if (this.editingRecord) {
            // Update existing record
            const index = this.feedRecords.findIndex(r => r.id === this.editingRecord.id);
            if (index !== -1) {
                this.feedRecords[index] = { ...this.feedRecords[index], ...record };
            }
        } else {
            // Add new record
            this.feedRecords.unshift(record);
        }

        this.saveFeedRecords();
        this.renderFeedRecords();
        this.updateFeedSummary();
        this.updateBatchFilter();
        this.updateAlerts();
        this.hideFeedModal();

        this.showNotification(
            `Feed record ${this.editingRecord ? 'updated' : 'added'} successfully`,
            'success'
        );
    }

    deleteFeedRecord(id) {
        if (confirm('Are you sure you want to delete this feed record? This action cannot be undone.')) {
            this.feedRecords = this.feedRecords.filter(record => record.id !== id);
            this.saveFeedRecords();
            this.renderFeedRecords();
            this.updateFeedSummary();
            this.updateBatchFilter();
            this.updateAlerts();
            this.showNotification('Feed record deleted successfully', 'success');
        }
    }

    renderFeedRecords() {
        const container = document.getElementById('feed-records-table');
        if (!container) return;

        let filteredRecords = this.getFilteredRecords();

        if (filteredRecords.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        container.innerHTML = filteredRecords.map(record => this.getRecordHTML(record)).join('');

        // Add event listeners for action buttons
        this.attachRecordEventListeners();
    }

    getFilteredRecords() {
        let filteredRecords = [...this.feedRecords];

        // Apply batch filter
        if (this.selectedBatch && this.selectedBatch !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.batch === this.selectedBatch);
        }

        // Apply time filter
        filteredRecords = this.applyTimeFilter(filteredRecords);

        // Apply feed type filter
        const feedTypeFilter = document.getElementById('feed-type-filter').value;
        if (feedTypeFilter && feedTypeFilter !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.feedType === feedTypeFilter);
        }

        return filteredRecords;
    }

    applyTimeFilter(records) {
        const now = new Date();
        switch (this.filter) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                return records.filter(record => record.date === today);
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return records.filter(record => new Date(record.date) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return records.filter(record => new Date(record.date) >= monthAgo);
            case 'quarter':
                const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                return records.filter(record => new Date(record.date) >= quarterAgo);
            default:
                return records;
        }
    }

    getEmptyStateHTML() {
        return `
            <div class="table-row empty-row">
                <div class="table-cell" colspan="8">
                    <div class="empty-state enhanced-empty">
                        <div class="empty-icon">🌾</div>
                        <h4>No Feed Records Found</h4>
                        <p>Get started by recording your first feed activity</p>
                        <button class="btn btn-primary" onclick="feedRecordModule.showFeedModal('usage')">
                            Record First Usage
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getRecordHTML(record) {
        const feedTypeInfo = this.feedTypes[record.feedType];
        const feedTypeName = feedTypeInfo ? feedTypeInfo.name : record.feedType;
        const totalCost = record.quantity * record.unitCost;
        const isNegative = record.type === 'usage' || record.type === 'waste';

        return `
            <div class="table-row record-${record.type}" data-id="${record.id}">
                <div class="table-cell">
                    <div class="date-display">
                        <div class="date-main">${this.formatDate(record.date)}</div>
                        <div class="date-sub">${this.formatTime(record.createdAt)}</div>
                    </div>
                </div>
                <div class="table-cell">
                    <span class="type-badge type-${record.type}">
                        ${this.getTypeIcon(record.type)} ${record.type}
                    </span>
                </div>
                <div class="table-cell">
                    <div class="batch-info">
                        <div class="batch-name">${record.batch}</div>
                        ${record.birdsCount ? `<div class="batch-meta">${record.birdsCount} birds</div>` : ''}
                    </div>
                </div>
                <div class="table-cell">
                    <div class="feed-details">
                        <div class="feed-type">${feedTypeName}</div>
                        ${feedTypeInfo ? `
                        <div class="feed-specs">
                            <span class="spec">${feedTypeInfo.protein}</span>
                            <span class="spec">${feedTypeInfo.age}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="table-cell">
                    <span class="quantity ${isNegative ? 'negative' : 'positive'}">
                        ${isNegative ? '-' : '+'}${record.quantity} kg
                    </span>
                </div>
                <div class="table-cell">
                    <div class="cost-display">
                        ${totalCost > 0 ? `
                        <div class="cost-main">$${totalCost.toFixed(2)}</div>
                        <div class="cost-sub">@ $${record.unitCost}/kg</div>
                        ` : '<div class="cost-main">-</div>'}
                    </div>
                </div>
                <div class="table-cell">
                    <span class="status-badge status-${this.getRecordStatus(record)}">
                        ${this.getRecordStatus(record)}
                    </span>
                </div>
                <div class
