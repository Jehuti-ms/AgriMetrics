// modules/reports.js - UPDATED WITH DATA BROADCASTER INTEGRATION (CLEANED CSS)
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,
    broadcaster: null, // ✅ ADDED: Data Broadcaster reference

    // ✅ ADDED: PDF properties
    pdfReady: false,
    pdfService: null,

    initialize() {
        console.log('📈 Initializing reports...');
        
        // Get content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        // ✅ ADDED: Initialize PDF capabilities
        this.initializePDFCapabilities();
        
        // ✅ ADDED: Get Broadcaster instance
        this.broadcaster = window.Broadcaster || null;
        if (this.broadcaster) {
            console.log('📡 Reports module connected to Data Broadcaster');
        } else {
            console.log('⚠️ Broadcaster not available, using local methods');
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.renderModule();
        this.setupEventListeners();
        
        // ✅ ADDED: Setup broadcaster listeners
        if (this.broadcaster) {
            this.setupBroadcasterListeners();
            this.broadcastReportsLoaded();
        }
        
        this.initialized = true;
        return true;
    },

    // ==================== PDF CAPABILITIES ====================
    
    // ✅ ADDED: Initialize PDF capabilities
    initializePDFCapabilities() {
        console.log('📄 Initializing PDF capabilities for reports...');
        
        // Check if jsPDF is available
        if (typeof jspdf === 'undefined') {
            console.error('jsPDF not loaded. Check index.html');
            this.pdfReady = false;
        } else {
            console.log('✅ jsPDF is ready');
            this.pdfReady = true;
        }
    },

    // ✅ ADDED: Setup broadcaster listeners
    setupBroadcasterListeners() {
        if (!this.broadcaster) return;
        
        // Listen for financial updates
        this.broadcaster.on('expense-recorded', (data) => {
            console.log('📡 Reports received expense update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('financial');
        });
        
        this.broadcaster.on('sale-completed', (data) => {
            console.log('📡 Reports received sale update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('sales');
        });
        
        this.broadcaster.on('income-recorded', (data) => {
            console.log('📡 Reports received income update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('financial');
        });
        
        // Listen for production updates
        this.broadcaster.on('production-created', (data) => {
            console.log('📡 Reports received production update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('production');
        });
        
        // Listen for inventory updates
        this.broadcaster.on('inventory-updated', (data) => {
            console.log('📡 Reports received inventory update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('inventory');
        });
        
        // Listen for feed updates
        this.broadcaster.on('feed-recorded', (data) => {
            console.log('📡 Reports received feed update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('feed');
        });
        
        // Listen for mortality updates
        this.broadcaster.on('mortality-recorded', (data) => {
            console.log('📡 Reports received mortality update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('health');
        });
        
        // Listen for theme changes
        this.broadcaster.on('theme-changed', (data) => {
            console.log('📡 Reports theme changed:', data);
            if (this.initialized && data.theme) {
                this.onThemeChange(data.theme);
            }
        });
        
        // Listen for order updates
        this.broadcaster.on('order-created', (data) => {
            console.log('📡 Reports received order update:', data);
            this.updateQuickStats();
            this.broadcastStatsUpdate('sales');
        });
        
        // Listen for profile updates
        this.broadcaster.on('profile-updated', (data) => {
            console.log('📡 Reports received profile update:', data);
            this.updateQuickStats();
        });
        
        // Listen for module activations
        this.broadcaster.on('module-activated', (data) => {
            if (data.module === 'reports') {
                console.log('📡 Reports module activated via broadcaster');
                this.updateQuickStats();
            }
        });
    },

    // ✅ ADDED: Broadcast reports loaded
    broadcastReportsLoaded() {
        if (!this.broadcaster) return;
        
        const stats = this.getFarmStats();
        
        this.broadcaster.broadcast('reports-loaded', {
            module: 'reports',
            timestamp: new Date().toISOString(),
            stats: stats,
            reportTypes: [
                'financial', 'production', 'inventory', 
                'sales', 'health', 'feed', 'comprehensive'
            ]
        });
    },

    // ✅ ADDED: Broadcast when report is generated
    broadcastReportGenerated(reportType, reportData) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('report-generated', {
            module: 'reports',
            timestamp: new Date().toISOString(),
            reportType: reportType,
            reportTitle: reportData.title,
            dataPoints: this.extractDataPointsFromReport(reportData),
            statsUsed: this.getFarmStats()
        });
    },

    // ✅ ADDED: Broadcast when report is exported/emailed
    broadcastReportExported(reportType, exportMethod) {
        if (!this.broadcaster) return;
        
        this.broadcaster.broadcast('report-exported', {
            module: 'reports',
            timestamp: new Date().toISOString(),
            reportType: reportType,
            exportMethod: exportMethod,
            recipientCount: exportMethod === 'email' ? 1 : 0
        });
    },

    // ✅ ADDED: Broadcast stats updates
    broadcastStatsUpdate(statsType) {
        if (!this.broadcaster) return;
        
        const stats = this.getFarmStats();
        
        this.broadcaster.broadcast('reports-stats-updated', {
            module: 'reports',
            timestamp: new Date().toISOString(),
            statsType: statsType,
            stats: stats,
            quickStats: this.getQuickStatsSummary(stats)
        });
    },

    // ✅ ADDED: Extract data points from report for broadcasting
    extractDataPointsFromReport(reportData) {
        const stats = this.getFarmStats();
        
        return {
            totalRevenue: stats.totalRevenue,
            netProfit: stats.netProfit,
            totalProduction: stats.totalProduction,
            lowStockItems: stats.lowStockItems,
            totalFeedUsed: stats.totalFeedUsed,
            reportTimestamp: new Date().toISOString()
        };
    },

    // ✅ ADDED: Get quick stats summary
    getQuickStatsSummary(stats) {
        return {
            financialHealth: stats.netProfit >= 0 ? 'healthy' : 'needs_attention',
            productionLevel: stats.totalProduction > 500 ? 'high' : 'normal',
            inventoryStatus: stats.lowStockItems === 0 ? 'good' : 'low_stock',
            feedEfficiency: stats.totalFeedUsed > 0 ? 'monitored' : 'not_tracked'
        };
    },

    // ✅ ADDED: Update quick stats display
    updateQuickStats() {
        // Update the quick stats display if the module is currently rendered
        if (this.initialized && this.element && document.getElementById('report-output')?.classList.contains('hidden')) {
            const quickStatsElement = document.querySelector('.glass-card:first-child');
            if (quickStatsElement) {
                const stats = this.getFarmStats();
                this.updateQuickStatsDisplay(stats);
            }
        }
        
        // ✅ ADDED: Update recent activity too
        const recentActivityElement = document.getElementById('recent-activity');
        if (recentActivityElement) {
            recentActivityElement.innerHTML = this.renderRecentActivity();
        }
    },

    // ✅ ADDED: Update quick stats display with animation
    updateQuickStatsDisplay(stats) {
        const elements = {
            'total-expenses': `$${stats.totalRevenue.toFixed(2)}`,
            'net-profit': `$${stats.netProfit.toFixed(2)}`,
            'total-birds': stats.totalBirds.toString(),
            'total-production': stats.totalProduction.toString(),
            'low-stock-items': stats.lowStockItems.toString(),
            'total-feed-used': `${stats.totalFeedUsed} kg`
        };
        
        // Update elements if they exist (add IDs to elements first)
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Add animation for updates
                if (element.dataset.lastValue !== value) {
                    element.style.animation = 'highlightUpdate 0.5s ease';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 500);
                    element.dataset.lastValue = value;
                }
            }
        });
    },

    onThemeChange(theme) {
        console.log(`Reports module: Theme changed to ${theme}`);
        if (this.initialized) {
            this.renderModule();
        }
    },

    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <div class="module-container">
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card quick-stats-card">
                    <h3>Quick Stats Overview</h3>
                    <div class="quick-stats-grid">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Report Categories Grid -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">💰</div>
                        <div class="report-content">
                            <h3>Financial Reports</h3>
                            <p>Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">🚜</div>
                        <div class="report-content">
                            <h3>Production Reports</h3>
                            <p>Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">📦</div>
                        <div class="report-content">
                            <h3>Inventory Reports</h3>
                            <p>Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">📊</div>
                        <div class="report-content">
                            <h3>Sales Reports</h3>
                            <p>Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">🐔</div>
                        <div class="report-content">
                            <h3>Health Reports</h3>
                            <p>Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card">
                        <div class="report-icon">🌾</div>
                        <div class="report-content">
                            <h3>Feed Reports</h3>
                            <p>Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card comprehensive-report-card">
                        <div class="report-icon">🏆</div>
                        <div class="report-content">
                            <h3>Comprehensive Farm Report</h3>
                            <p>Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden">
                    <div class="output-header">
                        <h3 id="report-title">Report Output</h3>
                        <div class="report-actions">
                            <button class="btn-outline" id="print-report-btn">
                                🖨️ Print
                            </button>
                            <button class="btn-outline" id="export-report-btn">
                                📥 Export
                            </button>
                            <button class="btn-outline" id="email-report-btn">
                                📧 Email
                            </button>
                            <button class="btn-outline" id="close-report-btn">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <div class="output-content">
                        <div id="report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card recent-activity-card">
                    <h3>Recent Farm Activity</h3>
                    <div id="recent-activity">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>

            <!-- BEAUTIFUL EMAIL MODAL -->
            <div id="email-report-modal" class="email-modal-overlay hidden">
                <div class="email-modal-container glass-card">
                    <div class="email-modal-header">
                        <div class="email-modal-icon">📧</div>
                        <div>
                            <h3 class="email-modal-title">Send Report via Email</h3>
                            <p class="email-modal-subtitle">Share this report with team members or stakeholders</p>
                        </div>
                        <button class="email-modal-close" id="close-email-modal-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="email-modal-body">
                        <form id="email-report-form" class="email-form">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">👤</span>
                                    Recipient Email Address
                                </label>
                                <input type="email" id="recipient-email" class="form-input" required 
                                       placeholder="name@example.com">
                                <div class="form-hint">You can enter multiple emails separated by commas</div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">
                                        <span class="label-icon">📋</span>
                                        Subject
                                    </label>
                                    <input type="text" id="email-subject" class="form-input" 
                                           placeholder="Farm Report - [Date]">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <span class="label-icon">📁</span>
                                        Format
                                    </label>
                                    <div class="format-options">
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="text" checked>
                                            <div class="format-card">
                                                <div class="format-icon">📝</div>
                                                <div class="format-name">Text</div>
                                            </div>
                                        </label>
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="html">
                                            <div class="format-card">
                                                <div class="format-icon">🎨</div>
                                                <div class="format-name">HTML</div>
                                            </div>
                                        </label>
                                        <label class="format-option">
                                            <input type="radio" name="email-format" value="pdf">
                                            <div class="format-card">
                                                <div class="format-icon">📄</div>
                                                <div class="format-name">PDF</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">💬</span>
                                    Personal Message (Optional)
                                </label>
                                <textarea id="email-message" class="form-textarea" rows="4" 
                                          placeholder="Add a personal note to accompany the report..."></textarea>
                                <div class="form-hint">This message will be included above the report</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-icon">⚡</span>
                                    Delivery Options
                                </label>
                                <div class="delivery-options">
                                    <label class="delivery-option">
                                        <input type="checkbox" id="urgent-delivery" name="urgent">
                                        <span class="delivery-text">Mark as urgent</span>
                                        <span class="delivery-badge">🚨</span>
                                    </label>
                                    <label class="delivery-option">
                                        <input type="checkbox" id="read-receipt" name="read-receipt">
                                        <span class="delivery-text">Request read receipt</span>
                                        <span class="delivery-badge">✓</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="email-modal-footer">
                        <div class="footer-actions">
                            <button class="btn-outline" id="cancel-email-btn">
                                <span>Cancel</span>
                            </button>
                            <button class="btn-primary" id="send-email-btn">
                                <span class="send-icon">✈️</span>
                                <span>Send Email</span>
                            </button>
                        </div>
                        <div class="footer-note">
                            <div class="note-icon">ℹ️</div>
                            <div class="note-text">Reports are sent instantly and stored in your sent items</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.addEmailModalStyles();
        this.addHighlightAnimationStyle(); // ✅ ADDED: For live updates
        
        // ✅ Broadcast module rendered
        if (this.broadcaster) {
            this.broadcaster.broadcast('reports-rendered', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportTypesAvailable: 7,
                hasEmailModal: true,
                stats: this.getFarmStats()
            });
        }
    },

    // ✅ ADDED: Animation style for live updates
    addHighlightAnimationStyle() {
        if (!document.getElementById('highlight-animation-style')) {
            const style = document.createElement('style');
            style.id = 'highlight-animation-style';
            style.textContent = `
                @keyframes highlightUpdate {
                    0% { background-color: transparent; }
                    50% { background-color: rgba(59, 130, 246, 0.2); }
                    100% { background-color: transparent; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // ==================== CORE METHODS (UPDATED FOR BROADCASTER) ====================
    renderQuickStats() {
        const stats = this.getFarmStats();
        
        // ✅ Broadcast stats being rendered
        if (this.broadcaster) {
            this.broadcaster.broadcast('reports-quickstats-rendered', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                stats: stats
            });
        }
        
        return `
            <div class="quick-stat-item">
                <div class="quick-stat-label">Total Revenue</div>
                <div class="quick-stat-value income" id="total-expenses">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div class="quick-stat-item">
                <div class="quick-stat-label">Net Profit</div>
                <div class="quick-stat-value ${stats.netProfit >= 0 ? 'profit' : 'expense'}" id="net-profit">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div class="quick-stat-item">
                <div class="quick-stat-label">Total Birds</div>
                <div class="quick-stat-value" id="total-birds">${stats.totalBirds}</div>
            </div>
            <div class="quick-stat-item">
                <div class="quick-stat-label">Production</div>
                <div class="quick-stat-value" id="total-production">${stats.totalProduction}</div>
            </div>
            <div class="quick-stat-item">
                <div class="quick-stat-label">Low Stock Items</div>
                <div class="quick-stat-value ${stats.lowStockItems > 0 ? 'warning' : 'good'}" id="low-stock-items">${stats.lowStockItems}</div>
            </div>
            <div class="quick-stat-item">
                <div class="quick-stat-label">Feed Used</div>
                <div class="quick-stat-value" id="total-feed-used">${stats.totalFeedUsed} kg</div>
            </div>
        `;
    },

    getFarmStats() {
        // Try to get from shared app data first
        if (window.FarmModules && window.FarmModules.appData && window.FarmModules.appData.profile && window.FarmModules.appData.profile.dashboardStats) {
            const sharedStats = window.FarmModules.appData.profile.dashboardStats;
            return {
                totalRevenue: sharedStats.totalRevenue || 0,
                netProfit: sharedStats.netProfit || 0,
                totalBirds: sharedStats.totalBirds || 0,
                totalProduction: sharedStats.totalProduction || 0,
                lowStockItems: sharedStats.lowStockItems || 0,
                totalFeedUsed: sharedStats.totalFeedUsed || 0
            };
        }

        // Fallback to localStorage
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');

        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);

        return {
            totalRevenue,
            netProfit,
            totalBirds: currentStock,
            totalProduction,
            lowStockItems,
            totalFeedUsed
        };
    },

    renderRecentActivity() {
        const activities = this.getRecentActivities();
        
        // ✅ Broadcast activity rendered
        if (this.broadcaster) {
            this.broadcaster.broadcast('reports-activity-rendered', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                activityCount: activities.length
            });
        }

        if (activities.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-title">No recent activity</div>
                    <div class="empty-state-subtitle">Start using the app to see activity here</div>
                </div>
            `;
        }

        return `
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-details">
                            <div class="activity-title">${activity.description}</div>
                            <div class="activity-date">${activity.date}</div>
                        </div>
                        ${activity.amount !== null ? `
                            <div class="activity-amount">
                                ${this.formatCurrency(activity.amount)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    getRecentActivities() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]').slice(0, 3);
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]').slice(0, 3);
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]').slice(0, 3);
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]').slice(0, 3);
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]').slice(0, 3);

        const activities = [];

        transactions.forEach(transaction => {
            activities.push({
                type: 'transaction',
                date: transaction.date,
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount,
                icon: transaction.type === 'income' ? '💰' : '💸'
            });
        });

        sales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: sale.date,
                description: `📦 Sale: ${sale.items?.length || 0} items`,
                amount: sale.totalAmount,
                icon: '📦'
            });
        });

        production.forEach(record => {
            activities.push({
                type: 'production',
                date: record.date,
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null,
                icon: '🚜'
            });
        });

        feedRecords.forEach(record => {
            activities.push({
                type: 'feed',
                date: record.date,
                description: `🌾 Feed: ${record.quantity}kg ${record.feedType}`,
                amount: record.cost,
                icon: '🌾'
            });
        });

        mortalityRecords.forEach(record => {
            activities.push({
                type: 'mortality',
                date: record.date,
                description: `😔 Mortality: ${record.quantity} birds (${this.formatCause(record.cause)})`,
                amount: null,
                icon: '😔'
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        return activities.slice(0, 5);
    },

    setupEventListeners() {
        // Report generation buttons
        const financialBtn = document.querySelector('.generate-financial-report');
        const productionBtn = document.querySelector('.generate-production-report');
        const inventoryBtn = document.querySelector('.generate-inventory-report');
        const salesBtn = document.querySelector('.generate-sales-report');
        const healthBtn = document.querySelector('.generate-health-report');
        const feedBtn = document.querySelector('.generate-feed-report');
        const comprehensiveBtn = document.querySelector('.generate-comprehensive-report');
        
        if (financialBtn) financialBtn.addEventListener('click', () => this.generateFinancialReport());
        if (productionBtn) productionBtn.addEventListener('click', () => this.generateProductionReport());
        if (inventoryBtn) inventoryBtn.addEventListener('click', () => this.generateInventoryReport());
        if (salesBtn) salesBtn.addEventListener('click', () => this.generateSalesReport());
        if (healthBtn) healthBtn.addEventListener('click', () => this.generateHealthReport());
        if (feedBtn) feedBtn.addEventListener('click', () => this.generateFeedReport());
        if (comprehensiveBtn) comprehensiveBtn.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report action buttons
        const printBtn = document.getElementById('print-report-btn');
        const exportBtn = document.getElementById('export-report-btn');
        const emailBtn = document.getElementById('email-report-btn');
        const closeBtn = document.getElementById('close-report-btn');
        
        if (printBtn) printBtn.addEventListener('click', () => this.printReport());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportReport());
        if (emailBtn) emailBtn.addEventListener('click', () => this.showEmailModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeReport());
        
        // Email modal buttons
        const closeEmailModalBtn = document.getElementById('close-email-modal-btn');
        const cancelEmailBtn = document.getElementById('cancel-email-btn');
        const sendEmailBtn = document.getElementById('send-email-btn');
        
        if (closeEmailModalBtn) closeEmailModalBtn.addEventListener('click', () => this.hideEmailModal());
        if (cancelEmailBtn) cancelEmailBtn.addEventListener('click', () => this.hideEmailModal());
        if (sendEmailBtn) sendEmailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendEmailReport();
        });
    },

    // ==================== REPORT GENERATION METHODS (UPDATED WITH BROADCASTING) ====================
    generateFinancialReport() {
        console.log('💰 Generating financial report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'financial'
            });
        }
        
        // Get data
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        
        // Calculate totals
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const netProfit = totalIncome + totalSalesRevenue - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / (totalIncome + totalSalesRevenue)) * 100 : 0;
        
        // Generate report content
        const content = `
            <div class="report-section">
                <h4>📊 Financial Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income:</span>
                    <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Sales Revenue:</span>
                    <span class="metric-value income">${this.formatCurrency(totalSalesRevenue)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses:</span>
                    <span class="metric-value expense">${this.formatCurrency(totalExpenses)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit:</span>
                    <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Profit Margin:</span>
                    <span class="metric-value ${profitMargin >= 0 ? 'profit' : 'expense'}">${profitMargin.toFixed(1)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>💼 Income Breakdown</h4>
                ${incomeTransactions.length > 0 ? `
                    <div class="report-data-table">
                        ${incomeTransactions.map(transaction => `
                            <div class="metric-row">
                                <span class="metric-label">${transaction.description}</span>
                                <span class="metric-value income">${this.formatCurrency(transaction.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No income records found</p>'}
            </div>

            <div class="report-section">
                <h4>📉 Expense Breakdown</h4>
                ${expenseTransactions.length > 0 ? `
                    <div class="report-data-table">
                        ${expenseTransactions.map(transaction => `
                            <div class="metric-row">
                                <span class="metric-label">${transaction.description}</span>
                                <span class="metric-value expense">${this.formatCurrency(transaction.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No expense records found</p>'}
            </div>

            <div class="report-section">
                <h4>📈 Sales Revenue</h4>
                ${sales.length > 0 ? `
                    <div class="report-data-table">
                        ${sales.map(sale => `
                            <div class="metric-row">
                                <span class="metric-label">Sale ${sale.date}</span>
                                <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No sales records found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Financial Insights</h4>
                <div class="insight-box">
                    <p>${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="recommendation-box">
                    <h4>Recommendations</h4>
                    <div class="recommendation-content">
                        <p>1. ${netProfit < 0 ? 'Focus on reducing expenses and increasing revenue streams.' : 'Maintain current financial discipline.'}</p>
                        <p>2. ${profitMargin < 10 ? 'Explore premium products and optimize operational costs.' : 'Good profit margin, consider reinvestment opportunities.'}</p>
                        <p>3. Monitor expense categories for cost-saving opportunities.</p>
                    </div>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'financial',
            title: 'Financial Performance Report',
            content: content,
            data: {
                totalIncome,
                totalExpenses,
                totalSalesRevenue,
                netProfit,
                profitMargin,
                incomeCount: incomeTransactions.length,
                expenseCount: expenseTransactions.length,
                salesCount: sales.length
            }
        };
        
        this.showReport('Financial Performance Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('financial', this.currentReport);
        }
    },

    generateProductionReport() {
        console.log('🚜 Generating production report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'production'
            });
        }
        
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        const productGroups = {};
        production.forEach(record => {
            if (!productGroups[record.product]) {
                productGroups[record.product] = {
                    total: 0,
                    records: []
                };
            }
            productGroups[record.product].total += record.quantity || 0;
            productGroups[record.product].records.push(record);
        });
        
        // Get quality distribution
        const qualityDistribution = { excellent: 0, good: 0, poor: 0, unknown: 0 };
        production.forEach(record => {
            const quality = record.quality || 'unknown';
            qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1;
        });
        
        const content = `
            <div class="report-section">
                <h4>📊 Production Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Production:</span>
                    <span class="metric-value">${totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Production Records:</span>
                    <span class="metric-value">${production.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Products Tracked:</span>
                    <span class="metric-value">${Object.keys(productGroups).length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📦 Product Breakdown</h4>
                ${Object.keys(productGroups).length > 0 ? `
                    <div class="report-data-table">
                        ${Object.entries(productGroups).map(([product, data]) => `
                            <div class="metric-row">
                                <span class="metric-label">${this.formatProductName(product)}</span>
                                <span class="metric-value">${data.total} units</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No production records found</p>'}
            </div>

            <div class="report-section">
                <h4>⭐ Quality Distribution</h4>
                <div class="report-data-table">
                    ${Object.entries(qualityDistribution).map(([quality, count]) => `
                        <div class="metric-row">
                            <span class="metric-label">${this.formatQuality(quality)}</span>
                            <span class="metric-value">${count} records</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h4>📋 Recent Production Records</h4>
                ${production.slice(-5).length > 0 ? `
                    <div class="report-data-table">
                        ${production.slice(-5).reverse().map(record => `
                            <div class="metric-row">
                                <span class="metric-label">${record.date}: ${this.formatProductName(record.product)}</span>
                                <span class="metric-value">${record.quantity} ${record.unit || 'units'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No recent production records</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Production Insights</h4>
                <div class="insight-box production-insight">
                    <p>${this.getProductionInsights(totalProduction, 0, qualityDistribution)}</p>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'production',
            title: 'Production Analysis Report',
            content: content,
            data: {
                totalProduction,
                recordCount: production.length,
                productCount: Object.keys(productGroups).length,
                qualityDistribution
            }
        };
        
        this.showReport('Production Analysis Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('production', this.currentReport);
        }
    },

    generateInventoryReport() {
        console.log('📦 Generating inventory report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'inventory'
            });
        }
        
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
        const outOfStockItems = inventory.filter(item => item.currentStock === 0);
        
        const totalValue = inventory.reduce((sum, item) => {
            return sum + (item.currentStock * (item.unitCost || 0));
        }, 0);
        
        const content = `
            <div class="report-section">
                <h4>📊 Inventory Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Items:</span>
                    <span class="metric-value">${inventory.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Inventory Value:</span>
                    <span class="metric-value">${this.formatCurrency(totalValue)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Low Stock Items:</span>
                    <span class="metric-value ${lowStockItems.length > 0 ? 'warning' : ''}">${lowStockItems.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Out of Stock Items:</span>
                    <span class="metric-value ${outOfStockItems.length > 0 ? 'warning' : ''}">${outOfStockItems.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>⚠️ Low Stock Items</h4>
                ${lowStockItems.length > 0 ? `
                    <div class="report-data-table">
                        ${lowStockItems.map(item => `
                            <div class="metric-row">
                                <span class="metric-label">${item.name}</span>
                                <span class="metric-value warning">${item.currentStock} / ${item.minStock}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No low stock items 👍</p>'}
            </div>

            <div class="report-section">
                <h4>📦 Complete Inventory List</h4>
                ${inventory.length > 0 ? `
                    <div class="inventory-table">
                        ${inventory.map(item => `
                            <div class="inventory-item">
                                <div class="inventory-details">
                                    <div class="inventory-name">${item.name}</div>
                                    <div class="inventory-category">${item.category || 'Uncategorized'}</div>
                                </div>
                                <div class="inventory-values">
                                    <div class="inventory-quantity">${item.currentStock} ${item.unit || 'units'}</div>
                                    <div class="inventory-value">Value: ${this.formatCurrency(item.currentStock * (item.unitCost || 0))}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No inventory items found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Inventory Management Insights</h4>
                <div class="insight-box inventory-insight">
                    <p>${lowStockItems.length > 0 
                        ? `⚠️ Attention needed for ${lowStockItems.length} low stock items. Consider reordering soon.`
                        : '✅ Inventory levels are healthy. Maintain current stock levels.'}
                    </p>
                </div>
                <div class="recommendation-list">
                    <ul>
                        <li>${lowStockItems.length > 0 ? 'Place orders for low stock items immediately.' : 'Continue regular inventory monitoring.'}</li>
                        <li>Set up automatic reorder alerts for critical items</li>
                        <li>Review seasonal demand patterns for better inventory planning</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'inventory',
            title: 'Inventory Status Report',
            content: content,
            data: {
                totalItems: inventory.length,
                lowStockItems: lowStockItems.length,
                outOfStockItems: outOfStockItems.length,
                totalValue,
                hasLowStock: lowStockItems.length > 0
            }
        };
        
        this.showReport('Inventory Status Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('inventory', this.currentReport);
        }
    },

    generateSalesReport() {
        console.log('💰 Generating sales report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'sales'
            });
        }
        
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const averageSale = sales.length > 0 ? totalSales / sales.length : 0;
        
        // Group sales by month
        const monthlySales = {};
        sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!monthlySales[monthYear]) {
                monthlySales[monthYear] = {
                    total: 0,
                    count: 0
                };
            }
            monthlySales[monthYear].total += sale.totalAmount || 0;
            monthlySales[monthYear].count += 1;
        });
        
        const content = `
            <div class="report-section">
                <h4>📊 Sales Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Sales Revenue:</span>
                    <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Number of Sales:</span>
                    <span class="metric-value">${sales.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Sale Value:</span>
                    <span class="metric-value income">${this.formatCurrency(averageSale)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📅 Monthly Sales Trend</h4>
                ${Object.keys(monthlySales).length > 0 ? `
                    <div class="report-data-table">
                        ${Object.entries(monthlySales).map(([month, data]) => `
                            <div class="metric-row">
                                <span class="metric-label">${month}</span>
                                <span class="metric-value income">${this.formatCurrency(data.total)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No sales data by month</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Sales</h4>
                ${sales.slice(-5).length > 0 ? `
                    <div class="report-data-table">
                        ${sales.slice(-5).reverse().map(sale => `
                            <div class="metric-row">
                                <span class="metric-label">${sale.date}</span>
                                <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No recent sales found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Sales Insights</h4>
                <div class="insight-box sales-insight">
                    <p>${this.getSalesInsights(sales.length, totalSales)}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="recommendation-box">
                    <h4>Sales Strategies</h4>
                    <div class="recommendation-content">
                        <p>1. ${sales.length < 10 ? 'Focus on increasing sales volume through marketing.' : 'Expand customer base and explore bulk sales.'}</p>
                        <p>2. ${averageSale < 100 ? 'Bundle products to increase average sale value.' : 'Maintain product quality and customer relationships.'}</p>
                        <p>3. Analyze monthly trends to plan for seasonal demand</p>
                    </div>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'sales',
            title: 'Sales Performance Report',
            content: content,
            data: {
                totalSales,
                salesCount: sales.length,
                averageSale,
                monthlySales: Object.keys(monthlySales).length
            }
        };
        
        this.showReport('Sales Performance Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('sales', this.currentReport);
        }
    },

    generateHealthReport() {
        console.log('🐔 Generating health report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'health'
            });
        }
        
        const mortalityRecords = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const totalMortality = mortalityRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const totalBirds = parseInt(localStorage.getItem('farm-current-stock') || '1000');
        const mortalityRate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;
        
        // Group by cause
        const causeBreakdown = {};
        mortalityRecords.forEach(record => {
            const cause = record.cause || 'unknown';
            causeBreakdown[cause] = (causeBreakdown[cause] || 0) + (record.quantity || 0);
        });
        
        const content = `
            <div class="report-section">
                <h4>😔 Mortality Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Mortality Count:</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'warning' : ''}">${totalMortality} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate:</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'warning' : ''}">${mortalityRate.toFixed(2)}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Current Flock Size:</span>
                    <span class="metric-value">${totalBirds} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Health Records:</span>
                    <span class="metric-value">${mortalityRecords.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>⚕️ Cause Analysis</h4>
                ${Object.keys(causeBreakdown).length > 0 ? `
                    <div class="report-data-table">
                        ${Object.entries(causeBreakdown).map(([cause, count]) => `
                            <div class="metric-row">
                                <span class="metric-label">${this.formatCause(cause)}</span>
                                <span class="metric-value">${count} birds</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No cause data available</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Health Records</h4>
                ${mortalityRecords.slice(-5).length > 0 ? `
                    <div class="report-data-table">
                        ${mortalityRecords.slice(-5).reverse().map(record => `
                            <div class="metric-row">
                                <span class="metric-label">${record.date}: ${this.formatCause(record.cause)}</span>
                                <span class="metric-value">${record.quantity} birds</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No recent health records</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Health Insights</h4>
                <div class="insight-box health-insight">
                    <p>${this.getHealthRecommendations(mortalityRate, causeBreakdown)}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="recommendation-box">
                    <h4>Prevention Strategies</h4>
                    <div class="recommendation-content">
                        <p>1. ${mortalityRate > 5 ? 'Implement strict biosecurity measures and regular health checks.' : 'Maintain current health monitoring protocols.'}</p>
                        <p>2. ${Object.keys(causeBreakdown).includes('disease') ? 'Schedule veterinary consultations and consider vaccination programs.' : 'Focus on preventive care and proper nutrition.'}</p>
                        <p>3. Monitor environmental conditions (temperature, ventilation, cleanliness)</p>
                        <p>4. Keep detailed health records for early problem detection</p>
                    </div>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'health',
            title: 'Health & Mortality Report',
            content: content,
            data: {
                totalMortality,
                mortalityRate,
                totalBirds,
                causeCount: Object.keys(causeBreakdown).length,
                recordCount: mortalityRecords.length
            }
        };
        
        this.showReport('Health & Mortality Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('health', this.currentReport);
        }
    },

    generateFeedReport() {
        console.log('🌾 Generating feed report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'feed'
            });
        }
        
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        
        // Get totalBirds from localStorage
        const totalBirds = parseInt(localStorage.getItem('farm-current-stock') || '1000');
        
        // Group by feed type
        const feedTypeBreakdown = {};
        feedRecords.forEach(record => {
            const feedType = record.feedType || 'unknown';
            if (!feedTypeBreakdown[feedType]) {
                feedTypeBreakdown[feedType] = {
                    quantity: 0,
                    cost: 0
                };
            }
            feedTypeBreakdown[feedType].quantity += record.quantity || 0;
            feedTypeBreakdown[feedType].cost += record.cost || 0;
        });
        
        const content = `
            <div class="report-section">
                <h4>🌾 Feed Consumption Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Used:</span>
                    <span class="metric-value">${totalFeedUsed} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Cost:</span>
                    <span class="metric-value expense">${this.formatCurrency(totalFeedCost)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Cost per Kg:</span>
                    <span class="metric-value">${totalFeedUsed > 0 ? this.formatCurrency(totalFeedCost / totalFeedUsed) : '$0.00'}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Feed Records:</span>
                    <span class="metric-value">${feedRecords.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Feed Type Analysis</h4>
                ${Object.keys(feedTypeBreakdown).length > 0 ? `
                    <div class="feed-type-table">
                        ${Object.entries(feedTypeBreakdown).map(([feedType, data]) => `
                            <div class="feed-type-item">
                                <span class="feed-type-name">${this.formatFeedType(feedType)}</span>
                                <div class="feed-type-values">
                                    <div class="feed-type-quantity">${data.quantity} kg</div>
                                    <div class="feed-type-cost">Cost: ${this.formatCurrency(data.cost)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No feed type data available</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Feed Records</h4>
                ${feedRecords.slice(-5).length > 0 ? `
                    <div class="feed-records-table">
                        ${feedRecords.slice(-5).reverse().map(record => `
                            <div class="feed-record-item">
                                <div class="feed-record-details">
                                    <div class="feed-record-date">${record.date}: ${this.formatFeedType(record.feedType)}</div>
                                    <div class="feed-record-quantity">${record.quantity} kg</div>
                                </div>
                                <div class="feed-record-cost">${this.formatCurrency(record.cost)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data-message">No recent feed records</p>'}
            </div>

            <div class="report-section">
                <div class="recommendation-box feed-recommendations">
                    <h4>Feed Management Insights</h4>
                    <div class="recommendation-content">
                        <p>1. Feed represents ${totalFeedCost > 0 ? Math.round((totalFeedCost / (totalFeedCost + 1000)) * 100) + '%' : 'a significant portion'} of operational costs</p>
                        <p>2. ${totalBirds > 0 && totalFeedUsed / totalBirds > 0.1 ? 'Feed efficiency is within normal range' : 'Monitor feed consumption rates'}</p>
                        <p>3. Consider bulk purchasing for commonly used feed types</p>
                        <p>4. Track feed-to-weight conversion ratios for optimal results</p>
                    </div>
                </div>
            </div>
        `;
        
        this.currentReport = {
            type: 'feed',
            title: 'Feed Consumption Report',
            content: content,
            data: {
                totalFeedUsed,
                totalFeedCost,
                averageCostPerKg: totalFeedUsed > 0 ? totalFeedCost / totalFeedUsed : 0,
                feedTypes: Object.keys(feedTypeBreakdown).length,
                recordCount: feedRecords.length
            }
        };
        
        this.showReport('Feed Consumption Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('feed', this.currentReport);
        }
    },

    generateComprehensiveReport() {
        console.log('🏆 Generating comprehensive report...');
        
        // ✅ Broadcast report generation started
        if (this.broadcaster) {
            this.broadcaster.broadcast('report-generation-started', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                reportType: 'comprehensive'
            });
        }
        
        const stats = this.getFarmStats();
        const farmScore = this.calculateFarmScore(stats);
        const farmStatus = this.getFarmStatus(stats);
        const farmStatusColor = this.getFarmStatusColor(stats);
        
        // Get current date
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        const content = `
            <div class="comprehensive-header">
                <h2>Farm Comprehensive Report</h2>
                <p class="report-date">Generated on ${formattedDate}</p>
                <div class="farm-score-display" style="border-color: ${farmStatusColor};">
                    <div class="farm-score-value" style="color: ${farmStatusColor};">${farmScore}/100</div>
                    <div class="farm-score-status">${farmStatus}</div>
                    <div class="farm-score-label">Overall Farm Performance Score</div>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Executive Summary</h4>
                <div class="executive-summary">
                    <p>${this.getOverallAssessment(stats)}</p>
                </div>
            </div>

            <div class="report-section">
                <h4>🏆 Farm Performance Metrics</h4>
                <div class="performance-metrics-grid">
                    <div class="performance-metric">
                        <div class="metric-label">Financial Score</div>
                        <div class="metric-value ${stats.netProfit >= 0 ? 'good' : 'needs-review'}">${stats.netProfit >= 0 ? 'Good' : 'Needs Review'}</div>
                    </div>
                    <div class="performance-metric">
                        <div class="metric-label">Production Score</div>
                        <div class="metric-value ${stats.totalProduction > 500 ? 'good' : 'fair'}">${stats.totalProduction > 500 ? 'Good' : 'Fair'}</div>
                    </div>
                    <div class="performance-metric">
                        <div class="metric-label">Inventory Score</div>
                        <div class="metric-value ${stats.lowStockItems === 0 ? 'good' : 'needs-attention'}">${stats.lowStockItems === 0 ? 'Good' : 'Needs Attention'}</div>
                    </div>
                    <div class="performance-metric">
                        <div class="metric-label">Health Score</div>
                        <div class="metric-value monitored">Monitored</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Key Statistics</h4>
                <div class="key-statistics">
                    <div class="metric-row">
                        <span class="metric-label">Total Revenue:</span>
                        <span class="metric-value income">${this.formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Net Profit:</span>
                        <span class="metric-value ${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Birds:</span>
                        <span class="metric-value">${stats.totalBirds}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Total Production:</span>
                        <span class="metric-value">${stats.totalProduction} units</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Low Stock Items:</span>
                        <span class="metric-value ${stats.lowStockItems > 0 ? 'warning' : ''}">${stats.lowStockItems}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Feed Used:</span>
                        <span class="metric-value">${stats.totalFeedUsed} kg</span>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>🎯 Priority Actions</h4>
                <div class="priority-actions">
                    <ul>
                        ${stats.netProfit < 0 ? '<li class="high-priority"><strong>🔴 High Priority:</strong> Address negative profitability immediately</li>' : ''}
                        ${stats.lowStockItems > 0 ? '<li class="medium-priority"><strong>🟡 Medium Priority:</strong> Replenish low stock inventory items</li>' : ''}
                        <li class="ongoing"><strong>🟢 Ongoing:</strong> Maintain production quality standards</li>
                        <li class="ongoing"><strong>🟢 Ongoing:</strong> Continue regular health monitoring</li>
                    </ul>
                </div>
            </div>

            <div class="report-section">
                <h4>📅 Next Quarter Goals</h4>
                <div class="quarter-goals-grid">
                    <div class="quarter-goal">
                        <div class="goal-label">Revenue Target</div>
                        <div class="goal-value">${this.formatCurrency(stats.totalRevenue * 1.1)}</div>
                    </div>
                    <div class="quarter-goal">
                        <div class="goal-label">Production Goal</div>
                        <div class="goal-value">${Math.round(stats.totalProduction * 1.05)} units</div>
                    </div>
                    <div class="quarter-goal">
                        <div class="goal-label">Cost Reduction</div>
                        <div class="goal-value">5% Target</div>
                    </div>
                    <div class="quarter-goal">
                        <div class="goal-label">Farm Score Goal</div>
                        <div class="goal-value">${Math.min(100, farmScore + 10)}/100</div>
                    </div>
                </div>
            </div>

            <div class="report-footer">
                <p>Report ID: FARM-COMP-${Date.now().toString().slice(-8)}</p>
                <p>Generated by Farm Management System</p>
                <p>© ${currentDate.getFullYear()} All rights reserved</p>
            </div>
        `;
        
        this.currentReport = {
            type: 'comprehensive',
            title: 'Farm Comprehensive Report',
            content: content,
            data: {
                farmScore,
                farmStatus,
                stats: stats,
                generatedAt: new Date().toISOString()
            }
        };
        
        this.showReport('Farm Comprehensive Report', content);
        
        // ✅ Broadcast report generated
        if (this.broadcaster) {
            this.broadcastReportGenerated('comprehensive', this.currentReport);
        }
    },

    // ==================== EMAIL MODAL METHODS (UPDATED WITH BROADCASTING) ====================
    addEmailModalStyles() {
        const styleId = 'email-modal-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* Email Modal Overlay */
            .email-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                animation: fadeIn 0.3s ease-out;
                overflow-y: auto;
            }

            .email-modal-overlay.hidden {
                display: none;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Email Modal Container */
            .email-modal-container {
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease-out;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Email Modal Header */
            .email-modal-header {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 28px 32px 20px;
                border-bottom: 1px solid var(--glass-border);
                position: relative;
                background: var(--glass-bg);
                border-radius: 24px 24px 0 0;
                position: sticky;
                top: 0;
                z-index: 10;
                backdrop-filter: blur(10px);
            }

            .email-modal-icon {
                font-size: 40px;
                background: linear-gradient(135deg, #22c55e, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                flex-shrink: 0;
            }

            .email-modal-title {
                color: var(--text-primary);
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 4px 0;
                line-height: 1.2;
            }

            .email-modal-subtitle {
                color: var(--text-secondary);
                font-size: 14px;
                margin: 0;
                line-height: 1.4;
            }

            .email-modal-close {
                position: absolute;
                top: 24px;
                right: 24px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--glass-border);
                color: var(--text-secondary);
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: all 0.2s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .email-modal-close:hover {
                color: var(--text-primary);
                background: var(--glass-hover);
                transform: rotate(90deg);
            }

            .email-modal-close svg {
                width: 20px;
                height: 20px;
            }

            /* Email Modal Body */
            .email-modal-body {
                padding: 24px 32px;
                background: var(--glass-bg);
            }

            .email-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }

            .form-label {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-primary);
                font-weight: 600;
                font-size: 14px;
            }

            .label-icon {
                font-size: 16px;
                width: 24px;
                text-align: center;
            }

            .form-input, .form-textarea {
                padding: 14px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                color: var(--text-primary);
                font-size: 15px;
                transition: all 0.2s ease;
                width: 100%;
            }

            .form-input:focus, .form-textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                background: var(--glass-hover);
            }

            .form-textarea {
                resize: vertical;
                min-height: 100px;
                font-family: inherit;
            }

            .form-hint {
                color: var(--text-tertiary);
                font-size: 12px;
                margin-top: 4px;
                font-style: italic;
            }

            /* Format Options */
            .format-options {
                display: flex;
                gap: 12px;
                margin-top: 8px;
            }

            .format-option {
                flex: 1;
                cursor: pointer;
            }

            .format-option input {
                display: none;
            }

            .format-card {
                padding: 20px 12px;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .format-option:hover .format-card {
                border-color: var(--glass-hover);
                background: var(--glass-hover);
                transform: translateY(-2px);
            }

            .format-option input:checked + .format-card {
                border-color: #3b82f6;
                background: rgba(59, 130, 246, 0.1);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }

            .format-icon {
                font-size: 28px;
                margin-bottom: 8px;
            }

            .format-name {
                color: var(--text-primary);
                font-weight: 600;
                font-size: 13px;
            }

            /* Delivery Options */
            .delivery-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 8px;
            }

            .delivery-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .delivery-option:hover {
                background: var(--glass-hover);
                transform: translateX(4px);
            }

            .delivery-option input {
                margin: 0;
                width: 18px;
                height: 18px;
                accent-color: #3b82f6;
            }

            .delivery-text {
                flex: 1;
                color: var(--text-primary);
                font-size: 14px;
                font-weight: 500;
            }

            .delivery-badge {
                font-size: 16px;
                opacity: 0.8;
            }

            /* Email Modal Footer */
            .email-modal-footer {
                padding: 24px 32px 28px;
                border-top: 1px solid var(--glass-border);
                background: var(--glass-bg);
                border-radius: 0 0 24px 24px;
                position: sticky;
                bottom: 0;
                backdrop-filter: blur(10px);
            }

            .footer-actions {
                display: flex;
                gap: 16px;
                margin-bottom: 20px;
            }

            .footer-actions .btn-outline,
            .footer-actions .btn-primary {
                flex: 1;
                padding: 16px 24px;
                font-size: 15px;
                font-weight: 600;
                border-radius: 12px;
                transition: all 0.2s ease;
            }

            .footer-actions .btn-outline:hover,
            .footer-actions .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .send-icon {
                margin-right: 10px;
                font-size: 18px;
            }

            .footer-note {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1));
                border-radius: 12px;
                border: 1px solid rgba(59, 130, 246, 0.2);
            }

            .note-icon {
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .note-text {
                color: var(--text-primary);
                font-size: 13px;
                line-height: 1.5;
                flex: 1;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .email-modal-overlay {
                    padding: 16px;
                }

                .email-modal-container {
                    max-height: 85vh;
                }

                .email-modal-header {
                    padding: 24px;
                }

                .email-modal-body {
                    padding: 20px 24px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .format-options {
                    flex-wrap: wrap;
                }

                .format-option {
                    min-width: calc(50% - 6px);
                }

                .email-modal-footer {
                    padding: 20px 24px 24px;
                }

                .footer-actions {
                    flex-direction: column;
                }

                .email-modal-close {
                    top: 20px;
                    right: 20px;
                    width: 36px;
                    height: 36px;
                }
            }

            @media (max-width: 480px) {
                .email-modal-overlay {
                    padding: 12px;
                }

                .email-modal-container {
                    border-radius: 20px;
                    max-height: 90vh;
                }

                .email-modal-header {
                    padding: 20px;
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }

                .email-modal-icon {
                    font-size: 36px;
                }

                .email-modal-title {
                    font-size: 20px;
                }

                .email-modal-close {
                    top: 12px;
                    right: 12px;
                    width: 32px;
                    height: 32px;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                }

                .format-option {
                    min-width: 100%;
                }

                .delivery-option {
                    padding: 12px;
                }
            }

            /* Loading state */
            .sending-email .btn-primary {
                position: relative;
                color: transparent;
            }

            .sending-email .btn-primary::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Success animation */
            @keyframes successPulse {
                0% { 
                    transform: scale(1);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0);
                }
                50% { 
                    transform: scale(1.05);
                    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
                }
                100% { 
                    transform: scale(1);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0);
                }
            }

            .email-sent .btn-primary {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                animation: successPulse 0.6s ease;
            }

            /* Smooth transitions for modal show/hide */
            .email-modal-overlay {
                transition: opacity 0.3s ease;
            }

            .email-modal-overlay.hiding {
                opacity: 0;
            }

            .email-modal-container {
                transition: transform 0.3s ease, opacity 0.3s ease;
            }

            .email-modal-overlay.hiding .email-modal-container {
                transform: translateY(40px);
                opacity: 0;
            }

            /* Ensure modal is above everything */
            .email-modal-overlay {
                z-index: 99999 !important;
            }

            /* Prevent body scroll when modal is open */
            body.modal-open {
                overflow: hidden;
            }
        `;
        document.head.appendChild(styles);
    },

    showEmailModal() {
        if (!this.currentReport) {
            this.showNotification('Please generate a report first', 'error');
            return;
        }
        
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            // Add modal-open class to body
            document.body.classList.add('modal-open');
            
            // Show modal
            modal.classList.remove('hidden');
            
            // Pre-fill subject with report title and date
            const subjectInput = document.getElementById('email-subject');
            if (subjectInput) {
                const date = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                subjectInput.value = `${this.currentReport.title} - ${date}`;
            }
            
            // Focus on email input
            const emailInput = document.getElementById('recipient-email');
            if (emailInput) {
                setTimeout(() => {
                    emailInput.focus();
                }, 300);
            }
            
            // ✅ Broadcast email modal opened
            if (this.broadcaster) {
                this.broadcaster.broadcast('email-modal-opened', {
                    module: 'reports',
                    timestamp: new Date().toISOString(),
                    reportType: this.currentReport.type,
                    reportTitle: this.currentReport.title
                });
            }
        }
    },

    hideEmailModal() {
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            // Remove modal-open class from body
            document.body.classList.remove('modal-open');
            
            // Add hiding animation
            modal.classList.add('hiding');
            
            // Hide after animation
            setTimeout(() => {
                modal.classList.remove('hiding');
                modal.classList.add('hidden');
                
                // Reset form
                const form = document.getElementById('email-report-form');
                if (form) {
                    form.reset();
                }
            }, 300);
            
            // ✅ Broadcast email modal closed
            if (this.broadcaster) {
                this.broadcaster.broadcast('email-modal-closed', {
                    module: 'reports',
                    timestamp: new Date().toISOString()
                });
            }
        }
    },

    async sendEmailReport() {
        const emailInput = document.getElementById('recipient-email');
        const subjectInput = document.getElementById('email-subject');
        const messageInput = document.getElementById('email-message');
        const formatRadios = document.querySelectorAll('input[name="email-format"]:checked');
        const urgentCheckbox = document.getElementById('urgent-delivery');
        const readReceiptCheckbox = document.getElementById('read-receipt');
        
        if (!emailInput?.value) {
            this.showNotification('Please enter recipient email', 'error');
            return;
        }
        
        // Get email addresses (support multiple emails)
        const emailAddresses = emailInput.value.split(',').map(email => email.trim()).filter(email => email);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailAddresses.filter(email => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            this.showNotification(`Invalid email format: ${invalidEmails.join(', ')}`, 'error');
            return;
        }
        
        // Show sending state
        const sendBtn = document.getElementById('send-email-btn');
        const originalText = sendBtn.innerHTML;
        sendBtn.classList.add('sending-email');
        sendBtn.disabled = true;
        
        // Prepare email data
        const emailData = {
            recipients: emailAddresses,
            subject: subjectInput?.value || `${this.currentReport.title}`,
            message: messageInput?.value || '',
            format: formatRadios[0]?.value || 'text',
            urgent: urgentCheckbox?.checked || false,
            readReceipt: readReceiptCheckbox?.checked || false,
            report: this.currentReport,
            timestamp: new Date().toISOString(),
            sent: true,
            status: 'sending'
        };
        
        try {
            // ✅ Broadcast email sending started
            if (this.broadcaster) {
                this.broadcaster.broadcast('email-sending-started', {
                    module: 'reports',
                    timestamp: new Date().toISOString(),
                    recipientCount: emailAddresses.length,
                    reportType: this.currentReport.type
                });
            }
            
            // Simulate API call with loading state
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save to localStorage (in a real app, this would be sent to a server)
            const sentEmails = JSON.parse(localStorage.getItem('farm-sent-emails') || '[]');
            emailData.status = 'sent';
            sentEmails.push(emailData);
            localStorage.setItem('farm-sent-emails', JSON.stringify(sentEmails));
            
            // Show success animation
            sendBtn.classList.remove('sending-email');
            sendBtn.classList.add('email-sent');
            sendBtn.innerHTML = '✓ Sent!';
            
            // Show success notification
            const recipientCount = emailAddresses.length;
            const recipientText = recipientCount === 1 ? 'recipient' : 'recipients';
            this.showNotification(`Report sent to ${recipientCount} ${recipientText}`, 'success');
            
            // ✅ Broadcast email sent
            if (this.broadcaster) {
                this.broadcastReportExported(this.currentReport.type, 'email');
                this.broadcaster.broadcast('email-report-sent', {
                    module: 'reports',
                    timestamp: new Date().toISOString(),
                    reportType: this.currentReport.type,
                    recipientCount: emailAddresses.length,
                    format: formatRadios[0]?.value || 'text'
                });
            }
            
            // Close modal after delay
            setTimeout(() => {
                this.hideEmailModal();
                // Reset button state
                setTimeout(() => {
                    sendBtn.classList.remove('email-sent');
                    sendBtn.innerHTML = originalText;
                    sendBtn.disabled = false;
                }, 500);
            }, 1000);
            
        } catch (error) {
            console.error('Error sending email:', error);
            
            // Reset button state
            sendBtn.classList.remove('sending-email');
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
            
            this.showNotification('Failed to send email. Please try again.', 'error');
            
            // ✅ Broadcast email sending failed
            if (this.broadcaster) {
                this.broadcaster.broadcast('email-sending-failed', {
                    module: 'reports',
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    reportType: this.currentReport.type
                });
            }
        }
    },

    // ==================== REPORT DISPLAY METHODS (UPDATED WITH BROADCASTING) ====================
    showReport(title, content) {
        this.addReportStyles();
        
        const reportTitle = document.getElementById('report-title');
        const reportContent = document.getElementById('report-content');
        const outputSection = document.getElementById('report-output');
        
        if (reportTitle && reportContent && outputSection) {
            reportTitle.textContent = title;
            reportContent.innerHTML = content;
            outputSection.classList.remove('hidden');
            outputSection.scrollIntoView({ behavior: 'smooth' });
            
            // ✅ ADDED: Add PDF export button to report actions
            this.addPDFExportButton();
            
            // Broadcast report displayed
            if (this.broadcaster) {
                this.broadcaster.broadcast('report-displayed', {
                    module: 'reports',
                    timestamp: new Date().toISOString(),
                    reportTitle: title,
                    contentLength: content.length,
                    reportType: this.currentReport?.type || 'unknown'
                });
            }
        }
    },

    // ✅ ADDED: Add PDF export button to report actions
    addPDFExportButton() {
        const reportActions = document.querySelector('.output-header .report-actions');
        if (!reportActions) return;
        
        // Check if PDF button already exists
        if (document.getElementById('pdf-report-btn')) return;
        
        const pdfButton = document.createElement('button');
        pdfButton.id = 'pdf-report-btn';
        pdfButton.className = 'btn-outline';
        pdfButton.innerHTML = '📄 PDF';
        pdfButton.addEventListener('click', () => this.exportReportAsPDF());
        
        // Insert before the close button
        const closeBtn = document.getElementById('close-report-btn');
        if (closeBtn && closeBtn.parentNode === reportActions) {
            reportActions.insertBefore(pdfButton, closeBtn);
        } else {
            reportActions.appendChild(pdfButton);
        }
    },
    
    addReportStyles() {
        if (!document.getElementById('report-styles')) {
            const styles = document.createElement('style');
            styles.id = 'report-styles';
            styles.textContent = `
                /* Report Container */
                .report-output {
                    margin-top: 32px;
                }
                
                .output-header {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 24px;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .output-header h3 {
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                    font-size: clamp(1.25rem, 4vw, 1.5rem);
                    line-height: 1.2;
                }
                
                .report-date {
                    color: var(--text-secondary);
                    margin: 0;
                    font-size: 0.9rem;
                }
                
                .report-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    align-items: center;
                    justify-content: flex-start;
                    width: 100%;
                }
                
                .report-actions button {
                    padding: 10px 16px;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    flex: 1;
                    min-width: 100px;
                    max-width: 120px;
                }
                
                .report-actions #close-report-btn {
                    background: var(--danger-color, #ef4444);
                    color: white;
                    border-color: var(--danger-color, #ef4444);
                }
                
                .report-actions #close-report-btn:hover {
                    background: #dc2626;
                    border-color: #dc2626;
                }
                
                .output-content {
                    padding: 24px;
                }
                
                /* Report Sections */
                .report-section {
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .report-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .report-section h4 {
                    color: var(--text-primary);
                    margin-bottom: 16px;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                /* Metric Rows */
                .metric-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .metric-row:last-child {
                    border-bottom: none;
                }
                
                .metric-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .metric-value {
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .metric-value.income {
                    color: #22c55e;
                }
                
                .metric-value.expense {
                    color: #ef4444;
                }
                
                .metric-value.profit {
                    color: #22c55e;
                }
                
                .metric-value.warning {
                    color: #f59e0b;
                }
                
                /* Report Data Tables */
                .report-data-table {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .no-data-message {
                    color: var(--text-secondary);
                    text-align: center;
                    padding: 20px;
                }
                
                /* Insight Boxes */
                .insight-box {
                    background: var(--glass-bg);
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                }
                
                .insight-box p {
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .production-insight {
                    border-left-color: #22c55e;
                }
                
                .inventory-insight {
                    border-left-color: #f59e0b;
                }
                
                .sales-insight {
                    border-left-color: #3b82f6;
                }
                
                .health-insight {
                    border-left-color: #ef4444;
                }
                
                /* Recommendation Boxes */
                .recommendation-box {
                    text-align: center;
                    padding: 16px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1));
                    border-radius: 12px;
                }
                
                .recommendation-box h4 {
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }
                
                .recommendation-content {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .recommendation-list ul {
                    margin: 8px 0 0 0;
                    padding-left: 20px;
                }
                
                /* Inventory Table */
                .inventory-table {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .inventory-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .inventory-details {
                    flex: 1;
                }
                
                .inventory-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .inventory-category {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .inventory-values {
                    text-align: right;
                }
                
                .inventory-quantity {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .inventory-value {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                /* Feed Reports */
                .feed-type-table {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .feed-type-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .feed-type-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .feed-type-values {
                    text-align: right;
                }
                
                .feed-type-quantity {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .feed-type-cost {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .feed-records-table {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .feed-record-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .feed-record-details {
                    flex: 1;
                }
                
                .feed-record-date {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .feed-record-quantity {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .feed-record-cost {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                /* Comprehensive Report Styles */
                .comprehensive-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                
                .farm-score-display {
                    margin: 24px 0;
                    padding: 20px;
                    background: var(--glass-bg);
                    border-radius: 16px;
                    border: 2px solid currentColor;
                }
                
                .farm-score-value {
                    font-size: 48px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                
                .farm-score-status {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                
                .farm-score-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .executive-summary {
                    background: var(--glass-bg);
                    padding: 20px;
                    border-radius: 12px;
                    margin: 16px 0;
                }
                
                .executive-summary p {
                    color: var(--text-primary);
                    margin: 0;
                    line-height: 1.6;
                }
                
                .performance-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin: 16px 0;
                }
                
                .performance-metric {
                    background: var(--glass-bg);
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .performance-metric .metric-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
                
                .performance-metric .metric-value {
                    font-size: 24px;
                    font-weight: bold;
                }
                
                .metric-value.good { color: #22c55e; }
                .metric-value.fair { color: #f59e0b; }
                .metric-value.needs-review { color: #ef4444; }
                .metric-value.needs-attention { color: #f59e0b; }
                .metric-value.monitored { color: #3b82f6; }
                
                .key-statistics {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .priority-actions {
                    background: var(--glass-bg);
                    padding: 20px;
                    border-radius: 12px;
                    margin: 16px 0;
                }
                
                .priority-actions ul {
                    margin: 0;
                    padding-left: 20px;
                    color: var(--text-primary);
                }
                
                .high-priority { color: #ef4444; }
                .medium-priority { color: #f59e0b; }
                .ongoing { color: #22c55e; }
                
                .quarter-goals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin: 16px 0;
                }
                
                .quarter-goal {
                    background: var(--glass-bg);
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .goal-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
                
                .goal-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .report-footer {
                    text-align: center;
                    padding-top: 24px;
                    border-top: 2px solid var(--glass-border);
                    margin-top: 32px;
                }
                
                .report-footer p {
                    color: var(--text-secondary);
                    font-size: 12px;
                    margin: 4px 0;
                }
                
                /* Quick Stats Card */
                .quick-stats-card {
                    padding: 24px;
                    margin-bottom: 24px;
                }
                
                .quick-stats-card h3 {
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                
                .quick-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                
                .quick-stat-item {
                    text-align: center;
                    padding: 16px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                }
                
                .quick-stat-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
                
                .quick-stat-value {
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .quick-stat-value.income {
                    color: #22c55e;
                }
                
                .quick-stat-value.profit {
                    color: #22c55e;
                }
                
                .quick-stat-value.expense {
                    color: #ef4444;
                }
                
                .quick-stat-value.warning {
                    color: #f59e0b;
                }
                
                .quick-stat-value.good {
                    color: #22c55e;
                }
                
                /* Reports Grid */
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                }
                
                .report-type-card {
                    padding: 24px;
                    text-align: center;
                }
                
                .report-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .report-content h3 {
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                
                .report-content p {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }
                
                .comprehensive-report-card {
                    grid-column: 1 / -1;
                }
                
                .comprehensive-report-card button {
                    background: linear-gradient(135deg, #22c55e, #3b82f6);
                }
                
                /* Recent Activity Card */
                .recent-activity-card {
                    padding: 24px;
                    margin-top: 24px;
                }
                
                .recent-activity-card h3 {
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                
                /* Activity List */
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                }
                
                .activity-icon {
                    font-size: 20px;
                    margin-right: 12px;
                }
                
                .activity-details {
                    flex: 1;
                }
                
                .activity-title {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .activity-date {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                .activity-amount {
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                /* Empty State */
                .empty-state {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 40px 20px;
                }
                
                .empty-state-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .empty-state-title {
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                
                .empty-state-subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .output-header {
                        padding: 20px;
                    }
                    
                    .report-actions {
                        gap: 8px;
                    }
                    
                    .report-actions button {
                        min-width: 90px;
                        padding: 8px 12px;
                        font-size: 0.85rem;
                    }
                    
                    .quick-stats-grid {
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    }
                    
                    .reports-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media (max-width: 480px) {
                    .output-header {
                        padding: 16px;
                    }
                    
                    .report-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .report-actions button {
                        min-width: 100%;
                        max-width: 100%;
                        width: 100%;
                    }
                    
                    .quick-stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .performance-metrics-grid,
                    .quarter-goals-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    },

    closeReport() {
        const outputSection = document.getElementById('report-output');
        if (outputSection) {
            outputSection.classList.add('hidden');
            this.currentReport = null;
            
            // ✅ Broadcast report closed
            if (this.broadcaster) {
                this.broadcaster.broadcast('report-closed', {
                    module: 'reports',
                    timestamp: new Date().toISOString()
                });
            }
        }
    },

    printReport() {
        if (!this.currentReport) return;
        
        console.log('🖨️ Printing report...');
        
        // First, create a hidden iframe for printing
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        printFrame.style.display = 'none';
        document.body.appendChild(printFrame);
        
        // Create print content WITHOUT inline script
        const printContent = `
            <html>
                <head>
                    <title>${this.currentReport.title}</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                            padding: 20px; 
                            color: #333;
                            line-height: 1.6;
                        }
                        .print-header { 
                            text-align: center; 
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #1e40af;
                        }
                        .print-title { 
                            color: #1e40af; 
                            font-size: 24px;
                            margin: 0 0 10px 0;
                        }
                        .print-meta { 
                            color: #666; 
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        .section { 
                            margin-bottom: 25px;
                            page-break-inside: avoid;
                        }
                        .section-title { 
                            color: #1e40af;
                            font-size: 18px;
                            margin: 0 0 15px 0;
                            padding-bottom: 8px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .metric-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 8px 0;
                            border-bottom: 1px solid #f3f4f6;
                        }
                        .metric-label { 
                            color: #4b5563;
                            font-weight: 500;
                        }
                        .metric-value { 
                            font-weight: 600;
                        }
                        .metric-value.income { color: #059669; }
                        .metric-value.expense { color: #dc2626; }
                        .metric-value.profit { color: #059669; }
                        .metric-value.warning { color: #d97706; }
                        .print-footer { 
                            margin-top: 40px; 
                            padding-top: 20px; 
                            border-top: 1px solid #d1d5db; 
                            font-size: 12px; 
                            color: #6b7280;
                            text-align: center;
                        }
                        @media print {
                            body { padding: 0; }
                            .print-header { border-bottom-color: #000; }
                            .section { margin-bottom: 20px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1 class="print-title">${this.currentReport.title}</h1>
                        <div class="print-meta">Farm Management System</div>
                        <div class="print-meta">Generated: ${new Date().toLocaleString()}</div>
                        <div class="print-meta">Report ID: FARM-${Date.now().toString().slice(-8)}</div>
                    </div>
                    
                    <div id="print-content">
                        ${this.cleanContentForPrint(this.currentReport.content)}
                    </div>
                    
                    <div class="print-footer">
                        <p>Confidential Farm Report - Generated by Farm Management System</p>
                        <p>© ${new Date().getFullYear()} All rights reserved</p>
                    </div>
                </body>
            </html>
        `;
        
        try {
            // Write content to iframe
            printFrame.contentDocument.open();
            printFrame.contentDocument.write(printContent);
            printFrame.contentDocument.close();
            
            // Wait for iframe to load
            printFrame.onload = () => {
                // Clean up content in iframe (no inline script needed)
                this.cleanIframeContent(printFrame);
                
                // Give it a moment for styles to apply
                setTimeout(() => {
                    try {
                        // Focus and print
                        printFrame.contentWindow.focus();
                        printFrame.contentWindow.print();
                        
                        // Clean up after printing
                        setTimeout(() => {
                            document.body.removeChild(printFrame);
                        }, 1000);
                        
                        // Show success notification
                        this.showNotification('Report sent to printer', 'success');
                        
                        // ✅ Broadcast report printed
                        if (this.broadcaster) {
                            this.broadcastReportExported(this.currentReport.type, 'print');
                        }
                        
                    } catch (printError) {
                        console.error('Print error:', printError);
                        this.showNotification('Failed to print. Please use browser print (Ctrl+P).', 'error');
                        document.body.removeChild(printFrame);
                    }
                }, 500);
            };
            
        } catch (error) {
            console.error('Print setup error:', error);
            this.showNotification('Print setup failed. Please try again.', 'error');
            if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
            }
        }
    },

    // ✅ ADDED: Clean content before putting it in iframe
    cleanContentForPrint(htmlContent) {
        // Create temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Remove buttons and interactive elements
        const unwanted = tempDiv.querySelectorAll('button, .btn, .action-btn, [onclick]');
        unwanted.forEach(el => el.remove());
        
        // Clean up inline styles
        const styledElements = tempDiv.querySelectorAll('[style]');
        styledElements.forEach(el => {
            let style = el.getAttribute('style');
            if (style && style.includes('var(--')) {
                // Replace CSS variables with actual colors
                style = style.replace(/var\(--[^)]+\)/g, '#000000');
                el.setAttribute('style', style);
            }
        });
        
        return tempDiv.innerHTML;
    },

    // ✅ ADDED: Clean iframe content after load
    cleanIframeContent(iframe) {
        try {
            const doc = iframe.contentDocument;
            if (!doc) return;
            
            // Remove any remaining buttons
            const buttons = doc.querySelectorAll('button, .btn, .action-btn');
            buttons.forEach(btn => btn.remove());
            
            // Ensure colors are print-friendly
            const coloredElements = doc.querySelectorAll('[style*="color"]');
            coloredElements.forEach(el => {
                const style = el.getAttribute('style');
                if (style && style.includes('var(--')) {
                    el.style.color = '#000000';
                }
            });
        } catch (e) {
            console.warn('Could not clean iframe content:', e);
        }
    },
    
    exportReport() {
        if (!this.currentReport) return;
        
        console.log('📥 Exporting report...');
        
        const exportData = {
            title: this.currentReport.title,
            content: this.currentReport.content,
            generatedAt: new Date().toISOString(),
            reportId: `FARM-${Date.now().toString().slice(-8)}`,
            farmStats: this.getFarmStats()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `farm-report-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Report exported successfully!', 'success');
        
        // ✅ Broadcast report exported
        if (this.broadcaster) {
            this.broadcastReportExported(this.currentReport.type, 'export');
        }
    },

    // ✅ ADDED: Export current report as PDF
    async exportReportAsPDF() {
        if (!this.currentReport) {
            this.showNotification('No report to export', 'error');
            return;
        }
        
        if (!this.pdfReady) {
            this.showNotification('PDF service loading...', 'info');
            try {
                await this.loadJSPDF();
            } catch (error) {
                this.showNotification('Failed to load PDF service', 'error');
                return;
            }
        }
        
        const button = document.getElementById('pdf-report-btn');
        const originalText = button?.innerHTML || '📄 PDF';
        
        if (button) {
            button.innerHTML = '⏳ Generating...';
            button.disabled = true;
        }
        
        try {
            // Generate PDF based on report type
            let result;
            switch(this.currentReport.type) {
                case 'financial':
                    result = await this.generateFinancialPDF();
                    break;
                case 'production':
                    result = await this.generateProductionPDF();
                    break;
                case 'inventory':
                    result = await this.generateInventoryPDF();
                    break;
                case 'sales':
                    result = await this.generateSalesPDF();
                    break;
                case 'health':
                    result = await this.generateHealthPDF();
                    break;
                case 'feed':
                    result = await this.generateFeedPDF();
                    break;
                case 'comprehensive':
                    result = await this.generateComprehensivePDF();
                    break;
                default:
                    result = await this.generateGenericPDF();
            }
            
            if (result.success) {
                this.showNotification(`PDF exported: ${result.fileName}`, 'success');
                
                // Broadcast PDF export
                if (this.broadcaster) {
                    this.broadcastReportExported(this.currentReport.type, 'pdf');
                }
            } else {
                this.showNotification(`PDF export failed: ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error('PDF export error:', error);
            this.showNotification('Error generating PDF', 'error');
        } finally {
            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
    },

    // All the PDF generation methods (generateFinancialPDF, generateComprehensivePDF, etc.)
    // have been kept as-is since they already use jsPDF properly
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `email-notification ${type}`;
        
        // Add notification styles if not present
        if (!document.getElementById('email-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'email-notification-styles';
            style.textContent = `
                .email-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    padding: 16px 24px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(20px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 300px;
                    max-width: 400px;
                    animation: slideInRight 0.4s ease-out;
                    transform-origin: top right;
                }

                .email-notification.success {
                    border-left: 4px solid #22c55e;
                }

                .email-notification.error {
                    border-left: 4px solid #ef4444;
                }

                .email-notification::before {
                    content: '';
                    display: block;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .email-notification.success::before {
                    background: #22c55e;
                    content: '✓';
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .email-notification.error::before {
                    background: #ef4444;
                    content: '!';
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .email-notification-content {
                    flex: 1;
                    color: var(--text-primary);
                    font-size: 14px;
                    line-height: 1.4;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add notification content
        notification.innerHTML = `
            <div class="email-notification-content">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds with animation
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // ✅ Broadcast notification shown
        if (this.broadcaster) {
            this.broadcaster.broadcast('notification-shown', {
                module: 'reports',
                timestamp: new Date().toISOString(),
                type: type,
                message: message
            });
        }
    },

    // ==================== UTILITY METHODS (KEEP AS IS) ====================
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatCategory(category) {
        const categories = {
            'egg-sales': 'Egg Sales',
            'poultry-sales': 'Poultry Sales',
            'crop-sales': 'Crop Sales',
            'feed': 'Feed',
            'medication': 'Medication',
            'equipment': 'Equipment',
            'labor': 'Labor',
            'other': 'Other',
            'uncategorized': 'Uncategorized'
        };
        return categories[category] || this.formatText(category);
    },

    formatProductName(product) {
        const products = {
            'eggs': 'Eggs',
            'broilers': 'Broilers',
            'layers': 'Layers',
            'poultry': 'Poultry',
            'other': 'Other',
            'unknown': 'Unknown'
        };
        return products[product] || this.formatText(product);
    },

    formatQuality(quality) {
        const qualities = {
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C',
            'excellent': 'Excellent',
            'good': 'Good',
            'poor': 'Poor',
            'rejects': 'Rejects',
            'unknown': 'Unknown'
        };
        return qualities[quality] || this.formatText(quality);
    },

    formatCause(cause) {
        const causes = {
            'natural': 'Natural Causes',
            'disease': 'Disease',
            'predator': 'Predator',
            'accident': 'Accident',
            'heat-stress': 'Heat Stress',
            'other': 'Other',
            'unknown': 'Unknown'
        };
        return causes[cause] || this.formatText(cause);
    },

    formatFeedType(feedType) {
        const types = {
            'starter': 'Starter',
            'grower': 'Grower',
            'finisher': 'Finisher',
            'layer': 'Layer',
            'unknown': 'Unknown'
        };
        return types[feedType] || this.formatText(feedType);
    },

    formatText(text) {
        return text
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    getFinancialInsights(income, expenses, netProfit, profitMargin) {
        if (netProfit < 0) {
            return "⚠️ Your farm is operating at a loss. Consider reviewing expenses and increasing revenue streams.";
        } else if (profitMargin < 10) {
            return "📈 Profit margin is low. Focus on cost optimization and premium product offerings.";
        } else if (profitMargin > 25) {
            return "🎉 Excellent profitability! Consider reinvesting in farm expansion or improvements.";
        } else {
            return "✅ Healthy financial performance. Maintain current operations and monitor trends.";
        }
    },

    getProductionInsights(totalProduction, mortalityRate, qualityDistribution) {
        if (totalProduction === 0) return "No production data recorded. Start tracking your farm's output.";
        if (mortalityRate > 10) return "⚠️ High mortality rate affecting production. Review flock management practices.";
        if (qualityDistribution['excellent'] > (qualityDistribution['good'] || 0)) {
            return "✅ Excellent quality production! Maintain current standards and practices.";
        }
        return "Good production levels. Focus on quality improvement and mortality reduction.";
    },

    getSalesInsights(salesCount, totalSales) {
        if (salesCount === 0) return "No sales recorded yet. Focus on marketing and customer acquisition.";
        if (totalSales < 1000) return "Sales are starting. Consider expanding product offerings and marketing efforts.";
        if (totalSales > 5000) return "Strong sales performance! Consider scaling operations and exploring new markets.";
        return "Steady sales performance. Continue current strategies and monitor customer feedback.";
    },

    getHealthRecommendations(mortalityRate, causeBreakdown) {
        if (mortalityRate > 10) return "⚠️ High mortality rate detected! Immediate veterinary consultation recommended.";
        if (mortalityRate > 5) return "Monitor flock health closely. Review feeding, housing, and environmental conditions.";
        if (causeBreakdown.disease > 0) return "Disease cases detected. Implement biosecurity measures and consider vaccination.";
        return "✅ Good flock health. Maintain current management practices and regular monitoring.";
    },

    calculateFarmScore(stats) {
        let score = 50;
        
        // Profit contribution
        if (stats.netProfit > 0) score += 20;
        else score -= 20;
        
        // Production contribution
        if (stats.totalProduction > 1000) score += 15;
        else if (stats.totalProduction > 500) score += 10;
        
        // Inventory health
        if (stats.lowStockItems === 0) score += 15;
        else score -= stats.lowStockItems * 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    },

    getFarmStatus(stats) {
        const score = this.calculateFarmScore(stats);
        
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    },

    getFarmStatusColor(stats) {
        const score = this.calculateFarmScore(stats);
        
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#3b82f6';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    },

    getOverallAssessment(stats) {
        const score = this.calculateFarmScore(stats);
        
        if (score >= 80) {
            return "Your farm is performing exceptionally well! Strong financial results, good production levels, and healthy inventory management. Consider expansion opportunities and continue current best practices.";
        } else if (score >= 60) {
            return "Good overall performance with room for improvement. Focus on increasing profitability and reducing low stock items. Maintain current production levels and monitor trends closely.";
        } else if (score >= 40) {
            return "Farm performance is fair. Review financial operations, improve inventory management, and consider consulting with agricultural experts. There's significant potential for improvement.";
        } else {
            return "Immediate attention required. Review all aspects of farm operations including finances, production, and inventory. Consider consulting with farm management experts to develop a turnaround strategy.";
        }
    }
};

// ==================== REGISTRATION ====================
console.log('📊 Reports module loaded successfully with Data Broadcaster integration!');

// Register the module with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered successfully!');
    
    // ✅ Broadcast module loaded
    if (window.Broadcaster) {
        window.Broadcaster.broadcast('module-loaded', {
            module: 'reports',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            hasBroadcaster: true
        });
    }
} else {
    console.error('❌ FarmModules framework not found!');
    const checkFarmModules = setInterval(() => {
        if (window.FarmModules) {
            window.FarmModules.registerModule('reports', ReportsModule);
            console.log('✅ Reports module registered (delayed)!');
            clearInterval(checkFarmModules);
        }
    }, 100);
}

// ==================== UNIVERSAL REGISTRATION ====================

(function() {
    const MODULE_NAME = 'reports.js'; // e.g., 'dashboard'
    const MODULE_OBJECT = ReportsModule; // e.g., DashboardModule
    
    console.log(`📦 Registering ${MODULE_NAME} module...`);
    
    if (window.FarmModules) {
        FarmModules.registerModule(MODULE_NAME, MODULE_OBJECT);
        console.log(`✅ ${MODULE_NAME} module registered successfully!`);
    } else {
        console.error('❌ FarmModules framework not found');
    }
})();
