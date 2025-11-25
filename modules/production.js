// modules/production.js
FarmModules.registerModule('production', {
    name: 'Production Records',
    icon: '🌱',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Production Records</h1>
                <p>Track crop, livestock, and aquaculture production</p>
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
                        <h3>Crop Production</h3>
                        <div class="summary-value" id="crop-production">0 kg</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🐄</div>
                    <div class="summary-content">
                        <h3>Livestock Production</h3>
                        <div class="summary-value" id="livestock-production">0 kg</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🐟</div>
                    <div class="summary-content">
                        <h3>Aquaculture</h3>
                        <div class="summary-value" id="aquaculture-production">0 kg</div>
                        <div class="summary-period">This Month</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📈</div>
                    <div class="summary-content">
                        <h3>Total Production</h3>
                        <div class="summary-value" id="total-production">0 kg</div>
                        <div class="summary-period">All Types</div>
                    </div>
                </div>
            </div>

            <!-- Quick Production Form -->
            <div class="quick-production card">
                <h3>Quick Production Entry</h3>
                <form id="quick-production-form" class="form-inline">
                    <div class="form-row compact">
                        <div class="form-group">
                            <select id="quick-production-type" required class="form-compact">
                                <option value="">Select Type</option>
                                <option value="crop">Crop</option>
                                <option value="livestock">Livestock</option>
                                <option value="aquaculture">Aquaculture</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" id="quick-amount" placeholder="Amount" required class="form-compact" min="1">
                        </div>
                        <div class="form-group">
                            <select id="quick-unit" class="form-compact">
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                                <option value="units">units</option>
                                <option value="dozen">dozen</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-compact">Record</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Production Records -->
            <div class="production-records card">
                <div class="card-header">
                    <h3>Recent Production</h3>
                    <div class="filter-controls">
                        <select id="type-filter">
                            <option value="all">All Types</option>
                            <option value="crop">Crop</option>
                            <option value="livestock">Livestock</option>
                            <option value="aquaculture">Aquaculture</option>
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
                                <th>Amount</th>
                                <th>Resources Used</th>
                                <th>Efficiency</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="production-body">
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <div class="empty-content">
                                        <span class="empty-icon">🌱</span>
                                        <h4>No production recorded yet</h4>
                                        <p>Start recording your production data</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
                                    <label for="production-date">Production Date *</label>
                                    <input type="date" id="production-date" required>
                                </div>
                                <div class="form-group">
                                    <label for="production-type">Production Type *</label>
                                    <select id="production-type" required>
                                        <option value="">Select Type</option>
                                        <option value="crop">Crop Production</option>
                                        <option value="livestock">Livestock Production</option>
                                        <option value="aquaculture">Aquaculture Production</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Dynamic fields based on type -->
                            <div id="crop-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="crop-area">Area (hectares) *</label>
                                        <input type="number" id="crop-area" min="0.1" step="0.1" placeholder="0.0">
                                    </div>
                                    <div class="form-group">
                                        <label for="crop-yield">Yield (kg/hectare) *</label>
                                        <input type="number" id="crop-yield" min="1" placeholder="0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="crop-soil">Soil Quality</label>
                                        <select id="crop-soil">
                                            <option value="1.0">Excellent</option>
                                            <option value="0.8" selected>Good</option>
                                            <option value="0.6">Average</option>
                                            <option value="0.4">Poor</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="crop-water">Water Availability</label>
                                        <select id="crop-water">
                                            <option value="1.0">Excellent</option>
                                            <option value="0.8" selected>Good</option>
                                            <option value="0.6">Average</option>
                                            <option value="0.4">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="livestock-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="livestock-count">Animal Count *</label>
                                        <input type="number" id="livestock-count" min="1" placeholder="0">
                                    </div>
                                    <div class="form-group">
                                        <label for="livestock-productivity">Productivity (kg/animal) *</label>
                                        <input type="number" id="livestock-productivity" min="0.1" step="0.1" placeholder="0.0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="livestock-health">Animal Health</label>
                                        <select id="livestock-health">
                                            <option value="1.0">Excellent</option>
                                            <option value="0.8" selected>Good</option>
                                            <option value="0.6">Average</option>
                                            <option value="0.4">Poor</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="livestock-feed">Feed Quality</label>
                                        <select id="livestock-feed">
                                            <option value="1.0">Excellent</option>
                                            <option value="0.8" selected>Good</option>
                                            <option value="0.6">Average</option>
                                            <option value="0.4">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="aquaculture-fields" class="production-fields" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="aquaculture-volume">Water Volume (m³) *</label>
                                        <input type="number" id="aquaculture-volume" min="1" placeholder="0">
                                    </div>
                                    <div class="form-group">
                                        <label for="aquaculture-density">Stocking Density (fish/m³) *</label>
                                        <input type="number" id="aquaculture-density" min="1" placeholder="0">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="aquaculture-productivity">Species Productivity (kg/fish) *</label>
                                        <input type="number" id="aquaculture-productivity" min="0.1" step="0.1" placeholder="0.0">
                                    </div>
                                    <div class="form-group">
                                        <label for="aquaculture-water">Water Quality</label>
                                        <select id="aquaculture-water">
                                            <option value="1.0">Excellent</option>
                                            <option value="0.8" selected>Good</option>
                                            <option value="0.6">Average</option>
                                            <option value="0.4">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="production-notes">Notes (Optional)</label>
                                <textarea id="production-notes" placeholder="Production notes, observations, etc." rows="3"></textarea>
                            </div>

                            <div class="production-results">
                                <h4>Estimated Production: <span id="estimated-production">0 kg</span></h4>
                                <div class="resource-usage">
                                    <h5>Resource Requirements:</h5>
                                    <div id="resource-details">-</div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-text close-modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-production" style="display: none;">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-production">Save Production</button>
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

        .quick-production .form-row.compact {
            margin-bottom: 0;
        }

        .production-records .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .production-fields {
            background: var(--bg-color);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid var(--primary-color);
        }

        .production-results {
            background: var(--success-light);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }

        .production-results h4 {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
        }

        .production-results h5 {
            margin: 0 0 0.5rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        #estimated-production {
            color: var(--success-color);
            font-weight: 700;
        }

        .resource-usage {
            font-size: 0.9rem;
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

        .type-livestock {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .type-aquaculture {
            background: var(--info-light);
            color: var(--info-dark);
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
    `,

    initialize: function() {
        console.log('🌱 Production Records module initializing...');
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
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        let cropTotal = 0;
        let livestockTotal = 0;
        let aquacultureTotal = 0;

        production.forEach(record => {
            const recordDate = new Date(record.date);
            if (recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear) {
                switch(record.type) {
                    case 'crop':
                        cropTotal += record.amount;
                        break;
                    case 'livestock':
                        livestockTotal += record.amount;
                        break;
                    case 'aquaculture':
                        aquacultureTotal += record.amount;
                        break;
                }
            }
        });

        this.updateElement('crop-production', this.formatAmount(cropTotal) + ' kg');
        this.updateElement('livestock-production', this.formatAmount(livestockTotal) + ' kg');
        this.updateElement('aquaculture-production', this.formatAmount(aquacultureTotal) + ' kg');
        this.updateElement('total-production', this.formatAmount(cropTotal + livestockTotal + aquacultureTotal) + ' kg');
    },

    renderProductionTable: function(type = 'all') {
        const tbody = document.getElementById('production-body');
        const production = FarmModules.appData.production || [];

        let filteredProduction = production;
        if (type !== 'all') {
            filteredProduction = production.filter(record => record.type === type);
        }

        if (filteredProduction.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">🌱</span>
                            <h4>No production found</h4>
                            <p>${type === 'all' ? 'Start recording your production' : `No ${type} production`}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Show most recent production first
        const sortedProduction = filteredProduction.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedProduction.map(record => {
            const typeClass = `type-badge type-${record.type}`;
            
            return `
                <tr>
                    <td>${this.formatDate(record.date)}</td>
                    <td><span class="${typeClass}">${record.type}</span></td>
                    <td>${this.formatProductName(record.product)}</td>
                    <td>${this.formatAmount(record.amount)} ${record.unit}</td>
                    <td>${this.formatResources(record.resources)}</td>
                    <td>${this.formatEfficiency(record.efficiency)}</td>
                    <td class="production-actions">
                        <button class="btn-icon edit-production" data-id="${record.id}" title="Edit">✏️</button>
                        <button class="btn-icon delete-production" data-id="${record.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEventListeners: function() {
        // Quick production form
        document.getElementById('quick-production-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickProduction();
        });

        // Modal buttons
        document.getElementById('add-production').addEventListener('click', () => this.showProductionModal());
        document.getElementById('save-production').addEventListener('click', () => this.saveProduction());
        document.getElementById('delete-production').addEventListener('click', () => this.deleteProduction());

        // Type change handler
        document.getElementById('production-type').addEventListener('change', (e) => {
            this.showProductionFields(e.target.value);
        });

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideModal());
        });

        // Filter
        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.renderProductionTable(e.target.value);
        });

        // Export
        document.getElementById('export-production').addEventListener('click', () => {
            this.exportProduction();
        });

        // Production actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-production')) {
                const productionId = e.target.closest('.edit-production').dataset.id;
                this.editProduction(productionId);
            }
            if (e.target.closest('.delete-production')) {
                const productionId = e.target.closest('.delete-production').dataset.id;
                this.deleteProductionRecord(productionId);
            }
        });

        // Modal backdrop
        document.getElementById('production-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });

        // Real-time calculation for production fields
        document.querySelectorAll('#production-form input').forEach(input => {
            input.addEventListener('input', () => this.calculateProduction());
        });
    },

    handleQuickProduction: function() {
        const type = document.getElementById('quick-production-type').value;
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const unit = document.getElementById('quick-unit').value;

        if (!type || !amount) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const productionData = {
            id: 'PROD-' + Date.now().toString().slice(-6),
            type: type,
            amount: amount,
            unit: unit,
            date: new Date().toISOString().split('T')[0],
            product: this.getDefaultProduct(type),
            resources: this.calculateQuickResources(type, amount),
            efficiency: 'Good'
        };

        this.addProduction(productionData);
        
        // Reset form
        document.getElementById('quick-production-form').reset();
        this.showNotification('Production recorded successfully!', 'success');
    },

    showProductionModal: function() {
        const modal = document.getElementById('production-modal');
        const title = document.getElementById('production-modal-title');
        const form = document.getElementById('production-form');

        if (modal && title && form) {
            form.reset();
            document.getElementById('production-id').value = '';
            document.getElementById('production-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('delete-production').style.display = 'none';
            document.getElementById('estimated-production').textContent = '0 kg';
            document.getElementById('resource-details').textContent = '-';
            
            // Hide all production fields
            document.querySelectorAll('.production-fields').forEach(field => {
                field.style.display = 'none';
            });
            
            modal.classList.remove('hidden');
        }
    },

    hideModal: function() {
        const modal = document.getElementById('production-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showProductionFields: function(type) {
        // Hide all fields first
        document.querySelectorAll('.production-fields').forEach(field => {
            field.style.display = 'none';
        });

        // Show relevant fields
        if (type) {
            const fields = document.getElementById(`${type}-fields`);
            if (fields) {
                fields.style.display = 'block';
            }
        }

        // Recalculate production
        this.calculateProduction();
    },

    calculateProduction: function() {
        const type = document.getElementById('production-type').value;
        let estimatedProduction = 0;
        let resourceDetails = 'Not calculated';

        if (type === 'crop') {
            const area = parseFloat(document.getElementById('crop-area').value) || 0;
            const yieldPerHectare = parseFloat(document.getElementById('crop-yield').value) || 0;
            const soilQuality = parseFloat(document.getElementById('crop-soil').value) || 0.8;
            const waterAvailability = parseFloat(document.getElementById('crop-water').value) || 0.8;

            estimatedProduction = area * yieldPerHectare * soilQuality * waterAvailability;
            resourceDetails = `Water: ${(estimatedProduction * 0.5).toFixed(0)}L, Fertilizer: ${(estimatedProduction * 0.1).toFixed(0)}kg`;
        }
        else if (type === 'livestock') {
            const animalCount = parseFloat(document.getElementById('livestock-count').value) || 0;
            const productivity = parseFloat(document.getElementById('livestock-productivity').value) || 0;
            const health = parseFloat(document.getElementById('livestock-health').value) || 0.8;
            const feedQuality = parseFloat(document.getElementById('livestock-feed').value) || 0.8;

            estimatedProduction = animalCount * productivity * health * feedQuality;
            resourceDetails = `Water: ${(animalCount * 50).toFixed(0)}L, Feed: ${(animalCount * 3).toFixed(0)}kg`;
        }
        else if (type === 'aquaculture') {
            const volume = parseFloat(document.getElementById('aquaculture-volume').value) || 0;
            const density = parseFloat(document.getElementById('aquaculture-density').value) || 0;
            const productivity = parseFloat(document.getElementById('aquaculture-productivity').value) || 0;
            const waterQuality = parseFloat(document.getElementById('aquaculture-water').value) || 0.8;

            estimatedProduction = volume * density * productivity * waterQuality;
            resourceDetails = `Water: ${volume}m³, Feed: ${(estimatedProduction * 1.5).toFixed(0)}kg`;
        }

        document.getElementById('estimated-production').textContent = this.formatAmount(estimatedProduction) + ' kg';
        document.getElementById('resource-details').textContent = resourceDetails;
    },

    saveProduction: function() {
        const form = document.getElementById('production-form');
        if (!form) return;

        const productionId = document.getElementById('production-id').value;
        const date = document.getElementById('production-date').value;
        const type = document.getElementById('production-type').value;
        const notes = document.getElementById('production-notes').value;

        if (!date || !type) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        let productionData = {
            date: date,
            type: type,
            notes: notes
        };

        // Add type-specific data
        if (type === 'crop') {
            const area = parseFloat(document.getElementById('crop-area').value);
            const yieldPerHectare = parseFloat(document.getElementById('crop-yield').value);
            if (!area || !yieldPerHectare) {
                this.showNotification('Please fill in crop-specific fields', 'error');
                return;
            }
            productionData.amount = area * yieldPerHectare;
            productionData.unit = 'kg';
            productionData.product = 'Crops';
            productionData.resources = {
                water: productionData.amount * 0.5,
                fertilizer: productionData.amount * 0.1
            };
        }
        else if (type === 'livestock') {
            const animalCount = parseFloat(document.getElementById('livestock-count').value);
            const productivity = parseFloat(document.getElementById('livestock-productivity').value);
            if (!animalCount || !productivity) {
                this.showNotification('Please fill in livestock-specific fields', 'error');
                return;
            }
            productionData.amount = animalCount * productivity;
            productionData.unit = 'kg';
            productionData.product = 'Livestock';
            productionData.resources = {
                water: animalCount * 50,
                feed: animalCount * 3
            };
        }
        else if (type === 'aquaculture') {
            const volume = parseFloat(document.getElementById('aquaculture-volume').value);
            const density = parseFloat(document.getElementById('aquaculture-density').value);
            const productivity = parseFloat(document.getElementById('aquaculture-productivity').value);
            if (!volume || !density || !productivity) {
                this.showNotification('Please fill in aquaculture-specific fields', 'error');
                return;
            }
            productionData.amount = volume * density * productivity;
            productionData.unit = 'kg';
            productionData.product = 'Fish';
            productionData.resources = {
                water: volume,
                feed: productionData.amount * 1.5
            };
        }

        if (productionId) {
            this.updateProduction(productionId, productionData);
        } else {
            this.addProduction(productionData);
        }

        this.hideModal();
    },

    addProduction: function(productionData) {
        if (!FarmModules.appData.production) {
            FarmModules.appData.production = [];
        }

        // Add ID if not present
        if (!productionData.id) {
            productionData.id = 'PROD-' + Date.now().toString().slice(-6);
        }

        FarmModules.appData.production.push(productionData);
        
        this.updateSummary();
        this.renderProductionTable();
        
        this.showNotification('Production recorded successfully!', 'success');
    },

    editProduction: function(productionId) {
        const production = FarmModules.appData.production || [];
        const record = production.find(p => p.id === productionId);
        
        if (!record) return;

        const modal = document.getElementById('production-modal');
        const title = document.getElementById('production-modal-title');

        if (modal && title) {
            document.getElementById('production-id').value = record.id;
            document.getElementById('production-date').value = record.date;
            document.getElementById('production-type').value = record.type;
            document.getElementById('production-notes').value = record.notes || '';
            document.getElementById('delete-production').style.display = 'block';
            
            // Show relevant fields and populate data
            this.showProductionFields(record.type);
            // Note: Would need to populate type-specific fields based on record data
            
            this.calculateProduction();
            
            title.textContent = 'Edit Production';
            modal.classList.remove('hidden');
        }
    },

    updateProduction: function(productionId, productionData) {
        const production = FarmModules.appData.production || [];
        const recordIndex = production.findIndex(p => p.id === productionId);
        
        if (recordIndex !== -1) {
            production[recordIndex] = {
                ...production[recordIndex],
                ...productionData
            };
            
            this.updateSummary();
            this.renderProductionTable();
            this.showNotification('Production updated successfully!', 'success');
        }
    },

    deleteProduction: function() {
        const productionId = document.getElementById('production-id').value;
        
        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(productionId);
            this.hideModal();
        }
    },

    deleteProductionRecord: function(productionId) {
        if (confirm('Are you sure you want to delete this production record?')) {
            FarmModules.appData.production = FarmModules.appData.production.filter(p => p.id !== productionId);
            
            this.updateSummary();
            this.renderProductionTable();
            this.showNotification('Production record deleted successfully', 'success');
        }
    },

    exportProduction: function() {
        const production = FarmModules.appData.production || [];
        const csv = this.convertToCSV(production);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `production-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Production data exported successfully!', 'success');
    },

    // Utility methods
    getDefaultProduct: function(type) {
        const products = {
            'crop': 'Crops',
            'livestock': 'Livestock', 
            'aquaculture': 'Fish'
        };
        return products[type] || 'Product';
    },

    calculateQuickResources: function(type, amount) {
        const resources = {
            'crop': `Water: ${(amount * 0.5).toFixed(0)}L, Fertilizer: ${(amount * 0.1).toFixed(0)}kg`,
            'livestock': `Water: ${(amount * 10).toFixed(0)}L, Feed: ${(amount * 2).toFixed(0)}kg`,
            'aquaculture': `Water: ${(amount * 0.1).toFixed(0)}m³, Feed: ${(amount * 1.5).toFixed(0)}kg`
        };
        return resources[type] || '-';
    },

    formatProductName: function(product) {
        return product || 'Unknown';
    },

    formatAmount: function(amount) {
        if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return Math.round(amount);
    },

    formatResources: function(resources) {
        if (typeof resources === 'object') {
            return Object.entries(resources).map(([key, value]) => 
                `${key}: ${value}`
            ).join(', ');
        }
        return resources || '-';
    },

    formatEfficiency: function(efficiency) {
        return efficiency || 'Good';
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    convertToCSV: function(production) {
        const headers = ['Date', 'Type', 'Product', 'Amount', 'Unit', 'Resources'];
        const rows = production.map(record => [
            record.date,
            record.type,
            record.product,
            record.amount,
            record.unit,
            this.formatResources(record.resources)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
});
