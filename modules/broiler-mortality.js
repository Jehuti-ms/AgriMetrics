// modules/broiler-mortality.js - UPDATED WITH SHARED DATA PATTERN
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    mortalityRecords: [],
    currentStock: 1000, // Starting stock

    initialize() {
        console.log('🐔 Initializing broiler mortality...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
        
        // Sync initial stats with shared data
        this.syncStatsWithSharedData();
        
        return true;
    },

    loadData() {
        const savedRecords = localStorage.getItem('farm-mortality-records');
        const savedStock = localStorage.getItem('farm-current-stock');
        
        this.mortalityRecords = savedRecords ? JSON.parse(savedRecords) : this.getDemoData();
        this.currentStock = savedStock ? parseInt(savedStock) : 1000;
    },

    getDemoData() {
        return [
            { id: 1, date: '2024-03-15', quantity: 2, cause: 'natural', age: 28, notes: 'Found during morning check' },
            { id: 2, date: '2024-03-14', quantity: 1, cause: 'disease', age: 27, notes: 'Respiratory issues' },
            { id: 3, date: '2024-03-13', quantity: 3, cause: 'predator', age: 26, notes: 'Security breach' }
        ];
    },

    // ... (ALL THE RENDER METHODS REMAIN EXACTLY THE SAME - no changes needed)
    // renderModule(), calculateStats(), renderMortalityList(), etc.
    // ALL UI CODE STAYS THE SAME

    // ... (ALL EVENT HANDLER METHODS REMAIN EXACTLY THE SAME)
    // setupEventListeners(), showMortalityForm(), handleMortalitySubmit(), etc.

    // ... (ALL HELPER METHODS REMAIN EXACTLY THE SAME)
    // formatCause(), getAlertColor(), getWeekNumber(), etc.

    // UPDATED METHOD: Sync mortality stats with shared app data
    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        
        // Update shared app data
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            // Update mortality-related stats in shared data
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.currentStock;
            window.FarmModules.appData.profile.dashboardStats.totalMortality = totalLosses;
            window.FarmModules.appData.profile.dashboardStats.mortalityRate = parseFloat(stats.mortalityRate);
            window.FarmModules.appData.profile.dashboardStats.totalMortalityRecords = this.mortalityRecords.length;
            
            // Calculate weekly mortality for trends
            const weeklyMortality = this.getWeeklyMortality();
            window.FarmModules.appData.profile.dashboardStats.weeklyMortality = weeklyMortality;
            
            console.log('📊 Mortality stats synced with shared data:', {
                totalBirds: this.currentStock,
                totalMortality: totalLosses,
                mortalityRate: stats.mortalityRate
            });
            
            // Notify other modules that mortality data has been updated
            this.notifyDataUpdate();
        }
    },

    // NEW METHOD: Calculate weekly mortality
    getWeeklyMortality() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return this.mortalityRecords
            .filter(record => new Date(record.date) >= oneWeekAgo)
            .reduce((sum, record) => sum + record.quantity, 0);
    },

    // NEW METHOD: Notify other modules about data updates
    notifyDataUpdate() {
        // Dispatch a custom event that other modules can listen for
        const event = new CustomEvent('mortalityDataUpdated', {
            detail: {
                currentStock: this.currentStock,
                mortalityRecords: this.mortalityRecords.length,
                totalLosses: this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0)
            }
        });
        document.dispatchEvent(event);
    },

    // UPDATED METHOD: Handle mortality submission
    handleMortalitySubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('mortality-quantity').value);
        
        if (quantity > this.currentStock) {
            alert(`Cannot record ${quantity} losses. Current stock is only ${this.currentStock} birds.`);
            return;
        }

        const formData = {
            id: Date.now(),
            date: document.getElementById('mortality-date').value,
            quantity: quantity,
            cause: document.getElementById('mortality-cause').value,
            age: parseInt(document.getElementById('mortality-age').value),
            notes: document.getElementById('mortality-notes').value
        };

        // Update current stock
        this.currentStock -= quantity;

        this.mortalityRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA - Update mortality stats
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${quantity} bird loss. Stock updated.`, 'success');
        }
    },

    // UPDATED METHOD: Handle stock submission
    handleStockSubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('stock-quantity').value);
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('stock-date').value,
            quantity: quantity,
            source: document.getElementById('stock-source').value,
            notes: document.getElementById('stock-notes').value
        };

        // Update current stock
        this.currentStock += quantity;

        this.saveData();
        this.renderModule();
        
        // SYNC WITH SHARED DATA - Update bird count
        this.syncStatsWithSharedData();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Added ${quantity} birds to stock.`, 'success');
        }
    },

    // UPDATED METHOD: Delete mortality record
    deleteMortalityRecord(id) {
        const record = this.mortalityRecords.find(record => record.id === id);
        if (!record) return;

        if (confirm(`Are you sure you want to delete this mortality record? This will restore ${record.quantity} birds to your stock.`)) {
            // Restore birds to stock
            this.currentStock += record.quantity;
            
            this.mortalityRecords = this.mortalityRecords.filter(record => record.id !== id);
            this.saveData();
            this.renderModule();
            
            // SYNC WITH SHARED DATA - Update stats after deletion
            this.syncStatsWithSharedData();
            
            if (window.coreModule) {
                window.coreModule.showNotification('Mortality record deleted. Stock updated.', 'success');
            }
        }
    },

    // ... (ALL OTHER METHODS REMAIN EXACTLY THE SAME)
    // generateHealthReport(), saveData(), etc.

    saveData() {
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.mortalityRecords));
        localStorage.setItem('farm-current-stock', this.currentStock.toString());
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
}
