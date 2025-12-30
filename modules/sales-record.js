// modules/sales-record.js - COMPLETE FIXED VERSION
console.log('💰 Loading Enhanced Sales Records module...');

// Get DateUtils from the correct location
const DateUtils = window.DateUtils || {};

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
        console.log('📅 DateUtils available:', !!window.DateUtils);
        return true;
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
        if (DateUtils.getToday) {
            return DateUtils.getToday();
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
        
        if (DateUtils.formatDateForInput) {
            return DateUtils.formatDateForInput(dateString);
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
        if (DateUtils.formatDateForDisplay) {
            return DateUtils.formatDateForDisplay(dateString);
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
        if (DateUtils.toStorageFormat) {
            return DateUtils.toStorageFormat(dateString);
        }
        
        // Fallback implementation
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return this.formatDateForInput(dateString);
    },

    // === FIXED EVENT LISTENERS AND DELETE METHODS FROM PREVIOUS FIX ===

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
    
    // NEW: Method to remove existing event listeners
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

    // FIXED: Single delete method for both table and modal deletions
    deleteSaleRecord(saleId) {
        console.log('🗑️ Deleting sale record:', saleId);
        
        const sales = window.FarmModules.appData.sales || [];
        const saleIndex = sales.findIndex(s => s.id === saleId);
        
        if (saleIndex === -1) {
            console.error('❌ Sale not found for deletion:', saleId);
            this.showNotification('Sale not found', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this sale?')) {
            return;
        }
        
        // Remove from sales array
        window.FarmModules.appData.sales.splice(saleIndex, 1);
        
        // Update localStorage
        this.saveData();
        
        // Remove associated income record
        this.removeIncomeRecord(saleId);
        
        // Update UI
        this.updateSummary();
        this.updateSalesTable();
        
        this.showNotification('Sale deleted successfully', 'success');
        console.log('✅ Sale deleted successfully');
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

    // === REST OF THE ORIGINAL METHODS (with DateUtils integration) ===

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

            <!-- POPOUT MODALS (same as before) -->
            <!-- [MODAL HTML CODE - SAME AS BEFORE, TOO LONG TO REPEAT] -->
        `;

        this.setupEventListeners();
    },

    // === ALL THE OTHER METHODS FROM ORIGINAL MODULE ===
    // (setupFormFieldListeners, handleProductChange, calculateSaleTotal, etc.)
    
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

    // === MODAL METHODS ===
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
            this.updateSale(saleId, saleData);
        } else {
            this.addSale(saleData);
        }

        this.hideSaleModal();
    },

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

        this.hideAllModals();
        
        const modal = document.getElementById('sale-modal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('✅ Modal shown');
        }
        
        const saleIdInput = document.getElementById('sale-id');
        if (saleIdInput) {
            saleIdInput.value = sale.id;
            console.log('✅ Set sale ID:', sale.id);
        }
        
        document.getElementById('sale-modal-title').textContent = 'Edit Sale';
        document.getElementById('delete-sale').style.display = 'block';
        document.getElementById('production-source-notice').style.display = 'none';
        
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = this.formatDateForInput(sale.date);
            console.log('✅ Set date:', dateInput.value, 'from original:', sale.date);
        }
        
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product || '';
        document.getElementById('sale-unit').value = sale.unit || 'animals';
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        console.log('✅ Basic fields populated');
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(sale.product)) {
            console.log('✅ This is a meat product');
            
            const meatSection = document.getElementById('meat-section');
            const standardSection = document.getElementById('standard-section');
            const meatSummary = document.getElementById('meat-summary');
            const standardSummary = document.getElementById('standard-summary');
            
            if (meatSection) meatSection.style.display = 'block';
            if (standardSection) standardSection.style.display = 'none';
            if (meatSummary) meatSummary.style.display = 'block';
            if (standardSummary) standardSummary.style.display = 'none';
            
            document.getElementById('meat-animal-count').value = sale.animalCount || sale.quantity || '';
            document.getElementById('meat-weight').value = sale.weight || '';
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.unitPrice || '';
            
            document.getElementById('standard-quantity').value = '';
            document.getElementById('standard-price').value = '';
            
            setTimeout(() => {
                this.updateMeatLabels();
            }, 10);
            
        } else {
            console.log('✅ This is a standard product');
            
            const meatSection = document.getElementById('meat-section');
            const standardSection = document.getElementById('standard-section');
            const meatSummary = document.getElementById('meat-summary');
            const standardSummary = document.getElementById('standard-summary');
            
            if (meatSection) meatSection.style.display = 'none';
            if (standardSection) standardSection.style.display = 'block';
            if (meatSummary) meatSummary.style.display = 'none';
            if (standardSummary) standardSummary.style.display = 'block';
            
            document.getElementById('standard-quantity').value = sale.quantity || '';
            document.getElementById('standard-price').value = sale.unitPrice || '';
            
            document.getElementById('meat-animal-count').value = '';
            document.getElementById('meat-weight').value = '';
            document.getElementById('meat-price').value = '';
        }
        
        setTimeout(() => {
            this.calculateSaleTotal();
            console.log('✅ Total calculated');
        }, 100);
        
        this.setupFormFieldListeners();
        
        console.log('✅ Edit sale modal ready');
    },

    deleteSale() {
        const saleId = document.getElementById('sale-id')?.value;
        
        if (confirm('Are you sure you want to delete this sale?')) {
            this.deleteSaleRecord(saleId);
            this.hideSaleModal();
        }
    },

    // === UTILITY METHODS ===
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

    updateSummary() {
        const today = this.getCurrentDate();
        const sales = window.FarmModules.appData.sales || [];
        
        // Use our own areDatesEqual method
        const todaySales = sales.filter(sale => this.areDatesEqual(sale.date, today))
                               .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalAnimalsSold = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);

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
        const salesTable = document.getElementById('sales-table');
        if (salesTable) {
            salesTable.innerHTML = this.renderSalesTable(period);
        }
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
