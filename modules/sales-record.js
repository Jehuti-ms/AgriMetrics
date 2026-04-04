// modules/sales-record.js - COMPLETE FIXED VERSION WITH INVENTORY & PRODUCTION UPDATES
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,
    broadcaster: null,
    dataService: null,

  async initialize() {
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
    
    // Get UnifiedDataService
    this.dataService = window.UnifiedDataService;
    
    // Get Broadcaster instance (with null check)
    if (window.DataBroadcaster && typeof window.DataBroadcaster.on === 'function') {
        this.broadcaster = window.DataBroadcaster;
        console.log('📡 Sales module connected to Data Broadcaster');
    } else if (window.Broadcaster && typeof window.Broadcaster.on === 'function') {
        this.broadcaster = window.Broadcaster;
        console.log('📡 Sales module connected to Broadcaster');
    } else {
        console.warn('⚠️ No valid broadcaster found, module integrations may not work');
        // Create a dummy broadcaster to prevent errors
        this.broadcaster = {
            on: function() { console.log('Dummy broadcaster - ignoring event'); },
            broadcast: function() { console.log('Dummy broadcaster - ignoring broadcast'); },
            emit: function() { console.log('Dummy broadcaster - ignoring emit'); }
        };
    }

    // Only setup listeners if broadcaster is valid
    if (this.broadcaster && typeof this.broadcaster.on === 'function') {
        this.setupBroadcasterListeners();
    } else {
        console.warn('⚠️ Skipping broadcaster listeners setup');
    }
    
    // Register with StyleManager
    if (window.StyleManager) {
        window.StyleManager.registerComponent(this.name);
    }
    
    await this.loadSalesData(); // Make sure this is async
    
    // Setup real-time sync with UnifiedDataService
    if (this.dataService) {
        this.setupRealtimeSync();
    }
    
    this.renderModule();
    
    setTimeout(() => {
        this.setupEventListeners();
    }, 100);
    
    this.initialized = true;
    
    console.log('✅ Enhanced Sales Records initialized');
    console.log('📅 DateUtils available:', !!window.DateUtils);
    
    // Broadcast sales loaded
    this.broadcastSalesLoaded();
    
    return true;
},
    
    setupBroadcasterListeners() {
    // Add safety check at the beginning
    if (!this.broadcaster || typeof this.broadcaster.on !== 'function') {
        console.warn('⚠️ Broadcaster not available or invalid, skipping listener setup');
        return;
    }
    
    console.log('📡 Setting up Sales module broadcaster listeners...');
    
    // Rest of your existing listener code...
    // (keep all your existing this.broadcaster.on calls)
},

    setupRealtimeSync() {
    if (!this.dataService) return;
    
    console.log('📡 Setting up real-time sync for sales...');
    
    // Listen for sales updates from other devices
    this.dataService.on('sales-updated', (sales) => {
        console.log('🔄 Sales updated from unified service:', sales?.length);
        if (window.FarmModules.appData) {
            window.FarmModules.appData.sales = sales || [];
            this.renderModule();
            this.updateSalesStats();
        }
    });
    
    // Listen for sync status
    this.dataService.on('sync-completed', (status) => {
        console.log('✅ Sales sync completed:', status);
    });
},

    // ==================== SALE TYPE HANDLING ====================

// Check if product is sold by unit (per bird) or by weight
isProductSoldByWeight(productType) {
    const weightProducts = [
        'broiler-dressed', 'broiler-live', 'layer', 'duck', 
        'turkey', 'goose', 'quail', 'chicken'
    ];
    
    // If product type includes 'dressed' or 'live', it's by weight
    if (productType.includes('dressed') || productType.includes('live')) {
        return true;
    }
    
    return weightProducts.includes(productType);
},

// Get unit for product
getProductUnit(productType, unitType) {
    const weightProducts = this.isProductSoldByWeight(productType);
    
    if (weightProducts) {
        // Weight-based products use kg or lbs
        return unitType === 'kg' ? 'kg' : 'lbs';
    } else {
        // Unit-based products use 'bird', 'dozen', etc.
        const unitMap = {
            'eggs': 'dozen',
            'broiler-dressed': 'bird',
            'broiler-live': 'bird',
            'layer': 'bird',
            'duck': 'bird',
            'turkey': 'bird',
            'goose': 'bird',
            'quail': 'bird',
            'milk': 'liters',
            'eggs-dozen': 'dozen',
            'eggs-tray': 'tray'
        };
        return unitMap[productType] || 'unit';
    }
},

// Update the sale form rendering
renderSaleForm() {
    return `
        <div class="sale-form-container">
            <h3>Record New Sale</h3>
            
            <div class="form-group">
                <label>Product Type *</label>
                <select id="sale-product-type" class="form-input" required>
                    <option value="">Select Product</option>
                    <optgroup label="Poultry - Dressed (by weight)">
                        <option value="broiler-dressed">Broiler (Dressed) - by weight</option>
                        <option value="layer-dressed">Layer (Dressed) - by weight</option>
                        <option value="duck-dressed">Duck (Dressed) - by weight</option>
                        <option value="turkey-dressed">Turkey (Dressed) - by weight</option>
                    </optgroup>
                    <optgroup label="Poultry - Live (by weight)">
                        <option value="broiler-live">Broiler (Live) - by weight</option>
                        <option value="layer-live">Layer (Live) - by weight</option>
                        <option value="duck-live">Duck (Live) - by weight</option>
                    </optgroup>
                    <optgroup label="Poultry - Per Bird">
                        <option value="broiler-per-bird">Broiler - Per Bird</option>
                        <option value="layer-per-bird">Layer - Per Bird</option>
                        <option value="duck-per-bird">Duck - Per Bird</option>
                    </optgroup>
                    <optgroup label="Eggs">
                        <option value="eggs-dozen">Eggs (per dozen)</option>
                        <option value="eggs-tray">Eggs (per tray)</option>
                    </optgroup>
                    <optgroup label="Other Products">
                        <option value="milk">Milk (liters)</option>
                        <option value="crops">Crops/Produce</option>
                        <option value="other">Other</option>
                    </optgroup>
                </select>
            </div>
            
            <div class="form-group">
                <label>Unit Type *</label>
                <select id="sale-unit-type" class="form-input">
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                </select>
                <small class="unit-hint" style="color: #666; font-size: 12px;">For weight-based products only</small>
            </div>
            
            <div class="form-group">
                <label id="quantity-label">Quantity/Weight *</label>
                <input type="number" id="sale-quantity" class="form-input" step="0.01" placeholder="Enter number of birds or weight">
                <small id="quantity-hint" class="form-hint">Enter the number of birds sold</small>
            </div>
            
            <div class="form-group" id="price-per-unit-group">
                <label id="price-label">Price per Bird *</label>
                <input type="number" id="sale-price-per-unit" class="form-input" step="0.01" placeholder="Enter price per bird">
                <small id="price-hint" class="form-hint">Enter the price for each bird</small>
            </div>
            
            <div class="form-group" id="weight-group" style="display: none;">
                <label>Weight per Bird (Optional)</label>
                <input type="number" id="sale-weight" class="form-input" step="0.01" placeholder="Average weight per bird">
                <small>Enter average weight if known</small>
            </div>
            
            <div class="form-group">
                <label>Total Amount *</label>
                <input type="number" id="sale-total-amount" class="form-input" step="0.01" readonly placeholder="Auto-calculated">
            </div>
            
            <div class="form-group">
                <label>Customer Name (Optional)</label>
                <input type="text" id="sale-customer" class="form-input" placeholder="Customer name">
            </div>
            
            <div class="form-group">
                <label>Payment Method</label>
                <select id="sale-payment-method" class="form-input">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="sale-date" class="form-input" value="${this.getLocalDate()}">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea id="sale-notes" class="form-input" rows="3" placeholder="Additional notes"></textarea>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-primary" id="save-sale-btn">Save Sale</button>
                <button class="btn btn-outline" id="cancel-sale-btn">Cancel</button>
            </div>
        </div>
    `;
},

// Set up sale form event listeners
setupSaleFormListeners() {
    const productType = document.getElementById('sale-product-type');
    const unitType = document.getElementById('sale-unit-type');
    const quantity = document.getElementById('sale-quantity');
    const pricePerUnit = document.getElementById('sale-price-per-unit');
    const weightField = document.getElementById('sale-weight');
    const totalAmount = document.getElementById('sale-total-amount');
    const quantityLabel = document.getElementById('quantity-label');
    const quantityHint = document.getElementById('quantity-hint');
    const priceLabel = document.getElementById('price-label');
    const priceHint = document.getElementById('price-hint');
    const weightGroup = document.getElementById('weight-group');
    
    // Function to update form based on product selection
    const updateFormForProduct = () => {
        const selectedProduct = productType.value;
        const selectedUnit = unitType.value;
        
        if (!selectedProduct) return;
        
        // Check if product is sold by weight
        const isByWeight = this.isProductSoldByWeight(selectedProduct);
        
        if (isByWeight) {
            // Weight-based sale
            quantityLabel.textContent = 'Weight *';
            quantityHint.textContent = 'Enter the weight in ' + selectedUnit;
            quantity.placeholder = `Enter weight in ${selectedUnit}`;
            quantity.step = "0.01";
            
            priceLabel.textContent = `Price per ${selectedUnit} *`;
            priceHint.textContent = `Enter price per ${selectedUnit}`;
            
            weightGroup.style.display = 'none';
            
        } else {
            // Unit-based sale (per bird)
            const unitName = this.getProductUnit(selectedProduct, selectedUnit);
            quantityLabel.textContent = `Number of ${unitName}s *`;
            quantityHint.textContent = `Enter the number of ${unitName}s sold`;
            quantity.placeholder = `Enter number of ${unitName}s`;
            quantity.step = "1";
            
            priceLabel.textContent = `Price per ${unitName} *`;
            priceHint.textContent = `Enter price per ${unitName}`;
            
            // Show weight field for per-bird sales (optional)
            weightGroup.style.display = 'block';
        }
        
        // Recalculate total
        calculateTotal();
    };
    
    // Function to calculate total amount
    const calculateTotal = () => {
        const selectedProduct = productType.value;
        const qty = parseFloat(quantity.value) || 0;
        const price = parseFloat(pricePerUnit.value) || 0;
        
        if (selectedProduct) {
            const total = qty * price;
            totalAmount.value = total.toFixed(2);
        }
    };
    
    // Add event listeners
    productType.addEventListener('change', updateFormForProduct);
    unitType.addEventListener('change', updateFormForProduct);
    quantity.addEventListener('input', calculateTotal);
    pricePerUnit.addEventListener('input', calculateTotal);
    
    // Initial form setup
    updateFormForProduct();
},

