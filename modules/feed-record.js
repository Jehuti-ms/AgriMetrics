// modules/feed-record.js - FULLY WORKING
console.log('Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],

    initialize() {
        console.log('🌾 Initializing feed records...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        return true;
    },

    loadData() {
        const savedRecords = localStorage.getItem('farm-feed-records');
        const savedInventory = localStorage.getItem('farm-feed-inventory');
        
        this.feedRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoRecords();
        this.feedInventory = savedInventory ? JSON.parse(savedInventory) : this.getDemoInventory();
    },

    getDemoRecords() {
        return [
            { id: 1, date: '2024-03-15', feedType: 'starter', quantity: 50, birdsFed: 500, cost: 125 },
            { id: 2, date: '2024-03-14', feedType: 'grower', quantity: 45, birdsFed: 480, cost: 112.5 },
            { id: 3, date: '2024-03-13', feedType: 'finisher', quantity: 40, birdsFed: 450, cost: 100 }
        ];
    },

    getDemoInventory() {
        return [
            { id: 1, feedType: 'starter', currentStock: 150, unit: 'kg', costPerKg: 2.5 },
            { id: 2, feedType: 'grower', currentStock: 120, unit: 'kg', costPerKg: 2.3 },
            { id: 3, feedType: 'finisher', currentStock: 100, unit: 'kg', costPerKg: 2.2 }
        ];
    },

    renderModule() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        const stats = this.calculateStats();

        contentArea.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Feed Records</h1>
                    <p class="module-subtitle">Track feed usage and inventory</p>
                </div>

                <!-- Feed Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🌾</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalStock} kg</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.thisWeekUsage} kg</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">This Week</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalBirds}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds Fed</div>
                    </div>
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
                    <button class="quick-action-btn" id="feed-report-btn">
                        <div style="font-size: 32px;">📈</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Feed Report</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">View consumption</span>
                    </button>
                </div>

                <!-- Record Feed Form -->
                <div id="feed-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Record Feed Usage</h3>
                        <form id="feed-record-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Feed Type</label>
                                    <select class="form-input" id="feed-type" required>
                                        <option value="starter">Starter Feed</option>
                                        <option value="grower">Grower Feed</option>
                                        <option value="finisher">Finisher Feed</option>
                                        <option value="layer">Layer Feed</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" id="feed-date" required>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Quantity (kg)</label>
                                    <input type="number" class="form-input" id="feed-quantity" step="0.1" min="0" required>
                                </div>
                                <div>
                                    <label class="form-label">Birds Fed</label>
                                    <input type="number" class="form-input" id="birds-fed" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Cost ($)</label>
                                <input type="number" class="form-input" id="feed-cost" step="0.01" min="0" required>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Save Record</button>
                                <button type="button" class="btn-outline" id="cancel-feed-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Add Stock Form -->
                <div id="stock-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Add Feed Stock</h3>
                        <form id="stock-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label class="form-label">Feed Type</label>
                                    <select class="form-input" id="stock-feed-type" required>
                                        <option value="starter">Starter Feed</option>
                                        <option value="grower">Grower Feed</option>
                                        <option value="finisher">Finisher Feed</option>
                                        <option value="layer">Layer Feed</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Quantity to Add (kg)</label>
                                    <input type="number" class="form-input" id="add-quantity" step="0.1" min="0" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Cost per kg ($)</label>
                                <input type="number" class="form-input" id="cost-per-kg" step="0.01" min="0" required>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Add Stock</button>
                                <button type="button" class="btn-outline" id="cancel-stock-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Feed Records & Inventory -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Recent Records -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Feed Records</h3>
                        <div id="feed-records-list">
                            ${this.renderFeedRecordsList()}
                        </div>
                    </div>

                    <!-- Current Inventory -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Feed Inventory</h3>
                        <div id="feed-inventory-list">
                            ${this.renderFeedInventoryList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    calculateStats() {
        const totalStock = this.feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekUsage = this.feedRecords
            .filter(record => new Date(record.date) >= oneWeekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);
        
        const totalBirds = this.feedRecords.length > 0 
            ? this.feedRecords[0].birdsFed // Latest record
            : 0;

        return { totalStock, thisWeekUsage, totalBirds };
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">🌾</div>
                    <div style="font-size: 14px;">No feed records yet</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.feedRecords.slice(0, 5).map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${record.feedType} Feed</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${record.date} • ${record.birdsFed} birds</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary);">${record.quantity} kg</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">$${record.cost}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderFeedInventoryList() {
        if (this.feedInventory.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">📦</div>
                    <div style="font-size: 14px;">No feed inventory</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.feedInventory.map(item => {
                    const status = item.currentStock < 50 ? 'Low' : 'Adequate';
                    const statusColor = status === 'Adequate' ? '#22c55e' : '#f59e0b';
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${item.feedType} Feed</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">$${item.costPerKg}/kg</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: var(--text-primary);">${item.currentStock} kg</div>
                                <div style="font-size: 12px; padding: 2px 8px; border-radius: 8px; background: ${statusColor}20; color: ${statusColor};">
                                    ${status}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
        document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showStockForm());
        document.getElementById('feed-report-btn')?.addEventListener('click', () => this.generateFeedReport());
        
        // Form handlers
        document.getElementById('feed-record-form')?.addEventListener('submit', (e) => this.handleFeedRecordSubmit(e));
        document.getElementById('stock-form')?.addEventListener('submit', (e) => this.handleStockSubmit(e));
        document.getElementById('cancel-feed-form')?.addEventListener('click', () => this.hideFeedForm());
        document.getElementById('cancel-stock-form')?.addEventListener('click', () => this.hideStockForm());

        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('feed-date');
        if (dateInput) dateInput.value = today;

        // Hover effects
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
            });
            button.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            });
        });
    },

    showFeedForm() {
        document.getElementById('feed-form-container').classList.remove('hidden');
        document.getElementById('feed-record-form').reset();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('feed-date').value = today;
        
        document.getElementById('feed-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideFeedForm() {
        document.getElementById('feed-form-container').classList.add('hidden');
    },

    showStockForm() {
        document.getElementById('stock-form-container').classList.remove('hidden');
        document.getElementById('stock-form').reset();
        document.getElementById('stock-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideStockForm() {
        document.getElementById('stock-form-container').classList.add('hidden');
    },

    handleFeedRecordSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('feed-date').value,
            feedType: document.getElementById('feed-type').value,
            quantity: parseFloat(document.getElementById('feed-quantity').value),
            birdsFed: parseInt(document.getElementById('birds-fed').value),
            cost: parseFloat(document.getElementById('feed-cost').value)
        };

        // Update inventory
        this.updateInventory(formData.feedType, -formData.quantity);

        this.feedRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Feed record added!', 'success');
        }
    },

    handleStockSubmit(e) {
        e.preventDefault();
        
        const feedType = document.getElementById('stock-feed-type').value;
        const quantity = parseFloat(document.getElementById('add-quantity').value);
        const costPerKg = parseFloat(document.getElementById('cost-per-kg').value);

        // Update inventory
        this.updateInventory(feedType, quantity, costPerKg);

        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification('Feed stock added!', 'success');
        }
    },

    updateInventory(feedType, quantity, costPerKg = null) {
        let inventoryItem = this.feedInventory.find(item => item.feedType === feedType);
        
        if (!inventoryItem) {
            inventoryItem = {
                id: Date.now(),
                feedType: feedType,
                currentStock: 0,
                unit: 'kg',
                costPerKg: costPerKg || 0
            };
            this.feedInventory.push(inventoryItem);
        }

        inventoryItem.currentStock += quantity;
        if (costPerKg) {
            inventoryItem.costPerKg = costPerKg;
        }

        // Ensure stock doesn't go negative
        if (inventoryItem.currentStock < 0) {
            inventoryItem.currentStock = 0;
        }
    },

    generateFeedReport() {
        const totalUsage = this.feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalCost = this.feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const avgCostPerKg = totalUsage > 0 ? totalCost / totalUsage : 0;

        let report = `📊 Feed Consumption Report\n\n`;
        report += `Total Usage: ${totalUsage.toFixed(1)} kg\n`;
        report += `Total Cost: $${totalCost.toFixed(2)}\n`;
        report += `Avg Cost/kg: $${avgCostPerKg.toFixed(2)}\n\n`;
        report += `Current Inventory:\n`;

        this.feedInventory.forEach(item => {
            report += `• ${item.feedType}: ${item.currentStock} kg\n`;
        });

        alert(report);
    },

    saveData() {
        localStorage.setItem('farm-feed-records', JSON.stringify(this.feedRecords));
        localStorage.setItem('farm-feed-inventory', JSON.stringify(this.feedInventory));
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('feed-record', FeedRecordModule);
}
