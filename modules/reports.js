// modules/reports.js - COMPLETE REWRITTEN VERSION
console.log('📊 Loading Reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,

    // ==================== INITIALIZATION ====================
    initialize() {
        console.log('📊 Initializing Reports module...');
        
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }

        // Register with StyleManager if available
        if (window.StyleManager) {
            window.StyleManager.registerModule(this.name, this.element, this);
        }

        this.renderModule();
        this.initialized = true;
        
        console.log('✅ Reports module initialized');
        return true;
    },

    onThemeChange(theme) {
        console.log(`Reports module updating for theme: ${theme}`);
    },

    // ==================== MAIN RENDER ====================
    renderModule() {
        if (!this.element) return;

        this.element.innerHTML = `
            <style>
                /* Reports Module Styles */
                .module-container {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .module-header {
                    margin-bottom: 32px;
                }
                
                .module-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                
                .module-subtitle {
                    font-size: 16px;
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                }
                
                .glass-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }
                
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                
                .report-type-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                }
                
                .report-type-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                }
                
                .report-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    width: 100%;
                }
                
                .btn-primary:hover {
                    background: var(--primary-color-dark);
                }
                
                .btn-outline {
                    background: transparent;
                    color: var(--text-primary);
                    border: 1px solid var(--glass-border);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .btn-outline:hover {
                    border-color: var(--primary-color);
                    background: var(--primary-color)10;
                }
                
                /* Report output styles */
                .hidden {
                    display: none !important;
                }
                
                .report-output {
                    max-height: 70vh;
                    overflow-y: auto;
                    margin-top: 32px;
                }
                
                .report-section {
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .report-section h4 {
                    color: var(--text-primary);
                    margin-bottom: 12px;
                    font-size: 18px;
                }
                
                .metric-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                
                .metric-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .metric-value {
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .income { color: #22c55e; }
                .expense { color: #ef4444; }
                .profit { color: #22c55e; }
                .warning { color: #f59e0b; }
                
                /* Export formats grid */
                .export-formats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .export-format-btn {
                    padding: 12px;
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    background: var(--glass-bg);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }
                
                .export-format-btn:hover {
                    border-color: var(--primary-color);
                    background: var(--primary-color)10;
                }
                
                .export-format-btn .icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                
                .export-format-btn .label {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                /* Popout modal styles */
                .popout-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                
                .popout-modal-content {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                
                .popout-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--glass-border);
                }
                
                .popout-modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .popout-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }
                
                .popout-modal-close:hover {
                    background: var(--glass-bg);
                }
                
                .popout-modal-body {
                    padding: 20px;
                }
                
                .popout-modal-footer {
                    padding: 20px;
                    border-top: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .form-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--glass-border);
                    border-radius: 6px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                
                /* Quick stats grid */
                .quick-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .quick-stat {
                    padding: 16px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                    text-align: center;
                }
                
                .quick-stat-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin: 8px 0 4px 0;
                }
                
                .quick-stat-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                /* Recent activity */
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--glass-bg);
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    margin-bottom: 8px;
                }
                
                .activity-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .activity-icon {
                    font-size: 20px;
                }
                
                .activity-details {
                    display: flex;
                    flex-direction: column;
                }
                
                .activity-description {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .activity-date {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .activity-amount {
                    font-weight: bold;
                    color: var(--text-primary);
                }
            </style>

            <div class="module-container">
                <!-- Module Header -->
                <div class="module-header">
                    <h1 class="module-title">Farm Reports & Analytics</h1>
                    <p class="module-subtitle">Comprehensive insights and analytics for your farm operations</p>
                </div>

                <!-- Quick Stats Overview -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 20px; font-size: 20px;">Quick Stats Overview</h3>
                    <div class="quick-stats-grid">
                        ${this.renderQuickStats()}
                    </div>
                </div>

                <!-- Report Categories -->
                <div class="reports-grid">
                    <!-- Financial Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">💰</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Financial Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Income, expenses, profit analysis and financial performance</p>
                            <button class="btn-primary generate-financial-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Production Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">🚜</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Production Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Egg production, poultry output, and productivity metrics</p>
                            <button class="btn-primary generate-production-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Inventory Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">📦</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Inventory Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Stock levels, consumption patterns, and reorder analysis</p>
                            <button class="btn-primary generate-inventory-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Sales Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">📊</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Sales Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Revenue, customer analysis, and sales performance</p>
                            <button class="btn-primary generate-sales-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Health & Mortality Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">🐔</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Health Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Mortality rates, health trends, and flock management</p>
                            <button class="btn-primary generate-health-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Feed Consumption Reports -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center;">
                        <div class="report-icon">🌾</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Feed Reports</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Feed usage, cost analysis, and consumption patterns</p>
                            <button class="btn-primary generate-feed-report">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Farm Report -->
                    <div class="report-type-card glass-card" style="padding: 24px; text-align: center; grid-column: 1 / -1;">
                        <div class="report-icon">🏆</div>
                        <div class="report-content">
                            <h3 style="color: var(--text-primary); margin-bottom: 8px;">Comprehensive Farm Report</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 16px;">Complete overview of all farm operations and performance metrics</p>
                            <button class="btn-primary generate-comprehensive-report" style="background: linear-gradient(135deg, #22c55e, #3b82f6);">
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report Output Section -->
                <div id="report-output" class="report-output glass-card hidden">
                    <div class="output-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--glass-border);">
                        <div>
                            <h3 style="color: var(--text-primary); margin: 0;" id="report-title">Report Output</h3>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;" id="report-subtitle">
                                Generated on ${new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-outline" id="download-report-btn">
                                📥 Download
                            </button>
                            <button class="btn-outline" id="print-report-btn">
                                🖨️ Print
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
                        
                        <!-- Export Options -->
                        <div id="report-options" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--glass-border);">
                            <h4 style="color: var(--text-primary); margin-bottom: 12px;">Export Options</h4>
                            <div class="export-formats-grid">
                                <button class="export-format-btn" data-format="pdf">
                                    <div class="icon">📄</div>
                                    <div class="label">PDF Document</div>
                                </button>
                                <button class="export-format-btn" data-format="excel">
                                    <div class="icon">📊</div>
                                    <div class="label">Excel Spreadsheet</div>
                                </button>
                                <button class="export-format-btn" data-format="csv">
                                    <div class="icon">📋</div>
                                    <div class="label">CSV Data</div>
                                </button>
                                <button class="export-format-btn" data-format="json">
                                    <div class="icon">🔧</div>
                                    <div class="label">JSON Data</div>
                                </button>
                            </div>
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

            <!-- Email Report Modal -->
            <div id="email-report-modal" class="popout-modal hidden">
                <div class="popout-modal-content">
                    <div class="popout-modal-header">
                        <h3 class="popout-modal-title">📧 Email Report</h3>
                        <button class="popout-modal-close" id="close-email-modal">&times;</button>
                    </div>
                    <div class="popout-modal-body">
                        <form id="email-report-form">
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Recipient Email *</label>
                                <input type="email" id="recipient-email" class="form-input" required placeholder="recipient@example.com">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Subject</label>
                                <input type="text" id="email-subject" class="form-input" placeholder="Farm Report - [Date]">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Message (Optional)</label>
                                <textarea id="email-message" class="form-input" rows="4" placeholder="Add a personal message..."></textarea>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label class="form-label">Format</label>
                                <select id="email-format" class="form-input">
                                    <option value="pdf">PDF Document</option>
                                    <option value="text">Plain Text</option>
                                    <option value="html">HTML Format</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="popout-modal-footer">
                        <button class="btn-outline" id="cancel-email">Cancel</button>
                        <button class="btn-primary" id="send-email">Send Email</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        console.log('Setting up report event listeners...');
        
        // Report generation buttons
        document.querySelector('.generate-financial-report')?.addEventListener('click', () => this.generateFinancialReport());
        document.querySelector('.generate-production-report')?.addEventListener('click', () => this.generateProductionReport());
        document.querySelector('.generate-inventory-report')?.addEventListener('click', () => this.generateInventoryReport());
        document.querySelector('.generate-sales-report')?.addEventListener('click', () => this.generateSalesReport());
        document.querySelector('.generate-health-report')?.addEventListener('click', () => this.generateHealthReport());
        document.querySelector('.generate-feed-report')?.addEventListener('click', () => this.generateFeedReport());
        document.querySelector('.generate-comprehensive-report')?.addEventListener('click', () => this.generateComprehensiveReport());
        
        // Report action buttons
        document.getElementById('download-report-btn')?.addEventListener('click', () => this.showDownloadOptions());
        document.getElementById('print-report-btn')?.addEventListener('click', () => this.printReport());
        document.getElementById('email-report-btn')?.addEventListener('click', () => this.showEmailModal());
        document.getElementById('close-report-btn')?.addEventListener('click', () => this.closeReport());
        
        // Export format buttons
        document.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.exportReport(format);
            });
        });
        
        // Email modal handlers
        document.getElementById('close-email-modal')?.addEventListener('click', () => this.hideEmailModal());
        document.getElementById('cancel-email')?.addEventListener('click', () => this.hideEmailModal());
        document.getElementById('send-email')?.addEventListener('click', () => this.sendEmailReport());
    },

    // ==================== QUICK STATS ====================
    renderQuickStats() {
        const stats = this.getFarmStats();
        
        return `
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Total Revenue</div>
                <div class="quick-stat-value" style="color: #22c55e;">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Net Profit</div>
                <div class="quick-stat-value" style="color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Total Birds</div>
                <div class="quick-stat-value">${stats.totalBirds}</div>
            </div>
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Production</div>
                <div class="quick-stat-value">${stats.totalProduction}</div>
            </div>
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Low Stock Items</div>
                <div class="quick-stat-value" style="color: ${stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e'};">${stats.lowStockItems}</div>
            </div>
            <div class="quick-stat">
                <div style="font-size: 14px; color: var(--text-secondary);">Feed Used</div>
                <div class="quick-stat-value">${stats.totalFeedUsed} kg</div>
            </div>
        `;
    },

    getFarmStats() {
        // Try to get shared stats from app data
        if (window.FarmModules?.appData?.profile?.dashboardStats) {
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

        // Fallback to localStorage data
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-current-stock') || '1000');

        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalRevenue - totalExpenses;
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock).length;
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);

        return {
            totalRevenue,
            netProfit,
            totalBirds: currentStock,
            totalProduction,
            lowStockItems,
            totalFeedUsed
        };
    },

    // ==================== RECENT ACTIVITY ====================
    renderRecentActivity() {
        const activities = this.getRecentActivities();

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
            <div>
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-content">
                            <div class="activity-icon">${activity.icon}</div>
                            <div class="activity-details">
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-date">${activity.date}</div>
                            </div>
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

        // Add transactions
        transactions.forEach(transaction => {
            activities.push({
                type: 'transaction',
                date: this.formatDate(transaction.date),
                description: `${transaction.type === 'income' ? '💰 Income' : '💸 Expense'}: ${transaction.description}`,
                amount: transaction.amount,
                icon: transaction.type === 'income' ? '💰' : '💸'
            });
        });

        // Add sales
        sales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: this.formatDate(sale.date),
                description: `📦 Sale: ${sale.items?.length || 0} items`,
                amount: sale.totalAmount,
                icon: '📦'
            });
        });

        // Add production
        production.forEach(record => {
            activities.push({
                type: 'production',
                date: this.formatDate(record.date),
                description: `🚜 Production: ${record.quantity} ${record.unit} of ${record.product}`,
                amount: null,
                icon: '🚜'
            });
        });

        // Add feed records
        feedRecords.forEach(record => {
            activities.push({
                type: 'feed',
                date: this.formatDate(record.date),
                description: `🌾 Feed: ${record.quantity}kg ${record.feedType}`,
                amount: record.cost,
                icon: '🌾'
            });
        });

        // Add mortality records
        mortalityRecords.forEach(record => {
            activities.push({
                type: 'mortality',
                date: this.formatDate(record.date),
                description: `😔 Mortality: ${record.quantity} birds`,
                amount: null,
                icon: '😔'
            });
        });

        // Sort by date (newest first) and return top 5
        return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    },

    // ==================== REPORT GENERATION ====================
    generateFinancialReport() {
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        const reportContent = `
            <div class="report-section">
                <h4>💰 Financial Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Income</span>
                    <span class="metric-value income">${this.formatCurrency(totalIncome)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(totalExpenses)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Profit Margin</span>
                    <span class="metric-value ${profitMargin >= 0 ? 'profit' : 'expense'}">${profitMargin.toFixed(1)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Income Sources</h4>
                ${this.getCategoryBreakdown(incomeTransactions, 'income')}
            </div>

            <div class="report-section">
                <h4>📉 Expense Categories</h4>
                ${this.getCategoryBreakdown(expenseTransactions, 'expense')}
            </div>

            <div class="report-section">
                <h4>💡 Financial Insights</h4>
                <div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; color: #166534;">
                        ${this.getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Financial Performance Report', reportContent);
    },

    generateProductionReport() {
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        
        const totalProduction = production.reduce((sum, record) => sum + record.quantity, 0);
        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        const mortalityRate = currentStock > 0 ? (totalMortality / currentStock) * 100 : 0;

        const reportContent = `
            <div class="report-section">
                <h4>🚜 Production Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Production</span>
                    <span class="metric-value">${totalProduction} units</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Current Stock</span>
                    <span class="metric-value">${currentStock} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Mortality</span>
                    <span class="metric-value">${totalMortality} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'expense' : 'profit'}">${mortalityRate.toFixed(2)}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>💡 Production Insights</h4>
                <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af;">
                        ${this.getProductionInsights(totalProduction, mortalityRate)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Production Analysis Report', reportContent);
    },

    generateInventoryReport() {
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        
        const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
        const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

        const reportContent = `
            <div class="report-section">
                <h4>📦 Inventory Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Items</span>
                    <span class="metric-value">${inventory.length + feedInventory.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Low Stock Items</span>
                    <span class="metric-value ${lowStockItems.length > 0 ? 'warning' : 'profit'}">${lowStockItems.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Inventory Value</span>
                    <span class="metric-value income">${this.formatCurrency(totalInventoryValue)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>⚠️ Low Stock Alerts</h4>
                ${lowStockItems.length > 0 ? lowStockItems.map(item => `
                    <div class="metric-row">
                        <span class="metric-label">${item.name}</span>
                        <span class="metric-value warning">${item.currentStock} / ${item.minStock}</span>
                    </div>
                `).join('') : '<p style="color: #22c55e;">✅ All items are sufficiently stocked</p>'}
            </div>
        `;

        this.showReport('Inventory Analysis Report', reportContent);
    },

       generateSalesReport() {
        const sales = JSON.parse(localStorage.getItem('farm-sales') || '[]');
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalTransactions = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const averageSaleValue = sales.length > 0 ? totalSales / sales.length : 0;

        const reportContent = `
            <div class="report-section">
                <h4>📊 Sales Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Sales</span>
                    <span class="metric-value">${sales.length}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Revenue</span>
                    <span class="metric-value income">${this.formatCurrency(totalSales)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Income (All Sources)</span>
                    <span class="metric-value income">${this.formatCurrency(totalTransactions)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Sale Value</span>
                    <span class="metric-value">${this.formatCurrency(averageSaleValue)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📈 Sales Trends</h4>
                <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;">
                        ${this.getSalesInsights(sales, totalSales, averageSaleValue)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Sales Performance Report', reportContent);
    },

    generateHealthReport() {
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');
        const medical = JSON.parse(localStorage.getItem('farm-medical-records') || '[]');
        const currentStock = parseInt(localStorage.getItem('farm-birds-stock') || '1000');
        
        const totalMortality = mortality.reduce((sum, record) => sum + record.quantity, 0);
        const totalMedicalCost = medical.reduce((sum, record) => sum + record.cost, 0);
        const mortalityRate = currentStock > 0 ? (totalMortality / currentStock) * 100 : 0;

        const reportContent = `
            <div class="report-section">
                <h4>🐔 Health Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Current Flock Size</span>
                    <span class="metric-value">${currentStock} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Mortality</span>
                    <span class="metric-value expense">${totalMortality} birds</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Mortality Rate</span>
                    <span class="metric-value ${mortalityRate > 5 ? 'expense' : 'profit'}">${mortalityRate.toFixed(2)}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Medical Expenses</span>
                    <span class="metric-value expense">${this.formatCurrency(totalMedicalCost)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>💊 Health Insights</h4>
                <div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; color: #991b1b;">
                        ${this.getHealthInsights(mortalityRate, totalMedicalCost)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Health & Mortality Report', reportContent);
    },

    generateFeedReport() {
        const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
        const feedInventory = JSON.parse(localStorage.getItem('farm-feed-inventory') || '[]');
        
        const totalFeedUsed = feedRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalFeedCost = feedRecords.reduce((sum, record) => sum + record.cost, 0);
        const currentFeedStock = feedInventory.reduce((sum, item) => sum + item.currentStock, 0);
        const avgFeedCostPerKg = totalFeedUsed > 0 ? totalFeedCost / totalFeedUsed : 0;

        const reportContent = `
            <div class="report-section">
                <h4>🌾 Feed Consumption Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Used</span>
                    <span class="metric-value">${totalFeedUsed.toFixed(2)} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Feed Cost</span>
                    <span class="metric-value expense">${this.formatCurrency(totalFeedCost)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Current Feed Stock</span>
                    <span class="metric-value">${currentFeedStock.toFixed(2)} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Average Cost per kg</span>
                    <span class="metric-value">${this.formatCurrency(avgFeedCostPerKg)}</span>
                </div>
            </div>

            <div class="report-section">
                <h4>📊 Feed Consumption Analysis</h4>
                <div style="padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #065f46;">
                        ${this.getFeedInsights(totalFeedUsed, totalFeedCost, avgFeedCostPerKg)}
                    </p>
                </div>
            </div>
        `;

        this.showReport('Feed Consumption Report', reportContent);
    },

    generateComprehensiveReport() {
        const stats = this.getFarmStats();
        const transactions = JSON.parse(localStorage.getItem('farm-transactions') || '[]');
        const inventory = JSON.parse(localStorage.getItem('farm-inventory') || '[]');
        const production = JSON.parse(localStorage.getItem('farm-production') || '[]');
        const mortality = JSON.parse(localStorage.getItem('farm-mortality-records') || '[]');

        const reportContent = `
            <div class="report-section">
                <h4>🏆 Farm Performance Overview</h4>
                <div class="metric-row">
                    <span class="metric-label">Total Revenue</span>
                    <span class="metric-value income">${this.formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Net Profit</span>
                    <span class="metric-value ${stats.netProfit >= 0 ? 'profit' : 'expense'}">${this.formatCurrency(stats.netProfit)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Birds</span>
                    <span class="metric-value">${stats.totalBirds}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Production</span>
                    <span class="metric-value">${stats.totalProduction} units</span>
                </div>
            </div>

            <div class="report-section">
                <h4>💰 Financial Health</h4>
                <div style="padding: 16px; background: #f0fdf4; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #166534;">
                        ${this.getFinancialSummary(transactions)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <h4>📦 Inventory Status</h4>
                <div style="padding: 16px; background: #eff6ff; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #1e40af;">
                        ${this.getInventorySummary(inventory)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <h4>🚜 Production Metrics</h4>
                <div style="padding: 16px; background: #fef3c7; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #92400e;">
                        ${this.getProductionSummary(production, mortality)}
                    </p>
                </div>
            </div>

            <div class="report-section">
                <h4>🎯 Recommendations</h4>
                <div style="padding: 16px; background: #fce7f3; border-radius: 8px; border-left: 4px solid #db2777;">
                    <ul style="margin: 0; color: #831843;">
                        ${this.getRecommendations(stats, inventory, mortality).map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        this.showReport('Comprehensive Farm Report', reportContent);
    },

    // ==================== HELPER METHODS ====================

    getCategoryBreakdown(transactions, type) {
        const categories = {};
        transactions.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });

        let html = '';
        Object.entries(categories).forEach(([category, amount]) => {
            const percentage = transactions.reduce((sum, t) => sum + t.amount, 0) > 0 
                ? (amount / transactions.reduce((sum, t) => sum + t.amount, 0)) * 100 
                : 0;
            
            html += `
                <div class="metric-row">
                    <span class="metric-label">${category}</span>
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="flex: 1; height: 8px; background: var(--glass-bg); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: ${type === 'income' ? '#22c55e' : '#ef4444'};"></div>
                        </div>
                        <span class="metric-value ${type === 'income' ? 'income' : 'expense'}">${this.formatCurrency(amount)} (${percentage.toFixed(1)}%)</span>
                    </div>
                </div>
            `;
        });
        
        return html || '<p>No data available</p>';
    },

    getFinancialInsights(totalIncome, totalExpenses, netProfit, profitMargin) {
        const insights = [];
        
        if (profitMargin > 20) {
            insights.push("Excellent profit margin! Your farm is highly profitable.");
        } else if (profitMargin > 10) {
            insights.push("Good profit margin. Consider optimizing expenses to increase profitability.");
        } else if (profitMargin > 0) {
            insights.push("Low profit margin. Review expenses and consider increasing prices.");
        } else {
            insights.push("⚠️ Negative profit margin! Urgent review of operations needed.");
        }

        const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
        if (expenseRatio > 80) {
            insights.push("High expense ratio. Focus on cost reduction strategies.");
        }

        return insights.join(' ');
    },

    getProductionInsights(totalProduction, mortalityRate) {
        const insights = [];
        
        if (mortalityRate > 10) {
            insights.push("⚠️ High mortality rate! Review flock health management.");
        } else if (mortalityRate > 5) {
            insights.push("Moderate mortality rate. Consider improving health protocols.");
        } else {
            insights.push("Good mortality rate. Continue current health practices.");
        }

        if (totalProduction > 1000) {
            insights.push("High production volume. Excellent productivity!");
        }

        return insights.join(' ');
    },

    getSalesInsights(sales, totalSales, averageSaleValue) {
        const insights = [];
        
        if (sales.length === 0) {
            return "No sales data available. Start recording sales to get insights.";
        }

        if (averageSaleValue > 500) {
            insights.push("High average sale value indicates premium pricing or bulk sales.");
        }

        if (sales.length < 10) {
            insights.push("Low number of sales. Consider expanding marketing efforts.");
        }

        return insights.join(' ');
    },

    getHealthInsights(mortalityRate, medicalCost) {
        const insights = [];
        
        if (mortalityRate > 10) {
            insights.push("⚠️ Critical mortality rate! Immediate veterinary consultation recommended.");
        } else if (mortalityRate > 5) {
            insights.push("Elevated mortality rate. Review biosecurity and health protocols.");
        }

        if (medicalCost > 1000) {
            insights.push("High medical expenses. Consider preventive healthcare measures.");
        }

        return insights.join(' ') || "Good health management. Mortality rate is within acceptable limits.";
    },

    getFeedInsights(totalFeedUsed, totalFeedCost, avgCostPerKg) {
        const insights = [];
        
        if (avgCostPerKg > 50) {
            insights.push("High feed cost per kg. Consider bulk purchasing or alternative suppliers.");
        } else if (avgCostPerKg < 30) {
            insights.push("Good feed cost efficiency.");
        }

        if (totalFeedUsed > 1000) {
            insights.push("High feed consumption indicates large flock size or high production.");
        }

        return insights.join(' ') || "Feed management is optimal.";
    },

    getFinancialSummary(transactions) {
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        return `
            Total Transactions: ${transactions.length}<br>
            Income Transactions: ${income.length}<br>
            Expense Transactions: ${expenses.length}<br>
            Largest Expense Category: ${this.getLargestCategory(expenses)}<br>
            Largest Income Category: ${this.getLargestCategory(income)}
        `;
    },

    getInventorySummary(inventory) {
        const lowStock = inventory.filter(item => item.currentStock <= item.minStock);
        
        return `
            Total Inventory Items: ${inventory.length}<br>
            Low Stock Items: ${lowStock.length}<br>
            Items Needing Reorder: ${lowStock.map(item => item.name).join(', ') || 'None'}<br>
            Total Inventory Value: ${this.formatCurrency(inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0))}
        `;
    },

    getProductionSummary(production, mortality) {
        const totalProduction = production.reduce((sum, p) => sum + p.quantity, 0);
        const totalMortality = mortality.reduce((sum, m) => sum + m.quantity, 0);
        
        return `
            Total Production: ${totalProduction} units<br>
            Total Mortality: ${totalMortality} birds<br>
            Average Daily Production: ${(totalProduction / (production.length || 1)).toFixed(1)} units<br>
            Production Records: ${production.length}
        `;
    },

    getRecommendations(stats, inventory, mortality) {
        const recommendations = [];
        
        if (stats.netProfit < 0) {
            recommendations.push("Focus on reducing expenses and increasing sales to achieve profitability");
        }
        
        if (stats.lowStockItems > 0) {
            recommendations.push("Reorder low-stock items to prevent production disruptions");
        }
        
        const mortalityRate = stats.totalBirds > 0 ? 
            (mortality.reduce((sum, m) => sum + m.quantity, 0) / stats.totalBirds) * 100 : 0;
        
        if (mortalityRate > 5) {
            recommendations.push("Improve health management to reduce mortality rate");
        }
        
        if (stats.totalFeedUsed > 1000) {
            recommendations.push("Consider feed efficiency improvements to reduce costs");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("All farm metrics are within optimal ranges. Continue current practices");
        }
        
        return recommendations;
    },

    getLargestCategory(transactions) {
        if (transactions.length === 0) return 'N/A';
        
        const categories = {};
        transactions.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        
        const largest = Object.entries(categories).reduce((max, [cat, amt]) => 
            amt > max.amount ? {category: cat, amount: amt} : max, 
            {category: '', amount: 0}
        );
        
        return largest.category || 'N/A';
    },

    // ==================== REPORT DISPLAY ====================

    showReport(title, content) {
        const reportOutput = document.getElementById('report-output');
        const reportTitle = document.getElementById('report-title');
        const reportSubtitle = document.getElementById('report-subtitle');
        const reportContent = document.getElementById('report-content');
        
        if (!reportOutput || !reportTitle || !reportSubtitle || !reportContent) return;
        
        reportTitle.textContent = title;
        reportSubtitle.textContent = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
        reportContent.innerHTML = content;
        
        reportOutput.classList.remove('hidden');
        reportOutput.scrollIntoView({ behavior: 'smooth' });
    },

    closeReport() {
        const reportOutput = document.getElementById('report-output');
        if (reportOutput) {
            reportOutput.classList.add('hidden');
        }
    },

    // ==================== EXPORT FUNCTIONS ====================

    showDownloadOptions() {
        alert('Download options would open here. In a real implementation, this would show a menu to choose format.');
    },

    printReport() {
        const printContent = document.getElementById('report-content')?.innerHTML;
        if (!printContent) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Farm Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .section { margin-bottom: 20px; }
                    .metric-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .income { color: green; }
                    .expense { color: red; }
                    .profit { color: green; }
                    .warning { color: orange; }
                </style>
            </head>
            <body>
                <h1>${document.getElementById('report-title')?.textContent || 'Farm Report'}</h1>
                <div>${document.getElementById('report-subtitle')?.textContent || ''}</div>
                <hr>
                <div>${printContent}</div>
                <script>
                    window.onload = () => window.print();
                </script>
            </body>
            </html>
        `);
    },

    showEmailModal() {
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    hideEmailModal() {
        const modal = document.getElementById('email-report-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    sendEmailReport() {
        const email = document.getElementById('recipient-email')?.value;
        const subject = document.getElementById('email-subject')?.value || 'Farm Report';
        
        if (!email) {
            alert('Please enter a recipient email');
            return;
        }
        
        alert(`Report would be sent to ${email} with subject: "${subject}"\n\nIn a real implementation, this would connect to a backend email service.`);
        this.hideEmailModal();
    },

    exportReport(format) {
        const reportTitle = document.getElementById('report-title')?.textContent || 'report';
        const reportContent = document.getElementById('report-content')?.innerHTML || '';
        
        let content, mimeType, filename;
        
        switch(format) {
            case 'pdf':
                alert('PDF export would generate a downloadable PDF file');
                filename = `${reportTitle.toLowerCase().replace(/ /g, '_')}.pdf`;
                break;
            case 'excel':
                content = this.generateExcelData();
                mimeType = 'application/vnd.ms-excel';
                filename = `${reportTitle.toLowerCase().replace(/ /g, '_')}.xlsx`;
                break;
            case 'csv':
                content = this.generateCSVData();
                mimeType = 'text/csv';
                filename = `${reportTitle.toLowerCase().replace(/ /g, '_')}.csv`;
                break;
            case 'json':
                content = this.generateJSONData();
                mimeType = 'application/json';
                filename = `${reportTitle.toLowerCase().replace(/ /g, '_')}.json`;
                break;
        }
        
        if (content && mimeType && filename) {
            this.downloadFile(content, mimeType, filename);
        }
    },

    generateExcelData() {
        const stats = this.getFarmStats();
        return `Revenue,Profit,Birds,Production,Low Stock,Feed Used
${stats.totalRevenue},${stats.netProfit},${stats.totalBirds},${stats.totalProduction},${stats.lowStockItems},${stats.totalFeedUsed}`;
    },

    generateCSVData() {
        return this.generateExcelData();
    },

    generateJSONData() {
        const stats = this.getFarmStats();
        return JSON.stringify({
            report: document.getElementById('report-title')?.textContent,
            generated: new Date().toISOString(),
            stats: stats
        }, null, 2);
    },

    downloadFile(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // ==================== UTILITY FUNCTIONS ====================

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // ==================== MODULE MANAGEMENT ====================

    refresh() {
        this.renderModule();
        console.log('Reports module refreshed');
    },

    cleanup() {
        console.log('Cleaning up Reports module...');
        // Clean up any event listeners or resources
    }
};

// Export module
window.FarmModules = window.FarmModules || {};
window.FarmModules.reports = ReportsModule;

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing Reports module...');
        ReportsModule.initialize();
    });
} else {
    console.log('DOM already loaded, initializing Reports module...');
    ReportsModule.initialize();
}
