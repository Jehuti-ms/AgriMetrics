// modules/reports.js - UPDATED WITH DATA BROADCASTER INTEGRATION
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

    // ✅ ADDED: Load jsPDF from CDN
// In reports.js, update or remove loadJSPDF()
/* loadJSPDF() {
    return new Promise((resolve, reject) => {
        // jsPDF should already be loaded from HTML
        if (typeof jspdf !== 'undefined') {
            this.pdfReady = true;
            resolve();
        } else {
            console.error('jsPDF not loaded. Check index.html');
            reject(new Error('jsPDF library not available'));
        }
    });
}, */
    
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
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Report Categories Grid -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">💰</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🚜</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sales Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🐔</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Health Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🌾</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Feed Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report" style="width: 100%;">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
                        <div class="report-icon" style="font-size: 48px; margin-bottom: 16px;">🏆</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Comprehensive Farm Report</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report" style="width: 100%; background: linear-gradient(135deg, #22c55e, #3b82f6);">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden" style="margin-top: 32px;">
                    <div class="output-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report Output</h3>
                        <div style="display: flex; gap: 12px;">
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
                    <div class="output-content" style="padding: 24px;">
                        <div id="report-content">
                            <!-- Report content will be generated here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card" style="padding: 24px; margin-top: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Recent Farm Activity</h3>
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
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;" id="total-expenses">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};" id="net-profit">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Birds</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);" id="total-birds">${stats.totalBirds}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);" id="total-production">${stats.totalProduction}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Low Stock Items</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e'};" id="low-stock-items">${stats.lowStockItems}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Feed Used</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);" id="total-feed-used">${stats.totalFeedUsed} kg</div>
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
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">No recent activity</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Start using the app to see activity here</div>
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.map(activity => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px;">${activity.icon}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--text-primary);">${activity.description}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">${activity.date}</div>
                            </div>
                        </div>
                        ${activity.amount !== null ? `
                            <div style="font-weight: bold; color: var(--text-primary);">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${incomeTransactions.map(transaction => `
                            <div class="metric-row">
                                <span class="metric-label">${transaction.description}</span>
                                <span class="metric-value income">${this.formatCurrency(transaction.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No income records found</p>'}
            </div>

            <div class="report-section">
                <h4>📉 Expense Breakdown</h4>
                ${expenseTransactions.length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${expenseTransactions.map(transaction => `
                            <div class="metric-row">
                                <span class="metric-label">${transaction.description}</span>
                                <span class="metric-value expense">${this.formatCurrency(transaction.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No expense records found</p>'}
            </div>

            <div class="report-section">
                <h4>📈 Sales Revenue</h4>
                ${sales.length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${sales.map(sale => `
                            <div class="metric-row">
                                <span class="metric-label">Sale ${sale.date}</span>
                                <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No sales records found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Financial Insights</h4>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: var(--text-primary);">
                        ${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1)); border-radius: 12px;">
                    <h4 style="margin-bottom: 8px; color: var(--text-primary);">Recommendations</h4>
                    <div style="color: var(--text-secondary); font-size: 14px;">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${Object.entries(productGroups).map(([product, data]) => `
                            <div class="metric-row">
                                <span class="metric-label">${this.formatProductName(product)}</span>
                                <span class="metric-value">${data.total} units</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No production records found</p>'}
            </div>

            <div class="report-section">
                <h4>⭐ Quality Distribution</h4>
                <div style="max-height: 300px; overflow-y: auto;">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${production.slice(-5).reverse().map(record => `
                            <div class="metric-row">
                                <span class="metric-label">${record.date}: ${this.formatProductName(record.product)}</span>
                                <span class="metric-value">${record.quantity} ${record.unit || 'units'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent production records</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Production Insights</h4>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; color: var(--text-primary);">
                        ${this.getProductionInsights(totalProduction, 0, qualityDistribution)}
                    </p>
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${lowStockItems.map(item => `
                            <div class="metric-row">
                                <span class="metric-label">${item.name}</span>
                                <span class="metric-value warning">${item.currentStock} / ${item.minStock}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No low stock items 👍</p>'}
            </div>

            <div class="report-section">
                <h4>📦 Complete Inventory List</h4>
                ${inventory.length > 0 ? `
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${inventory.map(item => `
                            <div class="metric-row">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: var(--text-primary);">${item.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${item.category || 'Uncategorized'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${item.currentStock} ${item.unit || 'units'}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Value: ${this.formatCurrency(item.currentStock * (item.unitCost || 0))}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No inventory items found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Inventory Management Insights</h4>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: var(--text-primary);">
                        ${lowStockItems.length > 0 
                            ? `⚠️ Attention needed for ${lowStockItems.length} low stock items. Consider reordering soon.`
                            : '✅ Inventory levels are healthy. Maintain current stock levels.'}
                    </p>
                </div>
                <div style="margin-top: 12px; color: var(--text-secondary); font-size: 14px;">
                    <p>Recommendations:</p>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${Object.entries(monthlySales).map(([month, data]) => `
                            <div class="metric-row">
                                <span class="metric-label">${month}</span>
                                <span class="metric-value income">${this.formatCurrency(data.total)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No sales data by month</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Sales</h4>
                ${sales.slice(-5).length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${sales.slice(-5).reverse().map(sale => `
                            <div class="metric-row">
                                <span class="metric-label">${sale.date}</span>
                                <span class="metric-value income">${this.formatCurrency(sale.totalAmount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent sales found</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Sales Insights</h4>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: var(--text-primary);">
                        ${this.getSalesInsights(sales.length, totalSales)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1)); border-radius: 12px;">
                    <h4 style="margin-bottom: 8px; color: var(--text-primary);">Sales Strategies</h4>
                    <div style="color: var(--text-secondary); font-size: 14px;">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${Object.entries(causeBreakdown).map(([cause, count]) => `
                            <div class="metric-row">
                                <span class="metric-label">${this.formatCause(cause)}</span>
                                <span class="metric-value">${count} birds</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No cause data available</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Health Records</h4>
                ${mortalityRecords.slice(-5).length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${mortalityRecords.slice(-5).reverse().map(record => `
                            <div class="metric-row">
                                <span class="metric-label">${record.date}: ${this.formatCause(record.cause)}</span>
                                <span class="metric-value">${record.quantity} birds</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent health records</p>'}
            </div>

            <div class="report-section">
                <h4>💡 Health Insights</h4>
                <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; color: var(--text-primary);">
                        ${this.getHealthRecommendations(mortalityRate, causeBreakdown)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1)); border-radius: 12px;">
                    <h4 style="margin-bottom: 8px; color: var(--text-primary);">Prevention Strategies</h4>
                    <div style="color: var(--text-secondary); font-size: 14px;">
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
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${Object.entries(feedTypeBreakdown).map(([feedType, data]) => `
                            <div class="metric-row">
                                <span class="metric-label">${this.formatFeedType(feedType)}</span>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${data.quantity} kg</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Cost: ${this.formatCurrency(data.cost)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No feed type data available</p>'}
            </div>

            <div class="report-section">
                <h4>📋 Recent Feed Records</h4>
                ${feedRecords.slice(-5).length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${feedRecords.slice(-5).reverse().map(record => `
                            <div class="metric-row">
                                <span class="metric-label">${record.date}: ${this.formatFeedType(record.feedType)}</span>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${record.quantity} kg</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${this.formatCurrency(record.cost)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent feed records</p>'}
            </div>

            <div class="report-section">
                <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(34, 197, 94, 0.1)); border-radius: 12px;">
                    <h4 style="margin-bottom: 8px; color: var(--text-primary);">Feed Management Insights</h4>
                    <div style="color: var(--text-secondary); font-size: 14px;">
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
            <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="color: var(--text-primary); margin-bottom: 8px;">Farm Comprehensive Report</h2>
                <p style="color: var(--text-secondary);">Generated on ${formattedDate}</p>
                <div style="margin: 24px 0; padding: 20px; background: var(--glass-bg); border-radius: 16px; border: 2px solid ${farmStatusColor};">
                    <div style="font-size: 48px; font-weight: bold; color: ${farmStatusColor}; margin-bottom: 8px;">
                        ${farmScore}/100
                    </div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin-bottom: 8px;">
                        ${farmStatus}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 14px;">
                        Overall Farm Performance Score
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Executive Summary</h4>
                <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; margin: 16px 0;">
                    <p style="color: var(--text-primary); margin: 0; line-height: 1.6;">
                        ${this.getOverallAssessment(stats)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <h4>🏆 Farm Performance Metrics</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Financial Score</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${stats.netProfit >= 0 ? 'Good' : 'Needs Review'}</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production Score</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${stats.totalProduction > 500 ? '#22c55e' : '#f59e0b'};">${stats.totalProduction > 500 ? 'Good' : 'Fair'}</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Inventory Score</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${stats.lowStockItems === 0 ? '#22c55e' : '#f59e0b'};">${stats.lowStockItems === 0 ? 'Good' : 'Needs Attention'}</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Health Score</div>
                        <div style="font-size: 24px; font-weight: bold; color: '#3b82f6';">Monitored</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Key Statistics</h4>
                <div style="max-height: 300px; overflow-y: auto;">
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
                <div style="background: var(--glass-bg); padding: 20px; border-radius: 12px; margin: 16px 0;">
                    <ul style="margin: 0; padding-left: 20px; color: var(--text-primary);">
                        ${stats.netProfit < 0 ? '<li style="margin-bottom: 8px;"><strong>🔴 High Priority:</strong> Address negative profitability immediately</li>' : ''}
                        ${stats.lowStockItems > 0 ? '<li style="margin-bottom: 8px;"><strong>🟡 Medium Priority:</strong> Replenish low stock inventory items</li>' : ''}
                        <li style="margin-bottom: 8px;"><strong>🟢 Ongoing:</strong> Maintain production quality standards</li>
                        <li><strong>🟢 Ongoing:</strong> Continue regular health monitoring</li>
                    </ul>
                </div>
            </div>

            <div class="report-section">
                <h4>📅 Next Quarter Goals</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;">
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Revenue Target</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${this.formatCurrency(stats.totalRevenue * 1.1)}</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production Goal</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${Math.round(stats.totalProduction * 1.05)} units</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Cost Reduction</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">5% Target</div>
                    </div>
                    <div style="background: var(--glass-bg); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Farm Score Goal</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">${Math.min(100, farmScore + 10)}/100</div>
                    </div>
                </div>
            </div>

            <div style="text-align: center; padding-top: 24px; border-top: 2px solid var(--glass-border); margin-top: 32px;">
                <p style="color: var(--text-secondary); font-size: 12px;">
                    Report ID: FARM-COMP-${Date.now().toString().slice(-8)}<br>
                    Generated by Farm Management System<br>
                    © ${currentDate.getFullYear()} All rights reserved
                </p>
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
    const reportActions = document.querySelector('.output-header > div');
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
        
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
                <head>
                    <title>${this.currentReport.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        .section { margin-bottom: 30px; }
                        .metric-row { display: flex; justify-content: space-between; padding: 5px 0; }
                        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <h1>${this.currentReport.title}</h1>
                    <div>Generated on: ${new Date().toLocaleString()}</div>
                    <div>Report ID: FARM-${Date.now().toString().slice(-8)}</div>
                    <hr>
                    ${this.currentReport.content}
                    <div class="footer">
                        <p>Confidential Farm Report - Generated by Farm Management System</p>
                        <p>© ${new Date().getFullYear()} All rights reserved</p>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        // ✅ Broadcast report printed
        if (this.broadcaster) {
            this.broadcastReportExported(this.currentReport.type, 'print');
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

    // ✅ ADDED: Generate Financial PDF Report
async generateFinancialPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const netProfit = totalIncome + totalSalesRevenue - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / (totalIncome + totalSalesRevenue)) * 100 : 0;
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('FINANCIAL REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Financial Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Income:', this.formatCurrency(totalIncome), 'income'],
            ['Sales Revenue:', this.formatCurrency(totalSalesRevenue), 'income'],
            ['Total Expenses:', this.formatCurrency(totalExpenses), 'expense'],
            ['Net Profit:', this.formatCurrency(netProfit), netProfit >= 0 ? 'profit' : 'expense'],
            ['Profit Margin:', `${profitMargin.toFixed(1)}%`, profitMargin >= 0 ? 'profit' : 'expense']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            if (type === 'income' || type === 'profit') {
                doc.setTextColor(46, 125, 50); // Green
            } else if (type === 'expense') {
                doc.setTextColor(220, 38, 38); // Red
            } else {
                doc.setTextColor(0, 0, 0); // Black
            }
            
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Income Breakdown
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Income Breakdown', 20, yPos);
        yPos += 10;
        
        if (incomeTransactions.length > 0) {
            doc.setFontSize(10);
            incomeTransactions.forEach((transaction, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setTextColor(46, 125, 50);
                doc.text(transaction.description || 'Unnamed', 25, yPos);
                doc.text(this.formatCurrency(transaction.amount), 180, yPos, { align: 'right' });
                yPos += 6;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No income records', 25, yPos);
            yPos += 6;
        }
        
        // Expense Breakdown
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Expense Breakdown', 20, yPos);
        yPos += 10;
        
        if (expenseTransactions.length > 0) {
            doc.setFontSize(10);
            expenseTransactions.forEach((transaction, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setTextColor(220, 38, 38);
                doc.text(transaction.description || 'Unnamed', 25, yPos);
                doc.text(this.formatCurrency(transaction.amount), 180, yPos, { align: 'right' });
                yPos += 6;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No expense records', 25, yPos);
            yPos += 6;
        }
        
        // Financial Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Financial Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const insights = this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)
            .split('.').filter(i => i.trim());
        
        insights.forEach(insight => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`• ${insight.trim()}.`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Financial Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Financial PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate Comprehensive PDF Report
async generateComprehensivePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get all data
        const stats = this.getFarmStats();
        const farmScore = this.calculateFarmScore(stats);
        const farmStatus = this.getFarmStatus(stats);
        const farmStatusColor = this.getFarmStatusColor(stats);
        
        // Convert RGB to PDF color
        const getPDFColor = (rgb) => {
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return [r, g, b];
        };
        
        // Cover Page
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setFontSize(36);
        doc.setTextColor(46, 125, 50);
        doc.text('FARM COMPREHENSIVE', 105, 80, { align: 'center' });
        doc.text('REPORT', 105, 95, { align: 'center' });
        
        doc.setFontSize(20);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 120, { align: 'center' });
        
        // Farm Score Circle
        doc.setLineWidth(2);
        doc.setDrawColor(...getPDFColor(farmStatusColor));
        doc.circle(105, 170, 30, 'D');
        
        doc.setFontSize(24);
        doc.setTextColor(...getPDFColor(farmStatusColor));
        doc.text(farmScore.toString(), 105, 172, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('/100', 105, 185, { align: 'center' });
        doc.text(farmStatus, 105, 200, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 230, { align: 'center' });
        doc.text('Confidential Document', 105, 240, { align: 'center' });
        
        // Page 2: Executive Summary
        doc.addPage();
        let yPos = 20;
        
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text('Executive Summary', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const assessment = this.getOverallAssessment(stats);
        const lines = doc.splitTextToSize(assessment, 170);
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 7) + 10;
        
        // Key Metrics
        doc.setFontSize(16);
        doc.setTextColor(46, 125, 50);
        doc.text('Key Performance Metrics', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const metrics = [
            ['Total Revenue:', this.formatCurrency(stats.totalRevenue), 'income'],
            ['Net Profit:', this.formatCurrency(stats.netProfit), stats.netProfit >= 0 ? 'profit' : 'expense'],
            ['Total Birds:', stats.totalBirds.toString(), 'neutral'],
            ['Total Production:', `${stats.totalProduction} units`, 'neutral'],
            ['Low Stock Items:', stats.lowStockItems.toString(), stats.lowStockItems > 0 ? 'warning' : 'neutral'],
            ['Feed Used:', `${stats.totalFeedUsed} kg`, 'neutral']
        ];
        
        metrics.forEach(([label, value, type]) => {
            if (type === 'income' || type === 'profit') {
                doc.setTextColor(46, 125, 50);
            } else if (type === 'expense' || type === 'warning') {
                doc.setTextColor(220, 38, 38);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            
            doc.text(label, 25, yPos);
            doc.text(value, 180, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Page 3: Performance Analysis
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text('Performance Analysis', 20, yPos);
        yPos += 15;
        
        // Financial Performance
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Financial Performance', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const financialData = stats.netProfit >= 0 ? 
            `✅ Operating profitably with ${this.formatCurrency(stats.netProfit)} net profit.` :
            `⚠️ Operating at a loss of ${this.formatCurrency(Math.abs(stats.netProfit))}.`;
        
        const financialLines = doc.splitTextToSize(financialData, 170);
        doc.text(financialLines, 25, yPos);
        yPos += (financialLines.length * 7) + 10;
        
        // Production Performance
        doc.setFontSize(14);
        doc.text('Production Performance', 20, yPos);
        yPos += 10;
        
        const productionData = stats.totalProduction > 500 ?
            `✅ Strong production output of ${stats.totalProduction} units.` :
            `📈 Production at ${stats.totalProduction} units, room for growth.`;
        
        const productionLines = doc.splitTextToSize(productionData, 170);
        doc.text(productionLines, 25, yPos);
        yPos += (productionLines.length * 7) + 10;
        
        // Inventory Status
        doc.setFontSize(14);
        doc.text('Inventory Status', 20, yPos);
        yPos += 10;
        
        const inventoryData = stats.lowStockItems === 0 ?
            `✅ All inventory items are adequately stocked.` :
            `⚠️ ${stats.lowStockItems} items are below minimum stock levels.`;
        
        const inventoryLines = doc.splitTextToSize(inventoryData, 170);
        doc.text(inventoryLines, 25, yPos);
        yPos += (inventoryLines.length * 7) + 10;
        
        // Page 4: Recommendations
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text('Strategic Recommendations', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        const recommendations = [
            stats.netProfit < 0 ? '1. Review expenses and explore new revenue streams to achieve profitability.' : '1. Maintain current financial discipline and explore expansion opportunities.',
            stats.totalProduction < 1000 ? '2. Implement production optimization strategies to increase output.' : '2. Maintain production quality and consider scaling operations.',
            stats.lowStockItems > 0 ? '3. Reorder low stock items and implement automated inventory alerts.' : '3. Continue regular inventory monitoring and maintain optimal stock levels.',
            '4. Schedule regular veterinary consultations for flock health management.',
            '5. Analyze feed efficiency and consider bulk purchasing for cost savings.'
        ];
        
        recommendations.forEach(rec => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            const lines = doc.splitTextToSize(rec, 170);
            doc.text(lines, 25, yPos);
            yPos += (lines.length * 7) + 5;
        });
        
        // Page 5: Next Quarter Goals
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text('Next Quarter Goals', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(11);
        const goals = [
            [`Revenue Target:`, this.formatCurrency(stats.totalRevenue * 1.1)],
            [`Production Goal:`, `${Math.round(stats.totalProduction * 1.05)} units`],
            [`Cost Reduction:`, `5% target`],
            [`Farm Score Goal:`, `${Math.min(100, farmScore + 10)}/100`],
            [`Low Stock Items:`, `${Math.max(0, stats.lowStockItems - 3)} maximum`]
        ];
        
        goals.forEach(([label, value]) => {
            doc.setTextColor(0, 0, 0);
            doc.text(label, 25, yPos);
            doc.setTextColor(46, 125, 50);
            doc.text(value, 180, yPos, { align: 'right' });
            yPos += 8;
        });
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('These goals are based on current performance and industry benchmarks.', 20, yPos);
        
        // Footer on all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
            doc.text('Farm Comprehensive Report', 20, 290);
            doc.text(`Score: ${farmScore}/100`, 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Farm_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Comprehensive PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate other report PDFs (similar pattern)
async generateInventoryPDF() {
    try {
        // You can adapt your existing inventory PDF code here
        // or create a simplified version
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // ... inventory PDF generation code similar to profile module
        
        const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generic PDF for other report types
// ✅ ADDED: Generate Generic PDF for other report types
async generateGenericPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text(this.currentReport.title.toUpperCase(), 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Convert HTML content to text for PDF
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.currentReport.content;
        
        // Remove unnecessary elements
        const unwantedElements = tempDiv.querySelectorAll('style, script, .btn, button');
        unwantedElements.forEach(el => el.remove());
        
        // Get text content
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Start content
        let yPos = 50;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        // Split text into lines that fit PDF width
        const lines = doc.splitTextToSize(textContent, 170);
        
        for (let line of lines) {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            // Handle bullet points and formatting
            if (line.includes('•') || line.trim().match(/^\d+\./)) {
                doc.setFont(undefined, 'bold');
                doc.text(line, 20, yPos);
                doc.setFont(undefined, 'normal');
            } else if (line.includes(':')) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    doc.setFont(undefined, 'bold');
                    doc.text(parts[0] + ':', 20, yPos);
                    doc.setFont(undefined, 'normal');
                    doc.text(parts.slice(1).join(':'), 20 + doc.getTextWidth(parts[0] + ': ') + 5, yPos);
                } else {
                    doc.text(line, 20, yPos);
                }
            } else {
                doc.text(line, 20, yPos);
            }
            
            yPos += 7;
        }
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Farm Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `${this.currentReport.type}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Generic PDF error:', error);
        return { success: false, error: error.message };
    }
},

    // ==================== PDF GENERATION METHODS ====================

// ✅ ADDED: Generate Production PDF Report
async generateProductionPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const totalProduction = production.reduce((sum, record) => sum + (record.quantity || 0), 0);
        
        // Group by product
        const productGroups = {};
        production.forEach(record => {
            const product = record.product || 'Unknown';
            if (!productGroups[product]) {
                productGroups[product] = {
                    total: 0,
                    records: []
                };
            }
            productGroups[product].total += record.quantity || 0;
            productGroups[product].records.push(record);
        });
        
        // Quality distribution
        const qualityDistribution = { excellent: 0, good: 0, poor: 0, unknown: 0 };
        production.forEach(record => {
            const quality = record.quality || 'unknown';
            qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1;
        });
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('PRODUCTION REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Production Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Production:', `${totalProduction} units`, 'neutral'],
            ['Production Records:', production.length.toString(), 'neutral'],
            ['Products Tracked:', Object.keys(productGroups).length.toString(), 'neutral'],
            ['Average Daily:', `${production.length > 0 ? Math.round(totalProduction / production.length) : 0} units`, 'neutral']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            doc.setTextColor(0, 0, 0);
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Quality Distribution
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Quality Distribution', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        Object.entries(qualityDistribution).forEach(([quality, count]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            // Color code quality
            if (quality === 'excellent') doc.setTextColor(34, 197, 94); // Green
            else if (quality === 'good') doc.setTextColor(59, 130, 246); // Blue
            else if (quality === 'poor') doc.setTextColor(239, 68, 68); // Red
            else doc.setTextColor(100, 100, 100); // Gray
            
            const qualityLabel = quality.charAt(0).toUpperCase() + quality.slice(1);
            doc.text(qualityLabel, 25, yPos);
            doc.text(count.toString(), 180, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Product Breakdown
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Product Breakdown', 20, yPos);
        yPos += 10;
        
        if (Object.keys(productGroups).length > 0) {
            doc.setFontSize(11);
            Object.entries(productGroups).forEach(([product, data]) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setTextColor(46, 125, 50);
                doc.text(this.formatProductName(product), 25, yPos);
                doc.setTextColor(0, 0, 0);
                doc.text(`${data.total} units`, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No product data available', 25, yPos);
            yPos += 8;
        }
        
        // Recent Production
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recent Production Records', 20, yPos);
        yPos += 10;
        
        if (production.slice(-5).length > 0) {
            doc.setFontSize(10);
            production.slice(-5).reverse().forEach(record => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const date = record.date ? new Date(record.date).toLocaleDateString() : 'Unknown date';
                const productName = this.formatProductName(record.product);
                const quantity = `${record.quantity || 0} ${record.unit || 'units'}`;
                
                doc.text(`${date}: ${productName}`, 25, yPos);
                doc.text(quantity, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No recent production records', 25, yPos);
            yPos += 8;
        }
        
        // Production Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Production Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const insights = this.getProductionInsights(totalProduction, 0, qualityDistribution)
            .split('.').filter(i => i.trim());
        
        insights.forEach(insight => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(59, 130, 246);
            doc.text(`• ${insight.trim()}.`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Production Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Production_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Production PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate Sales PDF Report
async generateSalesPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const averageSale = sales.length > 0 ? totalSales / sales.length : 0;
        
        // Group by month
        const monthlySales = {};
        sales.forEach(sale => {
            const date = new Date(sale.date || sale.createdAt || Date.now());
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!monthlySales[monthYear]) {
                monthlySales[monthYear] = {
                    total: 0,
                    count: 0,
                    sales: []
                };
            }
            monthlySales[monthYear].total += sale.totalAmount || 0;
            monthlySales[monthYear].count += 1;
            monthlySales[monthYear].sales.push(sale);
        });
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('SALES REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Sales Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Revenue:', this.formatCurrency(totalSales), 'income'],
            ['Number of Sales:', sales.length.toString(), 'neutral'],
            ['Average Sale:', this.formatCurrency(averageSale), 'income'],
            ['Months Tracked:', Object.keys(monthlySales).length.toString(), 'neutral']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            if (type === 'income') {
                doc.setTextColor(46, 125, 50);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Monthly Sales Trend
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Monthly Sales Trend', 20, yPos);
        yPos += 10;
        
        if (Object.keys(monthlySales).length > 0) {
            doc.setFontSize(11);
            Object.entries(monthlySales).sort().forEach(([month, data]) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const [year, monthNum] = month.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = monthNames[parseInt(monthNum) - 1];
                
                doc.setTextColor(0, 0, 0);
                doc.text(`${monthName} ${year}`, 25, yPos);
                doc.setTextColor(46, 125, 50);
                doc.text(this.formatCurrency(data.total), 180, yPos, { align: 'right' });
                
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`(${data.count} sales)`, 180, yPos + 4, { align: 'right' });
                doc.setFontSize(11);
                
                yPos += 12;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No monthly sales data', 25, yPos);
            yPos += 8;
        }
        
        // Recent Sales
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recent Sales', 20, yPos);
        yPos += 10;
        
        if (sales.slice(-5).length > 0) {
            doc.setFontSize(10);
            sales.slice(-5).reverse().forEach(sale => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const date = sale.date ? new Date(sale.date).toLocaleDateString() : 'Unknown date';
                const customer = sale.customerName || 'Walk-in Customer';
                const amount = this.formatCurrency(sale.totalAmount || 0);
                
                doc.text(`${date}: ${customer}`, 25, yPos);
                doc.setTextColor(46, 125, 50);
                doc.text(amount, 180, yPos, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No recent sales', 25, yPos);
            yPos += 8;
        }
        
        // Sales Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Sales Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const insights = this.getSalesInsights(sales.length, totalSales)
            .split('.').filter(i => i.trim());
        
        insights.forEach(insight => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(59, 130, 246);
            doc.text(`• ${insight.trim()}.`, 25, yPos);
            yPos += 6;
        });
        
        // Recommendations
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Sales Strategies', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const strategies = [
            sales.length < 10 ? 'Focus on increasing sales volume through targeted marketing.' : 'Expand customer base and explore bulk sales opportunities.',
            averageSale < 100 ? 'Bundle products to increase average sale value and customer spend.' : 'Maintain product quality and strengthen customer relationships.',
            'Analyze monthly trends to plan for seasonal demand fluctuations.',
            'Implement customer loyalty programs to encourage repeat business.'
        ];
        
        strategies.forEach(strategy => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(46, 125, 50);
            doc.text(`• ${strategy}`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Sales Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Sales PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate Inventory PDF Report
async generateInventoryPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const lowStockThreshold = 10; // Default threshold
        const lowStockItems = inventory.filter(item => (item.quantity || 0) <= lowStockThreshold);
        const outOfStockItems = inventory.filter(item => (item.quantity || 0) === 0);
        
        const totalValue = inventory.reduce((sum, item) => {
            return sum + ((item.quantity || 0) * (parseFloat(item.price) || 0));
        }, 0);
        
        // Group by category
        const categoryGroups = {};
        inventory.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!categoryGroups[category]) {
                categoryGroups[category] = {
                    items: [],
                    totalValue: 0,
                    totalQuantity: 0
                };
            }
            categoryGroups[category].items.push(item);
            categoryGroups[category].totalValue += (item.quantity || 0) * (parseFloat(item.price) || 0);
            categoryGroups[category].totalQuantity += item.quantity || 0;
        });
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('INVENTORY REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Inventory Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Items:', inventory.length.toString(), 'neutral'],
            ['Total Value:', this.formatCurrency(totalValue), 'income'],
            ['Low Stock Items:', lowStockItems.length.toString(), lowStockItems.length > 0 ? 'warning' : 'neutral'],
            ['Out of Stock:', outOfStockItems.length.toString(), outOfStockItems.length > 0 ? 'warning' : 'neutral'],
            ['Categories:', Object.keys(categoryGroups).length.toString(), 'neutral']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            if (type === 'income') {
                doc.setTextColor(46, 125, 50);
            } else if (type === 'warning') {
                doc.setTextColor(239, 68, 68);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Low Stock Warning
        if (lowStockItems.length > 0) {
            yPos += 10;
            doc.setFontSize(14);
            doc.setTextColor(239, 68, 68);
            doc.text('⚠️ Low Stock Items', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            lowStockItems.forEach(item => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const currentStock = item.quantity || 0;
                const minStock = item.minStock || lowStockThreshold;
                
                doc.setTextColor(239, 68, 68);
                doc.text(item.name || 'Unnamed Item', 25, yPos);
                doc.text(`${currentStock} / ${minStock}`, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        }
        
        // Category Breakdown
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Category Breakdown', 20, yPos);
        yPos += 10;
        
        if (Object.keys(categoryGroups).length > 0) {
            doc.setFontSize(11);
            Object.entries(categoryGroups).forEach(([category, data]) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setTextColor(46, 125, 50);
                doc.text(this.formatCategory(category), 25, yPos);
                doc.setTextColor(0, 0, 0);
                doc.text(`${data.items.length} items`, 120, yPos);
                doc.text(this.formatCurrency(data.totalValue), 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No category data', 25, yPos);
            yPos += 8;
        }
        
        // Complete Inventory List
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Complete Inventory List', 20, yPos);
        yPos += 10;
        
        if (inventory.length > 0) {
            // Create table headers
            const startY = yPos;
            const headers = [['Item', 'Category', 'Qty', 'Unit Price', 'Total Value', 'Status']];
            
            // Prepare table data
            const tableData = inventory.map(item => {
                const quantity = item.quantity || 0;
                const unitPrice = parseFloat(item.price) || 0;
                const totalValue = quantity * unitPrice;
                
                let status = 'Normal';
                if (quantity === 0) status = 'Out of Stock';
                else if (quantity <= lowStockThreshold) status = 'Low Stock';
                
                return [
                    item.name || 'Unnamed',
                    this.formatCategory(item.category || 'Uncategorized'),
                    quantity.toString(),
                    this.formatCurrency(unitPrice),
                    this.formatCurrency(totalValue),
                    status
                ];
            });
            
            // Use autoTable if available
            if (typeof doc.autoTable !== 'undefined') {
                doc.autoTable({
                    startY: startY,
                    head: headers,
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 25 },
                        4: { cellWidth: 25 },
                        5: { cellWidth: 30 }
                    }
                });
                
                // Update yPos based on autoTable
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                // Manual table if autoTable not available
                doc.setFontSize(9);
                tableData.forEach((row, index) => {
                    if (yPos > 250) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Status color coding
                    if (row[5] === 'Out of Stock') doc.setTextColor(239, 68, 68);
                    else if (row[5] === 'Low Stock') doc.setTextColor(245, 158, 11);
                    else doc.setTextColor(0, 0, 0);
                    
                    doc.text(row[0], 20, yPos);
                    doc.text(row[1], 70, yPos);
                    doc.text(row[2], 110, yPos);
                    doc.text(row[3], 130, yPos);
                    doc.text(row[4], 160, yPos);
                    doc.text(row[5], 190, yPos, { align: 'right' });
                    yPos += 6;
                });
            }
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No inventory items', 25, yPos);
            yPos += 8;
        }
        
        // Inventory Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Inventory Management Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const insights = lowStockItems.length > 0 
            ? `⚠️ Attention needed for ${lowStockItems.length} low stock items. Consider reordering soon to avoid stockouts.`
            : '✅ Inventory levels are healthy. Maintain current stock levels and continue regular monitoring.';
        
        const insightLines = doc.splitTextToSize(insights, 170);
        doc.setTextColor(59, 130, 246);
        doc.text(insightLines, 25, yPos);
        yPos += (insightLines.length * 6) + 10;
        
        // Recommendations
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Recommendations:', 20, yPos);
        yPos += 8;
        
        const recommendations = [
            lowStockItems.length > 0 ? '1. Place orders for low stock items immediately to prevent stockouts.' : '1. Continue regular inventory monitoring and maintain optimal stock levels.',
            '2. Set up automatic reorder alerts for critical inventory items.',
            '3. Review seasonal demand patterns for better inventory planning.',
            '4. Consider just-in-time inventory for non-essential items to reduce holding costs.',
            '5. Conduct regular inventory audits to ensure accuracy.'
        ];
        
        doc.setFontSize(10);
        recommendations.forEach(rec => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(46, 125, 50);
            doc.text(`• ${rec}`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Inventory Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Inventory PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate Health PDF Report
async generateHealthPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
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
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('HEALTH & MORTALITY REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Health Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Mortality:', `${totalMortality} birds`, mortalityRate > 5 ? 'warning' : 'neutral'],
            ['Mortality Rate:', `${mortalityRate.toFixed(2)}%`, mortalityRate > 5 ? 'warning' : 'neutral'],
            ['Current Flock Size:', `${totalBirds} birds`, 'neutral'],
            ['Health Records:', mortalityRecords.length.toString(), 'neutral']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            if (type === 'warning') {
                doc.setTextColor(239, 68, 68);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Cause Analysis
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Cause Analysis', 20, yPos);
        yPos += 10;
        
        if (Object.keys(causeBreakdown).length > 0) {
            doc.setFontSize(11);
            Object.entries(causeBreakdown).forEach(([cause, count]) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setTextColor(0, 0, 0);
                doc.text(this.formatCause(cause), 25, yPos);
                doc.text(`${count} birds`, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No cause data available', 25, yPos);
            yPos += 8;
        }
        
        // Recent Health Records
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recent Health Records', 20, yPos);
        yPos += 10;
        
        if (mortalityRecords.slice(-5).length > 0) {
            doc.setFontSize(10);
            mortalityRecords.slice(-5).reverse().forEach(record => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const date = record.date ? new Date(record.date).toLocaleDateString() : 'Unknown date';
                const cause = this.formatCause(record.cause);
                const quantity = `${record.quantity || 0} birds`;
                
                doc.text(`${date}: ${cause}`, 25, yPos);
                doc.text(quantity, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No recent health records', 25, yPos);
            yPos += 8;
        }
        
        // Health Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Health Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const insights = this.getHealthRecommendations(mortalityRate, causeBreakdown)
            .split('.').filter(i => i.trim());
        
        insights.forEach(insight => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(59, 130, 246);
            doc.text(`• ${insight.trim()}.`, 25, yPos);
            yPos += 6;
        });
        
        // Prevention Strategies
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Prevention Strategies', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const strategies = [
            mortalityRate > 5 ? 'Implement strict biosecurity measures and schedule regular veterinary health checks.' : 'Maintain current health monitoring protocols and biosecurity measures.',
            Object.keys(causeBreakdown).includes('disease') ? 'Schedule immediate veterinary consultations and implement vaccination programs for common diseases.' : 'Focus on preventive care through proper nutrition and environmental management.',
            'Monitor environmental conditions including temperature, ventilation, and cleanliness regularly.',
            'Keep detailed health records for early detection of health issues and trend analysis.',
            'Implement quarantine procedures for new birds and sick individuals.',
            'Train staff on proper handling techniques and early symptom recognition.'
        ];
        
        strategies.forEach(strategy => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(46, 125, 50);
            doc.text(`• ${strategy}`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Health Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Health_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Health PDF error:', error);
        return { success: false, error: error.message };
    }
},

// ✅ ADDED: Generate Feed PDF Report
async generateFeedPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get data
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
        const totalBirds = parseInt(localStorage.getItem('farm-current-stock') || '1000');
        const averageCostPerKg = totalFeedUsed > 0 ? totalFeedCost / totalFeedUsed : 0;
        
        // Group by feed type
        const feedTypeBreakdown = {};
        feedRecords.forEach(record => {
            const feedType = record.feedType || 'unknown';
            if (!feedTypeBreakdown[feedType]) {
                feedTypeBreakdown[feedType] = {
                    quantity: 0,
                    cost: 0,
                    records: []
                };
            }
            feedTypeBreakdown[feedType].quantity += record.quantity || 0;
            feedTypeBreakdown[feedType].cost += record.cost || 0;
            feedTypeBreakdown[feedType].records.push(record);
        });
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(46, 125, 50);
        doc.text('FEED CONSUMPTION REPORT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Farm Management System', 105, 30, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 37, { align: 'center' });
        
        // Summary Section
        let yPos = 50;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Feed Consumption Overview', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const summaryData = [
            ['Total Feed Used:', `${totalFeedUsed} kg`, 'neutral'],
            ['Total Feed Cost:', this.formatCurrency(totalFeedCost), 'expense'],
            ['Average Cost per Kg:', this.formatCurrency(averageCostPerKg), 'neutral'],
            ['Feed Records:', feedRecords.length.toString(), 'neutral'],
            ['Feed per Bird:', `${totalBirds > 0 ? (totalFeedUsed / totalBirds).toFixed(2) : 0} kg`, 'neutral']
        ];
        
        summaryData.forEach(([label, value, type]) => {
            if (type === 'expense') {
                doc.setTextColor(239, 68, 68);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(label, 20, yPos);
            doc.text(value, 150, yPos, { align: 'right' });
            yPos += 8;
        });
        
        // Feed Type Analysis
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Feed Type Analysis', 20, yPos);
        yPos += 10;
        
        if (Object.keys(feedTypeBreakdown).length > 0) {
            doc.setFontSize(11);
            Object.entries(feedTypeBreakdown).forEach(([feedType, data]) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setTextColor(0, 0, 0);
                doc.text(this.formatFeedType(feedType), 25, yPos);
                
                doc.setFontSize(10);
                doc.text(`${data.quantity} kg`, 120, yPos);
                doc.text(this.formatCurrency(data.cost), 180, yPos, { align: 'right' });
                
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                const avgCost = data.quantity > 0 ? this.formatCurrency(data.cost / data.quantity) : '$0.00';
                doc.text(`(${avgCost}/kg)`, 180, yPos + 4, { align: 'right' });
                
                doc.setFontSize(11);
                yPos += 12;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No feed type data available', 25, yPos);
            yPos += 8;
        }
        
        // Recent Feed Records
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recent Feed Records', 20, yPos);
        yPos += 10;
        
        if (feedRecords.slice(-5).length > 0) {
            doc.setFontSize(10);
            feedRecords.slice(-5).reverse().forEach(record => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const date = record.date ? new Date(record.date).toLocaleDateString() : 'Unknown date';
                const feedType = this.formatFeedType(record.feedType);
                const quantity = `${record.quantity || 0} kg`;
                const cost = this.formatCurrency(record.cost || 0);
                
                doc.text(`${date}: ${feedType}`, 25, yPos);
                doc.text(quantity, 120, yPos);
                doc.text(cost, 180, yPos, { align: 'right' });
                yPos += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.text('No recent feed records', 25, yPos);
            yPos += 8;
        }
        
        // Feed Management Insights
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Feed Management Insights', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const feedEfficiency = totalBirds > 0 ? totalFeedUsed / totalBirds : 0;
        const insights = [
            `Feed represents approximately ${totalFeedCost > 0 ? Math.round((totalFeedCost / (totalFeedCost + 1000)) * 100) : 0}% of operational costs.`,
            feedEfficiency > 0.1 ? 'Feed efficiency is within normal range for poultry operations.' : 'Monitor feed consumption rates to ensure optimal efficiency.',
            averageCostPerKg > 1.5 ? 'Feed costs are higher than industry average. Consider bulk purchasing or alternative suppliers.' : 'Feed costs are reasonable. Continue current purchasing strategy.',
            'Regularly assess feed conversion ratios to track efficiency improvements.'
        ];
        
        insights.forEach(insight => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(59, 130, 246);
            doc.text(`• ${insight}`, 25, yPos);
            yPos += 6;
        });
        
        // Recommendations
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Optimization Strategies', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        const strategies = [
            'Consider bulk purchasing for commonly used feed types to reduce per-unit costs.',
            'Track feed-to-weight conversion ratios weekly to identify efficiency opportunities.',
            'Implement feeding schedules based on bird age and production stage.',
            'Monitor feed wastage and implement measures to reduce spillage.',
            'Regularly compare feed prices from multiple suppliers.',
            'Consider formulating custom feed mixes for specific nutritional requirements.',
            'Implement feed storage best practices to prevent spoilage and contamination.'
        ];
        
        strategies.forEach(strategy => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(46, 125, 50);
            doc.text(`• ${strategy}`, 25, yPos);
            yPos += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential Feed Report', 20, 290);
            doc.text(new Date().toLocaleDateString(), 190, 290, { align: 'right' });
        }
        
        // Save PDF
        const fileName = `Feed_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName: fileName };
        
    } catch (error) {
        console.error('Feed PDF error:', error);
        return { success: false, error: error.message };
    }
},
    
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
