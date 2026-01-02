// modules/sales-record.js - COMPLETE FIXED VERSION WITH DATA BROADCASTER
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

    // ==================== NEW NAVIGATION METHODS ====================

showProductionModule() {
    console.log('🚜 Navigating to Production module...');
    
    // Hide current module
    this.hideAllModals();
    
    // Check if Production module exists
    if (window.FarmModules && window.FarmModules.Production) {
        // If Production module has a showModule method, use it
        if (typeof window.FarmModules.Production.showModule === 'function') {
            window.FarmModules.Production.showModule();
        } 
        // If Production module has an initialize method
        else if (typeof window.FarmModules.Production.initialize === 'function') {
            // Clear content area and show Production module
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = '';
                window.FarmModules.Production.initialize();
            }
        } else {
            this.showNotification('Production module not properly loaded', 'error');
        }
    } else {
        // Try to load Production module if not available
        this.loadProductionModule();
    }
},

// Add this method to load Production module dynamically
loadProductionModule() {
    console.log('📦 Attempting to load Production module...');
    
    // Check if module exists in the FarmModules system
    if (window.FarmModules && window.FarmModules.modules && window.FarmModules.modules.has('production')) {
        const ProductionModule = window.FarmModules.modules.get('production');
        if (typeof ProductionModule.initialize === 'function') {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = '';
                ProductionModule.initialize();
            }
        }
    } else {
        this.showNotification('Production module not found. Please ensure it is loaded.', 'error');
        
        // Provide alternative instructions
        setTimeout(() => {
            this.showNotification(
                'Production module is typically at /modules/production.js', 
                'info'
            );
        }, 2000);
    }
},