// Save sale with validation
async saveSale() {
    const productType = document.getElementById('sale-product-type').value;
    const unitType = document.getElementById('sale-unit-type').value;
    const quantity = parseFloat(document.getElementById('sale-quantity').value);
    const pricePerUnit = parseFloat(document.getElementById('sale-price-per-unit').value);
    const weight = parseFloat(document.getElementById('sale-weight').value) || null;
    const totalAmount = parseFloat(document.getElementById('sale-total-amount').value);
    const customer = document.getElementById('sale-customer').value;
    const paymentMethod = document.getElementById('sale-payment-method').value;
    const date = document.getElementById('sale-date').value;
    const notes = document.getElementById('sale-notes').value;
    
    // Validate inputs
    if (!productType) {
        this.showNotification('Please select a product', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        const isByWeight = this.isProductSoldByWeight(productType);
        const message = isByWeight ? 'Please enter a valid weight' : 'Please enter a valid quantity';
        this.showNotification(message, 'error');
        return;
    }
    
    if (!pricePerUnit || pricePerUnit <= 0) {
        const isByWeight = this.isProductSoldByWeight(productType);
        const unit = isByWeight ? unitType : this.getProductUnit(productType, unitType);
        this.showNotification(`Please enter a valid price per ${unit}`, 'error');
        return;
    }
    
    // Special validation for per-bird sales - weight is optional
    const isByWeight = this.isProductSoldByWeight(productType);
    
    const saleData = {
        id: Date.now(),
        date: date,
        productType: productType,
        unitType: isByWeight ? unitType : 'unit',
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        weightPerBird: weight, // Only for per-bird sales
        totalAmount: totalAmount,
        customer: customer || 'Walk-in',
        paymentMethod: paymentMethod,
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    // Add to sales array
    if (!this.sales) this.sales = [];
    this.sales.unshift(saleData);
    
    // Save to localStorage
    localStorage.setItem('farm-sales', JSON.stringify(this.sales));
    
    // Save to Firebase
    if (this.isFirebaseAvailable) {
        await this.saveSaleToFirebase(saleData);
    }
    
    // Broadcast to other modules (Income module)
    if (window.DataBroadcaster) {
        window.DataBroadcaster.emit('sale-completed', {
            orderId: saleData.id,
            amount: saleData.totalAmount,
            description: `Sale: ${saleData.quantity} ${isByWeight ? saleData.unitType : this.getProductUnit(productType, unitType)} of ${productType}`,
            date: saleData.date,
            paymentMethod: saleData.paymentMethod,
            customerName: saleData.customer,
            sourceDeviceId: this.getDeviceId()
        });
    }

     // ===== PRESERVE CURRENT FILTER =====
    const periodFilter = document.getElementById('period-filter');
    const currentFilter = periodFilter ? periodFilter.value : 'today';
    
    // Update UI with current filter
    const salesTable = document.getElementById('sales-table');
    if (salesTable) {
        salesTable.innerHTML = this.renderSalesTable(currentFilter);
    }
    this.updateSalesStats();
    
    // Update UI
    //this.renderSalesList();
    this.renderSalesTable();
    this.updateSalesStats();

    // ===== UPDATE INVENTORY FROM SALE =====
    this.updateInventoryFromSale(saleData);

    // ===== UPDATE PRODUCTION FROM SALE =====
    this.updateProductionFromSale(saleData);
    
    // Close modal
    this.hideSaleModal();
    
    this.showNotification('Sale recorded successfully!', 'success');
    
    return saleData;
},

    // ===== UPDATE INVENTORY FROM SALE =====
updateInventoryFromSale(saleData) {
    console.log('📦 Updating inventory from sale:', saleData);
    
    if (!saleData.product) return;
    
    const soldQty = saleData.quantity || saleData.animalCount || 0;
    if (soldQty <= 0) return;
    
    // Update InventoryCheckModule directly
    if (window.InventoryCheckModule && window.InventoryCheckModule.inventory) {
        const productLower = saleData.product.toLowerCase();
        const inventoryItem = window.InventoryCheckModule.inventory.find(item => 
            item.name?.toLowerCase().includes(productLower) ||
            item.category?.toLowerCase().includes(productLower)
        );
        
        if (inventoryItem) {
            const oldStock = inventoryItem.currentStock;
            inventoryItem.currentStock = Math.max(0, (inventoryItem.currentStock || 0) - soldQty);
            inventoryItem.lastUpdated = new Date().toISOString();
            
            if (typeof window.InventoryCheckModule.saveData === 'function') {
                window.InventoryCheckModule.saveData();
            }
            
            console.log(`✅ Inventory updated: ${inventoryItem.name} from ${oldStock} to ${inventoryItem.currentStock}`);
        }
    }
    
    // Update localStorage as backup
    try {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const productLower = saleData.product.toLowerCase();
        
        const updatedInventory = inventory.map(item => {
            if (item.name?.toLowerCase().includes(productLower) ||
                item.category?.toLowerCase().includes(productLower)) {
                item.currentStock = Math.max(0, (item.currentStock || 0) - soldQty);
            }
            return item;
        });
        
        localStorage.setItem('farm-inventory', JSON.stringify(updatedInventory));
    } catch(e) {
        console.warn('Error updating localStorage inventory:', e);
    }
},

// ===== UPDATE PRODUCTION FROM SALE =====
updateProductionFromSale(saleData) {
    console.log('🚜 Updating production from sale:', saleData);
    
    const meatProducts = ['broilers-dressed', 'broilers-live', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    if (!meatProducts.includes(saleData.product)) {
        console.log('ℹ️ Not a meat product, skipping production update');
        return;
    }
    
    const soldQty = saleData.animalCount || saleData.quantity || 0;
    if (soldQty <= 0) return;
    
    // Update ProductionModule
    if (window.ProductionModule && window.ProductionModule.productionData) {
        const productionRecords = window.ProductionModule.productionData;
        let remainingToSell = soldQty;
        
        // Sort by date (oldest first for FIFO)
        const sortedRecords = [...productionRecords]
            .filter(r => r.product === saleData.product && !r.fullySold)
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        
        for (const record of sortedRecords) {
            if (remainingToSell <= 0) break;
            
            const available = record.quantity || 0;
            const soldSoFar = record.soldQuantity || 0;
            const canSell = available - soldSoFar;
            
            if (canSell > 0) {
                const sellNow = Math.min(canSell, remainingToSell);
                record.soldQuantity = (record.soldQuantity || 0) + sellNow;
                record.availableQuantity = available - record.soldQuantity;
                remainingToSell -= sellNow;
                
                if (record.soldQuantity >= available) {
                    record.fullySold = true;
                    record.status = 'sold';
                } else {
                    record.status = 'partial';
                }
                
                console.log(`✅ Production record ${record.id}: sold ${sellNow}, remaining: ${record.availableQuantity}`);
            }
        }
        
        // Save production module
        if (typeof window.ProductionModule.saveData === 'function') {
            window.ProductionModule.saveData();
        }
    }
    
    // Update localStorage as backup
    try {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        let remainingToSell = soldQty;
        
        const sortedProduction = [...production]
            .filter(r => r.product === saleData.product && !r.fullySold)
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        
        for (const record of sortedProduction) {
            if (remainingToSell <= 0) break;
            
            const available = record.quantity || 0;
            const soldSoFar = record.soldQuantity || 0;
            const canSell = available - soldSoFar;
            
            if (canSell > 0) {
                const sellNow = Math.min(canSell, remainingToSell);
                record.soldQuantity = (record.soldQuantity || 0) + sellNow;
                remainingToSell -= sellNow;
                
                if (record.soldQuantity >= available) {
                    record.fullySold = true;
                }
            }
        }
        
        localStorage.setItem('farm-production', JSON.stringify(production));
    } catch(e) {
        console.warn('Error updating localStorage production:', e);
    }
},
    
// Helper to get local date
getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
},

// Helper to get device ID
getDeviceId() {
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
},
    
// ===== NEW HANDLER METHODS =====
handleIncomeSale: function(data) {
    console.log('💰 Handling income-created sale:', data);
    
    // Check if sale already exists to prevent duplicates
    const existingSale = window.FarmModules.appData.sales?.find(s => 
        s.id === data.id || s.transactionId === data.transactionId
    );
    
    if (existingSale) {
        console.log('⚠️ Sale already exists, skipping:', existingSale.id);
        return;
    }
    
    // Add the sale
    this.addSale(data);
    
    // Show notification
    this.showNotification(`✅ Sale recorded from income: ${this.formatCurrency(data.totalAmount)}`, 'success');
},

handleFeedPurchase: function(data) {
    console.log('🌾 Handling feed purchase for potential resale:', data);
    
    // Only create sale if this is a resale (not for farm use)
    if (data.forResale) {
        const saleData = {
            id: 'FEED-' + data.id,
            date: data.date,
            customer: 'Farm Store',
            product: 'feed',
            unit: 'kg',
            quantity: data.quantity || 50,
            unitPrice: (data.amount / (data.quantity || 50)) * 1.2, // 20% markup
            totalAmount: data.amount * 1.2,
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            notes: `Feed resale: ${data.description}`,
            source: 'feed-resale',
            feedPurchaseId: data.id
        };
        
        this.addSale(saleData);
        this.showNotification(`📦 Created resale record for feed`, 'info');
    }
},

handleProductionForSale: function(data) {
    console.log('🚜 Handling production marked for sale:', data);
    
    // Store in pending production sales
    if (!this.pendingProductionSales) {
        this.pendingProductionSales = [];
    }
    
    this.pendingProductionSales.push({
        ...data,
        receivedAt: new Date().toISOString()
    });
    
    // Show notification
    this.showNotification(`📦 New production items available for sale: ${data.product}`, 'info');
    
    // Update UI if on sales page
    if (window.app?.currentSection === 'sales-record') {
        this.updateProductionItemsDisplay();
    }
},

handleBulkSale: function(data) {
    console.log('📊 Handling bulk sale:', data);
    
    // Create multiple sale records from bulk data
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
            const saleData = {
                id: 'BULK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                date: data.date || this.getCurrentDate(),
                customer: data.customer || 'Bulk Customer',
                product: item.product,
                unit: item.unit || 'units',
                quantity: item.quantity,
                unitPrice: item.price,
                totalAmount: item.quantity * item.price,
                paymentMethod: data.paymentMethod || 'cash',
                paymentStatus: data.paymentStatus || 'paid',
                notes: `Bulk sale: ${data.notes || ''}`,
                source: 'bulk-sale',
                bulkId: data.id
            };
            
            this.addSale(saleData);
        });
        
        this.showNotification(`✅ Created ${data.items.length} bulk sale records`, 'success');
    }
},

updateProductPrices: function(data) {
    console.log('💰 Updating product prices from broadcast:', data);
    
    // Update any cached price data
    if (!this.productPrices) {
        this.productPrices = {};
    }
    
    if (data.product && data.price) {
        this.productPrices[data.product] = {
            price: data.price,
            unit: data.unit || 'unit',
            updatedAt: data.timestamp || new Date().toISOString()
        };
        
        console.log(`✅ Updated price for ${data.product}: ${this.formatCurrency(data.price)}/${data.unit || 'unit'}`);
    }
},

