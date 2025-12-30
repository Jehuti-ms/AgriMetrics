// modules/sales-record.js - FIXED VERSION
console.log('💰 Loading Enhanced Sales Records module...');

// DON'T redeclare DateUtils - just reference the existing one
// const DateUtils = window.DateUtils || {}; // REMOVE THIS LINE

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

    // Date methods using DateUtils - FIXED to use window.DateUtils directly
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

    // === REST OF THE METHODS (abbreviated for brevity) ===
    // [Include all other methods from the previous complete version here]
    // This includes: prefillFromProduction, setDefaultPrice, loadSalesData, saveData,
    // renderModule, showSaleModal, saveSale, editSale, deleteSale, etc.
    
    // Only showing a few key methods to keep the response manageable
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

        // ... rest of saveSale method unchanged from previous version ...
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

    // Add other utility methods as needed...

};

// Register module - FIXED to properly register with FarmModules
console.log('✅ Enhanced Sales Records module loaded successfully!');

if (window.FarmModules && window.FarmModules.registerModule) {
    window.FarmModules.registerModule('sales-record', SalesRecordModule);
    console.log('📝 Sales Record module registered with FarmModules framework');
} else {
    console.warn('⚠️ FarmModules framework not available, registering globally');
    window.FarmModules = window.FarmModules || {};
    window.FarmModules.SalesRecord = SalesRecordModule;
    
    // Make sure it's also in the modules object
    if (window.FarmModules.modules) {
        window.FarmModules.modules['sales-record'] = SalesRecordModule;
    } else {
        window.FarmModules.modules = {
            'sales-record': SalesRecordModule
        };
    }
}
