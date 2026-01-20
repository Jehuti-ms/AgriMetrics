// modules/sales-record.js - FIXED VERSION
console.log('💰 Loading Enhanced Sales Records module...');

const SalesRecordModule = {
    name: 'sales-record',
    initialized: false,
    element: null,
    currentEditingId: null,
    pendingProductionSale: null,
    broadcaster: null,

    // ==================== INITIALIZATION ====================
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
        this.setupBroadcasterListeners();
        this.initialized = true;
        
        console.log('✅ Enhanced Sales Records initialized with Data Broadcaster');
        
        // ✅ Broadcast sales loaded
        this.broadcastSalesLoaded();
        
        return true;
    },

    // ==================== FIXED: DEPENDENCY CHECK ====================
    checkDependencies() {
        if (!window.FarmModules) {
            console.error('❌ FarmModules framework not available');
            return false;
        }
        
        // Initialize appData if not exists
        if (!window.FarmModules.appData) {
            window.FarmModules.appData = {};
            console.log('📦 Created appData in FarmModules');
        }
        
        if (!window.FarmModules.appData.sales) {
            window.FarmModules.appData.sales = [];
            console.log('📦 Created sales array in appData');
        }
        
        console.log('🔍 Checking for DateUtils...');
        if (!window.DateUtils) {
            console.warn('⚠️ DateUtils not found, using fallback methods');
            this.initializeDateUtilsFallback();
        } else {
            console.log('✅ DateUtils available');
        }
        
        return true;
    },

    // ==================== FIXED: DATE UTILS FALLBACK ====================
    initializeDateUtilsFallback() {
        // Create fallback DateUtils if not available
        if (!window.DateUtils) {
            window.DateUtils = {
                getToday: () => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                },
                
                formatDateForInput: (dateString) => {
                    if (!dateString) return window.DateUtils.getToday();
                    
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                        return dateString;
                    }
                    
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return window.DateUtils.getToday();
                    
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                },
                
                formatDateForDisplay: (dateString) => {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) {
                        return dateString || 'Invalid date';
                    }
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                },
                
                toStorageFormat: (dateString) => {
                    if (dateString.includes('T')) {
                        return dateString.split('T')[0];
                    }
                    return window.DateUtils.formatDateForInput(dateString);
                },
                
                areDatesEqual: (date1, date2) => {
                    if (!date1 || !date2) return false;
                    const d1 = window.DateUtils.formatDateForInput(date1);
                    const d2 = window.DateUtils.formatDateForInput(date2);
                    return d1 === d2;
                }
            };
            console.log('📅 Created DateUtils fallback');
        }
    },

    // ==================== FIXED: DATE METHODS ====================
    getCurrentDate() {
        if (window.DateUtils && window.DateUtils.getToday) {
            return window.DateUtils.getToday();
        }
        
        // Fallback implementation
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateForInput(dateString) {
        if (window.DateUtils && window.DateUtils.formatDateForInput) {
            return window.DateUtils.formatDateForInput(dateString);
        }
        
        // Fallback implementation
        if (!dateString) return this.getCurrentDate();
        
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
            return dateString || 'Invalid date';
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    areDatesEqual(date1, date2) {
        if (window.DateUtils && window.DateUtils.areDatesEqual) {
            return window.DateUtils.areDatesEqual(date1, date2);
        }
        
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

    // ==================== FIXED: DATA MANAGEMENT ====================
    loadSalesData() {
        try {
            const savedData = localStorage.getItem('farm-sales-data');
            if (savedData) {
                window.FarmModules.appData.sales = JSON.parse(savedData);
                console.log('📊 Loaded sales data:', window.FarmModules.appData.sales.length, 'records');
            } else {
                window.FarmModules.appData.sales = [];
                console.log('📊 Initialized empty sales data');
            }
        } catch (e) {
            console.error('Error parsing sales data:', e);
            window.FarmModules.appData.sales = [];
            localStorage.removeItem('farm-sales-data'); // Clear corrupt data
        }
    },

    saveData() {
        try {
            localStorage.setItem('farm-sales-data', JSON.stringify(window.FarmModules.appData.sales));
            
            // ✅ Broadcast data saved
            if (this.broadcaster) {
                this.broadcaster.broadcast('sales-data-saved', {
                    module: 'sales-record',
                    timestamp: new Date().toISOString(),
                    salesCount: window.FarmModules.appData.sales.length
                });
            }
            
            console.log('💾 Saved sales data:', window.FarmModules.appData.sales.length, 'records');
        } catch (e) {
            console.error('Error saving sales data:', e);
        }
    },

    // ==================== FIXED: BROADCASTER INTEGRATION ====================
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
        
        // Broadcast income update for dashboard
        this.broadcaster.broadcast('income-updated', {
            module: 'sales-record',
            timestamp: new Date().toISOString(),
            amount: sale.totalAmount,
            type: 'sales',
            source: 'sale-record',
            saleId: sale.id,
            product: sale.product
        });
        
        // If it's a meat sale, broadcast weight update
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
        
        // Update dashboard stats
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

    // ==================== FIXED: PRODUCTION INTEGRATION ====================
    handleOrderCompletion(orderData) {
        console.log('🔄 Converting order to sale:', orderData);
        
        // Create sale from order
        const saleData = {
            id: 'ORDER-' + (orderData.orderId || Date.now()),
            date: this.getCurrentDate(),
            customer: orderData.customerName || 'Order Customer',
            product: this.mapOrderItemToProduct(orderData.items),
            unit: 'items',
            quantity: this.calculateOrderQuantity(orderData.items),
            unitPrice: this.calculateAveragePrice(orderData),
            totalAmount: orderData.totalAmount || 0,
            paymentMethod: 'order',
            paymentStatus: 'paid',
            notes: orderData.orderId ? `From order #${orderData.orderId}` : 'From online order',
            orderSource: true,
            orderId: orderData.orderId
        };
        
        // Add the sale
        this.addSale(saleData);
        
        this.showNotification(`Order converted to sale`, 'success');
    },

    mapOrderItemToProduct(items) {
        if (!items || items.length === 0) return 'other';
        
        // Map common order items to sales products
        const firstItem = items[0];
        const productId = firstItem.productId || '';
        const name = (firstItem.name || '').toLowerCase();
        
        if (name.includes('egg')) return 'eggs';
        if (name.includes('chicken') || name.includes('broiler')) return 'broilers-dressed';
        if (name.includes('pork')) return 'pork';
        if (name.includes('beef')) return 'beef';
        if (name.includes('milk')) return 'milk';
        if (name.includes('honey')) return 'honey';
        
        return 'other';
    },

    calculateOrderQuantity(items) {
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    calculateAveragePrice(orderData) {
        if (!orderData.items || orderData.items.length === 0) return 0;
        const totalItems = this.calculateOrderQuantity(orderData.items);
        return totalItems > 0 ? (orderData.totalAmount || 0) / totalItems : 0;
    },

    // Add this method to the SalesRecordModule object:

// ==================== FIXED: RENDER SALES TABLE METHOD ====================
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

// Also need to add these missing form field listener methods:

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

// And these helper methods:

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
    }
},
    
    // ==================== FIXED: RENDER MODULE ====================
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
            <style>
                .production-items-list {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                .production-items-list::-webkit-scrollbar {
                    width: 8px;
                }
                .production-items-list::-webkit-scrollbar-track {
                    background: var(--glass-bg);
                    border-radius: 4px;
                }
                .production-items-list::-webkit-scrollbar-thumb {
                    background: var(--glass-border);
                    border-radius: 4px;
                }
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
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

    // ==================== FIXED: EVENT LISTENERS ====================
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
            
            // Handle production navigation buttons
            const productionNavBtn = e.target.closest('.production-nav-btn');
            if (productionNavBtn) {
                e.preventDefault();
                e.stopPropagation();
                const action = productionNavBtn.getAttribute('data-action');
                this.handleProductionNavAction(action);
            }
            
            // Handle sell production item buttons
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

    // ==================== FIXED: PRODUCTION ITEMS ====================
    renderProductionItems() {
        // Get production data
        const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        if (productionRecords.length === 0) {
            return `
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1;">
                    <div style="text-align: center; padding: 16px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <h3 style="color: #475569; margin-bottom: 8px;">No Production Items</h3>
                        <p style="color: #64748b; margin-bottom: 16px;">Add production records to sell them here</p>
                        <button class="btn-primary production-nav-btn" data-action="navigate-to-production" 
                                style="background: #0ea5e9; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                            ➕ Add Production Records
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Calculate available items
        const productCount = new Set(productionRecords.map(r => r.product || r.type || 'Unspecified')).size;
        const totalProduced = productionRecords.reduce((sum, r) => sum + (r.quantity || r.count || 0), 0);
        
        // Get sales data for sold from production count
        const sales = window.FarmModules.appData.sales || [];
        const soldFromProduction = sales.filter(s => s.productionSource).length;
        
        return `
            <div class="glass-card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h3 style="color: #0369a1; margin: 0; font-size: 18px;">🔄 Available Production Items</h3>
                        <p style="color: #0c4a6e; margin: 4px 0 0 0; font-size: 14px;">Sell directly from production records</p>
                    </div>
                    <button class="btn-primary production-nav-btn" data-action="show-production-items"
                            style="background: #0ea5e9; border: none; padding: 8px 16px; border-radius: 8px; color: white; font-weight: 500; cursor: pointer;">
                        Browse Production Items
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
            </div>
        `;
    },

    showProductionItems() {
        console.log('🔄 Showing production items for sale...');
        this.hideAllModals();
        
        // Get production records from localStorage
        const productionRecords = JSON.parse(localStorage.getItem('farm-production') || '[]');
        
        // Get current sales to check what's already been sold
        const existingSales = window.FarmModules.appData.sales || [];
        
        // Group available production items
        const availableProducts = [];
        const productMap = {};
        
        productionRecords.forEach(record => {
            const product = record.product || record.type || 'Unspecified';
            const date = record.date || this.getCurrentDate();
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
            
            productMap[key].totalQuantity += record.quantity || record.count || 0;
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
            
            availableProducts.forEach((item) => {
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
            
            content += '</div>';
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

    // ==================== FIXED: SALES METHODS ====================
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

        // Validate required fields
        if (!date || !product || !unit || !paymentMethod) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Normalize date
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
            
            // Validate meat sale fields
            if (animalCount <= 0) {
                this.showNotification('Number of animals must be greater than 0', 'error');
                return;
            }
            
            if (weight <= 0) {
                this.showNotification('Weight must be greater than 0', 'error');
                return;
            }
            
            if (unitPrice <= 0) {
                this.showNotification('Price per kg must be greater than 0', 'error');
                return;
            }
            
            const totalAmount = weight * unitPrice;
            const priceUnit = weightUnit === 'lbs' ? 'per-lb' : 'per-kg';
            
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
                priceUnit: priceUnit
            };
        } else {
            const quantityInput = document.getElementById('standard-quantity');
            const priceInput = document.getElementById('standard-price');
            
            const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
            const unitPrice = priceInput ? parseFloat(priceInput.value) || 0 : 0;
            
            // Validate standard product fields
            if (quantity <= 0) {
                this.showNotification('Quantity must be greater than 0', 'error');
                return;
            }
            
            if (unitPrice <= 0) {
                this.showNotification('Price must be greater than 0', 'error');
                return;
            }
            
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

        // Handle production source
        if (this.pendingProductionSale) {
            saleData.productionSource = true;
            saleData.productionSourceId = this.pendingProductionSale.id;
        }

        if (saleId) {
            // Update existing sale
            const oldSale = window.FarmModules.appData.sales.find(s => s.id === saleId);
            const index = window.FarmModules.appData.sales.findIndex(s => s.id === saleId);
            if (index !== -1) {
                window.FarmModules.appData.sales[index] = saleData;
                
                // Broadcast sale updated
                if (oldSale && this.broadcaster) {
                    this.broadcaster.broadcast('sale-updated', {
                        module: 'sales-record',
                        timestamp: new Date().toISOString(),
                        saleId: saleData.id,
                        oldTotal: oldSale.totalAmount,
                        newTotal: saleData.totalAmount
                    });
                }
                
                this.showNotification('Sale updated successfully!', 'success');
            }
        } else {
            // Add new sale
            window.FarmModules.appData.sales.push(saleData);
            
            // Broadcast new sale recorded
            this.broadcastSaleRecorded(saleData);
            
            this.showNotification('Sale recorded successfully!', 'success');
        }

        this.saveData();
        this.renderModule();
        this.hideSaleModal();
        this.pendingProductionSale = null;
    },

    deleteSaleRecord(saleId) {
        console.log('🗑️ Deleting sale:', saleId);
        
        // Find the sale before deleting
        const saleToDelete = window.FarmModules.appData.sales.find(s => s.id === saleId);
        
        // Filter out the sale to be deleted
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        
        // Save the updated data
        this.saveData();
        
        // Broadcast sale deleted
        if (saleToDelete && this.broadcaster) {
            this.broadcaster.broadcast('sale-deleted', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                saleId: saleToDelete.id,
                amount: saleToDelete.totalAmount,
                product: saleToDelete.product
            });
        }
        
        // Update the display
        this.renderModule();
        
        // Hide modal if open
        this.hideSaleModal();
        
        // Show notification
        this.showNotification('Sale deleted successfully!', 'success');
    },

    // ==================== FIXED: UTILITY METHODS ====================
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
            'bread': '🍞',
            'other': '📦'
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
            'jam': 'Jam',
            'bread': 'Bread',
            'other': 'Other'
        };
        return nameMap[product] || product.charAt(0).toUpperCase() + product.slice(1).replace(/-/g, ' ');
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
    
    removeEventListeners() {
        // This is a simplified version - in a real app, you'd use event delegation
        // or properly store and remove event listeners
        console.log('🗑️ Removing event listeners');
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
            window.FarmModules.modules = window.FarmModules.modules || new Map();
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
