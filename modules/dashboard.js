// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="section active">
            <div class="module-header">
                <h1>Farm Dashboard</h1>
                <p>Overview of your farm operations and performance</p>
            </div>

            <!-- Financial Overview -->
            <div class="financial-overview">
                <div class="overview-card income">
                    <div class="overview-icon">💰</div>
                    <div class="overview-content">
                        <h3>Total Revenue</h3>
                        <div class="overview-amount" id="total-revenue">$0</div>
                        <div class="overview-period" id="revenue-period">All Time</div>
                    </div>
                </div>
                <div class="overview-card sales">
                    <div class="overview-icon">📈</div>
                    <div class="overview-content">
                        <h3>Monthly Sales</h3>
                        <div class="overview-amount" id="monthly-sales">$0</div>
                        <div class="overview-period" id="sales-period">This Month</div>
                    </div>
                </div>
                <div class="overview-card inventory">
                    <div class="overview-icon">📦</div>
                    <div class="overview-content">
                        <h3>Inventory Value</h3>
                        <div class="overview-amount" id="inventory-value">$0</div>
                        <div class="overview-period">Current Stock</div>
                    </div>
                </div>
                <div class="overview-card profit">
                    <div class="overview-icon">💹</div>
                    <div class="overview-content">
                        <h3>Net Profit</h3>
                        <div class="overview-amount" id="net-profit">$0</div>
                        <div class="overview-period" id="profit-period">This Month</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-grid">
                    <button class="action-btn" data-action="record-sale">
                        <span class="action-icon">💰</span>
                        <span class="action-text">Record Sale</span>
                    </button>
                    <button class="action-btn" data-action="add-inventory">
                        <span class="action-icon">📦</span>
                        <span class="action-text">Add Inventory</span>
                    </button>
                    <button class="action-btn" data-action="record-feed">
                        <span class="action-icon">🌾</span>
                        <span class="action-text">Record Feed</span>
                    </button>
                    <button class="action-btn" data-action="view-reports">
                        <span class="action-icon">📊</span>
                        <span class="action-text">View Reports</span>
                    </button>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity card">
                <div class="card-header">
                    <h3>Recent Activity</h3>
                    <button class="btn btn-text" id="refresh-activity">Refresh</button>
                </div>
                <div class="activity-list" id="activity-list">
                    <div class="empty-state">
                        <span class="empty-icon">📊</span>
                        <h4>No recent activity</h4>
                        <p>Start recording sales and inventory to see activity here</p>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-metrics">
                <div class="metric-card">
                    <h4>Sales Performance</h4>
                    <div class="metric-value" id="sales-count">0</div>
                    <div class="metric-label">Total Sales</div>
                </div>
                <div class="metric-card">
                    <h4>Inventory Items</h4>
                    <div class="metric-value" id="inventory-count">0</div>
                    <div class="metric-label">Active Products</div>
                </div>
                <div class="metric-card">
                    <h4>Feed Records</h4>
                    <div class="metric-value" id="feed-records-count">0</div>
                    <div class="metric-label">This Month</div>
                </div>
                <div class="metric-card">
                    <h4>Avg. Sale Value</h4>
                    <div class="metric-value" id="avg-sale-value">$0</div>
                    <div class="metric-label">Per Transaction</div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .financial-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .overview-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s ease;
        }

        .overview-card:hover {
            transform: translateY(-2px);
        }

        .overview-card.income {
            border-left: 4px solid var(--success-color);
        }

        .overview-card.sales {
            border-left: 4px solid var(--primary-color);
        }

        .overview-card.inventory {
            border-left: 4px solid var(--warning-color);
        }

        .overview-card.profit {
            border-left: 4px solid var(--info-color);
        }

        .overview-icon {
            font-size: 2.5rem;
            opacity: 0.8;
        }

        .overview-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .overview-amount {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .overview-period {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .quick-actions {
            margin-bottom: 2rem;
        }

        .quick-actions h3 {
            margin-bottom: 1rem;
            color: var(--text-color);
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .action-btn {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .action-btn:hover {
            background: var(--primary-light);
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }

        .action-icon {
            font-size: 2rem;
        }

        .action-text {
            font-weight: 500;
            color: var(--text-color);
        }

        .recent-activity {
            margin-bottom: 2rem;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .activity-list {
            min-height: 200px;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .activity-icon.sale {
            background: var(--success-light);
            color: var(--success-color);
        }

        .activity-icon.inventory {
            background: var(--warning-light);
            color: var(--warning-dark);
        }

        .activity-icon.feed {
            background: var(--info-light);
            color: var(--info-dark);
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .activity-details {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .activity-amount {
            font-weight: 600;
            color: var(--text-color);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 3rem;
            opacity: 0.5;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-state h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .empty-state p {
            margin: 0;
            opacity: 0.8;
        }

        .performance-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .metric-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }

        .metric-card h4 {
            margin: 0 0 1rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.5rem;
        }

        .metric-label {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
    `,

    initialize: function() {
        console.log('📊 Dashboard module initializing...');
        this.updateFinancialData();
        this.updateRecentActivity();
        this.updatePerformanceMetrics();
        this.attachEventListeners();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateFinancialData();
            this.updateRecentActivity();
            this.updatePerformanceMetrics();
        }, 30000); // Update every 30 seconds
    },

    updateFinancialData: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        
        // Calculate total revenue (all time)
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        this.updateElement('total-revenue', this.formatCurrency(totalRevenue));
        
        // Calculate monthly sales
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        this.updateElement('monthly-sales', this.formatCurrency(monthlySales));
        
        // Calculate inventory value
        const inventoryValue = inventory.reduce((sum, item) => {
            const quantity = item.quantity || 0;
            const price = item.price || item.unitPrice || 0;
            return sum + (quantity * price);
        }, 0);
        this.updateElement('inventory-value', this.formatCurrency(inventoryValue));
        
        // Calculate net profit (simplified: revenue - cost of goods sold)
        // For now, using monthly sales as profit (simplified calculation)
        const netProfit = monthlySales; // In a real app, you'd subtract costs
        this.updateElement('net-profit', this.formatCurrency(netProfit));
        
        // Update periods
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[currentMonth];
        this.updateElement('sales-period', currentMonthName);
        this.updateElement('profit-period', currentMonthName);
    },

    updateRecentActivity: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        // Combine and sort all activities by date (most recent first)
        const allActivities = [];
        
        // Add sales activities
        sales.slice(-10).forEach(sale => {
            allActivities.push({
                type: 'sale',
                title: `Sale: ${this.formatProductName(sale.product)}`,
                details: `${sale.quantity} ${sale.unit} sold`,
                amount: sale.totalAmount,
                date: sale.date,
                icon: '💰'
            });
        });
        
        // Add inventory activities
        inventory.slice(-5).forEach(item => {
            allActivities.push({
                type: 'inventory',
                title: `Inventory: ${item.name}`,
                details: `${item.quantity} ${item.unit} in stock`,
                amount: item.quantity * (item.price || 0),
                date: item.lastUpdated || new Date().toISOString(),
                icon: '📦'
            });
        });
        
        // Add feed record activities
        feedRecords.slice(-5).forEach(record => {
            allActivities.push({
                type: 'feed',
                title: 'Feed Distribution',
                details: `${record.quantity} ${record.unit} distributed`,
                amount: null,
                date: record.date,
                icon: '🌾'
            });
        });
        
        // Sort by date (most recent first) and take top 8
        const recentActivities = allActivities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);
        
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📊</span>
                    <h4>No recent activity</h4>
                    <p>Start recording sales and inventory to see activity here</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                ${activity.amount ? `<div class="activity-amount">${this.formatCurrency(activity.amount)}</div>` : ''}
            </div>
        `).join('');
    },

    updatePerformanceMetrics: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        // Sales count
        this.updateElement('sales-count', sales.length);
        
        // Inventory count
        this.updateElement('inventory-count', inventory.length);
        
        // Feed records count (this month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyFeedRecords = feedRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        }).length;
        this.updateElement('feed-records-count', monthlyFeedRecords);
        
        // Average sale value
        const avgSaleValue = sales.length > 0 ? 
            sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / sales.length : 0;
        this.updateElement('avg-sale-value', this.formatCurrency(avgSaleValue));
    },

   // Updated attachEventListeners method
attachEventListeners: function() {
    console.log('🔗 Attaching dashboard event listeners...');
    
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    console.log('🔧 Found action buttons:', actionButtons.length);
    
    actionButtons.forEach(btn => {
        const action = btn.dataset.action;
        console.log('🔧 Setting up button for action:', action);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎯 Action button clicked:', action);
            this.handleQuickAction(action);
        });
    });
    
    // Refresh activity button
    const refreshBtn = document.getElementById('refresh-activity');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Refresh button clicked');
            this.updateFinancialData();
            this.updateRecentActivity();
            this.updatePerformanceMetrics();
            this.showNotification('Dashboard updated', 'success');
        });
        console.log('✅ Refresh button listener attached');
    } else {
        console.warn('❌ Refresh button not found');
    }
    
    console.log('✅ All dashboard event listeners attached');
},

    // modules/dashboard.js - Updated handleQuickAction method
handleQuickAction: function(action) {
    console.log('🔧 Quick action clicked:', action);
    
    switch(action) {
        case 'record-sale':
            // Navigate to sales module
            if (typeof FarmModules !== 'undefined' && FarmModules.showSection) {
                FarmModules.showSection('sales-record');
            } else if (window.farmModules && window.farmModules.showSection) {
                window.farmModules.showSection('sales-record');
            } else {
                // Fallback: change URL hash
                window.location.hash = 'sales-record';
                this.showNotification('Opening Sales Records...', 'info');
            }
            break;
            
        case 'add-inventory':
            // Navigate to inventory module
            if (typeof FarmModules !== 'undefined' && FarmModules.showSection) {
                FarmModules.showSection('inventory-check');
            } else if (window.farmModules && window.farmModules.showSection) {
                window.farmModules.showSection('inventory-check');
            } else {
                window.location.hash = 'inventory-check';
                this.showNotification('Opening Inventory...', 'info');
            }
            break;
            
        case 'record-feed':
            // Navigate to feed module
            if (typeof FarmModules !== 'undefined' && FarmModules.showSection) {
                FarmModules.showSection('feed-record');
            } else if (window.farmModules && window.farmModules.showSection) {
                window.farmModules.showSection('feed-record');
            } else {
                window.location.hash = 'feed-record';
                this.showNotification('Opening Feed Records...', 'info');
            }
            break;
            
        case 'view-reports':
            // Navigate to reports module
            if (typeof FarmModules !== 'undefined' && FarmModules.showSection) {
                FarmModules.showSection('reports');
            } else if (window.farmModules && window.farmModules.showSection) {
                window.farmModules.showSection('reports');
            } else {
                window.location.hash = 'reports';
                this.showNotification('Opening Reports...', 'info');
            }
            break;
            
        default:
            console.warn('Unknown action:', action);
            this.showNotification('Action not available', 'warning');
    }
},

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatProductName: function(product) {
        const productNames = {
            'broilers-live': 'Broilers (Live)',
            'broilers-dressed': 'Broilers (Dressed)',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'chicken-parts': 'Chicken Parts',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'lettuce': 'Lettuce',
            'carrots': 'Carrots',
            'potatoes': 'Potatoes',
            'onions': 'Onions',
            'cabbage': 'Cabbage',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'yogurt': 'Yogurt',
            'butter': 'Butter',
            'honey': 'Honey',
            'jam': 'Jam/Preserves',
            'bread': 'Bread',
            'other': 'Other'
        };
        return productNames[product] || product;
    },

    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    showNotification: function(message, type) {
        if (window.coreModule && window.coreModule.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Add this test method to debug navigation
testNavigation: function() {
    console.log('🧪 Testing navigation methods...');
    console.log('FarmModules:', typeof FarmModules);
    console.log('FarmModules.showSection:', FarmModules?.showSection);
    console.log('window.farmModules:', window.farmModules);
    console.log('window.farmModules.showSection:', window.farmModules?.showSection);
    console.log('Current hash:', window.location.hash);
    
    // Test if modules are registered
    if (window.farmModules) {
        console.log('Registered modules:', Object.keys(window.farmModules.modules || {}));
    }
},
});
