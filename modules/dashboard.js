// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="section active">
            <!-- Header Section -->
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h1 id="welcome-message">Welcome Back</h1>
                    <p id="current-date">Loading farm data...</p>
                </div>
                <div class="header-actions">
                    <button class="btn-icon" id="notifications-btn" title="Notifications">
                        <span class="icon">🔔</span>
                        <span class="badge" id="notification-badge">0</span>
                    </button>
                    <button class="btn-icon" id="refresh-dashboard" title="Refresh Data">
                        <span class="icon">🔄</span>
                    </button>
                </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="metrics-grid">
                <div class="metric-card revenue">
                    <div class="metric-header">
                        <div class="metric-icon">💰</div>
                        <div class="metric-trend" id="revenue-trend">
                            <span class="trend-icon">→</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="metric-content">
                        <h3>Total Revenue</h3>
                        <div class="metric-value" id="total-revenue">$0.00</div>
                        <p class="metric-subtitle">All Time Sales</p>
                    </div>
                </div>

                <div class="metric-card sales">
                    <div class="metric-header">
                        <div class="metric-icon">📈</div>
                        <div class="metric-trend" id="sales-trend">
                            <span class="trend-icon">→</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="metric-content">
                        <h3>Monthly Sales</h3>
                        <div class="metric-value" id="monthly-sales">$0.00</div>
                        <p class="metric-subtitle" id="sales-period">This Month</p>
                    </div>
                </div>

                <div class="metric-card inventory">
                    <div class="metric-header">
                        <div class="metric-icon">📦</div>
                        <div class="metric-count">
                            <span id="inventory-count">0</span>
                            <span>items</span>
                        </div>
                    </div>
                    <div class="metric-content">
                        <h3>Inventory Value</h3>
                        <div class="metric-value" id="inventory-value">$0.00</div>
                        <p class="metric-subtitle">Current Stock</p>
                    </div>
                </div>

                <div class="metric-card profit">
                    <div class="metric-header">
                        <div class="metric-icon">💹</div>
                        <div class="metric-trend" id="profit-trend">
                            <span class="trend-icon">→</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="metric-content">
                        <h3>Net Profit</h3>
                        <div class="metric-value" id="net-profit">$0.00</div>
                        <p class="metric-subtitle" id="profit-period">This Month</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-section">
                <h2 class="section-title">Quick Actions</h2>
                <div class="actions-grid">
                    <button class="action-btn" data-action="sales-record">
                        <div class="action-icon">💰</div>
                        <div class="action-text">
                            <h4>Record Sale</h4>
                            <p>Add sales transaction</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-btn" data-action="inventory-check">
                        <div class="action-icon">📦</div>
                        <div class="action-text">
                            <h4>Manage Inventory</h4>
                            <p>Update stock levels</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-btn" data-action="feed-record">
                        <div class="action-icon">🌾</div>
                        <div class="action-text">
                            <h4>Feed Records</h4>
                            <p>Track animal feeding</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-btn" data-action="reports">
                        <div class="action-icon">📊</div>
                        <div class="action-text">
                            <h4>View Reports</h4>
                            <p>Analytics & insights</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity-section">
                <div class="section-header">
                    <h2 class="section-title">Recent Activity</h2>
                    <button class="btn-text" id="view-all-activity">View All</button>
                </div>
                <div class="activity-list" id="activity-list">
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>No Recent Activity</h3>
                        <p>Start recording transactions to see activity here</p>
                    </div>
                </div>
            </div>

            <!-- Performance Summary -->
            <div class="performance-section">
                <h2 class="section-title">Performance Summary</h2>
                <div class="performance-grid">
                    <div class="performance-card">
                        <div class="performance-icon">🛒</div>
                        <div class="performance-content">
                            <div class="performance-value" id="total-sales-count">0</div>
                            <div class="performance-label">Total Sales</div>
                        </div>
                    </div>
                    <div class="performance-card">
                        <div class="performance-icon">📋</div>
                        <div class="performance-content">
                            <div class="performance-value" id="total-products">0</div>
                            <div class="performance-label">Products</div>
                        </div>
                    </div>
                    <div class="performance-card">
                        <div class="performance-icon">🌾</div>
                        <div class="performance-content">
                            <div class="performance-value" id="monthly-feed">0</div>
                            <div class="performance-label">Feed Records</div>
                        </div>
                    </div>
                    <div class="performance-card">
                        <div class="performance-icon">⭐</div>
                        <div class="performance-content">
                            <div class="performance-value" id="avg-sale">$0.00</div>
                            <div class="performance-label">Avg. Sale</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    styles: `
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
        }

        .welcome-section h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .welcome-section p {
            margin: 0;
            color: var(--text-muted);
            font-size: 1rem;
        }

        .header-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .btn-icon:hover {
            background: var(--primary-light);
            border-color: var(--primary-color);
            transform: translateY(-1px);
        }

        .badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: var(--error-color);
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 0.7rem;
            font-weight: 600;
            min-width: 18px;
            text-align: center;
            display: none;
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .metric-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .metric-card.revenue::before { background: linear-gradient(90deg, #10b981, #059669); }
        .metric-card.sales::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
        .metric-card.inventory::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .metric-card.profit::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

        .metric-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .metric-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .metric-card.revenue .metric-icon { background: rgba(16, 185, 129, 0.1); }
        .metric-card.sales .metric-icon { background: rgba(59, 130, 246, 0.1); }
        .metric-card.inventory .metric-icon { background: rgba(245, 158, 11, 0.1); }
        .metric-card.profit .metric-icon { background: rgba(139, 92, 246, 0.1); }

        .metric-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(16, 185, 129, 0.1);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #059669;
        }

        .metric-count {
            text-align: right;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .metric-count span:first-child {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-color);
            display: block;
        }

        .metric-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .metric-subtitle {
            margin: 0;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        /* Quick Actions */
        .quick-actions-section {
            margin-bottom: 2.5rem;
        }

        .section-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 1.5rem;
        }

        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1rem;
        }

        .action-btn {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            width: 100%;
            border: none;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            border-color: var(--primary-color);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .action-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .action-text {
            flex: 1;
        }

        .action-text h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .action-text p {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .action-arrow {
            color: var(--text-muted);
            font-size: 1.2rem;
            transition: transform 0.2s ease;
        }

        .action-btn:hover .action-arrow {
            transform: translateX(4px);
            color: var(--primary-color);
        }

        /* Recent Activity */
        .recent-activity-section {
            margin-bottom: 2.5rem;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .btn-text {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            font-weight: 500;
            padding: 0.5rem;
            border-radius: 6px;
            transition: background 0.2s ease;
        }

        .btn-text:hover {
            background: var(--primary-light);
        }

        .activity-list {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            border-bottom: 1px solid var(--border-color);
            transition: background 0.2s ease;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-item:hover {
            background: var(--bg-color);
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: rgba(16, 185, 129, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
            color: var(--text-color);
        }

        .activity-details {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .activity-amount {
            font-weight: 700;
            color: var(--text-color);
            font-size: 1rem;
        }

        .activity-time {
            font-size: 0.8rem;
            color: var(--text-muted);
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
        }

        .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
        }

        .empty-state p {
            margin: 0;
            opacity: 0.8;
        }

        /* Performance Section */
        .performance-section {
            margin-bottom: 2rem;
        }

        .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .performance-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: transform 0.2s ease;
        }

        .performance-card:hover {
            transform: translateY(-2px);
        }

        .performance-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            margin: 0 auto 1rem;
        }

        .performance-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .performance-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-header {
                flex-direction: column;
                gap: 1rem;
            }

            .header-actions {
                align-self: flex-end;
            }

            .metrics-grid {
                grid-template-columns: 1fr;
            }

            .actions-grid {
                grid-template-columns: 1fr;
            }

            .performance-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .performance-grid {
                grid-template-columns: 1fr;
            }
        }
    `,

    initialize: function() {
        console.log('📊 Dashboard initializing...');
        this.updateWelcome();
        this.updateMetrics();
        this.updateActivity();
        this.updatePerformance();
        this.attachEvents();
        
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updateMetrics();
            this.updateActivity();
            this.updatePerformance();
        }, 30000);
    },

    updateWelcome: function() {
        const hour = new Date().getHours();
        let greeting = 'Good Morning';
        if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
        else if (hour >= 17) greeting = 'Good Evening';

        this.setText('welcome-message', greeting);
        this.setText('current-date', new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }));
    },

    updateMetrics: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        
        // Total Revenue
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        this.setText('total-revenue', this.formatCurrency(totalRevenue));
        
        // Monthly Sales
        const now = new Date();
        const monthlySales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        this.setText('monthly-sales', this.formatCurrency(monthlySales));
        
        // Inventory
        const inventoryValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
        this.setText('inventory-value', this.formatCurrency(inventoryValue));
        this.setText('inventory-count', inventory.length);
        
        // Net Profit (simplified)
        this.setText('net-profit', this.formatCurrency(monthlySales));
        
        // Update periods
        const monthName = now.toLocaleDateString('en-US', { month: 'long' });
        this.setText('sales-period', monthName);
        this.setText('profit-period', monthName);
        
        // Update trends
        this.updateTrends(sales);
    },

    updateTrends: function(sales) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentSales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const prevSales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
            })
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            
        const trend = prevSales > 0 ? ((currentSales - prevSales) / prevSales * 100) : 0;
        
        this.updateTrendElement('sales-trend', trend);
        this.updateTrendElement('profit-trend', trend);
        this.updateTrendElement('revenue-trend', trend);
    },

    updateTrendElement: function(elementId, trend) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const icon = element.querySelector('.trend-icon');
        const value = element.querySelector('.trend-value');
        
        if (trend > 0) {
            icon.textContent = '↗️';
            value.textContent = `${Math.abs(trend).toFixed(1)}%`;
            element.style.background = 'rgba(16, 185, 129, 0.1)';
            element.style.color = '#059669';
        } else if (trend < 0) {
            icon.textContent = '↘️';
            value.textContent = `${Math.abs(trend).toFixed(1)}%`;
            element.style.background = 'rgba(239, 68, 68, 0.1)';
            element.style.color = '#dc2626';
        } else {
            icon.textContent = '→';
            value.textContent = '0%';
            element.style.background = 'rgba(107, 114, 128, 0.1)';
            element.style.color = '#6b7280';
        }
    },

    updateActivity: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        const activities = [];
        
        // Sales activities
        sales.slice(-5).forEach(sale => {
            activities.push({
                type: 'sale',
                icon: '💰',
                title: `Sale: ${this.getProductName(sale.product)}`,
                details: `${sale.quantity} ${sale.unit} • ${sale.customer || 'Walk-in'}`,
                amount: sale.totalAmount,
                time: this.getTimeAgo(sale.date)
            });
        });
        
        // Inventory activities
        inventory.slice(-3).forEach(item => {
            activities.push({
                type: 'inventory',
                icon: '📦',
                title: `Stock: ${item.name}`,
                details: `${item.quantity} ${item.unit} available`,
                amount: null,
                time: this.getTimeAgo(item.lastUpdated)
            });
        });
        
        // Feed activities
        feedRecords.slice(-2).forEach(record => {
            activities.push({
                type: 'feed',
                icon: '🌾',
                title: 'Feed Distributed',
                details: `${record.quantity} ${record.unit}`,
                amount: null,
                time: this.getTimeAgo(record.date)
            });
        });
        
        this.renderActivity(activities.slice(0, 6));
    },

    renderActivity: function(activities) {
        const container = document.getElementById('activity-list');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No Recent Activity</h3>
                    <p>Start recording transactions to see activity here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
                ${activity.amount ? `<div class="activity-amount">${this.formatCurrency(activity.amount)}</div>` : ''}
            </div>
        `).join('');
    },

    updatePerformance: function() {
        const sales = FarmModules.appData.sales || [];
        const inventory = FarmModules.appData.inventory || [];
        const feedRecords = FarmModules.appData.feedRecords || [];
        
        const now = new Date();
        const monthlyFeed = feedRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        }).length;
        
        const avgSale = sales.length > 0 ? 
            sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / sales.length : 0;
        
        this.setText('total-sales-count', sales.length);
        this.setText('total-products', inventory.length);
        this.setText('monthly-feed', monthlyFeed);
        this.setText('avg-sale', this.formatCurrency(avgSale));
        
        // Update notifications
        const lowStock = inventory.filter(item => (item.quantity || 0) <= (item.lowStockThreshold || 10)).length;
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = lowStock;
            badge.style.display = lowStock > 0 ? 'block' : 'none';
        }
    },

    attachEvents: function() {
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.navigateTo(action);
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Notifications button
        const notifyBtn = document.getElementById('notifications-btn');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
        
        // View all activity
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.navigateTo('reports');
            });
        }
    },

    navigateTo: function(section) {
        // Find and click the corresponding nav link
        const navLink = document.querySelector(`a[href="#${section}"], [data-section="${section}"]`);
        if (navLink) {
            navLink.click();
        } else {
            // Fallback to hash change
            window.location.hash = section;
        }
        this.showNotification(`Opening ${this.getSectionName(section)}...`);
    },

    refreshData: function() {
        this.showNotification('Refreshing data...');
        this.updateMetrics();
        this.updateActivity();
        this.updatePerformance();
        setTimeout(() => this.showNotification('Data updated!'), 500);
    },

    showNotifications: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStock = inventory.filter(item => (item.quantity || 0) <= (item.lowStockThreshold || 10)).length;
        
        if (lowStock > 0) {
            this.showNotification(`${lowStock} items have low stock`, 'warning');
        } else {
            this.showNotification('No notifications', 'info');
        }
    },

    // Utility methods
    setText: function(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    getTimeAgo: function(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    },

    getProductName: function(productKey) {
        const products = {
            'broilers-live': 'Broilers (Live)',
            'broilers-dressed': 'Broilers (Dressed)',
            'eggs': 'Eggs',
            'pork': 'Pork',
            'beef': 'Beef',
            'tomatoes': 'Tomatoes',
            'peppers': 'Peppers',
            'cucumbers': 'Cucumbers',
            'milk': 'Milk',
            'cheese': 'Cheese',
            'other': 'Other'
        };
        return products[productKey] || productKey;
    },

    getSectionName: function(section) {
        const names = {
            'sales-record': 'Sales Records',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed Records',
            'reports': 'Reports'
        };
        return names[section] || section;
    },

    showNotification: function(message, type = 'info') {
        if (window.coreModule?.showNotification) {
            window.coreModule.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    destroy: function() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
});
