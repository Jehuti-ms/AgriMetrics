// modules/reports.js - CORRECTED VERSION
console.log('📊 Loading reports module...');

const ReportsModule = {
    name: 'reports',
    initialized: false,
    element: null,
    currentReport: null,

    initialize() {
        console.log('📈 Initializing reports...');
        
        // Get content area element
        this.element = document.getElementById('content-area');
        if (!this.element) {
            console.error('Content area element not found');
            return false;
        }
        
        // Register with StyleManager for theme support
        if (window.StyleManager) {
            window.StyleManager.registerComponent(this.name);
        }
        
        this.renderModule();
        this.initialized = true;
        return true;
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
    },

    // ==================== CORE METHODS ====================
    renderQuickStats() {
        const stats = this.getFarmStats();
        
        return `
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${this.formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Net Profit</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.netProfit >= 0 ? '#22c55e' : '#ef4444'};">${this.formatCurrency(stats.netProfit)}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Total Birds</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalBirds}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Production</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalProduction}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Low Stock Items</div>
                <div style="font-size: 20px; font-weight: bold; color: ${stats.lowStockItems > 0 ? '#f59e0b' : '#22c55e'};">${stats.lowStockItems}</div>
            </div>
            <div style="text-align: center; padding: 16px; background: var(--glass-bg); border-radius: 8px;">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Feed Used</div>
                <div style="font-size: 20px; font-weight: bold; color: var(--text-primary);">${stats.totalFeedUsed} kg</div>
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
        if (sendEmailBtn) sendEmailBtn.addEventListener('click', () => this.sendEmailReport());

        // Format selection
        const formatOptions = document.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                formatOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    },

    // ==================== REPORT GENERATION METHODS ====================
generateFinancialReport() {
    console.log('💰 Generating financial report...');
    
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
        title: 'Financial Performance Report',
        content: content
    };
    
    this.showReport('Financial Performance Report', content);
},

generateProductionReport() {
    console.log('🚜 Generating production report...');
    
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
        title: 'Production Analysis Report',
        content: content
    };
    
    this.showReport('Production Analysis Report', content);
},

generateInventoryReport() {
    console.log('📦 Generating inventory report...');
    
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
        title: 'Inventory Status Report',
        content: content
    };
    
    this.showReport('Inventory Status Report', content);
},

generateSalesReport() {
    console.log('💰 Generating sales report...');
    
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
        title: 'Sales Performance Report',
        content: content
    };
    
    this.showReport('Sales Performance Report', content);
},

generateHealthReport() {
    console.log('🐔 Generating health report...');
    
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
        title: 'Health & Mortality Report',
        content: content
    };
    
    this.showReport('Health & Mortality Report', content);
},

generateFeedReport() {
    console.log('🌾 Generating feed report...');
    
    const feedRecords = JSON.parse(localStorage.getItem('farm-feed-records') || '[]');
    const totalFeedUsed = feedRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
    const totalFeedCost = feedRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
    
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
                    <p>2. ${totalFeedUsed / (totalBirds || 1000) > 0.1 ? 'Feed efficiency is within normal range' : 'Monitor feed consumption rates'}</p>
                    <p>3. Consider bulk purchasing for commonly used feed types</p>
                    <p>4. Track feed-to-weight conversion ratios for optimal results</p>
                </div>
            </div>
        </div>
    `;
    
    this.currentReport = {
        title: 'Feed Consumption Report',
        content: content
    };
    
    this.showReport('Feed Consumption Report', content);
},

generateComprehensiveReport() {
    console.log('🏆 Generating comprehensive report...');
    
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
        title: 'Farm Comprehensive Report',
        content: content
    };
    
    this.showReport('Farm Comprehensive Report', content);
},
    
   // ==================== EMAIL MODAL STYLES ====================
addEmailModalStyles() {
    const styleId = 'email-modal-styles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
        /* Email Modal Overlay - FIXED FOR CENTERING */
        .email-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center; /* Changed from flex-start to center */
            justify-content: center; /* Added to center horizontally */
            z-index: 9999;
            padding: 20px; /* Reduced padding */
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

        /* Email Modal Container - FIXED FOR CENTERING */
        .email-modal-container {
            width: 100%;
            max-width: 600px;
            max-height: 90vh; /* Changed from calc(100vh - 100px) to 90vh */
            overflow-y: auto;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out; /* Changed animation */
            margin: 0; /* Removed margin-top */
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

        /* Email Modal Header - Keep everything else the same */
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

        /* Responsive Design - ADJUSTED FOR CENTERING */
        @media (max-width: 768px) {
            .email-modal-overlay {
                padding: 16px; /* Reduced padding */
                align-items: center; /* Ensure centering on mobile */
            }

            .email-modal-container {
                max-height: 85vh; /* Adjusted for mobile */
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
                padding: 12px; /* Reduced padding */
            }

            .email-modal-container {
                border-radius: 20px;
                max-height: 90vh; /* Adjusted for very small screens */
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
                position: fixed;
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

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
            .email-modal-container {
                background: rgba(20, 20, 25, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .email-modal-header,
            .email-modal-body,
            .email-modal-footer {
                background: rgba(20, 20, 25, 0.95);
            }

            .form-input, .form-textarea, .format-card, .delivery-option {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.1);
            }

            .email-modal-close {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .footer-note {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(34, 197, 94, 0.15));
                border-color: rgba(59, 130, 246, 0.3);
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

    // ==================== EMAIL MODAL METHODS ====================
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
                    // Scroll to ensure input is visible on mobile
                    emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
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
                modal.classList.remove('hidden', 'hiding');
                document.getElementById('email-report-form')?.reset();
                
                // Reset format selection visuals
                const formatCards = document.querySelectorAll('.format-card');
                formatCards.forEach(card => {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                });
            }, 300);
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
        }
    },

    // ==================== REPORT DISPLAY METHODS ====================
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
        }
    },

    printReport() {
        if (!this.currentReport) return;
        
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
    },

    exportReport() {
        if (!this.currentReport) return;
        
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
    },

    // ==================== UTILITY METHODS ====================
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
console.log('📊 Reports module loaded successfully!');

// Register the module with FarmModules framework
if (window.FarmModules) {
    window.FarmModules.registerModule('reports', ReportsModule);
    console.log('✅ Reports module registered successfully!');
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
