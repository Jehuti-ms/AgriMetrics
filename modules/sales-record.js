// modules/sales-record.js - ENHANCED VERSION WITH PRODUCTION INTEGRATION AND WEIGHT TRACKING
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

    // ... [Previous methods remain the same until the renderModule method] ...

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
            <!-- Sales Record Modal (FIXED WITH BOTH QUANTITY AND WEIGHT) -->
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

                            <!-- Meat Sales Section (with BOTH quantity and weight) -->
                            <div id="meat-section" style="display: none; margin-bottom: 16px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                                    <div>
                                        <label class="form-label">Number of Animals *</label>
                                        <input type="number" id="sale-animal-count" class="form-input" min="1" placeholder="0" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                    </div>
                                    <div>
                                        <label class="form-label">Total Weight *</label>
                                        <div style="display: flex; gap: 8px;">
                                            <input type="number" id="sale-weight" class="form-input" min="0.1" step="0.1" placeholder="0.0" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                            <select id="sale-weight-unit" class="form-input" style="min-width: 100px;" onchange="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                                <option value="kg">kg</option>
                                                <option value="lbs">lbs</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label class="form-label">Price per kg *</label>
                                        <div style="display: flex; align-items: center; gap: 4px;">
                                            <span style="color: var(--text-secondary);">$</span>
                                            <input type="number" id="sale-price" class="form-input" step="0.01" min="0" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                            <span id="price-unit-label" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap;">per kg</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="form-label">Average Weight per Animal</label>
                                        <input type="number" id="sale-avg-weight" class="form-input" placeholder="Auto-calculated" readonly style="background-color: #f3f4f6;">
                                    </div>
                                </div>
                                <div class="form-hint">For meat sales: Enter number of animals and total weight. Price is calculated based on weight.</div>
                            </div>

                            <!-- Standard Quantity Section (for non-meat products) -->
                            <div id="standard-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity *</label>
                                    <input type="number" id="sale-quantity" class="form-input" min="0.01" step="0.01" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                </div>
                                <div>
                                    <label class="form-label">Unit Price ($) *</label>
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <span style="color: var(--text-secondary);">$</span>
                                        <input type="number" id="sale-price-standard" class="form-input" step="0.01" min="0" required placeholder="0.00" oninput="window.FarmModules.SalesRecord.calculateSaleTotal()">
                                        <span id="standard-price-unit-label" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap;">per unit</span>
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
                                <div id="meat-details" style="display: none; text-align: center; margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                                    <div id="weight-info">0 kg total weight</div>
                                    <div id="avg-weight-info" style="font-size: 12px; margin-top: 4px;">Average: 0 kg per animal</div>
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

    // ... [Previous methods remain the same until handleProductChange] ...

    // PRODUCT HANDLING METHODS - FIXED
    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        const selectedValue = productSelect.value;
        
        // Meat products that require weight
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        const meatDetails = document.getElementById('meat-details');
        const priceUnitLabel = document.getElementById('price-unit-label');
        const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
        
        if (meatProducts.includes(selectedValue)) {
            // Show meat section for meat products (with BOTH quantity and weight)
            meatSection.style.display = 'block';
            meatDetails.style.display = 'block';
            standardSection.style.display = 'none';
            
            // Set unit defaults
            document.getElementById('sale-unit').value = 'animals';
            document.getElementById('sale-weight-unit').value = 'kg';
            document.getElementById('sale-animal-count').required = true;
            document.getElementById('sale-weight').required = true;
            
            // Update price unit label
            priceUnitLabel.textContent = 'per kg';
            
        } else {
            // Hide meat section for non-meat products
            meatSection.style.display = 'none';
            meatDetails.style.display = 'none';
            standardSection.style.display = 'grid';
            
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
            document.getElementById('sale-animal-count').required = false;
            document.getElementById('sale-weight').required = false;
        }
        
        this.calculateSaleTotal();
    },

    calculateSaleTotal() {
        const product = document.getElementById('sale-product')?.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        let total = 0;
        
        if (meatProducts.includes(product)) {
            // For meat products: price × weight
            const weight = parseFloat(document.getElementById('sale-weight').value) || 0;
            const weightUnit = document.getElementById('sale-weight-unit').value;
            const animalCount = parseFloat(document.getElementById('sale-animal-count').value) || 0;
            const price = parseFloat(document.getElementById('sale-price').value) || 0;
            
            // Convert to kg for calculation if needed
            let weightInKg = weight;
            if (weightUnit === 'lbs') {
                weightInKg = weight * 0.453592; // Convert lbs to kg
            }
            
            total = weightInKg * price;
            
            // Update weight info and calculate average
            const weightInfo = document.getElementById('weight-info');
            const avgWeightInfo = document.getElementById('avg-weight-info');
            const avgWeightInput = document.getElementById('sale-avg-weight');
            
            if (weightInfo && avgWeightInfo && avgWeightInput) {
                let infoText = `${weight} ${weightUnit} total weight`;
                if (animalCount > 0) {
                    const avgWeight = weightInKg / animalCount;
                    infoText += ` (${animalCount} animals)`;
                    avgWeightInfo.textContent = `Average: ${avgWeight.toFixed(2)} kg per animal`;
                    avgWeightInput.value = avgWeight.toFixed(2);
                } else {
                    avgWeightInfo.textContent = '';
                    avgWeightInput.value = '';
                }
                weightInfo.textContent = infoText;
            }
        } else {
            // For non-meat products: price × quantity
            const quantity = parseFloat(document.getElementById('sale-quantity').value) || 0;
            const price = parseFloat(document.getElementById('sale-price-standard').value) || 0;
            total = quantity * price;
        }
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    },

    // ... [Previous methods remain the same until saveSale method] ...

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
            const animalCount = parseInt(document.getElementById('sale-animal-count').value) || 0;
            const weight = parseFloat(document.getElementById('sale-weight').value) || 0;
            const weightUnit = document.getElementById('sale-weight-unit').value;
            const unitPrice = parseFloat(document.getElementById('sale-price').value) || 0;
            
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
            const quantity = parseFloat(document.getElementById('sale-quantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('sale-price-standard').value) || 0;
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
            document.getElementById('sale-animal-count').value = sale.animalCount || '';
            document.getElementById('sale-weight').value = sale.weight || '';
            document.getElementById('sale-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('sale-price').value = sale.unitPrice;
            
            // Calculate and set average weight
            if (sale.animalCount && sale.animalCount > 0 && sale.weight) {
                let weightInKg = sale.weight;
                if (sale.weightUnit === 'lbs') {
                    weightInKg = sale.weight * 0.453592;
                }
                const avgWeight = weightInKg / sale.animalCount;
                document.getElementById('sale-avg-weight').value = avgWeight.toFixed(2);
            }
        } else {
            document.getElementById('sale-quantity').value = sale.quantity;
            document.getElementById('sale-price-standard').value = sale.unitPrice;
        }
        
        document.getElementById('delete-sale').style.display = 'block';
        document.getElementById('sale-modal-title').textContent = 'Edit Sale';
        
        // Initialize product handling
        this.handleProductChange();
        this.calculateSaleTotal();
        this.showSaleModal();
    },

    // ... [Rest of the methods remain the same] ...

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
        const headers = ['Date', 'Product', 'Customer', 'Quantity', 'Unit', 'Weight', 'Weight Unit', 'Animal Count', 'Unit Price', 'Price Unit', 'Total', 'Payment Method', 'Payment Status', 'Production Source', 'Notes'];
        const rows = sales.map(sale => [
            sale.date,
            this.formatProductName(sale.product),
            sale.customer || 'Walk-in',
            sale.quantity,
            sale.unit,
            sale.weight || '',
            sale.weightUnit || '',
            sale.animalCount || '',
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
