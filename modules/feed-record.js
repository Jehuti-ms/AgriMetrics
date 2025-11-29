// modules/feed-record.js - UPDATED WITH SHARED DATA PATTERN
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
        
        // Sync initial stats with shared data
        this.syncStatsWithSharedData();
        
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

    // ... (ALL THE RENDER METHODS REMAIN EXACTLY THE SAME - no changes needed)
    // calculateStats(), renderFeedInventoryList(), renderFeedRecordsList(), etc.
    // ALL UI CODE STAYS THE SAME

    // ... (ALL EVENT HANDLER METHODS REMAIN EXACTLY THE SAME)
    // setupEventListeners(), showFeedForm(), handleFeedRecordSubmit(), etc.

    // ... (ALL HELPER METHODS REMAIN EXACTLY THE SAME)
    // getStockStatus(), getFeedUsage(), formatFeedType(), etc.

    // UPDATED METHOD: Sync feed stats with shared app data
    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        
        // Update shared app data
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            // Update feed-related stats in shared data
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.birdsStock;
            window.FarmModules.appData.profile.dashboardStats.totalFeedStock = stats.totalStock;
            window.FarmModules.appData.profile.dashboardStats.lowFeedStockItems = stats.lowStockItems;
            window.FarmModules.appData.profile.dashboardStats.outOfFeedStockItems = stats.outOfStockItems;
            window.FarmModules.appData.profile.dashboardStats.totalFeedUsed = stats.totalFeedUsed;
            window.FarmModules.appData.profile.dashboardStats.totalFeedCost = stats.totalFeedCost;
            window.FarmModules.appData.profile.dashboardStats.totalFeedRecords = stats.totalFeedRecords;
            window.FarmModules.appData.profile.dashboardStats.weeklyFeedUsage = parseFloat(stats.thisWeekUsage);
            
            console.log('📊 Feed stats synced with shared data:', {
                totalBirds: this.birdsStock,
                totalFeedStock: stats.totalStock,
                weeklyFeedUsage: stats.thisWeekUsage
            });
            
            // Notify other modules that feed data has been updated
            this.notifyDataUpdate();
        }
    },

    // NEW METHOD: Notify other modules about data updates
    notifyDataUpdate() {
        // Dispatch a custom event that other modules can listen for
        const event = new CustomEvent('feedDataUpdated', {
            detail: {
                birdsStock: this.birdsStock,
                feedRecords: this.feedRecords.length,
                feedInventory: this.feedInventory
            }
        });
        document.dispatchEvent(event);
    },

    // UPDATED METHOD: Handle feed record submission
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
        
        // SYNC WITH SHARED DATA - Update feed stats
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${quantity}kg feed usage!`, 'success');
        }
    },

    // UPDATED METHOD: Handle stock submission
    handleStockSubmit(e) {
        e.preventDefault();
        
        const feedType = document.getElementById('stock-feed-type').value;
        const quantity = parseFloat(document.getElementById('add-quantity').value);
        const costPerKg = parseFloat(document.getElementById('cost-per-kg').value);

        // Update inventory
        this.updateInventory(feedType, quantity, costPerKg);

        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA - Update feed stats
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Added ${quantity}kg to ${this.formatFeedType(feedType)} feed stock!`, 'success');
        }
    },

    // UPDATED METHOD: Handle birds submission
    handleBirdsSubmit(e) {
        e.preventDefault();
        
        const newCount = parseInt(document.getElementById('new-birds-count').value);
        const reason = document.getElementById('birds-change-reason').value;
        
        const oldCount = this.birdsStock;
        this.birdsStock = newCount;

        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA - Update bird count
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            const change = newCount - oldCount;
            const changeText = change > 0 ? `+${change}` : change;
            window.coreModule.showNotification(`Bird count updated: ${changeText} birds (${reason})`, 'success');
        }
    },

    // ... (ALL OTHER METHODS REMAIN EXACTLY THE SAME)
    // updateInventory(), getDefaultMinStock(), generateFeedReport(), etc.

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
