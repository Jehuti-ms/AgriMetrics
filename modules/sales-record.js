// modules/sales-record.js - FIXED VERSION
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,

    initialize() {
        console.log('💰 Initializing Enhanced Sales Records...');
        
        if (!this.checkDependencies()) {
            console.error('❌ Sales Records initialization failed');
            return false;
        }
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.loadSalesData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ Enhanced Sales Records initialized');
        return true;
    },

    // ADD THIS RIGHT AFTER THE initialize() METHOD in sales-record.js

// Add the migrateSalesDates function
migrateSalesDates() {
    console.log('🔄 Migrating sales dates to YYYY-MM-DD format...');
    const sales = window.FarmModules.appData.sales || [];
    let migrated = 0;
    
    sales.forEach(sale => {
        if (sale.date && typeof sale.date === 'string') {
            // If it's already YYYY-MM-DD, leave it
            if (/^\d{4}-\d{2}-\d{2}$/.test(sale.date)) {
                return;
            }
            
            // Try to extract YYYY-MM-DD from any string format
            const match = sale.date.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const oldDate = sale.date;
                sale.date = match[0];
                console.log(`✅ Migrated sale ${sale.id}: ${oldDate} -> ${sale.date}`);
                migrated++;
            } else {
                // Try to parse as Date and format
                try {
                    const dateObj = new Date(sale.date);
                    if (!isNaN(dateObj.getTime())) {
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const newDate = `${year}-${month}-${day}`;
                        console.log(`✅ Migrated sale ${sale.id}: ${sale.date} -> ${newDate}`);
                        sale.date = newDate;
                        migrated++;
                    }
                } catch (e) {
                    console.error('Could not migrate date for sale:', sale.id, sale.date);
                }
            }
        }
    });
    
    if (migrated > 0) {
        this.saveData();
        console.log(`✅ Migrated ${migrated} sales dates to YYYY-MM-DD format`);
        this.showNotification(`Fixed ${migrated} sales dates`, 'info');
    }
    
    return migrated;
},

// Then update the initialize() method to call it:
initialize() {
    console.log('💰 Initializing Enhanced Sales Records...');
    
    if (!this.checkDependencies()) {
        console.error('❌ Sales Records initialization failed');
        return false;
    }
    
    this.element = document.getElementById('content-area');
    if (!this.element) {
        console.error('Content area element not found');
        return false;
    }
    
    if (window.StyleManager) {
        window.StyleManager.registerComponent(this.name);
    }
    
    this.loadSalesData();
    
    // FIX: Migrate dates before rendering
    this.migrateSalesDates();
    
    this.renderModule();
    this.setupEventListeners();
    this.initialized = true;
    
    console.log('✅ Enhanced Sales Records initialized');
    return true;
},
    // Add this after the migrateSalesDates function
