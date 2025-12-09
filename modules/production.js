// modules/production.js - COMPLETE REWRITTEN VERSION WITH ALL FIXES
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
        
        console.log('✅ Production Records initialized');
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
    const today = window.DateUtils 
        ? window.DateUtils.getToday() 
        : new Date().toISOString().split('T')[0];
    
    // Helper function to get previous dates
    const getPreviousDate = (daysAgo) => {
        if (window.DateUtils && typeof window.DateUtils.addDays === 'function') {
            return window.DateUtils.addDays(today, -daysAgo);
        }
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
    const today = window.DateUtils 
        ? window.DateUtils.getToday() 
        : new Date().toISOString().split('T')[0];
    
    console.log('📅 Today is:', today);
    
    const todayEggs = this.productionData
        .filter(record => record.date === today && record.product === 'eggs')
        .reduce((sum, record) => sum + record.quantity, 0);

    // Calculate last 7 days using DateUtils if available
    let last7DaysStr;
    if (window.DateUtils && typeof window.DateUtils.addDays === 'function') {
        last7DaysStr = window.DateUtils.addDays(today, -7);
    } else {
        const last7DaysDate = new Date();
        last7DaysDate.setDate(last7DaysDate.getDate() - 7);
        const year = last7DaysDate.getFullYear();
        const month = String(last7DaysDate.getMonth() + 1).padStart(2, '0');
        const day = String(last7DaysDate.getDate()).padStart(2, '0');
        last7DaysStr = `${year}-${month}-${day}`;
    }
    
    console.log('📅 Last 7 days from:', last7DaysStr);
    
    const weekBirds = this.productionData
        .filter(record => record.date >= last7DaysStr && 
                       (record.product === 'broilers' || record.product === 'layers'))
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
                this.hideAllModals();
            }
        });

        // Edit/delete production buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-production')) {
                const recordId = e.target.closest('.edit-production').dataset.id;
                this.editProduction(recordId);
            }
            
            // Fixed delete button with anti-double-click
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

// MODAL CONTROL METHODS - CORRECTED VERSION
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
        const today = window.DateUtils 
            ? window.DateUtils.getToday() 
            : new Date().toISOString().split('T')[0];
        
        console.log('📅 Setting today\'s date:', today);
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
    const modal = document.getElementById('production-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
},

showProductionReportModal() {
    this.hideProductionModal();
    this.hideProductionReportModal();
    this.hideTrendAnalysisModal();
    
    document.getElementById('production-report-modal').classList.remove('hidden');
},

