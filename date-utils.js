// modules/production.js - UPDATED WITH DATEUTILS INTEGRATION
console.log('🚜 Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    element: null,
    productionData: [],
    currentRecordId: null,

    initialize() {
        console.log('🚜 Initializing Production Records...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Production Records initialized with DateUtils');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Production Records updating for theme: ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
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
        // Use DateUtils for demo dates
        const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
        
        const getPreviousDate = (daysAgo) => {
            if (window.DateUtils && window.DateUtils.addDays) {
                return window.DateUtils.addDays(today, -daysAgo);
            }
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toISOString().split('T')[0];
        };
        
        return [
            { 
                id: 1, 
                date: today,
                product: 'eggs', 
                quantity: 450, 
                unit: 'pieces', 
                quality: 'grade-a', 
                batch: 'BATCH-001',
                notes: 'Morning collection' 
            },
            { 
                id: 2, 
                date: getPreviousDate(1),
                product: 'eggs', 
                quantity: 420, 
                unit: 'pieces', 
                quality: 'grade-a', 
                batch: 'BATCH-001',
                notes: 'Regular production' 
            },
            { 
                id: 3, 
                date: getPreviousDate(2),
                product: 'broilers', 
                quantity: 150, 
                unit: 'birds', 
                quality: 'grade-a', 
                batch: 'BATCH-002',
                notes: 'Weekly harvest' 
            },
            { 
                id: 4, 
                date: getPreviousDate(3),
                product: 'milk', 
                quantity: 120, 
                unit: 'liters', 
                quality: 'grade-b', 
                batch: 'BATCH-003',
                notes: 'Morning milking' 
            }
        ];
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Production Records</h1>
                    <p class="module-subtitle">Track your farm production and yields</p>
                </div>

                <!-- Production Overview Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🥚</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="today-eggs">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Eggs Today</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="week-birds">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds This Week</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-records">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Records</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="avg-quality">0.0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Avg Quality</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-production-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">New Record</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add production record</span>
                    </button>
                    <button class="quick-action-btn" id="production-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Production Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Generate detailed report</span>
                    </button>
                    <button class="quick-action-btn" id="trend-analysis-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Trend Analysis</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View production trends</span>
                    </button>
                    <button class="quick-action-btn" id="export-production-btn">
                        <div style="font-size: 32px;">💾</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Export Data</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Export production records</span>
                    </button>
                </div>

                <!-- Quick Production Form -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">⚡ Quick Production Entry</h3>
                    <form id="quick-production-form">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                            <div>
                                <label class="form-label">Product *</label>
                                <select id="quick-product" required class="form-input">
                                    <option value="">Select Product</option>
                                    <option value="eggs">🥚 Eggs</option>
                                    <option value="broilers">🐔 Broilers</option>
                                    <option value="layers">🐓 Layers</option>
                                    <option value="milk">🥛 Milk</option>
                                    <option value="pork">🐖 Pork</option>
                                    <option value="beef">🐄 Beef</option>
                                    <option value="other">📦 Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Qty *</label>
                                <input type="number" id="quick-quantity" placeholder="0" required class="form-input" min="1">
                            </div>
                            <div>
                                <label class="form-label">Unit</label>
                                <select id="quick-unit" class="form-input">
                                    <option value="pieces">Pieces</option>
                                    <option value="birds">Birds</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="liters">Liters</option>
                                    <option value="crates">Crates</option>
                                    <option value="cartons">Cartons</option>
                                    <option value="dozen">Dozen</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Quality</label>
                                <select id="quick-quality" class="form-input">
                                    <option value="grade-a">🟢 Grade A</option>
                                    <option value="grade-b">🟡 Grade B</option>
                                    <option value="standard">🔵 Standard</option>
                                    <option value="rejects">🔴 Rejects</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" class="btn-primary" style="height: 42px;">Record</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Recent Production Records -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📊 Recent Production Records</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="production-filter" class="form-input" style="width: auto;">
                                <option value="all">All Products</option>
                                <option value="eggs">Eggs</option>
                                <option value="broilers">Broilers</option>
                                <option value="layers">Layers</option>
                                <option value="milk">Milk</option>
                                <option value="pork">Pork</option>
                                <option value="beef">Beef</option>
                            </select>
                        </div>
                    </div>
                    <div id="production-table">
                        ${this.renderProductionTable('all')}
                    </div>
                </div>

                <!-- Production Summary by Product -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">📈 Production by Product</h3>
                    <div id="product-summary">
                        ${this.renderProductSummary()}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS -->
            <!-- Production Record Modal -->
            <div id="production-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 600px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="production-modal-title">New Production Record</h3>
                        <button class="popout-modal-close" id="close-production-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="production-form">
                            <input type="hidden" id="production-id" value="">
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Date *</label>
                                    <input type="date" id="production-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Product Type *</label>
                                    <select id="production-product" class="form-input" required>
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
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity *</label>
                                    <input type="number" id="production-quantity" class="form-input" min="1" required placeholder="0">
                                </div>
                                <div>
                                    <label class="form-label">Unit *</label>
                                    <select id="production-unit" class="form-input" required>
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

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quality *</label>
                                    <select id="production-quality" class="form-input" required>
                                        <option value="excellent">⭐ Excellent</option>
                                        <option value="grade-a">🟢 Grade A</option>
                                        <option value="grade-b">🟡 Grade B</option>
                                        <option value="standard">🔵 Standard</option>
                                        <option value="rejects">🔴 Rejects</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Batch ID</label>
                                    <input type="text" id="production-batch" class="form-input" placeholder="BATCH-001">
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Notes</label>
                                <textarea id="production-notes" class="form-input" placeholder="Add production details, observations, special conditions, or any other relevant information..." rows="3"></textarea>
                            </div>

                            <!-- Sale Options -->
                            <div style="margin-bottom: 16px;">
                                <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="production-for-sale">
                                    <span style="color: var(--text-primary);">Mark for immediate sale</span>
                                </label>
                                <div class="form-hint">This will create a sales record and adjust inventory automatically</div>
                            </div>

                            <div id="sale-details" style="display: none; margin-bottom: 16px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label class="form-label">Sale Price per Unit</label>
                                        <input type="number" id="sale-price" class="form-input" placeholder="0.00" min="0" step="0.01">
                                    </div>
                                    <div>
                                        <label class="form-label">Customer Name (Optional)</label>
                                        <input type="text" id="customer-name" class="form-input" placeholder="Wholesale or specific customer">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-production">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-production" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-production">Save Record</button>
                    </div>
                </div>
            </div>

            <!-- Production Report Modal -->
            <div id="production-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="production-report-title">Production Report</h3>
                        <button class="popout-modal-close" id="close-production-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="production-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-production-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-production-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Trend Analysis Modal -->
            <div id="trend-analysis-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="trend-analysis-title">Production Trend Analysis</h3>
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
        `;

        this.updateStats();
        this.setupEventListeners();
    },

    updateStats() {
        // Get today's date using DateUtils
        const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
        
        console.log('📅 Stats - Today is:', today);
        
        const todayEggs = this.productionData
            .filter(record => {
                const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
                return recordDate === today && record.product === 'eggs';
            })
            .reduce((sum, record) => sum + record.quantity, 0);

        // Calculate last 7 days
        const last7DaysDate = window.DateUtils ? 
            window.DateUtils.addDays(today, -7) : 
            (() => {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                return d.toISOString().split('T')[0];
            })();
        
        console.log('📅 Stats - Last 7 days from:', last7DaysDate);
        
        const weekBirds = this.productionData
            .filter(record => {
                const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
                return recordDate >= last7DaysDate && 
                       (record.product === 'broilers' || record.product === 'layers');
            })
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
        let filteredProduction = this.productionData;
        if (filter !== 'all') {
            filteredProduction = this.productionData.filter(record => record.product === filter);
        }

        if (filteredProduction.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No production records</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${filter === 'all' ? 'Add your first production record' : `No ${filter} production records found`}</div>
                </div>
            `;
        }

        const sortedProduction = filteredProduction.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Product</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Quantity</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Quality</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Batch</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Notes</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedProduction.map(record => {
                            const qualityClass = record.quality === 'excellent' ? '#10b981' :
                                                record.quality === 'grade-a' ? '#22c55e' :
                                                record.quality === 'grade-b' ? '#f59e0b' :
                                                record.quality === 'standard' ? '#3b82f6' : '#ef4444';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">${this.getProductIcon(record.product)}</span>
                                            <span style="font-weight: 500;">${this.formatProductName(record.product)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="font-weight: 600;">${record.quantity.toLocaleString()}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${record.unit}</div>
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                            background: ${qualityClass}20; color: ${qualityClass};">
                                            ${this.formatQuality(record.quality)}
                                        </span>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary);">${record.batch || '-'}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${record.notes || '-'}</td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-production" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-production" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
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

    renderProductSummary() {
        const productData = {};
        const products = ['eggs', 'broilers', 'layers', 'milk', 'pork', 'beef', 'other'];
        
        products.forEach(product => {
            const productRecords = this.productionData.filter(record => record.product === product);
            productData[product] = {
                count: productRecords.length,
                totalQuantity: productRecords.reduce((sum, record) => sum + record.quantity, 0),
                avgQuality: productRecords.length > 0 ? 
                    (productRecords.reduce((sum, record) => {
                        const qualityScores = { 'excellent': 5, 'grade-a': 4, 'grade-b': 3, 'standard': 2, 'rejects': 1 };
                        return sum + (qualityScores[record.quality] || 3);
                    }, 0) / productRecords.length).toFixed(1) : 0
            };
        });

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                ${products.filter(product => productData[product].count > 0).map(product => {
                    const data = productData[product];
                    return `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 20px;">${this.getProductIcon(product)}</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(product)}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Records:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${data.count}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Quantity:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${data.totalQuantity.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Avg Quality:</span>
                                <span style="font-weight: 600; color: ${data.avgQuality >= 4 ? '#22c55e' : data.avgQuality >= 3 ? '#f59e0b' : '#ef4444'};">${data.avgQuality}/5.0</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    setupEventListeners() {
        // Quick form
        document.getElementById('quick-production-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickProduction();
        });

        // Modal buttons
        document.getElementById('add-production-btn')?.addEventListener('click', () => this.showProductionModal());
        document.getElementById('production-report-btn')?.addEventListener('click', () => this.generateProductionReport());
        document.getElementById('trend-analysis-btn')?.addEventListener('click', () => this.generateTrendAnalysis());
        document.getElementById('export-production-btn')?.addEventListener('click', () => this.exportProduction());
        
        // Production modal handlers
        document.getElementById('save-production')?.addEventListener('click', () => this.saveProduction());
        document.getElementById('delete-production')?.addEventListener('click', () => this.deleteProduction());
        document.getElementById('cancel-production')?.addEventListener('click', () => this.hideProductionModal());
        document.getElementById('close-production-modal')?.addEventListener('click', () => this.hideProductionModal());
        
        // Sale checkbox handler
        document.getElementById('production-for-sale')?.addEventListener('change', (e) => {
            document.getElementById('sale-details').style.display = e.target.checked ? 'block' : 'none';
        });
        
        // Report modal handlers
        document.getElementById('close-production-report')?.addEventListener('click', () => this.hideProductionReportModal());
        document.getElementById('close-production-report-btn')?.addEventListener('click', () => this.hideProductionReportModal());
        document.getElementById('print-production-report')?.addEventListener('click', () => this.printProductionReport());
        
        // Trend analysis modal handlers
        document.getElementById('close-trend-analysis')?.addEventListener('click', () => this.hideTrendAnalysisModal());
        document.getElementById('close-trend-analysis-btn')?.addEventListener('click', () => this.hideTrendAnalysisModal());
        document.getElementById('print-trend-analysis')?.addEventListener('click', () => this.printTrendAnalysis());
        
        // Filter
        document.getElementById('production-filter')?.addEventListener('change', (e) => {
            document.getElementById('production-table').innerHTML = this.renderProductionTable(e.target.value);
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideProductionModal();
                this.hideProductionReportModal();
                this.hideTrendAnalysisModal();
            }
        });

        // Edit/delete production buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-production')) {
                const recordId = e.target.closest('.edit-production').dataset.id;
                this.editProduction(recordId);
            }
            
            if (e.target.closest('.delete-production')) {
                e.preventDefault();
                e.stopPropagation();
                
                const deleteBtn = e.target.closest('.delete-production');
                const recordId = deleteBtn.dataset.id;
                
                if (recordId && !deleteBtn.dataset.processing) {
                    deleteBtn.dataset.processing = 'true';
                    this.deleteProductionRecord(recordId);
                    
                    setTimeout(() => {
                        deleteBtn.dataset.processing = '';
                    }, 1000);
                }
            }
        });
    },

    // MODAL CONTROL METHODS
    showProductionModal() {
        // Hide any open modals
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // Show the production modal
        document.getElementById('production-modal').classList.remove('hidden');
        
        // Check if we're editing or creating new
        const productionId = document.getElementById('production-id').value;
        
        if (!productionId) {
            // New record - set today's date using DateUtils
            const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
            
            console.log('📅 Setting today\'s date in modal:', today);
            document.getElementById('production-date').value = today;
            document.getElementById('production-modal-title').textContent = 'New Production Record';
            document.getElementById('delete-production').style.display = 'none';
        } else {
            // Editing - show delete button
            document.getElementById('delete-production').style.display = 'block';
            document.getElementById('production-modal-title').textContent = 'Edit Production Record';
        }
    },

    hideProductionModal() {
        document.getElementById('production-modal').classList.add('hidden');
    },

    showProductionReportModal() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('production-report-modal').classList.remove('hidden');
    },

    hideProductionReportModal() {
        document.getElementById('production-report-modal').classList.add('hidden');
    },

    showTrendAnalysisModal() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('trend-analysis-modal').classList.remove('hidden');
    },

    hideTrendAnalysisModal() {
        document.getElementById('trend-analysis-modal').classList.add('hidden');
    },

    // PRODUCTION CRUD METHODS
    handleQuickProduction() {
        const product = document.getElementById('quick-product').value;
        const quantity = parseInt(document.getElementById('quick-quantity').value);
        const unit = document.getElementById('quick-unit').value;
        const quality = document.getElementById('quick-quality').value;

        if (!product || !quantity || !quality) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Get today's date using DateUtils
        const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
        const storageDate = window.DateUtils ? window.DateUtils.toStorageFormat(today) : today;

        console.log('📅 Quick production - Today:', today, 'Storage:', storageDate);

        const productionData = {
            id: Date.now(),
            date: storageDate,
            product: product,
            quantity: quantity,
            unit: unit,
            quality: quality,
            batch: '',
            notes: 'Quick entry'
        };

        this.addProduction(productionData);
        
        // Reset form
        document.getElementById('quick-production-form').reset();
        this.showNotification('Production recorded successfully!', 'success');
    },

    saveProduction() {
        const form = document.getElementById('production-form');
        if (!form) {
            console.error('❌ Production form not found');
            return;
        }

        const productionId = document.getElementById('production-id').value;
        const dateInput = document.getElementById('production-date').value;
        const product = document.getElementById('production-product').value;
        const quantity = parseInt(document.getElementById('production-quantity').value);
        const unit = document.getElementById('production-unit').value;
        const quality = document.getElementById('production-quality').value;
        const batch = document.getElementById('production-batch').value.trim();
        const notes = document.getElementById('production-notes').value.trim();
        const forSale = document.getElementById('production-for-sale').checked;
        const salePrice = parseFloat(document.getElementById('sale-price').value) || 0;
        const customer = document.getElementById('customer-name').value.trim();

        console.log('📅 Save - Raw date input:', dateInput);

        if (!dateInput || !product || !quantity || !unit || !quality) {
            this.showNotification('Please fill in all required fields', 'error');
                    // Use DateUtils for consistent date handling
        let storageDate;
        if (window.DateUtils) {
            storageDate = window.DateUtils.toStorageFormat(dateInput);
            console.log('📅 Save - Using DateUtils:', dateInput, '->', storageDate);
        } else {
            storageDate = dateInput;
        }

        const productionData = {
            id: productionId ? parseInt(productionId) : Date.now(),
            date: storageDate,
            product: product,
            quantity: quantity,
            unit: unit,
            quality: quality,
            batch: batch || '',
            notes: notes || ''
        };

        if (productionId) {
            // Update existing record
            const index = this.productionData.findIndex(record => record.id === parseInt(productionId));
            if (index !== -1) {
                this.productionData[index] = productionData;
                this.showNotification('Production record updated!', 'success');
            }
        } else {
            // Add new record
            this.productionData.unshift(productionData);
            this.showNotification('Production record added!', 'success');
            
            // Handle sale if marked for sale
            if (forSale && salePrice > 0) {
                this.createSaleRecord(productionData, salePrice, customer);
            }
        }

        this.saveData();
        this.updateStats();
        this.hideProductionModal();
        this.renderModule();
    },

    createSaleRecord(productionData, price, customer = '') {
        console.log('💵 Creating sale record for production:', productionData);
        
        // Get today's date for sale
        const saleDate = window.DateUtils ? 
            window.DateUtils.getToday() : 
            new Date().toISOString().split('T')[0];
        
        const saleRecord = {
            id: Date.now(),
            productionId: productionData.id,
            date: saleDate,
            product: productionData.product,
            quantity: productionData.quantity,
            unit: productionData.unit,
            pricePerUnit: price,
            totalPrice: productionData.quantity * price,
            customer: customer || '',
            status: 'completed',
            notes: `Auto-generated from production record #${productionData.id}`
        };

        // Save to sales module if available
        if (window.SalesModule && window.SalesModule.addSale) {
            window.SalesModule.addSale(saleRecord);
            this.showNotification(`Sale record created for $${saleRecord.totalPrice.toFixed(2)}!`, 'success');
        } else {
            // Store in local storage for later use
            const salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
            salesData.push(saleRecord);
            localStorage.setItem('farm-sales-data', JSON.stringify(salesData));
            this.showNotification(`Sale record saved for later import!`, 'info');
        }
    },

    editProduction(recordId) {
        const record = this.productionData.find(r => r.id === parseInt(recordId));
        if (!record) return;

        this.currentRecordId = record.id;
        
        // Convert date for input field using DateUtils
        let inputDate;
        if (window.DateUtils) {
            inputDate = window.DateUtils.toInputFormat(record.date);
            console.log('📅 Edit - Converting date for input:', record.date, '->', inputDate);
        } else {
            inputDate = record.date;
        }

        document.getElementById('production-id').value = record.id;
        document.getElementById('production-date').value = inputDate;
        document.getElementById('production-product').value = record.product;
        document.getElementById('production-quantity').value = record.quantity;
        document.getElementById('production-unit').value = record.unit;
        document.getElementById('production-quality').value = record.quality;
        document.getElementById('production-batch').value = record.batch || '';
        document.getElementById('production-notes').value = record.notes || '';
        
        this.showProductionModal();
    },

    deleteProduction() {
        if (!this.currentRecordId) return;

        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(this.currentRecordId);
            this.hideProductionModal();
        }
    },

    deleteProductionRecord(recordId) {
        const index = this.productionData.findIndex(r => r.id === parseInt(recordId));
        if (index !== -1) {
            this.productionData.splice(index, 1);
            this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Production record deleted', 'success');
        }
    },

    // REPORT GENERATION METHODS
    generateProductionReport() {
        const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
        const lastWeek = window.DateUtils ? 
            window.DateUtils.addDays(today, -7) : 
            (() => {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                return d.toISOString().split('T')[0];
            })();
        
        // Generate report content
        const reportContent = this.getProductionReportContent();
        document.getElementById('production-report-content').innerHTML = reportContent;
        this.showProductionReportModal();
    },

    getProductionReportContent() {
        const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
        const startOfMonth = window.DateUtils ? 
            window.DateUtils.getFirstDayOfMonth(today) : 
            (() => {
                const d = new Date();
                d.setDate(1);
                return d.toISOString().split('T')[0];
            })();
        
        // Group data by product
        const productStats = {};
        const monthlyData = this.productionData.filter(record => {
            const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
            return recordDate >= startOfMonth;
        });

        monthlyData.forEach(record => {
            if (!productStats[record.product]) {
                productStats[record.product] = {
                    total: 0,
                    count: 0,
                    qualityCounts: {}
                };
            }
            productStats[record.product].total += record.quantity;
            productStats[record.product].count++;
            
            if (!productStats[record.product].qualityCounts[record.quality]) {
                productStats[record.product].qualityCounts[record.quality] = 0;
            }
            productStats[record.product].qualityCounts[record.quality] += record.quantity;
        });

        return `
            <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
                <h1 style="color: var(--text-primary); margin-bottom: 4px;">Farm Production Report</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Generated on ${this.formatDate(today)} | Records: ${this.productionData.length}
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin-bottom: 16px;">📈 Monthly Summary</h3>
                        <div style="font-size: 48px; font-weight: bold; color: var(--primary); text-align: center; margin: 16px 0;">
                            ${monthlyData.reduce((sum, record) => sum + record.quantity, 0).toLocaleString()}
                        </div>
                        <div style="text-align: center; color: var(--text-secondary);">Total Production This Month</div>
                    </div>
                    
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin-bottom: 16px;">⭐ Quality Distribution</h3>
                        ${this.renderQualityChart()}
                    </div>
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Production by Product</h3>
                <div style="overflow-x: auto; margin-bottom: 32px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Product</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Total Quantity</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Records</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Quality Breakdown</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(productStats).map(([product, stats]) => `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 20px;">${this.getProductIcon(product)}</span>
                                            <span style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(product)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px; font-weight: 600; color: var(--text-primary);">
                                        ${stats.total.toLocaleString()}
                                    </td>
                                    <td style="padding: 12px; color: var(--text-primary);">${stats.count}</td>
                                    <td style="padding: 12px;">
                                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                            ${Object.entries(stats.qualityCounts).map(([quality, count]) => {
                                                const qualityClass = this.getQualityColor(quality);
                                                return `
                                                    <span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; 
                                                        background: ${qualityClass}20; color: ${qualityClass};">
                                                        ${this.formatQuality(quality)}: ${count}
                                                    </span>
                                                `;
                                            }).join('')}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📅 Recent Production Activity</h3>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border: 1px solid var(--glass-border);">
                    ${this.renderRecentActivity(10)}
                </div>
            </div>
        `;
    },

    renderQualityChart() {
        const qualityCounts = {};
        this.productionData.forEach(record => {
            qualityCounts[record.quality] = (qualityCounts[record.quality] || 0) + 1;
        });

        const total = Object.values(qualityCounts).reduce((a, b) => a + b, 0);
        if (total === 0) return '<div style="color: var(--text-secondary); text-align: center;">No quality data</div>';

        return Object.entries(qualityCounts).map(([quality, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const color = this.getQualityColor(quality);
            return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: var(--text-primary);">${this.formatQuality(quality)}</span>
                        <span style="color: var(--text-secondary);">${percentage}%</span>
                    </div>
                    <div style="height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderRecentActivity(limit = 10) {
        const recent = this.productionData
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        if (recent.length === 0) {
            return '<div style="color: var(--text-secondary); text-align: center;">No recent activity</div>';
        }

        return recent.map(record => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 20px;">${this.getProductIcon(record.product)}</div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(record.product)}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${this.formatDate(record.date)} • ${record.batch || 'No batch'}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-primary);">${record.quantity.toLocaleString()} ${record.unit}</div>
                    <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; 
                        background: ${this.getQualityColor(record.quality)}20; color: ${this.getQualityColor(record.quality)};">
                        ${this.formatQuality(record.quality)}
                    </span>
                </div>
            </div>
        `).join('');
    },

    printProductionReport() {
        const printContent = document.getElementById('production-report-content').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Farm Production Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #2c3e50; }
                    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                    .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .quality-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                    @media print {
                        @page { size: portrait; margin: 20mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        this.renderModule(); // Restore the module view
    },

    // TREND ANALYSIS METHODS
    generateTrendAnalysis() {
        const analysisContent = this.getTrendAnalysisContent();
        document.getElementById('trend-analysis-content').innerHTML = analysisContent;
        this.showTrendAnalysisModal();
    },

    getTrendAnalysisContent() {
        // Group data by month and product
        const monthlyData = {};
        
        this.productionData.forEach(record => {
            const date = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
            const month = date.substring(0, 7); // YYYY-MM format
            
            if (!monthlyData[month]) {
                monthlyData[month] = {};
            }
            
            if (!monthlyData[month][record.product]) {
                monthlyData[month][record.product] = {
                    total: 0,
                    count: 0
                };
            }
            
            monthlyData[month][record.product].total += record.quantity;
            monthlyData[month][record.product].count++;
        });

        // Get all months and products
        const months = Object.keys(monthlyData).sort();
        const allProducts = [...new Set(this.productionData.map(r => r.product))];

        return `
            <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
                <h1 style="color: var(--text-primary); margin-bottom: 4px;">Production Trend Analysis</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Analyzing ${this.productionData.length} records across ${months.length} months
                </p>
                
                <div style="background: var(--glass-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--glass-border); margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">📈 Monthly Production Trends</h3>
                    ${this.renderMonthlyTrendChart(monthlyData)}
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Detailed Monthly Data</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Month</th>
                                ${allProducts.map(product => `
                                    <th style="padding: 12px; text-align: left; color: var(--text-secondary);">
                                        ${this.formatProductName(product)}
                                    </th>
                                `).join('')}
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${months.map(month => {
                                const monthData = monthlyData[month];
                                const monthTotal = Object.values(monthData).reduce((sum, data) => sum + data.total, 0);
                                const monthFormatted = window.DateUtils ? 
                                    window.DateUtils.formatMonth(month) : 
                                    new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                
                                return `
                                    <tr style="border-bottom: 1px solid var(--glass-border);">
                                        <td style="padding: 12px; font-weight: 600; color: var(--text-primary);">
                                            ${monthFormatted}
                                        </td>
                                        ${allProducts.map(product => {
                                            const data = monthData[product];
                                            return `
                                                <td style="padding: 12px; color: var(--text-primary);">
                                                    ${data ? data.total.toLocaleString() : '-'}
                                                </td>
                                            `;
                                        }).join('')}
                                        <td style="padding: 12px; font-weight: 600; color: var(--primary);">
                                            ${monthTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderMonthlyTrendChart(monthlyData) {
        const months = Object.keys(monthlyData).sort();
        if (months.length === 0) {
            return '<div style="color: var(--text-secondary); text-align: center;">No monthly data available</div>';
        }

        // Get the top 3 products for the chart
        const productTotals = {};
        this.productionData.forEach(record => {
            productTotals[record.product] = (productTotals[record.product] || 0) + record.quantity;
        });

        const topProducts = Object.entries(productTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([product]) => product);

        // Prepare chart data
        const chartData = months.map(month => {
            const data = { month: window.DateUtils ? 
                window.DateUtils.formatMonthShort(month) : 
                new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }) };
            
            topProducts.forEach(product => {
                data[product] = monthlyData[month][product] ? monthlyData[month][product].total : 0;
            });
            
            return data;
        });

        // Find max value for scaling
        const maxValue = Math.max(...chartData.flatMap(d => 
            topProducts.map(product => d[product] || 0)
        ));

        return `
            <div style="margin-top: 20px;">
                ${chartData.map(data => `
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="min-width: 60px; color: var(--text-primary);">${data.month}</div>
                            <div style="flex: 1; display: flex; gap: 4px; height: 30px; align-items: flex-end;">
                                ${topProducts.map((product, idx) => {
                                    const value = data[product] || 0;
                                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                                    return `
                                        <div style="
                                            flex: 1;
                                            height: ${percentage}%;
                                            background: ${colors[idx % colors.length]};
                                            border-radius: 4px 4px 0 0;
                                            position: relative;
                                        " title="${this.formatProductName(product)}: ${value.toLocaleString()}">
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div style="display: flex; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--glass-border);">
                    ${topProducts.map((product, idx) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                        return `
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; background: ${colors[idx]}; border-radius: 3px;"></div>
                                <span style="color: var(--text-primary);">${this.formatProductName(product)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    printTrendAnalysis() {
        const printContent = document.getElementById('trend-analysis-content').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Production Trend Analysis</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #2c3e50; }
                    .chart { margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    @media print {
                        @page { size: landscape; margin: 15mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        this.renderModule();
    },

    // EXPORT FUNCTIONALITY
    exportProduction() {
        const dataStr = JSON.stringify(this.productionData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `farm-production-${window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        this.showNotification('Production data exported successfully!', 'success');
    },

    // UTILITY METHODS
    formatDate(dateString) {
        if (window.DateUtils) {
            return window.DateUtils.formatDate(dateString);
        }
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },

    getProductIcon(product) {
        const icons = {
            'eggs': '🥚',
            'broilers': '🐔',
            'layers': '🐓',
            'milk': '🥛',
            'pork': '🐖',
            'beef': '🐄',
            'other': '📦'
        };
        return icons[product] || '📦';
    },

    formatProductName(product) {
        const names = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'milk': 'Milk',
            'pork': 'Pork',
            'beef': 'Beef',
            'other': 'Other'
        };
        return names[product] || product.charAt(0).toUpperCase() + product.slice(1);
    },

    formatQuality(quality) {
        const qualityMap = {
            'excellent': '⭐ Excellent',
            'grade-a': '🟢 Grade A',
            'grade-b': '🟡 Grade B',
            'standard': '🔵 Standard',
            'rejects': '🔴 Rejects'
        };
        return qualityMap[quality] || quality;
    },

    getQualityColor(quality) {
        const colors = {
            'excellent': '#10b981',
            'grade-a': '#22c55e',
            'grade-b': '#f59e0b',
            'standard': '#3b82f6',
            'rejects': '#ef4444'
        };
        return colors[quality] || '#6b7280';
    },

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            alert(message); // Fallback
        }
    }
};

// Export module
window.ProductionModule = ProductionModule;
console.log('✅ Production module loaded and ready');