debugAllSalesDates() {
    console.log('🔍 DEBUGGING ALL SALES DATES:');
    const sales = window.FarmModules.appData.sales || [];
    
    if (sales.length === 0) {
        console.log('No sales to debug');
        return;
    }
    
    console.log(`Total sales: ${sales.length}`);
    console.log('---');
    
    sales.forEach((sale, index) => {
        console.log(`Sale ${index} (ID: ${sale.id || 'N/A'}):`);
        console.log('  - Stored date:', sale.date);
        console.log('  - Type:', typeof sale.date);
        
        if (sale.date) {
            try {
                const dateObj = new Date(sale.date);
                console.log('  - As new Date():', dateObj.toString());
                console.log('  - Local date string:', dateObj.toLocaleDateString());
                console.log('  - getDate() [local]:', dateObj.getDate());
                console.log('  - getUTCDate():', dateObj.getUTCDate());
                console.log('  - Timezone offset:', dateObj.getTimezoneOffset(), 'minutes');
            } catch (e) {
                console.log('  - Error parsing date:', e.message);
            }
        }
        console.log('---');
    });
},
    
    checkDependencies() {
        if (!window.FarmModules || !window.FarmModules.appData) {
            console.error('❌ App data not available');
            return false;
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        return true;
    },

    onThemeChange(theme) {
        console.log(`Sales module updating for theme: ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    startSaleFromProduction(productionData) {
        console.log('🔄 Starting sale from production:', productionData);
        
        this.pendingProductionSale = productionData;
        this.showSaleModal();
        this.prefillFromProduction(productionData);
    },

    prefillFromProduction(productionData) {
        if (!productionData) return;
        
        const productSelect = document.getElementById('sale-product');
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        let productValue = '';
        const productName = productionData.type?.toLowerCase() || '';
        
        if (productName.includes('broiler')) {
            productValue = productName.includes('dressed') ? 'broilers-dressed' : 'broilers-live';
        } else if (productName.includes('pig') || productName.includes('pork')) {
            productValue = 'pork';
        } else if (productName.includes('cow') || productName.includes('beef')) {
            productValue = 'beef';
        } else if (productName.includes('chicken') && productName.includes('part')) {
            productValue = 'chicken-parts';
        } else if (productName.includes('goat')) {
            productValue = 'goat';
        } else if (productName.includes('lamb')) {
            productValue = 'lamb';
        } else if (productName.includes('egg')) {
            productValue = 'eggs';
        } else if (productName.includes('milk')) {
            productValue = 'milk';
        }
        
        if (productValue) {
            productSelect.value = productValue;
            this.handleProductChange();
            
            const availableQuantity = productionData.quantity || productionData.count || 0;
            const availableWeight = productionData.totalWeight || productionData.weight || 0;
            
            if (meatProducts.includes(productValue)) {
                document.getElementById('meat-animal-count').value = availableQuantity;
                document.getElementById('meat-weight').value = availableWeight;
            } else {
                document.getElementById('standard-quantity').value = availableQuantity;
            }
            
            this.setDefaultPrice(productValue);
        }
        
        const notesField = document.getElementById('sale-notes');
        const productionNote = `From production: ${productionData.type || productionData.product} (ID: ${productionData.id || 'N/A'})`;
        
        if (notesField.value) {
            notesField.value += `\n${productionNote}`;
        } else {
            notesField.value = productionNote;
        }
    },

    setDefaultPrice(product) {
        const defaultPrices = {
            'broilers-dressed': 5.50,
            'pork': 4.25,
            'beef': 6.75,
            'chicken-parts': 3.95,
            'goat': 5.25,
            'lamb': 6.50,
            'broilers-live': 4.00,
            'layers': 12.00,
            'chicks': 2.50,
            'eggs': 3.25,
            'tomatoes': 1.75,
            'peppers': 2.25,
            'cucumbers': 1.50,
            'lettuce': 1.25,
            'carrots': 1.00,
            'potatoes': 0.75,
            'milk': 2.50,
            'cheese': 6.00,
            'yogurt': 3.50,
            'butter': 4.50,
            'honey': 8.00,
            'jam': 5.00,
            'bread': 2.75
        };
        
        if (defaultPrices[product]) {
            const price = defaultPrices[product];
            
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            if (meatProducts.includes(product)) {
                const priceInput = document.getElementById('meat-price');
                if (priceInput) priceInput.value = price;
            } else {
                const priceStandardInput = document.getElementById('standard-price');
                if (priceStandardInput) priceStandardInput.value = price;
            }
            
            this.calculateSaleTotal();
        }
    },

    loadSalesData() {
        const savedData = localStorage.getItem('farm-sales-data');
        if (savedData) {
            try {
                window.FarmModules.appData.sales = JSON.parse(savedData);
            } catch (e) {
                console.error('Error parsing sales data:', e);
                window.FarmModules.appData.sales = [];
            }
        } else {
            window.FarmModules.appData.sales = [];
        }
        console.log('📊 Loaded sales data:', window.FarmModules.appData.sales.length, 'records');
    },

    saveData() {
        localStorage.setItem('farm-sales-data', JSON.stringify(window.FarmModules.appData.sales));
        
        if (window.FarmModules.Income) {
            window.FarmModules.Income.updateFromSales();
        }
    },

    renderModule() {
        if (!this.element) return;

        const today = window.DateUtils ? window.DateUtils.getToday() : this.getTodayFallback();
        const sales = window.FarmModules.appData.sales || [];
        
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);

        this.element.innerHTML = `
            <div class="module-container">
                <!-- Header -->
                <div class="module-header">
                    <h1 class="module-title">Sales Records</h1>
                    <p class="module-subtitle">Track product sales, revenue, and weight (for meat)</p>
                    <div class="header-actions">
                        <button class="btn-primary" id="add-sale">
                            ➕ Record Sale
                        </button>
                    </div>
                </div>

                <!-- Sales Summary -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="today-sales">${this.formatCurrency(todaySales)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Today's Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">⚖️</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-meat-weight">${totalMeatWeight.toFixed(2)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Meat Weight Sold</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐄</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-animals">${totalAnimalsSold}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Animals Sold</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;" id="total-sales">${sales.length}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Total Sales Records</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="add-sale-btn">
                        <div style="font-size: 32px;">➕</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Sale</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add new sale record</span>
                    </button>
                    <button class="quick-action-btn" id="from-production-btn">
                        <div style="font-size: 32px;">🔄</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">From Production</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Sell from production items</span>
                    </button>
                    <button class="quick-action-btn" id="meat-sales-btn">
                        <div style="font-size: 32px;">🍗</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Meat Sales</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Weight-based sales report</span>
                    </button>
                    <button class="quick-action-btn" id="daily-report-btn">
                        <div style="font-size: 32px;">📊</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Daily Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Today's sales summary</span>
                    </button>
                </div>

                <!-- Production Items Available -->
                ${this.renderProductionItems()}

                <!-- Quick Sale Form -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">⚡ Quick Sale</h3>
                    <form id="quick-sale-form">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                            <div>
                                <label class="form-label">Product *</label>
                                <select id="quick-product" required class="form-input">
                                    <option value="">Select Product</option>
                                    <optgroup label="Livestock (Meat)">
                                        <option value="broilers-dressed">Broilers (Dressed)</option>
                                        <option value="pork">Pork</option>
                                        <option value="beef">Beef</option>
                                        <option value="chicken-parts">Chicken Parts</option>
                                        <option value="goat">Goat</option>
                                        <option value="lamb">Lamb</option>
                                    </optgroup>
                                    <optgroup label="Poultry">
                                        <option value="broilers-live">Broilers (Live)</option>
                                        <option value="layers">Layers (Egg-laying)</option>
                                        <option value="eggs">Eggs</option>
                                        <option value="chicks">Baby Chicks</option>
                                    </optgroup>
                                    <optgroup label="Produce">
                                        <option value="tomatoes">Tomatoes</option>
                                        <option value="peppers">Peppers</option>
                                        <option value="cucumbers">Cucumbers</option>
                                        <option value="lettuce">Lettuce</option>
                                        <option value="carrots">Carrots</option>
                                        <option value="potatoes">Potatoes</option>
                                    </optgroup>
                                    <optgroup label="Other">
                                        <option value="honey">Honey</option>
                                        <option value="milk">Milk</option>
                                        <option value="other">Other</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Quantity *</label>
                                <input type="number" id="quick-quantity" placeholder="0" required class="form-input" min="1">
                            </div>
                            <div>
                                <label class="form-label">Unit</label>
                                <select id="quick-unit" class="form-input">
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="birds">Birds</option>
                                    <option value="animals">Animals</option>
                                    <option value="pieces">Pieces</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="case">Case</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label" id="quick-price-label">Price *</label>
                                <input type="number" id="quick-price" placeholder="0.00" step="0.01" required class="form-input" min="0">
                            </div>
                            <div>
                                <button type="submit" class="btn-primary" style="height: 42px;">Record Sale</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Sales Records Table -->
                <div class="glass-card" style="padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--text-primary); font-size: 20px;">📋 Recent Sales</h3>
                        <div style="display: flex; gap: 12px;">
                            <select id="period-filter" class="form-input" style="width: auto;">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                                <option value="meat">Meat Sales Only</option>
                                <option value="production">From Production</option>
                            </select>
                        </div>
                    </div>
                    <div id="sales-table">
                        ${this.renderSalesTable('today')}
                    </div>
                </div>
            </div>

            <!-- POPOUT MODALS -->
            <!-- Sales Record Modal -->
            <div id="sale-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 700px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="sale-modal-title">Record Sale</h3>
                        <button class="popout-modal-close" id="close-sale-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="sale-form">
                            <input type="hidden" id="sale-id" value="">
                            <input type="hidden" id="production-source-id" value="">
                            
                            <div id="production-source-notice" style="padding: 12px; background: #dbeafe; border-radius: 8px; margin-bottom: 16px; display: none;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 18px;">🔄</span>
                                    <div>
                                        <div style="font-weight: 600; color: #1e40af;">Selling from Production</div>
                                        <div style="font-size: 14px; color: #4b5563;" id="production-source-info"></div>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Sale Date *</label>
                                    <input type="date" id="sale-date" class="form-input" required>
                                </div>
                                <div>
                                    <label class="form-label">Customer Name</label>
                                    <input type="text" id="sale-customer" class="form-input" placeholder="Customer name (optional)">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Product *</label>
                                    <select id="sale-product" class="form-input" required>
                                        <option value="">Select Product</option>
                                        <optgroup label="Livestock (Meat - Weight Required)">
                                            <option value="broilers-dressed">Broilers (Dressed)</option>
                                            <option value="pork">Pork</option>
                                            <option value="beef">Beef</option>
                                            <option value="chicken-parts">Chicken Parts</option>
                                            <option value="goat">Goat</option>
                                            <option value="lamb">Lamb</option>
                                        </optgroup>
                                        <optgroup label="Poultry (Count)">
                                            <option value="broilers-live">Broilers (Live)</option>
                                            <option value="layers">Layers (Egg-laying)</option>
                                            <option value="chicks">Baby Chicks</option>
                                        </optgroup>
                                        <optgroup label="Eggs & Dairy">
                                            <option value="eggs">Eggs</option>
                                            <option value="milk">Milk</option>
                                            <option value="cheese">Cheese</option>
                                            <option value="yogurt">Yogurt</option>
                                            <option value="butter">Butter</option>
                                        </optgroup>
                                        <optgroup label="Vegetables">
                                            <option value="tomatoes">Tomatoes</option>
                                            <option value="peppers">Peppers</option>
                                            <option value="cucumbers">Cucumbers</option>
                                            <option value="lettuce">Lettuce</option>
                                            <option value="carrots">Carrots</option>
                                            <option value="potatoes">Potatoes</option>
                                        </optgroup>
                                        <optgroup label="Other">
                                            <option value="honey">Honey</option>
                                            <option value="jam">Jam/Preserves</option>
                                            <option value="bread">Bread</option>
                                            <option value="other">Other</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Unit *</label>
                                    <select id="sale-unit" class="form-input" required>
                                        <option value="">Select Unit</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="birds">Birds</option>
                                        <option value="animals">Animals</option>
                                        <option value="pieces">Pieces</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="case">Case</option>
                                        <option value="crate">Crate</option>
                                        <option value="bag">Bag</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="jar">Jar</option>
                                    </select>
                                </div>
                            </div>

                            <!-- MEAT SALES SECTION -->
                            <div id="meat-section" style="display: none; margin-bottom: 16px;">
                                <div style="background: #fef3f3; padding: 16px; border-radius: 8px; border: 1px solid #fed7d7; margin-bottom: 16px;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                        <span style="font-size: 20px; color: #dc2626;">🍗</span>
                                        <div style="font-weight: 600; color: #7c2d12;">Meat Sale Details</div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Number of Animals *</label>
                                            <input type="number" id="meat-animal-count" class="form-input" min="1" placeholder="0">
                                            <div class="form-hint">Number of birds/carcasses being sold</div>
                                        </div>
                                        <div>
                                            <label class="form-label">Total Weight *</label>
                                            <div style="display: flex; gap: 8px;">
                                                <input type="number" id="meat-weight" class="form-input" min="0.1" step="0.1" placeholder="0.0">
                                                <select id="meat-weight-unit" class="form-input" style="min-width: 100px;">
                                                    <option value="kg">kg</option>
                                                    <option value="lbs">lbs</option>
                                                </select>
                                            </div>
                                            <div class="form-hint">Total weight of all animals</div>
                                        </div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
                                        <div>
                                            <label class="form-label" id="meat-price-label">Price per kg *</label>
                                            <div style="display: flex; align-items: center; gap: 4px;">
                                                <span style="color: var(--text-secondary);">$</span>
                                                <input type="number" id="meat-price" class="form-input" step="0.01" min="0" placeholder="0.00">
                                                <span id="meat-price-unit-label" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap;">per kg</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="form-label">Average per Animal</label>
                                            <div style="padding: 8px; background: #f3f4f6; border-radius: 6px; text-align: center;">
                                                <div id="meat-avg-weight" style="font-weight: 600; color: #dc2626;">0.00 kg</div>
                                                <div id="meat-avg-value" style="font-size: 12px; color: #6b7280;">$0.00</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- STANDARD QUANTITY SECTION -->
                            <div id="standard-section" style="margin-bottom: 16px;">
                                <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                        <span style="font-size: 20px; color: #0ea5e9;">📦</span>
                                        <div style="font-weight: 600; color: #0369a1;">Standard Product Sale</div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Quantity *</label>
                                            <input type="number" id="standard-quantity" class="form-input" min="0.01" step="0.01" placeholder="0.00">
                                            <div class="form-hint">Amount to sell</div>
                                        </div>
                                        <div>
                                            <label class="form-label">Unit Price *</label>
                                            <div style="display: flex; align-items: center; gap: 4px;">
                                                <span style="color: var(--text-secondary);">$</span>
                                                <input type="number" id="standard-price" class="form-input" step="0.01" min="0" placeholder="0.00">
                                                <span id="standard-price-unit-label" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap;">per unit</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Payment Method *</label>
                                    <select id="sale-payment" class="form-input" required>
                                        <option value="cash">Cash</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="mobile">Mobile Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Payment Status</label>
                                    <select id="sale-status" class="form-input">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial Payment</option>
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Notes (Optional)</label>
                                <textarea id="sale-notes" class="form-input" placeholder="Sale notes, customer details, etc." rows="3"></textarea>
                            </div>

                            <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 16px;">
                                <h4 style="color: var(--text-primary); margin: 0; text-align: center;">
                                    Sale Total: <span id="sale-total-amount" style="color: var(--primary-color);">$0.00</span>
                                </h4>
                                <div id="meat-summary" style="display: none; text-align: center; margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                                    <div id="meat-summary-info">0 animals • 0 kg total • $0.00/animal average</div>
                                </div>
                                <div id="standard-summary" style="display: none; text-align: center; margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                                    <div id="standard-summary-info">0 units at $0.00/unit</div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-outline" id="cancel-sale">Cancel</button>
                        <button type="button" class="btn-danger" id="delete-sale" style="display: none;">Delete</button>
                        <button type="button" class="btn-primary" id="save-sale">Save Sale</button>
                    </div>
                </div>
            </div>

            <!-- Daily Report Modal -->
            <div id="daily-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="daily-report-title">Daily Sales Report</h3>
                        <button class="popout-modal-close" id="close-daily-report">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="daily-report-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-daily-report">🖨️ Print</button>
                        <button class="btn-primary" id="close-daily-report-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Meat Sales Report Modal -->
            <div id="meat-sales-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title" id="meat-sales-title">Meat Sales Report</h3>
                        <button class="popout-modal-close" id="close-meat-sales">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="meat-sales-content">
                            <!-- Report content will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="print-meat-sales">🖨️ Print</button>
                        <button class="btn-primary" id="close-meat-sales-btn">Close</button>
                    </div>
                </div>
            </div>

            <!-- Production Items Modal -->
            <div id="production-items-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 800px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Available Production Items</h3>
                        <button class="popout-modal-close" id="close-production-items">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <div id="production-items-content">
                            <!-- Production items will be inserted here -->
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="close-production-items-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        const todayInput = document.getElementById('sale-date');
        if (todayInput) {
            todayInput.value = today;
        }

        this.setupEventListeners();
    },

    renderProductionItems() {
        const productionModule = window.FarmModules.Production;
        if (!productionModule || !productionModule.getAvailableProducts) {
            return '';
        }

        const availableProducts = productionModule.getAvailableProducts();
        if (availableProducts.length === 0) {
            return '';
        }

        return `
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h3 style="color: #0369a1; margin: 0; font-size: 18px;">🔄 Available Production Items</h3>
                        <p style="color: #0c4a6e; margin: 4px 0 0 0; font-size: 14px;">Ready to sell from production</p>
                    </div>
                    <button class="btn-primary" id="view-production-items" style="background: #0ea5e9;">
                        View All Items
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                    ${availableProducts.slice(0, 3).map(item => `
                        <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #bae6fd; cursor: pointer;" 
                             onclick="window.FarmModules.SalesRecord.selectProductionItem('${item.id}')"
                             class="production-item">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="font-size: 20px;">${this.getProductIcon(item.type || item.product)}</span>
                                <div style="font-weight: 600; color: #1e293b;">${item.type || item.product}</div>
                            </div>
                            <div style="font-size: 12px; color: #475569;">
                                Quantity: ${item.quantity || item.count || 0}
                                ${item.totalWeight ? ` | Weight: ${item.totalWeight} kg` : ''}
                            </div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                                Produced: ${this.formatDate(item.date || item.productionDate)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    selectProductionItem(itemId) {
        const productionModule = window.FarmModules.Production;
        if (!productionModule || !productionModule.getProductionItem) {
            this.showNotification('Production module not available', 'error');
            return;
        }

        const productionItem = productionModule.getProductionItem(itemId);
        if (!productionItem) {
            this.showNotification('Production item not found', 'error');
            return;
        }

        this.startSaleFromProduction(productionItem);
    },

    renderSalesTable(period = 'today') {
        const sales = window.FarmModules.appData.sales || [];
        
        let filteredSales = sales;
        if (period === 'meat') {
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            filteredSales = sales.filter(sale => meatProducts.includes(sale.product));
        } else if (period === 'production') {
            filteredSales = sales.filter(sale => sale.productionSource);
        } else if (period !== 'all') {
            const cutoffDate = new Date();
            if (period === 'today') {
                cutoffDate.setDate(cutoffDate.getDate() - 1);
            } else if (period === 'week') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (period === 'month') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            }
            filteredSales = sales.filter(sale => new Date(sale.date) >= cutoffDate);
        }

        if (filteredSales.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No sales recorded</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Record your first sale to get started</div>
                </div>
            `;
        }

        const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Product</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Customer</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Animals/Quantity</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Unit Price</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Total</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Source</th>
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedSales.map(sale => {
                            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
                            const isMeat = meatProducts.includes(sale.product);
                            
                            let quantityInfo = `${sale.quantity} ${sale.unit}`;
                            if (isMeat && sale.weight && sale.weight > 0) {
                                quantityInfo = `${sale.animalCount || sale.quantity} animal${(sale.animalCount || sale.quantity) !== 1 ? 's' : ''}`;
                                if (sale.weight) {
                                    quantityInfo += ` • ${sale.weight} ${sale.weightUnit || 'kg'}`;
                                }
                            }
                            
                            const sourceBadge = sale.productionSource 
                                ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 4px;">PROD</span>'
                                : '';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${this.formatDate(sale.date)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 18px;">${this.getProductIcon(sale.product)}</span>
                                            <span style="font-weight: 500;">${this.formatProductName(sale.product)}</span>
                                            ${sourceBadge}
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary);">${sale.customer || 'Walk-in'}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">${quantityInfo}</td>
                                    <td style="padding: 12px 8px; color: var(--text-primary);">
                                        ${this.formatCurrency(sale.unitPrice)}
                                        ${sale.priceUnit === 'per-kg' ? '/kg' : sale.priceUnit === 'per-lb' ? '/lb' : ''}
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary); font-size: 12px;">
                                        ${sale.productionSource ? 'Production' : 'Direct'}
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-sale" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-sale" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
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

    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        const quickSaleForm = document.getElementById('quick-sale-form');
        if (quickSaleForm) {
            quickSaleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
        }

        const addSaleBtn = document.getElementById('add-sale');
        if (addSaleBtn) {
            addSaleBtn.addEventListener('click', () => this.showSaleModal());
        }
        
        const addSaleBtn2 = document.getElementById('add-sale-btn');
        if (addSaleBtn2) {
            addSaleBtn2.addEventListener('click', () => this.showSaleModal());
        }
        
        document.getElementById('from-production-btn')?.addEventListener('click', () => this.showProductionItems());
        document.getElementById('meat-sales-btn')?.addEventListener('click', () => this.generateMeatSalesReport());
        document.getElementById('daily-report-btn')?.addEventListener('click', () => this.generateDailyReport());
        document.getElementById('view-production-items')?.addEventListener('click', () => this.showProductionItems());
        
        document.getElementById('save-sale')?.addEventListener('click', () => this.saveSale());
        document.getElementById('delete-sale')?.addEventListener('click', () => this.deleteSale());
        document.getElementById('cancel-sale')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('close-sale-modal')?.addEventListener('click', () => this.hideSaleModal());
        
        document.getElementById('close-daily-report')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('close-daily-report-btn')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('print-daily-report')?.addEventListener('click', () => this.printDailyReport());
        
        document.getElementById('close-meat-sales')?.addEventListener('click', () => this.hideMeatSalesModal());
        document.getElementById('close-meat-sales-btn')?.addEventListener('click', () => this.hideMeatSalesModal());
        document.getElementById('print-meat-sales')?.addEventListener('click', () => this.printMeatSalesReport());
        
        document.getElementById('close-production-items')?.addEventListener('click', () => this.hideProductionItemsModal());
        document.getElementById('close-production-items-btn')?.addEventListener('click', () => this.hideProductionItemsModal());
        
        this.setupFormFieldListeners();
        
        document.getElementById('quick-product')?.addEventListener('change', () => this.handleQuickProductChange());

        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                document.getElementById('sales-table').innerHTML = this.renderSalesTable(e.target.value);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-sale')) {
                const saleId = e.target.closest('.edit-sale').dataset.id;
                console.log('✏️ Edit button clicked for sale:', saleId);
                this.editSale(saleId);
            }
            if (e.target.closest('.delete-sale')) {
                const saleId = e.target.closest('.delete-sale').dataset.id;
                this.deleteSaleRecord(saleId);
            }
        });
        
        console.log('✅ Event listeners set up');
    },

    setupFormFieldListeners() {
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.addEventListener('change', () => this.handleProductChange());
        }
        
        const fieldsToWatch = [
            'standard-quantity',
            'standard-price',
            'meat-animal-count',
            'meat-weight',
            'meat-price'
        ];
        
        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.calculateSaleTotal());
            }
        });
        
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) {
            weightUnit.addEventListener('change', () => {
                this.updatePriceUnitLabel();
                this.calculateSaleTotal();
            });
        }
    },

    getTodayFallback() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        if (!productSelect) return;
        
        const selectedValue = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const isMeatProduct = meatProducts.includes(selectedValue);
        
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        const meatSummary = document.getElementById('meat-summary');
        const standardSummary = document.getElementById('standard-summary');
        
        if (isMeatProduct) {
            if (meatSection) meatSection.style.display = 'block';
            if (meatSummary) meatSummary.style.display = 'block';
            if (standardSection) standardSection.style.display = 'none';
            if (standardSummary) standardSummary.style.display = 'none';
            
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) unitSelect.value = 'animals';
            
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit) {
                weightUnit.value = 'kg';
            }
            
            const animalLabel = selectedValue === 'chicken-parts' ? 'Number of Packages' : 
                              selectedValue.includes('broilers') ? 'Number of Birds' : 
                              selectedValue === 'pork' ? 'Number of Pigs' :
                              selectedValue === 'beef' ? 'Number of Cattle' :
                              selectedValue === 'goat' ? 'Number of Goats' :
                              selectedValue === 'lamb' ? 'Number of Lambs' : 'Number of Animals';
            
            const animalLabelElement = document.querySelector('label[for="meat-animal-count"]');
            if (animalLabelElement) {
                animalLabelElement.textContent = animalLabel + ' *';
            }
            
            this.updatePriceUnitLabel();
            
            const standardQuantity = document.getElementById('standard-quantity');
            const standardPrice = document.getElementById('standard-price');
            if (standardQuantity) standardQuantity.value = '';
            if (standardPrice) standardPrice.value = '';
            
        } else {
            if (meatSection) meatSection.style.display = 'none';
            if (meatSummary) meatSummary.style.display = 'none';
            if (standardSection) standardSection.style.display = 'block';
            if (standardSummary) standardSummary.style.display = 'block';
            
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) {
                if (selectedValue === 'eggs') {
                    unitSelect.value = 'dozen';
                } else if (selectedValue === 'milk') {
                    unitSelect.value = 'liters';
                } else if (selectedValue === 'broilers-live' || selectedValue === 'layers' || selectedValue === 'chicks') {
                    unitSelect.value = 'birds';
                } else {
                    unitSelect.value = 'kg';
                }
            }
            
            const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
            if (standardPriceUnitLabel) {
                standardPriceUnitLabel.textContent = selectedValue === 'eggs' ? 'per dozen' : 
                                                   selectedValue === 'milk' ? 'per liter' :
                                                   selectedValue.includes('broilers') || selectedValue === 'layers' || selectedValue === 'chicks' ? 'per bird' :
                                                   'per kg';
            }
            
            const meatAnimalCount = document.getElementById('meat-animal-count');
            const meatWeight = document.getElementById('meat-weight');
            const meatPrice = document.getElementById('meat-price');
            if (meatAnimalCount) meatAnimalCount.value = '';
            if (meatWeight) meatWeight.value = '';
            if (meatPrice) meatPrice.value = '';
        }
        
        this.calculateSaleTotal();
        this.setDefaultPrice(selectedValue);
    },

    updatePriceUnitLabel() {
        const weightUnit = document.getElementById('meat-weight-unit')?.value;
        const priceUnitLabel = document.getElementById('meat-price-unit-label');
        const priceLabel = document.getElementById('meat-price-label');
        
        if (weightUnit === 'lbs') {
            if (priceUnitLabel) priceUnitLabel.textContent = 'per lb';
            if (priceLabel) priceLabel.textContent = 'Price per lb *';
        } else {
            if (priceUnitLabel) priceUnitLabel.textContent = 'per kg';
            if (priceLabel) priceLabel.textContent = 'Price per kg *';
        }
    },

    handleQuickProductChange() {
        const productSelect = document.getElementById('quick-product');
        const selectedValue = productSelect.value;
        const unitSelect = document.getElementById('quick-unit');
        
        if (!unitSelect) return;
        
        if (selectedValue === 'eggs') {
            unitSelect.value = 'dozen';
        } else if (selectedValue === 'milk') {
            unitSelect.value = 'liters';
        } else if (selectedValue.includes('broilers') || selectedValue === 'layers' || selectedValue === 'chicks') {
            unitSelect.value = 'birds';
        } else if (['pork', 'beef', 'goat', 'lamb', 'chicken-parts'].includes(selectedValue)) {
            unitSelect.value = 'kg';
        } else {
            unitSelect.value = 'kg';
        }
    },

    calculateSaleTotal() {
        const product = document.getElementById('sale-product')?.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        let total = 0;
        
        if (meatProducts.includes(product)) {
            const animalCount = parseFloat(document.getElementById('meat-animal-count')?.value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit')?.value;
            const pricePerUnit = parseFloat(document.getElementById('meat-price')?.value) || 0;
            
            if (weightUnit === 'lbs') {
                total = weight * pricePerUnit;
            } else {
                total = weight * pricePerUnit;
            }
            
            const meatSummary = document.getElementById('meat-summary-info');
            const avgWeightElement = document.getElementById('meat-avg-weight');
            const avgValueElement = document.getElementById('meat-avg-value');
            
            if (meatSummary && avgWeightElement && avgValueElement) {
                if (animalCount > 0 && weight > 0) {
                    const avgWeight = weight / animalCount;
                    const avgValue = total / animalCount;
                    
                    const weightUnitText = weightUnit === 'lbs' ? 'lbs' : 'kg';
                    const priceUnitText = weightUnit === 'lbs' ? 'per lb' : 'per kg';
                    
                    meatSummary.textContent = `${animalCount} animal${animalCount !== 1 ? 's' : ''} • ${weight.toFixed(2)} ${weightUnitText} total • ${this.formatCurrency(avgValue)} per animal`;
                    avgWeightElement.textContent = `${avgWeight.toFixed(2)} ${weightUnitText}/animal`;
                    avgValueElement.textContent = `${this.formatCurrency(avgValue)}/animal`;
                } else {
                    meatSummary.textContent = '0 animals • 0 kg total • $0.00 per animal';
                    avgWeightElement.textContent = '0.00 kg/animal';
                    avgValueElement.textContent = '$0.00/animal';
                }
            }
        } else {
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
            total = quantity * price;
            
            const standardSummary = document.getElementById('standard-summary-info');
            if (standardSummary) {
                standardSummary.textContent = `${quantity} ${quantity !== 1 ? 'units' : 'unit'} at ${this.formatCurrency(price)} per unit`;
            }
        }
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    showSaleModal() {
        console.log('🆕 Showing modal for NEW sale');
        
        this.hideAllModals();
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        const saleIdInput = document.getElementById('sale-id');
        if (saleIdInput) {
            saleIdInput.value = '';
        }
        
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = window.DateUtils ? window.DateUtils.getToday() : this.getTodayFallback();
        }
        
        const form = document.getElementById('sale-form');
        if (form) {
            form.reset();
        }
        
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = '';
        
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) weightUnit.value = 'kg';
        
        const paymentMethod = document.getElementById('sale-payment');
        if (paymentMethod) paymentMethod.value = 'cash';
        
        const paymentStatus = document.getElementById('sale-status');
        if (paymentStatus) paymentStatus.value = 'paid';
        
        document.getElementById('sale-modal-title').textContent = 'Record Sale';
        document.getElementById('delete-sale').style.display = 'none';
        document.getElementById('production-source-notice').style.display = 'none';
        
        const fieldsToClear = [
            'sale-customer',
            'sale-notes',
            'meat-animal-count',
            'meat-weight',
            'meat-price',
            'standard-quantity',
            'standard-price'
        ];
        
        fieldsToClear.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        if (this.pendingProductionSale) {
            this.prefillFromProduction(this.pendingProductionSale);
            this.showProductionSourceNotice();
        } else {
            const productSelect = document.getElementById('sale-product');
            if (productSelect) productSelect.value = '';
        }
        
        setTimeout(() => {
            this.handleProductChange();
        }, 10);
        
        this.setupFormFieldListeners();
    },

    // FIXED editSale METHOD with DateUtils
editSale(saleId) {
    console.log('🔄 Edit sale clicked:', saleId);
    
    const sales = window.FarmModules.appData.sales || [];
    const sale = sales.find(s => s.id === saleId);
    
    if (!sale) {
        console.error('❌ Sale not found:', saleId);
        this.showNotification('Sale not found', 'error');
        return;
    }

    console.log('📝 Found sale to edit:', sale);
    console.log('📅 Original sale date stored as:', sale.date);

    this.hideAllModals();
    
    const modal = document.getElementById('sale-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    const saleIdInput = document.getElementById('sale-id');
    if (saleIdInput) {
        saleIdInput.value = sale.id;
    }
    
    document.getElementById('sale-modal-title').textContent = 'Edit Sale';
    document.getElementById('delete-sale').style.display = 'block';
    document.getElementById('production-source-notice').style.display = 'none';
    
    // FIXED: SIMPLE DATE HANDLING - NO DATE OBJECTS
    const dateInput = document.getElementById('sale-date');
    if (dateInput) {
        let displayDate = '';
        
        // Check what format the date is stored in
        console.log('🔍 Date stored as:', sale.date, 'Type:', typeof sale.date);
        
        if (typeof sale.date === 'string') {
            // If it's already YYYY-MM-DD, use it directly
            if (/^\d{4}-\d{2}-\d{2}$/.test(sale.date)) {
                displayDate = sale.date;
                console.log('✅ Date already in YYYY-MM-DD format:', displayDate);
            } 
            // If it's a different string format, parse it
            else if (sale.date.includes('T') || sale.date.includes(' ')) {
                // It's an ISO string or date string - extract YYYY-MM-DD
                const dateParts = sale.date.split('T')[0];
                if (dateParts && /^\d{4}-\d{2}-\d{2}$/.test(dateParts)) {
                    displayDate = dateParts;
                    console.log('✅ Extracted YYYY-MM-DD from ISO string:', displayDate);
                }
            }
        }
        
        // If we couldn't parse it, try DateUtils as last resort
        if (!displayDate && window.DateUtils && window.DateUtils.formatDateForInput) {
            displayDate = window.DateUtils.formatDateForInput(sale.date);
            console.log('✅ Used DateUtils to format:', sale.date, '->', displayDate);
        }
        
        // Final fallback: manual extraction
        if (!displayDate) {
            try {
                // Try to extract YYYY-MM-DD from any string
                const match = sale.date.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                    displayDate = match[0];
                    console.log('✅ Extracted via regex:', displayDate);
                }
            } catch (e) {
                console.error('Could not parse date:', e);
            }
        }
        
        // Set the date input
        dateInput.value = displayDate || '';
        console.log('📅 FINAL Date input set to:', dateInput.value);
    }
        
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit || 'animals';
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(sale.product)) {
            document.getElementById('meat-section').style.display = 'block';
            document.getElementById('standard-section').style.display = 'none';
            document.getElementById('meat-summary').style.display = 'block';
            document.getElementById('standard-summary').style.display = 'none';
            
            document.getElementById('meat-animal-count').value = sale.animalCount || sale.quantity || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice || '';
            
            document.getElementById('standard-quantity').value = '';
            document.getElementById('standard-price').value = '';
            
            setTimeout(() => {
                this.updatePriceUnitLabel();
            }, 10);
            
        } else {
            document.getElementById('meat-section').style.display = 'none';
            document.getElementById('standard-section').style.display = 'block';
            document.getElementById('meat-summary').style.display = 'none';
            document.getElementById('standard-summary').style.display = 'block';
            
            document.getElementById('standard-quantity').value = sale.quantity || '';
            document.getElementById('standard-price').value = sale.unitPrice || '';
            
            document.getElementById('meat-animal-count').value = '';
            document.getElementById('meat-weight').value = '';
            document.getElementById('meat-price').value = '';
        }
        
        setTimeout(() => {
            this.calculateSaleTotal();
        }, 100);
        
        this.setupFormFieldListeners();
    },

    showProductionSourceNotice() {
        if (!this.pendingProductionSale) return;
        
        const noticeElement = document.getElementById('production-source-notice');
        const infoElement = document.getElementById('production-source-info');
        
        if (noticeElement && infoElement) {
            noticeElement.style.display = 'block';
            infoElement.textContent = `${this.pendingProductionSale.type || this.pendingProductionSale.product} • ${this.pendingProductionSale.quantity || this.pendingProductionSale.count || 0} units`;
        }
    },

    showProductionItems() {
        this.hideAllModals();
        
        const productionModule = window.FarmModules.Production;
        if (!productionModule || !productionModule.getAvailableProducts) {
            this.showNotification('Production module not available', 'error');
            return;
        }
        
        const productionItems = productionModule.getAvailableProducts();
        
        let content = '<div class="production-items-list">';
        
        if (productionItems.length === 0) {
            content += `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <h4 style="color: #374151; margin-bottom: 8px;">No production items available</h4>
                    <p style="color: var(--text-secondary);">Add production items in the Production module first</p>
                </div>
            `;
        } else {
            content += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">';
            
            productionItems.forEach(item => {
                content += `
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer;" 
                         onclick="window.FarmModules.SalesRecord.selectProductionItem('${item.id}')"
                         class="production-item-select">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <span style="font-size: 24px;">${this.getProductIcon(item.type || item.product)}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${item.type || item.product}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">ID: ${item.id}</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 11px; color: #6b7280;">Quantity</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${item.quantity || item.count || 0}</div>
                            </div>
                            ${item.totalWeight ? `
                                <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                    <div style="font-size: 11px; color: #6b7280;">Total Weight</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${item.totalWeight} kg</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            <div>Produced: ${this.formatDate(item.date || item.productionDate)}</div>
                            ${item.notes ? `<div style="margin-top: 4px;">Notes: ${item.notes.substring(0, 50)}${item.notes.length > 50 ? '...' : ''}</div>` : ''}
                        </div>
                        
                        <button style="width: 100%; margin-top: 12px; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Sell This Item
                        </button>
                    </div>
                `;
            });
            
            content += '</div>';
        }
        
        content += '</div>';
        
        const contentElement = document.getElementById('production-items-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        const modal = document.getElementById('production-items-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideSaleModal() {
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.pendingProductionSale = null;
    },

    hideProductionItemsModal() {
        const modal = document.getElementById('production-items-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showDailyReportModal() {
        this.hideAllModals();
        const modal = document.getElementById('daily-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideDailyReportModal() {
        const modal = document.getElementById('daily-report-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    showMeatSalesModal() {
        this.hideAllModals();
        const modal = document.getElementById('meat-sales-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideMeatSalesModal() {
        const modal = document.getElementById('meat-sales-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    hideAllModals() {
        this.hideSaleModal();
        this.hideDailyReportModal();
        this.hideMeatSalesModal();
        this.hideProductionItemsModal();
    },

    validateSaleData(saleData) {
        const errors = [];
        
        if (!saleData.date) errors.push('Date is required');
        if (!saleData.product) errors.push('Product is required');
        if (!saleData.paymentMethod) errors.push('Payment method is required');
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(saleData.product)) {
            if (!saleData.weight || saleData.weight <= 0) {
                errors.push('Weight must be greater than 0');
            }
            if (!saleData.animalCount || saleData.animalCount <= 0) {
                errors.push('Number of animals must be greater than 0');
            }
            if (!saleData.unitPrice || saleData.unitPrice <= 0) {
                errors.push('Price must be greater than 0');
            }
        } else {
            if (!saleData.quantity || saleData.quantity <= 0) {
                errors.push('Quantity must be greater than 0');
            }
            if (!saleData.unitPrice || saleData.unitPrice <= 0) {
                errors.push('Price must be greater than 0');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    handleQuickSale() {
    const product = document.getElementById('quick-product')?.value;
    const quantity = parseFloat(document.getElementById('quick-quantity')?.value) || 0;
    const unit = document.getElementById('quick-unit')?.value;
    const price = parseFloat(document.getElementById('quick-price')?.value) || 0;

    if (!product || !quantity || !price) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Get today's date as YYYY-MM-DD directly
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const storageDate = `${year}-${month}-${day}`;
    
    console.log('📅 Quick sale date:', storageDate);

    const saleData = {
        id: 'SALE-' + Date.now().toString().slice(-6),
        product: product,
        quantity: quantity,
        unit: unit,
        unitPrice: price,
        totalAmount: quantity * price,
        date: storageDate, // Store YYYY-MM-DD string directly
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        customer: 'Walk-in'
    };

    this.addSale(saleData);
    
    const form = document.getElementById('quick-sale-form');
    if (form) {
        form.reset();
        const unitSelect = document.getElementById('quick-unit');
        if (unitSelect) unitSelect.value = 'kg';
    }
    
    this.showNotification('Quick sale recorded!', 'success');
},
    // ADD A DEBUG FUNCTION TO CHECK ALL DATES
debugAllSalesDates() {
    console.log('🔍 DEBUGGING ALL SALES DATES:');
    const sales = window.FarmModules.appData.sales || [];
    
    sales.forEach((sale, index) => {
        console.log(`Sale ${index} (ID: ${sale.id}):`);
        console.log('  - Stored date:', sale.date);
        console.log('  - Type:', typeof sale.date);
        console.log('  - As new Date():', new Date(sale.date));
        console.log('  - Local date string:', new Date(sale.date).toLocaleDateString());
        console.log('  - ISO string:', new Date(sale.date).toISOString());
        console.log('  - getDate():', new Date(sale.date).getDate());
        console.log('  - getUTCDate():', new Date(sale.date).getUTCDate());
        console.log('---');
    });
},
    
    addSale(saleData) {
        if (!saleData.id) {
            saleData.id = 'SALE-' + Date.now();
        }
        
        const validation = this.validateSaleData(saleData);
        if (!validation.isValid) {
            this.showNotification(validation.errors.join(', '), 'error');
            return false;
        }
        
        if (!saleData.totalAmount) {
            if (saleData.weight && saleData.unitPrice) {
                saleData.totalAmount = saleData.weight * saleData.unitPrice;
            } else if (saleData.quantity && saleData.unitPrice) {
                saleData.totalAmount = saleData.quantity * saleData.unitPrice;
            }
        }
        
        if (this.pendingProductionSale) {
            saleData.productionSource = true;
            saleData.productionItemId = this.pendingProductionSale.id;
            
            const productionModule = window.FarmModules.Production;
            if (productionModule && productionModule.markAsSold) {
                const soldQuantity = saleData.animalCount || saleData.quantity;
                productionModule.markAsSold(this.pendingProductionSale.id, soldQuantity);
            }
            
            this.pendingProductionSale = null;
        }
        
        window.FarmModules.appData.sales.push(saleData);
        this.saveData();
        this.renderModule();
        
        this.showNotification('Sale recorded successfully!', 'success');
        return true;
    },

    saveSale() {
        console.log('💾 Saving sale...');
        
        const saleIdInput = document.getElementById('sale-id');
        const saleId = saleIdInput?.value;
        
        console.log('Sale ID from form:', saleId);
        
        if (saleId && saleId.trim() !== '') {
            console.log('🔄 Updating existing sale');
            this.updateSale(saleId);
        } else {
            console.log('🆕 Creating new sale');
            this.createNewSale();
        }
    },

createNewSale() {
    const product = document.getElementById('sale-product')?.value;
    const dateInputValue = document.getElementById('sale-date')?.value;
    const customer = document.getElementById('sale-customer')?.value || 'Walk-in';
    const paymentMethod = document.getElementById('sale-payment')?.value;
    const paymentStatus = document.getElementById('sale-status')?.value;
    const notes = document.getElementById('sale-notes')?.value;
    const unit = document.getElementById('sale-unit')?.value || 'animals';
    
    console.log('📅 Raw date from form input:', dateInputValue);
    
    // FIXED: Store EXACTLY what the date input gives us
    // Input type="date" ALWAYS gives YYYY-MM-DD in local timezone
    const storageDate = dateInputValue; // Just store it as-is
    console.log('✅ Storing date exactly as from input:', storageDate);
    
    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const isMeatProduct = meatProducts.includes(product);
    
    let saleData;
    
    if (isMeatProduct) {
        const animalCount = parseFloat(document.getElementById('meat-animal-count')?.value) || 0;
        const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
        const weightUnit = document.getElementById('meat-weight-unit')?.value || 'kg';
        const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
        const total = weight * price;
        
        saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            animalCount: animalCount,
            quantity: animalCount,
            weight: weight,
            weightUnit: weightUnit,
            unitPrice: price,
            totalAmount: total,
            unit: unit,
            date: storageDate, // Store YYYY-MM-DD string directly
            customer: customer,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            notes: notes,
            priceUnit: weightUnit === 'lbs' ? 'per-lb' : 'per-kg'
        };
    } else {
        const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
        const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
        const total = quantity * price;
        
        saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            quantity: quantity,
            unitPrice: price,
            totalAmount: total,
            unit: unit,
            date: storageDate, // Store YYYY-MM-DD string directly
            customer: customer,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            notes: notes
        };
    }
    
    console.log('💾 New sale data to save:', saleData);
    const success = this.addSale(saleData);
    
    if (success) {
        console.log('✅ Sale created successfully');
        this.hideSaleModal();
    }
},

   // IN THE updateSale METHOD - SIMPLIFIED DATE HANDLING
updateSale(saleId) {
    console.log('📝 Updating sale ID:', saleId);
    
    const sales = window.FarmModules.appData.sales || [];
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) {
        console.error('❌ Sale not found for update:', saleId);
        this.showNotification('Sale not found', 'error');
        return;
    }
    
    const product = document.getElementById('sale-product')?.value;
    const dateInputValue = document.getElementById('sale-date')?.value;
    const customer = document.getElementById('sale-customer')?.value || 'Walk-in';
    const paymentMethod = document.getElementById('sale-payment')?.value;
    const paymentStatus = document.getElementById('sale-status')?.value;
    const notes = document.getElementById('sale-notes')?.value;
    const unit = document.getElementById('sale-unit')?.value || 'animals';
    
    console.log('📅 Raw update date from form:', dateInputValue);
    
    // FIXED: Store EXACTLY what the date input gives us
    const storageDate = dateInputValue; // Just store it as-is
    console.log('✅ Storing update date exactly as from input:', storageDate);
    
    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const isMeatProduct = meatProducts.includes(product);
    
    let updatedSale = { ...sales[saleIndex] };
    
    updatedSale.product = product;
    updatedSale.date = storageDate; // Store YYYY-MM-DD string directly
    updatedSale.customer = customer;
    updatedSale.paymentMethod = paymentMethod;
    updatedSale.paymentStatus = paymentStatus;
    updatedSale.notes = notes;
    updatedSale.unit = unit;
        
        if (isMeatProduct) {
            const animalCount = parseFloat(document.getElementById('meat-animal-count')?.value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit')?.value || 'kg';
            const price = parseFloat(document.getElementById('meat-price')?.value) || 0;
            const total = weight * price;
            
            updatedSale.animalCount = animalCount;
            updatedSale.quantity = animalCount;
            updatedSale.weight = weight;
            updatedSale.weightUnit = weightUnit;
            updatedSale.unitPrice = price;
            updatedSale.totalAmount = total;
            updatedSale.priceUnit = weightUnit === 'lbs' ? 'per-lb' : 'per-kg';
            
            delete updatedSale.standardQuantity;
            delete updatedSale.standardPrice;
        } else {
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
            const total = quantity * price;
            
            updatedSale.quantity = quantity;
            updatedSale.unitPrice = price;
            updatedSale.totalAmount = total;
            
            delete updatedSale.animalCount;
            delete updatedSale.weight;
            delete updatedSale.weightUnit;
            delete updatedSale.priceUnit;
        }
        
        console.log('Updated sale data:', updatedSale);
        
        const validation = this.validateSaleData(updatedSale);
        if (!validation.isValid) {
            this.showNotification(validation.errors.join(', '), 'error');
            return;
        }
        
        sales[saleIndex] = updatedSale;
        window.FarmModules.appData.sales = sales;
        
        this.saveData();
        this.renderModule();
        this.hideSaleModal();
        
        this.showNotification('Sale updated successfully!', 'success');
        console.log('✅ Sale updated successfully');
    },

    deleteSale() {
        const saleIdInput = document.getElementById('sale-id');
        const saleId = saleIdInput?.value;
        
        if (!saleId) {
            this.showNotification('No sale selected for deletion', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideSaleModal();
        }
    },

    deleteSaleRecord(saleId) {
        const sales = window.FarmModules.appData.sales || [];
        const saleIndex = sales.findIndex(s => s.id === saleId);
        
        if (saleIndex === -1) {
            this.showNotification('Sale not found', 'error');
            return;
        }
        
        const sale = sales[saleIndex];
        
        sales.splice(saleIndex, 1);
        window.FarmModules.appData.sales = sales;
        this.saveData();
        this.renderModule();
        
        this.showNotification('Sale deleted successfully', 'success');
        
        if (sale.productionSource && sale.productionItemId) {
            console.log(`Note: Sale ${saleId} was from production item ${sale.productionItemId}. You may want to restore production quantities.`);
        }
    },

    generateDailyReport() {
        const today = window.DateUtils ? window.DateUtils.getToday() : this.getTodayFallback();
        const sales = window.FarmModules.appData.sales || [];
        
        const todaySales = sales.filter(sale => {
            const saleDate = window.DateUtils ? window.DateUtils.fromStorageFormat(sale.date) : sale.date;
            return saleDate === today;
        });
        
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalItems = todaySales.reduce((sum, sale) => sum + (sale.quantity || sale.animalCount || 0), 0);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = todaySales.filter(sale => meatProducts.includes(sale.product));
        const meatRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        
        let reportHtml = `
            <div class="daily-report">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 4px;">Daily Sales Report</h3>
                    <div style="color: var(--text-secondary);">${this.formatDate(today)}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Total Revenue</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--primary-color);">${this.formatCurrency(totalRevenue)}</div>
                    </div>
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Items Sold</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--text-primary);">${totalItems}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">Sales Breakdown</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="padding: 12px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px;">
                            <div style="font-size: 12px; color: #7c2d12;">Meat Sales</div>
                            <div style="font-size: 20px; font-weight: 600; color: #dc2626;">${this.formatCurrency(meatRevenue)}</div>
                            <div style="font-size: 11px; color: #b91c1c;">${meatSales.length} sales • ${totalMeatWeight.toFixed(2)} kg</div>
                        </div>
                        <div style="padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px;">
                            <div style="font-size: 12px; color: #0369a1;">Other Products</div>
                            <div style="font-size: 20px; font-weight: 600; color: #0ea5e9;">${this.formatCurrency(totalRevenue - meatRevenue)}</div>
                            <div style="font-size: 11px; color: #0284c7;">${todaySales.length - meatSales.length} sales</div>
                        </div>
                    </div>
                </div>
        `;
        
        if (todaySales.length > 0) {
            reportHtml += `
                <div>
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">Today's Sales</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Time</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Product</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Customer</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            todaySales.forEach(sale => {
                let time = '';
                if (sale.timestamp) {
                    const date = new Date(sale.timestamp);
                    time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                } else {
                    time = 'N/A';
                }
                
                reportHtml += `
                    <tr style="border-bottom: 1px solid var(--glass-border-light);">
                        <td style="padding: 8px; font-size: 12px; color: var(--text-secondary);">${time}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary);">${this.formatProductName(sale.product)}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-secondary);">${sale.customer || 'Walk-in'}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            reportHtml += `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div>No sales recorded today</div>
                </div>
            `;
        }
        
        reportHtml += '</div>';
        
        const contentElement = document.getElementById('daily-report-content');
        if (contentElement) {
            contentElement.innerHTML = reportHtml;
        }
        
        this.showDailyReportModal();
    },

    generateMeatSalesReport() {
        const sales = window.FarmModules.appData.sales || [];
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        
        let reportHtml = `
            <div class="meat-sales-report">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 4px;">Meat Sales Report</h3>
                    <div style="color: var(--text-secondary);">All Time</div>
                </div>
        `;
        
        if (meatSales.length === 0) {
            reportHtml += `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🍗</div>
                    <h4 style="color: #374151; margin-bottom: 8px;">No meat sales recorded</h4>
                    <p style="color: var(--text-secondary);">Record meat sales to see the report</p>
                </div>
            `;
        } else {
            const totalWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
            const totalRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
            const avgPricePerKg = totalWeight > 0 ? totalRevenue / totalWeight : 0;
            const avgWeightPerAnimal = totalAnimals > 0 ? totalWeight / totalAnimals : 0;
            
            reportHtml += `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 16px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px; border: 1px solid #fed7d7;">
                        <div style="font-size: 14px; color: #7c2d12; margin-bottom: 4px;">Total Weight Sold</div>
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${totalWeight.toFixed(2)} kg</div>
                    </div>
                    <div style="padding: 16px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px; border: 1px solid #fed7d7;">
                        <div style="font-size: 14px; color: #7c2d12; margin-bottom: 4px;">Animals Sold</div>
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${totalAnimals}</div>
                    </div>
                    <div style="padding: 16px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px; border: 1px solid #fed7d7;">
                        <div style="font-size: 14px; color: #7c2d12; margin-bottom: 4px;">Total Revenue</div>
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${this.formatCurrency(totalRevenue)}</div>
                    </div>
                    <div style="padding: 16px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px; border: 1px solid #fed7d7;">
                        <div style="font-size: 14px; color: #7c2d12; margin-bottom: 4px;">Avg Price per kg</div>
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${this.formatCurrency(avgPricePerKg)}</div>
                    </div>
                </div>
            `;
            
            const productBreakdown = {};
            meatSales.forEach(sale => {
                if (!productBreakdown[sale.product]) {
                    productBreakdown[sale.product] = {
                        count: 0,
                        weight: 0,
                        revenue: 0,
                        animals: 0
                    };
                }
                productBreakdown[sale.product].count++;
                productBreakdown[sale.product].weight += sale.weight || 0;
                productBreakdown[sale.product].revenue += sale.totalAmount;
                productBreakdown[sale.product].animals += sale.animalCount || sale.quantity || 0;
            });
            
            reportHtml += `
                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">Breakdown by Product</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            `;
            
            Object.entries(productBreakdown).forEach(([product, data]) => {
                reportHtml += `
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <span style="font-size: 24px;">${this.getProductIcon(product)}</span>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(product)}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 11px; color: #6b7280;">Sales</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${data.count}</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 11px; color: #6b7280;">Animals</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${data.animals}</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 11px; color: #6b7280;">Weight</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${data.weight.toFixed(2)} kg</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                                <div style="font-size: 11px; color: #6b7280;">Revenue</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(data.revenue)}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            reportHtml += `
                    </div>
                </div>
            `;
            
            const recentSales = meatSales
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 20);
            
            reportHtml += `
                <div>
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">Recent Meat Sales</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Date</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Product</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Animals</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Weight</th>
                                    <th style="padding: 8px; text-align: left; font-size: 12px; color: var(--text-secondary);">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            recentSales.forEach(sale => {
                reportHtml += `
                    <tr style="border-bottom: 1px solid var(--glass-border-light);">
                        <td style="padding: 8px; font-size: 12px; color: var(--text-secondary);">${this.formatDate(sale.date)}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary);">${this.formatProductName(sale.product)}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary);">${sale.animalCount || sale.quantity || 0}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary);">${sale.weight?.toFixed(2) || '0.00'} ${sale.weightUnit || 'kg'}</td>
                        <td style="padding: 8px; font-size: 12px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        reportHtml += '</div>';
        
        const contentElement = document.getElementById('meat-sales-content');
        if (contentElement) {
            contentElement.innerHTML = reportHtml;
        }
        
        this.showMeatSalesModal();
    },

    printDailyReport() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.showNotification('Please allow popups to print', 'error');
            return;
        }
        
        const reportContent = document.getElementById('daily-report-content')?.innerHTML;
        if (!reportContent) return;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .summary { margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .total { font-weight: bold; color: #2c3e50; }
                </style>
            </head>
            <body>
                ${reportContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    printMeatSalesReport() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.showNotification('Please allow popups to print', 'error');
            return;
        }
        
        const reportContent = document.getElementById('meat-sales-content')?.innerHTML;
        if (!reportContent) return;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meat Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .summary { margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .total { font-weight: bold; color: #2c3e50; }
                </style>
            </head>
            <body>
                ${reportContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    formatCurrency(amount) {
        if (amount === undefined || amount === null) return '$0.00';
        return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        if (window.DateUtils) {
            return window.DateUtils.formatDateForDisplay(dateString);
        }
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    },

    formatProductName(productKey) {
        const productNames = {
            'broilers-dressed': 'Broilers (Dressed)',
            'broilers-live': 'Broilers (Live)',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
            'layers': 'Layers',
            'eggs': 'Eggs',
            'chicks': 'Baby Chicks',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'yogurt': 'Yogurt',
            'butter': 'Butter',
            'honey': 'Honey',
            'jam': 'Jam/Preserves',
            'bread': 'Bread',
            'other': 'Other'
        };
        
        return productNames[productKey] || productKey;
    },

    getProductIcon(product) {
        const icons = {
            'broilers-dressed': '🐔',
            'broilers-live': '🐓',
            'pork': '🐖',
            'beef': '🐄',
            'chicken-parts': '🍗',
            'goat': '🐐',
            'lamb': '🐑',
            'layers': '🥚',
            'eggs': '🥚',
            'chicks': '🐥',
            'tomatoes': '🍅',
            'peppers': '🫑',
            'cucumbers': '🥒',
            'lettuce': '🥬',
            'carrots': '🥕',
            'potatoes': '🥔',
            'milk': '🥛',
            'cheese': '🧀',
            'yogurt': '🥄',
            'butter': '🧈',
            'honey': '🍯',
            'jam': '🍓',
            'bread': '🍞'
        };
        
        return icons[product] || '📦';
    },

    showNotification(message, type = 'info') {
        if (window.FarmModules && window.FarmModules.notify) {
            window.FarmModules.notify(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    },

    refresh() {
        if (this.initialized) {
            this.renderModule();
        }
    },

    cleanup() {
        this.initialized = false;
        this.element = null;
        this.currentEditingId = null;
        this.pendingProductionSale = null;
    }
};

// Register the module
console.log('✅ Enhanced Sales Records module loaded');

if (window.FarmModules && window.FarmModules.registerModule) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
} else {
    window.FarmModules = window.FarmModules || {};
    window.FarmModules.SalesRecord = SalesRecordModule;
}