updateProductionItemsDisplay: function() {
    // Refresh the production items section in the UI
    const productionSection = document.querySelector('.glass-card[style*="background: linear-gradient(135deg, #f0f9ff"]');
    if (productionSection) {
        // Re-render the production items section
        const newSection = this.renderProductionItems();
        if (productionSection.parentNode) {
            productionSection.outerHTML = newSection;
        }
    }
},

  // ✅ NEW: Broadcast when sales data is loaded
    broadcastSalesLoaded() {
        if (!this.broadcaster) return;
        
        const sales = window.FarmModules.appData.sales || [];
        const today = this.getCurrentDate();
        
        // Use our own areDatesEqual method
        const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today));
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        this.broadcaster.broadcast('sales-loaded', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            totalSales: sales.length,
            todaySales: todaySales.length,
            todayRevenue: todayRevenue,
            meatSales: sales.filter(s => ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'].includes(s.product)).length
        });
    },

    // ✅ NEW: Broadcast when sale is recorded
    broadcastSaleRecorded(sale) {
        if (!this.broadcaster) return;
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const isMeatSale = meatProducts.includes(sale.product);
        
        this.broadcaster.broadcast('sale-recorded', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            saleId: sale.id,
            date: sale.date,
            product: sale.product,
            productName: this.formatProductName(sale.product),
            quantity: sale.quantity || sale.animalCount || 0,
            weight: sale.weight || 0,
            weightUnit: sale.weightUnit,
            unitPrice: sale.unitPrice,
            totalAmount: sale.totalAmount,
            customer: sale.customer || 'Walk-in',
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            isMeatSale: isMeatSale,
            productionSource: sale.productionSource || false,
            productionSourceId: sale.productionSourceId
        });
        
        // ✅ Broadcast income update for dashboard
        this.broadcaster.broadcast('income-updated', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            amount: sale.totalAmount,
            type: 'sales',
            source: 'sale-record',
            saleId: sale.id,
            product: sale.product
        });
        
        // ✅ If it's a meat sale, broadcast weight update
        if (isMeatSale && sale.weight) {
            this.broadcaster.broadcast('meat-sold', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                product: sale.product,
                weight: sale.weight,
                weightUnit: sale.weightUnit,
                animals: sale.animalCount || sale.quantity || 0,
                totalAmount: sale.totalAmount
            });
        }
        
        // ✅ Update dashboard stats
        this.broadcastSalesStats();
        
        // ✅ Also broadcast specifically for income module
        this.broadcastSalesToIncome([sale]);
    },

    // ✅ NEW: Broadcast when sale is updated
    broadcastSaleUpdated(oldSale, newSale) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('sale-updated', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            saleId: newSale.id,
            oldTotal: oldSale.totalAmount,
            newTotal: newSale.totalAmount,
            oldStatus: oldSale.paymentStatus,
            newStatus: newSale.paymentStatus,
            product: newSale.product
        });
        
        // If total amount changed, broadcast income adjustment
        if (oldSale.totalAmount !== newSale.totalAmount) {
            this.broadcaster.broadcast('income-adjusted', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                saleId: newSale.id,
                oldAmount: oldSale.totalAmount,
                newAmount: newSale.totalAmount,
                adjustment: newSale.totalAmount - oldSale.totalAmount
            });
        }
        
        // Broadcast updated sales list to income module
        const allSales = window.FarmModules.appData.sales || [];
        this.broadcastSalesToIncome(allSales);
    },

    // ✅ NEW: Broadcast when sale is deleted
    broadcastSaleDeleted(sale) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('sale-deleted', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            saleId: sale.id,
            amount: sale.totalAmount,
            product: sale.product,
            date: sale.date
        });
        
        // Broadcast income removal for dashboard
        this.broadcaster.broadcast('income-removed', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            amount: sale.totalAmount,
            type: 'sales',
            source: 'sale-record',
            saleId: sale.id
        });
        
        // If it was a meat sale, broadcast weight adjustment
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(sale.product)) {
            this.broadcaster.broadcast('meat-sale-deleted', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                weight: sale.weight || 0,
                weightUnit: sale.weightUnit,
                animals: sale.animalCount || sale.quantity || 0
            });
        }
        
        // Update dashboard stats
        this.broadcastSalesStats();
        
        // Broadcast updated sales list to income module
        const allSales = window.FarmModules.appData.sales || [];
        this.broadcastSalesToIncome(allSales);
    },

    // ✅ NEW: Broadcast sales stats for dashboard
    broadcastSalesStats() {
        if (!this.broadcaster) return;
        
        const sales = window.FarmModules.appData.sales || [];
        const today = this.getCurrentDate();
        const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today));
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        
        this.broadcaster.broadcast('sales-stats', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            totalSales: sales.length,
            todayRevenue: todayRevenue,
            todaySalesCount: todaySales.length,
            meatWeightSold: totalMeatWeight,
            animalsSold: totalAnimalsSold,
            meatSalesCount: meatSales.length
        });
    },

    // ✅ FIXED: Moved inside the module - broadcasts sales to income module
   broadcastSalesToIncome(salesData) {
    console.log('📢 Sales module broadcasting to income...');
    
    // Method 1: Use UnifiedDataService
    if (this.dataService) {
        this.dataService.broadcast('sales:updated', {
            sales: salesData,
            timestamp: new Date().toISOString()
        });
        console.log('✅ Broadcast via UnifiedDataService');
    }
    
    // Method 2: Use Data Broadcaster if available
    if (window.DataBroadcaster && typeof window.DataBroadcaster.emit === 'function') {
        window.DataBroadcaster.emit('sales:updated', {
            sales: salesData,
            timestamp: new Date().toISOString()
        });
        console.log('✅ Broadcast via Data Broadcaster');
    }
    
    // Method 3: Custom event as backup
    const event = new CustomEvent('sales-updated', {
        detail: {
            sales: salesData,
            timestamp: new Date().toISOString()
        }
    });
    window.dispatchEvent(event);
    console.log('✅ Broadcast via CustomEvent');
},

    // ✅ FIXED: Moved inside the module - saves sales and triggers broadcast
    async saveSales(salesData) {
        console.log('💾 Saving sales data...');
        
        // Your existing save code would go here
        // This is a placeholder - integrate with your actual save logic
        
        // After saving, broadcast
        this.broadcastSalesToIncome(salesData);
        
        // Also save to Firebase for income module to read
        await this.saveSalesToIncomeCollection(salesData);
        
        return true;
    },

    // ✅ FIXED: Moved inside the module - saves to income collection
    async saveSalesToIncomeCollection(salesData) {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const period = `${month}-${year}`;
        
        // Convert sales to income format
        const incomeTransactions = salesData.map(sale => ({
            id: sale.id,
            date: sale.date,
            description: `Sale: ${sale.product || sale.customer}`,
            amount: sale.total || 0,
            category: 'Sales',
            type: 'income',
            source: 'sales'
        }));
        
        // Save to income collection
        await db.collection('income').doc(user.uid).collection('transactions').doc(period).set({
            entries: incomeTransactions,
            totalAmount: incomeTransactions.reduce((sum, t) => sum + t.amount, 0),
            lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Sales also saved to income collection');
    },

    // ✅ NEW: Handle order completions from orders module
    handleOrderCompletion(orderData) {
        console.log('🔄 Converting order to sale:', orderData);
        
        // Convert order data to sale format
        const saleData = {
            id: 'ORDER-' + orderData.orderId,
            date: this.getCurrentDate(),
            customer: orderData.customerName,
            product: this.mapOrderItemToProduct(orderData.items),
            unit: 'items',
            quantity: this.calculateOrderQuantity(orderData.items),
            unitPrice: this.calculateAveragePrice(orderData),
            totalAmount: orderData.totalAmount,
            paymentMethod: 'order',
            paymentStatus: 'paid',
            notes: `From order #${orderData.orderId}`,
            orderSource: true,
            orderId: orderData.orderId
        };
        
        // Add the sale
        this.addSale(saleData);
        
        // Show notification
        this.showNotification(`Order #${orderData.orderId} converted to sale`, 'success');
    },

    // ✅ NEW: Helper to map order items to products
    mapOrderItemToProduct(items) {
        if (!items || items.length === 0) return 'other';
        
        // Simple mapping - you can expand this based on your product catalog
        const firstItem = items[0];
        const productMap = {
            'eggs': 'eggs',
            'broilers': 'broilers-live',
            'layers': 'layers'
        };
        
        return productMap[firstItem.productId] || 'other';
    },

    // ✅ NEW: Calculate order quantity
    calculateOrderQuantity(items) {
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    // ✅ NEW: Calculate average price
    calculateAveragePrice(orderData) {
        if (!orderData.items || orderData.items.length === 0) return 0;
        return orderData.totalAmount / this.calculateOrderQuantity(orderData.items);
    },

    // ✅ NEW: Update available production items when production updates
    updateAvailableProductionItems(productionData) {
        console.log('🔄 Updating available production items from broadcast');
        
        // Re-render production items section if module is currently displayed
        if (this.initialized && this.element) {
            const productionItemsSection = document.querySelector('.glass-card[style*="background: linear-gradient(135deg, #f0f9ff"]');
            if (productionItemsSection) {
                // Re-render just the production items section
                setTimeout(() => {
                    const newProductionItems = this.renderProductionItems();
                    if (productionItemsSection.parentNode) {
                        productionItemsSection.outerHTML = newProductionItems;
                    }
                }, 100);
            }
        }
    },

    // ✅ NEW: Check inventory for sales availability
    checkInventoryForSales(inventoryData) {
        if (!inventoryData || !inventoryData.items) return;
        
        // Check if we have enough inventory for common sales
        console.log('📦 Checking inventory for sales:', inventoryData.items.length, 'items');
        
        // You can add logic here to warn about low inventory for popular products
    },

    // ==================== NAVIGATION METHODS ====================

    navigateToProduction() {
        console.log('🔄 Navigating to Production module...');
        this.hideProductionItemsModal();
        
        // Clear the content area
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            this.showNotification('Content area not found', 'error');
            return;
        }
        
        // First, let's check what modules are available
        console.log('🔍 Available FarmModules:', Object.keys(window.FarmModules || {}));
        
        // Try multiple approaches in order:
        
        // APPROACH 1: If there's a main navigation system, try to trigger it
        if (window.FarmModules && window.FarmModules.showModule) {
            console.log('🚀 Using FarmModules.showModule("production")');
            window.FarmModules.showModule('production');
            return;
        }
        
        // APPROACH 2: Check if Production module exists directly
        if (window.FarmModules && window.FarmModules.Production) {
            console.log('📦 Found Production module directly');
            
            // Clear content area and initialize Production module
            contentArea.innerHTML = '';
            
            if (typeof window.FarmModules.Production.initialize === 'function') {
                window.FarmModules.Production.initialize();
            } else if (typeof window.FarmModules.Production.renderModule === 'function') {
                window.FarmModules.Production.renderModule();
            } else {
                // Try to call it as a function
                window.FarmModules.Production();
            }
            return;
        }
        
        // APPROACH 3: Check modules Map
        if (window.FarmModules && window.FarmModules.modules) {
            console.log('🗺️ Checking modules Map');
            
            // Try different module names
            const moduleNames = ['production', 'Production', 'prod', 'PRODUCTION'];
            for (const name of moduleNames) {
                if (window.FarmModules.modules.has(name)) {
                    console.log(`✅ Found module: ${name}`);
                    const ProductionModule = window.FarmModules.modules.get(name);
                    contentArea.innerHTML = '';
                    
                    if (typeof ProductionModule.initialize === 'function') {
                        ProductionModule.initialize();
                    } else if (typeof ProductionModule.renderModule === 'function') {
                        ProductionModule.renderModule();
                    }
                    return;
                }
            }
        }
        
        // APPROACH 4: Try URL hash navigation (if your app uses it)
        console.log('🌐 Trying URL hash navigation');
        window.location.hash = '#production';
        
        // Give it a moment, then check if it worked
        setTimeout(() => {
            if (window.location.hash === '#production') {
                console.log('✅ URL hash set successfully');
            } else {
                // Final fallback: Show clear instructions
                this.showNotification(
                    'Please select "Production" from the left sidebar menu', 
                    'info'
                );
                console.log('❌ Could not navigate to Production module');
            }
        }, 300);
    },

    handleProductionNavAction(action) {
        console.log('🔄 Handling production nav action:', action);
        
        switch(action) {
            case 'navigate-to-production':
                console.log('🚀 Navigating to production module...');
                this.navigateToProduction();
                break;
            case 'show-production-items':
                console.log('📦 Showing production items...');
                this.showProductionItems();
                break;
            default:
                console.warn('Unknown production nav action:', action);
        }
    },

    checkDependencies() {
        if (!window.FarmModules || !window.FarmModules.appData) {
            console.error('❌ App data not available');
            return false;
        }
        
        console.log('🔍 Checking for DateUtils at window.DateUtils:', !!window.DateUtils);
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
        }
        
        return true;
    },

    // Date methods using DateUtils
    getCurrentDate() {
        if (window.DateUtils && window.DateUtils.getToday) {
            return window.DateUtils.getToday();
        }
        
        // Fallback to local implementation
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateForInput(dateString) {
        if (!dateString) return this.getCurrentDate();
        
        if (window.DateUtils && window.DateUtils.formatDateForInput) {
            return window.DateUtils.formatDateForInput(dateString);
        }
        
        // Fallback implementation
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return this.getCurrentDate();
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDate(dateString) {
        if (window.DateUtils && window.DateUtils.formatDateForDisplay) {
            return window.DateUtils.formatDateForDisplay(dateString);
        }
        
        // Fallback implementation
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

    areDatesEqual(date1, date2) {
        // Simple string comparison for YYYY-MM-DD format
        if (!date1 || !date2) return false;
        
        const d1 = this.formatDateForInput(date1);
        const d2 = this.formatDateForInput(date2);
        return d1 === d2;
    },

    normalizeDateForStorage(dateString) {
        if (window.DateUtils && window.DateUtils.toStorageFormat) {
            return window.DateUtils.toStorageFormat(dateString);
        }
        
        // Fallback implementation
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return this.formatDateForInput(dateString);
    },

   async loadSalesData() {
    console.log('Loading sales data...');
    
    // Try UnifiedDataService first
    if (this.dataService) {
        const sales = this.dataService.get('sales') || [];
        if (sales.length > 0) {
            window.FarmModules.appData.sales = sales;
            console.log('📊 Loaded sales from UnifiedDataService:', sales.length);
            return;
        }
    }
    
    // Fallback to localStorage
    const savedData = localStorage.getItem('farm-sales-data');
    if (savedData) {
        try {
            window.FarmModules.appData.sales = JSON.parse(savedData);
            console.log('📊 Loaded sales data from localStorage:', window.FarmModules.appData.sales.length);
            
            // If we have data and UnifiedDataService is available, sync it
            if (this.dataService && window.FarmModules.appData.sales.length > 0) {
                for (const sale of window.FarmModules.appData.sales) {
                    await this.dataService.save('sales', sale);
                }
                console.log('✅ Synced local sales to UnifiedDataService');
            }
        } catch (e) {
            console.error('Error parsing sales data:', e);
            window.FarmModules.appData.sales = [];
        }
    } else {
        window.FarmModules.appData.sales = [];
    }
    console.log('📊 Final sales count:', window.FarmModules.appData.sales.length);
},

    updateSalesStats() {
    const sales = window.FarmModules.appData.sales || [];
    const today = this.getCurrentDate();
    const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today));
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
    const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
    const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
    
    const todaySalesEl = document.getElementById('today-sales');
    if (todaySalesEl) todaySalesEl.textContent = this.formatCurrency(todayRevenue);
    
    const totalMeatWeightEl = document.getElementById('total-meat-weight');
    if (totalMeatWeightEl) totalMeatWeightEl.textContent = totalMeatWeight.toFixed(2);
    
    const totalAnimalsEl = document.getElementById('total-animals');
    if (totalAnimalsEl) totalAnimalsEl.textContent = totalAnimalsSold;
    
    const totalSalesEl = document.getElementById('total-sales');
    if (totalSalesEl) totalSalesEl.textContent = sales.length;
},

    // ✅ MODIFIED: Enhanced saveData with broadcasting
    saveData() {
        localStorage.setItem('farm-sales-data', JSON.stringify(window.FarmModules.appData.sales));
        
        if (window.FarmModules.Income) {
            window.FarmModules.Income.updateFromSales();
        }
        
        // ✅ Broadcast data saved
        if (this.broadcaster) {
            this.broadcaster.broadcast('sales-data-saved', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                salesCount: window.FarmModules.appData.sales.length
            });
        }
        
        // Also broadcast to income module
        this.broadcastSalesToIncome(window.FarmModules.appData.sales);
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
            if (productSelect) productSelect.value = productValue;
            this.handleProductChange();
            
            const availableQuantity = productionData.quantity || productionData.count || 0;
            const availableWeight = productionData.totalWeight || productionData.weight || 0;
            
            const meatAnimalCountInput = document.getElementById('meat-animal-count');
            const meatWeightInput = document.getElementById('meat-weight');
            const standardQuantityInput = document.getElementById('standard-quantity');
            
            if (meatProducts.includes(productValue)) {
                if (meatAnimalCountInput) meatAnimalCountInput.value = availableQuantity;
                if (meatWeightInput) meatWeightInput.value = availableWeight;
            } else {
                if (standardQuantityInput) standardQuantityInput.value = availableQuantity;
            }
            
            this.setDefaultPrice(productValue);
        }
        
        const notesField = document.getElementById('sale-notes');
        const productionNote = `From production: ${productionData.type || productionData.product} (ID: ${productionData.id || 'N/A'})`;
        
        if (notesField) {
            if (notesField.value) {
                notesField.value += `\n${productionNote}`;
            } else {
                notesField.value = productionNote;
            }
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

    // ==================== FIXED: CSP COMPLIANT RENDER METHODS ====================

    renderProductionItems() {
        // Get production data
        const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const sales = window.FarmModules.appData.sales || [];
        
        if (productionRecords.length === 0) {
            return `
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1;">
                    <div style="text-align: center; padding: 16px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <h3 style="color: #475569; margin-bottom: 8px;">No Production Items</h3>
                        <p style="color: #64748b; margin-bottom: 16px;">Add production records to sell them here</p>
                        <button class="btn-primary production-nav-btn" data-action="navigate-to-production" 
                                style="background: #0ea5e9; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                            ➕ Go to Production Module
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Calculate available items
        const productCount = new Set(productionRecords.map(r => r.product)).size;
        const totalProduced = productionRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
        
        // Calculate sold from production
        const soldFromProduction = sales.filter(s => s.productionSource).length;
        
        return `
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h3 style="color: #0369a1; margin: 0; font-size: 18px;">🔄 Available Production Items</h3>
                        <p style="color: #0c4a6e; margin: 4px 0 0 0; font-size: 14px;">Sell directly from production records</p>
                    </div>
                    <button class="btn-primary production-nav-btn" data-action="show-production-items"
                            style="background: #0ea5e9;">
                        Sell from Production
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 16px;">
                    <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #bae6fd; text-align: center;">
                        <div style="font-size: 24px; color: #0c4a6e;">${productCount}</div>
                        <div style="font-size: 12px; color: #475569;">Product Types</div>
                    </div>
                    <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #bae6fd; text-align: center;">
                        <div style="font-size: 24px; color: #0c4a6e;">${totalProduced}</div>
                        <div style="font-size: 12px; color: #475569;">Total Produced</div>
                    </div>
                    <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #bae6fd; text-align: center;">
                        <div style="font-size: 24px; color: #0c4a6e;">${soldFromProduction}</div>
                        <div style="font-size: 12px; color: #475569;">Sold from Production</div>
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #0ea5e9;">💡</span>
                        <div style="font-size: 13px; color: #0369a1;">
                            Selling from production helps track inventory and source of goods. 
                            <a href="#" class="production-nav-btn" data-action="show-production-items" 
                               style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Browse available items →</a>
                        </div>
                    </div>
                    <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                        <button class="btn-outline production-nav-btn" data-action="navigate-to-production"
                                style="background: white; color: #0ea5e9; border: 1px solid #0ea5e9; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                            ➕ Add New Production
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    selectProductionItem(itemId) {
        console.log('🔄 Selecting production item:', itemId);
        
        // Parse the itemId to get product and date
        const [product, date] = itemId.split('-').slice(0, 2);
        
        if (!product || !date) {
            this.showNotification('Could not parse production item data', 'error');
            return;
        }
        
        // Get production records
        const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        // Find matching production records
        const matchingRecords = productionRecords.filter(record => 
            record.product === product && record.date === date
        );
        
        if (matchingRecords.length === 0) {
            this.showNotification('Production item not found', 'error');
            return;
        }
        
        // Calculate total quantity
        const totalQuantity = matchingRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        // Get existing sales to calculate sold quantity
        const existingSales = window.FarmModules.appData.sales || [];
        let soldQuantity = 0;
        
        existingSales.forEach(sale => {
            if (sale.productionSourceId === itemId || 
                (sale.product === product && sale.date === date && sale.productionSource)) {
                soldQuantity += sale.quantity || sale.animalCount || 0;
            }
        });
        
        const availableQuantity = totalQuantity - soldQuantity;
        
        if (availableQuantity <= 0) {
            this.showNotification('This production item is already sold out', 'error');
            return;
        }
        
        // Create production data object
        const productionData = {
            id: itemId,
            product: product,
            date: date,
            totalQuantity: totalQuantity,
            availableQuantity: availableQuantity,
            unit: matchingRecords[0].unit || 'units',
            notes: matchingRecords[0].notes || '',
            type: product
        };
        
        // Start sale from production
        this.startSaleFromProduction(productionData);
        
        // Close production items modal
        this.hideProductionItemsModal();
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
                                    const weightUnit = sale.weightUnit || 'kg';
                                    quantityInfo += ` • ${sale.weight} ${weightUnit}`;
                                }
                            }
                            
                            const sourceBadge = sale.productionSource 
                                ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 4px;">PROD</span>'
                                : '';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);" data-sale-id="${sale.id}">
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
                                        ${sale.weightUnit === 'lbs' ? '/lb' : sale.weightUnit ? `/${sale.weightUnit}` : sale.priceUnit === 'per-lb' ? '/lb' : '/kg'}
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary); font-size: 12px;">
                                        ${sale.productionSource ? 'Production' : 'Direct'}
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="edit-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary); font-size: 16px;" title="Edit">✏️</button>
                                            <button class="delete-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary); font-size: 16px;" title="Delete">🗑️</button>
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

    renderModule() {
        if (!this.element) return;

        const today = this.getCurrentDate();
        const sales = window.FarmModules.appData.sales || [];
        
        // Use our own areDatesEqual method
        const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today))
                               .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);

        this.element.innerHTML = `
           
<style>
/* ==================== SALE MODAL FOOTER FIX ==================== */
#sale-record-modal .popout-modal-footer {
    display: flex !important;
    gap: 12px !important;
    padding: 20px 24px !important;
    background: var(--modal-footer-bg, #f8f9fa) !important;
    border-top: 1px solid var(--modal-footer-border, #e1e5e9) !important;
}

/* Button base styles */
#sale-record-modal .popout-modal-footer .btn {
    flex: 0 0 auto !important;
    min-width: 120px !important;
    max-width: 140px !important;
    width: auto !important;
    padding: 10px 20px !important;
    height: 40px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 2px solid transparent !important;
    box-sizing: border-box !important;
    line-height: 1 !important;
}

/* Cancel button */
#sale-record-modal .popout-modal-footer .btn-outline {
    background-color: transparent !important;
    color: var(--modal-footer-text, #1a1a1a) !important;
    border-color: var(--modal-input-border, #d1d5db) !important;
}

#sale-record-modal .popout-modal-footer .btn-outline:hover {
    background-color: var(--modal-btn-text-hover, #f3f4f6) !important;
    border-color: var(--text-secondary, #666666) !important;
}

/* Delete button */
#sale-record-modal .popout-modal-footer .btn-danger {
    background: var(--gradient-danger, linear-gradient(135deg, #ef4444, #dc2626)) !important;
    color: white !important;
    border: none !important;
}

#sale-record-modal .popout-modal-footer .btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
    transform: translateY(-1px) !important;
}

/* Save button */
#sale-record-modal .popout-modal-footer .btn-primary {
    background: var(--gradient-primary, linear-gradient(135deg, #22c55e, #16a34a)) !important;
    color: white !important;
    border: none !important;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(34, 197, 94, 0.3)) !important;
}

#sale-record-modal .popout-modal-footer .btn-primary:hover {
    background: var(--gradient-primary-hover, linear-gradient(135deg, #16a34a, #15803d)) !important;
    box-shadow: var(--shadow-primary-hover, 0 6px 20px rgba(34, 197, 94, 0.4)) !important;
    transform: translateY(-1px) !important;
}

/* Desktop layout */
@media (min-width: 768px) {
    #sale-record-modal .popout-modal-footer {
        flex-direction: row !important;
        justify-content: flex-end !important;
    }
}

/* Mobile layout */
@media (max-width: 767px) {
    #sale-record-modal .popout-modal-footer {
        flex-direction: column !important;
        align-items: stretch !important;
    }
    
    #sale-record-modal .popout-modal-footer .btn {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
    }
}

.hidden {
    display: none !important;
}

/* ==================== RESPONSIVE STYLES ==================== */

/* Mobile (stacked) */
@media (max-width: 767px) {
    #sale-record-modal .popout-modal-footer {
        flex-direction: column !important;
    }
    
    #sale-record-modal .popout-modal-footer .btn {
        width: 100% !important;
    }
}

/* Tablet and Desktop (side-by-side) */
@media (min-width: 768px) {
    #sale-record-modal .popout-modal-footer {
        flex-direction: row !important;
        flex-wrap: nowrap !important;
    }
    
    #sale-record-modal .popout-modal-footer .btn {
        width: auto !important;
    }
}
</style>
                         
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
                                        <div id="meat-animal-count-container" class="hidden">
                                            <label class="form-label" for="meat-animal-count">Number of Animals *</label>
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
                                                    <option value="bird">bird</option>
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
                                            <label class="form-label" id="meat-avg-label">Average per Animal</label>
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
                        <button type="button" class="btn btn-outline" id="cancel-sale">Cancel</button>
                        <button type="button" class="btn btn-danger hidden" id="delete-sale">Delete</button>
                        <button type="button" class="btn btn-primary" id="save-sale">Save Sale</button>
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
   
    // ==================== FIXED: CSP COMPLIANT EVENT LISTENERS ====================
   setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Remove any existing event listeners first
    this.removeEventListeners();
    
    // Quick sale form
    const quickSaleForm = document.getElementById('quick-sale-form');
    if (quickSaleForm) {
        const newForm = quickSaleForm.cloneNode(true);
        quickSaleForm.parentNode.replaceChild(newForm, quickSaleForm);
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickSale();
        });
    }

    // Setup all button listeners
    this.setupButtonListeners();
    
    // Form field event listeners
    this.setupFormFieldListeners();
    
    // Quick product change
    const quickProduct = document.getElementById('quick-product');
    if (quickProduct) {
        const newProduct = quickProduct.cloneNode(true);
        quickProduct.parentNode.replaceChild(newProduct, quickProduct);
        newProduct.addEventListener('change', () => this.handleQuickProductChange());
    }

    // Filter
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
        const newFilter = periodFilter.cloneNode(true);
        periodFilter.parentNode.replaceChild(newFilter, periodFilter);
        newFilter.addEventListener('change', (e) => {
            const salesTable = document.getElementById('sales-table');
            if (salesTable) {
                salesTable.innerHTML = this.renderSalesTable(e.target.value);
            }
        });
    }

    // Handle modal close buttons - use event delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('popout-modal-close')) {
            const modal = e.target.closest('.popout-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        }
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('popout-modal')) {
            this.hideAllModals();
        }
    });

    // EVENT DELEGATION for edit/delete buttons
    document.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-sale-btn');
        if (editButton) {
            e.preventDefault();
            e.stopPropagation();
            const saleId = editButton.getAttribute('data-id');
            if (saleId) {
                console.log('✏️ Edit sale:', saleId);
                this.editSale(saleId);
            }
            return;
        }
        
        const deleteButton = e.target.closest('.delete-sale-btn');
        if (deleteButton) {
            e.preventDefault();
            e.stopPropagation();
            const saleId = deleteButton.getAttribute('data-id');
            if (saleId) {
                console.log('🗑️ Delete sale:', saleId);
                if (confirm('Are you sure you want to delete this sale?')) {
                    this.deleteSaleRecord(saleId);
                }
            }
            return;
        }
    });
    
    console.log('✅ Event listeners set up with delegation');
},
    
    // ✅ NEW METHOD: Attach direct listeners to ALL production buttons
    attachDirectProductionButtonListeners() {
        const productionBtns = document.querySelectorAll('.production-nav-btn');
        console.log(`🔍 Found ${productionBtns.length} production navigation buttons total`);
        
        productionBtns.forEach((btn, index) => {
            // Skip if already has direct listener
            if (btn.hasAttribute('data-direct-listener')) {
                return;
            }
            
            btn.setAttribute('data-direct-listener', 'true');
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = btn.getAttribute('data-action');
                console.log(`🎯 Direct listener fired for button ${index}:`, action, {
                    isInModal: !!btn.closest('.popout-modal'),
                    buttonText: btn.textContent.trim()
                });
                
                this.handleProductionNavAction(action);
            }, true); // Use capture phase to fire BEFORE other handlers
            
            console.log(`✅ Added direct listener to production button ${index}`);
        });
    },
    
  setupButtonListeners() {
    console.log('🔧 Setting up button listeners...');
    
    // Helper function to safely attach listener
    const attachListener = (id, handler, logName) => {
        const element = document.getElementById(id);
        if (element) {
            // Clone to remove existing listeners
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            newElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            });
            console.log(`✅ ${logName || id} button attached`);
            return newElement;
        } else {
            console.log(`⚠️ ${id} button not found`);
            return null;
        }
    };
    
    // Modal buttons
    attachListener('add-sale', () => this.showSaleModal(), 'Add Sale');
    attachListener('add-sale-btn', () => this.showSaleModal(), 'Add Sale Btn');
    
    // ===== CRITICAL: From Production button =====
    attachListener('from-production-btn', () => {
        console.log('🔄 From Production button clicked!');
        this.showProductionItems();
    }, 'From Production');
    
    attachListener('from-production-btn-2', () => this.showProductionItems(), 'From Production 2');
    
    // Report buttons
    attachListener('meat-sales-btn', () => this.generateMeatSalesReport(), 'Meat Sales');
    attachListener('daily-report-btn', () => this.generateDailyReport(), 'Daily Report');
    
    // Sale modal handlers
    attachListener('save-sale', () => this.saveSale(), 'Save Sale');
    attachListener('delete-sale', () => this.deleteSale(), 'Delete Sale');
    attachListener('cancel-sale', () => this.hideSaleModal(), 'Cancel Sale');
    attachListener('close-sale-modal', () => this.hideSaleModal(), 'Close Sale Modal');
    
    // Report modal handlers
    attachListener('close-daily-report', () => this.hideDailyReportModal(), 'Close Daily Report');
    attachListener('close-daily-report-btn', () => this.hideDailyReportModal(), 'Close Daily Report Btn');
    attachListener('print-daily-report', () => this.printDailyReport(), 'Print Daily Report');
    
    attachListener('close-meat-sales', () => this.hideMeatSalesModal(), 'Close Meat Sales');
    attachListener('close-meat-sales-btn', () => this.hideMeatSalesModal(), 'Close Meat Sales Btn');
    attachListener('print-meat-sales', () => this.printMeatSalesReport(), 'Print Meat Sales');
    
    // Production items modal
    attachListener('close-production-items', () => this.hideProductionItemsModal(), 'Close Production Items');
    attachListener('close-production-items-btn', () => this.hideProductionItemsModal(), 'Close Production Items Btn');
    
    // ===== ALSO handle any data-action buttons (for dynamically created content) =====
    const productionNavBtns = document.querySelectorAll('[data-action="show-production-items"], [data-action="navigate-to-production"]');
    productionNavBtns.forEach((btn, index) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = newBtn.getAttribute('data-action');
            console.log(`🔄 Production nav button ${index} clicked:`, action);
            if (action === 'show-production-items') {
                this.showProductionItems();
            } else if (action === 'navigate-to-production') {
                this.navigateToProduction();
            }
        });
        console.log(`✅ Production nav button ${index} attached`);
    });
    
    console.log('✅ All button listeners set up');
},
     
    setupProductionItemsListeners() {
        // This is called after showing production items modal to set up listeners for dynamic content
        const productionNavBtns = document.querySelectorAll('.production-nav-btn');
        productionNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.handleProductionNavAction(action);
            });
        });
        
        const sellItemBtns = document.querySelectorAll('.sell-production-item-btn');
        sellItemBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = btn.getAttribute('data-item-id');
                if (itemId) {
                    this.selectProductionItem(itemId);
                }
            });
        });
    },
    
    handleProductionNavAction(action) {
        switch(action) {
            case 'navigate-to-production':
                this.navigateToProduction();
                break;
            case 'show-production-items':
                this.showProductionItems();
                break;
            default:
                console.warn('Unknown production nav action:', action);
        }
    },

    showProductionItems() {
        console.log('🔄 Showing production items for sale...');
        this.hideAllModals();
        
        // Get production records from localStorage
        const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        // Get current sales to check what's already been sold
        const existingSales = window.FarmModules.appData.sales || [];
        
        // Filter available production items (not yet sold)
        const availableProducts = [];
        
        // Group by product and date
        const productMap = {};
        
        productionRecords.forEach(record => {
            const product = record.product || 'Unspecified';
            const date = record.date;
            const key = `${product}-${date}`;
            
            if (!productMap[key]) {
                productMap[key] = {
                    product: product,
                    date: date,
                    totalQuantity: 0,
                    unit: record.unit || 'units',
                    notes: record.notes || '',
                    soldQuantity: 0,
                    availableQuantity: 0
                };
            }
            
            productMap[key].totalQuantity += record.quantity || 0;
        });
        
        // Calculate sold quantities from existing sales
        existingSales.forEach(sale => {
            if (sale.productionSourceId || sale.productionSource) {
                const product = sale.product;
                const date = sale.date;
                const key = `${product}-${date}`;
                
                if (productMap[key]) {
                    productMap[key].soldQuantity += sale.quantity || sale.animalCount || 0;
                }
            }
        });
        
        // Calculate available quantities
        Object.keys(productMap).forEach(key => {
            const item = productMap[key];
            item.availableQuantity = item.totalQuantity - item.soldQuantity;
            
            if (item.availableQuantity > 0) {
                availableProducts.push({
                    id: key,
                    product: item.product,
                    date: item.date,
                    totalQuantity: item.totalQuantity,
                    availableQuantity: item.availableQuantity,
                    unit: item.unit,
                    notes: item.notes
                });
            }
        });
        
        // Create modal content
        let content = '<div class="production-items-list">';
        
        if (availableProducts.length === 0) {
            content += `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <h4 style="color: #374151; margin-bottom: 8px;">No production items available for sale</h4>
                    <p style="color: var(--text-secondary);">All production items have been sold or no production records exist.</p>
                    <div style="margin-top: 20px;">
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                            <button class="btn-primary production-nav-btn" data-action="navigate-to-production"
                                    style="background: #0ea5e9; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                                ➕ Go to Production Module
                            </button>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 13px; margin-top: 12px;">
                        Add new production records to sell them here
                    </p>
                </div>
            `;
        } else {
            content += `
                <div style="margin-bottom: 16px;">
                    <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                        Select a production item to create a sale from:
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            `;
            
            availableProducts.forEach((item, index) => {
                const icon = this.getProductIcon(item.product);
                const formattedDate = this.formatDate(item.date);
                const productName = this.formatProductName(item.product);
                
                content += `
                    <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="font-size: 24px; background: #e0f2fe; padding: 8px; border-radius: 8px;">
                                ${icon}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary);">${productName}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Produced: ${formattedDate}</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                            <div style="padding: 8px; background: #f0f9ff; border-radius: 6px; text-align: center;">
                                <div style="font-size: 11px; color: #0c4a6e; margin-bottom: 4px;">Total Produced</div>
                                <div style="font-weight: 600; color: #0369a1;">${item.totalQuantity} ${item.unit}</div>
                            </div>
                            <div style="padding: 8px; background: #f0fdf4; border-radius: 6px; text-align: center;">
                                <div style="font-size: 11px; color: #166534; margin-bottom: 4px;">Available</div>
                                <div style="font-weight: 600; color: #16a34a;">${item.availableQuantity} ${item.unit}</div>
                            </div>
                        </div>
                        
                        ${item.notes ? `
                            <div style="margin-bottom: 12px; padding: 8px; background: #f8fafc; border-radius: 6px;">
                                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Notes</div>
                                <div style="font-size: 12px; color: #475569;">${item.notes}</div>
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; gap: 8px;">
                            <button class="sell-production-item-btn" data-item-id="${item.id}"
                                    style="flex: 1; padding: 8px 12px; background: var(--primary-color); color: white; 
                                    border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">
                                Sell This Item
                            </button>
                        </div>
                    </div>
                `;
            });
            
            content += `
                </div>
                
                <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #0ea5e9; font-size: 16px;">💡</span>
                        <div style="font-size: 13px; color: #475569;">
                            Need more products? Add new production records.
                        </div>
                    </div>
                    <button class="btn-outline production-nav-btn" data-action="navigate-to-production"
                            style="background: white; color: #0ea5e9; border: 1px solid #0ea5e9; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        ➕ Add Production
                    </button>
                </div>
            `;
        }
        
        content += '</div>';
        
        // Update modal content
        const contentElement = document.getElementById('production-items-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        // Show modal
        const modal = document.getElementById('production-items-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Set up event listeners for the new content
        this.setupProductionItemsListeners();

        setTimeout(() => {
            this.attachDirectProductionButtonListeners();
        }, 100);
        
    },
    
    removeEventListeners() {
        // Remove direct listeners from production buttons
        const productionBtns = document.querySelectorAll('.production-nav-btn[data-direct-listener]');
        productionBtns.forEach(btn => {
            btn.removeAttribute('data-direct-listener');
            // Clone to remove all event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // This method clones elements to remove event listeners
        const elementIds = [
            'add-sale', 'add-sale-btn', 'from-production-btn', 'from-production-btn-2',
            'meat-sales-btn', 'daily-report-btn', 'save-sale', 'delete-sale',
            'cancel-sale', 'close-sale-modal', 'close-daily-report', 'close-daily-report-btn',
            'print-daily-report', 'close-meat-sales', 'close-meat-sales-btn', 'print-meat-sales',
            'close-production-items', 'close-production-items-btn', 'quick-product', 'period-filter'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
    },
   
   updateAnimalCountVisibility() {
    console.log('👀 Updating animal count visibility...');
    const weightUnit = document.getElementById('meat-weight-unit');
    const animalCountContainer = document.getElementById('meat-animal-count-container');
    const productSelect = document.getElementById('sale-product');
    
    if (!weightUnit || !animalCountContainer || !productSelect) {
        console.log('❌ Missing elements for animal count visibility');
        return;
    }
    
    const selectedProduct = productSelect.value;
    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const selectedUnit = weightUnit.value;
    
    console.log('Product:', selectedProduct, 'Unit:', selectedUnit);
    
    // SHOW animal count for:
    // 1. When unit is 'bird' (for dressed broilers)
    // 2. When product is in meatProducts AND unit is 'kg' or 'lbs' (for weight-based sales)
    const shouldShowAnimalCount = 
        selectedUnit === 'bird' || 
        (meatProducts.includes(selectedProduct) && (selectedUnit === 'kg' || selectedUnit === 'lbs'));
    
    if (shouldShowAnimalCount) {
        animalCountContainer.classList.remove('hidden');
        console.log('✅ Showing animal count');
        
        // Update the label based on product
        const animalLabelElement = document.querySelector('label[for="meat-animal-count"]');
        if (animalLabelElement) {
            let labelText = 'Number of Animals *';
            if (selectedProduct === 'broilers-dressed') {
                labelText = selectedUnit === 'bird' ? 'Number of Birds *' : 'Number of Birds *';
            } else if (selectedProduct === 'pork') {
                labelText = 'Number of Pigs *';
            } else if (selectedProduct === 'beef') {
                labelText = 'Number of Cattle *';
            } else if (selectedProduct === 'goat') {
                labelText = 'Number of Goats *';
            } else if (selectedProduct === 'lamb') {
                labelText = 'Number of Lambs *';
            } else if (selectedProduct === 'chicken-parts') {
                labelText = 'Number of Packages *';
            }
            animalLabelElement.textContent = labelText;
        }
    } else {
        animalCountContainer.classList.add('hidden');
        console.log('❌ Hiding animal count');
    }
},
    

    
    handleQuickProductChange() {
        const productSelect = document.getElementById('quick-product');
        const unitSelect = document.getElementById('quick-unit');
        const priceLabel = document.getElementById('quick-price-label');
        
        if (!productSelect || !unitSelect || !priceLabel) return;
        
        const product = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(product)) {
            if (unitSelect.value === 'kg' || unitSelect.value === 'lbs') {
                priceLabel.textContent = `Price (per ${unitSelect.value === 'lbs' ? 'lb' : 'kg'}) *`;
            } else {
                priceLabel.textContent = 'Price *';
            }
        } else {
            priceLabel.textContent = 'Price *';
        }
        
        this.setQuickDefaultPrice(product);
    },

    setQuickDefaultPrice(product) {
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
            'honey': 8.00,
            'cheese': 6.00,
            'yogurt': 3.50,
            'butter': 4.50,
            'jam': 5.00,
            'bread': 2.75
        };
        
        if (defaultPrices[product]) {
            const priceInput = document.getElementById('quick-price');
            if (priceInput) {
                priceInput.value = defaultPrices[product];
            }
        }
    },

  handleProductChange() {
    console.log('🔵 handleProductChange() executing...');
   
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
        // Show meat section, hide standard section
        if (meatSection) meatSection.style.display = 'block';
        if (meatSummary) meatSummary.style.display = 'block';
        if (standardSection) standardSection.style.display = 'none';
        if (standardSummary) standardSummary.style.display = 'none';
        
        const weightUnit = document.getElementById('meat-weight-unit');
        const animalCountContainer = document.getElementById('meat-animal-count-container');
        
        if (weightUnit) {
            // Store the current value to preserve selection if possible
            const currentValue = weightUnit.value;
            
            // Clear and rebuild options based on product
            weightUnit.innerHTML = '';
            
            if (selectedValue === 'broilers-dressed') {
                // Dressed birds: bird, kg, lbs (kg as default)
                weightUnit.innerHTML = `
                    <option value="bird">bird</option>
                    <option value="kg" selected>kg</option>
                    <option value="lbs">lbs</option>
                `;
                // Show animal count field (for bird unit)
                if (animalCountContainer) {
                    animalCountContainer.classList.remove('hidden');
                }
            } else {
                // Other meat: kg, lbs only (kg as default)
                weightUnit.innerHTML = `
                    <option value="kg" selected>kg</option>
                    <option value="lbs">lbs</option>
                `;
                // Hide animal count for other meats
                if (animalCountContainer) {
                    animalCountContainer.classList.add('hidden');
                }
            }
            
            // If there was a previous valid selection, use it (overrides default)
            if (currentValue && (currentValue === 'bird' || currentValue === 'kg' || currentValue === 'lbs')) {
                // Check if this value exists in the current options
                const optionExists = Array.from(weightUnit.options).some(opt => opt.value === currentValue);
                if (optionExists) {
                    weightUnit.value = currentValue;
                }
            }
            
            // Force trigger the change event to update labels
            const changeEvent = new Event('change', { bubbles: true });
            weightUnit.dispatchEvent(changeEvent);
            
            console.log('Weight unit dropdown rebuilt, default: kg, selected:', weightUnit.value);
        }
        
        // Set default price
        if (selectedValue === 'broilers-dressed') {
            const priceInput = document.getElementById('meat-price');
            if (priceInput && !priceInput.value) {
                priceInput.value = 5.50; // Default price per kg
            }
        }
    } else {
        // Show standard section, hide meat section
        if (meatSection) meatSection.style.display = 'none';
        if (meatSummary) meatSummary.style.display = 'none';
        if (standardSection) standardSection.style.display = 'block';
        if (standardSummary) standardSummary.style.display = 'block';
        
        this.updateStandardPriceLabel();
        
        // Clear meat fields
        const meatAnimalCount = document.getElementById('meat-animal-count');
        const meatWeight = document.getElementById('meat-weight');
        const meatPrice = document.getElementById('meat-price');
        if (meatAnimalCount) meatAnimalCount.value = '';
        if (meatWeight) meatWeight.value = '';
        if (meatPrice) meatPrice.value = '';
    }
    
    this.calculateSaleTotal();
},
    
    // Add this helper method
    updateAnimalCountVisibility() {
        const weightUnit = document.getElementById('meat-weight-unit');
        const animalCountContainer = document.getElementById('meat-animal-count-container');
        const productSelect = document.getElementById('sale-product');
        
        if (!weightUnit || !animalCountContainer || !productSelect) return;
        
        const selectedValue = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        // Only show animal count for 'bird' unit AND meat products
        if (weightUnit.value === 'bird' && meatProducts.includes(selectedValue)) {
            animalCountContainer.classList.remove('hidden');
            console.log('✅ Showing animal count for bird unit');
        } else {
            animalCountContainer.classList.add('hidden');
            console.log('❌ Hiding animal count for non-bird unit');
        }
    },
    
    // Update updateMeatLabels() to handle all three units properly
updateMeatLabels() {
    console.log('🏷️ updateMeatLabels() called');
    
    const weightUnit = document.getElementById('meat-weight-unit');
    if (!weightUnit) {
        console.error('❌ Weight unit element not found');
        return;
    }
    
    const unit = weightUnit.value;
    console.log('Current unit selected:', unit);
    
    // DIRECTLY update the price label by ID
    const priceLabelById = document.getElementById('meat-price-label');
    if (priceLabelById) {
        let newText = '';
        if (unit === 'bird') {
            newText = 'Price per Bird *';
        } else if (unit === 'kg') {
            newText = 'Price per kg *';
        } else if (unit === 'lbs') {
            newText = 'Price per lb *';
        }
        priceLabelById.textContent = newText;
        console.log('Price label set to:', newText);
    }
    
    // Update the price unit label
    const priceUnitLabel = document.getElementById('meat-price-unit-label');
    if (priceUnitLabel) {
        if (unit === 'bird') {
            priceUnitLabel.textContent = 'per bird';
        } else if (unit === 'kg') {
            priceUnitLabel.textContent = 'per kg';
        } else if (unit === 'lbs') {
            priceUnitLabel.textContent = 'per lb';
        }
    }
    
    // Update weight label if it exists
    const weightLabel = document.getElementById('meat-weight-label');
    if (weightLabel) {
        if (unit === 'bird') {
            weightLabel.textContent = 'Number of Birds *';
        } else if (unit === 'kg') {
            weightLabel.textContent = 'Total Weight (kg) *';
        } else if (unit === 'lbs') {
            weightLabel.textContent = 'Total Weight (lbs) *';
        }
    }
    
    // Update weight hint
    const weightHint = document.getElementById('meat-weight-hint');
    if (weightHint) {
        if (unit === 'bird') {
            weightHint.textContent = 'Number of birds being sold';
        } else if (unit === 'kg') {
            weightHint.textContent = 'Total weight in kilograms';
        } else if (unit === 'lbs') {
            weightHint.textContent = 'Total weight in pounds';
        }
    }
    
    // Force calculation update
    if (typeof this.calculateSaleTotal === 'function') {
        this.calculateSaleTotal();
    }
},
    
    // Update setupFormFieldListeners() to handle weight unit changes
  setupFormFieldListeners() {
    console.log('🔧 Setting up form field listeners for meat UI...');
    
    // Product change
    const productSelect = document.getElementById('sale-product');
    if (productSelect) {
        productSelect.addEventListener('change', () => {
            console.log('🔄 Product changed:', productSelect.value);
            this.handleProductChange();
        });
    }

    // Weight unit change - THIS IS CRITICAL FOR LABEL UPDATES
    const weightUnit = document.getElementById('meat-weight-unit');
    if (weightUnit) {
        // Remove existing listeners by cloning
        const newWeightUnit = weightUnit.cloneNode(true);
        weightUnit.parentNode.replaceChild(newWeightUnit, weightUnit);
        
        // Add new listener
        newWeightUnit.addEventListener('change', (e) => {
            console.log('📏 Weight unit changed to:', e.target.value);
            this.updateMeatLabels();  // Update all labels
            this.updateAnimalCountVisibility();  // Update visibility
            this.calculateSaleTotal();  // Recalculate total
        });
    }
    
    // Real-time total calculation for all fields
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
    
    // Unit change for standard products
    const unitSelect = document.getElementById('sale-unit');
    if (unitSelect) {
        unitSelect.addEventListener('change', () => {
            this.updateStandardPriceLabel();
            this.calculateSaleTotal();
        });
    }
    
    console.log('✅ Form field listeners set up');
},
    
    updateStandardPriceLabel() {
        const unitSelect = document.getElementById('sale-unit');
        const productSelect = document.getElementById('sale-product');
        const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
        
        if (!unitSelect || !standardPriceUnitLabel || !productSelect) return;
        
        const unit = unitSelect.value;
        const product = productSelect.value;
        
        let labelText = 'per unit';
        const unitLabels = {
            'kg': 'per kg',
            'lbs': 'per lb',
            'birds': 'per bird',
            'animals': 'per animal',
            'dozen': 'per dozen',
            'liters': 'per liter',
            'pieces': 'per piece',
            'case': 'per case',
            'crate': 'per crate',
            'bag': 'per bag',
            'bottle': 'per bottle',
            'jar': 'per jar'
        };
        
        if (unit === 'birds') {
            if (product.includes('chicks')) labelText = 'per chick';
            else if (product.includes('layers')) labelText = 'per layer';
            else if (product.includes('broilers')) labelText = 'per bird';
            else labelText = 'per bird';
        } else if (unit === 'animals') {
            if (product === 'pork') labelText = 'per pig';
            else if (product === 'beef') labelText = 'per head';
            else if (product === 'goat') labelText = 'per goat';
            else if (product === 'lamb') labelText = 'per lamb';
            else labelText = 'per animal';
        } else if (unitLabels[unit]) {
            labelText = unitLabels[unit];
        }
        
        standardPriceUnitLabel.textContent = labelText;
    },

  calculateSaleTotal() {
    console.log('💰 calculateSaleTotal() called');
    
    const productSelect = document.getElementById('sale-product');
    if (!productSelect) return;
    
    const product = productSelect.value;
    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    
    let total = 0;
    
    if (meatProducts.includes(product)) {
        const weightInput = document.getElementById('meat-weight');
        const weightUnitSelect = document.getElementById('meat-weight-unit');
        const priceInput = document.getElementById('meat-price');
        
        const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
        const unit = weightUnitSelect ? weightUnitSelect.value : 'kg';
        const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;
        
        console.log('Meat calculation - Unit:', unit, 'Weight:', weight, 'Price:', price);
        
        if (unit === 'bird') {
            // For bird unit: total = number of birds × price per bird
            total = weight * price;
            console.log('Bird calculation:', weight, 'birds ×', price, '= $' + total);
        } else {
            // For kg/lbs: total = weight × price per kg/lb
            total = weight * price;
            console.log('Weight calculation:', weight, unit, '×', price, '= $' + total);
        }
        
        // Update the summary
        const meatSummary = document.getElementById('meat-summary-info');
        if (meatSummary) {
            if (unit === 'bird') {
                meatSummary.textContent = `${weight} bird${weight !== 1 ? 's' : ''} • $${price} per bird • $${total.toFixed(2)} total`;
            } else {
                meatSummary.textContent = `${weight.toFixed(2)} ${unit} • $${price} per ${unit} • $${total.toFixed(2)} total`;
            }
        }
        
        // Update average calculations
        const animalCountInput = document.getElementById('meat-animal-count');
        const animalCount = animalCountInput ? parseFloat(animalCountInput.value) || 0 : 0;
        
        const avgWeightElement = document.getElementById('meat-avg-weight');
        const avgValueElement = document.getElementById('meat-avg-value');
        
        if (avgWeightElement && avgValueElement) {
            if (unit === 'bird') {
                // For bird unit, each bird is one unit
                const birds = weight;
                avgWeightElement.textContent = `${birds} bird${birds !== 1 ? 's' : ''}/sale`;
                avgValueElement.textContent = `$${price.toFixed(2)}/bird`;
            } else if (animalCount > 0) {
                // For weight-based with animal count
                const avgWeight = weight / animalCount;
                const avgValue = total / animalCount;
                avgWeightElement.textContent = `${avgWeight.toFixed(2)} ${unit}/animal`;
                avgValueElement.textContent = `$${avgValue.toFixed(2)}/animal`;
            } else {
                avgWeightElement.textContent = `0.00 ${unit}/animal`;
                avgValueElement.textContent = `$0.00/animal`;
            }
        }
        
    } else {
        // Standard products (non-meat)
        const quantityInput = document.getElementById('standard-quantity');
        const priceInput = document.getElementById('standard-price');
        const unitSelect = document.getElementById('sale-unit');
        
        const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
        const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;
        const unit = unitSelect ? unitSelect.value || 'unit' : 'unit';
        
        total = quantity * price;
        
        const standardSummary = document.getElementById('standard-summary-info');
        if (standardSummary) {
            standardSummary.textContent = `${quantity} ${unit} at $${price}/${unit} = $${total.toFixed(2)}`;
        }
    }
    
    const totalElement = document.getElementById('sale-total-amount');
    if (totalElement) {
        totalElement.textContent = this.formatCurrency(total);
    }
    
    console.log('Total calculated:', total);
},
       
    getUnitDisplayName(unit, product) {
        const unitDisplayMap = {
            'kg': 'kg',
            'lbs': 'lbs',
            'birds': product === 'chicks' ? 'chicks' : product === 'layers' ? 'layers' : 'birds',
            'animals': this.getAnimalDisplayName(product),
            'pieces': 'pieces',
            'dozen': 'dozen',
            'liters': 'liters',
            'case': 'cases',
            'crate': 'crates',
            'bag': 'bags',
            'bottle': 'bottles',
            'jar': 'jars'
        };
        
        return unitDisplayMap[unit] || unit;
    },

    getAnimalDisplayName(product) {
        const animalMap = {
            'pork': 'pigs',
            'beef': 'cattle',
            'goat': 'goats',
            'lamb': 'lambs',
            'broilers-dressed': 'birds',
            'broilers-live': 'birds',
            'chicken-parts': 'packages'
        };
        
        return animalMap[product] || 'animals';
    },

    getPriceUnitLabel(unit, product) {
        const priceUnitMap = {
            'kg': '/kg',
            'lbs': '/lb',
            'birds': product === 'chicks' ? '/chick' : '/bird',
            'animals': this.getPerAnimalLabel(product),
            'dozen': '/dozen',
            'liters': '/liter',
            'pieces': '/piece',
            'case': '/case',
            'crate': '/crate',
            'bag': '/bag',
            'bottle': '/bottle',
            'jar': '/jar'
        };
        
        return priceUnitMap[unit] || '/unit';
    },

    getPerAnimalLabel(product) {
        const animalLabelMap = {
            'pork': '/pig',
            'beef': '/head',
            'goat': '/goat',
            'lamb': '/lamb',
            'broilers-dressed': '/bird',
            'broilers-live': '/bird'
        };
        
        return animalLabelMap[product] || '/animal';
    },

    handleQuickProductChange() {
        const productSelect = document.getElementById('quick-product');
        const unitSelect = document.getElementById('quick-unit');
        const priceLabel = document.getElementById('quick-price-label');
        
        if (!productSelect || !unitSelect || !priceLabel) return;
        
        const product = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(product)) {
            if (unitSelect.value === 'kg' || unitSelect.value === 'lbs') {
                priceLabel.textContent = `Price (per ${unitSelect.value === 'lbs' ? 'lb' : 'kg'}) *`;
            } else {
                priceLabel.textContent = 'Price *';
            }
        } else {
            priceLabel.textContent = 'Price *';
        }
        
        this.setQuickDefaultPrice(product);
    },

    setQuickDefaultPrice(product) {
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
            'honey': 8.00,
            'cheese': 6.00,
            'yogurt': 3.50,
            'butter': 4.50,
            'jam': 5.00,
            'bread': 2.75
        };
        
        if (defaultPrices[product]) {
            const priceInput = document.getElementById('quick-price');
            if (priceInput) {
                priceInput.value = defaultPrices[product];
            }
        }
    },

    showSaleModal() {
    this.hideAllModals();
    const modal = document.getElementById('sale-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    const dateInput = document.getElementById('sale-date');
    if (dateInput) {
        dateInput.value = this.getCurrentDate();
    }
    
    // Don't reset the entire form - it clears event listeners
    const form = document.getElementById('sale-form');
    if (form) {
        // Clear values manually instead of form.reset()
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'submit' && input.type !== 'button') {
                input.value = '';
            }
        });
    }
    
    const saleModalTitle = document.getElementById('sale-modal-title');
    if (saleModalTitle) saleModalTitle.textContent = 'Record Sale';
    
    const deleteSaleBtn = document.getElementById('delete-sale');
    if (deleteSaleBtn) deleteSaleBtn.classList.add('hidden');
    
    const productionSourceNotice = document.getElementById('production-source-notice');
    if (productionSourceNotice) productionSourceNotice.classList.add('hidden');
    
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
    
    const unitSelect = document.getElementById('sale-unit');
    if (unitSelect) unitSelect.value = '';
    
    // DEFAULT TO 'bird' FOR MEAT PRODUCTS
    const weightUnit = document.getElementById('meat-weight-unit');
    if (weightUnit) {
        if (this.pendingProductionSale && this.pendingProductionSale.type === 'meat') {
            weightUnit.value = 'bird';
        } else {
            weightUnit.value = 'kg';
        }
    }
    
    const paymentMethod = document.getElementById('sale-payment');
    if (paymentMethod) paymentMethod.value = 'cash';
    
    const paymentStatus = document.getElementById('sale-status');
    if (paymentStatus) paymentStatus.value = 'paid';
    
    // Clear any previous sale ID for new sale
    this.currentSaleId = null;
    
    if (this.pendingProductionSale) {
        this.prefillFromProduction(this.pendingProductionSale);
        this.showProductionSourceNotice();
    } else {
        const productSelect = document.getElementById('sale-product');
        if (productSelect) productSelect.value = '';
    }
    
    // ========== ADD THIS SECTION ==========
    // Force attach the weight unit change listener directly
    setTimeout(() => {
        const weightUnitDropdown = document.getElementById('meat-weight-unit');
        if (weightUnitDropdown) {
            console.log('🎯 Attaching weight unit change listener...');
            
            // Remove any existing listeners by cloning
            const newWeightUnit = weightUnitDropdown.cloneNode(true);
            weightUnitDropdown.parentNode.replaceChild(newWeightUnit, weightUnitDropdown);
            
            // Add the change event
            newWeightUnit.addEventListener('change', (e) => {
                console.log('🔄 UNIT CHANGED TO:', e.target.value);
                this.updateMeatLabels();
                this.updateAnimalCountVisibility();
                this.calculateSaleTotal();
            });
            
            // Also add click event for debugging
            newWeightUnit.addEventListener('click', () => {
                console.log('👆 Unit dropdown clicked');
            });
            
            // Initial label update
            setTimeout(() => {
                this.updateMeatLabels();
                
            }, 100);
        } else {
            console.error('❌ Weight unit dropdown not found!');
        }
        
        // Force trigger product change to update UI
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Re-attach all form field listeners
        this.setupFormFieldListeners();
        
        // Update calculations
        this.calculateSaleTotal();
        
        console.log('✅ Sale modal initialized with unit listener');
    }, 100);
},

    showProductionSourceNotice() {
        if (!this.pendingProductionSale) return;
        
        const noticeElement = document.getElementById('production-source-notice');
        const infoElement = document.getElementById('production-source-info');
        
        if (noticeElement && infoElement) {
            noticeElement.classList.remove('hidden'); // FIXED: Using classList
            infoElement.textContent = `${this.pendingProductionSale.type || this.pendingProductionSale.product} • ${this.pendingProductionSale.quantity || this.pendingProductionSale.count || 0} units`;
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

    hideDailyReportModal() {
        const modal = document.getElementById('daily-report-modal');
        if (modal) {
            modal.classList.add('hidden');
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
                errors.push('Price per kg must be greater than 0');
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
        const productSelect = document.getElementById('quick-product');
        const quantityInput = document.getElementById('quick-quantity');
        const priceInput = document.getElementById('quick-price');
        
        const product = productSelect ? productSelect.value : '';
        const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
        const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const today = this.getCurrentDate();

        const saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            quantity: quantity,
            unit: 'units',
            unitPrice: price,
            totalAmount: quantity * price,
            date: today,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            customer: 'Walk-in'
        };

        this.addSale(saleData);
        
        const form = document.getElementById('quick-sale-form');
        if (form) {
            form.reset();
        }
        this.showNotification('Sale recorded successfully!', 'success');
    },

    // ==================== SAVE SALE WITH INVENTORY & PRODUCTION UPDATES ====================
   async saveSale() {
    const saleIdInput = document.getElementById('sale-id');
    const dateInput = document.getElementById('sale-date');
    const customerInput = document.getElementById('sale-customer');
    const productSelect = document.getElementById('sale-product');
    const unitSelect = document.getElementById('sale-unit');
    const paymentMethodSelect = document.getElementById('sale-payment');
    const paymentStatusSelect = document.getElementById('sale-status');
    const notesInput = document.getElementById('sale-notes');

    const saleId = saleIdInput ? saleIdInput.value : '';
    let date = dateInput ? dateInput.value : '';
    const customer = customerInput ? customerInput.value : '';
    const product = productSelect ? productSelect.value : '';
    const unit = unitSelect ? unitSelect.value : '';
    const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : '';
    const paymentStatus = paymentStatusSelect ? paymentStatusSelect.value : '';
    const notes = notesInput ? notesInput.value : '';

    if (!date || !product || !unit || !paymentMethod) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Use our normalizeDateForStorage method
    date = this.normalizeDateForStorage(date);

    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const isMeatProduct = meatProducts.includes(product);

    let saleData;
    
    if (isMeatProduct) {
        const animalCountInput = document.getElementById('meat-animal-count');
        const weightInput = document.getElementById('meat-weight');
        const weightUnitSelect = document.getElementById('meat-weight-unit');
        const priceInput = document.getElementById('meat-price');
        
        const animalCount = animalCountInput ? parseInt(animalCountInput.value) || 0 : 0;
        const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
        const weightUnit = weightUnitSelect ? weightUnitSelect.value : 'kg';
        const unitPrice = priceInput ? parseFloat(priceInput.value) || 0 : 0;
        
        let totalAmount;
        let priceUnit;
        
        // Calculate based on weight unit
        if (weightUnit === 'bird') {
            totalAmount = weight * unitPrice;
            priceUnit = 'per-bird';
            
            if (animalCountInput && weight > 0 && animalCount === 0) {
                animalCountInput.value = weight;
            }
        } else if (weightUnit === 'lbs') {
            totalAmount = weight * unitPrice;
            priceUnit = 'per-lb';
        } else {
            totalAmount = weight * unitPrice;
            priceUnit = 'per-kg';
        }
        
        const effectiveAnimalCount = weightUnit === 'bird' ? weight : (animalCount > 0 ? animalCount : 1);
        const avgWeightPerAnimal = weightUnit === 'bird' ? 1 : (effectiveAnimalCount > 0 ? weight / effectiveAnimalCount : 0);
        const avgValuePerAnimal = effectiveAnimalCount > 0 ? totalAmount / effectiveAnimalCount : 0;
        
        saleData = {
            id: saleId || 'SALE-' + Date.now().toString().slice(-6),
            date: date,
            customer: customer || 'Walk-in',
            product: product,
            unit: unit,
            quantity: effectiveAnimalCount,
            unitPrice: unitPrice,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus || 'paid',
            notes: notes,
            weight: weight,
            weightUnit: weightUnit,
            animalCount: effectiveAnimalCount,
            originalAnimalCount: animalCount,
            priceUnit: priceUnit,
            avgWeightPerAnimal: avgWeightPerAnimal,
            avgValuePerAnimal: avgValuePerAnimal
        };
    } else {
        const quantityInput = document.getElementById('standard-quantity');
        const priceInput = document.getElementById('standard-price');
        
        const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
        const unitPrice = priceInput ? parseFloat(priceInput.value) || 0 : 0;
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
            paymentStatus: paymentStatus || 'paid',
            notes: notes
        };
    }

    if (this.pendingProductionSale) {
        saleData.productionSource = true;
        saleData.productionSourceId = this.pendingProductionSale.id;
        this.updateProductionAfterSale(this.pendingProductionSale.id, saleData);
    }

    const validation = this.validateSaleData(saleData);
    if (!validation.isValid) {
        this.showNotification(validation.errors.join(', '), 'error');
        return;
    }

    let isNewSale = false;
    let oldSale = null;

    if (saleId) {
        // Update existing sale
        oldSale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        const index = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
        if (index !== -1) {
            window.FarmModules.appData.sales[index] = saleData;
            
            if (oldSale) {
                this.broadcastSaleUpdated(oldSale, saleData);
            }
            
            this.showNotification('Sale updated successfully!', 'success');
        }
    } else {
        // Add new sale
        isNewSale = true;
        window.FarmModules.appData.sales.push(saleData);
        
        this.broadcastSaleRecorded(saleData);
        this.showNotification('Sale recorded successfully!', 'success');
    }

    // ===== SAVE TO UNIFIED DATA SERVICE =====
    if (this.dataService) {
        const result = await this.dataService.save('sales', saleData);
        if (result.offline) {
            console.log('📱 Sale saved locally (will sync when online)');
        } else {
            console.log('✅ Sale saved to UnifiedDataService');
        }
    }

    // ===== UPDATE INVENTORY FROM SALE =====
    this.updateInventoryFromSale(saleData);
    
    // ===== UPDATE PRODUCTION FROM SALE =====
    this.updateProductionFromSale(saleData);

    // ===== CREATE INCOME TRANSACTION =====
    const incomeTransaction = {
        id: Date.now(),
        date: saleData.date,
        type: 'income',
        category: 'sales',
        amount: saleData.totalAmount,
        description: `Sale: ${this.formatProductName(saleData.product)} - ${saleData.customer || 'Walk-in'}`,
        paymentMethod: saleData.paymentMethod,
        reference: saleData.id,
        notes: saleData.notes || '',
        source: 'sales-module',
        saleId: saleData.id
    };

    // Method 1: Save to UnifiedDataService (Income module will pick it up)
    if (this.dataService) {
        await this.dataService.save('transactions', incomeTransaction);
        console.log('✅ Income transaction saved to UnifiedDataService');
    }

    // Method 2: Direct update if income module is accessible (legacy)
    if (window.IncomeExpensesModule && !this.dataService) {
        console.log('💰 Directly updating IncomeExpensesModule');
        if (!window.IncomeExpensesModule.transactions) {
            window.IncomeExpensesModule.transactions = [];
        }
        window.IncomeExpensesModule.transactions.unshift(incomeTransaction);
        window.IncomeExpensesModule.saveData();
        
        if (window.FarmModules.currentModule === 'income-expenses') {
            window.IncomeExpensesModule.renderModule();
        }
    }

    // Method 3: Broadcast via Custom Event
    const saleCompletedEvent = new CustomEvent('sale-completed', {
        detail: {
            orderId: saleData.id,
            amount: saleData.totalAmount,
            date: saleData.date,
            description: `Sale: ${this.formatProductName(saleData.product)}`,
            customerName: saleData.customer || 'Walk-in',
            paymentMethod: saleData.paymentMethod,
            product: saleData.product,
            quantity: saleData.quantity,
            unitPrice: saleData.unitPrice
        }
    });
    window.dispatchEvent(saleCompletedEvent);
    console.log('📢 Dispatched sale-completed event');

    // Method 4: Use DataBroadcaster if available
    if (window.DataBroadcaster && typeof window.DataBroadcaster.emit === 'function') {
        window.DataBroadcaster.emit('sale-completed', {
            orderId: saleData.id,
            amount: saleData.totalAmount,
            date: saleData.date,
            description: `Sale: ${this.formatProductName(saleData.product)}`,
            customerName: saleData.customer || 'Walk-in',
            paymentMethod: saleData.paymentMethod,
            product: saleData.product,
            quantity: saleData.quantity
        });
        console.log('📢 Broadcast via DataBroadcaster');
    }

    // ===== UPDATE DASHBOARD =====
    if (window.dashboardModule && typeof window.dashboardModule.updateStats === 'function') {
        window.dashboardModule.updateStats();
    }

    // Trigger dashboard refresh via event
    const dashboardEvent = new CustomEvent('dashboard-update', {
        detail: {
            type: 'sale',
            amount: saleData.totalAmount,
            timestamp: new Date().toISOString()
        }
    });
    window.dispatchEvent(dashboardEvent);

    this.saveData();
    this.renderModule();
    this.hideSaleModal();
    this.pendingProductionSale = null;

    console.log('✅ Sale saved and communicated to all modules:', {
        sale: saleData,
        isNew: isNewSale,
        incomeTransaction: incomeTransaction
    });
},
    
    // ===== UPDATE INVENTORY FROM SALE WITH FIREBASE =====
    updateInventoryFromSale(saleData) {
        console.log('📦 Updating inventory from sale:', saleData);
        
        // Skip if no product
        if (!saleData.product) return;
        
        // Calculate quantity sold
        const soldQty = saleData.quantity || saleData.animalCount || 0;
        if (soldQty <= 0) return;
        
        // ===== UPDATE INVENTORY MODULE =====
        if (window.InventoryModule) {
            if (!window.InventoryModule.inventory) {
                window.InventoryModule.inventory = [];
            }
            
            // Find matching inventory item
            const productLower = saleData.product.toLowerCase();
            const inventoryItem = window.InventoryModule.inventory.find(item => 
                item.name?.toLowerCase().includes(productLower) ||
                item.category?.toLowerCase().includes(productLower) ||
                (productLower.includes('bird') && item.name?.toLowerCase().includes('bird'))
            );
            
            if (inventoryItem) {
                // Subtract from inventory
                const oldQty = inventoryItem.quantity || 0;
                inventoryItem.quantity = Math.max(0, oldQty - soldQty);
                
                // Save inventory module
                if (typeof window.InventoryModule.saveData === 'function') {
                    window.InventoryModule.saveData();
                }
                
                console.log(`✅ InventoryModule updated: ${inventoryItem.name} from ${oldQty} to ${inventoryItem.quantity}`);
            }
        }
        
        // ===== UPDATE FARM DATA =====
        if (window.FarmData && window.FarmData.inventory) {
            const productLower = saleData.product.toLowerCase();
            const farmDataItem = window.FarmData.inventory.find(item => 
                item.name?.toLowerCase().includes(productLower) ||
                item.category?.toLowerCase().includes(productLower)
            );
            
            if (farmDataItem) {
                farmDataItem.quantity = Math.max(0, (farmDataItem.quantity || 0) - soldQty);
                console.log(`✅ FarmData inventory updated: ${farmDataItem.name} now ${farmDataItem.quantity}`);
            }
        }
        
        // ===== UPDATE LOCALSTORAGE =====
        this.updateInventoryLocalStorage(saleData.product, soldQty);
        
        // ===== UPDATE FIREBASE =====
        this.updateInventoryFirebase(saleData.product, soldQty);
    },

    // ===== UPDATE FIREBASE INVENTORY =====
    async updateInventoryFirebase(product, soldQty) {
        console.log('☁️ Updating Firebase inventory...');
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.log('⚠️ No user logged in, skipping Firebase update');
                return;
            }
            
            // Get current inventory from Firebase
            const inventoryRef = db.collection('inventory').doc(user.uid);
            const inventoryDoc = await inventoryRef.get();
            
            if (inventoryDoc.exists) {
                const data = inventoryDoc.data();
                let inventory = data.items || data.inventory || [];
                
                // Find matching item
                const productLower = product.toLowerCase();
                let updated = false;
                
                inventory = inventory.map(item => {
                    if (item.name?.toLowerCase().includes(productLower) ||
                        item.category?.toLowerCase().includes(productLower)) {
                        const oldQty = item.quantity || 0;
                        item.quantity = Math.max(0, oldQty - soldQty);
                        updated = true;
                        console.log(`✅ Firebase inventory: ${item.name} from ${oldQty} to ${item.quantity}`);
                    }
                    return item;
                });
                
                if (updated) {
                    // Save back to Firebase
                    await inventoryRef.set({
                        items: inventory,
                        lastUpdated: new Date().toISOString(),
                        userId: user.uid
                    }, { merge: true });
                    
                    console.log('✅ Firebase inventory updated successfully');
                } else {
                    console.log('ℹ️ No matching inventory item found in Firebase');
                }
            }
        } catch (error) {
            console.error('❌ Error updating Firebase inventory:', error);
        }
    },

    // ===== UPDATE PRODUCTION FROM SALE =====
    updateProductionFromSale(saleData) {
        console.log('🚜 Updating production from sale:', saleData);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        // Only update production for meat products
        if (!meatProducts.includes(saleData.product)) {
            console.log('ℹ️ Not a meat product, skipping production update');
            return;
        }
        
        const soldQty = saleData.animalCount || saleData.quantity || 0;
        if (soldQty <= 0) return;
        
        // Update ProductionModule
        if (window.ProductionModule) {
            if (!window.ProductionModule.productionRecords) {
                window.ProductionModule.productionRecords = [];
            }
            
            // Find production records for this product (FIFO - sell oldest first)
            const productRecords = window.ProductionModule.productionRecords
                .filter(r => r.product === saleData.product && !r.fullySold)
                .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            
            let remainingToSell = soldQty;
            
            for (const record of productRecords) {
                if (remainingToSell <= 0) break;
                
                const available = record.quantity || 0;
                const soldSoFar = record.sold || 0;
                const canSell = available - soldSoFar;
                
                if (canSell > 0) {
                    const sellNow = Math.min(canSell, remainingToSell);
                    record.sold = (record.sold || 0) + sellNow;
                    remainingToSell -= sellNow;
                    
                    if (record.sold >= available) {
                        record.fullySold = true;
                    }
                    
                    console.log(`✅ Production record ${record.id}: sold ${sellNow}, remaining to sell: ${remainingToSell}`);
                }
            }
            
            // Save production records
            if (typeof window.ProductionModule.saveData === 'function') {
                window.ProductionModule.saveData();
            }
            
            if (remainingToSell > 0) {
                console.log(`⚠️ Could only sell ${soldQty - remainingToSell} of ${soldQty} from production records`);
            } else {
                console.log(`✅ All ${soldQty} units matched with production records`);
            }
        }
        
        // Update FarmData
        if (window.FarmData && window.FarmData.production) {
            // Similar logic for FarmData
            const records = [...window.FarmData.production]
                .filter(r => r.product === saleData.product && !r.fullySold)
                .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            
            let remaining = soldQty;
            
            for (const record of records) {
                if (remaining <= 0) break;
                
                const available = record.quantity || 0;
                const soldSoFar = record.sold || 0;
                const canSell = available - soldSoFar;
                
                if (canSell > 0) {
                    const sellNow = Math.min(canSell, remaining);
                    record.sold = (record.sold || 0) + sellNow;
                    remaining -= sellNow;
                }
            }
        }
        
        // ===== UPDATE PRODUCTION IN FIREBASE =====
        this.updateProductionFirebase(saleData.product, soldQty);
    },

    // ===== UPDATE PRODUCTION IN FIREBASE =====
    async updateProductionFirebase(product, soldQty) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;
            
            const productionRef = db.collection('production').doc(user.uid).collection('records');
            const snapshot = await productionRef.get();
            
            let remainingToSell = soldQty;
            const updates = [];
            
            snapshot.forEach(doc => {
                if (remainingToSell <= 0) return;
                
                const data = doc.data();
                if (data.product === product && !data.fullySold) {
                    const available = data.quantity || 0;
                    const soldSoFar = data.sold || 0;
                    const canSell = available - soldSoFar;
                    
                    if (canSell > 0) {
                        const sellNow = Math.min(canSell, remainingToSell);
                        const newSold = soldSoFar + sellNow;
                        const fullySold = newSold >= available;
                        
                        updates.push(
                            productionRef.doc(doc.id).update({
                                sold: newSold,
                                fullySold: fullySold,
                                lastSoldDate: new Date().toISOString()
                            })
                        );
                        
                        remainingToSell -= sellNow;
                    }
                }
            });
            
            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`✅ Updated ${updates.length} production records in Firebase`);
            }
            
        } catch (error) {
            console.error('❌ Error updating production in Firebase:', error);
        }
    },

    // ===== UPDATE INVENTORY LOCALSTORAGE =====
    updateInventoryLocalStorage(product, soldQty) {
        try {
            const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
            const productLower = product.toLowerCase();
            
            let updated = false;
            const newInventory = inventory.map(item => {
                if (item.name?.toLowerCase().includes(productLower) ||
                    item.category?.toLowerCase().includes(productLower)) {
                    item.quantity = Math.max(0, (item.quantity || 0) - soldQty);
                    updated = true;
                }
                return item;
            });
            
            if (updated) {
                localStorage.setItem('farm-inventory', JSON.stringify(newInventory));
                console.log(`✅ localStorage inventory updated`);
            }
        } catch (e) {
            console.warn('⚠️ Error updating localStorage inventory:', e);
        }
    },

    updateProductionAfterSale(productionId, saleData) {
        const productionModule = window.FarmModules.Production;
        if (!productionModule || !productionModule.updateQuantityAfterSale) {
            console.warn('Production module not available for quantity update');
            return;
        }

        const quantitySold = saleData.animalCount || saleData.quantity || 0;
        productionModule.updateQuantityAfterSale(productionId, quantitySold);
        
        // ✅ Broadcast production update
        if (this.broadcaster) {
            this.broadcaster.broadcast('production-sold', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                productionId: productionId,
                quantitySold: quantitySold,
                product: saleData.product
            });
        }
    },

    deleteSale() {
        const saleIdInput = document.getElementById('sale-id');
        if (!saleIdInput) return;
        
        const saleId = saleIdInput.value;
        if (!saleId) return;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
        }
    },

   deleteSaleRecord(saleId) {
    console.log('🗑️ Deleting sale:', saleId);
    
    const saleToDelete = window.FarmModules.appData.sales.find(s => s.id === saleId);
    if (!saleToDelete) {
        this.showNotification('Sale not found', 'error');
        return;
    }
    
    window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
    
    // Save to UnifiedDataService
    if (this.dataService) {
        this.dataService.delete('sales', saleId);
    }
    
    this.saveData();
    
    // Broadcast sale deleted
    if (this.broadcaster && typeof this.broadcaster.broadcast === 'function') {
        this.broadcaster.broadcast('sale-deleted', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            saleId: saleId,
            amount: saleToDelete.totalAmount,
            product: saleToDelete.product
        });
    }
    
    this.renderModule();
    this.hideSaleModal();
    this.showNotification('Sale deleted successfully!', 'success');
},
    
    editSale(saleId) {
        console.log('✏️ Editing sale:', saleId);
        
        const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (!sale) {
            this.showNotification('Sale not found', 'error');
            return;
        }
        
        this.currentEditingId = saleId;
        const saleModalTitle = document.getElementById('sale-modal-title');
        if (saleModalTitle) saleModalTitle.textContent = 'Edit Sale';
        
        const saleIdInput = document.getElementById('sale-id');
        if (saleIdInput) saleIdInput.value = sale.id;
        
        const deleteSaleBtn = document.getElementById('delete-sale');
        if (deleteSaleBtn) deleteSaleBtn.classList.remove('hidden');
        
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = this.formatDateForInput(sale.date);
        
        const customerInput = document.getElementById('sale-customer');
        if (customerInput) customerInput.value = sale.customer || '';
        
        const productSelect = document.getElementById('sale-product');
        if (productSelect) productSelect.value = sale.product;
        
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = sale.unit || '';
        
        const paymentMethodSelect = document.getElementById('sale-payment');
        if (paymentMethodSelect) paymentMethodSelect.value = sale.paymentMethod || 'cash';
        
        const paymentStatusSelect = document.getElementById('sale-status');
        if (paymentStatusSelect) paymentStatusSelect.value = sale.paymentStatus || 'paid';
        
        const notesInput = document.getElementById('sale-notes');
        if (notesInput) notesInput.value = sale.notes || '';
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const isMeatProduct = meatProducts.includes(sale.product);
        
        if (isMeatProduct) {
            const animalCountInput = document.getElementById('meat-animal-count');
            const weightInput = document.getElementById('meat-weight');
            const weightUnitSelect = document.getElementById('meat-weight-unit');
            const priceInput = document.getElementById('meat-price');
            
            // Set weight unit first
            if (weightUnitSelect) {
                weightUnitSelect.value = sale.weightUnit || 'kg';
            }
            
            // Handle bird units differently
            if (sale.weightUnit === 'bird') {
                if (weightInput) weightInput.value = sale.quantity || sale.weight || '';
                if (animalCountInput) animalCountInput.value = sale.originalAnimalCount || sale.quantity || sale.animalCount || '';
            } else {
                if (weightInput) weightInput.value = sale.weight || '';
                if (animalCountInput) animalCountInput.value = sale.animalCount || sale.quantity || '';
            }
            
            if (priceInput) priceInput.value = sale.unitPrice || '';
        } else {
            const quantityInput = document.getElementById('standard-quantity');
            if (quantityInput) quantityInput.value = sale.quantity || '';
            
            const priceInput = document.getElementById('standard-price');
            if (priceInput) priceInput.value = sale.unitPrice || '';
        }
        
        // Handle production source
        if (sale.productionSourceId) {
            const productionSourceIdInput = document.getElementById('production-source-id');
            if (productionSourceIdInput) productionSourceIdInput.value = sale.productionSourceId;
            
            const productionSourceNotice = document.getElementById('production-source-notice');
            if (productionSourceNotice) productionSourceNotice.classList.remove('hidden');
            
            const productionSourceInfo = document.getElementById('production-source-info');
            if (productionSourceInfo) {
                productionSourceInfo.textContent = `Source: ${sale.product} (ID: ${sale.productionSourceId})`;
            }
        } else {
            const productionSourceNotice = document.getElementById('production-source-notice');
            if (productionSourceNotice) productionSourceNotice.classList.add('hidden');
        }
        
        // Trigger product change to update UI
        setTimeout(() => {
            this.handleProductChange();
            this.calculateSaleTotal();
        }, 50);
        
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    addSale(saleData) {
        if (!saleData.id) {
            saleData.id = 'SALE-' + Date.now().toString().slice(-6);
        }
        window.FarmModules.appData.sales.push(saleData);
        this.saveData();
        
        // ✅ Broadcast new sale recorded
        this.broadcastSaleRecorded(saleData);
        
        this.renderModule();
        return saleData.id;
    },

    generateDailyReport() {
        const today = this.getCurrentDate();
        const sales = window.FarmModules.appData.sales || [];
        
        const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today));
        
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalTransactions = todaySales.length;
        
        const productsSold = {};
        const paymentMethods = {};
        
        todaySales.forEach(sale => {
            // Track products
            const productName = this.formatProductName(sale.product);
            if (!productsSold[productName]) {
                productsSold[productName] = 0;
            }
            
            if (['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'].includes(sale.product)) {
                productsSold[productName] += sale.animalCount || sale.quantity || 0;
            } else {
                productsSold[productName] += sale.quantity || 0;
            }
            
            // Track payment methods
            const method = sale.paymentMethod || 'cash';
            if (!paymentMethods[method]) {
                paymentMethods[method] = 0;
            }
            paymentMethods[method] += sale.totalAmount;
        });
        
        // ✅ Broadcast report generation
        if (this.broadcaster) {
            this.broadcaster.broadcast('daily-report-generated', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                date: today,
                totalRevenue: totalRevenue,
                totalTransactions: totalTransactions,
                productsCount: Object.keys(productsSold).length
            });
        }
        
        let content = `
            <div style="background: white; padding: 24px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: var(--text-primary); margin-bottom: 8px;">📊 Daily Sales Report</h2>
                    <p style="color: var(--text-secondary); font-size: 16px;">${this.formatDate(today)}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue)}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Revenue</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${totalTransactions}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Transactions</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${Object.keys(productsSold).length}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Products Sold</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--glass-border); padding-bottom: 8px;">📋 Products Sold Today</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e5e7eb;">
                                    <th style="padding: 12px; text-align: left; color: #374151;">Product</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Quantity</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        Object.entries(productsSold).forEach(([product, quantity]) => {
            const productSales = todaySales.filter(s => this.formatProductName(s.product) === product);
            const productRevenue = productSales.reduce((sum, s) => sum + s.totalAmount, 0);
            
            content += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: var(--text-primary);">${product}</td>
                    <td style="padding: 12px; color: var(--text-primary);">${quantity}</td>
                    <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(productRevenue)}</td>
                </tr>
            `;
        });
        
        content += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--glass-border); padding-bottom: 8px;">💳 Payment Methods</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        `;
        
        Object.entries(paymentMethods).forEach(([method, amount]) => {
            const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;
            
            content += `
                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${method.charAt(0).toUpperCase() + method.slice(1)}</div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--primary-color);">${this.formatCurrency(amount)}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${percentage}% of total</div>
                </div>
            `;
        });
        
        content += `
                    </div>
                </div>
                
                ${todaySales.length > 0 ? `
                    <div style="margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: var(--text-primary); margin-bottom: 12px;">📝 Summary</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6;">
                            Today's sales show ${totalTransactions} transaction${totalTransactions !== 1 ? 's' : ''} totaling ${this.formatCurrency(totalRevenue)}. 
                            The most popular payment method was ${Object.keys(paymentMethods).reduce((a, b) => paymentMethods[a] > paymentMethods[b] ? a : b)}.
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
        
        const contentElement = document.getElementById('daily-report-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        const modal = document.getElementById('daily-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    generateMeatSalesReport() {
        const sales = window.FarmModules.appData.sales || [];
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        
        const totalWeight = meatSales.reduce((sum, sale) => {
            if (sale.weightUnit === 'lbs') {
                return sum + (sale.weight || 0) * 0.453592;
            }
            return sum + (sale.weight || 0);
        }, 0);
        
        const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        const totalRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        // ✅ FIXED: Properly initialize productBreakdown object
        const productBreakdown = {};
        
        meatSales.forEach(sale => {
            const productName = this.formatProductName(sale.product);
            if (!productBreakdown[productName]) {
                productBreakdown[productName] = {
                    weight: 0,
                    animals: 0,
                    revenue: 0
                };
            }
            
            let weight = sale.weight || 0;
            if (sale.weightUnit === 'lbs') {
                weight = weight * 0.453592;
            }
            
            productBreakdown[productName].weight += weight;
            productBreakdown[productName].animals += sale.animalCount || sale.quantity || 0;
            productBreakdown[productName].revenue += sale.totalAmount;
        });
        
        // ✅ Broadcast meat report generation
        if (this.broadcaster) {
            this.broadcaster.broadcast('meat-report-generated', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                totalAnimals: totalAnimals,
                totalWeight: totalWeight,
                totalRevenue: totalRevenue,
                meatSalesCount: meatSales.length
            });
        }
        
        let content = `
            <div style="background: white; padding: 24px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: var(--text-primary); margin-bottom: 8px;">🍗 Meat Sales Report</h2>
                    <p style="color: var(--text-secondary); font-size: 16px;">Weight-based meat sales analysis</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fef3f3 0%, #fed7d7 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🍖</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${totalAnimals}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Animals</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">⚖️</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${totalWeight.toFixed(2)} kg</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Weight</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue)}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Revenue</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary);">${meatSales.length}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Transactions</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 32px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px; border-bottom: 2px solid var(--glass-border); padding-bottom: 8px;">📋 Product Breakdown</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e5e7eb;">
                                    <th style="padding: 12px; text-align: left; color: #374151;">Product</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Animals</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Weight (kg)</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Avg Weight</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Revenue</th>
                                    <th style="padding: 12px; text-align: left; color: #374151;">Avg Price/kg</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        Object.entries(productBreakdown).forEach(([product, data]) => {
            const avgWeight = data.animals > 0 ? (data.weight / data.animals).toFixed(2) : 0;
            const avgPricePerKg = data.weight > 0 ? (data.revenue / data.weight).toFixed(2) : 0;
            
            content += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${product}</td>
                    <td style="padding: 12px; color: var(--text-primary);">${data.animals}</td>
                    <td style="padding: 12px; color: var(--text-primary);">${data.weight.toFixed(2)} kg</td>
                    <td style="padding: 12px; color: var(--text-primary);">${avgWeight} kg/animal</td>
                    <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(data.revenue)}</td>
                    <td style="padding: 12px; color: var(--text-primary);">${this.formatCurrency(parseFloat(avgPricePerKg))}/kg</td>
                </tr>
            `;
        });
        
        content += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${totalWeight > 0 ? `
                <div style="margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: var(--text-primary); margin-bottom: 12px;">📊 Key Metrics</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary);">Average Weight per Animal</div>
                            <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${(totalWeight / totalAnimals).toFixed(2)} kg</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary);">Average Price per kg</div>
                            <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue / totalWeight)}/kg</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: var(--text-secondary);">Average Sale Value</div>
                            <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(totalRevenue / meatSales.length)}</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
        `;
        
        const contentElement = document.getElementById('meat-sales-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        const modal = document.getElementById('meat-sales-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    printDailyReport() {
        const contentElement = document.getElementById('daily-report-content');
        if (!contentElement) return;
        
        const printContent = contentElement.innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sales Report - ${this.getCurrentDate()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #2d3748; border-bottom: 2px solid #4a5568; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .total { font-weight: bold; color: #2d3748; }
                    .header { text-align: center; margin-bottom: 30px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Daily Sales Report</h1>
                    <h3>${this.formatDate(this.getCurrentDate())}</h3>
                </div>
                ${printContent}
                <div class="no-print" style="margin-top: 40px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4a5568; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #718096; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        this.renderModule();
    },

    printMeatSalesReport() {
        const contentElement = document.getElementById('meat-sales-content');
        if (!contentElement) return;
        
        const printContent = contentElement.innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meat Sales Report - ${this.getCurrentDate()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #2d3748; border-bottom: 2px solid #4a5568; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .total { font-weight: bold; color: #2d3748; }
                    .header { text-align: center; margin-bottom: 30px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Meat Sales Report</h1>
                    <h3>Generated on ${this.formatDate(this.getCurrentDate())}</h3>
                </div>
                ${printContent}
                <div class="no-print" style="margin-top: 40px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4a5568; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #718096; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        this.renderModule();
    },

    // Utility methods
    getProductIcon(product) {
        const iconMap = {
            'broilers-dressed': '🍗',
            'pork': '🐖',
            'beef': '🐄',
            'chicken-parts': '🍗',
            'goat': '🐐',
            'lamb': '🐑',
            'broilers-live': '🐔',
            'layers': '🐓',
            'chicks': '🐤',
            'eggs': '🥚',
            'tomatoes': '🍅',
            'peppers': '🌶️',
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
        return iconMap[product] || '📦';
    },

    formatProductName(product) {
        const nameMap = {
            'broilers-dressed': 'Broilers (Dressed)',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
            'broilers-live': 'Broilers (Live)',
            'layers': 'Layers',
            'chicks': 'Baby Chicks',
            'eggs': 'Eggs',
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
            'bread': 'Bread'
        };
        return nameMap[product] || product.charAt(0).toUpperCase() + product.slice(1).replace('-', ' ');
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    showNotification(message, type = 'info') {
        // Add animation styles to document head
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#f59e0b';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    unload() {
        console.log('📦 Unloading Sales module...');
        this.initialized = false;
        this.element = null;
        this.broadcaster = null;
        this.removeEventListeners();
        
        // Remove any notification styles
        const notificationStyles = document.querySelector('#notification-styles');
        if (notificationStyles) {
            notificationStyles.remove();
        }
    }
};

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'sales-record';
    const MODULE_OBJECT = SalesRecordModule;
    
    console.log(`💰 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        if (typeof window.FarmModules.registerModule === 'function') {
            window.FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
            console.log(`✅ ${MODULE_NAME} module registered successfully via registerModule!`);
        } else {
            window.FarmModules.modules = window.FarmModules.modules || new Map();
            window.FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
            window.FarmModules[MODULE_NAME] = MODULE_OBJECT;
            window.FarmModules.SalesRecord = MODULE_OBJECT;
            window.FarmModules.Sales = MODULE_OBJECT;
            console.log(`✅ ${MODULE_NAME} module registered successfully via manual registration!`);
        }
    } else {
        console.error('❌ FarmModules framework not found');
        window.FarmModules = {
            modules: new Map(),
            SalesRecord: MODULE_OBJECT,
            Sales: MODULE_OBJECT
        };
        window.FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
        window.FarmModules[MODULE_NAME] = MODULE_OBJECT;
        console.log(`⚠️ Created FarmModules and registered ${MODULE_NAME}`);
    }
    
    // ========== GLOBAL EXPOSURE (ADD THIS) ==========
    // Expose globally WITHOUT overwriting existing references
    if (!window.SalesRecordModule) {
        window.SalesRecordModule = MODULE_OBJECT;
        console.log('✅ SalesRecordModule exposed globally');
    }
    if (!window.SalesModule) {
        window.SalesModule = MODULE_OBJECT;
        console.log('✅ SalesModule exposed globally');
    }
})();
