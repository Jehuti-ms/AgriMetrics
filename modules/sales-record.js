// modules/sales-record.js - CSP COMPLIANT VERSION WITH ALL FIXES
console.log('💰 Loading Sales Records module...');

try {
    const SalesRecordModule = {
        name: 'sales-record',
        initialized: false,
        element: null,
        currentEditingId: null,
        pendingProductionSale: null,
        broadcaster: null,

        initialize() {
            console.log('💰 Initializing Sales Records...');
            
            if (!this.checkDependencies()) {
                console.error('❌ Sales Records initialization failed');
                return false;
            }
            
            this.element = document.getElementById('content-area');
            if (!this.element) {
                console.error('Content area element not found');
                return false;
            }
            
            if (window.Broadcaster) {
                this.broadcaster = window.Broadcaster;
                console.log('📡 Sales module connected to Data Broadcaster');
            }
            
            if (window.StyleManager) {
                window.StyleManager.registerComponent(this.name);
            }
            
            this.loadSalesData();
            this.renderModule();
            this.setupEventListeners();
            this.setupBroadcasterListeners();
            this.initialized = true;
            
            console.log('✅ Sales Records initialized');
            this.broadcastSalesLoaded();
            
            return true;
        },

        setupBroadcasterListeners() {
            if (!this.broadcaster) return;
            
            this.broadcaster.on('order-completed', (data) => {
                console.log('📡 Sales received order completion:', data);
                this.handleOrderCompletion(data);
            });
            
            this.broadcaster.on('production-updated', (data) => {
                console.log('📡 Sales received production update:', data);
                this.updateAvailableProductionItems(data);
            });
            
            this.broadcaster.on('inventory-updated', (data) => {
                console.log('📡 Sales received inventory update:', data);
                this.checkInventoryForSales(data);
            });
        },

        broadcastSalesLoaded() {
            if (!this.broadcaster) return;
            
            const sales = window.FarmModules.appData.sales || [];
            const today = this.getCurrentDate();
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
            
            this.broadcaster.broadcast('income-updated', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                amount: sale.totalAmount,
                type: 'sales',
                source: 'sale-record',
                saleId: sale.id,
                product: sale.product
            });
            
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
            
            this.broadcastSalesStats();
        },

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
            
            this.broadcaster.broadcast('income-removed', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                amount: sale.totalAmount,
                type: 'sales',
                source: 'sale-record',
                saleId: sale.id
            });
            
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
            
            this.broadcastSalesStats();
        },

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

        handleOrderCompletion(orderData) {
            console.log('🔄 Converting order to sale:', orderData);
            
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
            
            this.addSale(saleData);
            this.showNotification(`Order #${orderData.orderId} converted to sale`, 'success');
        },

        mapOrderItemToProduct(items) {
            if (!items || items.length === 0) return 'other';
            
            const firstItem = items[0];
            const productMap = {
                'eggs': 'eggs',
                'broilers': 'broilers-live',
                'layers': 'layers'
            };
            
            return productMap[firstItem.productId] || 'other';
        },

        calculateOrderQuantity(items) {
            return items.reduce((total, item) => total + (item.quantity || 0), 0);
        },

        calculateAveragePrice(orderData) {
            if (!orderData.items || orderData.items.length === 0) return 0;
            return orderData.totalAmount / this.calculateOrderQuantity(orderData.items);
        },

        updateAvailableProductionItems(productionData) {
            console.log('🔄 Updating available production items from broadcast');
            
            if (this.initialized && this.element) {
                const productionItemsSection = document.querySelector('.glass-card[style*="background: linear-gradient(135deg, #f0f9ff"]');
                if (productionItemsSection) {
                    setTimeout(() => {
                        const newProductionItems = this.renderProductionItems();
                        if (productionItemsSection.parentNode) {
                            productionItemsSection.outerHTML = newProductionItems;
                        }
                    }, 100);
                }
            }
        },

        checkInventoryForSales(inventoryData) {
            if (!inventoryData || !inventoryData.items) return;
            console.log('📦 Checking inventory for sales:', inventoryData.items.length, 'items');
        },

        navigateToProduction() {
            console.log('🔄 Navigating to Production module...');
            this.hideProductionItemsModal();
            
            const contentArea = document.getElementById('content-area');
            if (!contentArea) {
                this.showNotification('Content area not found', 'error');
                return;
            }
            
            if (window.FarmModules && window.FarmModules.showModule) {
                console.log('🚀 Using FarmModules.showModule("production")');
                window.FarmModules.showModule('production');
                return;
            }
            
            if (window.FarmModules && window.FarmModules.Production) {
                console.log('📦 Found Production module directly');
                contentArea.innerHTML = '';
                
                if (typeof window.FarmModules.Production.initialize === 'function') {
                    window.FarmModules.Production.initialize();
                } else if (typeof window.FarmModules.Production.renderModule === 'function') {
                    window.FarmModules.Production.renderModule();
                } else {
                    window.FarmModules.Production();
                }
                return;
            }
            
            if (window.FarmModules && window.FarmModules.modules) {
                console.log('🗺️ Checking modules Map');
                
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
            
            console.log('🌐 Trying URL hash navigation');
            window.location.hash = '#production';
            
            setTimeout(() => {
                if (window.location.hash === '#production') {
                    console.log('✅ URL hash set successfully');
                    setTimeout(() => {
                        location.reload();
                    }, 100);
                } else {
                    this.showNotification('Please select "Production" from the left sidebar menu', 'info');
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

        getCurrentDate() {
            if (window.DateUtils && window.DateUtils.getToday) {
                return window.DateUtils.getToday();
            }
            
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
            if (!date1 || !date2) return false;
            const d1 = this.formatDateForInput(date1);
            const d2 = this.formatDateForInput(date2);
            return d1 === d2;
        },

        normalizeDateForStorage(dateString) {
            if (window.DateUtils && window.DateUtils.toStorageFormat) {
                return window.DateUtils.toStorageFormat(dateString);
            }
            
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

        saveData() {
            localStorage.setItem('farm-sales-data', JSON.stringify(window.FarmModules.appData.sales));
            
            if (window.FarmModules.Income) {
                window.FarmModules.Income.updateFromSales();
            }
            
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
                'broilers-dressed': 5.50, 'pork': 4.25, 'beef': 6.75, 'chicken-parts': 3.95,
                'goat': 5.25, 'lamb': 6.50, 'broilers-live': 4.00, 'layers': 12.00,
                'chicks': 2.50, 'eggs': 3.25, 'tomatoes': 1.75, 'peppers': 2.25,
                'cucumbers': 1.50, 'lettuce': 1.25, 'carrots': 1.00, 'potatoes': 0.75,
                'milk': 2.50, 'cheese': 6.00, 'yogurt': 3.50, 'butter': 4.50,
                'honey': 8.00, 'jam': 5.00, 'bread': 2.75
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
            
            const productCount = new Set(productionRecords.map(r => r.product)).size;
            const totalProduced = productionRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
            const soldFromProduction = sales.filter(s => s.productionSource).length;
            
            return `
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div>
                            <h3 style="color: #0369a1; margin: 0; font-size: 18px;">🔄 Available Production Items</h3>
                            <p style="color: #0c4a6e; margin: 4px 0 0 0; font-size: 14px;">Sell directly from production records</p>
                        </div>
                        <button class="btn-primary" id="from-production-btn-2">Sell from Production</button>
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
                                <a href="#" class="production-nav-btn" data-action="show-production-items" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Browse available items →</a>
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
            
            const [product, date] = itemId.split('-').slice(0, 2);
            
            if (!product || !date) {
                this.showNotification('Could not parse production item data', 'error');
                return;
            }
            
            const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
            const matchingRecords = productionRecords.filter(record => 
                record.product === product && record.date === date
            );
            
            if (matchingRecords.length === 0) {
                this.showNotification('Production item not found', 'error');
                return;
            }
            
            const totalQuantity = matchingRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
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
            
            this.startSaleFromProduction(productionData);
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
                                <th style="padding: 12px 8px; text-align: left;">Date</th>
                                <th style="padding: 12px 8px; text-align: left;">Product</th>
                                <th style="padding: 12px 8px; text-align: left;">Customer</th>
                                <th style="padding: 12px 8px; text-align: left;">Animals/Quantity</th>
                                <th style="padding: 12px 8px; text-align: left;">Unit Price</th>
                                <th style="padding: 12px 8px; text-align: left;">Total</th>
                                <th style="padding: 12px 8px; text-align: left;">Source</th>
                                <th style="padding: 12px 8px; text-align: left;">Actions</th>
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
                                        <td style="padding: 12px 8px;">${this.formatDate(sale.date)}</td>
                                        <td style="padding: 12px 8px;">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <span style="font-size: 18px;">${this.getProductIcon(sale.product)}</span>
                                                <span style="font-weight: 500;">${this.formatProductName(sale.product)}</span>
                                                ${sourceBadge}
                                            </div>
                                        </td>
                                        <td style="padding: 12px 8px;">${sale.customer || 'Walk-in'}</td>
                                        <td style="padding: 12px 8px;">${quantityInfo}</td>
                                        <td style="padding: 12px 8px;">
                                            ${this.formatCurrency(sale.unitPrice)}
                                            ${sale.weightUnit === 'lbs' ? '/lb' : sale.weightUnit ? `/${sale.weightUnit}` : sale.priceUnit === 'per-lb' ? '/lb' : '/kg'}
                                        </td>
                                        <td style="padding: 12px 8px; font-weight: 600;">${this.formatCurrency(sale.totalAmount)}</td>
                                        <td style="padding: 12px 8px; font-size: 12px;">
                                            ${sale.productionSource ? 'Production' : 'Direct'}
                                        </td>
                                        <td style="padding: 12px 8px;">
                                            <div style="display: flex; gap: 4px;">
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
                <div class="module-container">
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
                            <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                            <div style="font-size: 24px; font-weight: bold;" id="today-sales">${this.formatCurrency(todaySales)}</div>
                            <div style="font-size: 14px;">Today's Revenue</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 24px; margin-bottom: 8px;">⚖️</div>
                            <div style="font-size: 24px; font-weight: bold;" id="total-meat-weight">${totalMeatWeight.toFixed(2)}</div>
                            <div style="font-size: 14px;">Meat Weight Sold</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 24px; margin-bottom: 8px;">🐄</div>
                            <div style="font-size: 24px; font-weight: bold;" id="total-animals">${totalAnimalsSold}</div>
                            <div style="font-size: 14px;">Animals Sold</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                            <div style="font-size: 24px; font-weight: bold;" id="total-sales">${sales.length}</div>
                            <div style="font-size: 14px;">Total Sales Records</div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-action-grid">
                        <button class="quick-action-btn" id="add-sale-btn">
                            <div style="font-size: 32px;">➕</div>
                            <span style="font-size: 14px; font-weight: 600;">Record Sale</span>
                            <span style="font-size: 12px;">Add new sale record</span>
                        </button>
                        <button class="quick-action-btn" id="from-production-btn">
                            <div style="font-size: 32px;">🔄</div>
                            <span style="font-size: 14px; font-weight: 600;">From Production</span>
                            <span style="font-size: 12px;">Sell from production items</span>
                        </button>
                        <button class="quick-action-btn" id="meat-sales-btn">
                            <div style="font-size: 32px;">🍗</div>
                            <span style="font-size: 14px; font-weight: 600;">Meat Sales</span>
                            <span style="font-size: 12px;">Weight-based sales report</span>
                        </button>
                        <button class="quick-action-btn" id="daily-report-btn">
                            <div style="font-size: 32px;">📊</div>
                            <span style="font-size: 14px; font-weight: 600;">Daily Report</span>
                            <span style="font-size: 12px;">Today's sales summary</span>
                        </button>
                    </div>

                    <!-- Production Items Available -->
                    ${this.renderProductionItems()}

                    <!-- Quick Sale Form -->
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="margin-bottom: 16px;">⚡ Quick Sale</h3>
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
                            <h3 style="font-size: 20px;">📋 Recent Sales</h3>
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
                                    <h4 style="margin: 0; text-align: center;">
                                        Sale Total: <span id="sale-total-amount" style="color: var(--primary-color);">$0.00</span>
                                    </h4>
                                    <div id="meat-summary" style="display: none; text-align: center; margin-top: 8px; font-size: 14px;">
                                        <div id="meat-summary-info">0 animals • 0 kg total • $0.00/animal average</div>
                                    </div>
                                    <div id="standard-summary" style="display: none; text-align: center; margin-top: 8px; font-size: 14px;">
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
                    <div class="popout-modal-content" style="max-width: 800px;">
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
                    <div class="popout-modal-content" style="max-width: 800px;">
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

        setupEventListeners() {
            console.log('🔧 Setting up event listeners...');
            
            this.removeEventListeners();
            
            const quickSaleForm = document.getElementById('quick-sale-form');
            if (quickSaleForm) {
                quickSaleForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleQuickSale();
                });
            }

            document.getElementById('add-sale')?.addEventListener('click', () => this.showSaleModal());
            document.getElementById('add-sale-btn')?.addEventListener('click', () => this.showSaleModal());
            document.getElementById('from-production-btn')?.addEventListener('click', () => this.showProductionItems());
            document.getElementById('from-production-btn-2')?.addEventListener('click', () => this.showProductionItems());
            document.getElementById('meat-sales-btn')?.addEventListener('click', () => this.generateMeatSalesReport());
            document.getElementById('daily-report-btn')?.addEventListener('click', () => this.generateDailyReport());
            
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
                const productionNavBtn = e.target.closest('.production-nav-btn');
                if (productionNavBtn) {
                    e.preventDefault();
                    const action = productionNavBtn.getAttribute('data-action');
                    if (action === 'navigate-to-production') {
                        this.navigateToProduction();
                    } else if (action === 'show-production-items') {
                        this.showProductionItems();
                    }
                }
            });
            
            document.addEventListener('click', (e) => {
                const sellItemBtn = e.target.closest('.sell-production-item-btn');
                if (sellItemBtn) {
                    e.preventDefault();
                    const itemId = sellItemBtn.getAttribute('data-item-id');
                    if (itemId) {
                        this.selectProductionItem(itemId);
                    }
                }
            });

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
                    
                    if (confirm('Are you sure you want to delete this sale?')) {
                        this.deleteSaleRecord(saleId);
                    }
                }
            });
            
            console.log('✅ Event listeners set up');
        },
        
        removeEventListeners() {
            const oldListeners = [
                'add-sale', 'add-sale-btn', 'from-production-btn', 'meat-sales-btn', 
                'daily-report-btn', 'save-sale', 'delete-sale', 'cancel-sale',
                'close-sale-modal', 'close-daily-report', 'close-daily-report-btn',
                'print-daily-report', 'close-meat-sales', 'close-meat-sales-btn', 
                'print-meat-sales', 'close-production-items', 'close-production-items-btn', 
                'quick-product', 'period-filter'
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
            const productSelect = document.getElementById('sale-product');
            if (productSelect) {
                productSelect.addEventListener('change', () => this.handleProductChange());
            }
            
            const unitSelect = document.getElementById('sale-unit');
            if (unitSelect) {
                unitSelect.addEventListener('change', () => {
                    this.updateStandardPriceLabel();
                    this.calculateSaleTotal();
                });
            }
            
            const fieldsToWatch = ['standard-quantity', 'standard-price', 'meat-animal-count', 'meat-weight', 'meat-price'];
            fieldsToWatch.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => this.calculateSaleTotal());
                }
            });
            
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

                document.getElementById('standard-quantity') && (document.getElementById('standard-quantity').value = '');
                document.getElementById('standard-price') && (document.getElementById('standard-price').value = '');
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
                
                document.getElementById('meat-animal-count')?.value = '';
                document.getElementById('meat-weight')?.value = '';
                document.getElementById('meat-price')?.value = '';
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
                'kg': 'per kg', 'lbs': 'per lb', 'birds': 'per bird', 'animals': 'per animal',
                'dozen': 'per dozen', 'liters': 'per liter', 'pieces': 'per piece',
                'case': 'per case', 'crate': 'per crate', 'bag': 'per bag',
                'bottle': 'per bottle', 'jar': 'per jar'
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
            const product = document.getElementById('sale-product')?.value;
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            
            let total = 0;
            
            if (meatProducts.includes(product)) {
                const animalCount = parseFloat(document.getElementById('meat-animal-count')?.value) || 0;
                const weight = parseFloat(document.getElementById('meat-weight')?.value) || 0;
                const weightUnit = document.getElementById('meat-weight-unit')?.value;
                const pricePerUnit = parseFloat(document.getElementById('meat-price')?.value) || 0;
                
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
                document.getElementById('quick-price').value = defaultPrices[product];
            }
        },

        handleQuickSale() {
            const product = document.getElementById('quick-product').value;
            const quantity = parseFloat(document.getElementById('quick-quantity').value);
            const unit = document.getElementById('quick-unit').value;
            const price = parseFloat(document.getElementById('quick-price').value);
            const customer = 'Walk-in (Quick Sale)';
            
            if (!product || !quantity || !price) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            const isMeatProduct = meatProducts.includes(product);
            
            const saleData = {
                id: 'SALE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                date: this.getCurrentDate(),
                customer: customer,
                product: product,
                unit: unit,
                quantity: quantity,
                unitPrice: price,
                totalAmount: quantity * price,
                paymentMethod: 'cash',
                paymentStatus: 'paid',
                notes: 'Quick sale from dashboard'
            };
            
            if (isMeatProduct) {
                saleData.weight = quantity;
                saleData.weightUnit = unit === 'lbs' ? 'lbs' : 'kg';
                saleData.animalCount = unit === 'animals' || unit === 'birds' ? quantity : 1;
            }
            
            this.addSale(saleData);
            
            document.getElementById('quick-product').value = '';
            document.getElementById('quick-quantity').value = '';
            document.getElementById('quick-unit').value = 'kg';
            document.getElementById('quick-price').value = '';
            
            this.showNotification('Quick sale recorded successfully', 'success');
        },

        // Modal management
        showSaleModal() {
            this.currentEditingId = null;
            document.getElementById('sale-modal-title').textContent = 'Record Sale';
            document.getElementById('sale-id').value = '';
            document.getElementById('production-source-id').value = '';
            document.getElementById('production-source-notice').style.display = 'none';
            document.getElementById('delete-sale').style.display = 'none';
            
            document.getElementById('sale-date').value = this.getCurrentDate();
            document.getElementById('sale-customer').value = '';
            document.getElementById('sale-product').value = '';
            document.getElementById('sale-unit').value = '';
            document.getElementById('sale-payment').value = 'cash';
            document.getElementById('sale-status').value = 'paid';
            document.getElementById('sale-notes').value = '';
            
            document.getElementById('standard-quantity').value = '';
            document.getElementById('standard-price').value = '';
            document.getElementById('meat-animal-count').value = '';
            document.getElementById('meat-weight').value = '';
            document.getElementById('meat-weight-unit').value = 'kg';
            document.getElementById('meat-price').value = '';
            
            this.handleProductChange();
            
            if (this.pendingProductionSale) {
                this.prefillFromProduction(this.pendingProductionSale);
                this.pendingProductionSale = null;
            }
            
            document.getElementById('sale-modal').classList.remove('hidden');
        },

        hideSaleModal() {
            document.getElementById('sale-modal').classList.add('hidden');
            this.currentEditingId = null;
        },

        showDailyReportModal() {
            document.getElementById('daily-report-modal').classList.remove('hidden');
        },

        hideDailyReportModal() {
            document.getElementById('daily-report-modal').classList.add('hidden');
        },

        showMeatSalesModal() {
            document.getElementById('meat-sales-modal').classList.remove('hidden');
        },

        hideMeatSalesModal() {
            document.getElementById('meat-sales-modal').classList.add('hidden');
        },

        showProductionItemsModal() {
            document.getElementById('production-items-modal').classList.remove('hidden');
            this.renderProductionItemsModal();
        },

        hideProductionItemsModal() {
            document.getElementById('production-items-modal').classList.add('hidden');
        },

        hideAllModals() {
            this.hideSaleModal();
            this.hideDailyReportModal();
            this.hideMeatSalesModal();
            this.hideProductionItemsModal();
        },

        // Sale CRUD operations
        saveSale() {
            const saleId = document.getElementById('sale-id').value;
            const product = document.getElementById('sale-product').value;
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            const isMeatProduct = meatProducts.includes(product);
            
            // Validation
            if (!product) {
                this.showNotification('Please select a product', 'error');
                return;
            }
            
            let quantity, weight, animalCount, unitPrice, totalAmount;
            
            if (isMeatProduct) {
                animalCount = parseFloat(document.getElementById('meat-animal-count').value);
                weight = parseFloat(document.getElementById('meat-weight').value);
                unitPrice = parseFloat(document.getElementById('meat-price').value);
                
                if (!animalCount || animalCount <= 0) {
                    this.showNotification('Please enter number of animals', 'error');
                    return;
                }
                if (!weight || weight <= 0) {
                    this.showNotification('Please enter total weight', 'error');
                    return;
                }
                if (!unitPrice || unitPrice <= 0) {
                    this.showNotification('Please enter price per unit', 'error');
                    return;
                }
                
                totalAmount = weight * unitPrice;
            } else {
                quantity = parseFloat(document.getElementById('standard-quantity').value);
                unitPrice = parseFloat(document.getElementById('standard-price').value);
                
                if (!quantity || quantity <= 0) {
                    this.showNotification('Please enter quantity', 'error');
                    return;
                }
                if (!unitPrice || unitPrice <= 0) {
                    this.showNotification('Please enter price per unit', 'error');
                    return;
                }
                
                totalAmount = quantity * unitPrice;
            }
            
            const saleData = {
                id: saleId || 'SALE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                date: document.getElementById('sale-date').value,
                customer: document.getElementById('sale-customer').value || 'Walk-in',
                product: product,
                unit: document.getElementById('sale-unit').value,
                quantity: isMeatProduct ? animalCount : quantity,
                weight: isMeatProduct ? weight : null,
                weightUnit: isMeatProduct ? document.getElementById('meat-weight-unit').value : null,
                animalCount: isMeatProduct ? animalCount : null,
                unitPrice: unitPrice,
                totalAmount: totalAmount,
                paymentMethod: document.getElementById('sale-payment').value,
                paymentStatus: document.getElementById('sale-status').value,
                notes: document.getElementById('sale-notes').value,
                productionSource: document.getElementById('production-source-notice').style.display !== 'none',
                productionSourceId: document.getElementById('production-source-id').value || null
            };
            
            if (saleId) {
                const oldSaleIndex = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
                if (oldSaleIndex !== -1) {
                    const oldSale = window.FarmModules.appData.sales[oldSaleIndex];
                    window.FarmModules.appData.sales[oldSaleIndex] = saleData;
                    this.broadcastSaleUpdated(oldSale, saleData);
                    this.showNotification('Sale updated successfully', 'success');
                }
            } else {
                window.FarmModules.appData.sales.push(saleData);
                this.broadcastSaleRecorded(saleData);
                this.showNotification('Sale recorded successfully', 'success');
            }
            
            this.saveData();
            this.renderModule();
            this.hideSaleModal();
        },

        addSale(saleData) {
            if (!saleData.id) {
                saleData.id = 'SALE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            }
            
            window.FarmModules.appData.sales.push(saleData);
            this.broadcastSaleRecorded(saleData);
            this.saveData();
            this.renderModule();
        },

        editSale(saleId) {
            const sale = window.FarmModules.appData.sales.find(s => s.id === saleId);
            if (!sale) {
                this.showNotification('Sale not found', 'error');
                return;
            }
            
            this.currentEditingId = saleId;
            document.getElementById('sale-modal-title').textContent = 'Edit Sale';
            document.getElementById('sale-id').value = sale.id;
            document.getElementById('delete-sale').style.display = 'inline-block';
            
            document.getElementById('sale-date').value = this.formatDateForInput(sale.date);
            document.getElementById('sale-customer').value = sale.customer || '';
            document.getElementById('sale-product').value = sale.product;
            document.getElementById('sale-unit').value = sale.unit;
            document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
            document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
            document.getElementById('sale-notes').value = sale.notes || '';
            
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            const isMeatProduct = meatProducts.includes(sale.product);
            
            if (isMeatProduct) {
                document.getElementById('meat-animal-count').value = sale.animalCount || sale.quantity || '';
                document.getElementById('meat-weight').value = sale.weight || '';
                document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
                document.getElementById('meat-price').value = sale.unitPrice || '';
            } else {
                document.getElementById('standard-quantity').value = sale.quantity || '';
                document.getElementById('standard-price').value = sale.unitPrice || '';
            }
            
            if (sale.productionSourceId) {
                document.getElementById('production-source-id').value = sale.productionSourceId;
                document.getElementById('production-source-notice').style.display = 'block';
                document.getElementById('production-source-info').textContent = 
                    `Source: ${sale.product} (ID: ${sale.productionSourceId})`;
            } else {
                document.getElementById('production-source-notice').style.display = 'none';
            }
            
            this.handleProductChange();
            this.calculateSaleTotal();
            
            document.getElementById('sale-modal').classList.remove('hidden');
        },

        deleteSale() {
            if (!this.currentEditingId) return;
            
            if (confirm('Are you sure you want to delete this sale?')) {
                this.deleteSaleRecord(this.currentEditingId);
            }
        },

        deleteSaleRecord(saleId) {
            const saleIndex = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
            if (saleIndex === -1) {
                this.showNotification('Sale not found', 'error');
                return;
            }
            
            const deletedSale = window.FarmModules.appData.sales[saleIndex];
            window.FarmModules.appData.sales.splice(saleIndex, 1);
            
            this.broadcastSaleDeleted(deletedSale);
            this.saveData();
            this.renderModule();
            this.hideSaleModal();
            
            this.showNotification('Sale deleted successfully', 'success');
        },

        // Reports
        generateDailyReport() {
            const today = this.getCurrentDate();
            const sales = window.FarmModules.appData.sales || [];
            const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today));
            
            if (todaySales.length === 0) {
                document.getElementById('daily-report-content').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No sales today</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">No sales recorded for ${this.formatDate(today)}</div>
                    </div>
                `;
                this.showDailyReportModal();
                return;
            }
            
            const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            const meatSales = todaySales.filter(sale => meatProducts.includes(sale.product));
            const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
            const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
            
            const productGroups = {};
            todaySales.forEach(sale => {
                if (!productGroups[sale.product]) {
                    productGroups[sale.product] = {
                        name: this.formatProductName(sale.product),
                        count: 0,
                        revenue: 0,
                        weight: 0,
                        icon: this.getProductIcon(sale.product)
                    };
                }
                productGroups[sale.product].count += sale.quantity || sale.animalCount || 0;
                productGroups[sale.product].revenue += sale.totalAmount;
                productGroups[sale.product].weight += sale.weight || 0;
            });
            
            const paymentMethods = {};
            todaySales.forEach(sale => {
                const method = sale.paymentMethod || 'cash';
                if (!paymentMethods[method]) {
                    paymentMethods[method] = { count: 0, revenue: 0 };
                }
                paymentMethods[method].count += 1;
                paymentMethods[method].revenue += sale.totalAmount;
            });
            
            let reportHTML = `
                <div style="padding: 20px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; color: var(--text-primary);">Daily Sales Report</h2>
                        <div style="color: var(--text-secondary);">${this.formatDate(today)}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 24px; color: var(--primary-color); font-weight: bold;">${todaySales.length}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Total Sales</div>
                        </div>
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 24px; color: var(--primary-color); font-weight: bold;">${this.formatCurrency(totalRevenue)}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                        </div>
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 24px; color: var(--primary-color); font-weight: bold;">${totalAnimalsSold}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Animals Sold</div>
                        </div>
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); text-align: center;">
                            <div style="font-size: 24px; color: var(--primary-color); font-weight: bold;">${totalMeatWeight.toFixed(1)}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Total Meat Weight</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <div>
                            <h3 style="margin-bottom: 12px; color: var(--text-primary);">Products Sold</h3>
                            <div style="background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                ${Object.values(productGroups).map(product => `
                                    <div style="padding: 12px 16px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 20px;">${product.icon}</span>
                                            <div>
                                                <div style="font-weight: 500;">${product.name}</div>
                                                <div style="font-size: 12px; color: var(--text-secondary);">${product.count} ${product.weight > 0 ? `• ${product.weight.toFixed(1)} kg` : ''}</div>
                                            </div>
                                        </div>
                                        <div style="font-weight: 600; color: var(--primary-color);">${this.formatCurrency(product.revenue)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="margin-bottom: 12px; color: var(--text-primary);">Payment Methods</h3>
                            <div style="background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                ${Object.entries(paymentMethods).map(([method, data]) => `
                                    <div style="padding: 12px 16px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-weight: 500;">${method.charAt(0).toUpperCase() + method.slice(1)}</div>
                                        <div style="display: flex; gap: 16px; align-items: center;">
                                            <div style="font-size: 12px; color: var(--text-secondary);">${data.count} sales</div>
                                            <div style="font-weight: 600; color: var(--primary-color);">${this.formatCurrency(data.revenue)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                        <h3 style="margin-bottom: 12px; color: #0369a1;">Recent Sales</h3>
                        <div style="max-height: 300px; overflow-y: auto;">
                            ${todaySales.slice(0, 10).map(sale => `
                                <div style="padding: 8px 12px; border-bottom: 1px solid #dbeafe; display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 18px;">${this.getProductIcon(sale.product)}</span>
                                        <div>
                                            <div style="font-weight: 500;">${sale.customer || 'Walk-in'}</div>
                                            <div style="font-size: 12px; color: #64748b;">${this.formatProductName(sale.product)}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 600; color: #0369a1;">${this.formatCurrency(sale.totalAmount)}</div>
                                        <div style="font-size: 12px; color: #64748b;">${sale.paymentMethod}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('daily-report-content').innerHTML = reportHTML;
            this.showDailyReportModal();
        },

        printDailyReport() {
            const printWindow = window.open('', '_blank');
            const reportContent = document.getElementById('daily-report-content').innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Daily Sales Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1, h2, h3 { color: #333; }
                        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
                        .product-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                        @media print {
                            button { display: none; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${reportContent}
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                        Printed on ${new Date().toLocaleString()}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        },

        generateMeatSalesReport() {
            const sales = window.FarmModules.appData.sales || [];
            const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
            const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
            
            if (meatSales.length === 0) {
                document.getElementById('meat-sales-content').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🍗</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No meat sales recorded</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Record meat sales to see the report</div>
                    </div>
                `;
                this.showMeatSalesModal();
                return;
            }
            
            const totalRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
            const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
            const avgPricePerKg = totalWeight > 0 ? totalRevenue / totalWeight : 0;
            
            const meatGroups = {};
            meatSales.forEach(sale => {
                if (!meatGroups[sale.product]) {
                    meatGroups[sale.product] = {
                        name: this.formatProductName(sale.product),
                        sales: 0,
                        weight: 0,
                        animals: 0,
                        revenue: 0,
                        icon: this.getProductIcon(sale.product),
                        avgPrice: 0
                    };
                }
                meatGroups[sale.product].sales += 1;
                meatGroups[sale.product].weight += sale.weight || 0;
                meatGroups[sale.product].animals += sale.animalCount || sale.quantity || 0;
                meatGroups[sale.product].revenue += sale.totalAmount;
            });
            
            Object.values(meatGroups).forEach(group => {
                group.avgPrice = group.weight > 0 ? group.revenue / group.weight : 0;
            });
            
            const today = this.getCurrentDate();
            const todayMeatSales = meatSales.filter(sale => this.areDatesEqual(sale.date, today));
            const todayRevenue = todayMeatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const todayWeight = todayMeatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
            
            let reportHTML = `
                <div style="padding: 20px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="margin: 0; color: var(--text-primary);">Meat Sales Report</h2>
                        <div style="color: var(--text-secondary);">All Time • ${meatSales.length} total sales</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 16px; background: #fef2f2; border-radius: 12px; border: 1px solid #fed7d7; text-align: center;">
                            <div style="font-size: 24px; color: #dc2626; font-weight: bold;">${totalAnimals}</div>
                            <div style="font-size: 14px; color: #991b1b;">Total Animals</div>
                        </div>
                        <div style="padding: 16px; background: #fef2f2; border-radius: 12px; border: 1px solid #fed7d7; text-align: center;">
                            <div style="font-size: 24px; color: #dc2626; font-weight: bold;">${totalWeight.toFixed(1)}</div>
                            <div style="font-size: 14px; color: #991b1b;">Total Weight (kg)</div>
                        </div>
                        <div style="padding: 16px; background: #fef2f2; border-radius: 12px; border: 1px solid #fed7d7; text-align: center;">
                            <div style="font-size: 24px; color: #dc2626; font-weight: bold;">${this.formatCurrency(totalRevenue)}</div>
                            <div style="font-size: 14px; color: #991b1b;">Total Revenue</div>
                        </div>
                        <div style="padding: 16px; background: #fef2f2; border-radius: 12px; border: 1px solid #fed7d7; text-align: center;">
                            <div style="font-size: 24px; color: #dc2626; font-weight: bold;">${this.formatCurrency(avgPricePerKg)}</div>
                            <div style="font-size: 14px; color: #991b1b;">Avg Price/kg</div>
                        </div>
                    </div>
                    
                    <div style="background: #fff; border-radius: 8px; border: 1px solid #fed7d7; margin-bottom: 24px;">
                        <h3 style="margin: 0; padding: 16px; border-bottom: 1px solid #fed7d7; color: #7c2d12;">📊 Meat Products Breakdown</h3>
                        <div>
                            ${Object.values(meatGroups).map(product => `
                                <div style="padding: 16px; border-bottom: 1px solid #fed7d7; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 24px;">${product.icon}</span>
                                        <div>
                                            <div style="font-weight: 600; color: #7c2d12;">${product.name}</div>
                                            <div style="font-size: 12px; color: #9ca3af;">${product.sales} sale${product.sales !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 600; color: #dc2626;">${product.animals}</div>
                                        <div style="font-size: 12px; color: #9ca3af;">Animals</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 600; color: #dc2626;">${product.weight.toFixed(1)} kg</div>
                                        <div style="font-size: 12px; color: #9ca3af;">Weight</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 600; color: #dc2626;">${this.formatCurrency(product.avgPrice)}</div>
                                        <div style="font-size: 12px; color: #9ca3af;">Avg/kg</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 600; color: #16a34a;">${this.formatCurrency(product.revenue)}</div>
                                        <div style="font-size: 12px; color: #9ca3af;">Revenue</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${todayMeatSales.length > 0 ? `
                        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd;">
                            <h3 style="margin-bottom: 12px; color: #0369a1;">📅 Today's Meat Sales (${this.formatDate(today)})</h3>
                            <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                                <div style="flex: 1; text-align: center; padding: 12px; background: white; border-radius: 6px; border: 1px solid #bae6fd;">
                                    <div style="font-weight: 600; color: #0369a1;">${todayWeight.toFixed(1)} kg</div>
                                    <div style="font-size: 12px; color: #64748b;">Weight Today</div>
                                </div>
                                <div style="flex: 1; text-align: center; padding: 12px; background: white; border-radius: 6px; border: 1px solid #bae6fd;">
                                    <div style="font-weight: 600; color: #0369a1;">${this.formatCurrency(todayRevenue)}</div>
                                    <div style="font-size: 12px; color: #64748b;">Revenue Today</div>
                                </div>
                                <div style="flex: 1; text-align: center; padding: 12px; background: white; border-radius: 6px; border: 1px solid #bae6fd;">
                                    <div style="font-weight: 600; color: #0369a1;">${todayMeatSales.length}</div>
                                    <div style="font-size: 12px; color: #64748b;">Sales Today</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('meat-sales-content').innerHTML = reportHTML;
            this.showMeatSalesModal();
        },

        printMeatSalesReport() {
            const printWindow = window.open('', '_blank');
            const reportContent = document.getElementById('meat-sales-content').innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Meat Sales Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1, h2, h3 { color: #333; }
                        .meat-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                        .meat-card { border: 1px solid #fca5a5; background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; }
                        .meat-product-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 15px; padding: 10px; border-bottom: 1px solid #fee2e2; }
                        @media print {
                            button { display: none; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${reportContent}
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                        Printed on ${new Date().toLocaleString()}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        },

        renderProductionItemsModal() {
            const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
            const sales = window.FarmModules.appData.sales || [];
            
            if (productionRecords.length === 0) {
                document.getElementById('production-items-content').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No production items available</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Add production records to sell them</div>
                        <button class="btn-primary production-nav-btn" data-action="navigate-to-production"
                                style="margin-top: 16px; background: #0ea5e9; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                            ➕ Go to Production Module
                        </button>
                    </div>
                `;
                return;
            }
            
            const groupedProduction = {};
            productionRecords.forEach(record => {
                const key = record.product + '-' + record.date;
                if (!groupedProduction[key]) {
                    groupedProduction[key] = {
                        product: record.product,
                        productName: this.formatProductName(record.product),
                        date: record.date,
                        unit: record.unit || 'units',
                        totalQuantity: 0,
                        notes: record.notes || '',
                        icon: this.getProductIcon(record.product),
                        availableQuantity: 0
                    };
                }
                groupedProduction[key].totalQuantity += record.quantity || 0;
            });
            
            Object.values(groupedProduction).forEach(item => {
                const soldQuantity = sales.reduce((sum, sale) => {
                    if (sale.productionSourceId === `${item.product}-${item.date}` ||
                        (sale.product === item.product && sale.date === item.date && sale.productionSource)) {
                        return sum + (sale.quantity || sale.animalCount || 0);
                    }
                    return sum;
                }, 0);
                item.availableQuantity = item.totalQuantity - soldQuantity;
            });
            
            const availableItems = Object.values(groupedProduction).filter(item => item.availableQuantity > 0);
            
            if (availableItems.length === 0) {
                document.getElementById('production-items-content').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">No items available for sale</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">All production items have been sold or reserved</div>
                    </div>
                `;
                return;
            }
            
            let modalHTML = `
                <div style="padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 12px 0; color: var(--text-primary);">Select Production Item to Sell</h3>
                        <div style="color: var(--text-secondary); font-size: 14px;">
                            ${availableItems.length} item${availableItems.length !== 1 ? 's' : ''} available for sale
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                        ${availableItems.map(item => `
                            <div style="background: var(--glass-bg); border-radius: 12px; border: 2px solid #bae6fd; padding: 16px;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <div style="font-size: 32px;">${item.icon}</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
                                            ${item.productName}
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">
                                            Produced: ${this.formatDate(item.date)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                                    <div style="text-align: center; padding: 8px; background: #f0f9ff; border-radius: 6px;">
                                        <div style="font-size: 18px; font-weight: bold; color: #0369a1;">${item.totalQuantity}</div>
                                        <div style="font-size: 11px; color: #64748b;">Total Produced</div>
                                    </div>
                                    <div style="text-align: center; padding: 8px; background: #f0f9ff; border-radius: 6px;">
                                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">${item.availableQuantity}</div>
                                        <div style="font-size: 11px; color: #64748b;">Available</div>
                                    </div>
                                </div>
                                
                                ${item.notes ? `
                                    <div style="padding: 8px; background: #f8fafc; border-radius: 6px; margin-bottom: 12px;">
                                        <div style="font-size: 12px; color: #64748b;">${item.notes}</div>
                                    </div>
                                ` : ''}
                                
                                <button class="btn-primary sell-production-item-btn" 
                                        data-item-id="${item.product}-${item.date}"
                                        style="width: 100%; background: #0ea5e9; border: none; padding: 10px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                                    🛒 Sell This Item
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="color: #0ea5e9;">💡</span>
                            <div style="font-weight: 600; color: #0369a1;">How Production Sales Work</div>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
                            <li>Selling from production tracks inventory automatically</li>
                            <li>The sale will be linked to the production record</li>
                            <li>Available quantity updates in real-time</li>
                            <li>Helps with traceability and reporting</li>
                        </ul>
                    </div>
                </div>
            `;
            
            document.getElementById('production-items-content').innerHTML = modalHTML;
        },

        showNotification(message, type = 'info') {
            if (window.FarmModules && window.FarmModules.showNotification) {
                window.FarmModules.showNotification(message, type);
                return;
            }
            
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            const bgColors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            
            notification.style.backgroundColor = bgColors[type] || bgColors.info;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
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

    // Export the module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SalesRecordModule;
    } else if (window.FarmModules) {
        console.log('📦 Registering Sales module with FarmModules');
        window.FarmModules.Sales = SalesRecordModule;
        window.FarmModules.modules = window.FarmModules.modules || new Map();
        window.FarmModules.modules.set('sales', SalesRecordModule);
        window.FarmModules.modules.set('sales-record', SalesRecordModule);
    } else {
        console.error('❌ FarmModules not found');
    }

} catch (error) {
    console.error('❌ Error in sales-record module:', error);
    throw error;
}

        unload() {
            console.log('📦 Unloading Sales module...');
            this.initialized = false;
            this.element = null;
            this.broadcaster = null;
            this.removeEventListeners();
        }
    };

    // Export for CommonJS (Node.js)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SalesRecordModule;
    }

} catch (error) {
    console.error('❌ Error in sales-record module:', error);
    throw error;
}

// ==================== UNIVERSAL REGISTRATION ====================
(function() {
    const MODULE_NAME = 'sales-record';
    const MODULE_OBJECT = SalesRecordModule;
    
    console.log(`💰 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        // Check if registerModule function exists
        if (typeof FarmModules.registerModule === 'function') {
            FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        } else {
            // Manual registration
            FarmModules.modules = FarmModules.modules || new Map();
            FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
            FarmModules[MODULE_NAME] = MODULE_OBJECT;
            FarmModules.SalesRecord = MODULE_OBJECT;
            FarmModules.Sales = MODULE_OBJECT;
            
            // Add to module registry
            if (!FarmModules.moduleRegistry) {
                FarmModules.moduleRegistry = [];
            }
            
            const moduleInfo = {
                id: MODULE_NAME,
                name: 'Sales Records',
                displayName: 'Sales Records',
                description: 'Track product sales, revenue, and inventory management',
                icon: '💰',
                version: '1.0.0',
                module: MODULE_OBJECT,
                category: 'sales',
                order: 2,
                dependencies: ['app-data', 'broadcaster'],
                initializeOnLoad: false
            };
            
            // Check if module already registered
            const existingIndex = FarmModules.moduleRegistry.findIndex(m => m.id === MODULE_NAME);
            if (existingIndex >= 0) {
                FarmModules.moduleRegistry[existingIndex] = moduleInfo;
            } else {
                FarmModules.moduleRegistry.push(moduleInfo);
            }
        }
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
        // Create minimal FarmModules structure
        window.FarmModules = {
            modules: new Map(),
            moduleRegistry: []
        };
        window.FarmModules.modules.set(MODULE_NAME, MODULE_OBJECT);
        window.FarmModules[MODULE_NAME] = MODULE_OBJECT;
        console.log(`⚠️ Created FarmModules and registered ${MODULE_NAME}`);
    }
})();
