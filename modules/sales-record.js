    renderProductionItems() {
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
                            <div style="font-size: 13px; color: #475569;">
                                ${item.quantity ? `Quantity: ${item.quantity}` : ''}
                                ${item.totalWeight ? ` • Weight: ${item.totalWeight} ${item.weightUnit || 'kg'}` : ''}
                                ${item.count ? ` • Count: ${item.count}` : ''}
                            </div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                                ${item.date ? `Produced: ${item.date}` : ''}
                                ${item.harvestDate ? `Harvested: ${item.harvestDate}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${availableProducts.length > 3 ? `
                    <div style="text-align: center; margin-top: 12px;">
                        <span style="color: #64748b; font-size: 13px;">
                            + ${availableProducts.length - 3} more items available
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    },

    getProductIcon(product) {
        const iconMap = {
            'broiler': '🐔',
            'pig': '🐖',
            'pork': '🐖',
            'beef': '🐄',
            'cow': '🐄',
            'goat': '🐐',
            'lamb': '🐑',
            'sheep': '🐑',
            'chicken': '🍗',
            'egg': '🥚',
            'eggs': '🥚',
            'milk': '🥛',
            'cheese': '🧀',
            'yogurt': '🥛',
            'butter': '🧈',
            'honey': '🍯',
            'jam': '🍓',
            'tomato': '🍅',
            'tomatoes': '🍅',
            'pepper': '🌶️',
            'peppers': '🌶️',
            'cucumber': '🥒',
            'cucumbers': '🥒',
            'lettuce': '🥬',
            'carrot': '🥕',
            'carrots': '🥕',
            'potato': '🥔',
            'potatoes': '🥔',
            'bread': '🍞',
            'other': '📦'
        };
        
        const productLower = product.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (productLower.includes(key)) {
                return icon;
            }
        }
        
        return '📦';
    },

    selectProductionItem(itemId) {
        const productionModule = window.FarmModules.Production;
        if (!productionModule) {
            console.error('Production module not available');
            return;
        }

        const productionData = productionModule.getProductionItem(itemId);
        if (!productionData) {
            console.error('Production item not found:', itemId);
            return;
        }

        console.log('🎯 Selecting production item:', productionData);
        this.startSaleFromProduction(productionData);
    },

    setupEventListeners() {
        this.setupSaleModalListeners();
        this.setupQuickSaleListeners();
        this.setupButtonListeners();
        this.setupFilterListeners();
    },

    setupSaleModalListeners() {
        const modal = document.getElementById('sale-modal');
        if (!modal) return;

        // Open modal buttons
        const addSaleBtns = ['add-sale', 'add-sale-btn', 'from-production-btn'];
        addSaleBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => this.showSaleModal());
        });

        // Close modal buttons
        const closeBtns = ['close-sale-modal', 'cancel-sale'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => this.hideSaleModal());
        });

        // Product change
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            productSelect.addEventListener('change', () => this.handleProductChange());
        }

        // Meat section calculations
        const meatInputs = ['meat-animal-count', 'meat-weight', 'meat-price', 'meat-weight-unit'];
        meatInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.addEventListener('input', () => this.calculateMeatSale());
        });

        // Standard section calculations
        const standardInputs = ['standard-quantity', 'standard-price'];
        standardInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.addEventListener('input', () => this.calculateStandardSale());
        });

        // Save sale
        const saveBtn = document.getElementById('save-sale');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveSale());

        // Delete sale
        const deleteBtn = document.getElementById('delete-sale');
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteSale());

        // Payment status change
        const paymentStatus = document.getElementById('sale-status');
        if (paymentStatus) {
            paymentStatus.addEventListener('change', (e) => {
                if (e.target.value === 'partial') {
                    this.showPartialPaymentModal();
                }
            });
        }
    },

    setupQuickSaleListeners() {
        const quickForm = document.getElementById('quick-sale-form');
        if (quickForm) {
            quickForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSale();
            });
        }

        // Quick product change
        const quickProduct = document.getElementById('quick-product');
        if (quickProduct) {
            quickProduct.addEventListener('change', () => {
                const product = quickProduct.value;
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
                    'honey': 8.00
                };

                if (defaultPrices[product]) {
                    document.getElementById('quick-price').value = defaultPrices[product];
                }

                // Set default unit
                const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
                const unitSelect = document.getElementById('quick-unit');
                if (meatProducts.includes(product)) {
                    unitSelect.value = 'kg';
                } else if (product === 'eggs') {
                    unitSelect.value = 'dozen';
                } else if (product === 'broilers-live' || product === 'layers' || product === 'chicks') {
                    unitSelect.value = 'birds';
                } else {
                    unitSelect.value = 'kg';
                }
            });
        }
    },

    setupButtonListeners() {
        // Daily report button
        const dailyReportBtn = document.getElementById('daily-report-btn');
        if (dailyReportBtn) dailyReportBtn.addEventListener('click', () => this.showDailyReport());

        // Meat sales button
        const meatSalesBtn = document.getElementById('meat-sales-btn');
        if (meatSalesBtn) meatSalesBtn.addEventListener('click', () => this.showMeatSalesReport());

        // View production items
        const viewProductionBtn = document.getElementById('view-production-items');
        if (viewProductionBtn) viewProductionBtn.addEventListener('click', () => this.showProductionItems());

        // Close report modals
        const closeDailyBtn = document.getElementById('close-daily-report-btn');
        if (closeDailyBtn) closeDailyBtn.addEventListener('click', () => this.hideDailyReport());

        const closeMeatBtn = document.getElementById('close-meat-sales-btn');
        if (closeMeatBtn) closeMeatBtn.addEventListener('click', () => this.hideMeatSalesReport());

        const closeProductionBtn = document.getElementById('close-production-items-btn');
        if (closeProductionBtn) closeProductionBtn.addEventListener('click', () => this.hideProductionItems());

        // Print buttons
        const printDailyBtn = document.getElementById('print-daily-report');
        if (printDailyBtn) printDailyBtn.addEventListener('click', () => this.printDailyReport());

        const printMeatBtn = document.getElementById('print-meat-sales');
        if (printMeatBtn) printMeatBtn.addEventListener('click', () => this.printMeatSalesReport());
    },

    setupFilterListeners() {
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.renderSalesTable(e.target.value);
            });
        }
    },

    showSaleModal(editingId = null) {
        console.log('📝 Showing sale modal, editing ID:', editingId);
        this.currentEditingId = editingId;
        
        const modal = document.getElementById('sale-modal');
        const modalTitle = document.getElementById('sale-modal-title');
        const deleteBtn = document.getElementById('delete-sale');
        const productionSourceNotice = document.getElementById('production-source-notice');
        const productionSourceInfo = document.getElementById('production-source-info');
        const productionSourceId = document.getElementById('production-source-id');
        
        // Reset form
        const form = document.getElementById('sale-form');
        if (form) form.reset();
        
        // Set today's date
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = this.getTodayLocal();
        
        if (editingId) {
            // Editing existing sale
            modalTitle.textContent = 'Edit Sale Record';
            deleteBtn.style.display = 'inline-block';
            this.loadSaleForEditing(editingId);
            productionSourceNotice.style.display = 'none';
        } else {
            // New sale
            modalTitle.textContent = 'Record New Sale';
            deleteBtn.style.display = 'none';
            
            // Check if we have a pending production sale
            if (this.pendingProductionSale) {
                productionSourceNotice.style.display = 'block';
                productionSourceInfo.textContent = 
                    `${this.pendingProductionSale.type || this.pendingProductionSale.product} • 
                    ${this.pendingProductionSale.quantity || this.pendingProductionSale.count || 0} units`;
                
                if (this.pendingProductionSale.id) {
                    productionSourceId.value = this.pendingProductionSale.id;
                }
            } else {
                productionSourceNotice.style.display = 'none';
                productionSourceId.value = '';
            }
        }
        
        // Initialize product type
        this.handleProductChange();
        
        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    hideSaleModal() {
        const modal = document.getElementById('sale-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Reset state
        this.currentEditingId = null;
        this.pendingProductionSale = null;
        
        // Reset form
        const form = document.getElementById('sale-form');
        if (form) form.reset();
        
        // Reset production source
        const productionSourceId = document.getElementById('production-source-id');
        if (productionSourceId) productionSourceId.value = '';
    },

    handleProductChange() {
        const productSelect = document.getElementById('sale-product');
        if (!productSelect) return;
        
        const product = productSelect.value;
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        const meatSection = document.getElementById('meat-section');
        const standardSection = document.getElementById('standard-section');
        const meatSummary = document.getElementById('meat-summary');
        const standardSummary = document.getElementById('standard-summary');
        
        const unitSelect = document.getElementById('sale-unit');
        
        if (meatProducts.includes(product)) {
            // Show meat section
            meatSection.style.display = 'block';
            standardSection.style.display = 'none';
            meatSummary.style.display = 'block';
            standardSummary.style.display = 'none';
            
            // Set unit to kg or lbs
            const weightUnit = document.getElementById('meat-weight-unit').value;
            unitSelect.value = weightUnit;
            
            // Set price label
            const priceLabel = document.getElementById('meat-price-label');
            const priceUnitLabel = document.getElementById('meat-price-unit-label');
            if (priceLabel && priceUnitLabel) {
                priceLabel.textContent = `Price per ${weightUnit} *`;
                priceUnitLabel.textContent = `per ${weightUnit}`;
            }
            
            // Trigger calculation
            this.calculateMeatSale();
        } else {
            // Show standard section
            meatSection.style.display = 'none';
            standardSection.style.display = 'block';
            meatSummary.style.display = 'none';
            standardSummary.style.display = 'block';
            
            // Set default unit based on product type
            if (product === 'eggs') {
                unitSelect.value = 'dozen';
            } else if (product === 'milk' || product === 'cheese' || product === 'yogurt' || product === 'butter') {
                unitSelect.value = 'kg';
            } else if (product.includes('chicken') || product.includes('layers')) {
                unitSelect.value = 'birds';
            } else {
                unitSelect.value = 'kg';
            }
            
            // Trigger calculation
            this.calculateStandardSale();
        }
        
        // Set default price if available
        this.setDefaultPrice(product);
    },

    calculateMeatSale() {
        const animalCount = parseFloat(document.getElementById('meat-animal-count').value) || 0;
        const weight = parseFloat(document.getElementById('meat-weight').value) || 0;
        const pricePerUnit = parseFloat(document.getElementById('meat-price').value) || 0;
        const weightUnit = document.getElementById('meat-weight-unit').value || 'kg';
        
        // Calculate average weight per animal
        const avgWeight = animalCount > 0 ? (weight / animalCount).toFixed(2) : 0;
        
        // Calculate total amount
        const totalAmount = weight * pricePerUnit;
        
        // Calculate average value per animal
        const avgValue = animalCount > 0 ? (totalAmount / animalCount).toFixed(2) : 0;
        
        // Update display
        document.getElementById('meat-avg-weight').textContent = `${avgWeight} ${weightUnit}`;
        document.getElementById('meat-avg-value').textContent = `$${avgValue}`;
        document.getElementById('sale-total-amount').textContent = this.formatCurrency(totalAmount);
        
        // Update summary
        const summary = document.getElementById('meat-summary-info');
        summary.textContent = 
            `${animalCount} animal${animalCount !== 1 ? 's' : ''} • ${weight.toFixed(2)} ${weightUnit} total • $${pricePerUnit.toFixed(2)}/${weightUnit}`;
    },

    calculateStandardSale() {
        const quantity = parseFloat(document.getElementById('standard-quantity').value) || 0;
        const pricePerUnit = parseFloat(document.getElementById('standard-price').value) || 0;
        
        // Calculate total amount
        const totalAmount = quantity * pricePerUnit;
        
        // Update display
        document.getElementById('sale-total-amount').textContent = this.formatCurrency(totalAmount);
        
        // Update summary
        const summary = document.getElementById('standard-summary-info');
        const unit = document.getElementById('sale-unit').value || 'unit';
        summary.textContent = `${quantity} ${unit} at $${pricePerUnit.toFixed(2)}/${unit}`;
    },

    calculateSaleTotal() {
        // Determine which calculation to use based on product type
        const productSelect = document.getElementById('sale-product');
        const product = productSelect ? productSelect.value : '';
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(product)) {
            this.calculateMeatSale();
        } else {
            this.calculateStandardSale();
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    loadSaleForEditing(saleId) {
        const sales = window.FarmModules.appData.sales || [];
        const sale = sales.find(s => s.id === saleId);
        
        if (!sale) {
            console.error('Sale not found:', saleId);
            return;
        }
        
        console.log('📋 Loading sale for editing:', sale);
        
        // Populate form fields
        document.getElementById('sale-id').value = sale.id;
        document.getElementById('sale-date').value = this.fixDateString(sale.date);
        document.getElementById('sale-customer').value = sale.customer || '';
        document.getElementById('sale-product').value = sale.product;
        document.getElementById('sale-unit').value = sale.unit;
        document.getElementById('sale-payment').value = sale.paymentMethod || 'cash';
        document.getElementById('sale-status').value = sale.paymentStatus || 'paid';
        document.getElementById('sale-notes').value = sale.notes || '';
        
        // Set product-specific fields
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(sale.product)) {
            // Meat sale
            document.getElementById('meat-animal-count').value = sale.animalCount || sale.quantity || 0;
            document.getElementById('meat-weight').value = sale.weight || 0;
            document.getElementById('meat-weight-unit').value = sale.weightUnit || 'kg';
            document.getElementById('meat-price').value = sale.pricePerUnit || 0;
        } else {
            // Standard sale
            document.getElementById('standard-quantity').value = sale.quantity || 0;
            document.getElementById('standard-price').value = sale.pricePerUnit || 0;
        }
        
        // Trigger product change to show correct sections
        this.handleProductChange();
    },

    saveSale() {
        console.log('💾 Saving sale...');
        
        // Validate form
        const form = document.getElementById('sale-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const saleId = document.getElementById('sale-id').value;
        const isEdit = !!saleId;
        
        // Get form values
        const sale = {
            id: saleId || this.generateId(),
            date: this.fixDateString(document.getElementById('sale-date').value),
            customer: document.getElementById('sale-customer').value.trim(),
            product: document.getElementById('sale-product').value,
            unit: document.getElementById('sale-unit').value,
            paymentMethod: document.getElementById('sale-payment').value,
            paymentStatus: document.getElementById('sale-status').value,
            notes: document.getElementById('sale-notes').value.trim(),
            recordedAt: new Date().toISOString()
        };
        
        // Get product-specific values
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(sale.product)) {
            sale.animalCount = parseInt(document.getElementById('meat-animal-count').value) || 0;
            sale.weight = parseFloat(document.getElementById('meat-weight').value) || 0;
            sale.weightUnit = document.getElementById('meat-weight-unit').value;
            sale.pricePerUnit = parseFloat(document.getElementById('meat-price').value) || 0;
            sale.quantity = sale.weight; // For backward compatibility
            sale.totalAmount = sale.weight * sale.pricePerUnit;
        } else {
            sale.quantity = parseFloat(document.getElementById('standard-quantity').value) || 0;
            sale.pricePerUnit = parseFloat(document.getElementById('standard-price').value) || 0;
            sale.totalAmount = sale.quantity * sale.pricePerUnit;
        }
        
        // Add production source if available
        const productionSourceId = document.getElementById('production-source-id').value;
        if (productionSourceId) {
            sale.productionSourceId = productionSourceId;
            sale.fromProduction = true;
            
            // Mark production item as sold
            this.markProductionAsSold(productionSourceId, sale.quantity || sale.animalCount || 0);
        }
        
        console.log('💾 Sale data:', sale);
        
        // Save to app data
        const sales = window.FarmModules.appData.sales || [];
        
        if (isEdit) {
            // Update existing sale
            const index = sales.findIndex(s => s.id === saleId);
            if (index !== -1) {
                sales[index] = sale;
            }
        } else {
            // Add new sale
            sales.unshift(sale);
        }
        
        window.FarmModules.appData.sales = sales;
        this.saveData();
        
        // Update UI
        this.renderModule();
        this.hideSaleModal();
        
        // Show success message
        this.showNotification(
            isEdit ? 'Sale updated successfully!' : 'Sale recorded successfully!',
            'success'
        );
    },

    deleteSale() {
        if (!this.currentEditingId) return;
        
        if (!confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
            return;
        }
        
        const sales = window.FarmModules.appData.sales || [];
        window.FarmModules.appData.sales = sales.filter(s => s.id !== this.currentEditingId);
        
        this.saveData();
        this.renderModule();
        this.hideSaleModal();
        
        this.showNotification('Sale deleted successfully!', 'success');
    },

    handleQuickSale() {
        console.log('⚡ Handling quick sale...');
        
        const product = document.getElementById('quick-product').value;
        const quantity = parseFloat(document.getElementById('quick-quantity').value) || 0;
        const unit = document.getElementById('quick-unit').value;
        const pricePerUnit = parseFloat(document.getElementById('quick-price').value) || 0;
        
        if (!product || quantity <= 0 || pricePerUnit <= 0) {
            this.showNotification('Please fill in all required fields with valid values.', 'error');
            return;
        }
        
        const sale = {
            id: this.generateId(),
            date: this.getTodayLocal(),
            product: product,
            quantity: quantity,
            unit: unit,
            pricePerUnit: pricePerUnit,
            totalAmount: quantity * pricePerUnit,
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            recordedAt: new Date().toISOString(),
            notes: 'Quick sale'
        };
        
        // Add to meat products if applicable
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        if (meatProducts.includes(product)) {
            sale.animalCount = quantity;
            sale.weight = quantity; // Assuming 1 unit = 1 animal for quick sale
            sale.weightUnit = unit === 'lbs' ? 'lbs' : 'kg';
        }
        
        console.log('⚡ Quick sale data:', sale);
        
        // Save sale
        const sales = window.FarmModules.appData.sales || [];
        sales.unshift(sale);
        window.FarmModules.appData.sales = sales;
        this.saveData();
        
        // Reset form
        document.getElementById('quick-sale-form').reset();
        
        // Update UI
        this.renderModule();
        
        this.showNotification('Quick sale recorded!', 'success');
    },

    generateId() {
        return 'sale_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    markProductionAsSold(productionId, quantitySold) {
        const productionModule = window.FarmModules.Production;
        if (productionModule && productionModule.markAsSold) {
            productionModule.markAsSold(productionId, quantitySold);
        }
    },

    renderSalesTable(filter = 'today') {
        let sales = window.FarmModules.appData.sales || [];
        const today = this.getTodayLocal();
        
        // Apply filter
        switch (filter) {
            case 'today':
                sales = sales.filter(sale => this.fixDateString(sale.date) === today);
                break;
            case 'week':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
                sales = sales.filter(sale => sale.date >= oneWeekAgoStr);
                break;
            case 'month':
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
                sales = sales.filter(sale => sale.date >= oneMonthAgoStr);
                break;
            case 'meat':
                const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
                sales = sales.filter(sale => meatProducts.includes(sale.product));
                break;
            case 'production':
                sales = sales.filter(sale => sale.fromProduction);
                break;
            // 'all' shows all sales
        }
        
        if (sales.length === 0) {
            return `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                    <div style="color: var(--text-secondary); margin-bottom: 8px;">No sales found</div>
                    <div style="color: var(--text-tertiary); font-size: 14px;">Record your first sale to get started</div>
                </div>
            `;
        }
        
        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--glass-border);">
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Date</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Product</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Quantity</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Price</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Total</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Status</th>
                            <th style="text-align: left; padding: 12px 16px; color: var(--text-secondary); font-weight: 600; font-size: 14px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px 16px; color: var(--text-primary);">
                                    ${this.formatDate(sale.date)}
                                </td>
                                <td style="padding: 12px 16px; color: var(--text-primary);">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 18px;">${this.getProductIcon(sale.product)}</span>
                                        <div>
                                            <div style="font-weight: 500;">${this.getProductDisplayName(sale.product)}</div>
                                            ${sale.customer ? `<div style="font-size: 12px; color: var(--text-secondary);">${sale.customer}</div>` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px 16px; color: var(--text-primary);">
                                    ${this.getQuantityDisplay(sale)}
                                </td>
                                <td style="padding: 12px 16px; color: var(--text-primary);">
                                    ${this.formatCurrency(sale.pricePerUnit || 0)}/${sale.unit || 'unit'}
                                </td>
                                <td style="padding: 12px 16px; color: var(--text-primary); font-weight: 600;">
                                    ${this.formatCurrency(sale.totalAmount || 0)}
                                </td>
                                <td style="padding: 12px 16px;">
                                    <span class="status-badge status-${sale.paymentStatus || 'paid'}">
                                        ${(sale.paymentStatus || 'paid').charAt(0).toUpperCase() + (sale.paymentStatus || 'paid').slice(1)}
                                    </span>
                                </td>
                                <td style="padding: 12px 16px;">
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn-icon" onclick="window.FarmModules.SalesRecord.editSale('${sale.id}')" title="Edit">
                                            ✏️
                                        </button>
                                        <button class="btn-icon" onclick="window.FarmModules.SalesRecord.duplicateSale('${sale.id}')" title="Duplicate">
                                            📋
                                        </button>
                                        ${sale.fromProduction ? `
                                            <button class="btn-icon" title="From Production" style="color: #0ea5e9;">
                                                🔄
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getQuantityDisplay(sale) {
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        
        if (meatProducts.includes(sale.product)) {
            return `${sale.animalCount || 0} animals • ${sale.weight || 0} ${sale.weightUnit || 'kg'}`;
        } else {
            return `${sale.quantity || 0} ${sale.unit || 'units'}`;
        }
    },

    getProductDisplayName(product) {
        const nameMap = {
            'broilers-dressed': 'Broilers (Dressed)',
            'broilers-live': 'Broilers (Live)',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'goat': 'Goat',
            'lamb': 'Lamb',
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
            'bread': 'Bread',
            'other': 'Other'
        };
        
        return nameMap[product] || product;
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    },

    editSale(saleId) {
        this.showSaleModal(saleId);
    },

    duplicateSale(saleId) {
        const sales = window.FarmModules.appData.sales || [];
        const originalSale = sales.find(s => s.id === saleId);
        
        if (!originalSale) return;
        
        // Create a copy with new ID
        const duplicatedSale = {
            ...originalSale,
            id: this.generateId(),
            date: this.getTodayLocal(),
            recordedAt: new Date().toISOString(),
            notes: originalSale.notes ? `Duplicated from ${originalSale.date}\n${originalSale.notes}` : `Duplicated from ${originalSale.date}`
        };
        
        // Add to sales
        sales.unshift(duplicatedSale);
        window.FarmModules.appData.sales = sales;
        this.saveData();
        
        // Update UI
        this.renderModule();
        
        this.showNotification('Sale duplicated successfully!', 'success');
    },

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.sales-notification');
        if (existing) existing.remove();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `sales-notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-size: 14px;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // REPORT METHODS
    showDailyReport() {
        const today = this.getTodayLocal();
        const sales = window.FarmModules.appData.sales || [];
        const todaySales = sales.filter(sale => this.fixDateString(sale.date) === today);
        
        if (todaySales.length === 0) {
            this.showNotification('No sales recorded today.', 'info');
            return;
        }
        
        const totalAmount = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = todaySales.filter(sale => meatProducts.includes(sale.product));
        const totalMeatWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        
        const reportContent = document.getElementById('daily-report-content');
        reportContent.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h3 style="color: var(--text-primary); margin: 0 0 8px 0;">Daily Sales Report</h3>
                    <div style="color: var(--text-secondary);">${this.formatDate(today)}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">${todaySales.length}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Sales</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">${this.formatCurrency(totalAmount)}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Revenue</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">${totalMeatWeight.toFixed(2)} kg</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Meat Weight Sold</div>
                    </div>
                </div>
                
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">Sales Breakdown</h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Product</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Quantity</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Total</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${todaySales.map(sale => `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 8px 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span>${this.getProductIcon(sale.product)}</span>
                                            <span>${this.getProductDisplayName(sale.product)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 8px 12px;">${this.getQuantityDisplay(sale)}</td>
                                    <td style="padding: 8px 12px;">${this.formatCurrency(sale.totalAmount)}</td>
                                    <td style="padding: 8px 12px;">
                                        <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${sale.paymentStatus === 'paid' ? '#10b98120' : '#f59e0b20'}; color: ${sale.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'}">
                                            ${sale.paymentStatus || 'paid'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Show modal
        document.getElementById('daily-report-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    hideDailyReport() {
        document.getElementById('daily-report-modal').classList.add('hidden');
        document.body.style.overflow = '';
    },

    printDailyReport() {
        const printWindow = window.open('', '_blank');
        const today = this.getTodayLocal();
        const sales = window.FarmModules.appData.sales || [];
        const todaySales = sales.filter(sale => this.fixDateString(sale.date) === today);
        const totalAmount = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sales Report - ${this.formatDate(today)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .summary-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .summary-value { font-size: 24px; font-weight: bold; margin: 5px 0; }
                    .summary-label { color: #666; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .status-paid { color: #10b981; }
                    .status-pending { color: #f59e0b; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Daily Sales Report</h1>
                    <h3>${this.formatDate(today)}</h3>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-value">${todaySales.length}</div>
                        <div class="summary-label">Total Sales</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${this.formatCurrency(totalAmount)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${new Date().toLocaleTimeString()}</div>
                        <div class="summary-label">Report Time</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${todaySales.map(sale => `
                            <tr>
                                <td>${this.getProductDisplayName(sale.product)}</td>
                                <td>${this.getQuantityDisplay(sale)}</td>
                                <td>${this.formatCurrency(sale.pricePerUnit || 0)}/${sale.unit || 'unit'}</td>
                                <td>${this.formatCurrency(sale.totalAmount || 0)}</td>
                                <td class="status-${sale.paymentStatus || 'paid'}">${sale.paymentStatus || 'paid'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated by Farm Management System • ${new Date().toLocaleString()}</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
    },

    showMeatSalesReport() {
        const sales = window.FarmModules.appData.sales || [];
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        
        if (meatSales.length === 0) {
            this.showNotification('No meat sales recorded.', 'info');
            return;
        }
        
        // Calculate totals by product
        const productTotals = {};
        meatSales.forEach(sale => {
            if (!productTotals[sale.product]) {
                productTotals[sale.product] = {
                    count: 0,
                    weight: 0,
                    revenue: 0,
                    animals: 0
                };
            }
            
            productTotals[sale.product].count++;
            productTotals[sale.product].weight += sale.weight || 0;
            productTotals[sale.product].revenue += sale.totalAmount || 0;
            productTotals[sale.product].animals += sale.animalCount || sale.quantity || 0;
        });
        
        const reportContent = document.getElementById('meat-sales-content');
        reportContent.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h3 style="color: var(--text-primary); margin: 0 0 8px 0;">Meat Sales Report</h3>
                    <div style="color: var(--text-secondary);">All Time</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">${meatSales.length}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Meat Sales</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">
                            ${meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0)}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Animals</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">
                            ${meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0).toFixed(2)} kg
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Weight</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">
                            ${this.formatCurrency(meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 14px;">Total Revenue</div>
                    </div>
                </div>
                
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">Product Breakdown</h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--glass-border);">
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Product</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Sales</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Animals</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Weight (kg)</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Revenue</th>
                                <th style="text-align: left; padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">Avg Price/kg</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(productTotals).map(([product, totals]) => `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 8px 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span>${this.getProductIcon(product)}</span>
                                            <span>${this.getProductDisplayName(product)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 8px 12px;">${totals.count}</td>
                                    <td style="padding: 8px 12px;">${totals.animals}</td>
                                    <td style="padding: 8px 12px;">${totals.weight.toFixed(2)}</td>
                                    <td style="padding: 8px 12px;">${this.formatCurrency(totals.revenue)}</td>
                                    <td style="padding: 8px 12px;">
                                        ${totals.weight > 0 ? this.formatCurrency(totals.revenue / totals.weight) : '$0.00'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Show modal
        document.getElementById('meat-sales-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    hideMeatSalesReport() {
        document.getElementById('meat-sales-modal').classList.add('hidden');
        document.body.style.overflow = '';
    },

    printMeatSalesReport() {
        const printWindow = window.open('', '_blank');
        const sales = window.FarmModules.appData.sales || [];
        const meatProducts = ['broilers-dressed', 'pork', 'beef', 'chicken-parts', 'goat', 'lamb'];
        const meatSales = sales.filter(sale => meatProducts.includes(sale.product));
        
        // Calculate totals by product
        const productTotals = {};
        meatSales.forEach(sale => {
            if (!productTotals[sale.product]) {
                productTotals[sale.product] = {
                    count: 0,
                    weight: 0,
                    revenue: 0,
                    animals: 0
                };
            }
            
            productTotals[sale.product].count++;
            productTotals[sale.product].weight += sale.weight || 0;
            productTotals[sale.product].revenue += sale.totalAmount || 0;
            productTotals[sale.product].animals += sale.animalCount || sale.quantity || 0;
        });
        
        const totalAnimals = meatSales.reduce((sum, sale) => sum + (sale.animalCount || sale.quantity || 0), 0);
        const totalWeight = meatSales.reduce((sum, sale) => sum + (sale.weight || 0), 0);
        const totalRevenue = meatSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meat Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                    .summary-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .summary-value { font-size: 20px; font-weight: bold; margin: 5px 0; }
                    .summary-label { color: #666; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; font-size: 13px; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Meat Sales Report</h1>
                    <h3>All Time Summary</h3>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-value">${meatSales.length}</div>
                        <div class="summary-label">Meat Sales</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${totalAnimals}</div>
                        <div class="summary-label">Total Animals</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${totalWeight.toFixed(2)} kg</div>
                        <div class="summary-label">Total Weight</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${this.formatCurrency(totalRevenue)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Sales</th>
                            <th>Animals</th>
                            <th>Weight (kg)</th>
                            <th>Revenue</th>
                            <th>Avg Price/kg</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(productTotals).map(([product, totals]) => `
                            <tr>
                                <td>${this.getProductDisplayName(product)}</td>
                                <td>${totals.count}</td>
                                <td>${totals.animals}</td>
                                <td>${totals.weight.toFixed(2)}</td>
                                <td>${this.formatCurrency(totals.revenue)}</td>
                                <td>${totals.weight > 0 ? this.formatCurrency(totals.revenue / totals.weight) : '$0.00'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated by Farm Management System • ${new Date().toLocaleString()}</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
    },

    showProductionItems() {
        const productionModule = window.FarmModules.Production;
        if (!productionModule) {
            this.showNotification('Production module not available', 'error');
            return;
        }

        const availableProducts = productionModule.getAvailableProducts();
        const content = document.getElementById('production-items-content');
        
        if (availableProducts.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                    <div style="color: var(--text-secondary); margin-bottom: 8px;">No production items available</div>
                    <div style="color: var(--text-tertiary); font-size: 14px;">Record production first to sell items</div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <p style="color: var(--text-secondary);">Select a production item to record a sale:</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                    ${availableProducts.map(item => `
                        <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer; transition: all 0.2s;"
                             onclick="window.FarmModules.SalesRecord.selectProductionItem('${item.id}')"
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';"
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <span style="font-size: 24px;">${this.getProductIcon(item.type || item.product)}</span>
                                <div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${item.type || item.product}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">ID: ${item.id.substring(0, 8)}...</div>
                                </div>
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                                ${item.quantity ? `<div>Quantity: ${item.quantity} ${item.unit || 'units'}</div>` : ''}
                                ${item.totalWeight ? `<div>Weight: ${item.totalWeight} ${item.weightUnit || 'kg'}</div>` : ''}
                                ${item.count ? `<div>Count: ${item.count}</div>` : ''}
                            </div>
                            <div style="font-size: 12px; color: var(--text-tertiary);">
                                ${item.date ? `Produced: ${item.date}` : ''}
                                ${item.harvestDate ? `Harvested: ${item.harvestDate}` : ''}
                            </div>
                            <button class="btn-primary" style="margin-top: 12px; width: 100%; padding: 8px; font-size: 13px;">
                                ➕ Sell This Item
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Show modal
        document.getElementById('production-items-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    hideProductionItems() {
        document.getElementById('production-items-modal').classList.add('hidden');
        document.body.style.overflow = '';
    },

    showPartialPaymentModal() {
        // This would show a modal for entering partial payment details
        // For now, just show a prompt
        const amountPaid = prompt('Enter amount paid (partial payment):');
        if (amountPaid !== null) {
            const amount = parseFloat(amountPaid);
            if (!isNaN(amount) && amount > 0) {
                document.getElementById('sale-notes').value += `\nPartial payment: $${amount.toFixed(2)}`;
                this.showNotification(`Partial payment of $${amount.toFixed(2)} recorded`, 'success');
            }
        }
    }
};

// Export module
window.FarmModules = window.FarmModules || {};
window.FarmModules.SalesRecord = SalesRecordModule;
