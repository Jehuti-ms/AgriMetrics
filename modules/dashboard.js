// modules/dashboard.js
FarmModules.registerModule('dashboard', {
    name: 'Dashboard',
    icon: '📊',
    
    template: `
        <div class="section active">
            <!-- Header with Welcome -->
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h1 id="welcome-message">Good Morning</h1>
                    <p id="current-date">Loading...</p>
                </div>
                <div class="header-actions">
                    <button class="btn-icon" id="notifications-btn">
                        <span class="icon">🔔</span>
                        <span class="badge" id="notification-badge">0</span>
                    </button>
                    <button class="btn-icon" id="refresh-dashboard">
                        <span class="icon">🔄</span>
                    </button>
                </div>
            </div>

            <!-- Financial Overview Cards -->
            <div class="financial-grid">
                <div class="finance-card revenue">
                    <div class="card-header">
                        <div class="card-icon">
                            <div class="icon-wrapper">
                                💰
                            </div>
                        </div>
                        <div class="card-trend" id="revenue-trend">
                            <span class="trend-icon">↗️</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-label">Total Revenue</h3>
                        <div class="card-amount" id="total-revenue">$0</div>
                        <div class="card-subtitle" id="revenue-subtitle">All Time</div>
                    </div>
                </div>

                <div class="finance-card sales">
                    <div class="card-header">
                        <div class="card-icon">
                            <div class="icon-wrapper">
                                📈
                            </div>
                        </div>
                        <div class="card-trend" id="sales-trend">
                            <span class="trend-icon">↗️</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-label">Monthly Sales</h3>
                        <div class="card-amount" id="monthly-sales">$0</div>
                        <div class="card-subtitle" id="sales-subtitle">This Month</div>
                    </div>
                </div>

                <div class="finance-card inventory">
                    <div class="card-header">
                        <div class="card-icon">
                            <div class="icon-wrapper">
                                📦
                            </div>
                        </div>
                        <div class="card-stock">
                            <span class="stock-value" id="inventory-items">0</span>
                            <span class="stock-label">items</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-label">Inventory Value</h3>
                        <div class="card-amount" id="inventory-value">$0</div>
                        <div class="card-subtitle">Current Stock</div>
                    </div>
                </div>

                <div class="finance-card profit">
                    <div class="card-header">
                        <div class="card-icon">
                            <div class="icon-wrapper">
                                💹
                            </div>
                        </div>
                        <div class="card-trend" id="profit-trend">
                            <span class="trend-icon">↗️</span>
                            <span class="trend-value">0%</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-label">Net Profit</h3>
                        <div class="card-amount" id="net-profit">$0</div>
                        <div class="card-subtitle" id="profit-subtitle">This Month</div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Grid -->
            <div class="quick-actions-section">
                <h2 class="section-title">Quick Actions</h2>
                <div class="actions-grid">
                    <button class="action-card" data-action="record-sale">
                        <div class="action-icon sale">
                            💰
                        </div>
                        <div class="action-content">
                            <h3>Record Sale</h3>
                            <p>Add new sales transaction</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-card" data-action="add-inventory">
                        <div class="action-icon inventory">
                            📦
                        </div>
                        <div class="action-content">
                            <h3>Manage Inventory</h3>
                            <p>Update stock levels</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-card" data-action="record-feed">
                        <div class="action-icon feed">
                            🌾
                        </div>
                        <div class="action-content">
                            <h3>Feed Records</h3>
                            <p>Track animal feeding</p>
                        </div>
                        <div class="action-arrow">→</div>
                    </button>

                    <button class="action-card" data-action="view-reports">
                        <div class="action-icon reports">
                            📊
                        </div>
                        <div class="action-content">
                            <h3>View Reports</h3>
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
                    <button class="btn-text" id="view-all-activity">
                        View All
                    </button>
                </div>
                <div class="activity-feed" id="activity-feed">
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>No Recent Activity</h3>
                        <p>Start recording transactions to see activity here</p>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="metrics-section">
                <h2 class="section-title">Performance Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-icon">🛒</div>
                        <div class="metric-content">
                            <div class="metric-value" id="sales-count">0</div>
                            <div class="metric-label">Total Sales</div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">📋</div>
                        <div class="metric-content">
                            <div class="metric-value" id="inventory-count">0</div>
                            <div class="metric-label">Products</div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">🌾</div>
                        <div class="metric-content">
                            <div class="metric-value" id="feed-records-count">0</div>
                            <div class="metric-label">Feed Records</div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-icon">⭐</div>
                        <div class="metric-content">
                            <div class="metric-value" id="avg-sale-value">$0</div>
                            <div class="metric-label">Avg. Sale</div>
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
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
            position: relative;
            transition: all 0.2s ease;
            cursor: pointer;
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
        }

        /* Financial Grid */
        .financial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .finance-card {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .finance-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .finance-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .finance-card.revenue::before { background: linear-gradient(90deg, #10b981, #059669); }
        .finance-card.sales::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
        .finance-card.inventory::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .finance-card.profit::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .icon-wrapper {
            width: 50px;
            height: 50px;
            border-radius: 14px;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .finance-card.revenue .icon-wrapper { background: rgba(16, 185, 129, 0.1); }
        .finance-card.sales .icon-wrapper { background: rgba(59, 130, 246, 0.1); }
        .finance-card.inventory .icon-wrapper { background: rgba(245, 158, 11, 0.1); }
        .finance-card.profit .icon-wrapper { background: rgba(139, 92, 246, 0.1); }

        .card-trend {
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

        .card-stock {
            text-align: right;
        }

        .stock-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .stock-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: block;
        }

        .card-label {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .card-amount {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .card-subtitle {
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

        .action-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
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

        .action-card:hover {
            transform: translateY(-2px);
            border-color: var(--primary-color);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .action-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .action-icon.sale { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .action-icon.inventory { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .action-icon.feed { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; }
        .action-icon.reports { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }

        .action-content {
            flex: 1;
        }

        .action-content h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .action-content p {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .action-arrow {
            color: var(--text-muted);
            font-size: 1.2rem;
            transition: transform 0.2s ease;
        }

        .action-card:hover .action-arrow {
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

        .activity-feed {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
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
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .activity-icon.sale { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .activity-icon.inventory { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .activity-icon.feed { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; }

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
            text-align: right;
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

        /* Metrics Section */
        .metrics-section {
            margin-bottom: 2rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .metric-item {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s ease;
        }

        .metric-item:hover {
            transform: translateY(-2px);
        }

        .metric-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .metric-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .dashboard-header {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }

            .header-actions {
                align-self: flex-end;
            }

            .financial-grid {
                grid-template-columns: 1fr;
            }

            .actions-grid {
                grid-template-columns: 1fr;
            }

            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    `,

    initialize: function() {
        console.log('📊 Dashboard module initializing...');
        this.updateWelcomeMessage();
        this.updateFinancialData();
        this.updateRecentActivity();
        this.updatePerformanceMetrics();
        this.updateNotifications();
        this.attachEventListeners();
        
        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.updateFinancialData();
            this.updateRecentActivity();
            this.updatePerformanceMetrics();
            this.updateNotifications();
        }, 30000);
    },

    updateWelcomeMessage: function() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Good Morning';
        
        if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
        } else if (hour >= 17) {
            greeting = 'Good Evening';
        }
        
        this.updateElement('welcome-message', greeting);
        
        // Format date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        this.updateElement('current-date', dateString);
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
        
        // Calculate inventory value and count
        const inventoryValue = inventory.reduce((sum, item) => {
            const quantity = item.quantity || 0;
            const price = item.price || item.unitPrice || 0;
            return sum + (quantity * price);
        }, 0);
        this.updateElement('inventory-value', this.formatCurrency(inventoryValue));
        this.updateElement('inventory-items', inventory.length);
        
        // Calculate net profit (simplified: revenue - cost of goods sold)
        const netProfit = monthlySales; // In a real app, you'd subtract costs
        this.updateElement('net-profit', this.formatCurrency(netProfit));
        
        // Update periods and trends
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[currentMonth];
        this.updateElement('sales-subtitle', currentMonthName);
        this.updateElement('profit-subtitle', currentMonthName);
        
        // Calculate trends (simplified - compare with previous month)
        const prevMonthSales = this.getPreviousMonthSales(sales);
        const salesTrend = prevMonthSales > 0 ? ((monthlySales - prevMonthSales) / prevMonthSales * 100) : 0;
        this.updateTrend('sales-trend', salesTrend);
        
        const profitTrend = salesTrend; // Simplified
        this.updateTrend('profit-trend', profitTrend);
    },

    getPreviousMonthSales: function(sales) {
        const now = new Date();
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        
        return sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevYear;
            })
            .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    },

    updateTrend: function(elementId, trend) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const trendIcon = element.querySelector('.trend-icon');
        const trendValue = element.querySelector('.trend-value');
        
        if (trend > 0) {
            trendIcon.textContent = '↗️';
            trendValue.textContent = `${Math.abs(trend).toFixed(1)}%`;
            element.style.background = 'rgba(16, 185, 129, 0.1)';
            element.style.color = '#059669';
        } else if (trend < 0) {
            trendIcon.textContent = '↘️';
            trendValue.textContent = `${Math.abs(trend).toFixed(1)}%`;
            element.style.background = 'rgba(239, 68, 68, 0.1)';
            element.style.color = '#dc2626';
        } else {
            trendIcon.textContent = '➡️';
            trendValue.textContent = '0%';
            element.style.background = 'rgba(107, 114, 128, 0.1)';
            element.style.color = '#6b7280';
        }
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
                details: `${sale.quantity} ${sale.unit} sold to ${sale.customer || 'Walk-in'}`,
                amount: sale.totalAmount,
                date: sale.date,
                icon: '💰',
                time: this.formatTimeAgo(sale.date)
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
                icon: '📦',
                time: this.formatTimeAgo(item.lastUpdated)
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
                icon: '🌾',
                time: this.formatTimeAgo(record.date)
            });
        });
        
        // Sort by date (most recent first) and take top 6
        const recentActivities = allActivities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
        
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;
        
        if (recentActivities.length === 0) {
            activityFeed.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No Recent Activity</h3>
                    <p>Start recording transactions to see activity here</p>
                </div>
            `;
            return;
        }
        
        activityFeed.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
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

    updateNotifications: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockItems = inventory.filter(item => {
            const quantity = item.quantity || 0;
            const lowStockThreshold = item.lowStockThreshold || 10;
            return quantity <= lowStockThreshold;
        });
        
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = lowStockItems.length;
            badge.style.display = lowStockItems.length > 0 ? 'block' : 'none';
        }
    },

    attachEventListeners: function() {
        console.log('🔗 Attaching dashboard event listeners...');
        
        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-card');
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
        
        // Refresh dashboard button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Refresh dashboard clicked');
                this.refreshDashboard();
            });
            console.log('✅ Refresh dashboard button listener attached');
        } else {
            console.warn('❌ Refresh dashboard button not found');
        }
        
        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                console.log('🔔 Notifications button clicked');
                this.showNotifications();
            });
            console.log('✅ Notifications button listener attached');
        }
        
        // View all activity button
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                console.log('📋 View all activity clicked');
                this.viewAllActivity();
            });
            console.log('✅ View all activity button listener attached');
        }
        
        console.log('✅ All dashboard event listeners attached');
    },

    handleQuickAction: function(action) {
        console.log('🔧 Quick action clicked:', action);
        
        const routes = {
            'record-sale': 'sales-record',
            'add-inventory': 'inventory-check', 
            'record-feed': 'feed-record',
            'view-reports': 'reports'
        };
        
        const route = routes[action];
        if (route) {
            // Always work - change URL hash
            window.location.hash = route;
            console.log('📍 Navigating to:', route);
            this.showNotification(`Opening ${this.getModuleName(route)}...`, 'info');
        } else {
            console.warn('Unknown action:', action);
            this.showNotification('Action not available', 'warning');
        }
    },

    refreshDashboard: function() {
        console.log('🔄 Refreshing dashboard data...');
        
        // Show loading state
        this.showNotification('Refreshing dashboard...', 'info');
        
        // Update all data
        this.updateFinancialData();
        this.updateRecentActivity();
        this.updatePerformanceMetrics();
        this.updateNotifications();
        
        // Show success message
        setTimeout(() => {
            this.showNotification('Dashboard updated successfully!', 'success');
        }, 500);
    },

    showNotifications: function() {
        const inventory = FarmModules.appData.inventory || [];
        const lowStockItems = inventory.filter(item => {
            const quantity = item.quantity || 0;
            const lowStockThreshold = item.lowStockThreshold || 10;
            return quantity <= lowStockThreshold;
        });
        
        if (lowStockItems.length === 0) {
            this.showNotification('No notifications', 'info');
        } else {
            const message = `You have ${lowStockItems.length} item(s) with low stock`;
            this.showNotification(message, 'warning');
        }
    },

    viewAllActivity: function() {
        // Navigate to reports or show all activity
        window.location.hash = 'reports';
        this.showNotification('Opening Reports...', 'info');
    },

    formatTimeAgo: function(dateString) {
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

    getModuleName: function(route) {
        const names = {
            'sales-record': 'Sales Records',
            'inventory-check': 'Inventory',
            'feed-record': 'Feed Records', 
            'reports': 'Reports'
        };
        return names[route] || route;
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
    },

    // Clean up on destroy
    destroy: function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
});
