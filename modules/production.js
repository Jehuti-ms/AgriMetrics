// modules/production-records.js
FarmModules.registerModule('production-records', {
    name: 'Production Records',
    icon: '🌱',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Production Records</h1>
                <p>Track crop yields, livestock production, and processing activities</p>
                <div class="header-actions">
                    <button class="btn btn-primary" id="add-production">
                        ➕ Record Production
                    </button>
                </div>
            </div>

            <!-- Production Summary -->
            <div class="production-summary">
                <div class="summary-card">
                    <div class="summary-icon">🌾</div>
                    <div class="summary-content">
                        <h3>Current Yield</h3>
                        <div class="summary-value" id="current-yield">0 kg</div>
                        <div class="summary-period">This season</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🐔</div>
                    <div class="summary-content">
                        <h3>Egg Production</h3>
                        <div class="summary-value" id="egg-production">0</div>
                        <div class="summary-period">Today</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🥛</div>
                    <div class="summary-content">
                        <h3>Milk Production</h3>
                        <div class="summary-value" id="milk-production">0 L</div>
                        <div class="summary-period">Today</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📊</div>
                    <div class="summary-content">
                        <h3>Efficiency</h3>
                        <div class="summary-value" id="production-efficiency">0%</div>
                        <div class="summary-period">Yield rate</div>
                    </div>
                </div>
            </div>

            <!-- Quick Production Forms -->
            <div class="quick-production card">
                <h3>Quick Production Records</h3>
                <div class="quick-forms">
                    <!-- Crop Harvest -->
                    <div class="quick-form-section">
                        <h4>🌾 Crop Harvest</h4>
                        <div class="form-row compact">
                            <div class="form-group">
                                <select id="quick-crop" class="form-compact">
                                    <option value="">Select Crop</option>
                                    <option value="tomatoes">Tomatoes</option>
                                    <option value="peppers">Peppers</option>
                                    <option value="cucumbers">Cucumbers</option>
                                    <option value="lettuce">Lettuce</option>
                                    <option value="carrots">Carrots</option>
                                    <option value="potatoes">Potatoes</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="number" id="quick-harvest-weight" placeholder="Weight (kg)" class="form-compact" step="0.1" min="0">
                            </div>
                            <div class="form-group">
                                <input type="text" id="quick-harvest-plot" placeholder="Plot/Field" class="form-compact">
                            </div>
                            <div class="form-group">
                                <button type="button" class="btn btn-primary btn-compact" id="quick-harvest">Record Harvest</button>
                            </div>
                        </div>
                    </div>

                    <!-- Egg Collection -->
                    <div class="quick-form-section">
                        <h4>🐔 Egg Collection</h4>
                        <div class="form-row compact">
                            <div class="form-group">
                                <select id="quick-flock" class="form-compact">
                                    <option value="">Select Flock</option>
                                    <option value="layer-1">Layer Flock 1</option>
                                    <option value="layer-2">Layer Flock 2</option>
                                    <option value="broiler-breeders">Broiler Breeders</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="number" id="quick-egg-count" placeholder="Egg count" class="form-compact" min="0">
                            </div>
                            <div class="form-group">
                                <select id="quick-egg-grade" class="form-compact">
                                    <option value="large">Large</option>
                                    <option value="medium">Medium</option>
                                    <option value="small">Small</option>
                                    <option value="jumbo">Jumbo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <button type="button" class="btn btn-primary btn-compact" id="quick-eggs">Record Eggs</button>
                            </div>
                        </div>
                    </div>

                    <!-- Milk Production -->
                    <div class="quick-form-section">
                        <h4>🥛 Milk Production</h4>
                        <div class="form-row compact">
                            <div class="form-group">
                                <select id="quick-animal" class="form-compact">
                                    <option value="">Select Animal</option>
                                    <option value="cow-1">Cow #1</option>
                                    <option value="cow-2">Cow #2</option>
                                    <option value="goat-1">Goat #1</option>
                                    <option value="goat-2">Goat #2</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="number" id="quick-milk-volume" placeholder="Volume (L)" class="form-compact" step="0.1" min="0">
                            </div>
                            <div class="form-group">
                                <select id="quick-milk-session" class="form-compact">
                                    <option value="morning">Morning</option>
                                    <option value="evening">Evening</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <button type="button" class="btn btn-primary btn-compact" id="quick-milk">Record Milk</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Production Records -->
            <div class="production-records card">
                <div class="card-header">
                    <h3>Production History</h3>
                    <div class="filter-controls">
                        <select id="production-type-filter">
                            <option value="all">All Types</option>
                            <option value="crop">Crop Harvest</option>
                            <option value="eggs">Egg Production</option>
                            <option value="milk">Milk Production</option>
                            <option value="processing">Processing</option>
                            <option value="other">Other</option>
                        </select>
                        <select id="time-period-filter">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="season">This Season</option>
                            <option value="all">All Time</option>
                        </select>
                        <button class="btn btn-text" id="export-production">Export</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Quality</th>
                                <th>Location</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="production-body">
                            <tr>
                                <td colspan="8" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">🌱</span>
                                        <h4>No production records yet</h4>
                                        <p>Start recording your farm production activities</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Production Charts -->
            <div class="production-charts card">
                <h3>Production Trends</h3>
                <div class="charts-container">
                    <div class="chart-placeholder">
                        <div class="chart-info">
                            <h4>Weekly Production</h4>
                            <p>Production trends over the last 7 days</p>
                            <div class="chart-legend">
                                <span class="legend-item crop">🌾 Crops</span>
                                <span class="legend-item eggs">🐔 Eggs</span>
                                <span class="legend-item milk">🥛 Milk</span>
                            </div>
                        </div>
                        <div class="chart-visual">
                            <p><em>Chart visualization would appear here</em></p>
                            <small>Shows daily production quantities by type</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Production Modal -->
            <div id="production-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="production-modal-title">Record Production</h3>
                        <button class="btn-icon close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="production-form">
                            <input type="hidden" id="production-id">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="production-date">Date *</label>
                                    <input type="date" id="production-date" required>
                                </div>
                                <div class="form-group">
                                    <label for="production-type">Production Type *</label>
                                    <select id="production-type" required>
                                        <option value="">Select Type</option>
                                        <option value="crop">Crop Harvest</option>
                                        <option value="eggs">Egg Production</option>
                                        <option value="milk">Milk Production</option>
                                        <option value="processing">Product Processing</option>
                                        <option value="breeding">Breeding Activity</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Dynamic fields based on production type -->
                            <div id="crop-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-crop">Crop *</label>
                                        <select id="production-crop">
                                            <option value="">Select Crop</option>
                                            <option value="tomatoes">Tomatoes</option>
                                            <option value="peppers">Peppers</option>
                                            <option value="cucumbers">Cucumbers</option>
                                            <option value="lettuce">Lettuce</option>
                                            <option value="carrots">Carrots</option>
                                            <option value="potatoes">Potatoes</option>
                                            <option value="onions">Onions</option>
                                            <option value="cabbage">Cabbage</option>
                                            <option value="corn">Corn</option>
                                            <option value="beans">Beans</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="production-plot">Plot/Field</label>
                                        <input type="text" id="production-plot" placeholder="Field name or number">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-yield">Yield (kg) *</label>
                                        <input type="number" id="production-yield" step="0.1" min="0" placeholder="0.0">
                                    </div>
                                    <div class="form-group">
                                        <label for="production-quality">Quality Grade</label>
                                        <select id="production-quality">
                                            <option value="premium">Premium</option>
                                            <option value="grade-a">Grade A</option>
                                            <option value="grade-b">Grade B</option>
                                            <option value="processing">Processing Grade</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="egg-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-flock">Flock *</label>
                                        <select id="production-flock">
                                            <option value="">Select Flock</option>
                                            <option value="layer-1">Layer Flock 1</option>
                                            <option value="layer-2">Layer Flock 2</option>
                                            <option value="broiler-breeders">Broiler Breeders</option>
                                            <option value="backyard">Backyard Flock</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="production-egg-count">Egg Count *</label>
                                        <input type="number" id="production-egg-count" min="0" placeholder="0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-egg-grade">Egg Grade</label>
                                        <select id="production-egg-grade">
                                            <option value="jumbo">Jumbo</option>
                                            <option value="large">Large</option>
                                            <option value="medium">Medium</option>
                                            <option value="small">Small</option>
                                            <option value="peewee">Peewee</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="production-broken">Broken Eggs</label>
                                        <input type="number" id="production-broken" min="0" placeholder="0">
                                    </div>
                                </div>
                            </div>

                            <div id="milk-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-animal">Animal *</label>
                                        <select id="production-animal">
                                            <option value="">Select Animal</option>
                                            <option value="cow-1">Cow #1 (Daisy)</option>
                                            <option value="cow-2">Cow #2 (Bella)</option>
                                            <option value="goat-1">Goat #1 (Nanny)</option>
                                            <option value="goat-2">Goat #2 (Billy)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="production-milk-volume">Volume (L) *</label>
                                        <input type="number" id="production-milk-volume" step="0.1" min="0" placeholder="0.0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="production-fat-content">Fat Content (%)</label>
                                        <input type="number" id="production-fat-content" step="0.1" min="0" max="10" placeholder="3.5">
                                    </div>
                                    <div class="form-group">
                                        <label for="production-session">Milking Session</label>
                                        <select id="production-session">
                                            <option value="morning">Morning</option>
                                            <option value="evening">Evening</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="processing-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="processing-product">Product *</label>
                                        <select id="processing-product">
                                            <option value="">Select Product</option>
                                            <option value="cheese">Cheese</option>
                                            <option value="yogurt">Yogurt</option>
                                            <option value="butter">Butter</option>
                                            <option value="jam">Jam/Preserves</option>
                                            <option value="sausage">Sausage</option>
                                            <option value="bacon">Bacon</option>
                                            <option value="smoked-meat">Smoked Meat</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="processing-quantity">Quantity *</label>
                                        <input type="number" id="processing-quantity" step="0.1" min="0" placeholder="0.0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="processing-input">Input Material</label>
                                        <input type="text" id="processing-input" placeholder="e.g., 10L milk, 5kg tomatoes">
                                    </div>
                                    <div class="form-group">
                                        <label for="processing-yield">Yield Rate (%)</label>
                                        <input type="number" id="processing-yield" step="0.1" min="0" max="100" placeholder="0.0">
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="production-notes">Notes & Observations</label>
                                <textarea id="production-notes" placeholder="Weather conditions, animal health, equipment used, etc." rows="3"></textarea>
                            </div>

                            <div class="production-metrics">
                                <h4>Production Metrics</h4>
                                <div class="metrics-grid">
                                    <div class="metric-item">
                                        <label>Efficiency:</label>
                                        <span id="production-efficiency-display">-</span>
                                    </div>
                                    <div class="metric-item">
                                        <label>Quality Score:</label>
                                        <span id="production-quality-score">-</span>
                                    </div>
                                    <div class="metric-item">
                                        <label>Trend:</label>
                                        <span id="production-trend">-</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-production" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-production">Save Record</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .production-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .summary-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
        }

        .summary-icon {
            font-size: 2rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }

        .summary-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .summary-period {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .quick-production {
            margin: 1.5rem 0;
        }

        .quick-forms {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .quick-form-section {
            padding: 1rem;
            background: var(--bg-color);
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }

        .quick-form-section h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            color: var(--text-color);
        }

        .quick-form-section .form-row.compact {
            margin-bottom: 0;
        }

        .production-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .filter-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .production-charts {
            margin-top: 1.5rem;
        }

        .charts-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .chart-placeholder {
            background: var(--bg-color);
            padding: 2rem;
            border-radius: 8px;
            border: 2px dashed var(--border-color);
            text-align: center;
        }

        .chart-info {
            margin-bottom: 1rem;
        }

        .chart-info h4 {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
        }

        .chart-info p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .chart-legend {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }

        .legend-item {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .legend-item.crop {
            background: var(--success-light);
            color: var(--success-color);
        }

        .legend-item.eggs {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .legend-item.milk {
            background: var(--info-light);
            color: var(--info-dark);
        }

        .chart-visual {
            padding: 2rem;
            background: white;
            border-radius: 4px;
        }

        .production-fields {
            padding: 1rem;
            background: var(--bg-color);
            border-radius: 8px;
            margin: 1rem 0;
        }

        .production-metrics {
            background: var(--card-bg);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }

        .production-metrics h4 {
            margin: 0 0 1rem 0;
            color: var(--text-color);
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
        }

        .metric-item label {
            font-weight: 500;
            color: var(--text-muted);
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .empty-content p {
            margin: 0;
            opacity: 0.8;
        }

        .type-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
        }

        .type-crop {
            background: var(--success-light);
            color: var(--success-color);
        }

        .type-eggs {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .type-milk {
            background: var(--info-light);
            color: var(--info-dark);
        }

        .type-processing {
            background: var(--primary-light);
            color: var(--primary-color);
        }

        .type-breeding {
            background: var(--purple-light);
            color: var(--purple-color);
        }

        .type-other {
            background: var(--gray-light);
            color: var(--gray-dark);
        }
    `,

    initialize: function() {
        console.log('Production Records module initializing...');
        this.loadProductionData();
        this.attachEventListeners();
        this.updateSummary();
        this.renderProductionTable();
    },

    loadProductionData: function() {
        if (!FarmModules.appData.production) {
            FarmModules.appData.production = [];
        }
    },

    updateSummary: function() {
        const production = FarmModules.appData.production || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Current season yield (crops)
        const currentSeasonYield = production
            .filter(record => record.type === 'crop')
            .reduce((sum, record) => sum + (record.quantity || 0), 0);

        // Today's egg production
        const todayEggs = production
            .filter(record => record.type === 'eggs' && record.date === today)
            .reduce((sum, record) => sum + (record.quantity || 0), 0);

        // Today's milk production
        const todayMilk = production
            .filter(record => record.type === 'milk' && record.date === today)
            .reduce((sum, record) => sum + (record.quantity || 0), 0);

        // Efficiency calculation (placeholder)
        const efficiency = production.length > 0 ? '85%' : '0%';

        this.updateElement('current-yield', `${currentSeasonYield.toFixed(1)} kg`);
        this.updateElement('egg-production', todayEggs);
        this.updateElement('milk-production', `${todayMilk.toFixed(1)} L`);
        this.updateElement('production-efficiency', efficiency);
    },

    renderProductionTable: function(typeFilter = 'all', periodFilter = 'today') {
        const tbody = document.getElementById('production-body');
        const production = FarmModules.appData.production || [];

        let filteredProduction = production;
        
        // Filter by type
        if (typeFilter !== 'all') {
            filteredProduction = production.filter(record => record.type === typeFilter);
        }
        
        // Filter by time period
        if (periodFilter !== 'all') {
            const cutoffDate = new Date();
            if (periodFilter === 'today') {
                cutoffDate.setDate(cutoffDate.getDate() - 1);
            } else if (periodFilter === 'week') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (periodFilter === 'month') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            } else if (periodFilter === 'season') {
                cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            }
            filteredProduction = filteredProduction.filter(record => new Date(record.date) >= cutoffDate);
        }

        if (filteredProduction.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">🌱</span>
                            <h4>No production records found</h4>
                            <p>${typeFilter === 'all' ? 'Start recording your production activities' : `No ${typeFilter} records in the ${periodFilter}`}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show most recent records first
        const sortedProduction = filteredProduction.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedProduction.map(record => {
            const typeClass = `type-badge type-${record.type}`;
            const productName = this.getProductDisplayName(record);
            const quantityDisplay = this.getQuantityDisplay(record);
            const qualityDisplay = record.quality || record.grade || '-';
            
            return `
                <tr>
                    <td>${this.formatDate(record.date)}</td>
                    <td><span class="${typeClass}">${record.type}</span></td>
                    <td>${productName}</td>
                    <td>${quantityDisplay}</td>
                    <td>${qualityDisplay}</td>
                    <td>${record.location || record.plot || record.flock || '-'}</td>
                    <td>${record.notes ? '📝' : '-'}</td>
                    <td class="production-actions">
                        <button class="btn-icon edit-production" data-id="${record.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-production" data-id="${record.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

   // ... (previous implementation)

private:
    // Production calculation engines for different types
    double calculateCropProduction(const CropData& data) {
        double baseYield = data.baseYield;
        
        // Apply environmental factors
        double environmentalFactor = 1.0;
        environmentalFactor *= (1.0 + data.soilQuality * 0.2);
        environmentalFactor *= (1.0 + data.waterAvailability * 0.15);
        environmentalFactor *= (1.0 - std::max(0.0, data.pestPressure * 0.1));
        
        // Apply management factors
        double managementFactor = 1.0;
        managementFactor *= (1.0 + data.fertilizerEfficiency * 0.25);
        managementFactor *= (1.0 + data.irrigationEfficiency * 0.2);
        
        return baseYield * environmentalFactor * managementFactor;
    }

    double calculateLivestockProduction(const LivestockData& data) {
        double baseProduction = data.animalCount * data.productivityPerAnimal;
        
        // Apply health and nutrition factors
        double healthFactor = 0.7 + (data.animalHealth * 0.3); // 0.7 to 1.0 range
        double nutritionFactor = 0.8 + (data.feedQuality * 0.2); // 0.8 to 1.0 range
        
        // Apply management factors
        double managementFactor = 1.0;
        managementFactor *= (1.0 + data.veterinaryCare * 0.15);
        managementFactor *= (1.0 + data.shelterQuality * 0.1);
        
        return baseProduction * healthFactor * nutritionFactor * managementFactor;
    }

    double calculateAquacultureProduction(const AquacultureData& data) {
        double baseProduction = data.waterVolume * data.stockingDensity * data.speciesProductivity;
        
        // Apply water quality factors
        double waterQualityFactor = 1.0;
        waterQualityFactor *= (1.0 + data.waterQuality * 0.3);
        waterQualityFactor *= (1.0 - std::max(0.0, data.pollutionLevel * 0.2));
        
        // Apply management factors
        double managementFactor = 1.0;
        managementFactor *= (1.0 + data.feedEfficiency * 0.25);
        managementFactor *= (1.0 + data.diseaseManagement * 0.2);
        
        return baseProduction * waterQualityFactor * managementFactor;
    }

    double calculateAgroforestryProduction(const AgroforestryData& data) {
        double treeProduction = data.treeCount * data.treeProductivity;
        double intercropProduction = data.intercropYield;
        
        // Apply synergy factors
        double synergyFactor = 1.0 + data.treeCropSynergy * 0.15;
        double soilImprovementFactor = 1.0 + data.soilImprovement * 0.1;
        
        return (treeProduction + intercropProduction) * synergyFactor * soilImprovementFactor;
    }

    // Resource requirement calculations
    ResourceRequirements calculateCropResourceRequirements(const CropData& data, double production) {
        ResourceRequirements req;
        req.water = production * data.waterRequirementPerUnit;
        req.energy = production * data.energyRequirementPerUnit;
        req.labor = production * data.laborRequirementPerUnit;
        req.fertilizer = production * data.fertilizerRequirementPerUnit;
        return req;
    }

    ResourceRequirements calculateLivestockResourceRequirements(const LivestockData& data, double production) {
        ResourceRequirements req;
        req.water = data.animalCount * data.waterRequirementPerAnimal;
        req.feed = data.animalCount * data.feedRequirementPerAnimal;
        req.energy = production * data.energyRequirementPerUnit;
        req.labor = data.animalCount * data.laborRequirementPerAnimal;
        return req;
    }

    // Environmental impact calculations
    EnvironmentalImpact calculateEnvironmentalImpact(const ProductionResult& result, const ResourceRequirements& resources) {
        EnvironmentalImpact impact;
        
        // Carbon footprint calculations
        impact.carbonFootprint = resources.energy * CARBON_INTENSITY_ENERGY +
                               resources.fertilizer * CARBON_INTENSITY_FERTILIZER;
        
        // Water impact
        impact.waterUsage = resources.water;
        impact.waterPollutionPotential = resources.fertilizer * FERTILIZER_RUNOFF_RATE;
        
        // Land impact
        impact.landUseEfficiency = result.production / result.areaUsed;
        impact.biodiversityImpact = calculateBiodiversityImpact(result.areaUsed, result.productionType);
        
        return impact;
    }

    double calculateBiodiversityImpact(double area, const std::string& productionType) {
        // Simplified biodiversity impact calculation
        std::unordered_map<std::string, double> impactFactors = {
            {"organic_crop", 0.2},
            {"conventional_crop", 0.6},
            {"livestock", 0.7},
            {"aquaculture", 0.4},
            {"agroforestry", 0.1}
        };
        
        auto it = impactFactors.find(productionType);
        if (it != impactFactors.end()) {
            return area * it->second;
        }
        return area * 0.5; // Default medium impact
    }

    // Data validation methods
    bool validateCropData(const CropData& data) {
        return data.baseYield >= 0 &&
               data.soilQuality >= 0 && data.soilQuality <= 1 &&
               data.waterAvailability >= 0 && data.waterAvailability <= 1 &&
               data.pestPressure >= 0 && data.pestPressure <= 1 &&
               data.fertilizerEfficiency >= 0 && data.fertilizerEfficiency <= 1;
    }

    bool validateLivestockData(const LivestockData& data) {
        return data.animalCount >= 0 &&
               data.productivityPerAnimal >= 0 &&
               data.animalHealth >= 0 && data.animalHealth <= 1 &&
               data.feedQuality >= 0 && data.feedQuality <= 1;
    }

    // Optimization helper methods
    OptimizationResult optimizeCropProduction(const CropData& currentData, const OptimizationConstraints& constraints) {
        OptimizationResult result;
        CropData optimizedData = currentData;
        
        // Simple optimization: adjust inputs based on constraints
        if (constraints.maxWater > 0) {
            optimizedData.waterAvailability = std::min(optimizedData.waterAvailability, 
                                                     constraints.maxWater / currentData.waterRequirementPerUnit);
        }
        
        if (constraints.maxFertilizer > 0) {
            double fertilizerEfficiency = currentData.fertilizerEfficiency;
            optimizedData.fertilizerEfficiency = std::min(fertilizerEfficiency,
                                                        constraints.maxFertilizer / currentData.fertilizerRequirementPerUnit);
        }
        
        // Calculate optimized production
        result.optimizedProduction = calculateCropProduction(optimizedData);
        result.originalProduction = calculateCropProduction(currentData);
        result.improvement = result.optimizedProduction - result.originalProduction;
        result.optimizedParameters = optimizedData;
        
        return result;
    }

    // Data persistence methods
    bool saveProductionData(const std::string& filename, const ProductionData& data) {
        std::ofstream file(filename, std::ios::binary);
        if (!file.is_open()) {
            return false;
        }
        
        // Serialize production data
        size_t dataSize = data.size();
        file.write(reinterpret_cast<const char*>(&dataSize), sizeof(dataSize));
        
        for (const auto& entry : data) {
            // Save each production record
            const ProductionRecord& record = entry.second;
            file.write(reinterpret_cast<const char*>(&record), sizeof(record));
        }
        
        return !file.fail();
    }

    bool loadProductionData(const std::string& filename, ProductionData& data) {
        std::ifstream file(filename, std::ios::binary);
        if (!file.is_open()) {
            return false;
        }
        
        size_t dataSize;
        file.read(reinterpret_cast<char*>(&dataSize), sizeof(dataSize));
        
        data.clear();
        for (size_t i = 0; i < dataSize; ++i) {
            ProductionRecord record;
            file.read(reinterpret_cast<char*>(&record), sizeof(record));
            if (file.fail()) break;
            
            data[record.id] = record;
        }
        
        return !file.fail();
    }

    // Reporting and analytics
    ProductionSummary generateSummary(const ProductionData& data, time_t startDate, time_t endDate) {
        ProductionSummary summary;
        
        for (const auto& entry : data) {
            const ProductionRecord& record = entry.second;
            
            if (record.timestamp >= startDate && record.timestamp <= endDate) {
                summary.totalProduction += record.production;
                summary.totalRevenue += record.revenue;
                summary.totalCost += record.cost;
                
                summary.productionByType[record.productionType] += record.production;
                summary.revenueByType[record.productionType] += record.revenue;
                
                summary.areaUsed += record.areaUsed;
            }
        }
        
        summary.profit = summary.totalRevenue - summary.totalCost;
        summary.productivity = summary.areaUsed > 0 ? summary.totalProduction / summary.areaUsed : 0;
        
        return summary;
    }

    // Trend analysis
    std::vector<ProductionTrend> analyzeTrends(const ProductionData& data, const std::string& productionType, int periodDays) {
        std::vector<ProductionTrend> trends;
        
        if (data.empty()) return trends;
        
        // Group data by time periods
        std::map<time_t, double> dailyProduction;
        for (const auto& entry : data) {
            const ProductionRecord& record = entry.second;
            if (record.productionType == productionType) {
                time_t day = record.timestamp - (record.timestamp % (24 * 3600)); // Group by day
                dailyProduction[day] += record.production;
            }
        }
        
        // Calculate trends
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = 0;
        
        for (const auto& entry : dailyProduction) {
            double x = n;
            double y = entry.second;
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            n++;
        }
        
        if (n > 1) {
            double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            double intercept = (sumY - slope * sumX) / n;
            
            ProductionTrend trend;
            trend.slope = slope;
            trend.intercept = intercept;
            trend.confidence = calculateTrendConfidence(dailyProduction, slope, intercept);
            trends.push_back(trend);
        }
        
        return trends;
    }

    double calculateTrendConfidence(const std::map<time_t, double>& data, double slope, double intercept) {
        // Simplified confidence calculation based on R-squared
        if (data.size() < 2) return 0.0;
        
        double meanY = 0;
        for (const auto& entry : data) {
            meanY += entry.second;
        }
        meanY /= data.size();
        
        double totalSS = 0, residualSS = 0;
        int n = 0;
        
        for (const auto& entry : data) {
            double y = entry.second;
            double predicted = slope * n + intercept;
            
            totalSS += (y - meanY) * (y - meanY);
            residualSS += (y - predicted) * (y - predicted);
            n++;
        }
        
        return std::max(0.0, 1.0 - (residualSS / totalSS));
    }

private:
    ProductionData productionData;
    std::unordered_map<std::string, ProductionModule> activeModules;
    
    // Constants for environmental calculations
    static constexpr double CARBON_INTENSITY_ENERGY = 0.5; // kg CO2 per kWh
    static constexpr double CARBON_INTENSITY_FERTILIZER = 3.0; // kg CO2 per kg fertilizer
    static constexpr double FERTILIZER_RUNOFF_RATE = 0.1; // 10% runoff
};
