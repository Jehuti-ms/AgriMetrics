// modules/feed-record.js - UPDATED WITH STYLE MANAGER INTEGRATION
console.log('Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 1000,
    element: null,

    initialize() {
        console.log('🌾 Initializing Feed Records...');
        
        // ✅ ADDED: Get the content area element
        this.element = document.getElementById('content-area');
        if (!this.element) return false;

        // ✅ ADDED: Register with StyleManager
        if (window.StyleManager) {
            StyleManager.registerModule(this.id, this.element, this);
        }

        this.loadData();
        this.renderModule();
        this.setupEventListeners();
        this.initialized = true;
        this.syncStatsWithSharedData();
        
        console.log('✅ Feed Records initialized with StyleManager');
        return true;
    },

    // ✅ ADDED: Theme change handler (optional)
    onThemeChange(theme) {
        console.log(`Feed Records updating for theme: ${theme}`);
        // You can add theme-specific logic here if needed
    },

    loadData() {
        const savedRecords = localStorage.getItem('farm-feed-records');
        const savedInventory = localStorage.getItem('farm-feed-inventory');
        const savedBirds = localStorage.getItem('farm-birds-stock');
        
        this.feedRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoRecords();
        this.feedInventory = savedInventory ? JSON.parse(savedInventory) : this.getDemoInventory();
        this.birdsStock = savedBirds ? parseInt(savedBirds) : 1000;
    },

    getDemoRecords() {
        return [
            { id: 1, date: '2024-03-15', feedType: 'starter', quantity: 50, birdsFed: 500, cost: 125, notes: 'Morning feeding' },
            { id: 2, date: '2024-03-14', feedType: 'grower', quantity: 45, birdsFed: 480, cost: 112.5, notes: 'Regular feeding' },
            { id: 3, date: '2024-03-13', feedType: 'finisher', quantity: 40, birdsFed: 450, cost: 100, notes: 'Evening feeding' }
        ];
    },

    getDemoInventory() {
        return [
            { id: 1, feedType: 'starter', currentStock: 150, unit: 'kg', costPerKg: 2.5, minStock: 50 },
            { id: 2, feedType: 'grower', currentStock: 120, unit: 'kg', costPerKg: 2.3, minStock: 40 },
            { id: 3, feedType: 'finisher', currentStock: 100, unit: 'kg', costPerKg: 2.2, minStock: 30 },
            { id: 4, feedType: 'layer', currentStock: 80, unit: 'kg', costPerKg: 2.4, minStock: 20 }
        ];
    },

    renderModule() {
        if (!this.element) return;

        const stats = this.calculateStats();

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                </div>

                <!-- Quick Actions -->
                <div class="quick-action-grid">
                    <button class="quick-action-btn" id="record-feed-btn">
                        <div style="font-size: 32px;">📝</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Record Feed</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Log feed usage</span>
                    </button>
                    <button class="quick-action-btn" id="add-stock-btn">
                        <div style="font-size: 32px;">📦</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Add Stock</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Add feed to inventory</span>
                    </button>
                    <button class="quick-action-btn" id="adjust-birds-btn">
                        <div style="font-size: 32px;">🐔</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Adjust Birds</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Update bird count</span>
                    </button>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🌾</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalStock} kg</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.birdsStock}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds to Feed</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.totalInventoryValue)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Inventory Value</div>
                    </div>
                </div>

                <!-- Inventory Overview -->
                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">Feed Inventory</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderInventoryOverview()}
                    </div>
                </div>

                <!-- Simple Form -->
                <div class="glass-card" style="padding: 24px; margin: 24px 0;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px;">Record Feed Usage</h3>
                    <form id="feed-record-form">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label class="form-label">Feed Type</label>
                                <select class="form-input" id="feed-type" required>
                                    <option value="">Select feed type</option>
                                    ${this.feedInventory.map(item => `
                                        <option value="${item.feedType}" ${item.currentStock <= item.minStock ? 'disabled' : ''}>
                                            ${item.feedType.charAt(0).toUpperCase() + item.feedType.slice(1)} Feed 
                                            ${item.currentStock <= item.minStock ? '(Low Stock)' : ''}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Quantity (kg)</label>
                                <input type="number" class="form-input" id="feed-quantity" step="0.1" min="0.1" required>
                            </div>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="feed-notes" rows="2" placeholder="Feeding details..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Save Record</button>
                    </form>
                </div>

                <!-- Recent Records -->
                <div class="glass-card" style="padding: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Feed Records</h3>
                    <div id="feed-records-list">
                        ${this.renderFeedRecordsList()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const totalInventoryValue = this.feedInventory.reduce((sum, item) => sum + (item.currentStock * item.costPerKg), 0);
        return { totalStock, totalInventoryValue };
    },

    renderInventoryOverview() {
        return this.feedInventory.map(item => {
            const isLowStock = item.currentStock <= item.minStock;
            const stockStatus = isLowStock ? 'Low Stock' : 'Good';
            const statusColor = isLowStock ? '#ef4444' : '#10b981';
            
            return `
                <div style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                            ${item.feedType}
                        </span>
                        <span style="font-size: 12px; color: ${statusColor}; font-weight: 600;">
                            ${stockStatus}
                        </span>
                    </div>
                    <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">
                        ${item.currentStock} ${item.unit}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Min: ${item.minStock}${item.unit} • ${this.formatCurrency(item.costPerKg)}/kg
                    </div>
                </div>
            `;
        }).join('');
    },

  // Replace the renderFeedRecordsList() method (around line 179) with this:
renderFeedRecordsList() {
    if (this.feedRecords.length === 0) {
        return `
            <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No feed records yet</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Record your first feed usage</div>
            </div>
        `;
    }

    return this.feedRecords.slice(0, 5).map(record => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 12px;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                    ${record.feedType} Feed
                </div>
                <div style="font-size: 14px; color: var(--text-secondary);">
                    ${record.date} • ${record.quantity}kg • ${record.birdsFed} birds
                </div>
                ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${record.notes}</div>` : ''}
            </div>
            <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
                <div>
                    <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">
                        ${this.formatCurrency(record.cost)}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${(record.cost / record.quantity).toFixed(2)}/kg
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-icon edit-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Edit Record">
                        ✏️
                    </button>
                    <button class="btn-icon delete-feed-record" data-id="${record.id}" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: var(--text-secondary);" title="Delete Record">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
},

