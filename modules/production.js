// modules/production.js - CORRECTED VERSION

console.log('🚜 Loading production module...');

const ProductionModule = {
    name: 'production',
    initialized: false,
    _isLoading: false,
    _isSaving: false,
    element: null,
    productionData: [],  // USE THIS consistently
    currentRecordId: null,
    broadcaster: null,
    dataService: null,

    async initialize() {
        console.log('🏭 Initializing Production Module...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Production module connected to Data Broadcaster');
        }

        this.dataService = window.UnifiedDataService || null;
        if (!this.dataService) {
            console.error('❌ UnifiedDataService not available for production!');
        } else {
            console.log('📦 Production connected to UnifiedDataService');
        }

        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        await this.loadData();
        this.renderModule();
        this.setupEventListeners();
        
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastProductionLoaded();
        }
        
        this.initialized = true;
        
        console.log('✅ Production Module initialized with', this.productionData.length, 'records');
        return true;
    },

    // ========== DATA LOADING - NO SAVING HERE ==========
   async loadData() {
    if (this._isLoading) {
        console.log('Already loading, skipping...');
        return;
    }
    this._isLoading = true;
    
    console.log('Loading production records...');
    
    try {
        let loadedData = [];
        
        // Try Firebase first
        if (this.dataService) {
            const data = await this.dataService.get('production');
            console.log('Raw data from service:', data);
            
            // Handle different data structures
            if (data && data.records && Array.isArray(data.records)) {
                loadedData = data.records;
                console.log('📁 Loaded from Firebase records array:', loadedData.length);
            } else if (Array.isArray(data)) {
                loadedData = data;
                console.log('📁 Loaded from Firebase as array:', loadedData.length);
            } else if (data && typeof data === 'object') {
                // Try to extract records from object
                const possibleRecords = Object.values(data).filter(v => v && typeof v === 'object' && v.id);
                if (possibleRecords.length > 0) {
                    loadedData = possibleRecords;
                    console.log('📁 Extracted records from object:', loadedData.length);
                } else {
                    loadedData = [];
                }
            }
        }
        
        // If Firebase has no data, check localStorage as backup
        if (loadedData.length === 0) {
            const saved = localStorage.getItem('farm-production');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        loadedData = parsed;
                    } else if (parsed.records && Array.isArray(parsed.records)) {
                        loadedData = parsed.records;
                    } else {
                        loadedData = [];
                    }
                    console.log('📁 Loaded from localStorage backup:', loadedData.length);
                    // DO NOT save to Firebase here - that causes the loop!
                } catch (e) {
                    loadedData = [];
                }
            }
        }
        
        // IMPORTANT: Use productionData, not productionRecords
        this.productionData = loadedData;
        
        // Sort by date
        if (this.productionData.length > 0) {
            this.productionData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        console.log('✅ Production data loaded:', this.productionData.length, 'records');
        
    } catch (error) {
        console.error('❌ Error loading production records:', error);
        this.productionData = [];
    } finally {
        this._isLoading = false;
    }
    
    if (this.broadcaster) {
        this.broadcaster.broadcast('production-data-loaded', {
            module: 'production',
            timestamp: new Date().toISOString(),
            recordCount: this.productionData.length
        });
    }
},

    // ========== SAVE METHODS - ONLY CALLED ON USER ACTION ==========
    async saveToFirebase() {
        if (!this.dataService) return;
        if (this._isSaving) {
            console.log('Already saving, skipping...');
            return;
        }
        this._isSaving = true;
        
        try {
            await this.dataService.save('production', {
                records: this.productionData,
                lastUpdated: new Date().toISOString(),
                totalRecords: this.productionData.length
            });
            console.log('✅ Saved to Firebase');
        } catch (error) {
            console.error('❌ Error saving to Firebase:', error);
        } finally {
            this._isSaving = false;
        }
    },

    async saveData() {
        // Save to localStorage for backup
        localStorage.setItem('farm-production', JSON.stringify(this.productionData));
        
        // Save to Firebase
        await this.saveToFirebase();
        
        // Broadcast update
        if (this.broadcaster) {
            this.broadcaster.broadcast('production-data-saved', {
                module: 'production',
                timestamp: new Date().toISOString(),
                recordCount: this.productionData.length
            });
        }
    },

    // ========== BROADCASTER METHODS ==========
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('sale-recorded', (data) => {
            console.log('📡 Production received sale record:', data);
            this.checkProductionForSale(data);
        });
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Production received inventory update:', data);
            this.checkInventoryForProduction(data);
        });
        
        this.broadcaster.on('theme-changed', (data) => {
            console.log('📡 Production theme changed:', data);
            if (this.initialized && data.theme) {
                this.onThemeChange(data.theme);
            }
        });
    },

    broadcastProductionLoaded() {
        if (!this.broadcaster) return;
        
        const stats = this.calculateDetailedStats();
        
        this.broadcaster.broadcast('production-loaded', {
            module: 'production',
            timestamp: new Date().toISOString(),
            stats: stats,
            totalRecords: this.productionData.length,
            totalProduction: stats.totalItems
        });
    },

    broadcastProductionDeleted(recordId) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('production-deleted', {
            module: 'production',
            timestamp: new Date().toISOString(),
            recordId: recordId
        });
    },

    // ========== CRUD METHODS ==========
    async addProduction(productionData) {
        this.productionData.unshift(productionData);
        await this.saveData();
        this.updateStats();
        this.renderModule();
        this.showNotification('Production record added!', 'success');
    },

    async updateProduction(productionId, productionData) {
        const index = this.productionData.findIndex(p => p.id == productionId);
        
        if (index !== -1) {
            this.productionData[index] = {
                ...this.productionData[index],
                ...productionData
            };
            await this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Production record updated successfully!', 'success');
        }
    },

    async deleteProductionRecord(recordId) {
        const index = this.productionData.findIndex(r => r.id === parseInt(recordId));
        if (index !== -1) {
            this.productionData.splice(index, 1);
            await this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Production record deleted', 'success');
            
            if (this.broadcaster) {
                this.broadcastProductionDeleted(recordId);
            }
        }
    },

    // ========== HELPER METHODS (keep your existing ones) ==========
    calculateDetailedStats() {
        // Keep your existing implementation
        const today = new Date().toISOString().split('T')[0];
        const last7DaysDate = new Date();
        last7DaysDate.setDate(last7DaysDate.getDate() - 7);
        const last7DaysString = last7DaysDate.toISOString().split('T')[0];
        
        const poultry = ['eggs', 'broilers', 'layers'];
        const livestock = ['pork', 'beef', 'goat', 'lamb', 'milk'];
        const vegetables = ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'];
        const fruits = ['apples', 'oranges', 'bananas', 'berries', 'mangoes'];
        
        const todayProduction = this.productionData.filter(record => record.date === today);
        const weekProduction = this.productionData.filter(record => record.date >= last7DaysString);
        const poultryProduction = this.productionData.filter(record => poultry.includes(record.product));
        const livestockProduction = this.productionData.filter(record => livestock.includes(record.product));
        const vegetableProduction = this.productionData.filter(record => vegetables.includes(record.product));
        const fruitProduction = this.productionData.filter(record => fruits.includes(record.product));
        
        return {
            totalItems: this.productionData.reduce((sum, record) => sum + record.quantity, 0),
            totalWeight: this.productionData.reduce((sum, record) => sum + (record.weight ? record.weight * record.quantity : 0), 0),
            todayItems: todayProduction.reduce((sum, record) => sum + record.quantity, 0),
            weekItems: weekProduction.reduce((sum, record) => sum + record.quantity, 0),
            poultryCount: poultryProduction.reduce((sum, record) => sum + record.quantity, 0),
            livestockCount: livestockProduction.reduce((sum, record) => sum + record.quantity, 0),
            vegetableCount: vegetableProduction.reduce((sum, record) => sum + record.quantity, 0),
            fruitCount: fruitProduction.reduce((sum, record) => sum + record.quantity, 0),
            recordCount: this.productionData.length
        };
    },

    checkInventoryForProduction(inventoryData) {
        // Implementation
    },

    checkProductionForSale(saleData) {
        // Implementation
    },

    onThemeChange(theme) {
        if (this.initialized) {
            this.renderModule();
        }
    },

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayEggs = this.productionData
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const last7DaysDate = new Date();
        last7DaysDate.setDate(last7DaysDate.getDate() - 7);
        const last7DaysString = last7DaysDate.toISOString().split('T')[0];
        
        const weekBirds = this.productionData
            .filter(record => record.date >= last7DaysString && 
                   (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        const vegetables = ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'];
        const weekVegetables = this.productionData
            .filter(record => record.date >= last7DaysString && vegetables.includes(record.product))
            .reduce((sum, record) => sum + record.quantity, 0);

        this.updateElement('today-eggs', todayEggs.toLocaleString());
        this.updateElement('week-birds', weekBirds.toLocaleString());
        this.updateElement('week-vegetables', weekVegetables.toLocaleString());
        this.updateElement('total-records', this.productionData.length.toLocaleString());
    },

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            alert(message);
        }
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

                <!-- ===== OVERVIEW HEADING ===== -->
            <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">📊 Overview</h2>
            
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

                 <!-- ===== QUICK ACTION HEADING ===== -->
            <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 24px 0 16px 0;">⚡ Quick Actions</h2>
            
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

                            <!-- SIMPLIFIED Quantity Section - No weight required for animals -->
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Quantity Information *</label>
                                
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
                                
                                <!-- Optional Weight Field (for information only, not required) -->
                                <div id="optional-weight-section" style="display: none; margin-top: 12px;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Average Weight per Animal (Optional)</label>
                                            <div style="display: flex; gap: 8px;">
                                                <input type="number" id="animal-weight" class="form-input" placeholder="0" min="0.1" step="0.1">
                                                <select id="animal-weight-unit" class="form-input" style="min-width: 100px;">
                                                    <option value="kg">kg</option>
                                                    <option value="lbs">lbs</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div id="calculated-total-weight" style="display: none;">
                                            <label class="form-label">Estimated Total Weight</label>
                                            <div class="form-input" style="background: var(--glass-bg); padding: 8px 12px; border-radius: 6px;">
                                                <span id="total-weight-value">0</span> <span id="total-weight-unit">kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-hint">Optional: Enter average weight for weight estimation. Actual sales weight should be recorded in Sales module.</div>
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
                                <div class="form-hint">This will create a sales record in the Sales module. Weight details for meat sales should be added there.</div>
                            </div>

                            <div id="sale-details" style="display: none; margin-bottom: 16px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label class="form-label">Sale Price</label>
                                        <div style="display: flex; gap: 8px;">
                                            <input type="number" id="sale-price" class="form-input" placeholder="0.00" min="0" step="0.01">
                                            <select id="sale-price-unit" class="form-input" style="min-width: 100px;">
                                                <option value="per-unit">Per Unit</option>
                                                <option value="per-kg">Per kg</option>
                                                <option value="per-lb">Per lb</option>
                                                <option value="total">Total</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="form-label">Customer Name (Optional)</label>
                                        <input type="text" id="customer-name" class="form-input" placeholder="Wholesale or specific customer">
                                    </div>
                                </div>
                                <div class="form-hint" style="margin-top: 8px;">
                                    For meat sales, use "per kg" or "per lb" and add weight details in Sales module.
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
                                            <span style="font-size: 18px;">${this.getProductIcon(record?.product)}</span>
                                            <span style="font-weight: 500;">${this.getProductDisplayName(record)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="font-weight: 600;">${record.quantity.toLocaleString()}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${record.unit}</div>
                                        ${record.weight ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">Avg: ${record.weight} ${record.weightUnit || 'kg'}</div>` : ''}
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
                estimatedWeight: categoryRecords.reduce((sum, record) => sum + (record.weight ? record.weight * record.quantity : 0), 0),
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
                            ${data.estimatedWeight > 0 ? `
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Est. Weight:</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">${data.estimatedWeight.toLocaleString()} ${data.weightUnit}</span>
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
        
        // Quantity change for weight calculation
        document.getElementById('production-quantity')?.addEventListener('input', () => this.calculateTotalWeight());
        document.getElementById('animal-weight')?.addEventListener('input', () => this.calculateTotalWeight());
        
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
        
        // Show/hide optional weight section for animals
        const animalProducts = ['broilers', 'layers', 'pork', 'beef', 'goat', 'lamb'];
        const weightSection = document.getElementById('optional-weight-section');
        
        if (animalProducts.includes(selectedValue)) {
            weightSection.style.display = 'block';
            
            // Set appropriate unit defaults
            const unitSelect = document.getElementById('production-unit');
            if (selectedValue === 'broilers' || selectedValue === 'layers') {
                unitSelect.value = 'birds';
            } else {
                unitSelect.value = 'animals';
            }
        } else {
            weightSection.style.display = 'none';
            
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
        
        // Reset weight calculation
        this.calculateTotalWeight();
    },

    calculateTotalWeight() {
        const quantity = parseInt(document.getElementById('production-quantity').value) || 0;
        const avgWeight = parseFloat(document.getElementById('animal-weight').value) || 0;
        const weightUnit = document.getElementById('animal-weight-unit').value;
        
        const totalWeightSection = document.getElementById('calculated-total-weight');
        
        if (quantity > 0 && avgWeight > 0) {
            const totalWeight = quantity * avgWeight;
            document.getElementById('total-weight-value').textContent = totalWeight.toFixed(1);
            document.getElementById('total-weight-unit').textContent = weightUnit;
            totalWeightSection.style.display = 'block';
        } else {
            totalWeightSection.style.display = 'none';
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
        
        // Reset optional weight section
        document.getElementById('animal-weight').value = '';
        document.getElementById('animal-weight-unit').value = 'kg';
        document.getElementById('calculated-total-weight').style.display = 'none';
        
        // Check if we're editing or creating new
        const productionId = document.getElementById('production-id').value;
        
        if (!productionId) {
            // New record - set today's date
            const today = new Date().toISOString().split('T')[0];
            
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

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

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

        this.addProduction(productionData);
        
        // Reset form
        document.getElementById('quick-production-form').reset();
        this.showNotification('Production recorded successfully!', 'success');
    },

       async addProduction(productionData) {
        this.productionData.unshift(productionData);
        await this.saveData();   
        this.updateStats();
        this.renderModule();
    },

    editProduction(recordId) {
        const record = this.productionData.find(r => r.id === parseInt(recordId));
        if (!record) return;

        this.currentRecordId = record.id;
        
        // Convert date for input field
        const inputDate = record.date;

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
        document.getElementById('production-quantity').value = record.quantity;
        document.getElementById('production-unit').value = record.unit;
        
        // Set optional weight data
        if (record.weight) {
            document.getElementById('animal-weight').value = record.weight;
            if (record.weightUnit) {
                document.getElementById('animal-weight-unit').value = record.weightUnit;
            }
            this.calculateTotalWeight();
        }
        
        document.getElementById('production-quality').value = record.quality;
        document.getElementById('production-batch').value = record.batch || '';
        document.getElementById('production-notes').value = record.notes || '';
        
        this.showProductionModal();
    },

    saveProduction() {
    const productionId = document.getElementById('production-id').value;
    
    // Get custom product name if "other" is selected
    let product = document.getElementById('production-product').value;
    if (product === 'other') {
        const customName = document.getElementById('custom-product-name').value;
        if (!customName) {
            this.showNotification('Please enter a product name', 'error');
            return;
        }
        product = customName.toLowerCase().replace(/\s+/g, '-');
    }
    
    const productionData = {
        id: productionId ? parseInt(productionId) : Date.now(),
        date: document.getElementById('production-date').value,
        product: product,
        quantity: parseInt(document.getElementById('production-quantity').value),
        unit: document.getElementById('production-unit').value,
        quality: document.getElementById('production-quality').value,
        batch: document.getElementById('production-batch').value || '',
        notes: document.getElementById('production-notes').value || ''
    };
    
    // Add optional weight data
    const avgWeight = parseFloat(document.getElementById('animal-weight').value);
    if (avgWeight > 0) {
        productionData.weight = avgWeight;
        productionData.weightUnit = document.getElementById('animal-weight-unit').value;
    }
    
    if (productionId) {
        this.updateProduction(productionId, productionData);
    } else {
        this.addProduction(productionData);
        this.showNotification('Production record added!', 'success');
    }
    
    // Handle sale creation if checkbox is checked
    const forSale = document.getElementById('production-for-sale').checked;
    if (forSale) {
        const price = parseFloat(document.getElementById('sale-price').value);
        const priceUnit = document.getElementById('sale-price-unit').value;
        const customer = document.getElementById('customer-name').value;
        
        if (price && price > 0) {
            this.createSaleRecord(productionData, price, priceUnit, customer);
        }
    }
    
    this.hideProductionModal();
},

    deleteProduction() {
        if (!this.currentRecordId) return;

        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(this.currentRecordId);
            this.hideProductionModal();
        }
    },

    // REPORT GENERATION METHODS
    generateProductionReport() {
        const reportContent = this.getProductionReportContent();
        document.getElementById('production-report-content').innerHTML = reportContent;
        this.showProductionReportModal();
    },

    getProductionReportContent() {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startOfMonthString = startOfMonth.toISOString().split('T')[0];
        
        // Group data by category
        const categories = {
            'Poultry': ['eggs', 'broilers', 'layers'],
            'Livestock': ['pork', 'beef', 'goat', 'lamb', 'milk'],
            'Vegetables': ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'],
            'Fruits': ['apples', 'oranges', 'bananas', 'berries', 'mangoes'],
            'Other': ['honey']
        };

        const monthlyData = this.productionData.filter(record => {
            const recordDate = record.date ? record.date.split('T')[0] : '';
            return recordDate >= startOfMonthString;
        });

        const categoryStats = {};
        Object.keys(categories).forEach(category => {
            const categoryProducts = categories[category];
            const categoryRecords = monthlyData.filter(record => categoryProducts.includes(record.product));
            
            categoryStats[category] = {
                totalItems: categoryRecords.reduce((sum, record) => sum + record.quantity, 0),
                estimatedWeight: categoryRecords.reduce((sum, record) => sum + (record.weight ? record.weight * record.quantity : 0), 0),
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
                                ${stats.estimatedWeight > 0 ? `
                                    <div style="color: var(--text-secondary); font-size: 14px;">
                                        Est. ${stats.estimatedWeight.toLocaleString()} ${stats.weightUnit} total weight
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
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Est. Weight</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Quality</th>
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Batch</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyData.map(record => {
                                const qualityClass = this.getQualityColor(record.quality);
                                const estimatedWeight = record.weight ? record.weight * record.quantity : 0;
                                
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
                                            ${estimatedWeight > 0 ? `${estimatedWeight.toLocaleString()} ${record.weightUnit || 'kg'}` : '-'}
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

    // ✅ ADDED: Missing method implementations
    createSaleRecord(productionData, price, priceUnit = 'per-unit', customer = '') {
        console.log('💵 Creating sale record for production:', productionData);
        
        // Get today's date for sale
        const saleDate = new Date().toISOString().split('T')[0];
        
        // Calculate total price based on price unit
        let totalPrice = 0;
        let priceNote = '';
        
        if (priceUnit === 'per-unit') {
            totalPrice = productionData.quantity * price;
            priceNote = `$${price.toFixed(2)} per ${productionData.unit}`;
        } else if (priceUnit === 'total') {
            totalPrice = price;
            priceNote = `Total: $${price.toFixed(2)}`;
        } else {
            // For per-kg or per-lb, need weight which should be added in Sales module
            totalPrice = 0;
            priceNote = `$${price.toFixed(2)} ${priceUnit} - Add weight in Sales module`;
        }
        
        const saleRecord = {
            id: Date.now(),
            productionId: productionData.id,
            date: saleDate,
            product: productionData.product,
            quantity: productionData.quantity,
            unit: productionData.unit,
            pricePerUnit: priceUnit === 'per-unit' ? price : 0,
            priceUnit: priceUnit,
            totalPrice: totalPrice,
            customer: customer || '',
            status: 'pending', // Mark as pending to add weight details
            notes: `Auto-generated from production record #${productionData.id}. ${priceNote}`
        };

        // Add weight data if available
        if (productionData.weight && productionData.weightUnit) {
            saleRecord.weight = productionData.weight * productionData.quantity;
            saleRecord.weightUnit = productionData.weightUnit;
        }

        // Save to sales module if available
        if (window.SalesModule && window.SalesModule.addSale) {
            window.SalesModule.addSale(saleRecord);
            this.showNotification(`Sale record created! ${priceNote}`, 'success');
        } else {
            // Store in local storage for later use
            const salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
            salesData.push(saleRecord);
            localStorage.setItem('farm-sales-data', JSON.stringify(salesData));
            this.showNotification(`Sale record saved for later import! ${priceNote}`, 'info');
        }
    },

    generateTrendAnalysis() {
        // Placeholder for trend analysis
        const trendContent = `
            <div style="padding: 20px; text-align: center;">
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">📈 Production Trend Analysis</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    This feature is coming soon! It will provide insights into production trends over time.
                </p>
                <div style="font-size: 64px; margin: 40px 0;">📊</div>
                <p style="color: var(--text-secondary);">
                    Planned features include:<br>
                    • Monthly production trends<br>
                    • Year-over-year comparisons<br>
                    • Seasonal patterns<br>
                    • Predictive analytics
                </p>
            </div>
        `;
        document.getElementById('trend-analysis-content').innerHTML = trendContent;
        this.showTrendAnalysisModal();
    },

    printProductionReport() {
        window.print();
    },

    printTrendAnalysis() {
        window.print();
    },

    // UTILITY METHODS
    getProductDisplayName(record) {
    // Handle invalid record
    if (!record || !record.product) {
        return 'Unknown Prod,uct';
    }
    
    const product = record.product;
    const knownProducts = ['eggs', 'broilers', 'layers', 'milk', 'pork', 'beef', 
        'tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 
        'peppers', 'cucumbers', 'spinach', 'beans', 'corn', 'apples', 'oranges', 
        'bananas', 'berries', 'mangoes', 'honey', 'goat', 'lamb'];
    
    if (record.productCategory === 'other' || !knownProducts.includes(product)) {
        // Custom product or unknown - format nicely
        return product.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    return this.formatProductName(product);
},

    formatDate(dateString) {
        // Handle various date formats
        if (!dateString) return 'Invalid Date';
        
        // Fallback to JavaScript Date
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Try to parse as just a date string (YYYY-MM-DD)
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    const [year, month, day] = parts;
                    const parsedDate = new Date(year, month - 1, day);
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
                return dateString; // Return original string if can't parse
            }
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Date formatting error:', error);
            return dateString;
        }
    },

    getProductIcon(product) {
    // Handle undefined, null, or non-string values
    if (!product || typeof product !== 'string') {
        console.warn('getProductIcon called with invalid product:', product);
        return '📦'; // Default icon
    }
    
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
    
    // Check exact match first
    if (icons[product]) {
        return icons[product];
    }
    
    // Default icons for product categories (safe includes check)
    const productLower = product.toLowerCase();
    
    if (productLower.includes('tomato')) return '🍅';
    if (productLower.includes('lettuce') || productLower.includes('cabbage') || productLower.includes('spinach')) return '🥬';
    if (productLower.includes('carrot')) return '🥕';
    if (productLower.includes('potato')) return '🥔';
    if (productLower.includes('onion')) return '🧅';
    if (productLower.includes('pepper')) return '🫑';
    if (productLower.includes('cucumber')) return '🥒';
    if (productLower.includes('bean')) return '🫘';
    if (productLower.includes('corn')) return '🌽';
    if (productLower.includes('apple')) return '🍎';
    if (productLower.includes('orange')) return '🍊';
    if (productLower.includes('banana')) return '🍌';
    if (productLower.includes('berry')) return '🫐';
    if (productLower.includes('mango')) return '🥭';
    
    return '📦';
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
    },

    printProductionReport() {
        window.print();
    },

    printTrendAnalysis() {
        window.print();
    },

    exportProduction() {
        const dataStr = JSON.stringify(this.productionData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `farm-production-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        this.showNotification('Production data exported successfully!', 'success');
    },

    unload() {
        console.log('📦 Unloading Production module...');
        this.broadcaster = null;
        this.initialized = false;
        this.element = null;
        console.log('✅ Production module unloaded');
    }
};

// ========== REGISTRATION ==========
(function() {
    const MODULE_NAME = 'production';
    const MODULE_OBJECT = ProductionModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
