// modules/production.js - UPDATED WITH VEGETABLES AND DUAL UNITS
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
                product: 'broilers', 
                quantity: 150, 
                unit: 'birds',
                weight: 450,
                weightUnit: 'kg',
                quality: 'grade-a', 
                batch: 'BATCH-002',
                notes: 'Weekly harvest - average 3kg per bird' 
            },
            { 
                id: 3, 
                date: getPreviousDate(2),
                product: 'tomatoes', 
                quantity: 120, 
                unit: 'kg', 
                quality: 'grade-a', 
                batch: 'BATCH-003',
                notes: 'Greenhouse harvest' 
            },
            { 
                id: 4, 
                date: getPreviousDate(3),
                product: 'milk', 
                quantity: 120, 
                unit: 'liters', 
                quality: 'grade-b', 
                batch: 'BATCH-004',
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
                        <div style="font-size: 24px; margin-bottom: 8px;">🥦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="week-vegetables">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Vegetables This Week</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-records">0</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Records</div>
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
                                    <option value="tomatoes">🍅 Tomatoes</option>
                                    <option value="lettuce">🥬 Lettuce</option>
                                    <option value="carrots">🥕 Carrots</option>
                                    <option value="potatoes">🥔 Potatoes</option>
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
                                    <option value="lbs">Pounds</option>
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
                                <option value="vegetables">Vegetables</option>
                            </select>
                        </div>
                    </div>
                    <div id="production-table">
                        ${this.renderProductionTable('all')}
                    </div>
                </div>

                <!-- Production Summary by Product -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">📈 Production by Category</h3>
                    <div id="product-summary">
                        ${this.renderProductSummary()}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS -->
            <!-- Production Record Modal -->
            <div id="production-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 700px;">
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
                                    <select id="production-product" class="form-input" required onchange="ProductionModule.handleProductChange()">
                                        <option value="">Select Product</option>
                                        <!-- Animal Products -->
                                        <option value="eggs">🥚 Eggs</option>
                                        <option value="broilers">🐔 Broilers (Chicken)</option>
                                        <option value="layers">🐓 Layers (Egg-laying Chickens)</option>
                                        <option value="pork">🐖 Pork</option>
                                        <option value="beef">🐄 Beef</option>
                                        <option value="milk">🥛 Milk</option>
                                        <option value="goat">🐐 Goat Meat</option>
                                        <option value="lamb">🐑 Lamb</option>
                                        
                                        <!-- Vegetables -->
                                        <option value="tomatoes">🍅 Tomatoes</option>
                                        <option value="lettuce">🥬 Lettuce</option>
                                        <option value="carrots">🥕 Carrots</option>
                                        <option value="potatoes">🥔 Potatoes</option>
                                        <option value="onions">🧅 Onions</option>
                                        <option value="cabbage">🥬 Cabbage</option>
                                        <option value="peppers">🫑 Peppers</option>
                                        <option value="cucumbers">🥒 Cucumbers</option>
                                        <option value="spinach">🥬 Spinach</option>
                                        <option value="beans">🫘 Beans</option>
                                        <option value="corn">🌽 Corn</option>
                                        
                                        <!-- Fruits -->
                                        <option value="apples">🍎 Apples</option>
                                        <option value="oranges">🍊 Oranges</option>
                                        <option value="bananas">🍌 Bananas</option>
                                        <option value="berries">🫐 Berries</option>
                                        <option value="mangoes">🥭 Mangoes</option>
                                        
                                        <!-- Other -->
                                        <option value="honey">🍯 Honey</option>
                                        <option value="other">📦 Other (Specify)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Custom Product Name (for "Other") -->
                            <div id="custom-product-container" style="display: none; margin-bottom: 16px;">
                                <label class="form-label">Product Name *</label>
                                <input type="text" id="custom-product-name" class="form-input" placeholder="Enter product name (e.g., Quail Eggs, Duck Meat, etc.)">
                            </div>

                            <!-- Quantity Section -->
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Quantity Information *</label>
                                
                                <!-- For Animals (Birds/Heads + Weight) -->
                                <div id="animal-quantity-section" style="display: none; margin-top: 12px;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Number of Birds/Animals</label>
                                            <input type="number" id="animal-count" class="form-input" placeholder="0" min="1">
                                        </div>
                                        <div>
                                            <label class="form-label">Weight</label>
                                            <div style="display: flex; gap: 8px;">
                                                <input type="number" id="animal-weight" class="form-input" placeholder="0" min="0.1" step="0.1">
                                                <select id="animal-weight-unit" class="form-input" style="min-width: 100px;">
                                                    <option value="kg">kg</option>
                                                    <option value="lbs">lbs</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-hint">Enter both count and weight for accurate tracking</div>
                                </div>
                                
                                <!-- Standard Quantity Input -->
                                <div id="standard-quantity-section">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Quantity *</label>
                                            <input type="number" id="production-quantity" class="form-input" min="1" required placeholder="0">
                                        </div>
                                        <div>
                                            <label class="form-label">Unit *</label>
                                            <select id="production-unit" class="form-input" required>
                                                <option value="">Select Unit</option>
                                                <option value="pieces">Pieces</option>
                                                <option value="birds">Birds</option>
                                                <option value="animals">Animals</option>
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="lbs">Pounds (lbs)</option>
                                                <option value="liters">Liters (L)</option>
                                                <option value="gallons">Gallons</option>
                                                <option value="crates">Crates</option>
                                                <option value="cartons">Cartons</option>
                                                <option value="dozen">Dozen</option>
                                                <option value="boxes">Boxes</option>
                                                <option value="bunches">Bunches</option>
                                                <option value="heads">Heads</option>
                                            </select>
                                        </div>
                                    </div>
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
        
        // Today's eggs
        const todayEggs = this.productionData
            .filter(record => {
                const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
                return recordDate === today && record.product === 'eggs';
            })
            .reduce((sum, record) => sum + record.quantity, 0);

        // Birds this week
        const last7DaysDate = window.DateUtils ? 
            window.DateUtils.addDays(today, -7) : 
            (() => {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                return d.toISOString().split('T')[0];
            })();
        
        const weekBirds = this.productionData
            .filter(record => {
                const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
                return recordDate >= last7DaysDate && 
                       (record.product === 'broilers' || record.product === 'layers');
            })
            .reduce((sum, record) => sum + record.quantity, 0);

        // Vegetables this week
        const vegetables = ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'];
        const weekVegetables = this.productionData
            .filter(record => {
                const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
                return recordDate >= last7DaysDate && vegetables.includes(record.product);
            })
            .reduce((sum, record) => sum + record.quantity, 0);

        this.updateElement('today-eggs', todayEggs.toLocaleString());
        this.updateElement('week-birds', weekBirds.toLocaleString());
        this.updateElement('week-vegetables', weekVegetables.toLocaleString());
        this.updateElement('total-records', this.productionData.length.toLocaleString());
    },

    renderProductionTable(filter = 'all') {
        let filteredProduction = this.productionData;
        
        // Handle vegetable filter
        if (filter === 'vegetables') {
            const vegetables = ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'];
            filteredProduction = this.productionData.filter(record => vegetables.includes(record.product));
        } else if (filter !== 'all') {
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
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Weight/Details</th>
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
                            
                            // Display weight information for animals
                            let weightInfo = '-';
                            if (record.weight && record.weightUnit) {
                                weightInfo = `${record.weight} ${record.weightUnit}`;
                            }
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">${this.getProductIcon(record.product)}</span>
                                            <span style="font-weight: 500;">${this.getProductDisplayName(record)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="font-weight: 600;">${record.quantity.toLocaleString()}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${record.unit}</div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary);">
                                        ${weightInfo}
                                        ${record.product === 'broilers' && record.unit === 'birds' ? `<div style="font-size: 11px; color: #888;">Count: ${record.quantity}</div>` : ''}
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
        const categories = {
            'poultry': ['eggs', 'broilers', 'layers'],
            'livestock': ['pork', 'beef', 'goat', 'lamb', 'milk'],
            'vegetables': ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'],
            'fruits': ['apples', 'oranges', 'bananas', 'berries', 'mangoes'],
            'other': ['honey', 'other']
        };

        const categoryData = {};
        
        Object.keys(categories).forEach(category => {
            const products = categories[category];
            const categoryRecords = this.productionData.filter(record => products.includes(record.product));
            
            categoryData[category] = {
                count: categoryRecords.length,
                totalQuantity: categoryRecords.reduce((sum, record) => sum + record.quantity, 0),
                totalWeight: categoryRecords.reduce((sum, record) => sum + (record.weight || 0), 0),
                weightUnit: categoryRecords.find(record => record.weightUnit)?.weightUnit || 'kg'
            };
        });

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                ${Object.entries(categoryData).filter(([category, data]) => data.count > 0).map(([category, data]) => {
                    const icons = {
                        'poultry': '🐔',
                        'livestock': '🐄',
                        'vegetables': '🥦',
                        'fruits': '🍎',
                        'other': '📦'
                    };
                    
                    return `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 24px;">${icons[category]}</div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${category}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Records:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${data.count}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-secondary);">Total Items:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${data.totalQuantity.toLocaleString()}</span>
                            </div>
                            ${data.totalWeight > 0 ? `
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Total Weight:</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">${data.totalWeight.toLocaleString()} ${data.weightUnit}</span>
                                </div>
                            ` : ''}
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
        
        // Product change handler
        document.getElementById('production-product')?.addEventListener('change', () => this.handleProductChange());
        
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

    // PRODUCT HANDLING METHODS
    handleProductChange() {
        const productSelect = document.getElementById('production-product');
        const selectedValue = productSelect.value;
        
        // Show/hide custom product name field
        const customProductContainer = document.getElementById('custom-product-container');
        customProductContainer.style.display = selectedValue === 'other' ? 'block' : 'none';
        
        // Show/hide animal quantity section
        const animalProducts = ['broilers', 'layers', 'pork', 'beef', 'goat', 'lamb'];
        const animalSection = document.getElementById('animal-quantity-section');
        const standardSection = document.getElementById('standard-quantity-section');
        
        if (animalProducts.includes(selectedValue)) {
            animalSection.style.display = 'block';
            standardSection.style.display = 'none';
            
            // Set appropriate unit defaults
            document.getElementById('production-unit').value = 'birds';
            if (selectedValue === 'broilers' || selectedValue === 'layers') {
                document.getElementById('production-unit').value = 'birds';
            } else {
                document.getElementById('production-unit').value = 'animals';
            }
        } else {
            animalSection.style.display = 'none';
            standardSection.style.display = 'block';
            
            // Set appropriate unit based on product type
            const unitSelect = document.getElementById('production-unit');
            if (selectedValue === 'eggs') {
                unitSelect.value = 'pieces';
            } else if (selectedValue === 'milk') {
                unitSelect.value = 'liters';
            } else if (['tomatoes', 'carrots', 'potatoes', 'onions'].includes(selectedValue)) {
                unitSelect.value = 'kg';
            } else if (selectedValue === 'honey') {
                unitSelect.value = 'kg';
            } else {
                unitSelect.value = '';
            }
        }
    },

    // MODAL CONTROL METHODS
    showProductionModal() {
        // Hide any open modals
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // Show the production modal
        document.getElementById('production-modal').classList.remove('hidden');
        
        // Reset custom product name
        document.getElementById('custom-product-name').value = '';
        document.getElementById('custom-product-container').style.display = 'none';
        
        // Reset animal quantity section
        document.getElementById('animal-count').value = '';
        document.getElementById('animal-weight').value = '';
        document.getElementById('animal-weight-unit').value = 'kg';
        
        // Check if we're editing or creating new
        const productionId = document.getElementById('production-id').value;
        
        if (!productionId) {
            // New record - set today's date using DateUtils
            const today = window.DateUtils ? window.DateUtils.getToday() : new Date().toISOString().split('T')[0];
            
            console.log('📅 Setting today\'s date in modal:', today);
            document.getElementById('production-date').value = today;
            document.getElementById('production-modal-title').textContent = 'New Production Record';
            document.getElementById('delete-production').style.display = 'none';
            
            // Reset form
            document.getElementById('production-form').reset();
            this.handleProductChange(); // Initialize the correct sections
        } else {
            // Editing - show delete button
            document.getElementById('delete-production').style.display = 'block';
            document.getElementById('production-modal-title').textContent = 'Edit Production Record';
        }
    },

    hideProductionModal() {
        document.getElementById('production-modal').classList.add('hidden');
        document.getElementById('production-id').value = '';
        document.getElementById('production-form').reset();
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
        const productSelect = document.getElementById('production-product').value;
        const customProductName = document.getElementById('custom-product-name').value.trim();
        const batch = document.getElementById('production-batch').value.trim();
        const notes = document.getElementById('production-notes').value.trim();
        const forSale = document.getElementById('production-for-sale').checked;
        const salePrice = parseFloat(document.getElementById('sale-price').value) || 0;
        const customer = document.getElementById('customer-name').value.trim();

        console.log('📅 Save - Raw date input:', dateInput);

        // Validate required fields
        if (!dateInput || !productSelect) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // For "Other" product, require custom name
        if (productSelect === 'other' && !customProductName) {
            this.showNotification('Please specify the product name for "Other" category', 'error');
            return;
        }

        // Determine product name
        const product = productSelect === 'other' ? customProductName.toLowerCase().replace(/\s+/g, '-') : productSelect;

        // Check if animal product for dual input
        const animalProducts = ['broilers', 'layers', 'pork', 'beef', 'goat', 'lamb'];
        let quantity, unit, weight, weightUnit;

        if (animalProducts.includes(productSelect)) {
            // Get animal data
            const animalCount = parseInt(document.getElementById('animal-count').value) || 0;
            weight = parseFloat(document.getElementById('animal-weight').value) || 0;
            weightUnit = document.getElementById('animal-weight-unit').value;
            
            if (animalCount === 0 || weight === 0) {
                this.showNotification('Please enter both count and weight for animals', 'error');
                return;
            }
            
            quantity = animalCount;
            unit = productSelect === 'broilers' || productSelect === 'layers' ? 'birds' : 'animals';
        } else {
            // Get standard quantity
            quantity = parseInt(document.getElementById('production-quantity').value) || 0;
            unit = document.getElementById('production-unit').value;
            
            if (quantity === 0 || !unit) {
                this.showNotification('Please enter quantity and select unit', 'error');
                return;
            }
        }

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
            productCategory: productSelect,
            quantity: quantity,
            unit: unit,
            quality: document.getElementById('production-quality').value,
            batch: batch || '',
            notes: notes || ''
        };

        // Add weight data for animals
        if (weight && weightUnit) {
            productionData.weight = weight;
            productionData.weightUnit = weightUnit;
        }

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
        
        // Set product - handle custom "other" products
        const productSelect = document.getElementById('production-product');
        if (record.productCategory) {
            productSelect.value = record.productCategory;
        } else {
            // Try to determine category from product name
            const knownProducts = ['eggs', 'broilers', 'layers', 'milk', 'pork', 'beef', 'goat', 'lamb', 
                                  'tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 
                                  'peppers', 'cucumbers', 'spinach', 'beans', 'corn',
                                  'apples', 'oranges', 'bananas', 'berries', 'mangoes', 'honey'];
            
            if (knownProducts.includes(record.product)) {
                productSelect.value = record.product;
            } else {
                productSelect.value = 'other';
                document.getElementById('custom-product-name').value = this.formatProductName(record.product);
                document.getElementById('custom-product-container').style.display = 'block';
            }
        }
        
        // Trigger product change to show correct sections
        this.handleProductChange();
        
        // Set quantity data
        if (record.weight && record.weightUnit) {
            // Animal product with weight
            document.getElementById('animal-count').value = record.quantity;
            document.getElementById('animal-weight').value = record.weight;
            document.getElementById('animal-weight-unit').value = record.weightUnit;
        } else {
            // Standard product
            document.getElementById('production-quantity').value = record.quantity;
            document.getElementById('production-unit').value = record.unit;
        }
        
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

    addProduction(productionData) {
        this.productionData.unshift(productionData);
        this.saveData();
        this.updateStats();
        this.renderModule();
    },

    // REPORT GENERATION METHODS
    generateProductionReport() {
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
        
        // Group data by category
        const categories = {
            'Poultry': ['eggs', 'broilers', 'layers'],
            'Livestock': ['pork', 'beef', 'goat', 'lamb', 'milk'],
            'Vegetables': ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'],
            'Fruits': ['apples', 'oranges', 'bananas', 'berries', 'mangoes'],
            'Other': ['honey']
        };

        const monthlyData = this.productionData.filter(record => {
            const recordDate = window.DateUtils ? window.DateUtils.toInputFormat(record.date) : record.date;
            return recordDate >= startOfMonth;
        });

        const categoryStats = {};
        Object.keys(categories).forEach(category => {
            const categoryProducts = categories[category];
            const categoryRecords = monthlyData.filter(record => categoryProducts.includes(record.product));
            
            categoryStats[category] = {
                totalItems: categoryRecords.reduce((sum, record) => sum + record.quantity, 0),
                totalWeight: categoryRecords.reduce((sum, record) => sum + (record.weight || 0), 0),
                weightUnit: categoryRecords.find(record => record.weightUnit)?.weightUnit || 'kg',
                recordCount: categoryRecords.length
            };
        });

        return `
            <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
                <h1 style="color: var(--text-primary); margin-bottom: 4px;">Farm Production Report</h1>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Generated on ${this.formatDate(today)} | Records: ${this.productionData.length}
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    ${Object.entries(categoryStats).filter(([category, stats]) => stats.recordCount > 0).map(([category, stats]) => {
                        const icons = {
                            'Poultry': '🐔',
                            'Livestock': '🐄',
                            'Vegetables': '🥦',
                            'Fruits': '🍎',
                            'Other': '📦'
                        };
                        
                        return `
                            <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                    <div style="font-size: 32px;">${icons[category]}</div>
                                    <div>
                                        <h3 style="color: var(--text-primary); margin: 0; font-size: 18px;">${category}</h3>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${stats.recordCount} records</div>
                                    </div>
                                </div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--primary); margin-bottom: 8px;">
                                    ${stats.totalItems.toLocaleString()} items
                                </div>
                                ${stats.totalWeight > 0 ? `
                                    <div style="color: var(--text-secondary); font-size: 14px;">
                                        ${stats.totalWeight.toLocaleString()} ${stats.weightUnit} total weight
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Detailed Production Records</h3>
                <div style="overflow-x: auto; margin-bottom: 32px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Date</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Product</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Quantity</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Weight</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Quality</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Batch</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyData.map(record => {
                                const qualityClass = this.getQualityColor(record.quality);
                                return `
                                    <tr style="border-bottom: 1px solid var(--glass-border);">
                                        <td style="padding: 12px; color: var(--text-primary);">${this.formatDate(record.date)}</td>
                                        <td style="padding: 12px; color: var(--text-primary);">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <span style="font-size: 18px;">${this.getProductIcon(record.product)}</span>
                                                <span>${this.getProductDisplayName(record)}</span>
                                            </div>
                                        </td>
                                        <td style="padding: 12px; color: var(--text-primary);">
                                            ${record.quantity.toLocaleString()} ${record.unit}
                                        </td>
                                        <td style="padding: 12px; color: var(--text-primary);">
                                            ${record.weight ? `${record.weight} ${record.weightUnit}` : '-'}
                                        </td>
                                        <td style="padding: 12px;">
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                                background: ${qualityClass}20; color: ${qualityClass};">
                                                ${this.formatQuality(record.quality)}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; color: var(--text-secondary);">${record.batch || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
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
    getProductDisplayName(record) {
        if (record.productCategory === 'other' || !['eggs', 'broilers', 'layers', 'milk', 'pork', 'beef', 
            'tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 
            'spinach', 'beans', 'corn', 'apples', 'oranges', 'bananas', 'berries', 'mangoes', 'honey', 
            'goat', 'lamb'].includes(record.product)) {
            // Custom product or unknown - format nicely
            return record.product.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        return this.formatProductName(record.product);
    },

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
            'goat': '🐐',
            'lamb': '🐑',
            'tomatoes': '🍅',
            'lettuce': '🥬',
            'carrots': '🥕',
            'potatoes': '🥔',
            'onions': '🧅',
            'cabbage': '🥬',
            'peppers': '🫑',
            'cucumbers': '🥒',
            'spinach': '🥬',
            'beans': '🫘',
            'corn': '🌽',
            'apples': '🍎',
            'oranges': '🍊',
            'bananas': '🍌',
            'berries': '🫐',
            'mangoes': '🥭',
            'honey': '🍯'
        };
        
        // Default icons for product categories
        if (product.includes('tomato')) return '🍅';
        if (product.includes('lettuce') || product.includes('cabbage') || product.includes('spinach')) return '🥬';
        if (product.includes('carrot')) return '🥕';
        if (product.includes('potato')) return '🥔';
        if (product.includes('onion')) return '🧅';
        if (product.includes('pepper')) return '🫑';
        if (product.includes('cucumber')) return '🥒';
        if (product.includes('bean')) return '🫘';
        if (product.includes('corn')) return '🌽';
        if (product.includes('apple')) return '🍎';
        if (product.includes('orange')) return '🍊';
        if (product.includes('banana')) return '🍌';
        if (product.includes('berry')) return '🫐';
        if (product.includes('mango')) return '🥭';
        
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
            'goat': 'Goat',
            'lamb': 'Lamb',
            'tomatoes': 'Tomatoes',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'onions': 'Onions',
            'cabbage': 'Cabbage',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'spinach': 'Spinach',
            'beans': 'Beans',
            'corn': 'Corn',
            'apples': 'Apples',
            'oranges': 'Oranges',
            'bananas': 'Bananas',
            'berries': 'Berries',
            'mangoes': 'Mangoes',
            'honey': 'Honey'
        };
        
        if (names[product]) {
            return names[product];
        }
        
        // Format custom product names
        return product.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
