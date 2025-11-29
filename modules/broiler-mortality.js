// modules/broiler-mortality.js - CORRECTED VERSION
console.log('Loading broiler-mortality module...');

const BroilerMortalityModule = {
    name: 'broiler-mortality',
    initialized: false,
    mortalityRecords: [],
    currentStock: 1000,

    initialize() {
        console.log('🐔 Initializing broiler mortality...');
        this.loadData();
        this.renderModule();
        this.initialized = true;
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
            { id: 1, date: '2024-03-15', quantity: 2, cause: 'natural', age: 28, notes: 'Found during morning check' }
        ];
    },

// In your existing broiler-mortality.js, make sure this method exists:
renderModule() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const stats = this.calculateStats();

    contentArea.innerHTML = `
        <div class="module-container">
            <div class="module-header">
                <h1 class="module-title">Broiler Health & Mortality</h1>
                <p class="module-subtitle">Track bird health and losses</p>
            </div>

            <!-- Health Overview -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">🐔</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${this.currentStock.toLocaleString()}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Current Stock</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">😔</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${stats.totalLosses}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Total Losses</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                    <div style="font-size: 24px; font-weight: bold; color: ${stats.mortalityRate < 2 ? '#22c55e' : stats.mortalityRate < 5 ? '#f59e0b' : '#ef4444'}; margin-bottom: 4px;">${stats.mortalityRate}%</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Mortality Rate</div>
                </div>
            </div>

            <!-- Rest of your existing HTML content here -->
            ${/* KEEP ALL YOUR EXISTING HTML CONTENT EXACTLY AS IS */''}
        </div>
    `;

    this.setupEventListeners();
},
    calculateStats() {
        const totalLosses = this.mortalityRecords.reduce((sum, record) => sum + record.quantity, 0);
        return { totalLosses };
    },

    renderMortalityList() {
        if (this.mortalityRecords.length === 0) {
            return `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No mortality records yet</div>`;
        }

        return this.mortalityRecords.slice(0, 5).map(record => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; margin-bottom: 8px;">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">
                        ${record.quantity} bird${record.quantity > 1 ? 's' : ''} • ${this.formatCause(record.cause)}
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary);">
                        ${record.date}
                    </div>
                </div>
            </div>
        `).join('');
    },

    setupEventListeners() {
        document.getElementById('mortality-form')?.addEventListener('submit', (e) => this.handleMortalitySubmit(e));
    },

    handleMortalitySubmit(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('mortality-quantity').value);
        
        if (quantity > this.currentStock) {
            alert(`Cannot record ${quantity} losses. Current stock is only ${this.currentStock} birds.`);
            return;
        }

        const formData = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            quantity: quantity,
            cause: document.getElementById('mortality-cause').value,
            age: 30, // Default age
            notes: document.getElementById('mortality-notes').value
        };

        this.currentStock -= quantity;
        this.mortalityRecords.unshift(formData);
        this.saveData();
        this.renderModule();
        
        if (window.coreModule) {
            window.coreModule.showNotification(`Recorded ${quantity} bird loss.`, 'success');
        }
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator'
        };
        return causes[cause] || cause;
    },

    syncStatsWithSharedData() {
        const stats = this.calculateStats();
        
        if (window.FarmModules && window.FarmModules.appData) {
            window.FarmModules.appData.profile = window.FarmModules.appData.profile || {};
            window.FarmModules.appData.profile.dashboardStats = window.FarmModules.appData.profile.dashboardStats || {};
            
            window.FarmModules.appData.profile.dashboardStats.totalBirds = this.currentStock;
            window.FarmModules.appData.profile.dashboardStats.totalMortality = stats.totalLosses;
        }
    },

    saveData() {
        localStorage.setItem('farm-mortality-records', JSON.stringify(this.mortalityRecords));
        localStorage.setItem('farm-current-stock', this.currentStock.toString());
    }
};

if (window.FarmModules) {
    window.FarmModules.registerModule('broiler-mortality', BroilerMortalityModule);
}
