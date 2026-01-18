// modules/sales-record.js - COMPLETE FIXED VERSION WITH DATA BROADCASTER (CSP COMPLIANT)
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,
    broadcaster: null, // Add broadcaster reference

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
        
        // ✅ Get Broadcaster instance
        if (window.Broadcaster) {
            this.broadcaster = window.Broadcaster;
            console.log('📡 Sales module connected to Data Broadcaster');
        }
        
        // ✅ Register with StyleManager
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.loadSalesData();
        this.renderModule();
        this.setupEventListeners();
        this.setupBroadcasterListeners(); // NEW: Setup broadcaster listeners
        this.initialized = true;
        
        console.log('✅ Enhanced Sales Records initialized with Data Broadcaster');
        console.log('📅 DateUtils available:', !!window.DateUtils);
        
        // ✅ Broadcast sales loaded
        this.broadcastSalesLoaded();
        
        return true;
    },

    // ✅ NEW: Setup broadcaster listeners
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        // Listen for orders completed
        this.broadcaster.on('order-completed', (data) => {
            console.log('📡 Sales received order completion:', data);
            this.handleOrderCompletion(data);
        });
        
        // Listen for production updates
        this.broadcaster.on('production-updated', (data) => {
            console.log('📡 Sales received production update:', data);
            this.updateAvailableProductionItems(data);
        });
        
        // Listen for inventory updates
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Sales received inventory update:', data);
            this.checkInventoryForSales(data);
        });
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
            <div class="glass-card production-empty">
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3 class="empty-title">No Production Items</h3>
                    <p class="empty-desc">Add production records to sell them here</p>
                    <button class="btn-primary production-nav-btn" data-action="navigate-to-production">
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
        <div class="glass-card production-overview">
            <div class="overview-header">
                <div class="overview-text">
                    <h3 class="overview-title">🔄 Available Production Items</h3>
                    <p class="overview-subtitle">Sell directly from production records</p>
                </div>
                <button class="btn-primary production-nav-btn" data-action="show-production-items">
                    Sell from Production
                </button>
            </div>

            <div class="overview-stats-grid">
                <div class="overview-stat">
                    <div class="overview-value">${productCount}</div>
                    <div class="overview-label">Product Types</div>
                </div>
                <div class="overview-stat">
                    <div class="overview-value">${totalProduced}</div>
                    <div class="overview-label">Total Produced</div>
                </div>
                <div class="overview-stat">
                    <div class="overview-value">${soldFromProduction}</div>
                    <div class="overview-label">Sold from Production</div>
                </div>
            </div>

            <div class="overview-footer">
                <div class="overview-tip">
                    <span class="tip-icon">💡</span>
                    <div class="tip-text">
                        Selling from production helps track inventory and source of goods. 
                        <a href="#" class="production-nav-btn" data-action="show-production-items">Browse available items →</a>
                    </div>
                </div>
                <div class="overview-actions">
                    <button class="btn-outline production-nav-btn" data-action="navigate-to-production">
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

        renderSalesList(filteredSales) {
    if (filteredSales.length === 0) {
        return `
            <div class="no-records sales-empty">
                <div class="no-records-icon">💰</div>
                <div class="no-records-title">No sales recorded</div>
                <div class="no-records-desc">Record your first sale to get started</div>
            </div>
        `;
    }

    const sortedSales = filteredSales.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
        <div class="sales-table-wrapper">
            <table class="sales-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Animals/Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Source</th>
                        <th>Actions</th>
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
                            ? '<span class="badge badge-prod">PROD</span>'
                            : '';

                        return `
                            <tr>
                                <td>${this.formatDate(sale.date)}</td>
                                <td>
                                    <div class="product-cell">
                                        <span class="product-icon">${this.getProductIcon(sale.product)}</span>
                                        <span class="product-name">${this.formatProductName(sale.product)}</span>
                                        ${sourceBadge}
                                    </div>
                                </td>
                                <td class="customer-cell">${sale.customer || 'Walk-in'}</td>
                                <td>${quantityInfo}</td>
                                <td>
                                    ${this.formatCurrency(sale.unitPrice)}
                                    ${sale.weightUnit === 'lbs' ? '/lb' : sale.weightUnit ? `/${sale.weightUnit}` : sale.priceUnit === 'per-lb' ? '/lb' : '/kg'}
                                </td>
                                <td class="total-cell">${this.formatCurrency(sale.totalAmount)}</td>
                                <td class="source-cell">${sale.productionSource ? 'Production' : 'Direct'}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon edit-sale-btn" data-id="${sale.id}" title="Edit">✏️</button>
                                        <button class="btn-icon delete-sale-btn" data-id="${sale.id}" title="Delete">🗑️</button>
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

    const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today))
                            .reduce((sum, sale) => sum + sale.totalAmount, 0);

    const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
    const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
    const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
    const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);

    this.element.innerHTML = `
        <div class="sales-module module-container">
            <!-- Header -->
            <div class="module-header">
                <h1 class="module-title">Sales Records</h1>
                <p class="module-subtitle">Track product sales, revenue, and weight (for meat)</p>
                <div class="header-actions">
                    <button class="btn-primary" id="add-sale">➕ Record Sale</button>
                </div>
            </div>

            <!-- Sales Summary -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value" id="today-sales">${this.formatCurrency(todaySales)}</div>
                    <div class="stat-label">Today's Revenue</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚖️</div>
                    <div class="stat-value" id="total-meat-weight">${totalMeatWeight.toFixed(2)}</div>
                    <div class="stat-label">Meat Weight Sold</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🐄</div>
                    <div class="stat-value" id="total-animals">${totalAnimalsSold}</div>
                    <div class="stat-label">Animals Sold</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value" id="total-sales">${sales.length}</div>
                    <div class="stat-label">Total Sales Records</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-action-grid">
                <button class="quick-action-btn" id="add-sale-btn">
                    <div class="action-icon">➕</div>
                    <span class="action-title">Record Sale</span>
                    <span class="action-desc">Add new sale record</span>
                </button>
                <button class="quick-action-btn" id="from-production-btn">
                    <div class="action-icon">🔄</div>
                    <span class="action-title">From Production</span>
                    <span class="action-desc">Sell from production items</span>
                </button>
                <button class="quick-action-btn" id="meat-sales-btn">
                    <div class="action-icon">🍗</div>
                    <span class="action-title">Meat Sales</span>
                    <span class="action-desc">Weight-based sales report</span>
                </button>
                <button class="quick-action-btn" id="daily-report-btn">
                    <div class="action-icon">📊</div>
                    <span class="action-title">Daily Report</span>
                    <span class="action-desc">Today's sales summary</span>
                </button>
            </div>

            <!-- Production Items Available -->
            ${this.renderProductionItems()}

            <!-- Quick Sale Form -->
            <div class="glass-card quick-sale">
                <h3 class="section-title">⚡ Quick Sale</h3>
                <form id="quick-sale-form">
                    <div class="form-grid">
                        <div>
                            <label class="form-label">Product *</label>
                            <select id="quick-product" required class="form-input">
                                <!-- product options -->
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Quantity *</label>
                            <input type="number" id="quick-quantity" placeholder="0" required class="form-input" min="1">
                        </div>
                        <div>
                            <label class="form-label">Unit</label>
                            <select id="quick-unit" class="form-input">
                                <!-- unit options -->
                            </select>
                        </div>
                        <div>
                            <label class="form-label" id="quick-price-label">Price *</label>
                            <input type="number" id="quick-price" placeholder="0.00" step="0.01" required class="form-input" min="0">
                        </div>
                        <div>
                            <button type="submit" class="btn-primary">Record Sale</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Sales Records Table -->
            <div class="glass-card sales-records">
                <div class="section-header">
                    <h3 class="section-title">📋 Recent Sales</h3>
                    <div class="section-actions">
                        <select id="period-filter" class="form-input">
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

        <!-- ==================== POPOUT MODALS ==================== -->
        <!-- Sales Record Modal -->
        <div id="sale-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="sale-modal-title">Record Sale</h3>
                    <button class="popout-modal-close" id="close-sale-modal">&times;</button>
                </div>
                <div class="popout-modal-body">
                    ${this.renderSaleForm()}
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
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="daily-report-title">Daily Sales Report</h3>
                    <button class="popout-modal-close" id="close-daily-report">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="daily-report-content"></div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-daily-report">🖨️ Print</button>
                    <button class="btn-primary" id="close-daily-report-btn">Close</button>
                </div>
            </div>
        </div>

        <!-- Meat Sales Report Modal -->
        <div id="meat-sales-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title" id="meat-sales-title">Meat Sales Report</h3>
                    <button class="popout-modal-close" id="close-meat-sales">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="meat-sales-content"></div>
                </div>
                <div class="popout-modal-footer">
                    <button class="btn-outline" id="print-meat-sales">🖨️ Print</button>
                    <button class="btn-primary" id="close-meat-sales-btn">Close</button>
                </div>
            </div>
        </div>

                <!-- Production Items Modal -->
        <div id="production-items-modal" class="popout-modal hidden">
            <div class="popout-modal-content">
                <div class="popout-modal-header">
                    <h3 class="popout-modal-title">Available Production Items</h3>
                    <button class="popout-modal-close" id="close-production-items">&times;</button>
                </div>
                <div class="popout-modal-body">
                    <div id="production-items-content"></div>
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
            quickSaleForm.addEventListener('submit', (e) => {
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
            quickProduct.addEventListener('change', () => this.handleQuickProductChange());
        }

        // Filter
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                const salesTable = document.getElementById('sales-table');
                if (salesTable) {
                    salesTable.innerHTML = this.renderSalesTable(e.target.value);
                }
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popout-modal')) {
                this.hideAllModals();
            }
        });

        // Delegated event listener for edit/delete buttons
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-sale-btn');
            const deleteBtn = e.target.closest('.delete-sale-btn');
            
            if (editBtn) {
                const saleId = editBtn.getAttribute('data-id');
                if (!saleId) {
                    console.error('❌ No sale ID found on edit button');
                    return;
                }
                console.log('✏️ Edit button clicked for sale:', saleId);
                e.preventDefault();
                e.stopPropagation();
                this.editSale(saleId);
            }
            
            if (deleteBtn) {
                const saleId = deleteBtn.getAttribute('data-id');
                if (!saleId) {
                    console.error('❌ No sale ID found on delete button');
                    return;
                }
                console.log('🗑️ Delete button clicked for sale:', saleId);
                e.preventDefault();
                e.stopPropagation();
                
                // Direct call to delete method
                if (confirm('Are you sure you want to delete this sale?')) {
                    this.deleteSaleRecord(saleId);
                }
            }
            
            // NEW: Handle production navigation buttons
            const productionNavBtn = e.target.closest('.production-nav-btn');
            if (productionNavBtn) {
                e.preventDefault();
                e.stopPropagation();
                const action = productionNavBtn.getAttribute('data-action');
                this.handleProductionNavAction(action);
            }
            
            // NEW: Handle sell production item buttons
            const sellItemBtn = e.target.closest('.sell-production-item-btn');
            if (sellItemBtn) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = sellItemBtn.getAttribute('data-item-id');
                if (itemId) {
                    this.selectProductionItem(itemId);
                }
            }
        });
        
        console.log('✅ Event listeners set up');
    },
    
    setupButtonListeners() {
        // Modal buttons
        const addSaleBtn = document.getElementById('add-sale');
        if (addSaleBtn) addSaleBtn.addEventListener('click', () => this.showSaleModal());
        
        const addSaleBtn2 = document.getElementById('add-sale-btn');
        if (addSaleBtn2) addSaleBtn2.addEventListener('click', () => this.showSaleModal());
        
        const fromProductionBtn = document.getElementById('from-production-btn');
        if (fromProductionBtn) fromProductionBtn.addEventListener('click', () => this.showProductionItems());
        
        const fromProductionBtn2 = document.getElementById('from-production-btn-2');
        if (fromProductionBtn2) fromProductionBtn2.addEventListener('click', () => this.showProductionItems());
        
        const meatSalesBtn = document.getElementById('meat-sales-btn');
        if (meatSalesBtn) meatSalesBtn.addEventListener('click', () => this.generateMeatSalesReport());
        
        const dailyReportBtn = document.getElementById('daily-report-btn');
        if (dailyReportBtn) dailyReportBtn.addEventListener('click', () => this.generateDailyReport());
        
        // Sale modal handlers
        const saveSaleBtn = document.getElementById('save-sale');
        if (saveSaleBtn) saveSaleBtn.addEventListener('click', () => this.saveSale());
        
        const deleteSaleBtn = document.getElementById('delete-sale');
        if (deleteSaleBtn) deleteSaleBtn.addEventListener('click', () => this.deleteSale());
        
        const cancelSaleBtn = document.getElementById('cancel-sale');
        if (cancelSaleBtn) cancelSaleBtn.addEventListener('click', () => this.hideSaleModal());
        
        const closeSaleModalBtn = document.getElementById('close-sale-modal');
        if (closeSaleModalBtn) closeSaleModalBtn.addEventListener('click', () => this.hideSaleModal());
        
        // Report modal handlers
        const closeDailyReportBtn = document.getElementById('close-daily-report');
        if (closeDailyReportBtn) closeDailyReportBtn.addEventListener('click', () => this.hideDailyReportModal());
        
        const closeDailyReportBtn2 = document.getElementById('close-daily-report-btn');
        if (closeDailyReportBtn2) closeDailyReportBtn2.addEventListener('click', () => this.hideDailyReportModal());
        
        const printDailyReportBtn = document.getElementById('print-daily-report');
        if (printDailyReportBtn) printDailyReportBtn.addEventListener('click', () => this.printDailyReport());
        
        const closeMeatSalesBtn = document.getElementById('close-meat-sales');
        if (closeMeatSalesBtn) closeMeatSalesBtn.addEventListener('click', () => this.hideMeatSalesModal());
        
        const closeMeatSalesBtn2 = document.getElementById('close-meat-sales-btn');
        if (closeMeatSalesBtn2) closeMeatSalesBtn2.addEventListener('click', () => this.hideMeatSalesModal());
        
        const printMeatSalesBtn = document.getElementById('print-meat-sales');
        if (printMeatSalesBtn) printMeatSalesBtn.addEventListener('click', () => this.printMeatSalesReport());
        
        // Production items modal
        const closeProductionItemsBtn = document.getElementById('close-production-items');
        if (closeProductionItemsBtn) closeProductionItemsBtn.addEventListener('click', () => this.hideProductionItemsModal());
        
        const closeProductionItemsBtn2 = document.getElementById('close-production-items-btn');
        if (closeProductionItemsBtn2) closeProductionItemsBtn2.addEventListener('click', () => this.hideProductionItemsModal());
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
        <div class="production-empty">
            <div class="empty-icon">📦</div>
            <h4 class="empty-title">No production items available for sale</h4>
            <p class="empty-desc">
                All production items have been sold or no production records exist.
            </p>
            <div class="empty-actions">
                <button class="btn-primary production-nav-btn" data-action="navigate-to-production">
                    ➕ Go to Production Module
                </button>
            </div>
            <p class="empty-hint">
                Add new production records to sell them here
            </p>
        </div>
    `;
} else {
    content += `
        <div class="production-intro">
            <p>Select a production item to create a sale from:</p>
        </div>

        <div class="production-grid">
    `;

    availableProducts.forEach((item) => {
        const icon = this.getProductIcon(item.product);
        const formattedDate = this.formatDate(item.date);
        const productName = this.formatProductName(item.product);

        content += `
            <div class="production-card">
                <div class="production-card-header">
                    <div class="product-icon">${icon}</div>
                    <div class="product-info">
                        <div class="product-name">${productName}</div>
                        <div class="product-date">Produced: ${formattedDate}</div>
                    </div>
                </div>

                <div class="production-stats">
                    <div class="stat total-produced">
                        <div class="stat-label">Total Produced</div>
                        <div class="stat-value">${item.totalQuantity} ${item.unit}</div>
                    </div>
                    <div class="stat available">
                        <div class="stat-label">Available</div>
                        <div class="stat-value">${item.availableQuantity} ${item.unit}</div>
                    </div>
                </div>

                ${item.notes ? `
                    <div class="production-notes">
                        <div class="notes-label">Notes</div>
                        <div class="notes-text">${item.notes}</div>
                    </div>
                ` : ''}

                <div class="production-actions">
                    <button class="btn-primary sell-production-item-btn" data-item-id="${item.id}">
                        Sell This Item
                    </button>
                </div>
            </div>
        `;
    });

    content += `
        </div>

        <div class="production-footer">
            <div class="footer-tip">
                <span class="tip-icon">💡</span>
                <div class="tip-text">Need more products? Add new production records.</div>
            </div>
            <button class="btn-outline production-nav-btn" data-action="navigate-to-production">
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
    },
    
    removeEventListeners() {
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
            weightUnit.addEventListener('change', () => {
                this.updateMeatLabels();
                this.calculateSaleTotal();
            });
        }
        
        // Unit change
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) {
            unitSelect.addEventListener('change', () => {
                this.updateStandardPriceLabel();
                this.calculateSaleTotal();
            });
        }
    },

    updateMeatLabels() {
        const weightUnit = document.getElementById('meat-weight-unit');
        if (!weightUnit) return;
        
        const weightUnitValue = weightUnit.value;
        const priceLabel = document.getElementById('meat-price-label');
        const priceUnitLabel = document.getElementById('meat-price-unit-label');
        const avgWeightElement = document.getElementById('meat-avg-weight');
        
        if (weightUnitValue === 'lbs') {
            if (priceLabel) priceLabel.textContent = 'Price per lb *';
            if (priceUnitLabel) priceUnitLabel.textContent = 'per lb';
            if (avgWeightElement && avgWeightElement.textContent.includes('kg')) {
                avgWeightElement.textContent = avgWeightElement.textContent.replace('kg', 'lbs');
            }
        } else {
            if (priceLabel) priceLabel.textContent = 'Price per kg *';
            if (priceUnitLabel) priceUnitLabel.textContent = 'per kg';
            if (avgWeightElement && avgWeightElement.textContent.includes('lbs')) {
                avgWeightElement.textContent = avgWeightElement.textContent.replace('lbs', 'kg');
            }
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
        
        if (isMeatProduct) {
            if (meatSection) meatSection.style.display = 'block';
            if (meatSummary) meatSummary.style.display = 'block';
            if (standardSection) standardSection.style.display = 'none';
            if (standardSummary) standardSummary.style.display = 'none';
            
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) unitSelect.value = 'animals';
            
            const weightUnit = document.getElementById('meat-weight-unit');
            if (weightUnit && !weightUnit.value) {
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
            
            this.updateMeatLabels();
            
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
                if (!unitSelect.value || unitSelect.value === '') {
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
            }
            
            this.updateStandardPriceLabel();
            
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
        const productSelect = document.getElementById('sale-product');
        if (!productSelect) return;
        
        const product = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        let total = 0;
        
        if (meatProducts.includes(product)) {
            const animalCountInput = document.getElementById('meat-animal-count');
            const weightInput = document.getElementById('meat-weight');
            const weightUnitSelect = document.getElementById('meat-weight-unit');
            const priceInput = document.getElementById('meat-price');
            
            const animalCount = animalCountInput ? parseFloat(animalCountInput.value) || 0 : 0;
            const weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
            const weightUnit = weightUnitSelect ? weightUnitSelect.value : 'kg';
            const pricePerUnit = priceInput ? parseFloat(priceInput.value) || 0 : 0;
            
            total = weight * pricePerUnit;
            
            const meatSummary = document.getElementById('meat-summary-info');
            const avgWeightElement = document.getElementById('meat-avg-weight');
            const avgValueElement = document.getElementById('meat-avg-value');
            
            if (meatSummary && avgWeightElement && avgValueElement) {
                if (animalCount > 0 && weight > 0) {
                    const avgWeight = weight / animalCount;
                    const avgValue = total / animalCount;
                    const weightUnitText = weightUnit === 'lbs' ? 'lbs' : 'kg';
                    
                    meatSummary.textContent = `${animalCount} animal${animalCount !== 1 ? 's' : ''} • ${weight.toFixed(2)} ${weightUnitText} total • ${this.formatCurrency(avgValue)} per animal`;
                    avgWeightElement.textContent = `${avgWeight.toFixed(2)} ${weightUnitText}/animal`;
                    avgValueElement.textContent = `${this.formatCurrency(avgValue)}/animal`;
                } else {
                    const weightUnitText = weightUnit === 'lbs' ? 'lbs' : 'kg';
                    meatSummary.textContent = `0 animals • 0 ${weightUnitText} total • $0.00 per animal`;
                    avgWeightElement.textContent = `0.00 ${weightUnitText}/animal`;
                    avgValueElement.textContent = '$0.00/animal';
                }
            }
        } else {
            const quantityInput = document.getElementById('standard-quantity');
            const priceInput = document.getElementById('standard-price');
            const unitSelect = document.getElementById('sale-unit');
            
            const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
            const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;
            const unit = unitSelect ? unitSelect.value || 'unit' : 'unit';
            
            total = quantity * price;
            
            const standardSummary = document.getElementById('standard-summary-info');
            if (standardSummary) {
                const unitLabel = this.getUnitDisplayName(unit, product);
                standardSummary.textContent = `${quantity} ${unitLabel} at ${this.formatCurrency(price)} ${this.getPriceUnitLabel(unit, product)}`;
            }
        }
        
        const totalElement = document.getElementById('sale-total-amount');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
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
        
        const form = document.getElementById('sale-form');
        if (form) {
            form.reset();
        }
        
        const saleModalTitle = document.getElementById('sale-modal-title');
        if (saleModalTitle) saleModalTitle.textContent = 'Record Sale';
        
        const deleteSaleBtn = document.getElementById('delete-sale');
        if (deleteSaleBtn) deleteSaleBtn.style.display = 'none';
        
        const productionSourceNotice = document.getElementById('production-source-notice');
        if (productionSourceNotice) productionSourceNotice.style.display = 'none';
        
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
        
        const weightUnit = document.getElementById('meat-weight-unit');
        if (weightUnit) weightUnit.value = 'kg';
        
        const paymentMethod = document.getElementById('sale-payment');
        if (paymentMethod) paymentMethod.value = 'cash';
        
        const paymentStatus = document.getElementById('sale-status');
        if (paymentStatus) paymentStatus.value = 'paid';
        
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

    showProductionSourceNotice() {
        if (!this.pendingProductionSale) return;
        
        const noticeElement = document.getElementById('production-source-notice');
        const infoElement = document.getElementById('production-source-info');
        
        if (noticeElement && infoElement) {
            noticeElement.style.display = 'block';
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

    saveSale() {
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
            
            if (weightUnit === 'lbs') {
                totalAmount = weight * unitPrice;
                priceUnit = 'per-lb';
            } else {
                totalAmount = weight * unitPrice;
                priceUnit = 'per-kg';
            }
            
            saleData = {
                id: saleId || 'SALE-' + Date.now().toString().slice(-6),
                date: date,
                customer: customer || 'Walk-in',
                product: product,
                unit: unit,
                quantity: animalCount,
                unitPrice: unitPrice,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus || 'paid',
                notes: notes,
                weight: weight,
                weightUnit: weightUnit,
                animalCount: animalCount,
                priceUnit: priceUnit,
                avgWeightPerAnimal: animalCount > 0 ? weight / animalCount : 0,
                avgValuePerAnimal: animalCount > 0 ? totalAmount / animalCount : 0
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

        if (saleId) {
            // Update existing sale
            const oldSale = window.FarmModules.appData.sales.find(s => s.id === saleId);
            const index = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
            if (index !== -1) {
                window.FarmModules.appData.sales[index] = saleData;
                
                // ✅ Broadcast sale updated
                if (oldSale) {
                    this.broadcastSaleUpdated(oldSale, saleData);
                }
                
                this.showNotification('Sale updated successfully!', 'success');
            }
        } else {
            // Add new sale
            window.FarmModules.appData.sales.push(saleData);
            
            // ✅ Broadcast new sale recorded
            this.broadcastSaleRecorded(saleData);
            
            this.showNotification('Sale recorded successfully!', 'success');
        }

        this.saveData();
        this.renderModule();
        this.hideSaleModal();
        this.pendingProductionSale = null;
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
        
        // Find the sale before deleting
        const saleToDelete = window.FarmModules.appData.sales.find(s => s.id === saleId);
        
        // Filter out the sale to be deleted
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        
        // Save the updated data
        this.saveData();
        
        // ✅ Broadcast sale deleted
        if (saleToDelete) {
            this.broadcastSaleDeleted(saleToDelete);
        }
        
        // Update the display
        this.renderModule();
        
        // Hide modal if open
        this.hideSaleModal();
        
        // Show notification
        this.showNotification('Sale deleted successfully!', 'success');
    },

    editSale(saleId) {
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
        if (deleteSaleBtn) deleteSaleBtn.style.display = 'inline-block';
        
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = this.formatDateForInput(sale.date);
        
        const customerInput = document.getElementById('sale-customer');
        if (customerInput) customerInput.value = sale.customer || '';
        
        const productSelect = document.getElementById('sale-product');
        if (productSelect) productSelect.value = sale.product;
        
        const unitSelect = document.getElementById('sale-unit');
        if (unitSelect) unitSelect.value = sale.unit;
        
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
            if (animalCountInput) animalCountInput.value = sale.animalCount || sale.quantity || '';
            
            const weightInput = document.getElementById('meat-weight');
            if (weightInput) weightInput.value = sale.weight || '';
            
            const weightUnitSelect = document.getElementById('meat-weight-unit');
            if (weightUnitSelect) weightUnitSelect.value = sale.weightUnit || 'kg';
            
            const priceInput = document.getElementById('meat-price');
            if (priceInput) priceInput.value = sale.unitPrice || '';
        } else {
            const quantityInput = document.getElementById('standard-quantity');
            if (quantityInput) quantityInput.value = sale.quantity || '';
            
            const priceInput = document.getElementById('standard-price');
            if (priceInput) priceInput.value = sale.unitPrice || '';
        }
        
        if (sale.productionSourceId) {
            const productionSourceIdInput = document.getElementById('production-source-id');
            if (productionSourceIdInput) productionSourceIdInput.value = sale.productionSourceId;
            
            const productionSourceNotice = document.getElementById('production-source-notice');
            if (productionSourceNotice) productionSourceNotice.style.display = 'block';
            
            const productionSourceInfo = document.getElementById('production-source-info');
            if (productionSourceInfo) {
                productionSourceInfo.textContent = `Source: ${sale.product} (ID: ${sale.productionSourceId})`;
            }
        } else {
            const productionSourceNotice = document.getElementById('production-source-notice');
            if (productionSourceNotice) productionSourceNotice.style.display = 'none';
        }
        
        this.handleProductChange();
        this.calculateSaleTotal();
        
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
    <div class="daily-report-card">
        <div class="daily-report-header">
            <h2 class="report-title">📊 Daily Sales Report</h2>
            <p class="report-date">${this.formatDate(today)}</p>
        </div>

        <div class="report-stats-grid">
            <div class="report-stat revenue">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${this.formatCurrency(totalRevenue)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="report-stat transactions">
                <div class="stat-icon">📈</div>
                <div class="stat-value">${totalTransactions}</div>
                <div class="stat-label">Transactions</div>
            </div>
            <div class="report-stat products">
                <div class="stat-icon">📦</div>
                <div class="stat-value">${Object.keys(productsSold).length}</div>
                <div class="stat-label">Products Sold</div>
            </div>
        </div>

        <div class="report-section products-sold">
            <h3 class="section-title">📋 Products Sold Today</h3>
            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
`;

Object.entries(productsSold).forEach(([product, quantity]) => {
    const productSales = todaySales.filter(s => this.formatProductName(s.product) === product);
    const productRevenue = productSales.reduce((sum, s) => sum + s.totalAmount, 0);

    content += `
        <tr>
            <td>${product}</td>
            <td>${quantity}</td>
            <td class="revenue-cell">${this.formatCurrency(productRevenue)}</td>
        </tr>
    `;
});

content += `
                    </tbody>
                </table>
            </div>
        </div>

        <div class="report-section payment-methods">
            <h3 class="section-title">💳 Payment Methods</h3>
            <div class="payment-grid">
`;

Object.entries(paymentMethods).forEach(([method, amount]) => {
    const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;

    content += `
        <div class="payment-card">
            <div class="payment-method">${method.charAt(0).toUpperCase() + method.slice(1)}</div>
            <div class="payment-amount">${this.formatCurrency(amount)}</div>
            <div class="payment-percentage">${percentage}% of total</div>
        </div>
    `;
});

content += `
            </div>
        </div>

        ${todaySales.length > 0 ? `
            <div class="report-summary">
                <h4 class="summary-title">📝 Summary</h4>
                <p class="summary-text">
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
                return sum + (sale.weight || 0) * 0.453592; // Convert lbs to kg
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
                weight = weight * 0.453592; // Convert to kg for consistent reporting
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
    <div class="meat-report-card">
        <div class="meat-report-header">
            <h2 class="report-title">🍗 Meat Sales Report</h2>
            <p class="report-subtitle">Weight-based meat sales analysis</p>
        </div>

        <div class="report-stats-grid">
            <div class="report-stat animals">
                <div class="stat-icon">🍖</div>
                <div class="stat-value">${totalAnimals}</div>
                <div class="stat-label">Total Animals</div>
            </div>
            <div class="report-stat weight">
                <div class="stat-icon">⚖️</div>
                <div class="stat-value">${totalWeight.toFixed(2)} kg</div>
                <div class="stat-label">Total Weight</div>
            </div>
            <div class="report-stat revenue">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${this.formatCurrency(totalRevenue)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="report-stat transactions">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${meatSales.length}</div>
                <div class="stat-label">Transactions</div>
            </div>
        </div>

        <div class="report-section product-breakdown">
            <h3 class="section-title">📋 Product Breakdown</h3>
            <div class="table-wrapper">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Animals</th>
                            <th>Weight (kg)</th>
                            <th>Avg Weight</th>
                            <th>Revenue</th>
                            <th>Avg Price/kg</th>
                        </tr>
                    </thead>
                    <tbody>
`;

Object.entries(productBreakdown).forEach(([product, data]) => {
    const avgWeight = data.animals > 0 ? (data.weight / data.animals).toFixed(2) : 0;
    const avgPricePerKg = data.weight > 0 ? (data.revenue / data.weight).toFixed(2) : 0;

    content += `
        <tr>
            <td class="product-cell">${product}</td>
            <td>${data.animals}</td>
            <td>${data.weight.toFixed(2)} kg</td>
            <td>${avgWeight} kg/animal</td>
            <td class="revenue-cell">${this.formatCurrency(data.revenue)}</td>
            <td>${this.formatCurrency(parseFloat(avgPricePerKg))}/kg</td>
        </tr>
    `;
});

content += `
                    </tbody>
                </table>
            </div>
        </div>

        ${totalWeight > 0 ? `
            <div class="report-section key-metrics">
                <h4 class="section-title">📊 Key Metrics</h4>
                <div class="metrics-grid">
                    <div class="metric">
                        <div class="metric-label">Average Weight per Animal</div>
                        <div class="metric-value">${(totalWeight / totalAnimals).toFixed(2)} kg</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Average Price per kg</div>
                        <div class="metric-value">${this.formatCurrency(totalRevenue / totalWeight)}/kg</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Average Sale Value</div>
                        <div class="metric-value">${this.formatCurrency(totalRevenue / meatSales.length)}</div>
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
            <link rel="stylesheet" href="print-report.css">
        </head>
        <body>
            <div class="report-header">
                <h1>Daily Sales Report</h1>
                <h3>${this.formatDate(this.getCurrentDate())}</h3>
            </div>
            ${printContent}
            <div class="report-actions no-print">
                <button onclick="window.print()" class="btn-print">Print Report</button>
                <button onclick="window.location.reload()" class="btn-close">Close</button>
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
            <link rel="stylesheet" href="print-report.css">
        </head>
        <body>
            <div class="report-header">
                <h1>Meat Sales Report</h1>
                <h3>Generated on ${this.formatDate(this.getCurrentDate())}</h3>
            </div>
            ${printContent}
            <div class="report-actions no-print">
                <button onclick="window.print()" class="btn-print">Print Report</button>
                <button onclick="window.location.reload()" class="btn-close">Close</button>
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
    }
};

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'sales-record';
    const MODULE_OBJECT = SalesRecordModule;
    
    console.log(`💰 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        // Use the registerModule method if available
        if (typeof window.FarmModules.registerModule === 'function') {
            window.FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
            console.log(`✅ ${MODULE_NAME} module registered successfully via registerModule!`);
        } else {
            // Manual registration as fallback
            // Ensure modules Map exists
            window.FarmModules.modules = window.FarmModules.modules || new Map();
            
            // Store the module
            window.FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
            window.FarmModules[MODULE_NAME] = MODULE_OBJECT;
            window.FarmModules.SalesRecord = MODULE_OBJECT;
            window.FarmModules.Sales = MODULE_OBJECT;
            
            console.log(`✅ ${MODULE_NAME} module registered successfully via manual registration!`);
        }
    } else {
        console.error('❌ FarmModules framework not found');
        // Create FarmModules if it doesn't exist
        window.FarmModules = {
            modules: new Map(),
            SalesRecord: MODULE_OBJECT,
            Sales: MODULE_OBJECT
        };
        window.FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
        window.FarmModules[MODULE_NAME] = MODULE_OBJECT;
        console.log(`⚠️ Created FarmModules and registered ${MODULE_NAME}`);
    }
})();