// Add this method for navigation
navigateToProduction() {
    this.hideProductionItemsModal();
    
    // Try different methods to show Production module
    if (window.FarmModules && window.FarmModules.Production) {
        // Method 1: Use showModule if available
        if (typeof window.FarmModules.Production.showModule === 'function') {
            window.FarmModules.Production.showModule();
            return;
        }
        
        // Method 2: Use initialize if available
        if (typeof window.FarmModules.Production.initialize === 'function') {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = '';
                window.FarmModules.Production.initialize();
            }
            return;
        }
    }
    
    // Method 3: Try the FarmModules navigation system
    if (window.FarmModules && typeof window.FarmModules.navigateToModule === 'function') {
        window.FarmModules.navigateToModule('production');
        return;
    }
    
    // Method 4: Fallback - Show notification and try to trigger sidebar
    this.showNotification('Please select Production module from the sidebar', 'info');
    
    // Try to trigger sidebar click
    setTimeout(() => {
        const productionNavItem = document.querySelector('[data-module="production"], .nav-item[href*="production"]');
        if (productionNavItem) {
            productionNavItem.click();
        } else {
            // Last resort: Use URL hash
            window.location.hash = '#production';
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    }, 500);
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
                    <button class="btn-primary" 
                            onclick="window.FarmModules.SalesRecord.navigateToProduction()" 
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
                <button class="btn-primary" id="from-production-btn-2" 
                        onclick="window.FarmModules.SalesRecord.showProductionItems()"
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
                        <a href="#" onclick="window.FarmModules.SalesRecord.showProductionItems(); return false;" 
                           style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Browse available items →</a>
                    </div>
                </div>
                <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                    <button class="btn-outline" 
                            onclick="window.FarmModules.SalesRecord.navigateToProduction()"
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

    // FIXED: Changed button class names in renderSalesTable
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
                                        ${sale.weightUnit === 'lbs' ? '/lb' : sale.weightUnit ? `/${sale.weightUnit}` : sale.priceUnit === 'per-lb' ? '/lb' : '/kg'}
                                    </td>
                                    <td style="padding: 12px 8px; color: var(--text-primary); font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                    <td style="padding: 12px 8px; color: var(--text-secondary); font-size: 12px;">
                                        ${sale.productionSource ? 'Production' : 'Direct'}
                                    </td>
                                    <td style="padding: 12px 8px;">
                                        <div style="display: flex; gap: 4px;">
                                            <button class="btn-icon edit-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Edit">✏️</button>
                                            <button class="btn-icon delete-sale-btn" data-id="${sale.id}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--text-secondary);" title="Delete">🗑️</button>
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

    // === FIXED EVENT LISTENERS AND DELETE METHODS ===

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

    // Modal buttons
    document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
    document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleModal());
    document.getElementById('from-production-btn')?.addEventListener('click', () => this.showProductionItems());
    document.getElementById('from-production-btn-2')?.addEventListener('click', () => this.showProductionItems()); // ADD THIS LINE
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

        // FIXED: Single delegated event listener for edit/delete buttons
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
        });
        
        console.log('✅ Event listeners set up');
    },
    
    // Method to remove existing event listeners
    removeEventListeners() {
        // Remove any previously attached listeners to prevent duplicates
        const oldListeners = [
            'add-sale', 'add-sale-btn', 'from-production-btn', 'meat-sales-btn', 
            'daily-report-btn', 'view-production-items', 'save-sale', 'delete-sale',
            'cancel-sale', 'close-sale-modal', 'close-daily-report', 'close-daily-report-btn',
            'print-daily-report', 'close-meat-sales', 'close-meat-sales-btn', 'print-meat-sales',
            'close-production-items', 'close-production-items-btn', 'quick-product', 'period-filter'
        ];
        
        oldListeners.forEach(id => {
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
    },

    updateMeatLabels() {
        const weightUnit = document.getElementById('meat-weight-unit')?.value;
        
        const priceLabel = document.getElementById('meat-price-label');
        const priceUnitLabel = document.getElementById('meat-price-unit-label');
        const avgLabel = document.getElementById('meat-avg-label');
        const avgWeightElement = document.getElementById('meat-avg-weight');
        
        if (weightUnit === 'lbs') {
            if (priceLabel) priceLabel.textContent = 'Price per lb *';
            if (priceUnitLabel) priceUnitLabel.textContent = 'per lb';
            if (avgLabel) avgLabel.textContent = 'Average per Animal';
            if (avgWeightElement && avgWeightElement.textContent.includes('kg')) {
                avgWeightElement.textContent = avgWeightElement.textContent.replace('kg', 'lbs');
            }
        } else {
            if (priceLabel) priceLabel.textContent = 'Price per kg *';
            if (priceUnitLabel) priceUnitLabel.textContent = 'per kg';
            if (avgLabel) avgLabel.textContent = 'Average per Animal';
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
        if (weightUnit) {
            // Don't reset if user already selected something
            if (!weightUnit.value) {
                weightUnit.value = 'kg';
            }
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
            // Only set default if no unit is selected yet
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
            // If user already selected a unit, keep it but update the label
        }
        
        // Update the price label based on current unit selection
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

// Add this new method to update the price label
updateStandardPriceLabel() {
    const unitSelect = document.getElementById('sale-unit');
    const productSelect = document.getElementById('sale-product');
    const standardPriceUnitLabel = document.getElementById('standard-price-unit-label');
    
    if (!unitSelect || !standardPriceUnitLabel || !productSelect) return;
    
    const unit = unitSelect.value;
    const product = productSelect.value;
    
    let labelText = 'per unit';
    
    // Map units to their labels
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
    
    // Special cases based on product
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

// Also update calculateSaleTotal to show correct units in summary
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
                const weightUnitText = weightUnit === 'lbs' ? 'lbs' : 'kg';
                meatSummary.textContent = `0 animals • 0 ${weightUnitText} total • $0.00 per animal`;
                avgWeightElement.textContent = `0.00 ${weightUnitText}/animal`;
                avgValueElement.textContent = '$0.00/animal';
            }
        }
    } else {
        const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
        const price = parseFloat(document.getElementById('standard-price')?.value) || 0;
        const unit = document.getElementById('sale-unit')?.value || 'unit';
        
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

// Helper method to get display name for units
getUnitDisplayName(unit, product) {
    const unitNames = {
        'kg': 'kg',
        'lbs': 'lbs',
        'birds': product.includes('chicks') ? 'chicks' : 
                 product.includes('layers') ? 'layers' : 'birds',
        'animals': product === 'pork' ? 'pigs' :
                   product === 'beef' ? 'heads' :
                   product === 'goat' ? 'goats' :
                   product === 'lamb' ? 'lambs' : 'animals',
        'dozen': 'dozen',
        'liters': 'liters',
        'pieces': 'pieces',
        'case': 'cases',
        'crate': 'crates',
        'bag': 'bags',
        'bottle': 'bottles',
        'jar': 'jars'
    };
    
    return unitNames[unit] || unit;
},

// Helper method to get price unit label
getPriceUnitLabel(unit, product) {
    const priceLabels = {
        'kg': 'per kg',
        'lbs': 'per lb',
        'birds': product.includes('chicks') ? 'per chick' : 
                 product.includes('layers') ? 'per layer' : 'per bird',
        'animals': product === 'pork' ? 'per pig' :
                   product === 'beef' ? 'per head' :
                   product === 'goat' ? 'per goat' :
                   product === 'lamb' ? 'per lamb' : 'per animal',
        'dozen': 'per dozen',
        'liters': 'per liter',
        'pieces': 'per piece',
        'case': 'per case',
        'crate': 'per crate',
        'bag': 'per bag',
        'bottle': 'per bottle',
        'jar': 'per jar'
    };
    
    return priceLabels[unit] || 'per unit';
},

// Also add a unit change listener to setupFormFieldListeners()
setupFormFieldListeners() {
    // Product change
    const productSelect = document.getElementById('sale-product');
    if (productSelect) {
        productSelect.addEventListener('change', () => this.handleProductChange());
    }
    
    // Unit change - NEW: Update labels when unit changes
    const unitSelect = document.getElementById('sale-unit');
    if (unitSelect) {
        unitSelect.addEventListener('change', () => {
            this.updateStandardPriceLabel();
            this.calculateSaleTotal();
        });
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
},
    handleQuickProductChange() {
    const productSelect = document.getElementById('quick-product');
    const selectedValue = productSelect.value;
    const unitSelect = document.getElementById('quick-unit');
    
    if (!unitSelect) return;
    
    // Only set default if no unit is selected yet
    if (!unitSelect.value || unitSelect.value === '') {
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
        
        document.getElementById('sale-modal-title').textContent = 'Record Sale';
        document.getElementById('delete-sale').style.display = 'none';
        document.getElementById('production-source-notice').style.display = 'none';
        
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
                    <button class="btn-primary" 
                            onclick="window.FarmModules.SalesRecord.navigateToProduction()"
                            style="background: #0ea5e9; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                        ➕ Go to Production Module
                    </button>
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
                        <button style="flex: 1; padding: 8px 12px; background: var(--primary-color); color: white; 
                                border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;"
                                onclick="window.FarmModules.SalesRecord.selectProductionItem('${item.id}')">
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
                <button class="btn-outline" 
                        onclick="window.FarmModules.SalesRecord.navigateToProduction()"
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
        const product = document.getElementById('quick-product')?.value;
        const quantity = parseFloat(document.getElementById('quick-quantity')?.value) || 0;
        const unit = document.getElementById('quick-unit')?.value;
        const price = parseFloat(document.getElementById('quick-price')?.value) || 0;

        if (!product || !quantity || !price) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const today = this.getCurrentDate();

        const saleData = {
            id: 'SALE-' + Date.now().toString().slice(-6),
            product: product,
            quantity: quantity,
            unit: unit,
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

    // ✅ MODIFIED: Enhanced saveSale with broadcasting
    saveSale() {
        const saleId = document.getElementById('sale-id')?.value;
        let date = document.getElementById('sale-date')?.value;
        const customer = document.getElementById('sale-customer')?.value;
        const product = document.getElementById('sale-product')?.value;
        const unit = document.getElementById('sale-unit')?.value;
        const paymentMethod = document.getElementById('sale-payment')?.value;
        const paymentStatus = document.getElementById('sale-status')?.value;
        const notes = document.getElementById('sale-notes')?.value;

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
            const animalCount = parseInt(document.getElementById('meat-animal-count')?.value) || 0;
            const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
            const weightUnit = document.getElementById('meat-weight-unit')?.value;
            const unitPrice = parseFloat(document.getElementById('meat-price')?.value) || 0;
            
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
            const quantity = parseFloat(document.getElementById('standard-quantity')?.value) || 0;
            const unitPrice = parseFloat(document.getElementById('standard-price')?.value) || 0;
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

    // ✅ MODIFIED: Enhanced deleteSaleRecord with broadcasting
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

    // ✅ MODIFIED: Enhanced addSale with broadcasting
    addSale(saleData) {
        saleData.id = 'SALE-' + Date.now().toString().slice(-6);
        window.FarmModules.appData.sales.push(saleData);
        this.saveData();
        
        // ✅ Broadcast new sale recorded
        this.broadcastSaleRecorded(saleData);
        
        this.renderModule();
        return saleData.id;
    },

    // ... [All other existing methods remain exactly the same] ...

    // ✅ MODIFIED: Enhanced generateDailyReport to include real-time data
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
    
    // ✅ MODIFIED: Enhanced generateMeatSalesReport to include real-time data
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
        const printContent = document.getElementById('daily-report-content').innerHTML;
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
        const printContent = document.getElementById('meat-sales-content').innerHTML;
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

    // Utility methods (keep all existing ones)
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
    }
};

// Export the module
window.FarmModules = window.FarmModules || {};
window.FarmModules.SalesRecord = SalesRecordModule;

console.log('✅ Enhanced Sales Records module loaded successfully with Data Broadcaster');

// ==================== FIXED REGISTRATION ====================
// This will properly register with FarmModules framework
(function() {
    const moduleName = 'sales-record';
    console.log(`📦 Registering ${moduleName} module with FarmModules...`);
    
    if (window.FarmModules) {
        // Method 1: Use registerModule if available
        if (typeof FarmModules.registerModule === 'function') {
            FarmModules.registerModule(moduleName, SalesRecordModule);
            console.log(`✅ ${moduleName} registered via FarmModules.registerModule()`);
        }
        // Method 2: Directly add to modules Map
        else {
            // Ensure modules Map exists
            FarmModules.modules = FarmModules.modules || new Map();
            
            // Add to modules Map
            FarmModules.modules.set(moduleName, SalesRecordModule);
            
            // Also set as property for backward compatibility
            FarmModules[moduleName] = SalesRecordModule;
            FarmModules.SalesRecord = SalesRecordModule;
            
            console.log(`✅ ${moduleName} added to FarmModules.modules Map`);
            console.log(`✅ Also available as FarmModules.${moduleName} and FarmModules.SalesRecord`);
        }
        
        // Verify registration
        console.log(`🔍 Verification: ${moduleName} in modules Map?`, 
                   FarmModules.modules?.has(moduleName));
    } else {
        console.error('❌ FarmModules framework not found!');
    }
})();
