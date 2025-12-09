// modules/sales-record.js - ENHANCED VERSION WITH PROPER MEAT SALES MODAL
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

    checkDependencies() {
        // Check if appData exists
        if (!window.FarmModules || !window.FarmModules.appData) {
            console.error('❌ App data not available');
            return false;
        }
        
        // Initialize data structures if they don't exist
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

    // NEW METHOD: Called from Production module to start a sale
    startSaleFromProduction(productionData) {
        console.log('🔄 Starting sale from production:', productionData);
        
        this.pendingProductionSale = productionData;
        
        // Show the sale modal with production data pre-filled
        this.showSaleModal();
        
        // Pre-fill form based on production data
        this.prefillFromProduction(productionData);
    },

    prefillFromProduction(productionData) {
        if (!productionData) return;
        
        const productSelect = document.getElementById('sale-product');
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        // Find matching product
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
            
            // Set available quantity from production
            const availableQuantity = productionData.quantity || productionData.count || 0;
            const availableWeight = productionData.totalWeight || productionData.weight || 0;
            
            if (meatProducts.includes(productValue)) {
                // For meat products, show available weight and animal count
                document.getElementById('meat-animal-count').value = availableQuantity;
                document.getElementById('meat-weight').value = availableWeight;
            } else {
                // For non-meat products
                document.getElementById('standard-quantity').value = availableQuantity;
            }
            
            // Set reasonable default price
            this.setDefaultPrice(productValue);
        }
        
        // Add note about production source
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
        
        const priceInput = document.getElementById('meat-price');
        const priceStandardInput = document.getElementById('standard-price');
        
        if (defaultPrices[product]) {
            const price = defaultPrices[product];
            if (priceInput) priceInput.value = price;
            if (priceStandardInput) priceStandardInput.value = price;
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
        
        // Trigger Income module update
        if (window.FarmModules.Income) {
            window.FarmModules.Income.updateFromSales();
        }
    },

    renderModule() {
        if (!this.element) return;

        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        
        // Calculate statistics
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const weekSales = this.getSalesForPeriod(7);
        const monthSales = this.getSalesForPeriod(30);
        
        // Calculate meat-specific statistics
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalMeatRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || 0), 0);

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
                                <select id="quick-product" required class="form-input" onchange="window.FarmModules.SalesRecord.handleQuickProductChange()">
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
            <!-- Sales Record Modal (FIXED - MATCHES PRODUCTION MODULE FOR MEAT) -->
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
                                    <select id="sale-product" class="form-input" required onchange="window.FarmModules.SalesRecord.handleProductChange()">
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

                            <!-- MEAT SALES SECTION - MATCHES PRODUCTION MODULE -->
                            <div id="meat-section" style="display: none; margin-bottom: 16px;">
                                <div style="background: #fef3f3; padding: 16px; border-radius: 8px; border: 1px solid #fed7d7; margin-bottom: 16px;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                        <span style="font-size: 20px; color: #dc2626;">🍗</span>
                                        <div style="font-weight: 600; color: #7c2d12;">Meat Sale Details</div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Number of Animals *</label>
                                            <input type="number" id="meat-animal-count" class="form-input" min="1" placeholder="0" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                            <div class="form-hint">Number of birds/carcasses being sold</div>
                                        </div>
                                        <div>
                                            <label class="form-label">Total Weight *</label>
                                            <div style="display: flex; gap: 8px;">
                                                <input type="number" id="meat-weight" class="form-input" min="0.1" step="0.1" placeholder="0.0" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                                <select id="meat-weight-unit" class="form-input" style="min-width: 100px;" onchange="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                                    <option value="kg">kg</option>
                                                    <option value="lbs">lbs</option>
                                                </select>
                                            </div>
                                            <div class="form-hint">Total weight of all animals</div>
                                        </div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
                                        <div>
                                            <label class="form-label">Price per kg *</label>
                                            <div style="display: flex; align-items: center; gap: 4px;">
                                                <span style="color: var(--text-secondary);">$</span>
                                                <input type="number" id="meat-price" class="form-input" step="0.01" min="0" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
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

                            <!-- STANDARD QUANTITY SECTION (for non-meat products) -->
                            <div id="standard-section" style="margin-bottom: 16px;">
                                <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                        <span style="font-size: 20px; color: #0ea5e9;">📦</span>
                                        <div style="font-weight: 600; color: #0369a1;">Standard Product Sale</div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label class="form-label">Quantity *</label>
                                            <input type="number" id="standard-quantity" class="form-input" min="0.01" step="0.01" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                            <div class="form-hint">Amount to sell</div>
                                        </div>
                                        <div>
                                            <label class="form-label">Unit Price *</label>
                                            <div style="display: flex; align-items: center; gap: 4px;">
                                                <span style="color: var(--text-secondary);">$</span>
                                                <input type="number" id="standard-price" class="form-input" step="0.01" min="0" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
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

        // Set today's date
        const todayInput = document.getElementById('sale-date');
        if (todayInput) {
            const today = new Date();
            const timezoneOffset = today.getTimezoneOffset() * 60000;
            const localISOTime = new Date(today - timezoneOffset).toISOString().split('T')[0];
            todayInput.value = localISOTime;
        }

        this.setupEventListeners();
    },

    renderProductionItems() {
        // Check if Production module exists and has data
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
        // Get production module to fetch item details
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

        // Start sale from this production item
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

        // Show most recent sales first
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
                            const paymentClass = sale.paymentStatus === 'paid' ? 'paid' : 
                                                sale.paymentStatus === 'pending' ? 'pending' : 'partial';
                            
                            // Display quantity/weight info
                            let quantityInfo = `${sale.quantity} ${sale.unit}`;
                            if (sale.weight && sale.weight > 0) {
                                quantityInfo = `${sale.animalCount || sale.quantity} animals`;
                                if (sale.weight) {
                                    quantityInfo += ` • ${sale.weight} ${sale.weightUnit || 'kg'}`;
                                }
                            }
                            
                            // Source badge
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
        // Quick sale form
        document.getElementById('quick-sale-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickSale();
        });

        // Modal buttons
        document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('from-production-btn')?.addEventListener('click', () => this.showProductionItems());
        document.getElementById('meat-sales-btn')?.addEventListener('click', () => this.generateMeatSalesReport());
        document.getElementById('daily-report-btn')?.addEventListener('click', () => this.generateDailyReport());
        document.getElementById('view-production-items')?.addEventListener('click', () => this.showProductionItems());
        
        // Sale modal handlers
        document.getElementById('save-sale')?.addEventListener('click', () => this.saveSale());
        document.getElementById('delete-sale')?.addEventListener('click', () => this.deleteSale());
        document.getElementById('cancel-sale')?.addEventListener('click', () => this.hideSaleModal());
        document.getElementById('close-sale-modal')?.addEventListener('click', () => this.hideSaleModal());
        
        // Report modal handlers
        document.getElementById('close-daily-report')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('close-daily-report-btn')?.addEventListener('click', () => this.hideDailyReportModal());
        document.getElementById('print-daily-report')?.addEventListener('click', () => this.printDailyReport());
        
        document.getElementById('close-meat-sales')?.addEventListener('click', () => this.hideMeatSalesModal());
        document.getElementById('close-meat-sales-btn')?.addEventListener('click', () => this.hideMeatSalesModal());
        document.getElementById('print-meat-sales')?.addEventListener('click', () => this.printMeatSalesReport());
        
        // Production items modal
        document.getElementById('close-production-items')?.addEventListener('click', () => this.hideProductionItemsModal());
        document.getElementById('close-production-items-btn')?.addEventListener('click', () => this.hideProductionItemsModal());
        
        // Real-time total calculation
        document.getElementById('standard-quantity')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('standard-price')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('meat-animal-count')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('meat-weight')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('meat-price')?.addEventListener('input', () => this.calculateSaleTotal());
        document.getElementById('meat-weight-unit')?.addEventListener('change', () => this.calculateSaleTotal());

        // Filter
        document.getElementById('period-filter')?.addEventListener('change', (e) => {
            document.getElementById('sales-table').innerHTML = this.renderSalesTable(e.target.value);
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        // Edit/delete sale buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-sale')) {
                const saleId = e.target.closest('.edit-sale').dataset.id;
                this.editSale(saleId);
            }
            if (e.target.closest('.delete-sale')) {
                const saleId = e.target.closest('.delete-sale').dataset.id;
                this.deleteSaleRecord(saleId);
            }
        });
    },

    // PRODUCT HANDLING METHODS - UPDATED
    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const selectedValue = productSelect.value;
        
        // Meat products that require weight
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        const meatSummary = document.getElementById('meat-summary');
        const standardSummary = document.getElementById('standard-summary');
        const meatPriceUnitLabel = document.getElementById('meat-price-unit-label');
        const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
        
        if (meatProducts.includes(selectedValue)) {
            // Show meat section for meat products
            meatSection.style.display = 'block';
            meatSummary.style.display = 'block';
            standardSection.style.display = 'none';
            standardSummary.style.display = 'none';
            
            // Set unit defaults
            document.getElementById('sale-unit').value = 'animals';
            document.getElementById('meat-weight-unit').value = 'kg';
            document.getElementById('meat-animal-count').required = true;
            document.getElementById('meat-weight').required = true;
            
            // Update price unit label
            meatPriceUnitLabel.textContent = 'per kg';
            
            // Set appropriate labels based on product
            const animalLabel = selectedValue === 'chicken-parts' ? 'Number of Packages' : 
                              selectedValue.includes('broilers') ? 'Number of Birds' : 
                              selectedValue === 'pork' ? 'Number of Pigs' :
                              selectedValue === 'beef' ? 'Number of Cattle' :
                              selectedValue === 'goat' ? 'Number of Goats' :
                              selectedValue === 'lamb' ? 'Number of Lambs' : 'Number of Animals';
            
            document.querySelector('label[for="meat-animal-count"]').textContent = animalLabel + ' *';
            
        } else {
            // Hide meat section for non-meat products
            meatSection.style.display = 'none';
            meatSummary.style.display = 'none';
            standardSection.style.display = 'block';
            standardSummary.style.display = 'block';
            
            // Set appropriate unit defaults
            const unitSelect = document.getElementById('sale-unit');
            if (selectedValue === 'eggs') {
                unitSelect.value = 'dozen';
                standardPriceUnitLabel.textContent = 'per dozen';
            } else if (selectedValue === 'milk' || selectedValue === 'cheese' || selectedValue === 'yogurt') {
                unitSelect.value = 'kg';
                standardPriceUnitLabel.textContent = 'per kg';
            } else if (selectedValue === 'broilers-live' || selectedValue === 'layers' || selectedValue === 'chicks') {
                unitSelect.value = 'birds';
                standardPriceUnitLabel.textContent = 'per bird';
            } else {
                unitSelect.value = 'kg';
                standardPriceUnitLabel.textContent = 'per kg';
            }
            
            // Make meat fields optional
            document.getElementById('meat-animal-count').required = false;
            document.getElementById('meat-weight').required = false;
        }
        
        this.calculateSaleTotal();
    },

    handleQuickProductChange() {
        const productSelect = document.getElementById('quick-product');
        const selectedValue = productSelect.value;
        const unitSelect = document.getElementById('quick-unit');
        
        // Set appropriate units based on product
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
            // For meat products: price × weight
            const animalCount = parseFloat(document.getElementById('meat-animal-count').value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight').value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit').value;
            const pricePerKg = parseFloat(document.getElementById('meat-price').value) || 0;
            
            // Convert to kg for calculation if needed
            let weightInKg = weight;
            if (weightUnit === 'lbs') {
                weightInKg = weight * 0.453592; // Convert lbs to kg
            }
            
            total = weightInKg * pricePerKg;
            
            // Update meat summary
            const meatSummary = document.getElementById('meat-summary-info');
            const avgWeightElement = document.getElementById('meat-avg-weight');
            const avgValueElement = document.getElementById('meat-avg-value');
            
            if (meatSummary && avgWeightElement && avgValueElement) {
                if (animalCount > 0 && weightInKg > 0) {
                    const avgWeight = weightInKg / animalCount;
                    const avgValue = total / animalCount;
                    
                    meatSummary.textContent = `${animalCount} animals • ${weight} ${weightUnit} total • ${this.formatCurrency(avgValue)}/animal average`;
                    avgWeightElement.textContent = `${avgWeight.toFixed(2)} kg`;
                    avgValueElement.textContent = `${this.formatCurrency(avgValue)}`;
                } else {
                    meatSummary.textContent = '0 animals • 0 kg total • $0.00/animal average';
                    avgWeightElement.textContent = '0.00 kg';
                    avgValueElement.textContent = '$0.00';
                }
            }
        } else {
            // For non-meat products: price × quantity
            const quantity = parseFloat(document.getElementById('standard-quantity').value) || 0;
            const price = parseFloat(document.getElementById('standard-price').value) || 0;
            total = quantity * price;
            
            // Update standard summary
            const standardSummary = document.getElementById('standard-summary-info');
            if (standardSummary) {
                standardSummary.textContent = `${quantity} units at ${this.formatCurrency(price)}/unit`;
            }
        }
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    // MODAL CONTROL METHODS
    showSaleModal() {
        this.hideAllModals();
        document.getElementById('sale-modal').classList.remove('hidden');
        
        // Set today's date
        const today = new Date();
        const timezoneOffset = today.getTimezoneOffset() * 60000;
        const localISOTime = new Date(today - timezoneOffset).toISOString().split('T')[0];
        document.getElementById('sale-date').value = localISOTime;
        
        // Reset form
        document.getElementById('sale-form').reset();
        document.getElementById('sale-modal-title').textContent = 'Record Sale';
        document.getElementById('delete-sale').style.display = 'none';
        document.getElementById('production-source-notice').style.display = 'none';
        
        // Check if we have a pending production sale
        if (this.pendingProductionSale) {
            this.prefillFromProduction(this.pendingProductionSale);
            this.showProductionSourceNotice();
        } else {
            this.pendingProductionSale = null;
        }
        
        // Initialize product handling
        this.handleProductChange();
    },

    showProductionSourceNotice() {
        if (!this.pendingProductionSale) return;
        
        const noticeElement = document.getElementById('production-source-notice');
        const infoElement = document.getElementById('production-source-info');
        
        noticeElement.style.display = 'block';
        infoElement.textContent = `${this.pendingProductionSale.type || this.pendingProductionSale.product} • ${this.pendingProductionSale.quantity || this.pendingProductionSale.count || 0} units`;
    },

    showProductionItems() {
        this.hideAllModals();
        
        // Get production items from Production module
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
        
        document.getElementById('production-items-content').innerHTML = content;
        document.getElementById('production-items-modal').classList.remove('hidden');
    },

    hideSaleModal() {
        document.getElementById('sale-modal').classList.add('hidden');
        this.pendingProductionSale = null; // Clear pending production sale
    },

    hideProductionItemsModal() {
        document.getElementById('production-items-modal').classList.add('hidden');
    },

    showDailyReportModal() {
        this.hideAllModals();
        document.getElementById('daily-report-modal').classList.remove('hidden');
    },

    hideDailyReportModal() {
        document.getElementById('daily-report-modal').classList.add('hidden');
    },

    showMeatSalesModal() {
        this.hideAllModals();
        document.getElementById('meat-sales-modal').classList.remove('hidden');
    },

    hideMeatSalesModal() {
        document.getElementById('meat-sales-modal').classList.add('hidden');
    },

    hideAllModals() {
        this.hideSaleModal();
        this.hideDailyReportModal();
        this.hideMeatSalesModal();
        this.hideProductionItemsModal();
    },

    // SALES CRUD METHODS
    validateSaleData(saleData) {
        const errors = [];
        
        if (!saleData.date) errors.push('Date is required');
        if (!saleData.product) errors.push('Product is required');
        if (saleData.unitPrice <= 0) errors.push('Price must be greater than 0');
        if (!saleData.paymentMethod) errors.push('Payment method is required');
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(saleData.product)) {
            if (!saleData.weight || saleData.weight <= 0) errors.push('Weight must be greater than 0 for meat products');
            if (!saleData.animalCount || saleData.animalCount <= 0) errors.push('Number of animals must be greater than 0');
        } else {
            if (!saleData.quantity || saleData.quantity <= 0) errors.push('Quantity must be greater than 0');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    handleQuickSale() {
        const product = document.getElementById('quick-product').value;
        const quantity = parseFloat(document.getElementById('quick-quantity').value);
        const unit = document.getElementById('quick-unit').value;
        const price = parseFloat(document.getElementById('quick-price').value);

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Get today's date with timezone fix
        const today = new Date();
        const timezoneOffset = today.getTimezoneOffset() * 60000;
        const localISOTime = new Date(today - timezoneOffset).toISOString().split('T')[0];

        const saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            quantity: quantity,
            unit: unit,
            unitPrice: price,
            totalAmount: quantity * price,
            date: localISOTime,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            customer: 'Walk-in'
        };

        this.addSale(saleData);
        
        // Reset form
        document.getElementById('quick-sale-form').reset();
        this.showNotification('Sale recorded successfully!', 'success');
    },

    saveSale() {
        const form = document.getElementById('sale-form');
        if (!form) {
            console.error('❌ Sale form not found');
            return;
        }

        const saleId = document.getElementById('sale-id').value;
        const date = document.getElementById('sale-date').value;
        const customer = document.getElementById('sale-customer').value;
        const product = document.getElementById('sale-product').value;
        const unit = document.getElementById('sale-unit').value;
        const paymentMethod = document.getElementById('sale-payment').value;
        const paymentStatus = document.getElementById('sale-status').value;
        const notes = document.getElementById('sale-notes').value;

        // Meat products that require weight
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const isMeatProduct = meatProducts.includes(product);

        let saleData;
        
        if (isMeatProduct) {
            // For meat products: use animal count and weight
            const animalCount = parseInt(document.getElementById('meat-animal-count').value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight').value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit').value;
            const unitPrice = parseFloat(document.getElementById('meat-price').value) || 0;
            
            // Convert to kg for calculation
            let weightInKg = weight;
            if (weightUnit === 'lbs') {
                weightInKg = weight * 0.453592;
            }
            
            const totalAmount = weightInKg * unitPrice;
            
            saleData = {
                id: saleId || 'SALE-' + Date.now().toString().slice(-6),
                date: date,
                customer: customer || 'Walk-in',
                product: product,
                unit: unit,
                quantity: animalCount, // Store animal count as quantity
                unitPrice: unitPrice,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                notes: notes,
                weight: weight,
                weightUnit: weightUnit,
                animalCount: animalCount,
                priceUnit: 'per-kg'
            };
        } else {
            // For non-meat products: use standard quantity
            const quantity = parseFloat(document.getElementById('standard-quantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('standard-price').value) || 0;
            const totalAmount = quantity * unitPrice;
            
            saleData = {
                id: saleId || 'SALE-' + Date.now().toString().slice(-6),
                date: date,
                customer: customer || 'Walk-in',
                product: product,
                unit: unit,
                quantity: quantity,
                unitPrice: unitPrice,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                notes: notes
            };
        }

        // Add production source if applicable
        if (this.pendingProductionSale) {
            saleData.productionSource = true;
            saleData.productionSourceId = this.pendingProductionSale.id;
            
            // Update production item to mark as sold
            this.updateProductionAfterSale(this.pendingProductionSale.id, saleData);
        }

        // Validate data
        const validation = this.validateSaleData(saleData);
        if (!validation.isValid) {
            this.showNotification(validation.errors.join(', '), 'error');
            return;
        }

        if (saleId) {
            this.updateSale(saleId, saleData);
        } else {
            this.addSale(saleData);
        }

        this.hideSaleModal();
    },

    updateProductionAfterSale(productionId, saleData) {
        // Call Production module to update the production item
        const productionModule = window.FarmModules.Production;
        if (productionModule && productionModule.markAsSold) {
            productionModule.markAsSold(productionId, {
                saleId: saleData.id,
                saleDate: saleData.date,
                weightSold: saleData.weight,
                animalsSold: saleData.animalCount,
                revenue: saleData.totalAmount
            });
        }
    },

    addSale(saleData) {
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }

        window.FarmModules.appData.sales.push(saleData);
        this.saveData();
        this.updateSummary();
        this.updateSalesTable();
        
        // Record revenue in Income module
        this.recordRevenueInIncome(saleData);
        
        this.showNotification('Sale recorded successfully!', 'success');
    },

    recordRevenueInIncome(saleData) {
    // Check if Income module exists - try different possible names
    let incomeModule = window.FarmModules.Income || 
                      window.FarmModules.IncomeExpenses || 
                      window.FarmModules['income-expenses'];
    
    if (!incomeModule) {
        console.log('❌ Income module not available for revenue tracking');
        console.log('Available modules:', Object.keys(window.FarmModules || {}));
        return;
    }

    // Check for the method with different possible names
    const addRevenueMethod = incomeModule.addRevenueFromSale || 
                            incomeModule.addIncomeFromSale ||
                            incomeModule.addRevenue;
    
    if (!addRevenueMethod) {
        console.log('❌ Income module does not have add revenue method');
        console.log('Available methods:', Object.keys(incomeModule));
        return;
    }

    // Create income record from sale
    const incomeRecord = {
        id: 'INC-' + Date.now().toString().slice(-6),
        date: saleData.date,
        source: 'sales',
        category: this.getIncomeCategory(saleData.product),
        description: `Sale of ${this.formatProductName(saleData.product)} to ${saleData.customer || 'Walk-in'}`,
        amount: saleData.totalAmount,
        paymentMethod: saleData.paymentMethod,
        paymentStatus: saleData.paymentStatus,
        reference: saleData.id,
        notes: saleData.notes
    };

    // Add meat-specific info to income record
    if (saleData.weight && saleData.weight > 0) {
        incomeRecord.weight = saleData.weight;
        incomeRecord.weightUnit = saleData.weightUnit;
        incomeRecord.animalCount = saleData.animalCount;
    }

    // Call the method
    addRevenueMethod.call(incomeModule, incomeRecord);
    console.log('✅ Revenue recorded in Income module:', incomeRecord);
},
    
    editSale(saleId) {
        const sales = window.FarmModules.appData.sales || [];
        const sale = sales.find(s => s.id === saleId);
        
        if (!sale) {
            console.error('❌ Sale not found:', saleId);
            return;
        }

        // Populate form fields
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = sale.date;
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-payment').value = sale.paymentMethod;
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        // Populate meat-specific fields or standard fields
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(sale.product)) {
            document.getElementById('meat-animal-count').value = sale.animalCount || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice;
        } else {
            document.getElementById('standard-quantity').value = sale.quantity;
            document.getElementById('standard-price').value = sale.unitPrice;
        }
        
        document.getElementById('delete-sale').style.display = 'block';
        document.getElementById('sale-modal-title').textContent = 'Edit Sale';
        
        // Initialize product handling
        this.handleProductChange();
        this.calculateSaleTotal();
        this.showSaleModal();
    },

    updateSale(saleId, saleData) {
        const sales = window.FarmModules.appData.sales || [];
        const saleIndex = sales.findIndex(s => s.id === saleId);
        
        if (saleIndex !== -1) {
            window.FarmModules.appData.sales[saleIndex] = {
                ...sales[saleIndex],
                ...saleData
            };
            
            this.saveData();
            this.updateSummary();
            this.updateSalesTable();
            
            // Update income record if needed
            this.updateIncomeRecord(saleId, saleData);
            
            this.showNotification('Sale updated successfully!', 'success');
        }
    },

    updateIncomeRecord(saleId, saleData) {
        const incomeModule = window.FarmModules.Income;
        if (incomeModule && incomeModule.updateRevenueFromSale) {
            incomeModule.updateRevenueFromSale(saleId, {
                amount: saleData.totalAmount,
                date: saleData.date,
                description: `Sale of ${this.formatProductName(saleData.product)} to ${saleData.customer || 'Walk-in'}`,
                paymentStatus: saleData.paymentStatus
            });
        }
    },

    deleteSale() {
        const saleId = document.getElementById('sale-id').value;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideSaleModal();
        }
    },

    deleteSaleRecord(saleId) {
        if (confirm('Are you sure you want to delete this sale?')) {
            // Remove from sales data
            window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
            
            // Remove from income records
            this.removeIncomeRecord(saleId);
            
            this.saveData();
            this.updateSummary();
            this.updateSalesTable();
            this.showNotification('Sale deleted successfully', 'success');
        }
    },

    removeIncomeRecord(saleId) {
        const incomeModule = window.FarmModules.Income;
        if (incomeModule && incomeModule.removeRevenueFromSale) {
            incomeModule.removeRevenueFromSale(saleId);
        }
    },

    // REPORT METHODS
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        const todaySales = sales.filter(sale => sale.date === today);
        
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        // Calculate meat sales separately
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = todaySales.filter(sale => meatProducts.includes(sale.product));
        const meatRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalMeatAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || 0), 0);
        
        let report = '<div class="report-content">';
        report += `<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">📊 Daily Sales Report - ${today}</h4>`;
        
        if (todaySales.length === 0) {
            report += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h5 style="color: #374151; margin-bottom: 8px;">No sales today</h5>
                <p style="color: var(--text-secondary);">No sales recorded for today</p>
            </div>`;
        } else {
            // Summary
            report += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 TODAY'S SUMMARY:</h5>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Sales</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${todaySales.length}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Meat Revenue</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(meatRevenue)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Meat Animals</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalMeatAnimals}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Items Sold</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalItems}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">From Production</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${todaySales.filter(s => s.productionSource).length}</div>
                    </div>
                </div>
                <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center; margin-top: 12px;">
                    <div style="font-size: 12px; color: var(--text-secondary);">Total Meat Weight</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalMeatWeight.toFixed(2)} kg</div>
                </div>
            </div>`;
            
            // Sales breakdown
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">🧾 TODAY'S SALES:</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            todaySales.forEach(sale => {
                const isMeat = meatProducts.includes(sale.product);
                const isFromProduction = sale.productionSource;
                const meatBadge = isMeat ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 6px;">MEAT</span>' : '';
                const prodBadge = isFromProduction ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 6px;">PROD</span>' : '';
                
                let quantityInfo = `${sale.quantity} ${sale.unit}`;
                if (isMeat && sale.weight) {
                    quantityInfo = `${sale.animalCount || sale.quantity} animals • ${sale.weight} ${sale.weightUnit || 'kg'}`;
                }
                
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${isMeat ? '#dc2626' : 'var(--primary-color)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatProductName(sale.product)} ${meatBadge}${prodBadge}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Customer: ${sale.customer || 'Walk-in'} • ${sale.paymentMethod}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(sale.totalAmount)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${quantityInfo}
                                ${sale.priceUnit === 'per-kg' ? '/kg' : sale.priceUnit === 'per-lb' ? '/lb' : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
            });
            report += '</div></div>';
            
            // Payment methods
            const paymentMethods = {};
            todaySales.forEach(sale => {
                if (!paymentMethods[sale.paymentMethod]) {
                    paymentMethods[sale.paymentMethod] = 0;
                }
                paymentMethods[sale.paymentMethod] += sale.totalAmount;
            });
            
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">💳 PAYMENT METHODS:</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;
            Object.entries(paymentMethods).forEach(([method, amount]) => {
                const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                report += `<div style="padding: 12px; background: var(--glass-bg); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: var(--text-primary);">${method.toUpperCase()}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(amount)}</span>
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
        }
        
        report += '</div>';

        document.getElementById('daily-report-content').innerHTML = report;
        this.showDailyReportModal();
    },

    generateMeatSalesReport() {
        const sales = window.FarmModules.appData.sales || [];
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        
        // Group by product
        const productStats = {};
        meatSales.forEach(sale => {
            const productName = this.formatProductName(sale.product);
            if (!productStats[productName]) {
                productStats[productName] = {
                    revenue: 0,
                    weight: 0,
                    salesCount: 0,
                    animalCount: 0,
                    avgPricePerKg: 0,
                    avgWeightPerAnimal: 0,
                    avgValuePerAnimal: 0,
                    fromProduction: 0
                };
            }
            productStats[productName].revenue += sale.totalAmount;
            productStats[productName].weight += sale.weight || 0;
            productStats[productName].salesCount += 1;
            productStats[productName].animalCount += sale.animalCount || 0;
            if (sale.productionSource) productStats[productName].fromProduction += 1;
        });
        
        // Calculate averages
        Object.keys(productStats).forEach(product => {
            const stats = productStats[product];
            stats.avgPricePerKg = stats.weight > 0 ? stats.revenue / stats.weight : 0;
            stats.avgWeightPerAnimal = stats.animalCount > 0 ? stats.weight / stats.animalCount : 0;
            stats.avgValuePerAnimal = stats.animalCount > 0 ? stats.revenue / stats.animalCount : 0;
        });
        
        // Sort by revenue
        const sortedProducts = Object.entries(productStats)
            .sort((a, b) => b[1].revenue - a[1].revenue);
        
        let report = '<div class="report-content">';
        report += '<h4 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;">🍗 Meat Sales Report</h4>';
        
        if (sortedProducts.length === 0) {
            report += `<div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🍗</div>
                <h5 style="color: #374151; margin-bottom: 8px;">No meat sales recorded</h5>
                <p style="color: var(--text-secondary);">Record meat sales to see performance data</p>
            </div>`;
        } else {
            // Summary
            const totalMeatRevenue = sortedProducts.reduce((sum, [, stats]) => sum + stats.revenue, 0);
            const totalMeatWeight = sortedProducts.reduce((sum, [, stats]) => sum + stats.weight, 0);
            const totalAnimals = sortedProducts.reduce((sum, [, stats]) => sum + stats.animalCount, 0);
            const fromProductionCount = sortedProducts.reduce((sum, [, stats]) => sum + stats.fromProduction, 0);
            const avgPricePerKg = totalMeatWeight > 0 ? totalMeatRevenue / totalMeatWeight : 0;
            const avgWeightPerAnimal = totalAnimals > 0 ? totalMeatWeight / totalAnimals : 0;
            const avgValuePerAnimal = totalAnimals > 0 ? totalMeatRevenue / totalAnimals : 0;
            
            report += `<div style="margin-bottom: 24px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📊 MEAT SALES SUMMARY:</h5>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Revenue</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalMeatRevenue)}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Weight Sold</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalMeatWeight.toFixed(2)} kg</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Animals</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${totalAnimals}</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">From Production</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${fromProductionCount}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Average Price/kg</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--primary-color);">${this.formatCurrency(avgPricePerKg)}/kg</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Avg Weight/Animal</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${avgWeightPerAnimal.toFixed(2)} kg</div>
                    </div>
                    <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-secondary);">Avg Value/Animal</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--primary-color);">${this.formatCurrency(avgValuePerAnimal)}</div>
                    </div>
                </div>
            </div>`;
            
            // Product breakdown
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">📈 PRODUCT PERFORMANCE:</h5>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Product</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Revenue</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Animals</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Weight</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Avg/kg</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-secondary);">Avg/Animal</th>
                            </tr>
                        </thead>
                        <tbody>`;
            
            sortedProducts.forEach(([productName, stats]) => {
                report += `
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 12px 8px; font-weight: 500; color: var(--text-primary);">${productName}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(stats.revenue)}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary);">${stats.animalCount}</td>
                        <td style="padding: 12px 8px; color: var(--text-primary);">${stats.weight.toFixed(2)} kg</td>
                        <td style="padding: 12px 8px; color: var(--primary-color); font-weight: 600;">${this.formatCurrency(stats.avgPricePerKg)}/kg</td>
                        <td style="padding: 12px 8px; color: var(--primary-color); font-weight: 600;">${this.formatCurrency(stats.avgValuePerAnimal)}</td>
                    </tr>
                `;
            });
            
            report += `</tbody>
                    </table>
                </div>
            </div>`;
            
            // Weight distribution chart
            report += `<div style="margin-bottom: 20px;">
                <h5 style="color: var(--text-primary); margin-bottom: 12px;">⚖️ WEIGHT DISTRIBUTION:</h5>
                <div style="display: flex; flex-direction: column; gap: 12px;">`;
            
            sortedProducts.forEach(([productName, stats]) => {
                const weightPercentage = totalMeatWeight > 0 ? Math.round((stats.weight / totalMeatWeight) * 100) : 0;
                report += `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${productName}</span>
                            <span style="color: var(--text-secondary); font-size: 14px;">${stats.weight.toFixed(2)} kg (${weightPercentage}%)</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex-grow: 1; height: 12px; background: var(--glass-border); border-radius: 6px; overflow: hidden;">
                                <div style="width: ${weightPercentage}%; height: 100%; background: #dc2626; border-radius: 6px;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            report += `</div>
            </div>`;
        }
        
        report += '</div>';

        document.getElementById('meat-sales-content').innerHTML = report;
        this.showMeatSalesModal();
    },

    // UTILITY METHODS
    getProductIcon(product) {
        const icons = {
            'broilers-dressed': '🍗',
            'broilers-live': '🐔',
            'pork': '🐖',
            'beef': '🐄',
            'chicken-parts': '🍗',
            'goat': '🐐',
            'lamb': '🐑',
            'layers': '🐓',
            'chicks': '🐣',
            'eggs': '🥚',
            'tomatoes': '🍅',
            'peppers': '🫑',
            'cucumbers': '🥒',
            'lettuce': '🥬',
            'carrots': '🥕',
            'potatoes': '🥔',
            'milk': '🥛',
            'cheese': '🧀',
            'yogurt': '🥛',
            'butter': '🧈',
            'honey': '🍯',
            'jam': '🍓',
            'bread': '🍞'
        };
        return icons[product] || '📦';
    },

    formatProductName(product) {
        const productNames = {
            'broilers-dressed': 'Broilers (Dressed)',
            'broilers-live': 'Broilers (Live)',
            'layers': 'Layers',
            'chicks': 'Baby Chicks',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'onions': 'Onions',
            'cabbage': 'Cabbage',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'yogurt': 'Yogurt',
            'butter': 'Butter',
            'honey': 'Honey',
            'jam': 'Jam/Preserves',
            'bread': 'Bread',
            'other': 'Other'
        };
        return productNames[product] || product;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    updateSummary() {
        const today = new Date().toISOString().split('T')[0];
        const sales = window.FarmModules.appData.sales || [];
        
        const todaySales = sales
            .filter(sale => sale.date === today)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const weekSales = this.getSalesForPeriod(7);
        const monthSales = this.getSalesForPeriod(30);
        
        // Calculate meat-specific statistics
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || 0), 0);

        this.updateElement('today-sales', this.formatCurrency(todaySales));
        this.updateElement('total-meat-weight', totalMeatWeight.toFixed(2));
        this.updateElement('total-animals', totalAnimalsSold);
        this.updateElement('total-sales', sales.length);
    },

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    },

    updateSalesTable() {
        const periodFilter = document.getElementById('period-filter');
        const period = periodFilter ? periodFilter.value : 'today';
        document.getElementById('sales-table').innerHTML = this.renderSalesTable(period);
    },

    getSalesForPeriod(days) {
        const sales = window.FarmModules.appData.sales || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return sales
            .filter(sale => new Date(sale.date) >= cutoffDate)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
    },

    exportSales() {
        const sales = window.FarmModules.appData.sales || [];
        const csv = this.convertToCSV(sales);
        const blob = new Blob([csv], { type: 'text/csv' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Sales exported successfully!', 'success');
    },

    convertToCSV(sales) {
        const headers = ['Date', 'Product', 'Customer', 'Animals', 'Unit', 'Weight', 'Weight Unit', 'Unit Price', 'Price Unit', 'Total', 'Payment Method', 'Payment Status', 'Production Source', 'Notes'];
        const rows = sales.map(sale => [
            sale.date,
            this.formatProductName(sale.product),
            sale.customer || 'Walk-in',
            sale.animalCount || sale.quantity,
            sale.unit,
            sale.weight || '',
            sale.weightUnit || '',
            sale.unitPrice,
            sale.priceUnit || 'per-unit',
            sale.totalAmount,
            sale.paymentMethod,
            sale.paymentStatus || 'paid',
            sale.productionSource ? 'Yes' : 'No',
            sale.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    showNotification(message, type = 'success') {
        if (window.FarmModules && window.FarmModules.notify) {
            window.FarmModules.notify(message, type);
            return;
        }

        console.log(`${type}: ${message}`);
        alert(message);
    },

    printDailyReport() {
        this.printReport('daily-report-content', 'daily-report-title');
    },

    printMeatSalesReport() {
        this.printReport('meat-sales-content', 'meat-sales-title');
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
                            grid-template-columns: repeat(2, 1fr); 
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

    // Cleanup method for module unloading
    cleanup() {
        console.log('🧹 Cleaning up Sales Records...');
        this.initialized = false;
        this.pendingProductionSale = null;
    }
};

// PROPER REGISTRATION WITH FarmModules FRAMEWORK
console.log('✅ Enhanced Sales Records module loaded successfully!');

// Check if framework exists and register the module
if (window.FarmModules && window.FarmModules.registerModule) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
    console.log('📝 Sales Record module registered with FarmModules framework');
} else {
    console.warn('⚠️ FarmModules framework not available, registering globally');
    window.FarmModules = window.FarmModules || {};
    window.FarmModules.SalesRecord = SalesRecordModule;
    
    // Also register it in the modules object if it exists
    if (window.FarmModules.modules) {
        window.FarmModules.modules['sales-record'] = SalesRecordModule;
    }
}

// Export for module loading
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SalesRecordModule;
    }
} catch (e) {
    // Not in Node.js environment, ignore
}
