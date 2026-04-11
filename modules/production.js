// modules/production.js - CORRECTED VERSION

const ProductionModule = {
    name: 'production',
    initialized: false,
    element: null,
    productionData: [],  // Changed from productionRecords to productionData for consistency
    currentRecordId: null,
    broadcaster: null,
    dataService: null,

    async initialize() {
        console.log('🏭 Initializing Production Module...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // Get Broadcaster
        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Production module connected to Data Broadcaster');
        }

        // Get UnifiedDataService
        this.dataService = window.UnifiedDataService || null;
        if (!this.dataService) {
            console.error('❌ UnifiedDataService not available for production!');
        } else {
            console.log('📦 Production connected to UnifiedDataService');
        }

        // Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.name, this.element, this);
        }

        await this.loadData();
        this.renderModule();
        this.setupEventListeners();
        
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastProductionLoaded();
        }
        
        this.initialized = true;
        
        console.log('✅ Production Module initialized with UnifiedDataService');
        return true;
    },

    // ========== DATA LOADING METHODS ==========
    
        async loadData() {
        console.log('Loading production records from UnifiedDataService...');
        
        try {
            // Try UnifiedDataService first
            if (this.dataService) {
                const data = this.dataService.get('production');
                if (data && data.records && data.records.length > 0) {
                    this.productionData = data.records;
                    console.log('📁 Loaded from UnifiedDataService:', this.productionData.length);
                } else {
                    // Try to migrate from old localStorage
                    const saved = localStorage.getItem('farm-production');
                    if (saved) {
                        this.productionData = JSON.parse(saved);
                        console.log(`📁 Migrated ${this.productionData.length} records from localStorage`);
                        await this.saveToDataService();
                    } else {
                        // NO DEMO DATA - just empty array
                        this.productionData = [];
                        console.log('📁 No existing production data found, starting empty');
                    }
                }
            } else {
                // Fallback to localStorage only
                const saved = localStorage.getItem('farm-production');
                this.productionData = saved ? JSON.parse(saved) : [];
                console.log(`📁 Loaded ${this.productionData.length} records from localStorage`);
            }
            
            // Sort by date (newest first)
            this.productionData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        } catch (error) {
            console.error('❌ Error loading production records:', error);
            this.productionData = []; // Empty array on error, not demo data
        }
        
        if (this.broadcaster) {
            this.broadcaster.broadcast('production-data-loaded', {
                module: 'production',
                timestamp: new Date().toISOString(),
                recordCount: this.productionData.length,
                source: this.dataService ? 'UnifiedDataService' : 'localStorage'
            });
        }
    },
    
    // FIXED: This is now a proper method, not a standalone function
      async saveToDataService() {
        if (!this.dataService) return;
        
        const MAX_DOC_SIZE = 900000; // 900KB to be safe
        
        try {
            // If no records, just return (nothing to save)
            if (!this.productionData || this.productionData.length === 0) {
                console.log('📁 No production records to save');
                return;
            }
            
            // Check if any record is too large
            for (let record of this.productionData) {
                const size = new Blob([JSON.stringify(record)]).size;
                if (size > MAX_DOC_SIZE) {
                    console.warn(`Record ${record.id} is too large (${size} bytes), splitting...`);
                    await this.splitAndSaveRecord(record);
                } else {
                    await this.dataService.save('production', record.id, record);
                }
            }
            console.log('✅ Saved production records to UnifiedDataService');
        } catch (error) {
            console.error('❌ Error saving to UnifiedDataService:', error);
        }
    },
    
    // FIXED: This is now a proper method
    async splitAndSaveRecord(record) {
        const chunks = [];
        const chunkSize = 500000; // 500KB chunks
        
        // Split the record's large fields (like images or notes)
        for (let key in record) {
            if (typeof record[key] === 'string' && record[key].length > 10000) {
                // Split long strings into chunks
                const chunks_count = Math.ceil(record[key].length / chunkSize);
                for (let i = 0; i < chunks_count; i++) {
                    chunks.push({
                        id: `${record.id}_${key}_${i}`,
                        parentId: record.id,
                        field: key,
                        chunk: i,
                        data: record[key].substr(i * chunkSize, chunkSize)
                    });
                }
                delete record[key]; // Remove original
                record[`${key}_chunked`] = true;
                record[`${key}_chunks`] = chunks_count;
            }
        },
        
        // Save main record (smaller now)
        await this.dataService.save('production', record.id, record);
        
        // Save chunks as sub-collection
        for (let chunk of chunks) {
            await this.dataService.save(`production_chunks`, chunk.id, chunk);
        }
    },

    async saveData() {
        // Always save to localStorage
        localStorage.setItem('farm-production', JSON.stringify(this.productionData));
        
        // Save to UnifiedDataService if available
        if (this.dataService) {
            await this.saveToDataService();
        }
        
        // Broadcast update
        if (this.broadcaster) {
            this.broadcaster.broadcast('production-data-saved', {
                module: 'production',
                timestamp: new Date().toISOString(),
                recordCount: this.productionData.length
            });
        }
    },

    // ========== BROADCASTER METHODS ==========
    
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        this.broadcaster.on('sale-recorded', (data) => {
            console.log('📡 Production received sale record:', data);
            this.checkProductionForSale(data);
        });
        
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Production received inventory update:', data);
            this.checkInventoryForProduction(data);
        });
        
        this.broadcaster.on('theme-changed', (data) => {
            console.log('📡 Production theme changed:', data);
            if (this.initialized && data.theme) {
                this.onThemeChange(data.theme);
            }
        });
    },

    broadcastProductionLoaded() {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('production-loaded', {
            module: 'production',
            timestamp: new Date().toISOString(),
            totalRecords: this.productionData.length,
            totalProduction: this.productionData.reduce((sum, r) => sum + r.quantity, 0)
        });
    },

    broadcastProductionDeleted(recordId) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('production-deleted', {
            module: 'production',
            timestamp: new Date().toISOString(),
            recordId: recordId
        });
    },

    checkInventoryForProduction(inventoryData) {
        // Implementation
    },

    checkProductionForSale(saleData) {
        // Implementation
    },

    onThemeChange(theme) {
        if (this.initialized) {
            this.renderModule();
        }
    },

    // ========== CRUD METHODS ==========
    
    async addProduction(productionData) {
        this.productionData.unshift(productionData);
        await this.saveData();
        this.updateStats();
        this.renderModule();
    },

    async updateProduction(productionId, productionData) {
        const index = this.productionData.findIndex(p => p.id == productionId);
        
        if (index !== -1) {
            this.productionData[index] = {
                ...this.productionData[index],
                ...productionData
            };
            
            await this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Production record updated successfully!', 'success');
        }
    },

    async deleteProductionRecord(recordId) {
        const index = this.productionData.findIndex(r => r.id === parseInt(recordId));
        if (index !== -1) {
            this.productionData.splice(index, 1);
            await this.saveData();
            this.updateStats();
            this.renderModule();
            this.showNotification('Production record deleted', 'success');
            
            if (this.broadcaster) {
                this.broadcastProductionDeleted(recordId);
            }
        }
    },

    saveProduction() {
        const productionId = document.getElementById('production-id').value;
        
        // Get custom product name if "other" is selected
        let product = document.getElementById('production-product').value;
        if (product === 'other') {
            const customName = document.getElementById('custom-product-name').value;
            if (!customName) {
                this.showNotification('Please enter a product name', 'error');
                return;
            }
            product = customName.toLowerCase().replace(/\s+/g, '-');
        }
        
        const productionData = {
            id: productionId ? parseInt(productionId) : Date.now(),
            date: document.getElementById('production-date').value,
            product: product,
            quantity: parseInt(document.getElementById('production-quantity').value),
            unit: document.getElementById('production-unit').value,
            quality: document.getElementById('production-quality').value,
            batch: document.getElementById('production-batch').value || '',
            notes: document.getElementById('production-notes').value || ''
        };
        
        // Add optional weight data
        const avgWeight = parseFloat(document.getElementById('animal-weight').value);
        if (avgWeight > 0) {
            productionData.weight = avgWeight;
            productionData.weightUnit = document.getElementById('animal-weight-unit').value;
        }
        
        if (productionId) {
            this.updateProduction(productionId, productionData);
        } else {
            this.addProduction(productionData);
            this.showNotification('Production record added!', 'success');
        }
        
        // Handle sale creation if checkbox is checked
        const forSale = document.getElementById('production-for-sale').checked;
        if (forSale) {
            const price = parseFloat(document.getElementById('sale-price').value);
            const priceUnit = document.getElementById('sale-price-unit').value;
            const customer = document.getElementById('customer-name').value;
            
            if (price && price > 0) {
                this.createSaleRecord(productionData, price, priceUnit, customer);
            }
        }
        
        this.hideProductionModal();
    },

    createSaleRecord(productionData, price, priceUnit = 'per-unit', customer = '') {
        console.log('💵 Creating sale record for production:', productionData);
        
        const saleDate = new Date().toISOString().split('T')[0];
        
        let totalPrice = 0;
        let priceNote = '';
        
        if (priceUnit === 'per-unit') {
            totalPrice = productionData.quantity * price;
            priceNote = `$${price.toFixed(2)} per ${productionData.unit}`;
        } else if (priceUnit === 'total') {
            totalPrice = price;
            priceNote = `Total: $${price.toFixed(2)}`;
        } else {
            totalPrice = 0;
            priceNote = `$${price.toFixed(2)} ${priceUnit} - Add weight in Sales module`;
        }
        
        const saleRecord = {
            id: Date.now(),
            productionId: productionData.id,
            date: saleDate,
            product: productionData.product,
            quantity: productionData.quantity,
            unit: productionData.unit,
            pricePerUnit: priceUnit === 'per-unit' ? price : 0,
            priceUnit: priceUnit,
            totalPrice: totalPrice,
            customer: customer || '',
            status: 'pending',
            notes: `Auto-generated from production record #${productionData.id}. ${priceNote}`
        };

        if (productionData.weight && productionData.weightUnit) {
            saleRecord.weight = productionData.weight * productionData.quantity;
            saleRecord.weightUnit = productionData.weightUnit;
        }

        if (window.SalesModule && window.SalesModule.addSale) {
            window.SalesModule.addSale(saleRecord);
            this.showNotification(`Sale record created! ${priceNote}`, 'success');
        } else {
            const salesData = JSON.parse(localStorage.getItem('farm-sales-data') || '[]');
            salesData.push(saleRecord);
            localStorage.setItem('farm-sales-data', JSON.stringify(salesData));
            this.showNotification(`Sale record saved for later import! ${priceNote}`, 'info');
        }
    },

    deleteProduction() {
        if (!this.currentRecordId) return;

        if (confirm('Are you sure you want to delete this production record?')) {
            this.deleteProductionRecord(this.currentRecordId);
            this.hideProductionModal();
        }
    },

    editProduction(recordId) {
        const record = this.productionData.find(r => r.id === parseInt(recordId));
        if (!record) return;

        this.currentRecordId = record.id;
        
        document.getElementById('production-id').value = record.id;
        document.getElementById('production-date').value = record.date;
        
        // Set product - handle custom "other" products
        const productSelect = document.getElementById('production-product');
        const knownProducts = ['eggs', 'broilers', 'layers', 'milk', 'pork', 'beef', 'goat', 'lamb', 
                              'tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 
                              'peppers', 'cucumbers', 'spinach', 'beans', 'corn',
                              'apples', 'oranges', 'bananas', 'berries', 'mangoes', 'honey'];
        
        if (knownProducts.includes(record.product)) {
            productSelect.value = record.product;
        } else {
            productSelect.value = 'other';
            document.getElementById('custom-product-name').value = this.formatProductName(record.product);
            document.getElementById('custom-product-container').style.display = 'block';
        }
        
        this.handleProductChange();
        
        document.getElementById('production-quantity').value = record.quantity;
        document.getElementById('production-unit').value = record.unit;
        
        if (record.weight) {
            document.getElementById('animal-weight').value = record.weight;
            if (record.weightUnit) {
                document.getElementById('animal-weight-unit').value = record.weightUnit;
            }
            this.calculateTotalWeight();
        }
        
        document.getElementById('production-quality').value = record.quality;
        document.getElementById('production-batch').value = record.batch || '';
        document.getElementById('production-notes').value = record.notes || '';
        
        this.showProductionModal();
    },

    // ========== UI RENDER METHODS ==========
    
    renderModule() {
        if (!this.element) return;
        
        // Keep your existing renderModule code here
        // (too long to repeat, but keep your existing implementation)
        this.element.innerHTML = `<div>Production Module Loading...</div>`;
        // Replace with your actual renderModule content
    },

    renderProductionTable(filter = 'all') {
        // Keep your existing implementation
        return `<div>Production table</div>`;
    },

    renderProductSummary() {
        // Keep your existing implementation
        return `<div>Product summary</div>`;
    },

    // ========== EVENT HANDLERS ==========
    
    setupEventListeners() {
        // Keep your existing implementation
        
        // Quick form
        document.getElementById('quick-production-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickProduction();
        });

        // Modal buttons
        document.getElementById('add-production-btn')?.addEventListener('click', () => this.showProductionModal());
        document.getElementById('save-production')?.addEventListener('click', () => this.saveProduction());
        document.getElementById('delete-production')?.addEventListener('click', () => this.deleteProduction());
        document.getElementById('cancel-production')?.addEventListener('click', () => this.hideProductionModal());
        document.getElementById('close-production-modal')?.addEventListener('click', () => this.hideProductionModal());
        
        // Product change handler
        document.getElementById('production-product')?.addEventListener('change', () => this.handleProductChange());
        
        // Quantity change for weight calculation
        document.getElementById('production-quantity')?.addEventListener('input', () => this.calculateTotalWeight());
        document.getElementById('animal-weight')?.addEventListener('input', () => this.calculateTotalWeight());
        
        // Sale checkbox handler
        document.getElementById('production-for-sale')?.addEventListener('change', (e) => {
            const saleDetails = document.getElementById('sale-details');
            if (saleDetails) {
                saleDetails.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    },

    handleQuickProduction() {
        const product = document.getElementById('quick-product')?.value;
        const quantity = parseInt(document.getElementById('quick-quantity')?.value);
        const unit = document.getElementById('quick-unit')?.value;
        const quality = document.getElementById('quick-quality')?.value;

        if (!product || !quantity || !quality) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const productionData = {
            id: Date.now(),
            date: today,
            product: product,
            quantity: quantity,
            unit: unit,
            quality: quality,
            batch: '',
            notes: 'Quick entry'
        };

        this.addProduction(productionData);
        
        document.getElementById('quick-production-form')?.reset();
        this.showNotification('Production recorded successfully!', 'success');
    },

    handleProductChange() {
        const productSelect = document.getElementById('production-product');
        const selectedValue = productSelect?.value;
        
        const customProductContainer = document.getElementById('custom-product-container');
        if (customProductContainer) {
            customProductContainer.style.display = selectedValue === 'other' ? 'block' : 'none';
        }
        
        const animalProducts = ['broilers', 'layers', 'pork', 'beef', 'goat', 'lamb'];
        const weightSection = document.getElementById('optional-weight-section');
        
        if (weightSection) {
            weightSection.style.display = animalProducts.includes(selectedValue) ? 'block' : 'none';
        }
        
        this.calculateTotalWeight();
    },

    calculateTotalWeight() {
        const quantity = parseInt(document.getElementById('production-quantity')?.value) || 0;
        const avgWeight = parseFloat(document.getElementById('animal-weight')?.value) || 0;
        const weightUnit = document.getElementById('animal-weight-unit')?.value || 'kg';
        
        const totalWeightSection = document.getElementById('calculated-total-weight');
        
        if (totalWeightSection && quantity > 0 && avgWeight > 0) {
            const totalWeight = quantity * avgWeight;
            const totalWeightValue = document.getElementById('total-weight-value');
            const totalWeightUnit = document.getElementById('total-weight-unit');
            
            if (totalWeightValue) totalWeightValue.textContent = totalWeight.toFixed(1);
            if (totalWeightUnit) totalWeightUnit.textContent = weightUnit;
            totalWeightSection.style.display = 'block';
        } else if (totalWeightSection) {
            totalWeightSection.style.display = 'none';
        }
    },

    // ========== MODAL METHODS ==========
    
    showProductionModal() {
        document.querySelectorAll('.popout-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        const modal = document.getElementById('production-modal');
        if (modal) modal.classList.remove('hidden');
        
        document.getElementById('custom-product-name').value = '';
        document.getElementById('custom-product-container').style.display = 'none';
        document.getElementById('animal-weight').value = '';
        document.getElementById('calculated-total-weight').style.display = 'none';
        
        const productionId = document.getElementById('production-id')?.value;
        
        if (!productionId) {
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('production-date');
            if (dateInput) dateInput.value = today;
            
            const title = document.getElementById('production-modal-title');
            if (title) title.textContent = 'New Production Record';
            
            const deleteBtn = document.getElementById('delete-production');
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            document.getElementById('production-form')?.reset();
            this.handleProductChange();
        } else {
            const deleteBtn = document.getElementById('delete-production');
            if (deleteBtn) deleteBtn.style.display = 'block';
            
            const title = document.getElementById('production-modal-title');
            if (title) title.textContent = 'Edit Production Record';
        }
    },

    hideProductionModal() {
        const modal = document.getElementById('production-modal');
        if (modal) modal.classList.add('hidden');
        document.getElementById('production-id').value = '';
        document.getElementById('production-form')?.reset();
        this.currentRecordId = null;
    },

    // ========== UTILITY METHODS ==========
    
    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayEggs = this.productionData
            .filter(record => record.date === today && record.product === 'eggs')
            .reduce((sum, record) => sum + record.quantity, 0);

        const last7DaysDate = new Date();
        last7DaysDate.setDate(last7DaysDate.getDate() - 7);
        const last7DaysString = last7DaysDate.toISOString().split('T')[0];
        
        const weekBirds = this.productionData
            .filter(record => record.date >= last7DaysString && 
                   (record.product === 'broilers' || record.product === 'layers'))
            .reduce((sum, record) => sum + record.quantity, 0);

        const vegetables = ['tomatoes', 'lettuce', 'carrots', 'potatoes', 'onions', 'cabbage', 'peppers', 'cucumbers', 'spinach', 'beans', 'corn'];
        const weekVegetables = this.productionData
            .filter(record => record.date >= last7DaysString && vegetables.includes(record.product))
            .reduce((sum, record) => sum + record.quantity, 0);

        this.updateElement('today-eggs', todayEggs.toLocaleString());
        this.updateElement('week-birds', weekBirds.toLocaleString());
        this.updateElement('week-vegetables', weekVegetables.toLocaleString());
        this.updateElement('total-records', this.productionData.length.toLocaleString());
    },

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    },

    showNotification(message, type = 'info') {
        if (window.App && window.App.showNotification) {
            window.App.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },

    formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    const [year, month, day] = parts;
                    const parsedDate = new Date(year, month - 1, day);
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
                return dateString;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    },

    getProductIcon(product) {
        const icons = {
            'eggs': '🥚', 'broilers': '🐔', 'layers': '🐓', 'milk': '🥛',
            'pork': '🐖', 'beef': '🐄', 'goat': '🐐', 'lamb': '🐑',
            'tomatoes': '🍅', 'lettuce': '🥬', 'carrots': '🥕', 'potatoes': '🥔',
            'onions': '🧅', 'cabbage': '🥬', 'peppers': '🫑', 'cucumbers': '🥒',
            'spinach': '🥬', 'beans': '🫘', 'corn': '🌽', 'apples': '🍎',
            'oranges': '🍊', 'bananas': '🍌', 'berries': '🫐', 'mangoes': '🥭', 'honey': '🍯'
        };
        return icons[product] || '📦';
    },

    formatProductName(product) {
        const names = {
            'eggs': 'Eggs', 'broilers': 'Broilers', 'layers': 'Layers', 'milk': 'Milk',
            'pork': 'Pork', 'beef': 'Beef', 'goat': 'Goat', 'lamb': 'Lamb',
            'tomatoes': 'Tomatoes', 'lettuce': 'Lettuce', 'carrots': 'Carrots',
            'potatoes': 'Potatoes', 'onions': 'Onions', 'cabbage': 'Cabbage',
            'peppers': 'Peppers', 'cucumbers': 'Cucumbers', 'spinach': 'Spinach',
            'beans': 'Beans', 'corn': 'Corn', 'apples': 'Apples', 'oranges': 'Oranges',
            'bananas': 'Bananas', 'berries': 'Berries', 'mangoes': 'Mangoes', 'honey': 'Honey'
        };
        
        if (names[product]) return names[product];
        
        return product.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatQuality(quality) {
        const qualityMap = {
            'excellent': '⭐ Excellent',
            'grade-a': '🟢 Grade A',
            'grade-b': '🟡 Grade B',
            'standard': '🔵 Standard',
            'rejects': '🔴 Rejects'
        };
        return qualityMap[quality] || quality;
    },

    // ========== EXPORT METHODS ==========
    
    exportProduction() {
        const dataStr = JSON.stringify(this.productionData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `farm-production-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        this.showNotification('Production data exported successfully!', 'success');
    },

    generateProductionReport() {
        // Implementation
        this.showNotification('Report generation coming soon!', 'info');
    },

    generateTrendAnalysis() {
        // Implementation
        this.showNotification('Trend analysis coming soon!', 'info');
    },

    // ========== UNLOAD METHOD ==========
    
    unload() {
        console.log('📦 Unloading Production module...');
        this.broadcaster = null;
        this.initialized = false;
        this.element = null;
        console.log('✅ Production module unloaded');
    }
};

// ========== REGISTRATION ==========
(function() {
    const MODULE_NAME = 'production';
    const MODULE_OBJECT = ProductionModule;
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