// Add this method after the renderFeedRecordsList() method:
editFeedRecord(recordId) {
    console.log('🌾 EDITING FEED RECORD:', recordId);
    
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) {
        this.showNotification('Feed record not found', 'error');
        return;
    }
    
    // Scroll to form
    this.showFeedForm();
    
    // Wait for form to render, then populate
    setTimeout(() => {
        const form = document.getElementById('feed-record-form');
        if (!form) return;
        
        // Change title
        const formCard = form.closest('.glass-card');
        const title = formCard.querySelector('h3');
        if (title) title.textContent = 'Edit Feed Record';
        
        // Populate form
        form.querySelector('#feed-type').value = record.feedType;
        form.querySelector('#feed-quantity').value = record.quantity;
        form.querySelector('#feed-notes').value = record.notes || '';
        
        // Change submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Record';
            
            // Remove old submit handler
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
            
            newSubmitBtn.onclick = (e) => {
                e.preventDefault();
                this.updateFeedRecord(recordId);
            };
        }
        
        // Add cancel edit button
        const formContainer = form.parentElement;
        const cancelEditBtn = document.createElement('button');
        cancelEditBtn.type = 'button';
        cancelEditBtn.className = 'btn-outline';
        cancelEditBtn.textContent = 'Cancel Edit';
        cancelEditBtn.style.marginLeft = '8px';
        cancelEditBtn.onclick = () => {
            this.cancelFeedEdit();
        };
        
        submitBtn.parentNode.appendChild(cancelEditBtn);
        
        console.log('✅ Feed record form populated for editing');
        
    }, 100);
},

