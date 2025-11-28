// modules/dashboard.js
console.log('Loading dashboard module...');

FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="dashboard-module">
            <div class="module-header">
                <h1>Farm Dashboard</h1>
                <p>Overview of your farm operations</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$0</div>
                    <div class="stat-label">Today's Revenue</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-value">0</div>
                    <div class="stat-label">Pending Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🥚</div>
                    <div class="stat-value">0</div>
                    <div class="stat-label">Eggs Today</div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-grid">
                    <button class="action-btn" data-action="add-production">
                        <span class="action-icon">📈</span>
                        <span class="action-text">Add Production</span>
                    </button>
                    <button class="action-btn" data-action="record-feed">
                        <span class="action-icon">🌾</span>
                        <span class="action-text">Record Feed</span>
                    </button>
                    <button class="action-btn" data-action="add-income">
                        <span class="action-icon">💵</span>
                        <span class="action-text">Add Income</span>
                    </button>
                </div>
            </div>
        </div>
    `,

    initialize: function() {
        console.log('📊 Initializing dashboard...');
        this.showContent();
        this.setupEventListeners();
        return true;
    },

    showContent: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }
        contentArea.innerHTML = this.template;
    },

    setupEventListeners: function() {
        // Simple event listeners without complex navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const action = e.target.closest('.action-btn').dataset.action;
                alert(`Action: ${action} - This would open the ${action} module`);
            }
        });
    }
});

console.log('✅ Dashboard module registered');
