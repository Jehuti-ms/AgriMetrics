// modules/sales-record.js - COMPLETE FIXED VERSION WITH ANIMAL SALES MODAL
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,
    
    // Animal sales tracking
    animalSales: {
        cows: 0,
        sheep: 0,
        goats: 0,
        pigs: 0,
        chickens: 0
    },

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
        
        // Load animal sales data
        this.loadAnimalSalesData();
        
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
        if (!window.FarmModules || !window.FarmModules.appData) {
            console.error('❌ App data not available');
            return false;
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        return true;
    },

    loadAnimalSalesData() {
        const savedData = localStorage.getItem('farm-animal-sales');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.animalSales = {
                    cows: data.cows || 0,
                    sheep: data.sheep || 0,
                    goats: data.goats || 0,
                    pigs: data.pigs || 0,
                    chickens: data.chickens || 0
                };
                console.log('🐄 Loaded animal sales data:', this.animalSales);
            } catch (e) {
                console.error('Error parsing animal sales data:', e);
            }
        }
    },

    saveAnimalSalesData() {
        localStorage.setItem('farm-animal-sales', JSON.stringify(this.animalSales));
    },

    getCurrentDate() {
        // FIXED: Proper timezone handling
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - timezoneOffset).toISOString().split('T')[0];
        return localISOTime;
    },

    getCurrentDateTime() {
        // FIXED: For timestamps
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localTime = new Date(now - timezoneOffset);
        return localTime.toISOString();
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

        const today = this.getCurrentDate();
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
                        <button class="btn-secondary" id="open-animal-sales-counter">
                            🐄 Animal Sales Counter
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
                    <button class="quick-action-btn" id="animal-counter-btn">
                        <div style="font-size: 32px;">🐄</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Animal Counter</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Track individual animal sales</span>
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
            <!-- ANIMAL SALES COUNTER MODAL -->
            <div id="animal-sales-modal" class="popout-modal hidden">
                <div class="popout-modal-content" style="max-width: 700px;">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">Animal Sales Counter 🐄</h3>
                        <button class="popout-modal-close" id="close-animal-sales-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <!-- Running Totals Display -->
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #4CAF50;">
                            <h4 style="margin: 0 0 15px 0; color: #2c3e50; text-align: center;">📊 Current Totals</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Cows</div>
                                    <div id="cow-total" style="font-size: 24px; font-weight: bold; color: #2c3e50;">${this.animalSales.cows}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Sheep</div>
                                    <div id="sheep-total" style="font-size: 24px; font-weight: bold; color: #2c3e50;">${this.animalSales.sheep}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Goats</div>
                                    <div id="goat-total" style="font-size: 24px; font-weight: bold; color: #2c3e50;">${this.animalSales.goats}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Pigs</div>
                                    <div id="pig-total" style="font-size: 24px; font-weight: bold; color: #2c3e50;">${this.animalSales.pigs}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Chickens</div>
                                    <div id="chicken-total" style="font-size: 24px; font-weight: bold; color: #2c3e50;">${this.animalSales.chickens}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">TOTAL</div>
                                    <div id="animal-grand-total" style="font-size: 24px; font-weight: bold; color: #4CAF50;">
                                        ${this.animalSales.cows + this.animalSales.sheep + this.animalSales.goats + this.animalSales.pigs + this.animalSales.chickens}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Add Animals Form -->
                        <h4 style="margin: 0 0 15px 0; color: #2c3e50;">➕ Add Animals Sold</h4>
                        <div id="animal-sales-form">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 20px;">
                                <!-- Cow -->
                                <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🐄</div>
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">Cows</div>
                                    <div style="display: flex; gap: 5px; justify-content: center;">
                                        <button type="button" class="btn-outline animal-minus" data-animal="cow" style="padding: 5px 10px;">-</button>
                                        <input type="number" id="cow-count" value="0" min="0" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                                        <button type="button" class="btn-outline animal-plus" data-animal="cow" style="padding: 5px 10px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- Sheep -->
                                <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🐑</div>
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">Sheep</div>
                                    <div style="display: flex; gap: 5px; justify-content: center;">
                                        <button type="button" class="btn-outline animal-minus" data-animal="sheep" style="padding: 5px 10px;">-</button>
                                        <input type="number" id="sheep-count" value="0" min="0" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                                        <button type="button" class="btn-outline animal-plus" data-animal="sheep" style="padding: 5px 10px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- Goat -->
                                <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🐐</div>
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">Goats</div>
                                    <div style="display: flex; gap: 5px; justify-content: center;">
                                        <button type="button" class="btn-outline animal-minus" data-animal="goat" style="padding: 5px 10px;">-</button>
                                        <input type="number" id="goat-count" value="0" min="0" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                                        <button type="button" class="btn-outline animal-plus" data-animal="goat" style="padding: 5px 10px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- Pig -->
                                <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🐖</div>
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">Pigs</div>
                                    <div style="display: flex; gap: 5px; justify-content: center;">
                                        <button type="button" class="btn-outline animal-minus" data-animal="pig" style="padding: 5px 10px;">-</button>
                                        <input type="number" id="pig-count" value="0" min="0" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                                        <button type="button" class="btn-outline animal-plus" data-animal="pig" style="padding: 5px 10px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- Chicken -->
                                <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🐔</div>
                                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">Chickens</div>
                                    <div style="display: flex; gap: 5px; justify-content: center;">
                                        <button type="button" class="btn-outline animal-minus" data-animal="chicken" style="padding: 5px 10px;">-</button>
                                        <input type="number" id="chicken-count" value="0" min="0" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                                        <button type="button" class="btn-outline animal-plus" data-animal="chicken" style="padding: 5px 10px;">+</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Chicken Options -->
                            <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffb300;">
                                <h5 style="margin: 0 0 10px 0; color: #5d4037;">🐔 Chicken Counting Options</h5>
                                <div style="display: flex; gap: 20px;">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="radio" name="chicken-unit" value="individual" checked style="margin-right: 8px;">
                                        Count individually
                                    </label>
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="radio" name="chicken-unit" value="dozen" style="margin-right: 8px;">
                                        Count by dozen (12 chickens)
                                    </label>
                                </div>
                                <div style="margin-top: 10px; font-size: 12px; color: #795548;">
                                    Note: When counting by dozen, each increment of 1 adds 12 chickens
                                </div>
                            </div>
                            
                            <!-- Notes -->
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">Sale Details (Optional)</label>
                                <input type="text" id="animal-sale-notes" placeholder="Customer name, reason for sale, etc." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                    </div>
                    <div class="popout-modal-footer">
                        <button type="button" class="btn-danger" id="reset-animal-counts">Reset All</button>
                        <button type="button" class="btn-outline" id="cancel-animal-sales">Cancel</button>
                        <button type="button" class="btn-primary" id="save-animal-sales">Save Animal Sales</button>
                    </div>
                </div>
            </div>

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
                                    <input type="date" id="sale-date" class="form-input" required value="${this.getCurrentDate()}">
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
                                            <label class="form-label">Price per kg *</label>
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

        this.setupEventListeners();
    },

    // ... [Previous renderProductionItems(), renderSalesTable() methods remain the same] ...

    setupEventListeners() {
        // Quick sale form
        const quickSaleForm = document.getElementById('quick-sale-form');
        if (quickSaleForm) {
            quickSaleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
        }

        // Modal buttons
        document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleModal());
        document.getElementById('from-production-btn')?.addEventListener('click', () => this.showProductionItems());
        document.getElementById('meat-sales-btn')?.addEventListener('click', () => this.generateMeatSalesReport());
        document.getElementById('daily-report-btn')?.addEventListener('click', () => this.generateDailyReport());
        document.getElementById('view-production-items')?.addEventListener('click', () => this.showProductionItems());
        
        // ANIMAL SALES MODAL HANDLERS
        document.getElementById('open-animal-sales-counter')?.addEventListener('click', () => this.showAnimalSalesModal());
        document.getElementById('animal-counter-btn')?.addEventListener('click', () => this.showAnimalSalesModal());
        document.getElementById('close-animal-sales-modal')?.addEventListener('click', () => this.hideAnimalSalesModal());
        document.getElementById('cancel-animal-sales')?.addEventListener('click', () => this.hideAnimalSalesModal());
        document.getElementById('reset-animal-counts')?.addEventListener('click', () => this.resetAnimalCounts());
        document.getElementById('save-animal-sales')?.addEventListener('click', () => this.saveAnimalSales());
        
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
        
        // Form field event listeners
        this.setupFormFieldListeners();
        
        // Quick product change
        document.getElementById('quick-product')?.addEventListener('change', () => this.handleQuickProductChange());

        // Filter
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                document.getElementById('sales-table').innerHTML = this.renderSalesTable(e.target.value);
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        // Edit/delete sale buttons
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-sale');
            const deleteBtn = e.target.closest('.delete-sale');
            
            if (editBtn) {
                const saleId = editBtn.dataset.id;
                e.preventDefault();
                e.stopPropagation();
                this.editSale(saleId);
            }
            
            if (deleteBtn) {
                const saleId = deleteBtn.dataset.id;
                e.preventDefault();
                e.stopPropagation();
                this.deleteSaleRecord(saleId);
            }
        });

        // ANIMAL SALES COUNTER EVENT LISTENERS
        this.setupAnimalCounterListeners();
    },

    setupAnimalCounterListeners() {
        // Plus/minus buttons for each animal
        const animals = ['cow', 'sheep', 'goat', 'pig', 'chicken'];
        animals.forEach(animal => {
            const plusBtn = document.querySelector(`.animal-plus[data-animal="${animal}"]`);
            const minusBtn = document.querySelector(`.animal-minus[data-animal="${animal}"]`);
            const input = document.getElementById(`${animal}-count`);
            
            if (plusBtn) {
                plusBtn.addEventListener('click', () => this.incrementAnimalCount(animal));
            }
            if (minusBtn) {
                minusBtn.addEventListener('click', () => this.decrementAnimalCount(animal));
            }
            if (input) {
                input.addEventListener('change', (e) => this.updateAnimalCount(animal, parseInt(e.target.value) || 0));
            }
        });

        // Chicken unit radio buttons
        const chickenRadios = document.querySelectorAll('input[name="chicken-unit"]');
        chickenRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const chickenInput = document.getElementById('chicken-count');
                if (e.target.value === 'dozen') {
                    // Convert current count to dozens
                    const current = parseInt(chickenInput.value) || 0;
                    chickenInput.value = Math.floor(current / 12);
                } else {
                    // Convert dozens to individual
                    const current = parseInt(chickenInput.value) || 0;
                    chickenInput.value = current * 12;
                }
            });
        });
    },

    incrementAnimalCount(animal) {
        const input = document.getElementById(`${animal}-count`);
        if (!input) return;
        
        const current = parseInt(input.value) || 0;
        
        if (animal === 'chicken') {
            const isDozen = document.querySelector('input[name="chicken-unit"]:checked')?.value === 'dozen';
            input.value = isDozen ? current + 1 : current + 1;
        } else {
            input.value = current + 1;
        }
    },

    decrementAnimalCount(animal) {
        const input = document.getElementById(`${animal}-count`);
        if (!input) return;
        
        const current = parseInt(input.value) || 0;
        if (current > 0) {
            input.value = current - 1;
        }
    },

    updateAnimalCount(animal, count) {
        if (count < 0) count = 0;
        const input = document.getElementById(`${animal}-count`);
        if (input) {
            input.value = count;
        }
    },

    showAnimalSalesModal() {
        this.hideAllModals();
        const modal = document.getElementById('animal-sales-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Reset form inputs to 0
        const animals = ['cow', 'sheep', 'goat', 'pig', 'chicken'];
        animals.forEach(animal => {
            const input = document.getElementById(`${animal}-count`);
            if (input) {
                input.value = 0;
            }
        });
        
        // Update display totals
        this.updateAnimalTotalsDisplay();
    },

    updateAnimalTotalsDisplay() {
        document.getElementById('cow-total').textContent = this.animalSales.cows;
        document.getElementById('sheep-total').textContent = this.animalSales.sheep;
        document.getElementById('goat-total').textContent = this.animalSales.goats;
        document.getElementById('pig-total').textContent = this.animalSales.pigs;
        document.getElementById('chicken-total').textContent = this.animalSales.chickens;
        
        const total = this.animalSales.cows + this.animalSales.sheep + 
                     this.animalSales.goats + this.animalSales.pigs + 
                     this.animalSales.chickens;
        document.getElementById('animal-grand-total').textContent = total;
    },

    hideAnimalSalesModal() {
        const modal = document.getElementById('animal-sales-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    resetAnimalCounts() {
        if (confirm('Are you sure you want to reset ALL animal sale counts? This cannot be undone.')) {
            this.animalSales = {
                cows: 0,
                sheep: 0,
                goats: 0,
                pigs: 0,
                chickens: 0
            };
            this.saveAnimalSalesData();
            this.updateAnimalTotalsDisplay();
            this.showNotification('All animal counts have been reset', 'success');
        }
    },

    saveAnimalSales() {
        const cowCount = parseInt(document.getElementById('cow-count')?.value) || 0;
        const sheepCount = parseInt(document.getElementById('sheep-count')?.value) || 0;
        const goatCount = parseInt(document.getElementById('goat-count')?.value) || 0;
        const pigCount = parseInt(document.getElementById('pig-count')?.value) || 0;
        const chickenCountInput = parseInt(document.getElementById('chicken-count')?.value) || 0;
        const isDozen = document.querySelector('input[name="chicken-unit"]:checked')?.value === 'dozen';
        const chickenCount = isDozen ? chickenCountInput * 12 : chickenCountInput;
        
        const notes = document.getElementById('animal-sale-notes')?.value || '';
        
        if (cowCount === 0 && sheepCount === 0 && goatCount === 0 && pigCount === 0 && chickenCount === 0) {
            this.showNotification('Please add at least one animal to save', 'error');
            return;
        }
        
        // Update totals
        this.animalSales.cows += cowCount;
        this.animalSales.sheep += sheepCount;
        this.animalSales.goats += goatCount;
        this.animalSales.pigs += pigCount;
        this.animalSales.chickens += chickenCount;
        
        this.saveAnimalSalesData();
        this.updateAnimalTotalsDisplay();
        
        // Create sales records for each animal type
        this.createAnimalSalesRecords({
            cows: cowCount,
            sheep: sheepCount,
            goats: goatCount,
            pigs: pigCount,
            chickens: chickenCount,
            notes: notes
        });
        
        this.hideAnimalSalesModal();
        this.showNotification('Animal sales recorded successfully!', 'success');
    },

    createAnimalSalesRecords(salesData) {
        const today = this.getCurrentDate();
        const timestamp = this.getCurrentDateTime();
        
        // Create sales records for each animal type
        const animalMap = {
            'cows': { product: 'beef', type: 'Cows', unitPrice: 800 },
            'sheep': { product: 'lamb', type: 'Sheep', unitPrice: 300 },
            'goats': { product: 'goat', type: 'Goats', unitPrice: 250 },
            'pigs': { product: 'pork', type: 'Pigs', unitPrice: 350 },
            'chickens': { product: 'broilers-live', type: 'Chickens', unitPrice: 15 }
        };
        
        Object.entries(salesData).forEach(([animal, count]) => {
            if (count > 0 && animal !== 'notes' && animalMap[animal]) {
                const animalInfo = animalMap[animal];
                const saleId = `ANIMAL-${animal.toUpperCase()}-${Date.now().toString().slice(-6)}`;
                
                const saleRecord = {
                    id: saleId,
                    date: today,
                    timestamp: timestamp,
                    customer: 'Various',
                    product: animalInfo.product,
                    type: animalInfo.type,
                    quantity: count,
                    unit: 'animals',
                    unitPrice: animalInfo.unitPrice,
                    totalAmount: count * animalInfo.unitPrice,
                    paymentMethod: 'cash',
                    paymentStatus: 'paid',
                    notes: salesData.notes || `Animal sale: ${count} ${animal}`,
                    isAnimalSale: true,
                    animalType: animal,
                    count: count
                };
                
                this.addSale(saleRecord);
            }
        });
        
        // Update summary
        this.updateSummary();
    },

    setupFormFieldListeners() {
        // Product change
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.addEventListener('change', () => this.handleProductChange());
        }
        
        // Real-time total calculation
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
        
        // Weight unit change
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) {
            weightUnit.removeEventListener('change', this.handleWeightUnitChange);
            weightUnit.addEventListener('change', () => {
                this.updatePriceUnitLabel();
                this.calculateSaleTotal();
            });
        }
    },

    updatePriceUnitLabel() {
        const weightUnit = document.getElementById('meat-weight-unit')?.value;
        const priceUnitLabel = document.getElementById('meat-price-unit-label');
        const priceLabel = document.querySelector('label[for="meat-price"]');
        
        if (weightUnit === 'lbs') {
            if (priceUnitLabel) priceUnitLabel.textContent = 'per lb';
            if (priceLabel) priceLabel.textContent = 'Price per lb *';
        } else {
            if (priceUnitLabel) priceUnitLabel.textContent = 'per kg';
            if (priceLabel) priceLabel.textContent = 'Price per kg *';
        }
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
        const meatPriceUnitLabel = document.getElementById('meat-price-unit-label');
        
        if (isMeatProduct) {
            // Show meat section
            if (meatSection) meatSection.style.display = 'block';
            if (meatSummary) meatSummary.style.display = 'block';
            if (standardSection) standardSection.style.display = 'none';
            if (standardSummary) standardSummary.style.display = 'none';
            
            // Set appropriate defaults
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) unitSelect.value = 'animals';
            
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit) {
                weightUnit.value = 'kg';
            }
            
            // Set animal label
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
            
            // Update price unit label based on selected weight unit
            this.updatePriceUnitLabel();
            
            // Clear standard fields
            const standardQuantity = document.getElementById('standard-quantity');
            const standardPrice = document.getElementById('standard-price');
            if (standardQuantity) standardQuantity.value = '';
            if (standardPrice) standardPrice.value = '';
            
        } else {
            // Show standard section
            if (meatSection) meatSection.style.display = 'none';
            if (meatSummary) meatSummary.style.display = 'none';
            if (standardSection) standardSection.style.display = 'block';
            if (standardSummary) standardSummary.style.display = 'block';
            
            // Set appropriate unit
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
            
            // Update standard price unit label
            const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
            if (standardPriceUnitLabel) {
                standardPriceUnitLabel.textContent = selectedValue === 'eggs' ? 'per dozen' : 
                                                   selectedValue === 'milk' ? 'per liter' :
                                                   selectedValue.includes('broilers') || selectedValue === 'layers' || selectedValue === 'chicks' ? 'per bird' :
                                                   'per kg';
            }
            
            // Clear meat fields
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

    calculateSaleTotal() {
        const product = document.getElementById('sale-product')?.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        let total = 0;
        
        if (meatProducts.includes(product)) {
            // Meat product calculation
            const animalCount = parseFloat(document.getElementById('meat-animal-count')?.value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit')?.value;
            const pricePerUnit = parseFloat(document.getElementById('meat-price')?.value) || 0;
            
            // Calculate based on selected unit
            if (weightUnit === 'lbs') {
                total = weight * pricePerUnit;
            } else {
                total = weight * pricePerUnit;
            }
            
            // Update summary
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
            // Standard product calculation
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
        this.hideAllModals();
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Set today's date using timezone-fixed method
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = this.getCurrentDate();
        }
        
        // Reset form
        const form = document.getElementById('sale-form');
        if (form) {
            form.reset();
        }
        
        document.getElementById('sale-modal-title').textContent = 'Record Sale';
        document.getElementById('delete-sale').style.display = 'none';
        document.getElementById('production-source-notice').style.display = 'none';
        
        // Clear all fields
        const fieldsToClear = [
            'meat-animal-count',
            'meat-weight',
            'meat-price',
            'standard-quantity',
            'standard-price',
            'sale-customer',
            'sale-notes'
        ];
        
        fieldsToClear.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Set default values
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = '';
        
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) weightUnit.value = 'kg';
        
        const paymentMethod = document.getElementById('sale-payment');
        if (paymentMethod) paymentMethod.value = 'cash';
        
        const paymentStatus = document.getElementById('sale-status');
        if (paymentStatus) paymentStatus.value = 'paid';
        
        // Set default product if from production
        if (this.pendingProductionSale) {
            this.prefillFromProduction(this.pendingProductionSale);
            this.showProductionSourceNotice();
        } else {
            const productSelect = document.getElementById('sale-product');
            if (productSelect) productSelect.value = '';
        }
        
        // Initialize product handling
        setTimeout(() => {
            this.handleProductChange();
        }, 10);
        
        // Re-attach form field listeners
        this.setupFormFieldListeners();
    },

    hideAllModals() {
        this.hideSaleModal();
        this.hideDailyReportModal();
        this.hideMeatSalesModal();
        this.hideProductionItemsModal();
        this.hideAnimalSalesModal();
    },

    // ... [Other methods remain the same: saveSale(), editSale(), deleteSale(), etc.] ...

    // UTILITY METHODS
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    showNotification(message, type = 'success') {
        if (window.FarmModules && window.FarmModules.notify) {
            window.FarmModules.notify(message, type);
            return;
        }
        console.log(`${type}: ${message}`);
        alert(message);
    },

    cleanup() {
        console.log('🧹 Cleaning up Sales Records...');
        this.initialized = false;
        this.pendingProductionSale = null;
    }
};

// Register module
console.log('✅ Enhanced Sales Records module loaded successfully!');

if (window.FarmModules && window.FarmModules.registerModule) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
    console.log('📝 Sales Record module registered with FarmModules framework');
} else {
    console.warn('⚠️ FarmModules framework not available, registering globally');
    window.FarmModules = window.FarmModules || {};
    window.FarmModules.SalesRecord = SalesRecordModule;
    
    if (window.FarmModules.modules) {
        window.FarmModules.modules['sales-record'] = SalesRecordModule;
    }
}