// Add this method after editFeedRecord():
updateFeedRecord(recordId) {
    console.log('💾 UPDATING FEED RECORD:', recordId);
    
    const form = document.getElementById('feed-record-form');
    if (!form) return;
    
    const feedType = form.querySelector('#feed-type').value;
    const quantity = parseFloat(form.querySelector('#feed-quantity').value);
    const notes = form.querySelector('#feed-notes').value;
    
    // Check if feed type has sufficient stock (considering we're editing, not adding new)
    const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
    if (!inventoryItem) {
        this.showNotification('Invalid feed type selected!', 'error');
        return;
    }
    
    // Find the original record to check stock adjustments
    const originalRecord = this.feedRecords.find(r => r.id === recordId);
    if (!originalRecord) return;
    
    // Calculate stock adjustment
    const stockAdjustment = originalRecord.quantity - quantity;
    const newStock = inventoryItem.currentStock + stockAdjustment;
    
    if (newStock < 0) {
        this.showNotification(`Cannot adjust stock below zero!`, 'error');
        return;
    }
    
    // Update inventory
    inventoryItem.currentStock = newStock;
    
    // Update record
    const recordIndex = this.feedRecords.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        this.feedRecords[recordIndex] = {
            ...this.feedRecords[recordIndex],
            feedType,
            quantity,
            cost: this.calculateCost(feedType, quantity),
            notes
        };
        
        this.saveData();
        this.renderModule();
        this.cancelFeedEdit();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Feed record updated!`, 'success');
        }
    }
},

// Add this method after updateFeedRecord():
cancelFeedEdit() {
    const form = document.getElementById('feed-record-form');
    if (!form) return;
    
    // Reset form
    form.reset();
    
    // Reset title
    const formCard = form.closest('.glass-card');
    const title = formCard.querySelector('h3');
    if (title) title.textContent = 'Record Feed Usage';
    
    // Reset submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Save Record';
        
        // Remove any custom event listeners
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        newSubmitBtn.onclick = null;
        form.onsubmit = (e) => this.handleFeedRecordSubmit(e);
    }
    
    // Remove cancel edit button
    const cancelBtn = form.querySelector('.btn-outline[type="button"]');
    if (cancelBtn) cancelBtn.remove();
},

// Add this method after cancelFeedEdit():
deleteFeedRecord(recordId) {
    const record = this.feedRecords.find(r => r.id === recordId);
    if (!record) return;
    
    if (confirm(`Delete feed record for ${record.quantity}kg of ${record.feedType} feed?`)) {
        // Return stock to inventory when deleting
        const inventoryItem = this.feedInventory.find(item => item.feedType === record.feedType);
        if (inventoryItem) {
            inventoryItem.currentStock += record.quantity;
        }
        
        // Remove record
        this.feedRecords = this.feedRecords.filter(r => r.id !== recordId);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Feed record deleted!', 'success');
        }
    }
},

// Add this method after deleteFeedRecord():
showNotification(message, type = 'info') {
    if (window.coreModule && typeof window.coreModule.showNotification === 'function') {
        window.coreModule.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(`${type.toUpperCase()}: ${message}`);
    }
},

// Update the setupEventListeners() method to include edit/delete handlers:
setupEventListeners() {
    document.getElementById('feed-record-form')?.addEventListener('submit', (e) => this.handleFeedRecordSubmit(e));
    document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
    document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showAddStockForm());
    document.getElementById('adjust-birds-btn')?.addEventListener('click', () => this.showAdjustBirdsForm());
    
    // Add event delegation for edit/delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-feed-record')) {
            const id = parseInt(e.target.closest('.edit-feed-record').dataset.id);
            this.editFeedRecord(id);
        }
        else if (e.target.closest('.delete-feed-record')) {
            const id = parseInt(e.target.closest('.delete-feed-record').dataset.id);
            this.deleteFeedRecord(id);
        }
    });
},

    setupEventListeners() {
        document.getElementById('feed-record-form')?.addEventListener('submit', (e) => this.handleFeedRecordSubmit(e));
        document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
        document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showAddStockForm());
        document.getElementById('adjust-birds-btn')?.addEventListener('click', () => this.showAdjustBirdsForm());
    },

    handleFeedRecordSubmit(e) {
        e.preventDefault();
        
        const feedType = document.getElementById('feed-type').value;
        const quantity = parseFloat(document.getElementById('feed-quantity').value);
        
        // Check if feed type has sufficient stock
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (!inventoryItem) {
            if (window.coreModule) {
                window.coreModule.showNotification('Invalid feed type selected!', 'error');
            }
            return;
        }
        
        if (inventoryItem.currentStock < quantity) {
            if (window.coreModule) {
                window.coreModule.showNotification(`Insufficient stock! Only ${inventoryItem.currentStock}kg available.`, 'error');
            }
            return;
        }

        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            feedType: feedType,
            quantity: quantity,
            cost: this.calculateCost(feedType, quantity),
            notes: document.getElementById('feed-notes').value,
            birdsFed: this.birdsStock
        };

        // Update inventory
        inventoryItem.currentStock -= quantity;
        
        this.feedRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        // Sync stats with shared data
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${formData.quantity}kg ${feedType} feed usage!`, 'success');
        }
    },

    showFeedForm() {
        document.getElementById('feed-record-form').scrollIntoView({ behavior: 'smooth' });
    },

    showAddStockForm() {
        const feedType = prompt('Enter feed type (starter/grower/finisher/layer):');
        if (!feedType) return;
        
        const quantity = parseFloat(prompt(`Enter quantity to add to ${feedType} (kg):`));
        if (isNaN(quantity) || quantity <= 0) {
            if (window.coreModule) {
                window.coreModule.showNotification('Invalid quantity entered!', 'error');
            }
            return;
        }

        this.addToInventory(feedType, quantity);
    },

    showAdjustBirdsForm() {
        const newCount = parseInt(prompt(`Current birds: ${this.birdsStock}\nEnter new bird count:`));
        if (isNaN(newCount) || newCount < 0) {
            if (window.coreModule) {
                window.coreModule.showNotification('Invalid bird count entered!', 'error');
            }
            return;
        }

        this.adjustBirdCount(newCount);
    },

    addToInventory(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        if (inventoryItem) {
            inventoryItem.currentStock += quantity;
            this.saveData();
            this.renderModule();
            this.syncStatsWithSharedData();
            if (window.coreModule) {
                window.coreModule.showNotification(`Added ${quantity}kg to ${feedType} inventory!`, 'success');
            }
        } else {
            // Create new inventory item
            const newItem = {
                id: Date.now(),
                feedType: feedType,
                currentStock: quantity,
                unit: 'kg',
                costPerKg: 2.5, // Default cost
                minStock: 20
            };
            this.feedInventory.push(newItem);
            this.saveData();
            this.renderModule();
            this.syncStatsWithSharedData();
            if (window.coreModule) {
                window.coreModule.showNotification(`Created new ${feedType} inventory with ${quantity}kg!`, 'success');
            }
        }
    },

    adjustBirdCount(newCount) {
        this.birdsStock = newCount;
        this.saveData();
        this.renderModule();
        this.syncStatsWithSharedData();
        if (window.coreModule) {
            window.coreModule.showNotification(`Adjusted bird count to ${newCount}!`, 'success');
        }
    },

    calculateCost(feedType, quantity) {
        const inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        return quantity * (inventoryItem?.costPerKg || 2.5);
    },

    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.birdsStock;
            window.FarmModules.appData.profile.dashboardStats.totalFeedStock = stats.totalStock;
            window.FarmModules.appData.profile.dashboardStats.inventoryValue = stats.totalInventoryValue;
        }
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    saveData() {
        localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
        localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
        localStorage.setItem('farm-birds-stock', this.birdsStock.toString());
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('feed-record', FeedRecordModule);
    console.log('✅ Feed Records module registered');
}

// Add hover effects for edit/delete buttons
function enhanceFeedEditButtons() {
    const editButtons = document.querySelectorAll('.edit-feed-record');
    const deleteButtons = document.querySelectorAll('.delete-feed-record');
    
    editButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.2)';
            btn.style.color = '#3b82f6';
            btn.style.background = 'rgba(59, 130, 246, 0.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.color = '';
            btn.style.background = '';
        });
    });
    
    deleteButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.2)';
            btn.style.color = '#ef4444';
            btn.style.background = 'rgba(239, 68, 68, 0.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.color = '';
            btn.style.background = '';
        });
    });
}

// Apply when module loads
setTimeout(() => {
    enhanceFeedEditButtons();
    
    // Re-apply when switching to feed-record
    document.addEventListener('click', function(e) {
        if (e.target.closest('[href*="#feed-record"], [onclick*="feed-record"]')) {
            setTimeout(enhanceFeedEditButtons, 500);
        }
    });
}, 1000);

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'feed-record.js'; // e.g., 'dashboard'
    const MODULE_OBJECT = FeedRecordModule; // e.g., DashboardModule
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
