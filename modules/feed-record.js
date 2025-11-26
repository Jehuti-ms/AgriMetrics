// modules/feed-record.js - FULLY WORKING
console.log('Loading feed-record module...');

const FeedRecordModule = {
    name: 'feed-record',
    initialized: false,
    feedRecords: [],
    feedInventory: [],
    birdsStock: 1000, // Current number of birds

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
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.birdsStock}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Birds to Feed</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.formatCurrency(stats.avgCostPerBird)}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Cost/Bird/Day</div>
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
                    <button class="quick-action-btn" id="adjust-birds-btn">
                        <div style="font-size: 32px;">🐔</div>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Adjust Birds</span>
                        <span style="font-size: 12px; color: var(--text-secondary); text-align: center;">Update bird count</span>
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
                                        <option value="">Select feed type</option>
                                        ${this.feedInventory.map(feed => `
                                            <option value="${feed.feedType}" data-stock="${feed.currentStock}" data-cost="${feed.costPerKg}">
                                                ${this.formatFeedType(feed.feedType)} (${feed.currentStock} kg available)
                                            </option>
                                        `).join('')}
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
                                    <input type="number" class="form-input" id="feed-quantity" step="0.1" min="0.1" required>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;" id="stock-info">
                                        Select feed type to see available stock
                                    </div>
                                </div>
                                <div>
                                    <label class="form-label">Birds Fed</label>
                                    <input type="number" class="form-input" id="birds-fed" min="1" max="${this.birdsStock}" value="${this.birdsStock}" required>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                        Total birds: ${this.birdsStock}
                                    </div>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Cost ($)</label>
                                <input type="number" class="form-input" id="feed-cost" step="0.01" min="0" required>
                                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;" id="cost-info">
                                    Cost will auto-calculate when you select feed type
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" id="feed-notes" rows="2" placeholder="Feeding time, observations, etc."></textarea>
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
                                        <option value="other">Other Feed</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Quantity to Add (kg)</label>
                                    <input type="number" class="form-input" id="add-quantity" step="0.1" min="0.1" required>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Cost per kg ($)</label>
                                <input type="number" class="form-input" id="cost-per-kg" step="0.01" min="0" required>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Supplier/Batch</label>
                                <input type="text" class="form-input" id="stock-notes" placeholder="Supplier name, batch number, etc.">
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Add Stock</button>
                                <button type="button" class="btn-outline" id="cancel-stock-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Adjust Birds Form -->
                <div id="birds-form-container" class="hidden">
                    <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px;">Adjust Bird Count</h3>
                        <form id="birds-form">
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Current Bird Count</label>
                                <div style="font-size: 24px; font-weight: bold; color: var(--primary-color); text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                                    ${this.birdsStock} birds
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">New Bird Count</label>
                                <input type="number" class="form-input" id="new-birds-count" min="0" value="${this.birdsStock}" required>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">Reason for Change</label>
                                <select class="form-input" id="birds-change-reason" required>
                                    <option value="mortality">Mortality/Losses</option>
                                    <option value="new-batch">New Batch Added</option>
                                    <option value="sale">Birds Sold</option>
                                    <option value="transfer">Transfer/Movement</option>
                                    <option value="correction">Count Correction</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn-primary">Update Count</button>
                                <button type="button" class="btn-outline" id="cancel-birds-form">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Feed Inventory & Recent Records -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Feed Inventory -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Feed Inventory</h3>
                            <button class="btn-primary" id="show-stock-form">Add Stock</button>
                        </div>
                        <div id="feed-inventory-list">
                            ${this.renderFeedInventoryList()}
                        </div>
                    </div>

                    <!-- Recent Feed Records -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: var(--text-primary); font-size: 20px;">Recent Feed Records</h3>
                            <button class="btn-primary" id="show-feed-form">Record Feed</button>
                        </div>
                        <div id="feed-records-list">
                            ${this.renderFeedRecordsList()}
                        </div>
                    </div>
                </div>

                <!-- Feed Alerts & Consumption Trends -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Feed Alerts -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Feed Alerts</h3>
                        <div id="feed-alerts">
                            ${this.renderFeedAlerts()}
                        </div>
                    </div>

                    <!-- Consumption Summary -->
                    <div class="glass-card" style="padding: 24px;">
                        <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Consumption Summary</h3>
                        <div id="consumption-summary">
                            ${this.renderConsumptionSummary()}
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

        const totalCost = this.feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const totalBirdsDays = this.feedRecords.reduce((sum, record) => sum + record.birdsFed, 0);
        const avgCostPerBird = totalBirdsDays > 0 ? totalCost / totalBirdsDays : 0;

        return { 
            totalStock, 
            thisWeekUsage: thisWeekUsage.toFixed(1), 
            avgCostPerBird: avgCostPerBird.toFixed(3)
        };
    },

    renderFeedInventoryList() {
        if (this.feedInventory.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">📦</div>
                    <div style="font-size: 14px;">No feed inventory</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Add your first feed stock</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.feedInventory.map(item => {
                    const status = this.getStockStatus(item);
                    const statusColor = status === 'Adequate' ? '#22c55e' : status === 'Low' ? '#f59e0b' : '#ef4444';
                    const usage = this.getFeedUsage(item.feedType);
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                                    ${this.formatFeedType(item.feedType)} Feed
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary);">
                                    $${item.costPerKg}/kg • Min: ${item.minStock}kg
                                </div>
                                ${usage > 0 ? `<div style="font-size: 12px; color: var(--text-secondary);">Usage: ${usage} kg/week</div>` : ''}
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; color: var(--text-primary); font-size: 18px;">${item.currentStock} kg</div>
                                <div style="font-size: 12px; padding: 2px 8px; border-radius: 8px; background: ${statusColor}20; color: ${statusColor}; margin-top: 4px;">
                                    ${status} Stock
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderFeedRecordsList() {
        if (this.feedRecords.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">🌾</div>
                    <div style="font-size: 14px;">No feed records</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Record your first feed usage</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.feedRecords.slice(0, 5).map(record => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
                                ${this.formatFeedType(record.feedType)} Feed
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary);">
                                ${record.date} • ${record.birdsFed} birds
                            </div>
                            ${record.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${record.notes}</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--text-primary);">${record.quantity} kg</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${this.formatCurrency(record.cost)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderFeedAlerts() {
        const alerts = [];

        // Check for low stock
        this.feedInventory.forEach(item => {
            if (item.currentStock <= item.minStock) {
                alerts.push({
                    type: 'low-stock',
                    message: `${this.formatFeedType(item.feedType)} feed is low (${item.currentStock}kg)`,
                    severity: 'high',
                    icon: '⚠️'
                });
            } else if (item.currentStock <= item.minStock * 2) {
                alerts.push({
                    type: 'warning-stock',
                    message: `${this.formatFeedType(item.feedType)} feed is getting low`,
                    severity: 'medium',
                    icon: '📉'
                });
            }
        });

        // Check consumption patterns
        const recentUsage = this.getRecentUsage();
        if (recentUsage > this.birdsStock * 0.2) { // More than 200g per bird per day
            alerts.push({
                type: 'high-consumption',
                message: 'High feed consumption detected',
                severity: 'medium',
                icon: '📊'
            });
        }

        if (alerts.length === 0) {
            return `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">✅</div>
                    <div style="font-size: 14px;">No feed alerts</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">All feed levels are good</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${alerts.map(alert => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${this.getAlertColor(alert.severity)}20; border-radius: 8px; border-left: 4px solid ${this.getAlertColor(alert.severity)};">
                        <div style="font-size: 20px;">${alert.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">${alert.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderConsumptionSummary() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentRecords = this.feedRecords.filter(record => new Date(record.date) >= weekAgo);
        const totalConsumption = recentRecords.reduce((sum, record) => sum + record.quantity, 0);
        const avgDailyConsumption = recentRecords.length > 0 ? totalConsumption / 7 : 0;
        const consumptionPerBird = this.birdsStock > 0 ? (totalConsumption / this.birdsStock / 7) * 1000 : 0; // grams per bird per day

        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Weekly Consumption:</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${totalConsumption.toFixed(1)} kg</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Avg Daily:</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${avgDailyConsumption.toFixed(1)} kg/day</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Per Bird:</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${consumptionPerBird.toFixed(0)} g/bird/day</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Feed Cost:</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(recentRecords.reduce((sum, record) => sum + record.cost, 0))}</span>
                </div>
            </div>
        `;
    },

    getStockStatus(item) {
        if (item.currentStock === 0) return 'Out of Stock';
        if (item.currentStock <= item.minStock) return 'Low';
        return 'Adequate';
    },

    getFeedUsage(feedType) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.feedRecords
            .filter(record => record.feedType === feedType && new Date(record.date) >= weekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);
    },

    getRecentUsage() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.feedRecords
            .filter(record => new Date(record.date) >= weekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);
    },

    formatFeedType(feedType) {
        const types = {
            'starter': 'Starter',
            'grower': 'Grower',
            'finisher': 'Finisher',
            'layer': 'Layer',
            'other': 'Other'
        };
        return types[feedType] || feedType;
    },

    getAlertColor(severity) {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#3b82f6'
        };
        return colors[severity] || '#6b7280';
    },

    setupEventListeners() {
        // Form buttons
        document.getElementById('show-feed-form')?.addEventListener('click', () => this.showFeedForm());
        document.getElementById('show-stock-form')?.addEventListener('click', () => this.showStockForm());
        document.getElementById('record-feed-btn')?.addEventListener('click', () => this.showFeedForm());
        document.getElementById('add-stock-btn')?.addEventListener('click', () => this.showStockForm());
        document.getElementById('adjust-birds-btn')?.addEventListener('click', () => this.showBirdsForm());
        document.getElementById('feed-report-btn')?.addEventListener('click', () => this.generateFeedReport());
        
        // Form handlers
        document.getElementById('feed-record-form')?.addEventListener('submit', (e) => this.handleFeedRecordSubmit(e));
        document.getElementById('stock-form')?.addEventListener('submit', (e) => this.handleStockSubmit(e));
        document.getElementById('birds-form')?.addEventListener('submit', (e) => this.handleBirdsSubmit(e));
        document.getElementById('cancel-feed-form')?.addEventListener('click', () => this.hideFeedForm());
        document.getElementById('cancel-stock-form')?.addEventListener('click', () => this.hideStockForm());
        document.getElementById('cancel-birds-form')?.addEventListener('click', () => this.hideBirdsForm());

        // Feed type selection handler
        document.getElementById('feed-type')?.addEventListener('change', (e) => this.handleFeedTypeChange(e));
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const feedDate = document.getElementById('feed-date');
        const stockDate = document.getElementById('stock-date');
        if (feedDate) feedDate.value = today;

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
        document.getElementById('birds-fed').value = this.birdsStock;
        document.getElementById('birds-fed').max = this.birdsStock;
        
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

    showBirdsForm() {
        document.getElementById('birds-form-container').classList.remove('hidden');
        document.getElementById('birds-form').reset();
        document.getElementById('new-birds-count').value = this.birdsStock;
        document.getElementById('birds-form-container').scrollIntoView({ behavior: 'smooth' });
    },

    hideBirdsForm() {
        document.getElementById('birds-form-container').classList.add('hidden');
    },

    handleFeedTypeChange(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const stock = selectedOption.dataset.stock;
        const costPerKg = selectedOption.dataset.cost;
        
        const stockInfo = document.getElementById('stock-info');
        const costInput = document.getElementById('feed-cost');
        
        if (stock && costPerKg) {
            stockInfo.textContent = `Available: ${stock} kg`;
            stockInfo.style.color = '#22c55e';
            
            // Auto-calculate cost when quantity changes
            const quantityInput = document.getElementById('feed-quantity');
            quantityInput.addEventListener('input', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                costInput.value = (quantity * costPerKg).toFixed(2);
            });
        }
    },

    handleFeedRecordSubmit(e) {
        e.preventDefault();
        
        const feedType = document.getElementById('feed-type').value;
        const quantity = parseFloat(document.getElementById('feed-quantity').value);
        const selectedOption = document.getElementById('feed-type').options[document.getElementById('feed-type').selectedIndex];
        const availableStock = parseFloat(selectedOption.dataset.stock);

        if (quantity > availableStock) {
            alert(`Cannot use ${quantity}kg. Only ${availableStock}kg available.`);
            return;
        }

        const formData = {
            id: Date.now(),
            date: document.getElementById('feed-date').value,
            feedType: feedType,
            quantity: quantity,
            birdsFed: parseInt(document.getElementById('birds-fed').value),
            cost: parseFloat(document.getElementById('feed-cost').value),
            notes: document.getElementById('feed-notes').value
        };

        // Update inventory
        this.updateInventory(feedType, -quantity);

        this.feedRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${quantity}kg feed usage!`, 'success');
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
            window.coreModule.showNotification(`Added ${quantity}kg to ${this.formatFeedType(feedType)} feed stock!`, 'success');
        }
    },

    handleBirdsSubmit(e) {
        e.preventDefault();
        
        const newCount = parseInt(document.getElementById('new-birds-count').value);
        const reason = document.getElementById('birds-change-reason').value;
        
        const oldCount = this.birdsStock;
        this.birdsStock = newCount;

        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            const change = newCount - oldCount;
            const changeText = change > 0 ? `+${change}` : change;
            window.coreModule.showNotification(`Bird count updated: ${changeText} birds (${reason})`, 'success');
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
                costPerKg: costPerKg || 0,
                minStock: this.getDefaultMinStock(feedType)
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

    getDefaultMinStock(feedType) {
        const minStocks = {
            'starter': 50,
            'grower': 40,
            'finisher': 30,
            'layer': 20,
            'other': 25
        };
        return minStocks[feedType] || 25;
    },

    generateFeedReport() {
        const totalUsage = this.feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalCost = this.feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const avgCostPerKg = totalUsage > 0 ? totalCost / totalUsage : 0;

        let report = `📊 Feed Consumption Report\n\n`;
        report += `Total Usage: ${totalUsage.toFixed(1)} kg\n`;
        report += `Total Cost: ${this.formatCurrency(totalCost)}\n`;
        report += `Avg Cost/kg: ${this.formatCurrency(avgCostPerKg)}\n`;
        report += `Current Birds: ${this.birdsStock}\n\n`;
        report += `Current Inventory:\n`;

        this.feedInventory.forEach(item => {
            const status = this.getStockStatus(item);
            report += `• ${this.formatFeedType(item.feedType)}: ${item.currentStock} kg (${status})\n`;
        });

        report += `\nWeekly Consumption:\n`;
        const weekUsage = this.getRecentUsage();
        report += `This Week: ${weekUsage.toFixed(1)} kg\n`;
        report += `Avg Daily: ${(weekUsage / 7).toFixed(1)} kg/day\n`;
        
        if (this.birdsStock > 0) {
            const perBird = (weekUsage / this.birdsStock / 7) * 1000;
            report += `Per Bird: ${perBird.toFixed(0)} g/bird/day\n`;
        }

        alert(report);
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
}
