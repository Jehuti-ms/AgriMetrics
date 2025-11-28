// modules/dashboard.js
console.log('Loading dashboard module...');

FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="dashboard-module">
            <div class="module-header-pwa">
                <h1 class="module-title-pwa">Farm Dashboard</h1>
                <p class="module-subtitle-pwa">Overview of your farm operations and performance</p>
            </div>

            <div class="dashboard-content">
                <!-- Stats Overview -->
                <div class="stats-grid-pwa">
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">💰</div>
                        <div class="stat-value-pwa">$0</div>
                        <div class="stat-label-pwa">Today's Revenue</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">📦</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Pending Orders</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🥚</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Eggs Today</div>
                    </div>
                    <div class="stat-card-pwa">
                        <div class="stat-icon-pwa">🐔</div>
                        <div class="stat-value-pwa">0</div>
                        <div class="stat-label-pwa">Total Birds</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-pwa">
                    <h3 class="section-title-pwa">Quick Actions</h3>
                    <div class="quick-grid-pwa">
                        <button class="quick-action-btn-pwa" data-action="add-production">
                            <div class="quick-icon-pwa">📈</div>
                            <div class="quick-title-pwa">Add Production</div>
                            <div class="quick-desc-pwa">Record daily production</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="record-feed">
                            <div class="quick-icon-pwa">🌾</div>
                            <div class="quick-title-pwa">Record Feed</div>
                            <div class="quick-desc-pwa">Log feed consumption</div>
                        </button>
                        <button class="quick-action-btn-pwa" data-action="add-income">
                            <div class="quick-icon-pwa">💵</div>
                            <div class="quick-title-pwa">Add Income</div>
                            <div class="quick-desc-pwa">Record income</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="transactions-section-pwa">
                    <div class="section-header-pwa">
                        <h3 class="section-title-pwa">Recent Activity</h3>
                        <a href="#" class="view-all-link">View All</a>
                    </div>
                    
                    <div class="transactions-list">
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-title">No recent activity</div>
                            <div class="empty-desc">Start using the app to see activity here</div>
                        </div>
                    </div>
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
        console.log('✅ Dashboard content loaded');
    },

    setupEventListeners: function() {
        // Simple click handlers for now
        document.addEventListener('click', (e) => {
            const quickActionBtn = e.target.closest('.quick-action-btn-pwa');
            if (quickActionBtn) {
                e.preventDefault();
                const action = quickActionBtn.getAttribute('data-action');
                alert('Quick action: ' + action);
            }
        });
    }
});

console.log('✅ Dashboard module registered');
