    // ===== NEW METHOD: Update production from sale =====
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
    }
    
    // ========== CRITICAL: COMMUNICATE WITH INCOME MODULE ==========
    // This section was misplaced - remove it or integrate properly
    
    // ===== EXISTING: Update localStorage (keep as fallback) =====
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
        
        // Find the sale before deleting
        const saleToDelete = window.FarmModules.appData.sales.find(s => s.id === saleId);
        if (!saleToDelete) {
            this.showNotification('Sale not found', 'error');
            return;
        }
        
        // Filter out the sale to be deleted
        window.FarmModules.appData.sales = window.FarmModules.appData.sales.filter(s => s.id !== saleId);
        
        // Save the updated data
        this.saveData();
        
        // Broadcast sale deleted
        if (this.broadcaster) {
            this.broadcaster.broadcast('sale-deleted', {
                module: 'sales-record',
                timestamp: new Date().toISOString(),
                saleId: saleId,
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
    }
    
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
        // ... existing code ...
    },
    
    generateMeatSalesReport() {
        // ... existing code ...
    },

    printDailyReport() {
        // ... existing code ...
    },

    printMeatSalesReport() {
        // ... existing code ...
    },

    // Utility methods
    getProductIcon(product) {
        // ... existing code ...
    },

    formatProductName(product) {
        // ... existing code ...
    },

    formatCurrency(amount) {
        // ... existing code ...
    },

    showNotification(message, type = 'info') {
        // ... existing code ...
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
}; // ← Make sure this closing brace is here!

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