hideProductionReportModal() {
    const modal = document.getElementById('production-report-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
},

showTrendAnalysisModal() {
    this.hideProductionModal();
    this.hideProductionReportModal();
    this.hideTrendAnalysisModal();
    
    document.getElementById('trend-analysis-modal').classList.remove('hidden');
},

hideTrendAnalysisModal() {
    const modal = document.getElementById('trend-analysis-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
},

// Remove the hideAllModals() method or fix it:
hideAllModals() {
    // Directly hide each modal instead of calling methods
    document.getElementById('production-modal')?.classList.add('hidden');
    document.getElementById('production-report-modal')?.classList.add('hidden');
    document.getElementById('trend-analysis-modal')?.classList.add('hidden');
},
    showProductionReportModal() {
        this.hideAllModals();
        document.getElementById('production-report-modal').classList.remove('hidden');
    },

    hideProductionReportModal() {
        document.getElementById('production-report-modal').classList.add('hidden');
    },

    showTrendAnalysisModal() {
        this.hideAllModals();
        document.getElementById('trend-analysis-modal').classList.remove('hidden');
    },

    hideTrendAnalysisModal() {
        document.getElementById('trend-analysis-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideProductionModal();
        this.hideProductionReportModal();
        this.hideTrendAnalysisModal();
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
    const today = window.DateUtils 
        ? window.DateUtils.getToday() 
        : new Date().toISOString().split('T')[0];

    const productionData = {
        id: Date.now(),
        date: today,
        product: product,
        quantity: quantity,
        unit: unit,
        quality: quality,
        batch: '',
        notes: 'Quick entry'
    };

    console.log('📅 Saving quick record with date:', today);
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
//const date = document.getElementById('production-date').value;

    const dateInput = document.getElementById('production-date').value;
    console.log('📅 Raw date from input:', dateInput);
    
    // Convert input date to storage format
    const storageDate = this.toStorageFormat(dateInput);
    console.log('📅 Date for storage:', storageDate);
    
    const productionData = {
        id: productionId ? parseInt(productionId) : Date.now(),
        date: storageDate, // Use the converted date
        // ... other fields ...
        
    console.log('📅 Date from form input:', date);
    console.log('📅 Date from form input (raw):', document.getElementById('production-date').value);
    
    const product = document.getElementById('production-product').value;
    const quantity = parseInt(document.getElementById('production-quantity').value);
    const unit = document.getElementById('production-unit').value;
    const quality = document.getElementById('production-quality').value;
    const batch = document.getElementById('production-batch').value.trim();
    const notes = document.getElementById('production-notes').value.trim();
    const forSale = document.getElementById('production-for-sale').checked;
    const salePrice = parseFloat(document.getElementById('sale-price').value) || 0;
    const customer = document.getElementById('customer-name').value.trim();

    if (!date || !product || !quantity || !unit || !quality) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (quantity <= 0) {
        this.showNotification('Quantity must be greater than 0', 'error');
        return;
    }

    const productionData = {
        id: productionId ? parseInt(productionId) : Date.now(),
        date: date, // This should already be in YYYY-MM-DD format from DateUtils
        product: product,
        quantity: quantity,
        unit: unit,
        quality: quality,
        batch: batch || '',
        notes: notes || ''
    };

    console.log('💾 Saving production data:', productionData);

    if (productionId) {
        console.log('🔄 Updating existing record');
        this.updateProduction(parseInt(productionId), productionData);
    } else {
        console.log('🆕 Creating new record');
        this.addProduction(productionData);
    }

    if (forSale && salePrice > 0) {
        this.createSalesRecord(productionData, { price: salePrice, customer: customer });
    }

    this.hideProductionModal();
},
    
editProduction(recordId) {
    console.log('✏️ Editing record ID:', recordId);
    
    const production = this.productionData.find(p => p.id == recordId);
    
    if (!production) {
        console.error('❌ Production not found for ID:', recordId);
        this.showNotification('Record not found', 'error');
        return;
    }

    console.log('📋 Found record:', production);
    console.log('📅 Original stored date:', production.date);
    
    // Populate form fields
    document.getElementById('production-id').value = production.id;
    
    // Convert stored date to local date for input
    const localDate = this.toLocalDateInput(production.date);
    console.log('📅 Local date for input field:', localDate);
    document.getElementById('production-date').value = localDate;
        
    // Populate form fields using DateUtils
    document.getElementById('production-id').value = production.id;
    
    // Use DateUtils for date formatting
    const formattedDate = window.DateUtils 
        ? window.DateUtils.toInputFormat(production.date)
        : production.date;
    
    console.log('📅 Formatted date for input:', formattedDate);
    document.getElementById('production-date').value = formattedDate;
    
    document.getElementById('production-product').value = production.product;
    document.getElementById('production-quantity').value = production.quantity;
    document.getElementById('production-unit').value = production.unit;
    document.getElementById('production-quality').value = production.quality;
    document.getElementById('production-batch').value = production.batch || '';
    document.getElementById('production-notes').value = production.notes || '';
    document.getElementById('delete-production').style.display = 'block';
    document.getElementById('production-modal-title').textContent = 'Edit Production Record';
    
    // Reset sale section
    document.getElementById('production-for-sale').checked = false;
    document.getElementById('sale-details').style.display = 'none';
    
    // Show the modal
    this.showProductionModal();
},
    
    updateProduction(productionId, productionData) {
        const productionIndex = this.productionData.findIndex(p => p.id == productionId);
        
        if (productionIndex !== -1) {
            const oldQuantity = this.productionData[productionIndex].quantity;
            const newQuantity = productionData.quantity;
            
            // Update production record
            this.productionData[productionIndex] = {
                ...this.productionData[productionIndex],
                ...productionData
            };
            
            this.saveData();
            this.updateStats();
            this.updateProductionTable();
            this.updateProductSummary();
            
            // Update inventory if quantity changed
            if (oldQuantity !== newQuantity && ['broilers', 'layers', 'pork', 'beef'].includes(productionData.product)) {
                const quantityDiff = newQuantity - oldQuantity;
                if (quantityDiff !== 0) {
                    this.updateInventoryQuantity(productionId, quantityDiff);
                }
            }
            
            this.showNotification('Production record updated successfully!', 'success');
        }
    },

    deleteProduction() {
        const productionId = document.getElementById('production-id').value;
        
        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(productionId);
            this.hideProductionModal();
        }
    },

    deleteProductionRecord(productionId) {
        // First check if record exists
        const recordIndex = this.productionData.findIndex(p => p.id == productionId);
        
        if (recordIndex === -1) {
            this.showNotification('Record not found or already deleted', 'error');
            return;
        }
        
        const record = this.productionData[recordIndex];
        
        if (confirm('Are you sure you want to delete this production record? This will also remove it from inventory.')) {
            // Remove from inventory if it was linked
            if (['broilers', 'layers', 'pork', 'beef'].includes(record.product)) {
                this.removeFromInventory(productionId);
            }
            
            // Remove from production data
            this.productionData = this.productionData.filter(p => p.id != productionId);
            
            // Save immediately
            this.saveData();
            
            // Update UI components
            this.updateStats();
            this.updateProductionTable();
            this.updateProductSummary();
            
            this.showNotification('Production record deleted successfully', 'success');
        }
    },

    // Add these methods to your ProductionModule

// CORRECTED: Get today's date in YOUR local timezone (GMT-4)
getLocalToday() {
    const now = new Date();
    
    // For your GMT-4 timezone, we need to account for the offset
    // When it's midnight UTC, it's 8 PM previous day in Bolivia
    // So we need to use LOCAL methods, not UTC methods
    
    const localYear = now.getFullYear();
    const localMonth = now.getMonth() + 1; // 0-indexed
    const localDay = now.getDate();
    
    console.log('📅 getLocalToday():', {
        now: now.toString(),
        localYear, localMonth, localDay,
        getUTCDate: now.getUTCDate(),
        getDate: now.getDate(),
        timezoneOffset: now.getTimezoneOffset()
    });
    
    return `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
},

// CORRECTED: Convert date string to local date for input field
toLocalDateInput(dateString) {
    if (!dateString) return '';
    
    console.log('📅 toLocalDateInput input:', dateString);
    
    // If it's already in YYYY-MM-DD format from storage
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Parse it as LOCAL date (midnight in local timezone)
        const date = new Date(dateString + 'T00:00:00');
        const localYear = date.getFullYear();
        const localMonth = date.getMonth() + 1;
        const localDay = date.getDate();
        
        const result = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
        console.log('📅 toLocalDateInput result:', result, {
            original: dateString,
            dateObj: date.toString(),
            getDate: date.getDate(),
            getUTCDate: date.getUTCDate()
        });
        
        return result;
    }
    
    try {
        const date = new Date(dateString);
        const localYear = date.getFullYear();
        const localMonth = date.getMonth() + 1;
        const localDay = date.getDate();
        
        return `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
    } catch (e) {
        console.error('Date conversion error:', e);
        return '';
    }
},

// For saving: Convert input date to storage format
toStorageFormat(dateString) {
    if (!dateString) return '';
    
    console.log('📅 toStorageFormat input:', dateString);
    
    // Input is in YYYY-MM-DD (local date)
    // We need to store it as YYYY-MM-DD but interpreted as LOCAL date
    // When we create a Date object from YYYY-MM-DD, JavaScript assumes UTC
    // So we need to adjust for timezone
    
    const date = new Date(dateString + 'T00:00:00');
    
    // Adjust for timezone offset (add offset minutes to get UTC midnight)
    const offsetMinutes = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() + (offsetMinutes * 60000));
    
    const year = adjustedDate.getUTCFullYear();
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    
    const result = `${year}-${month}-${day}`;
    
    console.log('📅 toStorageFormat result:', result, {
        input: dateString,
        dateObj: date.toString(),
        adjustedDate: adjustedDate.toString(),
        offsetMinutes,
        getDate: date.getDate(),
        getUTCDate: date.getUTCDate()
    });
    
    return result;
},

    

    // INVENTORY LINKING METHODS
    linkToInventory(productionRecord) {
        // For broilers, layers, and other animals that become carcasses
        if (['broilers', 'layers', 'pork', 'beef'].includes(productionRecord.product)) {
            const inventoryItem = {
                name: this.formatProductName(productionRecord.product) + ' Carcasses',
                category: 'meat',
                currentStock: productionRecord.quantity,
                minStock: 0,
                unit: productionRecord.unit === 'birds' ? 'pieces' : productionRecord.unit,
                unitCost: this.calculateCost(productionRecord),
                lastUpdated: new Date().toISOString(),
                source: 'production',
                productionId: productionRecord.id,
                quality: productionRecord.quality
            };
            
            this.updateInventory(inventoryItem);
        }
    },

    updateInventory(inventoryItem) {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        
        // Check if item already exists
        const existingIndex = inventory.findIndex(item => 
            item.name === inventoryItem.name && item.source === 'production'
        );
        
        if (existingIndex !== -1) {
            // Update existing item
            inventory[existingIndex].currentStock += inventoryItem.currentStock;
            inventory[existingIndex].lastUpdated = inventoryItem.lastUpdated;
        } else {
            // Add new item
            inventory.push(inventoryItem);
        }
        
        localStorage.setItem('farm-inventory', JSON.stringify(inventory));
        
        console.log('✅ Inventory updated with production:', inventoryItem);
    },

    calculateCost(productionRecord) {
        // Simple cost calculation
        const baseCosts = {
            'broilers': 5,    // $5 per bird
            'layers': 8,      // $8 per bird
            'pork': 50,       // $50 per pig
            'beef': 300       // $300 per cow
        };
        
        return baseCosts[productionRecord.product] || 10;
    },

    updateInventoryQuantity(productionId, quantityDiff) {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const inventoryItem = inventory.find(item => 
            item.productionId == productionId && item.source === 'production'
        );
        
        if (inventoryItem) {
            inventoryItem.currentStock += quantityDiff;
            inventoryItem.lastUpdated = new Date().toISOString();
            
            if (inventoryItem.currentStock <= 0) {
                // Remove from inventory if stock is 0 or negative
                const itemIndex = inventory.findIndex(item => 
                    item.productionId == productionId && item.source === 'production'
                );
                inventory.splice(itemIndex, 1);
            }
            
            localStorage.setItem('farm-inventory', JSON.stringify(inventory));
            console.log('✅ Inventory quantity updated:', quantityDiff);
        }
    },

    removeFromInventory(productionId) {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const updatedInventory = inventory.filter(item => 
            item.productionId != productionId
        );
        
        if (inventory.length !== updatedInventory.length) {
            localStorage.setItem('farm-inventory', JSON.stringify(updatedInventory));
            console.log('✅ Removed from inventory:', productionId);
        }
    },

    // SALES INTEGRATION METHODS
    createSalesRecord(productionData, saleDetails) {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        
        const saleRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            items: [{
                product: this.formatProductName(productionData.product),
                quantity: productionData.quantity,
                unit: productionData.unit === 'birds' ? 'pieces' : productionData.unit,
                price: saleDetails.price,
                total: productionData.quantity * saleDetails.price
            }],
            totalAmount: productionData.quantity * saleDetails.price,
            customer: saleDetails.customer || 'Direct Sale',
            status: 'completed',
            paymentMethod: 'cash',
            notes: `From production batch ${productionData.batch || productionData.id}`,
            productionId: productionData.id
        };
        
        sales.push(saleRecord);
        localStorage.setItem('farm-sales', JSON.stringify(sales));
        
        console.log('✅ Sales record created:', saleRecord);
        
        // Update inventory by subtracting sold amount
        this.updateInventoryAfterSale(productionData, saleRecord.id);
    },

    updateInventoryAfterSale(productionData, saleId) {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const inventoryItem = inventory.find(item => 
            item.productionId == productionData.id && item.source === 'production'
        );
        
        if (inventoryItem) {
            inventoryItem.currentStock -= productionData.quantity;
            inventoryItem.lastUpdated = new Date().toISOString();
            
            if (inventoryItem.currentStock <= 0) {
                // Remove from inventory if stock is depleted
                const itemIndex = inventory.findIndex(item => 
                    item.productionId == productionData.id && item.source === 'production'
                );
                inventory.splice(itemIndex, 1);
            }
            
            localStorage.setItem('farm-inventory', JSON.stringify(inventory));
            console.log('✅ Inventory updated after sale:', inventoryItem);
        }
    },

    // REPORT METHODS
    generateProductionReport() {
        const stats = this.calculateDetailedStats();
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 Production Overview Report</h4>';
        
        // Summary Section
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 PRODUCTION SUMMARY:</h5>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Records</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.totalRecords}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Today\'s Eggs</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.todayEggs}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Weekly Birds</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.weekBirds}</div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Avg Quality</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${stats.avgQuality}/5.0</div>
                </div>
            </div>
        </div>`;
        
        // Product Distribution
        report += `<div style="margin-bottom: 24px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">🗂️ PRODUCT DISTRIBUTION:</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">`;
        
        Object.entries(stats.productDistribution).forEach(([product, quantity]) => {
            const percentage = stats.totalQuantity > 0 ? Math.round((quantity / stats.totalQuantity) * 100) : 0;
            report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">${this.getProductIcon(product)}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(product)}</span>
                    </div>
                    <span style="font-weight: 600; color: var(--text-primary);">${quantity.toLocaleString()}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex-grow: 1; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: var(--primary-color); border-radius: 4px;"></div>
                    </div>
                    <span style="font-size: 12px; color: var(--text-secondary);">${percentage}%</span>
                </div>
            </div>`;
        });
        report += '</div></div>';
        
        // Quality Distribution
        report += `<div style="margin-bottom: 20px;">
            <h5 style="color: var(--text-primary); margin-bottom: 12px;">⭐ QUALITY DISTRIBUTION:</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">`;
        
        Object.entries(stats.qualityDistribution).forEach(([quality, count]) => {
            const percentage = stats.totalRecords > 0 ? Math.round((count / stats.totalRecords) * 100) : 0;
            const qualityColor = quality === 'excellent' ? '#10b981' :
                               quality === 'grade-a' ? '#22c55e' :
                               quality === 'grade-b' ? '#f59e0b' :
                               quality === 'standard' ? '#3b82f6' : '#ef4444';
            
            report += `<div style="padding: 12px; background: ${qualityColor}10; border-radius: 8px; border-left: 4px solid ${qualityColor};">
                <div style="font-weight: 600; color: ${qualityColor}; margin-bottom: 4px;">${this.formatQuality(quality)}</div>
                <div style="font-size: 14px; color: var(--text-primary);">${count} records</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${percentage}% of total</div>
            </div>`;
        });
        report += '</div></div>';
        
        // Recent Production Activity
        const recentProduction = this.productionData.slice(0, 5);
        if (recentProduction.length > 0) {
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📋 RECENT ACTIVITY (Last 5):</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            
            recentProduction.forEach(record => {
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(record.product)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${this.formatDate(record.date)} • ${record.batch || 'No batch'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: var(--text-primary);">${record.quantity} ${record.unit}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${this.formatQuality(record.quality)}</div>
                        </div>
                    </div>
                </div>`;
            });
            report += '</div></div>';
        }
        
        report += '</div>';

        document.getElementById('production-report-content').innerHTML = report;
        document.getElementById('production-report-title').textContent = 'Production Report';
        this.showProductionReportModal();
    },

    generateTrendAnalysis() {
        const weeklyTrends = this.calculateWeeklyTrends();
        
        let analysis = '<div class="report-content">';
        analysis += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📈 Production Trend Analysis</h4>';
        
        if (weeklyTrends.length === 0) {
            analysis += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <h5 style="color: #374151; margin-bottom: 8px;">Not enough data</h5>
                <p style="color: var(--text-secondary);">Need more production records to analyze trends</p>
            </div>`;
        } else {
            // Weekly Trends
            analysis += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📅 WEEKLY PRODUCTION TRENDS:</h5>
                <div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            weeklyTrends.forEach(week => {
                const eggsGrowth = week.eggs > 0 ? '📈' : '📉';
                const birdsGrowth = week.birds > 0 ? '📈' : '📉';
                
                analysis += `<div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px; text-align: center;">${week.week}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 4px;">🥚</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${week.eggs}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Eggs ${eggsGrowth}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 4px;">🐔</div>
                            <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${week.birds}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Birds ${birdsGrowth}</div>
                        </div>
                    </div>
                </div>`;
            });
            analysis += '</div></div>';
            
            // Recommendations
            const latestWeek = weeklyTrends[weeklyTrends.length - 1];
            const previousWeek = weeklyTrends.length > 1 ? weeklyTrends[weeklyTrends.length - 2] : null;
            
            if (previousWeek) {
                const eggChange = ((latestWeek.eggs - previousWeek.eggs) / previousWeek.eggs * 100).toFixed(1);
                const birdChange = ((latestWeek.birds - previousWeek.birds) / previousWeek.birds * 100).toFixed(1);
                
                analysis += `<div style="margin-bottom: 20px;">
                    <h5 style="color: var(--text-primary); margin-bottom: 12px;">💡 INSIGHTS & RECOMMENDATIONS:</h5>
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🥚 Egg Production</div>
                                <div style="color: ${eggChange >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                                    ${eggChange >= 0 ? '+' : ''}${eggChange}%
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">
                                    ${eggChange >= 0 ? 'Increase from last week' : 'Decrease from last week'}
                                </div>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🐔 Bird Production</div>
                                <div style="color: ${birdChange >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 600;">
                                    ${birdChange >= 0 ? '+' : ''}${birdChange}%
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">
                                    ${birdChange >= 0 ? 'Increase from last week' : 'Decrease from last week'}
                                </div>
                            </div>
                        </div>
                        ${eggChange < 0 ? '<div style="color: #ef4444; font-size: 14px; margin-top: 8px;">⚠️ Consider reviewing feed quality and hen health for egg production</div>' : ''}
                        ${birdChange < 0 ? '<div style="color: #ef4444; font-size: 14px; margin-top: 8px;">⚠️ Review bird health and husbandry practices for bird production</div>' : ''}
                        ${eggChange > 10 || birdChange > 10 ? '<div style="color: #22c55e; font-size: 14px; margin-top: 8px;">✅ Excellent growth! Maintain current practices</div>' : ''}
                    </div>
                </div>`;
            }
        }
        
        analysis += '</div>';

        document.getElementById('trend-analysis-content').innerHTML = analysis;
        document.getElementById('trend-analysis-title').textContent = 'Production Trend Analysis';
        this.showTrendAnalysisModal();
    },

    printProductionReport() {
        this.printReport('production-report-content', 'production-report-title');
    },

    printTrendAnalysis() {
        this.printReport('trend-analysis-content', 'trend-analysis-title');
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

    exportProduction() {
        const csv = this.convertToCSV(this.productionData);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `production-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Production data exported successfully!', 'success');
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

        const productDistribution = {};
        this.productionData.forEach(record => {
            productDistribution[record.product] = (productDistribution[record.product] || 0) + record.quantity;
        });

        const qualityDistribution = {};
        this.productionData.forEach(record => {
            qualityDistribution[record.quality] = (qualityDistribution[record.quality] || 0) + 1;
        });

        const qualityScores = {
            'excellent': 5, 'grade-a': 4, 'grade-b': 3, 'standard': 2, 'rejects': 1
        };
        const avgQuality = this.productionData.length > 0 
            ? (this.productionData.reduce((sum, record) => sum + (qualityScores[record.quality] || 3), 0) / this.productionData.length).toFixed(1)
            : '0.0';

        const totalQuantity = this.productionData.reduce((sum, record) => sum + record.quantity, 0);

        return {
            totalRecords: this.productionData.length,
            totalQuantity: totalQuantity,
            todayEggs,
            weekBirds,
            avgQuality,
            productDistribution,
            qualityDistribution
        };
    },

    calculateWeeklyTrends() {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekStr = this.getWeekLabel(startDate);
            const weekProduction = this.productionData.filter(record => {
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

    getWeekLabel(date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
    },

    updateProductionTable() {
        const periodFilter = document.getElementById('production-filter');
        const filter = periodFilter ? periodFilter.value : 'all';
        document.getElementById('production-table').innerHTML = this.renderProductionTable(filter);
    },

    updateProductSummary() {
        document.getElementById('product-summary').innerHTML = this.renderProductSummary();
    },

    convertToCSV(production) {
        const headers = ['Date', 'Product', 'Quantity', 'Unit', 'Quality', 'Batch', 'Notes'];
        const rows = production.map(record => [
            record.date,
            this.formatProductName(record.product),
            record.quantity,
            record.unit,
            this.formatQuality(record.quality),
            record.batch || '',
            record.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    },

    // UTILITY METHODS
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
    if (!dateString) return 'Invalid date';
    
    // Use DateUtils if available
    if (window.DateUtils && typeof window.DateUtils.toDisplayFormat === 'function') {
        return window.DateUtils.toDisplayFormat(dateString);
    }
    
    // Fallback
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

if (window.FarmModules) {
    window.FarmModules.registerModule('production', ProductionModule);
    console.log('✅ Production Records module registered with all fixes');
} else {
    console.error('❌ FarmModules framework not found!');
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            window.FarmModules.registerModule('production', ProductionModule);
            console.log('✅ Production Records module registered (delayed)!');
            clearInterval(checkFarmModules);
        }
    }, 100);
}
